import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import Database from "better-sqlite3";
import { afterEach, describe, expect, it } from "vitest";

import { createDatabase } from "../../src/storage/db.js";

const openDirs: string[] = [];

afterEach(() => {
  while (openDirs.length > 0) {
    fs.rmSync(openDirs.pop() as string, { recursive: true, force: true });
  }
});

describe("migration upgrade", () => {
  it("upgrades a 001_initial database to latest schema without data loss", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "migration-upgrade-"));
    openDirs.push(tempDir);
    const dbPath = path.join(tempDir, "memory.db");

    seedLegacy001Database(dbPath);

    const upgraded = createDatabase({ dbPath });
    const migrationVersions = upgraded.db
      .prepare("SELECT version FROM schema_migrations ORDER BY version")
      .all() as Array<{ version: string }>;

    expect(migrationVersions.map((row) => row.version)).toEqual([
      "001_initial",
      "002_content_hash_dedupe",
      "003_retention_audit_events",
    ]);

    const columns = upgraded.db
      .prepare("PRAGMA table_info(entries)")
      .all() as Array<{ name: string }>;
    expect(columns.map((column) => column.name)).toContain("content_hash");

    const retentionTables = upgraded.db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'retention_audit_events'")
      .all() as Array<{ name: string }>;
    expect(retentionTables).toHaveLength(1);

    const legacyEntry = upgraded.db
      .prepare("SELECT id, title, body, content_hash FROM entries WHERE id = ?")
      .get("legacy-entry-1") as
      | { id: string; title: string; body: string; content_hash: string | null }
      | undefined;

    expect(legacyEntry?.id).toBe("legacy-entry-1");
    expect(legacyEntry?.title).toBe("Legacy Decision");
    expect(legacyEntry?.body).toContain("v1 scope");
    expect(legacyEntry?.content_hash).toBeNull();

    upgraded.db
      .prepare(
        `
        INSERT INTO entries (
          id, title, body, entry_type, project, source_ref, content_hash, metadata_json, created_at, created_at_unix_ms
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      )
      .run(
        "hash-entry-1",
        "Hash A",
        "First hash entry",
        "ingestion",
        "codex-mem",
        "docs/decisions.md",
        "sha256-same",
        "{}",
        "2026-02-19T00:00:00.000Z",
        1760000000000,
      );

    expect(() => {
      upgraded.db
        .prepare(
          `
          INSERT INTO entries (
            id, title, body, entry_type, project, source_ref, content_hash, metadata_json, created_at, created_at_unix_ms
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        )
        .run(
          "hash-entry-2",
          "Hash B",
          "Second hash entry",
          "ingestion",
          "codex-mem",
          "docs/decisions.md",
          "sha256-same",
          "{}",
          "2026-02-19T00:00:01.000Z",
          1760000001000,
        );
    }).toThrow();

    upgraded.close();
  });
});

function seedLegacy001Database(dbPath: string): void {
  const legacyDb = new Database(dbPath);
  const migration001Path = path.join(
    process.cwd(),
    "src/storage/migrations/001_initial.sql",
  );
  const migrationSql = fs.readFileSync(migration001Path, "utf8");
  legacyDb.exec(migrationSql);

  legacyDb
    .prepare("INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)")
    .run("001_initial", "2026-02-18T00:00:00.000Z");

  legacyDb
    .prepare("INSERT INTO projects (name, created_at) VALUES (?, ?)")
    .run("codex-mem", "2026-02-18T00:00:00.000Z");

  legacyDb
    .prepare(
      `
      INSERT INTO entries (
        id, title, body, entry_type, project, session_id, source_ref, metadata_json, created_at, created_at_unix_ms
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    )
    .run(
      "legacy-entry-1",
      "Legacy Decision",
      "Legacy record before migration v1 scope",
      "decision",
      "codex-mem",
      null,
      "docs/decisions.md",
      "{}",
      "2026-02-18T00:00:01.000Z",
      1759999999000,
    );

  legacyDb.close();
}
