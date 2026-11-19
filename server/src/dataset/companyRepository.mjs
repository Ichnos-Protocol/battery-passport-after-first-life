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

// Requirement: SwR-RDB-075 (Manufacturer held in each passport record and never empty on write).
// Sections 9.2.1 and 9.2.2 of docs/architecture/implementation_plan.md.
// The one module that holds the SQL on the table companies (EL-DATASET, the battery passport dataset).

// Inserts or updates the one record of the own company of the deployment, with the four values of
// the configuration of section 9.6.
export async function upsertOwnCompany(pool, config) {
  const result = await pool.query(
    `INSERT INTO companies (bpnl, legal_name, legal_name_language, address, operator_identifier) VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (bpnl) DO UPDATE SET legal_name = EXCLUDED.legal_name, legal_name_language = EXCLUDED.legal_name_language,
       address = EXCLUDED.address, operator_identifier = EXCLUDED.operator_identifier
     RETURNING *`,
    [config.ownBpnl, config.ownLegalName, config.ownLegalNameLanguage, JSON.stringify(config.ownAddress), config.ownOperatorIdentifier],
  );
  return result.rows[0];
}

// Returns the record of a company, or null.
export async function findCompany(client, bpnl) {
  return (await client.query("SELECT * FROM companies WHERE bpnl = $1", [bpnl])).rows[0] ?? null;
}
