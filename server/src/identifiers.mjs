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

// Contract: section 9.2.1 of docs/architecture/implementation_plan.md (the identifier conversions)
// and decision D50 (Every admitted form of an identifier accepted, one form sent). No requirement of
// the registry names the forms of an identifier (section 17.2 of the specification).
// The patterns of the identifiers of the reference server (EL-BACKEND, the HTTP API). The module
// reads no environment variable and creates no client.

// The pattern of a Business Partner Number of a legal entity (BPNL) and of a site (BPNS), as the
// stored shared model io.catenax.shared.business_partner_number 2.0.0 states the two patterns.
export const BPNL_PATTERN = /^BPNL[a-zA-Z0-9]{12}$/;
export const BPNS_PATTERN = /^BPNS[a-zA-Z0-9]{12}$/;

// The pattern of the characteristic UuidV4Trait of the stored shared model io.catenax.shared.uuid
// 2.1.0. The pattern has no flag, so the prefix urn:uuid: is admitted in lower case only.
export const UUID_PATTERN = new RegExp(
  "(^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$)|(^urn:uuid:[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$)",
);

const URN_PREFIX = "urn:uuid:";
const IDENTIFIER_MESSAGE = "Not a UUID of an admitted form";

// The error of the three conversions. The message never holds a part of the value.
export class IdentifierFormatError extends TypeError {
  constructor(path = "") {
    super(path === "" ? IDENTIFIER_MESSAGE : `${IDENTIFIER_MESSAGE} at ${path}`);
    this.name = "IdentifierFormatError";
    this.path = path;
  }
}

function bareUuid(value, path) {
  if (typeof value !== "string" || !UUID_PATTERN.test(value)) throw new IdentifierFormatError(path);
  const bare = value.startsWith(URN_PREFIX) ? value.slice(URN_PREFIX.length) : value;
  return bare.toLowerCase();
}

// Returns the prefix urn:uuid: and the 36 characters of the UUID in lower case.
export function normaliseUuid(value) {
  return `${URN_PREFIX}${bareUuid(value, "")}`;
}

// Returns the 36 characters of the UUID in lower case, the form of a column of the type uuid.
export function toUuidColumn(value) {
  return bareUuid(value, "");
}

function pointerToken(key) {
  return String(key).replaceAll("~", "~0").replaceAll("/", "~1");
}

function isIdentifierName(name) {
  return name === "catenaXId" || name.endsWith("CatenaXId");
}

// Copies a value of the content and normalises every property whose name ends with CatenaXId or
// equals catenaXId, at every depth and inside every list.
function normaliseContent(value, path) {
  if (Array.isArray(value)) return value.map((item, index) => normaliseContent(item, `${path}/${index}`));
  if (value === null || typeof value !== "object") return value;
  const copy = {};
  for (const [key, item] of Object.entries(value)) {
    const itemPath = `${path}/${pointerToken(key)}`;
    copy[key] = isIdentifierName(key) ? `${URN_PREFIX}${bareUuid(item, itemPath)}` : normaliseContent(item, itemPath);
  }
  return copy;
}

// Returns a copy of a notification in which header.messageId, header.relatedMessageId and every
// identifier property of the content hold the normalised form. The argument never changes.
export function normaliseMessage(message) {
  const copy = structuredClone(message);
  if (copy !== null && typeof copy === "object" && !Array.isArray(copy)) {
    const header = copy.header;
    if (header !== null && typeof header === "object" && !Array.isArray(header)) {
      for (const name of ["messageId", "relatedMessageId"]) {
        if (Object.hasOwn(header, name)) header[name] = `${URN_PREFIX}${bareUuid(header[name], `/header/${name}`)}`;
      }
    }
    if (Object.hasOwn(copy, "content")) copy.content = normaliseContent(copy.content, "/content");
  }
  return copy;
}
