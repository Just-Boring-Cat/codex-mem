#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

DRY_RUN=0
DEFAULT_PROJECT="codex-mem"

usage() {
  cat <<'USAGE'
Usage: bash scripts/install-git-hooks.sh [options]

Installs a post-commit hook that captures the latest commit into codex-mem.

Options:
  --project <name>   Default project name for captured commit entries
  --dry-run          Print actions only, do not write files
  -h, --help         Show this help
USAGE
}

log() {
  printf '[install-hooks] %s\n' "$*"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --project)
      DEFAULT_PROJECT="${2:-}"
      shift 2
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

if [[ -z "$DEFAULT_PROJECT" ]]; then
  log "Project name cannot be empty."
  exit 1
fi

if [[ ! -d "$PROJECT_ROOT/.git" ]]; then
  log "No .git directory found at $PROJECT_ROOT"
  exit 1
fi

HOOK_PATH="$PROJECT_ROOT/.git/hooks/post-commit"

if [[ "$DRY_RUN" -eq 1 ]]; then
  printf 'DRY RUN: write %s\n' "$HOOK_PATH"
  printf 'DRY RUN: chmod +x %s\n' "$HOOK_PATH"
  exit 0
fi

cat > "$HOOK_PATH" <<HOOK
#!/usr/bin/env bash
set -euo pipefail
PROJECT_ROOT="$PROJECT_ROOT"
cd "\$PROJECT_ROOT"
MEMORY_PROJECT_NAME="\${MEMORY_PROJECT_NAME:-$DEFAULT_PROJECT}" npm run auto:capture:commit --silent >/dev/null 2>&1 || true
HOOK

chmod +x "$HOOK_PATH"

log "Installed post-commit hook at $HOOK_PATH"
log "Default project: $DEFAULT_PROJECT"
