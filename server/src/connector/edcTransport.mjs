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
// without an identity provider), decision D43 (One test code and two bindings) and decision D49 (The
// retry of a failed transport) [waits for the owner]. Section 9.2.5 of
// docs/architecture/implementation_plan.md (the transport contract).
// The transport of the connector binding (EL-CXCLIENT, the connector client): the own Tractus-X EDC
// 0.13.0 connector requests the catalog of the counterparty, negotiates the contract, starts an
// HttpData-PULL transfer and reads the endpoint data reference, and the transport then calls the data
// plane of the counterparty. The forms follow tractusx-edc at the tag 0.13.0,
// docs/usage/management-api-walkthrough/04_catalog.md line 99, 05_contractnegotiations.md lines 14 to 45,
// 06_transferprocesses.md line 33 and 07_edrs.md line 168; the answers were recorded on 2026-11-19
// (tck/README.md, section "The recorded answers of phase P7").
import { POLICY_CONTEXT, VOCABULARY_CONTEXT, managementRequest } from "./edcOfferStore.mjs";
import { NOTIFICATION_DCT_TYPE } from "./policyBuilder.mjs";

const PROTOCOL = "dataspace-protocol-http:2025-1";
const TAXONOMY = "https://w3id.org/catenax/taxonomy#";
const POLL_MILLISECONDS = 250;
const POLL_ATTEMPTS = 240;
const EDC = "https://w3id.org/edc/v0.0.1/ns/";
// The number of catalog entries of one catalog request; the default of the connector is 50.
const CATALOG_LIMIT = 5000;

// The value of a property of a catalog entry, whatever form of the term the answer uses: the term
// itself, a prefixed term or the full address; an object { "@id" } gives its identifier.
function propertyOf(entry, term) {
  const key = Object.keys(entry).find((name) => name === term || name.endsWith(`:${term}`) || name.endsWith(`/${term}`) || name.endsWith(`#${term}`));
  if (key === undefined) return null;
  const value = entry[key];
  return value !== null && typeof value === "object" && typeof value["@id"] === "string" ? value["@id"] : value;
}

const expandTaxonomy = (dctType) => (dctType.startsWith("cx-taxo:") ? `${TAXONOMY}${dctType.slice("cx-taxo:".length)}` : dctType);
const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

// A step of a transfer that ends with an outcome of the transport contract.
export class TransportStep extends Error {
  constructor(outcome, cause) {
    super(cause);
    this.outcome = outcome;
  }
}

// The transfer client of the own connector, which the transport uses and the connector binding of the
// conformance test kit shares: the catalog request, the negotiation, the transfer HttpData-PULL, the
// endpoint data reference and the call of the counterparty's data plane. The client keeps an endpoint
// data reference per connector address and asset for 60 seconds less than its validity, so that each
// further message of one asset needs one catalog request and no new negotiation; every call still
// requests the catalog first, so that a withdrawn asset is an absent asset.
export function createEdcTransferClient({ config, fetch }) {
  const management = { config, fetch };
  const references = new Map();

  // Resolves to the catalog entries { dataset, participantId } of the counterparty; with assetId, the
  // catalog request holds a filter on the asset identifier.
  async function catalog(connectorUrl, counterPartyId, assetId) {
    const querySpec = { "@type": "QuerySpec", offset: 0, limit: CATALOG_LIMIT };
    if (assetId !== undefined) querySpec.filterExpression = [{ operandLeft: `${EDC}id`, operator: "=", operandRight: assetId }];
    const answer = await managementRequest(management, "POST", "/v3/catalog/request", { "@context": [VOCABULARY_CONTEXT], "@type": "CatalogRequest", counterPartyAddress: connectorUrl, counterPartyId, protocol: PROTOCOL, querySpec }, [200, 400, 401, 403, 404, 500, 502, 503]);
    if (answer.status !== 200) throw new TransportStep("transport_failed", `the catalog request answered ${answer.status}`);
    // The identifier of the counterparty is the field participantId of the catalog; a negotiation names
    // it as the assigner of the offer.
    const participantId = answer.body?.participantId;
    return [].concat(answer.body?.dataset ?? []).map((dataset) => ({ dataset, participantId }));
  }

  async function poll(path, done) {
    for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt += 1) {
      const answer = await managementRequest(management, "GET", path, undefined, [200]);
      const result = done(answer.body);
      if (result !== undefined) return result;
      await sleep(POLL_MILLISECONDS);
    }
    throw new TransportStep("transport_failed", `no final state at ${path}`);
  }

  // Negotiates the first offer of the catalog entry and starts the transfer; resolves to the agreement
  // and the endpoint data reference { agreementId, endpoint, authorization }.
  async function open(connectorUrl, { dataset, participantId }) {
    const offer = [].concat(dataset.hasPolicy ?? [])[0];
    if (offer === undefined) throw new TransportStep("contract_refused", "the dataset holds no offer");
    const assetId = dataset["@id"] ?? propertyOf(dataset, "id");
    const key = `${connectorUrl} ${assetId}`;
    const cached = references.get(key);
    if (cached !== undefined && cached.validUntil > Date.now()) return cached.reference;
    const assigner = participantId ?? offer.assigner;
    const started = await managementRequest(management, "POST", "/v3/contractnegotiations", { "@context": POLICY_CONTEXT, "@type": "ContractRequest", counterPartyAddress: connectorUrl, protocol: PROTOCOL, policy: { ...offer, assigner, target: assetId } }, [200]);
    const agreementId = await poll(`/v3/contractnegotiations/${started.body["@id"]}`, (negotiation) => {
      if (negotiation.state === "FINALIZED") return negotiation.contractAgreementId;
      if (negotiation.state === "TERMINATED") throw new TransportStep("contract_refused", `the negotiation ended as TERMINATED${negotiation.errorDetail ? `: ${negotiation.errorDetail}` : ""}`);
      return undefined;
    });
    const transfer = await managementRequest(management, "POST", "/v3/transferprocesses", { "@context": [VOCABULARY_CONTEXT], "@type": "TransferRequest", counterPartyAddress: connectorUrl, protocol: PROTOCOL, contractId: agreementId, transferType: "HttpData-PULL" }, [200]);
    const transferId = transfer.body["@id"];
    await poll(`/v3/transferprocesses/${transferId}`, (process) => {
      if (process.state === "STARTED") return true;
      if (process.state === "TERMINATED") throw new TransportStep("transport_failed", "the transfer ended as TERMINATED");
      return undefined;
    });
    const address = await poll(`/v3/edrs/${transferId}/dataaddress`, (value) => (typeof value?.endpoint === "string" ? value : undefined));
    const reference = { agreementId, endpoint: address.endpoint, authorization: address.authorization };
    const seconds = Number(propertyOf(address, "expiresIn"));
    if (Number.isFinite(seconds) && seconds > 60) references.set(key, { reference, validUntil: Date.now() + (seconds - 60) * 1000 });
    return reference;
  }

  async function call(reference, method, suffix, body, headers = {}) {
    const sent = { ...headers, authorization: reference.authorization };
    if (body !== undefined) sent["content-type"] = "application/json";
    const response = await fetch(`${reference.endpoint}${suffix}`, { method, headers: sent, body: body === undefined ? undefined : JSON.stringify(body) });
    const text = await response.text();
    let parsed = null;
    try {
      parsed = text.length === 0 ? null : JSON.parse(text);
    } catch {
      parsed = text;
    }
    return { status: response.status, body: parsed };
  }

  return Object.freeze({ catalog, open, call });
}

// Returns a transport with the methods send and pull of the transport contract.
export function createEdcTransport({ config, fetch }) {
  const client = createEdcTransferClient({ config, fetch });
  const causeOf = (answer) => (typeof answer.body?.error?.code === "string" ? answer.body.error.code : `status ${answer.status}`);

  async function send({ receiverBpnl, connectorUrl, operation, message }) {
    try {
      const entry = (await client.catalog(connectorUrl, receiverBpnl)).find(({ dataset }) => propertyOf(dataset, "type") === expandTaxonomy(NOTIFICATION_DCT_TYPE));
      // D83: an access policy that does not admit the sender hides the asset from the catalog, so the
      // connector reports such a receiver as a receiver without an asset.
      if (entry === undefined) return { outcome: "no_asset", httpStatus: null, body: null, cause: "the receiver offers no lifecycle notification asset to the sender" };
      const reference = await client.open(connectorUrl, entry);
      const answer = await client.call(reference, "POST", `/${operation}`, message);
      if (answer.status === 200) return { outcome: "sent", httpStatus: 200, body: answer.body, cause: null };
      return { outcome: answer.status >= 500 ? "transport_failed" : "receiver_refused", httpStatus: answer.status, body: answer.body, cause: causeOf(answer) };
    } catch (error) {
      return { outcome: error instanceof TransportStep ? error.outcome : "transport_failed", httpStatus: null, body: null, cause: error.message };
    }
  }

  async function pull({ providerBpnl, connectorUrl, semanticId, passportIdentifier }) {
    try {
      const entry = (await client.catalog(connectorUrl, providerBpnl)).find(({ dataset }) => propertyOf(dataset, "semanticId") === semanticId && propertyOf(dataset, "passportIdentifier") === passportIdentifier);
      if (entry === undefined) return { outcome: "no_asset", agreementId: null, body: null, cause: "the provider offers no asset of the semantic identifier and the passport identifier to the consumer" };
      const reference = await client.open(connectorUrl, entry);
      const answer = await client.call(reference, "GET", "", undefined);
      if (answer.status !== 200) return { outcome: answer.status >= 500 ? "transport_failed" : "provider_refused", agreementId: null, body: answer.body, cause: causeOf(answer) };
      return { outcome: "received", agreementId: reference.agreementId, body: answer.body, cause: null };
    } catch (error) {
      return { outcome: error instanceof TransportStep ? error.outcome : "transport_failed", agreementId: null, body: null, cause: error.message };
    }
  }

  return Object.freeze({ send, pull, close: async () => {} });
}
