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

// Requirements: SwR-DATASET-065 (Every dataset field marked with exactly one Art. 77(2) access group)
// and SwR-SUBMODELS-036 (Access marking assigns every served passport field one group). Section 9.2.4
// of docs/architecture/implementation_plan.md.
// The one module that holds the SQL on the tables access_map_versions and access_map_entries
// (EL-SUBMODELS, the submodel service). The version is inserted in one statement and the entries in
// later statements of the same transaction, because the policy access_map_entries_own reads the
// stored version (section 9.4.3).

export async function insertAccessMapVersion(client, { modelId, mapVersion, validFrom }) {
  const result = await client.query(
    "INSERT INTO access_map_versions (battery_model_id, map_version, valid_from) VALUES ($1, $2, $3) RETURNING *",
    [modelId, mapVersion, validFrom],
  );
  return result.rows[0];
}

export async function insertAccessMapEntry(client, { mapId, aspect, twinLevel, path, accessGroup, legalBasis }) {
  const result = await client.query(
    "INSERT INTO access_map_entries (map_id, aspect, twin_level, path, access_group, legal_basis) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [mapId, aspect, twinLevel, path, accessGroup, legalBasis],
  );
  return result.rows[0];
}

export async function accessMapVersionExists(client, { modelId, mapVersion }) {
  return (await client.query("SELECT 1 FROM access_map_versions WHERE battery_model_id = $1 AND map_version = $2", [modelId, mapVersion])).rowCount > 0;
}

// The version whose valid_from is the latest date that is not after today; among versions with one
// valid_from the version with the highest id.
export async function findCurrentAccessMapVersion(client, { modelId, today }) {
  const result = await client.query(
    "SELECT * FROM access_map_versions WHERE battery_model_id = $1 AND valid_from <= $2 ORDER BY valid_from DESC, id DESC LIMIT 1",
    [modelId, today],
  );
  return result.rows[0] ?? null;
}

// The versions whose valid_from is after today, in the order of valid_from and id.
export async function listLaterAccessMapVersions(client, { modelId, today }) {
  return (await client.query("SELECT * FROM access_map_versions WHERE battery_model_id = $1 AND valid_from > $2 ORDER BY valid_from, id", [modelId, today])).rows;
}

export async function hasAccessMapVersion(client, modelId) {
  return (await client.query("SELECT 1 FROM access_map_versions WHERE battery_model_id = $1 LIMIT 1", [modelId])).rowCount > 0;
}

// The entries of one version, in the order of their primary key.
export async function listAccessMapEntries(client, mapId) {
  return (await client.query("SELECT * FROM access_map_entries WHERE map_id = $1 ORDER BY aspect, twin_level, path", [mapId])).rows;
}
