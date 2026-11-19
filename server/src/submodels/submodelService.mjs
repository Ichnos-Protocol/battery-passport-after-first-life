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

// Requirements: SwR-DATASET-193 (New passport served under its own DPP Metadata identifier),
// SwR-DATASET-198 (Successors record served as a submodel of its own) and SwR-SUBMODELS-052 (Submodel
// endpoints change no stored data), with decision D3 (The access map and the whole aspect) [waits for
// the owner] and decision D28 (Supplied payloads). Sections 9.2.4 and 10.6 of
// docs/architecture/implementation_plan.md.
// The submodel service (EL-SUBMODELS, the submodel service): the one catalogue of the aspect keys and
// the read of one submodel of a passport. The service writes nothing.
import { applyGovernedElements } from "../dataset/governedElements.mjs";
import { Refusal } from "../dataset/refusals.mjs";

function aspect(key, idShort, semanticId, twinLevel, source, schemaFile) {
  return Object.freeze({ key, idShort, semanticId, twinLevel, source, schemaFile: schemaFile === null ? null : new URL(schemaFile, import.meta.url) });
}

const IDTA = "../../../sources/IDTA/";

// The aspect keys of section 10.6. The value of source is "built" for a payload that the lifecycle
// record reader builds, "access-map" for the access map of a battery model, and "stored" for a payload
// that the data provider supplies. The value of schemaFile names the schema that validates a stored
// payload, as the address of the file, or is null.
export const ASPECTS = Object.freeze({
  lifecycle: aspect("lifecycle", "batteryPassportLifecycle", "urn:samm:io.catenax.battery.passport_lifecycle:1.0.0#BatteryPassportLifecycle", "PartInstance", "built", null),
  successors: aspect("successors", "batteryPassportSuccessors", "urn:samm:io.catenax.battery.passport_successors:1.0.0#BatteryPassportSuccessors", "PartInstance", "built", null),
  "access-map": aspect(
    "access-map",
    "batteryPassportAccessMap",
    "urn:samm:io.catenax.battery.passport_access_map:1.0.0#BatteryPassportAccessMap",
    "PartType",
    "access-map",
    "../../../docs/api/aspects/BatteryPassportAccessMap-schema.json",
  ),
  "digital-nameplate": aspect(
    "digital-nameplate",
    "batteryNameplate",
    "urn:samm:io.admin-shell.idta.batterypass.digital_nameplate:1.0.0#BatteryNameplate",
    "PartInstance",
    "stored",
    `${IDTA}io.admin-shell.idta.batterypass.digital_nameplate/1.0.0/gen/NameplateBattery-schema.json`,
  ),
  "technical-data": aspect(
    "technical-data",
    "technicalData",
    "urn:samm:io.admin-shell.idta.batterypass.technical_data:1.0.0#TechnicalData",
    "PartInstance",
    "stored",
    `${IDTA}io.admin-shell.idta.batterypass.technical_data/1.0.0/gen/TechnicalDataBattery-schema.json`,
  ),
  "product-condition": aspect(
    "product-condition",
    "productCondition",
    "urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#ProductCondition",
    "PartInstance",
    "stored",
    `${IDTA}io.admin-shell.idta.batterypass.product_condition/1.0.0/gen/ProductConditionBattery-schema.json`,
  ),
  "dpp-metadata": aspect(
    "dpp-metadata",
    "dppMetadata",
    "urn:samm:io.admin-shell.idta.dpp.dpp_metadata:1.0.0#DppMetadata",
    "PartInstance",
    "stored",
    `${IDTA}io.admin-shell.idta.dpp.dpp_metadata/1.0.0/gen/DppMetadata-schema.json`,
  ),
  // not validated: the aspect model is cited and not stored (D28)
  // The semantic identifier of IDTA-02035-2 in version 1.0.0: CX-0160 section 3.3.3, verified by phase P7.
  "handover-documentation": aspect(
    "handover-documentation",
    "handoverDocumentation",
    "urn:samm:io.admin-shell.idta.batterypass.handover_documentation:1.0.0#HandoverDocumentation",
    "PartInstance",
    "stored",
    null,
  ),
  // not validated: the aspect model is cited and not stored (D28)
  // The semantic identifier of IDTA-02035-3 in version 1.0.0: CX-0160 section 3.4.3, verified by phase P7.
  "carbon-footprint": aspect(
    "carbon-footprint",
    "carbonFootprint",
    "urn:samm:io.admin-shell.idta.batterypass.carbon_footprint:1.0.0#CarbonFootprintBattery",
    "PartInstance",
    "stored",
    null,
  ),
  // not validated: the aspect model is cited and not stored (D28)
  // The semantic identifier of IDTA-02035-6 in version 1.0.0: CX-0160 section 3.7.3, verified by phase P7.
  "material-composition": aspect(
    "material-composition",
    "materialComposition",
    "urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#MaterialComposition",
    "PartInstance",
    "stored",
    null,
  ),
  // not validated: the aspect model is cited and not stored (D28)
  // The semantic identifier of IDTA-02035-7 in version 1.0.0: CX-0160 section 3.8.3, verified by phase P7.
  circularity: aspect("circularity", "circularity", "urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#Circularity", "PartInstance", "stored", null),
  // not validated: the aspect model is cited and not stored (D28)
  "serial-part": aspect("serial-part", "serialPart", "urn:samm:io.catenax.serial_part:3.0.0#SerialPart", "PartInstance", "stored", null),
  // not validated: the aspect model is cited and not stored (D28)
  // The semantic identifier of the SingleLevelBomAsBuilt model of CX-0127 2.0.2 (CX-Titan), verified by phase P7.
  "single-level-bom-as-built": aspect(
    "single-level-bom-as-built",
    "singleLevelBomAsBuilt",
    "urn:samm:io.catenax.single_level_bom_as_built:3.0.0#SingleLevelBomAsBuilt",
    "PartInstance",
    "stored",
    null,
  ),
});

// The ten stored aspect keys of passport_aspect_payloads.aspect_key, in the order of section 10.6.
export const STORED_ASPECT_KEYS = Object.freeze(Object.values(ASPECTS).filter((item) => item.source === "stored").map((item) => item.key));

// The seven aspect keys of the IDTA-02035 models, which the access map covers.
export const IDTA_02035_ASPECT_KEYS = Object.freeze([
  "digital-nameplate",
  "handover-documentation",
  "carbon-footprint",
  "technical-data",
  "product-condition",
  "material-composition",
  "circularity",
]);

// The aspect keys of a submodel of a passport: the two built keys and the ten stored keys.
export const PASSPORT_ASPECT_KEYS = Object.freeze(["lifecycle", "successors", ...STORED_ASPECT_KEYS]);

// Returns the submodel service. The function readSubmodel returns the payload of one aspect key of a
// passport: the lifecycle and successors payloads from the lifecycle record reader, and every other
// payload from passport_aspect_payloads with the governed elements of section 10.6 written over the
// stored values. The access decision comes first, so a refused reader learns nothing of the payloads.
export function createSubmodelService({ passportRepository, companyRepository, recordReader, accessRecords }) {
  async function readSubmodel({ client, subject, passportId, aspectKey }) {
    if (!PASSPORT_ASPECT_KEYS.includes(aspectKey)) throw new Refusal("ERR-LC-ASPECT-KEY-UNKNOWN");
    const passport = await passportRepository.findPassport(client, passportId);
    if (passport === null) throw new Refusal("ERR-LC-PASSPORT-NOT-FOUND");
    if (!(await accessRecords.mayRead({ client, subject, passportId, aspectKey }))) throw new Refusal("ERR-AC-ACCESS-GROUP-REFUSED");
    if (aspectKey === "lifecycle") return recordReader.readLifecyclePayload({ client, passportId });
    if (aspectKey === "successors") {
      const payload = await recordReader.readSuccessorsPayload({ client, passportId });
      if (payload.successors.length === 0) throw new Refusal("ERR-LC-SUBMODEL-NOT-FOUND");
      return payload;
    }
    const stored = await passportRepository.findAspectPayload(client, passportId, aspectKey);
    if (stored === null) throw new Refusal("ERR-LC-SUBMODEL-NOT-FOUND");
    const company = await companyRepository.findCompany(client, passport.manufacturer_bpnl);
    const hasLineageLink = (await passportRepository.listLineageLinks(client, passportId)).length > 0;
    return applyGovernedElements({ aspectKey, payload: stored.payload, passport, company, hasLineageLink });
  }
  return Object.freeze({ readSubmodel });
}
