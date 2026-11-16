# Installation

## Requirements

- Git
- Node.js 24, installed on the machine or run in a container of the public image `node:24`
- Java 21, installed on the machine or run in a container of the public image `eclipse-temurin:21`, for the validation of the models

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
```

The reference server itself and the conformance test kit are not written yet. This file gains their installation
steps together with their first commit.

## NOTICE

This work is licensed under the [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/legalcode).

- SPDX-License-Identifier: CC-BY-4.0
- SPDX-FileCopyrightText: 2026 Ichnos Protocol Pte. Ltd.
- SPDX-FileCopyrightText: 2026 Contributors to the Eclipse Foundation
- Source URL: https://github.com/Ichnos-Protocol/battery-passport-after-first-life/blob/main/INSTALL.md
