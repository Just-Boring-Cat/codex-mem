#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

MCP_NAME="codex-mem"
DB_PATH=".memory/codex-mem.db"
REGISTER=1
DRY_RUN=0

usage() {
  cat <<'USAGE'
Usage: bash scripts/install-mcp.sh [options]

Installs local dependencies, prepares the memory DB, runs migrations,
and optionally registers the MCP server with Codex CLI.

Options:
  --name <mcp_name>       MCP server name (default: codex-mem)
  --db-path <path>        SQLite DB path (default: .memory/codex-mem.db)
  --no-register           Skip Codex MCP registration step
  --dry-run               Print actions only, do not execute commands
  -h, --help              Show this help
USAGE
}

log() {
  printf '[install-mcp] %s\n' "$*"
}

run() {
  if [[ "$DRY_RUN" -eq 1 ]]; then
    printf 'DRY RUN: %s\n' "$*"
    return 0
  fi
  "$@"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --name)
      MCP_NAME="${2:-}"
      shift 2
      ;;
    --db-path)
      DB_PATH="${2:-}"
      shift 2
      ;;
    --no-register)
      REGISTER=0
      shift
      ;;
    --dry-run)
      DRY_RUN=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      log "Unknown option: $1"
      usage
      exit 1
      ;;
  esac
done

if [[ -z "$MCP_NAME" ]]; then
  log "MCP name cannot be empty."
  exit 1
fi

if [[ -z "$DB_PATH" ]]; then
  log "DB path cannot be empty."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  log "npm is required but was not found in PATH."
  exit 1
fi

log "Project root: $PROJECT_ROOT"
log "MCP name: $MCP_NAME"
log "DB path: $DB_PATH"
if [[ "$DRY_RUN" -eq 1 ]]; then
  log "DRY RUN enabled; no commands will be executed."
fi

DB_DIR="$(dirname "$DB_PATH")"
if [[ "$DB_DIR" != "." ]]; then
  run mkdir -p "$PROJECT_ROOT/$DB_DIR"
fi

if [[ "$DRY_RUN" -eq 1 ]]; then
  printf 'DRY RUN: npm install\n'
else
  (
    cd "$PROJECT_ROOT"
    npm install
  )
fi

if [[ "$DRY_RUN" -eq 1 ]]; then
  printf 'DRY RUN: MEMORY_DB_PATH=%s npm run migrate\n' "$DB_PATH"
else
  (
    cd "$PROJECT_ROOT"
    MEMORY_DB_PATH="$DB_PATH" npm run migrate
  )
fi

if [[ "$REGISTER" -eq 1 ]]; then
  REGISTER_CMD=(codex mcp add "$MCP_NAME" -- npm run mcp:start --silent)
  if [[ "$DRY_RUN" -eq 1 ]]; then
    printf 'DRY RUN: %s\n' "${REGISTER_CMD[*]}"
  elif command -v codex >/dev/null 2>&1; then
    if "${REGISTER_CMD[@]}"; then
      log "Codex MCP registration complete."
    else
      log "Codex MCP registration failed. You can run this manually:"
      log "  ${REGISTER_CMD[*]}"
    fi
  else
    log "Codex CLI not found; skipped auto registration."
    log "Run this manually once Codex CLI is available:"
    log "  ${REGISTER_CMD[*]}"
  fi
else
  log "MCP registration skipped (--no-register)."
fi

log "Done."
