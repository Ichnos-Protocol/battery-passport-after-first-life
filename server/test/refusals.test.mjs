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

// Tests the refusals of server/src/dataset/refusals.mjs.
//
// Requirements of the registry that this file verifies:
//   SwR-BACKEND-148 (Notification answered 200 when accepted, 4xx or 5xx otherwise)
//   SwR-BACKEND-206 (Lifecycle notification failures answered with envelope and result object)
// Decision D9 (The error body) and section 9.5 of the implementation specification.
import assert from "node:assert/strict";
import { test } from "node:test";

import { REFUSALS, Refusal, refusalBody, refusalIdOfDatabaseError } from "../src/dataset/refusals.mjs";
import { createSchemaValidator } from "../src/validation/schemaValidator.mjs";

// The status of each refusal of section 9.5.
const STATUSES = {
  "ERR-RX-HEADER-INVALID": 400,
  "ERR-RX-CONTENT-INVALID": 400,
  "ERR-RX-CHANGE-OUTSIDE-STEP": 422,
  "ERR-RX-CONTEXT-MISMATCH": 400,
  "ERR-RX-RECEIVER-MISMATCH": 400,
  "ERR-RX-SENDER-MISMATCH": 403,
  "ERR-RX-MESSAGE-ID-REUSED": 409,
  "ERR-RX-PASSPORT-UNKNOWN": 404,
  "ERR-RX-STEP-REFUSED": 422,
  "ERR-RX-METHOD-NOT-ALLOWED": 405,
  "ERR-RX-BODY-TOO-LARGE": 413,
  "ERR-RX-OPERATION-UNKNOWN": 404,
  "ERR-RX-INTERNAL": 500,
  "ERR-AC-UNAUTHENTICATED": 401,
  "ERR-AC-CAPABILITY-MISSING": 403,
  "ERR-AC-ACCESS-GROUP-REFUSED": 403,
  "ERR-LC-BODY-INVALID": 400,
  "ERR-LC-BODY-TOO-LARGE": 413,
  "ERR-LC-NOT-DATA-PROVIDER": 403,
  "ERR-LC-PASSPORT-NOT-FOUND": 404,
  "ERR-LC-MODEL-NOT-FOUND": 404,
  "ERR-LC-RECORD-NOT-FOUND": 404,
  "ERR-LC-RECORD-EXISTS": 409,
  "ERR-LC-SUBMODEL-NOT-FOUND": 404,
  "ERR-LC-ASPECT-KEY-UNKNOWN": 404,
  "ERR-LC-IDENTIFIER-EXISTS": 409,
  "ERR-LC-IDENTITY-PERMANENT": 409,
  "ERR-LC-OPERATION-NOT-ADMITTED": 409,
  "ERR-LC-MODEL-NOT-ORIGINAL": 409,
  "ERR-LC-IDENTIFIER-RULE": 409,
  "ERR-LC-STATUS-NOT-ADMITTED": 409,
  "ERR-LC-PASSPORT-ENDED": 409,
  "ERR-LC-SUCCESSOR-AUTHORISATION-MISSING": 403,
  "ERR-LC-CERTIFICATE-NOT-REGISTERED": 409,
  "ERR-LC-NOTIFICATION-UNKNOWN": 404,
  "ERR-LC-ROLE-NOT-ADMITTED": 422,
  "ERR-LC-PATH-NOT-SUPPORTED": 422,
  "ERR-LC-ACCESS-MAP-INCOMPLETE": 422,
  "ERR-LC-ACCESS-MAP-VERSION-EXISTS": 409,
  "ERR-LC-ISSUER-NOT-LINKED": 422,
  "ERR-LC-CONTRACT-EXISTS": 409,
  "ERR-LC-CONTRACT-NOT-FOUND": 404,
  "ERR-LC-CONTRACT-ENDED": 409,
  "ERR-LC-PATH-UNKNOWN": 404,
  "ERR-LC-INTERNAL": 500,
};

// The database error mapping of section 9.5: one case per database error of each line, with the
// refusal on an operator endpoint and on a receiving endpoint.
const raised = (id) => ({ code: "P0001", message: `${id}: A sentence of the database.` });
const constraint = (code, name) => ({ code, constraint: name, message: "a message of the database" });
const MAPPING = [
  [raised("ERR-DB-IDENTITY-PERMANENT"), "ERR-LC-IDENTITY-PERMANENT", "ERR-RX-INTERNAL"],
  [raised("ERR-DB-STATUS-CHANGE"), "ERR-LC-STATUS-NOT-ADMITTED", "ERR-RX-STEP-REFUSED"],
  [raised("ERR-DB-END-DATE"), "ERR-LC-STATUS-NOT-ADMITTED", "ERR-RX-STEP-REFUSED"],
  [constraint("23514", "passports_end_after_waste_check"), "ERR-LC-STATUS-NOT-ADMITTED", "ERR-RX-STEP-REFUSED"],
  [constraint("23514", "passport_responsibility_intervals_period_check"), "ERR-LC-STATUS-NOT-ADMITTED", "ERR-RX-STEP-REFUSED"],
  [raised("ERR-DB-PASSPORT-ENDED"), "ERR-LC-PASSPORT-ENDED", "ERR-RX-STEP-REFUSED"],
  [raised("ERR-DB-SUCCESSOR-AUTHORISATION"), "ERR-LC-SUCCESSOR-AUTHORISATION-MISSING", "ERR-RX-STEP-REFUSED"],
  [constraint("23503", "passports_battery_model_fkey"), "ERR-LC-MODEL-NOT-FOUND", "ERR-RX-INTERNAL"],
  [raised("ERR-DB-WASTE-SUCCESSOR"), "ERR-LC-INTERNAL", "ERR-RX-INTERNAL"],
  [raised("ERR-DB-LINEAGE"), "ERR-LC-INTERNAL", "ERR-RX-INTERNAL"],
  [raised("ERR-DB-RESPONSIBILITY"), "ERR-LC-INTERNAL", "ERR-RX-INTERNAL"],
  [raised("ERR-DB-APPEND-ONLY"), "ERR-LC-INTERNAL", "ERR-RX-INTERNAL"],
  [raised("ERR-DB-ISOLATION"), "ERR-LC-INTERNAL", "ERR-RX-INTERNAL"],
  [{ code: "22007", message: "ERR-DB-TODAY: The setting app.today is a date of the form YYYY-MM-DD." }, "ERR-LC-INTERNAL", "ERR-RX-INTERNAL"],
  [constraint("23514", "finite_timestamptz_check"), "ERR-LC-INTERNAL", "ERR-RX-INTERNAL"],
  [constraint("23514", "finite_date_check"), "ERR-LC-INTERNAL", "ERR-RX-INTERNAL"],
  [constraint("23514", "passports_passport_identifier_check"), "ERR-LC-INTERNAL", "ERR-RX-INTERNAL"],
  [constraint("23505", "passports_passport_identifier_key"), "ERR-LC-IDENTIFIER-EXISTS", "ERR-RX-INTERNAL"],
  [constraint("23505", "battery_models_manufacturer_part_key"), "ERR-LC-IDENTIFIER-EXISTS", "ERR-RX-INTERNAL"],
  [constraint("23505", "access_map_versions_model_version_key"), "ERR-LC-ACCESS-MAP-VERSION-EXISTS", "ERR-RX-INTERNAL"],
  [constraint("23505", "issuer_contracts_open_key"), "ERR-LC-CONTRACT-EXISTS", "ERR-RX-INTERNAL"],
  [constraint("23505", "passport_access_records_open_key"), "ERR-LC-RECORD-EXISTS", "ERR-RX-INTERNAL"],
  [constraint("23505", "passport_lineage_links_predecessor_key"), "ERR-LC-IDENTIFIER-RULE", "ERR-RX-INTERNAL"],
  [{ code: "42501", message: "new row violates row-level security policy" }, "ERR-LC-NOT-DATA-PROVIDER", "ERR-RX-INTERNAL"],
  [{ code: "42501", message: "permission denied for table passports" }, "ERR-LC-NOT-DATA-PROVIDER", "ERR-RX-INTERNAL"],
  [constraint("23514", "passports_lifecycle_status_check"), "ERR-LC-INTERNAL", "ERR-RX-INTERNAL"],
  [constraint("23505", "passports_pkey"), "ERR-LC-INTERNAL", "ERR-RX-INTERNAL"],
  [{ code: "22P02", message: "invalid input syntax for type uuid" }, "ERR-LC-INTERNAL", "ERR-RX-INTERNAL"],
  [raised("ERR-DB-ROLE-PRIVILEGE"), "ERR-LC-INTERNAL", "ERR-RX-INTERNAL"],
  [{ code: "40001", message: "could not serialize access" }, "ERR-LC-INTERNAL", "ERR-RX-INTERNAL"],
];

test("SwR-BACKEND-206 (Lifecycle notification failures answered with envelope and result object): the refusals of section 9.5", async (t) => {
  const validator = createSchemaValidator();
  await t.test("REFUSALS holds the 45 refusal ids of section 9.5", () => {
    assert.deepStrictEqual(Object.keys(REFUSALS).sort(), Object.keys(STATUSES).sort());
  });
  for (const [id, status] of Object.entries(STATUSES)) {
    await t.test(`${id} has the status ${status}, a text of four sentences and a body that validates against ErrorResponse.schema.json`, () => {
      assert.equal(REFUSALS[id].status, status);
      const sentences = REFUSALS[id].text.split(/(?<=\.) (?=[A-Z])/);
      assert.equal(sentences.length, 4, REFUSALS[id].text);
      for (const sentence of sentences) assert.ok(sentence.endsWith("."), sentence);
      const refusal = new Refusal(id);
      assert.equal(refusal.status, status);
      const body = refusalBody(refusal);
      assert.deepStrictEqual(body, { success: false, error: { message: REFUSALS[id].text, code: id }, messages: [{ messageType: "Error", text: REFUSALS[id].text }] });
      const outcome = validator.validateErrorResponse(body);
      assert.equal(outcome.valid, true, JSON.stringify(outcome.errors));
    });
  }
  await t.test("a validation refusal adds one entry to messages per further message, and the body validates", () => {
    const body = refusalBody(new Refusal("ERR-LC-BODY-INVALID", { messages: ["/batteryIdentifier must NOT have fewer than 1 characters", "/ must have required property 'operation'"] }));
    assert.equal(body.messages.length, 3);
    assert.deepStrictEqual(body.messages[1], { messageType: "Error", text: "/batteryIdentifier must NOT have fewer than 1 characters" });
    assert.equal(validator.validateErrorResponse(body).valid, true);
  });
  await t.test("a refusal of an unknown id throws", () => {
    assert.throws(() => new Refusal("ERR-LC-UNKNOWN"), TypeError);
  });
});

test("SwR-BACKEND-148 (Notification answered 200 when accepted, 4xx or 5xx otherwise): the database error mapping of section 9.5", async (t) => {
  for (const [error, operatorRefusal, receivingRefusal] of MAPPING) {
    const label = error.constraint === undefined ? `${error.code} ${error.message.split(":")[0]}` : `${error.code} on ${error.constraint}`;
    await t.test(`${label} gives ${operatorRefusal} on an operator endpoint and ${receivingRefusal} on a receiving endpoint`, () => {
      assert.equal(refusalIdOfDatabaseError(error), operatorRefusal);
      assert.equal(refusalIdOfDatabaseError(error, { receiving: true }), receivingRefusal);
    });
  }
  await t.test("an error without a SQLSTATE gives ERR-LC-INTERNAL and ERR-RX-INTERNAL", () => {
    assert.equal(refusalIdOfDatabaseError(new Error("connection lost")), "ERR-LC-INTERNAL");
    assert.equal(refusalIdOfDatabaseError(new Error("connection lost"), { receiving: true }), "ERR-RX-INTERNAL");
  });
});
