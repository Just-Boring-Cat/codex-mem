# MVP Spec: Codex Memory Engine

## Purpose

Define the first implementable version of the memory system that preserves useful context across Codex sessions with minimal operational complexity.

## Scope

### In Scope (v1)

- Local SQLite storage with schema migrations.
- MCP tools for memory operations:
- `save_memory`
- `search`
- `timeline`
- `get_entries`
- Metadata support for project, session, type, and source.
- Basic policy checks for sensitive content filtering.
- Ingestion from selected project docs:
- `docs/session-log.md`
- `docs/decisions.md`
- `docs/requirements.md`

### Out Of Scope (v1)

- Cloud sync or multi-tenant shared storage.
- Complex vector embedding infrastructure.
- Full automatic tool-capture parity with Claude plugin hooks.
- Dedicated web UI.

## Functional Requirements

- FR-1: System persists memory entries per project and survives process restarts.
- FR-2: `save_memory` stores normalized records with metadata.
- FR-3: `search` returns compact, ranked index entries with stable IDs.
- FR-4: `timeline` returns chronological neighboring records around an anchor.
- FR-5: `get_entries` returns full content for specific IDs.
- FR-6: Ingestion command imports configured docs into memory entries.
- FR-7: Policy checks block known secret patterns before persistence.

## Non-Functional Requirements

- NFR-1: Search response target under 250ms for 10k entries on local machine.
- NFR-2: Operations fail safely and return actionable error messages.
- NFR-3: Data remains local unless explicit export path is executed.
- NFR-4: Migration path is forward-compatible for schema evolution.

## Tool Contracts (MCP)

- `save_memory(text, title?, project?, type?, source_ref?) -> {id, status}`
- `search(query, project?, type?, limit?, offset?) -> {items[]}`
- `timeline(anchor_id, depth_before?, depth_after?) -> {items[]}`
- `get_entries(ids[]) -> {items[]}`

## Storage Contract

- Primary table: `entries`
- Supporting tables: `projects`, `sessions`, `entry_metadata`, `entry_links`, `ingestion_events`
- FTS index over title and body fields for fast keyword retrieval.

## Acceptance Criteria

- AC-1: Manual save and retrieval works across separate Codex sessions.
- AC-2: Search to details flow follows index-first pattern.
- AC-3: Policy filter blocks seeded secret test cases.
- AC-4: Ingestion imports core docs with source attribution.
- AC-5: Basic tests pass for schema, save, search, and timeline behavior.

## Open Items

- Final secret-detection rule set for v1.
- Retention default values (days and max entries).
- Exact sort/ranking behavior for mixed recency and relevance.
