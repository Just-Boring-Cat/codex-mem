# Test Strategy

## Goals

- Verify memory persistence and retrieval correctness.
- Prevent regressions in query behavior and policy filters.
- Keep test execution fast enough for frequent local runs.

## Test Levels

## Unit Tests

- Storage normalization and validation logic.
- Policy filters and redaction checks.
- Query builder logic for search and timeline.
- Migration helper behavior.

## Integration Tests

- SQLite schema initialization and migration upgrades.
- End-to-end tool flow:
- `save_memory` -> `search` -> `get_entries`
- `save_memory` (multiple) -> `timeline`
- Ingestion path from project docs into entries.

## Contract Tests

- MCP tool input/output schema validation.
- Error responses for invalid args and unknown IDs.
- Stable ID handling across retrieval calls.

## Regression Tests

- Duplicate entry prevention behavior.
- Timeline ordering correctness.
- Secret-pattern blocking and exclusion-tag behavior.

## Test Data

- Seeded fixtures for:
- Simple notes
- Decision records
- Session summaries
- Edge content with possible secret-like tokens

- Include malformed and oversized payloads for negative testing.

## Execution Plan

- Fast path (pre-commit): unit + critical integration tests.
- Full path (CI/local full run): all unit, integration, and contract tests.
- Migration path: run upgrade tests from at least one prior schema version.

## Exit Criteria

- All critical-path tests pass.
- No high-severity policy failures.
- Retrieval behavior matches MVP acceptance criteria.
- Known open defects are documented with workaround and scope impact.

## Initial Test Matrix

- Persistence:
- Save entry, restart process, retrieve same entry.

- Search:
- Query returns compact index with expected IDs and rank ordering.

- Timeline:
- Anchor entry returns neighboring records in correct chronological order.

- Details:
- Batch `get_entries` returns complete payloads with metadata.

- Policy:
- Seeded secret strings are blocked before DB write.

- Ingestion:
- Selected docs are imported with source references and dedupe behavior.
