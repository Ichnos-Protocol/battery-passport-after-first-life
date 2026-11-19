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
// (Lifecycle record offer restricted to purchaser, operators and authorities). Section 9.2.5 of
// docs/architecture/implementation_plan.md (the offer contract).
// The offer store of the memory binding (EL-CXCLIENT, the connector client): the published offers of
// one participant, held in the memory of the process.

const OFFER_FIELDS = ["assetId", "dctType", "version", "semanticId", "passportIdentifier", "path", "allowedBpnls", "usagePurposes", "frameworkAgreement"];

// Returns an offer store with the methods publish, withdraw and list. The method publish replaces a
// published offer with the same assetId.
export function createMemoryOfferStore() {
  const offers = new Map();
  return Object.freeze({
    async publish(offer) {
      if (offer === null || typeof offer !== "object" || typeof offer.assetId !== "string" || offer.assetId.length === 0) {
        throw new TypeError("publish needs an offer with an assetId");
      }
      const stored = {};
      for (const field of OFFER_FIELDS) stored[field] = structuredClone(offer[field] ?? null);
      offers.set(offer.assetId, stored);
    },
    async withdraw(assetId) {
      offers.delete(assetId);
    },
    async list() {
      return [...offers.values()].map((offer) => structuredClone(offer)).sort((left, right) => left.assetId.localeCompare(right.assetId));
    },
  });
}
