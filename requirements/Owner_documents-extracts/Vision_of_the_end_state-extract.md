# Extract: Vision of the end state

Extract of the vision of the end state of the battery passport application ("EU battery DPP data layer: desired end state", version 4 of 2026-09-28), a document of the owner of this repository. The extract holds only the passages that the requirements of this repository quote.

## 1. Sources of truth for behaviour

> The data layer, inside the certification perimeter, follows the Catena-X standards.

## 5. What model A is

> Repairing a waste battery to place it on the market again is preparation for re-use (Art. 3(29)), which takes a new passport under model B.

## Header

> This is the top document. The repository converges to the end state it describes

> This is the top document.

## Introduction

> A change is not done if it breaks an invariant or leaves two of something.

## Section 0

> It provides data along a distributed battery value chain, from components to the battery pack, and aggregates it into a battery passport dataset that follows the latest version of CX-0160

> Art. 78 of Regulation (EU) 2023/1542 binds that provider, not this application

> aggregates it into a battery passport dataset that follows the latest version of CX-0160

> They show every field of the dataset as an official passport would, with the access tiers of Art. 77(2), outside the certification perimeter.

> It provides data along a distributed battery value chain, from components to the battery pack, and aggregates it into a battery passport dataset

> It lets a company discover the connectors of the dataspace, read their data offers and usage policies, and negotiate contracts, separate from the marketplace

> The complete, verified dataset goes to a Digital Product Passport Service Provider (DPPSP)

[the passage continues in the owner's document]

> which publishes the passport

[the passage continues in the owner's document]

> It does not communicate with the EU database.

## Section 0 (what the application is), first bullet

> complete, verified dataset goes to a Digital Product Passport Service Provider (DPPSP)

[the passage continues in the owner's document]

## Section 0 (what the application is), third bullet

> A data consumer finds the offer in the provider's catalogue, negotiates the contract and its policy over the Dataspace Protocol, receives a contract agreement and pulls the data through a transfer process

## Section 0.1

> Ichnos Protocol seeks two Catena-X certificates from a Conformity Assessment Body: one for the

## Section 1, anchors

> Repurposing serves a different purpose; re-use serves the same purpose

## Section 1, sources of truth for behaviour

> The passport demo, outside it, follows the regulation.

## Section 2, invariant 2

> A citation that the stored text does not support is a defect, and a rule whose text is not stored waits until it is.

## Section 2, invariant 5

> Ownership is an event timeline (`battery_ownership`), never a column: a change of holder closes one interval and opens the next, and creates no passport.

> Recycling ends the passport (Art. 77(8)): the record stays, marked `waste`, and accepts no further dynamic data.

> give the battery a new passport with a new unique identifier, linked to the passport or passports of the original battery or batteries

> give the battery a new passport with a new unique identifier

## Section 2, invariant 5 (identity and history follow the regulation)

> Preparation for re-use, preparation for repurposing, repurposing and remanufacturing give the battery a new passport with a new unique identifier, linked to the passport or passports of the original battery or batteries

## Section 2, invariant 5, first bullet

> ends the passport (Art. 77(8)): the record stays

> Preparation for re-use, preparation for repurposing, repurposing and remanufacturing give the battery a new passport with a new unique identifier, linked to the passport or passports of the original battery or batteries

## Section 2, invariant 5, last bullet

> The dataspace keeps the same split. A repair records a change of composition on the same twin (the SingleLevelBomAsMaintained proposal

## Section 2, invariant 5, the repair

> A repair of a battery that is not waste keeps its passport and its identifier

## Section 3.1 (the data layer, inside the certification perimeter), canonical registry row

> Bill of materials as maintained | screen S20 | the repairer

## Section 3.4 (the value-chain role catalogue), position 9

> `repairer` | `E`, in-life repairer | CircularCo | none

## Section 3.4, row importer

> `manufacturer`: it places the pack on the Union market under its own trademark (Art. 3(33))

## Section 4 (the convergence criterion), point 3

> When the newest version differs from this vision, the vision wins.

## Section 5 (the passport model), after the action table

> Only the actions of model B carry data over from the predecessor: the model, the acting operator as the manufacturer of record, a fresh serial number and fresh performance data, and the description of the treatment.

## Section 5 (the passport model), table row remanufacture

> new, linked to every source passport; at least 90 % of the original rated capacity, cell states of health within 3 %

## Section 5 (the passport model), table row repair

> the role follow-up FS14 names

## Section 5 (the passport model), What model B is

> a new record with a new identifier is created and linked to the record or records of the original battery or batteries

## Section 5, action table, row recycle

> the existing one, kept and closed to dynamic data; recovered materials compared with Annex XII

## Section 5, action table, row remanufacture

> new, linked to every source passport

## Section 5, after the action table

> Only the actions of model B carry data over from the predecessor: the model, the acting operator as the manufacturer of record, a fresh serial number and fresh performance data, and the description of the treatment.

## Section 5, what model B is

> The predecessor stays and is marked superseded (`superseded_by_id`).

> The existing record is marked `waste` when the battery becomes waste (Art. 77(7), second subparagraph), and then accepts no further dynamic data

> holds one or more ancestors for re-use, repurposing and remanufacturing alike

> The predecessor stays and is marked superseded

## Section 6

> ADR 0003, epic E15 | model B (§5)

## NOTICE

This work is licensed under the [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/legalcode).

- SPDX-License-Identifier: CC-BY-4.0
- SPDX-FileCopyrightText: 2026 Ichnos Protocol Pte. Ltd.
- SPDX-FileCopyrightText: 2026 Contributors to the Eclipse Foundation
- Source URL: https://github.com/Ichnos-Protocol/battery-passport-after-first-life/blob/main/requirements/Owner_documents-extracts/Vision_of_the_end_state-extract.md
