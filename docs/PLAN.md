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
