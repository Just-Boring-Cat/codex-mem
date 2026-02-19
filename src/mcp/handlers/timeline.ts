import { z } from "zod";

import type { MemoryService } from "../../services/memory-service.js";
import { errorResult, successResult, type ToolResult } from "./shared.js";

export const timelineInputSchema = z.object({
  anchor_id: z.string(),
  depth_before: z.number().int().optional(),
  depth_after: z.number().int().optional(),
});

export async function timelineHandler(
  memoryService: MemoryService,
  args: z.infer<typeof timelineInputSchema>,
): Promise<ToolResult> {
  try {
    const result = await memoryService.timeline({
      anchorId: args.anchor_id,
      depthBefore: args.depth_before,
      depthAfter: args.depth_after,
    });

    return successResult("Timeline complete", {
      anchor_id: result.anchorId,
      items: result.items.map((item) => ({
        id: item.id,
        title: item.title,
        entry_type: item.entryType,
        project: item.project,
        created_at: item.createdAt,
        score: item.score,
      })),
    });
  } catch (error) {
    return errorResult(error);
  }
}

