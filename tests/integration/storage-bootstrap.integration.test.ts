import { describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { createDatabase } from "../../src/storage/db.js";

describe("storage bootstrap", () => {
  it("creates core tables and FTS index on first startup", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "memory-bootstrap-"));
    const dbPath = path.join(tempDir, "memory.db");

    const db = createDatabase({ dbPath });
    const tables = db.db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
      .all() as Array<{ name: string }>;
    const tableNames = tables.map((table) => table.name);

    expect(tableNames).toContain("schema_migrations");
    expect(tableNames).toContain("entries");
    expect(tableNames).toContain("entries_fts");

    db.close();
  });
});

