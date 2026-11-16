#!/usr/bin/env python3
################################################################################
# Copyright (c) 2026 Ichnos Protocol Pte. Ltd.
# Copyright (c) 2026 Contributors to the Eclipse Foundation
#
# See the NOTICE file(s) distributed with this work for additional
# information regarding copyright ownership.
#
# This program and the accompanying materials are made available under the
# terms of the Apache License, Version 2.0 which is available at
# https://www.apache.org/licenses/LICENSE-2.0.
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
# WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
# License for the specific language governing permissions and limitations
# under the License.
#
# SPDX-License-Identifier: Apache-2.0
################################################################################
"""
spec_gate_check.py: the mechanical checks of a specification of this repository.

Runs, on any specification written for an implementation agent, the checks that a literal
implementer would otherwise turn into questions: writing-style breaches, vague phrases,
undefined cross-references (decisions, sections, numbered table rows), string ids and test
ids used but never defined, hooks named that the live code does not export, and cited file
paths that do not exist in the repository.

The script finds the sections of the specification by their names, not their numbers. The
headings that it needs contain "Files to write", "Screens", "Strings" and "Decisions";
override the names with the options below when a specification uses others.

Usage:
  python scripts/spec_gate_check.py <spec.md> [--src <root>] [--api <glob>]...
        [--files-heading "Files to write"] [--screens-heading "Screens"]
        [--strings-heading "Strings"] [--testid-prefix <prefix>]
        [--path-prefix docs/ --path-prefix server/ ...]

  --src   root against which cited paths resolve (for example the repository root).
          Without it the path and hook checks are SKIPPED, and a SKIPPED check does not
          pass the gate.
  --api   glob(s), relative to --src, of the endpoint files whose exported hooks are the
          only hooks a specification may name without marking them new (default
          src/api/*.js).

Exit code 0 only when every executed check reports 0 findings.
"""
import argparse
import glob
import os
import re
import sys

DASHES = re.compile("[—–]")
WATCH_WORDS = [
    r"\bfalls on\b", r"\bsits with\b", r"\blands on\b", r"\blies with\b", r"\brests with\b",
    r"\bborn in\b", r"\blives\b", r"\bwhatever\b", r"\bglue\b", r"\bpivots?\b", r"\bgatehouse\b",
    r"\bmoat\b", r"\bseam\b", r"\bheadache\b", r"\bledger\b", r"\bwalk(ed|s)?\b", r"\blot\b",
    r"\btestnet\b", r"\bcertified\b", r"\bofficial partner\b", r"\bpowered by\b",
]
VAGUE = [
    r"\betc\.?", r"\band so on\b", r"\bas needed\b", r"\bas appropriate\b", r"\bTBD\b", r"\bTODO\b",
    r"\bto be (decided|defined|determined)\b", r"\bif possible\b", r"\bprobably\b", r"\broughly\b",
    r"\bsomething like\b", r"\bor similar\b", r"\bsuch as\b", r"\bfor instance\b",
]
DEFAULT_PATH_PREFIXES = ["docs/", "scripts/", "server/", "tck/", "models/", "requirements/", "sources/", ".github/"]


def read(path):
    with open(path, encoding="utf-8") as f:
        return f.read()


def lines_matching(text, pattern, flags=re.I):
    return [(n, line.strip()[:110]) for n, line in enumerate(text.splitlines(), 1) if re.search(pattern, line, flags)]


def find_heading(text, keyword):
    """First heading line whose text contains keyword (case-insensitive); returns the line or None."""
    for line in text.splitlines():
        if re.match(r"^#{1,6} ", line) and keyword.lower() in line.lower():
            return line
    return None


def section_by_heading(text, heading_line):
    """Body from heading_line to the next heading of equal or higher level."""
    if not heading_line:
        return ""
    lines = text.splitlines()
    level = len(heading_line) - len(heading_line.lstrip("#"))
    start = lines.index(heading_line)
    for j in range(start + 1, len(lines)):
        m = re.match(r"^(#+) ", lines[j])
        if m and len(m.group(1)) <= level:
            return "\n".join(lines[start:j])
    return "\n".join(lines[start:])


def table_column(sec, header_keyword):
    """Cells of the column whose header contains header_keyword, over every table in sec."""
    cells, col = [], None
    for line in sec.splitlines():
        if not line.startswith("|"):
            col = None
            continue
        parts = [p.strip() for p in line.strip().strip("|").split("|")]
        if col is None:
            for i, p in enumerate(parts):
                if header_keyword.lower() in p.lower():
                    col = i
            continue
        if set(line.replace("|", "").strip()) <= set("-: "):
            continue
        if col is not None and col < len(parts):
            cells.append(parts[col])
    return cells


def prose_only(text):
    """Blank out inline code spans and fenced code blocks: identifiers and code are not prose."""
    text = re.sub(r"```.*?```", lambda m: "\n" * m.group(0).count("\n"), text, flags=re.S)
    return re.sub(r"`[^`\n]*`", "``", text)


def check_style(text):
    prose = prose_only(text)
    out = [(n, "dash: " + l.strip()[:100]) for n, l in enumerate(prose.splitlines(), 1) if DASHES.search(l)]
    for w in WATCH_WORDS:
        out += [(n, "watch-word: " + l) for n, l in lines_matching(prose, w)]
    return out


def check_vague(text):
    prose = prose_only(text)
    out = []
    for v in VAGUE:
        out += [(n, "vague: " + l) for n, l in lines_matching(prose, v)]
    return out


def check_decisions(text):
    defined = set(re.findall(r"\*\*D(\d+)[.:]", text))
    cited = {a or b for a, b in re.findall(r"§\d+ D(\d+)|\bD(\d+)\b(?=[ ,.;:)])", text)}
    return [(0, f"decision D{d} cited but not defined") for d in sorted(cited - defined, key=int)]


def check_sections(text):
    headings = set(m.group(1) for m in re.finditer(r"^#{2,4} (\d+(?:\.\d+){0,2})[. ]", text, re.M))
    out = set()
    for m in re.finditer(r"§(\d+(?:\.\d+){0,2})", text):
        ref = m.group(1)
        if ref in headings:
            continue
        parent = ".".join(ref.split(".")[:-1])
        if parent in headings and ref.count(".") >= 1:
            continue  # a numbered list item inside a section
        out.add((0, f"section §{ref} cited but no such heading"))
    return sorted(out)


def check_rows(text):
    """'row n' citations refer to the spec's own numbered tables; 'registry row n' refers to an external document."""
    defined = set(re.findall(r"^\| (\d+) \| ", text, re.M))
    cited = set()
    for m in re.finditer(r"(?<!registry )(?<!Registry )\brows? (\d+(?:(?:,| and| to|,? and) ?\d+)*)", text):
        cited |= set(re.findall(r"\d+", m.group(1)))
    return [(0, f"row {r} cited but no numbered table row {r}") for r in sorted(cited - defined, key=int)]


def check_testids(text, screens_sec, prefix, consumer_secs, id_column="testid"):
    """Ids are defined in the identifier column of the Screens (or equivalent) section and consumed by tours and tests."""
    defined = set()
    for cell in table_column(screens_sec, id_column):
        defined |= set(re.findall(r"`([^`]+)`", cell))
    if not defined:
        return [(0, f"no column containing '{id_column}' found in the identifiers section")]
    if not prefix:
        prefix = os.path.commonprefix(sorted(defined))
        if len(prefix) < 2:
            return [(0, "test ids share no common prefix; pass --testid-prefix")]
    bases = {d.split("<")[0] for d in defined}
    used = set()
    for sec in consumer_secs:
        used |= set(u for u in re.findall(r"`(%s[A-Za-z0-9<>#_-]+)`" % re.escape(prefix), sec) if "." not in u)
    return [(0, f"test id `{u}` used in a tour or test but not defined in the Screens section")
            for u in sorted(used) if not any(u.split("<")[0].startswith(b) for b in bases)]


def check_strings(text, strings_sec):
    """A string id is defined when the Strings section names it (as `STRINGS.x.y`, `x.y`, `y` or a table row) or its family with a wildcard."""
    refs = set(re.findall(r"STRINGS\.([A-Za-z0-9_.<>#*-]+)", text))
    families = set(re.findall(r"STRINGS\.([A-Za-z0-9_-]+)\.(?:\*|<|\d+\.\.)", strings_sec))
    out = []
    for r in sorted(refs):
        if any(ch in r for ch in "<>*#") or r.endswith(".") or ".." in r:
            continue
        fam, leaf = r.split(".")[0], r.split(".")[-1]
        rest = r[len(fam) + 1:]
        if fam in families or re.search(r"STRINGS\.%s\b" % re.escape(r), strings_sec):
            continue
        if rest and (re.search(r"`%s`" % re.escape(rest), strings_sec) or re.search(r"`%s`" % re.escape(leaf), strings_sec)):
            continue
        if re.search(r"^\| `?%s`? \|" % re.escape(leaf), strings_sec, re.M):
            continue
        out.append((0, f"STRINGS.{r} used but not defined in the Strings section"))
    return out


def live_hooks(src_root, api_globs):
    hooks = set()
    for g in api_globs:
        for f in glob.glob(os.path.join(src_root, g)):
            t = read(f)
            m = re.search(r"export const \{([^}]*)\}\s*=", t, re.S)
            if m:
                hooks |= set(re.findall(r"use[A-Z]\w+", m.group(1)))
            else:
                for name, kind in re.findall(r"^\s+(\w+): build\.(query|mutation)\(", t, re.M):
                    cap = name[0].upper() + name[1:]
                    hooks.add(f"use{cap}{'Query' if kind == 'query' else 'Mutation'}")
                    if kind == "query":
                        hooks.add(f"useLazy{cap}Query")
    return hooks


def check_hooks(text, src_root, api_globs):
    if not src_root:
        return None
    live = live_hooks(src_root, api_globs)
    marked_new = set()
    for line in text.splitlines():
        if re.search(r"\bnew\b", line, re.I):
            marked_new |= set(re.findall(r"\buse[A-Z][A-Za-z]+(?:Query|Mutation)\b", line))
    out = []
    for n, line in enumerate(text.splitlines(), 1):
        for h in sorted(set(re.findall(r"\buse[A-Z][A-Za-z]+(?:Query|Mutation)\b", line))):
            if h not in live and h not in marked_new:
                out.append((n, f"hook `{h}` is neither exported by the live api files nor marked new anywhere"))
    return out


def check_paths(text, src_root, files_sec, prefixes):
    if not src_root:
        return None
    new_or_deleted = set()
    for line in (files_sec or "").splitlines():
        if re.search(r"\|\s*(new|delete)", line, re.I):
            new_or_deleted |= set(re.findall(r"`([^`]+)`", line))
    out, seen = [], set()
    pat = r"`((?:%s)[^`\s]+)`" % "|".join(re.escape(x) for x in prefixes)
    for n, line in enumerate(text.splitlines(), 1):
        for p in re.findall(pat, line):
            if p in seen:
                continue
            seen.add(p)
            if any(ch in p for ch in "*<>{}") or p.endswith("/") or p in new_or_deleted:
                continue
            if re.search(r"\b(new|delete[ds]?|deletion)\b", line, re.I):
                continue
            if not os.path.exists(os.path.join(src_root, p)):
                out.append((n, f"path `{p}` cited as existing but not found under {src_root}"))
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("spec")
    ap.add_argument("--src")
    ap.add_argument("--api", action="append")
    ap.add_argument("--files-heading", default="Files to write")
    ap.add_argument("--screens-heading", default="Screens")
    ap.add_argument("--strings-heading", default="Strings")
    ap.add_argument("--consumer-heading", action="append",
                    help="headings of the sections that consume test ids (default: 'Guided', 'Tour', 'Tests')")
    ap.add_argument("--testid-prefix", default=None)
    ap.add_argument("--id-column", default="testid",
                    help="keyword of the identifier column in the Screens (or equivalent) section; default 'testid'")
    ap.add_argument("--path-prefix", action="append")
    a = ap.parse_args()
    text = read(a.spec)
    files_sec = section_by_heading(text, find_heading(text, a.files_heading))
    screens_sec = section_by_heading(text, find_heading(text, a.screens_heading))
    strings_sec = section_by_heading(text, find_heading(text, a.strings_heading))
    consumer_secs = [section_by_heading(text, find_heading(text, k)) for k in (a.consumer_heading or ["Guided", "Tour", "Tests"])]
    consumer_secs = [s for s in consumer_secs if s]
    missing = [(0, f"no heading containing '{k}'") for k, s in
               ((a.files_heading, files_sec), (a.screens_heading, screens_sec), (a.strings_heading, strings_sec)) if not s]

    results = {
        "mandatory sections present": missing,
        "style (dashes, watch-list words)": check_style(text),
        "vague phrases": check_vague(text),
        "decisions cited vs defined": check_decisions(text),
        "sections cited vs headings": check_sections(text),
        "table rows cited vs defined": check_rows(text),
        "test ids used vs defined": check_testids(text, screens_sec, a.testid_prefix, consumer_secs, a.id_column),
        "string ids used vs defined": check_strings(text, strings_sec),
        "hooks named vs live exports": check_hooks(text, a.src, a.api or ["src/api/*.js"]),
        "paths cited vs substrate": check_paths(text, a.src, files_sec, a.path_prefix or DEFAULT_PATH_PREFIXES),
    }
    failed = False
    print(f"spec gate: {a.spec}")
    for name, findings in results.items():
        if findings is None:
            print(f"  SKIPPED  {name} (pass --src)")
            failed = True
            continue
        failed = failed or bool(findings)
        print(f"  {'PASS' if not findings else 'FAIL':8} {name}: {len(findings)}")
        for n, msg in findings[:40]:
            print(f"           {('L%d ' % n) if n else ''}{msg}")
    print("result:", "FAIL" if failed else "PASS")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
