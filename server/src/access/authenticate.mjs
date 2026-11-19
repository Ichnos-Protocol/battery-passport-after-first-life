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
// with decision D41 (Authentication without an identity provider). Section 9.2.3 of
// docs/architecture/implementation_plan.md.
// The authentication of a request (EL-ACCESS, the access control): a partner request presents the
// key of the provider data plane, and an operator request presents an operator token.
import { createHash, timingSafeEqual } from "node:crypto";

import { Refusal } from "../dataset/refusals.mjs";
import { BPNL_PATTERN } from "../identifiers.mjs";
import { verifyOperatorToken } from "./operatorToken.mjs";

const BEARER_PATTERN = /^Bearer ([^\s]+)$/;

function digest(text) {
  return createHash("sha256").update(text, "utf8").digest();
}

function headerValue(req, name) {
  const value = req.headers[name];
  return typeof value === "string" ? value : undefined;
}

// Returns the middleware that sets req.subject, or passes the refusal ERR-AC-UNAUTHENTICATED (401) to
// the error handler. The two header names of the configuration are in lower case (section 9.6).
export function authenticate({ config, clock }) {
  const keyDigest = digest(config.dataPlaneKey);
  return function authenticateRequest(req, res, next) {
    const presentedKey = req.headers[config.dataPlaneKeyHeader];
    if (presentedKey !== undefined) {
      const partnerBpnl = headerValue(req, config.partnerBpnHeader);
      const keyMatches = typeof presentedKey === "string" && timingSafeEqual(digest(presentedKey), keyDigest);
      if (!keyMatches || partnerBpnl === undefined || !BPNL_PATTERN.test(partnerBpnl)) {
        next(new Refusal("ERR-AC-UNAUTHENTICATED"));
        return;
      }
      req.subject = { kind: "partner", bpnl: partnerBpnl };
      next();
      return;
    }
    const bearer = BEARER_PATTERN.exec(headerValue(req, "authorization") ?? "");
    const claims = bearer ? verifyOperatorToken(bearer[1], { secret: config.operatorTokenSecret, now: clock.now(), ownBpnl: config.ownBpnl }) : null;
    if (claims === null) {
      next(new Refusal("ERR-AC-UNAUTHENTICATED"));
      return;
    }
    req.subject = { kind: "operator", bpnl: claims.bpnl };
    next();
  };
}
