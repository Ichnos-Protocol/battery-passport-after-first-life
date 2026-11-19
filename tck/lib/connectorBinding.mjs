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

// Requirement: PrR-CXD-029 (Conformance tests run against the in-process binding and the connector
// binding), with decision D43 (One test code and two bindings) and decision D11 (The receiver resolution
// behind a port). Sections 9.2.9 and 10.7 of docs/architecture/implementation_plan.md.
// The connector binding of the conformance test kit is held by the contingency of section 10.7: the
// verification of phase P7 against Tractus-X EDC 0.13.0 found no local deployment that the specification
// states (tck/README.md, section "The verification of phase P7"). The binding therefore refuses to start,
// and the process requirement PrR-CXD-029 stays unverified for the connector binding until the owner
// decides.

// The cause of the contingency, in the words of the verification record of tck/README.md.
export const CONNECTOR_BINDING_CAUSE =
  "the BPN-DID Resolution Service of CX-0167 1.0.0 answers only a caller that presents a Verifiable Presentation " +
  "with a Membership Credential, which the receiver resolver of decision D11 does not hold, and Tractus-X EDC 0.13.0 " +
  "documents its identity only through an account of a managed wallet (DIV); the owner decides (tck/README.md)";

// Fails with the message of the contingency of section 10.7, so that TCK_BINDING=connector stops at
// startBinding() and runs no test.
export async function startConnectorBinding() {
  throw new Error(`connector binding not available: ${CONNECTOR_BINDING_CAUSE}`);
}
