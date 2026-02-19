# Session Log

## 2026-02-18

### Summary

- Defined planning-first documentation baseline for the Codex memory project.
- Established requirements, architecture, data model, delivery plan, and ADR seed.
- Set clear v1 boundary: local MCP + SQLite with progressive retrieval.

### Decisions

- Use local-first architecture for v1.
- Use index-first retrieval to control token cost.
- Start manual-first capture and add automation in later milestones.

### Open Questions

- Final retention strategy for old memory entries.
- Minimum redaction and secret-detection rules for ingestion.
- Exact source set for automated ingestion in milestone 3.

### Next Steps

- Validate docs with maintainers and close open questions.
- Start MVP implementation scaffolding for MCP server and storage schema.
- Add initial test strategy document for retrieval and policy behavior.

## 2026-02-18 (Planning Expansion)

### Summary

- Added implementation-planning docs: MVP spec and test strategy.
- Added architecture and data model Mermaid diagrams.
- Linked new docs into the documentation map and relevant architecture/data docs.

### Decisions

- Keep diagrams as separate Mermaid files for easy review and updates.
- Treat `mvp-spec.md` as implementation handoff contract for milestone 2.
- Treat `test-strategy.md` as quality gate contract for milestone 4.

### Open Questions

- Which test framework and language runtime will be the default for MVP implementation?
- Should ingestion in MVP run manually via command only, or include scheduled/triggered mode?

### Next Steps

- Confirm implementation stack (language and packaging).
- Create technical design for MCP server commands and storage migrations.
- Start implementation scaffolding after stack decision is finalized.

## 2026-02-18 (Implementation Docs Expansion)

### Summary

- Added technical design, MCP API spec, and implementation kickoff docs.
- Mapped tool contracts to structured request and response models.
- Defined sprint-level implementation sequencing for milestone 2 onward.

### Decisions

- Keep MCP contracts versioned in a dedicated doc.
- Keep technical design separate from MVP scope to reduce document churn.
- Use implementation-kickoff doc as coding readiness gate.

### Open Questions

- Final runtime stack choice (TypeScript or Python) for first implementation.
- Pagination defaults for future large-scale timeline retrieval behavior.

### Next Steps

- Choose runtime stack and lock initial repository module layout.
- Start code scaffolding aligned with `docs/technical-design.md`.
- Begin contract-first implementation using `docs/mcp-api-spec.md`.

## 2026-02-18 (Operational Docs Expansion)

### Summary

- Added setup, usage, and troubleshooting documentation.
- Defined runtime-agnostic startup paths and MCP wiring guidance.
- Added common failure diagnostics and escalation rules.

### Decisions

- Keep setup guide runtime-agnostic until implementation stack is finalized.
- Keep usage guide focused on progressive retrieval workflow.
- Keep troubleshooting action-oriented with direct symptom-to-fix mapping.

### Open Questions

- Final runtime-specific commands after stack selection.
- Which policy false-positive patterns should be explicitly documented first.

### Next Steps

- Finalize runtime selection and collapse setup guide to one primary path.
- Add concrete command examples once scaffold scripts exist.
- Start implementation scaffolding using kickoff and technical design docs.

## 2026-02-18 (Security and Ops Docs Expansion)

### Summary

- Added security baseline and operations runbook documentation.
- Linked new docs into the project doc map and implementation/release references.
- Extended release and implementation checklists with security and runbook expectations.

### Decisions

- Keep security controls explicit in a dedicated baseline doc.
- Keep operational procedures centralized in a single runbook.
- Use both docs as pre-release gate references.

### Open Questions

- Whether encryption-at-rest is mandatory for v1 local deployments.
- Whether periodic automated backup should be enabled by default or remain manual.

### Next Steps

- Finalize runtime-specific command paths in setup and runbook docs.
- Add concrete policy rule examples after implementation begins.
- Use runbook procedures during first implementation smoke cycle.

## 2026-02-18 (Runtime Decision Finalization)

### Summary

- Added a dedicated runtime decision doc and finalized v1 on TypeScript + Node.js 20+.
- Added ADR-0004 to record rationale and tradeoffs.
- Updated setup, technical design, and kickoff docs to remove runtime ambiguity.

### Decisions

- Standardize v1 implementation on TypeScript + Node.js + npm.
- Keep Python path deferred until after v1 stabilization.
- Keep contract docs language-agnostic despite runtime choice.

### Open Questions

- Final TypeScript test runner choice for contract and integration suites.
- Which migration library to standardize for forward-only schema changes.

### Next Steps

- Start repository scaffolding for TypeScript runtime.
- Lock test runner and migration library choices in kickoff tasks.
- Proceed with milestone 2 implementation.

## 2026-02-18 (Implementation Kickoff Started)

### Summary

- Initialized TypeScript project runtime, linting, typecheck, and test tooling.
- Implemented local SQLite bootstrap with forward migration `001_initial.sql` and FTS table.
- Implemented core memory service and repository paths for `save_memory`, `search`, `timeline`, and `get_entries`.
- Added MCP server scaffold with tool handlers mapped to the v1 tool contract.
- Added integration tests for schema bootstrap, retrieval flow, timeline behavior, and policy blocking.

### Decisions

- Use `better-sqlite3` for synchronous local-first storage simplicity in v1.
- Use FTS5 external-content table with triggers for index consistency.
- Keep policy enforcement in a dedicated `policy-service` before persistence.
- Support both `MEMORY_DB_PATH` and legacy `CODEX_MEM_DB_PATH` env keys.

### Open Questions

- Whether to keep current lint stack versions with known transitive audit findings or pin alternate versions.
- Whether to add contract tests that invoke MCP tool calls directly instead of service-only integration tests.
- Whether to add ingestion service in the next sprint or complete migration/perf hardening first.

### Next Steps

- Add MCP contract tests for input and error payloads.
- Implement ingestion command for docs and dedupe by content hash.
- Add migration-upgrade and performance tests for 10k-entry search baseline.

## 2026-02-19 (Ingestion and Dedupe Delivery)

### Summary

- Added integration-tested ingestion service for configured project docs.
- Added dedupe behavior by source path and content hash.
- Added CLI ingestion command and npm script (`npm run ingest`).
- Added schema migration `002_content_hash_dedupe.sql` and switched to migration directory loading.

### Decisions

- Keep ingestion source list fixed for v1 command default:
- `docs/session-log.md`
- `docs/decisions.md`
- `docs/requirements.md`
- Record ingestion attempts in `ingestion_events` with imported-count markers.

### Open Questions

- Whether ingestion should be exposed as an MCP tool in v1 or remain CLI-only.
- Whether to split large docs into section-level entries instead of one entry per file.

### Next Steps

- Add migration-upgrade test from prior schema snapshot.
- Add search performance baseline test at 10k entries.
- Add retention dry-run command and logging.

## 2026-02-19 (Migration Upgrade Hardening)

### Summary

- Added integration test coverage for upgrading a legacy `001_initial` SQLite database to current schema.
- Verified migration application includes `002_content_hash_dedupe` and preserves pre-existing entry data.
- Verified post-upgrade dedupe index enforcement for duplicate `(source_ref, content_hash)` values.

### Decisions

- Keep migration-upgrade validation at integration-test level using a real SQLite file fixture seeded from `001_initial.sql`.

### Open Questions

- Whether to add additional upgrade fixtures once schema version `003` and above are introduced.

### Next Steps

- Add search performance baseline test at 10k entries.
- Add retention dry-run command and logging.

## 2026-02-19 (Search Performance Baseline)

### Summary

- Added a performance test for 10k-entry search latency baseline.
- Added dedicated npm script `test:perf` for focused performance validation.
- Verified p95 query latency target under 250ms for selected benchmark query.

### Decisions

- Keep baseline dataset at 10,000 entries with selective keyword distribution.
- Keep performance test in the default suite for now to prevent silent regressions.

### Open Questions

- Whether to move performance tests to a separate CI job if runtime grows with additional benchmarks.

### Next Steps

- Add retention dry-run command and logging.

## 2026-02-19 (Retention Dry-Run and Audit Logging)

### Summary

- Added retention dry-run service with two candidate rules:
- max-age (days)
- max-entries-per-project
- Added retention audit table migration `003_retention_audit_events`.
- Added CLI command `npm run retention:dry-run` with env-based inputs.
- Added integration tests for dry-run behavior and audit-event persistence.

### Decisions

- Keep retention mode as dry-run only for v1, no delete path enabled.
- Persist each dry-run execution in `retention_audit_events` for operational review.

### Open Questions

- Whether to expose retention dry-run as MCP tool in v1, or keep CLI-only.

### Next Steps

- Add storage/malformed input error-path tests.
- Add structured request-id logging for operations.

## 2026-02-19 (Error Paths and Structured Tool Logging)

### Summary

- Added unit tests for malformed input handling and storage failure mapping in `MemoryService`.
- Updated `MemoryService` to map repository-level failures into `STORAGE_FAILURE`.
- Added structured JSON logging utility and wired MCP tool wrappers with request-id, duration, status, and error code logging.

### Decisions

- Keep request-level logs metadata-only, no payload body logging.
- Log `tool_request_start` and `tool_request_end` events for each MCP tool execution.

### Open Questions

- Whether to route structured logs to file sink in v1, or keep stdout/stderr only.

### Next Steps

- Decide dependency audit remediation strategy and document accepted risk/plan in `docs/decisions.md`.
- Optionally expose ingestion/retention operations as MCP tools.

## 2026-02-19 (Dependency Audit Policy Decision)

### Summary

- Added ADR-0005 to define v1 dependency audit gating policy.
- Added runtime and full-audit npm scripts:
- `npm run audit:prod`
- `npm run audit:all`
- Updated security baseline and operations runbook with explicit release-check audit steps.

### Decisions

- Block v1 release on runtime dependency audit only (`audit:prod`).
- Keep full audit visibility (`audit:all`) and track dev-tool findings as temporary accepted risk for v1.

### Open Questions

- Exact remediation path for lint/tooling transitive vulnerabilities after v1.

### Next Steps

- Create follow-up implementation task for post-v1 toolchain remediation.

## 2026-02-19 (MCP Tool Expansion: Ingestion and Retention)

### Summary

- Exposed ingestion workflow as MCP tool `ingest_docs`.
- Exposed retention analysis workflow as MCP tool `retention_dry_run`.
- Extended MCP contract tests to cover both tools and associated error path.
- Updated MCP API and usage docs with new tool contracts.

### Decisions

- Keep CLI commands available and add MCP wrappers for in-session operations.
- Keep retention tool as dry-run only in v1 (no delete endpoint/tool).

### Open Questions

- Whether to require source allowlist enforcement at handler level in addition to service-level defaults.

### Next Steps

- Evaluate whether ingestion should support section-chunking for large docs in v1.1.

## 2026-02-19 (Public Repo Documentation Sync)

### Summary

- Synced refined documentation set into the public `codex-mem` repository.
- Upgraded root README with stronger onboarding, MCP setup, and manual verification guidance.
- Updated setup, usage, troubleshooting, and documentation map for public-facing clarity.

### Decisions

- Keep the public README as primary onboarding document.
- Keep deep technical details in `docs/` and link from README.
- Keep VS Code custom MCP setup explicit with exact field values.

### Open Questions

- Whether to add screenshots/GIFs and badges beyond current set.
- Whether to add `npm run smoke:live` helper command for one-shot manual verification.

### Next Steps

- Gather first external-user feedback on setup clarity.
- Optionally add visual assets for architecture and tool flow.

## 2026-02-19 (README Visual Refresh and Multilingual Entry)

### Summary

- Refreshed public `README.md` with a more visual layout (centered header, badges, nav links).
- Added language navigation for three languages: English, Espanol, German.
- Added localized quick-start pages:
- `docs/i18n/README.es.md`
- `docs/i18n/README.de.md`
- Updated docs map to include i18n entries.

### Decisions

- Keep English README as canonical source and add lightweight localized quick-start pages.
- Keep i18n pages concise until full translated docs are needed.

### Open Questions

- Whether to add a `docs/i18n/README.en.md` mirror file for symmetry.
- Whether to add visual assets (screenshots or GIF) to match hero style further.

### Next Steps

- Collect feedback on readability and language-switch visibility.
- Optionally expand Spanish and German pages into full docs translations.

## 2026-02-19 (README Structure Expansion and Logo Integration)

### Summary

- Reworked public `README.md` to include the requested section structure:
- Quick Start
- Documentation
- How It Works
- MCP Search Tools
- System Requirements
- Contributing
- License
- Added provided project logo image at `docs/public/codex-mem.png` and integrated it as centered hero image.
- Added flag-based language links for English, Spanish, and German.
- Aligned localized i18n pages to the same high-level section rhythm.

### Decisions

- Keep GitHub-native layout (HTML + Markdown) for visual parity without external web assets.
- Keep root README as canonical English source and keep i18n pages concise quick-start variants.

### Open Questions

- Whether to add a product screenshot/GIF preview block below the hero logo.
- Whether to fully translate all docs beyond the quick-start i18n pages.

### Next Steps

- Gather feedback on readability and visual hierarchy.
- Optionally add architecture/data-model rendered images for stronger visual scanability.

## 2026-02-19 (README Top Title, Full Doc Links, About Panel, First Release Prep)

### Summary

- Updated README layout so `codex-mem` title is shown at the top with larger heading priority.
- Kept logo directly below the title for clearer hierarchy.
- Expanded documentation section to include clickable links for all docs in the repository.
- Configured GitHub About metadata (description, homepage, and topics).
- Prepared repository for first release publication with curated notes.

### Decisions

- Keep root README as primary navigation hub for all project documentation.
- Use GitHub About panel to surface concise project value and discovery topics.

### Open Questions

- Whether to add additional i18n files beyond English/Spanish/German.
- Whether to add an animated usage preview under the logo.

### Next Steps

- Publish first tagged release with concise highlights and source archives.

## 2026-02-19 (Premium README Upgrade Across EN/ES/DE)

### Summary

- Added styled wordmark asset `docs/public/codex-mem-wordmark.svg` with gradient and drop shadow.
- Updated top README hero so title lettering is prominent and visually distinct.
- Added explicit `Architecture Design` section with Mermaid diagram to main README.
- Upgraded Spanish and German README pages to near parity with main README structure and depth.
- Expanded EN/ES/DE docs sections to include complete linked document maps.

### Decisions

- Use SVG wordmark for title styling because GitHub README does not support custom CSS/font styling.
- Keep logo below wordmark for clear visual hierarchy and fallback readability.

### Open Questions

- Whether to add rendered architecture/data-model PNG/SVG exports for users who cannot view Mermaid.

### Next Steps

- Collect feedback on readability and localization quality.
- Optionally add additional premium i18n pages (French, Portuguese) after EN/ES/DE review.

## 2026-02-19 (Automated MCP Installer Mirrored to Public Repo)

### Summary

- Added public installer script `scripts/install-mcp.sh` for one-command MCP setup.
- Added npm alias command `npm run mcp:install`.
- Added integration tests for installer help and dry-run behaviors.
- Updated EN/ES/DE README quick-start sections to include automated install flow.
- Updated setup, troubleshooting, and docs map references for installer usage.

### Decisions

- Keep installer registration step best-effort: gracefully skip when Codex CLI is unavailable.
- Keep script option surface minimal: `--name`, `--db-path`, `--no-register`, `--dry-run`.

### Next Steps

- Consider adding a `--force-register` mode if future CLI behavior requires replacement workflows.
