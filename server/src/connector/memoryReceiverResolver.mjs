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

// Requirements: SwR-CXCLIENT-183 (Sender's record of a receiver without an asset or a contract) and
// SwR-BGWORK-010 (Lifecycle notifications sent unchanged as JSON POST through the connector), with
// decision D11 (The receiver resolution behind a port). Sections 9.2.5 and 10.7 of
// docs/architecture/implementation_plan.md (the receiver resolver contract).
// The receiver resolver of the memory binding (EL-CXCLIENT, the connector client): the two steps of
// section 4.3 item 5 of the proposal on two maps.

// Returns a receiver resolver. The first step reads the decentralised identifier (DID) of a Business
// Partner Number from didByBpnl, and the second step reads the address of the connector of the DID
// from connectorUrlByDid. The method resolve resolves to null when a step finds nothing.
export function createMemoryReceiverResolver({ didByBpnl, connectorUrlByDid }) {
  if (!(didByBpnl instanceof Map) || !(connectorUrlByDid instanceof Map)) throw new TypeError("createMemoryReceiverResolver needs two maps");
  return Object.freeze({
    async resolve(bpnl) {
      const did = didByBpnl.get(bpnl);
      if (did === undefined) return null;
      const connectorUrl = connectorUrlByDid.get(did);
      if (connectorUrl === undefined) return null;
      return { did, connectorUrl };
    },
  });
}
