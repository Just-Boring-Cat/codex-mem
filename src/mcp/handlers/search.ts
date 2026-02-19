import { z } from "zod";

import type { MemoryService } from "../../services/memory-service.js";
import { errorResult, successResult, type ToolResult } from "./shared.js";

export const searchInputSchema = z.object({
  query: z.string(),
  project: z.string().optional(),
  type: z.string().optional(),
  limit: z.number().int().optional(),
  offset: z.number().int().optional(),
});

export async function searchHandler(
  memoryService: MemoryService,
  args: z.infer<typeof searchInputSchema>,
): Promise<ToolResult> {
  try {
    const result = await memoryService.search({
      query: args.query,
      project: args.project,
      type: args.type,
      limit: args.limit,
      offset: args.offset,
    });

    return successResult("Search complete", {
      items: result.items.map((item) => ({
        id: item.id,
        title: item.title,
        entry_type: item.entryType,
        project: item.project,
        created_at: item.createdAt,
        score: item.score,
      })),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    });
  } catch (error) {
    return errorResult(error);
  }
}

