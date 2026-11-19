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

// Tests the twin registry contract of section 9.2.6 with one test code for every implementation. Phase
// P4 runs the code against the memory registry; phase P7 adds the registry client of the connector
// binding with a stubbed fetch.
//
// Requirements of the registry that this file verifies:
//   SwR-TWINS-110 (A new PartInstance twin for a treated battery placed again)
//   SwR-TWINS-154 (New PartInstance twin registered for a new passport, originals untouched)
import assert from "node:assert/strict";
import { test } from "node:test";

import { createMemoryTwinRegistry } from "../src/twins/memoryTwinRegistry.mjs";

const IMPLEMENTATIONS = [["the memory registry", () => createMemoryTwinRegistry()]];

const shell = (id, idShort) => ({ id, globalAssetId: id, idShort, specificAssetIds: [{ name: "digitalTwinType", value: "PartInstance" }], submodelDescriptors: [] });

for (const [name, create] of IMPLEMENTATIONS) {
  test(`SwR-TWINS-154 (New PartInstance twin registered for a new passport, originals untouched): the twin registry contract against ${name}`, async (t) => {
    await t.test("read resolves to null for a shell that is not registered", async () => {
      assert.equal(await create().read("urn:uuid:5f0c1c7e-6b1e-4a37-9a59-0b1d7c3e2a10"), null);
    });
    await t.test("put registers a shell, and read resolves to the shell", async () => {
      const registry = create();
      const original = shell("urn:uuid:5f0c1c7e-6b1e-4a37-9a59-0b1d7c3e2a10", "batteryPassport");
      await registry.put(original);
      assert.deepStrictEqual(await registry.read(original.id), original);
    });
    await t.test("put replaces the registered shell with the same id and leaves every other shell unchanged", async () => {
      const registry = create();
      const first = shell("urn:uuid:5f0c1c7e-6b1e-4a37-9a59-0b1d7c3e2a10", "batteryPassport");
      const other = shell("urn:uuid:9a2b8f61-3c5d-4e7a-8b1f-2d6c4a0e9f33", "batteryPassport");
      await registry.put(first);
      await registry.put(other);
      const replaced = { ...first, submodelDescriptors: [{ id: "urn:uuid:b7e4d2a9-1c3f-4e5a-8b6d-0f9e8d7c6b5a", idShort: "batteryPassportLifecycle" }] };
      await registry.put(replaced);
      assert.deepStrictEqual(await registry.read(first.id), replaced);
      assert.deepStrictEqual(await registry.read(other.id), other);
    });
    await t.test("a change of the object after put or after read changes no registered shell", async () => {
      const registry = create();
      const registered = shell("urn:uuid:5f0c1c7e-6b1e-4a37-9a59-0b1d7c3e2a10", "batteryPassport");
      await registry.put(registered);
      registered.idShort = "changed";
      const read = await registry.read(registered.id);
      read.specificAssetIds.push({ name: "manufacturerId", value: "BPNL00000000TCK1" });
      assert.deepStrictEqual(await registry.read(registered.id), shell("urn:uuid:5f0c1c7e-6b1e-4a37-9a59-0b1d7c3e2a10", "batteryPassport"));
    });
  });
}
