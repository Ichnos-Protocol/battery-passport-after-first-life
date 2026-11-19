Extract: this file holds only the passages on the work of this repository.

# 2026-11-16: a public repository for the after-first-passport work

## The instruction

Francesco's words, verbatim, in his message of 2026-11-16, after he approved version 8 of the step 8 plan
(the step 8 implementation plan):

> I will work on this project amendment to include post first life  and Tractus-X reference implementation in a new repository, which must be not private and open source according to Tractus-X standards. Then I will pull request from there to Tractus-X.
>
> Now these activities are in a folder inside the battery passport demo folder, and after the Catena-X expert group will have approved my PR will be implemented back on it.
>
> Now analyze what you need to setup a new repository without external dependencies to continue the work there. I will see and discuss your plan then you will implement it

The words set four rules:

1. The amendment of CX-0160 for the battery's life after its first passport and its Tractus-X reference implementation
   continue in a new repository.
2. The new repository is public and open source, according to the Tractus-X standards, and has no external
   dependencies.
3. A pull request to Tractus-X starts from the new repository.
4. After the Catena-X expert group approves, the result is implemented back in the battery passport application.

## The four answers on the open points of the Tractus-X conventions

Francesco's words, verbatim, in his message of 2026-11-16 that answered the four points that the stored Tractus-X
conventions leave open (the request for a new Tractus-X repository, the text of the NOTICE file, the Creative Commons
BY 4.0 header, and whether Tractus-X accepts a pull request from an outside repository):

> the repository will be on my personal GitHub for now
> the text note must be according to Tractus-X examples
> the license must be the same as Tractus-X
> I will sort this out with the expert group when the thing is ready

## The four choices of the plan

Francesco chose one option for each of four questions of 2026-11-16. The option labels are quoted as he selected them:

1. Question: "What must the new public repository contain so that it runs alone?" Selected option:
   "Contract, own server, tests".
2. Question: "Where is the source of truth for the work in the new repository?" Selected option:
   "Own public registry".
3. Question: "Which technology does the standalone server use?" Selected option: "Node.js and PostgreSQL".
4. Question: "Which name does the repository get on your personal GitHub account?" Selected option:
   "battery-passport-after-first-life".

Francesco then approved the plan of 2026-11-16 for the public repository `battery-passport-after-first-life`, which
defers the execution of the step 8 plan in the battery passport application until the expert group approves.

## The owner of the GitHub repository

Francesco's words, verbatim, in his message of 2026-11-16, sent while stage 3 of the plan was running and before any
push:

> before you push the repo: it should be made by Khorolev but owned by the Ichnos Protocol team

The words change the answer "the repository will be on my personal GitHub for now": the GitHub account Khorolev creates
the repository, and the Ichnos Protocol team owns it. The GitHub organisation of Ichnos Protocol is `Ichnos-Protocol`,
so the address of the repository is `https://github.com/Ichnos-Protocol/battery-passport-after-first-life`.

## The review of the carried software requirements

Francesco's words, verbatim, in his message of 2026-11-16 that answered three recommendations on software requirements
carried into this registry: (1) SwR-DATASET-180 (BatteryPass 6.1.0 properties filled from the BatteryPass mapping
table) removed from this registry; (2) SwR-BGWORK-020 (end of a recycled battery's passport sent in time) with its
time as a declared parameter, or a value that he sets; (3) SwR-BGWORK-010 (notifications sent unchanged as JSON POST
through the connector) limited to the four lifecycle notifications:

> 1. ok
> 2. ok, for the reference implementation, send the notification with 5 seconds delay
> 3. agreed

[a fourth point of the message is not part of this extract]

## Decisions Q-200 and Q-202, first reading

Francesco's words, verbatim, in his message of 2026-11-16 that answered the explanation of decisions Q-200 (how the
dataset delivers each field's access group) and Q-202 (the carrier for lifecycle data the aspect models lack):

> Q-200: I loke option 2 the most. Then is it possible to give access to the other IDTA aspect models according to the lifecycle status in option 2? if the overhead for all or the information type conditional to group is large, or the maintenance is complex, we might need option 1
> Q-202: I like option 1 the most, but option 2 might be in accordance to Q-200 option 1: is it compatible with option 2 in Q200?
>
> we must think that changing IDTA models might be harder as more people need convincing
>
> These two things need to be thought out together in depth, thinking of the dependencies and the path which constrains further development which needs to be future proof and largely backward compatible. Make an artifact where you show the current battery passport aspect models, and where you would change them, as well as what the additional aspect model would contain.
>
> Display both variants
>
> Then let's reassess

## The decision on Q-200 and Q-202: the third combination

Francesco's words, verbatim, in his message of 2026-11-16 that answered the question "Which combination do you choose
for decisions Q-200 and Q-202?", after the comparison page of the two variants and of a third combination:

> Third combination

The comparison page described the third combination in these words: "The access map for the seven existing IDTA models
(option 1 of Q-200), one data offer per model for the new lifecycle models (option 2 of Q-200, applied only where a
model holds one group), and BatteryPassportLifecycle as the carrier (option 1 of Q-202). This combination changes no
IDTA model, asks the Catena-X expert group for three additions (the access map and the two lifecycle models), and
leaves the general question of mixed models to Annex B point 11 of the proposal."

## The approval of the three rewordings and of stage 3

Francesco's words, verbatim, in his message of 2026-11-16 that answered the question "Do you approve the three
rewordings and stage 3, so stage 4 can start?":

> Approve, start stage 4

The words approve the rewordings of SwR-CXCLIENT-111 (end of a recycled battery's passport made known to the
provider), SwR-CXCLIENT-114 (received passport inputs written only for the responsible operator) and SwR-DATASET-102
(new dataset fields set at the issue of a new passport), approve stage 3 (the public requirements registry) and start
stage 4 (the documents of the public repository).

## The six points of stage 4

Francesco's words, verbatim, in his message of 2026-11-16 that answered the question "Do you accept my
recommendations on the six points, so stage 5 can start?":

> Accept, start stage 5

The words accept six recommendations: (1) the process requirements PrR-CXD-026 (proposed models in the layout of the
Tractus-X semantic model repository) and PrR-CXD-028 (one conformance test per criterion) are reworded for the three
proposed models and the sixteen criteria of draft 0.6 of the proposal; (2) the two citations of the owner's erratum to
the access rights analysis leave the public citation catalogue; (3) the legal basis of the battery status is Annex XIII
point 4(c); (4) the list selector of the access map's path follows JSONPath (RFC 9535), decided with the model file;
(5) three inconsistencies of the proposal are corrected in a draft 0.7 (the version named in Annex A, the number of
operations in decision D5 of Annex C, and the normative references of section 6.1); (6) the check for private
references keeps its exception for the conduct address of the Eclipse Foundation. The words also start stage 5, the
specification of the standalone reference server.

## The five decisions on the specification of the reference server

Francesco's words, verbatim, in his message of 2026-11-16 that answered the question "Do you accept my five
recommendations for the specification?" (version 1 of the specification of the reference server):

> Accept all five

The words accept five recommendations:

1. Authentication (open decision OD-1): option A. A request from a partner carries a shared key of the connector's data
   plane and the consumer's Business Partner Number in a header that the data plane sets, and an operator's request
   carries a token signed with a key of the deployment.
2. Database content (open decision OD-2): option B, 17 tables, which builds use case UC-5b (the original issuer
   purchases degradation data from second-life operators), as decision Q-1011 (whether the reference implementation
   builds use case UC-5) states.
3. Conformance target (open decision OD-3): option A, one test code against an in-process binding and a connector
   binding.
4. Scope: the reference server does not build the requirements on recovered materials and recycling efficiency, the
   access rules that rest only on the draft implementing act under Article 77(9), the yearly reports of the first
   recycler, the digital twins and bills of material of traced parts, the pull of passport inputs from a partner, and
   the forwarding rule of the connector's data plane. The reference server builds the sharing of individual battery
   information with the original issuer (use case UC-5b).
5. Waste successor: the reference server follows the proposal and records the successor that the notification names,
   and the software requirement on the successor with the role producer is reworded, with its old and new statement
   shown to Francesco before the change.

The words also accept that five registry corrections are brought with their old and new text, that values without a
stored text stay configuration values marked as not verified, and that the two shared Catena-X models needed for the
validation of the proposed models are copied into the source texts of the public repository.

## The ten registry texts and two further points

Francesco's words, verbatim, in his message of 2026-11-16 that answered the question "Do you approve the ten registry
texts and my two recommendations?" (version 2 of the specification of the reference server):

> Approve all

The words approve ten registry texts of the public registry: the rewording of the software requirement on the waste
successor (the waste step records the successor that the notification names); the rewording of the software requirement
on the database trigger that refuses a change of a passport's manufacturer (the table passports, the column
manufacturer_bpnl, every database role); the rewording of three software requirements that named an ownership service
(direct re-use, the purchaser for the access to individual battery information, the previous holder's access); three
measures that count three proposed models and sixteen conformance tests; the description of the architecture element
background work; and the status "agreed" of the allocation of the requirements to the ten elements and twelve
interfaces. The words also accept two recommendations: the next draft of the proposal names version 2.1.0 of the shared
UUID model, and the system requirement on the producer that takes over a waste battery's passport is reworded, with
both statements shown to Francesco before the change.

## The shortened title of the software requirement on direct re-use

Francesco's words, verbatim, in his message of 2026-11-16 that answered the report that the approved title of
SwR-DATASET-195 has thirteen words, one more than the registry check allows, and now reads "Direct re-use recorded as a
purchaser change, never as a lineage step":

> ok, keep the shortened title

## The work up to phase P3 and the push

Francesco's words, verbatim, in his message of 2026-11-16 that answered the statement that a less capable model can
carry out the work after the approval of the reviewed specification and after phase P3 (the database with its triggers
and its rule tests):

> ok, continue until phase P3 is done, then push the repo to origin and I will take it further with less capable models and have you review it

The words order the work up to the end of phase P3 of the specification of the reference server, then the push of the
repository to its origin on GitHub. Francesco continues the later phases with other models, and the results come back
for review.

## Four decisions before phases P1 to P3, and the tools

Francesco's words, verbatim, in his message of 2026-11-16 that answered the question "Do you accept my recommendations
on the four decisions and on the tools?", after the second independent review of the specification of the reference
server (version 3):

> Accept all

The words accept five recommendations:

1. The successor's written authorisation is stored in the passport record as a reference, a first day and an optional
   last day; a later authorisation replaces the earlier one, and each change is written to the audit table.
2. No aspect model serves the reference to the original battery model of a treated battery; a data consumer follows
   the predecessor link of the new passport to the original passport, whose digital twin names the original model.
3. One donor battery may supply several remanufactured batteries: several new passports may name the same predecessor
   (decision Q-042, whether a donor battery may supply several remanufactured batteries).
4. The public schemas accept every form of the Catena-X identifier and of the message identifier that the shared
   Catena-X model admits; the reference server always sends the lower-case form that starts with urn:uuid: and stores
   one form internally.
5. Node.js 24 and Java 21 run in containers from public images, with no installation on the machine, and the model
   validation tool is downloaded from the releases of its Eclipse project.

## A database of its own for the reference server

Francesco's words, verbatim, in his message of 2026-11-16 that answered the recommendation to accept that the
migration takes the right to create temporary tables away from every role of the database, and to state in the
installation guide that the reference server needs a database of its own:

> accept, the reference server needs its own database

The words accept the revocation of the right to create temporary tables from the group PUBLIC of the database, and
decide that the reference server runs on a database of its own, which the installation guide states.

## The approval of the specification of the reference server

Francesco's words, verbatim, in his message of 2026-11-16 that answered the question "Do you approve version 7, or do
you want a sixth review of the changed database rules first?" (version 7 of the specification of the reference server,
after five independent reviews):

> Approve, start

The words approve version 7 of the specification of the reference server and start its execution: the continuous
integration workflows and phases P1, P2 and P3. The approval covers the specification as version 7 states it, which
includes the permanent waste successor of its decision D65 and the performance values that do not change on a stored
passport. The proposed upper length of a passport identifier in the public schemas is not part of version 7 and stays a
question for the owner.

## The author address of the commits in the public repository

Francesco's words, verbatim, in his message of 2026-11-16 that answered the question "Which author e-mail address do
the 28 commits carry in the public repository?", asked before the first push:

> Company address

The words decide that every commit of the public repository carries the published address of Ichnos Protocol as its
author address and its committer address. The commits made before the first push were rewritten to that address, and
the commit identifiers that the specification names were replaced by the new identifiers.

## The tests of the configuration, the logger and the identifier conversions, and phase P4

Francesco's words, verbatim, in his message of 2026-11-17 that answered the question "Do you want me to write these
three test cases into version 9 of the specification, or should the implementer of phase P4 add them when that phase
starts?", after the finding that section 14.2 of the specification names a test of the configuration reader with one
sentence and no test of the logger and of the identifier conversions:

> add these test cases then proceed with the plan with P4 and the next steps

The words order three things: version 9 of the specification adds the recommended test cases of the configuration
reader, the logger and the identifier conversions, with the recommended rule that the logger drops a fixed list of
field names; the execution then continues with phase P4; and the execution continues with the phases after P4. The words
do not decide the nine decisions that the specification marks as waiting for the owner; the phases build the stated
provisional behaviour of those decisions, as section 1 of the specification states for a sentence with the tag
"[waits for the owner]".

## Three decisions after the code review of phases P4 and P5 (2026-11-19)

Francesco chose one option for each of three questions of 2026-11-19, after the independent review of the code of
phases P4 and P5. The questions and the selected option labels are quoted as he answered them:

1. Question: "When the audit record of a stored step cannot be written after the commit, the server answers 500
   'stored nothing', although the passport has changed; a resend then gets 'duplicate' and the audit record is
   lost. Which answer and which repair should the reference server give?" Selected option: "Success, and audit queued".
   The option stated: the server answers the true outcome (200 applied), logs the failure at level error, and writes
   the audit record into a retry queue that the outbox worker writes later, in a fourth migration file, with the three
   frozen files unchanged.
2. Question: "A PassportEnded notification names the recycler in content.recyclerBpnl, and the server stores that value
   without a comparison to the Business Partner Number of the authenticated sender. Which rule should apply?" Selected
   option: "Must equal the sender". The option stated: the receiving step refuses a PassportEnded whose recyclerBpnl
   differs from the authenticated sender, with the sender mismatch refusal (403).
3. Question: "The operator endpoints answer { success: true, data: ... } and the specification never named the fields
   inside data; [...] Phase P6 freezes these names. Which names should the specification record?" Selected option:
   "Accept the names as built". The option stated: section 9.3 records the names that the code uses.

## The push of phases P4 to P6 and the connector release of phase P7 (2026-11-19)

Francesco chose one option for each of two questions of 2026-11-19, after phase P6 was verified. The questions and the
selected option labels are quoted as he answered them:

1. Question: "Eight local commits (phases P4, P5 and P6, the code review corrections, specification versions 9 and 10)
   are not on GitHub yet. When should they be pushed to the public repository
   Ichnos-Protocol/battery-passport-after-first-life?" Selected option: "Push now".
2. Question: "Phase P7 runs the 16 conformance test files across real Tractus-X connectors (Eclipse Dataspace
   Connector). Which connector release should phase P7 use?" Selected option: "Tractus-X EDC 0.13.0". The option
   stated: the newest tag of the public eclipse-tractusx/tractusx-edc repository read on 2026-11-19, and the newest
   interface version that its stored metadata file names; phase P7 checks every value against the documentation of
   that release.

## Three decisions after the verification of Tractus-X EDC 0.13.0 (2026-11-19)

Francesco chose one option for each of three questions of 2026-11-19, after the first part of phase P7 verified the
connector values against the public documentation of Tractus-X EDC 0.13.0. The questions and the selected option labels
are quoted as he answered them:

1. Question: "The server must find a receiver's connector before it sends a notification. The Catena-X BPN-DID
   Resolution Service answers only callers with a Membership Credential, which the server does not hold (your decision
   D41 kept the wallet out of the server). How should the server find the receiver's connector?" Selected option: "Ask
   the own connector". The option stated: Tractus-X EDC 0.13.0 offers POST /v3/connectordiscovery/connectors, which
   resolves the receiver and returns its connector address; the connector holds the credential, so the server needs
   none and D41 stays intact.
2. Question: "The three local Tractus-X connectors need an identity (verifiable credentials). Release 0.13.0 documents
   only an operator's managed wallet with an account. Which local identity should phase P7 use?" Selected option:
   "Wallet stub with EDC 0.13.0". The option stated: tractusx/ssi-dim-wallet-stub 0.1.0, the stub that Tractus-X itself
   uses for local tests, with connector 0.13.0 in Docker Compose; no text states that the stub works with 0.13.0, and
   the first run proves it or fails.
3. Question: "The Digital Twin Registry 0.13.0 protects its interface with OAuth2 by default, and the specification
   names no registry credential. How should the local test deployment reach the registry?" Selected option: "OAuth2 off
   locally". The option stated: the registry's own configuration switches OAuth2 off in the local test deployment only;
   production keeps it.

## Three decisions after the first run across Tractus-X EDC 0.13.0 connectors (2026-11-19)

Francesco chose one option for each of three questions of 2026-11-19, after the first run of phase P7 across connectors
of release 0.13.0 stopped at the check of the wallet stub, as decision D76 required. The questions and the selected
option labels are quoted as he answered them:

1. Question: "Three wallet stubs 0.1.0 refuse each other in the local run, because the stub reads another stub's identity
   document only over https and the local deployment has none. With one stub shared by the three companies (the
   Tractus-X umbrella layout), catalog, negotiation and transfer worked end to end. Which wallet layout should phase P7
   use?" Selected option: "One shared stub".
2. Question: "The wallet stub writes no DataService entry into the identity documents, so the connector discovery of
   your decision D75 finds no connector in the local run, with either stub layout. How should the sender find a
   receiver's connector in the local run?" Selected option: "Fixed address list, local only". The option stated: the
   local test deployment maps each Business Partner Number to its connector address in the configuration; production
   keeps the discovery of D75, and the discovery resolver stays tested against the answers recorded from release 0.13.0.
3. Question: "Each connector of release 0.13.0 keeps its keys in HashiCorp Vault 1.16.1, which the connector's chart
   names, under the Business Source License 1.1. That licence is not on the repository's licence list. What should the
   local deployment use?" Selected option: "Vault as a test-only image". The option stated: pulled at test time, never
   distributed with the repository; listed among the test images with its licence, and stated in NOTICE.

## NOTICE

This work is licensed under the [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/legalcode).

- SPDX-License-Identifier: CC-BY-4.0
- SPDX-FileCopyrightText: 2026 Ichnos Protocol Pte. Ltd.
- SPDX-FileCopyrightText: 2026 Contributors to the Eclipse Foundation
- Source URL: https://github.com/Ichnos-Protocol/battery-passport-after-first-life/blob/main/requirements/Owner_instructions-Francesco_verbatim/2026-11-16_public_repository_for_the_after_first_passport_work.md
