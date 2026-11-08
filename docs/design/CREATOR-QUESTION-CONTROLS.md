# NW-15 / DESIGN-19 — creator controls

The owner supplied two screenshots on 8 November 2026: planning questions with Speak controls, and a story metadata card. Preserve the existing cream/forest/clay identity and readable contrast, rather than copying faint reference text.

Use full-width prompt rows and five wrapping practice pills. Each Speak button expands an inline, question-specific VoiceToText instance; opening it does not request the microphone or send audio. Only one question panel exists at a time. Closing/switching cancels requests and releases capture through existing unmount cleanup. Notes and transcript remain separate until explicit reviewed insertion. Keep a panel open after insertion so its success feedback remains available. Closing discards its transient transcript/key; warn before that action in the panel.

An inline panel keeps the relevant question visible without the focus interruption of a modal. A shared voice selector was the existing alternative, but required a second question-selection step and hid the feature. The story-wide voice panel remains available for title, credit, country and body.

Story details: working title, optional credit, country, category, language. Country/language offer common choices and an explicit custom entry. Preserve South Africa/English defaults. Category defaults to local-rule suggestion; explicit creator choice wins. Validate metadata before saving and persist through the existing Story fields/root state. No storage migration or cloud upload. Story-language metadata does not expand the English-only transcription model.

Controls use native labels, select and disclosure semantics; at least 44px touch targets, single-column questions and stacked metadata on narrow screens, visible keyboard focus. No new animation or external assets.

Acceptance: append preserves prior notes; rejects overflow; correct question selected; switching practices retains notes; chosen metadata survives local save/reload; local suggestions remain truthful; Pages/server builds, narrow/desktop browser evidence and quality review. Merge/deployment still requires owner approval.
