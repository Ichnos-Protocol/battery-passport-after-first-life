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
// decision D25 (The audit table) and decision D69 (The audit record after a failed write is queued).
// Section 9.2.7 of docs/architecture/implementation_plan.md.
// The audit trail of the write decisions on a passport (EL-AUDIT, the audit trail). The helper of the
// routes calls record after the transaction of the request has ended and the request has released its
// database client; the outbox worker calls writeQueued.
import { withTransaction } from "../db/transaction.mjs";

// The twelve actions of the table of section 9.2.7.
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

const LAST_ERROR_LENGTH = 500;
const MAXIMUM_PAUSE_SECONDS = 86400;

function lastErrorOf(error) {
  const text = `sqlstate ${error?.code ?? "none"}${error?.constraint ? ` constraint ${error.constraint}` : ""}`;
  return text.slice(0, LAST_ERROR_LENGTH);
}

// Returns the audit log of a deployment with the functions record and writeQueued. The function record
// never throws: a failed insert queues the entries in audit_outbox, and the answer of the request keeps
// the true outcome (D69).
export function createAuditLog({ pool, repository, clock, logger, ownBpnl, retrySeconds }) {
  const options = () => ({ actingBpnl: ownBpnl, today: clock.now().toISOString().slice(0, 10) });
  const summary = (entries) => ({
    actions: entries.map((entry) => entry.action),
    passportIds: entries.map((entry) => entry.passportId ?? null),
  });

  async function record(entries) {
    if (!Array.isArray(entries) || entries.length === 0) return { written: true, queued: false };
    const decidedAt = clock.now();
    let failure;
    try {
      await withTransaction(pool, options(), async (client) => {
        for (const entry of entries) await repository.insertWriteDecision(client, entry, decidedAt);
      });
      return { written: true, queued: false };
    } catch (error) {
      failure = error;
    }
    logger.error("The audit record of a write decision failed and is queued.", { sqlState: failure.code ?? null, constraint: failure.constraint ?? null, ...summary(entries) });
    try {
      await withTransaction(pool, options(), (client) => repository.insertAuditOutbox(client, { entries, decidedAt, notBefore: decidedAt }));
      return { written: false, queued: true };
    } catch (second) {
      logger.error("The audit record of a write decision is lost.", {
        ...summary(entries),
        refusalIds: entries.map((entry) => entry.refusalId ?? null),
        sqlStates: [failure.code ?? null, second.code ?? null],
      });
      return { written: false, queued: false };
    }
  }

  // One unit of the queue: resolves to true when a row was handled, and to false when no row qualifies
  // or when the record of a failed attempt failed as well.
  async function writeOne() {
    let claimed = null;
    try {
      return await withTransaction(pool, options(), async (client) => {
        const row = await repository.claimDueAuditOutbox(client, clock.now());
        if (row === null) return false;
        claimed = row;
        for (const entry of row.entries) await repository.insertWriteDecision(client, entry, row.decided_at);
        await repository.markAuditOutboxWritten(client, row.id, clock.now());
        return true;
      });
    } catch (error) {
      if (claimed === null) throw error;
      logger.error("A queued audit record was not written.", { auditOutboxId: claimed.id, sqlState: error.code ?? null, constraint: error.constraint ?? null });
      const attempts = claimed.attempts + 1;
      const pauseSeconds = Math.min(retrySeconds * attempts, MAXIMUM_PAUSE_SECONDS);
      try {
        await withTransaction(pool, options(), async (client) => {
          if ((await repository.claimAuditOutboxById(client, claimed.id)) === null) return;
          await repository.recordAuditOutboxFailure(client, claimed.id, { attempts, lastError: lastErrorOf(error), notBefore: new Date(clock.now().getTime() + pauseSeconds * 1000) });
        });
        return true;
      } catch (second) {
        logger.error("The attempt record of a queued audit record failed.", { auditOutboxId: claimed.id, sqlState: second.code ?? null });
        return false;
      }
    }
  }

  async function writeQueued() {
    let handled = 0;
    while (await writeOne()) handled += 1;
    return handled;
  }

  return Object.freeze({ record, writeQueued });
}
