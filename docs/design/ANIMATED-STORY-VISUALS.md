# DESIGN-12 — Animated story visuals

Extend the current editorial visual identity with crisp printed-wave SVG artwork.
The featured story and discovery cards share category palettes in paper, forest,
terracotta and sage. Shapes are abstract geometry, not cultural symbols or images
of the fictional stories. No external assets, dependencies or network requests.

## Motion direction

- Focal moment: paper planes, concentric printing lines and flowing ink resolve
  into a finished composition in at most 1.2 seconds. Choosing the next featured
  story replays its composition and updates its category palette.
- Continuity: preserve the existing manual spotlight and discovery behavior.
- Feedback: a small five-bar indicator animates only while recorded narration
  is speaking. It is a playback indicator, not a measured audio waveform.
- Budget: bounded SVG paths and CSS, no canvas, filters, timers or frame loop.
  Repeating motion requires intersection with the viewport and a visible tab.

Existing reduced-effects controls and system reduced motion suppress animation.
Final artwork remains visible in quiet mode; textual playback state remains
available. Decorative visuals are hidden from assistive technology and add no
focus stops. Observers and document listeners are cleaned up on unmount.

## Evidence

- Typecheck passed; 29 existing discovery/narration tests passed.
- GitHub Pages production export passed, with first-load route JS approximately
  160 kB compared with 159 kB before this change.
- Production export visually inspected at desktop and 390 px mobile widths;
  no horizontal overflow. Featured-story change updated content and artwork.
- Browser inspection confirmed offscreen artwork inactive and reduced-effects
  mode producing computed animation-name none for all artwork groups.
- Real recorded playback enabled the five-bar animation; pause cleared its
  playing state and removed the animation. Stop returned to Listen.
- Quality-guardian source review found no blocking lifecycle/accessibility issue.
- Impeccable detector reported one existing thick reader-text border in
  experience.module.css outside this change; no new detector finding.

System preference and tab visibility paths were source-reviewed; an OS preference
change and real low-end device performance were not independently exercised.
No creator storage, narration files, story copy or publication behavior changed.
Ready for PR review; merge and deployment require owner approval per AGENTS.md.
