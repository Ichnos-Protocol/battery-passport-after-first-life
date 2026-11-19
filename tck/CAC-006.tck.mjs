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


// Criterion CX-0160-4-CAC-006 (Status and repair) of Annex A of the proposal, section 2.1.4 and Table
// 2.1.4. Requirements: PrR-CXD-028 (One conformance test per criterion CX-0160-4-CAC-001 to 016),
// SyR-LIFE-133 (Direct re-use without preparation keeps the passport and its identifier), SyR-LIFE-134
// (Direct re-use leaves the responsible economic operator unchanged), SyR-LIFE-140 (Battery status
// unchanged after a direct re-use), SyR-LIFE-145 (Repair notified to the data provider of the passport)
// and SyR-LIFE-146 (Repair certificate held as the record of the repair), with decision D30 (The change
// of purchaser) and decision D48 (The repair certificate before the notice) [waits for the owner].
// Section 14.3 of docs/architecture/implementation_plan.md: the test asserts the order of D48 and not
// the content of the repair certificate.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";

import { startBinding } from "./lib/binding.mjs";
import { DATES, PURCHASER, expectData, expectRefusal, givenNewPassport, givenOriginalPassport, givenWaste, passportOf, sentOf } from "./lib/scenario.mjs";

let binding;
before(async () => {
  binding = await startBinding();
});
after(async () => {
  if (binding) await binding.stop();
});

// The identity of a passport that a "same passport" row of Table 2.1.4 keeps.
const identityOf = (passport) => [passport.id, passport.catenaXId, passport.passportIdentifier, passport.batteryIdentifier, passport.manufacturerBpnl];

test("CX-0160-4-CAC-006 (Status and repair): the data provider sets LifeCycleStage after each event of Table 2.1.4 and keeps the passport and its identifiers in each same-passport row; the repairer registers the repair certificate and sends BatteryRepaired", async (t) => {
  const { provider, operator, recycler } = binding;
  const passport = await givenOriginalPassport(provider);
  const certificate = `urn:uuid:${randomUUID()}`;
  const repair = { passportIdentifier: passport.passportIdentifier, dataProviderBpnl: provider.bpnl, repairDate: DATES.repair, repairCertificateCatenaXId: certificate };

  await t.test("first placing on the market: the first passport with the status original", async () => {
    assert.equal((await passportOf(provider, passport.id)).lifecycleStatus, "original");
  });
  await t.test("decision D48: the repair is not reported before the certificate twin is registered", async () => {
    expectRefusal(await recycler.call("POST", "/api/lifecycle-events/repair", repair), 409, "ERR-LC-CERTIFICATE-NOT-REGISTERED");
    assert.equal((await sentOf(recycler)).some((item) => item.operation === "BatteryRepaired" && item.passportIdentifier === passport.passportIdentifier), false, "no BatteryRepaired is planned");
  });
  await t.test("repair of a battery that is not waste: the sent BatteryRepaired carries the certificate reference, and the same passport takes the status re-used with the repair recorded", async () => {
    await recycler.registry.put({ id: certificate, idShort: "repairCertificate", specificAssetIds: [], submodelDescriptors: [] });
    const [planned] = expectData(await recycler.call("POST", "/api/lifecycle-events/repair", repair), 202).notifications;
    assert.deepStrictEqual([planned.operation, planned.receiverBpnl], ["BatteryRepaired", provider.bpnl]);
    await binding.settle();
    const sent = (await sentOf(recycler)).find((item) => item.id === planned.id);
    assert.equal(sent.outcome, "sent");
    assert.equal(sent.message.content.repairCertificateCatenaXId, certificate);
    const repaired = await passportOf(provider, passport.id);
    assert.deepStrictEqual(identityOf(repaired), identityOf(passport));
    assert.equal(repaired.lifecycleStatus, "re-used");
    assert.deepStrictEqual(repaired.repairEntries, [{ repairDate: DATES.repair, repairCertificateCatenaXId: certificate, repairerBpnl: recycler.bpnl }]);
  });
  await t.test("direct re-use and change of purchaser: the same passport, its identifiers, its status and its responsible operator unchanged", async () => {
    const before = await passportOf(provider, passport.id);
    const changed = expectData(await provider.call("POST", `/api/passports/${passport.id}/purchaser`, { purchaserBpnl: PURCHASER }), 200);
    assert.ok(changed.opened.length > 0);
    const after = await passportOf(provider, passport.id);
    assert.deepStrictEqual(identityOf(after), identityOf(passport));
    assert.equal(after.lifecycleStatus, before.lifecycleStatus);
    assert.deepStrictEqual(after.responsibleOperator, before.responsibleOperator);
  });
  await t.test("the battery becomes waste: the same passport with the status waste", async () => {
    await givenWaste(binding, passport);
    const waste = await passportOf(provider, passport.id);
    assert.deepStrictEqual(identityOf(waste), identityOf(passport));
    assert.equal(waste.lifecycleStatus, "waste");
  });
  for (const [operation, fromWaste, status] of [
    ["preparationForReUse", true, "re-used"],
    ["preparationForRepurposing", true, "repurposed"],
    ["repurposing", false, "repurposed"],
    ["remanufacturing", false, "remanufactured"],
  ]) {
    await t.test(`${operation}: a new passport with the status ${status}`, async () => {
      const original = await givenOriginalPassport(provider);
      if (fromWaste) await givenWaste(binding, original);
      const predecessor = { ...(await passportOf(provider, original.id)), originalPurpose: original.originalPurpose };
      const created = (await givenNewPassport(operator, [predecessor], operation)).passport;
      assert.notEqual(created.id, original.id);
      assert.equal(created.lifecycleStatus, status);
    });
  }
  await t.test("recycling: the same passport, ended, with the status unchanged", async () => {
    expectData(
      await recycler.call("POST", "/api/lifecycle-events/recycling", { passportIdentifier: passport.passportIdentifier, dataProviderBpnl: provider.bpnl, nameplateManufacturerBpnl: provider.bpnl, recyclingDate: DATES.recycling }),
      202,
    );
    await binding.settle();
    const ended = await passportOf(provider, passport.id);
    assert.deepStrictEqual(identityOf(ended), identityOf(passport));
    assert.equal(ended.lifecycleStatus, "waste");
    assert.deepStrictEqual([ended.endOfPassport.recyclingDate, ended.endOfPassport.recyclerBpnl], [DATES.recycling, recycler.bpnl]);
  });
});
