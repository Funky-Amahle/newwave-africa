# NewWave Africa — five-minute judging demonstration (NW-18)

## Why this runbook exists

For an education-focused 3–5 minute capstone, use [the four-minute narration and screen cues](CAPSTONE-VIDEO-SCRIPT.md), supported by [the service, impact and adoption roadmap](CAPSTONE-IMPACT-AND-ROADMAP.md). The longer scenario walkthrough below remains an optional rehearsal structure. Verify source capabilities against the filmed deployment before recording.

Purpose: demonstrate one human-centered creator journey and one transparent discovery-ranking tradeoff for the OpenAI x Andela Telling African Stories capstone. This is a rehearsal plan, not recorded footage. Build and deploy dates must be captured at filming time. Do not claim the feature PR is live until the owner approves merge and Pages deployment succeeds.

Source: https://github.com/Funky-Amahle/newwave-africa
Primary Pages application: https://funky-amahle.github.io/newwave-africa/
Current source routes: /newwave-africa/, /newwave-africa/discover/, /newwave-africa/creator-studio/, /newwave-africa/our-approach/

Facts to say aloud: the eight main stories are fictional; the additional ranking scenario contains twelve fictional examples, deliberately uneven across five categories. The ranking is deterministic local scoring, not a trained recommender or real-world impact measurement. Category suggestions are local keyword rules. Written drafts and saved reading lists stay in the browser. No account, public publishing or real audience data is offered. Current source supports optional generated creator narration: up to 5,000 characters of written story text, explicit text consent, one of 36 English voices and an operator-owned Deepgram session key/quota, producing a local WAV for playback/download. English transcription requires separate audio consent. No shared provider key or sponsored voice service is available; verify live-provider behavior separately before filming it.

## One recommended video: five minutes

| Time | Exact screen action | Suggested spoken narration (adapt into your own words) |
| --- | --- | --- |
| 0:00–0:35 | Open homepage, point to the mission and Discover stories entry. | “African stories span countries, languages and creative disciplines, but many perspectives are difficult to discover. NewWave Africa is a proof of concept for giving audiences more range and creators practical control. This is a fictional demonstration collection, not a live network.” |
| 0:35–1:15 | Show the eight category cards; search for a country, select an interest and bookmark one sample. | “A reader can search and explore eight types of stories. The interest setting changes ranking rather than hiding every other category; bookmarks stay in this browser. The original eight samples are deliberately balanced and use reviewed, prerecorded English narration.” |
| 1:15–2:05 | Select Discovery insights. Scroll to “When one category dominates the feed”. Show top-eight lists, move the scenario slider 0% to 60%, point to the two distinct category-coverage figures. | “To make the tradeoff visible, this separate test uses twelve clearly fictional examples: eight technology stories and one in each of four other categories. With equal relevance, the baseline ties break alphabetically, showing one category in the first eight. Diversity weighting brings all five represented categories into those eight. This is an illustration of the ranking rule, not proof of fairness or audience engagement.” |
| 2:05–3:35 | Open Creator Studio. Follow four anchor steps: pick Story & writing canvas and type one short sample answer; write an original title and story; show live preview; optionally demonstrate recording with permission but do not show credentials. | “Creators can plan writing, film, journalism, music or interactive work using five editable canvases. The author decides the words. They can export a planning brief, optionally record and review their answer, and add a consented English transcript if they supply their own restricted key. Audio is optional. The selected voice can be exported in a brief or used for separately consented narration generation with a Deepgram session key and quota; demonstrate generation only after verifying it on the filmed build.” |
| 3:35–4:20 | Check authorship confirmation for your original test draft, save locally, then navigate to Discover and show the saved draft. | “Before saving, the creator confirms they own the story or have permission. Saving stays on this device and does not publish to a community feed. Images, audio and planning notes require their own downloads. The prototype puts creator control ahead of frictionless uploading.” |
| 4:20–4:50 | Open repository, show source, tests and the exact successful GitHub Actions build SHA; return to the demo. | “The prototype is built with Next.js, React and TypeScript, exported to GitHub Pages. The repository includes deterministic ranking tests, consent-handling contracts and a build pipeline. Passing CI is not the same as independently verifying every browser microphone and device.” |
| 4:50–5:00 | Finish on homepage mission and tagline. | “The next step is to learn with real African creators and evaluate discovery relevance, language access and rights-conscious sharing before wider release.” |

Aim for natural pacing; show screen actions rather than reading every table row. Do not use fictional category coverage to claim statistically validated reach.

## Optional separate five-minute technical walkthrough

| Time | Action and explanation |
| --- | --- |
| 0:00–0:40 | Show current commit, Next.js 15 App Router, GitHub Pages static routes and the distinct optional server build. |
| 0:40–1:40 | Open lib/discovery.ts and lib/discovery-scenario.ts. Explain interest matching, category scarcity, alphabetical tie-breaks, twelve-example fixture and tests; reproduce 1/5 versus 5/5 coverage at 60%. |
| 1:40–2:35 | Demonstrate reader, local bookmark, deterministic categorization and consented local draft save. |
| 2:35–3:35 | Open Creator Studio, the five craft canvases, voice recorder and editable transcript review; do not expose a real Deepgram key. |
| 3:35–4:20 | Show the prerecorded MP3 manifest, 36-voice narration selection, downloadable brief and optional consented WAV generation. Distinguish source support from live-provider behavior actually verified. |
| 4:20–5:00 | Show CI, scoped rights/privacy boundaries, limitations and future creator validation. |

## Before recording: required manual QA

Follow docs/HACKATHON-QA-EVIDENCE.md at 320, 375, 768, 1024 and 1440 px; 200% zoom; keyboard-only; system reduced motion; actual audio playback; microphone allow/deny; draft refresh persistence; optional permitted Deepgram test. Record pass, fail or not tested against a specific deployed SHA. Do not film API keys. Validate “Read story” dialog focus, creator step anchor jumps and the two side-by-side scenario lists.

If testing fails, record an honest screen demo without the broken feature and resolve the blocker before presenting it as working.

## Export and approval

Capture 1080p 30fps H.264 MP4/AAC (prefer under 500 MB). Add accurate captions, remove notifications and secrets, review rights, and watch the exported video in full. The scripts are not videos; no MP4 is generated by this repository. A PR build does not deploy GitHub Pages; merge and deployment require the owner’s explicit approval. The 6 November submission is already locked; obtain organizer confirmation before assuming later repository changes will be graded.
