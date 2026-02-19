# Setup Guide

## Purpose

Provide a practical setup path for running the Codex memory engine locally in development and test workflows.

## Prerequisites

- Git
- SQLite 3
- Node.js 20+ and npm

## Repository Preparation

1. Clone the project repository.
2. Enter the project root.
3. Review core docs:
- `docs/mvp-spec.md`
- `docs/technical-design.md`
- `docs/mcp-api-spec.md`

## Environment Configuration

Create a local settings file at `.env.local` (or runtime-equivalent config):

```env
MEMORY_DB_PATH=.memory/context-memory.db
```

Recommended:

- Keep `.memory/` local and gitignored.
- Do not store production secrets in memory entries.
- `CODEX_MEM_DB_PATH` is still supported for compatibility, but `MEMORY_DB_PATH` is preferred.

## Install Steps

```bash
npm install
```

Run migrations:

```bash
npm run migrate
```

Run docs ingestion (optional, recommended before first retrieval-heavy session):

```bash
npm run ingest
```

Run retention analysis dry-run (optional):

```bash
RETENTION_MAX_AGE_DAYS=30 RETENTION_MAX_ENTRIES_PER_PROJECT=200 npm run retention:dry-run
```

Start local MCP server:

```bash
npm run mcp:start
```

## MCP Wiring

Configure Codex MCP to point to your local server command.

Example pattern:

```bash
codex mcp add projectMem -- <your-server-command>
```

Verify tools are visible:

- `save_memory`
- `search`
- `timeline`
- `get_entries`

## Smoke Test

1. Save one memory entry.
2. Search by a keyword from that entry.
3. Fetch details by ID.
4. Query timeline around that entry.

Expected outcome:

- Round-trip works without restart issues.
- Data remains available across new sessions.

## Notes

- Runtime is standardized on TypeScript + Node.js for v1 (see `docs/runtime-decision.md`).
