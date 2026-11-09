# Phase 1 — Accessibility, device and release-gate acceptance

**Evidence date:** 9 November 2026 SAST.
**Reviewed production baseline:** 4f651e6787c2502effd51bf3f2fa703457445db2, successful workflow https://github.com/Funky-Amahle/newwave-africa/actions/runs/42579671712
**Owner:** quality-guardian (verification), frontend-builder (fixes), release-manager (release gate).
**Change controls:** owner approval required for merge, deploy, branch-protection settings, paid provider calls or publication.

## Automated evidence and new checks

Existing production CI verifies TypeScript, static/server builds, route validation, voice/transcription contracts, 7 Chromium navigation/download checks and 11 axe-core/keyboard/consent/permission checks. None of these substitutes for physical-device testing or native screen-reader auditing.

This PR makes browser-qa a required dependency for every future GitHub Pages deployment. A failed browser-qa job will block deployment. It also tests 200% CSS zoom in Chromium against all four routes for document/body horizontal overflow and preserved primary navigation. CSS zoom is a deterministic stress test, **not** native browser zoom or WCAG certification.

## Required manual device verification — NOT TESTED

| ID | Device / task | Acceptance | Status |
|---|---|---|---|
| MAN-01 | Physical Android Chrome: four routes, reload, Discover, save | No 404, clipped controls or lost navigation | NOT TESTED |
| MAN-02 | Physical iPhone Safari: same plus back/forward | No 404, clipped controls or focus loss | NOT TESTED |
| MAN-03 | Desktop Chrome + Firefox: native browser zoom 200%, keyboard and five widths | No horizontal overflow or clipped essential actions; focus always visible | NOT TESTED |
| MAN-04 | macOS VoiceOver + Safari: skip link, reader, creator journey | Reading order and focus restoration correct; names match labels | NOT TESTED |
| MAN-05 | Windows NVDA + Firefox: Addis language listbox, reader, creator | Selection announced, full keyboard access and Escape focus return | NOT TESTED |
| MAN-06 | Physical iPhone/Android microphone: 10-second original synthetic clip, allow/deny, record/play/download | Audible clip; clear denied-permission recovery; no duplicate playback | NOT TESTED |
| MAN-07 | Physical phone speaker: reviewed fictional MP3 play/pause/resume | Audio audible, correctly labeled short preview, no duplicate player | NOT TESTED |
| MAN-08 | Reduced-motion OS preference on real device | Controls remain operable and unnecessary motion stops or reduces | NOT TESTED |
| MAN-09 | Restricted Deepgram key with separate explicit operator approval | Consent before transmission, editable transcript, key cleared | NOT TESTED |
| MAN-10 | Private Addis server and explicitly approved cost cap | No client secret, confirmed estimate, consented audio and billing reconciliation | NOT TESTED |

Record device model, OS and browser version, date/time, actual production commit, pseudonymous tester, actual actions and PASS / FAIL / NOT TESTED, plus sanitized evidence or an issue link. Never commit personal recordings, transcripts, keys or participant identities.

## Proposed main branch protection — NOT APPLIED

GitHub reported main protected=false and zero repository rulesets at review time. With **separate owner authorization**, apply a main-only ruleset:

1. Require a pull request, one reviewer approval by someone other than the author, dismiss stale reviews and resolve conversations.
2. Require passing build, server-build and browser-qa jobs. Verify exact GitHub check contexts before enabling.
3. Block force-pushes/deletions, apply to administrators, limit bypass to documented owner-controlled emergency action.
4. Verify GitHub plan/permissions permit every control before enforcing; document any unsupported controls instead of silently weakening them.

## Phase 1 exit gate

- [ ] PR reviewed, merged and deployed only on owner approval; production commit and workflow SHA match.
- [ ] Build, server-build, browser-qa, axe-core, keyboard and simulated CSS zoom all pass.
- [ ] MAN-01 through MAN-08 actually performed and recorded, with no unresolved P0 failures.
- [ ] Optional MAN-09/10 tested only with separate approval or explicitly remain out of scope.
- [ ] Branch protection approved/applied or recorded as an explicit release exception.

Automation PASS does not satisfy real-device NOT TESTED.
