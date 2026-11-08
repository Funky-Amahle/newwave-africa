# Speech-to-text plan for GitHub Pages — NW-13

Decision date: 7 November 2026. Owner direction: keep GitHub Pages, then accept an explicit session-key demo. No backend deployment is requested. The shared-key service remains planned.

## What is available now

The Pages app supports typing, choosing a guided question, microphone recording where the browser permits it, uploading a supported audio file, audio playback, and separate recording/visual downloads. Five planning canvases and written browser-local drafts remain available. The eight bundled Haley recordings are fictional sample narration; playing them does not transcribe new audio.

The NW-14 branch adds an optional direct **session-key demo**. The operator enters their own restricted Deepgram key into the transcription panel, selects recorded/uploaded audio, confirms consent, transcribes, reviews/edits and explicitly appends the text. The panel never supplies a shared key, saves it to browser storage or includes it in site artifacts. Clear the key or leave the studio to discard it. Charges use the operator's Deepgram account. No key was read from repository secrets or Base44.

This uses Deepgram's direct browser WebSocket streaming endpoint with selected audio chunks and CloseStream finalisation; its prerecorded REST API requires a proxy in browsers. The optional server edition keeps its protected REST implementation. Recording alone and Haley narration playback do not transcribe new audio. Offline tests do not establish real key validity, quota or acoustic accuracy. See the PR for actual provider checks.

Use fictional or self-authored demonstration material while developing. A non-sensitive recording does not make the Deepgram API key public: the credential authorises paid API usage. An owner-managed shared key belongs in private backend configuration; the explicit demo instead uses an operator-entered key in panel memory and never ships that key to other visitors.

## The intended complete flow

1. Choose a canvas question or written story field.
2. Record or upload an answer and listen to it before sending.
3. Separately confirm recording rights and consent to Deepgram processing.
4. Send only the selected audio directly to Deepgram in the session-key demo, or to the protected backend in a future shared service; written drafts and visuals stay in the browser.
5. Show a pending state with cancellation and a recoverable error if needed.
6. Review and correct the returned transcript.
7. Explicitly append it to the selected answer, preserving existing writing and enforcing the field limit.

Transcription does not verify facts, authorship or permissions. The initial scope is English; other language support requires separate evaluation.

## Phase 1 — Pages-only session demo

- Use the direct session-key demo on the static app where WebSocket is supported. When unavailable, preserve recording/upload/typing and a truthful explanation. Do not supply a public shared key.
- Demonstrate recording, upload, playback, editable writing and downloads using fictional/self-authored content.
- Download production briefs and media before leaving the studio. Save written drafts only after authorship/permission confirmation.
- Keep all private credentials out of the repository, Pages artifacts, browser storage, public URLs and client build variables.
- No Base44 dependency, new hosting account, backend deployment or persistent cloud media store is introduced. Selected audio is transmitted to Deepgram only after explicit consent.

Acceptance: Pages remains usable without a supplied key. No connection occurs before selected audio, a session key and explicit consent. The fixed provider connection sends only selected audio in bounded chunks, with an 8 MB input cap, 75-second deadline, 1 MB response budget and 5,000-character transcript rejection. Cancellation and leaving the panel close the connection; review and insertion preserve typed text. These client limits are not account-level quota enforcement.

## Phase 2 — Connect Deepgram when a backend is approved

The existing `server/transcription.ts` and `pages/api/transcribe.ts` prepare a bounded private pilot for the optional Next.js server edition. They are not hosted by GitHub Pages, and that protected REST flow is not available in the static build. The explicit session-key demo is a separate direct WebSocket flow. A shared-key backend connection is still implementation work, not a configuration switch that is already complete. The session-key demo does not complete this phase.

Required work:

- Choose and approve an HTTPS backend host. Store `DEEPGRAM_API_KEY` and a private pilot access code in that host's secret settings. Do not move the whole public app off Pages merely to add transcription.
- Add an explicitly configured public endpoint URL to the Pages build. This URL contains no key, access code, query credentials or fragment. Unconfigured/invalid addresses fail closed with the current recording/typing fallback.
- Add exact-origin CORS and preflight support for `https://funky-amahle.github.io`. CORS cannot restrict a GitHub Pages origin to one repository path; authorisation and quotas are separate controls. Never use wildcard origins with this endpoint.
- Allow only the required methods and headers. Preserve explicit consent, private access checks, supported container validation, request/body limits, cancellation, deadlines, bounded provider responses and transcript length rejection.
- Set audio limits for the selected host's actual request limits. The existing Node pilot accepts up to 8 MB, but that must not be assumed for every serverless platform. For example, Vercel currently documents a 4.5 MB function payload limit; select a smaller application limit if that host is chosen. Hosting constraints must be rechecked when deployment is approved.
- Continue sending raw selected audio only to the fixed Deepgram Nova-3 endpoint. Do not proxy arbitrary URLs, persist recordings/transcripts, or upload draft text/images as part of transcription.
- Add a clear service-availability check, explicit consent before audio transmission, review/edit/append, cancellation and stale-result protection when audio/question/page changes.

The pilot's existing five-requests/minute and two-concurrent-request limits are per process. They are not distributed user quotas. Before wider public access, add durable per-user authentication/quotas, host request limits and a provider spending cap. Plan how to revoke access and respond to deletion requests before any persistence is introduced.

## Phase 3 — Verify and release

- Offline/API checks: rejected origins, failed preflights, missing/wrong access code, missing consent, invalid/oversized audio, host limits, timeout/cancellation, empty/oversized transcripts and provider failures; rejected input must never call the provider.
- Browser checks from the actual Pages origin: service unavailable/configured states, microphone denial, upload and preview, consent, transcript correction and insertion, preserving existing writing, cancellation and question/recording changes. Do not mark fixture results as real provider verification.
- Run one short, expressly consented fictional/self-authored recording through the approved service. Review pronunciation recognition and transcription accuracy separately from the existing Haley narration review.
- Check mobile, keyboard, screen-reader feedback, reduced effects and privacy copy. Record tests actually run and remaining limitations.
- Owner approves the final PR and deployments. Deploy the protected backend, verify it, then configure the Pages public endpoint URL and rebuild Pages. Rollback removes that public URL and restores the safe unavailable state; browser-local drafts remain untouched.

## Alternatives, deferred

Browser dictation may work without a project-owned backend, but browser support and audio processing vary; some implementations send audio to the browser vendor's service. It is not an automatic privacy-preserving fallback. The owner selected Deepgram, so browser dictation requires a separate choice and accurate consent/support copy. Fully local browser transcription would need its own model/download, performance, licensing, accessibility and device testing assessment.

## Evidence and next action

Current baseline: main `7ee24c8`, including the combined design, dedicated Creator Studio/Our Approach pages and merged NW-13 roadmap. Reviewed the current recording/transcript UI, protected Node handler, API adapter, server deployment notes and tests. The earlier plan was documentation-only. NW-14 adds the explicit session-key demo in application code, with no bundled key or backend deployment. Transport unit tests use fictional keys and mocked sockets; real provider verification must be logged separately.

Verified on 8 November 2026 in the local production Pages export using the in-app browser: the owner entered a restricted key directly in the password field. With explicit consent, the already-public fictional s1 MP3 was sent to the real Deepgram service and returned its expected title and sample description. No key value was read or logged by the agent. The written draft was empty before explicit insertion. After punctuation was edited in review, the Add action appended the words beneath an existing authored opening without replacing it. The review field cleared, and Clear session key left the key field empty. This confirms the selected sample flow, not all accents, languages, formats or microphone devices.

Next owner: review the feature PR, approve merge/deployment, then smoke-test the same flow from the actual public Pages origin. The shared-key backend remains planned. Physical microphone capture, mobile touch and full screen-reader testing are not established by the sample test.

Sources checked 7 November 2026: [Next.js static export](https://nextjs.org/docs/app/guides/static-exports), [Deepgram prerecorded transcription](https://developers.deepgram.com/reference/speech-to-text/listen-pre-recorded), [Vercel function limits](https://vercel.com/docs/functions/limitations), [browser SpeechRecognition support and processing](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition). See also [the existing private-pilot deployment guide](../server-deploy/README.md).


Additional implementation sources: [Deepgram SDK browser transport restrictions](https://github.com/deepgram/deepgram-js-sdk#browser-usage), [streaming API](https://developers.deepgram.com/reference/speech-to-text/listen-streaming), [CloseStream finalisation](https://developers.deepgram.com/docs/close-stream), and [browser audio streaming example](https://deepgram.com/learn/fetch-hosted-audio-streams-in-the-browser).
