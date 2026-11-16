# Requirements registry

This folder holds the requirements registry of this repository. The registry is the only source of truth of this
repository. Each Automotive SPICE process has one folder, from SYS.1 Requirements Elicitation to SWE.5 Software Component
Verification and Integration Verification. The document `method.md` states the method that every record follows.

The records were carried over on 2026-11-16 from the private registry of the battery passport application (decision
Q-1014, where the reference implementation of the after-first-passport work is built). The reference server of this
repository is not built yet, so every software requirement has the implementation state `missing`.

## Counts

The registry holds 59 stakeholder requirements, 83 system requirements, 18 process requirements, 59 software
requirements, 153 verification measures, 36 decisions, 42 sources and 16 stakeholders. A stakeholder requirement that
quotes several parties is held in the file of each party, so the files of the parties hold 68 copies of the 59
stakeholder requirements.

| File | Content | Records |
|---|---|---|
| `SWE.1-Software_Requirements_Analysis/software_requirements.json` | Software requirements | 59 |
| `SWE.4-Software_Unit_Verification/unit_verification_measures.json` | Unit verification measures | 4 |
| `SWE.5-Software_Component_Verification_and_Integration_Verification/component_and_integration_verification_measures.json` | Component and integration verification measures | 57 |
| `SYS.1-Requirements_Elicitation/Catena-X-Association_standards_and_governance/stakeholder_requirements.json` | Stakeholder requirements, party `Catena-X-Association_standards_and_governance` | 8 |
| `SYS.1-Requirements_Elicitation/DIN_DKE-DIN_SPEC_99100_battery_passport_data_attributes/stakeholder_requirements.json` | Stakeholder requirements, party `DIN_DKE-DIN_SPEC_99100_battery_passport_data_attributes` | 13 |
| `SYS.1-Requirements_Elicitation/EU-European_Union_legislation/stakeholder_requirements.json` | Stakeholder requirements, party `EU-European_Union_legislation` | 46 |
| `SYS.1-Requirements_Elicitation/VDA_ENX-Automotive_SPICE_TISAX_and_ISA/stakeholder_requirements.json` | Stakeholder requirements, party `VDA_ENX-Automotive_SPICE_TISAX_and_ISA` | 1 |
| `SYS.1-Requirements_Elicitation/decisions.json` | Decisions of the owner | 36 |
| `SYS.1-Requirements_Elicitation/sources.json` | Sources | 42 |
| `SYS.1-Requirements_Elicitation/stakeholders.json` | Stakeholders | 16 |
| `SYS.2-System_Requirements_Analysis/process_requirements.json` | Process requirements | 18 |
| `SYS.2-System_Requirements_Analysis/system_requirements.json` | System requirements | 83 |
| `SYS.3-System_Architectural_Design/architecture.json` | Architecture elements and interfaces | 34 (17 elements, 17 interfaces) |
| `SYS.5-System_Verification/process_verification_measures.json` | Process verification measures | 18 |
| `SYS.5-System_Verification/system_verification_measures.json` | System verification measures | 74 |

## Owner's instructions and owner's documents

| Folder | Content | Files |
|---|---|---|
| `Owner_instructions-Francesco_verbatim/` | Extracts of the owner's instructions, word for word, with only the passages on the work of this repository | 6 |
| `Owner_documents-extracts/` | Extracts of the owner's documents, with only the passages that the requirements quote | 7 |

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
- The carry-over removed 54 entries of the lists `verifies` of the measures, and 430 entries of the lists `blocks` and
  `relatedRequirements` of the decisions, because each entry named a record that was not carried.
- A text of a carried record can name the identifier of a record that was not carried: a deviation (`DEV-nn`), a
  follow-up (`FSn`), a roadmap step (`Rn-n`), a plan decision (`Dnn`), an element such as `EL-SIMULATION`, or a
  requirement of the private registry.
- The statements of 18 software requirements named a code file of the battery passport application. The carry-over
  replaced each file name by a description of the module of the reference server: SwR-ACCESS-123, SwR-ACCESS-127, SwR-ACCESS-129, SwR-CXCLIENT-166, SwR-CXCLIENT-167, SwR-CXCLIENT-168, SwR-CXCLIENT-169, SwR-CXCLIENT-170, SwR-CXCLIENT-171, SwR-CXCLIENT-172, SwR-CXCLIENT-176, SwR-CXCLIENT-178, SwR-CXCLIENT-182, SwR-CXCLIENT-183, SwR-DATASET-195, SwR-TWINS-153, SwR-TWINS-155, SwR-TWINS-156.
- The statements of the following requirements describe the hosted service or the database schema of the battery passport
  application, and wait for a review against the reference server: StR-SEC-101, StR-DATA-026, StR-PRIV-034, SyR-DATA-021,
  SyR-PRIV-025, SyR-SEC-019, SwR-DATARIGHTS-016, SwR-RDB-051 and SwR-DATASET-208.

## NOTICE

This work is licensed under the [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/legalcode).

- SPDX-License-Identifier: CC-BY-4.0
- SPDX-FileCopyrightText: 2026 Ichnos Protocol Pte. Ltd.
- SPDX-FileCopyrightText: 2026 Contributors to the Eclipse Foundation
- Source URL: https://github.com/Ichnos-Protocol/battery-passport-after-first-life/blob/main/requirements/README.md
