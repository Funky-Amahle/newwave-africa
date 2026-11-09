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
- `APP_ORIGIN` — exact allowed origin of the privately hosted web interface (example: `https://pilot.example.org`). The route deliberately does not enable cross-origin requests from Pages.

GitHub Pages cannot call this same-origin route. A separate Pages-to-backend deployment and cross-origin design require an independent plan, stronger authentication, rate limits, billing controls and explicit owner approval. Do not deploy a public, billable proxy from this private-pilot implementation.

## Testing and acceptance

Offline source-contract tests cover default Deepgram routing, availability, catalog filtering, unsupported languages, access/origin/consent, request-size limits, cost estimate, insufficient balance, provider errors, and generation request metadata. PR CI runs tests plus production static/server builds and browser QA. No real Addis key or paid API calls are included in CI.

Before enabling a private pilot, complete runtime account setup, live provider catalog/estimate tests, one consented fictional Swahili generation, audio playback/pronunciation review, mobile and assistive technology checks, and server billing-limit review. Existing Deepgram real-key audio quality also requires separate manual verification.

Provider docs: https://docs.addisassistant.com/docs/capabilities/text-to-speech ; https://docs.addisassistant.com/docs/integrate/web-applications

**Release gate:** Review PR and CI first; do not merge or deploy without explicit owner approval.
