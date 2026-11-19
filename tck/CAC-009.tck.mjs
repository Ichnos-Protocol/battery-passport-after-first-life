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


// Criterion CX-0160-4-CAC-009 (End of the passport) of Annex A of the proposal, section 2.1.7 items 2 to
// 4. Requirements: PrR-CXD-028 (One conformance test per criterion CX-0160-4-CAC-001 to 016), SyR-LIFE-011
// (Recycling ends the battery's passport dataset), SyR-LIFE-127 (End of a recycled battery's passport
// made known to the provider), SyR-LIFE-141 (Passport's data provider, nameplate manufacturer and
// successor notified of the recycling), SyR-LIFE-142 (Predecessor issuers may be notified of the
// recycling under contract) and SyR-LIFE-149 (Date of the recycling and the recycler held in the ended
// passport), with decision D1 (The delay of the end notice), decision D20 (The end of a passport from
// every status) and decision D34 (The passport service provider as a receiver) [waits for the owner].
// Section 14.3 of docs/architecture/implementation_plan.md; lesson 11 (the recycling notice leaves out
// mandatory content) of section 14.4.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import { startBinding } from "./lib/binding.mjs";
import { DATES, PASSPORT_SERVICE_PROVIDER, SUCCESSOR, expectData, expectRefusal, givenNewPassport, givenOriginalPassport, passportOf, sentOf } from "./lib/scenario.mjs";

const DELAY_MILLISECONDS = 5000;

let binding;
before(async () => {
  binding = await startBinding({ passportServiceProviderBpnl: PASSPORT_SERVICE_PROVIDER });
});
after(async () => {
  if (binding) await binding.stop();
});

const time = (text) => new Date(text).getTime();

test("CX-0160-4-CAC-009 (End of the passport): the recycler sends PassportEnded to the receivers of Table 4.3, and the data provider records endOfPassport and makes no other change of the ended passport", async (t) => {
  const { provider, operator, recycler } = binding;
  const original = await givenOriginalPassport(provider);
  const passport = (await givenNewPassport(operator, [original], "repurposing")).passport;
  await binding.settle();
  let planned;

  await t.test("PassportEnded is planned for the data provider, the nameplate manufacturer, the successor and the data provider of the predecessor passport, 5 seconds after the record of the recycling", async () => {
    planned = expectData(
      await recycler.call("POST", "/api/lifecycle-events/recycling", {
        passportIdentifier: passport.passportIdentifier,
        dataProviderBpnl: operator.bpnl,
        nameplateManufacturerBpnl: operator.bpnl,
        receivedFromSuccessorBpnl: SUCCESSOR,
        predecessorDataProviderBpnls: [provider.bpnl],
        recyclingDate: DATES.recycling,
      }),
      202,
    ).notifications;
    assert.deepStrictEqual(planned.map((item) => item.receiverBpnl).sort(), [provider.bpnl, operator.bpnl, SUCCESSOR].sort(), "two rules that name one BPNL produce one notification");
    // D87: the planned send time lies at least 5 seconds after the time of the record, which
    // header.sentDateTime of the stored message holds.
    const stored = await sentOf(recycler);
    for (const item of planned) {
      assert.deepStrictEqual([item.operation, item.outcome], ["PassportEnded", "pending"]);
      const record = stored.find((entry) => entry.id === item.id);
      assert.ok(time(item.notBefore) - time(record.message.header.sentDateTime) >= DELAY_MILLISECONDS, "decision D1: the delay of 5 seconds after the record time");
    }
  });
  await t.test("PassportEnded leaves after the delay with the mandatory content of Table 4.4", async () => {
    await binding.settle();
    const sent = (await sentOf(recycler)).filter((item) => planned.some((entry) => entry.id === item.id));
    for (const item of sent) {
      assert.notEqual(item.outcome, "pending");
      assert.ok(time(item.attemptedAt) >= time(item.notBefore), "no attempt before not_before");
      assert.deepStrictEqual(item.message.content, { passportIdentifier: passport.passportIdentifier, recyclingDate: DATES.recycling, recyclerBpnl: recycler.bpnl });
    }
    assert.equal(sent.find((item) => item.receiverBpnl === operator.bpnl).outcome, "sent");
    assert.equal((await sentOf(recycler)).some((item) => item.receiverBpnl === PASSPORT_SERVICE_PROVIDER), false, "the recycler plans no notification for a passport service provider");
  });
  await t.test("the data provider records endOfPassport in the lifecycle payload and keeps the status", async () => {
    const ended = await passportOf(operator, passport.id);
    assert.deepStrictEqual(ended.endOfPassport, { recyclingDate: DATES.recycling, recyclerBpnl: recycler.bpnl, materialRecyclingCertificateCatenaXId: null });
    assert.equal(ended.lifecycleStatus, "repurposed");
    const lifecycle = await operator.call("GET", `/api/passports/${passport.id}/submodels/lifecycle/submodel`);
    assert.deepStrictEqual(lifecycle.body.endOfPassport, { recyclingDate: DATES.recycling, recyclerBpnl: recycler.bpnl });
  });
  await t.test("decision D34: the data provider sends PassportEnded with the recorded end to the configured passport service provider after the delay", async () => {
    const [notice] = (await sentOf(operator)).filter((item) => item.operation === "PassportEnded" && item.receiverBpnl === PASSPORT_SERVICE_PROVIDER);
    assert.ok(notice, "the notification for the passport service provider is planned");
    assert.deepStrictEqual(notice.message.content, { passportIdentifier: passport.passportIdentifier, recyclingDate: DATES.recycling, recyclerBpnl: recycler.bpnl });
    assert.equal(notice.message.header.senderBpn, operator.bpnl);
    await binding.settle();
    const attempted = (await sentOf(operator)).find((item) => item.id === notice.id);
    assert.notEqual(attempted.outcome, "pending");
    assert.ok(time(attempted.attemptedAt) >= time(attempted.notBefore));
  });
  await t.test("a later change of the ended passport is refused with 409 ERR-LC-PASSPORT-ENDED", async () => {
    expectRefusal(await operator.call("PUT", `/api/passports/${passport.id}/aspects/serial-part`, { catenaXId: passport.catenaXId, localIdentifiers: [] }), 409, "ERR-LC-PASSPORT-ENDED");
  });
  await t.test("a BatteryBecameWaste after the PassportEnded is refused, so a PassportEnded that arrives before BatteryBecameWaste ends the passport with its status unchanged", async () => {
    const before = await passportOf(operator, passport.id);
    const [planned] = expectData(
      await recycler.call("POST", "/api/lifecycle-events/waste", { passportIdentifier: passport.passportIdentifier, dataProviderBpnl: operator.bpnl, successorBpnl: SUCCESSOR, successorRole: "producer", wasteDate: DATES.newWaste }),
      202,
    ).notifications.filter((item) => item.receiverBpnl === operator.bpnl);
    await binding.settle();
    const refused = (await sentOf(recycler)).find((item) => item.id === planned.id);
    assert.deepStrictEqual([refused.outcome, refused.httpStatus, refused.cause], ["receiver_refused", 422, "ERR-RX-STEP-REFUSED"]);
    assert.deepStrictEqual(await passportOf(operator, passport.id), before);
  });
});
