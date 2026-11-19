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

import { createConnectorDiscoveryResolver } from "../src/connector/connectorDiscoveryResolver.mjs";
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

// The connector discovery of the own connector (D75), with a stubbed fetch that gives the answer forms
// recorded on 2026-11-19 against Tractus-X EDC 0.13.0 (tck/README.md, section "The recorded answers of
// phase P7"): the array of 04_catalog.md lines 64 to 81 for a resolved counterparty, and the answer 400
// with the message "No did found for identifier <bpnl>" for a Business Partner Number without a DID and
// "No connector endpoints found for counterPartyId <did>" for a DID document without a connector.
const MANAGEMENT = "http://edc-management.memory.invalid/management";
const DISCOVERY_CONFIG = Object.freeze({ edcManagementUrl: MANAGEMENT, edcManagementApiKey: "management-key-0123456789abcdefghij", edcManagementApiKeyHeader: "x-api-key" });
const discoveryRequests = [];
async function discoveryFetch(url, init) {
  discoveryRequests.push({ url, init });
  const body = JSON.parse(init.body);
  const answer = (status, value) => new Response(JSON.stringify(value), { status, headers: { "content-type": "application/json" } });
  const counterParty = body["edc:counterPartyId"];
  if (counterParty === KNOWN) {
    return answer(200, [
      { "@context": { edc: "https://w3id.org/edc/v0.0.1/ns/" }, "edc:counterPartyId": DID, "edc:counterPartyAddress": "http://provider.memory.invalid/api/v1/dsp", "edc:protocol": "dataspace-protocol-http:v0.8" },
      { "@context": { edc: "https://w3id.org/edc/v0.0.1/ns/" }, "edc:counterPartyId": DID, "edc:counterPartyAddress": CONNECTOR, "edc:protocol": "dataspace-protocol-http:2025-1" },
    ]);
  }
  if (counterParty === WITHOUT_CONNECTOR) return answer(400, [{ message: `No connector endpoints found for counterPartyId ${DID_WITHOUT_CONNECTOR}`, type: "InvalidRequest", path: null, invalidValue: null }]);
  return answer(400, [{ message: `No did found for identifier ${counterParty}`, type: "InvalidRequest", path: null, invalidValue: null }]);
}
IMPLEMENTATIONS.push(["the connector discovery resolver with a stubbed fetch", () => createConnectorDiscoveryResolver({ config: DISCOVERY_CONFIG, fetch: discoveryFetch })]);

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

test("D75 (The receiver resolution through the own connector): the resolver asks the own connector with the request of 04_catalog.md lines 29 to 44", async () => {
  discoveryRequests.length = 0;
  await createConnectorDiscoveryResolver({ config: DISCOVERY_CONFIG, fetch: discoveryFetch }).resolve(KNOWN);
  assert.equal(discoveryRequests.length, 1);
  const [{ url, init }] = discoveryRequests;
  assert.equal(url, `${MANAGEMENT}/v3/connectordiscovery/connectors`);
  assert.equal(init.method, "POST");
  assert.equal(init.headers["x-api-key"], DISCOVERY_CONFIG.edcManagementApiKey);
  assert.deepStrictEqual(JSON.parse(init.body), {
    "@context": { tx: "https://w3id.org/tractusx/v0.0.1/ns/", edc: "https://w3id.org/edc/v0.0.1/ns/" },
    "@type": "tx:ConnectorServiceDiscoveryRequest",
    "edc:counterPartyId": KNOWN,
  });
});

test("D75: an answer of the class 5xx of the own connector throws, so that the sender records a failed transport", async () => {
  const resolver = createConnectorDiscoveryResolver({ config: DISCOVERY_CONFIG, fetch: async () => new Response("[]", { status: 503 }) });
  await assert.rejects(() => resolver.resolve(KNOWN), /503/);
});

test("the memory resolver needs two maps", () => {
  assert.throws(() => createMemoryReceiverResolver({ didByBpnl: {}, connectorUrlByDid: new Map() }), TypeError);
});
