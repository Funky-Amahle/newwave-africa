# NW-31 — Single-owner voice cloning pilot (review only)

**Status:** Proposal / draft PR. **Do not merge or deploy without owner approval.**

## Objective and limits

Test whether a NewWave creator can privately narrate a fictional story in a voice they enrolled and verified themselves, without changing the working Deepgram/Flux or Addis AI flows.

**One participant:** the owner, using their own voice only. No third-party speaker, celebrities, uploaded interviews or community enrolment. No public publishing, hosted API, new user database, API key stored in the repository or existing draft migration. The pilot does **not** clone a voice automatically, manage authentication or delete a provider voice. Voice cloning/verification happens in the speaker's own ElevenLabs account.

## Existing architecture and scope

- Creator Studio retains Deepgram/Flux as default and optional Addis AI private pilot.
- Browser recording and opt-in transcription remain separate from cloning.
- Existing Deepgram browser-key synthesis remains unchanged.
- Server-only transcription and Addis endpoints are not available on static GitHub Pages.
- This pilot adds a local, manually executed CLI and offline tests. No additional runtime dependency, new UI panel or live API integration is included.

## Steps

1. In your **own** ElevenLabs account, review plan eligibility, pricing, voice-cloning/usage terms, record a clean sample and complete provider-supported ownership verification. Do not upload a recording to the repository or chat.
2. Confirm the cloned voice is visible in your provider account, and locate its voice ID privately.
3. On your own computer with Node 22+, create a private output folder outside the repo. Set a scoped provider key as environment variable ELEVENLABS_API_KEY; do not paste it into chat, GitHub, command history or screenshots.
4. Run: node scripts/pilot_voice_clone.mjs — this only prints guidance and never sends a request.
5. Run tests offline: node --test tests/voice-clone-pilot.test.mjs
6. Only after specifically approving the single paid generation and verifying the voice is your own, run:
   node scripts/pilot_voice_clone.mjs --voice-id YOUR_VERIFIED_VOICE_ID --output /private/folder/newwave-pilot.mp3 --confirm-own-voice --execute
7. Listen locally and optionally import the resulting MP3 through Creator Studio's existing audio upload for private preview. An upload does not train or install a clone.
8. Delete the local MP3 and revoke/delete the voice in your own provider account when desired. Provider retention remains subject to provider terms.

No provider request has been authorised or executed automatically by this PR. The CLI uses a fixed fictional English story, one TTS request, model eleven_multilingual_v2, a bounded 12 MB response, 60-second timeout, existing-directory check, exclusive file creation and no retries. It blocks network execution without both the own-voice confirmation and explicit --execute flag. The provider may charge even if a connection or response fails. Self-attestation in the CLI is not identity verification: the provider must verify ownership first.

## Validation / acceptance

- Mock tests exercise voice-ID rejection, two approval gates, exactly one fixed request, MP3 save, no overwrite, provider error/no retries and output bounds.
- Run tests in CI or locally with Node 22 before reporting PASS; committed tests are not execution evidence.
- Real-world success requires a separately approved paid synthesis, the owner's listening judgement, mobile/browser playback and no sensitive data in code or logs.
- Score from 1 to 5: speaker similarity, natural pacing, pronunciation, emotional tone and intelligibility. Record device/browser/language and retries without sharing raw personal samples.
- Accept if all five ratings are at least 4/5, the speaker agrees and no privacy or workflow regression is found.

## Rollback and next gate

Close this PR or revert the added files; the current app, deployed site, APIs and draft storage are unaffected. If the pilot succeeds, propose a separate consent-based secure integration: authenticated creator identities, ownership checks, server-side provider keys, durable spending limits, private audio, deletion/revocation, and accessibility review. No multi-creator pilot before those controls.

Provider API capabilities, model access and plan pricing can change; check the authenticated provider account before paid use. No provider key, recording, live generation, Base44 change, merge or deployment was performed here.
