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


// Criterion CX-0160-4-CAC-016 (Access map) of Annex A of the proposal, section 2.2 items 8 to 12 and
// section 3.4. Requirements: PrR-CXD-028 (One conformance test per criterion CX-0160-4-CAC-001 to 016)
// and SyR-PASS-011 (Every dataset field marked with exactly one access group), with decision D3 (The
// access map and the whole aspect) [waits for the owner], decision D27 (A subset of JSONPath) and
// decision D45 (The data provider's check of a new payload). Section 14.3 of
// docs/architecture/implementation_plan.md.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { after, before, test } from "node:test";

import AjvDraft04 from "ajv-draft-04";
import addFormats from "ajv-formats";

import { startBinding } from "./lib/binding.mjs";
import {
  IDTA_02035_KEYS,
  PURCHASER,
  SEMANTIC_IDS,
  USAGE_PURPOSE,
  accessMapOf,
  expectData,
  expectRefusal,
  givenAccessMap,
  givenOriginalPassport,
  givenStoredPayloads,
  submodelPath,
} from "./lib/scenario.mjs";

// The generated schema of the access map model holds the two keywords of the SAMM command line tool
// (section 10.6), which the compiler admits as annotations.
const ajv = new AjvDraft04({ strict: true, allErrors: true });
addFormats(ajv);
ajv.addKeyword("x-samm-aspect-model-urn");
ajv.addKeyword("components");
const validateMap = ajv.compile(JSON.parse(readFileSync(new URL("../docs/api/aspects/BatteryPassportAccessMap-schema.json", import.meta.url), "utf8")));

let binding;
before(async () => {
  binding = await startBinding();
});
after(async () => {
  if (binding) await binding.stop();
});

test("CX-0160-4-CAC-016 (Access map): the data provider offers the access map on the PartType twin under cx.circular.dpp:1 with one entry for every served field of the seven IDTA-02035 aspect models, serves each field only under the access group of its entry, and publishes a new mapVersion after a change", async (t) => {
  const { provider } = binding;
  const passport = await givenOriginalPassport(provider);
  const modelId = passport.batteryModelId;
  const stored = await givenAccessMap(provider, modelId);
  await givenStoredPayloads(provider, passport.id);
  const mapPath = `/api/battery-models/${modelId}/submodels/access-map/submodel`;

  await t.test("section 2.2 item 8: the access map offer on the PartType twin of the battery model, under the usage purpose cx.circular.dpp:1, listed for every participant", async () => {
    assert.equal(stored.accessMap.mapVersion, "1.0.0");
    const shell = await provider.registry.read(`urn:uuid:${modelId}`);
    assert.ok(shell.specificAssetIds.some((item) => item.name === "digitalTwinType" && item.value === "PartType"));
    const descriptor = shell.submodelDescriptors.find((item) => item.idShort === "batteryPassportAccessMap");
    assert.equal(descriptor.semanticId.keys[0].value, SEMANTIC_IDS["access-map"]);
    const offer = (await provider.catalogue(PURCHASER)).find((item) => item.assetId === `access-map-${modelId}`);
    assert.ok(offer.usagePurposes.includes(USAGE_PURPOSE));
    assert.equal(offer.allowedBpnls, null);
  });
  await t.test("section 2.2 item 9 and section 3.4.2: the served map validates against the generated schema and holds one entry for every served field of the seven IDTA-02035 aspect models", async () => {
    const read = await provider.asPartner(PURCHASER).get(mapPath);
    assert.equal(read.outcome, "received", JSON.stringify(read.body));
    assert.equal(validateMap(read.body), true, JSON.stringify(validateMap.errors));
    for (const key of IDTA_02035_KEYS) {
      const served = (await provider.call("GET", submodelPath(passport.id, key))).body;
      for (const field of Object.keys(served)) {
        const entries = read.body.entries.filter((entry) => entry.aspect === SEMANTIC_IDS[key] && entry.twinLevel === "PartInstance" && entry.path === `$.${field}`);
        assert.equal(entries.length, 1, `${key} ${field}`);
      }
    }
  });
  await t.test("section 2.2 item 10: a reader without an access record reads a public aspect and is refused an aspect with a restricted field", async () => {
    const technical = await provider.asPartner(PURCHASER).get(submodelPath(passport.id, "technical-data"));
    assert.equal(technical.outcome, "received", JSON.stringify(technical.body));
    for (const key of ["product-condition", "digital-nameplate"]) assert.equal((await provider.asPartner(PURCHASER).get(submodelPath(passport.id, key))).outcome, "contract_refused", key);
  });
  await t.test("decision D45: a payload with a field that the map does not cover, and a map that does not cover a stored payload, answer 422 ERR-LC-ACCESS-MAP-INCOMPLETE", async () => {
    expectRefusal(await provider.call("PUT", `/api/passports/${passport.id}/aspects/circularity`, { DismantlingAndRemovalInformation: [], UncoveredField: "TCK" }), 422, "ERR-LC-ACCESS-MAP-INCOMPLETE");
    const partial = accessMapOf({ mapVersion: "0.9.0" });
    partial.entries = partial.entries.filter((entry) => entry.aspect !== SEMANTIC_IDS.circularity);
    expectRefusal(await provider.call("PUT", `/api/battery-models/${modelId}/access-map`, partial), 422, "ERR-LC-ACCESS-MAP-INCOMPLETE");
  });
  await t.test("section 2.2 item 12: a new version of the map is published with a new mapVersion, and a repeated mapVersion answers 409 ERR-LC-ACCESS-MAP-VERSION-EXISTS", async () => {
    const changed = accessMapOf({ mapVersion: "1.1.0" });
    for (const entry of changed.entries) if (entry.aspect === SEMANTIC_IDS["technical-data"]) entry.accessGroup = "legitimateInterestBattery";
    assert.equal(expectData(await provider.call("PUT", `/api/battery-models/${modelId}/access-map`, changed), 201).accessMap.mapVersion, "1.1.0");
    const read = await provider.asPartner(PURCHASER).get(mapPath);
    assert.equal(read.body.mapVersion, "1.1.0");
    assert.equal((await provider.asPartner(PURCHASER).get(submodelPath(passport.id, "technical-data"))).outcome, "contract_refused", "the technical data are restricted under the new version");
    expectRefusal(await provider.call("PUT", `/api/battery-models/${modelId}/access-map`, changed), 409, "ERR-LC-ACCESS-MAP-VERSION-EXISTS");
  });
});
