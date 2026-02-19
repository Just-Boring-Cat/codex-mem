# codex-mem

Persistent local memory engine for Codex workflows, built on MCP + SQLite.

`codex-mem` helps you keep project context across sessions with a retrieval-first model:

1. Save memories when decisions or fixes matter.
2. Search compact index results.
3. Expand timeline around relevant entries.
4. Fetch full details only for selected IDs.

This keeps context durable and token-efficient.

## Features

- Local-first storage (SQLite + FTS5)
- MCP tools for memory and operations:
  - `save_memory`
  - `search`
  - `timeline`
  - `get_entries`
  - `ingest_docs`
  - `retention_dry_run`
- Source+hash dedupe for doc ingestion
- Forward-only migrations with upgrade tests
- Retention dry-run auditing (no destructive deletes in v1)
- Structured tool logging with request IDs

## Quick Start

```bash
npm install
npm run migrate
npm run mcp:start
```

Optional maintenance commands:

```bash
npm run ingest
RETENTION_MAX_AGE_DAYS=30 RETENTION_MAX_ENTRIES_PER_PROJECT=200 npm run retention:dry-run
```

## MCP Tools

### `save_memory`
Save a normalized memory record.

### `search`
Search compact index results by query and optional filters.

### `timeline`
Get chronological neighbors around an anchor entry.

### `get_entries`
Fetch full details for selected IDs.

### `ingest_docs`
Import configured docs into memory with source attribution and dedupe.

### `retention_dry_run`
Compute retention candidates and reasons without deleting anything.

## Validation

```bash
npm run lint
npm run typecheck
npm test
npm run audit:prod
```

Full audit visibility (includes dev dependencies):

```bash
npm run audit:all
```

## Documentation

Project docs live under `docs/`:

- `docs/setup-guide.md`
- `docs/usage-guide.md`
- `docs/mcp-api-spec.md`
- `docs/architecture.md`
- `docs/data-model.md`
- `docs/security-baseline.md`
- `docs/operations-runbook.md`

## Status

v1 is implemented and test-covered.  
Next iterations focus on polish, CI hardening, and post-v1 dependency remediation strategy.

