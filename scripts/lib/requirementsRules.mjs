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

// The rules of the requirements registry in requirements/: identifiers, attributes, placement, trace, verification,
// source storage and quotes. The method is requirements/method.md sections 4 to 8 (one folder per process, from
// SYS.1 Requirements Elicitation to SWE.6 Software Verification). A SYS.1 requirement quotes an external party and sits
// in the folder of each party it quotes, and a retired identifier is never reused.
// Every function takes the registry as data and returns problems as "id: reason"; none edits anything.
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { inflateRawSync } from "node:zlib";
import path from "node:path";

export const FOLDERS = {
  elicitation: "SYS.1-Requirements_Elicitation",
  systemRequirements: "SYS.2-System_Requirements_Analysis",
  systemArchitecture: "SYS.3-System_Architectural_Design",
  systemVerification: "SYS.5-System_Verification",
  softwareRequirements: "SWE.1-Software_Requirements_Analysis",
  unitVerification: "SWE.4-Software_Unit_Verification",
  componentVerification: "SWE.5-Software_Component_Verification_and_Integration_Verification",
  softwareVerification: "SWE.6-Software_Verification",
};
const F = FOLDERS;

// One entry per level: the files that hold it (a "*" stands for one folder name), the field of each file that lists the
// entries, and the form of an identifier. A measure's file follows from its identifier and its level (`placedIn`).
export const LEVELS = [
  { key: "sources", label: "sources", files: [`${F.elicitation}/sources.json`], field: "sources", pattern: /^SRC-[A-Z0-9][A-Z0-9.-]*$/ },
  { key: "stakeholders", label: "stakeholders", files: [`${F.elicitation}/stakeholders.json`], field: "stakeholders", pattern: /^STK-\d{2}$/ },
  { key: "stakeholderRequirements", label: "stakeholder requirements", files: [`${F.elicitation}/stakeholder_requirements.json`, `${F.elicitation}/*/stakeholder_requirements.json`], field: "requirements", pattern: /^StR-[A-Z0-9]+-\d{3}[a-z]?$/ },
  { key: "systemRequirements", label: "system requirements", files: [`${F.systemRequirements}/system_requirements.json`], field: "requirements", pattern: /^SyR-[A-Z0-9]+-\d{3}[a-z]?$/ },
  { key: "processRequirements", label: "process requirements", files: [`${F.systemRequirements}/process_requirements.json`], field: "requirements", pattern: /^PrR-[A-Z0-9]+-\d{3}[a-z]?$/ },
  { key: "softwareRequirements", label: "software requirements", files: [`${F.softwareRequirements}/software_requirements.json`], field: "requirements", pattern: /^SwR-[A-Z0-9]+-\d{3}[a-z]?$/ },
  {
    key: "verificationMeasures", label: "verification measures", field: "measures", pattern: /^VM-[A-Z0-9]+(-[A-Z0-9]+)?-\d{3}[a-z]?$/,
    files: [`${F.systemVerification}/system_verification_measures.json`, `${F.systemVerification}/process_verification_measures.json`, `${F.unitVerification}/unit_verification_measures.json`, `${F.componentVerification}/component_and_integration_verification_measures.json`, `${F.softwareVerification}/software_verification_measures.json`],
  },
];
export const ARCHITECTURE_FILE = `${F.systemArchitecture}/architecture.json`;
// Removed rule of the private registry: the identifiers of the architecture interactions (DYN-nn) and deviations
// (DEV-nn). This registry carries the elements and the interfaces only.
const ARCH = { elements: /^EL-[A-Z0-9-]+$/, interfaces: /^IF-[A-Z0-9-]+$/ };

export const placedIn = (m) => {
  if (m.id.startsWith("VM-SYS-")) return `${F.systemVerification}/system_verification_measures.json`;
  if (m.id.startsWith("VM-PRC-")) return `${F.systemVerification}/process_verification_measures.json`;
  if (/^SWE\.4/.test(m.level ?? "")) return `${F.unitVerification}/unit_verification_measures.json`;
  if (/^SWE\.5/.test(m.level ?? "")) return `${F.componentVerification}/component_and_integration_verification_measures.json`;
  if (/^SWE\.6/.test(m.level ?? "")) return `${F.softwareVerification}/software_verification_measures.json`;
  return null;
};

export const ENUMS = {
  kind: ["functional", "interface", "data", "quality", "constraint", "process"],
  perimeter: ["application", "stack", "operator", "demo-passport", "demo-marketplace"],
  priority: ["must", "should", "could"],
  status: ["proposed", "agreed", "implemented", "verified", "deferred"],
  applicability: ["applies", "applies-in-part", "does-not-apply", "undecided"],
  method: ["inspection", "analysis", "demonstration", "test"],
  storage: ["stored", "cited-not-stored"],
};
// The role of a source that is the project's own rule: it is quoted at SYS.2, never at SYS.1.
export const PROJECT_RULE = "project-rule";
// Decision Q-984 of 2026-10-26: CX-Titan binds this release, and every rule that CX-Neptune adds, changes or removes is
// flagged. Each Catena-X source names its release, and each stakeholder requirement that cites a Catena-X text carries
// its release check.
export const CATENA_X_PARTY = "Catena-X-Association_standards_and_governance";
export const RELEASES = ["CX-Titan", "CX-Neptune", "CX-Saturn"];
export const BINDING_RELEASES = ["CX-Titan", "CX-Saturn"];
export const RELEASE_CHECKS = ["titan-same", "titan-changed", "neptune-new", "neptune-removed"];
// The owner's instruction of 2026-10-26: the work becomes compliant with CX-Titan first and with CX-Neptune later.
// Every requirement and measure names its release plan: a rule that only CX-Neptune states (neptune-new) is planned
// after the go-live, and so is everything derived only from such rules; nothing is removed for the plan. A stakeholder
// requirement that the owner decided not to build (status deferred, with its `deferral`) is not planned.
export const RELEASE_PLANS = ["this-release", "after-neptune-go-live", "not-planned"];
const MAX_QUOTE_WORDS = 40;
const MAX_TITLE_WORDS = 12;

// ---- loading ----------------------------------------------------------------------------------
const expand = (dir, pattern) => {
  const [head, ...rest] = pattern.split("/*/");
  if (!rest.length) return existsSync(path.join(dir, pattern)) ? [pattern] : [];
  const parent = path.join(dir, head);
  if (!existsSync(parent)) return [];
  return readdirSync(parent)
    .filter((name) => statSync(path.join(parent, name)).isDirectory())
    .sort()
    .flatMap((name) => expand(dir, `${head}/${name}/${rest.join("/*/")}`));
};

// Loads every level. An entry that several files hold (a stakeholder requirement shared by several parties) is loaded
// once; reg.locations names its files, and reg.conflicts the copies that differ. reg.retired holds each file's retired list.
export function loadRegistry(dir) {
  const reg = { dir, locations: new Map(), retired: [], conflicts: [], duplicates: [] };
  for (const level of LEVELS) {
    const files = level.files.flatMap((p) => expand(dir, p));
    if (!files.length) { reg[level.key] = null; continue; }
    const byId = new Map();
    for (const file of files) {
      const doc = JSON.parse(readFileSync(path.join(dir, file), "utf8"));
      const seenHere = new Set();
      for (const e of doc[level.field] ?? []) {
        if (seenHere.has(e.id)) reg.duplicates.push(`${e.id}: listed twice in ${file}`);
        seenHere.add(e.id);
        const at = reg.locations.get(e.id) ?? [];
        reg.locations.set(e.id, [...at, file]);
        if (!byId.has(e.id)) byId.set(e.id, e);
        else if (JSON.stringify(byId.get(e.id)) !== JSON.stringify(e)) reg.conflicts.push(`${e.id}: the copies in ${at[0]} and ${file} differ`);
      }
      for (const r of doc.retired ?? []) reg.retired.push({ ...r, level: level.key, file });
    }
    reg[level.key] = [...byId.values()];
  }
  const a = path.join(dir, ARCHITECTURE_FILE);
  reg.architecture = existsSync(a) ? JSON.parse(readFileSync(a, "utf8")) : null;
  return reg;
}

// ---- reading a stored text --------------------------------------------------------------------
export function normalise(s) {
  return String(s)
    .normalize("NFKC")
    .replace(/­/g, "")
    .replace(/[‘’‚′]/g, "'")
    .replace(/[“”„″]/g, '"')
    .replace(/[‐-―−]/g, "-")
    .replace(/-\s*\n\s*/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

const stripHtml = (t) =>
  t
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<(h[1-6])[^>]*>/gi, "\n\n## ")
    .replace(/<li[^>]*>/gi, "\n- ")
    .replace(/<(p|br|tr|div|td|th)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

const decodeMhtml = (t) => {
  const part = t.split(/\r?\n--/).find((p) => /Content-Type: text\/html/i.test(p)) ?? t;
  const qp = part.replace(/=\r?\n/g, "").replace(/=([0-9A-F]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
  return Buffer.from(qp, "latin1").toString("utf8");
};

// An .xlsx file is a zip of XML parts: read its shared strings and inline strings, which hold every cell text.
export function xlsxText(buffer) {
  const eocd = buffer.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  if (eocd < 0) throw new Error("not a zip file");
  let at = buffer.readUInt32LE(eocd + 16);
  const count = buffer.readUInt16LE(eocd + 10);
  const parts = [];
  for (let k = 0; k < count; k++) {
    const method = buffer.readUInt16LE(at + 10);
    const size = buffer.readUInt32LE(at + 20);
    const nameLen = buffer.readUInt16LE(at + 28);
    const extraLen = buffer.readUInt16LE(at + 30);
    const commentLen = buffer.readUInt16LE(at + 32);
    const local = buffer.readUInt32LE(at + 42);
    const name = buffer.toString("utf8", at + 46, at + 46 + nameLen);
    if (/^xl\/(sharedStrings|worksheets\/sheet\d+)\.xml$/.test(name)) {
      const start = local + 30 + buffer.readUInt16LE(local + 26) + buffer.readUInt16LE(local + 28);
      const data = buffer.subarray(start, start + size);
      parts.push((method === 8 ? inflateRawSync(data) : data).toString("utf8"));
    }
    at += 46 + nameLen + extraLen + commentLen;
  }
  return parts.map((xml) => [...xml.matchAll(/<t[^>]*>([^<]*)<\/t>/g)].map((m) => m[1]).join("\n")).join("\n").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

// A PDF is read with pdftotext when it is installed; otherwise from its Markdown conversion in the folder of the same name.
function pdfText(file) {
  try {
    return execFileSync("pdftotext", ["-layout", file, "-"], { maxBuffer: 1 << 28, stdio: ["ignore", "pipe", "ignore"] }).toString("utf8");
  } catch {
    const stem = path.basename(file, path.extname(file));
    const md = path.join(path.dirname(file), stem, `${stem}.md`);
    if (existsSync(md)) return readFileSync(md, "utf8").replace(/[#*_|`>]/g, " ");
    throw new Error("pdftotext is not installed and the PDF has no Markdown conversion");
  }
}

// A Markdown source is read as the words its page renders: a link shows its text, and code and emphasis marks show
// nothing, so a quote taken from the published page and a quote taken from the source match the same words.
export const markdownWords = (t) =>
  String(t)
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/`+/g, "")
    .replace(/(\*\*|__)/g, "");

export function storedText(root, relPath) {
  const file = path.join(root, relPath);
  if (!existsSync(file)) return null;
  if (/\.pdf$/i.test(file)) return pdfText(file);
  if (/\.xlsx$/i.test(file)) return xlsxText(readFileSync(file));
  let t = readFileSync(file, "utf8");
  if (/\.mhtml$/i.test(file)) t = stripHtml(decodeMhtml(t));
  else if (/\.x?html?$/i.test(file)) t = stripHtml(t);
  else if (/\.mdx?$/i.test(file)) t = markdownWords(t);
  return t;
}

// ---- the rules --------------------------------------------------------------------------------
const words = (s) => String(s ?? "").trim().split(/\s+/).filter(Boolean).length;
const DASH = /[–—]/;
const REQUIREMENT_LEVELS = ["stakeholderRequirements", "systemRequirements", "processRequirements", "softwareRequirements"];

export function identifierProblems(reg) {
  const problems = [...(reg.duplicates ?? []), ...(reg.conflicts ?? [])];
  const seen = new Map();
  const note = (id, where) => {
    if (seen.has(id)) problems.push(`${id}: used in ${seen.get(id)} and in ${where}`);
    else seen.set(id, where);
  };
  for (const level of LEVELS) {
    for (const e of reg[level.key] ?? []) {
      if (!level.pattern.test(e.id ?? "")) problems.push(`${e.id ?? "(no id)"}: not an identifier of the ${level.label}`);
      note(e.id, `the ${level.label}`);
    }
  }
  for (const [key, pattern] of Object.entries(ARCH)) {
    for (const e of reg.architecture?.[key] ?? []) {
      if (!pattern.test(e.id ?? "")) problems.push(`${e.id ?? "(no id)"}: not an identifier of the architecture ${key}`);
      note(e.id, `the architecture ${key}`);
    }
  }
  // A retired identifier keeps its form, is retired once and is never used again.
  const retiredOnce = new Set();
  for (const r of reg.retired ?? []) {
    const level = LEVELS.find((l) => l.key === r.level);
    if (level && !level.pattern.test(r.id ?? "")) problems.push(`${r.id ?? "(no id)"}: not an identifier of the retired ${level.label}`);
    for (const a of ["title", "date", "reason"]) if (!r[a]) problems.push(`${r.id}: retired without ${a}`);
    if (seen.has(r.id)) problems.push(`${r.id}: retired in ${r.file} and still used in ${seen.get(r.id)}`);
    if (retiredOnce.has(r.id) && r.level !== "stakeholderRequirements") problems.push(`${r.id}: retired twice`);
    retiredOnce.add(r.id);
  }
  return problems;
}

export function attributeProblems(reg) {
  const problems = [];
  for (const key of REQUIREMENT_LEVELS) {
    for (const r of reg[key] ?? []) {
      for (const a of ["title", "statement", "kind", "priority", "status"]) if (!r[a]) problems.push(`${r.id}: no ${a}`);
      for (const a of ["kind", "priority", "status", "perimeter"]) if (r[a] && !ENUMS[a].includes(r[a])) problems.push(`${r.id}: ${a} "${r[a]}" is not one of ${ENUMS[a].join(", ")}`);
      // method.md section 5: a statement holds one requirement with its "shall", "should" or "may".
      if (r.statement && !/\b(shall|should|may)\b/i.test(r.statement)) problems.push(`${r.id}: a statement without shall, should or may`);
      // method.md section 5: a deferred requirement names its owner and its condition, and the decision that defers it.
      if (r.status === "deferred" && !(r.deferral?.owner && r.deferral?.condition && r.deferral?.decision)) problems.push(`${r.id}: deferred without a deferral that names its decision, owner and condition`);
      if (words(r.title) > MAX_TITLE_WORDS) problems.push(`${r.id}: title longer than ${MAX_TITLE_WORDS} words`);
      if (DASH.test(`${r.title} ${r.statement}`)) problems.push(`${r.id}: an em or en dash in the title or statement`);
      if (key === "stakeholderRequirements") {
        if (!r.perimeter) problems.push(`${r.id}: no perimeter`);
        if (!r.stakeholders?.length) problems.push(`${r.id}: no stakeholder`);
        if (!r.sources?.length) problems.push(`${r.id}: no source`);
        if (!r.acceptance) problems.push(`${r.id}: no acceptance criterion`);
      }
    }
  }
  for (const s of reg.sources ?? []) {
    if (!ENUMS.applicability.includes(s.applicability)) problems.push(`${s.id}: applicability "${s.applicability}" is not one of ${ENUMS.applicability.join(", ")}`);
    if (s.applicability === "undecided" && !s.question) problems.push(`${s.id}: undecided without the question that decides it`);
    if (s.role === PROJECT_RULE && s.party) problems.push(`${s.id}: a project rule names the external party ${s.party}`);
    if (s.role !== PROJECT_RULE && !s.party) problems.push(`${s.id}: an external source names no party`);
  }
  for (const m of reg.verificationMeasures ?? []) {
    for (const a of ["title", "technique", "passCriteria"]) if (!m[a]) problems.push(`${m.id}: no ${a}`);
    if (m.method && !ENUMS.method.includes(m.method)) problems.push(`${m.id}: method "${m.method}" is not one of ${ENUMS.method.join(", ")}`);
  }
  return problems;
}

// A stakeholder requirement quotes external parties only and sits in the folder of each party it quotes; a requirement
// common to every party sits in the elicitation folder itself. A measure sits in the folder of its level.
export function placementProblems(reg) {
  const problems = [];
  const sources = new Map((reg.sources ?? []).map((s) => [s.id, s]));
  const partyFolders = new Set((reg.sources ?? []).map((s) => s.party).filter(Boolean));
  for (const r of reg.stakeholderRequirements ?? []) {
    const own = (r.sources ?? []).filter((q) => sources.get(q.source)?.role === PROJECT_RULE).map((q) => q.source);
    if (own.length) problems.push(`${r.id}: quotes the project's own rule (${[...new Set(own)].join(", ")}); an owner's rule is a SYS.2 requirement`);
    const parties = new Set((r.sources ?? []).map((q) => sources.get(q.source)?.party).filter(Boolean));
    const expected = parties.size === partyFolders.size && partyFolders.size > 1
      ? [`${F.elicitation}/stakeholder_requirements.json`]
      : [...parties].map((p) => `${F.elicitation}/${p}/stakeholder_requirements.json`);
    const actual = reg.locations?.get(r.id) ?? [];
    if (!reg.locations) continue;
    const missing = expected.filter((f) => !actual.includes(f));
    const extra = actual.filter((f) => !expected.includes(f));
    if (missing.length) problems.push(`${r.id}: missing from ${missing.join(", ")}`);
    if (extra.length) problems.push(`${r.id}: in ${extra.join(", ")}, whose party it does not quote`);
  }
  // The release check of decision Q-984: a requirement rests on the binding release unless only CX-Neptune states it.
  const releaseOf = (id) => sources.get(id)?.release;
  for (const s of reg.sources ?? []) {
    if (s.party === CATENA_X_PARTY && !RELEASES.includes(s.release)) problems.push(`${s.id}: a Catena-X source names no release of ${RELEASES.join(", ")}`);
  }
  for (const r of reg.stakeholderRequirements ?? []) {
    const cx = (r.sources ?? []).filter((q) => sources.get(q.source)?.party === CATENA_X_PARTY);
    if (!cx.length) continue;
    const check = r.catenaXRelease;
    if (!RELEASE_CHECKS.includes(check?.status)) { problems.push(`${r.id}: cites a Catena-X text and carries no release check (${RELEASE_CHECKS.join(", ")})`); continue; }
    const neptune = cx.filter((q) => releaseOf(q.source) === "CX-Neptune").map((q) => q.source);
    const binding = cx.filter((q) => BINDING_RELEASES.includes(releaseOf(q.source)));
    if (check.status === "neptune-new") {
      if (binding.length) problems.push(`${r.id}: neptune-new but cites the binding release (${[...new Set(binding.map((q) => q.source))].join(", ")})`);
    } else {
      if (neptune.length) problems.push(`${r.id}: ${check.status} but cites CX-Neptune among its binding sources (${[...new Set(neptune)].join(", ")}); a CX-Neptune quote belongs in catenaXRelease.neptuneSources`);
      if (!binding.length) problems.push(`${r.id}: ${check.status} without a quote of the binding release`);
    }
    if (check.status !== "titan-same" && !check.difference) problems.push(`${r.id}: ${check.status} without the difference that the flag states`);
    for (const q of check.neptuneSources ?? []) if (releaseOf(q.source) !== "CX-Neptune") problems.push(`${r.id}: a release check quotes ${q.source}, which is not a CX-Neptune source`);
  }
  if (reg.locations)
    for (const m of reg.verificationMeasures ?? []) {
      const want = placedIn(m);
      const at = reg.locations.get(m.id) ?? [];
      if (!want) problems.push(`${m.id}: no verification level for its identifier and level "${m.level ?? ""}"`);
      else if (at.length && !at.includes(want)) problems.push(`${m.id}: in ${at.join(", ")}, not in ${want}`);
    }
  return problems;
}

// The release plan each entry derives from the stakeholder requirements it rests on: a neptune-new stakeholder
// requirement is planned after the go-live; a requirement below it is planned after the go-live when everything it
// traces to is; a measure when everything it verifies is. An owner's rule and any other entry belong to this release.
export function releasePlans(reg) {
  const plans = new Map();
  const of = (ids) => {
    const p = (ids ?? []).map((t) => plans.get(t));
    if (!p.length || p.includes(undefined) || p.includes("this-release")) return "this-release";
    return p.every((x) => x === "not-planned") ? "not-planned" : "after-neptune-go-live";
  };
  for (const r of reg.stakeholderRequirements ?? []) plans.set(r.id, r.status === "deferred" && r.deferral ? "not-planned" : r.catenaXRelease?.status === "neptune-new" ? "after-neptune-go-live" : "this-release");
  // A requirement below the stakeholder level that carries the flag neptune-new is planned after the go-live.
  for (const key of ["systemRequirements", "processRequirements", "softwareRequirements"]) for (const r of reg[key] ?? []) plans.set(r.id, r.catenaXRelease?.status === "neptune-new" ? "after-neptune-go-live" : of(r.tracesTo));
  for (const m of reg.verificationMeasures ?? []) plans.set(m.id, of(m.verifies));
  return plans;
}

export function releasePlanProblems(reg) {
  const problems = [];
  const plans = releasePlans(reg);
  for (const key of [...REQUIREMENT_LEVELS, "verificationMeasures"])
    for (const e of reg[key] ?? []) {
      if (!RELEASE_PLANS.includes(e.releasePlan)) problems.push(`${e.id}: no releasePlan of ${RELEASE_PLANS.join(", ")}`);
      else if (e.releasePlan !== plans.get(e.id)) problems.push(`${e.id}: releasePlan "${e.releasePlan}", but what it rests on gives "${plans.get(e.id)}"`);
    }
  for (const key of ["systemRequirements", "processRequirements", "softwareRequirements"])
    for (const r of reg[key] ?? []) {
      const c = r.catenaXRelease;
      if (!c) continue;
      if (c.status !== "neptune-new") problems.push(`${r.id}: below the stakeholder level a release flag is only neptune-new, not "${c.status}"`);
      if (!c.difference) problems.push(`${r.id}: flagged ${c.status} without the difference to CX-Titan`);
    }
  return problems;
}

// Removed rules of the private registry: the milestone rules (a milestone of a development contract on each
// requirement, the milestone catalogue, the technical debt flag of an accepted milestone). This registry holds no
// milestone file, and the carried records hold no milestone field.

// method.md section 8: no requirement and no measure refers to a retired identifier, in a trace or in its text. The
// history of an entry and the quotes of its sources are records of the past and of the external text, and are not read.
const ENTRY_ID = /\b(?:StR|SyR|PrR|SwR|VM)-[A-Z0-9]+(?:-[A-Z0-9]+)?-\d{3}[a-z]?\b/g;
export function retiredReferenceProblems(reg) {
  const problems = [];
  const retired = new Set((reg.retired ?? []).map((r) => r.id));
  const scan = (owner, field, v) => {
    if (typeof v === "string") { for (const rid of new Set(v.match(ENTRY_ID) ?? [])) if (retired.has(rid)) problems.push(`${owner}: names the retired identifier ${rid} in ${field}`); }
    else if (Array.isArray(v)) v.forEach((x) => scan(owner, field, x));
    else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) if (k !== "quote") scan(owner, field, x);
  };
  for (const key of [...REQUIREMENT_LEVELS, "verificationMeasures"])
    for (const e of reg[key] ?? []) for (const [k, v] of Object.entries(e)) if (!["id", "history", "sources"].includes(k)) scan(e.id, k, v);
  return problems;
}

// Every reference points to an existing entry, every level traces up, and every requirement below level 1 is verified.
export function traceProblems(reg) {
  const problems = [];
  const ids = (key) => new Set((reg[key] ?? []).map((e) => e.id));
  const stk = ids("stakeholders");
  const src = ids("sources");
  const str = ids("stakeholderRequirements");
  const syr = ids("systemRequirements");
  const prr = ids("processRequirements");
  const retired = new Map((reg.retired ?? []).map((r) => [r.id, r]));
  const el = new Set((reg.architecture?.elements ?? []).map((e) => e.id));
  const notApplying = new Set((reg.sources ?? []).filter((s) => s.applicability === "does-not-apply").map((s) => s.id));
  const cited = (r) => {
    for (const s of r.sources ?? []) if (!src.has(s.source)) problems.push(`${r.id}: unknown source ${s.source}`);
  };
  for (const r of reg.stakeholderRequirements ?? []) {
    for (const s of r.stakeholders ?? []) if (!stk.has(s)) problems.push(`${r.id}: unknown stakeholder ${s}`);
    cited(r);
    if (r.sources?.length && r.sources.every((s) => notApplying.has(s.source))) problems.push(`${r.id}: rests only on sources that do not apply (${[...new Set(r.sources.map((s) => s.source))].join(", ")})`);
  }
  // A system or process requirement traces to the stakeholder requirements it serves; an owner's rule that no external
  // party imposes traces to none, and then says why (traceNote) and quotes the project rule it rests on (sources).
  const up = (key, allowed, label, ownerRuleAllowed) => {
    for (const r of reg[key] ?? []) {
      cited(r);
      if (!r.tracesTo?.length) {
        if (!ownerRuleAllowed) problems.push(`${r.id}: traces to no ${label}`);
        else if (!r.traceNote || !r.sources?.length) problems.push(`${r.id}: traces to no ${label} and gives no traceNote with the project rule it quotes`);
      }
      for (const t of r.tracesTo ?? []) {
        if (retired.has(t)) problems.push(`${r.id}: traces to ${t}, which is retired (${retired.get(t).reason})`);
        else if (!allowed.has(t)) problems.push(`${r.id}: traces to ${t}, which is not a ${label}`);
      }
    }
  };
  up("systemRequirements", str, "stakeholder requirement", true);
  up("processRequirements", str, "stakeholder requirement", true);
  up("softwareRequirements", syr, "system requirement", false);
  for (const r of reg.systemRequirements ?? []) {
    if (reg.architecture && !r.allocatedTo?.length) problems.push(`${r.id}: allocated to no architecture element`);
    for (const e of r.allocatedTo ?? []) if (reg.architecture && !el.has(e)) problems.push(`${r.id}: allocated to ${e}, which is not an element`);
  }
  for (const r of reg.softwareRequirements ?? []) {
    if (!r.element) problems.push(`${r.id}: belongs to no software element`);
    else if (reg.architecture && !el.has(r.element)) problems.push(`${r.id}: element ${r.element} is not an element`);
  }
  // Coverage downwards, checked once the lower level exists.
  if (reg.systemRequirements || reg.processRequirements) {
    const covered = new Set([...(reg.systemRequirements ?? []), ...(reg.processRequirements ?? [])].flatMap((r) => r.tracesTo ?? []));
    // A stakeholder requirement that a decision of the owner defers is not refined until the decision changes.
    for (const r of reg.stakeholderRequirements ?? []) if (!covered.has(r.id) && !r.validationOnly && !(r.status === "deferred" && r.deferral)) problems.push(`${r.id}: refined by no system or process requirement, and not marked validation only`);
  }
  if (reg.verificationMeasures) {
    const verified = new Set((reg.verificationMeasures ?? []).flatMap((m) => m.verifies ?? []));
    const below = ["systemRequirements", "processRequirements", "softwareRequirements"].flatMap((k) => reg[k] ?? []);
    const known = new Set(below.map((r) => r.id));
    for (const r of below) if (!verified.has(r.id) && !r.validationOnly) problems.push(`${r.id}: verified by no measure`);
    for (const m of reg.verificationMeasures ?? []) {
      if (!m.verifies?.length) problems.push(`${m.id}: verifies no requirement`);
      for (const v of m.verifies ?? []) {
        if (retired.has(v)) problems.push(`${m.id}: verifies ${v}, which is retired`);
        else if (!known.has(v)) problems.push(`${m.id}: verifies ${v}, which is not a requirement below the stakeholder level`);
      }
    }
    // method.md section 8: the trace between a requirement and its measures runs both ways; a measure that verifies a
    // requirement is in the requirement's `verification`, and every measure a requirement names verifies it.
    const byId = new Map(below.map((r) => [r.id, r]));
    const measures = new Map((reg.verificationMeasures ?? []).map((m) => [m.id, m]));
    for (const m of reg.verificationMeasures ?? []) for (const v of m.verifies ?? []) { const r = byId.get(v); if (r && !(r.verification ?? []).includes(m.id)) problems.push(`${v}: verified by ${m.id}, which its verification does not name`); }
    for (const r of below) for (const v of r.verification ?? []) { const m = measures.get(v); if (!m) { if (!retired.has(v)) problems.push(`${r.id}: names measure ${v}, which does not exist`); } else if (!(m.verifies ?? []).includes(r.id)) problems.push(`${r.id}: names measure ${v}, which does not verify it`); }
  }
  // Once the software level exists, every system requirement allocated to an element that is not external is refined
  // by a software requirement of that element (SWE.1.BP5); an external element's share is met at its interface.
  // Changed rule: an element whose status is "proposed" is left out, because the allocation of the carried requirements
  // to it waits for the owner's approval and the software requirements of the reference server are not all derived.
  if (reg.softwareRequirements && reg.architecture) {
    const external = new Set((reg.architecture.elements ?? []).filter((e) => e.deployment === "external" || e.status === "proposed").map((e) => e.id));
    const refinedBy = new Set((reg.softwareRequirements ?? []).flatMap((s) => (s.tracesTo ?? []).map((t) => `${t}@${s.element}`)));
    for (const r of reg.systemRequirements ?? []) for (const e of r.allocatedTo ?? []) if (!external.has(e) && !refinedBy.has(`${r.id}@${e}`)) problems.push(`${r.id}: allocated to ${e}, which no software requirement of ${e} refines`);
  }
  // No redundant trace (SWE.1.BP5 Note 9): a software requirement traces to system requirements only.
  for (const r of reg.softwareRequirements ?? []) for (const t of r.tracesTo ?? []) if (str.has(t) || prr.has(t)) problems.push(`${r.id}: traces past its system requirement to ${t}`);
  // Threat scenarios and cybersecurity goals (Automotive SPICE for Cybersecurity 2.0 SEC.1.BP2): a reduced scenario has
  // a goal, held by a stakeholder requirement when an external party states it and by a system or process requirement
  // when the risk analysis derives it (a risk requirement of SYS.2); a requirement that names a scenario is one of its
  // goals, traces to one, or depends on one held at its own level (decision Q-989: a goal of the level above is traced
  // to, never depended on).
  const goalsOf = new Map();
  for (const r of reg.stakeholderRequirements ?? [])
    for (const ts of r.threatScenarios ?? []) {
      const goals = new Set((ts.goal ?? []).map((g) => g.requirement));
      goalsOf.set(ts.id, goals);
      if (ts.treatment?.option === "reduce" && !goals.size) problems.push(`${ts.id}: reduced without a cybersecurity goal`);
      for (const g of goals) if (!str.has(g) && !syr.has(g) && !prr.has(g)) problems.push(`${ts.id}: goal ${g} is not a stakeholder, system or process requirement`);
    }
  if (goalsOf.size)
    for (const r of [...(reg.systemRequirements ?? []), ...(reg.processRequirements ?? [])]) {
      for (const ts of new Set(`${r.rationale ?? ""} ${r.notes ?? ""}`.match(/\bTS-\d+\b/g) ?? [])) {
        const goals = goalsOf.get(ts);
        const linked = goals && (goals.has(r.id) || (r.tracesTo ?? []).some((t) => goals.has(t)) || (r.dependsOn ?? []).some((t) => goals.has(t) && !str.has(t)));
        if (!goals) problems.push(`${r.id}: names ${ts}, which is not a threat scenario`);
        else if (goals.size && !linked) problems.push(`${r.id}: names ${ts} but is none of its goals and traces to none (${[...goals].join(", ")})`);
      }
    }
  return problems;
}

// The storage of each source: "stored" with a path that exists in this repository, or "cited-not-stored" with no path
// and with a locator that says where to read the text. Added rule of this registry.
export function storageProblems(reg, root) {
  const problems = [];
  for (const s of reg.sources ?? []) {
    if (!ENUMS.storage.includes(s.storage)) { problems.push(`${s.id}: storage "${s.storage}" is not one of ${ENUMS.storage.join(", ")}`); continue; }
    if (s.storage === "stored") {
      if (!s.path) problems.push(`${s.id}: stored without a path`);
      else if (root && !existsSync(path.join(root, s.path))) problems.push(`${s.id}: ${s.path} is not stored`);
    } else {
      if (s.path) problems.push(`${s.id}: cited and not stored, but it names the path ${s.path}`);
      if (!s.locator) problems.push(`${s.id}: cited and not stored without a locator that says where to read the text`);
    }
  }
  return problems;
}

// Every quote of a stored source is found in its stored text. A quote of a source that is cited and not stored is
// counted as not checked, never as passed. Returns the problems, the quotes that could not be read on this machine and
// the quotes that were not checked.
export function quoteProblems(reg, root, readText = (p) => storedText(root, p)) {
  const problems = [];
  const skipped = [];
  const notChecked = [];
  const storage = new Map((reg.sources ?? []).map((s) => [s.id, s.storage]));
  const cache = new Map();
  const text = (p) => {
    if (!cache.has(p)) {
      try {
        const t = readText(p);
        cache.set(p, t === null ? null : normalise(t));
      } catch (e) {
        cache.set(p, { error: e.message });
      }
    }
    return cache.get(p);
  };
  // ownSource: the source that holds the citation as its applicability evidence
  const check = (owner, q, ownSource) => {
    if (!q.quote) return problems.push(`${owner}: a citation without quote`);
    if (words(q.quote) > MAX_QUOTE_WORDS) problems.push(`${owner}: quote longer than ${MAX_QUOTE_WORDS} words (${q.locator ?? q.path ?? ""})`);
    if (!q.path) {
      const cited = q.source ? storage.get(q.source) === "cited-not-stored" : Boolean(q.document) || storage.get(ownSource) === "cited-not-stored";
      if (cited) notChecked.push(`${owner}: ${q.source ?? q.document ?? ownSource} (${q.locator ?? ""})`);
      else problems.push(`${owner}: a citation without path, whose source is not cited-not-stored`);
      return;
    }
    if (q.source && storage.get(q.source) === "cited-not-stored") problems.push(`${owner}: a path for ${q.source}, which is cited and not stored`);
    const t = text(q.path);
    if (t === null) problems.push(`${owner}: ${q.path} is not stored`);
    else if (t.error) skipped.push(`${owner}: ${q.path} (${t.error})`);
    else if (!t.includes(normalise(/\.mdx?$/i.test(q.path) ? markdownWords(q.quote) : q.quote))) problems.push(`${owner}: quote not found in ${q.path} (${q.locator ?? ""}): "${String(q.quote).slice(0, 80)}"`);
  };
  for (const s of reg.sources ?? []) for (const q of s.applicabilityEvidence ?? []) check(s.id, q, s.id);
  for (const key of ["stakeholderRequirements", "systemRequirements", "processRequirements"]) for (const r of reg[key] ?? []) for (const q of r.sources ?? []) check(r.id, q);
  for (const r of reg.stakeholderRequirements ?? []) for (const q of r.catenaXRelease?.neptuneSources ?? []) check(r.id, q);
  return { problems, skipped, notChecked };
}

// The traceability matrix, one row per stakeholder requirement and one per owner's rule of SYS.2, generated and never stored.
export function matrix(reg) {
  const below = (key, id) => (reg[key] ?? []).filter((r) => r.tracesTo?.includes(id));
  const verifiers = (id) => (reg.verificationMeasures ?? []).filter((m) => m.verifies?.includes(id)).map((m) => m.id);
  const row = (origin, sys) => {
    const sw = sys.flatMap((r) => below("softwareRequirements", r.id));
    return {
      origin,
      systemOrProcess: sys.map((r) => r.id),
      elements: [...new Set(sys.flatMap((r) => r.allocatedTo ?? []))],
      software: sw.map((r) => r.id),
      measures: [...new Set([...sys, ...sw].flatMap((r) => verifiers(r.id)))],
    };
  };
  const owners = [...(reg.systemRequirements ?? []), ...(reg.processRequirements ?? [])].filter((r) => !r.tracesTo?.length);
  return [
    ...(reg.stakeholderRequirements ?? []).map((s) => row(s.id, [...below("systemRequirements", s.id), ...below("processRequirements", s.id)])),
    ...owners.map((r) => row(`owner's rule (${r.id})`, [r])),
  ];
}

// The owner's instruction of 2026-10-26: the application follows Catena-X, and Catena-X must meet DIN DKE SPEC 99100
// and the EU regulation (method.md section 7). Every stakeholder requirement that quotes an EU act or DIN DKE SPEC 99100,
// and no Catena-X text, and binds the application or the stack, carries its flag `catenaXCompliance`: for CX-Titan
// and for CX-Neptune, whether a Catena-X text meets it, with the texts read and a note.
// Changed rule: a basis entry names its path only when this repository stores the text.
export const COMPLIANCE_VALUES = ["met", "partial", "gap", "not-applicable"];
const COMPLIANCE_PARTY = /^(EU-|DIN_)/;
export function catenaXComplianceProblems(reg, root) {
  const problems = [];
  const party = new Map((reg.sources ?? []).map((s) => [s.id, s.party]));
  for (const r of reg.stakeholderRequirements ?? []) {
    const parties = (r.sources ?? []).map((q) => party.get(q.source)).filter(Boolean);
    if (!parties.some((p) => COMPLIANCE_PARTY.test(p)) || parties.includes(CATENA_X_PARTY)) continue;
    if (!["application", "stack"].includes(r.perimeter) || r.status === "deferred") continue;
    const c = r.catenaXCompliance;
    if (!c) { problems.push(`${r.id}: carries no catenaXCompliance flag`); continue; }
    for (const release of ["titan", "neptune"]) if (!COMPLIANCE_VALUES.includes(c[release])) problems.push(`${r.id}: catenaXCompliance.${release} is not one of ${COMPLIANCE_VALUES.join(", ")}`);
    const basis = Array.isArray(c.basis) ? c.basis : [];
    if (!Array.isArray(c.basis)) problems.push(`${r.id}: catenaXCompliance.basis is not a list`);
    if ([c.titan, c.neptune].some((v) => v === "met" || v === "partial") && !basis.length) problems.push(`${r.id}: catenaXCompliance is met or partial with no basis`);
    if ([c.titan, c.neptune].some((v) => v !== "met") && !(c.note ?? "").trim()) problems.push(`${r.id}: catenaXCompliance is ${[c.titan, c.neptune].filter((v) => v !== "met").join(" and ")} with no note`);
    for (const b of basis) {
      if (!b?.text || !b?.locator) { problems.push(`${r.id}: catenaXCompliance.basis entry lacks text or locator`); continue; }
      if (root && b.path && !existsSync(path.join(root, b.path))) problems.push(`${r.id}: catenaXCompliance.basis names ${b.path}, which is not stored`);
    }
  }
  return problems;
}

export function allProblems(reg, root, readText) {
  const q = quoteProblems(reg, root, readText);
  return { problems: [...identifierProblems(reg), ...attributeProblems(reg), ...storageProblems(reg, root), ...placementProblems(reg), ...releasePlanProblems(reg), ...traceProblems(reg), ...retiredReferenceProblems(reg), ...catenaXComplianceProblems(reg, root), ...q.problems], skipped: q.skipped, notChecked: q.notChecked };
}
