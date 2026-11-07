# NewWave Africa Agent Framework

Start with [AGENTS.md](AGENTS.md) and the [Workspace Operating Blueprint](docs/WORKSPACE-OPERATING-BLUEPRINT.md). Specialist procedures live in `.agents/skills/<role>/SKILL.md`; use the role that matches the task rather than duplicating its responsibilities.

Use the project [plan](docs/PLAN.md) and, for visual work, the [design plan](docs/design/DESIGN-PLAN.md) to select a task ID. The [task brief](docs/templates/TASK-BRIEF.md) starts a ChatGPT/Codex/Codespaces task; the existing [agent handoff](docs/AGENT-HANDOFF.md) captures its evidence and next owner. The [workspace-handoff skill](.agents/skills/workspace-handoff/SKILL.md) handles transfer between threads and specialists.

**Codex/GitHub:** Inspect live code and branch, implement scoped work on a feature branch, run appropriate checks, then open a PR using the repository template. Obtain explicit owner approval before merging or deployment.

**ChatGPT:** Link the task ID, relevant files and exact PR/CI evidence. A shared ChatGPT Page is a reference, not an automatic rule or source of release authority.

Example: "Read AGENTS.md, docs/PLAN.md and the workspace guide. Act as quality-guardian for DESIGN-01. Audit the current MVP, capture severity-rated evidence, record tests actually run and hand off the unresolved checks."
