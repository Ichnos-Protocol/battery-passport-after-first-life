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


// Criterion CX-0160-4-CAC-012 (Notification API) of Annex A of the proposal, section 4.3 items 1 to 7 and
// Tables 4.3 and 4.4. Requirements: PrR-CXD-028 (One conformance test per criterion CX-0160-4-CAC-001 to
// 016), SyR-CXD-092 (Notification APIs offered and called with HTTP POST only), SyR-CXD-096
// (Notification endpoints answer 200, or 4xx or 5xx on failure), SyR-LIFE-138 (Original issuer notified
// of a new passport under contract), SyR-LIFE-152 (Receiver without a notification asset recorded by
// the sender), SyR-LIFE-153 (One lifecycle notification per receiver and per passport) and SyR-LIFE-154
// (Notification changes a passport only by the receiver's assigned steps), with decision D11 (The
// receiver resolution behind a port) and decision D12 (No notification to the own company). Section 14.3
// of docs/architecture/implementation_plan.md; lesson 8 (one operation sends no notification) of
// section 14.4.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { after, before, test } from "node:test";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { parse } from "yaml";

import { startBinding } from "./lib/binding.mjs";
import { DATES, SUCCESSOR, USAGE_PURPOSE, expectData, givenNewPassport, givenOriginalPassport, passportOf, receivedOf, sentOf } from "./lib/scenario.mjs";

const SCHEMAS = new URL("../docs/api/schemas/", import.meta.url);
const OPENAPI = new URL("../docs/api/openAPI.yaml", import.meta.url);
const OPERATIONS = Object.freeze(["NewPassportIssued", "BatteryRepaired", "BatteryBecameWaste", "PassportEnded"]);
const TAXONOMY_NAME = "cx-taxo:BatteryPassLifecycleNotificationAPI";

const ajv = new Ajv2020({ strict: true, allErrors: true });
addFormats(ajv);
for (const name of readdirSync(SCHEMAS).filter((file) => file.endsWith(".schema.json"))) ajv.addSchema(JSON.parse(readFileSync(new URL(name, SCHEMAS), "utf8")));
const validateMessage = (operation, message) => {
  const validate = ajv.getSchema(`LifecycleNotification.schema.json#/$defs/${operation}`);
  return validate(message) ? [] : validate.errors;
};
const validateError = ajv.getSchema("ErrorResponse.schema.json");

let binding;
before(async () => {
  binding = await startBinding();
});
after(async () => {
  if (binding) await binding.stop();
});

const notificationAsset = async (participant, reader) => (await participant.catalogue(reader)).filter((offer) => offer.dctType === TAXONOMY_NAME);

test("CX-0160-4-CAC-012 (Notification API): the receiver offers one asset and one endpoint per operation and answers a refused message with a descriptive error body; the sender records each receiver without an asset and sends one notification per receiver and passport with the MessageHeader and the content of Tables 4.3 and 4.4 to the resolved receiver", async (t) => {
  const { provider, operator, recycler } = binding;
  const first = await givenOriginalPassport(provider);
  const second = await givenOriginalPassport(provider, { batteryModelId: first.batteryModelId });
  const repaired = await givenOriginalPassport(provider, { batteryModelId: first.batteryModelId });
  const ended = await givenOriginalPassport(provider, { batteryModelId: first.batteryModelId });
  const certificate = `urn:uuid:${randomUUID()}`;
  await recycler.registry.put({ id: certificate, idShort: "repairCertificate", specificAssetIds: [], submodelDescriptors: [] });
  const report = async (path, body) => expectData(await recycler.call("POST", `/api/lifecycle-events/${path}`, body), 202).notifications;
  const planned = {
    NewPassportIssued: (await givenNewPassport(operator, [first, second], "remanufacturing")).notifications,
    BatteryRepaired: await report("repair", { passportIdentifier: repaired.passportIdentifier, dataProviderBpnl: provider.bpnl, repairDate: DATES.repair, repairCertificateCatenaXId: certificate }),
    BatteryBecameWaste: await report("waste", { passportIdentifier: ended.passportIdentifier, dataProviderBpnl: provider.bpnl, successorBpnl: SUCCESSOR, successorRole: "producer", wasteDate: DATES.waste }),
  };
  const refused = await report("repair", { passportIdentifier: "TCK-PASSPORT-UNKNOWN", dataProviderBpnl: provider.bpnl, repairDate: DATES.repair, repairCertificateCatenaXId: certificate });
  await binding.settle();
  planned.PassportEnded = await report("recycling", { passportIdentifier: ended.passportIdentifier, dataProviderBpnl: provider.bpnl, nameplateManufacturerBpnl: provider.bpnl, receivedFromSuccessorBpnl: SUCCESSOR, recyclingDate: DATES.recycling });
  await binding.settle();
  const senderOf = { NewPassportIssued: operator, BatteryRepaired: recycler, BatteryBecameWaste: recycler, PassportEnded: recycler };
  const records = { operator: await sentOf(operator), recycler: await sentOf(recycler) };
  const recordOf = (operation, item) => records[operation === "NewPassportIssued" ? "operator" : "recycler"].find((record) => record.id === item.id);

  await t.test("section 4.3 item 1: each receiver offers exactly one connector asset with the taxonomy name, the version 1.0 and the usage purpose cx.circular.dpp:1", async () => {
    for (const participant of [provider, operator, recycler]) {
      const assets = await notificationAsset(participant, SUCCESSOR);
      assert.equal(assets.length, 1, participant.bpnl);
      assert.deepStrictEqual([assets[0].version, assets[0].semanticId], ["1.0", null]);
      assert.ok(assets[0].usagePurposes.includes(USAGE_PURPOSE));
    }
  });
  await t.test("section 4.3 item 2: one endpoint per operation, which accepts POST only and answers a GET with 405 and a descriptive error body; an unknown operation answers 404", async () => {
    const paths = Object.keys(parse(readFileSync(OPENAPI, "utf8")).paths);
    assert.deepStrictEqual(paths, OPERATIONS.map((operation) => `/${operation}`));
    const [asset] = await notificationAsset(provider, recycler.bpnl);
    for (const operation of OPERATIONS) {
      const answer = await provider.asPartner(recycler).get(`${asset.path}/${operation}`);
      assert.deepStrictEqual([answer.outcome, answer.status, answer.body.error.code], ["provider_refused", 405, "ERR-RX-METHOD-NOT-ALLOWED"], operation);
      assert.equal(validateError(answer.body), true, JSON.stringify(validateError.errors));
    }
    const unknown = await provider.asPartner(recycler).get(`${asset.path}/BatteryDisassembled`);
    assert.deepStrictEqual([unknown.status, unknown.body.error.code], [404, "ERR-RX-OPERATION-UNKNOWN"]);
  });
  await t.test("section 4.3 item 4: each sent message holds the MessageHeader with the context of Table 4.3 and the content of Table 4.4", () => {
    for (const operation of OPERATIONS) {
      for (const item of planned[operation]) {
        const record = recordOf(operation, item);
        assert.deepStrictEqual(validateMessage(operation, record.message), [], `${operation} to ${record.receiverBpnl}`);
        const { header } = record.message;
        assert.deepStrictEqual(
          [header.messageId, header.context, header.senderBpn, header.receiverBpn, header.version],
          [record.messageId, `BatteryPass-BatteryPassLifecycleNotificationAPI-${operation}:1`, senderOf[operation].bpnl, record.receiverBpnl, "3.0.0"],
        );
      }
    }
  });
  await t.test("section 4.3 item 5: one notification per receiver and per passport, two for a remanufacturing from two passports of one data provider, and none for the own company", () => {
    assert.deepStrictEqual(planned.NewPassportIssued.map((item) => [item.receiverBpnl, item.passportIdentifier]).sort(), [[provider.bpnl, first.passportIdentifier], [provider.bpnl, second.passportIdentifier]].sort());
    assert.deepStrictEqual(planned.BatteryRepaired.map((item) => item.receiverBpnl), [provider.bpnl]);
    assert.deepStrictEqual(planned.BatteryBecameWaste.map((item) => item.receiverBpnl).sort(), [provider.bpnl, SUCCESSOR].sort());
    assert.deepStrictEqual(planned.PassportEnded.map((item) => item.receiverBpnl).sort(), [provider.bpnl, SUCCESSOR].sort(), "the data provider and the nameplate manufacturer are one receiver");
    for (const operation of OPERATIONS) assert.equal(planned[operation].some((item) => item.receiverBpnl === senderOf[operation].bpnl), false);
  });
  await t.test("section 4.3 item 5: each record of a delivered notification holds the resolved decentralised identifier and the connector address of the receiver", () => {
    const delivered = OPERATIONS.flatMap((operation) => planned[operation].map((item) => recordOf(operation, item))).filter((record) => record.receiverBpnl === provider.bpnl);
    assert.equal(delivered.length, 5);
    for (const record of delivered) {
      assert.equal(record.outcome, "sent");
      assert.match(record.receiverDid, /^did:/);
      assert.match(record.receiverConnectorUrl, /^https?:\/\//);
    }
    assert.equal(new Set(delivered.map((record) => `${record.receiverDid} ${record.receiverConnectorUrl}`)).size, 1);
  });
  await t.test("section 4.3 item 3: the sender records a receiver without a resolvable notification asset with the date of the attempt and sends nothing", () => {
    for (const operation of ["BatteryBecameWaste", "PassportEnded"]) {
      const record = recordOf(operation, planned[operation].find((item) => item.receiverBpnl === SUCCESSOR));
      assert.deepStrictEqual([record.outcome, record.httpStatus, record.receiverDid, record.attempts], ["receiver_unresolved", null, null, 1], operation);
      assert.equal(typeof record.attemptedAt, "string");
      assert.equal(typeof record.cause, "string");
    }
  });
  await t.test("section 4.3 items 6 and 7: the receiver applies only its assigned steps and refuses a message that it cannot process with a 4xx status and the cause of its error body", async () => {
    const received = await receivedOf(provider);
    for (const operation of OPERATIONS) {
      for (const item of planned[operation].filter((entry) => entry.receiverBpnl === provider.bpnl)) {
        assert.equal(received.find((record) => record.messageId === recordOf(operation, item).messageId).outcome, "applied", operation);
      }
    }
    assert.deepStrictEqual([(await passportOf(provider, first.id)).lifecycleStatus, (await passportOf(provider, repaired.id)).lifecycleStatus, (await passportOf(provider, ended.id)).lifecycleStatus], ["original", "re-used", "waste"]);
    const record = records.recycler.find((item) => item.id === refused[0].id);
    assert.deepStrictEqual([record.outcome, record.httpStatus, record.cause], ["receiver_refused", 404, "ERR-RX-PASSPORT-UNKNOWN"]);
  });
});
