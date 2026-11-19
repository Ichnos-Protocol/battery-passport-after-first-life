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

// Requirement: PrR-CXD-028 (One conformance test per criterion CX-0160-4-CAC-001 to 016), with decision
// D43 (One test code and two bindings), decision D14 (The identifier rule), decision D15 (The own values
// of a new passport), decision D35 (The reference to the original battery model) and decision D40 (The
// admission rule). Section 9.2.9 of docs/architecture/implementation_plan.md.
// The fixture builders of the sixteen test files. Each builder calls only the endpoints of section 9.3
// through the call of a participant of the binding.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const FIXTURES = new URL("../../server/test/fixtures/", import.meta.url);
export const fixture = (name) => JSON.parse(readFileSync(new URL(name, FIXTURES), "utf8"));

// The Business Partner Numbers of section 10.7 without a deployment.
export const SUCCESSOR = "BPNL00000000TCK4";
export const PURCHASER = "BPNL00000000TCK5";
export const PASSPORT_SERVICE_PROVIDER = "BPNL00000000TCK6";
export const ORIGINAL_PURPOSE = "Traction battery";
export const OTHER_PURPOSE = "Stationary storage";
export const USAGE_PURPOSE = "cx.circular.dpp:1";

// The dates of the scenario, in the order of the life of a battery; each lies before the start of the
// clock of the in-process binding and before the current date of the connector binding.
export const DATES = Object.freeze({
  manufacture: "2026-01-10",
  waste: "2026-02-01T00:00:00.000Z",
  treatment: "2026-02-20",
  operation: "2026-03-01T08:00:00.000Z",
  intoService: "2026-03-15",
  repair: "2026-03-20T09:00:00.000Z",
  newWaste: "2026-04-01T00:00:00.000Z",
  recycling: "2026-05-01T00:00:00.000Z",
  authorisationFrom: "2026-01-01",
  authorisationPastTo: "2026-01-31",
});

// The semantic identifiers of section 10.6. The four identifiers of the models IDTA-02035-2, -3, -6 and
// -7 are the constants of ASPECTS of the server, which section 10.6 names as not verified against a
// stored text; the test of criterion CAC-002 compares them with the descriptors of the twin.
export const SEMANTIC_IDS = Object.freeze({
  lifecycle: "urn:samm:io.catenax.battery.passport_lifecycle:1.0.0#BatteryPassportLifecycle",
  successors: "urn:samm:io.catenax.battery.passport_successors:1.0.0#BatteryPassportSuccessors",
  "access-map": "urn:samm:io.catenax.battery.passport_access_map:1.0.0#BatteryPassportAccessMap",
  "digital-nameplate": "urn:samm:io.admin-shell.idta.batterypass.digital_nameplate:1.0.0#BatteryNameplate",
  "technical-data": "urn:samm:io.admin-shell.idta.batterypass.technical_data:1.0.0#TechnicalData",
  "product-condition": "urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#ProductCondition",
  "dpp-metadata": "urn:samm:io.admin-shell.idta.dpp.dpp_metadata:1.0.0#DppMetadata",
  "handover-documentation": "urn:samm:io.admin-shell.idta.batterypass.handover_documentation:1.0.0#HandoverDocumentation",
  "carbon-footprint": "urn:samm:io.admin-shell.idta.batterypass.carbon_footprint:1.0.0#CarbonFootprint",
  "material-composition": "urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#MaterialComposition",
  circularity: "urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#Circularity",
  "serial-part": "urn:samm:io.catenax.serial_part:3.0.0#SerialPart",
  "single-level-bom-as-built": "urn:samm:io.catenax.single_level_bom_as_built:3.0.0#SingleLevelBomAsBuilt",
});
export const IDTA_02035_KEYS = Object.freeze(["digital-nameplate", "handover-documentation", "carbon-footprint", "technical-data", "product-condition", "material-composition", "circularity"]);
export const STORED_KEYS = Object.freeze([
  "digital-nameplate",
  "handover-documentation",
  "carbon-footprint",
  "technical-data",
  "product-condition",
  "material-composition",
  "circularity",
  "dpp-metadata",
  "serial-part",
  "single-level-bom-as-built",
]);

// The supplied payloads of the four IDTA-02035 aspects without a stored schema (decision D28, Supplied
// payloads), each with one field, and the entry of the access map that covers the field.
const SUPPLIED = Object.freeze({
  "handover-documentation": { field: "Documents", value: [{ DocumentId: "TCK-DOCUMENT-0001" }], accessGroup: "public", legalBasis: "Annex XIII point 1" },
  "carbon-footprint": { field: "BatteryCarbonFootprint", value: { CarbonFootprintPerformanceClass: "TCK-CLASS-A" }, accessGroup: "public", legalBasis: "Annex XIII point 1(c)" },
  "material-composition": { field: "ChemistryInformation", value: { CathodeActiveMaterial: "TCK-MATERIAL" }, accessGroup: "public", legalBasis: "Annex XIII point 1(d)" },
  circularity: { field: "DismantlingAndRemovalInformation", value: [{ DocumentTitle: "TCK-DISMANTLING-0001" }], accessGroup: "legitimateInterestModel", legalBasis: "Annex XIII point 2(b)" },
});

let counter = 0;
export const unique = (prefix) => `${prefix}-${process.pid}-${String((counter += 1)).padStart(4, "0")}`;

// Asserts the status of an answer and returns the field data of an operator answer.
export function expectData(answer, status) {
  assert.equal(answer.status, status, JSON.stringify(answer.body));
  return answer.body.data;
}

// Asserts a refusal with the error body of D9 (The error body).
export function expectRefusal(answer, status, refusalId) {
  assert.equal(answer.status, status, JSON.stringify(answer.body));
  assert.equal(answer.body.success, false);
  assert.equal(answer.body.error.code, refusalId);
  assert.ok(answer.body.messages.length > 0 && answer.body.messages.every((item) => typeof item.text === "string" && item.text.length > 0));
}

// EP-MODEL-CREATE: a battery model of the participant.
export async function givenBatteryModel(participant, overrides = {}) {
  return expectData(await participant.call("POST", "/api/battery-models", { manufacturerPartId: unique("TCK-PART"), ...overrides }), 201).model;
}

// EP-PASSPORT-CREATE: a first passport of the participant, with a battery model of its own unless the
// overrides name one. The result is the passport record with the declared original purpose.
export async function givenOriginalPassport(participant, overrides = {}) {
  const batteryModelId = overrides.batteryModelId ?? (await givenBatteryModel(participant)).id;
  const body = {
    batteryModelId,
    batteryIdentifier: unique("TCK-BATTERY"),
    batteryCategory: "ev",
    facilityBpns: "BPNS00000000TCK1",
    dateOfManufacture: DATES.manufacture,
    originalPurpose: ORIGINAL_PURPOSE,
    passportIdentifier: unique("TCK-PASSPORT"),
    ...overrides,
  };
  const passport = expectData(await participant.call("POST", "/api/passports", body), 201).passport;
  return { ...passport, originalPurpose: body.originalPurpose };
}

// The ten payloads of a passport: the four payload fixtures of the server tests, the four supplied
// IDTA-02035 payloads, a SerialPart payload and a SingleLevelBomAsBuilt payload.
export function storedPayloads(passport) {
  const payloads = {
    "digital-nameplate": fixture("nameplate.json"),
    "technical-data": fixture("technicalData.json"),
    "product-condition": fixture("productCondition.json"),
    "dpp-metadata": fixture("dppMetadata.json"),
    "serial-part": { catenaXId: passport.catenaXId, localIdentifiers: [{ key: "partInstanceId", value: passport.batteryIdentifier }] },
    "single-level-bom-as-built": { catenaXId: passport.catenaXId, childItems: [] },
  };
  for (const [key, item] of Object.entries(SUPPLIED)) payloads[key] = { [item.field]: item.value };
  return payloads;
}

// EP-ASPECT-PUT: stores the ten payloads on the passport and returns them by aspect key.
export async function givenStoredPayloads(participant, passportId) {
  const passport = expectData(await participant.call("GET", `/api/passports/${passportId}`), 200).passport;
  const payloads = storedPayloads(passport);
  for (const key of STORED_KEYS) expectData(await participant.call("PUT", `/api/passports/${passportId}/aspects/${key}`, payloads[key]), 200);
  return payloads;
}

// The access map of section 3.4 of the proposal for the ten payloads: the entries of the fixture of the
// server tests and one entry per field of the four supplied IDTA-02035 payloads.
export function accessMapOf(overrides = {}) {
  const map = fixture("accessMap.json");
  for (const [key, item] of Object.entries(SUPPLIED)) {
    map.entries.push({ aspect: SEMANTIC_IDS[key], twinLevel: "PartInstance", path: `$.${item.field}`, accessGroup: item.accessGroup, legalBasis: item.legalBasis });
  }
  return { ...map, ...overrides };
}

// EP-ACCESS-MAP-PUT: stores the access map of the battery model and returns the stored version.
export async function givenAccessMap(participant, modelId, overrides = {}) {
  return expectData(await participant.call("PUT", `/api/battery-models/${modelId}/access-map`, accessMapOf(overrides)), 201);
}

// The purpose of a new passport that the admission rule of D40 admits for the operation.
const SAME_PURPOSE = Object.freeze({ preparationForReUse: true, preparationForRepurposing: false, repurposing: false, remanufacturing: true });

// EP-ISSUE-NEW-PASSPORT: a new passport of the second-life operator for the predecessors, which are
// passport records of givenOriginalPassport. Without a battery model in the overrides, the builder
// creates a model of the operator that references the battery model of the first predecessor (D35). The
// battery identifier follows D14: kept for one predecessor, new for a remanufacturing or for several
// predecessors. The result holds the field data of the answer, the battery model and the request body.
export async function givenNewPassport(operator, predecessors, operation, overrides = {}) {
  const { model, body } = await newPassportRequest(operator, predecessors, operation, overrides);
  const answer = await operator.call("POST", "/api/passports/new-passport", body);
  return { ...expectData(answer, 201), model, body };
}

// The battery model and the body of a request of EP-ISSUE-NEW-PASSPORT, which givenNewPassport sends and
// which a test of a refusal sends itself.
export async function newPassportRequest(operator, predecessors, operation, overrides = {}) {
  const [first] = predecessors;
  const model =
    overrides.batteryModelId === undefined
      ? await givenBatteryModel(operator, { originalModel: { catenaXId: first.batteryModelId, manufacturerBpnl: first.manufacturerBpnl } })
      : null;
  const renewed = operation === "remanufacturing" || predecessors.length > 1;
  const body = {
    operation,
    predecessors: predecessors.map((item) => ({
      passportIdentifier: item.passportIdentifier,
      catenaXId: item.catenaXId,
      dataProviderBpnl: item.manufacturerBpnl,
      batteryIdentifier: item.batteryIdentifier,
      lifeCycleStage: item.lifecycleStatus,
      originalPurpose: item.originalPurpose,
      originalModelCatenaXId: item.batteryModelId,
    })),
    batteryModelId: model?.id,
    batteryIdentifier: renewed ? unique("TCK-BATTERY") : first.batteryIdentifier,
    batteryCategory: "stationary",
    facilityBpns: "BPNS00000000TCK1",
    purpose: SAME_PURPOSE[operation] ? first.originalPurpose : OTHER_PURPOSE,
    dateOfManufacture: DATES.treatment,
    dateIntoService: DATES.intoService,
    ratedCapacityAh: 180.07,
    capacityFadePercent: 12.25,
    powerFadePercent: 8.5,
    expectedLifetimeYears: 9.5,
    operationDate: DATES.operation,
    passportIdentifier: unique("TCK-PASSPORT"),
    ...overrides,
  };
  return { model, body };
}

// EP-REPORT-WASTE of the recycler as the waste receiver, and the delivery of the planned notifications.
export async function givenWaste(binding, passport, { successorBpnl = SUCCESSOR, successorRole = "producer", wasteDate = DATES.waste } = {}) {
  const notifications = expectData(
    await binding.recycler.call("POST", "/api/lifecycle-events/waste", { passportIdentifier: passport.passportIdentifier, dataProviderBpnl: passport.manufacturerBpnl, successorBpnl, successorRole, wasteDate }),
    202,
  ).notifications;
  await binding.settle();
  return notifications;
}

// The records of EP-NOTIFICATIONS-SENT and EP-NOTIFICATIONS-RECEIVED of a participant.
export const sentOf = async (participant) => expectData(await participant.call("GET", "/api/notifications/sent"), 200).notifications;
export const receivedOf = async (participant) => expectData(await participant.call("GET", "/api/notifications/received"), 200).notifications;

// EP-PASSPORT-READ.
export const passportOf = async (participant, passportId) => expectData(await participant.call("GET", `/api/passports/${passportId}`), 200).passport;

// The path of the submodel of an aspect key of a passport behind the data plane (section 10.5).
export const submodelPath = (passportId, aspectKey) => `/api/passports/${passportId}/submodels/${aspectKey}/submodel`;
