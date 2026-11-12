# DESIGN-01 — Responsive review, 12 November 2026

Target: production commit e001d0a46e1750a4f397a12bacfd8c42258263b8,
https://funky-amahle.github.io/newwave-africa/.

Review Home, Discover, Creator Studio and Our Approach at these CSS viewport
sizes: 1920×1080 desktop, 1440×900 desktop, 1366×768 laptop, 1024×768 iPad
landscape, 1180×820 iPad Air landscape, 768×1024 tablet portrait, 390×844 mobile
and 320×568 small mobile. These are browser simulations, not physical-device tests.

The deployed revision passed existing browser checks at widths 1440, 768, 390
and 320, including overflow, headings, language contrast, keyboard story controls,
reader/bookmark handoffs and recording-control alignment. Production CI artifact
13940612289 supplies screenshots. Initial visual inspection of homepage and
Creator Studio confirms stacked mobile layouts and separate recording action
space. Narrow navigation wraps into two rows at 320px without clipping.

The browser connection remains unavailable after the requested retry. New CI
coverage adds exact laptop/landscape dimensions and loads below-fold lazy artwork
before taking screenshots. Final browser review passed in GitHub Actions run 43211266310 for QA commit
6416d04bda495c0ae01a0c6896e6cdee806d8176. Production application files match
the target commit; only QA and this review record differ. Screenshot artifact
13942455219 contains 32 page captures and a results.json for all eight sizes.

| Device simulation | CSS viewport | Four-route browser checks |
| --- | --- | --- |
| Wide desktop | 1920×1080 | Passed |
| Desktop | 1440×900 | Passed |
| Laptop | 1366×768 | Passed |
| iPad landscape | 1024×768 | Passed |
| iPad Air landscape | 1180×820 | Passed |
| Tablet portrait | 768×1024 | Passed |
| Mobile | 390×844 | Passed |
| Small mobile | 320×568 | Passed |

Visual inspection covered the production mobile screenshots and new desktop,
laptop and iPad landscape screenshots, including the complete Creator Studio
at 1024px. No blocking clipping or overlap was found in those captures. Browser
checks confirm one main heading, no horizontal page overflow, language contrast,
keyboard theme activation, reader/save handoff, Escape/focus return, legacy links
and no page errors at each size. Existing separate browser checks also pass the
recording alignment and motion pause/live reduced-motion scenarios.

Non-blocking observations:
- At 320px, primary navigation wraps onto a second row; it remains readable.
- Creator Studio remains long because planning questions are expanded. At tablet
  landscape sizes, the shorter companion column leaves space beside later form
  sections. Collapsible planning or a wider stacked tablet layout could reduce
  scrolling in a future design pass.
- Full-page captures originally omitted unloaded below-fold cover images. The
  QA script now loads lazy artwork before capturing; this was a capture limitation,
  not evidence that those images were missing in the application.

Limits: Chromium viewport simulations, not real iPad/iPhone hardware. Safari,
virtual keyboard, touch gestures and microphone/provider calls were not tested.
The site was not changed or redeployed by this review.

No production app code is changed by this review. The QA script and this evidence
record are proposed separately for maintainer review.
