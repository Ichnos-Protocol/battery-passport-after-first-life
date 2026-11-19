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

// Tests the lifecycle executor of server/src/dataset/lifecycleService.mjs under the role refserver_app,
// on three deployments: the data provider of the original passports (BPNL00000000TCK1), the
// second-life operator (BPNL00000000TCK2) and the recycler (BPNL00000000TCK3).
//
// Requirements of the registry that this file verifies:
//   SwR-DATASET-085 (Status waste set on the existing dataset without a new passport)
//   SwR-DATASET-086 (Change to waste accepted only with a named responsible successor)
//   SwR-DATASET-089 (Recycling ends the dataset, no longer current and closed to change)
//   SwR-DATASET-092 (Original purpose and each later purpose recorded with their dates)
//   SwR-DATASET-093 (New dataset created for a treated battery placed on the market again)
//   SwR-DATASET-094 (New dataset carries a resolving link to the original passport)
//   SwR-DATASET-095 (Remanufactured dataset links the passport of every original battery)
//   SwR-DATASET-096 (Re-use and repurposing datasets accepted only with one or more links)
//   SwR-DATASET-098 (Original dataset kept and marked as superseded by the new one)
//   SwR-DATASET-100 (New dataset given an identifier different from every original)
//   SwR-DATASET-102 (New dataset fields set at the issue of a new passport)
//   SwR-DATASET-116 (Responsibility of a new dataset given to the operator placing it again)
//   SwR-DATASET-118 (Operator placing a treated battery named its manufacturer)
//   SwR-DATASET-119 (Changes applied only for the responsible or an authorised operator)
//   SwR-DATASET-191 (Waste step records the named successor, never the actor as manufacturer)
//   SwR-DATASET-192 (Lineage step writes no link into an original passport row)
//   SwR-DATASET-194 (Remanufacturing donor accepted for the waste status)
//   SwR-DATASET-197 (Forward link added on the original data provider's request)
//   SwR-DATASET-200 (Passport rows written only in the data provider's deployment)
//   SwR-DATASET-201 (End of the passport exempt from the successor authorisation check)
//   SwR-DATASET-202 (Repair entry stored with the repair certificate's catenaXId)
//   SwR-DATASET-203 (Successor, role and date stored with the waste status)
//   SwR-DATASET-204 (Recycling date and recycler stored as the end of the passport)
//   SwR-DATASET-205 (Original passport's status kept when a new passport supersedes it)
//   SwR-DATASET-206 (Lineage step requires the treated battery's four performance values)
//   SwR-DATASET-207 (Received notification applied only through its operation's step)
// Lessons 3 (the new passport receives a different battery model) and 13 (the confirmation of a change
// reads the wrong result) of docs/lessons-from-a-first-implementation.md.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { after, before, test } from "node:test";

import * as accessRecordRepository from "../src/access/accessRecordRepository.mjs";
import { buildMessageHeader } from "../src/connector/messageHeader.mjs";
import * as notificationPlanner from "../src/connector/notificationPlan.mjs";
import * as notificationRepository from "../src/connector/notificationRepository.mjs";
import * as companyRepository from "../src/dataset/companyRepository.mjs";
import * as catalogue from "../src/dataset/lifecycleCatalogue.mjs";
import * as recordReader from "../src/dataset/lifecycleRecordReader.mjs";
import { createLifecycleService } from "../src/dataset/lifecycleService.mjs";
import * as passportRepository from "../src/dataset/passportRepository.mjs";
import { Refusal } from "../src/dataset/refusals.mjs";
import { withTransaction } from "../src/db/transaction.mjs";
import { normaliseMessage, normaliseUuid } from "../src/identifiers.mjs";
import * as accessMapRepository from "../src/submodels/accessMapRepository.mjs";
import { createAccessMapService } from "../src/submodels/accessMapService.mjs";
import { createSchemaValidator } from "../src/validation/schemaValidator.mjs";
import { createTestDatabase } from "./support/database.mjs";

// The invented Business Partner Numbers of section 10.7 of the implementation specification.
const PROVIDER = "BPNL00000000TCK1";
const SECOND_LIFE = "BPNL00000000TCK2";
const RECYCLER = "BPNL00000000TCK3";
const SUCCESSOR = "BPNL00000000TCK4";
const PURCHASER = "BPNL00000000TCK5";
const SERVICE_PROVIDER = "BPNL00000000TCK6";
const SITE = "BPNS00000000TCK1";

const NOW = "2026-06-15T10:00:00.000Z";
const TODAY_INSTANT = "2026-06-15T09:00:00.000Z";
const TOMORROW_INSTANT = "2026-06-16T00:00:01.000Z";
const OPERATION_DATE = "2026-03-01T08:00:00.000Z";
const ORIGINAL_PURPOSE = "Traction battery of an electric vehicle";
const OTHER_PURPOSE = "Stationary storage of a home";
const ORIGINAL_MODEL = randomUUID();

const fixture = (name) => JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8"));

let current = new Date(NOW);
const clock = { now: () => new Date(current.getTime()) };
const today = () => clock.now().toISOString().slice(0, 10);
let validator;
let counter = 0;
const unique = (prefix) => `${prefix}-${process.pid}-${(counter += 1)}`;

// One deployment: a migrated schema of its own, the own company and the executor.
async function createDeployment(label, ownBpnl, { passportServiceProviderBpnl = null } = {}) {
  const database = await createTestDatabase(label);
  await companyRepository.upsertOwnCompany(database.appPool, {
    ownBpnl,
    ownLegalName: `Example Company ${ownBpnl.slice(-4)}`,
    ownLegalNameLanguage: "en",
    ownAddress: fixture("nameplate.json").AddressInformation,
    ownOperatorIdentifier: null,
  });
  const accessMaps = createAccessMapService({ repository: accessMapRepository, passportRepository, companyRepository, validator, clock });
  const lifecycle = createLifecycleService({
    repository: passportRepository,
    catalogue,
    notificationPlanner,
    notificationRepository,
    accessRecords: accessRecordRepository,
    clock,
    newUuid: randomUUID,
    ownBpnl,
    passportEndedDelaySeconds: 5,
    passportServiceProviderBpnl,
    validator,
    accessMaps,
    companyRepository,
    recordReader,
  });
  return {
    ...database,
    ownBpnl,
    lifecycle,
    accessMaps,
    operator: { kind: "operator", bpnl: ownBpnl },
    run: (work) => withTransaction(database.appPool, { actingBpnl: ownBpnl, today: today() }, work),
    query: async (sql, parameters) => (await database.adminClient.query(sql, parameters)).rows,
  };
}

// Asserts that the work rejects with the refusal id and returns the refusal.
async function refused(work, id) {
  let error;
  try {
    await work();
  } catch (caught) {
    error = caught;
  }
  assert.ok(error instanceof Refusal, `the work rejects with a refusal: ${error?.stack ?? "it resolved"}`);
  assert.equal(error.id, id, error.messages?.map((message) => message.text).join(" | "));
  return error;
}

function refusedEntry(subject, passportId, action, refusalId) {
  return { decision: "refused", requesterBpnl: subject.bpnl, requesterKind: subject.kind, passportId, action, reliedOn: null, refusalId, details: null };
}
function grantedEntry(subject, passportId, action, reliedOn, details = null) {
  return { decision: "granted", requesterBpnl: subject.bpnl, requesterKind: subject.kind, passportId, action, reliedOn, refusalId: null, details };
}

let provider;
let operator;
let recycler;
let providerModel;
let operatorModel;

async function createModel(deployment, originalModel) {
  return (await deployment.run((client) => deployment.lifecycle.createBatteryModel({ client, subject: deployment.operator, data: { manufacturerPartId: unique("TCK-PART"), ...(originalModel ? { originalModel } : {}) } }))).model;
}

async function createFirstPassport(deployment, modelId, overrides = {}) {
  const data = {
    batteryModelId: modelId,
    batteryIdentifier: unique("TCK-BATTERY"),
    batteryCategory: "ev",
    facilityBpns: SITE,
    dateOfManufacture: "2026-01-10",
    originalPurpose: ORIGINAL_PURPOSE,
    passportIdentifier: unique("TCK-PASSPORT"),
    ...overrides,
  };
  return (await deployment.run((client) => deployment.lifecycle.createFirstPassport({ client, subject: deployment.operator, data }))).passport;
}

// One predecessor entry of an original passport of the data provider TCK1.
function predecessor(overrides = {}) {
  return {
    passportIdentifier: unique("TCK-PASSPORT"),
    catenaXId: normaliseUuid(randomUUID()),
    dataProviderBpnl: PROVIDER,
    batteryIdentifier: unique("TCK-BATTERY"),
    lifeCycleStage: "original",
    originalPurpose: ORIGINAL_PURPOSE,
    originalModelCatenaXId: normaliseUuid(ORIGINAL_MODEL),
    ...overrides,
  };
}

function newPassportRequest(overrides = {}) {
  const predecessors = overrides.predecessors ?? [predecessor()];
  return {
    operation: "repurposing",
    predecessors,
    batteryModelId: operatorModel.id,
    batteryIdentifier: predecessors[0].batteryIdentifier,
    batteryCategory: "stationary",
    facilityBpns: SITE,
    purpose: OTHER_PURPOSE,
    dateOfManufacture: "2026-02-20",
    dateIntoService: "2026-03-15",
    ratedCapacityAh: 180.5,
    capacityFadePercent: 12.25,
    powerFadePercent: 8.5,
    expectedLifetimeYears: 9.5,
    operationDate: OPERATION_DATE,
    ...overrides,
  };
}

function issue(data) {
  return operator.run((client) => operator.lifecycle.issueNewPassport({ client, subject: operator.operator, data }));
}

// A received notification of the sender to the receiver, normalised as a receiving endpoint does.
function notification(operation, content, { sender, receiver = PROVIDER } = {}) {
  const header = buildMessageHeader({ operation, senderBpnl: sender, receiverBpnl: receiver, clock, newUuid: randomUUID });
  return normaliseMessage({ header, content });
}
function receive(deployment, operation, message, partner) {
  return deployment.run((client) => deployment.lifecycle.applyNotification({ client, subject: { kind: "partner", bpnl: partner }, operation, message }));
}
function wasteContent(passportIdentifier, overrides = {}) {
  return { passportIdentifier, successorBpnl: SUCCESSOR, successorRole: "producer", date: "2026-05-01T12:00:00.000Z", ...overrides };
}

async function passportRow(deployment, passportId) {
  return (await deployment.query("SELECT * FROM passports WHERE id = $1", [passportId]))[0];
}

before(async () => {
  validator = createSchemaValidator();
  provider = await createDeployment("lifecycleService_provider", PROVIDER, { passportServiceProviderBpnl: SERVICE_PROVIDER });
  operator = await createDeployment("lifecycleService_operator", SECOND_LIFE);
  recycler = await createDeployment("lifecycleService_recycler", RECYCLER);
  providerModel = await createModel(provider);
  operatorModel = await createModel(operator, { catenaXId: normaliseUuid(ORIGINAL_MODEL), manufacturerBpnl: PROVIDER });
});

after(async () => {
  for (const deployment of [provider, operator, recycler]) if (deployment) await deployment.drop();
});

test("createBatteryModel and createFirstPassport: the stored records and the audit entries", async (t) => {
  await t.test("createBatteryModel stores a battery model of the own company and writes no audit entry", async () => {
    const partId = unique("TCK-PART");
    const result = await provider.run((client) => provider.lifecycle.createBatteryModel({ client, subject: provider.operator, data: { manufacturerPartId: partId } }));
    assert.deepStrictEqual(result.auditEntries, []);
    assert.equal(result.model.manufacturerBpnl, PROVIDER);
    assert.equal(result.model.catenaXId, normaliseUuid(result.model.id));
    const [row] = await provider.query("SELECT * FROM battery_models WHERE id = $1", [result.model.id]);
    assert.equal(row.manufacturer_part_id, partId);
    assert.equal(row.original_model_catena_x_id, null);
    await refused(() => provider.run((client) => provider.lifecycle.createBatteryModel({ client, subject: provider.operator, data: { manufacturerPartId: partId } })), "ERR-LC-IDENTIFIER-EXISTS");
  });
  await t.test("SwR-DATASET-092: createFirstPassport stores the passport, its first responsibility interval and its original purpose", async () => {
    const identifier = unique("TCK-PASSPORT");
    const result = await provider.run((client) =>
      provider.lifecycle.createFirstPassport({
        client,
        subject: provider.operator,
        data: { batteryModelId: providerModel.id, batteryIdentifier: "TCK-BATTERY-FIRST", batteryCategory: "ev", facilityBpns: SITE, dateOfManufacture: "2026-01-10", originalPurpose: ORIGINAL_PURPOSE, passportIdentifier: identifier },
      }),
    );
    const passport = result.passport;
    assert.deepStrictEqual(result.auditEntries, [grantedEntry(provider.operator, passport.id, "passport.create", "data-provider")]);
    assert.equal(passport.lifecycleStatus, "original");
    assert.equal(passport.manufacturerBpnl, PROVIDER);
    assert.equal(passport.passportIdentifier, identifier);
    assert.deepStrictEqual(passport.responsibleOperator, { responsibleBpnl: PROVIDER, role: "economicOperator", validFrom: "2026-01-10T00:00:00.000Z" });
    const purposes = await provider.query("SELECT purpose, is_original, recorded_at FROM passport_purposes WHERE passport_id = $1", [passport.id]);
    assert.deepStrictEqual(purposes, [{ purpose: ORIGINAL_PURPOSE, is_original: true, recorded_at: new Date(NOW) }]);
  });
  await t.test("createFirstPassport refuses an unknown battery model and a stored passport identifier, with a refused audit entry", async () => {
    const unknown = await refused(() => createFirstPassport(provider, randomUUID()), "ERR-LC-MODEL-NOT-FOUND");
    assert.deepStrictEqual(unknown.auditEntries, [refusedEntry(provider.operator, null, "passport.create", "ERR-LC-MODEL-NOT-FOUND")]);
    const first = await createFirstPassport(provider, providerModel.id);
    await refused(() => createFirstPassport(provider, providerModel.id, { passportIdentifier: first.passportIdentifier }), "ERR-LC-IDENTIFIER-EXISTS");
  });
  await t.test("SwR-DATASET-200: a passport of another data provider is not found in the own deployment", async () => {
    const other = await createFirstPassport(provider, providerModel.id);
    await refused(
      () => operator.run((client) => operator.lifecycle.putAspectPayload({ client, subject: operator.operator, passportId: other.id, aspectKey: "product-condition", payload: fixture("productCondition.json") })),
      "ERR-LC-PASSPORT-NOT-FOUND",
    );
  });
});

test("issueNewPassport: the stored records and the six rules of section 9.2.2", async (t) => {
  await t.test("SwR-DATASET-093, SwR-DATASET-094, SwR-DATASET-102, SwR-DATASET-116 and SwR-DATASET-118: the stored records of a new passport", async () => {
    const data = newPassportRequest();
    const result = await issue(data);
    const passport = result.passport;
    assert.deepStrictEqual(result.auditEntries, [grantedEntry(operator.operator, passport.id, "passport.issue", "data-provider")]);
    const row = await passportRow(operator, passport.id);
    assert.equal(row.lifecycle_status, "repurposed");
    assert.equal(row.manufacturer_bpnl, SECOND_LIFE);
    assert.equal(row.battery_model_id, operatorModel.id);
    assert.equal(row.battery_identifier, data.batteryIdentifier);
    assert.equal(row.battery_category, "stationary");
    // The client of the superuser has no type parser of the pool, so the passport record of the pool
    // reads the date as the text YYYY-MM-DD.
    assert.equal(passport.dateIntoService, "2026-03-15");
    assert.equal(passport.dateOfManufacture, "2026-02-20");
    assert.deepStrictEqual([passport.ratedCapacityAh, passport.capacityFadePercent, passport.powerFadePercent, passport.expectedLifetimeYears], [180.5, 12.25, 8.5, 9.5]);
    assert.deepStrictEqual([row.rated_capacity_ah, row.capacity_fade_percent, row.power_fade_percent, row.expected_lifetime_years], ["180.50", "12.25", "8.50", "9.5"]);
    assert.equal(row.lineage_open, false);
    assert.notEqual(row.passport_identifier, data.predecessors[0].passportIdentifier);
    assert.match(row.passport_identifier, /^urn:uuid:[0-9a-f-]{36}$/);
    const links = await operator.query("SELECT * FROM passport_lineage_links WHERE passport_id = $1", [passport.id]);
    assert.equal(links.length, 1);
    assert.equal(links[0].predecessor_passport_identifier, data.predecessors[0].passportIdentifier);
    assert.equal(normaliseUuid(links[0].predecessor_catena_x_id), data.predecessors[0].catenaXId);
    assert.equal(links[0].predecessor_data_provider_bpnl, PROVIDER);
    assert.equal(links[0].predecessor_status, "original");
    assert.equal(links[0].operation, "repurposing");
    assert.deepStrictEqual(links[0].operation_date, new Date(OPERATION_DATE));
    const intervals = await operator.query("SELECT responsible_bpnl, role, valid_from, valid_to FROM passport_responsibility_intervals WHERE passport_id = $1", [passport.id]);
    assert.deepStrictEqual(intervals, [{ responsible_bpnl: SECOND_LIFE, role: "economicOperator", valid_from: new Date(OPERATION_DATE), valid_to: null }]);
    const purposes = await operator.query("SELECT purpose, is_original, recorded_at FROM passport_purposes WHERE passport_id = $1 ORDER BY id", [passport.id]);
    assert.deepStrictEqual(purposes, [
      { purpose: ORIGINAL_PURPOSE, is_original: true, recorded_at: new Date(OPERATION_DATE) },
      { purpose: OTHER_PURPOSE, is_original: false, recorded_at: new Date(OPERATION_DATE) },
    ]);
    assert.equal(result.notifications.length, 1);
    const [sent] = await operator.query("SELECT * FROM notifications_sent WHERE id = $1", [result.notifications[0].id]);
    assert.equal(sent.receiver_bpnl, PROVIDER);
    assert.equal(sent.outcome, "pending");
    assert.equal(sent.passport_identifier, data.predecessors[0].passportIdentifier);
    assert.deepStrictEqual(sent.not_before, new Date(NOW));
    assert.deepStrictEqual(sent.message.content, {
      passportIdentifier: row.passport_identifier,
      catenaXId: normaliseUuid(passport.id),
      operation: "repurposing",
      operationDate: OPERATION_DATE,
      predecessorPassportIdentifier: data.predecessors[0].passportIdentifier,
    });
    assert.equal(sent.message.header.senderBpn, SECOND_LIFE);
    assert.equal(sent.message.header.receiverBpn, PROVIDER);
  });
  await t.test("SwR-DATASET-095: a remanufacturing from two original passports of one data provider writes two links and two notifications", async () => {
    const predecessors = [predecessor(), predecessor()];
    const result = await issue(newPassportRequest({ operation: "remanufacturing", purpose: ORIGINAL_PURPOSE, predecessors, batteryIdentifier: unique("TCK-BATTERY") }));
    assert.equal(result.passport.lifecycleStatus, "remanufactured");
    assert.equal((await operator.query("SELECT 1 FROM passport_lineage_links WHERE passport_id = $1", [result.passport.id])).length, 2);
    assert.deepStrictEqual(
      result.notifications.map((item) => [item.receiverBpnl, item.passportIdentifier]),
      predecessors.map((item) => [PROVIDER, item.passportIdentifier]),
    );
  });
  await t.test("rule 1: an unknown battery model, a model without an original model and a model of another original model are refused", async () => {
    const unknown = await refused(() => issue(newPassportRequest({ batteryModelId: randomUUID() })), "ERR-LC-MODEL-NOT-FOUND");
    assert.deepStrictEqual(unknown.auditEntries, [refusedEntry(operator.operator, null, "passport.issue", "ERR-LC-MODEL-NOT-FOUND")]);
    const plainModel = await createModel(operator);
    await refused(() => issue(newPassportRequest({ batteryModelId: plainModel.id })), "ERR-LC-MODEL-NOT-ORIGINAL");
    const otherModel = await createModel(operator, { catenaXId: normaliseUuid(randomUUID()), manufacturerBpnl: PROVIDER });
    await refused(() => issue(newPassportRequest({ batteryModelId: otherModel.id })), "ERR-LC-MODEL-NOT-ORIGINAL");
  });
  await t.test("rule 2: a predecessor of the own database whose status or original purpose differs, or that has ended, is refused", async () => {
    const own = await createFirstPassport(operator, operatorModel.id);
    const ownEntry = (overrides) => predecessor({ passportIdentifier: own.passportIdentifier, batteryIdentifier: own.batteryIdentifier, dataProviderBpnl: SECOND_LIFE, catenaXId: own.catenaXId, ...overrides });
    await refused(() => issue(newPassportRequest({ predecessors: [ownEntry({ lifeCycleStage: "repurposed" })] })), "ERR-LC-OPERATION-NOT-ADMITTED");
    await refused(() => issue(newPassportRequest({ predecessors: [ownEntry({ originalPurpose: "Another original purpose" })] })), "ERR-LC-OPERATION-NOT-ADMITTED");
    const ended = await createFirstPassport(operator, operatorModel.id);
    await operator.run((client) => operator.lifecycle.reportEvent({ client, subject: operator.operator, operation: "PassportEnded", data: { passportIdentifier: ended.passportIdentifier, dataProviderBpnl: SECOND_LIFE, nameplateManufacturerBpnl: SECOND_LIFE, recyclingDate: TODAY_INSTANT } }));
    await refused(
      () => issue(newPassportRequest({ predecessors: [predecessor({ passportIdentifier: ended.passportIdentifier, batteryIdentifier: ended.batteryIdentifier, dataProviderBpnl: SECOND_LIFE })] })),
      "ERR-LC-OPERATION-NOT-ADMITTED",
    );
    const admitted = await issue(newPassportRequest({ predecessors: [ownEntry({ originalPurpose: `  ${ORIGINAL_PURPOSE.toUpperCase()}  ` })] }));
    assert.equal(admitted.passport.lifecycleStatus, "repurposed");
  });
  await t.test("rule 3: the admission rule of D40, the date of putting into service and the rule of the dates", async () => {
    await refused(() => issue(newPassportRequest({ purpose: ORIGINAL_PURPOSE })), "ERR-LC-OPERATION-NOT-ADMITTED");
    await refused(() => issue(newPassportRequest({ operation: "preparationForReUse", purpose: ORIGINAL_PURPOSE })), "ERR-LC-OPERATION-NOT-ADMITTED");
    await refused(() => issue(newPassportRequest({ predecessors: [predecessor({ lifeCycleStage: "waste" })] })), "ERR-LC-OPERATION-NOT-ADMITTED");
    await refused(() => issue(newPassportRequest({ dateIntoService: "2026-02-28" })), "ERR-LC-OPERATION-NOT-ADMITTED");
    const waste = await issue(newPassportRequest({ operation: "preparationForRepurposing", predecessors: [predecessor({ lifeCycleStage: "waste" })] }));
    assert.equal(waste.passport.lifecycleStatus, "repurposed");
    const reUse = await issue(newPassportRequest({ operation: "preparationForReUse", purpose: ORIGINAL_PURPOSE, predecessors: [predecessor({ lifeCycleStage: "waste" })] }));
    assert.equal(reUse.passport.lifecycleStatus, "re-used");
  });
  await t.test("the rule of the dates: an operation date one day after the current UTC date is refused, and one on the current UTC date is applied", async () => {
    await refused(() => issue(newPassportRequest({ operationDate: TOMORROW_INSTANT, dateIntoService: "2026-06-16" })), "ERR-LC-OPERATION-NOT-ADMITTED");
    const applied = await issue(newPassportRequest({ operationDate: TODAY_INSTANT, dateIntoService: "2026-06-15" }));
    assert.equal(applied.passport.responsibleOperator.validFrom, TODAY_INSTANT);
  });
  await t.test("rule 4: the identifier rule of D14 and a stored passport identifier", async () => {
    await refused(() => issue(newPassportRequest({ batteryIdentifier: unique("TCK-BATTERY") })), "ERR-LC-IDENTIFIER-RULE");
    const one = predecessor();
    await refused(() => issue(newPassportRequest({ operation: "remanufacturing", purpose: ORIGINAL_PURPOSE, predecessors: [one], batteryIdentifier: one.batteryIdentifier })), "ERR-LC-IDENTIFIER-RULE");
    const two = [predecessor(), predecessor()];
    await refused(() => issue(newPassportRequest({ operation: "repurposing", predecessors: two, batteryIdentifier: two[1].batteryIdentifier })), "ERR-LC-IDENTIFIER-RULE");
    await refused(() => issue(newPassportRequest({ predecessors: [one], passportIdentifier: one.passportIdentifier })), "ERR-LC-IDENTIFIER-RULE");
    const stored = await createFirstPassport(operator, operatorModel.id);
    await refused(() => issue(newPassportRequest({ passportIdentifier: stored.passportIdentifier })), "ERR-LC-IDENTIFIER-EXISTS");
    const named = await issue(newPassportRequest({ passportIdentifier: unique("TCK-PASSPORT-NEW") }));
    assert.match(named.passport.passportIdentifier, /^TCK-PASSPORT-NEW-/);
  });
  await t.test("a request with one predecessor named twice is refused with ERR-LC-IDENTIFIER-RULE", async () => {
    const twice = predecessor();
    const refusal = await refused(() => issue(newPassportRequest({ operation: "remanufacturing", purpose: ORIGINAL_PURPOSE, predecessors: [twice, { ...twice }], batteryIdentifier: unique("TCK-BATTERY") })), "ERR-LC-IDENTIFIER-RULE");
    assert.deepStrictEqual(refusal.auditEntries, [refusedEntry(operator.operator, null, "passport.issue", "ERR-LC-IDENTIFIER-RULE")]);
  });
  await t.test("decision D12: a predecessor of the own company gives a local received record, no notification, and a forward link that names the record", async () => {
    const own = await createFirstPassport(operator, operatorModel.id);
    const before = await passportRow(operator, own.id);
    const entry = predecessor({ passportIdentifier: own.passportIdentifier, batteryIdentifier: own.batteryIdentifier, dataProviderBpnl: SECOND_LIFE, catenaXId: own.catenaXId });
    const result = await issue(newPassportRequest({ predecessors: [entry] }));
    assert.deepStrictEqual(result.notifications, []);
    const received = await operator.query("SELECT * FROM notifications_received WHERE passport_identifier = $1", [own.passportIdentifier]);
    assert.equal(received.length, 1);
    assert.equal(received[0].operation, "NewPassportIssued");
    assert.equal(received[0].outcome, "applied");
    assert.equal(received[0].sender_bpnl, SECOND_LIFE);
    assert.equal(received[0].message.header.senderBpn, SECOND_LIFE);
    assert.equal(received[0].message.header.receiverBpn, SECOND_LIFE);
    assert.equal(received[0].message.content.predecessorPassportIdentifier, own.passportIdentifier);
    assert.equal(received[0].message.content.catenaXId, normaliseUuid(result.passport.id));
    assert.deepStrictEqual(received[0].received_at, new Date(NOW));
    assert.equal((await operator.query("SELECT 1 FROM notifications_sent WHERE receiver_bpnl = $1", [SECOND_LIFE])).length, 0);
    assert.deepStrictEqual(await passportRow(operator, own.id), before, "SwR-DATASET-192 and SwR-DATASET-205: no step writes the predecessor passport");
    const link = await operator.run((client) => operator.lifecycle.addForwardLink({ client, subject: operator.operator, passportId: own.id, messageId: received[0].message_id }));
    assert.equal(link.link.successorPassportIdentifier, result.passport.passportIdentifier);
    assert.equal(link.link.secondLifeOperatorBpnl, SECOND_LIFE);
  });
  await t.test("SwR-DATASET-206: no new passport is stored without its four performance values, whose absence the database refuses as well", async () => {
    const data = newPassportRequest();
    delete data.ratedCapacityAh;
    let error;
    try {
      await issue(data);
    } catch (caught) {
      error = caught;
    }
    assert.equal(error?.code, "P0001", "the database refuses the closing of the lineage of a new passport without the rated capacity");
    assert.ok(error.message.startsWith("ERR-DB-LINEAGE: "), error.message);
    assert.equal((await operator.query("SELECT 1 FROM passport_lineage_links WHERE predecessor_passport_identifier = $1", [data.predecessors[0].passportIdentifier])).length, 0);
  });
});

test("applyNotification: the receiving step of section 10.4 on the deployment of the data provider", async (t) => {
  await t.test("SwR-DATASET-205 and SwR-DATASET-207: NewPassportIssued stores the received record and changes no passport", async () => {
    const original = await createFirstPassport(provider, providerModel.id);
    const before = await passportRow(provider, original.id);
    const message = notification("NewPassportIssued", { passportIdentifier: unique("TCK-PASSPORT-NEW"), catenaXId: randomUUID(), operation: "repurposing", operationDate: OPERATION_DATE, predecessorPassportIdentifier: original.passportIdentifier }, { sender: SECOND_LIFE });
    const result = await receive(provider, "NewPassportIssued", message, SECOND_LIFE);
    assert.equal(result.outcome, "applied");
    assert.deepStrictEqual(result.auditEntries, [grantedEntry({ kind: "partner", bpnl: SECOND_LIFE }, original.id, "notification.apply.NewPassportIssued", "data-provider")]);
    assert.deepStrictEqual(await passportRow(provider, original.id), before);
    const [record] = await provider.query("SELECT * FROM notifications_received WHERE message_id = $1", [message.header.messageId]);
    assert.equal(record.passport_identifier, original.passportIdentifier);
    assert.equal(record.sender_bpnl, SECOND_LIFE);
    assert.deepStrictEqual(record.message, message);
    assert.deepStrictEqual(record.received_at, new Date(NOW));
    const duplicate = await receive(provider, "NewPassportIssued", { ...message, header: { ...message.header, sentDateTime: "2026-06-15T09:59:00.000Z" } }, SECOND_LIFE);
    assert.equal(duplicate.outcome, "duplicate");
    const reused = await refused(() => receive(provider, "NewPassportIssued", { ...message, content: { ...message.content, operation: "remanufacturing" } }, SECOND_LIFE), "ERR-RX-MESSAGE-ID-REUSED");
    assert.equal(reused.auditEntries[0].refusalId, "ERR-RX-MESSAGE-ID-REUSED");
    await refused(() => receive(provider, "NewPassportIssued", { ...message, header: { ...message.header, senderBpn: RECYCLER } }, RECYCLER), "ERR-RX-MESSAGE-ID-REUSED");
    const unknown = notification("NewPassportIssued", { ...message.content, predecessorPassportIdentifier: unique("TCK-UNKNOWN") }, { sender: SECOND_LIFE });
    const refusal = await refused(() => receive(provider, "NewPassportIssued", unknown, SECOND_LIFE), "ERR-RX-PASSPORT-UNKNOWN");
    assert.deepStrictEqual(refusal.auditEntries, [refusedEntry({ kind: "partner", bpnl: SECOND_LIFE }, null, "notification.apply.NewPassportIssued", "ERR-RX-PASSPORT-UNKNOWN")]);
    assert.equal((await provider.query("SELECT 1 FROM notifications_received WHERE message_id = $1", [unknown.header.messageId])).length, 0);
  });
  await t.test("SwR-DATASET-202: BatteryRepaired inserts the repair entry with its certificate and sets the status re-used, once per certificate", async () => {
    const passport = await createFirstPassport(provider, providerModel.id);
    const certificate = randomUUID();
    const first = notification("BatteryRepaired", { passportIdentifier: passport.passportIdentifier, repairDate: "2026-04-01T08:00:00.000Z", repairCertificateCatenaXId: certificate.toUpperCase() }, { sender: RECYCLER });
    assert.equal((await receive(provider, "BatteryRepaired", first, RECYCLER)).outcome, "applied");
    const second = notification("BatteryRepaired", { ...first.content }, { sender: RECYCLER });
    assert.equal((await receive(provider, "BatteryRepaired", second, RECYCLER)).outcome, "applied");
    const entries = await provider.query("SELECT * FROM passport_repair_entries WHERE passport_id = $1", [passport.id]);
    assert.equal(entries.length, 1);
    assert.equal(entries[0].repair_certificate_catena_x_id, certificate);
    assert.equal(entries[0].repairer_bpnl, RECYCLER);
    assert.equal(entries[0].notification_message_id, first.header.messageId);
    assert.deepStrictEqual(entries[0].repair_date, new Date("2026-04-01T08:00:00.000Z"));
    assert.equal((await passportRow(provider, passport.id)).lifecycle_status, "re-used");
    await refused(() => receive(provider, "BatteryRepaired", notification("BatteryRepaired", { ...first.content, passportIdentifier: unique("TCK-UNKNOWN") }, { sender: RECYCLER }), RECYCLER), "ERR-RX-PASSPORT-UNKNOWN");
  });
  await t.test("SwR-DATASET-085, SwR-DATASET-086, SwR-DATASET-191 and SwR-DATASET-203: BatteryBecameWaste records the named successor on the existing passport", async () => {
    const passport = await createFirstPassport(provider, providerModel.id);
    const message = notification("BatteryBecameWaste", wasteContent(passport.passportIdentifier), { sender: RECYCLER });
    const result = await receive(provider, "BatteryBecameWaste", message, RECYCLER);
    assert.equal(result.outcome, "applied");
    const row = await passportRow(provider, passport.id);
    assert.equal(row.lifecycle_status, "waste");
    assert.equal(row.waste_successor_bpnl, SUCCESSOR);
    assert.equal(row.waste_successor_role, "producer");
    assert.deepStrictEqual(row.waste_date, new Date("2026-05-01T12:00:00.000Z"));
    assert.equal(row.manufacturer_bpnl, PROVIDER);
    assert.equal(row.passport_identifier, passport.passportIdentifier);
    const intervals = await provider.query("SELECT responsible_bpnl, role, valid_from, valid_to FROM passport_responsibility_intervals WHERE passport_id = $1 ORDER BY valid_from", [passport.id]);
    assert.deepStrictEqual(intervals, [
      { responsible_bpnl: PROVIDER, role: "economicOperator", valid_from: new Date("2026-01-10T00:00:00Z"), valid_to: new Date("2026-05-01T12:00:00Z") },
      { responsible_bpnl: SUCCESSOR, role: "producer", valid_from: new Date("2026-05-01T12:00:00Z"), valid_to: null },
    ]);
    const records = await provider.query("SELECT recipient_bpnl, recipient_role, aspect_key, valid_from, valid_to FROM passport_access_records WHERE passport_id = $1", [passport.id]);
    assert.deepStrictEqual(records, [{ recipient_bpnl: SUCCESSOR, recipient_role: "successor", aspect_key: "lifecycle", valid_from: new Date(NOW), valid_to: null }]);
    await refused(() => receive(provider, "BatteryBecameWaste", notification("BatteryBecameWaste", wasteContent(passport.passportIdentifier), { sender: RECYCLER }), RECYCLER), "ERR-RX-STEP-REFUSED");
    await refused(
      () => receive(provider, "BatteryRepaired", notification("BatteryRepaired", { passportIdentifier: passport.passportIdentifier, repairDate: TODAY_INSTANT, repairCertificateCatenaXId: randomUUID() }, { sender: RECYCLER }), RECYCLER),
      "ERR-RX-STEP-REFUSED",
    );
  });
  await t.test("BatteryBecameWaste whose date is before the start of the open interval is refused, and one that names no own passport is recorded", async () => {
    const passport = await createFirstPassport(provider, providerModel.id);
    const early = notification("BatteryBecameWaste", wasteContent(passport.passportIdentifier, { date: "2026-01-09T23:59:59.000Z" }), { sender: RECYCLER });
    const refusal = await refused(() => receive(provider, "BatteryBecameWaste", early, RECYCLER), "ERR-RX-STEP-REFUSED");
    assert.deepStrictEqual(refusal.auditEntries, [refusedEntry({ kind: "partner", bpnl: RECYCLER }, passport.id, "notification.apply.BatteryBecameWaste", "ERR-RX-STEP-REFUSED")]);
    const foreign = notification("BatteryBecameWaste", wasteContent(unique("TCK-FOREIGN")), { sender: RECYCLER });
    const recorded = await receive(provider, "BatteryBecameWaste", foreign, RECYCLER);
    assert.equal(recorded.outcome, "recorded");
    assert.deepStrictEqual(recorded.auditEntries, []);
    const [record] = await provider.query("SELECT outcome FROM notifications_received WHERE message_id = $1", [foreign.header.messageId]);
    assert.equal(record.outcome, "recorded");
  });
  await t.test("SwR-DATASET-089, SwR-DATASET-201 and SwR-DATASET-204: PassportEnded ends the passport in every status and plans the notice of D34", async () => {
    const plain = await createFirstPassport(provider, providerModel.id);
    const certificate = randomUUID();
    const ended = notification("PassportEnded", { passportIdentifier: plain.passportIdentifier, recyclingDate: "2026-06-01T08:00:00.000Z", recyclerBpnl: RECYCLER, materialRecyclingCertificateCatenaXId: certificate }, { sender: RECYCLER });
    const result = await receive(provider, "PassportEnded", ended, RECYCLER);
    assert.equal(result.outcome, "applied");
    assert.deepStrictEqual(result.auditEntries, [grantedEntry({ kind: "partner", bpnl: RECYCLER }, plain.id, "notification.apply.PassportEnded", "data-provider")]);
    const row = await passportRow(provider, plain.id);
    assert.equal(row.lifecycle_status, "original");
    assert.deepStrictEqual(row.recycling_date, new Date("2026-06-01T08:00:00.000Z"));
    assert.equal(row.recycler_bpnl, RECYCLER);
    assert.equal(row.material_recycling_certificate_catena_x_id, certificate);
    assert.deepStrictEqual(
      result.notifications.map((item) => [item.receiverBpnl, item.passportIdentifier, item.notBefore]),
      [[SERVICE_PROVIDER, plain.passportIdentifier, "2026-06-15T10:00:05.000Z"]],
    );
    const [sent] = await provider.query("SELECT message FROM notifications_sent WHERE id = $1", [result.notifications[0].id]);
    assert.deepStrictEqual(sent.message.content, ended.content);
    assert.equal(sent.message.header.senderBpn, PROVIDER);
    await refused(() => receive(provider, "PassportEnded", notification("PassportEnded", ended.content, { sender: RECYCLER }), RECYCLER), "ERR-RX-STEP-REFUSED");

    const waste = await createFirstPassport(provider, providerModel.id);
    await receive(provider, "BatteryBecameWaste", notification("BatteryBecameWaste", wasteContent(waste.passportIdentifier), { sender: RECYCLER }), RECYCLER);
    const tooEarly = notification("PassportEnded", { passportIdentifier: waste.passportIdentifier, recyclingDate: "2026-04-30T08:00:00.000Z", recyclerBpnl: RECYCLER }, { sender: RECYCLER });
    await refused(() => receive(provider, "PassportEnded", tooEarly, RECYCLER), "ERR-RX-STEP-REFUSED");
    const end = await receive(provider, "PassportEnded", notification("PassportEnded", { ...tooEarly.content, recyclingDate: "2026-06-01T08:00:00.000Z" }, { sender: RECYCLER }), RECYCLER);
    assert.deepStrictEqual(end.auditEntries, [grantedEntry({ kind: "partner", bpnl: RECYCLER }, waste.id, "notification.apply.PassportEnded", "end-of-passport-exemption")]);
    assert.equal((await passportRow(provider, waste.id)).lifecycle_status, "waste");

    const foreign = await receive(provider, "PassportEnded", notification("PassportEnded", { ...tooEarly.content, passportIdentifier: unique("TCK-FOREIGN") }, { sender: RECYCLER }), RECYCLER);
    assert.equal(foreign.outcome, "recorded");
    assert.deepStrictEqual(foreign.notifications, []);
  });
  await t.test("the rule of the dates: each of the four operations with a date one day after the current UTC date is refused, and on the current UTC date is applied", async () => {
    const cases = [
      ["NewPassportIssued", (passport, date) => ({ passportIdentifier: unique("TCK-NEW"), catenaXId: randomUUID(), operation: "repurposing", operationDate: date, predecessorPassportIdentifier: passport.passportIdentifier })],
      ["BatteryRepaired", (passport, date) => ({ passportIdentifier: passport.passportIdentifier, repairDate: date, repairCertificateCatenaXId: randomUUID() })],
      ["BatteryBecameWaste", (passport, date) => wasteContent(passport.passportIdentifier, { date })],
      ["PassportEnded", (passport, date) => ({ passportIdentifier: passport.passportIdentifier, recyclingDate: date, recyclerBpnl: RECYCLER })],
    ];
    for (const [operation, content] of cases) {
      const passport = await createFirstPassport(provider, providerModel.id);
      await refused(() => receive(provider, operation, notification(operation, content(passport, TOMORROW_INSTANT), { sender: RECYCLER }), RECYCLER), "ERR-RX-STEP-REFUSED");
      assert.equal((await receive(provider, operation, notification(operation, content(passport, TODAY_INSTANT), { sender: RECYCLER }), RECYCLER)).outcome, "applied", operation);
    }
  });
  await t.test("SwR-DATASET-194: a remanufacturing donor of the own database accepts the status waste after the new passport", async () => {
    const donor = await createFirstPassport(operator, operatorModel.id);
    await issue(
      newPassportRequest({
        operation: "remanufacturing",
        purpose: ORIGINAL_PURPOSE,
        predecessors: [predecessor({ passportIdentifier: donor.passportIdentifier, batteryIdentifier: donor.batteryIdentifier, dataProviderBpnl: SECOND_LIFE }), predecessor()],
        batteryIdentifier: unique("TCK-BATTERY"),
      }),
    );
    const message = notification("BatteryBecameWaste", wasteContent(donor.passportIdentifier), { sender: RECYCLER, receiver: SECOND_LIFE });
    assert.equal((await receive(operator, "BatteryBecameWaste", message, RECYCLER)).outcome, "applied");
    assert.equal((await passportRow(operator, donor.id)).lifecycle_status, "waste");
  });
});

test("reportEvent: the sending side and the local application of decision D12", async (t) => {
  const report = (deployment, operation, data) => deployment.run((client) => deployment.lifecycle.reportEvent({ client, subject: deployment.operator, operation, data }));
  await t.test("the recycler plans BatteryRepaired, BatteryBecameWaste and PassportEnded for the receivers of section 10.3 and writes no passport", async () => {
    const repair = await report(recycler, "BatteryRepaired", { passportIdentifier: "TCK-PASSPORT-X", dataProviderBpnl: PROVIDER, repairDate: TODAY_INSTANT, repairCertificateCatenaXId: randomUUID() });
    assert.deepStrictEqual(repair.notifications.map((item) => [item.operation, item.receiverBpnl, item.notBefore]), [["BatteryRepaired", PROVIDER, NOW]]);
    assert.deepStrictEqual(repair.auditEntries, []);
    const waste = await report(recycler, "BatteryBecameWaste", { passportIdentifier: "TCK-PASSPORT-X", dataProviderBpnl: PROVIDER, successorBpnl: SUCCESSOR, successorRole: "producer", wasteDate: TODAY_INSTANT });
    assert.deepStrictEqual(waste.notifications.map((item) => item.receiverBpnl), [PROVIDER, SUCCESSOR]);
    const ended = await report(recycler, "PassportEnded", { passportIdentifier: "TCK-PASSPORT-X", dataProviderBpnl: SECOND_LIFE, nameplateManufacturerBpnl: PROVIDER, recyclingDate: TODAY_INSTANT, predecessorDataProviderBpnls: [PURCHASER] });
    assert.deepStrictEqual(ended.notifications.map((item) => [item.receiverBpnl, item.notBefore]), [
      [SECOND_LIFE, "2026-06-15T10:00:05.000Z"],
      [PROVIDER, "2026-06-15T10:00:05.000Z"],
      [PURCHASER, "2026-06-15T10:00:05.000Z"],
    ]);
    const [sent] = await recycler.query("SELECT message FROM notifications_sent WHERE id = $1", [ended.notifications[0].id]);
    assert.deepStrictEqual(sent.message.content, { passportIdentifier: "TCK-PASSPORT-X", recyclingDate: TODAY_INSTANT, recyclerBpnl: RECYCLER });
    assert.equal((await recycler.query("SELECT 1 FROM passports")).length, 0);
  });
  await t.test("decision D12: a report on a passport of the own company applies the step locally and plans no notification to the own company", async () => {
    const passport = await createFirstPassport(provider, providerModel.id);
    const result = await report(provider, "BatteryBecameWaste", { passportIdentifier: passport.passportIdentifier, dataProviderBpnl: PROVIDER, successorBpnl: SUCCESSOR, successorRole: "wasteManagementOperator", wasteDate: TODAY_INSTANT });
    assert.deepStrictEqual(result.notifications.map((item) => item.receiverBpnl), [SUCCESSOR]);
    assert.deepStrictEqual(result.auditEntries, [grantedEntry(provider.operator, passport.id, "notification.apply.BatteryBecameWaste", "data-provider")]);
    assert.equal((await passportRow(provider, passport.id)).waste_successor_role, "wasteManagementOperator");
    assert.equal((await provider.query("SELECT 1 FROM notifications_received WHERE passport_identifier = $1", [passport.passportIdentifier])).length, 0);
    const end = await report(provider, "PassportEnded", { passportIdentifier: passport.passportIdentifier, dataProviderBpnl: PROVIDER, nameplateManufacturerBpnl: PROVIDER, recyclingDate: TODAY_INSTANT });
    assert.deepStrictEqual(end.notifications.map((item) => item.receiverBpnl), [SERVICE_PROVIDER]);
    assert.deepStrictEqual(end.auditEntries, [grantedEntry(provider.operator, passport.id, "notification.apply.PassportEnded", "end-of-passport-exemption")]);
    await refused(() => report(provider, "BatteryRepaired", { passportIdentifier: passport.passportIdentifier, dataProviderBpnl: PROVIDER, repairDate: TODAY_INSTANT, repairCertificateCatenaXId: randomUUID() }), "ERR-LC-PASSPORT-ENDED");
  });
  await t.test("a local application maps a refused step to ERR-LC-STATUS-NOT-ADMITTED, and an unknown own passport to ERR-LC-PASSPORT-NOT-FOUND", async () => {
    const passport = await createFirstPassport(provider, providerModel.id);
    await refused(() => report(provider, "BatteryRepaired", { passportIdentifier: passport.passportIdentifier, dataProviderBpnl: PROVIDER, repairDate: TOMORROW_INSTANT, repairCertificateCatenaXId: randomUUID() }), "ERR-LC-STATUS-NOT-ADMITTED");
    await report(provider, "BatteryBecameWaste", { passportIdentifier: passport.passportIdentifier, dataProviderBpnl: PROVIDER, successorBpnl: SUCCESSOR, successorRole: "producer", wasteDate: TODAY_INSTANT });
    await refused(() => report(provider, "BatteryRepaired", { passportIdentifier: passport.passportIdentifier, dataProviderBpnl: PROVIDER, repairDate: TODAY_INSTANT, repairCertificateCatenaXId: randomUUID() }), "ERR-LC-STATUS-NOT-ADMITTED");
    await refused(() => report(provider, "BatteryRepaired", { passportIdentifier: unique("TCK-UNKNOWN"), dataProviderBpnl: PROVIDER, repairDate: TODAY_INSTANT, repairCertificateCatenaXId: randomUUID() }), "ERR-LC-PASSPORT-NOT-FOUND");
  });
});

test("addForwardLink, recordSuccessorAuthorisation and putAspectPayload: the rule after the waste status and the rule after the end", async (t) => {
  const put = (passportId, aspectKey, payload) => provider.run((client) => provider.lifecycle.putAspectPayload({ client, subject: provider.operator, passportId, aspectKey, payload }));
  const authorise = (passportId, data) => provider.run((client) => provider.lifecycle.recordSuccessorAuthorisation({ client, subject: provider.operator, passportId, data }));
  const wastePassport = async () => {
    const passport = await createFirstPassport(provider, providerModel.id);
    await receive(provider, "BatteryBecameWaste", notification("BatteryBecameWaste", wasteContent(passport.passportIdentifier), { sender: RECYCLER }), RECYCLER);
    return passport;
  };

  await t.test("SwR-DATASET-197: addForwardLink inserts one successor link from a received NewPassportIssued, and a second call returns the stored link", async () => {
    const original = await createFirstPassport(provider, providerModel.id);
    const newId = randomUUID();
    const message = notification("NewPassportIssued", { passportIdentifier: unique("TCK-NEW"), catenaXId: newId, operation: "remanufacturing", operationDate: OPERATION_DATE, predecessorPassportIdentifier: original.passportIdentifier }, { sender: SECOND_LIFE });
    await receive(provider, "NewPassportIssued", message, SECOND_LIFE);
    const unknown = await refused(() => provider.run((client) => provider.lifecycle.addForwardLink({ client, subject: provider.operator, passportId: original.id, messageId: randomUUID() })), "ERR-LC-NOTIFICATION-UNKNOWN");
    assert.deepStrictEqual(unknown.auditEntries, [refusedEntry(provider.operator, original.id, "forward-link.add", "ERR-LC-NOTIFICATION-UNKNOWN")]);
    const first = await provider.run((client) => provider.lifecycle.addForwardLink({ client, subject: provider.operator, passportId: original.id, messageId: message.header.messageId.toUpperCase().replace("URN:UUID:", "") }));
    assert.equal(first.created, true);
    assert.deepStrictEqual(first.auditEntries, [grantedEntry(provider.operator, original.id, "forward-link.add", "data-provider")]);
    assert.equal(first.link.successorPassportIdentifier, message.content.passportIdentifier);
    assert.equal(first.link.successorCatenaXId, normaliseUuid(newId));
    assert.equal(first.link.secondLifeOperatorBpnl, SECOND_LIFE);
    assert.equal(first.link.operation, "remanufacturing");
    assert.equal(first.link.operationDate, OPERATION_DATE);
    const second = await provider.run((client) => provider.lifecycle.addForwardLink({ client, subject: provider.operator, passportId: original.id, messageId: message.header.messageId }));
    assert.equal(second.created, false);
    assert.deepStrictEqual(second.link, first.link);
    assert.equal((await provider.query("SELECT 1 FROM passport_successor_links WHERE passport_id = $1", [original.id])).length, 1);
    assert.equal((await passportRow(provider, original.id)).lifecycle_status, "original", "SwR-DATASET-098: the original passport is kept");
  });
  await t.test("decision D18: recordSuccessorAuthorisation refuses a passport that is not waste and records each replaced authorisation in its audit entry", async () => {
    const plain = await createFirstPassport(provider, providerModel.id);
    await refused(() => authorise(plain.id, { authorisationRef: "TCK-AUTHORISATION-1", validFrom: "2026-06-01" }), "ERR-LC-STATUS-NOT-ADMITTED");
    const passport = await wastePassport();
    const first = await authorise(passport.id, { authorisationRef: "TCK-AUTHORISATION-1", validFrom: "2026-06-01", validTo: "2026-06-30" });
    assert.deepStrictEqual(first.auditEntries, [
      grantedEntry(provider.operator, passport.id, "successor-authorisation.record", "data-provider", { previous: null, recorded: { authorisationRef: "TCK-AUTHORISATION-1", validFrom: "2026-06-01", validTo: "2026-06-30" } }),
    ]);
    const second = await authorise(passport.id, { authorisationRef: "TCK-AUTHORISATION-2", validFrom: "2026-06-10" });
    assert.deepStrictEqual(second.auditEntries[0].details, {
      previous: { authorisationRef: "TCK-AUTHORISATION-1", validFrom: "2026-06-01", validTo: "2026-06-30" },
      recorded: { authorisationRef: "TCK-AUTHORISATION-2", validFrom: "2026-06-10", validTo: null },
    });
    assert.deepStrictEqual(second.passport.successorAuthorisation, { authorisationRef: "TCK-AUTHORISATION-2", validFrom: "2026-06-10", validTo: null });
    await refused(() => authorise(passport.id, { authorisationRef: "TCK-AUTHORISATION-3", validFrom: "2026-06-10", validTo: "2026-06-09" }), "ERR-LC-BODY-INVALID");
  });
  await t.test("SwR-DATASET-119 and decision D18: a write on a waste passport needs an authorisation of the successor in force on the current UTC date", async () => {
    const passport = await wastePassport();
    const payload = fixture("productCondition.json");
    const missing = await refused(() => put(passport.id, "product-condition", payload), "ERR-LC-SUCCESSOR-AUTHORISATION-MISSING");
    assert.deepStrictEqual(missing.auditEntries, [refusedEntry(provider.operator, passport.id, "aspect.put", "ERR-LC-SUCCESSOR-AUTHORISATION-MISSING")]);
    await authorise(passport.id, { authorisationRef: "TCK-AUTHORISATION-FUTURE", validFrom: "2026-06-16" });
    await refused(() => put(passport.id, "product-condition", payload), "ERR-LC-SUCCESSOR-AUTHORISATION-MISSING");
    await authorise(passport.id, { authorisationRef: "TCK-AUTHORISATION-TODAY", validFrom: "2026-06-15", validTo: "2026-06-15" });
    const admitted = await put(passport.id, "product-condition", payload);
    assert.deepStrictEqual(admitted.auditEntries, [grantedEntry(provider.operator, passport.id, "aspect.put", "successor-authorisation:TCK-AUTHORISATION-TODAY")]);
    await authorise(passport.id, { authorisationRef: "TCK-AUTHORISATION-PAST", validFrom: "2026-06-01", validTo: "2026-06-14" });
    await refused(() => put(passport.id, "product-condition", payload), "ERR-LC-SUCCESSOR-AUTHORISATION-MISSING");
    await refused(() => provider.run((client) => provider.lifecycle.addForwardLink({ client, subject: provider.operator, passportId: passport.id, messageId: randomUUID() })), "ERR-LC-SUCCESSOR-AUTHORISATION-MISSING");
  });
  await t.test("the rule after the end precedes the rule after the waste status", async () => {
    const passport = await wastePassport();
    await receive(provider, "PassportEnded", notification("PassportEnded", { passportIdentifier: passport.passportIdentifier, recyclingDate: TODAY_INSTANT, recyclerBpnl: RECYCLER }, { sender: RECYCLER }), RECYCLER);
    const ended = await refused(() => put(passport.id, "product-condition", fixture("productCondition.json")), "ERR-LC-PASSPORT-ENDED");
    assert.deepStrictEqual(ended.auditEntries, [refusedEntry(provider.operator, passport.id, "aspect.put", "ERR-LC-PASSPORT-ENDED")]);
    await refused(() => authorise(passport.id, { authorisationRef: "TCK-AUTHORISATION-1", validFrom: "2026-06-01" }), "ERR-LC-PASSPORT-ENDED");
    await refused(() => provider.run((client) => provider.lifecycle.addForwardLink({ client, subject: provider.operator, passportId: passport.id, messageId: randomUUID() })), "ERR-LC-PASSPORT-ENDED");
  });
  await t.test("putAspectPayload refuses an unknown aspect key and a payload that fails its stored schema, and stores a valid payload", async () => {
    const passport = await createFirstPassport(provider, providerModel.id);
    await refused(() => put(passport.id, "lifecycle", {}), "ERR-LC-ASPECT-KEY-UNKNOWN");
    const invalid = await refused(() => put(passport.id, "product-condition", { NumberOfFullCycles: "many" }), "ERR-LC-BODY-INVALID");
    assert.ok(invalid.messages.length > 1, "the refusal names the validator errors");
    const stored = await put(passport.id, "product-condition", fixture("productCondition.json"));
    assert.deepStrictEqual(stored.passport.storedAspectKeys, ["product-condition"]);
    assert.deepStrictEqual(stored.auditEntries, [grantedEntry(provider.operator, passport.id, "aspect.put", "data-provider")]);
    const [row] = await provider.query("SELECT payload, updated_at FROM passport_aspect_payloads WHERE passport_id = $1", [passport.id]);
    assert.deepStrictEqual(row.payload, fixture("productCondition.json"));
    assert.deepStrictEqual(row.updated_at, new Date(NOW));
    await put(passport.id, "serial-part", { anything: ["is", "stored", "unchecked"] });
  });
  await t.test("decision D45: a payload that the current access map of the battery model does not cover is refused", async () => {
    const model = await createModel(provider);
    const passport = await createFirstPassport(provider, model.id);
    await provider.run((client) => provider.accessMaps.putAccessMap({ client, modelId: model.id, map: fixture("accessMap.json") }));
    const covered = await put(passport.id, "digital-nameplate", fixture("nameplate.json"));
    assert.deepStrictEqual(covered.passport.storedAspectKeys, ["digital-nameplate"]);
    const uncovered = { ...fixture("productCondition.json"), StateOfCertifiedEnergy: { StateOfCertifiedEnergyValue: 91, LastUpdate: "2026-06-01T10:00:00Z" } };
    const refusal = await refused(() => put(passport.id, "product-condition", uncovered), "ERR-LC-ACCESS-MAP-INCOMPLETE");
    assert.ok(refusal.messages.some((message) => message.text.includes("/StateOfCertifiedEnergy/StateOfCertifiedEnergyValue")), JSON.stringify(refusal.messages));
  });
});
