import { createHash, randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { EntriesRepository } from "../storage/repositories/entries-repository.js";
import { PolicyService } from "./policy-service.js";

export interface IngestionInput {
  rootDir: string;
  project: string;
  sources: string[];
  entryType?: string;
}

export interface IngestionResult {
  processedSources: number;
  importedEntries: number;
  duplicateEntries: number;
  skippedSources: string[];
}

export class IngestionService {
  constructor(
    private readonly entriesRepository: EntriesRepository,
    private readonly policyService: PolicyService,
  ) {}

  async ingest(input: IngestionInput): Promise<IngestionResult> {
    const entryType = input.entryType?.trim() || "ingestion";
    const project = input.project.trim() || "default";
    const result: IngestionResult = {
      processedSources: 0,
      importedEntries: 0,
      duplicateEntries: 0,
      skippedSources: [],
    };

    for (const source of input.sources) {
      const sourceRef = normalizeSourceRef(source);
      const absolutePath = path.resolve(input.rootDir, sourceRef);
      if (!fs.existsSync(absolutePath)) {
        result.skippedSources.push(sourceRef);
        continue;
      }

      const body = fs.readFileSync(absolutePath, "utf8");
      const title = deriveTitle(sourceRef, body);
      const contentHash = hashContent(body);
      const createdAt = new Date().toISOString();
      const createdAtUnixMs = Date.now();
      result.processedSources += 1;

      if (this.entriesRepository.hasEntryForSourceAndHash(sourceRef, contentHash)) {
        result.duplicateEntries += 1;
        this.entriesRepository.recordIngestionEvent({
          id: randomUUID(),
          sourceRef,
          importedAt: createdAt,
          importedCount: 0,
        });
        continue;
      }

      this.policyService.assertAllowed({
        text: body,
        title,
        metadata: {
          source_ref: sourceRef,
          ingestion: true,
        },
      });

      this.entriesRepository.insertEntry({
        id: randomUUID(),
        title,
        body,
        entryType,
        project,
        sourceRef,
        contentHash,
        sessionId: null,
        metadata: {
          ingestion: true,
          source_ref: sourceRef,
        },
        createdAt,
        createdAtUnixMs,
      });

      this.entriesRepository.recordIngestionEvent({
        id: randomUUID(),
        sourceRef,
        importedAt: createdAt,
        importedCount: 1,
      });

      result.importedEntries += 1;
    }

    return result;
  }
}

function normalizeSourceRef(sourceRef: string): string {
  return sourceRef.trim().replaceAll("\\", "/");
}

function deriveTitle(sourceRef: string, body: string): string {
  for (const line of body.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed.startsWith("# ")) {
      return trimmed.slice(2).trim().slice(0, 120);
    }
  }

  return path.basename(sourceRef).slice(0, 120);
}

function hashContent(content: string): string {
  return createHash("sha256").update(content, "utf8").digest("hex");
}

