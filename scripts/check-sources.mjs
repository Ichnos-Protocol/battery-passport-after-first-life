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

// Compares every file under sources/ with the register sources/SOURCES.json:
// each registered file exists with its SHA-256 value, and no stored file is unregistered.
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = "sources";
const UNREGISTERED_ALLOWED = new Set(["SOURCES.json", "README.md", ".gitattributes"]);

function listFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? listFiles(path) : [path.replace(/\\/g, "/")];
  });
}

const register = JSON.parse(readFileSync(join(ROOT, "SOURCES.json"), "utf8")).files;
const problems = [];
const registered = new Set();

for (const entry of register) {
  const path = `${ROOT}/${entry.path}`;
  registered.add(path);
  if (!existsSync(path)) {
    problems.push(`missing file: ${path}`);
    continue;
  }
  const sha256 = createHash("sha256").update(readFileSync(path)).digest("hex");
  if (sha256 !== entry.sha256) problems.push(`changed file: ${path}`);
  if (!entry.license || !entry.origin) problems.push(`entry without license or origin: ${path}`);
}

for (const path of listFiles(ROOT)) {
  const relative = path.slice(ROOT.length + 1);
  if (!registered.has(path) && !UNREGISTERED_ALLOWED.has(relative)) problems.push(`unregistered file: ${path}`);
}

for (const problem of problems) console.log(problem);
console.log(`${register.length} registered source files, ${problems.length} problems`);
process.exit(problems.length === 0 ? 0 : 1);
