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


// Criterion CX-0160-4-CAC-008 (Donors) of Annex A of the proposal, section 2.1.6 items 1 and 2.
// Requirements: PrR-CXD-028 (One conformance test per criterion CX-0160-4-CAC-001 to 016) and
// SyR-LIFE-132 (Remanufacturing donor's passport later accepts the status waste), with decision D40 (The
// admission rule). Section 14.3 of docs/architecture/implementation_plan.md; lesson 7 (a donor cannot
// later become waste) of section 14.4.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import { startBinding } from "./lib/binding.mjs";
import { SUCCESSOR, givenAccessMap, givenNewPassport, givenOriginalPassport, givenStoredPayloads, givenWaste, passportOf, sentOf, submodelPath } from "./lib/scenario.mjs";

let binding;
before(async () => {
  binding = await startBinding();
});
after(async () => {
  if (binding) await binding.stop();
});

test("CX-0160-4-CAC-008 (Donors): the donor data provider keeps the donor passport readable after the remanufacturing and sets the status waste after BatteryBecameWaste for the remaining parts", async (t) => {
  const { provider, operator, recycler } = binding;
  const donor = await givenOriginalPassport(provider);
  const other = await givenOriginalPassport(provider, { batteryModelId: donor.batteryModelId });
  // The access map of the battery model makes the technical data a public aspect (decision D3).
  await givenAccessMap(provider, donor.batteryModelId);
  await givenStoredPayloads(provider, donor.id);
  const before = await provider.call("GET", `/api/passports/${donor.id}/submodels/technical-data/submodel`);
  const created = (await givenNewPassport(operator, [donor, other], "remanufacturing")).passport;
  await binding.settle();

  await t.test("the donor passport, its twin and its submodels are readable after the remanufacturing", async () => {
    const passport = await passportOf(provider, donor.id);
    assert.deepStrictEqual([passport.id, passport.passportIdentifier, passport.lifecycleStatus], [donor.id, donor.passportIdentifier, "original"]);
    assert.ok(await provider.registry.read(donor.catenaXId), "the donor twin stays registered");
    const after = await provider.call("GET", `/api/passports/${donor.id}/submodels/technical-data/submodel`);
    assert.equal(after.status, 200);
    assert.deepStrictEqual(after.body, before.body);
    const read = await provider.asPartner(SUCCESSOR).get(submodelPath(donor.id, "technical-data"));
    assert.equal(read.outcome, "received", "a public aspect of the donor passport is readable through the data plane");
    assert.ok(created.id !== donor.id);
  });
  await t.test("BatteryBecameWaste for the remaining parts sets the status waste on the donor passport", async () => {
    const [planned] = (await givenWaste(binding, donor)).filter((item) => item.receiverBpnl === provider.bpnl);
    assert.equal((await sentOf(recycler)).find((item) => item.id === planned.id).outcome, "sent");
    const waste = await passportOf(provider, donor.id);
    assert.deepStrictEqual([waste.id, waste.lifecycleStatus, waste.wasteSuccessor?.successorBpnl], [donor.id, "waste", SUCCESSOR]);
    assert.equal((await passportOf(provider, other.id)).lifecycleStatus, "original", "the other donor keeps its status");
  });
});
