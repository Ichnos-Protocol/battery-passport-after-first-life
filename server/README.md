# Reference server

This folder holds the reference server of the lifecycle interfaces: Node.js 24, Express and PostgreSQL. The server is not written yet.

The table states what the folder holds after phase P1 (the contract) of the implementation specification
`docs/architecture/implementation_plan.md`.

| Path | Content |
|---|---|
| `package.json` | The package file of the reference server: ES modules, Node.js 24 or later, the scripts `test`, `migrate`, `create-role`, `sign-token` and `start`. The modules that the scripts `migrate`, `create-role`, `sign-token` and `start` run arrive in phases P3 to P5 |
| `package-lock.json` | The lock file, which pins each package to one release |
| `test/contractSchemas.test.mjs` | The test of the contract: the eight schema files of `docs/api/schemas/` and the file `docs/api/openAPI.yaml` |

Run the test of the contract in this folder:

```bash
npm ci
node --test --test-reporter=tap test/contractSchemas.test.mjs
```

## NOTICE

This work is licensed under the [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/legalcode).

- SPDX-License-Identifier: CC-BY-4.0
- SPDX-FileCopyrightText: 2026 Ichnos Protocol Pte. Ltd.
- SPDX-FileCopyrightText: 2026 Contributors to the Eclipse Foundation
- Source URL: https://github.com/Ichnos-Protocol/battery-passport-after-first-life/blob/main/server/README.md
