# Roadmap

## Purpose

Define the staged path from the current MCP-based memory workflow to increasingly automatic memory capture and retrieval.

## Current State (v0.1.x)

- MCP server and six tools are stable.
- Local SQLite persistence and search are working.
- Automated installer (`npm run mcp:install`) exists.
- Memory usage is mostly explicit (manual tool calls), with optional ingestion/retention operations.

## Product Direction

`codex-mem` aims to become "automatic by default, controllable by policy":

- Auto-capture durable context with clear safeguards.
- Auto-retrieve relevant context at session start.
- Keep local-first privacy and predictable behavior.

## Milestones

## M1: Reliability and Adoption (Completed / In Progress)

Status:

- [x] Public release and docs baseline
- [x] Automated installer
- [x] Security and contribution policy docs
- [x] Branch protection and CI checks
- [ ] Demo assets and final onboarding polish

Deliverables:

1. Clear README and i18n onboarding.
2. Stable CI and release process.
3. Reproducible install and setup.

Success Criteria:

- New users can install and run first save/search flow in under 10 minutes.

## M2: Semi-Automatic Memory (Completed)

Goal:

Reduce manual effort while staying compatible with current Codex MCP limitations.

Deliverables:

1. Session helper scripts:
   - start-session context bootstrap (search/timeline summary)
   - end-session handoff capture template
2. Git integration helpers:
   - optional post-commit memory capture
3. Ingestion automation:
   - optional watch/scheduled ingest for docs changes
4. Retrieval profile presets:
   - concise vs deep recall modes

Success Criteria:

- 50%+ reduction in manual memory commands per session.
- Consistent session handoff quality across contributors.

## M3: Wrapper Agent Auto-Capture (Next)

Goal:

Implement an opt-in wrapper that captures session events and auto-saves durable summaries to memory.

Deliverables:

1. Event capture adapter:
   - prompt/response/tool event stream
2. Memory extraction pipeline:
   - candidate generation
   - dedupe and confidence scoring
3. Safety pipeline:
   - policy checks and redaction before write
4. Auto-save orchestration:
   - writes to memory with audit trail
5. Capture modes:
   - `off`, `assist`, `full`

Success Criteria:

- Session memory capture works without manual reminders.
- False-positive and false-negative rates are measurable and acceptable for pilot usage.
- Sensitive data is blocked before persistence.

## M4: Production-Grade Automatic Mode

Goal:

Ship opt-in automatic mode with observability and rollback controls.

Deliverables:

1. Auto mode runtime config (`off`, `assist`, `full`).
2. Audit UI/reporting:
   - why entry was saved or skipped
3. Recovery and rollback:
   - disable switch and safe fallback to manual mode
4. Performance and scale hardening:
   - latency budgets
   - DB growth controls

Success Criteria:

- Automatic mode is stable across real projects.
- Users can trust and control what is captured.

## Risks and Constraints

1. MCP alone does not currently provide full lifecycle hooks like some other ecosystems.
2. Full automation may require a wrapper/gateway integration model.
3. Automatic capture must not leak sensitive information.

## Prioritization Principles

1. Reliability before intelligence.
2. Privacy and safety before automation depth.
3. Observable behavior before broad rollout.

## Immediate Next Tasks

1. [x] Add M2 session helper scripts and docs.
2. [x] Add optional git-hook integration for memory capture.
3. [x] Implement wrapper event schema and adapter.
4. [ ] Add policy and dedupe gates for wrapper candidates.
5. [ ] Add pilot feedback loop for memory quality scoring.
