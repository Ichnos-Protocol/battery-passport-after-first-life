# CX-0160-4 Battery Passport after the First Passport: proposed use case document

| | |
|---|---|
| Status | Draft proposal for the Catena-X Digital Product Passport (DPP) Expert Group; not adopted, not normative |
| Version | 0.8 (drafts 0.1 to 0.3 were revised after three independent reviews; draft 0.5 added the points for discussion of Annex D; draft 0.6 added the proposed access map model of section 3.4, the rules of section 2.2 items 8 to 12, the criterion CX-0160-4-CAC-016 and Annex B point 19, and changed Annex B point 11; draft 0.7 states that `AccessMapEntry.path` is a JSONPath query (RFC 9535) in section 3.4.2, adds RFC 9535 and the seven IDTA-02035 parts to the normative references of section 6.1, names the current draft in Annex A and names the four operations in decision D5 of Annex C; draft 0.8 adds the topic B.5 with Annex B point 20 on the descriptive error body across the connector, and names the current draft in Annex A) |
| Date | 2026-11-19 |
| Author | Francesco Maltoni, Ichnos Protocol, ordinary member of the Catena-X Association and member of the Catena-X Digital Product Passport Expert Group |
| Document | proposed use case document CX-0160-4 of CX-0160 Battery Passport Data Management, beside CX-0160-1, CX-0160-2 (announced) and CX-0160-3, with one proposed change of the base document in its section 4.2 (section 4.2 of this document) |
| Release | CX-Neptune; CX-0160 1.1.0 states that its version is not yet eligible for certification, and the criteria of Annex A apply once CX-0160 becomes eligible |
| Verified | 2026-11-09, against the texts of section 6 |

## How to read this proposal

> *This section is non-normative*

- The key words **MAY**, **MUST**, **MUST NOT**, **OPTIONAL**, **RECOMMENDED**, **REQUIRED**, **SHOULD** and **SHOULD NOT** are interpreted as described in BCP 14 [RFC2119] [RFC8174] when, and only when, they appear in all capitals. The key words state what the document would require once adopted; the proposal binds no one before the Catena-X Association adopts it.
- The subject of every normative statement is a participant: the data provider of a passport, the second-life operator, the repairer, the waste receiver, the recycler, the sender or the receiver of a notification. A Conformity Assessment Body checks that participant (Annex A).
- Where the proposal and Regulation (EU) 2023/1542 or DIN DKE SPEC 99100 differ, Annex B names the difference.
- A claim marked `[live]` cites a legal or Catena-X text by its article, section or clause; the [citation catalogue](../citation-catalogue.md) quotes the cited provisions with the locator of each quote.
- Every model, usage purpose, taxonomy name and notification context that the proposal names carries the word "proposed" and is not released.

## ABSTRACT

> *This section is non-normative*

CX-0160 1.1.0 defines how economic operators, suppliers, original equipment manufacturers, dismantlers and recyclers provide and consume battery passport data in Catena-X. CX-0160 1.1.0 covers the first passport of a battery and carries the battery status in the element LifeCycleStage of the IDTA digital nameplate, but CX-0160 1.1.0 states no rule for a battery that is re-used, prepared for re-use, repurposed, remanufactured, repaired, discarded as waste or recycled.

The proposed use case document CX-0160-4 adds the rules for the battery after its first passport. CX-0160-4 defines when a new passport and a new digital twin are issued, which identifiers change, how the new passport links back to the original passports, how the original issuer may add a forward link, how the waste status and the end of the passport are recorded, and how the participants notify each other through a lifecycle notification API under CX-0151. CX-0160-4 also defines five lifecycle use cases, among them the purchase of individual battery information under a contract, and maps the access to the draft implementing act under Art. 77(9) of Regulation (EU) 2023/1542.

## FOR WHOM IS THE STANDARD DESIGNED

> *This section is non-normative*

- Data Provider / Consumer: the original issuer of a passport, the second-life operator, the repairer, the waste receiver, the recycler, the producer, the producer responsibility organisation and the waste management operator.
- Business Application Provider: the provider of an application that issues, links, ends or notifies battery passports, or that acts for the purchaser of a battery.

## 1 INTRODUCTION

> *This section is non-normative*

### 1.1 AUDIENCE & SCOPE

**Goal.** CX-0160-4 lets a Conformity Assessment Body check six outcomes:

1. A battery placed on the market again after preparation for re-use, preparation for repurposing, repurposing or remanufacturing has a new passport with a new passport identifier and a new PartInstance twin, linked back to every original passport.
2. A repair keeps the passport and sets the status "re-used" with the description "repaired"; a direct re-use and a change of purchaser keep the passport and its status.
3. The waste status is set on the existing passport, and the lifecycle submodel names the successor.
4. The end of a passport after recycling is recorded in the lifecycle submodel of the passport.
5. The lifecycle notifications run through one notification API under CX-0151.
6. The individual battery information of Annex XIII point 4 is offered only under the access rules of section 2.2.

**In scope:** the lifecycle events after the first passport, the new passport and its PartInstance twin, the identifiers, the links between passports, the waste status, the end of the passport, the lifecycle notification API, the five lifecycle use cases of section 2.3, and the access to the individual battery information.

**Out of scope, with the owner and the reason:**

| Item | Owner | Reason |
|---|---|---|
| The calculation of recycling efficiency and of the recovery of materials | the recycler, under Delegated Regulation (EU) 2025/606 | the delegated act sets the method and calculates per calendar year and per chemistry stream, not per battery |
| The yearly report on recycling | the waste management operators carrying out treatment and the recyclers, under Art. 75(5); the first recycler where recycling runs in more than one facility | the report goes to the competent authority, not through the dataspace |
| The registration in the EU registry of digital product passports | the economic operator placing the battery on the market, under Art. 77(10) and Implementing Regulation (EU) 2026/1778 | no stored text states the registration of a new passport (Annex B point 6) |
| The recycled content documentation | the manufacturer, under the draft delegated act on recycled content | no rule of CX-0160-4 depends on the documentation |
| An identifier per cell or per module | the Catena-X traceability work | CX-0160-4 uses the bill of materials of CX-0127 and adds no cell identifier |

**Non-goals:** CX-0160-4 changes none of the eight models that CX-0160-3 requires (the seven IDTA-02035 parts and the IDTA DPP Metadata, IDTA-02099-1), does not change CX-0151, CX-0127 or CX-0131, and defines no marketplace of used batteries.

### 1.2 CONTEXT AND ARCHITECTURE FIT

The regulation gives the battery after its first passport these rules:

- `[live]` Regulation (EU) 2023/1542, Art. 77(7), first subparagraph: a battery that underwent preparation for re-use, preparation for repurposing, repurposing or remanufacturing "shall have a new battery passport linked to the battery passport or passports of the original battery or batteries".
- `[live]` Art. 77(7), second subparagraph: when the battery becomes waste, the responsibility for the passport is transferred to the producer, to the producer responsibility organisation where appointed under Art. 57(1), or to the waste management operator where selected under Art. 57(8).
- `[live]` Art. 77(8): the passport "shall cease to exist after the battery has been recycled".
- `[live]` Art. 56(2): the economic operator that first makes available a battery resulting from those operations "shall be considered to be the producer of such battery".
- `[live]` Art. 75(5): the waste management operators carrying out treatment and the recyclers report the recycling efficiency and the recovery of materials to the competent authority of the Member State of treatment; where recycling runs in more than one facility, the first recycler collects and reports the information.
- `[live]` Annex XIII point 4: the information of an individual battery is accessible only to persons with a legitimate interest; Art. 1(4) of the draft implementing act under Art. 77(9) (Ares(2026)9814179) names the purchaser of the battery and any third party acting on the purchaser's behalf.

CX-0160-4 fits the Catena-X architecture as follows. The twins follow CX-0127 (PartInstance). The IDTA DPP Metadata carries the passport identifier and the battery identifier. The notifications follow CX-0151. The access follows CX-0152. A sender resolves the BPNL of a receiver to the receiver's DID through the BPN-DID Resolution Service of CX-0167, and finds the receiver's connector through the DID discovery of CX-0018 section 2.6, because CX-Neptune deprecates the central discovery of CX-0001 and CX-0053.

### 1.3 CONFORMANCE

Sections marked non-normative, the examples and the notes are non-normative; everything else is normative once adopted. A participant that implements only some lifecycle use cases of section 2.3 demonstrates conformity along the criteria of those use cases (Annex A). The criteria apply once CX-0160 becomes eligible for certification.

### 1.4 EXAMPLES

> *This section is non-normative*

A remanufacturer takes two used traction batteries, A and B, that are not waste, and builds battery C from their modules. The remanufacturer issues a new passport for C with a new passport identifier and a new battery identifier, registers a new PartInstance twin for C under its own BPNL, and publishes the lifecycle submodel of C with one predecessor link to the passport of A and one to the passport of B. The original issuers of A and B each provide a lifecycle notification asset; the remanufacturer sends NewPassportIssued to the original issuer of A, with whom a contract exists, and not to the original issuer of B, with whom none exists. The original issuer of A adds a forward link to the successors submodel of A. Years later the holder of C discards C at a collection point, which sends BatteryBecameWaste to the remanufacturer, the data provider of the passport of C, naming the producer responsibility organisation of the remanufacturer as successor; the remanufacturer sets the status and records the successor in the lifecycle submodel of C. A recycler then recycles C, registers the CX-0131 material recycling certificate, and sends PassportEnded to the remanufacturer, which the nameplate of C names as manufacturer, and to the producer responsibility organisation; the remanufacturer, acting under the written authorisation of the producer responsibility organisation, records the end of the passport in the lifecycle submodel of C.

### 1.5 TERMINOLOGY

> *This section is non-normative*

| Term | Meaning in CX-0160-4 |
|---|---|
| original passport | a passport to which a new passport links back |
| new passport | the passport of a battery placed on the market again after preparation for re-use, preparation for repurposing, repurposing or remanufacturing (Art. 77(7)) |
| passport identifier | the unique identifier of a passport (DIN DKE SPEC 99100 §6.1.2.1), carried in `digitalProductPassportId` of the IDTA DPP Metadata |
| battery identifier | the persistent unique identifier of the battery to which the QR code links (Art. 77(3), DIN DKE SPEC 99100 §6.1.2.2), carried in `uniqueProductIdentifier` of the IDTA DPP Metadata, in the specific asset IDs `partInstanceId` and `intrinsicId`, and in the nameplate element SerialNumber |
| original issuer | the economic operator that placed the battery on the market or put it into service under a passport (Art. 77(4)), or the second-life operator for a new passport (Art. 77(7)) |
| responsible operator | the original issuer before the waste status, and the successor after the waste status (Art. 77(7), second subparagraph) |
| data provider of a passport | the participant that registers the twin of the passport (the specific asset ID `manufacturerId`) and stores the passport data, for the responsible operator or under its written authorisation (Art. 77(4), Art. 78(c)); the only participant that writes into the passport |
| successor | the producer, the producer responsibility organisation or the waste management operator that takes over the responsibility for the passport when the battery becomes waste |
| producer | the producer of the battery in the sense of Art. 3(1)(47) and Art. 56; for a new passport, the second-life operator (Art. 56(2)) |
| second-life operator | the economic operator that issues a new passport |
| waste receiver | the participant that takes the battery over as waste: a collection point, a treatment facility or a waste management operator |
| predecessor link | the link from a new passport to one original passport |
| forward link | the optional link from an original passport to a new passport, added by the original issuer |
| direct re-use | the use of a battery that is not waste for the same purpose without any preparation (Directive 2008/98/EC, Art. 3(13)) |
| purchaser | the purchaser of the battery in the sense of Art. 1(4)(a) of the draft Art. 77(9) act; the purchaser reaches the dataspace through an application that acts on the purchaser's behalf |
| holder | the person in possession of the battery (Annex XIV point 1 of Regulation (EU) 2023/1542) |
| end of the passport | the state of a passport after the recycling of its battery (Art. 77(8)) |

## 2 RELEVANT PARTS OF THE STANDARD FOR SPECIFIC USE CASES

> *This section is normative*

### 2.1 BATTERY PASSPORT LIFECYCLE AFTER THE FIRST PASSPORT

#### 2.1.1 NEW PASSPORT AND NEW DIGITAL TWIN

1. The second-life operator MUST issue a new passport when the second-life operator places on the market or puts into service a battery that underwent preparation for re-use, preparation for repurposing, repurposing or remanufacturing.
2. The second-life operator MUST give the new passport a new passport identifier in `digitalProductPassportId`, different from the passport identifier of every original passport.
3. The second-life operator MUST keep the battery identifier of the original battery after a preparation for re-use, a preparation for repurposing or a repurposing of one battery, and MUST give a new battery identifier to a battery remanufactured or assembled from several batteries (Annex B point 7).
4. The second-life operator MUST register a new digital twin on PartInstance level according to CX-0127, with a new `catenaXId`, the specific asset IDs of Table 2.1.1 and the SerialPart aspect that CX-0127 requires for a serialized part.
5. The second-life operator MUST provide every model of CX-0160-3 on the new twin on PartInstance level, the type-level models included.
6. The second-life operator MUST set the elements of Table 2.1.2 to its own values, MUST update the performance and durability values that DIN DKE SPEC 99100 clauses 6.7.2.2 e), 6.7.2.4, 6.7.3.4 and 6.7.6.2 d) require at a new placing on the market (the rated capacity, the capacity fade, the power fade and the expected lifetime), and MAY keep the other elements of the original battery model.
7. The second-life operator MUST NOT change the digital twin or any submodel of an original battery.
8. The second-life operator SHOULD register the CX-0131 reuse certificate or remanufacturing certificate of its operation, as CX-0131 section 2.4.2.1 states.

Table 2.1.1, specific asset IDs of the new twin:

| Key | Value on the new twin |
|---|---|
| `manufacturerId` | the BPNL of the second-life operator, which is the data provider (CX-0160 1.1.0 section 2.1.1) and the manufacturer of the battery (Art. 38(11)) |
| `manufacturerPartId` | the catalogue part identifier of the second-life operator for the treated battery |
| `partInstanceId` | the battery identifier of item 3 |
| `intrinsicId` | the battery identifier of item 3 |
| `digitalTwinType` | `PartInstance` |

Two twins of different passports can carry the same battery identifier after a preparation for re-use, a preparation for repurposing or a repurposing; a data consumer tells the twins apart by `digitalProductPassportId` and by the predecessor links of the lifecycle submodel.

Table 2.1.2, elements set by the second-life operator:

| Model and element | Value on the new passport |
|---|---|
| nameplate (IDTA-02035-1) ManufacturerIdentifier | the BPNL of the second-life operator |
| nameplate ManufacturerName and AddressInformation | the name and address of the second-life operator |
| nameplate OperatorIdentifier | the operator identifier of the second-life operator |
| nameplate UniqueFacilityIdentifier | the BPNS of the facility that treated the battery |
| nameplate DateOfManufacture | the date of the treatment |
| nameplate DateOfPuttingIntoService | the date the treated battery was placed on the market or put into service again |
| nameplate LifeCycleStage | the value of Table 2.1.4 |
| nameplate EUDeclarationOfConformity, Markings and ResultsOfTestReportsProvingCompliance | the second-life operator's own declaration, markings and test reports, because Art. 38(11) makes the second-life operator a manufacturer |
| technical data (IDTA-02035-4) GeneralInformation.BatteryCategory | the category of the treated battery, which may differ from the original category (Art. 45(2)) |
| DPP Metadata (IDTA-02099-1) `digitalProductPassportId` and `uniqueProductIdentifier` | the identifiers of items 2 and 3 |

#### 2.1.2 PREDECESSOR LINKS

1. The second-life operator MUST publish on the new twin the lifecycle submodel of section 3.2 with one predecessor link per original passport.
2. The second-life operator MUST fill the five mandatory properties of each predecessor link (section 3.2.2): the passport identifier of the original passport, the `catenaXId` of the original twin, the BPNL of the data provider of the original passport (the `manufacturerId` of the original twin), the operation, and the operation date.
3. After remanufacturing, the second-life operator MUST link the new passport to the passport of every battery from which the second-life operator took a cell or a module; a new cell, or a cell without a passport, adds no link.
4. After preparation for re-use, preparation for repurposing or repurposing, the second-life operator MUST link the new passport to the passport of every original battery whose parts the treated battery contains, which can be several original passports.
5. The second-life operator MUST record passport links only in the lifecycle submodel, and MUST record the part relationships in the SingleLevelBomAsBuilt of the new twin, as CX-0127 requires.

#### 2.1.3 FORWARD LINK

1. The data provider of an original passport MAY add a forward link to the successors submodel of section 3.3 after the notification NewPassportIssued of section 4.3.
2. A participant other than the data provider of a passport MUST NOT write into that passport.
3. The data provider MUST offer the successors submodel as a data asset of its own, only to the recipients that the responsible operator authorises and to the market surveillance authorities (Annex B point 9).
4. The data provider of an original passport MUST keep the last LifeCycleStage of the original passport after a new passport is issued; the predecessor link of the new passport, and the forward link where the data provider adds one, show the supersession (Annex B point 15).

#### 2.1.4 STATUS VALUES

The data provider of a passport MUST set the element LifeCycleStage as Table 2.1.4 states, and MUST keep the passport and its identifiers in every row whose passport column reads "same passport".

Table 2.1.4, LifeCycleStage before and after each event:

| Event | Passport | LifeCycleStage after the event | Basis |
|---|---|---|---|
| first placing on the market | first passport | original | Annex XIII point 4(c) |
| repair of a battery that is not waste | same passport | re-used, with the repair recorded as "repaired" by the CX-0131 repair certificate that BatteryRepaired names | DIN DKE SPEC 99100 §6.1.3.7 f) and g) |
| direct re-use | same passport | unchanged | Directive 2008/98/EC Art. 3(13); no stored text sets a new value |
| change of purchaser | same passport | unchanged | no stored text sets a new value |
| the battery becomes waste | same passport | waste | Art. 77(7), second subparagraph |
| preparation for re-use | new passport | re-used | Annex XIII point 4(c), Art. 77(7) |
| preparation for repurposing or repurposing | new passport | repurposed | Annex XIII point 4(c), Art. 77(7) |
| remanufacturing | new passport | remanufactured | Annex XIII point 4(c), Art. 77(7) |
| recycling | same passport, ended | unchanged; the lifecycle submodel records the end (section 2.1.7) | Art. 77(8) |

After a repair, the repairer MUST register the CX-0131 repair certificate, as CX-0131 section 2.4.2.1 states, and MUST send BatteryRepaired (section 4.3) to the data provider of the passport; the data provider MUST then set LifeCycleStage to "re-used". The repair certificate is the record of the repair, because no model of CX-0160-3 carries a repair history (Annex B point 16).

#### 2.1.5 WASTE STATUS

1. The waste receiver MUST send BatteryBecameWaste (section 4.3) to the data provider of the passport (the `manufacturerId` of the twin), and MUST name in the notification the successor to whom the waste receiver hands the battery over.
2. The waste receiver SHOULD register the CX-0131 waste certificate, as CX-0131 section 2.4.2.1 states.
3. The data provider MUST set LifeCycleStage to "waste" on the existing passport after BatteryBecameWaste; the waste status issues no new passport. CX-0160-4 sets no time limit for the change.
4. The data provider MUST record in the lifecycle submodel of section 3.2 the successor that the notification names, with its BPNL, its role (producer, producer responsibility organisation where appointed under Art. 57(1), or waste management operator where selected under Art. 57(8)) and the date.
5. The data provider MUST keep the twin registered and readable after the waste status. The data provider MUST change the passport after the waste status only under a written authorisation of the successor (Art. 77(4)), except the record of the end of the passport of section 2.1.7 item 3, which the data provider MUST make in every case (Annex B point 17).
6. A second-life operator MAY prepare a waste battery that is not yet recycled for re-use or for repurposing; section 2.1.1 then applies.

#### 2.1.6 REMANUFACTURING DONORS

1. The data provider of a donor battery MUST keep the donor passport readable after the remanufacturing.
2. The data provider of a donor battery MUST set the status "waste" on the donor passport after BatteryBecameWaste for the remaining parts of the donor battery.
3. CX-0127 defines no record of the removal of a module from a built battery; Annex B point 10 names the open point.

#### 2.1.7 END OF THE PASSPORT

1. The recycler SHOULD register the CX-0131 material recycling certificate, as CX-0131 section 2.4.2.1 states.
2. The recycler MUST send PassportEnded (section 4.3) to the receivers of Table 4.3.
3. The data provider MUST record the end of the passport in the lifecycle submodel (`endOfPassport`) after PassportEnded.
4. The data provider MUST NOT change any other information of an ended passport.
5. The data provider SHOULD keep the ended passport and its lifecycle submodel readable for the persons who could read them before the end (Annex B point 5).
6. Once EN 18223 is stored, CX-0160-4 maps the end of the passport to the value of `dppStatus` of the IDTA DPP Metadata that EN 18223 defines (note, not normative).

### 2.2 POLICY CONSTRAINTS FOR DATA EXCHANGE

1. Every data provider MUST follow CX-0152, and MUST carry the usage purpose `cx.circular.dpp:1` on every offer of battery passport data, as CX-0160 1.1.0 section 2.2 requires.
2. Once the implementing act under Art. 77(9) applies, the data provider of a passport MUST offer the IDTA product condition submodel only to the purchaser and to a third party acting on the purchaser's behalf.
3. Once the implementing act under Art. 77(9) applies, the purchaser MAY share the individual battery information with the recipients of draft Art. 2(4)(a), (c) and (d), and MAY share or publish the information where the economic operator placing the battery on the market authorises the purchaser under draft Art. 2(4)(e).
4. Before the implementing act under Art. 77(9) applies, the data provider MUST apply the access of CX-0160 1.1.0 and of the data provider's own policy.
5. The data provider MUST carry, beside `cx.circular.dpp:1`, the usage purpose of Table 2.2 on each offer of a lifecycle use case once CX-0152 registers the purpose.
6. The data provider of the passport MUST withdraw a purchaser's access when the application acting for the new purchaser informs the data provider of the change of purchaser.
7. Once the implementing act under Art. 77(9) applies, the data provider MUST offer the lifecycle submodel only to the purchaser and its agent, to the responsible operator, to the successor and to the market surveillance authorities, because the submodel reveals the battery status (Annex XIII point 4(c)).
8. The data provider of a passport MUST offer the access map of section 3.4 on the PartType twin of the battery model, under the usage purpose `cx.circular.dpp:1` that CX-0160 1.1.0 section 2.2 requires for the passport aspect models.
9. The data provider MUST put in the access map one entry for every field of the seven IDTA-02035 aspect models that the data provider serves. The seven IDTA-02035 aspect models stay unchanged.
10. A participant that serves battery passport data to a recipient MUST apply to each field the access group of the entry of the access map that covers the field.
11. The data provider MUST offer the lifecycle submodel of section 3.2 and the successors submodel of section 3.3 each as a data asset of its own with its own access policy, because each of the two models holds information of one access group.
12. When a new version of Annex XIII of Regulation (EU) 2023/1542 or of the implementing act under Art. 77(9) applies, the data provider MUST publish the access map with a new `mapVersion`.

Table 2.2, proposed usage purposes, each to be registered by a change of CX-0152:

| Usage purpose (proposed) | Carried by | Description |
|---|---|---|
| proposed `cx.circular.dpp.resale:1` | the offer of LC-2 | The data consumer may use the individual battery information only to evaluate the purchase of the battery from its purchaser (draft Art. 2(4)(c)). |
| proposed `cx.circular.dpp.issuer:1` | the offer of LC-1 and LC-5b | The data consumer, the data provider of a passport, may use the individual battery information under the contract with the purchaser for the passport it stores and for the evaluation of the battery's durability (Annex B point 2). |
| proposed `cx.circular.dpp.lifecycle:1` | the lifecycle notification asset of each receiver (section 4.3) | The data consumer, the sender of a notification, may send lifecycle notifications to the receiver; the receiver uses them for its passport, its accounting under Art. 56(5) and its forward link. |

### 2.3 LIFECYCLE USE CASES

The labels LC-1 to LC-5b avoid a collision with the use case documents CX-0160-1 to CX-0160-3.

| Use case | Data provider | Data consumer | Data | Rule |
|---|---|---|---|---|
| LC-1, sharing with the original issuer under a contract | the application acting for the purchaser | the data provider of the passport, for the original issuer | individual battery information | section 2.2 items 3 and 5 |
| LC-2, sharing for a resale | the application acting for the purchaser who resells | a prospective purchaser; the market surveillance and Chapter VIII authorities | individual battery information | section 2.2 item 3, draft Art. 2(4)(c) |
| LC-3a, a waste battery prepared for re-use or for repurposing | the second-life operator | the data providers of the original passports | new passport, lifecycle submodel, NewPassportIssued | sections 2.1.1, 2.1.2, 2.1.5 item 6 |
| LC-3b, repurposing or remanufacturing of a battery that is not waste | the second-life operator | as LC-3a | as LC-3a | sections 2.1.1, 2.1.2, 2.1.6 |
| LC-4, direct re-use | none | none | none; the passport stays | Table 2.1.4 |
| LC-5a, the original issuer follows the later life cycles of its battery | the second-life operator, the waste receiver, the recycler (as senders) | the data providers of the predecessor passports (as receivers) | lifecycle notifications | section 4.3 |
| LC-5b, the original issuer buys degradation data | the application acting for the purchaser of the battery with the new passport | the data provider of an original passport, for its original issuer | individual battery information | as LC-1 |

> *Note (non-normative):* in LC-1 and LC-5b the connector negotiates the contract and runs the transfer without a manual step. The bases of LC-1 and LC-5b are Art. 78(c) of Regulation (EU) 2023/1542 (the responsible operator stores the passport data), draft Art. 2(4)(e) (the economic operator may authorise the sharing), and the Data Act (Regulation (EU) 2023/2854): Art. 5(1) where a data holder makes the data available to the original issuer at the purchaser's request, and Art. 4(13) where the original issuer holds the data itself and uses the data under a contract with the purchaser. Annex B point 1 names the missing exception of draft Art. 2(4).

## 3 SEMANTIC MODELS

> *This section is normative*

### 3.1 MODELS USED

CX-0160-4 uses the eight models of CX-0160-3 unchanged. The IDTA DPP Metadata (IDTA-02099-1) carries the passport identifier in `digitalProductPassportId` and the battery identifier in `uniqueProductIdentifier`; the IDTA digital nameplate (IDTA-02035-1) carries the battery status in LifeCycleStage. CX-0160-4 adds three models:

| urn (proposed) | Model | Carries | Required on |
|---|---|---|---|
| `urn:samm:io.catenax.battery.passport_lifecycle:1.0.0#BatteryPassportLifecycle` | lifecycle | the predecessor links of section 2.1.2, the successor of section 2.1.5, and the end of the passport of section 2.1.7 | every new passport, and every passport that reaches the waste status |
| `urn:samm:io.catenax.battery.passport_successors:1.0.0#BatteryPassportSuccessors` | successors | the forward links of section 2.1.3 | an original passport whose original issuer added a forward link |
| `urn:samm:io.catenax.battery.passport_access_map:1.0.0#BatteryPassportAccessMap` | access map | the access group of every field of the seven IDTA-02035 aspect models (section 2.2 items 8 to 12) | the PartType twin of every battery model |

A first passport that never reaches the waste status carries neither the lifecycle model nor the successors model.

### 3.2 SEMANTIC MODEL "BATTERY PASSPORT LIFECYCLE" (proposed)

#### 3.2.1 INTRODUCTION

`[live]` The generic digital product passport model 7.0.0 of Tractus-X carries one optional `predecessor` identifier, and the shared recycling strategy certificate 3.0.0, which the remanufacturing certificate 3.0.0 uses, carries one optional `catenaXIdPreviousLife`. Neither the generic digital product passport model nor the shared certificate model can name several original passports, which Art. 77(7) requires for a remanufactured battery. `[live]` The IDTA DPP Metadata 1.0.0 types `dppStatus` as free text and defines no value for an ended passport, and carries in `economicOperatorId` one economic operator in the format of EN 18219, not a successor. The lifecycle model therefore carries the predecessor links, the successor and the end of the passport.

#### 3.2.2 PROPERTIES

| Property | SAMM characteristic | Mandatory | Meaning |
|---|---|---|---|
| `predecessors` | `samm-c:List` of `PassportLink` with `samm-c:LengthConstraint` minValue 0 | yes | one entry per original passport; empty on a first passport |
| `wasteResponsibility` | entity `WasteResponsibility` | no | present once the battery is waste (section 2.1.5) |
| `endOfPassport` | entity `EndOfPassport` | no | present once the battery is recycled (section 2.1.7) |
| `PassportLink.passportIdentifier` | `samm-c:Text` | yes | the `digitalProductPassportId` of the original passport |
| `PassportLink.catenaXId` | `urn:samm:io.catenax.shared.uuid:2.0.0#UuidV4Trait` | yes | the `catenaXId` of the original twin |
| `PassportLink.dataProviderBpnl` | `urn:samm:io.catenax.shared.business_partner_number:2.0.0#BpnlTrait` | yes | the BPNL of the data provider of the original passport (the `manufacturerId` of the original twin) |
| `PassportLink.operation` | `samm-c:Enumeration`: `preparationForReUse`, `preparationForRepurposing`, `repurposing`, `remanufacturing` | yes | the operation that issued the new passport |
| `PassportLink.operationDate` | `samm-c:Timestamp` | yes | the date the new passport was issued |
| `WasteResponsibility.successorBpnl` | `urn:samm:io.catenax.shared.business_partner_number:2.0.0#BpnlTrait` | yes | the BPNL of the successor |
| `WasteResponsibility.successorRole` | `samm-c:Enumeration`: `producer`, `producerResponsibilityOrganisation`, `wasteManagementOperator` | yes | the role of Art. 77(7), second subparagraph |
| `WasteResponsibility.date` | `samm-c:Timestamp` | yes | the date the battery became waste |
| `EndOfPassport.recyclingDate` | `samm-c:Timestamp` | yes | the date of the recycling |
| `EndOfPassport.recyclerBpnl` | `urn:samm:io.catenax.shared.business_partner_number:2.0.0#BpnlTrait` | yes | the BPNL of the recycler |

Example payload of a remanufactured battery that is waste:

```json
{
  "predecessors": [
    {
      "passportIdentifier": "urn:uuid:5f0c1c7e-6b1e-4a37-9a59-0b1d7c3e2a10",
      "catenaXId": "urn:uuid:9a2b8f61-3c5d-4e7a-8b1f-2d6c4a0e9f33",
      "dataProviderBpnl": "BPNL000000000001",
      "operation": "remanufacturing",
      "operationDate": "2031-05-04T00:00:00Z"
    }
  ],
  "wasteResponsibility": {
    "successorBpnl": "BPNL000000000003",
    "successorRole": "producerResponsibilityOrganisation",
    "date": "2039-02-11T00:00:00Z"
  }
}
```

### 3.3 SEMANTIC MODEL "BATTERY PASSPORT SUCCESSORS" (proposed)

The successors model carries a `samm-c:List` `successors` of the entity `SuccessorLink`, each naming one new passport:

| Property | SAMM characteristic | Mandatory | Meaning |
|---|---|---|---|
| `SuccessorLink.passportIdentifier` | `samm-c:Text` | yes | the `digitalProductPassportId` of the new passport |
| `SuccessorLink.catenaXId` | `urn:samm:io.catenax.shared.uuid:2.0.0#UuidV4Trait` | yes | the `catenaXId` of the new twin |
| `SuccessorLink.secondLifeOperatorBpnl` | `urn:samm:io.catenax.shared.business_partner_number:2.0.0#BpnlTrait` | yes | the BPNL of the second-life operator |
| `SuccessorLink.operation` | `samm-c:Enumeration`, the four values of `PassportLink.operation` | yes | the operation that issued the new passport |
| `SuccessorLink.operationDate` | `samm-c:Timestamp` | yes | the date the new passport was issued |

### 3.4 SEMANTIC MODEL "BATTERY PASSPORT ACCESS MAP" (proposed)

#### 3.4.1 INTRODUCTION

`[live]` Annex XIII of Regulation (EU) 2023/1542 sorts the information of the battery passport into four access groups: the information relating to the battery model that is publicly accessible (point 1), the information relating to the battery model that is accessible only to persons with a legitimate interest and the Commission (point 2), the information that is accessible only to notified bodies, market surveillance authorities and the Commission (point 3), and the information relating to an individual battery that is accessible only to persons with a legitimate interest (point 4). No field of the seven IDTA-02035 aspect models names its access group, and several of the seven models hold fields of more than one access group (Annex B point 11). The access map therefore names the access group of every field. One access map serves every battery of a battery model, so the access map is a submodel of the PartType twin of the battery model (CX-0126). An entry names the twin level, because a value of the technical data can be public as a value of the battery model (Annex XIII point 1) and restricted as the value of an individual battery (Annex XIII point 4(a)).

#### 3.4.2 PROPERTIES

| Property | SAMM characteristic | Mandatory | Meaning |
|---|---|---|---|
| `mapVersion` | `samm-c:Text` | yes | the version of the access map; a new version of Annex XIII or of the implementing act under Art. 77(9) leads to a new value (section 2.2 item 12) |
| `validFrom` | `samm:Characteristic` with the data type `xsd:date` | yes | the date from which the access map applies |
| `entries` | `samm-c:List` of `AccessMapEntry` with `samm-c:LengthConstraint` minValue 1 | yes | one entry per field of the seven IDTA-02035 aspect models that the data provider serves (section 2.2 item 9) |
| `AccessMapEntry.aspect` | `samm-c:Text` | yes | the identifier (urn) of the aspect model that the entry covers |
| `AccessMapEntry.twinLevel` | `samm-c:Enumeration`: `PartType`, `PartInstance` | yes | the level of the digital twin on which the entry applies to the field |
| `AccessMapEntry.path` | `samm-c:Text` | yes | the path of the field as a JSONPath query (RFC 9535), relative to the root of the payload of the aspect model; a selector of RFC 9535 names the list elements where the entry covers only some elements of a list |
| `AccessMapEntry.accessGroup` | `samm-c:Enumeration`: `public`, `legitimateInterestModel`, `authorities`, `legitimateInterestBattery` | yes | the access group of the field, as Table 3.4 states |
| `AccessMapEntry.legalBasis` | `samm-c:Text` | yes | the point and the letter of Annex XIII of Regulation (EU) 2023/1542 that list the field |

Table 3.4, values of `AccessMapEntry.accessGroup`:

| Value | Access group of Annex XIII of Regulation (EU) 2023/1542 |
|---|---|
| `public` | point 1: publicly accessible information relating to the battery model |
| `legitimateInterestModel` | point 2: information relating to the battery model accessible only to persons with a legitimate interest and the Commission |
| `authorities` | point 3: information accessible only to notified bodies, market surveillance authorities and the Commission |
| `legitimateInterestBattery` | point 4: information and data relating to an individual battery accessible only to persons with a legitimate interest |

Example payload with three entries (non-normative):

```json
{
  "mapVersion": "1.0.0",
  "validFrom": "2027-02-18",
  "entries": [
    {
      "aspect": "urn:samm:io.admin-shell.idta.batterypass.digital_nameplate:1.0.0#BatteryNameplate",
      "twinLevel": "PartInstance",
      "path": "$.ManufacturerName",
      "accessGroup": "public",
      "legalBasis": "Annex XIII point 1(a)"
    },
    {
      "aspect": "urn:samm:io.admin-shell.idta.batterypass.digital_nameplate:1.0.0#BatteryNameplate",
      "twinLevel": "PartInstance",
      "path": "$.LifeCycleStage",
      "accessGroup": "legitimateInterestBattery",
      "legalBasis": "Annex XIII point 4(c)"
    },
    {
      "aspect": "urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#ProductCondition",
      "twinLevel": "PartInstance",
      "path": "$.NumberOfFullCycles",
      "accessGroup": "legitimateInterestBattery",
      "legalBasis": "Annex XIII point 4(d)"
    }
  ]
}
```

### 3.5 SPECIFICATION ARTIFACTS

> *This section is non-normative*

The author writes the lifecycle model, the successors model and the access map model as SAMM aspect models (RDF Turtle, CX-0003), validates them with the SAMM command line tool, and proposes them to the Tractus-X semantic model repository once the expert group accepts the proposal.

## 4 APPLICATION PROGRAMMING INTERFACES

> *This section is normative*

### 4.1 APIs ASSOCIATED WITH DIGITAL TWINS

The data provider MUST register each submodel of section 3 as a data asset with the `dct:type` of CX-0160 1.1.0 section 4.1 and its own semantic identifier.

### 4.2 PROPOSED CHANGE OF CX-0160 1.1.0 SECTION 4.2

`[live]` CX-0160 1.1.0 section 4.2 states: "The notification request MUST contain a payload conformant to the Catena-X Digital Twin Event Notification API Specification". CX-0160-4 proposes to change the sentence in the base document to: "A Digital Twin Event notification request MUST contain a payload conformant to the Catena-X Digital Twin Event Notification API Specification." The lifecycle notification API of section 4.3 is then a second notification API under CX-0151. The change also needs a change of the base criteria file of CX-0160.

### 4.3 LIFECYCLE NOTIFICATION API (proposed)

The sender of a lifecycle notification is the participant that performs the lifecycle event: the second-life operator sends NewPassportIssued, the repairer sends BatteryRepaired, the waste receiver sends BatteryBecameWaste, and the recycler sends PassportEnded. The receiver of a lifecycle notification is the participant that must learn of the event: the data provider of the passport concerned for every operation, the data provider of each original passport for NewPassportIssued, the successor for BatteryBecameWaste and PassportEnded, and the manufacturer named on the nameplate for PassportEnded. Table 4.3 names the sender and the receivers of each operation, and the element that holds each receiver's BPNL. The receiver provides the connector asset, and the sender negotiates the contract and calls the receiver's endpoint, as CX-0151 describes.

1. The receiver MUST register exactly one connector asset for the lifecycle notification API, with `dct:type` set to the proposed taxonomy name `cx-taxo:BatteryPassLifecycleNotificationAPI` and `cx-common:version` set to `1.0`, under the usage purpose `cx.circular.dpp:1` and, once CX-0152 registers it, `cx.circular.dpp.lifecycle:1`.
2. The receiver MUST expose exactly one endpoint per operation of Table 4.3.
3. The sender MUST negotiate a contract for the receiver's asset before the sender sends a notification, as CX-0151 describes. Where a receiver offers no lifecycle notification asset or refuses the contract, the sender MUST NOT send, and MUST record the receiver and the date of the attempt; the duty to send is then met.
4. The sender MUST put in each notification the MessageHeader of CX-0151 with the context of Table 4.3, and the content part of Table 4.4.
5. The sender MUST send one notification per receiver and per passport that Table 4.3 names, MUST address the notification to the BPNL that Table 4.3 names, MUST resolve the BPNL to the receiver's DID through the BPN-DID Resolution Service of CX-0167, and MUST find the receiver's connector through the DID discovery of CX-0018 section 2.6.
6. The receiver MUST NOT change the information of its passport because of a notification, except the steps that sections 2.1.3, 2.1.4, 2.1.5 and 2.1.7 assign to the receiver.
7. The receiver MUST answer a notification that the receiver cannot process with a 4xx or 5xx status and a body whose text states what failed, the reason of the failure and what the sender must do (decision D18).

> *Note (non-normative):* `[live]` CX-0151 requires that a notification API is documented with an OpenAPI specification published on the Tractus-X Swagger space and that its name is defined in the Catena-X taxonomy. The author publishes the OpenAPI specification and requests the taxonomy name when the expert group accepts the proposal.

Table 4.3, operations:

| Operation and endpoint | Context (proposed) | Sender | Receiver (element holding the BPNL) |
|---|---|---|---|
| `NewPassportIssued` | `BatteryPass-BatteryPassLifecycleNotificationAPI-NewPassportIssued:1` | the second-life operator | MUST: the data provider of each original passport (`PassportLink.dataProviderBpnl`) |
| `BatteryRepaired` | `BatteryPass-BatteryPassLifecycleNotificationAPI-BatteryRepaired:1` | the repairer | MUST: the data provider of the passport (the specific asset ID `manufacturerId` of the twin) |
| `BatteryBecameWaste` | `BatteryPass-BatteryPassLifecycleNotificationAPI-BatteryBecameWaste:1` | the waste receiver | MUST: the data provider of the passport (`manufacturerId` of the twin) and the successor that the waste receiver names |
| `PassportEnded` | `BatteryPass-BatteryPassLifecycleNotificationAPI-PassportEnded:1` | the recycler | MUST: the data provider of the passport (`manufacturerId` of the twin), the manufacturer that the nameplate element ManufacturerIdentifier names, and the successor from whom the recycler received the battery; MAY: the data provider of each predecessor passport (`PassportLink.dataProviderBpnl`) |

Table 4.4, content of each operation (JSON, all properties mandatory unless marked):

| Operation | Property | Type |
|---|---|---|
| `NewPassportIssued` | `passportIdentifier` of the new passport | string |
| | `catenaXId` of the new twin | string, UUID version 4 |
| | `operation` | string, one of the four values of `PassportLink.operation` |
| | `operationDate` | string, date and time (RFC 3339) |
| | `predecessorPassportIdentifier`, the one original passport of the receiver that the notification concerns | string |
| `BatteryRepaired` | `passportIdentifier` | string |
| | `repairDate` | string, date and time (RFC 3339) |
| | `repairCertificateCatenaXId` | string, UUID version 4, the twin of the CX-0131 repair certificate |
| `BatteryBecameWaste` | `passportIdentifier` | string |
| | `successorBpnl` | string, BPNL |
| | `successorRole` | string, one of the three values of `WasteResponsibility.successorRole` |
| | `date` | string, date and time (RFC 3339) |
| `PassportEnded` | `passportIdentifier` | string |
| | `recyclingDate` | string, date and time (RFC 3339) |
| | `recyclerBpnl` | string, BPNL |
| | `materialRecyclingCertificateCatenaXId` (optional) | string, UUID version 4, the twin of the CX-0131 material recycling certificate |

## 5 PROCESSES

> *This section is non-normative*

The processes repeat the obligations of sections 2 to 4 in their order of execution.

- **Issuing a new passport (LC-3a, LC-3b):** the second-life operator issues the new passport and twin (2.1.1), publishes the lifecycle submodel (2.1.2), and sends NewPassportIssued to the data provider of each original passport (4.3); each data provider may add a forward link (2.1.3).
- **Repair:** the repairer registers the repair certificate and sends BatteryRepaired (2.1.4); the data provider sets the status "re-used".
- **Waste status:** the waste receiver sends BatteryBecameWaste with the successor (2.1.5); the data provider sets the status and records the successor.
- **Ending a passport (LC-5a):** the recycler registers the material recycling certificate and sends PassportEnded to the receivers of Table 4.3 (2.1.7); the data provider records the end.
- **Sharing under a contract (LC-1, LC-2, LC-5b):** the application acting for the purchaser offers the individual battery information under the usage purpose of Table 2.2; the consumer negotiates the contract; the connector transfers the information; the data provider withdraws the access when the battery changes purchaser.

## 6 REFERENCES

### 6.1 NORMATIVE REFERENCES

- CX-0002 Digital Twins in Catena-X; CX-0003 SAMM Aspect Meta Model; CX-0018 Dataspace Connectivity; CX-0126 Industry Core: PartType; CX-0127 Industry Core: Part Instance; CX-0151 Industry Core: Basics 1.1.0; CX-0152 Policy Constraints for Data Exchange; CX-0160 Battery Passport Data Management 1.1.0 (base and CX-0160-3); CX-0167 BPN-DID Resolution Service; in the versions of the CX-Neptune release.
- CX-0131 Circularity Core 1.1.1.
- IDTA-02035-1 Digital Nameplate for Battery Passport 1.0.0; IDTA-02035-2 Handover Documentation for Battery Passport 1.0.0; IDTA-02035-3 Carbon Footprint for Battery Passport 1.0.0; IDTA-02035-4 Technical Data for Battery Passport 1.0.0; IDTA-02035-5 Product Condition for Battery Passport 1.0.0; IDTA-02035-6 Material Composition for Battery Passport 1.0.0; IDTA-02035-7 Circularity for Battery Passport 1.0.0; IDTA-02099-1 DPP Metadata 1.0.0.
- RFC 9535 JSONPath: Query Expressions for JSON.

### 6.2 NON-NORMATIVE REFERENCES

- Regulation (EU) 2023/1542, consolidated text 02023R1542-20260813.
- Draft Commission Implementing Regulation under Art. 77(9) of Regulation (EU) 2023/1542, Ares(2026)9814179.
- Commission Delegated Regulation (EU) 2025/606.
- Directive 2008/98/EC, consolidated text 02008L0098-20251016.
- Regulation (EU) 2023/2854 (Data Act).
- Regulation (EU) 2024/1781 (ESPR) and Commission Implementing Regulation (EU) 2026/1778.
- DIN DKE SPEC 99100:2025-02.
- EN 18219:2026, EN 18221:2026, EN 18222:2026 and EN 18223:2026 (not stored; citations pending).

### 6.3 REFERENCE IMPLEMENTATIONS

A reference implementation is in preparation by the author.

## Annex A: Conformity Assessment Criteria

> General information: cxId CX-0160-4 (proposed); name Battery Passport after the First Passport; capability Battery Passport Data Management; version 0.8 (draft); release CX-Neptune.

Every criterion has the assessment method Inspection unless the criterion names another, and is not automatable unless the criterion says so.

| Identifier | Type | Topic | Requirement | Proof of conformity |
|---|---|---|---|---|
| CX-0160-4-CAC-001 | MUST | New passport | section 2.1.1 items 1 to 3 | Second-life operator: a new passport for each of the four operations, with a new `digitalProductPassportId`, and the battery identifier kept or renewed as item 3 states. |
| CX-0160-4-CAC-002 | MUST | Digital twin | section 2.1.1 items 4, 5 and 7, Table 2.1.1 | Second-life operator: a new PartInstance twin with the keys of Table 2.1.1, the SerialPart aspect and every model of CX-0160-3; the original twins unchanged (Observation of the original data provider's registry). |
| CX-0160-4-CAC-003 | MUST | Model elements | section 2.1.1 item 6, Table 2.1.2 | Second-life operator: the elements of Table 2.1.2 set to its own values; the rated capacity, capacity fade, power fade and expected lifetime updated. |
| CX-0160-4-CAC-004 | MUST | Predecessor links | section 2.1.2 | Second-life operator: the lifecycle submodel with one link per original passport, five mandatory properties each; the part relationships in SingleLevelBomAsBuilt only. |
| CX-0160-4-CAC-005 | MUST | Forward link | section 2.1.3 items 2 to 4 | Data provider: the successors submodel offered as its own data asset to the authorised recipients and the market surveillance authorities only; the last LifeCycleStage of an original passport kept. Every participant: no write into a passport of which the participant is not the data provider. |
| CX-0160-4-CAC-006 | MUST | Status and repair | section 2.1.4, Table 2.1.4 | Data provider: the LifeCycleStage value after each event of Table 2.1.4, and the passport and its identifiers kept in each "same passport" row. Repairer: the repair certificate registered and BatteryRepaired sent. |
| CX-0160-4-CAC-007 | MUST | Waste status | section 2.1.5 items 1, 3, 4 and 5 | Waste receiver: BatteryBecameWaste sent with the successor. Data provider: status "waste" on the existing passport, the successor recorded in the lifecycle submodel, the twin readable, and no change after the waste status without the successor's authorisation except the record of the end. |
| CX-0160-4-CAC-008 | MUST | Donors | section 2.1.6 items 1 and 2 | Donor data provider: the donor passport readable after the remanufacturing; the status "waste" set after BatteryBecameWaste for the remaining parts. |
| CX-0160-4-CAC-009 | MUST | End of the passport | section 2.1.7 items 2 to 4 | Recycler: PassportEnded sent to the receivers of Table 4.3. Data provider: `endOfPassport` recorded; no other change of the ended passport. |
| CX-0160-4-CAC-010 | MUST | Access | section 2.2 items 1, 2, 5, 6 and 7 | Data provider: `cx.circular.dpp:1` on each offer, and the purpose of Table 2.2 once registered; the product condition submodel and the lifecycle submodel offered only to the persons of section 2.2 items 2 and 7 once the Art. 77(9) act applies; the access withdrawn after a change of purchaser. |
| CX-0160-4-CAC-011 | MUST | Access before the Art. 77(9) act | section 2.2 item 4 | Data provider: the access of CX-0160 1.1.0 and of the data provider's documented policy applied (Inquiry). |
| CX-0160-4-CAC-012 | MUST | Notification API | section 4.3 items 1 to 6, Tables 4.3 and 4.4 | Receiver: one asset with the taxonomy name and the usage purpose, one endpoint per operation, no change of the passport beyond sections 2.1.3, 2.1.4, 2.1.5 and 2.1.7, and a descriptive error body on every 4xx or 5xx answer. Sender: contract negotiation before sending, the record of each receiver without an asset, one notification per receiver and passport, the MessageHeader with the contexts of Table 4.3, the content of Table 4.4, the receiver resolved through CX-0167 and CX-0018 section 2.6. |
| CX-0160-4-CAC-013 | MUST | Data assets | section 4.1 | Data provider: each submodel of section 3 registered as a data asset with its `dct:type` and semantic identifier. |
| CX-0160-4-CAC-014 | SHOULD | Certificates | sections 2.1.1 item 8, 2.1.5 item 2, 2.1.7 item 1 | Second-life operator, waste receiver, recycler: the CX-0131 reuse, remanufacturing, waste and material recycling certificates registered as CX-0131 section 2.4.2.1 states. |
| CX-0160-4-CAC-015 | SHOULD | Persistence | section 2.1.7 item 5 | Data provider: the ended passport readable for the persons who could read it before the end. |
| CX-0160-4-CAC-016 | MUST | Access map | section 2.2 items 8 to 12, section 3.4 | Data provider: the access map offered on the PartType twin of the battery model under `cx.circular.dpp:1`, with one entry for every field of the seven IDTA-02035 aspect models that the data provider serves and the eight properties of section 3.4.2; the lifecycle submodel and the successors submodel each offered as a data asset of its own with its own access policy; a new `mapVersion` after a new version of Annex XIII or of the Art. 77(9) act. Every participant that serves battery passport data: each field served only under the access group of its entry. |

The proposed change of section 4.2 of the base document (section 4.2 of CX-0160-4) needs a criterion in the base criteria file of CX-0160, which the expert group adds with the change.

## Annex B: Differences with the regulation and open points

Annex B groups the differences between CX-0160-4 and the stored legal texts, and the points that the stored texts leave open, into five topics. Each topic first describes what the texts state and what CX-0160-4 does, and then names the open points. Each point keeps its number, which other sections of CX-0160-4 cite.

### B.1 Access to the individual battery information

Annex XIII point 4 of Regulation (EU) 2023/1542 makes the information of an individual battery (performance and durability values, state of health, battery status, usage data) accessible only to persons with a legitimate interest, and the draft implementing act under Art. 77(9) names the purchaser of the battery and a third party acting on the purchaser's behalf as those persons. CX-0160-4 offers that information to the purchaser, lets the purchaser share the information for a resale and with the original issuer under a contract (LC-1, LC-2, LC-5b), and decides who reads a forward link and who authorises wider sharing. The points below name where the draft act, the Catena-X participant model or the IDTA models leave a question open.

- **Point 1: Draft Art. 2(4) names no exception for the original issuer.** Draft Art. 2(4) of the Art. 77(9) act forbids the purchaser to share the individual battery information outside its exceptions, which do not name the original issuer of the passport. LC-1 and LC-5b rest on Art. 78(c) of Regulation (EU) 2023/1542, on the authorisation of draft Art. 2(4)(e), and on the Data Act. The final act may add the exception, leave it out, or change the exceptions.
- **Point 2: Draft Art. 2(1) limits the purposes of use.** Draft Art. 2(1) limits the use of the information to evaluating the status, residual value and further use of the battery and to the circular operations; draft Art. 2(3) limits the retention. The purpose of LC-5b, the evaluation of the battery's durability for the original issuer's reliability models, fits the evaluation of the battery's status only in part, so the difference stays open.
- **Point 8: The purchaser is often a private person.** Catena-X participants are companies, so the purchaser reaches the dataspace through an application acting on the purchaser's behalf (draft Art. 1(4)(b)).
- **Point 9: The access to the forward link is a reading of CX-0160-4.** Annex XIII point 4 does not list a link to a new passport. CX-0160-4 offers the forward link to the recipients that the original issuer authorises and to the market surveillance authorities, because the link reveals the status change of the original battery.
- **Point 11: The IDTA digital nameplate mixes public and restricted elements.** LifeCycleStage is Annex XIII point 4 information, while most nameplate elements are public, and one submodel asset carries one access policy. The access map of section 3.4 answers how the data provider delivers the access group of each field. The question whether the IDTA changes the aspect models that mix access groups stays open.
- **Point 14: Who authorises the sharing of a new passport's information.** The second-life operator authorises the sharing of the individual battery information of its new passport, and the original manufacturer authorises the sharing of the model information of Annex XIII point 2 that the new passport keeps (draft Art. 2(4)(e)).
- **Point 19: No rule covers a payload without its restricted fields.** A payload that omits a mandatory restricted field is not valid against the schema of its IDTA aspect model. At least 10 restricted fields are mandatory in 4 of the 7 aspect models of IDTA-02035 version 1.0.0. A recipient therefore reads an aspect model whole or not at all, unless the IDTA or the expert group agrees a rule on partial payloads.

### B.2 Identity of the battery and of its passports

Art. 77(7) gives a battery placed on the market again after preparation for re-use, preparation for repurposing, repurposing or remanufacturing a new passport, and Art. 77(3) links the QR code to one unique identifier. DIN DKE SPEC 99100 separates the battery identifier (§6.1.2.2) from the passport identifier (§6.1.2.1). CX-0160-4 gives every new passport a new passport identifier, keeps the battery identifier for one battery, and keeps the battery model of the original battery as the reference of the design. The points below name the readings that no stored text states.

- **Point 6: The registration of a new passport is open.** Art. 77(10) requires the economic operator placing the battery on the market to upload the unique identifier in the registry; Implementing Regulation (EU) 2026/1778 links new versions of one passport to the original registration identifier and leaves the actions of remanufacturers to other Union law.
- **Point 7: The battery identifier follows DIN DKE SPEC 99100.** Art. 77(3) names one unique identifier to which the QR code links; DIN DKE SPEC 99100 §6.1.2.2 a) reads it as a persistent battery identifier and §6.1.2.1 a) expects several passports for one physical battery. CX-0160-4 keeps the battery identifier for one battery and renews it for a battery made from several batteries; no stored text states the renewal.
- **Point 12: The battery model of a battery made from batteries of different models is open.** Decision D7 keeps the battery model of the original battery; for a battery remanufactured from batteries of different models, the second-life operator chooses one of the original models, which no stored text states.
- **Point 15: No status value marks a superseded original passport.** Annex XIII point 4(c) offers five values, and Art. 77(4) requires the passport to be up to date; CX-0160-4 keeps the last value of the original passport and shows the supersession through the predecessor link and the optional forward link.

### B.3 Links and records of the battery's later life cycles

Art. 77(7) requires the new passport to be linked to the passport or passports of the original battery or batteries, and DIN DKE SPEC 99100 requires the repairs and the updated performance values to be recorded. CX-0160-4 carries the predecessor links in the lifecycle model, offers an optional forward link, records a repair by the CX-0131 repair certificate, and makes the second-life operator update the performance and durability values. The points below name what the stored texts require only in part or not at all.

- **Point 3: No text requires the forward link.** Art. 77(7) and Art. 11(d) of Regulation (EU) 2024/1781 require only the predecessor link.
- **Point 10: No Catena-X text records the removal of a module from a built battery.** CX-0127 defines the bill of materials as built and as planned; the bill of materials as maintained is not standardised. The donor's data provider therefore keeps the as-built bill of materials unchanged.
- **Point 16: No model carries the repair history of DIN DKE SPEC 99100 §6.1.3.7 f).** CX-0160-4 uses the CX-0131 repair certificate as the record of a repair, because the eight models of CX-0160-3 carry no repair history.
- **Point 18: The performance values of a treated battery replace the values of the original model.** DIN DKE SPEC 99100 clauses 6.7.2.2 e), 6.7.2.4, 6.7.3.4 and 6.7.6.2 d) require the values to be updated at a new placing on the market; decision D7 keeps the battery model as the reference of the design, while the new passport carries the updated values.

### B.4 Waste status, recycling and the end of the passport

Art. 77(7), second subparagraph, transfers the responsibility for the passport to a successor when the battery becomes waste, Art. 75(5) makes the treatment operators and the recyclers report the recycling results to the competent authorities, and Art. 77(8) ends the passport after recycling. CX-0160-4 records the successor and the end of the passport in the lifecycle model, and notifies the producer and the successor of the recycling. The points below name where CX-0160-4 goes beyond, or differs from, the regulation.

- **Point 4: No text obliges the recycler to notify a producer.** PassportEnded rests on the producer's financing of the treatment (Art. 56(4)(a)) and of the data gathering and reporting (Art. 56(4)(d)), and on the contract on the producer's notification asset.
- **Point 5: The end of the passport differs from Art. 77(8).** Art. 77(8) says the passport "shall cease to exist" after recycling, while section 2.1.7 records the end and keeps the ended passport readable; Art. 78(e) keeps the passport available after its economic operator ceases to exist. The persistence period comes from EN 18221, and the `dppStatus` value from EN 18223, which are not stored.
- **Point 13: A battery placed on the market in several Member States has a producer per Member State (Art. 3(1)(47)).** The waste receiver names, in BatteryBecameWaste, the successor of the Member State where the battery became waste, and the recycler notifies that successor; the manufacturer that the nameplate names can differ from the producer when an importer placed the battery on the market.
- **Point 17: The data provider records the end of the passport without an authorisation of the successor.** Art. 78(c) lets the passport data be stored by the responsible operator or by an operator it authorises; CX-0160-4 lets the data provider record the end of the passport in every case, because the end follows from the recycling (Art. 77(8)) and a passport whose successor gives no authorisation would otherwise never show its end.
### B.5 The lifecycle notification API across the connector

Section 4.3 defines the lifecycle notification API, which the participants offer as an asset of their connectors, and section 4.3 item 7 requires a descriptive error body on every refusal. The point below names what a connector release leaves open.

- **Point 20: The descriptive error body across the connector.** Section 4.3 item 7 requires the receiver of a lifecycle notification to answer every refusal with a descriptive error body (what failed, the reason, and what the sender must do). The provider data plane of Tractus-X EDC 0.13.0 passes an answer 200 of the receiving backend through unchanged and answers every other status of the backend with 500. The 500 answer does not carry the backend's body. It carries either a text of the form 'Received code transferring HTTP data: 405 - Method Not Allowed.' or an empty error list, and the data plane logs 'Failed to read data from source: NOT_FOUND'. A sender that uses this release therefore receives neither the refusal code nor the descriptive body. It cannot tell a refused notification from a failure of the receiver, and it repeats a refused notification. The open point asks the Digital Product Passport Expert Group whether the data plane of the Catena-X connector shall pass the status and the body of a backend refusal through to the consumer for notification APIs, or whether the notification API shall answer every refusal with 200 and a refusal object in the body. Until this is decided, a sender reads the code from the error text of the data plane where the text names one, and treats an answer without a code as a failed transfer. The public file `tck/README.md` of the reference implementation repository battery-passport-after-first-life, section "The second run of phase P7", records the observed answers.

## Annex C: Decisions

**D1.** The predecessor links are carried in a new Catena-X model. The proposal rejects a change of the generic digital product passport model, whose `predecessor` holds one identifier for every product; an extension of the IDTA DPP Metadata, which belongs to the IDTA and to EN 18223 and would need their process; and the CX-0131 certificates, which certify an operation on one part instance and carry no list of original passports.

**D2.** The new passport gets a new PartInstance twin. The proposal rejects a new submodel on the original twin, because the original twin is registered in the Digital Twin Registry of the original data provider under CX-0127 and CX-0002, and the second-life operator is not that data provider.

**D3.** Only the responsible operator writes into a passport, and the forward link is optional. The proposal rejects a forward link written by the second-life operator, because Art. 77(4) makes the economic operator placing the battery on the market responsible for the passport and Art. 78(c) makes that operator store the passport data; Art. 78(f) restricts the rights to modify information by the access rights.

**D4.** The recycling result goes to the producer and the responsible operator of the ended passport, and to the original issuers of the predecessor passports under contract. The proposal rejects a notice passed from operator to operator along the predecessor links, which fails when an operator in between leaves the dataspace, and subscriptions copied to each new passport, which need a forward link on every passport.

**D5.** The lifecycle notifications form a second notification API under CX-0151 with the four operations of Table 4.3: NewPassportIssued, BatteryRepaired, BatteryBecameWaste and PassportEnded. The proposal rejects new event types in the Digital Twin Event API, whose events concern submodels, not passports.

**D6.** The product condition submodel is offered to the purchaser and its agent, and the purchaser shares further under draft Art. 2(4). The proposal rejects the access of every used-battery operator, because draft Art. 1(4) names only the purchaser and its agent.

**D7.** The new passport keeps the battery model of the original battery as the reference of the design, holds its own battery category, and carries updated performance and durability values. The proposal rejects a new battery model of the second-life operator, because the operations treat the battery and do not design a new model; Art. 45(2) lets the category change, and DIN DKE SPEC 99100 clauses 6.7.2.2 e), 6.7.2.4, 6.7.3.4 and 6.7.6.2 d) require the updated values (Annex B point 18; point for discussion D-2 of Annex D).

**D8.** After the waste status, the data provider of the twin keeps the registration and changes the passport only under the successor's written authorisation (Art. 77(4)). The proposal rejects a new twin at the waste status, because the waste status issues no new passport (Art. 77(7)), and a transfer of the registration to the successor's registry, which CX-0002 does not define.

**D9.** The lifecycle rules form a new use case document CX-0160-4. The proposal rejects moving the lifecycle rules into the base document; the base document changes only in section 4.2, where the rule is common to every use case.

**D10.** The IDTA DPP Metadata carries the passport identifier and the battery identifier; the lifecycle model carries the successor and the end of the passport. The proposal rejects the successor in `economicOperatorId`, which holds one economic operator in the format of EN 18219, and the end in `dppStatus`, whose values EN 18223 defines and the proposal cannot cite.

**D11.** The passport identifier is new for every new passport; the battery identifier persists for one battery and is renewed for a battery made from several batteries. The proposal rejects a new battery identifier after every operation, which contradicts DIN DKE SPEC 99100 §6.1.2.2 a).

**D12.** The waste receiver triggers the waste status with BatteryBecameWaste and names the successor. The proposal rejects a status set by the original issuer without a notice, because the battery becomes waste in the hands of its holder, outside the original issuer's view.

**D13.** A sender finds the receiver's connector through CX-0167 and the DID discovery of CX-0018 section 2.6. The proposal rejects the central discovery of CX-0001, which CX-Neptune deprecates.

**D14.** A repair sets the status "re-used" and records "repaired" in the repair history. The proposal rejects an unchanged status after a repair, which DIN DKE SPEC 99100 §6.1.3.7 g) contradicts.

**D15.** Only the data provider of a passport writes into the passport (point for discussion D-1 of Annex D), for the responsible operator before the waste status and under the successor's written authorisation after it. The proposal rejects writes by the original issuer, the responsible operator and the successor in parallel, because Art. 78(c) makes one operator store the passport data and CX-0127 makes one data provider register the twin.

**D16.** The recycler addresses PassportEnded (point for discussion D-4 of Annex D) to the data provider of the passport, to the manufacturer that the public nameplate names and to the successor from whom the recycler received the battery. The proposal rejects a producer field in the lifecycle submodel, because the recycler cannot read the restricted submodel, while the nameplate is public and the recycler knows its own supplier.

**D17.** A repair is reported by BatteryRepaired, recorded by the CX-0131 repair certificate, and issues no new passport (point for discussion D-3 of Annex D on module swaps). The proposal rejects a status change without a notice, because the repairer, not the data provider, performs the repair.

**D18.** The receiver answers a notification that the receiver cannot process with a body whose text describes the failure, its reason and the sender's next action. The proposal rejects the optional error body of the Industry Core KIT, because a sender that receives only a status code cannot tell a rejected contract from a malformed content or an unknown passport.

## Annex D: Points for discussion in the Expert Group

> *This annex is non-normative*

The author approved every decision of Annex C and asks the Catena-X Digital Product Passport Expert Group to discuss four points.

**D-1. Should the purchaser of the battery, a person with a legitimate interest, change the lifecycle status?** Decision D15 lets only the data provider of a passport write into the passport. The purchaser reads the individual battery information (draft Art. 77(9) act, Art. 1(4)) and reaches the data provider only through other participants, for example through the waste receiver's BatteryBecameWaste. The purchaser, however, decides events that change the status: the holder discards the battery as waste (Directive 2008/98/EC, Art. 3(1)), and the purchaser decides a direct re-use or a resale. `[live]` Art. 14(2) of Regulation (EU) 2023/1542 gives the person who legally purchased the battery, "including independent operators or waste management operators", read-only access to the battery management system data for "facilitating the preparation for re-use, preparation for repurposing, repurposing or remanufacturing of the battery"; the draft Art. 77(9) act does not give those operators the same data through the passport. The questions: should the purchaser, or an application acting for the purchaser, report status events to the data provider through the lifecycle notification API, and should CX-0160-4 align the passport access with Art. 14(2)?

**D-2. What performance information does the first-life manufacturer provide for safe second-life operations?** Decision D7 keeps the original battery model as the reference of the design and lets the second-life operator update the performance and durability values. The stored texts give the first-life manufacturer four related duties. `[live]` Recital 68 says that the manufacturer "should provide sufficiently detailed information on the intended use of the battery to allow its correct and safe placing on the market, putting into service, use and waste management, including possible repurposing". Art. 12(2), last subparagraph, requires the technical documentation of a stationary battery energy storage system to "be reviewed if a battery is prepared for re-use, prepared for repurposing, remanufactured or repurposed". Art. 14(2)(c) opens the battery management system data on state of health and expected lifetime for second-life operations. Art. 74(3) makes producers provide battery-model-specific treatment information to the operators that prepare batteries for re-use or for repurposing. No stored text names performance values for safe second-life operations in the technical documentation. The question: should CX-0160-4 require the data provider of the first passport to offer the parameters of Annex VII and the safety information of the technical documentation to the second-life operator under a contract?

**D-3. How is a module swap recorded in a repair?** A repair is recorded and issues no new passport (decision D17, Table 2.1.4). When the modules of a battery are traceable, a repair that replaces a module changes the module serial numbers that the battery contains, and the swap must be recorded. CX-0127 defines the bill of materials as built and as planned, and no Catena-X text records a change after the battery is built (Annex B point 10). The point is linked to the binding of a passport identifier to a hardware identity, which the author answers in the questions to the Catena-X Association. The questions: should the repair record (the CX-0131 repair certificate, or a bill of materials as maintained) carry the removed and the inserted module serial numbers, and which participant signs the record?

**D-4. The receivers of PassportEnded: rationale and implementation.** Rationale: no stored text obliges the recycler to notify a producer (Annex B point 4); the producer finances the treatment and the reporting (Art. 56(4)(a) and (d)) and needs the recycling result for its producer responsibility organisation (Art. 57(5)); after a second-life operation the producer is the second-life operator (Art. 56(2)). Implementation (decision D16): the recycler MUST notify the data provider of the passport, the manufacturer that the public nameplate names and the successor from whom the recycler received the battery; the recycler MAY notify the data provider of each predecessor passport; a sender records the attempt when a receiver offers no notification asset. The questions: is the list of receivers complete, does the nameplate manufacturer reach the producer when an importer placed the battery on the market (Annex B point 13), and should the notice to the predecessor passports become a SHOULD?

## NOTICE

This work is licensed under the [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/legalcode).

- SPDX-License-Identifier: CC-BY-4.0
- SPDX-FileCopyrightText: 2026 Ichnos Protocol Pte. Ltd.
- SPDX-FileCopyrightText: 2026 Contributors to the Eclipse Foundation
- Source URL: https://github.com/Ichnos-Protocol/battery-passport-after-first-life/blob/main/docs/proposal/CX-0160-4_Battery_passport_after_the_first_passport.md
