# DESIGN-12 / NW-06 - Dynamic editorial experience

## Intent and scope
Requested: make NewWave Africa more dynamic, add reusable CSS frames/components and visual animation while retaining the approved classic NW identity.

Chosen direction: an editorial reading table with restrained, finite movement, rather than an autoplay carousel or continuous decorative effects. Uses the existing React/Next.js, Tailwind baseline and Motion dependency. No new packages, stock imagery, external fonts, backend or credentials are required.

## Components and behaviour
- `Experience`: shared component tokens, utility strip and optional reduced-effects control. System reduced-motion preference takes precedence.
- `Hero` / `Spotlight`: concise introduction, actual fictional-sample preview, manually advanced perspective and read action. No autoplay.
- `DiscoveryRoutes`: four interest starting points, wired to discovery ranking and focus/scroll navigation.
- `SectionHeading` / `Reveal`: reusable editorial hierarchy and finite entry effects; content remains present in server markup.
- `StoryReader`: native modal dialog for reading; Escape/backdrop/close controls, focus restoration and scroll cleanup. No audio generation.
- Reading-list controls: bookmark IDs in browser localStorage only, toggle view, empty state and storage-error feedback. No accounts/servers.
- `StudioInvitation`: practical call to action for existing creator tools.
- `ExperienceHelp`: native details/summary explanations of ranking, privacy and recorded-only narration.

## CSS standards
`components/experience.module.css` owns the new styles. Fluid container widths, minmax grids, scoped design tokens, explicit breakpoints (1050/760/540), visible focus, touch-sized primary controls and reduced-motion rules. Existing global CSS and the approved SVG logo remain intact. Card wrappers adjust only the old card frame, not narration functionality.

## Functional correctness
`lib/discovery.ts` validates restored drafts/bookmarks and computes ranking without network calls. Interests reorder results; they are not mislabelled as hard category filters. The dashboard compares the same search/reading-list population and top-eight window for both algorithms; expanding the visual feed cannot change that window.

Creator drafts stay under the original localStorage key. Invalid data is ignored rather than executed or crashing the page. Microphone recordings stay local. Existing recorded-audio-only `StoryCard`, player controller, Deepgram jobs, and published assets are not modified.

## Verification recorded during implementation
- 13 offline tests in `tests/discovery.test.mjs` passed locally: data validation/bounds, bookmarks, search, interest ordering, saved filtering, scarcity weighting, comparable windows, deterministic ranking, source contracts and CSS class references.
- Strict TypeScript check of `lib/discovery.ts`: passed.
- Syntax/transpilation of the changed/new TSX files: passed (not full React type checking).
- Chromium static component fixture at 320/375/768/1024/1440 CSS px: no horizontal page overflow. Native details interaction passed. Desktop/mobile previews inspected.
- Fixture uses actual new TSX markup and CSS; external Motion rendering and unchanged cards/logo are placeholders. It is NOT a hydrated Next.js integration test. It does not establish live keyboard-dialog focus, bookmark persistence in React, real media, or screen-reader behaviour.
- Local clone/install unavailable: execution environment could not resolve github.com. Full TypeScript/static build and previous regressions must pass in GitHub Actions.

## Before release
Run full PR CI; verify the hydrated application at narrow widths and 200% zoom, keyboard focus into/out of reader and workspace, persisted bookmarks and blocked storage, system and optional reduced effects, manual spotlight, legacy creator tools, and recorded-audio-only playback. Review final rendered header/footer using the unchanged SVG assets. Check audio only when real files exist.

## Sources consulted
- https://motion.dev/docs/react-accessibility
- https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
- https://nextjs.org/docs/app/guides/static-exports

## Approval and rollback
No merge, deployment, provider call or content publication is authorised by this implementation. Revert the feature commit to restore the previous layout; new bookmark IDs may remain safely in localStorage. No draft data is deleted.
