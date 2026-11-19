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

// Tests the governed elements of server/src/dataset/governedElements.mjs.
//
// Requirements of the registry that this file verifies:
//   SwR-DATASET-102 (New dataset fields set at the issue of a new passport)
//   SwR-DATASET-118 (Operator placing a treated battery named its manufacturer)
//   SwR-DATASET-193 (New passport served under its own DPP Metadata identifier)
// Decision D15 (The own values of a new passport) and decision D51 (The form of a manufacturer name
// item) [waits for the owner]. Section 10.6 of the implementation specification.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { GOVERNED_ELEMENTS, applyGovernedElements } from "../src/dataset/governedElements.mjs";
import { createSchemaValidator } from "../src/validation/schemaValidator.mjs";

const fixture = (name) => JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8"));
const FIXTURES = {
  "digital-nameplate": fixture("nameplate.json"),
  "technical-data": fixture("technicalData.json"),
  "product-condition": fixture("productCondition.json"),
  "dpp-metadata": fixture("dppMetadata.json"),
};

// A passport record and a company record as the tables return them. Every value is invented test data.
const PASSPORT = {
  id: "5f0c1c7e-6b1e-4a37-9a59-0b1d7c3e2a10",
  passport_identifier: "urn:uuid:3c1f6c1e-5b7d-4f0a-9d2e-7a4b8c6d5e21",
  battery_identifier: "TCK-BATTERY-0002",
  manufacturer_bpnl: "BPNL00000000TCK2",
  lifecycle_status: "repurposed",
  battery_category: "stationary",
  facility_bpns: "BPNS00000000TCK1",
  date_of_manufacture: "2027-03-01",
  date_into_service: "2027-03-15",
  rated_capacity_ah: 180.5,
  capacity_fade_percent: 12.25,
  power_fade_percent: 8.5,
  expected_lifetime_years: 9.5,
};
const COMPANY = {
  bpnl: "BPNL00000000TCK2",
  legal_name: "Example Second Life Company",
  legal_name_language: "de",
  address: { NationalCode: [{ de: "XX" }], CityTown: [{ de: "Beispielstadt" }], Street: [{ de: "Beispielweg 2" }], ZipCode: [{ de: "11111" }] },
  operator_identifier: "TCK-OPERATOR-0002",
};

function valueAt(payload, path) {
  return path.reduce((value, name) => (value === undefined ? undefined : value[name]), payload);
}

test("SwR-DATASET-102 (New dataset fields set at the issue of a new passport): the governed elements of section 10.6", async (t) => {
  const expected = {
    "digital-nameplate": {
      ManufacturerIdentifier: "BPNL00000000TCK2",
      ManufacturerName: [{ de: "Example Second Life Company" }],
      AddressInformation: COMPANY.address,
      OperatorIdentifier: "TCK-OPERATOR-0002",
      SerialNumber: "TCK-BATTERY-0002",
      UniqueFacilityIdentifier: "BPNS00000000TCK1",
      DateOfManufacture: "2027-03-01",
      DateOfPuttingIntoService: "2027-03-15",
      LifeCycleStage: "repurposed",
    },
    "technical-data": {
      "GeneralInformation.BatteryCategory": "stationary",
      "GeneralInformation.ManufacturerIdentifier": "BPNL00000000TCK2",
      "TechnicalPropertyAreas.CapacityEnergyVoltage.RatedCapacity": 180.5,
      "TechnicalPropertyAreas.CapacityEnergyVoltage.CapacityFade": 12.25,
      "TechnicalPropertyAreas.PowerCapability.PowerFade": 8.5,
      "TechnicalPropertyAreas.Lifetime.ExpectedLifetimeInCalendarYears": 9.5,
    },
    "dpp-metadata": {
      digitalProductPassportId: "urn:uuid:3c1f6c1e-5b7d-4f0a-9d2e-7a4b8c6d5e21",
      uniqueProductIdentifier: "TCK-BATTERY-0002",
    },
  };
  for (const [aspectKey, paths] of Object.entries(expected)) {
    for (const [path, value] of Object.entries(paths)) {
      await t.test(`${aspectKey} $.${path} receives the value of the passport record and replaces the stored value`, () => {
        const names = path.split(".");
        const stored = structuredClone(FIXTURES[aspectKey]);
        const parent = names.slice(0, -1).reduce((value, name) => value[name], stored);
        parent[names[names.length - 1]] = "a stored value";
        const served = applyGovernedElements({ aspectKey, payload: stored, passport: PASSPORT, company: COMPANY, hasLineageLink: true });
        assert.deepStrictEqual(valueAt(served, names), value);
        assert.equal(valueAt(stored, names), "a stored value", "the argument keeps its stored value");
      });
    }
  }
  await t.test("every governed path of section 10.6 is in the table GOVERNED_ELEMENTS", () => {
    const listed = Object.entries(GOVERNED_ELEMENTS).flatMap(([aspectKey, rules]) => rules.map((rule) => `${aspectKey} ${rule.path.join(".")}`));
    const named = Object.entries(expected).flatMap(([aspectKey, paths]) => Object.keys(paths).map((path) => `${aspectKey} ${path}`));
    assert.deepStrictEqual(listed.sort(), named.sort());
  });
  await t.test("decision D51 [waits for the owner]: $.ManufacturerName is the list with one object whose one key is the language code", () => {
    const served = applyGovernedElements({ aspectKey: "digital-nameplate", payload: FIXTURES["digital-nameplate"], passport: PASSPORT, company: COMPANY, hasLineageLink: false });
    assert.deepStrictEqual(served.ManufacturerName, [{ de: "Example Second Life Company" }]);
  });
  await t.test("the four performance values are governed only on a passport with a lineage link", () => {
    const served = applyGovernedElements({ aspectKey: "technical-data", payload: FIXTURES["technical-data"], passport: PASSPORT, company: COMPANY, hasLineageLink: false });
    assert.equal(served.TechnicalPropertyAreas.CapacityEnergyVoltage.RatedCapacity, FIXTURES["technical-data"].TechnicalPropertyAreas.CapacityEnergyVoltage.RatedCapacity);
    assert.equal(served.GeneralInformation.BatteryCategory, "stationary");
  });
  await t.test("a null governed value removes the element", () => {
    const passport = { ...PASSPORT, date_into_service: null };
    const company = { ...COMPANY, operator_identifier: null };
    const served = applyGovernedElements({ aspectKey: "digital-nameplate", payload: FIXTURES["digital-nameplate"], passport, company, hasLineageLink: false });
    assert.equal(Object.hasOwn(served, "DateOfPuttingIntoService"), false);
    assert.equal(Object.hasOwn(served, "OperatorIdentifier"), false);
  });
  await t.test("the payload of an aspect key without a governed element is unchanged, and no argument changes", () => {
    const before = structuredClone(FIXTURES);
    const served = applyGovernedElements({ aspectKey: "product-condition", payload: FIXTURES["product-condition"], passport: PASSPORT, company: COMPANY, hasLineageLink: true });
    assert.deepStrictEqual(served, FIXTURES["product-condition"]);
    applyGovernedElements({ aspectKey: "digital-nameplate", payload: FIXTURES["digital-nameplate"], passport: PASSPORT, company: COMPANY, hasLineageLink: true });
    assert.deepStrictEqual(FIXTURES, before);
  });
});

test("SwR-DATASET-193 (New passport served under its own DPP Metadata identifier): the four fixtures validate against their stored schemas", async (t) => {
  const validator = createSchemaValidator();
  for (const [aspectKey, payload] of Object.entries(FIXTURES)) {
    for (const hasLineageLink of [false, true]) {
      await t.test(`${aspectKey} validates after the governed elements are written, ${hasLineageLink ? "with" : "without"} a lineage link`, () => {
        assert.equal(validator.hasAspectSchema(aspectKey), true);
        assert.equal(validator.validateAspect(aspectKey, payload).valid, true, "the stored fixture validates");
        const served = applyGovernedElements({ aspectKey, payload, passport: PASSPORT, company: COMPANY, hasLineageLink });
        const outcome = validator.validateAspect(aspectKey, served);
        assert.equal(outcome.valid, true, JSON.stringify(outcome.errors));
      });
    }
  }
});
