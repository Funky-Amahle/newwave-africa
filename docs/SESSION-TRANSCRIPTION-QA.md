# NW-14 session-key transcription — verification

Verified: 8 November 2026. Branch: feature/pages-session-transcription-20261107. Source baseline: main 7ee24c8, including the Pages routes and merged NW-13 roadmap.

## Accepted behavior

The owner accepted a session-only key entry alternative for the public Pages demo. The implementation does not bundle a shared key, retrieve secrets, persist the key in browser storage or send it to the app's server. The key belongs to the operator and is sent as WebSocket protocol authentication only to the fixed Deepgram endpoint. This is an operator-key demo, not a production shared-secret service. The planned backend remains relevant for a shared service.

## Real provider smoke test — passed

Environment: local production Pages export served under /newwave-africa, in-app browser. The owner entered a restricted key directly in the visible password field; its value was never retrieved or logged by the agent. Selected audio: public/narration/s1.mp3, the already-public fictional Haley sample. Target field: story body.

1. Before consent and a key, Transcribe was disabled.
2. After owner entry and explicit recording/processing consent, Transcribe opened the real Deepgram connection.
3. The final transcript matched the fictional sample title and description. It required punctuation correction, demonstrating why review remains mandatory.
4. The written story stayed empty until insertion was chosen.
5. Clear session key left the password field empty, confirmed by a boolean check without reading its former value.
6. An authored opening was entered locally. The transcript punctuation was edited, then Add to selected answer appended the reviewed text after a paragraph break, preserving the opening. The review field cleared and the UI reported Added to your answer.
7. No written draft, visual or provider key was published. The local preview remains available with only non-sensitive demo text and a cleared key.

## Automated checks

All 59 JavaScript tests passed, including nine session transport tests. The session transport tests cover consent/input rejection before connection, fixed URL and protocol auth, selected bytes/chunk bounds, CloseStream order, final-only aggregation and deduplication, cancellation/late callbacks, interruption/empty speech/provider failures, response/transcript bounds, timeout and cancellation while upload backpressure is active. Existing server transcription safeguards remain unchanged. See CI for the exact tested commit and final count.

The Pages production build and exported route/asset checks passed; the optional server production build passed. TypeScript and standalone startup checks for all three page routes also passed. Mechanical UI detection returned no findings. Quality Guardian independently reviewed the transport and tests; identified roadmap contradictions were corrected.

## Verification limits and release

The real provider test used one short fictional MP3 and local origin. It does not validate all formats, all accents, microphone capture, physical touch or full screen-reader use. A public-origin smoke test remains after deployment. Client size/deadline limits do not enforce account-wide usage or spending; the operator's key restrictions/quotas and revocation remain their account controls. Browser extensions or scripts with access to the page can observe session-entered credentials; the field is not a secret vault.

No merge/deployment is performed by this evidence record. Owner approval is required by AGENTS.md. Rollback reverts the demo transport and restores the static unavailable state, without changing draft/bookmark storage.
