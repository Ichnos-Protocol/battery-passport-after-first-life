/********************************************************************************
 * Copyright (c) 2026 Ichnos Protocol Pte. Ltd.
 * Copyright (c) 2026 Contributors to the Eclipse Foundation
 *
 * See the NOTICE file(s) distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Apache License, Version 2.0 which is available at
 * https://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ********************************************************************************/

// Tests the worker of server/src/background/outboxWorker.mjs with an injected clock, on the application
// of the recycler (BPNL00000000TCK3).
//
// Requirements of the registry that this file verifies:
//   SwR-BGWORK-010 (Lifecycle notifications sent unchanged as JSON POST through the connector)
//   SwR-BGWORK-020 (End of a recycled battery's passport sent in time)
//   SyR-LIFE-127 (End of a recycled battery's passport made known to the provider)
// Measure VM-SWE-BGWORK-006 (Time-bound propagation jobs with a fixed clock). Decisions D1 (The delay of
// the end notice) and D22 (The outbox).
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { after, before, test } from "node:test";

import { signOperatorToken } from "../src/access/operatorToken.mjs";
import { createApp } from "../src/app.mjs";
import { loadConfig } from "../src/config.mjs";
import { createMemoryOfferStore } from "../src/connector/memoryOfferStore.mjs";
import { createMemoryReceiverResolver } from "../src/connector/memoryReceiverResolver.mjs";
import { createMemoryTransport } from "../src/connector/memoryTransport.mjs";
import { upsertOwnCompany } from "../src/dataset/companyRepository.mjs";
import { createLogger } from "../src/logger.mjs";
import { createMemoryTwinRegistry } from "../src/twins/memoryTwinRegistry.mjs";
import { appConnectionString, createTestDatabase } from "./support/database.mjs";
import { createOutboxWorker } from "../src/background/outboxWorker.mjs";
import { createNotificationSender } from "../src/connector/notificationSender.mjs";
import * as notificationRepository from "../src/connector/notificationRepository.mjs";

// The application of one participant on a migrated schema of its own (section 9.2.1).
const KEY = "data-plane-key-0123456789abcdefghijkl";
const SECRET = "operator-token-secret-0123456789abcdef";
const fixture = (name) => JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8"));
let current = new Date("2026-06-15T10:00:00.000Z");
const clock = { now: () => new Date(current.getTime()) };
const network = { participants: new Map(), offerStores: new Map(), didByBpnl: new Map(), connectorUrlByDid: new Map() };
const resolver = createMemoryReceiverResolver({ didByBpnl: network.didByBpnl, connectorUrlByDid: network.connectorUrlByDid });

async function request(base, method, path, body, headers = {}) {
  const raw = typeof body === "string" || Buffer.isBuffer(body);
  const init = { method, headers: { ...headers } };
  if (body !== undefined) {
    init.headers["content-type"] ??= "application/json";
    init.body = raw ? body : JSON.stringify(body);
  }
  const response = await fetch(`${base}${path}`, init);
  const text = await response.text();
  let parsed = null;
  try {
    parsed = text.length === 0 ? null : JSON.parse(text);
  } catch {
    parsed = text;
  }
  return { status: response.status, body: parsed };
}

async function startApplication(label, ownBpnl, variables = {}) {
  const db = await createTestDatabase(label);
  const config = loadConfig({
    OWN_BPNL: ownBpnl,
    OWN_LEGAL_NAME: `Example Company ${ownBpnl.slice(-4)}`,
    OWN_ADDRESS: JSON.stringify(fixture("nameplate.json").AddressInformation),
    DATABASE_URL: appConnectionString(),
    DATABASE_SCHEMA: db.schema,
    PUBLIC_BASE_URL: `http://${ownBpnl.toLowerCase()}.memory.invalid`,
    BINDING: "memory",
    OPERATOR_TOKEN_SECRET: SECRET,
    DATA_PLANE_KEY: KEY,
    ACCESS_REGIME: "after-act",
    LOG_LEVEL: "error",
    ...variables,
  });
  await upsertOwnCompany(db.appPool, config);
  const offerStore = createMemoryOfferStore();
  const twinRegistry = createMemoryTwinRegistry();
  const transport = createMemoryTransport({ participants: network.participants, offerStores: network.offerStores, ownBpnl });
  const lines = [];
  const logger = createLogger({ level: "error", stream: { write: (text) => lines.push(JSON.parse(text)) }, clock });
  const { app, worker } = createApp({ config, pool: db.appPool, clock, transport, offerStore, twinRegistry, receiverResolver: resolver, logger });
  await app.locals.context.offerPublisher.publishNotificationAsset();
  const did = `did:web:${ownBpnl.toLowerCase()}.memory.invalid`;
  network.participants.set(config.publicBaseUrl, { bpnl: ownBpnl, app, dataPlaneKey: KEY, dataPlaneKeyHeader: config.dataPlaneKeyHeader, partnerBpnHeader: config.partnerBpnHeader });
  network.offerStores.set(ownBpnl, offerStore);
  network.didByBpnl.set(ownBpnl, did);
  network.connectorUrlByDid.set(did, config.publicBaseUrl);
  const server = await new Promise((resolve) => {
    const listening = app.listen(0, "127.0.0.1", () => resolve(listening));
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  const token = () => signOperatorToken({ sub: "tck-operator", bpnl: ownBpnl, expiresInSeconds: 3600 }, { secret: SECRET, now: clock.now() });
  return {
    db,
    config,
    app,
    worker,
    offerStore,
    twinRegistry,
    lines,
    context: app.locals.context,
    call: (method, path, body, headers = {}) => request(base, method, path, body, { authorization: `Bearer ${token()}`, ...headers }),
    asPartner: (bpnl, method, path, body, headers = {}) => request(base, method, path, body, { "x-api-key": KEY, "edc-bpn": bpnl, ...headers }),
    raw: (method, path, body, headers) => request(base, method, path, body, headers),
    query: async (sql, parameters) => (await db.adminClient.query(sql, parameters)).rows,
    async stop() {
      await worker.stop();
      await transport.close();
      await new Promise((resolve) => {
        server.close(resolve);
        server.closeAllConnections();
      });
      await db.drop();
    },
  };
}


const PROVIDER = "BPNL00000000TCK1";
const RECYCLER = "BPNL00000000TCK3";
const START = new Date("2026-06-15T10:00:00.000Z").getTime();
let recycler;
const delivered = [];
const recordingTransport = {
  send: async (request) => {
    delivered.push(request);
    return { outcome: "sent", httpStatus: 200, body: null, cause: null };
  },
  pull: async () => ({ outcome: "transport_failed", agreementId: null, body: null, cause: "no provider" }),
};
const noPuller = { pullDue: async () => 0 };
const noAudit = { writeQueued: async () => 0 };
const silentLogger = { error() {}, warn() {}, info() {}, debug() {} };

before(async () => {
  recycler = await startApplication("outboxWorker", RECYCLER);
});
after(async () => {
  if (recycler) await recycler.stop();
});

test("SwR-BGWORK-020 (End of a recycled battery's passport sent in time): the delay of D1", async (t) => {
  const sender = createNotificationSender({ pool: recycler.db.appPool, repository: notificationRepository, transport: recordingTransport, receiverResolver: { resolve: async (bpnl) => ({ did: `did:web:${bpnl.toLowerCase()}.memory.invalid`, connectorUrl: `http://${bpnl.toLowerCase()}.memory.invalid` }) }, clock, maxAttempts: 5, retrySeconds: 60, ownBpnl: RECYCLER });
  const worker = createOutboxWorker({ sender, puller: noPuller, audit: noAudit, intervalMilliseconds: 10, logger: silentLogger });
  current = new Date(START);
  const answer = await recycler.call("POST", "/api/lifecycle-events/recycling", { passportIdentifier: "TCK-PASSPORT-A", dataProviderBpnl: PROVIDER, nameplateManufacturerBpnl: PROVIDER, recyclingDate: "2026-06-15T09:00:00.000Z" });
  const [planned] = answer.body.data.notifications;
  assert.equal(planned.notBefore, "2026-06-15T10:00:05.000Z");
  await t.test("a PassportEnded record is not sent 4 seconds after the record time", async () => {
    current = new Date(START + 4000);
    await worker.tick();
    assert.equal(delivered.length, 0);
    assert.equal((await recycler.query("SELECT outcome FROM notifications_sent WHERE id = $1", [planned.id]))[0].outcome, "pending");
  });
  await t.test("the record is sent 5 seconds after the record time, and the message that the transport receives equals the stored message", async () => {
    current = new Date(START + 5000);
    await worker.tick();
    assert.equal(delivered.length, 1);
    const [row] = await recycler.query("SELECT message, outcome, attempted_at FROM notifications_sent WHERE id = $1", [planned.id]);
    assert.deepStrictEqual(delivered[0].message, row.message);
    assert.equal(delivered[0].operation, "PassportEnded");
    assert.equal(delivered[0].receiverBpnl, PROVIDER);
    assert.equal(row.outcome, "sent");
    assert.deepStrictEqual(row.attempted_at, new Date(START + 5000));
  });
});

test("SwR-BGWORK-010 (Lifecycle notifications sent unchanged as JSON POST through the connector): the schedule of the worker", async (t) => {
  await t.test("a second tick() during a running tick() returns the same promise, and the run calls the sender and then the puller once", async () => {
    const order = [];
    let release;
    const sender = { sendDue: () => new Promise((resolve) => (order.push("send"), (release = resolve))) };
    const puller = { pullDue: async () => order.push("pull") };
    const worker = createOutboxWorker({ sender, puller, audit: { writeQueued: async () => order.push("audit") }, intervalMilliseconds: 10, logger: silentLogger });
    const first = worker.tick();
    const second = worker.tick();
    assert.equal(first, second);
    release();
    await first;
    assert.deepStrictEqual(order, ["send", "pull", "audit"]);
    const third = worker.tick();
    assert.notEqual(third, first, "a tick() after the end of the earlier run starts a new run");
    release();
    await third;
    assert.deepStrictEqual(order, ["send", "pull", "audit", "send", "pull", "audit"]);
  });
  await t.test("start() schedules the runs after the interval, stop() cancels the schedule and awaits the running tick()", async () => {
    let runs = 0;
    const worker = createOutboxWorker({ sender: { sendDue: async () => (runs += 1) }, puller: noPuller, audit: noAudit, intervalMilliseconds: 10, logger: silentLogger });
    worker.start();
    await new Promise((resolve) => setTimeout(resolve, 80));
    await worker.stop();
    const stopped = runs;
    assert.ok(stopped >= 2, `the worker ran ${stopped} times in 80 milliseconds`);
    await new Promise((resolve) => setTimeout(resolve, 40));
    assert.equal(runs, stopped, "no run after stop()");
  });
  for (const failing of ["sender", "puller", "audit"]) {
    await t.test(`tick() calls the sender, the puller and audit.writeQueued() in this order, and an error of the ${failing} is logged and does not stop the two other calls`, async () => {
      const logged = [];
      const order = [];
      const call = (name) => async () => {
        order.push(name);
        if (name === failing) throw new Error(`the ${name} failed`);
      };
      const worker = createOutboxWorker({
        sender: { sendDue: call("sender") },
        puller: { pullDue: call("puller") },
        audit: { writeQueued: call("audit") },
        intervalMilliseconds: 10,
        logger: { ...silentLogger, error: (message, fields) => logged.push({ message, fields }) },
      });
      await worker.tick();
      assert.deepStrictEqual(order, ["sender", "puller", "audit"]);
      assert.equal(logged.length, 1);
      assert.equal(logged[0].fields.error.message, `the ${failing} failed`);
    });
  }
});
