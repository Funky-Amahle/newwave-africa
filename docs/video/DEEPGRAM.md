# Deepgram narration workflow (review-only)

This integration follows the public [Deepgram text-to-speech skill](https://github.com/deepgram/skills/blob/main/skills/text-to-speech/SKILL.md). It uses **Flux TTS batch** via `POST https://api.deepgram.com/v2/speak` and an `Authorization: Token` header.

## Setup

1. **Revoke the API key previously exposed in chat**, then create a new restricted Deepgram key.
2. In the GitHub repository, open **Settings > Secrets and variables > Actions > New repository secret**. Name it `DEEPGRAM_API_KEY`. Paste the replacement key there, not in any tracked file or issue.
3. Once merged after approval, open **Actions > Generate Deepgram narration (manual, review only) > Run workflow**. Select `vision` or `technical` and a Flux voice.
4. Download the resulting `narration-...` artifact, which GitHub retains for **one day**. Each run generates **ordered, independent MP3 segments** plus a `segments.json` index. Import segments in numeric order into a video editor; run the workflow separately for both videos.
5. Import the numbered MP3 segments in order, review voice quality and timing, then replace the old voiceover in the video editor. The workflow **does not render, publish, or deploy MP4s**.

This workflow requires no npm dependencies and only reads repository narration text. It uses Python's standard library and does **not** require `ffmpeg` or system package installations. It is manual, with repository contents read-only. Text is sent to Deepgram as an external service; use only public demo narration, never private creator drafts.

Flux voices available in the workflow: `flux-haley-en`, `flux-alexis-en`, `flux-kit-en`. These voices do **not** guarantee South African English accents. Test before selecting one for the final submission.

Source narration: `docs/video/narration/vision.txt` and `docs/video/narration/technical.txt`. Review and edit these scripts before synthesis. Files contain demonstrative descriptions and do not assert real AI classification or public publishing.

## Security and verification

- No API key is committed, printed or written into audio artifacts.
- Actions secrets cannot be set through the current GitHub connector, so the repository owner must configure the secret manually.
- Workflow is available for manual dispatch from the default branch after merge; PR checks alone do not produce narration.
- Untrusted PR code must not be granted the Deepgram secret. Review any workflow/script changes before merging.
- Audio output and provider authorization remain untested until a manual workflow run completes successfully.
