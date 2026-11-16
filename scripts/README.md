# Repository checks

This folder holds the checks of the repository. The script `check-license-headers.mjs` lists every file without the license header of its kind or without a NOTICE section. The script `check-sources.mjs` compares every file under `sources/` with the register `sources/SOURCES.json`. The script `requirements-check.mjs` checks the requirements registry of `requirements/` with the rules of `lib/requirementsRules.mjs` and prints the traceability matrix with the option `--matrix`. The script `check-private-references.mjs` lists every line of a file outside `sources/` that names a private repository, a private path, a person, a host or a service of a private deployment, a contract matter or an e-mail address, and prints each hit as `path:line`.

## NOTICE

This work is licensed under the [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/legalcode).

- SPDX-License-Identifier: CC-BY-4.0
- SPDX-FileCopyrightText: 2026 Ichnos Protocol Pte. Ltd.
- SPDX-FileCopyrightText: 2026 Contributors to the Eclipse Foundation
- Source URL: https://github.com/Ichnos-Protocol/battery-passport-after-first-life/blob/main/scripts/README.md
