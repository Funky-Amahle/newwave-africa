# NW-35 / DESIGN-23 — Enhanced NewWave experience

Status: implementation in progress; draft PR #67, not released.

Readers can explore African perspectives and creators can shape a story while
retaining authorship. The primary action opens Creator Studio. A theme picker
previews four fictional samples and opens the existing accessible reader.

## Design decisions

Reference: https://layalabs.in/, public HTML/CSS reviewed on 12 November 2026.
Its oversized editorial titles, simple work index, and clear section rhythm
inform the layout. The owner explicitly requested keeping NewWave's identity:
ivory #f5f3ed, forest #193b2c, clay #995137, the approved NW monogram/wordmark and
Fraunces serif typography. Inter Tight supports navigation and body text under
its bundled OFL. No Laya source, copy, logo or product artwork is redistributed.

Alternatives considered: a complete reference palette, or a composition-only
adaptation using NewWave's existing theme. The owner selected the latter. The
final experience combines NewWave's warm editorial surfaces with stronger hierarchy,
a clearer creator-tool index, more generous spacing and original illustrated
story covers. Discover, Creator Studio and Our Approach now share the same typography, warm surfaces, rounded panels and responsive spacing. Existing application behaviour is preserved.

Design skill direction: sentence-as-layout, seed 1242004815. The owner's existing
palette, serif emphasis and reference composition take precedence over randomized
section layouts and the skill's aesthetic restrictions on warm/clay palettes.
No loader, custom cursor, invented usage metrics or unsupported sign-up flow.

Inventory: eight fictional themes, the approved NW mark, five planning canvases,
browser-local drafts, creator-owned narration keys, writing/voice/visual tools,
adjustable discovery variety, explicit authorship and permission, and open source.
Argument: make room for a story → choose a perspective → develop your idea →
understand ownership → open the studio. The live interaction changes the sample
preview by theme and opens the existing reader.

Original covers depict a neighbourhood desk, a spoken-memory record, community
books/doorway and cultivated fields. They are illustrative artwork, not reports
or photographs of real people. Rebuild with scripts/design/generate-studio-covers.py.
No new third-party runtime assets or speech requests are introduced.

## Verification and handoff

- All 143 offline JavaScript tests passed. The credential-free Pages production
  build, including TypeScript validation, exported route/navigation/asset checks,
  QA-script syntax and diff whitespace checks passed on the final theme.
- Dependency reads in the original working directory timed out. A clean source
  copy with matching installed dependencies and no environment files is used in
  work/laya-build. The preview is http://127.0.0.1:4174/newwave-africa/.
- Local browser automation is blocked by macOS bootstrap_check_in permission
  restrictions and the browser runtime reports no connection. No local screenshot
  score or phone/keyboard pass is claimed. The owner supplied a preview screenshot.
- GitHub CI on the first PR revision passed production/static and standalone server
  checks and existing Creator Studio browser checks. It found mismatched accessible
  names on four cover buttons and homepage overflow at simulated 200% CSS zoom.
  Covers now use their visible text as their accessible name, with a screen-reader
  action prefix. Intrinsic grids and container-sized display type address reflow.
- The owner's screenshot exposed language-trigger text inheriting a background
  token. Trigger colour is explicit; the light panel remains isolated. CI requires
  rendered trigger contrast of at least 4.5:1 at each checked width.
- The previous theme revision passed GitHub CI run 43181617637, including browser, Pages and server builds. The all-pages revision requires a fresh CI run.
- The added Playwright suite checks all four routes at 1440/768/390/320px for theme consistency, a single main heading and horizontal overflow, plus homepage keyboard theme selection,
  sample reading, bookmark handoff, Escape/focus restore, legacy insight/studio
  hashes, reduced effects and page errors. CI uploads screenshots for review.
- Independent quality-guardian delegation failed with model service rate limits,
  including the owner-requested retry. Parent reviewed hooks, native controls,
  cleanup, privacy, routing and theme boundaries; independent review is pending.

Next owner: maintainer. Review final CI results/screenshots, complete visual/device
checks and approve merge/release separately. Revert the NW-35 change to restore
its predecessor. Saving a draft is local-only; no new accounts, public publishing
or automatic translation is introduced.

## Original-content blend — 12 November 2026

The owner requested a mix of the original content and current design. Retain the
current editorial hero, theme picker, covers and tool index; restore the original
“Many voices. New perspectives.” introduction, fuller African storytelling mission,
Creation & Craft audience and three practical production principles. Add expandable
clarity notes for discovery, browser-local saving and optional voice services.
This is preferred to restoring the entire old homepage, which would duplicate
Discover's filters and insights. No new public publishing or provider requests.
Acceptance: original mission and seven creative audiences visible, existing sample
controls preserved, responsive grids, native keyboard-operable details and local
Pages build. Local hydrated browser checks remain unavailable; prior CI applies
to the preceding revision only. The credential-free Pages production build (including TypeScript validation), exported route checks and diff whitespace checks passed for this blend. Fresh hydrated browser verification remains pending.
