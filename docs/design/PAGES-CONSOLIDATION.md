# NW-12 / DESIGN-18 — Primary GitHub Pages app

Date: 7 November 2026. Branch: feature/pages-creator-and-approach-20261107. Baseline: main53ee955 (PR31 merged). Stage: implemented; review/release approval pending.

## Scope and design

The owner requested Creator Studio and Our Approach in the combined app, then chose to move everything to GitHub Pages. The dedicated pages share the existing Base44-inspired cream/forest/clay identity, NW logo and self-hosted Fraunces display type. The Next.js app is the source of truth. No Base44 connection or credits are needed to run or maintain this app.

The small alternative of adding two more homepage tabs would leave the page URLs missing. The chosen design exports real routes with their own titles and headings, shared navigation/footer and page-content skip link. Discovery and its illustrative insights remain on the homepage. Old creator hashes redirect to the real page, retaining tool sub-fragments.

Creator Studio reuses the existing component and five canvases. The shared root SiteStateProvider keeps title, body, author, country, permission state and selected audio in memory across Next client-side links. These are not autosaved; refresh loses unsaved work. Canvas notes and visual selections still belong to the page component and should be downloaded before leaving. Recording and transcription panels unmount on leaving. Existing localStorage keys, draft validation, rights confirmation and no-publication boundary remain.

Our Approach covers Discovery & Audience, Creation & Craft, the seven creator audiences, four authorship/production/transparency principles, and explicit storage/media/hosting boundaries. It labels eight fictional stories and demo keyword/ranking behavior. It does not claim verified reporting, fairness, audience impact or that static Pages can run transcription.

## Acceptance and evidence

- Pass: static export includes home, creator-studio/index.html and our-approach/index.html with pre-rendered content, correct base-path links and available static assets. `scripts/check_pages_routes.mjs` checks the actual export and is added to CI.
- Pass:50 existing JavaScript tests updated for Next Link brand routing/shared navigation; TypeScript, Pages/server production builds and standalone route startup checks. Final CI evidence belongs in the PR.
- Native Chrome/macOS local production export: Creator Studio direct entry/refresh, dedicated heading/tool controls, navigation to Our Approach, its rendered layout/content, navigation back to Studio and the draft sub-fragment link observed. Entering an unsaved title updated the visible preview. End-to-end return-to-draft retention was interrupted by native app state changes and a control timeout, so persistence is source-reviewed rather than claimed as a complete browser pass.
- Isolated in-app browser follow-up: written title survived client navigation Studio → Our Approach → Studio. Both pages were checked at320,375,768,1024 and1440 CSSpx; document scroll width matched viewport width at all sizes, and studio controls had no horizontal overflow. Screenshots at375/1440 showed the intended stacked/column layouts. Keyboard Enter on Skip to page content focused page-content. Approach refresh retained its complete rendered document. Direct root #studio-draft redirected to /creator-studio/#studio-draft. Temporary viewport overrides were reset.
- Not checked: actual200% zoom, physical touch, full keyboard/screen-reader flows, real microphone/upload/provider processing. These remain explicit verification limits, not inferred passes. CI run42359137351 passed on implementation commit2046a9aabeffa1f607fa8b3ca70163cea5d0f9f5 before this evidence-only documentation update.
- Impeccable changed-UI mechanical detector returned no findings. Source review by quality-guardian found no code/privacy blocker. Legacy hash/current-nav mismatch was fixed by redirecting old creator hashes to the dedicated page.

## Hosting and release

No backend, private media or account data is migrated. There are no user accounts or public publishing in the Pages app. Existing Deepgram recordings are bundled, while live transcription remains unavailable on Pages. A server endpoint would be a separately hosted service requiring its own explicit configuration/consent. No merge or deploy has been performed on this branch. Owner approval required by AGENTS.md before release. Rollback is reverting the route/shell commit; no storage migration is involved.
