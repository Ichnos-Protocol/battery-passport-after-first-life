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

// Requirement: SwR-RDB-007 (Dataset writes only by the responsible or an authorised operator).
// The command "npm run migrate": applies the migration files to the schema DATABASE_SCHEMA under
// the role of DATABASE_MIGRATION_URL, the role that owns the schema (EL-RDB, the relational database).
import pg from "pg";

import { migrate } from "./migrate.mjs";

const connectionString = process.env.DATABASE_MIGRATION_URL;
const schema = process.env.DATABASE_SCHEMA;
if (!connectionString || !schema) {
  process.stderr.write("The command migrate needs the variables DATABASE_MIGRATION_URL and DATABASE_SCHEMA.\n");
  process.exit(1);
}

const adminClient = new pg.Client({ connectionString });
let exitCode = 0;
try {
  await adminClient.connect();
  const applied = await migrate(adminClient, { schema });
  for (const name of applied) process.stdout.write(`applied ${name}\n`);
  process.stdout.write(`${applied.length} migration files applied to the schema ${schema}\n`);
} catch (error) {
  process.stderr.write(`The migration failed: ${error.message}\n`);
  exitCode = 1;
} finally {
  await adminClient.end();
}
process.exit(exitCode);
