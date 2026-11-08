# NW-30 / DESIGN-22 — Creator Studio narration

The selected English Flux voice now generates authored story text with explicit consent and the creator's session-only key. The browser POSTs directly to Deepgram /v2/speak. Text is split into at most 1,800 UTF-16 units per request without dropping characters; speechless sections are skipped. Raw mono 24kHz linear16 sections are assembled into one PCM WAV for native playback and download. No automatic generation, replay charges, retries, public publishing, key persistence, or bundled credentials.

Limits and lifecycle: 5,000 story characters, 30MB total bounded response reader, three-minute timeout, explicit cancellation, no redirect or credentials cookies. Partial failures yield no misleading complete recording. Requests already sent may count toward quota. Voice/text edits remount the panel, abort pending work and clear consent/key/output. URL cleanup captures the concrete audio element, pauses it and revokes the object URL. Playback claims the shared narration owner.

Sources checked 8 November 2026: https://developers.deepgram.com/docs/flux-tts/batch and https://developers.deepgram.com/reference/speak/v-2/audio/generate. Actual OPTIONS preflight from the GitHub Pages origin returned200, allowed POST and Authorization/Content-Type. Actual browser request with a deliberate invalid test key reached Deepgram and rendered the expected authentication error (not CORS failure). No real credential was inspected.

Checks:108 offline tests passed after latest source integration, including seven audio tests for exact chunking, WAV header/data, selected voice/auth routing, cancellation/errors, empty/unexpected responses, whitespace-only chunks and bounded streaming. Pages build and route check recorded in PR. Browser verified consent gating, error handling and reachable controls. Tall media sidebar made nonsticky so controls remain reachable. Independent Quality Guardian findings led to the bounded reader, whitespace fix, captured playback cleanup and privacy-copy updates.

Not verified: real-key synthesis, audible quality, success-state native playback/download and playback-stop behavior with actual generated audio. User explicitly chose to skip the live test. Do not equate mocked audio tests with a successful paid provider request.

Source sync: terminal Git authentication unavailable. Imported every43changed file between abc1b0f and c025056 through the GitHub connector, verifying each Git blob hash, onto local snapshot branch sync/github-main-c025056. Original narration work preserved at3536ad4; integrated feature branch is feature/creator-audio-latest-20261108. This source snapshot does not import the remote106commit history. Remote PR must use c025056 as its actual parent. Untracked export/cache directories remain untouched.

Owner approval is required before merge/deployment. Roll back by reverting the feature PR. Real-key acceptance remains an explicit follow-up.
