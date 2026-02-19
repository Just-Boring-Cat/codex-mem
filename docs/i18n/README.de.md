# codex-mem

Persistenter Speicher fuer Codex mit MCP + SQLite, lokal-first.

[English](../../README.md) | [Espanol](README.es.md) | [Deutsch](README.de.md)

## Ueberblick

`codex-mem` erhaelt technischen Kontext ueber Sitzungen hinweg:

1. Kontext speichern mit `save_memory`
2. Treffer suchen mit `search`
3. Kontext erweitern mit `timeline`
4. Vollstaendige Details laden mit `get_entries`

## Schnellstart

```bash
npm install
export MEMORY_DB_PATH=.memory/codex-mem.db
npm run migrate
npm run mcp:start
```

## VS Code MCP Konfiguration

In **Custom MCP (STDIO)** eintragen:

- Name: `codex-mem`
- Kommando: `npm`
- Argumente: `run`, `mcp:start`, `--silent`
- Umgebungsvariable: `MEMORY_DB_PATH=.memory/codex-mem.db`
- Arbeitsverzeichnis: absoluter Pfad zum Repository

## MCP Tools

- `save_memory`
- `search`
- `timeline`
- `get_entries`
- `ingest_docs`
- `retention_dry_run`

## Manuelle Verifikation

1. Eindeutigen Marker speichern (z. B. `manual-check-<timestamp>`)
2. Marker mit `search` suchen
3. Details mit `get_entries` laden
4. Neue Sitzung starten und Suche wiederholen

Wenn der Eintrag in der neuen Sitzung gefunden wird, funktioniert die Persistenz.

## Dokumentation

- `docs/setup-guide.md`
- `docs/usage-guide.md`
- `docs/troubleshooting.md`
- `docs/mcp-api-spec.md`
