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

## ADR-004 — Complementary GitHub and Base44 creator experiences

**Status:** Proposed for review, not an accepted migration or cross-platform integration.

**Context:** GitHub Pages provides a local-first static prototype with transparent ranking and bundled sample recordings. Base44 uses TanStack Start, dedicated routes, Story entities and optional public publishing. Their deployments, authorization and storage are independent.

**Proposed decision:** Share design language, accessibility conventions and user-controlled creative briefs rather than silently synchronizing databases or replacing frameworks. Pilot shareable Creator Studio fragments and real per-format progress in GitHub. Preserve Base44's distinct creator page layout. Protect browser-local work, creator rights and optional media consent.

**Deferred:** Before any publishing handoff, independently review Base44 Story entity read/write rules, caller authorization, moderation, delete/takedown, media permissions and upload cost/rate limits. The source-reviewed createStory handler did not itself show explicit caller-auth middleware; this is a review item, not proof of missing platform enforcement.

**Alternatives / rollback:** Rewriting either app or auto-posting browser drafts risks privacy and breaks the Pages export. Revert the pilot commit to restore previous navigation; no existing drafts are migrated or deleted. See docs/design/CREATOR-EXPERIENCE-FUSION.md.
