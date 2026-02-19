# Troubleshooting

## Purpose

Provide fast diagnostics for the most likely setup and runtime issues in v1.

## Symptom: MCP Tools Not Visible

Checks:

- Confirm MCP server command is registered in Codex.
- Confirm server process starts without immediate exit.
- Confirm tool names match spec in `docs/mcp-api-spec.md`.

Actions:

- Re-run MCP registration command.
- Start server manually and inspect startup logs.
- Validate configuration file paths.

## Symptom: `save_memory` Fails With Policy Error

Checks:

- Input text may contain blocked secret-like patterns.
- Policy filter may be too strict for current content.

Actions:

- Remove credential-like strings from payload.
- Move sensitive values to external secure storage.
- Review policy rules and false-positive cases.

## Symptom: `search` Returns No Results

Checks:

- No entries have been saved yet.
- Query text does not match indexed content.
- Project filter excludes available entries.

Actions:

- Save a known test entry, then search for an exact phrase.
- Retry without optional filters.
- Verify FTS index exists and migrations completed.

## Symptom: `timeline` Returns Empty Items

Checks:

- Anchor ID does not exist.
- Anchor exists but has no nearby entries.

Actions:

- Confirm anchor ID via `search` first.
- Increase `depth_before` and `depth_after`.
- Save additional contextual entries for richer timelines.

## Symptom: Data Lost After Restart

Checks:

- DB path points to temporary or wrong directory.
- Process runs with different working directory/config.

Actions:

- Set explicit `MEMORY_DB_PATH` (or fallback `CODEX_MEM_DB_PATH`).
- Use a stable project-local `.memory/` path.
- Confirm file permissions for DB directory.

## Symptom: Migration Failure On Startup

Checks:

- Existing DB has incompatible schema state.
- Migration scripts are missing or out of order.

Actions:

- Run migration command directly and inspect error output.
- Backup DB, then re-run from clean baseline if needed.
- Add a migration repair note in `docs/session-log.md`.

## Symptom: Slow Search Performance

Checks:

- Missing or invalid FTS index.
- Query pattern forces full scan.
- Entry volume exceeds expected baseline.

Actions:

- Verify index creation migration ran successfully.
- Test with smaller scoped queries.
- Profile query execution and add supporting indexes.

## Debug Checklist

- Confirm runtime and dependency versions.
- Confirm DB path and writable permissions.
- Confirm migrations are up to date.
- Confirm tool payloads match `docs/mcp-api-spec.md`.
- Confirm errors are captured in structured logs.

## Escalation Rule

If an issue repeats three times without root cause:

1. Document exact repro steps in `docs/session-log.md`.
2. Add a focused test that reproduces the failure.
3. Record mitigation decision in `docs/decisions.md` if architecture changes are required.
