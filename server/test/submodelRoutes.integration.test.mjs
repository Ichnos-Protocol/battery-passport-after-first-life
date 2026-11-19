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

// Tests the submodel endpoints EP-SUBMODEL and EP-ACCESS-MAP and the health endpoint EP-HEALTH through
// the application of the second-life operator (BPNL00000000TCK2).
//
// Requirements of the registry that this file verifies:
//   SwR-SUBMODELS-052 (Submodel endpoints change no stored data)
//   SwR-DATASET-126 (Lifecycle data delivered beside the seven aspects in the decided carrier), delivered
//   in part by decision D46 (The partial delivery of the lifecycle data)
//   SwR-DATASET-193 (New passport served under its own DPP Metadata identifier)
//   SwR-DATASET-198 (Successors record served as a submodel of its own)
// Measures VM-SWE-SUBMODELS-016 (Instance submodel route answers through the real middleware chain) and
// VM-SWE-DATASET-032 (Dataset submodels and marking served at the data-plane interface). Decision D3
// (The access map and the whole aspect) [waits for the owner] and decision Q-409 (whether served aspect
// payloads skip the response envelope).
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
import { createAspectSchemaCompiler } from "../src/validation/aspectSchemaCompiler.mjs";
import { createSchemaValidator } from "../src/validation/schemaValidator.mjs";

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


const OWN = "BPNL00000000TCK2";
const PROVIDER = "BPNL00000000TCK1";
const RECYCLER = "BPNL00000000TCK3";
const SUCCESSOR = "BPNL00000000TCK4";
const PURCHASER = "BPNL00000000TCK5";
const READER = "BPNL00000000TCK6";
const TODAY_INSTANT = "2026-06-15T09:00:00.000Z";
const ORIGINAL_MODEL = randomUUID();
let deployment;
let mapModel;
let plainModel;
let counter = 0;
const unique = (prefix) => `${prefix}-${process.pid}-${(counter += 1)}`;
const generated = (name) => JSON.parse(readFileSync(new URL(`../../docs/api/aspects/${name}-schema.json`, import.meta.url), "utf8"));

function assertRefusal(answer, status, id) {
  assert.equal(answer.status, status, JSON.stringify(answer.body));
  assert.equal(answer.body.success, false);
  assert.equal(answer.body.error.code, id);
}
async function firstPassport(modelId) {
  const answer = await deployment.call("POST", "/api/passports", {
    batteryModelId: modelId,
    batteryIdentifier: unique("TCK-BATTERY"),
    batteryCategory: "ev",
    facilityBpns: "BPNS00000000TCK1",
    dateOfManufacture: "2026-01-10",
    dateIntoService: "2026-02-01",
    originalPurpose: "Traction battery",
  });
  assert.equal(answer.status, 201, JSON.stringify(answer.body));
  return answer.body.data.passport;
}
const read = (passportId, aspectKey, reader) => (reader === undefined ? deployment.call : (method, path) => deployment.asPartner(reader, method, path))("GET", `/api/passports/${passportId}/submodels/${aspectKey}/submodel`);
const record = (passportId, recipientBpnl, recipientRole, aspectKey) => deployment.call("POST", `/api/passports/${passportId}/access-records`, { recipientBpnl, recipientRole, aspectKey });

// The stored state of the tables that a read must leave unchanged.
async function snapshot() {
  const tables = ["passports", "passport_aspect_payloads", "passport_access_records", "passport_write_decisions", "notifications_sent", "notifications_received", "access_map_versions"];
  const state = {};
  for (const table of tables) state[table] = await deployment.query(`SELECT * FROM ${table} ORDER BY 1, 2`);
  return state;
}

before(async () => {
  deployment = await startApplication("submodelRoutes", OWN);
  mapModel = (await deployment.call("POST", "/api/battery-models", { manufacturerPartId: unique("TCK-PART"), originalModel: { catenaXId: ORIGINAL_MODEL, manufacturerBpnl: PROVIDER } })).body.data.model;
  plainModel = (await deployment.call("POST", "/api/battery-models", { manufacturerPartId: unique("TCK-PART") })).body.data.model;
  const stored = await deployment.call("PUT", `/api/battery-models/${mapModel.id}/access-map`, fixture("accessMap.json"));
  assert.equal(stored.status, 201, JSON.stringify(stored.body));
});
after(async () => {
  if (deployment) await deployment.stop();
});

test("SwR-DATASET-126 (Lifecycle data delivered beside the seven aspects in the decided carrier): the bare payloads and their schemas", async (t) => {
  const validator = createSchemaValidator();
  const compiler = createAspectSchemaCompiler();
  const lifecycleSchema = compiler.compile(generated("BatteryPassportLifecycle"));
  const successorsSchema = compiler.compile(generated("BatteryPassportSuccessors"));
  const accessMapSchema = compiler.compile(generated("BatteryPassportAccessMap"));
  const passport = await firstPassport(mapModel.id);
  for (const [key, name] of [["digital-nameplate", "nameplate.json"], ["technical-data", "technicalData.json"], ["product-condition", "productCondition.json"], ["dpp-metadata", "dppMetadata.json"]]) {
    const stored = await deployment.call("PUT", `/api/passports/${passport.id}/aspects/${key}`, fixture(name));
    assert.equal(stored.status, 200, JSON.stringify(stored.body));
  }
  await t.test("the four stored payloads are served bare, with the governed elements, and validate against their stored schemas", async () => {
    for (const key of ["digital-nameplate", "technical-data", "product-condition", "dpp-metadata"]) {
      const answer = await read(passport.id, key);
      assert.equal(answer.status, 200);
      assert.equal(Object.hasOwn(answer.body, "success"), false, "the payload is bare");
      const outcome = validator.validateAspect(key, answer.body);
      assert.equal(outcome.valid, true, `${key}: ${JSON.stringify(outcome.errors)}`);
    }
    const nameplate = (await read(passport.id, "digital-nameplate")).body;
    assert.equal(nameplate.ManufacturerIdentifier, OWN);
    assert.equal(nameplate.SerialNumber, passport.batteryIdentifier);
    assert.deepStrictEqual(nameplate.ManufacturerName, [{ en: "Example Company TCK2" }]);
    assert.equal((await read(passport.id, "dpp-metadata")).body.digitalProductPassportId, passport.passportIdentifier);
  });
  await t.test("the lifecycle payload of a new passport with its waste successor and its end validates against the generated schema", async () => {
    const predecessor = { passportIdentifier: unique("TCK-PASSPORT"), catenaXId: randomUUID(), dataProviderBpnl: PROVIDER, batteryIdentifier: unique("TCK-BATTERY"), lifeCycleStage: "original", originalPurpose: "Traction battery", originalModelCatenaXId: ORIGINAL_MODEL };
    const created = await deployment.call("POST", "/api/passports/new-passport", {
      operation: "remanufacturing",
      predecessors: [predecessor],
      batteryModelId: mapModel.id,
      batteryIdentifier: unique("TCK-BATTERY"),
      batteryCategory: "ev",
      facilityBpns: "BPNS00000000TCK1",
      purpose: "Traction battery",
      dateOfManufacture: "2026-02-20",
      dateIntoService: "2026-03-15",
      ratedCapacityAh: 180,
      capacityFadePercent: 10,
      powerFadePercent: 8,
      expectedLifetimeYears: 9,
      operationDate: "2026-03-01T08:00:00Z",
    });
    assert.equal(created.status, 201, JSON.stringify(created.body));
    const newPassport = created.body.data.passport;
    const first = (await read(newPassport.id, "lifecycle")).body;
    assert.deepStrictEqual(first, { predecessors: [{ passportIdentifier: predecessor.passportIdentifier, catenaXId: `urn:uuid:${predecessor.catenaXId}`, dataProviderBpnl: PROVIDER, operation: "remanufacturing", operationDate: "2026-03-01T08:00:00.000Z" }] });
    assert.equal(lifecycleSchema(first), true, JSON.stringify(lifecycleSchema.errors));
    await deployment.call("POST", "/api/lifecycle-events/waste", { passportIdentifier: newPassport.passportIdentifier, dataProviderBpnl: OWN, successorBpnl: SUCCESSOR, successorRole: "producer", wasteDate: TODAY_INSTANT });
    await deployment.call("POST", "/api/lifecycle-events/recycling", { passportIdentifier: newPassport.passportIdentifier, dataProviderBpnl: OWN, nameplateManufacturerBpnl: OWN, recyclingDate: TODAY_INSTANT });
    const ended = (await read(newPassport.id, "lifecycle")).body;
    assert.deepStrictEqual(ended.wasteResponsibility, { successorBpnl: SUCCESSOR, successorRole: "producer", date: TODAY_INSTANT });
    assert.deepStrictEqual(ended.endOfPassport, { recyclingDate: TODAY_INSTANT, recyclerBpnl: OWN });
    assert.equal(lifecycleSchema(ended), true, JSON.stringify(lifecycleSchema.errors));
    const firstPassportPayload = (await read(passport.id, "lifecycle")).body;
    assert.deepStrictEqual(firstPassportPayload, { predecessors: [] });
  });
  await t.test("SwR-DATASET-198: the successors payload is served after a forward link and validates; without a link the key answers 404", async () => {
    const original = await firstPassport(mapModel.id);
    assertRefusal(await read(original.id, "successors"), 404, "ERR-LC-SUBMODEL-NOT-FOUND");
    await deployment.call("POST", "/api/passports/new-passport", {
      operation: "repurposing",
      predecessors: [{ passportIdentifier: original.passportIdentifier, catenaXId: original.catenaXId, dataProviderBpnl: OWN, batteryIdentifier: original.batteryIdentifier, lifeCycleStage: "original", originalPurpose: "Traction battery", originalModelCatenaXId: ORIGINAL_MODEL }],
      batteryModelId: mapModel.id,
      batteryIdentifier: original.batteryIdentifier,
      batteryCategory: "stationary",
      facilityBpns: "BPNS00000000TCK1",
      purpose: "Stationary storage",
      dateOfManufacture: "2026-02-20",
      dateIntoService: "2026-03-15",
      ratedCapacityAh: 180,
      capacityFadePercent: 10,
      powerFadePercent: 8,
      expectedLifetimeYears: 9,
      operationDate: "2026-03-01T08:00:00Z",
    });
    const [notice] = (await deployment.call("GET", "/api/notifications/received")).body.data.notifications.filter((item) => item.passportIdentifier === original.passportIdentifier);
    await deployment.call("POST", `/api/passports/${original.id}/forward-links`, { messageId: notice.messageId });
    const answer = await read(original.id, "successors");
    assert.equal(answer.status, 200);
    assert.equal(answer.body.successors.length, 1);
    assert.equal(successorsSchema(answer.body), true, JSON.stringify(successorsSchema.errors));
  });
  await t.test("EP-ACCESS-MAP answers the bare payload of section 3.4, also on the path with the suffix /$value, and the refusals of a model without a map", async () => {
    const answer = await deployment.asPartner(READER, "GET", `/api/battery-models/${mapModel.id}/submodels/access-map/submodel`);
    assert.equal(answer.status, 200, JSON.stringify(answer.body));
    assert.equal(accessMapSchema(answer.body), true, JSON.stringify(accessMapSchema.errors));
    assert.equal(answer.body.mapVersion, "1.0.0");
    assert.equal(answer.body.entries.length, fixture("accessMap.json").entries.length);
    assert.deepStrictEqual((await deployment.call("GET", `/api/battery-models/${mapModel.id}/submodels/access-map/submodel/$value`)).body, answer.body);
    assertRefusal(await deployment.call("GET", `/api/battery-models/${plainModel.id}/submodels/access-map/submodel`), 404, "ERR-LC-SUBMODEL-NOT-FOUND");
    assertRefusal(await deployment.call("GET", `/api/battery-models/${randomUUID()}/submodels/access-map/submodel`), 404, "ERR-LC-MODEL-NOT-FOUND");
  });
  await t.test("EP-SUBMODEL answers the same payload on the suffix /$value, and refuses an unknown aspect key and the key access-map", async () => {
    assert.deepStrictEqual((await deployment.call("GET", `/api/passports/${passport.id}/submodels/product-condition/submodel/$value`)).body, (await read(passport.id, "product-condition")).body);
    assertRefusal(await read(passport.id, "access-map"), 404, "ERR-LC-ASPECT-KEY-UNKNOWN");
    assertRefusal(await read(passport.id, "unknown-key"), 404, "ERR-LC-ASPECT-KEY-UNKNOWN");
    assertRefusal(await read(passport.id, "circularity"), 404, "ERR-LC-SUBMODEL-NOT-FOUND");
    assertRefusal(await read(randomUUID(), "lifecycle"), 404, "ERR-LC-PASSPORT-NOT-FOUND");
  });
});

test("decision D3 [waits for the owner]: each line of the access decision of section 9.2.4", async (t) => {
  const withMap = await firstPassport(mapModel.id);
  const withoutMap = await firstPassport(plainModel.id);
  for (const passport of [withMap, withoutMap]) {
    for (const [key, name] of [["digital-nameplate", "nameplate.json"], ["technical-data", "technicalData.json"], ["product-condition", "productCondition.json"], ["dpp-metadata", "dppMetadata.json"]]) {
      await deployment.call("PUT", `/api/passports/${passport.id}/aspects/${key}`, fixture(name));
    }
    await deployment.call("PUT", `/api/passports/${passport.id}/aspects/serial-part`, { catenaXId: passport.catenaXId });
    // The map of mapModel holds no entry of the circularity model, so only a payload without a leaf is
    // covered there (decision D45); the passport of the model without a map admits every payload.
    const circularity = await deployment.call("PUT", `/api/passports/${passport.id}/aspects/circularity`, passport === withMap ? {} : { anything: "unchecked" });
    assert.equal(circularity.status, 200, JSON.stringify(circularity.body));
  }
  await t.test("the operator subject reads every aspect", async () => {
    for (const key of ["digital-nameplate", "technical-data", "product-condition", "dpp-metadata", "serial-part", "circularity", "lifecycle"]) assert.equal((await read(withMap.id, key)).status, 200, key);
  });
  await t.test("lifecycle and successors: a partner reads only with an open access record", async () => {
    assertRefusal(await read(withMap.id, "lifecycle", PURCHASER), 403, "ERR-AC-ACCESS-GROUP-REFUSED");
    await record(withMap.id, PURCHASER, "purchaser", "lifecycle");
    assert.equal((await read(withMap.id, "lifecycle", PURCHASER)).status, 200);
    assertRefusal(await read(withMap.id, "lifecycle", READER), 403, "ERR-AC-ACCESS-GROUP-REFUSED");
  });
  await t.test("an IDTA-02035 aspect whose current map entries are all public is read without an access record", async () => {
    assert.equal((await read(withMap.id, "technical-data", READER)).status, 200);
  });
  await t.test("an IDTA-02035 aspect with a restricted entry is refused whole without an access record and read whole with one", async () => {
    assertRefusal(await read(withMap.id, "digital-nameplate", READER), 403, "ERR-AC-ACCESS-GROUP-REFUSED");
    assertRefusal(await read(withMap.id, "product-condition", READER), 403, "ERR-AC-ACCESS-GROUP-REFUSED");
    await record(withMap.id, READER, "authorisedRecipient", "digital-nameplate");
    const answer = await read(withMap.id, "digital-nameplate", READER);
    assert.equal(answer.status, 200);
    assert.equal(answer.body.LifeCycleStage, "original");
  });
  await t.test("an IDTA-02035 aspect without an entry in the current map, and every aspect of a model without a map, needs an access record", async () => {
    assertRefusal(await read(withMap.id, "circularity", READER), 403, "ERR-AC-ACCESS-GROUP-REFUSED");
    assertRefusal(await read(withoutMap.id, "technical-data", READER), 403, "ERR-AC-ACCESS-GROUP-REFUSED");
    await record(withoutMap.id, READER, "authorisedRecipient", "technical-data");
    assert.equal((await read(withoutMap.id, "technical-data", READER)).status, 200);
  });
  await t.test("dpp-metadata, serial-part and single-level-bom-as-built: a partner reads only with an open access record", async () => {
    assertRefusal(await read(withMap.id, "dpp-metadata", READER), 403, "ERR-AC-ACCESS-GROUP-REFUSED");
    assertRefusal(await read(withMap.id, "serial-part", READER), 403, "ERR-AC-ACCESS-GROUP-REFUSED");
    await record(withMap.id, READER, "authorisedRecipient", "serial-part");
    assert.equal((await read(withMap.id, "serial-part", READER)).status, 200);
  });
  await t.test("an ended access record no longer admits the partner", async () => {
    const opened = await record(withMap.id, RECYCLER, "authorisedRecipient", "dpp-metadata");
    assert.equal((await read(withMap.id, "dpp-metadata", RECYCLER)).status, 200);
    current = new Date(current.getTime() + 1000);
    await deployment.call("DELETE", `/api/passports/${withMap.id}/access-records/${opened.body.data.record.id}`);
    assertRefusal(await read(withMap.id, "dpp-metadata", RECYCLER), 403, "ERR-AC-ACCESS-GROUP-REFUSED");
  });
  await t.test("SwR-SUBMODELS-052: no stored record changes during the reads of a partner and of the operator", async () => {
    const before = await snapshot();
    for (const reader of [undefined, READER, PURCHASER]) {
      for (const key of ["digital-nameplate", "technical-data", "product-condition", "dpp-metadata", "serial-part", "lifecycle", "successors"]) await read(withMap.id, key, reader);
    }
    await deployment.asPartner(READER, "GET", `/api/battery-models/${mapModel.id}/submodels/access-map/submodel`);
    assert.deepStrictEqual(await snapshot(), before);
  });
});

test("section 11.5: EP-HEALTH answers 200 with the status up, and 503 with the status down without a database", async (t) => {
  await t.test("GET /health answers 200 {\"status\":\"up\"} without a credential", async () => {
    const answer = await deployment.raw("GET", "/health");
    assert.equal(answer.status, 200);
    assert.deepStrictEqual(answer.body, { status: "up" });
  });
  await t.test("GET /health answers 503 {\"status\":\"down\"} when the pool fails", async () => {
    const failing = { query: () => Promise.reject(new Error("the database is unreachable")) };
    const { app } = createApp({ config: deployment.config, pool: failing, clock, transport: {}, offerStore: createMemoryOfferStore(), twinRegistry: createMemoryTwinRegistry(), receiverResolver: resolver, logger: createLogger({ level: "error", stream: { write() {} }, clock }) });
    const server = await new Promise((resolve) => {
      const listening = app.listen(0, "127.0.0.1", () => resolve(listening));
    });
    try {
      const answer = await request(`http://127.0.0.1:${server.address().port}`, "GET", "/health");
      assert.equal(answer.status, 503);
      assert.deepStrictEqual(answer.body, { status: "down" });
    } finally {
      await new Promise((resolve) => {
        server.close(resolve);
        server.closeAllConnections();
      });
    }
  });
});
