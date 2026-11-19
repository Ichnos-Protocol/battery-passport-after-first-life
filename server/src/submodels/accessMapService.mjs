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

// Requirements: SwR-DATASET-065 (Every dataset field marked with exactly one Art. 77(2) access group)
// and SwR-SUBMODELS-036 (Access marking assigns every served passport field one group), with decision
// D3 (The access map and the whole aspect) [waits for the owner], decision D27 (A subset of JSONPath)
// and decision D45 (The data provider's check of a new payload). System requirement SyR-PASS-011
// (Every dataset field marked with exactly one access group). Section 9.2.4 of
// docs/architecture/implementation_plan.md.
// The access map service (EL-SUBMODELS, the submodel service): the versions of the access map of a
// battery model, the coverage rule and the read of the current access map.
import { applyGovernedElements } from "../dataset/governedElements.mjs";
import { Refusal } from "../dataset/refusals.mjs";
import { validatorMessages } from "../validation/schemaValidator.mjs";
import { allLeaves, compilePath, matchLeaves } from "./jsonPathSubset.mjs";
import { ASPECTS, IDTA_02035_ASPECT_KEYS } from "./submodelService.mjs";

const PART_INSTANCE = "PartInstance";

// The payload of section 3.4 of the proposal of one stored version.
function accessMapPayload(version, entries) {
  return {
    mapVersion: version.map_version,
    validFrom: version.valid_from,
    entries: entries.map((entry) => ({
      aspect: entry.aspect,
      twinLevel: entry.twin_level,
      path: entry.path,
      accessGroup: entry.access_group,
      legalBasis: entry.legal_basis,
    })),
  };
}

// The entries of a map for one aspect key at the twin level PartInstance.
function entriesOfAspect(map, aspectKey) {
  const semanticId = ASPECTS[aspectKey]?.semanticId;
  return (map?.entries ?? []).filter((entry) => entry.aspect === semanticId && entry.twinLevel === PART_INSTANCE);
}

// The coverage rule: returns one message per leaf of the payload that no entry of the map matches,
// and one message per leaf whose matching entries carry two access groups or more. An empty list
// means that the map covers the payload.
export function coverageProblems(map, aspectKey, payload) {
  const groupsByLeaf = new Map();
  for (const entry of entriesOfAspect(map, aspectKey)) {
    const compiled = compilePath(entry.path);
    if (compiled === null) continue;
    for (const leaf of matchLeaves(compiled, payload)) {
      if (!groupsByLeaf.has(leaf)) groupsByLeaf.set(leaf, new Set());
      groupsByLeaf.get(leaf).add(entry.accessGroup);
    }
  }
  const problems = [];
  for (const leaf of allLeaves(payload)) {
    const groups = groupsByLeaf.get(leaf);
    if (groups === undefined) problems.push(`${aspectKey} ${leaf}: the field has no entry of the access map`);
    else if (groups.size > 1) problems.push(`${aspectKey} ${leaf}: the field has entries of the access groups ${[...groups].sort().join(" and ")}`);
  }
  return problems;
}

// Returns the access map service.
export function createAccessMapService({ repository, passportRepository, companyRepository, validator, clock }) {
  const today = () => clock.now().toISOString().slice(0, 10);

  async function readVersionPayload(client, version) {
    return version === null ? null : accessMapPayload(version, await repository.listAccessMapEntries(client, version.id));
  }

  // The access map version whose valid_from is the latest date that is not after today, as the payload
  // of section 3.4 of the proposal, or null.
  async function readAccessMap({ client, modelId, today: date }) {
    return readVersionPayload(client, await repository.findCurrentAccessMapVersion(client, { modelId, today: date }));
  }

  // The current map and every stored version whose valid_from is after today.
  async function mapsToCheck(client, modelId) {
    const date = today();
    const maps = [];
    const current = await readAccessMap({ client, modelId, today: date });
    if (current !== null) maps.push(current);
    for (const version of await repository.listLaterAccessMapVersions(client, { modelId, today: date })) maps.push(await readVersionPayload(client, version));
    return maps;
  }

  // The problems of a payload with the governed elements written over it, against the current map and
  // every later version. A battery model without a stored version admits every payload.
  async function payloadCoverageProblems({ client, modelId, aspectKey, payload }) {
    if (!IDTA_02035_ASPECT_KEYS.includes(aspectKey)) return [];
    const problems = [];
    for (const map of await mapsToCheck(client, modelId)) {
      for (const problem of coverageProblems(map, aspectKey, payload)) problems.push(`mapVersion ${map.mapVersion}: ${problem}`);
    }
    return problems;
  }

  // True when the current map holds one entry or more for the aspect key at the twin level
  // PartInstance and every such entry has the access group public (section 9.2.4).
  async function isPublicWithoutRecord({ client, modelId, aspectKey }) {
    if (!IDTA_02035_ASPECT_KEYS.includes(aspectKey)) return false;
    const entries = entriesOfAspect(await readAccessMap({ client, modelId, today: today() }), aspectKey);
    return entries.length > 0 && entries.every((entry) => entry.accessGroup === "public");
  }

  // The IDTA-02035 aspect keys for which the current map holds one entry or more of the access group
  // legitimateInterestBattery at the twin level PartInstance (decision D30, The change of purchaser).
  async function legitimateInterestBatteryKeys({ client, modelId }) {
    const map = await readAccessMap({ client, modelId, today: today() });
    return IDTA_02035_ASPECT_KEYS.filter((aspectKey) => entriesOfAspect(map, aspectKey).some((entry) => entry.accessGroup === "legitimateInterestBattery"));
  }

  // The advisory lock of a battery model, which putAccessMap takes first and putAspectPayload takes
  // after the row lock of its passport (finding R45-005).
  async function lockModel({ client, modelId }) {
    await repository.lockBatteryModel(client, modelId);
  }

  // Stores a new version of the access map of a battery model of the own company.
  async function putAccessMap({ client, modelId, map }) {
    await repository.lockBatteryModel(client, modelId);
    if ((await passportRepository.findBatteryModel(client, modelId)) === null) throw new Refusal("ERR-LC-MODEL-NOT-FOUND");
    const validation = validator.validateAspect("access-map", map);
    if (!validation.valid) throw new Refusal("ERR-LC-BODY-INVALID", { messages: validatorMessages(validation.errors) });
    const unsupported = map.entries.filter((entry) => compilePath(entry.path) === null).map((entry) => `${entry.path}: the path lies outside the supported subset`);
    if (unsupported.length > 0) throw new Refusal("ERR-LC-PATH-NOT-SUPPORTED", { messages: unsupported });
    // A repeated entry of one aspect, twin level and path is refused before any insert (finding R45-009):
    // two groups for one field break the rule of one group per field, and two equal entries are invalid.
    const groupsByField = new Map();
    for (const entry of map.entries) {
      const field = JSON.stringify([entry.aspect, entry.twinLevel, entry.path]);
      if (!groupsByField.has(field)) groupsByField.set(field, []);
      groupsByField.get(field).push(entry.accessGroup);
    }
    const repeated = [...groupsByField.entries()].filter(([, groups]) => groups.length > 1);
    const twoGroups = repeated.filter(([, groups]) => new Set(groups).size > 1);
    if (twoGroups.length > 0) {
      throw new Refusal("ERR-LC-ACCESS-MAP-INCOMPLETE", { messages: twoGroups.map(([field, groups]) => `${JSON.parse(field).join(" ")}: the entries name the access groups ${[...new Set(groups)].sort().join(" and ")}`) });
    }
    if (repeated.length > 0) throw new Refusal("ERR-LC-BODY-INVALID", { messages: repeated.map(([field]) => `${JSON.parse(field).join(" ")}: the entry is repeated`) });
    if (await repository.accessMapVersionExists(client, { modelId, mapVersion: map.mapVersion })) throw new Refusal("ERR-LC-ACCESS-MAP-VERSION-EXISTS");
    const problems = [];
    const passportIds = await passportRepository.listPassportIdsOfModel(client, modelId);
    for (const passportId of passportIds) {
      const passport = await passportRepository.findPassport(client, passportId);
      const company = await companyRepository.findCompany(client, passport.manufacturer_bpnl);
      const hasLineageLink = (await passportRepository.listLineageLinks(client, passportId)).length > 0;
      for (const stored of await passportRepository.listAspectPayloads(client, passportId)) {
        if (!IDTA_02035_ASPECT_KEYS.includes(stored.aspect_key)) continue;
        const served = applyGovernedElements({ aspectKey: stored.aspect_key, payload: stored.payload, passport, company, hasLineageLink });
        for (const problem of coverageProblems(map, stored.aspect_key, served)) problems.push(`passport ${passportId}: ${problem}`);
      }
    }
    if (problems.length > 0) throw new Refusal("ERR-LC-ACCESS-MAP-INCOMPLETE", { messages: problems });
    const version = await repository.insertAccessMapVersion(client, { modelId, mapVersion: map.mapVersion, validFrom: map.validFrom });
    const entries = [];
    for (const entry of map.entries) entries.push(await repository.insertAccessMapEntry(client, { mapId: version.id, ...entry }));
    return { id: version.id, accessMap: accessMapPayload(version, entries), passportIds };
  }

  return Object.freeze({ lockModel, putAccessMap, readAccessMap, payloadCoverageProblems, isPublicWithoutRecord, legitimateInterestBatteryKeys, coverageProblems });
}
