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


// Criterion CX-0160-4-CAC-005 (Forward link) of Annex A of the proposal, section 2.1.3 items 2 to 4.
// Requirements: PrR-CXD-028 (One conformance test per criterion CX-0160-4-CAC-001 to 016), SyR-PASS-005
// (Only the responsible or an authorised operator changes the dataset), SyR-LIFE-024 (Original passport
// kept, superseded relation held in the lineage records), SyR-PASS-230 (Passport data held only for the
// responsible or an authorised operator), SyR-LIFE-130 (Only the original issuer writes into an original
// passport), SyR-LIFE-139 (Original issuer may add a forward link to its own passport), SyR-PASS-232
// (Forward link offered to the issuer's authorised recipients and authorities), SyR-LIFE-143 (Only the
// data provider of a passport writes into that passport) and SyR-LIFE-150 (Last battery status kept on a
// superseded original passport). Section 14.3 of docs/architecture/implementation_plan.md; lessons 4
// (the second-life operator writes the forward link) and 5 (NewPassportIssued reports a status of the
// original passport) of section 14.4.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import { startBinding } from "./lib/binding.mjs";
import { PURCHASER, SUCCESSOR, expectData, expectRefusal, givenNewPassport, givenOriginalPassport, passportOf, receivedOf, submodelPath } from "./lib/scenario.mjs";

let binding;
before(async () => {
  binding = await startBinding();
});
after(async () => {
  if (binding) await binding.stop();
});

// Section 10.7 names no market surveillance authority; the successor without a deployment plays it.
const AUTHORITY = SUCCESSOR;

test("CX-0160-4-CAC-005 (Forward link): the data provider offers the successors submodel only to the authorised recipients and the market surveillance authorities, keeps the last LifeCycleStage of the original passport, and no participant writes into a passport of another data provider", async (t) => {
  const { provider, operator, recycler } = binding;
  const original = await givenOriginalPassport(provider);
  const created = (await givenNewPassport(operator, [original], "repurposing")).passport;
  await binding.settle();
  const [notice] = (await receivedOf(provider)).filter((item) => item.operation === "NewPassportIssued" && item.passportIdentifier === original.passportIdentifier);
  const assetId = `successors-${original.id}`;

  await t.test("the received NewPassportIssued names the new passport and reports no status of the original passport", () => {
    assert.ok(notice, "the original data provider received NewPassportIssued");
    assert.deepStrictEqual(Object.keys(notice.message.content).sort(), ["catenaXId", "operation", "operationDate", "passportIdentifier", "predecessorPassportIdentifier"]);
    assert.equal(notice.message.content.passportIdentifier, created.passportIdentifier);
  });
  await t.test("section 2.1.3 item 4: the status of the original passport is unchanged after the new passport", async () => {
    assert.equal((await passportOf(provider, original.id)).lifecycleStatus, "original");
  });
  await t.test("section 2.1.3 item 2: a request of the second-life operator's deployment on the passport of the original data provider answers 404, and the original data provider's passport is unchanged", async () => {
    const before = await passportOf(provider, original.id);
    expectRefusal(await operator.call("PUT", `/api/passports/${original.id}/aspects/serial-part`, { catenaXId: original.catenaXId }), 404, "ERR-LC-PASSPORT-NOT-FOUND");
    expectRefusal(await operator.call("POST", `/api/passports/${original.id}/forward-links`, { messageId: notice.messageId }), 404, "ERR-LC-PASSPORT-NOT-FOUND");
    expectRefusal(await operator.call("GET", `/api/passports/${original.id}`), 404, "ERR-LC-PASSPORT-NOT-FOUND");
    assert.deepStrictEqual(await passportOf(provider, original.id), before);
  });
  await t.test("the forward link of the original data provider is offered as a data asset of its own, listed for no participant before an access record", async () => {
    const link = expectData(await provider.call("POST", `/api/passports/${original.id}/forward-links`, { messageId: notice.messageId }), 201).link;
    assert.equal(link.successorPassportIdentifier, created.passportIdentifier);
    for (const reader of [PURCHASER, AUTHORITY, operator.bpnl]) assert.equal((await provider.catalogue(reader)).some((offer) => offer.assetId === assetId), false, reader);
    assert.equal((await provider.asPartner(PURCHASER).get(submodelPath(original.id, "successors"))).outcome, "contract_refused");
    const passport = await passportOf(provider, original.id);
    assert.equal(passport.isSuperseded, true);
    assert.equal(passport.lifecycleStatus, "original", "the forward link keeps the last LifeCycleStage");
  });
  await t.test("the successors offer is listed only for the recorded recipients, an authorised recipient and a market surveillance authority, and each reads the forward link", async () => {
    expectData(await provider.call("POST", `/api/passports/${original.id}/access-records`, { recipientBpnl: PURCHASER, recipientRole: "authorisedRecipient", aspectKey: "successors" }), 201);
    expectData(await provider.call("POST", `/api/passports/${original.id}/access-records`, { recipientBpnl: AUTHORITY, recipientRole: "marketSurveillanceAuthority", aspectKey: "successors" }), 201);
    for (const reader of [PURCHASER, AUTHORITY]) {
      assert.ok((await provider.catalogue(reader)).some((offer) => offer.assetId === assetId), reader);
      const read = await provider.asPartner(reader).get(submodelPath(original.id, "successors"));
      assert.equal(read.outcome, "received", JSON.stringify(read.body));
      assert.deepStrictEqual(read.body.successors.map((item) => [item.passportIdentifier, item.catenaXId, item.secondLifeOperatorBpnl]), [[created.passportIdentifier, created.catenaXId, operator.bpnl]]);
    }
    for (const reader of [recycler.bpnl, operator.bpnl]) {
      assert.equal((await provider.catalogue(reader)).some((offer) => offer.assetId === assetId), false, reader);
      assert.equal((await provider.asPartner(reader).get(submodelPath(original.id, "successors"))).outcome, "contract_refused", reader);
    }
  });
  await t.test("the successors submodel is offered to no role outside the authorised recipients and the market surveillance authorities", async () => {
    expectRefusal(await provider.call("POST", `/api/passports/${original.id}/access-records`, { recipientBpnl: recycler.bpnl, recipientRole: "purchaser", aspectKey: "successors" }), 422, "ERR-LC-ROLE-NOT-ADMITTED");
  });
});
