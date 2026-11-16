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

## NOTICE

This work is licensed under the [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/legalcode).

- SPDX-License-Identifier: CC-BY-4.0
- SPDX-FileCopyrightText: 2026 Ichnos Protocol Pte. Ltd.
- SPDX-FileCopyrightText: 2026 Contributors to the Eclipse Foundation
- Source URL: https://github.com/Ichnos-Protocol/battery-passport-after-first-life/blob/main/requirements/Owner_instructions-Francesco_verbatim/2026-11-16_public_repository_for_the_after_first_passport_work.md
