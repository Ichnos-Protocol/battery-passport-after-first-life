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
// operator) and SwR-DATASET-119 (Changes applied only for the responsible or an authorised operator).
// Section 9.2.3 of docs/architecture/implementation_plan.md.
// The middleware that checks the capability of an endpoint (EL-ACCESS, the access control).
import { Refusal } from "../dataset/refusals.mjs";
import { CAPABILITIES } from "./capabilities.mjs";
import { capabilitiesOf } from "./policy.mjs";

// Returns the middleware of one capability. The call throws when the capability is not a member of
// CAPABILITIES, so a route with a misspelled capability fails at the load of its module. The
// middleware passes the refusal ERR-AC-CAPABILITY-MISSING (403) to the error handler when the
// subject of the request lacks the capability.
export function requireCapability(capability) {
  if (typeof capability !== "string" || !CAPABILITIES.includes(capability)) {
    throw new TypeError("requireCapability needs one capability of CAPABILITIES");
  }
  return function checkCapability(req, res, next) {
    if (capabilitiesOf(req.subject).includes(capability)) {
      next();
      return;
    }
    next(new Refusal("ERR-AC-CAPABILITY-MISSING"));
  };
}
