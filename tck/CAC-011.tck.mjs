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


// Criterion CX-0160-4-CAC-011 (Access before the Art. 77(9) act) of Annex A of the proposal, section 2.2
// item 4. Requirements: PrR-CXD-028 (One conformance test per criterion CX-0160-4-CAC-001 to 016), with
// decision D29 (The access regime and the admitted roles). Section 14.3 of
// docs/architecture/implementation_plan.md. The binding runs under the access regime before-act, in
// which the data provider's documented policy admits every recipient role that it records.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import { startBinding } from "./lib/binding.mjs";
import { PURCHASER, SUCCESSOR, expectData, givenAccessMap, givenOriginalPassport, givenStoredPayloads, submodelPath } from "./lib/scenario.mjs";

let binding;
before(async () => {
  binding = await startBinding({ accessRegime: "before-act" });
});
after(async () => {
  if (binding) await binding.stop();
});

test("CX-0160-4-CAC-011 (Access before the Art. 77(9) act): the data provider applies the access of CX-0160 1.1.0 and of its own documented policy, so an access record of the role authorisedRecipient opens the product condition offer for that recipient only", async (t) => {
  const { provider, operator, recycler } = binding;
  const passport = await givenOriginalPassport(provider);
  await givenAccessMap(provider, passport.batteryModelId);
  await givenStoredPayloads(provider, passport.id);
  const assetId = `product-condition-${passport.id}`;
  const path = submodelPath(passport.id, "product-condition");
  const readers = [operator.bpnl, recycler.bpnl, SUCCESSOR, PURCHASER];

  await t.test("without an access record the product condition offer is listed for nobody", async () => {
    for (const reader of readers) assert.equal((await provider.catalogue(reader)).some((offer) => offer.assetId === assetId), false, reader);
  });
  await t.test("an access record of the role authorisedRecipient lists the product condition offer for that recipient, who reads the payload", async () => {
    const record = expectData(await provider.call("POST", `/api/passports/${passport.id}/access-records`, { recipientBpnl: PURCHASER, recipientRole: "authorisedRecipient", aspectKey: "product-condition" }), 201).record;
    assert.deepStrictEqual([record.recipientBpnl, record.recipientRole, record.aspectKey, record.validTo], [PURCHASER, "authorisedRecipient", "product-condition", null]);
    assert.equal((await provider.catalogue(PURCHASER)).some((offer) => offer.assetId === assetId), true);
    const read = await provider.asPartner(PURCHASER).get(path);
    assert.equal(read.outcome, "received", JSON.stringify(read.body));
    assert.equal(read.body.StateOfCharge.StateOfChargeValue, 64);
  });
  await t.test("every other participant is not listed and is refused the product condition", async () => {
    for (const reader of [operator.bpnl, recycler.bpnl, SUCCESSOR]) {
      assert.equal((await provider.catalogue(reader)).some((offer) => offer.assetId === assetId), false, reader);
      assert.equal((await provider.asPartner(reader).get(path)).outcome, "contract_refused", reader);
    }
  });
});
