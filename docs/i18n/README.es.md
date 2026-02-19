# codex-mem

Memoria persistente para Codex con MCP + SQLite, orientada a uso local.

[🇺🇸 English](../../README.md) • [🇪🇸 Español](README.es.md) • [🇩🇪 Deutsch](README.de.md)

## Inicio Rápido

```bash
npm install
export MEMORY_DB_PATH=.memory/codex-mem.db
npm run migrate
npm run mcp:start
```

## Documentación

- `docs/setup-guide.md`
- `docs/usage-guide.md`
- `docs/mcp-api-spec.md`
- `docs/architecture.md`
- `docs/troubleshooting.md`

## Cómo Funciona

1. `save_memory` guarda contexto importante.
2. `search` devuelve resultados compactos.
3. `timeline` amplía contexto alrededor de un ancla.
4. `get_entries` devuelve el detalle completo por ID.

## Herramientas MCP

- `save_memory`
- `search`
- `timeline`
- `get_entries`
- `ingest_docs`
- `retention_dry_run`

## Requisitos del Sistema

- Node.js 20+
- npm
- Acceso de escritura local para `.memory/`

## Contribuciones

Consulta `CONTRIBUTING.md`.

## Licencia

AGPL-3.0. Ver `LICENSE`.
