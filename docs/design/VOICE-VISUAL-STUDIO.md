# DESIGN-15 / NW-09 — Voice, visual and wave studio

Extend the current editorial identity rather than introducing a second brand.
The landing ribbon expresses individual voices meeting in a shared current. Its
forest/clay linework is original abstract geometry, without claims to represent
any particular African tradition or community. Looping motion stops when offscreen,
hidden or reduced effects are requested. Reading and form controls stay still.

The expanded description explains discovery and creator-owned production. Creator
Studio adds voice answers alongside existing fields, not replacement writing.
Every planning question and the story's title, author, country and body can be
selected as a transcript destination. The creator records or uploads audio,
explicitly consents to transcription, reviews/edits the result, then appends it.
Existing writing is retained, with field-length checks and a cancel path.

Three original SVG backgrounds ship under public/story-visuals. Uploaded JPG/PNG/
WebP images are capped at 5 MB and 20 MP, with an 8,000 px dimension cap. The preview
pairs actual selected audio with the chosen background. Object URLs are released
on replacement/unmount. Visuals/audio remain in tab memory, are downloaded
separately, and are not embedded in saved text drafts. No rendered-video claim.

Transcription requires the separately prepared Next.js server edition and a private
pilot access code. The Pages edition honestly reports its unavailable state while
retaining typing, recording and visual selection. See server-deploy/README.md for
trust boundaries, setup and uncompleted hosting/provider checks.

Original SVGs were authored for this project; no external image rights are implied.
Uploaded media requires the creator's own permission. No real creator media was used for validation or added to Git. There is no
automatic upload: only explicitly consented audio requests go to Deepgram.

## Verification

- 37 offline discovery, recorded-playback and protected-transcription tests passed.
- Typecheck and both Pages/static and standalone/server builds passed locally.
- The standalone process served its home page and unconfigured API: availability
  false and POST 503, without contacting Deepgram. CI repeats artifact startup.
- Browser tests used a local-only fixture response through the actual handler
  contract to verify consent gating, editable review and paragraph-preserving
  insertion. This was not real speech recognition or provider acoustic validation.
- Actual audio/image file selection, background switching, invalid-image rejection,
  paired audio preview, question switching and quiet animation were inspected.
- A clean portable dependency lock passed npm ci dry-run. Docker is installed but
  its daemon is unavailable; no container build/run or public hosting is claimed.
- Real microphone permission/capture, real Deepgram calls, broad language coverage
  and a full device/screen-reader matrix remain unverified. English only is offered.

Final responsive review verified 320 px and 390 px layouts without horizontal
overflow, including the selected-audio player and paired-media stage. Opening
and closing canvas voice controls mounts/unmounts them; microphone cleanup is
source-reviewed, not a real-device permission/capture test.
