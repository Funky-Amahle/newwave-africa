# Dual-provider narration pilot — Deepgram + Addis AI

## Scope and evidence (9 November 2026)

- **Deepgram remains the default.** The existing Flux 36-voice English selector, direct session-key generation, consent, local WAV download, and existing transcription pathways are retained without changes to their provider requests.
- **Addis AI is opt-in.** It is an additional narration provider for supported African languages. The private pilot uses Addis Voices 2 and its dynamic, availability-filtered voice catalog.
- **No automatic translation** is performed. The creator is responsible for supplying text in the selected language. Drafts remain browser-local.
- **GitHub Pages has no Addis backend.** Selecting Addis on the static site displays a transparent unavailable state. Deepgram continues to work under its existing session-key restrictions. The server target is a prepared route, not evidence of deployed infrastructure.

## Data flow and trust boundaries

1. User chooses **Addis AI** explicitly and enters an operator-provided access code for the private pilot. The Addis API key never appears in client code, any NEXT_PUBLIC variable, the repository, localStorage, or URLs.
2. On a separately hosted Next.js server with environment variables set, `GET /api/addis-voice` reports only availability. The app remains fail-closed while unconfigured.
3. POSTs require exact `APP_ORIGIN`, a constant-time compared 24+ character `ADDIS_PILOT_ACCESS_CODE`, JSON body under 8 KiB, and supported action/language. An operator first requests the current voice catalog.
4. For a consented 1–1,000-character text, the server verifies the selected voice against the current Addis catalog, then requests a cost estimate. The UI shows the estimated ETB cost and requires a separate explicit generation action.
5. On generation the server revalidates voice availability and funds, and sends the text to Addis AI's fixed `/api/v1/voice/generations` endpoint. It returns only a signed HTTPS clip URL and opaque clip ID. The browser can play or download, but the signed URL may expire.

The Addis API uses the fixed host `api.addisassistant.com`; requests do not allow caller-supplied provider URLs. Addis generation may be billed once started even if the user cancels or loses connectivity. There is no automatic retry. The private access code is an operator pilot gate, **not** per-user authentication or a production billing-control system. Process-local limits (6 requests/minute and 2 concurrent operations) do not work across instances; there are no shared quotas, durable receipt reconciliation, long-lived storage, or user-level spend caps. The generation idempotency key is per request only; production needs persistent operation identifiers and a clip-recovery workflow.

## Private server configuration (do NOT place secrets in repository)

- `ADDIS_API_KEY` — dedicated, restricted Addis AI API key; set on the private server only.
- `ADDIS_PILOT_ACCESS_CODE` — random access code with at least 24 characters; share only with authorized testers.
- `ADDIS_QUOTE_SECRET` — separate random signing secret with at least 32 characters for five-minute cost approvals; never send to a browser or store in GitHub Pages settings.
- `ADDIS_MAX_COST_ETB` — optional private per-generation estimate ceiling in Ethiopian birr; defaults to `2` and must be greater than zero and no more than `20`.
- `APP_ORIGIN` — exact allowed origin of the privately hosted web interface (example: `https://pilot.example.org`). The route deliberately does not enable cross-origin requests from Pages.

GitHub Pages cannot call this same-origin route. A separate Pages-to-backend deployment and cross-origin design require an independent plan, stronger authentication, rate limits, billing controls and explicit owner approval. Do not deploy a public, billable proxy from this private-pilot implementation.

## Testing and acceptance

Offline source-contract tests cover default Deepgram routing, availability, catalog filtering, unsupported languages, access/origin/consent, request-size limits, cost estimate, insufficient balance, provider errors, and generation request metadata. PR CI runs tests plus production static/server builds and browser QA. No real Addis key or paid API calls are included in CI.

Before enabling a private pilot, complete runtime account setup, live provider catalog/estimate tests, one consented fictional Swahili generation, audio playback/pronunciation review, mobile and assistive technology checks, and server billing-limit review. Existing Deepgram real-key audio quality also requires separate manual verification.

Provider docs: https://docs.addisassistant.com/docs/capabilities/text-to-speech ; https://docs.addisassistant.com/docs/integrate/web-applications

**Release gate:** Review PR and CI first; do not merge or deploy without explicit owner approval.


## Deployment-ready pilot handoff (9 November 2026)

1. Provision a private HTTPS **Node 22** server host running the existing Next.js standalone image. Do not set `GITHUB_PAGES=true` on this server. It must serve the app and `/api/addis-voice` from the **same origin**; hosting only the API behind GitHub Pages is not supported by the current client/CORS implementation.
2. Configure five server-only variables using the host's secrets manager: `ADDIS_API_KEY`, `ADDIS_PILOT_ACCESS_CODE`, `ADDIS_QUOTE_SECRET`, `APP_ORIGIN`, and optionally `ADDIS_MAX_COST_ETB`. Set `APP_ORIGIN` to the exact HTTPS origin shown in the address bar, with no path or trailing slash.
3. First start with **no** provider key: `GET /api/addis-voice` must answer `{\"available\":false}` without contacting Addis. With private settings enabled, verify unauthorized origins and codes are rejected, then request the Swahili catalog and a quote using fictional consented text. **Do not generate** until costs and financial limits are approved.
4. The quote is HMAC-signed and valid for five minutes. Generation rechecks the live price and declines price increases, unsigned approvals, mismatched text/voice, currency changes or costs above the operator's configured ETB ceiling. The same in-process quote cannot generate twice. A client may cancel, but an upstream operation already started may still be billed. Stable per-quote request IDs are passed to the provider for reconciliation; **provider idempotency is not established**.
5. Private pilot rate/concurrency ceilings, quote replay memory and cost checks are **process-local only**. They are not distributed billing limits or durable per-account quotas. For a public paid service, add a shared transaction store, genuine authenticated users, a durable daily/monthly budget, provider-side spend cap, reconciliation and a revocation runbook. Do not make the private pilot public based on these controls alone.
6. Compare one real sample with Deepgram for voice quality, native pronunciation, latency and accounting; record exactly which device, browser, provider voice and clip were verified. Keep the existing GitHub Pages site and Deepgram features unchanged unless the owner separately authorizes a routing or hosting migration.

### Test data (no secrets)

Pilot fictional Swahili text: `Habari. Hii ni hadithi ya kubuni kuhusu marafiki wanaoshirikiana kujenga maktaba.`

Use a restricted key and provider account with explicit financial limits. Never put a real key, access code or signing secret in an issue, workflow log, client code, public build variable, screenshot or chat.

### Boundaries not yet complete

The private Node deployment requires the operator's host and secrets. A successful static Pages build does **not** prove the private endpoint is hosted. CI tests use fake credentials and mock provider responses; this does not prove the Addis API responds with the documented JSON shape, sends paid audio, or sounds natural. A real-account no-cost voice/estimate check followed by a separately approved capped paid sample is the next release evidence gate.
