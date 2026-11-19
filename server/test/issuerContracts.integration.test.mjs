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

// Tests the sharing of individual battery information with the original issuer through
// EP-PROVIDER-CONTRACT, EP-ISSUER-CONTRACT, EP-CONTRACT-END, EP-CONTRACT-PULL, EP-RECEIVED-INFORMATION and
// EP-BATTERY-INFORMATION, with two applications on one memory transport: the second-life operator
// (BPNL00000000TCK2), which offers the information, and the original issuer (BPNL00000000TCK1).
//
// Requirements of the registry that this file verifies:
//   SwR-CXCLIENT-166 (Point 4 offer for the passport issuer gated by a recorded contract)
//   SwR-CXCLIENT-167 (Issuer's negotiation for point 4 information run without a user step)
//   SwR-CXCLIENT-168 (Point 4 transfer to the issuer stored without a user step)
//   SwR-CXCLIENT-177 (Second-life battery's point 4 offer to the original data provider)
//   SyR-PASS-215 (Individual battery information shared with the passport issuer under contract)
//   SyR-CXD-218 (Issuer's contract negotiation for individual battery information without a manual step)
//   SyR-CXD-219 (Transfer of individual battery information to the issuer without a manual step)
//   SyR-PASS-233 (Degradation data of a second-life battery offered to the original issuer)
// Decision D38 (The sharing of individual battery information).
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


const ISSUER = "BPNL00000000TCK1";
const OPERATOR = "BPNL00000000TCK2";
const OTHER = "BPNL00000000TCK3";
const ORIGINAL_MODEL = randomUUID();
let offering;
let issuer;
let newPassport;
let counter = 0;
const unique = (prefix) => `${prefix}-${process.pid}-${(counter += 1)}`;

function assertRefusal(answer, status, id) {
  assert.equal(answer.status, status, JSON.stringify(answer.body));
  assert.equal(answer.body.error.code, id);
}
async function issuerState() {
  return { passports: await issuer.query("SELECT * FROM passports ORDER BY id"), payloads: await issuer.query("SELECT * FROM passport_aspect_payloads ORDER BY passport_id, aspect_key") };
}

before(async () => {
  offering = await startApplication("issuerContracts_operator", OPERATOR);
  issuer = await startApplication("issuerContracts_issuer", ISSUER);
  const model = (await offering.call("POST", "/api/battery-models", { manufacturerPartId: unique("TCK-PART"), originalModel: { catenaXId: ORIGINAL_MODEL, manufacturerBpnl: ISSUER } })).body.data.model;
  const batteryIdentifier = unique("TCK-BATTERY");
  const created = await offering.call("POST", "/api/passports/new-passport", {
    operation: "repurposing",
    predecessors: [{ passportIdentifier: unique("TCK-PASSPORT"), catenaXId: randomUUID(), dataProviderBpnl: ISSUER, batteryIdentifier, lifeCycleStage: "original", originalPurpose: "Traction battery", originalModelCatenaXId: ORIGINAL_MODEL }],
    batteryModelId: model.id,
    batteryIdentifier,
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
  assert.equal(created.status, 201, JSON.stringify(created.body));
  newPassport = created.body.data.passport;
});
after(async () => {
  for (const deployment of [issuer, offering]) if (deployment) await deployment.stop();
});

test("SwR-CXCLIENT-166 (Point 4 offer for the passport issuer gated by a recorded contract): EP-PROVIDER-CONTRACT", async (t) => {
  await t.test("a passport without a stored product condition answers 404 ERR-LC-SUBMODEL-NOT-FOUND", async () => {
    assertRefusal(await offering.call("POST", "/api/issuer-contracts/provider", { passportIdentifier: newPassport.passportIdentifier, issuerBpnl: ISSUER }), 404, "ERR-LC-SUBMODEL-NOT-FOUND");
  });
  await t.test("the provider contract of an own passport answers 201, and the offer admits only the issuer", async () => {
    await offering.call("PUT", `/api/passports/${newPassport.id}/aspects/product-condition`, fixture("productCondition.json"));
    const answer = await offering.call("POST", "/api/issuer-contracts/provider", { passportIdentifier: newPassport.passportIdentifier, issuerBpnl: ISSUER });
    assert.equal(answer.status, 201, JSON.stringify(answer.body));
    const contract = answer.body.data.contract;
    assert.deepStrictEqual([contract.side, contract.issuerBpnl, contract.providerBpnl, contract.passportId, contract.batteryIdentifier, contract.pullState, contract.validTo], ["provider", ISSUER, OPERATOR, newPassport.id, newPassport.batteryIdentifier, null, null]);
    const offer = (await offering.offerStore.list()).find((item) => item.assetId === `battery-information-${contract.id}`);
    assert.deepStrictEqual(offer.allowedBpnls, [ISSUER]);
    assert.deepStrictEqual(offer.usagePurposes, ["cx.circular.dpp:1"]);
    assert.equal(offer.passportIdentifier, newPassport.passportIdentifier);
  });
  await t.test("a second open contract answers 409 ERR-LC-CONTRACT-EXISTS", async () => {
    assertRefusal(await offering.call("POST", "/api/issuer-contracts/provider", { passportIdentifier: newPassport.passportIdentifier, issuerBpnl: ISSUER }), 409, "ERR-LC-CONTRACT-EXISTS");
  });
  await t.test("ERR-LC-ISSUER-NOT-LINKED: an issuer of no predecessor, a product condition for an own passport, and a foreign passport without a product condition", async () => {
    assertRefusal(await offering.call("POST", "/api/issuer-contracts/provider", { passportIdentifier: newPassport.passportIdentifier, issuerBpnl: OTHER }), 422, "ERR-LC-ISSUER-NOT-LINKED");
    assertRefusal(await offering.call("POST", "/api/issuer-contracts/provider", { passportIdentifier: newPassport.passportIdentifier, issuerBpnl: OTHER, productCondition: fixture("productCondition.json") }), 422, "ERR-LC-ISSUER-NOT-LINKED");
    assertRefusal(await offering.call("POST", "/api/issuer-contracts/provider", { passportIdentifier: unique("TCK-FOREIGN"), issuerBpnl: ISSUER }), 422, "ERR-LC-ISSUER-NOT-LINKED");
  });
  await t.test("the purchaser form stores the supplied product condition, and a product condition outside its schema answers 400", async () => {
    const answer = await offering.call("POST", "/api/issuer-contracts/provider", { passportIdentifier: unique("TCK-FOREIGN"), issuerBpnl: ISSUER, productCondition: fixture("productCondition.json") });
    assert.equal(answer.status, 201, JSON.stringify(answer.body));
    assert.equal(answer.body.data.contract.passportId, null);
    assertRefusal(await offering.call("POST", "/api/issuer-contracts/provider", { passportIdentifier: unique("TCK-FOREIGN"), issuerBpnl: ISSUER, productCondition: { StateOfCharge: "high" } }), 400, "ERR-LC-BODY-INVALID");
    assertRefusal(await offering.call("POST", "/api/issuer-contracts/provider", { passportIdentifier: unique("TCK-FOREIGN"), providerBpnl: OPERATOR, batteryIdentifier: "TCK-BATTERY-X" }), 400, "ERR-LC-BODY-INVALID");
  });
});

test("SwR-CXCLIENT-167 and SwR-CXCLIENT-168: the pull of the issuer without a further request", async (t) => {
  const before = await issuerState();
  let contractId;
  await t.test("EP-ISSUER-CONTRACT answers 201 with the pull state pending", async () => {
    const answer = await issuer.call("POST", "/api/issuer-contracts/issuer", { passportIdentifier: newPassport.passportIdentifier, providerBpnl: OPERATOR, batteryIdentifier: newPassport.batteryIdentifier });
    assert.equal(answer.status, 201, JSON.stringify(answer.body));
    contractId = answer.body.data.contract.id;
    assert.deepStrictEqual([answer.body.data.contract.side, answer.body.data.contract.pullState, answer.body.data.contract.issuerBpnl], ["issuer", "pending", ISSUER]);
    assertRefusal(await issuer.call("POST", "/api/issuer-contracts/issuer", { passportIdentifier: newPassport.passportIdentifier, providerBpnl: OPERATOR, batteryIdentifier: newPassport.batteryIdentifier }), 409, "ERR-LC-CONTRACT-EXISTS");
  });
  await t.test("one run of the worker stores one received record with the battery identifier, the agreement identifier and the time of receipt", async () => {
    await issuer.worker.tick();
    const answer = await issuer.call("GET", `/api/issuer-contracts/${contractId}/received`);
    assert.equal(answer.status, 200, JSON.stringify(answer.body));
    assert.equal(answer.body.data.contract.pullState, "received");
    assert.equal(answer.body.data.received.length, 1);
    const [record] = answer.body.data.received;
    assert.equal(record.passportIdentifier, newPassport.passportIdentifier);
    assert.equal(record.batteryIdentifier, newPassport.batteryIdentifier);
    assert.match(record.agreementId, /^memory-agreement-/);
    assert.equal(record.receivedAt, clock.now().toISOString());
    assert.deepStrictEqual(record.payload, fixture("productCondition.json"));
    await issuer.worker.tick();
    assert.equal((await issuer.call("GET", `/api/issuer-contracts/${contractId}/received`)).body.data.received.length, 1, "a received contract is not pulled again");
  });
  await t.test("decision D38: no passport and no payload changes on the issuer's deployment", async () => {
    assert.deepStrictEqual(await issuerState(), before);
  });
  await t.test("another partner, the operator subject and an unknown contract are refused the battery information", async () => {
    const [offer] = (await offering.offerStore.list()).filter((item) => item.assetId.startsWith("battery-information-") && item.passportIdentifier === newPassport.passportIdentifier);
    const contract = offer.assetId.slice("battery-information-".length);
    assert.equal((await offering.asPartner(ISSUER, "GET", `/api/issuer-contracts/${contract}/battery-information`)).status, 200);
    assertRefusal(await offering.asPartner(OTHER, "GET", `/api/issuer-contracts/${contract}/battery-information`), 403, "ERR-AC-ACCESS-GROUP-REFUSED");
    assertRefusal(await offering.call("GET", `/api/issuer-contracts/${contract}/battery-information`), 403, "ERR-AC-CAPABILITY-MISSING");
    assertRefusal(await offering.asPartner(ISSUER, "GET", `/api/issuer-contracts/${randomUUID()}/battery-information`), 404, "ERR-LC-CONTRACT-NOT-FOUND");
  });
  await t.test("an ended provider contract withdraws its offer and starts no transfer; an ended issuer contract answers 409 to a pull", async () => {
    const [offer] = (await offering.offerStore.list()).filter((item) => item.assetId.startsWith("battery-information-") && item.passportIdentifier === newPassport.passportIdentifier);
    const providerContract = offer.assetId.slice("battery-information-".length);
    const ended = await offering.call("DELETE", `/api/issuer-contracts/${providerContract}`);
    assert.equal(ended.status, 200, JSON.stringify(ended.body));
    assert.notEqual(ended.body.data.contract.validTo, null);
    assert.equal((await offering.offerStore.list()).some((item) => item.assetId === offer.assetId), false);
    assertRefusal(await offering.call("DELETE", `/api/issuer-contracts/${providerContract}`), 409, "ERR-LC-CONTRACT-ENDED");
    assertRefusal(await offering.asPartner(ISSUER, "GET", `/api/issuer-contracts/${providerContract}/battery-information`), 409, "ERR-LC-CONTRACT-ENDED");
    const pull = await issuer.call("POST", `/api/issuer-contracts/${contractId}/pulls`);
    assert.equal(pull.status, 202, JSON.stringify(pull.body));
    assert.equal(pull.body.data.contract.pullState, "pending");
    await issuer.worker.tick();
    const after = (await issuer.call("GET", `/api/issuer-contracts/${contractId}/received`)).body.data;
    assert.equal(after.contract.pullState, "no_asset");
    assert.equal(after.received.length, 1);
    assert.equal((await issuer.call("DELETE", `/api/issuer-contracts/${contractId}`)).status, 200);
    assertRefusal(await issuer.call("POST", `/api/issuer-contracts/${contractId}/pulls`), 409, "ERR-LC-CONTRACT-ENDED");
    assertRefusal(await issuer.call("POST", `/api/issuer-contracts/${randomUUID()}/pulls`), 404, "ERR-LC-CONTRACT-NOT-FOUND");
  });
});

test("decision D73 (The exposure of a battery information offer) [waits for the owner]: the field exposure and the repeated end", async (t) => {
  let contract;
  let offer;
  await t.test("EP-PROVIDER-CONTRACT answers the field exposure with the result of the publication of the offer", async () => {
    const answer = await offering.call("POST", "/api/issuer-contracts/provider", { passportIdentifier: unique("TCK-FOREIGN"), issuerBpnl: ISSUER, productCondition: fixture("productCondition.json") });
    assert.equal(answer.status, 201, JSON.stringify(answer.body));
    assert.deepStrictEqual(Object.keys(answer.body.data).sort(), ["contract", "exposure"]);
    assert.deepStrictEqual(answer.body.data.exposure, { refreshed: true });
    contract = answer.body.data.contract;
    offer = (await offering.offerStore.list()).find((item) => item.assetId === `battery-information-${contract.id}`);
    assert.ok(offer);
  });
  await t.test("EP-CONTRACT-END answers the field exposure with the result of the withdrawal, and a repeated end withdraws an offer that is still published and answers 409 ERR-LC-CONTRACT-ENDED", async () => {
    const ended = await offering.call("DELETE", `/api/issuer-contracts/${contract.id}`);
    assert.equal(ended.status, 200, JSON.stringify(ended.body));
    assert.deepStrictEqual(Object.keys(ended.body.data).sort(), ["contract", "exposure"]);
    assert.deepStrictEqual(ended.body.data.exposure, { refreshed: true });
    assert.equal((await offering.offerStore.list()).some((item) => item.assetId === offer.assetId), false);
    // The offer is published again, as after a withdrawal that failed.
    await offering.offerStore.publish(offer);
    assertRefusal(await offering.call("DELETE", `/api/issuer-contracts/${contract.id}`), 409, "ERR-LC-CONTRACT-ENDED");
    assert.equal((await offering.offerStore.list()).some((item) => item.assetId === offer.assetId), false, "the repeated end withdraws the offer again");
  });
});
