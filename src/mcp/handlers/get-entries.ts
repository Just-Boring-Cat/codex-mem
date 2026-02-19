import { z } from "zod";

import type { MemoryService } from "../../services/memory-service.js";
import { errorResult, successResult, type ToolResult } from "./shared.js";

export const getEntriesInputSchema = z.object({
  ids: z.array(z.string()).min(1).max(200),
});

export async function getEntriesHandler(
  memoryService: MemoryService,
  args: z.infer<typeof getEntriesInputSchema>,
): Promise<ToolResult> {
  try {
    const result = await memoryService.getEntries({
      ids: args.ids,
    });

    return successResult("Entries fetched", {
      items: result.items.map((item) => ({
        id: item.id,
        title: item.title,
        body: item.body,
        entry_type: item.entryType,
        project: item.project,
        session_id: item.sessionId,
        source_ref: item.sourceRef,
        metadata: item.metadata,
        created_at: item.createdAt,
      })),
    });
  } catch (error) {
    return errorResult(error);
  }
}

