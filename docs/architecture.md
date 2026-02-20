# Architecture

## Architecture Style

- Style: Modular monolith with clear component boundaries.
- Runtime shape: Local process MCP server plus local storage.
- Extension model: Additive modules for ingestion and ranking without core rewrites.

## Hosting and Deployment

- Preferred platform: Local developer machine, per-project installation.
- Environments: Dev (local repository workspace), Test (local automated test runner), Prod (N/A for v1, local tool).

## Core Components

- MCP Interface: Exposes memory tools for search, timeline, fetch, and save.
- Memory Service: Validates inputs, enforces policy, orchestrates persistence and retrieval.
- Storage Layer: SQLite with full-text search index and migration support.
- Ingestion Layer: Parses selected project docs and logs into normalized memory entries.
- Policy Layer: Applies exclusion, redaction, and retention rules before storage.
- Wrapper Agent (planned): Captures session events, extracts durable context, and writes approved entries automatically.

## Data Flow Summary

- Save Flow: Client calls memory tool, service validates and normalizes, policy filters, storage persists, index updates.
- Search Flow: Client submits query, storage returns compact ranked index, user or agent selects IDs, detail fetch returns full entries.
- Ingestion Flow: Ingestion layer reads configured sources, transforms to normalized entries, policy applies filters, service persists results.
- Wrapper Capture Flow (planned): Session events enter wrapper, extractor proposes candidates, policy and dedupe gates run, approved entries are written with audit metadata.

## Diagram

- Mermaid diagram: `docs/architecture-diagram.mmd`

## Interface Contracts (v1)

- `search(query, filters, limit)` returns compact entries and IDs.
- `timeline(anchor_id, depth_before, depth_after)` returns chronological neighbors.
- `get_entries(ids)` returns full memory payloads.
- `save_memory(text, metadata)` stores normalized memory record.

## Security and Privacy

- Local storage by default, no mandatory external telemetry.
- Policy layer blocks known sensitive patterns before persistence.
- Sources and write paths are explicit, no hidden background writes in v1.

## Risks and Tradeoffs

- Risk: Manual-first capture may miss useful context.
- Tradeoff: Higher reliability and clearer privacy boundaries in v1.

- Risk: Wrapper capture can create noisy entries if thresholds are weak.
- Tradeoff: Better session continuity with tuneable policies and audit logs before full automatic mode.

- Risk: Keyword-only retrieval may miss semantic matches.
- Tradeoff: Lower complexity and easier debugging, semantic search deferred.

- Risk: Schema churn early in project.
- Tradeoff: Keep migration system lightweight and versioned from first implementation.
