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


// Criterion CX-0160-4-CAC-010 (Access) of Annex A of the proposal, section 2.2 items 1, 2, 5, 6 and 7.
// Requirements: PrR-CXD-028 (One conformance test per criterion CX-0160-4-CAC-001 to 016), SyR-PASS-231
// (New holder after direct re-use recorded as the battery's purchaser), SyR-PASS-235 (Previous holder
// loses access to individual battery information after a resale) and SyR-PASS-236 (Lifecycle record
// offered only to purchaser, operators and authorities), with decision D29 (The access regime and the
// admitted roles) and decision D30 (The change of purchaser). Section 14.3 of
// docs/architecture/implementation_plan.md. The binding runs under the access regime after-act.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import { startBinding } from "./lib/binding.mjs";
import {
  PASSPORT_SERVICE_PROVIDER,
  PURCHASER,
  SUCCESSOR,
  USAGE_PURPOSE,
  expectData,
  expectRefusal,
  givenAccessMap,
  givenNewPassport,
  givenOriginalPassport,
  givenStoredPayloads,
  submodelPath,
} from "./lib/scenario.mjs";

let binding;
before(async () => {
  binding = await startBinding({ accessRegime: "after-act" });
});
after(async () => {
  if (binding) await binding.stop();
});

const listed = async (participant, reader, assetId) => (await participant.catalogue(reader)).some((offer) => offer.assetId === assetId);

test("CX-0160-4-CAC-010 (Access): the data provider carries cx.circular.dpp:1 on each offer, offers the product condition and the lifecycle submodels only to the admitted persons once the Art. 77(9) act applies, and withdraws the access after a change of purchaser", async (t) => {
  const { provider, operator, recycler } = binding;
  const original = await givenOriginalPassport(provider);
  const issued = await givenNewPassport(operator, [original], "repurposing");
  const passport = issued.passport;
  await givenAccessMap(operator, issued.model.id);
  await givenStoredPayloads(operator, passport.id);
  const readers = [provider.bpnl, operator.bpnl, recycler.bpnl, SUCCESSOR, PURCHASER, PASSPORT_SERVICE_PROVIDER];
  const productCondition = `product-condition-${passport.id}`;
  const lifecycle = `lifecycle-${passport.id}`;

  await t.test("section 2.2 item 1: every offer that a participant sees carries the usage purpose cx.circular.dpp:1", async () => {
    for (const participant of [provider, operator, recycler]) {
      for (const reader of readers) {
        for (const offer of await participant.catalogue(reader)) assert.ok(offer.usagePurposes.includes(USAGE_PURPOSE), `${offer.assetId} for ${reader}`);
      }
    }
  });
  await t.test("before a purchaser is recorded, the product condition and the lifecycle offers are listed for nobody", async () => {
    for (const reader of readers) {
      assert.equal(await listed(operator, reader, productCondition), false, reader);
      assert.equal(await listed(operator, reader, lifecycle), false, reader);
    }
  });
  await t.test("decision D29: a role outside the admitted roles of the aspect answers 422 ERR-LC-ROLE-NOT-ADMITTED", async () => {
    expectRefusal(await operator.call("POST", `/api/passports/${passport.id}/access-records`, { recipientBpnl: recycler.bpnl, recipientRole: "responsibleOperator", aspectKey: "product-condition" }), 422, "ERR-LC-ROLE-NOT-ADMITTED");
    expectRefusal(await operator.call("POST", `/api/passports/${passport.id}/access-records`, { recipientBpnl: recycler.bpnl, recipientRole: "authorisedRecipient", aspectKey: "lifecycle" }), 422, "ERR-LC-ROLE-NOT-ADMITTED");
  });
  await t.test("section 2.2 items 2 and 7: the purchaser and its agent are listed for the product condition and the lifecycle offers and read both; another participant is not", async () => {
    expectData(await operator.call("POST", `/api/passports/${passport.id}/purchaser`, { purchaserBpnl: PURCHASER, purchaserAgentBpnl: SUCCESSOR }), 200);
    for (const reader of [PURCHASER, SUCCESSOR]) {
      assert.equal(await listed(operator, reader, productCondition), true, reader);
      assert.equal(await listed(operator, reader, lifecycle), true, reader);
      assert.equal((await operator.asPartner(reader).get(submodelPath(passport.id, "product-condition"))).outcome, "received", reader);
      assert.equal((await operator.asPartner(reader).get(submodelPath(passport.id, "lifecycle"))).outcome, "received", reader);
    }
    for (const reader of [recycler.bpnl, provider.bpnl]) {
      assert.equal(await listed(operator, reader, productCondition), false, reader);
      assert.equal((await operator.asPartner(reader).get(submodelPath(passport.id, "lifecycle"))).outcome, "contract_refused", reader);
    }
  });
  await t.test("section 2.2 item 7: the responsible operator and a market surveillance authority are admitted to the lifecycle offer and not to the product condition offer", async () => {
    expectData(await operator.call("POST", `/api/passports/${passport.id}/access-records`, { recipientBpnl: recycler.bpnl, recipientRole: "responsibleOperator", aspectKey: "lifecycle" }), 201);
    expectData(await operator.call("POST", `/api/passports/${passport.id}/access-records`, { recipientBpnl: PASSPORT_SERVICE_PROVIDER, recipientRole: "marketSurveillanceAuthority", aspectKey: "lifecycle" }), 201);
    for (const reader of [recycler.bpnl, PASSPORT_SERVICE_PROVIDER]) {
      assert.equal(await listed(operator, reader, lifecycle), true, reader);
      assert.equal(await listed(operator, reader, productCondition), false, reader);
    }
    expectRefusal(await operator.call("POST", `/api/passports/${passport.id}/access-records`, { recipientBpnl: PASSPORT_SERVICE_PROVIDER, recipientRole: "marketSurveillanceAuthority", aspectKey: "product-condition" }), 422, "ERR-LC-ROLE-NOT-ADMITTED");
  });
  await t.test("section 2.2 item 6: after a change of purchaser the earlier purchaser and its agent lose the access, and the new purchaser receives it", async () => {
    const changed = expectData(await operator.call("POST", `/api/passports/${passport.id}/purchaser`, { purchaserBpnl: provider.bpnl }), 200);
    assert.ok(changed.closed.every((record) => record.validTo !== null) && changed.closed.some((record) => record.recipientBpnl === PURCHASER));
    for (const reader of [PURCHASER, SUCCESSOR]) {
      assert.equal(await listed(operator, reader, productCondition), false, reader);
      assert.equal(await listed(operator, reader, lifecycle), false, reader);
      assert.equal((await operator.asPartner(reader).get(submodelPath(passport.id, "product-condition"))).outcome, "contract_refused", reader);
    }
    assert.equal(await listed(operator, provider.bpnl, productCondition), true);
    assert.equal((await operator.asPartner(provider).get(submodelPath(passport.id, "product-condition"))).outcome, "received");
  });
});
