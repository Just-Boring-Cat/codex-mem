# Auto Mode Guide

## Purpose

Document the highest-automation workflow currently available for `codex-mem`.

## Command Surface

Main wrapper:

```bash
npm run auto:mode -- <command> [options]
```

Available commands:

- `start`: optional ingest + recent memory bootstrap
- `end`: save session handoff entry
- `commit`: capture latest git commit into memory
- `install-hook`: install post-commit hook

## Session Start

```bash
npm run auto:mode -- start --project codex-mem --ingest --limit 8
```

Behavior:

1. Optionally runs `npm run ingest`.
2. Runs `npm run auto:bootstrap` to print recent entries.

## Session End

```bash
npm run auto:mode -- end --project codex-mem --summary "Completed retention validation and docs updates."
```

Behavior:

1. Saves an entry with `type=handoff`.
2. Includes the summary text as memory body.

## Commit Capture

```bash
npm run auto:mode -- commit --project codex-mem
```

Behavior:

1. Reads latest git commit metadata and changed file list.
2. Saves a `type=commit` memory entry with `source_ref=git:commit/<hash>`.

## Git Hook Integration

Install once per clone:

```bash
npm run auto:install-hooks -- --project codex-mem
```

Result:

- Installs `.git/hooks/post-commit`.
- Every commit triggers `npm run auto:capture:commit`.
- Hook failure never blocks commits (`|| true` fallback in hook script).

## Dry-Run Preview

```bash
npm run auto:mode -- start --dry-run --ingest --project codex-mem --limit 5
npm run auto:mode -- end --dry-run --summary "Draft handoff"
npm run auto:mode -- commit --dry-run
npm run auto:mode -- install-hook --dry-run --project codex-mem
```

Use dry-run first when onboarding contributors.

## Environment Variables

- `MEMORY_DB_PATH`: target SQLite file path
- `MEMORY_PROJECT_NAME`: default project label for saved entries

The wrapper sets `MEMORY_PROJECT_NAME` for each run when `--project` is provided.

## Current Limits

This mode is not full passive capture of every chat/tool event. It automates common operator actions and git lifecycle capture, while keeping explicit control of what is saved.
