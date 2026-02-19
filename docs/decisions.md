# Decisions Log

## ADR-0001: Build Codex Memory As A Local MCP + SQLite System

**Status**: Accepted  
**Date**: 2026-02-18  
**Deciders**: Project maintainers

### Context

The project objective is to keep useful memory across Codex sessions. We need reliable persistence, fast retrieval, and low operational burden for individual repositories.

### Decision Drivers

- Must work in local-first repository workflows.
- Must support Codex-compatible tool access patterns.
- Must keep setup complexity low for v1.
- Must avoid mandatory cloud dependencies.

### Considered Options

- Option A: Local MCP server with SQLite storage.
- Option B: Remote hosted API with shared cloud database.
- Option C: Flat-file markdown-only memory without database indexing.

### Decision

Use a local MCP server with SQLite and full-text indexing as the v1 architecture.

### Consequences

Good:
- Fast local reads and writes.
- Straightforward install and debug path.
- Strong privacy defaults with local data.

Bad:
- Per-project data silos by default.
- Cross-device sync is not automatic.

Mitigations:
- Keep export/import paths available for future sync strategy.

---

## ADR-0002: Use Progressive Retrieval To Control Token Cost

**Status**: Accepted  
**Date**: 2026-02-18  
**Deciders**: Project maintainers

### Context

Memory systems can become expensive and noisy if full records are always loaded. We need a retrieval strategy that remains efficient as memory volume grows.

### Decision

Use a staged retrieval flow:

1. Search compact index results.
2. Inspect timeline around selected results.
3. Fetch full details only for chosen IDs.

### Consequences

Good:
- Better token efficiency and lower prompt clutter.
- Improved control over what context is expanded.

Bad:
- Requires one extra tool call in many workflows.

Mitigations:
- Make tool naming and usage patterns explicit in docs and skills.

---

## ADR-0003: Manual-First Capture, Automation Later

**Status**: Accepted  
**Date**: 2026-02-18  
**Deciders**: Project maintainers

### Context

Full lifecycle hook parity with Claude-style plugins is not guaranteed in Codex workflows. Over-automating early may reduce reliability and increase complexity.

### Decision

Start with explicit save and retrieval tools in v1, then add guarded automation from known project artifacts in later milestones.

### Consequences

Good:
- Predictable behavior in v1.
- Clear privacy and policy boundaries.

Bad:
- Some useful context may not be captured automatically at first.

Mitigations:
- Document memory capture habits and ingestion targets from the start.

---

## ADR-0004: Standardize v1 Runtime on TypeScript + Node.js

**Status**: Accepted  
**Date**: 2026-02-18  
**Deciders**: Project maintainers

### Context

Implementation was blocked by an unresolved runtime choice between TypeScript and Python. Setup docs and kickoff prerequisites still reflected both options.

### Decision Drivers

- Need a single stack to start milestone 2 immediately.
- Strong MCP and JSON contract ergonomics.
- Existing technical design already aligns with TypeScript module layout.
- Desire to minimize context switching during v1 delivery.

### Considered Options

- Option A: TypeScript + Node.js 20+
- Option B: Python 3.11+

### Decision

Use TypeScript + Node.js 20+ as the v1 implementation runtime.

### Consequences

Good:
- One unambiguous setup and tooling path.
- Better alignment with planned module structure.
- Clear contract-first development experience.

Bad:
- Python path is deferred for v1.
- Some contributors may need TypeScript onboarding.

Mitigations:
- Keep MCP contract language-agnostic.
- Reassess Python path after v1 stabilization.

---

## ADR-0005: Use Runtime-Only Vulnerability Gating For v1 Release

**Status**: Accepted  
**Date**: 2026-02-19  
**Deciders**: Project maintainers

### Context

Security checks identified `npm audit` high findings in transitive development-tool dependencies (`eslint` and `typescript-eslint` dependency chain). Current automated remediation path requires forced breaking dependency changes that are not acceptable during v1 stabilization.

At the same time, runtime dependencies currently report zero high vulnerabilities when dev dependencies are excluded.

### Decision Drivers

- Must keep release blocking focused on runtime security risk.
- Must avoid destabilizing lint/type/test toolchain during v1 hardening.
- Must keep full vulnerability visibility, including dev tooling.
- Must record explicit risk acceptance, not silent bypass.

### Considered Options

- Option A: Force-upgrade or force-downgrade to clear all `npm audit` findings immediately.
- Option B: Block release only on runtime dependency vulnerabilities and track dev-tool findings as accepted temporary risk.
- Option C: Ignore audit checks until after v1.

### Decision

Adopt Option B for v1:

1. Release gate uses runtime-only audit (`npm run audit:prod`) and must pass.
2. Full audit (`npm run audit:all`) remains mandatory for visibility and tracking.
3. Known dev-tool vulnerability findings are accepted as temporary v1 risk and reviewed post-v1 stabilization.

### Consequences

Good:
- Keeps production risk gating strict and actionable.
- Avoids unstable forced changes in core dev tooling during v1.
- Preserves visibility into all vulnerabilities.

Bad:
- Dev dependency audit remains noisy until follow-up remediation work.
- Requires discipline to revisit accepted findings.

Mitigations:
- Record this policy in security and operations docs.
- Add explicit post-v1 follow-up task to revisit toolchain dependency strategy.
