# NW-17 / DESIGN-21 — Creator Studio voices

Creator Studio now offers the 36 requested English Flux TTS voices with Haley as default, accent and presentation labels, a direct tool-navigation link, and a local text narration brief containing the selected model and exact current story text. Selection lives in shared page-session state, not browser storage. Existing audio and transcription are unchanged. The separate official audition demo receives no draft or selected model. This feature prepares narration; it does not synthesize audio.

Catalog checked 2026-11-08: https://developers.deepgram.com/docs/flux-tts/voices. Wes is American masculine; Conor is British masculine in the current official catalog (different from the supplied Irish label). Gemma is British feminine.

Validation: 69 Node tests pass, including three catalog/export tests now wired into Pages CI; Pages production build (including type validation), route/assets check, and git diff check pass. Browser verified Haley initial default, 36 options, selected Meena, enabled brief after typing a fictional story, and successful download feedback. Corrected Gemma label verified in final export. At 375px no horizontal overflow; native select focus ring visible and controls wrap. Desktop/mobile screenshots are local workspace outputs. Independent Quality Guardian review found and resolved Gemma label and CI test-list omissions; no runtime/privacy blocker.

Not run: live Deepgram generation (not implemented here), separate provider audition interaction, server production build, full screen-reader/200% zoom audit. Local helper tests verify exported bytes; browser feedback alone does not verify the saved file's contents.

Release: feature branch based on main, independent of pending animation PR36. Owner approval required before merge/deployment under AGENTS.md. Roll back by reverting this change. Next owner: repository owner for PR review.
