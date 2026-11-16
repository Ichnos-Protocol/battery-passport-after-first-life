Extract: this file holds only the passages on the work of this repository.

# 2026-11-09: the forward link of a superseded passport, and use case UC-5

Francesco's words, verbatim, in two messages that answered the review of the SYS.2 system requirements of the
after-first-passport work.

## The proposal

> the use cases are good.
> when a passport is superseded, I think it could get a link to the new passport which supersedes it, at list if the issuer of the previous passport approves. If not implemented this feature should be documented, maybe as an additional use case 5: the economic operator who issues a party can follow the lifecycle of his battery and track when it is reused, remanufactured and recycled, for the accounting but also for the data on battery degradation, which he might decide to purchase from second life operators, to improve his reliability models.
>
> How do you see these points?

## The agreement

> agreed to all your 3 points:
>
> 1. Decision Q-1008 revised: the original issuer may write a forward link into its own passport, after the second-life operator's notice.
> 2. The access group of the forward link: the same group as the battery status (my recommendation), or public.
> 3. UC-5 with its two parts (lifecycle events, data purchase): built in the reference implementation in step 8, or documented only.

The words agree to the three points of the answer that preceded them:

1. Decision Q-1008 (whether the original passport records a link to its successor) is revised: the economic operator
   responsible for an original passport may write a link to the new passport into its own passport, after the
   second-life operator's notice of the new passport.
2. The forward link carries the access group of the battery status, which the answer recommended.
3. Use case UC-5 (the economic operator that issued a passport follows the later life cycles of its battery) has two parts:
   UC-5a, the notices of the lifecycle events, and UC-5b, the purchase of degradation data from second-life operators.
   The first message states the rule for the build: "If not implemented this feature should be documented". Whether
   step 8 builds UC-5 is decision Q-1011 (whether the reference implementation builds use case UC-5).

## The approval of the SYS.2 set

Francesco's words, verbatim, in his message that answered the question "Do you approve the SYS.2 set and options B
plus D for Q-1006 and A for Q-1011?", after the review that also listed seven readings with their recommendations:

> Approve all

The words approve the system requirements of step 3 and of use case UC-5, option B plus D of decision Q-1006 (how the
producers of a battery learn its recycling result), option A of decision Q-1011 (whether the reference implementation
builds use case UC-5), and the recommendations on the seven readings: the superseded mark held in the lineage records;
the original manufacturer authorising the sharing of the model information of Annex XIII point 2 on a new passport;
the previous purchaser losing access after a resale; the battery status unchanged after a direct re-use; no
end-to-end requirement for the path through waste status; the architecture element for compliance reporting decided in
step 7; and SyR-PASS-011 changed to the purchaser group when the Art. 77(9) act is adopted. The software requirements
that step 3 wrote for the check are derived again in step 7.

## The three design points of draft 0.2 of the CX-0160 amendment proposal

Francesco's words, verbatim, in his message that answered the question "Do you accept my three recommendations for
draft 0.2?", after the independent review of draft 0.1 raised 51 questions:

> Accept all three

The words accept three recommendations:

1. The proposal is written as a new use case document, proposed "CX-0160-4 Battery passport after the first
   passport"; the base document of CX-0160 changes only where a common rule requires it.
2. The new passport identifier and the end of the passport use the IDTA DPP Metadata model (IDTA-02099-1,
   `digitalProductPassportId` and `dppStatus`); the proposed model carries only the predecessor links and the optional
   forward links.
3. Every new passport gets a new passport identifier (decision Q-969). The battery identifier of DIN DKE SPEC 99100
   §6.1.2.2 persists after preparation for re-use and after repurposing of one battery; a battery remanufactured or
   assembled from several batteries gets a new battery identifier. Decision Q-1012 records the rule.

## The two design points of draft 0.3 of the CX-0160 amendment proposal

Francesco's words, verbatim, in his message that answered the question "Do you accept both recommendations for draft
0.3?", after the second independent review of draft 0.2:

> Accept both

The words accept two recommendations:

1. One proposed model, "BatteryPassportLifecycle", carries the predecessor links, the waste successor (BPNL, role,
   date) and the end of the passport (recycling date, recycler BPNL). Every new passport and every passport that reaches
   the waste status carries the model. The value of `dppStatus` of the IDTA DPP Metadata for an ended passport is mapped
   once EN 18223 is stored. The forward links stay in a model of their own.
2. The issuer offers the forward link to the recipients that the issuer authorises under draft Art. 2(4)(e) of the
   Art. 77(9) act and to the market surveillance authorities, instead of the access group of the battery status.

## The review of draft 0.4 of the CX-0160 amendment proposal

Francesco's words, verbatim, in his message that answered the question "Do you approve draft 0.4, so the review page for
the expert group can be built?":

> D15: this must be raised as a point for discussion: should the purchaser of the battery, with legitimate interest change the lifecycle status?
> D7: If I remember correctly, the first life manufacturer in the technical documentation should also provide performance value for safe second life operations
> [One line of the message, on the record of a module swap in a repair, is left out of this extract.]
> D16: agreed. both the rationale and the way of implementation must be recorded and discussed
> Smaller fixes: accepted
> align SyR-LIFE-141 in step 7 as proposed
>
> So all decisions are approved but some need to be flagged for discussion in the group as I explained

The words approve every decision of draft 0.4 and flag four topics for the Catena-X Digital Product Passport Expert
Group: whether the purchaser changes the lifecycle status (D15); the first-life manufacturer's performance information
for safe second-life operations (D7); the record of a module serial number swap in a repair (step 9); and the rationale
and implementation of the receivers of PassportEnded (D16). SyR-LIFE-141 is aligned in step 7.

## The step 6 checkpoint

Francesco's words, verbatim, in his message that answered the question "Do you accept the step 8 folder layout, so step 7
can start?" (the conventions of the Tractus-X reference implementations):

> Accept, start step 7

The words accept the layout of the reference implementation folder of
the conventions note of the Tractus-X reference implementations sections 2 and 3, and start step 7, the
software requirements of the reference API.

## The step 7 review

Francesco's words, verbatim, in his message that answered the review of the step 7 requirements and
its four readings:

> 1. Error body is optional in Catena-X by I want a descriptive text to be there
> 2. I do not understand, explain descriptively
> 3. explain descriptively
> 4. explain descriptively

The first point makes the error body of the lifecycle notification endpoints mandatory, with a descriptive text, although
the Industry Core KIT makes the body optional. The other three points ask for explanations of the readings on the trace
of SyR-LIFE-145, the two sources of repair entries, and the home of the lifecycle code.

## The answers to the step 7 explanations

Francesco's words, verbatim, in his message that answered the explanations of the four step 7 readings:

> 1. perfect
> 2. perfect link to all 3 requirements
> 3. I prefer the proposal's design as more robust and modular.
> 4. into the data layer

The words accept the descriptive error body; link the repair notice (SyR-LIFE-145) to the three repair requirements
StR-LIFE-043, StR-LIFE-044 and StR-LIFE-045; choose the proposal's design for the repair history (the repairer's repair
notice and CX-0131 repair certificate, not the repairer's own screen); and decide that step 8 moves the lifecycle rules
into the data layer (the battery passport dataset aggregation, EL-DATASET), inside the certification perimeter
(decision Q-1013).

## The confirmation of decisions D14 and D16 of the step 8 plan (2026-11-11)

Francesco's words, verbatim, in his message of 2026-11-11 that answered the question "Do you confirm D14 and D16 on the
recovered materials?" (draft 4 of the step 8 plan):

> Confirm both

The words confirm decision D14 (the PassportEnded notification carries the reference to the CX-0131 material recycling
certificate, not the recovered masses) and decision D16 (the recycler is the source of the recovered materials and the
data provider of the passport is the one writer, which records them from the certificate), with the rewordings of
SyR-LIFE-109 (recovered materials recorded only by the battery's recycler), SyR-PASS-210 (recovered materials readable
by recycler, manufacturer and authorities only) and the answer text of decision Q-1006 that phase P10 of the plan applies.

## NOTICE

This work is licensed under the [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/legalcode).

- SPDX-License-Identifier: CC-BY-4.0
- SPDX-FileCopyrightText: 2026 Ichnos Protocol Pte. Ltd.
- SPDX-FileCopyrightText: 2026 Contributors to the Eclipse Foundation
- Source URL: https://github.com/Ichnos-Protocol/battery-passport-after-first-life/blob/main/requirements/Owner_instructions-Francesco_verbatim/2026-11-09_forward_link_and_use_case_5.md
