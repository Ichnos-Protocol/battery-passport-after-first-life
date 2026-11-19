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

// Requirements: SwR-CXCLIENT-166 (Point 4 offer for the passport issuer gated by a recorded contract),
// SwR-CXCLIENT-177 (Second-life battery's point 4 offer to the original data provider) and
// SwR-CXCLIENT-182 (Lifecycle record offer restricted to purchaser, operators and authorities), with
// decision D4 (One offer per lifecycle model) and decision D47 (The access to the notification asset)
// [waits for the owner]. System requirement SyR-PASS-236 (Lifecycle record offered only to purchaser,
// operators and authorities). Section 10.5 of docs/architecture/implementation_plan.md.
// The builder of the offers of section 10.5 (EL-CXCLIENT, the connector client). Every function of the
// module is pure.

// The dct:type of a submodel offer of CX-0160 (Battery Passport) 1.1.0 section 4.1. The value is not
// verified against a stored text, because CX-0160 1.1.0 is cited and not stored; phase P7 verifies it.
export const SUBMODEL_DCT_TYPE = "cx-taxo:Submodel";

// The usage purpose of every offer (section 2.2 item 1 of the proposal). The three proposed purposes of
// Table 2.2 of the proposal are not added, because CX-0152 has not registered them.
export const USAGE_PURPOSE = "cx.circular.dpp:1";

export const NOTIFICATION_ASSET_ID = "asset-lifecycle-notification-1.0";
export const NOTIFICATION_DCT_TYPE = "cx-taxo:BatteryPassLifecycleNotificationAPI";
export const NOTIFICATION_VERSION = "1.0";

function offer({ assetId, dctType, version = null, semanticId = null, passportIdentifier = null, path, allowedBpnls }) {
  return {
    assetId,
    dctType,
    version,
    semanticId,
    passportIdentifier,
    path,
    allowedBpnls: allowedBpnls === null ? null : [...new Set(allowedBpnls)].sort(),
    usagePurposes: [USAGE_PURPOSE],
  };
}

// The access decision of an offer: the value null of allowedBpnls admits every participant, and a list
// admits exactly the listed participants, so an empty list admits nobody.
export function admits(builtOffer, bpnl) {
  return builtOffer.allowedBpnls === null || builtOffer.allowedBpnls.includes(bpnl);
}

// The lifecycle notification API: every participant, or the participants of NOTIFICATION_ALLOWED_BPNLS.
export function buildNotificationAssetOffer({ allowedBpnls }) {
  return offer({
    assetId: NOTIFICATION_ASSET_ID,
    dctType: NOTIFICATION_DCT_TYPE,
    version: NOTIFICATION_VERSION,
    path: "/api/lifecycle-notifications",
    allowedBpnls: allowedBpnls ?? null,
  });
}

// One submodel of a passport: the lifecycle submodel, the successors submodel or a stored payload.
export function buildPassportSubmodelOffer({ passportId, aspectKey, semanticId, allowedBpnls }) {
  return offer({
    assetId: `${aspectKey}-${passportId}`,
    dctType: SUBMODEL_DCT_TYPE,
    semanticId,
    path: `/api/passports/${passportId}/submodels/${aspectKey}`,
    allowedBpnls,
  });
}

// The access map of a battery model: every participant.
export function buildAccessMapOffer({ modelId, semanticId }) {
  return offer({
    assetId: `access-map-${modelId}`,
    dctType: SUBMODEL_DCT_TYPE,
    semanticId,
    path: `/api/battery-models/${modelId}/submodels/access-map`,
    allowedBpnls: null,
  });
}

// The individual battery information of a provider contract: the one Business Partner Number of the
// issuer, while the contract is open.
export function buildBatteryInformationOffer({ contractId, issuerBpnl, passportIdentifier, semanticId }) {
  return offer({
    assetId: `battery-information-${contractId}`,
    dctType: SUBMODEL_DCT_TYPE,
    semanticId,
    passportIdentifier,
    path: `/api/issuer-contracts/${contractId}/battery-information`,
    allowedBpnls: [issuerBpnl],
  });
}
