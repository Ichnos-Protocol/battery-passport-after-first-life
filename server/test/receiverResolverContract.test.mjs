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

// Tests the receiver resolver contract of section 9.2.5 with one test code for every implementation.
// Phase P5 runs the code against the memory resolver; phase P7 adds the resolver of the connector
// binding with a stubbed fetch.
//
// Requirement of the registry that this file verifies:
//   SwR-CXCLIENT-183 (Sender's record of a receiver without an asset or a contract)
// Decision D11 (The receiver resolution behind a port) and section 4.3 item 5 of the proposal CX-0160-4.
import assert from "node:assert/strict";
import { test } from "node:test";

import { createMemoryReceiverResolver } from "../src/connector/memoryReceiverResolver.mjs";

const KNOWN = "BPNL00000000TCK1";
const WITHOUT_CONNECTOR = "BPNL00000000TCK2";
const UNKNOWN = "BPNL00000000TCK4";
const DID = "did:web:provider.memory.invalid";
const DID_WITHOUT_CONNECTOR = "did:web:operator.memory.invalid";
const CONNECTOR = "http://provider.memory.invalid";

// Each implementation is created with the same directory: KNOWN resolves in both steps,
// WITHOUT_CONNECTOR resolves to a DID whose document names no connector, and UNKNOWN resolves to no DID.
const IMPLEMENTATIONS = [
  [
    "the memory resolver",
    () =>
      createMemoryReceiverResolver({
        didByBpnl: new Map([
          [KNOWN, DID],
          [WITHOUT_CONNECTOR, DID_WITHOUT_CONNECTOR],
        ]),
        connectorUrlByDid: new Map([[DID, CONNECTOR]]),
      }),
  ],
];

for (const [name, create] of IMPLEMENTATIONS) {
  test(`SwR-CXCLIENT-183 (Sender's record of a receiver without an asset or a contract): the receiver resolver contract against ${name}`, async (t) => {
    await t.test("the two steps resolve a Business Partner Number to the DID and the address of the connector", async () => {
      assert.deepStrictEqual(await create().resolve(KNOWN), { did: DID, connectorUrl: CONNECTOR });
    });
    await t.test("the first step finds no DID, and resolve resolves to null", async () => {
      assert.equal(await create().resolve(UNKNOWN), null);
    });
    await t.test("the second step finds no connector for the DID, and resolve resolves to null", async () => {
      assert.equal(await create().resolve(WITHOUT_CONNECTOR), null);
    });
  });
}

test("the memory resolver needs two maps", () => {
  assert.throws(() => createMemoryReceiverResolver({ didByBpnl: {}, connectorUrlByDid: new Map() }), TypeError);
});
