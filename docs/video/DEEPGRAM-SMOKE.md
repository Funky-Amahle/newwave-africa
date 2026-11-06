# One-story narration smoke test

Task NW-07; PR #16 is merged into main at `206747c822e12e1621986a0278425f4eea6a8c30`. This runbook and its offline tests do not approve merging, deployment, or audio publication.

## Verified preparation

- PR #16 commit `56f3ebc65512a6054599012c7a7e40eaabf01e71`: install, typecheck, five offline video tests, and static build passed in [CI run 42264078368](https://github.com/Funky-Amahle/newwave-africa/actions/runs/42264078368). Deployment was skipped.
- The owner confirmed on 6 November 2026 that the exposed key was rotated and the replacement saved as the repository Actions secret `DEEPGRAM_API_KEY`. The credential was not retrieved or independently inspected.
- The text-to-speech and speech-to-text development skills are already installed locally. No duplicate installation or optional MCP registration is needed for this test.

## Offline contract check

From this PR's branch (or main after this PR is approved and merged):

```sh
python3 -m unittest discover -s tests -p 'test_deepgram_*.py' -v
```

Provider calls in these tests are mocked. Dummy MP3 bytes test file association only; they do not demonstrate decoding, pronunciation, naturalness, or real provider access.

## Real one-story run

Use the existing registered `deepgram-site-audio.yml` workflow. Select branch `main`, `sample=s1`, and `voice=flux-haley-en`. Main includes the merged one-story support from PR #16. Confirm the sample selection before dispatching; `all` makes eight paid requests.

With an authenticated GitHub CLI, the equivalent is:

```sh
gh workflow run deepgram-site-audio.yml \
  --repo Funky-Amahle/newwave-africa \
  --ref main \
  -f sample=s1 -f voice=flux-haley-en
```

The selected workflow reads fixed fictional repository content, makes one paid synthesis request using the Actions secret, and uploads `s1.mp3` plus `manifest.json` as a review artifact retained for one day. It has repository contents read-only permission and contains no deployment or publication step. Never paste a key into a command, input, issue, or report.

## Review gate

Record the run URL, exact source SHA, selected voice, artifact name, and result. Download the artifact before expiry. Require `manifest.version=1`, the requested voice, and `clips={"s1":"s1.mp3"}`. Decode/play the actual MP3 and review completeness, intelligibility, clipping, pacing, pronunciation, and naturalness against the source title and excerpt. These checks remain pending until actual audio is available.

The configured Flux voices are listed in [Deepgram's current catalog](https://developers.deepgram.com/docs/flux-tts/voices). Their availability does not establish a South African accent or guarantee suitability for the story.

After the one-story audio is reviewed and accepted, prepare the eight-story run and browser playback changes in separate PRs. Test the manifest filename regex, share a single manifest request across cards, coordinate playback ownership, and exercise Listen/Pause/Resume/Stop, rejected playback, missing/corrupt assets, fallback, and keyboard controls. Creator drafts and microphone recordings remain outside this generation pipeline.

Only an explicitly approved later publication PR may add reviewed assets to `public/narration/`. Keep current GitHub Pages settings. No audio has been generated or published by these offline tests.
