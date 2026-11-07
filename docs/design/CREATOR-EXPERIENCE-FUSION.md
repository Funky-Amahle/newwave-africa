# DESIGN-16 / NW-10 — Complementary NewWave creator experiences

**Stage:** Small code pilot and design/architecture proposal, subject to review. **Checked:** 7 November 2026, GitHub main `9d39495` and Base44 app `6aeea98065a4710c0d073bad`. Base44 source inspected: `src/routes/_site/creator-studio.jsx`, `src/components/creator/CanvasQuestions.jsx`, `src/components/creator/VoiceDialog.jsx`, `src/lib/server-fns.js`, Story entity schema. These are source observations, not real-user tests.

## User job and proposed direction

Help African creators move from discovery to a human-authored, understandable creative process, whether they begin in the GitHub prototype or the Base44 creator studio. Complement the visual characters; do not blindly transplant CSS, rewrite frameworks or imply drafts move automatically across different origins.

**Option A — One rewritten codebase:** replace GitHub Next.js with Base44 TanStack Start or vice versa. A single runtime might be simpler long-term, but the migration changes storage, static export, publishing and consent. **Deferred.**

**Option B — Complementary twins with shared UX contracts:** keep GitHub's restrained reading-table discovery and local-first behavior; keep Base44's distinct dedicated creator flow and server-backed story pages. Align navigation, creator terminology, accessible states and reviewed optional exports while maintaining separate data boundaries. **Chosen for the pilot.**

## Source-grounded strengths

| GitHub / Next.js (static Pages) | Base44 / TanStack Start | Fusion opportunity |
| --- | --- | --- |
| Discovery diversity slider, category comparison, browser-local bookmarks | Dedicated `/discover` and `/creator-studio` routes | Direct-linkable workspace and truthful category explanations |
| Five planning canvases, Markdown download, browser-local drafts | Five guided canvas formats, separate creator page, editable transcript | Genuine progress cues and user-owned portable briefs |
| Reviewed sample narration, original visual waves and reduced-motion control | Visual presets, uploads, audio+visual preview and public story pages | Shared identity, different page composition and explicit media state |
| No public publishing from Pages; server transcription edition not hosted | Story entity creation and public media upload paths | Separate publishing/consent audit, **not automatic synchronization** |

## Phase 1 — Implemented in this branch

1. **Shareable workspace destinations:** GitHub URLs ending `#creator-studio`, `#discover` and `#discovery-insights` open the corresponding section without a server route. Header links and buttons update the hash. Back/Forward and direct links restore the selected section. The `#workspace` skip link and `#top` remain unchanged. Programmatic focus respects current behavior, and effects are controlled by existing reduced-motion rules.
2. **Honest planning feedback:** each of the five formats announces `N of 8 prompts drafted`, counting nonblank answers for that format only. The status does not claim the notes are saved. Existing downloadable brief, visual preview, per-question voice tools and browser-storage explanations remain.
3. **Visual restraint:** existing forest/ivory/clay tokens, serif typography, spacing, accessible focus and wave art remain. No new package, imported visual, animation loop, API call or social count is added.

### Interaction states and acceptance

- Directly opening the GitHub Pages `/newwave-africa/#creator-studio` link selects Creator Studio after hydration; site links and browser Back/Forward update the view correctly.
- Tab controls remain focusable and indicate pressed state; header anchors expose their current location and keep functional fragment URLs.
- Empty format displays `0 of 8`. Whitespace-only answers are not counted. Switching formats preserves the existing tab-memory notes and updates the count. Download remains the explicit keep-your-work action.
- The discovery and insights links work identically, including at 320, 375, 768, 1024 and 1440 px, 200% zoom, keyboard, assistive tech and system/manual reduced effects.
- Validate with focused tests plus current GitHub Pages and standalone builds. **Manual hydrated browser/assistive-tech checks remain unverified until run and recorded.**

## Phase 2 — Reviewed portability (not implemented)

Define a user-triggered **NewWave Creative Brief v1** schema with format ID, source prompt text, authored answers, local language and optional attribution. The apps' prompts differ, so no field is mapped by position without human review. Preview import, offer keep/replace choices, avoid autosend, and make an exportable backup. Validate file sizes, untrusted text, multilingual layouts and keyboard interaction.

## Phase 3 — Consented publication (blocked, not implemented)

Base44's source currently calls `createStory` and `UploadPublicFile` in the creator route. Our read of the server handler did not establish its caller-auth rules or Story entity row-level security, and it does not by itself demonstrate absence of platform protections. A publication bridge needs identity, explicit creator permission, media rights, moderation/appeals, secure authorization, private quota/rate controls, deletion/takedown and clear ownership of submitted data. An audio-to-Deepgram path needs separate provider consent. GitHub Pages cannot run protected server functions; the optional Next.js server edition is prepared but not deployed.

No Base44 modifications, cross-origin uploads, direct database connections, public posting or secret handling are authorized by this pilot.

## Review, evidence, next owner

- **Observed:** current GitHub source and Base44 source, plus build/hosting constraints documented in repo.
- **Implemented:** only hash navigation, true format-count feedback, unit/source tests and CI wiring.
- **Not checked yet:** real hydrated app on this PR, screen reader and full responsive matrix, actual microphone/Deepgram audio, Base44 runtime permissions, published-story moderation.
- **Review owners:** quality-guardian for tests and privacy; product-designer for the mobile/desktop visual fit; system-architect for phase 2/3. Owner approval remains required before merge/deploy. Revert the pilot commit to restore prior navigation without deleting browser-local drafts.
