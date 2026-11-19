# Conformance test kit

This folder holds the conformance test kit of the proposal CX-0160-4 (Battery Passport after the First Passport). The kit holds one test file per conformance criterion of Annex A of the proposal, from `CAC-001.tck.mjs` (CX-0160-4-CAC-001, New passport) to `CAC-016.tck.mjs` (CX-0160-4-CAC-016, Access map). Each file names its criterion in its first test title and reaches the reference server only through the binding contract of `lib/binding.mjs`.

## The two bindings

The variable `TCK_BINDING` selects the binding. Both bindings return the same contract: the three participants `provider` (the data provider of the original passports, `BPNL00000000TCK1`), `operator` (the second-life operator, `BPNL00000000TCK2`) and `recycler` (the recycler, the repairer and the waste receiver, `BPNL00000000TCK3`), and the two functions `settle()` and `stop()`.

- **The in-process binding** (`TCK_BINDING=in-process`, `lib/inProcessBinding.mjs`) starts three applications of the reference server in the process of the test file, each with its own schema of the test database, on one memory network: one memory transport per participant, one memory receiver resolver, one memory offer store and one memory twin registry per participant. The binding needs only Node.js and PostgreSQL. `settle()` advances the clock of the three applications by 6 seconds and runs the worker of each application twice.
- **The connector binding** (`TCK_BINDING=connector`, `lib/connectorBinding.mjs`) runs the same sixteen files through Tractus-X connectors and Digital Twin Registries. Phase P7 of the implementation plan writes the binding; until then `startBinding()` fails with the message `connector binding not available: <cause>`.

`lib/scenario.mjs` holds the fixture builders that the sixteen files share. Each builder calls only the operator endpoints of the reference server.

## The commands

The test kit imports the reference server by relative paths, so the packages of `server/` are installed first. The in-process binding reads the two variables `TEST_DATABASE_URL` and `TEST_APP_ROLE_PASSWORD` of the server tests. At the repository root, in the shell of the implementation plan that holds the function `node24`:

```bash
node24 bash -c "cd server && npm ci && cd ../tck && npm ci && TCK_BINDING=in-process npm test && node ../scripts/check-dependency-licenses.mjs"
```

The command prints the lines `# fail 0`, `# skipped 0` and `0 packages outside the licence list`.

## NOTICE

This work is licensed under the [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/legalcode).

- SPDX-License-Identifier: CC-BY-4.0
- SPDX-FileCopyrightText: 2026 Ichnos Protocol Pte. Ltd.
- SPDX-FileCopyrightText: 2026 Contributors to the Eclipse Foundation
- Source URL: https://github.com/Ichnos-Protocol/battery-passport-after-first-life/blob/main/tck/README.md
