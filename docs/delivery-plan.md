# Delivery Plan

## Milestones

1. Planning Baseline
- Finalize requirements, architecture, data model, delivery plan, ADR seed, and session log.

2. MVP Memory Engine
- Implement local storage schema and MCP tools for search, timeline, detail fetch, and manual save.

3. Ingestion and Policy Layer
- Add ingestion adapters for project docs and session artifacts with privacy filters and redaction.

4. Reliability and Hardening
- Add tests, observability basics, migration handling, and failure recovery behavior.

5. Release Candidate
- Validate release gates, documentation completeness, and install/run guidance.

## Definition of Done (Per Milestone)

- Scope items are implemented and reviewed.
- Acceptance criteria mapped to requirements are met.
- Tests for changed areas pass.
- Operational documentation is updated.
- Decision log captures any major technical changes.

## Release Gates

- Quality: Core tests pass for storage, retrieval, and ingestion paths.
- Security and privacy: Sensitive content filtering behavior is validated.
- Documentation: Setup, usage, and troubleshooting docs are complete.
- Operations: Rollback and migration plan is documented in `docs/operations-runbook.md`.

## Risks and Mitigations

- Risk: Overbuilding before MVP validation.
- Mitigation: Deliver manual-first retrieval and save flow before automation.

- Risk: Token-heavy retrieval behavior.
- Mitigation: Enforce index-first and selective detail-fetch workflow.

- Risk: Sensitive data retention.
- Mitigation: Default exclusions and explicit redaction checks in ingestion path.

## Exit Criteria for v1

- Project can persist and query memory across sessions locally.
- Users can retrieve relevant prior work without scanning raw logs manually.
- Architecture and data model support extension to semantic search later.
