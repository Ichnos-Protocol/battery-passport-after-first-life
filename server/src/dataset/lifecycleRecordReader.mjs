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

// Requirements: SwR-DATASET-126 (Lifecycle data delivered beside the seven aspects in the decided
// carrier), delivered in part by decision D46 (The partial delivery of the lifecycle data), and
// SwR-TWINS-111 (New PartInstance links each original battery, resolving in the registry), with
// decision D5 (The three open items of the carrier decision) and decision D50 (Every admitted form of
// an identifier accepted, one form sent). Sections 9.2.2 and 10.2 of
// docs/architecture/implementation_plan.md and sections 3.2 and 3.3 of the proposal CX-0160-4.
// The reader of the lifecycle record of a passport (EL-DATASET, the battery passport dataset): the
// payloads of the lifecycle model and of the successors model, and the passport record of the operator
// endpoints. The reader writes nothing.
import { normaliseUuid } from "../identifiers.mjs";
import * as passports from "./passportRepository.mjs";

const instant = (value) => (value === null || value === undefined ? null : value.toISOString());
const uuidOrNull = (value) => (value === null || value === undefined ? null : normaliseUuid(value));

// The payload of section 3.2 of the proposal. The property predecessors is always present.
export async function readLifecyclePayload({ client, passportId }) {
  const passport = await passports.findPassport(client, passportId);
  if (passport === null) return null;
  const links = await passports.listLineageLinks(client, passportId);
  const payload = {
    predecessors: links.map((link) => ({
      passportIdentifier: link.predecessor_passport_identifier,
      catenaXId: normaliseUuid(link.predecessor_catena_x_id),
      dataProviderBpnl: link.predecessor_data_provider_bpnl,
      operation: link.operation,
      operationDate: instant(link.operation_date),
    })),
  };
  if (passport.waste_successor_bpnl !== null) {
    payload.wasteResponsibility = { successorBpnl: passport.waste_successor_bpnl, successorRole: passport.waste_successor_role, date: instant(passport.waste_date) };
  }
  if (passport.recycling_date !== null) payload.endOfPassport = { recyclingDate: instant(passport.recycling_date), recyclerBpnl: passport.recycler_bpnl };
  return payload;
}

// The payload of section 3.3 of the proposal.
export async function readSuccessorsPayload({ client, passportId }) {
  const links = await passports.listSuccessorLinks(client, passportId);
  return {
    successors: links.map((link) => ({
      passportIdentifier: link.successor_passport_identifier,
      catenaXId: normaliseUuid(link.successor_catena_x_id),
      secondLifeOperatorBpnl: link.second_life_operator_bpnl,
      operation: link.operation,
      operationDate: instant(link.operation_date),
    })),
  };
}

// The record of a successor link in an answer of the operator endpoints.
export function successorLinkOf(row) {
  return {
    id: row.id,
    passportId: row.passport_id,
    successorPassportIdentifier: row.successor_passport_identifier,
    successorCatenaXId: normaliseUuid(row.successor_catena_x_id),
    secondLifeOperatorBpnl: row.second_life_operator_bpnl,
    operation: row.operation,
    operationDate: instant(row.operation_date),
    notificationMessageId: row.notification_message_id,
  };
}

// The passport record of section 10.2, which EP-PASSPORT-READ and the operator endpoints answer.
export async function readPassportRecord({ client, passportId }) {
  const passport = await passports.findPassport(client, passportId);
  if (passport === null) return null;
  const openInterval = await passports.findOpenResponsibilityInterval(client, passportId);
  const successorLinks = await passports.listSuccessorLinks(client, passportId);
  const repairEntries = await passports.listRepairEntries(client, passportId);
  return {
    id: passport.id,
    catenaXId: normaliseUuid(passport.id),
    passportIdentifier: passport.passport_identifier,
    batteryIdentifier: passport.battery_identifier,
    manufacturerBpnl: passport.manufacturer_bpnl,
    batteryModelId: passport.battery_model_id,
    lifecycleStatus: passport.lifecycle_status,
    batteryCategory: passport.battery_category,
    facilityBpns: passport.facility_bpns,
    dateOfManufacture: passport.date_of_manufacture,
    dateIntoService: passport.date_into_service,
    ratedCapacityAh: passport.rated_capacity_ah,
    capacityFadePercent: passport.capacity_fade_percent,
    powerFadePercent: passport.power_fade_percent,
    expectedLifetimeYears: passport.expected_lifetime_years,
    wasteSuccessor:
      passport.waste_successor_bpnl === null
        ? null
        : { successorBpnl: passport.waste_successor_bpnl, successorRole: passport.waste_successor_role, date: instant(passport.waste_date) },
    successorAuthorisation:
      passport.successor_authorisation_ref === null
        ? null
        : {
            authorisationRef: passport.successor_authorisation_ref,
            validFrom: passport.successor_authorisation_valid_from,
            validTo: passport.successor_authorisation_valid_to,
          },
    endOfPassport:
      passport.recycling_date === null
        ? null
        : {
            recyclingDate: instant(passport.recycling_date),
            recyclerBpnl: passport.recycler_bpnl,
            materialRecyclingCertificateCatenaXId: uuidOrNull(passport.material_recycling_certificate_catena_x_id),
          },
    isSuperseded: successorLinks.length > 0,
    responsibleOperator:
      openInterval === null
        ? null
        : { responsibleBpnl: openInterval.responsible_bpnl, role: openInterval.role, validFrom: instant(openInterval.valid_from) },
    repairEntries: repairEntries.map((repair) => ({
      repairDate: instant(repair.repair_date),
      repairCertificateCatenaXId: normaliseUuid(repair.repair_certificate_catena_x_id),
      repairerBpnl: repair.repairer_bpnl,
    })),
    storedAspectKeys: await passports.listStoredAspectKeys(client, passportId),
  };
}
