# Implementation specification of the standalone reference server

| | |
|---|---|
| Status | Approved by the owner on 2026-11-16 ("Approve, start", `requirements/Owner_instructions-Francesco_verbatim/2026-11-16_public_repository_for_the_after_first_passport_work.md`, section "The approval of the specification of the reference server"); the approval covers version 7. Version 8 corrects defects of the text that the execution of phases P1 to P3 found; the corrections wait for the owner's confirmation. Version 9 adds the tests of the configuration reader, the logger and the identifier conversions, as the owner ordered on 2026-11-17 (`requirements/Owner_instructions-Francesco_verbatim/2026-11-16_public_repository_for_the_after_first_passport_work.md`, section "The tests of the configuration, the logger and the identifier conversions, and phase P4"). Version 10 closes the independent review of the code of phases P4 and P5 and records the owner's three decisions of 2026-11-19 (`requirements/Owner_instructions-Francesco_verbatim/2026-11-16_public_repository_for_the_after_first_passport_work.md`, section "Three decisions after the code review of phases P4 and P5 (2026-11-19)"). Phases P1 to P5 are executed; version 10 states the corrections of the code of phases P4 and P5 that the implementer makes before phase P6. Version 11 records the differences between the text and the code that the execution of phases P4 to P6 found. Version 12 records the verification of the connector values of Tractus-X EDC 0.13.0 in the first part of phase P7, the owner's three decisions of 2026-11-19 on the connector binding (`requirements/Owner_instructions-Francesco_verbatim/2026-11-16_public_repository_for_the_after_first_passport_work.md`, section "Three decisions after the verification of Tractus-X EDC 0.13.0 (2026-11-19)"), and four corrections that published texts decide. Phases P1 to P6 are executed and verified; the first part of phase P7 is executed. Version 13 records the first run of the second part of phase P7 across connectors of Tractus-X EDC 0.13.0, which stopped at the check of the wallet stub, the owner's three decisions of 2026-11-19 after that run (`requirements/Owner_instructions-Francesco_verbatim/2026-11-16_public_repository_for_the_after_first_passport_work.md`, section "Three decisions after the first run across Tractus-X EDC 0.13.0 connectors (2026-11-19)"), the differences that the run found, and the specification of the connector binding of the test kit. Version 14 records the second run of phase P7, which passed 44 of 71 conformance subtests across connectors and 94 of 94 in-process (`tck/README.md`, section "The second run of phase P7"), and the owner's three decisions of 2026-11-19 after that run (`requirements/Owner_instructions-Francesco_verbatim/2026-11-16_public_repository_for_the_after_first_passport_work.md`, section "Three decisions after the second run across Tractus-X EDC 0.13.0 connectors (2026-11-19)"). The second part of phase P7 continues with version 14; phase P8 follows |
| Version | 14 |
| Changes from version 1 | Version 2 recorded the five decisions of the owner of 2026-11-16 (§12.1), moved the sharing of individual battery information with the original issuer into scope, made the audit trail a table and stored the two shared models in `sources/` |
| Changes from version 2 | Version 3 closes the 64 findings of the independent review of version 2 (§18). The substrate is the registry after the ten registry texts that the owner approved on 2026-11-16. The database section states every table, column, constraint, index, trigger, policy and grant of the three migration files (§9.4). The server connects as a role without ownership. The data provider records the end of a passport from every status. The receiver resolution, the repair certificate check and the retry of a failed transport are built. Every decision has a title. The line limit of the earlier versions no longer applies |
| Changes from version 3 | Version 4 closes the 36 findings of the second independent review (§18) and records the owner's four decisions and the owner's decision on the tools of 2026-11-16 (§12.1). The public schemas accept every form of an identifier that the stored shared model admits, and the server normalises. Every change of the successor's authorisation is written to the audit table. Every tool of phases P1 to P3 runs in a container, and every done-when command has one form. The database section gains the grant on the migration table, one clock in UTC, the row locks, the type parsers and one further trigger. §5.7 lists the 32 measures that name a role of another design. A tag marks every sentence that rests on a decision that waits for the owner |
| Changes from version 4 | Version 5 closes the 19 findings of the third independent review, whose reviewer built phases P1 to P3 from version 4 (§18). Three annexes print every file of phases P1 to P3 that the implementer would otherwise compose, and the annexes are normative (§20, §21, §22). The author ran the three migration files on PostgreSQL 17, validated the three model files with the SAMM command line tool and compiled the schema files. The lineage rule of the database uses a column that the insertion sets and the executor clears. The database ties the waste date and the recycling date to the responsibility intervals and freezes the intervals of an ended passport. One schema file defines the envelope of a notification and fixes the context of each operation. The repository gains the file `.gitattributes`. The specification checker is the Node.js script `scripts/spec-gate-check.mjs` since 2026-11-16 |
| Changes from version 5 | Version 6 closes the 15 findings of the fourth independent review, whose reviewer executed the 27 annex files of version 5 and attacked the database under a login as the role `refserver_app` (§18). Every function of the database has a fixed search path, and the application role holds no privilege to create a temporary table (decision D60, A fixed search path for every function, no temporary table for the application role, and a database of its own). The rule after the waste status holds in the database for the records of a passport and not only for the passport itself (decision D61, The rule after the waste status covers the records of the passport). A responsibility interval is inserted open and at the end of the timeline (decision D62, The responsibility timeline is determined by the passport). A passport references a battery model of its own manufacturer, and three further tables have a policy (decision D63, References across the bound of a company). The generated schemas and the example payloads of the three models are files of `docs/api/aspects/`, and one module builds the compiler of the draft-04 aspect schemas (decision D64, The generated schemas outside `models/`, and one compiler of the draft-04 schemas). The database holds 14 functions, 27 triggers and 12 policies. The author ran the three migration files, the lifecycle scenarios, the refusals and the three attacks of the reviewer on PostgreSQL 17 under a login as `refserver_app` |
| Changes from version 6 | Version 7 closes the 15 findings of the fifth independent review, whose reviewer attacked the database of version 6 under a login as the role `refserver_app` (§18). No record moves to another passport (D61). Every trigger function refuses a transaction that does not run at the isolation level READ COMMITTED (decision D66, Every write runs at the isolation level READ COMMITTED). The role `refserver_app` holds the privilege UPDATE by column and on the columns that a step of the server changes (decision D67, The privilege UPDATE by column). The responsibility timeline of a passport is determined by the passport: one interval before the waste status and two intervals after, without a gap (D62). The named waste successor, its role and the waste date never change (D65 (The named waste successor is permanent), which waits for the owner). Every date and time of the schema is finite, and no numeric value is NaN (decision D68, Finite dates and no NaN). The owner decided on 2026-11-16 that the reference server runs on a database of its own (D60). The database holds 16 functions, 37 triggers and 12 policies |
| Changes from version 7 | Version 8 corrects eight defects of the text that the execution of phases P1 to P3 found (§18), and changes no annex file, no registry file and no code. `createAppRole` removes the stored settings of the role per database as well, because `ALTER ROLE ... RESET ALL` removes only the settings that apply to every database (§9.2.8). Two done-when commands of phase P2 are replaced by commands that an implementer without index rights can run (§11.2). Two counts of the database rule tests are corrected, and the refusal sentences of the lineage check that no statement reaches are stated (§9.4.2, §14.2). The test workflow starts its database inside one job, so that no generated password reaches a log (§9.7). §5.7 gains the registry text on the folder `gen`. §14.1 records the choices of the implementer of phases P1 to P3 |
| Changes from version 8 | Version 9 adds, by the owner's order of 2026-11-17, the tests of the three modules `server/src/config.mjs`, `server/src/logger.mjs` and `server/src/identifiers.mjs` of phase P4 (§14.2), the mechanism of the rule of the logger (a fixed list of field names whose values the logger replaces before a line is written), the levels, the time format and the injected stream of the logger, the property of the configuration object for each variable of §9.6, and the error of the identifier conversions (§9.2.1, §9.6). Version 9 changes no annex file, no registry file and no code |
| Changes from version 9 | Version 10 closes the 20 findings of the independent review of the code of phases P4 and P5 and the differences that the implementer of the two phases reported (§18). The owner decided three points on 2026-11-19: a failed audit write after the commit answers the true outcome and queues the audit record in the table of a fourth migration file (D69 (The audit record after a failed write is queued), §9.4.4, §23); the recycler of a PassportEnded equals the sender (decision D70, The recycler of PassportEnded is the sender); §9.3 records the fields of the operator answers as the code builds them (decision D71, The fields of the operator answers as built). The receiving step locks the passport before the duplicate check (§10.4). A receiver answer of the class 5xx is a failed transport (§9.2.5). The sender cleans every text of a receiver answer before the write and counts a failed write as an attempt. The access map and the payloads of one battery model are serialised by an advisory lock. An unknown path answers one of two new refusals of §9.5. The in-process binding uses one memory transport per participant. Two choices wait for the owner (D72 (The clock tolerance of an operator token), D73 (The exposure of a battery information offer)). The three frozen migration files and the annexes of phases P1 to P3 do not change |
| Changes from version 10 | Version 11 records 22 differences that the execution of phases P4, P5 and P6 found between the text of version 10 and the code, and states what the code does (§18). The text now names the parameters and the return values that the code needs (the logger of the sender, the kind of `afterCommit`, the result of an empty audit call, the four migration names of the start check), the observed counts (44 columns of the two finite domains, the two names that `migrate` returns), the answer form of `asPartner(reader).get(path)`, the start of each application in the in-process binding, the payloads and the semantic identifiers of the scenario, and one rule for the Business Partner Number of a market surveillance authority. The binding contract gains the withdrawal of the notification asset in phase P7, and the row of criterion CAC-012 (notification API) records the assertions of phase P6 until then (D74 (The binding contract and criterion CAC-012), which waits for the owner). The test workflow also runs the licence check of the test kit. No annex file changes |
| Changes from version 11 | Version 12 records the verification of the first part of phase P7 against the public texts of Tractus-X EDC 0.13.0 (`tck/README.md`, section "The verification of phase P7"). The owner decided three points on 2026-11-19: the connector binding resolves a receiver through the connector discovery of the own connector (decision D75, The receiver resolution through the own connector); the three local connectors use the wallet stub `tractusx/ssi-dim-wallet-stub` 0.1.0 as their identity (decision D76, The wallet stub as the local identity); the local Digital Twin Registry runs with OAuth2 switched off, and production keeps OAuth2 (decision D77, OAuth2 off in the local registry). The variable `BPN_DID_RESOLUTION_URL` leaves §9.6. Four published texts decide four corrections of the code of phase P4: the `dct:type` `cx-taxo:BatteryPass` with the version `1.0`, the semantic identifier of IDTA-02035-3 with `#CarbonFootprintBattery`, the constraint `FrameworkAgreement` in every usage policy, and the copy of `docs/api/aspects/` in `server/Dockerfile`. §10.7 holds the verified values with their public addresses. Two choices wait for the owner (D78 (No credential of the registry in the server), D79 (A database image of its own for the connectors)). No annex file changes |
| Changes from version 12 | Version 13 records the first run of the second part of phase P7 (`tck/README.md`, section "The first run of phase P7"). The owner decided three points on 2026-11-19: one wallet stub serves the three companies of the local deployment (D80 (One wallet stub for the three companies), which amends D76); the local deployment resolves a receiver from a fixed address list, and production keeps the connector discovery of D75 (decision D81, A fixed address list in the local deployment only); HashiCorp Vault 1.16.1 under the Business Source License 1.1 is a test-only image (decision D82, HashiCorp Vault as a test-only image). The confirmed values replace their marks: the request and the answer of the connector discovery, the framework agreement `DataExchangeGovernance:1.0`, the image `hashicorp/vault:1.16.1` and the registry setting `registry.authentication` `false`. The transport contract states one meaning of `no_asset` and of `contract_refused` for both implementations (decision D83, One meaning of no_asset and contract_refused). The connector binding of the test kit connects to a started deployment and runs each test file on data of its own (D84 (The connector binding on a started deployment), which waits for the owner). No annex file changes |
| Changes from version 13 | Version 14 records the second run of phase P7 (`tck/README.md`, section "The second run of phase P7"). The owner decided three points on 2026-11-19: the connector transport reads the error text of the provider data plane and treats a named code of the class 4xx as a final refusal (decision D85, The error text of the provider data plane); `settle()` waits only for the notifications of the passports that the calling test file names (decision D86, A test file waits only for its own notifications); CAC-009 (end of the passport) checks the delay of D1 (The delay of the end notice) against the record time (decision D87, The delay checked against the record time). The outcome of a data plane answer 500 without a code is `transport_failed` (D88 (A data plane answer 500 without a code), which waits for the owner). `unique(prefix)` gains a random part. The connector binding records its two methods of the header test, and the header test asserts an applied notification with the true sender. No annex file changes |
| Date | 2026-11-16 |
| Owner | the owner of this repository, the author of the proposal CX-0160-4 (Battery Passport after the First Passport) |
| Implementer | an implementation agent, which executes this specification literally |
| Substrate | this repository, branch `main`, at the commit 1cebba6, which holds version 13 of this specification, the code of phase P7 of the commit 153ed59 and the record of the second run |
| Proposal | draft 0.7 of 2026-11-16, `docs/proposal/CX-0160-4_Battery_passport_after_the_first_passport.md` |
| Verified | 2026-11-16, against the working tree of this repository and the registry of `requirements/` |

## 1. How to read this document

- **Must and may.** The word "must" states what the implementer builds. The word "may" states a permission. A sentence without either word describes a fact of the repository or of the proposal.
- **The order of the sources.** Where two sources differ, this specification follows, in this order: a MUST of draft 0.7 of the proposal `docs/proposal/CX-0160-4_Battery_passport_after_the_first_passport.md`; an answered decision of the registry or the owner's stored words; the statement of a requirement of the registry of `requirements/`. §5.7 names every requirement and every measure whose text differs from the design, with a proposed text for the owner. Where no source decides, this specification chooses the narrowest design that keeps the reference server correct, marks the decision with the words "chosen by this specification; the owner has not decided", and lists the decision in §19.1. The implementer does not stop for a difference that §5.7 lists, and builds the design of this specification. The implementer stops and reports a difference that §5.7 does not list.
- **The `[live]` mark.** A claim marked `[live]` was read in the named file of this repository on 2026-11-16.
- **The mark "not verified against a stored text".** A claim with this mark rests on no text that `sources/` stores and on no run. A value of the connector with this mark is a configuration value of §9.6, and phase P7 (§11.7) verifies the value before the connector binding runs. No value with this mark decides a file of phases P1 to P3. A fact that a run of 2026-11-16 verified is stated as observed, with the run.
- **The annexes.** §20, §21 and §22 print in full the files of phases P1 to P3 that leave no choice to the implementer. An annex is normative: where a sentence of §9 or §10 and an annex differ, the annex decides, and the implementer reports the difference.
- **The decisions of the owner.** §12.1 holds the decisions that the owner took on 2026-11-16, each with the owner's stored words.
- **The tag for a waiting decision.** The words `[waits for the owner]` follow a decision that the owner has not taken, at every sentence that rests on the decision. The implementer builds the stated behaviour as written. A later decision of the owner arrives as a new version of this specification with its own migration file (from `004` on) or its own model version, and never as a change of a migration file or of a model version that a phase has delivered.
- **A moved substrate.** When a path that this specification names as existing is absent, the implementer stops and reports the path. The implementer never creates a second file for the same concept.
- **Identifiers.** A requirement is named by its identifier and its title. A conformance criterion is named CAC-001 (new passport) to CAC-016 (access map), short for CX-0160-4-CAC-001 to CX-0160-4-CAC-016 of Annex A of the proposal. A decision of the owner in the registry is named Q and a number. A decision of this specification is named D and a number and has a title. An interface of the reference server is named by an endpoint id that starts with `EP-`.
- **Abbreviations.** BPNL means the Business Partner Number of a legal entity, and BPNS means the Business Partner Number of a site. SAMM means the Semantic Aspect Meta Model, the language of the Catena-X aspect models. AAS means the Asset Administration Shell. DID means a decentralised identifier. IDTA means the Industrial Digital Twin Association. DTR means the Digital Twin Registry. DSP means the Dataspace Protocol. HS256 means the HMAC signature with SHA-256 of a JSON Web Token. SQLSTATE means the five-character error code of PostgreSQL.

## 2. Goal

The implementer builds, in this repository only, six results that a test checks:

1. **G1, the contract.** The file `docs/api/openAPI.yaml` defines the lifecycle notification API of section 4.3 of the proposal in OpenAPI 3.1.0, with exactly four POST operations, and the JSON schema files of `docs/api/schemas/` define the message of each operation and the error body.
2. **G2, the models.** The folder `models/` holds the three proposed aspect models BatteryPassportLifecycle, BatteryPassportSuccessors and BatteryPassportAccessMap in the layout of the Tractus-X semantic model repository, and each model passes the validation of the SAMM command line tool 2.11.1.
3. **G3, the reference server.** The folder `server/` holds a server on Node.js 24, Express and PostgreSQL, written as ES modules, that implements every requirement of §5.1 and §5.2.
4. **G4, the conformance test kit.** The folder `tck/` holds one test file per criterion CAC-001 (new passport) to CAC-016 (access map), and the sixteen test files run with one test code against the in-process binding and against the connector binding.
5. **G5, the documentation.** The repository holds the documentation files that the process requirements of §5.3 name.
6. **G6, the continuous integration.** The workflows of `.github/workflows/` run the tests with a PostgreSQL service, the Spectral linter on the OpenAPI file, the SAMM command line tool 2.11.1 on the models, the checks of `scripts/`, CodeQL and TruffleHog, and `.github/dependabot.yml` configures Dependabot.

## 3. Scope boundary

### 3.1 In scope

- The four lifecycle notifications NewPassportIssued, BatteryRepaired, BatteryBecameWaste and PassportEnded: the sending side, the receiving side and the record of each attempt.
- The lifecycle steps of a passport after its first passport: the new passport after one of the four operations, the predecessor links, the forward link, the repair entry, the waste status with its successor, the end of the passport, and the change of purchaser without a new passport.
- The three proposed aspect models and their payloads: the lifecycle submodel, the successors submodel and the access map.
- The sharing of individual battery information with the original issuer under a contract (use cases LC-1 and LC-5b of the proposal): the contract record, the offer, the pull and the received record.
- The registration of the PartType twin of a battery model and of the PartInstance twin of a passport through the twin registry contract of §9.2.6.
- The connector asset of the lifecycle notification API and the data offers of the submodels through the offer contract of §9.2.5.
- The PostgreSQL schema of §9.4 with its triggers and policies. The reference server runs on a PostgreSQL database of its own, which holds the schema of the reference server and no table of another application: the migration revokes the privilege to create temporary tables from the group PUBLIC of that database (decision D60, A fixed search path for every function, no temporary table for the application role, and a database of its own).
- The conformance test kit, the documentation files and the workflows of §2.

### 3.2 Out of scope, with owner and reason

| Item | Owner | Reason |
|---|---|---|
| The requirements of §5.4 | the owner of this repository | §5.4 states the reason of each group |
| The three items that decision Q-202 (the carrier for lifecycle data the aspect models lack) leaves open: the history of the responsible economic operators, the original placing date, and the performance and durability values at each change of status | the owner of this repository | The answer of decision Q-202 names no carrier for the three items. The reference server therefore serves none of the three items in an aspect model (decision D5, The three open items of the carrier decision) |
| The content and the registration of a CX-0131 (Circularity Core) certificate: the repair certificate, the reuse certificate, the remanufacturing certificate, the waste certificate and the material recycling certificate | the acting operator, in its own system | The models of the certificates are cited and not stored. The reference server carries the reference of a certificate in a notification, and checks the registered twin of the repair certificate before the repair notice (decision D48 [waits for the owner], The repair certificate before the notice) |
| A step that reverts a waste status, and a correction of an applied notification | the owner of this repository | The proposal defines no such step (decision D47 [waits for the owner], The access to the notification asset) |
| A refusal of a new passport that lacks a model of CX-0160-3 | the second-life operator | The data provider supplies each payload, and the server registers a descriptor per stored payload (decision D28, Supplied payloads) |
| A stored copy of the aspect models IDTA-02035-2, IDTA-02035-3, IDTA-02035-6 and IDTA-02035-7 | the owner of this repository | `sources/IDTA/` stores four of the eight models of CX-0160-3 `[live]`. D28 states how the server works without the other four texts |
| Version 2.0.0 of the shared model `io.catenax.shared.uuid`, which sections 3.2.2 and 3.3 of draft 0.7 of the proposal name | the owner of this repository | `sources/Tractus-X/semantic-models/` stores version 2.1.0 of the model and not version 2.0.0 `[live]`. The owner accepted on 2026-11-16 that the next draft of the proposal names version 2.1.0 (decision D32, The stored shared models) |
| The request to add the three proposed models to the Tractus-X semantic model repository, the request for the taxonomy name `cx-taxo:BatteryPassLifecycleNotificationAPI`, and the registration of the proposed usage purposes of Table 2.2 of the proposal | the owner of this repository | Section 3.5 and the note of section 4.3 of the proposal file the requests once the expert group accepts the proposal |
| The file `DEPENDENCIES` of the Eclipse Dash License Tool | the owner of this repository | The tool contacts the servers of the Eclipse Foundation. The owner runs the tool before the pull request to Eclipse Tractus-X. The need for the file is not verified against a stored text |
| The registry texts of §5.7 that wait for the owner | the owner of this repository | The owner approves each change of a requirement (`requirements/method.md`, section 10) |
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
- `scripts/check-license-headers.mjs`, `scripts/check-sources.mjs`, `scripts/check-private-references.mjs`, `scripts/requirements-check.mjs`, `scripts/lib/requirementsRules.mjs`, `scripts/check-annexes.mjs` and `scripts/spec-gate-check.mjs`.

## 4. Users and success measures

| User | What the user does with the result | Measure |
|---|---|---|
| A member of the Catena-X Digital Product Passport Expert Group | reads the OpenAPI file and the three models beside the proposal | `docs/api/openAPI.yaml` passes the Spectral linter with 0 errors, and the three models pass the SAMM command line tool 2.11.1 with 0 errors |
| An implementer of the proposal in another application | runs the conformance test kit against the reference server, then against the other application | the command of §15 item 6 reports `# fail 0` and `# skipped 0` on the in-process binding |
| A Conformity Assessment Body | reads one test per criterion of Annex A of the proposal | `tck/` holds the 16 files `CAC-001.tck.mjs` to `CAC-016.tck.mjs`, and each file names its criterion in its first test title |
| A maintainer of Eclipse Tractus-X | checks the conventions of the Tractus-X Release Guidelines | the four checks of §15 item 1 print 0 problems, 0 files without a license header or NOTICE section, 0 unregistered or changed source files, and 0 private references |
| The owner of this repository | traces each requirement to its file and its test | every table entry of §5.1 and §5.2 names a test, and `node scripts/requirements-check.mjs` reports 0 problems |

## 5. Requirements and constraints

The registry of `requirements/` holds 80 system requirements, 102 software requirements and 18 process requirements `[live]`. The reference server implements 56 system requirements (§5.1) and 71 software requirements (§5.2). The repository meets the 18 process requirements (§5.3). The reference server does not implement 24 system requirements and 31 software requirements (§5.4). The tables name the ten architecture elements by their identifiers: EL-BACKEND (the HTTP API), EL-ACCESS (the access control), EL-TWINS (the twin registration), EL-SUBMODELS (the submodel service), EL-CXCLIENT (the connector client), EL-DATASET (the battery passport dataset), EL-RDB (the relational database), EL-AUDIT (the audit trail), EL-BGWORK (the background work) and EL-CONNECTOR (the connector).

### 5.1 The system requirements that the reference server implements

The column "Verified by" names the conformance criterion whose test file `tck/CAC-<nnn>.tck.mjs` checks the requirement, or the server test file of §14.2 where Annex A of the proposal holds no criterion for the requirement. §17.2 names the verification measures of each requirement. One requirement of the table is not met in one case, which the table states.

| System requirement | Title | Elements | Verified by |
|---|---|---|---|
| SyR-PASS-005 | Only the responsible or an authorised operator changes the dataset | EL-ACCESS, EL-DATASET, EL-AUDIT, EL-SUBMODELS, EL-CXCLIENT, EL-RDB | CAC-005 (forward link) |
| SyR-PASS-011 | Every dataset field marked with exactly one access group | EL-DATASET, EL-SUBMODELS | CAC-016 (access map) |
| SyR-LIFE-008 | Status waste set on the existing passport, with no new passport | EL-DATASET | CAC-007 (waste status) |
| SyR-LIFE-011 | Recycling ends the battery's passport dataset | EL-DATASET, EL-CXCLIENT | CAC-009 (end of the passport) |
| SyR-LIFE-013 | Preparation for re-use or repurposing admitted only for waste | EL-DATASET | `server/test/lifecycleCatalogue.test.mjs` |
| SyR-LIFE-014 | Repurposing admitted only for a battery that is not waste | EL-DATASET | `server/test/lifecycleCatalogue.test.mjs` |
| SyR-LIFE-015 | Repurposing admitted only for a purpose different from the original | EL-DATASET | `server/test/lifecycleCatalogue.test.mjs` |
| SyR-LIFE-016 | Remanufacturing admitted only for the original purpose | EL-DATASET | `server/test/lifecycleCatalogue.test.mjs` |
| SyR-LIFE-017 | Preparation for re-use admitted only for the original purpose | EL-DATASET | `server/test/lifecycleCatalogue.test.mjs` |
| SyR-LIFE-018 | New passport dataset for a treated battery placed on the market again | EL-DATASET, EL-TWINS | CAC-001 (new passport) |
| SyR-LIFE-019 | New passport dataset links to each original battery's passport | EL-DATASET, EL-TWINS | CAC-004 (predecessor links) |
| SyR-LIFE-020 | Remanufactured dataset links every original battery's passport | EL-DATASET, EL-TWINS | CAC-004 (predecessor links) |
| SyR-LIFE-021 | Re-use and repurposing datasets link one or more original passports | EL-DATASET | CAC-004 (predecessor links) |
| SyR-LIFE-024 | Original passport kept, superseded relation held in the lineage records | EL-DATASET | CAC-005 (forward link) |
| SyR-LIFE-026 | New unique identifier attributed by the operator to the new passport | EL-DATASET | CAC-001 (new passport) |
| SyR-LIFE-028 | New passport dataset takes over the original battery model | EL-DATASET | CAC-003 (model elements) |
| SyR-LIFE-048 | Responsibility moves to the operator placing the battery again | EL-DATASET, EL-RDB | CAC-003 (model elements) |
| SyR-LIFE-049 | Responsibility moves to a named successor when the battery becomes waste | EL-DATASET, EL-RDB | CAC-007 (waste status) |
| SyR-LIFE-051 | Operator placing the treated battery named as its manufacturer | EL-DATASET, EL-RDB | CAC-003 (model elements) |
| SyR-LIFE-127 | End of a recycled battery's passport made known to the provider | EL-CXCLIENT, EL-BGWORK | CAC-009 (end of the passport) |
| SyR-CXD-092 | Notification APIs offered and called with HTTP POST only | EL-BGWORK, EL-CXCLIENT, EL-CONNECTOR, EL-BACKEND | CAC-012 (notification API) |
| SyR-CXD-096 | Notification endpoints answer 200, or 4xx or 5xx on failure | EL-BACKEND, EL-CONNECTOR | CAC-012 (notification API) |
| SyR-PASS-215 | Individual battery information shared with the passport issuer under contract | EL-CXCLIENT | `server/test/issuerContracts.integration.test.mjs` |
| SyR-CXD-218 | Issuer's contract negotiation for individual battery information without a manual step | EL-CXCLIENT | `server/test/issuerContracts.integration.test.mjs` |
| SyR-CXD-219 | Transfer of individual battery information to the issuer without a manual step | EL-CXCLIENT | `server/test/issuerContracts.integration.test.mjs` |
| SyR-PASS-230 | Passport data held only for the responsible or an authorised operator | EL-DATASET | CAC-005 (forward link) |
| SyR-LIFE-129 | Producer of the current passport takes over a waste battery's passport | EL-DATASET | CAC-007 (waste status); not met by decision D17 (The named waste successor) for a named producer that is not the producer of the current passport; a rewording is proposed to the owner (§5.7) |
| SyR-LIFE-130 | Only the original issuer writes into an original passport | EL-DATASET | CAC-005 (forward link) |
| SyR-LIFE-131 | New passport delivered as a passport of its own, not a version | EL-DATASET | CAC-001 (new passport) |
| SyR-LIFE-132 | Remanufacturing donor's passport later accepts the status waste | EL-DATASET | CAC-008 (donors) |
| SyR-LIFE-133 | Direct re-use without preparation keeps the passport and its identifier | EL-DATASET | CAC-006 (status and repair) |
| SyR-LIFE-134 | Direct re-use leaves the responsible economic operator unchanged | EL-DATASET | CAC-006 (status and repair) |
| SyR-PASS-231 | New holder after direct re-use recorded as the battery's purchaser | EL-ACCESS | CAC-010 (access) |
| SyR-CXD-221 | New digital twin for a battery that receives a new passport | EL-TWINS | CAC-002 (digital twin) |
| SyR-LIFE-138 | Original issuer notified of a new passport under contract | EL-CXCLIENT | CAC-012 (notification API) |
| SyR-LIFE-139 | Original issuer may add a forward link to its own passport | EL-DATASET | CAC-005 (forward link) |
| SyR-PASS-232 | Forward link offered to the issuer's authorised recipients and authorities | EL-DATASET | CAC-005 (forward link) |
| SyR-PASS-233 | Degradation data of a second-life battery offered to the original issuer | EL-CXCLIENT | `server/test/issuerContracts.integration.test.mjs` |
| SyR-PASS-235 | Previous holder loses access to individual battery information after a resale | EL-ACCESS | CAC-010 (access) |
| SyR-LIFE-140 | Battery status unchanged after a direct re-use | EL-DATASET | CAC-006 (status and repair) |
| SyR-LIFE-141 | Passport's data provider, nameplate manufacturer and successor notified of the recycling | EL-CXCLIENT | CAC-009 (end of the passport) |
| SyR-LIFE-142 | Predecessor issuers may be notified of the recycling under contract | EL-CXCLIENT | CAC-009 (end of the passport) |
| SyR-LIFE-143 | Only the data provider of a passport writes into that passport | EL-DATASET | CAC-005 (forward link) |
| SyR-LIFE-144 | End of the passport recorded without the successor's authorisation | EL-DATASET | CAC-007 (waste status) |
| SyR-LIFE-145 | Repair notified to the data provider of the passport | EL-CXCLIENT | CAC-006 (status and repair) |
| SyR-LIFE-146 | Repair certificate held as the record of the repair | EL-DATASET | CAC-006 (status and repair) |
| SyR-LIFE-147 | Waste status notified to the data provider and the named successor | EL-CXCLIENT | CAC-007 (waste status) |
| SyR-LIFE-148 | Successor, successor's role and date of the waste status held | EL-DATASET | CAC-007 (waste status) |
| SyR-LIFE-149 | Date of the recycling and the recycler held in the ended passport | EL-DATASET | CAC-009 (end of the passport) |
| SyR-LIFE-150 | Last battery status kept on a superseded original passport | EL-DATASET | CAC-005 (forward link) |
| SyR-LIFE-151 | New passport accepted only with the treated battery's performance values | EL-DATASET | CAC-003 (model elements) |
| SyR-PASS-236 | Lifecycle record offered only to purchaser, operators and authorities | EL-CXCLIENT | CAC-010 (access) |
| SyR-LIFE-152 | Receiver without a notification asset recorded by the sender | EL-CXCLIENT | CAC-012 (notification API) |
| SyR-LIFE-153 | One lifecycle notification per receiver and per passport | EL-CXCLIENT | CAC-012 (notification API) |
| SyR-LIFE-154 | Notification changes a passport only by the receiver's assigned steps | EL-DATASET | CAC-012 (notification API) |
| SyR-LIFE-155 | Manufacturer identification of a passport never changed after issue | EL-DATASET | `server/test/databaseRules.integration.test.mjs` |

### 5.2 The software requirements that the reference server implements

Every file of the column "Implemented in" and every file of the column "Test" is a planned file of §7. The last column states the state that phase P8 writes into the field `implementation` of the requirement; a state `partial` names what the reference server delivers and what the server does not deliver.

| Software requirement | Title | Element | Implemented in | Test | State that phase P8 records |
|---|---|---|---|---|---|
| SwR-DATASET-065 | Every dataset field marked with exactly one Art. 77(2) access group | EL-DATASET | `server/src/submodels/accessMapService.mjs` | `server/test/accessMap.integration.test.mjs` | implemented |
| SwR-DATASET-085 | Status waste set on the existing dataset without a new passport | EL-DATASET | `server/src/dataset/lifecycleService.mjs` | `server/test/lifecycleService.integration.test.mjs` | implemented |
| SwR-DATASET-086 | Change to waste accepted only with a named responsible successor | EL-DATASET | `server/src/dataset/lifecycleService.mjs` | `server/test/lifecycleService.integration.test.mjs` | implemented |
| SwR-DATASET-087 | Operations admitted only from the statuses the admission table allows | EL-DATASET | `server/src/dataset/lifecycleCatalogue.mjs` | `server/test/lifecycleCatalogue.test.mjs` | implemented |
| SwR-DATASET-089 | Recycling ends the dataset, no longer current and closed to change | EL-DATASET | `server/src/dataset/lifecycleService.mjs` | `server/test/lifecycleService.integration.test.mjs` | implemented |
| SwR-DATASET-091 | Operations admitted by comparing current and original purpose | EL-DATASET | `server/src/dataset/lifecycleCatalogue.mjs` | `server/test/lifecycleCatalogue.test.mjs` | implemented |
| SwR-DATASET-092 | Original purpose and each later purpose recorded with their dates | EL-DATASET | `server/src/dataset/lifecycleService.mjs` | `server/test/lifecycleService.integration.test.mjs` | implemented |
| SwR-DATASET-093 | New dataset created for a treated battery placed on the market again | EL-DATASET | `server/src/dataset/lifecycleService.mjs` | `server/test/lifecycleService.integration.test.mjs` | implemented |
| SwR-DATASET-094 | New dataset carries a resolving link to the original passport | EL-DATASET | `server/src/dataset/lifecycleService.mjs` | `server/test/lifecycleService.integration.test.mjs` | implemented |
| SwR-DATASET-095 | Remanufactured dataset links the passport of every original battery | EL-DATASET | `server/src/dataset/lifecycleService.mjs` | `server/test/lifecycleService.integration.test.mjs` | implemented |
| SwR-DATASET-096 | Re-use and repurposing datasets accepted only with one or more links | EL-DATASET | `server/src/dataset/lifecycleService.mjs` | `server/test/lifecycleService.integration.test.mjs` | implemented |
| SwR-DATASET-098 | Original dataset kept and marked as superseded by the new one | EL-DATASET | `server/src/dataset/lifecycleService.mjs` | `server/test/lifecycleService.integration.test.mjs` | implemented |
| SwR-DATASET-100 | New dataset given an identifier different from every original | EL-DATASET | `server/src/dataset/lifecycleService.mjs` | `server/test/lifecycleService.integration.test.mjs` | implemented |
| SwR-DATASET-102 | New dataset fields set at the issue of a new passport | EL-DATASET | `server/src/dataset/lifecycleService.mjs` | `server/test/lifecycleService.integration.test.mjs` | implemented |
| SwR-DATASET-116 | Responsibility of a new dataset given to the operator placing it again | EL-DATASET | `server/src/dataset/lifecycleService.mjs` | `server/test/lifecycleService.integration.test.mjs` | implemented |
| SwR-DATASET-118 | Operator placing a treated battery named its manufacturer | EL-DATASET | `server/src/dataset/lifecycleService.mjs` | `server/test/lifecycleService.integration.test.mjs` | implemented |
| SwR-DATASET-119 | Changes applied only for the responsible or an authorised operator | EL-DATASET | `server/src/dataset/lifecycleService.mjs` | `server/test/lifecycleService.integration.test.mjs` | partial: the authorisation with its period governs the writes after the waste status only (D18 (The successor's authorisation with its period), §5.7) |
| SwR-DATASET-126 | Lifecycle data delivered beside the seven aspects in the decided carrier | EL-DATASET | `server/src/dataset/lifecycleRecordReader.mjs` | `server/test/submodelRoutes.integration.test.mjs` | partial: delivers the links with their operation, the supersession and the repair certificates; delivers no treatment description, no descriptive term and no original placing date (D46 (The partial delivery of the lifecycle data)) |
| SwR-SUBMODELS-036 | Access marking assigns every served passport field one group | EL-SUBMODELS | `server/src/submodels/accessMapService.mjs` | `server/test/accessMap.integration.test.mjs` | implemented |
| SwR-SUBMODELS-052 | Submodel endpoints change no stored data | EL-SUBMODELS | `server/src/routes/submodelRoutes.mjs` | `server/test/submodelRoutes.integration.test.mjs` | implemented |
| SwR-TWINS-110 | A new PartInstance twin for a treated battery placed again | EL-TWINS | `server/src/twins/shellDescriptor.mjs` | `server/test/shellDescriptor.test.mjs` | implemented |
| SwR-TWINS-111 | New PartInstance links each original battery, resolving in the registry | EL-TWINS | `server/src/dataset/lifecycleRecordReader.mjs` | `tck/CAC-004.tck.mjs` | implemented |
| SwR-BACKEND-147 | Notification endpoints offered with HTTP POST only | EL-BACKEND | `server/src/routes/lifecycleNotificationRoutes.mjs` | `server/test/lifecycleNotificationRoutes.integration.test.mjs` | implemented |
| SwR-BACKEND-148 | Notification answered 200 when accepted, 4xx or 5xx otherwise | EL-BACKEND | `server/src/routes/lifecycleNotificationRoutes.mjs` | `server/test/lifecycleNotificationRoutes.integration.test.mjs` | implemented |
| SwR-AUDIT-045 | Dataset write decisions recorded with the authorisation relied on | EL-AUDIT | `server/src/audit/auditLog.mjs` | `server/test/audit.integration.test.mjs` | implemented |
| SwR-ACCESS-088 | Passport dataset writes only by the responsible or authorised operator | EL-ACCESS | `server/src/db/migrations/003_policies.sql` | `server/test/passportRoutes.integration.test.mjs` | partial: a write on a passport that the deployment does not hold answers 404 (D6 (One deployment, one company, one writer), §5.7) |
| SwR-CXCLIENT-059 | Notifications built to CX-0151 and sent as JSON POST | EL-CXCLIENT | `server/src/connector/messageHeader.mjs` | `server/test/messageHeader.test.mjs` | implemented |
| SwR-CXCLIENT-110 | Recycling withdraws the passport dataset offers | EL-CXCLIENT | `server/src/connector/offerPublisher.mjs` | `server/test/offerPublisher.integration.test.mjs` | implemented |
| SwR-CXCLIENT-111 | End of a recycled battery's passport made known to the provider | EL-CXCLIENT | `server/src/connector/notificationPlan.mjs` | `server/test/notificationPlan.test.mjs` | implemented |
| SwR-BGWORK-010 | Lifecycle notifications sent unchanged as JSON POST through the connector | EL-BGWORK | `server/src/background/outboxWorker.mjs` | `server/test/outboxWorker.integration.test.mjs` | implemented |
| SwR-BGWORK-020 | End of a recycled battery's passport sent in time | EL-BGWORK | `server/src/background/outboxWorker.mjs` | `server/test/outboxWorker.integration.test.mjs` | implemented |
| SwR-RDB-007 | Dataset writes only by the responsible or an authorised operator | EL-RDB | `server/src/db/migrations/003_policies.sql` | `server/test/databaseRules.integration.test.mjs` | partial: the policy admits the data provider only; no authorised company writes (D6 (One deployment, one company, one writer), §5.7) |
| SwR-RDB-073 | Timeline of responsible economic operators held per passport | EL-RDB | `server/src/db/migrations/002_triggers.sql` | `server/test/databaseRules.integration.test.mjs` | implemented |
| SwR-RDB-074 | Change to waste refused without a named successor | EL-RDB | `server/src/db/migrations/002_triggers.sql` | `server/test/databaseRules.integration.test.mjs` | implemented |
| SwR-RDB-075 | Manufacturer held in each passport record and never empty on write | EL-RDB | `server/src/db/migrations/001_schema.sql` | `server/test/databaseRules.integration.test.mjs` | implemented |
| SwR-CXCLIENT-166 | Point 4 offer for the passport issuer gated by a recorded contract | EL-CXCLIENT | `server/src/connector/issuerContractService.mjs` | `server/test/issuerContracts.integration.test.mjs` | implemented |
| SwR-CXCLIENT-167 | Issuer's negotiation for point 4 information run without a user step | EL-CXCLIENT | `server/src/connector/batteryInformationPuller.mjs` | `server/test/issuerContracts.integration.test.mjs` | implemented |
| SwR-CXCLIENT-168 | Point 4 transfer to the issuer stored without a user step | EL-CXCLIENT | `server/src/connector/batteryInformationPuller.mjs` | `server/test/issuerContracts.integration.test.mjs` | implemented |
| SwR-DATASET-190 | Passport rows written only under the responsible operator's context | EL-DATASET | `server/src/db/migrations/003_policies.sql` | `server/test/databaseRules.integration.test.mjs` | partial: the policy admits the data provider only; no authorised company writes (D6 (One deployment, one company, one writer), §5.7) |
| SwR-DATASET-191 | Waste step records the named successor, never the actor as manufacturer | EL-DATASET | `server/src/dataset/lifecycleService.mjs` | `server/test/lifecycleService.integration.test.mjs` | implemented |
| SwR-DATASET-192 | Lineage step writes no link into an original passport row | EL-DATASET | `server/src/dataset/lifecycleService.mjs` | `server/test/lifecycleService.integration.test.mjs` | implemented |
| SwR-DATASET-193 | New passport served under its own DPP Metadata identifier | EL-DATASET | `server/src/submodels/submodelService.mjs` | `server/test/submodelRoutes.integration.test.mjs` | implemented |
| SwR-DATASET-194 | Remanufacturing donor accepted for the waste status | EL-DATASET | `server/src/dataset/lifecycleService.mjs` | `server/test/lifecycleService.integration.test.mjs` | implemented |
| SwR-DATASET-195 | Direct re-use recorded as a purchaser change, never as a lineage step | EL-DATASET | `server/src/access/accessRecordService.mjs` | `server/test/accessRecords.integration.test.mjs` | implemented |
| SwR-DATASET-196 | Direct re-use leaves the responsible operator unchanged | EL-DATASET | `server/src/access/accessRecordService.mjs` | `server/test/accessRecords.integration.test.mjs` | implemented |
| SwR-ACCESS-127 | Purchaser for point 4 access taken from the open access record | EL-ACCESS | `server/src/access/accessRecordService.mjs` | `server/test/accessRecords.integration.test.mjs` | implemented |
| SwR-TWINS-154 | New PartInstance twin registered for a new passport, originals untouched | EL-TWINS | `server/src/twins/shellDescriptor.mjs` | `server/test/shellDescriptor.test.mjs` | implemented |
| SwR-CXCLIENT-176 | NewPassportIssued sent to each original passport's data provider under contract | EL-CXCLIENT | `server/src/connector/notificationPlan.mjs` | `server/test/notificationPlan.test.mjs` | implemented |
| SwR-DATASET-197 | Forward link added on the original data provider's request | EL-DATASET | `server/src/dataset/lifecycleService.mjs` | `server/test/lifecycleService.integration.test.mjs` | implemented |
| SwR-DATASET-198 | Successors record served as a submodel of its own | EL-DATASET | `server/src/submodels/submodelService.mjs` | `server/test/submodelRoutes.integration.test.mjs` | implemented |
| SwR-CXCLIENT-177 | Second-life battery's point 4 offer to the original data provider | EL-CXCLIENT | `server/src/connector/issuerContractService.mjs` | `server/test/issuerContracts.integration.test.mjs` | implemented |
| SwR-ACCESS-129 | Previous holder's point 4 access ends with the closed access record | EL-ACCESS | `server/src/access/accessRecordService.mjs` | `server/test/accessRecords.integration.test.mjs` | implemented |
| SwR-DATASET-199 | Direct re-use leaves the battery status unchanged | EL-DATASET | `server/src/access/accessRecordService.mjs` | `server/test/accessRecords.integration.test.mjs` | implemented |
| SwR-CXCLIENT-178 | PassportEnded sent to the data provider, nameplate manufacturer and successor | EL-CXCLIENT | `server/src/connector/notificationPlan.mjs` | `server/test/notificationPlan.test.mjs` | implemented |
| SwR-CXCLIENT-179 | PassportEnded may be sent to predecessor data providers under contract | EL-CXCLIENT | `server/src/connector/notificationPlan.mjs` | `server/test/notificationPlan.test.mjs` | implemented |
| SwR-CXCLIENT-180 | BatteryRepaired sent to the data provider of the repaired battery's passport | EL-CXCLIENT | `server/src/connector/notificationPlan.mjs` | `server/test/notificationPlan.test.mjs` | implemented |
| SwR-CXCLIENT-181 | BatteryBecameWaste sent to the data provider and the named successor | EL-CXCLIENT | `server/src/connector/notificationPlan.mjs` | `server/test/notificationPlan.test.mjs` | implemented |
| SwR-CXCLIENT-182 | Lifecycle record offer restricted to purchaser, operators and authorities | EL-CXCLIENT | `server/src/connector/offerPublisher.mjs` | `server/test/offerPublisher.integration.test.mjs` | implemented |
| SwR-CXCLIENT-183 | Sender's record of a receiver without an asset or a contract | EL-CXCLIENT | `server/src/connector/notificationSender.mjs` | `server/test/notificationSender.integration.test.mjs` | implemented |
| SwR-CXCLIENT-184 | Notification plan holds one notification per receiver and passport | EL-CXCLIENT | `server/src/connector/notificationPlan.mjs` | `server/test/notificationPlan.test.mjs` | implemented |
| SwR-DATASET-200 | Passport rows written only in the data provider's deployment | EL-DATASET | `server/src/dataset/lifecycleService.mjs` | `server/test/lifecycleService.integration.test.mjs` | partial: a write on a passport that the deployment does not hold answers 404 (D6 (One deployment, one company, one writer), §5.7) |
| SwR-DATASET-201 | End of the passport exempt from the successor authorisation check | EL-DATASET | `server/src/dataset/lifecycleService.mjs` | `server/test/lifecycleService.integration.test.mjs` | implemented |
| SwR-DATASET-202 | Repair entry stored with the repair certificate's catenaXId | EL-DATASET | `server/src/dataset/lifecycleService.mjs` | `server/test/lifecycleService.integration.test.mjs` | implemented |
| SwR-DATASET-203 | Successor, role and date stored with the waste status | EL-DATASET | `server/src/dataset/lifecycleService.mjs` | `server/test/lifecycleService.integration.test.mjs` | implemented |
| SwR-DATASET-204 | Recycling date and recycler stored as the end of the passport | EL-DATASET | `server/src/dataset/lifecycleService.mjs` | `server/test/lifecycleService.integration.test.mjs` | implemented |
| SwR-DATASET-205 | Original passport's status kept when a new passport supersedes it | EL-DATASET | `server/src/dataset/lifecycleService.mjs` | `server/test/lifecycleService.integration.test.mjs` | implemented |
| SwR-DATASET-206 | Lineage step requires the treated battery's four performance values | EL-DATASET | `server/src/dataset/lifecycleService.mjs` | `server/test/lifecycleService.integration.test.mjs` | implemented |
| SwR-DATASET-207 | Received notification applied only through its operation's step | EL-DATASET | `server/src/dataset/lifecycleService.mjs` | `server/test/lifecycleService.integration.test.mjs` | implemented |
| SwR-BACKEND-206 | Lifecycle notification failures answered with envelope and result object | EL-BACKEND | `server/src/routes/lifecycleNotificationRoutes.mjs` | `server/test/lifecycleNotificationRoutes.integration.test.mjs` | implemented |
| SwR-BACKEND-207 | Four lifecycle notification operations received as POST endpoints | EL-BACKEND | `server/src/routes/lifecycleNotificationRoutes.mjs` | `server/test/lifecycleNotificationRoutes.integration.test.mjs` | implemented |
| SwR-DATASET-208 | Database trigger refuses a change of a passport's manufacturer | EL-DATASET | `server/src/db/migrations/002_triggers.sql` | `server/test/databaseRules.integration.test.mjs` | implemented |

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
| PrR-CXD-025 | List of the items that no stored standard covers | `docs/proposals.md`, extended with the three models | substrate; P2, P8 |
| PrR-CXD-026 | Three proposed models in the sldt-semantic-models layout | the three model folders of `models/` | P2 |
| PrR-CXD-027 | Proposed models validated with SAMM CLI 2.11.1 | `scripts/validate-models.sh` and `.github/workflows/samm.yml`, planned files of §7 | P2 |
| PrR-CXD-028 | One conformance test per criterion CX-0160-4-CAC-001 to 016 | the sixteen files `tck/CAC-<nnn>.tck.mjs` | P6 |
| PrR-CXD-029 | Conformance tests run against the in-process binding and the connector binding | `tck/lib/binding.mjs` with its two binding modules, planned files of §7 | P6, P7 |
| PrR-CXD-030 | OpenAPI file linted with Spectral on every change | `.github/workflows/spectral.yml` and `.spectral.yaml`, planned files of §7 | P1 |

### 5.4 The requirements that the reference server does not implement

The owner decided the scope on 2026-11-16 (decision D44, The scope of the reference server). The group numbers are the numbers of version 1 of this specification. Group 4 of version 1, the sharing of individual battery information with the original issuer, moved into §5.1 and §5.2.

| Group | Requirements | Reason | Decided by |
|---|---|---|---|
| Group 1: the recovered materials and the recycling efficiency | SyR-PASS-210 (Recovered materials readable by recycler, manufacturer and authorities only); SyR-LIFE-109 (Recovered materials recorded only by the battery's recycler); SyR-LIFE-115 (Recycling efficiency recorded as output mass over input mass); SwR-DATASET-071 (Recovered materials returned only to recycler, manufacturer and authorities); SwR-DATASET-120 (Recovered masses of the five metals recorded only by the recycler); SwR-DATASET-122 (Recycling efficiency recorded as output mass over input mass); SwR-ACCESS-091 (Recovered materials readable only by recycler, manufacturer and authorities); SwR-ACCESS-092 (Recovered materials and recycling efficiency recorded only by the battery's recycler); SwR-RDB-008 (Recovered materials readable by recorder, manufacturer and authorities only); SwR-RDB-009 (Recovered masses accepted in kg from the battery's recycler); SwR-RDB-068 (Recycling efficiency held as output mass over input mass) | Section 1.1 of the proposal puts the calculation of the recycling efficiency and of the recovery of materials outside CX-0160-4, and PassportEnded carries the reference of the material recycling certificate and no recovered mass (D10 (The content of PassportEnded)) | the owner, on 2026-11-16 (D44 (The scope of the reference server)) |
| Group 2: the rules that rest only on the draft implementing act under Article 77(9) of Regulation (EU) 2023/1542 | SyR-PASS-216 (Reselling purchaser shares individual battery information with a prospective purchaser); SyR-PASS-217 (Reselling purchaser shares individual battery information with the named authorities); SyR-PASS-218 (Used-battery operators read individual battery information only through the purchaser's share); SyR-PASS-219 (Individual battery information marked for the purchaser and the purchaser's agent); SyR-PASS-220 (Detailed composition marked for second-life operators, recyclers and training centres); SyR-PASS-221 (Dismantling information marked for second-life operators, recyclers and training centres); SyR-PASS-222 (Part numbers and spare sources marked for second-life operators and purchaser); SyR-PASS-223 (Safety measures marked for second-life operators and vehicle and electronics treatment); SyR-PASS-224 (Restricted information offered only for evaluation and second-life purposes); SyR-PASS-225 (Purchaser's offer of individual battery information also admits energy aggregators); SyR-PASS-226 (Restricted information offered under a policy that forbids sharing outside the exceptions); SyR-PASS-227 (Economic operator may authorise wider sharing of restricted information); SyR-PASS-228 (Second-life operator authorises wider sharing of the new passport's battery information); SyR-PASS-229 (Safety measures may be offered without restriction on further use); SyR-PASS-234 (Original manufacturer authorises sharing of model information on a new passport); SwR-CXCLIENT-169 (Resale point 4 offer restricted to the named prospective purchaser); SwR-CXCLIENT-170 (Restricted offers limited to the purposes of draft Art. 2(1)); SwR-CXCLIENT-171 (Purchaser's point 4 offer also carries the aggregator purpose); SwR-CXCLIENT-172 (Point 2 and point 4 offers prohibit sharing outside draft Art. 2(4)); SwR-CXCLIENT-173 (Safety measures offer may carry a bare use permission); SwR-ACCESS-123 (Purchaser's grant of point 4 access to a named authority); SwR-ACCESS-124 (Used-battery operators' point 4 reads gated by the purchaser's named share); SwR-ACCESS-125 (Operator's authorisation for wider sharing recorded per named person); SwR-ACCESS-126 (New passport's point 4 authorisation accepted only from its operator); SwR-ACCESS-128 (Model information authorisation on a new passport accepted from the original issuer); SwR-DATASET-185 (Point 4 fields marked for the purchaser and the purchaser's agent); SwR-DATASET-186 (Detailed composition fields marked for the second-life and training group); SwR-DATASET-187 (Dismantling information fields marked for the second-life and training group); SwR-DATASET-188 (Part number and spare source fields marked for the second-life group); SwR-DATASET-189 (Safety measure fields marked for the treatment operators' group) | The act is a draft, and Annex B point 1 of the proposal states that the final act may change its exceptions. The requirements wait for the adoption of the act (D39 (The draft implementing act)) | the owner, on 2026-11-16 (D44 (The scope of the reference server)) |
| Group 3: the reports of the first recycler under Delegated Regulation (EU) 2025/606 | SyR-LIFE-135 (First recycler receives every later facility's recycling efficiency and recovery); SyR-LIFE-136 (First recycler's report of every facility for the competent authorities); SyR-LIFE-137 (Preparation-for-recycling operator provides its data to the first recycler); SwR-CXCLIENT-174 (Received facility results stored per facility and fraction); SwR-CXCLIENT-175 (Preparation-for-recycling data offered only to the named first recycler); SwR-BACKEND-205 (First recycler's facility report answered per reporting period) | Section 1.1 of the proposal puts the yearly report on recycling outside CX-0160-4, and no interface of the proposal carries the data of a recycling facility | the owner, on 2026-11-16 (D44 (The scope of the reference server)) |
| Group 5: the twins and the bills of material of traced parts | SyR-CXD-220 (Digital twin created for each serialized part and batch to be traced); SyR-CXD-222 (As-built bill of material may reference a child's part type twin); SyR-CXD-223 (As-built usage never references a parent's part type twin); SwR-TWINS-153 (PartInstance twin registered for each traced item); SwR-TWINS-155 (As-built child item may reference a PartType twin); SwR-TWINS-156 (As-built usage parents taken only from part instance edges) | The reference server holds passports and no traced part. The data provider supplies the SerialPart payload and the SingleLevelBomAsBuilt payload of a passport (D28 (Supplied payloads)), and the proposal changes no rule of CX-0127 | the owner, on 2026-11-16 (D44 (The scope of the reference server)) |
| Group 6: the inputs of a passport dataset pulled from a partner | SwR-CXCLIENT-114 (Received passport inputs written only for the responsible operator) | The reference server writes no data received from a partner into a passport dataset. A lifecycle notification changes a passport only through the step of its operation (§10.4), and the individual battery information that the original issuer receives is stored in a record of its own and never in a passport (D38 (The sharing of individual battery information)). The statement would also refuse the storage in use case LC-5b, where the original issuer is not the responsible operator of the new passport | the owner, on 2026-11-16 (D44 (The scope of the reference server)) |
| Group 7: the data plane of the connector | SwR-CONNECTOR-061 (Data plane forwards requests and responses unchanged per data address) | The requirement binds the connector, which the reference server uses and does not contain. The memory transport of §9.2.5 forwards the method, the path, the body and the content type unchanged and returns the status and the body of the receiver unchanged | the owner, on 2026-11-16 (D44 (The scope of the reference server)) |

### 5.5 The decisions of the registry that this specification applies

| Decision | What the answer states | Where this specification applies the answer |
|---|---|---|
| Q-200 (how the dataset delivers each field's access group) | The access map names the access group of every field of the seven IDTA-02035 aspect models. Each of the two lifecycle models has one data offer with its own access policy | D3 (The access map and the whole aspect) [waits for the owner], D4 (One offer per lifecycle model), §9.2.4, §10.5 |
| Q-202 (the carrier for lifecycle data the aspect models lack) | BatteryPassportLifecycle carries the predecessor links, the waste successor and the end of the passport. BatteryPassportSuccessors carries the forward links. Three items stay open | D5 (The three open items of the carrier decision), §10.6 |
| Q-409 (whether served aspect payloads skip the response envelope) | A route that serves an aspect payload answers the bare payload on success. A failure answers the error envelope together with the result object of AAS Part 2 | D9 (The error body), §9.5, `EP-SUBMODEL`, `EP-ACCESS-MAP` |
| Q-1011 (whether the reference implementation builds use case UC-5) | The reference implementation builds UC-5a, the notices of the lifecycle events, and UC-5b, the purchase of degradation data | UC-5a and UC-5b are in scope (D42 (A database of 17 tables), D38 (The sharing of individual battery information)) |
| Q-1013 (where the lifecycle rules of the battery after its first passport are built) | The lifecycle rules are built in the battery passport dataset element EL-DATASET (the battery passport dataset), as the one lifecycle executor | §9.2.2: `server/src/dataset/lifecycleService.mjs` is the one executor |
| Q-1014 (where the reference implementation of the after-first-passport work is built) | The reference implementation is built in this repository, with its own server on Node.js and PostgreSQL, the conformance tests and its own registry | the whole specification |
| Q-1007 (which producer takes over the passport of a second-life battery that becomes waste) | Option A: the producer of the passport that is current when the battery becomes waste | The answer decides between the two producers of a second-life battery. D17 (The named waste successor) records the successor that the notification names, also when the named producer is neither of the two; §5.7 holds the proposed rewording of the system requirement |
| Q-042 (whether a donor battery may supply several remanufactured batteries) | Yes, without a limit: several new passports may name the same predecessor (answered on 2026-11-16) | D40 (The admission rule); the unique index of `passport_lineage_links` covers one new passport and one predecessor only |

Three decisions of the registry that concern requirements of §5.1 have no answer `[live]`. The table states what this specification assumes for each, why the assumption is the narrowest, and what changes when the owner decides otherwise.

| Open decision | Assumption of this specification | Why the assumption is the narrowest | What another answer changes |
|---|---|---|---|
| Q-961 (how the passport service provider learns a passport ended) | The end is made known by the notification PassportEnded, 5 seconds after the recycling is recorded, to the receivers of Table 4.3 of the proposal and, when a variable names one, to the passport service provider; the lifecycle submodel shows the end, and the dataset offers are withdrawn (D1 (The delay of the end notice), D33 (The offers of an ended passport) [waits for the owner], D34 (The passport service provider as a receiver) [waits for the owner]) | The assumption uses only the notification and the submodel that the proposal defines and the delay that the owner stated | the plan of §10.3 and the variable `PASSPORT_SERVICE_PROVIDER_BPNL` |
| Q-971 (whether operators without passport responsibility may record passport information) | Such an operator records nothing in a passport. The repairer, the waste receiver and the recycler report their event, and the data provider records the event (D6 (One deployment, one company, one writer), D19 (The repair entry) [waits for the owner]) | Sections 2.1.3 item 2, 2.1.4, 2.1.5 and 2.1.7 of the proposal make the data provider the only writer | the receiving step of §10.4 |
| Q-025 (access to the record of a recycled battery's ended passport) | The ended passport and its lifecycle submodel stay readable for the readers that held an access record before the end, with no time limit; the offers of the ten stored aspect keys are withdrawn (D33 [waits for the owner]) | Section 2.1.7 item 5 of the proposal states the SHOULD, and SwR-CXCLIENT-110 (Recycling withdraws the passport dataset offers) states the withdrawal | `withdrawDatasetOffers` and the rule after the end of §9.2.2 |

### 5.6 Constraints from the rules of this repository

- **Licenses** (`CLAUDE.md`, "Tractus-X conventions"): every code file starts with the Apache-2.0 header, every YAML and Turtle file starts with the header of its license, and every Markdown file ends with the NOTICE section. A JSON file carries no header, because JSON has no comment.
- **One executor per capability** (`CLAUDE.md`, "Engineering rules"): one module performs each capability. §9.2 names the one module of each capability.
- **Layers**: a route reads the request, checks the access, calls a service and writes the response. A service holds the rule. A repository module holds the SQL. No route and no service module holds SQL text.
- **Dependency inversion**: importing a module reads no environment variable and creates no client. `server/src/index.mjs` is the one composition root.
- **Deny by default**: a failed check refuses. No error is silently discarded.
- **Tests**: every change comes with its test.
- **Commits**: a commit message follows the Conventional Commits format. The implementer commits only when the owner orders a commit.

### 5.7 Registry changes that this specification needs

The implementer changes no requirement. The owner approved ten registry texts on 2026-11-16 with the words "Approve all" (§12.1), and the registry at the substrate holds them `[live]`: the title and the statement of SwR-DATASET-191 (Waste step records the named successor, never the actor as manufacturer); the statement of SwR-DATASET-208 (Database trigger refuses a change of a passport's manufacturer); the title and the statement of SwR-DATASET-195 (Direct re-use recorded as a purchaser change, never as a lineage step), of SwR-ACCESS-127 (Purchaser for point 4 access taken from the open access record) and of SwR-ACCESS-129 (Previous holder's point 4 access ends with the closed access record); the pass criteria of VM-PRC-CXD-021 (Inspection of the list of proposed items), of VM-PRC-CXD-023 (Validation of the proposed models with SAMM CLI 2.11.1) and of VM-PRC-CXD-025 (Run of the conformance tests against both bindings); the description of the architecture element EL-BGWORK (the background work); and the status `agreed` of the ten elements and the twelve interfaces. No registry text blocks a phase.

The first table lists the texts of the registry whose rule differs from the design. The implementer builds the design of this specification, and the owner decides each proposed text. No entry of the table changes a file of phases P1 to P3.

| Record | Text of the record today `[live]` | Design of this specification | Proposed text |
|---|---|---|---|
| SyR-LIFE-129 (Producer of the current passport takes over a waste battery's passport), statement | "When a battery's status changes to 'waste' and the responsibility for its passport passes to the producer, the application shall record as that producer the producer of the battery's current passport: the operator that placed the battery on the market again for a passport created after preparation for re-use, preparation for repurposing, repurposing or remanufacturing, and the original producer for every other passport." | D17 records the successor that the notification names. The requirement is met when the named producer is the producer of the current passport, and is not met when the notification names another producer | "When a battery's status changes to 'waste' and the responsibility for its passport passes to the producer, the application shall record as that producer the producer that the waste notification names, which is the operator that placed the battery on the market again for a passport created after preparation for re-use, preparation for repurposing, repurposing or remanufacturing, the original producer for every other passport, or, where the notification names a producer that is neither of the two, for example an importer, that named producer." |
| VM-SYS-LIFE-048 (Producer of the current passport takes over a waste battery's passport), pass criteria, the first measure that the rewording affects | "the change is accepted only when the producer named is the second-life operator; for a battery with only its original passport, only the original producer is accepted. Fails when: The change to 'waste' is accepted with a producer that is not the producer of the battery's current passport." | the change is accepted with every named producer | "the change is accepted with the producer that the notification names, and the passport records that producer as its responsible operator, for the second-life operator, for the original producer and for a named producer that is neither. Fails when: the recorded producer differs from the producer that the notification names." |
| VM-SWE-DATASET-055 (Producer of the current passport recorded at the waste status), pass criteria, the second measure that the rewording affects | "For a seeded passport created by a second-life operator, the waste transition records the second-life operator as responsible operator and leaves the manufacturer of record unchanged; for a first passport, the original producer is recorded; the acting recycler's company appears in neither column." | the waste step records the named successor | "The waste transition records the successor that the notification names, with the named role, as responsible operator and leaves the manufacturer of record unchanged; the acting company appears in neither column unless the notification names the acting company as successor." |
| VM-SWE-DATASET-072 (Database trigger refuses a change of a passport's manufacturer), pass criteria | "Fails when: the UPDATE under api_app succeeds or the migration UPDATE fails." | the trigger refuses the change for every database role (decision D16, The permanent manufacturer) | "Fails when: an UPDATE of manufacturer_bpnl succeeds under the application role or under the owner role." |
| VM-SWE-BGWORK-006 (Time-bound propagation jobs with a fixed clock), one clause of the pass criteria | "the end of the recycled passport is sent within the agreed time" | the notice leaves 5 seconds after the record (D1) | "the end of the recycled passport is sent 5 seconds after the recycling is recorded and not earlier" |
| SwR-DATASET-190 (Passport rows written only under the responsible operator's context) and VM-SWE-DATASET-054 (Passport writes only under the responsible operator's context) | the statement admits a write under the context of "a company holding that operator's recorded written authorisation", and the measure expects a refusal with the status 403 for every other company | only the data provider writes (D6); a request on a passport that the deployment does not hold answers 404, and a row that the policy refuses answers 403 | the statement names the data provider of the passport as the one writing context, and the measure expects 404 for a passport that the deployment does not hold and 403 for a refused row |
| SwR-RDB-007 (Dataset writes only by the responsible or an authorised operator), SwR-DATASET-119 (Changes applied only for the responsible or an authorised operator) and SwR-ACCESS-088 (Passport dataset writes only by the responsible or authorised operator) | each statement admits a write by "an operator" that holds a written authorisation with its period of validity | the authorisation with its period governs the writes of the data provider after the waste status, and the authorised company reports its event (decision D18, The successor's authorisation with its period) | each statement names the data provider that acts under the recorded authorisation of the successor |
| SwR-DATASET-200 (Passport rows written only in the data provider's deployment) | "refusing any other write with status 403" | as the entry of the row-level security context above | "refusing a write on a passport that the deployment does not hold with status 404" |
| SwR-DATASET-126 (Lifecycle data delivered beside the seven aspects in the decided carrier) | the statement names seven items of lifecycle data | the reference server delivers four of the items (decision D46, The partial delivery of the lifecycle data) | the owner decides after decision Q-202 (the carrier for lifecycle data the aspect models lack) names a carrier for the open items |
| PrR-CXD-026 (Three proposed models in the sldt-semantic-models layout), the end of the statement | "a RELEASE_NOTES.md per namespace, and the generated files in gen/." | the folders of `models/` hold exactly the files of a stored Tractus-X namespace, and the generated schemas and the example payloads are files of `docs/api/aspects/` (decision D64, The generated schemas outside `models/`, and one compiler of the draft-04 schemas) | "a RELEASE_NOTES.md per namespace, and the generated JSON schema and one example payload of each model in docs/api/aspects/." |
| VM-PRC-CXD-022 (Inspection of the layout of the three proposed models), one clause of the pass criteria | "RELEASE_NOTES.md in its namespace folder and a gen/ folder with the generated JSON schema; a missing file fails." | as the entry above; no folder of `models/` holds a folder `gen` | "RELEASE_NOTES.md in its namespace folder, no folder gen/ below models/, and the generated JSON schema of each model in docs/api/aspects/; a missing file fails." |
| VM-PRC-CXD-023 (Validation of the proposed models with SAMM CLI 2.11.1), the field `how` | the command excludes the paths that match `*/gen/*` | no such path exists below `models/`, so the exclusion changes no result | the command without the exclusion; the owner decides whether the field changes |

**The carried names.** The registry was carried over from another design (`requirements/method.md`, section 12), and several measures still name objects of that design. The implementer reads each carried name as the table states and does not stop for one of them.

| Carried name in a measure | Reading in this repository |
|---|---|
| the database role `api_app` | the role `refserver_app` of §9.2.8 |
| a test suite or a command of the field `how` or `technique` of a measure | the test file of §17.2 that executes the measure |
| "the migration UPDATE" and "the migrator role" | no such statement exists: the reference server migrates no earlier data (D16) |

The second table lists the 32 measures of §17.2 that name the role `api_app`, each with the field and the words that differ and the proposed words. The registry is not edited.

| Measure | Title of the measure | Field | Words of the registry | Proposed words |
|---|---|---|---|---|
| VM-SWE-ACCESS-022 | Access decisions on the passport dataset and its records | `technique` | "Integration test through the real chain under api_app with subjects of the responsible economic operator, an authorised operator inside and outside its dates, the recycler, the remanufacturer and the two parties of a sale of a battery, another operator, an authority and an unauthenticated caller" | "Integration test through the real chain under refserver_app with subjects of the responsible economic operator, an authorised operator inside and outside its dates, the recycler, the remanufacturer and the two parties of a sale of a battery, another operator, an authority and an unauthenticated caller" |
| VM-SWE-AUDIT-011 | Passport dataset, authorisation and disposal records | `technique` | "Integration test under api_app: writes to a passport dataset by its responsible operator, by an authorised operator and by an unauthorised one" | "Integration test under refserver_app: writes to a passport dataset by its responsible operator, by an authorised operator and by an unauthorised one" |
| VM-SWE-AUDIT-011 | Passport dataset, authorisation and disposal records | `entry` | "the local database script up) with the schema applied and the api_app role created" | "the local database script up) with the schema applied and the refserver_app role created" |
| VM-SWE-BACKEND-040 | Catena-X receiving routes against their specifications | `technique` | "Integration test under api_app through the data-plane mount: the notification endpoints with accepted, refused and unprocessable notifications and with each HTTP method" | "Integration test under refserver_app through the data-plane mount: the notification endpoints with accepted, refused and unprocessable notifications and with each HTTP method" |
| VM-SWE-BACKEND-040 | Catena-X receiving routes against their specifications | `entry` | "the local database script up) with the schema applied and the api_app role created" | "the local database script up) with the schema applied and the refserver_app role created" |
| VM-SWE-DATASET-014 | Unique identifiers distinct, persistent and new per new passport | `technique` | "Integration test under api_app: two batteries of one model, an attempt to reuse an identifier, an attempt to change an identifier, and a treated battery placed on the market again" | "Integration test under refserver_app: two batteries of one model, an attempt to reuse an identifier, an attempt to change an identifier, and a treated battery placed on the market again" |
| VM-SWE-DATASET-014 | Unique identifiers distinct, persistent and new per new passport | `environment` | "local substrate, runtime role api_app" | "local substrate, runtime role refserver_app" |
| VM-SWE-DATASET-016 | Write and read decisions on dataset information through the real chain | `technique` | "authenticate, applyRlsContext, requireCapability, validateEntity) and no mocked guard, with subjects from the test helpers of the reference server, under api_app" | "authenticate, applyRlsContext, requireCapability, validateEntity) and no mocked guard, with subjects from the test helpers of the reference server, under refserver_app" |
| VM-SWE-DATASET-016 | Write and read decisions on dataset information through the real chain | `environment` | "local substrate, runtime role api_app" | "local substrate, runtime role refserver_app" |
| VM-SWE-DATASET-021 | Lifecycle operations persisted on the dataset through the real chain | `technique` | "supertest), the real middleware chain and no mocked guard, under api_app: one case per operation of Art" | "supertest), the real middleware chain and no mocked guard, under refserver_app: one case per operation of Art" |
| VM-SWE-DATASET-021 | Lifecycle operations persisted on the dataset through the real chain | `environment` | "local substrate, runtime role api_app" | "local substrate, runtime role refserver_app" |
| VM-SWE-DATASET-032 | Dataset submodels and marking served at the data-plane interface | `environment` | "local substrate, runtime role api_app" | "local substrate, runtime role refserver_app" |
| VM-SWE-DATASET-033 | Hand-off to the designated provider through the operator's interface | `environment` | "local substrate, runtime role api_app" | "local substrate, runtime role refserver_app" |
| VM-SWE-DATASET-072 | Database trigger refuses a change of a passport's manufacturer | `technique` | "An integration test against the local substrate: under the role api_app, an UPDATE of manufacturer_id on a seeded passport row raises the trigger's exception" | "An integration test against the local substrate: under the role refserver_app, an UPDATE of manufacturer_id on a seeded passport row raises the trigger's exception" |
| VM-SWE-DATASET-072 | Database trigger refuses a change of a passport's manufacturer | `passCriteria` | "Fails when: the UPDATE under api_app succeeds or the migration UPDATE fails" | "Fails when: the UPDATE under refserver_app succeeds or the migration UPDATE fails" |
| VM-SWE-RDB-005 | Dataset writes by responsible and authorised operators only | `technique` | "Integration test under api_app: seed a passport with a responsible operator and a recorded written authorisation for a second company" | "Integration test under refserver_app: seed a passport with a responsible operator and a recorded written authorisation for a second company" |
| VM-SWE-RDB-005 | Dataset writes by responsible and authorised operators only | `entry` | "The local substrate is up at the commit under review: a PostgreSQL 17 container with the owner role and api_app (NOBYPASSRLS" | "The local substrate is up at the commit under review: a PostgreSQL 17 container with the owner role and refserver_app (NOBYPASSRLS" |
| VM-SWE-RDB-035 | Responsible operator timeline, waste successor and manufacturer | `technique` | "Integration test under api_app: create a passport with a responsible operator" | "Integration test under refserver_app: create a passport with a responsible operator" |
| VM-SWE-RDB-035 | Responsible operator timeline, waste successor and manufacturer | `entry` | "The local substrate is up at the commit under review: a PostgreSQL 17 container with the owner role and api_app (NOBYPASSRLS" | "The local substrate is up at the commit under review: a PostgreSQL 17 container with the owner role and refserver_app (NOBYPASSRLS" |
| VM-SWE-SUBMODELS-016 | Instance submodel route answers through the real middleware chain | `technique` | "authenticateAny, applyRlsContext, requireCapability, row-level security under api_app" | "authenticateAny, applyRlsContext, requireCapability, row-level security under refserver_app" |
| VM-SWE-SUBMODELS-019 | Passport aspects served on the passport-bearing pack through the chain | `technique` | "Integration test through the production chain under api_app with a seeded passport-bearing pack of each battery category, its battery model's part type, an original and a new passport, and a non-passport-bearing part" | "Integration test through the production chain under refserver_app with a seeded passport-bearing pack of each battery category, its battery model's part type, an original and a new passport, and a non-passport-bearing part" |
| VM-SWE-TWINS-034 | Status, descriptions and admission of lifecycle operations | `technique` | "Integration test of the PartInstance lifecycle record through the real chain under api_app: each operation from each status, with and without the required descriptions, equivalence classes from the statements" | "Integration test of the PartInstance lifecycle record through the real chain under refserver_app: each operation from each status, with and without the required descriptions, equivalence classes from the statements" |
| VM-SYS-CXD-080 | New digital twin for a battery that receives a new passport | `technique` | "HTTP requests against the application of the reference server, the real capability chain, no mocked guard) against a seeded local substrate under the runtime role api_app" | "HTTP requests against the application of the reference server, the real capability chain, no mocked guard) against a seeded local substrate under the runtime role refserver_app" |
| VM-SYS-LIFE-005 | Change to waste on the existing passport with transfer of responsibility | `technique` | "HTTP requests against the application of the reference server, the real capability chain, no mocked guard), with company-operator subjects from the test helpers of the reference server, against a seeded local substrate under the runtime role api_app" | "HTTP requests against the application of the reference server, the real capability chain, no mocked guard), with company-operator subjects from the test helpers of the reference server, against a seeded local substrate under the runtime role refserver_app" |
| VM-SYS-LIFE-006 | Operations admitted by the battery's status | `technique` | "HTTP requests against the application of the reference server, the real capability chain, no mocked guard), with company-operator subjects from the test helpers of the reference server, against a seeded local substrate under the runtime role api_app" | "HTTP requests against the application of the reference server, the real capability chain, no mocked guard), with company-operator subjects from the test helpers of the reference server, against a seeded local substrate under the runtime role refserver_app" |
| VM-SYS-LIFE-008 | Purpose rules of repurposing, remanufacturing and preparation for re-use | `technique` | "HTTP requests against the application of the reference server, the real capability chain, no mocked guard), with company-operator subjects from the test helpers of the reference server, against a seeded local substrate under the runtime role api_app" | "HTTP requests against the application of the reference server, the real capability chain, no mocked guard), with company-operator subjects from the test helpers of the reference server, against a seeded local substrate under the runtime role refserver_app" |
| VM-SYS-LIFE-009 | Recycling ends the battery's passport dataset | `technique` | "HTTP requests against the application of the reference server, the real capability chain, no mocked guard), with company-operator subjects from the test helpers of the reference server, against a seeded local substrate under the runtime role api_app" | "HTTP requests against the application of the reference server, the real capability chain, no mocked guard), with company-operator subjects from the test helpers of the reference server, against a seeded local substrate under the runtime role refserver_app" |
| VM-SYS-LIFE-012 | New passport dataset, identifier, link and superseded mark per operation | `technique` | "HTTP requests against the application of the reference server, the real capability chain, no mocked guard), with company-operator subjects from the test helpers of the reference server, against a seeded local substrate under the runtime role api_app" | "HTTP requests against the application of the reference server, the real capability chain, no mocked guard), with company-operator subjects from the test helpers of the reference server, against a seeded local substrate under the runtime role refserver_app" |
| VM-SYS-LIFE-013 | Number of links of each new passport dataset | `technique` | "HTTP requests against the application of the reference server, the real capability chain, no mocked guard), with company-operator subjects from the test helpers of the reference server, against a seeded local substrate under the runtime role api_app" | "HTTP requests against the application of the reference server, the real capability chain, no mocked guard), with company-operator subjects from the test helpers of the reference server, against a seeded local substrate under the runtime role refserver_app" |
| VM-SYS-LIFE-016 | Data carried over and not carried over to the new passport | `technique` | "HTTP requests against the application of the reference server, the real capability chain, no mocked guard), with company-operator subjects from the test helpers of the reference server, against a seeded local substrate under the runtime role api_app" | "HTTP requests against the application of the reference server, the real capability chain, no mocked guard), with company-operator subjects from the test helpers of the reference server, against a seeded local substrate under the runtime role refserver_app" |
| VM-SYS-LIFE-021 | Responsible economic operator and manufacturer through the lifecycle | `technique` | "HTTP requests against the application of the reference server, the real capability chain, no mocked guard), with company-operator subjects from the test helpers of the reference server, against a seeded local substrate under the runtime role api_app" | "HTTP requests against the application of the reference server, the real capability chain, no mocked guard), with company-operator subjects from the test helpers of the reference server, against a seeded local substrate under the runtime role refserver_app" |
| VM-SYS-LIFE-048 | Producer of the current passport takes over a waste battery's passport | `technique` | "HTTP requests against the application of the reference server, the real capability chain, no mocked guard), with company-operator subjects from the test helpers of the reference server, against a seeded local substrate under the runtime role api_app" | "HTTP requests against the application of the reference server, the real capability chain, no mocked guard), with company-operator subjects from the test helpers of the reference server, against a seeded local substrate under the runtime role refserver_app" |
| VM-SYS-LIFE-049 | No forward link written into an original passport | `technique` | "HTTP requests against the application of the reference server, the real capability chain, no mocked guard), with company-operator subjects from the test helpers of the reference server, against a seeded local substrate under the runtime role api_app" | "HTTP requests against the application of the reference server, the real capability chain, no mocked guard), with company-operator subjects from the test helpers of the reference server, against a seeded local substrate under the runtime role refserver_app" |
| VM-SYS-LIFE-050 | New passport delivered as a passport of its own, not a version | `technique` | "HTTP requests against the application of the reference server, the real capability chain, no mocked guard), with company-operator subjects from the test helpers of the reference server, against a seeded local substrate under the runtime role api_app" | "HTTP requests against the application of the reference server, the real capability chain, no mocked guard), with company-operator subjects from the test helpers of the reference server, against a seeded local substrate under the runtime role refserver_app" |
| VM-SYS-LIFE-051 | Remanufacturing donor's passport later accepts the status waste | `technique` | "HTTP requests against the application of the reference server, the real capability chain, no mocked guard), with company-operator subjects from the test helpers of the reference server, against a seeded local substrate under the runtime role api_app" | "HTTP requests against the application of the reference server, the real capability chain, no mocked guard), with company-operator subjects from the test helpers of the reference server, against a seeded local substrate under the runtime role refserver_app" |
| VM-SYS-LIFE-052 | Direct re-use without preparation keeps the passport and its identifier | `technique` | "HTTP requests against the application of the reference server, the real capability chain, no mocked guard), with company-operator subjects from the test helpers of the reference server, against a seeded local substrate under the runtime role api_app" | "HTTP requests against the application of the reference server, the real capability chain, no mocked guard), with company-operator subjects from the test helpers of the reference server, against a seeded local substrate under the runtime role refserver_app" |
| VM-SYS-LIFE-053 | Direct re-use leaves the responsible economic operator unchanged | `technique` | "HTTP requests against the application of the reference server, the real capability chain, no mocked guard), with company-operator subjects from the test helpers of the reference server, against a seeded local substrate under the runtime role api_app" | "HTTP requests against the application of the reference server, the real capability chain, no mocked guard), with company-operator subjects from the test helpers of the reference server, against a seeded local substrate under the runtime role refserver_app" |
| VM-SYS-LIFE-074 | Manufacturer identification of a passport never changed after issue | `technique` | "An integration test on the local substrate under the role api_app: the test issues a passport, then tries to change its manufacturer identification through the lifecycle routes (recycle, waste, repair, lineage steps" | "An integration test on the local substrate under the role refserver_app: the test issues a passport, then tries to change its manufacturer identification through the lifecycle routes (recycle, waste, repair, lineage steps" |
| VM-SYS-PASS-038 | Passport data held only for the responsible or an authorised operator | `technique` | "HTTP requests against the application of the reference server, the real capability chain, no mocked guard), with company-operator subjects from the test helpers of the reference server, against a seeded local substrate under the runtime role api_app" | "HTTP requests against the application of the reference server, the real capability chain, no mocked guard), with company-operator subjects from the test helpers of the reference server, against a seeded local substrate under the runtime role refserver_app" |
| VM-SYS-PASS-039 | New holder after direct re-use recorded as the battery's purchaser | `technique` | "HTTP requests against the application of the reference server, the real capability chain, no mocked guard), with company-operator subjects from the test helpers of the reference server, against a seeded local substrate under the runtime role api_app" | "HTTP requests against the application of the reference server, the real capability chain, no mocked guard), with company-operator subjects from the test helpers of the reference server, against a seeded local substrate under the runtime role refserver_app" |

**The proposal.** Draft 0.7 of the proposal types an identifier in Table 4.4 as "string, UUID version 4". The owner decided on 2026-11-16 that the public schemas accept every form that the shared model admits (decision D50, Every admitted form of an identifier accepted, one form sent). The matching sentence proposed for Table 4.4 of the next draft reads: "A property of the type UUID holds a value of the characteristic UuidV4Trait of the shared model io.catenax.shared.uuid; a receiver MUST accept every form that the characteristic admits and MUST treat two values that differ only in the prefix urn:uuid: or in the case of their letters as one identifier; a sender SHOULD send the lower-case form with the prefix urn:uuid:."

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
| `sources/Tractus-X/kits-26.09/industry-core-kit/software-development-view/digital-twins.mdx` | the form of a submodel descriptor and of its endpoint, and the semantic identifier of SerialPart (§9.2.6) |
| `sources/Tractus-X/kits-26.09/traceability-kit/openapi/notifications_2-0-0.yaml` | a stored OpenAPI file of a notification API with the header schema of version 2.0.0 of the MessageHeader model, as the pattern of `docs/api/openAPI.yaml` |
| `sources/Tractus-X/semantic-models/io.catenax.shared.uuid/2.1.0/Uuid.ttl`, `sources/Tractus-X/semantic-models/io.catenax.shared.business_partner_number/2.0.0/BusinessPartnerNumber.ttl` | the two shared models that the proposed models import, and the patterns of §9.2.1 |
| `requirements/Owner_instructions-Francesco_verbatim/2026-11-16_public_repository_for_the_after_first_passport_work.md` | the owner's decisions and orders of 2026-11-16 (§12.1) |
| `sources/IDTA/io.admin-shell.idta.batterypass.digital_nameplate/1.0.0/gen/NameplateBattery-schema.json`, `sources/IDTA/io.admin-shell.idta.batterypass.technical_data/1.0.0/gen/TechnicalDataBattery-schema.json`, `sources/IDTA/io.admin-shell.idta.batterypass.product_condition/1.0.0/gen/ProductConditionBattery-schema.json`, `sources/IDTA/io.admin-shell.idta.dpp.dpp_metadata/1.0.0/gen/DppMetadata-schema.json` | the JSON schemas of the four stored models, which `server/src/submodels/submodelService.mjs` compiles (decision D28, Supplied payloads) |
| `sources/Tractus-X/semantic-models/io.catenax.shared.recycling_strategy_certificate/3.0.0/metadata.json`, `sources/Tractus-X/semantic-models/io.catenax.shared.recycling_strategy_certificate/3.0.0/RecyclingStrategyCertificate.ttl` | a stored Tractus-X aspect model folder, as the pattern of the layout of `models/` and of the prefixes of a model file |
| `scripts/check-license-headers.mjs`, `scripts/check-private-references.mjs`, `scripts/check-sources.mjs`, `scripts/requirements-check.mjs`, `scripts/check-annexes.mjs`, `scripts/spec-gate-check.mjs` | the checks that every phase runs. The author of version 5 added `scripts/check-annexes.mjs` and added the exception for the two lock files to `scripts/check-private-references.mjs` (§11.1) |

## 7. Files to write or modify

The action `new` marks a file that does not exist at the substrate. The action `modify` marks an existing file. Every code file (`.mjs`, `.sql`, `.sh`, `.py`) starts with the Apache-2.0 header that `scripts/check-sources.mjs` carries `[live]`, in the comment form of its language. Every YAML and Turtle file starts with the CC-BY-4.0 header in `#` comments, except the workflow files, `.github/dependabot.yml`, `.spectral.yaml` and `tck/docker-compose.yml`, which start with the Apache-2.0 header in `#` comments. The CC-BY-4.0 header is the first 14 lines of `docs/api/openAPI.yaml` in §20, and the Apache-2.0 header in `#` comments is the first 20 lines of `.spectral.yaml` in §20; both headers carry the two copyright lines of this repository. `server/Dockerfile` and `tck/.env.example` start with the Apache-2.0 header in `#` comments, although `scripts/check-license-headers.mjs` checks neither file `[live]`. Every Markdown file ends with the NOTICE section, with its own source address. A JSON file carries no header.

| Path | Action | Phase | Note |
|---|---|---|---|
| `docs/api/openAPI.yaml` | new | P1 | OpenAPI 3.1.0; four POST operations; §10.1, §20 |
| `.gitattributes` | new | P1 | the line endings (decision D57, Line endings); §20 |
| `docs/api/schemas/MessageHeader.schema.json`, `docs/api/schemas/LifecycleNotification.schema.json`, `docs/api/schemas/NewPassportIssued.schema.json`, `docs/api/schemas/BatteryRepaired.schema.json`, `docs/api/schemas/BatteryBecameWaste.schema.json`, `docs/api/schemas/PassportEnded.schema.json`, `docs/api/schemas/NotificationAccepted.schema.json`, `docs/api/schemas/ErrorResponse.schema.json` | new | P1 | the one definition of the header, of the envelope, of the four contents, of the 200 body and of the error body; §20 |
| `.spectral.yaml` | new | P1 | the ruleset of the OpenAPI rules of Spectral; §20 |
| `server/package.json`, `server/package-lock.json` | new | P1 | `"type": "module"`, `"engines": { "node": ">=24" }`, the scripts of §14.1 and the packages of §9.8. The file holds the fields `description` and `license` (`Apache-2.0`) and no field `version`; the version ranges are `^5.0.0` for `express`, `^8.0.0` for `pg` and for `ajv`, `^3.0.0` for `ajv-formats`, `^1.0.0` for `ajv-draft-04` and `^2.0.0` for `yaml` (§14.1) |
| `server/test/contractSchemas.test.mjs` | new | P1 | §14.2 |
| `.github/workflows/checks.yml`, `.github/workflows/spectral.yml` | new | P1 | §9.7 |
| `models/io.catenax.battery.passport_lifecycle/1.0.0/BatteryPassportLifecycle.ttl`, `models/io.catenax.battery.passport_lifecycle/1.0.0/metadata.json`, `models/io.catenax.battery.passport_lifecycle/RELEASE_NOTES.md` | new | P2 | §10.6, §21 |
| `models/io.catenax.battery.passport_successors/1.0.0/BatteryPassportSuccessors.ttl`, `models/io.catenax.battery.passport_successors/1.0.0/metadata.json`, `models/io.catenax.battery.passport_successors/RELEASE_NOTES.md` | new | P2 | §10.6, §21 |
| `models/io.catenax.battery.passport_access_map/1.0.0/BatteryPassportAccessMap.ttl`, `models/io.catenax.battery.passport_access_map/1.0.0/metadata.json`, `models/io.catenax.battery.passport_access_map/RELEASE_NOTES.md` | new | P2 | §10.6, §21 |
| `scripts/validate-models.sh` | new | P2 | assembles the models root and runs the SAMM command line tool (§11.2); §21 |
| `server/test/modelExamples.test.mjs` | new | P2 | §14.2 |
| `docs/api/aspects/BatteryPassportLifecycle-schema.json`, `docs/api/aspects/BatteryPassportSuccessors-schema.json`, `docs/api/aspects/BatteryPassportAccessMap-schema.json` | new | P2 | the JSON schemas that the SAMM command line tool generates from the three models (decision D64, The generated schemas outside `models/`, and one compiler of the draft-04 schemas); §10.6 |
| `docs/api/aspects/BatteryPassportLifecycle.json`, `docs/api/aspects/BatteryPassportSuccessors.json`, `docs/api/aspects/BatteryPassportAccessMap.json` | new | P2 | one example payload per model (D64); §21 |
| `server/src/validation/aspectSchemaCompiler.mjs` | new | P2 | the one compiler of the draft-04 aspect schemas (D64); §10.6, §21 |
| `.github/workflows/samm.yml` | new | P2 | §9.7 |
| `models/README.md`, `docs/proposals.md` | modify | P2 | the three models and the validation command; the import of version 2.1.0 of the shared uuid model |
| `server/src/db/migrate.mjs`, `server/src/db/migrateCli.mjs`, `server/src/db/createAppRole.mjs`, `server/src/db/createAppRoleCli.mjs`, `server/src/db/pool.mjs`, `server/src/db/transaction.mjs`, `server/src/db/health.mjs` | new | P3 | §9.2.8 |
| `server/src/db/migrations/001_schema.sql`, `server/src/db/migrations/002_triggers.sql`, `server/src/db/migrations/003_policies.sql` | new | P3 | §9.4 |
| `server/src/db/migrations/004_audit_outbox.sql` | new | P5 | the queue of the audit records (decision D69, The audit record after a failed write is queued); §9.4.4, §23 |
| `server/test/databaseRules.integration.test.mjs`, `server/test/support/database.mjs` | new | P3 | §14.2 |
| `scripts/check-dependency-licenses.mjs`, `server/test/dependencyLicenses.test.mjs` | new | P3 | §9.8 |
| `.github/workflows/tests.yml` | new | P3 | §9.7; phase P6 adds the steps of the test kit |
| `server/src/config.mjs`, `server/src/logger.mjs`, `server/src/identifiers.mjs` | new | P4 | the configuration reader with the class `ConfigError`, the logger with the constants `LOG_LEVELS`, `REDACTED_FIELDS` and `REDACTION_TEXT`, and the identifier conversions with the class `IdentifierFormatError` (§9.2.1, §9.6) |
| `server/src/access/authenticate.mjs`, `server/src/access/operatorToken.mjs`, `server/src/access/signTokenCli.mjs`, `server/src/access/capabilities.mjs`, `server/src/access/policy.mjs`, `server/src/access/requireCapability.mjs`, `server/src/access/accessRecordService.mjs`, `server/src/access/accessRecordRepository.mjs` | new | P4 | §9.2.3 |
| `server/src/audit/auditLog.mjs`, `server/src/audit/auditRepository.mjs` | new | P4 | §9.2.7; the repository also holds the SQL on `audit_outbox` from phase P5 (D69) |
| `server/src/dataset/lifecycleCatalogue.mjs`, `server/src/dataset/lifecycleService.mjs`, `server/src/dataset/passportRepository.mjs`, `server/src/dataset/companyRepository.mjs`, `server/src/dataset/lifecycleRecordReader.mjs`, `server/src/dataset/governedElements.mjs`, `server/src/dataset/refusals.mjs` | new | P4 | §9.2.2, §9.5 |
| `server/src/submodels/submodelService.mjs`, `server/src/submodels/accessMapService.mjs`, `server/src/submodels/accessMapRepository.mjs`, `server/src/submodels/jsonPathSubset.mjs` | new | P4 | §9.2.4 |
| `server/src/validation/schemaValidator.mjs`, `server/schemas/createPassport.schema.json`, `server/schemas/issueNewPassport.schema.json`, `server/schemas/reportRepair.schema.json`, `server/schemas/reportWaste.schema.json`, `server/schemas/reportRecycling.schema.json`, `server/schemas/forwardLink.schema.json`, `server/schemas/accessRecord.schema.json`, `server/schemas/purchaserChange.schema.json`, `server/schemas/successorAuthorisation.schema.json`, `server/schemas/batteryModel.schema.json`, `server/schemas/issuerContract.schema.json` | new | P4 | §10.2 |
| `server/test/fixtures/nameplate.json`, `server/test/fixtures/technicalData.json`, `server/test/fixtures/productCondition.json`, `server/test/fixtures/dppMetadata.json`, `server/test/fixtures/accessMap.json` | new | P4 | payloads that validate against the stored schemas of §6; every value is invented test data |
| `server/src/connector/messageHeader.mjs`, `server/src/connector/notificationPlan.mjs`, `server/src/connector/notificationRepository.mjs`, `server/src/connector/policyBuilder.mjs`, `server/src/connector/offerPublisher.mjs`, `server/src/connector/exposure.mjs`, `server/src/connector/memoryOfferStore.mjs`, `server/src/connector/memoryReceiverResolver.mjs`, `server/src/connector/issuerContractService.mjs`, `server/src/connector/issuerContractRepository.mjs` | new | P4 | §9.2.5 |
| `server/src/twins/shellDescriptor.mjs`, `server/src/twins/memoryTwinRegistry.mjs` | new | P4 | §9.2.6 |
| `server/test/config.test.mjs`, `server/test/logger.test.mjs`, `server/test/identifiers.test.mjs`, `server/test/operatorToken.test.mjs`, `server/test/policy.test.mjs`, `server/test/lifecycleCatalogue.test.mjs`, `server/test/refusals.test.mjs`, `server/test/jsonPathSubset.test.mjs`, `server/test/governedElements.test.mjs`, `server/test/messageHeader.test.mjs`, `server/test/notificationPlan.test.mjs`, `server/test/policyBuilder.test.mjs`, `server/test/shellDescriptor.test.mjs`, `server/test/twinRegistryContract.test.mjs`, `server/test/lifecycleService.integration.test.mjs`, `server/test/audit.integration.test.mjs`, `server/test/offerPublisher.integration.test.mjs` | new | P4 | §14.2: the unit tests and the tests of the services |
| `server/src/index.mjs`, `server/src/app.mjs` | new | P5 | the composition root and the application factory (§9.2.1) |
| `server/src/routes/runWrite.mjs`, `server/src/routes/lifecycleNotificationRoutes.mjs`, `server/src/routes/lifecycleEventRoutes.mjs`, `server/src/routes/notificationRecordRoutes.mjs`, `server/src/routes/passportRoutes.mjs`, `server/src/routes/batteryModelRoutes.mjs`, `server/src/routes/submodelRoutes.mjs`, `server/src/routes/issuerContractRoutes.mjs`, `server/src/routes/healthRoutes.mjs`, `server/src/routes/errorHandler.mjs` | new | P5 | §9.3 |
| `server/src/connector/notificationSender.mjs`, `server/src/connector/batteryInformationPuller.mjs`, `server/src/connector/memoryTransport.mjs`, `server/src/background/outboxWorker.mjs` | new | P5 | §9.2.5 |
| `server/test/lifecycleNotificationRoutes.integration.test.mjs`, `server/test/lifecycleEventRoutes.integration.test.mjs`, `server/test/passportRoutes.integration.test.mjs`, `server/test/submodelRoutes.integration.test.mjs`, `server/test/accessMap.integration.test.mjs`, `server/test/accessRecords.integration.test.mjs`, `server/test/openApiContract.test.mjs`, `server/test/notificationSender.integration.test.mjs`, `server/test/outboxWorker.integration.test.mjs`, `server/test/issuerContracts.integration.test.mjs`, `server/test/transportContract.test.mjs`, `server/test/receiverResolverContract.test.mjs` | new | P5 | §14.2: the tests of the routes, of the sender, of the puller and of the worker |
| `tck/package.json`, `tck/package-lock.json`, `tck/lib/binding.mjs`, `tck/lib/inProcessBinding.mjs`, `tck/lib/scenario.mjs` | new | P6 | §9.2.9 |
| `tck/CAC-001.tck.mjs`, `tck/CAC-002.tck.mjs`, `tck/CAC-003.tck.mjs`, `tck/CAC-004.tck.mjs`, `tck/CAC-005.tck.mjs`, `tck/CAC-006.tck.mjs`, `tck/CAC-007.tck.mjs`, `tck/CAC-008.tck.mjs`, `tck/CAC-009.tck.mjs`, `tck/CAC-010.tck.mjs`, `tck/CAC-011.tck.mjs`, `tck/CAC-012.tck.mjs`, `tck/CAC-013.tck.mjs`, `tck/CAC-014.tck.mjs`, `tck/CAC-015.tck.mjs`, `tck/CAC-016.tck.mjs` | new | P6 | §14.3 |
| `tck/README.md` | modify | P6, P7 | the two bindings, their commands and the record of the verification of phase P7 |
| `server/src/connector/edcTransport.mjs`, `server/src/connector/edcOfferStore.mjs`, `server/src/connector/connectorDiscoveryResolver.mjs`, `server/src/twins/dtrTwinRegistry.mjs` | new | P7 | §9.2.5, §9.2.6, D75 (The receiver resolution through the own connector) |
| `tck/lib/connectorBinding.mjs`, `tck/docker-compose.yml`, `tck/.env.example`, `server/Dockerfile` | new | P7 | §10.7, §9.2.9 |
| `server/src/connector/addressListResolver.mjs` | new | P7 | the receiver resolver of the address list (decision D81, A fixed address list in the local deployment only); §9.2.5 |
| `tck/connectorHeader.test.mjs` | new | P7 | the test of the header of the consumer's Business Partner Number across connectors (§9.2.9) |
| `NOTICE.md` | modify | P7 | the test-only image `hashicorp/vault:1.16.1` under the Business Source License 1.1 (decision D82, HashiCorp Vault as a test-only image) |
| `docs/architecture/README.md` | new | P8 | the twelve arc42 sections of §11.8 |
| `docs/admin/README.md` | new | P8 | the administrator guide of §11.8 |
| `docs/adoption-view.md`, `docs/development-view.md`, `docs/operations-view.md` | new | P8 | the three views of §11.8 |
| `.github/workflows/codeql.yml`, `.github/workflows/trufflehog.yml`, `.github/dependabot.yml` | new | P8 | §9.7 |
| `docs/methodology.md`, `docs/proposals.md` | modify | P8 | the chain of each operation with its test file; the list of the proposed items |
| `README.md`, `INSTALL.md`, `CHANGELOG.md`, `docs/README.md`, `server/README.md` | modify | each phase | the state of each folder; the installation and test commands |
| `requirements/SWE.1-Software_Requirements_Analysis/software_requirements.json` | modify | P8 | only the field `implementation` of the requirements of §5.2: the state and the files |

The file `.gitignore` covers `tools/`, `node_modules/` and `.env` `[live]`. The implementer writes the downloaded SAMM command line tool and the assembled models root below `tools/`, which git ignores. `server/Dockerfile` (phase P7) is built with the repository root as its build context, starts from the image `node:24`, copies the folders `server/`, `docs/api/schemas/`, `docs/api/aspects/`, `models/` and `sources/IDTA/`, because the server reads `docs/api/aspects/BatteryPassportAccessMap-schema.json` at run time (finding 7 of the verification of phase P7), runs `npm ci --omit=dev` in `server/`, and starts `node src/index.mjs`.

## 8. Deletions and moves

This specification deletes no file and moves no file. The folders `server/`, `tck/` and `models/` hold one `README.md` each at the substrate `[live]`, and §7 modifies the three files.

## 9. Target architecture

### 9.1 Sources of truth

| Concept | The one source | Readers |
|---|---|---|
| The message of each operation, the 200 body and the error body | the eight schema files of `docs/api/schemas/` (decision D21, One definition of the message) | `docs/api/openAPI.yaml` by `$ref`; `server/src/validation/schemaValidator.mjs`; the test kit |
| The four operations, their contexts and their receiving steps | `OPERATIONS` of `server/src/dataset/lifecycleCatalogue.mjs` | the routes, the executor, the plan builder |
| The four lineage operations with their admission rule and the status of the new passport | `LINEAGE_OPERATIONS` of `server/src/dataset/lifecycleCatalogue.mjs` | the executor |
| The five status values | `LIFECYCLE_STATUS_VALUES` of `server/src/dataset/lifecycleCatalogue.mjs`, equal to the CHECK constraint of `passports.lifecycle_status`; the test `server/test/lifecycleCatalogue.test.mjs` compares both with `sources/IDTA/io.admin-shell.idta.batterypass.digital_nameplate/1.0.0/BatteryStatus_enum.ttl` | the executor, the schemas |
| The refusal ids, statuses and texts | `REFUSALS` of `server/src/dataset/refusals.mjs` (§9.5) | `server/src/routes/errorHandler.mjs` |
| The capabilities | `CAPABILITIES` of `server/src/access/capabilities.mjs` | `server/src/access/policy.mjs`, the routes |
| The elements of a payload that the passport record governs | `GOVERNED_ELEMENTS` of `server/src/dataset/governedElements.mjs` (§10.6) | `server/src/submodels/submodelService.mjs` |
| The aspect keys, their semantic identifiers, their short names and their twin level | `ASPECTS` of `server/src/submodels/submodelService.mjs` (§10.6) | the routes, the shell descriptor builder, the offer publisher |
| The admitted roles of an access record | `ADMITTED_ROLES` of `server/src/access/accessRecordService.mjs` (decision D29, The access regime and the admitted roles) | the access record service |
| The request bodies of the operator endpoints | the eleven schema files of `server/schemas/` | `server/src/validation/schemaValidator.mjs` |
| The patterns of the identifiers | `server/src/identifiers.mjs` (§9.2.1) | the services and the repositories |
| The database rules | the four migration files of `server/src/db/migrations/` | `server/src/db/migrate.mjs` |
| The configuration | `loadConfig` of `server/src/config.mjs` (§9.6) | `server/src/index.mjs` only |

### 9.2 Modules and their contracts

Each module belongs to one element of `requirements/SYS.3-System_Architectural_Design/architecture.json`. No module receives the Express request or response object except a route module, `server/src/access/authenticate.mjs`, `server/src/access/requireCapability.mjs` and `server/src/routes/errorHandler.mjs`.

#### 9.2.1 The composition root and the application (EL-BACKEND (the HTTP API))

- `loadConfig(env)` of `server/src/config.mjs` returns a frozen configuration object or throws an error that names every missing or malformed variable of §9.6. `loadConfig` is a pure function of its argument and reads no global value. The error is an instance of the class `ConfigError`, which the module exports and which extends `Error`. The error holds the property `variables`, the list of the names of every missing or malformed variable in the order of the table of §9.6, and the message `Invalid configuration: ` followed by one entry per variable, separated by `; `, each of the form `<VARIABLE> is missing` or `<VARIABLE> is malformed: <rule of §9.6>`. The error never holds the value of a variable, because a value can be a key or a password. §9.6 states the property of the returned object for each variable.
- `server/src/index.mjs` is the only module of the server that reads `process.env`. The module calls `loadConfig(process.env)`, creates the pool, reads the table `schema_migrations` and stops with an error that names the command `npm run migrate` when one of the four migration names `001_schema.sql`, `002_triggers.sql`, `003_policies.sql` and `004_audit_outbox.sql` is absent, reads the catalogue `pg_db_role_setting` and stops with an error that names the command `npm run create-role` when the catalogue holds a row of the role of the connection, for every database or for one database of the cluster, writes the own company record with `upsertOwnCompany` of `server/src/dataset/companyRepository.mjs`, selects the implementations by `config.binding` (`memory`: `createMemoryTransport`, `createMemoryOfferStore`, `createMemoryTwinRegistry`, `createMemoryReceiverResolver`; `connector`: `createEdcTransport`, `createEdcOfferStore`, `createDtrTwinRegistry`, and `createConnectorDiscoveryResolver` or `createAddressListResolver` by `config.receiverResolution`), calls `createApp`, publishes the notification asset (§10.5), starts the worker and opens the port. With `BINDING=memory` the module passes two empty maps to `createMemoryReceiverResolver` and the one participant of the own application to `createMemoryTransport`, so a server that an operator starts with the memory binding reaches no partner, and every notification of such a server ends with the outcome `receiver_unresolved`.
- `createApp({ config, pool, clock, transport, offerStore, twinRegistry, receiverResolver, logger })` of `server/src/app.mjs` returns `{ app, worker }`: the Express application with the routes of §9.3, and the outbox worker of §9.2.5. `createApp` creates no client and opens no port. The parameter `clock` is an object with the method `now()` that returns a `Date`. Every module that needs the current time or the current date receives `clock`. The current date of the server is always the UTC date of `clock.now()`, the first ten characters of `clock.now().toISOString()` (decision D53, One clock in UTC).
- `upsertOwnCompany(pool, config)` inserts or updates the one record of `companies` whose `bpnl` is `config.ownBpnl`, with `legal_name` from `config.ownLegalName`, `legal_name_language` from `config.ownLegalNameLanguage`, `address` from `config.ownAddress` and `operator_identifier` from `config.ownOperatorIdentifier`. The test kit and the server tests pass the same four values in the configuration object of each application.
- `createLogger({ level, stream, clock, redactedFieldNames })` of `server/src/logger.mjs` returns an object with the four methods `error(message, fields)`, `warn(message, fields)`, `info(message, fields)` and `debug(message, fields)`. Each method writes one JSON object per line to `stream` with the fields `time`, `level`, `message`, `traceId`, `route`, `actingBpnl` and the fields of the call. The logger never writes a token, a key or a payload. The mechanism of that rule is a fixed list of field names, accepted by the owner on 2026-11-17 (`requirements/Owner_instructions-Francesco_verbatim/2026-11-16_public_repository_for_the_after_first_passport_work.md`, section "The tests of the configuration, the logger and the identifier conversions, and phase P4"), and the further rules of the logger are these:
  - **The parameters.** `stream` is an object with the method `write(text)`; `server/src/index.mjs` passes `process.stdout`, and a test passes its own object, so no module of the logger names a global value. `clock` is the clock of §9.2.1; `server/src/index.mjs` passes the clock of the server. `level` is one of the four values of the exported constant `LOG_LEVELS`, `["error", "warn", "info", "debug"]`, in this order; `server/src/index.mjs` passes `config.logLevel`. `redactedFieldNames` is a list of further field names that the logger treats as the names of the fixed list; `server/src/index.mjs` passes the two configured header names `config.dataPlaneKeyHeader` and `config.edcManagementApiKeyHeader`. `createLogger` throws a `TypeError` whose message names the parameter when `level` is not a value of `LOG_LEVELS`, when `stream` has no method `write`, or when `clock` has no method `now`.
  - **The levels.** A method writes its line when the position of its level in `LOG_LEVELS` is not after the position of the configured level: at `error` only `error` lines are written, at `warn` the `error` and `warn` lines, at `info` the lines of the first three levels, and at `debug` every line. A method whose level is not written returns without a write. The object has no other method, so a call cannot name an unknown level.
  - **The line.** The line is `JSON.stringify` of one object, followed by one newline character, written with one call of `stream.write`. The object holds, in this order: `time`, the value of `clock.now().toISOString()`, which is the ISO 8601 form in UTC with milliseconds (`YYYY-MM-DDTHH:mm:ss.sssZ`); `level`, the level of the method; `message`, the text of the parameter `message` converted with `String`; `traceId`, `route` and `actingBpnl`, each the value of the field of the same name of `fields`, or `null` when `fields` holds no such field; then every other field of `fields` in the order of `fields`. A field of `fields` named `time`, `level` or `message` at the first level is not written and is not replaced by `[redacted]`, so a call cannot replace the three fields of the logger; a field named `message` below the first level is replaced by `[redacted]` by the rule of the fixed list. A value of the type `Error` is written as the object `{ "name": <name>, "errorMessage": <message> }`, with the key `errorMessage`, because the key `message` is a name of the fixed list. A value that the line already holds on its path is written as the text `[circular]`.
  - **The fixed list.** The exported constant `REDACTED_FIELDS` is the frozen list of these 33 names: `authorization`, `cookie`, `setcookie`, `headers`, `rawheaders`, `token`, `accesstoken`, `bearertoken`, `operatortoken`, `apikey`, `xapikey`, `dataplanekey`, `edcmanagementapikey`, `key`, `secret`, `operatortokensecret`, `password`, `approlepassword`, `testapprolepassword`, `postgrespassword`, `connectionstring`, `databaseurl`, `databasemigrationurl`, `testdatabaseurl`, `payload`, `body`, `content`, `message`, `messages`, `notification`, `productcondition`, `map` and `entries`. The list holds the names under which the server can pass a value that §13 forbids in a log: the header of an operator token and every header map, the operator token, the data plane key and the key of the connector's management API, the passwords and the connection strings of the database, the key of the operator tokens, the payload of an aspect, the body of a request, the content and the whole message of a notification, the battery information of a contract, and an access map with its entries. The header of the partner's Business Partner Number is not in the list: its value is the identifier of a legal entity and no secret, and a call names the partner with the field `partnerBpnl`.
  - **The comparison.** The logger compares every key of `fields` and every key of every object below `fields`, at every depth and inside every list, after the conversion of the key to lower case and the removal of every character outside `a` to `z` and `0` to `9`, so `Authorization`, `x-api-key`, `X_API_KEY` and `xApiKey` match the names `authorization` and `xapikey`. The names of `redactedFieldNames` are converted in the same way. A key that matches keeps its place in the line, and its value, of every type, is replaced by the text `[redacted]`, the exported constant `REDACTION_TEXT`; the logger keeps the key, so that a reader of the line sees that a value was removed. The rule acts on names only: a secret that a call passes under another name is written, so every call of the server passes identifiers and outcomes and never a value of the list. The logger never changes its argument `fields`.
- `server/src/identifiers.mjs` exports `BPNL_PATTERN` (`^BPNL[a-zA-Z0-9]{12}$`) and `BPNS_PATTERN` (`^BPNS[a-zA-Z0-9]{12}$`), the two patterns of `sources/Tractus-X/semantic-models/io.catenax.shared.business_partner_number/2.0.0/BusinessPartnerNumber.ttl` `[live]`, and `UUID_PATTERN`, the pattern `(^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$)|(^urn:uuid:[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$)` of `sources/Tractus-X/semantic-models/io.catenax.shared.uuid/2.1.0/Uuid.ttl` `[live]`. Each of the three constants is a `RegExp` without a flag, so the comparison is case sensitive, as the stored pattern is: the prefix `urn:uuid:` is admitted in lower case only, and the hexadecimal digits in both cases. The module exports three functions (decision D50, Every admitted form of an identifier accepted, one form sent): `normaliseUuid(value)` returns `urn:uuid:` and the 36 characters of the UUID in lower case for a value that matches `UUID_PATTERN`, and throws for every other value; `toUuidColumn(value)` returns the 36 characters in lower case without the prefix, the form of a column of the type `uuid`, and throws for every value that does not match `UUID_PATTERN`; `normaliseMessage(message)` returns a copy of a notification in which `header.messageId`, `header.relatedMessageId` and every content property whose name ends with `CatenaXId` or equals `catenaXId` hold the result of `normaliseUuid`. `normaliseMessage` reads `content` at every depth, objects inside lists included, although the four content schemas of §10.1 hold the named properties at the first level only; leaves an absent property absent; leaves every other field unchanged; and never changes its argument. Each function throws an instance of the exported class `IdentifierFormatError`, which extends `TypeError`, for a value that is not a string or does not match `UUID_PATTERN`. The error holds the property `path`: the JSON pointer of the field for `normaliseMessage` (for example `/header/messageId` or `/content/catenaXId`) and the empty text for the two other functions. The message of the error is `Not a UUID of an admitted form` followed by ` at <path>` when `path` is not empty, and holds no part of the value. A route maps the error: on an operator route the error answers `ERR-LC-BODY-INVALID`, and on a receiving endpoint the error answers `ERR-RX-INTERNAL`, because a receiving endpoint normalises the message after the validation of §10.4, which refuses every value outside the pattern first.

#### 9.2.2 The lifecycle executor (EL-DATASET (the battery passport dataset))

`server/src/dataset/lifecycleService.mjs` is the one module that changes a passport. `createLifecycleService({ repository, catalogue, notificationPlanner, notificationRepository, accessRecords, clock, newUuid, ownBpnl, passportEndedDelaySeconds, passportServiceProviderBpnl, validator, accessMaps, companyRepository, recordReader, twinRegistry })` returns the functions of the table. The parameters `validator`, `accessMaps`, `companyRepository` and `recordReader` serve the check of a payload (`putAspectPayload`), the coverage rule of the access map, the own company record and the passport record of the answers; `twinRegistry` serves the check of the repair certificate of D48 (The repair certificate before the notice) [waits for the owner] in `reportEvent`. The service also exports three read functions that the routes call, so that no route calls a repository (§5.6, the layers): `readBatteryModel({ client, modelId })`, which returns the battery model record or `null`; `listReceivedNotifications({ client })`, which returns the records of `EP-NOTIFICATIONS-RECEIVED`; and `readPassportRecord({ client, passportId })`, which returns the passport record of §10.2 or `null`. Each function receives `{ client, subject, ... }`, where `client` is the database client of the caller's transaction, and each function returns plain data with the field `auditEntries`, the list of the write decisions of §9.2.7. Every function that names a stored passport first reads the passport with `SELECT ... FOR UPDATE`, so that two transactions on one passport run one after the other. A refusal is thrown as an instance of `Refusal` (`server/src/dataset/refusals.mjs`) with the fields `id`, `messages` and `auditEntries`.

| Function | Step | Rule |
|---|---|---|
| `createBatteryModel({ client, subject, data })` | inserts a battery model of the own company | a second model with the same `manufacturerPartId` refuses `ERR-LC-IDENTIFIER-EXISTS` |
| `createFirstPassport({ client, subject, data })` | inserts a passport with the status `original`, its battery model reference, its first responsibility interval (role `economicOperator`, the own company, `valid_from` equal to `dateOfManufacture` at 00:00:00 UTC) and one purpose record with `is_original` true and `recorded_at` equal to the current time | an unknown `batteryModelId` refuses `ERR-LC-MODEL-NOT-FOUND`; a `passportIdentifier` that the table holds refuses `ERR-LC-IDENTIFIER-EXISTS` |
| `issueNewPassport({ client, subject, data })` | the lineage step of the second-life operator: checks the rules of the list below this table, inserts the new passport, one lineage link per predecessor, the first responsibility interval (role `economicOperator`, the own company) and two purpose records, and writes one pending NewPassportIssued notification per predecessor whose data provider is not the own company | writes no column of a predecessor passport |
| `applyNotification({ client, subject, operation, message })` | the receiving step of §10.4 | applies exactly the step of the operation |
| `reportEvent({ client, subject, operation, data })` | the sending side of BatteryRepaired, BatteryBecameWaste and PassportEnded: for BatteryRepaired the function first reads the twin registry with the catenaXId of the repair certificate and refuses `ERR-LC-CERTIFICATE-NOT-REGISTERED` when the registry holds no shell (D48 [waits for the owner]); builds the plan of §10.3 and writes the pending notifications; when the data provider of the named passport is the own company, the function applies the step of §10.4 locally in the same transaction and plans no notification to the own company (decision D12, No notification to the own company) | writes no passport of another data provider |
| `addForwardLink({ client, subject, passportId, messageId })` | inserts one successor link from the received NewPassportIssued record that `messageId` names | refuses `ERR-LC-NOTIFICATION-UNKNOWN` when no such record exists for the passport; a second link to the same new passport returns the stored link |
| `recordSuccessorAuthorisation({ client, subject, passportId, data })` | sets `successor_authorisation_ref`, `successor_authorisation_valid_from` and `successor_authorisation_valid_to` on a passport in the status `waste`; a later call replaces the three values, and each call adds the audit entry of §9.2.7 that holds the replaced and the recorded values (decision D18, The successor's authorisation with its period) | refuses `ERR-LC-STATUS-NOT-ADMITTED` on a passport that is not waste |
| `putAspectPayload({ client, subject, passportId, aspectKey, payload })` | stores or replaces the payload of one of the ten stored aspect keys of §10.6; the function first reads the passport with `SELECT ... FOR UPDATE` and then takes the advisory lock of the battery model of the passport (§9.2.4) before the function reads the access map | an aspect key outside the ten keys refuses `ERR-LC-ASPECT-KEY-UNKNOWN`; a payload that fails the stored schema of its key refuses `ERR-LC-BODY-INVALID`; a payload of one of the seven IDTA-02035 aspect keys that the current access map of the battery model, or a stored version with a later `valid_from`, does not cover refuses `ERR-LC-ACCESS-MAP-INCOMPLETE` (§9.2.4) |

The rules of `issueNewPassport`, in the order of the checks:

1. The battery model `batteryModelId` exists (`ERR-LC-MODEL-NOT-FOUND`) and carries `original_model_catena_x_id`, and that value equals `originalModelCatenaXId` of one predecessor entry or more (`ERR-LC-MODEL-NOT-ORIGINAL`; D35 (The reference to the original battery model)).
2. For each predecessor entry whose `passportIdentifier` names a passport of the own database, the executor reads the stored passport with a row lock. A stored passport that has ended, whose status differs from the declared `lifeCycleStage`, or whose purpose record with `is_original` true differs, after the normalisation of rule 3, from the declared `originalPurpose`, refuses `ERR-LC-OPERATION-NOT-ADMITTED` (decision D13, Predecessors of another data provider).
3. The admission rule of D40 (The admission rule) holds for each predecessor (`ERR-LC-OPERATION-NOT-ADMITTED`). The executor compares two purposes after this normalisation of both texts: leading and trailing white space removed, each run of white space replaced by one space, and every letter converted to lower case.
4. The identifier rule of D14 (The identifier rule) holds, and no two predecessor entries carry one `passportIdentifier` (`ERR-LC-IDENTIFIER-RULE`). The table holds no passport with the `passportIdentifier` of the request (`ERR-LC-IDENTIFIER-EXISTS`).
5. The executor inserts the passport with `manufacturer_bpnl = ownBpnl` and the status of D40, one lineage link per predecessor, the responsibility interval with `valid_from` equal to `operationDate`, one purpose record with `is_original` true, the purpose `originalPurpose` of the first predecessor entry and `recorded_at` equal to `operationDate`, and one purpose record with `is_original` false, the purpose `purpose` of the request and `recorded_at` equal to `operationDate`. The database sets `lineage_open` to true at the insertion of a new passport; the executor inserts the lineage links and then closes the lineage with `UPDATE passports SET lineage_open = false` for the new passport, in the same transaction (decision D54, The lineage of a new passport is open only inside its own transaction). The declared `originalPurpose` of a predecessor entry is the purpose for which the battery of that predecessor was originally designed: the purpose record with `is_original` true of the predecessor passport, also when the predecessor is itself a new passport.
6. For each predecessor whose `dataProviderBpnl` equals `ownBpnl`, the executor inserts a received record of the operation NewPassportIssued: `message` is the header and the content that `buildMessageHeader` and the plan build for a receiver of another company, with `senderBpn` and `receiverBpn` equal to `ownBpnl`; `message_id` is the `messageId` of that header; `sender_bpnl` is `ownBpnl`; `passport_identifier` is the passport identifier of the predecessor; `outcome` is `applied`; and `received_at` is the current time of `clock`. `addForwardLink` can then name the record (D12).

The rules that every function of the table applies:

- **The single-writer rule** (decision D6, One deployment, one company, one writer). Every function reads the passport through the caller's transaction, whose policies show only the passports of the own company (§9.4.3). A passport that the transaction does not show refuses `ERR-LC-PASSPORT-NOT-FOUND`. A new passport is inserted with `manufacturer_bpnl = ownBpnl`.
- **The rule after the end.** Every write on a passport whose `recycling_date` is set refuses `ERR-LC-PASSPORT-ENDED`. The executor applies this rule before the rule after the waste status. The access records of an ended passport stay writable.
- **The rule after the waste status** (D18). A write on a passport whose status is `waste` refuses `ERR-LC-SUCCESSOR-AUTHORISATION-MISSING` unless the successor's authorisation is in force on the current UTC date of `clock`: `successor_authorisation_valid_from` is not after the date, and `successor_authorisation_valid_to` is null or not before the date. The end of the passport, the record of the authorisation itself, the access record of the successor and the access records of `changePurchaser` are exempt. The database holds the same rule for the row of `passports` and for the records of five tables (§9.4.2, D61 (The rule after the waste status covers the records of the passport)), so a later change of the executor cannot remove the rule. The named successor, its role and the waste date of a waste passport never change, also under an authorisation (decision D65 [waits for the owner], The named waste successor is permanent).
- **The rule of the dates** (decision D62, The responsibility timeline is determined by the passport). A step that carries a date and time (the operation date of a new passport, the repair date, the waste date and the recycling date) is refused when the UTC date of the value is after the current UTC date of `clock`: `issueNewPassport` refuses `ERR-LC-OPERATION-NOT-ADMITTED`, and the step of §10.4 refuses `ERR-RX-STEP-REFUSED`, or `ERR-LC-STATUS-NOT-ADMITTED` for a local application. The database holds no clock and cannot judge a date of the future, so the executor alone holds this rule.
- **The audit.** Each function adds one entry to `auditEntries` per write decision on a passport: the decision `granted` with what the decision relied on, or the decision `refused` with the refusal id, each with the action of the table of §9.2.7.
- `server/src/dataset/passportRepository.mjs` holds every SQL statement on the tables `passports`, `battery_models`, `passport_purposes`, `passport_lineage_links`, `passport_successor_links`, `passport_repair_entries`, `passport_responsibility_intervals` and `passport_aspect_payloads`. `server/src/dataset/companyRepository.mjs` holds the SQL on `companies`.
- `server/src/dataset/lifecycleRecordReader.mjs` exports `readLifecyclePayload({ client, passportId })` and `readSuccessorsPayload({ client, passportId })`, which build the payloads of sections 3.2 and 3.3 of the proposal from the tables and write nothing. `readLifecyclePayload` always returns the property `predecessors`, as an empty list for a passport without a lineage link.

#### 9.2.3 The access control (EL-ACCESS (the access control))

- `authenticate({ config, clock })` of `server/src/access/authenticate.mjs` returns an Express middleware that sets `req.subject` or answers 401 with `ERR-AC-UNAUTHENTICATED` (decision D41, Authentication without an identity provider):
  - a request that carries the header named by `config.dataPlaneKeyHeader` is a partner request. The middleware compares the SHA-256 digest of the header value with the SHA-256 digest of `config.dataPlaneKey` by `crypto.timingSafeEqual`, reads the header named by `config.partnerBpnHeader`, and sets `req.subject = { kind: "partner", bpnl }`. A wrong key, an absent partner header or a value that fails `BPNL_PATTERN` answers 401;
  - a request that carries `Authorization: Bearer <token>` and no data plane key header is an operator request. `verifyOperatorToken(token, { secret, now, ownBpnl })` of `server/src/access/operatorToken.mjs` accepts a token only when all of these hold: the token has three parts; the header is exactly `{"alg":"HS256","typ":"JWT"}` (HS256 is the HMAC signature with SHA-256); the signature verifies with `node:crypto`; the claims `sub`, `bpnl`, `iat` and `exp` are present; `sub` matches `^[A-Za-z0-9._-]{1,100}$`; `bpnl` equals `ownBpnl`; `exp` is after `now`; `exp` minus `iat` is 3600 seconds or less; and `iat` is not after `now` plus 60 seconds (D41, D72 (The clock tolerance of an operator token) [waits for the owner]), so that a token is valid for 3600 seconds or less from the moment of its check. The middleware sets `req.subject = { kind: "operator", bpnl }`;
  - a request with neither header answers 401.
- `signOperatorToken({ sub, bpnl, expiresInSeconds }, { secret, now })` of the same module returns the compact token. The administrator of a deployment issues a token with `npm run sign-token`, which runs `server/src/access/signTokenCli.mjs` and reads `OPERATOR_TOKEN_SECRET` from the environment. The test kit signs its tokens with the same function. The claim `sub` names a system or a role of the operator and never a person.
- `CAPABILITIES` of `server/src/access/capabilities.mjs` holds nine strings: `passport.create`, `passport.issue`, `passport.write`, `lifecycle.report`, `access-map.write`, `notification.read`, `battery-information.share`, `notification.receive` and `submodel.read`.
- `capabilitiesOf(subject)` of `server/src/access/policy.mjs` grants an operator subject the first seven capabilities and `submodel.read`, and grants a partner subject `notification.receive` and `submodel.read`. Every other subject receives an empty list.
- `requireCapability(capability)` of `server/src/access/requireCapability.mjs` throws at module load when `capability` is not a member of `CAPABILITIES`. The middleware answers 403 with `ERR-AC-CAPABILITY-MISSING` when the subject lacks the capability.
- `server/src/access/accessRecordService.mjs` exports `addAccessRecord`, `endAccessRecord`, `changePurchaser` and `mayRead({ client, subject, passportId, aspectKey })`, and holds the rules of D29, of D30 (The change of purchaser) and of the access decision of §9.2.4. `server/src/access/accessRecordRepository.mjs` holds the SQL on `passport_access_records`.

#### 9.2.4 The submodel service and the access map (EL-SUBMODELS (the submodel service))

- `readSubmodel({ client, subject, passportId, aspectKey })` of `server/src/submodels/submodelService.mjs` returns the payload of one aspect key of §10.6: the lifecycle and successors payloads from `lifecycleRecordReader`, and every other payload from `passport_aspect_payloads` with the governed elements of §10.6 written over the stored values. The function refuses `ERR-LC-ASPECT-KEY-UNKNOWN` for a key outside §10.6 and for the key `access-map`, which only `EP-ACCESS-MAP` serves, `ERR-LC-SUBMODEL-NOT-FOUND` when the passport holds no payload of the key or when the key is `successors` and the passport has no successor link, and `ERR-AC-ACCESS-GROUP-REFUSED` when `mayRead` refuses. The function writes nothing.
- **The access decision** (decision D3 [waits for the owner], The access map and the whole aspect). The operator subject reads every aspect. `mayRead` decides the read of a partner subject by the table. An open access record is a record of `passport_access_records` for the passport, the partner's BPNL and the aspect key whose `valid_from` is not after the current time of `clock` and whose `valid_to` is null or after that time. The current access map is the result of `readAccessMap` for the battery model of the passport.

| Aspect key | A partner reads the aspect when |
|---|---|
| `lifecycle`, `successors` | an open access record exists |
| `digital-nameplate`, `handover-documentation`, `carbon-footprint`, `technical-data`, `product-condition`, `material-composition`, `circularity` (the seven IDTA-02035 aspect keys) | a current access map exists and holds one entry or more for the aspect and the twin level `PartInstance`, and either every such entry has the access group `public`, or an open access record exists. Without a current access map, or without an entry for the aspect, the read needs an open access record |
| `dpp-metadata`, `serial-part`, `single-level-bom-as-built` | an open access record exists |

  A served aspect is served whole. One access record covers the whole aspect, also when the aspect holds fields of several restricted access groups.
- `putAccessMap({ client, subject, modelId, map })` of `server/src/submodels/accessMapService.mjs` stores a new version of the access map of a battery model. **The lock of the battery model.** The function first takes the transaction-level advisory lock `SELECT pg_advisory_xact_lock(hashtextextended('battery-model:' || $1, 0))` with the id of the battery model, and `putAspectPayload` takes the same lock after the row lock of its passport, so that a new map and a new payload of one battery model never commit side by side, and the coverage rule of D45 (The data provider's check of a new payload) holds for two concurrent requests (finding R45-005 of the review of phases P4 and P5). The role `refserver_app` cannot take a row lock on `battery_models`, because a row lock needs the privilege UPDATE of a column and the role holds SELECT and INSERT on that table only (§9.4.3; observed on 2026-11-19: `SELECT ... FOR UPDATE` and `SELECT ... FOR SHARE` of a battery model answer `permission denied for table battery_models` under the role), and every role takes an advisory lock. The two paths take the locks in the same order (the passport, then the battery model) or the lock of the battery model alone, so no cycle of waiting arises. **A repeated entry.** Before any insert, the function refuses a map with two entries of the same `aspect`, `twinLevel` and `path`: `ERR-LC-ACCESS-MAP-INCOMPLETE` when the two entries name different access groups (one field holds exactly one group, SwR-DATASET-065 (Every dataset field marked with exactly one Art. 77(2) access group)), and `ERR-LC-BODY-INVALID` when the two entries name the same group, independent of the stored payloads. The function refuses `ERR-LC-MODEL-NOT-FOUND` for an unknown model, validates `map` against `docs/api/aspects/BatteryPassportAccessMap-schema.json` with the compiler of `createAspectSchemaCompiler` (§10.6), refuses `ERR-LC-PATH-NOT-SUPPORTED` for a path outside the subset of D27 (A subset of JSONPath), refuses `ERR-LC-ACCESS-MAP-VERSION-EXISTS` for a `mapVersion` that the model already holds, and refuses `ERR-LC-ACCESS-MAP-INCOMPLETE` when the map does not cover a stored payload of one of the seven IDTA-02035 aspect keys of a passport of the model.
- **The coverage rule.** A map covers a payload when every leaf of the payload (a value that is neither an object nor a list) is matched by one entry or more of the map whose `aspect` is the semantic identifier of the aspect key and whose `twinLevel` is `PartInstance`, and all entries that match one leaf carry one access group. `putAccessMap` and `putAspectPayload` apply the same function `coverageProblems(map, aspectKey, payload)` of `accessMapService.mjs`, which returns one message per uncovered leaf and per leaf with two groups. `putAspectPayload` applies the rule to the payload with the governed elements written over it, against the current access map and against every stored version of the model whose `valid_from` is after the current date; a battery model without a stored version admits every payload, and the read rule of the table then asks a partner for an access record.
- `readAccessMap({ client, modelId, today })` returns, as the payload of section 3.4 of the proposal, the access map version whose `valid_from` is the latest date that is not after `today`, the current date of `clock`; among versions with one `valid_from` the version with the highest `id` wins. The function returns `null` when no version qualifies, and `EP-ACCESS-MAP` then answers `ERR-LC-SUBMODEL-NOT-FOUND`.
- `compilePath(path)` and `matchLeaves(compiledPath, payload)` of `server/src/submodels/jsonPathSubset.mjs` implement the subset of D27.

#### 9.2.5 The connector client and the background work (EL-CXCLIENT (the connector client), EL-BGWORK (the background work))

- `buildMessageHeader({ operation, senderBpnl, receiverBpnl, clock, newUuid })` of `server/src/connector/messageHeader.mjs` returns the header of §10.1.
- `buildNotificationPlan({ operation, content, receivers, ownBpnl })` of `server/src/connector/notificationPlan.mjs` returns one entry `{ operation, receiverBpnl, passportIdentifier, content }` per pair of receiver BPNL and passport identifier, without an entry for `ownBpnl` (D12). The function is pure.
- `server/src/connector/notificationRepository.mjs` holds the SQL on `notifications_sent` and `notifications_received`.
- **The receiver resolver contract** (decision D11, The receiver resolution behind a port). A receiver resolver is an object with the method `resolve(bpnl)`, which resolves to `{ did, connectorUrl }` in two steps, or to `null` when a step finds nothing: the first step resolves the BPNL to the receiver's decentralised identifier (DID) as the BPN-DID Resolution Service of CX-0167 (BPN-DID Resolution Service) does, and the second step finds the address of the receiver's connector from the DID as the DID discovery of CX-0018 (Dataspace Connectivity) section 2.6 does. `createMemoryReceiverResolver({ didByBpnl, connectorUrlByDid })` of `server/src/connector/memoryReceiverResolver.mjs` performs the two steps on two maps. `createConnectorDiscoveryResolver({ config, fetch })` of `server/src/connector/connectorDiscoveryResolver.mjs` asks the own connector, which performs both steps with its own credential (decision D75, The receiver resolution through the own connector): the resolver sends `POST <config.edcManagementUrl>/v3/connectordiscovery/connectors` with the key of the management API in the header `config.edcManagementApiKeyHeader`, and returns `{ did, connectorUrl }` from the answer, where `connectorUrl` is the Dataspace Protocol address of the receiver's connector that the answer names, with the segment `/2025-1` of the protocol version 2025-1 (tractusx-edc at the tag `0.13.0` (commit `964d33d7ed942369f624aacbc45037a1f79fc7be`), `tractusx-edc/docs/usage/management-api-walkthrough/04_catalog.md` lines 29 to 75). The first run confirmed the forms (tractusx-edc at the tag `0.13.0`, `tractusx-edc/docs/usage/management-api-walkthrough/04_catalog.md` lines 29 to 44, 64 to 81 and 86 to 90): the request body is `{ "@context": { "tx": "https://w3id.org/tractusx/v0.0.1/ns/", "edc": "https://w3id.org/edc/v0.0.1/ns/" }, "@type": "tx:ConnectorServiceDiscoveryRequest", "edc:counterPartyId": <the Business Partner Number> }`, which the connector translates with the BPN-DID Resolution Service; the answer 200 is a list of objects with `edc:counterPartyId`, `edc:counterPartyAddress` and `edc:protocol`, of which the resolver takes the entry of the protocol `dataspace-protocol-http:2025-1` or else the first entry, and returns `edc:counterPartyId` as `did` and `edc:counterPartyAddress` as `connectorUrl`; the answer 400 for a Business Partner Number without a DID or for a DID document without a connector resolves to `null` (`tck/README.md`, section "The recorded answers of phase P7"). The resolver returns `null` for an answer that names no connector. The server holds no credential of the dataspace, so decision D41 stays. `createAddressListResolver({ addressList })` of `server/src/connector/addressListResolver.mjs` resolves a Business Partner Number from the configured map `config.receiverAddressList` and returns `{ did, connectorUrl }` of its entry, or `null` for a Business Partner Number outside the map (decision D81, A fixed address list in the local deployment only). `server/src/index.mjs` selects the resolver of the connector binding by `config.receiverResolution`: `discovery` selects `createConnectorDiscoveryResolver` and `address-list` selects `createAddressListResolver`; `BINDING=memory` keeps the memory resolver and ignores the variable. `server/test/receiverResolverContract.test.mjs` runs one test code against the memory resolver, against the address list resolver and against the discovery resolver with a stubbed `fetch` that answers with the forms recorded from release 0.13.0.
- **The transport contract.** A transport is an object with two methods. The method `send({ receiverBpnl, connectorUrl, operation, message })` resolves to `{ outcome, httpStatus, body, cause }`, where `outcome` is one of `sent` (the receiver answered 200), `no_asset` (the sender sees no lifecycle notification asset of the receiver: the receiver publishes no such asset, or the access policy of the asset does not admit the sender, which a Catena-X connector shows as an absent offer), `contract_refused` (the sender sees the asset and the negotiation of the contract ends refused, in the connector transport with the state `TERMINATED`, and in the memory transport when the usage policy of the offer holds another framework agreement than `FRAMEWORK_AGREEMENT` or no usage purpose `cx.circular.dpp:1`), `receiver_refused` (the receiver answered a status from 400 to 499, or another status below 500 that is not 200) and `transport_failed` (no answer, or an answer with a status from 500 to 599). A status of the class 5xx is a failure of the receiver that the receiver asks the sender to repeat (the text of `ERR-RX-INTERNAL` of §9.5), so the sender repeats the message with the same `messageId` by D49 (The retry of a failed transport) [waits for the owner], and the receiver answers a repeated message by D8 (Idempotency by the message identifier). The method `pull({ providerBpnl, connectorUrl, semanticId, passportIdentifier })` finds the offer of the provider with that semantic identifier and that passport identifier, negotiates the contract, reads the path of the offer and resolves to `{ outcome, agreementId, body, cause }`, with the outcome `received`, `no_asset` (no offer of the provider that the consumer sees), `contract_refused` (a seen offer whose negotiation ends refused), `provider_refused` (a status from 400 to 499, or another status below 500 that is not 200) or `transport_failed` (no answer, or a status from 500 to 599). Neither method throws for one of its five outcomes. `createMemoryTransport({ participants, offerStores, ownBpnl })` of `server/src/connector/memoryTransport.mjs`, where `participants` is a map from a connector address to `{ bpnl, app, dataPlaneKey, dataPlaneKeyHeader, partnerBpnHeader }`, `offerStores` is a map from a Business Partner Number to an offer store, and `ownBpnl` is the Business Partner Number that the transport presents as the sender and as the consumer, because the contract names no sender in `send` and no consumer in `pull`, and `createEdcTransport({ config, fetch })` of `server/src/connector/edcTransport.mjs` implement the contract, and `server/test/transportContract.test.mjs` runs one test code against the memory transport from phase P5 and against both implementations from phase P7. The two implementations report one outcome for one situation (decision D83, One meaning of no_asset and contract_refused): `server/test/transportContract.test.mjs` publishes, for both implementations, an offer whose access policy does not admit the sender and asserts `no_asset`, and an offer that admits the sender and whose usage policy holds the framework agreement `OtherAgreement:1.0` and asserts `contract_refused`, where the stubbed `fetch` of the connector transport answers a negotiation of such an offer with the state `TERMINATED`. The memory transport calls the Express application of the receiver with the method, the path, the body and the content type unchanged, sets the data plane key of the receiver and the BPNL of the sender in the two headers of D41, and returns the status and the body of the receiver unchanged. **The answer of a provider data plane (decision D85, The error text of the provider data plane).** The provider data plane of Tractus-X EDC 0.13.0 passes an answer 200 of the server through unchanged and answers every other status of the server with 500 and without the body of the server (`tck/README.md`, section "The second run of phase P7", result 1). The connector transport therefore reads an answer 500 of the data plane before the classes of the status above: when the first entry of the list `errors` of the body matches the regular expression `^Received code transferring HTTP data: ([1-5][0-9]{2})\b`, the transport takes the captured code as the status of the receiver; a code from 400 to 499 gives the final outcome `receiver_refused` (`provider_refused` for `pull`), a code from 500 to 599 gives `transport_failed`, and the field `httpStatus` holds the captured code. An answer 500 whose list `errors` is empty, absent or holds a first entry that does not match gives `transport_failed` with `httpStatus` 500, so that the retry of D49 [waits for the owner] applies (D88 (A data plane answer 500 without a code) [waits for the owner] [waits for the owner]). The cause is the text `the data plane answered 500: ` followed by the first entry of `errors`, or by `no error text` for an empty list, and the sender cleans and cuts the cause (§9.2.5, the texts of a receiver). The memory transport is unchanged. The descriptive error body of section 4.3 item 7 of the proposal therefore does not reach the sender through this connector release, and the finding goes to the expert group.

  **The transfer client.** `server/src/connector/edcTransport.mjs` exports `createEdcTransferClient({ config, fetch })`, which the connector transport and the connector binding of the test kit share, and the class `TransportStep`, the error of a step with its outcome. The transfer client asks the catalog of the counterparty before every call, with a `querySpec` of `offset` 0 and `limit` 5000 and, for one asset, a `filterExpression` on the asset identifier; negotiates the contract; starts an `HttpData-PULL` transfer; and keeps the endpoint data reference of one connector address and one asset for its validity `expiresIn` minus 60 seconds, when the validity is above 60 seconds.
- **The offer contract.** An offer store is an object with the methods `publish({ assetId, dctType, version, semanticId, passportIdentifier, path, allowedBpnls, usagePurposes, frameworkAgreement })`, `withdraw(assetId)` and `list()`. The method `publish` replaces a published offer with the same `assetId`. The value `null` of `allowedBpnls` means every participant, and an empty list means no participant: the asset is registered, and its access policy admits nobody, so every submodel descriptor of §9.2.6 names a registered asset. `createMemoryOfferStore()` of `server/src/connector/memoryOfferStore.mjs` and `createEdcOfferStore({ config, fetch })` of `server/src/connector/edcOfferStore.mjs` implement the contract. `server/src/connector/offerPublisher.mjs` is the one caller: `publishNotificationAsset()`, `publishPassportOffers({ client, passportId })`, `publishAccessMapOffer({ modelId })` and `withdrawDatasetOffers({ passportId })` build the offers of §10.5 with `server/src/connector/policyBuilder.mjs`. The usage policy of every offer holds the constraint `FrameworkAgreement` with the value `frameworkAgreement` and the constraint `UsagePurpose` with the values `usagePurposes` in one `and` conjunction, because the Catena-X dataspace accepts no usage policy without both constraints (tractusx-edc at the tag `0.13.0` (commit `964d33d7ed942369f624aacbc45037a1f79fc7be`), `tractusx-edc/docs/usage/management-api-walkthrough/02_policies.md` lines 97 to 105); the access policy holds the constraint `BusinessPartnerNumber` with the operator `isAnyOf` and the list `allowedBpnls` (the same file, lines 44, 57 and 63). The value of `frameworkAgreement` is the constant `FRAMEWORK_AGREEMENT` of `server/src/connector/policyBuilder.mjs`, which holds the value `DataExchangeGovernance:1.0` with the operator `eq`, beside `UsagePurpose` with the operator `isAnyOf` (tractusx-edc at the tag `0.13.0`, `tractusx-edc/docs/usage/management-api-walkthrough/02_policies.md` line 99 and lines 235 to 265, confirmed by the first run). The memory offer store stores the field unchanged, and the contract definition of the connector offer store selects the asset with an `assetsSelector` whose `operandLeft` is `https://w3id.org/edc/v0.0.1/ns/id` (`03_contractdefinitions.md` lines 8 to 30). **The connector offer store.** An empty list of `allowedBpnls` registers the asset without policies and without a contract definition, because the management API refuses the operator `isAnyOf` with an empty list (`tck/README.md`, section "The recorded answers of phase P7"), so no participant sees an offer of the asset. `publish` replaces an offer by deleting the contract definition, replacing the asset and the two policies, and creating the contract definition again, because the management API refuses a change of a policy that a contract definition references. `withdraw` deletes the contract definition, the asset and the two policies; an asset of an existing contract agreement cannot be deleted (answer 409), so the store then marks the asset as withdrawn in its private property, and `list` leaves a withdrawn asset out.
- **The exposure of a passport.** `refreshPassportExposure({ pool, passportId })` of `server/src/connector/exposure.mjs` reads the passport in a transaction of its own, builds the PartInstance shell of §9.2.6, calls `twinRegistry.put(shell)` and calls `publishPassportOffers`. For an ended passport the function first calls `withdrawDatasetOffers({ passportId })`, which withdraws the ten dataset offers and counts the withdrawal of an absent offer as success, so that `EP-TWIN` repairs a withdrawal that failed after the end (decision D33 [waits for the owner], The offers of an ended passport). `refreshModelExposure({ pool, modelId })` does the same for the PartType shell and the access map offer. Both functions resolve to `{ refreshed: true }` or to `{ refreshed: false, cause }`, never throw for a failure of the registry, of the offer store or of the database, and log a failure at the level `error` with the detail of the error. The value of `cause` is one of four fixed texts, `the twin registry failed`, `the offer store failed`, `the database failed` and `the call failed`, and never the message of the caught error, because §9.5 lets no message of the database or of a dependency reach a response; `afterCommit` of §9.3 answers the same four texts. §9.3 names the endpoints that call each function after the commit (decision D23, The exposure after the commit).
- **The sender.** `createNotificationSender({ pool, repository, transport, receiverResolver, clock, maxAttempts, retrySeconds, ownBpnl, logger })` of `server/src/connector/notificationSender.mjs` returns `sendDue()`, `retry({ client, id })` and `listSent({ client })`, which returns the records of `EP-NOTIFICATIONS-SENT`. One call of `sendDue()` repeats this unit of work until no row qualifies: in one transaction the sender selects one row of `notifications_sent` whose `outcome` is `pending` and whose `not_before` is not after the current time, in the order of `id`, with `FOR UPDATE SKIP LOCKED LIMIT 1`; calls `receiverResolver.resolve` and, when the receiver resolves, `transport.send` with the stored message; writes the outcome, the cause, the status, `attempted_at`, `receiver_did`, `receiver_connector_url` and `attempts + 1` on the row; and commits. A receiver that does not resolve receives the outcome `receiver_unresolved`. An error that `receiverResolver.resolve` or `transport.send` throws, which the two contracts do not admit, is recorded as the result `transport_failed` with the cause `receiver resolution failed` or `transport failed`. A `transport_failed` result with `attempts + 1` below `maxAttempts` keeps the outcome `pending`, stores the cause and sets `not_before` to the current time plus `retrySeconds` multiplied by the new attempt count, so that the same message is sent again with the same `messageId` (D8, D49 [waits for the owner]). A `transport_failed` result at `maxAttempts` stores the outcome `transport_failed`, and `EP-NOTIFICATION-RETRY` sets a row with the outcome `transport_failed` or `receiver_unresolved` back to `pending` with `attempts` 0, `cause` null and `not_before` equal to the current time of `clock`; the endpoint refuses every other outcome with `ERR-LC-STATUS-NOT-ADMITTED`. **The texts of a receiver.** The sender stores no body of an answer. Before the write, the sender removes every character U+0000 from the cause, whose text can come from the error code of a receiver answer, and cuts the cause to 500 characters, because PostgreSQL refuses the character U+0000 in a text and a receiver chooses the code. **A failed write of an attempt.** When the write of the attempt fails, the transaction rolls back; the sender then locks the row again in a new transaction with `FOR UPDATE SKIP LOCKED`, writes `attempts + 1`, the outcome of the rule above, `not_before` of the rule above and the cause `the attempt record failed: sqlstate <code>`, logs the failure at the level `error`, and continues with the next row; when the second write fails as well, the sender logs the failure and ends the call of `sendDue`, so that the next run of the worker starts again. One row therefore never blocks the outbox, and the limit of D49 [waits for the owner] holds (finding R45-002).
- **The sharing of individual battery information** (decision D38, The sharing of individual battery information). `server/src/connector/issuerContractService.mjs` exports four functions, and `server/src/connector/issuerContractRepository.mjs` holds the SQL on `issuer_contracts` and `received_battery_information`.
  - `recordProviderContract({ client, subject, data })` stores a contract with the side `provider` on the deployment that offers the information. When `passportIdentifier` names a passport of the own company, `issuerBpnl` must equal the `predecessor_data_provider_bpnl` of a lineage link of the passport, the request must carry no `productCondition`, and the payload is the stored `product-condition` payload of the passport; a passport without that stored payload refuses `ERR-LC-SUBMODEL-NOT-FOUND`. When `passportIdentifier` names no passport of the own company, the deployment acts for the purchaser of the battery, the request must carry `productCondition`, which the function validates against the stored schema of the aspect key `product-condition`, and the contract stores the payload. The function refuses `ERR-LC-ISSUER-NOT-LINKED` otherwise, and `ERR-LC-CONTRACT-EXISTS` for a second open contract of the same side, passport identifier, issuer and provider. The route then publishes the battery information offer of §10.5 for the one BPNL `issuerBpnl`.
  - `recordIssuerContract({ client, subject, data })` stores a contract with the side `issuer` and the pull state `pending` on the deployment of the original issuer.
  - `endContract({ client, subject, contractId })` sets `valid_to` to the current time, and the route withdraws the offer of a provider contract. An unknown id refuses `ERR-LC-CONTRACT-NOT-FOUND`, and an ended contract refuses `ERR-LC-CONTRACT-ENDED`.
  - `readBatteryInformation({ client, subject, contractId })` returns the payload of an open provider contract to the partner whose BPNL equals `issuer_bpnl`, and refuses `ERR-AC-ACCESS-GROUP-REFUSED` for every other partner, `ERR-LC-CONTRACT-NOT-FOUND` for an unknown id or an issuer contract, and `ERR-LC-CONTRACT-ENDED` for an ended contract.
- **The puller.** `createBatteryInformationPuller({ pool, repository, transport, receiverResolver, validator, clock, ownBpnl })` of `server/src/connector/batteryInformationPuller.mjs` returns `pullDue()`. One call repeats this unit of work until no row qualifies: in one transaction the puller selects one issuer contract whose pull state is `pending` and whose `valid_to` is null, with `FOR UPDATE SKIP LOCKED LIMIT 1`; resolves the provider; calls `transport.pull` with the semantic identifier of the aspect key `product-condition`; validates a received body against the stored schema of that aspect key; inserts one `received_battery_information` record with the passport identifier, the battery identifier, the agreement identifier and the time of receipt; writes the pull state `received`, or the failed outcome with its cause (`receiver_unresolved` for a provider that does not resolve, and `provider_refused` for a body that fails the schema); and commits. The puller writes no passport and no payload of a passport. The puller cleans the cause as the sender does.
- **The worker.** `createOutboxWorker({ sender, puller, audit, intervalMilliseconds, logger })` of `server/src/background/outboxWorker.mjs` returns `{ start(), stop(), tick() }`. `tick()` awaits `sender.sendDue()`, then `puller.pullDue()`, then `audit.writeQueued()` of §9.2.7, and resolves when the three have ended; an error of one of the three calls is logged at the level `error` and does not stop the two other calls. A call of `tick()` while an earlier call runs returns the promise of the earlier call, so that two runs never overlap in one process; the row lock of the sender and of the puller excludes a double send between two processes. `start()` schedules the next `tick()` `intervalMilliseconds` after the previous `tick()` has ended. `stop()` cancels the schedule and awaits the running `tick()`. The worker sends each message exactly as the executor stored the message.

#### 9.2.6 The twin registration (EL-TWINS (the twin registration))

- **The twin registry contract.** A twin registry is an object with the methods `put(shell)`, which registers the shell or replaces the registered shell with the same `id`, and `read(shellId)`, which resolves to the shell or to `null`. `createMemoryTwinRegistry()` of `server/src/twins/memoryTwinRegistry.mjs` and `createDtrTwinRegistry({ config, fetch })` of `server/src/twins/dtrTwinRegistry.mjs` implement the contract, and `server/test/twinRegistryContract.test.mjs` runs one test code against the memory registry from phase P4 and against both implementations from phase P7.
- `buildPartInstanceShell({ passport, model, aspectKeys, config })` and `buildPartTypeShell({ model, hasAccessMap, config })` of `server/src/twins/shellDescriptor.mjs` return shell descriptors with the fields of the table. The stored text `sources/Tractus-X/kits-26.09/industry-core-kit/software-development-view/digital-twins.mdx` states the form of a submodel descriptor `[live]`.

| Field | PartInstance shell | PartType shell |
|---|---|---|
| `id`, `globalAssetId` | `urn:uuid:` and `passports.id` | `urn:uuid:` and `battery_models.id` |
| `idShort` | `batteryPassport` | `batteryModel` |
| `specificAssetIds` (a list of `{ name, value }`) | `manufacturerId` = `passports.manufacturer_bpnl`; `manufacturerPartId` = `battery_models.manufacturer_part_id`; `partInstanceId` and `intrinsicId` = `passports.battery_identifier`; `digitalTwinType` = `PartInstance` (Table 2.1.1 of the proposal) | `manufacturerId` = `battery_models.manufacturer_bpnl`; `manufacturerPartId`; `digitalTwinType` = `PartType` |
| `submodelDescriptors` | one descriptor per aspect key of the passport: each stored payload key; `lifecycle` when the passport has a lineage link, a waste successor or an end; `successors` when the passport has a successor link | the descriptor of `access-map` when the model holds an access map version |

  Each submodel descriptor holds: `id`, the value `urn:uuid:` and a UUID that `shellDescriptor.mjs` derives from the first 16 bytes of the SHA-256 digest of the shell id and the aspect key, with the version bits set to 4 and the variant bits set to the RFC 4122 variant, so that the id is stable and has the form of a version 4 UUID; `idShort`, the short name of the aspect key of §10.6; `semanticId`, `{ "type": "ExternalReference", "keys": [{ "type": "GlobalReference", "value": <the semantic identifier of §10.6> }] }`; and one endpoint with `interface` `SUBMODEL-3.0` and `protocolInformation` with `href` equal to `config.connectorDataPlanePublicUrl`, the path of the offer of §10.5 without the prefix `/api`, and the suffix `/submodel`; `endpointProtocol` `HTTP`; `endpointProtocolVersion` `["1.1"]`; `subprotocol` `DSP`; `subprotocolBody` `dspEndpoint=<config.connectorDspUrl>;id=<the asset id of §10.5>`; `subprotocolBodyEncoding` `plain`; and `securityAttributes` `[{ "type": "NONE", "key": "NONE", "value": "NONE" }]`. The visibility rule of the specific asset IDs of CX-0127 (Industry Core: Part Instance) is not built, because the text of CX-0127 is cited and not stored.

#### 9.2.7 The audit trail (EL-AUDIT (the audit trail))

`createAuditLog({ pool, repository, clock, logger, ownBpnl, retrySeconds })` of `server/src/audit/auditLog.mjs` returns `record(entries)` and `writeQueued()`; `ownBpnl` is the value of `app.acting_bpnl` of its transactions, and `retrySeconds` is `config.notificationRetrySeconds`. An entry is `{ decision, requesterBpnl, requesterKind, passportId, action, reliedOn, refusalId, details }`. The value of `decision` is `granted` or `refused`. The value of `reliedOn` is `data-provider`, `successor-authorisation:<reference>` or `end-of-passport-exemption`, and null for a refused decision. The value of `action` is one of the twelve strings of the table, which the module exports as `AUDIT_ACTIONS`. `record` inserts one record of `passport_write_decisions` per entry through `server/src/audit/auditRepository.mjs`, with `decided_at` equal to the current time of `clock`, in one transaction of its own. The helper of §9.3 calls `record` after the transaction of the request has ended: after the commit for the entries of a granted request, and after the rollback for the entries of a refused request. The request has released its database client before `record` takes a client, so one request never holds two clients. **A failed insert (decision D69, The audit record after a failed write is queued).** `record` never throws. When the insert fails, `record` logs the failure at the level `error` with the message `The audit record of a write decision failed and is queued.` and the fields `sqlState`, `constraint`, `actions` and `passportIds`, and inserts one row of `audit_outbox` (§9.4.4) in a new transaction, with `entries` equal to the list of the entries, `decided_at` equal to the time that `record` took for the decision, and `not_before` equal to the same time; `record` then resolves to `{ written: false, queued: true }`. When the insert into the queue fails as well, `record` logs at the level `error` the message `The audit record of a write decision is lost.` with the actions, the passport ids, the refusal ids and the two SQLSTATE values, and resolves to `{ written: false, queued: false }`. A written record resolves to `{ written: true, queued: false }`, and a call with an empty list, which writes nothing, resolves to the same value. `runWrite` answers the true outcome in every case: the success answer of a granted step, and the refusal of a refused step. **The queue.** One call of `writeQueued()` repeats this unit of work until no row qualifies: in one transaction the audit log selects one row of `audit_outbox` whose `written_at` is null and whose `not_before` is not after the current time, in the order of `not_before` and `id`, with `FOR UPDATE SKIP LOCKED LIMIT 1`; inserts one record of `passport_write_decisions` per entry with `decided_at` equal to `decided_at` of the row; sets `written_at` to the current time; and commits. When the insert fails, the transaction rolls back, and the audit log writes in a new transaction `attempts + 1`, `last_error` equal to `sqlstate <code>` followed by ` constraint <name>` when the error names a constraint, cut to 500 characters, and `not_before` equal to the current time plus `retrySeconds` multiplied by the new attempt count, at most 86400 seconds; logs the failure at the level `error`; and continues with the next row. A row has no limit of attempts, because an audit record is never dropped; a row whose next attempt lies in the future does not qualify again in the same call. The role `refserver_app` deletes no row of the queue: a written row keeps `written_at` as its record.

| Action | Written by |
|---|---|
| `passport.create` | `createFirstPassport` |
| `passport.issue` | `issueNewPassport` |
| `aspect.put` | `putAspectPayload` |
| `forward-link.add` | `addForwardLink` |
| `successor-authorisation.record` | `recordSuccessorAuthorisation` |
| `notification.apply.NewPassportIssued`, `notification.apply.BatteryRepaired`, `notification.apply.BatteryBecameWaste`, `notification.apply.PassportEnded` | `applyNotification`, and the local application of `reportEvent` |
| `purchaser.change` | `changePurchaser` |
| `access-record.add`, `access-record.end` | `addAccessRecord`, `endAccessRecord` |

The audit entry of `recordSuccessorAuthorisation` has the action `successor-authorisation.record`, the decision `granted`, `reliedOn` equal to `data-provider`, and `details` equal to `{ "previous": <null, or { "authorisationRef", "validFrom", "validTo" } of the three stored values before the call>, "recorded": { "authorisationRef", "validFrom", "validTo" } }`, so that a replaced authorisation stays on record (D18). Every other entry has `details` null.


#### 9.2.8 The database access (EL-RDB (the relational database))

- **The two database roles** (decision D24, Two database roles and row-level security). The role of the migrations owns the schema and its tables, and its connection string is `DATABASE_MIGRATION_URL`. The server connects only as the role `refserver_app`, a login role without ownership, whose connection string is `DATABASE_URL`. No module of the server reads `DATABASE_MIGRATION_URL`. A role of the migrations that is neither a superuser nor a role with the attribute `BYPASSRLS` reads and writes no record of the twelve tables with a policy, because `FORCE ROW LEVEL SECURITY` applies the policies to the owner and no policy names the owner; the four migration files hold no statement that reads or writes a record of those tables, so the migrations run under an owner role without either attribute. The owner role also owns the database, or an administrator has revoked the privilege `TEMPORARY` of the database from PUBLIC before the first migration (decision D60, A fixed search path for every function, no temporary table for the application role, and a database of its own).
- `createAppRole(adminClient, { password })` of `server/src/db/createAppRole.mjs` runs one transaction: `BEGIN`; `SELECT pg_advisory_xact_lock(hashtext('refserver_app'))`; when `pg_roles` holds no role `refserver_app`, `CREATE ROLE refserver_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS`, where the SQLSTATE `42710` (the role exists, created by a caller in another database of the cluster) counts as success after a `ROLLBACK` and a new transaction; `ALTER ROLE refserver_app PASSWORD <literal>`; `COMMIT`. The function builds the password literal with `adminClient.escapeLiteral`. `server/src/db/createAppRoleCli.mjs` is the command `npm run create-role`, which reads `DATABASE_MIGRATION_URL` and `APP_ROLE_PASSWORD` from the environment. Between the creation and the password the function removes every stored setting of the role, because PostgreSQL 17 lets a role store settings for its own later connections, for every database with `ALTER ROLE refserver_app SET ...` and for one database with `ALTER ROLE refserver_app IN DATABASE <database> SET ...`, and the role runs both forms on itself with success (D24). The function runs these statements in this order. First, `ALTER ROLE refserver_app RESET ALL`, which removes only the settings that apply to every database. Second, `ALTER ROLE refserver_app IN DATABASE <database> RESET ALL` for the current database, with the name that `SELECT current_database()` returns, quoted as an identifier with `adminClient.escapeIdentifier`. Third, the same statement for each other database for which the catalogue `pg_db_role_setting` still holds a row of the role, where the function reads the names with `SELECT d.datname FROM pg_db_role_setting s JOIN pg_roles r ON r.oid = s.setrole JOIN pg_database d ON d.oid = s.setdatabase WHERE r.rolname = 'refserver_app'`, quotes each name in the same way, and writes one warning line per database to the standard error output: `createAppRole: removed the stored settings of refserver_app for the database <database>`. Fourth, the function reads the catalogue again and throws an error that names the remaining row when a row of the role remains. The function removes the rows of the other databases, and does not only report them, for two reasons: the check of `003_policies.sql` (§9.4.3) and the check at the start of the server count every row of the role, so a row that stayed would block the migration without a command that clears the row; and no deployment stores a setting of the role, because the reference server runs on a database of its own (D60) and every setting of a connection comes from the options of `createPool`. Observed on 2026-11-16 on PostgreSQL 17.12, in a transaction that the author rolled back: after `ALTER ROLE refserver_app SET statement_timeout = '60s'` and `ALTER ROLE refserver_app IN DATABASE refserver_test SET default_transaction_isolation = 'repeatable read'`, the statement `ALTER ROLE refserver_app RESET ALL` left the row of the database `refserver_test`, the statement with `IN DATABASE` left no row, and the per-database form answered `ALTER ROLE` under the session authorisation of the role itself. An administrator runs the command once per database cluster, before the first migration, and again when `003_policies.sql` or the start of the server reports a stored setting; after the command the catalogue holds no row of the role, so the migration and the start pass.
- `migrate(adminClient, { schema })` of `server/src/db/migrate.mjs` validates `schema` against `^[a-z_][a-z0-9_]{0,62}$`, runs `CREATE SCHEMA IF NOT EXISTS <schema>`, sets `search_path` to the schema for the session, creates the table `schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())` when the table is absent, and applies each file of `server/src/db/migrations/` in the order of the file names, each in one transaction that also inserts the file name into `schema_migrations`. A file whose name the table holds is not applied again, so a second run applies no file. The function stops with an error when the role `refserver_app` does not exist. `server/src/db/migrateCli.mjs` is the command `npm run migrate`, which reads `DATABASE_MIGRATION_URL` and `DATABASE_SCHEMA`. A phase never changes a migration file that an earlier phase delivered: a later change of the database is a new file whose name starts with the next number. The function runs under a role that owns the database or is a superuser, or after an administrator has run the revocation, because `003_policies.sql` revokes the privilege `TEMPORARY` of the database from PUBLIC when the role `refserver_app` holds the privilege, and stops with `ERR-DB-ROLE-PRIVILEGE` when the role still holds the privilege afterwards (D60). **The rule for a later migration file (D60).** Every migration file ends with the `DO` block of §9.4.2 that fixes the search path of every function of the schema, because `CREATE OR REPLACE FUNCTION` removes every setting of a function that the statement does not repeat. Every trigger function of a later file calls `require_read_committed()` in its first statement. Group (a) of `server/test/databaseRules.integration.test.mjs` fails when a function of the schema lacks the search path or a trigger function lacks the call. The function returns the list of the file names that the call applied, in the order of the application, and an empty list when the call applied no file.
- `createPool({ connectionString, schema, size })` of `server/src/db/pool.mjs` returns a `pg` pool with `max` equal to `size`, with the connection option `options: "-c search_path=<schema> -c timezone=UTC -c default_transaction_isolation=read\\ committed -c default_transaction_read_only=off"`, in which the backslash escapes the space of the value, and whose four settings take precedence over a stored setting of the role (observed on 2026-11-16 with `pg` 8.23.1: a connection of a role with the stored setting `default_transaction_isolation = serializable` reports `read committed`), and with its own type parsers in the option `types`: the type `date` (OID 1082) is returned as the text `YYYY-MM-DD`; the type `numeric` (OID 1700) is returned as a JavaScript number; the type `bigint` (OID 20) is returned as a JavaScript number; the types `timestamptz` and `uuid` keep the parsers of `pg` (a `Date` and a text). The module validates `schema` against the pattern of `migrate`. Every identity `id` of §9.4.1 is a JSON number in a response, and every date of a column of the type `date` is a JSON string of the form `YYYY-MM-DD`.
- `withTransaction(pool, { actingBpnl, today }, work)` of `server/src/db/transaction.mjs` takes a client, runs `BEGIN ISOLATION LEVEL READ COMMITTED READ WRITE`, `SELECT set_config('app.acting_bpnl', $1, true)` and `SELECT set_config('app.today', $2, true)`, awaits `work(client)`, and runs `COMMIT`, or `ROLLBACK` when `work` rejects, and releases the client. Every caller of the server passes `config.ownBpnl` as `actingBpnl`, for an operator request, for a partner request and for the worker alike, because one deployment acts for one company (D6), and passes the current UTC date of `clock` in the form `YYYY-MM-DD` as `today` (D53). The level is stated in the statement itself, so no setting of the session or of the role changes the level of a transaction of the server, and every trigger function of the database refuses a write at another level (decision D66, Every write runs at the isolation level READ COMMITTED). No module of the server starts a transaction outside `withTransaction`.
- `checkHealth(pool)` of `server/src/db/health.mjs` runs `SELECT 1` and resolves to `true` or `false`.


#### 9.2.9 The conformance test kit

- `tck/lib/binding.mjs` exports `startBinding(options)`. The argument `options` is `{ accessRegime, passportServiceProviderBpnl }`; `accessRegime` defaults to `after-act`, and `passportServiceProviderBpnl` defaults to no value. The function reads `TCK_BINDING` (`in-process` or `connector`; another value throws) and returns the binding object of the selected module. Both modules return the same contract: `{ provider, operator, recycler, settle(), stop() }`. Each of the three participants is `{ bpnl, call(method, path, body), asPartner(reader).get(path), catalogue(reader), registry }`: `call` sends an operator request with a token of `signOperatorToken`; `asPartner(reader).get(path)` reads a path of the participant as the partner `reader`, where `reader` is a participant or a Business Partner Number. The method finds the offer of the participant whose path equals the requested path or is the longest offer path that the requested path starts with followed by `/`; answers `{ outcome: "no_asset", status: null, body: null }` without a request when no offer matches; answers `{ outcome: "contract_refused", status: null, body: null }` without a request when the access policy of the offer does not admit the reader; and otherwise sends the GET request with the data plane key and the Business Partner Number of the reader in the two headers of D41 and answers `{ outcome, status, body }` with the outcomes of `pull` of §9.2.5 (`received` for 200, `transport_failed` for a status from 500 to 599, `provider_refused` for every other status) and the status and the body of the answer; `catalogue(reader)` lists the offers that `reader` sees; `registry` is the twin registry of the participant with `put` and `read`. From phase P7 each participant also has `withdrawNotificationAsset()` and `publishNotificationAsset()`, which withdraw and publish the notification asset of the participant through its offer store, so that criterion CAC-012 (notification API) tests the record of a receiver without an asset in both bindings (D74 (The binding contract and criterion CAC-012) [waits for the owner] [waits for the owner]).
- `settle()` makes every due notification of the passports of the calling test file and every pending pull reach its outcome (decision D86, A test file waits only for its own notifications). Each binding registers the passports of its test file: `call(method, path, body)` of each participant adds every value of the fields `passportIdentifier` and `predecessors[].passportIdentifier` of the request body and of the fields `passport.passportIdentifier` and `notifications[].passportIdentifier` of `data` of the answer to one set of the binding, and `settle()` reads only the sent records whose `passportIdentifier` is in the set. A sent record is settled when its outcome is not `pending`, or when it is `pending` with `attempts` of 1 or more and a `notBefore` after the time of the poll, because the sender has made its attempt and plans the retry of D49 [waits for the owner]. Both bindings follow this contract. The in-process binding advances its clock by 6 seconds and awaits `worker.tick()` of the three instances twice. The connector binding polls `EP-NOTIFICATIONS-SENT` of the three servers once per second until every sent record of the registered passports is settled, at most 60 times, and then waits twice the pause `OUTBOX_INTERVAL_MILLISECONDS` of the servers, so that a pending pull of a contract has run; a registered record that is not settled after the 60 polls fails `settle()` with the message `settle: <participant> holds the pending notification <messageId>`. The second run showed that a poll of every sent record of the shared deployment lets one refused notification of one file fail every later file (`tck/README.md`, section "The second run of phase P7", result 2). A sent record means that the receiver has answered, so the poll of the sent records covers the received records of the other servers.
- `tck/lib/inProcessBinding.mjs` calls `createAppRole` and `migrate` through `server/test/support/database.mjs`, with the schema labels `tck<nnn>_provider`, `tck<nnn>_operator` and `tck<nnn>_recycler`, where `<nnn>` is the number of the criterion that the binding reads from the file name `CAC-<nnn>.tck.mjs` in `process.argv[1]` (another file name throws), creates three applications with `createApp` and with the given options in the configuration of each application, one database schema per participant (§14.1), and one memory network: the shared maps of the participants, of the offer stores, of the decentralised identifiers and of the connector addresses. The binding creates one memory receiver resolver over the shared maps, three memory offer stores, three memory twin registries, and one memory transport per participant over the shared maps, each created with the Business Partner Number of its participant, because the transport contract of §9.2.5 names no sender in `send` and no consumer in `pull` (finding R45-020). The binding starts each application as `server/src/index.mjs` starts the server: `loadConfig` of the variables of the participant (the legal name `Example Company <the last four characters of the BPNL>`, the address of the fixture `nameplate.json`, `BINDING=memory`, the log level `error`); `upsertOwnCompany` of `server/src/dataset/companyRepository.mjs`, which the binding imports as the composition step of each application; `createApp`; `publishNotificationAsset()` of the offer publisher; and one HTTP server on the loopback address `127.0.0.1` with a port that the system chooses, which the binding awaits with the event `listening`. The clock of the three applications is one injected clock that starts at `2026-06-15T10:00:00.000Z`, and `settle()` advances the clock. `stop()` stops the three workers, closes the transports and the HTTP servers, ends the three pools and drops the three schemas. The sixteen test files reach the servers only through the binding contract: no test file imports a module of `server/src/` other than through the binding and the scenario, and no test file holds SQL.
- `tck/lib/connectorBinding.mjs` (phase P7, D84 (The connector binding on a started deployment) [waits for the owner] [waits for the owner]) connects to a deployment of `tck/docker-compose.yml` that `docker compose -f tck/docker-compose.yml --env-file tck/.env up -d --wait` has started before the test kit runs; the binding runs no docker command, because the test kit runs in a container of the image `node:24` without a docker command line, attached to the network of the deployment (`docker run --network tck_default`). `tck/lib/binding.mjs` reads the variables of the deployment that the binding needs and passes them to `startConnectorBinding(options, deployment)`: `TCK_OPERATOR_TOKEN_SECRET`, `TCK_EDC_MANAGEMENT_API_KEY`, `TCK_DATA_PLANE_KEY_1`, `TCK_DATA_PLANE_KEY_2`, `TCK_DATA_PLANE_KEY_3`, `TCK_ACCESS_REGIME` and `TCK_PASSPORT_SERVICE_PROVIDER_BPNL`, so that only `binding.mjs` reads `process.env` (§13.1). The three participants are the servers `http://server-1:8080`, `http://server-2:8080` and `http://server-3:8080` with the management APIs `http://cp-1:8081/management`, `http://cp-2:8081/management` and `http://cp-3:8081/management`.
  - **The start.** `startConnectorBinding` checks the deployment and fails with the message `connector binding not available: <participant> <service>: <cause>` when a check fails: `GET /health` of each server answers 200 with `{ "status": "up" }`; `list()` of the connector offer store of each management API resolves; the notification asset of each server is listed; and the options of the test file equal the regime of the deployment (`accessRegime` equal to `TCK_ACCESS_REGIME`, `passportServiceProviderBpnl` equal to `TCK_PASSPORT_SERVICE_PROVIDER_BPNL`). §15 item 7 runs the test kit three times on three deployments: once with the regime `after-act` and without a passport service provider for the fourteen files other than `CAC-009` and `CAC-011`, once with the passport service provider `BPNL00000000TCK6` for `CAC-009`, and once with the regime `before-act` for `CAC-011`.
  - **The data of each file.** The binding restarts no server and empties no table; each test file uses battery models and passports with identifiers of its own, which `unique(prefix)` of `tck/lib/scenario.mjs` builds, as the in-process binding already does, and every assertion reads the records of its own identifiers. `unique(prefix)` returns `<prefix>-<8 lower-case hexadecimal characters>-<a counter of four digits>`, where the eight characters are the first eight characters of `crypto.randomUUID()` drawn once per process, because the process identifier of version 13 repeats between the containers of the test kit, which run one after the other on one deployment.
  - **`call(method, path, body)`** sends an operator request to the server of the participant with a token of `signOperatorToken` and the secret of the deployment.
  - **`catalogue(reader)`** lists the offers of the participant that the reader sees. For a reader that is one of the three participants, the binding sends the catalog request of the reader's connector to the participant's connector and returns the offers of the participant's connector offer store whose asset identifier the catalog lists. For a reader that is a Business Partner Number without a deployment, the binding returns the offers of the participant's offer store whose access list admits the reader.
  - **`asPartner(reader).get(path)`** answers the form of §9.2.9 above. The binding finds the offer of the participant for the path in the participant's connector offer store and answers `no_asset` when the store holds none and `contract_refused` when the access list of the offer does not admit the reader, both without a request, so that the outcome of a test file is the same in both bindings. Otherwise, for a reader that is one of the three participants, the reader's connector negotiates the contract, starts an `HttpData-PULL` transfer and reads the endpoint data reference, and the binding sends the GET request through the participant's data plane with the authorisation of the reference; a negotiation that ends as `TERMINATED` answers `contract_refused`. For a reader without a deployment, the binding sends the GET request to the participant's server with the participant's data plane key and the reader's Business Partner Number in the two headers of D41, as the in-process binding does, because a reader without a deployment has no connector.
  - **`withdrawNotificationAsset()` and `publishNotificationAsset()`** (D74 [waits for the owner]) withdraw and publish the notification asset through the participant's connector offer store with the offer of `buildNotificationAssetOffer`.
  - **`registry`** reads and writes the participant's Digital Twin Registry with `createDtrTwinRegistry`.
  - **`stop()`** ends the binding without a teardown: the data of the test file stays in the deployment, and `docker compose -f tck/docker-compose.yml --env-file tck/.env down -v` after the three runs is a separate step of §15 item 7. **The two methods of the header test.** Each participant of the connector binding also has `openTransfer(provider, assetId)`, which returns an endpoint data reference of the provider's asset through the participant's connector, and `callDataPlane(reference, method, suffix, body, headers)`, which sends a request through the provider data plane with the headers of the caller. The two methods belong to the connector binding only and not to the binding contract of §9.2.9, because the header test runs only on the connector binding; no file `CAC-<nnn>.tck.mjs` calls them.
  - **The header test.** `tck/connectorHeader.test.mjs`, which only §15 item 7 runs, shows that a consumer cannot choose the Business Partner Number that the server receives, with an assertion that the data plane cannot hide (D85 rewrites every refusal into 500). The test creates an original passport of participant 1 through `givenOriginalPassport`, opens a transfer of the notification asset of participant 1 through the connector of participant 2 with `openTransfer`, and posts through the provider data plane with `callDataPlane` a BatteryRepaired message for that passport with `header.senderBpn` equal to `BPNL00000000TCK2` and the header `Edc-Bpn: BPNL00000000TCK6` that the consumer sets itself. The test asserts the answer 200 with the outcome `applied`, which the data plane passes through unchanged, and then asserts through `call` of participant 1 that `EP-NOTIFICATIONS-RECEIVED` holds the message with `senderBpnl` equal to `BPNL00000000TCK2` and that the passport has the status `re-used`. When the header of the consumer reached the server, the fifth check of §10.4 would refuse the message with `ERR-RX-SENDER-MISMATCH`, which the data plane turns into 500, and no received record would exist, so the received record proves the replacement of the header by the consumer's true Business Partner Number.
- `tck/lib/scenario.mjs` exports the fixture builders that the sixteen test files share: `givenBatteryModel(participant, overrides)`, `givenOriginalPassport(participant, overrides)`, `givenStoredPayloads(participant, passportId)`, which stores the ten payloads of `storedPayloads(passport)`, `givenAccessMap(participant, modelId, overrides)` and `givenNewPassport(operator, predecessors, operation, overrides)`. Each builder calls only the endpoints of §9.3. The ten payloads are the four fixtures of `server/test/fixtures/` (`nameplate.json`, `technicalData.json`, `productCondition.json` and `dppMetadata.json`) and six payloads that the scenario builds: one supplied payload of one field for each of the four IDTA-02035 aspects without a stored schema (handover documentation, carbon footprint, material composition and circularity, D28 (Supplied payloads)), a SerialPart payload and a SingleLevelBomAsBuilt payload with the catenaXId of the passport. The access map of the scenario, `accessMapOf(overrides)`, is the fixture `accessMap.json` with one further entry for the field of each of the four supplied payloads. The constant `SEMANTIC_IDS` holds the semantic identifiers of §10.6; the four identifiers of the models IDTA-02035-2, IDTA-02035-3, IDTA-02035-6 and IDTA-02035-7, which §10.6 marks as not verified against a stored text, are copies of the constants of `ASPECTS` of the server, and `tck/CAC-002.tck.mjs` compares them with the descriptors of the twin. The module further exports these helpers and constants: `fixture(name)`, `SUCCESSOR`, `PURCHASER`, `PASSPORT_SERVICE_PROVIDER`, `ORIGINAL_PURPOSE`, `OTHER_PURPOSE`, `USAGE_PURPOSE`, `DATES`, `SEMANTIC_IDS`, `IDTA_02035_KEYS`, `STORED_KEYS`, `unique(prefix)`, `expectData(answer, status)`, `expectRefusal(answer, status, refusalId)`, `storedPayloads(passport)`, `accessMapOf(overrides)`, `newPassportRequest(operator, predecessors, operation, overrides)`, `givenWaste(binding, passport, options)`, `sentOf(participant)`, `receivedOf(participant)`, `passportOf(participant, passportId)` and `submodelPath(passportId, aspectKey)`.

### 9.3 Interfaces

The base path of every endpoint is `/api`. The parameter `:passportId` is `passports.id`, `:modelId` is `battery_models.id` and `:contractId` is `issuer_contracts.id`, each as the 36 characters of a UUID without a prefix, in upper or lower case; the route converts the value to lower case. The parameters `:recordId` of `EP-ACCESS-RECORD-END` and `:id` of `EP-NOTIFICATION-RETRY` are identity values and match `^[1-9][0-9]{0,15}$`. A parameter of another form answers `ERR-LC-BODY-INVALID`. The column "Subject" names the subject kind of §9.2.3 and the capability. The column "After the commit" names the calls that the route makes once the transaction has committed.

| Endpoint id | Method and path | Subject and capability | Request body (§10.2) | Success | After the commit | Route file |
|---|---|---|---|---|---|---|
| `EP-RX-NEW-PASSPORT` | POST `/lifecycle-notifications/NewPassportIssued` | partner, `notification.receive` | the message of §10.1 | 200, `NotificationAccepted` | none | `server/src/routes/lifecycleNotificationRoutes.mjs` |
| `EP-RX-REPAIRED` | POST `/lifecycle-notifications/BatteryRepaired` | partner, `notification.receive` | the message of §10.1 | 200, `NotificationAccepted` | none | `server/src/routes/lifecycleNotificationRoutes.mjs` |
| `EP-RX-WASTE` | POST `/lifecycle-notifications/BatteryBecameWaste` | partner, `notification.receive` | the message of §10.1 | 200, `NotificationAccepted` | `refreshPassportExposure` when the outcome is `applied` | `server/src/routes/lifecycleNotificationRoutes.mjs` |
| `EP-RX-ENDED` | POST `/lifecycle-notifications/PassportEnded` | partner, `notification.receive` | the message of §10.1 | 200, `NotificationAccepted` | when the outcome is `applied`: `withdrawDatasetOffers`, then `refreshPassportExposure` | `server/src/routes/lifecycleNotificationRoutes.mjs` |
| `EP-SUBMODEL` | GET `/passports/:passportId/submodels/:aspectKey/submodel` | partner or operator, `submodel.read` | none | 200, the bare payload | none | `server/src/routes/submodelRoutes.mjs` |
| `EP-ACCESS-MAP` | GET `/battery-models/:modelId/submodels/access-map/submodel` | partner or operator, `submodel.read` | none | 200, the bare payload of section 3.4 of the proposal | none | `server/src/routes/submodelRoutes.mjs` |
| `EP-MODEL-CREATE` | POST `/battery-models` | operator, `passport.create` | `batteryModel` | 201, the model and `exposure` | `refreshModelExposure` | `server/src/routes/batteryModelRoutes.mjs` |
| `EP-MODEL-TWIN` | POST `/battery-models/:modelId/twin` | operator, `passport.create` | none | 200, `exposure` | `refreshModelExposure` | `server/src/routes/batteryModelRoutes.mjs` |
| `EP-ACCESS-MAP-PUT` | PUT `/battery-models/:modelId/access-map` | operator, `access-map.write` | the payload of section 3.4 of the proposal | 201, the stored version and `exposure` | `refreshModelExposure`, then `refreshPassportExposure` for each passport of the model | `server/src/routes/batteryModelRoutes.mjs` |
| `EP-PASSPORT-CREATE` | POST `/passports` | operator, `passport.create` | `createPassport` | 201, the passport and `exposure` | `refreshPassportExposure` | `server/src/routes/passportRoutes.mjs` |
| `EP-ASPECT-PUT` | PUT `/passports/:passportId/aspects/:aspectKey` | operator, `passport.write` | the payload of the aspect | 200, the passport and `exposure` | `refreshPassportExposure` | `server/src/routes/passportRoutes.mjs` |
| `EP-ISSUE-NEW-PASSPORT` | POST `/passports/new-passport` | operator, `passport.issue` | `issueNewPassport` | 201, the new passport, `exposure` and `notifications` | `refreshPassportExposure` | `server/src/routes/passportRoutes.mjs` |
| `EP-TWIN` | POST `/passports/:passportId/twin` | operator, `passport.write` | none | 200, `exposure` | `refreshPassportExposure` | `server/src/routes/passportRoutes.mjs` |
| `EP-FORWARD-LINK` | POST `/passports/:passportId/forward-links` | operator, `passport.write` | `forwardLink` | 201, the successor link and `exposure` | `refreshPassportExposure` | `server/src/routes/passportRoutes.mjs` |
| `EP-ACCESS-RECORD` | POST `/passports/:passportId/access-records` | operator, `passport.write` | `accessRecord` | 201, the record and `exposure`; a second open record of the same recipient, aspect key and role answers `ERR-LC-RECORD-EXISTS` | `refreshPassportExposure` | `server/src/routes/passportRoutes.mjs` |
| `EP-ACCESS-RECORD-END` | DELETE `/passports/:passportId/access-records/:recordId` | operator, `passport.write` | none | 200, the closed record and `exposure`; an unknown `:recordId` answers `ERR-LC-RECORD-NOT-FOUND`, and a record that is already closed answers `ERR-LC-STATUS-NOT-ADMITTED` | `refreshPassportExposure` | `server/src/routes/passportRoutes.mjs` |
| `EP-PURCHASER` | POST `/passports/:passportId/purchaser` | operator, `passport.write` | `purchaserChange` | 200, the closed and the opened records and `exposure` | `refreshPassportExposure` | `server/src/routes/passportRoutes.mjs` |
| `EP-SUCCESSOR-AUTHORISATION` | POST `/passports/:passportId/successor-authorisation` | operator, `passport.write` | `successorAuthorisation` | 200, the passport | none | `server/src/routes/passportRoutes.mjs` |
| `EP-PASSPORT-READ` | GET `/passports/:passportId` | operator, `passport.write` | none | 200, the passport record of §10.2 | none | `server/src/routes/passportRoutes.mjs` |
| `EP-REPORT-REPAIR` | POST `/lifecycle-events/repair` | operator, `lifecycle.report` | `reportRepair` | 202, `notifications` | none | `server/src/routes/lifecycleEventRoutes.mjs` |
| `EP-REPORT-WASTE` | POST `/lifecycle-events/waste` | operator, `lifecycle.report` | `reportWaste` | 202, `notifications` | `refreshPassportExposure` after a local application | `server/src/routes/lifecycleEventRoutes.mjs` |
| `EP-REPORT-RECYCLING` | POST `/lifecycle-events/recycling` | operator, `lifecycle.report` | `reportRecycling` | 202, `notifications` | after a local application: `withdrawDatasetOffers`, then `refreshPassportExposure` | `server/src/routes/lifecycleEventRoutes.mjs` |
| `EP-NOTIFICATIONS-SENT` | GET `/notifications/sent` | operator, `notification.read` | none | 200, the list of the sent records in the order of `id` | none | `server/src/routes/notificationRecordRoutes.mjs` |
| `EP-NOTIFICATIONS-RECEIVED` | GET `/notifications/received` | operator, `notification.read` | none | 200, the list of the received records in the order of `received_at` | none | `server/src/routes/notificationRecordRoutes.mjs` |
| `EP-NOTIFICATION-RETRY` | POST `/notifications/sent/:id/retry` | operator, `lifecycle.report` | none | 200, the record with the outcome `pending`; a record whose outcome is not `transport_failed` or `receiver_unresolved` answers `ERR-LC-STATUS-NOT-ADMITTED`; an unknown `:id` answers `ERR-LC-RECORD-NOT-FOUND` | none | `server/src/routes/notificationRecordRoutes.mjs` |
| `EP-PROVIDER-CONTRACT` | POST `/issuer-contracts/provider` | operator, `battery-information.share` | `issuerContract`, the provider form | 201, the contract | publishes the battery information offer | `server/src/routes/issuerContractRoutes.mjs` |
| `EP-ISSUER-CONTRACT` | POST `/issuer-contracts/issuer` | operator, `battery-information.share` | `issuerContract`, the issuer form | 201, the contract with the pull state `pending` | none; the worker pulls | `server/src/routes/issuerContractRoutes.mjs` |
| `EP-CONTRACT-END` | DELETE `/issuer-contracts/:contractId` | operator, `battery-information.share` | none | 200, the ended contract | withdraws the offer of a provider contract | `server/src/routes/issuerContractRoutes.mjs` |
| `EP-CONTRACT-PULL` | POST `/issuer-contracts/:contractId/pulls` | operator, `battery-information.share` | none | 202, the issuer contract with the pull state `pending`; `ERR-LC-CONTRACT-ENDED` for an ended contract | none; the worker pulls | `server/src/routes/issuerContractRoutes.mjs` |
| `EP-RECEIVED-INFORMATION` | GET `/issuer-contracts/:contractId/received` | operator, `battery-information.share` | none | 200, the contract and the list of the received records | none | `server/src/routes/issuerContractRoutes.mjs` |
| `EP-BATTERY-INFORMATION` | GET `/issuer-contracts/:contractId/battery-information` | partner, `submodel.read` | none | 200, the bare payload of the aspect key `product-condition` | none | `server/src/routes/issuerContractRoutes.mjs` |
| `EP-HEALTH` | GET `/health` (outside `/api`) | none | none | 200, `{ "status": "up" }` when `checkHealth` resolves to `true`; 503, `{ "status": "down" }` otherwise | none | `server/src/routes/healthRoutes.mjs` |

- **The body parser.** `createApp` mounts `express.json({ limit: "1mb", type: "application/json" })` before the routes. A request with a body and with a content type other than `application/json`, and a body that is not valid JSON, answers `ERR-RX-CONTENT-INVALID` on a receiving endpoint and `ERR-LC-BODY-INVALID` on an operator endpoint. A body above the limit answers `ERR-RX-BODY-TOO-LARGE` on a receiving endpoint and `ERR-LC-BODY-TOO-LARGE` on an operator endpoint. `server/src/routes/errorHandler.mjs` maps the errors of the parser by their property `type` and never passes the answer of the parser to the caller: `entity.too.large` answers the refusal of a body above the limit, and `entity.parse.failed`, `charset.unsupported`, `encoding.unsupported` and every other error of the parser whose property `status` lies from 400 to 499 answer `ERR-RX-CONTENT-INVALID` on a receiving endpoint and `ERR-LC-BODY-INVALID` on an operator endpoint (finding R45-011). On a receiving endpoint the handler answers `ERR-RX-INTERNAL` for every refusal of the class 5xx, an `ERR-LC-INTERNAL` included.
- **An unknown path** (finding R45-012). After the routes and before the error handler, `createApp` mounts one handler for every method and every path that no route answers: a path below `/api/lifecycle-notifications` answers `ERR-RX-OPERATION-UNKNOWN`, and every other path answers `ERR-LC-PATH-UNKNOWN`, each with the error body of D9 (The error body) and without an authentication, because the answer names no data. Section 4.3 item 7 of the proposal requires a body that states what failed, the reason and what the sender must do.
- **The body of a payload.** `EP-ASPECT-PUT` and `EP-ACCESS-MAP-PUT` refuse `ERR-LC-BODY-INVALID` for a body that is not a JSON object (an absent body, `null`, a list, a number, a text or a boolean) before the service runs, for every aspect key (finding R45-008).
- **The order on every route.** Every route except `EP-HEALTH` runs `authenticate`, then `requireCapability`, then the normalisation of every identifier of the request with `normaliseUuid` or `normaliseMessage` (§9.2.1), then the body validation of `server/src/validation/schemaValidator.mjs`, then `runWrite` or `runRead` of `server/src/routes/runWrite.mjs`, then the calls of the column "After the commit", then the response. A receiving endpoint validates the received message first and normalises the validated message second, because the schemas admit every form. `runWrite(req, work)` calls `withTransaction` once with `config.ownBpnl` and the current UTC date, calls `audit.record` with the entries of the result after the commit or with the entries of the thrown refusal after the rollback, and rethrows the refusal; `audit.record` never throws (§9.2.7). `afterCommit(req, fields, work, kind)` runs one call of the column "After the commit", logs a failure, and resolves to `{ refreshed: true }` or `{ refreshed: false, cause }` with a fixed text of §9.2.5. The parameter `kind` names the dependency of the call (`offerStore`, `registry` or `call`, the default) and selects the fixed text of the cause. `runRead(req, work)` calls `withTransaction` once and writes no audit record.
- **The success bodies.** An operator endpoint answers `{ "success": true, "data": { ... } }`. `EP-SUBMODEL`, `EP-ACCESS-MAP` and `EP-BATTERY-INFORMATION` answer the bare payload (decision Q-409 (whether served aspect payloads skip the response envelope)). A receiving endpoint answers the body of `NotificationAccepted`: `{ "messageId": "<the messageId of the header>", "outcome": "applied" | "recorded" | "duplicate" }`.
- **The fields inside `data`** (decision D71, The fields of the operator answers as built). The operator endpoints answer these fields inside `data`, as the code of phases P4 and P5 builds them, and phase P6 freezes the names:

| Endpoint id | Status | Fields of `data` |
|---|---|---|
| `EP-MODEL-CREATE` | 201 | `model`, `exposure` |
| `EP-MODEL-TWIN` | 200 | `exposure` |
| `EP-ACCESS-MAP-PUT` | 201 | `id` (the identity of the stored version), `accessMap` (the payload of section 3.4 of the proposal), `exposure` (the first failed refresh of the model and of its passports, or `{ "refreshed": true }`) |
| `EP-PASSPORT-CREATE` | 201 | `passport`, `exposure` |
| `EP-ASPECT-PUT` | 200 | `passport`, `exposure` |
| `EP-ISSUE-NEW-PASSPORT` | 201 | `passport`, `exposure`, `notifications` |
| `EP-TWIN` | 200 | `exposure` |
| `EP-FORWARD-LINK` | 201 | `link`, `exposure` |
| `EP-ACCESS-RECORD` | 201 | `record`, `exposure` |
| `EP-ACCESS-RECORD-END` | 200 | `record`, `exposure` |
| `EP-PURCHASER` | 200 | `closed` (a list of records), `opened` (a list of records), `exposure` |
| `EP-SUCCESSOR-AUTHORISATION` | 200 | `passport` |
| `EP-PASSPORT-READ` | 200 | `passport` |
| `EP-REPORT-REPAIR`, `EP-REPORT-WASTE`, `EP-REPORT-RECYCLING` | 202 | `notifications` |
| `EP-NOTIFICATIONS-SENT` | 200 | `notifications`, a list of sent records |
| `EP-NOTIFICATIONS-RECEIVED` | 200 | `notifications`, a list of received records |
| `EP-NOTIFICATION-RETRY` | 200 | `notification`, one sent record |
| `EP-PROVIDER-CONTRACT`, `EP-ISSUER-CONTRACT`, `EP-CONTRACT-END` | 201, 201, 200 | `contract` [waits for the owner: D73 (The exposure of a battery information offer) [waits for the owner] adds `exposure` to the first and the third endpoint] |
| `EP-CONTRACT-PULL` | 202 | `contract` |
| `EP-RECEIVED-INFORMATION` | 200 | `contract`, `received` (a list of received records) |

  The records hold these fields. `model`: `id`, `catenaXId`, `manufacturerBpnl`, `manufacturerPartId`, `originalModel` (`null`, or `{ catenaXId, manufacturerBpnl }`). `passport`: the passport record of §10.2. `link`: `id`, `passportId`, `successorPassportIdentifier`, `successorCatenaXId`, `secondLifeOperatorBpnl`, `operation`, `operationDate`, `notificationMessageId`. An access `record`: `id`, `passportId`, `recipientBpnl`, `recipientRole`, `aspectKey`, `validFrom`, `validTo`. A sent record: the seven fields of the field `notifications` below and `cause`, `httpStatus`, `attempts`, `attemptedAt`, `receiverDid`, `receiverConnectorUrl`, `message`. A received record: `messageId`, `operation`, `senderBpnl`, `passportIdentifier`, `outcome`, `receivedAt`, `message`. `contract`: `id`, `side`, `passportIdentifier`, `batteryIdentifier`, `passportId`, `issuerBpnl`, `providerBpnl`, `pullState`, `pullCause`, `validFrom`, `validTo`. A record of `received`: `id`, `passportIdentifier`, `batteryIdentifier`, `agreementId`, `receivedAt`, `payload`. Every time is the ISO 8601 text of a `Date` in UTC, and every date of a column of the type `date` is the text `YYYY-MM-DD`. The owner decided on 2026-11-19 that §9.3 records these names (D71).
- **The field `notifications`.** The field lists one object `{ id, messageId, operation, receiverBpnl, passportIdentifier, outcome, notBefore }` per planned notification, with the outcome `pending`, and the field holds an empty list when the plan is empty.
- **The field `exposure`.** The field holds the result of the call of the column "After the commit": `{ "refreshed": true }` or `{ "refreshed": false, "cause": "<text>" }`. A failed refresh does not change the status of the response, because the stored step stands, and `EP-TWIN` or `EP-MODEL-TWIN` repeats the refresh (D23). A receiving endpoint does not report the result to the sender.
- **The methods.** A receiving endpoint accepts POST only, and every other method on its path answers 405 with `ERR-RX-METHOD-NOT-ALLOWED`.
- **The submodel paths.** The stored Industry Core KIT text requires the suffix `/submodel` on the address of a submodel `[live]`. `EP-SUBMODEL` and `EP-ACCESS-MAP` also answer the same payload on the path with the further suffix `/$value`; the meaning of that suffix in CX-0002 (Digital Twins in Catena-X) is not verified against a stored text.
- **The paths of the OpenAPI file.** `docs/api/openAPI.yaml` declares the server address `{baseUrl}/api/lifecycle-notifications` and the four paths `/NewPassportIssued`, `/BatteryRepaired`, `/BatteryBecameWaste` and `/PassportEnded`, each with the `operationId` equal to the operation name, and the API version `1.0.0` only in `info.version`. The operator endpoints are not part of the OpenAPI file (decision D26, The OpenAPI file holds four operations).

### 9.4 Database

One deployment serves one company, and one database schema holds the passports of which that company is the data provider. The schema holds 17 tables (decision D42, A database of 17 tables), the table `audit_outbox` of the fourth migration file (D69) and the table `schema_migrations` of `migrate`. The four migration files hold exactly the objects of §9.4.1, §9.4.2, §9.4.3 and §9.4.4, and the implementer writes no further table, column, index, trigger, policy or grant. No statement of the three files names a schema, because `migrate` sets the search path; the last statement of `002_triggers.sql` reads the name of the schema at the run and fixes the search path of every function (D60). §22 prints the three files in full, and the implementer copies them (decision D58, Normative annexes). PostgreSQL 17 needs no extension for the three files. Each of the three files ends with the `DO` block that fixes the search path of every function of the schema (§9.4.2).

#### 9.4.1 The file `001_schema.sql`

The file first creates four domains with named constraints: `bpnl AS text CONSTRAINT bpnl_check CHECK (VALUE ~ '^BPNL[a-zA-Z0-9]{12}$')`, `bpns AS text CONSTRAINT bpns_check CHECK (VALUE ~ '^BPNS[a-zA-Z0-9]{12}$')`, `finite_timestamptz AS timestamptz CONSTRAINT finite_timestamptz_check CHECK (isfinite(VALUE))` and `finite_date AS date CONSTRAINT finite_date_check CHECK (isfinite(VALUE))`. Every column of the 17 tables that holds a date and time is of the domain `finite_timestamptz`, and every column that holds a date is of the domain `finite_date`, so the values `infinity` and `-infinity` are refused in every such column with the SQLSTATE `23514` (decision D68, Finite dates and no NaN). PostgreSQL reports the base type of a domain to a client, so the type parsers of `createPool` read the columns as the types `timestamptz` and `date` (observed on 2026-11-16: the type identifiers 1184 and 1082). The file then creates the tables in the order of the table below. Every table has, as its last column, `created_at finite_timestamptz NOT NULL DEFAULT now()`. Every constraint carries the name of the table below, because `server/src/routes/errorHandler.mjs` maps a violation by the constraint name (§9.5). The abbreviation PK means primary key and FK means foreign key. Every foreign key is `ON DELETE RESTRICT` and has no `ON UPDATE` action. A column that the table marks NOT NULL holds no default unless the table names one.

| Group | Table | Columns in the order of the definition, then the table constraints and the indexes |
|---|---|---|
| companies | `companies` | `bpnl bpnl` PK `companies_pkey`; `legal_name text NOT NULL` with CHECK `companies_legal_name_check` (`length(legal_name) BETWEEN 1 AND 300`); `legal_name_language text NOT NULL DEFAULT 'en'`; `address jsonb NOT NULL`; `operator_identifier text` |
| passports | `battery_models` | `id uuid` PK `battery_models_pkey` `DEFAULT gen_random_uuid()` (the `catenaXId` of the PartType twin); `manufacturer_bpnl bpnl NOT NULL` FK `battery_models_manufacturer_fkey` to `companies(bpnl)`; `manufacturer_part_id text NOT NULL` with CHECK `battery_models_part_id_check` (`length(manufacturer_part_id) BETWEEN 1 AND 200`); `original_model_catena_x_id uuid`; `original_model_manufacturer_bpnl bpnl`; CHECK `battery_models_original_check` (`(original_model_catena_x_id IS NULL) = (original_model_manufacturer_bpnl IS NULL)`); UNIQUE `battery_models_manufacturer_part_key (manufacturer_bpnl, manufacturer_part_id)`; UNIQUE `battery_models_id_manufacturer_key (id, manufacturer_bpnl)`, which the foreign key of `passports` references (decision D63, References across the bound of a company) |
| passports | `passports` | `id uuid` PK `passports_pkey` `DEFAULT gen_random_uuid()` (the `catenaXId` of the PartInstance twin); `passport_identifier text NOT NULL DEFAULT ('urn:uuid:' \|\| gen_random_uuid()::text)` with UNIQUE `passports_passport_identifier_key` and with CHECK `passports_passport_identifier_check` (`length(passport_identifier) BETWEEN 1 AND 200`, the bound of the schemas `createPassport` and `issueNewPassport` of §10.2); `battery_identifier text NOT NULL` with CHECK `passports_battery_identifier_check` (`length(battery_identifier) BETWEEN 1 AND 200`); `manufacturer_bpnl bpnl NOT NULL` FK `passports_manufacturer_fkey` to `companies(bpnl)`; `battery_model_id uuid NOT NULL`; FK `passports_battery_model_fkey` of the two columns `(battery_model_id, manufacturer_bpnl)` to `battery_models(id, manufacturer_bpnl)`, so that a passport references a battery model of its own manufacturer (D63); `lifecycle_status text NOT NULL` with CHECK `passports_lifecycle_status_check` (`lifecycle_status IN ('original','repurposed','re-used','remanufactured','waste')`); `battery_category text NOT NULL` with CHECK `passports_battery_category_check` (`battery_category IN ('lmt','ev','industrial','stationary')`); `facility_bpns bpns NOT NULL`; `date_of_manufacture finite_date NOT NULL`; `date_into_service finite_date`; `rated_capacity_ah numeric(10,2)` with CHECK `passports_rated_capacity_check` (`rated_capacity_ah > 0 AND rated_capacity_ah <> 'NaN'`); `capacity_fade_percent numeric(5,2)` with CHECK `passports_capacity_fade_check` (`capacity_fade_percent BETWEEN 0 AND 100`); `power_fade_percent numeric(5,2)` with CHECK `passports_power_fade_check` (`power_fade_percent BETWEEN 0 AND 100`); `expected_lifetime_years numeric(4,1)` with CHECK `passports_expected_lifetime_check` (`expected_lifetime_years > 0 AND expected_lifetime_years <> 'NaN'`); `waste_successor_bpnl bpnl`; `waste_successor_role text` with CHECK `passports_waste_successor_role_check` (`waste_successor_role IN ('producer','producerResponsibilityOrganisation','wasteManagementOperator')`); `waste_date finite_timestamptz`; `successor_authorisation_ref text` with CHECK `passports_authorisation_ref_check` (`length(successor_authorisation_ref) BETWEEN 1 AND 500`); `successor_authorisation_valid_from finite_date`; `successor_authorisation_valid_to finite_date`; `recycling_date finite_timestamptz`; `recycler_bpnl bpnl`; `material_recycling_certificate_catena_x_id uuid`; `lineage_open boolean NOT NULL DEFAULT false` (true only between the insertion of a new passport and the closing statement of the same transaction; D54); CHECK `passports_waste_successor_check` (`(lifecycle_status = 'waste') = (waste_successor_bpnl IS NOT NULL) AND (waste_successor_bpnl IS NULL) = (waste_successor_role IS NULL) AND (waste_successor_bpnl IS NULL) = (waste_date IS NULL)`); CHECK `passports_authorisation_check` (`(successor_authorisation_ref IS NULL) = (successor_authorisation_valid_from IS NULL) AND (successor_authorisation_valid_to IS NULL OR successor_authorisation_ref IS NOT NULL) AND (successor_authorisation_valid_to IS NULL OR successor_authorisation_valid_to >= successor_authorisation_valid_from) AND (successor_authorisation_ref IS NULL OR lifecycle_status = 'waste')`); CHECK `passports_end_check` (`(recycling_date IS NULL) = (recycler_bpnl IS NULL) AND (material_recycling_certificate_catena_x_id IS NULL OR recycling_date IS NOT NULL)`); CHECK `passports_end_after_waste_check` (`recycling_date IS NULL OR waste_date IS NULL OR recycling_date >= waste_date`); index `passports_battery_identifier_idx (battery_identifier)`; index `passports_battery_model_idx (battery_model_id)` |
| passports | `passport_purposes` | `id bigint GENERATED ALWAYS AS IDENTITY` PK `passport_purposes_pkey`; `passport_id uuid NOT NULL` FK `passport_purposes_passport_fkey` to `passports(id)`; `purpose text NOT NULL` with CHECK `passport_purposes_purpose_check` (`length(purpose) BETWEEN 1 AND 2000`); `is_original boolean NOT NULL`; `recorded_at finite_timestamptz NOT NULL`; unique index `passport_purposes_original_key (passport_id) WHERE is_original`; index `passport_purposes_passport_idx (passport_id)` |
| passports | `passport_aspect_payloads` | `passport_id uuid NOT NULL` FK `passport_aspect_payloads_passport_fkey` to `passports(id)`; `aspect_key text NOT NULL` with CHECK `passport_aspect_payloads_key_check` (`aspect_key IN ('digital-nameplate','handover-documentation','carbon-footprint','technical-data','product-condition','material-composition','circularity','dpp-metadata','serial-part','single-level-bom-as-built')`); `payload jsonb NOT NULL`; `updated_at finite_timestamptz NOT NULL DEFAULT now()`; PK `passport_aspect_payloads_pkey (passport_id, aspect_key)` |
| notifications sent and received | `notifications_received` | `message_id text` PK `notifications_received_pkey`; `operation text NOT NULL` with CHECK `notifications_received_operation_check` (`operation IN ('NewPassportIssued','BatteryRepaired','BatteryBecameWaste','PassportEnded')`); `sender_bpnl bpnl NOT NULL`; `passport_identifier text NOT NULL`; `message jsonb NOT NULL`; `outcome text NOT NULL` with CHECK `notifications_received_outcome_check` (`outcome IN ('applied','recorded')`); `received_at finite_timestamptz NOT NULL`; index `notifications_received_passport_idx (passport_identifier, operation)` |
| notifications sent and received | `notifications_sent` | `id bigint GENERATED ALWAYS AS IDENTITY` PK `notifications_sent_pkey`; `message_id text NOT NULL` with UNIQUE `notifications_sent_message_id_key`; `operation text NOT NULL` with CHECK `notifications_sent_operation_check` (the four operation names); `receiver_bpnl bpnl NOT NULL`; `passport_identifier text NOT NULL`; `message jsonb NOT NULL`; `not_before finite_timestamptz NOT NULL`; `outcome text NOT NULL DEFAULT 'pending'` with CHECK `notifications_sent_outcome_check` (`outcome IN ('pending','sent','no_asset','contract_refused','receiver_refused','receiver_unresolved','transport_failed')`); `cause text`; `http_status integer`; `attempts integer NOT NULL DEFAULT 0`; `attempted_at finite_timestamptz`; `receiver_did text`; `receiver_connector_url text`; index `notifications_sent_due_idx (not_before, id) WHERE outcome = 'pending'` |
| lineage links | `passport_lineage_links` | `id bigint GENERATED ALWAYS AS IDENTITY` PK `passport_lineage_links_pkey`; `passport_id uuid NOT NULL` FK `passport_lineage_links_passport_fkey` to `passports(id)` (the new passport); `predecessor_passport_identifier text NOT NULL`; `predecessor_catena_x_id uuid NOT NULL`; `predecessor_data_provider_bpnl bpnl NOT NULL`; `predecessor_battery_identifier text NOT NULL`; `predecessor_status text NOT NULL` with CHECK `passport_lineage_links_status_check` (the five status values); `predecessor_original_model_catena_x_id uuid NOT NULL`; `operation text NOT NULL` with CHECK `passport_lineage_links_operation_check` (`operation IN ('preparationForReUse','preparationForRepurposing','repurposing','remanufacturing')`); `operation_date finite_timestamptz NOT NULL`; UNIQUE `passport_lineage_links_predecessor_key (passport_id, predecessor_passport_identifier)` |
| lineage links | `passport_successor_links` | `id bigint GENERATED ALWAYS AS IDENTITY` PK `passport_successor_links_pkey`; `passport_id uuid NOT NULL` FK `passport_successor_links_passport_fkey` to `passports(id)` (the original passport); `successor_passport_identifier text NOT NULL`; `successor_catena_x_id uuid NOT NULL`; `second_life_operator_bpnl bpnl NOT NULL`; `operation text NOT NULL` with CHECK `passport_successor_links_operation_check` (the four lineage operations); `operation_date finite_timestamptz NOT NULL`; `notification_message_id text NOT NULL` FK `passport_successor_links_notification_fkey` to `notifications_received(message_id)`; UNIQUE `passport_successor_links_successor_key (passport_id, successor_passport_identifier)` |
| repair entries | `passport_repair_entries` | `id bigint GENERATED ALWAYS AS IDENTITY` PK `passport_repair_entries_pkey`; `passport_id uuid NOT NULL` FK `passport_repair_entries_passport_fkey` to `passports(id)`; `repair_date finite_timestamptz NOT NULL`; `repair_certificate_catena_x_id uuid NOT NULL`; `repairer_bpnl bpnl NOT NULL`; `notification_message_id text` FK `passport_repair_entries_notification_fkey` to `notifications_received(message_id)` (null for a local application); UNIQUE `passport_repair_entries_certificate_key (passport_id, repair_certificate_catena_x_id)` |
| responsibility timeline | `passport_responsibility_intervals` | `id bigint GENERATED ALWAYS AS IDENTITY` PK `passport_responsibility_intervals_pkey`; `passport_id uuid NOT NULL` FK `passport_responsibility_intervals_passport_fkey` to `passports(id)`; `responsible_bpnl bpnl NOT NULL`; `role text NOT NULL` with CHECK `passport_responsibility_intervals_role_check` (`role IN ('economicOperator','producer','producerResponsibilityOrganisation','wasteManagementOperator')`); `valid_from finite_timestamptz NOT NULL`; `valid_to finite_timestamptz` with CHECK `passport_responsibility_intervals_period_check` (`valid_to >= valid_from`); unique index `passport_responsibility_intervals_open_key (passport_id) WHERE valid_to IS NULL` |
| access map | `access_map_versions` | `id bigint GENERATED ALWAYS AS IDENTITY` PK `access_map_versions_pkey`; `battery_model_id uuid NOT NULL` FK `access_map_versions_model_fkey` to `battery_models(id)`; `map_version text NOT NULL`; `valid_from finite_date NOT NULL`; UNIQUE `access_map_versions_model_version_key (battery_model_id, map_version)` |
| access map | `access_map_entries` | `map_id bigint NOT NULL` FK `access_map_entries_map_fkey` to `access_map_versions(id)`; `aspect text NOT NULL`; `twin_level text NOT NULL` with CHECK `access_map_entries_twin_level_check` (`twin_level IN ('PartType','PartInstance')`); `path text NOT NULL`; `access_group text NOT NULL` with CHECK `access_map_entries_group_check` (`access_group IN ('public','legitimateInterestModel','authorities','legitimateInterestBattery')`); `legal_basis text NOT NULL`; PK `access_map_entries_pkey (map_id, aspect, twin_level, path)` |
| access map | `passport_access_records` | `id bigint GENERATED ALWAYS AS IDENTITY` PK `passport_access_records_pkey`; `passport_id uuid NOT NULL` FK `passport_access_records_passport_fkey` to `passports(id)`; `recipient_bpnl bpnl NOT NULL`; `recipient_role text NOT NULL` with CHECK `passport_access_records_role_check` (`recipient_role IN ('purchaser','purchaserAgent','responsibleOperator','successor','marketSurveillanceAuthority','authorisedRecipient')`); `aspect_key text NOT NULL` with CHECK `passport_access_records_key_check` (the ten stored aspect keys, `lifecycle` and `successors`); `valid_from finite_timestamptz NOT NULL`; `valid_to finite_timestamptz` with CHECK `passport_access_records_period_check` (`valid_to >= valid_from`); unique index `passport_access_records_open_key (passport_id, recipient_bpnl, aspect_key, recipient_role) WHERE valid_to IS NULL` |
| audit record | `passport_write_decisions` | `id bigint GENERATED ALWAYS AS IDENTITY` PK `passport_write_decisions_pkey`; `decided_at finite_timestamptz NOT NULL`; `decision text NOT NULL` with CHECK `passport_write_decisions_decision_check` (`decision IN ('granted','refused')`); `requester_bpnl bpnl NOT NULL`; `requester_kind text NOT NULL` with CHECK `passport_write_decisions_kind_check` (`requester_kind IN ('operator','partner')`); `passport_id uuid` (no foreign key, because a refused request can name a passport that the table does not hold); `action text NOT NULL`; `relied_on text`; `refusal_id text`; `details jsonb`; index `passport_write_decisions_passport_idx (passport_id)` |
| issuer contracts | `issuer_contracts` | `id uuid` PK `issuer_contracts_pkey` `DEFAULT gen_random_uuid()`; `side text NOT NULL` with CHECK `issuer_contracts_side_check` (`side IN ('provider','issuer')`); `passport_identifier text NOT NULL`; `battery_identifier text`; `passport_id uuid` FK `issuer_contracts_passport_fkey` to `passports(id)`; `issuer_bpnl bpnl NOT NULL`; `provider_bpnl bpnl NOT NULL`; `product_condition jsonb`; `pull_state text` with CHECK `issuer_contracts_pull_state_check` (`pull_state IN ('pending','received','no_asset','contract_refused','provider_refused','receiver_unresolved','transport_failed')`); `pull_cause text`; `valid_from finite_timestamptz NOT NULL`; `valid_to finite_timestamptz`; CHECK `issuer_contracts_side_columns_check` (`(side = 'issuer') = (pull_state IS NOT NULL) AND (side = 'provider' OR (passport_id IS NULL AND product_condition IS NULL AND battery_identifier IS NOT NULL)) AND (side = 'issuer' OR ((passport_id IS NULL) <> (product_condition IS NULL)))`); unique index `issuer_contracts_open_key (side, passport_identifier, issuer_bpnl, provider_bpnl) WHERE valid_to IS NULL` |
| received battery information | `received_battery_information` | `id bigint GENERATED ALWAYS AS IDENTITY` PK `received_battery_information_pkey`; `contract_id uuid NOT NULL` FK `received_battery_information_contract_fkey` to `issuer_contracts(id)`; `passport_identifier text NOT NULL`; `battery_identifier text NOT NULL`; `agreement_id text NOT NULL`; `payload jsonb NOT NULL`; `received_at finite_timestamptz NOT NULL` |

The value `NaN` of the type `numeric` is refused in each of the four numeric columns of the schema: the two constraints of the fade columns refuse the value through their range, and the two constraints above name the value (D68). The grain of the four performance values `rated_capacity_ah` (Ah), `capacity_fade_percent` (%), `power_fade_percent` (%) and `expected_lifetime_years` (calendar years) is one value per passport. The four values and the date of putting into service are set on every passport that has a lineage link: the deferred check of the insertion requires the five values, and the trigger `trg_passport_identity` refuses an update that removes one of the five values from a passport with a lineage link. The rule exists because DIN DKE SPEC 99100 clauses 6.7.2.2 e), 6.7.2.4, 6.7.3.4 and 6.7.6.2 d) require the update at a new placing on the market (section 2.1.1 item 6 of the proposal), and the four values are never taken from another passport (decision D15, The own values of a new passport). The columns `id` of `passports` and of `battery_models`, and every column whose name ends with `_catena_x_id`, hold the 36 characters of the UUID in lower case; §9.2.1 states the conversion to and from the served form (D50).

#### 9.4.2 The file `002_triggers.sql`

The file creates sixteen functions in the language `plpgsql`, each `SECURITY INVOKER`, and thirty-seven triggers; §22 prints the file. Fourteen functions are trigger functions, and the two functions `require_read_committed()` and `app_today()` are helpers. Every refusal of a rule is the statement `RAISE EXCEPTION '<refusal id>: <sentence>' USING ERRCODE = 'P0001'`, the error class "PL/pgSQL error" with the code `raise_exception`, and the sentence of each refusal is the sentence of §22. The one other error code of the file is `22007` of `app_today()`. Every trigger is `FOR EACH ROW`. A constraint trigger is `CREATE CONSTRAINT TRIGGER ... AFTER ... DEFERRABLE INITIALLY DEFERRED FOR EACH ROW` and runs at the commit. A function of a BEFORE trigger returns `NEW`, or `OLD` for a deletion that the function admits, and a function of a constraint trigger returns `NULL`. A function that serves two tables reads the passport id by `TG_TABLE_NAME` or by `TG_OP`, as §22 shows. A function that compares "every column other than" a list compares `to_jsonb(NEW)` and `to_jsonb(OLD)` after the removal of the listed keys.

**The fixed search path (D60).** The last statement of the file, and of each of the two other files, is one `DO` block that runs, for every function of the schema of the migration, `ALTER FUNCTION <function> SET search_path = <schema>, pg_temp`, where `<schema>` is the value of `current_schema()` at the run. Inside a function PostgreSQL therefore resolves the names of the tables in the schema of the migration first and in the temporary schema of the session last, so a temporary table of a session never replaces a table inside a function. The catalogue column `pg_proc.proconfig` of each of the sixteen functions holds the value `search_path=<schema>, pg_temp`, and `proconfig` of `app_today()` also holds `DateStyle=ISO, YMD`.

**The isolation level (D66).** The first statement of each of the fourteen trigger functions is `PERFORM require_read_committed();`. The helper raises `ERR-DB-ISOLATION` unless `current_setting('transaction_isolation')` is `read committed`. A function that reads another row of the database, and a deferred check at the commit, therefore always reads the committed state of the database and never the snapshot of a transaction of the level REPEATABLE READ or SERIALIZABLE, in which a change of another transaction stays invisible. A transaction of another level reads every table and writes no table that has a trigger. The four tables without a trigger (`companies`, `notifications_sent`, `access_map_versions` and `access_map_entries`) hold no rule that reads another row.

| Function | Triggers (name: table, event) | Rule | Refusal id |
|---|---|---|---|
| `require_read_committed()` | none; each trigger function calls the function first | raises unless the isolation level of the transaction is READ COMMITTED (D66) | `ERR-DB-ISOLATION` |
| `app_today()` | none; `check_passport_after_waste()` and `check_child_after_waste()` call the function | returns the date of the transaction setting `app.today`. An absent setting and an empty setting, which a pooled connection holds after an earlier transaction, return null. A setting that does not match the regular expression `^[0-9]{4}-[0-9]{2}-[0-9]{2}$` raises the SQLSTATE `22007`. The function then casts the text to the type `date` with the setting `DateStyle = 'ISO, YMD'`, which the function carries as its own setting, so a session setting of `DateStyle` changes nothing, and a text that names no calendar date raises the SQLSTATE `22007`: the month 00, the day 00, the year 0000, the month 13 and 30 February are refused. The accepted range is 0001-01-01 to 9999-12-31. The words `today`, `tomorrow`, `yesterday`, `epoch` and `infinity` fail the regular expression. The function never reads `current_date` | `ERR-DB-TODAY` with the SQLSTATE `22007` |
| `refuse_passport_id_change()` | nine triggers BEFORE UPDATE, each named after its table: `trg_fixed_passport_passport_purposes`, `trg_fixed_passport_passport_aspect_payloads`, `trg_fixed_passport_passport_lineage_links`, `trg_fixed_passport_passport_successor_links`, `trg_fixed_passport_passport_repair_entries`, `trg_fixed_passport_passport_responsibility_intervals`, `trg_fixed_passport_passport_access_records`, `trg_fixed_passport_passport_write_decisions` and `trg_fixed_passport_issuer_contracts` | raises when `passport_id` of the new row is distinct from `passport_id` of the old row. The nine tables are every table with a column `passport_id`, so no record moves out of a passport or into a passport (D61). The two notification tables and `received_battery_information` hold no column `passport_id`: a notification names a passport identifier as text, and a received record references its contract | `ERR-DB-APPEND-ONLY` |
| `set_passport_insert_defaults()` | `trg_passport_insert`: `passports`, BEFORE INSERT | sets `lineage_open` to true for a passport inserted with the status `re-used`, `repurposed` or `remanufactured`, and to false for every other status; the value of the statement is ignored (D54) | none |
| `refuse_passport_identity_change()` | `trg_passport_identity`: `passports`, BEFORE UPDATE | raises when `id`, `passport_identifier`, `battery_identifier`, `manufacturer_bpnl` or `battery_model_id` is distinct from the old value; the function holds no exemption for a role (decision D16, The permanent manufacturer). The function raises when the old status is `waste` and `waste_successor_bpnl`, `waste_successor_role` or `waste_date` is distinct from the old value (D65 [waits for the owner]). The function raises when `lineage_open` changes from false to true. The function raises when the new value of `date_into_service`, `rated_capacity_ah`, `capacity_fade_percent`, `power_fade_percent` or `expected_lifetime_years` is null and the passport has a lineage link; a first passport keeps the freedom to hold no value | `ERR-DB-IDENTITY-PERMANENT`; `ERR-DB-WASTE-SUCCESSOR` for the named successor; `ERR-DB-LINEAGE` for the lineage and for the five values |
| `refuse_battery_model_change()` | `trg_battery_model_identity`: `battery_models`, BEFORE UPDATE OR DELETE | raises on every update and every deletion of a battery model | `ERR-DB-IDENTITY-PERMANENT` |
| `check_passport_status_change()` | `trg_passport_status_change`: `passports`, BEFORE UPDATE OF `lifecycle_status` | when the new status is distinct from the old status: admits the new status `waste` from every other status, and the new status `re-used` from `original`, `repurposed` and `remanufactured`; raises for every other change | `ERR-DB-STATUS-CHANGE` |
| `refuse_change_of_ended_passport()` | `trg_passport_ended`: `passports`, BEFORE UPDATE OR DELETE | raises when `OLD.recycling_date` is not null; raises on every deletion of a passport | `ERR-DB-PASSPORT-ENDED` |
| `check_passport_after_waste()` | `trg_passport_after_waste`: `passports`, BEFORE UPDATE | returns without a refusal, and without a read of the setting `app.today`, when `OLD.recycling_date` is not null or when `OLD.lifecycle_status` is not `waste`. Otherwise the function reads the date of `app_today()`. An authorisation is in force when the date is not null, `OLD.successor_authorisation_valid_from` is not null and not after the date, and `OLD.successor_authorisation_valid_to` is null or not before the date. Without an authorisation in force the function raises when a column other than `successor_authorisation_ref`, `successor_authorisation_valid_from`, `successor_authorisation_valid_to`, `recycling_date`, `recycler_bpnl` and `material_recycling_certificate_catena_x_id` is distinct from its old value | `ERR-DB-SUCCESSOR-AUTHORISATION`; `ERR-DB-TODAY` from `app_today()` |
| `check_child_after_waste()` | five triggers BEFORE INSERT OR UPDATE OR DELETE: `trg_passport_aspect_payloads_after_waste`, `trg_passport_purposes_after_waste`, `trg_passport_repair_entries_after_waste`, `trg_passport_successor_links_after_waste`, `trg_passport_lineage_links_after_waste`, each on the table of its name | reads the passport of the row with `SELECT ... FOR SHARE`. The function returns without a refusal, and without a read of the setting `app.today`, when the read gives no row, when the passport has ended or when the status of the passport is not `waste`. Otherwise the function reads the date of `app_today()` and raises unless an authorisation of the successor is in force on that date, by the rule of `check_passport_after_waste()` (D61) | `ERR-DB-SUCCESSOR-AUTHORISATION`; `ERR-DB-TODAY` from `app_today()` |
| `check_passport_lineage()` | `trg_passport_lineage`: `passports`, constraint trigger AFTER INSERT | at the commit, with the values of the inserted row and the state of the tables at the commit: raises for a passport inserted with the status `waste`; raises for a passport inserted with the status `original` that has a lineage link; raises for a passport inserted with the status `re-used`, `repurposed` or `remanufactured` that has no lineage link, or whose `date_into_service` or one of whose four performance values is null; raises when the lineage links of the passport hold more than one `operation_date`; raises when `lineage_open` of the passport is still true. Two of the refusal sentences of the function are bounded by an earlier trigger. No statement reaches the sentence "A passport that is inserted with the status original has no lineage link.": `trg_passport_lineage_links_insert` refuses every link of a passport whose lineage is not open, a passport inserted with the status `original` never has an open lineage, and no status changes to `original`; the sentence stays in the function as a second barrier. The sentence "A new passport has a lineage link, a date of putting into service and its four performance values." is reached at the commit for a new passport without a link, and for a new passport with a missing value only when no update of the passport follows the insertion of the links: the closing update of the lineage, as every other update of that passport, is refused first by `trg_passport_identity` with the sentence "A new passport keeps a date of putting into service and its four performance values." | `ERR-DB-LINEAGE` |
| `check_responsibility()` | `trg_passport_responsibility`: `passports`, constraint trigger AFTER INSERT OR UPDATE; `trg_interval_responsibility`: `passport_responsibility_intervals`, constraint trigger AFTER INSERT OR UPDATE | at the commit, for the passport of the row, the timeline that the passport determines (D62). The function raises unless exactly one interval has `valid_to` null. The function raises unless the first interval of the passport, in the order of `valid_from` and `id`, has `responsible_bpnl` equal to `manufacturer_bpnl`, the role `economicOperator`, and `valid_from` equal to the start of the passport: `date_of_manufacture` at 00:00:00 UTC for a passport without a lineage link, and the `operation_date` of the lineage links for a new passport. For a passport in the status `waste` the function raises unless the passport has exactly two intervals, the first interval ends at `waste_date`, and the open interval has `responsible_bpnl` equal to `waste_successor_bpnl`, `role` equal to `waste_successor_role` and `valid_from` equal to `waste_date`. For a passport in another status the function raises unless the passport has exactly one interval. The function raises when `recycling_date` is before `valid_from` of the open interval (D17 (The named waste successor), D55 (The dates of the waste status and of the end are rules of the database)) | `ERR-DB-RESPONSIBILITY` for the count and for the first interval; `ERR-DB-WASTE-SUCCESSOR` for the waste rule; `ERR-DB-END-DATE` for the recycling date |
| `refuse_change()` | seven triggers BEFORE UPDATE OR DELETE: `trg_passport_purposes_append_only`, `trg_passport_lineage_links_append_only`, `trg_passport_repair_entries_append_only`, `trg_passport_successor_links_append_only`, `trg_notifications_received_append_only`, `trg_passport_write_decisions_append_only`, `trg_received_battery_information_append_only`, each on the table of its name | raises on every update and every deletion. A purpose record is therefore never rewritten and never deleted, for the application role and for the owner alike; a new purpose is a new record | `ERR-DB-APPEND-ONLY` |
| `check_interval_change()` | `trg_interval_change`: `passport_responsibility_intervals`, BEFORE INSERT OR UPDATE OR DELETE | on an insertion: reads the passport with `SELECT ... FOR SHARE` and raises for an ended passport; raises when `valid_to` of the new interval is not null, when the passport has an open interval, or when the passport has an earlier interval and `valid_from` of the new interval is distinct from the greatest `valid_to` of the passport, so that an interval is inserted open and starts exactly at the end of the earlier interval, without a gap and without an overlap (D62). On a deletion: raises. On an update: raises when the update changes a column other than `valid_to`, or changes a `valid_to` that is not null | `ERR-DB-PASSPORT-ENDED` for an ended passport; `ERR-DB-RESPONSIBILITY` for the insertion; `ERR-DB-APPEND-ONLY` for the deletion and the update |
| `refuse_child_of_ended_passport()` | four triggers BEFORE INSERT OR UPDATE OR DELETE: `trg_passport_aspect_payloads_ended`, `trg_passport_successor_links_ended`, `trg_passport_repair_entries_ended`, `trg_passport_purposes_ended`, each on the table of its name; and `trg_passport_responsibility_intervals_ended`: `passport_responsibility_intervals`, BEFORE INSERT OR UPDATE | reads the passport of the row (`passport_id` of the new row, or of the old row for a deletion) with `SELECT recycling_date ... FOR SHARE`, so that the function waits for a concurrent transaction that ends the passport, and raises when `recycling_date` is not null. The responsibility intervals of an ended passport are frozen in this way (D55) | `ERR-DB-PASSPORT-ENDED` |
| `check_lineage_link_insert()` | `trg_passport_lineage_links_insert`: `passport_lineage_links`, BEFORE INSERT | reads `lineage_open` of the passport of the new link with `SELECT ... FOR UPDATE` and raises unless the value is true. A passport that does not exist, and a passport that the policies hide from the role, give no row and the same refusal (D54) | `ERR-DB-LINEAGE` |

**The tables that the rule after the waste status covers (D61).** The database refuses, without an authorisation of the successor in force, every change of the row of `passports` outside the six exempt columns, and every insertion, update and deletion of a record of `passport_aspect_payloads`, `passport_purposes`, `passport_repair_entries`, `passport_successor_links` and `passport_lineage_links` of a waste passport that has not ended. The following writes on a waste passport stay admitted without an authorisation: the record of the authorisation and the end of the passport, which are the six exempt columns; the records of `passport_access_records`, because the access record of the successor and the access records of a change of purchaser are exempt in the executor (§9.2.2); the records of `passport_responsibility_intervals`, which the waste step itself writes and which `check_interval_change()` and `check_responsibility()` bound; and the records of the tables that hold no passport data: `notifications_received`, `notifications_sent`, `passport_write_decisions`, `issuer_contracts` and `received_battery_information`. The waste step itself is admitted, because the two functions read the status of the passport before the step: the step updates a passport whose old status is not `waste` and writes no record of the five tables. Under an authorisation in force the three columns `waste_successor_bpnl`, `waste_successor_role` and `waste_date` still never change (D65 [waits for the owner]).

**The order of the triggers.** Two triggers on one table and one event fire in the order of their names, so each of the nine triggers of `refuse_passport_id_change()` fires before every other trigger of its table. On an update of `passports` the order is `trg_passport_after_waste`, `trg_passport_ended`, `trg_passport_identity`, `trg_passport_status_change`. `trg_passport_after_waste` returns for an ended passport, so a change of an ended passport is always refused with `ERR-DB-PASSPORT-ENDED`, also when the setting `app.today` holds a text that is no date. The first refusal of a statement on a record of an ended passport depends on the table and the statement, as the superuser observes it:

| Table | INSERT | UPDATE | DELETE |
|---|---|---|---|
| `passport_aspect_payloads` | `ERR-DB-PASSPORT-ENDED` | `ERR-DB-PASSPORT-ENDED`; `ERR-DB-APPEND-ONLY` when the statement changes `passport_id` | `ERR-DB-PASSPORT-ENDED` |
| `passport_purposes`, `passport_repair_entries`, `passport_successor_links` | `ERR-DB-PASSPORT-ENDED` | `ERR-DB-APPEND-ONLY` | `ERR-DB-APPEND-ONLY` |
| `passport_lineage_links` | `ERR-DB-LINEAGE` | `ERR-DB-APPEND-ONLY` | `ERR-DB-APPEND-ONLY` |
| `passport_responsibility_intervals` | `ERR-DB-PASSPORT-ENDED` | `ERR-DB-APPEND-ONLY` for a closed interval and for a change of another column than `valid_to`; `ERR-DB-PASSPORT-ENDED` for the end of the open interval | `ERR-DB-APPEND-ONLY` |

On each of the five tables of `check_child_after_waste()` the trigger with the suffix `_after_waste` fires before the triggers with the suffixes `_append_only`, `_ended` and `_insert`, so a statement on a record of a waste passport that has not ended and has no authorisation in force is refused with `ERR-DB-SUCCESSOR-AUTHORISATION`, except an update that changes `passport_id`, which `ERR-DB-APPEND-ONLY` refuses first. The role `refserver_app` holds no UPDATE and no DELETE privilege on the four append-only tables of a passport, so the role receives `42501` for those statements before a trigger fires. On `passport_responsibility_intervals` the order of an update is `trg_fixed_passport_passport_responsibility_intervals`, `trg_interval_change`, then `trg_passport_responsibility_intervals_ended`. A BEFORE trigger fires before the check of a foreign key and before the `WITH CHECK` expression of a policy; an insert of a lineage link for a passport that does not exist, or for a passport of another company, is therefore refused with `ERR-DB-LINEAGE`, and the foreign key `passport_lineage_links_passport_fkey` and the policy `passport_lineage_links_own` are never the first refusal of an insert. The record of the end of a passport is one UPDATE that sets the three end columns on a passport whose stored `recycling_date` is null, so `trg_passport_ended` admits the statement.


#### 9.4.3 The file `003_policies.sql`

The file raises an exception when `pg_roles` holds no role `refserver_app`, and then runs these statements.

1. `GRANT USAGE ON SCHEMA <current_schema()> TO refserver_app`, written as a `DO` block that reads `current_schema()` and runs the statement with `format('%I', ...)`.
2. The privilege check of the same `DO` block (D60). The server creates no temporary table. Every role holds the privilege `TEMPORARY` of a database through PUBLIC, so the block runs `REVOKE TEMPORARY ON DATABASE <current_database()> FROM PUBLIC` when `has_database_privilege('refserver_app', current_database(), 'TEMPORARY')` is true, and raises `ERR-DB-ROLE-PRIVILEGE` when the function is still true afterwards. The block raises `ERR-DB-ROLE-PRIVILEGE` when the role holds the privilege `CREATE` of the schema of the migration or of the schema `public`; PostgreSQL 17 grants neither privilege to a new role, so the block revokes nothing there. The block raises `ERR-DB-ROLE-PRIVILEGE` when the catalogue `pg_db_role_setting` holds a row of the role, for every database or for one database of the cluster, and the message names the command `npm run create-role`, which removes every such row (§9.2.8, D24). The revocation changes the database for every role that is no superuser and no owner of the database; the reference server runs on a database of its own, as the owner decided on 2026-11-16 (D60).
3. The privileges of the role (decision D67, The privilege UPDATE by column). The file runs `GRANT SELECT, INSERT ON <table> TO refserver_app` for each of the 17 tables and `GRANT SELECT ON schema_migrations TO refserver_app`, so that the start of the server reads the applied migration names; the role can insert no name. The file grants `DELETE` and `TRUNCATE` on no table and `UPDATE` of a whole row on no table. The file grants `UPDATE` by column on seven tables, with `GRANT UPDATE (<columns>) ON <table> TO refserver_app`, and the columns are the columns that a step of the server changes. The role updates no other column of the schema and no column of the other ten tables. A table with a `GENERATED ALWAYS AS IDENTITY` column needs no grant on a sequence.

| Table | Columns with the privilege UPDATE | The step that changes the columns |
|---|---|---|
| `companies` | `legal_name`, `legal_name_language`, `address`, `operator_identifier` | `upsertOwnCompany` (§9.2.1) |
| `passports` | `lifecycle_status`, `waste_successor_bpnl`, `waste_successor_role`, `waste_date`, `successor_authorisation_ref`, `successor_authorisation_valid_from`, `successor_authorisation_valid_to`, `recycling_date`, `recycler_bpnl`, `material_recycling_certificate_catena_x_id`, `lineage_open` | the repair step and the waste step (the status); the waste step (the three waste columns); `recordSuccessorAuthorisation` (the three authorisation columns); the end step (the three end columns); `issueNewPassport` (the closing of the lineage) (§9.2.2, §10.4) |
| `passport_aspect_payloads` | `payload`, `updated_at` | `putAspectPayload` (§9.2.2) |
| `passport_responsibility_intervals` | `valid_to` | the waste step (§10.4) |
| `notifications_sent` | `outcome`, `cause`, `http_status`, `attempts`, `attempted_at`, `not_before`, `receiver_did`, `receiver_connector_url` | the sender and `EP-NOTIFICATION-RETRY` (§9.2.5) |
| `passport_access_records` | `valid_to` | `EP-ACCESS-RECORD-END` and `changePurchaser` (§9.2.4) |
| `issuer_contracts` | `pull_state`, `pull_cause`, `valid_to` | the puller, `EP-CONTRACT-PULL` and `EP-CONTRACT-END` (§9.2.5) |

No step of the server changes the battery category, the facility, a date, a performance value, the passport identifier or `created_at` of a stored passport, and no step changes the message of a stored notification. A row lock (`SELECT ... FOR UPDATE` and `SELECT ... FOR SHARE`) needs the privilege UPDATE on one column or more of the table, which the role holds on `passports` and `notifications_sent`. The statement `LOCK TABLE` in a mode above ROW EXCLUSIVE needs the privilege UPDATE, DELETE or TRUNCATE on the whole table, which the role holds on no table, so the role takes no ACCESS EXCLUSIVE lock (observed on 2026-11-16: `42501`).

4. `ALTER TABLE <table> ENABLE ROW LEVEL SECURITY` and `ALTER TABLE <table> FORCE ROW LEVEL SECURITY` on twelve tables, and one policy per table, twelve policies in total. Each policy is `CREATE POLICY <name> ON <table> FOR ALL TO refserver_app USING (<expression>) WITH CHECK (<expression>)`. Eleven policies hold the same expression in both clauses, and the policy of `issuer_contracts` holds `USING (true)`.

| Policy | Table | Expression |
|---|---|---|
| `battery_models_own` | `battery_models` | `manufacturer_bpnl = current_setting('app.acting_bpnl', true)` |
| `passports_own` | `passports` | `manufacturer_bpnl = current_setting('app.acting_bpnl', true)` |
| `passport_purposes_own`, `passport_aspect_payloads_own`, `passport_lineage_links_own`, `passport_successor_links_own`, `passport_repair_entries_own`, `passport_responsibility_intervals_own`, `passport_access_records_own` | the seven tables `passport_purposes`, `passport_aspect_payloads`, `passport_lineage_links`, `passport_successor_links`, `passport_repair_entries`, `passport_responsibility_intervals` and `passport_access_records` | `EXISTS (SELECT 1 FROM passports p WHERE p.id = passport_id AND p.manufacturer_bpnl = current_setting('app.acting_bpnl', true))` |
| `access_map_versions_own` | `access_map_versions` | `EXISTS (SELECT 1 FROM battery_models m WHERE m.id = battery_model_id AND m.manufacturer_bpnl = current_setting('app.acting_bpnl', true))` |
| `access_map_entries_own` | `access_map_entries` | `EXISTS (SELECT 1 FROM access_map_versions v JOIN battery_models m ON m.id = v.battery_model_id WHERE v.id = map_id AND m.manufacturer_bpnl = current_setting('app.acting_bpnl', true))` |
| `issuer_contracts_own_passport` | `issuer_contracts` | `USING (true)`; `WITH CHECK (passport_id IS NULL OR EXISTS (SELECT 1 FROM passports p WHERE p.id = passport_id AND p.manufacturer_bpnl = current_setting('app.acting_bpnl', true)))` |

A transaction without the setting `app.acting_bpnl` therefore reads and writes no battery model, no passport and no access map. A row that fails the `WITH CHECK` expression raises the SQLSTATE `42501`. The expression of `access_map_entries_own` reads the stored version, so the executor inserts the version of an access map in one statement and the entries in a later statement of the same transaction. The other five tables (`companies`, `notifications_received`, `notifications_sent`, `passport_write_decisions` and `received_battery_information`) have no policy, because their records belong to the deployment and not to one passport.

5. The `DO` block of §9.4.2 that fixes the search path of every function of the schema, as the last statement of the file.

**What the policies hide and what the policies do not hide (D63).** The policies hide the rows of another company. Three references that crossed the bound of a company in version 5 are refused: a passport references a battery model of its own manufacturer, because the foreign key `passports_battery_model_fkey` holds the two columns `(battery_model_id, manufacturer_bpnl)` and references the unique constraint `battery_models_id_manufacturer_key`; an access map version and an access map entry reference a battery model of the acting company; and an issuer contract references a passport of the acting company or no passport. A reference to a row of another company and a reference to a row that does not exist give the same refusal in each of the three cases (`23503` on `passports_battery_model_fkey`, and `42501` for the two policies), so the refusal does not tell the two cases apart. Two existence signals remain, because three values are unique in the schema. An insertion of a passport whose `id` or `passport_identifier` equals the value of a passport of another company fails with `23505` on `passports_pkey` or `passports_passport_identifier_key`. An insertion of a battery model whose `id` equals the `id` of a battery model of another company fails with `23505` on `battery_models_pkey`. Each signal confirms only an identifier that the caller already holds, and a caller cannot list identifiers through a signal, because the identifiers hold a random UUID. The policies are a second barrier against a defect of the server and no separation of tenants; D24 states the bound.


#### 9.4.4 The file `004_audit_outbox.sql`

The fourth migration file, of phase P5, holds the queue of the audit records that the audit trail failed to write after the transaction of a request (D69); §23 prints the file, and the implementer copies the file. The file changes no object of the three earlier files and follows the rules of a later migration file (§9.2.8): the trigger function calls `require_read_committed()` first, and the last statement of the file is the `DO` block that fixes the search path of every function of the schema.

- The table `audit_outbox`: `id bigint GENERATED ALWAYS AS IDENTITY` PK `audit_outbox_pkey`; `entries jsonb NOT NULL` with CHECK `audit_outbox_entries_check` (`jsonb_typeof(entries) = 'array' AND jsonb_array_length(entries) BETWEEN 1 AND 20`), the list of the entries of §9.2.7; `decided_at finite_timestamptz NOT NULL`, the time of the decision; `attempts integer NOT NULL DEFAULT 0` with CHECK `audit_outbox_attempts_check` (`attempts >= 0`); `not_before finite_timestamptz NOT NULL`; `last_error text` with CHECK `audit_outbox_last_error_check` (`length(last_error) BETWEEN 1 AND 500`); `written_at finite_timestamptz`, the time at which the records were written; `created_at finite_timestamptz NOT NULL DEFAULT now()`; CHECK `audit_outbox_written_check` (`written_at IS NULL OR written_at >= decided_at`); index `audit_outbox_due_idx` on `(not_before, id) WHERE written_at IS NULL`.
- The function `check_audit_outbox_change()` with the trigger `trg_audit_outbox_change`, BEFORE UPDATE OR DELETE on `audit_outbox`: refuses every deletion with `ERR-DB-APPEND-ONLY` and the sentence "A record of the audit queue is never deleted."; refuses every update of a row whose `written_at` is not null with the sentence "A written record of the audit queue never changes."; and refuses an update that changes a column other than `attempts`, `not_before`, `last_error` and `written_at`, or that lowers `attempts`, with the sentence "Only the attempt count, the next attempt, the last error and the write time of a record of the audit queue change, and the attempt count never decreases."
- The privileges: `GRANT SELECT, INSERT ON audit_outbox TO refserver_app` and `GRANT UPDATE (attempts, not_before, last_error, written_at) ON audit_outbox TO refserver_app`. The table holds no policy, because its rows are records of the deployment, as the rows of `passport_write_decisions` are (§9.4.3).

After the four files the schema holds 18 tables, 17 functions, 38 triggers and 12 policies. Observed on 2026-11-19 on PostgreSQL 17.12, with the three files of the repository and this file applied to an empty schema, and under the session authorisation of the role `refserver_app`: the role queued a row; claimed the row with `FOR UPDATE SKIP LOCKED`; wrote the audit record with the time of the row and set `written_at`; an update of the written row answered "ERR-DB-APPEND-ONLY: A written record of the audit queue never changes."; an update of `entries` and a deletion answered `permission denied for table audit_outbox`; a failed insert into `passport_write_decisions` followed by the update of the attempt columns in a second statement succeeded; a lower attempt count, an empty list, an object in place of a list, the value `infinity`, an empty last error and a write time before the decision each answered the stated refusal; and an update at the isolation level REPEATABLE READ answered `ERR-DB-ISOLATION`. The catalogue then held 17 functions with the fixed search path, no trigger function without the call of `require_read_committed()`, 38 triggers and 12 policies.

### 9.5 Strings

The body of every refusal has this form (D9), which `docs/api/schemas/ErrorResponse.schema.json` defines:

```json
{
  "success": false,
  "error": { "message": "<text>", "code": "<refusal id>" },
  "messages": [{ "messageType": "Error", "text": "<text>" }]
}
```

A validation refusal adds one entry to `messages` per validator error, with the instance path and the validator message as `text`. The texts are exactly the texts of the table, held in `REFUSALS` of `server/src/dataset/refusals.mjs`. Each text has four sentences: what happened, why the rule exists, who must act, and the next action.

| Refusal id | Status | Text |
|---|---|---|
| `ERR-RX-HEADER-INVALID` | 400 | The notification was refused because its header does not validate against the MessageHeader schema. The receiver cannot identify the message, the sender or the receiver without a valid header. The sender must correct the header. Resend the notification with the fields that the following messages name. |
| `ERR-RX-CONTENT-INVALID` | 400 | The notification was refused because its content does not validate against the schema of its operation. The receiver applies only content that the published OpenAPI specification defines. The sender must correct the content. Resend the notification with the fields that the following messages name. |
| `ERR-RX-CHANGE-OUTSIDE-STEP` | 422 | The notification was refused because its content holds a property outside the content of its operation. The receiver changes a passport only through the step that the lifecycle notification API assigns to the operation. The sender must send only the properties of the operation. Resend the notification without the properties that the following messages name. |
| `ERR-RX-CONTEXT-MISMATCH` | 400 | The notification was refused because the header context does not name the operation of the endpoint. The receiver cannot tell which step to apply when the context and the endpoint differ. The sender must set the context of the operation. Resend the notification to the endpoint whose name the context carries. |
| `ERR-RX-RECEIVER-MISMATCH` | 400 | The notification was refused because the header names another company as receiver. A receiver accepts only the notifications addressed to its own Business Partner Number. The sender must address the notification to the receiver. Resend the notification with the receiver's Business Partner Number in the header. |
| `ERR-RX-SENDER-MISMATCH` | 403 | The notification was refused because the sender of the header differs from the participant that the connector presented. The receiver accepts a notification only from the participant that negotiated the contract. The sender must set its own Business Partner Number in the header. Resend the notification through the sender's own connector. |
| `ERR-RX-MESSAGE-ID-REUSED` | 409 | The notification was refused because a stored message of another sender or with another content carries the same messageId. A messageId identifies exactly one message. The sender must give each message a new messageId. Resend the notification with a new messageId. |
| `ERR-RX-PASSPORT-UNKNOWN` | 404 | The notification was refused because no passport of this data provider carries the named passport identifier. The receiver changes only passports of which the receiver is the data provider. The sender must check the passport identifier and the manufacturerId of the twin. Resend the notification to the data provider of that passport. |
| `ERR-RX-STEP-REFUSED` | 422 | The notification was refused because the current state of the passport does not admit the step of this operation. The receiver applies a lifecycle step only from the states that the step admits. The sender must check the state of the passport. Send the notification of the step that the current state admits. |
| `ERR-RX-METHOD-NOT-ALLOWED` | 405 | The request was refused because a notification endpoint accepts the method POST only. A notification API offers one POST endpoint per operation. The sender must use POST. Resend the notification with the method POST. |
| `ERR-RX-BODY-TOO-LARGE` | 413 | The notification was refused because its body is larger than one megabyte. The receiver reads only a body within its size limit. The sender must send a notification of the documented content only. Resend the notification with a body within the limit. |
| `ERR-RX-OPERATION-UNKNOWN` | 404 | The notification was refused because the receiver offers no notification endpoint at this path. A notification API offers one endpoint for each of its four operations. The sender must use the path of the operation of the notification. Resend the notification to the endpoint of its operation. |
| `ERR-RX-INTERNAL` | 500 | The notification was not applied because the receiver failed to store the notification. The receiver has recorded nothing of this message. The operator of the receiver must act, and the sender has nothing to correct. Resend the notification with the same messageId later. |
| `ERR-AC-UNAUTHENTICATED` | 401 | The request was refused because the request carries no valid data plane key and no valid operator token. The server answers only an authenticated subject. The caller must present its credential. Repeat the request with the credential. |
| `ERR-AC-CAPABILITY-MISSING` | 403 | The request was refused because the subject lacks the capability of this endpoint. Each endpoint requires one capability. The caller must use an endpoint of its subject kind. Repeat the request on an endpoint that the subject may call. |
| `ERR-AC-ACCESS-GROUP-REFUSED` | 403 | The data was not served because no record of the data provider admits the reader for this data. The data provider serves restricted information only to the readers that the data provider has recorded. The data provider must record the reader. Request the data again after the data provider has recorded the access. |
| `ERR-LC-BODY-INVALID` | 400 | The request was refused because its body or one of its path parameters does not validate against the schema of the endpoint. The server applies only a request that its schema defines. The operator must correct the request. Repeat the request with the fields that the following messages name. |
| `ERR-LC-BODY-TOO-LARGE` | 413 | The request was refused because its body is larger than one megabyte. The server reads only a body within its size limit. The operator must send a smaller body. Repeat the request with a body within the limit. |
| `ERR-LC-NOT-DATA-PROVIDER` | 403 | The action was refused because the company of this deployment is not the data provider of the passport. Only the data provider writes into a passport. The data provider must apply the change. Report the lifecycle event to the data provider through the lifecycle notification API. |
| `ERR-LC-PASSPORT-NOT-FOUND` | 404 | The action was refused because this deployment holds no passport with this id. A deployment holds only the passports of its own company. The operator must check the passport id. Repeat the request with the id of a passport of this deployment. |
| `ERR-LC-MODEL-NOT-FOUND` | 404 | The action was refused because this deployment holds no battery model with this id. A deployment holds only the battery models of its own company. The operator must check the battery model id. Repeat the request with the id of a battery model of this deployment. |
| `ERR-LC-RECORD-NOT-FOUND` | 404 | The action was refused because this deployment holds no record with this id. The request names a record by the id that the server returned. The operator must check the record id. Repeat the request with the id of a stored record. |
| `ERR-LC-RECORD-EXISTS` | 409 | The record was refused because an open record with the same recipient, aspect key and role exists. One open access record covers one recipient, one aspect key and one role. The operator has nothing to add. Read the open record, or end the open record first. |
| `ERR-LC-SUBMODEL-NOT-FOUND` | 404 | The submodel was not served because the passport or the battery model holds no payload of this aspect key. The data provider supplies each payload. The data provider must supply the payload. Request the submodel again after the data provider has supplied the payload. |
| `ERR-LC-ASPECT-KEY-UNKNOWN` | 404 | The request was refused because the server knows no aspect key of this name. The server serves only the aspect keys of its documented list. The caller must use a documented aspect key. Repeat the request with one of the documented aspect keys. |
| `ERR-LC-IDENTIFIER-EXISTS` | 409 | The request was refused because a stored record already carries this identifier. A passport identifier and a catalogue part identifier are unique in a deployment. The operator must choose another identifier. Repeat the request with an identifier that no stored record carries. |
| `ERR-LC-IDENTITY-PERMANENT` | 409 | The change was refused because the change would alter the identity of a passport or of a battery model. The identifiers and the manufacturer of a passport never change after the passport is issued. The operator has nothing to change. Issue a new passport where the regulation requires one. |
| `ERR-LC-OPERATION-NOT-ADMITTED` | 409 | The new passport was refused because the status or the purpose of a predecessor does not admit the operation. Each of the four operations is admitted only from the statuses and purposes of its rule. The second-life operator must choose the operation that the predecessor admits. Repeat the request with that operation. |
| `ERR-LC-MODEL-NOT-ORIGINAL` | 409 | The new passport was refused because the battery model of the request references the original battery model of no predecessor. A new passport keeps the battery model of the original battery as the reference of the design. The second-life operator must create a battery model that references the original model. Repeat the request with that battery model. |
| `ERR-LC-IDENTIFIER-RULE` | 409 | The new passport was refused because its passport identifier or its battery identifier breaks the identifier rule. A new passport has a new passport identifier, and the battery identifier is kept for one battery and renewed for a battery made from several batteries. The second-life operator must correct the identifiers. Repeat the request with identifiers that follow the rule. |
| `ERR-LC-STATUS-NOT-ADMITTED` | 409 | The action was refused because the state of the record does not admit the action. Each action is admitted only from the states of its rule. The operator must choose the action that the state admits. Read the record and repeat the request with that action. |
| `ERR-LC-PASSPORT-ENDED` | 409 | The action was refused because the passport has ended after the recycling of its battery. An ended passport accepts no further change. The operator has nothing to change on this passport. Read the ended passport as the passport stands. |
| `ERR-LC-SUCCESSOR-AUTHORISATION-MISSING` | 403 | The action was refused because the passport is waste and no written authorisation of the successor is in force today. After the waste status the data provider changes the passport only under the written authorisation of the successor. The data provider must record an authorisation that is in force. Repeat the request once the authorisation is recorded. |
| `ERR-LC-CERTIFICATE-NOT-REGISTERED` | 409 | The repair was not reported because the registry of this deployment holds no twin of the named repair certificate. The repairer registers the repair certificate before the repairer reports the repair. The repairer must register the certificate. Repeat the request after the certificate is registered. |
| `ERR-LC-NOTIFICATION-UNKNOWN` | 404 | The forward link was refused because no received NewPassportIssued notification for this passport carries the named messageId. A forward link follows only the notice of the second-life operator. The data provider must name a received notification. Read the received notifications and repeat the request with one messageId. |
| `ERR-LC-ROLE-NOT-ADMITTED` | 422 | The access record was refused because the role of the recipient is not admitted for this submodel. Each restricted submodel is offered only to the roles of its rule. The data provider must name a role that the rule admits. Repeat the request with an admitted role. |
| `ERR-LC-PATH-NOT-SUPPORTED` | 422 | The access map was refused because a path lies outside the supported subset of JSONPath. The server evaluates only the selectors of its documented subset. The data provider must write the path with those selectors. Repeat the request with the corrected path. |
| `ERR-LC-ACCESS-MAP-INCOMPLETE` | 422 | The request was refused because a served field has no entry in the access map or has entries of two access groups. The access map names exactly one access group for every served field. The data provider must complete the entries that the following messages name. Repeat the request once the access map holds one entry per field. |
| `ERR-LC-ACCESS-MAP-VERSION-EXISTS` | 409 | The access map was refused because the battery model already holds this map version. A stored version of an access map never changes. The data provider must choose a new map version. Repeat the request with a new value of mapVersion. |
| `ERR-LC-ISSUER-NOT-LINKED` | 422 | The contract was refused because the named issuer is not the data provider of a predecessor passport and the request carries no battery information, or carries battery information for a passport of this deployment. The information of an individual battery is offered only to the issuer of the passport or of an original passport. The operator must name that issuer or supply the information of the purchaser. Repeat the request with the Business Partner Number of a predecessor's data provider or with the product condition. |
| `ERR-LC-CONTRACT-EXISTS` | 409 | The contract was refused because an open contract for this passport, this issuer and this provider is already recorded. One open contract covers one passport and one pair of issuer and provider. The operator must end the open contract first. Repeat the request after the open contract has ended. |
| `ERR-LC-CONTRACT-NOT-FOUND` | 404 | The request was refused because this deployment holds no contract of this kind with this id. A deployment holds only the contracts that its own operator recorded. The operator must check the contract id. Repeat the request with the id of a recorded contract. |
| `ERR-LC-CONTRACT-ENDED` | 409 | The request was refused because the contract has ended. The information of an individual battery is shared only while the contract with the purchaser is recorded. The operator must record a new contract. Repeat the request after the new contract is recorded. |
| `ERR-LC-PATH-UNKNOWN` | 404 | The request was refused because the server offers no endpoint at this path. The server answers only the endpoints of its documented API. The caller must use a documented path. Repeat the request with a path of the API. |
| `ERR-LC-INTERNAL` | 500 | The action was not applied because the server failed. The server has stored nothing of this request. The operator of the server must act. Repeat the request later. |

`server/src/routes/errorHandler.mjs` maps a database error to a refusal by the table. The handler reads the SQLSTATE, the constraint name and, for the SQLSTATE `P0001`, the refusal id at the start of the message. The column "On a receiving endpoint" names the refusal that a receiving endpoint answers for the same error. Every database error is logged at the level `error` with its SQLSTATE and its constraint name, and no database message reaches a response.

| Database error | Refusal on an operator endpoint | On a receiving endpoint |
|---|---|---|
| `P0001` with `ERR-DB-IDENTITY-PERMANENT` | `ERR-LC-IDENTITY-PERMANENT` | `ERR-RX-INTERNAL` |
| `P0001` with `ERR-DB-STATUS-CHANGE` or `ERR-DB-END-DATE`, and `23514` on `passports_end_after_waste_check` or `passport_responsibility_intervals_period_check` | `ERR-LC-STATUS-NOT-ADMITTED` | `ERR-RX-STEP-REFUSED` |
| `P0001` with `ERR-DB-PASSPORT-ENDED` | `ERR-LC-PASSPORT-ENDED` | `ERR-RX-STEP-REFUSED` |
| `P0001` with `ERR-DB-SUCCESSOR-AUTHORISATION` | `ERR-LC-SUCCESSOR-AUTHORISATION-MISSING` | `ERR-RX-STEP-REFUSED` |
| `23503` on `passports_battery_model_fkey` | `ERR-LC-MODEL-NOT-FOUND` | `ERR-RX-INTERNAL` |
| `P0001` with `ERR-DB-WASTE-SUCCESSOR`, `ERR-DB-LINEAGE`, `ERR-DB-RESPONSIBILITY` or `ERR-DB-APPEND-ONLY`, `P0001` with `ERR-DB-ISOLATION`, `22007` with `ERR-DB-TODAY`, and `23514` on `finite_timestamptz_check`, `finite_date_check` or `passports_passport_identifier_check` | `ERR-LC-INTERNAL`, because the executor writes the required records in the same transaction and the refusal shows a defect of the server | `ERR-RX-INTERNAL` |
| `23505` on `passports_passport_identifier_key` or `battery_models_manufacturer_part_key` | `ERR-LC-IDENTIFIER-EXISTS` | `ERR-RX-INTERNAL` |
| `23505` on `access_map_versions_model_version_key` | `ERR-LC-ACCESS-MAP-VERSION-EXISTS` | `ERR-RX-INTERNAL` |
| `23505` on `issuer_contracts_open_key` | `ERR-LC-CONTRACT-EXISTS` | `ERR-RX-INTERNAL` |
| `23505` on `passport_access_records_open_key` | `ERR-LC-RECORD-EXISTS` | `ERR-RX-INTERNAL` |
| `23505` on `passport_lineage_links_predecessor_key` | `ERR-LC-IDENTIFIER-RULE` | `ERR-RX-INTERNAL` |
| `42501` (a row-level security violation or a missing privilege) | `ERR-LC-NOT-DATA-PROVIDER` | `ERR-RX-INTERNAL` |
| every other SQLSTATE, the classes `23` (another constraint) and `22` (a data exception) included | `ERR-LC-INTERNAL`, because the request validation and the rules of the services precede the database | `ERR-RX-INTERNAL` |

### 9.6 Configuration

`loadConfig` reads the variables of the first table and no other. A missing required variable or a malformed value stops the start, and the error names every such variable (fail fast).

| Variable | Required | Default | Meaning and check |
|---|---|---|---|
| `OWN_BPNL` | yes | none | the Business Partner Number of the legal entity of the deployment; `BPNL_PATTERN` |
| `OWN_LEGAL_NAME` | yes | none | the legal name of the company, 1 to 300 characters |
| `OWN_LEGAL_NAME_LANGUAGE` | no | `en` | the language code of the legal name; `^[a-z]{2}$` |
| `OWN_ADDRESS` | yes | none | a JSON object that validates against the definition of the element AddressInformation of the stored nameplate schema of §6 |
| `OWN_OPERATOR_IDENTIFIER` | no | none | the operator identifier of the company, 1 to 200 characters |
| `DATABASE_URL` | yes | none | the PostgreSQL connection string of the role `refserver_app` |
| `DATABASE_SCHEMA` | no | `public` | the schema of the tables; `^[a-z_][a-z0-9_]{0,62}$` |
| `DATABASE_POOL_SIZE` | no | `10` | the size of the pool; an integer from 4 to 100 |
| `PORT` | no | `8080` | the port of the HTTP server; an integer from 1 to 65535 |
| `PUBLIC_BASE_URL` | yes | none | the address under which the data plane reaches the server; an absolute address with the scheme `http` or `https`; the administrator guide requires an address that only the own data plane reaches (D41) |
| `BINDING` | yes | none | `memory` or `connector` |
| `RECEIVER_RESOLUTION` | no | `discovery` | `discovery` or `address-list`; the resolver of the connector binding (D75, D81) |
| `RECEIVER_ADDRESS_LIST` | when `RECEIVER_RESOLUTION=address-list` | none | a JSON object of 1 to 100 entries: each key a Business Partner Number of `BPNL_PATTERN`, each value an object with exactly the two properties `connectorUrl`, the Dataspace Protocol address of the receiver's connector (an address with the scheme `http` or `https`), and `did`, the decentralised identifier of the connector (a text that starts with `did:`); the host of every `connectorUrl` is a name without a dot, `localhost` or a loopback address, so that the list serves only a local test deployment (D81) |
| `OPERATOR_TOKEN_SECRET` | yes | none | the key of the operator tokens; 32 characters or more |
| `DATA_PLANE_KEY` | yes | none | the key that the provider data plane presents; 32 characters or more; one key per deployment |
| `DATA_PLANE_KEY_HEADER` | no | `x-api-key` | the name of the header that carries the key; the provider data plane of Tractus-X EDC 0.13.0 sends every header that the data address declares as `header:<name>`, so the name `x-api-key` is admitted (`01_assets.md` lines 89 and 111 at the tag `0.13.0`) |
| `PARTNER_BPN_HEADER` | no | `Edc-Bpn` | the name of the header in which the provider data plane passes the Business Partner Number of the consumer; the data plane of Tractus-X EDC 0.13.0 sets the property `header:Edc-Bpn` of the data address from the access token (`edc-extensions/dataplane/dataplane-token-refresh/token-refresh-core/src/main/java/org/eclipse/tractusx/edc/dataplane/tokenrefresh/core/DataPlaneTokenRefreshServiceImpl.java` line 347 at the tag `0.13.0`) |
| `ACCESS_REGIME` | yes | none | `before-act` or `after-act` (D29) |
| `PASSPORT_ENDED_DELAY_SECONDS` | no | `5` | the delay of D1 (The delay of the end notice); an integer from 0 to 86400 |
| `OUTBOX_INTERVAL_MILLISECONDS` | no | `1000` | the pause of the worker between two runs; an integer from 10 to 3600000 |
| `NOTIFICATION_MAX_ATTEMPTS` | no | `5` | the number of attempts of D49 [waits for the owner]; an integer from 1 to 20 |
| `NOTIFICATION_RETRY_SECONDS` | no | `60` | the base of the retry delay of D49 [waits for the owner]; an integer from 1 to 86400 |
| `NOTIFICATION_ALLOWED_BPNLS` | no | none | a JSON list of one entry or more, each a Business Partner Number of `BPNL_PATTERN`, that the access policy of the notification asset admits; without a value the asset admits every participant (decision D47 [waits for the owner], The access to the notification asset) |
| `PASSPORT_SERVICE_PROVIDER_BPNL` | no | none | `BPNL_PATTERN`; the passport service provider to which the data provider's deployment sends PassportEnded after the deployment has recorded the end of a passport (decision D34 [waits for the owner], The passport service provider as a receiver) |
| `CONNECTOR_DATA_PLANE_PUBLIC_URL` | when `BINDING=connector` | `http://data-plane.memory.invalid/api/public` | the public address of the own data plane, which the submodel descriptors carry (§9.2.6); Tractus-X EDC 0.13.0 serves the public API on the port 8081 with the path `/api/public` (`charts/tractusx-connector/README.md` lines 251 and 252 at the tag `0.13.0`) |
| `CONNECTOR_DSP_URL` | when `BINDING=connector` | `http://control-plane.memory.invalid/api/v1/dsp` | the Dataspace Protocol (DSP) address of the own connector, which the submodel descriptors carry; Tractus-X EDC 0.13.0 serves the protocol on the port 8084 with the path `/api/v1/dsp`, and the protocol version 2025-1 adds the segment `/2025-1` (`charts/tractusx-connector/README.md` lines 151 and 152, `04_catalog.md` lines 29 to 75 at the tag `0.13.0`) |
| `EDC_MANAGEMENT_URL`, `EDC_MANAGEMENT_API_KEY` | when `BINDING=connector` | none | the management API of the own connector and its key; Tractus-X EDC 0.13.0 serves the API on the port 8081 with the path `/management` and the version `v3`, with the paths `/v3/assets`, `/v3/policydefinitions`, `/v3/contractdefinitions`, `/v3/catalog/request`, `/v3/contractnegotiations`, `/v3/transferprocesses`, `/v3/edrs`, `/v3/edrs/<id>/dataaddress` and `/v3/connectordiscovery/connectors` (`charts/tractusx-connector/README.md` lines 145 and 146; `01_assets.md` line 8, `02_policies.md` line 113, `03_contractdefinitions.md` line 8, `04_catalog.md` lines 29 to 75 and 99, `05_contractnegotiations.md` line 14, `06_transferprocesses.md` line 33 and `07_edrs.md` lines 34 and 168, each at the tag `0.13.0`) |
| `EDC_MANAGEMENT_API_KEY_HEADER` | no | `x-api-key` | the header of the key; Tractus-X EDC 0.13.0 names the header `X-Api-Key`, which is the same header name (`charts/tractusx-connector/README.md` line 143 at the tag `0.13.0`) |
| `DTR_URL` | when `BINDING=connector` | none | the address of the own Digital Twin Registry, with the path prefix `/api/v3` of its API, which serves `/shell-descriptors` and `/shell-descriptors/{aasIdentifier}` (sldt-digital-twin-registry at the tag `v0.13.0`, commit `c7ca6f9930a03543de94e7ebc3173266728a7a13`, `backend/src/main/resources/static/aas-registry-openapi.yaml` lines 38, 60 and 196); the server holds no credential of the registry (D77 (OAuth2 off in the local registry), D78 (No credential of the registry in the server) [waits for the owner]) |
| `LOG_LEVEL` | no | `info` | `error`, `warn`, `info` or `debug` |

**The configuration object.** `loadConfig` returns one object with the 31 properties of this table, and no other property. The object, and the object and the list that it holds, are frozen with `Object.freeze`. A variable whose value is the empty text counts as absent. A variable that the table of §9.6 marks as required and that is absent, and a value that fails its rule, are named in the one `ConfigError` of §9.2.1. A variable "when `BINDING=connector`" is required when `BINDING` is `connector`; when `BINDING` is `memory`, the variable is optional, and its default applies, or `null` when the table states no default. A variable outside the table is ignored. An integer is a text of decimal digits without a sign, which `Number` converts. An address is a text that `new URL` accepts with the scheme `http:` or `https:`.

| Variable | Property | Type of the property | Value when the variable is absent |
|---|---|---|---|
| `OWN_BPNL` | `ownBpnl` | string | required |
| `OWN_LEGAL_NAME` | `ownLegalName` | string | required |
| `OWN_LEGAL_NAME_LANGUAGE` | `ownLegalNameLanguage` | string | `"en"` |
| `OWN_ADDRESS` | `ownAddress` | object, the parsed JSON | required |
| `OWN_OPERATOR_IDENTIFIER` | `ownOperatorIdentifier` | string or `null` | `null` |
| `DATABASE_URL` | `databaseUrl` | string | required |
| `DATABASE_SCHEMA` | `databaseSchema` | string | `"public"` |
| `DATABASE_POOL_SIZE` | `databasePoolSize` | number | `10` |
| `PORT` | `port` | number | `8080` |
| `PUBLIC_BASE_URL` | `publicBaseUrl` | string, the value without a trailing `/` | required |
| `BINDING` | `binding` | string, `"memory"` or `"connector"` | required |
| `RECEIVER_RESOLUTION` | `receiverResolution` | string, `"discovery"` or `"address-list"` | `"discovery"` |
| `RECEIVER_ADDRESS_LIST` | `receiverAddressList` | a frozen object from a Business Partner Number to a frozen `{ connectorUrl, did }`, or `null` | `null`; required when `RECEIVER_RESOLUTION` is `address-list` |
| `OPERATOR_TOKEN_SECRET` | `operatorTokenSecret` | string | required |
| `DATA_PLANE_KEY` | `dataPlaneKey` | string | required |
| `DATA_PLANE_KEY_HEADER` | `dataPlaneKeyHeader` | string in lower case, the form of a header name in Node.js | `"x-api-key"` |
| `PARTNER_BPN_HEADER` | `partnerBpnHeader` | string in lower case | `"edc-bpn"` |
| `ACCESS_REGIME` | `accessRegime` | string, `"before-act"` or `"after-act"` | required |
| `PASSPORT_ENDED_DELAY_SECONDS` | `passportEndedDelaySeconds` | number | `5` |
| `OUTBOX_INTERVAL_MILLISECONDS` | `outboxIntervalMilliseconds` | number | `1000` |
| `NOTIFICATION_MAX_ATTEMPTS` | `notificationMaxAttempts` | number | `5` |
| `NOTIFICATION_RETRY_SECONDS` | `notificationRetrySeconds` | number | `60` |
| `NOTIFICATION_ALLOWED_BPNLS` | `notificationAllowedBpnls` | list of strings, or `null` | `null` |
| `PASSPORT_SERVICE_PROVIDER_BPNL` | `passportServiceProviderBpnl` | string or `null` | `null` |
| `CONNECTOR_DATA_PLANE_PUBLIC_URL` | `connectorDataPlanePublicUrl` | string | the default of §9.6 when `BINDING` is `memory`; required otherwise |
| `CONNECTOR_DSP_URL` | `connectorDspUrl` | string | the default of §9.6 when `BINDING` is `memory`; required otherwise |
| `EDC_MANAGEMENT_URL` | `edcManagementUrl` | string or `null` | `null` when `BINDING` is `memory`; required otherwise |
| `EDC_MANAGEMENT_API_KEY` | `edcManagementApiKey` | string or `null` | `null` when `BINDING` is `memory`; required otherwise |
| `EDC_MANAGEMENT_API_KEY_HEADER` | `edcManagementApiKeyHeader` | string in lower case | `"x-api-key"` |
| `DTR_URL` | `dtrUrl` | string or `null` | `null` when `BINDING` is `memory`; required otherwise |
| `LOG_LEVEL` | `logLevel` | string, a value of `LOG_LEVELS` | `"info"` |

The rule of an address applies to `PUBLIC_BASE_URL`, `CONNECTOR_DATA_PLANE_PUBLIC_URL`, `CONNECTOR_DSP_URL`, `EDC_MANAGEMENT_URL` and `DTR_URL`. The variable `BPN_DID_RESOLUTION_URL` of version 11 is removed, because the connector binding resolves a receiver through the own connector (D75), and `loadConfig` ignores the variable as every variable outside the table. The rule of `DATABASE_URL` is an address that `new URL` accepts with the scheme `postgres:` or `postgresql:`. The three header names follow the rule `^[A-Za-z0-9-]{1,64}$`. `EDC_MANAGEMENT_API_KEY` has 32 characters or more, as `DATA_PLANE_KEY` has. `OWN_ADDRESS` is malformed when the text is no JSON object.

The two commands of the database administration read three further variables, which `loadConfig` does not read: `DATABASE_MIGRATION_URL` (the connection string of the role that owns the schema; D60 states when the role also owns the database), `DATABASE_SCHEMA` and `APP_ROLE_PASSWORD` (the password that `npm run create-role` sets for `refserver_app`).

### 9.7 Workflows

Every workflow runs on `pull_request` and on `push` to `main`, on `ubuntu-latest`, with Node.js 24. The versions of the actions are pinned to a commit hash, and Dependabot updates them. The workflows of phases P1 to P3 use three actions: `actions/checkout` (version 7.0.1), `actions/setup-node` (version 7.1.0) and `actions/setup-java` (version 6.3.0). The implementer read the three commit hashes on 2026-11-16 and wrote each with its version as a comment; a later change of a workflow reads the hash of the action again and does not copy a hash from this specification, which states none. The names of the actions and of the container images of this section are not verified against a stored text.

| File | Steps |
|---|---|
| `.github/workflows/checks.yml` | the installation of the package `poppler-utils` of Ubuntu, so that the registry check reads the stored PDF file; `node scripts/requirements-check.mjs`, whose last line starts with `0 problems, 0 quotes skipped`; `node scripts/check-sources.mjs`; `node scripts/check-license-headers.mjs`; `node scripts/check-private-references.mjs`; `node scripts/check-annexes.mjs --require P<n>` with the number of the last delivered phase; `node scripts/spec-gate-check.mjs` with the arguments of §18 |
| `.github/workflows/spectral.yml` | `npx @stoplight/spectral-cli@6 lint docs/api/openAPI.yaml --ruleset .spectral.yaml --fail-severity error`, on a change of `docs/api/` or of `.spectral.yaml` |
| `.github/workflows/samm.yml` | Java 21; the download of the SAMM command line tool 2.11.1 to `tools/samm-cli-2.11.1.jar` with the command of §11.2; `bash scripts/validate-models.sh --generate`; `git diff --exit-code -- docs/api/aspects`, which fails when a generated schema of the commit differs from the output of the tool |
| `.github/workflows/tests.yml` | the Ubuntu form of §11, in one job: the actions that install Node.js 24; a first step that generates the two passwords with `openssl rand -hex 24`, runs `echo "::add-mask::<value>"` for each value before every other use of the value, and writes the variables `POSTGRES_PASSWORD` and `TEST_APP_ROLE_PASSWORD` to the file of `GITHUB_ENV`; a second step that starts the database with `docker run --detach --name test-database --env POSTGRES_PASSWORD --publish 127.0.0.1:5432:5432 postgres:17`, where the option `--env POSTGRES_PASSWORD` without a value takes the value from the environment of the step, so the command line holds no password, and that then runs `docker exec test-database pg_isready -U postgres` up to 60 times at an interval of 2 seconds and fails when the database is not ready; a third step that writes `TEST_DATABASE_URL` (`postgres://postgres:<the generated password>@localhost:5432/postgres`) to the file of `GITHUB_ENV`; `npm ci`, `node ../scripts/check-dependency-licenses.mjs` and `npm test` in `server/`; from phase P6 also `npm ci`, `node ../scripts/check-dependency-licenses.mjs` and `npm test` in `tck/` with `TCK_BINDING=in-process`, so that the workflow runs the licence check of the test kit that §15 item 6 states. **The choice and the reason.** A mask of GitHub Actions holds for the job that registers the mask, and the log of each step prints the environment of the step. The form of phase P3 generated the two passwords in a first job, passed them as job outputs and gave the first password to a service container, so the log of the second job printed both values without a mask. A service container starts before the first step of its job, so the password of a service container cannot be generated and masked in the same job. This specification therefore starts the database with a step and uses no service container and no job output for a password. The database of the workflow exists only for the run and is published on the loopback address of the runner only; the mask is still required, because the log of a public repository is public and a rule of §13 forbids a password in a file or a log. This specification rejects a fixed password in the workflow file, which §13 forbids, and rejects the authentication method `trust`, under which the login of the role `refserver_app` with a wrong password would succeed and the tests would no longer exercise the password of `createAppRole` |
| `.github/workflows/codeql.yml` | CodeQL analysis of the language `javascript-typescript`, also on a weekly schedule |
| `.github/workflows/trufflehog.yml` | TruffleHog scan of the pushed commits with the option that reports only verified secrets |
| `.github/dependabot.yml` | weekly updates of the ecosystems `npm` (directories `/server` and `/tck`), `github-actions` (directory `/`) and `docker` (directories `/server` and `/tck`) |

### 9.8 Packages, tools, images and their licences

The table lists every package, tool and container image that the phases use. The column "Licence" states the licence as the published metadata of the item states the licence; no entry of the column is verified against a stored text, and each entry is to be confirmed by the Eclipse Dash License Tool at the first release. `scripts/check-dependency-licenses.mjs` runs in a directory that holds `package-lock.json`. The script reads the keys of the object `packages` of the lock file, takes every key that starts with `node_modules/`, and reads the field `license` of the one file `<key>/package.json`; the script reads no other `package.json` below `node_modules/`. A licence passes when the licence is one of `MIT`, `ISC`, `Apache-2.0`, `BSD-2-Clause`, `BSD-3-Clause`, `0BSD`, `BlueOak-1.0.0` and `CC0-1.0`; an SPDX expression with `OR` passes when one of its alternatives passes, an expression with `AND` passes when each of its parts passes, and the script removes one pair of surrounding parentheses first. A package without the field, or with a field that is not a string, does not pass. The script prints one line `<key>: <licence>` per package that does not pass, prints the count as `<n> packages outside the licence list`, and exits 1 when the count is above 0. The script exports the two functions `listLockedPackages(directory)` and `licencePasses(licence)`, and `server/test/dependencyLicenses.test.mjs` tests both, with a nested `package.json` without a licence that the script must not read. The implementer reports a package outside the list and does not remove the package from the check. `NOTICE.md` names the file `DEPENDENCIES` `[live]`, which the owner creates with the Eclipse Dash License Tool (§3.2).

| Item | Used by | Phase | Licence |
|---|---|---|---|
| `express`, major version 5 | the server | P5 | MIT |
| `pg`, major version 8 | the server, the test kit | P3 | MIT |
| `ajv`, major version 8 | the server, the test kit (the contract schemas, 2020-12 dialect) | P1 | MIT |
| `ajv-formats`, major version 3 | the server, the test kit | P1 | MIT |
| `ajv-draft-04`, major version 1 | the server (the stored and the generated aspect schemas, draft-04 dialect) | P2 | MIT |
| `yaml`, major version 2 | the tests of the server and the test kit | P1 | ISC |
| `@stoplight/spectral-cli`, major version 6 (run by `npx`, no dependency of a package file) | the OpenAPI lint | P1 | Apache-2.0 |
| SAMM command line tool 2.11.1 (`samm-cli-2.11.1.jar`, a tool of the Eclipse Semantic Modeling Framework; 110,342,711 bytes; SHA-256 `fab66a72e1969ff2e4d9db5d1c0eeb55936f89e2159045576301ea46c49ffc0f`, observed on 2026-11-16) | the model validation | P2 | MPL-2.0 |
| the container image `eclipse-temurin:21` (a Java 21 runtime) | the SAMM command line tool | P2 | GPL-2.0 with the Classpath exception, for the runtime |
| the container image `postgres:17` (PostgreSQL 17) | the tests | P3 | PostgreSQL licence |
| the container image `node:24` (Node.js 24) | every phase, and the base image of `server/Dockerfile` | P1 | MIT for Node.js |
| the connector control plane, the connector data plane and the Digital Twin Registry of Eclipse Tractus-X | the connector binding | P7 | Apache-2.0 |
| the secret store and the identity services that the connector needs | the connector binding | P7 | the test images of the table below, which the repository does not distribute; phase P7 records the licence of each image |
| CodeQL (the GitHub action and its analysis engine) | the workflow | P8 | MIT for the action; the analysis engine has terms of GitHub |
| TruffleHog | the workflow | P8 | AGPL-3.0; the workflow runs the tool and distributes no part of the tool |

**The test images (decision D82, HashiCorp Vault as a test-only image).** The local deployment of `tck/docker-compose.yml` pulls these images at test time. The repository distributes none of them, so their licences stay outside the licence list of the distributed packages above, and `NOTICE.md` names the one image whose licence is no open source licence.

| Image | Service of the deployment | Licence |
|---|---|---|
| `tractusx/edc-controlplane-postgresql-hashicorp-vault:0.13.0`, `tractusx/edc-dataplane-hashicorp-vault:0.13.0` | the control plane and the data plane of each connector | Apache-2.0 |
| `tractusx/sldt-digital-twin-registry:0.13.0` | the registry of each participant | Apache-2.0 |
| `tractusx/bdrs-server-memory:0.6.0` | the BPN-DID Resolution Service | Apache-2.0 |
| `tractusx/ssi-dim-wallet-stub:0.1.0` | the one wallet stub (decision D80, One wallet stub for the three companies) | not recorded in `tck/README.md`; the implementer reads the licence file of `eclipse-tractusx/ssi-dim-wallet-stub` at the tag `0.1.0` and records the licence there |
| `hashicorp/vault:1.16.1` | the secret store of each connector | Business Source License 1.1 (BUSL-1.1), a source-available licence that is not on the list above (`hashicorp/vault` at the tag `v1.16.1`, `LICENSE` lines 1 and 2) |
| `postgres:18.0`, `postgres:17` | the databases of the connectors, and of the servers and the registries | PostgreSQL licence |
| `node:24` | the seed service and the base image of `server/Dockerfile` | MIT for Node.js |

The implementer pins each npm package to the latest release of its stated major version in the lock files. The major versions are not verified against a stored text.

## 10. Data contract

### 10.1 The notification message

- **The annex.** §20 prints `docs/api/openAPI.yaml` and the eight schema files of `docs/api/schemas/` in full, and the implementer copies them. The sentences and the two tables of this section describe the files.
- **The envelope.** A notification is the JSON object `{ "header": <MessageHeader>, "content": <content of the operation> }`, as `sources/Tractus-X/kits-26.09/industry-core-kit/software-development-view/notifications.mdx` states `[live]`. `docs/api/schemas/LifecycleNotification.schema.json` defines the envelope: one definition per operation under `$defs`, each an object with exactly the two required properties `header` and `content` and with `additionalProperties: false`. The definition of an operation fixes the context of the header with a `const` and references the content schema of the operation (decision D56, One schema file for the envelope, and the context as a constant). The request body of each operation in `docs/api/openAPI.yaml` is a `$ref` to the definition of the operation.
- **The header.** `docs/api/schemas/MessageHeader.schema.json` defines the header with the properties of the table below and with `additionalProperties: false`. The property `context` is an enumeration of the four contexts of Table 4.3 of the proposal, as section 4.3 item 4 of the proposal requires and as the stored file `sources/Tractus-X/kits-26.09/traceability-kit/openapi/notifications_2-0-0.yaml` constrains the context of its API `[live]`. The stored Industry Core KIT text shows the first seven properties in its example `[live]`, and the stored Traceability file holds the header schema of version 2.0.0 of the model with the property `relatedMessageId` `[live]`. The file of the aspect model `urn:samm:io.catenax.shared.message_header:3.0.0#MessageHeaderAspect` is not stored, so the patterns of the table are the patterns of this specification and are not verified against the model file.
- **The content.** Each of the four operation schema files defines the content of its operation and not the whole message. The content holds the properties of Table 4.4 of the proposal. Every property is required except `materialRecyclingCertificateCatenaXId`. Every content schema sets `additionalProperties: false`. A passport identifier is a string of one character or more without an upper limit, because Table 4.4 of the proposal and the stored DPP Metadata schema state no limit.
- **The dialect.** Each of the eight schema files declares `"$schema": "https://json-schema.org/draft/2020-12/schema"`, an `$id` equal to its file name, a `title` and a `description`, and every property carries a `description` (decision D21, One definition of the message).
- **The date and time.** A property that holds a date and time has the format `date-time` of RFC 3339, which Table 4.4 of the proposal names. The reference server asserts the format: the validator of §9.2 is created with the formats of `ajv-formats`, so a value without a time zone and a text that is no date are refused, although the 2020-12 dialect alone treats `format` as an annotation. Each such property also carries the pattern `^[0-9]{4}-[0-9]{2}-[0-9]{2}[Tt]`, because the format of `ajv-formats` 3.0.1 admits a space between the date and the time, and the grammar of RFC 3339 section 5.6 requires the letter T.
- **The identifiers.** A property that holds a `catenaXId`, the property `messageId` and the property `relatedMessageId` have the pattern `UUID_PATTERN` of §9.2.1, which is the pattern of the stored shared model (decision D50, Every admitted form of an identifier accepted, one form sent). The reference server normalises a received identifier and always sends and serves the lower-case form with the prefix. A property that holds a Business Partner Number of a legal entity (BPNL) has the pattern `^BPNL[a-zA-Z0-9]{12}$`.


| Header property | Required | Schema |
|---|---|---|
| `messageId` | yes | string, `UUID_PATTERN`; unique per message |
| `context` | yes | string, one of the four contexts of the table below; the envelope definition of an operation admits only the context of that operation |
| `sentDateTime` | yes | string, format `date-time` |
| `senderBpn` | yes | string, the BPNL pattern |
| `receiverBpn` | yes | string, the BPNL pattern |
| `version` | yes | the constant `3.0.0` |
| `expectedResponseBy` | no | string, format `date-time` |
| `relatedMessageId` | no | string, `UUID_PATTERN` |

| Operation | Context | Content property | Schema | Source on the sending side |
|---|---|---|---|---|
| NewPassportIssued | `BatteryPass-BatteryPassLifecycleNotificationAPI-NewPassportIssued:1` | `passportIdentifier` | string, 1 character or more | `passports.passport_identifier` of the new passport |
| | | `catenaXId` | `UUID_PATTERN` | `passports.id` of the new passport |
| | | `operation` | one of the four values of `passport_lineage_links.operation` | the lineage link |
| | | `operationDate` | `date-time` | `passport_lineage_links.operation_date` |
| | | `predecessorPassportIdentifier` | string, 1 character or more | `passport_lineage_links.predecessor_passport_identifier` of the link that names the receiver |
| BatteryRepaired | `BatteryPass-BatteryPassLifecycleNotificationAPI-BatteryRepaired:1` | `passportIdentifier` | string, 1 character or more | the request of `EP-REPORT-REPAIR` |
| | | `repairDate` | `date-time` | the request |
| | | `repairCertificateCatenaXId` | `UUID_PATTERN` | the request |
| BatteryBecameWaste | `BatteryPass-BatteryPassLifecycleNotificationAPI-BatteryBecameWaste:1` | `passportIdentifier` | string, 1 character or more | the request of `EP-REPORT-WASTE` |
| | | `successorBpnl` | the BPNL pattern | the request |
| | | `successorRole` | `producer`, `producerResponsibilityOrganisation` or `wasteManagementOperator` | the request |
| | | `date` | `date-time` | the request field `wasteDate` |
| PassportEnded | `BatteryPass-BatteryPassLifecycleNotificationAPI-PassportEnded:1` | `passportIdentifier` | string, 1 character or more | the request of `EP-REPORT-RECYCLING` |
| | | `recyclingDate` | `date-time` | the request |
| | | `recyclerBpnl` | the BPNL pattern | `config.ownBpnl` of the reporting deployment |
| | | `materialRecyclingCertificateCatenaXId` | `UUID_PATTERN`, optional | the request |

`docs/api/openAPI.yaml` holds these parts, as §20 prints them: `openapi: 3.1.0`; `info` with the title "Battery Passport Lifecycle Notification API", the version `1.0.0`, a description, a contact and the license object `{ name: "CC-BY-4.0", identifier: "CC-BY-4.0" }`; one entry of `servers` with the address `{baseUrl}/api/lifecycle-notifications` and the variable `baseUrl` with the default `https://provider.example`; one tag `LifecycleNotification`; the four paths of §9.3, each with one `post` operation with the tag, a summary, a description that names the sender, the receivers and the context, an `operationId` equal to the operation name, a required request body of the content type `application/json` whose schema is a `$ref` to `schemas/LifecycleNotification.schema.json#/$defs/<Operation>`, and the ten responses `200`, `400`, `401`, `403`, `404`, `405`, `409`, `413`, `422` and `500`; and ten entries of `components.responses`, each with a description that names the refusal ids of §9.5 of its status and with a `$ref` to `schemas/NotificationAccepted.schema.json` or to `schemas/ErrorResponse.schema.json`. The file holds no `security` entry and no `securitySchemes`. `NotificationAccepted.schema.json` requires `messageId` (`UUID_PATTERN`) and `outcome` (`applied`, `recorded` or `duplicate`) and admits no other property. `ErrorResponse.schema.json` requires `success` (the constant `false`), `error` (an object with the two required strings `message` and `code`, each of one character or more) and `messages` (a list of one or more objects with the required properties `messageType`, one of `Error`, `Warning`, `Info` and `Exception`, and `text`, a string of one character or more); the response, its object `error` and each item of `messages` admit no other property. The four values of `messageType` are the values of the result object of Part 2 of the Asset Administration Shell (AAS) specification, which is cited and not stored, so the four values are not verified against a stored text.

### 10.2 The request bodies of the operator endpoints

Every schema of `server/schemas/` declares the 2020-12 dialect and sets `additionalProperties: false`. A body that fails its schema answers `ERR-LC-BODY-INVALID`. A property of the form `<name>Bpnl` has the BPNL pattern, and a property whose name ends with `CatenaXId` or equals `catenaXId` has `UUID_PATTERN`; the route normalises each such value before the service reads the value. A date has the format `date`, and a date and time has the format `date-time`.

| Schema | Properties | Rule |
|---|---|---|
| `batteryModel` | `manufacturerPartId` (required, 1 to 200 characters); `originalModel` (optional) with the required properties `catenaXId` and `manufacturerBpnl` | the model is stored for the own company |
| `createPassport` | `batteryModelId` (the 36 characters of a UUID), `batteryIdentifier` (1 to 200 characters), `batteryCategory` (`lmt`, `ev`, `industrial` or `stationary`), `facilityBpns` (`^BPNS[a-zA-Z0-9]{12}$`), `dateOfManufacture`, `originalPurpose` (1 to 2000 characters), all required; `dateIntoService`, `passportIdentifier` (1 to 200 characters) (optional) | the status is `original` |
| `issueNewPassport` | `operation` (one of the four lineage operations), `predecessors` (1 to 20 entries, each with `passportIdentifier`, `catenaXId`, `dataProviderBpnl`, `batteryIdentifier`, `lifeCycleStage` (one of the five status values), `originalPurpose` and `originalModelCatenaXId`, all required), `batteryModelId`, `batteryIdentifier`, `batteryCategory`, `facilityBpns`, `purpose` (1 to 2000 characters), `dateOfManufacture` (the date of the treatment), `dateIntoService`, `ratedCapacityAh` (a number from 0.01 to 99999999.99, `multipleOf` 0.01), `capacityFadePercent` and `powerFadePercent` (numbers from 0 to 100, `multipleOf` 0.01), `expectedLifetimeYears` (a number from 0.1 to 999.9, `multipleOf` 0.1), all required, the bounds and the steps of the four columns of §9.4.1; `operationDate` (optional; the current time of the clock when absent), `passportIdentifier` (optional) | D13 (Predecessors of another data provider), D14 (The identifier rule), D15 (The own values of a new passport), D35 (The reference to the original battery model), D40 (The admission rule) |
| `reportRepair` | `passportIdentifier`, `dataProviderBpnl`, `repairDate`, `repairCertificateCatenaXId`, all required | the receiver is `dataProviderBpnl`; D48 (The repair certificate before the notice) [waits for the owner] |
| `reportWaste` | `passportIdentifier`, `dataProviderBpnl`, `successorBpnl`, `successorRole`, `wasteDate`, all required | the receivers of §10.3 |
| `reportRecycling` | `passportIdentifier`, `dataProviderBpnl`, `nameplateManufacturerBpnl`, `recyclingDate`, all required; `receivedFromSuccessorBpnl` (optional: absent when the waste status of the battery was never recorded and the recycler received the battery from no successor), `materialRecyclingCertificateCatenaXId`, `predecessorDataProviderBpnls` (0 to 20 values) (optional) | the receivers of §10.3 |
| `forwardLink` | `messageId` (required, `UUID_PATTERN`) | the `message_id` of a received NewPassportIssued |
| `accessRecord` | `recipientBpnl`, `recipientRole` (one of the six roles of §9.4.1), `aspectKey` (one of the ten stored aspect keys, `lifecycle` or `successors`), all required | D29 (The access regime and the admitted roles) |
| `purchaserChange` | `purchaserBpnl` (required), the Business Partner Number of the application acting for the new purchaser; `purchaserAgentBpnl` (optional) | D30 (The change of purchaser) |
| `successorAuthorisation` | `authorisationRef` (required, 1 to 500 characters), the reference of the successor's written authorisation, which holds no name of a person; `validFrom` (required, a date); `validTo` (optional, a date not before `validFrom`) | D18 (The successor's authorisation with its period) |
| `issuerContract` | the provider form: `passportIdentifier` and `issuerBpnl` (required), `productCondition` (optional, an object). The issuer form: `passportIdentifier`, `providerBpnl` and `batteryIdentifier` (required). The schema is a `oneOf` of the two forms | D38 (The sharing of individual battery information) |

The passport record that `EP-PASSPORT-READ` and the operator endpoints answer holds `id` (the 36 characters of the UUID in lower case), `catenaXId` (the normalised form of §9.2.1), `passportIdentifier`, `batteryIdentifier`, `manufacturerBpnl`, `batteryModelId`, `lifecycleStatus`, `batteryCategory`, `facilityBpns`, `dateOfManufacture`, `dateIntoService`, the four performance values, `wasteSuccessor` (null, or `successorBpnl`, `successorRole` and `date`), `successorAuthorisation` (null, or `authorisationRef`, `validFrom` and `validTo`), `endOfPassport` (null, or `recyclingDate`, `recyclerBpnl` and `materialRecyclingCertificateCatenaXId`), `isSuperseded` (true when the passport has a successor link), `responsibleOperator` (the open responsibility interval), `repairEntries` (the list of the repair entries with `repairDate`, `repairCertificateCatenaXId` and `repairerBpnl`) and `storedAspectKeys`.

### 10.3 The receivers

| Operation | Receivers | Source of each Business Partner Number |
|---|---|---|
| NewPassportIssued | the data provider of each original passport, one notification per predecessor link | `predecessors[].dataProviderBpnl` of the request |
| BatteryRepaired | the data provider of the passport | `dataProviderBpnl` |
| BatteryBecameWaste | the data provider of the passport; the named successor | `dataProviderBpnl`; `successorBpnl` |
| PassportEnded | the data provider of the passport; the manufacturer that the nameplate names; the successor from whom the recycler received the battery; the data provider of each predecessor passport that the request names | `dataProviderBpnl`; `nameplateManufacturerBpnl`; `receivedFromSuccessorBpnl`, when the request holds the property; `predecessorDataProviderBpnls` |

Two rules that name one Business Partner Number for one passport produce one notification. A receiver equal to the own Business Partner Number produces no notification (decision D12, No notification to the own company). A remanufacturing from two original passports of one data provider produces two notifications to that data provider. The value of `not_before` is the current time of the clock for the first three operations, and the current time plus `config.passportEndedDelaySeconds` for PassportEnded (decision D1, The delay of the end notice). The deployment that records the end of a passport, by a received PassportEnded or by a local application, plans one further PassportEnded for `config.passportServiceProviderBpnl` when the variable holds a value: the sender is the data provider, the content holds the recorded values of the end, and `not_before` is the record time plus `config.passportEndedDelaySeconds` (decision D34 [waits for the owner], The passport service provider as a receiver). The column `passport_identifier` of `notifications_sent` and of `notifications_received` holds `content.predecessorPassportIdentifier` for NewPassportIssued and `content.passportIdentifier` for the other three operations. The operator of the recycler supplies `nameplateManufacturerBpnl` in the request, because the reference server of the recycler reads no nameplate of another data provider (decision D3 [waits for the owner], The access map and the whole aspect). `EP-REPORT-REPAIR` first reads the shell `urn:uuid:` and the UUID of `repairCertificateCatenaXId` in the twin registry of the own deployment and refuses `ERR-LC-CERTIFICATE-NOT-REGISTERED` when the registry holds no such shell (D48 [waits for the owner]).

### 10.4 The receiving step and its failure mapping

A receiving endpoint runs the checks of the first table in the order of the table, and the first failed check answers its refusal. The row lock of the sixth check precedes the duplicate check, so that two concurrent copies of one message answer `applied` and `duplicate` for each of the four operations, also for BatteryBecameWaste and PassportEnded, whose step admits no second application (decision D8, Idempotency by the message identifier). The checks from the sixth check on run in one transaction of `runWrite`, and every comparison of an identifier reads the normalised message of §9.2.1.

| Order | Check | Refusal id |
|---|---|---|
| first | the body validates against the envelope definition of the operation, `LifecycleNotification.schema.json#/$defs/<Operation>`. A validator error at the root of the body (a body that is no object, a missing `header` or `content`, a third property) answers `ERR-RX-CONTENT-INVALID`. Otherwise a validator error below `/header`, other than an error of the keyword `const` at `/header/context`, answers `ERR-RX-HEADER-INVALID` | `ERR-RX-CONTENT-INVALID` or `ERR-RX-HEADER-INVALID` |
| second | a validator error below `/content` answers `ERR-RX-CHANGE-OUTSIDE-STEP` when every such error is an error of the keyword `additionalProperties`, and `ERR-RX-CONTENT-INVALID` otherwise | `ERR-RX-CONTENT-INVALID` or `ERR-RX-CHANGE-OUTSIDE-STEP` |
| third | the remaining validator error, the keyword `const` at `/header/context`, means that the header carries the context of another operation | `ERR-RX-CONTEXT-MISMATCH` |
| fourth | `header.receiverBpn` equals `config.ownBpnl` | `ERR-RX-RECEIVER-MISMATCH` |
| fifth | `header.senderBpn` equals the Business Partner Number of the partner subject, and for PassportEnded `content.recyclerBpnl` equals `header.senderBpn` as well (decision D70, The recycler of PassportEnded is the sender) | `ERR-RX-SENDER-MISMATCH` |
| sixth | the endpoint reads the passport that the content names with `SELECT ... FOR UPDATE`, when the content names a passport of the own company, and determines nothing yet; a second copy of the same message waits here until the first copy has committed or rolled back (finding R45-001) | none |
| seventh | the endpoint reads the received record with the normalised `messageId`. A stored record with the same `sender_bpnl`, the same `header.context` and a `content` equal to the normalised received content answers 200 with the outcome `duplicate` and ends the request; the endpoint leaves `sentDateTime` and `expectedResponseBy` out of the comparison. Every other stored record answers the refusal | `ERR-RX-MESSAGE-ID-REUSED` |
| eighth | the endpoint determines the outcome of the second table from the passport of the sixth check without a change, and answers the refusal of the second table when the step refuses | the refusal of the step |
| ninth | the endpoint inserts the received record with `INSERT ... ON CONFLICT (message_id) DO NOTHING`. When the statement inserts no record, a concurrent copy of a message that names no passport of the own company has committed first, and the endpoint reads the stored record and answers as the seventh check states | `ERR-RX-MESSAGE-ID-REUSED` |
| tenth | the endpoint applies the step of the second table and commits | a database refusal by the mapping of §9.5 |

The received record stores the normalised message, `received_at` equal to the current time of `clock`, and the `passport_identifier` of §10.3 (D8).


| Operation | Passport that the content names | Step | Outcome |
|---|---|---|---|
| NewPassportIssued | `predecessorPassportIdentifier` names a passport of the own company | stores the received record and changes no passport | `applied` |
| NewPassportIssued | no such passport | none | `ERR-RX-PASSPORT-UNKNOWN` |
| BatteryRepaired | `passportIdentifier` names a passport of the own company whose status is not `waste` and that has not ended | inserts the repair entry and sets the status `re-used`; a notification with a `repairCertificateCatenaXId` that a repair entry of the passport holds adds no entry (decision D19 [waits for the owner], The repair entry) | `applied` |
| BatteryRepaired | no passport of the own company | none | `ERR-RX-PASSPORT-UNKNOWN` |
| BatteryRepaired | a passport of the own company whose status is `waste` or that has ended | none | `ERR-RX-STEP-REFUSED` |
| BatteryBecameWaste | a passport of the own company whose status is not `waste` and that has not ended | when the date of the notification is not before `valid_from` of the open responsibility interval: sets the status `waste` with the successor, the role and the date that the notification names, sets `valid_to` of the open responsibility interval to the date, inserts the successor's interval with `valid_from` equal to the date, and inserts the access record of the successor for the aspect key `lifecycle` with the role `successor` and `valid_from` equal to the current time of `clock` (decision D17, The named waste successor) | `applied` |
| BatteryBecameWaste | a passport of the own company whose open responsibility interval starts after the date of the notification | none | `ERR-RX-STEP-REFUSED` |
| BatteryBecameWaste | a passport of the own company in the status `waste`, or that has ended | none | `ERR-RX-STEP-REFUSED` |
| BatteryBecameWaste | no passport of the own company | stores the received record only (decision D7, The receiver guard) | `recorded` |
| PassportEnded | a passport of the own company that has not ended, in every status, when `recyclingDate` is not before `waste_date` of a waste passport and not before `valid_from` of the open responsibility interval | sets `recycling_date`, `recycler_bpnl` and the certificate reference, leaves the status unchanged, and writes the pending notification for the passport service provider of §10.3 when the variable holds a value (D20 (The end of a passport from every status), D34 [waits for the owner]) | `applied` |
| PassportEnded | a passport of the own company that has ended, or a `recyclingDate` before the waste date or before the start of the open responsibility interval | none | `ERR-RX-STEP-REFUSED` |
| each of the four operations | a date and time of the content (`operationDate`, `repairDate`, `date` or `recyclingDate`) whose UTC date is after the current UTC date of `clock`, for a passport of the own company (the rule of the dates of §9.2.2) | none | `ERR-RX-STEP-REFUSED` |
| PassportEnded | no passport of the own company | stores the received record only (D7) | `recorded` |

An error that no check names answers `ERR-RX-INTERNAL`, and the transaction rolls back. A failed authentication answers `ERR-AC-UNAUTHENTICATED`, and a missing capability answers `ERR-AC-CAPABILITY-MISSING`; neither is a refusal of a lifecycle rule. The local application of `reportEvent` applies the same step with the own Business Partner Number as the sender, inserts no received record for BatteryRepaired, BatteryBecameWaste and PassportEnded, and maps a refused step to `ERR-LC-STATUS-NOT-ADMITTED` or `ERR-LC-PASSPORT-ENDED`.

### 10.5 The connector asset and the data offers

Every submodel offer carries the `dct:type` `cx-taxo:BatteryPass` with `cx-common:version` `1.0` and the property `aas-semantics:semanticId`, as CX-0160 (Battery Passport) section 4.1 states (`https://catenax-ev.github.io/docs/next/standards/CX-0160-BatteryPassport`, read on 2026-11-19, version 1.1.0 of CX-Neptune); the value is the constant `SUBMODEL_DCT_TYPE` of `server/src/connector/policyBuilder.mjs`, and the version is the constant `SUBMODEL_DCT_VERSION` of the same module (finding 3 of the verification of phase P7). Every offer carries the usage purpose `cx.circular.dpp:1` and the framework agreement of §9.2.5 in its usage policy.

| Offer | Asset id | `dct:type`, version and semantic identifier | Path behind the data plane | Access (the `allowedBpnls` of the offer contract) |
|---|---|---|---|---|
| the lifecycle notification API | `asset-lifecycle-notification-1.0` | `cx-taxo:BatteryPassLifecycleNotificationAPI`, `cx-common:version` `1.0`, no semantic identifier | `/api/lifecycle-notifications` | `config.notificationAllowedBpnls`, or every participant without a value (decision D47 [waits for the owner], The access to the notification asset) |
| the lifecycle submodel of a passport | `lifecycle-<passports.id>` | `SUBMODEL_DCT_TYPE`, `cx-common:version` `1.0`; the semantic identifier of the lifecycle model | `/api/passports/<passports.id>/submodels/lifecycle` | the Business Partner Numbers of the open access records of the aspect key `lifecycle`; an empty list admits no participant, and the asset stays registered |
| the successors submodel of a passport | `successors-<passports.id>` | `SUBMODEL_DCT_TYPE`, `cx-common:version` `1.0`; the semantic identifier of the successors model | `/api/passports/<passports.id>/submodels/successors` | the Business Partner Numbers of the open access records of the aspect key `successors` |
| each stored payload of a passport | `<aspectKey>-<passports.id>` | `SUBMODEL_DCT_TYPE`, `cx-common:version` `1.0`; the semantic identifier of the aspect key | `/api/passports/<passports.id>/submodels/<aspectKey>` | every participant when the access decision of §9.2.4 admits a partner without an access record (D3 [waits for the owner]); otherwise the Business Partner Numbers of the open access records of the aspect key |
| the access map of a battery model | `access-map-<battery_models.id>` | `SUBMODEL_DCT_TYPE`, `cx-common:version` `1.0`; the semantic identifier of the access map model | `/api/battery-models/<battery_models.id>/submodels/access-map` | every participant |
| the individual battery information of a provider contract | `battery-information-<issuer_contracts.id>` | `SUBMODEL_DCT_TYPE`, `cx-common:version` `1.0`; the semantic identifier of the aspect key `product-condition`; the property `passportIdentifier` | `/api/issuer-contracts/<issuer_contracts.id>/battery-information` | the one Business Partner Number `issuer_bpnl`, while the contract is open |

- The data plane appends the suffix `/submodel` of the submodel descriptor to the path of a submodel offer (§9.2.6, §9.3).
- `policyBuilder.mjs` adds none of the three proposed usage purposes of Table 2.2 of the proposal to an offer, because CX-0152 (Policy Constraints for Data Exchange) has not registered the purposes (section 2.2 item 5 of the proposal).
- After the end of a passport, `withdrawDatasetOffers` withdraws the offers of the ten stored aspect keys of the passport, and `publishPassportOffers` publishes only the offers of the lifecycle submodel and of the successors submodel of an ended passport (decision D33 [waits for the owner], The offers of an ended passport).

### 10.6 The aspect keys, the models and the governed elements

| Aspect key | Short name (`idShort`) | Semantic identifier | Twin | Payload source | Schema that validates a stored payload |
|---|---|---|---|---|---|
| `lifecycle` | `batteryPassportLifecycle` | `urn:samm:io.catenax.battery.passport_lifecycle:1.0.0#BatteryPassportLifecycle` | PartInstance | `readLifecyclePayload` | none: the payload is built |
| `successors` | `batteryPassportSuccessors` | `urn:samm:io.catenax.battery.passport_successors:1.0.0#BatteryPassportSuccessors` | PartInstance | `readSuccessorsPayload` | none: the payload is built |
| `access-map` | `batteryPassportAccessMap` | `urn:samm:io.catenax.battery.passport_access_map:1.0.0#BatteryPassportAccessMap` | PartType | `readAccessMap` | `docs/api/aspects/BatteryPassportAccessMap-schema.json`, a planned file of §7 |
| `digital-nameplate` | `batteryNameplate` | `urn:samm:io.admin-shell.idta.batterypass.digital_nameplate:1.0.0#BatteryNameplate` | PartInstance | stored | `sources/IDTA/io.admin-shell.idta.batterypass.digital_nameplate/1.0.0/gen/NameplateBattery-schema.json` |
| `technical-data` | `technicalData` | `urn:samm:io.admin-shell.idta.batterypass.technical_data:1.0.0#TechnicalData` | PartInstance | stored | `sources/IDTA/io.admin-shell.idta.batterypass.technical_data/1.0.0/gen/TechnicalDataBattery-schema.json` |
| `product-condition` | `productCondition` | `urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#ProductCondition` | PartInstance | stored | `sources/IDTA/io.admin-shell.idta.batterypass.product_condition/1.0.0/gen/ProductConditionBattery-schema.json` |
| `dpp-metadata` | `dppMetadata` | `urn:samm:io.admin-shell.idta.dpp.dpp_metadata:1.0.0#DppMetadata` | PartInstance | stored | `sources/IDTA/io.admin-shell.idta.dpp.dpp_metadata/1.0.0/gen/DppMetadata-schema.json` |
| `handover-documentation`, `carbon-footprint`, `material-composition`, `circularity` | `handoverDocumentation`, `carbonFootprint`, `materialComposition`, `circularity` | `urn:samm:io.admin-shell.idta.batterypass.handover_documentation:1.0.0#HandoverDocumentation` (CX-0160 section 3.3.3), `urn:samm:io.admin-shell.idta.batterypass.carbon_footprint:1.0.0#CarbonFootprintBattery` (CX-0160 section 3.4.3; finding 4 of the verification of phase P7 corrects the end `#CarbonFootprint` of version 11), `urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#MaterialComposition` (CX-0160 section 3.7.3) and `urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#Circularity` (CX-0160 section 3.8.3), each read on 2026-11-19 at `https://catenax-ev.github.io/docs/next/standards/CX-0160-BatteryPassport`; the four identifiers are constants of `ASPECTS` | PartInstance | stored | none (decision D28, Supplied payloads) |
| `serial-part` | `serialPart` | `urn:samm:io.catenax.serial_part:3.0.0#SerialPart`, as the stored Industry Core KIT text of §9.2.6 holds the identifier `[live]` | PartInstance | stored | none (D28) |
| `single-level-bom-as-built` | `singleLevelBomAsBuilt` | `urn:samm:io.catenax.single_level_bom_as_built:3.0.0#SingleLevelBomAsBuilt`, the identifier of CX-0127 (Industry Core: Part Instance) 2.0.2 of CX-Titan (`https://catenax-ev.github.io/docs/standards/CX-0127-IndustryCorePartInstance`, read on 2026-11-19); CX-0127 3.0.0 of the CX-Neptune preview requires `urn:samm:io.catenax.industry_core.single_level_bom_as_built:4.0.0#SingleLevelBomAsBuilt` and the interpretation of version 3.0.0 (`https://catenax-ev.github.io/docs/next/standards/CX-0127-IndustryCorePartInstance` sections 3.4.4 and 6), and the reference server keeps the CX-Titan value by the owner's standing rule of 2026-10-26: "we need to become 100% compliant with Titan, and become compliant with Neptune later" (`requirements/Owner_instructions-Francesco_verbatim/2026-10-26_battery_passport_fallback_and_neptune_priority.md`); the identifier is a constant of `ASPECTS` | PartInstance | stored | none (D28) |

The ten stored keys of `passport_aspect_payloads.aspect_key` are the ten keys whose payload source is "stored". The stored schemas of `sources/IDTA/` and the schemas that the SAMM command line tool generates declare the draft-04 dialect `[live]`, so `server/src/validation/schemaValidator.mjs` compiles them with `ajv-draft-04` and compiles the schemas of `docs/api/schemas/` and of `server/schemas/` with the 2020-12 class of `ajv` (D21).

§21 prints the three Turtle files, the three `metadata.json` files, the three `RELEASE_NOTES.md` files, the three example payloads, the module `server/src/validation/aspectSchemaCompiler.mjs` and the script `scripts/validate-models.sh` in full, and the implementer copies them (decision D58, Normative annexes). The three models hold exactly the properties, the entities, the characteristics and the enumeration values of sections 3.2.2, 3.3 and 3.4.2 of the proposal, and these rules describe the files of §21:

- Each file declares the prefixes of the SAMM meta model 2.1.0 and its own namespace, and the lifecycle model and the successors model import `urn:samm:io.catenax.shared.uuid:2.1.0#` and `urn:samm:io.catenax.shared.business_partner_number:2.0.0#`, the two shared models that `sources/Tractus-X/semantic-models/` stores `[live]` (decision D32, The stored shared models).
- The aspect, each property, each entity, each characteristic, each enumeration, each trait and each constraint carries a `samm:preferredName` and a `samm:description` in English. The description of a property is the text of the column "Meaning" of the proposal. Each property with a scalar value carries a `samm:exampleValue`, as the stored models do. Each enumeration has the data type `xsd:string`. Each aspect holds the two empty lists `samm:operations ( )` and `samm:events ( )`.
- The name of a property in a payload is the name of the property, so no property carries `samm:payloadName`. A property that the proposal marks as not mandatory is declared with `samm:optional true`. The successors model declares its own enumeration of the four operations, because one Catena-X aspect model imports only shared models.
- Each `metadata.json` holds the one line `{ "status" : "draft" }`, the form of the stored files `[live]`. Each `RELEASE_NOTES.md` follows the form of the stored release notes (the heading "Changelog", the heading of the version with its date, the heading "Added") and ends with the NOTICE section.
- **The folder layout (decision D64, The generated schemas outside `models/`, and one compiler of the draft-04 schemas).** Each namespace folder of `models/` holds exactly the files of a stored namespace of `sources/Tractus-X/semantic-models/` `[live]`: `RELEASE_NOTES.md` and, in the version folder, `<Aspect>.ttl` and `metadata.json`. No folder of `models/` holds a folder `gen`, because no stored Tractus-X namespace holds one. The generated schema and the example payload of each model are files of `docs/api/aspects/`: `<Aspect>-schema.json`, the unchanged output of `java -jar tools/samm-cli-2.11.1.jar aspect <file> to schema`, which the script writes, and `<Aspect>.json`, the example payload of §21, which the implementer copies. The tool has no verified sub-command for a sample payload, so the example payload is written by hand: the example of section 3.2.2 of the proposal for the lifecycle model, the example of section 3.4.2 for the access map model, and own values for the successors model, for which the proposal holds no example. A contribution to the Tractus-X semantic model repository takes the folders of `models/` unchanged and leaves out `docs/api/aspects/`.
- **The compiler of the draft-04 aspect schemas (D64).** `server/src/validation/aspectSchemaCompiler.mjs` exports `createAspectSchemaCompiler()` and the constant `SAMM_SCHEMA_KEYWORDS`. The function returns a new instance of the class of `ajv-draft-04` with the options `{ strict: true, allErrors: true }`, with the formats of `ajv-formats`, and with the two keywords `x-samm-aspect-model-urn` and `components` added by `addKeyword`. The schemas that the SAMM command line tool generates and the stored schemas of `sources/IDTA/` hold both keywords, and the default compiler in strict mode refuses the first keyword (observed on 2026-11-16 with `ajv` 8.20.0 and `ajv-draft-04` 1.0.0). Strict mode stays on, so every other unknown keyword and every unknown format fails the compilation, and the format `date` of the access map is asserted. Every module and every test that compiles a draft-04 schema calls the function: `server/test/modelExamples.test.mjs` in phase P2, and `server/src/validation/schemaValidator.mjs`, `server/src/submodels/submodelService.mjs` and `server/src/submodels/accessMapService.mjs` from phase P4 on. No other module creates a draft-04 compiler.


`readSubmodel` writes the governed elements over a stored payload at the paths of the table, which the stored schemas of §6 hold `[live]`. A stored payload never supplies the value of a governed path. A governed value that is null removes the element from the served payload; the two governed values that can be null, `operator_identifier` and `date_into_service`, belong to elements that the stored nameplate schema does not require `[live]`.

| Aspect key | Path | Value |
|---|---|---|
| `digital-nameplate` | `$.ManufacturerIdentifier` | `passports.manufacturer_bpnl` |
| `digital-nameplate` | `$.ManufacturerName` | the list with one item, the object `{ "<companies.legal_name_language>": "<companies.legal_name>" }`, for example `[{ "en": "Example Battery Company" }]`. The definition `MultiLanguageTexts` of the stored nameplate schema states a list of objects and no property of an item `[live]`, so the form of an item is chosen by this specification (decision D51 [waits for the owner], The form of a manufacturer name item) |
| `digital-nameplate` | `$.AddressInformation`, `$.OperatorIdentifier` | `companies.address`, `companies.operator_identifier` |
| `digital-nameplate` | `$.SerialNumber`, `$.UniqueFacilityIdentifier`, `$.DateOfManufacture`, `$.DateOfPuttingIntoService`, `$.LifeCycleStage` | `battery_identifier`, `facility_bpns`, `date_of_manufacture`, `date_into_service`, `lifecycle_status` |
| `technical-data` | `$.GeneralInformation.BatteryCategory`, `$.GeneralInformation.ManufacturerIdentifier` | `battery_category`, `manufacturer_bpnl` |
| `technical-data`, only on a passport with a lineage link | `$.TechnicalPropertyAreas.CapacityEnergyVoltage.RatedCapacity`, `$.TechnicalPropertyAreas.CapacityEnergyVoltage.CapacityFade`, `$.TechnicalPropertyAreas.PowerCapability.PowerFade`, `$.TechnicalPropertyAreas.Lifetime.ExpectedLifetimeInCalendarYears` | `rated_capacity_ah`, `capacity_fade_percent`, `power_fade_percent`, `expected_lifetime_years`, each as a JSON number |
| `dpp-metadata` | `$.digitalProductPassportId`, `$.uniqueProductIdentifier` | `passport_identifier`, `battery_identifier` |

Each served payload of the four stored models validates against its stored schema after the governed elements are written, and the tests of §14.2 assert the validation.

### 10.7 Stand-ins, holding designs and contingencies

- **The receiver resolution** (D11 (The receiver resolution behind a port), D75 (The receiver resolution through the own connector)). Both bindings resolve a receiver through the receiver resolver contract of §9.2.5 in the two steps of section 4.3 item 5 of the proposal. The memory resolver performs the two steps on two maps. The resolver of the connector binding asks the own connector with the connector discovery request of §9.2.5, and the own connector performs the two steps with its credential: the BPN-DID Resolution Service of CX-0167 (BPN-DID Resolution Service) answers `GET <directory API>/bpn-directory` only to a caller that presents a Verifiable Presentation in JWT form with a Catena-X Membership Credential (CX-0167 1.0.0 section 2.1, `https://catenax-ev.github.io/docs/next/standards/CX-0167-BpnDidResolution`; bpn-did-resolution-service at the tag `0.6.0`, `README.md` lines 32 to 39), and the DID document names the connector in a service entry of the type `DataService` whose endpoint is `<connector>/.well-known/dspace-version` (CX-0018 (Dataspace Connectivity) 4.3.0 section 2.6, `https://catenax-ev.github.io/docs/next/standards/CX-0018-DataspaceConnectivity`).
- **The connector binding** (D43 (One test code and two bindings), D76 (The wallet stub as the local identity), D77 (OAuth2 off in the local registry)). `tck/docker-compose.yml` starts, for each of the three participants, one reference server built from `server/Dockerfile`, one PostgreSQL database of the server, one connector control plane, one connector data plane, one database of the connector, one secret store, one wallet stub as the identity of the connector, and one Digital Twin Registry, and one BPN-DID Resolution Service for the three connectors. Every image name and every image version is a variable of `tck/.env.example`, with the values of the table below.

| Variable | Value | Public address |
|---|---|---|
| `TCK_IMAGE_CONTROL_PLANE` | `tractusx/edc-controlplane-postgresql-hashicorp-vault:0.13.0`, licence Apache-2.0 | tractusx-edc at the tag `0.13.0` (commit `964d33d7ed942369f624aacbc45037a1f79fc7be`), `charts/tractusx-connector/templates/deployment-controlplane.yaml` line 68, `charts/tractusx-connector/Chart.yaml` line 49, `LICENSE` |
| `TCK_IMAGE_DATA_PLANE` | `tractusx/edc-dataplane-hashicorp-vault:0.13.0`, licence Apache-2.0 | the same tag, `charts/tractusx-connector/templates/deployment-dataplane.yaml` line 69 |
| `TCK_IMAGE_POSTGRES` | `postgres:17`, the database of the reference server (§9.8) | §9.8 |
| `TCK_IMAGE_CONNECTOR_POSTGRES` | `postgres:18.0`, the database of a connector (D79 (A database image of its own for the connectors) [waits for the owner] [waits for the owner]) | the same tag, `tractusx-edc/docs/migration/2026_06-Version_0.12.x_0.13.x.md` section 3, `charts/tractusx-connector/README.md` lines 353 and 354 |
| `TCK_IMAGE_VAULT` | `hashicorp/vault:1.16.1` in development mode, the default image of the Helm chart `vault` 0.28.0; licence BUSL-1.1, a test-only image (decision D82, HashiCorp Vault as a test-only image) | `hashicorp/vault-helm` at the tag `v0.28.0`, `values.yaml` lines 379 and 380, `Chart.yaml` line 7; `hashicorp/vault` at the tag `v1.16.1`, `LICENSE` lines 1 and 2; and the same tag, `charts/tractusx-connector/Chart.yaml` lines 55 to 58, `charts/tractusx-connector/README.md` lines 377 to 380 |
| `TCK_IMAGE_IDENTITY` | `tractusx/ssi-dim-wallet-stub:0.1.0`, one stub for the three connectors (D76, D80 (One wallet stub for the three companies)) | the Tractus-X umbrella 3.9.0, `charts/umbrella/values-adopter-data-exchange.yaml` ("Replace by ssi-dim-wallet-stub") |
| `TCK_IMAGE_BPN_DID` | `tractusx/bdrs-server-memory:0.6.0`, licence Apache-2.0, which the three connectors query | bpn-did-resolution-service at the tag `0.6.0` (commit `fee8860b0404a85dba06a7380847dc2298b0e5a6`), `api/directory-api/src/main/java/org/eclipse/tractusx/bdrs/api/directory/DirectoryApiController.java` line 45 |
| `TCK_IMAGE_DTR` | `tractusx/sldt-digital-twin-registry:0.13.0`, licence Apache-2.0, with OAuth2 switched off (D77) |
| `TCK_IMAGE_NODE` | `node:24`, the image of the one-shot seed service | §9.8 | sldt-digital-twin-registry at the tag `v0.13.0`, `INSTALL.md` lines 28 and 38 |

  The deployment holds these further rules, which the first run established (`tck/README.md`, section "The first run of phase P7"). The registry of each participant uses the database `postgres` of the PostgreSQL 17 container of its server (`server-db-1`, `server-db-2`, `server-db-3`), beside the database `refserver` of the server; the setting `registry.authentication` `false` starts the registry with the profile `local`, whose H2 database the image cannot open, because the image holds no H2 driver, so the deployment sets the PostgreSQL datasource with the variables `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD` and `SPRING_DATASOURCE_DRIVERCLASSNAME`; and the registry shows a shell only to the owning tenant that a reader names in the header `Edc-Bpn`, so the deployment sets `REGISTRY_IDM_OWNINGTENANTID` to the Business Partner Number of the participant (sldt-digital-twin-registry at the tag `v0.13.0`, `charts/registry/templates/registry/registry-deployment.yaml` lines 45 to 47, `backend/src/main/resources/application-local.yml` lines 1 to 40, `sldt-digital-twin-registry/docs/guideline-edc-extension-configuration.md` line 17). The one-shot service `seed`, of the image of `TCK_IMAGE_NODE`, writes after the start, for each participant, the client secret and a generated key pair of the data plane tokens into the secret store of the participant and posts the mapping of the participant's Business Partner Number to the decentralised identifier of its connector to the management API of the BPN-DID Resolution Service. One setup service, `server-setup-1`, builds the image `tck-reference-server:local` from `server/Dockerfile`, and the five other services of the servers use the built image, because six builds of one image tag in parallel fail. The servers of the deployment run with `RECEIVER_RESOLUTION=address-list` and the address list of the three connectors (decision D81, A fixed address list in the local deployment only). The access policy, the usage policy and the contract definition of each offer follow §9.2.5. `tck/README.md`, section "The verification of phase P7", holds the table of every verified value with its public address, and §10.7 restates the values that the implementer uses.
- **The first step of phase P7.** The owner named Tractus-X EDC 0.13.0 on 2026-11-19, and the implementer verified each value of the previous point against the public documentation of that release and recorded each verified value with its public address and the licence of each image in `tck/README.md`, section "The verification of phase P7". The verification found seven findings, which version 12 closes: finding 1 by D75, finding 2 by D76, finding 6 by D77, and the findings 3, 4, 5 and 7 by the corrections of §9.2.5, §10.5, §10.6 and §7. The first run of the second part of phase P7 on 2026-11-19 confirmed four of the five values that version 12 marked (the request and the answer of the connector discovery, the framework agreement, the image of the secret store and the setting of the registry), and showed that three wallet stubs refuse each other and that the connector discovery finds no connector with the stub (`tck/README.md`, section "The first run of phase P7"); the owner's decisions D80, D81 and D82 close the three results.
- **The contingency of the connector binding.** When the first run of the second part of phase P7 shows that the wallet stub 0.1.0 does not serve the identity of the connectors of release 0.13.0, the implementer stops the phase and reports the failure to the owner before the contingency of D76 is taken. When the verification finds no set of public images that negotiates a contract between two connectors without a manual step, the implementer stops phase P7, keeps `TCK_BINDING=connector` failing at `startBinding()` with the message `connector binding not available: <cause>`, and reports the cause. The owner of this repository owns the decision. The process requirement on the two bindings of §5.3 then stays unverified for the connector binding, and the completion record says so.
- **The four models without a stored text** (D28). The server stores and serves the payloads of `handover-documentation`, `carbon-footprint`, `material-composition` and `circularity`, of `serial-part` and of `single-level-bom-as-built` without a schema check. The marker is the comment `not validated: the aspect model is cited and not stored (D28)` at the six entries of `ASPECTS`.
- **The test data.** Every Business Partner Number of a test and of a fixture is one of `BPNL00000000TCK1` (the data provider of the original passports), `BPNL00000000TCK2` (the second-life operator), `BPNL00000000TCK3` (the recycler, the repairer and the waste receiver), `BPNL00000000TCK4` (a successor without a deployment), `BPNL00000000TCK5` (a purchaser's application without a deployment) and `BPNL00000000TCK6` (a passport service provider without a deployment). The six values are invented and name no company. The site number of a fixture is `BPNS00000000TCK1`. The three example payloads of §21 are exempt from this rule: they hold the Business Partner Numbers `BPNL000000000001`, `BPNL000000000002` and `BPNL000000000003` of the examples of the proposal, and `server/test/modelExamples.test.mjs` compares two of the files with the proposal. A test file that needs a market surveillance authority gives the role to one of the Business Partner Numbers without a deployment, `BPNL00000000TCK4` or `BPNL00000000TCK6`, that holds no other role in that file: `tck/CAC-005.tck.mjs` uses `BPNL00000000TCK4` and `tck/CAC-010.tck.mjs` uses `BPNL00000000TCK6`.

## 11. Phases

Each phase ends with its done-when signal green. The implementer then continues with the next phase. The implementer stops and reports when a done-when signal stays red after a correction that this specification determines, or when a claim marked "not verified against a stored text" proves wrong. The owner ordered phases P1 to P3 on 2026-11-16 (§12.1); phases P4 to P8 wait for the owner's approval. Every command of this section runs in a POSIX shell at the repository root unless the command names another directory.

### 11.0 The tools of phases P1 to P3

The owner decided on 2026-11-16 that Node.js 24 and Java 21 run in containers from public images and that nothing is installed on the machine (decision D52, The tools in containers). The implementer defines two shell functions once per shell, in the form of the machine, and every later command of §11 and of §15 is the same on both machines.

The form for the owner's Windows machine (Git Bash, Docker Desktop), at the repository root:

```bash
export MSYS_NO_PATHCONV=1
REPO="$(pwd -W)"
node24() { docker run --rm -v "$REPO:/work" -v bpafl_server_modules:/work/server/node_modules -v bpafl_tck_modules:/work/tck/node_modules -w /work -e TEST_DATABASE_URL -e TEST_APP_ROLE_PASSWORD node:24 "$@"; }
java21() { docker run --rm -v "$REPO:/work" -w /work eclipse-temurin:21 "$@"; }
export TEST_DATABASE_URL="postgres://postgres:${TEST_DB_SUPERUSER_PASSWORD}@host.docker.internal:54329/refserver_test"
export TEST_APP_ROLE_PASSWORD="$(node24 node -e "console.log(require('node:crypto').randomBytes(24).toString('hex'))")"
```

- The test database is the running container of the image `postgres:17`, published on `127.0.0.1:54329`, with the database `refserver_test` and the superuser `postgres`. A container reaches the published port through the name `host.docker.internal` of Docker Desktop. The owner sets `TEST_DB_SUPERUSER_PASSWORD` in the shell; no file holds the value.
- `MSYS_NO_PATHCONV=1` stops Git Bash from rewriting the container path `/work`, and `pwd -W` gives the Windows form of the repository path for the mount.
- The two named volumes `bpafl_server_modules` and `bpafl_tck_modules` hold the folders `node_modules` of `server/` and of `tck/`, so that npm writes its several thousand files into a volume of Docker and not into the repository folder, which a file synchronisation service of the machine can watch. The repository then holds two empty folders `node_modules`, which git ignores. `docker volume rm bpafl_server_modules bpafl_tck_modules` removes the installed packages.
- Observed on 2026-11-16 in a container of the image `node:24`: Node.js 24.22.3, git 2.39.5 and curl 7.88.1 are present; the repository mounts at `/work`; the four checks run; a connection to `host.docker.internal:54329` succeeds. Observed in a container of the image `eclipse-temurin:21`: OpenJDK 21.0.13.

The form for Ubuntu in the continuous integration, where the workflow installs Node.js 24 and Java 21 on the runner and starts the service container of §9.7:

```bash
node24() { "$@"; }
java21() { "$@"; }
```

- The workflow sets `TEST_DATABASE_URL` and `TEST_APP_ROLE_PASSWORD` as §9.7 states.
- The commands `grep`, `find`, `ls` and `git` of the done-when signals run in the shell of the machine and need no container.
- The four checks of the repository run as one command, which marks the mounted repository as safe for the `git` of the container: `node24 bash -c "git config --global --add safe.directory /work; node scripts/requirements-check.mjs && node scripts/check-sources.mjs && node scripts/check-license-headers.mjs && node scripts/check-private-references.mjs"`. The command is named "the four checks" in §11 and §15, and its last four lines are the result lines of §15 item 1. The image `node:24` holds no `pdftotext`, so the registry check of the Windows form skips the ten quotes of the one stored PDF file and prints `0 problems, 10 quotes skipped, 95 quotes not checked (cited, not stored)`. The Ubuntu form installs `poppler-utils` (§9.7) and prints `0 problems, 0 quotes skipped, 95 quotes not checked (cited, not stored)`, and that line of the continuous integration is the gate for the ten quotes (decision D59, The registry check per environment).
- The annex check `node24 node scripts/check-annexes.mjs --require P<n>` compares every file of §20, §21 and §22 up to phase P<n> with its block and prints a last line that ends with `0 differ, 0 missing`.
- Each test command names the reporter `tap`, so that the summary holds the lines `# pass <n>`, `# fail <n>` and `# skipped <n>` on every version of Node.js and on a terminal as well as in a pipe. A done-when signal of a test command is the exit status 0 together with the line `# fail 0`.

### 11.1 Phase P1: the contract

- **Steps.** The implementer copies the eleven files of §20 into their paths. The implementer runs `git add --renormalize .` once after `.gitattributes` exists; `git status --porcelain` then lists `.gitattributes` and the new files only, because every file of the index outside `sources/` already has LF line endings `[live]`, and `sources/.gitattributes` keeps the third-party texts byte for byte. The owner commits `.gitattributes` with the files of phase P1. The implementer creates `server/package.json` with the name `battery-passport-lifecycle-reference-server`, `"private": true`, `"type": "module"`, the engine rule of §7, the dependencies `express`, `pg`, `ajv`, `ajv-formats` and `ajv-draft-04`, the development dependency `yaml`, and the scripts of §14.1, and runs `node24 bash -c "cd server && npm install"` once, which writes `server/package-lock.json`. The implementer then writes `server/test/contractSchemas.test.mjs` and the two workflow files.
- **The lock file and the private reference check.** `scripts/check-private-references.mjs` excepts the expression of the letter M and one digit inside `server/package-lock.json` and `tck/package-lock.json`, which a base64 integrity value can hold `[live]`. Every other hit of the check inside a lock file is a finding that the implementer reports.
- **Done when.** Each of these commands exits 0 and prints the stated text:
  1. `node24 npx --yes @stoplight/spectral-cli@6 lint docs/api/openAPI.yaml --ruleset .spectral.yaml --fail-severity error`
  2. `grep -c "operationId:" docs/api/openAPI.yaml` prints 4.
  3. `node24 bash -c "cd server && npm ci && node --test --test-reporter=tap test/contractSchemas.test.mjs"` prints the line `# fail 0`.
  4. `node24 node scripts/check-annexes.mjs --require P1` prints a last line that ends with `0 differ, 0 missing`.
  5. The four checks.
- **The Spectral result.** Observed on 2026-11-16 in a container of the image `node:24`, on a copy of the files of §20: the command of item 1 prints "No results with a severity of 'error' found!" and exits 0. When the linter of a later release reports an error on the file of §20, the implementer stops and reports the rule and the line, because a change of the file is a change of an annex.

### 11.2 Phase P2: the models

- **The tool.** The implementer downloads the SAMM command line tool once into `tools/`, which git ignores: `node24 bash -c "mkdir -p tools && curl -fsSL -o tools/samm-cli-2.11.1.jar https://github.com/eclipse-esmf/esmf-sdk/releases/download/v2.11.1/samm-cli-2.11.1.jar"`. Observed on 2026-11-16: the address answers with the status 200, and the file has 110,342,711 bytes and the SHA-256 value `fab66a72e1969ff2e4d9db5d1c0eeb55936f89e2159045576301ea46c49ffc0f`. The script of §21 checks the SHA-256 value before each run and prints `CHECKSUM tools/samm-cli-2.11.1.jar` for another file.
- **The observed behaviour of the tool.** Observed on 2026-11-16 on the image `eclipse-temurin:21`: `java -jar tools/samm-cli-2.11.1.jar aspect <file.ttl> validate` prints the line "Input model is valid" and exits 0 for a valid model. The command group `aspect <file.ttl> to` has the sub-commands html, java, json, jsonld, openapi, asyncapi, png, schema, svg, aas and sql; `aspect <file.ttl> to schema` prints the JSON schema of the model to the standard output; the tool has no sub-command `json-schema`, and the sub-command `to json` is described by the tool as the generation of an OpenAPI specification. The tool accepts no option `--models-root`.
- **The resolution of the imported models.** The tool resolves an imported model from the folder layout `<root>/<namespace>/<version>/<File>.ttl` around the input file. The script therefore assembles the temporary models root `tools/models-root` with five namespace folders: copies of the two shared namespaces `io.catenax.shared.uuid` and `io.catenax.shared.business_partner_number` of `sources/Tractus-X/semantic-models/`, and copies of the three proposed namespaces of `models/`, and validates each proposed model at its path inside that root. The author and the fourth reviewer each observed this resolution on 2026-11-16 with the three files of §21 on a scratch copy. The rule is to be confirmed by the first run of phase P2 in the repository. The fallback, which the implementer applies without a stop when the tool reports an import that the tool cannot resolve: the implementer runs each validation with the working directory `tools/models-root` and the relative path `<namespace>/1.0.0/<Aspect>.ttl`, records the changed command in the completion record, and reports the change at the end of the phase.
- **Steps.** The implementer copies the fourteen files of §21 into their paths, runs `java21 bash scripts/validate-models.sh --generate`, which creates the folder `docs/api/aspects` when the folder is absent and writes the three generated schemas, writes `server/test/modelExamples.test.mjs`, and extends `models/README.md` and `docs/proposals.md`.
- **Done when.** Each of these commands exits 0 and prints the stated text:
  1. `java21 bash scripts/validate-models.sh --generate` prints three lines that start with `VALID` and three lines that start with `GENERATED`.
  2. `sha256sum docs/api/aspects/*-schema.json > tools/first-run.sha256`, then a second run of the command of item 1, then `sha256sum --check --quiet tools/first-run.sha256` exits 0, so the two runs wrote the same three files. Once the owner has committed the files, `git diff --exit-code -- docs/api/aspects` exits 0 after a run.
  3. `find models -name "*.ttl" | wc -l` prints 3.
  4. `node24 bash -c "cd server && node --test --test-reporter=tap test/modelExamples.test.mjs"` prints the line `# fail 0`.
  5. Each of the three commands `git check-ignore -q tools/samm-cli-2.11.1.jar`, `git check-ignore -q tools/models-root` and `git check-ignore -q tools/first-run.sha256` exits 0, so git ignores the tool, the temporary models root and the file of item 2. The option `-q` admits one path per command (observed: the command with two paths exits 128).
  6. `git ls-files --eol --cached --others --exclude-standard scripts/validate-models.sh` prints a line that holds `w/lf`, so the script has LF line endings in the working tree. The command reads the working tree and prints the line for a file that git does not track yet and for a tracked file alike. The implementer writes no index of git: no step of a phase runs `git add`, and the coordinator stages and commits the files after the done-when signal. The file `.gitattributes` of phase P1 sets LF for every shell script at a checkout, and a copy of the script with CRLF line endings fails in the Linux container with the message `$'\r': command not found`.
  7. `find models -type d -name gen | wc -l` prints 0.
  8. `node24 node scripts/check-annexes.mjs --require P2` prints a last line that ends with `0 differ, 0 missing`.
  9. The four checks.


### 11.3 Phase P3: the database

- **The database.** The tests use the test database of §11.0. The role of `TEST_DATABASE_URL` is a superuser, so the role creates the role `refserver_app` and the schemas, and reads and writes every table in spite of `FORCE ROW LEVEL SECURITY`. `createTestDatabase` (§14.1) stops with the message `TEST_DATABASE_URL must name a superuser or a role with BYPASSRLS` when the role has neither attribute.
- **Steps.** The implementer writes the P3 files of §7: the seven modules of `server/src/db/`, the three migration files as copies of §22, `server/test/support/database.mjs`, `server/test/databaseRules.integration.test.mjs`, `scripts/check-dependency-licenses.mjs` with `server/test/dependencyLicenses.test.mjs`, and `.github/workflows/tests.yml`.
- **Done when.** Each of these commands exits 0 and prints the stated text:
  1. `node24 bash -c "cd server && npm ci && npm test"` prints the line `# fail 0` and runs the four test files that exist.
  2. `node24 bash -c "cd server && node --test --test-reporter=tap test/databaseRules.integration.test.mjs"` prints the line `# fail 0` and nine lines that start with `ok` and name the nine top-level tests `(a)` to `(i)` of §14.2.
  3. `node24 bash -c "cd server && node ../scripts/check-dependency-licenses.mjs"` prints `0 packages outside the licence list`.
  4. `node24 node scripts/check-annexes.mjs --require P3` prints a last line that ends with `0 differ, 0 missing`.
  5. The four checks.
- **Inspection aids.** Three commands help a reader and prove nothing alone, because each counts lines, comments included: `grep -c "CREATE TABLE" server/src/db/migrations/001_schema.sql` prints 17; `grep -c "CREATE TRIGGER\|CREATE CONSTRAINT TRIGGER" server/src/db/migrations/002_triggers.sql` prints 37; `grep -c "CREATE POLICY" server/src/db/migrations/003_policies.sql` prints 12. The proof of the tables, the triggers, the policies and the absent `DELETE` privilege is the test file of item 2.
- **After the phase.** The owner orders the push of the repository.


### 11.4 Phase P4: the services

The implementer writes the P4 files of §7: the configuration, the identifier module, the access control, the audit trail, the lifecycle executor with its repositories, the submodel service, the access map service, the notification plan, the offer publisher, the exposure module, the issuer contract service and the twin descriptors, each with the memory implementation of its contract. The implementer of phases P4, P5, P6 and P8 follows the text literally and builds every behaviour that carries the tag `[waits for the owner]` as written (§1). Done when: `node24 bash -c "cd server && npm test"` exits 0 and prints `# fail 0`, and every test file of §7 of phase P4 exists. §7 is the one list of the test files: no done-when signal states a number of files, so that a later version cannot leave a number stale (finding R45-018).

### 11.5 Phase P5: the application

The implementer writes the P5 files of §7: the composition root, the application factory, the routes with `runWrite`, the sender, the puller, the memory transport and the worker. Done when: `node24 bash -c "cd server && npm test"` exits 0 and prints `# fail 0`; every test file of §7 of phases P1 to P5 exists; `004_audit_outbox.sql` equals its block of §23 (`node24 node scripts/check-annexes.mjs --require P5` prints a last line that ends with `0 differ, 0 missing`); a start of the server on a port that another process holds ends with the exit status 1 and one log line at the level `error`, and `server/src/index.mjs` writes the line of a started server on the event `listening` of the HTTP server only, because Express 5 also calls the callback of `listen` when the start fails, after the worker has stopped and the pool has ended (finding R45-017: `server/src/index.mjs` listens on the event `error` of the HTTP server, and catches and logs a rejection of the shutdown); the test `server/test/openApiContract.test.mjs`, a planned file of §7, validates every response of the four receiving endpoints against `docs/api/openAPI.yaml`; and the server starts with `BINDING=memory` after `npm run create-role` and `npm run migrate`, where `GET /health` answers `{"status":"up"}`, which `server/test/submodelRoutes.integration.test.mjs` asserts.

### 11.6 Phase P6: the conformance test kit on the in-process binding

The implementer writes the P6 files of §7 and adds the steps of the test kit to `.github/workflows/tests.yml`. `tck/package.json` has the name `battery-passport-lifecycle-tck`, the field `description`, `"private": true`, the field `license` with the value `Apache-2.0`, `"type": "module"`, the field `engines` with `{ "node": ">=24" }`, the dependencies `pg`, `ajv`, `ajv-formats`, `ajv-draft-04` and `yaml`, and the script of §14.1; the implementer runs `node24 bash -c "cd tck && npm install"` once, which writes `tck/package-lock.json`. The test kit imports `createApp`, `signOperatorToken` and `server/test/support/database.mjs` by relative paths, so `npm ci` in `server/` precedes every run of the test kit. Done when: the command of §15 item 6 reports `# fail 0` and `# skipped 0`, and the command of §15 item 8 prints 16.

### 11.7 Phase P7: the connector binding

A capable model executes phase P7, and the less capable implementer of the other phases does not start the phase, because every value of the connector needs a verification against public documentation and a judgment on the result. The phase has two parts. In the first part the owner names the connector release, and the implementer verifies and records the values of §10.7. In the second part the implementer writes the P7 files of §7. Done when: `docker compose -f tck/docker-compose.yml --env-file tck/.env up -d --wait` exits 0; the command of §15 item 7 prints `# fail 0`; `server/test/transportContract.test.mjs`, `server/test/receiverResolverContract.test.mjs` and `server/test/twinRegistryContract.test.mjs`, three planned files of §7, pass for both implementations; a test of `tck/lib/connectorBinding.mjs` shows that a header with the name of `PARTNER_BPN_HEADER` that a consumer sets itself does not reach the server with the consumer's value. The contingency of §10.7 applies otherwise.

### 11.8 Phase P8: the documentation, the remaining workflows and the registry states

The implementer writes the P8 files of §7. `docs/architecture/README.md` holds the twelve arc42 sections in this order: introduction and goals, constraints, context and scope, solution strategy, building block view, runtime view, deployment view, crosscutting concepts, architecture decisions, quality requirements, risks and technical debts, glossary. `INSTALL.md` states that the reference server needs a PostgreSQL 17 database of its own, which holds the schema of the reference server and no table of another application, because the migration revokes the privilege to create temporary tables from the group PUBLIC of the database (decision D60, A fixed search path for every function, no temporary table for the application role, and a database of its own), and states the order of the commands `npm run create-role` and `npm run migrate`. `docs/admin/README.md` states the same requirement of a database of its own, the powers that PostgreSQL leaves to the role `refserver_app` (D24 (Two database roles and row-level security): its own password, its own stored settings for every database and for one database, advisory locks, a chosen value of an identity column) with the action of the administrator for each, where the action for a stored setting is the command `npm run create-role`, which removes the settings of both forms, the six offers of §10.5 with their `dct:type`, version, data address, access policy and usage policy, the configuration of §9.6, the production setting of the Digital Twin Registry with OAuth2 and the limit of D78 (No credential of the registry in the server) [waits for the owner], the rule that a production deployment uses `RECEIVER_RESOLUTION=discovery` (decision D81, A fixed address list in the local deployment only), the two database roles of §9.2.8 and the threat bounds of D41 (Authentication without an identity provider), D47 (The access to the notification asset) [waits for the owner] and D24. `docs/development-view.md` holds the sections API specification, semantic models, test cases, sample data and reference implementation, documents the operator endpoints of §9.3, and states the path by which a data consumer finds the original battery model of a treated battery (decision D35, The reference to the original battery model). The implementer sets the field `implementation` of each software requirement of §5.2 to the state `implemented` with the files of the column "Implemented in", and to the state `partial` for the requirements that §5.2 marks as partly met, with the note of §5.2. Done when: every command of §15 passes.

## 12. Decisions

### 12.1 Decisions of the owner of 2026-11-16

The owner decided three further points on 2026-11-19 after the second run across Tractus-X EDC 0.13.0 connectors (section "Three decisions after the second run across Tractus-X EDC 0.13.0 connectors (2026-11-19)" of the same file): D85 (The error text of the provider data plane), D86 (A test file waits only for its own notifications) and D87 (The delay checked against the record time) record them. The owner decided three further points on 2026-11-19 after the first run across Tractus-X EDC 0.13.0 connectors (section "Three decisions after the first run across Tractus-X EDC 0.13.0 connectors (2026-11-19)" of the same file): D80 (One wallet stub for the three companies), D81 (A fixed address list in the local deployment only) and D82 (HashiCorp Vault as a test-only image) record them. The owner decided three further points on 2026-11-19 after the verification of Tractus-X EDC 0.13.0 (section "Three decisions after the verification of Tractus-X EDC 0.13.0 (2026-11-19)" of the same file): D75 (The receiver resolution through the own connector), D76 (The wallet stub as the local identity) and D77 (OAuth2 off in the local registry) record them. The owner decided three points on 2026-11-19 after the independent review of the code of phases P4 and P5 (section "Three decisions after the code review of phases P4 and P5 (2026-11-19)" of the same file): D69 (The audit record after a failed write is queued), D70 (The recycler of PassportEnded is the sender) and D71 (The fields of the operator answers as built) record them. The owner decided five points of version 1 of this specification on 2026-11-16 with the words "Accept all five" (`requirements/Owner_instructions-Francesco_verbatim/2026-11-16_public_repository_for_the_after_first_passport_work.md`, section "The five decisions on the specification of the reference server"). D41 (Authentication without an identity provider), D42 (A database of 17 tables), D43 (One test code and two bindings) and D44 (The scope of the reference server) record the first four points, and D17 (The named waste successor) records the fifth point. The same file holds three later answers of 2026-11-16: the words "Accept all" (section "Four decisions before phases P1 to P3, and the tools") decided the successor's authorisation (decision D18, The successor's authorisation with its period), the reference to the original battery model (decision D35, The reference to the original battery model), the donor of several remanufactured batteries (decision D40, The admission rule), the forms of an identifier (decision D50, Every admitted form of an identifier accepted, one form sent) and the tools in containers (decision D52, The tools in containers); the words "Approve all" (section "The ten registry texts and two further points") approved ten registry texts and accepted that the next draft of the proposal names version 2.1.0 of the shared uuid model and that the system requirement on the producer of a waste battery is reworded; and the section "The work up to phase P3 and the push" orders the work up to the end of phase P3 and then the push of the repository.

**D41. Authentication without an identity provider.** A partner request is authenticated by the key of the provider data plane and carries the consumer's Business Partner Number in a header that the data plane sets. An operator request is authenticated by a token that the operator signs with a key of the deployment (§9.2.3; point 1 of the owner's decision). The in-process binding and the connector binding use the same partner authentication, because the memory transport sets the same two headers as a data plane. The owner rejected a verification of a verifiable credential by the server, which needs a wallet client and a token that no stored text defines, and an OpenID Connect provider with mutual TLS, which adds a service to every test run. The threat and its bound: every caller that reaches the port of the server and holds the data plane key can claim any Business Partner Number in the header. The bound has five parts, which `docs/admin/README.md` states as duties of the operator of a deployment: the address `PUBLIC_BASE_URL` is reachable only by the own data plane; the data plane overwrites a header of the name `PARTNER_BPN_HEADER` that a consumer sends; each deployment has its own key, of 32 characters or more, which the operator replaces after a suspected disclosure; the server compares the digests of the two keys in constant time; and phase P7 tests that a consumer's own header does not reach the server. A holder of `OPERATOR_TOKEN_SECRET` can sign an operator token, so the secret stays with the administrator of the deployment, and a token is valid for 3600 seconds or less. A token whose `iat` lies more than 60 seconds after the current time is refused, so that a signed token with a lifetime of 3600 seconds or less cannot be valid for a longer time from now (decision D72, The clock tolerance of an operator token). The connector binding keeps the rule: the connector holds the credential of the dataspace, and the server holds none (decision D75, The receiver resolution through the own connector).

**D42. A database of 17 tables.** The database holds the 14 tables of the seven groups of §9.4.1 from companies to access map, and the three tables of the audit record, the issuer contracts and the received battery information (point 2 of the owner's decision). The reference server therefore builds use case UC-5b, as decision Q-1011 (whether the reference implementation builds use case UC-5) states. The owner rejected the 14 tables alone, which leave UC-5b unbuilt and the audit trail in a log, and the tables of the four notifications alone, which leave five criteria of Annex A of the proposal without an executable test. The owner's decision of 2026-11-19 adds the queue of the audit records, `audit_outbox`, in a fourth migration file, as the eighteenth table (decision D69, The audit record after a failed write is queued).

**D43. One test code and two bindings.** The conformance tests are one test code that runs against two bindings behind one contract (point 3 of the owner's decision; §9.2.9). The in-process binding starts three server instances (the data provider, the second-life operator and the recycler) on one PostgreSQL database with an in-memory transport, and needs only Node.js and PostgreSQL. The connector binding runs the same sixteen files through Tractus-X connectors and Digital Twin Registries that Docker Compose starts from public images, whose names and versions are configuration values that phase P7 verifies (§10.7). The owner rejected the connector binding alone, which runs no test without Docker, and the in-process binding alone, which fails the process requirement on the two bindings of §5.3.

**D44. The scope of the reference server.** The reference server does not build the six groups of §5.4 (point 4 of the owner's decision): the recovered materials and the recycling efficiency, the rules that rest only on the draft implementing act under Article 77(9) of Regulation (EU) 2023/1542, the yearly reports of the first recycler, the twins and the bills of material of traced parts, the pull of passport inputs from a partner, and the forwarding rule of the connector's data plane. The reference server builds the sharing of individual battery information with the original issuer (decision D38, The sharing of individual battery information). The registry records the decision in the field `implementation` of each software requirement of the six groups.

### 12.2 Decisions of this specification

A decision that holds the words "chosen by this specification; the owner has not decided" follows the order of the sources of §1 and is listed in §19.1.

**D1. The delay of the end notice.** The notice of the end of a passport leaves 5 seconds after the recycling is recorded: the executor writes each PassportEnded notification with `not_before` equal to the record time plus `PASSPORT_ENDED_DELAY_SECONDS`, whose default is 5, and the worker sends no notification before `not_before`. The owner stated the 5 seconds on 2026-11-16 ("send the notification with 5 seconds delay", section "The review of the carried software requirements" of the owner's file of §12.1). This specification rejects a timer in the request, which a restart of the server loses, and a delay for the other three operations, which no requirement states. The executor takes the current time once per step: the field `header.sentDateTime` of each planned message and the base of `not_before` are that one time, so that `not_before` of a PassportEnded lies exactly `PASSPORT_ENDED_DELAY_SECONDS` after the time of its record, and `tck/CAC-009.tck.mjs` checks the delay against that record time (decision D87, The delay checked against the record time).

**D2. Four notifications.** The reference server sends and receives exactly four notifications: NewPassportIssued, BatteryRepaired, BatteryBecameWaste and PassportEnded, with the contexts of §10.1 and one POST endpoint each. This specification rejects one endpoint with an operation field, which the stored notification rules exclude (one endpoint per operation), and a fifth notification for the change of purchaser, which Table 4.3 of the proposal does not hold.

**D3. The access map and the whole aspect.** The access map is served on the PartType twin of the battery model (decision Q-200, how the dataset delivers each field's access group), and a recipient reads an aspect whole or not at all (§9.2.4). Annex B point 19 of the proposal states that a payload without a mandatory restricted field is not valid against its schema. The consequence: an aspect that holds one restricted field is refused whole to a reader without an access record, so the digital nameplate is not public once the access map marks `$.LifeCycleStage` as restricted, as the example of section 3.4.2 of the proposal does. A recycler therefore learns the manufacturer of the nameplate from its own records or under an access record, and `EP-REPORT-RECYCLING` takes the value from the request. The three aspect keys that the access map does not cover (`dpp-metadata`, `serial-part` and `single-level-bom-as-built`) are served only under an access record, because no stored text states their access group and a refusal is the default. This specification rejects the removal of single fields from a payload, which produces payloads that fail their schema, and a second public offer with the public elements of a mixed aspect, which Annex B point 19 leaves open. The rule for a mixed aspect is chosen by this specification; the owner has not decided.

**D4. One offer per lifecycle model.** Each of the two lifecycle models has one data offer of its own with its own access policy (decision Q-200, option 2 for the new models), because each model holds information of one access group. This specification rejects one offer for both models, which would give the readers of the forward links the waste successor.

**D5. The three open items of the carrier decision.** The three items that decision Q-202 (the carrier for lifecycle data the aspect models lack) leaves open are not implemented: the reference server serves no history of the responsible economic operators, no original placing date and no performance and durability values at each change of status. The table `passport_responsibility_intervals` holds the timeline for the rules of §9.4 and no endpoint serves the table to a partner. The repair entries are served to the operator in the passport record of §10.2 and to no partner, because the CX-0131 (Circularity Core) repair certificate is the record of a repair for a partner. This specification rejects a fourth model, which the proposal does not define.

**D6. One deployment, one company, one writer.** One deployment serves one company, and only the data provider of a passport writes the passport, on its own deployment. The policies of §9.4.3 show a transaction only the passports whose `manufacturer_bpnl` equals the acting Business Partner Number, and every transaction of the server acts as the own company. A request that names a passport of another data provider therefore answers `ERR-LC-PASSPORT-NOT-FOUND` with the status 404, and the refusal `ERR-LC-NOT-DATA-PROVIDER` with the status 403 is the answer to a row that the policy refuses (SQLSTATE `42501`). This specification rejects several companies in one deployment, because a notification addressed to a second company of the deployment has no receiver identity, and rejects a write by the responsible operator or the successor into the data provider's database, which section 2.1.3 item 2 of the proposal forbids. The assumption on the open decision Q-971 (whether operators without passport responsibility may record passport information) is in §5.5.

**D7. The receiver guard.** A receiver accepts a notification when the Business Partner Number that the data plane presents equals `header.senderBpn` and `header.receiverBpn` equals the own Business Partner Number. A BatteryBecameWaste or a PassportEnded that names no passport of the own company is recorded and changes nothing, because Table 4.3 of the proposal also sends both operations to the successor, to the nameplate manufacturer and to predecessor data providers. This specification rejects a list of known senders per passport, which refuses the first notice of a waste receiver that the data provider has never met, and rejects a refusal of every notification that names a foreign passport, which makes two of the three receivers of PassportEnded unreachable. D47 (The access to the notification asset) states the residual risk of the open asset and its bound.

**D8. Idempotency by the message identifier.** The receiving step is idempotent by `header.messageId`: a second message with a stored `messageId`, the same sender and the same content answers 200 with the outcome `duplicate` and applies nothing, and a message of another sender or with another content that reuses a stored `messageId` is refused with `ERR-RX-MESSAGE-ID-REUSED`. The stored notification rules allow a sender to send a message again with the same `messageId` after a transfer error, and D49 (The retry of a failed transport) states the retry of the sender. This specification rejects a refusal of the repeated message, which makes a retry fail. The receiving step reads the received record after the row lock of the passport (§10.4), so that a copy that waits for the lock sees the committed first copy and answers `duplicate`.

**D9. The error body.** Every refusal answers the error envelope of the repository's API design together with the result object of Part 2 of the Asset Administration Shell specification (decision Q-409, whether served aspect payloads skip the response envelope), and each text states what failed, the reason and what the caller must do, as section 4.3 item 7 of the proposal requires. This specification rejects a status code without a body, because a sender then cannot tell a malformed content from an unknown passport.

**D10. The content of PassportEnded.** PassportEnded carries the reference to the CX-0131 material recycling certificate and no recovered masses, as Table 4.4 of the proposal states. The recovered materials are not public information, and the certificate is the record that a producer reads under its own contract. This specification rejects recovered masses in the content.

**D11. The receiver resolution behind a port.** A sender resolves the receiver's Business Partner Number to the receiver's decentralised identifier and finds the receiver's connector from that identifier, as section 4.3 item 5 of the proposal requires, through the receiver resolver contract of §9.2.5. The in-process binding implements the two steps on two maps, and the connector binding implements the two steps against the BPN-DID Resolution Service and the DID document. The sender stores the resolved identifier and the connector address on each sent record, and `tck/CAC-012.tck.mjs`, a planned file of §7, asserts both values in both bindings. This specification rejects the table of connector addresses of version 2, which skipped the first step. The owner's decision of 2026-11-19 amends the decision for the connector binding: the resolver of the connector binding asks the own connector, which performs the two steps with its credential (D75).

**D12. No notification to the own company.** A receiver equal to the own Business Partner Number receives no notification: the executor applies the step locally in the same transaction, and for NewPassportIssued the executor writes the received record that a forward link names (§9.2.2). This specification rejects a notification through the own connector to the own server, which costs a contract negotiation for no information.

**D13. Predecessors of another data provider.** A new passport names each predecessor by the five properties of a predecessor link, by its battery identifier, by the catenaXId of its original battery model, and by the status and the original purpose that the second-life operator read from the original passport. Each company has its own deployment, so an original passport of another data provider is no record of the second-life operator's database. The executor checks the admission rule on the declared values and stores the declared status in `predecessor_status`. For a predecessor that the own database holds, the executor reads the stored status and refuses a declared status that differs. This specification rejects a limit to predecessors of the own database, which excludes the main case of the proposal, and rejects a read of the original nameplate by the server, because the status is offered only to the purchaser and the server holds no contract of the purchaser.

**D14. The identifier rule.** The battery identifier follows section 2.1.1 item 3 of the proposal: a request with one predecessor and an operation other than `remanufacturing` must carry the predecessor's battery identifier, and a request with the operation `remanufacturing` or with two or more predecessors must carry a battery identifier that differs from every predecessor's. A passport identifier that equals a predecessor's passport identifier is refused. Both failures answer `ERR-LC-IDENTIFIER-RULE`. This specification rejects a new battery identifier after every operation, which contradicts DIN DKE SPEC 99100 clause 6.1.2.2.

**D15. The own values of a new passport.** A new passport holds its own battery category, its own facility, its own dates and its own four performance values, and takes none of them from a predecessor or from the battery model. The schema `issueNewPassport` requires the four performance values, the facility and the date of putting into service, which Table 2.1.2 of the proposal makes the second-life operator set. This specification rejects a default from the original model, which hides a missing value.

**D16. The permanent manufacturer.** The manufacturer identification of a passport is permanent (SyR-LIFE-155, Manufacturer identification of a passport never changed after issue; SwR-DATASET-208, Database trigger refuses a change of a passport's manufacturer). The passport stores the identification in `manufacturer_bpnl`; the trigger `trg_passport_identity` refuses every change for every database role; the foreign key is `ON DELETE RESTRICT`; and no step writes the acting company into the column. The waste step and the end step write the successor and the recycler into their own columns. This specification rejects an exemption for a migration role, because the reference server migrates no earlier data.

**D17. The named waste successor.** The data provider records the successor that the BatteryBecameWaste notification names, with the role that the notification names, as section 2.1.5 item 4 of the proposal and the reworded SwR-DATASET-191 (Waste step records the named successor, never the actor as manufacturer) state (point 5 of the owner's decision of 2026-11-16, §12.1). The database refuses the status `waste` without a named successor (SwR-RDB-074, Change to waste refused without a named successor): the constraint `passports_waste_successor_check` requires the three successor columns, and the deferred function `check_responsibility` requires at the commit the successor's open responsibility interval, which starts at the waste date (decision D55, The dates of the waste status and of the end are rules of the database). No step writes the successor or the acting company into `manufacturer_bpnl` (D16). The owner rejected the rule of version 1, which refused a successor with the role `producer` that is not the manufacturer of record, because an importer can be the producer of a battery (Annex B point 13 of the proposal). The system requirement SyR-LIFE-129 (Producer of the current passport takes over a waste battery's passport) is therefore not met for a named producer that is not the producer of the current passport, and §5.7 holds the rewording that the owner reads before the registry changes. The named successor, its role and the waste date never change after the waste status is set (decision D65, The named waste successor is permanent).

**D18. The successor's authorisation with its period.** After the waste status the data provider changes the passport only while a written authorisation of the successor is in force. The passport stores the authorisation in three columns: a reference, a first day and an optional last day. The data provider records the authorisation through `EP-SUCCESSOR-AUTHORISATION`; a later authorisation replaces the earlier one, and each change is written to the audit table with the replaced and the recorded values (§9.2.7), so the replaced authorisation stays on record. The owner decided the design on 2026-11-16 (point 1 of the section "Four decisions before phases P1 to P3, and the tools" of the owner's file of §12.1). The executor, the trigger `trg_passport_after_waste` and the five triggers of the function `check_child_after_waste` read the period against the UTC date of the request (D53 (One clock in UTC), D61 (The rule after the waste status covers the records of the passport)). The end of the passport is exempt (SwR-DATASET-201, End of the passport exempt from the successor authorisation check). The authorised company never writes into the data provider's database: the authorised company reports its event, and the data provider applies the event under the recorded authorisation (D6). The owner's decision rejects an authorisation without a period and a fourth table for the authorisations.

**D19. The repair entry.** A repair is applied by the data provider on a received BatteryRepaired: one repair entry per repair certificate and the status `re-used`. A second notification with the same certificate adds no entry. This specification rejects a status change without the certificate reference, which SwR-DATASET-202 (Repair entry stored with the repair certificate's catenaXId) refuses with status 400. The owner has not decided this point, and the decision is listed in §19.1.

**D20. The end of a passport from every status.** The data provider records the end of a passport after PassportEnded from every status, as section 2.1.7 item 3 and section 2.1.5 item 5 of the proposal require ("which the data provider MUST make in every case"), and leaves the status unchanged, as Table 2.1.4 of the proposal states for the recycling. A passport that ends without the waste status keeps its responsible operator and has no waste successor. `EP-REPORT-RECYCLING` sends only PassportEnded. This specification rejects the rule of version 2, which refused PassportEnded for a passport that is not waste: a waste receiver that reached no contract with the data provider sends no BatteryBecameWaste (section 4.3 item 3 of the proposal), and such a passport would otherwise never show its end.

**D21. One definition of the message.** The eight schema files of `docs/api/schemas/` are the one definition of the notification message, in the 2020-12 dialect of JSON Schema that OpenAPI 3.1.0 uses. `docs/api/openAPI.yaml` references the files, and the server compiles the same files. The stored and the generated aspect schemas keep their draft-04 dialect and are compiled by a second compiler class of the same validator family (§10.6). This specification rejects a second definition of the message in code.

**D22. The outbox.** A lifecycle step writes its notifications as `pending` records in the transaction of the step, and the worker sends each record after the commit. A failed commit therefore leaves no notification. This specification rejects sending inside the request before the commit, which notifies a receiver of a step that a failed commit undoes.

**D23. The exposure after the commit.** A twin is registered and the offers are published after the transaction of the step has committed (§9.2.5, §9.3). A failed refresh leaves the stored step in place, is answered in the field `exposure`, and is repeated through `EP-TWIN` or `EP-MODEL-TWIN`. The rule holds for every endpoint whose column "After the commit" of §9.3 names a refresh. This specification rejects a rollback of the step after a failed registration, because the notifications of the step are already written. A refresh of an ended passport withdraws the dataset offers first, so that `EP-TWIN` also repeats a failed withdrawal (§9.2.5).

**D24. Two database roles and row-level security.** The database enforces the single writer through row-level security policies that read the transaction setting `app.acting_bpnl` (SwR-DATASET-190, Passport rows written only under the responsible operator's context). The server connects only as the role `refserver_app`, which owns no table, holds no `DELETE` privilege, cannot create a role, cannot create a table and cannot create a temporary table, and only the migration command connects as the owner of the schema (§9.2.8). The threat and its bound: a defect of the server, or an injected statement, acts with the privileges of the connected role, so the connected role must not be able to disable a trigger, to change a policy, to delete a record or to replace a table inside a trigger function; the two roles and the fixed search path of D60 (A fixed search path for every function, no temporary table for the application role, and a database of its own) give that bound, and a statement `RESET ROLE` gains nothing, because the session never changes its role. **The bound of the two settings.** The role `refserver_app` sets `app.acting_bpnl` and `app.today` itself. The twelve policies and the rule after the waste status therefore protect against a defect of the server code that passes a wrong value in one statement, and do not protect against a party that holds the credentials of the role: that party sets `app.acting_bpnl` to another Business Partner Number, records an authorisation and sets `app.today`. The triggers that read no setting (the permanent identity, the lineage, the responsibility timeline, the append-only records, the end of a passport) hold against that party as well. The separation of companies does not rest on the policies: one deployment serves one company and one database schema holds the passports of that one company (D6), on which §9.2.2 (the single-writer rule), §9.2.8 (`withTransaction` passes `config.ownBpnl`), §9.4 and the five tables without a policy rely. The in-process binding of the test kit gives each of its three participants a schema of its own in one test database (§9.2.9), which is a test arrangement and no deployment. **The protection of the credentials.** The password of `refserver_app` exists in the environment variable `DATABASE_URL` of the server process and in the secret store from which the operator of the deployment fills the variable; no file of the repository holds the password (§13), the logger writes no connection string, the server offers no endpoint that takes SQL text, and every statement of the server passes its values as parameters. This specification rejects the design of version 2, in which the server connected as the owner and lowered its role inside each transaction, and rejects a signed setting that the database verifies, which needs a key inside the database and protects one schema of one company against no further party. **The powers that PostgreSQL leaves to the role.** Four powers of a role without ownership cannot be revoked in PostgreSQL 17, and each concerns the availability of the server and no rule of a passport. First, the role changes its own password with `ALTER ROLE`; the server then loses its connection at the next login, and the administrator sets the password again with `npm run create-role`. Second, the role stores settings for its own later connections with `ALTER ROLE ... SET`. The deployment bounds the power at four places: `createAppRole` removes every stored setting of the role, the settings for every database and the settings for one database (§9.2.8), `003_policies.sql` and the start of the server stop when the catalogue `pg_db_role_setting` holds a setting of the role, the connection options of `createPool` take precedence over a stored setting, and `withTransaction` names the isolation level in its `BEGIN` statement, so a stored isolation level changes no transaction of the server, and a transaction of another level writes no record (decision D66, Every write runs at the isolation level READ COMMITTED). Third, the role takes an advisory lock, the lock of `createAppRole` included; the command of the administrator then waits, and the administrator ends the session of the role with `pg_terminate_backend`. Fourth, the role chooses the value of an identity column with `INSERT ... OVERRIDING SYSTEM VALUE`, which needs no privilege; a row with the next value of the sequence makes one later insert fail with `23505` on the primary key, after which the sequence has passed the value. This specification accepts that residual effect and adds no trigger, because a BEFORE INSERT trigger cannot tell a chosen value from a generated value. The role takes no table lock above ROW EXCLUSIVE, because the role holds the privilege UPDATE by column only (decision D67, The privilege UPDATE by column).

**D25. The audit table.** The audit trail is the table `passport_write_decisions` (D42): one record per granted and per refused write decision, written after the transaction of the request has ended (§9.2.7). SwR-AUDIT-045 (Dataset write decisions recorded with the authorisation relied on) names the fields of the record. This specification rejects a log line alone, which no reader of the database finds, and an audit record inside the transaction of the request, which a refused request rolls back. A failed insert after the transaction of a request queues the record in `audit_outbox`, which the worker writes later (D69).

**D26. The OpenAPI file holds four operations.** `docs/api/openAPI.yaml` holds exactly the four operations of the lifecycle notification API, and the operator endpoints of §9.3 are documented in `docs/development-view.md` and defined by the schemas of `server/schemas/`. The proposal standardises only the notification API. This specification rejects the operator endpoints in the OpenAPI file, which the measure of PrR-CXD-019 (Four notification operations with JSON schemas, following the Industry Core KIT) fails.

**D27. A subset of JSONPath.** The server evaluates a subset of JSONPath (RFC 9535) for `AccessMapEntry.path`: the root identifier `$`, the name selector in dot notation and in bracket notation, the wildcard selector `[*]`, the index selector with a non-negative integer, and one filter selector of the form `[?@.<name>=='<string>']`. Every path of the subset is a valid query of RFC 9535. A path outside the subset is refused with `ERR-LC-PATH-NOT-SUPPORTED`. This specification rejects a JSONPath library, whose name and version are not verified against a stored text.

**D28. Supplied payloads.** The data provider supplies the payload of each of the eight models of CX-0160-3 and of the SerialPart and SingleLevelBomAsBuilt models through `EP-ASPECT-PUT`. The server validates a payload of the four models that `sources/IDTA/` stores and stores the other six payloads unchecked. The server registers a submodel descriptor for each stored payload and does not refuse a new passport that lacks a payload; the second-life operator's duty to provide every model (section 2.1.1 item 5 of the proposal) is the duty of the operator, and `tck/CAC-002.tck.mjs`, a planned file of §7, stores the ten payloads and asserts the descriptors. This specification rejects a mapping of each model from database columns, which is the work of a battery passport application and not of the lifecycle interfaces.

**D29. The access regime and the admitted roles.** `ACCESS_REGIME` selects the access rule of section 2.2 of the proposal, and `ADMITTED_ROLES` holds the table. A role outside the cell answers `ERR-LC-ROLE-NOT-ADMITTED`. This specification rejects one fixed regime, which leaves the criterion of the access before the act or the criterion of the access after the act without a test.

| Aspect key of the access record | Admitted roles under `after-act` | Admitted roles under `before-act` |
|---|---|---|
| `product-condition` | `purchaser`, `purchaserAgent` | all six roles |
| `lifecycle` | `purchaser`, `purchaserAgent`, `responsibleOperator`, `successor`, `marketSurveillanceAuthority` | all six roles |
| `successors` | `authorisedRecipient`, `marketSurveillanceAuthority` | `authorisedRecipient`, `marketSurveillanceAuthority` |
| each of the other nine stored aspect keys | all six roles | all six roles |

**D30. The change of purchaser.** A change of purchaser and a direct re-use are one step, `EP-PURCHASER`: the step sets `valid_to` of the open access records of the roles `purchaser` and `purchaserAgent` of the passport to the current time and inserts the records of the new purchaser, and of the agent when the request names one, for the aspect key `product-condition`, for the aspect key `lifecycle`, and for each of the seven IDTA-02035 aspect keys for which the current access map of the battery model holds one entry or more of the access group `legitimateInterestBattery` at the twin level `PartInstance`, so that the purchaser reads the battery status of the nameplate. The step writes no passport column, no lineage link and no responsibility interval, so the passport, its identifiers, its status and its responsible operator stay unchanged (SwR-DATASET-195, Direct re-use recorded as a purchaser change, never as a lineage step). This specification rejects a lineage step for a direct re-use.

**D31. Test modules per criterion.** The conformance tests are `node:test` modules named `CAC-<nnn>.tck.mjs`, and `TCK_BINDING` selects the binding. This specification rejects two copies of the tests, one per binding.

**D32. The stored shared models.** The three models import the shared models `io.catenax.shared.uuid` 2.1.0 and `io.catenax.shared.business_partner_number` 2.0.0, the two versions that `sources/Tractus-X/semantic-models/` stores `[live]`, and the SAMM validation resolves both from `sources/` without a download of a model. Sections 3.2.2 and 3.3 of draft 0.7 of the proposal name version 2.0.0 of the uuid model; the owner accepted on 2026-11-16 that the next draft of the proposal names version 2.1.0 (§12.1), and `docs/proposals.md` records the difference in phase P2. This specification rejects a download of version 2.0.0.

**D33. The offers of an ended passport.** After the end of a passport the data provider withdraws the offers of the ten stored aspect keys, so that no new agreement delivers the dataset as a current dataset (SwR-CXCLIENT-110, Recycling withdraws the passport dataset offers), and keeps the offers of the lifecycle submodel and of the successors submodel. The persons who read the passport before the end keep their agreements, which meets the criterion on the persistence of an ended passport. This specification rejects the withdrawal of the lifecycle offer, which hides the end of the passport. The assumption on the open decision Q-025 (access to the record of a recycled battery's ended passport) is in §5.5. The owner has not decided this point, and the decision is listed in §19.1.

**D34. The passport service provider as a receiver.** The deployment of the data provider sends PassportEnded to the passport service provider that `PASSPORT_SERVICE_PROVIDER_BPNL` names, 5 seconds after the deployment has recorded the end of a passport, whether the end arrived in a notification of the recycler or was applied locally (SwR-CXCLIENT-111, End of a recycled battery's passport made known to the provider). The recycler's deployment plans no notification for a passport service provider, because the recycler does not know the passport service provider of the data provider. Without the variable the plan holds no entry for a passport service provider, and the end of the passport is made known by the PassportEnded notifications to the receivers of Table 4.3 of the proposal and by the lifecycle submodel. `tck/CAC-009.tck.mjs`, a planned file of §7, runs with the variable set. This specification rejects a second notification form for the passport service provider. The assumption on the open decision Q-961 (how the passport service provider learns a passport ended) is in §5.5. The owner has not decided this point, and the decision is listed in §19.1.

**D35. The reference to the original battery model.** Each data provider registers its own PartType twin for its catalogue part, and a battery model of a treated battery references the original battery model in `original_model_catena_x_id` and `original_model_manufacturer_bpnl`. `issueNewPassport` refuses a battery model without the reference, or whose reference equals the original model of no predecessor, with `ERR-LC-MODEL-NOT-ORIGINAL`. For a battery remanufactured from batteries of different models, the second-life operator chooses one of the original models, as Annex B point 12 of the proposal states. The new passport keeps the original battery model as the reference of the design in this way (SyR-LIFE-028, New passport dataset takes over the original battery model). No aspect model serves the reference: a data consumer follows the predecessor link of the new passport to the original passport, whose digital twin names the original model in its specific asset ID `manufacturerPartId`. The owner decided this path on 2026-11-16 (point 2 of the section "Four decisions before phases P1 to P3, and the tools" of the owner's file of §12.1), and phase P8 states the path in `docs/development-view.md`. The owner's decision rejects a new property of a proposed model for the reference.

**D36. The derived supersession.** The supersession of an original passport is derived: the lineage link in the second-life operator's database and the successor link in the original data provider's database. No step writes a superseded mark or a status into an original passport (SwR-DATASET-192, Lineage step writes no link into an original passport row). This specification rejects a superseded column that the second-life operator writes.

**D37. The packages.** The server depends on five packages: `express`, `pg`, `ajv`, `ajv-formats` and `ajv-draft-04`. The tests of the server add `yaml`, and the test kit depends on `pg`, `ajv`, `ajv-formats`, `ajv-draft-04` and `yaml` (§9.8). The server signs and verifies operator tokens with `node:crypto`, runs its tests with `node:test`, and calls partners with the `fetch` of Node.js 24. This specification rejects a web framework, a query builder and a token library beyond these packages.

**D38. The sharing of individual battery information.** The reference server builds the sharing of individual battery information with the original issuer under a contract, use cases LC-1 and LC-5b of the proposal (D42). The offering deployment records a provider contract and publishes one offer whose access admits only the Business Partner Number of the issuer and whose usage purpose is `cx.circular.dpp:1`. The deployment of the issuer records an issuer contract, and the worker then runs the catalogue request, the contract negotiation, the transfer and the storage as one sequence without a further operator step. The received information is stored in `received_battery_information` and is never written into a passport or into a payload of a passport. The offer rests on the two use cases and on Annex B point 1 of the proposal under both values of `ACCESS_REGIME`: the original issuer is a recipient that section 2.2 item 2 of the proposal does not name, and the contract with the purchaser is the basis. This specification rejects a write of the received values into the product condition payload of the issuer's passport, which would let a partner change a passport outside the four notification steps.

**D39. The draft implementing act.** The requirements that rest only on the draft implementing act under Article 77(9) of Regulation (EU) 2023/1542 wait for the adoption of the act (group 2 of §5.4). Annex B point 1 of the proposal states that the final act may change the exceptions. This specification rejects building the rules on the draft text.

**D40. The admission rule.** The admission rule of a lineage operation reads, for each predecessor, the declared status and the declared original purpose, and the purpose of the request: `preparationForReUse` needs the status `waste` and an equal purpose; `preparationForRepurposing` needs the status `waste` and a different purpose; `repurposing` needs a status other than `waste` and a different purpose; `remanufacturing` needs a status other than `waste` and an equal purpose. The status of the new passport is `re-used`, `repurposed`, `repurposed` and `remanufactured` in that order. `dateIntoService` must not be before the date of `operationDate`. A failure answers `ERR-LC-OPERATION-NOT-ADMITTED`. A predecessor may be named by more than one new passport: one donor battery may supply several remanufactured batteries, as the owner decided on 2026-11-16 (point 3 of the section "Four decisions before phases P1 to P3, and the tools" of the owner's file of §12.1; decision Q-042, whether a donor battery may supply several remanufactured batteries). This specification rejects a re-use operation that is admitted from every status.

**D45. The data provider's check of a new payload.** `putAspectPayload` checks a payload of one of the seven IDTA-02035 aspect keys against the current access map, so that the rule "one entry for every served field" of section 2.2 item 9 of the proposal holds for a payload that is stored after the access map (§9.2.4). The check covers the seven IDTA-02035 aspect keys only, because the proposal defines the access map for those seven models. This specification rejects a check at the access map upload alone, which a later payload escapes.

**D46. The partial delivery of the lifecycle data.** The reference server delivers four of the seven items that SwR-DATASET-126 (Lifecycle data delivered beside the seven aspects in the decided carrier) names: the links to the original passports with their operation, the supersession through the successors model, the repair history through the repair certificates that BatteryRepaired names, and no treatment description, no descriptive term and no original placing date. Phase P8 sets the state of the requirement to `partial`. This specification rejects a claim of the whole requirement.

**D47. The access to the notification asset.** The notification asset admits every participant unless `NOTIFICATION_ALLOWED_BPNLS` names the participants that the access policy admits. The threat: a participant that knows a passport identifier can report the waste status of the passport, which no later step reverts, and can then report its end. The bound has three parts: the operator of a data provider can limit the asset to its business partners; every applied notification is stored with its sender, its content and its time and is never changed; and the receiver guard of D7 ties the sender of the header to the participant that negotiated the contract. This specification rejects a step that reverts a waste status, which the proposal does not define. The open default and the absence of a revert step are chosen by this specification; the owner has not decided.

**D48. The repair certificate before the notice.** `EP-REPORT-REPAIR` sends BatteryRepaired only when the twin registry of the repairer's deployment holds a shell with the catenaXId of the repair certificate, so that the repairer registers the certificate before the repairer reports the repair (section 2.1.4 of the proposal: the repairer MUST register the CX-0131 repair certificate). The repairer registers the certificate twin with its own system, and the test kit registers a shell through the registry of the binding. The reference server builds no certificate payload, because the repair certificate model is cited and not stored. This specification rejects a notice without the check, which lets the notice precede the registration. The form of the check is chosen by this specification; the owner has not decided.

**D51. The form of a manufacturer name item.** The served element `$.ManufacturerName` of the nameplate is a list with one object whose one key is the language code and whose value is the legal name, the JSON form of a language string of the Semantic Aspect Meta Model. The stored nameplate schema states a list of objects and no property of an item `[live]`, so every object validates. This specification rejects an item with the two properties `language` and `text`, which no stored text states either. The form of the item is chosen by this specification; the owner has not decided.

**D52. The tools in containers.** Node.js 24 runs in a container of the image `node:24`, Java 21 in a container of the image `eclipse-temurin:21`, and PostgreSQL 17 in a container of the image `postgres:17` with a published local port; nothing is installed on the machine, and the SAMM command line tool is downloaded once into `tools/` from the releases of its Eclipse project (§11.0, §11.2). Two named volumes of Docker hold the installed npm packages, so that the repository folder holds no installed package. The owner decided the rule on 2026-11-16 (point 5 of the section "Four decisions before phases P1 to P3, and the tools" of the owner's file of §12.1). The owner's decision rejects an installation of the three tools on the machine.

**D53. One clock in UTC.** Every time of the server comes from the injected `clock`, and every date of the server is the UTC date of that time. `createPool` sets the time zone UTC on every connection, and `withTransaction` passes the UTC date to the database in the setting `app.today`, which the trigger of the rule after the waste status reads in place of the date of the database server. This specification rejects two date sources for one rule, which disagree in a test with an advanced clock and close to midnight. The helper function `app_today` of the database admits only a text of the form `YYYY-MM-DD` that names a calendar date, so the date words of PostgreSQL that read the clock of the database server are refused with `ERR-DB-TODAY`. The helper casts the text with its own setting `DateStyle = 'ISO, YMD'` and accepts the dates 0001-01-01 to 9999-12-31.

**D54. The lineage of a new passport is open only inside its own transaction.** The column `passports.lineage_open` is set by a trigger at the insertion of a passport: true for a new passport, false for a first passport. The trigger of `passport_lineage_links` admits a link only while the column is true, the executor sets the column to false after the last link, a trigger refuses a change of the column from false to true, and the deferred check of the insertion refuses a commit with an open lineage. A lineage link can therefore exist only for a passport that the same transaction inserted, under a savepoint as well, and no statement of a later transaction adds a link, for the application role and for the owner alike. This specification rejects the comparison of the transaction identifier of the passport row, which version 4 held: an update of the passport by a later transaction gives the row the identifier of that transaction, and a savepoint gives the row another identifier. This specification also rejects a transaction-local setting that names the passport, because a caller that reaches the database under the application role can set the setting itself. The rule holds against a temporary table of the session as well, because the function that reads `lineage_open` has the fixed search path of D60.

**D55. The dates of the waste status and of the end are rules of the database.** The deferred function `check_responsibility` requires that the open interval of a waste passport starts at the waste date and that an earlier interval ends at the waste date; the constraint `passports_end_after_waste_check` refuses a recycling date before the waste date; the same function refuses a recycling date before the start of the open interval; and a trigger freezes the responsibility intervals of an ended passport, as section 2.1.7 item 4 of the proposal forbids a change of an ended passport. The executor applies the same rules first and answers the refusals of §10.4. This specification rejects rules in the executor alone, which a later implementer of the services can bypass.

**D56. One schema file for the envelope, and the context as a constant.** `LifecycleNotification.schema.json` defines the envelope of each operation: exactly the two properties `header` and `content`, the context of the operation as a constant, and the content schema of the operation. The OpenAPI file references the definition of each operation, and the server validates a body against the same definition, so a body with a third property and a header with the context of another operation are refused by the published contract. Section 4.3 item 4 and Table 4.3 of the proposal fix the context of each operation. This specification rejects an envelope that only the OpenAPI file holds, which the server and the tests cannot compile.

**D57. Line endings.** The file `.gitattributes` stores and checks out every text file with LF line endings (`* text=auto eol=lf`) and marks the binary file types; `sources/.gitattributes` keeps its rule for the third-party texts. A shell script with CRLF line endings fails in the Linux container, and the index of the repository already holds LF for every file outside `sources/` `[live]`. This specification rejects a rule per file type, which a new file type escapes.

**D58. Normative annexes.** §20, §21 and §22 print the files of phases P1 to P3 in full, the implementer copies them, and `scripts/check-annexes.mjs` compares each file with its block. A later change of such a file is a change of this specification. This specification rejects a description in prose alone, from which three reviewers built files that differed in the points that the prose left open.

**D59. The registry check per environment.** The registry check runs in the container of the image `node:24` on the owner's machine, where the check skips the ten quotes of the one stored PDF file, and on the Ubuntu runner with `poppler-utils`, where the check skips no quote; the line of the runner is the gate. This specification rejects the installation of a package in every container run, which needs the network for each check.

**D60. A fixed search path for every function, no temporary table for the application role, and a database of its own.** A function of `002_triggers.sql` names its tables without a schema, and PostgreSQL searches the temporary schema of a session first, so a session that created a temporary table `passports` made three rules of version 5 read the temporary table (finding R5-001 of the fourth review). Two barriers close the defect. First, the last statement of each migration file sets `search_path = <schema>, pg_temp` on every function of the schema, with the schema name read from `current_schema()` at the run, so a function resolves a table name in the schema of the migration and reaches the temporary schema last; every later migration file ends with the same statement, because `CREATE OR REPLACE FUNCTION` removes the setting of the function that the statement replaces (§9.2.8). Second, `003_policies.sql` revokes the privilege `TEMPORARY` of the database from PUBLIC and stops when the role `refserver_app` still holds the privilege or holds the privilege `CREATE` of a schema. The server needs neither privilege: the server creates no temporary table and no object, and the client library `pg` creates none. **The decision of the owner.** The revocation changes the database for every role that is no superuser and no owner of the database. The owner decided on 2026-11-16, with the words "accept, the reference server needs its own database" (section "A database of its own for the reference server" of the owner's file of §12.1), that the migration revokes the privilege from the group PUBLIC of the database and that the reference server runs on a database of its own. §3.1 states the requirement in the scope, and the installation guide and the administrator guide of phase P8 state the requirement for the operator (§11.8). This specification rejects a schema name written into each statement of the functions with `format()`, which turns each function body into a text that no reader checks as SQL and which the sixteen functions would repeat; one `DO` block gives the same result and is proven by the catalogue column `proconfig`. This specification rejects the revocation alone, which a later grant of an administrator undoes without a failing test of the rules, and rejects a revocation from the role alone, which PostgreSQL does not offer for a privilege that the role holds through PUBLIC.

**D61. The rule after the waste status covers the records of the passport.** The function `check_child_after_waste` refuses, without an authorisation of the successor in force, every insertion, update and deletion of a record of `passport_aspect_payloads`, `passport_purposes`, `passport_repair_entries`, `passport_successor_links` and `passport_lineage_links` of a waste passport, with the refusal id `ERR-DB-SUCCESSOR-AUTHORISATION` of D18, because the payloads and the records are the passport information that section 2.1.5 of the proposal places under the successor. §9.4.2 lists the writes that stay admitted. The same finding class gives the rule of the five values: an update never removes the date of putting into service or a performance value from a passport with a lineage link (D15). This specification rejects the rule in the executor alone, which D55 already rejects for the dates. **No record moves to another passport.** The function `refuse_passport_id_change` refuses an update that changes `passport_id`, on each of the nine tables with that column, because the rules of the end and of the waste status read the passport of a record, and a record that leaves its passport would be checked against the receiving passport (finding R6-001 of the fifth review). **The purposes are append-only.** A purpose record is never updated and never deleted, because the admission rule of D40 reads the purpose record with `is_original` true.

**D62. The responsibility timeline is determined by the passport.** A passport that is not waste has exactly one responsibility interval: the manufacturer of the passport as economic operator, from the start of the passport, which is the date of manufacture at 00:00:00 UTC for a first passport and the operation date of the lineage links for a new passport. A waste passport has exactly two intervals: the first interval ends at the waste date, and the interval of the named successor starts at the waste date. No step of the proposal changes the responsibility at another moment, so the database refuses every other timeline: the trigger `trg_interval_change` admits only an open interval that starts exactly at the end of the earlier interval, without a gap and without an overlap, and the deferred function `check_responsibility` compares the intervals with the passport at the commit. The only admitted update sets the end of the open interval. Every date and time of the timeline is finite (decision D68, Finite dates and no NaN). A waste date of the future cannot be judged by the database, which holds no clock; the executor refuses a step whose date is after the current UTC date of `clock` (§9.2.2), and the bound of D24 covers a party that writes with the credentials of the role. This specification rejects an exclusion constraint on the passport and the period, which needs the extension `btree_gist` in PostgreSQL 17, so the three migration files need no extension and no privilege to create one, and rejects a free timeline with a rule against overlaps only, in which version 6 admitted an invented company, a gap and a start at `infinity`.

**D63. References across the bound of a company.** A passport references a battery model of its own manufacturer through a foreign key of two columns, and `access_map_versions`, `access_map_entries` and `issuer_contracts` have a policy, so a row of the acting company never references a battery model or a passport of another company (§9.4.3). A reference to a row of another company and a reference to no row give the same refusal. The unique passport identifier leaves one existence signal, which §9.4.3 states. This specification rejects a policy on the five tables of the deployment, whose records name no company of the schema. Two existence signals remain, on the identifiers of a passport and on the identifier of a battery model, which §9.4.3 states.

**D64. The generated schemas outside `models/`, and one compiler of the draft-04 schemas.** The folders of `models/` hold exactly the files of a stored Tractus-X namespace, and the generated schema and the example payload of each model are files of `docs/api/aspects/`, beside the other schemas that the server compiles. One module, `server/src/validation/aspectSchemaCompiler.mjs`, builds the compiler of the draft-04 schemas in strict mode with the two keywords of the SAMM command line tool. This specification rejects a folder `gen` inside `models/`, which no stored Tractus-X namespace holds, and rejects strict mode off, which lets a misspelled keyword and an unknown format pass.

**D65. The named waste successor is permanent.** After the waste status is set, the named successor, its role and the waste date of a passport never change: the trigger `trg_passport_identity` refuses the change with `ERR-DB-WASTE-SUCCESSOR`, also under an authorisation of the successor in force. On a waste passport only the three authorisation columns and the three end columns change. No operation of the proposal changes the successor of a waste battery: section 2.1.5 of the proposal names one transfer of the responsibility, at the moment at which the battery becomes waste. This specification chose the rule because a party that records an authorisation itself otherwise names another successor (finding R6-004 of the fifth review). The rule narrows what an authorised data provider may do, and the owner has not decided the rule. Another choice of the owner (a second transfer of the responsibility after the waste status) needs a new operation, a new migration file and a timeline with more than two intervals.

**D66. Every write runs at the isolation level READ COMMITTED.** Every trigger function calls `require_read_committed()` first, and the helper refuses a transaction of another level with `ERR-DB-ISOLATION`. The reason is the class of the defect that the fifth review found (finding R6-002): under REPEATABLE READ and SERIALIZABLE a function reads the snapshot of its transaction, so a deferred check at the commit compares a passport with intervals that another transaction has already replaced, and a lock on the rows that the function reads cannot show a row that another transaction inserted after the snapshot. Under READ COMMITTED each statement of a function reads the committed state, and the row lock of the passport, which every write of a record takes, orders two transactions on one passport. The author ran the races of the fifth review and the further cases of §14.2 at the three levels on 2026-11-16: at READ COMMITTED each race ends with the refusal of the rule, and at the two other levels the first write ends with `ERR-DB-ISOLATION`, or with the serialisation failure `40001` of PostgreSQL where the write updates a row that the other transaction changed. `withTransaction` names the level in its `BEGIN` statement, and the connection options of the pool name the level as the default (§9.2.8). This specification rejects locks in place of the refusal, which leave the snapshot of the other tables in use, and rejects a refusal in the deferred checks alone, which a later trigger function can lack; group (a) of the database rule tests reads the source of every trigger function.

**D67. The privilege UPDATE by column.** The role `refserver_app` holds the privilege UPDATE on the columns that a step of the server changes, on seven tables, and on no other column (§9.4.3). The role therefore rewrites no message of a stored notification, reopens no closed access record, moves no record and changes no date of a stored passport, and the role takes no table lock above ROW EXCLUSIVE, which needs a privilege on the whole table. The triggers hold the same rules for the owner where a rule of a passport is concerned; the privileges bound the remaining columns, for which no trigger exists. This specification rejects the privilege on the whole row, under which version 6 let the role rewrite the outbox and the access records, and rejects one trigger per column, which repeats what the privilege system of PostgreSQL states in one line.

**D68. Finite dates and no NaN.** Every column of a date and time is of the domain `finite_timestamptz`, and every column of a date is of the domain `finite_date`; each domain refuses the values `infinity` and `-infinity`. The two constraints of the numeric columns without an upper bound name the value `NaN`, which the type `numeric` orders above every number. One domain per type states the rule once for the 44 columns of the two types in the four migration files (40 columns of `001_schema.sql` and 4 columns of `004_audit_outbox.sql`, observed on 2026-11-19), and a later column of a later migration takes the domain. This specification rejects one CHECK constraint per column, which a later column can lack, and rejects a bound in the executor alone.

**D69. The audit record after a failed write is queued.** When the audit record of a decision cannot be written after the transaction of the request, the server answers the true outcome (the status 200 with the outcome `applied` for a receiving step, and the success answer of an operator step), logs the failure at the level `error`, and writes the record into the queue `audit_outbox` of the fourth migration file `004_audit_outbox.sql`, which the outbox worker writes later (§9.2.7, §9.4.4, §23). The three frozen migration files do not change. The owner decided the rule on 2026-11-19 with the option "Success, and audit queued" (section "Three decisions after the code review of phases P4 and P5 (2026-11-19)" of the owner's file of §12.1, question 1). The owner's decision rejects the answer 500 "stored nothing" of version 9 for a stored step, after which a resend answered `duplicate` and the audit record was lost.

**D70. The recycler of PassportEnded is the sender.** The receiving step refuses a PassportEnded whose `content.recyclerBpnl` differs from `header.senderBpn`, with `ERR-RX-SENDER-MISMATCH` (403), in the fifth check of §10.4, so that no participant records another company as the recycler of a passport. The owner decided the rule on 2026-11-19 with the option "Must equal the sender" (section "Three decisions after the code review of phases P4 and P5 (2026-11-19)", question 2).

**D71. The fields of the operator answers as built.** §9.3 records the fields inside `data` of every operator answer as the code of phases P4 and P5 builds them, and phase P6 freezes the names. The owner decided the rule on 2026-11-19 with the option "Accept the names as built" (section "Three decisions after the code review of phases P4 and P5 (2026-11-19)", question 3).

**D72. The clock tolerance of an operator token.** A token whose `iat` lies more than 60 seconds after the current time is refused (§9.2.3). The 60 seconds admit the difference between the clock of the signing command and the clock of the server. Decision D41 states the lifetime of 3600 seconds and no tolerance, so the value is chosen by this specification; the owner has not decided. Another value changes one constant of `server/src/access/operatorToken.mjs` and one case of its test.

**D73. The exposure of a battery information offer.** `EP-PROVIDER-CONTRACT` and `EP-CONTRACT-END` answer the field `exposure` beside `contract`, with the result of the publication or of the withdrawal of the battery information offer (§9.2.5), and repeating `EP-CONTRACT-END` on an ended provider contract withdraws the offer again and answers `ERR-LC-CONTRACT-ENDED` with the result logged, so that a failed withdrawal is repaired (finding R45-013). The field is an addition to the names that the owner accepted on 2026-11-19 (D71), so the rule is chosen by this specification; the owner has not decided. Another choice keeps the answers of D71 and leaves a failed publication or withdrawal to the log. An issuer contract has no offer, so `EP-CONTRACT-END` of an issuer contract answers `exposure` with the value `{ "refreshed": true }`.

**D74. The binding contract and criterion CAC-012 (notification API).** Criterion CAC-012 requires of the sender "the record of each receiver without an asset" and of the receiver "a descriptive error body on every 4xx or 5xx answer". The binding contract of phase P6 can neither withdraw the asset of a receiver nor post a message as a partner, so `tck/CAC-012.tck.mjs` of phase P6 asserts the record of a receiver that does not resolve and the error bodies of the answers 405 and 404. This specification chose two rules. First, the binding contract gains `withdrawNotificationAsset()` and `publishNotificationAsset()` on each participant in phase P7, for the in-process binding and for the connector binding, and `tck/CAC-012.tck.mjs` then asserts the record `no_asset`, because the criterion is a MUST and names that record. Second, the binding contract gains no partner POST: the receiver answers every refusal through the one error handler of §9.3, the test kit reads that body on the answers 405 and 404, and the server tests validate the body of each refused POST. The owner has not decided the two rules. Another choice adds a partner POST to both bindings in phase P7, or keeps the assertions of phase P6. The owner has not decided this point, and the decision is listed in §19.1.

**D75. The receiver resolution through the own connector.** The resolver of the connector binding calls the connector discovery request of Tractus-X EDC 0.13.0, `POST /v3/connectordiscovery/connectors` on the management API of the own connector (tractusx-edc at the tag `0.13.0` (commit `964d33d7ed942369f624aacbc45037a1f79fc7be`), `tractusx-edc/docs/usage/management-api-walkthrough/04_catalog.md` lines 29 to 75), and returns `{ did, connectorUrl }` from its answer (§9.2.5). The connector holds the credential that the BPN-DID Resolution Service requires (CX-0167 (BPN-DID Resolution Service) 1.0.0 section 2.1), so the server holds no credential and D41 stays, and the variable `BPN_DID_RESOLUTION_URL` leaves §9.6. The owner decided the rule on 2026-11-19 with the option "Ask the own connector" (section "Three decisions after the verification of Tractus-X EDC 0.13.0 (2026-11-19)" of the owner's file of §12.1, question 1). The owner's decision rejects a call of the BPN-DID Resolution Service by the server, which needs a Membership Credential in the server. Production keeps the rule; the local test deployment resolves a receiver from a fixed address list, because the wallet stub writes no `DataService` entry into an identity document (decision D81, A fixed address list in the local deployment only).

**D76. The wallet stub as the local identity.** `tck/docker-compose.yml` runs the three connectors of release 0.13.0 with the Tractus-X wallet stub `tractusx/ssi-dim-wallet-stub` 0.1.0 as the identity of each, as the Tractus-X umbrella 3.9.0 uses the stub for local tests (`charts/umbrella/values-adopter-data-exchange.yaml`, "Replace by ssi-dim-wallet-stub"). No text states that the stub works with release 0.13.0, so the first run of the second part of phase P7 proves it. When the first run fails, the implementer reports the failure to the owner, and only then does the contingency apply: the connector modules of §7 with contract tests against recorded answers, and the run of the test kit across real connectors in a Catena-X environment with an operator account. The owner decided the rule on 2026-11-19 with the option "Wallet stub with EDC 0.13.0" (section "Three decisions after the verification of Tractus-X EDC 0.13.0 (2026-11-19)", question 2). The owner's decision of 2026-11-19 amends the layout: one stub serves the three companies (decision D80, One wallet stub for the three companies).

**D77. OAuth2 off in the local registry.** The Digital Twin Registry 0.13.0 activates OAuth2 by default (sldt-digital-twin-registry at the tag `v0.13.0`, `INSTALL.md` lines 28 and 38). The local test deployment of `tck/docker-compose.yml` switches OAuth2 off with the setting of the registry that lines 28 and 38 of `INSTALL.md` name; the setting is the chart value `registry.authentication` `false`, which starts the registry with the argument `--spring.profiles.active=local` (sldt-digital-twin-registry at the tag `v0.13.0`, `INSTALL.md` lines 28 and 38, `charts/registry/templates/registry/registry-deployment.yaml` lines 45 to 47; confirmed by the first run, §10.7). A production deployment keeps OAuth2, and the administrator guide of phase P8 states the production setting (§11.8). The owner decided the rule on 2026-11-19 with the option "OAuth2 off locally" (section "Three decisions after the verification of Tractus-X EDC 0.13.0 (2026-11-19)", question 3).

**D78. No credential of the registry in the server.** The reference server reaches the Digital Twin Registry without a credential, because D77 switches OAuth2 off in the local deployment and the configuration of §9.6 holds no credential of the registry. A production registry with OAuth2 therefore needs a client of the registry that version 12 does not specify, and the administrator guide of phase P8 states that limit. The rule is chosen by this specification; the owner has not decided. Another choice adds the variables of an OAuth2 client to §9.6 and a token request to `server/src/twins/dtrTwinRegistry.mjs`.

**D79. A database image of its own for the connectors.** The connectors of release 0.13.0 run on the image `postgres` in version 18.0 (`tractusx-edc/docs/migration/2026_06-Version_0.12.x_0.13.x.md` section 3), and the reference server runs on PostgreSQL 17 (§9.8), so `tck/.env.example` holds the two variables `TCK_IMAGE_POSTGRES` (`postgres:17`, the server) and `TCK_IMAGE_CONNECTOR_POSTGRES` (`postgres:18.0`, the connectors). The rule is chosen by this specification; the owner has not decided. Another choice runs one image for both, which leaves either the server or the connector outside its stated version.

**D80. One wallet stub for the three companies.** The local test deployment runs one wallet stub `tractusx/ssi-dim-wallet-stub` 0.1.0 as the identity of the three connectors, as the Tractus-X umbrella 3.9.0 gives all its connectors one stub. Three stubs refuse each other, because a stub reads the identity document of another stub only over https and the local deployment serves no https, and with one stub the catalog request, the negotiation and the transfer worked end to end (`tck/README.md`, section "The first run of phase P7", results 1 and 2). The run therefore does not test the trust between separate wallets of separate companies; a Catena-X environment with the wallets of an operator tests that trust. The owner decided the rule on 2026-11-19 with the option "One shared stub" (section "Three decisions after the first run across Tractus-X EDC 0.13.0 connectors (2026-11-19)" of the owner's file of §12.1, question 1).

**D81. A fixed address list in the local deployment only.** The local test deployment resolves a receiver from the address list `RECEIVER_ADDRESS_LIST` of §9.6, which maps each Business Partner Number to the Dataspace Protocol address and to the decentralised identifier of its connector, and the resolver `createAddressListResolver` of §9.2.5 serves the list; production keeps the connector discovery of D75, which stays tested against the answers recorded from release 0.13.0 (`tck/README.md`, section "The recorded answers of phase P7"). The wallet stub writes no `DataService` entry into an identity document, so the connector discovery finds no connector in the local run (`tck/README.md`, section "The first run of phase P7", result 3). Three rules bound the list to the local test deployment: `loadConfig` refuses a `connectorUrl` whose host is not a name without a dot, `localhost` or a loopback address; `server/src/index.mjs` writes a line at the level `warn` at the start, `The receiver resolution uses the address list of a local test deployment.`; and the administrator guide of phase P8 states that a production deployment uses `discovery`. The owner decided the rule on 2026-11-19 with the option "Fixed address list, local only" (section "Three decisions after the first run across Tractus-X EDC 0.13.0 connectors (2026-11-19)", question 2).

**D82. HashiCorp Vault as a test-only image.** Each connector of release 0.13.0 keeps its keys in HashiCorp Vault 1.16.1, which the chart of the connector names, under the Business Source License 1.1, which is not on the licence list of §9.8. The local deployment pulls the image at test time and the repository never distributes the image; §9.8 lists the test images with their licences apart from the distributed packages, and `NOTICE.md` states the image and its licence. The owner decided the rule on 2026-11-19 with the option "Vault as a test-only image" (section "Three decisions after the first run across Tractus-X EDC 0.13.0 connectors (2026-11-19)", question 3).

**D83. One meaning of no_asset and contract_refused.** A Catena-X connector shows an offer whose access policy does not admit the consumer as an absent offer, so the connector transport reports such a receiver as `no_asset`, and reaches `contract_refused` only through a negotiation that ends as `TERMINATED` (`tck/README.md`, section "The first run of phase P7", result 2). The transport contract of §9.2.5 states the meaning of the connector for both implementations: `no_asset` when the sender sees no asset, and `contract_refused` when the sender sees the asset and the negotiation is refused. The memory transport of phase P5 changes: an asset that the access policy hides gives `no_asset`, and an offer whose usage policy holds another framework agreement or no usage purpose `cx.circular.dpp:1` gives `contract_refused`. One test code of `server/test/transportContract.test.mjs` asserts both outcomes against both implementations, so that each implementation replaces the other without a change of its callers. This specification rejects a contract test that reaches `contract_refused` by a different step per implementation, which hides the difference.

**D84. The connector binding on a started deployment.** The connector binding connects to a deployment that `docker compose up -d --wait` has started before the test kit runs, runs no docker command, restarts no server between the test files, and gives each test file data of its own; the kit runs three times, once per regime of the test files (§9.2.9, §15). A reader without a deployment reads through the participant's server with the data plane key, as in the in-process binding, because such a reader has no connector. The rules are chosen by this specification; the owner has not decided. Another choice gives the test kit a docker command line and restarts the servers per file, or adds a connector per reader without a deployment.

**D85. The error text of the provider data plane.** The provider data plane of Tractus-X EDC 0.13.0 answers every status of the server other than 200 with 500 and without the body of the server: the bodies `{"errors":["Received code transferring HTTP data: 405 - Method Not Allowed."]}` and `{"errors":[]}` were observed, with the data plane log `Failed to read data from source: NOT_FOUND` (`tck/README.md`, section "The second run of phase P7", result 1). The connector transport reads the first entry of `errors` with the regular expression `^Received code transferring HTTP data: ([1-5][0-9]{2})\b` and treats a named code of the class 4xx as the final outcome `receiver_refused` with that code, so that the sender stops at once and does not repeat a refused notification five times (§9.2.5). The memory transport is unchanged, and the proposal is unchanged; the descriptive error body of section 4.3 item 7 of the proposal does not reach the sender through this connector release, and the finding goes to the expert group. The owner decided the rule on 2026-11-19 with the option "Read the connector's error text" (section "Three decisions after the second run across Tractus-X EDC 0.13.0 connectors (2026-11-19)" of the owner's file of §12.1, question 1).

**D86. A test file waits only for its own notifications.** `settle()` waits only for the sent records of the passports that the calling test file names in its requests and in the answers it receives, and settles a record whose first attempt is made (§9.2.9). All test files share one deployment (D84), and in the second run one refused notification of `CAC-012.tck.mjs` failed `settle()` of every file of the default run. The owner decided the rule on 2026-11-19 with the option "Only for its own notifications" (section "Three decisions after the second run across Tractus-X EDC 0.13.0 connectors (2026-11-19)", question 2).

**D87. The delay checked against the record time.** `tck/CAC-009.tck.mjs` checks that the planned send time of a PassportEnded is at least 5 seconds after the time at which the sender recorded the PassportEnded, which `header.sentDateTime` of the stored message holds, and no longer against the planned send time of a waste notice planned a moment later, because the servers of the connector binding run on the real clock and a second request is planned some milliseconds after the first (`tck/README.md`, section "The second run of phase P7", result 3). The owner decided the rule on 2026-11-19 with the option "Against the record time" (section "Three decisions after the second run across Tractus-X EDC 0.13.0 connectors (2026-11-19)", question 3).

**D88. A data plane answer 500 without a code.** An answer 500 of a provider data plane whose list `errors` is empty or names no code gives `transport_failed`, so that the retry of D49 applies, because such an answer does not show whether the server refused the message or failed. The second run observed the empty list for the answer 404 of the server to an unknown operation, so a refused notification of that kind is repeated up to the limit of D49. The rule is chosen by this specification; the owner has not decided. Another choice treats the empty list as a final refusal, which stops the retry of a real failure of the receiver.

**D49. The retry of a failed transport.** The sender repeats a notification whose transport failed with the same `messageId`, up to `NOTIFICATION_MAX_ATTEMPTS` attempts, with a pause of `NOTIFICATION_RETRY_SECONDS` multiplied by the attempt count, and `EP-NOTIFICATION-RETRY` starts a further series (§9.2.5). The duty to send of sections 2.1.4, 2.1.5 and 2.1.7 of the proposal ends only when the receiver offers no asset or refuses the contract. This specification rejects the repetition of the whole event, which sends new messages to the receivers that already applied the step. The two default values are chosen by this specification; the owner has not decided. An answer of the receiver with a status from 500 to 599 is a failed transport, which the sender repeats in the same way (§9.2.5), because the text of `ERR-RX-INTERNAL` asks the sender to resend the notification later with the same `messageId`; an answer from 400 to 499 is final. An answer 500 of a provider data plane counts as a failed transport unless its error text names a code of the class 4xx (D85).

**D50. Every admitted form of an identifier accepted, one form sent.** The public schemas of `docs/api/schemas/`, the OpenAPI file and the schemas of `server/schemas/` accept every form of a `catenaXId` and of a message identifier that the stored shared model `io.catenax.shared.uuid` 2.1.0 admits: the pattern `(^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$)|(^urn:uuid:[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$)` `[live]`. The reference server normalises each such value at the boundary with `normaliseUuid` (§9.2.1): a route normalises the identifiers of a request before a service reads them, and a receiving endpoint normalises the validated message before the duplicate check. The server always sends and serves the lower-case form that starts with `urn:uuid:`, in the notifications, in the built payloads, in the operator answers and in the shell identifiers, and stores one form: the 36 characters in lower case in a column of the type `uuid`, and the normalised form in a text column and in a stored message. Two identifiers are equal when their normalised forms are equal, so a message that repeats a stored `messageId` in another form is a duplicate. The owner decided the rule on 2026-11-16 (point 4 of the section "Four decisions before phases P1 to P3, and the tools" of the owner's file of §12.1), and §5.7 holds the sentence proposed for Table 4.4 of the next draft of the proposal. The owner's decision rejects the narrower pattern of version 3, which refused a valid identifier of another implementation.

## 13. Notes for the implementer

### 13.1 What the implementer must not do

- The implementer must not change a requirement, a decision or an architecture record of `requirements/`, except the field `implementation` in phase P8.
- The implementer must not write a file outside §7. A file that the work needs and §7 does not list is a finding that the implementer reports.
- The implementer must not change a file that an annex prints. A defect of an annex file is a finding that the implementer reports with the line of the annex.
- The implementer must not name a path, a person, a host or a service of a private repository or deployment in any file. `node scripts/check-private-references.mjs` prints `0 private references` before every phase ends.
- The implementer must not write a secret, a token, a key or a password into a file. `tck/.env.example` holds placeholder values only, and no file holds a default password of a database role.
- The implementer must not replace a value marked "not verified against a stored text" by a guess. Phase P7 verifies each value of the connector, and a value that the implementer cannot verify is reported. The first part of phase P7 verified the six such values of the code of phases P4 and P5 (`tck/README.md`, section "The verification of phase P7"), and the implementer removes the six marks: `SUBMODEL_DCT_TYPE` of `server/src/connector/policyBuilder.mjs` changes to `cx-taxo:BatteryPass`, beside the new constant `SUBMODEL_DCT_VERSION` `1.0` (§10.5); the semantic identifier of IDTA-02035-3 in `ASPECTS` of `server/src/submodels/submodelService.mjs` and in `SEMANTIC_IDS` of `tck/lib/scenario.mjs` changes to the end `#CarbonFootprintBattery` (§10.6); and the identifiers of the models IDTA-02035-2, IDTA-02035-6, IDTA-02035-7 and SingleLevelBomAsBuilt keep their values. The implementer also adds the constant `FRAMEWORK_AGREEMENT` and the field `frameworkAgreement` of the offer contract (§9.2.5), removes the variable `BPN_DID_RESOLUTION_URL` from `server/src/config.mjs` and its test (§9.6), and copies `docs/api/aspects/` in `server/Dockerfile` (§7).
- The implementer must not write SQL in a route module or in a service module. A repository module and the modules of `server/src/db/` hold the SQL.
- The implementer must not read `process.env` outside `server/src/index.mjs` and the four command modules `migrateCli.mjs`, `createAppRoleCli.mjs`, `signTokenCli.mjs` and `server/test/support/database.mjs`, and must not create a pool or a client at module load. In the test kit, only `tck/lib/binding.mjs` reads `process.env`: the variable `TCK_BINDING` of §9.2.9 and, for the connector binding, the seven variables of the deployment that §9.2.9 names; §15 item 7 sets `TCK_ACCESS_REGIME` and `TCK_PASSPORT_SERVICE_PROVIDER_BPNL` to the values of `ACCESS_REGIME` and `PASSPORT_SERVICE_PROVIDER_BPNL` of the deployment.
- The implementer must not connect the server as the owner of the schema.
- The implementer must not send a notification before the transaction of its step has committed.
- The implementer must not write received battery information into a passport or into a payload of a passport.
- The implementer must not skip a test.
- The implementer must not add a table, a column, a trigger, a policy or a grant that §9.4 does not name.
- The implementer must not install a tool on the machine. The implementer must not download a tool or an image without the owner's approval, except the three images `node:24`, `eclipse-temurin:21` and `postgres:17`, the packages of §9.8 for phases P1 to P6, the Spectral command and the SAMM command line tool of §11.2 (decision D52, The tools in containers).
- The implementer must not change a migration file or a model version that an earlier phase delivered; a later change is a new migration file or a new model version.
- The implementer must not commit and must not push without the owner's order.

### 13.2 What the implementer must do

- The implementer must read the statement of each requirement of a phase in the registry before the implementer writes the code of the phase, and must put the identifier of each implemented requirement in the header comment of its module.
- The implementer must write each test before or with its module, and must name the requirement or the criterion in the test title.
- The implementer must run the done-when signal of a phase before the next phase starts, and must report each finding with its file and its line at the end of the phase.
- The implementer of phases P4, P5, P6 and P8 must follow the text literally: a name, a signature, a status, a refusal id and a path of this specification are used as written. The implementer must build a behaviour that carries the tag `[waits for the owner]` exactly as the text states the behaviour, and must not wait for the decision. The implementer must stop and report when a sentence leaves two readings, and must not choose one.

## 14. Tests

### 14.1 How the tests run

- The script `test` of `server/package.json` is `node --test --test-reporter=tap --test-concurrency=1 "test/**/*.test.mjs"`, so that the test files run one after the other and the summary has the form of §11.0. The further scripts are `migrate` (`node src/db/migrateCli.mjs`), `create-role` (`node src/db/createAppRoleCli.mjs`), `sign-token` (`node src/access/signTokenCli.mjs`) and `start` (`node src/index.mjs`).
- The script `test` of `tck/package.json` is `node --test --test-reporter=tap --test-concurrency=1 "*.tck.mjs"`.
- The server tests and the in-process binding read `TEST_DATABASE_URL` and `TEST_APP_ROLE_PASSWORD` (§11.0). The test kit reads the same two variables.
- `server/test/support/database.mjs` exports `createTestDatabase(label)`. The function connects with `TEST_DATABASE_URL`, stops with the message of §11.3 when the role of the connection is neither a superuser nor a role with `BYPASSRLS`, calls `createAppRole` with `TEST_APP_ROLE_PASSWORD`, builds the schema name `t_<label>_<process id>_<counter>` from `label` in lower case with every character outside `a` to `z` and `0` to `9` replaced by `_` and cut to 30 characters, calls `migrate` for that schema, and returns `{ schema, adminClient, appPool, drop() }`. `adminClient` is a client of the superuser with the search path of the schema and the time zone UTC. `appPool` is a pool of `createPool` whose connection string is `TEST_DATABASE_URL` with the user `refserver_app` and the password `TEST_APP_ROLE_PASSWORD`. `drop()` ends the pool and runs `DROP SCHEMA <schema> CASCADE`. Each server test file calls the function once with its file name as the label and calls `drop()` in its `after` hook. The in-process binding calls the function three times per test file, with the labels `tck<nnn>_provider`, `tck<nnn>_operator` and `tck<nnn>_recycler`, where `<nnn>` is the number of the criterion.
- **The recorded choices of phases P1 to P3.** The implementer of phases P1 to P3 chose these facts where this specification left a choice, and a later phase keeps them. `server/package.json` holds no field `version`, the field `description`, the field `license` with the value `Apache-2.0`, and the version ranges `^5.0.0` for `express`, `^8.0.0` for `pg`, `^8.0.0` for `ajv`, `^3.0.0` for `ajv-formats`, `^1.0.0` for `ajv-draft-04` and `^2.0.0` for `yaml`; `tck/package.json` of phase P6 takes the same ranges for the packages that both files name. `server/test/support/database.mjs` exports three functions: `createTestDatabase(label)`, `connectAdminClient(schema)`, which returns a connected client of the superuser with the search path of the schema and the time zone UTC and which the caller ends, and `appConnectionString()`, which returns `TEST_DATABASE_URL` with the user `refserver_app` and the password `TEST_APP_ROLE_PASSWORD`; the pool `appPool` has the size 4. `migrate` returns the list of the applied file names (§9.2.8). `scripts/check-dependency-licenses.mjs` exports the constant `ADMITTED_LICENCES`, the frozen list of the admitted licence identifiers, beside `listLockedPackages` and `licencePasses`. The workflows name each action by its commit hash (§9.7).
- A statement of a database rule test runs through `adminClient` (the superuser, which bypasses the policies and for which the triggers and the constraints still fire) or through `appPool` inside `withTransaction` (the role `refserver_app` with the settings `app.acting_bpnl` and `app.today`), as the table of §14.2 states for each group of statements.
- No test goes red intentionally, because the repository holds no earlier test `[live]`.


### 14.2 Server tests

| File | Phase | What the file asserts |
|---|---|---|
| `server/test/contractSchemas.test.mjs` | P1 | the eight schemas compile in the 2020-12 dialect in strict mode with the formats of `ajv-formats`; every property of the eight schema files, at every depth, carries a description; for each operation, one valid message validates against the envelope definition of the operation and against `LifecycleNotification.schema.json`; for each operation these messages fail: a message with a third top-level property, a message without `content`, a message without `header`, a message with the context of another operation, a message without each required property of the header and of the content, a message with a further content property, a Business Partner Number of 11 characters, an identifier of 35 characters, a `sentDateTime` without a time zone, a `sentDateTime` with a space in place of the letter T, a content date without a time zone, a content date with a space in place of the letter T, and the text `tomorrow` as a date; a `sentDateTime` with the offset `+02:00` validates; an identifier validates in each of the four forms (with and without the prefix `urn:uuid:`, in upper and in lower case); a passport identifier of 300 characters validates; `ErrorResponse.schema.json` refuses a further property in the response, in `error` and in an item of `messages`; `docs/api/openAPI.yaml` parses, holds exactly four paths, each with one `post` operation whose `operationId` equals the path name and whose request body references the envelope definition of the operation, each operation holds the ten responses of §10.1, the server variable has its default, and the file holds no security scheme |
| `server/test/modelExamples.test.mjs` | P2 | every compiler of the test is the result of `createAspectSchemaCompiler()`; each of the three generated schemas of `docs/api/aspects/` compiles; each of the three example files of `docs/api/aspects/` validates against its generated schema; an access map with the text `18 February 2027` as `validFrom`, an access map with an unknown access group, an access map without `entries` and a lifecycle payload with a Business Partner Number of 5 characters fail; each stored schema file `*-schema.json` below `sources/IDTA/` compiles; a compiler of `ajv-draft-04` in strict mode without the two keywords of `SAMM_SCHEMA_KEYWORDS` throws for a generated schema; the two example payloads of the proposal equal the example files of the lifecycle model and of the access map model, where the test reads the proposal file, takes the first fenced block of the language `json` after the heading "#### 3.2.2 PROPERTIES" and the first such block after the heading "#### 3.4.2 PROPERTIES", and compares the parsed values; the example file of the successors model equals the block of §21 |
| `server/test/databaseRules.integration.test.mjs` | P3 | The file holds nine top-level tests, named `(a) catalogue` to `(i) isolation levels`, each with one sub-test per case. (a) Through `adminClient`: a second run of `migrate` applies no file; after the four migration files, the 18 tables (the 17 tables of `001_schema.sql` and `audit_outbox`), the 17 functions, the 38 triggers, the 12 policies, the four domain constraints `bpnl_check`, `bpns_check`, `finite_timestamptz_check` and `finite_date_check` and every named constraint of §9.4.1 exist by their names in the catalogue (`pg_tables`, `pg_proc`, `pg_trigger`, `pg_policies`, `pg_constraint`, `pg_indexes`); no column of the 18 tables has the type `timestamptz` or `date` without a domain, where the table `schema_migrations` of the runner is excluded: `migrate` creates that table before the first migration file, so the domains do not exist then, and the column `applied_at` holds only the value of `now()`; `pg_proc.proconfig` of every function of the schema, counted by the catalogue and not by a fixed number, holds the value `search_path=<schema>, pg_temp`; the source `pg_proc.prosrc` of every function of the schema that returns `trigger` holds the text `PERFORM require_read_committed();`; after `CREATE OR REPLACE FUNCTION refuse_change()` with the body of §22, in a transaction that the test rolls back, the query of the search path finds one function; `has_database_privilege('refserver_app', current_database(), 'TEMPORARY')` is false, and `has_schema_privilege('refserver_app', <schema>, 'CREATE')` is false for the schema of the test and for `public`; `pg_db_role_setting` holds no row of the role; the column privileges of the role in `information_schema.column_privileges` with the privilege type `UPDATE` equal the table of §9.4.3 and the column privileges of `audit_outbox` of §9.4.4, and `information_schema.table_privileges` holds no row of the role with the privilege type `UPDATE`, `DELETE` or `TRUNCATE`. (b) Through `adminClient`, one accepted and one refused statement for each constraint whose refusal a statement can reach: each CHECK constraint fails with the SQLSTATE `23514` and its constraint name, where the value `NaN` fails each of the four constraints of the numeric columns, an empty passport identifier and a passport identifier of 201 characters fail `passports_passport_identifier_check`, and a passport identifier of 200 characters of two bytes each succeeds; a domain fails with `23514` and the constraint name `bpnl_check`, `bpns_check`, `finite_timestamptz_check` or `finite_date_check`, where the test inserts `infinity` and `-infinity` into one column of each of the two types; each UNIQUE constraint and each unique index fails with `23505` and its name; a NOT NULL column fails with `23502` and the name of the column, because PostgreSQL reports no constraint name for that refusal; each foreign key fails with `23503` and its name, where `passports_battery_model_fkey` fails in the same way for a battery model of another manufacturer and for an unknown battery model. Three constraints are proven by the catalogue of group (a), and the test asserts for each the refusal that a statement of one session reaches first: `passport_lineage_links_passport_fkey` (an insert of a link for an unknown passport fails with `ERR-DB-LINEAGE` of `trg_passport_lineage_links_insert`), `battery_models_id_manufacturer_key` (an insert of a battery model with a stored `id` fails with `23505` on `battery_models_pkey`), and `passport_responsibility_intervals_open_key` (an insert of a second open interval fails with `ERR-DB-RESPONSIBILITY` of `trg_interval_change`); group (g) reaches the third constraint with two sessions. (c) Through `adminClient`, the statements of the 38 triggers, where a refused statement fails with the SQLSTATE `P0001` and the message of §22. Twenty triggers have one accepted and one refused statement each, `trg_audit_outbox_change` of §9.4.4 among them. Each of the nine triggers of `refuse_passport_id_change()` refuses an update that sets `passport_id` to the id of another passport with `ERR-DB-APPEND-ONLY` and the sentence "A record never moves to another passport.", where the test moves an aspect payload out of an ended passport, an aspect payload out of a waste passport without an authorisation, an access record, an issuer contract and one record of each of the six other tables (`passport_purposes`, `passport_lineage_links`, `passport_successor_links`, `passport_repair_entries`, `passport_responsibility_intervals` and `passport_write_decisions`); on `passport_aspect_payloads`, `passport_responsibility_intervals`, `passport_access_records` and `issuer_contracts` an update of another column succeeds, and on the five append-only tables an update of another column fails with the sentence of `refuse_change()`. `trg_passport_insert` raises no refusal: the test asserts the value of `lineage_open` after an insertion with each of the five statuses, and an insertion of a `re-used` passport with `lineage_open = false` in the statement returns true. The eight triggers that refuse every row of their events (`trg_battery_model_identity` and the seven triggers with the suffix `_append_only`) have the refused update and the refused deletion, and their accepted statement is the insertion, on which the trigger does not fire. The cases include an update of `manufacturer_bpnl` by the superuser, a deletion of a passport, a passport inserted without a responsibility interval (refused at the commit with `ERR-DB-RESPONSIBILITY`), a recycling date before the waste date (`23514`, `passports_end_after_waste_check`), a recycling date before the start of the open interval (`ERR-DB-END-DATE`), an interval change of an ended passport (`ERR-DB-PASSPORT-ENDED`), the three end columns set by one update on a passport of each of the five statuses, and a change of an ended waste passport without an authorisation, which fails with `ERR-DB-PASSPORT-ENDED`. The lineage cases: a new passport with its link and the closing update commits, also when the three statements run under a savepoint; a new passport without the closing update fails at the commit; a new passport whose two links hold two operation dates fails at the commit; a new passport with one missing performance value, its link and its interval fails at the closing update with the sentence of `trg_passport_identity` ("A new passport keeps ..."), and the same statements without the closing update fail at the commit with the sentence of `check_passport_lineage()` ("A new passport has a lineage link ..."); a new passport without a link and with the closing update fails at the commit with the same sentence of `check_passport_lineage()`; a passport inserted with the status `waste` and with its two intervals fails at the commit with the sentence "A passport is never inserted with the status waste."; for the sentence "A passport that is inserted with the status original has no lineage link.", which no statement reaches, the test asserts that the sentence is a part of `pg_proc.prosrc` of `check_passport_lineage` and that a link for a passport inserted with the status `original` in the same transaction fails with the sentence of `trg_passport_lineage_links_insert`; a transaction that first updates a first passport of an earlier transaction and then inserts a link for that passport fails with `ERR-DB-LINEAGE`; a link for a closed new passport of an earlier transaction fails; an update of `lineage_open` from false to true fails; an update that sets one of the five values of a new passport to null fails with `ERR-DB-LINEAGE`, an update that replaces a value succeeds, and an update that sets `date_into_service` of a first passport to null succeeds. The timeline cases: a first interval that starts at another instant than the date of manufacture at 00:00:00 UTC, a first interval of another company and a first interval with the role `producer` each fail at the commit with `ERR-DB-RESPONSIBILITY`; the first interval of a new passport that starts at another instant than the operation date of its links fails in the same way; an inserted interval with an end, a second open interval, an interval that starts before the end of the closed interval and an interval that starts after the end of the closed interval each fail with `ERR-DB-RESPONSIBILITY`; a second interval on a passport that is not waste fails at the commit with `ERR-DB-RESPONSIBILITY`; the waste step in the order of §10.4 commits, also with a waste date equal to the start of the first interval; the status `waste` with the successor's interval that names another company or another role fails at the commit with `ERR-DB-WASTE-SUCCESSOR`; an update of a closed interval fails with `ERR-DB-APPEND-ONLY`. The cases of the named successor: on a waste passport with an authorisation in force, an update of `waste_successor_bpnl`, of `waste_successor_role` and of `waste_date` each fail with `ERR-DB-WASTE-SUCCESSOR`. The cases of the records of a waste passport without an authorisation: an update and an insertion of an aspect payload, an insertion of a purpose, of a repair entry and of a successor link, and a deletion of a lineage link each fail with `ERR-DB-SUCCESSOR-AUTHORISATION`; an insertion of an access record succeeds; the same statements succeed under an authorisation in force, except the deletion, which then fails with `ERR-DB-APPEND-ONLY`. The cases of the purposes: an update and a deletion of a purpose record of a passport that is not waste fail with `ERR-DB-APPEND-ONLY`. The table of §9.4.2 on the first refusal for a record of an ended passport: one sub-test per cell. The three cases of the temporary table, where the superuser of `adminClient` creates the table: a transaction that creates the temporary table `passports` with one row that names a closed first passport with `lineage_open` true and then inserts a lineage link for that passport fails with `ERR-DB-LINEAGE`; a transaction that creates the same temporary table with a row that names an ended passport without a recycling date and then inserts an aspect payload of that passport fails with `ERR-DB-PASSPORT-ENDED`; a transaction that creates the temporary table `passport_responsibility_intervals` with one open interval of a new passport identifier and then inserts that passport without an interval fails at the commit with `ERR-DB-RESPONSIBILITY`. (d) Through `adminClient` with the setting `app.today`: an update of a waste passport is refused without an authorisation, refused on the day before `valid_from`, admitted on the day of `valid_from`, admitted on the day of `valid_to`, refused on the day after `valid_to`, refused when the setting is absent, and refused with `ERR-DB-SUCCESSOR-AUTHORISATION` on a connection whose earlier transaction set the setting, where the setting is the empty text. With each of the settings `today`, `epoch`, `infinity`, `garbage`, `2026-13-45`, `2026-00-10`, `2026-01-00`, `0000-01-01` and `2026-02-29`, an update of the waste passport and an update of an aspect payload of the waste passport fail with the SQLSTATE `22007` and `ERR-DB-TODAY`; `SELECT app_today()` returns the date for the settings `0001-01-01`, `9999-12-31` and `2024-02-29`, and returns the fourth of March for the setting `2026-03-04` in a session with `DateStyle = 'SQL, DMY'`; with the setting `garbage`, an update of a passport that is not waste succeeds, and an update of an ended passport fails with `ERR-DB-PASSPORT-ENDED`. (e) Through `appPool`, per table with a policy. For `passports`, `passport_aspect_payloads`, `passport_responsibility_intervals` and `passport_access_records`: with `app.acting_bpnl` equal to the Business Partner Number of the passport, a SELECT returns the row and an INSERT and an UPDATE of a column of §9.4.3 succeed; with another Business Partner Number, and without the setting, a SELECT returns 0 rows, an UPDATE changes 0 rows, and an INSERT fails with `42501`. For `battery_models`, `passport_purposes`, `passport_successor_links` and `passport_repair_entries`: a SELECT and an INSERT behave in the same way, and an UPDATE fails with `42501` for every company, because the role holds no UPDATE privilege on the table. For `passport_lineage_links`: the accepted INSERT runs in the transaction that inserts the passport; an INSERT with another Business Partner Number or without the setting fails with `P0001` and `ERR-DB-LINEAGE`, because the trigger does not see the passport; an UPDATE fails with `42501`. For `access_map_versions` and `access_map_entries`: an INSERT for a battery model of the acting company succeeds, with the version and the entry in two statements; an INSERT for a battery model of another company and an INSERT for an unknown battery model both fail with `42501`; another company reads 0 rows. For `issuer_contracts`: an INSERT with a passport of the acting company and an INSERT without a passport succeed; an INSERT with a passport of another company and an INSERT with an unknown passport both fail with `42501`. An INSERT of a passport on a battery model of another company fails with `23503` on `passports_battery_model_fkey`. An INSERT of a battery model with the `id` of a battery model of another company fails with `23505` on `battery_models_pkey`. (f) Through `appPool`: a `DELETE` on each of the 18 tables fails with `42501`; the cases of §9.4.4 on `audit_outbox` (the accepted update of the four columns of an unwritten row, and each stated refusal) hold; a SELECT on `schema_migrations` returns the three names, and an INSERT into `schema_migrations` fails with `42501`; `CREATE TEMP TABLE passports (id uuid)` fails with `42501`; for each of the seven tables of §9.4.3, an UPDATE of each column of the table succeeds, and an UPDATE of one column outside the table fails with `42501` (`message_id` of `notifications_sent`, `recipient_bpnl` of `passport_access_records`, `date_of_manufacture` of `passports`, `aspect_key` of `passport_aspect_payloads`, `issuer_bpnl` of `issuer_contracts`, `bpnl` of `companies`, `responsible_bpnl` of `passport_responsibility_intervals`); `LOCK TABLE passports IN ACCESS EXCLUSIVE MODE` and `LOCK TABLE notifications_sent IN SHARE ROW EXCLUSIVE MODE` fail with `42501`, and `LOCK TABLE passports IN ROW EXCLUSIVE MODE` succeeds; an insertion into `passport_write_decisions` with `OVERRIDING SYSTEM VALUE` and the next value of the identity succeeds in a transaction that the test rolls back, which records the accepted residual effect of D24 (Two database roles and row-level security). (g) Two overlapping transactions on two clients at READ COMMITTED: the first sets the end columns of a passport and waits; the second inserts an aspect payload of the passport, blocks until the first commits, and then fails with `ERR-DB-PASSPORT-ENDED`. The first runs the waste step of a passport and waits; the second inserts an aspect payload of the passport, blocks, and then fails with `ERR-DB-SUCCESSOR-AUTHORISATION`. Two clients run the waste step of one passport with two successors; the second blocks and then fails with `ERR-DB-SUCCESSOR-AUTHORISATION`. Two clients of `adminClient` reach the unique index of the open interval: the first inserts a passport with a chosen `id` and its first interval and waits; the second inserts an open interval for the same `id`, blocks, and then fails with `23505` on `passport_responsibility_intervals_open_key`. Two workers claim two rows of `notifications_sent` with `FOR UPDATE SKIP LOCKED`, and two clients that insert one `message_id` into `notifications_received` with `ON CONFLICT DO NOTHING` store one row. (h) The test file sets `process.env.TZ = "Pacific/Kiritimati"` in its first statement, before the first `Date` of the process: a column of the type `date` is read as the stored text `YYYY-MM-DD`, a `numeric` column and a `bigint` column are read as numbers, and a `timestamptz` value is written and read as the same instant, although the columns are of the two domains. (i) The isolation levels, through `appPool` and through `adminClient`: in a transaction that starts with `BEGIN ISOLATION LEVEL REPEATABLE READ`, and in a transaction that starts with `BEGIN ISOLATION LEVEL SERIALIZABLE`, an insertion of an aspect payload, an update of the status of a passport, an insertion of a passport and an insertion of a responsibility interval each fail with `ERR-DB-ISOLATION`, and a SELECT succeeds; two races run at the three levels: a first client takes its snapshot of a passport at the level under test and waits, a second client at READ COMMITTED runs the waste step of the passport and commits, and the first client then inserts an aspect payload of the passport (first race) or sets the three end columns with a recycling date before the waste date (second race); at READ COMMITTED the first client receives `ERR-DB-SUCCESSOR-AUTHORISATION` in the first race and `23514` on `passports_end_after_waste_check` in the second race, and at the two other levels the first client receives `ERR-DB-ISOLATION` in the first race and the serialisation failure of PostgreSQL with the SQLSTATE `40001` in the second race, because the first client there updates a row that the second client changed, and PostgreSQL refuses that update before a trigger fires; a client of `withTransaction` on a connection of a role with the stored setting `default_transaction_isolation = serializable`, which `adminClient` sets and removes around the case, reports the level `read committed`, once for a setting stored with `ALTER ROLE refserver_app SET` and once for a setting stored with `ALTER ROLE refserver_app IN DATABASE <the test database> SET`. The cases of the stored settings, each in a `try` block whose `finally` block runs `createAppRole`, so that no setting outlasts the case: after `adminClient` stores `statement_timeout = '60s'` for every database and `default_transaction_isolation = 'repeatable read'` for the test database, `createAppRole` leaves no row of the role in `pg_db_role_setting`; after `adminClient` stores only the setting for the test database, `ALTER ROLE refserver_app RESET ALL` alone leaves one row, which records the behaviour of PostgreSQL 17 that the function answers; while the setting for the test database exists, `migrate` for a new schema rejects with a message that holds `ERR-DB-ROLE-PRIVILEGE` and `npm run create-role`, and `schema_migrations` of that schema holds the names of the first two files only; after `createAppRole` the same call of `migrate` applies the third and the fourth file and returns `["003_policies.sql", "004_audit_outbox.sql"]`; the role stores a setting for the test database through `appPool` with success, and `createAppRole` removes that row as well |
| `server/test/dependencyLicenses.test.mjs` | P3 | The test builds its fixture at run time in a directory of `os.tmpdir()` (a `package-lock.json` with two packages, the two `package.json` files of the packages, and one nested `package.json` without a licence below the first package) and removes the directory in its `after` hook, because git ignores every folder `node_modules`. `listLockedPackages` returns the two keys of the lock file and not the nested file; `licencePasses` for a listed licence, for an unlisted licence, for an `OR` expression with one listed alternative, for an `AND` expression with one unlisted part, for a missing field and for a value that is not a string. The script runs its command part only when the script is the entry module of the process (`import.meta.url` equals the file address of `process.argv[1]`), so the import of the test starts no check |
| `server/test/config.test.mjs` | P4 | The test builds each input from one complete object of valid values with `BINDING=memory`, `fixtureEnv()`, and changes one variable or more per case. For each of the 31 variables of the table of §9.6: one accepted value gives the property of the configuration object of §9.6 with its type (a number for each integer, a list for `NOTIFICATION_ALLOWED_BPNLS`, an object for `OWN_ADDRESS`, a lower-case text for each header name); and for each variable whose row states a rule, one value that fails the rule throws a `ConfigError` whose `variables` hold the name of the variable and whose message holds the name (the values: `BPNL0000000TCK1` of 15 characters for `OWN_BPNL` and `PASSPORT_SERVICE_PROVIDER_BPNL`, a legal name of 301 characters, `EN` for the language, `[]` and the text `street` for `OWN_ADDRESS`, an address object without a required property of AddressInformation, an operator identifier of 201 characters, the scheme `mysql:` for `DATABASE_URL`, `Public` for `DATABASE_SCHEMA`, `3`, `101` and `4.5` for `DATABASE_POOL_SIZE`, `0` and `65536` for `PORT`, `ftp://x` and `relative/path` for an address, `file` for `BINDING`, a key of 31 characters for each of the three keys, `x api key` for a header name, `during-act` for `ACCESS_REGIME`, `-1` and `86401` for the delay, `9` for the pause of the worker, `0` and `21` for the attempts, `0` for the retry base, `[]`, `{}` and `["BPNL1"]` for `NOTIFICATION_ALLOWED_BPNLS`, `trace` for `LOG_LEVEL`). A missing required variable is named with `is missing`. One input with three missing variables and two malformed values throws one `ConfigError` whose `variables` hold the five names in the order of §9.6. With `BINDING=connector`, each of the five variables of the connector that is absent is named, and the three variables without a default are `null` under `BINDING=memory`. The variable `BPN_DID_RESOLUTION_URL` gives no property. Every default of §9.6 is applied when its variable is absent, and when its variable holds the empty text. The message of every thrown error holds no value of the input: the test searches the message for each key, password and connection string of the input. The returned object, `ownAddress` and `notificationAllowedBpnls` are frozen (`Object.isFrozen` is true, and an assignment to a property throws a `TypeError` in the strict mode of a module). `loadConfig` reads only its argument: the test sets `process.env.OWN_BPNL` to another valid value before the call and restores the variable after the call, and the property holds the value of the argument. Two calls with equal inputs return objects that `assert.deepStrictEqual` finds equal. A variable outside the table, `UNKNOWN_SETTING`, gives no property: the keys of the object equal the 31 properties of §9.6; `RECEIVER_ADDRESS_LIST` with an entry whose host holds a dot, with an entry without `did`, and absent under `RECEIVER_RESOLUTION=address-list` are each named in the error |
| `server/test/logger.test.mjs` | P4 | The test passes a recording stream (an object whose `write` stores each text in a list) and a fixed clock whose `now()` returns `2031-05-04T08:13:33.007Z`. Each call writes one text that ends with one newline character and holds no other newline character, and `JSON.parse` of the text without the newline returns one object. The first six keys of the object are `time`, `level`, `message`, `traceId`, `route` and `actingBpnl` in this order; `time` equals `2031-05-04T08:13:33.007Z`; `traceId`, `route` and `actingBpnl` are `null` for a call without the three fields and hold the values of a call with the three fields; the further fields of the call follow in their order; a call field named `time`, `level` or `message` does not replace the field of the logger; an `Error` is written as the object with `name` and `errorMessage`; a circular object gives the text `[circular]` and no exception. For each of the 33 names of `REDACTED_FIELDS`, and for the two names of `redactedFieldNames` (`x-dp-key` and `x-mgmt-key` in the case), a field of that name is written with the value `[redacted]` at the first level, in an object at the third level and in an object inside a list, each in the written form, in upper case, and in one form with `-` or `_` between the parts of the name (`X-Api-Key`, `api_key`, `Set-Cookie`, `DATABASE_URL`); the key stays in the line. A secret text `s3cr3t-<case number>` passed as the value of `token`, of `dataPlaneKey`, of `authorization`, of `payload` and of `headers` (a header map that holds the secret under `x-api-key`) does not occur in the raw text of the line: the test searches the text written to the stream, not the parsed object. A field whose name is not in the list, `passportIdentifier`, keeps its value. The argument `fields` of a call is deeply equal before and after the call. For each of the four configured levels, the test calls the four methods and asserts the written levels of §9.2.1 (1, 2, 3 and 4 lines). `createLogger` with the level `trace`, with a stream without `write` and with a clock without `now` each throw a `TypeError` whose message names the parameter. `LOG_LEVELS` equals `["error", "warn", "info", "debug"]`, and `REDACTED_FIELDS` and `LOG_LEVELS` are frozen |
| `server/test/identifiers.test.mjs` | P4 | `BPNL_PATTERN` accepts `BPNL00000000TCK1` and refuses `BPNL0000000TCK1` (15 characters), `BPNL000000000TCK1` (17 characters), `bpnl00000000TCK1` (a lower-case prefix, which the stored pattern refuses), `BPNL00000000TCK-` (a character outside the class) and `BPNS00000000TCK1`; `BPNS_PATTERN` accepts `BPNS00000000TCK1` and refuses the same four forms with the prefix `BPNS` and the value `BPNL00000000TCK1`. The test reads `sources/Tractus-X/semantic-models/io.catenax.shared.business_partner_number/2.0.0/BusinessPartnerNumber.ttl` and `sources/Tractus-X/semantic-models/io.catenax.shared.uuid/2.1.0/Uuid.ttl`, takes the text of `samm:value` of the constraints `:BpnlRegularExpression` and `:BpnsRegularExpression` of the first file and of the one regular expression constraint of the second file, and asserts that `BPNL_PATTERN.source`, `BPNS_PATTERN.source` and `UUID_PATTERN.source` equal the stored texts, and that the three constants have no flag. The four admitted forms of one UUID (`9a2b8f61-3c5d-4e7a-8b1f-2d6c4a0e9f33`, the same in upper case, the first with the prefix `urn:uuid:`, and the second with the prefix) each give `urn:uuid:9a2b8f61-3c5d-4e7a-8b1f-2d6c4a0e9f33` with `normaliseUuid` and `9a2b8f61-3c5d-4e7a-8b1f-2d6c4a0e9f33` with `toUuidColumn`. Each of the values `9a2b8f61-3c5d-4e7a-8b1f-2d6c4a0e9f3` (35 characters), `URN:UUID:9a2b8f61-3c5d-4e7a-8b1f-2d6c4a0e9f33` (a prefix in upper case), `urn:uuid:9a2b8f61-3c5d-4e7a-8b1f-2d6c4a0e9f33 ` (a trailing space), `9a2b8f613c5d4e7a8b1f2d6c4a0e9f33` (no hyphens), `ga2b8f61-3c5d-4e7a-8b1f-2d6c4a0e9f33` (a character outside the class), the empty text, `null`, `undefined` and the number 42 makes both functions throw an `IdentifierFormatError`, which is an instance of `TypeError`, whose `path` is the empty text and whose message does not contain the value. `normaliseMessage` of one message of each of the four operations, with every identifier field in the upper-case form without the prefix, returns a message in which `header.messageId`, `header.relatedMessageId` (when present) and `content.catenaXId`, `content.repairCertificateCatenaXId` or `content.materialRecyclingCertificateCatenaXId` hold the normalised form; a message with a content property `predecessors`, a list of two objects each with `catenaXId` and `originalModelCatenaXId`, has the four values normalised; every other field (`sentDateTime`, `senderBpn`, `passportIdentifier`, `operation`, the dates) is equal before and after; an absent `relatedMessageId` stays absent; the argument is deeply equal before and after the call (`structuredClone` before the call and `assert.deepStrictEqual` after); a message whose `header.messageId`, `header.relatedMessageId`, `content.catenaXId` or `content.predecessors[1].catenaXId` is outside the pattern throws an `IdentifierFormatError` whose `path` is `/header/messageId`, `/header/relatedMessageId`, `/content/catenaXId` or `/content/predecessors/1/catenaXId` |
| `server/test/operatorToken.test.mjs` | P4 | a signed token verifies; a changed signature, an expired token, a token without `exp`, a token whose lifetime is above 3600 seconds, a token with another `alg`, a token of another Business Partner Number and a `sub` outside its pattern are refused; a token whose `iat` lies 61 seconds after the current time and whose `exp` is `iat` plus 3600 seconds is refused, and a token whose `iat` lies 59 seconds after the current time is accepted (decision D72 [waits for the owner], The clock tolerance of an operator token) |
| `server/test/policy.test.mjs` | P4 | the capabilities of an operator subject and of a partner subject; an unknown subject kind receives none; `requireCapability` throws for a string outside `CAPABILITIES` |
| `server/test/lifecycleCatalogue.test.mjs` | P4 | the four contexts of §10.1; the admission rule of D40 (The admission rule) for each pair of status and purpose, with the normalisation of §9.2.2; the five status values equal the values of the stored enumeration file |
| `server/test/refusals.test.mjs` | P4 | every refusal of §9.5 has its status and a text of four sentences; the body validates against `ErrorResponse.schema.json`; each line of the database error mapping of §9.5 gives its refusal |
| `server/test/jsonPathSubset.test.mjs` | P4 | each selector of D27 (A subset of JSONPath) on the fixtures; a path outside the subset is refused |
| `server/test/governedElements.test.mjs` | P4 | each path of §10.6 receives the value of the passport record; `$.ManufacturerName` is the list with one object of D51 (The form of a manufacturer name item) [waits for the owner]; a stored value at a governed path is replaced; a null governed value removes the element; each of the four fixtures validates against its stored schema after the governed elements are written |
| `server/test/messageHeader.test.mjs` | P4 | the header validates against `MessageHeader.schema.json`; two headers have different `messageId` values |
| `server/test/notificationPlan.test.mjs` | P4 | the receivers of §10.3 for each operation; one entry per pair of receiver and passport; no entry for the own Business Partner Number; the further receiver of D34 (The passport service provider as a receiver) [waits for the owner] |
| `server/test/policyBuilder.test.mjs` | P4 | each offer of §10.5 carries `cx.circular.dpp:1` and its list of Business Partner Numbers; an empty list builds an offer whose access policy admits nobody, so the asset stays registered (§9.2.5); `NOTIFICATION_ALLOWED_BPNLS` limits the notification asset; each submodel offer carries `cx-taxo:BatteryPass` and the version `1.0`, and each usage policy holds `FrameworkAgreement` with `FRAMEWORK_AGREEMENT` and `UsagePurpose` in one `and` conjunction |
| `server/test/shellDescriptor.test.mjs` | P4 | the fields of §9.2.6 for both shells; the id of a submodel descriptor is stable and has the form of a version 4 UUID |
| `server/test/twinRegistryContract.test.mjs` | P4 | one test code for `put` and `read` against the memory registry, and from phase P7 also against the registry client with a stubbed `fetch` |
| `server/test/lifecycleService.integration.test.mjs` | P4 | each function of §9.2.2: the stored records after each step; the six rules of `issueNewPassport` with their refusals; the local received record of D12 (No notification to the own company); the rule after the waste status with the period of D18 (The successor's authorisation with its period) and with the audit entry of a replaced authorisation; the rule after the end, which precedes the rule after the waste status; a request with one predecessor named twice; that no step writes a predecessor passport; the audit entries of each function; the rule of the dates: a new passport, a repair, a waste step and an end whose date is one day after the current UTC date of the test clock are refused, and the same steps with a date on the current UTC date are applied |
| `server/test/audit.integration.test.mjs` | P4 | one record of `passport_write_decisions` per granted and per refused write decision, with the fields of §9.2.7; the record of a refused write exists after the rollback; `AUDIT_ACTIONS` holds the twelve actions of §9.2.7; with `adminClient` revoking the privilege INSERT on `passport_write_decisions` from `refserver_app` around the case (and granting the privilege again in a `finally` block): `record` resolves to `{ written: false, queued: true }`, writes one log line at the level `error`, and stores one row of `audit_outbox` with the entries and the time of the decision; `writeQueued` with the privilege still revoked writes `attempts` 1, `last_error` `sqlstate 42501` and the next attempt after `retrySeconds`, and a second call in the same second writes nothing; after the grant and after the next attempt, `writeQueued` writes the record with the time of the decision and sets `written_at`, and a further call writes nothing; with the privilege INSERT revoked on both tables, `record` resolves to `{ written: false, queued: false }` and writes the log line of a lost record |
| `server/test/offerPublisher.integration.test.mjs` | P4 | the offers after each step, the lifecycle asset with an empty access list after a new passport included; the withdrawal of D33 (The offers of an ended passport) [waits for the owner]; the result of `refreshPassportExposure` after a failing registry; a refresh of an ended passport withdraws the ten dataset offers and keeps the two lifecycle offers, also when an offer is already withdrawn; the field `cause` of a failed refresh holds one of the four fixed texts of §9.2.5 and no text of the caught error |
| `server/test/lifecycleNotificationRoutes.integration.test.mjs` | P5 | through `EP-RX-NEW-PASSPORT`, `EP-RX-REPAIRED`, `EP-RX-WASTE` and `EP-RX-ENDED`: each check and each step of §10.4 with its status, its refusal id and its stored records; the outcome `duplicate` for a repeated message with a new `sentDateTime` and for a repeated `messageId` in another admitted form; `ERR-RX-MESSAGE-ID-REUSED`; two concurrent copies of one message apply one step; a BatteryBecameWaste whose date is before the start of the open interval; a body that is not JSON and a body above one megabyte; `ERR-RX-CHANGE-OUTSIDE-STEP` for a further content property; PassportEnded on a passport that is not waste; the method rule; that the acting Business Partner Number of the transaction is the own one; for each of the four operations, two concurrent copies of one message answer the sorted outcomes `applied` and `duplicate` (finding R45-001, R45-019); a PassportEnded whose `content.recyclerBpnl` differs from the sender answers 403 `ERR-RX-SENDER-MISMATCH` and stores nothing (decision D70, The recycler of PassportEnded is the sender); a refused BatteryRepaired on a waste passport stores one refused record of `passport_write_decisions` through `runWrite` (finding R45-006); with the privilege INSERT on `passport_write_decisions` revoked around the case, a BatteryRepaired answers 200 `applied`, the resend answers 200 `duplicate`, and after one run of the worker the audit table holds one record of the step (decision D69, The audit record after a failed write is queued); a body with the content type `text/plain` that holds a valid message as text answers `ERR-RX-CONTENT-INVALID`, and the bodies with the content type `application/json; charset=latin1` and with the header `Content-Encoding: x-unknown` answer `ERR-RX-CONTENT-INVALID` and no log line at the level `error`; a POST to `/api/lifecycle-notifications/BatteryDisassembled` answers 404 `ERR-RX-OPERATION-UNKNOWN` with the error body of D9 (The error body) |
| `server/test/lifecycleEventRoutes.integration.test.mjs` | P5 | through `EP-REPORT-REPAIR`, `EP-REPORT-WASTE`, `EP-REPORT-RECYCLING`, `EP-NOTIFICATIONS-SENT`, `EP-NOTIFICATIONS-RECEIVED` and `EP-NOTIFICATION-RETRY`: the planned notifications, each identifier of which has the lower-case form with the prefix `urn:uuid:`; the notice for the passport service provider on the data provider's deployment; a recycling report without `receivedFromSuccessorBpnl`; the local application of D12; the refusal of D48 (The repair certificate before the notice) [waits for the owner]; `EP-REPORT-REPAIR` with a repair certificate that the twin registry does not hold answers `ERR-LC-CERTIFICATE-NOT-REGISTERED`, which `reportEvent` raises (D48 [waits for the owner], finding R45-016) |
| `server/test/passportRoutes.integration.test.mjs` | P5 | through `EP-MODEL-CREATE`, `EP-MODEL-TWIN`, `EP-PASSPORT-CREATE`, `EP-ASPECT-PUT`, `EP-ISSUE-NEW-PASSPORT`, `EP-TWIN`, `EP-FORWARD-LINK`, `EP-SUCCESSOR-AUTHORISATION` and `EP-PASSPORT-READ`: the success bodies with the field `exposure`, the refusals of §9.5, 401 without a credential, 403 for a partner subject, and 404 for a passport of another data provider; the answers hold the fields of §9.3 (decision D71, The fields of the operator answers as built); `PUT /api/passports/:passportId/aspects/serial-part` with the content type `text/plain`, without a body, with `null`, with a list and with a number answers `ERR-LC-BODY-INVALID` and stores nothing (finding R45-007, R45-008); a second passport with a stored `passportIdentifier` answers its refusal and stores one refused record of `passport_write_decisions` through `runWrite` (finding R45-006); with the privilege INSERT on `passport_write_decisions` revoked around the case, `EP-PASSPORT-CREATE` answers 201; `GET /api/passports/:passportId/nothing` answers 404 `ERR-LC-PATH-UNKNOWN` with the error body of D9 |
| `server/test/submodelRoutes.integration.test.mjs` | P5 | through `EP-SUBMODEL` and `EP-ACCESS-MAP`: the bare payloads; the built payloads validate against the generated schemas of the three models, and the four stored payloads validate against their stored schemas; each line of the access decision of §9.2.4; no stored record changes during a read; `EP-HEALTH` answers 200 |
| `server/test/accessMap.integration.test.mjs` | P5 | through `EP-ACCESS-MAP-PUT` and `EP-ASPECT-PUT`: a complete map is stored; an incomplete map, a map with two groups for one field, a repeated version and an unsupported path are refused; a later payload that the current map does not cover is refused; the tie rule and the date rule of `readAccessMap`; twelve concurrent pairs of `EP-ACCESS-MAP-PUT` without an entry for `product-condition` and `EP-ASPECT-PUT` of a `product-condition` payload of one battery model never leave both requests committed: in each pair one request answers `ERR-LC-ACCESS-MAP-INCOMPLETE` (finding R45-005); a map with two entries of one field and two groups answers `ERR-LC-ACCESS-MAP-INCOMPLETE`, and a map with two equal entries answers `ERR-LC-BODY-INVALID`, each without a stored payload and without a log line at the level `error` (finding R45-009) |
| `server/test/accessRecords.integration.test.mjs` | P5 | through `EP-ACCESS-RECORD`, `EP-ACCESS-RECORD-END` and `EP-PURCHASER`: each cell of the table of D29 (The access regime and the admitted roles) under both regimes; `ERR-LC-RECORD-EXISTS` for a second open record; the records that `EP-PURCHASER` opens, the nameplate key included when the access map marks the battery status as restricted; the previous purchaser no longer reads the product condition after the change; the passport record is unchanged by the change |
| `server/test/openApiContract.test.mjs` | P5 | every response of the four receiving endpoints, the status 401 included, validates against the response schema of its status in `docs/api/openAPI.yaml` |
| `server/test/notificationSender.integration.test.mjs` | P5 | each of the six outcomes is stored with its cause, its resolved identifier and its connector address; a `no_asset` and a `contract_refused` record hold the receiver, the operation, the passport identifier and the date of the attempt; a failed transport is sent again with the same `messageId` after the pause of D49 (The retry of a failed transport) [waits for the owner] and ends as `transport_failed` at the last attempt; two concurrent calls of `sendDue` send one row once; a receiver that answers 500 gives the outcome `pending` with `attempts` 1 and the status stored, and the outcome `transport_failed` at the limit; a receiver that answers 404 gives the final outcome `receiver_refused`, which `EP-NOTIFICATION-RETRY` refuses with `ERR-LC-STATUS-NOT-ADMITTED`; a resolver and a transport that throw give `transport_failed`; a receiver whose error code holds the character U+0000 and 600 further characters gives a stored cause without the character and of 500 characters, and a second row of another receiver is sent in the same call; a write of the attempt that fails (the test revokes the privilege UPDATE on the column `notifications_sent.receiver_did` around the case, because the first write sets `receiver_did` and the second write sets `cause`) stores the outcome `pending`, `attempts` 1, the cause `the attempt record failed: sqlstate 42501` and `receiver_did` null in the second transaction, and a run without the failure respects the limit of D49 (finding R45-002, R45-003) [waits for the owner]; a receiver whose notification asset does not admit the sender gives the outcome `no_asset`, and a receiver whose usage policy holds another framework agreement gives `contract_refused` (decision D83, One meaning of no_asset and contract_refused) |
| `server/test/outboxWorker.integration.test.mjs` | P5 | with an injected clock: a PassportEnded record is not sent 4 seconds after the record time and is sent 5 seconds after the record time; the message that the transport receives equals the stored message; a second `tick()` during a running `tick()` returns the same promise; `tick()` calls the sender, the puller and `audit.writeQueued()` in this order, and an error of one call does not stop the two other calls |
| `server/test/issuerContracts.integration.test.mjs` | P5 | through `EP-PROVIDER-CONTRACT`, `EP-ISSUER-CONTRACT`, `EP-CONTRACT-END`, `EP-CONTRACT-PULL`, `EP-RECEIVED-INFORMATION` and `EP-BATTERY-INFORMATION`, with two applications on one memory transport: the offer admits only the issuer; the pull stores one received record with the battery identifier, the agreement identifier and the time of receipt without a further request; another partner is refused; an ended contract starts no transfer; the refusals `ERR-LC-ISSUER-NOT-LINKED` and `ERR-LC-CONTRACT-EXISTS`; no passport and no payload changes on the issuer's deployment; `EP-PROVIDER-CONTRACT` and `EP-CONTRACT-END` answer `exposure` with the result of the publication and of the withdrawal of the offer, and a repeated `EP-CONTRACT-END` withdraws the offer again (D73 (The exposure of a battery information offer) [waits for the owner] [waits for the owner]) |
| `server/test/transportContract.test.mjs` | P5 | one test code for the five outcomes of `send` and the five outcomes of `pull` against the memory transport, and from phase P7 also against the connector transport with a stubbed `fetch`; a receiver answer of 500 gives `transport_failed` with the status, and an answer of 404 gives `receiver_refused`; a provider answer of 503 gives `transport_failed`; each memory transport presents its own Business Partner Number to the receiver (finding R45-020); one test step per outcome for both implementations: an offer that the access policy hides gives `no_asset`, and an offer with the framework agreement `OtherAgreement:1.0` gives `contract_refused` (D83); for the connector transport only, with the recorded answers of the second run: an answer 500 with `{"errors":["Received code transferring HTTP data: 405 - Method Not Allowed."]}` gives `receiver_refused` with `httpStatus` 405, an answer 500 with a named code 503 gives `transport_failed` with `httpStatus` 503, and an answer 500 with `{"errors":[]}` gives `transport_failed` with `httpStatus` 500 and the cause `the data plane answered 500: no error text` (D85 (The error text of the provider data plane), D88 (A data plane answer 500 without a code) [waits for the owner]) |
| `server/test/receiverResolverContract.test.mjs` | P5 | one test code for a resolved receiver and for the result `null` against the memory resolver (each of its two steps), against the address list resolver (a Business Partner Number outside the list) and, from phase P7, against the discovery resolver with a stubbed `fetch` that answers the connector discovery request with the forms recorded from release 0.13.0, the answer 400 included (D75 (The receiver resolution through the own connector), D81 (A fixed address list in the local deployment only)) |

### 14.3 Conformance tests

Each file runs against the binding of `TCK_BINDING`, names its criterion in its first test title, and uses the three participants of §9.2.9.

| File | Criterion | What the file asserts | Endpoints exercised |
|---|---|---|---|
| `tck/CAC-001.tck.mjs` | CAC-001 (new passport) | a new passport for each of the four operations, with a new passport identifier; the battery identifier kept for one battery and renewed after remanufacturing | `EP-MODEL-CREATE`, `EP-PASSPORT-CREATE`, `EP-ISSUE-NEW-PASSPORT`, `EP-PASSPORT-READ` |
| `tck/CAC-002.tck.mjs` | CAC-002 (digital twin) | with the ten payloads stored: the new PartInstance shell with the keys of Table 2.1.1 of the proposal and the descriptors of the eight models of CX-0160-3, of SerialPart and of SingleLevelBomAsBuilt, and of the lifecycle model; the shell of the original passport is equal before and after | `EP-ISSUE-NEW-PASSPORT`, `EP-ASPECT-PUT`, `EP-TWIN` |
| `tck/CAC-003.tck.mjs` | CAC-003 (model elements) | the governed elements of §10.6 on the new passport hold the second-life operator's values and the four performance values, where the test asserts that `ManufacturerName` of the new nameplate differs from `ManufacturerName` of the original nameplate and from the stored value of the fixture, because the participant contract of §9.2.9 holds no legal name; the battery model of the new passport references the original model | `EP-ISSUE-NEW-PASSPORT`, `EP-SUBMODEL` |
| `tck/CAC-004.tck.mjs` | CAC-004 (predecessor links) | the lifecycle payload holds one link per original passport with the five mandatory properties, and each `catenaXId` reads a shell in the original data provider's registry; the shell holds the descriptor of `single-level-bom-as-built`, and no served payload other than the lifecycle payload holds a passport identifier of a predecessor | `EP-ISSUE-NEW-PASSPORT`, `EP-ASPECT-PUT`, `EP-SUBMODEL` |
| `tck/CAC-005.tck.mjs` | CAC-005 (forward link) | the successors offer is listed only for the recorded recipients; the status of the original passport is unchanged after the new passport; a request of the second-life operator's deployment on the passport of the original data provider answers 404, and the original data provider's passport is unchanged | `EP-FORWARD-LINK`, `EP-ACCESS-RECORD`, `EP-SUBMODEL`, `EP-RX-NEW-PASSPORT`, `EP-ASPECT-PUT` |
| `tck/CAC-006.tck.mjs` | CAC-006 (status and repair) | the status after each event of Table 2.1.4 of the proposal; the passport and its identifiers kept after a repair and after a change of purchaser; the repair is not reported before the certificate twin is registered, and the sent BatteryRepaired carries the certificate reference | `EP-REPORT-REPAIR`, `EP-RX-REPAIRED`, `EP-PURCHASER`, `EP-PASSPORT-READ` |
| `tck/CAC-007.tck.mjs` | CAC-007 (waste status) | the status `waste` on the same passport, the successor that the notification names in the lifecycle payload, also for a named producer that is not the manufacturer; the shell readable with the lifecycle descriptor; a change (`EP-ASPECT-PUT` of the SerialPart payload and `EP-FORWARD-LINK`) refused without the authorisation and admitted inside its period; the end recorded without the authorisation | `EP-REPORT-WASTE`, `EP-RX-WASTE`, `EP-SUCCESSOR-AUTHORISATION`, `EP-ASPECT-PUT`, `EP-FORWARD-LINK`, `EP-SUBMODEL` |
| `tck/CAC-008.tck.mjs` | CAC-008 (donors) | a donor passport is readable after the remanufacturing and takes the status `waste` after BatteryBecameWaste | `EP-ISSUE-NEW-PASSPORT`, `EP-REPORT-WASTE`, `EP-RX-WASTE`, `EP-SUBMODEL` |
| `tck/CAC-009.tck.mjs` | CAC-009 (end of the passport) | with a passport service provider configured: PassportEnded is planned for the receivers of §10.3, and the planned send time `notBefore` of each PassportEnded is at least 5 seconds after the time of its record, which `header.sentDateTime` of the stored message holds (decision D87, The delay checked against the record time); the notification leaves after the delay; `endOfPassport` is in the lifecycle payload; a later change is refused; a PassportEnded that arrives before BatteryBecameWaste ends the passport with its status unchanged | `EP-REPORT-RECYCLING`, `EP-RX-ENDED`, `EP-NOTIFICATIONS-SENT`, `EP-ASPECT-PUT`, `EP-SUBMODEL` |
| `tck/CAC-010.tck.mjs` | CAC-010 (access) | under `after-act`: `cx.circular.dpp:1` on each offer; the product condition and the lifecycle offers listed only for the admitted roles; the access withdrawn after a change of purchaser | `EP-ACCESS-RECORD`, `EP-PURCHASER`, `EP-SUBMODEL` |
| `tck/CAC-011.tck.mjs` | CAC-011 (access before the Article 77(9) act) | under `before-act`: an access record of the role `authorisedRecipient` opens the product condition offer for that recipient only | `EP-ACCESS-RECORD`, `EP-SUBMODEL` |
| `tck/CAC-012.tck.mjs` | CAC-012 (notification API) | one asset with the taxonomy name; four endpoints; the header and the content of each sent message; one notification per receiver and passport; the resolved identifier and the connector address on each sent record; in phase P6, the record of a receiver that does not resolve (the outcome `receiver_unresolved` with the date of the attempt), and from phase P7 the record of a receiver without an asset (the outcome `no_asset`) after `withdrawNotificationAsset()` of the receiver (D74 (The binding contract and criterion CAC-012) [waits for the owner] [waits for the owner]); the descriptive error body of the receiver on the answers 405 (a GET of each endpoint) and 404 (an unknown operation) through `asPartner(reader).get(path)`, validated against `ErrorResponse.schema.json`, and, for a refused BatteryRepaired, a sent record whose outcome is not `sent` and a receiver that holds no received record of its `messageId`, which both bindings show, because the provider data plane of release 0.13.0 does not pass the status 404 and the code `ERR-RX-PASSPORT-UNKNOWN` to the sender (D85, D88 [waits for the owner] [waits for the owner]); the in-process binding also shows the status 404 and the cause `ERR-RX-PASSPORT-UNKNOWN`; the body of a refused POST is tested by `server/test/lifecycleNotificationRoutes.integration.test.mjs` and `server/test/openApiContract.test.mjs` | `EP-RX-NEW-PASSPORT`, `EP-RX-REPAIRED`, `EP-RX-WASTE`, `EP-RX-ENDED`, `EP-NOTIFICATIONS-SENT`, `EP-NOTIFICATIONS-RECEIVED` |
| `tck/CAC-013.tck.mjs` | CAC-013 (data assets) | each of the three models is listed as an offer with its semantic identifier and is a submodel descriptor of its twin, the lifecycle descriptor after the waste status and the successors descriptor after a forward link included | `EP-SUBMODEL`, `EP-ACCESS-MAP`, `EP-ACCESS-MAP-PUT`, `EP-RX-WASTE`, `EP-FORWARD-LINK` |
| `tck/CAC-014.tck.mjs` | CAC-014 (certificates) | the sent BatteryRepaired and PassportEnded carry the certificate references of the request | `EP-REPORT-REPAIR`, `EP-REPORT-RECYCLING`, `EP-NOTIFICATIONS-SENT` |
| `tck/CAC-015.tck.mjs` | CAC-015 (persistence) | after the end, a recorded reader still reads the lifecycle payload | `EP-REPORT-RECYCLING`, `EP-SUBMODEL` |
| `tck/CAC-016.tck.mjs` | CAC-016 (access map) | the access map offer on the PartType shell; one entry per served field of the seven IDTA-02035 aspect keys; a payload that the map does not cover is refused; a reader without a record is refused a restricted aspect and reads a public aspect; a new map version after a change | `EP-MODEL-CREATE`, `EP-ACCESS-MAP-PUT`, `EP-ACCESS-MAP`, `EP-ASPECT-PUT`, `EP-SUBMODEL` |

The two criteria of the type SHOULD in Annex A of the proposal are the criterion on the certificates and the criterion on the persistence. The test of the certificates asserts the certificate references only, because the registration of a CX-0131 (Circularity Core) certificate is the act of the second-life operator, the waste receiver and the recycler in their own systems. The test of the status and the repair asserts the order of D48 [waits for the owner] and not the content of the repair certificate.

### 14.4 The lessons and their tests

`docs/lessons-from-a-first-implementation.md` holds 14 classes of defects `[live]`. The table names the test that excludes each class.

| Lesson | Test that excludes the defect |
|---|---|
| 1, a later step overwrites the manufacturer | `server/test/databaseRules.integration.test.mjs` (the identity trigger); `tck/CAC-007.tck.mjs` |
| 2, a second-life step changes the original twin | `tck/CAC-002.tck.mjs` |
| 3, the new passport receives a different battery model | `server/test/lifecycleService.integration.test.mjs` (`ERR-LC-MODEL-NOT-ORIGINAL`); `tck/CAC-003.tck.mjs` |
| 4, the second-life operator writes the forward link | `tck/CAC-005.tck.mjs` |
| 5, NewPassportIssued reports a status of the original passport | `server/test/contractSchemas.test.mjs` (no status property); `tck/CAC-005.tck.mjs` |
| 6, the rules refuse every action on a waste battery | `server/test/lifecycleCatalogue.test.mjs`; `tck/CAC-001.tck.mjs` |
| 7, a donor cannot later become waste | `tck/CAC-008.tck.mjs` |
| 8, one operation sends no notification | `server/test/notificationPlan.test.mjs`; `tck/CAC-012.tck.mjs` |
| 9, a notification goes to every known partner | `server/test/notificationPlan.test.mjs` |
| 10, the notification uses a format of the implementation | `server/test/contractSchemas.test.mjs`; `server/test/openApiContract.test.mjs` |
| 11, the recycling notice leaves out mandatory content | `server/test/contractSchemas.test.mjs`; `tck/CAC-009.tck.mjs` |
| 12, the receiver changes its passport on the word of any sender | `server/test/lifecycleNotificationRoutes.integration.test.mjs` (the fifth check); the bound of D47 (The access to the notification asset) [waits for the owner] |
| 13, the confirmation of a change reads the wrong result | `server/test/lifecycleService.integration.test.mjs` (the stored records after each step) |
| 14, the recovered materials are compared with the wrong thresholds | none: the recovered materials are outside the scope (group 1 of §5.4) |

## 15. Done when

Every command runs at the repository root, on the commit that the last phase produces, whose base is the substrate commit of the header, in a shell that holds the two functions and the two variables of §11.0. Each command has one form, which is the same on the owner's Windows machine and on Ubuntu, because the two functions hide the difference. The implementer copies the output of each command into the completion record.

1. The four checks of §11.0 print, in this order, the registry line of the environment (§11.0: `0 problems, 10 quotes skipped` in the container of the owner's machine, `0 problems, 0 quotes skipped` on the Ubuntu runner), a line that holds `0 problems`, the line `0 files without a license header or NOTICE section` and the line `0 private references`, and the command exits 0. `node24 node scripts/check-annexes.mjs --require P3` prints a last line that ends with `0 differ, 0 missing`.
2. `node24 npx --yes @stoplight/spectral-cli@6 lint docs/api/openAPI.yaml --ruleset .spectral.yaml --fail-severity error` exits 0.
3. `java21 bash scripts/validate-models.sh --generate` prints three lines that start with `VALID` and three lines that start with `GENERATED`, exits 0, and `git diff --exit-code -- docs/api/aspects` then exits 0.
4. `find models -name "*.ttl" | wc -l` prints 3, and `find models -name metadata.json | wc -l` prints 3.
5. `node24 bash -c "cd server && npm ci && npm test && node ../scripts/check-dependency-licenses.mjs"` exits 0 and prints the lines `# fail 0` and `0 packages outside the licence list`, and `ls server/test/*.test.mjs | wc -l` prints 31.
6. `node24 bash -c "cd server && npm ci && cd ../tck && npm ci && TCK_BINDING=in-process npm test && node ../scripts/check-dependency-licenses.mjs"` exits 0 and prints the lines `# fail 0`, `# skipped 0` and `0 packages outside the licence list`.
7. The connector binding runs in three deployments of `tck/docker-compose.yml`. For each of the three regimes of §9.2.9 (the default regime for the fourteen files other than `CAC-009` and `CAC-011`; `PASSPORT_SERVICE_PROVIDER_BPNL=BPNL00000000TCK6` for `CAC-009`; `ACCESS_REGIME=before-act` for `CAC-011`), `docker compose -f tck/docker-compose.yml --env-file tck/.env up -d --wait` with the variables of the regime exits 0; `TCK_BINDING=connector node --test --test-reporter=tap <the files of the regime>` in `tck/`, run in a container of the image `node:24` on the network `tck_default`, prints `# fail 0` and `# skipped 0`; after the default regime, `node --test tck/connectorHeader.test.mjs` prints `# fail 0`; and `docker compose -f tck/docker-compose.yml --env-file tck/.env down -v` exits 0. The completion record holds the three summaries, or the contingency of §10.7.
8. `ls tck/CAC-0*.tck.mjs | wc -l` prints 16, and `grep -L "CX-0160-4-CAC-0" tck/CAC-0*.tck.mjs` prints nothing.
9. `grep -rln "process\.env" server/src` prints exactly the four files `server/src/index.mjs`, `server/src/db/migrateCli.mjs`, `server/src/db/createAppRoleCli.mjs` and `server/src/access/signTokenCli.mjs`. The command `grep -rnE "\b(SELECT|INSERT INTO|UPDATE|DELETE FROM) " server/src/routes server/src/dataset/lifecycleService.mjs server/src/access/accessRecordService.mjs server/src/submodels server/src/connector/issuerContractService.mjs --include=*Service.mjs --include=*Routes.mjs` prints nothing and exits with the status 1, the status of a search without a match.
10. `LC_ALL=C.UTF-8 grep -rnP "\x{2014}|\x{2013}" docs README.md CHANGELOG.md INSTALL.md server tck models --include=*.md` prints nothing and exits with the status 1, so no Markdown file holds an em dash or an en dash.
11. `git status --porcelain` lists only paths of §7.


## 16. Import dependencies and cutover order

- The schema files of P1 exist before the server of P4, because `schemaValidator.mjs` compiles them at the start.
- `server/package.json` exists from phase P1, because the tests of P1 and P2 need the validator packages.
- The generated schema of the access map model of P2 exists before `accessMapService.mjs` of P4, which compiles the schema. The implementer must not write a generated schema by hand, because a hand-written schema differs from the output of the SAMM command line tool.
- The role `refserver_app` exists before the first migration, because `003_policies.sql` grants to the role. `createTestDatabase` and the command `npm run create-role` create the role.
- `001_schema.sql` creates `notifications_received` before `passport_successor_links` and `passport_repair_entries`, which reference the table.
- `003_policies.sql` runs after `001_schema.sql`, because a policy names its table. The implementer must write the grants of the file before the statements that enable row-level security, because a table with forced row-level security and no policy refuses every statement of the application role.
- The memory implementations of P4 and P5 exist before the test kit of P6, and `npm ci` in `server/` precedes `npm ci` in `tck/`.
- The owner's naming of the connector release precedes the second part of phase P7.
- The repository has no deployment, so no cutover exists.

## 17. Traceability

### 17.1 The criteria of Annex A of the proposal

§5.1 traces each system requirement to its conformance criterion or its server test. §5.2 traces each software requirement to its file and its test. §5.3 traces each process requirement to its artefact and its phase. The table traces each criterion to the sections of the proposal, to the modules and to its test file.

| Criterion | Sections of the proposal | Modules | Test file |
|---|---|---|---|
| CAC-001 (new passport) | 2.1.1 items 1 to 3 | `server/src/dataset/lifecycleService.mjs`, `server/src/dataset/lifecycleCatalogue.mjs` | `tck/CAC-001.tck.mjs` |
| CAC-002 (digital twin) | 2.1.1 items 4, 5 and 7 | `server/src/twins/shellDescriptor.mjs`, the twin registry of the binding | `tck/CAC-002.tck.mjs` |
| CAC-003 (model elements) | 2.1.1 item 6 | `server/src/dataset/governedElements.mjs`, `server/src/submodels/submodelService.mjs` | `tck/CAC-003.tck.mjs` |
| CAC-004 (predecessor links) | 2.1.2 | `server/src/dataset/lifecycleRecordReader.mjs` | `tck/CAC-004.tck.mjs` |
| CAC-005 (forward link) | 2.1.3 items 2 to 4 | `server/src/dataset/lifecycleService.mjs`, `server/src/connector/offerPublisher.mjs` | `tck/CAC-005.tck.mjs` |
| CAC-006 (status and repair) | 2.1.4 | `server/src/dataset/lifecycleService.mjs`, `server/src/access/accessRecordService.mjs` | `tck/CAC-006.tck.mjs` |
| CAC-007 (waste status) | 2.1.5 items 1, 3, 4 and 5 | `server/src/dataset/lifecycleService.mjs`, `server/src/db/migrations/002_triggers.sql` | `tck/CAC-007.tck.mjs` |
| CAC-008 (donors) | 2.1.6 items 1 and 2 | `server/src/dataset/lifecycleService.mjs` | `tck/CAC-008.tck.mjs` |
| CAC-009 (end of the passport) | 2.1.7 items 2 to 4 | `server/src/dataset/lifecycleService.mjs`, `server/src/background/outboxWorker.mjs` | `tck/CAC-009.tck.mjs` |
| CAC-010 (access) | 2.2 items 1, 2, 5, 6 and 7 | `server/src/access/accessRecordService.mjs`, `server/src/connector/policyBuilder.mjs` | `tck/CAC-010.tck.mjs` |
| CAC-011 (access before the Article 77(9) act) | 2.2 item 4 | `server/src/access/accessRecordService.mjs` | `tck/CAC-011.tck.mjs` |
| CAC-012 (notification API) | 4.3 items 1 to 7 | `server/src/routes/lifecycleNotificationRoutes.mjs`, `server/src/connector/notificationPlan.mjs`, `server/src/connector/notificationSender.mjs` | `tck/CAC-012.tck.mjs` |
| CAC-013 (data assets) | 4.1 | `server/src/connector/offerPublisher.mjs`, `server/src/twins/shellDescriptor.mjs`, `server/src/connector/exposure.mjs` | `tck/CAC-013.tck.mjs` |
| CAC-014 (certificates) | 2.1.1 item 8, 2.1.5 item 2, 2.1.7 item 1 | `server/src/connector/notificationPlan.mjs` | `tck/CAC-014.tck.mjs` |
| CAC-015 (persistence) | 2.1.7 item 5 | `server/src/connector/offerPublisher.mjs` | `tck/CAC-015.tck.mjs` |
| CAC-016 (access map) | 2.2 items 8 to 12, 3.4 | `server/src/submodels/accessMapService.mjs`, `server/src/submodels/jsonPathSubset.mjs` | `tck/CAC-016.tck.mjs` |

Annex A of the proposal holds no criterion for the use cases LC-1 and LC-5b. The four system requirements and the four software requirements of the sharing of individual battery information trace in §5.1 and §5.2 to `server/src/connector/issuerContractService.mjs`, to `server/src/connector/batteryInformationPuller.mjs` and to `server/test/issuerContracts.integration.test.mjs`. Every module and every test file of this section is a planned file of §7.

### 17.2 The verification measures of the registry

The table names, for each requirement of §5.1 and §5.2, each verification measure that the field `verification` of the requirement holds `[live]`, and the test that executes the measure. No requirement and no measure of the registry at the commit 7adafbb names the configuration reader, the logger or the forms of an identifier: a search of the titles, the statements and the pass criteria on 2026-11-17 for the words of a configuration, of a log, of a secret and of an identifier form found only SwR-CXCLIENT-183 (Sender's record of a receiver without an asset or a contract), whose rationale names a log line that the stored record replaces, and VM-SWE-DATASET-032 (Dataset submodels and marking served at the data-plane interface), whose pass criteria name a log entry of a refused payload. Neither record is verified by the three tests of §14.2 `server/test/config.test.mjs`, `server/test/logger.test.mjs` and `server/test/identifiers.test.mjs`, which execute no measure of this table and verify the contracts of §9.2.1 and §9.6, decision D50 (Every admitted form of an identifier accepted, one form sent) and the protection of the credentials of decision D24 (Two database roles and row-level security). A measure of a system requirement that names a conformance criterion is executed by the test file of the criterion. §5.7 lists the measures whose pass criteria differ from the design.

| Requirement | Title of the requirement | Measure | Title of the measure | Executed by |
|---|---|---|---|---|
| SyR-PASS-005 | Only the responsible or an authorised operator changes the dataset | VM-SYS-PASS-014 | Writes to the dataset refused unless responsible or authorised | `tck/CAC-005.tck.mjs` |
| SyR-PASS-005 | Only the responsible or an authorised operator changes the dataset | VM-SYS-SEC-029 | Battery passport dataset delivery and integrity test | `tck/CAC-005.tck.mjs` |
| SyR-PASS-005 | Only the responsible or an authorised operator changes the dataset | VM-SYS-SEC-037 | Third-party penetration test of the application against ASVS level 2 | `tck/CAC-005.tck.mjs` |
| SyR-PASS-011 | Every dataset field marked with exactly one access group | VM-SYS-PASS-009 | Access marking complete, one group per field, changeable | `tck/CAC-016.tck.mjs` |
| SyR-LIFE-008 | Status waste set on the existing passport, with no new passport | VM-SYS-LIFE-005 | Change to waste on the existing passport with transfer of responsibility | `tck/CAC-007.tck.mjs` |
| SyR-LIFE-011 | Recycling ends the battery's passport dataset | VM-SYS-LIFE-009 | Recycling ends the battery's passport dataset | `tck/CAC-009.tck.mjs` |
| SyR-LIFE-013 | Preparation for re-use or repurposing admitted only for waste | VM-SYS-LIFE-006 | Operations admitted by the battery's status | `server/test/lifecycleCatalogue.test.mjs` |
| SyR-LIFE-014 | Repurposing admitted only for a battery that is not waste | VM-SYS-LIFE-006 | Operations admitted by the battery's status | `server/test/lifecycleCatalogue.test.mjs` |
| SyR-LIFE-015 | Repurposing admitted only for a purpose different from the original | VM-SYS-LIFE-008 | Purpose rules of repurposing, remanufacturing and preparation for re-use | `server/test/lifecycleCatalogue.test.mjs` |
| SyR-LIFE-016 | Remanufacturing admitted only for the original purpose | VM-SYS-LIFE-008 | Purpose rules of repurposing, remanufacturing and preparation for re-use | `server/test/lifecycleCatalogue.test.mjs` |
| SyR-LIFE-017 | Preparation for re-use admitted only for the original purpose | VM-SYS-LIFE-008 | Purpose rules of repurposing, remanufacturing and preparation for re-use | `server/test/lifecycleCatalogue.test.mjs` |
| SyR-LIFE-018 | New passport dataset for a treated battery placed on the market again | VM-SYS-LIFE-012 | New passport dataset, identifier, link and superseded mark per operation | `tck/CAC-001.tck.mjs` |
| SyR-LIFE-019 | New passport dataset links to each original battery's passport | VM-SYS-LIFE-012 | New passport dataset, identifier, link and superseded mark per operation | `tck/CAC-004.tck.mjs` |
| SyR-LIFE-020 | Remanufactured dataset links every original battery's passport | VM-SYS-LIFE-013 | Number of links of each new passport dataset | `tck/CAC-004.tck.mjs` |
| SyR-LIFE-021 | Re-use and repurposing datasets link one or more original passports | VM-SYS-LIFE-013 | Number of links of each new passport dataset | `tck/CAC-004.tck.mjs` |
| SyR-LIFE-024 | Original passport kept, superseded relation held in the lineage records | VM-SYS-LIFE-012 | New passport dataset, identifier, link and superseded mark per operation | `tck/CAC-005.tck.mjs` |
| SyR-LIFE-026 | New unique identifier attributed by the operator to the new passport | VM-SYS-LIFE-012 | New passport dataset, identifier, link and superseded mark per operation | `tck/CAC-001.tck.mjs` |
| SyR-LIFE-028 | New passport dataset takes over the original battery model | VM-SYS-LIFE-016 | Data carried over and not carried over to the new passport | `tck/CAC-003.tck.mjs` |
| SyR-LIFE-048 | Responsibility moves to the operator placing the battery again | VM-SYS-LIFE-021 | Responsible economic operator and manufacturer through the lifecycle | `tck/CAC-003.tck.mjs` |
| SyR-LIFE-049 | Responsibility moves to a named successor when the battery becomes waste | VM-SYS-LIFE-005 | Change to waste on the existing passport with transfer of responsibility | `tck/CAC-007.tck.mjs` |
| SyR-LIFE-051 | Operator placing the treated battery named as its manufacturer | VM-SYS-LIFE-021 | Responsible economic operator and manufacturer through the lifecycle | `tck/CAC-003.tck.mjs` |
| SyR-LIFE-127 | End of a recycled battery's passport made known to the provider | VM-SYS-LIFE-010 | End of a recycled battery's passport reaches the passport service provider | `tck/CAC-009.tck.mjs` |
| SyR-CXD-092 | Notification APIs offered and called with HTTP POST only | VM-SYS-CXD-040 | Reproduces CX-0151 1.3 proof 3: notification API OpenAPI and response codes | `tck/CAC-012.tck.mjs` |
| SyR-CXD-096 | Notification endpoints answer 200, or 4xx or 5xx on failure | VM-SYS-CXD-040 | Reproduces CX-0151 1.3 proof 3: notification API OpenAPI and response codes | `tck/CAC-012.tck.mjs` |
| SyR-PASS-215 | Individual battery information shared with the passport issuer under contract | VM-SYS-PASS-023 | Individual battery information shared with the passport issuer under contract | `server/test/issuerContracts.integration.test.mjs` |
| SyR-CXD-218 | Issuer's contract negotiation for individual battery information without a manual step | VM-SYS-CXD-077 | Issuer's contract negotiation for individual battery information without a manual step | `server/test/issuerContracts.integration.test.mjs` |
| SyR-CXD-219 | Transfer of individual battery information to the issuer without a manual step | VM-SYS-CXD-078 | Transfer of individual battery information to the issuer without a manual step | `server/test/issuerContracts.integration.test.mjs` |
| SyR-PASS-230 | Passport data held only for the responsible or an authorised operator | VM-SYS-PASS-038 | Passport data held only for the responsible or an authorised operator | `tck/CAC-005.tck.mjs` |
| SyR-LIFE-129 | Producer of the current passport takes over a waste battery's passport | VM-SYS-LIFE-048 | Producer of the current passport takes over a waste battery's passport | `tck/CAC-007.tck.mjs` |
| SyR-LIFE-130 | Only the original issuer writes into an original passport | VM-SYS-LIFE-049 | No forward link written into an original passport | `tck/CAC-005.tck.mjs` |
| SyR-LIFE-131 | New passport delivered as a passport of its own, not a version | VM-SYS-LIFE-050 | New passport delivered as a passport of its own, not a version | `tck/CAC-001.tck.mjs` |
| SyR-LIFE-132 | Remanufacturing donor's passport later accepts the status waste | VM-SYS-LIFE-051 | Remanufacturing donor's passport later accepts the status waste | `tck/CAC-008.tck.mjs` |
| SyR-LIFE-133 | Direct re-use without preparation keeps the passport and its identifier | VM-SYS-LIFE-052 | Direct re-use without preparation keeps the passport and its identifier | `tck/CAC-006.tck.mjs` |
| SyR-LIFE-134 | Direct re-use leaves the responsible economic operator unchanged | VM-SYS-LIFE-053 | Direct re-use leaves the responsible economic operator unchanged | `tck/CAC-006.tck.mjs` |
| SyR-PASS-231 | New holder after direct re-use recorded as the battery's purchaser | VM-SYS-PASS-039 | New holder after direct re-use recorded as the battery's purchaser | `tck/CAC-010.tck.mjs` |
| SyR-CXD-221 | New digital twin for a battery that receives a new passport | VM-SYS-CXD-080 | New digital twin for a battery that receives a new passport | `tck/CAC-002.tck.mjs` |
| SyR-LIFE-138 | Original issuer notified of a new passport under contract | VM-SYS-LIFE-057 | Original issuer notified of a new passport under contract | `tck/CAC-012.tck.mjs` |
| SyR-LIFE-139 | Original issuer may add a forward link to its own passport | VM-SYS-LIFE-058 | Original issuer may add a forward link to its own passport | `tck/CAC-005.tck.mjs` |
| SyR-PASS-232 | Forward link offered to the issuer's authorised recipients and authorities | VM-SYS-PASS-040 | Forward link marked with the access group of the battery status | `tck/CAC-005.tck.mjs` |
| SyR-PASS-233 | Degradation data of a second-life battery offered to the original issuer | VM-SYS-PASS-041 | Degradation data of a second-life battery offered to the original issuer | `server/test/issuerContracts.integration.test.mjs` |
| SyR-PASS-235 | Previous holder loses access to individual battery information after a resale | VM-SYS-PASS-043 | Previous holder loses access to individual battery information after a resale | `tck/CAC-010.tck.mjs` |
| SyR-LIFE-140 | Battery status unchanged after a direct re-use | VM-SYS-LIFE-059 | Battery status unchanged after a direct re-use | `tck/CAC-006.tck.mjs` |
| SyR-LIFE-141 | Passport's data provider, nameplate manufacturer and successor notified of the recycling | VM-SYS-LIFE-060 | Producer of the ended passport notified of the recycling result | `tck/CAC-009.tck.mjs` |
| SyR-LIFE-142 | Predecessor issuers may be notified of the recycling under contract | VM-SYS-LIFE-061 | Predecessor issuers may be notified of the recycling under contract | `tck/CAC-009.tck.mjs` |
| SyR-LIFE-143 | Only the data provider of a passport writes into that passport | VM-SYS-LIFE-062 | Writes into a passport only from its data provider's deployment | `tck/CAC-005.tck.mjs` |
| SyR-LIFE-144 | End of the passport recorded without the successor's authorisation | VM-SYS-LIFE-063 | End of the passport recorded without the successor's authorisation | `tck/CAC-007.tck.mjs` |
| SyR-LIFE-145 | Repair notified to the data provider of the passport | VM-SYS-LIFE-064 | Repair notified to the data provider of the passport | `tck/CAC-006.tck.mjs` |
| SyR-LIFE-146 | Repair certificate held as the record of the repair | VM-SYS-LIFE-065 | Repair certificate held as the record of the repair | `tck/CAC-006.tck.mjs` |
| SyR-LIFE-147 | Waste status notified to the data provider and the named successor | VM-SYS-LIFE-066 | Waste status notified to the data provider and the named successor | `tck/CAC-007.tck.mjs` |
| SyR-LIFE-148 | Successor, successor's role and date of the waste status held | VM-SYS-LIFE-067 | Successor, role and date held in the waste passport | `tck/CAC-007.tck.mjs` |
| SyR-LIFE-149 | Date of the recycling and the recycler held in the ended passport | VM-SYS-LIFE-068 | Date of the recycling and the recycler held in the ended passport | `tck/CAC-009.tck.mjs` |
| SyR-LIFE-150 | Last battery status kept on a superseded original passport | VM-SYS-LIFE-069 | Last battery status kept on a superseded original passport | `tck/CAC-005.tck.mjs` |
| SyR-LIFE-151 | New passport accepted only with the treated battery's performance values | VM-SYS-LIFE-070 | New passport accepted only with the four performance values | `tck/CAC-003.tck.mjs` |
| SyR-PASS-236 | Lifecycle record offered only to purchaser, operators and authorities | VM-SYS-PASS-044 | Lifecycle record offered only to the persons of section 2.2 item 7 | `tck/CAC-010.tck.mjs` |
| SyR-LIFE-152 | Receiver without a notification asset recorded by the sender | VM-SYS-LIFE-071 | Receiver without a notification asset recorded by the sender | `tck/CAC-012.tck.mjs` |
| SyR-LIFE-153 | One lifecycle notification per receiver and per passport | VM-SYS-LIFE-072 | One lifecycle notification per receiver and per passport | `tck/CAC-012.tck.mjs` |
| SyR-LIFE-154 | Notification changes a passport only by the receiver's assigned steps | VM-SYS-LIFE-073 | Notification changes a passport only by the assigned steps | `tck/CAC-012.tck.mjs` |
| SyR-LIFE-155 | Manufacturer identification of a passport never changed after issue | VM-SYS-LIFE-074 | Manufacturer identification of a passport never changed after issue | `server/test/databaseRules.integration.test.mjs` |
| SwR-DATASET-065 | Every dataset field marked with exactly one Art. 77(2) access group | VM-SWE-DATASET-015 | Access marking: one group per field, catalogue change, special groups | `server/test/accessMap.integration.test.mjs` |
| SwR-DATASET-065 | Every dataset field marked with exactly one Art. 77(2) access group | VM-SWE-DATASET-032 | Dataset submodels and marking served at the data-plane interface | `server/test/accessMap.integration.test.mjs` |
| SwR-DATASET-085 | Status waste set on the existing dataset without a new passport | VM-SWE-DATASET-018 | Lifecycle status, admission and purpose rules | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-085 | Status waste set on the existing dataset without a new passport | VM-SWE-DATASET-021 | Lifecycle operations persisted on the dataset through the real chain | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-085 | Status waste set on the existing dataset without a new passport | VM-SWE-TWINS-034 | Status, descriptions and admission of lifecycle operations | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-086 | Change to waste accepted only with a named responsible successor | VM-SWE-DATASET-018 | Lifecycle status, admission and purpose rules | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-086 | Change to waste accepted only with a named responsible successor | VM-SWE-DATASET-021 | Lifecycle operations persisted on the dataset through the real chain | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-087 | Operations admitted only from the statuses the admission table allows | VM-SWE-DATASET-018 | Lifecycle status, admission and purpose rules | `server/test/lifecycleCatalogue.test.mjs` |
| SwR-DATASET-087 | Operations admitted only from the statuses the admission table allows | VM-SWE-TWINS-034 | Status, descriptions and admission of lifecycle operations | `server/test/lifecycleCatalogue.test.mjs` |
| SwR-DATASET-089 | Recycling ends the dataset, no longer current and closed to change | VM-SWE-DATASET-021 | Lifecycle operations persisted on the dataset through the real chain | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-089 | Recycling ends the dataset, no longer current and closed to change | VM-SWE-DATASET-032 | Dataset submodels and marking served at the data-plane interface | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-089 | Recycling ends the dataset, no longer current and closed to change | VM-SWE-TWINS-034 | Status, descriptions and admission of lifecycle operations | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-091 | Operations admitted by comparing current and original purpose | VM-SWE-DATASET-018 | Lifecycle status, admission and purpose rules | `server/test/lifecycleCatalogue.test.mjs` |
| SwR-DATASET-091 | Operations admitted by comparing current and original purpose | VM-SWE-TWINS-034 | Status, descriptions and admission of lifecycle operations | `server/test/lifecycleCatalogue.test.mjs` |
| SwR-DATASET-092 | Original purpose and each later purpose recorded with their dates | VM-SWE-DATASET-021 | Lifecycle operations persisted on the dataset through the real chain | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-093 | New dataset created for a treated battery placed on the market again | VM-SWE-DATASET-021 | Lifecycle operations persisted on the dataset through the real chain | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-094 | New dataset carries a resolving link to the original passport | VM-SWE-DATASET-021 | Lifecycle operations persisted on the dataset through the real chain | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-095 | Remanufactured dataset links the passport of every original battery | VM-SWE-DATASET-020 | New dataset composition rules: links, carry-over, documents, operators | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-095 | Remanufactured dataset links the passport of every original battery | VM-SWE-DATASET-021 | Lifecycle operations persisted on the dataset through the real chain | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-096 | Re-use and repurposing datasets accepted only with one or more links | VM-SWE-DATASET-020 | New dataset composition rules: links, carry-over, documents, operators | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-096 | Re-use and repurposing datasets accepted only with one or more links | VM-SWE-TWINS-035 | New PartInstance, its links and what it takes over | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-098 | Original dataset kept and marked as superseded by the new one | VM-SWE-DATASET-021 | Lifecycle operations persisted on the dataset through the real chain | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-098 | Original dataset kept and marked as superseded by the new one | VM-SWE-TWINS-035 | New PartInstance, its links and what it takes over | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-100 | New dataset given an identifier different from every original | VM-SWE-DATASET-014 | Unique identifiers distinct, persistent and new per new passport | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-100 | New dataset given an identifier different from every original | VM-SWE-TWINS-035 | New PartInstance, its links and what it takes over | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-102 | New dataset fields set at the issue of a new passport | VM-SWE-DATASET-020 | New dataset composition rules: links, carry-over, documents, operators | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-102 | New dataset fields set at the issue of a new passport | VM-SWE-DATASET-021 | Lifecycle operations persisted on the dataset through the real chain | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-102 | New dataset fields set at the issue of a new passport | VM-SWE-TWINS-035 | New PartInstance, its links and what it takes over | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-116 | Responsibility of a new dataset given to the operator placing it again | VM-SWE-DATASET-020 | New dataset composition rules: links, carry-over, documents, operators | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-116 | Responsibility of a new dataset given to the operator placing it again | VM-SWE-DATASET-021 | Lifecycle operations persisted on the dataset through the real chain | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-118 | Operator placing a treated battery named its manufacturer | VM-SWE-DATASET-020 | New dataset composition rules: links, carry-over, documents, operators | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-119 | Changes applied only for the responsible or an authorised operator | VM-SWE-DATASET-016 | Write and read decisions on dataset information through the real chain | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-126 | Lifecycle data delivered beside the seven aspects in the decided carrier | VM-SWE-DATASET-032 | Dataset submodels and marking served at the data-plane interface | `server/test/submodelRoutes.integration.test.mjs` |
| SwR-SUBMODELS-036 | Access marking assigns every served passport field one group | VM-SWE-SUBMODELS-004 | Access marking assigns every served field exactly one group | `server/test/accessMap.integration.test.mjs` |
| SwR-SUBMODELS-036 | Access marking assigns every served passport field one group | VM-SWE-SUBMODELS-019 | Passport aspects served on the passport-bearing pack through the chain | `server/test/accessMap.integration.test.mjs` |
| SwR-SUBMODELS-036 | Access marking assigns every served passport field one group | VM-SWE-SUBMODELS-026 | Aspects pulled through the connector in the Tractus-X simulation | `server/test/accessMap.integration.test.mjs` |
| SwR-SUBMODELS-052 | Submodel endpoints change no stored data | VM-SWE-SUBMODELS-016 | Instance submodel route answers through the real middleware chain | `server/test/submodelRoutes.integration.test.mjs` |
| SwR-SUBMODELS-052 | Submodel endpoints change no stored data | VM-SWE-SUBMODELS-020 | Submodel endpoints follow the value profile SSP-003 of CX-0002 | `server/test/submodelRoutes.integration.test.mjs` |
| SwR-SUBMODELS-052 | Submodel endpoints change no stored data | VM-SWE-SUBMODELS-042 | Static submodel server answers as the backend's endpoints do | `server/test/submodelRoutes.integration.test.mjs` |
| SwR-TWINS-110 | A new PartInstance twin for a treated battery placed again | VM-SWE-TWINS-035 | New PartInstance, its links and what it takes over | `server/test/shellDescriptor.test.mjs` |
| SwR-TWINS-111 | New PartInstance links each original battery, resolving in the registry | VM-SWE-TWINS-035 | New PartInstance, its links and what it takes over | `tck/CAC-004.tck.mjs` |
| SwR-BACKEND-147 | Notification endpoints offered with HTTP POST only | VM-SWE-BACKEND-040 | Catena-X receiving routes against their specifications | `server/test/lifecycleNotificationRoutes.integration.test.mjs` |
| SwR-BACKEND-148 | Notification answered 200 when accepted, 4xx or 5xx otherwise | VM-SWE-BACKEND-040 | Catena-X receiving routes against their specifications | `server/test/lifecycleNotificationRoutes.integration.test.mjs` |
| SwR-AUDIT-045 | Dataset write decisions recorded with the authorisation relied on | VM-SWE-AUDIT-011 | Passport dataset, authorisation and disposal records | `server/test/audit.integration.test.mjs` |
| SwR-ACCESS-088 | Passport dataset writes only by the responsible or authorised operator | VM-SWE-ACCESS-022 | Access decisions on the passport dataset and its records | `server/test/passportRoutes.integration.test.mjs` |
| SwR-CXCLIENT-059 | Notifications built to CX-0151 and sent as JSON POST | VM-SWE-CXCLIENT-011 | Notification content, transport and receiving assets | `server/test/messageHeader.test.mjs` |
| SwR-CXCLIENT-110 | Recycling withdraws the passport dataset offers | VM-SWE-CXCLIENT-015 | Passport dataset offers and their hand-off | `server/test/offerPublisher.integration.test.mjs` |
| SwR-CXCLIENT-111 | End of a recycled battery's passport made known to the provider | VM-SWE-CXCLIENT-015 | Passport dataset offers and their hand-off | `server/test/notificationPlan.test.mjs` |
| SwR-CXCLIENT-111 | End of a recycled battery's passport made known to the provider | VM-SWE-DATASET-033 | Hand-off to the designated provider through the operator's interface | `server/test/notificationPlan.test.mjs` |
| SwR-BGWORK-010 | Lifecycle notifications sent unchanged as JSON POST through the connector | VM-SWE-BGWORK-005 | Notification dispatch and its triggers | `server/test/outboxWorker.integration.test.mjs` |
| SwR-BGWORK-020 | End of a recycled battery's passport sent in time | VM-SWE-BGWORK-006 | Time-bound propagation jobs with a fixed clock | `server/test/outboxWorker.integration.test.mjs` |
| SwR-RDB-007 | Dataset writes only by the responsible or an authorised operator | VM-SWE-RDB-005 | Dataset writes by responsible and authorised operators only | `server/test/databaseRules.integration.test.mjs` |
| SwR-RDB-073 | Timeline of responsible economic operators held per passport | VM-SWE-RDB-035 | Responsible operator timeline, waste successor and manufacturer | `server/test/databaseRules.integration.test.mjs` |
| SwR-RDB-074 | Change to waste refused without a named successor | VM-SWE-RDB-035 | Responsible operator timeline, waste successor and manufacturer | `server/test/databaseRules.integration.test.mjs` |
| SwR-RDB-075 | Manufacturer held in each passport record and never empty on write | VM-SWE-RDB-035 | Responsible operator timeline, waste successor and manufacturer | `server/test/databaseRules.integration.test.mjs` |
| SwR-CXCLIENT-166 | Point 4 offer for the passport issuer gated by a recorded contract | VM-SWE-CXCLIENT-022 | Point 4 offer to the issuer gated by the contract record | `server/test/issuerContracts.integration.test.mjs` |
| SwR-CXCLIENT-167 | Issuer's negotiation for point 4 information run without a user step | VM-SWE-CXCLIENT-023 | Automatic negotiation of the issuer's point 4 contract | `server/test/issuerContracts.integration.test.mjs` |
| SwR-CXCLIENT-168 | Point 4 transfer to the issuer stored without a user step | VM-SWE-CXCLIENT-024 | Automatic transfer and storage of the issuer's point 4 information | `server/test/issuerContracts.integration.test.mjs` |
| SwR-DATASET-190 | Passport rows written only under the responsible operator's context | VM-SWE-DATASET-054 | Passport writes only under the responsible operator's context | `server/test/databaseRules.integration.test.mjs` |
| SwR-DATASET-191 | Waste step records the named successor, never the actor as manufacturer | VM-SWE-DATASET-055 | Producer of the current passport recorded at the waste status | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-192 | Lineage step writes no link into an original passport row | VM-SWE-DATASET-056 | No link written into an original row by the lineage step | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-193 | New passport served under its own DPP Metadata identifier | VM-SWE-DATASET-057 | New passport's DPP Metadata identifier | `server/test/submodelRoutes.integration.test.mjs` |
| SwR-DATASET-194 | Remanufacturing donor accepted for the waste status | VM-SWE-DATASET-058 | Remanufacturing donor accepted for the waste status | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-195 | Direct re-use recorded as a purchaser change, never as a lineage step | VM-SWE-DATASET-059 | Direct re-use recorded as an ownership event | `server/test/accessRecords.integration.test.mjs` |
| SwR-DATASET-196 | Direct re-use leaves the responsible operator unchanged | VM-SWE-DATASET-060 | Direct re-use keeps the responsible operator | `server/test/accessRecords.integration.test.mjs` |
| SwR-ACCESS-127 | Purchaser for point 4 access taken from the open access record | VM-SWE-ACCESS-037 | Purchaser taken from the open ownership interval | `server/test/accessRecords.integration.test.mjs` |
| SwR-TWINS-154 | New PartInstance twin registered for a new passport, originals untouched | VM-SWE-TWINS-045 | New twin for a new passport, original twins untouched | `server/test/shellDescriptor.test.mjs` |
| SwR-CXCLIENT-176 | NewPassportIssued sent to each original passport's data provider under contract | VM-SWE-CXCLIENT-032 | NewPassportIssued to each original data provider under contract | `server/test/notificationPlan.test.mjs` |
| SwR-DATASET-197 | Forward link added on the original data provider's request | VM-SWE-DATASET-061 | Forward link added on the original operator's request | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-198 | Successors record served as a submodel of its own | VM-SWE-DATASET-062 | Successors record served as its own submodel | `server/test/submodelRoutes.integration.test.mjs` |
| SwR-CXCLIENT-177 | Second-life battery's point 4 offer to the original data provider | VM-SWE-CXCLIENT-033 | Second-life point 4 offer to the original data provider | `server/test/issuerContracts.integration.test.mjs` |
| SwR-ACCESS-129 | Previous holder's point 4 access ends with the closed access record | VM-SWE-ACCESS-039 | Previous holder denied after the sale | `server/test/accessRecords.integration.test.mjs` |
| SwR-DATASET-199 | Direct re-use leaves the battery status unchanged | VM-SWE-DATASET-063 | Direct re-use keeps the battery status | `server/test/accessRecords.integration.test.mjs` |
| SwR-CXCLIENT-178 | PassportEnded sent to the data provider, nameplate manufacturer and successor | VM-SWE-CXCLIENT-034 | PassportEnded to the three receivers of decision D16 | `server/test/notificationPlan.test.mjs` |
| SwR-CXCLIENT-179 | PassportEnded may be sent to predecessor data providers under contract | VM-SWE-CXCLIENT-035 | PassportEnded to predecessor data providers under contract | `server/test/notificationPlan.test.mjs` |
| SwR-CXCLIENT-180 | BatteryRepaired sent to the data provider of the repaired battery's passport | VM-SWE-CXCLIENT-036 | BatteryRepaired to the passport's data provider | `server/test/notificationPlan.test.mjs` |
| SwR-CXCLIENT-181 | BatteryBecameWaste sent to the data provider and the named successor | VM-SWE-CXCLIENT-037 | BatteryBecameWaste to the data provider and the successor | `server/test/notificationPlan.test.mjs` |
| SwR-CXCLIENT-182 | Lifecycle record offer restricted to purchaser, operators and authorities | VM-SWE-CXCLIENT-038 | Lifecycle record offer restricted to the named BPNLs | `server/test/offerPublisher.integration.test.mjs` |
| SwR-CXCLIENT-183 | Sender's record of a receiver without an asset or a contract | VM-SWE-CXCLIENT-039 | Record of a receiver without an asset or contract | `server/test/notificationSender.integration.test.mjs` |
| SwR-CXCLIENT-184 | Notification plan holds one notification per receiver and passport | VM-SWE-CXCLIENT-040 | One notification per receiver and passport in the plan | `server/test/notificationPlan.test.mjs` |
| SwR-DATASET-200 | Passport rows written only in the data provider's deployment | VM-SWE-DATASET-064 | Passport writes only by the data provider | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-201 | End of the passport exempt from the successor authorisation check | VM-SWE-DATASET-065 | End entry written without the successor's authorisation | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-202 | Repair entry stored with the repair certificate's catenaXId | VM-SWE-DATASET-066 | Repair entry with its certificate reference | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-203 | Successor, role and date stored with the waste status | VM-SWE-DATASET-067 | Successor, role and date stored at the waste status | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-204 | Recycling date and recycler stored as the end of the passport | VM-SWE-DATASET-068 | End-of-passport entry stored | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-205 | Original passport's status kept when a new passport supersedes it | VM-SWE-DATASET-069 | Original status kept after NewPassportIssued | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-206 | Lineage step requires the treated battery's four performance values | VM-SWE-DATASET-070 | Lineage step refused without the four values | `server/test/lifecycleService.integration.test.mjs` |
| SwR-DATASET-207 | Received notification applied only through its operation's step | VM-SWE-DATASET-071 | Notification applied only through its step | `server/test/lifecycleService.integration.test.mjs` |
| SwR-BACKEND-206 | Lifecycle notification failures answered with envelope and result object | VM-SWE-BACKEND-052 | Answers of the lifecycle notification operations | `server/test/lifecycleNotificationRoutes.integration.test.mjs` |
| SwR-BACKEND-207 | Four lifecycle notification operations received as POST endpoints | VM-SWE-BACKEND-053 | Four POST endpoints of the lifecycle notification API | `server/test/lifecycleNotificationRoutes.integration.test.mjs` |
| SwR-DATASET-208 | Database trigger refuses a change of a passport's manufacturer | VM-SWE-DATASET-072 | Database trigger refuses a change of a passport's manufacturer | `server/test/databaseRules.integration.test.mjs` |

## 18. Gate evidence

Each item of the checklist has its section: the header (the table at the top of the document); how to read (§1); goal (§2); scope (§3); users and success measures (§4); requirements (§5); files to read (§6); files to write (§7); deletions (§8); sources of truth (§9.1); architecture (§9.2, §9.3, §9.4, §9.6, §9.7 and §9.8, where the column "Endpoint id" of §9.3 stands for the test id column, because the specification has no screen); strings (§9.5); data contract (§10); decisions (§12); notes for the implementer (§13); tests (§14); done when (§15); import dependencies and cutover order (§16); traceability (§17); gate evidence (§18).

- **Checker command**, in a POSIX shell at the repository root: `node scripts/spec-gate-check.mjs docs/architecture/implementation_plan.md --src . --screens-heading "Interfaces" --id-column "Endpoint id" --testid-prefix "EP-"`
- **Checker results**: `result: PASS` on 2026-11-16, 2026-11-17 and 2026-11-19 for each of the versions 1 to 14, each against the working tree of this repository with that version of this document.
- **Registry check, version 14**: a script compared every requirement, measure and decision identifier and every title of this document with the registry of `requirements/` at the commit 1cebba6 on 2026-11-19: 0 unknown identifiers and 0 titles that differ.
- **Annex check, version 14**: `node scripts/check-annexes.mjs --require P5` reports 29 annex files, each equal to the file of the repository at the commit 1cebba6, and a script compared the prose with the annexes on 2026-11-16: the 17 tables of §9.4.1, the 37 trigger names and the 16 function names of §9.4.2, the 12 policy names and the column privileges of §9.4.3, the 12 refusal ids of the database, the property names of the header and of the four contents of §10.1, and the property names of sections 3.2.2, 3.3 and 3.4.2 of the proposal equal the names of the files of §20, §21 and §22: 0 differences.
- **Independent review**: a reviewer that is not the author reviewed version 2 against the commit e767993 and raised 64 findings (5 blocking, 31 major, 28 minor). The author verified each finding against the texts and found none wrong. Version 3 closed each finding by a change, as the first table states. A second reviewer that is not the author reviewed version 3 and raised 36 findings (2 blocking, 20 major, 14 minor), three of which reopen findings of the first review (R2-010, R2-020 and R2-026). The author verified each finding against the texts and found none wrong. Version 4 closed each finding by a change, as the second table states. A third reviewer that is not the author built phases P1 to P3 from version 4 on a scratch copy and raised 19 findings (1 blocking, 6 major, 12 minor). The author verified each finding against the texts and against the SQL files and the outputs of the reviewer, and found none wrong. Version 5 closed each finding by a change, as the third table states. A fourth reviewer that is not the author copied the 27 annex files of version 5 into a scratch tree, ran them, and attacked the database under a login as the role `refserver_app`, and raised 15 findings (1 blocking, 3 major, 11 minor). The author repeated the run of each finding and found none wrong. Version 6 closes each finding by a change, as the fourth table states, and the author ran every changed annex file again: the three migration files on PostgreSQL 17.12 with the six lifecycle scenarios, the refusals of §14.2 and the three temporary table attacks under a login as `refserver_app`; the eight schema files with Ajv in strict mode; the OpenAPI file with Spectral 6; and the validation script with the SAMM command line tool. A fifth reviewer that is not the author attacked the database of version 6 under a login as the role `refserver_app`, listed the attacks that the database withstood, and raised 15 findings (2 blocking, 1 major, 12 minor). The author repeated the run of each finding and found none wrong. Version 7 closes each finding by a change, as the fifth table states, and the author ran the three migration files again on PostgreSQL 17.12: the legitimate sequences of the reviewer, the two blocking runs, every race at the three isolation levels, and the attacks that the reviewer listed as withstood. The owner approved version 7 on 2026-11-16, and the implementer executed phases P1 to P3 from version 7: 479 tests pass, and the 28 annex files equal the files of the repository. The execution found eight defects of the text, which the sixth table lists. Version 8 corrects each defect in the text and changes no annex file. The author verified the two facts of the first correction and the reachability of the refusal sentences of the fourth correction by a run on PostgreSQL 17.12. Version 9 adds the tests of three modules of phase P4 by the owner's order of 2026-11-17, as the seventh table states. An independent reviewer reviewed the code of phases P4 and P5 at the commit 7a5f6fb and raised 20 findings (3 blocking, 3 major, 14 minor), and the implementer of the two phases reported eight differences between the text and the code. Version 10 closes each finding and each difference, as the eighth table states, and records the owner's three decisions of 2026-11-19. The execution of phases P4, P5 and P6 found 22 differences between the text of version 10 and the code, which the ninth table lists; version 11 records each difference and changes no annex file. The first part of phase P7 verified the connector values of Tractus-X EDC 0.13.0 and found seven findings, and the owner decided three points; version 12 records each item, as the tenth table states. The first run of the second part of phase P7 stopped at the check of the wallet stub, and the owner decided three points; version 13 records each item, as the eleventh table states. The second run of phase P7 passed 44 of 71 conformance subtests across connectors, and the owner decided three points; version 14 records each item, as the twelfth table states. No reviewer has reviewed the versions 8 to 14.

| Finding | Severity | How version 3 closes the finding | Section |
|---|---|---|---|
| R2-001 | blocking | the substrate is the commit c73f787; the tables of §5 are built from the registry at that commit; §5.7 lists the applied registry texts and only the open ones; the owner's acceptance of version 2.1.0 of the uuid model is recorded | header, §5, §5.7, D32 (The stored shared models) |
| R2-002 | blocking | the data provider records the end after PassportEnded from every status; the constraint that required the waste status is removed; the case is a test | D20 (The end of a passport from every status), §10.4, §9.4.1, §14.3 |
| R2-003 | blocking | the migration grants the usage of the schema; the pool sets the search path on every connection; `migrate` creates the schema; the schema name is validated | §9.2.8, §9.4.3, §9.6 |
| R2-004 | blocking | four variables hold the own company record, and the start writes the record | §9.2.1, §9.6 |
| R2-005 | blocking | SyR-LIFE-129 (Producer of the current passport takes over a waste battery's passport) is marked as not met by D17 (The named waste successor); §5.7 holds the old and the proposed statement and the two measures; decision Q-1007 (which producer takes over the passport of a second-life battery that becomes waste) is in §5.5 | §5.1, §5.5, §5.7, D17 |
| R2-006 | major | the access decision is a table per aspect key; an access record holds no access group | §9.2.4, §9.4.1, §10.2 |
| R2-007 | major | a later payload is checked against the current access map; the check covers the seven IDTA-02035 aspect keys | §9.2.4, D45 (The data provider's check of a new payload) |
| R2-008 | major | D3 (The access map and the whole aspect) states the consequence for the nameplate and for the recycler, and the rule waits for the owner | D3, §10.3, §19.1 |
| R2-009 | major | `facilityBpns` is required in both requests; a null governed value removes an optional element | §10.2, §9.4.1, §10.6 |
| R2-010 | major | the manufacturer name is served as the list of the stored schema; the tests validate each served stored payload | §10.6, §14.2 |
| R2-011 | major | the two tests store the ten payloads and assert the descriptors and the absence of passport links outside the lifecycle payload; D28 (Supplied payloads) states that the server does not refuse a passport without a payload | §14.3, D28 |
| R2-012 | major | the repairer's deployment checks the registered certificate twin through the twin registry contract before the notice | D48 (The repair certificate before the notice), §10.3, §14.3 |
| R2-013 | major | the receiver resolution is a contract with an in-process and a connector implementation; no test is skipped | D11 (The receiver resolution behind a port), §9.2.5, §14.3 |
| R2-014 | major | the sender repeats a failed transport with the same message identifier, and an endpoint starts a further series | D49 (The retry of a failed transport), §9.2.5, §9.3 |
| R2-015 | major | §9.3 names the refresh of the shell and of the offers after each step | §9.3, §9.2.5, D23 (The exposure after the commit) |
| R2-016 | major | SwR-DATASET-126 (Lifecycle data delivered beside the seven aspects in the decided carrier) is marked as partly met, and phase P8 sets the state `partial` | §5.2, D46 (The partial delivery of the lifecycle data), §11.8 |
| R2-017 | major | the authorisation holds a period that the executor and the trigger read; §5.7 lists the remaining difference to the four statements | D18 (The successor's authorisation with its period), §9.4, §5.7 |
| R2-018 | major | each predecessor names its original model; a battery model that references none of them is refused; a test asserts the rule | D35 (The reference to the original battery model), §9.2.2, §14.2 |
| R2-019 | major | §5.5 states the assumption on each of the four open decisions | §5.5, §19.1 |
| R2-020 | major | §17.2 maps each measure to its test; §5.7 lists the measures that differ from the design | §17.2, §5.7 |
| R2-021 | major | `tck/package-lock.json` is planned, and the packages of the test kit are named | §7, §11.6, D37 (The packages) |
| R2-022 | major | §9.5 maps each database refusal and each SQLSTATE, and holds the missing refusals | §9.5 |
| R2-023 | major | a write on a passport that the deployment does not hold answers 404; the refusal with the status 403 is the answer to a refused row | D6 (One deployment, one company, one writer), §9.5, §14.3 |
| R2-024 | major | one wire form of the catenaXId with its pattern and its conversion | D50 (Every admitted form of an identifier accepted, one form sent), §9.2.1, §10.1 |
| R2-025 | major | every transaction of the server acts as the own company | §9.2.8 |
| R2-026 | major | the sender and the puller claim one row per transaction with a row lock; the worker never overlaps itself; the receiver inserts with a conflict clause | §9.2.5, §10.4 |
| R2-027 | major | the test files run one after the other, each in schemas of a stated name; the role is created once under an advisory lock, outside the migrations | §14.1, §9.2.8 |
| R2-028 | major | `startBinding` takes the regime and the passport service provider as options, and the connector binding starts the servers again per test file | §9.2.9 |
| R2-029 | major | §11.2 holds the exact commands, the directory below `tools/`, the download address and the script | §11.2, §7 |
| R2-030 | major | §9.2.6 defines each field of a submodel descriptor; two configuration variables hold the two addresses | §9.2.6, §9.6, §6 |
| R2-031 | major | phase P7 starts with the owner's naming of the connector release, and phases P1 to P6 use no value of the release | §11.7, §10.7 |
| R2-032 | major | the executor writes a local received record for an own predecessor and checks the stored status of an own predecessor | §9.2.2, D12 (No notification to the own company), D13 (Predecessors of another data provider) |
| R2-033 | major | D41 (Authentication without an identity provider) states the threat of the partner authentication and its five bounds | D41, §11.8 |
| R2-034 | major | D47 (The access to the notification asset) states the threat of the open asset and its bound; §14.4 maps the 14 lessons to tests | D47, §14.4 |
| R2-035 | major | the server connects as a role without ownership and without a deletion privilege | D24 (Two database roles and row-level security), §9.2.8, §9.4.3 |
| R2-036 | major | §9.8 lists each package, tool and image with its licence, and a script checks the installed packages | §9.8 |
| R2-037 | minor | D29 (The access regime and the admitted roles) is a table of regime, aspect key and admitted roles | D29 |
| R2-038 | minor | D38 (The sharing of individual battery information) states the basis of the offer under both regimes | D38 |
| R2-039 | minor | a content with a further property answers the status 422 | §10.4, §9.5 |
| R2-040 | minor | the table entry of SwR-TWINS-111 (New PartInstance links each original battery, resolving in the registry) names the lifecycle record reader | §5.2 |
| R2-041 | minor | D34 (The passport service provider as a receiver) states the behaviour without the variable, and the test runs with the variable | D34, §14.3 |
| R2-042 | minor | §10.1 states the header schema property by property and the stored texts that the schema follows | §10.1 |
| R2-043 | minor | the test asserts one record of the audit table per decision | §14.2 |
| R2-044 | minor | each operation defines the response 401 | §10.1 |
| R2-045 | minor | §13.1 names the modules that read the environment, and the health query is a function of the database modules | §13.1, §9.2.8, §15 |
| R2-046 | minor | §9.4.3 lists the seven table names | §9.4.3 |
| R2-047 | minor | `docs/proposals.md` is modified in P2 and in P8; the workflow gains the steps of the test kit in P6 | §7, §9.7 |
| R2-048 | minor | the three signatures name every dependency | §9.2.5, §9.2.8 |
| R2-049 | minor | a deferred trigger on the insert of a passport checks the one open interval | §9.4.2 |
| R2-050 | minor | §9.2.3 states the token rules, and the test holds the cases | §9.2.3, §14.2 |
| R2-051 | minor | §9.2.2 states the purpose records and the comparison rule | §9.2.2 |
| R2-052 | minor | `readAccessMap` has a tie rule, a result without a version and an injected date | §9.2.4 |
| R2-053 | minor | D23 covers the two creation endpoints, and an endpoint repeats the registration of a PartType twin | D23, §9.3 |
| R2-054 | minor | the audit record is written after the transaction has ended and its client is released; the pool size has a lower bound | §9.2.7, §9.6 |
| R2-055 | minor | the date of putting into service is optional for a first passport | §9.4.1, §10.2 |
| R2-056 | minor | a reused message identifier of another sender or content is refused | §10.4, D8 (Idempotency by the message identifier) |
| R2-057 | minor | the token subject and the authorisation reference hold no name of a person; the unused field is removed | §9.2.3, §10.2 |
| R2-058 | minor | the two marks are corrected, and the patterns of the stored shared model are used | §10.1, §10.6, §9.2.1 |
| R2-059 | minor | §7 states the header of the two files | §7 |
| R2-060 | minor | the five sentences have a named subject and a verb | §9.3, §10.1, §10.4 |
| R2-061 | minor | the lists of §13 and §16 name the implementer as the subject | §13, §16 |
| R2-062 | minor | each decision has a title, and each decision, criterion, standard and element carries its title at its first mention in a section | §12, whole document |
| R2-063 | minor | §1 spells out each abbreviation | §1 |
| R2-064 | minor | the cells and the two sentences state their value and their mechanism | §10.5, D35, §9.2.5 |

| Finding of the second review | Severity | How version 4 closes the finding | Section |
|---|---|---|---|
| R3-001 | blocking | the migration grants the reading of the migration table to the application role, and a test asserts the reading and the refused insert | §9.4.3, §14.2 |
| R3-002 | blocking | the licence script reads one `package.json` per package of the lock file and evaluates an SPDX expression; a test holds the nested file without a licence | §9.8, §14.2 |
| R3-003 | major | the first interval starts at a business date; the constraint admits an interval of no length; the waste step refuses a date before the start | §9.2.2, §9.4.1, §10.4 |
| R3-004 | major | one clock in UTC; the transaction passes the date to the database, and the trigger reads the setting | D53 (One clock in UTC), §9.2.8, §9.4.2 |
| R3-005 | major | the test role is a superuser, the test support fails fast otherwise, and §9.2.8 states the effect of the forced policies on the owner | §11.3, §14.1, §9.2.8 |
| R3-006 | major | the test of each policy and of each trigger has an accepted and a refused statement with its client, its SQLSTATE and its refusal id | §14.2 |
| R3-007 | major | the executor and the step check lock the passport, and the child trigger reads the passport with a share lock; a test overlaps two transactions | §9.2.2, §9.4.2, §10.4, §14.2 |
| R3-008 | major | the pool states its type parsers and its time zone, and a test runs in a time zone east of UTC | §9.2.8, §14.2 |
| R3-009 | major | the owner decided D18, D35 and D40 (The admission rule); a later decision arrives as a new migration file or a new model version; the closing sentence of §19.1 is corrected | §12.1, §1, §19.1 |
| R3-010 | major | the public schemas carry the pattern of the stored shared model, and the server normalises | D50, §10.1, §9.2.1, §5.7 |
| R3-011 | major | every test command names the reporter `tap` | §11.0, §14.1, §15 |
| R3-012 | major | Node.js, Java and PostgreSQL run in containers of three named images, with one form of each command | D52 (The tools in containers), §11.0, §13.1 |
| R3-013 | major | §5.7 lists the 32 measures that name the role of another design, and §1 tells the implementer not to stop for a listed difference | §5.7, §1 |
| R3-014 | major | the item form of the manufacturer name is a decision with its mark; the unsupported sentence is removed | D51 (The form of a manufacturer name item), §10.6 |
| R3-015 | major | the table of the receiving checks is written in the executed order | §10.4 |
| R3-016 | major | the data provider's deployment sends the notice to the passport service provider | D34, §10.3, §10.4 |
| R3-017 | major | an asset is registered for every descriptor, and an empty list admits no participant | §9.2.5, §10.5 |
| R3-018 | major | §10.3 states the passport identifier of each record, and §9.2.2 states the content of the local record | §10.3, §9.2.2 |
| R3-019 | major | §9.3 states the body parser, its limit and the mapping of its errors, and the OpenAPI file declares the response 413 | §9.3, §9.5, §10.1 |
| R3-020 | major | a tag marks every sentence that rests on a waiting decision, with the rule for the implementer | §1, §13.2, §19.1 |
| R3-021 | major | the eight values are stated: the audit actions, the start of the successor's access record, the retry time, the two identity parameters, the answers of the access record endpoints, the contract without a payload, the memory binding outside a test, and the access map key on the submodel endpoint | §9.2.7, §10.4, §9.2.5, §9.3, §9.2.1, §9.2.4 |
| R3-022 | major | the connector binding uses a new schema per test file and removes its assets and shells; §7 states the build context and the copied folders of the image; a capable model executes phase P7 | §9.2.9, §7, §11.7 |
| R3-023 | minor | the default of the server variable, the licence object and the absence of a security scheme are stated | §10.1 |
| R3-024 | minor | the names of the characteristics, the payload names, the metadata of the aspect, the exit rule of the script, the extraction of the two examples and the own values of the successors example are stated | §10.6, §11.2, §14.2 |
| R3-025 | minor | the constraint refuses a last day without an authorisation | §9.4.1 |
| R3-026 | minor | the four performance values carry the bounds and the steps of their columns | §10.2 |
| R3-027 | minor | the rule after the end precedes the rule after the waste status in the executor and in the database; the lineage check states what the check reads | §9.2.2, §9.4.2 |
| R3-028 | minor | the role creation runs in one transaction with a transaction lock and accepts an existing role | §9.2.8 |
| R3-029 | minor | a trigger refuses a lineage link for a passport of an earlier transaction | §9.4.2 |
| R3-030 | minor | the three counts are inspection aids, and the test is the proof | §11.3 |
| R3-031 | minor | a predecessor named twice is refused by the identifier rule | §9.2.2, §9.5 |
| R3-032 | minor | the successor of the recycling report is optional | §10.2, §10.3 |
| R3-033 | minor | the declared original purpose is defined, and the executor compares the declared value with the stored value | §9.2.2 |
| R3-034 | minor | the duplicate check compares the sender, the context and the content | §10.4 |
| R3-035 | minor | the public reading needs one entry or more, and a new payload is checked against every later map version | §9.2.4 |
| R3-036 | minor | the change of purchaser opens the records of every aspect key that holds the battery status | D30 (The change of purchaser) |

| Finding of the third review | Severity | How version 5 closes the finding | Section |
|---|---|---|---|
| R4-001 | blocking | group (e) of the database rule test states, per table, the grant, the trigger order and the error that PostgreSQL returns | §14.2, §9.4.2 |
| R4-002 | major | the lineage rule uses a column that the insertion sets and the executor clears; the bypass case and the savepoint case are tests, and the author ran both | D54 (The lineage of a new passport is open only inside its own transaction), §9.4.2, §22, §14.2 |
| R4-003 | major | group (b) names the one foreign key that no statement reaches, the column name of a NOT NULL refusal and the two domain constraints | §14.2, §9.4.1 |
| R4-004 | major | §11.2 states the observed sub-commands of the tool; the script uses `to schema` and creates each `gen` folder; the author ran the script | §11.2, §21 |
| R4-005 | major | `.gitattributes` is a file of phase P1, with the step of the renormalisation | D57 (Line endings), §7, §11.1, §20 |
| R4-006 | major | the header schema holds the enumeration of the four contexts, and the envelope definition of each operation fixes its context as a constant | D56 (One schema file for the envelope, and the context as a constant), §10.1, §20 |
| R4-007 | major | one schema file defines the envelope; the OpenAPI file references the file; the first check of the receiving step refuses a body with a third property | D56, §10.1, §10.4, §20 |
| R4-008 | minor | the registry line is stated per environment, and the line of the Ubuntu runner is the gate | D59 (The registry check per environment), §11.0, §15, §9.7 |
| R4-009 | minor | the trigger reads the setting through `NULLIF`, and the behaviour of an absent, an empty and a wrong setting is stated and tested | §9.4.2, §22, §14.2 |
| R4-010 | minor | the database ties the waste date and the recycling date to the responsibility intervals | D55 (The dates of the waste status and of the end are rules of the database), §9.4.1, §9.4.2, §10.4 |
| R4-011 | minor | a trigger freezes the responsibility intervals of an ended passport | D55, §9.4.2 |
| R4-012 | minor | a passport identifier has no upper limit in the public schemas | §10.1, §20 |
| R4-013 | minor | the server asserts the format of a date and time, and the test holds the failing cases | §10.1, §14.2 |
| R4-014 | minor | the annex prints the OpenAPI file and the schema files with every description, summary, tag and rule for further properties | §20, §10.1 |
| R4-015 | minor | the annex prints the three model files, the metadata files and the release notes with the headers | §21, §10.6, §7 |
| R4-016 | minor | the done-when signal of phase P2 and the workflow generate the schemas and compare them with the commit | §11.2, §9.7, §15 |
| R4-017 | minor | the eight groups are named top-level tests; the test sets the time zone in its first statement; the licence fixture is built at run time; the script has its entry guard; the annex gives the sentence of each refusal | §14.2, §11.3, §22 |
| R4-018 | minor | the private reference check excepts the one expression inside the two lock files, and every other hit is a finding | §11.1 |
| R4-019 | minor | two named volumes hold the installed packages outside the repository folder | §11.0 |

| Finding of the fourth review | Severity | How version 6 closes the finding | Section |
|---|---|---|---|
| R5-001 | blocking | every function has the fixed search path `<schema>, pg_temp`; the migration revokes the privilege `TEMPORARY` from PUBLIC and stops when the role holds the privilege or the privilege `CREATE` of a schema; the three attacks are refused cases of the tests, and the catalogue test reads `proconfig` | D60 (A fixed search path for every function, no temporary table for the application role, and a database of its own), §9.4.2, §9.4.3, §22, §14.2 |
| R5-002 | major | the function `check_child_after_waste` and its five triggers hold the rule after the waste status for the records of a passport; §9.4.2 lists the covered tables and the admitted writes | D61 (The rule after the waste status covers the records of the passport), §9.4.2, §22, §14.2 |
| R5-003 | major | the trigger `trg_passport_identity` refuses an update that removes one of the five values from a passport with a lineage link | D61, §9.4.1, §9.4.2, §22, §14.2 |
| R5-004 | major | one module builds the compiler of the draft-04 schemas in strict mode with the two keywords; the annex prints the module, and phases P2 and P4 use the module | D64 (The generated schemas outside `models/`, and one compiler of the draft-04 schemas), §10.6, §21, §14.2 |
| R5-005 | minor | the helper function `app_today` admits only a text of the form `YYYY-MM-DD` that names a calendar date; the date words are refused cases of the tests | D53, §9.4.2, §22, §14.2 |
| R5-006 | minor | the two functions read the setting after the two early returns, so a wrong setting changes nothing for a passport that is not waste, and an ended passport is refused with `ERR-DB-PASSPORT-ENDED` | §9.4.2, §22, §14.2 |
| R5-007 | minor | the decision on the two roles states the bound of the two settings, where the specification relies on one company per deployment, and what protects the credentials | D24 |
| R5-008 | minor | a passport references a battery model of its own manufacturer; three further tables have a policy; the residual existence signal is stated | D63 (References across the bound of a company), §9.4.1, §9.4.3, §22, §14.2 |
| R5-009 | minor | an interval is inserted open and at the end of the timeline, by a trigger and without an extension | D62 (The responsibility timeline is determined by the passport), §9.4.2, §22, §14.2 |
| R5-010 | minor | group (c) names the eight triggers that have only an accepted or only a refused statement, and states their cases | §14.2 |
| R5-011 | minor | the two done-when items of phase P2 are replaced by a checksum comparison of two runs and by `git check-ignore` | §11.2 |
| R5-012 | minor | `.gitattributes` names the shell scripts, the script states its line endings, and a done-when item proves the line endings in the working tree | §11.2, §20, §21 |
| R5-013 | minor | the twelve properties of the envelope file carry a description, and the test asserts a description on every property | §20, §14.2 |
| R5-014 | minor | each property with a date and time carries a pattern that requires the letter T, beside the format | §10.1, §20, §14.2 |
| R5-015 | minor | the folders of `models/` hold exactly the files of a stored Tractus-X namespace; the generated schemas and the example payloads are files of `docs/api/aspects/` | D64, §10.6, §7, §21 |

| Finding of the fifth review | Severity | How version 7 closes the finding | Section |
|---|---|---|---|
| R6-001 | blocking | one function and nine triggers refuse an update of `passport_id` on every table with that column; the role holds no UPDATE privilege on the column | D61, D67 (The privilege UPDATE by column), §9.4.2, §9.4.3, §22, §14.2 |
| R6-002 | blocking | every trigger function refuses a transaction that is not at READ COMMITTED; the transaction helper names the level; the pool options name the level; the stored settings of the role are removed, checked and overridden; group (i) of the tests runs the three levels | D66 (Every write runs at the isolation level READ COMMITTED), D24, §9.2.8, §9.4.2, §9.4.3, §22, §14.2 |
| R6-003 | major | group (b) names the three constraints that only the catalogue proves and asserts the refusal that precedes each; group (g) reaches the unique index of the open interval with two sessions | §14.2 |
| R6-004 | minor | the named successor, its role and the waste date never change after the waste status; the decision waits for the owner | D65 (The named waste successor is permanent), §9.4.2, §19.1, §22 |
| R6-005 | minor | the timeline is determined by the passport, without a gap; every date and time is finite; the executor refuses a date of the future | D62, D68 (Finite dates and no NaN), §9.2.2, §9.4.1, §9.4.2, §10.4, §22 |
| R6-006 | minor | the helper casts the text with its own `DateStyle` and refuses the month 00, the day 00 and the year 0000; the accepted range is stated | D53, §9.4.2, §22, §14.2 |
| R6-007 | minor | the two constraints of the numeric columns without an upper bound name the value `NaN` | D68, §9.4.1, §22, §14.2 |
| R6-008 | minor | the chosen value of an identity column is an accepted and stated residual effect on availability | D24, §14.2 |
| R6-009 | minor | the role holds the privilege UPDATE by column, as the table of §9.4.3 states | D67, §9.4.3, §22, §14.2 |
| R6-010 | minor | the role takes no table lock above ROW EXCLUSIVE; the bound states the password, the stored settings and the advisory lock with the action of the administrator | D24, D67, §9.2.8, §9.4.3, §11.8 |
| R6-011 | minor | the second existence signal, on the identifier of a battery model, is stated and tested | D63, §9.4.3, §14.2 |
| R6-012 | minor | the paragraph on the order of the triggers states the first refusal per table and per statement | §9.4.2, §14.2 |
| R6-013 | minor | every migration file ends with the block that fixes the search path; the rule for a later file is stated; the catalogue test covers every function | D60, §9.2.8, §9.4.2, §22, §14.2 |
| R6-014 | minor | the passport identifier of a stored passport has 1 to 200 characters, the bound of the operator schemas | §9.4.1, §22, §14.2 |
| R6-015 | minor | the purposes are append-only by a trigger, for the owner as well | D61, §9.4.2, §22, §14.2 |

| Correction of version 8 | Source | The defect of the text | The correction | Section |
|---|---|---|---|---|
| C8-1 | execution of phase P3 | the text said that `ALTER ROLE refserver_app RESET ALL` removes the stored settings of the role in every database; the statement removes only the settings for every database, and a setting for one database stays | `createAppRole` also runs the statement with `IN DATABASE` for the current database and for each other database with a row, and verifies that no row remains; the check of the migration, the start check, the bound of D24, the administrator guide and the tests state both forms | §9.2.8, §9.4.3, §9.2.1, D24, §11.8, §14.2 |
| C8-2 | execution of phase P2 | `git check-ignore -q` admits one path; one done-when command and one step needed a write of the index | one command per path; the command of the line endings reads the working tree; the implementer writes no index | §11.2 |
| C8-3 | execution of phase P3 | group (c) named five other tables where six exist; the rule of the domains in group (a) did not exclude the table of the runner | the six tables are named; the table `schema_migrations` is excluded with the reason | §14.2 |
| C8-4 | execution of phase P3 | the text did not state that one refusal sentence of the lineage check is unreachable and that another is reached in one order only | the two sentences are stated with the trigger that answers first, and the tests assert what a statement reaches | §9.4.2, §14.2 |
| C8-5 | execution of phase P3 | the generated passwords of the test workflow reached the log through job outputs and through the environment of a service container | one job, a mask before every use, the database started by a step, no job output | §9.7 |
| C8-6 | execution of phase P2 | the registry statement on the three models still names the folder `gen` | the record and its measure are entries of the table of the registry texts that differ from the design | §5.7 |
| C8-7 | execution of phases P1 and P3 | the implementer had to choose the version ranges and three fields of the package file, three exports, the pool size, a return value, the pinned actions and the Business Partner Numbers of the annex examples | the choices are recorded | §7, §9.2.8, §9.7, §10.7, §14.1 |
| C8-8 | execution of phases P1 to P3 | the status named a draft | the status keeps the approval of version 7 and names the corrections that wait for the owner's confirmation | the head table |

| Change of version 9 | Source | The finding | The change | Section |
|---|---|---|---|---|
| C9-1 | the owner's order of 2026-11-17 (section "The tests of the configuration, the logger and the identifier conversions, and phase P4" of the owner's file of §12.1) | §14.2 named the test of the configuration reader with one sentence and named no test of the logger and of the identifier conversions, and the rule of the logger stated no mechanism | the logger replaces the values of a fixed list of field names, at every depth and in every letter case, and writes to an injected stream with an injected clock; the configuration object has one stated property per variable; the identifier conversions throw one stated error; §14.2 holds the cases of the three tests | §7, §9.2.1, §9.6, §14.2, §17.2 |

| Finding or difference of version 10 | Source | The rule of version 10 | Section |
|---|---|---|---|
| R45-001 | review of the code of phases P4 and P5, blocking | the receiving step locks the passport before the duplicate check; a test for each of the four operations | §10.4, D8, §14.2 |
| R45-002 | review, blocking | the sender cleans and cuts a text of a receiver and records a failed write of an attempt in a second transaction | §9.2.5, §14.2 |
| R45-003 | review, major | an answer of the class 5xx is a failed transport that the sender repeats; an answer of the class 4xx is final; the retry endpoint admits `transport_failed` and `receiver_unresolved` | §9.2.5, D49, §14.2 |
| R45-004 | review, major | the audit record after a failed write is queued, and the server answers the true outcome (the owner's decision) | D69 (The audit record after a failed write is queued), §9.2.7, §9.4.4, §23, §14.2 |
| R45-005 | review, blocking | the access map and the payloads of one battery model take one advisory lock; a row lock of `battery_models` is not admitted to the role | §9.2.4, §9.2.2, §14.2 |
| R45-006 | review, major | the refused-write audit is tested through `runWrite` of two routes | §14.2 |
| R45-007 | review, minor | the content type rule is tested on `EP-ASPECT-PUT` and with a valid message as text | §14.2 |
| R45-008 | review, minor | a body that is not a JSON object answers `ERR-LC-BODY-INVALID` before the service | §9.3, §14.2 |
| R45-009 | review, minor | a repeated entry of an access map is refused before any insert | §9.2.4, §14.2 |
| R45-010 | review, minor | a token whose `iat` lies more than 60 seconds ahead is refused | §9.2.3, D41, D72 (The clock tolerance of an operator token), §14.2 |
| R45-011 | review, minor | every client error of the body parser answers the refusal of an invalid body | §9.3, §14.2 |
| R45-012 | review, minor | an unknown path answers `ERR-RX-OPERATION-UNKNOWN` or `ERR-LC-PATH-UNKNOWN` | §9.3, §9.5, §14.2 |
| R45-013 | review, minor | a refresh of an ended passport withdraws the dataset offers; the contract answers carry `exposure` (waits for the owner) | §9.2.5, D23, D73 (The exposure of a battery information offer), §14.2 |
| R45-014 | review, minor | the field `cause` holds one of four fixed texts | §9.2.5, §9.3, §14.2 |
| R45-015 | review, minor | the recycler of PassportEnded equals the sender (the owner's decision) | D70 (The recycler of PassportEnded is the sender), §10.4, §14.2 |
| R45-016 | review, minor | the routes call read functions of the services, and `reportEvent` checks the repair certificate | §9.2.2, §9.2.5, §14.2 |
| R45-017 | review, minor | the composition root handles the error event of the HTTP server and a rejected shutdown | §11.5 |
| R45-018 | review, minor | no done-when signal states a number of test files; §7 is the one list | §11.4, §11.5 |
| R45-019 | review, minor | the concurrency test runs for the four operations | §14.2 |
| R45-020 | review, minor | the in-process binding uses one memory transport per participant over one memory network | §9.2.9, §9.2.5, §14.2 |
| V10-1 | the implementer of phase P4 | the counts of the test files are removed from the done-when signals | §11.4, §11.5 |
| V10-2 | the implementer of phase P4 | the audit trail holds twelve actions | §9.2.7, §14.2 |
| V10-3 | the implementer of phase P4 | an empty access list builds an offer that admits nobody, and the asset stays registered | §14.2 |
| V10-4 | the implementer of phase P4 | a field named `message` at the first level of a log call is not written, and below the first level the field is replaced | §9.2.1 |
| V10-5 | the implementers of phases P4 and P5 | the factories name the parameters that the code needs: `createAuditLog` with `ownBpnl`, `createLifecycleService` with `validator`, `accessMaps`, `companyRepository`, `recordReader` and `twinRegistry`, the sender and the puller with `ownBpnl`, `createMemoryTransport` with `ownBpnl` | §9.2.2, §9.2.5, §9.2.7 |
| V10-6 | the implementer of phase P4 | the six values without a stored text stay marked for phase P7 | §13 |
| V10-7 | the implementer of phase P5 | an error that the resolver or the transport throws is recorded as `transport_failed` | §9.2.5 |
| V10-8 | the implementer of phase P5 | the notification read routes call `listSent` of the sender and `listReceivedNotifications` of the lifecycle service | §9.2.2, §9.2.5 |

| Difference of version 11 | Source | The text of version 11 | Section |
|---|---|---|---|
| V11-1 | execution of phase P5 | the failed-write case of the sender revokes the privilege UPDATE on `receiver_did`, and the case observes `attempts` 1 and the cause `the attempt record failed: sqlstate 42501` | §14.2 |
| V11-2 | execution of phase P5 | the start check of `server/src/index.mjs` reads the four migration names | §9.2.1 |
| V11-3 | execution of phase P5 | the two finite domains type 44 columns in the four files | D68 |
| V11-4 | execution of phase P5 | `migrate` after `createAppRole` returns the names of the third and the fourth file | §14.2 |
| V11-5 | execution of phase P5 | `audit.record` with an empty list resolves to `{ written: true, queued: false }` | §9.2.7 |
| V11-6 | execution of phase P5 | the sender takes `logger`, and `afterCommit` takes `kind` | §9.2.5, §9.3 |
| V11-7 | execution of phase P5 | `EP-CONTRACT-END` of an issuer contract answers `exposure` `{ "refreshed": true }` | D73 |
| V11-8 | execution of phase P5 | the start of the server is logged on the event `listening` only | §11.5 |
| V11-9 | execution of phase P6 | the answer form of `asPartner(reader).get(path)` | §9.2.9 |
| V11-10 | execution of phase P6 | the in-process binding starts each application as `server/src/index.mjs` does, with its own loopback HTTP server and the clock from 2026-06-15T10:00:00Z | §9.2.9 |
| V11-11 | execution of phase P6 | the number of the criterion comes from the file name in `process.argv[1]` | §9.2.9 |
| V11-12 | execution of phase P6 | in the test kit only `tck/lib/binding.mjs` reads `process.env` | §13 |
| V11-13 | execution of phase P6 | the ten payloads and the access map of the scenario | §9.2.9 |
| V11-14 | execution of phase P6 | the four semantic identifiers without a stored text are copies of `ASPECTS`, which CAC-002 (digital twin) compares | §9.2.9 |
| V11-15 | execution of phase P6 | one rule for the Business Partner Number of a market surveillance authority | §10.7 |
| V11-16 | execution of phase P6 | the record of a receiver without an asset: the binding gains the withdrawal of the asset in phase P7 (waits for the owner) | D74 (The binding contract and criterion CAC-012 (notification API)), §9.2.9, §14.3 |
| V11-17 | execution of phase P6 | the descriptive error body: the 405 and 404 answers through the binding and the stored cause; no partner POST (waits for the owner) | D74, §14.3 |
| V11-18 | execution of phase P6 | CAC-003 (model elements) compares `ManufacturerName` with the original and with the fixture | §14.3 |
| V11-19 | execution of phase P6 | the change of CAC-007 (waste status) is `EP-ASPECT-PUT` and `EP-FORWARD-LINK` | §14.3 |
| V11-20 | execution of phase P6 | the exports of `tck/lib/scenario.mjs` | §9.2.9 |
| V11-21 | execution of phase P6 | the test workflow runs the licence check of the test kit, as §15 item 6 states | §9.7 |
| V11-22 | execution of phase P6 | `tck/package.json` holds `description`, `license` and `engines` | §11.6 |

| Item of version 12 | Source | The rule of version 12 | Section |
|---|---|---|---|
| V12-1 | the owner's decision of 2026-11-19, question 1; finding 1 of the verification of phase P7 | the connector binding resolves a receiver through the connector discovery of the own connector; `BPN_DID_RESOLUTION_URL` leaves §9.6 | D75 (The receiver resolution through the own connector), D11, §9.2.5, §9.6, §10.7 |
| V12-2 | the owner's decision of 2026-11-19, question 2; finding 2 | the wallet stub 0.1.0 is the identity of the three local connectors, the first run proves it, and a failure goes to the owner before the contingency | D76 (The wallet stub as the local identity), §10.7 |
| V12-3 | the owner's decision of 2026-11-19, question 3; finding 6 | the local registry runs without OAuth2, and production keeps OAuth2 | D77 (OAuth2 off in the local registry), §10.7, §11.8 |
| V12-4 | finding 3, CX-0160 (Battery Passport) section 4.1 | the `dct:type` of a submodel offer is `cx-taxo:BatteryPass` with the version `1.0` | §10.5, §13.1 |
| V12-5 | finding 4, CX-0160 sections 3.3.3, 3.4.3, 3.7.3 and 3.8.3 | the identifier of IDTA-02035-3 ends with `#CarbonFootprintBattery`, and the other four identifiers are verified | §10.6, §13.1 |
| V12-6 | finding 5, `02_policies.md` lines 97 to 105 at the tag `0.13.0` | every usage policy holds `FrameworkAgreement` and `UsagePurpose` in one `and` conjunction | §9.2.5, §10.5 |
| V12-7 | finding 7 | `server/Dockerfile` copies `docs/api/aspects/` | §7 |
| V12-8 | the verification table of `tck/README.md` | the verified values replace the marks of §9.6 and §10.7 with their public addresses; SingleLevelBomAsBuilt keeps the CX-Titan value by the owner's rule of 2026-10-26 | §9.6, §10.6, §10.7 |
| V12-9 | no text decides | the server holds no credential of the registry, and the connectors use a database image of their own | D78 (No credential of the registry in the server), D79 (A database image of its own for the connectors) |

| Item of version 13 | Source | The rule of version 13 | Section |
|---|---|---|---|
| V13-1 | the owner's decision of 2026-11-19, question 1; result 1 of the first run of phase P7 | one wallet stub for the three companies; the run does not test trust between separate wallets | D80 (One wallet stub for the three companies), D76, §10.7 |
| V13-2 | the owner's decision of 2026-11-19, question 2; result 3 of the first run | the address list resolver for the local deployment, selected by `RECEIVER_RESOLUTION`, bounded by a check, a warning and the administrator guide | D81 (A fixed address list in the local deployment only), §9.2.5, §9.6, §11.8 |
| V13-3 | the owner's decision of 2026-11-19, question 3 | the test-only image of HashiCorp Vault 1.16.1, the list of test images and `NOTICE.md` | D82 (HashiCorp Vault as a test-only image), §9.8, §7 |
| V13-4 | execution of phase P7 | the registry on the database `postgres` of the server's container, with the profile `local`, the PostgreSQL datasource and the owning tenant | §10.7 |
| V13-5 | execution of phase P7 | the one-shot seed service of `TCK_IMAGE_NODE` | §10.7 |
| V13-6 | execution of phase P7 | one setup service builds the server image | §10.7 |
| V13-7 | execution of phase P7 | one meaning of `no_asset` and `contract_refused` for both transports, and one contract test | D83 (One meaning of no_asset and contract_refused), §9.2.5, §14.2 |
| V13-8 | execution of phase P7 | an empty access list registers the asset without policies and without a contract definition | §9.2.5 |
| V13-9 | execution of phase P7 | `publish` replaces an offer through the contract definition; `withdraw` marks an asset of an agreement as withdrawn | §9.2.5 |
| V13-10 | execution of phase P7 | `server/src/index.mjs` imports the resolver of the connector binding that `config.receiverResolution` selects | §9.2.1, §9.2.5 |
| V13-11 | the first run of phase P7 | the confirmed values replace their marks: the discovery request and answer, `DataExchangeGovernance:1.0` with `eq`, `hashicorp/vault:1.16.1`, `registry.authentication` `false` | §9.2.5, §10.7, D77 |
| V13-12 | the open design point of the run | the connector binding on a started deployment, with data of its own per file and three runs (waits for the owner) | D84 (The connector binding on a started deployment), §9.2.9, §15 |

| Item of version 14 | Source | The rule of version 14 | Section |
|---|---|---|---|
| V14-1 | the owner's decision of 2026-11-19, question 1; result 1 of the second run of phase P7 | the connector transport reads the error text of the data plane; a named code of the class 4xx is final | D85 (The error text of the provider data plane), §9.2.5, §14.2 |
| V14-2 | execution of phase P7, result 1 | an answer 500 without a code is `transport_failed` (waits for the owner) | D88 (A data plane answer 500 without a code), §9.2.5, §14.3 |
| V14-3 | the owner's decision of 2026-11-19, question 2; result 2 | `settle()` waits for the sent records of the passports of the calling file | D86 (A test file waits only for its own notifications), §9.2.9 |
| V14-4 | the owner's decision of 2026-11-19, question 3; result 3 | CAC-009 (end of the passport) checks the delay against the record time, and the executor takes one time per step | D87 (The delay checked against the record time), D1 (The delay of the end notice), §14.3 |
| V14-5 | execution of phase P7 | `unique(prefix)` gains a random part drawn once per process | §9.2.9 |
| V14-6 | execution of phase P7 | `openTransfer` and `callDataPlane` belong to the connector binding only; the transfer client and `TransportStep` are exported; the reference is kept for its validity minus 60 seconds; the catalog is asked before every call with `limit` 5000 | §9.2.5, §9.2.9 |
| V14-7 | execution of phase P7, result 2 | the header test asserts an applied notification and the received record with the true sender | §9.2.9 |

## 19. Open points for the owner


### 19.1 Decisions that wait for the owner

Each decision of the table is taken by this specification so that the phases can run, and each sentence that rests on one of them carries the tag `[waits for the owner]`. A different decision of the owner changes the named sections and arrives as a new version of this specification, with a new migration file or a new model version where the decision changes the database or a model.

| Decision | What this specification chose | What another choice changes | Phase affected |
|---|---|---|---|
| D3 (The access map and the whole aspect) | a mixed aspect is refused whole to a reader without an access record; an aspect key without an entry in the access map needs an access record | the access decision of §9.2.4 and the offers of §10.5 | P4 |
| D19 (The repair entry) | the data provider records a repair, a waste status and an end on the report of the acting operator (open decision Q-971 (whether operators without passport responsibility may record passport information)) | the receiving step of §10.4 | P5 |
| D33 (The offers of an ended passport) | the dataset offers of an ended passport are withdrawn and the lifecycle offer stays (open decision Q-025 (access to the record of a recycled battery's ended passport)) | `withdrawDatasetOffers` | P4 |
| D34 (The passport service provider as a receiver) | the data provider's deployment sends PassportEnded to an optional passport service provider (open decision Q-961 (how the passport service provider learns a passport ended)) | the plan of §10.3 and one variable | P4 |
| D47 (The access to the notification asset) | the notification asset admits every participant by default, and no step reverts a waste status | the default of one variable; a new step | P5 |
| D48 (The repair certificate before the notice) | the repairer's deployment checks the registered certificate twin before the notice | one check of `EP-REPORT-REPAIR` | P5 |
| D49 (The retry of a failed transport) | 5 attempts and a base pause of 60 seconds | the defaults of two variables | P5 |
| D65 (The named waste successor is permanent) | the named successor, its role and the waste date never change after the waste status, also under an authorisation | one refusal of `trg_passport_identity`, the timeline rule of D62 (The responsibility timeline is determined by the passport) and a new migration file | P3 |
| D72 (The clock tolerance of an operator token) | a token whose `iat` lies more than 60 seconds after the current time is refused | one constant and one test case | P4 |
| D73 (The exposure of a battery information offer) | `EP-PROVIDER-CONTRACT` and `EP-CONTRACT-END` answer the field `exposure`, and a repeated end withdraws the offer again | two answers of §9.3 and one test | P5 |
| D74 (The binding contract and criterion CAC-012 (notification API)) | the binding contract gains the withdrawal and the publication of the notification asset in phase P7, and no partner POST; CAC-012 of phase P6 asserts the record of a receiver that does not resolve | the binding contract of §9.2.9 and the row of CAC-012 of §14.3 | P7 |
| D78 (No credential of the registry in the server) | the server reaches the Digital Twin Registry without a credential; a production registry with OAuth2 needs a client that version 12 does not specify | §9.6 and `server/src/twins/dtrTwinRegistry.mjs` | P7, P8 |
| D79 (A database image of its own for the connectors) | the connectors run on `postgres:18.0` in a variable of its own, and the server on `postgres:17` | `tck/.env.example` and `tck/docker-compose.yml` | P7 |
| D84 (The connector binding on a started deployment) | the connector binding connects to a started deployment, restarts no server, gives each file data of its own, runs the kit once per regime, and reads as a reader without a deployment through the server with the data plane key | §9.2.9 and §15 item 7 | P7 |
| D88 (A data plane answer 500 without a code) | an answer 500 of a provider data plane without a named code is `transport_failed`, and CAC-012 asserts a refused BatteryRepaired by the records of the two sides | §9.2.5, the row of CAC-012 of §14.3 | P7 |
| D51 (The form of a manufacturer name item) | an item of the manufacturer name is one object with the language code as its key | one governed element of §10.6 | P4 |

No decision of the table except D65 changes a file of phases P1, P2 or P3; another choice for D65 arrives as a fourth migration file and leaves the three files of §22 unchanged. For the other decisions: the column `companies.legal_name_language` that D51 reads is stated in §9.4.1 and stays under either form of the item.

### 19.2 Further open points

1. The registry texts of §5.7 that wait for the owner, the rewording of SyR-LIFE-129 (Producer of the current passport takes over a waste battery's passport) first, and the sentence proposed for Table 4.4 of the next draft of the proposal.
2. The three open decisions of the registry of §5.5.
3. The claims marked "not verified against a stored text": the licence of the wallet stub image (§9.8); the patterns of the MessageHeader model other than the identifier pattern, and the four values of `messageType` (§10.1); the meaning of the path suffix `/$value` (§9.3); the action names of §9.7; the major versions and the licences of §9.8; and the need for the file `DEPENDENCIES` (§3.2).
4. The resolution of the imported models is to be confirmed by the first run of phase P2 in the repository (§11.2). The public schemas of §20 state no upper limit for a passport identifier (the proposal states none), and the index `notifications_received_passport_idx` holds an index row of 2,704 bytes at most, so a received notification whose passport identifier exceeds that size after compression fails in the index and answers `ERR-RX-INTERNAL` (observed on 2026-11-16 with an identifier of 3,008 characters of hexadecimal text); the owner decides whether the proposal and the public schemas gain an upper limit.
5. The connector release that the owner names before phase P7 (§11.7).
6. The review of version 7 by a reviewer who is not the author.



## 20. Annex A: the files of phase P1 in full

The annexes are normative (decision D58, Normative annexes). Each block below a heading "File" is the whole content of the named file. The implementer copies each block into its file without a change, with LF line endings, and `node scripts/check-annexes.mjs` compares each file with its block. The author built every file of the three annexes on 2026-11-16 and verified the files by a run in a container of the image `node:24`: the eight schema files compile with Ajv 8.20.0 in the 2020-12 dialect in strict mode with the formats of `ajv-formats` 3.0.1, and accept and refuse 60 message cases as `server/test/contractSchemas.test.mjs` states them; every property of the eight files carries a description; and Spectral 6 prints "No results with a severity of 'error' found!" for the OpenAPI file and exits 0.

#### File: `.gitattributes` (phase P1)

````text
################################################################################
# Copyright (c) 2026 Ichnos Protocol Pte. Ltd.
# Copyright (c) 2026 Contributors to the Eclipse Foundation
#
# See the NOTICE file(s) distributed with this work for additional
# information regarding copyright ownership.
#
# This program and the accompanying materials are made available under the
# terms of the Apache License, Version 2.0 which is available at
# https://www.apache.org/licenses/LICENSE-2.0.
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
# WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
# License for the specific language governing permissions and limitations
# under the License.
#
# SPDX-License-Identifier: Apache-2.0
################################################################################

# Text files are stored and checked out with LF line endings on every machine.
* text=auto eol=lf

# A shell script runs in a Linux container and needs LF line endings.
*.sh text eol=lf

# Binary files are never converted.
*.jar binary
*.png binary
*.jpg binary
*.jpeg binary
*.pdf binary
*.xlsx binary
````

#### File: `.spectral.yaml` (phase P1)

````text
################################################################################
# Copyright (c) 2026 Ichnos Protocol Pte. Ltd.
# Copyright (c) 2026 Contributors to the Eclipse Foundation
#
# See the NOTICE file(s) distributed with this work for additional
# information regarding copyright ownership.
#
# This program and the accompanying materials are made available under the
# terms of the Apache License, Version 2.0 which is available at
# https://www.apache.org/licenses/LICENSE-2.0.
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
# WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
# License for the specific language governing permissions and limitations
# under the License.
#
# SPDX-License-Identifier: Apache-2.0
################################################################################

# The ruleset of the OpenAPI lint: the OpenAPI rules of Spectral.
extends:
  - "spectral:oas"
````

#### File: `docs/api/openAPI.yaml` (phase P1)

````text
#######################################################################
# Copyright (c) 2026 Ichnos Protocol Pte. Ltd.
# Copyright (c) 2026 Contributors to the Eclipse Foundation
#
# See the NOTICE file(s) distributed with this work for additional
# information regarding copyright ownership.
#
# This work is made available under the terms of the
# Creative Commons Attribution 4.0 International (CC-BY-4.0) license,
# which is available at
# https://creativecommons.org/licenses/by/4.0/legalcode.
#
# SPDX-License-Identifier: CC-BY-4.0
#######################################################################
openapi: 3.1.0
info:
  title: Battery Passport Lifecycle Notification API
  version: 1.0.0
  description: >-
    The lifecycle notification API that the proposal CX-0160-4 (Battery Passport after the First Passport)
    defines in its section 4.3. A sender reports one lifecycle event of a battery after its first passport
    to a receiver. The API has four operations, one POST endpoint per operation. The API is proposed and
    is not released. The connector of the receiver authenticates the caller, so this specification defines
    no security scheme.
  contact:
    name: The maintainers of the repository battery-passport-after-first-life
    url: https://github.com/Ichnos-Protocol/battery-passport-after-first-life/issues
  license:
    name: CC-BY-4.0
    identifier: CC-BY-4.0
servers:
  - url: "{baseUrl}/api/lifecycle-notifications"
    description: The notification endpoints of a receiver, behind the data plane of the receiver's connector.
    variables:
      baseUrl:
        default: https://provider.example
        description: The address of the server of the receiver.
tags:
  - name: LifecycleNotification
    description: The four operations of the lifecycle notification API.
paths:
  /NewPassportIssued:
    post:
      tags:
        - LifecycleNotification
      operationId: NewPassportIssued
      summary: The second-life operator reports a new passport to the data provider of an original passport.
      description: >-
        The sender is the second-life operator that issued a new passport. The receiver is the data provider
        of one original passport. The context of the header is
        BatteryPass-BatteryPassLifecycleNotificationAPI-NewPassportIssued:1.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "schemas/LifecycleNotification.schema.json#/$defs/NewPassportIssued"
      responses:
        "200":
          $ref: "#/components/responses/Accepted"
        "400":
          $ref: "#/components/responses/BadRequest"
        "401":
          $ref: "#/components/responses/Unauthenticated"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"
        "405":
          $ref: "#/components/responses/MethodNotAllowed"
        "409":
          $ref: "#/components/responses/Conflict"
        "413":
          $ref: "#/components/responses/BodyTooLarge"
        "422":
          $ref: "#/components/responses/StepRefused"
        "500":
          $ref: "#/components/responses/ReceiverFailed"
  /BatteryRepaired:
    post:
      tags:
        - LifecycleNotification
      operationId: BatteryRepaired
      summary: The repairer reports a repair to the data provider of the passport.
      description: >-
        The sender is the repairer of the battery. The receiver is the data provider of the passport of the
        battery. The context of the header is
        BatteryPass-BatteryPassLifecycleNotificationAPI-BatteryRepaired:1.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "schemas/LifecycleNotification.schema.json#/$defs/BatteryRepaired"
      responses:
        "200":
          $ref: "#/components/responses/Accepted"
        "400":
          $ref: "#/components/responses/BadRequest"
        "401":
          $ref: "#/components/responses/Unauthenticated"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"
        "405":
          $ref: "#/components/responses/MethodNotAllowed"
        "409":
          $ref: "#/components/responses/Conflict"
        "413":
          $ref: "#/components/responses/BodyTooLarge"
        "422":
          $ref: "#/components/responses/StepRefused"
        "500":
          $ref: "#/components/responses/ReceiverFailed"
  /BatteryBecameWaste:
    post:
      tags:
        - LifecycleNotification
      operationId: BatteryBecameWaste
      summary: The waste receiver reports the waste status to the data provider of the passport and to the successor.
      description: >-
        The sender is the waste receiver that took the battery over as waste. The receivers are the data
        provider of the passport of the battery and the successor that the notification names. The context of
        the header is BatteryPass-BatteryPassLifecycleNotificationAPI-BatteryBecameWaste:1.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "schemas/LifecycleNotification.schema.json#/$defs/BatteryBecameWaste"
      responses:
        "200":
          $ref: "#/components/responses/Accepted"
        "400":
          $ref: "#/components/responses/BadRequest"
        "401":
          $ref: "#/components/responses/Unauthenticated"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"
        "405":
          $ref: "#/components/responses/MethodNotAllowed"
        "409":
          $ref: "#/components/responses/Conflict"
        "413":
          $ref: "#/components/responses/BodyTooLarge"
        "422":
          $ref: "#/components/responses/StepRefused"
        "500":
          $ref: "#/components/responses/ReceiverFailed"
  /PassportEnded:
    post:
      tags:
        - LifecycleNotification
      operationId: PassportEnded
      summary: The recycler reports the recycling of a battery, which ends the passport.
      description: >-
        The sender is the recycler of the battery. The receivers are the data provider of the passport, the
        manufacturer that the nameplate names and the successor from whom the recycler received the battery.
        The context of the header is BatteryPass-BatteryPassLifecycleNotificationAPI-PassportEnded:1.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "schemas/LifecycleNotification.schema.json#/$defs/PassportEnded"
      responses:
        "200":
          $ref: "#/components/responses/Accepted"
        "400":
          $ref: "#/components/responses/BadRequest"
        "401":
          $ref: "#/components/responses/Unauthenticated"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"
        "405":
          $ref: "#/components/responses/MethodNotAllowed"
        "409":
          $ref: "#/components/responses/Conflict"
        "413":
          $ref: "#/components/responses/BodyTooLarge"
        "422":
          $ref: "#/components/responses/StepRefused"
        "500":
          $ref: "#/components/responses/ReceiverFailed"
components:
  responses:
    Accepted:
      description: The receiver accepted the notification. The outcome is applied, recorded or duplicate.
      content:
        application/json:
          schema:
            $ref: "schemas/NotificationAccepted.schema.json"
    BadRequest:
      description: >-
        The body is not a valid notification of the operation, the context does not name the operation, or the
        header names another receiver (ERR-RX-HEADER-INVALID, ERR-RX-CONTENT-INVALID, ERR-RX-CONTEXT-MISMATCH,
        ERR-RX-RECEIVER-MISMATCH).
      content:
        application/json:
          schema:
            $ref: "schemas/ErrorResponse.schema.json"
    Unauthenticated:
      description: The request carries no valid credential (ERR-AC-UNAUTHENTICATED).
      content:
        application/json:
          schema:
            $ref: "schemas/ErrorResponse.schema.json"
    Forbidden:
      description: >-
        The sender of the header differs from the participant that the connector presented, or the subject
        lacks the capability of the endpoint (ERR-RX-SENDER-MISMATCH, ERR-AC-CAPABILITY-MISSING).
      content:
        application/json:
          schema:
            $ref: "schemas/ErrorResponse.schema.json"
    NotFound:
      description: No passport of the receiver carries the named passport identifier (ERR-RX-PASSPORT-UNKNOWN).
      content:
        application/json:
          schema:
            $ref: "schemas/ErrorResponse.schema.json"
    MethodNotAllowed:
      description: The endpoint accepts the method POST only (ERR-RX-METHOD-NOT-ALLOWED).
      content:
        application/json:
          schema:
            $ref: "schemas/ErrorResponse.schema.json"
    Conflict:
      description: A stored message of another sender or with another content carries the same messageId (ERR-RX-MESSAGE-ID-REUSED).
      content:
        application/json:
          schema:
            $ref: "schemas/ErrorResponse.schema.json"
    BodyTooLarge:
      description: The body is larger than one megabyte (ERR-RX-BODY-TOO-LARGE).
      content:
        application/json:
          schema:
            $ref: "schemas/ErrorResponse.schema.json"
    StepRefused:
      description: >-
        The state of the passport does not admit the step of the operation, or the content holds a property
        outside the content of the operation (ERR-RX-STEP-REFUSED, ERR-RX-CHANGE-OUTSIDE-STEP).
      content:
        application/json:
          schema:
            $ref: "schemas/ErrorResponse.schema.json"
    ReceiverFailed:
      description: The receiver failed to store the notification (ERR-RX-INTERNAL).
      content:
        application/json:
          schema:
            $ref: "schemas/ErrorResponse.schema.json"
````

#### File: `docs/api/schemas/MessageHeader.schema.json` (phase P1)

````text
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "MessageHeader.schema.json",
  "title": "MessageHeader",
  "description": "The header of a lifecycle notification, with the properties of the Catena-X message header in version 3.0.0.",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "messageId",
    "context",
    "sentDateTime",
    "senderBpn",
    "receiverBpn",
    "version"
  ],
  "properties": {
    "messageId": {
      "type": "string",
      "pattern": "(^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$)|(^urn:uuid:[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$)",
      "description": "The identifier of the message, unique per message."
    },
    "context": {
      "type": "string",
      "enum": [
        "BatteryPass-BatteryPassLifecycleNotificationAPI-NewPassportIssued:1",
        "BatteryPass-BatteryPassLifecycleNotificationAPI-BatteryRepaired:1",
        "BatteryPass-BatteryPassLifecycleNotificationAPI-BatteryBecameWaste:1",
        "BatteryPass-BatteryPassLifecycleNotificationAPI-PassportEnded:1"
      ],
      "description": "The context of the operation, as Table 4.3 of the proposal CX-0160-4 states the context."
    },
    "sentDateTime": {
      "type": "string",
      "format": "date-time",
      "pattern": "^[0-9]{4}-[0-9]{2}-[0-9]{2}[Tt]",
      "description": "The date and time at which the sender sent the message, with a time zone."
    },
    "senderBpn": {
      "type": "string",
      "pattern": "^BPNL[a-zA-Z0-9]{12}$",
      "description": "The Business Partner Number of the legal entity that sends the message."
    },
    "receiverBpn": {
      "type": "string",
      "pattern": "^BPNL[a-zA-Z0-9]{12}$",
      "description": "The Business Partner Number of the legal entity that receives the message."
    },
    "version": {
      "const": "3.0.0",
      "description": "The version of the message header."
    },
    "expectedResponseBy": {
      "type": "string",
      "format": "date-time",
      "pattern": "^[0-9]{4}-[0-9]{2}-[0-9]{2}[Tt]",
      "description": "The date and time by which the sender expects a response."
    },
    "relatedMessageId": {
      "type": "string",
      "pattern": "(^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$)|(^urn:uuid:[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$)",
      "description": "The identifier of a message to which this message relates."
    }
  }
}
````

#### File: `docs/api/schemas/LifecycleNotification.schema.json` (phase P1)

````text
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "LifecycleNotification.schema.json",
  "title": "LifecycleNotification",
  "description": "The envelope of a lifecycle notification: an object with exactly the two properties header and content. One definition per operation fixes the context of the header and the schema of the content.",
  "oneOf": [
    {
      "$ref": "#/$defs/NewPassportIssued"
    },
    {
      "$ref": "#/$defs/BatteryRepaired"
    },
    {
      "$ref": "#/$defs/BatteryBecameWaste"
    },
    {
      "$ref": "#/$defs/PassportEnded"
    }
  ],
  "$defs": {
    "NewPassportIssued": {
      "title": "NewPassportIssuedMessage",
      "description": "The message of the operation NewPassportIssued: the header with the context of the operation, and the content of the operation.",
      "type": "object",
      "additionalProperties": false,
      "required": [
        "header",
        "content"
      ],
      "properties": {
        "header": {
          "description": "The header of the message, with the context of the operation NewPassportIssued.",
          "allOf": [
            {
              "$ref": "MessageHeader.schema.json"
            },
            {
              "type": "object",
              "required": [
                "context"
              ],
              "properties": {
                "context": {
                  "const": "BatteryPass-BatteryPassLifecycleNotificationAPI-NewPassportIssued:1",
                  "description": "The context of the operation NewPassportIssued."
                }
              }
            }
          ]
        },
        "content": {
          "description": "The content of the operation NewPassportIssued.",
          "$ref": "NewPassportIssued.schema.json"
        }
      }
    },
    "BatteryRepaired": {
      "title": "BatteryRepairedMessage",
      "description": "The message of the operation BatteryRepaired: the header with the context of the operation, and the content of the operation.",
      "type": "object",
      "additionalProperties": false,
      "required": [
        "header",
        "content"
      ],
      "properties": {
        "header": {
          "description": "The header of the message, with the context of the operation BatteryRepaired.",
          "allOf": [
            {
              "$ref": "MessageHeader.schema.json"
            },
            {
              "type": "object",
              "required": [
                "context"
              ],
              "properties": {
                "context": {
                  "const": "BatteryPass-BatteryPassLifecycleNotificationAPI-BatteryRepaired:1",
                  "description": "The context of the operation BatteryRepaired."
                }
              }
            }
          ]
        },
        "content": {
          "description": "The content of the operation BatteryRepaired.",
          "$ref": "BatteryRepaired.schema.json"
        }
      }
    },
    "BatteryBecameWaste": {
      "title": "BatteryBecameWasteMessage",
      "description": "The message of the operation BatteryBecameWaste: the header with the context of the operation, and the content of the operation.",
      "type": "object",
      "additionalProperties": false,
      "required": [
        "header",
        "content"
      ],
      "properties": {
        "header": {
          "description": "The header of the message, with the context of the operation BatteryBecameWaste.",
          "allOf": [
            {
              "$ref": "MessageHeader.schema.json"
            },
            {
              "type": "object",
              "required": [
                "context"
              ],
              "properties": {
                "context": {
                  "const": "BatteryPass-BatteryPassLifecycleNotificationAPI-BatteryBecameWaste:1",
                  "description": "The context of the operation BatteryBecameWaste."
                }
              }
            }
          ]
        },
        "content": {
          "description": "The content of the operation BatteryBecameWaste.",
          "$ref": "BatteryBecameWaste.schema.json"
        }
      }
    },
    "PassportEnded": {
      "title": "PassportEndedMessage",
      "description": "The message of the operation PassportEnded: the header with the context of the operation, and the content of the operation.",
      "type": "object",
      "additionalProperties": false,
      "required": [
        "header",
        "content"
      ],
      "properties": {
        "header": {
          "description": "The header of the message, with the context of the operation PassportEnded.",
          "allOf": [
            {
              "$ref": "MessageHeader.schema.json"
            },
            {
              "type": "object",
              "required": [
                "context"
              ],
              "properties": {
                "context": {
                  "const": "BatteryPass-BatteryPassLifecycleNotificationAPI-PassportEnded:1",
                  "description": "The context of the operation PassportEnded."
                }
              }
            }
          ]
        },
        "content": {
          "description": "The content of the operation PassportEnded.",
          "$ref": "PassportEnded.schema.json"
        }
      }
    }
  }
}
````

#### File: `docs/api/schemas/NewPassportIssued.schema.json` (phase P1)

````text
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "NewPassportIssued.schema.json",
  "title": "NewPassportIssued",
  "description": "The content of the operation NewPassportIssued: the second-life operator tells the data provider of an original passport that a new passport was issued.",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "passportIdentifier",
    "catenaXId",
    "operation",
    "operationDate",
    "predecessorPassportIdentifier"
  ],
  "properties": {
    "passportIdentifier": {
      "type": "string",
      "minLength": 1,
      "description": "The passport identifier of the new passport."
    },
    "catenaXId": {
      "type": "string",
      "pattern": "(^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$)|(^urn:uuid:[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$)",
      "description": "The catenaXId of the digital twin of the new passport."
    },
    "operation": {
      "type": "string",
      "enum": [
        "preparationForReUse",
        "preparationForRepurposing",
        "repurposing",
        "remanufacturing"
      ],
      "description": "The operation that issued the new passport."
    },
    "operationDate": {
      "type": "string",
      "format": "date-time",
      "pattern": "^[0-9]{4}-[0-9]{2}-[0-9]{2}[Tt]",
      "description": "The date and time at which the new passport was issued."
    },
    "predecessorPassportIdentifier": {
      "type": "string",
      "minLength": 1,
      "description": "The passport identifier of the one original passport of the receiver that the notification concerns."
    }
  }
}
````

#### File: `docs/api/schemas/BatteryRepaired.schema.json` (phase P1)

````text
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "BatteryRepaired.schema.json",
  "title": "BatteryRepaired",
  "description": "The content of the operation BatteryRepaired: the repairer tells the data provider of a passport that the battery was repaired.",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "passportIdentifier",
    "repairDate",
    "repairCertificateCatenaXId"
  ],
  "properties": {
    "passportIdentifier": {
      "type": "string",
      "minLength": 1,
      "description": "The passport identifier of the passport of the repaired battery."
    },
    "repairDate": {
      "type": "string",
      "format": "date-time",
      "pattern": "^[0-9]{4}-[0-9]{2}-[0-9]{2}[Tt]",
      "description": "The date and time of the repair."
    },
    "repairCertificateCatenaXId": {
      "type": "string",
      "pattern": "(^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$)|(^urn:uuid:[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$)",
      "description": "The catenaXId of the digital twin of the repair certificate."
    }
  }
}
````

#### File: `docs/api/schemas/BatteryBecameWaste.schema.json` (phase P1)

````text
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "BatteryBecameWaste.schema.json",
  "title": "BatteryBecameWaste",
  "description": "The content of the operation BatteryBecameWaste: the waste receiver tells the data provider of a passport and the successor that the battery became waste.",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "passportIdentifier",
    "successorBpnl",
    "successorRole",
    "date"
  ],
  "properties": {
    "passportIdentifier": {
      "type": "string",
      "minLength": 1,
      "description": "The passport identifier of the passport of the waste battery."
    },
    "successorBpnl": {
      "type": "string",
      "pattern": "^BPNL[a-zA-Z0-9]{12}$",
      "description": "The Business Partner Number of the successor that takes over the responsibility for the passport."
    },
    "successorRole": {
      "type": "string",
      "enum": [
        "producer",
        "producerResponsibilityOrganisation",
        "wasteManagementOperator"
      ],
      "description": "The role of the successor."
    },
    "date": {
      "type": "string",
      "format": "date-time",
      "pattern": "^[0-9]{4}-[0-9]{2}-[0-9]{2}[Tt]",
      "description": "The date and time at which the battery became waste."
    }
  }
}
````

#### File: `docs/api/schemas/PassportEnded.schema.json` (phase P1)

````text
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "PassportEnded.schema.json",
  "title": "PassportEnded",
  "description": "The content of the operation PassportEnded: the recycler tells the receivers that the battery was recycled.",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "passportIdentifier",
    "recyclingDate",
    "recyclerBpnl"
  ],
  "properties": {
    "passportIdentifier": {
      "type": "string",
      "minLength": 1,
      "description": "The passport identifier of the passport of the recycled battery."
    },
    "recyclingDate": {
      "type": "string",
      "format": "date-time",
      "pattern": "^[0-9]{4}-[0-9]{2}-[0-9]{2}[Tt]",
      "description": "The date and time of the recycling."
    },
    "recyclerBpnl": {
      "type": "string",
      "pattern": "^BPNL[a-zA-Z0-9]{12}$",
      "description": "The Business Partner Number of the recycler."
    },
    "materialRecyclingCertificateCatenaXId": {
      "type": "string",
      "pattern": "(^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$)|(^urn:uuid:[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$)",
      "description": "The catenaXId of the digital twin of the material recycling certificate."
    }
  }
}
````

#### File: `docs/api/schemas/NotificationAccepted.schema.json` (phase P1)

````text
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "NotificationAccepted.schema.json",
  "title": "NotificationAccepted",
  "description": "The body of the answer 200 of a notification endpoint.",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "messageId",
    "outcome"
  ],
  "properties": {
    "messageId": {
      "type": "string",
      "pattern": "(^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$)|(^urn:uuid:[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$)",
      "description": "The identifier of the received message, in lower case with the prefix urn:uuid:."
    },
    "outcome": {
      "type": "string",
      "enum": [
        "applied",
        "recorded",
        "duplicate"
      ],
      "description": "The outcome: the receiver applied the step, recorded the message without a change of a passport, or had stored the same message before."
    }
  }
}
````

#### File: `docs/api/schemas/ErrorResponse.schema.json` (phase P1)

````text
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "ErrorResponse.schema.json",
  "title": "ErrorResponse",
  "description": "The body of every refusal: the error envelope together with the messages of a result object.",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "success",
    "error",
    "messages"
  ],
  "properties": {
    "success": {
      "const": false,
      "description": "The constant false."
    },
    "error": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "message",
        "code"
      ],
      "description": "The refusal.",
      "properties": {
        "message": {
          "type": "string",
          "minLength": 1,
          "description": "The text of the refusal: what happened, why the rule exists, who must act, and the next action."
        },
        "code": {
          "type": "string",
          "minLength": 1,
          "description": "The identifier of the refusal."
        }
      }
    },
    "messages": {
      "type": "array",
      "minItems": 1,
      "description": "The messages of the result object: the text of the refusal first, then one message per detail.",
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "messageType",
          "text"
        ],
        "properties": {
          "messageType": {
            "type": "string",
            "enum": [
              "Error",
              "Warning",
              "Info",
              "Exception"
            ],
            "description": "The type of the message."
          },
          "text": {
            "type": "string",
            "minLength": 1,
            "description": "The text of the message."
          }
        }
      }
    }
  }
}
````

## 21. Annex B: the files of phase P2 in full

The author validated the three model files of this annex on 2026-11-16 with the SAMM command line tool 2.11.1 in a container of the image `eclipse-temurin:21`, on a scratch copy outside the repository: the script of this annex printed `VALID` for each of the three models, the tool printed "Input model is valid" for each, two runs of the script with the argument `--generate` wrote the same three schema files byte for byte, and each of the three example payloads validates against its generated schema with the compiler of `aspectSchemaCompiler.mjs`, which also compiles the six stored schema files of `sources/IDTA/` in strict mode. The generated schema files are the output of the tool and are not printed in this annex.

#### File: `scripts/validate-models.sh` (phase P2)

````text
#!/usr/bin/env bash
################################################################################
# Copyright (c) 2026 Ichnos Protocol Pte. Ltd.
# Copyright (c) 2026 Contributors to the Eclipse Foundation
#
# See the NOTICE file(s) distributed with this work for additional
# information regarding copyright ownership.
#
# This program and the accompanying materials are made available under the
# terms of the Apache License, Version 2.0 which is available at
# https://www.apache.org/licenses/LICENSE-2.0.
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
# WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
# License for the specific language governing permissions and limitations
# under the License.
#
# SPDX-License-Identifier: Apache-2.0
################################################################################

# Validates the three proposed aspect models with the SAMM command line tool 2.11.1.
# With the argument --generate the script also writes the JSON schema of each model to docs/api/aspects.
# The file has LF line endings, which the file .gitattributes of the repository root sets for every shell script.
# The script runs at the repository root, in a shell with Java 21.
set -euo pipefail

JAR="tools/samm-cli-2.11.1.jar"
JAR_SHA256="fab66a72e1969ff2e4d9db5d1c0eeb55936f89e2159045576301ea46c49ffc0f"
ROOT="tools/models-root"
SHARED="sources/Tractus-X/semantic-models"
GENERATED="docs/api/aspects"
MODELS=(
  "io.catenax.battery.passport_lifecycle:BatteryPassportLifecycle"
  "io.catenax.battery.passport_successors:BatteryPassportSuccessors"
  "io.catenax.battery.passport_access_map:BatteryPassportAccessMap"
)

if [ ! -f "$JAR" ]; then
  echo "MISSING $JAR"
  exit 1
fi
if ! echo "$JAR_SHA256  $JAR" | sha256sum -c --quiet -; then
  echo "CHECKSUM $JAR"
  exit 1
fi

# The tool resolves an imported model from the folder layout <root>/<namespace>/<version>/<File>.ttl
# around the input file, so the script assembles one models root with the five namespaces.
rm -rf "$ROOT"
mkdir -p "$ROOT"
cp -r "$SHARED/io.catenax.shared.uuid" "$ROOT/"
cp -r "$SHARED/io.catenax.shared.business_partner_number" "$ROOT/"
for entry in "${MODELS[@]}"; do
  namespace="${entry%%:*}"
  aspect="${entry##*:}"
  mkdir -p "$ROOT/$namespace/1.0.0"
  cp "models/$namespace/1.0.0/$aspect.ttl" "$ROOT/$namespace/1.0.0/$aspect.ttl"
done

failed=0
for entry in "${MODELS[@]}"; do
  namespace="${entry%%:*}"
  aspect="${entry##*:}"
  log="$ROOT/$aspect.validate.log"
  if java -jar "$JAR" aspect "$ROOT/$namespace/1.0.0/$aspect.ttl" validate > "$log" 2>&1 && grep -q "Input model is valid" "$log"; then
    echo "VALID $aspect"
  else
    echo "FAILED $aspect"
    cat "$log"
    failed=1
  fi
done
if [ "$failed" -ne 0 ]; then
  exit 1
fi

if [ "${1:-}" = "--generate" ]; then
  for entry in "${MODELS[@]}"; do
    namespace="${entry%%:*}"
    aspect="${entry##*:}"
    mkdir -p "$GENERATED"
    java -jar "$JAR" aspect "$ROOT/$namespace/1.0.0/$aspect.ttl" to schema > "$GENERATED/$aspect-schema.json"
    echo "GENERATED $aspect"
  done
fi
````

#### File: `server/src/validation/aspectSchemaCompiler.mjs` (phase P2)

````text
/********************************************************************************
 * Copyright (c) 2026 Ichnos Protocol Pte. Ltd.
 * Copyright (c) 2026 Contributors to the Eclipse Foundation
 *
 * See the NOTICE file(s) distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Apache License, Version 2.0 which is available at
 * https://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ********************************************************************************/

// Requirement: PrR-CXD-026 (Three proposed models in the sldt-semantic-models layout).
// The one compiler of the aspect schemas in the draft-04 dialect of JSON Schema: the three
// schemas that the SAMM command line tool generates and the stored schemas of sources/IDTA.
import Ajv04 from "ajv-draft-04";
import addFormats from "ajv-formats";

// The two keywords that a schema of the SAMM command line tool holds beside the draft-04
// vocabulary. "x-samm-aspect-model-urn" is an annotation, and "components" holds the
// definitions that the references "#/components/schemas/<name>" of the schema name.
export const SAMM_SCHEMA_KEYWORDS = Object.freeze(["x-samm-aspect-model-urn", "components"]);

// Returns a new compiler in strict mode, so that every other unknown keyword and every unknown
// format of a schema fails the compilation. The compiler collects every error of a payload.
export function createAspectSchemaCompiler() {
  const compiler = new Ajv04({ strict: true, allErrors: true });
  addFormats(compiler);
  for (const keyword of SAMM_SCHEMA_KEYWORDS) compiler.addKeyword(keyword);
  return compiler;
}
````

#### File: `models/io.catenax.battery.passport_lifecycle/1.0.0/BatteryPassportLifecycle.ttl` (phase P2)

````text
#######################################################################
# Copyright (c) 2026 Ichnos Protocol Pte. Ltd.
# Copyright (c) 2026 Contributors to the Eclipse Foundation
#
# See the NOTICE file(s) distributed with this work for additional
# information regarding copyright ownership.
#
# This work is made available under the terms of the
# Creative Commons Attribution 4.0 International (CC-BY-4.0) license,
# which is available at
# https://creativecommons.org/licenses/by/4.0/legalcode.
#
# SPDX-License-Identifier: CC-BY-4.0
#######################################################################

@prefix samm: <urn:samm:org.eclipse.esmf.samm:meta-model:2.1.0#> .
@prefix samm-c: <urn:samm:org.eclipse.esmf.samm:characteristic:2.1.0#> .
@prefix samm-e: <urn:samm:org.eclipse.esmf.samm:entity:2.1.0#> .
@prefix unit: <urn:samm:org.eclipse.esmf.samm:unit:2.1.0#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix : <urn:samm:io.catenax.battery.passport_lifecycle:1.0.0#> .
@prefix ext-uuid: <urn:samm:io.catenax.shared.uuid:2.1.0#> .
@prefix ext-bpn: <urn:samm:io.catenax.shared.business_partner_number:2.0.0#> .

:BatteryPassportLifecycle a samm:Aspect ;
   samm:preferredName "Battery passport lifecycle"@en ;
   samm:description "The lifecycle record of a battery passport after the first passport: the predecessor links of a new passport, the successor that takes over the responsibility for the passport when the battery becomes waste, and the end of the passport after the recycling of the battery."@en ;
   samm:properties ( :predecessors [ samm:property :wasteResponsibility ; samm:optional true ] [ samm:property :endOfPassport ; samm:optional true ] ) ;
   samm:operations ( ) ;
   samm:events ( ) .

:predecessors a samm:Property ;
   samm:preferredName "Predecessors"@en ;
   samm:description "One entry per original passport; empty on a first passport."@en ;
   samm:characteristic :PredecessorsTrait .

:PredecessorsTrait a samm-c:Trait ;
   samm:preferredName "Predecessors trait"@en ;
   samm:description "The list of the predecessor links with its length constraint."@en ;
   samm-c:baseCharacteristic :PredecessorsCharacteristic ;
   samm-c:constraint :PredecessorsLengthConstraint .

:PredecessorsCharacteristic a samm-c:List ;
   samm:preferredName "Predecessors characteristic"@en ;
   samm:description "The list of the predecessor links of a passport."@en ;
   samm:dataType :PassportLink .

:PredecessorsLengthConstraint a samm-c:LengthConstraint ;
   samm:preferredName "Predecessors length constraint"@en ;
   samm:description "The list of the predecessor links holds zero or more entries."@en ;
   samm-c:minValue "0"^^xsd:nonNegativeInteger .

:PassportLink a samm:Entity ;
   samm:preferredName "Passport link"@en ;
   samm:description "The link from a new passport to one original passport."@en ;
   samm:properties ( :passportIdentifier :catenaXId :dataProviderBpnl :operation :operationDate ) .

:passportIdentifier a samm:Property ;
   samm:preferredName "Passport identifier"@en ;
   samm:description "The digitalProductPassportId of the original passport."@en ;
   samm:characteristic samm-c:Text ;
   samm:exampleValue "urn:uuid:5f0c1c7e-6b1e-4a37-9a59-0b1d7c3e2a10" .

:catenaXId a samm:Property ;
   samm:preferredName "Catena-X identifier"@en ;
   samm:description "The catenaXId of the original twin."@en ;
   samm:characteristic ext-uuid:UuidV4Trait ;
   samm:exampleValue "urn:uuid:9a2b8f61-3c5d-4e7a-8b1f-2d6c4a0e9f33" .

:dataProviderBpnl a samm:Property ;
   samm:preferredName "Data provider BPNL"@en ;
   samm:description "The BPNL of the data provider of the original passport (the manufacturerId of the original twin)."@en ;
   samm:characteristic ext-bpn:BpnlTrait ;
   samm:exampleValue "BPNL000000000001" .

:operation a samm:Property ;
   samm:preferredName "Operation"@en ;
   samm:description "The operation that issued the new passport."@en ;
   samm:characteristic :OperationEnumeration ;
   samm:exampleValue "remanufacturing" .

:OperationEnumeration a samm-c:Enumeration ;
   samm:preferredName "Operation enumeration"@en ;
   samm:description "The four operations after which a new passport is issued."@en ;
   samm:dataType xsd:string ;
   samm-c:values ( "preparationForReUse" "preparationForRepurposing" "repurposing" "remanufacturing" ) .

:operationDate a samm:Property ;
   samm:preferredName "Operation date"@en ;
   samm:description "The date the new passport was issued."@en ;
   samm:characteristic samm-c:Timestamp ;
   samm:exampleValue "2031-05-04T00:00:00Z"^^xsd:dateTime .

:wasteResponsibility a samm:Property ;
   samm:preferredName "Waste responsibility"@en ;
   samm:description "Present once the battery is waste."@en ;
   samm:characteristic :WasteResponsibilityCharacteristic .

:WasteResponsibilityCharacteristic a samm:Characteristic ;
   samm:preferredName "Waste responsibility characteristic"@en ;
   samm:description "The successor that takes over the responsibility for the passport when the battery becomes waste."@en ;
   samm:dataType :WasteResponsibility .

:WasteResponsibility a samm:Entity ;
   samm:preferredName "Waste responsibility"@en ;
   samm:description "The successor, the role of the successor and the date on which the battery became waste."@en ;
   samm:properties ( :successorBpnl :successorRole :date ) .

:successorBpnl a samm:Property ;
   samm:preferredName "Successor BPNL"@en ;
   samm:description "The BPNL of the successor."@en ;
   samm:characteristic ext-bpn:BpnlTrait ;
   samm:exampleValue "BPNL000000000003" .

:successorRole a samm:Property ;
   samm:preferredName "Successor role"@en ;
   samm:description "The role of Art. 77(7), second subparagraph."@en ;
   samm:characteristic :SuccessorRoleEnumeration ;
   samm:exampleValue "producerResponsibilityOrganisation" .

:SuccessorRoleEnumeration a samm-c:Enumeration ;
   samm:preferredName "Successor role enumeration"@en ;
   samm:description "The three roles of a successor: the producer, the producer responsibility organisation and the waste management operator."@en ;
   samm:dataType xsd:string ;
   samm-c:values ( "producer" "producerResponsibilityOrganisation" "wasteManagementOperator" ) .

:date a samm:Property ;
   samm:preferredName "Date"@en ;
   samm:description "The date the battery became waste."@en ;
   samm:characteristic samm-c:Timestamp ;
   samm:exampleValue "2039-02-11T00:00:00Z"^^xsd:dateTime .

:endOfPassport a samm:Property ;
   samm:preferredName "End of passport"@en ;
   samm:description "Present once the battery is recycled."@en ;
   samm:characteristic :EndOfPassportCharacteristic .

:EndOfPassportCharacteristic a samm:Characteristic ;
   samm:preferredName "End of passport characteristic"@en ;
   samm:description "The end of the passport after the recycling of the battery."@en ;
   samm:dataType :EndOfPassport .

:EndOfPassport a samm:Entity ;
   samm:preferredName "End of passport"@en ;
   samm:description "The date of the recycling and the recycler."@en ;
   samm:properties ( :recyclingDate :recyclerBpnl ) .

:recyclingDate a samm:Property ;
   samm:preferredName "Recycling date"@en ;
   samm:description "The date of the recycling."@en ;
   samm:characteristic samm-c:Timestamp ;
   samm:exampleValue "2040-06-30T00:00:00Z"^^xsd:dateTime .

:recyclerBpnl a samm:Property ;
   samm:preferredName "Recycler BPNL"@en ;
   samm:description "The BPNL of the recycler."@en ;
   samm:characteristic ext-bpn:BpnlTrait ;
   samm:exampleValue "BPNL000000000004" .
````

#### File: `models/io.catenax.battery.passport_lifecycle/1.0.0/metadata.json` (phase P2)

````text
{ "status" : "draft" }
````

#### File: `docs/api/aspects/BatteryPassportLifecycle.json` (phase P2)

````text
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
````

#### File: `models/io.catenax.battery.passport_lifecycle/RELEASE_NOTES.md` (phase P2)

````text
# Changelog

All notable changes to this model will be documented in this file.

## [Unreleased]

## [1.0.0] - 2026-11-16

### Added

- Initial version of the proposed aspect model BatteryPassportLifecycle: the predecessor links of a new passport, the successor that takes over the responsibility for a waste battery, and the end of the passport. The model is proposed in the document CX-0160-4 (Battery Passport after the First Passport) and is not released.

## NOTICE

This work is licensed under the [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/legalcode).

- SPDX-License-Identifier: CC-BY-4.0
- SPDX-FileCopyrightText: 2026 Ichnos Protocol Pte. Ltd.
- SPDX-FileCopyrightText: 2026 Contributors to the Eclipse Foundation
- Source URL: https://github.com/Ichnos-Protocol/battery-passport-after-first-life/blob/main/models/io.catenax.battery.passport_lifecycle/RELEASE_NOTES.md
````

#### File: `models/io.catenax.battery.passport_successors/1.0.0/BatteryPassportSuccessors.ttl` (phase P2)

````text
#######################################################################
# Copyright (c) 2026 Ichnos Protocol Pte. Ltd.
# Copyright (c) 2026 Contributors to the Eclipse Foundation
#
# See the NOTICE file(s) distributed with this work for additional
# information regarding copyright ownership.
#
# This work is made available under the terms of the
# Creative Commons Attribution 4.0 International (CC-BY-4.0) license,
# which is available at
# https://creativecommons.org/licenses/by/4.0/legalcode.
#
# SPDX-License-Identifier: CC-BY-4.0
#######################################################################

@prefix samm: <urn:samm:org.eclipse.esmf.samm:meta-model:2.1.0#> .
@prefix samm-c: <urn:samm:org.eclipse.esmf.samm:characteristic:2.1.0#> .
@prefix samm-e: <urn:samm:org.eclipse.esmf.samm:entity:2.1.0#> .
@prefix unit: <urn:samm:org.eclipse.esmf.samm:unit:2.1.0#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix : <urn:samm:io.catenax.battery.passport_successors:1.0.0#> .
@prefix ext-uuid: <urn:samm:io.catenax.shared.uuid:2.1.0#> .
@prefix ext-bpn: <urn:samm:io.catenax.shared.business_partner_number:2.0.0#> .

:BatteryPassportSuccessors a samm:Aspect ;
   samm:preferredName "Battery passport successors"@en ;
   samm:description "The forward links of an original battery passport: one link per new passport that the original issuer added after the notification of a new passport."@en ;
   samm:properties ( :successors ) ;
   samm:operations ( ) ;
   samm:events ( ) .

:successors a samm:Property ;
   samm:preferredName "Successors"@en ;
   samm:description "One entry per new passport to which the original issuer added a forward link."@en ;
   samm:characteristic :SuccessorsCharacteristic .

:SuccessorsCharacteristic a samm-c:List ;
   samm:preferredName "Successors characteristic"@en ;
   samm:description "The list of the forward links of an original passport."@en ;
   samm:dataType :SuccessorLink .

:SuccessorLink a samm:Entity ;
   samm:preferredName "Successor link"@en ;
   samm:description "The link from an original passport to one new passport."@en ;
   samm:properties ( :passportIdentifier :catenaXId :secondLifeOperatorBpnl :operation :operationDate ) .

:passportIdentifier a samm:Property ;
   samm:preferredName "Passport identifier"@en ;
   samm:description "The digitalProductPassportId of the new passport."@en ;
   samm:characteristic samm-c:Text ;
   samm:exampleValue "urn:uuid:3c1f6c1e-5b7d-4f0a-9d2e-7a4b8c6d5e21" .

:catenaXId a samm:Property ;
   samm:preferredName "Catena-X identifier"@en ;
   samm:description "The catenaXId of the new twin."@en ;
   samm:characteristic ext-uuid:UuidV4Trait ;
   samm:exampleValue "urn:uuid:b7e4d2a9-1c3f-4e5a-8b6d-0f9e8d7c6b5a" .

:secondLifeOperatorBpnl a samm:Property ;
   samm:preferredName "Second-life operator BPNL"@en ;
   samm:description "The BPNL of the second-life operator."@en ;
   samm:characteristic ext-bpn:BpnlTrait ;
   samm:exampleValue "BPNL000000000002" .

:operation a samm:Property ;
   samm:preferredName "Operation"@en ;
   samm:description "The operation that issued the new passport."@en ;
   samm:characteristic :OperationEnumeration ;
   samm:exampleValue "remanufacturing" .

:OperationEnumeration a samm-c:Enumeration ;
   samm:preferredName "Operation enumeration"@en ;
   samm:description "The four operations after which a new passport is issued."@en ;
   samm:dataType xsd:string ;
   samm-c:values ( "preparationForReUse" "preparationForRepurposing" "repurposing" "remanufacturing" ) .

:operationDate a samm:Property ;
   samm:preferredName "Operation date"@en ;
   samm:description "The date the new passport was issued."@en ;
   samm:characteristic samm-c:Timestamp ;
   samm:exampleValue "2031-05-04T00:00:00Z"^^xsd:dateTime .
````

#### File: `models/io.catenax.battery.passport_successors/1.0.0/metadata.json` (phase P2)

````text
{ "status" : "draft" }
````

#### File: `docs/api/aspects/BatteryPassportSuccessors.json` (phase P2)

````text
{
  "successors": [
    {
      "passportIdentifier": "urn:uuid:3c1f6c1e-5b7d-4f0a-9d2e-7a4b8c6d5e21",
      "catenaXId": "urn:uuid:b7e4d2a9-1c3f-4e5a-8b6d-0f9e8d7c6b5a",
      "secondLifeOperatorBpnl": "BPNL000000000002",
      "operation": "remanufacturing",
      "operationDate": "2031-05-04T00:00:00Z"
    }
  ]
}
````

#### File: `models/io.catenax.battery.passport_successors/RELEASE_NOTES.md` (phase P2)

````text
# Changelog

All notable changes to this model will be documented in this file.

## [Unreleased]

## [1.0.0] - 2026-11-16

### Added

- Initial version of the proposed aspect model BatteryPassportSuccessors: the forward links of an original passport. The model is proposed in the document CX-0160-4 (Battery Passport after the First Passport) and is not released.

## NOTICE

This work is licensed under the [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/legalcode).

- SPDX-License-Identifier: CC-BY-4.0
- SPDX-FileCopyrightText: 2026 Ichnos Protocol Pte. Ltd.
- SPDX-FileCopyrightText: 2026 Contributors to the Eclipse Foundation
- Source URL: https://github.com/Ichnos-Protocol/battery-passport-after-first-life/blob/main/models/io.catenax.battery.passport_successors/RELEASE_NOTES.md
````

#### File: `models/io.catenax.battery.passport_access_map/1.0.0/BatteryPassportAccessMap.ttl` (phase P2)

````text
#######################################################################
# Copyright (c) 2026 Ichnos Protocol Pte. Ltd.
# Copyright (c) 2026 Contributors to the Eclipse Foundation
#
# See the NOTICE file(s) distributed with this work for additional
# information regarding copyright ownership.
#
# This work is made available under the terms of the
# Creative Commons Attribution 4.0 International (CC-BY-4.0) license,
# which is available at
# https://creativecommons.org/licenses/by/4.0/legalcode.
#
# SPDX-License-Identifier: CC-BY-4.0
#######################################################################

@prefix samm: <urn:samm:org.eclipse.esmf.samm:meta-model:2.1.0#> .
@prefix samm-c: <urn:samm:org.eclipse.esmf.samm:characteristic:2.1.0#> .
@prefix samm-e: <urn:samm:org.eclipse.esmf.samm:entity:2.1.0#> .
@prefix unit: <urn:samm:org.eclipse.esmf.samm:unit:2.1.0#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix : <urn:samm:io.catenax.battery.passport_access_map:1.0.0#> .

:BatteryPassportAccessMap a samm:Aspect ;
   samm:preferredName "Battery passport access map"@en ;
   samm:description "The access group of every field of the seven IDTA-02035 aspect models of the battery passport that a data provider serves, as Annex XIII of Regulation (EU) 2023/1542 sorts the information of the battery passport."@en ;
   samm:properties ( :mapVersion :validFrom :entries ) ;
   samm:operations ( ) ;
   samm:events ( ) .

:mapVersion a samm:Property ;
   samm:preferredName "Map version"@en ;
   samm:description "The version of the access map; a new version of Annex XIII or of the implementing act under Art. 77(9) leads to a new value."@en ;
   samm:characteristic samm-c:Text ;
   samm:exampleValue "1.0.0" .

:validFrom a samm:Property ;
   samm:preferredName "Valid from"@en ;
   samm:description "The date from which the access map applies."@en ;
   samm:characteristic :ValidFromCharacteristic ;
   samm:exampleValue "2027-02-18"^^xsd:date .

:ValidFromCharacteristic a samm:Characteristic ;
   samm:preferredName "Valid from characteristic"@en ;
   samm:description "A calendar date without a time."@en ;
   samm:dataType xsd:date .

:entries a samm:Property ;
   samm:preferredName "Entries"@en ;
   samm:description "One entry per field of the seven IDTA-02035 aspect models that the data provider serves."@en ;
   samm:characteristic :EntriesTrait .

:EntriesTrait a samm-c:Trait ;
   samm:preferredName "Entries trait"@en ;
   samm:description "The list of the entries of the access map with its length constraint."@en ;
   samm-c:baseCharacteristic :EntriesCharacteristic ;
   samm-c:constraint :EntriesLengthConstraint .

:EntriesCharacteristic a samm-c:List ;
   samm:preferredName "Entries characteristic"@en ;
   samm:description "The list of the entries of the access map."@en ;
   samm:dataType :AccessMapEntry .

:EntriesLengthConstraint a samm-c:LengthConstraint ;
   samm:preferredName "Entries length constraint"@en ;
   samm:description "The list of the entries holds one entry or more."@en ;
   samm-c:minValue "1"^^xsd:nonNegativeInteger .

:AccessMapEntry a samm:Entity ;
   samm:preferredName "Access map entry"@en ;
   samm:description "The access group of one field of one aspect model on one level of the digital twin."@en ;
   samm:properties ( :aspect :twinLevel :path :accessGroup :legalBasis ) .

:aspect a samm:Property ;
   samm:preferredName "Aspect"@en ;
   samm:description "The identifier (urn) of the aspect model that the entry covers."@en ;
   samm:characteristic samm-c:Text ;
   samm:exampleValue "urn:samm:io.admin-shell.idta.batterypass.digital_nameplate:1.0.0#BatteryNameplate" .

:twinLevel a samm:Property ;
   samm:preferredName "Twin level"@en ;
   samm:description "The level of the digital twin on which the entry applies to the field."@en ;
   samm:characteristic :TwinLevelEnumeration ;
   samm:exampleValue "PartInstance" .

:TwinLevelEnumeration a samm-c:Enumeration ;
   samm:preferredName "Twin level enumeration"@en ;
   samm:description "The two levels of a digital twin: the part type and the part instance."@en ;
   samm:dataType xsd:string ;
   samm-c:values ( "PartType" "PartInstance" ) .

:path a samm:Property ;
   samm:preferredName "Path"@en ;
   samm:description "The path of the field as a JSONPath query (RFC 9535), relative to the root of the payload of the aspect model; a selector of RFC 9535 names the list elements where the entry covers only some elements of a list."@en ;
   samm:characteristic samm-c:Text ;
   samm:exampleValue "$.LifeCycleStage" .

:accessGroup a samm:Property ;
   samm:preferredName "Access group"@en ;
   samm:description "The access group of the field."@en ;
   samm:characteristic :AccessGroupEnumeration ;
   samm:exampleValue "legitimateInterestBattery" .

:AccessGroupEnumeration a samm-c:Enumeration ;
   samm:preferredName "Access group enumeration"@en ;
   samm:description "The four access groups of Annex XIII of Regulation (EU) 2023/1542: public (point 1), legitimateInterestModel (point 2), authorities (point 3) and legitimateInterestBattery (point 4)."@en ;
   samm:dataType xsd:string ;
   samm-c:values ( "public" "legitimateInterestModel" "authorities" "legitimateInterestBattery" ) .

:legalBasis a samm:Property ;
   samm:preferredName "Legal basis"@en ;
   samm:description "The point and the letter of Annex XIII of Regulation (EU) 2023/1542 that list the field."@en ;
   samm:characteristic samm-c:Text ;
   samm:exampleValue "Annex XIII point 4(c)" .
````

#### File: `models/io.catenax.battery.passport_access_map/1.0.0/metadata.json` (phase P2)

````text
{ "status" : "draft" }
````

#### File: `docs/api/aspects/BatteryPassportAccessMap.json` (phase P2)

````text
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
````

#### File: `models/io.catenax.battery.passport_access_map/RELEASE_NOTES.md` (phase P2)

````text
# Changelog

All notable changes to this model will be documented in this file.

## [Unreleased]

## [1.0.0] - 2026-11-16

### Added

- Initial version of the proposed aspect model BatteryPassportAccessMap: the access group of every field of the seven IDTA-02035 aspect models of the battery passport. The model is proposed in the document CX-0160-4 (Battery Passport after the First Passport) and is not released.

## NOTICE

This work is licensed under the [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/legalcode).

- SPDX-License-Identifier: CC-BY-4.0
- SPDX-FileCopyrightText: 2026 Ichnos Protocol Pte. Ltd.
- SPDX-FileCopyrightText: 2026 Contributors to the Eclipse Foundation
- Source URL: https://github.com/Ichnos-Protocol/battery-passport-after-first-life/blob/main/models/io.catenax.battery.passport_access_map/RELEASE_NOTES.md
````

## 22. Annex C: the files of phase P3 in full

The author applied the three migration files of this annex on 2026-11-16 to empty schemas of a PostgreSQL 17.12 database, and no statement was refused: the catalogue of each schema then held 17 tables and the table `schema_migrations`, 16 functions that each carry the fixed search path, 37 triggers and 12 policies, and the role `refserver_app` held neither the privilege `TEMPORARY` of the database nor the privilege `CREATE` of a schema, and the privilege UPDATE by column only. The author ran, under a login as the role `refserver_app`: the legitimate sequences of the fifth review, which all commit; the two blocking runs of the fifth review, which are refused; the races of the fifth review at the isolation levels READ COMMITTED, REPEATABLE READ and SERIALIZABLE; and the attack files of the fifth review, in which no statement that version 6 refused is admitted. The file `001_schema.sql` starts from the file that the third reviewer built from version 4 of this specification.

#### File: `server/src/db/migrations/001_schema.sql` (phase P3)

````text
--------------------------------------------------------------------------------
-- Copyright (c) 2026 Ichnos Protocol Pte. Ltd.
-- Copyright (c) 2026 Contributors to the Eclipse Foundation
--
-- See the NOTICE file(s) distributed with this work for additional
-- information regarding copyright ownership.
--
-- This program and the accompanying materials are made available under the
-- terms of the Apache License, Version 2.0 which is available at
-- https://www.apache.org/licenses/LICENSE-2.0.
--
-- Unless required by applicable law or agreed to in writing, software
-- distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
-- WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
-- License for the specific language governing permissions and limitations
-- under the License.
--
-- SPDX-License-Identifier: Apache-2.0
--------------------------------------------------------------------------------
-- Migration 001: the four domains and the seventeen tables of the reference server.
CREATE DOMAIN bpnl AS text CONSTRAINT bpnl_check CHECK (VALUE ~ '^BPNL[a-zA-Z0-9]{12}$');
CREATE DOMAIN bpns AS text CONSTRAINT bpns_check CHECK (VALUE ~ '^BPNS[a-zA-Z0-9]{12}$');
-- A date and a time of the schema are finite: the values infinity and -infinity are refused.
CREATE DOMAIN finite_timestamptz AS timestamptz CONSTRAINT finite_timestamptz_check CHECK (isfinite(VALUE));
CREATE DOMAIN finite_date AS date CONSTRAINT finite_date_check CHECK (isfinite(VALUE));

CREATE TABLE companies (
  bpnl bpnl CONSTRAINT companies_pkey PRIMARY KEY,
  legal_name text NOT NULL CONSTRAINT companies_legal_name_check CHECK (length(legal_name) BETWEEN 1 AND 300),
  legal_name_language text NOT NULL DEFAULT 'en',
  address jsonb NOT NULL,
  operator_identifier text,
  created_at finite_timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE battery_models (
  id uuid CONSTRAINT battery_models_pkey PRIMARY KEY DEFAULT gen_random_uuid(),
  manufacturer_bpnl bpnl NOT NULL CONSTRAINT battery_models_manufacturer_fkey REFERENCES companies(bpnl) ON DELETE RESTRICT,
  manufacturer_part_id text NOT NULL CONSTRAINT battery_models_part_id_check CHECK (length(manufacturer_part_id) BETWEEN 1 AND 200),
  original_model_catena_x_id uuid,
  original_model_manufacturer_bpnl bpnl,
  created_at finite_timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT battery_models_original_check CHECK ((original_model_catena_x_id IS NULL) = (original_model_manufacturer_bpnl IS NULL)),
  CONSTRAINT battery_models_manufacturer_part_key UNIQUE (manufacturer_bpnl, manufacturer_part_id),
  CONSTRAINT battery_models_id_manufacturer_key UNIQUE (id, manufacturer_bpnl)
);

CREATE TABLE passports (
  id uuid CONSTRAINT passports_pkey PRIMARY KEY DEFAULT gen_random_uuid(),
  passport_identifier text NOT NULL DEFAULT ('urn:uuid:' || gen_random_uuid()::text) CONSTRAINT passports_passport_identifier_key UNIQUE CONSTRAINT passports_passport_identifier_check CHECK (length(passport_identifier) BETWEEN 1 AND 200),
  battery_identifier text NOT NULL CONSTRAINT passports_battery_identifier_check CHECK (length(battery_identifier) BETWEEN 1 AND 200),
  manufacturer_bpnl bpnl NOT NULL CONSTRAINT passports_manufacturer_fkey REFERENCES companies(bpnl) ON DELETE RESTRICT,
  battery_model_id uuid NOT NULL,
  lifecycle_status text NOT NULL CONSTRAINT passports_lifecycle_status_check CHECK (lifecycle_status IN ('original','repurposed','re-used','remanufactured','waste')),
  battery_category text NOT NULL CONSTRAINT passports_battery_category_check CHECK (battery_category IN ('lmt','ev','industrial','stationary')),
  facility_bpns bpns NOT NULL,
  date_of_manufacture finite_date NOT NULL,
  date_into_service finite_date,
  rated_capacity_ah numeric(10,2) CONSTRAINT passports_rated_capacity_check CHECK (rated_capacity_ah > 0 AND rated_capacity_ah <> 'NaN'),
  capacity_fade_percent numeric(5,2) CONSTRAINT passports_capacity_fade_check CHECK (capacity_fade_percent BETWEEN 0 AND 100),
  power_fade_percent numeric(5,2) CONSTRAINT passports_power_fade_check CHECK (power_fade_percent BETWEEN 0 AND 100),
  expected_lifetime_years numeric(4,1) CONSTRAINT passports_expected_lifetime_check CHECK (expected_lifetime_years > 0 AND expected_lifetime_years <> 'NaN'),
  waste_successor_bpnl bpnl,
  waste_successor_role text CONSTRAINT passports_waste_successor_role_check CHECK (waste_successor_role IN ('producer','producerResponsibilityOrganisation','wasteManagementOperator')),
  waste_date finite_timestamptz,
  successor_authorisation_ref text CONSTRAINT passports_authorisation_ref_check CHECK (length(successor_authorisation_ref) BETWEEN 1 AND 500),
  successor_authorisation_valid_from finite_date,
  successor_authorisation_valid_to finite_date,
  recycling_date finite_timestamptz,
  recycler_bpnl bpnl,
  material_recycling_certificate_catena_x_id uuid,
  lineage_open boolean NOT NULL DEFAULT false,
  created_at finite_timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT passports_battery_model_fkey FOREIGN KEY (battery_model_id, manufacturer_bpnl) REFERENCES battery_models(id, manufacturer_bpnl) ON DELETE RESTRICT,
  CONSTRAINT passports_waste_successor_check CHECK ((lifecycle_status = 'waste') = (waste_successor_bpnl IS NOT NULL) AND (waste_successor_bpnl IS NULL) = (waste_successor_role IS NULL) AND (waste_successor_bpnl IS NULL) = (waste_date IS NULL)),
  CONSTRAINT passports_authorisation_check CHECK ((successor_authorisation_ref IS NULL) = (successor_authorisation_valid_from IS NULL) AND (successor_authorisation_valid_to IS NULL OR successor_authorisation_ref IS NOT NULL) AND (successor_authorisation_valid_to IS NULL OR successor_authorisation_valid_to >= successor_authorisation_valid_from) AND (successor_authorisation_ref IS NULL OR lifecycle_status = 'waste')),
  CONSTRAINT passports_end_check CHECK ((recycling_date IS NULL) = (recycler_bpnl IS NULL) AND (material_recycling_certificate_catena_x_id IS NULL OR recycling_date IS NOT NULL)),
  CONSTRAINT passports_end_after_waste_check CHECK (recycling_date IS NULL OR waste_date IS NULL OR recycling_date >= waste_date)
);
CREATE INDEX passports_battery_identifier_idx ON passports (battery_identifier);
CREATE INDEX passports_battery_model_idx ON passports (battery_model_id);

CREATE TABLE passport_purposes (
  id bigint GENERATED ALWAYS AS IDENTITY CONSTRAINT passport_purposes_pkey PRIMARY KEY,
  passport_id uuid NOT NULL CONSTRAINT passport_purposes_passport_fkey REFERENCES passports(id) ON DELETE RESTRICT,
  purpose text NOT NULL CONSTRAINT passport_purposes_purpose_check CHECK (length(purpose) BETWEEN 1 AND 2000),
  is_original boolean NOT NULL,
  recorded_at finite_timestamptz NOT NULL,
  created_at finite_timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX passport_purposes_original_key ON passport_purposes (passport_id) WHERE is_original;
CREATE INDEX passport_purposes_passport_idx ON passport_purposes (passport_id);

CREATE TABLE passport_aspect_payloads (
  passport_id uuid NOT NULL CONSTRAINT passport_aspect_payloads_passport_fkey REFERENCES passports(id) ON DELETE RESTRICT,
  aspect_key text NOT NULL CONSTRAINT passport_aspect_payloads_key_check CHECK (aspect_key IN ('digital-nameplate','handover-documentation','carbon-footprint','technical-data','product-condition','material-composition','circularity','dpp-metadata','serial-part','single-level-bom-as-built')),
  payload jsonb NOT NULL,
  updated_at finite_timestamptz NOT NULL DEFAULT now(),
  created_at finite_timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT passport_aspect_payloads_pkey PRIMARY KEY (passport_id, aspect_key)
);

CREATE TABLE notifications_received (
  message_id text CONSTRAINT notifications_received_pkey PRIMARY KEY,
  operation text NOT NULL CONSTRAINT notifications_received_operation_check CHECK (operation IN ('NewPassportIssued','BatteryRepaired','BatteryBecameWaste','PassportEnded')),
  sender_bpnl bpnl NOT NULL,
  passport_identifier text NOT NULL,
  message jsonb NOT NULL,
  outcome text NOT NULL CONSTRAINT notifications_received_outcome_check CHECK (outcome IN ('applied','recorded')),
  received_at finite_timestamptz NOT NULL,
  created_at finite_timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX notifications_received_passport_idx ON notifications_received (passport_identifier, operation);

CREATE TABLE notifications_sent (
  id bigint GENERATED ALWAYS AS IDENTITY CONSTRAINT notifications_sent_pkey PRIMARY KEY,
  message_id text NOT NULL CONSTRAINT notifications_sent_message_id_key UNIQUE,
  operation text NOT NULL CONSTRAINT notifications_sent_operation_check CHECK (operation IN ('NewPassportIssued','BatteryRepaired','BatteryBecameWaste','PassportEnded')),
  receiver_bpnl bpnl NOT NULL,
  passport_identifier text NOT NULL,
  message jsonb NOT NULL,
  not_before finite_timestamptz NOT NULL,
  outcome text NOT NULL DEFAULT 'pending' CONSTRAINT notifications_sent_outcome_check CHECK (outcome IN ('pending','sent','no_asset','contract_refused','receiver_refused','receiver_unresolved','transport_failed')),
  cause text,
  http_status integer,
  attempts integer NOT NULL DEFAULT 0,
  attempted_at finite_timestamptz,
  receiver_did text,
  receiver_connector_url text,
  created_at finite_timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX notifications_sent_due_idx ON notifications_sent (not_before, id) WHERE outcome = 'pending';

CREATE TABLE passport_lineage_links (
  id bigint GENERATED ALWAYS AS IDENTITY CONSTRAINT passport_lineage_links_pkey PRIMARY KEY,
  passport_id uuid NOT NULL CONSTRAINT passport_lineage_links_passport_fkey REFERENCES passports(id) ON DELETE RESTRICT,
  predecessor_passport_identifier text NOT NULL,
  predecessor_catena_x_id uuid NOT NULL,
  predecessor_data_provider_bpnl bpnl NOT NULL,
  predecessor_battery_identifier text NOT NULL,
  predecessor_status text NOT NULL CONSTRAINT passport_lineage_links_status_check CHECK (predecessor_status IN ('original','repurposed','re-used','remanufactured','waste')),
  predecessor_original_model_catena_x_id uuid NOT NULL,
  operation text NOT NULL CONSTRAINT passport_lineage_links_operation_check CHECK (operation IN ('preparationForReUse','preparationForRepurposing','repurposing','remanufacturing')),
  operation_date finite_timestamptz NOT NULL,
  created_at finite_timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT passport_lineage_links_predecessor_key UNIQUE (passport_id, predecessor_passport_identifier)
);

CREATE TABLE passport_successor_links (
  id bigint GENERATED ALWAYS AS IDENTITY CONSTRAINT passport_successor_links_pkey PRIMARY KEY,
  passport_id uuid NOT NULL CONSTRAINT passport_successor_links_passport_fkey REFERENCES passports(id) ON DELETE RESTRICT,
  successor_passport_identifier text NOT NULL,
  successor_catena_x_id uuid NOT NULL,
  second_life_operator_bpnl bpnl NOT NULL,
  operation text NOT NULL CONSTRAINT passport_successor_links_operation_check CHECK (operation IN ('preparationForReUse','preparationForRepurposing','repurposing','remanufacturing')),
  operation_date finite_timestamptz NOT NULL,
  notification_message_id text NOT NULL CONSTRAINT passport_successor_links_notification_fkey REFERENCES notifications_received(message_id) ON DELETE RESTRICT,
  created_at finite_timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT passport_successor_links_successor_key UNIQUE (passport_id, successor_passport_identifier)
);

CREATE TABLE passport_repair_entries (
  id bigint GENERATED ALWAYS AS IDENTITY CONSTRAINT passport_repair_entries_pkey PRIMARY KEY,
  passport_id uuid NOT NULL CONSTRAINT passport_repair_entries_passport_fkey REFERENCES passports(id) ON DELETE RESTRICT,
  repair_date finite_timestamptz NOT NULL,
  repair_certificate_catena_x_id uuid NOT NULL,
  repairer_bpnl bpnl NOT NULL,
  notification_message_id text CONSTRAINT passport_repair_entries_notification_fkey REFERENCES notifications_received(message_id) ON DELETE RESTRICT,
  created_at finite_timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT passport_repair_entries_certificate_key UNIQUE (passport_id, repair_certificate_catena_x_id)
);

CREATE TABLE passport_responsibility_intervals (
  id bigint GENERATED ALWAYS AS IDENTITY CONSTRAINT passport_responsibility_intervals_pkey PRIMARY KEY,
  passport_id uuid NOT NULL CONSTRAINT passport_responsibility_intervals_passport_fkey REFERENCES passports(id) ON DELETE RESTRICT,
  responsible_bpnl bpnl NOT NULL,
  role text NOT NULL CONSTRAINT passport_responsibility_intervals_role_check CHECK (role IN ('economicOperator','producer','producerResponsibilityOrganisation','wasteManagementOperator')),
  valid_from finite_timestamptz NOT NULL,
  valid_to finite_timestamptz CONSTRAINT passport_responsibility_intervals_period_check CHECK (valid_to >= valid_from),
  created_at finite_timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX passport_responsibility_intervals_open_key ON passport_responsibility_intervals (passport_id) WHERE valid_to IS NULL;

CREATE TABLE access_map_versions (
  id bigint GENERATED ALWAYS AS IDENTITY CONSTRAINT access_map_versions_pkey PRIMARY KEY,
  battery_model_id uuid NOT NULL CONSTRAINT access_map_versions_model_fkey REFERENCES battery_models(id) ON DELETE RESTRICT,
  map_version text NOT NULL,
  valid_from finite_date NOT NULL,
  created_at finite_timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT access_map_versions_model_version_key UNIQUE (battery_model_id, map_version)
);

CREATE TABLE access_map_entries (
  map_id bigint NOT NULL CONSTRAINT access_map_entries_map_fkey REFERENCES access_map_versions(id) ON DELETE RESTRICT,
  aspect text NOT NULL,
  twin_level text NOT NULL CONSTRAINT access_map_entries_twin_level_check CHECK (twin_level IN ('PartType','PartInstance')),
  path text NOT NULL,
  access_group text NOT NULL CONSTRAINT access_map_entries_group_check CHECK (access_group IN ('public','legitimateInterestModel','authorities','legitimateInterestBattery')),
  legal_basis text NOT NULL,
  created_at finite_timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT access_map_entries_pkey PRIMARY KEY (map_id, aspect, twin_level, path)
);

CREATE TABLE passport_access_records (
  id bigint GENERATED ALWAYS AS IDENTITY CONSTRAINT passport_access_records_pkey PRIMARY KEY,
  passport_id uuid NOT NULL CONSTRAINT passport_access_records_passport_fkey REFERENCES passports(id) ON DELETE RESTRICT,
  recipient_bpnl bpnl NOT NULL,
  recipient_role text NOT NULL CONSTRAINT passport_access_records_role_check CHECK (recipient_role IN ('purchaser','purchaserAgent','responsibleOperator','successor','marketSurveillanceAuthority','authorisedRecipient')),
  aspect_key text NOT NULL CONSTRAINT passport_access_records_key_check CHECK (aspect_key IN ('digital-nameplate','handover-documentation','carbon-footprint','technical-data','product-condition','material-composition','circularity','dpp-metadata','serial-part','single-level-bom-as-built','lifecycle','successors')),
  valid_from finite_timestamptz NOT NULL,
  valid_to finite_timestamptz CONSTRAINT passport_access_records_period_check CHECK (valid_to >= valid_from),
  created_at finite_timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX passport_access_records_open_key ON passport_access_records (passport_id, recipient_bpnl, aspect_key, recipient_role) WHERE valid_to IS NULL;

CREATE TABLE passport_write_decisions (
  id bigint GENERATED ALWAYS AS IDENTITY CONSTRAINT passport_write_decisions_pkey PRIMARY KEY,
  decided_at finite_timestamptz NOT NULL,
  decision text NOT NULL CONSTRAINT passport_write_decisions_decision_check CHECK (decision IN ('granted','refused')),
  requester_bpnl bpnl NOT NULL,
  requester_kind text NOT NULL CONSTRAINT passport_write_decisions_kind_check CHECK (requester_kind IN ('operator','partner')),
  passport_id uuid,
  action text NOT NULL,
  relied_on text,
  refusal_id text,
  details jsonb,
  created_at finite_timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX passport_write_decisions_passport_idx ON passport_write_decisions (passport_id);

CREATE TABLE issuer_contracts (
  id uuid CONSTRAINT issuer_contracts_pkey PRIMARY KEY DEFAULT gen_random_uuid(),
  side text NOT NULL CONSTRAINT issuer_contracts_side_check CHECK (side IN ('provider','issuer')),
  passport_identifier text NOT NULL,
  battery_identifier text,
  passport_id uuid CONSTRAINT issuer_contracts_passport_fkey REFERENCES passports(id) ON DELETE RESTRICT,
  issuer_bpnl bpnl NOT NULL,
  provider_bpnl bpnl NOT NULL,
  product_condition jsonb,
  pull_state text CONSTRAINT issuer_contracts_pull_state_check CHECK (pull_state IN ('pending','received','no_asset','contract_refused','provider_refused','receiver_unresolved','transport_failed')),
  pull_cause text,
  valid_from finite_timestamptz NOT NULL,
  valid_to finite_timestamptz,
  created_at finite_timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT issuer_contracts_side_columns_check CHECK ((side = 'issuer') = (pull_state IS NOT NULL) AND (side = 'provider' OR (passport_id IS NULL AND product_condition IS NULL AND battery_identifier IS NOT NULL)) AND (side = 'issuer' OR ((passport_id IS NULL) <> (product_condition IS NULL))))
);
CREATE UNIQUE INDEX issuer_contracts_open_key ON issuer_contracts (side, passport_identifier, issuer_bpnl, provider_bpnl) WHERE valid_to IS NULL;

CREATE TABLE received_battery_information (
  id bigint GENERATED ALWAYS AS IDENTITY CONSTRAINT received_battery_information_pkey PRIMARY KEY,
  contract_id uuid NOT NULL CONSTRAINT received_battery_information_contract_fkey REFERENCES issuer_contracts(id) ON DELETE RESTRICT,
  passport_identifier text NOT NULL,
  battery_identifier text NOT NULL,
  agreement_id text NOT NULL,
  payload jsonb NOT NULL,
  received_at finite_timestamptz NOT NULL,
  created_at finite_timestamptz NOT NULL DEFAULT now()
);

-- The fixed search path of every function of the schema: the schema of the migration first and the
-- temporary schema last, so that no temporary table of a session replaces a table inside a function.
-- Every migration file ends with this statement.
DO $$
DECLARE
  f regprocedure;
BEGIN
  FOR f IN SELECT p.oid::regprocedure FROM pg_proc p WHERE p.pronamespace = (SELECT n.oid FROM pg_namespace n WHERE n.nspname = current_schema()) LOOP
    EXECUTE format('ALTER FUNCTION %s SET search_path = %I, pg_temp', f, current_schema());
  END LOOP;
END $$;
````

#### File: `server/src/db/migrations/002_triggers.sql` (phase P3)

````text
--------------------------------------------------------------------------------
-- Copyright (c) 2026 Ichnos Protocol Pte. Ltd.
-- Copyright (c) 2026 Contributors to the Eclipse Foundation
--
-- See the NOTICE file(s) distributed with this work for additional
-- information regarding copyright ownership.
--
-- This program and the accompanying materials are made available under the
-- terms of the Apache License, Version 2.0 which is available at
-- https://www.apache.org/licenses/LICENSE-2.0.
--
-- Unless required by applicable law or agreed to in writing, software
-- distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
-- WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
-- License for the specific language governing permissions and limitations
-- under the License.
--
-- SPDX-License-Identifier: Apache-2.0
--------------------------------------------------------------------------------
-- Migration 002: the sixteen functions and the thirty-seven triggers of the reference server.
-- Every refusal of a rule is raised with the error code P0001, and its message starts with the refusal id.
-- The last statement of the file fixes the search path of every function of the schema.

CREATE FUNCTION require_read_committed() RETURNS void LANGUAGE plpgsql STABLE SECURITY INVOKER AS $$
BEGIN
  IF current_setting('transaction_isolation') <> 'read committed' THEN
    RAISE EXCEPTION 'ERR-DB-ISOLATION: A transaction that writes a record of this schema runs at the isolation level READ COMMITTED.' USING ERRCODE = 'P0001';
  END IF;
END $$;

CREATE FUNCTION app_today() RETURNS date LANGUAGE plpgsql STABLE SECURITY INVOKER SET datestyle = 'ISO, YMD' AS $$
DECLARE
  setting text := NULLIF(current_setting('app.today', true), '');
BEGIN
  IF setting IS NULL THEN
    RETURN NULL;
  END IF;
  IF setting !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN
    RAISE EXCEPTION 'ERR-DB-TODAY: The setting app.today is a date of the form YYYY-MM-DD.' USING ERRCODE = '22007';
  END IF;
  BEGIN
    RETURN setting::date;
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'ERR-DB-TODAY: The setting app.today is a date of the form YYYY-MM-DD.' USING ERRCODE = '22007';
  END;
END $$;

CREATE FUNCTION refuse_passport_id_change() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER AS $$
BEGIN
  PERFORM require_read_committed();
  IF NEW.passport_id IS DISTINCT FROM OLD.passport_id THEN
    RAISE EXCEPTION 'ERR-DB-APPEND-ONLY: A record never moves to another passport.' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_fixed_passport_passport_purposes BEFORE UPDATE ON passport_purposes FOR EACH ROW EXECUTE FUNCTION refuse_passport_id_change();
CREATE TRIGGER trg_fixed_passport_passport_aspect_payloads BEFORE UPDATE ON passport_aspect_payloads FOR EACH ROW EXECUTE FUNCTION refuse_passport_id_change();
CREATE TRIGGER trg_fixed_passport_passport_lineage_links BEFORE UPDATE ON passport_lineage_links FOR EACH ROW EXECUTE FUNCTION refuse_passport_id_change();
CREATE TRIGGER trg_fixed_passport_passport_successor_links BEFORE UPDATE ON passport_successor_links FOR EACH ROW EXECUTE FUNCTION refuse_passport_id_change();
CREATE TRIGGER trg_fixed_passport_passport_repair_entries BEFORE UPDATE ON passport_repair_entries FOR EACH ROW EXECUTE FUNCTION refuse_passport_id_change();
CREATE TRIGGER trg_fixed_passport_passport_responsibility_intervals BEFORE UPDATE ON passport_responsibility_intervals FOR EACH ROW EXECUTE FUNCTION refuse_passport_id_change();
CREATE TRIGGER trg_fixed_passport_passport_access_records BEFORE UPDATE ON passport_access_records FOR EACH ROW EXECUTE FUNCTION refuse_passport_id_change();
CREATE TRIGGER trg_fixed_passport_passport_write_decisions BEFORE UPDATE ON passport_write_decisions FOR EACH ROW EXECUTE FUNCTION refuse_passport_id_change();
CREATE TRIGGER trg_fixed_passport_issuer_contracts BEFORE UPDATE ON issuer_contracts FOR EACH ROW EXECUTE FUNCTION refuse_passport_id_change();

CREATE FUNCTION set_passport_insert_defaults() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER AS $$
BEGIN
  PERFORM require_read_committed();
  NEW.lineage_open := NEW.lifecycle_status IN ('re-used', 'repurposed', 'remanufactured');
  RETURN NEW;
END $$;
CREATE TRIGGER trg_passport_insert BEFORE INSERT ON passports FOR EACH ROW EXECUTE FUNCTION set_passport_insert_defaults();

CREATE FUNCTION refuse_passport_identity_change() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER AS $$
BEGIN
  PERFORM require_read_committed();
  IF NEW.id IS DISTINCT FROM OLD.id
     OR NEW.passport_identifier IS DISTINCT FROM OLD.passport_identifier
     OR NEW.battery_identifier IS DISTINCT FROM OLD.battery_identifier
     OR NEW.manufacturer_bpnl IS DISTINCT FROM OLD.manufacturer_bpnl
     OR NEW.battery_model_id IS DISTINCT FROM OLD.battery_model_id THEN
    RAISE EXCEPTION 'ERR-DB-IDENTITY-PERMANENT: The identifiers, the manufacturer and the battery model of a passport never change.' USING ERRCODE = 'P0001';
  END IF;
  IF OLD.lifecycle_status = 'waste'
     AND (NEW.waste_successor_bpnl IS DISTINCT FROM OLD.waste_successor_bpnl
          OR NEW.waste_successor_role IS DISTINCT FROM OLD.waste_successor_role
          OR NEW.waste_date IS DISTINCT FROM OLD.waste_date) THEN
    RAISE EXCEPTION 'ERR-DB-WASTE-SUCCESSOR: The named successor, its role and the waste date of a waste passport never change.' USING ERRCODE = 'P0001';
  END IF;
  IF NEW.lineage_open AND NOT OLD.lineage_open THEN
    RAISE EXCEPTION 'ERR-DB-LINEAGE: The lineage of a passport is never opened again.' USING ERRCODE = 'P0001';
  END IF;
  IF (NEW.date_into_service IS NULL OR NEW.rated_capacity_ah IS NULL OR NEW.capacity_fade_percent IS NULL
      OR NEW.power_fade_percent IS NULL OR NEW.expected_lifetime_years IS NULL)
     AND EXISTS (SELECT 1 FROM passport_lineage_links l WHERE l.passport_id = NEW.id) THEN
    RAISE EXCEPTION 'ERR-DB-LINEAGE: A new passport keeps a date of putting into service and its four performance values.' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_passport_identity BEFORE UPDATE ON passports FOR EACH ROW EXECUTE FUNCTION refuse_passport_identity_change();

CREATE FUNCTION refuse_battery_model_change() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER AS $$
BEGIN
  PERFORM require_read_committed();
  RAISE EXCEPTION 'ERR-DB-IDENTITY-PERMANENT: A battery model is never updated and never deleted.' USING ERRCODE = 'P0001';
END $$;
CREATE TRIGGER trg_battery_model_identity BEFORE UPDATE OR DELETE ON battery_models FOR EACH ROW EXECUTE FUNCTION refuse_battery_model_change();

CREATE FUNCTION check_passport_status_change() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER AS $$
BEGIN
  PERFORM require_read_committed();
  IF NEW.lifecycle_status IS DISTINCT FROM OLD.lifecycle_status THEN
    IF NEW.lifecycle_status = 'waste' THEN
      RETURN NEW;
    END IF;
    IF NEW.lifecycle_status = 're-used' AND OLD.lifecycle_status IN ('original', 'repurposed', 'remanufactured') THEN
      RETURN NEW;
    END IF;
    RAISE EXCEPTION 'ERR-DB-STATUS-CHANGE: The status of a passport changes only to waste, or to re-used from original, repurposed or remanufactured.' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_passport_status_change BEFORE UPDATE OF lifecycle_status ON passports FOR EACH ROW EXECUTE FUNCTION check_passport_status_change();

CREATE FUNCTION refuse_change_of_ended_passport() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER AS $$
BEGIN
  PERFORM require_read_committed();
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'ERR-DB-PASSPORT-ENDED: A passport is never deleted.' USING ERRCODE = 'P0001';
  END IF;
  IF OLD.recycling_date IS NOT NULL THEN
    RAISE EXCEPTION 'ERR-DB-PASSPORT-ENDED: An ended passport never changes.' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_passport_ended BEFORE UPDATE OR DELETE ON passports FOR EACH ROW EXECUTE FUNCTION refuse_change_of_ended_passport();

CREATE FUNCTION check_passport_after_waste() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER AS $$
DECLARE
  today date;
  in_force boolean;
  exempt text[] := ARRAY['successor_authorisation_ref', 'successor_authorisation_valid_from', 'successor_authorisation_valid_to',
                         'recycling_date', 'recycler_bpnl', 'material_recycling_certificate_catena_x_id'];
BEGIN
  PERFORM require_read_committed();
  IF OLD.recycling_date IS NOT NULL THEN
    RETURN NEW;
  END IF;
  IF OLD.lifecycle_status <> 'waste' THEN
    RETURN NEW;
  END IF;
  today := app_today();
  in_force := today IS NOT NULL
    AND OLD.successor_authorisation_valid_from IS NOT NULL
    AND OLD.successor_authorisation_valid_from <= today
    AND (OLD.successor_authorisation_valid_to IS NULL OR OLD.successor_authorisation_valid_to >= today);
  IF NOT in_force AND (to_jsonb(NEW) - exempt) IS DISTINCT FROM (to_jsonb(OLD) - exempt) THEN
    RAISE EXCEPTION 'ERR-DB-SUCCESSOR-AUTHORISATION: A waste passport changes only under an authorisation of the successor that is in force.' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_passport_after_waste BEFORE UPDATE ON passports FOR EACH ROW EXECUTE FUNCTION check_passport_after_waste();

CREATE FUNCTION check_child_after_waste() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER AS $$
DECLARE
  pid uuid;
  p passports%ROWTYPE;
  today date;
BEGIN
  PERFORM require_read_committed();
  IF TG_OP = 'DELETE' THEN
    pid := OLD.passport_id;
  ELSE
    pid := NEW.passport_id;
  END IF;
  SELECT * INTO p FROM passports WHERE id = pid FOR SHARE;
  IF FOUND AND p.recycling_date IS NULL AND p.lifecycle_status = 'waste' THEN
    today := app_today();
    IF today IS NULL OR p.successor_authorisation_valid_from IS NULL OR p.successor_authorisation_valid_from > today
       OR (p.successor_authorisation_valid_to IS NOT NULL AND p.successor_authorisation_valid_to < today) THEN
      RAISE EXCEPTION 'ERR-DB-SUCCESSOR-AUTHORISATION: A record of a waste passport changes only under an authorisation of the successor that is in force.' USING ERRCODE = 'P0001';
    END IF;
  END IF;
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_passport_aspect_payloads_after_waste BEFORE INSERT OR UPDATE OR DELETE ON passport_aspect_payloads FOR EACH ROW EXECUTE FUNCTION check_child_after_waste();
CREATE TRIGGER trg_passport_purposes_after_waste BEFORE INSERT OR UPDATE OR DELETE ON passport_purposes FOR EACH ROW EXECUTE FUNCTION check_child_after_waste();
CREATE TRIGGER trg_passport_repair_entries_after_waste BEFORE INSERT OR UPDATE OR DELETE ON passport_repair_entries FOR EACH ROW EXECUTE FUNCTION check_child_after_waste();
CREATE TRIGGER trg_passport_successor_links_after_waste BEFORE INSERT OR UPDATE OR DELETE ON passport_successor_links FOR EACH ROW EXECUTE FUNCTION check_child_after_waste();
CREATE TRIGGER trg_passport_lineage_links_after_waste BEFORE INSERT OR UPDATE OR DELETE ON passport_lineage_links FOR EACH ROW EXECUTE FUNCTION check_child_after_waste();

CREATE FUNCTION check_passport_lineage() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER AS $$
DECLARE
  has_link boolean;
  still_open boolean;
BEGIN
  PERFORM require_read_committed();
  IF NEW.lifecycle_status = 'waste' THEN
    RAISE EXCEPTION 'ERR-DB-LINEAGE: A passport is never inserted with the status waste.' USING ERRCODE = 'P0001';
  END IF;
  SELECT EXISTS (SELECT 1 FROM passport_lineage_links l WHERE l.passport_id = NEW.id) INTO has_link;
  SELECT p.lineage_open INTO still_open FROM passports p WHERE p.id = NEW.id;
  IF NEW.lifecycle_status = 'original' AND has_link THEN
    RAISE EXCEPTION 'ERR-DB-LINEAGE: A passport that is inserted with the status original has no lineage link.' USING ERRCODE = 'P0001';
  END IF;
  IF NEW.lifecycle_status IN ('re-used', 'repurposed', 'remanufactured')
     AND (NOT has_link OR NEW.date_into_service IS NULL OR NEW.rated_capacity_ah IS NULL OR NEW.capacity_fade_percent IS NULL
          OR NEW.power_fade_percent IS NULL OR NEW.expected_lifetime_years IS NULL) THEN
    RAISE EXCEPTION 'ERR-DB-LINEAGE: A new passport has a lineage link, a date of putting into service and its four performance values.' USING ERRCODE = 'P0001';
  END IF;
  IF (SELECT count(DISTINCT l.operation_date) FROM passport_lineage_links l WHERE l.passport_id = NEW.id) > 1 THEN
    RAISE EXCEPTION 'ERR-DB-LINEAGE: The lineage links of a new passport hold one operation date.' USING ERRCODE = 'P0001';
  END IF;
  IF still_open THEN
    RAISE EXCEPTION 'ERR-DB-LINEAGE: The lineage of a new passport is closed before the commit.' USING ERRCODE = 'P0001';
  END IF;
  RETURN NULL;
END $$;
CREATE CONSTRAINT TRIGGER trg_passport_lineage AFTER INSERT ON passports DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION check_passport_lineage();

CREATE FUNCTION check_responsibility() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER AS $$
DECLARE
  pid uuid;
  p passports%ROWTYPE;
  f passport_responsibility_intervals%ROWTYPE;
  o passport_responsibility_intervals%ROWTYPE;
  interval_count integer;
  open_count integer;
  first_start timestamptz;
BEGIN
  PERFORM require_read_committed();
  IF TG_TABLE_NAME = 'passports' THEN
    pid := NEW.id;
  ELSE
    pid := NEW.passport_id;
  END IF;
  SELECT * INTO p FROM passports WHERE id = pid;
  SELECT count(*), count(*) FILTER (WHERE i.valid_to IS NULL) INTO interval_count, open_count
    FROM passport_responsibility_intervals i WHERE i.passport_id = pid;
  IF open_count <> 1 THEN
    RAISE EXCEPTION 'ERR-DB-RESPONSIBILITY: A passport has exactly one open responsibility interval.' USING ERRCODE = 'P0001';
  END IF;
  SELECT * INTO f FROM passport_responsibility_intervals i WHERE i.passport_id = pid ORDER BY i.valid_from, i.id LIMIT 1;
  SELECT * INTO o FROM passport_responsibility_intervals i WHERE i.passport_id = pid AND i.valid_to IS NULL;
  SELECT max(l.operation_date) INTO first_start FROM passport_lineage_links l WHERE l.passport_id = pid;
  IF first_start IS NULL THEN
    first_start := (p.date_of_manufacture::date::timestamp AT TIME ZONE 'UTC');
  END IF;
  IF f.responsible_bpnl <> p.manufacturer_bpnl OR f.role <> 'economicOperator' OR f.valid_from <> first_start THEN
    RAISE EXCEPTION 'ERR-DB-RESPONSIBILITY: The first responsibility interval of a passport names the manufacturer as economic operator and starts at the date of manufacture at 00:00:00 UTC, or at the operation date of the lineage links of a new passport.' USING ERRCODE = 'P0001';
  END IF;
  IF p.lifecycle_status = 'waste' THEN
    IF interval_count <> 2 OR o.id = f.id OR f.valid_to IS DISTINCT FROM p.waste_date
       OR o.responsible_bpnl <> p.waste_successor_bpnl OR o.role <> p.waste_successor_role OR o.valid_from <> p.waste_date THEN
      RAISE EXCEPTION 'ERR-DB-WASTE-SUCCESSOR: The open responsibility interval of a waste passport names the successor and starts at the waste date, at which the earlier interval ends.' USING ERRCODE = 'P0001';
    END IF;
  ELSIF interval_count <> 1 THEN
    RAISE EXCEPTION 'ERR-DB-RESPONSIBILITY: A passport that is not waste has one responsibility interval.' USING ERRCODE = 'P0001';
  END IF;
  IF p.recycling_date IS NOT NULL AND p.recycling_date < o.valid_from THEN
    RAISE EXCEPTION 'ERR-DB-END-DATE: The recycling date of a passport is not before the start of its open responsibility interval.' USING ERRCODE = 'P0001';
  END IF;
  RETURN NULL;
END $$;
CREATE CONSTRAINT TRIGGER trg_passport_responsibility AFTER INSERT OR UPDATE ON passports DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION check_responsibility();
CREATE CONSTRAINT TRIGGER trg_interval_responsibility AFTER INSERT OR UPDATE ON passport_responsibility_intervals DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION check_responsibility();

CREATE FUNCTION refuse_change() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER AS $$
BEGIN
  PERFORM require_read_committed();
  RAISE EXCEPTION 'ERR-DB-APPEND-ONLY: A record of this table is never updated and never deleted.' USING ERRCODE = 'P0001';
END $$;
CREATE TRIGGER trg_passport_purposes_append_only BEFORE UPDATE OR DELETE ON passport_purposes FOR EACH ROW EXECUTE FUNCTION refuse_change();
CREATE TRIGGER trg_passport_lineage_links_append_only BEFORE UPDATE OR DELETE ON passport_lineage_links FOR EACH ROW EXECUTE FUNCTION refuse_change();
CREATE TRIGGER trg_passport_repair_entries_append_only BEFORE UPDATE OR DELETE ON passport_repair_entries FOR EACH ROW EXECUTE FUNCTION refuse_change();
CREATE TRIGGER trg_passport_successor_links_append_only BEFORE UPDATE OR DELETE ON passport_successor_links FOR EACH ROW EXECUTE FUNCTION refuse_change();
CREATE TRIGGER trg_notifications_received_append_only BEFORE UPDATE OR DELETE ON notifications_received FOR EACH ROW EXECUTE FUNCTION refuse_change();
CREATE TRIGGER trg_passport_write_decisions_append_only BEFORE UPDATE OR DELETE ON passport_write_decisions FOR EACH ROW EXECUTE FUNCTION refuse_change();
CREATE TRIGGER trg_received_battery_information_append_only BEFORE UPDATE OR DELETE ON received_battery_information FOR EACH ROW EXECUTE FUNCTION refuse_change();

CREATE FUNCTION check_interval_change() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER AS $$
DECLARE
  ended timestamptz;
BEGIN
  PERFORM require_read_committed();
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'ERR-DB-APPEND-ONLY: A responsibility interval is never deleted.' USING ERRCODE = 'P0001';
  END IF;
  IF TG_OP = 'INSERT' THEN
    SELECT recycling_date INTO ended FROM passports WHERE id = NEW.passport_id FOR SHARE;
    IF ended IS NOT NULL THEN
      RAISE EXCEPTION 'ERR-DB-PASSPORT-ENDED: A record of an ended passport never changes.' USING ERRCODE = 'P0001';
    END IF;
    IF NEW.valid_to IS NOT NULL
       OR EXISTS (SELECT 1 FROM passport_responsibility_intervals i WHERE i.passport_id = NEW.passport_id AND i.valid_to IS NULL)
       OR NEW.valid_from IS DISTINCT FROM COALESCE((SELECT max(i.valid_to) FROM passport_responsibility_intervals i WHERE i.passport_id = NEW.passport_id), NEW.valid_from) THEN
      RAISE EXCEPTION 'ERR-DB-RESPONSIBILITY: A responsibility interval is inserted open and starts at the end of the earlier interval of its passport.' USING ERRCODE = 'P0001';
    END IF;
    RETURN NEW;
  END IF;
  IF OLD.valid_to IS NOT NULL OR (to_jsonb(NEW) - 'valid_to') IS DISTINCT FROM (to_jsonb(OLD) - 'valid_to') THEN
    RAISE EXCEPTION 'ERR-DB-APPEND-ONLY: Only the end of an open responsibility interval is set.' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_interval_change BEFORE INSERT OR UPDATE OR DELETE ON passport_responsibility_intervals FOR EACH ROW EXECUTE FUNCTION check_interval_change();

CREATE FUNCTION refuse_child_of_ended_passport() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER AS $$
DECLARE
  pid uuid;
  ended timestamptz;
BEGIN
  PERFORM require_read_committed();
  IF TG_OP = 'DELETE' THEN
    pid := OLD.passport_id;
  ELSE
    pid := NEW.passport_id;
  END IF;
  SELECT recycling_date INTO ended FROM passports WHERE id = pid FOR SHARE;
  IF ended IS NOT NULL THEN
    RAISE EXCEPTION 'ERR-DB-PASSPORT-ENDED: A record of an ended passport never changes.' USING ERRCODE = 'P0001';
  END IF;
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_passport_aspect_payloads_ended BEFORE INSERT OR UPDATE OR DELETE ON passport_aspect_payloads FOR EACH ROW EXECUTE FUNCTION refuse_child_of_ended_passport();
CREATE TRIGGER trg_passport_successor_links_ended BEFORE INSERT OR UPDATE OR DELETE ON passport_successor_links FOR EACH ROW EXECUTE FUNCTION refuse_child_of_ended_passport();
CREATE TRIGGER trg_passport_repair_entries_ended BEFORE INSERT OR UPDATE OR DELETE ON passport_repair_entries FOR EACH ROW EXECUTE FUNCTION refuse_child_of_ended_passport();
CREATE TRIGGER trg_passport_purposes_ended BEFORE INSERT OR UPDATE OR DELETE ON passport_purposes FOR EACH ROW EXECUTE FUNCTION refuse_child_of_ended_passport();
CREATE TRIGGER trg_passport_responsibility_intervals_ended BEFORE INSERT OR UPDATE ON passport_responsibility_intervals FOR EACH ROW EXECUTE FUNCTION refuse_child_of_ended_passport();

CREATE FUNCTION check_lineage_link_insert() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER AS $$
DECLARE
  is_open boolean;
BEGIN
  PERFORM require_read_committed();
  SELECT p.lineage_open INTO is_open FROM passports p WHERE p.id = NEW.passport_id FOR UPDATE;
  IF is_open IS NOT TRUE THEN
    RAISE EXCEPTION 'ERR-DB-LINEAGE: A lineage link is inserted only while the lineage of its new passport is open.' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_passport_lineage_links_insert BEFORE INSERT ON passport_lineage_links FOR EACH ROW EXECUTE FUNCTION check_lineage_link_insert();

-- The fixed search path of every function of the schema: the schema of the migration first and the
-- temporary schema last, so that no temporary table of a session replaces a table inside a function.
-- Every migration file ends with this statement.
DO $$
DECLARE
  f regprocedure;
BEGIN
  FOR f IN SELECT p.oid::regprocedure FROM pg_proc p WHERE p.pronamespace = (SELECT n.oid FROM pg_namespace n WHERE n.nspname = current_schema()) LOOP
    EXECUTE format('ALTER FUNCTION %s SET search_path = %I, pg_temp', f, current_schema());
  END LOOP;
END $$;
````

#### File: `server/src/db/migrations/003_policies.sql` (phase P3)

````text
--------------------------------------------------------------------------------
-- Copyright (c) 2026 Ichnos Protocol Pte. Ltd.
-- Copyright (c) 2026 Contributors to the Eclipse Foundation
--
-- See the NOTICE file(s) distributed with this work for additional
-- information regarding copyright ownership.
--
-- This program and the accompanying materials are made available under the
-- terms of the Apache License, Version 2.0 which is available at
-- https://www.apache.org/licenses/LICENSE-2.0.
--
-- Unless required by applicable law or agreed to in writing, software
-- distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
-- WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
-- License for the specific language governing permissions and limitations
-- under the License.
--
-- SPDX-License-Identifier: Apache-2.0
--------------------------------------------------------------------------------
-- Migration 003: the privileges of the role refserver_app and the twelve row-level security policies.
-- The role refserver_app exists before this file runs; the file creates no role.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'refserver_app') THEN
    RAISE EXCEPTION 'The role refserver_app does not exist. Run "npm run create-role" before "npm run migrate".';
  END IF;
  EXECUTE format('GRANT USAGE ON SCHEMA %I TO refserver_app', current_schema());
  -- The server creates no temporary table. Every role holds the privilege TEMPORARY of a database through PUBLIC.
  IF has_database_privilege('refserver_app', current_database(), 'TEMPORARY') THEN
    EXECUTE format('REVOKE TEMPORARY ON DATABASE %I FROM PUBLIC', current_database());
  END IF;
  IF has_database_privilege('refserver_app', current_database(), 'TEMPORARY') THEN
    RAISE EXCEPTION 'ERR-DB-ROLE-PRIVILEGE: The role refserver_app holds the privilege TEMPORARY of the database. The owner of the database revokes the privilege from PUBLIC before the migration.';
  END IF;
  IF has_schema_privilege('refserver_app', current_schema(), 'CREATE')
     OR (to_regnamespace('public') IS NOT NULL AND has_schema_privilege('refserver_app', 'public', 'CREATE')) THEN
    RAISE EXCEPTION 'ERR-DB-ROLE-PRIVILEGE: The role refserver_app holds the privilege CREATE of a schema. The owner of the schema revokes the privilege before the migration.';
  END IF;
  -- A stored setting of the role changes every later connection of the server.
  IF EXISTS (SELECT 1 FROM pg_db_role_setting s JOIN pg_roles r ON r.oid = s.setrole WHERE r.rolname = 'refserver_app') THEN
    RAISE EXCEPTION 'ERR-DB-ROLE-PRIVILEGE: The role refserver_app holds a stored setting. Run "npm run create-role", which removes every stored setting of the role, before the migration.';
  END IF;
END $$;

-- Every table: SELECT and INSERT. No table: DELETE, TRUNCATE, or UPDATE of the whole row.
GRANT SELECT, INSERT ON companies TO refserver_app;
GRANT SELECT, INSERT ON battery_models TO refserver_app;
GRANT SELECT, INSERT ON passports TO refserver_app;
GRANT SELECT, INSERT ON passport_purposes TO refserver_app;
GRANT SELECT, INSERT ON passport_aspect_payloads TO refserver_app;
GRANT SELECT, INSERT ON notifications_received TO refserver_app;
GRANT SELECT, INSERT ON notifications_sent TO refserver_app;
GRANT SELECT, INSERT ON passport_lineage_links TO refserver_app;
GRANT SELECT, INSERT ON passport_successor_links TO refserver_app;
GRANT SELECT, INSERT ON passport_repair_entries TO refserver_app;
GRANT SELECT, INSERT ON passport_responsibility_intervals TO refserver_app;
GRANT SELECT, INSERT ON access_map_versions TO refserver_app;
GRANT SELECT, INSERT ON access_map_entries TO refserver_app;
GRANT SELECT, INSERT ON passport_access_records TO refserver_app;
GRANT SELECT, INSERT ON passport_write_decisions TO refserver_app;
GRANT SELECT, INSERT ON issuer_contracts TO refserver_app;
GRANT SELECT, INSERT ON received_battery_information TO refserver_app;
-- UPDATE by column, on seven tables: the columns that a step of the server changes.
GRANT UPDATE (legal_name, legal_name_language, address, operator_identifier) ON companies TO refserver_app;
GRANT UPDATE (lifecycle_status, waste_successor_bpnl, waste_successor_role, waste_date, successor_authorisation_ref, successor_authorisation_valid_from, successor_authorisation_valid_to, recycling_date, recycler_bpnl, material_recycling_certificate_catena_x_id, lineage_open) ON passports TO refserver_app;
GRANT UPDATE (payload, updated_at) ON passport_aspect_payloads TO refserver_app;
GRANT UPDATE (valid_to) ON passport_responsibility_intervals TO refserver_app;
GRANT UPDATE (outcome, cause, http_status, attempts, attempted_at, not_before, receiver_did, receiver_connector_url) ON notifications_sent TO refserver_app;
GRANT UPDATE (valid_to) ON passport_access_records TO refserver_app;
GRANT UPDATE (pull_state, pull_cause, valid_to) ON issuer_contracts TO refserver_app;
GRANT SELECT ON schema_migrations TO refserver_app;

ALTER TABLE battery_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE battery_models FORCE ROW LEVEL SECURITY;
ALTER TABLE passports ENABLE ROW LEVEL SECURITY;
ALTER TABLE passports FORCE ROW LEVEL SECURITY;
ALTER TABLE passport_purposes ENABLE ROW LEVEL SECURITY;
ALTER TABLE passport_purposes FORCE ROW LEVEL SECURITY;
ALTER TABLE passport_aspect_payloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE passport_aspect_payloads FORCE ROW LEVEL SECURITY;
ALTER TABLE passport_lineage_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE passport_lineage_links FORCE ROW LEVEL SECURITY;
ALTER TABLE passport_successor_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE passport_successor_links FORCE ROW LEVEL SECURITY;
ALTER TABLE passport_repair_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE passport_repair_entries FORCE ROW LEVEL SECURITY;
ALTER TABLE passport_responsibility_intervals ENABLE ROW LEVEL SECURITY;
ALTER TABLE passport_responsibility_intervals FORCE ROW LEVEL SECURITY;
ALTER TABLE passport_access_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE passport_access_records FORCE ROW LEVEL SECURITY;
ALTER TABLE access_map_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_map_versions FORCE ROW LEVEL SECURITY;
ALTER TABLE access_map_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_map_entries FORCE ROW LEVEL SECURITY;
ALTER TABLE issuer_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE issuer_contracts FORCE ROW LEVEL SECURITY;

CREATE POLICY battery_models_own ON battery_models FOR ALL TO refserver_app
  USING (manufacturer_bpnl = current_setting('app.acting_bpnl', true))
  WITH CHECK (manufacturer_bpnl = current_setting('app.acting_bpnl', true));
CREATE POLICY passports_own ON passports FOR ALL TO refserver_app
  USING (manufacturer_bpnl = current_setting('app.acting_bpnl', true))
  WITH CHECK (manufacturer_bpnl = current_setting('app.acting_bpnl', true));
CREATE POLICY passport_purposes_own ON passport_purposes FOR ALL TO refserver_app
  USING (EXISTS (SELECT 1 FROM passports p WHERE p.id = passport_id AND p.manufacturer_bpnl = current_setting('app.acting_bpnl', true)))
  WITH CHECK (EXISTS (SELECT 1 FROM passports p WHERE p.id = passport_id AND p.manufacturer_bpnl = current_setting('app.acting_bpnl', true)));
CREATE POLICY passport_aspect_payloads_own ON passport_aspect_payloads FOR ALL TO refserver_app
  USING (EXISTS (SELECT 1 FROM passports p WHERE p.id = passport_id AND p.manufacturer_bpnl = current_setting('app.acting_bpnl', true)))
  WITH CHECK (EXISTS (SELECT 1 FROM passports p WHERE p.id = passport_id AND p.manufacturer_bpnl = current_setting('app.acting_bpnl', true)));
CREATE POLICY passport_lineage_links_own ON passport_lineage_links FOR ALL TO refserver_app
  USING (EXISTS (SELECT 1 FROM passports p WHERE p.id = passport_id AND p.manufacturer_bpnl = current_setting('app.acting_bpnl', true)))
  WITH CHECK (EXISTS (SELECT 1 FROM passports p WHERE p.id = passport_id AND p.manufacturer_bpnl = current_setting('app.acting_bpnl', true)));
CREATE POLICY passport_successor_links_own ON passport_successor_links FOR ALL TO refserver_app
  USING (EXISTS (SELECT 1 FROM passports p WHERE p.id = passport_id AND p.manufacturer_bpnl = current_setting('app.acting_bpnl', true)))
  WITH CHECK (EXISTS (SELECT 1 FROM passports p WHERE p.id = passport_id AND p.manufacturer_bpnl = current_setting('app.acting_bpnl', true)));
CREATE POLICY passport_repair_entries_own ON passport_repair_entries FOR ALL TO refserver_app
  USING (EXISTS (SELECT 1 FROM passports p WHERE p.id = passport_id AND p.manufacturer_bpnl = current_setting('app.acting_bpnl', true)))
  WITH CHECK (EXISTS (SELECT 1 FROM passports p WHERE p.id = passport_id AND p.manufacturer_bpnl = current_setting('app.acting_bpnl', true)));
CREATE POLICY passport_responsibility_intervals_own ON passport_responsibility_intervals FOR ALL TO refserver_app
  USING (EXISTS (SELECT 1 FROM passports p WHERE p.id = passport_id AND p.manufacturer_bpnl = current_setting('app.acting_bpnl', true)))
  WITH CHECK (EXISTS (SELECT 1 FROM passports p WHERE p.id = passport_id AND p.manufacturer_bpnl = current_setting('app.acting_bpnl', true)));
CREATE POLICY passport_access_records_own ON passport_access_records FOR ALL TO refserver_app
  USING (EXISTS (SELECT 1 FROM passports p WHERE p.id = passport_id AND p.manufacturer_bpnl = current_setting('app.acting_bpnl', true)))
  WITH CHECK (EXISTS (SELECT 1 FROM passports p WHERE p.id = passport_id AND p.manufacturer_bpnl = current_setting('app.acting_bpnl', true)));
CREATE POLICY access_map_versions_own ON access_map_versions FOR ALL TO refserver_app
  USING (EXISTS (SELECT 1 FROM battery_models m WHERE m.id = battery_model_id AND m.manufacturer_bpnl = current_setting('app.acting_bpnl', true)))
  WITH CHECK (EXISTS (SELECT 1 FROM battery_models m WHERE m.id = battery_model_id AND m.manufacturer_bpnl = current_setting('app.acting_bpnl', true)));
CREATE POLICY access_map_entries_own ON access_map_entries FOR ALL TO refserver_app
  USING (EXISTS (SELECT 1 FROM access_map_versions v JOIN battery_models m ON m.id = v.battery_model_id WHERE v.id = map_id AND m.manufacturer_bpnl = current_setting('app.acting_bpnl', true)))
  WITH CHECK (EXISTS (SELECT 1 FROM access_map_versions v JOIN battery_models m ON m.id = v.battery_model_id WHERE v.id = map_id AND m.manufacturer_bpnl = current_setting('app.acting_bpnl', true)));
CREATE POLICY issuer_contracts_own_passport ON issuer_contracts FOR ALL TO refserver_app
  USING (true)
  WITH CHECK (passport_id IS NULL OR EXISTS (SELECT 1 FROM passports p WHERE p.id = passport_id AND p.manufacturer_bpnl = current_setting('app.acting_bpnl', true)));

-- The fixed search path of every function of the schema: the schema of the migration first and the
-- temporary schema last, so that no temporary table of a session replaces a table inside a function.
-- Every migration file ends with this statement.
DO $$
DECLARE
  f regprocedure;
BEGIN
  FOR f IN SELECT p.oid::regprocedure FROM pg_proc p WHERE p.pronamespace = (SELECT n.oid FROM pg_namespace n WHERE n.nspname = current_schema()) LOOP
    EXECUTE format('ALTER FUNCTION %s SET search_path = %I, pg_temp', f, current_schema());
  END LOOP;
END $$;
````


## 23. Annex D: the file of phase P5 in full

The file of this annex is the fourth migration file of decision D69 (The audit record after a failed write is queued). The annex is normative as the annexes §20 to §22 are (decision D58, Normative annexes), and `node scripts/check-annexes.mjs --require P5` compares the file with its block. The author applied the file on 2026-11-19 after the three migration files of the repository to an empty schema of a PostgreSQL 17.12 database, and ran the cases that §9.4.4 states.

#### File: `server/src/db/migrations/004_audit_outbox.sql` (phase P5)

````text
--------------------------------------------------------------------------------
-- Copyright (c) 2026 Ichnos Protocol Pte. Ltd.
-- Copyright (c) 2026 Contributors to the Eclipse Foundation
--
-- See the NOTICE file(s) distributed with this work for additional
-- information regarding copyright ownership.
--
-- This program and the accompanying materials are made available under the
-- terms of the Apache License, Version 2.0 which is available at
-- https://www.apache.org/licenses/LICENSE-2.0.
--
-- Unless required by applicable law or agreed to in writing, software
-- distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
-- WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
-- License for the specific language governing permissions and limitations
-- under the License.
--
-- SPDX-License-Identifier: Apache-2.0
--------------------------------------------------------------------------------
-- Migration 004: the queue of the audit records that the audit trail could not write after the
-- transaction of a request (the owner's decision of 2026-11-19). The table, one trigger function, one
-- trigger and the privileges of the role refserver_app. The three earlier files do not change.
-- The last statement of the file fixes the search path of every function of the schema.

CREATE TABLE audit_outbox (
  id bigint GENERATED ALWAYS AS IDENTITY CONSTRAINT audit_outbox_pkey PRIMARY KEY,
  entries jsonb NOT NULL CONSTRAINT audit_outbox_entries_check CHECK (jsonb_typeof(entries) = 'array' AND jsonb_array_length(entries) BETWEEN 1 AND 20),
  decided_at finite_timestamptz NOT NULL,
  attempts integer NOT NULL DEFAULT 0 CONSTRAINT audit_outbox_attempts_check CHECK (attempts >= 0),
  not_before finite_timestamptz NOT NULL,
  last_error text CONSTRAINT audit_outbox_last_error_check CHECK (length(last_error) BETWEEN 1 AND 500),
  written_at finite_timestamptz,
  created_at finite_timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT audit_outbox_written_check CHECK (written_at IS NULL OR written_at >= decided_at)
);
CREATE INDEX audit_outbox_due_idx ON audit_outbox (not_before, id) WHERE written_at IS NULL;

CREATE FUNCTION check_audit_outbox_change() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER AS $$
BEGIN
  PERFORM require_read_committed();
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'ERR-DB-APPEND-ONLY: A record of the audit queue is never deleted.' USING ERRCODE = 'P0001';
  END IF;
  IF OLD.written_at IS NOT NULL THEN
    RAISE EXCEPTION 'ERR-DB-APPEND-ONLY: A written record of the audit queue never changes.' USING ERRCODE = 'P0001';
  END IF;
  IF (to_jsonb(NEW) - ARRAY['attempts', 'not_before', 'last_error', 'written_at']) IS DISTINCT FROM (to_jsonb(OLD) - ARRAY['attempts', 'not_before', 'last_error', 'written_at'])
     OR NEW.attempts < OLD.attempts THEN
    RAISE EXCEPTION 'ERR-DB-APPEND-ONLY: Only the attempt count, the next attempt, the last error and the write time of a record of the audit queue change, and the attempt count never decreases.' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_audit_outbox_change BEFORE UPDATE OR DELETE ON audit_outbox FOR EACH ROW EXECUTE FUNCTION check_audit_outbox_change();

GRANT SELECT, INSERT ON audit_outbox TO refserver_app;
GRANT UPDATE (attempts, not_before, last_error, written_at) ON audit_outbox TO refserver_app;

-- The fixed search path of every function of the schema: the schema of the migration first and the
-- temporary schema last, so that no temporary table of a session replaces a table inside a function.
-- Every migration file ends with this statement.
DO $$
DECLARE
  f regprocedure;
BEGIN
  FOR f IN SELECT p.oid::regprocedure FROM pg_proc p WHERE p.pronamespace = (SELECT n.oid FROM pg_namespace n WHERE n.nspname = current_schema()) LOOP
    EXECUTE format('ALTER FUNCTION %s SET search_path = %I, pg_temp', f, current_schema());
  END LOOP;
END $$;
````

## NOTICE

This work is licensed under the [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/legalcode).

- SPDX-License-Identifier: CC-BY-4.0
- SPDX-FileCopyrightText: 2026 Ichnos Protocol Pte. Ltd.
- SPDX-FileCopyrightText: 2026 Contributors to the Eclipse Foundation
- Source URL: https://github.com/Ichnos-Protocol/battery-passport-after-first-life/blob/main/docs/architecture/implementation_plan.md
