# Deepgram across NewWave Africa - recorded narration only

## Story listening
- Eight explicitly fictional demo stories share `lib/sample-stories.json`.
- Story cards use reviewed, pre-generated recordings referenced by `/narration/manifest.json`.
- Browser-generated speech and the installed-voice selector have been removed. Missing or failed recordings stay silent; the story text remains readable.
- The static GitHub Pages `/newwave-africa` base path remains supported. Only filenames matching their sample IDs are accepted by the manifest loader.
- Creator microphone recording and preview remain browser-local and unchanged.

## Architecture and privacy

```text
Repository fictional samples -> manual GitHub Actions using DEEPGRAM_API_KEY
  -> Deepgram batch TTS -> unpublished review artifact
  -> human review and explicit publication approval
  -> separate PR: public/narration/{manifest.json,s1.mp3,...s8.mp3}
  -> GitHub Pages static files -> browser audio element
Missing recording -> Narration unavailable, no synthetic fallback
Creator microphone -> local preview / download, never sent to Deepgram
```

The permanent provider credential stays in Actions secrets. It must not appear in frontend code, client environment variables, logs or artifacts. Only the fixed public fictional sample text is sent to Deepgram. Rotate any previously exposed credential.

## Generation and publication
1. Review code and use a restricted `DEEPGRAM_API_KEY` Actions secret.
2. Manually run **Generate site story narration (manual, review only)** on an approved branch. Choose `sample=s1` for a small test or `sample=all` for eight stories, plus the desired voice.
3. The workflow validates contracts and output files. Download and listen to the review artifact; retention is one day. Generation is not publication.
4. With separate approval, add reviewed MP3 files and `manifest.json` under `public/narration/` in a publication PR. Merge/deployment requires approval too.
5. Verify the deployed manifest and recordings on the live site. Test each control and failed-file behavior. No browser fallback is available.

Local creator drafts do not receive generated narration automatically. Until a protected, consent-based workflow exists, a draft without a recording remains text-only. Existing video narration workflows are separate and unchanged by the recorded-only playback policy.

## Not implemented by this change
On-demand creator narration, opt-in transcription, captions and expanded multilingual services need a protected backend or authorized offline pipeline, with input limits, explicit creator consent, retention rules and rights review. Do not expose an account key to make these work from the static site. Voice quality, accent and pronunciation require human review; a successful build is not proof of natural speech.

## Validation
See `docs/design/RECORDED-ONLY-NARRATION.md` and `tests/narration.test.mjs`. The tests cover manifest handling and simulated recorded-media behavior. Browser audio, mobile layout and screen-reader checks remain separate. No audio is published simply by merging the playback code.

Implementation reference: https://github.com/deepgram/skills/blob/main/skills/text-to-speech/SKILL.md
