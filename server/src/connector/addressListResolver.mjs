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
// decision D11 (The receiver resolution behind a port) and decision D81 (A fixed address list in the
// local deployment only). Section 9.2.5 of docs/architecture/implementation_plan.md (the receiver
// resolver contract).
// The receiver resolver of the local test deployment (EL-CXCLIENT, the connector client): the configured
// map config.receiverAddressList names, for each Business Partner Number, the Dataspace Protocol address
// and the decentralised identifier of its connector. loadConfig admits only local hosts in the map, and
// a production deployment uses the connector discovery of decision D75.

// Returns a receiver resolver whose method resolve(bpnl) resolves to { did, connectorUrl } of the entry
// of the Business Partner Number, or to null for a Business Partner Number outside the map.
export function createAddressListResolver({ addressList }) {
  if (addressList === null || typeof addressList !== "object") throw new TypeError("the address list resolver needs an address list");
  return Object.freeze({
    async resolve(bpnl) {
      const entry = Object.hasOwn(addressList, bpnl) ? addressList[bpnl] : undefined;
      return entry === undefined ? null : { did: entry.did, connectorUrl: entry.connectorUrl };
    },
  });
}
