import { describe, expect, it } from "vitest";

import { MemoryService } from "../../src/services/memory-service.js";
import { PolicyService } from "../../src/services/policy-service.js";
import type { EntriesRepository } from "../../src/storage/repositories/entries-repository.js";

describe("memory service error paths", () => {
  it("returns INVALID_ARGUMENT for malformed inputs", async () => {
    const service = new MemoryService(
      createRepositoryStub(),
      new PolicyService(),
    );

    await expect(service.saveMemory({ text: "   " })).rejects.toMatchObject({
      code: "INVALID_ARGUMENT",
    });
    await expect(service.search({ query: "   " })).rejects.toMatchObject({
      code: "INVALID_ARGUMENT",
    });
    await expect(service.timeline({ anchorId: "   " })).rejects.toMatchObject({
      code: "INVALID_ARGUMENT",
    });
    await expect(service.getEntries({ ids: [] })).rejects.toMatchObject({
      code: "INVALID_ARGUMENT",
    });
    await expect(service.getEntries({ ids: new Array(201).fill("id") })).rejects.toMatchObject({
      code: "INVALID_ARGUMENT",
    });
  });

  it("maps repository failures to STORAGE_FAILURE for save/search/timeline/getEntries", async () => {
    const storageError = new Error("sqlite unavailable");
    const service = new MemoryService(
      createRepositoryStub({
        insertEntry: () => {
          throw storageError;
        },
        searchEntries: () => {
          throw storageError;
        },
        getTimeline: () => {
          throw storageError;
        },
        getEntriesByIds: () => {
          throw storageError;
        },
      }),
      new PolicyService(),
    );

    await expect(service.saveMemory({ text: "ok" })).rejects.toMatchObject({
      code: "STORAGE_FAILURE",
    });
    await expect(service.search({ query: "ok" })).rejects.toMatchObject({
      code: "STORAGE_FAILURE",
    });
    await expect(service.timeline({ anchorId: "x" })).rejects.toMatchObject({
      code: "STORAGE_FAILURE",
    });
    await expect(service.getEntries({ ids: ["x"] })).rejects.toMatchObject({
      code: "STORAGE_FAILURE",
    });
  });
});

type RepositoryOverrides = {
  insertEntry?: () => void;
  searchEntries?: () => { items: Array<unknown>; total: number };
  getTimeline?: () => { anchorId: string; items: Array<unknown> } | null;
  getEntriesByIds?: () => Array<unknown>;
};

function createRepositoryStub(overrides: RepositoryOverrides = {}): EntriesRepository {
  const stub = {
    insertEntry: overrides.insertEntry ?? (() => undefined),
    searchEntries: overrides.searchEntries ?? (() => ({ items: [], total: 0 })),
    getTimeline: overrides.getTimeline ?? (() => ({ anchorId: "x", items: [] })),
    getEntriesByIds: overrides.getEntriesByIds ?? (() => []),
  };

  return stub as unknown as EntriesRepository;
}
