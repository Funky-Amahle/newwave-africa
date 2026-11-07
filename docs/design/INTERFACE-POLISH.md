# DESIGN-13 — Existing interface polish

Applies the owner's supplied interface rules to current NewWave Africa controls.
The owner explicitly chose existing-interface polish rather than adding likes or
a wheel picker. Preserve the editorial palette, authored artwork and Haley audio.

## Changes

- Remove repeated section eyebrows and redundant sample badges. Keep one explicit
  fictional/draft label per card and preserve creator attribution.
- Sentence-case story categories, loosen display tracking and remove decorative
  terminal punctuation from short workspace headings.
- Align narration, creator-format and download controls around 4 px corners and
  at least 44 px targets. Keep selected bookmarks filled, labelled and pressed;
  no fabricated social counts, reaction sounds or new gestures.
- Stable numeral widths for counts and percentages; a reserved Save/Saved target.
- Paper-colored keyboard focus on dark sections; clay focus on light sections.
- Quiet status messages use a boundary rather than a heavy accent stripe.
- Bookmark callbacks synchronously advance a ref before state and localStorage,
  preserving the latest choice across rapid sequential input. Existing truthful
  visit-only storage-failure messages remain; there is no server save operation.

## Verification actually performed

- Typecheck, 29 discovery/playback tests and the Pages production export passed.
- Impeccable detector returned no findings for changed UI files.
- Production browser previews at 1280 px and 390 px had no horizontal overflow.
  Mobile format buttons measured 50 px high; narration controls measured 46 px.
- Save/Unsave/Save produced one bookmark, persisted after reload. Enter removed
  the bookmark, updated count to zero, preserved focus and displayed a 3 px outline.
- Keyboard focus on the dark utility control used the paper outline. Reduced
  effects suppressed all inspected indicator animations.
- Creator format selection worked on mobile. Search with no match showed its
  empty state; Reset discovery recovered the collection.
- Calculated contrast: ink/paper 14.23:1, muted/paper 6.27:1, clay/paper 5.36:1,
  paper/forest 11.04:1, status text/background 9.72:1.
- Quality-guardian source review found no blocking correctness, privacy or
  accessibility issue. Storage-failure behavior was source-reviewed rather than
  forced in the browser; OS setting changes and a screen-reader/device matrix
  were not exercised.

PR review and owner approval remain required before merge/deployment.
