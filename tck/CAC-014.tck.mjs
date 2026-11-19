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


// Criterion CX-0160-4-CAC-014 (Certificates, SHOULD) of Annex A of the proposal, sections 2.1.1 item 8,
// 2.1.5 item 2 and 2.1.7 item 1. Requirement: PrR-CXD-028 (One conformance test per criterion
// CX-0160-4-CAC-001 to 016). Section 14.3 of docs/architecture/implementation_plan.md: the test asserts
// the certificate references only, because the registration of a CX-0131 (Circularity Core) certificate
// is the act of the second-life operator, the waste receiver and the recycler in their own systems.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";

import { startBinding } from "./lib/binding.mjs";
import { DATES, expectData, givenOriginalPassport, passportOf, sentOf } from "./lib/scenario.mjs";

let binding;
before(async () => {
  binding = await startBinding();
});
after(async () => {
  if (binding) await binding.stop();
});

test("CX-0160-4-CAC-014 (Certificates): the sent BatteryRepaired and PassportEnded carry the references of the CX-0131 repair certificate and material recycling certificate of the request", async (t) => {
  const { provider, recycler } = binding;
  const passport = await givenOriginalPassport(provider);

  await t.test("the sent BatteryRepaired carries the repairCertificateCatenaXId of the request", async () => {
    const certificate = `urn:uuid:${randomUUID()}`;
    await recycler.registry.put({ id: certificate, idShort: "repairCertificate", specificAssetIds: [], submodelDescriptors: [] });
    const [planned] = expectData(
      await recycler.call("POST", "/api/lifecycle-events/repair", { passportIdentifier: passport.passportIdentifier, dataProviderBpnl: provider.bpnl, repairDate: DATES.repair, repairCertificateCatenaXId: certificate }),
      202,
    ).notifications;
    await binding.settle();
    const sent = (await sentOf(recycler)).find((item) => item.id === planned.id);
    assert.deepStrictEqual([sent.operation, sent.outcome, sent.message.content.repairCertificateCatenaXId], ["BatteryRepaired", "sent", certificate]);
    assert.ok((await passportOf(provider, passport.id)).repairEntries.some((entry) => entry.repairCertificateCatenaXId === certificate));
  });
  await t.test("the sent PassportEnded carries the materialRecyclingCertificateCatenaXId of the request, and the data provider records the reference with the end", async () => {
    const certificate = `urn:uuid:${randomUUID()}`;
    const planned = expectData(
      await recycler.call("POST", "/api/lifecycle-events/recycling", {
        passportIdentifier: passport.passportIdentifier,
        dataProviderBpnl: provider.bpnl,
        nameplateManufacturerBpnl: provider.bpnl,
        recyclingDate: DATES.recycling,
        materialRecyclingCertificateCatenaXId: certificate,
      }),
      202,
    ).notifications;
    await binding.settle();
    const sent = (await sentOf(recycler)).filter((item) => planned.some((entry) => entry.id === item.id));
    assert.ok(sent.length > 0);
    for (const item of sent) assert.deepStrictEqual([item.operation, item.message.content.materialRecyclingCertificateCatenaXId], ["PassportEnded", certificate]);
    assert.equal((await passportOf(provider, passport.id)).endOfPassport.materialRecyclingCertificateCatenaXId, certificate);
  });
});
