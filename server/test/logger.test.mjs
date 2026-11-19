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

// Tests the logger of server/src/logger.mjs.
//
// Contracts that this file verifies (no requirement of the registry names the logger, section 17.2 of
// the implementation specification):
//   section 9.2.1 of docs/architecture/implementation_plan.md (the logger and its fixed list of field
//   names, accepted by the owner on 2026-11-17)
//   decision D24 (Two database roles and row-level security): no credential in a log
import assert from "node:assert/strict";
import { test } from "node:test";

import { LOG_LEVELS, REDACTED_FIELDS, REDACTION_TEXT, createLogger } from "../src/logger.mjs";

const TIME = "2031-05-04T08:13:33.007Z";
const clock = { now: () => new Date(TIME) };

function recordingStream() {
  const texts = [];
  return { texts, write: (text) => texts.push(text) };
}

function parse(text) {
  assert.ok(text.endsWith("\n"), "the text ends with one newline character");
  assert.equal(text.indexOf("\n"), text.length - 1, "the text holds no other newline character");
  return JSON.parse(text.slice(0, -1));
}

// A logger at the level debug with a recording stream and the two further names of the case.
function debugLogger() {
  const stream = recordingStream();
  return { stream, logger: createLogger({ level: "debug", stream, clock, redactedFieldNames: ["x-dp-key", "x-mgmt-key"] }) };
}

// The written forms of a compared name: the name as the list holds it, the name in upper case, and one
// form with a separator between the parts of the name.
const SEPARATED_FORMS = {
  authorization: "Authori-zation",
  cookie: "COO_KIE",
  setcookie: "Set-Cookie",
  headers: "Hea-ders",
  rawheaders: "raw_headers",
  token: "To-ken",
  accesstoken: "access_token",
  bearertoken: "Bearer-Token",
  operatortoken: "operator_token",
  apikey: "api_key",
  xapikey: "X-Api-Key",
  dataplanekey: "data-plane-key",
  edcmanagementapikey: "EDC_MANAGEMENT_API_KEY",
  key: "K-ey",
  secret: "se_cret",
  operatortokensecret: "OPERATOR_TOKEN_SECRET",
  password: "pass-word",
  approlepassword: "APP_ROLE_PASSWORD",
  testapprolepassword: "TEST_APP_ROLE_PASSWORD",
  postgrespassword: "POSTGRES_PASSWORD",
  connectionstring: "connection-string",
  databaseurl: "DATABASE_URL",
  databasemigrationurl: "DATABASE_MIGRATION_URL",
  testdatabaseurl: "TEST_DATABASE_URL",
  payload: "pay_load",
  body: "Bo-dy",
  content: "con_tent",
  message: "mes-sage",
  messages: "MES_SAGES",
  notification: "notifi-cation",
  productcondition: "product_condition",
  map: "M-ap",
  entries: "en_tries",
  "x-dp-key": "X_DP_KEY",
  "x-mgmt-key": "X-Mgmt-Key",
};

test("section 9.2.1: the line of the logger", async (t) => {
  await t.test("each call writes one text with one newline character, which parses into one object", () => {
    const { stream, logger } = debugLogger();
    logger.info("first", {});
    logger.error("second");
    assert.equal(stream.texts.length, 2);
    for (const text of stream.texts) parse(text);
  });
  await t.test("the first six keys are time, level, message, traceId, route and actingBpnl, and time is the time of the clock", () => {
    const { stream, logger } = debugLogger();
    logger.warn("a message", { outcome: "sent", passportIdentifier: "TCK-PASSPORT-0001" });
    const line = parse(stream.texts[0]);
    assert.deepStrictEqual(Object.keys(line), ["time", "level", "message", "traceId", "route", "actingBpnl", "outcome", "passportIdentifier"]);
    assert.equal(line.time, TIME);
    assert.equal(line.level, "warn");
    assert.equal(line.message, "a message");
    assert.equal(line.traceId, null);
    assert.equal(line.route, null);
    assert.equal(line.actingBpnl, null);
  });
  await t.test("the three fields of a call are written in their places, and the further fields follow in their order", () => {
    const { stream, logger } = debugLogger();
    logger.info("step", { zeta: 1, route: "POST /api/passports", alpha: 2, traceId: "trace-1", actingBpnl: "BPNL00000000TCK1" });
    const line = parse(stream.texts[0]);
    assert.deepStrictEqual(Object.keys(line), ["time", "level", "message", "traceId", "route", "actingBpnl", "zeta", "alpha"]);
    assert.equal(line.traceId, "trace-1");
    assert.equal(line.route, "POST /api/passports");
    assert.equal(line.actingBpnl, "BPNL00000000TCK1");
  });
  await t.test("a call field named time, level or message does not replace the field of the logger", () => {
    const { stream, logger } = debugLogger();
    logger.debug("kept", { time: "1999-01-01T00:00:00.000Z", level: "error", message: "replaced" });
    const line = parse(stream.texts[0]);
    assert.equal(line.time, TIME);
    assert.equal(line.level, "debug");
    assert.equal(line.message, "kept");
    assert.deepStrictEqual(Object.keys(line), ["time", "level", "message", "traceId", "route", "actingBpnl"]);
  });
  await t.test("the parameter message is converted with String", () => {
    const { stream, logger } = debugLogger();
    logger.info(42);
    assert.equal(parse(stream.texts[0]).message, "42");
  });
  await t.test("an Error is written as the object with name and errorMessage", () => {
    const { stream, logger } = debugLogger();
    logger.error("failed", { error: new RangeError("out of range") });
    assert.deepStrictEqual(parse(stream.texts[0]).error, { name: "RangeError", errorMessage: "out of range" });
  });
  await t.test("a circular object gives the text [circular] and no exception", () => {
    const { stream, logger } = debugLogger();
    const node = { name: "node" };
    node.self = node;
    logger.info("cycle", { node });
    assert.deepStrictEqual(parse(stream.texts[0]).node, { name: "node", self: "[circular]" });
  });
});

test("section 9.2.1: the fixed list of field names", async (t) => {
  assert.equal(REDACTED_FIELDS.length, 33);
  assert.equal(REDACTION_TEXT, "[redacted]");
  for (const name of [...REDACTED_FIELDS, "x-dp-key", "x-mgmt-key"]) {
    const forms = [name, name.toUpperCase(), SEPARATED_FORMS[name]];
    for (const form of forms) {
      await t.test(`a field named ${form} is written as [redacted] at the first level, at the third level and inside a list`, () => {
        const { stream, logger } = debugLogger();
        logger.info("redaction", {
          [form]: "value-1",
          outer: { middle: { [form]: { nested: "value-2" } } },
          list: [{ [form]: ["value-3"] }],
        });
        const line = parse(stream.texts[0]);
        // Section 9.2.1 states that a call field named message is not written at the first level, so
        // the field message of the line keeps the text of the logger there.
        if (form === "message") assert.equal(line.message, "redaction");
        else assert.equal(line[form], "[redacted]");
        assert.equal(line.outer.middle[form], "[redacted]");
        assert.equal(line.list[0][form], "[redacted]");
        assert.equal(stream.texts[0].includes("value-"), false);
      });
    }
  }
  const secrets = [
    ["token", (secret) => ({ token: secret })],
    ["dataPlaneKey", (secret) => ({ dataPlaneKey: secret })],
    ["authorization", (secret) => ({ authorization: `Bearer ${secret}` })],
    ["payload", (secret) => ({ payload: { SerialNumber: secret } })],
    ["headers", (secret) => ({ headers: { "x-api-key": secret, "content-type": "application/json" } })],
  ];
  for (const [index, [name, fields]] of secrets.entries()) {
    await t.test(`a secret passed as the value of ${name} does not occur in the raw text of the line`, () => {
      const { stream, logger } = debugLogger();
      const secret = `s3cr3t-${index + 1}`;
      logger.info("secret", fields(secret));
      assert.equal(stream.texts[0].includes(secret), false);
    });
  }
  await t.test("a field whose name is not in the list, passportIdentifier, keeps its value", () => {
    const { stream, logger } = debugLogger();
    logger.info("kept", { passportIdentifier: "TCK-PASSPORT-0001" });
    assert.equal(parse(stream.texts[0]).passportIdentifier, "TCK-PASSPORT-0001");
  });
  await t.test("the argument fields of a call is deeply equal before and after the call", () => {
    const { logger } = debugLogger();
    const fields = { token: "s3cr3t-x", nested: { password: "s3cr3t-y", list: [{ key: "s3cr3t-z" }] }, error: new Error("e") };
    const before = structuredClone(fields);
    logger.info("unchanged", fields);
    assert.deepStrictEqual(fields, before);
  });
});

test("section 9.2.1: the levels and the parameters of createLogger", async (t) => {
  const expected = { error: ["error"], warn: ["error", "warn"], info: ["error", "warn", "info"], debug: ["error", "warn", "info", "debug"] };
  for (const level of LOG_LEVELS) {
    await t.test(`at the level ${level} the logger writes ${expected[level].length} lines of the four calls`, () => {
      const stream = recordingStream();
      const logger = createLogger({ level, stream, clock });
      for (const method of LOG_LEVELS) logger[method]("line", {});
      assert.deepStrictEqual(
        stream.texts.map((text) => parse(text).level),
        expected[level],
      );
    });
  }
  await t.test("createLogger throws a TypeError that names the parameter level for the level trace", () => {
    assert.throws(() => createLogger({ level: "trace", stream: recordingStream(), clock }), (error) => error instanceof TypeError && error.message.includes("level"));
  });
  await t.test("createLogger throws a TypeError that names the parameter stream for a stream without write", () => {
    assert.throws(() => createLogger({ level: "info", stream: {}, clock }), (error) => error instanceof TypeError && error.message.includes("stream"));
  });
  await t.test("createLogger throws a TypeError that names the parameter clock for a clock without now", () => {
    assert.throws(() => createLogger({ level: "info", stream: recordingStream(), clock: {} }), (error) => error instanceof TypeError && error.message.includes("clock"));
  });
  await t.test("LOG_LEVELS equals the four levels, and REDACTED_FIELDS and LOG_LEVELS are frozen", () => {
    assert.deepStrictEqual([...LOG_LEVELS], ["error", "warn", "info", "debug"]);
    assert.equal(Object.isFrozen(LOG_LEVELS), true);
    assert.equal(Object.isFrozen(REDACTED_FIELDS), true);
  });
});
