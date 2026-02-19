#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

MODE="${1:-help}"
if [[ $# -gt 0 ]]; then
  shift
fi

DRY_RUN=0
INGEST=0
PROJECT=""
LIMIT="8"
SUMMARY=""

usage() {
  cat <<'USAGE'
Usage: bash scripts/auto-memory.sh <command> [options]

Commands:
  start         Optional ingest + session bootstrap recall
  end           Save a session handoff summary into memory
  commit        Capture latest git commit into memory
  install-hook  Install optional post-commit hook
  help          Show this help

Global options:
  --dry-run     Print commands only, do not execute

start options:
  --ingest              Run "npm run ingest" before bootstrap
  --project <name>      Override project name for this run
  --limit <1-100>       Bootstrap entry limit (default: 8)

end options:
  --summary <text>      Handoff text to save
  --project <name>      Override project name for this run

commit options:
  --project <name>      Override project name for this run

install-hook options:
  --project <name>      Default project for post-commit capture
USAGE
}

log() {
  printf '[auto-memory] %s\n' "$*"
}

print_cmd() {
  local args=("$@")
  if [[ -n "$PROJECT" ]]; then
    printf 'MEMORY_PROJECT_NAME=%q ' "$PROJECT"
  fi
  local arg
  for arg in "${args[@]}"; do
    printf '%q ' "$arg"
  done
}

run_cmd() {
  local args=("$@")
  if [[ "$DRY_RUN" -eq 1 ]]; then
    printf 'DRY RUN: %s\n' "$(print_cmd "${args[@]}")"
    return 0
  fi

  if [[ -n "$PROJECT" ]]; then
    (
      cd "$PROJECT_ROOT"
      MEMORY_PROJECT_NAME="$PROJECT" "${args[@]}"
    )
    return
  fi

  (
    cd "$PROJECT_ROOT"
    "${args[@]}"
  )
}

require_value() {
  local flag="$1"
  local value="${2:-}"
  if [[ -z "$value" ]]; then
    log "Missing value for $flag"
    exit 1
  fi
}

run_start() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --dry-run)
        DRY_RUN=1
        shift
        ;;
      --project)
        require_value "$1" "${2:-}"
        PROJECT="$2"
        shift 2
        ;;
      --ingest)
        INGEST=1
        shift
        ;;
      --limit)
        require_value "$1" "${2:-}"
        LIMIT="$2"
        shift 2
        ;;
      -h|--help)
        usage
        exit 0
        ;;
      *)
        log "Unknown start option: $1"
        usage
        exit 1
        ;;
    esac
  done

  if ! [[ "$LIMIT" =~ ^[0-9]+$ ]] || [[ "$LIMIT" -lt 1 ]] || [[ "$LIMIT" -gt 100 ]]; then
    log "--limit must be an integer between 1 and 100."
    exit 1
  fi

  log "Running start workflow"
  if [[ -n "$PROJECT" ]]; then
    log "Project: $PROJECT"
  fi

  if [[ "$INGEST" -eq 1 ]]; then
    run_cmd npm run ingest
  fi

  local bootstrap_args=(npm run auto:bootstrap -- --limit "$LIMIT")
  if [[ -n "$PROJECT" ]]; then
    bootstrap_args+=(--project "$PROJECT")
  fi
  run_cmd "${bootstrap_args[@]}"
}

run_end() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --dry-run)
        DRY_RUN=1
        shift
        ;;
      --project)
        require_value "$1" "${2:-}"
        PROJECT="$2"
        shift 2
        ;;
      --summary)
        require_value "$1" "${2:-}"
        SUMMARY="$2"
        shift 2
        ;;
      -h|--help)
        usage
        exit 0
        ;;
      *)
        log "Unknown end option: $1"
        usage
        exit 1
        ;;
    esac
  done

  if [[ -z "$SUMMARY" ]]; then
    SUMMARY="Session handoff $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  fi

  local save_args=(
    npm run auto:save -- --type handoff --title "Session handoff" --text "$SUMMARY"
  )
  if [[ -n "$PROJECT" ]]; then
    save_args+=(--project "$PROJECT")
  fi
  run_cmd "${save_args[@]}"
}

run_commit() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --dry-run)
        DRY_RUN=1
        shift
        ;;
      --project)
        require_value "$1" "${2:-}"
        PROJECT="$2"
        shift 2
        ;;
      -h|--help)
        usage
        exit 0
        ;;
      *)
        log "Unknown commit option: $1"
        usage
        exit 1
        ;;
    esac
  done

  local commit_args=(npm run auto:capture:commit)
  if [[ -n "$PROJECT" ]]; then
    commit_args+=(-- --project "$PROJECT")
  fi
  run_cmd "${commit_args[@]}"
}

run_install_hook() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --dry-run)
        DRY_RUN=1
        shift
        ;;
      --project)
        require_value "$1" "${2:-}"
        PROJECT="$2"
        shift 2
        ;;
      -h|--help)
        usage
        exit 0
        ;;
      *)
        log "Unknown install-hook option: $1"
        usage
        exit 1
        ;;
    esac
  done

  local hook_args=(bash scripts/install-git-hooks.sh)
  if [[ -n "$PROJECT" ]]; then
    hook_args+=(--project "$PROJECT")
  fi
  if [[ "$DRY_RUN" -eq 1 ]]; then
    hook_args+=(--dry-run)
  fi
  run_cmd "${hook_args[@]}"
}

case "$MODE" in
  start)
    run_start "$@"
    ;;
  end)
    run_end "$@"
    ;;
  commit)
    run_commit "$@"
    ;;
  install-hook)
    run_install_hook "$@"
    ;;
  help|-h|--help)
    usage
    ;;
  *)
    log "Unknown command: $MODE"
    usage
    exit 1
    ;;
esac
