<h1 align="center">
  <img src="docs/public/codex-mem.png" alt="codex-mem" width="420" />
</h1>

<p align="center"><strong>Persistent memory MCP server for Codex, local-first and SQLite-backed.</strong></p>

<p align="center">
  <a href="README.md">🇺🇸 English</a> •
  <a href="docs/i18n/README.es.md">🇪🇸 Español</a> •
  <a href="docs/i18n/README.de.md">🇩🇪 Deutsch</a>
</p>

<p align="center">
  <a href="https://github.com/Just-Boring-Cat/codex-mem/actions/workflows/ci.yml"><img src="https://github.com/Just-Boring-Cat/codex-mem/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-AGPLv3-blue.svg" alt="License"></a>
  <a href="package.json"><img src="https://img.shields.io/badge/node-%3E%3D20-brightgreen.svg" alt="Node"></a>
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> •
  <a href="#documentation">Documentation</a> •
  <a href="#how-it-works">How It Works</a> •
  <a href="#mcp-search-tools">MCP Search Tools</a> •
  <a href="#system-requirements">System Requirements</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

---

`codex-mem` preserves project memory across Codex sessions with a simple progressive workflow:

1. Save context with `save_memory`
2. Search index results with `search`
3. Expand surrounding context with `timeline`
4. Fetch complete records with `get_entries`

## Quick Start

```bash
npm install
export MEMORY_DB_PATH=.memory/codex-mem.db
npm run migrate
npm run mcp:start
```

Use `CODEX_MEM_DB_PATH` if you need compatibility with older environment naming.

### VS Code MCP Setup

In **Connect to a custom MCP**:

- Name: `codex-mem`
- Transport: `STDIO`
- Command: `npm`
- Arguments: `run`, `mcp:start`, `--silent`
- Environment variable: `MEMORY_DB_PATH=.memory/codex-mem.db`
- Working directory: absolute repo path

## Documentation

- `docs/setup-guide.md` - installation and MCP wiring
- `docs/usage-guide.md` - memory capture/retrieval workflow
- `docs/mcp-api-spec.md` - tool contract and payloads
- `docs/architecture.md` - architecture and data flow
- `docs/data-model.md` - entities and persistence model
- `docs/troubleshooting.md` - diagnostics and recovery
- `docs/security-baseline.md` - security controls
- `docs/operations-runbook.md` - operational procedures

## How It Works

Core components:

1. MCP server layer exposes memory tools to Codex.
2. Memory service validates and normalizes tool payloads.
3. Policy service blocks secret-like content patterns.
4. SQLite + FTS5 stores entries and powers search.
5. Ingestion service imports selected docs with hash dedupe.
6. Retention service produces cleanup candidates in dry-run mode.

Architecture reference: `docs/architecture.md`

## MCP Search Tools

Recommended 3-layer retrieval pattern:

1. `search` - cheap index results for discovery
2. `timeline` - local context around promising anchors
3. `get_entries` - full details for selected IDs only

Additional tools:

- `save_memory` - store key outcomes, decisions, and constraints
- `ingest_docs` - import docs with source/hash dedupe
- `retention_dry_run` - retention analysis without deleting data

Contract reference: `docs/mcp-api-spec.md`

## System Requirements

- Node.js 20+
- npm
- Local filesystem write access for `.memory/`
- SQLite runtime support (via bundled dependency)

## Configuration

Primary environment variables:

- `MEMORY_DB_PATH` (recommended)
- `MEMORY_PROJECT_NAME` (optional)
- `CODEX_MEM_DB_PATH` (fallback compatibility)
- `CODEX_MEM_PROJECT_NAME` (fallback compatibility)

## Troubleshooting

If tools are missing or persistence fails, check:

- MCP command/args and working directory
- DB path consistency across sessions
- migration status (`npm run migrate`)

Detailed guide: `docs/troubleshooting.md`

## Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch
3. Add tests for behavior changes
4. Update relevant docs
5. Open a pull request

Contributor guide: `CONTRIBUTING.md`

## License

This project is licensed under **AGPL-3.0**.

See `LICENSE` for full terms.
