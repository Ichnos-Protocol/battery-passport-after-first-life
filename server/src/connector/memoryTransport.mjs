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

// Requirements: SwR-CXCLIENT-059 (Notifications built to CX-0151 and sent as JSON POST), SwR-BGWORK-010
// (Lifecycle notifications sent unchanged as JSON POST through the connector) and SwR-CXCLIENT-183
// (Sender's record of a receiver without an asset or a contract), with decision D41 (Authentication
// without an identity provider) and decision D43 (One test code and two bindings). Section 9.2.5 of
// docs/architecture/implementation_plan.md (the transport contract).
// The transport of the memory binding (EL-CXCLIENT, the connector client). The transport plays the
// connectors of the participants: it reads the offers of the receiver, checks the access policy for the
// consumer, calls the Express application of the receiver with the method, the path, the body and the
// content type unchanged, sets the data plane key of the receiver and the Business Partner Number of the
// consumer in the two headers of D41, and returns the status and the body of the receiver unchanged.
import { randomUUID } from "node:crypto";

import { NOTIFICATION_ASSET_ID, admits } from "./policyBuilder.mjs";

// Returns a transport for the application of the participant ownBpnl. The map participants holds, per
// connector address, { bpnl, app, dataPlaneKey, dataPlaneKeyHeader, partnerBpnHeader }; the map
// offerStores holds the offer store of each participant by its Business Partner Number. Each
// application is served on a port of the loopback interface the first time the transport calls it.
export function createMemoryTransport({ participants, offerStores, ownBpnl }) {
  const servers = new Map();

  async function baseUrlOf(participant) {
    if (!servers.has(participant)) {
      servers.set(
        participant,
        new Promise((resolve, reject) => {
          const server = participant.app.listen(0, "127.0.0.1", () => resolve({ server, url: `http://127.0.0.1:${server.address().port}` }));
          server.on("error", reject);
        }),
      );
    }
    return (await servers.get(participant)).url;
  }

  async function call(participant, method, path, body) {
    const headers = { [participant.dataPlaneKeyHeader]: participant.dataPlaneKey, [participant.partnerBpnHeader]: ownBpnl };
    if (body !== undefined) headers["content-type"] = "application/json";
    const response = await fetch(`${await baseUrlOf(participant)}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
    const text = await response.text();
    let parsed;
    try {
      parsed = text.length === 0 ? null : JSON.parse(text);
    } catch {
      parsed = text;
    }
    return { status: response.status, body: parsed };
  }

  async function send({ receiverBpnl, connectorUrl, operation, message }) {
    const participant = participants.get(connectorUrl);
    if (participant === undefined || participant.bpnl !== receiverBpnl) return { outcome: "transport_failed", httpStatus: null, body: null, cause: `no connector answers at ${connectorUrl}` };
    const asset = (await offerStores.get(receiverBpnl)?.list())?.find((offer) => offer.assetId === NOTIFICATION_ASSET_ID);
    if (asset === undefined) return { outcome: "no_asset", httpStatus: null, body: null, cause: "the receiver offers no lifecycle notification asset" };
    if (!admits(asset, ownBpnl)) return { outcome: "contract_refused", httpStatus: null, body: null, cause: "the access policy of the notification asset does not admit the sender" };
    try {
      const answer = await call(participant, "POST", `${asset.path}/${operation}`, message);
      return answer.status === 200
        ? { outcome: "sent", httpStatus: 200, body: answer.body, cause: null }
        : { outcome: "receiver_refused", httpStatus: answer.status, body: answer.body, cause: answer.body?.error?.code ?? `status ${answer.status}` };
    } catch (error) {
      return { outcome: "transport_failed", httpStatus: null, body: null, cause: error.message };
    }
  }

  async function pull({ providerBpnl, connectorUrl, semanticId, passportIdentifier }) {
    const participant = participants.get(connectorUrl);
    if (participant === undefined || participant.bpnl !== providerBpnl) return { outcome: "transport_failed", agreementId: null, body: null, cause: `no connector answers at ${connectorUrl}` };
    const offers = (await offerStores.get(providerBpnl)?.list()) ?? [];
    const matching = offers.filter((offer) => offer.semanticId === semanticId && offer.passportIdentifier === passportIdentifier);
    if (matching.length === 0) return { outcome: "no_asset", agreementId: null, body: null, cause: "the provider offers no asset of the semantic identifier and the passport identifier" };
    const offer = matching.find((item) => admits(item, ownBpnl));
    if (offer === undefined) return { outcome: "contract_refused", agreementId: null, body: null, cause: "the access policy of the offer does not admit the consumer" };
    try {
      const answer = await call(participant, "GET", offer.path, undefined);
      if (answer.status !== 200) return { outcome: "provider_refused", agreementId: null, body: answer.body, cause: answer.body?.error?.code ?? `status ${answer.status}` };
      return { outcome: "received", agreementId: `memory-agreement-${randomUUID()}`, body: answer.body, cause: null };
    } catch (error) {
      return { outcome: "transport_failed", agreementId: null, body: null, cause: error.message };
    }
  }

  // Closes the servers of the participants that the transport opened.
  async function close() {
    for (const pending of servers.values()) {
      const { server } = await pending;
      await new Promise((resolve) => {
        server.close(resolve);
        server.closeAllConnections();
      });
    }
    servers.clear();
  }

  return Object.freeze({ send, pull, close });
}
