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

// Section 9.8 (Packages, tools, images and their licences) of the implementation specification states the rule.
// Lists every package of the lock file of the current directory whose licence is outside the
// licence list of the repository. The script runs in a directory that holds package-lock.json:
// the script reads the keys of the object "packages" of the lock file, takes every key that
// starts with "node_modules/", and reads the field "license" of the one file <key>/package.json.
//
// Usage, in server/ or in tck/: node ../scripts/check-dependency-licenses.mjs
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

export const ADMITTED_LICENCES = Object.freeze(["MIT", "ISC", "Apache-2.0", "BSD-2-Clause", "BSD-3-Clause", "0BSD", "BlueOak-1.0.0", "CC0-1.0"]);

// Returns the keys of the lock file of the directory that start with "node_modules/".
export function listLockedPackages(directory) {
  const lock = JSON.parse(readFileSync(join(directory, "package-lock.json"), "utf8"));
  return Object.keys(lock.packages ?? {}).filter((key) => key.startsWith("node_modules/"));
}

// Removes one pair of parentheses that surrounds the whole expression.
function withoutSurroundingParentheses(expression) {
  const trimmed = expression.trim();
  return trimmed.startsWith("(") && trimmed.endsWith(")") ? trimmed.slice(1, -1).trim() : trimmed;
}

// A licence passes when the licence is one of the admitted licences. An SPDX expression with OR
// passes when one of its alternatives passes, and an expression with AND passes when each of its
// parts passes. A value that is not a string does not pass.
export function licencePasses(licence) {
  if (typeof licence !== "string") return false;
  const expression = withoutSurroundingParentheses(licence);
  if (expression.length === 0) return false;
  if (/\sOR\s/.test(expression)) return expression.split(/\sOR\s/).some((alternative) => licencePasses(alternative));
  if (/\sAND\s/.test(expression)) return expression.split(/\sAND\s/).every((part) => licencePasses(part));
  return ADMITTED_LICENCES.includes(expression);
}

// Reads the field "license" of the one file <key>/package.json of the directory.
function readLicence(directory, key) {
  return JSON.parse(readFileSync(join(directory, key, "package.json"), "utf8")).license;
}

function main() {
  const directory = process.cwd();
  let outside = 0;
  for (const key of listLockedPackages(directory)) {
    const licence = readLicence(directory, key);
    if (licencePasses(licence)) continue;
    console.log(`${key}: ${typeof licence === "string" ? licence : "no licence field"}`);
    outside += 1;
  }
  console.log(`${outside} packages outside the licence list`);
  process.exit(outside === 0 ? 0 : 1);
}

// The command part runs only when the script is the entry module of the process.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
