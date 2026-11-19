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

// Requirements: SwR-DATASET-102 (New dataset fields set at the issue of a new passport), SwR-DATASET-118
// (Operator placing a treated battery named its manufacturer) and SwR-DATASET-193 (New passport served
// under its own DPP Metadata identifier), with decision D15 (The own values of a new passport) and
// decision D51 (The form of a manufacturer name item) [waits for the owner]. System requirement
// SyR-LIFE-028 (New passport dataset takes over the original battery model). Section 10.6 of
// docs/architecture/implementation_plan.md.
// The elements of a served payload that the passport record governs (EL-DATASET, the battery passport
// dataset). The function of the module is pure.

const asNumber = (value) => (value === null || value === undefined ? null : Number(value));

// The governed elements of section 10.6, per aspect key: the path below the root of the payload and
// the value of the passport record. A rule with onlyWithLineage applies only to a passport with a
// lineage link.
export const GOVERNED_ELEMENTS = Object.freeze({
  "digital-nameplate": Object.freeze([
    { path: ["ManufacturerIdentifier"], value: ({ passport }) => passport.manufacturer_bpnl },
    // Decision D51 [waits for the owner]: one object whose one key is the language code.
    { path: ["ManufacturerName"], value: ({ company }) => [{ [company.legal_name_language]: company.legal_name }] },
    { path: ["AddressInformation"], value: ({ company }) => company.address },
    { path: ["OperatorIdentifier"], value: ({ company }) => company.operator_identifier },
    { path: ["SerialNumber"], value: ({ passport }) => passport.battery_identifier },
    { path: ["UniqueFacilityIdentifier"], value: ({ passport }) => passport.facility_bpns },
    { path: ["DateOfManufacture"], value: ({ passport }) => passport.date_of_manufacture },
    { path: ["DateOfPuttingIntoService"], value: ({ passport }) => passport.date_into_service },
    { path: ["LifeCycleStage"], value: ({ passport }) => passport.lifecycle_status },
  ]),
  "technical-data": Object.freeze([
    { path: ["GeneralInformation", "BatteryCategory"], value: ({ passport }) => passport.battery_category },
    { path: ["GeneralInformation", "ManufacturerIdentifier"], value: ({ passport }) => passport.manufacturer_bpnl },
    { path: ["TechnicalPropertyAreas", "CapacityEnergyVoltage", "RatedCapacity"], onlyWithLineage: true, value: ({ passport }) => asNumber(passport.rated_capacity_ah) },
    { path: ["TechnicalPropertyAreas", "CapacityEnergyVoltage", "CapacityFade"], onlyWithLineage: true, value: ({ passport }) => asNumber(passport.capacity_fade_percent) },
    { path: ["TechnicalPropertyAreas", "PowerCapability", "PowerFade"], onlyWithLineage: true, value: ({ passport }) => asNumber(passport.power_fade_percent) },
    { path: ["TechnicalPropertyAreas", "Lifetime", "ExpectedLifetimeInCalendarYears"], onlyWithLineage: true, value: ({ passport }) => asNumber(passport.expected_lifetime_years) },
  ]),
  "dpp-metadata": Object.freeze([
    { path: ["digitalProductPassportId"], value: ({ passport }) => passport.passport_identifier },
    { path: ["uniqueProductIdentifier"], value: ({ passport }) => passport.battery_identifier },
  ]),
});

// The JSONPath form of a governed path, for example $.GeneralInformation.BatteryCategory.
export function governedPathText(path) {
  return `$.${path.join(".")}`;
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

// Returns a copy of the payload with the governed elements of the aspect key written over the stored
// values. A governed value that is null removes the element. The function creates a missing object on
// the path of a governed value and never changes its arguments.
export function applyGovernedElements({ aspectKey, payload, passport, company, hasLineageLink }) {
  const copy = structuredClone(payload);
  const rules = GOVERNED_ELEMENTS[aspectKey] ?? [];
  if (!isObject(copy)) return copy;
  for (const rule of rules) {
    if (rule.onlyWithLineage && !hasLineageLink) continue;
    const value = rule.value({ passport, company });
    let parent = copy;
    for (const name of rule.path.slice(0, -1)) {
      if (!isObject(parent[name])) {
        if (value === null || value === undefined) {
          parent = null;
          break;
        }
        parent[name] = {};
      }
      parent = parent[name];
    }
    if (parent === null) continue;
    const last = rule.path[rule.path.length - 1];
    if (value === null || value === undefined) delete parent[last];
    else parent[last] = structuredClone(value);
  }
  return copy;
}
