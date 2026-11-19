# Battery passport after the first life

## Purpose

This repository holds two things:

1. A proposal to amend the Catena-X standard CX-0160 (Battery Passport) for the battery's life after its first
   passport: re-use, repurposing, remanufacturing, repair, waste status and recycling. The working title of the
   proposal is "CX-0160-4 Battery Passport after the First Passport". The Catena-X Association has not assigned the
   number.
2. A reference implementation of the interfaces that the proposal defines: an OpenAPI specification, three proposed
   aspect models, a reference server and a conformance test kit.

The proposal follows Regulation (EU) 2023/1542 (the EU Battery Regulation), Article 77, and the Catena-X standards.
The repository is prepared as a contribution to Eclipse Tractus-X and follows the Tractus-X Release Guidelines (TRG).
The repository is not a repository of the Eclipse Tractus-X project, and no Catena-X body has approved the proposal.

## Status

The repository is in its setup. The table states what each folder holds on 2026-11-16.

| Folder | Content | State |
|---|---|---|
| `docs/proposal/` | The text of the proposal CX-0160-4 | Draft 0.7 of 2026-11-16 |
| `docs/api/` | The OpenAPI specification `openAPI.yaml` of the lifecycle notification API (OpenAPI 3.1.0, four POST operations), the eight JSON schemas of `docs/api/schemas/`, and the generated JSON schema and the example payload of each proposed aspect model in `docs/api/aspects/` | Written in phases P1 and P2 of the implementation specification |
| `docs/` | The methodology, the citation catalogue with 287 quotes, the list of the items that no standard covers, and the lessons from a first implementation | Written, listed in `docs/README.md` |
| `docs/architecture/` | The implementation specification of the standalone reference server, `implementation_plan.md` | Version 12 of 2026-11-19; the owner approved version 7 on 2026-11-16; version 8 corrects defects of the text that the execution of phases P1 to P3 found, which wait for the owner's confirmation; version 9 adds the tests of the configuration reader, the logger and the identifier conversions by the owner's order of 2026-11-17; version 10 closes the review of the code of phases P4 and P5 and records the owner's three decisions of 2026-11-19; version 11 records the differences that the execution of phases P4 to P6 found; version 12 records the verification of Tractus-X EDC 0.13.0 in phase P7, the owner's three decisions on the connector binding of 2026-11-19 and four corrections that published texts decide; phases P1 (the contract), P2 (the models) and P3 (the database) are delivered; phases P4 to P8 wait for the approval of the owner |
| `docs/` | Architecture, administration guide, adoption view, development view, operations view | Not yet written |
| `models/` | The three proposed aspect models BatteryPassportLifecycle, BatteryPassportSuccessors and BatteryPassportAccessMap (Semantic Aspect Meta Model, SAMM), each in version 1.0.0 with the status draft | Written in phase P2 of the implementation specification; each model passes the validation of the SAMM command line tool 2.11.1 |
| `server/` | The reference server (Node.js 24, Express, PostgreSQL) | Phases P1 to P3 are written: the package file, the lock file, the compiler of the aspect schemas, the database access of `server/src/db/` with the three migration files (17 tables, 16 functions, 37 triggers, 12 row-level security policies) and four test files. The services, the routes and the application are not yet written |
| `tck/` | The conformance test kit, one test per conformance criterion | Not yet written |
| `requirements/` | The requirements registry, from stakeholder requirements to verification measures | 539 records, listed in `requirements/README.md` |
| `sources/` | The source texts that their licenses allow to redistribute | 97 files, listed in `sources/SOURCES.json` |
| `scripts/` | The checks of the repository | The license header check, the source register check, the requirement check, the private reference check, the annex check, the specification check, the model validation script `validate-models.sh` and the licence check of the locked packages `check-dependency-licenses.mjs` |

The folder `.github/` holds the continuous integration: the workflows of the repository checks, of the OpenAPI lint, of the model validation and of the tests of the server, and the CodeQL workflow, the TruffleHog workflow and the Dependabot file. The implementation specification assigns the last three files to phase P8, and the three files are delivered ahead of phase P8 by the plan of the owner of 2026-11-16.

## Installation and usage

`INSTALL.md` describes the installation, the lint of the OpenAPI file, the validation of the models, the test database and the tests of the server. The checks of the repository need Node.js 24.

Run the checks at the repository root:

```bash
node scripts/check-license-headers.mjs
node scripts/check-sources.mjs
node scripts/requirements-check.mjs
node scripts/check-private-references.mjs
node scripts/check-annexes.mjs --require P3
```

The specification check needs Node.js only. Run the specification check at the repository root:

```bash
node scripts/spec-gate-check.mjs docs/architecture/implementation_plan.md --src . --screens-heading "Interfaces" --id-column "Endpoint id" --testid-prefix "EP-"
```

## License

The code of this repository is licensed under the Apache License, Version 2.0 (`LICENSE`). The documentation, the
models and the other non-code content are licensed under the Creative Commons Attribution 4.0 International license
(`LICENSE_non-code`). `NOTICE.md` names the third-party content.

## Contribution and contact

`CONTRIBUTING.md` describes how to contribute. Contact the maintainer through the issues of this repository.

## NOTICE

This work is licensed under the [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/legalcode).

- SPDX-License-Identifier: CC-BY-4.0
- SPDX-FileCopyrightText: 2026 Ichnos Protocol Pte. Ltd.
- SPDX-FileCopyrightText: 2026 Contributors to the Eclipse Foundation
- Source URL: https://github.com/Ichnos-Protocol/battery-passport-after-first-life/blob/main/README.md
