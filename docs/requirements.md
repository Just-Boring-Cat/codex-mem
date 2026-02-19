# Requirements

## Problem and Goal

- Problem: Codex sessions do not reliably retain project context across separate sessions.
- Goal: Preserve useful project memory so future Codex sessions can recover context quickly with controlled token usage.
- Success outcome: Reduced repeated onboarding work per session and faster continuation of prior tasks.

## Target Users

- Primary: Solo developer working on long-running projects with multiple sessions.
- Secondary: Small teams sharing repository-level planning and decision history.
- Operator: Project maintainer configuring memory behavior and privacy rules.

## Core User Journeys

- Resume Work: Start a new session, retrieve relevant prior context, continue implementation.
- Investigate History: Search prior decisions, fixes, and constraints by topic.
- Save Important Context: Store high-value notes during work for later retrieval.
- Review Decision Trail: Audit what was decided and why across project changes.

## Must-Have Features (v1)

- Local-first memory store persisted per project.
- Queryable memory retrieval through Codex-compatible MCP tools.
- Progressive retrieval pattern where search index is used first and full details are fetched only for selected entries.
- Explicit memory write path (`save_memory` equivalent).
- Structured metadata for project, date, category, and source.
- Privacy controls for excluding sensitive notes from storage.
- Documentation-first operating model with decision and session logs.

## Nice-to-Have Features (Later)

- Hybrid semantic and keyword ranking.
- Automatic ingestion from commits and project logs with filters.
- Lightweight web or terminal memory viewer.
- Cross-project memory federation with explicit opt-in.

## Non-Goals (v1)

- Full parity with Claude Code plugin hook lifecycle.
- Cloud-hosted multi-tenant memory service.
- Autonomous background agents that modify project files.

## Success Criteria

- Time-to-context on new session reduced to under 2 minutes.
- At least 80 percent of resumed tasks find relevant prior context in first search.
- Memory retrieval flow stays token-efficient via index-before-detail pattern.
- No sensitive data leakage from excluded content rules in baseline tests.

## Constraints

- Platform: Must work with Codex workflows and local repository tooling.
- Data location: Local project scope by default.
- Compliance: Avoid copying AGPL-protected implementation into this codebase.
- Delivery: Build in stages, MVP first, advanced retrieval later.

## Assumptions

- MCP integration is available for external memory tools.
- Project documentation files remain canonical inputs for memory capture.
- Users accept explicit memory operations in v1 before full automation.

## Open Questions

- Should retention be time-based, size-based, or both?
- Should memory include raw tool output or only normalized summaries?
- What minimum redaction rules are mandatory before storage?
