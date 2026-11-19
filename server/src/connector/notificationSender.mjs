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

// Requirements: SwR-CXCLIENT-183 (Sender's record of a receiver without an asset or a contract),
// SwR-BGWORK-010 (Lifecycle notifications sent unchanged as JSON POST through the connector) and
// SwR-BGWORK-020 (End of a recycled battery's passport sent in time), with decision D8 (Idempotency by
// the message identifier), decision D11 (The receiver resolution behind a port), decision D22 (The
// outbox) and decision D49 (The retry of a failed transport) [waits for the owner]. System requirement
// SyR-LIFE-152 (Receiver without a notification asset recorded by the sender). Section 9.2.5 of
// docs/architecture/implementation_plan.md.
// The sender of the outbox (EL-CXCLIENT, the connector client): each due notification is sent exactly
// as the executor stored it, and each attempt is recorded on its row.
import { withTransaction } from "../db/transaction.mjs";
import { notificationOf } from "../dataset/lifecycleService.mjs";
import { Refusal } from "../dataset/refusals.mjs";

const RETRYABLE_OUTCOMES = Object.freeze(["transport_failed", "receiver_unresolved"]);
const CAUSE_LENGTH = 500;

// The cause of an attempt before the write: every character U+0000 removed, because PostgreSQL refuses
// the character in a text, and the text cut to 500 characters, because a receiver chooses its error code.
export function cleanCause(cause) {
  if (cause === null || cause === undefined) return null;
  const text = String(cause).replaceAll("\u0000", "").slice(0, CAUSE_LENGTH);
  return text.length === 0 ? null : text;
}

// The record of a sent notification in the answer of EP-NOTIFICATIONS-SENT.
export function sentNotificationOf(row) {
  return {
    ...notificationOf(row),
    cause: row.cause,
    httpStatus: row.http_status,
    attempts: row.attempts,
    attemptedAt: row.attempted_at === null ? null : row.attempted_at.toISOString(),
    receiverDid: row.receiver_did,
    receiverConnectorUrl: row.receiver_connector_url,
    message: row.message,
  };
}

// Returns the sender with the functions sendDue, retry and listSent. The function sendDue repeats one
// unit of work until no row qualifies. A thrown error of the receiver resolver or of the transport, which
// the two contracts do not admit, is the result transport_failed. When the write of an attempt fails, the
// sender writes the attempt in a second transaction, so that one row never blocks the outbox (R45-002).
export function createNotificationSender({ pool, repository, transport, receiverResolver, clock, maxAttempts, retrySeconds, ownBpnl, logger }) {
  const options = () => ({ actingBpnl: ownBpnl, today: clock.now().toISOString().slice(0, 10) });

  async function attempt(row) {
    let resolved;
    try {
      resolved = await receiverResolver.resolve(row.receiver_bpnl);
    } catch {
      return { resolved: null, result: { outcome: "transport_failed", httpStatus: null, cause: "receiver resolution failed" } };
    }
    if (resolved === null) return { resolved: null, result: { outcome: "receiver_unresolved", httpStatus: null, cause: `no connector resolved for ${row.receiver_bpnl}` } };
    try {
      const result = await transport.send({ receiverBpnl: row.receiver_bpnl, connectorUrl: resolved.connectorUrl, operation: row.operation, message: row.message });
      return { resolved, result };
    } catch {
      return { resolved, result: { outcome: "transport_failed", httpStatus: null, cause: "transport failed" } };
    }
  }

  // The outcome, the attempt count and the next attempt of the rule of D49 for one result.
  function nextState(row, result, now) {
    const attempts = row.attempts + 1;
    if (result.outcome === "transport_failed" && attempts < maxAttempts) {
      return { outcome: "pending", attempts, notBefore: new Date(now.getTime() + retrySeconds * attempts * 1000) };
    }
    return { outcome: result.outcome, attempts, notBefore: row.not_before };
  }

  // One unit of work: resolves to true when a row was handled, and to false when no row qualifies or when
  // the second write of a failed attempt failed as well.
  async function sendOne() {
    let claimed = null;
    let state = null;
    try {
      return await withTransaction(pool, options(), async (client) => {
        const now = clock.now();
        const row = await repository.claimDueNotification(client, now);
        if (row === null) return false;
        claimed = row;
        const { resolved, result } = await attempt(row);
        state = nextState(row, result, now);
        await repository.recordSendAttempt(client, row.id, {
          outcome: state.outcome,
          cause: cleanCause(result.cause),
          httpStatus: result.httpStatus ?? null,
          attemptedAt: now,
          receiverDid: resolved?.did ?? null,
          receiverConnectorUrl: resolved?.connectorUrl ?? null,
          attempts: state.attempts,
          notBefore: state.notBefore,
        });
        return true;
      });
    } catch (error) {
      if (claimed === null || state === null) throw error;
      const cause = `the attempt record failed: sqlstate ${error.code ?? "none"}`;
      logger.error("The record of a notification attempt failed.", { notificationId: claimed.id, sqlState: error.code ?? null, constraint: error.constraint ?? null });
      try {
        await withTransaction(pool, options(), async (client) => {
          if ((await repository.claimSentNotificationById(client, claimed.id)) === null) return;
          await repository.recordFailedSendAttempt(client, claimed.id, { outcome: state.outcome, cause, attempts: state.attempts, notBefore: state.notBefore });
        });
        return true;
      } catch (second) {
        logger.error("The second record of a notification attempt failed.", { notificationId: claimed.id, sqlState: second.code ?? null, constraint: second.constraint ?? null });
        return false;
      }
    }
  }

  async function sendDue() {
    let handled = 0;
    while (await sendOne()) handled += 1;
    return handled;
  }

  // EP-NOTIFICATION-RETRY: a row of the outcome transport_failed or receiver_unresolved returns to
  // pending with attempts 0, cause null and not_before equal to the current time of the clock.
  async function retry({ client, id }) {
    const row = await repository.findSentNotificationForUpdate(client, id);
    if (row === null) throw new Refusal("ERR-LC-RECORD-NOT-FOUND");
    if (!RETRYABLE_OUTCOMES.includes(row.outcome)) throw new Refusal("ERR-LC-STATUS-NOT-ADMITTED");
    return { notification: sentNotificationOf(await repository.resetSentNotification(client, id, clock.now())) };
  }

  // EP-NOTIFICATIONS-SENT: the sent records in the order of id.
  async function listSent({ client }) {
    return (await repository.listSentNotifications(client)).map(sentNotificationOf);
  }

  return Object.freeze({ sendDue, retry, listSent });
}
