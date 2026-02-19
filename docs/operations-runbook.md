# Operations Runbook

## Purpose

Provide day-to-day operational procedures for running and recovering the local Codex memory engine.

## Scope

- Local development and test operations.
- MCP server runtime health and storage lifecycle tasks.
- Incident response for data integrity, migration, and policy failures.

## Roles

- Operator: Runs server, migrations, and routine checks.
- Maintainer: Approves schema or architecture changes and release gates.

## Standard Operating Procedures

## Startup

1. Verify runtime dependencies are installed.
2. Verify config values and DB path.
3. Run migrations.
4. Start MCP server.
5. Run smoke test (`save_memory` -> `search` -> `get_entries` -> `timeline`).

## Shutdown

1. Stop MCP server process gracefully.
2. Confirm no active write transaction.
3. Archive relevant logs if debugging is in progress.

## Health Checks

- Server process is running and responsive.
- DB file exists and is writable.
- Migration version matches expected latest.
- Tool calls return expected status and schema.

## Routine Maintenance

- Weekly:
- Run integrity check on DB.
- Review error logs for repeated failures.
- Run retention dry-run and review candidate counts:
  - `RETENTION_MAX_AGE_DAYS=30 RETENTION_MAX_ENTRIES_PER_PROJECT=200 npm run retention:dry-run`

- Before release candidate:
- Run full test suite.
- Verify retention and policy behavior.
- Verify troubleshooting and setup docs match current commands.

## Backup and Restore

## Backup

1. Stop server or ensure write-safe snapshot path.
2. Copy SQLite DB to timestamped backup location.
3. Record backup event in `docs/session-log.md` when relevant.

## Restore

1. Stop server.
2. Backup current DB before restore.
3. Replace DB with selected backup.
4. Run migration status check.
5. Run smoke test and verify core queries.

## Migration Operations

## Apply Migrations

1. Backup DB.
2. Run migration command.
3. Validate schema version and quick query checks.

## Migration Failure Recovery

1. Capture error output and migration id.
2. Restore from last known good backup.
3. Record incident and mitigation notes.
4. Add regression test before retrying migration path.

## Incident Playbooks

## Policy False Positive Blocking Legitimate Entry

1. Capture blocked payload pattern safely.
2. Confirm whether content is actually sensitive.
3. Update policy rules or exception strategy.
4. Add test case and log decision.

## Data Corruption or Missing Entries

1. Stop writes immediately.
2. Run DB integrity checks.
3. Restore from backup if corruption confirmed.
4. Document root cause and prevention action.

## Search Degradation

1. Verify FTS index exists and is healthy.
2. Check query patterns and limits.
3. Rebuild index only after backup.
4. Capture performance metrics before and after.

## Retention Spike (Unexpected Candidate Growth)

1. Re-run retention dry-run with same input values and capture output.
2. Inspect `retention_audit_events` for trend and recent parameter changes.
3. Confirm project filters and ingestion volume changes.
4. Do not delete entries until dry-run output is reviewed and approved.

## Operational Checklists

## Pre-Release Checklist

- All release gates in `docs/delivery-plan.md` pass.
- Security checks in `docs/security-baseline.md` pass.
- `npm run audit:prod` passes with zero high vulnerabilities.
- `npm run audit:all` is reviewed and any open findings are documented.
- Setup and troubleshooting docs are current.
- Open critical incidents are resolved or explicitly accepted.

## Post-Change Checklist

- Run relevant tests for changed area.
- Validate at least one end-to-end retrieval flow.
- Record major operational changes in `docs/session-log.md`.

## Escalation

- Escalate to maintainers when:
- Migration failures repeat.
- Data integrity failures recur.
- Sensitive data handling behavior is uncertain.

- For architectural changes, create or update ADR in `docs/decisions.md`.
