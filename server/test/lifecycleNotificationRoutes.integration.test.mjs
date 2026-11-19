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

// Tests the four receiving endpoints EP-RX-NEW-PASSPORT, EP-RX-REPAIRED, EP-RX-WASTE and EP-RX-ENDED
// through the application of createApp, under the role refserver_app, with HTTP requests.
//
// Requirements of the registry that this file verifies:
//   SwR-BACKEND-147 (Notification endpoints offered with HTTP POST only)
//   SwR-BACKEND-148 (Notification answered 200 when accepted, 4xx or 5xx otherwise)
//   SwR-BACKEND-206 (Lifecycle notification failures answered with envelope and result object)
//   SwR-BACKEND-207 (Four lifecycle notification operations received as POST endpoints)
//   SwR-DATASET-207 (Received notification applied only through its operation's step)
// Measure VM-SWE-BACKEND-040 (Catena-X receiving routes against their specifications). Lesson 12 of
// docs/lessons-from-a-first-implementation.md (the receiver changes its passport on the word of any
// sender): the fifth check. Section 10.4 of the implementation specification.
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
const SUCCESSOR = "BPNL00000000TCK4";
const TODAY_INSTANT = "2026-06-15T09:00:00.000Z";
let provider;
let modelId;
let counter = 0;
const unique = (prefix) => `${prefix}-${process.pid}-${(counter += 1)}`;

const CONTEXT = (operation) => `BatteryPass-BatteryPassLifecycleNotificationAPI-${operation}:1`;
function message(operation, content, { sender = RECYCLER, receiver = PROVIDER, messageId = randomUUID() } = {}) {
  return {
    header: { messageId, context: CONTEXT(operation), sentDateTime: "2026-06-15T09:30:00Z", senderBpn: sender, receiverBpn: receiver, version: "3.0.0" },
    content,
  };
}
const send = (operation, body, partner = RECYCLER, headers) => provider.asPartner(partner, "POST", `/api/lifecycle-notifications/${operation}`, body, headers);

async function firstPassport() {
  const answer = await provider.call("POST", "/api/passports", {
    batteryModelId: modelId,
    batteryIdentifier: unique("TCK-BATTERY"),
    batteryCategory: "ev",
    facilityBpns: "BPNS00000000TCK1",
    dateOfManufacture: "2026-01-10",
    originalPurpose: "Traction battery",
    passportIdentifier: unique("TCK-PASSPORT"),
  });
  assert.equal(answer.status, 201, JSON.stringify(answer.body));
  return answer.body.data.passport;
}
const passportRow = async (passportId) => (await provider.query("SELECT * FROM passports WHERE id = $1", [passportId]))[0];
function assertRefusal(answer, status, id) {
  assert.equal(answer.status, status, JSON.stringify(answer.body));
  assert.equal(answer.body.success, false);
  assert.equal(answer.body.error.code, id);
  assert.equal(answer.body.messages[0].messageType, "Error");
}

before(async () => {
  provider = await startApplication("lifecycleNotificationRoutes", PROVIDER);
  const model = await provider.call("POST", "/api/battery-models", { manufacturerPartId: unique("TCK-PART") });
  modelId = model.body.data.model.id;
});
after(async () => {
  if (provider) await provider.stop();
});

test("SwR-BACKEND-206 (Lifecycle notification failures answered with envelope and result object): the first five checks of section 10.4", async (t) => {
  const passport = await firstPassport();
  const valid = () => message("BatteryRepaired", { passportIdentifier: passport.passportIdentifier, repairDate: TODAY_INSTANT, repairCertificateCatenaXId: randomUUID() });
  await t.test("a validator error at the root of the body answers 400 ERR-RX-CONTENT-INVALID", async () => {
    assertRefusal(await send("BatteryRepaired", [1, 2]), 400, "ERR-RX-CONTENT-INVALID");
    const { content, ...withoutContent } = valid();
    assert.ok(content);
    assertRefusal(await send("BatteryRepaired", withoutContent), 400, "ERR-RX-CONTENT-INVALID");
    const { header, ...withoutHeader } = valid();
    assert.ok(header);
    assertRefusal(await send("BatteryRepaired", withoutHeader), 400, "ERR-RX-CONTENT-INVALID");
    assertRefusal(await send("BatteryRepaired", { ...valid(), third: true }), 400, "ERR-RX-CONTENT-INVALID");
  });
  await t.test("a validator error below /header answers 400 ERR-RX-HEADER-INVALID with one message per error", async () => {
    const body = valid();
    body.header.senderBpn = "BPNL0000000TCK3";
    delete body.header.version;
    const answer = await send("BatteryRepaired", body);
    assertRefusal(answer, 400, "ERR-RX-HEADER-INVALID");
    assert.ok(answer.body.messages.length >= 3, JSON.stringify(answer.body.messages));
  });
  await t.test("a validator error below /content answers 400 ERR-RX-CONTENT-INVALID, and only further properties answer 422 ERR-RX-CHANGE-OUTSIDE-STEP", async () => {
    const body = valid();
    delete body.content.repairDate;
    assertRefusal(await send("BatteryRepaired", body), 400, "ERR-RX-CONTENT-INVALID");
    const outside = valid();
    outside.content.lifecycleStatus = "waste";
    const answer = await send("BatteryRepaired", outside);
    assertRefusal(answer, 422, "ERR-RX-CHANGE-OUTSIDE-STEP");
    assert.ok(answer.body.messages[1].text.includes("lifecycleStatus"));
  });
  await t.test("the context of another operation answers 400 ERR-RX-CONTEXT-MISMATCH", async () => {
    const body = valid();
    body.header.context = CONTEXT("BatteryBecameWaste");
    assertRefusal(await send("BatteryRepaired", body), 400, "ERR-RX-CONTEXT-MISMATCH");
  });
  await t.test("a header that names another receiver answers 400 ERR-RX-RECEIVER-MISMATCH", async () => {
    const body = valid();
    body.header.receiverBpn = SECOND_LIFE;
    assertRefusal(await send("BatteryRepaired", body), 400, "ERR-RX-RECEIVER-MISMATCH");
  });
  await t.test("lesson 12: a sender of the header that differs from the presented participant answers 403 ERR-RX-SENDER-MISMATCH", async () => {
    assertRefusal(await send("BatteryRepaired", valid(), SECOND_LIFE), 403, "ERR-RX-SENDER-MISMATCH");
    assert.equal((await passportRow(passport.id)).lifecycle_status, "original");
  });
  await t.test("a request without the data plane key, with a wrong key or with an operator token answers 401 or 403", async () => {
    assertRefusal(await provider.raw("POST", "/api/lifecycle-notifications/BatteryRepaired", valid()), 401, "ERR-AC-UNAUTHENTICATED");
    assertRefusal(await provider.raw("POST", "/api/lifecycle-notifications/BatteryRepaired", valid(), { "x-api-key": `${KEY}x`, "edc-bpn": RECYCLER }), 401, "ERR-AC-UNAUTHENTICATED");
    assertRefusal(await provider.raw("POST", "/api/lifecycle-notifications/BatteryRepaired", valid(), { "x-api-key": KEY }), 401, "ERR-AC-UNAUTHENTICATED");
    assertRefusal(await provider.call("POST", "/api/lifecycle-notifications/BatteryRepaired", valid()), 403, "ERR-AC-CAPABILITY-MISSING");
  });
  await t.test("a body that is not JSON and a body of another content type answer 400 ERR-RX-CONTENT-INVALID, and a body above one megabyte answers 413", async () => {
    assertRefusal(await send("BatteryRepaired", '{"header": '), 400, "ERR-RX-CONTENT-INVALID");
    assertRefusal(await send("BatteryRepaired", JSON.stringify(valid()), RECYCLER, { "content-type": "text/plain" }), 400, "ERR-RX-CONTENT-INVALID");
    const large = valid();
    large.content.passportIdentifier = "x".repeat(1024 * 1024 + 10);
    assertRefusal(await send("BatteryRepaired", large), 413, "ERR-RX-BODY-TOO-LARGE");
  });
  await t.test("SwR-BACKEND-147: every other method on the path of a receiving endpoint answers 405 ERR-RX-METHOD-NOT-ALLOWED", async () => {
    for (const operation of ["NewPassportIssued", "BatteryRepaired", "BatteryBecameWaste", "PassportEnded"]) {
      for (const method of ["GET", "PUT", "DELETE", "PATCH"]) {
        const body = method === "PUT" || method === "PATCH" ? valid() : undefined;
        assertRefusal(await provider.asPartner(RECYCLER, method, `/api/lifecycle-notifications/${operation}`, body), 405, "ERR-RX-METHOD-NOT-ALLOWED");
      }
    }
  });
});

test("SwR-BACKEND-148 (Notification answered 200 when accepted, 4xx or 5xx otherwise): the steps of section 10.4 and their stored records", async (t) => {
  await t.test("EP-RX-NEW-PASSPORT: a known passport answers applied and changes no passport; an unknown passport answers 404 ERR-RX-PASSPORT-UNKNOWN", async () => {
    const passport = await firstPassport();
    const before = await passportRow(passport.id);
    const body = message("NewPassportIssued", { passportIdentifier: unique("TCK-NEW"), catenaXId: randomUUID(), operation: "repurposing", operationDate: "2026-03-01T08:00:00Z", predecessorPassportIdentifier: passport.passportIdentifier }, { sender: SECOND_LIFE });
    const answer = await send("NewPassportIssued", body, SECOND_LIFE);
    assert.equal(answer.status, 200);
    assert.deepStrictEqual(answer.body, { messageId: `urn:uuid:${body.header.messageId}`, outcome: "applied" });
    assert.deepStrictEqual(await passportRow(passport.id), before);
    const [record] = await provider.query("SELECT * FROM notifications_received WHERE message_id = $1", [`urn:uuid:${body.header.messageId}`]);
    assert.equal(record.outcome, "applied");
    assert.equal(record.passport_identifier, passport.passportIdentifier);
    const unknown = message("NewPassportIssued", { ...body.content, predecessorPassportIdentifier: unique("TCK-UNKNOWN") }, { sender: SECOND_LIFE });
    assertRefusal(await send("NewPassportIssued", unknown, SECOND_LIFE), 404, "ERR-RX-PASSPORT-UNKNOWN");
  });
  await t.test("EP-RX-REPAIRED: the repair entry and the status re-used; the waste passport answers 422 ERR-RX-STEP-REFUSED", async () => {
    const passport = await firstPassport();
    const certificate = randomUUID();
    const answer = await send("BatteryRepaired", message("BatteryRepaired", { passportIdentifier: passport.passportIdentifier, repairDate: TODAY_INSTANT, repairCertificateCatenaXId: certificate }));
    assert.equal(answer.body.outcome, "applied");
    assert.equal((await passportRow(passport.id)).lifecycle_status, "re-used");
    const [entry] = await provider.query("SELECT * FROM passport_repair_entries WHERE passport_id = $1", [passport.id]);
    assert.equal(entry.repair_certificate_catena_x_id, certificate);
    assert.equal(entry.repairer_bpnl, RECYCLER);
    await send("BatteryBecameWaste", message("BatteryBecameWaste", { passportIdentifier: passport.passportIdentifier, successorBpnl: SUCCESSOR, successorRole: "producer", date: TODAY_INSTANT }));
    assertRefusal(await send("BatteryRepaired", message("BatteryRepaired", { passportIdentifier: passport.passportIdentifier, repairDate: TODAY_INSTANT, repairCertificateCatenaXId: randomUUID() })), 422, "ERR-RX-STEP-REFUSED");
  });
  await t.test("EP-RX-WASTE: the waste status with the named successor, the refresh of the exposure, and the outcome recorded for a foreign passport", async () => {
    const passport = await firstPassport();
    const answer = await send("BatteryBecameWaste", message("BatteryBecameWaste", { passportIdentifier: passport.passportIdentifier, successorBpnl: SUCCESSOR, successorRole: "producerResponsibilityOrganisation", date: TODAY_INSTANT }));
    assert.equal(answer.body.outcome, "applied");
    const row = await passportRow(passport.id);
    assert.equal(row.lifecycle_status, "waste");
    assert.equal(row.waste_successor_bpnl, SUCCESSOR);
    const shell = await provider.twinRegistry.read(`urn:uuid:${passport.id}`);
    assert.deepStrictEqual(shell.submodelDescriptors.map((descriptor) => descriptor.idShort), ["batteryPassportLifecycle"]);
    const lifecycleOffer = (await provider.offerStore.list()).find((offer) => offer.assetId === `lifecycle-${passport.id}`);
    assert.deepStrictEqual(lifecycleOffer.allowedBpnls, [SUCCESSOR]);
    const foreign = await send("BatteryBecameWaste", message("BatteryBecameWaste", { passportIdentifier: unique("TCK-FOREIGN"), successorBpnl: SUCCESSOR, successorRole: "producer", date: TODAY_INSTANT }));
    assert.equal(foreign.body.outcome, "recorded");
  });
  await t.test("a BatteryBecameWaste whose date is before the start of the open interval answers 422 ERR-RX-STEP-REFUSED", async () => {
    const passport = await firstPassport();
    assertRefusal(await send("BatteryBecameWaste", message("BatteryBecameWaste", { passportIdentifier: passport.passportIdentifier, successorBpnl: SUCCESSOR, successorRole: "producer", date: "2026-01-09T12:00:00Z" })), 422, "ERR-RX-STEP-REFUSED");
    assert.equal((await passportRow(passport.id)).lifecycle_status, "original");
  });
  await t.test("D20: PassportEnded on a passport that is not waste ends the passport and leaves the status, withdraws the dataset offers and keeps the lifecycle offer", async () => {
    const passport = await firstPassport();
    await provider.call("PUT", `/api/passports/${passport.id}/aspects/product-condition`, fixture("productCondition.json"));
    assert.ok((await provider.offerStore.list()).some((offer) => offer.assetId === `product-condition-${passport.id}`));
    const answer = await send("PassportEnded", message("PassportEnded", { passportIdentifier: passport.passportIdentifier, recyclingDate: TODAY_INSTANT, recyclerBpnl: RECYCLER }));
    assert.equal(answer.body.outcome, "applied");
    const row = await passportRow(passport.id);
    assert.equal(row.lifecycle_status, "original");
    assert.equal(row.recycler_bpnl, RECYCLER);
    const assets = (await provider.offerStore.list()).map((offer) => offer.assetId).filter((assetId) => assetId.endsWith(passport.id));
    assert.deepStrictEqual(assets, [`lifecycle-${passport.id}`]);
    assertRefusal(await send("PassportEnded", message("PassportEnded", { passportIdentifier: passport.passportIdentifier, recyclingDate: TODAY_INSTANT, recyclerBpnl: RECYCLER })), 422, "ERR-RX-STEP-REFUSED");
  });
  await t.test("the outcome duplicate for a repeated message with a new sentDateTime and for the messageId in another admitted form, and ERR-RX-MESSAGE-ID-REUSED", async () => {
    const passport = await firstPassport();
    const body = message("BatteryRepaired", { passportIdentifier: passport.passportIdentifier, repairDate: TODAY_INSTANT, repairCertificateCatenaXId: randomUUID() });
    assert.equal((await send("BatteryRepaired", body)).body.outcome, "applied");
    const later = structuredClone(body);
    later.header.sentDateTime = "2026-06-15T09:45:00Z";
    assert.deepStrictEqual((await send("BatteryRepaired", later)).body, { messageId: `urn:uuid:${body.header.messageId}`, outcome: "duplicate" });
    const otherForm = structuredClone(body);
    otherForm.header.messageId = `urn:uuid:${body.header.messageId.toUpperCase()}`;
    otherForm.content.repairCertificateCatenaXId = body.content.repairCertificateCatenaXId.toUpperCase();
    assert.equal((await send("BatteryRepaired", otherForm)).body.outcome, "duplicate");
    const reused = structuredClone(body);
    reused.content.repairDate = "2026-06-14T09:00:00Z";
    assertRefusal(await send("BatteryRepaired", reused), 409, "ERR-RX-MESSAGE-ID-REUSED");
    assert.equal((await provider.query("SELECT 1 FROM passport_repair_entries WHERE passport_id = $1", [passport.id])).length, 1);
  });
  await t.test("two concurrent copies of one message apply one step", async () => {
    const passport = await firstPassport();
    const body = message("BatteryRepaired", { passportIdentifier: passport.passportIdentifier, repairDate: TODAY_INSTANT, repairCertificateCatenaXId: randomUUID() });
    const answers = await Promise.all([send("BatteryRepaired", body), send("BatteryRepaired", body)]);
    assert.deepStrictEqual(answers.map((answer) => answer.body.outcome).sort(), ["applied", "duplicate"]);
    assert.equal((await provider.query("SELECT 1 FROM passport_repair_entries WHERE passport_id = $1", [passport.id])).length, 1);
    assert.equal((await provider.query("SELECT 1 FROM notifications_received WHERE message_id = $1", [`urn:uuid:${body.header.messageId}`])).length, 1);
  });
  await t.test("decision D6: the acting Business Partner Number of the transaction is the own one, and the audit record names the partner", async () => {
    const passport = await firstPassport();
    await send("BatteryRepaired", message("BatteryRepaired", { passportIdentifier: passport.passportIdentifier, repairDate: TODAY_INSTANT, repairCertificateCatenaXId: randomUUID() }));
    assert.equal((await passportRow(passport.id)).lifecycle_status, "re-used", "the policies show the passport of the own company to the transaction of a partner request");
    const [decision] = await provider.query("SELECT * FROM passport_write_decisions WHERE passport_id = $1 AND action = 'notification.apply.BatteryRepaired'", [passport.id]);
    assert.equal(decision.requester_bpnl, RECYCLER);
    assert.equal(decision.requester_kind, "partner");
    assert.equal(decision.relied_on, "data-provider");
  });
});

test("version 10 of the specification: the receiving step after the code review of phases P4 and P5", async (t) => {
  const table = (name) => `${provider.db.adminClient.escapeIdentifier(provider.db.schema)}.${name}`;
  const decisionsOf = (passportId) => provider.query("SELECT * FROM passport_write_decisions WHERE passport_id = $1 ORDER BY id", [passportId]);
  const errorLines = () => provider.lines.filter((line) => line.level === "error").length;

  await t.test("finding R45-001 and R45-019: for each of the four operations, two concurrent copies of one message answer the sorted outcomes applied and duplicate", async () => {
    const contents = {
      NewPassportIssued: (passport) => ({ passportIdentifier: unique("TCK-NEW"), catenaXId: randomUUID(), operation: "repurposing", operationDate: TODAY_INSTANT, predecessorPassportIdentifier: passport.passportIdentifier }),
      BatteryRepaired: (passport) => ({ passportIdentifier: passport.passportIdentifier, repairDate: TODAY_INSTANT, repairCertificateCatenaXId: randomUUID() }),
      BatteryBecameWaste: (passport) => ({ passportIdentifier: passport.passportIdentifier, successorBpnl: SUCCESSOR, successorRole: "producer", date: TODAY_INSTANT }),
      PassportEnded: (passport) => ({ passportIdentifier: passport.passportIdentifier, recyclingDate: TODAY_INSTANT, recyclerBpnl: RECYCLER }),
    };
    for (const [operation, content] of Object.entries(contents)) {
      const passport = await firstPassport();
      const sender = operation === "NewPassportIssued" ? SECOND_LIFE : RECYCLER;
      const body = message(operation, content(passport), { sender });
      const answers = await Promise.all([send(operation, body, sender), send(operation, body, sender)]);
      assert.deepStrictEqual(
        answers.map((answer) => [answer.status, answer.body.outcome ?? answer.body.error?.code]).sort(),
        [
          [200, "applied"],
          [200, "duplicate"],
        ],
        operation,
      );
      assert.equal((await provider.query("SELECT 1 FROM notifications_received WHERE message_id = $1", [`urn:uuid:${body.header.messageId}`])).length, 1, operation);
    }
  });

  await t.test("decision D70: a PassportEnded whose recyclerBpnl differs from the sender answers 403 ERR-RX-SENDER-MISMATCH and stores nothing", async () => {
    const passport = await firstPassport();
    const body = message("PassportEnded", { passportIdentifier: passport.passportIdentifier, recyclingDate: TODAY_INSTANT, recyclerBpnl: SECOND_LIFE });
    assertRefusal(await send("PassportEnded", body), 403, "ERR-RX-SENDER-MISMATCH");
    assert.equal((await passportRow(passport.id)).recycling_date, null);
    assert.equal((await provider.query("SELECT 1 FROM notifications_received WHERE message_id = $1", [`urn:uuid:${body.header.messageId}`])).length, 0);
  });

  await t.test("finding R45-006: a refused BatteryRepaired on a waste passport stores one refused record of passport_write_decisions through runWrite", async () => {
    const passport = await firstPassport();
    await send("BatteryBecameWaste", message("BatteryBecameWaste", { passportIdentifier: passport.passportIdentifier, successorBpnl: SUCCESSOR, successorRole: "producer", date: TODAY_INSTANT }));
    assertRefusal(await send("BatteryRepaired", message("BatteryRepaired", { passportIdentifier: passport.passportIdentifier, repairDate: TODAY_INSTANT, repairCertificateCatenaXId: randomUUID() })), 422, "ERR-RX-STEP-REFUSED");
    const refused = (await decisionsOf(passport.id)).filter((row) => row.decision === "refused");
    assert.equal(refused.length, 1);
    assert.deepStrictEqual([refused[0].action, refused[0].refusal_id, refused[0].requester_bpnl, refused[0].requester_kind, refused[0].relied_on], ["notification.apply.BatteryRepaired", "ERR-RX-STEP-REFUSED", RECYCLER, "partner", null]);
  });

  await t.test("decision D69: with the privilege INSERT on passport_write_decisions revoked, a BatteryRepaired answers 200 applied, the resend answers duplicate, and after one run of the worker the audit table holds one record of the step", async () => {
    const passport = await firstPassport();
    const body = message("BatteryRepaired", { passportIdentifier: passport.passportIdentifier, repairDate: TODAY_INSTANT, repairCertificateCatenaXId: randomUUID() });
    await provider.db.adminClient.query(`REVOKE INSERT ON ${table("passport_write_decisions")} FROM refserver_app`);
    try {
      const first = await send("BatteryRepaired", body);
      assert.equal(first.status, 200, JSON.stringify(first.body));
      assert.equal(first.body.outcome, "applied");
      assert.equal((await send("BatteryRepaired", body)).body.outcome, "duplicate");
      assert.equal((await decisionsOf(passport.id)).filter((row) => row.action === "notification.apply.BatteryRepaired").length, 0);
    } finally {
      await provider.db.adminClient.query(`GRANT INSERT ON ${table("passport_write_decisions")} TO refserver_app`);
    }
    await provider.worker.tick();
    const records = (await decisionsOf(passport.id)).filter((row) => row.action === "notification.apply.BatteryRepaired");
    assert.deepStrictEqual(records.map((row) => [row.decision, row.requester_bpnl, row.relied_on]), [["granted", RECYCLER, "data-provider"]]);
  });

  await t.test("findings R45-007 and R45-011: a valid message as text/plain, with the charset latin1 and with an unknown Content-Encoding answers 400 ERR-RX-CONTENT-INVALID and writes no log line at the level error", async () => {
    const passport = await firstPassport();
    const body = message("BatteryRepaired", { passportIdentifier: passport.passportIdentifier, repairDate: TODAY_INSTANT, repairCertificateCatenaXId: randomUUID() });
    const before = errorLines();
    assertRefusal(await send("BatteryRepaired", JSON.stringify(body), RECYCLER, { "content-type": "text/plain" }), 400, "ERR-RX-CONTENT-INVALID");
    assertRefusal(await send("BatteryRepaired", JSON.stringify(body), RECYCLER, { "content-type": "application/json; charset=latin1" }), 400, "ERR-RX-CONTENT-INVALID");
    assertRefusal(await send("BatteryRepaired", JSON.stringify(body), RECYCLER, { "content-encoding": "x-unknown" }), 400, "ERR-RX-CONTENT-INVALID");
    assert.equal(errorLines(), before);
    assert.equal((await passportRow(passport.id)).lifecycle_status, "original");
  });

  await t.test("finding R45-012: a POST to /api/lifecycle-notifications/BatteryDisassembled answers 404 ERR-RX-OPERATION-UNKNOWN with the error body of D9", async () => {
    const answer = await provider.raw("POST", "/api/lifecycle-notifications/BatteryDisassembled", { header: {}, content: {} });
    assert.equal(answer.status, 404);
    assert.deepStrictEqual(answer.body.error, { message: answer.body.messages[0].text, code: "ERR-RX-OPERATION-UNKNOWN" });
    assert.equal(answer.body.success, false);
  });
});
