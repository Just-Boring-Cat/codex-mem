import { z } from "zod";

import type { IngestionService } from "../../services/ingestion-service.js";
import { errorResult, successResult, type ToolResult } from "./shared.js";

const DEFAULT_SOURCES = [
  "docs/session-log.md",
  "docs/decisions.md",
  "docs/requirements.md",
];

export const ingestDocsInputSchema = z.object({
  project: z.string().optional(),
  sources: z.array(z.string()).min(1).max(100).optional(),
  entry_type: z.string().optional(),
});

interface IngestDocsContext {
  rootDir: string;
  defaultProject: string;
}

export async function ingestDocsHandler(
  ingestionService: IngestionService,
  context: IngestDocsContext,
  args: z.infer<typeof ingestDocsInputSchema>,
): Promise<ToolResult> {
  try {
    const result = await ingestionService.ingest({
      rootDir: context.rootDir,
      project: args.project?.trim() || context.defaultProject,
      sources: args.sources ?? DEFAULT_SOURCES,
      entryType: args.entry_type,
    });

    return successResult("Ingestion complete", {
      processed_sources: result.processedSources,
      imported_entries: result.importedEntries,
      duplicate_entries: result.duplicateEntries,
      skipped_sources: result.skippedSources,
    });
  } catch (error) {
    return errorResult(error);
  }
}

