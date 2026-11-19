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

// Tests the operator token of server/src/access/operatorToken.mjs.
//
// Requirements of the registry that this file verifies:
//   SwR-ACCESS-088 (Passport dataset writes only by the responsible or authorised operator)
//   SwR-DATASET-119 (Changes applied only for the responsible or an authorised operator)
// Decision D41 (Authentication without an identity provider), section 9.2.3 of the specification.
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { test } from "node:test";

import { signOperatorToken, verifyOperatorToken } from "../src/access/operatorToken.mjs";

const SECRET = "operator-token-secret-0123456789abcdef";
const OWN_BPNL = "BPNL00000000TCK1";
const NOW = new Date("2026-06-15T10:00:00Z");
const NOW_SECONDS = Math.floor(NOW.getTime() / 1000);

// Signs any header and claims with the secret, so that a test builds tokens that the signer refuses.
function rawToken(header, claims, secret = SECRET) {
  const encode = (value) => Buffer.from(typeof value === "string" ? value : JSON.stringify(value)).toString("base64url");
  const input = `${encode(header)}.${encode(claims)}`;
  return `${input}.${createHmac("sha256", secret).update(input).digest("base64url")}`;
}
const HEADER = '{"alg":"HS256","typ":"JWT"}';
const claims = (overrides = {}) => ({ sub: "lifecycle-operator", bpnl: OWN_BPNL, iat: NOW_SECONDS, exp: NOW_SECONDS + 600, ...overrides });
const verify = (token) => verifyOperatorToken(token, { secret: SECRET, now: NOW, ownBpnl: OWN_BPNL });

test("SwR-ACCESS-088 (Passport dataset writes only by the responsible or authorised operator): the operator token of decision D41", async (t) => {
  await t.test("a signed token verifies and gives its claims", () => {
    const token = signOperatorToken({ sub: "lifecycle-operator", bpnl: OWN_BPNL, expiresInSeconds: 3600 }, { secret: SECRET, now: NOW });
    assert.equal(token.split(".").length, 3);
    assert.deepStrictEqual(verify(token), { sub: "lifecycle-operator", bpnl: OWN_BPNL, iat: NOW_SECONDS, exp: NOW_SECONDS + 3600 });
  });
  await t.test("a token of the same claims built by the test helper verifies", () => {
    assert.notEqual(verify(rawToken(HEADER, claims())), null);
  });
  await t.test("a changed signature is refused", () => {
    const token = signOperatorToken({ sub: "lifecycle-operator", bpnl: OWN_BPNL, expiresInSeconds: 600 }, { secret: SECRET, now: NOW });
    const [header, body, signature] = token.split(".");
    const changed = `${signature.slice(0, -2)}${signature.endsWith("AA") ? "BB" : "AA"}`;
    assert.equal(verify(`${header}.${body}.${changed}`), null);
    assert.equal(verify(rawToken(HEADER, claims(), "another-secret-0123456789abcdefghij")), null);
  });
  await t.test("an expired token is refused", () => {
    assert.equal(verify(rawToken(HEADER, claims({ iat: NOW_SECONDS - 700, exp: NOW_SECONDS - 100 }))), null);
    assert.equal(verify(rawToken(HEADER, claims({ iat: NOW_SECONDS - 600, exp: NOW_SECONDS }))), null);
  });
  await t.test("a token without exp is refused", () => {
    const { exp, ...withoutExp } = claims();
    assert.ok(exp);
    assert.equal(verify(rawToken(HEADER, withoutExp)), null);
  });
  await t.test("a token whose lifetime is above 3600 seconds is refused", () => {
    assert.equal(verify(rawToken(HEADER, claims({ exp: NOW_SECONDS + 3601 }))), null);
    assert.throws(() => signOperatorToken({ sub: "lifecycle-operator", bpnl: OWN_BPNL, expiresInSeconds: 3601 }, { secret: SECRET, now: NOW }), TypeError);
  });
  await t.test("a token with another alg is refused", () => {
    assert.equal(verify(rawToken('{"alg":"HS512","typ":"JWT"}', claims())), null);
    assert.equal(verify(rawToken('{"alg":"none","typ":"JWT"}', claims())), null);
    assert.equal(verify(rawToken('{"typ":"JWT","alg":"HS256"}', claims())), null);
  });
  await t.test("a token of another Business Partner Number is refused", () => {
    assert.equal(verify(rawToken(HEADER, claims({ bpnl: "BPNL00000000TCK2" }))), null);
  });
  await t.test("a sub outside its pattern is refused", () => {
    for (const sub of ["", "a person name", "x".repeat(101), "operator/1"]) assert.equal(verify(rawToken(HEADER, claims({ sub }))), null, sub);
  });
  await t.test("a token of two parts, a token that is no text and a token with claims that are no JSON are refused", () => {
    assert.equal(verify("a.b"), null);
    assert.equal(verify(undefined), null);
    assert.equal(verify(rawToken(HEADER, "not json")), null);
  });
});
