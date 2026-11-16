# Proposed aspect models

This folder holds the three aspect models that the proposal CX-0160-4 (Battery Passport after the First Passport) proposes, in the folder layout of the Tractus-X semantic model repository. The abbreviation SAMM means Semantic Aspect Meta Model. Each model has the version 1.0.0 and the status draft, and no Catena-X body has released a model of this folder.

| Model | Identifier | Folder | Section of the proposal |
|---|---|---|---|
| BatteryPassportLifecycle | `urn:samm:io.catenax.battery.passport_lifecycle:1.0.0#BatteryPassportLifecycle` | `io.catenax.battery.passport_lifecycle/` | 3.2 |
| BatteryPassportSuccessors | `urn:samm:io.catenax.battery.passport_successors:1.0.0#BatteryPassportSuccessors` | `io.catenax.battery.passport_successors/` | 3.3 |
| BatteryPassportAccessMap | `urn:samm:io.catenax.battery.passport_access_map:1.0.0#BatteryPassportAccessMap` | `io.catenax.battery.passport_access_map/` | 3.4 |

## The folder layout

Each namespace folder holds the file `RELEASE_NOTES.md` and the version folder `1.0.0`. The version folder holds the model file `<Aspect>.ttl` and the file `metadata.json` with the status draft. No folder of `models/` holds a folder `gen`. The generated JSON schema `<Aspect>-schema.json` and the example payload `<Aspect>.json` of each model are files of `docs/api/aspects/`.

## The imported shared models

The lifecycle model and the successors model import the two shared models `urn:samm:io.catenax.shared.uuid:2.1.0#` and `urn:samm:io.catenax.shared.business_partner_number:2.0.0#`. The folder `sources/Tractus-X/semantic-models/` stores both shared models in these versions. Sections 3.2.2 and 3.3 of draft 0.7 of the proposal name version 2.0.0 of the shared model `io.catenax.shared.uuid`, and the next draft of the proposal names version 2.1.0.

## The validation command

The script `scripts/validate-models.sh` validates the three models with the SAMM command line tool 2.11.1 (`tools/samm-cli-2.11.1.jar`, which `INSTALL.md` downloads). Run the script at the repository root, in a shell with Java 21:

```bash
bash scripts/validate-models.sh --generate
```

The script copies the two shared namespaces of `sources/Tractus-X/semantic-models/` and the three namespaces of this folder into the temporary models root `tools/models-root`, because the tool resolves an imported model from the folder layout `<root>/<namespace>/<version>/<File>.ttl` around the input file. The script prints one line that starts with `VALID` per model. With the argument `--generate` the script writes the JSON schema of each model to `docs/api/aspects/` and prints one line that starts with `GENERATED` per model.

## NOTICE

This work is licensed under the [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/legalcode).

- SPDX-License-Identifier: CC-BY-4.0
- SPDX-FileCopyrightText: 2026 Ichnos Protocol Pte. Ltd.
- SPDX-FileCopyrightText: 2026 Contributors to the Eclipse Foundation
- Source URL: https://github.com/Ichnos-Protocol/battery-passport-after-first-life/blob/main/models/README.md
