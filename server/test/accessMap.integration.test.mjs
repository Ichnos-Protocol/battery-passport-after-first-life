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

// Tests the access map through EP-ACCESS-MAP-PUT, EP-ASPECT-PUT and EP-ACCESS-MAP on the application of
// the data provider (BPNL00000000TCK1).
//
// Requirements of the registry that this file verifies:
//   SwR-DATASET-065 (Every dataset field marked with exactly one Art. 77(2) access group)
//   SwR-SUBMODELS-036 (Access marking assigns every served passport field one group)
//   SyR-PASS-011 (Every dataset field marked with exactly one access group)
// Measure VM-SYS-PASS-009 (Access marking complete, one group per field, changeable). Decisions D27 (A
// subset of JSONPath) and D45 (The data provider's check of a new payload), and the read rule of
// readAccessMap of section 9.2.4.
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


const OWN = "BPNL00000000TCK1";
const NAMEPLATE = "urn:samm:io.admin-shell.idta.batterypass.digital_nameplate:1.0.0#BatteryNameplate";
const PRODUCT_CONDITION = "urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#ProductCondition";
let deployment;
let counter = 0;
const unique = (prefix) => `${prefix}-${process.pid}-${(counter += 1)}`;

function assertRefusal(answer, status, id) {
  assert.equal(answer.status, status, JSON.stringify(answer.body));
  assert.equal(answer.body.success, false);
  assert.equal(answer.body.error.code, id);
}
async function newModel() {
  return (await deployment.call("POST", "/api/battery-models", { manufacturerPartId: unique("TCK-PART") })).body.data.model;
}
async function passportOf(modelId) {
  return (
    await deployment.call("POST", "/api/passports", {
      batteryModelId: modelId,
      batteryIdentifier: unique("TCK-BATTERY"),
      batteryCategory: "ev",
      facilityBpns: "BPNS00000000TCK1",
      dateOfManufacture: "2026-01-10",
      originalPurpose: "Traction battery",
    })
  ).body.data.passport;
}
const putMap = (modelId, map) => deployment.call("PUT", `/api/battery-models/${modelId}/access-map`, map);
const readMap = (modelId) => deployment.call("GET", `/api/battery-models/${modelId}/submodels/access-map/submodel`);
const entry = (aspect, path, accessGroup = "public") => ({ aspect, twinLevel: "PartInstance", path, accessGroup, legalBasis: "Annex XIII point 1" });

before(async () => {
  deployment = await startApplication("accessMap", OWN);
});
after(async () => {
  if (deployment) await deployment.stop();
});

test("SwR-DATASET-065 (Every dataset field marked with exactly one Art. 77(2) access group): EP-ACCESS-MAP-PUT", async (t) => {
  await t.test("a complete map is stored and answered with the stored version and the field exposure, and the PartType shell holds its descriptor", async () => {
    const model = await newModel();
    const passport = await passportOf(model.id);
    await deployment.call("PUT", `/api/passports/${passport.id}/aspects/product-condition`, fixture("productCondition.json"));
    const answer = await putMap(model.id, fixture("accessMap.json"));
    assert.equal(answer.status, 201, JSON.stringify(answer.body));
    assert.deepStrictEqual(answer.body.data.accessMap, { ...fixture("accessMap.json"), entries: answer.body.data.accessMap.entries });
    assert.equal(answer.body.data.accessMap.entries.length, fixture("accessMap.json").entries.length);
    assert.deepStrictEqual(answer.body.data.exposure, { refreshed: true });
    assert.deepStrictEqual((await deployment.twinRegistry.read(`urn:uuid:${model.id}`)).submodelDescriptors.map((descriptor) => descriptor.idShort), ["batteryPassportAccessMap"]);
    assert.ok((await deployment.offerStore.list()).some((offer) => offer.assetId === `access-map-${model.id}`));
  });
  await t.test("a map that does not cover a stored payload is refused with 422 ERR-LC-ACCESS-MAP-INCOMPLETE and one message per uncovered field", async () => {
    const model = await newModel();
    const passport = await passportOf(model.id);
    await deployment.call("PUT", `/api/passports/${passport.id}/aspects/product-condition`, fixture("productCondition.json"));
    const map = { mapVersion: "1.0.0", validFrom: "2026-01-01", entries: [entry(PRODUCT_CONDITION, "$.NumberOfFullCycles", "legitimateInterestBattery")] };
    const answer = await putMap(model.id, map);
    assertRefusal(answer, 422, "ERR-LC-ACCESS-MAP-INCOMPLETE");
    assert.ok(answer.body.messages.some((message) => message.text.includes("/StateOfCharge/StateOfChargeValue")), JSON.stringify(answer.body.messages));
    assert.equal(answer.body.messages.some((message) => message.text.includes("/NumberOfFullCycles/")), false);
    assertRefusal(await readMap(model.id), 404, "ERR-LC-SUBMODEL-NOT-FOUND");
  });
  await t.test("a map with two access groups for one field is refused with 422 ERR-LC-ACCESS-MAP-INCOMPLETE", async () => {
    const model = await newModel();
    const passport = await passportOf(model.id);
    await deployment.call("PUT", `/api/passports/${passport.id}/aspects/product-condition`, fixture("productCondition.json"));
    const map = { mapVersion: "1.0.0", validFrom: "2026-01-01", entries: [entry(PRODUCT_CONDITION, "$", "legitimateInterestBattery"), entry(PRODUCT_CONDITION, "$.StateOfCharge.StateOfChargeValue", "public")] };
    const answer = await putMap(model.id, map);
    assertRefusal(answer, 422, "ERR-LC-ACCESS-MAP-INCOMPLETE");
    assert.ok(answer.body.messages.some((message) => message.text.includes("/StateOfCharge/StateOfChargeValue") && message.text.includes("legitimateInterestBattery and public")), JSON.stringify(answer.body.messages));
  });
  await t.test("a repeated map version is refused with 409, an unsupported path with 422, a map outside its schema with 400 and an unknown model with 404", async () => {
    const model = await newModel();
    assert.equal((await putMap(model.id, fixture("accessMap.json"))).status, 201);
    assertRefusal(await putMap(model.id, fixture("accessMap.json")), 409, "ERR-LC-ACCESS-MAP-VERSION-EXISTS");
    assertRefusal(await putMap(model.id, { ...fixture("accessMap.json"), mapVersion: "1.1.0", entries: [entry(NAMEPLATE, "$..SerialNumber")] }), 422, "ERR-LC-PATH-NOT-SUPPORTED");
    assertRefusal(await putMap(model.id, { mapVersion: "1.2.0", validFrom: "18 February 2027", entries: [entry(NAMEPLATE, "$")] }), 400, "ERR-LC-BODY-INVALID");
    assertRefusal(await putMap(randomUUID(), fixture("accessMap.json")), 404, "ERR-LC-MODEL-NOT-FOUND");
    assertRefusal(await deployment.asPartner("BPNL00000000TCK2", "PUT", `/api/battery-models/${model.id}/access-map`, fixture("accessMap.json")), 403, "ERR-AC-CAPABILITY-MISSING");
  });
});

test("decision D45 (The data provider's check of a new payload): EP-ASPECT-PUT against the current map and every later version", async (t) => {
  await t.test("a later payload that the current map does not cover is refused, and a covered payload is stored", async () => {
    const model = await newModel();
    await putMap(model.id, fixture("accessMap.json"));
    const passport = await passportOf(model.id);
    assert.equal((await deployment.call("PUT", `/api/passports/${passport.id}/aspects/digital-nameplate`, fixture("nameplate.json"))).status, 200);
    const uncovered = { ...fixture("productCondition.json"), RemainingCapacity: { RemainingCapacityValue: 180, LastUpdate: "2026-06-01T10:00:00Z" } };
    const answer = await deployment.call("PUT", `/api/passports/${passport.id}/aspects/product-condition`, uncovered);
    assertRefusal(answer, 422, "ERR-LC-ACCESS-MAP-INCOMPLETE");
    assert.ok(answer.body.messages.some((message) => message.text.includes("/RemainingCapacity/RemainingCapacityValue")));
  });
  await t.test("a stored version with a later valid_from also checks a new payload", async () => {
    const model = await newModel();
    const passport = await passportOf(model.id);
    await putMap(model.id, fixture("accessMap.json"));
    const later = { mapVersion: "2.0.0", validFrom: "2027-01-01", entries: fixture("accessMap.json").entries.filter((item) => item.path !== "$.StateOfCharge") };
    assert.equal((await putMap(model.id, later)).status, 201);
    const answer = await deployment.call("PUT", `/api/passports/${passport.id}/aspects/product-condition`, fixture("productCondition.json"));
    assertRefusal(answer, 422, "ERR-LC-ACCESS-MAP-INCOMPLETE");
    assert.ok(answer.body.messages.some((message) => message.text.startsWith("mapVersion 2.0.0") && message.text.includes("/StateOfCharge/StateOfChargeValue")), JSON.stringify(answer.body.messages));
  });
});

test("section 9.2.4: the tie rule and the date rule of readAccessMap", async (t) => {
  await t.test("the date rule: the version whose valid_from is the latest date not after today is current, and a later version is not yet current", async () => {
    const model = await newModel();
    await putMap(model.id, { ...fixture("accessMap.json"), mapVersion: "1.0.0", validFrom: "2026-01-01" });
    await putMap(model.id, { ...fixture("accessMap.json"), mapVersion: "1.5.0", validFrom: "2026-06-15" });
    await putMap(model.id, { ...fixture("accessMap.json"), mapVersion: "2.0.0", validFrom: "2026-06-16" });
    assert.equal((await readMap(model.id)).body.mapVersion, "1.5.0");
    current = new Date("2026-06-16T00:00:00.000Z");
    try {
      assert.equal((await readMap(model.id)).body.mapVersion, "2.0.0");
    } finally {
      current = new Date("2026-06-15T10:00:00.000Z");
    }
  });
  await t.test("the tie rule: among versions with one valid_from the version with the highest id wins", async () => {
    const model = await newModel();
    await putMap(model.id, { ...fixture("accessMap.json"), mapVersion: "3.0.0", validFrom: "2026-02-01" });
    await putMap(model.id, { ...fixture("accessMap.json"), mapVersion: "1.0.0", validFrom: "2026-02-01" });
    assert.equal((await readMap(model.id)).body.mapVersion, "1.0.0");
  });
  await t.test("a map whose every version lies after today answers 404 ERR-LC-SUBMODEL-NOT-FOUND", async () => {
    const model = await newModel();
    await putMap(model.id, { ...fixture("accessMap.json"), validFrom: "2027-01-01" });
    assertRefusal(await readMap(model.id), 404, "ERR-LC-SUBMODEL-NOT-FOUND");
  });
});
