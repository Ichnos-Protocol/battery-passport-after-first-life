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

// spec-gate-check.mjs: the mechanical checks of a specification of this repository.
//
// The script runs, on any specification written for an implementation agent, the checks
// that a literal implementer would otherwise turn into questions: writing-style breaches,
// vague phrases, undefined cross-references (decisions, sections, numbered table rows),
// string ids and test ids used but never defined, hooks named that the live code does not
// export, and cited file paths that do not exist in the repository.
//
// The script finds the sections of the specification by their names, not their numbers.
// The headings that the script needs contain "Files to write", "Screens", "Strings" and
// "Decisions". The options below override the names when a specification uses others.
//
// Usage:
//   node scripts/spec-gate-check.mjs <spec.md> [--src <root>] [--api <glob>]...
//         [--files-heading "Files to write"] [--screens-heading "Screens"]
//         [--strings-heading "Strings"] [--consumer-heading <heading>]...
//         [--testid-prefix <prefix>] [--id-column "testid"]
//         [--path-prefix docs/ --path-prefix server/ ...]
//
//   --src   root against which cited paths resolve (for example the repository root).
//           Without --src the path check and the hook check are SKIPPED, and a SKIPPED
//           check does not pass the gate.
//   --api   glob(s), relative to --src, of the endpoint files whose exported hooks are the
//           only hooks a specification may name without marking them new (default
//           src/api/*.js).
//
// Exit code 0 only when every executed check reports 0 findings. Exit code 2 on a wrong
// command line.
//
// The script replaced a Python script on 2026-11-16 and prints the same lines. The helpers
// below therefore keep the Python rules for line splitting, whitespace, word boundaries,
// digits, case-insensitive search, sorting and glob matching.
import { lstatSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import process from "node:process";

// Class contents for a word character, a whitespace character and a decimal digit of any script.
const WORD = String.raw`\p{L}\p{N}_`;
const SPACE = String.raw`\t\n\v\f\r\x1c-\x1f \x85\xa0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000`;
const DIGIT = String.raw`\p{Nd}`;
// A word boundary on the word characters of any script. The JavaScript \b counts ASCII characters only.
const B = `(?:(?<=[${WORD}])(?![${WORD}])|(?<![${WORD}])(?=[${WORD}]))`;
// A line start after a line feed only. The JavaScript "m" flag also accepts U+2028 and U+2029.
const BOL = String.raw`(?<![^\n])`;

const DASHES = /[\u2014\u2013]/u;
const WATCH_WORDS = [
  "falls on", "sits with", "lands on", "lies with", "rests with",
  "born in", "lives", "whatever", "glue", "pivots?", "gatehouse",
  "moat", "seam", "headache", "ledger", "walk(ed|s)?", "lot",
  "testnet", "certified", "official partner", "powered by",
].map((body) => new RegExp(`${B}${body}${B}`, "iu"));
const VAGUE = [
  new RegExp(String.raw`${B}etc\.?`, "iu"),
  ...[
    "and so on", "as needed", "as appropriate", "TBD", "TODO",
    "to be (decided|defined|determined)", "if possible", "probably", "roughly",
    "something like", "or similar", "such as", "for instance",
  ].map((body) => new RegExp(`${B}${body}${B}`, "iu")),
];
const DEFAULT_PATH_PREFIXES = ["docs/", "scripts/", "server/", "tck/", "models/", "requirements/", "sources/", ".github/"];

const HOOK = new RegExp(`${B}use[A-Z][A-Za-z]+(?:Query|Mutation)${B}`, "gu");
const BACKTICKED = /`([^`]+)`/gu;
const HEADING = /^#{1,6} /u;
const HEADING_LEVEL = /^(#+) /u;
const STRIP = new RegExp(`^[${SPACE}]+|[${SPACE}]+$`, "gu");
const LINE_BREAK = /\r\n|[\n\r\v\f\x1c\x1d\x1e\x85\u2028\u2029]/u;
const DECIMAL_DIGIT = new RegExp(DIGIT, "u");

// Reads a file as strict UTF-8, keeps a byte order mark and turns CRLF and CR into LF.
function read(file) {
  const text = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(readFileSync(file));
  return text.replace(/\r\n?/g, "\n");
}

// Splits a text into lines on every line boundary of Unicode, without a last empty line.
function splitLines(text) {
  const lines = text.split(LINE_BREAK);
  if (lines[lines.length - 1] === "") lines.pop();
  return lines;
}

const strip = (text) => text.replace(STRIP, "");

// The first "count" code points of a text.
function cut(text, count) {
  return text.length <= count ? text : Array.from(text).slice(0, count).join("");
}

// Order of two texts by code point. The default JavaScript order compares UTF-16 units.
function byCodePoint(a, b) {
  const left = Array.from(a);
  const right = Array.from(b);
  const length = Math.min(left.length, right.length);
  for (let i = 0; i < length; i += 1) {
    const difference = left[i].codePointAt(0) - right[i].codePointAt(0);
    if (difference !== 0) return difference;
  }
  return left.length - right.length;
}

// The integer value of a run of decimal digits of any script. Every script stores its ten
// digits in one ascending run of code points.
function integer(digits) {
  let ascii = "";
  for (const digit of digits) {
    const codePoint = digit.codePointAt(0);
    if (codePoint < 128) {
      ascii += digit;
      continue;
    }
    let first = codePoint;
    while (DECIMAL_DIGIT.test(String.fromCodePoint(first - 1))) first -= 1;
    ascii += String((codePoint - first) % 10);
  }
  return BigInt(ascii);
}

function byInteger(a, b) {
  const left = integer(a);
  const right = integer(b);
  if (left !== right) return left < right ? -1 : 1;
  return byCodePoint(a, b);
}

const escapeRegExp = (text) => text.replace(/[\\^$.*+?()[\]{}|]/g, "\\$&");

// A case-insensitive search. The dotted capital I (U+0130) and the dotless small i (U+0131)
// count as the letter i.
const searchIgnoringCase = (pattern, line) => pattern.test(line.replace(/[\u0130\u0131]/g, "i"));

const findAll = (pattern, text, group = 1) => Array.from(text.matchAll(pattern), (match) => match[group]);

function linesMatching(text, pattern) {
  const found = [];
  splitLines(text).forEach((line, index) => {
    if (searchIgnoringCase(pattern, line)) found.push([index + 1, cut(strip(line), 110)]);
  });
  return found;
}

// First heading line whose text contains the keyword, without regard to case. The function
// returns the line or null.
function findHeading(text, keyword) {
  const wanted = keyword.toLowerCase();
  for (const line of splitLines(text)) {
    if (HEADING.test(line) && line.toLowerCase().includes(wanted)) return line;
  }
  return null;
}

// Body from the heading line to the next heading of equal or higher level.
function sectionByHeading(text, headingLine) {
  if (!headingLine) return "";
  const lines = splitLines(text);
  const level = headingLine.length - headingLine.replace(/^#+/, "").length;
  const start = lines.indexOf(headingLine);
  for (let j = start + 1; j < lines.length; j += 1) {
    const match = HEADING_LEVEL.exec(lines[j]);
    if (match && match[1].length <= level) return lines.slice(start, j).join("\n");
  }
  return lines.slice(start).join("\n");
}

// Cells of the column whose header contains the keyword, over every table of the section.
function tableColumn(section, headerKeyword) {
  const cells = [];
  const wanted = headerKeyword.toLowerCase();
  let column = null;
  for (const line of splitLines(section)) {
    if (!line.startsWith("|")) {
      column = null;
      continue;
    }
    const parts = strip(line).replace(/^\|+|\|+$/g, "").split("|").map(strip);
    if (column === null) {
      parts.forEach((part, index) => {
        if (part.toLowerCase().includes(wanted)) column = index;
      });
      continue;
    }
    if (/^[-: ]*$/.test(strip(line.replaceAll("|", "")))) continue;
    if (column < parts.length) cells.push(parts[column]);
  }
  return cells;
}

// Blanks out inline code spans and fenced code blocks: identifiers and code are not prose.
function proseOnly(text) {
  const withoutBlocks = text.replace(/```.*?```/gsu, (block) => "\n".repeat(block.split("\n").length - 1));
  return withoutBlocks.replace(/`[^`\n]*`/gu, "``");
}

function checkStyle(text) {
  const prose = proseOnly(text);
  const found = [];
  splitLines(prose).forEach((line, index) => {
    if (DASHES.test(line)) found.push([index + 1, `dash: ${cut(strip(line), 100)}`]);
  });
  for (const word of WATCH_WORDS) {
    for (const [number, line] of linesMatching(prose, word)) found.push([number, `watch-word: ${line}`]);
  }
  return found;
}

function checkVague(text) {
  const prose = proseOnly(text);
  const found = [];
  for (const phrase of VAGUE) {
    for (const [number, line] of linesMatching(prose, phrase)) found.push([number, `vague: ${line}`]);
  }
  return found;
}

function checkDecisions(text) {
  const defined = new Set(findAll(new RegExp(String.raw`\*\*D(${DIGIT}+)[.:]`, "gu"), text));
  const citation = new RegExp(String.raw`\u00a7${DIGIT}+ D(${DIGIT}+)|${B}D(${DIGIT}+)${B}(?=[ ,.;:)])`, "gu");
  const cited = new Set(Array.from(text.matchAll(citation), (match) => match[1] || match[2]));
  return [...cited]
    .filter((decision) => !defined.has(decision))
    .sort(byInteger)
    .map((decision) => [0, `decision D${decision} cited but not defined`]);
}

function checkSections(text) {
  const numbered = new RegExp(String.raw`${BOL}#{2,4} (${DIGIT}+(?:\.${DIGIT}+){0,2})[. ]`, "gu");
  const headings = new Set(findAll(numbered, text));
  const messages = new Set();
  for (const reference of findAll(new RegExp(String.raw`\u00a7(${DIGIT}+(?:\.${DIGIT}+){0,2})`, "gu"), text)) {
    if (headings.has(reference)) continue;
    const parts = reference.split(".");
    // A numbered list item inside a section.
    if (parts.length >= 2 && headings.has(parts.slice(0, -1).join("."))) continue;
    messages.add(`section \u00a7${reference} cited but no such heading`);
  }
  return [...messages].sort(byCodePoint).map((message) => [0, message]);
}

// A "row n" citation refers to a numbered table of the specification. A "registry row n"
// citation refers to an external document.
function checkRows(text) {
  const defined = new Set(findAll(new RegExp(String.raw`${BOL}\| (${DIGIT}+) \| `, "gu"), text));
  const citation = new RegExp(
    String.raw`(?<!registry )(?<!Registry )${B}rows? (${DIGIT}+(?:(?:,| and| to|,? and) ?${DIGIT}+)*)`,
    "gu",
  );
  const cited = new Set();
  for (const list of findAll(citation, text)) {
    for (const row of findAll(new RegExp(`(${DIGIT}+)`, "gu"), list)) cited.add(row);
  }
  return [...cited]
    .filter((row) => !defined.has(row))
    .sort(byInteger)
    .map((row) => [0, `row ${row} cited but no numbered table row ${row}`]);
}

// The longest list of code points with which every text of the list starts.
function commonPrefix(texts) {
  const all = texts.map((text) => Array.from(text));
  let prefix = all[0] ?? [];
  for (const text of all) {
    let length = 0;
    while (length < prefix.length && length < text.length && prefix[length] === text[length]) length += 1;
    prefix = prefix.slice(0, length);
  }
  return prefix;
}

// The identifier column of the Screens (or equivalent) section defines the ids. The tours
// and the tests consume the ids.
function checkTestIds(screensSection, givenPrefix, consumerSections, idColumn) {
  const defined = new Set();
  for (const cell of tableColumn(screensSection, idColumn)) {
    for (const id of findAll(BACKTICKED, cell)) defined.add(id);
  }
  if (defined.size === 0) return [[0, `no column containing '${idColumn}' found in the identifiers section`]];
  let prefix = givenPrefix;
  if (!prefix) {
    const shared = commonPrefix([...defined]);
    if (shared.length < 2) return [[0, "test ids share no common prefix; pass --testid-prefix"]];
    prefix = shared.join("");
  }
  const bases = [...new Set([...defined].map((id) => id.split("<")[0]))];
  const usage = new RegExp("`(" + escapeRegExp(prefix) + "[A-Za-z0-9<>#_-]+)`", "gu");
  const used = new Set();
  for (const section of consumerSections) {
    for (const id of findAll(usage, section)) {
      if (!id.includes(".")) used.add(id);
    }
  }
  return [...used]
    .sort(byCodePoint)
    .filter((id) => !bases.some((base) => id.split("<")[0].startsWith(base)))
    .map((id) => [0, `test id \`${id}\` used in a tour or test but not defined in the Screens section`]);
}

// A string id is defined when the Strings section names the id (as `STRINGS.x.y`, `x.y`,
// `y` or a table row) or the family of the id with a wildcard.
function checkStrings(text, stringsSection) {
  const references = new Set(findAll(/STRINGS\.([A-Za-z0-9_.<>#*-]+)/gu, text));
  const families = new Set(
    findAll(new RegExp(String.raw`STRINGS\.([A-Za-z0-9_-]+)\.(?:\*|<|${DIGIT}+\.\.)`, "gu"), stringsSection),
  );
  const found = [];
  for (const reference of [...references].sort(byCodePoint)) {
    if (/[<>*#]/.test(reference) || reference.endsWith(".") || reference.includes("..")) continue;
    const parts = reference.split(".");
    const family = parts[0];
    const leaf = parts[parts.length - 1];
    const rest = reference.slice(family.length + 1);
    const named = new RegExp(String.raw`STRINGS\.${escapeRegExp(reference)}${B}`, "u");
    if (families.has(family) || named.test(stringsSection)) continue;
    if (rest && (stringsSection.includes(`\`${rest}\``) || stringsSection.includes(`\`${leaf}\``))) continue;
    const row = new RegExp(String.raw`${BOL}\| ` + "`?" + escapeRegExp(leaf) + "`?" + String.raw` \|`, "u");
    if (row.test(stringsSection)) continue;
    found.push([0, `STRINGS.${reference} used but not defined in the Strings section`]);
  }
  return found;
}

// The regular expression of one path component of a glob: "*", "?", "[seq]" and "[!seq]".
function componentPattern(component) {
  const chars = Array.from(component);
  const literal = (char) => `\\u{${char.codePointAt(0).toString(16)}}`;
  let source = "";
  let i = 0;
  while (i < chars.length) {
    const char = chars[i];
    i += 1;
    if (char === "*") {
      source += ".*";
    } else if (char === "?") {
      source += ".";
    } else if (char === "[") {
      let j = i;
      if (j < chars.length && chars[j] === "!") j += 1;
      if (j < chars.length && chars[j] === "]") j += 1;
      while (j < chars.length && chars[j] !== "]") j += 1;
      if (j >= chars.length) {
        source += literal("[");
        continue;
      }
      let chunks = [chars.slice(i, j)];
      if (chunks[0].includes("-")) {
        // A hyphen between two characters makes a range. A first or last hyphen is a character.
        chunks = [];
        let start = i;
        let k = chars[i] === "!" ? i + 2 : i + 1;
        for (;;) {
          k = k < j ? chars.indexOf("-", k) : -1;
          if (k < 0 || k >= j) break;
          chunks.push(chars.slice(start, k));
          start = k + 1;
          k += 3;
        }
        const tail = chars.slice(start, j);
        if (tail.length > 0) chunks.push(tail);
        else chunks[chunks.length - 1].push("-");
        // A range whose end lies before its start matches nothing and is removed.
        for (let c = chunks.length - 1; c > 0; c -= 1) {
          const previous = chunks[c - 1];
          if (previous[previous.length - 1].codePointAt(0) > chunks[c][0].codePointAt(0)) {
            chunks[c - 1] = previous.slice(0, -1).concat(chunks[c].slice(1));
            chunks.splice(c, 1);
          }
        }
      }
      i = j + 1;
      const content = chunks.map((chunk) => chunk.join("")).join("-");
      if (content === "") {
        source += "(?!)";
      } else if (content === "!") {
        source += ".";
      } else {
        const negated = chunks[0][0] === "!";
        if (negated) chunks[0] = chunks[0].slice(1);
        source += `[${negated ? "^" : ""}${chunks.map((chunk) => chunk.map(literal).join("")).join("-")}]`;
      }
    } else {
      source += literal(char);
    }
  }
  return new RegExp(`^(?:${source})$`, "su");
}

// True for an existing path and for a symbolic link whose target is missing.
function linkExists(file) {
  try {
    lstatSync(file);
    return true;
  } catch {
    return false;
  }
}

// True for an existing path. A symbolic link whose target is missing does not exist.
function pathExists(file) {
  try {
    statSync(file);
    return true;
  } catch {
    return false;
  }
}

function isDirectory(file) {
  try {
    return statSync(file).isDirectory();
  } catch {
    return false;
  }
}

function entries(directory) {
  try {
    return readdirSync(directory === "" ? "." : directory);
  } catch {
    return [];
  }
}

// The paths that match a glob pattern. The matching is not recursive, a wildcard does not
// match a name that starts with a dot, and Windows compares names without regard to case.
function glob(pattern) {
  const windows = process.platform === "win32";
  const root = path.parse(pattern).root;
  const components = pattern.slice(root.length).split(windows ? /[\\/]+/ : /\/+/);
  const join = (directory, name) =>
    directory === "" || directory.endsWith("/") || (windows && /[\\:]$/.test(directory))
      ? directory + name
      : directory + path.sep + name;
  let found = [root];
  components.forEach((component, index) => {
    if (component === "") {
      if (index > 0) found = found.filter(isDirectory);
      return;
    }
    if (!/[*?[]/.test(component)) {
      found = found.map((directory) => join(directory, component)).filter(linkExists);
      return;
    }
    const fold = (name) => (windows ? name.toLowerCase() : name);
    const matcher = componentPattern(fold(component));
    const hidden = component.startsWith(".");
    found = found.flatMap((directory) =>
      entries(directory)
        .filter((name) => (hidden || !name.startsWith(".")) && matcher.test(fold(name)))
        .map((name) => join(directory, name)),
    );
  });
  return found;
}

// Joins a root and a path that the specification cites. An absolute cited path replaces the root.
function joinPath(root, cited) {
  if (path.isAbsolute(cited)) return path.resolve(root, cited);
  if (root === "" || /[\\/]$/.test(root)) return root + cited;
  return root + path.sep + cited;
}

function liveHooks(sourceRoot, apiGlobs) {
  const hooks = new Set();
  const exported = new RegExp(String.raw`export const \{([^}]*)\}[${SPACE}]*=`, "u");
  const hookName = new RegExp(`use[A-Z][${WORD}]+`, "gu");
  const endpoint = new RegExp(String.raw`${BOL}[${SPACE}]+([${WORD}]+): build\.(query|mutation)\(`, "gu");
  for (const apiGlob of apiGlobs) {
    for (const file of glob(joinPath(sourceRoot, apiGlob))) {
      const text = read(file);
      const match = exported.exec(text);
      if (match) {
        for (const hook of findAll(hookName, match[1], 0)) hooks.add(hook);
        continue;
      }
      for (const [, name, kind] of text.matchAll(endpoint)) {
        const [first, ...others] = Array.from(name);
        const capitalised = first.toUpperCase() + others.join("");
        hooks.add(`use${capitalised}${kind === "query" ? "Query" : "Mutation"}`);
        if (kind === "query") hooks.add(`useLazy${capitalised}Query`);
      }
    }
  }
  return hooks;
}

function checkHooks(text, sourceRoot, apiGlobs) {
  if (!sourceRoot) return null;
  const live = liveHooks(sourceRoot, apiGlobs);
  const lines = splitLines(text);
  const markedNew = new Set();
  const newWord = new RegExp(`${B}new${B}`, "iu");
  for (const line of lines) {
    if (searchIgnoringCase(newWord, line)) {
      for (const hook of findAll(HOOK, line, 0)) markedNew.add(hook);
    }
  }
  const found = [];
  lines.forEach((line, index) => {
    for (const hook of [...new Set(findAll(HOOK, line, 0))].sort(byCodePoint)) {
      if (!live.has(hook) && !markedNew.has(hook)) {
        found.push([index + 1, `hook \`${hook}\` is neither exported by the live api files nor marked new anywhere`]);
      }
    }
  });
  return found;
}

function checkPaths(text, sourceRoot, filesSection, prefixes) {
  if (!sourceRoot) return null;
  const newOrDeleted = new Set();
  const newOrDeleteCell = new RegExp(String.raw`\|[${SPACE}]*(new|delete)`, "iu");
  for (const line of splitLines(filesSection || "")) {
    if (searchIgnoringCase(newOrDeleteCell, line)) {
      for (const cited of findAll(BACKTICKED, line)) newOrDeleted.add(cited);
    }
  }
  const citedPath = new RegExp("`((?:" + prefixes.map(escapeRegExp).join("|") + ")[^`" + SPACE + "]+)`", "gu");
  const newOrDeletedWord = new RegExp(`${B}(new|delete[ds]?|deletion)${B}`, "iu");
  const found = [];
  const seen = new Set();
  splitLines(text).forEach((line, index) => {
    for (const cited of findAll(citedPath, line)) {
      if (seen.has(cited)) continue;
      seen.add(cited);
      if (/[*<>{}]/.test(cited) || cited.endsWith("/") || newOrDeleted.has(cited)) continue;
      if (searchIgnoringCase(newOrDeletedWord, line)) continue;
      if (!pathExists(joinPath(sourceRoot, cited))) {
        found.push([index + 1, `path \`${cited}\` cited as existing but not found under ${sourceRoot}`]);
      }
    }
  });
  return found;
}

const OPTIONS = {
  "--help": { help: true },
  "--src": { key: "src" },
  "--api": { key: "api", list: true },
  "--files-heading": { key: "filesHeading" },
  "--screens-heading": { key: "screensHeading" },
  "--strings-heading": { key: "stringsHeading" },
  "--consumer-heading": { key: "consumerHeading", list: true },
  "--testid-prefix": { key: "testidPrefix" },
  "--id-column": { key: "idColumn" },
  "--path-prefix": { key: "pathPrefix", list: true },
};
const USAGE =
  "usage: spec-gate-check.mjs [-h] [--src SRC] [--api API] [--files-heading FILES_HEADING]\n" +
  "                           [--screens-heading SCREENS_HEADING] [--strings-heading STRINGS_HEADING]\n" +
  "                           [--consumer-heading CONSUMER_HEADING] [--testid-prefix TESTID_PREFIX]\n" +
  "                           [--id-column ID_COLUMN] [--path-prefix PATH_PREFIX]\n" +
  "                           spec\n";

class UsageError extends Error {}

// Reads the command line: "--name value", "--name=value", a unique start of an option name,
// and one positional argument, the specification.
function parseArguments(argv) {
  const parsed = {
    spec: null,
    src: null,
    api: null,
    filesHeading: "Files to write",
    screensHeading: "Screens",
    stringsHeading: "Strings",
    consumerHeading: null,
    testidPrefix: null,
    idColumn: "testid",
    pathPrefix: null,
    help: false,
  };
  const positionals = [];
  const looksLikeOption = (token) =>
    token.startsWith("-") && token.length > 1 && !token.includes(" ") && !/^-\d+$|^-\d*\.\d+$/.test(token);
  let onlyPositionals = false;
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (onlyPositionals || !looksLikeOption(token)) {
      positionals.push(token);
      continue;
    }
    if (token === "--") {
      onlyPositionals = true;
      continue;
    }
    if (token === "-h") {
      parsed.help = true;
      continue;
    }
    const equals = token.indexOf("=");
    const typed = equals < 0 ? token : token.slice(0, equals);
    let names = typed in OPTIONS ? [typed] : [];
    if (names.length === 0 && typed.startsWith("--")) {
      names = Object.keys(OPTIONS).filter((name) => name.startsWith(typed));
    }
    if (names.length === 0) throw new UsageError(`unrecognized arguments: ${token}`);
    if (names.length > 1) throw new UsageError(`ambiguous option: ${typed} could match ${names.join(", ")}`);
    const [name] = names;
    const option = OPTIONS[name];
    if (option.help) {
      if (equals >= 0) throw new UsageError(`argument -h/--help: ignored explicit argument '${token.slice(equals + 1)}'`);
      parsed.help = true;
      continue;
    }
    let value;
    if (equals >= 0) {
      value = token.slice(equals + 1);
    } else {
      i += 1;
      if (i >= argv.length || looksLikeOption(argv[i])) throw new UsageError(`argument ${name}: expected one argument`);
      value = argv[i];
    }
    if (option.list) parsed[option.key] = [...(parsed[option.key] ?? []), value];
    else parsed[option.key] = value;
  }
  if (parsed.help) return parsed;
  if (positionals.length === 0) throw new UsageError("the following arguments are required: spec");
  if (positionals.length > 1) throw new UsageError(`unrecognized arguments: ${positionals.slice(1).join(" ")}`);
  [parsed.spec] = positionals;
  return parsed;
}

function main() {
  let options;
  try {
    options = parseArguments(process.argv.slice(2));
  } catch (error) {
    if (!(error instanceof UsageError)) throw error;
    process.stderr.write(`${USAGE}spec-gate-check.mjs: error: ${error.message}\n`);
    process.exitCode = 2;
    return;
  }
  if (options.help) {
    process.stdout.write(USAGE);
    return;
  }
  const text = read(options.spec);
  const filesSection = sectionByHeading(text, findHeading(text, options.filesHeading));
  const screensSection = sectionByHeading(text, findHeading(text, options.screensHeading));
  const stringsSection = sectionByHeading(text, findHeading(text, options.stringsHeading));
  const consumerSections = (options.consumerHeading ?? ["Guided", "Tour", "Tests"])
    .map((keyword) => sectionByHeading(text, findHeading(text, keyword)))
    .filter(Boolean);
  const missing = [
    [options.filesHeading, filesSection],
    [options.screensHeading, screensSection],
    [options.stringsHeading, stringsSection],
  ]
    .filter(([, section]) => !section)
    .map(([keyword]) => [0, `no heading containing '${keyword}'`]);

  const results = [
    ["mandatory sections present", missing],
    ["style (dashes, watch-list words)", checkStyle(text)],
    ["vague phrases", checkVague(text)],
    ["decisions cited vs defined", checkDecisions(text)],
    ["sections cited vs headings", checkSections(text)],
    ["table rows cited vs defined", checkRows(text)],
    ["test ids used vs defined", checkTestIds(screensSection, options.testidPrefix, consumerSections, options.idColumn)],
    ["string ids used vs defined", checkStrings(text, stringsSection)],
    ["hooks named vs live exports", checkHooks(text, options.src, options.api ?? ["src/api/*.js"])],
    ["paths cited vs substrate", checkPaths(text, options.src, filesSection, options.pathPrefix ?? DEFAULT_PATH_PREFIXES)],
  ];
  let failed = false;
  const output = [`spec gate: ${options.spec}`];
  for (const [name, findings] of results) {
    if (findings === null) {
      output.push(`  SKIPPED  ${name} (pass --src)`);
      failed = true;
      continue;
    }
    failed = failed || findings.length > 0;
    output.push(`  ${(findings.length === 0 ? "PASS" : "FAIL").padEnd(8)} ${name}: ${findings.length}`);
    for (const [number, message] of findings.slice(0, 40)) {
      output.push(`           ${number ? `L${number} ` : ""}${message}`);
    }
  }
  output.push(`result: ${failed ? "FAIL" : "PASS"}`);
  process.stdout.write(`${output.join("\n")}\n`);
  process.exitCode = failed ? 1 : 0;
}

main();
