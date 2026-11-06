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

## Definition of done
Story submission, category review, diverse discovery, honest metrics, passing build and reproducible demonstration.

## Non-goals
Payments, production social network, unsupported language claims, unreviewed publishing.

## Handoff format
Task ID / Owner / Summary / Files / Tests run / Limitations / Next action.
