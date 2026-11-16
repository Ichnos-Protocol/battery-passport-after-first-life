# Lessons from a first implementation

A first implementation of the battery passport lifecycle was compared with the system requirements of this repository. The comparison showed 14 classes of defects. This document states each class as a lesson for an implementer of the proposal [CX-0160-4 Battery Passport after the First Passport](proposal/CX-0160-4_Battery_passport_after_the_first_passport.md), called "the proposal" below. Each lesson states what goes wrong and which rule of the proposal or which requirement of the registry in `requirements/` prevents the defect.

The battery passport is the electronic record of Article 77 of Regulation (EU) 2023/1542. The abbreviation BPNL means the Business Partner Number of a legal entity, and API means application programming interface.

## 1. Identity of the passport and of its manufacturer

### Lesson 1: a later lifecycle step overwrites the manufacturer of the passport

- **What goes wrong.** The step that records the waste status or the recycling writes the company of the acting operator into the field that names the manufacturer of the passport. The passport then names the recycler as manufacturer, and the producer of the passport can no longer be found.
- **What prevents the defect.** The manufacturer identification of a passport never changes after the passport is issued: SyR-LIFE-155 (Manufacturer identification of a passport never changed after issue). The successor and the recycler have fields of their own in the lifecycle submodel: `WasteResponsibility.successorBpnl` and `EndOfPassport.recyclerBpnl` (section 3.2.2 of the proposal, sections 2.1.5 item 4 and 2.1.7 item 3). The registry names the successor in SyR-LIFE-049 (Responsibility moves to a named successor when the battery becomes waste) and SyR-LIFE-129 (Producer of the current passport takes over a waste battery's passport).

### Lesson 2: a second-life step changes the digital twin of the original battery

- **What goes wrong.** The step that issues a new passport changes the digital twin of the original battery and registers no digital twin for the new passport. The original passport then shows data of the second-life operator, and the new passport has no digital twin of its own.
- **What prevents the defect.** The second-life operator registers a new PartInstance digital twin for the new passport and changes no digital twin and no submodel of an original battery (section 2.1.1 items 4 and 7 of the proposal, criterion CX-0160-4-CAC-002). The registry states the rule in SyR-CXD-221 (New digital twin for a battery that receives a new passport).

### Lesson 3: the new passport receives a different battery model

- **What goes wrong.** The step that issues a new passport lets the second-life operator attach a battery model of its own. The new passport then loses the design reference of the original battery.
- **What prevents the defect.** The new passport keeps the battery model of the original battery, holds its own battery category and carries updated performance and durability values (section 2.1.1 item 6 and decision D7 of Annex C of the proposal). The registry states the rule in SyR-LIFE-028 (New passport dataset takes over the original battery model).

## 2. Links between passports

### Lesson 4: the second-life operator writes the forward link into the original passport

- **What goes wrong.** The step that issues a new passport marks the original passport as superseded and writes the link to the new passport into the original passport. A participant that is not the data provider of the original passport then changes that passport.
- **What prevents the defect.** Only the data provider of a passport writes into the passport, and only the data provider of the original passport may add a forward link (section 2.1.3 items 1 and 2 of the proposal, decisions D3 and D15 of Annex C). The second-life operator records the links in the lifecycle submodel of its own new passport (section 2.1.2). The same lifecycle submodel accepts one or more original passports after a preparation for re-use, a preparation for repurposing or a repurposing (section 2.1.2 item 4). The registry states the rules in SyR-LIFE-130 (Only the original issuer writes into an original passport), SyR-LIFE-143 (Only the data provider of a passport writes into that passport) and SyR-LIFE-021 (Re-use and repurposing datasets link one or more original passports).

### Lesson 5: a notification of a new passport reports a status of the original passport

- **What goes wrong.** The notification that announces a new passport carries the status "waste" for the original battery. The receiver then sets a status that the battery never had.
- **What prevents the defect.** The content of NewPassportIssued names the new passport, the new digital twin, the operation, the operation date and the original passport of the receiver, and holds no status (Table 4.4 of the proposal). The original passport keeps its last battery status after a new passport is issued (section 2.1.3 item 4). The registry states the rules in SyR-LIFE-138 (Original issuer notified of a new passport under contract), SyR-LIFE-024 (Original passport kept, superseded relation held in the lineage records) and SyR-LIFE-150 (Last battery status kept on a superseded original passport).

## 3. Lifecycle steps that the rules admit

### Lesson 6: the lifecycle rules refuse every action on a waste battery

- **What goes wrong.** The implementation treats the status "waste" as a final state and refuses a preparation for re-use and a preparation for repurposing of a waste battery. Regulation (EU) 2023/1542 defines both preparations as operations on a waste battery (Art. 3(1)(29) and (30)).
- **What prevents the defect.** A second-life operator may prepare a waste battery that is not yet recycled for re-use or for repurposing (section 2.1.5 item 6 of the proposal). Recycling, not the waste status, ends the passport (section 2.1.7). The registry states the rule in SyR-LIFE-013 (Preparation for re-use or repurposing admitted only for waste).

### Lesson 7: a remanufacturing donor cannot later become waste

- **What goes wrong.** The implementation closes the passport of a donor battery at the remanufacturing. The waste receiver of the remaining parts can then set no waste status on the donor passport.
- **What prevents the defect.** The data provider of a donor battery keeps the donor passport readable and sets the status "waste" on the donor passport after BatteryBecameWaste for the remaining parts (section 2.1.6 items 1 and 2 of the proposal, criterion CX-0160-4-CAC-008). The registry states the rule in SyR-LIFE-132 (Remanufacturing donor's passport later accepts the status waste).

### Lesson 8: one of the four operations sends no notification

- **What goes wrong.** The implementation has one code path per operation, and one code path, for example the preparation for re-use, sends no notification of the new passport. The data provider of the original passport then never learns of the new passport.
- **What prevents the defect.** The second-life operator sends NewPassportIssued after each of the four operations: preparation for re-use, preparation for repurposing, repurposing and remanufacturing (section 4.3 and Table 4.3 of the proposal). One module performs the sending for every operation, as the engineering rule "one executor per capability" of this repository requires. The registry states the rule in SyR-LIFE-138 (Original issuer notified of a new passport under contract).

## 4. Notifications

### Lesson 9: a notification goes to every known partner

- **What goes wrong.** The sender sends each lifecycle notification to every company that the sender knows. Companies without any relation to the battery then receive information on the battery, and the sender cannot show a contract for each sending.
- **What prevents the defect.** Table 4.3 of the proposal names the receivers of each operation and the element that holds the BPNL of each receiver. The sender negotiates a contract for the notification asset of the receiver before the sender sends, and sends one notification per receiver and per passport (section 4.3 items 3 and 5). The registry states the rules in SyR-LIFE-138 (Original issuer notified of a new passport under contract), SyR-LIFE-141 (Passport's data provider, nameplate manufacturer and successor notified of the recycling), SyR-LIFE-142 (Predecessor issuers may be notified of the recycling under contract), SyR-LIFE-152 (Receiver without a notification asset recorded by the sender) and SyR-LIFE-153 (One lifecycle notification per receiver and per passport).

### Lesson 10: the notification uses a format of the implementation

- **What goes wrong.** The notification carries a payload in a format that only the implementation knows. A receiver built from the Catena-X standards cannot read the notification.
- **What prevents the defect.** Each notification holds the MessageHeader of CX-0151 (Industry Core: Basics) with the context of Table 4.3 and the content part of Table 4.4 (section 4.3 item 4 of the proposal). The notification API is offered and called with HTTP POST only: SyR-CXD-092 (Notification APIs offered and called with HTTP POST only).

### Lesson 11: the notification of the recycling leaves out mandatory content

- **What goes wrong.** The notification of the recycling names the battery and leaves out content that the receivers need to record the end of the passport. The data provider then cannot fill the record of the end.
- **What prevents the defect.** The content of PassportEnded holds the passport identifier, the recycling date and the BPNL of the recycler as mandatory properties (Table 4.4 of the proposal). The data provider records the two values in `EndOfPassport` (section 2.1.7 item 3). The registry states the rules in SyR-LIFE-141 (Passport's data provider, nameplate manufacturer and successor notified of the recycling) and SyR-LIFE-149 (Date of the recycling and the recycler held in the ended passport).

### Lesson 12: the receiver changes its passport on the word of any sender

- **What goes wrong.** The receiving side accepts a notification from any sender and overwrites the battery status and the recovered materials of its passport with the values of the notification. A company without any relation to the battery can then change a passport.
- **What prevents the defect.** A sender reaches the endpoint only after a contract for the notification asset (section 4.3 item 3 of the proposal). The receiver changes its passport because of a notification only by the steps that the proposal assigns to the receiver (section 4.3 item 6). The registry states the rules in SyR-LIFE-154 (Notification changes a passport only by the receiver's assigned steps), SyR-LIFE-109 (Recovered materials recorded only by the battery's recycler) and SyR-PASS-230 (Passport data held only for the responsible or an authorised operator).

### Lesson 13: the confirmation of a status change reads the wrong result

- **What goes wrong.** The database function that applies a received status change runs another statement between the change and the reading of the number of changed rows. The function then reports a result that does not belong to the status change. The same function changes the triggers of a table while a request runs.
- **What prevents the defect.** An implementation reads the result of a change directly after the change and changes no database structure while a request runs. The engineering rules of this repository state: "A failed check refuses. No error is silently discarded." The receiver answers a notification that the receiver cannot process with a 4xx or 5xx status and a body that states the failure (section 4.3 item 7 of the proposal, SyR-CXD-096 (Notification endpoints answer 200, or 4xx or 5xx on failure)).

## 5. Recycling data

### Lesson 14: the recovered materials are compared with the wrong thresholds

- **What goes wrong.** The implementation compares the materials that a recycler recovered from a battery with the minimum shares of recycled content of Article 8 of Regulation (EU) 2023/1542. The recycled content is an input of the manufacture, and the recovered materials are an output of the recycling, so the comparison tests the recovered materials against the wrong rule. The targets for the recovery of materials are in Annex XII of Regulation (EU) 2023/1542.
- **What prevents the defect.** An implementation keeps three concepts apart: the recycled content of Article 8, the recovered materials of one battery, and the targets for recycling efficiency and recovery of materials of Annex XII. The proposal puts the calculation of recycling efficiency and of the recovery of materials out of scope and leaves the calculation to the recycler under Delegated Regulation (EU) 2025/606 (section 1.1 of the proposal). The registry states what a recycler records in SyR-LIFE-109 (Recovered materials recorded only by the battery's recycler) and SyR-LIFE-115 (Recycling efficiency recorded as output mass over input mass).

## NOTICE

This work is licensed under the [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/legalcode).

- SPDX-License-Identifier: CC-BY-4.0
- SPDX-FileCopyrightText: 2026 Ichnos Protocol Pte. Ltd.
- SPDX-FileCopyrightText: 2026 Contributors to the Eclipse Foundation
- Source URL: https://github.com/Ichnos-Protocol/battery-passport-after-first-life/blob/main/docs/lessons-from-a-first-implementation.md
