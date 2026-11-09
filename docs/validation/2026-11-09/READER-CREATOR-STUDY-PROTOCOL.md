# NewWave Africa — Reader and Creator Study Protocol

**Version:** 1.0 · **Prepared:** 9 November 2026 · **Proposed study only; no participants recruited**

## Objective and limits

Test the current **fictional, browser-local** product for two questions: (A) Can readers find useful stories while understanding the ranking and prototype boundaries? (B) Can creators plan, save and recover an original draft without confusion, data loss or false publication expectations? Do not use this as evidence of population-level African audience or creator effects.

## Recruitment and consent

- **Creators (n=10):** Seek diverse experience across writing, film, journalism, audio/music and interactive stories; invite speakers of multiple languages where suitable. Participants may decline microphone use, screen recording or any task; do not require them to reveal unpublished work.
- **Readers (n=10):** Vary reading interests and language preferences; avoid recruiting only technically fluent people. Describe the English-first interface and limited, external translation handoff accurately.
- **Inclusion:** Use accessible invitations and reasonable accommodations; recruit voluntarily; document who was screened and reasons for excluding a response without inferring sensitive characteristics. No deception about publishing or AI capabilities.
- **Consent script (read before testing):** “We are evaluating a prototype, not testing you. The stories shown are invented. Drafts are stored in this browser, not published. You can skip questions or stop. We will capture task notes under a study ID; screen/audio recording is optional and requires separate permission. Please use invented content rather than real unpublished stories, and do not enter API keys or sensitive personal details. We will share aggregate findings rather than identifying you.”
- **Data handling:** Collect anonymous test IDs, browser/OS, width, task outcomes, timing and non-identifying observations. Store any consent records separately with restricted access. No external publication or uploading of audio/user text without specific permission. Set a retention period before recruiting and honor withdrawal requests where feasible.

## Method and counterbalancing

Run moderated 25–35 minute sessions. Use a standard facilitator script and avoid prompting participants toward the desired result. Readers see the relevance-only and 60% diversity results in randomized/counterbalanced order; for repeated comparisons use equivalent fixed fictional tasks to reduce learning effects. Observe actual clicks/speech, not just self-report. Think-aloud may be optional and should not be interpreted as a performance metric.

### Reader tasks and observations

| ID | Instruction given to participant | Observable result |
|---|---|---|
| R1 | “Find a story you might enjoy about a topic or country you choose.” | First meaningful selection, search reformulations, time, selected story, perceived topical relevance 1–5 |
| R2 | “Bookmark that story, navigate away, return and find it again.” | Completion, retry count, same-browser persistence, errors |
| R3 | “Compare these two eight-story lists. Which one would you read from and why?” | Preference, rationale, perceived relevance and variety; randomize display order of 0%/60% conditions |
| R4 | “Open ‘Why am I seeing this story?’ and tell me what controls its position.” | Correct statements about interest, category counts, fictional fixture and deterministic scoring; false trained-AI claims |
| R5 | “Try the language option. What happens and what limitations do you notice?” | External translation handoff correctly understood; no assumption the entire interface is professionally translated |

### Creator tasks and observations

| ID | Instruction given to participant | Observable result |
|---|---|---|
| C1 | “Choose an appropriate creative planning canvas and save its editable brief.” | Canvas discovery, answer input, downloaded filename/content, time, errors |
| C2 | “Write a short original **fictional** story and choose its topic and language.” | Metadata, preview correctness, clarity of local rules vs AI claims |
| C3 | “Try saving without permission confirmation; then read the permission statement and proceed if appropriate.” | Save must be blocked without checkbox; clear explanation and no data loss |
| C4 | “Save and reopen the story after reloading the site.” | Local persistence, retrieval on same browser/device, no false public publishing implication |
| C5 | “Show how you would record an optional voice note or why you might decline.” | Permission comprehension and control discovery; no live-provider call required; physical-device testing separate |

## Capture sheet (one row per task per participant)

| Field | Value / format |
|---|---|
| `participant_id` | `R01`–`R10` or `C01`–`C10` (no name) |
| `task_id` | R1–R5 or C1–C5 |
| `browser_os_viewport` | Exact environment; include accessibility accommodation where appropriate without identifying information |
| `completed_without_help` | yes/no/not tested |
| `seconds_to_complete` | Positive integer or `N/A`, measured from start of instruction |
| `help_requested`, `errors`, `recovery` | Counts and concise observations |
| `consent_or_privacy_misunderstanding` | none / significant / critical + quote paraphrase with permission |
| `observed_outcome` | Concrete behavior; avoid interpretations as fact |
| `severity` | P0 (data/consent/blocked task), P1 (major failure), P2 (polish) |
| `evidence_ref` | Restricted recording or notes ID, never API key or personal data |

## Acceptance and stopping rules

- Core creator completion: **8/10** complete C2–C4 unassisted, including same-browser re-open after reload.
- Reader comprehension: **8/10** correctly distinguish fictional samples, deterministic ranking and browser-local drafts.
- Consent: **zero** unauthorized saves or sends; any creator who believes a private draft was published is a critical clarity issue.
- No unhandled data loss or inaccessible critical action. One critical rights, credential or draft-loss failure blocks release regardless of task completion rate.
- Record task times and difficulty, but do not set a timing success target before pilot observation; treat timing descriptively.
- Track sample imbalance and language needs explicitly; 10-per-role evidence is formative, not representative.

## Analysis

Calculate exact counts (`8/10`, not rounded percentages alone) and task median times (with range). Present participant-level failures as anonymized case descriptions. Use two analysts to independently group reported problems into task flow, comprehension, accessibility, consent/storage and voice/language categories, then reconcile. Distinguish direct observations from hypotheses. Report what worked, what failed, no-tests and concrete severity. Do not selectively exclude unsuccessful attempts.

For discovery **ranking quality**, separately collect blinded 0–3 relevance judgments on all query-eligible stories, ideally 2 raters each, with adjudicated grades. Measure nDCG@8 and coverage@8 in the standalone benchmark; these ratings are **not** replaced by users merely preferring a nicer-looking list.

## Decision outputs

A study is complete when it provides task-by-task outcomes, errors, an evidence index, known recruitment limitations, prioritized defects and a go/no-go judgment against the explicit criteria. No raw names, identifiable voice recordings or unlicensed stories should enter the public GitHub repo.