# Source texts

This folder holds the third-party source texts that their licenses allow to redistribute. The requirements registry
and the proposal quote these texts. Each text keeps its own license and its own copyright notice. The licenses of this
repository (`LICENSE`, `LICENSE_non-code`) do not apply to the content of this folder.

The register `SOURCES.json` lists each of the 92 stored files with its path, its SHA-256 value, its size, its origin
and its license. The script `scripts/check-sources.mjs` compares every stored file with the register.

## Stored texts

| Folder | Source family | Files | License | Origin |
|---|---|---|---|---|
| `EU/` | European Union legislation | 20 | Reuse authorised under Commission Decision 2011/833/EU, provided the source is acknowledged | EUR-Lex and the Publications Office of the European Union |
| `Tractus-X/semantic-models/` | Eclipse Tractus-X semantic models | 31 | CC-BY-4.0 | `eclipse-tractusx/sldt-semantic-models`, commit `e3d6c3e76813a7ffc2f4fd84ed353a463f3982ff` |
| `Tractus-X/kits-26.09/` | Eclipse Tractus-X KITs, release 26.09 | 9 | CC-BY-4.0 for documentation, Apache-2.0 for the OpenAPI file | `eclipse-tractusx/eclipse-tractusx.github.io`, commit `dc71de65307cefeacdadc6722e8ffc44016dd38a` |
| `IDTA/` | Aspect models of the Industrial Digital Twin Association (IDTA) | 31 | CC-BY-4.0 | `admin-shell-io/smt-semantic-models`, commit `9c047bddc51b9f4f1a0d1b5381c81979f15a7f5c` |
| `BatteryPass-Ready/` | Battery Passport Data Attribute Longlist, version 2.0, of the BatteryPass-Ready consortium | 1 | CC-BY-4.0 | BatteryPass-Ready consortium |

### European Union legislation in `EU/`

| Text | Stored form |
|---|---|
| Regulation (EU) 2023/1542 concerning batteries and waste batteries, as published in OJ L 191, 28.7.2023 | Markdown conversion of the Official Journal PDF, with the page images of the conversion |
| Regulation (EU) 2023/1542, consolidated text of 13 August 2026 | XHTML of the Publications Office |
| Regulation (EU) 2024/1781 establishing a framework for the setting of ecodesign requirements for sustainable products | Markdown conversion of the Official Journal PDF |
| Commission Implementing Regulation (EU) 2026/1778 on the registry of digital product passports | XHTML of the Publications Office |
| Directive 2008/98/EC on waste, consolidated text of 16 October 2025 | XHTML of the Publications Office |
| Commission Delegated Regulation (EU) 2025/606 on the rates for recycling efficiency and recovery of materials from waste batteries | Markdown conversion of the Official Journal PDF |
| Commission Delegated Decision (EU) 2025/934 updating the list of waste in relation to battery-related waste | Markdown conversion of the Official Journal PDF |
| Regulation (EU) 2024/1157 on shipments of waste | Markdown conversion of the Official Journal PDF |
| Regulation (EU) 2023/2854 on harmonised rules on fair access to and use of data (Data Act) | PDF of the Official Journal |
| Regulation (EU) 2016/679 (General Data Protection Regulation) | Markdown conversion of the Official Journal PDF |

Notice for the European Union texts: © European Union, https://eur-lex.europa.eu, 1998-2026. Only the Official Journal
of the European Union is authentic. A Markdown conversion can differ from the Official Journal in its layout, its
tables and its footnotes.

## Texts cited and not stored

The registry and the proposal also quote the texts below. This repository does not store them, because no license that
allows redistribution is recorded for them. Each quote has at most 40 words and names its version and its section.

| Text | Reason | Where to read the text |
|---|---|---|
| Catena-X standards CX-0160 (Battery Passport), CX-0151 (Industry Core: Basics), CX-0127 (Industry Core: Part Instance), CX-0126 (Industry Core: Part Type), CX-0131 (Circular Economy), CX-0005 (Item Relationship Service) | No redistribution license is recorded for the standard documents | The standard library of the Catena-X Association, https://catenax-ev.github.io |
| DIN DKE SPEC 99100 (Requirements for data attributes of the battery passport) | Published under CC BY-NC 4.0, and a download from the publisher is personal | The publisher DIN Media |
| Draft Commission Implementing Regulation under Article 77(9) of Regulation (EU) 2023/1542 (access to the battery passport), Ares(2026)9814179 | A draft act, with no recorded license | The "Have your say" portal of the European Commission |
| Draft Commission Delegated Regulation on recycled content, Ares(2026)7823470 | A draft act, with no recorded license | The "Have your say" portal of the European Commission |
| Guidance of the European Commission on the data points of the digital battery passport, version 2.0 | No recorded license | The European Commission |
| Publications of the Global Battery Alliance, of EUROBAT and of the Battery Pass consortium (overview of the secondary legislation) | No license stated, or a non-commercial license | The publishers |
| EN 18219, EN 18221, EN 18222 (digital product passport) | Paid standards | CEN and CENELEC members |

## NOTICE

This work is licensed under the [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/legalcode).

- SPDX-License-Identifier: CC-BY-4.0
- SPDX-FileCopyrightText: 2026 Ichnos Protocol Pte. Ltd.
- SPDX-FileCopyrightText: 2026 Contributors to the Eclipse Foundation
- Source URL: https://github.com/Ichnos-Protocol/battery-passport-after-first-life/blob/main/sources/README.md
