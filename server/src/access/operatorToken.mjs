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

// Requirements: SwR-ACCESS-088 (Passport dataset writes only by the responsible or authorised
// operator) and SwR-DATASET-119 (Changes applied only for the responsible or an authorised operator),
// with decision D41 (Authentication without an identity provider) and decision D72 (The clock tolerance
// of an operator token) [waits for the owner]. Section 9.2.3 of
// docs/architecture/implementation_plan.md.
// The operator token of a deployment (EL-ACCESS, the access control): a JSON Web Token with the HMAC
// signature with SHA-256 (HS256), signed and verified with node:crypto.
import { createHmac, timingSafeEqual } from "node:crypto";

import { BPNL_PATTERN } from "../identifiers.mjs";

const HEADER_TEXT = '{"alg":"HS256","typ":"JWT"}';
const SUBJECT_PATTERN = /^[A-Za-z0-9._-]{1,100}$/;
export const MAXIMUM_LIFETIME_SECONDS = 3600;
// Decision D72 (The clock tolerance of an operator token) [waits for the owner]: a token whose iat lies
// more than 60 seconds after the current time is refused, so that a token is valid for 3600 seconds or
// less from the moment of its check (D41).
export const CLOCK_TOLERANCE_SECONDS = 60;

function base64url(text) {
  return Buffer.from(text, "utf8").toString("base64url");
}

function signature(signingInput, secret) {
  return createHmac("sha256", secret).update(signingInput).digest();
}

function seconds(now) {
  return Math.floor(now.getTime() / 1000);
}

// Returns the compact token of an operator: the claim sub names a system or a role of the operator
// and never a person, the claim bpnl names the company of the deployment, and the token is valid for
// expiresInSeconds seconds, 3600 seconds or less.
export function signOperatorToken({ sub, bpnl, expiresInSeconds }, { secret, now }) {
  if (typeof secret !== "string" || secret.length === 0) throw new TypeError("signOperatorToken needs the secret of the deployment");
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) throw new TypeError("signOperatorToken needs the current time as a Date");
  if (typeof sub !== "string" || !SUBJECT_PATTERN.test(sub)) throw new TypeError("signOperatorToken needs a sub of the pattern ^[A-Za-z0-9._-]{1,100}$");
  if (typeof bpnl !== "string" || !BPNL_PATTERN.test(bpnl)) throw new TypeError("signOperatorToken needs a Business Partner Number of a legal entity");
  if (!Number.isInteger(expiresInSeconds) || expiresInSeconds < 1 || expiresInSeconds > MAXIMUM_LIFETIME_SECONDS) {
    throw new TypeError("signOperatorToken needs a lifetime of 1 to 3600 seconds");
  }
  const iat = seconds(now);
  const signingInput = `${base64url(HEADER_TEXT)}.${base64url(JSON.stringify({ sub, bpnl, iat, exp: iat + expiresInSeconds }))}`;
  return `${signingInput}.${signature(signingInput, secret).toString("base64url")}`;
}

function decodePart(part) {
  if (!/^[A-Za-z0-9_-]*$/.test(part)) return undefined;
  return Buffer.from(part, "base64url").toString("utf8");
}

// Returns the claims { sub, bpnl, iat, exp } of a token that passes every check of section 9.2.3,
// and null for every other token. The function never throws for a malformed token.
export function verifyOperatorToken(token, { secret, now, ownBpnl }) {
  if (typeof token !== "string" || typeof secret !== "string" || secret.length === 0 || !(now instanceof Date)) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [headerPart, claimsPart, signaturePart] = parts;
  if (decodePart(headerPart) !== HEADER_TEXT) return null;
  if (!/^[A-Za-z0-9_-]+$/.test(signaturePart)) return null;
  const expected = signature(`${headerPart}.${claimsPart}`, secret);
  const presented = Buffer.from(signaturePart, "base64url");
  if (presented.length !== expected.length || !timingSafeEqual(presented, expected)) return null;
  const claimsText = decodePart(claimsPart);
  if (claimsText === undefined) return null;
  let claims;
  try {
    claims = JSON.parse(claimsText);
  } catch {
    return null;
  }
  if (claims === null || typeof claims !== "object" || Array.isArray(claims)) return null;
  const { sub, bpnl, iat, exp } = claims;
  if (typeof sub !== "string" || !SUBJECT_PATTERN.test(sub)) return null;
  if (typeof bpnl !== "string" || bpnl !== ownBpnl) return null;
  if (!Number.isInteger(iat) || !Number.isInteger(exp)) return null;
  if (exp <= seconds(now)) return null;
  if (exp - iat > MAXIMUM_LIFETIME_SECONDS) return null;
  if (iat > seconds(now) + CLOCK_TOLERANCE_SECONDS) return null;
  return { sub, bpnl, iat, exp };
}
