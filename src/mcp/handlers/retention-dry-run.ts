import { z } from "zod";

import type { RetentionService } from "../../services/retention-service.js";
import { errorResult, successResult, type ToolResult } from "./shared.js";

export const retentionDryRunInputSchema = z.object({
  now: z.string().optional(),
  max_age_days: z.number().int().positive().optional(),
  max_entries_per_project: z.number().int().positive().optional(),
  project: z.string().optional(),
});

export async function retentionDryRunHandler(
  retentionService: RetentionService,
  args: z.infer<typeof retentionDryRunInputSchema>,
): Promise<ToolResult> {
  try {
    const result = await retentionService.dryRun({
      now: args.now,
      maxAgeDays: args.max_age_days,
      maxEntriesPerProject: args.max_entries_per_project,
      project: args.project,
    });

    return successResult("Retention dry-run complete", {
      mode: result.mode,
      executed_at: result.executedAt,
      total_candidates: result.totalCandidates,
      by_reason: {
        age: result.byReason.age,
        project_count: result.byReason.projectCount,
      },
      candidate_ids: result.candidateIds,
    });
  } catch (error) {
    return errorResult(error);
  }
}

