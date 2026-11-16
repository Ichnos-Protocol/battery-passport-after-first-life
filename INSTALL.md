# Installation

## Requirements

- Git
- Node.js 24, installed on the machine or run in a container of the public image `node:24`

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

## The commands in a container

A machine without Node.js 24 runs each command in a container of the image `node:24`. Section 11.0 of
`docs/architecture/implementation_plan.md` defines the shell function `node24`, which mounts the repository in the
container. The two commands then are:

```bash
node24 npx --yes @stoplight/spectral-cli@6 lint docs/api/openAPI.yaml --ruleset .spectral.yaml --fail-severity error
node24 bash -c "cd server && npm ci && node --test --test-reporter=tap test/contractSchemas.test.mjs"
```

The reference server itself and the conformance test kit are not written yet. This file gains their installation
steps together with their first commit.

## NOTICE

This work is licensed under the [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/legalcode).

- SPDX-License-Identifier: CC-BY-4.0
- SPDX-FileCopyrightText: 2026 Ichnos Protocol Pte. Ltd.
- SPDX-FileCopyrightText: 2026 Contributors to the Eclipse Foundation
- Source URL: https://github.com/Ichnos-Protocol/battery-passport-after-first-life/blob/main/INSTALL.md
