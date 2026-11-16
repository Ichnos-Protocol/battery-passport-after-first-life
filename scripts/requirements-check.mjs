#!/usr/bin/env node
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

// Checks the requirements registry of requirements/ and prints its traceability matrix (requirements/method.md
// sections 4, 7 and 8). Run at the repository root:
//   node scripts/requirements-check.mjs            prints the problems and the counts; exits 1 while any problem remains
//   node scripts/requirements-check.mjs --matrix   prints the traceability matrix as Markdown on standard output
// Reads the JSON files of the process folders of requirements/ and the stored texts they quote; writes nothing.
// A quote of a source that is cited and not stored is counted as not checked, never as passed.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadRegistry, allProblems, matrix, LEVELS } from "./lib/requirementsRules.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const reg = loadRegistry(path.join(root, "requirements"));

if (process.argv.includes("--matrix")) {
  const rows = matrix(reg);
  console.log("| Stakeholder requirement or owner's rule | System or process requirements | Elements | Software requirements | Verification measures |");
  console.log("|---|---|---|---|---|");
  for (const r of rows) console.log(`| ${r.origin} | ${r.systemOrProcess.join(", ")} | ${r.elements.join(", ")} | ${r.software.join(", ")} | ${r.measures.join(", ")} |`);
  process.exit(0);
}

const { problems, skipped, notChecked } = allProblems(reg, root);
for (const level of LEVELS) {
  const entries = reg[level.key];
  const retired = new Set(reg.retired.filter((r) => r.level === level.key).map((r) => r.id)).size;
  console.log(`${level.label}: ${entries === null ? "not derived yet" : `${entries.length} active, ${retired} retired`}`);
}
console.log(`architecture: ${reg.architecture ? `${(reg.architecture.elements ?? []).length} elements, ${(reg.architecture.interfaces ?? []).length} interfaces` : "not derived yet"}`);
for (const s of skipped) console.log(`skipped: ${s}`);
for (const p of problems) console.log(`problem: ${p}`);
console.log(`${problems.length} problems, ${skipped.length} quotes skipped, ${notChecked.length} quotes not checked (cited, not stored)`);
process.exit(problems.length ? 1 : 0);
