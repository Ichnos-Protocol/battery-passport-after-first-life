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

// Tests the transport contract of section 9.2.5 with one test code for every implementation: the five
// outcomes of send and the five outcomes of pull. Phase P5 runs the code against the memory transport;
// phase P7 adds the connector transport with a stubbed fetch.
//
// Requirements of the registry that this file verifies:
//   SwR-CXCLIENT-059 (Notifications built to CX-0151 and sent as JSON POST)
//   SwR-CXCLIENT-183 (Sender's record of a receiver without an asset or a contract)
//   SwR-BGWORK-010 (Lifecycle notifications sent unchanged as JSON POST through the connector)
// Decision D41 (Authentication without an identity provider).
import assert from "node:assert/strict";
import { after, test } from "node:test";

import express from "express";

import { createMemoryOfferStore } from "../src/connector/memoryOfferStore.mjs";
import { createMemoryTransport } from "../src/connector/memoryTransport.mjs";
import { buildBatteryInformationOffer, buildNotificationAssetOffer } from "../src/connector/policyBuilder.mjs";

const SENDER = "BPNL00000000TCK3";
const RECEIVER = "BPNL00000000TCK1";
const SILENT = "BPNL00000000TCK2";
const KEY = "data-plane-key-0123456789abcdefghijkl";
const CONTRACT_ID = "b7e4d2a9-1c3f-4e5a-8b6d-0f9e8d7c6b5a";
const SEMANTIC_ID = "urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#ProductCondition";
const MESSAGE = { header: { messageId: "urn:uuid:0b2f1c7e-6d3a-4f5b-8c9d-1e2f3a4b5c6d", senderBpn: SENDER, receiverBpn: RECEIVER }, content: { passportIdentifier: "TCK-PASSPORT-A" } };

// The receiver records every request and answers by the operation: BatteryRepaired 200, PassportEnded
// 422, and the battery information of the contract 200 or, for a refused contract id, 403.
const received = [];
const receiver = express();
receiver.use(express.json());
receiver.post("/api/lifecycle-notifications/:operation", (req, res) => {
  received.push({ method: req.method, path: req.path, headers: req.headers, body: req.body });
  if (req.params.operation === "PassportEnded") res.status(422).json({ success: false, error: { code: "ERR-RX-STEP-REFUSED", message: "refused" } });
  else res.status(200).json({ messageId: req.body.header.messageId, outcome: "applied" });
});
receiver.get("/api/issuer-contracts/:contractId/battery-information", (req, res) => {
  received.push({ method: req.method, path: req.path, headers: req.headers });
  if (req.params.contractId === CONTRACT_ID) res.status(200).json({ StateOfCharge: { StateOfChargeValue: 64 } });
  else res.status(403).json({ success: false, error: { code: "ERR-AC-ACCESS-GROUP-REFUSED", message: "refused" } });
});
// A participant whose connector drops every connection.
const silent = express();
silent.use((req) => req.socket.destroy());

function network() {
  const receiverStore = createMemoryOfferStore();
  const silentStore = createMemoryOfferStore();
  const participants = new Map([
    ["http://receiver.memory.invalid", { bpnl: RECEIVER, app: receiver, dataPlaneKey: KEY, dataPlaneKeyHeader: "x-api-key", partnerBpnHeader: "edc-bpn" }],
    ["http://silent.memory.invalid", { bpnl: SILENT, app: silent, dataPlaneKey: KEY, dataPlaneKeyHeader: "x-api-key", partnerBpnHeader: "edc-bpn" }],
  ]);
  const offerStores = new Map([
    [RECEIVER, receiverStore],
    [SILENT, silentStore],
  ]);
  return { participants, offerStores, receiverStore, silentStore };
}

const transports = [];
const IMPLEMENTATIONS = [
  [
    "the memory transport",
    (setup) => {
      const transport = createMemoryTransport({ participants: setup.participants, offerStores: setup.offerStores, ownBpnl: SENDER });
      transports.push(transport);
      return transport;
    },
  ],
];

after(async () => {
  for (const transport of transports) await transport.close();
});

for (const [name, create] of IMPLEMENTATIONS) {
  test(`SwR-BGWORK-010 (Lifecycle notifications sent unchanged as JSON POST through the connector): the five outcomes of send against ${name}`, async (t) => {
    const setup = network();
    const transport = create(setup);
    await setup.receiverStore.publish(buildNotificationAssetOffer({ allowedBpnls: null }));
    await setup.silentStore.publish(buildNotificationAssetOffer({ allowedBpnls: null }));
    await t.test("sent: the receiver answers 200, and the message, the method, the content type and the two headers reach the receiver", async () => {
      received.length = 0;
      const result = await transport.send({ receiverBpnl: RECEIVER, connectorUrl: "http://receiver.memory.invalid", operation: "BatteryRepaired", message: MESSAGE });
      assert.equal(result.outcome, "sent");
      assert.equal(result.httpStatus, 200);
      assert.deepStrictEqual(result.body, { messageId: MESSAGE.header.messageId, outcome: "applied" });
      assert.equal(received.length, 1);
      assert.equal(received[0].method, "POST");
      assert.equal(received[0].path, "/api/lifecycle-notifications/BatteryRepaired");
      assert.deepStrictEqual(received[0].body, MESSAGE);
      assert.equal(received[0].headers["content-type"], "application/json");
      assert.equal(received[0].headers["x-api-key"], KEY);
      assert.equal(received[0].headers["edc-bpn"], SENDER);
    });
    await t.test("receiver_refused: the receiver answers 422, and the status and the body are returned unchanged", async () => {
      const result = await transport.send({ receiverBpnl: RECEIVER, connectorUrl: "http://receiver.memory.invalid", operation: "PassportEnded", message: MESSAGE });
      assert.equal(result.outcome, "receiver_refused");
      assert.equal(result.httpStatus, 422);
      assert.equal(result.body.error.code, "ERR-RX-STEP-REFUSED");
    });
    await t.test("transport_failed: no answer of the receiver", async () => {
      const result = await transport.send({ receiverBpnl: SILENT, connectorUrl: "http://silent.memory.invalid", operation: "BatteryRepaired", message: MESSAGE });
      assert.equal(result.outcome, "transport_failed");
      assert.equal(result.httpStatus, null);
      assert.equal(typeof result.cause, "string");
      const unknown = await transport.send({ receiverBpnl: RECEIVER, connectorUrl: "http://unknown.memory.invalid", operation: "BatteryRepaired", message: MESSAGE });
      assert.equal(unknown.outcome, "transport_failed");
    });
    await t.test("contract_refused: the access policy of the notification asset does not admit the sender", async () => {
      await setup.receiverStore.publish(buildNotificationAssetOffer({ allowedBpnls: ["BPNL00000000TCK2"] }));
      const result = await transport.send({ receiverBpnl: RECEIVER, connectorUrl: "http://receiver.memory.invalid", operation: "BatteryRepaired", message: MESSAGE });
      assert.equal(result.outcome, "contract_refused");
    });
    await t.test("no_asset: the receiver offers no lifecycle notification asset, and no request reaches the receiver", async () => {
      await setup.receiverStore.withdraw("asset-lifecycle-notification-1.0");
      received.length = 0;
      const result = await transport.send({ receiverBpnl: RECEIVER, connectorUrl: "http://receiver.memory.invalid", operation: "BatteryRepaired", message: MESSAGE });
      assert.equal(result.outcome, "no_asset");
      assert.equal(received.length, 0);
    });
  });

  test(`SwR-CXCLIENT-183 (Sender's record of a receiver without an asset or a contract): the five outcomes of pull against ${name}`, async (t) => {
    const setup = network();
    const transport = create(setup);
    const pull = (overrides = {}) =>
      transport.pull({ providerBpnl: RECEIVER, connectorUrl: "http://receiver.memory.invalid", semanticId: SEMANTIC_ID, passportIdentifier: "TCK-PASSPORT-A", ...overrides });
    await t.test("no_asset: the provider offers no asset of the semantic identifier and the passport identifier", async () => {
      assert.equal((await pull()).outcome, "no_asset");
    });
    await t.test("received: the offer admits the consumer, and the body of the provider is returned with an agreement identifier", async () => {
      await setup.receiverStore.publish(buildBatteryInformationOffer({ contractId: CONTRACT_ID, issuerBpnl: SENDER, passportIdentifier: "TCK-PASSPORT-A", semanticId: SEMANTIC_ID }));
      received.length = 0;
      const result = await pull();
      assert.equal(result.outcome, "received");
      assert.deepStrictEqual(result.body, { StateOfCharge: { StateOfChargeValue: 64 } });
      assert.equal(typeof result.agreementId, "string");
      assert.equal(received[0].method, "GET");
      assert.equal(received[0].path, `/api/issuer-contracts/${CONTRACT_ID}/battery-information`);
      assert.equal(received[0].headers["edc-bpn"], SENDER);
      assert.equal(received[0].headers["x-api-key"], KEY);
    });
    await t.test("contract_refused: the access policy of the offer admits another participant only", async () => {
      assert.equal((await pull({ passportIdentifier: "TCK-PASSPORT-B" })).outcome, "no_asset");
      await setup.receiverStore.publish(buildBatteryInformationOffer({ contractId: "c0ffee00-1c3f-4e5a-8b6d-0f9e8d7c6b5a", issuerBpnl: "BPNL00000000TCK2", passportIdentifier: "TCK-PASSPORT-B", semanticId: SEMANTIC_ID }));
      assert.equal((await pull({ passportIdentifier: "TCK-PASSPORT-B" })).outcome, "contract_refused");
    });
    await t.test("provider_refused: the provider answers 403", async () => {
      await setup.receiverStore.publish(buildBatteryInformationOffer({ contractId: "c0ffee00-1c3f-4e5a-8b6d-0f9e8d7c6b5a", issuerBpnl: SENDER, passportIdentifier: "TCK-PASSPORT-C", semanticId: SEMANTIC_ID }));
      const result = await pull({ passportIdentifier: "TCK-PASSPORT-C" });
      assert.equal(result.outcome, "provider_refused");
      assert.equal(result.body.error.code, "ERR-AC-ACCESS-GROUP-REFUSED");
    });
    await t.test("transport_failed: no answer of the provider", async () => {
      await setup.silentStore.publish(buildBatteryInformationOffer({ contractId: CONTRACT_ID, issuerBpnl: SENDER, passportIdentifier: "TCK-PASSPORT-A", semanticId: SEMANTIC_ID }));
      assert.equal((await pull({ providerBpnl: SILENT, connectorUrl: "http://silent.memory.invalid" })).outcome, "transport_failed");
    });
  });
}

// A receiver whose status the test chooses, for the status classes of version 10 of the specification.
const answered = { status: 500, code: "ERR-RX-INTERNAL" };
const chosen = express();
chosen.use((req, res) => {
  received.push({ method: req.method, path: req.path, headers: req.headers });
  res.status(answered.status).json({ success: false, error: { code: answered.code, message: "refused" } });
});

for (const [name, create] of IMPLEMENTATIONS) {
  test(`finding R45-003 (the status classes of the transport contract): an answer of the class 5xx is transport_failed with its status, and another status is final, against ${name}`, async (t) => {
    const setup = network();
    const chosenStore = createMemoryOfferStore();
    setup.participants.set("http://chosen.memory.invalid", { bpnl: "BPNL00000000TCK5", app: chosen, dataPlaneKey: KEY, dataPlaneKeyHeader: "x-api-key", partnerBpnHeader: "edc-bpn" });
    setup.offerStores.set("BPNL00000000TCK5", chosenStore);
    await chosenStore.publish(buildNotificationAssetOffer({ allowedBpnls: null }));
    await chosenStore.publish(buildBatteryInformationOffer({ contractId: CONTRACT_ID, issuerBpnl: SENDER, passportIdentifier: "TCK-PASSPORT-A", semanticId: SEMANTIC_ID }));
    const transport = create(setup);
    const send = () => transport.send({ receiverBpnl: "BPNL00000000TCK5", connectorUrl: "http://chosen.memory.invalid", operation: "BatteryRepaired", message: MESSAGE });
    const pull = () => transport.pull({ providerBpnl: "BPNL00000000TCK5", connectorUrl: "http://chosen.memory.invalid", semanticId: SEMANTIC_ID, passportIdentifier: "TCK-PASSPORT-A" });
    await t.test("send: a receiver that answers 500 gives transport_failed with the status 500 and the refusal id as the cause", async () => {
      Object.assign(answered, { status: 500, code: "ERR-RX-INTERNAL" });
      const result = await send();
      assert.deepStrictEqual([result.outcome, result.httpStatus, result.cause], ["transport_failed", 500, "ERR-RX-INTERNAL"]);
      assert.equal(result.body.error.code, "ERR-RX-INTERNAL");
    });
    await t.test("send: a receiver that answers 404 gives receiver_refused with the status 404", async () => {
      Object.assign(answered, { status: 404, code: "ERR-RX-PASSPORT-UNKNOWN" });
      const result = await send();
      assert.deepStrictEqual([result.outcome, result.httpStatus, result.cause], ["receiver_refused", 404, "ERR-RX-PASSPORT-UNKNOWN"]);
    });
    await t.test("pull: a provider that answers 503 gives transport_failed, and a provider that answers 404 gives provider_refused", async () => {
      Object.assign(answered, { status: 503, code: "ERR-RX-INTERNAL" });
      assert.equal((await pull()).outcome, "transport_failed");
      Object.assign(answered, { status: 404, code: "ERR-LC-RECORD-NOT-FOUND" });
      assert.equal((await pull()).outcome, "provider_refused");
    });
    await t.test("each transport presents the Business Partner Number of its own participant in the header of D41", async () => {
      Object.assign(answered, { status: 500, code: "ERR-RX-INTERNAL" });
      const other = createMemoryTransport({ participants: setup.participants, offerStores: setup.offerStores, ownBpnl: "BPNL00000000TCK2" });
      transports.push(other);
      received.length = 0;
      await send();
      await other.send({ receiverBpnl: "BPNL00000000TCK5", connectorUrl: "http://chosen.memory.invalid", operation: "BatteryRepaired", message: MESSAGE });
      assert.deepStrictEqual(received.map((item) => item.headers["edc-bpn"]), [SENDER, "BPNL00000000TCK2"]);
    });
  });
}
