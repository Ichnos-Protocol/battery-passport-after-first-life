# Documentation index

The table states what each path holds on 2026-11-16.

| Path | Content | State |
|---|---|---|
| `proposal/CX-0160-4_Battery_passport_after_the_first_passport.md` | The text of the proposal CX-0160-4 (Battery Passport after the First Passport) | Draft 0.7 of 2026-11-16 |
| `api/openAPI.yaml` | The OpenAPI specification of the lifecycle notification API: OpenAPI 3.1.0, the four POST operations NewPassportIssued, BatteryRepaired, BatteryBecameWaste and PassportEnded, each with ten responses | Written in phase P1 of the implementation specification |
| `api/aspects/` | The JSON schema that the SAMM command line tool 2.11.1 generates from each of the three proposed aspect models (`<Aspect>-schema.json`, draft-04 dialect) and one example payload per model (`<Aspect>.json`) | Written in phase P2 of the implementation specification |
| `api/schemas/` | The eight JSON schemas of the notification messages in the 2020-12 dialect: the message header, the envelope, the content of each of the four operations, the body of the response 200 and the error body | Written in phase P1 of the implementation specification |
| `architecture/implementation_plan.md` | The implementation specification of the standalone reference server: the scope, the requirements that the server implements and the requirements that the server does not implement, the files, the modules, the interfaces, the database, the phases, the decisions and the tests | Version 12 of 2026-11-19; the owner approved version 7 on 2026-11-16; version 8 corrects defects of the text that the execution of phases P1 to P3 found, which wait for the owner's confirmation; version 9 adds the tests of the configuration reader, the logger and the identifier conversions by the owner's order of 2026-11-17; version 10 closes the review of the code of phases P4 and P5 and records the owner's three decisions of 2026-11-19; version 11 records the differences that the execution of phases P4 to P6 found; version 12 records the verification of Tractus-X EDC 0.13.0 in phase P7, the owner's three decisions on the connector binding of 2026-11-19 and four corrections that published texts decide; phases P1 (the contract), P2 (the models) and P3 (the database) are delivered; phases P4 to P8 wait for the approval of the owner |
| `architecture/` | The architecture documentation in the arc42 structure | Not yet written |
| `admin/` | The administration guide | Not yet written |
| `adoption-view.md`, `development-view.md`, `operations-view.md` | The three views of a Tractus-X KIT | Not yet written |
| `methodology.md` | The derivation of the interfaces from the regulation and the standards: the method, the literature, the use cases UC-1 to UC-5b and the Tractus-X conventions applied | Written |
| `citation-catalogue.md` | The 287 quotes of the regulation, the standards and the models that the proposal and the methodology cite, each with its locator | Written |
| `proposals.md` | The items that no standard covers: the three proposed aspect models with their files and their validation command, the four lifecycle notifications, the notification asset and its policy, the open points of Annex B and the points for discussion of Annex D of the proposal | Written |
| `lessons-from-a-first-implementation.md` | The 14 classes of defects of a first implementation of the battery passport lifecycle, each as a lesson for an implementer of the proposal | Written |

## NOTICE

This work is licensed under the [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/legalcode).

- SPDX-License-Identifier: CC-BY-4.0
- SPDX-FileCopyrightText: 2026 Ichnos Protocol Pte. Ltd.
- SPDX-FileCopyrightText: 2026 Contributors to the Eclipse Foundation
- Source URL: https://github.com/Ichnos-Protocol/battery-passport-after-first-life/blob/main/docs/README.md
