# NewWave Africa 🌍

**Every story changes the narrative.**

NewWave Africa is a human-centred African storytelling prototype built for the **OpenAI × Andela — Telling African Stories** hackathon. It combines **Discovery & Audience** with **Creation & Craft**: helping audiences find varied perspectives while giving creators practical tools to shape, record and share their own work on their terms.

**[Live demo](https://funky-amahle.github.io/newwave-africa/)** · **[Hackathon recording runbook](docs/HACKATHON-RECORDING.md)**

## Education service and capstone

Our proposed primary beneficiaries are student writers and emerging storytellers with limited access to creative mentorship or production tools, initially through schools, libraries or community organisations. The prototype helps them plan an invented story, download a brief, write and retrieve a browser-local draft, and optionally use consented voice tools. These are expected benefits to validate; no partnership or measured educational impact is claimed.

Read the [service, impact and adoption roadmap](docs/CAPSTONE-IMPACT-AND-ROADMAP.md) and [four-minute capstone narration](docs/CAPSTONE-VIDEO-SCRIPT.md). The next month focuses on the existing reader/creator study and device/access checks. Low-data improvements, sponsored voice access, locally reviewed language support and controlled publishing are proposed later phases. Shared-browser drafts are not private accounts; current voice tools require provider access and quota.

## Combined design and source of truth

The repository app combines Base44’s warm cream, forest-green and clay visual direction with GitHub’s discovery, reviewed narration, five craft canvases, visual previews and private drafts. `components/creator-studio.tsx` composes the creator tools into one responsive workspace. Both the Pages export and optional server edition use these same components.

**GitHub Pages is the primary app destination.** Creator Studio and Our Approach are dedicated static routes, using the same shared layout and design as the homepage. Base44 supplied the visual reference; the GitHub app does not need a Base44 connection, account or credits.

After this change is deployed, the routes are `/newwave-africa/creator-studio/` and `/newwave-africa/our-approach/`. Direct entry and refresh are supported by exported HTML documents. Navigation keeps unsaved written draft fields in page memory; refreshing or leaving the app still clears unsaved work. Planning notes and visual selections should be downloaded before navigating away.

See [the Pages consolidation record](docs/design/PAGES-CONSOLIDATION.md) and [the original design record](docs/design/UNIFIED-EXPERIENCE.md) for provenance and verification.

## What the prototype does

### Discover African stories
- Browse and search stories by topic, title, excerpt and country.
- Prioritise eight thematic categories and adjust a **diversity weighting** slider.
- Explore a simple dashboard comparing category coverage in two illustrative ranking approaches.
- Listen to reviewed, published story recordings with pause/resume/stop. Browser-generated robotic voices and automatic speech fallback are removed; stories without recordings show **Narration unavailable**.

The eight starter stories are **fictional demonstration content**, not verified reporting or real creator submissions. The diversity algorithm is illustrative, not a validated recommender or proof of fair outcomes.

**Story reading and explainability (NW-22, pending review):** The flagship story reader has standard/larger text controls, and the eight bundled recordings are consistently described as short-excerpt narration. Each discovery card includes an expandable “Why am I seeing this story?” explanation of the actual local search, chosen interest, category diversity and count-based ranking inputs, plus alphabetical tie-breaking. These explanations are deterministic and do not represent model-generated recommendations or browsing analytics.

**Featured fictional long read (NW-21, pending review):** The South African Culture & Heritage sample `s3` includes a complete, original, explicitly fictional written story with an editorial reading view and ~3-minute reading estimate. Existing audio on the card and external Google Translate link still cover **the short original excerpt only**, not this full narrative. No interview, real storyteller or verified cultural testimony is implied. Browser-local drafts remain unchanged.

**Optional translation handoff (NW-19 and NW-20):** The shared header offers an English-first language selector and a link to Google Translate's external Websites feature. Users manually copy the public page URL to the external translator; translations are not embedded in the app, and the original page stays available. The Website feature is subject to browser and region availability. 

**Story reader (NW-19):** In the story reader, choose from a curated selection of African languages and explicitly open a fictional sample's title/excerpt in Google Translate. A personal browser-local draft is **never embedded in an external URL**; users can copy its text locally and manually choose whether to share it with the external service. The original stays in the reader, machine translations are unreviewed and should be checked for nuance, and translation does **not** run inside the app. No Google Cloud key, billing account, backend, unsupported widget, or new stored data is required.

### Create and craft

The **Creator Craft Toolkit** offers five editable planning canvases in Creator Studio:

| Creative practice | Human-led production support |
| --- | --- |
| **Story & writing** | Narrative arc, character/voice, cultural context and attribution |
| **Film & animation** | Logline, scenes, shot list, subtitles and production requirements |
| **Journalism** | Reporting question, interviews, evidence verification, consent and corrections |
| **Music & audio** | Song or episode structure, recording plan, collaborators, credits and sample rights |
| **Games & interactive stories** | World, gameplay loop, player choices, accessibility and playtesting |

Each canvas offers a **Speak button beside every question**, with recording/upload, explicit transcription consent and editable review before words are appended. Closing a question panel clears its transient key and unadded transcript. Each canvas guides the creator with prompts and lets them **download an editable Markdown brief**. The toolkit does not generate creative content with AI or upload notes. **Toolkit notes are held only in page memory and disappear on refresh or navigation unless downloaded.**

### Creator Studio in the current MVP
- Write an original story, preview it and save a **browser-local draft**.
- Add your credit, country and story language. Choose a category yourself or receive a suggestion from **local keyword-based demo rules**; no live AI categorization is used. Country and language also accept custom entries. Story-language metadata does not change the English-only transcription model.
- Record or upload a voice answer, preview it and download it. Selected audio is sent to Deepgram **only with explicit consent**, using your own session key in the Pages demo or an access code on the configured server edition. Recordings are not attached to saved text drafts.
- Confirm authorship or permission before saving a written draft.

There are **no accounts, public publishing, shared creator profiles, persistent server storage or live audience metrics**. LocalStorage data stays on that browser/device.

### Speech-to-text roadmap

The GitHub Pages demo lets you transcribe a selected recording with **your own restricted Deepgram API key entered for the current panel session**. The key is not shipped in the site, saved in browser storage or shared with visitors; requests use your Deepgram quota. Confirm audio consent, transcribe, review/edit and explicitly add the words. Clear the key when finished. A shared service with an owner-managed key remains a planned backend upgrade. See [session demo and backend roadmap](docs/PAGES-SPEECH-TO-TEXT-PLAN.md).

### Prepared voice and visual upgrade

- Choose a planning question or story field, review an editable English transcript, then explicitly append it to your own writing.
- Upload a permitted JPG/PNG/WebP image or select one of three original wave backgrounds. Preview with actual selected audio and download assets separately.
- The landing wave respects reduced effects, system motion preferences and visibility.
- GitHub Pages retains typing, recording and visual tools and offers direct session-key demo transcription. It cannot host the protected transcription API. The secret-backed Next.js server edition is prepared separately, not hosted by this change. See [server deployment](server-deploy/README.md) for private pilot setup and verification.

## Quick start

Use a current **Node.js 22 release or newer**.

```bash
npm ci
npm run dev
```

Open http://localhost:3000.

```bash
npm run typecheck
npm run build
```

The app runs without an API key. An `.env.example` file may be present, but the current GitHub Pages app does **not** call OpenAI or use `OPENAI_API_KEY`. Do not put secrets in client code or commit `.env.local`.

## Technical architecture

**Owner voice cloning setup:** the official ElevenLabs SDK is available through a lazy server-only client. See [the setup guide](docs/ELEVENLABS-VOICE-SETUP.md) for private onboarding and the recording needed to create the owner's voice clone. This is an operator setup; voice cloning is not exposed in Creator Studio or hosted on GitHub Pages.

**Multilingual narration (NW-33, review pending):** Creator Studio adds sixteen ElevenLabs language choices, five preset voices and eleven downloadable language samples. Afrikaans and isiZulu are included. Generation uses each creator's own restricted, session-only ElevenLabs key and explicit text consent; it produces a local MP3. Text must already be in the chosen language. See [multilingual narration and verification limits](docs/MULTILINGUAL-NARRATION.md). The owner clone remains separate.

- **Next.js 15 App Router**, React 19, TypeScript and Tailwind CSS v4
- **Motion for React** for interface transitions, respecting reduced-motion preferences
- **HTML audio playback** for reviewed recordings; no Web Speech synthesis or browser-voice picker
- **MediaRecorder / Web Audio** for microphone capture and audio activity indication
- **LocalStorage** for written drafts; temporary browser object URLs for audio recordings
- **Local keyword rules** for demo category suggestions; illustrative relevance/scarcity ranking
- **GitHub Pages** static export, with `/newwave-africa` base path and a GitHub Actions build/deployment workflow

Discovery sample recordings must be reviewed and published separately under `public/narration/`. Creator Studio can separately generate a private WAV from up to 5,000 characters of English story text using the selected Deepgram voice, explicit consent and a session-only key. It supports playback and download; changing text/voice clears the recording and key. Deepgram generation artifacts are not automatically deployed. See [the site-audio guide](docs/video/DEEPGRAM-SITE.md). Recording formats and microphone support vary by browser/device; passing CI does not establish audible playback or microphone functionality.

## Five-minute demonstration

1. Introduce the need for creator-owned, discoverable African stories.
2. Explore fictional sample stories; search/filter and adjust diversity weighting.
3. Demonstrate recorded narration only when reviewed clips are published; otherwise show the honest narration-unavailable state.
4. In Creator Studio, write a short **original** test story, preview it and confirm rights before saving locally.
5. If the browser permits, demonstrate recording, playback and downloading a test voice clip.
6. Show the illustrative diversity dashboard and distinguish demo metrics from real-world impact.
7. Demonstrate a craft planning canvas and export an editable brief.

For two separate ~5-minute videos (professional pitch and technical walkthrough), use [the recording runbook](docs/HACKATHON-RECORDING.md).

## Responsible creation

- **Human authorship first:** tools help structure and produce; they do not replace creative judgment.
- **Creator agency:** obtain permission for stories, recordings, images, music and other assets.
- **Cultural specificity:** invite local language expertise and avoid treating Africa as one homogeneous culture.
- **Transparency:** fictional examples, local-only storage, rule-based classification and illustrative metrics must be clearly labeled.
- **Privacy:** written drafts are saved locally and visuals remain in the browser. Explicitly consented audio for transcription goes to Deepgram; narration text goes to the selected provider. Deepgram and ElevenLabs use creator-owned session keys on Pages, while Addis requires its private server pilot. Download backups before clearing data or leaving the page.
- **Accessibility:** prioritize keyboard controls, captions/transcripts, responsive layouts and reduced motion; manual device testing remains necessary.

## Project workflow

The repository's [AGENTS.md](AGENTS.md) sets the contribution and approval rules. Track tasks in [docs/PLAN.md](docs/PLAN.md). Use feature branches and pull requests, report tests actually run, and **require human approval before merging or deploying**.

## Community and license

Read the [contribution guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md)
before participating. Use the [issue forms](https://github.com/Funky-Amahle/newwave-africa/issues/new/choose)
for bugs and feature requests, and the [security policy](SECURITY.md) for private
vulnerability reports.

Original project code and documentation use the [MIT License](LICENSE), except
material with its own license notice. Third-party dependencies and assets retain
their respective licenses. Software reuse does not grant permission to use a
creator's personal story, likeness, recording, or voice clone.

## Next steps

- Validate keyboard, mobile, microphone and recorded-narration behavior in real browsers.
- Review the combined experience PR after CI and UX checks.
- Add creator-controlled category review before any future public publishing.
- Evaluate ranking relevance and category coverage using a fixed test dataset.
- Research language accessibility, offline/low-bandwidth workflows and consent-driven publishing.
- Produce and review both hackathon videos with actual recorded footage.

**Repository:** https://github.com/Funky-Amahle/newwave-africa


### Voice Studio recording modes (NW-24, pending review)

Creator Studio offers distinct **Record a new take** and **Upload an audio file** modes. The selected recording or upload has one shared local preview, with audio download and clear actions. The record panel shows elapsed time and gentle decorative waveform animation, while preview animation runs only during playback. Animations are not live sound measurements and respect reduced-motion settings. Recording stops after three minutes; audio selection is bounded to 8 MB. No selected audio is sent to Deepgram without explicit permission, a session credential and the separate transcription action. User hardware/browser QA remains pending.

## Evidence-led validation baseline (9 November 2026)

The [read-only validation brief](docs/validation/2026-11-09/EVIDENCE-LED-VALIDATION-BRIEF.md), [reader/creator study protocol](docs/validation/2026-11-09/READER-CREATOR-STUDY-PROTOCOL.md) and [commit-specific release checklist](docs/validation/2026-11-09/RELEASE-VERIFICATION-CHECKLIST.md) explain what is **tested**, what is **illustrative**, and what still requires independent human or physical-device verification. The public source contains **no participant responses or API keys**.

Run the reproducible, synthetic-only benchmark from the repository root using Node 22:

```sh
node --experimental-strip-types newwave_discovery_benchmark.mjs --out /tmp/newwave-validation-evidence
```

The benchmark pins the discovery source and fixture hashes from production commit `0c88a1f35a0eab19c26a52411331d64eb6d21555`. A source change intentionally requires reviewing and updating this baseline; never use its results as real-reader relevance or fairness evidence. Its stored [CSV](docs/validation/2026-11-09/synthetic_weight_sweep.csv) contains invented test cases only. No new product features or public Addis service are enabled by this validation work.


## Creator Verification Passport (NW-36 — review PR)

Creator Studio can now download a **local, unsigned SHA-256 integrity passport** for the most recently saved written draft, then select that JSON file to verify it against that same draft in browser storage. The record includes the draft ID and descriptive attribution fields, SHA-256 of a versioned canonical UTF-8 representation, a device-reported generation time and explicit `signature: null` and `blockchainAnchor: null`. It does **not** embed the written story text, microphone audio, uploaded images or any external account credentials. The hash includes the written story text, author, title, category, country, language, date and draft ID; editing any of those changes the digest.

This is an **integrity check, not cryptographic creator identity, trusted timestamp, copyright registration, a signed C2PA credential or blockchain proof**. Anyone with identical draft data can compute the same fingerprint. Nothing is uploaded or posted to a blockchain. The creator must retain both the downloaded passport and original draft separately, because clearing browser storage removes the locally saved draft needed for the in-app comparison. The scope is the saved written draft only; media files require separate provenance work. See [passport decision and tests](docs/CREATOR-VERIFICATION-PASSPORT.md).

