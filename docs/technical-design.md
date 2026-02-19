# Technical Design

## Purpose

Translate planning docs into an implementation-ready design for the v1 local memory engine.

## Runtime Shape

- Process model: Single local MCP server process.
- Storage model: SQLite database with FTS index.
- Execution model: Request-driven operations with explicit save and query calls.
- Selected runtime: TypeScript + Node.js 20+ (see `docs/runtime-decision.md`).

## Module Boundaries

- `mcp_server`
- Exposes tool handlers and validates MCP arguments.

- `memory_service`
- Orchestrates write/read workflows, metadata normalization, and response shaping.

- `policy_service`
- Applies exclusion rules, secret detection, and retention checks.

- `repository`
- Owns SQL queries, migration state, and transaction boundaries.

- `ingestion_service`
- Converts source docs into normalized memory entries.

- `types`
- Defines entry schemas, filter objects, and error payload contracts.

## Proposed Repository Layout (Implementation Phase)

```text
src/
  mcp/
    server.ts
    handlers/
      save-memory.ts
      search.ts
      timeline.ts
      get-entries.ts
  services/
    memory-service.ts
    policy-service.ts
    ingestion-service.ts
  storage/
    db.ts
    migrations/
    repositories/
      entries-repository.ts
      sessions-repository.ts
  domain/
    models.ts
    errors.ts
  config/
    settings.ts
tests/
  unit/
  integration/
  contracts/
```

## Request Lifecycles

- `save_memory` lifecycle:
- Validate payload -> policy checks -> normalize -> transaction write -> return ID and status.

- `search` lifecycle:
- Validate filters -> execute FTS + filter query -> rank + trim fields -> return compact index.

- `timeline` lifecycle:
- Resolve anchor -> fetch surrounding entries by timestamp and project -> return ordered neighbors.

- `get_entries` lifecycle:
- Validate IDs -> fetch complete records and metadata -> preserve request order -> return full payloads.

## Migration Strategy

- Maintain explicit schema version table.
- Use forward-only migrations in numbered files.
- Run migrations at server startup with fail-fast behavior.
- Keep migration tests for at least one prior schema baseline.

## Retention and Cleanup

- v1 default behavior:
- No automatic destructive cleanup.
- Expose dry-run retention check command.

- v1.1 behavior target:
- Configurable max age and max count per project.
- Soft-delete or archive pathway with ingestion event log.

## Error Model

- Validation errors: `INVALID_ARGUMENT`.
- Policy errors: `POLICY_BLOCKED`.
- Not found errors: `ENTRY_NOT_FOUND`.
- Storage errors: `STORAGE_FAILURE`.
- Migration errors: `MIGRATION_FAILURE`.

Each error returns a stable code, message, and optional `details` object for debugging.

## Observability (v1)

- Structured local logs with request id and tool name.
- Duration metrics per tool operation.
- Storage failure logging with SQL context redaction.

## Security Controls (v1)

- Secret-like pattern detection before persistence.
- Explicit source allowlist for ingestion.
- No network calls required for core memory operations.
- Local-only data path by default.

## Open Technical Decisions

- Secret detection pattern baseline and false-positive policy.
- Ranking blend for relevance versus recency.
