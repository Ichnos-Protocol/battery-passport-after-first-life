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
// The test database of the server tests and of the in-process binding of the conformance test kit.
// The module reads the two variables TEST_DATABASE_URL and TEST_APP_ROLE_PASSWORD.
import pg from "pg";

import { createAppRole } from "../../src/db/createAppRole.mjs";
import { migrate } from "../../src/db/migrate.mjs";
import { createPool } from "../../src/db/pool.mjs";

const APP_POOL_SIZE = 4;
let counter = 0;

function readVariable(name) {
  const value = process.env[name];
  if (typeof value !== "string" || value.length === 0) throw new Error(`The tests need the variable ${name}.`);
  return value;
}

// Opens a further connection of the role of TEST_DATABASE_URL with the search path of the schema
// and the time zone UTC. The caller ends the client.
export async function connectAdminClient(schema) {
  const client = new pg.Client({ connectionString: readVariable("TEST_DATABASE_URL") });
  await client.connect();
  await client.query("SET TIME ZONE 'UTC'");
  if (schema !== undefined) await client.query(`SET search_path TO ${client.escapeIdentifier(schema)}`);
  return client;
}

// The connection string of the role refserver_app on the database of TEST_DATABASE_URL.
export function appConnectionString() {
  const url = new URL(readVariable("TEST_DATABASE_URL"));
  url.username = "refserver_app";
  url.password = readVariable("TEST_APP_ROLE_PASSWORD");
  return url.toString();
}

// Creates the role refserver_app and one migrated schema of the name t_<label>_<process id>_<counter>.
export async function createTestDatabase(label) {
  const password = readVariable("TEST_APP_ROLE_PASSWORD");
  const adminClient = await connectAdminClient();
  try {
    const role = await adminClient.query("SELECT rolsuper OR rolbypassrls AS admitted FROM pg_roles WHERE rolname = current_user");
    if (role.rowCount !== 1 || role.rows[0].admitted !== true) {
      throw new Error("TEST_DATABASE_URL must name a superuser or a role with BYPASSRLS");
    }
    await createAppRole(adminClient, { password });
    counter += 1;
    const cutLabel = String(label).toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 30);
    const schema = `t_${cutLabel}_${process.pid}_${counter}`;
    await migrate(adminClient, { schema });
    const appPool = createPool({ connectionString: appConnectionString(), schema, size: APP_POOL_SIZE });
    return {
      schema,
      adminClient,
      appPool,
      async drop() {
        await appPool.end();
        try {
          await adminClient.query(`DROP SCHEMA ${adminClient.escapeIdentifier(schema)} CASCADE`);
        } finally {
          await adminClient.end();
        }
      },
    };
  } catch (error) {
    await adminClient.end();
    throw error;
  }
}
