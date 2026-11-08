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


## ADR-005 — One repository implementation with the complementary visual design

**Status:** Implemented on the NW-11 feature branch; supersedes ADR-004's two-design pilot direction for the repository UI. Merge/deployment remains owner-gated.

The owner explicitly requested one combined experience. Keep Next.js as the canonical implementation, adopting Base44's cream/forest/clay split hero, Fraunces type and two-column creative workspace. Compose all existing private creation tools through `components/creator-studio.tsx`, shared by the static Pages and optional server editions. Retain existing narration ownership, discovery diversity controls, local storage keys, permission confirmation, bounded transcription and asset downloads. No Base44 SDK, public Story writer or upload-to-publish handler is imported.

Base44's hosted copy remains independent and its builder is currently credit-blocked. Source inspection of app `6aeea98065a4710c0d073bad` supplied visual reference only. This is neither a deployment to Base44 nor database synchronization. Transcription still requires the configured server edition; a visual merge cannot enable protected endpoints on Pages. Rollback: revert the feature commit; no storage schema or existing drafts are migrated.


## ADR-006 — GitHub Pages as the primary app with dedicated static pages

**Status:** Implemented on NW-12 feature branch, pending review/owner release approval.

The owner chose GitHub Pages for the combined app. Export `/creator-studio/` and `/our-approach/` alongside the homepage; Next Link supplies the configured `/newwave-africa` base path. A shared client layout owns the existing browser-local collection and in-memory written draft state across client-side route changes. Media capture panels unmount when leaving the studio; no new upload/storage service is introduced. Legacy homepage creator fragments redirect to the dedicated route, preserving nested tool fragments. Discovery insights remain a homepage view.

Our Approach describes human authorship, seven creator audiences/five practices, fictional samples, illustrative diversity ranking and exact storage/transcription limits. Pages is fully usable for typing, recording, local media preview, separate downloads and prerecorded sample narration. It cannot host a secret-backed Deepgram endpoint: the optional server implementation remains prepared but is not part of Pages. No Base44 runtime dependency or hosted copy is required. Existing localStorage keys stay unchanged. Revert this feature commit to roll back page routing without altering stored drafts.


## ADR-007 — Keep Pages-only now; defer the Deepgram connection

**Status:** Owner direction recorded; roadmap proposed in NW-13.

The owner reaffirmed GitHub Pages and asked for a plan rather than a backend deployment. Keep the existing static recording/upload/playback/writing/download tools. Do not enable Deepgram transcription or put credentials in the public build. Demo recording content does not remove the credential boundary. The approved future direction remains Deepgram behind a separately approved secure HTTPS endpoint, with exact-origin CORS, access and spend limits, explicit audio consent and reviewed insertion. No backend host is selected by this decision. See docs/PAGES-SPEECH-TO-TEXT-PLAN.md.


## ADR-008 — Explicit session-key demo on Pages

**Status:** Owner accepted the session-key alternative after requesting a public demo with a restricted key. Implemented on NW-14 branch; not deployed.

Keep the provider key out of source and artifacts. The Pages demo instead lets the operator enter their own restricted key in the transcription panel, held only in that component’s memory. It is cleared on explicit clear/unmount, never stored or supplied to visitors. Selected audio and protocol authentication go directly to the fixed Deepgram Nova WebSocket endpoint after consent; use the existing review/edit/append flow. Deepgram’s REST API requires a browser proxy, whereas its streaming endpoint supports direct browser connections. The optional server edition retains its access-code-protected REST flow. A shared key service still requires the planned backend. Client limits are usability safeguards, not enforceable account spend controls. Real provider/browser validation is separate from offline transport tests.
