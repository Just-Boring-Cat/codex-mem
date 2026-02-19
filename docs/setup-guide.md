# Setup Guide

## Purpose

Provide a step-by-step setup path for running `codex-mem` locally and connecting it as an MCP server in Codex clients.

## Prerequisites

- Git
- Node.js 20+
- npm
- SQLite 3 (optional CLI, DB engine is bundled through dependency)

## 0) Automated Installer (Bash)

Run one command to install dependencies, prepare DB path, run migrations, and attempt Codex MCP registration:

```bash
npm run mcp:install
```

Optional usage:

```bash
bash scripts/install-mcp.sh --help
bash scripts/install-mcp.sh --dry-run --no-register
bash scripts/install-mcp.sh --name codex-mem --db-path .memory/codex-mem.db
```

## 1) Install Dependencies

```bash
npm install
```

## 2) Configure Environment

Set the DB path for this repo.

```bash
export MEMORY_DB_PATH=.memory/codex-mem.db
```

Optional compatibility variable:

- `CODEX_MEM_DB_PATH`

Optional project label:

```bash
export MEMORY_PROJECT_NAME=codex-mem
```

## 3) Apply Migrations

```bash
npm run migrate
```

Expected output includes:

- `Migrations applied successfully for ...`

## 4) Optional Initial Ingestion

```bash
npm run ingest
```

Default ingestion sources:

- `docs/session-log.md`
- `docs/decisions.md`
- `docs/requirements.md`

## 5) Start MCP Server (Local Manual Run)

```bash
npm run mcp:start
```

Use this mode for quick terminal debugging.

## 6) Connect MCP in VS Code Codex Extension

Use the **Connect to a custom MCP** form with:

- Name: `codex-mem`
- Transport: `STDIO`
- Command to launch: `npm`
- Arguments:
  - `run`
  - `mcp:start`
  - `--silent`
- Environment variables:
  - Key: `MEMORY_DB_PATH`
  - Value: `.memory/codex-mem.db`
- Working directory:
  - Absolute path to this repo (example: `/Users/hgeorge/Downloads/DEVELOPMENT/codex-mem`)

Important:

- Relative DB paths resolve from the selected working directory.
- If you use a different working directory, provide an absolute DB path.

## 7) Validate MCP Tool Discovery

After saving MCP config, ask Codex to list or use tools and confirm these are available:

- `save_memory`
- `search`
- `timeline`
- `get_entries`
- `ingest_docs`
- `retention_dry_run`

## 8) Quick Smoke Check

Use these steps in Codex:

1. Save memory with unique marker text.
2. Search by marker text.
3. Fetch details by returned ID.
4. Request timeline around the returned ID.

If all four succeed, setup is correct.

## 9) Retention Dry-Run Example

```bash
RETENTION_MAX_AGE_DAYS=30 RETENTION_MAX_ENTRIES_PER_PROJECT=200 npm run retention:dry-run
```

This is analysis-only and does not delete data.

## Notes

- Runtime is TypeScript + Node.js (`docs/runtime-decision.md`).
- For common failure modes, see `docs/troubleshooting.md`.
