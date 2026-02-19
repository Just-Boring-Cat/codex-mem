# codex-mem

Memoria persistente para Codex con MCP + SQLite, orientada a uso local.

[English](../../README.md) | [Espanol](README.es.md) | [Deutsch](README.de.md)

## Resumen

`codex-mem` permite mantener contexto técnico entre sesiones:

1. Guardar contexto con `save_memory`
2. Buscar con `search`
3. Ampliar contexto con `timeline`
4. Obtener detalle completo con `get_entries`

## Inicio Rápido

```bash
npm install
export MEMORY_DB_PATH=.memory/codex-mem.db
npm run migrate
npm run mcp:start
```

## Configuración MCP en VS Code

Configura **Custom MCP (STDIO)** así:

- Nombre: `codex-mem`
- Comando: `npm`
- Argumentos: `run`, `mcp:start`, `--silent`
- Variable de entorno: `MEMORY_DB_PATH=.memory/codex-mem.db`
- Directorio de trabajo: ruta absoluta del repositorio

## Herramientas MCP

- `save_memory`
- `search`
- `timeline`
- `get_entries`
- `ingest_docs`
- `retention_dry_run`

## Verificación Manual

1. Guardar texto único (ejemplo: `manual-check-<timestamp>`)
2. Buscar ese texto con `search`
3. Consultar `get_entries` con el ID devuelto
4. Abrir otra sesión y repetir la búsqueda

Si aparece el registro en la segunda sesión, la persistencia funciona.

## Documentación

- `docs/setup-guide.md`
- `docs/usage-guide.md`
- `docs/troubleshooting.md`
- `docs/mcp-api-spec.md`
