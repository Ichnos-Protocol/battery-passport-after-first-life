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

// Compares every file that an annex of docs/architecture/implementation_plan.md
// prints in full with the file of the repository. An annex block is a heading
// line "#### File: `<path>` (phase P<n>)" followed by a block between two lines
// of four backticks. The comparison ignores the difference between CRLF and LF.
//
// Usage: node scripts/check-annexes.mjs [--require P1|P2|P3]
//   --require P<n>  a file of phase P<n> or of an earlier phase must exist.
import { existsSync, readFileSync } from "node:fs";

const SPECIFICATION = "docs/architecture/implementation_plan.md";
const FENCE = "````";

export function readAnnexFiles(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const files = [];
  for (let i = 0; i < lines.length; i += 1) {
    const heading = /^#### File: `([^`]+)` \(phase P(\d)\)$/.exec(lines[i]);
    if (!heading) continue;
    let start = i + 1;
    while (start < lines.length && !lines[start].startsWith(FENCE)) start += 1;
    let end = start + 1;
    while (end < lines.length && lines[end] !== FENCE) end += 1;
    files.push({ path: heading[1], phase: Number(heading[2]), content: `${lines.slice(start + 1, end).join("\n")}\n` });
    i = end;
  }
  return files;
}

function main() {
  const index = process.argv.indexOf("--require");
  const required = index === -1 ? 0 : Number(String(process.argv[index + 1]).replace(/^P/, ""));
  const files = readAnnexFiles(readFileSync(SPECIFICATION, "utf8"));
  let differ = 0;
  let missing = 0;
  let equal = 0;
  for (const file of files) {
    if (!existsSync(file.path)) {
      if (file.phase <= required) {
        console.log(`${file.path}: missing`);
        missing += 1;
      }
      continue;
    }
    if (readFileSync(file.path, "utf8").replace(/\r\n/g, "\n") === file.content) {
      equal += 1;
    } else {
      console.log(`${file.path}: differs`);
      differ += 1;
    }
  }
  console.log(`${files.length} annex files, ${equal} equal, ${differ} differ, ${missing} missing`);
  process.exit(differ === 0 && missing === 0 ? 0 : 1);
}

if (process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("scripts/check-annexes.mjs")) main();
