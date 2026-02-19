import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

import { AppError } from "../domain/errors.js";

interface DatabaseOptions {
  dbPath: string;
}

interface Migration {
  version: string;
  sql: string;
}

export interface DatabaseContext {
  db: Database.Database;
  close: () => void;
}

export function createDatabase(options: DatabaseOptions): DatabaseContext {
  try {
    fs.mkdirSync(path.dirname(options.dbPath), { recursive: true });
    const db = new Database(options.dbPath);

    db.pragma("foreign_keys = ON");
    db.pragma("journal_mode = WAL");

    runMigrations(db);

    return {
      db,
      close: () => db.close(),
    };
  } catch (error) {
    throw new AppError("STORAGE_FAILURE", "Failed to initialize database", {
      dbPath: options.dbPath,
      cause: error instanceof Error ? error.message : String(error),
    });
  }
}

function runMigrations(db: Database.Database): void {
  const migrations = loadMigrations();

  db.exec(
    "CREATE TABLE IF NOT EXISTS schema_migrations (version TEXT PRIMARY KEY, applied_at TEXT NOT NULL)",
  );

  const appliedRows = db
    .prepare("SELECT version FROM schema_migrations")
    .all() as Array<{ version: string }>;
  const applied = new Set(appliedRows.map((row) => row.version));

  const applyMigration = db.transaction((migration: Migration) => {
    db.exec(migration.sql);
    db.prepare("INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)")
      .run(migration.version, new Date().toISOString());
  });

  try {
    for (const migration of migrations) {
      if (!applied.has(migration.version)) {
        applyMigration(migration);
      }
    }
  } catch (error) {
    throw new AppError("MIGRATION_FAILURE", "Failed to run migrations", {
      cause: error instanceof Error ? error.message : String(error),
    });
  }
}

function loadMigrations(): Migration[] {
  const migrationsDir = new URL("./migrations/", import.meta.url);
  const files = fs.readdirSync(migrationsDir)
    .filter((fileName) => fileName.endsWith(".sql"))
    .sort((a, b) => a.localeCompare(b));

  return files.map((fileName) => ({
    version: fileName.replace(/\.sql$/, ""),
    sql: fs.readFileSync(new URL(fileName, migrationsDir), "utf8"),
  }));
}
