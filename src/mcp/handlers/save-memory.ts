import { z } from "zod";

import type { MemoryService } from "../../services/memory-service.js";
import { errorResult, successResult, type ToolResult } from "./shared.js";

export const saveMemoryInputSchema = z.object({
  text: z.string(),
  title: z.string().optional(),
  project: z.string().optional(),
  type: z.string().optional(),
  source_ref: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function saveMemoryHandler(
  memoryService: MemoryService,
  args: z.infer<typeof saveMemoryInputSchema>,
): Promise<ToolResult> {
  try {
    const result = await memoryService.saveMemory({
      text: args.text,
      title: args.title,
      project: args.project,
      type: args.type,
      sourceRef: args.source_ref,
      metadata: args.metadata,
    });

    return successResult("Memory saved", {
      status: result.status,
      id: result.id,
      created_at: result.createdAt,
    });
  } catch (error) {
    return errorResult(error);
  }
}

