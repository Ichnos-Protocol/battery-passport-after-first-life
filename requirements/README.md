# Requirements registry

This folder holds the requirements registry of this repository. The registry is the only source of truth of this
repository. Each Automotive SPICE process has one folder, from SYS.1 Requirements Elicitation to SWE.6 Software
Verification. The document `method.md` states the method that every record follows.

The records were carried over on 2026-11-16 from the private registry of the battery passport application (decision
Q-1014, where the reference implementation of the after-first-passport work is built). The reference server of this
repository is not built yet, so every software requirement has the implementation state `missing`.

## Counts

The registry holds 56 stakeholder requirements, 80 system requirements, 18 process requirements, 103 software
requirements, 179 verification measures, 51 decisions, 38 sources and 16 stakeholders. A stakeholder requirement that
quotes several parties is held in the file of each party, so the files of the parties hold 65 copies of the 56
stakeholder requirements.

| File | Content | Records |
|---|---|---|
| `SWE.1-Software_Requirements_Analysis/software_requirements.json` | Software requirements | 103 |
| `SWE.4-Software_Unit_Verification/unit_verification_measures.json` | Unit verification measures | 11 |
| `SWE.5-Software_Component_Verification_and_Integration_Verification/component_and_integration_verification_measures.json` | Component and integration verification measures | 75 |
| `SWE.6-Software_Verification/software_verification_measures.json` | Software verification measures | 3 |
| `SYS.1-Requirements_Elicitation/Catena-X-Association_standards_and_governance/stakeholder_requirements.json` | Stakeholder requirements, party `Catena-X-Association_standards_and_governance` | 8 |
| `SYS.1-Requirements_Elicitation/DIN_DKE-DIN_SPEC_99100_battery_passport_data_attributes/stakeholder_requirements.json` | Stakeholder requirements, party `DIN_DKE-DIN_SPEC_99100_battery_passport_data_attributes` | 13 |
| `SYS.1-Requirements_Elicitation/EU-European_Union_legislation/stakeholder_requirements.json` | Stakeholder requirements, party `EU-European_Union_legislation` | 44 |
| `SYS.1-Requirements_Elicitation/decisions.json` | Decisions of the owner | 51 |
| `SYS.1-Requirements_Elicitation/sources.json` | Sources | 38 |
| `SYS.1-Requirements_Elicitation/stakeholders.json` | Stakeholders | 16 |
| `SYS.2-System_Requirements_Analysis/process_requirements.json` | Process requirements | 18 |
| `SYS.2-System_Requirements_Analysis/system_requirements.json` | System requirements | 80 |
| `SYS.3-System_Architectural_Design/architecture.json` | Architecture elements and interfaces | 22 (10 elements, 12 interfaces) |
| `SYS.5-System_Verification/process_verification_measures.json` | Process verification measures | 18 |
| `SYS.5-System_Verification/system_verification_measures.json` | System verification measures | 72 |

## Owner's instructions and owner's documents

| Folder | Content | Files |
|---|---|---|
| `Owner_instructions-Francesco_verbatim/` | Extracts of the owner's instructions, word for word, with only the passages on the work of this repository | 7 |
| `Owner_documents-extracts/` | Extracts of the owner's documents, with only the passages that the records quote | 6 |

## The check

Run the requirement check at the repository root:

```bash
node scripts/requirements-check.mjs
```

The check reports 0 problems before every commit that touches this folder. The check searches each quote of a stored
source in the stored text. The check counts each quote of a source that is cited and not stored as "not checked (cited,
not stored)".

## What the carry-over left open

- The allocation of the carried requirements to the architecture elements is proposed and waits for the owner's
  approval. Each element and each interface has the status `proposed`.
- Every system requirement that is allocated to an element of the reference server is refined by a software requirement
  of that element. The carry-over holds 46 software requirements of the private registry for that purpose, with their
  32 verification measures and the 19 decisions that they depend on.
- The carry-over removed 228 entries of the lists `verifies` of the measures, 423 entries of the lists `tracesTo` of
  the software requirements, and 1001 entries of the lists `blocks` and `relatedRequirements` of the decisions, because
  each entry named a record that was not carried.
- A text of a carried record can name the identifier of a record that was not carried: a deviation (`DEV-nn`), a
  follow-up (`FSn`), a roadmap step (`Rn-n`), a plan decision (`Dnn`), an element such as `EL-SIMULATION`, or a
  requirement of the private registry.
- The statements of 18 software requirements named a code file of the battery passport application. The carry-over
  replaced each file name by a description of the module of the reference server: SwR-ACCESS-123, SwR-ACCESS-127, SwR-ACCESS-129, SwR-CXCLIENT-166, SwR-CXCLIENT-167, SwR-CXCLIENT-168, SwR-CXCLIENT-169, SwR-CXCLIENT-170, SwR-CXCLIENT-171, SwR-CXCLIENT-172, SwR-CXCLIENT-176, SwR-CXCLIENT-178, SwR-CXCLIENT-182, SwR-CXCLIENT-183, SwR-DATASET-195, SwR-TWINS-153, SwR-TWINS-155, SwR-TWINS-156.
- The statement of SwR-DATASET-208 names a table and a column of the database of the battery passport application, and
  waits for a review against the schema of the reference server.

## NOTICE

This work is licensed under the [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/legalcode).

- SPDX-License-Identifier: CC-BY-4.0
- SPDX-FileCopyrightText: 2026 Ichnos Protocol Pte. Ltd.
- SPDX-FileCopyrightText: 2026 Contributors to the Eclipse Foundation
- Source URL: https://github.com/Ichnos-Protocol/battery-passport-after-first-life/blob/main/requirements/README.md
