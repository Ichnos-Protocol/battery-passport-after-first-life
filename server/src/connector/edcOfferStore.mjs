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

// Requirements: SwR-CXCLIENT-110 (Recycling withdraws the passport dataset offers) and SwR-CXCLIENT-182
// (Lifecycle record offer restricted to purchaser, operators and authorities), with decision D41
// (Authentication without an identity provider) and decision D43 (One test code and two bindings).
// Section 9.2.5 of docs/architecture/implementation_plan.md (the offer contract).
// The offer store of the connector binding (EL-CXCLIENT, the connector client): each offer is one asset,
// one access policy, one usage policy and one contract definition on the management API of the own
// Tractus-X EDC 0.13.0 connector. The forms follow tractusx-edc at the tag 0.13.0,
// docs/usage/management-api-walkthrough/01_assets.md lines 60 to 111, 02_policies.md lines 97 to 105 and
// 205 to 262, and 03_contractdefinitions.md lines 8 to 30; the answers were recorded on 2026-11-19
// (tck/README.md, section "The recorded answers of phase P7").

const EDC = "https://w3id.org/edc/v0.0.1/ns/";
export const VOCABULARY_CONTEXT = Object.freeze({ "@vocab": EDC });
export const POLICY_CONTEXT = Object.freeze(["https://w3id.org/dspace/2025/1/odrl-profile.jsonld", "https://w3id.org/catenax/2025/9/policy/context.jsonld", VOCABULARY_CONTEXT]);
const ASSET_CONTEXT = Object.freeze({
  ...VOCABULARY_CONTEXT,
  "cx-taxo": "https://w3id.org/catenax/taxonomy#",
  "cx-common": "https://w3id.org/catenax/ontology/common#",
  dct: "http://purl.org/dc/terms/",
  "aas-semantics": "https://admin-shell.io/aas/3/0/HasSemantics/",
});
// The private property of an asset that holds the offer of the contract, so that list() returns the
// offer as publish() received it.
const OFFER_PROPERTY = "referenceServerOffer";
const OFFER_FIELDS = ["assetId", "dctType", "version", "semanticId", "passportIdentifier", "path", "allowedBpnls", "usagePurposes", "frameworkAgreement"];

// One request of the management API: resolves to { status, body } and throws for an answer outside
// acceptedStatuses, with the status and the first message of the answer.
export async function managementRequest({ config, fetch }, method, path, body, acceptedStatuses = [200, 204]) {
  const headers = { [config.edcManagementApiKeyHeader]: config.edcManagementApiKey };
  if (body !== undefined) headers["content-type"] = "application/json";
  const response = await fetch(`${config.edcManagementUrl}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  const text = await response.text();
  let parsed = null;
  try {
    parsed = text.length === 0 ? null : JSON.parse(text);
  } catch {
    parsed = text;
  }
  if (!acceptedStatuses.includes(response.status)) {
    const message = Array.isArray(parsed) && typeof parsed[0]?.message === "string" ? `: ${parsed[0].message}` : "";
    throw new Error(`the management API answered ${method} ${path} with ${response.status}${message}`);
  }
  return { status: response.status, body: parsed };
}

function assetOf(offer, config) {
  const properties = { "dct:type": { "@id": offer.dctType } };
  if (offer.version !== null) properties["cx-common:version"] = offer.version;
  if (offer.semanticId !== null) properties["aas-semantics:semanticId"] = { "@id": offer.semanticId };
  if (offer.passportIdentifier !== null) properties.passportIdentifier = offer.passportIdentifier;
  return {
    "@context": ASSET_CONTEXT,
    "@type": "Asset",
    "@id": offer.assetId,
    properties,
    privateProperties: { [OFFER_PROPERTY]: JSON.stringify(offer) },
    // The provider data plane appends the path of the consumer (the suffix /submodel or the operation),
    // forwards the method and the body, and sets the data plane key as a static header (01_assets.md
    // lines 99 to 111); it sets the header Edc-Bpn itself (D41).
    dataAddress: {
      "@type": "DataAddress",
      type: "HttpData",
      baseUrl: `${config.publicBaseUrl}${offer.path}`,
      proxyPath: "true",
      proxyMethod: "true",
      proxyBody: "true",
      proxyQueryParams: "false",
      [`header:${config.dataPlaneKeyHeader}`]: config.dataPlaneKey,
    },
  };
}

function accessPolicyOf(offer) {
  const permission = { action: "access" };
  if (offer.allowedBpnls !== null) permission.constraint = { leftOperand: "BusinessPartnerNumber", operator: "isAnyOf", rightOperand: offer.allowedBpnls };
  return { "@context": POLICY_CONTEXT, "@type": "PolicyDefinition", "@id": `${offer.assetId}-access`, policy: { "@type": "Set", permission: [permission] } };
}

function usagePolicyOf(offer) {
  return {
    "@context": POLICY_CONTEXT,
    "@type": "PolicyDefinition",
    "@id": `${offer.assetId}-usage`,
    policy: {
      "@type": "Set",
      permission: [
        {
          action: "use",
          constraint: {
            and: [
              { leftOperand: "FrameworkAgreement", operator: "eq", rightOperand: offer.frameworkAgreement },
              { leftOperand: "UsagePurpose", operator: "isAnyOf", rightOperand: offer.usagePurposes },
            ],
          },
        },
      ],
    },
  };
}

function contractDefinitionOf(offer) {
  return {
    "@context": VOCABULARY_CONTEXT,
    "@type": "ContractDefinition",
    "@id": `${offer.assetId}-definition`,
    accessPolicyId: `${offer.assetId}-access`,
    contractPolicyId: `${offer.assetId}-usage`,
    assetsSelector: { "@type": "CriterionDto", operandLeft: `${EDC}id`, operator: "=", operandRight: offer.assetId },
  };
}

// Returns an offer store with the methods publish, withdraw and list of the offer contract.
export function createEdcOfferStore({ config, fetch }) {
  const management = { config, fetch };

  // Replaces the entry, or creates it when the management API answers 404 for a missing entry.
  async function upsert(path, entry, replacePath) {
    const replaced = await managementRequest(management, "PUT", replacePath, entry, [200, 204, 404]);
    if (replaced.status === 404) await managementRequest(management, "POST", path, entry, [200]);
  }

  async function publish(input) {
    if (input === null || typeof input !== "object" || typeof input.assetId !== "string" || input.assetId.length === 0) {
      throw new TypeError("publish needs an offer with an assetId");
    }
    const offer = {};
    for (const field of OFFER_FIELDS) offer[field] = structuredClone(input[field] ?? null);
    await upsert("/v3/assets", assetOf(offer, config), "/v3/assets");
    // The management API refuses a change of a policy that a contract definition references (answer 400,
    // "Policy Definition is referenced by a Contract Definition", recorded on 2026-11-19), so the store
    // deletes the contract definition first and creates it again after the policies.
    await managementRequest(management, "DELETE", `/v3/contractdefinitions/${offer.assetId}-definition`, undefined, [200, 204, 404]);
    // An empty list admits nobody: the management API refuses an empty list in a constraint (answer 400,
    // "mandatory value 'http://www.w3.org/ns/odrl/2/rightOperand' is missing or it is blank", recorded on
    // 2026-11-19), so the asset stays registered without policies and without a contract definition, and
    // no participant sees an offer of the asset.
    if (offer.allowedBpnls !== null && offer.allowedBpnls.length === 0) {
      for (const suffix of ["access", "usage"]) {
        await managementRequest(management, "DELETE", `/v3/policydefinitions/${offer.assetId}-${suffix}`, undefined, [200, 204, 404, 409]);
      }
      return;
    }
    await upsert("/v3/policydefinitions", accessPolicyOf(offer), `/v3/policydefinitions/${offer.assetId}-access`);
    await upsert("/v3/policydefinitions", usagePolicyOf(offer), `/v3/policydefinitions/${offer.assetId}-usage`);
    await managementRequest(management, "POST", "/v3/contractdefinitions", contractDefinitionOf(offer), [200]);
  }

  // Withdraws the offer; the withdrawal of an absent offer is a success. An asset of an existing contract
  // agreement cannot be deleted (answer 409), so the store then marks the asset as withdrawn: the
  // contract definition is gone, and no new agreement delivers the asset.
  async function withdraw(assetId) {
    await managementRequest(management, "DELETE", `/v3/contractdefinitions/${assetId}-definition`, undefined, [200, 204, 404]);
    const deleted = await managementRequest(management, "DELETE", `/v3/assets/${assetId}`, undefined, [200, 204, 404, 409]);
    if (deleted.status === 409) {
      const read = await managementRequest(management, "GET", `/v3/assets/${assetId}`, undefined, [200]);
      const asset = { ...read.body, "@context": ASSET_CONTEXT, privateProperties: { [OFFER_PROPERTY]: "withdrawn" } };
      await managementRequest(management, "PUT", "/v3/assets", asset, [200, 204]);
    }
    for (const suffix of ["access", "usage"]) {
      await managementRequest(management, "DELETE", `/v3/policydefinitions/${assetId}-${suffix}`, undefined, [200, 204, 404, 409]);
    }
  }

  async function list() {
    const answer = await managementRequest(management, "POST", "/v3/assets/request", { "@context": VOCABULARY_CONTEXT, "@type": "QuerySpec", offset: 0, limit: 10000 }, [200]);
    const offers = [];
    for (const asset of [].concat(answer.body ?? [])) {
      const privateProperties = asset.privateProperties ?? {};
      const text = privateProperties[OFFER_PROPERTY] ?? privateProperties[`${EDC}${OFFER_PROPERTY}`];
      if (typeof text !== "string" || text === "withdrawn") continue;
      offers.push(JSON.parse(text));
    }
    return offers.sort((left, right) => left.assetId.localeCompare(right.assetId));
  }

  return Object.freeze({ publish, withdraw, list });
}
