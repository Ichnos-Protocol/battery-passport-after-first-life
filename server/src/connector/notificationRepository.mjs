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
// SwR-CXCLIENT-184 (Notification plan holds one notification per receiver and passport) and
// SwR-BGWORK-010 (Lifecycle notifications sent unchanged as JSON POST through the connector), with
// decision D8 (Idempotency by the message identifier) and decision D22 (The outbox). Section 9.2.5 of
// docs/architecture/implementation_plan.md.
// The one module that holds the SQL on the tables notifications_sent and notifications_received
// (EL-CXCLIENT, the connector client).

const one = (result) => result.rows[0] ?? null;

// Inserts one pending notification of the outbox.
export async function insertSentNotification(client, { messageId, operation, receiverBpnl, passportIdentifier, message, notBefore }) {
  return one(
    await client.query(
      `INSERT INTO notifications_sent (message_id, operation, receiver_bpnl, passport_identifier, message, not_before)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [messageId, operation, receiverBpnl, passportIdentifier, JSON.stringify(message), notBefore],
    ),
  );
}

export async function listSentNotifications(client) {
  return (await client.query("SELECT * FROM notifications_sent ORDER BY id")).rows;
}

export async function findReceivedNotification(client, messageId) {
  return one(await client.query("SELECT * FROM notifications_received WHERE message_id = $1", [messageId]));
}

// Inserts one received record, and returns null when a record with the same messageId exists.
export async function insertReceivedNotification(client, { messageId, operation, senderBpnl, passportIdentifier, message, outcome, receivedAt }) {
  return one(
    await client.query(
      `INSERT INTO notifications_received (message_id, operation, sender_bpnl, passport_identifier, message, outcome, received_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (message_id) DO NOTHING RETURNING *`,
      [messageId, operation, senderBpnl, passportIdentifier, JSON.stringify(message), outcome, receivedAt],
    ),
  );
}

// The received NewPassportIssued record of a messageId for the passport identifier of an original passport.
export async function findReceivedNewPassportIssued(client, { messageId, passportIdentifier }) {
  return one(
    await client.query(
      "SELECT * FROM notifications_received WHERE message_id = $1 AND operation = 'NewPassportIssued' AND passport_identifier = $2",
      [messageId, passportIdentifier],
    ),
  );
}

export async function listReceivedNotifications(client) {
  return (await client.query("SELECT * FROM notifications_received ORDER BY received_at, message_id")).rows;
}
