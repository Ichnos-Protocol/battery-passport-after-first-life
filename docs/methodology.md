# Methodology: how the interfaces were derived

This document states how the interfaces of this repository were derived from Regulation (EU) 2023/1542 (the EU Battery Regulation) and from the Catena-X standards. The interfaces are the lifecycle notification application programming interface (API), the three proposed aspect models and the rules of the proposal [CX-0160-4 Battery Passport after the First Passport](proposal/CX-0160-4_Battery_passport_after_the_first_passport.md). The battery passport is the electronic record of Article 77 of Regulation (EU) 2023/1542. Process requirement PrR-CXD-024 (Methodology document tracing the API to the regulation) requires this document.

Three terms recur in this document:

- "The owner" is the owner of this repository, who is the author of the proposal.
- "A stored text" is a text that the author holds and has read. The file `sources/README.md` states which of those texts this repository redistributes in `sources/`.
- "The registry" is the requirements registry of `requirements/`.

## 1. The method

### 1.1 The registry and its levels

The registry is the only source of truth of this repository. The registry follows the process levels of Automotive SPICE 4.0 (Automotive Software Process Improvement and Capability Determination). The document `requirements/method.md` states the method of every record.

| Level of Automotive SPICE 4.0 | Records of the registry | Count on 2026-11-16 |
|---|---|---|
| SYS.1 Requirements Elicitation | the sources, the stakeholders, the stakeholder requirements (each quoted from a stored text) and the decisions of the owner | 38 sources, 16 stakeholders, 56 stakeholder requirements, 51 decisions |
| SYS.2 System Requirements Analysis | the system requirements and the process requirements | 80 system requirements, 18 process requirements |
| SYS.3 System Architectural Design | the architecture elements and the interfaces between the elements | 10 elements, 12 interfaces |
| SWE.1 Software Requirements Analysis | the software requirements of each element | 102 software requirements |
| SYS.5 System Verification, SWE.4 Software Unit Verification, SWE.5 Software Component Verification and Integration Verification, SWE.6 Software Verification | the verification measures | 178 verification measures |

A requirement exists only when a stored text or a quoted instruction of the owner states the requirement. Each stakeholder requirement quotes its source in at most 40 words. Each system requirement traces to the stakeholder requirements that the system requirement refines. The script `scripts/requirements-check.mjs` checks the trace and searches each quote of a text stored in `sources/` in the stored file.

### 1.2 The steps of the derivation

| Step | Result | Document of this repository |
|---|---|---|
| 1. Literature inventory | every text on the battery's life after its first passport, with its version and its date | section 2 of this document |
| 2. Citation catalogue | 287 verbatim quotes of the provisions, sorted into seven topics, and the list of the points that no stored text defines | [citation-catalogue.md](citation-catalogue.md) |
| 3. Use cases | seven use cases, each with its stored texts, its decisions and its system requirements | section 3 of this document |
| 4. Comparison with a first implementation | 14 classes of defects that a first implementation of the battery passport lifecycle showed | [lessons-from-a-first-implementation.md](lessons-from-a-first-implementation.md) |
| 5. Proposal | the rules, the models, the notifications and the conformity assessment criteria | [the proposal CX-0160-4](proposal/CX-0160-4_Battery_passport_after_the_first_passport.md), and the list of the items that no standard covers in [proposals.md](proposals.md) |
| 6. Conventions | the conventions of the Eclipse Tractus-X reference implementations | section 5 of this document |
| 7. Reference implementation | the OpenAPI specification, the aspect models, the reference server and the conformance test kit | `docs/api/`, `models/`, `server/` and `tck/`, not yet written on 2026-11-16 |

### 1.3 The rule for a point that no stored text defines

The citation catalogue lists ten points that the Catena-X standards leave open (section 3 of the catalogue). For each point the owner takes a decision, and the registry holds the decision with the owner's quoted words. The proposal then states the rule as a proposed rule, and Annex B of the proposal names each difference with the regulation and each point that stays open.

## 2. The literature

The tables state each text with its version, its date and its place. The entry "cited, not stored" means that this repository quotes the text and does not redistribute the text, because no license that allows redistribution is recorded for the text.

### 2.1 Texts of the European Union (EU)

| Text | Version and date | Place in this repository |
|---|---|---|
| Regulation (EU) 2023/1542 concerning batteries and waste batteries | as published in the Official Journal of the European Union (OJ) L 191 of 28 July 2023, and the consolidated text of 13 August 2026 | `sources/EU/Regulation EU 2023-1542/Regulation EU 2023-1542.md` and `sources/EU/Regulation EU 2023-1542 consolidated 2026-08-13.xhtml` |
| Directive 2008/98/EC on waste | consolidated text 02008L0098-20251016 of 16 October 2025 | `sources/EU/Directive EC 2008-98 Waste Framework consolidated 2025-10-16.xhtml` |
| Regulation (EU) 2024/1781 on ecodesign requirements for sustainable products (ESPR) | OJ L of 28 June 2024 | `sources/EU/Regulation EU 2024-1781 ESPR/Regulation EU 2024-1781 ESPR.md` |
| Commission Implementing Regulation (EU) 2026/1778 on the registry of digital product passports | OJ L of 17 July 2026 | `sources/EU/Implementing Regulation EU 2026-1778 digital product passport registry.xhtml` |
| Commission Delegated Regulation (EU) 2025/606 on the rates for recycling efficiency and recovery of materials | 21 March 2025 | `sources/EU/DelegatedReg_EU_2025-606_RecyclingEfficiency_RecoveryRates/DelegatedReg_EU_2025-606_RecyclingEfficiency_RecoveryRates.md` |
| Commission Delegated Decision (EU) 2025/934 on the list of waste for batteries | 5 March 2025 | `sources/EU/DelegatedDecision_EU_2025-934_ListOfWaste_Batteries/DelegatedDecision_EU_2025-934_ListOfWaste_Batteries.md`; proposed as not applicable, because the reference implementation classifies no waste |
| Regulation (EU) 2024/1157 on shipments of waste | 11 April 2024 | `sources/EU/Regulation_EU_2024-1157_WasteShipments/Regulation_EU_2024-1157_WasteShipments.md`; proposed as not applicable, because the reference implementation ships no waste |
| Regulation (EU) 2023/2854 on harmonised rules on fair access to and use of data (Data Act) | OJ L of 22 December 2023 | `sources/EU/Regulation EU 2023-2854 Data Act.pdf` |
| Draft Commission Implementing Regulation on access to and use of certain information in the battery passport, under Article 77(9) of Regulation (EU) 2023/1542 | draft, Ares(2026)9814179, 19 October 2026; the feedback period ran from 19 October to 16 November 2026 | cited, not stored |
| Draft Commission Delegated Regulation on the calculation, verification and documentation of recycled content, main text and annexes | draft, Ares(2026)7823470, 12 August 2026 | cited, not stored |
| European Commission guidance "Digital Batteries Passport: data points by category" | version 2.0, 15 August 2026 | cited, not stored |

### 2.2 Standards

| Text | Version and date | Place in this repository |
|---|---|---|
| DIN DKE SPEC 99100, Requirements for data attributes of the battery passport | 2025-02 | cited, not stored |
| CX-0160 Battery Passport of the Catena-X Association: the base document and the use case documents CX-0160-1 and CX-0160-3 | 1.1.0 (CX-Neptune preview); the use case document CX-0160-2 is not published | cited, not stored |
| CX-0127 Industry Core: Part Instance | 2.0.2 (CX-Titan) and 3.0.0 (CX-Neptune preview) | cited, not stored |
| CX-0126 Industry Core: Part Type | the version of the CX-Neptune release | cited, not stored |
| CX-0151 Industry Core: Basics | 1.1.0 (CX-Titan and CX-Neptune preview) | cited, not stored |
| CX-0131 Circularity Core | 1.1.1 (CX-Titan, the same text in CX-Neptune) | cited, not stored |
| CX-0005 Item Relationship Service API | 2.2.0 (CX-Titan) | cited, not stored |
| CX-0002 Digital Twins in Catena-X, CX-0003 SAMM Aspect Meta Model, CX-0018 Dataspace Connectivity, CX-0152 Policy Constraints for Data Exchange, CX-0167 BPN-DID Resolution Service | the versions of the CX-Neptune release | cited, not stored |
| Aspect models of the Industrial Digital Twin Association (IDTA) for the battery passport (IDTA-02035) and the digital product passport (DPP) metadata (IDTA-02099-1) | the IDTA repository at commit `9c047bd` of 4 September 2026 | `sources/IDTA/` holds the digital nameplate 1.0.0, the product condition 1.0.0 and 1.0.1, the technical data 1.0.0 and 1.0.1 and the DPP metadata 1.0.0; the other parts are cited, not stored |
| Guideline of the IDTA, Catena-X and the Battery Pass consortium for the Digital Battery Passport | version 1.0, 19 February 2026 | cited, not stored |
| EN 18219 (unique identifiers), EN 18221 (data storage, archiving and data persistence) and EN 18222 (application programming interfaces) of the European standards for the digital product passport | 2026, published on 27 May 2026 | paid standards that the author has not bought; cited, not stored; every rule that needs one of the three standards carries the note "citation pending" |

The IDTA released version 1.1.3 of its semantic models between 8 October and 15 October 2026, with editorial and syntax corrections. This repository stores the models of the commit of 4 September 2026.

### 2.3 Texts of Eclipse Tractus-X

| Text | Version and date | Place in this repository |
|---|---|---|
| Aspect models of the Tractus-X semantic model repository: remanufacturing certificate 3.0.0, recycling strategy certificate 2.0.0 and 3.0.0, material recycling certificate 1.0.0, waste certificate 1.0.0, waste 2.0.0, secondary material content 1.0.0, traction battery code 2.0.0, generic digital product passport 5.0.0 and 7.0.0, battery pass 6.1.0 | repository `sldt-semantic-models` at commit `e3d6c3e`, 22 October 2026 | `sources/Tractus-X/semantic-models/` |
| Tractus-X KITs of release 26.09: Circularity KIT, Eco Pass KIT, Industry Core KIT, Traceability KIT and Data Chain KIT | repository `eclipse-tractusx.github.io` at commit `dc71de6`, 5 November 2026 | `sources/Tractus-X/kits-26.09/` |

### 2.4 Texts of other publishers

| Text | Version and date | Place in this repository |
|---|---|---|
| Battery Passport Data Attribute Longlist of the BatteryPass-Ready consortium | version 2.0, 2026, license CC BY 4.0 | `sources/BatteryPass-Ready/2026_BatteryPass-Ready_DataAttributeLongList_v2.0.xlsx` |
| White paper of the Global Battery Alliance (GBA) on the GBA Battery Passport and the EU Batteries Regulation | February 2026 | cited, not stored |
| Report of the GBA roundtable "One year until the EU Battery Passport" | event of 10 March 2026 | cited, not stored |
| Feedback of EUROBAT, the association of European battery manufacturers, on the draft implementing act under Article 77(9) | 27 May 2026 | cited, not stored |
| Overview of the Battery Pass consortium of the secondary legislation that follows the Battery Regulation | version 1.1, October 2024 | cited, not stored |

### 2.5 Acts checked and not relevant

- The delegated act of 14 July 2026 on exemptions from the removability of portable batteries is not relevant, because portable batteries carry no passport.
- The draft rules on harmonised labelling under Article 13 set the label and the QR code. The draft labelling rules state nothing on the passport after its first issue.
- No adopted act on the carbon footprint of electric vehicle batteries exists.

## 3. The use cases

The owner named the use cases of the reference implementation on 2026-11-05 and added use case UC-5 on 2026-11-09. The file `requirements/Owner_instructions-Francesco_verbatim/2026-11-05_after_first_passport_downloads_paid_standards_and_q1002.md` holds the instruction. Each use case is a row of section 2.3 of the proposal, where the labels LC-1 to LC-5b replace the labels UC-1 to UC-5b, and a set of system requirements of `requirements/SYS.2-System_Requirements_Analysis/system_requirements.json`.

### 3.1 UC-1: sharing the individual battery data with the issuer of the passport under a contract (LC-1)

- **What happens.** The owner of the battery shares the individual battery information of Annex XIII point 4 (performance and durability values, state of health, battery status, usage data) with the economic operator that issued the passport, when a contract between the owner of the battery and that operator exists. The Catena-X connector negotiates the contract, so the purchase of the data by the issuer runs without manual steps.
- **Stored texts.** Regulation (EU) 2023/1542 Art. 78(c); Regulation (EU) 2023/2854 (Data Act) Art. 4(1) and 5(1); draft Art. 77(9) act Art. 1(4) and 2(4).
- **Decisions.** Q-1002 (who reads the state of health and battery status under the draft Article 77(9) act).
- **System requirements.** SyR-PASS-215 (Individual battery information shared with the passport issuer under contract); SyR-CXD-218 (Issuer's contract negotiation for individual battery information without a manual step); SyR-CXD-219 (Transfer of individual battery information to the issuer without a manual step).

### 3.2 UC-2: sharing the individual battery data for a resale (LC-2)

- **What happens.** The current owner of the battery, whom the draft act calls the purchaser of the battery, resells the battery and shares the Annex XIII point 4 information with prospective purchasers. A used-battery operator that wants to buy the battery reads the information through this share.
- **Stored texts.** Draft Art. 77(9) act Art. 2(4)(c) and recital 4.
- **Decisions.** Q-1002 (who reads the state of health and battery status under the draft Article 77(9) act).
- **System requirements.** SyR-PASS-216 (Reselling purchaser shares individual battery information with a prospective purchaser); SyR-PASS-217 (Reselling purchaser shares individual battery information with the named authorities); SyR-PASS-218 (Used-battery operators read individual battery information only through the purchaser's share).

### 3.3 UC-3a: a waste battery prepared for re-use or for repurposing (LC-3a)

- **What happens.** The battery becomes waste: the status changes to "waste" and the passport responsibility moves to the producer, the producer responsibility organisation or the waste management operator. A treatment operator then prepares the waste battery for re-use or for repurposing, and the battery receives a new passport linked to the original passport.
- **Stored texts.** Regulation (EU) 2023/1542 Art. 77(7) first and second subparagraphs; Art. 71(1); Art. 3(1)(29) and (30); Directive 2008/98/EC Art. 3(16).
- **Decisions.** Q-021 (the reuse action that creates a new passport); Q-022 (whether waste status and recycling are recorded as separate events); Q-023 (whether a new passport may link to several original passports); Q-969 (whether a new passport keeps the battery's unique identifier); Q-1007 (which producer takes over the passport of a second-life battery that becomes waste); Q-1008 (whether the original passport records a link to its successor passport); Q-1009 (whether a new passport after a second-life operation is a new registration in the EU registry).
- **System requirements.** SyR-LIFE-008 (Status waste set on the existing passport, with no new passport); SyR-LIFE-049 (Responsibility moves to a named successor when the battery becomes waste); SyR-LIFE-129 (Producer of the current passport takes over a waste battery's passport); SyR-LIFE-013 (Preparation for re-use or repurposing admitted only for waste); SyR-LIFE-017 (Preparation for re-use admitted only for the original purpose); SyR-LIFE-015 (Repurposing admitted only for a purpose different from the original); SyR-LIFE-018 (New passport dataset for a treated battery placed on the market again); SyR-LIFE-019 (New passport dataset links to each original battery's passport); SyR-LIFE-021 (Re-use and repurposing datasets link one or more original passports); SyR-LIFE-130 (Only the original issuer writes into an original passport); SyR-LIFE-139 (Original issuer may add a forward link to its own passport); SyR-LIFE-026 (New unique identifier attributed by the operator to the new passport); SyR-LIFE-131 (New passport delivered as a passport of its own, not a version); SyR-LIFE-048 (Responsibility moves to the operator placing the battery again); SyR-LIFE-051 (Operator placing the treated battery named as its manufacturer); SyR-CXD-221 (New digital twin for a battery that receives a new passport).

### 3.4 UC-3b: a battery repurposed or remanufactured without becoming waste (LC-3b)

- **What happens.** The battery is repurposed or remanufactured without a waste status. The battery receives a new passport linked to the original passport or passports, and the second-life operator becomes the producer and the manufacturer of the battery.
- **Stored texts.** Regulation (EU) 2023/1542 Art. 77(7) first subparagraph; Art. 3(1)(31) and (32); Art. 38(11); Art. 56(2).
- **Decisions.** Q-023 (whether a new passport may link to several original passports); Q-026 (whether a new passport gets the new manufacturer's battery model); Q-028 (the passport state of a remanufacturing donor battery); Q-969 (whether a new passport keeps the battery's unique identifier); Q-1008 (whether the original passport records a link to its successor passport); Q-1009 (whether a new passport after a second-life operation is a new registration in the EU registry); Q-1010 (who authorises the wider sharing of a second-life battery's passport data).
- **System requirements.** SyR-LIFE-014 (Repurposing admitted only for a battery that is not waste); SyR-LIFE-015 (Repurposing admitted only for a purpose different from the original); SyR-LIFE-016 (Remanufacturing admitted only for the original purpose); SyR-LIFE-018 (New passport dataset for a treated battery placed on the market again); SyR-LIFE-019 (New passport dataset links to each original battery's passport); SyR-LIFE-020 (Remanufactured dataset links every original battery's passport); SyR-LIFE-021 (Re-use and repurposing datasets link one or more original passports); SyR-LIFE-130 (Only the original issuer writes into an original passport); SyR-LIFE-139 (Original issuer may add a forward link to its own passport); SyR-LIFE-026 (New unique identifier attributed by the operator to the new passport); SyR-LIFE-131 (New passport delivered as a passport of its own, not a version); SyR-LIFE-028 (New passport dataset takes over the original battery model); SyR-LIFE-048 (Responsibility moves to the operator placing the battery again); SyR-LIFE-051 (Operator placing the treated battery named as its manufacturer); SyR-LIFE-132 (Remanufacturing donor's passport later accepts the status waste); SyR-PASS-228 (Second-life operator authorises wider sharing of the new passport's battery information); SyR-CXD-221 (New digital twin for a battery that receives a new passport); SyR-CXD-222 (As-built bill of material may reference a child's part type twin); SyR-PASS-234 (Original manufacturer authorises sharing of model information on a new passport).

### 3.5 UC-4: direct re-use without preparation (LC-4)

- **What happens.** The battery is re-used for the same purpose without any preparation, for example after a second-hand sale. The battery keeps its passport, and only the holder changes.
- **Stored texts.** Regulation (EU) 2023/1542 Recital 16; Directive 2008/98/EC Art. 3(13); Art. 77(7), which names only preparation for re-use, preparation for repurposing, repurposing and remanufacturing.
- **Decisions.** Q-021 (the reuse action that creates a new passport).
- **System requirements.** SyR-LIFE-133 (Direct re-use without preparation keeps the passport and its identifier); SyR-LIFE-134 (Direct re-use leaves the responsible economic operator unchanged); SyR-PASS-231 (New holder after direct re-use recorded as the battery's purchaser); SyR-LIFE-140 (Battery status unchanged after a direct re-use); SyR-PASS-235 (Previous holder loses access to individual battery information after a resale).

### 3.6 UC-5a: the issuer follows the later life cycles of its battery (LC-5a)

- **What happens.** The economic operator that issued a passport learns when its battery receives a new passport after preparation for re-use, preparation for repurposing, repurposing or remanufacturing, and when the passport of a later life ends by recycling. The notice of the second-life operator names the new passport, and the issuer may then add a forward link to its own passport. The issuer uses the notices for its accounting, for example for the cost sharing mechanism between producers.
- **Stored texts.** Regulation (EU) 2023/1542 Art. 56(5); Art. 77(7); Art. 78(c) and (f); Data Act Art. 5(1).
- **Decisions.** Q-1006 (how the producers of a battery learn its recycling result after re-use or remanufacturing), answered on 2026-11-09; Q-1008 (whether the original passport records a link to its successor passport), revised on 2026-11-09; Q-1011 (whether the reference implementation builds use case UC-5), answered on 2026-11-09: the reference implementation builds UC-5a and UC-5b.
- **System requirements.** SyR-LIFE-138 (Original issuer notified of a new passport under contract); SyR-LIFE-139 (Original issuer may add a forward link to its own passport); SyR-PASS-232 (Forward link offered to the issuer's authorised recipients and authorities); SyR-LIFE-141 (Passport's data provider, nameplate manufacturer and successor notified of the recycling); SyR-LIFE-142 (Predecessor issuers may be notified of the recycling under contract); SyR-LIFE-011 (Recycling ends the battery's passport dataset).

### 3.7 UC-5b: the issuer buys degradation data from second-life operators (LC-5b)

- **What happens.** The economic operator that issued the original passport buys the state of health and the usage data of its battery's later life cycles from the holder of the new passport, under a Catena-X contract, to improve its reliability models. The contract negotiation and the transfer are those of UC-1 with the data provider and the data consumer exchanged.
- **Stored texts.** Data Act Art. 4(1) and 5(1); draft Art. 77(9) act Art. 1(4) and 2(4).
- **Decisions.** Q-1002 (who reads the state of health and battery status under the draft Article 77(9) act); Q-1011 (whether the reference implementation builds use case UC-5).
- **System requirements.** SyR-PASS-233 (Degradation data of a second-life battery offered to the original issuer).

### 3.8 A gap for UC-1 in the draft Article 77(9) act

Draft Art. 2(4) of the Art. 77(9) implementing act forbids the persons of Art. 1(4), the purchaser and the purchaser's agent, to share or publish the Annex XIII point 4 information outside five exceptions. The exceptions name emergency services, poison centres, prospective purchasers, market surveillance authorities, the Chapter VIII authorities and customs authorities, plus the sharing that the economic operator placing the battery on the market authorises (draft Art. 2(4)(e)). The exceptions do not name the economic operator that issued the passport as a recipient.

Two stored texts support UC-1 nevertheless:

- Art. 78(c) of Regulation (EU) 2023/1542 makes the economic operator responsible for the passport, or an operator authorised by it, store the passport data. The flow from the owner of the battery to the issuer supplies the data that the issuer stores in the passport.
- Art. 4(1) and 5(1) of the Data Act give the owner of a connected product, the "user", the right to obtain the product data and to have the data holder make the data available to a third party.

The proposal states UC-1 with both bases and names the gap of draft Art. 2(4) in Annex B point 1. The final act may close the gap, keep the gap or change the exceptions.

### 3.9 The recycling result: decision Q-1006

The owner answered decision Q-1006 (how the producers of a battery learn its recycling result after re-use or remanufacturing) on 2026-11-09 with option B plus option D. The premise check of the [citation catalogue](citation-catalogue.md), section 2, found the following:

- The first recycler reports to the competent authorities, and no stored text obliges the recycler to report to the manufacturer (Art. 75(5), stakeholder requirement StR-LIFE-962 (First recycler reports the information of the whole recycling chain)).
- The producer of the passport that recycling ends pays the costs of the data gathering and reporting (Art. 56(4)(d)), and the producer responsibility organisation publishes the recycling efficiencies achieved by its producers (Art. 57(5)).
- After a second-life operation, that producer is the second-life operator (Art. 56(2), decision Q-1007 (which producer takes over the passport of a second-life battery that becomes waste)).
- Every new passport links back to its original passports. The issuer of an original passport may add a forward link to its own passport after the notice of the second-life operator (decision Q-1008 (whether the original passport records a link to its successor passport), revised on 2026-11-09), so a forward link exists only where an issuer chose to add one.

**Answer: option B (a direct notice from the recycler), limited by contract, together with option D (publication of the end of the passport).** The system requirements are SyR-LIFE-141 (Passport's data provider, nameplate manufacturer and successor notified of the recycling), SyR-LIFE-142 (Predecessor issuers may be notified of the recycling under contract), SyR-LIFE-011 (Recycling ends the battery's passport dataset) and SyR-LIFE-127 (End of a recycled battery's passport made known to the provider).

1. The first recycler, or the treatment operator acting for the producer, sends a CX-0151 notification with the recycling result to the producer of the final passport. That producer finances the treatment and needs the result for its producer responsibility organisation, so the notice serves a regulatory purpose. The proposal names the receivers in its Table 4.3 and lets the recycler find each receiver's connector through the BPN-DID Resolution Service of CX-0167 and the discovery of CX-0018 section 2.6 (decisions D13 and D16 of Annex C of the proposal).
2. The recycler may also walk the predecessor links of the final passport and notify the economic operator of each predecessor passport, when a contract with that operator exists. That notice is voluntary, for example for the cost sharing mechanism of Art. 56(5).
3. The end of the passport after recycling (Art. 77(8)) is published on the final passport and its digital twin, so the passport service provider learns the end (decision Q-961 (how the passport service provider learns a passport ended)) and every holder of a predecessor passport can query the end.

Option A (a relay along the chain) fails when an operator in between leaves the dataspace. Option C (subscriptions carried forward) needs a forward record on each original passport, and the revised decision Q-1008 makes the forward link optional, so option C would miss every chain whose issuer added no link. The notice of a new passport of UC-5a (SyR-LIFE-138 (Original issuer notified of a new passport under contract)) and the predecessor notice of point 2 use the same CX-0151 notification API.

## 4. The trace from an interface to its requirements

The table names, for each interface item of the proposal, the section of the proposal and the system requirements that the item implements. The registry holds the trace of each system requirement to its stakeholder requirements and to the quoted texts.

| Interface item | Section of the proposal | System requirements and decisions |
|---|---|---|
| The new passport and its new PartInstance digital twin | 2.1.1 | SyR-LIFE-018 (New passport dataset for a treated battery placed on the market again); SyR-LIFE-026 (New unique identifier attributed by the operator to the new passport); SyR-LIFE-131 (New passport delivered as a passport of its own, not a version); SyR-CXD-221 (New digital twin for a battery that receives a new passport); SyR-LIFE-151 (New passport accepted only with the treated battery's performance values) |
| The aspect model BatteryPassportLifecycle with the predecessor links, the successor and the end of the passport | 2.1.2, 2.1.5, 2.1.7 and 3.2 | SyR-LIFE-019 (New passport dataset links to each original battery's passport); SyR-LIFE-020 (Remanufactured dataset links every original battery's passport); SyR-LIFE-021 (Re-use and repurposing datasets link one or more original passports); SyR-LIFE-148 (Successor, successor's role and date of the waste status held); SyR-LIFE-149 (Date of the recycling and the recycler held in the ended passport); decision Q-202 (the carrier for lifecycle data the aspect models lack) |
| The aspect model BatteryPassportSuccessors with the forward links | 2.1.3 and 3.3 | SyR-LIFE-139 (Original issuer may add a forward link to its own passport); SyR-PASS-232 (Forward link offered to the issuer's authorised recipients and authorities); SyR-LIFE-150 (Last battery status kept on a superseded original passport); SyR-LIFE-143 (Only the data provider of a passport writes into that passport) |
| The aspect model BatteryPassportAccessMap | 2.2 items 8 to 12 and 3.4 | SyR-PASS-011 (Every dataset field marked with exactly one access group); decision Q-200 (how the dataset delivers each field's access group) |
| The notification NewPassportIssued | 4.3 | SyR-LIFE-138 (Original issuer notified of a new passport under contract) |
| The notification BatteryRepaired | 2.1.4 and 4.3 | SyR-LIFE-145 (Repair notified to the data provider of the passport); SyR-LIFE-146 (Repair certificate held as the record of the repair); decision Q-045 (the role that records a repair) |
| The notification BatteryBecameWaste | 2.1.5 and 4.3 | SyR-LIFE-147 (Waste status notified to the data provider and the named successor); SyR-LIFE-008 (Status waste set on the existing passport, with no new passport); SyR-LIFE-049 (Responsibility moves to a named successor when the battery becomes waste) |
| The notification PassportEnded | 2.1.7 and 4.3 | SyR-LIFE-141 (Passport's data provider, nameplate manufacturer and successor notified of the recycling); SyR-LIFE-142 (Predecessor issuers may be notified of the recycling under contract); SyR-LIFE-011 (Recycling ends the battery's passport dataset); SyR-LIFE-144 (End of the passport recorded without the successor's authorisation) |
| The lifecycle notification asset and the rules of a notification | 4.3 | SyR-CXD-092 (Notification APIs offered and called with HTTP POST only); SyR-CXD-096 (Notification endpoints answer 200, or 4xx or 5xx on failure); SyR-LIFE-152 (Receiver without a notification asset recorded by the sender); SyR-LIFE-153 (One lifecycle notification per receiver and per passport); SyR-LIFE-154 (Notification changes a passport only by the receiver's assigned steps) |
| The access to the lifecycle submodel | 2.2 item 7 | SyR-PASS-236 (Lifecycle record offered only to purchaser, operators and authorities) |
| The sharing of individual battery information under a contract | 2.2 and 2.3 | SyR-PASS-215 (Individual battery information shared with the passport issuer under contract); SyR-CXD-218 (Issuer's contract negotiation for individual battery information without a manual step); SyR-CXD-219 (Transfer of individual battery information to the issuer without a manual step); SyR-PASS-233 (Degradation data of a second-life battery offered to the original issuer) |

## 5. The Tractus-X conventions applied

The conventions were read on 2026-11-09 from eight repositories of Eclipse Tractus-X: `eclipse-tractusx.github.io`, `tractusx-edc`, `item-relationship-service`, `sldt-digital-twin-registry`, `tractusx-sdk`, `industry-core-hub`, `sldt-semantic-models` and `digital-product-pass`. TRG means the Tractus-X Release Guidelines. A KIT is a documentation and software package of Eclipse Tractus-X for one use case.

| Convention | Source | What this repository does | Process requirement |
|---|---|---|---|
| Six legal files at the root: `LICENSE` (Apache-2.0), `LICENSE_non-code` (CC-BY-4.0), `NOTICE.md`, `SECURITY.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md` | TRG 7.01 | The root holds the six files. | PrR-CXD-013 (Six Tractus-X legal files at the reference implementation repository's root) |
| A `.tractusx` metadata file with the keys `leadingRepository`, `product` and `openApiSpecs` | TRG 2.05 and TRG 1.08 | The root holds the file. | PrR-CXD-014 (.tractusx metadata file with leadingRepository, product and openApiSpecs keys) |
| `README.md`, `INSTALL.md` and `CHANGELOG.md` | TRG 1.01, TRG 1.02 and TRG 1.03 | The root holds the three files. | PrR-CXD-015 (README, INSTALL and CHANGELOG files at the reference implementation's root) |
| The license header of its kind in every file | TRG 7.02 | The script `scripts/check-license-headers.mjs` lists every file without its header. | PrR-CXD-016 (License header of its kind in every reference implementation file) |
| A visible NOTICE section at the end of every documentation file | TRG 7.07 | Every Markdown file ends with the section. | PrR-CXD-017 (Visible NOTICE section at the end of every documentation file) |
| The OpenAPI specification at `docs/api/openAPI.yaml` | TRG 1.08 | The file is not yet written. | PrR-CXD-018 (Lifecycle notification API specified in docs/api/openAPI.yaml, OpenAPI 3.1.0) |
| The rules of a notification API: HTTP POST only, one endpoint per operation, the operation name as path and as `operationId`, a header that follows the MessageHeader aspect model 3.0.0, one JSON (JavaScript Object Notation) schema per content, one connector asset per API | Industry Core KIT, release 26.09 | Section 4.3 of the proposal follows the rules for the four operations. | PrR-CXD-019 (Four notification operations with JSON schemas, following the Industry Core KIT) |
| The answers of a notification endpoint: 200, 4xx and 5xx; the Industry Core KIT leaves the error body optional | Industry Core KIT, release 26.09 | Section 4.3 item 7 of the proposal requires an error body that states the failure, the reason and the next action of the sender. | PrR-CXD-020 (Notification responses 200, 4xx and 5xx with the error body of Q-409) |
| The architecture documentation in the arc42 template, the administrator guide, and the adoption view, the development view and the operations view of a KIT | TRG 1.05, TRG 1.06 and TRG 10.02 | The documents are not yet written. | PrR-CXD-021 (Arc42 architecture documentation of the lifecycle notification API); PrR-CXD-022 (Administrator guide for the notification asset and its policies); PrR-CXD-023 (Adoption, development and operations views in the KIT template) |
| The aspect model layout `<namespace>/<version>/<Aspect>.ttl` with `metadata.json` and `RELEASE_NOTES.md` | repository `sldt-semantic-models` | The folder `models/` follows the layout. The models are not yet written. | PrR-CXD-026 (Three proposed models in the sldt-semantic-models layout) |
| The validation of every aspect model with the command line tool 2.11.1 of the Semantic Aspect Meta Model (SAMM) | repository `sldt-semantic-models` | Every model must pass the validation without error. | PrR-CXD-027 (Proposed models validated with SAMM CLI 2.11.1) |
| The contribution of a model in three stages: the request for a model, the valid model in a pull request, the released model | repository `sldt-semantic-models` | The models stay in this repository until the Catena-X Digital Product Passport Expert Group accepts the proposal. | none |
| A conformance test folder `tck/` | repository `tractusx-sdk` | The folder `tck/` is the place of one test per conformity assessment criterion of Annex A of the proposal. The tests are not yet written. | PrR-CXD-028 (One conformance test per criterion CX-0160-4-CAC-001 to 016); PrR-CXD-029 (Conformance tests run against the in-process binding and the connector binding) |
| The linting of the OpenAPI file with Spectral | repository `item-relationship-service` | Every change of the OpenAPI file must pass the linter. | PrR-CXD-030 (OpenAPI file linted with Spectral on every change) |

Two facts of the reading limit the conventions. No common error format exists across the Tractus-X interfaces: the Digital Twin Registry answers with the result object of Part 2 of the Asset Administration Shell specification, the Item Relationship Service answers with its own error object, and the notification APIs answer with status codes only. No Tractus-X Release Guideline defines a folder for conformance tests.

Two process requirements were reworded on 2026-11-16 for the state of draft 0.6 of the proposal, which added the access map model and the criterion CX-0160-4-CAC-016: PrR-CXD-026 (Three proposed models in the sldt-semantic-models layout) names the three proposed aspect models, and PrR-CXD-028 (One conformance test per criterion CX-0160-4-CAC-001 to 016) names the sixteen criteria CX-0160-4-CAC-001 to CX-0160-4-CAC-016.

## NOTICE

This work is licensed under the [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/legalcode).

- SPDX-License-Identifier: CC-BY-4.0
- SPDX-FileCopyrightText: 2026 Ichnos Protocol Pte. Ltd.
- SPDX-FileCopyrightText: 2026 Contributors to the Eclipse Foundation
- Source URL: https://github.com/Ichnos-Protocol/battery-passport-after-first-life/blob/main/docs/methodology.md
