# codex-mem

Persistenter Speicher fuer Codex mit MCP + SQLite, lokal-first.

[🇺🇸 English](../../README.md) • [🇪🇸 Español](README.es.md) • [🇩🇪 Deutsch](README.de.md)

## Schnellstart

```bash
npm install
export MEMORY_DB_PATH=.memory/codex-mem.db
npm run migrate
npm run mcp:start
```

## Dokumentation

- `docs/setup-guide.md`
- `docs/usage-guide.md`
- `docs/mcp-api-spec.md`
- `docs/architecture.md`
- `docs/troubleshooting.md`

## Wie Es Funktioniert

1. `save_memory` speichert wichtigen Kontext.
2. `search` liefert kompakte Treffer.
3. `timeline` erweitert Kontext um einen Anker.
4. `get_entries` liefert volle Details per ID.

## MCP Tools

- `save_memory`
- `search`
- `timeline`
- `get_entries`
- `ingest_docs`
- `retention_dry_run`

## Systemanforderungen

- Node.js 20+
- npm
- Lokaler Schreibzugriff fuer `.memory/`

## Mitwirken

Siehe `CONTRIBUTING.md`.

## Lizenz

AGPL-3.0. Siehe `LICENSE`.
