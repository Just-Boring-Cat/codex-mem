# Implementation Kickoff

## Objective

Start milestone 2 with a concrete implementation sequence that maps directly to the MVP spec and test strategy.

## Prerequisites

- Runtime and package manager are fixed to TypeScript + Node.js + npm.
- Confirm test runner selection for TypeScript stack.
- Confirm DB migration library or migration strategy.

## Sprint 0 Setup Tasks

- Create initial source layout and test layout.
- Add configuration loader for project-local settings.
- Add SQLite bootstrap and schema version table.
- Add first migration for core tables and FTS index.
- Add structured logger with request id support.

## Sprint 1 Core Delivery

- Implement `save_memory` end-to-end path.
- Implement `search` compact index retrieval.
- Implement `get_entries` full detail retrieval.
- Implement `timeline` neighbor retrieval around anchor.
- Add contract tests for all MCP tools.

## Sprint 2 Ingestion and Policy

- Implement policy checks for sensitive patterns.
- Implement ingestion command for:
- `docs/session-log.md`
- `docs/decisions.md`
- `docs/requirements.md`
- Add dedupe strategy by source and content hash.
- Add integration tests for ingestion and policy behavior.

## Sprint 3 Hardening

- Add migration upgrade test from prior schema snapshot.
- Add performance test for search at 10k entries baseline.
- Add retention dry-run command and audit logging.
- Add error-path tests for storage and malformed input.

## Deliverables Checklist

- Runtime:
- MCP server executable and documented start command.

- Data:
- Migrations, repository layer, and FTS queries.

- Tests:
- Unit, integration, and contract tests passing for v1 scope.

- Docs:
- Setup guide, usage guide, troubleshooting section.
- Security baseline and operations runbook are present and current.

## Risk Control Gates

- Gate 1: Data integrity before broad feature work.
- Gate 2: Policy checks before ingestion is enabled by default.
- Gate 3: Contract tests before release candidate tag.

## Definition of Ready For Coding

- Technical design approved.
- API spec approved.
- Open questions reduced to non-blocking items.
- Initial ADRs and session-log entries are current.
