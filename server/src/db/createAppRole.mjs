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

// Requirements: SwR-DATASET-190 (Passport rows written only under the responsible operator's context)
// and SwR-RDB-007 (Dataset writes only by the responsible or an authorised operator).
// Creates the login role refserver_app, the one role under which the server connects
// (EL-RDB, the relational database; decision D24, Two database roles and row-level security).

const ROLE_EXISTS = "42710";

async function begin(adminClient) {
  await adminClient.query("BEGIN");
  await adminClient.query("SELECT pg_advisory_xact_lock(hashtext('refserver_app'))");
}

// Removes every stored setting of the role. PostgreSQL 17 lets a role store settings for its own
// later connections, for every database and for one database, and the statement
// ALTER ROLE refserver_app RESET ALL removes only the settings that apply to every database.
async function removeStoredSettings(adminClient) {
  // First: the settings that apply to every database.
  await adminClient.query("ALTER ROLE refserver_app RESET ALL");
  // Second: the settings for the current database.
  const current = (await adminClient.query("SELECT current_database() AS name")).rows[0].name;
  await adminClient.query(`ALTER ROLE refserver_app IN DATABASE ${adminClient.escapeIdentifier(current)} RESET ALL`);
  // Third: the settings for each other database for which the catalogue still holds a row of the role.
  const others = await adminClient.query(
    "SELECT d.datname FROM pg_db_role_setting s JOIN pg_roles r ON r.oid = s.setrole JOIN pg_database d ON d.oid = s.setdatabase WHERE r.rolname = 'refserver_app'",
  );
  for (const { datname } of others.rows) {
    await adminClient.query(`ALTER ROLE refserver_app IN DATABASE ${adminClient.escapeIdentifier(datname)} RESET ALL`);
    process.stderr.write(`createAppRole: removed the stored settings of refserver_app for the database ${datname}\n`);
  }
  // Fourth: no row of the role remains.
  const remaining = await adminClient.query(
    `SELECT d.datname, s.setconfig FROM pg_db_role_setting s JOIN pg_roles r ON r.oid = s.setrole LEFT JOIN pg_database d ON d.oid = s.setdatabase
      WHERE r.rolname = 'refserver_app'`,
  );
  if (remaining.rowCount > 0) {
    const rows = remaining.rows.map((row) => `${row.datname === null ? "every database" : `the database ${row.datname}`}: ${row.setconfig.join(", ")}`);
    throw new Error(`createAppRole: the role refserver_app still holds a stored setting (${rows.join("; ")}).`);
  }
}

// Runs one transaction: creates the role when the cluster holds no role refserver_app, removes
// every stored setting of the role, and sets the password of the role.
export async function createAppRole(adminClient, { password }) {
  if (typeof password !== "string" || password.length === 0) {
    throw new Error("createAppRole needs a password for the role refserver_app.");
  }
  await begin(adminClient);
  try {
    const existing = await adminClient.query("SELECT 1 FROM pg_roles WHERE rolname = 'refserver_app'");
    if (existing.rowCount === 0) {
      try {
        await adminClient.query("CREATE ROLE refserver_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS");
      } catch (error) {
        if (error.code !== ROLE_EXISTS) throw error;
        // A caller in another database of the cluster created the role: the role exists, which counts as success.
        await adminClient.query("ROLLBACK");
        await begin(adminClient);
      }
    }
    await removeStoredSettings(adminClient);
    await adminClient.query(`ALTER ROLE refserver_app PASSWORD ${adminClient.escapeLiteral(password)}`);
    await adminClient.query("COMMIT");
  } catch (error) {
    await adminClient.query("ROLLBACK");
    throw error;
  }
}
