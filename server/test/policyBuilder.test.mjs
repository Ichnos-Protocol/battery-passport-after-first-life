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

// Tests the builder of the offers of server/src/connector/policyBuilder.mjs.
//
// Requirements of the registry that this file verifies:
//   SwR-CXCLIENT-166 (Point 4 offer for the passport issuer gated by a recorded contract)
//   SwR-CXCLIENT-177 (Second-life battery's point 4 offer to the original data provider)
//   SwR-CXCLIENT-182 (Lifecycle record offer restricted to purchaser, operators and authorities)
// Decision D47 (The access to the notification asset) [waits for the owner]. Section 10.5 of the
// implementation specification.
import assert from "node:assert/strict";
import { test } from "node:test";

import {
  NOTIFICATION_ASSET_ID,
  SUBMODEL_DCT_TYPE,
  USAGE_PURPOSE,
  admits,
  buildAccessMapOffer,
  buildBatteryInformationOffer,
  buildNotificationAssetOffer,
  buildPassportSubmodelOffer,
} from "../src/connector/policyBuilder.mjs";

const PASSPORT_ID = "5f0c1c7e-6b1e-4a37-9a59-0b1d7c3e2a10";
const MODEL_ID = "9a2b8f61-3c5d-4e7a-8b1f-2d6c4a0e9f33";
const CONTRACT_ID = "b7e4d2a9-1c3f-4e5a-8b6d-0f9e8d7c6b5a";
const LIFECYCLE_ID = "urn:samm:io.catenax.battery.passport_lifecycle:1.0.0#BatteryPassportLifecycle";
const PARTICIPANTS = ["BPNL00000000TCK1", "BPNL00000000TCK2", "BPNL00000000TCK3", "BPNL00000000TCK4", "BPNL00000000TCK5", "BPNL00000000TCK6"];
const admitted = (offer) => PARTICIPANTS.filter((bpnl) => admits(offer, bpnl));

test("SwR-CXCLIENT-182 (Lifecycle record offer restricted to purchaser, operators and authorities): the offers of section 10.5", async (t) => {
  await t.test("the notification asset carries cx.circular.dpp:1 and admits every participant without NOTIFICATION_ALLOWED_BPNLS", () => {
    const offer = buildNotificationAssetOffer({ allowedBpnls: null });
    assert.deepStrictEqual(offer, {
      assetId: NOTIFICATION_ASSET_ID,
      dctType: "cx-taxo:BatteryPassLifecycleNotificationAPI",
      version: "1.0",
      semanticId: null,
      passportIdentifier: null,
      path: "/api/lifecycle-notifications",
      allowedBpnls: null,
      usagePurposes: [USAGE_PURPOSE],
    });
    assert.equal(USAGE_PURPOSE, "cx.circular.dpp:1");
    assert.deepStrictEqual(admitted(offer), PARTICIPANTS);
  });
  await t.test("NOTIFICATION_ALLOWED_BPNLS limits the notification asset to the listed participants", () => {
    const offer = buildNotificationAssetOffer({ allowedBpnls: ["BPNL00000000TCK3", "BPNL00000000TCK2"] });
    assert.deepStrictEqual(offer.allowedBpnls, ["BPNL00000000TCK2", "BPNL00000000TCK3"]);
    assert.deepStrictEqual(admitted(offer), ["BPNL00000000TCK2", "BPNL00000000TCK3"]);
  });
  await t.test("the lifecycle offer of a passport carries cx.circular.dpp:1 and the Business Partner Numbers of its access records", () => {
    const offer = buildPassportSubmodelOffer({ passportId: PASSPORT_ID, aspectKey: "lifecycle", semanticId: LIFECYCLE_ID, allowedBpnls: ["BPNL00000000TCK5", "BPNL00000000TCK4", "BPNL00000000TCK5"] });
    assert.equal(offer.assetId, `lifecycle-${PASSPORT_ID}`);
    assert.equal(offer.dctType, SUBMODEL_DCT_TYPE);
    assert.equal(offer.semanticId, LIFECYCLE_ID);
    assert.equal(offer.path, `/api/passports/${PASSPORT_ID}/submodels/lifecycle`);
    assert.deepStrictEqual(offer.usagePurposes, ["cx.circular.dpp:1"]);
    assert.deepStrictEqual(offer.allowedBpnls, ["BPNL00000000TCK4", "BPNL00000000TCK5"]);
    assert.deepStrictEqual(admitted(offer), ["BPNL00000000TCK4", "BPNL00000000TCK5"]);
  });
  await t.test("an empty list builds an offer whose access policy admits nobody, so the asset stays registered (section 9.2.5)", () => {
    const offer = buildPassportSubmodelOffer({ passportId: PASSPORT_ID, aspectKey: "successors", semanticId: "urn:samm:io.catenax.battery.passport_successors:1.0.0#BatteryPassportSuccessors", allowedBpnls: [] });
    assert.deepStrictEqual(offer.allowedBpnls, []);
    assert.deepStrictEqual(admitted(offer), []);
  });
  await t.test("a stored payload offer for every participant carries the value null", () => {
    const offer = buildPassportSubmodelOffer({ passportId: PASSPORT_ID, aspectKey: "digital-nameplate", semanticId: "urn:samm:io.admin-shell.idta.batterypass.digital_nameplate:1.0.0#BatteryNameplate", allowedBpnls: null });
    assert.equal(offer.assetId, `digital-nameplate-${PASSPORT_ID}`);
    assert.deepStrictEqual(admitted(offer), PARTICIPANTS);
    assert.deepStrictEqual(offer.usagePurposes, ["cx.circular.dpp:1"]);
  });
  await t.test("the access map offer of a battery model admits every participant", () => {
    const offer = buildAccessMapOffer({ modelId: MODEL_ID, semanticId: "urn:samm:io.catenax.battery.passport_access_map:1.0.0#BatteryPassportAccessMap" });
    assert.equal(offer.assetId, `access-map-${MODEL_ID}`);
    assert.equal(offer.path, `/api/battery-models/${MODEL_ID}/submodels/access-map`);
    assert.deepStrictEqual(offer.usagePurposes, ["cx.circular.dpp:1"]);
    assert.deepStrictEqual(admitted(offer), PARTICIPANTS);
  });
  await t.test("SwR-CXCLIENT-166 and SwR-CXCLIENT-177: the battery information offer admits only the issuer of the contract", () => {
    const offer = buildBatteryInformationOffer({ contractId: CONTRACT_ID, issuerBpnl: "BPNL00000000TCK1", passportIdentifier: "TCK-PASSPORT-A", semanticId: "urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#ProductCondition" });
    assert.equal(offer.assetId, `battery-information-${CONTRACT_ID}`);
    assert.equal(offer.passportIdentifier, "TCK-PASSPORT-A");
    assert.equal(offer.path, `/api/issuer-contracts/${CONTRACT_ID}/battery-information`);
    assert.deepStrictEqual(offer.usagePurposes, ["cx.circular.dpp:1"]);
    assert.deepStrictEqual(admitted(offer), ["BPNL00000000TCK1"]);
  });
});
