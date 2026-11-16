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
// The command "npm run create-role": creates the role refserver_app, removes the stored settings
// of the role and sets its password APP_ROLE_PASSWORD, under the role of DATABASE_MIGRATION_URL
// (EL-RDB, the relational database). An administrator runs the command once per database cluster,
// before the first migration.
import pg from "pg";

import { createAppRole } from "./createAppRole.mjs";

const connectionString = process.env.DATABASE_MIGRATION_URL;
const password = process.env.APP_ROLE_PASSWORD;
if (!connectionString || !password) {
  process.stderr.write("The command create-role needs the variables DATABASE_MIGRATION_URL and APP_ROLE_PASSWORD.\n");
  process.exit(1);
}

const adminClient = new pg.Client({ connectionString });
let exitCode = 0;
try {
  await adminClient.connect();
  await createAppRole(adminClient, { password });
  process.stdout.write("The role refserver_app exists and has the given password.\n");
} catch (error) {
  process.stderr.write(`The creation of the role refserver_app failed: ${error.message}\n`);
  exitCode = 1;
} finally {
  await adminClient.end();
}
process.exit(exitCode);
