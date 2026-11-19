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

// Contract: section 9.2.1 of docs/architecture/implementation_plan.md (the logger, with the fixed
// list of field names that the owner accepted on 2026-11-17) and decision D24 (Two database roles
// and row-level security), whose protection of the credentials forbids a connection string in a log.
// No requirement of the registry names the logger (section 17.2 of the specification).
// The one logger of the reference server (EL-BACKEND, the HTTP API). The module names no global
// value: the caller passes the stream and the clock.

// The four levels, in the order of their precedence.
export const LOG_LEVELS = Object.freeze(["error", "warn", "info", "debug"]);

// The 33 field names whose values the logger replaces, in the compared form: lower case, with every
// character outside a to z and 0 to 9 removed.
export const REDACTED_FIELDS = Object.freeze([
  "authorization",
  "cookie",
  "setcookie",
  "headers",
  "rawheaders",
  "token",
  "accesstoken",
  "bearertoken",
  "operatortoken",
  "apikey",
  "xapikey",
  "dataplanekey",
  "edcmanagementapikey",
  "key",
  "secret",
  "operatortokensecret",
  "password",
  "approlepassword",
  "testapprolepassword",
  "postgrespassword",
  "connectionstring",
  "databaseurl",
  "databasemigrationurl",
  "testdatabaseurl",
  "payload",
  "body",
  "content",
  "message",
  "messages",
  "notification",
  "productcondition",
  "map",
  "entries",
]);

// The text that replaces the value of a field of the fixed list.
export const REDACTION_TEXT = "[redacted]";

const CIRCULAR_TEXT = "[circular]";
const LEADING_FIELDS = ["traceId", "route", "actingBpnl"];
const LOGGER_FIELDS = new Set(["time", "level", "message"]);

function comparedName(name) {
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

// Copies a value for the line: replaces the value of every key of the list, writes an Error as
// { name, errorMessage }, and writes a value that the path of the line already holds as [circular].
function copyForLine(value, redacted, ancestors) {
  if (typeof value === "bigint") return value.toString();
  if (value === null || typeof value !== "object") return value;
  if (ancestors.includes(value)) return CIRCULAR_TEXT;
  if (value instanceof Error) return { name: value.name, errorMessage: value.message };
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value.toISOString();
  const path = [...ancestors, value];
  if (Array.isArray(value)) return value.map((item) => copyForLine(item, redacted, path));
  const copy = {};
  for (const [key, item] of Object.entries(value)) {
    copy[key] = redacted.has(comparedName(key)) ? REDACTION_TEXT : copyForLine(item, redacted, path);
  }
  return copy;
}

// Returns a logger with the four methods error, warn, info and debug. Each written line is one JSON
// object followed by one newline character, written with one call of stream.write.
export function createLogger({ level, stream, clock, redactedFieldNames = [] } = {}) {
  if (!LOG_LEVELS.includes(level)) throw new TypeError(`createLogger: the parameter level is not one of ${LOG_LEVELS.join(", ")}`);
  if (stream === null || typeof stream !== "object" || typeof stream.write !== "function") {
    throw new TypeError("createLogger: the parameter stream has no method write");
  }
  if (clock === null || typeof clock !== "object" || typeof clock.now !== "function") {
    throw new TypeError("createLogger: the parameter clock has no method now");
  }
  if (!Array.isArray(redactedFieldNames)) throw new TypeError("createLogger: the parameter redactedFieldNames is not a list");
  const redacted = new Set([...REDACTED_FIELDS, ...redactedFieldNames.map(comparedName)]);
  const configuredPosition = LOG_LEVELS.indexOf(level);

  function write(lineLevel, message, fields) {
    if (LOG_LEVELS.indexOf(lineLevel) > configuredPosition) return;
    const given = fields !== null && typeof fields === "object" && !Array.isArray(fields) ? fields : {};
    const line = { time: clock.now().toISOString(), level: lineLevel, message: String(message) };
    for (const name of LEADING_FIELDS) {
      line[name] = Object.hasOwn(given, name) ? copyForLine(given[name], redacted, [given]) : null;
    }
    for (const [key, value] of Object.entries(given)) {
      if (LOGGER_FIELDS.has(key) || LEADING_FIELDS.includes(key)) continue;
      line[key] = redacted.has(comparedName(key)) ? REDACTION_TEXT : copyForLine(value, redacted, [given]);
    }
    stream.write(`${JSON.stringify(line)}\n`);
  }

  return Object.freeze({
    error: (message, fields) => write("error", message, fields),
    warn: (message, fields) => write("warn", message, fields),
    info: (message, fields) => write("info", message, fields),
    debug: (message, fields) => write("debug", message, fields),
  });
}
