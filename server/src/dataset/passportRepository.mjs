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

// Requirements: SwR-RDB-073 (Timeline of responsible economic operators held per passport),
// SwR-RDB-075 (Manufacturer held in each passport record and never empty on write) and SwR-DATASET-190
// (Passport rows written only under the responsible operator's context). Section 9.2.2 of
// docs/architecture/implementation_plan.md.
// The one module that holds the SQL on the tables passports, battery_models, passport_purposes,
// passport_lineage_links, passport_successor_links, passport_repair_entries,
// passport_responsibility_intervals and passport_aspect_payloads (EL-DATASET, the battery passport
// dataset). Every function runs in the transaction of the client of its caller, and every statement
// passes its values as parameters.

const one = (result) => result.rows[0] ?? null;

// Battery models.
export async function insertBatteryModel(client, { manufacturerBpnl, manufacturerPartId, originalModelCatenaXId, originalModelManufacturerBpnl }) {
  return one(
    await client.query(
      `INSERT INTO battery_models (manufacturer_bpnl, manufacturer_part_id, original_model_catena_x_id, original_model_manufacturer_bpnl)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [manufacturerBpnl, manufacturerPartId, originalModelCatenaXId, originalModelManufacturerBpnl],
    ),
  );
}
export async function findBatteryModel(client, modelId) {
  return one(await client.query("SELECT * FROM battery_models WHERE id = $1", [modelId]));
}
export async function findBatteryModelByPartId(client, manufacturerPartId) {
  return one(await client.query("SELECT * FROM battery_models WHERE manufacturer_part_id = $1", [manufacturerPartId]));
}
export async function listPassportIdsOfModel(client, modelId) {
  return (await client.query("SELECT id FROM passports WHERE battery_model_id = $1 ORDER BY id", [modelId])).rows.map((row) => row.id);
}

// Passports.
export async function insertPassport(client, passport) {
  const columns = Object.keys(passport);
  const placeholders = columns.map((_, index) => `$${index + 1}`);
  return one(
    await client.query(
      `INSERT INTO passports (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`,
      columns.map((column) => passport[column]),
    ),
  );
}
export async function findPassport(client, passportId) {
  return one(await client.query("SELECT * FROM passports WHERE id = $1", [passportId]));
}
export async function findPassportForUpdate(client, passportId) {
  return one(await client.query("SELECT * FROM passports WHERE id = $1 FOR UPDATE", [passportId]));
}
export async function findPassportByIdentifierForUpdate(client, passportIdentifier) {
  return one(await client.query("SELECT * FROM passports WHERE passport_identifier = $1 FOR UPDATE", [passportIdentifier]));
}
export async function passportIdentifierExists(client, passportIdentifier) {
  return (await client.query("SELECT 1 FROM passports WHERE passport_identifier = $1", [passportIdentifier])).rowCount > 0;
}
export async function setLifecycleStatus(client, passportId, status) {
  await client.query("UPDATE passports SET lifecycle_status = $2 WHERE id = $1", [passportId, status]);
}
export async function setWasteStatus(client, passportId, { successorBpnl, successorRole, date }) {
  await client.query(
    "UPDATE passports SET lifecycle_status = 'waste', waste_successor_bpnl = $2, waste_successor_role = $3, waste_date = $4 WHERE id = $1",
    [passportId, successorBpnl, successorRole, date],
  );
}
export async function setEndOfPassport(client, passportId, { recyclingDate, recyclerBpnl, certificateCatenaXId }) {
  await client.query(
    "UPDATE passports SET recycling_date = $2, recycler_bpnl = $3, material_recycling_certificate_catena_x_id = $4 WHERE id = $1",
    [passportId, recyclingDate, recyclerBpnl, certificateCatenaXId],
  );
}
export async function setSuccessorAuthorisation(client, passportId, { authorisationRef, validFrom, validTo }) {
  await client.query(
    `UPDATE passports SET successor_authorisation_ref = $2, successor_authorisation_valid_from = $3, successor_authorisation_valid_to = $4
      WHERE id = $1`,
    [passportId, authorisationRef, validFrom, validTo],
  );
}
export async function closeLineage(client, passportId) {
  await client.query("UPDATE passports SET lineage_open = false WHERE id = $1", [passportId]);
}

// Purposes.
export async function insertPurpose(client, { passportId, purpose, isOriginal, recordedAt }) {
  return one(
    await client.query("INSERT INTO passport_purposes (passport_id, purpose, is_original, recorded_at) VALUES ($1, $2, $3, $4) RETURNING *", [
      passportId,
      purpose,
      isOriginal,
      recordedAt,
    ]),
  );
}
export async function findOriginalPurpose(client, passportId) {
  return one(await client.query("SELECT * FROM passport_purposes WHERE passport_id = $1 AND is_original", [passportId]));
}
export async function listPurposes(client, passportId) {
  return (await client.query("SELECT * FROM passport_purposes WHERE passport_id = $1 ORDER BY id", [passportId])).rows;
}

// Lineage links of a new passport.
export async function insertLineageLink(client, link) {
  return one(
    await client.query(
      `INSERT INTO passport_lineage_links (passport_id, predecessor_passport_identifier, predecessor_catena_x_id, predecessor_data_provider_bpnl,
         predecessor_battery_identifier, predecessor_status, predecessor_original_model_catena_x_id, operation, operation_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        link.passportId,
        link.predecessorPassportIdentifier,
        link.predecessorCatenaXId,
        link.predecessorDataProviderBpnl,
        link.predecessorBatteryIdentifier,
        link.predecessorStatus,
        link.predecessorOriginalModelCatenaXId,
        link.operation,
        link.operationDate,
      ],
    ),
  );
}
export async function listLineageLinks(client, passportId) {
  return (await client.query("SELECT * FROM passport_lineage_links WHERE passport_id = $1 ORDER BY id", [passportId])).rows;
}

// Successor links of an original passport.
export async function insertSuccessorLink(client, link) {
  return one(
    await client.query(
      `INSERT INTO passport_successor_links (passport_id, successor_passport_identifier, successor_catena_x_id, second_life_operator_bpnl,
         operation, operation_date, notification_message_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        link.passportId,
        link.successorPassportIdentifier,
        link.successorCatenaXId,
        link.secondLifeOperatorBpnl,
        link.operation,
        link.operationDate,
        link.notificationMessageId,
      ],
    ),
  );
}
export async function findSuccessorLink(client, passportId, successorPassportIdentifier) {
  return one(
    await client.query("SELECT * FROM passport_successor_links WHERE passport_id = $1 AND successor_passport_identifier = $2", [
      passportId,
      successorPassportIdentifier,
    ]),
  );
}
export async function listSuccessorLinks(client, passportId) {
  return (await client.query("SELECT * FROM passport_successor_links WHERE passport_id = $1 ORDER BY id", [passportId])).rows;
}

// Repair entries.
export async function insertRepairEntry(client, { passportId, repairDate, repairCertificateCatenaXId, repairerBpnl, notificationMessageId }) {
  return one(
    await client.query(
      `INSERT INTO passport_repair_entries (passport_id, repair_date, repair_certificate_catena_x_id, repairer_bpnl, notification_message_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [passportId, repairDate, repairCertificateCatenaXId, repairerBpnl, notificationMessageId],
    ),
  );
}
export async function findRepairEntryByCertificate(client, passportId, repairCertificateCatenaXId) {
  return one(
    await client.query("SELECT * FROM passport_repair_entries WHERE passport_id = $1 AND repair_certificate_catena_x_id = $2", [
      passportId,
      repairCertificateCatenaXId,
    ]),
  );
}
export async function listRepairEntries(client, passportId) {
  return (await client.query("SELECT * FROM passport_repair_entries WHERE passport_id = $1 ORDER BY id", [passportId])).rows;
}

// Responsibility intervals.
export async function insertResponsibilityInterval(client, { passportId, responsibleBpnl, role, validFrom }) {
  return one(
    await client.query(
      "INSERT INTO passport_responsibility_intervals (passport_id, responsible_bpnl, role, valid_from) VALUES ($1, $2, $3, $4) RETURNING *",
      [passportId, responsibleBpnl, role, validFrom],
    ),
  );
}
export async function findOpenResponsibilityInterval(client, passportId) {
  return one(await client.query("SELECT * FROM passport_responsibility_intervals WHERE passport_id = $1 AND valid_to IS NULL", [passportId]));
}
export async function closeOpenResponsibilityInterval(client, passportId, validTo) {
  await client.query("UPDATE passport_responsibility_intervals SET valid_to = $2 WHERE passport_id = $1 AND valid_to IS NULL", [passportId, validTo]);
}
export async function listResponsibilityIntervals(client, passportId) {
  return (await client.query("SELECT * FROM passport_responsibility_intervals WHERE passport_id = $1 ORDER BY valid_from, id", [passportId])).rows;
}

// Aspect payloads.
export async function upsertAspectPayload(client, { passportId, aspectKey, payload, updatedAt }) {
  return one(
    await client.query(
      `INSERT INTO passport_aspect_payloads (passport_id, aspect_key, payload, updated_at) VALUES ($1, $2, $3, $4)
       ON CONFLICT (passport_id, aspect_key) DO UPDATE SET payload = EXCLUDED.payload, updated_at = EXCLUDED.updated_at
       RETURNING *`,
      [passportId, aspectKey, JSON.stringify(payload), updatedAt],
    ),
  );
}
export async function findAspectPayload(client, passportId, aspectKey) {
  return one(await client.query("SELECT * FROM passport_aspect_payloads WHERE passport_id = $1 AND aspect_key = $2", [passportId, aspectKey]));
}
export async function listAspectPayloads(client, passportId) {
  return (await client.query("SELECT * FROM passport_aspect_payloads WHERE passport_id = $1 ORDER BY aspect_key", [passportId])).rows;
}
export async function listStoredAspectKeys(client, passportId) {
  return (await client.query("SELECT aspect_key FROM passport_aspect_payloads WHERE passport_id = $1 ORDER BY aspect_key", [passportId])).rows.map(
    (row) => row.aspect_key,
  );
}
