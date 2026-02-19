# Runtime Decision

## Decision Summary

- Selected runtime for v1: TypeScript on Node.js 20+.
- Packaging: npm.
- Database: SQLite 3 with migration scripts.

## Context

The project needed one implementation stack to unblock milestone 2 and remove ambiguity in setup and scaffolding.

## Options Considered

- Option A: TypeScript + Node.js
- Option B: Python

## Decision Drivers

- MCP server ecosystem and tooling maturity for TypeScript.
- Strong JSON and schema-validation ergonomics for tool contracts.
- Alignment with proposed repository layout already documented.
- Lower friction for publishing and CLI wiring in Codex-oriented workflows.

## Decision

Use TypeScript + Node.js 20+ for v1 implementation.

## Consequences

Good:

- Faster implementation start with existing plan structure.
- Clear single setup path for contributors.
- Strong typing support for MCP request and response contracts.

Bad:

- Python path documentation and examples are deferred.
- Team members preferring Python need onboarding to TypeScript stack.

Mitigations:

- Keep contracts language-agnostic in `docs/mcp-api-spec.md`.
- Revisit polyglot support after v1 stabilization.

## Implementation Directives

- Default commands:
- `npm install`
- `npm run migrate`
- `npm run mcp:start`

- Minimum environment:
- Node.js 20+
- SQLite 3

## Deferred Items

- Python implementation path.
- Cross-runtime compatibility test matrix.
