# Next.js server deployment — NW-09

The server edition is prepared, not deployed. GitHub Pages continues serving the
static edition with typing, local recording and visual previews. It cannot run
POST APIs. [Next.js export limitation](https://nextjs.org/docs/app/guides/backend-for-frontend).

Use a Node 22 host for the full app, or the included multi-stage Dockerfile:

```sh
npm ci
npm run build
node .next/standalone/server.js
```

Set server runtime variables using the host's private secret settings:

- `DEEPGRAM_API_KEY`: transcription-enabled Deepgram key; never NEXT_PUBLIC.
- `TRANSCRIPTION_ACCESS_CODE`: a random private pilot code of at least 24 characters.
- `APP_ORIGIN`: exact public HTTPS origin with no trailing slash.
- `PORT`: host's listening port, if different from 3000.

The built standalone package also needs `.next/static` and `public` alongside it;
the Dockerfile copies these. For a non-container local check use `npm run start`
after the server build, with `APP_ORIGIN=http://localhost:3000`. Do not set
`GITHUB_PAGES=true` for a server build. Start with no Deepgram key to verify the
unavailable state without a provider call.

The container runs as an unprivileged user and accepts secrets at runtime. `.env`
files, Git data, local output and node_modules are excluded from its build context.

## Private pilot boundary

The API requires matching Origin, an access code and explicit audio-consent
headers. It rejects non-audio containers, bounds audio to 8 MB, provider responses
to 1 MB and transcript text to 5,000 characters. One process permits five requests
per minute and two concurrent requests. Aborts/timeouts release active slots.
These are pilot safeguards, not distributed authentication or quota controls.
Before broader public access, add host-level request/body limits, a shared quota
store, individual authentication and a provider spending cap. Share access codes
privately; rotate the code to revoke pilot access.

Only the selected audio bytes go to the fixed Deepgram Nova-3 English endpoint;
no URL proxying, stored transcript, draft or image upload. Recognition mistakes
remain possible; the creator reviews and inserts text. Explicit permission and
transcription consent precede transmission. The request sets `mip_opt_out=true`;
provider data handling still follows the project's Deepgram terms/settings.
[Deepgram prerecorded API](https://developers.deepgram.com/reference/speech-to-text/listen-pre-recorded).

## Release checklist

1. Owner approves code and host deployment.
2. Configure the runtime secrets and exact HTTPS origin on that host.
3. Deploy the server app, then verify unavailable and authorized states, denied
   passcode/origin, a short consented recording, transcript correction, insertion,
   cancellation and mobile image/audio preview.
4. Only then link visitors to the server edition. Moving visitors from Pages does
   not migrate their browser-local drafts; remind them to keep copies first.

No external host, public URL or secret has been created by this implementation.
Docker image construction and real provider transcription require separate
runtime verification; offline contracts do not establish acoustic accuracy.
