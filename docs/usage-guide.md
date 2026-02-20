# Usage Guide

## Purpose

Define the recommended operating workflow for memory capture and retrieval across Codex sessions.

## Daily Workflow

1. Save important decisions, fixes, and constraints with `save_memory`.
2. Use `search` first for low-cost retrieval.
3. Use `timeline` around promising entries.
4. Use `get_entries` only for selected IDs.
5. Periodically run `ingest_docs` for project docs.

This keeps memory useful and context size under control.

## Automatic Mode (Recommended)

Use the automation wrapper for repeatable start/end/session capture:

```bash
npm run auto:mode -- start --project codex-mem --ingest
npm run auto:mode -- end --project codex-mem --summary "Finished contract tests and docs update."
npm run auto:mode -- commit --project codex-mem
```

Commands:

- `start`: optional ingestion plus recent memory bootstrap
- `end`: stores a handoff entry (`type=handoff`)
- `commit`: stores latest git commit context (`type=commit`)
- `install-hook`: installs `.git/hooks/post-commit` integration

Direct CLI equivalents:

```bash
npm run auto:bootstrap -- --project codex-mem --limit 8
npm run auto:save -- --type handoff --project codex-mem --text "Handoff summary"
npm run auto:capture:commit -- --project codex-mem
```

## Tool Patterns

### `save_memory`

Use for high-value context only.

Example payload:

```json
{
  "text": "Auth bug fixed by sending X-API-Key header in edge middleware.",
  "title": "Auth header requirement",
  "project": "codex-mem",
  "type": "bugfix",
  "source_ref": "docs/session-log.md",
  "metadata": { "area": "auth" }
}
```

### `search`

Start broad, then refine by `project` or `type`.

```json
{
  "query": "auth header",
  "project": "codex-mem",
  "limit": 20,
  "offset": 0
}
```

### `timeline`

Use around an anchor ID returned from search.

```json
{
  "anchor_id": "<entry-id>",
  "depth_before": 3,
  "depth_after": 3
}
```

### `get_entries`

Fetch full details in batch.

```json
{
  "ids": ["<entry-id-1>", "<entry-id-2>"]
}
```

### `ingest_docs`

Use when docs changed and should be captured.

```json
{
  "project": "codex-mem",
  "sources": [
    "docs/session-log.md",
    "docs/decisions.md",
    "docs/requirements.md"
  ],
  "entry_type": "ingestion"
}
```

Behavior:

- Dedupes by `source_ref + content_hash`
- Repeated ingestion of unchanged files yields duplicates, not new entries

### `retention_dry_run`

Use to inspect cleanup candidates safely.

```json
{
  "project": "codex-mem",
  "max_age_days": 30,
  "max_entries_per_project": 200
}
```

Behavior:

- No deletion
- Returns counts and candidate IDs
- Records audit event for traceability

## Capture Quality Guidelines

Save entries that are likely useful later:

- Architecture decisions
- Non-obvious bug fixes
- Integration constraints
- Production runbook findings

Avoid saving:

- Raw noisy logs
- Temporary dead-end experiments
- Secrets or personal sensitive data

## Cross-Session Handoff Pattern

At end of session:

1. Save key outcomes and open questions.
2. Update `docs/session-log.md`.
3. Optionally run `ingest_docs` if docs changed substantially.

At start of next session:

1. Search for recent topic markers.
2. Use timeline around best match.
3. Fetch full details for 2-5 relevant IDs.

## Manual Verification Prompt Pack

Use these prompts in Codex when verifying MCP wiring:

1. `Use save_memory to save text "usage-check-<timestamp>" under project "manual-check".`
2. `Use search with query "usage-check-<timestamp>" and project "manual-check".`
3. `Use get_entries with the id from the previous result.`
4. `Use timeline around that id with depth_before=1 and depth_after=1.`

If all succeed, the operator workflow is healthy.
