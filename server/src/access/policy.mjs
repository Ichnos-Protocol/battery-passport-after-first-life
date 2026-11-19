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
// The one policy that grants the capabilities of a subject (EL-ACCESS, the access control).
import { CAPABILITIES } from "./capabilities.mjs";

const OPERATOR_CAPABILITIES = Object.freeze([...CAPABILITIES.slice(0, 7), "submodel.read"]);
const PARTNER_CAPABILITIES = Object.freeze(["notification.receive", "submodel.read"]);

// Returns the capabilities of a subject: the first seven capabilities and submodel.read for an
// operator subject, notification.receive and submodel.read for a partner subject, and an empty list
// for every other subject (deny by default).
export function capabilitiesOf(subject) {
  if (subject === null || typeof subject !== "object") return [];
  if (subject.kind === "operator") return [...OPERATOR_CAPABILITIES];
  if (subject.kind === "partner") return [...PARTNER_CAPABILITIES];
  return [];
}
