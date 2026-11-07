# Design quality gate

Use this checklist for NewWave Africa UX audits, design handoffs and UI PR reviews. It is a **verification template**, not a declaration that the current product passed every check. Read `AGENTS.md`, the task's acceptance criteria and the approved NW identity before testing.

## Review record
- **Task / PR / commit SHA:**
- **Reviewer / date:**
- **Build and environment:** real browser or static fixture; OS, viewport, zoom, browser, reduced-motion settings
- **Affected paths and user journeys:**
- **Evidence location:** screenshot/video/CI/issue links, reproduction steps

Every row must end as **pass**, **fail**, **not checked** or **not applicable with reason**; do not treat a source-code review as a completed hands-on test.

## Gate A — intent, hierarchy and content
- [ ] One primary purpose and next action are clear; supporting details have appropriate emphasis.
- [ ] Typography, spacing, radii, button hierarchy and tokens match the **existing** forest/ivory NW identity.
- [ ] Containers, borders, gradients, animated marks and decorative labels each serve a specific purpose.
- [ ] Fictional samples, browser-local drafts, prerecorded audio and demo classification/ranking are accurately labelled.
- [ ] Creator attribution, rights confirmation, privacy, source content and category/language claims are respected.

## Gate B — interaction and state integrity
- [ ] Default, hover, focus-visible, pressed, selected, disabled, pending, error, empty, long-content and offline/unavailable states are checked where relevant.
- [ ] Pointer, tap and keyboard alternatives support the same result; screen-reader name and pressed/state semantics are accurate.
- [ ] Rapid repeat actions preserve the user's latest intent without stale response overwrites or duplicate counts.
- [ ] Bookmark changes are immediate and explicitly **browser-local**; no fabricated social counts or false server-save indication.
- [ ] User can recover from errors. Storage refusal preserves existing drafts; blocked storage produces truthful visit-only feedback.
- [ ] Reading modal restores focus and closes via button/Escape without scroll or focus traps. Native controls remain usable.
- [ ] Recording/narration indicators reflect actual state, and interruption/pause/stop behavior is consistent.

## Gate C — responsive and accessible
- [ ] Review **320, 375, 768, 1024 and 1440 CSS px** where relevant; note any width not tested.
- [ ] Check **200% zoom**, long titles, large numerals and longer or translated labels; no obscured control or unexpected horizontal scrolling.
- [ ] Keyboard order, skip navigation, visible focus in light/dark surfaces and dialog focus tested.
- [ ] Text contrast checked against real backgrounds: WCAG AA generally 4.5:1 normal text, 3:1 qualifying large text; meaningful control cues generally 3:1, with criterion exceptions.
- [ ] Prefer touch targets of 44 × 44 CSS px where space permits; WCAG 2.2 AA minimum has different rules and exceptions.
- [ ] Color is not the sole signal of a state; icon labels remain understandable without sound or motion.
- [ ] System and in-product reduced-effects modes retain all functionality; nonessential movement/blur/sound are suppressed.
- [ ] Bounded animations can be interrupted, do not autoplay essential transitions, and avoid undue performance/bandwidth cost.

## Gate D — evidence and release decision
- [ ] For code changes, log focused regression checks, `npm run typecheck`, `npm run build` and any actual browser/assistive-tech checks.
- [ ] Separate static fixture observations from hydrated app tests, and PR CI from the production Pages deploy job.
- [ ] Report **passed / failed / not checked / not applicable** and include severity-rated findings with reproducible steps.
- [ ] Identify remaining device, screen-reader, low-end performance, privacy, OS preference or storage-failure gaps.
- [ ] Record reviewer disposition, next owner and rollback path.
- [ ] Human approval obtained before merge/deploy/publish; a checklist tick is not release authorization.

## Severity and disposition
| Level | Example | Action |
| --- | --- | --- |
| **P0 / blocker** | Unusable core task, data loss, exposed secret, misleading publication/consent, keyboard trap | Stop release; repair and retest |
| **P1 / major** | Serious responsive obstruction, unreadable text, broken reduced-motion behavior, incorrect status | Fix before release or document explicitly accepted risk under project policy |
| **P2 / polish** | Minor optical alignment or nonessential animation tuning | Schedule with owner, unless it prevents acceptance criteria |

Do not mark `DESIGN-01` or `DESIGN-13` as done from merged PRs alone. Link findings to `docs/design/DESIGN-PLAN.md` and the exact implementation/CI SHA. Use `docs/AGENT-HANDOFF.md` to transfer unresolved QA.
