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

// Criterion CX-0160-4-CAC-001 (New passport) of Annex A of the proposal, section 2.1.1 items 1 to 3.
// Requirements: PrR-CXD-028 (One conformance test per criterion CX-0160-4-CAC-001 to 016), SyR-LIFE-018
// (New passport dataset for a treated battery placed on the market again), SyR-LIFE-026 (New unique
// identifier attributed by the operator to the new passport) and SyR-LIFE-131 (New passport delivered
// as a passport of its own, not a version), with decision D14 (The identifier rule) and decision D40
// (The admission rule). Section 14.3 of docs/architecture/implementation_plan.md; lesson 6 (the rules
// refuse every action on a waste battery) of section 14.4.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import { startBinding } from "./lib/binding.mjs";
import { expectRefusal, givenNewPassport, givenOriginalPassport, givenWaste, newPassportRequest, passportOf, unique } from "./lib/scenario.mjs";

let binding;
before(async () => {
  binding = await startBinding();
});
after(async () => {
  if (binding) await binding.stop();
});

// The status of the new passport after each operation (Table 2.1.4 of the proposal, decision D40).
const OPERATIONS = Object.freeze([
  ["preparationForReUse", true, "re-used"],
  ["preparationForRepurposing", true, "repurposed"],
  ["repurposing", false, "repurposed"],
  ["remanufacturing", false, "remanufactured"],
]);

test("CX-0160-4-CAC-001 (New passport): the second-life operator issues a new passport for each of the four operations, with a new digitalProductPassportId, and keeps or renews the battery identifier as section 2.1.1 item 3 states", async (t) => {
  const { provider, operator } = binding;
  for (const [operation, fromWaste, status] of OPERATIONS) {
    await t.test(`${operation}: a new passport with a new passport identifier and the status ${status}${fromWaste ? ", issued for a waste battery" : ""}`, async () => {
      const original = await givenOriginalPassport(provider);
      if (fromWaste) await givenWaste(binding, original);
      const predecessor = await passportOf(provider, original.id);
      assert.equal(predecessor.lifecycleStatus, fromWaste ? "waste" : "original");
      const issued = await givenNewPassport(operator, [{ ...predecessor, originalPurpose: original.originalPurpose }], operation);
      const created = await passportOf(operator, issued.passport.id);
      assert.notEqual(created.id, original.id, "the new passport is a passport of its own");
      assert.notEqual(created.catenaXId, original.catenaXId);
      assert.notEqual(created.passportIdentifier, original.passportIdentifier, "section 2.1.1 item 2: a new digitalProductPassportId");
      assert.equal(created.passportIdentifier, issued.body.passportIdentifier);
      assert.equal(created.lifecycleStatus, status);
      assert.equal(created.manufacturerBpnl, operator.bpnl);
      if (operation === "remanufacturing") assert.notEqual(created.batteryIdentifier, original.batteryIdentifier, "section 2.1.1 item 3: a new battery identifier after a remanufacturing");
      else assert.equal(created.batteryIdentifier, original.batteryIdentifier, "section 2.1.1 item 3: the battery identifier of the original battery kept");
      const unchanged = await passportOf(provider, original.id);
      assert.deepStrictEqual([unchanged.passportIdentifier, unchanged.batteryIdentifier, unchanged.lifecycleStatus], [original.passportIdentifier, original.batteryIdentifier, predecessor.lifecycleStatus]);
    });
  }
  await t.test("the battery identifier of two original batteries is renewed, and the new passport links both", async () => {
    const first = await givenOriginalPassport(provider);
    const second = await givenOriginalPassport(provider, { batteryModelId: first.batteryModelId });
    const issued = await givenNewPassport(operator, [first, second], "repurposing");
    const created = await passportOf(operator, issued.passport.id);
    assert.ok(![first.batteryIdentifier, second.batteryIdentifier].includes(created.batteryIdentifier));
    assert.equal(issued.notifications.length, 2);
  });
  await t.test("decision D14: a kept battery identifier after a remanufacturing, a new battery identifier after a repurposing of one battery and a repeated passport identifier answer 409 ERR-LC-IDENTIFIER-RULE", async () => {
    const original = await givenOriginalPassport(provider);
    expectRefusal(await refusedRequest(operator, original, "remanufacturing", { batteryIdentifier: original.batteryIdentifier }), 409, "ERR-LC-IDENTIFIER-RULE");
    expectRefusal(await refusedRequest(operator, original, "repurposing", { batteryIdentifier: unique("TCK-BATTERY") }), 409, "ERR-LC-IDENTIFIER-RULE");
    expectRefusal(await refusedRequest(operator, original, "repurposing", { passportIdentifier: original.passportIdentifier }), 409, "ERR-LC-IDENTIFIER-RULE");
  });
});


// Sends a request of EP-ISSUE-NEW-PASSPORT for one original passport and returns the answer unchanged.
async function refusedRequest(operator, original, operation, overrides) {
  const { body } = await newPassportRequest(operator, [original], operation, overrides);
  return operator.call("POST", "/api/passports/new-passport", body);
}
