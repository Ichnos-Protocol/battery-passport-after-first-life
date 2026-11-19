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

// Tests the access records through EP-ACCESS-RECORD, EP-ACCESS-RECORD-END and EP-PURCHASER on two
// applications of one data provider, one under each value of ACCESS_REGIME.
//
// Requirements of the registry that this file verifies:
//   SwR-DATASET-195 (Direct re-use recorded as a purchaser change, never as a lineage step)
//   SwR-DATASET-196 (Direct re-use leaves the responsible operator unchanged)
//   SwR-DATASET-199 (Direct re-use leaves the battery status unchanged)
//   SwR-ACCESS-127 (Purchaser for point 4 access taken from the open access record)
//   SwR-ACCESS-129 (Previous holder's point 4 access ends with the closed access record)
//   SyR-PASS-231 (New holder after direct re-use recorded as the battery's purchaser)
//   SyR-PASS-235 (Previous holder loses access to individual battery information after a resale)
// Decisions D29 (The access regime and the admitted roles) and D30 (The change of purchaser).
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
import { ADMITTED_ROLES, RECIPIENT_ROLES } from "../src/access/accessRecordService.mjs";

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
const PURCHASER = "BPNL00000000TCK5";
const AGENT = "BPNL00000000TCK6";
const NEW_PURCHASER = "BPNL00000000TCK4";
const ASPECT_KEYS = ["digital-nameplate", "handover-documentation", "carbon-footprint", "technical-data", "product-condition", "material-composition", "circularity", "dpp-metadata", "serial-part", "single-level-bom-as-built", "lifecycle", "successors"];
const deployments = {};
let counter = 0;
const unique = (prefix) => `${prefix}-${process.pid}-${(counter += 1)}`;

function assertRefusal(answer, status, id) {
  assert.equal(answer.status, status, JSON.stringify(answer.body));
  assert.equal(answer.body.error.code, id);
}
async function passportOf(deployment, modelId) {
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

before(async () => {
  deployments["after-act"] = await startApplication("accessRecords_after", OWN, { ACCESS_REGIME: "after-act" });
  deployments["before-act"] = await startApplication("accessRecords_before", OWN, { ACCESS_REGIME: "before-act" });
});
after(async () => {
  for (const deployment of Object.values(deployments)) await deployment.stop();
});

// The table of decision D29, as section 12.2 states the table.
function admittedBy(regime, aspectKey) {
  if (aspectKey === "successors") return ["authorisedRecipient", "marketSurveillanceAuthority"];
  if (regime === "before-act") return [...RECIPIENT_ROLES];
  if (aspectKey === "product-condition") return ["purchaser", "purchaserAgent"];
  if (aspectKey === "lifecycle") return ["purchaser", "purchaserAgent", "responsibleOperator", "successor", "marketSurveillanceAuthority"];
  return [...RECIPIENT_ROLES];
}

for (const regime of ["after-act", "before-act"]) {
  test(`decision D29 (The access regime and the admitted roles): each cell of the table under ${regime}`, async (t) => {
    const deployment = deployments[regime];
    const model = (await deployment.call("POST", "/api/battery-models", { manufacturerPartId: unique("TCK-PART") })).body.data.model;
    const passport = await passportOf(deployment, model.id);
    for (const aspectKey of ASPECT_KEYS) {
      for (const role of RECIPIENT_ROLES) {
        const admitted = admittedBy(regime, aspectKey).includes(role);
        await t.test(`${aspectKey} with the role ${role} is ${admitted ? "admitted" : "refused with 422 ERR-LC-ROLE-NOT-ADMITTED"}`, async () => {
          const answer = await deployment.call("POST", `/api/passports/${passport.id}/access-records`, { recipientBpnl: PURCHASER, recipientRole: role, aspectKey });
          if (admitted) {
            assert.equal(answer.status, 201, JSON.stringify(answer.body));
            assert.deepStrictEqual(
              { recipientBpnl: answer.body.data.record.recipientBpnl, recipientRole: answer.body.data.record.recipientRole, aspectKey: answer.body.data.record.aspectKey, validTo: answer.body.data.record.validTo },
              { recipientBpnl: PURCHASER, recipientRole: role, aspectKey, validTo: null },
            );
            assert.deepStrictEqual(answer.body.data.exposure, { refreshed: true });
          } else {
            assertRefusal(answer, 422, "ERR-LC-ROLE-NOT-ADMITTED");
          }
        });
      }
    }
    await t.test("the constant ADMITTED_ROLES equals the table", () => {
      for (const aspectKey of ASPECT_KEYS) assert.deepStrictEqual([...ADMITTED_ROLES[regime][aspectKey]].sort(), admittedBy(regime, aspectKey).sort(), aspectKey);
    });
  });
}

test("ERR-LC-RECORD-EXISTS, EP-ACCESS-RECORD-END and the refusals of the record endpoints", async (t) => {
  const deployment = deployments["after-act"];
  const model = (await deployment.call("POST", "/api/battery-models", { manufacturerPartId: unique("TCK-PART") })).body.data.model;
  const passport = await passportOf(deployment, model.id);
  await t.test("a second open record of the same recipient, aspect key and role answers 409 ERR-LC-RECORD-EXISTS", async () => {
    const first = await deployment.call("POST", `/api/passports/${passport.id}/access-records`, { recipientBpnl: PURCHASER, recipientRole: "purchaser", aspectKey: "lifecycle" });
    assert.equal(first.status, 201);
    assertRefusal(await deployment.call("POST", `/api/passports/${passport.id}/access-records`, { recipientBpnl: PURCHASER, recipientRole: "purchaser", aspectKey: "lifecycle" }), 409, "ERR-LC-RECORD-EXISTS");
    const ended = await deployment.call("DELETE", `/api/passports/${passport.id}/access-records/${first.body.data.record.id}`);
    assert.equal(ended.status, 200, JSON.stringify(ended.body));
    assert.notEqual(ended.body.data.record.validTo, null);
    assertRefusal(await deployment.call("DELETE", `/api/passports/${passport.id}/access-records/${first.body.data.record.id}`), 409, "ERR-LC-STATUS-NOT-ADMITTED");
    assertRefusal(await deployment.call("DELETE", `/api/passports/${passport.id}/access-records/999999`), 404, "ERR-LC-RECORD-NOT-FOUND");
    assert.equal((await deployment.call("POST", `/api/passports/${passport.id}/access-records`, { recipientBpnl: PURCHASER, recipientRole: "purchaser", aspectKey: "lifecycle" })).status, 201);
  });
  await t.test("a body outside the schema answers 400, and an unknown passport 404", async () => {
    assertRefusal(await deployment.call("POST", `/api/passports/${passport.id}/access-records`, { recipientBpnl: PURCHASER, recipientRole: "owner", aspectKey: "lifecycle" }), 400, "ERR-LC-BODY-INVALID");
    assertRefusal(await deployment.call("POST", `/api/passports/${randomUUID()}/access-records`, { recipientBpnl: PURCHASER, recipientRole: "purchaser", aspectKey: "lifecycle" }), 404, "ERR-LC-PASSPORT-NOT-FOUND");
  });
});

test("decision D30 (The change of purchaser): EP-PURCHASER", async (t) => {
  const deployment = deployments["after-act"];
  const model = (await deployment.call("POST", "/api/battery-models", { manufacturerPartId: unique("TCK-PART") })).body.data.model;
  assert.equal((await deployment.call("PUT", `/api/battery-models/${model.id}/access-map`, fixture("accessMap.json"))).status, 201);
  const passport = await passportOf(deployment, model.id);
  await deployment.call("PUT", `/api/passports/${passport.id}/aspects/product-condition`, fixture("productCondition.json"));
  const readCondition = (bpnl) => deployment.asPartner(bpnl, "GET", `/api/passports/${passport.id}/submodels/product-condition/submodel`);
  await t.test("SwR-ACCESS-127: the first change opens the records of the purchaser and of the agent, the nameplate key included", async () => {
    const answer = await deployment.call("POST", `/api/passports/${passport.id}/purchaser`, { purchaserBpnl: PURCHASER, purchaserAgentBpnl: AGENT });
    assert.equal(answer.status, 200, JSON.stringify(answer.body));
    assert.deepStrictEqual(answer.body.data.closed, []);
    const opened = answer.body.data.opened.map((record) => [record.recipientBpnl, record.recipientRole, record.aspectKey]).sort();
    // The access map of the fixture marks $.LifeCycleStage of the nameplate and the four fields of the
    // product condition as legitimateInterestBattery.
    assert.deepStrictEqual(opened, [
      [PURCHASER, "purchaser", "digital-nameplate"],
      [PURCHASER, "purchaser", "lifecycle"],
      [PURCHASER, "purchaser", "product-condition"],
      [AGENT, "purchaserAgent", "digital-nameplate"],
      [AGENT, "purchaserAgent", "lifecycle"],
      [AGENT, "purchaserAgent", "product-condition"],
    ].sort());
    assert.deepStrictEqual(answer.body.data.exposure, { refreshed: true });
    assert.equal((await readCondition(PURCHASER)).status, 200);
  });
  await t.test("SwR-ACCESS-129: after the change the previous purchaser no longer reads the product condition, and the new purchaser reads it", async () => {
    const before = (await deployment.call("GET", `/api/passports/${passport.id}`)).body.data.passport;
    const rows = async () => deployment.query("SELECT * FROM passports WHERE id = $1", [passport.id]);
    const rowBefore = await rows();
    current = new Date(current.getTime() + 1000);
    const answer = await deployment.call("POST", `/api/passports/${passport.id}/purchaser`, { purchaserBpnl: NEW_PURCHASER });
    assert.equal(answer.status, 200);
    assert.deepStrictEqual(answer.body.data.closed.map((record) => [record.recipientBpnl, record.aspectKey]).sort(), [
      [AGENT, "digital-nameplate"],
      [AGENT, "lifecycle"],
      [AGENT, "product-condition"],
      [PURCHASER, "digital-nameplate"],
      [PURCHASER, "lifecycle"],
      [PURCHASER, "product-condition"],
    ].sort());
    assert.ok(answer.body.data.opened.every((record) => record.recipientBpnl === NEW_PURCHASER && record.recipientRole === "purchaser"));
    assertRefusal(await readCondition(PURCHASER), 403, "ERR-AC-ACCESS-GROUP-REFUSED");
    assertRefusal(await readCondition(AGENT), 403, "ERR-AC-ACCESS-GROUP-REFUSED");
    assert.equal((await readCondition(NEW_PURCHASER)).status, 200);
    const productOffer = (await deployment.offerStore.list()).find((offer) => offer.assetId === `product-condition-${passport.id}`);
    assert.deepStrictEqual(productOffer.allowedBpnls, [NEW_PURCHASER]);
    assert.deepStrictEqual((await deployment.call("GET", `/api/passports/${passport.id}`)).body.data.passport, before, "SwR-DATASET-195, SwR-DATASET-196 and SwR-DATASET-199: the passport record is unchanged");
    assert.deepStrictEqual(await rows(), rowBefore);
    assert.equal((await deployment.query("SELECT 1 FROM passport_lineage_links WHERE passport_id = $1", [passport.id])).length, 0);
    assert.equal((await deployment.query("SELECT 1 FROM passport_responsibility_intervals WHERE passport_id = $1", [passport.id])).length, 1);
  });
});
