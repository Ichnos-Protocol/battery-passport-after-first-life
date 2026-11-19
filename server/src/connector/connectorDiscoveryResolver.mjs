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
// decision D11 (The receiver resolution behind a port) and decision D75 (The receiver resolution through
// the own connector). Sections 9.2.5 and 10.7 of docs/architecture/implementation_plan.md (the receiver
// resolver contract).
// The receiver resolver of the connector binding (EL-CXCLIENT, the connector client): the own connector
// performs both steps with its own credential. The request and the answer follow tractusx-edc at the tag
// 0.13.0, docs/usage/management-api-walkthrough/04_catalog.md lines 29 to 44 (the request) and lines 64
// to 81 (an array of { counterPartyId, counterPartyAddress, protocol }); a counterparty that the connector
// does not resolve answers 400 (recorded on 2026-11-19, tck/README.md, section "The recorded answers of
// phase P7").

const EDC = "https://w3id.org/edc/v0.0.1/ns/";
const PROTOCOL = "dataspace-protocol-http:2025-1";

// The value of an answer field in the prefixed form edc:<term>, the plain term or the full address.
const fieldOf = (entry, term) => entry[`edc:${term}`] ?? entry[term] ?? entry[`${EDC}${term}`] ?? null;

// Returns a receiver resolver whose method resolve(bpnl) resolves to { did, connectorUrl }, or to null
// when the own connector finds no connector of the Business Partner Number.
export function createConnectorDiscoveryResolver({ config, fetch }) {
  const url = `${config.edcManagementUrl}/v3/connectordiscovery/connectors`;

  async function resolve(bpnl) {
    const response = await fetch(url, {
      method: "POST",
      headers: { [config.edcManagementApiKeyHeader]: config.edcManagementApiKey, "content-type": "application/json" },
      body: JSON.stringify({
        "@context": { tx: "https://w3id.org/tractusx/v0.0.1/ns/", edc: EDC },
        "@type": "tx:ConnectorServiceDiscoveryRequest",
        "edc:counterPartyId": bpnl,
      }),
    });
    // The own connector answers 400 when the BPN-DID Resolution Service names no DID of the Business
    // Partner Number or when the DID document names no connector.
    if (response.status === 400 || response.status === 404) return null;
    if (response.status !== 200) throw new Error(`the connector discovery answered ${response.status}`);
    const entries = [].concat(await response.json());
    const entry = entries.find((item) => fieldOf(item, "protocol") === PROTOCOL) ?? entries[0];
    const connectorUrl = entry === undefined ? null : fieldOf(entry, "counterPartyAddress");
    if (typeof connectorUrl !== "string" || connectorUrl.length === 0) return null;
    return { did: fieldOf(entry, "counterPartyId") ?? bpnl, connectorUrl };
  }

  return Object.freeze({ resolve });
}
