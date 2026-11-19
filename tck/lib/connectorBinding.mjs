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
// binding), with decision D43 (One test code and two bindings), decision D75 (The receiver resolution
// through the own connector) and decision D76 (The wallet stub as the local identity). Sections 9.2.9 and
// 10.7 of docs/architecture/implementation_plan.md.
// The connector binding of the conformance test kit waits for the owner: the first run of the second
// part of phase P7 on 2026-11-19 showed that the wallet stub 0.1.0 does not serve the identity of the
// connectors of Tractus-X EDC 0.13.0 as tck/docker-compose.yml configures it (tck/README.md, section "The
// first run of phase P7"). Decision D76 makes the implementer report the failure to the owner before the
// contingency of section 10.7 applies, so the binding refuses to start and runs no test.

// The cause of the stop, in the words of the record of the first run in tck/README.md.
export const CONNECTOR_BINDING_CAUSE =
  "the first run of phase P7 stopped under decision D76: the wallet stub 0.1.0 resolves the DID of another stub only over https, " +
  "so a connector refuses the catalog request of a connector of another stub (answer 401), and the stub serves no DataService entry " +
  "in a DID document (Tractus-X EDC 0.13.0 calls GET /api/v2.0.0/companyIdentities, answer 404), so the connector discovery of " +
  "decision D75 finds no connector; the owner decides (tck/README.md)";

// Fails with the cause of the stop, so that TCK_BINDING=connector stops at startBinding() and runs no test.
export async function startConnectorBinding() {
  throw new Error(`connector binding not available: ${CONNECTOR_BINDING_CAUSE}`);
}
