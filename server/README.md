# Reference server

This folder holds the reference server of the lifecycle interfaces: Node.js 24, Express and PostgreSQL. The server is not written yet.

The table states what the folder holds after phases P1 (the contract), P2 (the models) and P3 (the database) of the implementation specification
`docs/architecture/implementation_plan.md`.

| Path | Content |
|---|---|
| `package.json` | The package file of the reference server: ES modules, Node.js 24 or later, the scripts `test`, `migrate`, `create-role`, `sign-token` and `start`. The modules that the scripts `sign-token` and `start` run arrive in phases P4 and P5 |
| `package-lock.json` | The lock file, which pins each package to one release |
| `test/contractSchemas.test.mjs` | The test of the contract: the eight schema files of `docs/api/schemas/` and the file `docs/api/openAPI.yaml` |
| `src/validation/aspectSchemaCompiler.mjs` | The one compiler of the aspect schemas in the draft-04 dialect of JSON Schema: the three schemas of `docs/api/aspects/` that the SAMM command line tool generates, and the stored schemas of `sources/IDTA/` |
| `test/modelExamples.test.mjs` | The test of the models: the three generated schemas and the three example payloads of `docs/api/aspects/`, and the stored schemas of `sources/IDTA/` |
| `src/db/migrations/` | The three migration files: `001_schema.sql` (four domains and 17 tables), `002_triggers.sql` (16 functions and 37 triggers) and `003_policies.sql` (the privileges of the role `refserver_app` and 12 row-level security policies) |
| `src/db/migrate.mjs`, `src/db/migrateCli.mjs` | The migration runner and the command `npm run migrate`, which reads `DATABASE_MIGRATION_URL` and `DATABASE_SCHEMA` |
| `src/db/createAppRole.mjs`, `src/db/createAppRoleCli.mjs` | The creation of the login role `refserver_app`, which also removes every stored setting of the role, and the command `npm run create-role`, which reads `DATABASE_MIGRATION_URL` and `APP_ROLE_PASSWORD` |
| `src/db/pool.mjs` | The factory of the connection pool: the search path of the schema, the time zone UTC, the isolation level READ COMMITTED and the type parsers |
| `src/db/transaction.mjs` | The one transaction helper `withTransaction`, which sets the two transaction settings `app.acting_bpnl` and `app.today` |
| `src/db/health.mjs` | The health check of the database connection |
| `test/support/database.mjs` | The test database: one migrated schema per test file |
| `test/databaseRules.integration.test.mjs` | The database rule tests in nine groups: the catalogue, the constraints, the triggers, the setting `app.today`, the policies, the privileges, the concurrent transactions, the type parsers and the isolation levels |
| `test/dependencyLicenses.test.mjs` | The test of the licence check `scripts/check-dependency-licenses.mjs` |

The two database tests need a PostgreSQL 17 database and the two variables `TEST_DATABASE_URL` and `TEST_APP_ROLE_PASSWORD`, which `INSTALL.md` describes. Run every test in this folder:

```bash
npm ci
npm test
```

## NOTICE

This work is licensed under the [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/legalcode).

- SPDX-License-Identifier: CC-BY-4.0
- SPDX-FileCopyrightText: 2026 Ichnos Protocol Pte. Ltd.
- SPDX-FileCopyrightText: 2026 Contributors to the Eclipse Foundation
- Source URL: https://github.com/Ichnos-Protocol/battery-passport-after-first-life/blob/main/server/README.md
