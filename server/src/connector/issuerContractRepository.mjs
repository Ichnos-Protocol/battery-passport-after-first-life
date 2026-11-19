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

// Requirements: SwR-CXCLIENT-166 (Point 4 offer for the passport issuer gated by a recorded contract),
// SwR-CXCLIENT-167 (Issuer's negotiation for point 4 information run without a user step),
// SwR-CXCLIENT-168 (Point 4 transfer to the issuer stored without a user step) and SwR-CXCLIENT-177
// (Second-life battery's point 4 offer to the original data provider), with decision D38 (The sharing of
// individual battery information). Section 9.2.5 of docs/architecture/implementation_plan.md.
// The one module that holds the SQL on the tables issuer_contracts and received_battery_information
// (EL-CXCLIENT, the connector client).

const one = (result) => result.rows[0] ?? null;

export async function insertIssuerContract(client, contract) {
  return one(
    await client.query(
      `INSERT INTO issuer_contracts (side, passport_identifier, battery_identifier, passport_id, issuer_bpnl, provider_bpnl, product_condition, pull_state, valid_from)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        contract.side,
        contract.passportIdentifier,
        contract.batteryIdentifier ?? null,
        contract.passportId ?? null,
        contract.issuerBpnl,
        contract.providerBpnl,
        contract.productCondition === undefined || contract.productCondition === null ? null : JSON.stringify(contract.productCondition),
        contract.pullState ?? null,
        contract.validFrom,
      ],
    ),
  );
}

export async function findIssuerContract(client, contractId) {
  return one(await client.query("SELECT * FROM issuer_contracts WHERE id = $1", [contractId]));
}

// The contract without an end of one side, passport identifier, issuer and provider (the unique index
// issuer_contracts_open_key).
export async function findUnendedIssuerContract(client, { side, passportIdentifier, issuerBpnl, providerBpnl }) {
  return one(
    await client.query(
      `SELECT * FROM issuer_contracts
        WHERE side = $1 AND passport_identifier = $2 AND issuer_bpnl = $3 AND provider_bpnl = $4 AND valid_to IS NULL`,
      [side, passportIdentifier, issuerBpnl, providerBpnl],
    ),
  );
}

export async function endIssuerContract(client, contractId, validTo) {
  return one(await client.query("UPDATE issuer_contracts SET valid_to = $2 WHERE id = $1 RETURNING *", [contractId, validTo]));
}

export async function setPullState(client, contractId, { pullState, pullCause }) {
  return one(await client.query("UPDATE issuer_contracts SET pull_state = $2, pull_cause = $3 WHERE id = $1 RETURNING *", [contractId, pullState, pullCause]));
}

export async function insertReceivedBatteryInformation(client, { contractId, passportIdentifier, batteryIdentifier, agreementId, payload, receivedAt }) {
  return one(
    await client.query(
      `INSERT INTO received_battery_information (contract_id, passport_identifier, battery_identifier, agreement_id, payload, received_at)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [contractId, passportIdentifier, batteryIdentifier, agreementId, JSON.stringify(payload), receivedAt],
    ),
  );
}

export async function listReceivedBatteryInformation(client, contractId) {
  return (await client.query("SELECT * FROM received_battery_information WHERE contract_id = $1 ORDER BY id", [contractId])).rows;
}

// The puller of section 9.2.5: one issuer contract whose pull state is pending and that has not ended,
// locked so that a concurrent puller skips the row.
export async function claimPendingIssuerContract(client) {
  return one(
    await client.query("SELECT * FROM issuer_contracts WHERE side = 'issuer' AND pull_state = 'pending' AND valid_to IS NULL ORDER BY valid_from, id FOR UPDATE SKIP LOCKED LIMIT 1"),
  );
}

export async function findIssuerContractForUpdate(client, contractId) {
  return one(await client.query("SELECT * FROM issuer_contracts WHERE id = $1 FOR UPDATE", [contractId]));
}
