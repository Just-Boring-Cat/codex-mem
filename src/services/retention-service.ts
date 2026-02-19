import { randomUUID } from "node:crypto";

import { AppError } from "../domain/errors.js";
import { EntriesRepository } from "../storage/repositories/entries-repository.js";

export interface RetentionDryRunInput {
  now?: string;
  maxAgeDays?: number;
  maxEntriesPerProject?: number;
  project?: string;
}

export interface RetentionDryRunReport {
  mode: "dry-run";
  executedAt: string;
  totalCandidates: number;
  byReason: {
    age: number;
    projectCount: number;
  };
  candidateIds: string[];
}

export class RetentionService {
  constructor(private readonly entriesRepository: EntriesRepository) {}

  async dryRun(input: RetentionDryRunInput): Promise<RetentionDryRunReport> {
    const now = parseNow(input.now);
    const maxAgeDays = normalizeMaxAgeDays(input.maxAgeDays);
    const maxEntriesPerProject = normalizeMaxEntriesPerProject(input.maxEntriesPerProject);
    const project = input.project?.trim() || null;

    if (maxAgeDays === null && maxEntriesPerProject === null) {
      throw new AppError("INVALID_ARGUMENT", "At least one retention rule must be set");
    }

    const entries = this.entriesRepository.listEntriesForRetention(project ?? undefined);
    const ageCutoffUnixMs = maxAgeDays === null
      ? null
      : now.getTime() - maxAgeDays * 24 * 60 * 60 * 1000;

    const ageCandidates = new Set<string>();
    if (ageCutoffUnixMs !== null) {
      for (const entry of entries) {
        if (entry.createdAtUnixMs < ageCutoffUnixMs) {
          ageCandidates.add(entry.id);
        }
      }
    }

    const countCandidates = new Set<string>();
    if (maxEntriesPerProject !== null) {
      const grouped = new Map<string, Array<{ id: string }>>();
      for (const entry of entries) {
        const list = grouped.get(entry.project) ?? [];
        list.push({ id: entry.id });
        grouped.set(entry.project, list);
      }

      for (const list of grouped.values()) {
        for (let i = maxEntriesPerProject; i < list.length; i += 1) {
          const candidate = list[i];
          if (candidate) {
            countCandidates.add(candidate.id);
          }
        }
      }
    }

    const candidateSet = new Set<string>([...ageCandidates, ...countCandidates]);
    const candidateIds = [...candidateSet].sort((a, b) => a.localeCompare(b));
    const executedAt = now.toISOString();

    const report: RetentionDryRunReport = {
      mode: "dry-run",
      executedAt,
      totalCandidates: candidateIds.length,
      byReason: {
        age: ageCandidates.size,
        projectCount: countCandidates.size,
      },
      candidateIds,
    };

    this.entriesRepository.recordRetentionAuditEvent({
      id: randomUUID(),
      mode: report.mode,
      executedAt,
      project,
      totalCandidates: report.totalCandidates,
      byReasonJson: JSON.stringify(report.byReason),
      inputJson: JSON.stringify({
        maxAgeDays,
        maxEntriesPerProject,
        project,
      }),
      candidateIdsJson: JSON.stringify(report.candidateIds),
    });

    return report;
  }
}

function parseNow(value?: string): Date {
  if (!value) {
    return new Date();
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new AppError("INVALID_ARGUMENT", "Invalid now timestamp", { now: value });
  }
  return parsed;
}

function normalizeMaxAgeDays(value?: number): number | null {
  if (value === undefined) {
    return null;
  }

  const normalized = Math.trunc(value);
  if (normalized <= 0) {
    throw new AppError("INVALID_ARGUMENT", "maxAgeDays must be greater than 0");
  }
  return normalized;
}

function normalizeMaxEntriesPerProject(value?: number): number | null {
  if (value === undefined) {
    return null;
  }

  const normalized = Math.trunc(value);
  if (normalized <= 0) {
    throw new AppError("INVALID_ARGUMENT", "maxEntriesPerProject must be greater than 0");
  }
  return normalized;
}

