# Changelog

All notable changes to this repository are documented in this file. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the versions follow
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- The repository skeleton and the legal files of TRG 7.01 of the Tractus-X Release Guidelines.
- The license header check `scripts/check-license-headers.mjs`.
- The redistributable source texts in `sources/`, their register `sources/SOURCES.json` and the check `scripts/check-sources.mjs`.
- The proposal CX-0160-4 (Battery Passport after the First Passport), draft 0.7 of 2026-11-16, in `docs/proposal/`. Draft 0.6 adds the proposed aspect model BatteryPassportAccessMap, the rules of section 2.2 items 8 to 12, the conformity assessment criterion CX-0160-4-CAC-016 and Annex B point 19, and changes Annex B point 11. Draft 0.7 states that `AccessMapEntry.path` is a JSONPath query (RFC 9535), adds RFC 9535 and the seven IDTA-02035 parts to the normative references of section 6.1, names the current draft in Annex A and names the four operations in decision D5 of Annex C.
- The methodology `docs/methodology.md`, the citation catalogue `docs/citation-catalogue.md`, the list of proposals `docs/proposals.md` and the lessons `docs/lessons-from-a-first-implementation.md`.
- The private reference check `scripts/check-private-references.mjs`.
- The implementation specification of the standalone reference server, `docs/architecture/implementation_plan.md`, version 7 of 2026-11-16, with the decisions of the owner of 2026-11-16 and with the 64 findings of the first independent review, the 36 findings of the second independent review, the 19 findings of the third independent review, the 15 findings of the fourth independent review and the 15 findings of the fifth independent review closed. The specification states every table, trigger, policy and grant of the three database migrations, every tool of phases P1 to P3 runs in a container, and three normative annexes print the 28 files of phases P1 to P3 in full. Version 6 gives every function of the database a fixed search path, takes the privilege to create a temporary table from the application role, holds the rule after the waste status for the records of a passport, and places the generated schemas of the three models in `docs/api/aspects/`. Version 7 lets no record move to another passport, refuses every write outside the isolation level READ COMMITTED, grants the privilege UPDATE by column, determines the responsibility timeline by the passport, and states the owner's decision that the reference server runs on a database of its own.
- The shared aspect models `io.catenax.shared.uuid` 2.1.0 and `io.catenax.shared.business_partner_number` 2.0.0 in `sources/Tractus-X/semantic-models/`, which the three proposed aspect models import.
- The specification check `scripts/spec_gate_check.py`.
- The annex check `scripts/check-annexes.mjs`, which compares every file that an annex of the implementation specification prints with the file of the repository.
- Phase P1 (the contract) of the implementation specification: the OpenAPI specification `docs/api/openAPI.yaml` of the lifecycle notification API in OpenAPI 3.1.0 with the four POST operations NewPassportIssued, BatteryRepaired, BatteryBecameWaste and PassportEnded, and the eight JSON schemas of `docs/api/schemas/` for the message header, the envelope, the content of each operation, the body of the response 200 and the error body.
- The ruleset `.spectral.yaml` of the OpenAPI lint and the workflow `.github/workflows/spectral.yml`, which lints the OpenAPI file with Spectral on a change of `docs/api/` or of `.spectral.yaml`.
- The workflow `.github/workflows/checks.yml`, which runs the registry check, the source register check, the license header check, the private reference check, the annex check and the specification check on every pull request and on every push to the branch `main`.
- The package file `server/package.json` and the lock file `server/package-lock.json` of the reference server, and the test of the contract `server/test/contractSchemas.test.mjs`.
- The file `.gitattributes`, which stores every text file with LF line endings.
- Phase P2 (the models) of the implementation specification: the three proposed aspect models BatteryPassportLifecycle, BatteryPassportSuccessors and BatteryPassportAccessMap in `models/`, each in version 1.0.0 with the status draft, in the folder layout of the Tractus-X semantic model repository. The lifecycle model and the successors model import the shared models `io.catenax.shared.uuid` 2.1.0 and `io.catenax.shared.business_partner_number` 2.0.0.
- The script `scripts/validate-models.sh`, which validates the three models with the SAMM command line tool 2.11.1 and, with the argument `--generate`, writes the JSON schema of each model to `docs/api/aspects/`, and the workflow `.github/workflows/samm.yml`, which runs the script and compares the generated schemas with the commit.
- The three generated JSON schemas and the three example payloads of the models in `docs/api/aspects/`.
- The module `server/src/validation/aspectSchemaCompiler.mjs`, the one compiler of the aspect schemas in the draft-04 dialect, and the test of the models `server/test/modelExamples.test.mjs`.
- Phase P3 (the database) of the implementation specification: the three migration files `001_schema.sql`, `002_triggers.sql` and `003_policies.sql` of `server/src/db/migrations/`, with 17 tables, four domains, 16 functions, 37 triggers and 12 row-level security policies for the role `refserver_app`.
- The database access of `server/src/db/`: the migration runner `migrate.mjs` with the command `npm run migrate`, the role creation `createAppRole.mjs` with the command `npm run create-role`, the pool factory `pool.mjs`, the transaction helper `transaction.mjs` and the health check `health.mjs`.
- The database rule tests `server/test/databaseRules.integration.test.mjs` with the test database module `server/test/support/database.mjs`: nine groups for the catalogue, the constraints, the triggers, the setting `app.today`, the policies, the privileges, the concurrent transactions, the type parsers and the isolation levels.
- The licence check of the locked packages `scripts/check-dependency-licenses.mjs` with its test `server/test/dependencyLicenses.test.mjs`.
- The workflow `.github/workflows/tests.yml`, which runs the tests of the server with a PostgreSQL 17 service and the licence check on every pull request and on every push to the branch `main`.

### Changed

- The process requirements PrR-CXD-026 (Three proposed models in the sldt-semantic-models layout) and PrR-CXD-028 (One conformance test per criterion CX-0160-4-CAC-001 to 016) and their verification measures name the three proposed aspect models and the sixteen conformance criteria.
- The citation catalogue holds 287 quotes. The numbers 265 and 266 are not used.
- Changed: the specification checker is a Node.js script, `scripts/spec-gate-check.mjs`. The Node.js script replaces `scripts/spec_gate_check.py` and takes the same options.
- The private reference check `scripts/check-private-references.mjs` excepts the expression of the letter M and one digit inside the two lock files `server/package-lock.json` and `tck/package-lock.json`, which a base64 integrity value can hold.
- The field `implementation` of the 31 software requirements that the reference server does not build names the reason and the owner's decision of 2026-11-16.
- The workflow `.github/workflows/checks.yml` runs the annex check with the argument `--require P3`.
- The test of the contract `server/test/contractSchemas.test.mjs` uses the invented Business Partner Numbers `BPNL00000000TCK1`, `BPNL00000000TCK2` and `BPNL00000000TCK4` of the test data of the implementation specification.
- The list of proposals `docs/proposals.md` names the files of the three models, the validation command and the import of version 2.1.0 of the shared model `io.catenax.shared.uuid`.

## NOTICE

This work is licensed under the [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/legalcode).

- SPDX-License-Identifier: CC-BY-4.0
- SPDX-FileCopyrightText: 2026 Ichnos Protocol Pte. Ltd.
- SPDX-FileCopyrightText: 2026 Contributors to the Eclipse Foundation
- Source URL: https://github.com/Ichnos-Protocol/battery-passport-after-first-life/blob/main/CHANGELOG.md
