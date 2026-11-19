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

// Tests every response of the four receiving endpoints, the status 401 included, against the response
// schema of its status in docs/api/openAPI.yaml.
//
// Requirements of the registry that this file verifies:
//   PrR-CXD-018 (Lifecycle notification API specified in docs/api/openAPI.yaml, OpenAPI 3.1.0)
//   PrR-CXD-020 (Notification responses 200, 4xx and 5xx with the error body of Q-409)
//   SwR-BACKEND-148 (Notification answered 200 when accepted, 4xx or 5xx otherwise)
//   SwR-BACKEND-206 (Lifecycle notification failures answered with envelope and result object)
// Lesson 10 of docs/lessons-from-a-first-implementation.md (the notification uses a format of the
// implementation). Section 11.5 of the implementation specification.
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
import { randomBytes } from "node:crypto";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { parse as parseYaml } from "yaml";

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
const OPERATIONS = ["NewPassportIssued", "BatteryRepaired", "BatteryBecameWaste", "PassportEnded"];
const SCHEMA_FILES = ["MessageHeader", "LifecycleNotification", "NewPassportIssued", "BatteryRepaired", "BatteryBecameWaste", "PassportEnded", "NotificationAccepted", "ErrorResponse"];
let provider;
let passport;
let wastePassport;
let validators;
let counter = 0;
const unique = (prefix) => `${prefix}-${process.pid}-${(counter += 1)}`;
const observed = new Map(OPERATIONS.map((operation) => [operation, new Set()]));

// The validator of the response schema of each status of each operation of the OpenAPI file.
function responseValidators() {
  const document = parseYaml(readFileSync(new URL("../../docs/api/openAPI.yaml", import.meta.url), "utf8"));
  const ajv = new Ajv2020({ strict: true, allErrors: true });
  addFormats(ajv);
  for (const name of SCHEMA_FILES) ajv.addSchema(JSON.parse(readFileSync(new URL(`../../docs/api/schemas/${name}.schema.json`, import.meta.url), "utf8")));
  const result = new Map();
  for (const operation of OPERATIONS) {
    const responses = document.paths[`/${operation}`].post.responses;
    const byStatus = new Map();
    for (const [status, response] of Object.entries(responses)) {
      const component = document.components.responses[response.$ref.split("/").pop()];
      const reference = component.content["application/json"].schema.$ref;
      byStatus.set(Number(status), ajv.getSchema(reference.slice("schemas/".length)));
    }
    result.set(operation, byStatus);
  }
  return result;
}

function message(operation, content, { sender = RECYCLER, receiver = PROVIDER, messageId = randomUUID() } = {}) {
  return { header: { messageId, context: `BatteryPass-BatteryPassLifecycleNotificationAPI-${operation}:1`, sentDateTime: "2026-06-15T09:30:00Z", senderBpn: sender, receiverBpn: receiver, version: "3.0.0" }, content };
}
function contentOf(operation, passportIdentifier) {
  switch (operation) {
    case "NewPassportIssued":
      return { passportIdentifier: unique("TCK-NEW"), catenaXId: randomUUID(), operation: "repurposing", operationDate: TODAY_INSTANT, predecessorPassportIdentifier: passportIdentifier };
    case "BatteryRepaired":
      return { passportIdentifier, repairDate: TODAY_INSTANT, repairCertificateCatenaXId: randomUUID() };
    case "BatteryBecameWaste":
      return { passportIdentifier, successorBpnl: SUCCESSOR, successorRole: "producer", date: TODAY_INSTANT };
    default:
      return { passportIdentifier, recyclingDate: TODAY_INSTANT, recyclerBpnl: RECYCLER };
  }
}

// Sends one request to a receiving endpoint and asserts that the response validates against the schema
// of its status in the OpenAPI file.
async function exchange(operation, { method = "POST", body, partner = RECYCLER, headers, operator = false, expected }) {
  const path = `/api/lifecycle-notifications/${operation}`;
  let answer;
  if (operator) answer = await provider.call(method, path, body);
  else if (partner === null) answer = await provider.raw(method, path, body, headers);
  else answer = await provider.asPartner(partner, method, path, body, headers);
  const validate = validators.get(operation).get(answer.status);
  assert.ok(validate, `${operation}: the OpenAPI file declares the status ${answer.status} (${JSON.stringify(answer.body)})`);
  assert.equal(validate(answer.body), true, `${operation} ${answer.status}: ${JSON.stringify(validate.errors)} ${JSON.stringify(answer.body)}`);
  if (expected !== undefined) assert.equal(answer.status === 200 ? answer.body.outcome : answer.body.error.code, expected);
  observed.get(operation).add(answer.status);
  return answer;
}

before(async () => {
  validators = responseValidators();
  provider = await startApplication("openApiContract", PROVIDER);
  const modelId = (await provider.call("POST", "/api/battery-models", { manufacturerPartId: unique("TCK-PART") })).body.data.model.id;
  const create = async () =>
    (await provider.call("POST", "/api/passports", { batteryModelId: modelId, batteryIdentifier: unique("TCK-BATTERY"), batteryCategory: "ev", facilityBpns: "BPNS00000000TCK1", dateOfManufacture: "2026-01-10", originalPurpose: "Traction battery", passportIdentifier: unique("TCK-PASSPORT") })).body.data.passport;
  passport = await create();
  wastePassport = await create();
  await provider.call("POST", "/api/lifecycle-events/waste", { passportIdentifier: wastePassport.passportIdentifier, dataProviderBpnl: PROVIDER, successorBpnl: SUCCESSOR, successorRole: "producer", wasteDate: TODAY_INSTANT });
});
after(async () => {
  if (provider) await provider.stop();
});

for (const operation of OPERATIONS) {
  test(`PrR-CXD-020 (Notification responses 200, 4xx and 5xx with the error body of Q-409): every response of ${operation} validates against docs/api/openAPI.yaml`, async (t) => {
    const valid = () => message(operation, contentOf(operation, operation === "PassportEnded" ? wastePassport.passportIdentifier : passport.passportIdentifier), { sender: operation === "NewPassportIssued" ? SECOND_LIFE : RECYCLER });
    const partner = operation === "NewPassportIssued" ? SECOND_LIFE : RECYCLER;
    await t.test("200: the outcomes applied and duplicate", async () => {
      // BatteryBecameWaste names a foreign passport, so that the passport of the file stays for the
      // further cases; PassportEnded ends the waste passport.
      const body = operation === "BatteryBecameWaste" ? message(operation, contentOf(operation, unique("TCK-FOREIGN"))) : valid();
      await exchange(operation, { body, partner, expected: operation === "BatteryBecameWaste" ? "recorded" : "applied" });
      await exchange(operation, { body, partner, expected: "duplicate" });
    });
    await t.test("400: ERR-RX-CONTENT-INVALID, ERR-RX-HEADER-INVALID, ERR-RX-CONTEXT-MISMATCH and ERR-RX-RECEIVER-MISMATCH", async () => {
      await exchange(operation, { body: { header: valid().header }, partner, expected: "ERR-RX-CONTENT-INVALID" });
      await exchange(operation, { body: '{"header":', partner, expected: "ERR-RX-CONTENT-INVALID" });
      const header = valid();
      header.header.sentDateTime = "2026-06-15 09:30:00Z";
      await exchange(operation, { body: header, partner, expected: "ERR-RX-HEADER-INVALID" });
      const context = valid();
      context.header.context = `BatteryPass-BatteryPassLifecycleNotificationAPI-${OPERATIONS.find((item) => item !== operation)}:1`;
      await exchange(operation, { body: context, partner, expected: "ERR-RX-CONTEXT-MISMATCH" });
      const receiver = valid();
      receiver.header.receiverBpn = SUCCESSOR;
      await exchange(operation, { body: receiver, partner, expected: "ERR-RX-RECEIVER-MISMATCH" });
    });
    await t.test("401 ERR-AC-UNAUTHENTICATED and 403 ERR-RX-SENDER-MISMATCH and ERR-AC-CAPABILITY-MISSING", async () => {
      await exchange(operation, { body: valid(), partner: null, expected: "ERR-AC-UNAUTHENTICATED" });
      await exchange(operation, { body: valid(), partner: SUCCESSOR, expected: "ERR-RX-SENDER-MISMATCH" });
      await exchange(operation, { body: valid(), operator: true, expected: "ERR-AC-CAPABILITY-MISSING" });
    });
    await t.test("405 ERR-RX-METHOD-NOT-ALLOWED and 413 ERR-RX-BODY-TOO-LARGE", async () => {
      await exchange(operation, { method: "GET", partner, expected: "ERR-RX-METHOD-NOT-ALLOWED" });
      const large = valid();
      large.content.passportIdentifier = "x".repeat(1024 * 1024 + 10);
      await exchange(operation, { body: large, partner, expected: "ERR-RX-BODY-TOO-LARGE" });
    });
    await t.test("409 ERR-RX-MESSAGE-ID-REUSED", async () => {
      const foreign = operation === "BatteryBecameWaste" || operation === "PassportEnded";
      const first = message(operation, contentOf(operation, foreign ? unique("TCK-FOREIGN") : passport.passportIdentifier), { sender: partner });
      await exchange(operation, { body: first, partner });
      const reused = structuredClone(first);
      reused.content.passportIdentifier = `${first.content.passportIdentifier}-other`;
      await exchange(operation, { body: reused, partner, expected: "ERR-RX-MESSAGE-ID-REUSED" });
    });
    await t.test("404 or 422: ERR-RX-PASSPORT-UNKNOWN, ERR-RX-STEP-REFUSED and ERR-RX-CHANGE-OUTSIDE-STEP", async () => {
      if (operation === "NewPassportIssued" || operation === "BatteryRepaired") {
        await exchange(operation, { body: message(operation, contentOf(operation, unique("TCK-UNKNOWN")), { sender: partner }), partner, expected: "ERR-RX-PASSPORT-UNKNOWN" });
      }
      // The waste passport refuses BatteryRepaired and BatteryBecameWaste, the ended waste passport
      // refuses PassportEnded, and a NewPassportIssued of a date after the current UTC date is refused.
      const refused = message(operation, { ...contentOf(operation, wastePassport.passportIdentifier), ...(operation === "NewPassportIssued" ? { operationDate: "2026-06-16T00:00:01Z" } : {}) }, { sender: partner });
      await exchange(operation, { body: refused, partner, expected: "ERR-RX-STEP-REFUSED" });
      const outside = valid();
      outside.content.status = "waste";
      await exchange(operation, { body: outside, partner, expected: "ERR-RX-CHANGE-OUTSIDE-STEP" });
    });
    await t.test("500 ERR-RX-INTERNAL: a passport identifier above the size of an index row fails in the database (section 19.2 point 4)", async () => {
      const identifier = randomBytes(1504).toString("hex");
      const content = { ...contentOf(operation, identifier) };
      if (operation === "NewPassportIssued") content.predecessorPassportIdentifier = identifier;
      const body = message(operation, content, { sender: partner });
      const answer = await exchange(operation, { body, partner });
      if (operation === "BatteryBecameWaste" || operation === "PassportEnded") assert.equal(answer.body.error.code, "ERR-RX-INTERNAL");
      else assert.equal(answer.body.error.code, "ERR-RX-PASSPORT-UNKNOWN");
    });
  });
}

test("the statuses observed on each receiving endpoint", () => {
  assert.deepStrictEqual([...observed.get("BatteryBecameWaste")].sort((a, b) => a - b), [200, 400, 401, 403, 405, 409, 413, 422, 500]);
  assert.deepStrictEqual([...observed.get("PassportEnded")].sort((a, b) => a - b), [200, 400, 401, 403, 405, 409, 413, 422, 500]);
  for (const operation of ["NewPassportIssued", "BatteryRepaired"]) assert.deepStrictEqual([...observed.get(operation)].sort((a, b) => a - b), [200, 400, 401, 403, 404, 405, 409, 413, 422]);
});
