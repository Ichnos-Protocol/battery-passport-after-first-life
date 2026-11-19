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

// Requirements: SwR-TWINS-110 (A new PartInstance twin for a treated battery placed again) and
// SwR-TWINS-154 (New PartInstance twin registered for a new passport, originals untouched), with
// decision D28 (Supplied payloads). System requirement SyR-CXD-221 (New digital twin for a battery that
// receives a new passport). Section 9.2.6 of docs/architecture/implementation_plan.md and Table 2.1.1
// of the proposal CX-0160-4.
// The shell descriptors of the PartInstance twin of a passport and of the PartType twin of a battery
// model (EL-TWINS, the twin registration). Every function of the module is pure.
import { createHash } from "node:crypto";

import { buildAccessMapOffer, buildPassportSubmodelOffer } from "../connector/policyBuilder.mjs";
import { ASPECTS, STORED_ASPECT_KEYS } from "../submodels/submodelService.mjs";

const URN_PREFIX = "urn:uuid:";
const API_PREFIX = "/api";

// The id of a submodel descriptor: the first 16 bytes of the SHA-256 digest of the text
// "<shell id>/<aspect key>", with the version bits set to 4 and the variant bits set to the RFC 4122
// variant, written as urn:uuid: and the 36 characters of the UUID.
export function submodelDescriptorId(shellId, aspectKey) {
  const bytes = createHash("sha256").update(`${shellId}/${aspectKey}`, "utf8").digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return `${URN_PREFIX}${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function submodelDescriptor({ shellId, aspectKey, offer, config }) {
  const definition = ASPECTS[aspectKey];
  return {
    id: submodelDescriptorId(shellId, aspectKey),
    idShort: definition.idShort,
    semanticId: { type: "ExternalReference", keys: [{ type: "GlobalReference", value: definition.semanticId }] },
    endpoints: [
      {
        interface: "SUBMODEL-3.0",
        protocolInformation: {
          href: `${config.connectorDataPlanePublicUrl}${offer.path.slice(API_PREFIX.length)}/submodel`,
          endpointProtocol: "HTTP",
          endpointProtocolVersion: ["1.1"],
          subprotocol: "DSP",
          subprotocolBody: `dspEndpoint=${config.connectorDspUrl};id=${offer.assetId}`,
          subprotocolBodyEncoding: "plain",
          securityAttributes: [{ type: "NONE", key: "NONE", value: "NONE" }],
        },
      },
    ],
  };
}

// The aspect keys of the descriptors of a PartInstance shell: each stored payload key, lifecycle when
// the passport has a lineage link, a waste successor or an end, and successors when the passport has a
// successor link.
export function partInstanceAspectKeys({ storedAspectKeys, hasLineageLink, hasWasteSuccessor, hasEnded, hasSuccessorLink }) {
  const keys = [];
  if (hasLineageLink || hasWasteSuccessor || hasEnded) keys.push("lifecycle");
  if (hasSuccessorLink) keys.push("successors");
  for (const key of STORED_ASPECT_KEYS) if (storedAspectKeys.includes(key)) keys.push(key);
  return keys;
}

// The PartInstance shell of a passport. The parameters passport and model are the stored rows of the
// tables passports and battery_models; the parameter aspectKeys names the descriptors.
export function buildPartInstanceShell({ passport, model, aspectKeys, config }) {
  const id = `${URN_PREFIX}${passport.id}`;
  return {
    id,
    globalAssetId: id,
    idShort: "batteryPassport",
    specificAssetIds: [
      { name: "manufacturerId", value: passport.manufacturer_bpnl },
      { name: "manufacturerPartId", value: model.manufacturer_part_id },
      { name: "partInstanceId", value: passport.battery_identifier },
      { name: "intrinsicId", value: passport.battery_identifier },
      { name: "digitalTwinType", value: "PartInstance" },
    ],
    submodelDescriptors: aspectKeys.map((aspectKey) =>
      submodelDescriptor({
        shellId: id,
        aspectKey,
        offer: buildPassportSubmodelOffer({ passportId: passport.id, aspectKey, semanticId: ASPECTS[aspectKey].semanticId, allowedBpnls: [] }),
        config,
      }),
    ),
  };
}

// The PartType shell of a battery model, with the descriptor of the access map when the model holds an
// access map version.
export function buildPartTypeShell({ model, hasAccessMap, config }) {
  const id = `${URN_PREFIX}${model.id}`;
  const offer = buildAccessMapOffer({ modelId: model.id, semanticId: ASPECTS["access-map"].semanticId });
  return {
    id,
    globalAssetId: id,
    idShort: "batteryModel",
    specificAssetIds: [
      { name: "manufacturerId", value: model.manufacturer_bpnl },
      { name: "manufacturerPartId", value: model.manufacturer_part_id },
      { name: "digitalTwinType", value: "PartType" },
    ],
    submodelDescriptors: hasAccessMap ? [submodelDescriptor({ shellId: id, aspectKey: "access-map", offer, config })] : [],
  };
}
