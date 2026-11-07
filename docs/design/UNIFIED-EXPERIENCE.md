# NW-11 / DESIGN-17 — One complementary NewWave experience

Stage: implemented on feature/unified-base44-design-20261107; awaiting PR review and owner release approval. Date: 7 November 2026.

## Intent and source of truth

The owner asked to combine Base44's visual style with GitHub's functionality into one component-led app and bring the repository up to date. This extends the small NW-10 navigation/progress pilot already merged in PR #30. The branch starts at main e3094cdd81c780e00c37e930c2e9b9d8ede2116d, including merged PRs #27–30.

Option A: maintain two distinct interfaces with shared terminology. This was the earlier pilot, but leaves the requested complementary design split across two products. Option B: use the tested Next.js implementation as the single repository source and adapt the approved Base44 visual composition. Chosen: one app, reused by static Pages and the optional server edition, with existing privacy boundaries.

Read-only Base44 source inspection: app 6aeea98065a4710c0d073bad; HeroSection.jsx, SpotlightCard.jsx, WaveField.jsx, index.css, home route and creator-studio.jsx. These informed cream/forest/clay surfaces, editorial type, a split wave hero with a light reading card, and the work/media studio columns. The hosted Base44 app is separate and could not be updated because its monthly builder message allowance was reached. No claim of deployment or data synchronization is made.

## Implementation

- `components/creator-studio.tsx` composes the existing craft toolkit, local written draft, reviewed voice-answer flow and image/audio companion. `useCreatorDraft` runs in the parent so written title, story, attribution and selected audio retain their previous lifetime across workspace navigation. Capture/transcription components still unmount on leaving the studio.
- The five canvases, nonblank answer counts and editable brief export remain. Canvas notes are page-memory only and can be lost when leaving the studio: download to keep them, as disclosed. This change does not introduce autosave.
- Desktop: work column beside a media companion. At 1000px and below it becomes one column. Existing narrow form breakpoints remain. Tool links can open the correct studio section directly, and hash changes focus the actual destination.
- One scoped token set also supplies the inherited form/control variables. The approved NW logo artwork remains unchanged. Fraunces regular/italic are self-hosted (about 156 KB total) through next/font/local; no Google Fonts request is made by visitors. SIL Open Font License is included in public/fonts/OFL-Fraunces.txt. Font source: Google Fonts, ofl/fraunces; downloaded from fonts.gstatic.com, 7 November 2026. Authors: The Fraunces Project Authors.
- The forest wave field uses original abstract line geometry, the same visibility hook and quiet/system motion controls as the existing wave art. It carries no geographic or cultural-authenticity claim.
- Ranking/search, reading list, narration manifest/playback ownership, sample labels, local storage keys, authorship confirmation, server consent and access limits remain. Base44's public publishing and UploadPublicFile handlers are deliberately excluded from this repository composition.

## Verification record

Pass: 50 JavaScript tests, including studio anchor routing and CSS class coverage for the new component; TypeScript; Pages production build; server production build; 5 Python narration unit tests; MPEG/frame and story association validation for all 8 Haley samples; git diff --check. The mechanical Impeccable detector returned no findings for changed UI targets. Standalone startup smoke passed: home and visual delivery, with transcription safely unavailable without configuration.

Native Chrome, macOS: hydrated split landing and two-column studio were visually inspected; entering a canvas title updated progress from 0 to 1 of 8, and selecting Forest current updated selected state and the preview. This is local production-export evidence, not proof of live deployment. Earlier live-site check verified search, reader opening and sample narration start on main before this branch.

Contrast by token calculation: clay/paper 5.28:1, muted/surface 6.89:1, forest/paper 11.11:1, ink/surface 14.27:1 (rounded; see PR evidence if recalculated). These are representative token pairs, not a whole-page WCAG certification.

Not checked: exact 320/375/768/1024/1440 widths, 200% zoom, full keyboard/screen-reader flows, physical touch, microphone capture, provider transcription and media uploads in this branch. Native Chrome responsive inspection was interrupted by app-state changes and a control timeout; no responsive pass is claimed. Source breakpoints were reviewed. These checks remain part of the release design gate.

Quality-guardian independently reviewed the code and privacy boundary. Two findings (written draft lifetime and nested tool fragments) were fixed and re-reviewed; no unresolved code blocker was reported. Full design release gate remains incomplete until the listed browser checks are performed.

## Hosting and release

Pages still cannot run the protected transcription endpoint. The same components support the optional server edition; its deployment and real provider smoke test remain separate work. No secrets were read, no creator work was published and no storage schema changed. Owner approval is required for merge/deployment. Rollback is reverting this feature commit, leaving existing stored drafts and bookmarks intact.
