# Plan

Build a planning-first foundation for `codex-mem`, a project-local memory system that keeps useful context across Codex sessions. Start with robust documentation that defines scope, architecture, data model, and delivery sequence before implementation.

## Scope

### In Scope

- Define v1 memory product requirements and boundaries.
- Define architecture and data model for local-first persistence.
- Define milestones, release gates, and quality criteria.
- Establish decision log and session log process.

### Out Of Scope

- Implement runtime memory server in this planning phase.
- Integrate external vector databases in v1 planning baseline.
- Build UI or dashboard in v1 planning baseline.

## Action Items

[ ] Finalize problem statement and target outcomes in `docs/requirements.md`.
[ ] Define v1 and post-v1 feature boundaries in `docs/requirements.md`.
[ ] Define system components and data flow in `docs/architecture.md`.
[ ] Define storage entities and privacy constraints in `docs/data-model.md`.
[ ] Define milestones and release gates in `docs/delivery-plan.md`.
[ ] Record initial technical choices in `docs/decisions.md`.
[ ] Start ongoing progress tracking in `docs/session-log.md`.
[ ] Validate cross-document consistency and unresolved questions.

## Validation

- Ensure each architecture/data-model decision traces to a requirement.
- Ensure milestones map to definition-of-done and release gates.
- Ensure open questions are explicit and not hidden in assumptions.

## Open Questions

- Should v1 include semantic search embeddings or stay keyword-first?
- Should memory capture be manual-first only or include automated ingestion in v1?
- Should memory be project-local only or optionally shared across projects?
