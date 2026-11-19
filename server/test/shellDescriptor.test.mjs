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

// Tests the shell descriptors of server/src/twins/shellDescriptor.mjs.
//
// Requirements of the registry that this file verifies:
//   SwR-TWINS-110 (A new PartInstance twin for a treated battery placed again)
//   SwR-TWINS-154 (New PartInstance twin registered for a new passport, originals untouched)
// Section 9.2.6 of the implementation specification and Table 2.1.1 of the proposal CX-0160-4.
import assert from "node:assert/strict";
import { test } from "node:test";

import { ASPECTS } from "../src/submodels/submodelService.mjs";
import { buildPartInstanceShell, buildPartTypeShell, partInstanceAspectKeys, submodelDescriptorId } from "../src/twins/shellDescriptor.mjs";

const UUID_V4 = /^urn:uuid:[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const CONFIG = { connectorDataPlanePublicUrl: "https://data-plane.example/api/public", connectorDspUrl: "https://control-plane.example/api/v1/dsp" };
const PASSPORT = { id: "5f0c1c7e-6b1e-4a37-9a59-0b1d7c3e2a10", manufacturer_bpnl: "BPNL00000000TCK2", battery_identifier: "TCK-BATTERY-0002" };
const MODEL = { id: "9a2b8f61-3c5d-4e7a-8b1f-2d6c4a0e9f33", manufacturer_bpnl: "BPNL00000000TCK2", manufacturer_part_id: "TCK-PART-0002" };

function expectedDescriptor(shellId, aspectKey, path, assetId) {
  return {
    id: submodelDescriptorId(shellId, aspectKey),
    idShort: ASPECTS[aspectKey].idShort,
    semanticId: { type: "ExternalReference", keys: [{ type: "GlobalReference", value: ASPECTS[aspectKey].semanticId }] },
    endpoints: [
      {
        interface: "SUBMODEL-3.0",
        protocolInformation: {
          href: `https://data-plane.example/api/public${path}/submodel`,
          endpointProtocol: "HTTP",
          endpointProtocolVersion: ["1.1"],
          subprotocol: "DSP",
          subprotocolBody: `dspEndpoint=https://control-plane.example/api/v1/dsp;id=${assetId}`,
          subprotocolBodyEncoding: "plain",
          securityAttributes: [{ type: "NONE", key: "NONE", value: "NONE" }],
        },
      },
    ],
  };
}

test("SwR-TWINS-154 (New PartInstance twin registered for a new passport, originals untouched): the fields of section 9.2.6", async (t) => {
  await t.test("the PartInstance shell of a passport holds the fields of the table and one descriptor per aspect key", () => {
    const shell = buildPartInstanceShell({ passport: PASSPORT, model: MODEL, aspectKeys: ["lifecycle", "digital-nameplate"], config: CONFIG });
    const shellId = `urn:uuid:${PASSPORT.id}`;
    assert.deepStrictEqual(shell, {
      id: shellId,
      globalAssetId: shellId,
      idShort: "batteryPassport",
      specificAssetIds: [
        { name: "manufacturerId", value: "BPNL00000000TCK2" },
        { name: "manufacturerPartId", value: "TCK-PART-0002" },
        { name: "partInstanceId", value: "TCK-BATTERY-0002" },
        { name: "intrinsicId", value: "TCK-BATTERY-0002" },
        { name: "digitalTwinType", value: "PartInstance" },
      ],
      submodelDescriptors: [
        expectedDescriptor(shellId, "lifecycle", `/passports/${PASSPORT.id}/submodels/lifecycle`, `lifecycle-${PASSPORT.id}`),
        expectedDescriptor(shellId, "digital-nameplate", `/passports/${PASSPORT.id}/submodels/digital-nameplate`, `digital-nameplate-${PASSPORT.id}`),
      ],
    });
  });
  await t.test("the PartType shell of a battery model holds the access map descriptor when the model holds an access map version", () => {
    const shellId = `urn:uuid:${MODEL.id}`;
    const shell = buildPartTypeShell({ model: MODEL, hasAccessMap: true, config: CONFIG });
    assert.deepStrictEqual(shell, {
      id: shellId,
      globalAssetId: shellId,
      idShort: "batteryModel",
      specificAssetIds: [
        { name: "manufacturerId", value: "BPNL00000000TCK2" },
        { name: "manufacturerPartId", value: "TCK-PART-0002" },
        { name: "digitalTwinType", value: "PartType" },
      ],
      submodelDescriptors: [expectedDescriptor(shellId, "access-map", `/battery-models/${MODEL.id}/submodels/access-map`, `access-map-${MODEL.id}`)],
    });
    assert.deepStrictEqual(buildPartTypeShell({ model: MODEL, hasAccessMap: false, config: CONFIG }).submodelDescriptors, []);
  });
  await t.test("the aspect keys of a PartInstance shell: each stored key, lifecycle after a lineage link, a waste successor or an end, successors after a successor link", () => {
    const none = { storedAspectKeys: [], hasLineageLink: false, hasWasteSuccessor: false, hasEnded: false, hasSuccessorLink: false };
    assert.deepStrictEqual(partInstanceAspectKeys(none), []);
    for (const flag of ["hasLineageLink", "hasWasteSuccessor", "hasEnded"]) assert.deepStrictEqual(partInstanceAspectKeys({ ...none, [flag]: true }), ["lifecycle"], flag);
    assert.deepStrictEqual(partInstanceAspectKeys({ ...none, hasSuccessorLink: true }), ["successors"]);
    assert.deepStrictEqual(partInstanceAspectKeys({ ...none, storedAspectKeys: ["serial-part", "digital-nameplate", "unknown-key"] }), ["digital-nameplate", "serial-part"]);
  });
});

test("SwR-TWINS-110 (A new PartInstance twin for a treated battery placed again): the id of a submodel descriptor", async (t) => {
  await t.test("the id is stable and has the form of a version 4 UUID", () => {
    const first = submodelDescriptorId("urn:uuid:5f0c1c7e-6b1e-4a37-9a59-0b1d7c3e2a10", "lifecycle");
    assert.equal(first, submodelDescriptorId("urn:uuid:5f0c1c7e-6b1e-4a37-9a59-0b1d7c3e2a10", "lifecycle"));
    assert.match(first, UUID_V4);
  });
  await t.test("two aspect keys and two shells give different ids, each of the form of a version 4 UUID", () => {
    const ids = new Set();
    for (const shellId of ["urn:uuid:5f0c1c7e-6b1e-4a37-9a59-0b1d7c3e2a10", "urn:uuid:9a2b8f61-3c5d-4e7a-8b1f-2d6c4a0e9f33"]) {
      for (const aspectKey of Object.keys(ASPECTS)) {
        const id = submodelDescriptorId(shellId, aspectKey);
        assert.match(id, UUID_V4);
        ids.add(id);
      }
    }
    assert.equal(ids.size, 2 * Object.keys(ASPECTS).length);
  });
});
