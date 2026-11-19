# Proposals: the items that no standard covers

This document lists every item of this repository that no released Catena-X standard covers. Each item is a proposal of the document [CX-0160-4 Battery Passport after the First Passport](proposal/CX-0160-4_Battery_passport_after_the_first_passport.md), draft 0.8 of 2026-11-19, called "the proposal" below. No Catena-X body has approved the proposal, and the Catena-X Association has not assigned the number CX-0160-4. Each paragraph ends with the section of the proposal that defines the item. Process requirement PrR-CXD-025 (List of the items that no stored standard covers) requires this document.

The battery passport is the electronic record of Article 77 of Regulation (EU) 2023/1542. The abbreviation SAMM means Semantic Aspect Meta Model, API means application programming interface, BPNL means the Business Partner Number of a legal entity, and IDTA means the Industrial Digital Twin Association.

## 1. The three proposed aspect models

### 1.1 BatteryPassportLifecycle

The proposed aspect model `urn:samm:io.catenax.battery.passport_lifecycle:1.0.0#BatteryPassportLifecycle` carries three records of a passport: the predecessor links from a new passport to each original passport, the successor that takes over the responsibility when the battery becomes waste, and the end of the passport after recycling. No released model carries these records: the generic digital product passport model 7.0.0 of Tractus-X holds one optional predecessor identifier, and Article 77(7) of Regulation (EU) 2023/1542 requires a link to every original passport. The second-life operator publishes the model on the digital twin of every new passport, and the data provider of a passport publishes the model when the battery reaches the waste status. Decision Q-202 (the carrier for lifecycle data the aspect models lack) chose the model as the carrier. The proposal defines the model in section 3.2 and its rules in sections 2.1.2, 2.1.5 and 2.1.7.

### 1.2 BatteryPassportSuccessors

The proposed aspect model `urn:samm:io.catenax.battery.passport_successors:1.0.0#BatteryPassportSuccessors` carries the forward links from an original passport to each new passport of the same battery. No stored text requires a forward link, so the forward link is optional, and only the data provider of the original passport adds the link after the notification NewPassportIssued. The data provider offers the model as a data asset of its own, only to the recipients that the responsible operator authorises and to the market surveillance authorities. The proposal defines the model in section 3.3 and its rules in section 2.1.3.

### 1.3 BatteryPassportAccessMap

The proposed aspect model `urn:samm:io.catenax.battery.passport_access_map:1.0.0#BatteryPassportAccessMap` names the access group of every field of the seven IDTA-02035 aspect models of the battery passport. Annex XIII of Regulation (EU) 2023/1542 sorts the passport information into four access groups, and no field of the seven aspect models names its group. The access map holds a version, a date of validity and one entry per field, and each entry names the aspect model, the level of the digital twin, the field path, the access group and the point of Annex XIII. The data provider offers the access map on the PartType digital twin of the battery model, and the seven IDTA-02035 aspect models stay unchanged. Decision Q-200 (how the dataset delivers each field's access group) chose the access map. The proposal defines the model in section 3.4, its rules in section 2.2 items 8 to 12 and its conformity assessment criterion CX-0160-4-CAC-016 in Annex A.

### 1.4 The files of the three models, the validation command and the imported shared models

The folder `models/` of this repository holds the three proposed aspect models in the folder layout of the Tractus-X semantic model repository: `models/io.catenax.battery.passport_lifecycle/1.0.0/BatteryPassportLifecycle.ttl`, `models/io.catenax.battery.passport_successors/1.0.0/BatteryPassportSuccessors.ttl` and `models/io.catenax.battery.passport_access_map/1.0.0/BatteryPassportAccessMap.ttl`. Each model has the version 1.0.0 and the status draft. The folder `docs/api/aspects/` holds the generated JSON schema and one example payload of each model. The command `bash scripts/validate-models.sh --generate`, run at the repository root in a shell with Java 21, validates the three models with the SAMM command line tool 2.11.1 and writes the three generated schemas. Process requirement PrR-CXD-026 (Three proposed models in the sldt-semantic-models layout) requires the three model folders, and process requirement PrR-CXD-027 (Proposed models validated with SAMM CLI 2.11.1) requires the validation.

The lifecycle model and the successors model import version 2.1.0 of the shared model `io.catenax.shared.uuid` and version 2.0.0 of the shared model `io.catenax.shared.business_partner_number`, the two versions that `sources/Tractus-X/semantic-models/` stores. Sections 3.2.2 and 3.3 of draft 0.7 of the proposal name version 2.0.0 of the shared model `io.catenax.shared.uuid`. The owner of this repository accepted on 2026-11-16 that the next draft of the proposal names version 2.1.0. The proposal defines the three models in sections 3.2, 3.3 and 3.4.

## 2. The four lifecycle notifications

The four notifications form one proposed notification API under CX-0151 (Industry Core: Basics). Each notification is one HTTP POST operation with the MessageHeader of CX-0151 and a content part. The proposal defines the operations in section 4.3, the senders and the receivers in Table 4.3 and the content in Table 4.4.

### 2.1 NewPassportIssued

The second-life operator sends the notification NewPassportIssued to the data provider of each original passport when the second-life operator issues a new passport after preparation for re-use, preparation for repurposing, repurposing or remanufacturing. The notification names the new passport, the new digital twin, the operation, the operation date and the one original passport of the receiver. The receiver may then add a forward link to its own passport. The proposal defines the notification in section 4.3 and the use of the notification in sections 2.1.2 and 2.1.3.

### 2.2 BatteryRepaired

The repairer sends the notification BatteryRepaired to the data provider of the passport after a repair of a battery that is not waste. The notification names the passport, the repair date and the digital twin of the CX-0131 repair certificate. The data provider then sets the battery status "re-used" on the same passport, and the repair certificate is the record of the repair. The proposal defines the notification in section 4.3 and the rule of the repair in section 2.1.4.

### 2.3 BatteryBecameWaste

The waste receiver sends the notification BatteryBecameWaste to the data provider of the passport and to the successor when the battery becomes waste. The notification names the passport, the BPNL and the role of the successor, and the date. The data provider then sets the battery status "waste" on the existing passport and records the successor in the lifecycle submodel. The proposal defines the notification in section 4.3 and the rule of the waste status in section 2.1.5.

### 2.4 PassportEnded

The recycler sends the notification PassportEnded after the recycling of the battery to the data provider of the passport, to the manufacturer that the digital nameplate names and to the successor from whom the recycler received the battery. The recycler may also send the notification to the data provider of each predecessor passport. The notification names the passport, the recycling date, the BPNL of the recycler and, as an option, the digital twin of the CX-0131 material recycling certificate. The data provider then records the end of the passport in the lifecycle submodel. The proposal defines the notification in section 4.3 and the rule of the end of the passport in section 2.1.7.

## 3. The notification asset and its policy

Each receiver of a lifecycle notification registers exactly one connector asset for the lifecycle notification API. The asset carries the proposed taxonomy name `cx-taxo:BatteryPassLifecycleNotificationAPI` and the version `1.0`. The asset is offered under the usage purpose `cx.circular.dpp:1` of CX-0160 and, once CX-0152 (Policy Constraints for Data Exchange) registers the purpose, under the proposed usage purpose `cx.circular.dpp.lifecycle:1`. A sender negotiates a contract for the asset before the sender sends a notification. A sender that finds no asset, or whose contract the receiver refuses, records the receiver and the date of the attempt and does not send. The Catena-X taxonomy does not hold the name, and CX-0152 does not hold the purpose. The proposal defines the asset in section 4.3 items 1 to 3 and the usage purposes in Table 2.2.

Two further usage purposes of Table 2.2 are proposed for the sharing of individual battery information: `cx.circular.dpp.resale:1` for a resale and `cx.circular.dpp.issuer:1` for the sharing with the original issuer under a contract. The proposal defines both purposes in section 2.2.

The proposal also changes one sentence of the base document of CX-0160 1.1.0, section 4.2, so that the lifecycle notification API can stand beside the Digital Twin Event notification API. The proposal states the change in its section 4.2.

## 4. The open points of Annex B

Annex B of the proposal names 20 points where the proposal differs from a legal text or where the texts leave a question open. Each point keeps its number of Annex B.

### 4.1 Access to the individual battery information (Annex B.1)

**Point 1.** Draft Article 2(4) of the implementing act under Article 77(9) names no exception for the original issuer of the passport, so the sharing with the original issuer rests on Article 78(c) of Regulation (EU) 2023/1542, on the authorisation of draft Article 2(4)(e) and on the Data Act. Pointer: Annex B.1 point 1 and section 2.3.

**Point 2.** Draft Article 2(1) limits the purposes of use, and the purchase of degradation data for the reliability models of the original issuer fits those purposes only in part. Pointer: Annex B.1 point 2 and Table 2.2.

**Point 8.** The purchaser of a battery is often a private person, and Catena-X participants are companies, so the purchaser reaches the dataspace through an application that acts on the purchaser's behalf. Pointer: Annex B.1 point 8.

**Point 9.** Annex XIII point 4 does not list a link to a new passport, so the restricted access to the forward link is a reading of the proposal. Pointer: Annex B.1 point 9 and section 2.1.3.

**Point 11.** The IDTA digital nameplate mixes public and restricted elements. The access map answers how the data provider delivers the access group of each field. The question whether the IDTA changes the aspect models that mix access groups stays open. Pointer: Annex B.1 point 11 and section 3.4.

**Point 14.** The second-life operator authorises the sharing of the individual battery information of a new passport, and the original manufacturer authorises the sharing of the model information that the new passport keeps. Pointer: Annex B.1 point 14.

**Point 19.** A payload that omits a mandatory restricted field is not valid against the schema of its IDTA aspect model, so a recipient reads an aspect model whole or not at all unless a rule on partial payloads is agreed. Pointer: Annex B.1 point 19.

### 4.2 Identity of the battery and of its passports (Annex B.2)

**Point 6.** No stored text states how a new passport is registered in the registry of digital product passports of the European Union. Pointer: Annex B.2 point 6.

**Point 7.** The proposal keeps the battery identifier for one battery and renews the battery identifier for a battery made from several batteries, and no stored text states the renewal. Pointer: Annex B.2 point 7 and section 2.1.1 item 3.

**Point 12.** The second-life operator chooses one of the original battery models for a battery remanufactured from batteries of different models, and no stored text states the choice. Pointer: Annex B.2 point 12.

**Point 15.** No battery status value marks a superseded original passport, so the original passport keeps its last value. Pointer: Annex B.2 point 15 and section 2.1.3 item 4.

### 4.3 Links and records of the later life cycles (Annex B.3)

**Point 3.** No text requires the forward link. Pointer: Annex B.3 point 3.

**Point 10.** No Catena-X text records the removal of a module from a built battery, because the bill of materials as maintained is not standardised. Pointer: Annex B.3 point 10 and section 2.1.6.

**Point 16.** No model of the use case document CX-0160-3 carries the repair history of DIN DKE SPEC 99100, so the CX-0131 repair certificate is the record of a repair. Pointer: Annex B.3 point 16 and section 2.1.4.

**Point 18.** The new passport carries the updated performance and durability values of the treated battery, while the battery model of the original battery stays the reference of the design. Pointer: Annex B.3 point 18 and section 2.1.1 item 6.

### 4.4 Waste status, recycling and the end of the passport (Annex B.4)

**Point 4.** No text obliges the recycler to notify a producer, so the notification PassportEnded rests on the producer's financing of the treatment and on the contract for the notification asset. Pointer: Annex B.4 point 4.

**Point 5.** Article 77(8) says that the passport "shall cease to exist" after recycling, while the proposal records the end and keeps the ended passport readable. Pointer: Annex B.4 point 5 and section 2.1.7.

**Point 13.** A battery placed on the market in several Member States has a producer per Member State, so the waste receiver names the successor of the Member State where the battery became waste. Pointer: Annex B.4 point 13.

**Point 17.** The data provider records the end of the passport without an authorisation of the successor, because the end follows from the recycling. Pointer: Annex B.4 point 17 and section 2.1.7 item 3.
### 4.5 The lifecycle notification API across the connector (Annex B.5)

**Point 20.** The provider data plane of Tractus-X EDC 0.13.0 answers every refusal of the receiving backend with 500 and without the descriptive error body that section 4.3 item 7 requires, so the sender learns neither the refusal code nor the reason; the point asks the Digital Product Passport Expert Group how the error body reaches the sender. Pointer: Annex B.5 point 20 and section 4.3 item 7.

## 5. The points for discussion of Annex D

**D-1, the purchaser and the lifecycle status.** Only the data provider of a passport writes into the passport, while the purchaser decides events that change the battery status, such as discarding the battery as waste. The proposal asks whether the purchaser, or an application that acts for the purchaser, should report status events through the lifecycle notification API, and whether the passport access should follow Article 14(2) of Regulation (EU) 2023/1542. Pointer: Annex D, point D-1.

**D-2, the performance information for safe second-life operations.** The second-life operator updates the performance and durability values, and no stored text names the performance values that the first-life manufacturer provides for safe second-life operations. The proposal asks whether the data provider of the first passport should offer the parameters of Annex VII and the safety information of the technical documentation to the second-life operator under a contract. Pointer: Annex D, point D-2.

**D-3, the record of a module swap in a repair.** A repair that replaces a module changes the module serial numbers of the battery, and no Catena-X text records a change after the battery is built. The proposal asks whether the repair record should carry the removed and the inserted module serial numbers, and which participant signs the record. Pointer: Annex D, point D-3.

**D-4, the receivers of PassportEnded.** The recycler must notify the data provider of the passport, the manufacturer that the digital nameplate names and the successor, and may notify the data provider of each predecessor passport. The proposal asks whether the list of receivers is complete, whether the nameplate manufacturer reaches the producer when an importer placed the battery on the market, and whether the notice to the predecessor passports should become a recommendation. Pointer: Annex D, point D-4.

## NOTICE

This work is licensed under the [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/legalcode).

- SPDX-License-Identifier: CC-BY-4.0
- SPDX-FileCopyrightText: 2026 Ichnos Protocol Pte. Ltd.
- SPDX-FileCopyrightText: 2026 Contributors to the Eclipse Foundation
- Source URL: https://github.com/Ichnos-Protocol/battery-passport-after-first-life/blob/main/docs/proposals.md
