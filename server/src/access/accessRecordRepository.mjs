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

// Requirements: SwR-ACCESS-127 (Purchaser for point 4 access taken from the open access record) and
// SwR-ACCESS-129 (Previous holder's point 4 access ends with the closed access record). Section 9.2.3
// of docs/architecture/implementation_plan.md.
// The one module that holds the SQL on the table passport_access_records (EL-ACCESS, the access
// control). An open record is a record whose valid_from is not after the given time and whose
// valid_to is null or after the given time.

const one = (result) => result.rows[0] ?? null;

export async function insertAccessRecord(client, { passportId, recipientBpnl, recipientRole, aspectKey, validFrom }) {
  return one(
    await client.query(
      `INSERT INTO passport_access_records (passport_id, recipient_bpnl, recipient_role, aspect_key, valid_from)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [passportId, recipientBpnl, recipientRole, aspectKey, validFrom],
    ),
  );
}

export async function findAccessRecord(client, passportId, recordId) {
  return one(await client.query("SELECT * FROM passport_access_records WHERE passport_id = $1 AND id = $2", [passportId, recordId]));
}

// The record without an end for one recipient, aspect key and role (the unique index
// passport_access_records_open_key).
export async function findUnendedAccessRecord(client, { passportId, recipientBpnl, aspectKey, recipientRole }) {
  return one(
    await client.query(
      `SELECT * FROM passport_access_records
        WHERE passport_id = $1 AND recipient_bpnl = $2 AND aspect_key = $3 AND recipient_role = $4 AND valid_to IS NULL`,
      [passportId, recipientBpnl, aspectKey, recipientRole],
    ),
  );
}

export async function endAccessRecord(client, recordId, validTo) {
  return one(await client.query("UPDATE passport_access_records SET valid_to = $2 WHERE id = $1 RETURNING *", [recordId, validTo]));
}

// Ends every record without an end of the given roles of a passport and returns the ended records.
export async function endAccessRecordsOfRoles(client, { passportId, recipientRoles, validTo }) {
  return (
    await client.query(
      `UPDATE passport_access_records SET valid_to = $3
        WHERE passport_id = $1 AND recipient_role = ANY($2::text[]) AND valid_to IS NULL
        RETURNING *`,
      [passportId, recipientRoles, validTo],
    )
  ).rows.sort((left, right) => left.id - right.id);
}

// True when an open record of the passport, the recipient and the aspect key exists at the time.
export async function hasOpenAccessRecord(client, { passportId, recipientBpnl, aspectKey, at }) {
  const result = await client.query(
    `SELECT 1 FROM passport_access_records
      WHERE passport_id = $1 AND recipient_bpnl = $2 AND aspect_key = $3 AND valid_from <= $4 AND (valid_to IS NULL OR valid_to > $4)
      LIMIT 1`,
    [passportId, recipientBpnl, aspectKey, at],
  );
  return result.rowCount > 0;
}

// The Business Partner Numbers of the open records of a passport and an aspect key at the time.
export async function listOpenRecipients(client, { passportId, aspectKey, at }) {
  return (
    await client.query(
      `SELECT DISTINCT recipient_bpnl FROM passport_access_records
        WHERE passport_id = $1 AND aspect_key = $2 AND valid_from <= $3 AND (valid_to IS NULL OR valid_to > $3)
        ORDER BY recipient_bpnl`,
      [passportId, aspectKey, at],
    )
  ).rows.map((row) => row.recipient_bpnl);
}

export async function listAccessRecords(client, passportId) {
  return (await client.query("SELECT * FROM passport_access_records WHERE passport_id = $1 ORDER BY id", [passportId])).rows;
}
