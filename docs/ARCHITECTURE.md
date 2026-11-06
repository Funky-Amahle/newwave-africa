# Architecture

## Current prototype branch
The earlier feature/hackathon-mvp branch contains a Next.js TypeScript UI, sample stories, browser-local submissions, server-only optional OpenAI categorization, deterministic demo fallback, and toy diversity-aware ranking. These features are NOT on main unless the separate PR is merged.

## Current data flow (prototype)
Creator form -> POST /api/categorize -> category/tags -> browser localStorage -> feed ranking -> coverage dashboard.

## Future system (not implemented)
Authenticated creator -> moderation/consent -> persistent database -> retrieval -> diversity reranking -> measured analytics.

## Constraints
Validate all untrusted inputs; keep secrets server-side; allow human category correction; label fictional stories; require consent and deletion paths before storing personal data; measure relevance alongside diversity.
