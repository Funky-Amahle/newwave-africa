# NewWave Africa — Implementation Plan

## Objective
Demonstrate creator-controlled story categorization and transparent diversity-aware discovery.

## Status
todo = not started; in progress = assigned or implemented with acceptance evidence outstanding; blocked = unresolved dependency; done = merged and verified against the stated acceptance criteria. A merged PR or passing CI does not by itself establish mobile, microphone, or accessibility acceptance.

**Release evidence (8 November 2026):** [NW-18 PR #38](https://github.com/Funky-Amahle/newwave-africa/pull/38) was merged into `main` at `a065da0be6dc9226ad87e6dad81a72ad9664fff9`; [production GitHub Pages workflow 42500343925](https://github.com/Funky-Amahle/newwave-africa/actions/runs/42500343925) passed. Public device/browser interactions and the final video remain separate QA gates.

| ID | Priority | Skill owner | Task | Dependencies | Acceptance criteria | Status |
|---|---|---|---|---|---|---|
| NW-01 | P0 | quality-guardian | Validate existing MVP build | none | Install, typecheck/build, record failures | todo |
| NW-34 | P1 | project-planner / quality-guardian | Add GitHub community standards | Owner-approved MIT license and published reporting contact | Code of Conduct, contributing guide, MIT LICENSE, security policy, bug/feature forms and README links; YAML and link review; draft PR; default-branch recognition after approved merge | in progress (feature branch; review and merge pending) |
| NW-33 | P1 | project-planner / frontend-builder / quality-guardian | Multilingual ElevenLabs narration on GitHub Pages | Creator-owned restricted key; explicit consent | Sixteen documented language choices, five preset voices, eleven static samples; one bounded direct request; memory-only key, cancellation and MP3 download; no automatic translation or owner clone; tests and static export; browser/device and pronunciation review reported | in progress (feature branch; review and deployment pending) |
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

| NW-25 | P1 | product-designer / frontend-builder / quality-guardian | Base44-inspired motion and response adaptation | NW-24; existing hero wave and fictional spotlight | Clear next/previous/pagination with active state; opt-in 8.5-second rotation pauses on engagement, background or offscreen; reduced effects preserved; no live public content imports; regression tests and real browser/mobile QA | in progress (feature branch PR; live-device QA pending) |

| NW-26 | P0 | frontend-builder / quality-guardian / release-manager | Four-route primary navigation | Existing shared discovery workspace and static Pages export | Ordered Home, Discover, Creator Studio, Our Approach header; dedicated /discover/ route; old /#discover deep links still work; four direct-entry export docs, base path, backward/forward, keyboard and mobile QA | in progress (feature PR; real-browser QA pending) |

| NW-27 | P1 | frontend-builder / product-designer / quality-guardian | Shorten navigation effort in Creator Studio | Existing six section anchors and local-only creator tools | Sticky shortcut navigation with desktop links, mobile section picker, top return, compact mobile step overview, focusable targets and reduced-motion-safe browser scrolling; preserve media and draft state; route/build tests and manual device QA | in progress (draft PR; real-browser checks pending) |

| NW-28 | P1 | frontend-builder / quality-guardian | Correct Creator Studio visual section jump and uploaded-file download naming | NW-27; existing original visual editor | `#studio-visual` focuses the visual editor rather than the media sidebar; uploaded JPG/PNG/WebP downloads retain corresponding extension; original artwork SVG download and privacy unaffected; targeted regression and build verification | in progress (draft PR; live device QA pending) |

| NW-29 | P0 | quality-guardian / frontend-builder | Turn Creator Studio visual browser QA into reproducible Chromium checks | NW-28 deployed; static Pages export | Playwright checks desktop visual jump, SVG and synthetic JPG/PNG/WebP actual downloads, phone selector and five-width overflow; screenshots on failure; CI results and manual QA gaps reported honestly | in progress (browser checks proposed on PR; physical-device QA pending) |

| NW-30 | P1 | frontend-builder / quality-guardian | Generate Creator Studio narration | NW-17; session key | Explicit text consent, selected voice, full-story WAV playback/download, cancellation and cleanup | in progress |

## Capstone education framing and roadmap (NW-31)

| ID | Priority | Skill owner | Task | Dependencies | Acceptance criteria | Status |
| --- | --- | --- | --- | --- | --- | --- |
| NW-31 | P1 | project-planner / quality-guardian | Document education beneficiary, service benefits, adoption roadmap and four-minute capstone narration | Current source; existing reader/creator study | README/runbook links; current vs proposed capabilities accurate; four judging criteria covered; existing study thresholds preserved; local links and diff checked; review evidence and limitations reported | in progress (documentation branch; PR review pending) |

See [impact and roadmap](CAPSTONE-IMPACT-AND-ROADMAP.md) and [video narration](CAPSTONE-VIDEO-SCRIPT.md). No human study, partner recruitment, provider request, product release or measured impact is established by these documents.

## ElevenLabs owner voice setup (NW-32)

| ID | Priority | Skill owner | Task | Dependencies | Acceptance criteria | Status |
| --- | --- | --- | --- | --- | --- | --- |
| NW-32 | P1 | backend-builder / quality-guardian | Add official ElevenLabs SDK and private owner voice-clone setup | CLI onboarding; owner-enrolled clone | Lazy server-only client; no bundled key or public endpoint; private-sample ignore; setup guide; typecheck, offline pilot tests and onboarding check; operator narration evidence with owner-supplied clone | in progress (SDK checks and requested audio generation pass; PR and full-export listening review pending) |

See [ElevenLabs setup](ELEVENLABS-VOICE-SETUP.md). The existing fixed-text voice pilot remains separate. The owner enrolled their clone externally; requested audio was generated locally, but no narrated video, public cloning service or deployment is established by SDK installation.

## Definition of done

Story submission, category review, diverse discovery, honest metrics, passing build and reproducible demonstration.

### NW-34 community standards handoff — 11 November 2026

Branch: `feature/community-standards-20261111`; the draft PR identifies the final commit. The owner selected MIT and approved `xolmzoli@gmail.com` for public listing as the private reporting contact. Scope is nine documentation/configuration files: Code of Conduct, contribution guide, license, security policy, three issue-template files, README links and this plan.

Ruby YAML parsing passed for all three issue-template files. A local verification script checked issue-form structure, unique field IDs, reporting contacts, license heading, placeholders and 37 local Markdown links. Diff whitespace checks passed. An independent quality-guardian content/link review found no blockers. Application builds and browser/device tests were not run for these documentation-only changes. GitHub's rendered issue chooser, default-branch community recognition and email delivery remain unverified.

Next owner: maintainer. Review the draft PR, approve merge, then check the repository's Community Standards page and rendered forms. No merge, deployment or private-reporting setting change is performed by this task.


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
