import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { loadSettings } from "../config/settings.js";
import { IngestionService } from "../services/ingestion-service.js";
import { MemoryService } from "../services/memory-service.js";
import { PolicyService } from "../services/policy-service.js";
import { RetentionService } from "../services/retention-service.js";
import { createDatabase } from "../storage/db.js";
import { EntriesRepository } from "../storage/repositories/entries-repository.js";
import { logError, logInfo } from "../observability/logger.js";
import { getEntriesHandler, getEntriesInputSchema } from "./handlers/get-entries.js";
import { ingestDocsHandler, ingestDocsInputSchema } from "./handlers/ingest-docs.js";
import { retentionDryRunHandler, retentionDryRunInputSchema } from "./handlers/retention-dry-run.js";
import { saveMemoryHandler, saveMemoryInputSchema } from "./handlers/save-memory.js";
import { searchHandler, searchInputSchema } from "./handlers/search.js";
import { timelineHandler, timelineInputSchema } from "./handlers/timeline.js";
import type { ToolResult } from "./handlers/shared.js";

export async function startServer(): Promise<void> {
  const settings = loadSettings();
  const rootDir = process.cwd();
  const db = createDatabase({ dbPath: settings.dbPath });

  const entriesRepository = new EntriesRepository(db.db);
  const policyService = new PolicyService();
  const memoryService = new MemoryService(entriesRepository, policyService);
  const ingestionService = new IngestionService(entriesRepository, policyService);
  const retentionService = new RetentionService(entriesRepository);
  const server = new McpServer({
    name: "codex-mem",
    version: "0.1.0",
  });

  server.registerTool(
    "save_memory",
    {
      description: "Save a normalized memory entry",
      inputSchema: saveMemoryInputSchema,
    },
    async (args) => withToolLogging("save_memory", () => saveMemoryHandler(memoryService, args)),
  );

  server.registerTool(
    "search",
    {
      description: "Search memory index entries",
      inputSchema: searchInputSchema,
    },
    async (args) => withToolLogging("search", () => searchHandler(memoryService, args)),
  );

  server.registerTool(
    "timeline",
    {
      description: "Get neighboring entries around an anchor",
      inputSchema: timelineInputSchema,
    },
    async (args) => withToolLogging("timeline", () => timelineHandler(memoryService, args)),
  );

  server.registerTool(
    "get_entries",
    {
      description: "Fetch full details for selected IDs",
      inputSchema: getEntriesInputSchema,
    },
    async (args) => withToolLogging("get_entries", () => getEntriesHandler(memoryService, args)),
  );

  server.registerTool(
    "ingest_docs",
    {
      description: "Ingest configured docs into memory with source-hash dedupe",
      inputSchema: ingestDocsInputSchema,
    },
    async (args) => withToolLogging(
      "ingest_docs",
      () => ingestDocsHandler(ingestionService, { rootDir, defaultProject: settings.projectName }, args),
    ),
  );

  server.registerTool(
    "retention_dry_run",
    {
      description: "Run retention analysis and return candidate entries without deletion",
      inputSchema: retentionDryRunInputSchema,
    },
    async (args) => withToolLogging(
      "retention_dry_run",
      () => retentionDryRunHandler(retentionService, args),
    ),
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);

  const shutdown = async () => {
    await server.close();
    db.close();
  };

  process.on("SIGINT", () => {
    void shutdown();
  });
  process.on("SIGTERM", () => {
    void shutdown();
  });
}

async function withToolLogging(
  toolName: string,
  run: () => Promise<ToolResult>,
): Promise<ToolResult> {
  const requestId = randomUUID();
  const startedAt = Date.now();

  logInfo("tool_request_start", {
    requestId,
    toolName,
  });

  try {
    const result = await run();
    const durationMs = Date.now() - startedAt;
    const structuredError = result.structuredContent?.error as { code?: unknown } | undefined;

    logInfo("tool_request_end", {
      requestId,
      toolName,
      durationMs,
      status: result.isError ? "error" : "ok",
      errorCode: result.isError ? String(structuredError?.code ?? "UNKNOWN") : null,
    });

    return result;
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    logError("tool_request_end", {
      requestId,
      toolName,
      durationMs,
      status: "exception",
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

const entryScriptPath = process.argv[1];
if (entryScriptPath && entryScriptPath === fileURLToPath(import.meta.url)) {
  startServer().catch((error) => {
    console.error("Failed to start MCP server", error);
    process.exit(1);
  });
}
