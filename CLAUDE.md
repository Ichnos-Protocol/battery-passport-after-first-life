# Battery passport after the first life: project guidelines

This repository holds a proposal to amend the Catena-X standard CX-0160 (Battery Passport) for the battery's life
after its first passport, and a reference implementation of the proposed interfaces. The repository is public and is
prepared as a contribution to Eclipse Tractus-X.

## The registry is the only source of truth

- The requirements registry in `requirements/` decides every question. Read the registry before any plan, change or
  answer, and cite each record with its identifier and its title.
- A requirement exists only when a stored source or the owner's quoted instruction states it.
- A change starts in the registry: the requirement first, then the specification, then the code and its test.
- `node scripts/requirements-check.mjs` reports 0 problems before every commit that touches `requirements/`.

## No reference to a private repository

- No file names a path, an issue, a person, a host or a service of a private repository or deployment.
- No secret, token, password or personal data enters the repository.
- A source text enters `sources/` only when its license allows redistribution. Every other text is cited by its
  version, its section and its public address.

## Tractus-X conventions

- Licenses: Apache-2.0 for code, CC-BY-4.0 for documentation, models and other non-code content.
- Every code file starts with the Apache-2.0 header of TRG 7.02. Every model and configuration file starts with the
  header of its license. Every Markdown file ends with the NOTICE section of TRG 7.07.
- `node scripts/check-license-headers.mjs` prints `0 files without a license header or NOTICE section` before every
  commit.
- The OpenAPI specification is `docs/api/openAPI.yaml` (TRG 1.08). The aspect models follow the folder layout of the
  Tractus-X semantic model repository.
- Commit messages follow the Conventional Commits format. The default branch is `main`.

## Engineering rules

- One executor per capability: exactly one module performs each capability.
- SOLID for every module. A route reads the request, checks the access, calls a service and writes the response. A
  service holds the rule. A data-access function holds the SQL.
- A module receives what it depends on. Importing a module reads no environment file and creates no client.
- A failed check refuses. No error is silently discarded.
- Every change comes with its test.

## Writing rules

- Every sentence has a named subject, a verb and the complements that give the context.
- Every identifier, code and abbreviation carries its description.
- Short sentences, one idea per sentence. No em dash or en dash as punctuation. No metaphors.
- Exact references: the battery passport is Article 77 of Regulation (EU) 2023/1542.
- Catena-X terms are used exactly: batch, serialized part, digital twin, submodel, aspect model, Digital Twin Registry,
  connector, Business Partner Number, data provider, data consumer, economic operator.

## NOTICE

This work is licensed under the [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/legalcode).

- SPDX-License-Identifier: CC-BY-4.0
- SPDX-FileCopyrightText: 2026 Ichnos Protocol Pte. Ltd.
- SPDX-FileCopyrightText: 2026 Contributors to the Eclipse Foundation
- Source URL: https://github.com/Khorolev/battery-passport-after-first-life/blob/main/CLAUDE.md
