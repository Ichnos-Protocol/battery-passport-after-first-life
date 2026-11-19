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

// Requirements: SwR-CXCLIENT-110 (Recycling withdraws the passport dataset offers), SwR-CXCLIENT-166
// (Point 4 offer for the passport issuer gated by a recorded contract) and SwR-CXCLIENT-182 (Lifecycle
// record offer restricted to purchaser, operators and authorities), with decision D3 (The access map and
// the whole aspect) [waits for the owner], decision D4 (One offer per lifecycle model), decision D33 (The
// offers of an ended passport) [waits for the owner] and decision D47 (The access to the notification
// asset) [waits for the owner]. System requirements SyR-PASS-236 (Lifecycle record offered only to
// purchaser, operators and authorities) and SyR-LIFE-011 (Recycling ends the battery's passport
// dataset). Sections 9.2.5 and 10.5 of docs/architecture/implementation_plan.md.
// The one caller of the offer store (EL-CXCLIENT, the connector client). The publisher builds each
// offer of section 10.5 with policyBuilder.mjs; a submodel offer exists for each submodel descriptor of
// the PartInstance shell of section 9.2.6.
import { ASPECTS, IDTA_02035_ASPECT_KEYS, STORED_ASPECT_KEYS } from "../submodels/submodelService.mjs";
import { partInstanceAspectKeys } from "../twins/shellDescriptor.mjs";
import {
  buildAccessMapOffer,
  buildBatteryInformationOffer,
  buildNotificationAssetOffer,
  buildPassportSubmodelOffer,
} from "./policyBuilder.mjs";

// Returns the offer publisher of a deployment.
export function createOfferPublisher({ offerStore, config, clock, passportRepository, accessRecordRepository, accessMaps }) {
  async function publishNotificationAsset() {
    const offer = buildNotificationAssetOffer({ allowedBpnls: config.notificationAllowedBpnls });
    await offerStore.publish(offer);
    return offer;
  }

  // Publishes the offers of the PartInstance shell of a passport: the lifecycle offer and the successors
  // offer for the Business Partner Numbers of the open access records of their keys, and one offer per
  // stored payload, for every participant when the access decision of section 9.2.4 admits a partner
  // without an access record. An ended passport keeps only the lifecycle and successors offers (D33).
  async function publishPassportOffers({ client, passportId }) {
    const passport = await passportRepository.findPassport(client, passportId);
    if (passport === null) throw new Error(`publishPassportOffers: the deployment holds no passport ${passportId}`);
    const ended = passport.recycling_date !== null;
    const aspectKeys = partInstanceAspectKeys({
      storedAspectKeys: ended ? [] : await passportRepository.listStoredAspectKeys(client, passportId),
      hasLineageLink: (await passportRepository.listLineageLinks(client, passportId)).length > 0,
      hasWasteSuccessor: passport.waste_successor_bpnl !== null,
      hasEnded: ended,
      hasSuccessorLink: (await passportRepository.listSuccessorLinks(client, passportId)).length > 0,
    });
    const at = clock.now();
    const offers = [];
    for (const aspectKey of aspectKeys) {
      const publicWithoutRecord =
        IDTA_02035_ASPECT_KEYS.includes(aspectKey) && (await accessMaps.isPublicWithoutRecord({ client, modelId: passport.battery_model_id, aspectKey }));
      const allowedBpnls = publicWithoutRecord ? null : await accessRecordRepository.listOpenRecipients(client, { passportId, aspectKey, at });
      const offer = buildPassportSubmodelOffer({ passportId, aspectKey, semanticId: ASPECTS[aspectKey].semanticId, allowedBpnls });
      await offerStore.publish(offer);
      offers.push(offer);
    }
    return offers;
  }

  async function publishAccessMapOffer({ modelId }) {
    const offer = buildAccessMapOffer({ modelId, semanticId: ASPECTS["access-map"].semanticId });
    await offerStore.publish(offer);
    return offer;
  }

  // Withdraws the offers of the ten stored aspect keys of a passport (SwR-CXCLIENT-110, D33).
  async function withdrawDatasetOffers({ passportId }) {
    for (const aspectKey of STORED_ASPECT_KEYS) await offerStore.withdraw(`${aspectKey}-${passportId}`);
  }

  // The offer of the individual battery information of a provider contract, for the one Business
  // Partner Number of the issuer (decision D38, The sharing of individual battery information).
  async function publishBatteryInformationOffer({ contractId, issuerBpnl, passportIdentifier }) {
    const offer = buildBatteryInformationOffer({ contractId, issuerBpnl, passportIdentifier, semanticId: ASPECTS["product-condition"].semanticId });
    await offerStore.publish(offer);
    return offer;
  }

  async function withdrawBatteryInformationOffer({ contractId }) {
    await offerStore.withdraw(`battery-information-${contractId}`);
  }

  return Object.freeze({
    publishNotificationAsset,
    publishPassportOffers,
    publishAccessMapOffer,
    withdrawDatasetOffers,
    publishBatteryInformationOffer,
    withdrawBatteryInformationOffer,
  });
}
