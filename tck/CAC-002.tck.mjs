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


// Criterion CX-0160-4-CAC-002 (Digital twin) of Annex A of the proposal, section 2.1.1 items 4, 5 and 7
// and Table 2.1.1. Requirements: PrR-CXD-028 (One conformance test per criterion CX-0160-4-CAC-001 to
// 016) and SyR-CXD-221 (New digital twin for a battery that receives a new passport). Section 14.3 of
// docs/architecture/implementation_plan.md; lesson 2 (a second-life step changes the original twin) of
// section 14.4.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import { startBinding } from "./lib/binding.mjs";
import { STORED_KEYS, SEMANTIC_IDS, expectData, expectRefusal, givenNewPassport, givenOriginalPassport, givenStoredPayloads } from "./lib/scenario.mjs";

// The short names (idShort) of the aspect keys of section 10.6.
const ID_SHORTS = Object.freeze({
  lifecycle: "batteryPassportLifecycle",
  "digital-nameplate": "batteryNameplate",
  "technical-data": "technicalData",
  "product-condition": "productCondition",
  "dpp-metadata": "dppMetadata",
  "handover-documentation": "handoverDocumentation",
  "carbon-footprint": "carbonFootprint",
  "material-composition": "materialComposition",
  circularity: "circularity",
  "serial-part": "serialPart",
  "single-level-bom-as-built": "singleLevelBomAsBuilt",
});
// The eight models of CX-0160-3: the seven IDTA-02035 models and the DPP Metadata.
const CX_0160_3_KEYS = Object.freeze(["digital-nameplate", "handover-documentation", "carbon-footprint", "technical-data", "product-condition", "material-composition", "circularity", "dpp-metadata"]);

let binding;
before(async () => {
  binding = await startBinding();
});
after(async () => {
  if (binding) await binding.stop();
});

const valueOf = (shell, name) => shell.specificAssetIds.filter((item) => item.name === name).map((item) => item.value);

test("CX-0160-4-CAC-002 (Digital twin): the second-life operator registers a new PartInstance twin with the keys of Table 2.1.1, the SerialPart aspect and every model of CX-0160-3, and the original twins stay unchanged", async (t) => {
  const { provider, operator } = binding;
  const original = await givenOriginalPassport(provider);
  await givenStoredPayloads(provider, original.id);
  const originalShellBefore = await provider.registry.read(original.catenaXId);
  const originalPayloadsBefore = {};
  for (const key of STORED_KEYS) originalPayloadsBefore[key] = (await provider.call("GET", `/api/passports/${original.id}/submodels/${key}/submodel`)).body;
  const issued = await givenNewPassport(operator, [original], "repurposing");
  const created = issued.passport;
  await givenStoredPayloads(operator, created.id);
  assert.deepStrictEqual(expectData(await operator.call("POST", `/api/passports/${created.id}/twin`), 200), { exposure: { refreshed: true } });
  await binding.settle();
  const shell = await operator.registry.read(created.catenaXId);

  await t.test("the new twin is a PartInstance shell with a new catenaXId", () => {
    assert.ok(shell, "the registry of the second-life operator holds the new shell");
    assert.equal(shell.id, created.catenaXId);
    assert.equal(shell.globalAssetId, created.catenaXId);
    assert.notEqual(shell.id, original.catenaXId);
  });
  await t.test("Table 2.1.1: manufacturerId, manufacturerPartId, partInstanceId, intrinsicId and digitalTwinType hold the values of the new twin", () => {
    assert.deepStrictEqual(valueOf(shell, "manufacturerId"), [operator.bpnl]);
    assert.deepStrictEqual(valueOf(shell, "manufacturerPartId"), [issued.model.manufacturerPartId]);
    assert.deepStrictEqual(valueOf(shell, "partInstanceId"), [created.batteryIdentifier]);
    assert.deepStrictEqual(valueOf(shell, "intrinsicId"), [created.batteryIdentifier]);
    assert.deepStrictEqual(valueOf(shell, "digitalTwinType"), ["PartInstance"]);
  });
  await t.test("the twin holds the descriptors of the eight models of CX-0160-3, of SerialPart, of SingleLevelBomAsBuilt and of the lifecycle model, each with its semantic identifier", () => {
    const descriptors = new Map(shell.submodelDescriptors.map((descriptor) => [descriptor.idShort, descriptor]));
    for (const key of [...CX_0160_3_KEYS, "serial-part", "single-level-bom-as-built", "lifecycle"]) {
      const descriptor = descriptors.get(ID_SHORTS[key]);
      assert.ok(descriptor, `the descriptor of ${key}`);
      assert.equal(descriptor.semanticId.keys[0].value, SEMANTIC_IDS[key], key);
      assert.ok(descriptor.endpoints[0].protocolInformation.subprotocolBody.includes(`id=${key}-${created.id}`), key);
    }
    assert.equal(shell.submodelDescriptors.length, 11);
  });
  await t.test("section 2.1.1 item 7: the shell and every submodel of the original passport are equal before and after the new passport", async () => {
    assert.deepStrictEqual(await provider.registry.read(original.catenaXId), originalShellBefore);
    for (const key of STORED_KEYS) assert.deepStrictEqual((await provider.call("GET", `/api/passports/${original.id}/submodels/${key}/submodel`)).body, originalPayloadsBefore[key], key);
    assert.equal(await operator.registry.read(original.catenaXId), null, "the second-life operator registers no shell of the original passport");
    expectRefusal(await operator.call("POST", `/api/passports/${original.id}/twin`), 404, "ERR-LC-PASSPORT-NOT-FOUND");
  });
});
