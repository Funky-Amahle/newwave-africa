# NW-15 / DESIGN-19 — QA and release handoff

Branch: feature/creator-question-controls-20261108. Base: main 252745d, including merged session-key transcription PR34.

## Implemented

Screenshot-guided full-width numbered prompts, five practice pills, per-question Speak disclosures, and story working title/credit/country/category/language. Common country/language choices include free entry; explicit category wins over local suggestion. Saved drafts use existing fields and storage. Root state preserves metadata through client navigation. Question notes remain page-memory only, as disclosed.

## Evidence — 8 November 2026

- All 66 JavaScript tests passed, including seven new boundary, metadata precedence, validation and serialization checks. TypeScript passed.
- Pages production build and exported route/asset checker passed. Server production build, standalone startup, unavailable unconfigured endpoint, three page routes and visual delivery passed.
- Impeccable detector returned no findings for changed UI files. `git diff --check` passed.
- Real local static export in in-app browser: per-question Speak opens the correct sole question target, selecting another removes the previous question panel, opening does not capture or transmit audio. Existing body panel remains separate. Empty/no-consent transcription disabled. Keyboard Enter toggles; Tab reaches associated textarea, with visible 3px clay focus outline.
- Notes retained through practice switching; existing note remained unchanged on opening/closing voice input. No provider quota or credential used in this follow-up. Real provider verification is recorded separately in SESSION-TRANSCRIPTION-QA.md.
- Saved a clearly fictional test draft with explicit Culture & Heritage category (despite software keywords), custom country United Kingdom and custom language Tshivenḓa / English. Reloaded and searched discovery; reader displayed all three selected values and credit Demo creator. Browser-only test data; nothing published.
- Mobile 375×812 and desktop 1440×900: no horizontal overflow. Questions use full-width rows, metadata stacks on mobile and pairs on desktop, each Speak button 44px high. Visual screenshots inspected. Placeholder opacity corrected to 1; foreground #585a51 on #fffdf8. Temporary viewport reset.
- Independent Quality Guardian inspected source, passed 13 targeted tests and diff check, and found no blocker.

## Release boundary

No merge or deployment performed. Owner approval required by AGENTS.md. PR CI must pass. Roll back by reverting the feature commit; persisted Story schema/storage key is unchanged. No bundled credentials or new backend. English-only STT, full microphone permission/assistive-technology testing and production shared-backend provisioning remain outside this UI change. Transport cancellation remains covered by existing tests; no new live-provider cancellation test performed.
