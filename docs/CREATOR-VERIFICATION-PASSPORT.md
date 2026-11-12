# NW-36 — Creator Verification Passport (unsigned MVP)

Status: review PR; **not merged or deployed**.

## Purpose and limits

Provide a portable integrity fingerprint for a successfully saved creator-authored **written draft** on static GitHub Pages. The feature is not a verified identity service, blockchain registration, legal ownership assessment, copyright certificate, authenticated publisher, or C2PA credential. It cannot validate permission or prove original creation. Rights confirmation remains the creator's self-attestation.

## v1 data contract

Source: `lib/creator-passport.ts`.

Canonical UTF-8 bytes are `JSON.stringify` of a fixed-key object with keys, in order: `schema` (`newwave-written-draft/v1`), `id`, `title`, `text` (the exact stored `excerpt`), `author`, `country`, `category`, `language`, `date`. This version uses saved fields as-is, without Unicode normalization, sorting, or trimming at verification; the initial draft save already normalizes selected inputs. Hash is lower-case hex SHA-256 of those bytes via browser Web Crypto.

Download record:
- `schema: newwave-creator-passport/v1`
- `proofStatus: unsigned`
- `scope: browser-local-written-draft`
- `hash: { algorithm: SHA-256, canonicalization: newwave-written-draft/v1, value: <64 lowercase hex> }`
- `story: { id, title, author, country, category, language, date }`
- `generatedAtDeviceTime`: user-device clock, **not trusted time**
- `signature: null`, `blockchainAnchor: null`, limitation notice

The JSON omits `text`, recordings, images, voice assets, private credentials, consent identity evidence, precise user location, signing keys and on-chain references. The metadata itself can be identifying; exporting is user-initiated. No remote request occurs for this operation.

## User journey

1. Create a written draft, assert the existing rights/permission checkbox and select **Save written draft locally**.
2. Only after a successful save, see the passport controls for that particular saved draft.
3. Download the unsigned JSON. A fresh SHA-256 is computed from the latest valid localStorage entry for that story ID, not from the unsaved form.
4. Select the JSON using **Verify passport against saved draft**. File input is bounded to 32 KB; recompute and compare both metadata and digest against current saved story.
5. MATCH establishes only that the record corresponds to these saved draft fields; NO MATCH means the record is modified, unrelated, invalid or unsupported. Neither result proves identity, source date, copyright or licensing.

A draft saved in another browser, or one cleared from storage, cannot be verified by this UI. Keep a separate copy of original work and the downloaded JSON. Multiple save operations create distinct story IDs and therefore distinct fingerprints. The UI presents the last successfully saved draft, and no new persistent proof store is created.

## Trust boundaries and threats

- Client JavaScript, device clock and localStorage are editable; a malicious actor can fabricate both a draft and a matching unsigned manifest.
- SHA-256 detects accidental edits and arbitrary modifications but **does not authenticate an author**. The hash includes the title and metadata; an identical text under another identifier is a different record.
- User-controlled original text is hashed locally. A short guessable text may be susceptible to an offline guess if its digest and metadata are disclosed; this is not secret storage.
- The file picker accepts a local JSON file only, checks size, parses JSON and compares data; it performs no network calls, script evaluation or external file reads.
- Existing browser quotas and limits (100 drafts, maximum text length) remain. The draft-saving error message must not imply a passport was created.
- Media rights and recordings have separate consent rules; this phase never hashes media.
- Ed25519 / ECDSA key custody, trusted timestamps, independent verification, C2PA, revocation, blockchain/chain costs, privacy, and public sharing require separate design and creator approval.

## Acceptance and manual QA

Automated: `node --experimental-strip-types --test tests/creator-passport.test.mjs` (or the repository's configured Node >=22 runner), then existing offline tests, `npm run typecheck`, GitHub Pages static build, server build, Pages routes, and browser accessibility checks. Record exact commands and exit codes from CI, not assumptions.

Manual on 320px/mobile and desktop HTTPS: check keyboard/tab operation, rights checkbox gate, successful save, JSON download content and filename, valid MATCH, modified-metadata NO MATCH, modified-draft NO MATCH, oversize/invalid-file handling, no network requests, no audio/images in download, no overflow, and state after refresh or localStorage clearing. Record PASS/FAIL/NOT TESTED per item. Do not include personal creator data in QA artifacts.

No merge/deploy before explicit owner approval. Rollback: revert this PR; no existing story keys or schema migrations were changed.
