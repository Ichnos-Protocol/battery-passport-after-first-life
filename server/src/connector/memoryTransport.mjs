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

import { FRAMEWORK_AGREEMENT, NOTIFICATION_ASSET_ID, USAGE_PURPOSE, admits } from "./policyBuilder.mjs";

// The usage policy of an offer admits the consumer when the policy holds the framework agreement and the
// usage purpose that the consumer has agreed to (decision D83, One meaning of no_asset and
// contract_refused): a connector refuses the negotiation of any other usage policy.
const usageAdmits = (offer) => offer.frameworkAgreement === FRAMEWORK_AGREEMENT && Array.isArray(offer.usagePurposes) && offer.usagePurposes.includes(USAGE_PURPOSE);

// The cause of an answer other than 200: the refusal id of the error body, or the status.
function causeOf(answer) {
  const code = answer.body?.error?.code;
  return typeof code === "string" ? code : `status ${answer.status}`;
}

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
    // D83: an asset that the access policy hides is an absent asset, and a usage policy that the sender
    // does not meet refuses the contract.
    const asset = (await offerStores.get(receiverBpnl)?.list())?.find((offer) => offer.assetId === NOTIFICATION_ASSET_ID && admits(offer, ownBpnl));
    if (asset === undefined) return { outcome: "no_asset", httpStatus: null, body: null, cause: "the receiver offers no lifecycle notification asset to the sender" };
    if (!usageAdmits(asset)) return { outcome: "contract_refused", httpStatus: null, body: null, cause: "the usage policy of the notification asset refuses the contract" };
    try {
      const answer = await call(participant, "POST", `${asset.path}/${operation}`, message);
      if (answer.status === 200) return { outcome: "sent", httpStatus: 200, body: answer.body, cause: null };
      // A status of the class 5xx is a failure of the receiver that the sender repeats (D49); every
      // other status is final.
      const outcome = answer.status >= 500 ? "transport_failed" : "receiver_refused";
      return { outcome, httpStatus: answer.status, body: answer.body, cause: causeOf(answer) };
    } catch (error) {
      return { outcome: "transport_failed", httpStatus: null, body: null, cause: error.message };
    }
  }

  async function pull({ providerBpnl, connectorUrl, semanticId, passportIdentifier }) {
    const participant = participants.get(connectorUrl);
    if (participant === undefined || participant.bpnl !== providerBpnl) return { outcome: "transport_failed", agreementId: null, body: null, cause: `no connector answers at ${connectorUrl}` };
    const offers = (await offerStores.get(providerBpnl)?.list()) ?? [];
    const offer = offers.find((item) => item.semanticId === semanticId && item.passportIdentifier === passportIdentifier && admits(item, ownBpnl));
    if (offer === undefined) return { outcome: "no_asset", agreementId: null, body: null, cause: "the provider offers no asset of the semantic identifier and the passport identifier to the consumer" };
    if (!usageAdmits(offer)) return { outcome: "contract_refused", agreementId: null, body: null, cause: "the usage policy of the offer refuses the contract" };
    try {
      const answer = await call(participant, "GET", offer.path, undefined);
      if (answer.status !== 200) {
        return { outcome: answer.status >= 500 ? "transport_failed" : "provider_refused", agreementId: null, body: answer.body, cause: causeOf(answer) };
      }
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
