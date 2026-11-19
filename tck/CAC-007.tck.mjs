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


// Criterion CX-0160-4-CAC-007 (Waste status) of Annex A of the proposal, section 2.1.5 items 1, 3, 4 and
// 5. Requirements: PrR-CXD-028 (One conformance test per criterion CX-0160-4-CAC-001 to 016), SyR-LIFE-008
// (Status waste set on the existing passport, with no new passport), SyR-LIFE-049 (Responsibility moves
// to a named successor when the battery becomes waste), SyR-LIFE-129 (Producer of the current passport
// takes over a waste battery's passport; not met by decision D17 for a named producer that is not the
// producer of the current passport), SyR-LIFE-144 (End of the passport recorded without the successor's
// authorisation), SyR-LIFE-147 (Waste status notified to the data provider and the named successor) and
// SyR-LIFE-148 (Successor, successor's role and date of the waste status held), with decision D17 (The
// named waste successor) and decision D18 (The successor's authorisation with its period). Section 14.3
// of docs/architecture/implementation_plan.md; lesson 1 (a later step overwrites the manufacturer) of
// section 14.4.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import { startBinding } from "./lib/binding.mjs";
import { DATES, SUCCESSOR, expectData, expectRefusal, givenNewPassport, givenOriginalPassport, passportOf, receivedOf, sentOf, submodelPath } from "./lib/scenario.mjs";

let binding;
before(async () => {
  binding = await startBinding();
});
after(async () => {
  if (binding) await binding.stop();
});

const authorise = (participant, passportId, body) => participant.call("POST", `/api/passports/${passportId}/successor-authorisation`, body);
const putSerialPart = (participant, passport) => participant.call("PUT", `/api/passports/${passport.id}/aspects/serial-part`, { catenaXId: passport.catenaXId, localIdentifiers: [] });

test("CX-0160-4-CAC-007 (Waste status): the waste receiver sends BatteryBecameWaste with the successor, and the data provider sets the status waste on the existing passport, records the successor, keeps the twin readable and changes the passport only under the successor's authorisation, except the record of the end", async (t) => {
  const { provider, operator, recycler } = binding;
  const passport = await givenOriginalPassport(provider);
  let planned;

  await t.test("the waste receiver sends BatteryBecameWaste to the data provider and to the named successor, a producer that is not the manufacturer", async () => {
    planned = expectData(
      await recycler.call("POST", "/api/lifecycle-events/waste", { passportIdentifier: passport.passportIdentifier, dataProviderBpnl: provider.bpnl, successorBpnl: SUCCESSOR, successorRole: "producer", wasteDate: DATES.waste }),
      202,
    ).notifications;
    assert.deepStrictEqual(planned.map((item) => [item.operation, item.receiverBpnl]).sort(), [["BatteryBecameWaste", provider.bpnl], ["BatteryBecameWaste", SUCCESSOR]]);
    await binding.settle();
    const sent = await sentOf(recycler);
    const toProvider = sent.find((item) => item.id === planned.find((entry) => entry.receiverBpnl === provider.bpnl).id);
    assert.equal(toProvider.outcome, "sent");
    assert.deepStrictEqual(toProvider.message.content, { passportIdentifier: passport.passportIdentifier, successorBpnl: SUCCESSOR, successorRole: "producer", date: DATES.waste });
    assert.ok((await receivedOf(provider)).some((item) => item.messageId === toProvider.messageId && item.outcome === "applied"));
  });
  await t.test("the status waste on the same passport, the successor recorded in the lifecycle payload, and the manufacturer of record unchanged", async () => {
    const waste = await passportOf(provider, passport.id);
    assert.deepStrictEqual([waste.id, waste.passportIdentifier, waste.lifecycleStatus], [passport.id, passport.passportIdentifier, "waste"]);
    assert.equal(waste.manufacturerBpnl, provider.bpnl, "no step writes the successor into the manufacturer");
    assert.deepStrictEqual(waste.responsibleOperator, { responsibleBpnl: SUCCESSOR, role: "producer", validFrom: DATES.waste });
    const lifecycle = await provider.call("GET", `/api/passports/${passport.id}/submodels/lifecycle/submodel`);
    assert.deepStrictEqual(lifecycle.body.wasteResponsibility, { successorBpnl: SUCCESSOR, successorRole: "producer", date: DATES.waste });
  });
  await t.test("the twin stays registered and readable with the lifecycle descriptor, and the successor reads the lifecycle submodel", async () => {
    const shell = await provider.registry.read(passport.catenaXId);
    assert.ok(shell.submodelDescriptors.some((descriptor) => descriptor.idShort === "batteryPassportLifecycle"));
    const read = await provider.asPartner(SUCCESSOR).get(submodelPath(passport.id, "lifecycle"));
    assert.equal(read.outcome, "received", JSON.stringify(read.body));
    assert.equal(read.body.wasteResponsibility.successorBpnl, SUCCESSOR);
  });
  await t.test("a change without the successor's authorisation and outside its period answers 403 ERR-LC-SUCCESSOR-AUTHORISATION-MISSING", async () => {
    expectRefusal(await putSerialPart(provider, passport), 403, "ERR-LC-SUCCESSOR-AUTHORISATION-MISSING");
    expectData(await authorise(provider, passport.id, { authorisationRef: "TCK-AUTHORISATION-PAST", validFrom: DATES.authorisationFrom, validTo: DATES.authorisationPastTo }), 200);
    expectRefusal(await putSerialPart(provider, passport), 403, "ERR-LC-SUCCESSOR-AUTHORISATION-MISSING");
  });
  await t.test("a change inside the period of the authorisation is admitted: a payload and the forward link of a preparation for re-use", async () => {
    const recorded = expectData(await authorise(provider, passport.id, { authorisationRef: "TCK-AUTHORISATION-OPEN", validFrom: DATES.authorisationFrom }), 200).passport;
    assert.deepStrictEqual(recorded.successorAuthorisation, { authorisationRef: "TCK-AUTHORISATION-OPEN", validFrom: DATES.authorisationFrom, validTo: null });
    expectData(await putSerialPart(provider, passport), 200);
    const predecessor = { ...(await passportOf(provider, passport.id)), originalPurpose: passport.originalPurpose };
    const created = (await givenNewPassport(operator, [predecessor], "preparationForReUse")).passport;
    await binding.settle();
    const notice = (await receivedOf(provider)).find((item) => item.operation === "NewPassportIssued" && item.message.content.passportIdentifier === created.passportIdentifier);
    expectData(await provider.call("POST", `/api/passports/${passport.id}/forward-links`, { messageId: notice.messageId }), 201);
  });
  await t.test("the end of the passport is recorded without the successor's authorisation", async () => {
    expectData(await authorise(provider, passport.id, { authorisationRef: "TCK-AUTHORISATION-ENDED", validFrom: DATES.authorisationFrom, validTo: DATES.authorisationPastTo }), 200);
    expectRefusal(await putSerialPart(provider, passport), 403, "ERR-LC-SUCCESSOR-AUTHORISATION-MISSING");
    expectData(
      await recycler.call("POST", "/api/lifecycle-events/recycling", { passportIdentifier: passport.passportIdentifier, dataProviderBpnl: provider.bpnl, nameplateManufacturerBpnl: provider.bpnl, receivedFromSuccessorBpnl: SUCCESSOR, recyclingDate: DATES.recycling }),
      202,
    );
    await binding.settle();
    const ended = await passportOf(provider, passport.id);
    assert.deepStrictEqual([ended.lifecycleStatus, ended.endOfPassport?.recyclingDate, ended.endOfPassport?.recyclerBpnl], ["waste", DATES.recycling, recycler.bpnl]);
    assert.deepStrictEqual(ended.wasteSuccessor, { successorBpnl: SUCCESSOR, successorRole: "producer", date: DATES.waste }, "the named successor is permanent");
  });
});
