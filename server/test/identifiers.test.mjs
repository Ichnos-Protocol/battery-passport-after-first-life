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

// Tests the identifier conversions of server/src/identifiers.mjs.
//
// Contracts that this file verifies (no requirement of the registry names the forms of an identifier,
// section 17.2 of the implementation specification):
//   section 9.2.1 of docs/architecture/implementation_plan.md (the identifier conversions)
//   decision D50 (Every admitted form of an identifier accepted, one form sent)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { BPNL_PATTERN, BPNS_PATTERN, IdentifierFormatError, UUID_PATTERN, normaliseMessage, normaliseUuid, toUuidColumn } from "../src/identifiers.mjs";

const BPN_MODEL = new URL("../../sources/Tractus-X/semantic-models/io.catenax.shared.business_partner_number/2.0.0/BusinessPartnerNumber.ttl", import.meta.url);
const UUID_MODEL = new URL("../../sources/Tractus-X/semantic-models/io.catenax.shared.uuid/2.1.0/Uuid.ttl", import.meta.url);

const LOWER = "9a2b8f61-3c5d-4e7a-8b1f-2d6c4a0e9f33";
const NORMALISED = `urn:uuid:${LOWER}`;
const FORMS = [LOWER, LOWER.toUpperCase(), `urn:uuid:${LOWER}`, `urn:uuid:${LOWER.toUpperCase()}`];
const REFUSED_VALUES = [
  ["9a2b8f61-3c5d-4e7a-8b1f-2d6c4a0e9f3", "35 characters"],
  [`URN:UUID:${LOWER}`, "a prefix in upper case"],
  [`urn:uuid:${LOWER} `, "a trailing space"],
  ["9a2b8f613c5d4e7a8b1f2d6c4a0e9f33", "no hyphens"],
  ["ga2b8f61-3c5d-4e7a-8b1f-2d6c4a0e9f33", "a character outside the class"],
  ["", "the empty text"],
  [null, "null"],
  [undefined, "undefined"],
  [42, "the number 42"],
];

// Returns the text of samm:value of the named constraint of a stored Turtle file.
function storedRegularExpression(file, constraint) {
  const text = readFileSync(file, "utf8");
  const start = constraint === undefined ? text.search(/a samm-c:RegularExpressionConstraint/) : text.indexOf(`${constraint} a samm-c:RegularExpressionConstraint`);
  assert.ok(start >= 0, `the constraint ${constraint ?? "of the file"} exists`);
  const match = /samm:value "((?:[^"\\]|\\.)*)"/.exec(text.slice(start));
  return match[1];
}

function message(operation, content, { relatedMessageId } = {}) {
  const header = {
    messageId: "0B2F1C7E-6D3A-4F5B-8C9D-1E2F3A4B5C6D",
    context: `BatteryPass-BatteryPassLifecycleNotificationAPI-${operation}:1`,
    sentDateTime: "2027-03-01T09:30:00Z",
    senderBpn: "BPNL00000000TCK2",
    receiverBpn: "BPNL00000000TCK1",
    version: "3.0.0",
  };
  if (relatedMessageId !== undefined) header.relatedMessageId = relatedMessageId;
  return { header, content };
}

test("decision D50 (Every admitted form of an identifier accepted, one form sent): the patterns of the identifiers", async (t) => {
  await t.test("BPNL_PATTERN accepts BPNL00000000TCK1", () => {
    assert.ok(BPNL_PATTERN.test("BPNL00000000TCK1"));
  });
  for (const [value, reason] of [
    ["BPNL0000000TCK1", "15 characters"],
    ["BPNL000000000TCK1", "17 characters"],
    ["bpnl00000000TCK1", "a lower-case prefix"],
    ["BPNL00000000TCK-", "a character outside the class"],
    ["BPNS00000000TCK1", "the prefix BPNS"],
  ]) {
    await t.test(`BPNL_PATTERN refuses ${value} (${reason})`, () => assert.equal(BPNL_PATTERN.test(value), false));
  }
  await t.test("BPNS_PATTERN accepts BPNS00000000TCK1", () => {
    assert.ok(BPNS_PATTERN.test("BPNS00000000TCK1"));
  });
  for (const [value, reason] of [
    ["BPNS0000000TCK1", "15 characters"],
    ["BPNS000000000TCK1", "17 characters"],
    ["bpns00000000TCK1", "a lower-case prefix"],
    ["BPNS00000000TCK-", "a character outside the class"],
    ["BPNL00000000TCK1", "the prefix BPNL"],
  ]) {
    await t.test(`BPNS_PATTERN refuses ${value} (${reason})`, () => assert.equal(BPNS_PATTERN.test(value), false));
  }
  await t.test("the three patterns equal the stored texts of the two shared models and have no flag", () => {
    assert.equal(BPNL_PATTERN.source, storedRegularExpression(BPN_MODEL, ":BpnlRegularExpression"));
    assert.equal(BPNS_PATTERN.source, storedRegularExpression(BPN_MODEL, ":BpnsRegularExpression"));
    assert.equal(UUID_PATTERN.source, storedRegularExpression(UUID_MODEL));
    for (const pattern of [BPNL_PATTERN, BPNS_PATTERN, UUID_PATTERN]) assert.equal(pattern.flags, "");
  });
});

test("decision D50: normaliseUuid and toUuidColumn", async (t) => {
  for (const form of FORMS) {
    await t.test(`the form ${form} gives the normalised form and the column form`, () => {
      assert.equal(normaliseUuid(form), NORMALISED);
      assert.equal(toUuidColumn(form), LOWER);
    });
  }
  for (const [value, reason] of REFUSED_VALUES) {
    await t.test(`${reason} makes both functions throw an IdentifierFormatError without the value in its message`, () => {
      for (const convert of [normaliseUuid, toUuidColumn]) {
        let error;
        try {
          convert(value);
        } catch (caught) {
          error = caught;
        }
        assert.ok(error instanceof IdentifierFormatError, `${convert.name} throws an IdentifierFormatError`);
        assert.ok(error instanceof TypeError);
        assert.equal(error.path, "");
        assert.equal(error.message, "Not a UUID of an admitted form");
        if (typeof value === "string" && value.length > 0) assert.equal(error.message.includes(value), false);
      }
    });
  }
});

test("decision D50: normaliseMessage", async (t) => {
  const upper = LOWER.toUpperCase();
  const cases = {
    NewPassportIssued: {
      passportIdentifier: "did:web:second-life.example:passport:new-0001",
      catenaXId: upper,
      operation: "repurposing",
      operationDate: "2027-03-01T09:30:00Z",
      predecessorPassportIdentifier: "did:web:manufacturer.example:passport:original-0001",
    },
    BatteryRepaired: { passportIdentifier: "TCK-PASSPORT-0001", repairDate: "2027-03-01T09:30:00Z", repairCertificateCatenaXId: upper },
    BatteryBecameWaste: { passportIdentifier: "TCK-PASSPORT-0001", successorBpnl: "BPNL00000000TCK4", successorRole: "producer", date: "2027-03-01T09:30:00Z" },
    PassportEnded: { passportIdentifier: "TCK-PASSPORT-0001", recyclingDate: "2027-03-01T09:30:00Z", recyclerBpnl: "BPNL00000000TCK3", materialRecyclingCertificateCatenaXId: upper },
  };
  const identifierFields = { NewPassportIssued: ["catenaXId"], BatteryRepaired: ["repairCertificateCatenaXId"], BatteryBecameWaste: [], PassportEnded: ["materialRecyclingCertificateCatenaXId"] };
  for (const [operation, content] of Object.entries(cases)) {
    await t.test(`${operation}: every identifier holds the normalised form and every other field is unchanged`, () => {
      const input = message(operation, content, { relatedMessageId: "1C2D3E4F-5A6B-4C7D-8E9F-0A1B2C3D4E5F" });
      const before = structuredClone(input);
      const output = normaliseMessage(input);
      assert.deepStrictEqual(input, before, "the argument is deeply equal before and after the call");
      assert.equal(output.header.messageId, "urn:uuid:0b2f1c7e-6d3a-4f5b-8c9d-1e2f3a4b5c6d");
      assert.equal(output.header.relatedMessageId, "urn:uuid:1c2d3e4f-5a6b-4c7d-8e9f-0a1b2c3d4e5f");
      for (const field of ["context", "sentDateTime", "senderBpn", "receiverBpn", "version"]) assert.equal(output.header[field], input.header[field]);
      for (const [field, value] of Object.entries(content)) {
        assert.equal(output.content[field], identifierFields[operation].includes(field) ? NORMALISED : value, field);
      }
    });
  }
  await t.test("an absent relatedMessageId stays absent", () => {
    const output = normaliseMessage(message("BatteryRepaired", cases.BatteryRepaired));
    assert.equal(Object.hasOwn(output.header, "relatedMessageId"), false);
  });
  await t.test("a content property predecessors, a list of two objects, has its four identifiers normalised", () => {
    const input = message("NewPassportIssued", {
      ...cases.NewPassportIssued,
      predecessors: [
        { catenaXId: upper, originalModelCatenaXId: LOWER },
        { catenaXId: `urn:uuid:${upper}`, originalModelCatenaXId: upper },
      ],
    });
    const before = structuredClone(input);
    const output = normaliseMessage(input);
    assert.deepStrictEqual(input, before);
    assert.deepStrictEqual(output.content.predecessors, [
      { catenaXId: NORMALISED, originalModelCatenaXId: NORMALISED },
      { catenaXId: NORMALISED, originalModelCatenaXId: NORMALISED },
    ]);
  });
  const wrong = "not-a-uuid";
  for (const [path, change] of [
    ["/header/messageId", (input) => (input.header.messageId = wrong)],
    ["/header/relatedMessageId", (input) => (input.header.relatedMessageId = wrong)],
    ["/content/catenaXId", (input) => (input.content.catenaXId = wrong)],
    ["/content/predecessors/1/catenaXId", (input) => (input.content.predecessors = [{ catenaXId: LOWER }, { catenaXId: wrong }])],
  ]) {
    await t.test(`a value outside the pattern at ${path} throws an IdentifierFormatError with that path`, () => {
      const input = message("NewPassportIssued", { ...cases.NewPassportIssued });
      change(input);
      assert.throws(
        () => normaliseMessage(input),
        (error) => error instanceof IdentifierFormatError && error.path === path && error.message === `Not a UUID of an admitted form at ${path}` && !error.message.includes(wrong),
      );
    });
  }
});
