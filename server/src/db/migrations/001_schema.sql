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
-- Migration 001: the four domains and the seventeen tables of the reference server.
CREATE DOMAIN bpnl AS text CONSTRAINT bpnl_check CHECK (VALUE ~ '^BPNL[a-zA-Z0-9]{12}$');
CREATE DOMAIN bpns AS text CONSTRAINT bpns_check CHECK (VALUE ~ '^BPNS[a-zA-Z0-9]{12}$');
-- A date and a time of the schema are finite: the values infinity and -infinity are refused.
CREATE DOMAIN finite_timestamptz AS timestamptz CONSTRAINT finite_timestamptz_check CHECK (isfinite(VALUE));
CREATE DOMAIN finite_date AS date CONSTRAINT finite_date_check CHECK (isfinite(VALUE));

CREATE TABLE companies (
  bpnl bpnl CONSTRAINT companies_pkey PRIMARY KEY,
  legal_name text NOT NULL CONSTRAINT companies_legal_name_check CHECK (length(legal_name) BETWEEN 1 AND 300),
  legal_name_language text NOT NULL DEFAULT 'en',
  address jsonb NOT NULL,
  operator_identifier text,
  created_at finite_timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE battery_models (
  id uuid CONSTRAINT battery_models_pkey PRIMARY KEY DEFAULT gen_random_uuid(),
  manufacturer_bpnl bpnl NOT NULL CONSTRAINT battery_models_manufacturer_fkey REFERENCES companies(bpnl) ON DELETE RESTRICT,
  manufacturer_part_id text NOT NULL CONSTRAINT battery_models_part_id_check CHECK (length(manufacturer_part_id) BETWEEN 1 AND 200),
  original_model_catena_x_id uuid,
  original_model_manufacturer_bpnl bpnl,
  created_at finite_timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT battery_models_original_check CHECK ((original_model_catena_x_id IS NULL) = (original_model_manufacturer_bpnl IS NULL)),
  CONSTRAINT battery_models_manufacturer_part_key UNIQUE (manufacturer_bpnl, manufacturer_part_id),
  CONSTRAINT battery_models_id_manufacturer_key UNIQUE (id, manufacturer_bpnl)
);

CREATE TABLE passports (
  id uuid CONSTRAINT passports_pkey PRIMARY KEY DEFAULT gen_random_uuid(),
  passport_identifier text NOT NULL DEFAULT ('urn:uuid:' || gen_random_uuid()::text) CONSTRAINT passports_passport_identifier_key UNIQUE CONSTRAINT passports_passport_identifier_check CHECK (length(passport_identifier) BETWEEN 1 AND 200),
  battery_identifier text NOT NULL CONSTRAINT passports_battery_identifier_check CHECK (length(battery_identifier) BETWEEN 1 AND 200),
  manufacturer_bpnl bpnl NOT NULL CONSTRAINT passports_manufacturer_fkey REFERENCES companies(bpnl) ON DELETE RESTRICT,
  battery_model_id uuid NOT NULL,
  lifecycle_status text NOT NULL CONSTRAINT passports_lifecycle_status_check CHECK (lifecycle_status IN ('original','repurposed','re-used','remanufactured','waste')),
  battery_category text NOT NULL CONSTRAINT passports_battery_category_check CHECK (battery_category IN ('lmt','ev','industrial','stationary')),
  facility_bpns bpns NOT NULL,
  date_of_manufacture finite_date NOT NULL,
  date_into_service finite_date,
  rated_capacity_ah numeric(10,2) CONSTRAINT passports_rated_capacity_check CHECK (rated_capacity_ah > 0 AND rated_capacity_ah <> 'NaN'),
  capacity_fade_percent numeric(5,2) CONSTRAINT passports_capacity_fade_check CHECK (capacity_fade_percent BETWEEN 0 AND 100),
  power_fade_percent numeric(5,2) CONSTRAINT passports_power_fade_check CHECK (power_fade_percent BETWEEN 0 AND 100),
  expected_lifetime_years numeric(4,1) CONSTRAINT passports_expected_lifetime_check CHECK (expected_lifetime_years > 0 AND expected_lifetime_years <> 'NaN'),
  waste_successor_bpnl bpnl,
  waste_successor_role text CONSTRAINT passports_waste_successor_role_check CHECK (waste_successor_role IN ('producer','producerResponsibilityOrganisation','wasteManagementOperator')),
  waste_date finite_timestamptz,
  successor_authorisation_ref text CONSTRAINT passports_authorisation_ref_check CHECK (length(successor_authorisation_ref) BETWEEN 1 AND 500),
  successor_authorisation_valid_from finite_date,
  successor_authorisation_valid_to finite_date,
  recycling_date finite_timestamptz,
  recycler_bpnl bpnl,
  material_recycling_certificate_catena_x_id uuid,
  lineage_open boolean NOT NULL DEFAULT false,
  created_at finite_timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT passports_battery_model_fkey FOREIGN KEY (battery_model_id, manufacturer_bpnl) REFERENCES battery_models(id, manufacturer_bpnl) ON DELETE RESTRICT,
  CONSTRAINT passports_waste_successor_check CHECK ((lifecycle_status = 'waste') = (waste_successor_bpnl IS NOT NULL) AND (waste_successor_bpnl IS NULL) = (waste_successor_role IS NULL) AND (waste_successor_bpnl IS NULL) = (waste_date IS NULL)),
  CONSTRAINT passports_authorisation_check CHECK ((successor_authorisation_ref IS NULL) = (successor_authorisation_valid_from IS NULL) AND (successor_authorisation_valid_to IS NULL OR successor_authorisation_ref IS NOT NULL) AND (successor_authorisation_valid_to IS NULL OR successor_authorisation_valid_to >= successor_authorisation_valid_from) AND (successor_authorisation_ref IS NULL OR lifecycle_status = 'waste')),
  CONSTRAINT passports_end_check CHECK ((recycling_date IS NULL) = (recycler_bpnl IS NULL) AND (material_recycling_certificate_catena_x_id IS NULL OR recycling_date IS NOT NULL)),
  CONSTRAINT passports_end_after_waste_check CHECK (recycling_date IS NULL OR waste_date IS NULL OR recycling_date >= waste_date)
);
CREATE INDEX passports_battery_identifier_idx ON passports (battery_identifier);
CREATE INDEX passports_battery_model_idx ON passports (battery_model_id);

CREATE TABLE passport_purposes (
  id bigint GENERATED ALWAYS AS IDENTITY CONSTRAINT passport_purposes_pkey PRIMARY KEY,
  passport_id uuid NOT NULL CONSTRAINT passport_purposes_passport_fkey REFERENCES passports(id) ON DELETE RESTRICT,
  purpose text NOT NULL CONSTRAINT passport_purposes_purpose_check CHECK (length(purpose) BETWEEN 1 AND 2000),
  is_original boolean NOT NULL,
  recorded_at finite_timestamptz NOT NULL,
  created_at finite_timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX passport_purposes_original_key ON passport_purposes (passport_id) WHERE is_original;
CREATE INDEX passport_purposes_passport_idx ON passport_purposes (passport_id);

CREATE TABLE passport_aspect_payloads (
  passport_id uuid NOT NULL CONSTRAINT passport_aspect_payloads_passport_fkey REFERENCES passports(id) ON DELETE RESTRICT,
  aspect_key text NOT NULL CONSTRAINT passport_aspect_payloads_key_check CHECK (aspect_key IN ('digital-nameplate','handover-documentation','carbon-footprint','technical-data','product-condition','material-composition','circularity','dpp-metadata','serial-part','single-level-bom-as-built')),
  payload jsonb NOT NULL,
  updated_at finite_timestamptz NOT NULL DEFAULT now(),
  created_at finite_timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT passport_aspect_payloads_pkey PRIMARY KEY (passport_id, aspect_key)
);

CREATE TABLE notifications_received (
  message_id text CONSTRAINT notifications_received_pkey PRIMARY KEY,
  operation text NOT NULL CONSTRAINT notifications_received_operation_check CHECK (operation IN ('NewPassportIssued','BatteryRepaired','BatteryBecameWaste','PassportEnded')),
  sender_bpnl bpnl NOT NULL,
  passport_identifier text NOT NULL,
  message jsonb NOT NULL,
  outcome text NOT NULL CONSTRAINT notifications_received_outcome_check CHECK (outcome IN ('applied','recorded')),
  received_at finite_timestamptz NOT NULL,
  created_at finite_timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX notifications_received_passport_idx ON notifications_received (passport_identifier, operation);

CREATE TABLE notifications_sent (
  id bigint GENERATED ALWAYS AS IDENTITY CONSTRAINT notifications_sent_pkey PRIMARY KEY,
  message_id text NOT NULL CONSTRAINT notifications_sent_message_id_key UNIQUE,
  operation text NOT NULL CONSTRAINT notifications_sent_operation_check CHECK (operation IN ('NewPassportIssued','BatteryRepaired','BatteryBecameWaste','PassportEnded')),
  receiver_bpnl bpnl NOT NULL,
  passport_identifier text NOT NULL,
  message jsonb NOT NULL,
  not_before finite_timestamptz NOT NULL,
  outcome text NOT NULL DEFAULT 'pending' CONSTRAINT notifications_sent_outcome_check CHECK (outcome IN ('pending','sent','no_asset','contract_refused','receiver_refused','receiver_unresolved','transport_failed')),
  cause text,
  http_status integer,
  attempts integer NOT NULL DEFAULT 0,
  attempted_at finite_timestamptz,
  receiver_did text,
  receiver_connector_url text,
  created_at finite_timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX notifications_sent_due_idx ON notifications_sent (not_before, id) WHERE outcome = 'pending';

CREATE TABLE passport_lineage_links (
  id bigint GENERATED ALWAYS AS IDENTITY CONSTRAINT passport_lineage_links_pkey PRIMARY KEY,
  passport_id uuid NOT NULL CONSTRAINT passport_lineage_links_passport_fkey REFERENCES passports(id) ON DELETE RESTRICT,
  predecessor_passport_identifier text NOT NULL,
  predecessor_catena_x_id uuid NOT NULL,
  predecessor_data_provider_bpnl bpnl NOT NULL,
  predecessor_battery_identifier text NOT NULL,
  predecessor_status text NOT NULL CONSTRAINT passport_lineage_links_status_check CHECK (predecessor_status IN ('original','repurposed','re-used','remanufactured','waste')),
  predecessor_original_model_catena_x_id uuid NOT NULL,
  operation text NOT NULL CONSTRAINT passport_lineage_links_operation_check CHECK (operation IN ('preparationForReUse','preparationForRepurposing','repurposing','remanufacturing')),
  operation_date finite_timestamptz NOT NULL,
  created_at finite_timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT passport_lineage_links_predecessor_key UNIQUE (passport_id, predecessor_passport_identifier)
);

CREATE TABLE passport_successor_links (
  id bigint GENERATED ALWAYS AS IDENTITY CONSTRAINT passport_successor_links_pkey PRIMARY KEY,
  passport_id uuid NOT NULL CONSTRAINT passport_successor_links_passport_fkey REFERENCES passports(id) ON DELETE RESTRICT,
  successor_passport_identifier text NOT NULL,
  successor_catena_x_id uuid NOT NULL,
  second_life_operator_bpnl bpnl NOT NULL,
  operation text NOT NULL CONSTRAINT passport_successor_links_operation_check CHECK (operation IN ('preparationForReUse','preparationForRepurposing','repurposing','remanufacturing')),
  operation_date finite_timestamptz NOT NULL,
  notification_message_id text NOT NULL CONSTRAINT passport_successor_links_notification_fkey REFERENCES notifications_received(message_id) ON DELETE RESTRICT,
  created_at finite_timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT passport_successor_links_successor_key UNIQUE (passport_id, successor_passport_identifier)
);

CREATE TABLE passport_repair_entries (
  id bigint GENERATED ALWAYS AS IDENTITY CONSTRAINT passport_repair_entries_pkey PRIMARY KEY,
  passport_id uuid NOT NULL CONSTRAINT passport_repair_entries_passport_fkey REFERENCES passports(id) ON DELETE RESTRICT,
  repair_date finite_timestamptz NOT NULL,
  repair_certificate_catena_x_id uuid NOT NULL,
  repairer_bpnl bpnl NOT NULL,
  notification_message_id text CONSTRAINT passport_repair_entries_notification_fkey REFERENCES notifications_received(message_id) ON DELETE RESTRICT,
  created_at finite_timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT passport_repair_entries_certificate_key UNIQUE (passport_id, repair_certificate_catena_x_id)
);

CREATE TABLE passport_responsibility_intervals (
  id bigint GENERATED ALWAYS AS IDENTITY CONSTRAINT passport_responsibility_intervals_pkey PRIMARY KEY,
  passport_id uuid NOT NULL CONSTRAINT passport_responsibility_intervals_passport_fkey REFERENCES passports(id) ON DELETE RESTRICT,
  responsible_bpnl bpnl NOT NULL,
  role text NOT NULL CONSTRAINT passport_responsibility_intervals_role_check CHECK (role IN ('economicOperator','producer','producerResponsibilityOrganisation','wasteManagementOperator')),
  valid_from finite_timestamptz NOT NULL,
  valid_to finite_timestamptz CONSTRAINT passport_responsibility_intervals_period_check CHECK (valid_to >= valid_from),
  created_at finite_timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX passport_responsibility_intervals_open_key ON passport_responsibility_intervals (passport_id) WHERE valid_to IS NULL;

CREATE TABLE access_map_versions (
  id bigint GENERATED ALWAYS AS IDENTITY CONSTRAINT access_map_versions_pkey PRIMARY KEY,
  battery_model_id uuid NOT NULL CONSTRAINT access_map_versions_model_fkey REFERENCES battery_models(id) ON DELETE RESTRICT,
  map_version text NOT NULL,
  valid_from finite_date NOT NULL,
  created_at finite_timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT access_map_versions_model_version_key UNIQUE (battery_model_id, map_version)
);

CREATE TABLE access_map_entries (
  map_id bigint NOT NULL CONSTRAINT access_map_entries_map_fkey REFERENCES access_map_versions(id) ON DELETE RESTRICT,
  aspect text NOT NULL,
  twin_level text NOT NULL CONSTRAINT access_map_entries_twin_level_check CHECK (twin_level IN ('PartType','PartInstance')),
  path text NOT NULL,
  access_group text NOT NULL CONSTRAINT access_map_entries_group_check CHECK (access_group IN ('public','legitimateInterestModel','authorities','legitimateInterestBattery')),
  legal_basis text NOT NULL,
  created_at finite_timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT access_map_entries_pkey PRIMARY KEY (map_id, aspect, twin_level, path)
);

CREATE TABLE passport_access_records (
  id bigint GENERATED ALWAYS AS IDENTITY CONSTRAINT passport_access_records_pkey PRIMARY KEY,
  passport_id uuid NOT NULL CONSTRAINT passport_access_records_passport_fkey REFERENCES passports(id) ON DELETE RESTRICT,
  recipient_bpnl bpnl NOT NULL,
  recipient_role text NOT NULL CONSTRAINT passport_access_records_role_check CHECK (recipient_role IN ('purchaser','purchaserAgent','responsibleOperator','successor','marketSurveillanceAuthority','authorisedRecipient')),
  aspect_key text NOT NULL CONSTRAINT passport_access_records_key_check CHECK (aspect_key IN ('digital-nameplate','handover-documentation','carbon-footprint','technical-data','product-condition','material-composition','circularity','dpp-metadata','serial-part','single-level-bom-as-built','lifecycle','successors')),
  valid_from finite_timestamptz NOT NULL,
  valid_to finite_timestamptz CONSTRAINT passport_access_records_period_check CHECK (valid_to >= valid_from),
  created_at finite_timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX passport_access_records_open_key ON passport_access_records (passport_id, recipient_bpnl, aspect_key, recipient_role) WHERE valid_to IS NULL;

CREATE TABLE passport_write_decisions (
  id bigint GENERATED ALWAYS AS IDENTITY CONSTRAINT passport_write_decisions_pkey PRIMARY KEY,
  decided_at finite_timestamptz NOT NULL,
  decision text NOT NULL CONSTRAINT passport_write_decisions_decision_check CHECK (decision IN ('granted','refused')),
  requester_bpnl bpnl NOT NULL,
  requester_kind text NOT NULL CONSTRAINT passport_write_decisions_kind_check CHECK (requester_kind IN ('operator','partner')),
  passport_id uuid,
  action text NOT NULL,
  relied_on text,
  refusal_id text,
  details jsonb,
  created_at finite_timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX passport_write_decisions_passport_idx ON passport_write_decisions (passport_id);

CREATE TABLE issuer_contracts (
  id uuid CONSTRAINT issuer_contracts_pkey PRIMARY KEY DEFAULT gen_random_uuid(),
  side text NOT NULL CONSTRAINT issuer_contracts_side_check CHECK (side IN ('provider','issuer')),
  passport_identifier text NOT NULL,
  battery_identifier text,
  passport_id uuid CONSTRAINT issuer_contracts_passport_fkey REFERENCES passports(id) ON DELETE RESTRICT,
  issuer_bpnl bpnl NOT NULL,
  provider_bpnl bpnl NOT NULL,
  product_condition jsonb,
  pull_state text CONSTRAINT issuer_contracts_pull_state_check CHECK (pull_state IN ('pending','received','no_asset','contract_refused','provider_refused','receiver_unresolved','transport_failed')),
  pull_cause text,
  valid_from finite_timestamptz NOT NULL,
  valid_to finite_timestamptz,
  created_at finite_timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT issuer_contracts_side_columns_check CHECK ((side = 'issuer') = (pull_state IS NOT NULL) AND (side = 'provider' OR (passport_id IS NULL AND product_condition IS NULL AND battery_identifier IS NOT NULL)) AND (side = 'issuer' OR ((passport_id IS NULL) <> (product_condition IS NULL))))
);
CREATE UNIQUE INDEX issuer_contracts_open_key ON issuer_contracts (side, passport_identifier, issuer_bpnl, provider_bpnl) WHERE valid_to IS NULL;

CREATE TABLE received_battery_information (
  id bigint GENERATED ALWAYS AS IDENTITY CONSTRAINT received_battery_information_pkey PRIMARY KEY,
  contract_id uuid NOT NULL CONSTRAINT received_battery_information_contract_fkey REFERENCES issuer_contracts(id) ON DELETE RESTRICT,
  passport_identifier text NOT NULL,
  battery_identifier text NOT NULL,
  agreement_id text NOT NULL,
  payload jsonb NOT NULL,
  received_at finite_timestamptz NOT NULL,
  created_at finite_timestamptz NOT NULL DEFAULT now()
);

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
