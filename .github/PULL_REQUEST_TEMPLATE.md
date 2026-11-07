## Goal and task
- Task ID / issue:
- User-visible outcome:
- Stage and owner:

## Context pointers
- Relevant source files, design/architecture decisions and plan:
- Base/head branches and changed scope:

## Constraints and boundaries
- Existing stack, approved identity and behavior preserved:
- Privacy, creator authorship, rights/licensing, secrets, truthful fictional/demo labeling:
- Explicitly out of scope:

## Done when / acceptance criteria
- [ ] Expected behavior is described and linked to evidence
- [ ] Edge cases, error/empty states and failure recovery reviewed
- [ ] Relevant accessibility and responsive checks completed or explicitly marked not checked
- [ ] Documentation and rollback implications recorded

## Verification at exact commit
| Check / command / browser action | SHA and environment | Pass / fail / not run | Evidence |
| --- | --- | --- | --- |
| `npm run typecheck` (if applicable) | | | |
| `npm run build` (if applicable) | | | |
| Targeted regression tests | | | |
| Keyboard, narrow screen, zoom and reduced motion (for UI) | | | |

For UI changes, use [Design quality gate](../docs/design/DESIGN-QUALITY-GATE.md). For docs-only PRs, record link/content review; do not claim UI testing.

## Review and release
- P0/P1 findings and resolution / accepted limitations:
- Risks and rollback:
- Other worktrees/PRs or task dependencies:
- [ ] No secret values or unauthorized third-party content added
- [ ] Fictional/demo/local-only behavior represented accurately
- [ ] Human approval **still required** before merge, deployment, deletion or external publication

A green PR build does not establish a successful GitHub Pages deployment. Confirm production deploy-job completion separately.
