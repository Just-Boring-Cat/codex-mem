import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { RetentionService } from "../../src/services/retention-service.js";
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

describe("retention dry-run", () => {
  it("selects age and count candidates without deleting entries", async () => {
    const { dbContext, retentionService } = createHarness();
    seedEntries(dbContext.db);

    const totalBefore = countEntries(dbContext);
    expect(totalBefore).toBe(7);

    const report = await retentionService.dryRun({
      now: "2026-02-19T00:00:00.000Z",
      maxAgeDays: 30,
      maxEntriesPerProject: 2,
    });

    expect(report.mode).toBe("dry-run");
    expect(report.totalCandidates).toBe(4);
    expect(report.byReason.age).toBe(1);
    expect(report.byReason.projectCount).toBe(3);
    expect(report.candidateIds).toContain("beta-old-1");
    expect(report.candidateIds).toContain("alpha-1");
    expect(report.candidateIds).toContain("alpha-2");
    expect(report.candidateIds).toContain("alpha-3");

    const totalAfter = countEntries(dbContext);
    expect(totalAfter).toBe(totalBefore);
  });

  it("records audit event for dry-run execution", async () => {
    const { dbContext, retentionService } = createHarness();
    seedEntries(dbContext.db);

    const report = await retentionService.dryRun({
      now: "2026-02-19T00:00:00.000Z",
      maxAgeDays: 30,
      maxEntriesPerProject: 2,
    });

    const audit = dbContext.db
      .prepare(
        `
        SELECT mode, executed_at, total_candidates, by_reason_json, input_json
        FROM retention_audit_events
        ORDER BY executed_at DESC
        LIMIT 1
      `,
      )
      .get() as
      | {
        mode: string;
        executed_at: string;
        total_candidates: number;
        by_reason_json: string;
        input_json: string;
      }
      | undefined;

    expect(audit?.mode).toBe("dry-run");
    expect(audit?.total_candidates).toBe(report.totalCandidates);

    const reasons = JSON.parse(audit?.by_reason_json ?? "{}") as Record<string, unknown>;
    expect(reasons.age).toBe(1);
    expect(reasons.projectCount).toBe(3);

    const input = JSON.parse(audit?.input_json ?? "{}") as Record<string, unknown>;
    expect(input.maxAgeDays).toBe(30);
    expect(input.maxEntriesPerProject).toBe(2);
  });
});

function createHarness(): { dbContext: DatabaseContext; retentionService: RetentionService } {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "retention-dry-run-"));
  openDirs.push(tempDir);

  const dbPath = path.join(tempDir, "memory.db");
  const dbContext = createDatabase({ dbPath });
  openDatabases.push(dbContext);

  const repository = new EntriesRepository(dbContext.db);

  return {
    dbContext,
    retentionService: new RetentionService(repository),
  };
}

function seedEntries(db: DatabaseContext["db"]): void {
  db.prepare("INSERT OR IGNORE INTO projects (name, created_at) VALUES (?, ?)")
    .run("alpha", "2026-01-01T00:00:00.000Z");
  db.prepare("INSERT OR IGNORE INTO projects (name, created_at) VALUES (?, ?)")
    .run("beta", "2026-01-01T00:00:00.000Z");

  const insert = db.prepare(
    `
      INSERT INTO entries (
        id, title, body, entry_type, project, source_ref, content_hash, metadata_json, created_at, created_at_unix_ms
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  );

  const tx = db.transaction(() => {
    insert.run("alpha-1", "A1", "alpha entry 1", "note", "alpha", null, null, "{}", "2026-02-10T00:00:00.000Z", Date.parse("2026-02-10T00:00:00.000Z"));
    insert.run("alpha-2", "A2", "alpha entry 2", "note", "alpha", null, null, "{}", "2026-02-11T00:00:00.000Z", Date.parse("2026-02-11T00:00:00.000Z"));
    insert.run("alpha-3", "A3", "alpha entry 3", "note", "alpha", null, null, "{}", "2026-02-12T00:00:00.000Z", Date.parse("2026-02-12T00:00:00.000Z"));
    insert.run("alpha-4", "A4", "alpha entry 4", "note", "alpha", null, null, "{}", "2026-02-13T00:00:00.000Z", Date.parse("2026-02-13T00:00:00.000Z"));
    insert.run("alpha-5", "A5", "alpha entry 5", "note", "alpha", null, null, "{}", "2026-02-14T00:00:00.000Z", Date.parse("2026-02-14T00:00:00.000Z"));
    insert.run("beta-new-1", "B1", "beta new entry", "note", "beta", null, null, "{}", "2026-02-18T00:00:00.000Z", Date.parse("2026-02-18T00:00:00.000Z"));
    insert.run("beta-old-1", "B2", "beta old entry", "note", "beta", null, null, "{}", "2025-10-01T00:00:00.000Z", Date.parse("2025-10-01T00:00:00.000Z"));
  });

  tx();
}

function countEntries(dbContext: DatabaseContext): number {
  const row = dbContext.db
    .prepare("SELECT COUNT(*) AS total FROM entries")
    .get() as { total: number };

  return row.total;
}

