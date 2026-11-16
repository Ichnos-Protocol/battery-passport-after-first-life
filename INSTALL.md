# Installation

## Requirements

- Git
- Node.js 24, installed on the machine or run in a container of the public image `node:24`
- Java 21, installed on the machine or run in a container of the public image `eclipse-temurin:21`, for the validation of the models
- PostgreSQL 17, installed on the machine or run in a container of the public image `postgres:17`, for the tests of the server

## Steps

1. Clone the repository.
2. Run the license header check at the repository root: `node scripts/check-license-headers.mjs`. The check prints
   `0 files without a license header or NOTICE section` when every file carries its header.

## The lint of the OpenAPI file

Run the Spectral linter at the repository root. The command downloads the linter with `npx`:

```bash
npx --yes @stoplight/spectral-cli@6 lint docs/api/openAPI.yaml --ruleset .spectral.yaml --fail-severity error
```

The linter prints `No results with a severity of 'error' found!` when the OpenAPI file passes.

## The test of the contract

Install the packages of the reference server from the lock file and run the test of the contract:

```bash
cd server
npm ci
node --test --test-reporter=tap test/contractSchemas.test.mjs
```

The summary of the test holds the line `# fail 0` when the eight schema files and the OpenAPI file pass.

## The validation of the models

Download the SAMM command line tool 2.11.1 once into the folder `tools/`, which git ignores:

```bash
mkdir -p tools
curl -fsSL -o tools/samm-cli-2.11.1.jar https://github.com/eclipse-esmf/esmf-sdk/releases/download/v2.11.1/samm-cli-2.11.1.jar
```

Run the validation script at the repository root, in a shell with Java 21:

```bash
bash scripts/validate-models.sh --generate
```

The script checks the SHA-256 value of the tool, assembles the temporary models root `tools/models-root`, prints one
line that starts with `VALID` per model and, with the argument `--generate`, writes the JSON schema of each model to
`docs/api/aspects/` and prints one line that starts with `GENERATED` per model. The command
`git diff --exit-code -- docs/api/aspects` then exits 0 when the generated schemas equal the committed schemas.

## The test of the models

Run the test of the models in the folder `server/`, after `npm ci`:

```bash
cd server
node --test --test-reporter=tap test/modelExamples.test.mjs
```

The summary of the test holds the line `# fail 0` when the three generated schemas and the three example payloads pass.

## The test database and the tests of the server

The tests of the server need a PostgreSQL 17 database of their own and two variables. No file of the repository holds
a password: set both variables in the shell.

- `TEST_DATABASE_URL` is the connection string of a superuser, or of a role with the attribute `BYPASSRLS`, on the
  test database.
- `TEST_APP_ROLE_PASSWORD` is the password that the tests set for the role `refserver_app`.

Each test file creates the role `refserver_app` when the cluster holds no such role, creates one schema of its own,
applies the three migration files and drops the schema at its end. The third migration file revokes the privilege
`TEMPORARY` of the test database from the group PUBLIC, so use a database that serves no other application.

Run every test of the server and the licence check of the locked packages in the folder `server/`:

```bash
cd server
npm ci
npm test
node ../scripts/check-dependency-licenses.mjs
```

The summary of the tests holds the line `# fail 0`, and the licence check prints `0 packages outside the licence list`.

## The database of a deployment

A deployment of the reference server runs on a PostgreSQL 17 database of its own. Two commands of the folder
`server/` prepare the database, and both read their variables from the environment:

1. `npm run create-role` creates the login role `refserver_app`, removes every stored setting of the role and sets
   its password. The command reads
   `DATABASE_MIGRATION_URL`, the connection string of the role that owns the schema, and `APP_ROLE_PASSWORD`. An
   administrator runs the command once per database cluster, before the first migration, and again when the
   migration reports a stored setting of the role.
2. `npm run migrate` applies the migration files of `server/src/db/migrations/` to the schema of the variable
   `DATABASE_SCHEMA`. The command reads `DATABASE_MIGRATION_URL` and `DATABASE_SCHEMA`. A second run applies no file.

The server itself connects only as the role `refserver_app`. The server is not written yet, so the repository holds
no start command that works.

## The commands in a container

A machine without Node.js 24 and without Java 21 runs each command in a container. Section 11.0 of
`docs/architecture/implementation_plan.md` defines the shell function `node24` for the image `node:24` and the shell
function `java21` for the image `eclipse-temurin:21`. Each function mounts the repository in the container. The
commands then are:

```bash
node24 npx --yes @stoplight/spectral-cli@6 lint docs/api/openAPI.yaml --ruleset .spectral.yaml --fail-severity error
node24 bash -c "cd server && npm ci && node --test --test-reporter=tap test/contractSchemas.test.mjs"
java21 bash scripts/validate-models.sh --generate
node24 bash -c "cd server && node --test --test-reporter=tap test/modelExamples.test.mjs"
node24 bash -c "cd server && npm ci && npm test && node ../scripts/check-dependency-licenses.mjs"
```

Section 11.0 of the specification also states the two variables of the test database for a container of the image
`postgres:17` that publishes its port on the machine.

The reference server itself and the conformance test kit are not written yet. This file gains their installation
steps together with their first commit.

## NOTICE

This work is licensed under the [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/legalcode).

- SPDX-License-Identifier: CC-BY-4.0
- SPDX-FileCopyrightText: 2026 Ichnos Protocol Pte. Ltd.
- SPDX-FileCopyrightText: 2026 Contributors to the Eclipse Foundation
- Source URL: https://github.com/Ichnos-Protocol/battery-passport-after-first-life/blob/main/INSTALL.md
