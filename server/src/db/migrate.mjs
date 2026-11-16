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

// Requirements: SwR-DATASET-190 (Passport rows written only under the responsible operator's context),
// SwR-RDB-007 (Dataset writes only by the responsible or an authorised operator),
// SwR-RDB-073 (Timeline of responsible economic operators held per passport),
// SwR-RDB-074 (Change to waste refused without a named successor),
// SwR-RDB-075 (Manufacturer held in each passport record and never empty on write)
// and SwR-DATASET-208 (Database trigger refuses a change of a passport's manufacturer).
// The one migration runner of the schema of the reference server (EL-RDB, the relational database).
import { readdirSync, readFileSync } from "node:fs";

import { SCHEMA_PATTERN } from "./pool.mjs";

const MIGRATIONS_DIRECTORY = new URL("./migrations/", import.meta.url);

// Lists the migration files in the order of their names.
export function listMigrationFiles() {
  return readdirSync(MIGRATIONS_DIRECTORY)
    .filter((name) => name.endsWith(".sql"))
    .sort();
}

// Applies each migration file whose name the table schema_migrations of the schema does not hold,
// each in one transaction that also inserts the file name. Returns the names of the files that
// this run applied. The function leaves the search path of the session at the schema.
export async function migrate(adminClient, { schema }) {
  if (typeof schema !== "string" || !SCHEMA_PATTERN.test(schema)) {
    throw new Error("migrate needs a schema name that matches ^[a-z_][a-z0-9_]{0,62}$.");
  }
  const role = await adminClient.query("SELECT 1 FROM pg_roles WHERE rolname = 'refserver_app'");
  if (role.rowCount === 0) {
    throw new Error('The role refserver_app does not exist. Run "npm run create-role" before "npm run migrate".');
  }
  const schemaName = adminClient.escapeIdentifier(schema);
  await adminClient.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`);
  await adminClient.query(`SET search_path TO ${schemaName}`);
  await adminClient.query(
    "CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())",
  );
  const held = await adminClient.query("SELECT name FROM schema_migrations");
  const heldNames = new Set(held.rows.map((row) => row.name));
  const applied = [];
  for (const name of listMigrationFiles()) {
    if (heldNames.has(name)) continue;
    const sql = readFileSync(new URL(name, MIGRATIONS_DIRECTORY), "utf8");
    await adminClient.query("BEGIN");
    try {
      await adminClient.query(sql);
      await adminClient.query("INSERT INTO schema_migrations (name) VALUES ($1)", [name]);
      await adminClient.query("COMMIT");
    } catch (error) {
      await adminClient.query("ROLLBACK");
      throw error;
    }
    applied.push(name);
  }
  return applied;
}
