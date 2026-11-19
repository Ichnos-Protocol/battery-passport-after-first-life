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

// Tests the offer publisher of server/src/connector/offerPublisher.mjs and the exposure of
// server/src/connector/exposure.mjs under the role refserver_app, with the memory offer store and the
// memory twin registry.
//
// Requirements of the registry that this file verifies:
//   SwR-CXCLIENT-110 (Recycling withdraws the passport dataset offers)
//   SwR-CXCLIENT-182 (Lifecycle record offer restricted to purchaser, operators and authorities)
// Measures VM-SWE-CXCLIENT-015 (Passport dataset offers and their hand-off) and VM-SWE-CXCLIENT-038
// (Lifecycle record offer restricted to the named BPNLs), section 17.2 of the implementation
// specification. Decisions D23 (The exposure after the commit), D33 (The offers of an ended passport)
// [waits for the owner] and D47 (The access to the notification asset) [waits for the owner].
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { after, before, test } from "node:test";

import { createAccessRecordService } from "../src/access/accessRecordService.mjs";
import * as accessRecordRepository from "../src/access/accessRecordRepository.mjs";
import { createExposure } from "../src/connector/exposure.mjs";
import { createMemoryOfferStore } from "../src/connector/memoryOfferStore.mjs";
import * as notificationPlanner from "../src/connector/notificationPlan.mjs";
import * as notificationRepository from "../src/connector/notificationRepository.mjs";
import { createOfferPublisher } from "../src/connector/offerPublisher.mjs";
import { NOTIFICATION_ASSET_ID, USAGE_PURPOSE } from "../src/connector/policyBuilder.mjs";
import * as companyRepository from "../src/dataset/companyRepository.mjs";
import * as catalogue from "../src/dataset/lifecycleCatalogue.mjs";
import * as recordReader from "../src/dataset/lifecycleRecordReader.mjs";
import { createLifecycleService } from "../src/dataset/lifecycleService.mjs";
import * as passportRepository from "../src/dataset/passportRepository.mjs";
import { withTransaction } from "../src/db/transaction.mjs";
import { normaliseUuid } from "../src/identifiers.mjs";
import * as accessMapRepository from "../src/submodels/accessMapRepository.mjs";
import { createAccessMapService } from "../src/submodels/accessMapService.mjs";
import { createMemoryTwinRegistry } from "../src/twins/memoryTwinRegistry.mjs";
import { createSchemaValidator } from "../src/validation/schemaValidator.mjs";
import { createTestDatabase } from "./support/database.mjs";

const OWN = "BPNL00000000TCK2";
const PROVIDER = "BPNL00000000TCK1";
const SUCCESSOR = "BPNL00000000TCK4";
const PURCHASER = "BPNL00000000TCK5";
const ORIGINAL_MODEL = randomUUID();
const NOW = "2026-06-15T10:00:00.000Z";
const clock = { now: () => new Date(NOW) };
const operator = { kind: "operator", bpnl: OWN };
const fixture = (name) => JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8"));
const CONFIG = {
  ownBpnl: OWN,
  connectorDataPlanePublicUrl: "http://data-plane.memory.invalid/api/public",
  connectorDspUrl: "http://control-plane.memory.invalid/api/v1/dsp",
  notificationAllowedBpnls: null,
};

let db;
let lifecycle;
let accessRecords;
let accessMaps;
let offerStore;
let twinRegistry;
let publisher;
let exposure;
let logged;
let model;
let counter = 0;
const unique = (prefix) => `${prefix}-${process.pid}-${(counter += 1)}`;
const run = (work) => withTransaction(db.appPool, { actingBpnl: OWN, today: "2026-06-15" }, work);

function services(registry, store) {
  const offers = createOfferPublisher({ offerStore: store, config: CONFIG, clock, passportRepository, accessRecordRepository, accessMaps });
  const logger = { error: (message, fields) => logged.push({ message, fields }), warn() {}, info() {}, debug() {} };
  return { offers, exposure: createExposure({ config: CONFIG, clock, twinRegistry: registry, offerPublisher: offers, passportRepository, accessMapRepository, logger }) };
}

before(async () => {
  db = await createTestDatabase("offerPublisher.integration.test.mjs");
  await companyRepository.upsertOwnCompany(db.appPool, {
    ownBpnl: OWN,
    ownLegalName: "Example Second Life Company",
    ownLegalNameLanguage: "en",
    ownAddress: fixture("nameplate.json").AddressInformation,
    ownOperatorIdentifier: null,
  });
  const validator = createSchemaValidator();
  accessMaps = createAccessMapService({ repository: accessMapRepository, passportRepository, companyRepository, validator, clock });
  accessRecords = createAccessRecordService({ repository: accessRecordRepository, passportRepository, accessMaps, clock, accessRegime: "after-act" });
  lifecycle = createLifecycleService({
    repository: passportRepository,
    catalogue,
    notificationPlanner,
    notificationRepository,
    accessRecords: accessRecordRepository,
    clock,
    newUuid: randomUUID,
    ownBpnl: OWN,
    passportEndedDelaySeconds: 5,
    passportServiceProviderBpnl: null,
    validator,
    accessMaps,
    companyRepository,
    recordReader,
  });
  logged = [];
  offerStore = createMemoryOfferStore();
  twinRegistry = createMemoryTwinRegistry();
  ({ offers: publisher, exposure } = services(twinRegistry, offerStore));
  model = (await run((client) => lifecycle.createBatteryModel({ client, subject: operator, data: { manufacturerPartId: unique("TCK-PART"), originalModel: { catenaXId: normaliseUuid(ORIGINAL_MODEL), manufacturerBpnl: PROVIDER } } }))).model;
});

after(async () => {
  if (db) await db.drop();
});

const firstPassport = () =>
  run((client) =>
    lifecycle.createFirstPassport({
      client,
      subject: operator,
      data: { batteryModelId: model.id, batteryIdentifier: unique("TCK-BATTERY"), batteryCategory: "ev", facilityBpns: "BPNS00000000TCK1", dateOfManufacture: "2026-01-10", originalPurpose: "Traction battery", passportIdentifier: unique("TCK-PASSPORT") },
    }),
  ).then((result) => result.passport);

function newPassport(predecessor) {
  return run((client) =>
    lifecycle.issueNewPassport({
      client,
      subject: operator,
      data: {
        operation: "repurposing",
        predecessors: [predecessor],
        batteryModelId: model.id,
        batteryIdentifier: predecessor.batteryIdentifier,
        batteryCategory: "stationary",
        facilityBpns: "BPNS00000000TCK1",
        purpose: "Stationary storage",
        dateOfManufacture: "2026-02-20",
        dateIntoService: "2026-03-15",
        ratedCapacityAh: 180.5,
        capacityFadePercent: 12.25,
        powerFadePercent: 8.5,
        expectedLifetimeYears: 9.5,
        operationDate: "2026-03-01T08:00:00.000Z",
      },
    }),
  ).then((result) => result.passport);
}
const externalPredecessor = () => ({
  passportIdentifier: unique("TCK-PASSPORT"),
  catenaXId: normaliseUuid(randomUUID()),
  dataProviderBpnl: PROVIDER,
  batteryIdentifier: unique("TCK-BATTERY"),
  lifeCycleStage: "original",
  originalPurpose: "Traction battery",
  originalModelCatenaXId: normaliseUuid(ORIGINAL_MODEL),
});

async function offersOf(passportId) {
  return Object.fromEntries((await offerStore.list()).filter((offer) => offer.assetId.endsWith(passportId)).map((offer) => [offer.assetId.slice(0, -passportId.length - 1), offer]));
}
const put = (passportId, aspectKey, payload) => run((client) => lifecycle.putAspectPayload({ client, subject: operator, passportId, aspectKey, payload }));

test("SwR-CXCLIENT-182 (Lifecycle record offer restricted to purchaser, operators and authorities): the offers after each step", async (t) => {
  await t.test("the notification asset admits every participant without NOTIFICATION_ALLOWED_BPNLS, or the listed participants", async () => {
    const offer = await publisher.publishNotificationAsset();
    assert.equal(offer.assetId, NOTIFICATION_ASSET_ID);
    assert.equal(offer.allowedBpnls, null);
    const limitedStore = createMemoryOfferStore();
    const limited = createOfferPublisher({ offerStore: limitedStore, config: { ...CONFIG, notificationAllowedBpnls: [PROVIDER] }, clock, passportRepository, accessRecordRepository, accessMaps });
    await limited.publishNotificationAsset();
    assert.deepStrictEqual((await limitedStore.list())[0].allowedBpnls, [PROVIDER]);
  });
  await t.test("a first passport without a payload, a lineage link, a waste successor, an end or a successor link publishes no offer", async () => {
    const passport = await firstPassport();
    assert.deepStrictEqual(await exposure.refreshPassportExposure({ pool: db.appPool, passportId: passport.id }), { refreshed: true });
    assert.deepStrictEqual(await offersOf(passport.id), {});
    const shell = await twinRegistry.read(`urn:uuid:${passport.id}`);
    assert.deepStrictEqual(shell.submodelDescriptors, []);
  });
  await t.test("the lifecycle asset of a new passport is published with an empty access list, which admits no participant", async () => {
    const passport = await newPassport(externalPredecessor());
    assert.deepStrictEqual(await exposure.refreshPassportExposure({ pool: db.appPool, passportId: passport.id }), { refreshed: true });
    const offers = await offersOf(passport.id);
    assert.deepStrictEqual(Object.keys(offers), ["lifecycle"]);
    assert.deepStrictEqual(offers.lifecycle.allowedBpnls, []);
    assert.deepStrictEqual(offers.lifecycle.usagePurposes, [USAGE_PURPOSE]);
    assert.equal(offers.lifecycle.path, `/api/passports/${passport.id}/submodels/lifecycle`);
    const shell = await twinRegistry.read(`urn:uuid:${passport.id}`);
    assert.deepStrictEqual(shell.submodelDescriptors.map((descriptor) => descriptor.idShort), ["batteryPassportLifecycle"]);
    assert.ok(shell.submodelDescriptors[0].endpoints[0].protocolInformation.subprotocolBody.endsWith(`id=lifecycle-${passport.id}`));
  });
  await t.test("the lifecycle offer admits the Business Partner Numbers of the open access records of the key lifecycle, and an ended record no more", async () => {
    const passport = await newPassport(externalPredecessor());
    const opened = await run((client) => accessRecords.addAccessRecord({ client, subject: operator, passportId: passport.id, data: { recipientBpnl: PURCHASER, recipientRole: "purchaser", aspectKey: "lifecycle" } }));
    await exposure.refreshPassportExposure({ pool: db.appPool, passportId: passport.id });
    assert.deepStrictEqual((await offersOf(passport.id)).lifecycle.allowedBpnls, [PURCHASER]);
    await run((client) => accessRecords.endAccessRecord({ client, subject: operator, passportId: passport.id, recordId: opened.record.id }));
    await exposure.refreshPassportExposure({ pool: db.appPool, passportId: passport.id });
    assert.deepStrictEqual((await offersOf(passport.id)).lifecycle.allowedBpnls, []);
  });
  await t.test("decision D3 [waits for the owner]: a stored payload is offered to every participant only when the current access map marks every entry of its aspect public", async () => {
    const accessModel = (await run((client) => lifecycle.createBatteryModel({ client, subject: operator, data: { manufacturerPartId: unique("TCK-PART") } }))).model;
    const passport = (await run((client) =>
      lifecycle.createFirstPassport({ client, subject: operator, data: { batteryModelId: accessModel.id, batteryIdentifier: unique("TCK-BATTERY"), batteryCategory: "ev", facilityBpns: "BPNS00000000TCK1", dateOfManufacture: "2026-01-10", originalPurpose: "Traction battery" } }),
    )).passport;
    await run((client) => accessMaps.putAccessMap({ client, modelId: accessModel.id, map: fixture("accessMap.json") }));
    for (const [key, name] of [["digital-nameplate", "nameplate.json"], ["technical-data", "technicalData.json"], ["product-condition", "productCondition.json"], ["dpp-metadata", "dppMetadata.json"]]) await put(passport.id, key, fixture(name));
    await exposure.refreshPassportExposure({ pool: db.appPool, passportId: passport.id });
    const offers = await offersOf(passport.id);
    assert.deepStrictEqual(Object.keys(offers).sort(), ["digital-nameplate", "dpp-metadata", "product-condition", "technical-data"]);
    assert.equal(offers["technical-data"].allowedBpnls, null, "every entry of the technical data is public");
    assert.deepStrictEqual(offers["digital-nameplate"].allowedBpnls, [], "the nameplate holds the restricted battery status");
    assert.deepStrictEqual(offers["product-condition"].allowedBpnls, []);
    assert.deepStrictEqual(offers["dpp-metadata"].allowedBpnls, [], "the access map does not cover the DPP metadata");
    for (const offer of Object.values(offers)) assert.deepStrictEqual(offer.usagePurposes, [USAGE_PURPOSE]);
    const shell = await twinRegistry.read(`urn:uuid:${passport.id}`);
    assert.deepStrictEqual(shell.submodelDescriptors.map((descriptor) => descriptor.idShort).sort(), ["batteryNameplate", "dppMetadata", "productCondition", "technicalData"]);
  });
  await t.test("the successors offer follows a successor link, for the Business Partner Numbers of the open records of the key successors", async () => {
    const original = await firstPassport();
    await newPassport({ ...externalPredecessor(), passportIdentifier: original.passportIdentifier, batteryIdentifier: original.batteryIdentifier, dataProviderBpnl: OWN });
    const [received] = (await db.adminClient.query("SELECT message_id FROM notifications_received WHERE passport_identifier = $1", [original.passportIdentifier])).rows;
    await run((client) => lifecycle.addForwardLink({ client, subject: operator, passportId: original.id, messageId: received.message_id }));
    await run((client) => accessRecords.addAccessRecord({ client, subject: operator, passportId: original.id, data: { recipientBpnl: SUCCESSOR, recipientRole: "marketSurveillanceAuthority", aspectKey: "successors" } }));
    await exposure.refreshPassportExposure({ pool: db.appPool, passportId: original.id });
    const offers = await offersOf(original.id);
    assert.deepStrictEqual(Object.keys(offers), ["successors"]);
    assert.deepStrictEqual(offers.successors.allowedBpnls, [SUCCESSOR]);
  });
});

test("SwR-CXCLIENT-110 (Recycling withdraws the passport dataset offers): the withdrawal of decision D33 [waits for the owner]", async (t) => {
  await t.test("after the end, withdrawDatasetOffers withdraws the offers of the stored aspect keys, and the lifecycle offer stays", async () => {
    const passport = await newPassport(externalPredecessor());
    await put(passport.id, "product-condition", fixture("productCondition.json"));
    await put(passport.id, "serial-part", { catenaXId: normaliseUuid(passport.id) });
    await exposure.refreshPassportExposure({ pool: db.appPool, passportId: passport.id });
    assert.deepStrictEqual(Object.keys(await offersOf(passport.id)).sort(), ["lifecycle", "product-condition", "serial-part"]);
    await run((client) =>
      lifecycle.reportEvent({ client, subject: operator, operation: "PassportEnded", data: { passportIdentifier: passport.passportIdentifier, dataProviderBpnl: OWN, nameplateManufacturerBpnl: OWN, recyclingDate: "2026-06-15T09:00:00.000Z" } }),
    );
    await publisher.withdrawDatasetOffers({ passportId: passport.id });
    assert.deepStrictEqual(await exposure.refreshPassportExposure({ pool: db.appPool, passportId: passport.id }), { refreshed: true });
    assert.deepStrictEqual(Object.keys(await offersOf(passport.id)), ["lifecycle"]);
    const shell = await twinRegistry.read(`urn:uuid:${passport.id}`);
    assert.deepStrictEqual(shell.submodelDescriptors.map((descriptor) => descriptor.idShort), ["batteryPassportLifecycle"]);
  });
});

test("decision D23 (The exposure after the commit): the result of the refresh after a failing registry", async (t) => {
  await t.test("refreshPassportExposure resolves to refreshed false with the cause, logs at the level error and leaves the stored step in place", async () => {
    const failing = { put: async () => Promise.reject(new Error("the registry is unreachable")), read: async () => null };
    const store = createMemoryOfferStore();
    const { exposure: failingExposure } = services(failing, store);
    const passport = await newPassport(externalPredecessor());
    logged.length = 0;
    const result = await failingExposure.refreshPassportExposure({ pool: db.appPool, passportId: passport.id });
    assert.deepStrictEqual(result, { refreshed: false, cause: "the registry is unreachable" });
    assert.equal(logged.length, 1);
    assert.equal(logged[0].fields.passportId, passport.id);
    assert.deepStrictEqual(await store.list(), []);
    assert.equal((await db.adminClient.query("SELECT 1 FROM passports WHERE id = $1", [passport.id])).rowCount, 1);
  });
  await t.test("refreshModelExposure registers the PartType shell and, with an access map version, the access map offer", async () => {
    const plain = (await run((client) => lifecycle.createBatteryModel({ client, subject: operator, data: { manufacturerPartId: unique("TCK-PART") } }))).model;
    assert.deepStrictEqual(await exposure.refreshModelExposure({ pool: db.appPool, modelId: plain.id }), { refreshed: true });
    assert.deepStrictEqual((await twinRegistry.read(`urn:uuid:${plain.id}`)).submodelDescriptors, []);
    assert.equal((await offerStore.list()).some((offer) => offer.assetId === `access-map-${plain.id}`), false);
    await run((client) => accessMaps.putAccessMap({ client, modelId: plain.id, map: fixture("accessMap.json") }));
    await exposure.refreshModelExposure({ pool: db.appPool, modelId: plain.id });
    const shell = await twinRegistry.read(`urn:uuid:${plain.id}`);
    assert.deepStrictEqual(shell.submodelDescriptors.map((descriptor) => descriptor.idShort), ["batteryPassportAccessMap"]);
    const offer = (await offerStore.list()).find((item) => item.assetId === `access-map-${plain.id}`);
    assert.equal(offer.allowedBpnls, null);
    assert.equal(offer.path, `/api/battery-models/${plain.id}/submodels/access-map`);
    const unknown = await exposure.refreshModelExposure({ pool: db.appPool, modelId: randomUUID() });
    assert.equal(unknown.refreshed, false);
  });
});
