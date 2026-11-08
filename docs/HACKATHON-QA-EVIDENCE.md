# NW-18 — Judging readiness and real-device QA

Status: PENDING HUMAN BROWSER VERIFICATION. This file is a runnable manual checklist, not a statement that the tasks passed. A successful CI workflow proves only what its steps actually run.

## Record the build before testing

- Source branch and SHA: __________________________
- Is this SHA merged to main? YES / NO
- If merged, production deployment run URL and matching SHA: __________________________
- Date, tester, OS, browser/version, viewport: __________________________
- Evidence link (screenshot or short recording): __________________________
- For each check record PASS / FAIL / NOT TESTED, observation, defect issue, and next owner.

## P0: Discovery proof

| Check | Expected behavior | Status |
| --- | --- | --- |
| D-01 — Main samples | Eight clearly fictional samples and corresponding reviewed prerecorded narration remain unchanged; nothing calls them actual submissions. | NOT TESTED |
| D-02 — Scenario default | Open Discovery insights and the separate scenario: 12 invented examples, five categories, first eight show baseline 1/5 and weighted 5/5 at 60%. | NOT TESTED |
| D-03 — Slider boundary | Move scenario weight to 0%; ranking and coverage match relevance-only baseline, 1/5 on both sides. Set back to 60%. | NOT TESTED |
| D-04 — Explainability | Text mentions equal relevance, alphabetical tie-break, invented scenario and no real fairness/engagement claim. | NOT TESTED |
| D-05 — Real discovery | Search, interest selector, normal diversity slider and reading-list bookmarks still work without importing scenario items into the real feed. | NOT TESTED |

## P0: One human-led creator journey

| Check | Expected behavior | Status |
| --- | --- | --- |
| C-01 — Steps | Creator Studio displays Plan, Write and preview, Record and review, Check rights and save; all four links move to the intended control. | NOT TESTED |
| C-02 — Canvas | Select Story & writing, type an original test answer, download and inspect an editable brief; blank data is handled transparently. | NOT TESTED |
| C-03 — Draft | Type your own fictional title and 20+ character story, inspect preview, optionally choose country/language/category. | NOT TESTED |
| C-04 — Recording | Allow microphone, record 10 seconds, stop, preview/download; deny permission and check the error message. Verify on real hardware. | NOT TESTED |
| C-05 — Transcription optional | No API key supplied: writing/recording work. With an owner-controlled restricted session key and valid audio only, consent then transcribe, edit, append and clear key. Never record the key in footage. | NOT TESTED |
| C-06 — Rights and storage | Unchecked permission blocks saving. Checked permission saves locally; new draft appears in Discover and persists after reload in the same browser. No public publishing. | NOT TESTED |
| C-07 — Privacy | A written draft and downloaded brief do not silently include uploaded image/audio; key is not persisted. | NOT TESTED |

## P1: Responsive, accessibility and media

- At 320, 375, 768, 1024 and 1440 CSS px, inspect: header, main story grid, both scenario columns, creator step links, craft pills and form. No horizontal page overflow or overlapping controls. STATUS: NOT TESTED.
- At browser text zoom 200%, retain readable controls without truncation. STATUS: NOT TESTED.
- Keyboard only: Tab/Shift+Tab focus visible; Enter/Space activate buttons and anchors; story dialog opens, closes via Escape and returns focus; checkbox and slider keyboard work. STATUS: NOT TESTED.
- System reduced motion: decorative movement stops while information and controls remain available. STATUS: NOT TESTED.
- Narration: confirm each of eight prerecorded tracks can play, pause, resume and stop audibly on the tested device, or report individual failures. No browser-voice fallback. STATUS: NOT TESTED.
- Narrow connection or offline after load: test reading, saved drafts and artifact downloads where supported; document restrictions. STATUS: NOT TESTED.
- Optional verify on Chrome/Edge and Safari/Firefox; note audio format and microphone differences. STATUS: NOT TESTED.

## P1: Submission presentation

- Rehearse docs/HACKATHON-RECORDING.md around five minutes with screen transitions and complete original spoken narration. STATUS: NOT TESTED.
- Review output MP4 full-length; captions, audio sync, file size and rights; check no account secrets or personal information. STATUS: NOT TESTED.
- Keep the repository public for grading and confirm whether organizers grade the locked 6 November version or later main commits. STATUS: NOT VERIFIED.

## Automated evidence required in PR

- CI tests: discovery scenario fixture, existing discovery correctness, creator anchor contracts, narration assets, protected transcription offline tests, typecheck, Pages/static build and server build.
- A PR CI success is not a live production deployment or a real-device validation. Review the exact SHA and workflow job results.
- No merge/deploy without explicit owner approval. Roll back the new scenario and creator links by reverting NW-18 commit if needed; the eight main stories, narration files, storage schema and API boundaries are untouched.
