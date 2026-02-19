import { randomUUID } from "node:crypto";

import { AppError, toAppError } from "../domain/errors.js";
import type {
  GetEntriesInput,
  GetEntriesResult,
  SaveMemoryInput,
  SaveMemoryResult,
  SearchInput,
  SearchResult,
  TimelineInput,
  TimelineResult,
} from "../domain/models.js";
import { EntriesRepository } from "../storage/repositories/entries-repository.js";
import { PolicyService } from "./policy-service.js";

export class MemoryService {
  constructor(
    private readonly entriesRepository: EntriesRepository,
    private readonly policyService: PolicyService,
  ) {}

  async saveMemory(input: SaveMemoryInput): Promise<SaveMemoryResult> {
    const text = input.text.trim();
    if (text.length === 0) {
      throw new AppError("INVALID_ARGUMENT", "text is required");
    }

    const title = normalizeTitle(input.title, text);
    const project = normalizeShortField(input.project, "default");
    const entryType = normalizeShortField(input.type, "note");
    const createdAt = new Date().toISOString();
    const createdAtUnixMs = Date.now();

    this.policyService.assertAllowed({ text, title, metadata: input.metadata });

    const id = randomUUID();
    withStorageErrorHandling(() => {
      this.entriesRepository.insertEntry({
        id,
        title,
        body: text,
        entryType,
        project,
        sourceRef: input.sourceRef?.trim() || null,
        contentHash: null,
        sessionId: input.sessionId?.trim() || null,
        metadata: input.metadata ?? {},
        createdAt,
        createdAtUnixMs,
      });
    });

    return {
      status: "saved",
      id,
      createdAt,
    };
  }

  async search(input: SearchInput): Promise<SearchResult> {
    const query = input.query.trim();
    if (query.length === 0) {
      throw new AppError("INVALID_ARGUMENT", "query is required");
    }

    const limit = clampNumber(input.limit ?? 20, 1, 100);
    const offset = Math.max(0, input.offset ?? 0);
    const project = input.project?.trim() || undefined;
    const type = input.type?.trim() || undefined;

    const result = withStorageErrorHandling(() => this.entriesRepository.searchEntries({
      query,
      project,
      type,
      limit,
      offset,
    }));

    return {
      items: result.items,
      total: result.total,
      limit,
      offset,
    };
  }

  async timeline(input: TimelineInput): Promise<TimelineResult> {
    const anchorId = input.anchorId.trim();
    if (anchorId.length === 0) {
      throw new AppError("INVALID_ARGUMENT", "anchorId is required");
    }

    const depthBefore = clampNumber(input.depthBefore ?? 3, 0, 20);
    const depthAfter = clampNumber(input.depthAfter ?? 3, 0, 20);
    const timeline = withStorageErrorHandling(
      () => this.entriesRepository.getTimeline(anchorId, depthBefore, depthAfter),
    );

    if (!timeline) {
      throw new AppError("ENTRY_NOT_FOUND", "anchor entry was not found", { anchorId });
    }

    return timeline;
  }

  async getEntries(input: GetEntriesInput): Promise<GetEntriesResult> {
    if (input.ids.length === 0) {
      throw new AppError("INVALID_ARGUMENT", "ids is required");
    }

    if (input.ids.length > 200) {
      throw new AppError("INVALID_ARGUMENT", "ids exceeds maximum batch size");
    }

    const cleanIds = input.ids.map((id) => id.trim()).filter(Boolean);
    if (cleanIds.length === 0) {
      throw new AppError("INVALID_ARGUMENT", "ids is required");
    }

    return {
      items: withStorageErrorHandling(() => this.entriesRepository.getEntriesByIds(cleanIds)),
    };
  }
}

function normalizeTitle(title: string | undefined, text: string): string {
  const normalized = title?.trim();
  if (normalized && normalized.length > 0) {
    return normalized.slice(0, 120);
  }
  return text.slice(0, 120);
}

function normalizeShortField(value: string | undefined, fallback: string): string {
  const normalized = value?.trim();
  return normalized && normalized.length > 0 ? normalized.slice(0, 64) : fallback;
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(Math.trunc(value), min), max);
}

function withStorageErrorHandling<T>(operation: () => T): T {
  try {
    return operation();
  } catch (error) {
    const appError = toAppError(error);
    if (appError.code === "STORAGE_FAILURE") {
      throw appError;
    }
    throw new AppError("STORAGE_FAILURE", "Storage operation failed", {
      cause: appError.message,
      details: appError.details,
    });
  }
}
