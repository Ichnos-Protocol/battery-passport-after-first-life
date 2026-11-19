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

// Requirements: SwR-DATASET-087 (Operations admitted only from the statuses the admission table
// allows) and SwR-DATASET-091 (Operations admitted by comparing current and original purpose), with
// decision D40 (The admission rule). System requirements SyR-LIFE-013 (Preparation for re-use or
// repurposing admitted only for waste), SyR-LIFE-014 (Repurposing admitted only for a battery that is
// not waste), SyR-LIFE-015 (Repurposing admitted only for a purpose different from the original),
// SyR-LIFE-016 (Remanufacturing admitted only for the original purpose) and SyR-LIFE-017 (Preparation
// for re-use admitted only for the original purpose).
// The catalogue of the lifecycle (EL-DATASET, the battery passport dataset): the five status values,
// the four notification operations and the four lineage operations.

// The five status values of the IDTA digital nameplate 1.0.0, equal to the CHECK constraint
// passports_lifecycle_status_check of server/src/db/migrations/001_schema.sql.
export const LIFECYCLE_STATUS_VALUES = Object.freeze(["original", "repurposed", "re-used", "remanufactured", "waste"]);

// The three roles of a successor of a waste battery (Art. 77(7), second subparagraph).
export const SUCCESSOR_ROLES = Object.freeze(["producer", "producerResponsibilityOrganisation", "wasteManagementOperator"]);

// The four operations of the lifecycle notification API, each with the context of Table 4.3 of the
// proposal, the content property that names the passport of the receiver (section 10.3 of the
// specification) and the receiving step of section 10.4.
export const OPERATIONS = Object.freeze({
  NewPassportIssued: Object.freeze({
    name: "NewPassportIssued",
    context: "BatteryPass-BatteryPassLifecycleNotificationAPI-NewPassportIssued:1",
    passportIdentifierProperty: "predecessorPassportIdentifier",
    dateProperty: "operationDate",
    receivingStep: "record the notice for a forward link",
  }),
  BatteryRepaired: Object.freeze({
    name: "BatteryRepaired",
    context: "BatteryPass-BatteryPassLifecycleNotificationAPI-BatteryRepaired:1",
    passportIdentifierProperty: "passportIdentifier",
    dateProperty: "repairDate",
    receivingStep: "insert the repair entry and set the status re-used",
  }),
  BatteryBecameWaste: Object.freeze({
    name: "BatteryBecameWaste",
    context: "BatteryPass-BatteryPassLifecycleNotificationAPI-BatteryBecameWaste:1",
    passportIdentifierProperty: "passportIdentifier",
    dateProperty: "date",
    receivingStep: "set the status waste with the named successor",
  }),
  PassportEnded: Object.freeze({
    name: "PassportEnded",
    context: "BatteryPass-BatteryPassLifecycleNotificationAPI-PassportEnded:1",
    passportIdentifierProperty: "passportIdentifier",
    dateProperty: "recyclingDate",
    receivingStep: "record the end of the passport",
  }),
});

export const OPERATION_NAMES = Object.freeze(Object.keys(OPERATIONS));

// The four lineage operations of decision D40: the status that each predecessor needs, whether the
// purpose of the request equals the original purpose, and the status of the new passport.
export const LINEAGE_OPERATIONS = Object.freeze({
  preparationForReUse: Object.freeze({ predecessorWaste: true, samePurpose: true, newStatus: "re-used" }),
  preparationForRepurposing: Object.freeze({ predecessorWaste: true, samePurpose: false, newStatus: "repurposed" }),
  repurposing: Object.freeze({ predecessorWaste: false, samePurpose: false, newStatus: "repurposed" }),
  remanufacturing: Object.freeze({ predecessorWaste: false, samePurpose: true, newStatus: "remanufactured" }),
});

// The normalisation of a purpose before a comparison (section 9.2.2, rule 3): leading and trailing
// white space removed, each run of white space replaced by one space, every letter in lower case.
export function normalisePurpose(text) {
  return String(text).trim().replace(/\s+/g, " ").toLowerCase();
}

// The admission rule of decision D40 for one predecessor: true when the operation is admitted from the
// declared status and the declared original purpose for the purpose of the request.
export function isOperationAdmitted({ operation, status, originalPurpose, purpose }) {
  const rule = Object.hasOwn(LINEAGE_OPERATIONS, operation) ? LINEAGE_OPERATIONS[operation] : undefined;
  if (rule === undefined || !LIFECYCLE_STATUS_VALUES.includes(status)) return false;
  if ((status === "waste") !== rule.predecessorWaste) return false;
  return (normalisePurpose(originalPurpose) === normalisePurpose(purpose)) === rule.samePurpose;
}
