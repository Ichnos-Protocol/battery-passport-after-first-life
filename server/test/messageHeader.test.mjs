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

// Tests the header builder of server/src/connector/messageHeader.mjs.
//
// Requirement of the registry that this file verifies:
//   SwR-CXCLIENT-059 (Notifications built to CX-0151 and sent as JSON POST)
// Measure VM-SWE-CXCLIENT-011 (Notification content, transport and receiving assets), section 17.2 of
// the implementation specification.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import { buildMessageHeader } from "../src/connector/messageHeader.mjs";
import { OPERATIONS } from "../src/dataset/lifecycleCatalogue.mjs";

const HEADER_SCHEMA = JSON.parse(readFileSync(new URL("../../docs/api/schemas/MessageHeader.schema.json", import.meta.url), "utf8"));
const clock = { now: () => new Date("2027-03-01T09:30:00.123Z") };

test("SwR-CXCLIENT-059 (Notifications built to CX-0151 and sent as JSON POST): the header of section 10.1", async (t) => {
  const ajv = new Ajv2020({ strict: true, allErrors: true });
  addFormats(ajv);
  const validate = ajv.compile(HEADER_SCHEMA);
  for (const operation of Object.keys(OPERATIONS)) {
    await t.test(`the header of ${operation} validates against MessageHeader.schema.json`, () => {
      const header = buildMessageHeader({ operation, senderBpnl: "BPNL00000000TCK2", receiverBpnl: "BPNL00000000TCK1", clock, newUuid: randomUUID });
      assert.equal(validate(header), true, JSON.stringify(validate.errors));
      assert.equal(header.context, OPERATIONS[operation].context);
      assert.equal(header.sentDateTime, "2027-03-01T09:30:00.123Z");
      assert.equal(header.senderBpn, "BPNL00000000TCK2");
      assert.equal(header.receiverBpn, "BPNL00000000TCK1");
      assert.equal(header.version, "3.0.0");
      assert.match(header.messageId, /^urn:uuid:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    });
  }
  await t.test("two headers have different messageId values", () => {
    const first = buildMessageHeader({ operation: "BatteryRepaired", senderBpnl: "BPNL00000000TCK3", receiverBpnl: "BPNL00000000TCK1", clock, newUuid: randomUUID });
    const second = buildMessageHeader({ operation: "BatteryRepaired", senderBpnl: "BPNL00000000TCK3", receiverBpnl: "BPNL00000000TCK1", clock, newUuid: randomUUID });
    assert.notEqual(first.messageId, second.messageId);
  });
  await t.test("a UUID of the generator in upper case is sent in the lower-case form with the prefix urn:uuid:", () => {
    const header = buildMessageHeader({ operation: "PassportEnded", senderBpnl: "BPNL00000000TCK3", receiverBpnl: "BPNL00000000TCK1", clock, newUuid: () => "9A2B8F61-3C5D-4E7A-8B1F-2D6C4A0E9F33" });
    assert.equal(header.messageId, "urn:uuid:9a2b8f61-3c5d-4e7a-8b1f-2d6c4a0e9f33");
  });
  await t.test("an operation outside the four operations is refused", () => {
    assert.throws(() => buildMessageHeader({ operation: "PurchaserChanged", senderBpnl: "BPNL00000000TCK3", receiverBpnl: "BPNL00000000TCK1", clock, newUuid: randomUUID }), TypeError);
  });
});
