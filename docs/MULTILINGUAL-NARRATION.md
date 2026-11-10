# Creator-owned multilingual narration (NW-33)

Creator Studio adds an ElevenLabs provider alongside Deepgram and the private Addis pilot. Sixteen documented Eleven v4 languages are listed, including Afrikaans and isiZulu. Five premade voices are selectable. Eleven bundled, synthetic welcome samples can be played without credentials or provider requests.

On GitHub Pages, a creator enters their own restricted ElevenLabs Text to Speech key in the current panel. After confirming rights and consent, one direct HTTPS request sends up to 5,000 characters to `api.elevenlabs.io`. The key is only in an authentication header. No project key, owner clone, automatic translation, server relay, quota sponsorship or persistent credential storage is introduced. Generated MP3s remain local object URLs and can be downloaded separately from the written draft.

The panel clears its key, consent and recording when the story, narration language or voice changes or the panel unmounts. Cancellation interrupts the request but cannot guarantee that already-submitted text was not billed. Requests are not retried automatically. Responses must be MP3 audio and are limited to 12 MB while streaming; errors do not expose provider diagnostic bodies. Downloads and sample playback make no generation request. Existing shared narration ownership stops simultaneous players.

Samples contain fixed, public welcome text and premade voices. The preview label names the actual sample voice; it is not necessarily the selected generation voice. Language pronunciation needs native-speaker review. Unsupported languages are not added to the provider catalog. The seven Addis languages retain their separate provider boundary.

References checked on 10 November 2026:

- https://elevenlabs.io/docs/overview/capabilities/text-to-speech/eleven-v4
- https://elevenlabs.io/docs/api-reference/text-to-speech/convert
- https://elevenlabs.io/docs/help-center/product/voices/my-voices/what-are-default-voices

The listed legacy premade voice IDs were successfully used for samples. The provider documents their retirement on 31 December 2026; review successor availability before that date. Voice access, quotas and supported languages remain subject to the creator's ElevenLabs account and provider changes.

Provider preflight returned HTTP 200 with allowed origin, headers and POST support for `https://funky-amahle.github.io`. This verifies CORS policy only; it is not an end-to-end browser or live-deployment test. Browser launch is currently blocked in the authoring environment, so mobile, keyboard, playback and actual browser generation review remain outstanding. Merge and deployment require the owner's approval under AGENTS.md.

## NW-33 verification handoff — 10 November 2026

Branch: `feature/pages-multilingual-voices-20261110`. Changes cover the provider panel, bounded browser client, language/voice catalog, eleven public sample assets, offline tests, Pages CI and documentation. The draft PR identifies the final commit. Deployment SHA remains unverified.

Observed checks: 52 offline tests passed across ElevenLabs, existing Deepgram/Addis, voice selection, recording controls, narration ownership and Creator Studio wayfinding. A separate quality-guardian review independently reran the 26 provider tests and inspected privacy, sample attribution and cancellation. Its unmount cleanup recommendation was implemented to invalidate late request completions. Type checking and the GitHub Pages production build passed using a fresh source copy without environment files, avoiding intermittent dependency read timeouts in the original checkout. All eleven MP3s and the labelled preview fully decoded with FFmpeg.

Next owner: project owner/reviewer. Review the draft PR, then verify hydrated browser generation with a restricted creator-owned key, keyboard/mobile controls and native-speaker pronunciation before approving release. Offline checks and CORS preflight do not establish those outcomes. No merge or deployment has been performed.
