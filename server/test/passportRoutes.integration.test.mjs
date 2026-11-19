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

// Tests the operator endpoints EP-MODEL-CREATE, EP-MODEL-TWIN, EP-PASSPORT-CREATE, EP-ASPECT-PUT,
// EP-ISSUE-NEW-PASSPORT, EP-TWIN, EP-FORWARD-LINK, EP-SUCCESSOR-AUTHORISATION and EP-PASSPORT-READ
// through two applications: the data provider (BPNL00000000TCK1) and the second-life operator
// (BPNL00000000TCK2).
//
// Requirements of the registry that this file verifies:
//   SwR-ACCESS-088 (Passport dataset writes only by the responsible or authorised operator)
//   SwR-DATASET-200 (Passport rows written only in the data provider's deployment)
//   SwR-DATASET-197 (Forward link added on the original data provider's request)
// Measures VM-SWE-ACCESS-022 (Access decisions on the passport dataset and its records) and
// VM-SWE-DATASET-016 (Write and read decisions on dataset information through the real chain). Decisions
// D6 (One deployment, one company, one writer) and D23 (The exposure after the commit).
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
const ORIGINAL_PURPOSE = "Traction battery";
let provider;
let operator;
let providerModel;
let operatorModel;
let counter = 0;
const unique = (prefix) => `${prefix}-${process.pid}-${(counter += 1)}`;

function assertRefusal(answer, status, id) {
  assert.equal(answer.status, status, JSON.stringify(answer.body));
  assert.equal(answer.body.success, false);
  assert.equal(answer.body.error.code, id);
}
function passportBody(modelId, overrides = {}) {
  return { batteryModelId: modelId, batteryIdentifier: unique("TCK-BATTERY"), batteryCategory: "ev", facilityBpns: "BPNS00000000TCK1", dateOfManufacture: "2026-01-10", originalPurpose: ORIGINAL_PURPOSE, passportIdentifier: unique("TCK-PASSPORT"), ...overrides };
}

before(async () => {
  provider = await startApplication("passportRoutes_provider", PROVIDER);
  operator = await startApplication("passportRoutes_operator", SECOND_LIFE);
});
after(async () => {
  for (const deployment of [operator, provider]) if (deployment) await deployment.stop();
});

test("SwR-ACCESS-088 (Passport dataset writes only by the responsible or authorised operator): the battery model endpoints", async (t) => {
  await t.test("EP-MODEL-CREATE answers 201 with the model and the field exposure, and registers the PartType shell", async () => {
    const answer = await provider.call("POST", "/api/battery-models", { manufacturerPartId: unique("TCK-PART") });
    assert.equal(answer.status, 201, JSON.stringify(answer.body));
    assert.equal(answer.body.success, true);
    providerModel = answer.body.data.model;
    assert.deepStrictEqual(answer.body.data.exposure, { refreshed: true });
    assert.equal(providerModel.manufacturerBpnl, PROVIDER);
    assert.equal((await provider.twinRegistry.read(`urn:uuid:${providerModel.id}`)).idShort, "batteryModel");
    const original = await operator.call("POST", "/api/battery-models", { manufacturerPartId: unique("TCK-PART"), originalModel: { catenaXId: providerModel.id.toUpperCase(), manufacturerBpnl: PROVIDER } });
    operatorModel = original.body.data.model;
    assert.deepStrictEqual(operatorModel.originalModel, { catenaXId: `urn:uuid:${providerModel.id}`, manufacturerBpnl: PROVIDER });
  });
  await t.test("EP-MODEL-CREATE refuses a repeated catalogue part identifier with 409 and a body outside its schema with 400", async () => {
    assertRefusal(await provider.call("POST", "/api/battery-models", { manufacturerPartId: providerModel.manufacturerPartId }), 409, "ERR-LC-IDENTIFIER-EXISTS");
    assertRefusal(await provider.call("POST", "/api/battery-models", { manufacturerPartId: "" }), 400, "ERR-LC-BODY-INVALID");
    assertRefusal(await provider.call("POST", "/api/battery-models", { manufacturerPartId: "TCK-PART-X", originalModel: { catenaXId: "not-a-uuid", manufacturerBpnl: PROVIDER } }), 400, "ERR-LC-BODY-INVALID");
  });
  await t.test("EP-MODEL-TWIN answers 200 with the field exposure, 404 for an unknown model and 400 for a malformed id", async () => {
    const answer = await provider.call("POST", `/api/battery-models/${providerModel.id.toUpperCase()}/twin`);
    assert.equal(answer.status, 200);
    assert.deepStrictEqual(answer.body.data, { exposure: { refreshed: true } });
    assertRefusal(await provider.call("POST", `/api/battery-models/${randomUUID()}/twin`), 404, "ERR-LC-MODEL-NOT-FOUND");
    assertRefusal(await provider.call("POST", "/api/battery-models/not-a-uuid/twin"), 400, "ERR-LC-BODY-INVALID");
  });
});

test("SwR-DATASET-200 (Passport rows written only in the data provider's deployment): the passport endpoints", async (t) => {
  let passport;
  await t.test("EP-PASSPORT-CREATE answers 201 with the passport and the field exposure", async () => {
    const answer = await provider.call("POST", "/api/passports", passportBody(providerModel.id.toUpperCase()));
    assert.equal(answer.status, 201, JSON.stringify(answer.body));
    passport = answer.body.data.passport;
    assert.deepStrictEqual(answer.body.data.exposure, { refreshed: true });
    assert.equal(passport.lifecycleStatus, "original");
    assert.equal(passport.batteryModelId, providerModel.id);
    assert.equal(passport.catenaXId, `urn:uuid:${passport.id}`);
  });
  await t.test("EP-PASSPORT-CREATE refuses an unknown battery model with 404 and a stored passport identifier with 409", async () => {
    assertRefusal(await provider.call("POST", "/api/passports", passportBody(randomUUID())), 404, "ERR-LC-MODEL-NOT-FOUND");
    assertRefusal(await provider.call("POST", "/api/passports", passportBody(providerModel.id, { passportIdentifier: passport.passportIdentifier })), 409, "ERR-LC-IDENTIFIER-EXISTS");
  });
  await t.test("EP-PASSPORT-READ answers the passport record of section 10.2", async () => {
    const answer = await provider.call("GET", `/api/passports/${passport.id}`);
    assert.equal(answer.status, 200);
    assert.deepStrictEqual(Object.keys(answer.body.data.passport).sort(), [
      "batteryCategory", "batteryIdentifier", "batteryModelId", "capacityFadePercent", "catenaXId", "dateIntoService", "dateOfManufacture", "endOfPassport", "expectedLifetimeYears", "facilityBpns", "id",
      "isSuperseded", "lifecycleStatus", "manufacturerBpnl", "passportIdentifier", "powerFadePercent", "ratedCapacityAh", "repairEntries", "responsibleOperator", "storedAspectKeys", "successorAuthorisation", "wasteSuccessor",
    ]);
  });
  await t.test("EP-ASPECT-PUT answers 200 with the passport and the field exposure, and refuses an unknown aspect key and an invalid payload", async () => {
    const answer = await provider.call("PUT", `/api/passports/${passport.id}/aspects/product-condition`, fixture("productCondition.json"));
    assert.equal(answer.status, 200, JSON.stringify(answer.body));
    assert.deepStrictEqual(answer.body.data.passport.storedAspectKeys, ["product-condition"]);
    assert.deepStrictEqual(answer.body.data.exposure, { refreshed: true });
    assertRefusal(await provider.call("PUT", `/api/passports/${passport.id}/aspects/unknown-key`, {}), 404, "ERR-LC-ASPECT-KEY-UNKNOWN");
    const invalid = await provider.call("PUT", `/api/passports/${passport.id}/aspects/product-condition`, { StateOfCharge: "high" });
    assertRefusal(invalid, 400, "ERR-LC-BODY-INVALID");
    assert.ok(invalid.body.messages.length > 1);
  });
  await t.test("EP-TWIN answers 200 with the field exposure and 404 for an unknown passport", async () => {
    const answer = await provider.call("POST", `/api/passports/${passport.id}/twin`);
    assert.deepStrictEqual(answer.body.data, { exposure: { refreshed: true } });
    const shell = await provider.twinRegistry.read(`urn:uuid:${passport.id}`);
    assert.deepStrictEqual(shell.submodelDescriptors.map((descriptor) => descriptor.idShort), ["productCondition"]);
    assertRefusal(await provider.call("POST", `/api/passports/${randomUUID()}/twin`), 404, "ERR-LC-PASSPORT-NOT-FOUND");
  });
  await t.test("decision D6: a passport of another data provider answers 404 on the deployment of the second-life operator", async () => {
    assertRefusal(await operator.call("GET", `/api/passports/${passport.id}`), 404, "ERR-LC-PASSPORT-NOT-FOUND");
    assertRefusal(await operator.call("PUT", `/api/passports/${passport.id}/aspects/product-condition`, fixture("productCondition.json")), 404, "ERR-LC-PASSPORT-NOT-FOUND");
    assertRefusal(await operator.call("POST", `/api/passports/${passport.id}/successor-authorisation`, { authorisationRef: "TCK-AUTHORISATION-1", validFrom: "2026-06-01" }), 404, "ERR-LC-PASSPORT-NOT-FOUND");
  });
  await t.test("401 without a credential and with an expired or foreign operator token, and 403 for a partner subject", async () => {
    assertRefusal(await provider.raw("GET", `/api/passports/${passport.id}`), 401, "ERR-AC-UNAUTHENTICATED");
    assertRefusal(await provider.raw("GET", `/api/passports/${passport.id}`, undefined, { authorization: "Bearer not.a.token" }), 401, "ERR-AC-UNAUTHENTICATED");
    const foreign = signOperatorToken({ sub: "tck-operator", bpnl: SECOND_LIFE, expiresInSeconds: 60 }, { secret: SECRET, now: clock.now() });
    assertRefusal(await provider.raw("GET", `/api/passports/${passport.id}`, undefined, { authorization: `Bearer ${foreign}` }), 401, "ERR-AC-UNAUTHENTICATED");
    for (const [method, path, body] of [
      ["GET", `/api/passports/${passport.id}`],
      ["POST", "/api/passports", passportBody(providerModel.id)],
      ["POST", "/api/battery-models", { manufacturerPartId: "TCK-PART-PARTNER" }],
      ["PUT", `/api/passports/${passport.id}/aspects/product-condition`, fixture("productCondition.json")],
    ]) {
      assertRefusal(await provider.asPartner(SECOND_LIFE, method, path, body), 403, "ERR-AC-CAPABILITY-MISSING");
    }
  });
});

test("SwR-DATASET-197 (Forward link added on the original data provider's request): EP-ISSUE-NEW-PASSPORT, EP-FORWARD-LINK and EP-SUCCESSOR-AUTHORISATION", async (t) => {
  const original = (await provider.call("POST", "/api/passports", passportBody(providerModel.id))).body.data.passport;
  let created;
  await t.test("EP-ISSUE-NEW-PASSPORT answers 201 with the new passport, the field exposure and the field notifications", async () => {
    const answer = await operator.call("POST", "/api/passports/new-passport", {
      operation: "repurposing",
      predecessors: [{ passportIdentifier: original.passportIdentifier, catenaXId: original.catenaXId.toUpperCase().replace("URN:UUID:", ""), dataProviderBpnl: PROVIDER, batteryIdentifier: original.batteryIdentifier, lifeCycleStage: "original", originalPurpose: ORIGINAL_PURPOSE, originalModelCatenaXId: providerModel.id }],
      batteryModelId: operatorModel.id,
      batteryIdentifier: original.batteryIdentifier,
      batteryCategory: "stationary",
      facilityBpns: "BPNS00000000TCK1",
      purpose: "Stationary storage",
      dateOfManufacture: "2026-02-20",
      dateIntoService: "2026-03-15",
      ratedCapacityAh: 180.07,
      capacityFadePercent: 12.25,
      powerFadePercent: 8.5,
      expectedLifetimeYears: 9.5,
      operationDate: "2026-03-01T08:00:00Z",
    });
    assert.equal(answer.status, 201, JSON.stringify(answer.body));
    created = answer.body.data;
    assert.equal(created.passport.lifecycleStatus, "repurposed");
    assert.equal(created.passport.ratedCapacityAh, 180.07);
    assert.deepStrictEqual(created.exposure, { refreshed: true });
    assert.deepStrictEqual(created.notifications.map((item) => [item.operation, item.receiverBpnl, item.passportIdentifier, item.outcome]), [["NewPassportIssued", PROVIDER, original.passportIdentifier, "pending"]]);
  });
  await t.test("EP-ISSUE-NEW-PASSPORT refuses a request without a performance value with 400 and a battery model of no original model with 409", async () => {
    assertRefusal(await operator.call("POST", "/api/passports/new-passport", { operation: "repurposing" }), 400, "ERR-LC-BODY-INVALID");
    const plain = (await operator.call("POST", "/api/battery-models", { manufacturerPartId: unique("TCK-PART") })).body.data.model;
    const answer = await operator.call("POST", "/api/passports/new-passport", {
      operation: "repurposing",
      predecessors: [{ passportIdentifier: unique("TCK-PASSPORT"), catenaXId: randomUUID(), dataProviderBpnl: PROVIDER, batteryIdentifier: "TCK-BATTERY-X", lifeCycleStage: "original", originalPurpose: ORIGINAL_PURPOSE, originalModelCatenaXId: providerModel.id }],
      batteryModelId: plain.id,
      batteryIdentifier: "TCK-BATTERY-X",
      batteryCategory: "stationary",
      facilityBpns: "BPNS00000000TCK1",
      purpose: "Stationary storage",
      dateOfManufacture: "2026-02-20",
      dateIntoService: "2026-03-15",
      ratedCapacityAh: 180,
      capacityFadePercent: 12,
      powerFadePercent: 8,
      expectedLifetimeYears: 9,
    });
    assertRefusal(answer, 409, "ERR-LC-MODEL-NOT-ORIGINAL");
  });
  await t.test("EP-FORWARD-LINK answers 201 with the successor link and the field exposure after the worker delivered NewPassportIssued", async () => {
    await operator.worker.tick();
    const [notice] = (await operator.call("GET", "/api/notifications/sent")).body.data.notifications.filter((item) => item.operation === "NewPassportIssued");
    assert.equal(notice.outcome, "sent");
    assertRefusal(await provider.call("POST", `/api/passports/${original.id}/forward-links`, { messageId: randomUUID() }), 404, "ERR-LC-NOTIFICATION-UNKNOWN");
    const answer = await provider.call("POST", `/api/passports/${original.id}/forward-links`, { messageId: notice.messageId.replace("urn:uuid:", "").toUpperCase() });
    assert.equal(answer.status, 201, JSON.stringify(answer.body));
    assert.equal(answer.body.data.link.successorPassportIdentifier, created.passport.passportIdentifier);
    assert.equal(answer.body.data.link.secondLifeOperatorBpnl, SECOND_LIFE);
    assert.deepStrictEqual(answer.body.data.exposure, { refreshed: true });
    const record = (await provider.call("GET", `/api/passports/${original.id}`)).body.data.passport;
    assert.equal(record.isSuperseded, true);
    assert.equal(record.lifecycleStatus, "original");
  });
  await t.test("EP-SUCCESSOR-AUTHORISATION answers 200 with the passport on a waste passport, and 409 on a passport that is not waste", async () => {
    assertRefusal(await provider.call("POST", `/api/passports/${original.id}/successor-authorisation`, { authorisationRef: "TCK-AUTHORISATION-1", validFrom: "2026-06-01" }), 409, "ERR-LC-STATUS-NOT-ADMITTED");
    await provider.call("POST", "/api/lifecycle-events/waste", { passportIdentifier: original.passportIdentifier, dataProviderBpnl: PROVIDER, successorBpnl: SUCCESSOR, successorRole: "producer", wasteDate: "2026-06-15T09:00:00Z" });
    assertRefusal(await provider.call("PUT", `/api/passports/${original.id}/aspects/serial-part`, { any: "payload" }), 403, "ERR-LC-SUCCESSOR-AUTHORISATION-MISSING");
    const answer = await provider.call("POST", `/api/passports/${original.id}/successor-authorisation`, { authorisationRef: "TCK-AUTHORISATION-1", validFrom: "2026-06-01", validTo: "2026-06-30" });
    assert.equal(answer.status, 200, JSON.stringify(answer.body));
    assert.deepStrictEqual(answer.body.data.passport.successorAuthorisation, { authorisationRef: "TCK-AUTHORISATION-1", validFrom: "2026-06-01", validTo: "2026-06-30" });
    assert.equal((await provider.call("PUT", `/api/passports/${original.id}/aspects/serial-part`, { any: "payload" })).status, 200);
    assertRefusal(await provider.call("POST", `/api/passports/${original.id}/successor-authorisation`, { authorisationRef: "TCK-AUTHORISATION-2", validFrom: "2026-06-10", validTo: "2026-06-01" }), 400, "ERR-LC-BODY-INVALID");
  });
  await t.test("the recycler's report of the end on its own deployment holds no passport of the data provider", async () => {
    assertRefusal(await operator.call("POST", "/api/lifecycle-events/recycling", { passportIdentifier: unique("TCK-UNKNOWN"), dataProviderBpnl: SECOND_LIFE, nameplateManufacturerBpnl: RECYCLER, recyclingDate: "2026-06-15T09:00:00Z" }), 404, "ERR-LC-PASSPORT-NOT-FOUND");
  });
});

test("version 10 of the specification: the operator endpoints of a passport after the code review of phases P4 and P5", async (t) => {
  const table = (name) => `${provider.db.adminClient.escapeIdentifier(provider.db.schema)}.${name}`;
  await t.test("decision D71: the answers hold the fields of section 9.3", async () => {
    const model = await provider.call("POST", "/api/battery-models", { manufacturerPartId: unique("TCK-PART") });
    assert.deepStrictEqual(Object.keys(model.body.data).sort(), ["exposure", "model"]);
    assert.deepStrictEqual(Object.keys(model.body.data.model).sort(), ["catenaXId", "id", "manufacturerBpnl", "manufacturerPartId", "originalModel"]);
    assert.deepStrictEqual(Object.keys((await provider.call("POST", `/api/battery-models/${model.body.data.model.id}/twin`)).body.data), ["exposure"]);
    const created = await provider.call("POST", "/api/passports", passportBody(model.body.data.model.id));
    assert.deepStrictEqual(Object.keys(created.body.data).sort(), ["exposure", "passport"]);
    const passportId = created.body.data.passport.id;
    assert.deepStrictEqual(Object.keys((await provider.call("PUT", `/api/passports/${passportId}/aspects/serial-part`, { any: "payload" })).body.data).sort(), ["exposure", "passport"]);
    assert.deepStrictEqual(Object.keys((await provider.call("POST", `/api/passports/${passportId}/twin`)).body.data), ["exposure"]);
    assert.deepStrictEqual(Object.keys((await provider.call("GET", `/api/passports/${passportId}`)).body.data), ["passport"]);
    const record = await provider.call("POST", `/api/passports/${passportId}/access-records`, { recipientBpnl: SUCCESSOR, recipientRole: "authorisedRecipient", aspectKey: "serial-part" });
    assert.deepStrictEqual(Object.keys(record.body.data).sort(), ["exposure", "record"]);
    assert.deepStrictEqual(Object.keys(record.body.data.record).sort(), ["aspectKey", "id", "passportId", "recipientBpnl", "recipientRole", "validFrom", "validTo"]);
    assert.deepStrictEqual(Object.keys((await provider.call("DELETE", `/api/passports/${passportId}/access-records/${record.body.data.record.id}`)).body.data).sort(), ["exposure", "record"]);
    assert.deepStrictEqual(Object.keys((await provider.call("POST", `/api/passports/${passportId}/purchaser`, { purchaserBpnl: SUCCESSOR })).body.data).sort(), ["closed", "exposure", "opened"]);
  });
  await t.test("findings R45-007 and R45-008: PUT of aspects/serial-part as text/plain, without a body, with null, with a list and with a number answers ERR-LC-BODY-INVALID and stores nothing", async () => {
    const passport = (await provider.call("POST", "/api/passports", passportBody(providerModel.id))).body.data.passport;
    const path = `/api/passports/${passport.id}/aspects/serial-part`;
    assertRefusal(await provider.call("PUT", path, JSON.stringify({ any: "payload" }), { "content-type": "text/plain" }), 400, "ERR-LC-BODY-INVALID");
    assertRefusal(await provider.call("PUT", path), 400, "ERR-LC-BODY-INVALID");
    for (const body of ["null", "[]", "[1, 2]", "42"]) assertRefusal(await provider.call("PUT", path, body), 400, "ERR-LC-BODY-INVALID");
    assert.equal((await provider.query("SELECT 1 FROM passport_aspect_payloads WHERE passport_id = $1", [passport.id])).length, 0);
  });
  await t.test("finding R45-006: a second passport with a stored passportIdentifier answers 409 and stores one refused record of passport_write_decisions through runWrite", async () => {
    const identifier = unique("TCK-PASSPORT");
    assert.equal((await provider.call("POST", "/api/passports", passportBody(providerModel.id, { passportIdentifier: identifier }))).status, 201);
    const before = await provider.query("SELECT * FROM passport_write_decisions WHERE decision = 'refused' AND refusal_id = 'ERR-LC-IDENTIFIER-EXISTS'");
    assertRefusal(await provider.call("POST", "/api/passports", passportBody(providerModel.id, { passportIdentifier: identifier })), 409, "ERR-LC-IDENTIFIER-EXISTS");
    const after = await provider.query("SELECT * FROM passport_write_decisions WHERE decision = 'refused' AND refusal_id = 'ERR-LC-IDENTIFIER-EXISTS'");
    assert.equal(after.length, before.length + 1);
    const record = after.at(-1);
    assert.deepStrictEqual([record.action, record.requester_bpnl, record.requester_kind, record.passport_id, record.relied_on], ["passport.create", PROVIDER, "operator", null, null]);
  });
  await t.test("decision D69: with the privilege INSERT on passport_write_decisions revoked, EP-PASSPORT-CREATE answers 201", async () => {
    await provider.db.adminClient.query(`REVOKE INSERT ON ${table("passport_write_decisions")} FROM refserver_app`);
    try {
      const answer = await provider.call("POST", "/api/passports", passportBody(providerModel.id));
      assert.equal(answer.status, 201, JSON.stringify(answer.body));
      const queued = await provider.query("SELECT entries FROM audit_outbox WHERE written_at IS NULL");
      assert.ok(queued.some((row) => row.entries[0].passportId === answer.body.data.passport.id), "the audit record of the step is queued");
    } finally {
      await provider.db.adminClient.query(`GRANT INSERT ON ${table("passport_write_decisions")} TO refserver_app`);
    }
  });
  await t.test("finding R45-012: GET /api/passports/:passportId/nothing answers 404 ERR-LC-PATH-UNKNOWN with the error body of D9", async () => {
    const answer = await provider.raw("GET", `/api/passports/${randomUUID()}/nothing`);
    assert.equal(answer.status, 404);
    assert.deepStrictEqual(answer.body.error, { message: answer.body.messages[0].text, code: "ERR-LC-PATH-UNKNOWN" });
  });
});
