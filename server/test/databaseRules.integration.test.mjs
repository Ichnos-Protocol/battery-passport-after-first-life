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

// Tests the rules of the database of the reference server: the three migration files of
// server/src/db/migrations, the migration runner, the pool and the transaction helper.
// The file holds nine top-level tests, (a) catalogue to (i) isolation levels.
//
// Requirements of the registry that this file verifies:
//   SwR-RDB-007 (Dataset writes only by the responsible or an authorised operator)
//   SwR-RDB-073 (Timeline of responsible economic operators held per passport)
//   SwR-RDB-074 (Change to waste refused without a named successor)
//   SwR-RDB-075 (Manufacturer held in each passport record and never empty on write)
//   SwR-DATASET-190 (Passport rows written only under the responsible operator's context)
//   SwR-DATASET-208 (Database trigger refuses a change of a passport's manufacturer)
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";

import { createAppRole } from "../src/db/createAppRole.mjs";
import { migrate } from "../src/db/migrate.mjs";
import { createPool } from "../src/db/pool.mjs";
import { withTransaction } from "../src/db/transaction.mjs";
import { appConnectionString, connectAdminClient, createTestDatabase } from "./support/database.mjs";

// Group (h) reads the dates of the database in a process whose time zone is far from UTC.
// The statement runs before the first Date of the process.
process.env.TZ = "Pacific/Kiritimati";

// The invented Business Partner Numbers of the test data.
const COMPANY_A = "BPNL00000000TCK1";
const COMPANY_B = "BPNL00000000TCK2";
const RECYCLER = "BPNL00000000TCK3";
const SUCCESSOR = "BPNL00000000TCK4";
const OTHER_SUCCESSOR = "BPNL00000000TCK5";
const FURTHER_COMPANY = "BPNL00000000TCK6";
const SITE = "BPNS00000000TCK1";

const MANUFACTURE_DATE = "2026-01-10";
const MANUFACTURE_INSTANT = "2026-01-10T00:00:00Z";
const OPERATION_DATE = "2026-03-01T08:00:00Z";
const WASTE_DATE = "2026-05-01T12:00:00Z";
const RECYCLING_DATE = "2026-07-01T09:00:00Z";
const AUTHORISATION_FROM = "2026-06-10";
const AUTHORISATION_TO = "2026-06-20";
const TODAY = "2026-06-15";

const TABLES = [
  "companies",
  "battery_models",
  "passports",
  "passport_purposes",
  "passport_aspect_payloads",
  "notifications_received",
  "notifications_sent",
  "passport_lineage_links",
  "passport_successor_links",
  "passport_repair_entries",
  "passport_responsibility_intervals",
  "access_map_versions",
  "access_map_entries",
  "passport_access_records",
  "passport_write_decisions",
  "issuer_contracts",
  "received_battery_information",
];

const FUNCTIONS = [
  "require_read_committed",
  "app_today",
  "refuse_passport_id_change",
  "set_passport_insert_defaults",
  "refuse_passport_identity_change",
  "refuse_battery_model_change",
  "check_passport_status_change",
  "refuse_change_of_ended_passport",
  "check_passport_after_waste",
  "check_child_after_waste",
  "check_passport_lineage",
  "check_responsibility",
  "refuse_change",
  "check_interval_change",
  "refuse_child_of_ended_passport",
  "check_lineage_link_insert",
];

// The 37 triggers of section 9.4.2, each with its table.
const TRIGGERS = {
  trg_fixed_passport_passport_purposes: "passport_purposes",
  trg_fixed_passport_passport_aspect_payloads: "passport_aspect_payloads",
  trg_fixed_passport_passport_lineage_links: "passport_lineage_links",
  trg_fixed_passport_passport_successor_links: "passport_successor_links",
  trg_fixed_passport_passport_repair_entries: "passport_repair_entries",
  trg_fixed_passport_passport_responsibility_intervals: "passport_responsibility_intervals",
  trg_fixed_passport_passport_access_records: "passport_access_records",
  trg_fixed_passport_passport_write_decisions: "passport_write_decisions",
  trg_fixed_passport_issuer_contracts: "issuer_contracts",
  trg_passport_insert: "passports",
  trg_passport_identity: "passports",
  trg_battery_model_identity: "battery_models",
  trg_passport_status_change: "passports",
  trg_passport_ended: "passports",
  trg_passport_after_waste: "passports",
  trg_passport_aspect_payloads_after_waste: "passport_aspect_payloads",
  trg_passport_purposes_after_waste: "passport_purposes",
  trg_passport_repair_entries_after_waste: "passport_repair_entries",
  trg_passport_successor_links_after_waste: "passport_successor_links",
  trg_passport_lineage_links_after_waste: "passport_lineage_links",
  trg_passport_lineage: "passports",
  trg_passport_responsibility: "passports",
  trg_interval_responsibility: "passport_responsibility_intervals",
  trg_passport_purposes_append_only: "passport_purposes",
  trg_passport_lineage_links_append_only: "passport_lineage_links",
  trg_passport_repair_entries_append_only: "passport_repair_entries",
  trg_passport_successor_links_append_only: "passport_successor_links",
  trg_notifications_received_append_only: "notifications_received",
  trg_passport_write_decisions_append_only: "passport_write_decisions",
  trg_received_battery_information_append_only: "received_battery_information",
  trg_interval_change: "passport_responsibility_intervals",
  trg_passport_aspect_payloads_ended: "passport_aspect_payloads",
  trg_passport_successor_links_ended: "passport_successor_links",
  trg_passport_repair_entries_ended: "passport_repair_entries",
  trg_passport_purposes_ended: "passport_purposes",
  trg_passport_responsibility_intervals_ended: "passport_responsibility_intervals",
  trg_passport_lineage_links_insert: "passport_lineage_links",
};

// The twelve policies of section 9.4.3, each with its table.
const POLICIES = {
  battery_models_own: "battery_models",
  passports_own: "passports",
  passport_purposes_own: "passport_purposes",
  passport_aspect_payloads_own: "passport_aspect_payloads",
  passport_lineage_links_own: "passport_lineage_links",
  passport_successor_links_own: "passport_successor_links",
  passport_repair_entries_own: "passport_repair_entries",
  passport_responsibility_intervals_own: "passport_responsibility_intervals",
  passport_access_records_own: "passport_access_records",
  access_map_versions_own: "access_map_versions",
  access_map_entries_own: "access_map_entries",
  issuer_contracts_own_passport: "issuer_contracts",
};

const DOMAIN_CONSTRAINTS = ["bpnl_check", "bpns_check", "finite_timestamptz_check", "finite_date_check"];

// Every named primary key, unique, check and foreign key constraint of section 9.4.1.
const TABLE_CONSTRAINTS = [
  "companies_pkey",
  "companies_legal_name_check",
  "battery_models_pkey",
  "battery_models_manufacturer_fkey",
  "battery_models_part_id_check",
  "battery_models_original_check",
  "battery_models_manufacturer_part_key",
  "battery_models_id_manufacturer_key",
  "passports_pkey",
  "passports_passport_identifier_key",
  "passports_passport_identifier_check",
  "passports_battery_identifier_check",
  "passports_manufacturer_fkey",
  "passports_battery_model_fkey",
  "passports_lifecycle_status_check",
  "passports_battery_category_check",
  "passports_rated_capacity_check",
  "passports_capacity_fade_check",
  "passports_power_fade_check",
  "passports_expected_lifetime_check",
  "passports_waste_successor_role_check",
  "passports_authorisation_ref_check",
  "passports_waste_successor_check",
  "passports_authorisation_check",
  "passports_end_check",
  "passports_end_after_waste_check",
  "passport_purposes_pkey",
  "passport_purposes_passport_fkey",
  "passport_purposes_purpose_check",
  "passport_aspect_payloads_passport_fkey",
  "passport_aspect_payloads_key_check",
  "passport_aspect_payloads_pkey",
  "notifications_received_pkey",
  "notifications_received_operation_check",
  "notifications_received_outcome_check",
  "notifications_sent_pkey",
  "notifications_sent_message_id_key",
  "notifications_sent_operation_check",
  "notifications_sent_outcome_check",
  "passport_lineage_links_pkey",
  "passport_lineage_links_passport_fkey",
  "passport_lineage_links_status_check",
  "passport_lineage_links_operation_check",
  "passport_lineage_links_predecessor_key",
  "passport_successor_links_pkey",
  "passport_successor_links_passport_fkey",
  "passport_successor_links_operation_check",
  "passport_successor_links_notification_fkey",
  "passport_successor_links_successor_key",
  "passport_repair_entries_pkey",
  "passport_repair_entries_passport_fkey",
  "passport_repair_entries_notification_fkey",
  "passport_repair_entries_certificate_key",
  "passport_responsibility_intervals_pkey",
  "passport_responsibility_intervals_passport_fkey",
  "passport_responsibility_intervals_role_check",
  "passport_responsibility_intervals_period_check",
  "access_map_versions_pkey",
  "access_map_versions_model_fkey",
  "access_map_versions_model_version_key",
  "access_map_entries_map_fkey",
  "access_map_entries_twin_level_check",
  "access_map_entries_group_check",
  "access_map_entries_pkey",
  "passport_access_records_pkey",
  "passport_access_records_passport_fkey",
  "passport_access_records_role_check",
  "passport_access_records_key_check",
  "passport_access_records_period_check",
  "passport_write_decisions_pkey",
  "passport_write_decisions_decision_check",
  "passport_write_decisions_kind_check",
  "issuer_contracts_pkey",
  "issuer_contracts_side_check",
  "issuer_contracts_passport_fkey",
  "issuer_contracts_pull_state_check",
  "issuer_contracts_side_columns_check",
  "received_battery_information_pkey",
  "received_battery_information_contract_fkey",
];

// The indexes of section 9.4.1 that no constraint creates.
const PLAIN_INDEXES = [
  "passports_battery_identifier_idx",
  "passports_battery_model_idx",
  "passport_purposes_original_key",
  "passport_purposes_passport_idx",
  "notifications_received_passport_idx",
  "notifications_sent_due_idx",
  "passport_responsibility_intervals_open_key",
  "passport_access_records_open_key",
  "passport_write_decisions_passport_idx",
  "issuer_contracts_open_key",
];

// The columns with the privilege UPDATE of the role refserver_app, by the table of section 9.4.3.
const UPDATE_COLUMNS = {
  companies: ["legal_name", "legal_name_language", "address", "operator_identifier"],
  passports: [
    "lifecycle_status",
    "waste_successor_bpnl",
    "waste_successor_role",
    "waste_date",
    "successor_authorisation_ref",
    "successor_authorisation_valid_from",
    "successor_authorisation_valid_to",
    "recycling_date",
    "recycler_bpnl",
    "material_recycling_certificate_catena_x_id",
    "lineage_open",
  ],
  passport_aspect_payloads: ["payload", "updated_at"],
  passport_responsibility_intervals: ["valid_to"],
  notifications_sent: ["outcome", "cause", "http_status", "attempts", "attempted_at", "not_before", "receiver_did", "receiver_connector_url"],
  passport_access_records: ["valid_to"],
  issuer_contracts: ["pull_state", "pull_cause", "valid_to"],
};

// One column per table of section 9.4.3 that holds no privilege UPDATE.
const COLUMN_WITHOUT_UPDATE = {
  notifications_sent: "message_id",
  passport_access_records: "recipient_bpnl",
  passports: "date_of_manufacture",
  passport_aspect_payloads: "aspect_key",
  issuer_contracts: "issuer_bpnl",
  companies: "bpnl",
  passport_responsibility_intervals: "responsible_bpnl",
};

// The refusals of server/src/db/migrations/002_triggers.sql, each with the sentence of section 22.
function rule(refusalId, sentence, code = "P0001") {
  return { code, message: `${refusalId}: ${sentence}` };
}
const REFUSAL = {
  isolation: rule("ERR-DB-ISOLATION", "A transaction that writes a record of this schema runs at the isolation level READ COMMITTED."),
  today: rule("ERR-DB-TODAY", "The setting app.today is a date of the form YYYY-MM-DD.", "22007"),
  moved: rule("ERR-DB-APPEND-ONLY", "A record never moves to another passport."),
  identity: rule("ERR-DB-IDENTITY-PERMANENT", "The identifiers, the manufacturer and the battery model of a passport never change."),
  namedSuccessor: rule("ERR-DB-WASTE-SUCCESSOR", "The named successor, its role and the waste date of a waste passport never change."),
  reopened: rule("ERR-DB-LINEAGE", "The lineage of a passport is never opened again."),
  keepsValues: rule("ERR-DB-LINEAGE", "A new passport keeps a date of putting into service and its four performance values."),
  batteryModel: rule("ERR-DB-IDENTITY-PERMANENT", "A battery model is never updated and never deleted."),
  statusChange: rule("ERR-DB-STATUS-CHANGE", "The status of a passport changes only to waste, or to re-used from original, repurposed or remanufactured."),
  passportDeleted: rule("ERR-DB-PASSPORT-ENDED", "A passport is never deleted."),
  passportEnded: rule("ERR-DB-PASSPORT-ENDED", "An ended passport never changes."),
  wastePassport: rule("ERR-DB-SUCCESSOR-AUTHORISATION", "A waste passport changes only under an authorisation of the successor that is in force."),
  wasteRecord: rule("ERR-DB-SUCCESSOR-AUTHORISATION", "A record of a waste passport changes only under an authorisation of the successor that is in force."),
  insertedWaste: rule("ERR-DB-LINEAGE", "A passport is never inserted with the status waste."),
  newPassportNeeds: rule("ERR-DB-LINEAGE", "A new passport has a lineage link, a date of putting into service and its four performance values."),
  oneOperationDate: rule("ERR-DB-LINEAGE", "The lineage links of a new passport hold one operation date."),
  lineageStillOpen: rule("ERR-DB-LINEAGE", "The lineage of a new passport is closed before the commit."),
  oneOpenInterval: rule("ERR-DB-RESPONSIBILITY", "A passport has exactly one open responsibility interval."),
  firstInterval: rule(
    "ERR-DB-RESPONSIBILITY",
    "The first responsibility interval of a passport names the manufacturer as economic operator and starts at the date of manufacture at 00:00:00 UTC, or at the operation date of the lineage links of a new passport.",
  ),
  wasteInterval: rule(
    "ERR-DB-WASTE-SUCCESSOR",
    "The open responsibility interval of a waste passport names the successor and starts at the waste date, at which the earlier interval ends.",
  ),
  notWasteOneInterval: rule("ERR-DB-RESPONSIBILITY", "A passport that is not waste has one responsibility interval."),
  endDate: rule("ERR-DB-END-DATE", "The recycling date of a passport is not before the start of its open responsibility interval."),
  appendOnly: rule("ERR-DB-APPEND-ONLY", "A record of this table is never updated and never deleted."),
  intervalDeleted: rule("ERR-DB-APPEND-ONLY", "A responsibility interval is never deleted."),
  recordOfEnded: rule("ERR-DB-PASSPORT-ENDED", "A record of an ended passport never changes."),
  intervalInsert: rule("ERR-DB-RESPONSIBILITY", "A responsibility interval is inserted open and starts at the end of the earlier interval of its passport."),
  intervalEndOnly: rule("ERR-DB-APPEND-ONLY", "Only the end of an open responsibility interval is set."),
  linkWhileOpen: rule("ERR-DB-LINEAGE", "A lineage link is inserted only while the lineage of its new passport is open."),
};
const NO_PRIVILEGE = { code: "42501" };

let db;
let admin;
const models = {};
let sequence = 0;

function nextName(prefix) {
  sequence += 1;
  return `${prefix}-${process.pid}-${sequence}`;
}

// Asserts that the statement fails with the expected SQLSTATE and, where the expectation names
// them, with the expected constraint name, column name and message.
async function assertRefused(run, expected, label) {
  let error;
  try {
    await run();
  } catch (caught) {
    error = caught;
  }
  assert.ok(error, `${label}: the statement succeeded, and the expected refusal is ${JSON.stringify(expected)}`);
  assert.equal(error.code, expected.code, `${label}: the statement failed with ${error.code}: ${error.message}`);
  if (Object.hasOwn(expected, "constraint")) assert.equal(error.constraint, expected.constraint, `${label}: ${error.message}`);
  if (Object.hasOwn(expected, "column")) assert.equal(error.column, expected.column, `${label}: ${error.message}`);
  if (Object.hasOwn(expected, "message")) assert.equal(error.message, expected.message, label);
}

async function begin(client, { today, level } = {}) {
  await client.query(level ? `BEGIN ISOLATION LEVEL ${level}` : "BEGIN");
  if (today !== undefined) await client.query("SELECT set_config('app.today', $1, true)", [today]);
}

// Runs the work in one transaction of the client and commits.
async function committed(client, work, options) {
  await begin(client, options);
  try {
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}

// Runs the work in one transaction of the client and rolls the transaction back.
async function rolledBack(client, work, options) {
  await begin(client, options);
  try {
    return await work(client);
  } finally {
    await client.query("ROLLBACK");
  }
}

// Runs the work in one transaction whose every statement succeeds and whose COMMIT is refused.
async function refusedAtCommit(client, work, expected, label, options) {
  await begin(client, options);
  try {
    await work(client);
  } catch (error) {
    await client.query("ROLLBACK");
    throw new Error(`${label}: a statement before the commit failed with ${error.code}: ${error.message}`, { cause: error });
  }
  try {
    await assertRefused(() => client.query("COMMIT"), expected, label);
  } finally {
    await client.query("ROLLBACK");
  }
}

// Runs the setup and then one statement that is refused, in one transaction that is rolled back.
async function refusedStatement(client, statement, expected, label, options) {
  await rolledBack(client, () => assertRefused(() => statement(client), expected, label), options);
}

async function insertRow(client, table, row, { overriding = false } = {}) {
  const columns = Object.keys(row);
  const placeholders = columns.map((_, index) => `$${index + 1}`);
  const result = await client.query(
    `INSERT INTO ${table} (${columns.join(", ")})${overriding ? " OVERRIDING SYSTEM VALUE" : ""} VALUES (${placeholders.join(", ")}) RETURNING *`,
    columns.map((column) => row[column]),
  );
  return result.rows[0];
}

// The rows of the fixtures. Every value is invented test data.
function companyRow(bpnl, overrides = {}) {
  return { bpnl, legal_name: `Example Company ${bpnl.slice(-4)}`, address: { street: "Example Street 1", country: "DE" }, ...overrides };
}
function modelRow(bpnl, overrides = {}) {
  return { manufacturer_bpnl: bpnl, manufacturer_part_id: nextName("part"), ...overrides };
}
function passportRow(overrides = {}) {
  const manufacturer = overrides.manufacturer_bpnl ?? COMPANY_A;
  return {
    battery_identifier: nextName("battery"),
    manufacturer_bpnl: manufacturer,
    battery_model_id: models[manufacturer],
    lifecycle_status: "original",
    battery_category: "ev",
    facility_bpns: SITE,
    date_of_manufacture: MANUFACTURE_DATE,
    ...overrides,
  };
}
function newPassportRow(overrides = {}) {
  return passportRow({
    lifecycle_status: "repurposed",
    date_into_service: "2026-03-02",
    rated_capacity_ah: 100,
    capacity_fade_percent: 5,
    power_fade_percent: 4,
    expected_lifetime_years: 8,
    ...overrides,
  });
}
function wasteColumns(overrides = {}) {
  return { lifecycle_status: "waste", waste_successor_bpnl: SUCCESSOR, waste_successor_role: "wasteManagementOperator", waste_date: WASTE_DATE, ...overrides };
}
function purposeRow(passportId, overrides = {}) {
  return { passport_id: passportId, purpose: "The battery powers an electric vehicle.", is_original: false, recorded_at: "2026-02-01T10:00:00Z", ...overrides };
}
function payloadRow(passportId, overrides = {}) {
  return { passport_id: passportId, aspect_key: "serial-part", payload: { partInstanceId: "example" }, ...overrides };
}
function receivedRow(overrides = {}) {
  return {
    message_id: `urn:uuid:${randomUUID()}`,
    operation: "NewPassportIssued",
    sender_bpnl: COMPANY_B,
    passport_identifier: nextName("passport"),
    message: { header: {}, content: {} },
    outcome: "applied",
    received_at: "2026-03-01T09:00:00Z",
    ...overrides,
  };
}
function sentRow(overrides = {}) {
  return {
    message_id: `urn:uuid:${randomUUID()}`,
    operation: "PassportEnded",
    receiver_bpnl: COMPANY_B,
    passport_identifier: nextName("passport"),
    message: { header: {}, content: {} },
    not_before: "2026-03-01T09:00:00Z",
    ...overrides,
  };
}
function linkRow(passportId, overrides = {}) {
  return {
    passport_id: passportId,
    predecessor_passport_identifier: nextName("predecessor"),
    predecessor_catena_x_id: randomUUID(),
    predecessor_data_provider_bpnl: COMPANY_B,
    predecessor_battery_identifier: nextName("battery"),
    predecessor_status: "original",
    predecessor_original_model_catena_x_id: randomUUID(),
    operation: "repurposing",
    operation_date: OPERATION_DATE,
    ...overrides,
  };
}
function successorLinkRow(passportId, messageId, overrides = {}) {
  return {
    passport_id: passportId,
    successor_passport_identifier: nextName("successor"),
    successor_catena_x_id: randomUUID(),
    second_life_operator_bpnl: COMPANY_B,
    operation: "repurposing",
    operation_date: OPERATION_DATE,
    notification_message_id: messageId,
    ...overrides,
  };
}
function repairRow(passportId, overrides = {}) {
  return { passport_id: passportId, repair_date: "2026-02-10T10:00:00Z", repair_certificate_catena_x_id: randomUUID(), repairer_bpnl: RECYCLER, ...overrides };
}
function intervalRow(passportId, overrides = {}) {
  return { passport_id: passportId, responsible_bpnl: COMPANY_A, role: "economicOperator", valid_from: MANUFACTURE_INSTANT, ...overrides };
}
function mapVersionRow(modelId, overrides = {}) {
  return { battery_model_id: modelId, map_version: nextName("version"), valid_from: "2027-02-18", ...overrides };
}
function mapEntryRow(mapId, overrides = {}) {
  return {
    map_id: mapId,
    aspect: "urn:samm:io.admin-shell.idta.batterypass.digital_nameplate:1.0.0#BatteryNameplate",
    twin_level: "PartInstance",
    path: `$.${nextName("Field")}`,
    access_group: "public",
    legal_basis: "Annex XIII point 1(a)",
    ...overrides,
  };
}
function accessRow(passportId, overrides = {}) {
  return { passport_id: passportId, recipient_bpnl: COMPANY_B, recipient_role: "purchaser", aspect_key: "lifecycle", valid_from: "2026-02-01T00:00:00Z", ...overrides };
}
function decisionRow(overrides = {}) {
  return { decided_at: "2026-02-01T00:00:00Z", decision: "granted", requester_bpnl: COMPANY_A, requester_kind: "operator", action: "createPassport", ...overrides };
}
function providerContractRow(passportId, overrides = {}) {
  return { side: "provider", passport_identifier: nextName("passport"), passport_id: passportId, issuer_bpnl: COMPANY_B, provider_bpnl: COMPANY_A, valid_from: "2026-02-01T00:00:00Z", ...overrides };
}
function issuerContractRow(overrides = {}) {
  return {
    side: "issuer",
    passport_identifier: nextName("passport"),
    battery_identifier: nextName("battery"),
    issuer_bpnl: COMPANY_A,
    provider_bpnl: COMPANY_B,
    pull_state: "pending",
    valid_from: "2026-02-01T00:00:00Z",
    ...overrides,
  };
}
function informationRow(contractId, overrides = {}) {
  return {
    contract_id: contractId,
    passport_identifier: nextName("passport"),
    battery_identifier: nextName("battery"),
    agreement_id: nextName("agreement"),
    payload: { stateOfHealth: 90 },
    received_at: "2026-03-01T09:00:00Z",
    ...overrides,
  };
}

// The statements of the lifecycle steps. Each function runs inside the transaction of its caller.
async function writeFirstPassport(client, overrides = {}, intervalOverrides = {}) {
  const row = passportRow(overrides);
  const passport = await insertRow(client, "passports", row);
  await insertRow(
    client,
    "passport_responsibility_intervals",
    intervalRow(passport.id, { responsible_bpnl: row.manufacturer_bpnl, valid_from: `${row.date_of_manufacture}T00:00:00Z`, ...intervalOverrides }),
  );
  return passport;
}
async function writeNewPassport(client, overrides = {}, { operationDates = [OPERATION_DATE], close = true, intervalOverrides = {} } = {}) {
  const row = newPassportRow(overrides);
  const passport = await insertRow(client, "passports", row);
  const links = [];
  for (const operationDate of operationDates) {
    links.push(await insertRow(client, "passport_lineage_links", linkRow(passport.id, { operation_date: operationDate })));
  }
  if (close) await client.query("UPDATE passports SET lineage_open = false WHERE id = $1", [passport.id]);
  await insertRow(
    client,
    "passport_responsibility_intervals",
    intervalRow(passport.id, { responsible_bpnl: row.manufacturer_bpnl, valid_from: operationDates[operationDates.length - 1], ...intervalOverrides }),
  );
  return { ...passport, links };
}
// The waste step in the order of section 10.4: the status with the successor, the end of the open
// interval, the interval of the successor, and the access record of the successor.
async function writeWasteStep(client, passportId, { successor = SUCCESSOR, role = "wasteManagementOperator", wasteDate = WASTE_DATE, interval = {} } = {}) {
  const updated = await client.query(
    "UPDATE passports SET lifecycle_status = 'waste', waste_successor_bpnl = $2, waste_successor_role = $3, waste_date = $4 WHERE id = $1",
    [passportId, successor, role, wasteDate],
  );
  await client.query("UPDATE passport_responsibility_intervals SET valid_to = $2 WHERE passport_id = $1 AND valid_to IS NULL", [passportId, wasteDate]);
  await insertRow(client, "passport_responsibility_intervals", { passport_id: passportId, responsible_bpnl: successor, role, valid_from: wasteDate, ...interval });
  await insertRow(client, "passport_access_records", accessRow(passportId, { recipient_bpnl: successor, recipient_role: "successor", valid_from: wasteDate }));
  return updated;
}
function writeEnd(client, passportId, { recyclingDate = RECYCLING_DATE, recycler = RECYCLER, certificate = randomUUID() } = {}) {
  return client.query("UPDATE passports SET recycling_date = $2, recycler_bpnl = $3, material_recycling_certificate_catena_x_id = $4 WHERE id = $1", [
    passportId,
    recyclingDate,
    recycler,
    certificate,
  ]);
}
function writeAuthorisation(client, passportId, { from = AUTHORISATION_FROM, to = AUTHORISATION_TO } = {}) {
  return client.query(
    "UPDATE passports SET successor_authorisation_ref = $2, successor_authorisation_valid_from = $3, successor_authorisation_valid_to = $4 WHERE id = $1",
    [passportId, "The written authorisation of the successor, reference 2026-001.", from, to],
  );
}

// Committed fixtures through the superuser.
const createFirstPassport = (overrides) => committed(admin, (client) => writeFirstPassport(client, overrides));
const createNewPassport = (overrides, options) => committed(admin, (client) => writeNewPassport(client, overrides, options));
async function createWastePassport({ authorised = false, start = "first", children } = {}) {
  const passport = start === "new" ? await createNewPassport() : await createFirstPassport();
  if (children) await children(passport);
  await committed(admin, (client) => writeWasteStep(client, passport.id));
  if (authorised) await writeAuthorisation(admin, passport.id);
  return passport;
}
async function createReceivedNotification(overrides) {
  return (await insertRow(admin, "notifications_received", receivedRow(overrides))).message_id;
}

// The connection settings of a transaction of the role refserver_app.
const asCompany = (bpnl) => ({ actingBpnl: bpnl, today: TODAY });

// Runs the work on a connection of the role refserver_app in a transaction without the setting app.acting_bpnl.
async function withoutSetting(work) {
  const client = await db.appPool.connect();
  try {
    await client.query("BEGIN ISOLATION LEVEL READ COMMITTED READ WRITE");
    assert.equal((await client.query("SELECT COALESCE(current_setting('app.acting_bpnl', true), '') AS value")).rows[0].value, "");
    return await work(client);
  } finally {
    await client.query("ROLLBACK");
    client.release();
  }
}

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}
const settle = (promise) => promise.then((value) => ({ value }), (error) => ({ error }));
const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
async function backendPid(client) {
  return (await client.query("SELECT pg_backend_pid() AS pid")).rows[0].pid;
}
// Waits until the backend of the process id waits for a lock that another backend holds.
async function waitUntilBlocked(pid, label) {
  for (let attempt = 0; attempt < 400; attempt += 1) {
    const result = await admin.query("SELECT cardinality(pg_blocking_pids($1)) AS blockers", [pid]);
    if (result.rows[0].blockers > 0) return;
    await sleep(25);
  }
  assert.fail(`${label}: the second client did not block`);
}

before(async () => {
  db = await createTestDatabase("databaseRules.integration.test.mjs");
  admin = db.adminClient;
  for (const bpnl of [COMPANY_A, COMPANY_B]) {
    await insertRow(admin, "companies", companyRow(bpnl));
    models[bpnl] = (await insertRow(admin, "battery_models", modelRow(bpnl))).id;
  }
});

after(async () => {
  if (db) await db.drop();
});

test("(a) catalogue", async (t) => {
  const schema = db.schema;
  const names = async (sql, parameters = [schema]) => (await admin.query(sql, parameters)).rows.map((row) => row.name).sort();
  const functionsWithoutSearchPath = () =>
    admin.query(
      `SELECT p.proname AS name FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = $1 AND NOT (COALESCE(p.proconfig, ARRAY[]::text[]) @> ARRAY['search_path=' || $1 || ', pg_temp'])`,
      [schema],
    );

  await t.test("SwR-RDB-007: a second run of migrate applies no file, and schema_migrations holds the three file names", async () => {
    assert.deepEqual(await migrate(admin, { schema }), []);
    assert.deepEqual(await names("SELECT name FROM schema_migrations", []), ["001_schema.sql", "002_triggers.sql", "003_policies.sql"]);
  });

  await t.test("SwR-RDB-007: the 17 tables and the table schema_migrations exist by their names in pg_tables", async () => {
    assert.equal(TABLES.length, 17);
    assert.deepEqual(await names("SELECT tablename AS name FROM pg_tables WHERE schemaname = $1"), [...TABLES, "schema_migrations"].sort());
  });

  await t.test("SwR-RDB-007: the 16 functions exist by their names in pg_proc", async () => {
    assert.equal(FUNCTIONS.length, 16);
    assert.deepEqual(await names("SELECT p.proname AS name FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = $1"), [...FUNCTIONS].sort());
  });

  await t.test("SwR-RDB-007: the 37 triggers exist by their names and their tables in pg_trigger", async () => {
    assert.equal(Object.keys(TRIGGERS).length, 37);
    const result = await admin.query(
      `SELECT g.tgname AS name, c.relname AS table_name FROM pg_trigger g JOIN pg_class c ON c.oid = g.tgrelid JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = $1 AND NOT g.tgisinternal`,
      [schema],
    );
    assert.deepEqual(Object.fromEntries(result.rows.map((row) => [row.name, row.table_name]).sort()), Object.fromEntries(Object.entries(TRIGGERS).sort()));
    assert.equal(result.rowCount, 37);
  });

  await t.test("SwR-RDB-007: the 12 policies exist by their names and their tables in pg_policies, each for the role refserver_app", async () => {
    assert.equal(Object.keys(POLICIES).length, 12);
    const result = await admin.query("SELECT policyname AS name, tablename, roles::text[] AS roles, cmd FROM pg_policies WHERE schemaname = $1", [schema]);
    assert.deepEqual(Object.fromEntries(result.rows.map((row) => [row.name, row.tablename]).sort()), Object.fromEntries(Object.entries(POLICIES).sort()));
    for (const row of result.rows) {
      assert.deepEqual(row.roles, ["refserver_app"], row.name);
      assert.equal(row.cmd, "ALL", row.name);
    }
  });

  await t.test("SwR-RDB-007: the twelve tables with a policy have row-level security enabled and forced, and the five other tables have none", async () => {
    const result = await admin.query(
      "SELECT c.relname AS name, c.relrowsecurity AS enabled, c.relforcerowsecurity AS forced FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = $1 AND c.relkind = 'r'",
      [schema],
    );
    const withPolicy = new Set(Object.values(POLICIES));
    for (const row of result.rows) {
      assert.equal(row.enabled, withPolicy.has(row.name), `relrowsecurity of ${row.name}`);
      assert.equal(row.forced, withPolicy.has(row.name), `relforcerowsecurity of ${row.name}`);
    }
  });

  await t.test("SwR-RDB-007: the four domain constraints exist by their names in pg_constraint", async () => {
    assert.deepEqual(
      await names("SELECT c.conname AS name FROM pg_constraint c JOIN pg_namespace n ON n.oid = c.connamespace WHERE n.nspname = $1 AND c.contypid <> 0"),
      [...DOMAIN_CONSTRAINTS].sort(),
    );
  });

  await t.test("SwR-RDB-075: every named constraint of section 9.4.1 exists by its name in pg_constraint, and the 17 tables hold no further constraint", async () => {
    assert.deepEqual(
      await names(
        `SELECT c.conname AS name FROM pg_constraint c JOIN pg_namespace n ON n.oid = c.connamespace JOIN pg_class r ON r.oid = c.conrelid
          WHERE n.nspname = $1 AND c.contype IN ('p', 'u', 'c', 'f') AND r.relname <> 'schema_migrations'`,
      ),
      [...TABLE_CONSTRAINTS].sort(),
    );
  });

  await t.test("SwR-RDB-007: every index of section 9.4.1 exists by its name in pg_indexes, and the schema holds no further index", async () => {
    const constraintIndexes = TABLE_CONSTRAINTS.filter((name) => name.endsWith("_pkey") || name.endsWith("_key"));
    assert.deepEqual(await names("SELECT indexname AS name FROM pg_indexes WHERE schemaname = $1"), [...constraintIndexes, ...PLAIN_INDEXES, "schema_migrations_pkey"].sort());
    const unique = await names(
      "SELECT i.relname AS name FROM pg_index x JOIN pg_class i ON i.oid = x.indexrelid JOIN pg_namespace n ON n.oid = i.relnamespace WHERE n.nspname = $1 AND x.indisunique AND i.relname = ANY($2)",
      [schema, PLAIN_INDEXES],
    );
    assert.deepEqual(unique, ["issuer_contracts_open_key", "passport_access_records_open_key", "passport_purposes_original_key", "passport_responsibility_intervals_open_key"]);
  });

  await t.test("SwR-RDB-007: every foreign key is ON DELETE RESTRICT and has no ON UPDATE action", async () => {
    const result = await admin.query(
      "SELECT c.conname AS name, c.confdeltype AS on_delete, c.confupdtype AS on_update FROM pg_constraint c JOIN pg_namespace n ON n.oid = c.connamespace WHERE n.nspname = $1 AND c.contype = 'f'",
      [schema],
    );
    assert.equal(result.rowCount, 16);
    for (const row of result.rows) {
      assert.equal(row.on_delete, "r", row.name);
      assert.equal(row.on_update, "a", row.name);
    }
  });

  await t.test("SwR-RDB-007: no column of the 17 tables has the type timestamptz or date without a domain", async () => {
    const result = await admin.query(
      `SELECT c.relname AS table_name, a.attname AS column_name FROM pg_attribute a JOIN pg_class c ON c.oid = a.attrelid JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = $1 AND c.relkind = 'r' AND c.relname <> 'schema_migrations' AND a.attnum > 0 AND NOT a.attisdropped
          AND a.atttypid IN ('timestamptz'::regtype, 'date'::regtype, 'timestamp'::regtype)`,
      [schema],
    );
    assert.deepEqual(result.rows, []);
    const domains = await admin.query(
      `SELECT t.typname AS name, count(*)::int AS columns FROM pg_attribute a JOIN pg_class c ON c.oid = a.attrelid JOIN pg_namespace n ON n.oid = c.relnamespace JOIN pg_type t ON t.oid = a.atttypid
        WHERE n.nspname = $1 AND c.relkind = 'r' AND a.attnum > 0 AND t.typname IN ('finite_timestamptz', 'finite_date') GROUP BY t.typname`,
      [schema],
    );
    const counts = Object.fromEntries(domains.rows.map((row) => [row.name, row.columns]));
    assert.equal(counts.finite_timestamptz + counts.finite_date, 40, "decision D68 (Finite dates and no NaN) counts 40 columns of the two types");
    const lastColumns = await admin.query(
      `SELECT c.relname AS name FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = $1 AND c.relkind = 'r' AND c.relname <> 'schema_migrations'
          AND (SELECT a.attname FROM pg_attribute a WHERE a.attrelid = c.oid AND a.attnum > 0 ORDER BY a.attnum DESC LIMIT 1) <> 'created_at'`,
      [schema],
    );
    assert.deepEqual(lastColumns.rows, [], "every table has the column created_at as its last column");
  });

  await t.test("SwR-RDB-007: pg_proc.proconfig of every function of the schema holds the search path of the schema and pg_temp, and app_today also holds DateStyle", async () => {
    assert.deepEqual((await functionsWithoutSearchPath()).rows, []);
    const counted = await admin.query("SELECT count(*)::int AS functions FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = $1", [schema]);
    assert.equal(counted.rows[0].functions, 16);
    const today = await admin.query("SELECT p.proconfig FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = $1 AND p.proname = 'app_today'", [schema]);
    assert.deepEqual([...today.rows[0].proconfig].sort(), ["DateStyle=ISO, YMD", `search_path=${schema}, pg_temp`].sort());
    const invoker = await admin.query("SELECT count(*)::int AS definers FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = $1 AND p.prosecdef", [schema]);
    assert.equal(invoker.rows[0].definers, 0, "every function is SECURITY INVOKER");
  });

  await t.test("SwR-RDB-007: the source of every function of the schema that returns trigger holds the call PERFORM require_read_committed(); as its first statement", async () => {
    const result = await admin.query(
      "SELECT p.proname AS name, p.prosrc AS source FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = $1 AND p.prorettype = 'trigger'::regtype",
      [schema],
    );
    assert.equal(result.rowCount, 14);
    for (const row of result.rows) {
      assert.ok(row.source.includes("PERFORM require_read_committed();"), `${row.name} holds no call`);
      assert.match(row.source, /\bBEGIN\s+PERFORM require_read_committed\(\);/, `${row.name} does not call the helper in its first statement`);
    }
  });

  await t.test("SwR-RDB-007: after CREATE OR REPLACE FUNCTION refuse_change() in a transaction that is rolled back, the query of the search path finds one function", async () => {
    await rolledBack(admin, async () => {
      await admin.query(`CREATE OR REPLACE FUNCTION refuse_change() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER AS $$
BEGIN
  PERFORM require_read_committed();
  RAISE EXCEPTION 'ERR-DB-APPEND-ONLY: A record of this table is never updated and never deleted.' USING ERRCODE = 'P0001';
END $$`);
      assert.deepEqual((await functionsWithoutSearchPath()).rows, [{ name: "refuse_change" }]);
    });
    assert.deepEqual((await functionsWithoutSearchPath()).rows, []);
  });

  await t.test("SwR-RDB-007: the role refserver_app holds no privilege TEMPORARY of the database and no privilege CREATE of the schema of the test and of the schema public", async () => {
    const result = await admin.query(
      `SELECT has_database_privilege('refserver_app', current_database(), 'TEMPORARY') AS temporary,
              has_schema_privilege('refserver_app', $1, 'CREATE') AS create_own,
              has_schema_privilege('refserver_app', 'public', 'CREATE') AS create_public,
              has_schema_privilege('refserver_app', $1, 'USAGE') AS usage_own`,
      [schema],
    );
    assert.deepEqual(result.rows[0], { temporary: false, create_own: false, create_public: false, usage_own: true });
    const attributes = await admin.query("SELECT rolsuper, rolcreatedb, rolcreaterole, rolinherit, rolbypassrls, rolcanlogin FROM pg_roles WHERE rolname = 'refserver_app'");
    assert.deepEqual(attributes.rows[0], { rolsuper: false, rolcreatedb: false, rolcreaterole: false, rolinherit: false, rolbypassrls: false, rolcanlogin: true });
  });

  await t.test("SwR-RDB-007: pg_db_role_setting holds no row of the role refserver_app", async () => {
    const result = await admin.query("SELECT s.setconfig FROM pg_db_role_setting s JOIN pg_roles r ON r.oid = s.setrole WHERE r.rolname = 'refserver_app'");
    assert.deepEqual(result.rows, []);
  });

  await t.test("SwR-RDB-007: the column privileges UPDATE of the role refserver_app equal the table of section 9.4.3, and the role holds no privilege UPDATE, DELETE or TRUNCATE on a table", async () => {
    const columns = await admin.query(
      "SELECT table_name, column_name FROM information_schema.column_privileges WHERE grantee = 'refserver_app' AND table_schema = $1 AND privilege_type = 'UPDATE'",
      [schema],
    );
    const granted = {};
    for (const row of columns.rows) (granted[row.table_name] ??= []).push(row.column_name);
    for (const table of Object.keys(granted)) granted[table].sort();
    const expected = Object.fromEntries(Object.entries(UPDATE_COLUMNS).map(([table, tableColumns]) => [table, [...tableColumns].sort()]));
    assert.deepEqual(granted, expected);
    const tables = await admin.query(
      "SELECT table_name, privilege_type FROM information_schema.table_privileges WHERE grantee = 'refserver_app' AND table_schema = $1 AND privilege_type IN ('UPDATE', 'DELETE', 'TRUNCATE')",
      [schema],
    );
    assert.deepEqual(tables.rows, []);
    const all = await admin.query(
      "SELECT table_name, privilege_type FROM information_schema.table_privileges WHERE grantee = 'refserver_app' AND table_schema = $1 ORDER BY table_name, privilege_type",
      [schema],
    );
    const expectedTablePrivileges = [...TABLES.flatMap((table) => [`${table} INSERT`, `${table} SELECT`]), "schema_migrations SELECT"].sort();
    assert.deepEqual(all.rows.map((row) => `${row.table_name} ${row.privilege_type}`).sort(), expectedTablePrivileges);
  });
});

test("(b) constraints", async (t) => {
  const passport = await createFirstPassport();
  const messageId = await createReceivedNotification();
  const mapVersion = await insertRow(admin, "access_map_versions", mapVersionRow(models[COMPANY_A]));
  const contract = await insertRow(admin, "issuer_contracts", issuerContractRow());
  const wastePassportRow = (overrides = {}) => passportRow(wasteColumns(overrides));
  const authorisedRow = (overrides = {}) =>
    wastePassportRow({ successor_authorisation_ref: "reference 2026-001", successor_authorisation_valid_from: AUTHORISATION_FROM, ...overrides });
  const insert = (table, row, options) => (client) => insertRow(client, table, row(), options);
  // Inserts a passport whose lineage is open, and then a lineage link of that passport.
  const insertLink = (overrides) => async (client) => {
    const open = await insertRow(client, "passports", newPassportRow());
    return insertRow(client, "passport_lineage_links", linkRow(open.id, overrides));
  };
  // Inserts a passport and then its first responsibility interval.
  const insertInterval = (overrides) => async (client) => {
    const fresh = await insertRow(client, "passports", passportRow());
    return insertRow(client, "passport_responsibility_intervals", intervalRow(fresh.id, overrides));
  };
  const updateOpenInterval = (validTo) => (client) =>
    client.query("UPDATE passport_responsibility_intervals SET valid_to = $2 WHERE passport_id = $1 AND valid_to IS NULL", [passport.id, validTo]);

  // One accepted and one refused statement per case. Each statement runs in a transaction that the test rolls back.
  async function runCases(group, expectedOf, cases) {
    for (const [name, accept, refuse] of cases) {
      const [constraint, detail] = name.split(": ");
      await t.test(`SwR-RDB-075: ${group} ${name}`, async () => {
        await rolledBack(admin, accept);
        await refusedStatement(admin, refuse, expectedOf(constraint), `${constraint}${detail ? ` (${detail})` : ""}`);
      });
    }
  }

  await runCases("the CHECK constraint", (constraint) => ({ code: "23514", constraint }), [
    ["companies_legal_name_check: an empty legal name", insert("companies", () => companyRow(FURTHER_COMPANY, { legal_name: "n".repeat(300) })), insert("companies", () => companyRow(FURTHER_COMPANY, { legal_name: "" }))],
    ["companies_legal_name_check: a legal name of 301 characters", insert("companies", () => companyRow(FURTHER_COMPANY, { legal_name: "n" })), insert("companies", () => companyRow(FURTHER_COMPANY, { legal_name: "n".repeat(301) }))],
    ["battery_models_part_id_check: an empty part id", insert("battery_models", () => modelRow(COMPANY_A, { manufacturer_part_id: "p".repeat(200) })), insert("battery_models", () => modelRow(COMPANY_A, { manufacturer_part_id: "" }))],
    ["battery_models_part_id_check: a part id of 201 characters", insert("battery_models", () => modelRow(COMPANY_A)), insert("battery_models", () => modelRow(COMPANY_A, { manufacturer_part_id: "p".repeat(201) }))],
    [
      "battery_models_original_check: an original model without its manufacturer",
      insert("battery_models", () => modelRow(COMPANY_A, { original_model_catena_x_id: randomUUID(), original_model_manufacturer_bpnl: COMPANY_B })),
      insert("battery_models", () => modelRow(COMPANY_A, { original_model_catena_x_id: randomUUID() })),
    ],
    ["battery_models_original_check: a manufacturer of the original model without the model", insert("battery_models", () => modelRow(COMPANY_A)), insert("battery_models", () => modelRow(COMPANY_A, { original_model_manufacturer_bpnl: COMPANY_B }))],
    ["passports_passport_identifier_check: an empty passport identifier", insert("passports", () => passportRow({ passport_identifier: "i" })), insert("passports", () => passportRow({ passport_identifier: "" }))],
    [
      "passports_passport_identifier_check: a passport identifier of 201 characters",
      // A passport identifier of 200 characters of two bytes each succeeds.
      async (client) => {
        const identifier = String.fromCharCode(233).repeat(200);
        assert.equal(Buffer.byteLength(identifier, "utf8"), 400);
        const inserted = await insertRow(client, "passports", passportRow({ passport_identifier: identifier }));
        assert.equal(inserted.passport_identifier, identifier);
      },
      insert("passports", () => passportRow({ passport_identifier: "i".repeat(201) })),
    ],
    ["passports_battery_identifier_check: an empty battery identifier", insert("passports", () => passportRow({ battery_identifier: "b".repeat(200) })), insert("passports", () => passportRow({ battery_identifier: "" }))],
    ["passports_battery_identifier_check: a battery identifier of 201 characters", insert("passports", () => passportRow()), insert("passports", () => passportRow({ battery_identifier: "b".repeat(201) }))],
    ["passports_lifecycle_status_check: the status ended", insert("passports", () => passportRow({ lifecycle_status: "re-used" })), insert("passports", () => passportRow({ lifecycle_status: "ended" }))],
    ["passports_battery_category_check: the category car", insert("passports", () => passportRow({ battery_category: "stationary" })), insert("passports", () => passportRow({ battery_category: "car" }))],
    ["passports_rated_capacity_check: the value 0", insert("passports", () => passportRow({ rated_capacity_ah: 0.01 })), insert("passports", () => passportRow({ rated_capacity_ah: 0 }))],
    ["passports_rated_capacity_check: the value NaN", insert("passports", () => passportRow({ rated_capacity_ah: 99999999.99 })), insert("passports", () => passportRow({ rated_capacity_ah: "NaN" }))],
    ["passports_capacity_fade_check: the value 100.01", insert("passports", () => passportRow({ capacity_fade_percent: 100 })), insert("passports", () => passportRow({ capacity_fade_percent: 100.01 }))],
    ["passports_capacity_fade_check: the value -0.01", insert("passports", () => passportRow({ capacity_fade_percent: 0 })), insert("passports", () => passportRow({ capacity_fade_percent: -0.01 }))],
    ["passports_capacity_fade_check: the value NaN", insert("passports", () => passportRow({ capacity_fade_percent: 50 })), insert("passports", () => passportRow({ capacity_fade_percent: "NaN" }))],
    ["passports_power_fade_check: the value 100.01", insert("passports", () => passportRow({ power_fade_percent: 100 })), insert("passports", () => passportRow({ power_fade_percent: 100.01 }))],
    ["passports_power_fade_check: the value NaN", insert("passports", () => passportRow({ power_fade_percent: 0 })), insert("passports", () => passportRow({ power_fade_percent: "NaN" }))],
    ["passports_expected_lifetime_check: the value 0", insert("passports", () => passportRow({ expected_lifetime_years: 0.1 })), insert("passports", () => passportRow({ expected_lifetime_years: 0 }))],
    ["passports_expected_lifetime_check: the value NaN", insert("passports", () => passportRow({ expected_lifetime_years: 999.9 })), insert("passports", () => passportRow({ expected_lifetime_years: "NaN" }))],
    ["passports_waste_successor_role_check: the role recycler", insert("passports", () => wastePassportRow({ waste_successor_role: "producer" })), insert("passports", () => wastePassportRow({ waste_successor_role: "recycler" }))],
    ["passports_authorisation_ref_check: an empty reference", insert("passports", () => authorisedRow({ successor_authorisation_ref: "r".repeat(500) })), insert("passports", () => authorisedRow({ successor_authorisation_ref: "" }))],
    ["passports_authorisation_ref_check: a reference of 501 characters", insert("passports", () => authorisedRow()), insert("passports", () => authorisedRow({ successor_authorisation_ref: "r".repeat(501) }))],
    ["passports_waste_successor_check: a successor on a passport that is not waste", insert("passports", () => wastePassportRow()), insert("passports", () => passportRow(wasteColumns({ lifecycle_status: "original" })))],
    ["passports_waste_successor_check: the status waste without a successor", insert("passports", () => passportRow()), insert("passports", () => passportRow({ lifecycle_status: "waste" }))],
    ["passports_waste_successor_check: a successor without a role", insert("passports", () => wastePassportRow()), insert("passports", () => wastePassportRow({ waste_successor_role: null }))],
    ["passports_waste_successor_check: a successor without a waste date", insert("passports", () => wastePassportRow()), insert("passports", () => wastePassportRow({ waste_date: null }))],
    ["passports_authorisation_check: a reference without a first day", insert("passports", () => authorisedRow()), insert("passports", () => authorisedRow({ successor_authorisation_valid_from: null }))],
    ["passports_authorisation_check: a first day without a reference", insert("passports", () => authorisedRow()), insert("passports", () => wastePassportRow({ successor_authorisation_valid_from: AUTHORISATION_FROM }))],
    ["passports_authorisation_check: a last day without a reference", insert("passports", () => authorisedRow({ successor_authorisation_valid_to: AUTHORISATION_TO })), insert("passports", () => wastePassportRow({ successor_authorisation_valid_to: AUTHORISATION_TO }))],
    [
      "passports_authorisation_check: a last day before the first day",
      insert("passports", () => authorisedRow({ successor_authorisation_valid_to: AUTHORISATION_FROM })),
      insert("passports", () => authorisedRow({ successor_authorisation_valid_to: "2026-06-09" })),
    ],
    [
      "passports_authorisation_check: an authorisation on a passport that is not waste",
      insert("passports", () => authorisedRow()),
      insert("passports", () => passportRow({ successor_authorisation_ref: "reference 2026-001", successor_authorisation_valid_from: AUTHORISATION_FROM })),
    ],
    ["passports_end_check: a recycling date without a recycler", insert("passports", () => passportRow({ recycling_date: RECYCLING_DATE, recycler_bpnl: RECYCLER })), insert("passports", () => passportRow({ recycling_date: RECYCLING_DATE }))],
    ["passports_end_check: a recycler without a recycling date", insert("passports", () => passportRow()), insert("passports", () => passportRow({ recycler_bpnl: RECYCLER }))],
    [
      "passports_end_check: a certificate without a recycling date",
      insert("passports", () => passportRow({ recycling_date: RECYCLING_DATE, recycler_bpnl: RECYCLER, material_recycling_certificate_catena_x_id: randomUUID() })),
      insert("passports", () => passportRow({ material_recycling_certificate_catena_x_id: randomUUID() })),
    ],
    [
      "passports_end_after_waste_check: a recycling date before the waste date",
      insert("passports", () => wastePassportRow({ recycling_date: WASTE_DATE, recycler_bpnl: RECYCLER })),
      insert("passports", () => wastePassportRow({ recycling_date: "2026-05-01T11:59:59Z", recycler_bpnl: RECYCLER })),
    ],
    ["passport_purposes_purpose_check: an empty purpose", insert("passport_purposes", () => purposeRow(passport.id, { purpose: "p".repeat(2000) })), insert("passport_purposes", () => purposeRow(passport.id, { purpose: "" }))],
    ["passport_purposes_purpose_check: a purpose of 2001 characters", insert("passport_purposes", () => purposeRow(passport.id)), insert("passport_purposes", () => purposeRow(passport.id, { purpose: "p".repeat(2001) }))],
    ["passport_aspect_payloads_key_check: the key lifecycle", insert("passport_aspect_payloads", () => payloadRow(passport.id, { aspect_key: "single-level-bom-as-built" })), insert("passport_aspect_payloads", () => payloadRow(passport.id, { aspect_key: "lifecycle" }))],
    ["notifications_received_operation_check: the operation PassportMoved", insert("notifications_received", () => receivedRow({ operation: "BatteryBecameWaste" })), insert("notifications_received", () => receivedRow({ operation: "PassportMoved" }))],
    ["notifications_received_outcome_check: the outcome duplicate", insert("notifications_received", () => receivedRow({ outcome: "recorded" })), insert("notifications_received", () => receivedRow({ outcome: "duplicate" }))],
    ["notifications_sent_operation_check: the operation PassportMoved", insert("notifications_sent", () => sentRow({ operation: "BatteryRepaired" })), insert("notifications_sent", () => sentRow({ operation: "PassportMoved" }))],
    ["notifications_sent_outcome_check: the outcome queued", insert("notifications_sent", () => sentRow({ outcome: "transport_failed" })), insert("notifications_sent", () => sentRow({ outcome: "queued" }))],
    ["passport_lineage_links_status_check: the status ended", insertLink({ predecessor_status: "waste" }), insertLink({ predecessor_status: "ended" })],
    ["passport_lineage_links_operation_check: the operation repair", insertLink({ operation: "preparationForReUse" }), insertLink({ operation: "repair" })],
    [
      "passport_successor_links_operation_check: the operation repair",
      insert("passport_successor_links", () => successorLinkRow(passport.id, messageId, { operation: "remanufacturing" })),
      insert("passport_successor_links", () => successorLinkRow(passport.id, messageId, { operation: "repair" })),
    ],
    ["passport_responsibility_intervals_role_check: the role recycler", insertInterval({ role: "producerResponsibilityOrganisation" }), insertInterval({ role: "recycler" })],
    ["passport_responsibility_intervals_period_check: an end before the start", updateOpenInterval(MANUFACTURE_INSTANT), updateOpenInterval("2026-01-09T23:59:59Z")],
    ["access_map_entries_twin_level_check: the level Shell", insert("access_map_entries", () => mapEntryRow(mapVersion.id, { twin_level: "PartType" })), insert("access_map_entries", () => mapEntryRow(mapVersion.id, { twin_level: "Shell" }))],
    ["access_map_entries_group_check: the group everyone", insert("access_map_entries", () => mapEntryRow(mapVersion.id, { access_group: "legitimateInterestBattery" })), insert("access_map_entries", () => mapEntryRow(mapVersion.id, { access_group: "everyone" }))],
    ["passport_access_records_role_check: the role recycler", insert("passport_access_records", () => accessRow(passport.id, { recipient_role: "marketSurveillanceAuthority" })), insert("passport_access_records", () => accessRow(passport.id, { recipient_role: "recycler" }))],
    ["passport_access_records_key_check: the key access-map", insert("passport_access_records", () => accessRow(passport.id, { aspect_key: "successors" })), insert("passport_access_records", () => accessRow(passport.id, { aspect_key: "access-map" }))],
    [
      "passport_access_records_period_check: an end before the start",
      insert("passport_access_records", () => accessRow(passport.id, { valid_to: "2026-02-01T00:00:00Z" })),
      insert("passport_access_records", () => accessRow(passport.id, { valid_to: "2026-01-31T23:59:59Z" })),
    ],
    ["passport_write_decisions_decision_check: the decision pending", insert("passport_write_decisions", () => decisionRow({ decision: "refused" })), insert("passport_write_decisions", () => decisionRow({ decision: "pending" }))],
    ["passport_write_decisions_kind_check: the kind authority", insert("passport_write_decisions", () => decisionRow({ requester_kind: "partner" })), insert("passport_write_decisions", () => decisionRow({ requester_kind: "authority" }))],
    ["issuer_contracts_side_check: the side other", insert("issuer_contracts", () => issuerContractRow()), insert("issuer_contracts", () => issuerContractRow({ side: "other" }))],
    ["issuer_contracts_pull_state_check: the state unknown", insert("issuer_contracts", () => issuerContractRow({ pull_state: "received" })), insert("issuer_contracts", () => issuerContractRow({ pull_state: "unknown" }))],
    ["issuer_contracts_side_columns_check: the side provider with a pull state", insert("issuer_contracts", () => providerContractRow(passport.id)), insert("issuer_contracts", () => providerContractRow(passport.id, { pull_state: "pending" }))],
    ["issuer_contracts_side_columns_check: the side issuer without a pull state", insert("issuer_contracts", () => issuerContractRow()), insert("issuer_contracts", () => issuerContractRow({ pull_state: null }))],
    ["issuer_contracts_side_columns_check: the side issuer with a passport", insert("issuer_contracts", () => issuerContractRow()), insert("issuer_contracts", () => issuerContractRow({ passport_id: passport.id }))],
    ["issuer_contracts_side_columns_check: the side issuer without a battery identifier", insert("issuer_contracts", () => issuerContractRow()), insert("issuer_contracts", () => issuerContractRow({ battery_identifier: null }))],
    [
      "issuer_contracts_side_columns_check: the side provider with a passport and a product condition",
      insert("issuer_contracts", () => providerContractRow(null, { product_condition: { stateOfHealth: 90 } })),
      insert("issuer_contracts", () => providerContractRow(passport.id, { product_condition: { stateOfHealth: 90 } })),
    ],
    ["issuer_contracts_side_columns_check: the side provider without a passport and without a product condition", insert("issuer_contracts", () => providerContractRow(passport.id)), insert("issuer_contracts", () => providerContractRow(null))],
  ]);

  await runCases("the domain constraint", (constraint) => ({ code: "23514", constraint }), [
    ["bpnl_check: a Business Partner Number of 7 characters", insert("companies", () => companyRow(FURTHER_COMPANY)), insert("companies", () => companyRow("BPNL123"))],
    ["bpnl_check: the prefix in lower case", insert("passports", () => wastePassportRow({ waste_successor_bpnl: OTHER_SUCCESSOR })), insert("passports", () => wastePassportRow({ waste_successor_bpnl: "bpnl00000000TCK4" }))],
    ["bpns_check: a site number with the prefix BPNL", insert("passports", () => passportRow({ facility_bpns: SITE })), insert("passports", () => passportRow({ facility_bpns: COMPANY_A }))],
    ["finite_timestamptz_check: the value infinity", insert("notifications_received", () => receivedRow()), insert("notifications_received", () => receivedRow({ received_at: "infinity" }))],
    ["finite_timestamptz_check: the value -infinity", insert("notifications_received", () => receivedRow()), insert("notifications_received", () => receivedRow({ received_at: "-infinity" }))],
    ["finite_date_check: the value infinity", insert("passports", () => passportRow()), insert("passports", () => passportRow({ date_of_manufacture: "infinity" }))],
    ["finite_date_check: the value -infinity", insert("passports", () => passportRow()), insert("passports", () => passportRow({ date_of_manufacture: "-infinity" }))],
  ]);

  // Inserts one row and then a second row with the identity of the first row.
  const twiceWithIdentity = (table, row) => async (client) => {
    const first = await insertRow(client, table, row());
    await insertRow(client, table, { ...row(), id: first.id }, { overriding: true });
  };
  const twice = (table, first, second = first) => async (client) => {
    await insertRow(client, table, first());
    await insertRow(client, table, second());
  };
  // Returns the first row at the first call and the second row at each later call.
  const alternate = (first, second) => {
    let calls = 0;
    return () => {
      calls += 1;
      return calls === 1 ? first() : second();
    };
  };
  const fixed = (value) => {
    const stored = value();
    return () => stored;
  };
  await runCases("the UNIQUE constraint or unique index", (constraint) => ({ code: "23505", constraint }), [
    ["companies_pkey", insert("companies", () => companyRow(FURTHER_COMPANY)), insert("companies", () => companyRow(COMPANY_A))],
    ["battery_models_pkey", insert("battery_models", () => modelRow(COMPANY_A)), insert("battery_models", () => modelRow(COMPANY_A, { id: models[COMPANY_A] }))],
    ["battery_models_manufacturer_part_key", insert("battery_models", () => modelRow(COMPANY_A)), twice("battery_models", fixed(() => modelRow(COMPANY_A)))],
    ["passports_pkey", insert("passports", () => passportRow({ id: randomUUID() })), insert("passports", () => passportRow({ id: passport.id }))],
    ["passports_passport_identifier_key", insert("passports", () => passportRow({ passport_identifier: nextName("identifier") })), insert("passports", () => passportRow({ passport_identifier: passport.passport_identifier }))],
    ["passport_purposes_pkey", insert("passport_purposes", () => purposeRow(passport.id)), twiceWithIdentity("passport_purposes", () => purposeRow(passport.id))],
    ["passport_purposes_original_key", insert("passport_purposes", () => purposeRow(passport.id, { is_original: true })), twice("passport_purposes", () => purposeRow(passport.id, { is_original: true }))],
    ["passport_aspect_payloads_pkey", insert("passport_aspect_payloads", () => payloadRow(passport.id)), twice("passport_aspect_payloads", () => payloadRow(passport.id))],
    ["notifications_received_pkey", insert("notifications_received", () => receivedRow()), insert("notifications_received", () => receivedRow({ message_id: messageId }))],
    ["notifications_sent_pkey", insert("notifications_sent", () => sentRow()), twiceWithIdentity("notifications_sent", () => sentRow())],
    ["notifications_sent_message_id_key", insert("notifications_sent", () => sentRow()), twice("notifications_sent", fixed(() => sentRow()))],
    [
      "passport_lineage_links_pkey",
      insertLink({}),
      async (client) => {
        const open = await insertRow(client, "passports", newPassportRow());
        const first = await insertRow(client, "passport_lineage_links", linkRow(open.id));
        await insertRow(client, "passport_lineage_links", { ...linkRow(open.id), id: first.id }, { overriding: true });
      },
    ],
    [
      "passport_lineage_links_predecessor_key",
      insertLink({}),
      async (client) => {
        const open = await insertRow(client, "passports", newPassportRow());
        const first = await insertRow(client, "passport_lineage_links", linkRow(open.id));
        await insertRow(client, "passport_lineage_links", linkRow(open.id, { predecessor_passport_identifier: first.predecessor_passport_identifier }));
      },
    ],
    ["passport_successor_links_pkey", insert("passport_successor_links", () => successorLinkRow(passport.id, messageId)), twiceWithIdentity("passport_successor_links", () => successorLinkRow(passport.id, messageId))],
    ["passport_successor_links_successor_key", insert("passport_successor_links", () => successorLinkRow(passport.id, messageId)), twice("passport_successor_links", fixed(() => successorLinkRow(passport.id, messageId)))],
    ["passport_repair_entries_pkey", insert("passport_repair_entries", () => repairRow(passport.id)), twiceWithIdentity("passport_repair_entries", () => repairRow(passport.id))],
    ["passport_repair_entries_certificate_key", insert("passport_repair_entries", () => repairRow(passport.id)), twice("passport_repair_entries", fixed(() => repairRow(passport.id)))],
    [
      "passport_responsibility_intervals_pkey",
      insertInterval({}),
      async (client) => {
        const first = await insertInterval({})(client);
        const second = await insertRow(client, "passports", passportRow());
        await insertRow(client, "passport_responsibility_intervals", { ...intervalRow(second.id), id: first.id }, { overriding: true });
      },
    ],
    ["access_map_versions_pkey", insert("access_map_versions", () => mapVersionRow(models[COMPANY_A])), insert("access_map_versions", () => ({ ...mapVersionRow(models[COMPANY_A]), id: mapVersion.id }), { overriding: true })],
    ["access_map_versions_model_version_key", insert("access_map_versions", () => mapVersionRow(models[COMPANY_A])), insert("access_map_versions", () => mapVersionRow(models[COMPANY_A], { map_version: mapVersion.map_version }))],
    ["access_map_entries_pkey", insert("access_map_entries", () => mapEntryRow(mapVersion.id)), twice("access_map_entries", fixed(() => mapEntryRow(mapVersion.id)))],
    ["passport_access_records_pkey", insert("passport_access_records", () => accessRow(passport.id)), twiceWithIdentity("passport_access_records", alternate(() => accessRow(passport.id, { recipient_bpnl: SUCCESSOR }), () => accessRow(passport.id, { recipient_bpnl: OTHER_SUCCESSOR })))],
    [
      "passport_access_records_open_key",
      // A second record of the same recipient is accepted when the first record is closed.
      twice("passport_access_records", () => accessRow(passport.id, { valid_to: "2026-02-02T00:00:00Z" }), () => accessRow(passport.id)),
      twice("passport_access_records", () => accessRow(passport.id)),
    ],
    ["passport_write_decisions_pkey", insert("passport_write_decisions", () => decisionRow()), twiceWithIdentity("passport_write_decisions", () => decisionRow())],
    ["issuer_contracts_pkey", insert("issuer_contracts", () => issuerContractRow({ id: randomUUID() })), insert("issuer_contracts", () => issuerContractRow({ id: contract.id }))],
    [
      "issuer_contracts_open_key",
      twice("issuer_contracts", () => issuerContractRow({ passport_identifier: "one-passport", valid_to: "2026-02-02T00:00:00Z" }), () => issuerContractRow({ passport_identifier: "one-passport" })),
      twice("issuer_contracts", () => issuerContractRow({ passport_identifier: "one-passport" })),
    ],
    ["received_battery_information_pkey", insert("received_battery_information", () => informationRow(contract.id)), twiceWithIdentity("received_battery_information", () => informationRow(contract.id))],
  ]);

  await runCases("the NOT NULL column", (column) => ({ code: "23502", column }), [
    ["manufacturer_bpnl: a passport without a manufacturer", insert("passports", () => passportRow()), insert("passports", () => ({ ...passportRow(), manufacturer_bpnl: null }))],
    ["battery_model_id: a passport without a battery model", insert("passports", () => passportRow()), insert("passports", () => ({ ...passportRow(), battery_model_id: null }))],
    ["date_of_manufacture: a passport without a date of manufacture", insert("passports", () => passportRow()), insert("passports", () => passportRow({ date_of_manufacture: null }))],
    ["address: a company without an address", insert("companies", () => companyRow(FURTHER_COMPANY)), insert("companies", () => companyRow(FURTHER_COMPANY, { address: null }))],
    ["payload: an aspect payload without a payload", insert("passport_aspect_payloads", () => payloadRow(passport.id)), insert("passport_aspect_payloads", () => payloadRow(passport.id, { payload: null }))],
    ["responsible_bpnl: a responsibility interval without a company", insertInterval({}), insertInterval({ responsible_bpnl: null })],
  ]);

  await runCases("the foreign key", (constraint) => ({ code: "23503", constraint }), [
    ["battery_models_manufacturer_fkey", insert("battery_models", () => modelRow(COMPANY_A)), insert("battery_models", () => modelRow(FURTHER_COMPANY))],
    ["passports_manufacturer_fkey", insert("passports", () => passportRow()), insert("passports", () => passportRow({ manufacturer_bpnl: FURTHER_COMPANY, battery_model_id: models[COMPANY_A] }))],
    ["passports_battery_model_fkey: a battery model of another manufacturer", insert("passports", () => passportRow()), insert("passports", () => passportRow({ battery_model_id: models[COMPANY_B] }))],
    ["passports_battery_model_fkey: an unknown battery model", insert("passports", () => passportRow()), insert("passports", () => passportRow({ battery_model_id: randomUUID() }))],
    ["passport_purposes_passport_fkey", insert("passport_purposes", () => purposeRow(passport.id)), insert("passport_purposes", () => purposeRow(randomUUID()))],
    ["passport_aspect_payloads_passport_fkey", insert("passport_aspect_payloads", () => payloadRow(passport.id)), insert("passport_aspect_payloads", () => payloadRow(randomUUID()))],
    ["passport_successor_links_passport_fkey", insert("passport_successor_links", () => successorLinkRow(passport.id, messageId)), insert("passport_successor_links", () => successorLinkRow(randomUUID(), messageId))],
    ["passport_successor_links_notification_fkey", insert("passport_successor_links", () => successorLinkRow(passport.id, messageId)), insert("passport_successor_links", () => successorLinkRow(passport.id, `urn:uuid:${randomUUID()}`))],
    ["passport_repair_entries_passport_fkey", insert("passport_repair_entries", () => repairRow(passport.id)), insert("passport_repair_entries", () => repairRow(randomUUID()))],
    ["passport_repair_entries_notification_fkey", insert("passport_repair_entries", () => repairRow(passport.id, { notification_message_id: messageId })), insert("passport_repair_entries", () => repairRow(passport.id, { notification_message_id: `urn:uuid:${randomUUID()}` }))],
    ["passport_responsibility_intervals_passport_fkey", insertInterval({}), insert("passport_responsibility_intervals", () => intervalRow(randomUUID()))],
    ["access_map_versions_model_fkey", insert("access_map_versions", () => mapVersionRow(models[COMPANY_A])), insert("access_map_versions", () => mapVersionRow(randomUUID()))],
    ["access_map_entries_map_fkey", insert("access_map_entries", () => mapEntryRow(mapVersion.id)), insert("access_map_entries", () => mapEntryRow(2147483647))],
    ["passport_access_records_passport_fkey", insert("passport_access_records", () => accessRow(passport.id)), insert("passport_access_records", () => accessRow(randomUUID()))],
    ["issuer_contracts_passport_fkey", insert("issuer_contracts", () => providerContractRow(passport.id)), insert("issuer_contracts", () => providerContractRow(randomUUID()))],
    ["received_battery_information_contract_fkey", insert("received_battery_information", () => informationRow(contract.id)), insert("received_battery_information", () => informationRow(randomUUID()))],
  ]);

  await t.test("SwR-RDB-075: every foreign key refuses the deletion of the referenced row, shown for a company that a battery model names", async () => {
    await refusedStatement(admin, (client) => client.query("DELETE FROM companies WHERE bpnl = $1", [COMPANY_A]), { code: "23503", constraint: "battery_models_manufacturer_fkey" }, "the deletion of a company");
  });

  await t.test("SwR-RDB-075: passport_lineage_links_passport_fkey is proven by the catalogue; an insert of a link for an unknown passport fails with ERR-DB-LINEAGE of trg_passport_lineage_links_insert", async () => {
    await refusedStatement(admin, (client) => insertRow(client, "passport_lineage_links", linkRow(randomUUID())), REFUSAL.linkWhileOpen, "a link for an unknown passport");
  });

  await t.test("SwR-RDB-075: battery_models_id_manufacturer_key is proven by the catalogue; an insert of a battery model with a stored id fails with 23505 on battery_models_pkey", async () => {
    await refusedStatement(
      admin,
      (client) => insertRow(client, "battery_models", modelRow(COMPANY_B, { id: models[COMPANY_A] })),
      { code: "23505", constraint: "battery_models_pkey" },
      "a battery model with a stored id",
    );
  });

  await t.test("SwR-RDB-073: passport_responsibility_intervals_open_key is proven by the catalogue; an insert of a second open interval fails with ERR-DB-RESPONSIBILITY of trg_interval_change", async () => {
    await refusedStatement(
      admin,
      (client) => insertRow(client, "passport_responsibility_intervals", intervalRow(passport.id)),
      REFUSAL.intervalInsert,
      "a second open interval",
    );
  });
});

test("(c) triggers", async (t) => {
  const messageId = await createReceivedNotification();
  // The aspect keys of the payload inserts of one passport, one key per insertion.
  let keyIndex = 0;
  function nextKey() {
    const keys = ["digital-nameplate", "handover-documentation", "carbon-footprint", "technical-data", "product-condition", "material-composition", "circularity", "dpp-metadata", "single-level-bom-as-built"];
    keyIndex += 1;
    return keys[keyIndex % keys.length];
  }
  // A passport with one record in each table of a passport.
  async function createPassportWithRecords({ start = "first" } = {}) {
    const passport = start === "new" ? await createNewPassport() : await createFirstPassport();
    const records = {
      payload: await insertRow(admin, "passport_aspect_payloads", payloadRow(passport.id)),
      purpose: await insertRow(admin, "passport_purposes", purposeRow(passport.id, { is_original: true })),
      repair: await insertRow(admin, "passport_repair_entries", repairRow(passport.id)),
      successorLink: await insertRow(admin, "passport_successor_links", successorLinkRow(passport.id, messageId)),
      access: await insertRow(admin, "passport_access_records", accessRow(passport.id)),
      decision: await insertRow(admin, "passport_write_decisions", decisionRow({ passport_id: passport.id })),
      contract: await insertRow(admin, "issuer_contracts", providerContractRow(passport.id)),
    };
    return { passport, records };
  }
  const openInterval = async (passportId) =>
    (await admin.query("SELECT * FROM passport_responsibility_intervals WHERE passport_id = $1 AND valid_to IS NULL", [passportId])).rows[0];

  await t.test("the nine triggers of refuse_passport_id_change()", async (t9) => {
    const target = await createFirstPassport();
    const { passport, records } = await createPassportWithRecords({ start: "new" });
    const moves = [
      ["trg_fixed_passport_passport_purposes", "passport_purposes", "id", records.purpose.id],
      ["trg_fixed_passport_passport_lineage_links", "passport_lineage_links", "id", passport.links[0].id],
      ["trg_fixed_passport_passport_successor_links", "passport_successor_links", "id", records.successorLink.id],
      ["trg_fixed_passport_passport_repair_entries", "passport_repair_entries", "id", records.repair.id],
      ["trg_fixed_passport_passport_responsibility_intervals", "passport_responsibility_intervals", "id", (await openInterval(passport.id)).id],
      ["trg_fixed_passport_passport_access_records", "passport_access_records", "id", records.access.id],
      ["trg_fixed_passport_passport_write_decisions", "passport_write_decisions", "id", records.decision.id],
      ["trg_fixed_passport_issuer_contracts", "issuer_contracts", "id", records.contract.id],
    ];
    for (const [trigger, table, key, value] of moves) {
      await t9.test(`SwR-RDB-007: ${trigger} refuses an update that sets passport_id of a record of ${table} to the id of another passport`, async () => {
        await assertRefused(() => admin.query(`UPDATE ${table} SET passport_id = $1 WHERE ${key} = $2`, [target.id, value]), REFUSAL.moved, trigger);
        if (table === "passport_write_decisions") {
          await assertRefused(() => admin.query("UPDATE passport_write_decisions SET passport_id = NULL WHERE id = $1", [value]), REFUSAL.moved, `${trigger}, to no passport`);
        }
      });
    }

    await t9.test("SwR-RDB-007: trg_fixed_passport_passport_aspect_payloads refuses the move of an aspect payload out of an ended passport", async () => {
      const ended = await createFirstPassport();
      await insertRow(admin, "passport_aspect_payloads", payloadRow(ended.id));
      await writeEnd(admin, ended.id);
      await assertRefused(() => admin.query("UPDATE passport_aspect_payloads SET passport_id = $1 WHERE passport_id = $2", [target.id, ended.id]), REFUSAL.moved, "out of an ended passport");
    });

    await t9.test("SwR-RDB-007: trg_fixed_passport_passport_aspect_payloads refuses the move of an aspect payload out of a waste passport without an authorisation", async () => {
      const waste = await createWastePassport({ children: (created) => insertRow(admin, "passport_aspect_payloads", payloadRow(created.id)) });
      await assertRefused(() => admin.query("UPDATE passport_aspect_payloads SET passport_id = $1 WHERE passport_id = $2", [target.id, waste.id]), REFUSAL.moved, "out of a waste passport");
    });

    await t9.test("SwR-RDB-007: an update of another column succeeds on passport_aspect_payloads, passport_responsibility_intervals, passport_access_records and issuer_contracts", async () => {
      const payload = await admin.query("UPDATE passport_aspect_payloads SET payload = $2, updated_at = now() WHERE passport_id = $1", [passport.id, { partInstanceId: "changed" }]);
      assert.equal(payload.rowCount, 1);
      const access = await admin.query("UPDATE passport_access_records SET valid_to = $2 WHERE id = $1", [records.access.id, "2026-04-01T00:00:00Z"]);
      assert.equal(access.rowCount, 1);
      const contract = await admin.query("UPDATE issuer_contracts SET valid_to = $2 WHERE id = $1", [records.contract.id, "2026-04-01T00:00:00Z"]);
      assert.equal(contract.rowCount, 1);
      // The waste step sets the end of the open interval, which is the update of another column of an interval.
      const waste = await createFirstPassport();
      await committed(admin, (client) => writeWasteStep(client, waste.id));
      const intervals = await admin.query("SELECT valid_to IS NULL AS open FROM passport_responsibility_intervals WHERE passport_id = $1 ORDER BY valid_from, id", [waste.id]);
      assert.deepEqual(intervals.rows, [{ open: false }, { open: true }]);
    });

    await t9.test("SwR-RDB-007: an update of another column fails with the sentence of refuse_change() on the five append-only tables with a column passport_id", async () => {
      const updates = [
        ["passport_purposes", "purpose = 'changed'", records.purpose.id],
        ["passport_lineage_links", "operation = 'remanufacturing'", passport.links[0].id],
        ["passport_successor_links", "operation = 'remanufacturing'", records.successorLink.id],
        ["passport_repair_entries", "repairer_bpnl = 'BPNL00000000TCK2'", records.repair.id],
        ["passport_write_decisions", "action = 'changed'", records.decision.id],
      ];
      for (const [table, assignment, id] of updates) {
        await assertRefused(() => admin.query(`UPDATE ${table} SET ${assignment} WHERE id = $1`, [id]), REFUSAL.appendOnly, table);
      }
    });
  });

  await t.test("trg_passport_insert", async (t1) => {
    for (const [status, expected] of [["original", false], ["waste", false], ["re-used", true], ["repurposed", true], ["remanufactured", true]]) {
      await t1.test(`SwR-RDB-007: trg_passport_insert sets lineage_open to ${expected} for a passport inserted with the status ${status}`, async () => {
        await rolledBack(admin, async (client) => {
          const row = status === "waste" ? passportRow(wasteColumns()) : status === "original" ? passportRow() : newPassportRow({ lifecycle_status: status });
          assert.equal((await insertRow(client, "passports", { ...row, lineage_open: !expected })).lineage_open, expected);
        });
      });
    }
    await t1.test("SwR-RDB-007: an insertion of a re-used passport with lineage_open = false in the statement returns true", async () => {
      await rolledBack(admin, async (client) => {
        const result = await client.query(
          `INSERT INTO passports (battery_identifier, manufacturer_bpnl, battery_model_id, lifecycle_status, battery_category, facility_bpns, date_of_manufacture, lineage_open)
           VALUES ($1, $2, $3, 're-used', 'ev', $4, $5, false) RETURNING lineage_open`,
          [nextName("battery"), COMPANY_A, models[COMPANY_A], SITE, MANUFACTURE_DATE],
        );
        assert.equal(result.rows[0].lineage_open, true);
      });
    });
  });

  await t.test("the eight triggers that refuse every row of their events", async (t8) => {
    const { passport, records } = await createPassportWithRecords({ start: "new" });
    const received = await insertRow(admin, "notifications_received", receivedRow());
    const contract = await insertRow(admin, "issuer_contracts", issuerContractRow());
    const information = await insertRow(admin, "received_battery_information", informationRow(contract.id));
    const cases = [
      ["trg_battery_model_identity", "battery_models", "id", models[COMPANY_A], "manufacturer_part_id = 'changed'", REFUSAL.batteryModel, () => insertRow(admin, "battery_models", modelRow(COMPANY_A))],
      ["trg_passport_purposes_append_only", "passport_purposes", "id", records.purpose.id, "purpose = 'changed'", REFUSAL.appendOnly, () => insertRow(admin, "passport_purposes", purposeRow(passport.id))],
      ["trg_passport_lineage_links_append_only", "passport_lineage_links", "id", passport.links[0].id, "predecessor_status = 'waste'", REFUSAL.appendOnly, () => createNewPassport()],
      ["trg_passport_repair_entries_append_only", "passport_repair_entries", "id", records.repair.id, "repair_date = now()", REFUSAL.appendOnly, () => insertRow(admin, "passport_repair_entries", repairRow(passport.id))],
      ["trg_passport_successor_links_append_only", "passport_successor_links", "id", records.successorLink.id, "operation_date = now()", REFUSAL.appendOnly, () => insertRow(admin, "passport_successor_links", successorLinkRow(passport.id, messageId))],
      ["trg_notifications_received_append_only", "notifications_received", "message_id", received.message_id, "outcome = 'recorded'", REFUSAL.appendOnly, () => insertRow(admin, "notifications_received", receivedRow())],
      ["trg_passport_write_decisions_append_only", "passport_write_decisions", "id", records.decision.id, "decision = 'refused'", REFUSAL.appendOnly, () => insertRow(admin, "passport_write_decisions", decisionRow())],
      ["trg_received_battery_information_append_only", "received_battery_information", "id", information.id, "agreement_id = 'changed'", REFUSAL.appendOnly, () => insertRow(admin, "received_battery_information", informationRow(contract.id))],
    ];
    for (const [trigger, table, key, value, assignment, expected, accepted] of cases) {
      await t8.test(`SwR-RDB-007: ${trigger} refuses the update and the deletion of a record of ${table}, and the insertion succeeds`, async () => {
        assert.ok(await accepted());
        await assertRefused(() => admin.query(`UPDATE ${table} SET ${assignment} WHERE ${key} = $1`, [value]), expected, `${trigger}, update`);
        await assertRefused(() => admin.query(`DELETE FROM ${table} WHERE ${key} = $1`, [value]), expected, `${trigger}, deletion`);
        assert.equal((await admin.query(`SELECT count(*)::int AS stored FROM ${table} WHERE ${key} = $1`, [value])).rows[0].stored, 1);
      });
    }
    await t8.test("SwR-RDB-007: an update and a deletion of a purpose record of a passport that is not waste fail with ERR-DB-APPEND-ONLY", async () => {
      const first = await createFirstPassport();
      const purpose = await insertRow(admin, "passport_purposes", purposeRow(first.id, { is_original: true }));
      await assertRefused(() => admin.query("UPDATE passport_purposes SET is_original = false WHERE id = $1", [purpose.id]), REFUSAL.appendOnly, "update of a purpose");
      await assertRefused(() => admin.query("DELETE FROM passport_purposes WHERE id = $1", [purpose.id]), REFUSAL.appendOnly, "deletion of a purpose");
    });
  });

  await t.test("the nineteen triggers with one accepted and one refused statement each", async (t19) => {
    await t19.test("SwR-DATASET-208: trg_passport_identity admits an update of another column and refuses an update of manufacturer_bpnl by the superuser", async () => {
      const passport = await createFirstPassport();
      assert.equal((await admin.query("UPDATE passports SET battery_category = 'industrial' WHERE id = $1", [passport.id])).rowCount, 1);
      assert.equal((await admin.query("SELECT rolsuper FROM pg_roles WHERE rolname = current_user")).rows[0].rolsuper, true);
      await assertRefused(() => admin.query("UPDATE passports SET manufacturer_bpnl = $2 WHERE id = $1", [passport.id, COMPANY_B]), REFUSAL.identity, "manufacturer_bpnl");
      await assertRefused(() => admin.query("UPDATE passports SET manufacturer_bpnl = $2, battery_model_id = $3 WHERE id = $1", [passport.id, COMPANY_B, models[COMPANY_B]]), REFUSAL.identity, "manufacturer_bpnl with the battery model of the other company");
      await assertRefused(() => admin.query("UPDATE passports SET id = $2 WHERE id = $1", [passport.id, randomUUID()]), REFUSAL.identity, "id");
      await assertRefused(() => admin.query("UPDATE passports SET passport_identifier = 'changed' WHERE id = $1", [passport.id]), REFUSAL.identity, "passport_identifier");
      await assertRefused(() => admin.query("UPDATE passports SET battery_identifier = 'changed' WHERE id = $1", [passport.id]), REFUSAL.identity, "battery_identifier");
      const otherModel = await insertRow(admin, "battery_models", modelRow(COMPANY_A));
      await assertRefused(() => admin.query("UPDATE passports SET battery_model_id = $2 WHERE id = $1", [passport.id, otherModel.id]), REFUSAL.identity, "battery_model_id");
      assert.equal((await admin.query("SELECT manufacturer_bpnl FROM passports WHERE id = $1", [passport.id])).rows[0].manufacturer_bpnl, COMPANY_A);
    });

    await t19.test("SwR-RDB-074: trg_passport_status_change admits the status re-used from original, repurposed and remanufactured and the status waste, and refuses every other change", async () => {
      const passports = {
        original: () => createFirstPassport(),
        repurposed: () => createNewPassport({ lifecycle_status: "repurposed" }),
        remanufactured: () => createNewPassport({ lifecycle_status: "remanufactured" }),
        "re-used": () => createNewPassport({ lifecycle_status: "re-used" }),
      };
      for (const [from, create] of Object.entries(passports)) {
        for (const to of ["original", "repurposed", "re-used", "remanufactured"]) {
          if (to === from) continue;
          const passport = await create();
          const update = () => admin.query("UPDATE passports SET lifecycle_status = $2 WHERE id = $1", [passport.id, to]);
          if (to === "re-used") assert.equal((await update()).rowCount, 1, `${from} to ${to}`);
          else await assertRefused(update, REFUSAL.statusChange, `${from} to ${to}`);
        }
        const toWaste = await create();
        await committed(admin, (client) => writeWasteStep(client, toWaste.id, { wasteDate: "2026-04-01T00:00:00Z" }));
        assert.equal((await admin.query("SELECT lifecycle_status FROM passports WHERE id = $1", [toWaste.id])).rows[0].lifecycle_status, "waste", `${from} to waste`);
      }
      const waste = await createWastePassport({ authorised: true });
      for (const to of ["original", "repurposed", "re-used", "remanufactured"]) {
        await refusedStatement(admin, (client) => client.query("UPDATE passports SET lifecycle_status = $2 WHERE id = $1", [waste.id, to]), REFUSAL.statusChange, `waste to ${to} under an authorisation in force`, { today: TODAY });
      }
    });

    await t19.test("SwR-RDB-007: trg_passport_ended admits the update that ends a passport and refuses a later update and every deletion of a passport", async () => {
      const passport = await createFirstPassport();
      assert.equal((await writeEnd(admin, passport.id)).rowCount, 1);
      await assertRefused(() => admin.query("UPDATE passports SET battery_category = 'lmt' WHERE id = $1", [passport.id]), REFUSAL.passportEnded, "update of an ended passport");
      await assertRefused(() => writeEnd(admin, passport.id, { recyclingDate: "2026-08-01T00:00:00Z" }), REFUSAL.passportEnded, "a second end of a passport");
      await assertRefused(() => admin.query("DELETE FROM passports WHERE id = $1", [passport.id]), REFUSAL.passportDeleted, "deletion of an ended passport");
      const open = await createFirstPassport();
      await assertRefused(() => admin.query("DELETE FROM passports WHERE id = $1", [open.id]), REFUSAL.passportDeleted, "deletion of a passport");
    });

    await t19.test("SwR-RDB-007: trg_passport_after_waste admits the record of the authorisation on a waste passport and refuses a change of another column without an authorisation", async () => {
      const waste = await createWastePassport();
      await refusedStatement(admin, (client) => client.query("UPDATE passports SET battery_category = 'lmt' WHERE id = $1", [waste.id]), REFUSAL.wastePassport, "a change without an authorisation", { today: TODAY });
      assert.equal((await writeAuthorisation(admin, waste.id)).rowCount, 1);
      await committed(admin, (client) => client.query("UPDATE passports SET battery_category = 'lmt' WHERE id = $1", [waste.id]), { today: TODAY });
      assert.equal((await admin.query("SELECT battery_category FROM passports WHERE id = $1", [waste.id])).rows[0].battery_category, "lmt");
    });

    await t19.test("SwR-RDB-007: the five triggers of check_child_after_waste() refuse a write on a record of a waste passport without an authorisation and admit the write under an authorisation in force", async () => {
      const waste = await createWastePassport({
        start: "new",
        children: (created) => insertRow(admin, "passport_aspect_payloads", payloadRow(created.id)),
      });
      const statements = (client) => ({
        "trg_passport_aspect_payloads_after_waste (update)": () => client.query("UPDATE passport_aspect_payloads SET payload = '{\"changed\": true}' WHERE passport_id = $1", [waste.id]),
        "trg_passport_aspect_payloads_after_waste (insertion)": () => insertRow(client, "passport_aspect_payloads", payloadRow(waste.id, { aspect_key: "circularity" })),
        "trg_passport_purposes_after_waste (insertion)": () => insertRow(client, "passport_purposes", purposeRow(waste.id)),
        "trg_passport_repair_entries_after_waste (insertion)": () => insertRow(client, "passport_repair_entries", repairRow(waste.id)),
        "trg_passport_successor_links_after_waste (insertion)": () => insertRow(client, "passport_successor_links", successorLinkRow(waste.id, messageId)),
      });
      const deleteLink = (client) => client.query("DELETE FROM passport_lineage_links WHERE id = $1", [waste.links[0].id]);
      for (const today of [TODAY, undefined]) {
        for (const label of Object.keys(statements(admin))) {
          await refusedStatement(admin, (client) => statements(client)[label](), REFUSAL.wasteRecord, `${label} without an authorisation, app.today ${today}`, { today });
        }
        await refusedStatement(admin, deleteLink, REFUSAL.wasteRecord, `trg_passport_lineage_links_after_waste (deletion) without an authorisation, app.today ${today}`, { today });
      }
      // An insertion of an access record succeeds on a waste passport without an authorisation.
      assert.ok(await insertRow(admin, "passport_access_records", accessRow(waste.id, { recipient_bpnl: COMPANY_B, aspect_key: "successors" })));
      await writeAuthorisation(admin, waste.id);
      for (const label of Object.keys(statements(admin))) {
        const result = await committed(admin, (client) => statements(client)[label](), { today: TODAY });
        assert.ok(result, `${label} under an authorisation in force`);
      }
      await refusedStatement(admin, deleteLink, REFUSAL.appendOnly, "the deletion of a lineage link under an authorisation in force", { today: TODAY });
      // Without the setting app.today the authorisation is not in force.
      await refusedStatement(admin, (client) => insertRow(client, "passport_purposes", purposeRow(waste.id)), REFUSAL.wasteRecord, "an insertion without the setting app.today");
    });

    await t19.test("SwR-RDB-007: trg_passport_lineage admits a new passport with its link and the closing update, also under a savepoint, and refuses a new passport without the closing update", async () => {
      const passport = await createNewPassport();
      assert.equal((await admin.query("SELECT lineage_open FROM passports WHERE id = $1", [passport.id])).rows[0].lineage_open, false);
      const underSavepoint = await committed(admin, async (client) => {
        await client.query("SAVEPOINT new_passport");
        const created = await insertRow(client, "passports", newPassportRow());
        await insertRow(client, "passport_lineage_links", linkRow(created.id));
        await client.query("UPDATE passports SET lineage_open = false WHERE id = $1", [created.id]);
        await client.query("RELEASE SAVEPOINT new_passport");
        await insertRow(client, "passport_responsibility_intervals", intervalRow(created.id, { valid_from: OPERATION_DATE }));
        return created;
      });
      assert.equal((await admin.query("SELECT count(*)::int AS links FROM passport_lineage_links WHERE passport_id = $1", [underSavepoint.id])).rows[0].links, 1);
      await refusedAtCommit(admin, (client) => writeNewPassport(client, {}, { close: false }), REFUSAL.lineageStillOpen, "a new passport without the closing update");
    });

    await t19.test("SwR-RDB-007: trg_passport_lineage refuses at the commit a passport inserted with the status waste, a new passport without a link, and a new passport without one of its five values", async () => {
      await refusedAtCommit(
        admin,
        async (client) => {
          const inserted = await insertRow(client, "passports", passportRow(wasteColumns()));
          await insertRow(client, "passport_responsibility_intervals", intervalRow(inserted.id));
          await client.query("UPDATE passport_responsibility_intervals SET valid_to = $2 WHERE passport_id = $1 AND valid_to IS NULL", [inserted.id, WASTE_DATE]);
          await insertRow(client, "passport_responsibility_intervals", intervalRow(inserted.id, { responsible_bpnl: SUCCESSOR, role: "wasteManagementOperator", valid_from: WASTE_DATE }));
        },
        REFUSAL.insertedWaste,
        "a passport inserted with the status waste and with its two intervals",
      );
      await refusedAtCommit(admin, (client) => insertRow(client, "passports", passportRow(wasteColumns())), REFUSAL.insertedWaste, "a passport inserted with the status waste and without an interval");
      await refusedAtCommit(
        admin,
        async (client) => {
          const created = await insertRow(client, "passports", newPassportRow());
          await client.query("UPDATE passports SET lineage_open = false WHERE id = $1", [created.id]);
          await insertRow(client, "passport_responsibility_intervals", intervalRow(created.id));
        },
        REFUSAL.newPassportNeeds,
        "a new passport without a link",
      );
      for (const column of ["date_into_service", "rated_capacity_ah", "capacity_fade_percent", "power_fade_percent", "expected_lifetime_years"]) {
        // The closing update of a new passport without one of its five values is refused in its statement,
        // and the commit of the passport with its link and without the closing update is refused as well.
        await rolledBack(admin, async (client) => {
          const created = await writeNewPassport(client, { [column]: null }, { close: false });
          await assertRefused(() => client.query("UPDATE passports SET lineage_open = false WHERE id = $1", [created.id]), REFUSAL.keepsValues, `the closing update of a new passport without ${column}`);
        });
        await refusedAtCommit(admin, (client) => writeNewPassport(client, { [column]: null }, { close: false }), REFUSAL.newPassportNeeds, `a new passport without ${column} and without the closing update`);
      }
    });

    await t19.test("SwR-RDB-007: no statement reaches the sentence on a passport inserted with the status original: the sentence is a part of the source of check_passport_lineage, and a link for such a passport of the same transaction fails with the sentence of trg_passport_lineage_links_insert", async () => {
      const source = await admin.query(
        "SELECT p.prosrc FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = $1 AND p.proname = 'check_passport_lineage'",
        [db.schema],
      );
      assert.equal(source.rowCount, 1);
      assert.ok(source.rows[0].prosrc.includes("ERR-DB-LINEAGE: A passport that is inserted with the status original has no lineage link."));
      await refusedStatement(
        admin,
        async (client) => {
          const original = await insertRow(client, "passports", passportRow());
          assert.equal(original.lifecycle_status, "original");
          assert.equal(original.lineage_open, false);
          await insertRow(client, "passport_lineage_links", linkRow(original.id));
        },
        REFUSAL.linkWhileOpen,
        "a link for a passport inserted with the status original in the same transaction",
      );
    });

    await t19.test("SwR-RDB-007: a new passport whose two links hold two operation dates fails at the commit, and a new passport whose two links hold one operation date commits", async () => {
      await refusedAtCommit(admin, (client) => writeNewPassport(client, {}, { operationDates: ["2026-02-28T08:00:00Z", OPERATION_DATE] }), REFUSAL.oneOperationDate, "two operation dates");
      const passport = await createNewPassport({ lifecycle_status: "remanufactured" }, { operationDates: [OPERATION_DATE, OPERATION_DATE] });
      assert.equal(passport.links.length, 2);
    });

    await t19.test("SwR-RDB-073: trg_passport_responsibility admits a passport with its first interval and refuses at the commit a passport inserted without a responsibility interval", async () => {
      assert.ok(await createFirstPassport());
      await refusedAtCommit(admin, (client) => insertRow(client, "passports", passportRow()), REFUSAL.oneOpenInterval, "a passport without an interval");
      await assertRefused(() => insertRow(admin, "passports", passportRow()), REFUSAL.oneOpenInterval, "a passport without an interval, in one statement");
    });

    await t19.test("SwR-RDB-073: trg_interval_responsibility refuses at the commit a second interval on a passport that is not waste", async () => {
      const passport = await createFirstPassport();
      await refusedAtCommit(
        admin,
        async (client) => {
          await client.query("UPDATE passport_responsibility_intervals SET valid_to = $2 WHERE passport_id = $1 AND valid_to IS NULL", [passport.id, WASTE_DATE]);
          await insertRow(client, "passport_responsibility_intervals", intervalRow(passport.id, { responsible_bpnl: SUCCESSOR, role: "producer", valid_from: WASTE_DATE }));
        },
        REFUSAL.notWasteOneInterval,
        "a second interval on a passport that is not waste",
      );
      // The end of the only interval without a new interval leaves no open interval.
      await assertRefused(
        () => admin.query("UPDATE passport_responsibility_intervals SET valid_to = $2 WHERE passport_id = $1 AND valid_to IS NULL", [passport.id, WASTE_DATE]),
        REFUSAL.oneOpenInterval,
        "the end of the only interval",
      );
    });

    await t19.test("SwR-RDB-073: a first interval that starts at another instant, a first interval of another company and a first interval with the role producer each fail at the commit", async () => {
      await refusedAtCommit(admin, (client) => writeFirstPassport(client, {}, { valid_from: "2026-01-10T00:00:01Z" }), REFUSAL.firstInterval, "a first interval one second after the date of manufacture at 00:00:00 UTC");
      await refusedAtCommit(admin, (client) => writeFirstPassport(client, {}, { valid_from: "2026-01-09T10:00:00Z" }), REFUSAL.firstInterval, "a first interval at the local midnight of the time zone UTC+14");
      await refusedAtCommit(admin, (client) => writeFirstPassport(client, {}, { responsible_bpnl: COMPANY_B }), REFUSAL.firstInterval, "a first interval of another company");
      await refusedAtCommit(admin, (client) => writeFirstPassport(client, {}, { role: "producer" }), REFUSAL.firstInterval, "a first interval with the role producer");
      await refusedAtCommit(admin, (client) => writeNewPassport(client, {}, { intervalOverrides: { valid_from: MANUFACTURE_INSTANT } }), REFUSAL.firstInterval, "the first interval of a new passport at the date of manufacture");
      await refusedAtCommit(admin, (client) => writeNewPassport(client, {}, { intervalOverrides: { valid_from: "2026-03-01T08:00:01Z" } }), REFUSAL.firstInterval, "the first interval of a new passport one second after the operation date");
    });

    await t19.test("SwR-RDB-073: trg_interval_change refuses an inserted interval with an end, a second open interval, and an interval that starts before or after the end of the closed interval", async () => {
      const passport = await createFirstPassport();
      await refusedStatement(
        admin,
        async (client) => {
          const fresh = await insertRow(client, "passports", passportRow());
          await insertRow(client, "passport_responsibility_intervals", intervalRow(fresh.id, { valid_to: WASTE_DATE }));
        },
        REFUSAL.intervalInsert,
        "an inserted interval with an end",
      );
      await assertRefused(() => insertRow(admin, "passport_responsibility_intervals", intervalRow(passport.id, { valid_from: WASTE_DATE })), REFUSAL.intervalInsert, "a second open interval");
      for (const [label, start] of [["before", "2026-05-01T11:59:59Z"], ["after", "2026-05-01T12:00:01Z"]]) {
        await refusedStatement(
          admin,
          async (client) => {
            await client.query("UPDATE passport_responsibility_intervals SET valid_to = $2 WHERE passport_id = $1 AND valid_to IS NULL", [passport.id, WASTE_DATE]);
            await insertRow(client, "passport_responsibility_intervals", intervalRow(passport.id, { responsible_bpnl: SUCCESSOR, role: "producer", valid_from: start }));
          },
          REFUSAL.intervalInsert,
          `an interval that starts ${label} the end of the closed interval`,
        );
      }
      await assertRefused(() => admin.query("DELETE FROM passport_responsibility_intervals WHERE passport_id = $1", [passport.id]), REFUSAL.intervalDeleted, "the deletion of an interval");
      await assertRefused(() => admin.query("UPDATE passport_responsibility_intervals SET role = 'producer' WHERE passport_id = $1", [passport.id]), REFUSAL.intervalEndOnly, "a change of the role of an interval");
      await assertRefused(() => admin.query("UPDATE passport_responsibility_intervals SET valid_from = $2 WHERE passport_id = $1", [passport.id, "2026-01-09T00:00:00Z"]), REFUSAL.intervalEndOnly, "a change of the start of an interval");
    });

    await t19.test("SwR-RDB-074: the waste step in the order of section 10.4 commits, also with a waste date equal to the start of the first interval, and an update of a closed interval fails", async () => {
      const passport = await createFirstPassport();
      await committed(admin, (client) => writeWasteStep(client, passport.id));
      const stored = await admin.query(
        "SELECT responsible_bpnl, role, valid_from = $2::timestamptz AS starts_at_waste, valid_to = $2::timestamptz AS ends_at_waste FROM passport_responsibility_intervals WHERE passport_id = $1 ORDER BY valid_from, id",
        [passport.id, WASTE_DATE],
      );
      assert.deepEqual(stored.rows, [
        { responsible_bpnl: COMPANY_A, role: "economicOperator", starts_at_waste: false, ends_at_waste: true },
        { responsible_bpnl: SUCCESSOR, role: "wasteManagementOperator", starts_at_waste: true, ends_at_waste: null },
      ]);
      const sameInstant = await createFirstPassport();
      await committed(admin, (client) => writeWasteStep(client, sameInstant.id, { wasteDate: MANUFACTURE_INSTANT }));
      assert.equal((await admin.query("SELECT count(*)::int AS intervals FROM passport_responsibility_intervals WHERE passport_id = $1", [sameInstant.id])).rows[0].intervals, 2);
      await assertRefused(
        () => admin.query("UPDATE passport_responsibility_intervals SET valid_to = $2 WHERE passport_id = $1 AND valid_to IS NOT NULL", [passport.id, "2026-05-02T00:00:00Z"]),
        REFUSAL.intervalEndOnly,
        "an update of a closed interval",
      );
      const newPassport = await createNewPassport();
      await committed(admin, (client) => writeWasteStep(client, newPassport.id, { role: "producerResponsibilityOrganisation" }));
    });

    await t19.test("SwR-RDB-074: the status waste with the interval of the successor that names another company or another role fails at the commit with ERR-DB-WASTE-SUCCESSOR", async () => {
      const passport = await createFirstPassport();
      await refusedAtCommit(admin, (client) => writeWasteStep(client, passport.id, { interval: { responsible_bpnl: OTHER_SUCCESSOR } }), REFUSAL.wasteInterval, "the interval of another company");
      await refusedAtCommit(admin, (client) => writeWasteStep(client, passport.id, { interval: { role: "producer" } }), REFUSAL.wasteInterval, "the interval with another role");
      await refusedAtCommit(
        admin,
        (client) => client.query("UPDATE passports SET lifecycle_status = 'waste', waste_successor_bpnl = $2, waste_successor_role = 'producer', waste_date = $3 WHERE id = $1", [passport.id, SUCCESSOR, WASTE_DATE]),
        REFUSAL.wasteInterval,
        "the status waste without the interval of the successor",
      );
      await assertRefused(
        () => admin.query("UPDATE passports SET lifecycle_status = 'waste' WHERE id = $1", [passport.id]),
        { code: "23514", constraint: "passports_waste_successor_check" },
        "the status waste without a named successor",
      );
      assert.equal((await admin.query("SELECT lifecycle_status FROM passports WHERE id = $1", [passport.id])).rows[0].lifecycle_status, "original");
    });

    await t19.test("SwR-RDB-007: the four triggers of refuse_child_of_ended_passport() on the records of a passport admit an insertion for a passport that has not ended and refuse the insertion for an ended passport", async () => {
      const passport = await createFirstPassport();
      const inserts = {
        trg_passport_aspect_payloads_ended: (id) => insertRow(admin, "passport_aspect_payloads", payloadRow(id, { aspect_key: nextKey() })),
        trg_passport_successor_links_ended: (id) => insertRow(admin, "passport_successor_links", successorLinkRow(id, messageId)),
        trg_passport_repair_entries_ended: (id) => insertRow(admin, "passport_repair_entries", repairRow(id)),
        trg_passport_purposes_ended: (id) => insertRow(admin, "passport_purposes", purposeRow(id)),
      };
      for (const run of Object.values(inserts)) assert.ok(await run(passport.id));
      await writeEnd(admin, passport.id);
      for (const [trigger, run] of Object.entries(inserts)) await assertRefused(() => run(passport.id), REFUSAL.recordOfEnded, trigger);
    });

    await t19.test("SwR-RDB-073: trg_passport_responsibility_intervals_ended admits the end of the open interval in the waste step and refuses the end of the open interval of an ended passport", async () => {
      const passport = await createWastePassport();
      await writeEnd(admin, passport.id);
      await assertRefused(
        () => admin.query("UPDATE passport_responsibility_intervals SET valid_to = $2 WHERE passport_id = $1 AND valid_to IS NULL", [passport.id, "2026-08-01T00:00:00Z"]),
        REFUSAL.recordOfEnded,
        "the end of the open interval of an ended passport",
      );
      await assertRefused(() => insertRow(admin, "passport_responsibility_intervals", intervalRow(passport.id, { valid_from: "2026-08-01T00:00:00Z" })), REFUSAL.recordOfEnded, "an interval change of an ended passport");
    });

    await t19.test("SwR-RDB-007: trg_passport_lineage_links_insert refuses a link for a first passport that an earlier statement of the transaction updated, and a link for a closed new passport of an earlier transaction", async () => {
      const first = await createFirstPassport();
      await refusedStatement(
        admin,
        async (client) => {
          await client.query("UPDATE passports SET battery_category = 'industrial' WHERE id = $1", [first.id]);
          await insertRow(client, "passport_lineage_links", linkRow(first.id));
        },
        REFUSAL.linkWhileOpen,
        "a link for a first passport of an earlier transaction",
      );
      const closed = await createNewPassport();
      await assertRefused(() => insertRow(admin, "passport_lineage_links", linkRow(closed.id)), REFUSAL.linkWhileOpen, "a link for a closed new passport of an earlier transaction");
      await assertRefused(() => admin.query("UPDATE passports SET lineage_open = true WHERE id = $1", [closed.id]), REFUSAL.reopened, "an update of lineage_open from false to true");
      await assertRefused(() => admin.query("UPDATE passports SET lineage_open = true WHERE id = $1", [first.id]), REFUSAL.reopened, "an update of lineage_open of a first passport");
    });
  });

  await t.test("the five values of a new passport", async (t5) => {
    await t5.test("SwR-RDB-007: an update that sets one of the five values of a new passport to null fails with ERR-DB-LINEAGE, and an update that replaces a value succeeds", async () => {
      const passport = await createNewPassport();
      for (const column of ["date_into_service", "rated_capacity_ah", "capacity_fade_percent", "power_fade_percent", "expected_lifetime_years"]) {
        await assertRefused(() => admin.query(`UPDATE passports SET ${column} = NULL WHERE id = $1`, [passport.id]), REFUSAL.keepsValues, column);
      }
      const replaced = await admin.query(
        "UPDATE passports SET date_into_service = '2026-03-05', rated_capacity_ah = 95.5, capacity_fade_percent = 6, power_fade_percent = 7, expected_lifetime_years = 7.5 WHERE id = $1 RETURNING rated_capacity_ah::text AS rated",
        [passport.id],
      );
      assert.equal(replaced.rows[0].rated, "95.50");
    });
    await t5.test("SwR-RDB-007: an update that sets date_into_service of a first passport to null succeeds", async () => {
      const passport = await createFirstPassport({ date_into_service: "2026-01-20", rated_capacity_ah: 100 });
      const updated = await admin.query("UPDATE passports SET date_into_service = NULL, rated_capacity_ah = NULL WHERE id = $1 RETURNING date_into_service", [passport.id]);
      assert.equal(updated.rows[0].date_into_service, null);
    });
  });

  await t.test("the end of a passport", async (tEnd) => {
    for (const status of ["original", "repurposed", "re-used", "remanufactured", "waste"]) {
      await tEnd.test(`SwR-RDB-007: one update sets the three end columns on a passport of the status ${status}`, async () => {
        const passport =
          status === "original" ? await createFirstPassport() : status === "waste" ? await createWastePassport() : await createNewPassport({ lifecycle_status: status });
        const certificate = randomUUID();
        assert.equal((await writeEnd(admin, passport.id, { certificate })).rowCount, 1);
        const stored = await admin.query(
          "SELECT lifecycle_status, recycling_date = $2::timestamptz AS ended, recycler_bpnl, material_recycling_certificate_catena_x_id AS certificate FROM passports WHERE id = $1",
          [passport.id, RECYCLING_DATE],
        );
        assert.deepEqual(stored.rows[0], { lifecycle_status: status, ended: true, recycler_bpnl: RECYCLER, certificate });
      });
    }
    await tEnd.test("SwR-RDB-007: a recycling date before the waste date fails with 23514 on passports_end_after_waste_check", async () => {
      const passport = await createWastePassport();
      await assertRefused(() => writeEnd(admin, passport.id, { recyclingDate: "2026-05-01T11:59:59Z" }), { code: "23514", constraint: "passports_end_after_waste_check" }, "a recycling date before the waste date");
      assert.equal((await writeEnd(admin, passport.id, { recyclingDate: WASTE_DATE })).rowCount, 1);
    });
    await tEnd.test("SwR-RDB-007: a recycling date before the start of the open interval fails with ERR-DB-END-DATE", async () => {
      const first = await createFirstPassport();
      await assertRefused(() => writeEnd(admin, first.id, { recyclingDate: "2026-01-09T23:59:59Z" }), REFUSAL.endDate, "a recycling date before the date of manufacture");
      const newPassport = await createNewPassport();
      await assertRefused(() => writeEnd(admin, newPassport.id, { recyclingDate: "2026-03-01T07:59:59Z" }), REFUSAL.endDate, "a recycling date before the operation date");
      assert.equal((await writeEnd(admin, first.id, { recyclingDate: MANUFACTURE_INSTANT })).rowCount, 1);
    });
    await tEnd.test("SwR-RDB-007: a change of an ended waste passport without an authorisation fails with ERR-DB-PASSPORT-ENDED", async () => {
      const passport = await createWastePassport();
      await writeEnd(admin, passport.id);
      await refusedStatement(admin, (client) => client.query("UPDATE passports SET battery_category = 'lmt' WHERE id = $1", [passport.id]), REFUSAL.passportEnded, "a change of an ended waste passport", { today: TODAY });
      await assertRefused(() => writeAuthorisation(admin, passport.id), REFUSAL.passportEnded, "an authorisation on an ended waste passport");
    });
  });

  await t.test("the named successor of a waste passport", async (tSuccessor) => {
    const waste = await createWastePassport({ authorised: true });
    for (const [column, value] of [["waste_successor_bpnl", OTHER_SUCCESSOR], ["waste_successor_role", "producer"], ["waste_date", "2026-05-02T12:00:00Z"]]) {
      await tSuccessor.test(`SwR-RDB-074: on a waste passport with an authorisation in force, an update of ${column} fails with ERR-DB-WASTE-SUCCESSOR`, async () => {
        await refusedStatement(admin, (client) => client.query(`UPDATE passports SET ${column} = $2 WHERE id = $1`, [waste.id, value]), REFUSAL.namedSuccessor, column, { today: TODAY });
      });
    }
  });

  await t.test("the first refusal for a record of an ended passport", async (tTable) => {
    // An ended waste passport with a lineage link, with one record in each table and with a closed and an open interval.
    const { passport, records } = await createPassportWithRecords({ start: "new" });
    const other = await createFirstPassport();
    await committed(admin, (client) => writeWasteStep(client, passport.id));
    await writeEnd(admin, passport.id);
    const intervals = (await admin.query("SELECT id, valid_to FROM passport_responsibility_intervals WHERE passport_id = $1 ORDER BY valid_from, id", [passport.id])).rows;
    const [closedInterval, lastInterval] = intervals;
    assert.ok(closedInterval.valid_to !== null && lastInterval.valid_to === null);
    const cells = [
      ["passport_aspect_payloads", "INSERT", REFUSAL.recordOfEnded, () => insertRow(admin, "passport_aspect_payloads", payloadRow(passport.id, { aspect_key: "circularity" }))],
      ["passport_aspect_payloads", "UPDATE", REFUSAL.recordOfEnded, () => admin.query("UPDATE passport_aspect_payloads SET payload = '{}' WHERE passport_id = $1", [passport.id])],
      ["passport_aspect_payloads", "UPDATE that changes passport_id", REFUSAL.moved, () => admin.query("UPDATE passport_aspect_payloads SET passport_id = $2 WHERE passport_id = $1", [passport.id, other.id])],
      ["passport_aspect_payloads", "DELETE", REFUSAL.recordOfEnded, () => admin.query("DELETE FROM passport_aspect_payloads WHERE passport_id = $1", [passport.id])],
      ["passport_purposes", "INSERT", REFUSAL.recordOfEnded, () => insertRow(admin, "passport_purposes", purposeRow(passport.id))],
      ["passport_purposes", "UPDATE", REFUSAL.appendOnly, () => admin.query("UPDATE passport_purposes SET purpose = 'changed' WHERE id = $1", [records.purpose.id])],
      ["passport_purposes", "DELETE", REFUSAL.appendOnly, () => admin.query("DELETE FROM passport_purposes WHERE id = $1", [records.purpose.id])],
      ["passport_repair_entries", "INSERT", REFUSAL.recordOfEnded, () => insertRow(admin, "passport_repair_entries", repairRow(passport.id))],
      ["passport_repair_entries", "UPDATE", REFUSAL.appendOnly, () => admin.query("UPDATE passport_repair_entries SET repair_date = now() WHERE id = $1", [records.repair.id])],
      ["passport_repair_entries", "DELETE", REFUSAL.appendOnly, () => admin.query("DELETE FROM passport_repair_entries WHERE id = $1", [records.repair.id])],
      ["passport_successor_links", "INSERT", REFUSAL.recordOfEnded, () => insertRow(admin, "passport_successor_links", successorLinkRow(passport.id, messageId))],
      ["passport_successor_links", "UPDATE", REFUSAL.appendOnly, () => admin.query("UPDATE passport_successor_links SET operation_date = now() WHERE id = $1", [records.successorLink.id])],
      ["passport_successor_links", "DELETE", REFUSAL.appendOnly, () => admin.query("DELETE FROM passport_successor_links WHERE id = $1", [records.successorLink.id])],
      ["passport_lineage_links", "INSERT", REFUSAL.linkWhileOpen, () => insertRow(admin, "passport_lineage_links", linkRow(passport.id))],
      ["passport_lineage_links", "UPDATE", REFUSAL.appendOnly, () => admin.query("UPDATE passport_lineage_links SET operation = 'remanufacturing' WHERE id = $1", [passport.links[0].id])],
      ["passport_lineage_links", "DELETE", REFUSAL.appendOnly, () => admin.query("DELETE FROM passport_lineage_links WHERE id = $1", [passport.links[0].id])],
      ["passport_responsibility_intervals", "INSERT", REFUSAL.recordOfEnded, () => insertRow(admin, "passport_responsibility_intervals", intervalRow(passport.id, { valid_from: RECYCLING_DATE }))],
      ["passport_responsibility_intervals", "UPDATE of a closed interval", REFUSAL.intervalEndOnly, () => admin.query("UPDATE passport_responsibility_intervals SET valid_to = now() WHERE id = $1", [closedInterval.id])],
      ["passport_responsibility_intervals", "UPDATE of another column than valid_to", REFUSAL.intervalEndOnly, () => admin.query("UPDATE passport_responsibility_intervals SET role = 'producer' WHERE id = $1", [lastInterval.id])],
      ["passport_responsibility_intervals", "UPDATE that ends the open interval", REFUSAL.recordOfEnded, () => admin.query("UPDATE passport_responsibility_intervals SET valid_to = $2 WHERE id = $1", [lastInterval.id, RECYCLING_DATE])],
      ["passport_responsibility_intervals", "DELETE", REFUSAL.intervalDeleted, () => admin.query("DELETE FROM passport_responsibility_intervals WHERE id = $1", [lastInterval.id])],
    ];
    for (const [table, statement, expected, run] of cells) {
      await tTable.test(`SwR-RDB-007: ${table}, ${statement}: ${expected.message.split(":")[0]}`, async () => {
        await assertRefused(run, expected, `${table} ${statement}`);
        // The first refusal does not depend on the setting app.today, also when the setting holds a text that is no date.
        await refusedStatement(admin, run, expected, `${table} ${statement} with the setting garbage`, { today: "garbage" });
      });
    }
  });

  await t.test("the three cases of the temporary table", async (tTemp) => {
    const schema = admin.escapeIdentifier(db.schema);

    await tTemp.test("SwR-RDB-007: a temporary table passports that names a closed first passport with lineage_open true does not admit a lineage link for that passport", async () => {
      const passport = await createFirstPassport();
      await refusedStatement(
        admin,
        async (client) => {
          await client.query(`CREATE TEMP TABLE passports ON COMMIT DROP AS SELECT * FROM ${schema}.passports WHERE id = $1`, [passport.id]);
          await client.query("UPDATE pg_temp.passports SET lineage_open = true");
          assert.equal((await client.query("SELECT lineage_open FROM passports WHERE id = $1", [passport.id])).rows[0].lineage_open, true, "the session reads the temporary table first");
          await insertRow(client, "passport_lineage_links", linkRow(passport.id));
        },
        REFUSAL.linkWhileOpen,
        "a lineage link behind a temporary table passports",
      );
    });

    await tTemp.test("SwR-RDB-007: a temporary table passports that names an ended passport without a recycling date does not admit an aspect payload of that passport", async () => {
      const passport = await createFirstPassport();
      await writeEnd(admin, passport.id);
      await refusedStatement(
        admin,
        async (client) => {
          await client.query(`CREATE TEMP TABLE passports ON COMMIT DROP AS SELECT * FROM ${schema}.passports WHERE id = $1`, [passport.id]);
          await client.query("UPDATE pg_temp.passports SET recycling_date = NULL, recycler_bpnl = NULL, material_recycling_certificate_catena_x_id = NULL");
          assert.equal((await client.query("SELECT recycling_date FROM passports WHERE id = $1", [passport.id])).rows[0].recycling_date, null, "the session reads the temporary table first");
          await insertRow(client, "passport_aspect_payloads", payloadRow(passport.id));
        },
        REFUSAL.recordOfEnded,
        "an aspect payload behind a temporary table passports",
      );
    });

    await tTemp.test("SwR-RDB-073: a temporary table passport_responsibility_intervals with one open interval of a new passport id does not admit that passport without an interval", async () => {
      const id = randomUUID();
      try {
        await refusedAtCommit(
          admin,
          async (client) => {
            await client.query(`CREATE TEMP TABLE passport_responsibility_intervals ON COMMIT DROP AS SELECT * FROM ${schema}.passport_responsibility_intervals WITH NO DATA`);
            await client.query(
              "INSERT INTO pg_temp.passport_responsibility_intervals (id, passport_id, responsible_bpnl, role, valid_from, created_at) VALUES (1, $1, $2, 'economicOperator', $3, now())",
              [id, COMPANY_A, MANUFACTURE_INSTANT],
            );
            await insertRow(client, `${schema}.passports`, passportRow({ id }));
          },
          REFUSAL.oneOpenInterval,
          "a passport behind a temporary table passport_responsibility_intervals",
        );
      } finally {
        await admin.query("DROP TABLE IF EXISTS pg_temp.passport_responsibility_intervals");
      }
      assert.equal((await admin.query("SELECT count(*)::int AS stored FROM passports WHERE id = $1", [id])).rows[0].stored, 0);
    });
  });
});

test("(d) the setting app.today", async (t) => {
  const waste = await createWastePassport({ children: (created) => insertRow(admin, "passport_aspect_payloads", payloadRow(created.id)) });
  const updatePassport = (client) => client.query("UPDATE passports SET battery_category = 'industrial' WHERE id = $1", [waste.id]);
  const updatePayload = (client) => client.query("UPDATE passport_aspect_payloads SET payload = '{\"changed\": true}' WHERE passport_id = $1", [waste.id]);

  await t.test("SwR-RDB-007: an update of a waste passport is refused without an authorisation", async () => {
    await refusedStatement(admin, updatePassport, REFUSAL.wastePassport, "without an authorisation", { today: TODAY });
    await refusedStatement(admin, updatePayload, REFUSAL.wasteRecord, "an aspect payload without an authorisation", { today: TODAY });
  });

  await t.test("SwR-RDB-007: under an authorisation from 2026-06-10 to 2026-06-20, an update of the waste passport is refused on the day before, admitted on the first day and on the last day, and refused on the day after", async () => {
    await writeAuthorisation(admin, waste.id);
    for (const [today, admitted] of [["2026-06-09", false], [AUTHORISATION_FROM, true], [TODAY, true], [AUTHORISATION_TO, true], ["2026-06-21", false]]) {
      for (const [statement, expected] of [[updatePassport, REFUSAL.wastePassport], [updatePayload, REFUSAL.wasteRecord]]) {
        if (admitted) assert.equal((await rolledBack(admin, statement, { today })).rowCount, 1, `admitted on ${today}`);
        else await refusedStatement(admin, statement, expected, `refused on ${today}`, { today });
      }
    }
  });

  await t.test("SwR-RDB-007: an authorisation without a last day is in force on every day from its first day", async () => {
    const openEnded = await createWastePassport();
    await writeAuthorisation(admin, openEnded.id, { to: null });
    const update = (client) => client.query("UPDATE passports SET battery_category = 'industrial' WHERE id = $1", [openEnded.id]);
    await refusedStatement(admin, update, REFUSAL.wastePassport, "the day before the first day", { today: "2026-06-09" });
    assert.equal((await rolledBack(admin, update, { today: "9999-12-31" })).rowCount, 1);
  });

  await t.test("SwR-RDB-007: the update is refused when the setting app.today is absent", async () => {
    const fresh = await connectAdminClient(db.schema);
    try {
      assert.equal((await fresh.query("SELECT current_setting('app.today', true) AS value")).rows[0].value, null);
      await assertRefused(() => updatePassport(fresh), REFUSAL.wastePassport, "the setting is absent");
      await assertRefused(() => updatePayload(fresh), REFUSAL.wasteRecord, "the setting is absent, aspect payload");
    } finally {
      await fresh.end();
    }
  });

  await t.test("SwR-RDB-007: the update is refused with ERR-DB-SUCCESSOR-AUTHORISATION on a connection whose earlier transaction set the setting, where the setting is the empty text", async () => {
    const pooled = await connectAdminClient(db.schema);
    try {
      assert.equal((await rolledBack(pooled, updatePassport, { today: TODAY })).rowCount, 1);
      assert.equal((await pooled.query("SELECT current_setting('app.today', true) AS value")).rows[0].value, "");
      assert.equal((await pooled.query("SELECT app_today() IS NULL AS absent")).rows[0].absent, true);
      await assertRefused(() => updatePassport(pooled), REFUSAL.wastePassport, "the setting is the empty text");
      await assertRefused(() => updatePayload(pooled), REFUSAL.wasteRecord, "the setting is the empty text, aspect payload");
    } finally {
      await pooled.end();
    }
  });

  for (const setting of ["today", "tomorrow", "yesterday", "epoch", "infinity", "garbage", "2026-13-45", "2026-00-10", "2026-01-00", "0000-01-01", "2026-02-29", "2026-02-30", "2026-6-15", " 2026-06-15"]) {
    await t.test(`SwR-RDB-007: with the setting "${setting}", an update of the waste passport and an update of an aspect payload of the waste passport fail with 22007 and ERR-DB-TODAY`, async () => {
      await refusedStatement(admin, updatePassport, REFUSAL.today, `passport, ${setting}`, { today: setting });
      await refusedStatement(admin, updatePayload, REFUSAL.today, `aspect payload, ${setting}`, { today: setting });
      await refusedStatement(admin, (client) => client.query("SELECT app_today()"), REFUSAL.today, `SELECT app_today(), ${setting}`, { today: setting });
    });
  }

  for (const setting of ["0001-01-01", "9999-12-31", "2024-02-29"]) {
    await t.test(`SwR-RDB-007: SELECT app_today() returns the date for the setting ${setting}`, async () => {
      const result = await rolledBack(admin, (client) => client.query("SELECT to_char(app_today(), 'YYYY-MM-DD') AS today"), { today: setting });
      assert.equal(result.rows[0].today, setting);
    });
  }

  await t.test("SwR-RDB-007: SELECT app_today() returns the fourth of March for the setting 2026-03-04 in a session with DateStyle = 'SQL, DMY'", async () => {
    const result = await rolledBack(
      admin,
      async (client) => {
        await client.query("SET LOCAL DateStyle = 'SQL, DMY'");
        assert.equal((await client.query("SELECT '04/03/2026'::date = make_date(2026, 3, 4) AS day_first")).rows[0].day_first, true, "the session reads the day first");
        return client.query("SELECT extract(month FROM app_today())::int AS month, extract(day FROM app_today())::int AS day, app_today() = make_date(2026, 3, 4) AS fourth_of_march");
      },
      { today: "2026-03-04" },
    );
    assert.deepEqual(result.rows[0], { month: 3, day: 4, fourth_of_march: true });
  });

  await t.test("SwR-RDB-007: with the setting garbage, an update of a passport that is not waste succeeds, and an update of an ended passport fails with ERR-DB-PASSPORT-ENDED", async () => {
    const passport = await createFirstPassport();
    const update = (id) => (client) => client.query("UPDATE passports SET battery_category = 'industrial' WHERE id = $1", [id]);
    assert.equal((await committed(admin, update(passport.id), { today: "garbage" })).rowCount, 1);
    const ended = await createWastePassport();
    await writeEnd(admin, ended.id);
    await refusedStatement(admin, update(ended.id), REFUSAL.passportEnded, "an ended passport with the setting garbage", { today: "garbage" });
  });
});

test("(e) policies", async (t) => {
  // The fixtures of the superuser: one passport of each company with one record in each table of a passport.
  const messageId = await createReceivedNotification();
  const own = { passport: await createNewPassport() };
  const foreign = { passport: await createNewPassport({ manufacturer_bpnl: COMPANY_B }) };
  for (const side of [own, foreign]) {
    side.payload = await insertRow(admin, "passport_aspect_payloads", payloadRow(side.passport.id));
    side.purpose = await insertRow(admin, "passport_purposes", purposeRow(side.passport.id));
    side.successorLink = await insertRow(admin, "passport_successor_links", successorLinkRow(side.passport.id, messageId));
    side.repair = await insertRow(admin, "passport_repair_entries", repairRow(side.passport.id));
    side.access = await insertRow(admin, "passport_access_records", accessRow(side.passport.id));
    side.manufacturer = side === own ? COMPANY_A : COMPANY_B;
    side.mapVersion = await insertRow(admin, "access_map_versions", mapVersionRow(models[side.manufacturer]));
    side.mapEntry = await insertRow(admin, "access_map_entries", mapEntryRow(side.mapVersion.id));
  }
  const asA = (work) => withTransaction(db.appPool, asCompany(COMPANY_A), work);
  const asB = (work) => withTransaction(db.appPool, asCompany(COMPANY_B), work);
  // The three contexts that do not see the rows of company A: another company, a company without rows, and no setting.
  const strangers = [
    ["with another Business Partner Number", asB],
    ["with the Business Partner Number of a company without a row", (work) => withTransaction(db.appPool, asCompany(SUCCESSOR), work)],
    ["without the setting app.acting_bpnl", withoutSetting],
  ];
  const count = async (run, sql, parameters) => (await run((client) => client.query(sql, parameters))).rowCount;

  await t.test("SwR-DATASET-190: passports: the acting company reads its row, inserts a passport and updates a column of section 9.4.3", async () => {
    assert.equal(await count(asA, "SELECT id FROM passports WHERE id = $1", [own.passport.id]), 1);
    const inserted = await asA((client) => writeFirstPassport(client));
    assert.equal(inserted.manufacturer_bpnl, COMPANY_A);
    assert.equal(await count(asA, "UPDATE passports SET lifecycle_status = 're-used' WHERE id = $1", [inserted.id]), 1);
    assert.equal((await admin.query("SELECT lifecycle_status FROM passports WHERE id = $1", [inserted.id])).rows[0].lifecycle_status, "re-used");
    assert.equal(await count(asA, "SELECT id FROM passports"), (await admin.query("SELECT count(*)::int AS n FROM passports WHERE manufacturer_bpnl = $1", [COMPANY_A])).rows[0].n);
  });

  for (const [label, run] of strangers) {
    await t.test(`SwR-DATASET-190: passports ${label}: a SELECT returns 0 rows, an UPDATE changes 0 rows, and an INSERT fails with 42501`, async () => {
      assert.equal(await count(run, "SELECT id FROM passports WHERE id = $1", [own.passport.id]), 0);
      assert.equal(await count(run, "UPDATE passports SET lifecycle_status = 're-used' WHERE id = $1", [own.passport.id]), 0);
      await assertRefused(() => run((client) => writeFirstPassport(client)), NO_PRIVILEGE, `INSERT of a passport of company A ${label}`);
      assert.equal((await admin.query("SELECT lifecycle_status FROM passports WHERE id = $1", [own.passport.id])).rows[0].lifecycle_status, "repurposed");
    });
  }

  // The three tables whose records the role inserts and updates, each with the statements of the acting company.
  const writable = {
    passport_aspect_payloads: {
      where: "passport_id",
      insert: (client, passportId) => insertRow(client, "passport_aspect_payloads", payloadRow(passportId, { aspect_key: "circularity" })),
      update: "UPDATE passport_aspect_payloads SET payload = '{\"changed\": true}', updated_at = now() WHERE passport_id = $1",
    },
    passport_access_records: {
      where: "passport_id",
      insert: (client, passportId) => insertRow(client, "passport_access_records", accessRow(passportId, { recipient_bpnl: SUCCESSOR, aspect_key: "successors" })),
      update: "UPDATE passport_access_records SET valid_to = '2026-04-01T00:00:00Z' WHERE passport_id = $1 AND valid_to IS NULL",
    },
  };
  for (const [table, statements] of Object.entries(writable)) {
    await t.test(`SwR-DATASET-190: ${table}: the acting company reads its row, inserts a row and updates a column of section 9.4.3`, async () => {
      assert.equal(await count(asA, `SELECT 1 FROM ${table} WHERE ${statements.where} = $1`, [own.passport.id]), 1);
      const target = await createNewPassport();
      await insertRow(admin, table, table === "passport_aspect_payloads" ? payloadRow(target.id) : accessRow(target.id));
      assert.ok(await asA((client) => statements.insert(client, target.id)));
      assert.ok((await count(asA, statements.update, [target.id])) >= 1);
    });
    for (const [label, run] of strangers) {
      await t.test(`SwR-DATASET-190: ${table} ${label}: a SELECT returns 0 rows, an UPDATE changes 0 rows, and an INSERT fails with 42501`, async () => {
        assert.equal(await count(run, `SELECT 1 FROM ${table} WHERE ${statements.where} = $1`, [own.passport.id]), 0);
        assert.equal(await count(run, statements.update, [own.passport.id]), 0);
        await assertRefused(() => run((client) => statements.insert(client, own.passport.id)), NO_PRIVILEGE, `INSERT into ${table} ${label}`);
      });
    }
  }

  await t.test("SwR-DATASET-190: passport_responsibility_intervals: the acting company reads its row, and inserts an interval and updates valid_to in the waste step", async () => {
    assert.equal(await count(asA, "SELECT 1 FROM passport_responsibility_intervals WHERE passport_id = $1", [own.passport.id]), 1);
    const target = await createFirstPassport();
    await asA((client) => writeWasteStep(client, target.id));
    assert.equal(await count(asA, "SELECT 1 FROM passport_responsibility_intervals WHERE passport_id = $1", [target.id]), 2);
  });
  for (const [label, run] of strangers) {
    await t.test(`SwR-DATASET-190: passport_responsibility_intervals ${label}: a SELECT returns 0 rows, an UPDATE changes 0 rows, and an INSERT fails with 42501`, async () => {
      assert.equal(await count(run, "SELECT 1 FROM passport_responsibility_intervals WHERE passport_id = $1", [own.passport.id]), 0);
      assert.equal(await count(run, "UPDATE passport_responsibility_intervals SET valid_to = '2026-04-01T00:00:00Z' WHERE passport_id = $1", [own.passport.id]), 0);
      const closedFirst = await createFirstPassport();
      await assertRefused(
        () => run((client) => insertRow(client, "passport_responsibility_intervals", intervalRow(closedFirst.id, { responsible_bpnl: SUCCESSOR, role: "producer", valid_from: WASTE_DATE }))),
        NO_PRIVILEGE,
        `INSERT of an interval ${label}`,
      );
    });
  }

  // The four tables on which the role holds no privilege UPDATE.
  const insertOnly = {
    battery_models: { where: "id", id: (side) => models[side.manufacturer], insert: (client) => insertRow(client, "battery_models", modelRow(COMPANY_A)), assignment: "manufacturer_part_id = 'changed'" },
    passport_purposes: { where: "passport_id", id: (side) => side.passport.id, insert: (client) => insertRow(client, "passport_purposes", purposeRow(own.passport.id)), assignment: "purpose = 'changed'" },
    passport_successor_links: { where: "passport_id", id: (side) => side.passport.id, insert: (client) => insertRow(client, "passport_successor_links", successorLinkRow(own.passport.id, messageId)), assignment: "operation = 'remanufacturing'" },
    passport_repair_entries: { where: "passport_id", id: (side) => side.passport.id, insert: (client) => insertRow(client, "passport_repair_entries", repairRow(own.passport.id)), assignment: "repairer_bpnl = 'BPNL00000000TCK2'" },
  };
  for (const [table, statements] of Object.entries(insertOnly)) {
    await t.test(`SwR-DATASET-190: ${table}: the acting company reads its row and inserts a row, and an UPDATE fails with 42501 for every company`, async () => {
      assert.equal(await count(asA, `SELECT 1 FROM ${table} WHERE ${statements.where} = $1`, [statements.id(own)]), 1);
      assert.ok(await asA(statements.insert));
      for (const [label, run] of [["as the acting company", asA], ...strangers]) {
        await assertRefused(() => run((client) => client.query(`UPDATE ${table} SET ${statements.assignment} WHERE ${statements.where} = $1`, [statements.id(own)])), NO_PRIVILEGE, `UPDATE of ${table} ${label}`);
      }
    });
    for (const [label, run] of strangers) {
      await t.test(`SwR-DATASET-190: ${table} ${label}: a SELECT returns 0 rows, and an INSERT fails with 42501`, async () => {
        assert.equal(await count(run, `SELECT 1 FROM ${table} WHERE ${statements.where} = $1`, [statements.id(own)]), 0);
        await assertRefused(() => run(statements.insert), NO_PRIVILEGE, `INSERT into ${table} ${label}`);
      });
    }
  }

  await t.test("SwR-DATASET-190: passport_lineage_links: the accepted INSERT runs in the transaction that inserts the passport, and the acting company reads its link", async () => {
    const created = await asA((client) => writeNewPassport(client));
    assert.equal(await count(asA, "SELECT 1 FROM passport_lineage_links WHERE passport_id = $1", [created.id]), 1);
    assert.equal(await count(asB, "SELECT 1 FROM passport_lineage_links WHERE passport_id = $1", [created.id]), 0);
    assert.equal(await count(withoutSetting, "SELECT 1 FROM passport_lineage_links WHERE passport_id = $1", [created.id]), 0);
  });
  for (const [label, run] of strangers) {
    await t.test(`SwR-DATASET-190: passport_lineage_links ${label}: an INSERT fails with P0001 and ERR-DB-LINEAGE, because the trigger does not see the passport`, async () => {
      await assertRefused(() => run((client) => insertRow(client, "passport_lineage_links", linkRow(own.passport.id))), REFUSAL.linkWhileOpen, `INSERT of a link ${label}`);
    });
  }
  await t.test("SwR-DATASET-190: passport_lineage_links: an UPDATE fails with 42501 for every company", async () => {
    for (const [label, run] of [["as the acting company", asA], ...strangers]) {
      await assertRefused(() => run((client) => client.query("UPDATE passport_lineage_links SET operation = 'remanufacturing' WHERE passport_id = $1", [own.passport.id])), NO_PRIVILEGE, `UPDATE of a link ${label}`);
    }
  });

  await t.test("SwR-DATASET-190: access_map_versions and access_map_entries: an INSERT for a battery model of the acting company succeeds, with the version and the entry in two statements", async () => {
    await asA(async (client) => {
      const version = await insertRow(client, "access_map_versions", mapVersionRow(models[COMPANY_A]));
      const entry = await insertRow(client, "access_map_entries", mapEntryRow(version.id));
      assert.equal(entry.map_id, version.id);
    });
    assert.equal(await count(asA, "SELECT 1 FROM access_map_versions WHERE id = $1", [own.mapVersion.id]), 1);
    assert.equal(await count(asA, "SELECT 1 FROM access_map_entries WHERE map_id = $1", [own.mapVersion.id]), 1);
  });
  await t.test("SwR-DATASET-190: access_map_versions and access_map_entries: an INSERT for a battery model of another company and an INSERT for an unknown battery model both fail with 42501", async () => {
    await assertRefused(() => asA((client) => insertRow(client, "access_map_versions", mapVersionRow(models[COMPANY_B]))), NO_PRIVILEGE, "a version for a battery model of another company");
    await assertRefused(() => asA((client) => insertRow(client, "access_map_versions", mapVersionRow(randomUUID()))), NO_PRIVILEGE, "a version for an unknown battery model");
    await assertRefused(() => asA((client) => insertRow(client, "access_map_entries", mapEntryRow(foreign.mapVersion.id))), NO_PRIVILEGE, "an entry for a map of another company");
    await assertRefused(() => asA((client) => insertRow(client, "access_map_entries", mapEntryRow(2147483647))), NO_PRIVILEGE, "an entry for an unknown map");
    await assertRefused(() => withoutSetting((client) => insertRow(client, "access_map_versions", mapVersionRow(models[COMPANY_A]))), NO_PRIVILEGE, "a version without the setting");
  });
  await t.test("SwR-DATASET-190: access_map_versions and access_map_entries: another company reads 0 rows", async () => {
    for (const [, run] of strangers) {
      assert.equal(await count(run, "SELECT 1 FROM access_map_versions WHERE id = $1", [own.mapVersion.id]), 0);
      assert.equal(await count(run, "SELECT 1 FROM access_map_entries WHERE map_id = $1", [own.mapVersion.id]), 0);
    }
  });

  await t.test("SwR-DATASET-190: issuer_contracts: an INSERT with a passport of the acting company and an INSERT without a passport succeed", async () => {
    assert.ok(await asA((client) => insertRow(client, "issuer_contracts", providerContractRow(own.passport.id))));
    assert.ok(await asA((client) => insertRow(client, "issuer_contracts", issuerContractRow())));
    assert.ok(await asA((client) => insertRow(client, "issuer_contracts", providerContractRow(null, { product_condition: { stateOfHealth: 90 } }))));
  });
  await t.test("SwR-DATASET-190: issuer_contracts: an INSERT with a passport of another company and an INSERT with an unknown passport both fail with 42501", async () => {
    await assertRefused(() => asA((client) => insertRow(client, "issuer_contracts", providerContractRow(foreign.passport.id))), NO_PRIVILEGE, "a contract with a passport of another company");
    await assertRefused(() => asA((client) => insertRow(client, "issuer_contracts", providerContractRow(randomUUID()))), NO_PRIVILEGE, "a contract with an unknown passport");
  });

  await t.test("SwR-DATASET-190: an INSERT of a passport on a battery model of another company fails with 23503 on passports_battery_model_fkey", async () => {
    await assertRefused(
      () => asA((client) => insertRow(client, "passports", passportRow({ battery_model_id: models[COMPANY_B] }))),
      { code: "23503", constraint: "passports_battery_model_fkey" },
      "a passport on a battery model of another company",
    );
    await assertRefused(
      () => asA((client) => insertRow(client, "passports", passportRow({ battery_model_id: randomUUID() }))),
      { code: "23503", constraint: "passports_battery_model_fkey" },
      "a passport on an unknown battery model",
    );
  });

  await t.test("SwR-DATASET-190: an INSERT of a battery model with the id of a battery model of another company fails with 23505 on battery_models_pkey", async () => {
    await assertRefused(
      () => asA((client) => insertRow(client, "battery_models", modelRow(COMPANY_A, { id: models[COMPANY_B] }))),
      { code: "23505", constraint: "battery_models_pkey" },
      "a battery model with the id of a battery model of another company",
    );
  });
});

test("(f) privileges", async (t) => {
  const passport = await createFirstPassport();
  await insertRow(admin, "passport_aspect_payloads", payloadRow(passport.id));
  await insertRow(admin, "passport_access_records", accessRow(passport.id));
  const contract = await insertRow(admin, "issuer_contracts", providerContractRow(passport.id));
  const sent = await insertRow(admin, "notifications_sent", sentRow());
  const asA = (work) => withTransaction(db.appPool, asCompany(COMPANY_A), work);
  const rowOf = {
    companies: ["bpnl = $1", COMPANY_A],
    passports: ["id = $1", passport.id],
    passport_aspect_payloads: ["passport_id = $1", passport.id],
    passport_responsibility_intervals: ["passport_id = $1", passport.id],
    notifications_sent: ["id = $1", sent.id],
    passport_access_records: ["passport_id = $1", passport.id],
    issuer_contracts: ["id = $1", contract.id],
  };

  for (const table of TABLES) {
    await t.test(`SwR-RDB-007: a DELETE on ${table} fails with 42501`, async () => {
      await assertRefused(() => asA((client) => client.query(`DELETE FROM ${table}`)), NO_PRIVILEGE, `DELETE FROM ${table}`);
      await assertRefused(() => asA((client) => client.query(`TRUNCATE ${table} CASCADE`)), NO_PRIVILEGE, `TRUNCATE ${table}`);
    });
  }

  await t.test("SwR-RDB-007: a SELECT on schema_migrations returns the three names, and an INSERT into schema_migrations fails with 42501", async () => {
    const result = await asA((client) => client.query("SELECT name FROM schema_migrations ORDER BY name"));
    assert.deepEqual(result.rows.map((row) => row.name), ["001_schema.sql", "002_triggers.sql", "003_policies.sql"]);
    await assertRefused(() => asA((client) => client.query("INSERT INTO schema_migrations (name) VALUES ('004_further.sql')")), NO_PRIVILEGE, "INSERT into schema_migrations");
    await assertRefused(() => asA((client) => client.query("UPDATE schema_migrations SET name = 'changed'")), NO_PRIVILEGE, "UPDATE of schema_migrations");
    await assertRefused(() => asA((client) => client.query("DELETE FROM schema_migrations")), NO_PRIVILEGE, "DELETE on schema_migrations");
  });

  await t.test("SwR-RDB-007: CREATE TEMP TABLE passports (id uuid) fails with 42501", async () => {
    await assertRefused(() => asA((client) => client.query("CREATE TEMP TABLE passports (id uuid)")), NO_PRIVILEGE, "CREATE TEMP TABLE");
    await assertRefused(() => asA((client) => client.query("CREATE TABLE further (id uuid)")), NO_PRIVILEGE, "CREATE TABLE");
  });

  for (const [table, columns] of Object.entries(UPDATE_COLUMNS)) {
    await t.test(`SwR-RDB-007: an UPDATE of each column of ${table} with the privilege succeeds, and an UPDATE of ${COLUMN_WITHOUT_UPDATE[table]} fails with 42501`, async () => {
      const [where, value] = rowOf[table];
      for (const column of columns) {
        const result = await asA((client) => client.query(`UPDATE ${table} SET ${column} = ${column} WHERE ${where}`, [value]));
        assert.ok(result.rowCount >= 1, `UPDATE of ${table}.${column} changed no row`);
      }
      const outside = COLUMN_WITHOUT_UPDATE[table];
      await assertRefused(() => asA((client) => client.query(`UPDATE ${table} SET ${outside} = ${outside} WHERE ${where}`, [value])), NO_PRIVILEGE, `UPDATE of ${table}.${outside}`);
    });
  }

  await t.test("SwR-RDB-007: the steps of the server change the columns with the privilege: the authorisation, the end, the outcome of a notification and the end of a contract", async () => {
    const target = await createFirstPassport();
    await asA((client) => writeWasteStep(client, target.id));
    assert.equal((await asA((client) => writeAuthorisation(client, target.id))).rowCount, 1);
    assert.equal((await asA((client) => writeEnd(client, target.id))).rowCount, 1);
    const sending = await asA((client) =>
      client.query("UPDATE notifications_sent SET outcome = 'sent', cause = NULL, http_status = 200, attempts = attempts + 1, attempted_at = now(), receiver_did = 'did:web:receiver.example', receiver_connector_url = 'https://receiver.example' WHERE id = $1", [sent.id]),
    );
    assert.equal(sending.rowCount, 1);
    assert.equal((await asA((client) => client.query("UPDATE issuer_contracts SET valid_to = now() WHERE id = $1", [contract.id]))).rowCount, 1);
    assert.equal((await asA((client) => client.query("UPDATE companies SET legal_name = 'Example Battery Company', operator_identifier = 'operator-1' WHERE bpnl = $1", [COMPANY_A]))).rowCount, 1);
  });

  await t.test("SwR-RDB-007: LOCK TABLE passports IN ACCESS EXCLUSIVE MODE and LOCK TABLE notifications_sent IN SHARE ROW EXCLUSIVE MODE fail with 42501, and LOCK TABLE passports IN ROW EXCLUSIVE MODE succeeds", async () => {
    await assertRefused(() => asA((client) => client.query("LOCK TABLE passports IN ACCESS EXCLUSIVE MODE")), NO_PRIVILEGE, "ACCESS EXCLUSIVE");
    await assertRefused(() => asA((client) => client.query("LOCK TABLE notifications_sent IN SHARE ROW EXCLUSIVE MODE")), NO_PRIVILEGE, "SHARE ROW EXCLUSIVE");
    await asA((client) => client.query("LOCK TABLE passports IN ROW EXCLUSIVE MODE"));
  });

  await t.test("SwR-RDB-007: the role refserver_app disables no trigger, changes no policy and resets no role", async () => {
    await assertRefused(() => asA((client) => client.query("ALTER TABLE passports DISABLE TRIGGER trg_passport_identity")), NO_PRIVILEGE, "ALTER TABLE DISABLE TRIGGER");
    await assertRefused(() => asA((client) => client.query("ALTER TABLE passports NO FORCE ROW LEVEL SECURITY")), NO_PRIVILEGE, "ALTER TABLE NO FORCE ROW LEVEL SECURITY");
    await assertRefused(() => asA((client) => client.query("DROP POLICY passports_own ON passports")), NO_PRIVILEGE, "DROP POLICY");
    await assertRefused(() => asA((client) => client.query("SET LOCAL session_replication_role = replica")), NO_PRIVILEGE, "SET session_replication_role");
    await assertRefused(() => asA((client) => client.query("CREATE ROLE further_role")), NO_PRIVILEGE, "CREATE ROLE");
  });

  await t.test("SwR-RDB-007: an insertion into passport_write_decisions with OVERRIDING SYSTEM VALUE and the next value of the identity succeeds in a transaction that the test rolls back (the accepted residual effect of decision D24, Two database roles and row-level security)", async () => {
    const client = await db.appPool.connect();
    try {
      await client.query("BEGIN ISOLATION LEVEL READ COMMITTED READ WRITE");
      await client.query("SELECT set_config('app.acting_bpnl', $1, true)", [COMPANY_A]);
      const next = (await client.query("SELECT COALESCE(max(id), 0) + 1 AS next FROM passport_write_decisions")).rows[0].next;
      const inserted = await insertRow(client, "passport_write_decisions", { ...decisionRow(), id: next }, { overriding: true });
      assert.equal(inserted.id, next);
    } finally {
      await client.query("ROLLBACK");
      client.release();
    }
  });
});

test("(g) concurrent transactions", async (t) => {
  const asA = (work) => withTransaction(db.appPool, asCompany(COMPANY_A), work);

  // Runs the first transaction up to its wait, starts the statement of the second transaction, asserts that
  // the second transaction blocks, lets the first transaction commit, and returns the outcome of the second.
  async function overlap(runFirst, firstStep, runSecond, secondStatement, label) {
    const firstDone = deferred();
    const release = deferred();
    const secondPid = deferred();
    const first = runFirst(async (client) => {
      await firstStep(client);
      firstDone.resolve();
      await release.promise;
    });
    first.catch((error) => firstDone.reject(error));
    await firstDone.promise;
    const second = settle(
      runSecond(async (client) => {
        secondPid.resolve(await backendPid(client));
        return secondStatement(client);
      }),
    );
    try {
      await waitUntilBlocked(await secondPid.promise, label);
    } finally {
      release.resolve();
    }
    await first;
    return second;
  }

  await t.test("SwR-RDB-007: the first transaction sets the end columns of a passport and waits; the second inserts an aspect payload, blocks until the first commits, and then fails with ERR-DB-PASSPORT-ENDED", async () => {
    const passport = await createFirstPassport();
    const outcome = await overlap(asA, (client) => writeEnd(client, passport.id), asA, (client) => insertRow(client, "passport_aspect_payloads", payloadRow(passport.id)), "the end of a passport");
    await assertRefused(() => (outcome.error ? Promise.reject(outcome.error) : Promise.resolve()), REFUSAL.recordOfEnded, "the second transaction");
    assert.equal((await admin.query("SELECT count(*)::int AS stored FROM passport_aspect_payloads WHERE passport_id = $1", [passport.id])).rows[0].stored, 0);
  });

  await t.test("SwR-RDB-007: the first transaction runs the waste step of a passport and waits; the second inserts an aspect payload, blocks, and then fails with ERR-DB-SUCCESSOR-AUTHORISATION", async () => {
    const passport = await createFirstPassport();
    const outcome = await overlap(asA, (client) => writeWasteStep(client, passport.id), asA, (client) => insertRow(client, "passport_aspect_payloads", payloadRow(passport.id)), "the waste step");
    await assertRefused(() => (outcome.error ? Promise.reject(outcome.error) : Promise.resolve()), REFUSAL.wasteRecord, "the second transaction");
    assert.equal((await admin.query("SELECT count(*)::int AS stored FROM passport_aspect_payloads WHERE passport_id = $1", [passport.id])).rows[0].stored, 0);
  });

  await t.test("SwR-RDB-074: two clients run the waste step of one passport with two successors; the second blocks and then fails with ERR-DB-SUCCESSOR-AUTHORISATION", async () => {
    const passport = await createFirstPassport();
    const outcome = await overlap(
      asA,
      (client) => writeWasteStep(client, passport.id, { successor: SUCCESSOR }),
      asA,
      (client) => writeWasteStep(client, passport.id, { successor: OTHER_SUCCESSOR, role: "producer" }),
      "two waste steps",
    );
    await assertRefused(() => (outcome.error ? Promise.reject(outcome.error) : Promise.resolve()), REFUSAL.wastePassport, "the second waste step");
    const stored = await admin.query("SELECT waste_successor_bpnl, waste_successor_role FROM passports WHERE id = $1", [passport.id]);
    assert.deepEqual(stored.rows[0], { waste_successor_bpnl: SUCCESSOR, waste_successor_role: "wasteManagementOperator" });
    assert.equal((await admin.query("SELECT count(*)::int AS intervals FROM passport_responsibility_intervals WHERE passport_id = $1", [passport.id])).rows[0].intervals, 2);
  });

  await t.test("SwR-RDB-073: two clients of the superuser reach the unique index of the open interval: the second insertion of an open interval blocks and then fails with 23505 on passport_responsibility_intervals_open_key", async () => {
    const firstClient = await connectAdminClient(db.schema);
    const secondClient = await connectAdminClient(db.schema);
    try {
      const id = randomUUID();
      const outcome = await overlap(
        (work) => committed(firstClient, work),
        (client) => writeFirstPassport(client, { id }),
        (work) => committed(secondClient, work),
        (client) => insertRow(client, "passport_responsibility_intervals", intervalRow(id)),
        "the unique index of the open interval",
      );
      await assertRefused(() => (outcome.error ? Promise.reject(outcome.error) : Promise.resolve()), { code: "23505", constraint: "passport_responsibility_intervals_open_key" }, "the second open interval");
      assert.equal((await admin.query("SELECT count(*)::int AS intervals FROM passport_responsibility_intervals WHERE passport_id = $1", [id])).rows[0].intervals, 1);
    } finally {
      await firstClient.end();
      await secondClient.end();
    }
  });

  await t.test("SwR-RDB-007: two workers claim two rows of notifications_sent with FOR UPDATE SKIP LOCKED", async () => {
    const passportIdentifier = nextName("claim");
    const rows = [await insertRow(admin, "notifications_sent", sentRow({ passport_identifier: passportIdentifier })), await insertRow(admin, "notifications_sent", sentRow({ passport_identifier: passportIdentifier }))];
    const claim = (client) =>
      client.query("SELECT id FROM notifications_sent WHERE outcome = 'pending' AND passport_identifier = $1 ORDER BY not_before, id LIMIT 1 FOR UPDATE SKIP LOCKED", [passportIdentifier]);
    // Each worker claims one row in its own transaction and holds the row until the test releases the worker.
    const release = deferred();
    const worker = () => {
      const claimed = deferred();
      const done = asA(async (client) => {
        const result = await claim(client);
        claimed.resolve(result.rows.map((row) => row.id));
        await release.promise;
      });
      done.catch((error) => claimed.reject(error));
      return { claimed: claimed.promise, done };
    };
    const first = worker();
    const firstIds = await first.claimed;
    const second = worker();
    try {
      const secondIds = await second.claimed;
      assert.equal(firstIds.length, 1);
      assert.equal(secondIds.length, 1);
      assert.notEqual(firstIds[0], secondIds[0]);
      assert.deepEqual([firstIds[0], secondIds[0]].sort(), rows.map((row) => Number(row.id)).sort());
      const third = await asA(claim);
      assert.equal(third.rowCount, 0, "a third worker claims no row while the two rows are locked");
    } finally {
      release.resolve();
    }
    await first.done;
    await second.done;
  });

  await t.test("SwR-RDB-007: two clients that insert one message_id into notifications_received with ON CONFLICT DO NOTHING store one row", async () => {
    const row = receivedRow();
    const insertOnce = (client) =>
      client.query(
        "INSERT INTO notifications_received (message_id, operation, sender_bpnl, passport_identifier, message, outcome, received_at) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (message_id) DO NOTHING",
        [row.message_id, row.operation, row.sender_bpnl, row.passport_identifier, row.message, row.outcome, row.received_at],
      );
    let firstCount;
    const outcome = await overlap(
      asA,
      async (client) => {
        firstCount = (await insertOnce(client)).rowCount;
      },
      asA,
      insertOnce,
      "one message_id",
    );
    assert.equal(outcome.error, undefined, outcome.error?.message);
    assert.equal(firstCount, 1);
    assert.equal(outcome.value.rowCount, 0);
    assert.equal((await admin.query("SELECT count(*)::int AS stored FROM notifications_received WHERE message_id = $1", [row.message_id])).rows[0].stored, 1);
  });
});

test("(h) type parsers", async (t) => {
  const asA = (work) => withTransaction(db.appPool, asCompany(COMPANY_A), work);

  await t.test("SwR-RDB-007: the process runs in the time zone Pacific/Kiritimati, 14 hours ahead of UTC", () => {
    assert.equal(process.env.TZ, "Pacific/Kiritimati");
    assert.equal(new Date("2026-01-10T00:00:00Z").getTimezoneOffset(), -840);
  });

  await t.test("SwR-RDB-007: a column of the type date is read as the stored text YYYY-MM-DD, although the column is of the domain finite_date", async () => {
    const passport = await asA((client) => writeFirstPassport(client, { date_into_service: "2026-01-31" }));
    assert.equal(passport.date_of_manufacture, "2026-01-10");
    assert.equal(passport.date_into_service, "2026-01-31");
    const read = await asA((client) => client.query("SELECT date_of_manufacture, date_into_service, successor_authorisation_valid_from FROM passports WHERE id = $1", [passport.id]));
    assert.deepEqual(read.rows[0], { date_of_manufacture: "2026-01-10", date_into_service: "2026-01-31", successor_authorisation_valid_from: null });
    assert.deepEqual(read.fields.map((field) => field.dataTypeID), [1082, 1082, 1082]);
  });

  await t.test("SwR-RDB-007: a numeric column and a bigint column are read as numbers", async () => {
    const passport = await asA((client) => writeNewPassport(client, { rated_capacity_ah: 123.45, capacity_fade_percent: 0, power_fade_percent: 12.5, expected_lifetime_years: 7.5 }));
    const read = await asA((client) =>
      client.query(
        "SELECT p.rated_capacity_ah, p.capacity_fade_percent, p.power_fade_percent, p.expected_lifetime_years, i.id FROM passports p JOIN passport_responsibility_intervals i ON i.passport_id = p.id WHERE p.id = $1",
        [passport.id],
      ),
    );
    const row = read.rows[0];
    assert.deepEqual({ ...row, id: undefined }, { rated_capacity_ah: 123.45, capacity_fade_percent: 0, power_fade_percent: 12.5, expected_lifetime_years: 7.5, id: undefined });
    assert.equal(typeof row.id, "number");
    assert.ok(Number.isSafeInteger(row.id) && row.id > 0);
    assert.deepEqual(read.fields.map((field) => field.dataTypeID), [1700, 1700, 1700, 1700, 20]);
    const counted = await asA((client) => client.query("SELECT count(*) AS links FROM passport_lineage_links WHERE passport_id = $1", [passport.id]));
    assert.equal(counted.rows[0].links, 1);
  });

  await t.test("SwR-RDB-007: a timestamptz value is written and read as the same instant, although the column is of the domain finite_timestamptz", async () => {
    const instant = new Date("2026-04-05T06:07:08.123Z");
    const passport = await createFirstPassport();
    const read = await asA(async (client) => {
      await insertRow(client, "passport_access_records", accessRow(passport.id, { valid_from: instant }));
      return client.query("SELECT valid_from, valid_to, created_at, to_char(valid_from AT TIME ZONE 'UTC', 'YYYY-MM-DD\"T\"HH24:MI:SS.MS') AS stored, current_setting('TimeZone') AS zone FROM passport_access_records WHERE passport_id = $1", [passport.id]);
    });
    const row = read.rows[0];
    assert.ok(row.valid_from instanceof Date);
    assert.equal(row.valid_from.getTime(), instant.getTime());
    assert.equal(row.stored, "2026-04-05T06:07:08.123");
    assert.equal(row.zone, "UTC");
    assert.equal(row.valid_to, null);
    assert.ok(row.created_at instanceof Date);
    assert.deepEqual(read.fields.slice(0, 3).map((field) => field.dataTypeID), [1184, 1184, 1184]);
  });

  await t.test("SwR-RDB-007: a uuid column is read as a text, and every connection of the pool reads the schema first at the isolation level READ COMMITTED in read-write mode", async () => {
    const result = await db.appPool.query(
      "SELECT current_schema() AS schema, current_setting('default_transaction_isolation') AS isolation, current_setting('default_transaction_read_only') AS read_only, current_setting('TimeZone') AS zone, current_user AS role, gen_random_uuid() AS id",
    );
    const { id, ...settings } = result.rows[0];
    assert.deepEqual(settings, { schema: db.schema, isolation: "read committed", read_only: "off", zone: "UTC", role: "refserver_app" });
    assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });
});

test("(i) isolation levels", async (t) => {
  const passport = await createFirstPassport();
  const statements = {
    "an insertion of an aspect payload": (client) => insertRow(client, "passport_aspect_payloads", payloadRow(passport.id)),
    "an update of the status of a passport": (client) => client.query("UPDATE passports SET lifecycle_status = 're-used' WHERE id = $1", [passport.id]),
    "an insertion of a passport": (client) => insertRow(client, "passports", passportRow()),
    "an insertion of a responsibility interval": (client) => insertRow(client, "passport_responsibility_intervals", intervalRow(passport.id, { valid_from: WASTE_DATE })),
  };
  // Runs the work on a connection of the role refserver_app in a transaction of the level, with the two settings.
  async function appTransaction(level, work) {
    const client = await db.appPool.connect();
    try {
      await client.query(`BEGIN ISOLATION LEVEL ${level}`);
      await client.query("SELECT set_config('app.acting_bpnl', $1, true)", [COMPANY_A]);
      await client.query("SELECT set_config('app.today', $1, true)", [TODAY]);
      return await work(client);
    } finally {
      await client.query("ROLLBACK");
      client.release();
    }
  }
  const runners = {
    "the role refserver_app": appTransaction,
    "the superuser": (level, work) => rolledBack(admin, work, { level, today: TODAY }),
  };

  for (const level of ["REPEATABLE READ", "SERIALIZABLE"]) {
    for (const [role, run] of Object.entries(runners)) {
      for (const [label, statement] of Object.entries(statements)) {
        await t.test(`SwR-RDB-007: at the level ${level}, ${label} by ${role} fails with ERR-DB-ISOLATION`, async () => {
          await run(level, async (client) => {
            assert.equal((await client.query("SHOW transaction_isolation")).rows[0].transaction_isolation, level.toLowerCase());
            await assertRefused(() => statement(client), REFUSAL.isolation, `${label}, ${level}, ${role}`);
          });
        });
      }
      await t.test(`SwR-RDB-007: at the level ${level}, a SELECT by ${role} succeeds`, async () => {
        await run(level, async (client) => {
          assert.equal((await client.query("SELECT id FROM passports WHERE id = $1", [passport.id])).rowCount, 1);
          assert.equal((await client.query("SELECT 1 FROM passport_responsibility_intervals WHERE passport_id = $1", [passport.id])).rowCount, 1);
        });
      });
    }
  }

  await t.test("SwR-RDB-007: at the level READ COMMITTED the four statements succeed", async () => {
    for (const run of Object.values(runners)) {
      await run("READ COMMITTED", async (client) => {
        for (const [label, statement] of Object.entries(statements)) {
          if (label === "an insertion of a responsibility interval") continue;
          assert.ok(await statement(client), label);
        }
      });
    }
  });

  // The two races. The first client takes its snapshot of the passport at the level under test, a second
  // client at READ COMMITTED runs the waste step and commits, and the first client then writes.
  const races = {
    "inserts an aspect payload of the passport": {
      write: (client, id) => insertRow(client, "passport_aspect_payloads", payloadRow(id)),
      expected: { "READ COMMITTED": REFUSAL.wasteRecord, "REPEATABLE READ": REFUSAL.isolation, SERIALIZABLE: REFUSAL.isolation },
    },
    "sets the three end columns with a recycling date before the waste date": {
      write: (client, id) => writeEnd(client, id, { recyclingDate: "2026-04-01T00:00:00Z" }),
      expected: { "READ COMMITTED": { code: "23514", constraint: "passports_end_after_waste_check" }, "REPEATABLE READ": { code: "40001" }, SERIALIZABLE: { code: "40001" } },
    },
  };
  for (const [raceLabel, race] of Object.entries(races)) {
    for (const level of ["READ COMMITTED", "REPEATABLE READ", "SERIALIZABLE"]) {
      const expected = race.expected[level];
      await t.test(`SwR-RDB-007: the race in which the first client ${raceLabel}, at the level ${level}, ends with ${expected.message?.split(":")[0] ?? expected.constraint ?? expected.code}`, async () => {
        const raced = await createFirstPassport();
        await appTransaction(level, async (client) => {
          const snapshot = await client.query("SELECT lifecycle_status FROM passports WHERE id = $1", [raced.id]);
          assert.equal(snapshot.rows[0].lifecycle_status, "original");
          await withTransaction(db.appPool, asCompany(COMPANY_A), (second) => writeWasteStep(second, raced.id));
          await assertRefused(() => race.write(client, raced.id), expected, `${raceLabel}, ${level}`);
        });
        const stored = await admin.query("SELECT lifecycle_status, recycling_date FROM passports WHERE id = $1", [raced.id]);
        assert.deepEqual(stored.rows[0], { lifecycle_status: "waste", recycling_date: null });
        assert.equal((await admin.query("SELECT count(*)::int AS stored FROM passport_aspect_payloads WHERE passport_id = $1", [raced.id])).rows[0].stored, 0);
      });
    }
  }

  // The stored settings of the role refserver_app. The catalogue pg_db_role_setting holds one row per
  // database of a setting, and one row with the database 0 for the settings of every database.
  const databaseName = (await admin.query("SELECT current_database() AS name")).rows[0].name;
  const inDatabase = `IN DATABASE ${admin.escapeIdentifier(databaseName)}`;
  const appPassword = decodeURIComponent(new URL(appConnectionString()).password);
  const storedSettings = async () =>
    (
      await admin.query(
        `SELECT COALESCE(d.datname, '') AS database, s.setconfig FROM pg_db_role_setting s JOIN pg_roles r ON r.oid = s.setrole LEFT JOIN pg_database d ON d.oid = s.setdatabase
          WHERE r.rolname = 'refserver_app' ORDER BY 1`,
      )
    ).rows;
  // Runs the case and then createAppRole, so that no stored setting outlasts the case.
  async function withStoredSettings(work) {
    try {
      await work();
    } finally {
      await createAppRole(admin, { password: appPassword });
    }
    assert.deepEqual(await storedSettings(), [], "a stored setting of the role outlasts the case");
  }

  for (const [form, store, remove, row] of [
    ["ALTER ROLE refserver_app SET", "ALTER ROLE refserver_app SET default_transaction_isolation = 'serializable'", "ALTER ROLE refserver_app RESET default_transaction_isolation", ""],
    [
      "ALTER ROLE refserver_app IN DATABASE <the test database> SET",
      `ALTER ROLE refserver_app ${inDatabase} SET default_transaction_isolation = 'serializable'`,
      `ALTER ROLE refserver_app ${inDatabase} RESET default_transaction_isolation`,
      databaseName,
    ],
  ]) {
    await t.test(`SwR-RDB-007: a client of withTransaction on a connection of a role with the stored setting default_transaction_isolation = serializable, stored with ${form}, reports the level read committed`, async () => {
      await withStoredSettings(async () => {
        await admin.query(store);
        let pool;
        try {
          assert.deepEqual(await storedSettings(), [{ database: row, setconfig: ["default_transaction_isolation=serializable"] }]);
          pool = createPool({ connectionString: appConnectionString(), schema: db.schema, size: 1 });
          const level = await withTransaction(pool, asCompany(COMPANY_A), async (client) => {
            const shown = await client.query("SHOW transaction_isolation");
            // The transaction writes a record, which every trigger function refuses at another level.
            await writeFirstPassport(client);
            return shown.rows[0].transaction_isolation;
          });
          assert.equal(level, "read committed");
          assert.equal((await pool.query("SHOW default_transaction_isolation")).rows[0].default_transaction_isolation, "read committed");
        } finally {
          if (pool) await pool.end();
          // The superuser removes the setting around the case.
          await admin.query(remove);
        }
        assert.deepEqual(await storedSettings(), []);
      });
    });
  }

  await t.test("SwR-RDB-007: after the superuser stores statement_timeout = '60s' for every database and default_transaction_isolation = 'repeatable read' for the test database, createAppRole leaves no row of the role in pg_db_role_setting", async () => {
    await withStoredSettings(async () => {
      await admin.query("ALTER ROLE refserver_app SET statement_timeout = '60s'");
      await admin.query(`ALTER ROLE refserver_app ${inDatabase} SET default_transaction_isolation = 'repeatable read'`);
      assert.deepEqual(await storedSettings(), [
        { database: "", setconfig: ["statement_timeout=60s"] },
        { database: databaseName, setconfig: ["default_transaction_isolation=repeatable read"] },
      ]);
      await createAppRole(admin, { password: appPassword });
      assert.deepEqual(await storedSettings(), []);
      // The password of the role is the password of the pool after the call.
      assert.equal((await db.appPool.query("SELECT current_user AS role")).rows[0].role, "refserver_app");
    });
  });

  await t.test("SwR-RDB-007: after the superuser stores only the setting for the test database, ALTER ROLE refserver_app RESET ALL alone leaves one row, the behaviour of PostgreSQL 17 that createAppRole answers", async () => {
    await withStoredSettings(async () => {
      await admin.query(`ALTER ROLE refserver_app ${inDatabase} SET default_transaction_isolation = 'repeatable read'`);
      await admin.query("ALTER ROLE refserver_app RESET ALL");
      assert.deepEqual(await storedSettings(), [{ database: databaseName, setconfig: ["default_transaction_isolation=repeatable read"] }]);
    });
  });

  await t.test("SwR-RDB-007: while the setting for the test database exists, migrate for a new schema rejects with ERR-DB-ROLE-PRIVILEGE and names npm run create-role, and after createAppRole the same call of migrate applies the third file and returns its name", async () => {
    const schema = `${db.schema}_m`;
    const migrator = await connectAdminClient();
    try {
      await withStoredSettings(async () => {
        await admin.query(`ALTER ROLE refserver_app ${inDatabase} SET default_transaction_isolation = 'repeatable read'`);
        let rejection;
        try {
          await migrate(migrator, { schema });
        } catch (error) {
          rejection = error;
        }
        assert.ok(rejection, "migrate applied the three files in spite of the stored setting");
        assert.ok(rejection.message.includes("ERR-DB-ROLE-PRIVILEGE"), rejection.message);
        assert.ok(rejection.message.includes("npm run create-role"), rejection.message);
        const names = async () => (await migrator.query("SELECT name FROM schema_migrations ORDER BY name")).rows.map((line) => line.name);
        assert.deepEqual(await names(), ["001_schema.sql", "002_triggers.sql"]);
        await createAppRole(admin, { password: appPassword });
        assert.deepEqual(await migrate(migrator, { schema }), ["003_policies.sql"]);
        assert.deepEqual(await names(), ["001_schema.sql", "002_triggers.sql", "003_policies.sql"]);
        assert.deepEqual(await migrate(migrator, { schema }), []);
      });
    } finally {
      await migrator.query(`DROP SCHEMA IF EXISTS ${migrator.escapeIdentifier(schema)} CASCADE`);
      await migrator.end();
    }
  });

  await t.test("SwR-RDB-007: createAppRole removes a setting that the superuser stores for another database of the cluster and writes one warning line that names the database to the standard error output", async () => {
    const other = (await admin.query("SELECT datname FROM pg_database WHERE datname <> current_database() ORDER BY datname LIMIT 1")).rows[0].datname;
    const originalWrite = process.stderr.write;
    const written = [];
    await withStoredSettings(async () => {
      await admin.query(`ALTER ROLE refserver_app IN DATABASE ${admin.escapeIdentifier(other)} SET default_transaction_isolation = 'repeatable read'`);
      assert.deepEqual(await storedSettings(), [{ database: other, setconfig: ["default_transaction_isolation=repeatable read"] }]);
      process.stderr.write = (chunk) => {
        written.push(String(chunk));
        return true;
      };
      try {
        await createAppRole(admin, { password: appPassword });
      } finally {
        process.stderr.write = originalWrite;
      }
      assert.deepEqual(written, [`createAppRole: removed the stored settings of refserver_app for the database ${other}\n`]);
      assert.deepEqual(await storedSettings(), []);
    });
  });

  await t.test("SwR-RDB-007: the role refserver_app stores a setting for the test database through appPool with success, and createAppRole removes that row as well", async () => {
    await withStoredSettings(async () => {
      const stored = await db.appPool.query(`ALTER ROLE refserver_app ${inDatabase} SET default_transaction_isolation = 'repeatable read'`);
      assert.equal(stored.command, "ALTER");
      assert.deepEqual(await storedSettings(), [{ database: databaseName, setconfig: ["default_transaction_isolation=repeatable read"] }]);
      await createAppRole(admin, { password: appPassword });
      assert.deepEqual(await storedSettings(), []);
    });
  });
});
