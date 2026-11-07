# Architecture Decision Records

## ADR-001 — Minimal MVP
Status: accepted for prototype. Use Next.js, browser-local drafts and server-only optional OpenAI classification. Avoid premature infrastructure.

## ADR-002 — Explainable discovery
Status: accepted for prototype. Use transparent category-scarcity weighting and documented baseline. Illustrative data does not prove real-world impact.

## ADR-003 — Human review
Status: proposed. Require creator category approval and consent before shared publishing.

## Template
ID / Date / Status / Context / Decision / Alternatives / Consequences / Rollback.

## NW-09 — Consented voice answers and local visual companions

Use prerecorded Deepgram Nova-3 English transcription rather than device dictation,
per owner choice. Prepare a same-origin Next.js server edition with private runtime
secrets and a pilot access code; keep Pages functional without pretending it has
POST APIs. Transcripts are reviewed and explicitly appended, never auto-published.
Visuals remain local image blobs or original bundled SVGs; audio and visual downloads
are separate assets. No new media storage or video rendering service is introduced.
