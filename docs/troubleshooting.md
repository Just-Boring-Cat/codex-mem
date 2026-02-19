# Troubleshooting

## Purpose

Provide fast diagnostics for the most common setup and runtime failures.

## Symptom: MCP Server Connects but No Tools Appear

Checks:

- Confirm transport is `STDIO`.
- Confirm command is `npm`.
- Confirm arguments are exactly:
  - `run`
  - `mcp:start`
  - `--silent`
- Confirm working directory points to this repository root.

Actions:

- Re-save MCP config and reconnect.
- Run `npm run mcp:start` manually in terminal to verify startup.
- Confirm dependencies installed: `npm install`.

## Symptom: MCP Connection Fails Immediately

Checks:

- Invalid working directory.
- Missing dependencies.
- Node/npm not available in extension process environment.

Actions:

- Set absolute working directory path.
- Run `node -v` and `npm -v` in same shell profile used by VS Code.
- Reinstall dependencies and retry.

## Symptom: Data Not Persisting Across Sessions

Checks:

- `MEMORY_DB_PATH` may point to a different file in each session.
- Relative DB path may resolve differently if working directory changed.

Actions:

- Use a stable DB path, recommended `.memory/codex-mem.db`.
- Keep working directory fixed to repo root.
- For strict safety, use an absolute DB path.

## Symptom: `save_memory` Fails with `POLICY_BLOCKED`

Checks:

- Payload likely includes a secret-like token pattern.

Actions:

- Remove credential-like values from payload.
- Store sensitive material in a secret manager, not memory DB.
- Save a sanitized summary instead.

## Symptom: `search` Returns Nothing

Checks:

- No entries saved yet.
- Query is too narrow.
- Incorrect `project` filter.

Actions:

- Save a known marker entry and search exact marker.
- Retry without `project` and `type` filters.
- Run `npm run ingest` to populate docs-based memory.

## Symptom: `timeline` Returns `ENTRY_NOT_FOUND`

Checks:

- Anchor ID does not exist in current DB.

Actions:

- Retrieve anchor ID from a fresh `search` call.
- Confirm you are using the same `MEMORY_DB_PATH` as during save.

## Symptom: Migration Failure

Checks:

- Corrupt DB state.
- File permissions issue.
- Interrupted prior migration.

Actions:

- Backup DB file first.
- Re-run `npm run migrate` and capture exact error.
- If needed, restore from backup and retry.

## Symptom: Retention Dry-Run Error `INVALID_ARGUMENT`

Checks:

- Both `max_age_days` and `max_entries_per_project` missing.

Actions:

- Provide at least one rule:
  - `max_age_days > 0`
  - or `max_entries_per_project > 0`

## Fast Recovery Checklist

1. `npm install`
2. `export MEMORY_DB_PATH=.memory/codex-mem.db`
3. `npm run migrate`
4. `npm run mcp:start`
5. Reconnect MCP in Codex
6. Run save/search/get_entries smoke flow

## Escalation Rule

If issue repeats three times without root cause:

1. Record exact repro in `docs/session-log.md`.
2. Add or update a test that reproduces the issue.
3. Capture decision or mitigation in `docs/decisions.md`.
