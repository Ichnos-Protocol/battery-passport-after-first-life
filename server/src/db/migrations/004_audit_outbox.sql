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
-- Migration 004: the queue of the audit records that the audit trail could not write after the
-- transaction of a request (the owner's decision of 2026-11-19). The table, one trigger function, one
-- trigger and the privileges of the role refserver_app. The three earlier files do not change.
-- The last statement of the file fixes the search path of every function of the schema.

CREATE TABLE audit_outbox (
  id bigint GENERATED ALWAYS AS IDENTITY CONSTRAINT audit_outbox_pkey PRIMARY KEY,
  entries jsonb NOT NULL CONSTRAINT audit_outbox_entries_check CHECK (jsonb_typeof(entries) = 'array' AND jsonb_array_length(entries) BETWEEN 1 AND 20),
  decided_at finite_timestamptz NOT NULL,
  attempts integer NOT NULL DEFAULT 0 CONSTRAINT audit_outbox_attempts_check CHECK (attempts >= 0),
  not_before finite_timestamptz NOT NULL,
  last_error text CONSTRAINT audit_outbox_last_error_check CHECK (length(last_error) BETWEEN 1 AND 500),
  written_at finite_timestamptz,
  created_at finite_timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT audit_outbox_written_check CHECK (written_at IS NULL OR written_at >= decided_at)
);
CREATE INDEX audit_outbox_due_idx ON audit_outbox (not_before, id) WHERE written_at IS NULL;

CREATE FUNCTION check_audit_outbox_change() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER AS $$
BEGIN
  PERFORM require_read_committed();
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'ERR-DB-APPEND-ONLY: A record of the audit queue is never deleted.' USING ERRCODE = 'P0001';
  END IF;
  IF OLD.written_at IS NOT NULL THEN
    RAISE EXCEPTION 'ERR-DB-APPEND-ONLY: A written record of the audit queue never changes.' USING ERRCODE = 'P0001';
  END IF;
  IF (to_jsonb(NEW) - ARRAY['attempts', 'not_before', 'last_error', 'written_at']) IS DISTINCT FROM (to_jsonb(OLD) - ARRAY['attempts', 'not_before', 'last_error', 'written_at'])
     OR NEW.attempts < OLD.attempts THEN
    RAISE EXCEPTION 'ERR-DB-APPEND-ONLY: Only the attempt count, the next attempt, the last error and the write time of a record of the audit queue change, and the attempt count never decreases.' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_audit_outbox_change BEFORE UPDATE OR DELETE ON audit_outbox FOR EACH ROW EXECUTE FUNCTION check_audit_outbox_change();

GRANT SELECT, INSERT ON audit_outbox TO refserver_app;
GRANT UPDATE (attempts, not_before, last_error, written_at) ON audit_outbox TO refserver_app;

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
