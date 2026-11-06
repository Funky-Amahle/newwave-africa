# Narration validation and reviewed smoke test

Task NW-07. This change prepares the eight-story workflow for review. It does not authorize merging, generation, deployment, or public audio publication.

## Real smoke-test evidence

- [Run 42265569420](https://github.com/Funky-Amahle/newwave-africa/actions/runs/42265569420) succeeded on 6 November 2026 at source `206747c822e12e1621986a0278425f4eea6a8c30`.
- Logged selections: `sample=s1`, `voice=flux-haley-en`. Exactly one clip was generated; the workflow uploaded a review artifact and did not deploy.
- Artifact `sample-story-narration-1`, ID `13527306095`; ZIP SHA-256 `4fa5daa658faad61c3569a555668498f58daa8daa5eae45d2a001c6dc6ac0acb` matched the downloaded bytes.
- The artifact contained exactly `manifest.json` and `s1.mp3`; manifest version, requested voice, provider, and `s1` mapping matched.
- Local decoding completed without errors: 8.376 seconds, mono, 24 kHz, 48 kbps; decoded peak -1.83 dBFS, RMS -18.02 dBFS, zero full-scale samples. Structural validator found 349 complete MPEG Layer III frames.
- The owner listened to the delivered s1 clip and approved Haley's pronunciation, pacing, and naturalness for the samples. This is voice-selection approval, not publication approval or independent evidence for the other seven clips.
- The owner previously confirmed replacement of the exposed Actions credential. No credential was retrieved, printed, copied into assets, or added to frontend code during this work.

## Proposed workflow checks

The existing manual workflow retains `s1` as its default. `all` selects all eight fixed fictional samples. The generator prevalidates the entire selected set before the first paid request, explicitly requests MP3, checks its response MIME type, and limits each response read to the configured cap plus one byte. Offline tests run before generation; manifest/file and MPEG-frame validation run before artifact upload. The job has repository contents read-only permission and no publishing step.

```sh
python3 -m unittest discover -s tests -p 'test_deepgram_*.py' -v
python3 scripts/validate_site_audio.py --sample all --voice flux-haley-en \
  --directory site-narration-output/narration
```

Twenty Python tests passed locally, covering invalid later stories before any request, duplicate IDs, content/response limits, fixed text mapping, missing/unexpected files, wrong voice/association, and malformed/truncated MPEG frames. The new validator also accepted the real approved s1 artifact. Source review found no blocking issue; the validator's path was added to the offline CI trigger.

## Remaining release gates

After explicit review and merge approval, dispatch the manual workflow with `all` and `flux-haley-en`. Review all eight actual MP3s against their corresponding source title/excerpt, checking names, pronunciation, omissions, pacing, clipping, and decoding. Structural checks cannot establish what was spoken or detect a swap between two otherwise valid MP3 payloads. Report per-clip results and preserve the artifact before its one-day expiry.

No all-eight provider run was performed by this change. Any later addition of reviewed MP3s to `public/narration/` requires a separate explicitly approved publication PR. Creator drafts and microphone recordings stay outside this fixed-sample pipeline.
