# Documentation index

The table states what each path holds on 2026-11-16.

| Path | Content | State |
|---|---|---|
| `proposal/CX-0160-4_Battery_passport_after_the_first_passport.md` | The text of the proposal CX-0160-4 (Battery Passport after the First Passport) | Draft 0.7 of 2026-11-16 |
| `api/openAPI.yaml` | The OpenAPI specification of the lifecycle notification API: OpenAPI 3.1.0, the four POST operations NewPassportIssued, BatteryRepaired, BatteryBecameWaste and PassportEnded, each with ten responses | Written in phase P1 of the implementation specification |
| `api/schemas/` | The eight JSON schemas of the notification messages in the 2020-12 dialect: the message header, the envelope, the content of each of the four operations, the body of the response 200 and the error body | Written in phase P1 of the implementation specification |
| `architecture/implementation_plan.md` | The implementation specification of the standalone reference server: the scope, the requirements that the server implements and the requirements that the server does not implement, the files, the modules, the interfaces, the database, the phases, the decisions and the tests | Version 7 of 2026-11-16; approved by the owner on 2026-11-16; phase P1 (the contract) is delivered; phases P2 and P3 are in execution |
| `architecture/` | The architecture documentation in the arc42 structure | Not yet written |
| `admin/` | The administration guide | Not yet written |
| `adoption-view.md`, `development-view.md`, `operations-view.md` | The three views of a Tractus-X KIT | Not yet written |
| `methodology.md` | The derivation of the interfaces from the regulation and the standards: the method, the literature, the use cases UC-1 to UC-5b and the Tractus-X conventions applied | Written |
| `citation-catalogue.md` | The 287 quotes of the regulation, the standards and the models that the proposal and the methodology cite, each with its locator | Written |
| `proposals.md` | The items that no standard covers: the three proposed aspect models, the four lifecycle notifications, the notification asset and its policy, the open points of Annex B and the points for discussion of Annex D of the proposal | Written |
| `lessons-from-a-first-implementation.md` | The 14 classes of defects of a first implementation of the battery passport lifecycle, each as a lesson for an implementer of the proposal | Written |

## NOTICE

This work is licensed under the [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/legalcode).

- SPDX-License-Identifier: CC-BY-4.0
- SPDX-FileCopyrightText: 2026 Ichnos Protocol Pte. Ltd.
- SPDX-FileCopyrightText: 2026 Contributors to the Eclipse Foundation
- Source URL: https://github.com/Ichnos-Protocol/battery-passport-after-first-life/blob/main/docs/README.md
