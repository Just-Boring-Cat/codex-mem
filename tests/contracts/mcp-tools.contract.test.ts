import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

type StructuredResult = {
  content: Array<{ type: string; text?: string }>;
  structuredContent?: Record<string, unknown>;
  isError?: boolean;
};

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;

let tempDir: string;
let transport: StdioClientTransport;
let client: Client;

describe("MCP tools contract", () => {
  beforeAll(async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "mcp-contract-"));
    const dbPath = path.join(tempDir, "memory.db");

    transport = new StdioClientTransport({
      command: "npm",
      args: ["run", "mcp:start", "--silent"],
      cwd: process.cwd(),
      env: createChildEnv({
        MEMORY_DB_PATH: dbPath,
      }),
      stderr: "pipe",
    });

    client = new Client({
      name: "contract-test-client",
      version: "0.1.0",
    });

    await client.connect(transport);
  });

  afterAll(async () => {
    await transport.close();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("lists required v1 memory tools", async () => {
    const tools = await client.listTools();
    const names = new Set(tools.tools.map((tool) => tool.name));

    expect(names.has("save_memory")).toBe(true);
    expect(names.has("search")).toBe(true);
    expect(names.has("timeline")).toBe(true);
    expect(names.has("get_entries")).toBe(true);
    expect(names.has("ingest_docs")).toBe(true);
    expect(names.has("retention_dry_run")).toBe(true);
  });

  it("supports save -> search -> get_entries flow with contract-shaped responses", async () => {
    const save = await callTool("save_memory", {
      text: "Contract flow entry for MVP verification",
      title: "Contract Flow",
      project: "codex-mem",
      type: "note",
      source_ref: "contract-test",
      metadata: { phase: "contract" },
    });

    expect(save.isError).not.toBe(true);
    expect(save.structuredContent?.status).toBe("saved");
    expect(typeof save.structuredContent?.id).toBe("string");
    expect(typeof save.structuredContent?.created_at).toBe("string");
    expect(String(save.structuredContent?.created_at)).toMatch(ISO_DATE_RE);

    const savedId = String(save.structuredContent?.id);

    const search = await callTool("search", {
      query: "Contract flow MVP verification",
      project: "codex-mem",
      limit: 10,
      offset: 0,
    });

    expect(search.isError).not.toBe(true);
    expect(Array.isArray(search.structuredContent?.items)).toBe(true);
    expect(typeof search.structuredContent?.total).toBe("number");
    expect(search.structuredContent?.limit).toBe(10);
    expect(search.structuredContent?.offset).toBe(0);

    const indexedItems = search.structuredContent?.items as Array<Record<string, unknown>>;
    const found = indexedItems.find((item) => item.id === savedId);
    expect(found).toBeTruthy();

    const details = await callTool("get_entries", {
      ids: [savedId],
    });

    expect(details.isError).not.toBe(true);
    expect(Array.isArray(details.structuredContent?.items)).toBe(true);

    const detailItems = details.structuredContent?.items as Array<Record<string, unknown>>;
    expect(detailItems).toHaveLength(1);
    expect(detailItems[0]?.id).toBe(savedId);
    expect(detailItems[0]?.title).toBe("Contract Flow");
    expect(String(detailItems[0]?.body)).toContain("MVP verification");
    expect(detailItems[0]?.project).toBe("codex-mem");
    expect(detailItems[0]?.entry_type).toBe("note");
  });

  it("returns timeline neighbors around anchor", async () => {
    const before = await callTool("save_memory", {
      text: "Timeline before entry",
      title: "T Before",
      project: "codex-mem",
      type: "note",
    });
    const anchor = await callTool("save_memory", {
      text: "Timeline anchor entry",
      title: "T Anchor",
      project: "codex-mem",
      type: "note",
    });
    const after = await callTool("save_memory", {
      text: "Timeline after entry",
      title: "T After",
      project: "codex-mem",
      type: "note",
    });

    const anchorId = String(anchor.structuredContent?.id);
    const timeline = await callTool("timeline", {
      anchor_id: anchorId,
      depth_before: 1,
      depth_after: 1,
    });

    expect(timeline.isError).not.toBe(true);
    expect(timeline.structuredContent?.anchor_id).toBe(anchorId);

    const items = timeline.structuredContent?.items as Array<Record<string, unknown>>;
    expect(items).toHaveLength(3);
    expect(items[0]?.id).toBe(String(before.structuredContent?.id));
    expect(items[1]?.id).toBe(anchorId);
    expect(items[2]?.id).toBe(String(after.structuredContent?.id));
  });

  it("returns POLICY_BLOCKED when save payload contains secret-like tokens", async () => {
    const result = await callTool("save_memory", {
      text: "Never persist sk-live-1234567890abcdefghijklmnop token",
      title: "Secret test",
      project: "codex-mem",
      type: "note",
    });

    expect(result.isError).toBe(true);
    const error = extractError(result);
    expect(error.code).toBe("POLICY_BLOCKED");
  });

  it("returns ENTRY_NOT_FOUND for unknown timeline anchor", async () => {
    const result = await callTool("timeline", {
      anchor_id: "missing-entry-id",
      depth_before: 1,
      depth_after: 1,
    });

    expect(result.isError).toBe(true);
    const error = extractError(result);
    expect(error.code).toBe("ENTRY_NOT_FOUND");
  });

  it("returns INVALID_ARGUMENT for empty search query", async () => {
    const result = await callTool("search", {
      query: "   ",
      project: "codex-mem",
    });

    expect(result.isError).toBe(true);
    const error = extractError(result);
    expect(error.code).toBe("INVALID_ARGUMENT");
  });

  it("runs docs ingestion and dedupes repeated runs", async () => {
    const first = await callTool("ingest_docs", {
      project: "codex-mem",
      sources: [
        "docs/session-log.md",
        "docs/decisions.md",
        "docs/requirements.md",
      ],
    });

    expect(first.isError).not.toBe(true);
    expect(first.structuredContent?.processed_sources).toBe(3);
    expect(first.structuredContent?.imported_entries).toBe(3);
    expect(first.structuredContent?.duplicate_entries).toBe(0);
    expect(Array.isArray(first.structuredContent?.skipped_sources)).toBe(true);

    const second = await callTool("ingest_docs", {
      project: "codex-mem",
      sources: [
        "docs/session-log.md",
        "docs/decisions.md",
        "docs/requirements.md",
      ],
    });

    expect(second.isError).not.toBe(true);
    expect(second.structuredContent?.processed_sources).toBe(3);
    expect(second.structuredContent?.imported_entries).toBe(0);
    expect(second.structuredContent?.duplicate_entries).toBe(3);
  });

  it("returns retention dry-run report with candidates and reason counts", async () => {
    await callTool("save_memory", {
      text: "Retention candidate entry 1",
      title: "Retention 1",
      project: "codex-mem",
      type: "note",
    });
    await callTool("save_memory", {
      text: "Retention candidate entry 2",
      title: "Retention 2",
      project: "codex-mem",
      type: "note",
    });

    const report = await callTool("retention_dry_run", {
      project: "codex-mem",
      max_entries_per_project: 1,
      now: "2026-02-19T00:00:00.000Z",
    });

    expect(report.isError).not.toBe(true);
    expect(report.structuredContent?.mode).toBe("dry-run");
    expect(typeof report.structuredContent?.total_candidates).toBe("number");
    expect((report.structuredContent?.total_candidates as number) >= 1).toBe(true);
    expect(typeof report.structuredContent?.by_reason).toBe("object");
    expect(Array.isArray(report.structuredContent?.candidate_ids)).toBe(true);
  });

  it("returns INVALID_ARGUMENT when retention dry-run has no rules", async () => {
    const result = await callTool("retention_dry_run", {
      project: "codex-mem",
    });

    expect(result.isError).toBe(true);
    const error = extractError(result);
    expect(error.code).toBe("INVALID_ARGUMENT");
  });
});

async function callTool(
  name: string,
  args: Record<string, unknown>,
): Promise<StructuredResult> {
  const result = await client.callTool({
    name,
    arguments: args,
  });

  if ("toolResult" in result) {
    throw new Error("Task-style tool result not expected for v1 memory tools");
  }

  return result;
}

function extractError(result: StructuredResult): { code: string; message: string } {
  const err = result.structuredContent?.error as
    | { code?: unknown; message?: unknown }
    | undefined;

  return {
    code: String(err?.code ?? ""),
    message: String(err?.message ?? ""),
  };
}

function createChildEnv(extra: Record<string, string>): Record<string, string> {
  const base = Object.fromEntries(
    Object.entries(process.env).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
  );
  return {
    ...base,
    ...extra,
  };
}
