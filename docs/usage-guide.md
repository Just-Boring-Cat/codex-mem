# Usage Guide

## Purpose

Define the standard operator workflow for saving, searching, and retrieving memory across Codex sessions.

## Recommended Workflow

1. Save important context during implementation.
2. Run docs ingestion when project docs have meaningful updates.
3. Search index results first.
4. Use timeline to inspect nearby context.
5. Fetch full details only for selected IDs.

This keeps memory retrieval efficient and avoids unnecessary context expansion.

## Ingestion Command

Run:

```bash
npm run ingest
```

Default sources:

- `docs/session-log.md`
- `docs/decisions.md`
- `docs/requirements.md`

Behavior:

- Imports content with source attribution metadata.
- Dedupes entries by source path and content hash.

## Retention Dry-Run

Run:

```bash
RETENTION_MAX_AGE_DAYS=30 RETENTION_MAX_ENTRIES_PER_PROJECT=200 npm run retention:dry-run
```

Environment inputs:

- `RETENTION_MAX_AGE_DAYS`: mark entries older than N days as candidates.
- `RETENTION_MAX_ENTRIES_PER_PROJECT`: mark entries beyond newest N per project as candidates.
- `RETENTION_PROJECT` (optional): limit analysis to one project.

Behavior:

- Does not delete any entries.
- Writes an audit record in `retention_audit_events`.
- Returns JSON report with candidate IDs and reason counts.

## Tool Usage

## `save_memory`

Use when:

- You make a key decision.
- You discover a non-obvious fix.
- You identify a reusable constraint or pattern.

Input pattern:

```json
{
  "text": "PostToolUse hook equivalent is unavailable in Codex, using manual capture in v1.",
  "title": "Codex hook limitation",
  "type": "architecture",
  "source_ref": "docs/decisions.md"
}
```

## `search`

Use when:

- You need prior context for a feature, bug, or decision.

Input pattern:

```json
{
  "query": "manual capture v1",
  "limit": 20
}
```

## `timeline`

Use when:

- You have an anchor entry ID and need surrounding context.

Input pattern:

```json
{
  "anchor_id": "entry_123",
  "depth_before": 3,
  "depth_after": 3
}
```

## `get_entries`

Use when:

- You have filtered IDs and need complete details.

Input pattern:

```json
{
  "ids": ["entry_123", "entry_456"]
}
```

## `ingest_docs`

Use when:

- Project docs changed and memory should be refreshed from source files.

Input pattern:

```json
{
  "project": "codex-mem",
  "sources": ["docs/session-log.md", "docs/decisions.md", "docs/requirements.md"]
}
```

## `retention_dry_run`

Use when:

- You want retention candidate visibility without deleting anything.

Input pattern:

```json
{
  "project": "codex-mem",
  "max_entries_per_project": 200
}
```

## Capture Guidelines

- Prefer concise, factual entries.
- Include source references where possible.
- Store decisions, constraints, and fixes, not noisy raw logs.
- Avoid secrets, credentials, and personal data.

## Query Guidelines

- Start broad with `search`.
- Narrow by project/type where supported.
- Batch detail fetch calls instead of one-by-one retrieval.
- Add new memory entries if an important result is missing.

## Session Handoff Pattern

At end of session:

1. Save major decisions and unresolved questions.
2. Update `docs/session-log.md`.
3. Save any operational gotchas discovered.

At next session start:

1. Search recent work topics.
2. Pull timeline around most relevant entries.
3. Fetch full details for selected IDs and continue execution.
