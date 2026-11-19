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


// Criterion CX-0160-4-CAC-004 (Predecessor links) of Annex A of the proposal, section 2.1.2.
// Requirements: PrR-CXD-028 (One conformance test per criterion CX-0160-4-CAC-001 to 016), SyR-LIFE-019
// (New passport dataset links to each original battery's passport), SyR-LIFE-020 (Remanufactured
// dataset links every original battery's passport) and SyR-LIFE-021 (Re-use and repurposing datasets
// link one or more original passports). Section 14.3 of docs/architecture/implementation_plan.md.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import { startBinding } from "./lib/binding.mjs";
import { STORED_KEYS, givenNewPassport, givenOriginalPassport, givenStoredPayloads } from "./lib/scenario.mjs";

let binding;
before(async () => {
  binding = await startBinding();
});
after(async () => {
  if (binding) await binding.stop();
});

const MANDATORY = Object.freeze(["catenaXId", "dataProviderBpnl", "operation", "operationDate", "passportIdentifier"]);

test("CX-0160-4-CAC-004 (Predecessor links): the second-life operator publishes the lifecycle submodel with one link per original passport, five mandatory properties each, and records the part relationships in SingleLevelBomAsBuilt only", async (t) => {
  const { provider, operator } = binding;
  const first = await givenOriginalPassport(provider);
  const second = await givenOriginalPassport(provider, { batteryModelId: first.batteryModelId });
  const third = await givenOriginalPassport(provider, { batteryModelId: first.batteryModelId });
  const cases = [
    ["remanufacturing", [first, second]],
    ["repurposing", [third]],
  ];
  for (const [operation, predecessors] of cases) {
    await t.test(`${operation} of ${predecessors.length} original passports: one link per original passport with the five mandatory properties`, async () => {
      const created = (await givenNewPassport(operator, predecessors, operation)).passport;
      await givenStoredPayloads(operator, created.id);
      const lifecycle = await operator.call("GET", `/api/passports/${created.id}/submodels/lifecycle/submodel`);
      assert.equal(lifecycle.status, 200, JSON.stringify(lifecycle.body));
      const links = lifecycle.body.predecessors;
      assert.equal(links.length, predecessors.length);
      for (const predecessor of predecessors) {
        const link = links.find((item) => item.passportIdentifier === predecessor.passportIdentifier);
        assert.ok(link, `the link of ${predecessor.passportIdentifier}`);
        assert.deepStrictEqual(Object.keys(link).sort(), MANDATORY);
        assert.deepStrictEqual([link.catenaXId, link.dataProviderBpnl, link.operation], [predecessor.catenaXId, provider.bpnl, operation]);
        assert.equal(typeof link.operationDate, "string");
        const originalShell = await provider.registry.read(link.catenaXId);
        assert.ok(originalShell, "the catenaXId of the link reads a shell in the registry of the original data provider");
        assert.deepStrictEqual(originalShell.specificAssetIds.filter((item) => item.name === "manufacturerId").map((item) => item.value), [link.dataProviderBpnl]);
      }
      const shell = await operator.registry.read(created.catenaXId);
      assert.ok(shell.submodelDescriptors.some((descriptor) => descriptor.idShort === "singleLevelBomAsBuilt"), "the shell holds the descriptor of single-level-bom-as-built");
      for (const key of STORED_KEYS) {
        const served = await operator.call("GET", `/api/passports/${created.id}/submodels/${key}/submodel`);
        assert.equal(served.status, 200, key);
        for (const predecessor of predecessors) {
          assert.equal(JSON.stringify(served.body).includes(predecessor.passportIdentifier), false, `section 2.1.2 item 5: the payload of ${key} holds no passport identifier of a predecessor`);
        }
      }
    });
  }
});
