# Contributing

Thanks for contributing to `codex-mem`.

## Development Setup

```bash
npm install
npm run migrate
```

## Validation Before PR

```bash
npm run lint
npm run typecheck
npm test
npm run audit:prod
```

## Recommended Workflow

1. Add or update tests first when behavior changes.
2. Keep changes scoped and commit in logical batches.
3. Update docs when commands, APIs, or behavior change.
4. Avoid logging raw sensitive payload data.

## Test Layout

- `tests/unit/`: isolated logic and error-path behavior
- `tests/integration/`: storage, migrations, and service flows
- `tests/contracts/`: MCP tool contract coverage
- `tests/performance/`: baseline latency checks

## Pull Request Notes

Include:

- What changed
- Why it changed
- How you tested it
- Any migration or operational impact

