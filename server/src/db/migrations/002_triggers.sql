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
-- Migration 002: the sixteen functions and the thirty-seven triggers of the reference server.
-- Every refusal of a rule is raised with the error code P0001, and its message starts with the refusal id.
-- The last statement of the file fixes the search path of every function of the schema.

CREATE FUNCTION require_read_committed() RETURNS void LANGUAGE plpgsql STABLE SECURITY INVOKER AS $$
BEGIN
  IF current_setting('transaction_isolation') <> 'read committed' THEN
    RAISE EXCEPTION 'ERR-DB-ISOLATION: A transaction that writes a record of this schema runs at the isolation level READ COMMITTED.' USING ERRCODE = 'P0001';
  END IF;
END $$;

CREATE FUNCTION app_today() RETURNS date LANGUAGE plpgsql STABLE SECURITY INVOKER SET datestyle = 'ISO, YMD' AS $$
DECLARE
  setting text := NULLIF(current_setting('app.today', true), '');
BEGIN
  IF setting IS NULL THEN
    RETURN NULL;
  END IF;
  IF setting !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN
    RAISE EXCEPTION 'ERR-DB-TODAY: The setting app.today is a date of the form YYYY-MM-DD.' USING ERRCODE = '22007';
  END IF;
  BEGIN
    RETURN setting::date;
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'ERR-DB-TODAY: The setting app.today is a date of the form YYYY-MM-DD.' USING ERRCODE = '22007';
  END;
END $$;

CREATE FUNCTION refuse_passport_id_change() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER AS $$
BEGIN
  PERFORM require_read_committed();
  IF NEW.passport_id IS DISTINCT FROM OLD.passport_id THEN
    RAISE EXCEPTION 'ERR-DB-APPEND-ONLY: A record never moves to another passport.' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_fixed_passport_passport_purposes BEFORE UPDATE ON passport_purposes FOR EACH ROW EXECUTE FUNCTION refuse_passport_id_change();
CREATE TRIGGER trg_fixed_passport_passport_aspect_payloads BEFORE UPDATE ON passport_aspect_payloads FOR EACH ROW EXECUTE FUNCTION refuse_passport_id_change();
CREATE TRIGGER trg_fixed_passport_passport_lineage_links BEFORE UPDATE ON passport_lineage_links FOR EACH ROW EXECUTE FUNCTION refuse_passport_id_change();
CREATE TRIGGER trg_fixed_passport_passport_successor_links BEFORE UPDATE ON passport_successor_links FOR EACH ROW EXECUTE FUNCTION refuse_passport_id_change();
CREATE TRIGGER trg_fixed_passport_passport_repair_entries BEFORE UPDATE ON passport_repair_entries FOR EACH ROW EXECUTE FUNCTION refuse_passport_id_change();
CREATE TRIGGER trg_fixed_passport_passport_responsibility_intervals BEFORE UPDATE ON passport_responsibility_intervals FOR EACH ROW EXECUTE FUNCTION refuse_passport_id_change();
CREATE TRIGGER trg_fixed_passport_passport_access_records BEFORE UPDATE ON passport_access_records FOR EACH ROW EXECUTE FUNCTION refuse_passport_id_change();
CREATE TRIGGER trg_fixed_passport_passport_write_decisions BEFORE UPDATE ON passport_write_decisions FOR EACH ROW EXECUTE FUNCTION refuse_passport_id_change();
CREATE TRIGGER trg_fixed_passport_issuer_contracts BEFORE UPDATE ON issuer_contracts FOR EACH ROW EXECUTE FUNCTION refuse_passport_id_change();

CREATE FUNCTION set_passport_insert_defaults() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER AS $$
BEGIN
  PERFORM require_read_committed();
  NEW.lineage_open := NEW.lifecycle_status IN ('re-used', 'repurposed', 'remanufactured');
  RETURN NEW;
END $$;
CREATE TRIGGER trg_passport_insert BEFORE INSERT ON passports FOR EACH ROW EXECUTE FUNCTION set_passport_insert_defaults();

CREATE FUNCTION refuse_passport_identity_change() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER AS $$
BEGIN
  PERFORM require_read_committed();
  IF NEW.id IS DISTINCT FROM OLD.id
     OR NEW.passport_identifier IS DISTINCT FROM OLD.passport_identifier
     OR NEW.battery_identifier IS DISTINCT FROM OLD.battery_identifier
     OR NEW.manufacturer_bpnl IS DISTINCT FROM OLD.manufacturer_bpnl
     OR NEW.battery_model_id IS DISTINCT FROM OLD.battery_model_id THEN
    RAISE EXCEPTION 'ERR-DB-IDENTITY-PERMANENT: The identifiers, the manufacturer and the battery model of a passport never change.' USING ERRCODE = 'P0001';
  END IF;
  IF OLD.lifecycle_status = 'waste'
     AND (NEW.waste_successor_bpnl IS DISTINCT FROM OLD.waste_successor_bpnl
          OR NEW.waste_successor_role IS DISTINCT FROM OLD.waste_successor_role
          OR NEW.waste_date IS DISTINCT FROM OLD.waste_date) THEN
    RAISE EXCEPTION 'ERR-DB-WASTE-SUCCESSOR: The named successor, its role and the waste date of a waste passport never change.' USING ERRCODE = 'P0001';
  END IF;
  IF NEW.lineage_open AND NOT OLD.lineage_open THEN
    RAISE EXCEPTION 'ERR-DB-LINEAGE: The lineage of a passport is never opened again.' USING ERRCODE = 'P0001';
  END IF;
  IF (NEW.date_into_service IS NULL OR NEW.rated_capacity_ah IS NULL OR NEW.capacity_fade_percent IS NULL
      OR NEW.power_fade_percent IS NULL OR NEW.expected_lifetime_years IS NULL)
     AND EXISTS (SELECT 1 FROM passport_lineage_links l WHERE l.passport_id = NEW.id) THEN
    RAISE EXCEPTION 'ERR-DB-LINEAGE: A new passport keeps a date of putting into service and its four performance values.' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_passport_identity BEFORE UPDATE ON passports FOR EACH ROW EXECUTE FUNCTION refuse_passport_identity_change();

CREATE FUNCTION refuse_battery_model_change() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER AS $$
BEGIN
  PERFORM require_read_committed();
  RAISE EXCEPTION 'ERR-DB-IDENTITY-PERMANENT: A battery model is never updated and never deleted.' USING ERRCODE = 'P0001';
END $$;
CREATE TRIGGER trg_battery_model_identity BEFORE UPDATE OR DELETE ON battery_models FOR EACH ROW EXECUTE FUNCTION refuse_battery_model_change();

CREATE FUNCTION check_passport_status_change() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER AS $$
BEGIN
  PERFORM require_read_committed();
  IF NEW.lifecycle_status IS DISTINCT FROM OLD.lifecycle_status THEN
    IF NEW.lifecycle_status = 'waste' THEN
      RETURN NEW;
    END IF;
    IF NEW.lifecycle_status = 're-used' AND OLD.lifecycle_status IN ('original', 'repurposed', 'remanufactured') THEN
      RETURN NEW;
    END IF;
    RAISE EXCEPTION 'ERR-DB-STATUS-CHANGE: The status of a passport changes only to waste, or to re-used from original, repurposed or remanufactured.' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_passport_status_change BEFORE UPDATE OF lifecycle_status ON passports FOR EACH ROW EXECUTE FUNCTION check_passport_status_change();

CREATE FUNCTION refuse_change_of_ended_passport() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER AS $$
BEGIN
  PERFORM require_read_committed();
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'ERR-DB-PASSPORT-ENDED: A passport is never deleted.' USING ERRCODE = 'P0001';
  END IF;
  IF OLD.recycling_date IS NOT NULL THEN
    RAISE EXCEPTION 'ERR-DB-PASSPORT-ENDED: An ended passport never changes.' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_passport_ended BEFORE UPDATE OR DELETE ON passports FOR EACH ROW EXECUTE FUNCTION refuse_change_of_ended_passport();

CREATE FUNCTION check_passport_after_waste() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER AS $$
DECLARE
  today date;
  in_force boolean;
  exempt text[] := ARRAY['successor_authorisation_ref', 'successor_authorisation_valid_from', 'successor_authorisation_valid_to',
                         'recycling_date', 'recycler_bpnl', 'material_recycling_certificate_catena_x_id'];
BEGIN
  PERFORM require_read_committed();
  IF OLD.recycling_date IS NOT NULL THEN
    RETURN NEW;
  END IF;
  IF OLD.lifecycle_status <> 'waste' THEN
    RETURN NEW;
  END IF;
  today := app_today();
  in_force := today IS NOT NULL
    AND OLD.successor_authorisation_valid_from IS NOT NULL
    AND OLD.successor_authorisation_valid_from <= today
    AND (OLD.successor_authorisation_valid_to IS NULL OR OLD.successor_authorisation_valid_to >= today);
  IF NOT in_force AND (to_jsonb(NEW) - exempt) IS DISTINCT FROM (to_jsonb(OLD) - exempt) THEN
    RAISE EXCEPTION 'ERR-DB-SUCCESSOR-AUTHORISATION: A waste passport changes only under an authorisation of the successor that is in force.' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_passport_after_waste BEFORE UPDATE ON passports FOR EACH ROW EXECUTE FUNCTION check_passport_after_waste();

CREATE FUNCTION check_child_after_waste() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER AS $$
DECLARE
  pid uuid;
  p passports%ROWTYPE;
  today date;
BEGIN
  PERFORM require_read_committed();
  IF TG_OP = 'DELETE' THEN
    pid := OLD.passport_id;
  ELSE
    pid := NEW.passport_id;
  END IF;
  SELECT * INTO p FROM passports WHERE id = pid FOR SHARE;
  IF FOUND AND p.recycling_date IS NULL AND p.lifecycle_status = 'waste' THEN
    today := app_today();
    IF today IS NULL OR p.successor_authorisation_valid_from IS NULL OR p.successor_authorisation_valid_from > today
       OR (p.successor_authorisation_valid_to IS NOT NULL AND p.successor_authorisation_valid_to < today) THEN
      RAISE EXCEPTION 'ERR-DB-SUCCESSOR-AUTHORISATION: A record of a waste passport changes only under an authorisation of the successor that is in force.' USING ERRCODE = 'P0001';
    END IF;
  END IF;
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_passport_aspect_payloads_after_waste BEFORE INSERT OR UPDATE OR DELETE ON passport_aspect_payloads FOR EACH ROW EXECUTE FUNCTION check_child_after_waste();
CREATE TRIGGER trg_passport_purposes_after_waste BEFORE INSERT OR UPDATE OR DELETE ON passport_purposes FOR EACH ROW EXECUTE FUNCTION check_child_after_waste();
CREATE TRIGGER trg_passport_repair_entries_after_waste BEFORE INSERT OR UPDATE OR DELETE ON passport_repair_entries FOR EACH ROW EXECUTE FUNCTION check_child_after_waste();
CREATE TRIGGER trg_passport_successor_links_after_waste BEFORE INSERT OR UPDATE OR DELETE ON passport_successor_links FOR EACH ROW EXECUTE FUNCTION check_child_after_waste();
CREATE TRIGGER trg_passport_lineage_links_after_waste BEFORE INSERT OR UPDATE OR DELETE ON passport_lineage_links FOR EACH ROW EXECUTE FUNCTION check_child_after_waste();

CREATE FUNCTION check_passport_lineage() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER AS $$
DECLARE
  has_link boolean;
  still_open boolean;
BEGIN
  PERFORM require_read_committed();
  IF NEW.lifecycle_status = 'waste' THEN
    RAISE EXCEPTION 'ERR-DB-LINEAGE: A passport is never inserted with the status waste.' USING ERRCODE = 'P0001';
  END IF;
  SELECT EXISTS (SELECT 1 FROM passport_lineage_links l WHERE l.passport_id = NEW.id) INTO has_link;
  SELECT p.lineage_open INTO still_open FROM passports p WHERE p.id = NEW.id;
  IF NEW.lifecycle_status = 'original' AND has_link THEN
    RAISE EXCEPTION 'ERR-DB-LINEAGE: A passport that is inserted with the status original has no lineage link.' USING ERRCODE = 'P0001';
  END IF;
  IF NEW.lifecycle_status IN ('re-used', 'repurposed', 'remanufactured')
     AND (NOT has_link OR NEW.date_into_service IS NULL OR NEW.rated_capacity_ah IS NULL OR NEW.capacity_fade_percent IS NULL
          OR NEW.power_fade_percent IS NULL OR NEW.expected_lifetime_years IS NULL) THEN
    RAISE EXCEPTION 'ERR-DB-LINEAGE: A new passport has a lineage link, a date of putting into service and its four performance values.' USING ERRCODE = 'P0001';
  END IF;
  IF (SELECT count(DISTINCT l.operation_date) FROM passport_lineage_links l WHERE l.passport_id = NEW.id) > 1 THEN
    RAISE EXCEPTION 'ERR-DB-LINEAGE: The lineage links of a new passport hold one operation date.' USING ERRCODE = 'P0001';
  END IF;
  IF still_open THEN
    RAISE EXCEPTION 'ERR-DB-LINEAGE: The lineage of a new passport is closed before the commit.' USING ERRCODE = 'P0001';
  END IF;
  RETURN NULL;
END $$;
CREATE CONSTRAINT TRIGGER trg_passport_lineage AFTER INSERT ON passports DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION check_passport_lineage();

CREATE FUNCTION check_responsibility() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER AS $$
DECLARE
  pid uuid;
  p passports%ROWTYPE;
  f passport_responsibility_intervals%ROWTYPE;
  o passport_responsibility_intervals%ROWTYPE;
  interval_count integer;
  open_count integer;
  first_start timestamptz;
BEGIN
  PERFORM require_read_committed();
  IF TG_TABLE_NAME = 'passports' THEN
    pid := NEW.id;
  ELSE
    pid := NEW.passport_id;
  END IF;
  SELECT * INTO p FROM passports WHERE id = pid;
  SELECT count(*), count(*) FILTER (WHERE i.valid_to IS NULL) INTO interval_count, open_count
    FROM passport_responsibility_intervals i WHERE i.passport_id = pid;
  IF open_count <> 1 THEN
    RAISE EXCEPTION 'ERR-DB-RESPONSIBILITY: A passport has exactly one open responsibility interval.' USING ERRCODE = 'P0001';
  END IF;
  SELECT * INTO f FROM passport_responsibility_intervals i WHERE i.passport_id = pid ORDER BY i.valid_from, i.id LIMIT 1;
  SELECT * INTO o FROM passport_responsibility_intervals i WHERE i.passport_id = pid AND i.valid_to IS NULL;
  SELECT max(l.operation_date) INTO first_start FROM passport_lineage_links l WHERE l.passport_id = pid;
  IF first_start IS NULL THEN
    first_start := (p.date_of_manufacture::date::timestamp AT TIME ZONE 'UTC');
  END IF;
  IF f.responsible_bpnl <> p.manufacturer_bpnl OR f.role <> 'economicOperator' OR f.valid_from <> first_start THEN
    RAISE EXCEPTION 'ERR-DB-RESPONSIBILITY: The first responsibility interval of a passport names the manufacturer as economic operator and starts at the date of manufacture at 00:00:00 UTC, or at the operation date of the lineage links of a new passport.' USING ERRCODE = 'P0001';
  END IF;
  IF p.lifecycle_status = 'waste' THEN
    IF interval_count <> 2 OR o.id = f.id OR f.valid_to IS DISTINCT FROM p.waste_date
       OR o.responsible_bpnl <> p.waste_successor_bpnl OR o.role <> p.waste_successor_role OR o.valid_from <> p.waste_date THEN
      RAISE EXCEPTION 'ERR-DB-WASTE-SUCCESSOR: The open responsibility interval of a waste passport names the successor and starts at the waste date, at which the earlier interval ends.' USING ERRCODE = 'P0001';
    END IF;
  ELSIF interval_count <> 1 THEN
    RAISE EXCEPTION 'ERR-DB-RESPONSIBILITY: A passport that is not waste has one responsibility interval.' USING ERRCODE = 'P0001';
  END IF;
  IF p.recycling_date IS NOT NULL AND p.recycling_date < o.valid_from THEN
    RAISE EXCEPTION 'ERR-DB-END-DATE: The recycling date of a passport is not before the start of its open responsibility interval.' USING ERRCODE = 'P0001';
  END IF;
  RETURN NULL;
END $$;
CREATE CONSTRAINT TRIGGER trg_passport_responsibility AFTER INSERT OR UPDATE ON passports DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION check_responsibility();
CREATE CONSTRAINT TRIGGER trg_interval_responsibility AFTER INSERT OR UPDATE ON passport_responsibility_intervals DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION check_responsibility();

CREATE FUNCTION refuse_change() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER AS $$
BEGIN
  PERFORM require_read_committed();
  RAISE EXCEPTION 'ERR-DB-APPEND-ONLY: A record of this table is never updated and never deleted.' USING ERRCODE = 'P0001';
END $$;
CREATE TRIGGER trg_passport_purposes_append_only BEFORE UPDATE OR DELETE ON passport_purposes FOR EACH ROW EXECUTE FUNCTION refuse_change();
CREATE TRIGGER trg_passport_lineage_links_append_only BEFORE UPDATE OR DELETE ON passport_lineage_links FOR EACH ROW EXECUTE FUNCTION refuse_change();
CREATE TRIGGER trg_passport_repair_entries_append_only BEFORE UPDATE OR DELETE ON passport_repair_entries FOR EACH ROW EXECUTE FUNCTION refuse_change();
CREATE TRIGGER trg_passport_successor_links_append_only BEFORE UPDATE OR DELETE ON passport_successor_links FOR EACH ROW EXECUTE FUNCTION refuse_change();
CREATE TRIGGER trg_notifications_received_append_only BEFORE UPDATE OR DELETE ON notifications_received FOR EACH ROW EXECUTE FUNCTION refuse_change();
CREATE TRIGGER trg_passport_write_decisions_append_only BEFORE UPDATE OR DELETE ON passport_write_decisions FOR EACH ROW EXECUTE FUNCTION refuse_change();
CREATE TRIGGER trg_received_battery_information_append_only BEFORE UPDATE OR DELETE ON received_battery_information FOR EACH ROW EXECUTE FUNCTION refuse_change();

CREATE FUNCTION check_interval_change() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER AS $$
DECLARE
  ended timestamptz;
BEGIN
  PERFORM require_read_committed();
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'ERR-DB-APPEND-ONLY: A responsibility interval is never deleted.' USING ERRCODE = 'P0001';
  END IF;
  IF TG_OP = 'INSERT' THEN
    SELECT recycling_date INTO ended FROM passports WHERE id = NEW.passport_id FOR SHARE;
    IF ended IS NOT NULL THEN
      RAISE EXCEPTION 'ERR-DB-PASSPORT-ENDED: A record of an ended passport never changes.' USING ERRCODE = 'P0001';
    END IF;
    IF NEW.valid_to IS NOT NULL
       OR EXISTS (SELECT 1 FROM passport_responsibility_intervals i WHERE i.passport_id = NEW.passport_id AND i.valid_to IS NULL)
       OR NEW.valid_from IS DISTINCT FROM COALESCE((SELECT max(i.valid_to) FROM passport_responsibility_intervals i WHERE i.passport_id = NEW.passport_id), NEW.valid_from) THEN
      RAISE EXCEPTION 'ERR-DB-RESPONSIBILITY: A responsibility interval is inserted open and starts at the end of the earlier interval of its passport.' USING ERRCODE = 'P0001';
    END IF;
    RETURN NEW;
  END IF;
  IF OLD.valid_to IS NOT NULL OR (to_jsonb(NEW) - 'valid_to') IS DISTINCT FROM (to_jsonb(OLD) - 'valid_to') THEN
    RAISE EXCEPTION 'ERR-DB-APPEND-ONLY: Only the end of an open responsibility interval is set.' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_interval_change BEFORE INSERT OR UPDATE OR DELETE ON passport_responsibility_intervals FOR EACH ROW EXECUTE FUNCTION check_interval_change();

CREATE FUNCTION refuse_child_of_ended_passport() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER AS $$
DECLARE
  pid uuid;
  ended timestamptz;
BEGIN
  PERFORM require_read_committed();
  IF TG_OP = 'DELETE' THEN
    pid := OLD.passport_id;
  ELSE
    pid := NEW.passport_id;
  END IF;
  SELECT recycling_date INTO ended FROM passports WHERE id = pid FOR SHARE;
  IF ended IS NOT NULL THEN
    RAISE EXCEPTION 'ERR-DB-PASSPORT-ENDED: A record of an ended passport never changes.' USING ERRCODE = 'P0001';
  END IF;
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_passport_aspect_payloads_ended BEFORE INSERT OR UPDATE OR DELETE ON passport_aspect_payloads FOR EACH ROW EXECUTE FUNCTION refuse_child_of_ended_passport();
CREATE TRIGGER trg_passport_successor_links_ended BEFORE INSERT OR UPDATE OR DELETE ON passport_successor_links FOR EACH ROW EXECUTE FUNCTION refuse_child_of_ended_passport();
CREATE TRIGGER trg_passport_repair_entries_ended BEFORE INSERT OR UPDATE OR DELETE ON passport_repair_entries FOR EACH ROW EXECUTE FUNCTION refuse_child_of_ended_passport();
CREATE TRIGGER trg_passport_purposes_ended BEFORE INSERT OR UPDATE OR DELETE ON passport_purposes FOR EACH ROW EXECUTE FUNCTION refuse_child_of_ended_passport();
CREATE TRIGGER trg_passport_responsibility_intervals_ended BEFORE INSERT OR UPDATE ON passport_responsibility_intervals FOR EACH ROW EXECUTE FUNCTION refuse_child_of_ended_passport();

CREATE FUNCTION check_lineage_link_insert() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER AS $$
DECLARE
  is_open boolean;
BEGIN
  PERFORM require_read_committed();
  SELECT p.lineage_open INTO is_open FROM passports p WHERE p.id = NEW.passport_id FOR UPDATE;
  IF is_open IS NOT TRUE THEN
    RAISE EXCEPTION 'ERR-DB-LINEAGE: A lineage link is inserted only while the lineage of its new passport is open.' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_passport_lineage_links_insert BEFORE INSERT ON passport_lineage_links FOR EACH ROW EXECUTE FUNCTION check_lineage_link_insert();

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
