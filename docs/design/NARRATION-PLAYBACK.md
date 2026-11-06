# Story narration playback follow-up

Task NW-06. Existing visual design, GitHub Pages settings, and private creator workflows are preserved. This change adds no public audio assets.

## Behavior

- Cards share one manifest request for each base path per page load, including the missing-manifest case. Navigation between workspace sections reuses the result; reload to pick up newly published assets.
- Only exact `s1` through `s8` mappings to their own `.mp3` filenames are accepted. Browser drafts never fetch a generated clip.
- Starting one card stops the prior card. Stop and unmount pause the retained media element, reset it, cancel only the owned speech utterance, and release ownership. Generation counters ignore late playback promises and utterance callbacks.
- Loading has an explicit disabled primary control and an available Stop control. Rejected/corrupt recorded audio falls back to browser narration once and announces the change. Available recordings and browser voices remain clearly distinguished.
- Listen/Pause/Resume/Stop retain native buttons, accessible names, and keyboard activation.

## Evidence

Four Node tests passed for shared manifest requests, generated filenames, invalid/cross-story/external mappings, missing/invalid/network-error manifests, and playback ownership including stale releases. TypeScript and the GitHub Pages static production build passed locally.

In the in-app browser, a local static build using the approved s1 MP3 exercised recorded Listen/Pause/Resume/Stop. The media element reported `paused=false` during playback, `paused=true` on pause, and time zero after Stop. Starting another card reset s1 to paused/time zero. Browser-speech Pause/Resume/Stop and Enter-key activation also changed controls as expected. Switching to Creator Studio removed the story audio controls. Server logs showed one manifest request across cards before reload.

A deliberately corrupt local MP3 exercised rejection fallback: the card switched to browser narration and displayed “Recorded narration unavailable. Using your browser voice.” Local audio fixtures were used only for validation and are excluded from this PR. The real artifact was separately decoded, and the owner approved Haley's voice.

## Limits

These are one-engine local checks, not a full Chrome/Safari/Firefox, device, screen-reader, autoplay-policy, or slow-network matrix. The helper tests do not simulate every React lifecycle/media race. Browser-synthesis controls were observed; its device-dependent audible quality was not reviewed. No deployed playback or eight-clip playback is claimed; live assets remain unpublished.
