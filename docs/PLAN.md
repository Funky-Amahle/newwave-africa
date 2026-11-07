# NewWave Africa — Implementation Plan

## Objective
Demonstrate creator-controlled story categorization and transparent diversity-aware discovery.

## Status
todo = not started; in progress = assigned; blocked = unresolved dependency; done = merged and verified. All tasks below are proposed, not complete.

| ID | Priority | Skill owner | Task | Dependencies | Acceptance criteria | Status |
|---|---|---|---|---|---|---|
| NW-01 | P0 | quality-guardian | Validate existing MVP build | none | Install, typecheck/build, record failures | todo |
| NW-02 | P0 | frontend-builder | Add category review before publish | NW-01 | Creator can correct suggested category | todo |
| NW-03 | P0 | ai-discovery-engine | Evaluate ranking against baseline | NW-01 | Fixed dataset, relevance and coverage metrics | todo |
| NW-04 | P0 | backend-builder | Test categorization API | NW-01 | Invalid payload, fallback, model failure covered | todo |
| NW-05 | P1 | system-architect | Design persistent publishing and consent | NW-02 | Data model and threat model documented | todo |
| NW-06 | P1 | frontend-builder | Accessibility review | NW-01 | Mobile, keyboard, empty/error states verified | todo |
| NW-07 | P1 | release-manager | Deploy and rehearse demo | NW-02,NW-03,NW-04,NW-06 | Live demo verified, 5-minute script accurate | todo |
| NW-08 | P1 | quality-guardian | Prepare Haley recordings for eight fictional sample stories | recorded-only playback | All eight MP3s match fixed source text, decode successfully, load through the existing manifest, and pass review; merge/deployment requires owner approval | in progress |
| NW-09 | P1 | system-architect / quality-guardian | Voice and visual story studio | server deployment for transcription | Explicit audio consent, protected bounded Deepgram endpoint, editable transcript per question, local image/audio preview, original backgrounds, quiet landing waves; verified server and Pages builds | in progress |
| NW-10 | P1 | product-designer / frontend-builder | Complement GitHub/Base44 creator journeys | DESIGN-15 | Shareable static-workspace links, truthful canvas progress, documented boundaries and QA; publishing/security separate | in progress |

## Definition of done
Story submission, category review, diverse discovery, honest metrics, passing build and reproducible demonstration.

## Non-goals
Payments, production social network, unsupported language claims, unreviewed publishing.

## Handoff format
Task ID / Owner / Summary / Files / Tests run / Limitations / Next action.

## Product design workstream
See docs/design/DESIGN-PLAN.md for DESIGN-01 through DESIGN-07: UX audit, category review, discovery, design tokens, cultural/language review, dashboard design and QA handoff. All tasks are proposed until validated and merged.
## Public research workstream
See docs/research/RESEARCH-PLAN.md. RES-01 through RES-07 cover source discovery, document inspection, fact verification, licensing, African context, evidence curation and external approval. All start as todo; no public sources have yet been verified.

## Workspace operating blueprint adoption (WS workstream)

The cross-project process and NewWave-specific adoption live in [WORKSPACE-OPERATING-BLUEPRINT.md](WORKSPACE-OPERATING-BLUEPRINT.md). This does not supersede existing NW/Design/Research tasks. Status remains distinct from implementation and may change only after verified acceptance.

| ID | Priority | Skill owner | Task | Acceptance criteria | Status |
| --- | --- | --- | --- | --- | --- |
| WS-01 | P0 | project-planner | Review blueprint adoption | Repo-local links and sources of truth preserved; human-reviewed PR | in progress |
| WS-02 | P0 | workspace-handoff | Pilot thread brief and handoff for DESIGN-01 and DESIGN-13 | Two linked, source-grounded brief/handoff examples; risks and next owner recorded | todo |
| WS-03 | P0 | product-designer | Baseline two NewWave screens | Evidence at narrow and desktop widths; severity-rated findings for DESIGN-01 | todo |
| WS-04 | P1 | quality-guardian | Pilot design-quality gate and PR evidence checklist | One reviewed UI PR with pass/fail/not-checked QA and rollback evidence | todo |
| WS-05 | P1 | project-planner | Add a lightweight AGENTS pointer | Reviewed link only; no policy rewrite | in progress |
| WS-06 | P1 | workspace-handoff | Add repo-local handoff skill | Scoped SKILL.md and a validated handoff exercise | in progress |
| WS-07 | P2 | project-planner | Consider recurring documentation drift report | Manual pilot completed first; report read-only and no autonomous policy writes | todo |
| WS-08 | P2 | quality-guardian | Assess adoption and instruction drift | Compare pilot evidence, reconcile stale task statuses via approved PR | todo |

## Dual-experience fusion (NW-10)

See [CREATOR-EXPERIENCE-FUSION.md](design/CREATOR-EXPERIENCE-FUSION.md) for both platforms' complementary strengths, the pilot, QA requirements, and the guarded future roadmap. No merge or deployment is approved merely by adding this plan.
