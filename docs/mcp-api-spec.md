# MCP API Spec (v1)

## Purpose

Define the external tool contract for Codex memory operations.

## API Style

- Interface type: MCP tools.
- Versioning strategy: `v1` contract documented in this file; non-backward-compatible changes require `v2` tool schema updates.
- Response shape: Deterministic JSON objects with explicit status and payload fields.

## Common Types

```json
{
  "Error": {
    "code": "INVALID_ARGUMENT | POLICY_BLOCKED | ENTRY_NOT_FOUND | STORAGE_FAILURE | MIGRATION_FAILURE",
    "message": "string",
    "details": "object|null"
  }
}
```

```json
{
  "EntryIndexItem": {
    "id": "string",
    "title": "string",
    "entry_type": "string",
    "project": "string",
    "created_at": "string",
    "score": "number"
  }
}
```

```json
{
  "EntryDetailItem": {
    "id": "string",
    "title": "string",
    "body": "string",
    "entry_type": "string",
    "project": "string",
    "session_id": "string|null",
    "source_ref": "string|null",
    "metadata": "object",
    "created_at": "string"
  }
}
```

## Tool: `save_memory`

- Purpose: Save a normalized memory entry.
- Input:

```json
{
  "text": "string (required)",
  "title": "string (optional)",
  "project": "string (optional)",
  "type": "string (optional)",
  "source_ref": "string (optional)",
  "metadata": "object (optional)"
}
```

- Success response:

```json
{
  "status": "saved",
  "id": "string",
  "created_at": "string"
}
```

## Tool: `search`

- Purpose: Return compact ranked index items.
- Input:

```json
{
  "query": "string (required)",
  "project": "string (optional)",
  "type": "string (optional)",
  "limit": "number (optional, default 20, max 100)",
  "offset": "number (optional, default 0)"
}
```

- Success response:

```json
{
  "items": ["EntryIndexItem"],
  "total": "number",
  "limit": "number",
  "offset": "number"
}
```

## Tool: `timeline`

- Purpose: Return chronological context around one entry.
- Input:

```json
{
  "anchor_id": "string (required)",
  "depth_before": "number (optional, default 3, max 20)",
  "depth_after": "number (optional, default 3, max 20)"
}
```

- Success response:

```json
{
  "anchor_id": "string",
  "items": ["EntryIndexItem"]
}
```

## Tool: `get_entries`

- Purpose: Fetch full details for selected IDs.
- Input:

```json
{
  "ids": ["string (required, 1-200 items)"]
}
```

- Success response:

```json
{
  "items": ["EntryDetailItem"]
}
```

## Tool: `ingest_docs`

- Purpose: Ingest selected project docs into memory with source/hash dedupe.
- Input:

```json
{
  "project": "string (optional, defaults to configured project)",
  "sources": ["string (optional paths, default: session-log/decisions/requirements docs)"],
  "entry_type": "string (optional, default: ingestion)"
}
```

- Success response:

```json
{
  "processed_sources": "number",
  "imported_entries": "number",
  "duplicate_entries": "number",
  "skipped_sources": ["string"]
}
```

## Tool: `retention_dry_run`

- Purpose: Evaluate retention candidates without deleting data.
- Input:

```json
{
  "now": "string (optional ISO timestamp)",
  "max_age_days": "number (optional, > 0)",
  "max_entries_per_project": "number (optional, > 0)",
  "project": "string (optional)"
}
```

- Success response:

```json
{
  "mode": "dry-run",
  "executed_at": "string",
  "total_candidates": "number",
  "by_reason": {
    "age": "number",
    "project_count": "number"
  },
  "candidate_ids": ["string"]
}
```

## Error Behavior

- All tools return structured errors with `code`, `message`, and optional `details`.
- Validation and policy errors do not mutate storage state.
- Storage and migration failures include request-safe diagnostics only.

## Pagination and Limits

- `search` supports `limit` and `offset`.
- `get_entries` should batch IDs; avoid repeated one-by-one fetches.
- `timeline` depth parameters are capped to protect latency.

## Compatibility Rules

- Additive fields are allowed in responses.
- Field removals or type changes require new major contract version.
- Unknown client input fields should be ignored unless they conflict with reserved names.
