--------------------------------------------------------------------------------
-- Copyright (c) 2026 Ichnos Protocol Pte. Ltd.
-- Copyright (c) 2026 Contributors to the Eclipse Foundation
--
-- See the NOTICE file(s) distributed with this work for additional
-- information regarding copyright ownership.
--
-- This program and the accompanying materials are made available under the
-- terms of the Apache License, Version 2.0 which is available at
-- https://www.apache.org/licenses/LICENSE-2.0.
--
-- Unless required by applicable law or agreed to in writing, software
-- distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
-- WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
-- License for the specific language governing permissions and limitations
-- under the License.
--
-- SPDX-License-Identifier: Apache-2.0
--------------------------------------------------------------------------------
-- Migration 003: the privileges of the role refserver_app and the twelve row-level security policies.
-- The role refserver_app exists before this file runs; the file creates no role.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'refserver_app') THEN
    RAISE EXCEPTION 'The role refserver_app does not exist. Run "npm run create-role" before "npm run migrate".';
  END IF;
  EXECUTE format('GRANT USAGE ON SCHEMA %I TO refserver_app', current_schema());
  -- The server creates no temporary table. Every role holds the privilege TEMPORARY of a database through PUBLIC.
  IF has_database_privilege('refserver_app', current_database(), 'TEMPORARY') THEN
    EXECUTE format('REVOKE TEMPORARY ON DATABASE %I FROM PUBLIC', current_database());
  END IF;
  IF has_database_privilege('refserver_app', current_database(), 'TEMPORARY') THEN
    RAISE EXCEPTION 'ERR-DB-ROLE-PRIVILEGE: The role refserver_app holds the privilege TEMPORARY of the database. The owner of the database revokes the privilege from PUBLIC before the migration.';
  END IF;
  IF has_schema_privilege('refserver_app', current_schema(), 'CREATE')
     OR (to_regnamespace('public') IS NOT NULL AND has_schema_privilege('refserver_app', 'public', 'CREATE')) THEN
    RAISE EXCEPTION 'ERR-DB-ROLE-PRIVILEGE: The role refserver_app holds the privilege CREATE of a schema. The owner of the schema revokes the privilege before the migration.';
  END IF;
  -- A stored setting of the role changes every later connection of the server.
  IF EXISTS (SELECT 1 FROM pg_db_role_setting s JOIN pg_roles r ON r.oid = s.setrole WHERE r.rolname = 'refserver_app') THEN
    RAISE EXCEPTION 'ERR-DB-ROLE-PRIVILEGE: The role refserver_app holds a stored setting. Run "npm run create-role", which removes every stored setting of the role, before the migration.';
  END IF;
END $$;

-- Every table: SELECT and INSERT. No table: DELETE, TRUNCATE, or UPDATE of the whole row.
GRANT SELECT, INSERT ON companies TO refserver_app;
GRANT SELECT, INSERT ON battery_models TO refserver_app;
GRANT SELECT, INSERT ON passports TO refserver_app;
GRANT SELECT, INSERT ON passport_purposes TO refserver_app;
GRANT SELECT, INSERT ON passport_aspect_payloads TO refserver_app;
GRANT SELECT, INSERT ON notifications_received TO refserver_app;
GRANT SELECT, INSERT ON notifications_sent TO refserver_app;
GRANT SELECT, INSERT ON passport_lineage_links TO refserver_app;
GRANT SELECT, INSERT ON passport_successor_links TO refserver_app;
GRANT SELECT, INSERT ON passport_repair_entries TO refserver_app;
GRANT SELECT, INSERT ON passport_responsibility_intervals TO refserver_app;
GRANT SELECT, INSERT ON access_map_versions TO refserver_app;
GRANT SELECT, INSERT ON access_map_entries TO refserver_app;
GRANT SELECT, INSERT ON passport_access_records TO refserver_app;
GRANT SELECT, INSERT ON passport_write_decisions TO refserver_app;
GRANT SELECT, INSERT ON issuer_contracts TO refserver_app;
GRANT SELECT, INSERT ON received_battery_information TO refserver_app;
-- UPDATE by column, on seven tables: the columns that a step of the server changes.
GRANT UPDATE (legal_name, legal_name_language, address, operator_identifier) ON companies TO refserver_app;
GRANT UPDATE (lifecycle_status, waste_successor_bpnl, waste_successor_role, waste_date, successor_authorisation_ref, successor_authorisation_valid_from, successor_authorisation_valid_to, recycling_date, recycler_bpnl, material_recycling_certificate_catena_x_id, lineage_open) ON passports TO refserver_app;
GRANT UPDATE (payload, updated_at) ON passport_aspect_payloads TO refserver_app;
GRANT UPDATE (valid_to) ON passport_responsibility_intervals TO refserver_app;
GRANT UPDATE (outcome, cause, http_status, attempts, attempted_at, not_before, receiver_did, receiver_connector_url) ON notifications_sent TO refserver_app;
GRANT UPDATE (valid_to) ON passport_access_records TO refserver_app;
GRANT UPDATE (pull_state, pull_cause, valid_to) ON issuer_contracts TO refserver_app;
GRANT SELECT ON schema_migrations TO refserver_app;

ALTER TABLE battery_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE battery_models FORCE ROW LEVEL SECURITY;
ALTER TABLE passports ENABLE ROW LEVEL SECURITY;
ALTER TABLE passports FORCE ROW LEVEL SECURITY;
ALTER TABLE passport_purposes ENABLE ROW LEVEL SECURITY;
ALTER TABLE passport_purposes FORCE ROW LEVEL SECURITY;
ALTER TABLE passport_aspect_payloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE passport_aspect_payloads FORCE ROW LEVEL SECURITY;
ALTER TABLE passport_lineage_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE passport_lineage_links FORCE ROW LEVEL SECURITY;
ALTER TABLE passport_successor_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE passport_successor_links FORCE ROW LEVEL SECURITY;
ALTER TABLE passport_repair_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE passport_repair_entries FORCE ROW LEVEL SECURITY;
ALTER TABLE passport_responsibility_intervals ENABLE ROW LEVEL SECURITY;
ALTER TABLE passport_responsibility_intervals FORCE ROW LEVEL SECURITY;
ALTER TABLE passport_access_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE passport_access_records FORCE ROW LEVEL SECURITY;
ALTER TABLE access_map_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_map_versions FORCE ROW LEVEL SECURITY;
ALTER TABLE access_map_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_map_entries FORCE ROW LEVEL SECURITY;
ALTER TABLE issuer_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE issuer_contracts FORCE ROW LEVEL SECURITY;

CREATE POLICY battery_models_own ON battery_models FOR ALL TO refserver_app
  USING (manufacturer_bpnl = current_setting('app.acting_bpnl', true))
  WITH CHECK (manufacturer_bpnl = current_setting('app.acting_bpnl', true));
CREATE POLICY passports_own ON passports FOR ALL TO refserver_app
  USING (manufacturer_bpnl = current_setting('app.acting_bpnl', true))
  WITH CHECK (manufacturer_bpnl = current_setting('app.acting_bpnl', true));
CREATE POLICY passport_purposes_own ON passport_purposes FOR ALL TO refserver_app
  USING (EXISTS (SELECT 1 FROM passports p WHERE p.id = passport_id AND p.manufacturer_bpnl = current_setting('app.acting_bpnl', true)))
  WITH CHECK (EXISTS (SELECT 1 FROM passports p WHERE p.id = passport_id AND p.manufacturer_bpnl = current_setting('app.acting_bpnl', true)));
CREATE POLICY passport_aspect_payloads_own ON passport_aspect_payloads FOR ALL TO refserver_app
  USING (EXISTS (SELECT 1 FROM passports p WHERE p.id = passport_id AND p.manufacturer_bpnl = current_setting('app.acting_bpnl', true)))
  WITH CHECK (EXISTS (SELECT 1 FROM passports p WHERE p.id = passport_id AND p.manufacturer_bpnl = current_setting('app.acting_bpnl', true)));
CREATE POLICY passport_lineage_links_own ON passport_lineage_links FOR ALL TO refserver_app
  USING (EXISTS (SELECT 1 FROM passports p WHERE p.id = passport_id AND p.manufacturer_bpnl = current_setting('app.acting_bpnl', true)))
  WITH CHECK (EXISTS (SELECT 1 FROM passports p WHERE p.id = passport_id AND p.manufacturer_bpnl = current_setting('app.acting_bpnl', true)));
CREATE POLICY passport_successor_links_own ON passport_successor_links FOR ALL TO refserver_app
  USING (EXISTS (SELECT 1 FROM passports p WHERE p.id = passport_id AND p.manufacturer_bpnl = current_setting('app.acting_bpnl', true)))
  WITH CHECK (EXISTS (SELECT 1 FROM passports p WHERE p.id = passport_id AND p.manufacturer_bpnl = current_setting('app.acting_bpnl', true)));
CREATE POLICY passport_repair_entries_own ON passport_repair_entries FOR ALL TO refserver_app
  USING (EXISTS (SELECT 1 FROM passports p WHERE p.id = passport_id AND p.manufacturer_bpnl = current_setting('app.acting_bpnl', true)))
  WITH CHECK (EXISTS (SELECT 1 FROM passports p WHERE p.id = passport_id AND p.manufacturer_bpnl = current_setting('app.acting_bpnl', true)));
CREATE POLICY passport_responsibility_intervals_own ON passport_responsibility_intervals FOR ALL TO refserver_app
  USING (EXISTS (SELECT 1 FROM passports p WHERE p.id = passport_id AND p.manufacturer_bpnl = current_setting('app.acting_bpnl', true)))
  WITH CHECK (EXISTS (SELECT 1 FROM passports p WHERE p.id = passport_id AND p.manufacturer_bpnl = current_setting('app.acting_bpnl', true)));
CREATE POLICY passport_access_records_own ON passport_access_records FOR ALL TO refserver_app
  USING (EXISTS (SELECT 1 FROM passports p WHERE p.id = passport_id AND p.manufacturer_bpnl = current_setting('app.acting_bpnl', true)))
  WITH CHECK (EXISTS (SELECT 1 FROM passports p WHERE p.id = passport_id AND p.manufacturer_bpnl = current_setting('app.acting_bpnl', true)));
CREATE POLICY access_map_versions_own ON access_map_versions FOR ALL TO refserver_app
  USING (EXISTS (SELECT 1 FROM battery_models m WHERE m.id = battery_model_id AND m.manufacturer_bpnl = current_setting('app.acting_bpnl', true)))
  WITH CHECK (EXISTS (SELECT 1 FROM battery_models m WHERE m.id = battery_model_id AND m.manufacturer_bpnl = current_setting('app.acting_bpnl', true)));
CREATE POLICY access_map_entries_own ON access_map_entries FOR ALL TO refserver_app
  USING (EXISTS (SELECT 1 FROM access_map_versions v JOIN battery_models m ON m.id = v.battery_model_id WHERE v.id = map_id AND m.manufacturer_bpnl = current_setting('app.acting_bpnl', true)))
  WITH CHECK (EXISTS (SELECT 1 FROM access_map_versions v JOIN battery_models m ON m.id = v.battery_model_id WHERE v.id = map_id AND m.manufacturer_bpnl = current_setting('app.acting_bpnl', true)));
CREATE POLICY issuer_contracts_own_passport ON issuer_contracts FOR ALL TO refserver_app
  USING (true)
  WITH CHECK (passport_id IS NULL OR EXISTS (SELECT 1 FROM passports p WHERE p.id = passport_id AND p.manufacturer_bpnl = current_setting('app.acting_bpnl', true)));

-- The fixed search path of every function of the schema: the schema of the migration first and the
-- temporary schema last, so that no temporary table of a session replaces a table inside a function.
-- Every migration file ends with this statement.
DO $$
DECLARE
  f regprocedure;
BEGIN
  FOR f IN SELECT p.oid::regprocedure FROM pg_proc p WHERE p.pronamespace = (SELECT n.oid FROM pg_namespace n WHERE n.nspname = current_schema()) LOOP
    EXECUTE format('ALTER FUNCTION %s SET search_path = %I, pg_temp', f, current_schema());
  END LOOP;
END $$;
