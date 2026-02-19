# Security Baseline

## Purpose

Define minimum security controls for the Codex memory engine before and during v1 implementation.

## Security Objectives

- Prevent secret or sensitive data leakage into persistent memory.
- Protect integrity of stored memory entries and migrations.
- Keep operations local-first and auditable.
- Reduce risk from malformed tool input and dependency vulnerabilities.

## Threat Model (v1)

- Malicious or accidental sensitive payloads submitted through `save_memory`.
- Unauthorized local read access to the SQLite database.
- Corrupted or unsafe migration execution.
- Injection-like payloads impacting query behavior or logs.
- Excessive or malformed requests degrading local service reliability.

## Data Classification

- `Public`: project-level technical notes safe for broad sharing.
- `Internal`: implementation details and decisions for repo collaborators.
- `Sensitive`: credentials, tokens, private customer data, personal identifiers.

Rules:

- Store only `Public` and `Internal` by default.
- Reject or redact `Sensitive` categories before write.

## Core Controls

## Input and Policy Controls

- Validate all MCP tool inputs against strict schemas.
- Enforce max lengths for text and metadata fields.
- Block secret-like patterns before persistence.
- Require explicit source allowlist for ingestion.
- Reject unsupported fields for write paths where ambiguity is risky.

## Storage Controls

- Use parameterized SQL for all repository operations.
- Keep DB in project-local path with least-privilege file permissions.
- Avoid world-readable permissions on `.data/` and DB files.
- Enable periodic integrity checks and migration version validation.

## Logging Controls

- Do not log raw sensitive payload content.
- Redact known secret patterns in logs.
- Log operation metadata (tool, duration, status, request id) instead of full body.
- Maintain actionable error codes without disclosing internals.

## Dependency and Build Controls

- Pin dependency versions for runtime and migration tooling.
- Run vulnerability scanning before release candidate:
- `npm run audit:prod` must pass (release blocker).
- `npm run audit:all` must be reviewed and tracked.
- Record dependency updates in decision log for significant changes.

## Access Controls

- Local operation by default, no required external network for core workflows.
- Any future remote mode must be explicit opt-in with separate security review.
- Restrict write operations to trusted local execution context.

## Retention and Deletion Controls

- Define configurable retention defaults before enabling automated cleanup.
- Provide dry-run retention mode first.
- Keep deletion and compaction operations auditable in event records.

## Operational Security Checks (Release Gate)

- Secret filter tests pass with seeded cases.
- Migration safety tests pass from prior schema version.
- DB file permissions validated in setup and smoke checks.
- Structured logs verified to avoid raw secret emission.

## Incident Handling

- Record incident details in `docs/session-log.md`.
- Add mitigation decision in `docs/decisions.md` for architectural changes.
- Add regression test for each confirmed security failure mode.
- Rotate any exposed credentials immediately if leakage is detected.

## Open Security Questions

- Final mandatory secret-pattern set for v1.
- Policy for handling false positives on blocked writes.
- Whether encryption-at-rest is required in v1 or deferred to v1.1.
- Dev-tool vulnerability remediation path after v1 stabilization.
