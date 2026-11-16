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

// Lists every file that lacks the license header of its kind (TRG 7.02) or,
// for a Markdown file, the NOTICE section (TRG 7.07).
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

// Legal texts and files of a format without comments.
const EXEMPT = new Set([
  "LICENSE",
  "LICENSE_non-code",
  "NOTICE.md",
  "SECURITY.md",
  "CONTRIBUTING.md",
  "CODE_OF_CONDUCT.md",
  "AUTHORS.md",
  ".gitignore",
  ".tractusx",
]);
// Third-party texts keep their own notices.
const EXEMPT_PREFIXES = ["sources/"];
const CODE = /\.(mjs|js|cjs|sql|sh|py)$/;
const DATA = /.(ya?ml|ttl)$/;

function lacksNotice(path, text) {
  if (path.endsWith(".md")) {
    return !(text.includes("## NOTICE") && text.includes("SPDX-License-Identifier: CC-BY-4.0"));
  }
  if (CODE.test(path)) return !text.includes("SPDX-License-Identifier: Apache-2.0");
  if (DATA.test(path)) return !/SPDX-License-Identifier: (Apache-2\.0|CC-BY-4\.0)/.test(text);
  return false;
}

const files = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], { encoding: "utf8" })
  .split("\n")
  .filter(Boolean)
  .filter((path) => !EXEMPT.has(path) && !EXEMPT_PREFIXES.some((prefix) => path.startsWith(prefix)));

const missing = files.filter((path) => lacksNotice(path, readFileSync(path, "utf8")));
for (const path of missing) console.log(path);
console.log(`${missing.length} files without a license header or NOTICE section`);
process.exit(missing.length === 0 ? 0 : 1);
