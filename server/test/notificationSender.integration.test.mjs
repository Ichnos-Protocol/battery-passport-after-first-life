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

// Tests the sender of server/src/connector/notificationSender.mjs through the application of the
// recycler (BPNL00000000TCK3) on one memory transport with two receivers: the data provider
// (BPNL00000000TCK1) and a second-life operator (BPNL00000000TCK2) whose notification asset admits the
// data provider only.
//
// Requirements of the registry that this file verifies:
//   SwR-CXCLIENT-183 (Sender's record of a receiver without an asset or a contract)
//   SwR-BGWORK-010 (Lifecycle notifications sent unchanged as JSON POST through the connector)
//   SyR-LIFE-152 (Receiver without a notification asset recorded by the sender)
// Decisions D8 (Idempotency by the message identifier), D11 (The receiver resolution behind a port) and
// D49 (The retry of a failed transport) [waits for the owner].
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
import { createNotificationSender } from "../src/connector/notificationSender.mjs";
import * as notificationRepository from "../src/connector/notificationRepository.mjs";
import express from "express";
import { buildNotificationAssetOffer } from "../src/connector/policyBuilder.mjs";

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
const SECOND_LIFE = "BPNL00000000TCK2";
const RECYCLER = "BPNL00000000TCK3";
const UNREACHABLE = "BPNL00000000TCK4";
const UNRESOLVED = "BPNL00000000TCK6";
const START = "2026-06-15T10:00:00.000Z";
const TODAY_INSTANT = "2026-06-15T09:00:00.000Z";
let recycler;
let provider;
let secondLife;

const sent = async () => (await recycler.call("GET", "/api/notifications/sent")).body.data.notifications;
const at = (seconds) => {
  current = new Date(new Date(START).getTime() + seconds * 1000);
};
async function report(path, body) {
  const answer = await recycler.call("POST", `/api/lifecycle-events/${path}`, body);
  assert.equal(answer.status, 202, JSON.stringify(answer.body));
  return answer.body.data.notifications;
}
async function repair(dataProviderBpnl) {
  const certificate = randomUUID();
  await recycler.twinRegistry.put({ id: `urn:uuid:${certificate}`, idShort: "repairCertificate", specificAssetIds: [], submodelDescriptors: [] });
  return report("repair", { passportIdentifier: "TCK-PASSPORT-UNKNOWN", dataProviderBpnl, repairDate: TODAY_INSTANT, repairCertificateCatenaXId: certificate });
}
const waste = (dataProviderBpnl, successorBpnl) => report("waste", { passportIdentifier: "TCK-PASSPORT-W", dataProviderBpnl, successorBpnl, successorRole: "producer", wasteDate: TODAY_INSTANT });

before(async () => {
  recycler = await startApplication("notificationSender_recycler", RECYCLER, { NOTIFICATION_MAX_ATTEMPTS: "3", NOTIFICATION_RETRY_SECONDS: "10" });
  provider = await startApplication("notificationSender_provider", PROVIDER);
  secondLife = await startApplication("notificationSender_second", SECOND_LIFE, { NOTIFICATION_ALLOWED_BPNLS: JSON.stringify([PROVIDER]) });
  await secondLife.context.offerPublisher.publishNotificationAsset();
  network.didByBpnl.set(UNREACHABLE, "did:web:unreachable.memory.invalid");
  network.connectorUrlByDid.set("did:web:unreachable.memory.invalid", "http://unreachable.memory.invalid");
});
after(async () => {
  for (const deployment of [secondLife, provider, recycler]) if (deployment) await deployment.stop();
});

test("SwR-CXCLIENT-183 (Sender's record of a receiver without an asset or a contract): each of the six outcomes is stored with its cause, its resolved identifier and its connector address", async (t) => {
  at(0);
  const [refused] = await repair(PROVIDER);
  const [delivered, unresolved] = await waste(PROVIDER, UNRESOLVED);
  const [contract, failing] = await waste(SECOND_LIFE, UNREACHABLE);
  await recycler.worker.tick();
  await secondLife.offerStore.withdraw("asset-lifecycle-notification-1.0");
  const [missing] = await repair(SECOND_LIFE);
  await recycler.worker.tick();
  const records = new Map((await sent()).map((record) => [record.id, record]));
  const providerDid = "did:web:bpnl00000000tck1.memory.invalid";
  const secondDid = "did:web:bpnl00000000tck2.memory.invalid";
  await t.test("sent: the receiver answered 200", () => {
    const record = records.get(delivered.id);
    assert.deepStrictEqual([record.outcome, record.httpStatus, record.cause, record.attempts, record.receiverDid, record.receiverConnectorUrl], ["sent", 200, null, 1, providerDid, "http://bpnl00000000tck1.memory.invalid"]);
    assert.equal(record.attemptedAt, START);
  });
  await t.test("receiver_refused: the receiver answered 404 with ERR-RX-PASSPORT-UNKNOWN", () => {
    const record = records.get(refused.id);
    assert.deepStrictEqual([record.outcome, record.httpStatus, record.cause, record.receiverDid], ["receiver_refused", 404, "ERR-RX-PASSPORT-UNKNOWN", providerDid]);
  });
  await t.test("receiver_unresolved: the receiver resolver found no DID", () => {
    const record = records.get(unresolved.id);
    assert.deepStrictEqual([record.outcome, record.httpStatus, record.receiverDid, record.receiverConnectorUrl, record.attempts], ["receiver_unresolved", null, null, null, 1]);
    assert.ok(record.cause.includes(UNRESOLVED));
  });
  for (const [label, item, outcome] of [
    ["contract_refused: the notification asset admits the data provider only", contract, "contract_refused"],
    ["no_asset: the receiver offers no notification asset", missing, "no_asset"],
  ]) {
    await t.test(`${label}, and the record holds the receiver, the operation, the passport identifier and the date of the attempt`, () => {
      const record = records.get(item.id);
      assert.equal(record.outcome, outcome);
      assert.equal(record.receiverBpnl, SECOND_LIFE);
      assert.equal(record.operation, item.operation);
      assert.equal(record.passportIdentifier, item.passportIdentifier);
      assert.equal(record.attemptedAt, START);
      assert.equal(record.receiverDid, secondDid);
      assert.equal(record.receiverConnectorUrl, "http://bpnl00000000tck2.memory.invalid");
      assert.equal(typeof record.cause, "string");
    });
  }
  await t.test("D49 [waits for the owner]: transport_failed below the last attempt stays pending with the pause of 10 seconds multiplied by the attempt count", async () => {
    const record = records.get(failing.id);
    assert.deepStrictEqual([record.outcome, record.attempts, record.receiverConnectorUrl], ["pending", 1, "http://unreachable.memory.invalid"]);
    assert.equal(record.notBefore, "2026-06-15T10:00:10.000Z");
    assert.equal(typeof record.cause, "string");
    at(9);
    await recycler.worker.tick();
    assert.equal((await sent()).find((item) => item.id === failing.id).attempts, 1, "the row is not due 9 seconds after the attempt");
    at(10);
    await recycler.worker.tick();
    const second = (await sent()).find((item) => item.id === failing.id);
    assert.deepStrictEqual([second.outcome, second.attempts, second.notBefore], ["pending", 2, "2026-06-15T10:00:30.000Z"]);
    at(30);
    await recycler.worker.tick();
    const last = (await sent()).find((item) => item.id === failing.id);
    assert.deepStrictEqual([last.outcome, last.attempts], ["transport_failed", 3]);
    assert.equal(last.messageId, failing.messageId);
  });
});

test("SwR-BGWORK-010 (Lifecycle notifications sent unchanged as JSON POST through the connector): the repetition and the row lock of the sender", async (t) => {
  const options = { pool: recycler.db.appPool, repository: notificationRepository, clock, ownBpnl: RECYCLER, logger: { error() {}, warn() {}, info() {}, debug() {} } };
  await t.test("a failed transport is sent again with the same messageId and the same message after the pause, and ends as transport_failed at the last attempt", async () => {
    at(100);
    const planned = await waste(UNREACHABLE, UNREACHABLE);
    const calls = [];
    const failingTransport = { send: async (request) => (calls.push(request), { outcome: "transport_failed", httpStatus: null, body: null, cause: "no answer" }), pull: async () => ({ outcome: "transport_failed" }) };
    const sender = createNotificationSender({ ...options, transport: failingTransport, receiverResolver: resolver, maxAttempts: 2, retrySeconds: 7 });
    await sender.sendDue();
    at(106);
    await sender.sendDue();
    assert.equal(calls.length, 1, "the row is not due before the pause of 7 seconds");
    at(107);
    await sender.sendDue();
    assert.equal(calls.length, 2);
    assert.deepStrictEqual(calls[0].message, calls[1].message);
    assert.equal(calls[0].message.header.messageId, planned[0].messageId);
    const [stored] = await recycler.query("SELECT message FROM notifications_sent WHERE id = $1", [planned[0].id]);
    assert.deepStrictEqual(calls[0].message, stored.message, "the transport receives the stored message unchanged");
    const record = (await sent()).find((item) => item.id === planned[0].id);
    assert.deepStrictEqual([record.outcome, record.attempts], ["transport_failed", 2]);
  });
  await t.test("two concurrent calls of sendDue send one row once", async () => {
    at(200);
    const planned = await waste(PROVIDER, UNREACHABLE);
    const counts = new Map();
    const slowTransport = {
      send: async (request) => {
        counts.set(request.message.header.messageId, (counts.get(request.message.header.messageId) ?? 0) + 1);
        await new Promise((resolve) => setTimeout(resolve, 50));
        return { outcome: "sent", httpStatus: 200, body: null, cause: null };
      },
      pull: async () => ({ outcome: "transport_failed" }),
    };
    const first = createNotificationSender({ ...options, transport: slowTransport, receiverResolver: resolver, maxAttempts: 5, retrySeconds: 60 });
    const second = createNotificationSender({ ...options, transport: slowTransport, receiverResolver: resolver, maxAttempts: 5, retrySeconds: 60 });
    await Promise.all([first.sendDue(), second.sendDue()]);
    for (const item of planned) assert.equal(counts.get(item.messageId), 1, item.receiverBpnl);
    for (const item of planned) assert.equal((await sent()).find((record) => record.id === item.id).outcome, "sent");
  });
});

// A receiver of the memory network whose answer the test chooses: a status and an error code.
const FAILING = "BPNL00000000TCK5";
const answerOf = { status: 500, code: "ERR-RX-INTERNAL" };
const failingReceiver = express();
failingReceiver.use((req, res) => res.status(answerOf.status).json({ success: false, error: { code: answerOf.code, message: "refused" }, messages: [{ messageType: "Error", text: "refused" }] }));

test("version 10 of the specification: the status classes, the thrown errors, the text of a receiver and a failed write of an attempt", async (t) => {
  const failingStore = createMemoryOfferStore();
  await failingStore.publish(buildNotificationAssetOffer({ allowedBpnls: null }));
  network.participants.set("http://failing.memory.invalid", { bpnl: FAILING, app: failingReceiver, dataPlaneKey: KEY, dataPlaneKeyHeader: "x-api-key", partnerBpnHeader: "edc-bpn" });
  network.offerStores.set(FAILING, failingStore);
  network.didByBpnl.set(FAILING, "did:web:failing.memory.invalid");
  network.connectorUrlByDid.set("did:web:failing.memory.invalid", "http://failing.memory.invalid");
  const recordOf = async (id) => (await sent()).find((item) => item.id === id);
  const table = `${recycler.db.adminClient.escapeIdentifier(recycler.db.schema)}.notifications_sent`;
  const silent = { error() {}, warn() {}, info() {}, debug() {} };

  await t.test("finding R45-003: a receiver that answers 500 gives the outcome pending with attempts 1 and the status stored, and the outcome transport_failed at the limit", async () => {
    at(1000);
    Object.assign(answerOf, { status: 500, code: "ERR-RX-INTERNAL" });
    const [planned] = await waste(FAILING, FAILING);
    await recycler.worker.tick();
    const first = await recordOf(planned.id);
    assert.deepStrictEqual([first.outcome, first.attempts, first.httpStatus, first.cause], ["pending", 1, 500, "ERR-RX-INTERNAL"]);
    assert.equal(first.notBefore, new Date(new Date(START).getTime() + 1010 * 1000).toISOString());
    at(1010);
    await recycler.worker.tick();
    at(1030);
    await recycler.worker.tick();
    const last = await recordOf(planned.id);
    assert.deepStrictEqual([last.outcome, last.attempts, last.httpStatus], ["transport_failed", 3, 500]);
  });
  await t.test("finding R45-003: a receiver that answers 404 gives the final outcome receiver_refused, which EP-NOTIFICATION-RETRY refuses with ERR-LC-STATUS-NOT-ADMITTED", async () => {
    at(2000);
    Object.assign(answerOf, { status: 404, code: "ERR-RX-PASSPORT-UNKNOWN" });
    const [planned] = await waste(FAILING, FAILING);
    await recycler.worker.tick();
    const record = await recordOf(planned.id);
    assert.deepStrictEqual([record.outcome, record.attempts, record.httpStatus, record.cause], ["receiver_refused", 1, 404, "ERR-RX-PASSPORT-UNKNOWN"]);
    const answer = await recycler.call("POST", `/api/notifications/sent/${planned.id}/retry`);
    assert.equal(answer.status, 409);
    assert.equal(answer.body.error.code, "ERR-LC-STATUS-NOT-ADMITTED");
  });
  await t.test("V10-7: a receiver resolver and a transport that throw give transport_failed with the fixed causes and no text of the caught error", async () => {
    at(3000);
    const [planned] = await waste(UNREACHABLE, UNREACHABLE);
    const throwingResolver = createNotificationSender({
      pool: recycler.db.appPool,
      repository: notificationRepository,
      clock,
      ownBpnl: RECYCLER,
      logger: silent,
      transport: { send: async () => assert.fail("no send after a failed resolution") },
      receiverResolver: { resolve: async () => Promise.reject(new Error("resolver secret")) },
      maxAttempts: 2,
      retrySeconds: 1,
    });
    await throwingResolver.sendDue();
    const first = await recordOf(planned.id);
    assert.deepStrictEqual([first.outcome, first.attempts, first.cause], ["pending", 1, "receiver resolution failed"]);
    at(3001);
    const throwingTransport = createNotificationSender({
      pool: recycler.db.appPool,
      repository: notificationRepository,
      clock,
      ownBpnl: RECYCLER,
      logger: silent,
      transport: { send: async () => Promise.reject(new Error("transport secret")) },
      receiverResolver: resolver,
      maxAttempts: 2,
      retrySeconds: 1,
    });
    await throwingTransport.sendDue();
    const last = await recordOf(planned.id);
    assert.deepStrictEqual([last.outcome, last.attempts, last.cause], ["transport_failed", 2, "transport failed"]);
  });
  await t.test("finding R45-002: an error code with the character U+0000 and 600 further characters gives a stored cause without the character and of 500 characters, and the row of another receiver is sent in the same call", async () => {
    at(4000);
    Object.assign(answerOf, { status: 422, code: `bad\u0000${"x".repeat(600)}` });
    const planned = await waste(FAILING, PROVIDER);
    const failingRow = planned.find((item) => item.receiverBpnl === FAILING);
    const providerRow = planned.find((item) => item.receiverBpnl === PROVIDER);
    await recycler.worker.tick();
    const failing = await recordOf(failingRow.id);
    assert.deepStrictEqual([failing.outcome, failing.attempts, failing.httpStatus], ["receiver_refused", 1, 422]);
    assert.equal(failing.cause.length, 500);
    assert.equal(failing.cause.includes("\u0000"), false);
    assert.ok(failing.cause.startsWith("badxxx"));
    assert.equal((await recordOf(providerRow.id)).outcome, "sent");
  });
  await t.test("finding R45-002: a failed write of the attempt stores attempts 1 and the cause of the second transaction, and the later runs respect the limit of D49", async () => {
    at(5000);
    Object.assign(answerOf, { status: 500, code: "ERR-RX-INTERNAL" });
    const [planned] = await waste(FAILING, FAILING);
    // The first write of the attempt sets receiver_did and fails without the privilege; the second
    // write sets only the outcome, the cause, the attempt count and the next attempt.
    await recycler.db.adminClient.query(`REVOKE UPDATE (receiver_did) ON ${table} FROM refserver_app`);
    try {
      await recycler.worker.tick();
    } finally {
      await recycler.db.adminClient.query(`GRANT UPDATE (receiver_did) ON ${table} TO refserver_app`);
    }
    const first = await recordOf(planned.id);
    assert.deepStrictEqual([first.outcome, first.attempts, first.cause, first.receiverDid], ["pending", 1, "the attempt record failed: sqlstate 42501", null]);
    assert.ok(recycler.lines.some((line) => line.level === "error" && line.message === "The record of a notification attempt failed."));
    at(5010);
    await recycler.worker.tick();
    at(5030);
    await recycler.worker.tick();
    at(6000);
    await recycler.worker.tick();
    const last = await recordOf(planned.id);
    assert.deepStrictEqual([last.outcome, last.attempts], ["transport_failed", 3]);
  });
});
