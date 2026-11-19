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


// Criterion CX-0160-4-CAC-015 (Persistence, SHOULD) of Annex A of the proposal, section 2.1.7 item 5.
// Requirement: PrR-CXD-028 (One conformance test per criterion CX-0160-4-CAC-001 to 016), with decision
// D33 (The offers of an ended passport) [waits for the owner]. Section 14.3 of
// docs/architecture/implementation_plan.md.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import { startBinding } from "./lib/binding.mjs";
import { DATES, PURCHASER, SUCCESSOR, expectData, givenAccessMap, givenOriginalPassport, givenStoredPayloads, givenWaste, submodelPath } from "./lib/scenario.mjs";

let binding;
before(async () => {
  binding = await startBinding();
});
after(async () => {
  if (binding) await binding.stop();
});

test("CX-0160-4-CAC-015 (Persistence): the data provider keeps the ended passport and its lifecycle submodel readable for the persons who could read them before the end", async (t) => {
  const { provider, recycler } = binding;
  const passport = await givenOriginalPassport(provider);
  await givenAccessMap(provider, passport.batteryModelId);
  await givenStoredPayloads(provider, passport.id);
  expectData(await provider.call("POST", `/api/passports/${passport.id}/purchaser`, { purchaserBpnl: PURCHASER }), 200);
  await givenWaste(binding, passport);
  const path = submodelPath(passport.id, "lifecycle");

  await t.test("before the end, the purchaser and the successor read the lifecycle payload", async () => {
    for (const reader of [PURCHASER, SUCCESSOR]) {
      const read = await provider.asPartner(reader).get(path);
      assert.equal(read.outcome, "received", reader);
      assert.equal(Object.hasOwn(read.body, "endOfPassport"), false);
    }
  });
  await t.test("after the end, the same recorded readers still read the lifecycle payload, which holds the end", async () => {
    expectData(
      await recycler.call("POST", "/api/lifecycle-events/recycling", { passportIdentifier: passport.passportIdentifier, dataProviderBpnl: provider.bpnl, nameplateManufacturerBpnl: provider.bpnl, receivedFromSuccessorBpnl: SUCCESSOR, recyclingDate: DATES.recycling }),
      202,
    );
    await binding.settle();
    for (const reader of [PURCHASER, SUCCESSOR]) {
      assert.ok((await provider.catalogue(reader)).some((offer) => offer.assetId === `lifecycle-${passport.id}`), reader);
      const read = await provider.asPartner(reader).get(path);
      assert.equal(read.outcome, "received", reader);
      assert.deepStrictEqual(read.body.endOfPassport, { recyclingDate: DATES.recycling, recyclerBpnl: recycler.bpnl });
    }
    assert.ok(await provider.registry.read(passport.catenaXId), "the twin of the ended passport stays registered");
  });
  await t.test("decision D33: the offers of the stored dataset are withdrawn after the end, and the lifecycle offer stays", async () => {
    const offers = (await provider.catalogue(PURCHASER)).filter((offer) => offer.assetId.endsWith(passport.id));
    assert.deepStrictEqual(offers.map((offer) => offer.assetId), [`lifecycle-${passport.id}`]);
  });
});
