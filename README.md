# NewWave Africa 🌍

**Every Category. Every Voice. A New Wave of African Stories.**

A hackathon proof of concept for the **OpenAI × Andela — Telling African Stories** challenge. The primary track is **Discovery & Audience**; the secondary track is **Creation & Craft**.

## The idea

NewWave Africa is a discovery-first home for African storytelling. Creators can submit original stories, receive suggested categories, and help audiences discover perspectives across technology, business, heritage, agriculture, education, arts, sports, and community life.

Unlike a popularity-only feed, the prototype makes category diversity visible and adjustable. It is **not** a production social platform.

## Current features

- Responsive discovery interface with searchable, category-aware stories
- Adjustable diversity weighting in story ranking
- Creator submission form with optional OpenAI category suggestions
- Transparent category coverage and feed comparison dashboard
- Eight **fictional, clearly labeled** sample stories, intended only for demonstration
- Browser-local story storage (no accounts or public publishing)

## Quick start

Requires **Node.js 20+**.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

The app runs without an API key, using **simple keyword-based demo classification**. For real AI categorization, set `OPENAI_API_KEY` in `.env.local` (and optionally `OPENAI_MODEL`). The API key stays server-side, in `app/api/categorize/route.ts`, never in browser code.

## Demo walkthrough (about five minutes)

1. Introduce the challenge: important African stories in less-popular categories can be hard to find.
2. Browse stories by category or country keyword and change the discovery diversity slider.
3. Publish a short, original test story from **Share your story**.
4. Explain whether categorization used OpenAI or demo rules; do not describe the fallback as AI.
5. Open **Diversity dashboard** to compare category representation and discuss how recommendation quality would be evaluated with real participants.

## How the ranking works

The demo scores an interest match and a category-scarcity bonus. A slider controls their weighting. It is a **toy algorithm** for illustrating the concept, not a validated, personalized ML recommender. The dashboard's baseline is deliberately simple and does not establish causal benefits.

## Architecture

- Next.js App Router + TypeScript + React + CSS
- Server-only OpenAI chat classification, with structured JSON output and category validation
- LocalStorage for prototyping (Supabase and authenticated publishing are possible future upgrades)

## Responsible design

- Creators keep authorship and can review category labels; future versions should include explicit correction controls before public publishing.
- Only share stories and recordings with permission.
- Sample stories are invented and do not portray verified individuals or events.
- Real deployment requires consent, moderation, authentication, secure storage, accessibility and evaluation across languages.
- Do not upload secrets or `.env.local` to GitHub.

## Next steps

Add a persistent database, human approval of AI categories, multilingual testing with native speakers, creator-controlled metadata, and a measured diversity/relevance evaluation.

**Project repository:** https://github.com/Funky-Amahle/newwave-africa
