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

// Tests the operator endpoints EP-REPORT-REPAIR, EP-REPORT-WASTE, EP-REPORT-RECYCLING,
// EP-NOTIFICATIONS-SENT, EP-NOTIFICATIONS-RECEIVED and EP-NOTIFICATION-RETRY through two applications on
// one memory transport: the recycler (BPNL00000000TCK3) and the data provider (BPNL00000000TCK1).
//
// Requirements of the registry that this file verifies:
//   SwR-CXCLIENT-111 (End of a recycled battery's passport made known to the provider)
//   SwR-CXCLIENT-178 (PassportEnded sent to the data provider, nameplate manufacturer and successor)
//   SwR-CXCLIENT-180 (BatteryRepaired sent to the data provider of the repaired battery's passport)
//   SwR-CXCLIENT-181 (BatteryBecameWaste sent to the data provider and the named successor)
//   SwR-CXCLIENT-183 (Sender's record of a receiver without an asset or a contract)
// Decisions D12 (No notification to the own company), D34 (The passport service provider as a receiver)
// [waits for the owner], D48 (The repair certificate before the notice) [waits for the owner] and D49
// (The retry of a failed transport) [waits for the owner].
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
const RECYCLER = "BPNL00000000TCK3";
const SUCCESSOR = "BPNL00000000TCK4";
const SERVICE_PROVIDER = "BPNL00000000TCK6";
const TODAY_INSTANT = "2026-06-15T09:00:00.000Z";
const LOWER_URN = /^urn:uuid:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
let provider;
let recycler;
let modelId;
let counter = 0;
const unique = (prefix) => `${prefix}-${process.pid}-${(counter += 1)}`;

function assertRefusal(answer, status, id) {
  assert.equal(answer.status, status, JSON.stringify(answer.body));
  assert.equal(answer.body.error.code, id);
}
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
  return answer.body.data.passport;
}
const sent = async (deployment) => (await deployment.call("GET", "/api/notifications/sent")).body.data.notifications;

before(async () => {
  provider = await startApplication("lifecycleEventRoutes_provider", PROVIDER, { PASSPORT_SERVICE_PROVIDER_BPNL: SERVICE_PROVIDER });
  recycler = await startApplication("lifecycleEventRoutes_recycler", RECYCLER);
  modelId = (await provider.call("POST", "/api/battery-models", { manufacturerPartId: unique("TCK-PART") })).body.data.model.id;
});
after(async () => {
  for (const deployment of [recycler, provider]) if (deployment) await deployment.stop();
});

test("SwR-CXCLIENT-180 (BatteryRepaired sent to the data provider of the repaired battery's passport): EP-REPORT-REPAIR and the refusal of D48 [waits for the owner]", async (t) => {
  const passport = await firstPassport();
  const certificate = randomUUID();
  const repair = { passportIdentifier: passport.passportIdentifier, dataProviderBpnl: PROVIDER, repairDate: TODAY_INSTANT, repairCertificateCatenaXId: certificate.toUpperCase() };
  await t.test("a repair whose certificate twin the own registry does not hold answers 409 ERR-LC-CERTIFICATE-NOT-REGISTERED and plans nothing", async () => {
    assertRefusal(await recycler.call("POST", "/api/lifecycle-events/repair", repair), 409, "ERR-LC-CERTIFICATE-NOT-REGISTERED");
    assert.deepStrictEqual(await sent(recycler), []);
  });
  await t.test("after the registration of the certificate twin the repair answers 202 with one pending BatteryRepaired, whose identifiers have the lower-case form with urn:uuid:", async () => {
    await recycler.twinRegistry.put({ id: `urn:uuid:${certificate}`, idShort: "repairCertificate", specificAssetIds: [], submodelDescriptors: [] });
    const answer = await recycler.call("POST", "/api/lifecycle-events/repair", repair);
    assert.equal(answer.status, 202, JSON.stringify(answer.body));
    assert.equal(answer.body.success, true);
    const [planned] = answer.body.data.notifications;
    assert.equal(planned.operation, "BatteryRepaired");
    assert.equal(planned.receiverBpnl, PROVIDER);
    assert.equal(planned.outcome, "pending");
    assert.match(planned.messageId, LOWER_URN);
    const [record] = (await sent(recycler)).filter((item) => item.id === planned.id);
    assert.match(record.message.header.messageId, LOWER_URN);
    assert.equal(record.message.content.repairCertificateCatenaXId, `urn:uuid:${certificate}`);
  });
  await t.test("the worker sends the notification, the data provider applies the repair and lists the received record", async () => {
    await recycler.worker.tick();
    const [record] = await sent(recycler);
    assert.equal(record.outcome, "sent");
    assert.equal(record.httpStatus, 200);
    assert.equal(record.receiverDid, "did:web:bpnl00000000tck1.memory.invalid");
    assert.equal(record.receiverConnectorUrl, "http://bpnl00000000tck1.memory.invalid");
    const received = (await provider.call("GET", "/api/notifications/received")).body.data.notifications;
    const match = received.find((item) => item.messageId === record.messageId);
    assert.equal(match.operation, "BatteryRepaired");
    assert.equal(match.outcome, "applied");
    assert.equal(match.senderBpnl, RECYCLER);
    assert.equal((await provider.call("GET", `/api/passports/${passport.id}`)).body.data.passport.lifecycleStatus, "re-used");
  });
});

test("SwR-CXCLIENT-181 and SwR-CXCLIENT-178: EP-REPORT-WASTE and EP-REPORT-RECYCLING plan the receivers of section 10.3", async (t) => {
  await t.test("a waste report plans BatteryBecameWaste for the data provider and the named successor", async () => {
    const answer = await recycler.call("POST", "/api/lifecycle-events/waste", { passportIdentifier: "TCK-PASSPORT-EXTERNAL", dataProviderBpnl: PROVIDER, successorBpnl: SUCCESSOR, successorRole: "producer", wasteDate: TODAY_INSTANT });
    assert.equal(answer.status, 202);
    assert.deepStrictEqual(answer.body.data.notifications.map((item) => [item.operation, item.receiverBpnl]), [
      ["BatteryBecameWaste", PROVIDER],
      ["BatteryBecameWaste", SUCCESSOR],
    ]);
  });
  await t.test("a recycling report without receivedFromSuccessorBpnl plans PassportEnded for the data provider and the nameplate manufacturer, 5 seconds after the record", async () => {
    const answer = await recycler.call("POST", "/api/lifecycle-events/recycling", { passportIdentifier: "TCK-PASSPORT-EXTERNAL", dataProviderBpnl: PROVIDER, nameplateManufacturerBpnl: "BPNL00000000TCK2", recyclingDate: TODAY_INSTANT });
    assert.equal(answer.status, 202);
    assert.deepStrictEqual(answer.body.data.notifications.map((item) => [item.receiverBpnl, item.notBefore]), [
      [PROVIDER, "2026-06-15T10:00:05.000Z"],
      ["BPNL00000000TCK2", "2026-06-15T10:00:05.000Z"],
    ]);
    const record = (await sent(recycler)).find((item) => item.id === answer.body.data.notifications[0].id);
    assert.deepStrictEqual(record.message.content, { passportIdentifier: "TCK-PASSPORT-EXTERNAL", recyclingDate: TODAY_INSTANT, recyclerBpnl: RECYCLER });
  });
  await t.test("a body that fails its schema answers 400 ERR-LC-BODY-INVALID, and a partner subject answers 403", async () => {
    assertRefusal(await recycler.call("POST", "/api/lifecycle-events/recycling", { passportIdentifier: "TCK-PASSPORT-EXTERNAL" }), 400, "ERR-LC-BODY-INVALID");
    assertRefusal(await recycler.asPartner(PROVIDER, "POST", "/api/lifecycle-events/waste", {}), 403, "ERR-AC-CAPABILITY-MISSING");
  });
});

test("SwR-CXCLIENT-111 (End of a recycled battery's passport made known to the provider): the local application of D12 and the notice of D34 [waits for the owner]", async (t) => {
  await t.test("the data provider's own reports apply the steps locally, plan no notification to the own company, and plan PassportEnded for the passport service provider", async () => {
    const passport = await firstPassport();
    const waste = await provider.call("POST", "/api/lifecycle-events/waste", { passportIdentifier: passport.passportIdentifier, dataProviderBpnl: PROVIDER, successorBpnl: SUCCESSOR, successorRole: "producer", wasteDate: TODAY_INSTANT });
    assert.deepStrictEqual(waste.body.data.notifications.map((item) => item.receiverBpnl), [SUCCESSOR]);
    assert.equal((await provider.call("GET", `/api/passports/${passport.id}`)).body.data.passport.lifecycleStatus, "waste");
    const recycling = await provider.call("POST", "/api/lifecycle-events/recycling", { passportIdentifier: passport.passportIdentifier, dataProviderBpnl: PROVIDER, nameplateManufacturerBpnl: PROVIDER, receivedFromSuccessorBpnl: SUCCESSOR, recyclingDate: TODAY_INSTANT });
    assert.deepStrictEqual(recycling.body.data.notifications.map((item) => [item.receiverBpnl, item.notBefore]), [
      [SUCCESSOR, "2026-06-15T10:00:05.000Z"],
      [SERVICE_PROVIDER, "2026-06-15T10:00:05.000Z"],
    ]);
    const ended = (await provider.call("GET", `/api/passports/${passport.id}`)).body.data.passport;
    assert.equal(ended.endOfPassport.recyclerBpnl, PROVIDER);
    const shell = await provider.twinRegistry.read(`urn:uuid:${passport.id}`);
    assert.deepStrictEqual(shell.submodelDescriptors.map((descriptor) => descriptor.idShort), ["batteryPassportLifecycle"]);
  });
  await t.test("the data provider's deployment plans PassportEnded for the passport service provider after a received PassportEnded as well", async () => {
    const passport = await firstPassport();
    await recycler.call("POST", "/api/lifecycle-events/recycling", { passportIdentifier: passport.passportIdentifier, dataProviderBpnl: PROVIDER, nameplateManufacturerBpnl: PROVIDER, recyclingDate: TODAY_INSTANT });
    current = new Date("2026-06-15T10:00:06.000Z");
    await recycler.worker.tick();
    const notice = (await sent(provider)).filter((item) => item.receiverBpnl === SERVICE_PROVIDER && item.passportIdentifier === passport.passportIdentifier);
    assert.equal(notice.length, 1);
    assert.equal(notice[0].notBefore, "2026-06-15T10:00:11.000Z");
    assert.equal(notice[0].message.header.senderBpn, PROVIDER);
  });
});

test("SwR-CXCLIENT-183 (Sender's record of a receiver without an asset or a contract) and D49 [waits for the owner]: EP-NOTIFICATION-RETRY", async (t) => {
  await t.test("a receiver without a connector ends as receiver_unresolved, and the retry sets the record back to pending", async () => {
    const certificate = randomUUID();
    await recycler.twinRegistry.put({ id: `urn:uuid:${certificate}`, idShort: "repairCertificate", specificAssetIds: [], submodelDescriptors: [] });
    await recycler.call("POST", "/api/lifecycle-events/repair", { passportIdentifier: "TCK-PASSPORT-X", dataProviderBpnl: SUCCESSOR, repairDate: TODAY_INSTANT, repairCertificateCatenaXId: certificate });
    await recycler.worker.tick();
    const record = (await sent(recycler)).find((item) => item.receiverBpnl === SUCCESSOR && item.operation === "BatteryRepaired");
    assert.equal(record.outcome, "receiver_unresolved");
    assert.equal(record.attempts, 1);
    const answer = await recycler.call("POST", `/api/notifications/sent/${record.id}/retry`);
    assert.equal(answer.status, 200, JSON.stringify(answer.body));
    assert.equal(answer.body.data.notification.outcome, "pending");
    assert.equal(answer.body.data.notification.attempts, 0);
    assert.equal(answer.body.data.notification.cause, null);
    assert.equal(answer.body.data.notification.notBefore, clock.now().toISOString());
    assert.equal(answer.body.data.notification.messageId, record.messageId);
  });
  await t.test("a record that was sent answers 409 ERR-LC-STATUS-NOT-ADMITTED, an unknown id 404 ERR-LC-RECORD-NOT-FOUND and a malformed id 400 ERR-LC-BODY-INVALID", async () => {
    const delivered = (await sent(recycler)).find((item) => item.outcome === "sent");
    assertRefusal(await recycler.call("POST", `/api/notifications/sent/${delivered.id}/retry`), 409, "ERR-LC-STATUS-NOT-ADMITTED");
    assertRefusal(await recycler.call("POST", "/api/notifications/sent/999999/retry"), 404, "ERR-LC-RECORD-NOT-FOUND");
    assertRefusal(await recycler.call("POST", "/api/notifications/sent/0/retry"), 400, "ERR-LC-BODY-INVALID");
    assertRefusal(await recycler.call("POST", "/api/notifications/sent/abc/retry"), 400, "ERR-LC-BODY-INVALID");
  });
  await t.test("the sent records are listed in the order of id, and a partner subject reads no list", async () => {
    const records = await sent(recycler);
    assert.deepStrictEqual(records.map((item) => item.id), [...records.map((item) => item.id)].sort((left, right) => left - right));
    assertRefusal(await recycler.asPartner(PROVIDER, "GET", "/api/notifications/sent"), 403, "ERR-AC-CAPABILITY-MISSING");
  });
});
