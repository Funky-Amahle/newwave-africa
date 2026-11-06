# DESIGN-11 - Approved classic NW identity

Status: implementation proposed for review. Related work: NW-06 / DESIGN-04.

## Approved direction
The user selected the simple NW serif monogram, classic NewWave wordmark,
spaced AFRICA lettering, forest green and ivory identity study, then asked
to apply it to the website header, footer and browser icon.

## Implementation
- `components/brand.tsx` keeps the existing shared Brand interface and home
  anchor. Header and footer pick up the new artwork without changing story,
  recording or narration components.
- `lib/brand-artwork.json` contains SVG outlines derived from the approved
  image. The monogram curves are redrawn for clear small-size rendering.
  No font binary, external font request or unlicensed stock asset is bundled.
- `components/brand.module.css` isolates layout from legacy brand selectors.
  Desktop uses monogram, divider and wordmark. At 420px and below the header
  uses the complete wordmark alone to preserve readable sizing and CTA room.
  The footer retains the full lockup, reversed to ivory on its dark surface.
- `app/icon.svg` provides a self-contained forest-green favicon with ivory
  NW outlines, optically strengthened for small tab sizes. The existing
  Next.js metadata file convention supplies its link; static export and
  repository base path settings are unchanged.
- `tests/brand.test.mjs` checks stateless JSX contracts, accessible labeling,
  outlined artwork, inverse mode, path data and favicon consistency. The
  existing Pages workflow runs these checks before its static build.

## Tokens
Ink: #151916. Forest accent/icon background: #173e2b. Inverse: #f6f2e9.
The existing editorial theme, hero, navigation destinations and footer copy
are retained. The logo is not animated and introduces no motion.

## Validation performed locally
- Seven offline brand contract tests passed.
- TSX syntax/transpilation passed; this is not a full application typecheck.
- A focused Chromium header/footer fixture checked 320, 375, 768, 1024 and
  1440 CSS-pixel widths: no horizontal overflow, home-link height at least
  44px, visible keyboard focus and correct inverse footer color.
- Desktop and mobile fixture screenshots were visually inspected. These
  are component previews, not screenshots of the deployed application.

## Remaining release checks
Full application typecheck/static export is delegated to PR CI because the
local environment could not resolve github.com to clone dependencies.
After approval and deployment, confirm the live header/footer, favicon
URL beneath /newwave-africa/, real browser-tab rendering and screen-reader
navigation. No merge or deployment is authorized by this implementation.
