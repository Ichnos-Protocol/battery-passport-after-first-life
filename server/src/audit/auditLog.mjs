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
// The audit trail of the write decisions on a passport (EL-AUDIT, the audit trail). The helper of the
// routes calls record after the transaction of the request has ended and the request has released
// its database client.
import { withTransaction } from "../db/transaction.mjs";
import { Refusal } from "../dataset/refusals.mjs";

// The eleven actions of the table of section 9.2.7.
export const AUDIT_ACTIONS = Object.freeze([
  "passport.create",
  "passport.issue",
  "aspect.put",
  "forward-link.add",
  "successor-authorisation.record",
  "notification.apply.NewPassportIssued",
  "notification.apply.BatteryRepaired",
  "notification.apply.BatteryBecameWaste",
  "notification.apply.PassportEnded",
  "purchaser.change",
  "access-record.add",
  "access-record.end",
]);

// Returns the audit log of a deployment. The function record inserts one record of
// passport_write_decisions per entry, with decided_at equal to the current time of the clock, in one
// transaction of its own. A failed insert is logged at the level error and is thrown as the refusal
// ERR-LC-INTERNAL.
export function createAuditLog({ pool, repository, clock, logger, ownBpnl }) {
  async function record(entries) {
    if (!Array.isArray(entries) || entries.length === 0) return [];
    const now = clock.now();
    try {
      return await withTransaction(pool, { actingBpnl: ownBpnl, today: now.toISOString().slice(0, 10) }, async (client) => {
        const stored = [];
        for (const entry of entries) stored.push(await repository.insertWriteDecision(client, entry, now));
        return stored;
      });
    } catch (error) {
      logger.error("The audit record of a write decision failed.", { sqlState: error.code ?? null, constraint: error.constraint ?? null, error });
      throw new Refusal("ERR-LC-INTERNAL");
    }
  }
  return Object.freeze({ record });
}
