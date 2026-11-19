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

// Tests the notification plan of server/src/connector/notificationPlan.mjs.
//
// Requirements of the registry that this file verifies:
//   SwR-CXCLIENT-111 (End of a recycled battery's passport made known to the provider)
//   SwR-CXCLIENT-176 (NewPassportIssued sent to each original passport's data provider under contract)
//   SwR-CXCLIENT-178 (PassportEnded sent to the data provider, nameplate manufacturer and successor)
//   SwR-CXCLIENT-179 (PassportEnded may be sent to predecessor data providers under contract)
//   SwR-CXCLIENT-180 (BatteryRepaired sent to the data provider of the repaired battery's passport)
//   SwR-CXCLIENT-181 (BatteryBecameWaste sent to the data provider and the named successor)
//   SwR-CXCLIENT-184 (Notification plan holds one notification per receiver and passport)
// Lessons 8 (one operation sends no notification) and 9 (a notification goes to every known partner) of
// docs/lessons-from-a-first-implementation.md. Decisions D12 (No notification to the own company) and
// D34 (The passport service provider as a receiver) [waits for the owner]. Section 10.3 of the
// implementation specification.
import assert from "node:assert/strict";
import { test } from "node:test";

import { buildNotificationPlan, passportServiceProviderReceivers, receiversOf } from "../src/connector/notificationPlan.mjs";

const DATA_PROVIDER = "BPNL00000000TCK1";
const SECOND_LIFE = "BPNL00000000TCK2";
const RECYCLER = "BPNL00000000TCK3";
const SUCCESSOR = "BPNL00000000TCK4";
const PURCHASER = "BPNL00000000TCK5";
const SERVICE_PROVIDER = "BPNL00000000TCK6";

function plan(operation, request, ownBpnl, content = { passportIdentifier: request.passportIdentifier }) {
  return buildNotificationPlan({ operation, content, receivers: receiversOf({ operation, request }), ownBpnl });
}
const pairs = (entries) => entries.map((entry) => [entry.receiverBpnl, entry.passportIdentifier]);

test("SwR-CXCLIENT-184 (Notification plan holds one notification per receiver and passport): the receivers of section 10.3", async (t) => {
  await t.test("SwR-CXCLIENT-176: NewPassportIssued goes to the data provider of each original passport, one notification per predecessor link", () => {
    const request = {
      predecessors: [
        { passportIdentifier: "TCK-PASSPORT-A", dataProviderBpnl: DATA_PROVIDER },
        { passportIdentifier: "TCK-PASSPORT-B", dataProviderBpnl: DATA_PROVIDER },
        { passportIdentifier: "TCK-PASSPORT-C", dataProviderBpnl: PURCHASER },
      ],
    };
    const content = { passportIdentifier: "TCK-PASSPORT-NEW", catenaXId: "urn:uuid:9a2b8f61-3c5d-4e7a-8b1f-2d6c4a0e9f33", operation: "remanufacturing", operationDate: "2027-03-01T09:30:00.000Z" };
    const entries = buildNotificationPlan({ operation: "NewPassportIssued", content, receivers: receiversOf({ operation: "NewPassportIssued", request }), ownBpnl: SECOND_LIFE });
    assert.deepStrictEqual(pairs(entries), [
      [DATA_PROVIDER, "TCK-PASSPORT-A"],
      [DATA_PROVIDER, "TCK-PASSPORT-B"],
      [PURCHASER, "TCK-PASSPORT-C"],
    ]);
    assert.deepStrictEqual(entries[1], { operation: "NewPassportIssued", receiverBpnl: DATA_PROVIDER, passportIdentifier: "TCK-PASSPORT-B", content: { ...content, predecessorPassportIdentifier: "TCK-PASSPORT-B" } });
  });
  await t.test("SwR-CXCLIENT-180: BatteryRepaired goes to the data provider of the passport", () => {
    assert.deepStrictEqual(pairs(plan("BatteryRepaired", { passportIdentifier: "TCK-PASSPORT-A", dataProviderBpnl: DATA_PROVIDER }, RECYCLER)), [[DATA_PROVIDER, "TCK-PASSPORT-A"]]);
  });
  await t.test("SwR-CXCLIENT-181: BatteryBecameWaste goes to the data provider and the named successor", () => {
    const request = { passportIdentifier: "TCK-PASSPORT-A", dataProviderBpnl: DATA_PROVIDER, successorBpnl: SUCCESSOR };
    assert.deepStrictEqual(pairs(plan("BatteryBecameWaste", request, RECYCLER)), [
      [DATA_PROVIDER, "TCK-PASSPORT-A"],
      [SUCCESSOR, "TCK-PASSPORT-A"],
    ]);
  });
  await t.test("SwR-CXCLIENT-178 and SwR-CXCLIENT-179: PassportEnded goes to the data provider, the nameplate manufacturer, the successor and the predecessor data providers", () => {
    const request = {
      passportIdentifier: "TCK-PASSPORT-A",
      dataProviderBpnl: SECOND_LIFE,
      nameplateManufacturerBpnl: DATA_PROVIDER,
      receivedFromSuccessorBpnl: SUCCESSOR,
      predecessorDataProviderBpnls: [PURCHASER],
    };
    assert.deepStrictEqual(pairs(plan("PassportEnded", request, RECYCLER)), [
      [SECOND_LIFE, "TCK-PASSPORT-A"],
      [DATA_PROVIDER, "TCK-PASSPORT-A"],
      [SUCCESSOR, "TCK-PASSPORT-A"],
      [PURCHASER, "TCK-PASSPORT-A"],
    ]);
  });
  await t.test("PassportEnded without receivedFromSuccessorBpnl and without predecessor data providers goes to two receivers", () => {
    const request = { passportIdentifier: "TCK-PASSPORT-A", dataProviderBpnl: SECOND_LIFE, nameplateManufacturerBpnl: DATA_PROVIDER };
    assert.deepStrictEqual(pairs(plan("PassportEnded", request, RECYCLER)), [
      [SECOND_LIFE, "TCK-PASSPORT-A"],
      [DATA_PROVIDER, "TCK-PASSPORT-A"],
    ]);
  });
});

test("SwR-CXCLIENT-184: one entry per pair of receiver and passport, and no entry for the own Business Partner Number", async (t) => {
  await t.test("two rules that name one Business Partner Number for one passport produce one notification", () => {
    const request = { passportIdentifier: "TCK-PASSPORT-A", dataProviderBpnl: DATA_PROVIDER, nameplateManufacturerBpnl: DATA_PROVIDER, predecessorDataProviderBpnls: [DATA_PROVIDER, SUCCESSOR, SUCCESSOR] };
    assert.deepStrictEqual(pairs(plan("PassportEnded", request, RECYCLER)), [
      [DATA_PROVIDER, "TCK-PASSPORT-A"],
      [SUCCESSOR, "TCK-PASSPORT-A"],
    ]);
  });
  await t.test("decision D12: a receiver equal to the own Business Partner Number produces no entry", () => {
    const request = { passportIdentifier: "TCK-PASSPORT-A", dataProviderBpnl: RECYCLER, successorBpnl: SUCCESSOR };
    assert.deepStrictEqual(pairs(plan("BatteryBecameWaste", request, RECYCLER)), [[SUCCESSOR, "TCK-PASSPORT-A"]]);
    assert.deepStrictEqual(pairs(plan("BatteryRepaired", { passportIdentifier: "TCK-PASSPORT-A", dataProviderBpnl: RECYCLER }, RECYCLER)), []);
  });
  await t.test("the content of each entry is a copy, so a change of one entry changes no other", () => {
    const content = { passportIdentifier: "TCK-PASSPORT-A", date: "2027-03-01T09:30:00.000Z" };
    const entries = buildNotificationPlan({ operation: "BatteryBecameWaste", content, receivers: [{ bpnl: DATA_PROVIDER, passportIdentifier: "TCK-PASSPORT-A" }, { bpnl: SUCCESSOR, passportIdentifier: "TCK-PASSPORT-A" }], ownBpnl: RECYCLER });
    entries[0].content.date = "changed";
    assert.equal(entries[1].content.date, "2027-03-01T09:30:00.000Z");
    assert.equal(content.date, "2027-03-01T09:30:00.000Z");
  });
});

test("SwR-CXCLIENT-111 (End of a recycled battery's passport made known to the provider): the further receiver of decision D34 [waits for the owner]", async (t) => {
  await t.test("the passport service provider of the configuration is one further receiver of PassportEnded", () => {
    const receivers = passportServiceProviderReceivers({ passportServiceProviderBpnl: SERVICE_PROVIDER, passportIdentifier: "TCK-PASSPORT-A" });
    const entries = buildNotificationPlan({ operation: "PassportEnded", content: { passportIdentifier: "TCK-PASSPORT-A" }, receivers, ownBpnl: DATA_PROVIDER });
    assert.deepStrictEqual(pairs(entries), [[SERVICE_PROVIDER, "TCK-PASSPORT-A"]]);
  });
  await t.test("without the variable the plan holds no entry for a passport service provider", () => {
    assert.deepStrictEqual(passportServiceProviderReceivers({ passportServiceProviderBpnl: null, passportIdentifier: "TCK-PASSPORT-A" }), []);
  });
});
