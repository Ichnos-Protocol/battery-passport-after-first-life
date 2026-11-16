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

// Lists every line of a tracked or untracked non-ignored file outside sources/
// that names a private repository, a private path, a person, a host or a
// service of a private deployment, a contract matter, or an e-mail address.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

// The names and paths that no file of this repository may hold.
const PRIVATE_REFERENCE = new RegExp(
  [
    "EU_Battery_Passport",
    "Battery_Passport_demo",
    "BackEnd/",
    "Kamran",
    "Hanno",
    "Traycer",
    "\\bNeon\\b",
    "Firebase",
    "Vercel",
    "ichnos-protocol\\.com",
    "docs/requirements/",
    "docs/Catena-X",
    "docs/Regulations",
    "CLAUDE\\.md invariant",
    "\\bM[1-8]\\b",
    "Spherity",
    "Counsel",
    "claude\\.ai/artifact",
    "github\\.com/Khorolev",
  ].join("|"),
);
const EMAIL_ADDRESS = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/;

// This script holds the pattern itself.
const OWN_FILE = "scripts/check-private-references.mjs";
// Third-party texts keep their own content.
const EXEMPT_PREFIXES = ["sources/"];

// Exceptions. Each entry names one file and the one expression that the file may
// hold. An exception applies only when the expression equals the whole hit.
const EXCEPTIONS = [
  // The owner's quoted instruction of 2026-11-16 names the GitHub account that
  // creates the repository ("it should be made by Khorolev but owned by the
  // Ichnos Protocol team"). The word "Khorolev" may stay in the instruction.
  // The address github.com/Khorolev stays forbidden in every file.
  {
    path: "requirements/Owner_instructions-Francesco_verbatim/2026-11-16_public_repository_for_the_after_first_passport_work.md",
    allows: /^Khorolev$/,
  },
  // Decision Q-1014 (where the reference implementation of the
  // after-first-passport work is built) quotes the same instruction, so the
  // word "Khorolev" may stay in the decisions file. The address
  // github.com/Khorolev stays forbidden in every file.
  {
    path: "requirements/SYS.1-Requirements_Elicitation/decisions.json",
    allows: /^Khorolev$/,
  },
  // The code of conduct of TRG 7.01 of the Tractus-X Release Guidelines names
  // the public conduct address of the Eclipse Foundation. The address belongs to
  // no person and to no private deployment.
  {
    path: "CODE_OF_CONDUCT.md",
    allows: /^conduct@eclipse-foundation[.]org$/,
  },
];

function isExcepted(path, hit) {
  return EXCEPTIONS.some((exception) => exception.path === path && exception.allows.test(hit));
}

function hitsOfLine(path, line) {
  const hits = [];
  for (const pattern of [PRIVATE_REFERENCE, EMAIL_ADDRESS]) {
    const match = pattern.exec(line);
    if (match && !isExcepted(path, match[0])) hits.push(match[0]);
  }
  return hits;
}

const files = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], { encoding: "utf8" })
  .split("\n")
  .filter(Boolean)
  .filter((path) => path !== OWN_FILE && !EXEMPT_PREFIXES.some((prefix) => path.startsWith(prefix)));

let count = 0;
for (const path of files) {
  const text = readFileSync(path, "utf8");
  // A file with a NUL character is a binary file and holds no text line.
  if (text.includes("\u0000")) continue;
  text.split("\n").forEach((line, index) => {
    for (const hit of hitsOfLine(path, line)) {
      console.log(`${path}:${index + 1}: ${hit}`);
      count += 1;
    }
  });
}
console.log(`${count} private references`);
process.exit(count === 0 ? 0 : 1);
