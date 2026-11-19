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

// Requirements: SwR-DATASET-065 (Every dataset field marked with exactly one Art. 77(2) access group)
// and SwR-SUBMODELS-036 (Access marking assigns every served passport field one group), with decision
// D27 (A subset of JSONPath). Section 9.2.4 of docs/architecture/implementation_plan.md.
// The subset of JSONPath (RFC 9535) of the access map (EL-SUBMODELS, the submodel service): the root
// identifier $, the name selector in dot notation and in bracket notation, the wildcard selector [*],
// the index selector with a non-negative integer, and the filter selector [?@.<name>=='<string>'].
// Every function of the module is pure.

const DOT_NAME = /^\.([A-Za-z_][A-Za-z0-9_]*)/;
const BRACKET_NAME = /^\['([^'\\]*)'\]|^\["([^"\\]*)"\]/;
const WILDCARD = /^\[\*\]/;
const INDEX = /^\[(0|[1-9][0-9]*)\]/;
const FILTER = /^\[\?@\.([A-Za-z_][A-Za-z0-9_]*)=='([^'\\]*)'\]/;

// Returns the list of the selectors of a path of the subset, or null for a path outside the subset.
export function compilePath(path) {
  if (typeof path !== "string" || !path.startsWith("$")) return null;
  const selectors = [];
  let rest = path.slice(1);
  while (rest.length > 0) {
    let match;
    if ((match = DOT_NAME.exec(rest))) selectors.push({ kind: "name", name: match[1] });
    else if ((match = BRACKET_NAME.exec(rest))) selectors.push({ kind: "name", name: match[1] ?? match[2] });
    else if ((match = WILDCARD.exec(rest))) selectors.push({ kind: "wildcard" });
    else if ((match = INDEX.exec(rest))) {
      const index = Number(match[1]);
      if (!Number.isSafeInteger(index)) return null;
      selectors.push({ kind: "index", index });
    } else if ((match = FILTER.exec(rest))) selectors.push({ kind: "filter", name: match[1], value: match[2] });
    else return null;
    rest = rest.slice(match[0].length);
  }
  return Object.freeze(selectors);
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function pointerToken(key) {
  return String(key).replaceAll("~", "~0").replaceAll("/", "~1");
}

// The children of a node, each with its JSON pointer.
function children(node) {
  if (Array.isArray(node.value)) return node.value.map((value, index) => ({ value, pointer: `${node.pointer}/${index}` }));
  if (isObject(node.value)) return Object.entries(node.value).map(([key, value]) => ({ value, pointer: `${node.pointer}/${pointerToken(key)}` }));
  return [];
}

function select(node, selector) {
  switch (selector.kind) {
    case "name":
      return isObject(node.value) && Object.hasOwn(node.value, selector.name)
        ? [{ value: node.value[selector.name], pointer: `${node.pointer}/${pointerToken(selector.name)}` }]
        : [];
    case "wildcard":
      return children(node);
    case "index":
      return Array.isArray(node.value) && selector.index < node.value.length
        ? [{ value: node.value[selector.index], pointer: `${node.pointer}/${selector.index}` }]
        : [];
    case "filter":
      return children(node).filter((child) => isObject(child.value) && child.value[selector.name] === selector.value);
    default:
      return [];
  }
}

function collectLeaves(node, leaves) {
  if (Array.isArray(node.value) || isObject(node.value)) {
    for (const child of children(node)) collectLeaves(child, leaves);
    return;
  }
  leaves.add(node.pointer);
}

// Returns the JSON pointers of every leaf of the payload (a value that is neither an object nor a
// list) that the compiled path selects or that lies below a node that the path selects.
export function matchLeaves(compiledPath, payload) {
  let nodes = [{ value: payload, pointer: "" }];
  for (const selector of compiledPath) nodes = nodes.flatMap((node) => select(node, selector));
  const leaves = new Set();
  for (const node of nodes) collectLeaves(node, leaves);
  return [...leaves];
}

// Returns the JSON pointers of every leaf of the payload.
export function allLeaves(payload) {
  const leaves = new Set();
  collectLeaves({ value: payload, pointer: "" }, leaves);
  return [...leaves];
}
