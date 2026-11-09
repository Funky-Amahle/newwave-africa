# NewWave Africa — education impact and adoption roadmap

Prepared 9 November 2026 · NW-31 · Proposed roadmap; no measured beneficiary impact or partner agreement claimed.

## Problem and primary beneficiary

The proposed education use case serves student writers and emerging storytellers with limited access to creative mentorship or production tools, initially through a school, library or community organisation with shared browser access. This is a problem hypothesis to validate with local participants, not a claim about every African community.

A concrete journey: a student uses a shared computer to choose a writing canvas, organise an invented story, download a planning brief, write a draft, confirm authorship and retrieve the saved draft in that same browser. Their own words remain central. Shared access helps with equipment availability but also creates a privacy risk: localStorage is not a private user account, and another person using the same browser may see saved drafts. Until isolation and clear-data controls are verified, shared-device demonstrations should use fictional content only.

## Service and expected benefit

| Service in the current source | Expected benefit to test | Practical boundary |
| --- | --- | --- |
| Five planning canvases for writing, film, journalism, music and interactive stories; Markdown brief downloads | Help a learner structure an idea without specialist software | Prompts support human authorship; they do not replace a mentor or generate stories |
| Written drafts, metadata, preview, rights confirmation and same-browser saving | Help creators practise drafting and return to their work | No account, cross-device recovery or public publishing; browser data can be cleared |
| Recording/upload and optional reviewed transcription | Offer an alternative way to capture ideas for users who find typing difficult | Browser/microphone access varies; current transcription is English-only and requires consent plus provider credentials |
| 36 English narration voices, optional WAV generation and downloads | Let a creator experiment with an audio version of their text | Requires a Deepgram session key, provider access and quota; sponsored usage is not available today |
| Search, interests, reading lists, diversity weighting and ranking explanations | Help readers explore varied fictional examples and understand selection | Deterministic local ranking; no proven fairness, audience reach or learning gain |
| Explicit external translation handoff | Let readers choose whether to explore a sample in another language | English-first app; external machine output is unreviewed, not integrated local-language support |

The prototype is not a free shared voice service or an offline platform. Public publishing, creator income and wider audience visibility are future possibilities, not current benefits. Confirm deployment and device behavior before presenting a source feature as working live.

## Capstone evidence

| Panel criterion | Evidence to show | Remaining work |
| --- | --- | --- |
| Depth of Codex integration | [AGENTS.md](../AGENTS.md), [task plan](PLAN.md), reusable [planning](../.agents/skills/project-planner/SKILL.md) and [review](../.agents/skills/quality-guardian/SKILL.md) skills, an actual feature PR and its corresponding Codex chat | Select one traceable planning → implementation → review → documentation example; show plan mode or MCP use only where the actual record supports it |
| Real-world impact | The beneficiary journey above and the proposed [reader/creator protocol](validation/2026-11-09/READER-CREATOR-STUDY-PROTOCOL.md) | Human study not run; no measured education outcome or representative population claim |
| Reusability and adoption | [Quick start](../README.md#quick-start), shared components, [architecture](ARCHITECTURE.md), [prepared server setup](../server-deploy/README.md) | Fresh setup verification, facilitator materials and a funded operating model |
| Demo and pitch quality | [Four-minute narration and screen cues](CAPSTONE-VIDEO-SCRIPT.md) | Verify the filmed revision, rehearse, record captions and review the exported video |

## Roadmap

Time windows run from a funded, partner-supported kickoff; they are targets rather than delivery promises. Each phase depends on the preceding evidence and an owner decision.

| Phase | Deliverable and owner | Evidence required before progression |
| --- | --- | --- |
| 1 — first month: validate the existing journey | Research facilitator and quality reviewer run the proposed 10-reader/10-creator study; verify phone, keyboard, audio and shared-device behavior | Existing preregistered thresholds: at least 8/10 creators complete C2–C4 unassisted, at least 8/10 readers understand the three prototype boundaries, balanced R3 order, complete consented task records and no critical/P0 event. Use the [operations/scoring guide](validation/2026-11-09/PHASE2-OPERATIONS-AND-SCORING.md); do not silently change recruitment or thresholds |
| 2 — months 2–3: reduce access barriers | Frontend and backend owners measure data use, improve low-data performance and draft backup/recovery; prepare cost-capped sponsored voice access | Record baseline and revised bytes/load behavior under a fixed slow-network profile; verify recovery and shared-device isolation/clear-data behavior. Measure provider cost per completed session before setting a sponsor budget; no public owner key in browser code |
| 3 — months 4–5: one community pilot | Partnership lead recruits one willing school, library or community organisation; prepares facilitator materials and explores one locally relevant language with reviewers | Written partner agreement, voluntary participation, appropriate consent/safeguarding if minors are included, reviewed language tasks, completed-story counts and participant feedback. No partner is committed today |
| 4 — months 6–8: controlled publishing | Product/backend owners design accounts, persistent storage, authorship consent, moderation, withdrawal and deletion | Review data/threat models and operating costs; test that creators can manage access, publish and withdraw work. Human approval before deployment; publishing remains outside today's MVP |
| 5 — after pilot evidence: adoption | Maintainer and partnership lead provide a reusable setup kit and invite further organisations | Another maintainer completes setup; partners can operate within documented budgets; report repeat use and adoption without inferring impact from registrations alone |

## Next-month sequence

1. Freeze the tested release and record a deployment identifier; check the core journey on target devices. Resolve critical consent, access or data-loss issues before participant sessions.
2. Agree recruitment, consent, retention and private evidence storage with a facilitator. The primary education framing does not change the existing study cohort; a student-specific or minor-involving study needs a separately reviewed protocol.
3. Run the existing task script with fictional content and no participant API keys. Keep completed observations and consent outside public Git; publish only reviewed non-identifying aggregates.
4. Score the evidence, report gaps and prioritise fixes. Rehearse and film the capstone with accurate current/pending labels.

Task completion measures usability for the observed group. Literacy improvement, income, sustained adoption and discoverability for real creators require separate longer-term evidence. The synthetic ranking benchmark is not a substitute for human outcomes.

## Codex contribution and maintenance

For each phase, maintain scoped task IDs in [PLAN.md](PLAN.md), apply repository skills, implement reviewable branches, review actual evidence and document decisions. Preserve the distinction between proposed, implemented, tested and deployed. A contributor can start with Node 22+, `npm ci` and `npm run dev`; key-free writing/discovery should be the default demonstration. Server hosting, provider funding and public content operations require explicit owners and budgets.

## NW-31 handoff

Scope: documentation only — beneficiary framing, service boundaries, roadmap, capstone rubric and narration. Acceptance: linked from README and recording runbook; claims checked against source and existing study criteria; local Markdown links and diff whitespace checked; no runtime change, recruitment, provider request or release.

Status: in progress pending PR review. Checks and review evidence belong in the PR. Next owner: repository owner for documentation review and selection of a facilitator/partner; no merge or deployment is authorised by this document.
