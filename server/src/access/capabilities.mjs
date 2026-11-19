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
// The one catalogue of the capabilities of the reference server (EL-ACCESS, the access control).

export const CAPABILITIES = Object.freeze([
  "passport.create",
  "passport.issue",
  "passport.write",
  "lifecycle.report",
  "access-map.write",
  "notification.read",
  "battery-information.share",
  "notification.receive",
  "submodel.read",
]);
