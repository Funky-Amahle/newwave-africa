# NewWave Africa — Evidence-Backed Release Checklist

**Pinned candidate:** `main@0c88a1f35a0eab19c26a52411331d64eb6d21555`  
**Successful production run:** https://github.com/Funky-Amahle/newwave-africa/actions/runs/42571023630  
**Date of evidence check:** 9 November 2026  
**Approval policy:** Owner approves all merges, deployments, spending, publication and access changes.

## Stage 0 — Verify exactly what was reviewed

| Check | Current observation | Sign-off |
|---|---|---|
| `main` SHA equals pinned candidate | PASS at review time | Verified from GitHub branch API |
| Workflow run SHA equals `main` | PASS | GitHub Actions 42571023630 |
| Build, server-build, browser-QA and deploy jobs successful | PASS | GitHub Actions 42571023630 |
| Repository access matches judging/reviewer requirements | **NOT VERIFIED:** repository private | Owner + organizer must confirm access |
| Main branch rules protect changes | **FAIL:** `protected=false`, no rulesets | Separate approval required to configure |
| All documented NW milestone statuses match current implementation | **NOT VERIFIED:** `docs/PLAN.md` contains stale/older statuses | Documentation reconciliation needed |

Never replace the original SHA above when recording test outcomes. For a later build, start a fresh checklist with its new SHA and workflow URL.

## Stage 1 — Automated, reproducible engineering checks

Use a clean worktree at the pinned commit:

```sh
git checkout --detach 0c88a1f35a0eab19c26a52411331d64eb6d21555
npm ci
npm run typecheck
GITHUB_PAGES=true npm run build
node --experimental-strip-types newwave_discovery_benchmark.mjs --out ./benchmark-results
```

The script belongs at the repo root. Re-run the specific existing test suite and Playwright smoke workflow as specified in `.github/workflows/deploy-pages.yml`. Always record exact operating environment, exit code, URL and generated fixture JSON; green CI from a different SHA does not count. The benchmark run in this delivered pack was performed on **hash-exact source copies**, not by modifying or checking out the actual GitHub worktree.

**PASS** only when 0 critical test failures, code hashes are confirmed, the 1/5→5/5 scenario reproduces and the new algorithm diagnostic outputs are retained. **FAIL** for any source mismatch without reviewed diff, build error or silent fixture mutation.

## Stage 2 — Manual, physical-device acceptance

Record browser version, device/OS, keyboard/screen reader, date, tester initials, evidence link and disposition for each item.

| Check | Required observation | Status |
|---|---|---|
| 4 routes on live Pages | Direct access, reload, Back/Forward and hash links produce expected pages | NOT TESTED in this review |
| Discover search, interest, slider, bookmark | Works in live browser; filters and saved-only intersection correct | NOT TESTED |
| Creator plan → write → consent → local save → reload | No missing data or false publishing claim; export works | NOT TESTED |
| Keyboard only | Tab order, `Enter`/`Space`/Escape, focus return and story dialog work | NOT TESTED |
| Viewports 320,375,768,1024,1440 and 200% zoom | No clipped essential controls or horizontal overflow | Automated widths partially covered; manual zoom NOT TESTED |
| Reduced motion and visibility state | Critical information remains accessible | NOT TESTED manually |
| Voice playback and microphone | Real 10-second recording, allow/deny flow, audible playback and download | NOT TESTED on physical hardware |
| Screen readers | At least one mobile and one desktop reader complete critical journey | NOT TESTED |

**Block** on any P0 data-loss, rights/consent, secret exposure, focus trap or unusable essential action. A Playwright visual-download smoke check cannot substitute for microphone hardware or human assistive-technology testing.

## Stage 3 — Reader/creator validation (separate evidence gate)

- Use a consented formative study of **10 creators and 10 readers**; record denominator and task-level outcomes.
- Core creator task ≥8/10 independently succeed; reader comprehension ≥8/10.
- Prepare a permission-cleared, blinded ranking evaluation with at least 80 stories and 40 intents; report nDCG@8, coverage@8, interrater agreement, and paired uncertainty.
- No blanket public relevance/fairness or creator-impact claims from fictional fixture results.

**Current status: NOT TESTED.** Do not mark complete just because the algorithm's synthetic tests pass.

## Stage 4 — Optional paid/voice pilot (independent release decision)

- GitHub Pages keeps Deepgram session-key functionality; Addis still requires a private server with secrets, separate code and signing secret. Confirm server route is actually hosted before asserting it works.
- Verify no API keys in JS bundles, git history, logs, screenshots or public config.
- Require explicit user consent, signed estimate review, fixed per-clip ceiling, known provider quotas and account billing review.
- Test only licensed/original fictional Swahili text with native-speaker evaluation; log pronunciation errors and latency. Real speech data should be treated sensitively.
- Process-local quotas and quote replay barriers are **not** a durable public spending cap; do not expose the pilot to the public without stronger auth, shared ledger and provider-level budget controls.

**Current status: backend code prepared, live provider test NOT VERIFIED.** Paid provider testing requires fresh explicit approval.

## Stage 5 — Hackathon submission and narrative honesty

- Confirm whether the official 6 November submission lock accepts post-deadline repository changes; retain a written organizer acknowledgement.
- Confirm judges' actual access to the currently **private** repository, or obtain owner-approved public-release/reviewer-invitation decision.
- Video uses real interactions and truthful staged fictional fixtures; never label mocked frames as live proof.
- Check complete spoken narration, captions, licensed audio/assets, creator attribution, accurate voice/provider claims and absence of secrets.
- Compare final MP4 against the *submitted* commit, not simply the latest branch.

**Current status: organizer/submission receipt and final-video acceptance NOT VERIFIED.**

## Approval and decision record

| Field | Value |
|---|---|
| Candidate SHA | `0c88a1f35a0eab19c26a52411331d64eb6d21555` |
| Static prototype CI | PASS |
| Human/device QA | PENDING |
| Independent impact evidence | PENDING |
| Main branch protection | FAIL / owner approval required |
| Reviewers' access | UNCONFIRMED |
| Addis public service readiness | NOT READY |
| Deployment action taken by this brief | NONE |
| Owner release decision | ______ GO / NO-GO / CONDITIONAL |
| Approved by, date, evidence link | ______ |

**Recommendation:** Continue using the application as a clearly labeled prototype; refrain from stronger relevance/impact or public paid-voice claims until the appropriate additional evidence exists. Changes should be prepared as minimal reviewed PRs and deployed only on explicit approval.