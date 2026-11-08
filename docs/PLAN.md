# NewWave Africa — Implementation Plan

## Objective
Demonstrate creator-controlled story categorization and transparent diversity-aware discovery.

## Status
todo = not started; in progress = assigned or implemented with acceptance evidence outstanding; blocked = unresolved dependency; done = merged and verified against the stated acceptance criteria. A merged PR or passing CI does not by itself establish mobile, microphone, or accessibility acceptance.

**Release evidence (8 November 2026):** [NW-18 PR #38](https://github.com/Funky-Amahle/newwave-africa/pull/38) was merged into `main` at `a065da0be6dc9226ad87e6dad81a72ad9664fff9`; [production GitHub Pages workflow 42500343925](https://github.com/Funky-Amahle/newwave-africa/actions/runs/42500343925) passed. Public device/browser interactions and the final video remain separate QA gates.

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

| NW-11 | P1 | product-designer / frontend-builder / quality-guardian | Consolidate Base44 design and GitHub functionality in one app | NW-09,NW-10 | Shared CreatorStudio component; split wave landing; self-hosted typography; existing ranking, narration, drafts, consent and exports retained; Pages/server builds and responsive browser evidence; current source pushed in a PR | in progress |

| NW-12 | P1 | frontend-builder / quality-guardian | Consolidate navigation on GitHub Pages with Creator Studio and Our Approach routes | NW-11 | Static direct-entry pages with shared identity and persistent written draft state during client navigation; transparent approach copy; Pages/server builds and route checks | in progress |

| NW-13 | P1 | system-architect / backend-builder / quality-guardian | Plan Deepgram speech-to-text while retaining GitHub Pages | approved backend account/endpoint deferred | Pages-only tools remain usable without secrets; reviewed backend/CORS/consent/limits/verification roadmap documented; no live transcription claimed | in progress (plan only) |

| NW-14 | P1 | frontend-builder / quality-guardian | Enable Pages-only session-key transcription demo | NW-13 | No bundled/stored/shared key; explicit consent; bounded direct Deepgram stream; cancel, review and append; accurate docs and provider verification limits | in progress (PR #34 merged/deployed; local-origin provider test passed; public-origin and device QA pending) |

| NW-15 | P1 | product-designer / frontend-builder / quality-guardian | Add screenshot-guided question speech controls and story metadata | Per-question reviewed voice insertion, five practice pills, full-width prompts, credit/country/category/language controls, preserved local drafts and consent; responsive and keyboard evidence | in progress |

| NW-16 | P1 | frontend-builder / quality-guardian | Animate discovery card artwork | Continuous gentle wave, orbit and disc motion; existing visibility and reduced-motion controls retained; static export build and review | in progress |

| NW-18 | P0 | ai-discovery-engine / product-designer / quality-guardian / release-manager | Judging-readiness demonstration | Fixed deliberately imbalanced fictional dataset shows baseline versus diversity order; creator path links existing safe tools; CI checks and a pending real-device checklist; script describes current features accurately. Review PR before merge/deploy. | in progress (PR #38 merged/deployed; real-device acceptance and final demo video pending) |
| NW-19 | P1 | frontend-builder / african-context-reviewer / quality-guardian | Optional language translation handoff in story reader | Static Pages; no translation API credential | Original text and attribution preserved; provider and machine-output limitations explicit; only fictional samples may appear in external URLs; browser-local drafts require manual copy and opt-in sharing; keyboard/mobile and external-link QA; PR approval before merge/deploy | in progress (PR #40 merged/deployed; external provider and device QA pending) |
| NW-20 | P1 | frontend-builder / african-context-reviewer / quality-guardian | Homepage language selector with Google Websites handoff | NW-19; static Pages | Visible shared header control; original English retained; no automatic translation or private draft transfer; user-controlled copy of public URL; language selection and browser/device QA | in progress (review PR; not deployed) |

| NW-21 | P0 | frontend-builder / product-designer / african-context-reviewer / quality-guardian | Full-length fictional flagship and editorial reader | NW-18; preserved existing preview recordings | Featured story opens with accessible long-form text, distinct fictional/cultural disclosure, reading time, responsive artwork; existing audio and translated links explicitly remain short-preview-only; local drafts unchanged; automated tests plus real mobile/keyboard review | in progress (feature PR; not released) |

| NW-22 | P0 | frontend-builder / product-designer / quality-guardian | Reader clarity and why-this-story explanations | NW-21; existing local ranking | Flagship text-size toggle; explicit short preview audio labeling; accessible per-card explanation accurately reflects search, interest, category counts, diversity, alphabetical tie-breaking and local demo scope; no secret/user analytics introduced; tests and real-device review | in progress (feature branch; PR review and browser QA outstanding) |

| NW-24 | P1 | product-designer / frontend-builder / quality-guardian | Voice Studio recording-mode visual overhaul | Existing MediaRecorder, local upload, explicit transcription consent | Two accessible record/upload mode cards, distinct recording/preview/empty states, single playback surface, recording timer, tasteful decorative motion with reduced-motion fallback, retained 3-minute/8MB limits and manual device QA | in progress (feature branch, no release) |

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
