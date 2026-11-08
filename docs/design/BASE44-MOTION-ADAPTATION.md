# NW-25 — Base44-inspired motion and experience adaptation

**Review date:** 8 November 2026 (Africa/Johannesburg).  
**Source reference:** https://new-wave-africa-0d073bad.base44.app/ and the authenticated Base44 editor for app `6aeea98065a4710c0d073bad`.  
**GitHub baseline:** `main` at `676eddd40746310ef7be442e49c9462965ca1a6f`.

## Evidence and limitations

Read-only Base44 editor conversation/preview confirms a visual wave-themed landing page, latest-contributions carousel with arrow and dot navigation, an optional auto-advance behavior, a contributor spotlight with arrows, separate Discover filters, and a dedicated creator journey. The existing repository's [CREATOR-EXPERIENCE-FUSION.md](CREATOR-EXPERIENCE-FUSION.md) documents the earlier source-grounded Base44/GitHub comparison.

**Limits:** Direct current Base44 sandbox file access is not enabled for the connected plan, and a full interactive animation/screen-reader/device test of the current public URL was not possible through the accessible tools. Animation timing, focus and real FPS are therefore **not verified**. No current Base44 files or publishing behavior have been changed. This is an adaptation of verified broad patterns, not a pixel-by-pixel clone.

## Chosen experience direction

- Preserve the Next.js public site's original cream/forest/clay editorial design, original SVG waves, fictional flagship story, deterministic ranking, privacy controls and reduced-effects preference.
- Adapt Base44's lively **carousel navigation language**, **not** its live publication/data model: the GitHub spotlight is always eight explicitly fictional samples.
- Preserve explicit reader agency: next/previous and direct dots; optional auto-rotation is **off by default**, never a prerequisite to reading.
- When enabled, rotation waits 8.5 seconds between changes, pauses while the feature is hovered or keyboard-focused, offscreen, or document-hidden; any direct selection disables rotation. System and manually selected reduced effects disable the feature and all transitions.
- The story preview uses a short entrance/exit effect (260 ms) only while full effects are enabled. No animation blocks content or hides focusable controls.
- Explicit selected state and accessible names on dots, sensible narrow-screen wrapping and at least 44 px interaction height. No new external images, libraries, data storage or API calls.

## Compared approaches

**A. Clone Base44's autoplay behavior.** Could increase activity, but conflicts with reading speed, accessible focus, manual reduced motion and a demo centered on story comprehension. Rejected.

**B. Adopt navigation, animation affordances and visual rhythm with consent-based rotation.** Maintains user control and preserves a readable featured story. **Selected.**

## Review checklist and status

| Check | Status | Evidence / next action |
| --- | --- | --- |
| Baseline source review | Observed | Linked repository files; Base44 editor conversation and existing fusion notes |
| Functional controls and pause guards | Automated source checks added | `tests/base44-motion-fusion.test.mjs` |
| Types, regression suite, Pages and server builds | Pending CI | Feature PR workflow |
| 320, 375, 768, 1024, 1440 CSS px | NOT TESTED | Record screenshots and horizontal overflow |
| Keyboard-only dots/arrows, focus and Escape for reader | NOT TESTED | Human QA with browser |
| Screen-reader dot/active state | NOT TESTED | Human assisted-tech QA |
| Motion preference and manual quiet toggle | Source-checked only | Actual browser/device QA |
| Public audio and microphone | NOT TESTED | Preserve earlier PR #44's separate hardware QA |

## Release boundary

No Base44 secrets or public stories are transferred to GitHub. No cross-origin synchronization, live publication, implicit personalization or new analytics are claimed. Manual reviewer and explicit owner approval remain required before merge/deployment.
