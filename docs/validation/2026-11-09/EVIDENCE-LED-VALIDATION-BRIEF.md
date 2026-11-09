# NewWave Africa — Evidence-Led Validation Brief

**Review date:** 9 November 2026 (Africa/Johannesburg)  
**Decision:** Freeze major feature additions temporarily; validate discovery usefulness, creator control, accessibility and release integrity before broadening the product.  
**Baseline production commit:** `0c88a1f35a0eab19c26a52411331d64eb6d21555`  
**Production GitHub Actions run:** [42571023630](https://github.com/Funky-Amahle/newwave-africa/actions/runs/42571023630) — completed successfully, with build, server-build, browser-QA and deploy jobs successful.  
**Repository:** [Funky-Amahle/newwave-africa](https://github.com/Funky-Amahle/newwave-africa) — private when inspected; `main` not protected and zero repository rulesets.  
**Scope:** Read-only review and locally run algorithmic benchmark. No repo edits, deployments, access changes, paid APIs, or live participant testing.

## 1. What decision does this evidence support?

NewWave Africa has an intelligible product direction: help audiences find stories beyond popularity-dominated categories and preserve African creators' authorship. The MVP contains a real static application, eight **fictional** examples, five planning canvases, browser-local writing, prerecorded excerpts, Deepgram session-key tools and an optional private-server Addis pilot. These features are not a public creator network, proven recommendation model, research-backed measure of diversity, integrated multilingual publishing platform or evidence of audience impact.

The next decision should be whether the **existing discovery behavior** improves useful discovery without meaningfully sacrificing relevance, and whether creators can reliably complete a private draft-and-export task. Answer those questions before expanding scope or claiming externally validated impact.

**Decision rule:** Ship the current prototype as a clearly labeled demonstration if technical/manual gates pass. Do **not** claim fairness, reach, African-language quality or creator impact until independent field evidence supports those claims.

## 2. Primary evidence inventory

| Source | What it establishes | What it does not |
|---|---|---|
| [`lib/discovery.ts`](https://github.com/Funky-Amahle/newwave-africa/blob/0c88a1f35a0eab19c26a52411331d64eb6d21555/lib/discovery.ts), Git blob `6084ddec6066f24f464e24da8db1f24ba73ac5b6` | Exact local deterministic ranking, interest preference, inverse-category-frequency scoring and alphabetical tie-breaks | Actual relevance or equity |
| [`lib/discovery-scenario.ts`](https://github.com/Funky-Amahle/newwave-africa/blob/0c88a1f35a0eab19c26a52411331d64eb6d21555/lib/discovery-scenario.ts), blob `a68a8a88129fe64d6ce4903b820e7eadc1b65ea9` | Intentionally imbalanced 12-fictional-story illustration | Real corpus or behavior |
| [`tests/discovery.test.mjs`](https://github.com/Funky-Amahle/newwave-africa/blob/0c88a1f35a0eab19c26a52411331d64eb6d21555/tests/discovery.test.mjs) | Regression tests for stored drafts, ranking, basic search and 1/5 → 5/5 fixture | Held-out reader judgments |
| [`scripts/qa/creator-visuals-smoke.mjs`](https://github.com/Funky-Amahle/newwave-africa/blob/0c88a1f35a0eab19c26a52411331d64eb6d21555/scripts/qa/creator-visuals-smoke.mjs) | Chromium smoke coverage for navigation, exports and responsive overflow | Real microphone, physical device, screen reader, complete task success |
| [CI 42571023630](https://github.com/Funky-Amahle/newwave-africa/actions/runs/42571023630) | Exact SHA matched successful production workflow jobs | Judging access, manual usability or provider output quality |
| [`docs/FINAL-QA-AND-DEMO-GATE-2026-11-08.md`](https://github.com/Funky-Amahle/newwave-africa/blob/0c88a1f35a0eab19c26a52411331d64eb6d21555/docs/FINAL-QA-AND-DEMO-GATE-2026-11-08.md) | Explicit manual checks and known omissions | Current completed device verification; document predates baseline commit |
| [`docs/research/evidence/records.json`](https://github.com/Funky-Amahle/newwave-africa/blob/0c88a1f35a0eab19c26a52411331d64eb6d21555/docs/research/evidence/records.json) | Empty register (`[]`) | Independent creator or audience research |
| [`docs/PLAN.md`](https://github.com/Funky-Amahle/newwave-africa/blob/0c88a1f35a0eab19c26a52411331d64eb6d21555/docs/PLAN.md) | Scope, acceptance criteria and honest distinctions between merge and human QA | Reliable current deployment status for every merged historical item; several statuses are stale |

**Provenance verification actually performed:** The local source copies used by the benchmark matched both GitHub Git blob hashes byte for byte. The benchmark imports the actual `getDiscovery` function; it is not a rewritten approximation.

## 3. Reproducible synthetic benchmark — results

The supplied `newwave_discovery_benchmark.mjs` imports `getDiscovery` and the 12-story scenario and runs 144 comparisons across 12 datasets/configurations and 12 diversity settings (`0,1,10,20,30,40,50,60,70,80,90,100`). These are deterministic diagnostics, **not** claims about real user outcomes. Exact observations are retained in `synthetic_results.json` and `synthetic_weight_sweep.csv`.

| Case | Directly observed result | Decision relevance |
|---|---|---|
| Original fictional 12-story fixture, all categories, 0% | First-eight coverage **1/5** | Existing expected baseline behaves as designed |
| Same fixture, all categories, 60% | Coverage **5/5** | Existing demonstration reproduces |
| Same fixture, all tested positive weights 1–100% | **One unique top-eight ranking** across all positive settings | Slider does not illustrate a gradual change in this fixture; avoid continuous-improvement claims |
| Same fixture, preferred interest = Technology, weight 60% | **8/8** visible stories match preferred interest | Preference can dominate scarcity weighting at some settings |
| Same fixture, preferred interest = Technology, weight 100% | **4/8** match preferred interest | High diversity weight can trade interest matching for coverage; usefulness must be tested |
| Four identical query-matching stories, then add 24 off-query Technology stories | Same four eligible candidates, **different order** | Category frequency comes from the entire browser collection, not current query matches; explain and evaluate that product decision |
| One-category collection and sparse query | Cannot invent missing categories; top-k follows available candidates | Basic edge-case correctness |

**Root cause:** In all-category mode, every candidate begins with the same relevance score. Any strictly positive diversity weight scales the category scarcity term, producing the same relative order. The ranking also computes category counts from all stories before filtering by search, causing unrelated additions to influence current search ordering.

These are **algorithm-design observations, not automatically bugs**. They challenge how the UI communicates the slider, and warrant human-relevance testing before changing ranking. No baseline had real relevance labels, so **nDCG, fairness improvement and useful-discovery lift are not yet measured**.

### Reproduce

From a clean worktree at the pinned commit, copy `newwave_discovery_benchmark.mjs` to the repository root and run:

```sh
node --experimental-strip-types newwave_discovery_benchmark.mjs --out ./benchmark-results
```

It asserts exact reviewed source hashes unless a future-version comparison deliberately uses `--allow-changed-source`. It produces a per-case CSV and results JSON and fails on mismatched expected fixture behavior. No provider keys, external network or payments are involved.

## 4. Future relevance benchmark — preregistered method

**Evaluation material required (NOT yet collected):** At least **80 permission-cleared stories/excerpts** and **40 distinct reader intents**, sampled across topic, country, language, audience needs and corpus imbalance. Keep originals attributable, licensing auditable, and unpublished/private creator work out of the shared evaluation pack. Sampling should deliberately include rare categories, dominant categories, no-match queries, ambiguous labels, cases where topical relevance conflicts with category scarcity, and multilingual content. Where rights are unavailable, substitute original fictional material but do not interpret the result as external validity.

**Judging protocol:** Have two reviewers independently assign each eligible story a blinded 0–3 topical relevance grade per intent (0 irrelevant, 1 marginal, 2 useful, 3 highly relevant). Reviewers must not see algorithm order or diversity condition. Report agreement (quadratic weighted Cohen's kappa or an equivalent preregistered ordinal agreement measure), adjudicate disagreements, and keep the independent pre-adjudication labels. Do not silently label unjudged candidates as irrelevant.

**Experimental design:** Freeze corpus/query pool. Compare (A) current relevance-only baseline `diversity=0` and (B) current default `diversity=60`, using exactly the same filtered candidates and top-eight window. Analyze both overall and on preregistered imbalanced-query subset. Record:

- **nDCG@8** from independent 0–3 human relevance labels (main relevance guardrail).
- **Distinct category coverage@8** and coverage improvement relative to baseline (diversity indicator).
- **Preferred-category count@8** for explicit interest queries (intent preservation).
- **No-result and unanswerable-query rates** as separately reported conditions.
- **Paired bootstrap 95% confidence interval** over queries for mean nDCG difference; do not represent this small study as population-wide causal proof.

**Proposed decision gates (thresholds chosen for this project, not industry standards):**

1. Each eligible candidate has a complete human relevance grade, two independent reviews, documented rights and an adjudication path. Missing judgments = **FAIL / do not calculate**.
2. **Relevance non-inferiority:** mean `nDCG@8(weighted) – nDCG@8(baseline) ≥ -0.05` *and* the paired-bootstrap 95% lower bound is at least `-0.05`. If CI is too wide, status **INCONCLUSIVE**, not PASS.
3. **Coverage improvement:** on imbalanced answerable intents, at least 60% gain ≥1 category within top eight (without failing the relevance gate). If coverage benefit is absent, revisit the value proposition before redesigning the scorer.
4. Never report category representation as demographic, linguistic or creator fairness unless source metadata and harms were independently validated.

A ready-for-use optional JSON evaluation mode is included in the script: `--evaluation reviewed_evaluation.json`. It computes nDCG@8 and a fixed-seed, 2,000-resample paired bootstrap after checking every eligible candidate has a 0–3 grade. The included example inputs are **invented smoke-test data**, not participant results. The script's CLI requires Node 22.

## 5. Creator and reader study — formative, not population inference

Use the separate `Reader-Creator-Study-Protocol.md` for recruitment, scripts, consent, observation capture and analysis.

- **10 creators:** varied creative practices (writing, journalism, audio, film/animation, games); test plan → draft → rights → save → reopen → export using **invented content**.
- **10 readers:** varied reading interests and language preferences; test search, meaningful discovery, reading list, ranking explanation, and preferences using the fictional comparison.
- **Methods:** 25–35 minute moderated sessions; tasks presented without coaching; order-counterbalanced ranking conditions; task completion, time on task, error/recovery, preference explanation, disclosure comprehension, short qualitative debrief. Facilitator records anonymous participant IDs rather than names in analytics.

**Proposed success thresholds:** At least **8/10 creators** finish a rights-confirmed local draft and retrieve it after reload without help; at least **8/10 readers** correctly explain the difference between fictional examples and real submissions, and understand that the scoring is deterministic; **10/10** observed save attempts without rights consent are blocked and no participant believes a local draft was publicly posted. Report denominators, missing tests, severe UX failures and every observed data-loss event. A serious data-loss/consent problem blocks release regardless of an aggregate percentage.

This is a small formative study; it does not establish broad adoption, causality or demographic representativeness. Run a follow-up study if participants cannot interpret the voice/provider limitations, language handoff or ranking slider.

## 6. Release checklist tied to this exact commit

See `Release-Verification-Checklist.md` for sign-offs, evidence fields, commands and rollback decisions. Current evidence snapshot:

| Gate | Verified status | Why |
|---|---|---|
| Commit-to-production matching | **PASS** | `main` and production run both identify `0c88a1f...` |
| CI build, server build, browser smoke, Pages deployment | **PASS** | Run 42571023630 job conclusions succeeded |
| Feature/PR integration | **PASS** for merge evidence | PR #57 merged; actual provider audio remains untested |
| `main` protection/rulesets | **FAIL** | Branch `protected=false`; 0 rulesets |
| Judging/reviewer access | **BLOCKED/VERIFY** | Repository private; permitted reviewer access not confirmed |
| Manual core journeys + 200% zoom + screen reader + microphones | **NOT TESTED** by this review | Repo's manual QA records remain pending |
| Real reader/creator relevance and completion | **NOT TESTED** | No participants recruited; evidence register empty |
| Addis live provider, cost reconciliation and naturalness | **NOT TESTED** | Server prepared, not hosted or exercised with live key |
| Final competition receipt/video/rights | **NOT VERIFIED** | Repository notes require organizer acknowledgement on post-deadline updates |

**Release recommendation:** The static app has repeatable automated evidence, and can be shown **as a fictional prototype** after hands-on QA. It is **not ready for a substantiated real-world impact claim or public paid voice service**. Do not mark pending evidence as PASS from green CI. Require explicit owner approval for any branch-protection updates, code merges, hosting, billing, key handling and publication.

## 7. Highest-value next actions (minimal scope)

1. **Quality guardian:** Reproduce the benchmark on a clean checkout of the exact commit; attach CSV/JSON and record pass/fail. This pack already contains results from a hash-matched source copy; reproduce independently in repo CI before treating it as a permanent gate.
2. **Research owner:** Recruit and consent 10 creators and 10 readers; assign two independent relevance reviewers; populate a permission-cleared evaluation set; do not include private story submissions in public logs.
3. **Project owner:** Confirm judges' repository access and organizer submission rules, then approve/decline proposed PR protection. Reconcile `docs/PLAN.md` and out-of-date QA references in a separately approved minimal documentation PR.
4. **QA owner:** Perform device/screen-reader, microphone allow/deny, local draft and consent checks at required widths; log actual evidence and blockers.
5. **Release owner:** Only after gates pass, update the demo to show real screen-recorded behavior and make claims no stronger than verified facts.

## 8. Results and uncertainty

**Actually done:** Read-only original-source inspection, current GitHub production commit/run check, original-source hash match, local Node execution of 144 deterministic benchmark comparisons, fixture assertions, CSV/JSON generation, one invented-label evaluation pipeline smoke test.

**Not done:** No users interviewed, no true human relevance labels collected, no full real-device accessibility audit, no live voice generation, no repository modification, no video submission verification, no organizer confirmation. **Do not treat the synthetic outputs as evidence of real-world fairness, impact or product-market fit.**