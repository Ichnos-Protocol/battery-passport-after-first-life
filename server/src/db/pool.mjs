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
// The one factory of the connection pool of the role refserver_app (EL-RDB, the relational database).
// Importing this module reads no environment variable and creates no client.
import pg from "pg";

// The pattern of a schema name, which the migration runner applies as well.
export const SCHEMA_PATTERN = /^[a-z_][a-z0-9_]{0,62}$/;

const DATE_OID = 1082;
const NUMERIC_OID = 1700;
const BIGINT_OID = 20;

// The type "date" is read as the stored text YYYY-MM-DD, and the types "numeric" and "bigint"
// are read as JavaScript numbers. Every other type keeps the parser of the library pg.
const TEXT_PARSERS = new Map([
  [DATE_OID, (value) => value],
  [NUMERIC_OID, (value) => Number(value)],
  [BIGINT_OID, (value) => Number(value)],
]);

const types = Object.freeze({
  getTypeParser(oid, format) {
    if (format !== "binary" && TEXT_PARSERS.has(oid)) return TEXT_PARSERS.get(oid);
    return pg.types.getTypeParser(oid, format);
  },
});

// Returns a pool whose every connection reads the schema first, uses the time zone UTC and starts
// each transaction at the isolation level READ COMMITTED in read-write mode. The four settings of
// the connection take precedence over a stored setting of the role.
export function createPool({ connectionString, schema, size }) {
  if (typeof connectionString !== "string" || connectionString.length === 0) {
    throw new Error("createPool needs a connection string.");
  }
  if (typeof schema !== "string" || !SCHEMA_PATTERN.test(schema)) {
    throw new Error("createPool needs a schema name that matches ^[a-z_][a-z0-9_]{0,62}$.");
  }
  if (!Number.isInteger(size) || size < 1) {
    throw new Error("createPool needs a pool size that is an integer of 1 or more.");
  }
  return new pg.Pool({
    connectionString,
    max: size,
    options: `-c search_path=${schema} -c timezone=UTC -c default_transaction_isolation=read\\ committed -c default_transaction_read_only=off`,
    types,
  });
}
