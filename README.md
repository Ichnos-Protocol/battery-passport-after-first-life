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
| `docs/api/` | The OpenAPI specification and the JSON schemas of the lifecycle notifications | Not yet written |
| `docs/` | The methodology, the citation catalogue with 287 quotes, the list of the items that no standard covers, and the lessons from a first implementation | Written, listed in `docs/README.md` |
| `docs/architecture/` | The implementation specification of the standalone reference server, `implementation_plan.md` | Version 2 of 2026-11-16; waits for the independent review and the owner's approval |
| `docs/` | Architecture, administration guide, adoption view, development view, operations view | Not yet written |
| `models/` | The three proposed aspect models (Semantic Aspect Meta Model, SAMM) | Not yet written |
| `server/` | The reference server (Node.js 24, Express, PostgreSQL) | Not yet written |
| `tck/` | The conformance test kit, one test per conformance criterion | Not yet written |
| `requirements/` | The requirements registry, from stakeholder requirements to verification measures | 539 records, listed in `requirements/README.md` |
| `sources/` | The source texts that their licenses allow to redistribute | 97 files, listed in `sources/SOURCES.json` |
| `scripts/` | The checks of the repository | The license header check, the source register check, the requirement check, the private reference check and the specification check |

## Installation and usage

`INSTALL.md` describes the installation. The checks of the repository need Node.js 24.

Run the checks at the repository root:

```bash
node scripts/check-license-headers.mjs
node scripts/check-sources.mjs
node scripts/requirements-check.mjs
node scripts/check-private-references.mjs
```

The specification check needs Python 3. Run the check at the repository root:

```bash
python scripts/spec_gate_check.py docs/architecture/implementation_plan.md --src . --screens-heading "Interfaces" --id-column "Endpoint id" --testid-prefix "EP-"
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
