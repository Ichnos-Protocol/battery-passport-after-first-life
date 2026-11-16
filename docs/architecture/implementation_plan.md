# Implementation specification of the standalone reference server

| | |
|---|---|
| Status | Draft for the owner's decision on the three open decisions of §12.1; not handed over |
| Version | 1 |
| Date | 2026-11-16 |
| Owner | the owner of this repository, the author of the proposal CX-0160-4 (Battery Passport after the First Passport) |
| Implementer | an implementation agent, which executes this specification literally |
| Substrate | this repository, branch `main`, at the commit that adds this specification; the last commit before this specification is 3ea025b ("docs: the proposal CX-0160-4 draft 0.6, methodology, citation catalogue and lessons") |
| Proposal | draft 0.7 of 2026-11-16, `docs/proposal/CX-0160-4_Battery_passport_after_the_first_passport.md` |
| Verified | 2026-11-16, against the working tree of this repository and the registry of `requirements/` |

## 1. How to read this document

- **Must and may.** The word "must" states what the implementer builds. The word "may" states a permission. A sentence without either word describes a fact of the repository or of the proposal.
- **Precedence.** The requirements registry of `requirements/` decides every question (`CLAUDE.md`, "The registry is the only source of truth"). The proposal `docs/proposal/CX-0160-4_Battery_passport_after_the_first_passport.md` defines the interfaces. This specification states how the reference server implements both. When this specification and the registry differ, the registry wins, and the implementer stops and reports the difference.
- **The `[live]` mark.** A claim marked `[live]` was read in the named file of this repository on 2026-11-16.
- **The mark "not verified against a stored text".** A claim with this mark rests on no text that `sources/` stores. The value of such a claim is a configuration value of §9.6, and phase P7 (§11.7) verifies the value before the connector binding runs.
- **The recommended options.** §12.1 holds three open decisions of the owner: OD-1, OD-2 and OD-3. The specification is written on the recommended option of each open decision. A paragraph that depends on an open decision names the open decision, so that another choice changes only the named paragraphs.
- **A moved substrate.** When a path that this specification names as existing is absent, the implementer stops and reports the path. The implementer never creates a second file for the same concept.
- **Identifiers.** A requirement is named by its identifier and its title. A conformance criterion is named CAC-001 to CAC-016, short for CX-0160-4-CAC-001 to CX-0160-4-CAC-016 of Annex A of the proposal. A decision of the owner in the registry is named Q and a number. A decision of this specification is named D and a number. An interface of the reference server is named by an endpoint id that starts with `EP-`.

## 2. Goal

The implementer builds, in this repository only, six results that a test checks:

1. **G1, the contract.** The file `docs/api/openAPI.yaml` defines the lifecycle notification API of section 4.3 of the proposal in OpenAPI 3.1.0, with exactly four POST operations, and the JSON schema files of `docs/api/schemas/` define the message of each operation and the error body.
2. **G2, the models.** The folder `models/` holds the three proposed aspect models BatteryPassportLifecycle, BatteryPassportSuccessors and BatteryPassportAccessMap in the layout of the Tractus-X semantic model repository, and each model passes the validation of the SAMM command line tool 2.11.1.
3. **G3, the reference server.** The folder `server/` holds a server on Node.js 24, Express and PostgreSQL, written as ES modules, that implements every requirement of §5.1 and §5.2.
4. **G4, the conformance test kit.** The folder `tck/` holds one test file per criterion CAC-001 to CAC-016, and the sixteen test files run with one test code against the in-process binding and against the connector binding.
5. **G5, the documentation.** The repository holds the documentation files that the process requirements of §5.3 name.
6. **G6, the continuous integration.** The workflows of `.github/workflows/` run the tests with a PostgreSQL service, the Spectral linter on the OpenAPI file, the SAMM command line tool 2.11.1 on the models, the checks of `scripts/`, CodeQL and TruffleHog, and `.github/dependabot.yml` configures Dependabot.

## 3. Scope boundary

### 3.1 In scope

- The four lifecycle notifications NewPassportIssued, BatteryRepaired, BatteryBecameWaste and PassportEnded: the sending side, the receiving side and the record of each attempt.
- The lifecycle steps of a passport after its first passport: the new passport after one of the four operations, the predecessor links, the forward link, the repair entry, the waste status with its successor, the end of the passport, and the change of purchaser without a new passport.
- The three proposed aspect models and their payloads: the lifecycle submodel, the successors submodel and the access map.
- The registration of the PartType twin of a battery model and of the PartInstance twin of a passport through the twin registry contract of §9.2.6.
- The connector asset of the lifecycle notification API and the data offers of the submodels through the offer contract of §9.2.5.
- The PostgreSQL schema of §9.4 with its triggers and policies.
- The conformance test kit, the documentation files and the workflows of §2.

### 3.2 Out of scope, with owner and reason

| Item | Owner | Reason |
|---|---|---|
| The requirements of §5.4 | the owner of this repository | §5.4 states the reason of each group |
| The three items that decision Q-202 (the carrier for lifecycle data the aspect models lack) leaves open: the history of the responsible economic operators, the original placing date, and the performance and durability values at each change of status | the owner of this repository | The answer of decision Q-202 names no carrier for the three items. The reference server therefore serves none of the three items in an aspect model (D5) |
| The resolution of a receiver through the BPN-DID Resolution Service of CX-0167 and the DID discovery of CX-0018 section 2.6 | the owner of this repository | No stored text describes a service that the test kit can start. D11 states the holding design |
| A stored copy of the aspect models IDTA-02035-2, IDTA-02035-3, IDTA-02035-6 and IDTA-02035-7, and of the shared models that the three proposed models import | the owner of this repository | `sources/IDTA/` stores four of the eight models of CX-0160-3 `[live]`. D28 and D32 state how the server and the model validation work without the other texts |
| The request to add the three proposed models to the Tractus-X semantic model repository, the request for the taxonomy name `cx-taxo:BatteryPassLifecycleNotificationAPI`, and the registration of the proposed usage purposes of Table 2.2 of the proposal | the owner of this repository | Section 3.5 and the note of section 4.3 of the proposal file the requests once the expert group accepts the proposal |
| The file `DEPENDENCIES` of the Eclipse Dash License Tool | the owner of this repository | The tool contacts the servers of the Eclipse Foundation. The owner runs the tool before the pull request to Eclipse Tractus-X. The need for the file is not verified against a stored text |
| The registry changes of §5.7 | the owner of this repository | The owner approves each change of a requirement (`requirements/method.md`, section 10) |
| Commit, push, pull request and release | the owner of this repository | The owner orders each of the four actions |
| A user interface | none | The architecture record names EL-FRONTEND (a user interface that calls the HTTP API) as outside this repository `[live]` |
| A connector, a Digital Twin Registry and a wallet | the operator of each company | The reference server uses a stack and does not contain one (`requirements/method.md`, section 2) |

### 3.3 Non-goals

- The reference server changes none of the eight models of CX-0160-3 and adds no status value to the five values of the IDTA digital nameplate 1.0.0: `original`, `repurposed`, `re-used`, `remanufactured` and `waste` `[live]` (`sources/IDTA/io.admin-shell.idta.batterypass.digital_nameplate/1.0.0/BatteryStatus_enum.ttl`).
- The reference server builds no marketplace of used batteries and no passport screen.
- The reference server composes no payload of the eight models of CX-0160-3 from single database columns. The data provider supplies each payload (D28).
- The reference server calculates no recycling efficiency and no recovery of materials.

### 3.4 Paths that must not change

- `sources/`: every file. The check `node scripts/check-sources.mjs` compares each file with `sources/SOURCES.json`.
- `LICENSE`, `LICENSE_non-code`, `NOTICE.md`, `SECURITY.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md` and `AUTHORS.md`.
- `docs/proposal/CX-0160-4_Battery_passport_after_the_first_passport.md`, `docs/citation-catalogue.md` and `docs/lessons-from-a-first-implementation.md`.
- `requirements/`, except the field `implementation` of the software requirements of §5.2 in phase P8 (§11.8).
- `scripts/check-license-headers.mjs`, `scripts/check-sources.mjs`, `scripts/check-private-references.mjs`, `scripts/requirements-check.mjs`, `scripts/lib/requirementsRules.mjs` and `scripts/spec_gate_check.py`.

## 4. Users and success measures

| User | What the user does with the result | Measure |
|---|---|---|
| A member of the Catena-X Digital Product Passport Expert Group | reads the OpenAPI file and the three models beside the proposal | `docs/api/openAPI.yaml` passes the Spectral linter with 0 errors, and the three models pass the SAMM command line tool 2.11.1 with 0 errors |
| An implementer of the proposal in another application | runs the conformance test kit against the reference server, then against the other application | the command of §15 item 6 reports `# fail 0` on the in-process binding |
| A Conformity Assessment Body | reads one test per criterion of Annex A of the proposal | `tck/` holds the 16 files `CAC-001.tck.mjs` to `CAC-016.tck.mjs`, and each file names its criterion in its first test title |
| A maintainer of Eclipse Tractus-X | checks the conventions of the Tractus-X Release Guidelines | the four checks of §15 item 1 print 0 problems, 0 files without a license header or NOTICE section, 0 unregistered or changed source files, and 0 private references |
| The owner of this repository | traces each requirement to its file and its test | every table entry of §5.1 and §5.2 names a test, and `node scripts/requirements-check.mjs` reports 0 problems |

## 5. Requirements and constraints

The registry of `requirements/` holds 80 system requirements, 102 software requirements and 18 process requirements `[live]`. The reference server implements 52 system requirements (§5.1) and 67 software requirements (§5.2). The repository meets the 18 process requirements (§5.3). The reference server does not implement 28 system requirements and 35 software requirements (§5.4).

### 5.1 The system requirements that the reference server implements

The column "Verified by" names the conformance criterion whose test file `tck/CAC-<nnn>.tck.mjs` checks the requirement, or the server test file of §14.2 where Annex A of the proposal holds no criterion for the requirement.

| System requirement | Title | Elements | Verified by |
|---|---|---|---|
| SyR-PASS-005 | Only the responsible or an authorised operator changes the dataset | EL-ACCESS, EL-DATASET, EL-AUDIT, EL-SUBMODELS, EL-CXCLIENT, EL-RDB | CAC-005 |
| SyR-PASS-011 | Every dataset field marked with exactly one access group | EL-DATASET, EL-SUBMODELS | CAC-016 |
| SyR-LIFE-008 | Status waste set on the existing passport, with no new passport | EL-DATASET | CAC-007 |
| SyR-LIFE-011 | Recycling ends the battery's passport dataset | EL-DATASET, EL-CXCLIENT | CAC-009 |
| SyR-LIFE-013 | Preparation for re-use or repurposing admitted only for waste | EL-DATASET | `server/test/lifecycleCatalogue.test.mjs` |
| SyR-LIFE-014 | Repurposing admitted only for a battery that is not waste | EL-DATASET | `server/test/lifecycleCatalogue.test.mjs` |
| SyR-LIFE-015 | Repurposing admitted only for a purpose different from the original | EL-DATASET | `server/test/lifecycleCatalogue.test.mjs` |
| SyR-LIFE-016 | Remanufacturing admitted only for the original purpose | EL-DATASET | `server/test/lifecycleCatalogue.test.mjs` |
| SyR-LIFE-017 | Preparation for re-use admitted only for the original purpose | EL-DATASET | `server/test/lifecycleCatalogue.test.mjs` |
| SyR-LIFE-018 | New passport dataset for a treated battery placed on the market again | EL-DATASET, EL-TWINS | CAC-001 |
| SyR-LIFE-019 | New passport dataset links to each original battery's passport | EL-DATASET, EL-TWINS | CAC-004 |
| SyR-LIFE-020 | Remanufactured dataset links every original battery's passport | EL-DATASET, EL-TWINS | CAC-004 |
| SyR-LIFE-021 | Re-use and repurposing datasets link one or more original passports | EL-DATASET | CAC-004 |
| SyR-LIFE-024 | Original passport kept, superseded relation held in the lineage records | EL-DATASET | CAC-005 |
| SyR-LIFE-026 | New unique identifier attributed by the operator to the new passport | EL-DATASET | CAC-001 |
| SyR-LIFE-028 | New passport dataset takes over the original battery model | EL-DATASET | CAC-003 |
| SyR-LIFE-048 | Responsibility moves to the operator placing the battery again | EL-DATASET, EL-RDB | CAC-003 |
| SyR-LIFE-049 | Responsibility moves to a named successor when the battery becomes waste | EL-DATASET, EL-RDB | CAC-007 |
| SyR-LIFE-051 | Operator placing the treated battery named as its manufacturer | EL-DATASET, EL-RDB | CAC-003 |
| SyR-LIFE-127 | End of a recycled battery's passport made known to the provider | EL-CXCLIENT, EL-BGWORK | CAC-009 |
| SyR-CXD-092 | Notification APIs offered and called with HTTP POST only | EL-BGWORK, EL-CXCLIENT, EL-CONNECTOR, EL-BACKEND | CAC-012 |
| SyR-CXD-096 | Notification endpoints answer 200, or 4xx or 5xx on failure | EL-BACKEND, EL-CONNECTOR | CAC-012 |
| SyR-PASS-230 | Passport data held only for the responsible or an authorised operator | EL-DATASET | CAC-005 |
| SyR-LIFE-129 | Producer of the current passport takes over a waste battery's passport | EL-DATASET | CAC-007 |
| SyR-LIFE-130 | Only the original issuer writes into an original passport | EL-DATASET | CAC-005 |
| SyR-LIFE-131 | New passport delivered as a passport of its own, not a version | EL-DATASET | CAC-001 |
| SyR-LIFE-132 | Remanufacturing donor's passport later accepts the status waste | EL-DATASET | CAC-008 |
| SyR-LIFE-133 | Direct re-use without preparation keeps the passport and its identifier | EL-DATASET | CAC-006 |
| SyR-LIFE-134 | Direct re-use leaves the responsible economic operator unchanged | EL-DATASET | CAC-006 |
| SyR-PASS-231 | New holder after direct re-use recorded as the battery's purchaser | EL-ACCESS | CAC-010 |
| SyR-CXD-221 | New digital twin for a battery that receives a new passport | EL-TWINS | CAC-002 |
| SyR-LIFE-138 | Original issuer notified of a new passport under contract | EL-CXCLIENT | CAC-012 |
| SyR-LIFE-139 | Original issuer may add a forward link to its own passport | EL-DATASET | CAC-005 |
| SyR-PASS-232 | Forward link offered to the issuer's authorised recipients and authorities | EL-DATASET | CAC-005 |
| SyR-PASS-235 | Previous holder loses access to individual battery information after a resale | EL-ACCESS | CAC-010 |
| SyR-LIFE-140 | Battery status unchanged after a direct re-use | EL-DATASET | CAC-006 |
| SyR-LIFE-141 | Passport's data provider, nameplate manufacturer and successor notified of the recycling | EL-CXCLIENT | CAC-009 |
| SyR-LIFE-142 | Predecessor issuers may be notified of the recycling under contract | EL-CXCLIENT | CAC-009 |
| SyR-LIFE-143 | Only the data provider of a passport writes into that passport | EL-DATASET | CAC-005 |
| SyR-LIFE-144 | End of the passport recorded without the successor's authorisation | EL-DATASET | CAC-007 |
| SyR-LIFE-145 | Repair notified to the data provider of the passport | EL-CXCLIENT | CAC-006 |
| SyR-LIFE-146 | Repair certificate held as the record of the repair | EL-DATASET | CAC-006 |
| SyR-LIFE-147 | Waste status notified to the data provider and the named successor | EL-CXCLIENT | CAC-007 |
| SyR-LIFE-148 | Successor, successor's role and date of the waste status held | EL-DATASET | CAC-007 |
| SyR-LIFE-149 | Date of the recycling and the recycler held in the ended passport | EL-DATASET | CAC-009 |
| SyR-LIFE-150 | Last battery status kept on a superseded original passport | EL-DATASET | CAC-005 |
| SyR-LIFE-151 | New passport accepted only with the treated battery's performance values | EL-DATASET | CAC-003 |
| SyR-PASS-236 | Lifecycle record offered only to purchaser, operators and authorities | EL-CXCLIENT | CAC-010 |
| SyR-LIFE-152 | Receiver without a notification asset recorded by the sender | EL-CXCLIENT | CAC-012 |
| SyR-LIFE-153 | One lifecycle notification per receiver and per passport | EL-CXCLIENT | CAC-012 |
| SyR-LIFE-154 | Notification changes a passport only by the receiver's assigned steps | EL-DATASET | CAC-012 |
| SyR-LIFE-155 | Manufacturer identification of a passport never changed after issue | EL-DATASET | `server/test/databaseRules.integration.test.mjs` |

### 5.2 The software requirements that the reference server implements

Every file of the column "Implemented in" and every file of the column "Test" is a planned file of §7.

| Software requirement | Title | Element | Implemented in | Test |
|---|---|---|---|---|
| SwR-DATASET-065 | Every dataset field marked with exactly one Art. 77(2) access group | EL-DATASET | `server/src/submodels/accessMapService.mjs` | `server/test/accessMap.integration.test.mjs` |
| SwR-DATASET-085 | Status waste set on the existing dataset without a new passport | EL-DATASET | `server/src/dataset/lifecycleService.mjs` | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-086 | Change to waste accepted only with a named responsible successor | EL-DATASET | `server/src/dataset/lifecycleService.mjs` | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-087 | Operations admitted only from the statuses the admission table allows | EL-DATASET | `server/src/dataset/lifecycleCatalogue.mjs` | `server/test/lifecycleCatalogue.test.mjs` |
| SwR-DATASET-089 | Recycling ends the dataset, no longer current and closed to change | EL-DATASET | `server/src/dataset/lifecycleService.mjs` | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-091 | Operations admitted by comparing current and original purpose | EL-DATASET | `server/src/dataset/lifecycleCatalogue.mjs` | `server/test/lifecycleCatalogue.test.mjs` |
| SwR-DATASET-092 | Original purpose and each later purpose recorded with their dates | EL-DATASET | `server/src/dataset/lifecycleService.mjs` | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-093 | New dataset created for a treated battery placed on the market again | EL-DATASET | `server/src/dataset/lifecycleService.mjs` | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-094 | New dataset carries a resolving link to the original passport | EL-DATASET | `server/src/dataset/lifecycleService.mjs` | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-095 | Remanufactured dataset links the passport of every original battery | EL-DATASET | `server/src/dataset/lifecycleService.mjs` | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-096 | Re-use and repurposing datasets accepted only with one or more links | EL-DATASET | `server/src/dataset/lifecycleService.mjs` | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-098 | Original dataset kept and marked as superseded by the new one | EL-DATASET | `server/src/dataset/lifecycleService.mjs` | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-100 | New dataset given an identifier different from every original | EL-DATASET | `server/src/dataset/lifecycleService.mjs` | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-102 | New dataset fields set at the issue of a new passport | EL-DATASET | `server/src/dataset/lifecycleService.mjs` | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-116 | Responsibility of a new dataset given to the operator placing it again | EL-DATASET | `server/src/dataset/lifecycleService.mjs` | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-118 | Operator placing a treated battery named its manufacturer | EL-DATASET | `server/src/dataset/lifecycleService.mjs` | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-119 | Changes applied only for the responsible or an authorised operator | EL-DATASET | `server/src/dataset/lifecycleService.mjs` | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-126 | Lifecycle data delivered beside the seven aspects in the decided carrier | EL-DATASET | `server/src/dataset/lifecycleRecordReader.mjs` | `server/test/submodelRoutes.integration.test.mjs` |
| SwR-SUBMODELS-036 | Access marking assigns every served passport field one group | EL-SUBMODELS | `server/src/submodels/accessMapService.mjs` | `server/test/accessMap.integration.test.mjs` |
| SwR-SUBMODELS-052 | Submodel endpoints change no stored data | EL-SUBMODELS | `server/src/routes/submodelRoutes.mjs` | `server/test/submodelRoutes.integration.test.mjs` |
| SwR-TWINS-110 | A new PartInstance twin for a treated battery placed again | EL-TWINS | `server/src/twins/shellDescriptor.mjs` | `server/test/shellDescriptor.test.mjs` |
| SwR-TWINS-111 | New PartInstance links each original battery, resolving in the registry | EL-TWINS | `server/src/twins/shellDescriptor.mjs` | `server/test/shellDescriptor.test.mjs` |
| SwR-BACKEND-147 | Notification endpoints offered with HTTP POST only | EL-BACKEND | `server/src/routes/lifecycleNotificationRoutes.mjs` | `server/test/lifecycleNotificationRoutes.integration.test.mjs` |
| SwR-BACKEND-148 | Notification answered 200 when accepted, 4xx or 5xx otherwise | EL-BACKEND | `server/src/routes/lifecycleNotificationRoutes.mjs` | `server/test/lifecycleNotificationRoutes.integration.test.mjs` |
| SwR-AUDIT-045 | Dataset write decisions recorded with the authorisation relied on | EL-AUDIT | `server/src/audit/auditLog.mjs` | `server/test/audit.integration.test.mjs` |
| SwR-ACCESS-088 | Passport dataset writes only by the responsible or authorised operator | EL-ACCESS | `server/src/access/policy.mjs` | `server/test/passportRoutes.integration.test.mjs` |
| SwR-CXCLIENT-059 | Notifications built to CX-0151 and sent as JSON POST | EL-CXCLIENT | `server/src/connector/messageHeader.mjs` | `server/test/messageHeader.test.mjs` |
| SwR-CXCLIENT-110 | Recycling withdraws the passport dataset offers | EL-CXCLIENT | `server/src/connector/offerPublisher.mjs` | `server/test/offerPublisher.integration.test.mjs` |
| SwR-CXCLIENT-111 | End of a recycled battery's passport made known to the provider | EL-CXCLIENT | `server/src/connector/notificationPlan.mjs` | `server/test/notificationPlan.test.mjs` |
| SwR-BGWORK-010 | Lifecycle notifications sent unchanged as JSON POST through the connector | EL-BGWORK | `server/src/background/outboxWorker.mjs` | `server/test/outboxWorker.integration.test.mjs` |
| SwR-BGWORK-020 | End of a recycled battery's passport sent in time | EL-BGWORK | `server/src/background/outboxWorker.mjs` | `server/test/outboxWorker.integration.test.mjs` |
| SwR-RDB-007 | Dataset writes only by the responsible or an authorised operator | EL-RDB | `server/src/db/migrations/003_policies.sql` | `server/test/databaseRules.integration.test.mjs` |
| SwR-RDB-073 | Timeline of responsible economic operators held per passport | EL-RDB | `server/src/db/migrations/002_triggers.sql` | `server/test/databaseRules.integration.test.mjs` |
| SwR-RDB-074 | Change to waste refused without a named successor | EL-RDB | `server/src/db/migrations/002_triggers.sql` | `server/test/databaseRules.integration.test.mjs` |
| SwR-RDB-075 | Manufacturer held in each passport record and never empty on write | EL-RDB | `server/src/db/migrations/001_schema.sql` | `server/test/databaseRules.integration.test.mjs` |
| SwR-DATASET-190 | Passport rows written only under the responsible operator's context | EL-DATASET | `server/src/db/migrations/003_policies.sql` | `server/test/databaseRules.integration.test.mjs` |
| SwR-DATASET-191 | Waste step records the current passport's producer, not the actor | EL-DATASET | `server/src/dataset/lifecycleService.mjs` | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-192 | Lineage step writes no link into an original passport row | EL-DATASET | `server/src/dataset/lifecycleService.mjs` | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-193 | New passport served under its own DPP Metadata identifier | EL-DATASET | `server/src/submodels/submodelService.mjs` | `server/test/submodelRoutes.integration.test.mjs` |
| SwR-DATASET-194 | Remanufacturing donor accepted for the waste status | EL-DATASET | `server/src/dataset/lifecycleService.mjs` | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-195 | Direct re-use recorded as an ownership event, never as a lineage step | EL-DATASET | `server/src/access/accessRecordService.mjs` | `server/test/accessRecords.integration.test.mjs` |
| SwR-DATASET-196 | Direct re-use leaves the responsible operator unchanged | EL-DATASET | `server/src/access/accessRecordService.mjs` | `server/test/accessRecords.integration.test.mjs` |
| SwR-ACCESS-127 | Purchaser for point 4 access taken from the open ownership interval | EL-ACCESS | `server/src/access/accessRecordService.mjs` | `server/test/accessRecords.integration.test.mjs` |
| SwR-TWINS-154 | New PartInstance twin registered for a new passport, originals untouched | EL-TWINS | `server/src/twins/shellDescriptor.mjs` | `server/test/shellDescriptor.test.mjs` |
| SwR-CXCLIENT-176 | NewPassportIssued sent to each original passport's data provider under contract | EL-CXCLIENT | `server/src/connector/notificationPlan.mjs` | `server/test/notificationPlan.test.mjs` |
| SwR-DATASET-197 | Forward link added on the original data provider's request | EL-DATASET | `server/src/dataset/lifecycleService.mjs` | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-198 | Successors record served as a submodel of its own | EL-DATASET | `server/src/submodels/submodelService.mjs` | `server/test/submodelRoutes.integration.test.mjs` |
| SwR-ACCESS-129 | Previous holder's point 4 access ends with the closed ownership interval | EL-ACCESS | `server/src/access/accessRecordService.mjs` | `server/test/accessRecords.integration.test.mjs` |
| SwR-DATASET-199 | Direct re-use leaves the battery status unchanged | EL-DATASET | `server/src/access/accessRecordService.mjs` | `server/test/accessRecords.integration.test.mjs` |
| SwR-CXCLIENT-178 | PassportEnded sent to the data provider, nameplate manufacturer and successor | EL-CXCLIENT | `server/src/connector/notificationPlan.mjs` | `server/test/notificationPlan.test.mjs` |
| SwR-CXCLIENT-179 | PassportEnded may be sent to predecessor data providers under contract | EL-CXCLIENT | `server/src/connector/notificationPlan.mjs` | `server/test/notificationPlan.test.mjs` |
| SwR-CXCLIENT-180 | BatteryRepaired sent to the data provider of the repaired battery's passport | EL-CXCLIENT | `server/src/connector/notificationPlan.mjs` | `server/test/notificationPlan.test.mjs` |
| SwR-CXCLIENT-181 | BatteryBecameWaste sent to the data provider and the named successor | EL-CXCLIENT | `server/src/connector/notificationPlan.mjs` | `server/test/notificationPlan.test.mjs` |
| SwR-CXCLIENT-182 | Lifecycle record offer restricted to purchaser, operators and authorities | EL-CXCLIENT | `server/src/connector/offerPublisher.mjs` | `server/test/offerPublisher.integration.test.mjs` |
| SwR-CXCLIENT-183 | Sender's record of a receiver without an asset or a contract | EL-CXCLIENT | `server/src/connector/notificationSender.mjs` | `server/test/notificationSender.integration.test.mjs` |
| SwR-CXCLIENT-184 | Notification plan holds one notification per receiver and passport | EL-CXCLIENT | `server/src/connector/notificationPlan.mjs` | `server/test/notificationPlan.test.mjs` |
| SwR-DATASET-200 | Passport rows written only in the data provider's deployment | EL-DATASET | `server/src/dataset/lifecycleService.mjs` | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-201 | End of the passport exempt from the successor authorisation check | EL-DATASET | `server/src/dataset/lifecycleService.mjs` | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-202 | Repair entry stored with the repair certificate's catenaXId | EL-DATASET | `server/src/dataset/lifecycleService.mjs` | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-203 | Successor, role and date stored with the waste status | EL-DATASET | `server/src/dataset/lifecycleService.mjs` | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-204 | Recycling date and recycler stored as the end of the passport | EL-DATASET | `server/src/dataset/lifecycleService.mjs` | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-205 | Original passport's status kept when a new passport supersedes it | EL-DATASET | `server/src/dataset/lifecycleService.mjs` | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-206 | Lineage step requires the treated battery's four performance values | EL-DATASET | `server/src/dataset/lifecycleService.mjs` | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-207 | Received notification applied only through its operation's step | EL-DATASET | `server/src/dataset/lifecycleService.mjs` | `server/test/lifecycleService.integration.test.mjs` |
| SwR-BACKEND-206 | Lifecycle notification failures answered with envelope and result object | EL-BACKEND | `server/src/routes/lifecycleNotificationRoutes.mjs` | `server/test/lifecycleNotificationRoutes.integration.test.mjs` |
| SwR-BACKEND-207 | Four lifecycle notification operations received as POST endpoints | EL-BACKEND | `server/src/routes/lifecycleNotificationRoutes.mjs` | `server/test/lifecycleNotificationRoutes.integration.test.mjs` |
| SwR-DATASET-208 | Database trigger refuses a change of a passport's manufacturer | EL-DATASET | `server/src/db/migrations/002_triggers.sql` | `server/test/databaseRules.integration.test.mjs` |

### 5.3 The process requirements that the repository meets

One title of the table names decision Q-409 (whether served aspect payloads skip the response envelope).

| Process requirement | Title | Artefact | Phase |
|---|---|---|---|
| PrR-CXD-013 | Six Tractus-X legal files at the reference implementation repository's root | the six legal files at the root, which §3.4 keeps unchanged | substrate |
| PrR-CXD-014 | .tractusx metadata file with leadingRepository, product and openApiSpecs keys | `.tractusx`, unchanged | substrate |
| PrR-CXD-015 | README, INSTALL and CHANGELOG files at the reference implementation's root | `README.md`, `INSTALL.md`, `CHANGELOG.md` | substrate; each phase updates the three files |
| PrR-CXD-016 | License header of its kind in every reference implementation file | the header of every file of §7 | each phase |
| PrR-CXD-017 | Visible NOTICE section at the end of every documentation file | the NOTICE section of every Markdown file of §7 | each phase |
| PrR-CXD-018 | Lifecycle notification API specified in docs/api/openAPI.yaml, OpenAPI 3.1.0 | `docs/api/openAPI.yaml`, a planned file of §7 | P1 |
| PrR-CXD-019 | Four notification operations with JSON schemas, following the Industry Core KIT | `docs/api/openAPI.yaml` and the five message schemas of `docs/api/schemas/` | P1 |
| PrR-CXD-020 | Notification responses 200, 4xx and 5xx with the error body of Q-409 | the responses of `docs/api/openAPI.yaml` and `docs/api/schemas/ErrorResponse.schema.json`, a planned file of §7 | P1 |
| PrR-CXD-021 | Arc42 architecture documentation of the lifecycle notification API | `docs/architecture/README.md`, a planned file of §7 | P8 |
| PrR-CXD-022 | Administrator guide for the notification asset and its policies | `docs/admin/README.md`, a planned file of §7 | P8 |
| PrR-CXD-023 | Adoption, development and operations views in the KIT template | `docs/adoption-view.md`, `docs/development-view.md`, `docs/operations-view.md`, three planned files of §7 | P8 |
| PrR-CXD-024 | Methodology document tracing the API to the regulation | `docs/methodology.md`, extended with the chain of each operation | substrate; P8 |
| PrR-CXD-025 | List of the items that no stored standard covers | `docs/proposals.md`, extended with the three models | substrate; P8 |
| PrR-CXD-026 | Three proposed models in the sldt-semantic-models layout | the three model folders of `models/` | P2 |
| PrR-CXD-027 | Proposed models validated with SAMM CLI 2.11.1 | `.github/workflows/samm.yml`, a planned file of §7, and the command of §15 item 3 | P2 |
| PrR-CXD-028 | One conformance test per criterion CX-0160-4-CAC-001 to 016 | the sixteen files `tck/CAC-<nnn>.tck.mjs` | P6 |
| PrR-CXD-029 | Conformance tests run against the in-process binding and the connector binding | `tck/lib/binding.mjs` with its two binding modules, planned files of §7 | P6, P7 |
| PrR-CXD-030 | OpenAPI file linted with Spectral on every change | `.github/workflows/spectral.yml` and `.spectral.yaml`, planned files of §7 | P1 |

### 5.4 The requirements that the reference server does not implement

| Group | Requirements | Reason | Owner of a later decision |
|---|---|---|---|
| First group: the recovered materials and the recycling efficiency | SyR-PASS-210 (Recovered materials readable by recycler, manufacturer and authorities only); SyR-LIFE-109 (Recovered materials recorded only by the battery's recycler); SyR-LIFE-115 (Recycling efficiency recorded as output mass over input mass); SwR-DATASET-071 (Recovered materials returned only to recycler, manufacturer and authorities); SwR-DATASET-120 (Recovered masses of the five metals recorded only by the recycler); SwR-DATASET-122 (Recycling efficiency recorded as output mass over input mass); SwR-ACCESS-091 (Recovered materials readable only by recycler, manufacturer and authorities); SwR-ACCESS-092 (Recovered materials and recycling efficiency recorded only by the battery's recycler); SwR-RDB-008 (Recovered materials readable by recorder, manufacturer and authorities only); SwR-RDB-009 (Recovered masses accepted in kg from the battery's recycler); SwR-RDB-068 (Recycling efficiency held as output mass over input mass) | Section 1.1 of the proposal puts the calculation of the recycling efficiency and of the recovery of materials outside CX-0160-4. PassportEnded carries the reference of the material recycling certificate and no recovered mass (D10). The database of open decision OD-2 holds no table for the masses | the owner of this repository |
| Second group: the rules that rest only on the draft implementing act under Article 77(9) of Regulation (EU) 2023/1542 | SyR-PASS-216 (Reselling purchaser shares individual battery information with a prospective purchaser); SyR-PASS-217 (Reselling purchaser shares individual battery information with the named authorities); SyR-PASS-218 (Used-battery operators read individual battery information only through the purchaser's share); SyR-PASS-219 (Individual battery information marked for the purchaser and the purchaser's agent); SyR-PASS-220 (Detailed composition marked for second-life operators, recyclers and training centres); SyR-PASS-221 (Dismantling information marked for second-life operators, recyclers and training centres); SyR-PASS-222 (Part numbers and spare sources marked for second-life operators and purchaser); SyR-PASS-223 (Safety measures marked for second-life operators and vehicle and electronics treatment); SyR-PASS-224 (Restricted information offered only for evaluation and second-life purposes); SyR-PASS-225 (Purchaser's offer of individual battery information also admits energy aggregators); SyR-PASS-226 (Restricted information offered under a policy that forbids sharing outside the exceptions); SyR-PASS-227 (Economic operator may authorise wider sharing of restricted information); SyR-PASS-228 (Second-life operator authorises wider sharing of the new passport's battery information); SyR-PASS-229 (Safety measures may be offered without restriction on further use); SyR-PASS-234 (Original manufacturer authorises sharing of model information on a new passport); SwR-CXCLIENT-169 (Resale point 4 offer restricted to the named prospective purchaser); SwR-CXCLIENT-170 (Restricted offers limited to the purposes of draft Art. 2(1)); SwR-CXCLIENT-171 (Purchaser's point 4 offer also carries the aggregator purpose); SwR-CXCLIENT-172 (Point 2 and point 4 offers prohibit sharing outside draft Art. 2(4)); SwR-CXCLIENT-173 (Safety measures offer may carry a bare use permission); SwR-ACCESS-123 (Purchaser's grant of point 4 access to a named authority); SwR-ACCESS-124 (Used-battery operators' point 4 reads gated by the purchaser's named share); SwR-ACCESS-125 (Operator's authorisation for wider sharing recorded per named person); SwR-ACCESS-126 (New passport's point 4 authorisation accepted only from its operator); SwR-ACCESS-128 (Model information authorisation on a new passport accepted from the original issuer); SwR-DATASET-185 (Point 4 fields marked for the purchaser and the purchaser's agent); SwR-DATASET-186 (Detailed composition fields marked for the second-life and training group); SwR-DATASET-187 (Dismantling information fields marked for the second-life and training group); SwR-DATASET-188 (Part number and spare source fields marked for the second-life group); SwR-DATASET-189 (Safety measure fields marked for the treatment operators' group) | The act is a draft, and Annex B point 1 of the proposal states that the final act may change its exceptions. The requirements wait for the adoption of the act (D39) | the owner of this repository |
| Third group: the reports of the first recycler under Delegated Regulation (EU) 2025/606 | SyR-LIFE-135 (First recycler receives every later facility's recycling efficiency and recovery); SyR-LIFE-136 (First recycler's report of every facility for the competent authorities); SyR-LIFE-137 (Preparation-for-recycling operator provides its data to the first recycler); SwR-CXCLIENT-174 (Received facility results stored per facility and fraction); SwR-CXCLIENT-175 (Preparation-for-recycling data offered only to the named first recycler); SwR-BACKEND-205 (First recycler's facility report answered per reporting period) | Section 1.1 of the proposal puts the yearly report on recycling outside CX-0160-4, and no interface of the proposal carries the data of a recycling facility | the owner of this repository |
| Fourth group: the sharing of individual battery information with the original issuer (use cases LC-1 and LC-5b of the proposal) | SyR-PASS-215 (Individual battery information shared with the passport issuer under contract); SyR-CXD-218 (Issuer's contract negotiation for individual battery information without a manual step); SyR-CXD-219 (Transfer of individual battery information to the issuer without a manual step); SyR-PASS-233 (Degradation data of a second-life battery offered to the original issuer); SwR-CXCLIENT-166 (Point 4 offer for the passport issuer gated by a recorded contract); SwR-CXCLIENT-167 (Issuer's negotiation for point 4 information run without a user step); SwR-CXCLIENT-168 (Point 4 transfer to the issuer stored without a user step); SwR-CXCLIENT-177 (Second-life battery's point 4 offer to the original data provider) | Option A of open decision OD-2 holds no contract record and no received individual battery information (D38). Option B of OD-2 builds the group | the owner of this repository |
| Fifth group: the twins and the bills of material of traced parts | SyR-CXD-220 (Digital twin created for each serialized part and batch to be traced); SyR-CXD-222 (As-built bill of material may reference a child's part type twin); SyR-CXD-223 (As-built usage never references a parent's part type twin); SwR-TWINS-153 (PartInstance twin registered for each traced item); SwR-TWINS-155 (As-built child item may reference a PartType twin); SwR-TWINS-156 (As-built usage parents taken only from part instance edges) | The reference server holds passports and no part. The data provider supplies the SerialPart payload and the SingleLevelBomAsBuilt payload of a passport (D28), and the proposal changes no rule of CX-0127 | the owner of this repository |
| Sixth group: the inputs of a passport dataset pulled from a partner | SwR-CXCLIENT-114 (Received passport inputs written only for the responsible operator) | The reference server pulls no input of a passport from a partner. The only data that the server receives are the four lifecycle notifications, whose effect the receiving step of §10.4 limits | the owner of this repository |
| Seventh group: the data plane of the connector | SwR-CONNECTOR-061 (Data plane forwards requests and responses unchanged per data address) | The requirement binds the connector, which the reference server uses and does not contain. The memory transport of §9.2.5 forwards the method, the path, the body and the content type unchanged and returns the status and the body of the receiver unchanged | the owner of this repository |

### 5.5 The decisions of the registry that this specification applies

| Decision | What the answer states | Where this specification applies the answer |
|---|---|---|
| Q-200 (how the dataset delivers each field's access group) | The access map names the access group of every field of the seven IDTA-02035 aspect models. Each of the two lifecycle models has one data offer with its own access policy | D3, D4, §9.2.4, §10.5 |
| Q-202 (the carrier for lifecycle data the aspect models lack) | BatteryPassportLifecycle carries the predecessor links, the waste successor and the end of the passport. BatteryPassportSuccessors carries the forward links. Three items stay open | D5, §10.6 |
| Q-409 (whether served aspect payloads skip the response envelope) | A route that serves an aspect payload answers the bare payload on success. A failure answers the error envelope together with the result object of AAS Part 2 | D9, §9.5, `EP-SUBMODEL`, `EP-ACCESS-MAP` |
| Q-1011 (whether the reference implementation builds use case UC-5) | The reference implementation builds UC-5a, the notices of the lifecycle events, and UC-5b, the purchase of degradation data | UC-5a is in scope. Open decision OD-2 states that its recommended option does not build UC-5b and that the owner decides the difference |
| Q-1013 (where the lifecycle rules of the battery after its first passport are built) | The lifecycle rules are built in the battery passport dataset element EL-DATASET, as the one lifecycle executor | §9.2.2: `server/src/dataset/lifecycleService.mjs` is the one executor |
| Q-1014 (where the reference implementation of the after-first-passport work is built) | The reference implementation is built in this repository, with its own server on Node.js and PostgreSQL, the conformance tests and its own registry | the whole specification |

### 5.6 Constraints from the rules of this repository

- **Licenses** (`CLAUDE.md`, "Tractus-X conventions"): every code file starts with the Apache-2.0 header, every YAML and Turtle file starts with the header of its license, and every Markdown file ends with the NOTICE section. A JSON file carries no header, because JSON has no comment.
- **One executor per capability** (`CLAUDE.md`, "Engineering rules"): one module performs each capability. §9.2 names the one module of each capability.
- **Layers**: a route reads the request, checks the access, calls a service and writes the response. A service holds the rule. A repository module holds the SQL. No route and no service module holds SQL text.
- **Dependency inversion**: importing a module reads no environment variable and creates no client. `server/src/index.mjs` is the one composition root.
- **Deny by default**: a failed check refuses. No error is silently discarded.
- **Tests**: every change comes with its test.
- **Commits**: a commit message follows the Conventional Commits format. The implementer commits only when the owner orders a commit.

### 5.7 Registry changes that this specification needs

The implementer changes no requirement. The table lists the changes that the owner decides before the phase named in the last column starts. A phase whose change the owner has not approved stays blocked.

| Record | Text of the record today | Change that this specification needs | Blocks |
|---|---|---|---|
| EL-BGWORK (background work) in `requirements/SYS.3-System_Architectural_Design/architecture.json` | "The reference server of this repository has no such element" `[live]` | The description names the module `server/src/background/outboxWorker.mjs`, because the two software requirements of the element EL-BGWORK in §5.2 need a module | P5 |
| SwR-DATASET-208 (Database trigger refuses a change of a passport's manufacturer) | The statement names the table `batteries`, the column `manufacturer_id` and an exemption of a migrator role `[live]` | The statement names the table `passports` and the column `manufacturer_bpnl` of §9.4, and holds no exemption (D16) | P3 |
| SwR-DATASET-195 (Direct re-use recorded as an ownership event, never as a lineage step), SwR-ACCESS-127 (Purchaser for point 4 access taken from the open ownership interval) and SwR-ACCESS-129 (Previous holder's point 4 access ends with the closed ownership interval) | Each statement names the ownership service and the ownership timeline `[live]` | Each statement names the access records of §9.4 and the module `server/src/access/accessRecordService.mjs` (D30) | P4 |
| VM-PRC-CXD-021 (Inspection of the list of proposed items), VM-PRC-CXD-023 (Validation of the proposed models with SAMM CLI 2.11.1) and VM-PRC-CXD-025 (Run of the conformance tests against both bindings) | The pass criteria name two proposed models and fifteen tests `[live]` | The pass criteria name the three proposed models and the sixteen tests of draft 0.7 of the proposal | P8 |
| The allocation of the carried requirements to the architecture elements | Each element and each interface has the status `proposed` `[live]` | The owner approves the allocation, or changes the allocation | P4 |

## 6. Files to read, do not modify

| Path | Why the implementer reads the file |
|---|---|
| `CLAUDE.md` | the rules of the repository, which bind every file |
| `docs/proposal/CX-0160-4_Battery_passport_after_the_first_passport.md` | the interfaces: sections 2.1, 2.2, 3.2, 3.3, 3.4 and 4.3, Tables 2.1.1, 2.1.2, 2.1.4, 4.3 and 4.4, and Annex A |
| `requirements/README.md`, `requirements/method.md` | the registry and its method |
| `requirements/SWE.1-Software_Requirements_Analysis/software_requirements.json`, `requirements/SYS.2-System_Requirements_Analysis/system_requirements.json`, `requirements/SYS.2-System_Requirements_Analysis/process_requirements.json` | the statement of every requirement of §5 |
| `requirements/SYS.3-System_Architectural_Design/architecture.json` | the elements and the interfaces of §9.2 |
| `requirements/SYS.1-Requirements_Elicitation/decisions.json` | the decisions of §5.5 |
| `docs/methodology.md`, `docs/proposals.md` | the documents that phase P8 extends |
| `docs/lessons-from-a-first-implementation.md` | the 14 classes of defects that the tests of §14 must exclude |
| `sources/Tractus-X/kits-26.09/industry-core-kit/software-development-view/notifications.mdx` | the rules of a notification API: the message form, the MessageHeader, POST only, one endpoint per operation, the response codes and the connector asset |
| `sources/IDTA/io.admin-shell.idta.batterypass.digital_nameplate/1.0.0/gen/NameplateBattery-schema.json`, `sources/IDTA/io.admin-shell.idta.batterypass.technical_data/1.0.0/gen/TechnicalDataBattery-schema.json`, `sources/IDTA/io.admin-shell.idta.batterypass.product_condition/1.0.0/gen/ProductConditionBattery-schema.json`, `sources/IDTA/io.admin-shell.idta.dpp.dpp_metadata/1.0.0/gen/DppMetadata-schema.json` | the JSON schemas of the four stored models, which `server/src/submodels/submodelService.mjs` compiles (D28) |
| `sources/Tractus-X/semantic-models/io.catenax.shared.recycling_strategy_certificate/3.0.0/metadata.json` | a stored Tractus-X aspect model folder, as the pattern of the layout of `models/` |
| `scripts/check-license-headers.mjs`, `scripts/check-private-references.mjs`, `scripts/check-sources.mjs`, `scripts/requirements-check.mjs`, `scripts/spec_gate_check.py` | the checks that every phase runs |

## 7. Files to write or modify

The action `new` marks a file that does not exist at the substrate. The action `modify` marks an existing file. Every code file starts with the Apache-2.0 header that `scripts/check-sources.mjs` carries `[live]`. Every YAML and Turtle file starts with the CC-BY-4.0 header in `#` comments, except the workflow files and the Compose file, which start with the Apache-2.0 header in `#` comments. Every Markdown file ends with the NOTICE section, with its own source address.

| Path | Action | Phase | Note |
|---|---|---|---|
| `docs/api/openAPI.yaml` | new | P1 | OpenAPI 3.1.0; four POST operations; §10.1 |
| `docs/api/schemas/MessageHeader.schema.json`, `docs/api/schemas/NewPassportIssued.schema.json`, `docs/api/schemas/BatteryRepaired.schema.json`, `docs/api/schemas/BatteryBecameWaste.schema.json`, `docs/api/schemas/PassportEnded.schema.json`, `docs/api/schemas/NotificationAccepted.schema.json`, `docs/api/schemas/ErrorResponse.schema.json` | new | P1 | the one definition of the message, of the 200 body and of the error body (D21) |
| `.spectral.yaml` | new | P1 | the ruleset: `extends: ["spectral:oas"]` |
| `.github/workflows/checks.yml`, `.github/workflows/spectral.yml` | new | P1 | §9.7 |
| `models/io.catenax.battery.passport_lifecycle/1.0.0/BatteryPassportLifecycle.ttl`, `models/io.catenax.battery.passport_lifecycle/1.0.0/metadata.json`, `models/io.catenax.battery.passport_lifecycle/1.0.0/gen/BatteryPassportLifecycle-schema.json`, `models/io.catenax.battery.passport_lifecycle/1.0.0/gen/BatteryPassportLifecycle.json`, `models/io.catenax.battery.passport_lifecycle/RELEASE_NOTES.md` | new | P2 | §10.6 |
| `models/io.catenax.battery.passport_successors/1.0.0/BatteryPassportSuccessors.ttl`, `models/io.catenax.battery.passport_successors/1.0.0/metadata.json`, `models/io.catenax.battery.passport_successors/1.0.0/gen/BatteryPassportSuccessors-schema.json`, `models/io.catenax.battery.passport_successors/1.0.0/gen/BatteryPassportSuccessors.json`, `models/io.catenax.battery.passport_successors/RELEASE_NOTES.md` | new | P2 | §10.6 |
| `models/io.catenax.battery.passport_access_map/1.0.0/BatteryPassportAccessMap.ttl`, `models/io.catenax.battery.passport_access_map/1.0.0/metadata.json`, `models/io.catenax.battery.passport_access_map/1.0.0/gen/BatteryPassportAccessMap-schema.json`, `models/io.catenax.battery.passport_access_map/1.0.0/gen/BatteryPassportAccessMap.json`, `models/io.catenax.battery.passport_access_map/RELEASE_NOTES.md` | new | P2 | §10.6 |
| `.github/workflows/samm.yml` | new | P2 | §9.7 |
| `models/README.md` | modify | P2 | names the three models and the validation command |
| `server/package.json`, `server/package-lock.json` | new | P3 | `"type": "module"`, `"engines": { "node": ">=24" }`; dependencies of D37 |
| `server/src/db/migrate.mjs`, `server/src/db/pool.mjs`, `server/src/db/transaction.mjs` | new | P3 | §9.2.8 |
| `server/src/db/migrations/001_schema.sql`, `server/src/db/migrations/002_triggers.sql`, `server/src/db/migrations/003_policies.sql` | new | P3 | §9.4 |
| `server/test/databaseRules.integration.test.mjs`, `server/test/support/database.mjs` | new | P3 | §14.2 |
| `.github/workflows/tests.yml` | new | P3 | §9.7 |
| `server/src/config.mjs`, `server/src/logger.mjs` | new | P4 | the configuration reader and the logger (§9.2.1) |
| `server/src/access/authenticate.mjs`, `server/src/access/operatorToken.mjs`, `server/src/access/capabilities.mjs`, `server/src/access/policy.mjs`, `server/src/access/requireCapability.mjs`, `server/src/access/accessRecordService.mjs`, `server/src/access/accessRecordRepository.mjs` | new | P4 | §9.2.3 |
| `server/src/audit/auditLog.mjs` | new | P4 | §9.2.7 |
| `server/src/dataset/lifecycleCatalogue.mjs`, `server/src/dataset/lifecycleService.mjs`, `server/src/dataset/passportRepository.mjs`, `server/src/dataset/lifecycleRecordReader.mjs`, `server/src/dataset/governedElements.mjs`, `server/src/dataset/refusals.mjs` | new | P4 | §9.2.2, §9.5 |
| `server/src/submodels/submodelService.mjs`, `server/src/submodels/accessMapService.mjs`, `server/src/submodels/accessMapRepository.mjs`, `server/src/submodels/jsonPathSubset.mjs` | new | P4 | §9.2.4 |
| `server/src/validation/schemaValidator.mjs`, `server/schemas/createPassport.schema.json`, `server/schemas/issueNewPassport.schema.json`, `server/schemas/reportRepair.schema.json`, `server/schemas/reportWaste.schema.json`, `server/schemas/reportRecycling.schema.json`, `server/schemas/forwardLink.schema.json`, `server/schemas/accessRecord.schema.json`, `server/schemas/purchaserChange.schema.json`, `server/schemas/successorAuthorisation.schema.json`, `server/schemas/batteryModel.schema.json` | new | P4 | §10.2 |
| `server/test/fixtures/nameplate.json`, `server/test/fixtures/technicalData.json`, `server/test/fixtures/productCondition.json`, `server/test/fixtures/dppMetadata.json`, `server/test/fixtures/accessMap.json` | new | P4 | payloads that validate against the stored schemas of §6; every value is invented test data |
| `server/src/connector/messageHeader.mjs`, `server/src/connector/notificationPlan.mjs`, `server/src/connector/notificationRepository.mjs`, `server/src/connector/policyBuilder.mjs`, `server/src/connector/offerPublisher.mjs`, `server/src/connector/memoryOfferStore.mjs`, `server/src/connector/partnerDirectory.mjs` | new | P4 | §9.2.5 |
| `server/src/twins/shellDescriptor.mjs`, `server/src/twins/memoryTwinRegistry.mjs` | new | P4 | §9.2.6 |
| `server/test/config.test.mjs`, `server/test/operatorToken.test.mjs`, `server/test/policy.test.mjs`, `server/test/lifecycleCatalogue.test.mjs`, `server/test/refusals.test.mjs`, `server/test/jsonPathSubset.test.mjs`, `server/test/governedElements.test.mjs`, `server/test/messageHeader.test.mjs`, `server/test/notificationPlan.test.mjs`, `server/test/policyBuilder.test.mjs`, `server/test/shellDescriptor.test.mjs`, `server/test/twinRegistryContract.test.mjs`, `server/test/lifecycleService.integration.test.mjs`, `server/test/audit.integration.test.mjs`, `server/test/offerPublisher.integration.test.mjs` | new | P4 | §14.2: the unit tests and the tests of the services |
| `server/src/index.mjs`, `server/src/app.mjs` | new | P5 | the composition root and the application factory (§9.2.1) |
| `server/src/routes/lifecycleNotificationRoutes.mjs`, `server/src/routes/lifecycleEventRoutes.mjs`, `server/src/routes/notificationRecordRoutes.mjs`, `server/src/routes/passportRoutes.mjs`, `server/src/routes/batteryModelRoutes.mjs`, `server/src/routes/submodelRoutes.mjs`, `server/src/routes/healthRoutes.mjs`, `server/src/routes/errorHandler.mjs` | new | P5 | §9.3 |
| `server/src/connector/notificationSender.mjs`, `server/src/connector/memoryTransport.mjs`, `server/src/background/outboxWorker.mjs` | new | P5 | §9.2.5 |
| `server/test/lifecycleNotificationRoutes.integration.test.mjs`, `server/test/lifecycleEventRoutes.integration.test.mjs`, `server/test/passportRoutes.integration.test.mjs`, `server/test/submodelRoutes.integration.test.mjs`, `server/test/accessMap.integration.test.mjs`, `server/test/accessRecords.integration.test.mjs`, `server/test/openApiContract.test.mjs`, `server/test/notificationSender.integration.test.mjs`, `server/test/outboxWorker.integration.test.mjs`, `server/test/transportContract.test.mjs` | new | P5 | §14.2: the tests of the routes, of the sender and of the worker |
| `tck/package.json`, `tck/lib/binding.mjs`, `tck/lib/inProcessBinding.mjs`, `tck/lib/scenario.mjs` | new | P6 | §9.2.9 |
| `tck/CAC-001.tck.mjs`, `tck/CAC-002.tck.mjs`, `tck/CAC-003.tck.mjs`, `tck/CAC-004.tck.mjs`, `tck/CAC-005.tck.mjs`, `tck/CAC-006.tck.mjs`, `tck/CAC-007.tck.mjs`, `tck/CAC-008.tck.mjs`, `tck/CAC-009.tck.mjs`, `tck/CAC-010.tck.mjs`, `tck/CAC-011.tck.mjs`, `tck/CAC-012.tck.mjs`, `tck/CAC-013.tck.mjs`, `tck/CAC-014.tck.mjs`, `tck/CAC-015.tck.mjs`, `tck/CAC-016.tck.mjs` | new | P6 | §14.3 |
| `tck/README.md` | modify | P6, P7 | the two bindings, their commands and the record of the verification of phase P7 |
| `server/src/connector/edcTransport.mjs`, `server/src/connector/edcOfferStore.mjs`, `server/src/twins/dtrTwinRegistry.mjs` | new | P7 | §9.2.5, §9.2.6 |
| `tck/lib/connectorBinding.mjs`, `tck/docker-compose.yml`, `tck/.env.example`, `server/Dockerfile` | new | P7 | §10.7 |
| `docs/architecture/README.md` | new | P8 | the twelve arc42 sections of §11.8 |
| `docs/admin/README.md` | new | P8 | the administrator guide of §11.8 |
| `docs/adoption-view.md`, `docs/development-view.md`, `docs/operations-view.md` | new | P8 | the three views of §11.8 |
| `.github/workflows/codeql.yml`, `.github/workflows/trufflehog.yml`, `.github/dependabot.yml` | new | P8 | §9.7 |
| `docs/methodology.md`, `docs/proposals.md` | modify | P8 | the chain of each operation with its test file; the three models |
| `README.md`, `INSTALL.md`, `CHANGELOG.md`, `docs/README.md`, `server/README.md` | modify | each phase | the state of each folder; the installation and test commands |
| `requirements/SWE.1-Software_Requirements_Analysis/software_requirements.json` | modify | P8 | only the field `implementation` of the requirements of §5.2: the state and the files |

## 8. Deletions and moves

This specification deletes no file and moves no file. The folders `server/`, `tck/` and `models/` hold one `README.md` each at the substrate `[live]`, and §7 modifies the three files.

## 9. Target architecture

### 9.1 Sources of truth

| Concept | The one source | Readers |
|---|---|---|
| The message of each operation, the 200 body and the error body | the seven schema files of `docs/api/schemas/` (D21) | `docs/api/openAPI.yaml` by `$ref`; `server/src/validation/schemaValidator.mjs`; the test kit |
| The four operations, their contexts, their receiving step and the step's admitted statuses | `OPERATIONS` of `server/src/dataset/lifecycleCatalogue.mjs` | the routes, the executor, the plan builder |
| The four lineage operations with their admission rule and the status of the new passport | `LINEAGE_OPERATIONS` of `server/src/dataset/lifecycleCatalogue.mjs` | the executor |
| The five status values | `LIFECYCLE_STATUS_VALUES` of `server/src/dataset/lifecycleCatalogue.mjs`, equal to the CHECK constraint of `passports.lifecycle_status`; the test `server/test/lifecycleCatalogue.test.mjs` compares both with `sources/IDTA/io.admin-shell.idta.batterypass.digital_nameplate/1.0.0/BatteryStatus_enum.ttl` | the executor, the schemas |
| The refusal ids, statuses and texts | `REFUSALS` of `server/src/dataset/refusals.mjs` (§9.5) | `server/src/routes/errorHandler.mjs` |
| The capabilities | `CAPABILITIES` of `server/src/access/capabilities.mjs` | `server/src/access/policy.mjs`, the routes |
| The elements of a payload that the passport record governs | `GOVERNED_ELEMENTS` of `server/src/dataset/governedElements.mjs` (§10.6) | `server/src/submodels/submodelService.mjs` |
| The aspect keys, their semantic identifiers and their twin level | `ASPECTS` of `server/src/submodels/submodelService.mjs` (§10.6) | the routes, the shell descriptor builder, the offer publisher |
| The request bodies of the operator endpoints | the ten schema files of `server/schemas/` | `server/src/validation/schemaValidator.mjs` |
| The database rules | the three migration files of `server/src/db/migrations/` | `server/src/db/migrate.mjs` |
| The configuration | `loadConfig` of `server/src/config.mjs` (§9.6) | `server/src/index.mjs` only |

### 9.2 Modules and their contracts

Each module belongs to one element of `requirements/SYS.3-System_Architectural_Design/architecture.json`. No module receives the Express request or response object except a route module, `server/src/access/authenticate.mjs`, `server/src/access/requireCapability.mjs` and `server/src/routes/errorHandler.mjs`.

#### 9.2.1 The composition root and the application (EL-BACKEND)

- `loadConfig(env)` of `server/src/config.mjs` returns a frozen configuration object or throws an error that names every missing or malformed variable of §9.6. `loadConfig` is the only reader of the environment.
- `createApp({ config, pool, clock, transport, offerStore, twinRegistry, partnerDirectory, logger })` of `server/src/app.mjs` returns `{ app, worker }`: the Express application with the routes of §9.3, and the outbox worker of §9.2.5. `createApp` creates no client and opens no port. The parameter `clock` is an object with the method `now()` that returns a `Date`.
- `server/src/index.mjs` calls `loadConfig(process.env)`, creates the pool, selects the implementations by `config.binding` (`memory`: `createMemoryTransport`, `createMemoryOfferStore`, `createMemoryTwinRegistry`; `connector`: `createEdcTransport`, `createEdcOfferStore`, `createDtrTwinRegistry`), runs the migrations, calls `createApp`, publishes the notification asset (§10.5), starts the worker and opens the port.
- `createLogger({ level })` of `server/src/logger.mjs` writes one JSON object per line to the standard output with the fields `time`, `level`, `message`, `traceId`, `route`, `actingBpnl` and the fields of the call. The logger never writes a token, a key or a payload.

#### 9.2.2 The lifecycle executor (EL-DATASET)

`server/src/dataset/lifecycleService.mjs` is the one module that changes a passport. `createLifecycleService({ repository, catalogue, notificationPlanner, notificationRepository, accessRecords, audit, clock, ownBpnl, passportEndedDelaySeconds })` returns these functions. Each function receives `{ client, subject, ... }`, where `client` is the database client of the caller's transaction, and each function returns plain data.

| Function | Step | Rule |
|---|---|---|
| `createFirstPassport({ client, subject, data })` | inserts a passport with the status `original`, its battery model reference, its first responsibility interval (role `economicOperator`, the own company) and its purpose record | the single-writer rule |
| `issueNewPassport({ client, subject, data })` | the lineage step of the second-life operator: checks the admission rule of D40 for each predecessor, inserts the new passport, one lineage link per predecessor, the first responsibility interval and the purpose record, and writes one pending NewPassportIssued notification per predecessor whose data provider is not the own company | writes no predecessor record; the single-writer rule applies to the new passport |
| `applyNotification({ client, subject, operation, message })` | the receiving step of §10.4 | applies exactly the step of the operation (SwR-DATASET-207 (Received notification applied only through its operation's step)) |
| `reportEvent({ client, subject, operation, data })` | the sending side of BatteryRepaired, BatteryBecameWaste and PassportEnded: builds the plan of §10.3 and writes the pending notifications; when the data provider of the named passport is the own company, the function applies the step locally in the same transaction and plans no notification to the own company (D12) | writes no passport of another data provider |
| `addForwardLink({ client, subject, passportId, messageId })` | inserts one successor link from the received NewPassportIssued notification that `messageId` names | refuses `ERR-LC-NOTIFICATION-UNKNOWN` when no such notification exists for the passport |
| `recordSuccessorAuthorisation({ client, subject, passportId, authorisationRef })` | sets `successor_authorisation_ref` once on a passport in the status `waste` | refuses `ERR-LC-STATUS-NOT-ADMITTED` on a passport that is not waste, and `ERR-LC-AUTHORISATION-RECORDED` on a second call |
| `putAspectPayload({ client, subject, passportId, aspectKey, payload })` | stores or replaces the payload of one of the ten aspect keys of §10.6 | validates the payload against the stored schema where §10.6 names one |

- **The single-writer rule** (D6): every function that writes a passport or a record of a passport refuses with `ERR-LC-NOT-DATA-PROVIDER` unless `passports.manufacturer_bpnl` equals `ownBpnl`. A new passport is inserted with `manufacturer_bpnl = ownBpnl`.
- **The rule after the waste status** (D18): a write on a passport whose status is `waste` refuses with `ERR-LC-SUCCESSOR-AUTHORISATION-MISSING` unless `successor_authorisation_ref` is set. The end of the passport, the record of the authorisation itself and the access record of the successor are exempt.
- **The rule after the end**: every write on a passport whose `recycling_date` is set refuses with `ERR-LC-PASSPORT-ENDED`.
- **The audit**: each function calls `audit.record` once per granted and once per refused write (§9.2.7).
- `server/src/dataset/passportRepository.mjs` holds every SQL statement on the tables `passports`, `battery_models`, `passport_purposes`, `passport_lineage_links`, `passport_successor_links`, `passport_repair_entries`, `passport_responsibility_intervals` and `passport_aspect_payloads`.
- `server/src/dataset/lifecycleRecordReader.mjs` exports `readLifecyclePayload({ client, passportId })` and `readSuccessorsPayload({ client, passportId })`, which build the payloads of sections 3.2 and 3.3 of the proposal from the tables and write nothing.

#### 9.2.3 The access control (EL-ACCESS)

- `authenticate({ config })` of `server/src/access/authenticate.mjs` returns an Express middleware that sets `req.subject` or answers 401 with `ERR-AC-UNAUTHENTICATED` (open decision OD-1):
  - a request that carries the header named by `config.dataPlaneKeyHeader` is a partner request. The middleware compares the header value with `config.dataPlaneKey` by `crypto.timingSafeEqual`, reads the header named by `config.partnerBpnHeader`, and sets `req.subject = { kind: "partner", bpnl }`. A wrong key, an absent partner header or a value that fails `^BPNL[A-Z0-9]{12}$` answers 401;
  - a request that carries `Authorization: Bearer <token>` is an operator request. `verifyOperatorToken(token, { secret, now })` of `server/src/access/operatorToken.mjs` checks the HS256 signature with `node:crypto`, the claim `exp` and the claim `bpnl`, which must equal `config.ownBpnl`. The middleware sets `req.subject = { kind: "operator", bpnl, name }` with `name` from the claim `sub`;
  - a request with neither header answers 401.
- `signOperatorToken({ sub, bpnl, expiresInSeconds }, { secret, now })` of the same module returns a compact JSON Web Token with the header `{"alg":"HS256","typ":"JWT"}`. The test kit signs its tokens with this function.
- `CAPABILITIES` of `server/src/access/capabilities.mjs` holds eight strings: `passport.create`, `passport.issue`, `passport.write`, `lifecycle.report`, `access-map.write`, `notification.read`, `notification.receive` and `submodel.read`.
- `capabilitiesOf(subject)` of `server/src/access/policy.mjs` grants an operator subject the first six capabilities and `submodel.read`, and grants a partner subject `notification.receive` and `submodel.read`. Every other subject receives an empty list.
- `requireCapability(capability)` of `server/src/access/requireCapability.mjs` throws at module load when `capability` is not a member of `CAPABILITIES`. The middleware answers 403 with `ERR-AC-CAPABILITY-MISSING` when the subject lacks the capability.
- `server/src/access/accessRecordService.mjs` exports `addAccessRecord`, `endAccessRecord`, `changePurchaser` and `mayRead({ client, subject, passportId, aspectKey })`. The module holds the rules of D29 and D30. `server/src/access/accessRecordRepository.mjs` holds the SQL on `passport_access_records`.

#### 9.2.4 The submodel service and the access map (EL-SUBMODELS)

- `readSubmodel({ client, subject, passportId, aspectKey })` of `server/src/submodels/submodelService.mjs` returns the payload of one aspect key of §10.6: the lifecycle and successors payloads from `lifecycleRecordReader`, and every other payload from `passport_aspect_payloads` with the governed elements of §10.6 written over the stored values. The function refuses `ERR-LC-SUBMODEL-NOT-FOUND` when the passport holds no payload of the key, and `ERR-AC-ACCESS-GROUP-REFUSED` when `mayRead` refuses. The function writes nothing (SwR-SUBMODELS-052 (Submodel endpoints change no stored data)).
- **The access decision** (D3): `mayRead` reads the entries of the current access map of the passport's battery model for the aspect and the twin level `PartInstance`. When every entry of the aspect has the access group `public`, every authenticated subject reads the aspect. Otherwise a partner subject reads the aspect only when an open access record of the passport names the partner's BPNL for an access group that every non-public entry of the aspect carries, and the operator subject reads every aspect. A served aspect is served whole.
- `putAccessMap({ client, subject, modelId, map })` of `server/src/submodels/accessMapService.mjs` stores a new version of the access map of a battery model. The function validates `map` against `models/io.catenax.battery.passport_access_map/1.0.0/gen/BatteryPassportAccessMap-schema.json`, refuses `ERR-LC-PATH-NOT-SUPPORTED` for a path outside the subset of D27, refuses `ERR-LC-ACCESS-MAP-VERSION-EXISTS` for a `mapVersion` that the model already holds, and refuses `ERR-LC-ACCESS-MAP-INCOMPLETE` when a leaf of a stored payload of a passport of the model is matched by no entry of its aspect and twin level, or by entries of two access groups.
- `readAccessMap({ client, modelId })` returns the access map version with the latest `valid_from` that is not after the current date, as the payload of section 3.4 of the proposal.
- `compilePath(path)` and `matchLeaves(compiledPath, payload)` of `server/src/submodels/jsonPathSubset.mjs` implement the subset of D27.

#### 9.2.5 The connector client and the background work (EL-CXCLIENT, EL-BGWORK)

- `buildMessageHeader({ operation, senderBpnl, receiverBpnl, clock, newUuid })` of `server/src/connector/messageHeader.mjs` returns the header of §10.1.
- `buildNotificationPlan({ operation, content, receivers, ownBpnl })` of `server/src/connector/notificationPlan.mjs` returns one entry `{ operation, receiverBpnl, passportIdentifier, content }` per pair of receiver BPNL and passport identifier, without an entry for `ownBpnl` (SwR-CXCLIENT-184 (Notification plan holds one notification per receiver and passport), D12). The function is pure.
- `server/src/connector/notificationRepository.mjs` holds the SQL on `notifications_sent` and `notifications_received`.
- **The transport contract.** A transport is an object with one method, `send({ receiverBpnl, operation, message })`, which resolves to `{ outcome, httpStatus, body, cause }`. The value of `outcome` is one of `sent` (the receiver answered 200), `no_asset` (the receiver offers no lifecycle notification asset), `contract_refused` (the receiver refused the contract), `receiver_refused` (the receiver answered 4xx or 5xx) and `transport_failed` (no answer). The method never throws for one of the five outcomes. `createMemoryTransport({ participants, offerStores })` of `server/src/connector/memoryTransport.mjs` and `createEdcTransport({ config, partnerDirectory, fetch })` of `server/src/connector/edcTransport.mjs` implement the contract, and `server/test/transportContract.test.mjs` runs one test code against the memory transport from phase P5 and against both implementations from phase P7.
- **The offer contract.** An offer store is an object with the methods `publish({ assetId, dctType, version, semanticId, path, allowedBpnls, usagePurposes })`, `withdraw(assetId)` and `list()`. The value `null` of `allowedBpnls` means every participant. `createMemoryOfferStore()` of `server/src/connector/memoryOfferStore.mjs` and `createEdcOfferStore({ config, fetch })` of `server/src/connector/edcOfferStore.mjs` implement the contract. `server/src/connector/offerPublisher.mjs` is the one caller: `publishNotificationAsset()`, `publishPassportOffers({ client, passportId })` and `withdrawDatasetOffers({ passportId })` build the offers of §10.5 with `server/src/connector/policyBuilder.mjs`.
- `createPartnerDirectory({ entries })` of `server/src/connector/partnerDirectory.mjs` returns `resolve(bpnl)`, which answers the connector address of a partner from `config.partnerConnectors` or `null` (D11).
- **The sender.** `sendDue({ now })` of `server/src/connector/notificationSender.mjs` reads the rows of `notifications_sent` whose `outcome` is `pending` and whose `not_before` is not after `now`, in the order of `id`, calls `transport.send` once per row with the stored message, and writes the outcome, the cause, the status and `attempted_at` on the row. A row whose outcome is `transport_failed` stays a record, and the operator repeats the event to send again.
- **The worker.** `createOutboxWorker({ sender, clock, intervalMilliseconds })` of `server/src/background/outboxWorker.mjs` returns `{ start(), stop(), tick() }`. `tick()` calls `sendDue({ now: clock.now() })` and resolves when every due row has an outcome. `start()` calls `tick()` every `intervalMilliseconds`. The worker sends each message unchanged (SwR-BGWORK-010 (Lifecycle notifications sent unchanged as JSON POST through the connector)). The delay of D1 is the value of `not_before` that the executor writes.

#### 9.2.6 The twin registration (EL-TWINS)

- `buildPartInstanceShell({ passport, model, aspects, baseUrl })` and `buildPartTypeShell({ model, baseUrl })` of `server/src/twins/shellDescriptor.mjs` return shell descriptors. A PartInstance shell carries `id` and `globalAssetId` equal to `urn:uuid:` and `passports.id`, the five specific asset IDs of Table 2.1.1 of the proposal (`manufacturerId` = `passports.manufacturer_bpnl`, `manufacturerPartId` = `battery_models.manufacturer_part_id`, `partInstanceId` and `intrinsicId` = `passports.battery_identifier`, `digitalTwinType` = `PartInstance`) and one submodel descriptor per aspect key that the passport serves. A PartType shell carries `manufacturerId`, `manufacturerPartId`, `digitalTwinType` = `PartType` and the submodel descriptor of the access map.
- **The twin registry contract.** A twin registry is an object with the methods `register(shell)`, `replace(shell)` and `read(shellId)`. `createMemoryTwinRegistry()` of `server/src/twins/memoryTwinRegistry.mjs` and `createDtrTwinRegistry({ config, fetch })` of `server/src/twins/dtrTwinRegistry.mjs` implement the contract, and `server/test/twinRegistryContract.test.mjs` runs one test code against the memory registry from phase P4 and against both implementations from phase P7.
- The route of `EP-ISSUE-NEW-PASSPORT` registers the twin after the transaction of the lineage step has committed (SwR-TWINS-154 (New PartInstance twin registered for a new passport, originals untouched)). The route sends no request for the twin of a predecessor. A failed registration is answered in the field `twin` of the success body (D23), and `EP-TWIN` repeats the registration.

#### 9.2.7 The audit trail (EL-AUDIT)

`createAuditLog({ logger })` of `server/src/audit/auditLog.mjs` returns `record({ decision, requesterBpnl, requesterKind, passportId, action, reliedOn, refusalId })`. The function writes one log line with the message `"passport write decision"`. The value of `decision` is `granted` or `refused`. The value of `reliedOn` is `data-provider`, `successor-authorisation:<reference>` or `end-of-passport-exemption`. Open decision OD-2 states why the audit trail is a log and not a table.

#### 9.2.8 The database access (EL-RDB)

- `createPool({ connectionString })` of `server/src/db/pool.mjs` returns a `pg` pool.
- `withTransaction(pool, actingBpnl, work)` of `server/src/db/transaction.mjs` takes a client, runs `BEGIN`, `SET LOCAL ROLE refserver_app` and `SELECT set_config('app.acting_bpnl', $1, true)`, runs `SET LOCAL search_path` to the schema of `DATABASE_SCHEMA`, awaits `work(client)`, and runs `COMMIT`, or `ROLLBACK` when `work` rejects. Every route that writes calls `withTransaction` once, and every read route calls `withTransaction` once with the own BPNL.
- `migrate(pool)` of `server/src/db/migrate.mjs` applies the files of `server/src/db/migrations/` in the order of their names, each in one transaction, and records each applied file in the table `schema_migrations`. A second run applies no file.

#### 9.2.9 The conformance test kit

- `tck/lib/binding.mjs` exports `startBinding()`, which reads `TCK_BINDING` (`in-process` or `connector`; another value throws) and returns the binding object of the selected module. Both modules return the same contract: `{ provider, operator, recycler, settle(), stop() }`. Each of the three participants is `{ bpnl, call(method, path, body), asPartner(reader).get(path), catalogue(reader), registry }`: `call` sends an operator request with a token of `signOperatorToken`; `asPartner(reader).get(path)` reads a path as the participant `reader` through the transport; `catalogue(reader)` lists the offers that `reader` sees; `registry.read(shellId)` reads a shell.
- `settle()` makes every due notification reach its outcome. The in-process binding advances its clock by 6 seconds and awaits `worker.tick()` of the three instances twice. The connector binding polls `EP-NOTIFICATIONS-SENT` of the three instances once per second until no entry is `pending`.
- `tck/lib/inProcessBinding.mjs` creates three applications with `createApp`, one database schema per participant in the database of `TCK_DATABASE_URL`, one shared memory transport, three memory offer stores and three memory twin registries.
- `tck/lib/scenario.mjs` exports the fixture builders that the sixteen test files share: `givenOriginalPassport(participant, overrides)`, `givenAccessMap(participant, modelId)` and `givenNewPassport(operator, predecessors, operation, overrides)`. Each builder calls only the endpoints of §9.3.

### 9.3 Interfaces

The base path of every endpoint is `/api`. The parameter `:passportId` is `passports.id`. The parameter `:modelId` is `battery_models.id`. The column "Subject" names the subject kind of §9.2.3 and the capability.

| Endpoint id | Method and path | Subject and capability | Request body (§10.2) | Success | Route file |
|---|---|---|---|---|---|
| `EP-RX-NEW-PASSPORT` | POST `/lifecycle-notifications/NewPassportIssued` | partner, `notification.receive` | the message of §10.1 | 200, `NotificationAccepted` | `server/src/routes/lifecycleNotificationRoutes.mjs` |
| `EP-RX-REPAIRED` | POST `/lifecycle-notifications/BatteryRepaired` | partner, `notification.receive` | the message of §10.1 | 200, `NotificationAccepted` | `server/src/routes/lifecycleNotificationRoutes.mjs` |
| `EP-RX-WASTE` | POST `/lifecycle-notifications/BatteryBecameWaste` | partner, `notification.receive` | the message of §10.1 | 200, `NotificationAccepted` | `server/src/routes/lifecycleNotificationRoutes.mjs` |
| `EP-RX-ENDED` | POST `/lifecycle-notifications/PassportEnded` | partner, `notification.receive` | the message of §10.1 | 200, `NotificationAccepted` | `server/src/routes/lifecycleNotificationRoutes.mjs` |
| `EP-SUBMODEL` | GET `/passports/:passportId/submodels/:aspectKey` | partner or operator, `submodel.read` | none | 200, the bare payload | `server/src/routes/submodelRoutes.mjs` |
| `EP-ACCESS-MAP` | GET `/battery-models/:modelId/submodels/access-map` | partner or operator, `submodel.read` | none | 200, the bare payload of section 3.4 of the proposal | `server/src/routes/submodelRoutes.mjs` |
| `EP-MODEL-CREATE` | POST `/battery-models` | operator, `passport.create` | `batteryModel` | 201, the model; the PartType twin registered | `server/src/routes/batteryModelRoutes.mjs` |
| `EP-ACCESS-MAP-PUT` | PUT `/battery-models/:modelId/access-map` | operator, `access-map.write` | the payload of section 3.4 of the proposal | 201, the stored version; the access map offer published | `server/src/routes/batteryModelRoutes.mjs` |
| `EP-PASSPORT-CREATE` | POST `/passports` | operator, `passport.create` | `createPassport` | 201, the passport; the PartInstance twin registered | `server/src/routes/passportRoutes.mjs` |
| `EP-ASPECT-PUT` | PUT `/passports/:passportId/aspects/:aspectKey` | operator, `passport.write` | the payload of the aspect | 200; the offers of the passport published again | `server/src/routes/passportRoutes.mjs` |
| `EP-ISSUE-NEW-PASSPORT` | POST `/passports/new-passport` | operator, `passport.issue` | `issueNewPassport` | 201, the new passport, `twin` and `notifications` | `server/src/routes/passportRoutes.mjs` |
| `EP-TWIN` | POST `/passports/:passportId/twin` | operator, `passport.write` | none | 200, `twin` | `server/src/routes/passportRoutes.mjs` |
| `EP-FORWARD-LINK` | POST `/passports/:passportId/forward-links` | operator, `passport.write` | `forwardLink` | 201, the successor link; the successors offer published | `server/src/routes/passportRoutes.mjs` |
| `EP-ACCESS-RECORD` | POST `/passports/:passportId/access-records` | operator, `passport.write` | `accessRecord` | 201, the record; the offers of the passport published again | `server/src/routes/passportRoutes.mjs` |
| `EP-ACCESS-RECORD-END` | DELETE `/passports/:passportId/access-records/:recordId` | operator, `passport.write` | none | 200, the closed record; the offers published again | `server/src/routes/passportRoutes.mjs` |
| `EP-PURCHASER` | POST `/passports/:passportId/purchaser` | operator, `passport.write` | `purchaserChange` | 200, the closed and the opened record | `server/src/routes/passportRoutes.mjs` |
| `EP-SUCCESSOR-AUTHORISATION` | POST `/passports/:passportId/successor-authorisation` | operator, `passport.write` | `successorAuthorisation` | 200, the passport | `server/src/routes/passportRoutes.mjs` |
| `EP-PASSPORT-READ` | GET `/passports/:passportId` | operator, `passport.write` | none | 200, the passport record of §10.2 | `server/src/routes/passportRoutes.mjs` |
| `EP-REPORT-REPAIR` | POST `/lifecycle-events/repair` | operator, `lifecycle.report` | `reportRepair` | 202, `notifications` | `server/src/routes/lifecycleEventRoutes.mjs` |
| `EP-REPORT-WASTE` | POST `/lifecycle-events/waste` | operator, `lifecycle.report` | `reportWaste` | 202, `notifications` | `server/src/routes/lifecycleEventRoutes.mjs` |
| `EP-REPORT-RECYCLING` | POST `/lifecycle-events/recycling` | operator, `lifecycle.report` | `reportRecycling` | 202, `notifications` | `server/src/routes/lifecycleEventRoutes.mjs` |
| `EP-NOTIFICATIONS-SENT` | GET `/notifications/sent` | operator, `notification.read` | none | 200, the list of the sent records | `server/src/routes/notificationRecordRoutes.mjs` |
| `EP-NOTIFICATIONS-RECEIVED` | GET `/notifications/received` | operator, `notification.read` | none | 200, the list of the received records | `server/src/routes/notificationRecordRoutes.mjs` |
| `EP-HEALTH` | GET `/health` (outside `/api`) | none | none | 200, `{ "status": "up" }` after `SELECT 1` succeeds; 503 otherwise | `server/src/routes/healthRoutes.mjs` |

- **The order on every route except `EP-HEALTH`**: `authenticate`, then `requireCapability`, then the body validation of `server/src/validation/schemaValidator.mjs`, then one call of `withTransaction` around one service call, then the response.
- **Success bodies.** An operator endpoint answers `{ "success": true, "data": { ... } }`. `EP-SUBMODEL` and `EP-ACCESS-MAP` answer the bare payload (decision Q-409 (whether served aspect payloads skip the response envelope)). A receiving endpoint answers the body of `NotificationAccepted`: `{ "messageId": "<the messageId of the header>", "outcome": "applied" | "recorded" | "duplicate" }`.
- **The field `notifications`** lists one object `{ messageId, operation, receiverBpnl, passportIdentifier, outcome, notBefore }` per planned notification, with the outcome `pending`, and the field holds an empty list when the plan is empty.
- **The field `twin`** is `{ "registered": true, "shellId": "<id>" }` or `{ "registered": false, "cause": "<text>" }`.
- **Methods.** A receiving endpoint accepts POST only, and every other method on its path answers 405 with `ERR-RX-METHOD-NOT-ALLOWED` (SwR-BACKEND-147 (Notification endpoints offered with HTTP POST only)).
- **The paths of the OpenAPI file.** `docs/api/openAPI.yaml` declares the server address `{baseUrl}/api/lifecycle-notifications` and the four paths `/NewPassportIssued`, `/BatteryRepaired`, `/BatteryBecameWaste` and `/PassportEnded`, each with the `operationId` equal to the operation name, and the API version `1.0.0` only in `info.version`. The operator endpoints are not part of the OpenAPI file (D26).

### 9.4 Database

One deployment serves one company, and one database holds the passports of which that company is the data provider (open decision OD-2). The seven groups of the table are the groups that open decision OD-2 names. Every table has `created_at timestamptz NOT NULL DEFAULT now()`. A column of the form `<name>_bpnl` has the type `text` and the constraint `CHECK (<name>_bpnl ~ '^BPNL[A-Z0-9]{12}$')`.

| Group | Table | Columns, in the order of the definition |
|---|---|---|
| companies | `companies` | `bpnl` PRIMARY KEY; `legal_name text NOT NULL`; `address jsonb NOT NULL` (the object of the nameplate element AddressInformation); `operator_identifier text` |
| passports | `battery_models` | `id uuid PRIMARY KEY DEFAULT gen_random_uuid()` (the `catenaXId` of the PartType twin); `manufacturer_bpnl NOT NULL REFERENCES companies ON DELETE RESTRICT`; `manufacturer_part_id text NOT NULL`; `original_model_catena_x_id uuid` and `original_model_manufacturer_bpnl` (both set, or both null; D35); `UNIQUE (manufacturer_bpnl, manufacturer_part_id)` |
| passports | `passports` | `id uuid PRIMARY KEY DEFAULT gen_random_uuid()` (the `catenaXId` of the PartInstance twin); `passport_identifier text NOT NULL UNIQUE DEFAULT ('urn:uuid:' \|\| gen_random_uuid()::text)`; `battery_identifier text NOT NULL`; `manufacturer_bpnl NOT NULL REFERENCES companies ON DELETE RESTRICT`; `battery_model_id uuid NOT NULL REFERENCES battery_models ON DELETE RESTRICT`; `lifecycle_status text NOT NULL CHECK (lifecycle_status IN ('original','repurposed','re-used','remanufactured','waste'))`; `battery_category text NOT NULL CHECK (battery_category IN ('lmt','ev','industrial','stationary'))`; `facility_bpns text`; `date_of_manufacture date NOT NULL`; `date_into_service date NOT NULL`; `rated_capacity_ah numeric(10,2) CHECK (rated_capacity_ah > 0)`; `capacity_fade_percent numeric(5,2) CHECK (capacity_fade_percent BETWEEN 0 AND 100)`; `power_fade_percent numeric(5,2) CHECK (power_fade_percent BETWEEN 0 AND 100)`; `expected_lifetime_years numeric(4,1) CHECK (expected_lifetime_years > 0)`; `waste_successor_bpnl`; `waste_successor_role text CHECK (waste_successor_role IN ('producer','producerResponsibilityOrganisation','wasteManagementOperator'))`; `waste_date timestamptz`; `successor_authorisation_ref text`; `recycling_date timestamptz`; `recycler_bpnl`; `material_recycling_certificate_catena_x_id uuid`; `CHECK (lifecycle_status <> 'waste' OR (waste_successor_bpnl IS NOT NULL AND waste_successor_role IS NOT NULL AND waste_date IS NOT NULL))`; `CHECK (recycling_date IS NULL OR (lifecycle_status = 'waste' AND recycler_bpnl IS NOT NULL))` |
| passports | `passport_purposes` | `id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY`; `passport_id uuid NOT NULL REFERENCES passports`; `purpose text NOT NULL`; `is_original boolean NOT NULL`; `recorded_at timestamptz NOT NULL`; a partial unique index on `(passport_id) WHERE is_original` |
| passports | `passport_aspect_payloads` | `passport_id uuid NOT NULL REFERENCES passports`; `aspect_key text NOT NULL CHECK (aspect_key IN (<the ten stored keys of §10.6>))`; `payload jsonb NOT NULL`; `PRIMARY KEY (passport_id, aspect_key)` |
| lineage links | `passport_lineage_links` | `id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY`; `passport_id uuid NOT NULL REFERENCES passports` (the new passport); `predecessor_passport_identifier text NOT NULL`; `predecessor_catena_x_id uuid NOT NULL`; `predecessor_data_provider_bpnl NOT NULL`; `predecessor_battery_identifier text NOT NULL`; `predecessor_status text NOT NULL` with the CHECK of `lifecycle_status`; `operation text NOT NULL CHECK (operation IN ('preparationForReUse','preparationForRepurposing','repurposing','remanufacturing'))`; `operation_date timestamptz NOT NULL`; `UNIQUE (passport_id, predecessor_passport_identifier)` |
| lineage links | `passport_successor_links` | `id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY`; `passport_id uuid NOT NULL REFERENCES passports` (the original passport); `successor_passport_identifier text NOT NULL`; `successor_catena_x_id uuid NOT NULL`; `second_life_operator_bpnl NOT NULL`; `operation text NOT NULL` with the CHECK of `passport_lineage_links.operation`; `operation_date timestamptz NOT NULL`; `notification_message_id text NOT NULL REFERENCES notifications_received`; `UNIQUE (passport_id, successor_passport_identifier)` |
| repair entries | `passport_repair_entries` | `id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY`; `passport_id uuid NOT NULL REFERENCES passports`; `repair_date timestamptz NOT NULL`; `repair_certificate_catena_x_id uuid NOT NULL`; `repairer_bpnl NOT NULL`; `notification_message_id text REFERENCES notifications_received` (null for a local application); `UNIQUE (passport_id, repair_certificate_catena_x_id)` |
| responsibility timeline | `passport_responsibility_intervals` | `id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY`; `passport_id uuid NOT NULL REFERENCES passports`; `responsible_bpnl NOT NULL`; `role text NOT NULL CHECK (role IN ('economicOperator','producer','producerResponsibilityOrganisation','wasteManagementOperator'))`; `valid_from timestamptz NOT NULL`; `valid_to timestamptz CHECK (valid_to > valid_from)`; a partial unique index on `(passport_id) WHERE valid_to IS NULL` |
| notifications sent and received | `notifications_sent` | `id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY`; `message_id text NOT NULL UNIQUE`; `operation text NOT NULL` (one of the four operation names); `receiver_bpnl NOT NULL`; `passport_identifier text NOT NULL`; `message jsonb NOT NULL`; `not_before timestamptz NOT NULL`; `outcome text NOT NULL DEFAULT 'pending' CHECK (outcome IN ('pending','sent','no_asset','contract_refused','receiver_refused','transport_failed'))`; `cause text`; `http_status integer`; `attempted_at timestamptz` |
| notifications sent and received | `notifications_received` | `message_id text PRIMARY KEY`; `operation text NOT NULL`; `sender_bpnl NOT NULL`; `passport_identifier text NOT NULL`; `message jsonb NOT NULL`; `outcome text NOT NULL CHECK (outcome IN ('applied','recorded'))`; `received_at timestamptz NOT NULL` |
| access map | `access_map_versions` | `id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY`; `battery_model_id uuid NOT NULL REFERENCES battery_models`; `map_version text NOT NULL`; `valid_from date NOT NULL`; `UNIQUE (battery_model_id, map_version)` |
| access map | `access_map_entries` | `map_id bigint NOT NULL REFERENCES access_map_versions`; `aspect text NOT NULL`; `twin_level text NOT NULL CHECK (twin_level IN ('PartType','PartInstance'))`; `path text NOT NULL`; `access_group text NOT NULL CHECK (access_group IN ('public','legitimateInterestModel','authorities','legitimateInterestBattery'))`; `legal_basis text NOT NULL`; `PRIMARY KEY (map_id, aspect, twin_level, path)` |
| access map | `passport_access_records` | `id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY`; `passport_id uuid NOT NULL REFERENCES passports`; `recipient_bpnl NOT NULL`; `recipient_role text NOT NULL CHECK (recipient_role IN ('purchaser','purchaserAgent','responsibleOperator','successor','marketSurveillanceAuthority','authorisedRecipient'))`; `aspect_key text NOT NULL`; `access_group text NOT NULL` with the CHECK of `access_map_entries.access_group`; `valid_from timestamptz NOT NULL`; `valid_to timestamptz` |

The table `schema_migrations` (`name text PRIMARY KEY`, `applied_at timestamptz NOT NULL`) belongs to no group. The grain of the four performance values `rated_capacity_ah` (Ah), `capacity_fade_percent` (%), `power_fade_percent` (%) and `expected_lifetime_years` (calendar years) is one value per passport. The four values are set on every passport that has a lineage link, because DIN DKE SPEC 99100 clauses 6.7.2.2 e), 6.7.2.4, 6.7.3.4 and 6.7.6.2 d) require the update at a new placing on the market (section 2.1.1 item 6 of the proposal), and the four values are never taken from another passport (D15).

The file `server/src/db/migrations/002_triggers.sql` defines these functions and triggers. Each function raises an exception with `ERRCODE = 'P0001'` and a message that starts with the refusal id of the last column, which `server/src/routes/errorHandler.mjs` maps to the refusal.

| Trigger | Table and event | Rule | Refusal id |
|---|---|---|---|
| `trg_passport_identity` | `passports`, BEFORE UPDATE | refuses a change of `id`, `passport_identifier`, `battery_identifier`, `manufacturer_bpnl` or `battery_model_id`, for every database role (D16) | `ERR-DB-IDENTITY-PERMANENT` |
| `trg_passport_status_change` | `passports`, BEFORE UPDATE OF `lifecycle_status` | admits a change to `waste` from every other status, and a change to `re-used` from `original`, `repurposed`, `re-used` and `remanufactured`; refuses every other change | `ERR-DB-STATUS-CHANGE` |
| `trg_passport_ended` | `passports`, BEFORE UPDATE OR DELETE | refuses every change and every deletion of a passport whose stored `recycling_date` is set | `ERR-DB-PASSPORT-ENDED` |
| `trg_passport_after_waste` | `passports`, BEFORE UPDATE | on a passport whose stored status is `waste` and whose stored `successor_authorisation_ref` is null, admits only a change of `successor_authorisation_ref`, `recycling_date`, `recycler_bpnl` and `material_recycling_certificate_catena_x_id`; refuses a second change of a set `successor_authorisation_ref` | `ERR-DB-SUCCESSOR-AUTHORISATION` |
| `trg_passport_waste_successor` | `passports`, constraint trigger AFTER INSERT OR UPDATE, DEFERRABLE INITIALLY DEFERRED | at commit, a passport in the status `waste` has one open responsibility interval whose `responsible_bpnl` equals `waste_successor_bpnl` and whose `role` equals `waste_successor_role`; when `waste_successor_role` is `producer`, `waste_successor_bpnl` equals `manufacturer_bpnl` (D17) | `ERR-DB-WASTE-SUCCESSOR` |
| `trg_passport_lineage` | `passports`, constraint trigger AFTER INSERT, DEFERRABLE INITIALLY DEFERRED | at commit, a passport inserted with the status `original` has no lineage link; a passport inserted with the status `re-used`, `repurposed` or `remanufactured` has one lineage link or more and its four performance values set; an insert with the status `waste` is refused | `ERR-DB-LINEAGE` |
| `trg_passport_one_responsible` | `passport_responsibility_intervals`, constraint trigger AFTER INSERT OR UPDATE, DEFERRABLE INITIALLY DEFERRED | at commit, the passport of the interval has exactly one interval whose `valid_to` is null | `ERR-DB-RESPONSIBILITY` |
| `trg_append_only` | `passport_lineage_links`, `passport_repair_entries`, `passport_successor_links`, `notifications_received`: BEFORE UPDATE OR DELETE; `passport_responsibility_intervals`: BEFORE DELETE, and BEFORE UPDATE that changes a column other than `valid_to` or changes a set `valid_to` | refuses the statement | `ERR-DB-APPEND-ONLY` |
| `trg_child_of_ended_passport` | `passport_aspect_payloads`, `passport_successor_links`, `passport_repair_entries`, `passport_purposes`: BEFORE INSERT OR UPDATE OR DELETE | refuses the statement when the passport's `recycling_date` is set | `ERR-DB-PASSPORT-ENDED` |

The file `server/src/db/migrations/003_policies.sql` creates the role `refserver_app` with `NOLOGIN` when the role does not exist, grants the role to the current user, grants `SELECT, INSERT, UPDATE, DELETE` on every table of this section except `schema_migrations` and `USAGE` on every sequence of the schema, and runs `ENABLE ROW LEVEL SECURITY` and `FORCE ROW LEVEL SECURITY` on `passports` and on the seven tables with a column `passport_id`. Each of the eight tables has one policy `FOR ALL TO refserver_app` whose `USING` and `WITH CHECK` expression is true when `manufacturer_bpnl` of the passport equals `current_setting('app.acting_bpnl', true)`; the policy of a table with `passport_id` reads the passport through `EXISTS`. A transaction without the setting therefore reads and writes no passport (D24).

### 9.5 Strings

The body of every refusal has this form (D9), which `docs/api/schemas/ErrorResponse.schema.json` defines:

```json
{
  "success": false,
  "error": { "message": "<text>", "code": "<refusal id>" },
  "messages": [{ "messageType": "Error", "text": "<text>" }]
}
```

A validation refusal adds one entry to `messages` per validator error, with the instance path and the validator message as `text`. The texts are exactly these, held in `REFUSALS` of `server/src/dataset/refusals.mjs`. Each text has four sentences: what happened, why the rule exists, who must act, and the next action.

| Refusal id | Status | Text |
|---|---|---|
| `ERR-RX-HEADER-INVALID` | 400 | The notification was refused because its header does not validate against the MessageHeader schema. The receiver cannot identify the message, the sender or the receiver without a valid header. The sender must correct the header. Resend the notification with the fields that the following messages name. |
| `ERR-RX-CONTENT-INVALID` | 400 | The notification was refused because its content does not validate against the schema of its operation. The receiver applies only content that the published OpenAPI specification defines. The sender must correct the content. Resend the notification with the fields that the following messages name. |
| `ERR-RX-CONTEXT-MISMATCH` | 400 | The notification was refused because the header context does not name the operation of the endpoint. The receiver cannot tell which step to apply when the context and the endpoint differ. The sender must set the context of the operation. Resend the notification to the endpoint whose name the context carries. |
| `ERR-RX-RECEIVER-MISMATCH` | 400 | The notification was refused because the header names another company as receiver. A receiver accepts only the notifications addressed to its own BPNL. The sender must address the notification to the BPNL of the receiver. Resend the notification with the receiver's BPNL in the header. |
| `ERR-RX-SENDER-MISMATCH` | 403 | The notification was refused because the sender BPNL of the header differs from the BPNL that the connector presented. The receiver accepts a notification only from the participant that negotiated the contract. The sender must set its own BPNL in the header. Resend the notification through the sender's own connector. |
| `ERR-RX-PASSPORT-UNKNOWN` | 404 | The notification was refused because no passport of this data provider carries the named passport identifier. The receiver changes only passports of which the receiver is the data provider. The sender must check the passport identifier and the manufacturerId of the twin. Resend the notification to the data provider of that passport. |
| `ERR-RX-STEP-REFUSED` | 422 | The notification was refused because the current state of the passport does not admit the step of this operation. The receiver applies a lifecycle step only from the statuses that the step admits. The sender must check the battery status. Send the notification of the step that the current status admits. |
| `ERR-RX-SUCCESSOR-NOT-PRODUCER` | 422 | The notification was refused because the named successor has the role producer and is not the manufacturer of record of the passport. The producer of a passport is the operator that placed its battery on the market. The sender must name the successor with its actual role. Resend the notification with the role of the named successor. |
| `ERR-RX-METHOD-NOT-ALLOWED` | 405 | The request was refused because a notification endpoint accepts the method POST only. A notification API offers one POST endpoint per operation. The sender must use POST. Resend the notification with the method POST. |
| `ERR-RX-INTERNAL` | 500 | The notification was not applied because the receiver failed to store the notification. The receiver has recorded nothing of this message. The operator of the receiver must act, and the sender has nothing to correct. Resend the notification with the same messageId later. |
| `ERR-AC-UNAUTHENTICATED` | 401 | The request was refused because the request carries no valid data plane key and no valid operator token. The server answers only an authenticated subject. The caller must present its credential. Repeat the request with the credential. |
| `ERR-AC-CAPABILITY-MISSING` | 403 | The request was refused because the subject lacks the capability of this endpoint. Each endpoint requires one capability. The caller must use an endpoint of its subject kind. Repeat the request on an endpoint that the subject may call. |
| `ERR-AC-ACCESS-GROUP-REFUSED` | 403 | The submodel was not served because no access record of the passport names the reader for the access group of this submodel. The access map assigns every field to one access group of Annex XIII of Regulation (EU) 2023/1542. The data provider must record the reader. Request the submodel again after the data provider has recorded the access. |
| `ERR-LC-BODY-INVALID` | 400 | The request was refused because its body does not validate against the schema of the endpoint. The server applies only a body that its schema defines. The operator must correct the body. Repeat the request with the fields that the following messages name. |
| `ERR-LC-NOT-DATA-PROVIDER` | 403 | The action was refused because the company of this deployment is not the data provider of the passport. Only the data provider writes into a passport. The data provider must apply the change. Report the lifecycle event to the data provider through the lifecycle notification API. |
| `ERR-LC-PASSPORT-NOT-FOUND` | 404 | The action was refused because this deployment holds no passport with this id. A deployment holds only the passports of its own company. The operator must check the passport id. Repeat the request with the id of a passport of this deployment. |
| `ERR-LC-SUBMODEL-NOT-FOUND` | 404 | The submodel was not served because the passport holds no payload of this aspect key. The data provider supplies each payload. The data provider must supply the payload. Request the submodel again after the data provider has supplied the payload. |
| `ERR-LC-OPERATION-NOT-ADMITTED` | 409 | The new passport was refused because the status or the purpose of a predecessor does not admit the operation. Each of the four operations is admitted only from the statuses and purposes of its rule. The second-life operator must choose the operation that the predecessor admits. Repeat the request with that operation. |
| `ERR-LC-IDENTIFIER-RULE` | 409 | The new passport was refused because its passport identifier or its battery identifier breaks the identifier rule. A new passport has a new passport identifier, and the battery identifier is kept for one battery and renewed for a battery made from several batteries. The second-life operator must correct the identifiers. Repeat the request with identifiers that follow the rule. |
| `ERR-LC-STATUS-NOT-ADMITTED` | 409 | The action was refused because the status of the passport does not admit the action. Each action is admitted only from the statuses of its rule. The operator must choose the action that the status admits. Read the passport and repeat the request with that action. |
| `ERR-LC-PASSPORT-ENDED` | 409 | The action was refused because the passport has ended after the recycling of its battery. An ended passport accepts no further change. The operator has nothing to change on this passport. Read the ended passport as the passport stands. |
| `ERR-LC-SUCCESSOR-AUTHORISATION-MISSING` | 403 | The action was refused because the passport is waste and no written authorisation of the successor is recorded. After the waste status the data provider changes the passport only under the written authorisation of the successor. The data provider must record the authorisation of the successor. Repeat the request once the authorisation is recorded. |
| `ERR-LC-AUTHORISATION-RECORDED` | 409 | The record was refused because the authorisation of the successor is already recorded. The authorisation of the successor is recorded once. The data provider has nothing to record. Read the passport as the passport stands. |
| `ERR-LC-NOTIFICATION-UNKNOWN` | 404 | The forward link was refused because no received NewPassportIssued notification for this passport carries the named messageId. A forward link follows only the notice of the second-life operator. The data provider must name a received notification. Read the received notifications and repeat the request with one messageId. |
| `ERR-LC-ROLE-NOT-ADMITTED` | 422 | The access record was refused because the role of the recipient is not admitted for this submodel. Once the implementing act under Article 77(9) of Regulation (EU) 2023/1542 applies, each restricted submodel is offered only to the roles of its rule. The data provider must name a role that the rule admits. Repeat the request with an admitted role. |
| `ERR-LC-PATH-NOT-SUPPORTED` | 422 | The access map was refused because a path lies outside the supported subset of JSONPath. The server evaluates only the selectors of its documented subset. The data provider must write the path with those selectors. Repeat the request with the corrected path. |
| `ERR-LC-ACCESS-MAP-INCOMPLETE` | 422 | The access map was refused because a served field has no entry or has entries of two access groups. The access map names exactly one access group for every served field. The data provider must complete the entries that the following messages name. Repeat the request with one entry per field. |
| `ERR-LC-ACCESS-MAP-VERSION-EXISTS` | 409 | The access map was refused because the battery model already holds this map version. A stored version of an access map never changes. The data provider must choose a new map version. Repeat the request with a new value of mapVersion. |
| `ERR-LC-INTERNAL` | 500 | The action was not applied because the server failed. The server has stored nothing of this request. The operator of the server must act. Repeat the request later. |

### 9.6 Configuration

`loadConfig` reads these variables and no other. A missing required variable stops the start (fail fast).

| Variable | Required | Default | Meaning |
|---|---|---|---|
| `OWN_BPNL` | yes | none | the BPNL of the company of the deployment; `^BPNL[A-Z0-9]{12}$` |
| `DATABASE_URL` | yes | none | the PostgreSQL connection string |
| `DATABASE_SCHEMA` | no | `public` | the schema of the tables; the in-process binding sets one schema per participant |
| `PORT` | no | `8080` | the port of the HTTP server |
| `PUBLIC_BASE_URL` | yes | none | the address under which the connector and the registry reach the server |
| `BINDING` | yes | none | `memory` or `connector` |
| `OPERATOR_TOKEN_SECRET` | yes | none | the key of the operator tokens; 32 characters or more |
| `DATA_PLANE_KEY` | yes | none | the key that the provider data plane presents; 32 characters or more |
| `DATA_PLANE_KEY_HEADER` | no | `x-api-key` | the name of the header that carries the key; not verified against a stored text |
| `PARTNER_BPN_HEADER` | no | `Edc-Bpn` | the name of the header in which the provider data plane passes the BPNL of the consumer; not verified against a stored text |
| `ACCESS_REGIME` | yes | none | `before-act` or `after-act` (D29) |
| `PASSPORT_ENDED_DELAY_SECONDS` | no | `5` | the delay of D1 |
| `OUTBOX_INTERVAL_MILLISECONDS` | no | `1000` | the interval of the worker |
| `PASSPORT_SERVICE_PROVIDER_BPNL` | no | none | a further receiver of PassportEnded (D34) |
| `PARTNER_CONNECTORS` | when `BINDING=connector` | none | a JSON object from BPNL to the Dataspace Protocol address of the partner's connector (D11) |
| `EDC_MANAGEMENT_URL`, `EDC_MANAGEMENT_API_KEY` | when `BINDING=connector` | none | the management API of the own connector and its key; the paths of the management API are not verified against a stored text |
| `EDC_MANAGEMENT_API_KEY_HEADER` | no | `x-api-key` | not verified against a stored text |
| `DTR_URL` | when `BINDING=connector` | none | the address of the own Digital Twin Registry, with the path prefix of its API; the path prefix is not verified against a stored text |
| `LOG_LEVEL` | no | `info` | `error`, `warn`, `info` or `debug` |

### 9.7 Workflows

Every workflow runs on `pull_request` and on `push` to `main`, on `ubuntu-latest`, with Node.js 24. The versions of the actions are pinned to a commit hash, and Dependabot updates them. The names of the actions and of the container images of this section are not verified against a stored text.

| File | Steps |
|---|---|
| `.github/workflows/checks.yml` | `node scripts/requirements-check.mjs`; `node scripts/check-sources.mjs`; `node scripts/check-license-headers.mjs`; `node scripts/check-private-references.mjs`; `python scripts/spec_gate_check.py` with the arguments of §18 |
| `.github/workflows/spectral.yml` | `npx @stoplight/spectral-cli@6 lint docs/api/openAPI.yaml --ruleset .spectral.yaml --fail-severity error`, on a change of `docs/api/` or of `.spectral.yaml` |
| `.github/workflows/samm.yml` | Java 21; download of the SAMM command line tool 2.11.1; checkout of the Tractus-X semantic model repository at a pinned commit as the models root; copy of the three folders of `models/` into the root; `java -jar samm-cli-2.11.1.jar aspect <model>.ttl validate` for each of the three models (D32) |
| `.github/workflows/tests.yml` | a PostgreSQL 17 service container; `npm ci` and `npm test` in `server/`; `npm ci` and `npm test` in `tck/` with `TCK_BINDING=in-process` |
| `.github/workflows/codeql.yml` | CodeQL analysis of the language `javascript-typescript`, also on a weekly schedule |
| `.github/workflows/trufflehog.yml` | TruffleHog scan of the pushed commits with the option that reports only verified secrets |
| `.github/dependabot.yml` | weekly updates of the ecosystems `npm` (directories `/server` and `/tck`), `github-actions` (directory `/`) and `docker` (directories `/server` and `/tck`) |

## 10. Data contract

### 10.1 The notification message

- **Form**: `{ "header": <MessageHeader>, "content": <content of the operation> }`, as `sources/Tractus-X/kits-26.09/industry-core-kit/software-development-view/notifications.mdx` states `[live]`. Both properties are required, and no other property is admitted.
- **Header** (`docs/api/schemas/MessageHeader.schema.json`): `messageId` (required; string of the form `urn:uuid:` and a UUID; unique per message), `context` (required; the string of the table), `sentDateTime` (required; RFC 3339 date and time), `senderBpn` and `receiverBpn` (required; `^BPNL[A-Z0-9]{12}$`), `version` (required; the constant `3.0.0`), `expectedResponseBy` and `relatedMessageId` (optional). The stored text shows the first seven properties `[live]`. The property `relatedMessageId` and the regular expressions of the aspect model `urn:samm:io.catenax.shared.message_header:3.0.0#MessageHeaderAspect` are not verified against a stored text.
- **Content**: the properties of Table 4.4 of the proposal. Every property is required except `materialRecyclingCertificateCatenaXId`. Every content schema sets `additionalProperties: false`.
- **Dialect**: each schema file declares `"$schema": "https://json-schema.org/draft/2020-12/schema"` and an `$id` equal to its file name (D21).

| Operation | Context | Content property | Type | Source on the sending side |
|---|---|---|---|---|
| NewPassportIssued | `BatteryPass-BatteryPassLifecycleNotificationAPI-NewPassportIssued:1` | `passportIdentifier` | string | `passports.passport_identifier` of the new passport |
| | | `catenaXId` | string, UUID version 4 | `passports.id` of the new passport |
| | | `operation` | one of the four values of `passport_lineage_links.operation` | the lineage link |
| | | `operationDate` | RFC 3339 date and time | `passport_lineage_links.operation_date` |
| | | `predecessorPassportIdentifier` | string | `passport_lineage_links.predecessor_passport_identifier` of the link that names the receiver |
| BatteryRepaired | `BatteryPass-BatteryPassLifecycleNotificationAPI-BatteryRepaired:1` | `passportIdentifier` | string | the request of `EP-REPORT-REPAIR` |
| | | `repairDate` | RFC 3339 date and time | the request |
| | | `repairCertificateCatenaXId` | string, UUID version 4 | the request |
| BatteryBecameWaste | `BatteryPass-BatteryPassLifecycleNotificationAPI-BatteryBecameWaste:1` | `passportIdentifier` | string | the request of `EP-REPORT-WASTE` |
| | | `successorBpnl` | BPNL | the request |
| | | `successorRole` | `producer`, `producerResponsibilityOrganisation` or `wasteManagementOperator` | the request |
| | | `date` | RFC 3339 date and time | the request field `wasteDate` |
| PassportEnded | `BatteryPass-BatteryPassLifecycleNotificationAPI-PassportEnded:1` | `passportIdentifier` | string | the request of `EP-REPORT-RECYCLING` |
| | | `recyclingDate` | RFC 3339 date and time | the request |
| | | `recyclerBpnl` | BPNL | `config.ownBpnl` of the reporting deployment |
| | | `materialRecyclingCertificateCatenaXId` | string, UUID version 4, optional | the request |

Each operation of `docs/api/openAPI.yaml` defines the responses `200` (`NotificationAccepted`), `400`, `403`, `404`, `405`, `422` and `500`, and each of the six error responses references `ErrorResponse.schema.json` as a required body.

### 10.2 The request bodies of the operator endpoints

Every schema of `server/schemas/` sets `additionalProperties: false`. A body that fails its schema answers `ERR-LC-BODY-INVALID`. A property of the form `<name>Bpnl` matches `^BPNL[A-Z0-9]{12}$`.

| Schema | Properties | Rule |
|---|---|---|
| `batteryModel` | `manufacturerPartId` (required, 1 to 200 characters); `originalModel` (optional) with `catenaXId` (UUID) and `manufacturerBpnl` | the model is stored for the own company |
| `createPassport` | `batteryModelId` (UUID), `batteryIdentifier`, `batteryCategory`, `dateOfManufacture`, `dateIntoService` (dates), `originalPurpose` (1 to 2000 characters), all required; `facilityBpns` (`^BPNS[A-Z0-9]{12}$`), `passportIdentifier` (optional) | the status is `original` |
| `issueNewPassport` | `operation` (one of the four lineage operations), `predecessors` (1 to 20 entries, each with `passportIdentifier`, `catenaXId`, `dataProviderBpnl`, `batteryIdentifier`, `lifeCycleStage`, `originalPurpose`, all required), `batteryModelId`, `batteryIdentifier`, `batteryCategory`, `purpose`, `dateOfManufacture` (the date of the treatment), `dateIntoService`, `ratedCapacityAh`, `capacityFadePercent`, `powerFadePercent`, `expectedLifetimeYears`, all required; `operationDate` (optional; the current time of the clock when absent), `facilityBpns`, `passportIdentifier` (optional) | D13, D14, D15, D40 |
| `reportRepair` | `passportIdentifier`, `dataProviderBpnl`, `repairDate`, `repairCertificateCatenaXId`, all required | the receiver is `dataProviderBpnl` |
| `reportWaste` | `passportIdentifier`, `dataProviderBpnl`, `successorBpnl`, `successorRole`, `wasteDate`, all required | the receivers of §10.3 |
| `reportRecycling` | `passportIdentifier`, `dataProviderBpnl`, `nameplateManufacturerBpnl`, `receivedFromSuccessorBpnl`, `recyclingDate`, all required; `materialRecyclingCertificateCatenaXId`, `predecessorDataProviderBpnls` (0 to 20 BPNLs) (optional) | the receivers of §10.3 |
| `forwardLink` | `messageId` (required) | the `message_id` of a received NewPassportIssued |
| `accessRecord` | `recipientBpnl`, `recipientRole`, `aspectKey`, all required | D29 |
| `purchaserChange` | `purchaserBpnl` (required), the BPNL of the application acting for the new purchaser; `purchaserAgentBpnl` (optional) | D30 |
| `successorAuthorisation` | `authorisationRef` (required, 1 to 500 characters), the reference of the successor's written authorisation | D18 |

The passport record that `EP-PASSPORT-READ` and the operator endpoints answer holds `id`, `passportIdentifier`, `batteryIdentifier`, `manufacturerBpnl`, `batteryModelId`, `lifecycleStatus`, `batteryCategory`, `dateOfManufacture`, `dateIntoService`, the four performance values, `wasteSuccessor` (null, or `successorBpnl`, `successorRole` and `date`), `successorAuthorisationRef`, `endOfPassport` (null, or `recyclingDate`, `recyclerBpnl` and `materialRecyclingCertificateCatenaXId`), `isSuperseded` (true when the passport has a successor link) and `responsibleOperator` (the open responsibility interval).

### 10.3 The receivers

| Operation | Receivers | Source of each BPNL |
|---|---|---|
| NewPassportIssued | the data provider of each original passport, one notification per predecessor link | `predecessors[].dataProviderBpnl` of the request |
| BatteryRepaired | the data provider of the passport | `dataProviderBpnl` |
| BatteryBecameWaste | the data provider of the passport; the named successor | `dataProviderBpnl`; `successorBpnl` |
| PassportEnded | the data provider of the passport; the manufacturer that the nameplate names; the successor from whom the recycler received the battery; the data provider of each predecessor passport that the request names; the passport service provider when configured (D34) | `dataProviderBpnl`; `nameplateManufacturerBpnl`; `receivedFromSuccessorBpnl`; `predecessorDataProviderBpnls`; `config.passportServiceProviderBpnl` |

Two rules that name one BPNL for one passport produce one notification. A receiver equal to the own BPNL produces no notification (D12). A remanufacturing from two original passports of one data provider produces two notifications to that data provider. The value of `not_before` is the current time of the clock for the first three operations, and the current time plus `config.passportEndedDelaySeconds` for PassportEnded (D1).

### 10.4 The receiving step and its failure mapping

A receiving endpoint runs these checks in this order, and the first failed check answers its refusal:

| Order | Check | Refusal id |
|---|---|---|
| first | the header validates against `MessageHeader.schema.json` | `ERR-RX-HEADER-INVALID` |
| second | the content validates against the schema of the operation | `ERR-RX-CONTENT-INVALID` |
| third | `header.context` equals the context of the endpoint's operation | `ERR-RX-CONTEXT-MISMATCH` |
| fourth | `header.receiverBpn` equals `config.ownBpnl` | `ERR-RX-RECEIVER-MISMATCH` |
| fifth | `header.senderBpn` equals the BPNL of the partner subject | `ERR-RX-SENDER-MISMATCH` |
| sixth | `notifications_received` holds no record with `header.messageId`; when the table holds one, the endpoint answers 200 with the outcome `duplicate` and applies nothing (D8) | none |
| seventh | the step of the table below | the refusal of the step |

| Operation | Passport that the content names | Step | Outcome |
|---|---|---|---|
| NewPassportIssued | `predecessorPassportIdentifier` names a passport of the own company | stores the received record and changes no passport (SwR-DATASET-205 (Original passport's status kept when a new passport supersedes it)) | `applied` |
| NewPassportIssued | no such passport | none | `ERR-RX-PASSPORT-UNKNOWN` |
| BatteryRepaired | `passportIdentifier` names a passport of the own company whose status is not `waste` | inserts the repair entry, sets the status `re-used`, stores the received record; a second notification with the same `repairCertificateCatenaXId` adds no entry (D19) | `applied` |
| BatteryRepaired | no such passport; or the status is `waste` or the passport has ended | none | `ERR-RX-PASSPORT-UNKNOWN`; `ERR-RX-STEP-REFUSED` |
| BatteryBecameWaste | a passport of the own company whose status is not `waste` | sets the status `waste` with the successor, the role and the date, closes the open responsibility interval, opens the successor's interval, adds the access record of the successor for the lifecycle submodel, stores the received record (D17) | `applied` |
| BatteryBecameWaste | a passport of the own company in the status `waste`; a role `producer` with a BPNL other than `manufacturer_bpnl` | none | `ERR-RX-STEP-REFUSED`; `ERR-RX-SUCCESSOR-NOT-PRODUCER` |
| BatteryBecameWaste | no passport of the own company | stores the received record (D7) | `recorded` |
| PassportEnded | a passport of the own company in the status `waste` that has not ended | sets `recycling_date`, `recycler_bpnl` and the certificate reference, stores the received record, and withdraws the dataset offers of §10.5 after the commit (D33) | `applied` |
| PassportEnded | a passport of the own company that is not waste or has ended | none | `ERR-RX-STEP-REFUSED` |
| PassportEnded | no passport of the own company | stores the received record (D7) | `recorded` |

An error that no check names answers `ERR-RX-INTERNAL`, and the transaction rolls back. A failed authentication answers `ERR-AC-UNAUTHENTICATED`, and a missing capability answers `ERR-AC-CAPABILITY-MISSING`; neither is a refusal of a lifecycle rule.

### 10.5 The connector asset and the data offers

| Offer | Asset id | `dct:type` and version | Path behind the data plane | Access (the `allowedBpnls` of the offer contract) | Usage purpose |
|---|---|---|---|---|---|
| the lifecycle notification API | `asset-lifecycle-notification-1.0` | `cx-taxo:BatteryPassLifecycleNotificationAPI`, `cx-common:version` `1.0` | `/api/lifecycle-notifications` | every participant | `cx.circular.dpp:1` |
| the lifecycle submodel of a passport | `lifecycle-<passports.id>` | the `dct:type` of CX-0160 1.1.0 section 4.1; semantic identifier of the model | `/api/passports/<passports.id>/submodels/lifecycle` | the BPNLs of the open access records of the aspect key `lifecycle` | `cx.circular.dpp:1` |
| the successors submodel of a passport | `successors-<passports.id>` | as above | `/api/passports/<passports.id>/submodels/successors` | the BPNLs of the open access records of the aspect key `successors` | `cx.circular.dpp:1` |
| each stored payload of a passport | `<aspectKey>-<passports.id>` | as above | `/api/passports/<passports.id>/submodels/<aspectKey>` | every participant when every entry of the aspect in the access map is `public`; otherwise the BPNLs of the open access records of the aspect key | `cx.circular.dpp:1` |
| the access map of a battery model | `access-map-<battery_models.id>` | as above | `/api/battery-models/<battery_models.id>/submodels/access-map` | every participant | `cx.circular.dpp:1` |

- The value of the `dct:type` of CX-0160 1.1.0 section 4.1 is not verified against a stored text, because CX-0160 1.1.0 is cited and not stored. The value is the constant `SUBMODEL_DCT_TYPE` of `server/src/connector/policyBuilder.mjs`, which phase P7 verifies.
- An offer with an empty list of BPNLs is not published, and an existing offer of that asset is withdrawn.
- `policyBuilder.mjs` adds the proposed usage purpose `cx.circular.dpp.lifecycle:1` to no offer, because CX-0152 has not registered the purpose (section 2.2 item 5 of the proposal).
- After the end of a passport, `withdrawDatasetOffers` withdraws the offers of the ten stored aspect keys of the passport and keeps the offers of the lifecycle submodel and of the successors submodel (D33).

### 10.6 The aspect keys, the models and the governed elements

| Aspect key | Semantic identifier | Twin | Payload source | Schema that validates a stored payload |
|---|---|---|---|---|
| `lifecycle` | `urn:samm:io.catenax.battery.passport_lifecycle:1.0.0#BatteryPassportLifecycle` | PartInstance; registered when the passport has a lineage link, a waste successor or an end | `readLifecyclePayload` | none: the payload is built |
| `successors` | `urn:samm:io.catenax.battery.passport_successors:1.0.0#BatteryPassportSuccessors` | PartInstance; registered when the passport has a successor link | `readSuccessorsPayload` | none: the payload is built |
| `access-map` | `urn:samm:io.catenax.battery.passport_access_map:1.0.0#BatteryPassportAccessMap` | PartType | `readAccessMap` | `models/io.catenax.battery.passport_access_map/1.0.0/gen/BatteryPassportAccessMap-schema.json`, a planned file of §7 |
| `digital-nameplate` | `urn:samm:io.admin-shell.idta.batterypass.digital_nameplate:1.0.0#BatteryNameplate` | PartInstance | stored | `sources/IDTA/io.admin-shell.idta.batterypass.digital_nameplate/1.0.0/gen/NameplateBattery-schema.json` |
| `technical-data` | `urn:samm:io.admin-shell.idta.batterypass.technical_data:1.0.0#TechnicalData` | PartInstance | stored | `sources/IDTA/io.admin-shell.idta.batterypass.technical_data/1.0.0/gen/TechnicalDataBattery-schema.json` |
| `product-condition` | `urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#ProductCondition` | PartInstance | stored | `sources/IDTA/io.admin-shell.idta.batterypass.product_condition/1.0.0/gen/ProductConditionBattery-schema.json` |
| `dpp-metadata` | `urn:samm:io.admin-shell.idta.dpp.dpp_metadata:1.0.0#DppMetadata` | PartInstance | stored | `sources/IDTA/io.admin-shell.idta.dpp.dpp_metadata/1.0.0/gen/DppMetadata-schema.json` |
| `handover-documentation`, `carbon-footprint`, `material-composition`, `circularity` | the identifiers of IDTA-02035-2, IDTA-02035-3, IDTA-02035-6 and IDTA-02035-7 version 1.0.0; the four identifiers are constants of `ASPECTS` and are not verified against a stored text | PartInstance | stored | none (D28) |
| `serial-part`, `single-level-bom-as-built` | the identifiers of the SerialPart and SingleLevelBomAsBuilt models of CX-0127; the two identifiers are constants of `ASPECTS` and are not verified against a stored text | PartInstance | stored | none (D28) |

The ten stored keys of `passport_aspect_payloads.aspect_key` are the ten keys whose payload source is "stored". The three models of `models/` hold exactly the properties, the characteristics and the enumeration values of sections 3.2.2, 3.3 and 3.4.2 of the proposal. Each model file uses the SAMM meta model 2.1.0 and the imports `urn:samm:io.catenax.shared.uuid:2.0.0#` and `urn:samm:io.catenax.shared.business_partner_number:2.0.0#`, the versions that `sources/Tractus-X/semantic-models/io.catenax.shared.recycling_strategy_certificate/3.0.0/RecyclingStrategyCertificate.ttl` imports `[live]`. Each `metadata.json` holds `{ "status": "draft" }`. Each `gen/<Aspect>.json` holds the example payload of the proposal, and the example of the successors model holds one link.

`readSubmodel` writes the governed elements over a stored payload at these paths, which the stored schemas of §6 hold `[live]`. A stored payload never supplies the value of a governed path.

| Aspect key | Path | Value |
|---|---|---|
| `digital-nameplate` | `$.ManufacturerIdentifier` | `passports.manufacturer_bpnl` |
| `digital-nameplate` | `$.ManufacturerName`, `$.AddressInformation`, `$.OperatorIdentifier` | `companies.legal_name`, `companies.address` and `companies.operator_identifier` of `manufacturer_bpnl` |
| `digital-nameplate` | `$.SerialNumber`, `$.UniqueFacilityIdentifier`, `$.DateOfManufacture`, `$.DateOfPuttingIntoService`, `$.LifeCycleStage` | `battery_identifier`, `facility_bpns`, `date_of_manufacture`, `date_into_service`, `lifecycle_status` |
| `technical-data` | `$.GeneralInformation.BatteryCategory`, `$.GeneralInformation.ManufacturerIdentifier` | `battery_category`, `manufacturer_bpnl` |
| `technical-data`, only on a passport with a lineage link | `$.TechnicalPropertyAreas.CapacityEnergyVoltage.RatedCapacity`, `$.TechnicalPropertyAreas.CapacityEnergyVoltage.CapacityFade`, `$.TechnicalPropertyAreas.PowerCapability.PowerFade`, `$.TechnicalPropertyAreas.Lifetime.ExpectedLifetimeInCalendarYears` | `rated_capacity_ah`, `capacity_fade_percent`, `power_fade_percent`, `expected_lifetime_years` |
| `dpp-metadata` | `$.digitalProductPassportId`, `$.uniqueProductIdentifier` | `passport_identifier`, `battery_identifier` |

### 10.7 Stand-ins, holding designs and contingencies

- **The receiver resolution** (D11). `createPartnerDirectory` resolves a BPNL from `config.partnerConnectors`. The owner of this repository owns the replacement by the BPN-DID Resolution Service of CX-0167 and the DID discovery of CX-0018 section 2.6. The marker is the case "the sender resolves the receiver through CX-0167 and CX-0018 section 2.6" of `tck/CAC-012.tck.mjs`, a planned file of §7, which is `test.skip` with the reason `owner: the owner of this repository; until: a BPN-DID Resolution Service runs in the connector binding`.
- **The connector binding** (open decision OD-3). `tck/docker-compose.yml` starts, for each of the three participants, one reference server built from `server/Dockerfile`, one PostgreSQL database, one connector control plane, one connector data plane and one Digital Twin Registry, and the services that the connector needs for its secrets and its identity. Every image name and every image version is a variable of `tck/.env.example`: `TCK_IMAGE_POSTGRES`, `TCK_IMAGE_CONTROL_PLANE`, `TCK_IMAGE_DATA_PLANE`, `TCK_IMAGE_DTR`, `TCK_IMAGE_VAULT` and `TCK_IMAGE_IDENTITY`. No image name, no image version, no path of the connector's management API, no property of a data address and no header of the data plane is verified against a stored text. Phase P7 starts with the verification of each value against the public documentation of the Tractus-X connector release that the owner names, and the implementer records each verified value with its public address in `tck/README.md`.
- **The contingency of the connector binding.** When phase P7 finds no set of public images that negotiates a contract between two connectors without a manual step, the implementer stops phase P7, keeps `TCK_BINDING=connector` failing at `startBinding()` with the message `connector binding not available: <cause>`, and reports the cause. The owner of this repository owns the decision. PrR-CXD-029 (Conformance tests run against the in-process binding and the connector binding) then stays unverified for the connector binding, and the completion record says so.
- **The four models without a stored text** (D28). The server stores and serves the payloads of `handover-documentation`, `carbon-footprint`, `material-composition` and `circularity` without a schema check. The marker is the comment `not validated: the aspect model is cited and not stored (D28)` at the four entries of `ASPECTS`.
- **The test data.** Every BPNL of a test and of a fixture is one of `BPNL00000000TCK1` (the data provider of the original passports), `BPNL00000000TCK2` (the second-life operator), `BPNL00000000TCK3` (the recycler and waste receiver), `BPNL00000000TCK4` (a successor without a deployment) and `BPNL00000000TCK5` (a purchaser's application without a deployment). The five values are invented and name no company.

## 11. Phases

Each phase ends with its done-when signal green. The implementer then continues with the next phase. The implementer stops and reports when a done-when signal stays red after a correction that this specification determines, when a phase is blocked by §5.7, or when a claim marked "not verified against a stored text" proves wrong.

### 11.1 Phase P1: the contract

The implementer writes the P1 files of §7. Done when: `npx @stoplight/spectral-cli@6 lint docs/api/openAPI.yaml --ruleset .spectral.yaml --fail-severity error` reports 0 errors; `grep -c "operationId:" docs/api/openAPI.yaml` prints 4; the four checks of §15 item 1 pass.

### 11.2 Phase P2: the models

The implementer writes the P2 files of §7. Done when: the command of §15 item 3 reports no error for each of the three models; each `gen/<Aspect>-schema.json` is the output of `java -jar samm-cli-2.11.1.jar aspect <model>.ttl to json-schema`; each example payload of the proposal validates against its generated schema.

### 11.3 Phase P3: the database

The implementer writes the P3 files of §7. Done when: `npm test` in `server/` runs `server/test/databaseRules.integration.test.mjs`, a planned file of §7, and reports `# fail 0`; a second call of `migrate` applies no file.

### 11.4 Phase P4: the services

The implementer writes the P4 files of §7: the configuration, the access control, the audit trail, the lifecycle executor with its repository, the submodel service, the access map service, the notification plan, the offer publisher and the twin descriptors, each with the memory implementation of its contract. Done when: `npm test` in `server/` reports `# fail 0`, and `ls server/test/*.test.mjs | wc -l` prints 16.

### 11.5 Phase P5: the application

The implementer writes the P5 files of §7: the composition root, the application factory, the routes, the sender, the memory transport and the worker. Done when: `npm test` in `server/` reports `# fail 0`; `ls server/test/*.test.mjs | wc -l` prints 26; the test `server/test/openApiContract.test.mjs`, a planned file of §7, validates every response of the four receiving endpoints against `docs/api/openAPI.yaml`; the server starts with `BINDING=memory`, and `curl -s http://localhost:8080/health` prints `{"status":"up"}`.

### 11.6 Phase P6: the conformance test kit on the in-process binding

The implementer writes the P6 files of §7. Done when: the command of §15 item 6 reports `# fail 0` and `# skipped 1`, the one skipped test being the case of §10.7, and the command of §15 item 8 prints 16.

### 11.7 Phase P7: the connector binding

The implementer verifies the values of §10.7 first, then writes the P7 files of §7. Done when: `docker compose -f tck/docker-compose.yml --env-file tck/.env up -d --wait` exits 0; the command of §15 item 7 reports `# fail 0`; `server/test/transportContract.test.mjs` and `server/test/twinRegistryContract.test.mjs`, two planned files of §7, pass for both implementations. The contingency of §10.7 applies otherwise.

### 11.8 Phase P8: the documentation, the remaining workflows and the registry states

The implementer writes the P8 files of §7. `docs/architecture/README.md` holds the twelve arc42 sections in this order: introduction and goals, constraints, context and scope, solution strategy, building block view, runtime view, deployment view, crosscutting concepts, architecture decisions, quality requirements, risks and technical debts, glossary. `docs/admin/README.md` states the five offers of §10.5 with their `dct:type`, version, data address, access policy and usage policy, and the configuration of §9.6. `docs/development-view.md` holds the sections API specification, semantic models, test cases, sample data and reference implementation. The implementer sets the field `implementation` of each software requirement of §5.2 to the state `implemented` with the files of the column "Implemented in". Done when: every command of §15 passes.

## 12. Decisions

### 12.1 Open decisions of the owner

**OD-1. How the reference server authenticates a caller without an identity provider.**

- Option A (recommended): a partner request is authenticated by the key of the provider data plane and carries the consumer's BPNL in a header that the data plane sets; an operator request is authenticated by a token that the operator signs with a key of the deployment (§9.2.3). Consequence: the server needs no further service, and the in-process binding and the connector binding use the same partner authentication, because the memory transport sets the same two headers as a data plane. The names of the two headers are configuration values, because no stored text of `sources/Tractus-X/` names them `[live]`. A deployment whose data plane passes no BPNL header cannot use option A.
- Option B: the server verifies a verifiable credential of the partner itself. Consequence: the server needs a wallet client and the trust list of the dataspace; no stored text defines the token.
- Option C: an OpenID Connect provider issues the operator tokens, and mutual TLS secures the data plane. Consequence: the test kit must start one more service, and the in-process binding no longer runs with Node.js and PostgreSQL alone.
- A change of the option changes `server/src/access/authenticate.mjs`, `server/src/access/operatorToken.mjs`, four variables of §9.6 and the function `call` of the test kit bindings.

**OD-2. What the database holds.**

- Option A (recommended): seven groups of tables: companies, passports, lineage links, repair entries, the responsibility timeline, notifications sent and received, and the access map (§9.4). The group "passports" also holds the battery models, the purposes and the supplied payloads, and the group "access map" also holds the access records, because the criteria CAC-002, CAC-003, CAC-010 and CAC-016 need them. Consequences: the audit trail is a structured log (§9.2.7); the recovered materials and the recycling efficiency have no table; the reference server does not build the sharing of individual battery information with the original issuer (the fourth group of §5.4). The last consequence differs from the answer of decision Q-1011 (whether the reference implementation builds use case UC-5), which names UC-5b, so option A needs the owner's word on that difference.
- Option B: option A and three more tables: an audit table, an issuer contract table and a table of the received individual battery information. Consequence: the server builds UC-5b as decision Q-1011 states; the change adds three endpoints, one consumer module and one test file, and moves the fourth group of §5.4 into §5.1 and §5.2.
- Option C: only the tables that the four notifications need (passports, lineage links, notifications). Consequence: the criteria CAC-002, CAC-003, CAC-010, CAC-013 and CAC-016 have no executable test.
- A change of the option changes §9.4, the first and the fourth group of §5.4 and §9.2.7.

**OD-3. Against which target the conformance tests run.**

- Option A (recommended): one test code and two bindings behind one contract (§9.2.9). The in-process binding starts three server instances (the data provider, the second-life operator, the recycler) on one PostgreSQL database with an in-memory transport, and needs only Node.js and PostgreSQL. The connector binding runs the same sixteen files through Tractus-X connectors and Digital Twin Registries that Docker Compose starts from public images. Consequence: the continuous integration runs the in-process binding on every change; the connector binding runs where Docker is available, and its image names and versions are configuration values that phase P7 verifies (§10.7).
- Option B: the connector binding only. Consequence: no test runs without Docker and without the public images, and a wrong image version blocks every criterion.
- Option C: the in-process binding only. Consequence: PrR-CXD-029 (Conformance tests run against the in-process binding and the connector binding) is not met.
- A change of the option changes §9.2.9, §10.7, phase P7 and the workflow `tests.yml`.

### 12.2 Decisions of this specification

**D1.** The notice of the end of a passport leaves 5 seconds after the recycling is recorded: the executor writes each PassportEnded notification with `not_before` equal to the record time plus `PASSPORT_ENDED_DELAY_SECONDS`, whose default is 5, and the worker sends no notification before `not_before`. SwR-BGWORK-020 (End of a recycled battery's passport sent in time) states the 5 seconds. This specification rejects a timer in the request, which a restart of the server loses, and a delay for the other three operations, which no requirement states.

**D2.** The reference server sends and receives exactly four notifications: NewPassportIssued, BatteryRepaired, BatteryBecameWaste and PassportEnded, with the contexts of §10.1 and one POST endpoint each. This specification rejects one endpoint with an operation field, which the stored notification rules exclude (one endpoint per operation), and a fifth notification for the change of purchaser, which Table 4.3 of the proposal does not hold.

**D3.** The access map is served on the PartType twin of the battery model (decision Q-200, how the dataset delivers each field's access group), and a recipient reads an aspect whole or not at all. Annex B point 19 of the proposal states that a payload without a mandatory restricted field is not valid. This specification rejects the removal of single fields from a payload, which produces payloads that fail their schema.

**D4.** Each of the two lifecycle models has one data offer of its own with its own access policy (decision Q-200, option 2 for the new models), because each model holds information of one access group. This specification rejects one offer for both models, which would give the readers of the forward links the waste successor.

**D5.** The three items that decision Q-202 (the carrier for lifecycle data the aspect models lack) leaves open are not implemented: the reference server serves no history of the responsible economic operators, no original placing date and no performance and durability values at each change of status. The table `passport_responsibility_intervals` holds the timeline for the rules of §9.4 and no endpoint serves the table to a partner. This specification rejects a fourth model, which the proposal does not define.

**D6.** One deployment serves one company, and only the data provider of a passport writes the passport, on its own deployment: every write checks `manufacturer_bpnl = ownBpnl` in the executor and in the policies of §9.4. This specification rejects several companies in one deployment, because a notification addressed to a second company of the deployment has no receiver identity, and rejects a write by the responsible operator or the successor into the data provider's database, which section 2.1.3 item 2 of the proposal forbids.

**D7.** A receiver accepts a notification when the BPNL that the data plane presents equals `header.senderBpn` and `header.receiverBpn` equals the own BPNL. A BatteryBecameWaste or a PassportEnded that names no passport of the own company is recorded and changes nothing, because Table 4.3 of the proposal also sends both operations to the successor, to the nameplate manufacturer and to predecessor data providers. This specification rejects a list of known senders per passport, which refuses the first notice of a waste receiver that the data provider has never met, and rejects a refusal of every notification that names a foreign passport, which makes two of the three receivers of PassportEnded unreachable.

**D8.** The receiving step is idempotent by `header.messageId`: a second message with a stored `messageId` answers 200 with the outcome `duplicate` and applies nothing. The stored notification rules allow a sender to send a message again with the same `messageId` after a transfer error. This specification rejects a refusal of the second message, which makes a retry fail.

**D9.** Every refusal answers the error envelope of the repository's API design together with the result object of AAS Part 2 (decision Q-409, whether served aspect payloads skip the response envelope), and each text states what failed, the reason and what the caller must do, as section 4.3 item 7 of the proposal requires. This specification rejects a status code without a body, because a sender then cannot tell a malformed content from an unknown passport.

**D10.** PassportEnded carries the reference to the CX-0131 material recycling certificate and no recovered masses, as Table 4.4 of the proposal states. The recovered materials are not public information, and the certificate is the record that a producer reads under its own contract. This specification rejects recovered masses in the content.

**D11.** A sender resolves the connector of a receiver from `PARTNER_CONNECTORS`, and the resolution through CX-0167 and CX-0018 section 2.6 is a holding design (§10.7). This specification rejects a client written against a service that no test starts.

**D12.** A receiver equal to the own BPNL receives no notification: the executor applies the step locally in the same transaction. This specification rejects a notification through the own connector to the own server, which costs a contract negotiation for no information.

**D13.** A new passport names each predecessor by the five properties of a predecessor link and by the status and the original purpose that the second-life operator read from the original passport. Each company has its own deployment, so an original passport of another data provider is no record of the second-life operator's database. The executor checks the admission rule on the declared values and stores the declared status in `predecessor_status`. This specification rejects a limit to predecessors of the own database, which excludes the main case of the proposal, and rejects a read of the original nameplate by the server, because the status is offered only to the purchaser and the server holds no contract of the purchaser.

**D14.** The battery identifier follows section 2.1.1 item 3 of the proposal: a request with one predecessor and an operation other than `remanufacturing` must carry the predecessor's battery identifier, and a request with the operation `remanufacturing` or with two or more predecessors must carry a battery identifier that differs from every predecessor's. A passport identifier that equals a predecessor's passport identifier is refused. Both failures answer `ERR-LC-IDENTIFIER-RULE`. This specification rejects a new battery identifier after every operation, which contradicts DIN DKE SPEC 99100 clause 6.1.2.2.

**D15.** A new passport holds its own battery category and its own four performance values, and takes none of the five values from a predecessor or from the battery model. `issueNewPassport` refuses a request without one of the four performance values through the schema (SwR-DATASET-206, Lineage step requires the treated battery's four performance values). This specification rejects a default from the original model, which hides a missing value.

**D16.** The manufacturer identification of a passport is permanent (SyR-LIFE-155, Manufacturer identification of a passport never changed after issue). The passport stores the identification in `manufacturer_bpnl`; the trigger `trg_passport_identity` refuses every change for every database role; the foreign key is `ON DELETE RESTRICT`; and no step writes the acting company into the column. The waste step and the end step write the successor and the recycler into their own columns. This specification rejects an exemption for a migration role, because the reference server migrates no earlier data.

**D17.** The database refuses the status `waste` without a named successor (SwR-RDB-074, Change to waste refused without a named successor): the CHECK constraint of `passports` requires the three successor columns, and the deferred trigger `trg_passport_waste_successor` requires the successor's open responsibility interval at commit. A successor with the role `producer` must be the manufacturer of record of the passport (SwR-DATASET-191, Waste step records the current passport's producer, not the actor). This specification rejects a check in the service alone, which a second writer of the database bypasses. Annex B point 13 of the proposal names the case of an importer as producer, which §19 lists as open.

**D18.** After the waste status the data provider changes the passport only when `successor_authorisation_ref` is set, and the data provider records the reference once through `EP-SUCCESSOR-AUTHORISATION`. The end of the passport is exempt (SwR-DATASET-201, End of the passport exempt from the successor authorisation check). This specification rejects a write by the successor into the data provider's database (D6).

**D19.** A repair is applied by the data provider on a received BatteryRepaired: one repair entry per repair certificate and the status `re-used`. A second notification with the same certificate adds no entry. This specification rejects a status change without the certificate reference, which SwR-DATASET-202 (Repair entry stored with the repair certificate's catenaXId) refuses with status 400.

**D20.** `EP-REPORT-RECYCLING` sends only PassportEnded, and a data provider refuses a PassportEnded for a passport that is not in the status `waste` with `ERR-RX-STEP-REFUSED`. The waste receiver reports the waste status first through `EP-REPORT-WASTE`. This specification rejects a recycling report that also sends BatteryBecameWaste, because the recycler is not always the waste receiver and the report would name a successor that the recycler does not know.

**D21.** The seven schema files of `docs/api/schemas/` are the one definition of the notification message, in the 2020-12 dialect of JSON Schema that OpenAPI 3.1.0 uses. `docs/api/openAPI.yaml` references the files, and the server compiles the same files. This specification rejects a second definition of the message in code.

**D22.** A lifecycle step writes its notifications as `pending` records in the transaction of the step, and the worker sends each record after the commit. A failed commit therefore leaves no notification. This specification rejects sending inside the request before the commit, which notifies a receiver of a step that a failed commit undoes.

**D23.** A twin is registered after the transaction of its passport has committed. A failed registration leaves the passport stored, is answered in the field `twin`, and is repeated through `EP-TWIN`. This specification rejects a rollback of the passport after a failed registration, because the notifications of the step are already written.

**D24.** The database enforces the single writer through row-level security policies that read the transaction setting `app.acting_bpnl`, and each transaction runs under the role `refserver_app` through `SET LOCAL ROLE`. SwR-DATASET-190 (Passport rows written only under the responsible operator's context) names the row-level security context. This specification rejects a second connection string for the application role, which adds a credential for no rule.

**D25.** The audit trail is one structured log line per write decision (§9.2.7; open decision OD-2). SwR-AUDIT-045 (Dataset write decisions recorded with the authorisation relied on) names the three fields that the line holds. This specification rejects an audit table under option A of OD-2.

**D26.** `docs/api/openAPI.yaml` holds exactly the four operations of the lifecycle notification API, and the operator endpoints of §9.3 are documented in `docs/development-view.md` and defined by the schemas of `server/schemas/`. The proposal standardises only the notification API. This specification rejects the operator endpoints in the OpenAPI file, which the measure of PrR-CXD-019 (Four notification operations with JSON schemas, following the Industry Core KIT) fails.

**D27.** The server evaluates a subset of JSONPath (RFC 9535) for `AccessMapEntry.path`: the root identifier `$`, the name selector in dot notation and in bracket notation, the wildcard selector `[*]`, the index selector with a non-negative integer, and one filter selector of the form `[?@.<name>=='<string>']`. Every path of the subset is a valid query of RFC 9535. A path outside the subset is refused with `ERR-LC-PATH-NOT-SUPPORTED`. This specification rejects a JSONPath library, whose name and version are not verified against a stored text.

**D28.** The data provider supplies the payload of each of the eight models of CX-0160-3 and of the SerialPart and SingleLevelBomAsBuilt models through `EP-ASPECT-PUT`. The server validates a payload of the four models that `sources/IDTA/` stores and stores the other six payloads unchecked. This specification rejects a mapping of each model from database columns, which is the work of a battery passport application and not of the lifecycle interfaces.

**D29.** `ACCESS_REGIME` selects the access rule of section 2.2 of the proposal. Under `after-act`, an access record of the aspect key `product-condition` admits only the roles `purchaser` and `purchaserAgent`, and an access record of the aspect key `lifecycle` admits only the roles `purchaser`, `purchaserAgent`, `responsibleOperator`, `successor` and `marketSurveillanceAuthority`; another role answers `ERR-LC-ROLE-NOT-ADMITTED`. An access record of the aspect key `successors` admits only `authorisedRecipient` and `marketSurveillanceAuthority` under both regimes. Under `before-act`, the data provider's own policy applies: every role is admitted for every other aspect key. This specification rejects one fixed regime, which leaves CAC-010 or CAC-011 without a test.

**D30.** A change of purchaser and a direct re-use are one step, `EP-PURCHASER`: the step closes the open access records of the roles `purchaser` and `purchaserAgent` of the passport and opens the records of the new purchaser for the aspect keys `product-condition` and `lifecycle`. The step writes no passport column, no lineage link and no responsibility interval, so the passport, its identifiers, its status and its responsible operator stay unchanged. The access records are the record that the three software requirements of §5.7 name as the ownership timeline. This specification rejects a lineage step for a direct re-use.

**D31.** The conformance tests are `node:test` modules named `CAC-<nnn>.tck.mjs`, and `TCK_BINDING` selects the binding. This specification rejects two copies of the tests, one per binding.

**D32.** The three models import the shared models `uuid` 2.0.0 and `business_partner_number` 2.0.0, as the proposal names them, and the SAMM validation resolves them from a pinned commit of the Tractus-X semantic model repository in `.github/workflows/samm.yml`. When the pinned commit holds no version 2.0.0 of a shared model, the implementer stops and reports. This specification rejects a silent change of the import version.

**D33.** After the end of a passport the data provider withdraws the offers of the ten stored aspect keys, so that no new agreement delivers the dataset as a current dataset (SwR-CXCLIENT-110, Recycling withdraws the passport dataset offers), and keeps the offers of the lifecycle submodel and of the successors submodel, whose existing agreements stay valid. The persons who read the passport before the end keep their agreements, which meets CAC-015. This specification rejects the withdrawal of the lifecycle offer, which hides the end of the passport.

**D34.** The passport service provider receives PassportEnded when `PASSPORT_SERVICE_PROVIDER_BPNL` is set (SwR-CXCLIENT-111, End of a recycled battery's passport made known to the provider). This specification rejects a second notification form for the passport service provider.

**D35.** Each data provider registers its own PartType twin for its catalogue part, and a battery model of a treated battery references the original battery model in `original_model_catena_x_id` and `original_model_manufacturer_bpnl`. `issueNewPassport` refuses a battery model without the reference with `ERR-LC-BODY-INVALID`. The new passport thereby keeps the original battery model as the reference of the design (SyR-LIFE-028, New passport dataset takes over the original battery model), and the second-life operator offers the access map on a twin of its own registry. This specification rejects an access map on the PartType twin of the original manufacturer, which the second-life operator cannot write.

**D36.** The supersession of an original passport is derived: the lineage link in the second-life operator's database and the successor link in the original data provider's database. No step writes a superseded mark or a status into an original passport (SwR-DATASET-192, Lineage step writes no link into an original passport row). This specification rejects a superseded column that the second-life operator writes.

**D37.** The server depends on four packages: `express`, `pg`, `ajv` and `ajv-formats`. The tests of the server and the test kit add `yaml`. The server signs and verifies operator tokens with `node:crypto`, runs its tests with `node:test`, and calls partners with the `fetch` of Node.js 24. The implementer pins each package in `server/package-lock.json`. The current major version of each package is not verified against a stored text. This specification rejects a web framework, a query builder and a token library beyond the five packages.

**D38.** Under option A of open decision OD-2 the reference server does not build the sharing of individual battery information with the original issuer (use cases LC-1 and LC-5b of the proposal). §5.4 lists the requirements.

**D39.** The requirements that rest only on the draft implementing act under Article 77(9) of Regulation (EU) 2023/1542 wait for the adoption of the act (the second group of §5.4). Annex B point 1 of the proposal states that the final act may change the exceptions. This specification rejects building the rules on the draft text.

**D40.** The admission rule of a lineage operation reads, for each predecessor, the declared status and the declared original purpose, and the purpose of the request: `preparationForReUse` needs the status `waste` and an equal purpose; `preparationForRepurposing` needs the status `waste` and a different purpose; `repurposing` needs a status other than `waste` and a different purpose; `remanufacturing` needs a status other than `waste` and an equal purpose. The status of the new passport is `re-used`, `repurposed`, `repurposed` and `remanufactured` in that order. `dateIntoService` must not be before the date of `operationDate`. A failure answers `ERR-LC-OPERATION-NOT-ADMITTED`. This specification rejects a re-use operation that is admitted from every status.

## 13. Notes for the implementer

### 13.1 Do not

- Do not change a requirement, a decision or an architecture record of `requirements/`, except the field `implementation` in phase P8.
- Do not write a file outside §7. A file that the work needs and §7 does not list is a finding that the implementer reports.
- Do not name a path, a person, a host or a service of a private repository or deployment in any file. `node scripts/check-private-references.mjs` prints `0 private references` before every phase ends.
- Do not write a secret, a token or a key into a file. `tck/.env.example` holds placeholder values only.
- Do not replace a value marked "not verified against a stored text" by a guess. Phase P7 verifies each value, and a value that cannot be verified is reported.
- Do not write SQL in a route or a service module.
- Do not read `process.env` outside `server/src/config.mjs`, and do not create a pool or a client at module load.
- Do not send a notification before the transaction of its step has committed.
- Do not skip a test, except the one case of §10.7.
- Do not download a tool or an image without the owner's approval, except the packages of D37 and the commands that §15 names.
- Do not commit and do not push.

### 13.2 Do

- Read the statement of each requirement of a phase in the registry before writing the code of the phase.
- Put the identifier of each implemented requirement in the header comment of its module.
- Write each test before or with its module, and name the requirement or the criterion in the test title.
- Run the done-when signal of a phase before starting the next phase.
- Report each finding with its file and its line at the end of the phase.

## 14. Tests

### 14.1 How the tests run

The server tests run with `npm test` in `server/`, which runs `node --test "test/**/*.test.mjs"`. The conformance tests run with `npm test` in `tck/`, which runs `node --test "*.tck.mjs"`. The server tests read `TEST_DATABASE_URL` and the conformance tests read `TCK_DATABASE_URL`, each the address of an empty PostgreSQL database that the implementer starts locally; `server/test/support/database.mjs` creates one schema per test file and drops the schema after the file. No test goes red intentionally, because the repository holds no earlier test `[live]`.

### 14.2 Server tests

| File | What the file asserts |
|---|---|
| `server/test/config.test.mjs` | `loadConfig` names every missing required variable of §9.6 and refuses a malformed `OWN_BPNL` |
| `server/test/operatorToken.test.mjs` | a signed token verifies; a changed signature, an expired token and a token of another BPNL are refused |
| `server/test/policy.test.mjs` | the capabilities of an operator subject and of a partner subject; an unknown subject kind receives none; `requireCapability` throws for a string outside `CAPABILITIES` |
| `server/test/lifecycleCatalogue.test.mjs` | the four contexts of §10.1; the admission rule of D40 for each pair of status and purpose; the five status values equal the values of the stored enumeration file |
| `server/test/refusals.test.mjs` | every refusal of §9.5 has its status and a text of four sentences; the body validates against `ErrorResponse.schema.json` |
| `server/test/jsonPathSubset.test.mjs` | each selector of D27 on the fixtures; a path outside the subset is refused |
| `server/test/governedElements.test.mjs` | each path of §10.6 receives the value of the passport record, and a stored value at a governed path is replaced |
| `server/test/databaseRules.integration.test.mjs` | each trigger and each policy of §9.4: one accepted and one refused statement per rule, with the refusal id; a transaction without `app.acting_bpnl` reads no passport; an update of `manufacturer_bpnl` is refused under `refserver_app` and under the owner role |
| `server/test/lifecycleService.integration.test.mjs` | each function of §9.2.2: the stored records after each step, the single-writer rule, the rule after the waste status, the rule after the end, the identifier rule of D14, and that no step writes a predecessor record |
| `server/test/lifecycleNotificationRoutes.integration.test.mjs` | through `EP-RX-NEW-PASSPORT`, `EP-RX-REPAIRED`, `EP-RX-WASTE` and `EP-RX-ENDED`: each check and each step of §10.4 with its status, its refusal id and its stored records; the outcome `duplicate`; the method rule |
| `server/test/passportRoutes.integration.test.mjs` | through `EP-MODEL-CREATE`, `EP-PASSPORT-CREATE`, `EP-ASPECT-PUT`, `EP-ISSUE-NEW-PASSPORT`, `EP-TWIN`, `EP-FORWARD-LINK`, `EP-SUCCESSOR-AUTHORISATION` and `EP-PASSPORT-READ`: the success bodies, the refusals of §9.5, 401 without a credential and 403 for a partner subject |
| `server/test/submodelRoutes.integration.test.mjs` | through `EP-SUBMODEL` and `EP-ACCESS-MAP`: the bare payloads, which validate against the generated schemas of the three models; the access decision of §9.2.4; no stored record changes during a read |
| `server/test/accessMap.integration.test.mjs` | through `EP-ACCESS-MAP-PUT`: a complete map is stored; an incomplete map, a map with two groups for one field, a repeated version and an unsupported path are refused |
| `server/test/accessRecords.integration.test.mjs` | through `EP-ACCESS-RECORD`, `EP-ACCESS-RECORD-END` and `EP-PURCHASER`: the roles of D29 under both regimes; the previous purchaser no longer reads the product condition after the change; the passport record is unchanged by the change |
| `server/test/audit.integration.test.mjs` | one log line per granted and per refused write, with the fields of §9.2.7 |
| `server/test/openApiContract.test.mjs` | `docs/api/openAPI.yaml` holds exactly four operations, each a POST whose path and `operationId` equal the operation name; every response of the four receiving endpoints validates against the response schema of its status |
| `server/test/messageHeader.test.mjs` | the header validates against `MessageHeader.schema.json`; two headers have different `messageId` values |
| `server/test/notificationPlan.test.mjs` | the receivers of §10.3 for each operation; one entry per pair of receiver and passport; no entry for the own BPNL; the further receiver of D34 |
| `server/test/policyBuilder.test.mjs` | each offer of §10.5 carries `cx.circular.dpp:1` and its list of BPNLs; an empty list publishes no offer |
| `server/test/shellDescriptor.test.mjs` | the five specific asset IDs of a PartInstance shell and the submodel descriptors of the served aspect keys |
| `server/test/notificationSender.integration.test.mjs` | each of the five outcomes of the transport contract is stored with its cause; a `no_asset` and a `contract_refused` record hold the receiver, the operation, the passport identifier and the date of the attempt |
| `server/test/outboxWorker.integration.test.mjs` | with an injected clock: a PassportEnded record is not sent 4 seconds after the record time and is sent 5 seconds after the record time; the message that the transport receives equals the stored message |
| `server/test/offerPublisher.integration.test.mjs` | the offers after each step; the withdrawal of D33 |
| `server/test/lifecycleEventRoutes.integration.test.mjs` | through `EP-REPORT-REPAIR`, `EP-REPORT-WASTE`, `EP-REPORT-RECYCLING`, `EP-NOTIFICATIONS-SENT` and `EP-NOTIFICATIONS-RECEIVED`: the planned notifications; the local application of D12 |
| `server/test/transportContract.test.mjs` | one test code against the memory transport and against the connector transport with a stubbed `fetch`: each of the five outcomes |
| `server/test/twinRegistryContract.test.mjs` | one test code against the memory registry and against the registry client with a stubbed `fetch`: `register`, `replace` and `read` |

### 14.3 Conformance tests

Each file runs against the binding of `TCK_BINDING`, names its criterion in its first test title, and uses the three participants of §9.2.9.

| File | Criterion | What the file asserts | Endpoints exercised |
|---|---|---|---|
| `tck/CAC-001.tck.mjs` | CAC-001, new passport | a new passport for each of the four operations, with a new passport identifier; the battery identifier kept for one battery and renewed after remanufacturing | `EP-ISSUE-NEW-PASSPORT`, `EP-PASSPORT-READ` |
| `tck/CAC-002.tck.mjs` | CAC-002, digital twin | the new PartInstance shell with the keys of Table 2.1.1 of the proposal and one submodel descriptor per served aspect key; the shell of the original passport is equal before and after | `EP-ISSUE-NEW-PASSPORT`, `EP-ASPECT-PUT`, `EP-TWIN` |
| `tck/CAC-003.tck.mjs` | CAC-003, model elements | the governed elements of §10.6 on the new passport hold the second-life operator's values and the four performance values | `EP-ISSUE-NEW-PASSPORT`, `EP-SUBMODEL` |
| `tck/CAC-004.tck.mjs` | CAC-004, predecessor links | the lifecycle payload holds one link per original passport with the five mandatory properties, and each `catenaXId` reads a shell in the original data provider's registry | `EP-ISSUE-NEW-PASSPORT`, `EP-SUBMODEL` |
| `tck/CAC-005.tck.mjs` | CAC-005, forward link | the successors offer is listed only for the recorded recipients; the status of the original passport is unchanged after the new passport; a write of the second-life operator on the original passport is refused | `EP-FORWARD-LINK`, `EP-ACCESS-RECORD`, `EP-SUBMODEL`, `EP-RX-NEW-PASSPORT` |
| `tck/CAC-006.tck.mjs` | CAC-006, status and repair | the status after each event of Table 2.1.4 of the proposal; the passport and its identifiers kept after a repair and after a change of purchaser | `EP-REPORT-REPAIR`, `EP-RX-REPAIRED`, `EP-PURCHASER`, `EP-PASSPORT-READ` |
| `tck/CAC-007.tck.mjs` | CAC-007, waste status | the status `waste` on the same passport, the successor in the lifecycle payload, the shell readable, a change refused without the authorisation, and the end recorded without the authorisation | `EP-REPORT-WASTE`, `EP-RX-WASTE`, `EP-SUCCESSOR-AUTHORISATION`, `EP-FORWARD-LINK`, `EP-SUBMODEL` |
| `tck/CAC-008.tck.mjs` | CAC-008, donors | a donor passport is readable after the remanufacturing and takes the status `waste` after BatteryBecameWaste | `EP-ISSUE-NEW-PASSPORT`, `EP-REPORT-WASTE`, `EP-RX-WASTE`, `EP-SUBMODEL` |
| `tck/CAC-009.tck.mjs` | CAC-009, end of the passport | PassportEnded reaches the receivers of §10.3 after the delay of D1; `endOfPassport` is in the lifecycle payload; a later change is refused | `EP-REPORT-RECYCLING`, `EP-RX-ENDED`, `EP-NOTIFICATIONS-SENT`, `EP-ASPECT-PUT`, `EP-SUBMODEL` |
| `tck/CAC-010.tck.mjs` | CAC-010, access | under `after-act`: `cx.circular.dpp:1` on each offer; the product condition and the lifecycle offers listed only for the admitted roles; the access withdrawn after a change of purchaser | `EP-ACCESS-RECORD`, `EP-PURCHASER`, `EP-SUBMODEL` |
| `tck/CAC-011.tck.mjs` | CAC-011, access before the Article 77(9) act | under `before-act`: an access record of the role `authorisedRecipient` opens the product condition offer for that recipient only | `EP-ACCESS-RECORD`, `EP-SUBMODEL` |
| `tck/CAC-012.tck.mjs` | CAC-012, notification API | one asset with the taxonomy name; four endpoints; the header and the content of each sent message; one notification per receiver and passport; the record of a receiver without an asset; a descriptive error body on a refused message | `EP-RX-NEW-PASSPORT`, `EP-RX-REPAIRED`, `EP-RX-WASTE`, `EP-RX-ENDED`, `EP-NOTIFICATIONS-SENT`, `EP-NOTIFICATIONS-RECEIVED` |
| `tck/CAC-013.tck.mjs` | CAC-013, data assets | each of the three models is listed as an offer with its semantic identifier and is a submodel descriptor of its twin | `EP-SUBMODEL`, `EP-ACCESS-MAP`, `EP-ACCESS-MAP-PUT` |
| `tck/CAC-014.tck.mjs` | CAC-014, certificates | the sent BatteryRepaired and PassportEnded carry the certificate references of the request | `EP-REPORT-REPAIR`, `EP-REPORT-RECYCLING`, `EP-NOTIFICATIONS-SENT` |
| `tck/CAC-015.tck.mjs` | CAC-015, persistence | after the end, a recorded reader still reads the lifecycle payload | `EP-REPORT-RECYCLING`, `EP-SUBMODEL` |
| `tck/CAC-016.tck.mjs` | CAC-016, access map | the access map offer on the PartType shell; one entry per served field; a reader without a record is refused a restricted aspect and reads a public aspect; a new map version after a change | `EP-MODEL-CREATE`, `EP-ACCESS-MAP-PUT`, `EP-ACCESS-MAP`, `EP-SUBMODEL` |

The criteria CAC-014 and CAC-015 have the type SHOULD in Annex A of the proposal. CAC-014 asserts the certificate references only, because the registration of a CX-0131 certificate is the act of the second-life operator, the waste receiver and the recycler in their own systems.

## 15. Done when

Every command runs in a POSIX shell at the repository root, on the commit that the last phase produces, whose base is the substrate commit of the header. The implementer copies the output of each command into the completion record.

1. `node scripts/requirements-check.mjs` prints a last line that starts with `0 problems`; `node scripts/check-sources.mjs` exits 0; `node scripts/check-license-headers.mjs` prints `0 files without a license header or NOTICE section`; `node scripts/check-private-references.mjs` prints `0 private references`.
2. `npx @stoplight/spectral-cli@6 lint docs/api/openAPI.yaml --ruleset .spectral.yaml --fail-severity error` exits 0.
3. `for m in models/*/1.0.0/*.ttl; do java -jar samm-cli-2.11.1.jar aspect "$m" validate || echo "FAILED $m"; done` prints no line that starts with `FAILED`, with the three folders of `models/` copied into the models root of D32.
4. `find models -name "*.ttl" | wc -l` prints 3, and `find models -name metadata.json | wc -l` prints 3.
5. `(cd server && npm ci && npm test)` ends with a summary that holds the line `# fail 0`, and `ls server/test/*.test.mjs | wc -l` prints 26.
6. `(cd tck && npm ci && TCK_BINDING=in-process npm test)` ends with a summary that holds the lines `# fail 0` and `# skipped 1`.
7. `(cd tck && TCK_BINDING=connector npm test)` ends with the same summary, or the completion record holds the contingency of §10.7.
8. `ls tck/CAC-0*.tck.mjs | wc -l` prints 16, and `grep -L "CX-0160-4-CAC-0" tck/CAC-0*.tck.mjs` prints nothing.
9. `grep -rn "process\.env" server/src --include=*.mjs | grep -v "server/src/index.mjs"` prints nothing, and `grep -rnE "(SELECT|INSERT|UPDATE|DELETE) " server/src/routes server/src/dataset/lifecycleService.mjs` prints nothing.
10. `LC_ALL=C.UTF-8 grep -rnP "\x{2014}|\x{2013}" docs README.md CHANGELOG.md INSTALL.md server tck models --include=*.md` prints nothing, so no Markdown file holds an em dash or an en dash.
11. `git status --porcelain` lists only paths of §7.

## 16. Import dependencies and cutover order

- The schema files of P1 exist before the server of P4, because `schemaValidator.mjs` compiles them at the start.
- The generated schema of the access map model of P2 exists before `accessMapService.mjs` of P4, which compiles the schema. Do not write the generated schema by hand: a hand-written schema differs from the output of the SAMM command line tool.
- `001_schema.sql` creates `notifications_received` before `passport_successor_links` and `passport_repair_entries`, which reference the table.
- `003_policies.sql` runs after `001_schema.sql`, because a policy names its table. Do not enable row-level security before the grants of the same file: a table with forced row-level security and no policy refuses every statement of the application role.
- The memory implementations of P5 exist before the test kit of P6.
- The owner's approvals of §5.7 exist before the phase that each change blocks.
- The repository has no deployment, so no cutover exists.

## 17. Traceability

§5.1 traces each system requirement to its conformance criterion or its server test. §5.2 traces each software requirement to its file and its test. §5.3 traces each process requirement to its artefact and its phase. This table traces each criterion of Annex A of the proposal to the sections of the proposal, to the modules and to its test file.

| Criterion | Sections of the proposal | Modules | Test file |
|---|---|---|---|
| CAC-001 | 2.1.1 items 1 to 3 | `server/src/dataset/lifecycleService.mjs`, `server/src/dataset/lifecycleCatalogue.mjs` | `tck/CAC-001.tck.mjs` |
| CAC-002 | 2.1.1 items 4, 5 and 7 | `server/src/twins/shellDescriptor.mjs`, the twin registry of the binding | `tck/CAC-002.tck.mjs` |
| CAC-003 | 2.1.1 item 6 | `server/src/dataset/governedElements.mjs`, `server/src/submodels/submodelService.mjs` | `tck/CAC-003.tck.mjs` |
| CAC-004 | 2.1.2 | `server/src/dataset/lifecycleRecordReader.mjs` | `tck/CAC-004.tck.mjs` |
| CAC-005 | 2.1.3 items 2 to 4 | `server/src/dataset/lifecycleService.mjs`, `server/src/connector/offerPublisher.mjs` | `tck/CAC-005.tck.mjs` |
| CAC-006 | 2.1.4 | `server/src/dataset/lifecycleService.mjs`, `server/src/access/accessRecordService.mjs` | `tck/CAC-006.tck.mjs` |
| CAC-007 | 2.1.5 items 1, 3, 4 and 5 | `server/src/dataset/lifecycleService.mjs`, `server/src/db/migrations/002_triggers.sql` | `tck/CAC-007.tck.mjs` |
| CAC-008 | 2.1.6 items 1 and 2 | `server/src/dataset/lifecycleService.mjs` | `tck/CAC-008.tck.mjs` |
| CAC-009 | 2.1.7 items 2 to 4 | `server/src/dataset/lifecycleService.mjs`, `server/src/background/outboxWorker.mjs` | `tck/CAC-009.tck.mjs` |
| CAC-010 | 2.2 items 1, 2, 5, 6 and 7 | `server/src/access/accessRecordService.mjs`, `server/src/connector/policyBuilder.mjs` | `tck/CAC-010.tck.mjs` |
| CAC-011 | 2.2 item 4 | `server/src/access/accessRecordService.mjs` | `tck/CAC-011.tck.mjs` |
| CAC-012 | 4.3 items 1 to 7 | `server/src/routes/lifecycleNotificationRoutes.mjs`, `server/src/connector/notificationPlan.mjs`, `server/src/connector/notificationSender.mjs` | `tck/CAC-012.tck.mjs` |
| CAC-013 | 4.1 | `server/src/connector/offerPublisher.mjs`, `server/src/twins/shellDescriptor.mjs` | `tck/CAC-013.tck.mjs` |
| CAC-014 | 2.1.1 item 8, 2.1.5 item 2, 2.1.7 item 1 | `server/src/connector/notificationPlan.mjs` | `tck/CAC-014.tck.mjs` |
| CAC-015 | 2.1.7 item 5 | `server/src/connector/offerPublisher.mjs` | `tck/CAC-015.tck.mjs` |
| CAC-016 | 2.2 items 8 to 12, 3.4 | `server/src/submodels/accessMapService.mjs`, `server/src/submodels/jsonPathSubset.mjs` | `tck/CAC-016.tck.mjs` |

Every module and every test file of this table is a planned file of §7.

## 18. Gate evidence

| Item | Section that satisfies the item |
|---|---|
| Header | the table at the top of the document |
| How to read | §1 |
| Goal | §2 |
| Scope | §3 |
| Users and success measures | §4 |
| Requirements | §5 |
| Files to read | §6 |
| Files to write | §7 |
| Deletions | §8 |
| Sources of truth | §9.1 |
| Architecture | §9.2, §9.3 (the column "Endpoint id" stands for the test id column: the specification has no screen), §9.4, §9.6, §9.7 |
| Strings | §9.5 |
| Data contract | §10 |
| Decisions | §12 |
| Notes for the implementer | §13 |
| Tests | §14 |
| Done when | §15 |
| Import dependencies and cutover order | §16 |
| Traceability | §17, with §5.1, §5.2 and §5.3 |
| Gate evidence | §18 |

- **Checker command**, in a POSIX shell at the repository root: `python scripts/spec_gate_check.py docs/architecture/implementation_plan.md --src . --screens-heading "Interfaces" --id-column "Endpoint id" --testid-prefix "EP-"`
- **Checker result, version 1**: `result: PASS` on 2026-11-16, against the working tree of this repository with version 1 of this document.
- **Registry check**: every requirement identifier and every title of this document was compared by a script with the registry of `requirements/` on 2026-11-16: 0 unknown identifiers and 0 titles that differ.
- **Adversarial review**: no reviewer other than the author has reviewed version 1. The review by a reviewer who is not the author is open, and the handover waits for the review and for the owner's answers to OD-1, OD-2 and OD-3.

## 19. Open points for the owner

1. The three open decisions OD-1, OD-2 and OD-3 of §12.1.
2. The difference between option A of OD-2 and the answer of decision Q-1011 (whether the reference implementation builds use case UC-5), which names UC-5b.
3. The five registry changes of §5.7.
4. The importer as producer (Annex B point 13 of the proposal): D17 refuses a successor with the role `producer` that is not the manufacturer of record, as SwR-DATASET-191 (Waste step records the current passport's producer, not the actor) states, while section 2.1.5 item 4 of the proposal records the successor that the notification names.
5. The claims marked "not verified against a stored text": the two header names and the key header of §9.6; the paths of the connector's management API and of the registry API (§9.6); the property `relatedMessageId` and the regular expressions of the MessageHeader model (§10.1); the `dct:type` of a submodel offer (§10.5); the six semantic identifiers of §10.6; every image name and version of §10.7; the action names and image names of §9.7; the major versions of the five packages of D37; and the need for the file `DEPENDENCIES` (§3.2).

## NOTICE

This work is licensed under the [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/legalcode).

- SPDX-License-Identifier: CC-BY-4.0
- SPDX-FileCopyrightText: 2026 Ichnos Protocol Pte. Ltd.
- SPDX-FileCopyrightText: 2026 Contributors to the Eclipse Foundation
- Source URL: https://github.com/Ichnos-Protocol/battery-passport-after-first-life/blob/main/docs/architecture/implementation_plan.md
