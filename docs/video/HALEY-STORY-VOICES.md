# NW-08 — Haley sample story recordings

The eight fictional sample stories now have bundled Deepgram Haley (`flux-haley-en`)
recordings in `public/narration/`, mapped by the existing version-one manifest.
Each recording reads the fixed sample title and excerpt, not a full-length article.
No private creator draft or microphone recording was sent for synthesis.

Generation: [review run 42307323946](https://github.com/Funky-Amahle/newwave-africa/actions/runs/42307323946),
source commit `fef5e9c052fb7318854f907f2b9f7f8768ed4b1b`, artifact `13545679783`.
The downloaded ZIP matched SHA-256
`ae853cfc30b0fd6291a0e14ed01c3a9301c92a51f214e76e5b46541f56b2f53d`.

## Validation actually performed

- Twenty offline Python narration tests and twelve recorded-playback tests passed.
- All eight manifest associations and MPEG frame structures passed validation.
- All eight complete files decoded without errors; durations range from 7.008 to
  9.168 seconds, with non-silent signal and no full-scale decoded samples.
- Typecheck and the GitHub Pages static build passed; the export contains the
  manifest and all eight MP3s.
- Local static preview loaded the recordings with the Pages base path. Actual
  recorded playback reached Pause, Resume and Listen states; switching stories
  released the previous player, and completion returned to Listen.
- Deployment CI validates the bundled directory against all eight expected IDs
  and the approved Haley voice.

Structural checks and playback state checks do not establish pronunciation,
naturalness or word-for-word audible content. The owner approved Haley from the
earlier s1 sample; these newly generated clips still need a listening review.

## Release status

Prepared on `feature/haley-story-voices-2026-11-07`, pending review and merge.
No live deployment or publication has occurred. After owner approval and merge,
the existing Pages workflow will deploy the recordings with the application.
Rollback requires a reviewed change that removes the bundled recordings and
updates the mandatory asset validator together, or restores the prior application
commit. With no manifest the app stays silent and keeps story text readable
without synthesizing a fallback.
