# NW-35 / DESIGN-23 — Laya-inspired NewWave

Status: implementation in progress; not released.

Audience: readers seeking a wider mix of African perspectives and creators who
want to shape a story while retaining authorship. Primary action: open Creator
Studio. The landing page also offers a live fictional-sample preview and discovery.

Reference: https://layalabs.in/, public HTML/CSS inspected on 12 November 2026.
Its near-black ground, warm-white type, lime action colour, oversized grotesque
and italic serif headlines, wide work index and editorial scroll rhythm inform
the adaptation. No reference source code, copy, brand assets or product claims
are bundled. NewWave's existing NW logo and product boundaries remain authoritative.

Two alternatives considered: preserve the cream/forest editorial layout and add
Laya's oversized type, or use the reference's dark studio composition. The latter
follows the owner's explicit request more closely; dark styling is confined to
the landing route and its shared header/footer, leaving working application
screens in their existing accessible theme.

Design skill direction: sentence-as-layout, seed 1242004815. The user-selected
reference overrides the randomized section layouts, house restrictions on
accented serif words and the suggested large image masthead. No decorative
loader, custom cursor, copied lab notebook, invented usage metrics or sign-up
form is added. Four original illustrated covers replace the reference's product
preview artwork. Inter Tight and Instrument Serif are bundled under their OFLs.

Inventory: eight fictional themes; the approved NW monogram; five planning canvases;
browser-local drafts; creator-owned narration keys; writing/voice/visual tools;
adjustable discovery variety; a readable sample story; explicit ownership and
permission; an open GitHub repository. Page argument: stories deserve room →
choose a perspective → use the working creator tools → understand privacy and
authorship → start a story. The live interaction changes a fictional story preview
by theme and opens the existing accessible reader.

Responsive: full-width display title, compact wordmark and wrapped navigation on
phones; stacked story preview and alternating sections; 44px minimum touch targets.
Entrance/hover motion follows the existing effects toggle and reduced-motion
preference. No autoplay audio, provider requests or new third-party runtime assets.

## Verification and handoff

- Passed: all 143 offline JavaScript tests, the credential-free production Pages
  build (including TypeScript validation), four exported route/navigation/asset
  checks, QA script syntax and diff whitespace checks.
- Original working-directory dependency reads timed out. The production checks
  used `work/laya-build`, a clean source copy with the already installed matching
  dependencies and no environment files. Final Pages output is served locally
  at http://127.0.0.1:4174/newwave-africa/.
- The new Playwright CI script exercises 1440/768/390/320px, keyboard theme
  selection, sample reader, bookmark handoff to Discover, Escape/focus restore,
  legacy insights/studio hashes, reduced effects and page errors. It is part of
  the existing browser-qa job; CI screenshots are uploaded for review.
- Not run successfully locally: hydrated screenshots, axe, phone emulation,
  keyboard and zoom checks. Browser runtime reported no connection, and the
  test-browser launch failed with macOS `bootstrap_check_in ... Permission
  denied`. No visual score or responsive pass is claimed without screenshots.
- The requested quality-guardian delegation failed twice with service rate
  limits. Parent reviewed source and React hooks, stable keys, native controls,
  cleanup, local bookmark boundaries and home-only styling. Independent review
  remains pending. The sample reader and language panel retain light component
  surfaces so the landing theme does not break their existing controls.
- The owner's preview screenshot showed the language trigger inheriting the
  dark paper token. The studio theme now explicitly assigns warm-white trigger
  text. CI also measures the trigger's rendered contrast against its nearest
  painted ancestor, requiring at least 4.5:1 at every checked width.

No source or media from Laya Labs is redistributed. Covers are original Pillow
illustrations in `scripts/design/generate-studio-covers.py`, with no real-person
likenesses or documentary claims. All three font files retain their OFL notices.
No provider generation, public publishing, new account system or automatic
translation was introduced.

Next owner: maintainer. Review the draft PR and CI screenshots, complete any
remaining visual/device checks, then approve merge and release separately.
Rollback: revert the NW-35 feature commit to restore the earlier homepage;
creator and discovery application logic remains unchanged.
