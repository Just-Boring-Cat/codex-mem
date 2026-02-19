# Data Model

## Entities

- `projects`
- Fields: `id`, `name`, `root_path`, `created_at`, `updated_at`
- Owner: memory service
- Lifecycle: created on first use, updated when metadata changes

- `sessions`
- Fields: `id`, `project_id`, `session_key`, `started_at`, `ended_at`, `source`
- Owner: memory service
- Lifecycle: created at session start, closed at session end

- `entries`
- Fields: `id`, `project_id`, `session_id`, `title`, `body`, `entry_type`, `source_ref`, `created_at`
- Owner: memory service
- Lifecycle: created from manual save or ingestion, optionally archived by retention policy

- `entry_metadata`
- Fields: `entry_id`, `key`, `value`
- Owner: memory service
- Lifecycle: inserted with entry, mutable for enrichment and corrections

- `entry_links`
- Fields: `id`, `from_entry_id`, `to_entry_id`, `relation_type`
- Owner: memory service
- Lifecycle: created during timeline stitching or manual linking

- `ingestion_events`
- Fields: `id`, `project_id`, `source_type`, `source_path`, `status`, `processed_at`, `error_text`
- Owner: ingestion layer
- Lifecycle: append-only event log for ingestion operations

## Relationships

- `projects` -> `sessions` (one-to-many)
- `projects` -> `entries` (one-to-many)
- `sessions` -> `entries` (one-to-many)
- `entries` -> `entry_metadata` (one-to-many)
- `entries` -> `entry_links` (many-to-many through link table)
- `projects` -> `ingestion_events` (one-to-many)

## Diagram

- Mermaid diagram: `docs/data-model-diagram.mmd`

## Query and Indexing Notes

- Full-text index on `entries.title` and `entries.body`.
- Composite index on `entries(project_id, created_at)`.
- Filter indexes on `entries(entry_type)` and `sessions(session_key)`.
- Optional future semantic index can be added without replacing FTS baseline.

## Sensitive Data

- Potentially sensitive categories: Credentials, API keys, private customer data, and internal secrets.
- Storage rules: Reject obvious secret patterns before write, allow explicit exclusion tags, and keep data local unless export is explicitly enabled.
- Retention considerations: Support configurable max age and max entry count per project, and keep deletion and compaction operations auditable via event records.

## Notes

- v1 favors normalization that supports reliability and query speed.
- Schema is designed for incremental extension instead of early overfitting.
