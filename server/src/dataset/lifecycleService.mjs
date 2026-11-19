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

// Requirements: SwR-DATASET-085 (Status waste set on the existing dataset without a new passport),
// SwR-DATASET-086 (Change to waste accepted only with a named responsible successor), SwR-DATASET-089
// (Recycling ends the dataset, no longer current and closed to change), SwR-DATASET-092 (Original
// purpose and each later purpose recorded with their dates), SwR-DATASET-093 (New dataset created for a
// treated battery placed on the market again), SwR-DATASET-094 (New dataset carries a resolving link to
// the original passport), SwR-DATASET-095 (Remanufactured dataset links the passport of every original
// battery), SwR-DATASET-096 (Re-use and repurposing datasets accepted only with one or more links),
// SwR-DATASET-098 (Original dataset kept and marked as superseded by the new one), SwR-DATASET-100 (New
// dataset given an identifier different from every original), SwR-DATASET-102 (New dataset fields set
// at the issue of a new passport), SwR-DATASET-116 (Responsibility of a new dataset given to the
// operator placing it again), SwR-DATASET-118 (Operator placing a treated battery named its
// manufacturer), SwR-DATASET-119 (Changes applied only for the responsible or an authorised operator),
// delivered in part by decision D18, SwR-DATASET-191 (Waste step records the named successor, never the
// actor as manufacturer), SwR-DATASET-192 (Lineage step writes no link into an original passport row),
// SwR-DATASET-194 (Remanufacturing donor accepted for the waste status), SwR-DATASET-197 (Forward link
// added on the original data provider's request), SwR-DATASET-200 (Passport rows written only in the
// data provider's deployment), delivered in part by decision D6, SwR-DATASET-201 (End of the passport
// exempt from the successor authorisation check), SwR-DATASET-202 (Repair entry stored with the repair
// certificate's catenaXId), SwR-DATASET-203 (Successor, role and date stored with the waste status),
// SwR-DATASET-204 (Recycling date and recycler stored as the end of the passport), SwR-DATASET-205
// (Original passport's status kept when a new passport supersedes it), SwR-DATASET-206 (Lineage step
// requires the treated battery's four performance values) and SwR-DATASET-207 (Received notification
// applied only through its operation's step). Decisions D6, D12, D13, D14, D15, D17, D18, D19 [waits
// for the owner], D20, D34 [waits for the owner], D35, D40, D45, D53, D54, D55 and D65 [waits for the
// owner]. Sections 9.2.2, 10.3 and 10.4 of docs/architecture/implementation_plan.md.
// The one module that changes a passport: the lifecycle executor (EL-DATASET, the battery passport
// dataset). Every function receives the client of the transaction of its caller and holds no SQL.
import { isDeepStrictEqual } from "node:util";

import { buildMessageHeader } from "../connector/messageHeader.mjs";
import { normaliseUuid, toUuidColumn } from "../identifiers.mjs";
import { STORED_ASPECT_KEYS } from "../submodels/submodelService.mjs";
import { validatorMessages } from "../validation/schemaValidator.mjs";
import { applyGovernedElements } from "./governedElements.mjs";
import { Refusal } from "./refusals.mjs";

const ECONOMIC_OPERATOR = "economicOperator";

const utcDate = (value) => new Date(value).toISOString().slice(0, 10);
const instant = (value) => new Date(value).toISOString();

// The record of a battery model in an answer of the operator endpoints.
export function batteryModelOf(row) {
  return {
    id: row.id,
    catenaXId: normaliseUuid(row.id),
    manufacturerBpnl: row.manufacturer_bpnl,
    manufacturerPartId: row.manufacturer_part_id,
    originalModel:
      row.original_model_catena_x_id === null ? null : { catenaXId: normaliseUuid(row.original_model_catena_x_id), manufacturerBpnl: row.original_model_manufacturer_bpnl },
  };
}

// The record of a pending notification in the field notifications of section 9.3.
export function notificationOf(row) {
  return {
    id: row.id,
    messageId: row.message_id,
    operation: row.operation,
    receiverBpnl: row.receiver_bpnl,
    passportIdentifier: row.passport_identifier,
    outcome: row.outcome,
    notBefore: row.not_before.toISOString(),
  };
}

// Returns the lifecycle executor. The parameter repository is the module passportRepository.mjs, the
// parameter catalogue the module lifecycleCatalogue.mjs, the parameter notificationPlanner the module
// notificationPlan.mjs, the parameter notificationRepository the module notificationRepository.mjs and
// the parameter accessRecords the module accessRecordRepository.mjs. The parameters validator,
// accessMaps, companyRepository and recordReader are the schema validator, the access map service, the
// module companyRepository.mjs and the module lifecycleRecordReader.mjs.
export function createLifecycleService({
  repository,
  catalogue,
  notificationPlanner,
  notificationRepository,
  accessRecords,
  clock,
  newUuid,
  ownBpnl,
  passportEndedDelaySeconds,
  passportServiceProviderBpnl,
  validator,
  accessMaps,
  companyRepository,
  recordReader,
}) {
  const now = () => clock.now();
  const today = () => clock.now().toISOString().slice(0, 10);

  function auditEntry(subject, passportId, action, decision, { reliedOn = null, refusalId = null, details = null } = {}) {
    return { decision, requesterBpnl: subject.bpnl, requesterKind: subject.kind, passportId: passportId ?? null, action, reliedOn, refusalId, details };
  }

  function refusal(id, { subject, passportId, action, messages = [] }) {
    return new Refusal(id, { messages, auditEntries: [auditEntry(subject, passportId, action, "refused", { refusalId: id })] });
  }

  // The reference of the authorisation of the successor that is in force on the current UTC date, or
  // null (decision D18).
  function authorisationInForce(passport) {
    const date = today();
    if (passport.successor_authorisation_valid_from === null || passport.successor_authorisation_valid_from > date) return null;
    if (passport.successor_authorisation_valid_to !== null && passport.successor_authorisation_valid_to < date) return null;
    return passport.successor_authorisation_ref;
  }

  // The rule after the end, then the rule after the waste status (section 9.2.2). Returns what the
  // granted decision relies on.
  function writeDecision(passport, { subject, action, endOfPassport = false }) {
    if (passport.recycling_date !== null) throw refusal("ERR-LC-PASSPORT-ENDED", { subject, passportId: passport.id, action });
    if (passport.lifecycle_status !== "waste") return "data-provider";
    if (endOfPassport) return "end-of-passport-exemption";
    const reference = authorisationInForce(passport);
    if (reference === null) throw refusal("ERR-LC-SUCCESSOR-AUTHORISATION-MISSING", { subject, passportId: passport.id, action });
    return `successor-authorisation:${reference}`;
  }

  async function passportForWrite(client, passportId, { subject, action }) {
    const passport = await repository.findPassportForUpdate(client, passportId);
    if (passport === null) throw refusal("ERR-LC-PASSPORT-NOT-FOUND", { subject, passportId, action });
    return passport;
  }

  // Writes one pending notification per entry of the plan and returns the field notifications.
  async function storePlan(client, plan, notBefore) {
    const notifications = [];
    for (const entry of plan) {
      const header = buildMessageHeader({ operation: entry.operation, senderBpnl: ownBpnl, receiverBpnl: entry.receiverBpnl, clock, newUuid });
      const row = await notificationRepository.insertSentNotification(client, {
        messageId: header.messageId,
        operation: entry.operation,
        receiverBpnl: entry.receiverBpnl,
        passportIdentifier: entry.passportIdentifier,
        message: { header, content: entry.content },
        notBefore,
      });
      notifications.push(notificationOf(row));
    }
    return notifications;
  }

  function endNoticeTime() {
    return new Date(now().getTime() + passportEndedDelaySeconds * 1000);
  }

  // The refusal of the step of section 10.4 for a passport of the own company, or null when the step is
  // admitted: "ended" for a passport that has ended, and "state" for every other refusal of the step.
  async function stepRefusal(client, operation, passport, content) {
    const dateProperty = catalogue.OPERATIONS[operation].dateProperty;
    if (operation !== "NewPassportIssued" && passport.recycling_date !== null) return "ended";
    if (utcDate(content[dateProperty]) > today()) return "state";
    if (operation === "NewPassportIssued") return null;
    if (operation === "BatteryRepaired" || operation === "BatteryBecameWaste") {
      if (passport.lifecycle_status === "waste") return "state";
    }
    const openInterval = await repository.findOpenResponsibilityInterval(client, passport.id);
    const stepDate = new Date(content[dateProperty]);
    if (operation === "BatteryBecameWaste" && openInterval !== null && stepDate < openInterval.valid_from) return "state";
    if (operation === "PassportEnded") {
      if (passport.waste_date !== null && stepDate < passport.waste_date) return "state";
      if (openInterval !== null && stepDate < openInterval.valid_from) return "state";
    }
    return null;
  }

  // Applies the step of section 10.4 to a passport of the own company and returns what the decision
  // relies on.
  async function applyStep(client, { operation, passport, content, senderBpnl, messageId }) {
    switch (operation) {
      case "NewPassportIssued":
        return "data-provider";
      case "BatteryRepaired": {
        const certificate = toUuidColumn(content.repairCertificateCatenaXId);
        if ((await repository.findRepairEntryByCertificate(client, passport.id, certificate)) === null) {
          await repository.insertRepairEntry(client, {
            passportId: passport.id,
            repairDate: content.repairDate,
            repairCertificateCatenaXId: certificate,
            repairerBpnl: senderBpnl,
            notificationMessageId: messageId,
          });
        }
        await repository.setLifecycleStatus(client, passport.id, "re-used");
        return "data-provider";
      }
      case "BatteryBecameWaste": {
        await repository.setWasteStatus(client, passport.id, { successorBpnl: content.successorBpnl, successorRole: content.successorRole, date: content.date });
        await repository.closeOpenResponsibilityInterval(client, passport.id, content.date);
        await repository.insertResponsibilityInterval(client, { passportId: passport.id, responsibleBpnl: content.successorBpnl, role: content.successorRole, validFrom: content.date });
        await accessRecords.insertAccessRecord(client, {
          passportId: passport.id,
          recipientBpnl: content.successorBpnl,
          recipientRole: "successor",
          aspectKey: "lifecycle",
          validFrom: now(),
        });
        return "data-provider";
      }
      case "PassportEnded": {
        await repository.setEndOfPassport(client, passport.id, {
          recyclingDate: content.recyclingDate,
          recyclerBpnl: content.recyclerBpnl,
          certificateCatenaXId: content.materialRecyclingCertificateCatenaXId === undefined ? null : toUuidColumn(content.materialRecyclingCertificateCatenaXId),
        });
        return passport.lifecycle_status === "waste" ? "end-of-passport-exemption" : "data-provider";
      }
      default:
        throw new TypeError("applyStep needs one of the four operations");
    }
  }

  // The PassportEnded notice for the passport service provider of decision D34 [waits for the owner],
  // after the deployment of the data provider has recorded the end of a passport.
  function passportServiceProviderPlan(content) {
    return notificationPlanner.buildNotificationPlan({
      operation: "PassportEnded",
      content,
      receivers: notificationPlanner.passportServiceProviderReceivers({ passportServiceProviderBpnl, passportIdentifier: content.passportIdentifier }),
      ownBpnl,
    });
  }

  async function createBatteryModel({ client, data }) {
    if ((await repository.findBatteryModelByPartId(client, data.manufacturerPartId)) !== null) throw new Refusal("ERR-LC-IDENTIFIER-EXISTS");
    const row = await repository.insertBatteryModel(client, {
      manufacturerBpnl: ownBpnl,
      manufacturerPartId: data.manufacturerPartId,
      originalModelCatenaXId: data.originalModel ? toUuidColumn(data.originalModel.catenaXId) : null,
      originalModelManufacturerBpnl: data.originalModel ? data.originalModel.manufacturerBpnl : null,
    });
    return { model: batteryModelOf(row), auditEntries: [] };
  }

  async function createFirstPassport({ client, subject, data }) {
    const action = "passport.create";
    if ((await repository.findBatteryModel(client, data.batteryModelId)) === null) throw refusal("ERR-LC-MODEL-NOT-FOUND", { subject, action });
    if (data.passportIdentifier !== undefined && (await repository.passportIdentifierExists(client, data.passportIdentifier))) {
      throw refusal("ERR-LC-IDENTIFIER-EXISTS", { subject, action });
    }
    const columns = {
      manufacturer_bpnl: ownBpnl,
      battery_model_id: data.batteryModelId,
      lifecycle_status: "original",
      battery_identifier: data.batteryIdentifier,
      battery_category: data.batteryCategory,
      facility_bpns: data.facilityBpns,
      date_of_manufacture: data.dateOfManufacture,
      date_into_service: data.dateIntoService ?? null,
    };
    if (data.passportIdentifier !== undefined) columns.passport_identifier = data.passportIdentifier;
    const passport = await repository.insertPassport(client, columns);
    await repository.insertResponsibilityInterval(client, {
      passportId: passport.id,
      responsibleBpnl: ownBpnl,
      role: ECONOMIC_OPERATOR,
      validFrom: `${data.dateOfManufacture}T00:00:00Z`,
    });
    await repository.insertPurpose(client, { passportId: passport.id, purpose: data.originalPurpose, isOriginal: true, recordedAt: now() });
    return {
      passport: await recordReader.readPassportRecord({ client, passportId: passport.id }),
      auditEntries: [auditEntry(subject, passport.id, action, "granted", { reliedOn: "data-provider" })],
    };
  }

  async function issueNewPassport({ client, subject, data }) {
    const action = "passport.issue";
    const refuse = (id, messages) => refusal(id, { subject, action, messages });
    const operationDate = data.operationDate === undefined ? now().toISOString() : instant(data.operationDate);

    // Rule 1: the battery model exists and references the original battery model of a predecessor (D35).
    const model = await repository.findBatteryModel(client, data.batteryModelId);
    if (model === null) throw refuse("ERR-LC-MODEL-NOT-FOUND");
    const originalModels = data.predecessors.map((predecessor) => toUuidColumn(predecessor.originalModelCatenaXId));
    if (model.original_model_catena_x_id === null || !originalModels.includes(model.original_model_catena_x_id)) throw refuse("ERR-LC-MODEL-NOT-ORIGINAL");

    // Rule 2: a predecessor of the own database matches its declared status and original purpose (D13).
    for (const predecessor of data.predecessors) {
      const stored = await repository.findPassportByIdentifierForUpdate(client, predecessor.passportIdentifier);
      if (stored === null) continue;
      const original = await repository.findOriginalPurpose(client, stored.id);
      const purposeDiffers = original === null || catalogue.normalisePurpose(original.purpose) !== catalogue.normalisePurpose(predecessor.originalPurpose);
      if (stored.recycling_date !== null || stored.lifecycle_status !== predecessor.lifeCycleStage || purposeDiffers) {
        throw refuse("ERR-LC-OPERATION-NOT-ADMITTED", [`${predecessor.passportIdentifier}: the stored passport differs from the declared status or original purpose, or has ended`]);
      }
    }

    // Rule 3: the admission rule of D40 for each predecessor, the date of putting into service and the
    // rule of the dates.
    for (const predecessor of data.predecessors) {
      const admitted = catalogue.isOperationAdmitted({
        operation: data.operation,
        status: predecessor.lifeCycleStage,
        originalPurpose: predecessor.originalPurpose,
        purpose: data.purpose,
      });
      if (!admitted) throw refuse("ERR-LC-OPERATION-NOT-ADMITTED", [`${predecessor.passportIdentifier}: the status or the purpose does not admit ${data.operation}`]);
    }
    if (data.dateIntoService < utcDate(operationDate)) throw refuse("ERR-LC-OPERATION-NOT-ADMITTED", ["/dateIntoService is before the date of the operation"]);
    if (utcDate(operationDate) > today()) throw refuse("ERR-LC-OPERATION-NOT-ADMITTED", ["/operationDate is after the current date"]);

    // Rule 4: the identifier rule of D14, and a passport identifier that no stored passport carries.
    const identifiers = data.predecessors.map((predecessor) => predecessor.passportIdentifier);
    if (new Set(identifiers).size !== identifiers.length) throw refuse("ERR-LC-IDENTIFIER-RULE", ["/predecessors names one passport identifier twice"]);
    const batteryIdentifiers = data.predecessors.map((predecessor) => predecessor.batteryIdentifier);
    const renewed = data.operation === "remanufacturing" || data.predecessors.length > 1;
    if (renewed ? batteryIdentifiers.includes(data.batteryIdentifier) : data.batteryIdentifier !== batteryIdentifiers[0]) {
      throw refuse("ERR-LC-IDENTIFIER-RULE", [renewed ? "/batteryIdentifier equals the battery identifier of a predecessor" : "/batteryIdentifier differs from the battery identifier of the predecessor"]);
    }
    if (data.passportIdentifier !== undefined && identifiers.includes(data.passportIdentifier)) {
      throw refuse("ERR-LC-IDENTIFIER-RULE", ["/passportIdentifier equals the passport identifier of a predecessor"]);
    }
    if (data.passportIdentifier !== undefined && (await repository.passportIdentifierExists(client, data.passportIdentifier))) throw refuse("ERR-LC-IDENTIFIER-EXISTS");

    // Rule 5: the new passport, its lineage links, the closing of the lineage, its responsibility
    // interval and its two purpose records (D15, D40, D54).
    const columns = {
      manufacturer_bpnl: ownBpnl,
      battery_model_id: model.id,
      lifecycle_status: catalogue.LINEAGE_OPERATIONS[data.operation].newStatus,
      battery_identifier: data.batteryIdentifier,
      battery_category: data.batteryCategory,
      facility_bpns: data.facilityBpns,
      date_of_manufacture: data.dateOfManufacture,
      date_into_service: data.dateIntoService,
      rated_capacity_ah: data.ratedCapacityAh,
      capacity_fade_percent: data.capacityFadePercent,
      power_fade_percent: data.powerFadePercent,
      expected_lifetime_years: data.expectedLifetimeYears,
    };
    if (data.passportIdentifier !== undefined) columns.passport_identifier = data.passportIdentifier;
    const passport = await repository.insertPassport(client, columns);
    for (const predecessor of data.predecessors) {
      await repository.insertLineageLink(client, {
        passportId: passport.id,
        predecessorPassportIdentifier: predecessor.passportIdentifier,
        predecessorCatenaXId: toUuidColumn(predecessor.catenaXId),
        predecessorDataProviderBpnl: predecessor.dataProviderBpnl,
        predecessorBatteryIdentifier: predecessor.batteryIdentifier,
        predecessorStatus: predecessor.lifeCycleStage,
        predecessorOriginalModelCatenaXId: toUuidColumn(predecessor.originalModelCatenaXId),
        operation: data.operation,
        operationDate,
      });
    }
    await repository.closeLineage(client, passport.id);
    await repository.insertResponsibilityInterval(client, { passportId: passport.id, responsibleBpnl: ownBpnl, role: ECONOMIC_OPERATOR, validFrom: operationDate });
    await repository.insertPurpose(client, { passportId: passport.id, purpose: data.predecessors[0].originalPurpose, isOriginal: true, recordedAt: operationDate });
    await repository.insertPurpose(client, { passportId: passport.id, purpose: data.purpose, isOriginal: false, recordedAt: operationDate });

    // Rule 6 and the notices: one received record per predecessor of the own company (D12), and one
    // pending NewPassportIssued per predecessor of another data provider.
    const content = {
      passportIdentifier: passport.passport_identifier,
      catenaXId: normaliseUuid(passport.id),
      operation: data.operation,
      operationDate,
    };
    const receivers = notificationPlanner.receiversOf({ operation: "NewPassportIssued", request: data });
    for (const receiver of receivers.filter((item) => item.bpnl === ownBpnl)) {
      const header = buildMessageHeader({ operation: "NewPassportIssued", senderBpnl: ownBpnl, receiverBpnl: ownBpnl, clock, newUuid });
      await notificationRepository.insertReceivedNotification(client, {
        messageId: header.messageId,
        operation: "NewPassportIssued",
        senderBpnl: ownBpnl,
        passportIdentifier: receiver.passportIdentifier,
        message: { header, content: { ...content, ...receiver.content } },
        outcome: "applied",
        receivedAt: now(),
      });
    }
    const plan = notificationPlanner.buildNotificationPlan({ operation: "NewPassportIssued", content, receivers, ownBpnl });
    const notifications = await storePlan(client, plan, now());
    return {
      passport: await recordReader.readPassportRecord({ client, passportId: passport.id }),
      notifications,
      auditEntries: [auditEntry(subject, passport.id, action, "granted", { reliedOn: "data-provider" })],
    };
  }

  // The receiving step of section 10.4, from the sixth check on. The message is validated and
  // normalised. The function returns the outcome applied, recorded or duplicate.
  async function applyNotification({ client, subject, operation, message }) {
    const action = `notification.apply.${operation}`;
    const definition = catalogue.OPERATIONS[operation];
    if (definition === undefined) throw new TypeError("applyNotification needs one of the four operations");
    const { header, content } = message;
    const messageId = header.messageId;
    const passportIdentifier = content[definition.passportIdentifierProperty];

    const repeated = (stored) => {
      const same = stored.sender_bpnl === header.senderBpn && stored.message?.header?.context === header.context && isDeepStrictEqual(stored.message?.content, content);
      if (!same) throw refusal("ERR-RX-MESSAGE-ID-REUSED", { subject, action });
      return { outcome: "duplicate", messageId, passportId: null, notifications: [], auditEntries: [] };
    };

    // The sixth check: a stored record with the same messageId.
    const stored = await notificationRepository.findReceivedNotification(client, messageId);
    if (stored !== null) return repeated(stored);

    // The seventh check: the passport that the content names, read with a row lock.
    const passport = await repository.findPassportByIdentifierForUpdate(client, passportIdentifier);
    let outcome = "applied";
    if (passport === null) {
      if (operation === "NewPassportIssued" || operation === "BatteryRepaired") throw refusal("ERR-RX-PASSPORT-UNKNOWN", { subject, action });
      outcome = "recorded";
    } else if ((await stepRefusal(client, operation, passport, content)) !== null) {
      throw refusal("ERR-RX-STEP-REFUSED", { subject, passportId: passport.id, action });
    }

    // The eighth check: the insertion of the received record, which a concurrent copy can precede.
    const inserted = await notificationRepository.insertReceivedNotification(client, {
      messageId,
      operation,
      senderBpnl: header.senderBpn,
      passportIdentifier,
      message,
      outcome,
      receivedAt: now(),
    });
    if (inserted === null) return repeated(await notificationRepository.findReceivedNotification(client, messageId));

    // The ninth check: the step.
    if (outcome === "recorded") return { outcome, messageId, passportId: null, notifications: [], auditEntries: [] };
    const reliedOn = await applyStep(client, { operation, passport, content, senderBpnl: header.senderBpn, messageId });
    const notifications = operation === "PassportEnded" ? await storePlan(client, passportServiceProviderPlan(content), endNoticeTime()) : [];
    return { outcome, messageId, passportId: passport.id, notifications, auditEntries: [auditEntry(subject, passport.id, action, "granted", { reliedOn })] };
  }

  // The content of the notification of a reported event (section 10.1).
  function eventContent(operation, data) {
    if (operation === "BatteryRepaired") {
      return { passportIdentifier: data.passportIdentifier, repairDate: instant(data.repairDate), repairCertificateCatenaXId: normaliseUuid(data.repairCertificateCatenaXId) };
    }
    if (operation === "BatteryBecameWaste") {
      return { passportIdentifier: data.passportIdentifier, successorBpnl: data.successorBpnl, successorRole: data.successorRole, date: instant(data.wasteDate) };
    }
    if (operation === "PassportEnded") {
      const content = { passportIdentifier: data.passportIdentifier, recyclingDate: instant(data.recyclingDate), recyclerBpnl: ownBpnl };
      if (data.materialRecyclingCertificateCatenaXId !== undefined) content.materialRecyclingCertificateCatenaXId = normaliseUuid(data.materialRecyclingCertificateCatenaXId);
      return content;
    }
    throw new TypeError("reportEvent needs BatteryRepaired, BatteryBecameWaste or PassportEnded");
  }

  // The sending side of BatteryRepaired, BatteryBecameWaste and PassportEnded. When the data provider
  // of the named passport is the own company, the step is applied locally in the same transaction and
  // no notification is planned for the own company (D12).
  async function reportEvent({ client, subject, operation, data }) {
    const action = `notification.apply.${operation}`;
    const content = eventContent(operation, data);
    const receivers = notificationPlanner.receiversOf({ operation, request: data });
    const auditEntries = [];
    let passportId = null;
    let applied = false;
    if (data.dataProviderBpnl === ownBpnl) {
      const passport = await repository.findPassportByIdentifierForUpdate(client, data.passportIdentifier);
      if (passport === null) throw refusal("ERR-LC-PASSPORT-NOT-FOUND", { subject, action });
      const refused = await stepRefusal(client, operation, passport, content);
      if (refused === "ended") throw refusal("ERR-LC-PASSPORT-ENDED", { subject, passportId: passport.id, action });
      if (refused !== null) throw refusal("ERR-LC-STATUS-NOT-ADMITTED", { subject, passportId: passport.id, action });
      const reliedOn = await applyStep(client, { operation, passport, content, senderBpnl: ownBpnl, messageId: null });
      auditEntries.push(auditEntry(subject, passport.id, action, "granted", { reliedOn }));
      passportId = passport.id;
      applied = true;
    }
    const plan = notificationPlanner.buildNotificationPlan({ operation, content, receivers, ownBpnl });
    const notBefore = operation === "PassportEnded" ? endNoticeTime() : now();
    const notifications = await storePlan(client, plan, notBefore);
    if (applied && operation === "PassportEnded") {
      const planned = new Set(plan.map((entry) => JSON.stringify([entry.receiverBpnl, entry.passportIdentifier])));
      const further = passportServiceProviderPlan(content).filter((entry) => !planned.has(JSON.stringify([entry.receiverBpnl, entry.passportIdentifier])));
      notifications.push(...(await storePlan(client, further, endNoticeTime())));
    }
    return { notifications, appliedLocally: applied, passportId, auditEntries };
  }

  async function addForwardLink({ client, subject, passportId, messageId }) {
    const action = "forward-link.add";
    const passport = await passportForWrite(client, passportId, { subject, action });
    const reliedOn = writeDecision(passport, { subject, action });
    const record = await notificationRepository.findReceivedNewPassportIssued(client, { messageId: normaliseUuid(messageId), passportIdentifier: passport.passport_identifier });
    if (record === null) throw refusal("ERR-LC-NOTIFICATION-UNKNOWN", { subject, passportId, action });
    const notice = record.message.content;
    const existing = await repository.findSuccessorLink(client, passportId, notice.passportIdentifier);
    if (existing !== null) return { link: recordReader.successorLinkOf(existing), created: false, auditEntries: [] };
    const link = await repository.insertSuccessorLink(client, {
      passportId,
      successorPassportIdentifier: notice.passportIdentifier,
      successorCatenaXId: toUuidColumn(notice.catenaXId),
      secondLifeOperatorBpnl: record.sender_bpnl,
      operation: notice.operation,
      operationDate: notice.operationDate,
      notificationMessageId: record.message_id,
    });
    return { link: recordReader.successorLinkOf(link), created: true, auditEntries: [auditEntry(subject, passportId, action, "granted", { reliedOn })] };
  }

  async function recordSuccessorAuthorisation({ client, subject, passportId, data }) {
    const action = "successor-authorisation.record";
    const passport = await passportForWrite(client, passportId, { subject, action });
    if (passport.recycling_date !== null) throw refusal("ERR-LC-PASSPORT-ENDED", { subject, passportId, action });
    if (passport.lifecycle_status !== "waste") throw refusal("ERR-LC-STATUS-NOT-ADMITTED", { subject, passportId, action });
    const validTo = data.validTo ?? null;
    if (validTo !== null && validTo < data.validFrom) throw refusal("ERR-LC-BODY-INVALID", { subject, passportId, action, messages: ["/validTo is before /validFrom"] });
    const previous =
      passport.successor_authorisation_ref === null
        ? null
        : {
            authorisationRef: passport.successor_authorisation_ref,
            validFrom: passport.successor_authorisation_valid_from,
            validTo: passport.successor_authorisation_valid_to,
          };
    const recorded = { authorisationRef: data.authorisationRef, validFrom: data.validFrom, validTo };
    await repository.setSuccessorAuthorisation(client, passportId, recorded);
    return {
      passport: await recordReader.readPassportRecord({ client, passportId }),
      auditEntries: [auditEntry(subject, passportId, action, "granted", { reliedOn: "data-provider", details: { previous, recorded } })],
    };
  }

  async function putAspectPayload({ client, subject, passportId, aspectKey, payload }) {
    const action = "aspect.put";
    if (!STORED_ASPECT_KEYS.includes(aspectKey)) throw refusal("ERR-LC-ASPECT-KEY-UNKNOWN", { subject, passportId, action });
    const passport = await passportForWrite(client, passportId, { subject, action });
    const reliedOn = writeDecision(passport, { subject, action });
    const validation = validator.validateAspect(aspectKey, payload);
    if (!validation.valid) throw refusal("ERR-LC-BODY-INVALID", { subject, passportId, action, messages: validatorMessages(validation.errors) });
    const company = await companyRepository.findCompany(client, passport.manufacturer_bpnl);
    const hasLineageLink = (await repository.listLineageLinks(client, passportId)).length > 0;
    const served = applyGovernedElements({ aspectKey, payload, passport, company, hasLineageLink });
    const problems = await accessMaps.payloadCoverageProblems({ client, modelId: passport.battery_model_id, aspectKey, payload: served });
    if (problems.length > 0) throw refusal("ERR-LC-ACCESS-MAP-INCOMPLETE", { subject, passportId, action, messages: problems });
    await repository.upsertAspectPayload(client, { passportId, aspectKey, payload, updatedAt: now() });
    return {
      passport: await recordReader.readPassportRecord({ client, passportId }),
      auditEntries: [auditEntry(subject, passportId, action, "granted", { reliedOn })],
    };
  }

  return Object.freeze({
    createBatteryModel,
    createFirstPassport,
    issueNewPassport,
    applyNotification,
    reportEvent,
    addForwardLink,
    recordSuccessorAuthorisation,
    putAspectPayload,
  });
}
