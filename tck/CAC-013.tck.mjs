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


// Criterion CX-0160-4-CAC-013 (Data assets) of Annex A of the proposal, section 4.1. Requirement:
// PrR-CXD-028 (One conformance test per criterion CX-0160-4-CAC-001 to 016), with decision D23 (The
// exposure after the commit). Section 14.3 of docs/architecture/implementation_plan.md.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import { startBinding } from "./lib/binding.mjs";
import { PURCHASER, SEMANTIC_IDS, SUCCESSOR, expectData, givenAccessMap, givenNewPassport, givenOriginalPassport, givenWaste, receivedOf, submodelPath } from "./lib/scenario.mjs";

let binding;
before(async () => {
  binding = await startBinding();
});
after(async () => {
  if (binding) await binding.stop();
});

const ID_SHORTS = Object.freeze({ lifecycle: "batteryPassportLifecycle", successors: "batteryPassportSuccessors", "access-map": "batteryPassportAccessMap" });

// Asserts that the offer of the asset is listed for the reader with its semantic identifier and that
// the shell holds the descriptor of the aspect key with the same semantic identifier and the asset id.
async function assertAsset(participant, reader, { assetId, aspectKey, shellId }) {
  const offer = (await participant.catalogue(reader)).find((item) => item.assetId === assetId);
  assert.ok(offer, `the offer ${assetId} is listed for ${reader}`);
  assert.equal(offer.semanticId, SEMANTIC_IDS[aspectKey]);
  assert.equal(typeof offer.dctType, "string");
  assert.ok(offer.dctType.length > 0);
  const shell = await participant.registry.read(shellId);
  const descriptor = shell.submodelDescriptors.find((item) => item.idShort === ID_SHORTS[aspectKey]);
  assert.ok(descriptor, `the shell ${shellId} holds the descriptor of ${aspectKey}`);
  assert.equal(descriptor.semanticId.keys[0].value, SEMANTIC_IDS[aspectKey]);
  assert.ok(descriptor.endpoints[0].protocolInformation.subprotocolBody.includes(`id=${assetId}`));
  return offer;
}

test("CX-0160-4-CAC-013 (Data assets): the data provider registers each submodel of section 3 as a data asset with its dct:type and its semantic identifier", async (t) => {
  const { provider, operator } = binding;

  await t.test("the access map: an asset of its own with its semantic identifier and the descriptor of the PartType shell, read by EP-ACCESS-MAP", async () => {
    const passport = await givenOriginalPassport(provider);
    await givenAccessMap(provider, passport.batteryModelId);
    const offer = await assertAsset(provider, PURCHASER, { assetId: `access-map-${passport.batteryModelId}`, aspectKey: "access-map", shellId: `urn:uuid:${passport.batteryModelId}` });
    const read = await provider.asPartner(PURCHASER).get(`${offer.path}/submodel`);
    assert.equal(read.outcome, "received", JSON.stringify(read.body));
    assert.equal(read.body.mapVersion, "1.0.0");
  });
  await t.test("the lifecycle submodel: an asset of its own and a descriptor of the PartInstance shell after the waste status received by EP-RX-WASTE", async () => {
    const passport = await givenOriginalPassport(provider);
    await givenWaste(binding, passport);
    await assertAsset(provider, SUCCESSOR, { assetId: `lifecycle-${passport.id}`, aspectKey: "lifecycle", shellId: passport.catenaXId });
    const read = await provider.asPartner(SUCCESSOR).get(submodelPath(passport.id, "lifecycle"));
    assert.equal(read.outcome, "received");
    assert.equal(read.body.wasteResponsibility.successorBpnl, SUCCESSOR);
  });
  await t.test("the successors submodel: an asset of its own and a descriptor of the PartInstance shell after a forward link", async () => {
    const passport = await givenOriginalPassport(provider);
    await givenNewPassport(operator, [passport], "repurposing");
    await binding.settle();
    const notice = (await receivedOf(provider)).find((item) => item.operation === "NewPassportIssued" && item.passportIdentifier === passport.passportIdentifier);
    expectData(await provider.call("POST", `/api/passports/${passport.id}/forward-links`, { messageId: notice.messageId }), 201);
    expectData(await provider.call("POST", `/api/passports/${passport.id}/access-records`, { recipientBpnl: PURCHASER, recipientRole: "authorisedRecipient", aspectKey: "successors" }), 201);
    await assertAsset(provider, PURCHASER, { assetId: `successors-${passport.id}`, aspectKey: "successors", shellId: passport.catenaXId });
    const read = await provider.asPartner(PURCHASER).get(submodelPath(passport.id, "successors"));
    assert.equal(read.outcome, "received");
    assert.equal(read.body.successors.length, 1);
  });
  await t.test("each of the three assets carries one dct:type", async () => {
    const offers = [];
    for (const reader of [PURCHASER, SUCCESSOR]) offers.push(...(await provider.catalogue(reader)).filter((offer) => offer.semanticId !== null));
    assert.ok(offers.length >= 3);
    assert.equal(new Set(offers.map((offer) => offer.dctType)).size, 1, "the dct:type of CX-0160 1.1.0 section 4.1 on every submodel asset");
  });
});
