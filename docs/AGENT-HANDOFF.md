# Agent Handoff Template

Use this when changing owner, stage, thread, Codex session, branch/worktree or review context. This expands the original handoff fields without replacing project/task authority. Refer to [Workspace Operating Blueprint](WORKSPACE-OPERATING-BLUEPRINT.md).

## Identity and stage
- **Task ID:** (e.g. `DESIGN-13`)
- **From / To (role/owner):**
- **Stage:** Understand / Plan / Design / Build / Verify / Review / Document / Release
- **Branch and exact commit SHA:**
- **Related issue / PR / CI / deployed SHA:** (leave deployed SHA **unverified** unless checked)

## Goal
Objective and user-visible outcome; preserve the original request.

## Context Pointers
Relevant code/tests, `AGENTS.md`, task plan, design/architecture decisions, screenshot or reproduction, issue and PR links. Identify which were read against the current commit.

## Constraints
Current stack/brand, accessibility, creator/privacy/rights, external dependencies, explicitly excluded work and actions requiring human approval.

## Done When
List concrete acceptance criteria, including normal, repeated, failure, responsive, keyboard and reduced-motion behavior where relevant.

## Changed files and decisions
- **Changed files / interfaces:** (or "none: read-only handoff")
- **Accepted decisions:**
- **Proposed / disputed decisions:** (do not silently rewrite policy)

## Evidence actually observed
| Check / user action | SHA / environment | Pass / fail / not checked | Source / link |
| --- | --- | --- | --- |
| | | | |

**Prior evidence reported but not rerun:** Link exact run/PR and label **reported**.

**Checks not run:** Name and reason, especially hydrated browser, assistive-tech, storage failure, media, 200% zoom or deployment checks.

## Risks, status and next action
- **Risks / blockers (P0, P1, P2):**
- **Status:** observed / reported / inferred / proposed / not checked (explain conflicts with plan)
- **Next owner and single scoped action:**
- **Approval boundary:** e.g. reviewable PR only; merge/deployment explicitly not authorized

A finished agent response is not a test result. Mark task "done" only when its acceptance criteria have verified evidence and required review is complete.
