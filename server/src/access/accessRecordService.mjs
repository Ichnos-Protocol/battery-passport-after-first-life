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

// Requirements: SwR-DATASET-195 (Direct re-use recorded as a purchaser change, never as a lineage
// step), SwR-DATASET-196 (Direct re-use leaves the responsible operator unchanged), SwR-DATASET-199
// (Direct re-use leaves the battery status unchanged), SwR-ACCESS-127 (Purchaser for point 4 access
// taken from the open access record) and SwR-ACCESS-129 (Previous holder's point 4 access ends with the
// closed access record), with decision D3 (The access map and the whole aspect) [waits for the owner],
// decision D29 (The access regime and the admitted roles) and decision D30 (The change of purchaser).
// System requirements SyR-PASS-231 (New holder after direct re-use recorded as the battery's purchaser)
// and SyR-PASS-235 (Previous holder loses access to individual battery information after a resale).
// Sections 9.2.3 and 9.2.4 of docs/architecture/implementation_plan.md.
// The access records of a passport and the read decision of a partner (EL-ACCESS, the access control).
import { Refusal } from "../dataset/refusals.mjs";
import { IDTA_02035_ASPECT_KEYS, STORED_ASPECT_KEYS } from "../submodels/submodelService.mjs";

export const RECIPIENT_ROLES = Object.freeze(["purchaser", "purchaserAgent", "responsibleOperator", "successor", "marketSurveillanceAuthority", "authorisedRecipient"]);

function admittedRoles(roleOf) {
  const table = {};
  for (const aspectKey of [...STORED_ASPECT_KEYS, "lifecycle", "successors"]) table[aspectKey] = Object.freeze(roleOf(aspectKey));
  return Object.freeze(table);
}

// The table of decision D29: the roles that an access record of each aspect key admits, under each
// value of ACCESS_REGIME.
export const ADMITTED_ROLES = Object.freeze({
  "after-act": admittedRoles((aspectKey) => {
    if (aspectKey === "product-condition") return ["purchaser", "purchaserAgent"];
    if (aspectKey === "lifecycle") return ["purchaser", "purchaserAgent", "responsibleOperator", "successor", "marketSurveillanceAuthority"];
    if (aspectKey === "successors") return ["authorisedRecipient", "marketSurveillanceAuthority"];
    return [...RECIPIENT_ROLES];
  }),
  "before-act": admittedRoles((aspectKey) => (aspectKey === "successors" ? ["authorisedRecipient", "marketSurveillanceAuthority"] : [...RECIPIENT_ROLES])),
});

const PURCHASER_ROLES = Object.freeze(["purchaser", "purchaserAgent"]);

// The record of an access record in an answer of the operator endpoints.
export function accessRecordOf(row) {
  return {
    id: row.id,
    passportId: row.passport_id,
    recipientBpnl: row.recipient_bpnl,
    recipientRole: row.recipient_role,
    aspectKey: row.aspect_key,
    validFrom: row.valid_from.toISOString(),
    validTo: row.valid_to === null ? null : row.valid_to.toISOString(),
  };
}

function entry(subject, passportId, action, decision, { reliedOn = null, refusalId = null } = {}) {
  return { decision, requesterBpnl: subject.bpnl, requesterKind: subject.kind, passportId, action, reliedOn, refusalId, details: null };
}

// Returns the access record service of a deployment.
export function createAccessRecordService({ repository, passportRepository, accessMaps, clock, accessRegime }) {
  if (!Object.hasOwn(ADMITTED_ROLES, accessRegime)) throw new TypeError("createAccessRecordService needs the access regime before-act or after-act");
  const today = () => clock.now().toISOString().slice(0, 10);

  function refuse(subject, passportId, action, id) {
    return new Refusal(id, { auditEntries: [entry(subject, passportId, action, "refused", { refusalId: id })] });
  }

  // The authorisation of the successor that is in force on the current UTC date, or null.
  function authorisationInForce(passport) {
    const date = today();
    if (passport.successor_authorisation_valid_from === null || passport.successor_authorisation_valid_from > date) return null;
    if (passport.successor_authorisation_valid_to !== null && passport.successor_authorisation_valid_to < date) return null;
    return passport.successor_authorisation_ref;
  }

  // Reads the passport with a row lock and applies the rule after the waste status (section 9.2.2):
  // an exempt write relies on the data provider. The access records of an ended passport stay writable.
  async function writablePassport({ client, subject, passportId, action, exempt }) {
    const passport = await passportRepository.findPassportForUpdate(client, passportId);
    if (passport === null) throw refuse(subject, passportId, action, "ERR-LC-PASSPORT-NOT-FOUND");
    if (passport.lifecycle_status !== "waste" || passport.recycling_date !== null || exempt) return { passport, reliedOn: "data-provider" };
    const reference = authorisationInForce(passport);
    if (reference === null) throw refuse(subject, passportId, action, "ERR-LC-SUCCESSOR-AUTHORISATION-MISSING");
    return { passport, reliedOn: `successor-authorisation:${reference}` };
  }

  async function addAccessRecord({ client, subject, passportId, data }) {
    const action = "access-record.add";
    const { reliedOn } = await writablePassport({ client, subject, passportId, action, exempt: data.recipientRole === "successor" });
    const admitted = ADMITTED_ROLES[accessRegime][data.aspectKey];
    if (admitted === undefined) throw refuse(subject, passportId, action, "ERR-LC-ASPECT-KEY-UNKNOWN");
    if (!admitted.includes(data.recipientRole)) throw refuse(subject, passportId, action, "ERR-LC-ROLE-NOT-ADMITTED");
    const existing = await repository.findUnendedAccessRecord(client, { passportId, recipientBpnl: data.recipientBpnl, aspectKey: data.aspectKey, recipientRole: data.recipientRole });
    if (existing !== null) throw refuse(subject, passportId, action, "ERR-LC-RECORD-EXISTS");
    const row = await repository.insertAccessRecord(client, { passportId, recipientBpnl: data.recipientBpnl, recipientRole: data.recipientRole, aspectKey: data.aspectKey, validFrom: clock.now() });
    return { record: accessRecordOf(row), auditEntries: [entry(subject, passportId, action, "granted", { reliedOn })] };
  }

  async function endAccessRecord({ client, subject, passportId, recordId }) {
    const action = "access-record.end";
    const { reliedOn } = await writablePassport({ client, subject, passportId, action, exempt: false });
    const record = await repository.findAccessRecord(client, passportId, recordId);
    if (record === null) throw refuse(subject, passportId, action, "ERR-LC-RECORD-NOT-FOUND");
    if (record.valid_to !== null) throw refuse(subject, passportId, action, "ERR-LC-STATUS-NOT-ADMITTED");
    const row = await repository.endAccessRecord(client, record.id, clock.now());
    return { record: accessRecordOf(row), auditEntries: [entry(subject, passportId, action, "granted", { reliedOn })] };
  }

  // Decision D30: ends the open records of the roles purchaser and purchaserAgent and opens the records
  // of the new purchaser, and of the agent when the request names one, for product-condition, for
  // lifecycle and for each IDTA-02035 aspect key of the access group legitimateInterestBattery. The
  // step writes no passport column, no lineage link and no responsibility interval.
  async function changePurchaser({ client, subject, passportId, data }) {
    const action = "purchaser.change";
    const { passport, reliedOn } = await writablePassport({ client, subject, passportId, action, exempt: true });
    const now = clock.now();
    const closed = await repository.endAccessRecordsOfRoles(client, { passportId, recipientRoles: [...PURCHASER_ROLES], validTo: now });
    const aspectKeys = ["product-condition", "lifecycle", ...(await accessMaps.legitimateInterestBatteryKeys({ client, modelId: passport.battery_model_id }))];
    const recipients = [{ bpnl: data.purchaserBpnl, role: "purchaser" }];
    if (data.purchaserAgentBpnl !== undefined && data.purchaserAgentBpnl !== null) recipients.push({ bpnl: data.purchaserAgentBpnl, role: "purchaserAgent" });
    const opened = [];
    for (const recipient of recipients) {
      for (const aspectKey of [...new Set(aspectKeys)]) {
        opened.push(await repository.insertAccessRecord(client, { passportId, recipientBpnl: recipient.bpnl, recipientRole: recipient.role, aspectKey, validFrom: now }));
      }
    }
    return { closed: closed.map(accessRecordOf), opened: opened.map(accessRecordOf), auditEntries: [entry(subject, passportId, action, "granted", { reliedOn })] };
  }

  // The access decision of section 9.2.4 (decision D3 [waits for the owner]). The operator subject reads
  // every aspect; a partner subject reads by the table of section 9.2.4; every other subject reads
  // nothing.
  async function mayRead({ client, subject, passportId, aspectKey }) {
    if (subject?.kind === "operator") return true;
    if (subject?.kind !== "partner") return false;
    const hasRecord = () => repository.hasOpenAccessRecord(client, { passportId, recipientBpnl: subject.bpnl, aspectKey, at: clock.now() });
    if (IDTA_02035_ASPECT_KEYS.includes(aspectKey)) {
      const passport = await passportRepository.findPassport(client, passportId);
      if (passport === null) return false;
      if (await accessMaps.isPublicWithoutRecord({ client, modelId: passport.battery_model_id, aspectKey })) return true;
    }
    return hasRecord();
  }

  return Object.freeze({ addAccessRecord, endAccessRecord, changePurchaser, mayRead });
}
