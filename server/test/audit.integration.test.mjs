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

// Tests the audit trail of server/src/audit/auditLog.mjs under the role refserver_app.
//
// Requirement of the registry that this file verifies:
//   SwR-AUDIT-045 (Dataset write decisions recorded with the authorisation relied on)
// Measure VM-SWE-AUDIT-011 (Passport dataset, authorisation and disposal records), section 17.2 of the
// implementation specification. Decision D25 (The audit table) and section 9.2.7.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";

import * as accessRecordRepository from "../src/access/accessRecordRepository.mjs";
import { AUDIT_ACTIONS, createAuditLog } from "../src/audit/auditLog.mjs";
import * as auditRepository from "../src/audit/auditRepository.mjs";
import * as notificationPlanner from "../src/connector/notificationPlan.mjs";
import * as notificationRepository from "../src/connector/notificationRepository.mjs";
import * as companyRepository from "../src/dataset/companyRepository.mjs";
import * as catalogue from "../src/dataset/lifecycleCatalogue.mjs";
import * as recordReader from "../src/dataset/lifecycleRecordReader.mjs";
import { createLifecycleService } from "../src/dataset/lifecycleService.mjs";
import * as passportRepository from "../src/dataset/passportRepository.mjs";
import { Refusal } from "../src/dataset/refusals.mjs";
import { withTransaction } from "../src/db/transaction.mjs";
import * as accessMapRepository from "../src/submodels/accessMapRepository.mjs";
import { createAccessMapService } from "../src/submodels/accessMapService.mjs";
import { createMemoryTwinRegistry } from "../src/twins/memoryTwinRegistry.mjs";
import { createSchemaValidator } from "../src/validation/schemaValidator.mjs";
import { createTestDatabase } from "./support/database.mjs";

const OWN = "BPNL00000000TCK1";
const NOW = "2026-06-15T10:00:00.000Z";
let current = new Date(NOW);
const clock = { now: () => new Date(current.getTime()) };
const RETRY_SECONDS = 30;
const operator = { kind: "operator", bpnl: OWN };

let db;
let lifecycle;
let logged;
let audit;
let modelId;

const run = (work) => withTransaction(db.appPool, { actingBpnl: OWN, today: "2026-06-15" }, work);
const rows = async () => (await db.adminClient.query("SELECT * FROM passport_write_decisions ORDER BY id")).rows;

before(async () => {
  db = await createTestDatabase("audit.integration.test.mjs");
  await companyRepository.upsertOwnCompany(db.appPool, {
    ownBpnl: OWN,
    ownLegalName: "Example Battery Company",
    ownLegalNameLanguage: "en",
    ownAddress: { NationalCode: [{ en: "XX" }], CityTown: [{ en: "Example City" }], Street: [{ en: "Example Street 1" }], ZipCode: [{ en: "00000" }] },
    ownOperatorIdentifier: null,
  });
  const validator = createSchemaValidator();
  const accessMaps = createAccessMapService({ repository: accessMapRepository, passportRepository, companyRepository, validator, clock });
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
    twinRegistry: createMemoryTwinRegistry(),
  });
  logged = [];
  const logger = { error: (message, fields) => logged.push({ message, fields }), warn() {}, info() {}, debug() {} };
  audit = createAuditLog({ pool: db.appPool, repository: auditRepository, clock, logger, ownBpnl: OWN, retrySeconds: RETRY_SECONDS });
  modelId = (await run((client) => lifecycle.createBatteryModel({ client, subject: operator, data: { manufacturerPartId: "TCK-PART-AUDIT" } }))).model.id;
});

after(async () => {
  if (db) await db.drop();
});

const firstPassport = (overrides = {}) =>
  run((client) =>
    lifecycle.createFirstPassport({
      client,
      subject: operator,
      data: { batteryModelId: modelId, batteryIdentifier: `TCK-BATTERY-${randomUUID()}`, batteryCategory: "ev", facilityBpns: "BPNS00000000TCK1", dateOfManufacture: "2026-01-10", originalPurpose: "Traction battery", ...overrides },
    }),
  );

test("SwR-AUDIT-045 (Dataset write decisions recorded with the authorisation relied on): the records of passport_write_decisions", async (t) => {
  await t.test("one record per granted write decision, with the fields of section 9.2.7 and decided_at equal to the current time of the clock", async () => {
    const before = (await rows()).length;
    const result = await firstPassport();
    assert.deepStrictEqual(await audit.record(result.auditEntries), { written: true, queued: false });
    const all = await rows();
    assert.equal(all.length, before + 1);
    const record = all[all.length - 1];
    assert.deepStrictEqual(
      {
        decided_at: record.decided_at,
        decision: record.decision,
        requester_bpnl: record.requester_bpnl,
        requester_kind: record.requester_kind,
        passport_id: record.passport_id,
        action: record.action,
        relied_on: record.relied_on,
        refusal_id: record.refusal_id,
        details: record.details,
      },
      {
        decided_at: new Date(NOW),
        decision: "granted",
        requester_bpnl: OWN,
        requester_kind: "operator",
        passport_id: result.passport.id,
        action: "passport.create",
        relied_on: "data-provider",
        refusal_id: null,
        details: null,
      },
    );
  });
  await t.test("the record of a refused write exists after the rollback of the transaction of the request", async () => {
    const stored = await firstPassport();
    let refusal;
    try {
      await firstPassport({ passportIdentifier: stored.passport.passportIdentifier });
    } catch (error) {
      refusal = error;
    }
    assert.ok(refusal instanceof Refusal);
    assert.equal(refusal.id, "ERR-LC-IDENTIFIER-EXISTS");
    assert.equal((await db.adminClient.query("SELECT 1 FROM passports WHERE battery_identifier LIKE 'TCK-BATTERY-%' AND passport_identifier = $1", [stored.passport.passportIdentifier])).rowCount, 1, "the transaction of the refused request stored no passport");
    await audit.record(refusal.auditEntries);
    const record = (await rows()).at(-1);
    assert.equal(record.decision, "refused");
    assert.equal(record.refusal_id, "ERR-LC-IDENTIFIER-EXISTS");
    assert.equal(record.action, "passport.create");
    assert.equal(record.passport_id, null);
    assert.equal(record.relied_on, null);
    assert.equal(record.requester_kind, "operator");
  });
  await t.test("the details of a successor authorisation and a partner requester are stored", async () => {
    const entry = {
      decision: "granted",
      requesterBpnl: "BPNL00000000TCK3",
      requesterKind: "partner",
      passportId: randomUUID(),
      action: "successor-authorisation.record",
      reliedOn: "data-provider",
      refusalId: null,
      details: { previous: null, recorded: { authorisationRef: "TCK-AUTHORISATION-1", validFrom: "2026-06-01", validTo: null } },
    };
    await audit.record([entry, { ...entry, decision: "refused", reliedOn: null, refusalId: "ERR-LC-STATUS-NOT-ADMITTED", details: null }]);
    const [granted, refused] = (await rows()).slice(-2);
    assert.equal(granted.requester_kind, "partner");
    assert.deepStrictEqual(granted.details, entry.details);
    assert.equal(granted.passport_id, entry.passportId);
    assert.equal(refused.refusal_id, "ERR-LC-STATUS-NOT-ADMITTED");
  });
  await t.test("an empty list writes no record", async () => {
    const before = (await rows()).length;
    assert.deepStrictEqual(await audit.record([]), { written: true, queued: false });
    assert.equal((await rows()).length, before);
  });
  await t.test("AUDIT_ACTIONS holds the twelve actions of section 9.2.7", () => {
    assert.deepStrictEqual([...AUDIT_ACTIONS], [
      "passport.create",
      "passport.issue",
      "aspect.put",
      "forward-link.add",
      "successor-authorisation.record",
      "notification.apply.NewPassportIssued",
      "notification.apply.BatteryRepaired",
      "notification.apply.BatteryBecameWaste",
      "notification.apply.PassportEnded",
      "purchaser.change",
      "access-record.add",
      "access-record.end",
    ]);
  });
});

test("decision D69 (The audit record after a failed write is queued): the queue audit_outbox", async (t) => {
  const table = (name) => `${db.adminClient.escapeIdentifier(db.schema)}.${name}`;
  const revoke = (name) => db.adminClient.query(`REVOKE INSERT ON ${table(name)} FROM refserver_app`);
  const grant = (name) => db.adminClient.query(`GRANT INSERT ON ${table(name)} TO refserver_app`);
  const queueRows = async () => (await db.adminClient.query("SELECT * FROM audit_outbox ORDER BY id")).rows;
  const entry = (passportId) => ({ decision: "granted", requesterBpnl: OWN, requesterKind: "operator", passportId, action: "aspect.put", reliedOn: "data-provider", refusalId: null, details: null });
  const passportId = randomUUID();
  let queuedId;
  current = new Date(NOW);
  await t.test("with the privilege INSERT on passport_write_decisions revoked, record resolves to written false and queued true, logs one line and stores one row; writeQueued then writes attempts 1, last_error sqlstate 42501 and the next attempt after retrySeconds, and a second call in the same second writes nothing", async () => {
    logged.length = 0;
    await revoke("passport_write_decisions");
    try {
      assert.deepStrictEqual(await audit.record([entry(passportId)]), { written: false, queued: true });
      assert.equal(logged.length, 1);
      assert.equal(logged[0].message, "The audit record of a write decision failed and is queued.");
      assert.equal(logged[0].fields.sqlState, "42501");
      assert.deepStrictEqual(logged[0].fields.actions, ["aspect.put"]);
      assert.deepStrictEqual(logged[0].fields.passportIds, [passportId]);
      const [row] = (await queueRows()).filter((item) => item.entries[0].passportId === passportId);
      queuedId = row.id;
      assert.deepStrictEqual(row.entries, [entry(passportId)]);
      assert.deepStrictEqual(row.decided_at, new Date(NOW));
      assert.deepStrictEqual(row.not_before, new Date(NOW));
      assert.equal(row.written_at, null);
      assert.equal(row.attempts, 0);
      {
        await audit.writeQueued();
        const [failed] = (await queueRows()).filter((item) => item.id === queuedId);
        assert.equal(failed.attempts, 1);
        assert.equal(failed.last_error, "sqlstate 42501");
        assert.deepStrictEqual(failed.not_before, new Date(new Date(NOW).getTime() + RETRY_SECONDS * 1000));
        assert.equal(failed.written_at, null);
        await audit.writeQueued();
        assert.equal((await queueRows()).find((item) => item.id === queuedId).attempts, 1, "a second call in the same second writes nothing");
      }
    } finally {
      await grant("passport_write_decisions");
    }
  });
  await t.test("after the grant and after the next attempt, writeQueued writes the record with the time of the decision and sets written_at, and a further call writes nothing", async () => {
    await audit.writeQueued();
    assert.equal((await rows()).filter((row) => row.passport_id === passportId).length, 0, "the next attempt is not yet due");
    current = new Date(new Date(NOW).getTime() + RETRY_SECONDS * 1000);
    await audit.writeQueued();
    const written = (await rows()).filter((row) => row.passport_id === passportId);
    assert.equal(written.length, 1);
    assert.deepStrictEqual(written[0].decided_at, new Date(NOW));
    assert.equal(written[0].action, "aspect.put");
    const [row] = (await queueRows()).filter((item) => item.id === queuedId);
    assert.deepStrictEqual(row.written_at, current);
    current = new Date(current.getTime() + 3600 * 1000);
    await audit.writeQueued();
    assert.equal((await rows()).filter((item) => item.passport_id === passportId).length, 1);
  });
  await t.test("with the privilege INSERT revoked on both tables, record resolves to written false and queued false and logs the lost record", async () => {
    logged.length = 0;
    const lost = randomUUID();
    await revoke("passport_write_decisions");
    await revoke("audit_outbox");
    try {
      assert.deepStrictEqual(await audit.record([{ ...entry(lost), decision: "refused", reliedOn: null, refusalId: "ERR-LC-PASSPORT-ENDED" }]), { written: false, queued: false });
      assert.deepStrictEqual(logged.map((line) => line.message), ["The audit record of a write decision failed and is queued.", "The audit record of a write decision is lost."]);
      assert.deepStrictEqual(logged[1].fields.refusalIds, ["ERR-LC-PASSPORT-ENDED"]);
      assert.deepStrictEqual(logged[1].fields.sqlStates, ["42501", "42501"]);
      assert.deepStrictEqual(logged[1].fields.passportIds, [lost]);
    } finally {
      await grant("passport_write_decisions");
      await grant("audit_outbox");
    }
  });
});
