import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { IngestionService } from "../../src/services/ingestion-service.js";
import { MemoryService } from "../../src/services/memory-service.js";
import { PolicyService } from "../../src/services/policy-service.js";
import { createDatabase, type DatabaseContext } from "../../src/storage/db.js";
import { EntriesRepository } from "../../src/storage/repositories/entries-repository.js";

const openDatabases: DatabaseContext[] = [];
const openDirs: string[] = [];

afterEach(() => {
  while (openDatabases.length > 0) {
    openDatabases.pop()?.close();
  }

  while (openDirs.length > 0) {
    fs.rmSync(openDirs.pop() as string, { recursive: true, force: true });
  }
});

describe("ingestion service", () => {
  it("imports configured docs with source attribution and searchable content", async () => {
    const { workspaceRoot, memoryService, ingestionService } = createHarness();
    writeDocs(workspaceRoot, {
      "docs/session-log.md": "# Session\n\nCaptured timeline notes",
      "docs/decisions.md": "# Decisions\n\nDecision Alpha",
      "docs/requirements.md": "# Requirements\n\nMVP ingestion scope",
    });

    const result = await ingestionService.ingest({
      rootDir: workspaceRoot,
      project: "codex-mem",
      sources: [
        "docs/session-log.md",
        "docs/decisions.md",
        "docs/requirements.md",
      ],
    });

    expect(result.processedSources).toBe(3);
    expect(result.importedEntries).toBe(3);
    expect(result.duplicateEntries).toBe(0);
    expect(result.skippedSources).toEqual([]);

    const search = await memoryService.search({
      query: "Decision Alpha",
      project: "codex-mem",
    });

    expect(search.total).toBeGreaterThanOrEqual(1);
    const details = await memoryService.getEntries({
      ids: [search.items[0]?.id ?? ""],
    });
    expect(details.items[0]?.sourceRef).toBe("docs/decisions.md");
  });

  it("dedupes by source and content hash across repeated ingestion runs", async () => {
    const { workspaceRoot, ingestionService, dbContext } = createHarness();
    writeDocs(workspaceRoot, {
      "docs/session-log.md": "# Session\n\nCaptured timeline notes",
      "docs/decisions.md": "# Decisions\n\nDecision Alpha",
      "docs/requirements.md": "# Requirements\n\nMVP ingestion scope",
    });

    const first = await ingestionService.ingest({
      rootDir: workspaceRoot,
      project: "codex-mem",
      sources: [
        "docs/session-log.md",
        "docs/decisions.md",
        "docs/requirements.md",
      ],
    });
    expect(first.importedEntries).toBe(3);
    expect(countEntries(dbContext)).toBe(3);

    const second = await ingestionService.ingest({
      rootDir: workspaceRoot,
      project: "codex-mem",
      sources: [
        "docs/session-log.md",
        "docs/decisions.md",
        "docs/requirements.md",
      ],
    });
    expect(second.importedEntries).toBe(0);
    expect(second.duplicateEntries).toBe(3);
    expect(countEntries(dbContext)).toBe(3);

    writeDocs(workspaceRoot, {
      "docs/decisions.md": "# Decisions\n\nDecision Alpha Updated",
    });

    const third = await ingestionService.ingest({
      rootDir: workspaceRoot,
      project: "codex-mem",
      sources: [
        "docs/session-log.md",
        "docs/decisions.md",
        "docs/requirements.md",
      ],
    });
    expect(third.importedEntries).toBe(1);
    expect(third.duplicateEntries).toBe(2);
    expect(countEntries(dbContext)).toBe(4);
  });
});

function createHarness(): {
  workspaceRoot: string;
  dbContext: DatabaseContext;
  memoryService: MemoryService;
  ingestionService: IngestionService;
} {
  const workspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ingestion-workspace-"));
  openDirs.push(workspaceRoot);

  const dbPath = path.join(workspaceRoot, ".memory", "memory.db");
  const dbContext = createDatabase({ dbPath });
  openDatabases.push(dbContext);

  const repository = new EntriesRepository(dbContext.db);
  const policyService = new PolicyService();

  return {
    workspaceRoot,
    dbContext,
    memoryService: new MemoryService(repository, policyService),
    ingestionService: new IngestionService(repository, policyService),
  };
}

function writeDocs(workspaceRoot: string, files: Record<string, string>): void {
  for (const [relativePath, content] of Object.entries(files)) {
    const absolutePath = path.join(workspaceRoot, relativePath);
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, content, "utf8");
  }
}

function countEntries(dbContext: DatabaseContext): number {
  const row = dbContext.db
    .prepare("SELECT COUNT(*) AS total FROM entries")
    .get() as { total: number };

  return row.total;
}

