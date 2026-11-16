# Requirements engineering method

This document is the method that every entry of the requirements registry of this repository follows. The method
follows Automotive SPICE 4.0 and ISO/IEC/IEEE 29148. Both standards are cited by name only, and this repository stores
neither text.

## 1. What this folder holds

The folder `requirements/` is the requirements registry of this repository. The registry holds the requirements at
every level from the stakeholders to the software, the system architecture that the requirements are allocated to, the
verification measures that prove the requirements, and the two-way trace between all of them.

The registry is data. Each Automotive SPICE process has one folder, named with the process code and the process name.
Each folder holds one JSON file per kind of entry (section 4).

The records of the registry were carried over on 2026-11-16 from the private registry of the battery passport
application (decision Q-1014, where the reference implementation of the after-first-passport work is built). Section 12
states what the carry-over changed.

## 2. The system of interest

The system of interest is the reference implementation of the proposal "CX-0160-4 Battery Passport after the First
Passport".

- **The application:** the reference server of this repository. The reference server implements the interfaces that
  the proposal defines for the battery's life after its first passport. The carried requirements name it "the
  application".
- **The stack:** the connector, the Digital Twin Registry and the wallet of each company. The reference server uses a
  stack and does not contain one.
- **Outside the system:** the digital product passport service provider that publishes the passport, the EU registry,
  the partners' connectors and the identity provider.

A carried requirement can describe a screen, a table or a deployment of the battery passport application. The index
`README.md` lists what the carry-over left unchanged.

## 3. The standards this method follows

| Standard | Used for | Status of the text |
|---|---|---|
| Automotive SPICE 4.0 | the processes and base practices of sections 4 to 10 | cited by name, not stored |
| ISO/IEC/IEEE 29148 | the characteristics of a requirement and the attributes of sections 5 and 6 | cited by name, not stored |

A carried record can name a base practice in the numbering of the edition that the private registry used ("Automotive
SPICE 4.1"). The carry-over did not change those texts.

## 4. The derivation chain

| Level | Folder (process) | What the folder holds | Files | Identifier |
|---|---|---|---|---|
| 0 | `SYS.1-Requirements_Elicitation` | the sources: every regulation, standard and owner's document that can oblige the system, with its applicability decision, its storage and, for an external source, the party that issues it | `sources.json` | `SRC-<name>` |
| 0 | `SYS.1-Requirements_Elicitation` | the stakeholders and what each stakeholder expects | `stakeholders.json` | `STK-<nn>` |
| 1 | `SYS.1-Requirements_Elicitation` | the stakeholder requirements: what the external parties impose, each quoted from the party's text | `<party>/stakeholder_requirements.json`, one subfolder per external party | `StR-<area>-<nnn>` |
| 1 | `SYS.1-Requirements_Elicitation` | the decisions that the owner owes or has taken | `decisions.json` | `Q-<nnn>` |
| 2 | `SYS.2-System_Requirements_Analysis` | the system requirements: how the system meets the stakeholder requirements, and the owner's system decisions | `system_requirements.json` | `SyR-<area>-<nnn>` |
| 2 | `SYS.2-System_Requirements_Analysis` | the process requirements: requirements on how the system is built and run | `process_requirements.json` | `PrR-<area>-<nnn>` |
| 3 | `SYS.3-System_Architectural_Design` | the system elements and their interfaces | `architecture.json` | `EL-<name>`, `IF-<name>` |
| 4 | `SWE.1-Software_Requirements_Analysis` | the software requirements of each software element | `software_requirements.json` | `SwR-<element>-<nnn>` |
| 5 | `SYS.5-System_Verification` | the verification measures of the system requirements and of the process requirements | `system_verification_measures.json`, `process_verification_measures.json` | `VM-SYS-<area>-<nnn>`, `VM-PRC-<area>-<nnn>` |
| 5 | `SWE.4-Software_Unit_Verification` | the unit verification measures of the software requirements | `unit_verification_measures.json` | `VM-SWE-<element>-<nnn>`, level SWE.4 |
| 5 | `SWE.5-Software_Component_Verification_and_Integration_Verification` | the component and integration verification measures | `component_and_integration_verification_measures.json` | `VM-SWE-<element>-<nnn>`, level SWE.5 |
| 5 | `SWE.6-Software_Verification` | the verification measures on the integrated software | `software_verification_measures.json` | `VM-SWE-<element>-<nnn>`, level SWE.6 |

The stakeholder requirements sit in one subfolder of `SYS.1-Requirements_Elicitation` per external party. The field
`party` of `sources.json` names each party. A requirement that quotes several parties is held, identical, in the folder
of each party, and the requirement check finds every copy.

A folder exists only when it holds a record.

Two folders sit beside the process folders. `Owner_instructions-Francesco_verbatim/` holds extracts of the owner's
instructions, word for word, so that a decision or a requirement can quote them. `Owner_documents-extracts/` holds the
passages of the owner's documents that the requirements quote.

## 5. The attributes of every requirement

| Attribute | Content |
|---|---|
| `id` | the identifier of section 4; never reused, never renumbered |
| `title` | a name of at most twelve words |
| `statement` | one requirement in one sentence, with one "shall" (or "should" or "may", as its source states it) |
| `kind` | `functional`, `interface`, `data`, `quality`, `constraint` or `process` |
| `qualityCharacteristic` | for a quality requirement: the quality characteristic that the requirement belongs to |
| `stakeholders` | the stakeholders who need the requirement |
| `perimeter` | `application`, `stack`, `operator`, `demo-passport` or `demo-marketplace` |
| `sources` | for a stakeholder requirement: each external source with its locator and a verbatim quote (section 7); for an owner's rule at level 2: the owner's document or instruction that the rule rests on, quoted the same way |
| `tracesTo` | for every level below 1: the requirements of the level above that the requirement refines |
| `traceNote` | for a system or process requirement that traces to no stakeholder requirement: why no external party imposes it |
| `catenaXRelease` | for a stakeholder requirement that cites a Catena-X text: its release check of section 7 |
| `catenaXCompliance` | for a stakeholder requirement that quotes an EU act or DIN DKE SPEC 99100 and no Catena-X text: whether a Catena-X text meets it (section 7) |
| `allocatedTo` | for a system requirement: the architecture elements that implement it |
| `element`, `interfaces` | for a software requirement: the element that the requirement belongs to, and the interfaces that it uses |
| `rationale` | why the requirement exists, and why it is stated this way |
| `acceptance` | for a stakeholder requirement: how the stakeholder confirms that the requirement is met |
| `verification` | for every other level: the verification measures that prove the requirement |
| `implementation` | for a software requirement: the state of the code (`missing` until the reference server is built), the files that implement the requirement and a note |
| `priority` | `must`, `should` or `could`; a "shall" of a binding source is always `must` |
| `releasePlan` | `this-release`, `after-neptune-go-live` or `not-planned`, derived from what the requirement rests on (section 7) |
| `appliesFrom` | the date or the condition from which the source obliges the requirement |
| `dependsOn` | the decisions and the requirements that the requirement depends on |
| `status` | `proposed`, `agreed`, `implemented`, `verified` or `deferred` |
| `deferral` | for a deferred requirement: the decision that defers it, its owner and the condition under which it would be built |
| `owner` | the person who answers for the requirement |
| `history` | each change: date, change, reason and approver (section 10) |

A verification measure has `id`, `title`, `method`, `technique`, `passCriteria`, `entry`, `environment`, `how`,
`verifies`, `regression`, `releasePlan`, `existingEvidence` and `history`.

A requirement that is removed, merged into another requirement or moved to another level leaves the list `requirements`
of its file for the list `retired` of the same file, with its identifier, title, statement, date and reason. A retired
identifier is never used again.

## 6. The characteristics every requirement must have

The check of section 8 tests the characteristics that a script can test. A review tests the other characteristics.

1. **Necessary:** the requirement traces to a source or to a requirement of the level above. Checked by script.
2. **Singular:** the requirement states one thing, so that one verification measure can pass or fail it. The script
   checks that the statement holds a "shall", a "should" or a "may". The review checks that the statement holds one
   thing.
3. **Unambiguous:** the statement has one reading, and every term is used as the glossary of its source defines the
   term. Reviewed.
4. **Verifiable:** the statement carries its criterion (a value, a limit, a state, a list), and the requirement has a
   verification measure. Checked by script for the measure, and reviewed for the criterion.
5. **Free from design** at levels 1 and 2: the requirement states what, not how. A design choice belongs to level 3 or
   level 4. A rule on how the system is built is a process requirement, which no system requirement refines. Reviewed.
6. **Consistent:** the requirement contradicts no other requirement. Reviewed, with the help of the trace.
7. **Feasible:** the system's elements can meet the requirement, or the gap is named. Reviewed.
8. **Correct to its source:** the quote appears in the stored text, and the statement does not claim more than the
   quote. Checked by script for the quote of a stored source, and reviewed for the claim.

## 7. Sources and citations

A requirement exists only when a stored source or the owner's quoted instruction states it. A citation that its text
does not support is a defect of the registry.

- A stakeholder requirement (SYS.1) quotes the external party's rule. The external parties are the legislator, the
  Catena-X Association and the bodies that issue the standards. Each external source names its party.
- The owner's documents and the owner's instructions are the owner's rules (role `project-rule`). A requirement that
  rests on an owner's rule is a system requirement or a process requirement (SYS.2). The requirement quotes the rule
  and says in `traceNote` why no external party imposes it.
- Each source names its storage. The storage `stored` means that this repository holds the text, and the field `path`
  names the file under `sources/` or under `requirements/`. The storage `cited-not-stored` means that the license of
  the text does not allow this repository to hold it. Such a source has no path. Its field `locator` names the
  version and the place where a reader finds the text, and its field `note` says when the quotes were verified.
- Each citation names its source, its locator (article, annex point, section, requirement number) and a verbatim quote
  of at most 40 words. A citation of a stored source also names the path of the stored text.
- The requirement check searches each quote of a stored source in the stored text, after normalisation (case, white
  space, quotation marks, dashes, broken hyphenation). A quote that the check does not find is a defect of the registry.
- The requirement check counts each quote of a source that is cited and not stored as "not checked (cited, not
  stored)". The check never counts such a quote as passed.
- An owner's document is stored as an extract in `Owner_documents-extracts/`. The extract holds only the passages that
  the requirements quote. An owner's instruction is stored as an extract in `Owner_instructions-Francesco_verbatim/`.
- CX-Titan, the current release of the Catena-X standards, binds this release, and every rule that CX-Neptune adds,
  changes or removes is flagged (decision Q-984). Each Catena-X source names its release (`release`). Each stakeholder
  requirement that cites a Catena-X text carries a release check (`catenaXRelease`): `titan-same`, `titan-changed`,
  `neptune-new` or `neptune-removed`, with the difference for each flag. A CX-Neptune quote is a binding source only of
  a requirement that CX-Neptune alone states. Every other CX-Neptune quote is held in the release check.
- Every requirement and every measure carries a release plan (`releasePlan`). A stakeholder requirement flagged
  `neptune-new` is planned `after-neptune-go-live`. A requirement whose every traced requirement is planned after the
  go-live is planned after the go-live, and so is a measure whose every verified requirement is. Every other entry is
  planned for `this-release`. A deferred stakeholder requirement is `not-planned`.
- Every stakeholder requirement that quotes an EU act or DIN DKE SPEC 99100, and no Catena-X text, and binds the
  application or the stack carries `catenaXCompliance`. The flag states for CX-Titan (`titan`) and for CX-Neptune
  (`neptune`) one of `met`, `partial`, `gap` and `not-applicable`. The list `basis` names the Catena-X texts read (text
  and locator, and the path when this repository stores the text). The field `note` states what the texts hold and
  lack.
- A regulation is cited in its consolidated text in force. Regulation (EU) 2023/1542 is cited as of 13 August 2026.
- Each source has an applicability decision (`applies`, `applies-in-part`, `does-not-apply`, `undecided`), with the
  quote of its scope clause. An `undecided` source names the question that decides it.

## 8. Traceability and consistency

The registry keeps consistency and two-way traceability between each level and the level above, and between the
verification measures and the requirements:

- every stakeholder requirement is refined by a system requirement or a process requirement, or is marked as validated
  only, or is deferred by a decision of the owner with its `deferral`;
- every system requirement traces to at least one stakeholder requirement, or is an owner's rule with its `traceNote`
  and the rule that it quotes, and is allocated to at least one element;
- every stakeholder requirement sits in the folder of each party that it quotes, and every verification measure sits in
  the folder of its level;
- no requirement and no measure refers to a retired identifier;
- every software requirement traces to at least one system requirement and belongs to one element;
- every requirement below level 1 has at least one verification measure, and every verification measure verifies at
  least one requirement;
- the trace between a requirement and its measures runs both ways;
- a software requirement traces to the system requirement that it refines, and not also to a stakeholder requirement.

The requirement check tests these rules, the identifiers, the attributes, the storage of the sources and the quotes.
Run the check at the repository root:

```bash
node scripts/requirements-check.mjs
node scripts/requirements-check.mjs --matrix
```

The first command prints the count of each level, each problem and the count of the quotes that were not checked. The
command ends with status 1 while a problem remains. The second command prints the traceability matrix. The matrix is
generated and never stored. The check reports 0 problems before every commit that touches `requirements/`.

## 9. Verification measures and reviews

Each verification measure states its technique, its pass criteria, its entry conditions, the environment that it needs
and the requirements that it verifies. The measures are inspections, analyses, demonstrations or tests.

A review is a verification run. The run selects the measures for the commit under review, runs the measures on a clean
copy, records each result with the commit, and summarises the results. A requirement that passed must not fail later.

The reference server is not built yet. Each software requirement has the implementation state `missing`, and no
measure has evidence.

## 10. Change, status and the owner's approval

- A change to a requirement is recorded in the `history` of the requirement, with its date, the change, the reason and
  the approver.
- The owner of this repository approves each change. The field `approver` holds a name only when the owner's quoted
  words state the approval. An empty `approver` means that the approval is open.
- A decision of the owner is recorded in `SYS.1-Requirements_Elicitation/decisions.json` with the owner's words. Every
  requirement that the decision changes names the decision in `dependsOn` and in a history entry.
- The last history entry of every carried record is the entry of the carry-over of 2026-11-16, with an empty approver.
- An identifier is never reused and never renumbered. The carried records keep the identifiers of the private registry.

## 11. Cybersecurity requirements

The cybersecurity requirements come from a threat analysis. A stakeholder requirement of the area `SEC` holds a threat
scenario and its goal. A system requirement or a process requirement that names a threat scenario is one of its goals
or traces to one.

## 12. What the carry-over changed

The carry-over of 2026-11-16 kept the identifier, the title, the statement and the trace fields of each record, and
changed the following.

- The fields `milestone` and `milestones` were removed, with the history entries that only recorded them.
- The field `implementation` of each software requirement was set to the state `missing`, and the field
  `existingEvidence` of each measure that named evidence was set to "None: the reference server of this repository is
  not built yet."
- Each path to a file of the private repository was replaced: by the path under `sources/` for a stored text, by the
  name and the section of the text for a text that is cited and not stored, and by a neutral description for a code
  file.
- A trace to a record that was not carried was removed from the lists `verifies`, `blocks` and `relatedRequirements`.
  A text can still name the identifier of a record that was not carried, for example a deviation (`DEV-nn`), a
  follow-up (`FSn`) or an element that this registry does not hold.
- The architecture holds only the elements and the interfaces that the carried requirements name. Each element and
  each interface has the status `proposed`: the allocation of the carried requirements waits for the owner's approval.
- The records on the hosted multi-customer service of the battery passport application are not carried.
- The milestone rules of the check were removed, because this registry holds no milestone.

## NOTICE

This work is licensed under the [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/legalcode).

- SPDX-License-Identifier: CC-BY-4.0
- SPDX-FileCopyrightText: 2026 Ichnos Protocol Pte. Ltd.
- SPDX-FileCopyrightText: 2026 Contributors to the Eclipse Foundation
- Source URL: https://github.com/Ichnos-Protocol/battery-passport-after-first-life/blob/main/requirements/method.md
