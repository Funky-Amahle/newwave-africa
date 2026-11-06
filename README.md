# NewWave Africa 🌍

**Every story changes the narrative.**

NewWave Africa is a human-centred African storytelling prototype built for the **OpenAI × Andela — Telling African Stories** hackathon. It combines **Discovery & Audience** with **Creation & Craft**: helping audiences find varied perspectives while giving creators practical tools to shape, record and share their own work on their terms.

**[Live demo](https://funky-amahle.github.io/newwave-africa/)** · **[Hackathon recording runbook](docs/HACKATHON-RECORDING.md)**

## What the prototype does

### Discover African stories
- Browse and search stories by topic, title, excerpt and country.
- Filter eight thematic categories and adjust a **diversity weighting** slider.
- Explore a simple dashboard comparing category coverage in two illustrative ranking approaches.
- Listen to story previews using the browser's Web Speech API, with pause/resume/stop and available system voices.

The eight starter stories are **fictional demonstration content**, not verified reporting or real creator submissions. The diversity algorithm is illustrative, not a validated recommender or proof of fair outcomes.

### Create and craft (proposed in [PR #13](https://github.com/Funky-Amahle/newwave-africa/pull/13))

The **Creator Craft Toolkit** is proposed for the Creator Studio and is **not on the deployed site until the PR is approved, merged and deployed**. It offers five editable planning canvases:

| Creative practice | Human-led production support |
| --- | --- |
| **Story & writing** | Narrative arc, character/voice, cultural context and attribution |
| **Film & animation** | Logline, scenes, shot list, subtitles and production requirements |
| **Journalism** | Reporting question, interviews, evidence verification, consent and corrections |
| **Music & audio** | Song or episode structure, recording plan, collaborators, credits and sample rights |
| **Games & interactive stories** | World, gameplay loop, player choices, accessibility and playtesting |

Each canvas guides the creator with prompts and lets them **download an editable Markdown brief**. The toolkit does not generate creative content with AI or upload notes. **Toolkit notes are held only in page memory and disappear on refresh or navigation unless downloaded.**

### Creator Studio in the current MVP
- Write an original story, preview it and save a **browser-local draft**.
- Receive a category suggestion from **local keyword-based demo rules**; no live AI categorization is used in this deployed static app.
- Record a voice clip through the browser microphone, preview, download or discard it. Recordings are **not uploaded or attached to saved stories**.
- Confirm authorship or permission before saving a written draft.

There are **no accounts, public publishing, shared creator profiles, persistent server storage or live audience metrics**. LocalStorage data stays on that browser/device.

## Quick start

Requires **Node.js 20+**.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

```bash
npm run typecheck
npm run build
```

The app runs without an API key. An `.env.example` file may be present, but the current GitHub Pages app does **not** call OpenAI or use `OPENAI_API_KEY`. Do not put secrets in client code or commit `.env.local`.

## Technical architecture

- **Next.js 15 App Router**, React 19, TypeScript and Tailwind CSS v4
- **Motion for React** for interface transitions, respecting reduced-motion preferences
- **Web Speech API** for device-dependent text-to-speech
- **MediaRecorder / Web Audio** for microphone capture and audio activity indication
- **LocalStorage** for written drafts; temporary browser object URLs for audio recordings
- **Local keyword rules** for demo category suggestions; illustrative relevance/scarcity ranking
- **GitHub Pages** static export, with `/newwave-africa` base path and a GitHub Actions build/deployment workflow

Browser speech voices, recording formats and microphone permission support vary by browser and device. Passing CI does not establish audible playback or microphone functionality.

## Five-minute demonstration

1. Introduce the need for creator-owned, discoverable African stories.
2. Explore fictional sample stories; search/filter and adjust diversity weighting.
3. Demonstrate narration and explain that available voices depend on the device.
4. In Creator Studio, write a short **original** test story, preview it and confirm rights before saving locally.
5. If the browser permits, demonstrate recording, playback and downloading a test voice clip.
6. Show the illustrative diversity dashboard and distinguish demo metrics from real-world impact.
7. Once PR #13 is deployed, demonstrate a craft planning canvas and export an editable brief.

For two separate ~5-minute videos (professional pitch and technical walkthrough), use [the recording runbook](docs/HACKATHON-RECORDING.md).

## Responsible creation

- **Human authorship first:** tools help structure and produce; they do not replace creative judgment.
- **Creator agency:** obtain permission for stories, recordings, images, music and other assets.
- **Cultural specificity:** invite local language expertise and avoid treating Africa as one homogeneous culture.
- **Transparency:** fictional examples, local-only storage, rule-based classification and illustrative metrics must be clearly labeled.
- **Privacy:** drafts and audio remain in the browser; users should download backups before clearing data or leaving the page.
- **Accessibility:** prioritize keyboard controls, captions/transcripts, responsive layouts and reduced motion; manual device testing remains necessary.

## Project workflow

The repository's [AGENTS.md](AGENTS.md) sets the contribution and approval rules. Track tasks in [docs/PLAN.md](docs/PLAN.md). Use feature branches and pull requests, report tests actually run, and **require human approval before merging or deploying**.

## Next steps

- Validate keyboard, mobile, microphone and narration behavior in real browsers.
- Review and merge the Creator Craft Toolkit after CI and UX checks.
- Add creator-controlled category review before any future public publishing.
- Evaluate ranking relevance and category coverage using a fixed test dataset.
- Research language accessibility, offline/low-bandwidth workflows and consent-driven publishing.
- Produce and review both hackathon videos with actual recorded footage.

**Repository:** https://github.com/Funky-Amahle/newwave-africa
