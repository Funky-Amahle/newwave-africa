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
  Recording, typing, visual selection and downloads work without an API. Deepgram
  transcription explicitly remains unavailable here; no browser key is used.
- Next.js server: normal `next build` produces a standalone package, including
  `pages/api/transcribe.ts`. Runtime secrets enable the private transcription
  pilot. The included Dockerfile packages this target; no host is provisioned.

## Consented transcription path — NW-09

Selected audio -> explicit permission/Deepgram consent and pilot access code ->
same-origin POST -> bounded audio and authentication checks -> fixed Deepgram
Nova-3 English API -> bounded transcript -> editable review -> explicit append to
selected question. Existing writing remains. Cancel/error never overwrites it.
No caller-supplied URLs, stored transcripts, draft or visual uploads to the server.

The API enforces a constant-time access-code comparison, an exact configured
Origin, an 8 MB audio cap, a 1 MB response cap, a 5,000-character transcript cap,
a timeout and per-process request/concurrency limits. These are private-pilot
controls, not a distributed public authentication/quota service.

## Media and motion

Original SVG background assets or local image blobs accompany the selected audio
in a preview. They download separately; there is no browser video renderer or
combined-video claim. Blob URLs and microphone tracks are cleaned up on replacement
or unmount; recordings stop at three minutes. The landing wave uses existing quiet,
reduced-motion, intersection and page-visibility controls.

## Release boundary and future work

Prepared code is not a live server deployment. See `server-deploy/README.md` for
runtime settings and verification. Owner approval is required before merge or
hosting changes. A public service additionally needs individual authentication,
shared quotas and host/provider spending limits. Moderation, consented persistent
publishing, shared media storage and migration of browser-local drafts remain
future work.
