# Architecture

## Application source

Next.js and React provide discovery, a native story reader, five creator planning
canvases and a browser-local writing form. Ranking and categorisation use explicit
local rules; there is no model-generated story writing or public publishing.
Stories and reading-list bookmarks use localStorage. Canvas notes, selected audio,
uploaded images and pilot access codes stay in tab memory; they are not included
in saved text drafts. Existing sample narration loads reviewed bundled MP3s.

## Two build targets

- GitHub Pages: `GITHUB_PAGES=true` creates static files at `/newwave-africa`.
  Recording, typing, visual selection and downloads work without an API or key.
  Optional direct Deepgram transcription uses an **operator-entered restricted
  session key** and explicit audio consent. The browser sends only selected
  audio to Deepgram over its fixed WebSocket endpoint. The operator reviews and
  explicitly inserts the transcript. No shared key is bundled, and the key is
  not persisted to browser storage. This is a demo using the operator's own
  quota, not a protected shared-key service or secret vault.
- Next.js server: normal `next build` produces a standalone package, including
  `pages/api/transcribe.ts`. Runtime secrets enable the private transcription
  pilot. The included Dockerfile packages this target; no host is provisioned.

## Consented transcription paths — NW-14 and NW-09

### Pages session-key demo — NW-14

Selected audio -> operator-entered restricted Deepgram session key and explicit
consent -> bounded direct WebSocket connection to Deepgram -> editable transcript
review -> explicit append to the selected answer. The client enforces an 8 MB
selected-audio cap, 75-second deadline, 1 MB response cap, and 5,000-character
transcript cap; these are not account-level spending or usage limits. The key is
held only in panel memory, and is still observable by scripts with page access.
An independent local-origin real-provider test used one fictional sample;
public-origin testing, device microphones, diverse formats and accents remain
unverified. See `docs/SESSION-TRANSCRIPTION-QA.md` and
`docs/PAGES-SPEECH-TO-TEXT-PLAN.md`.

### Prepared protected server pilot — NW-09

Selected audio -> explicit permission/Deepgram consent and pilot access code ->
same-origin POST -> bounded audio and authentication checks -> fixed Deepgram
Nova-3 English API -> bounded transcript -> editable review -> explicit append to
selected question. Existing writing remains. Cancel/error never overwrites it.
No caller-supplied URLs, stored transcripts, draft or visual uploads to the server.

The API enforces a constant-time access-code comparison, an exact configured
Origin, an 8 MB audio cap, a 1 MB response cap, a 5,000-character transcript cap,
a timeout and per-process request/concurrency limits. These are private-pilot
controls, not a distributed public authentication/quota service.

## Optional translation handoff — NW-19

The story-reader language picker creates an external Google Translate URL only
for the eight explicitly fictional bundled samples and only after the reader
clicks the link. The link carries the sample title and excerpt; it does not
translate inside the app. For browser-local drafts the app never includes
user-authored text in an external URL: users may copy it to the clipboard and
separately choose whether to paste it into the external translator. No automatic
network requests, translation key, widget, retained translations, draft mutation
or public publishing is introduced. Machine output is not culturally or
linguistically verified. The original text stays visible in the story reader.

Google's embedded Website Translator widget is unsupported as of October 2026;
true integrated cloud translation would require an approved secure backend,
provider billing and quotas, explicit consent, language quality review and a
separate threat model. This handoff does not claim full multilingual app UI or
automatic translation in a browser.

## Editorial long read — NW-21

The fictional `s3` sample retains its original title, excerpt and prerecorded
preview audio. A separate bundled English long read is selected only when
`story.sample === true` and `story.id === 's3'`; browser drafts never inherit
it, even with a colliding ID. The story reader presents the fictional full text,
reading time and original decorative category artwork, preserving creator credit,
category, reading-list state and original story IDs. Google Translate continues
to receive the **short excerpt only** when a user clicks its external link.
The published Deepgram sample recording remains an **excerpt narration**, not
audio of the full narrative. No new network request, secret, storage migration
or external media asset is introduced. Human cultural/context and live browser
review remain required before publishing.

## Reader clarity and explainability — NW-22

The `s3` original fictional long read now offers a **local, in-dialog**
standard/large font toggle. It does not persist the preference or change private
story data; other story views stay at their current size. Existing sample MP3s
still narrate **short preview excerpts only**, not long-form prose.

The disclosure on each discovery card is derived from `explainStoryPlacement`
using the same `DiscoveryOptions` and `counts` returned by `getDiscovery`.
The text describes the current search and reading-list selection, interest
preference, the 0–100% category-diversity weight and full browser collection
category counts. It states deterministic local scoring and alphabetical title
tie-breaks, not trained recommendations or observed audience behaviors.
Explanations are deliberately qualitative, not fabricated model attributions.
This introduces no analytics, stored preferences, backend or network calls.

## Voice Studio mode cards — NW-24

The existing MediaRecorder and local file-input behavior are presented as separate
Record and Upload modes. Selection uses the same bounded client Blob flow; the
VoiceToText parent owns one selected-audio preview, downloadable asset and
consent-clearing state. The recorder's original inline preview remains available
for standalone use, but its shared-preview mode avoids duplicate audio controls.

The animated bars are **decorative only** (not a microphone volume analyzer).
Record motion runs only during active capture; playback motion only while HTML
audio is playing; reduced-motion preferences disable both. Browser microphone
permissions, error states, the three-minute recording limit and 8 MB cap remain.
No provider credential, recording or transcript is persisted or sent automatically.

## Navigation and route ownership — NW-26

Primary navigation uses four stable Next.js App Router paths: `/`, `/discover/`, `/creator-studio/` and `/our-approach/`. A shared client component renders the original homepage discovery section and the new Discover page without duplicating ranking, reading lists or browser-local drafts. `/#discover` and `/#discovery-insights` remain valid homepage deep links. Next.js `Link` preserves the GitHub Pages `basePath`; `scripts/check_pages_routes.mjs` validates all four exported `index.html` documents and prefixed navigation. Active page state derives from the pathname. Browser Back/Forward and workspace hash restoration remain supported. No server dependency or new storage schema is introduced.

## Creator Studio quick navigation — NW-27

Creator Studio remains a single page with its existing five planning canvases, draft form, recording and optional media tools. A sticky in-flow navigation component offers six same-document anchors (plan, write, record, save, narration and visuals). The mobile selector navigates to the same IDs and focuses the selected destination for keyboard and assistive-technology orientation. The top link targets the page heading. Native fragments preserve browser history; reduced-motion CSS already changes browser smooth scrolling to instant. The introductory four-step overview is visually compacted on small screens without deleting any fields or changing storage. No new external data or network dependency is introduced. Real-device screen-reader, zoom and scrolling checks remain pending.

## Media and motion

Original SVG background assets or local image blobs accompany the selected audio
in a preview. They download separately; there is no browser video renderer or
combined-video claim. Blob URLs and microphone tracks are cleaned up on replacement
or unmount; recordings stop at three minutes. The landing wave uses existing quiet,
reduced-motion, intersection and page-visibility controls.

## Release boundary and future work

The Pages session-key demo does not deploy `/api/transcribe`. Prepared
server code is not a live server deployment. See `server-deploy/README.md` for
runtime settings and verification. Owner approval is required before merge or
hosting changes. A public service additionally needs individual authentication,
shared quotas and host/provider spending limits. Moderation, consented persistent
publishing, shared media storage and migration of browser-local drafts remain
future work.

## Creator narration generation (NW-30)

Creator Studio optionally sends written story text directly to Deepgram Flux batch TTS after separate explicit consent, using a creator-entered memory-only key. This is distinct from audio transcription and changes the previous audio-only data boundary. Bounded sequential PCM responses become a local WAV, with playback and download. No provider key is hosted by GitHub Pages. Changing story/voice or leaving clears the generation panel. A shared owner-funded service still requires a separate secure backend. See CREATOR-AUDIO-QA.md for limits, verification and untested live-provider behavior.


## Creator Verification Passport — NW-36 (review PR)

This is a static Pages-compatible, browser-only integrity workflow. After the user has confirmed rights and successfully saved a written draft, the UI reads that exact saved story back from the existing `STORY_KEY` localStorage collection. The browser computes SHA-256 using Web Crypto over a deterministic versioned UTF-8 JSON representation defined by `lib/creator-passport.ts`. Export downloads an unsigned JSON manifest; verification selects a local file and compares its claimed metadata and hash to the current saved written draft. No server request, wallet, blockchain transaction, trusted timestamp, certificate, key or new storage key is introduced. The manifest omits manuscript text, audio and images; it includes creator-entered attribution metadata and a user-device timestamp, both unverified. Existing draft save semantics, the 100-draft guard and rights confirmation are unchanged.

Any person holding the draft can produce the same hash. A digest proves only data equivalence; it cannot establish authorship, chain of custody, legal ownership or when the source actually existed. For richer provenance, future stages require informed creator-managed signing keys, independent verification, media fingerprinting/C2PA and optional privacy-reviewed timestamp anchoring. These are **not implemented**. See `docs/CREATOR-VERIFICATION-PASSPORT.md`.

