import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { performance } from "node:perf_hooks";

import type Database from "better-sqlite3";
import { afterEach, describe, expect, it } from "vitest";

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

describe("search performance baseline", () => {
  it("keeps p95 search latency below 250ms at 10k entries", async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "search-baseline-"));
    openDirs.push(tempDir);

    const dbPath = path.join(tempDir, "memory.db");
    const dbContext = createDatabase({ dbPath });
    openDatabases.push(dbContext);

    seedEntries(dbContext.db, 10_000);

    const memoryService = new MemoryService(
      new EntriesRepository(dbContext.db),
      new PolicyService(),
    );

    const warmup = await memoryService.search({
      query: "targetkeyword42",
      project: "codex-mem",
      limit: 20,
      offset: 0,
    });
    expect(warmup.total).toBeGreaterThan(0);

    const durations: number[] = [];
    for (let i = 0; i < 30; i += 1) {
      const startedAt = performance.now();
      const result = await memoryService.search({
        query: "targetkeyword42",
        project: "codex-mem",
        limit: 20,
        offset: 0,
      });
      const elapsed = performance.now() - startedAt;
      durations.push(elapsed);
      expect(result.items.length).toBeGreaterThan(0);
    }

    const p95 = percentile(durations, 95);
    expect(p95).toBeLessThan(250);
  }, 30_000);
});

function seedEntries(db: Database.Database, totalEntries: number): void {
  db.prepare("INSERT OR IGNORE INTO projects (name, created_at) VALUES (?, ?)")
    .run("codex-mem", "2026-02-19T00:00:00.000Z");

  const insert = db.prepare(
    `
      INSERT INTO entries (
        id, title, body, entry_type, project, source_ref, content_hash, metadata_json, created_at, created_at_unix_ms
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  );

  const writeBatch = db.transaction(() => {
    for (let i = 0; i < totalEntries; i += 1) {
      const body = i % 100 === 0
        ? `Entry ${i} includes targetkeyword42 for baseline lookup`
        : `Entry ${i} general memory content without special token`;

      insert.run(
        `perf-entry-${i}`,
        `Performance Entry ${i}`,
        body,
        "note",
        "codex-mem",
        `perf/seed/${i}.md`,
        null,
        "{}",
        "2026-02-19T00:00:00.000Z",
        1760000000000 + i,
      );
    }
  });

  writeBatch();
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.max(0, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[index] ?? sorted[sorted.length - 1] ?? 0;
}
