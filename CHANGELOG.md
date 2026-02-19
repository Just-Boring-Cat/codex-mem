# Changelog

All notable changes to this project are documented in this file.

The format follows Keep a Changelog and Semantic Versioning principles.

## [Unreleased]

### Added

- Automated installer script: `scripts/install-mcp.sh`
- npm command: `npm run mcp:install`
- Installer integration tests: `tests/integration/install-mcp-script.integration.test.ts`
- Premium README/i18n presentation and architecture section

### Changed

- Expanded setup and troubleshooting documentation
- Improved public onboarding and repository metadata

## [0.1.0] - 2026-02-19

### Added

- Initial public release of `codex-mem`
- MCP server with tools:
  - `save_memory`
  - `search`
  - `timeline`
  - `get_entries`
  - `ingest_docs`
  - `retention_dry_run`
- SQLite + FTS-backed local persistence
- Policy checks for secret-like payloads
- Ingestion and retention dry-run workflows
- Contract, integration, unit, and performance tests
- Core documentation set for setup, usage, architecture, operations, and troubleshooting

[Unreleased]: https://github.com/Just-Boring-Cat/codex-mem/compare/v0.1.0...main
[0.1.0]: https://github.com/Just-Boring-Cat/codex-mem/releases/tag/v0.1.0
