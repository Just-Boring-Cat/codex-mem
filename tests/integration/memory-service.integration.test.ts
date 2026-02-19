import { afterEach, describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { AppError } from "../../src/domain/errors.js";
import { MemoryService } from "../../src/services/memory-service.js";
import { PolicyService } from "../../src/services/policy-service.js";
import { createDatabase, type DatabaseContext } from "../../src/storage/db.js";
import { EntriesRepository } from "../../src/storage/repositories/entries-repository.js";

const openDatabases: DatabaseContext[] = [];

afterEach(() => {
  while (openDatabases.length > 0) {
    openDatabases.pop()?.close();
  }
});

function createMemoryService(): MemoryService {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "memory-service-"));
  const dbPath = path.join(tempDir, "memory.db");
  const db = createDatabase({ dbPath });
  openDatabases.push(db);

  return new MemoryService(new EntriesRepository(db.db), new PolicyService());
}

describe("memory service", () => {
  it("saves entries and retrieves search index plus full details", async () => {
    const service = createMemoryService();

    const first = await service.saveMemory({
      text: "Finalize MVP scope and acceptance criteria",
      title: "MVP Scope",
      project: "codex-mem",
      type: "decision",
      sourceRef: "docs/mvp-spec.md",
    });

    const second = await service.saveMemory({
      text: "Define migration strategy for SQLite schema",
      title: "Migration Strategy",
      project: "codex-mem",
      type: "design",
      sourceRef: "docs/technical-design.md",
    });

    const search = await service.search({
      query: "MVP",
      project: "codex-mem",
      limit: 10,
      offset: 0,
    });

    expect(search.total).toBeGreaterThanOrEqual(1);
    expect(search.items[0]?.id).toBe(first.id);
    expect(search.items[0]?.title).toBe("MVP Scope");

    const details = await service.getEntries({ ids: [second.id, first.id] });
    expect(details.items).toHaveLength(2);
    expect(details.items[0]?.id).toBe(second.id);
    expect(details.items[1]?.id).toBe(first.id);
    expect(details.items[1]?.body).toContain("acceptance criteria");
  });

  it("returns timeline neighbors around an anchor", async () => {
    const service = createMemoryService();

    const early = await service.saveMemory({
      text: "Initial requirement notes",
      title: "Requirements",
      project: "codex-mem",
      type: "note",
    });
    const anchor = await service.saveMemory({
      text: "Architectural tradeoffs captured",
      title: "Architecture",
      project: "codex-mem",
      type: "design",
    });
    const late = await service.saveMemory({
      text: "Delivery milestone mapping",
      title: "Delivery Plan",
      project: "codex-mem",
      type: "planning",
    });

    const timeline = await service.timeline({
      anchorId: anchor.id,
      depthBefore: 1,
      depthAfter: 1,
    });

    expect(timeline.anchorId).toBe(anchor.id);
    expect(timeline.items).toHaveLength(3);
    expect(timeline.items[0]?.id).toBe(early.id);
    expect(timeline.items[1]?.id).toBe(anchor.id);
    expect(timeline.items[2]?.id).toBe(late.id);
  });

  it("blocks known secret patterns before persistence", async () => {
    const service = createMemoryService();

    await expect(
      service.saveMemory({
        text: "Do not store sk-live-1234567890abcdef",
        title: "Bad Secret",
        project: "codex-mem",
        type: "note",
      }),
    ).rejects.toBeInstanceOf(AppError);

    await expect(
      service.search({
        query: "Bad Secret",
        project: "codex-mem",
      }),
    ).resolves.toMatchObject({ total: 0 });
  });
});

