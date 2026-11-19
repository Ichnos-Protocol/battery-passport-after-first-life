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


// Criterion CX-0160-4-CAC-003 (Model elements) of Annex A of the proposal, section 2.1.1 item 6 and
// Table 2.1.2. Requirements: PrR-CXD-028 (One conformance test per criterion CX-0160-4-CAC-001 to 016),
// SyR-LIFE-028 (New passport dataset takes over the original battery model), SyR-LIFE-048
// (Responsibility moves to the operator placing the battery again), SyR-LIFE-051 (Operator placing the
// treated battery named as its manufacturer) and SyR-LIFE-151 (New passport accepted only with the
// treated battery's performance values), with decision D15 (The own values of a new passport) and
// decision D35 (The reference to the original battery model). Section 14.3 of
// docs/architecture/implementation_plan.md; lesson 3 (the new passport receives a different battery
// model) of section 14.4.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import { startBinding } from "./lib/binding.mjs";
import { expectRefusal, fixture, givenBatteryModel, givenNewPassport, givenOriginalPassport, givenStoredPayloads, newPassportRequest } from "./lib/scenario.mjs";

let binding;
before(async () => {
  binding = await startBinding();
});
after(async () => {
  if (binding) await binding.stop();
});

const read = async (participant, passportId, key) => {
  const answer = await participant.call("GET", `/api/passports/${passportId}/submodels/${key}/submodel`);
  assert.equal(answer.status, 200, JSON.stringify(answer.body));
  return answer.body;
};

test("CX-0160-4-CAC-003 (Model elements): the second-life operator sets the elements of Table 2.1.2 to its own values and updates the rated capacity, the capacity fade, the power fade and the expected lifetime", async (t) => {
  const { provider, operator } = binding;
  const original = await givenOriginalPassport(provider);
  await givenStoredPayloads(provider, original.id);
  const issued = await givenNewPassport(operator, [original], "repurposing");
  const created = issued.passport;
  await givenStoredPayloads(operator, created.id);
  const nameplate = await read(operator, created.id, "digital-nameplate");
  const originalNameplate = await read(provider, original.id, "digital-nameplate");
  const stored = fixture("nameplate.json");

  await t.test("the nameplate holds the BPNL, the name and the address of the second-life operator and the facility, the dates and the status of the new passport", () => {
    assert.equal(nameplate.ManufacturerIdentifier, operator.bpnl);
    assert.notDeepStrictEqual(nameplate.ManufacturerName, originalNameplate.ManufacturerName, "the name of the second-life operator, not of the original data provider");
    assert.notDeepStrictEqual(nameplate.ManufacturerName, stored.ManufacturerName, "a governed element is never the stored value");
    assert.equal(nameplate.UniqueFacilityIdentifier, issued.body.facilityBpns);
    assert.equal(nameplate.DateOfManufacture, issued.body.dateOfManufacture, "the date of the treatment");
    assert.equal(nameplate.DateOfPuttingIntoService, issued.body.dateIntoService);
    assert.equal(nameplate.LifeCycleStage, "repurposed");
    assert.equal(nameplate.SerialNumber, created.batteryIdentifier);
    assert.notEqual(nameplate.OperatorIdentifier, stored.OperatorIdentifier, "the operator identifier is the second-life operator's own value");
  });
  await t.test("the technical data hold the category of the treated battery, the BPNL of the second-life operator and the four performance values of the request", async () => {
    const technical = await read(operator, created.id, "technical-data");
    assert.equal(technical.GeneralInformation.BatteryCategory, issued.body.batteryCategory);
    assert.notEqual(technical.GeneralInformation.BatteryCategory, original.batteryCategory, "the category may differ from the original category (Art. 45(2))");
    assert.equal(technical.GeneralInformation.ManufacturerIdentifier, operator.bpnl);
    const areas = technical.TechnicalPropertyAreas;
    assert.deepStrictEqual(
      [areas.CapacityEnergyVoltage.RatedCapacity, areas.CapacityEnergyVoltage.CapacityFade, areas.PowerCapability.PowerFade, areas.Lifetime.ExpectedLifetimeInCalendarYears],
      [issued.body.ratedCapacityAh, issued.body.capacityFadePercent, issued.body.powerFadePercent, issued.body.expectedLifetimeYears],
    );
  });
  await t.test("the DPP Metadata hold the passport identifier and the battery identifier of the new passport", async () => {
    const metadata = await read(operator, created.id, "dpp-metadata");
    assert.equal(metadata.digitalProductPassportId, created.passportIdentifier);
    assert.equal(metadata.uniqueProductIdentifier, created.batteryIdentifier);
  });
  await t.test("decision D35: the battery model of the new passport references the original battery model, and a model without the reference answers 409 ERR-LC-MODEL-NOT-ORIGINAL", async () => {
    assert.equal(created.batteryModelId, issued.model.id);
    assert.deepStrictEqual(issued.model.originalModel, { catenaXId: `urn:uuid:${original.batteryModelId}`, manufacturerBpnl: provider.bpnl });
    const plain = await givenBatteryModel(operator);
    const { body } = await newPassportRequest(operator, [original], "repurposing", { batteryModelId: plain.id });
    expectRefusal(await operator.call("POST", "/api/passports/new-passport", body), 409, "ERR-LC-MODEL-NOT-ORIGINAL");
  });
  await t.test("decision D15: a request without the four performance values answers 400 ERR-LC-BODY-INVALID", async () => {
    const { body } = await newPassportRequest(operator, [original], "repurposing");
    for (const name of ["ratedCapacityAh", "capacityFadePercent", "powerFadePercent", "expectedLifetimeYears"]) {
      const { [name]: left, ...without } = body;
      expectRefusal(await operator.call("POST", "/api/passports/new-passport", without), 400, "ERR-LC-BODY-INVALID");
    }
  });
});
