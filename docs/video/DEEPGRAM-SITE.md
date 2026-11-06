# Deepgram across NewWave Africa — staged integration

## Implemented in this PR

- A shared, explicit dataset of **eight fictional demo stories**.
- Optional **pre-generated Deepgram Flux narration** for story cards.
- Existing browser Web Speech narration remains available when no published MP3 exists (or loading fails).
- A **manual** GitHub Actions workflow generates MP3s and `manifest.json` into an artifact retained for one day. It **does not upload or deploy them to the public website**.
- Story cards load `/narration/manifest.json` at runtime only if it is present. Absence means ordinary browser voices are used. The static GitHub Pages base path is handled.

### Architecture and privacy

```
Repository fictional samples -> approved/manual GitHub Actions with DEEPGRAM_API_KEY
  -> Deepgram Flux batch TTS -> review-only narration artifact
  -> separate human rights and audio review
  -> (future approved PR) public/narration/{manifest.json,s1.mp3,...s8.mp3}
  -> GitHub Pages static files -> browser audio element
Fallback: browser speechSynthesis (no key)
Creator voice recorder: browser MediaRecorder -> local preview / download (never sent to Deepgram)
```

**Security boundary:** Deepgram credentials are stored in the GitHub Actions secret and never included in browser JavaScript, audio metadata, tracked files, or client environment variables. Only fixed fictional public samples are sent to Deepgram. No personal data or creator submissions are sent.

## Using the pipeline

1. Rotate any API key exposed in chat; replace the existing `DEEPGRAM_API_KEY` Actions secret with the new restricted key.
2. Following code review and explicitly approved merge, select **Actions > Generate site story narration (manual, review only)**, choose `main` and a voice, and run manually.
3. Inspect the generated artifact before publication. It contains eight MP3 files plus `manifest.json`; files expire after one day.
4. Publishing audio to the live site is a **separate approval and PR**: add reviewed `s1.mp3` through `s8.mp3` and `manifest.json` beneath `public/narration/`. The regular Pages build then packages these static files. Do not publish before confirming voice accuracy and audio/media rights.
5. Dynamic creator story drafts are not automatically uploaded to Deepgram and will continue using local browser voices.

## Planned: broader capabilities, not yet implemented

| Capability | Scope | Backend needed? |
| --- | --- | --- |
| Narrate approved published stories | Server-side job or protected API generates authorized audio | Yes |
| Transcribe opt-in voice recordings | Deepgram Nova or Flux STT with explicit per-recording consent | Yes |
| Captions and transcripts for approved videos | Authorized backend / offline processing pipeline | Yes |
| Multilingual audio | Evaluate language-specific available voices with cultural and pronunciation review | Yes |
| Creator voice cloning / identity replication | Not in scope; explicit identity and consent safeguards required | Yes |

A static site cannot safely call Deepgram directly using a permanent account key. A later feature needs a bounded, rate-limited and authenticated backend endpoint or approved queued job: creator consent -> signed request -> server validates media size/type, retention and permissions -> Deepgram -> approved artifact storage. Never put the key in NEXT_PUBLIC_ env or commit it.

## Acceptance and tests

- Check TypeScript build, fallback with no manifest, playback / pause / resume / stop with manifest, bad manifest and rejected audio URLs.
- Verify network requests never include API keys; server-side job sends only fictional samples.
- Test voice choice and correct pronunciation on browsers/devices (including mobile).
- API access, artifact output and audio quality are **unverified** until a manual workflow runs successfully.
- Review publication and deployment separately; **do not infer published audio from an Actions artifact**.

Official implementation reference: https://github.com/deepgram/skills/blob/main/skills/text-to-speech/SKILL.md
