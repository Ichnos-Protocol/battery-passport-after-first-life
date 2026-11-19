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

// Requirement: SwR-AUDIT-045 (Dataset write decisions recorded with the authorisation relied on), with
// decision D25 (The audit table). Section 9.2.7 of docs/architecture/implementation_plan.md.
// The one module that holds the SQL on the table passport_write_decisions (EL-AUDIT, the audit trail).

export async function insertWriteDecision(client, entry, decidedAt) {
  const result = await client.query(
    `INSERT INTO passport_write_decisions (decided_at, decision, requester_bpnl, requester_kind, passport_id, action, relied_on, refusal_id, details)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [
      decidedAt,
      entry.decision,
      entry.requesterBpnl,
      entry.requesterKind,
      entry.passportId ?? null,
      entry.action,
      entry.reliedOn ?? null,
      entry.refusalId ?? null,
      entry.details === null || entry.details === undefined ? null : JSON.stringify(entry.details),
    ],
  );
  return result.rows[0];
}

export async function listWriteDecisions(client) {
  return (await client.query("SELECT * FROM passport_write_decisions ORDER BY id")).rows;
}
