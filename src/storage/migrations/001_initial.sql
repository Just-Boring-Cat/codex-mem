CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
  name TEXT PRIMARY KEY,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  project TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(project) REFERENCES projects(name) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS entries (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  entry_type TEXT NOT NULL,
  project TEXT NOT NULL,
  session_id TEXT NULL,
  source_ref TEXT NULL,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  created_at_unix_ms INTEGER NOT NULL,
  FOREIGN KEY(project) REFERENCES projects(name) ON DELETE CASCADE,
  FOREIGN KEY(session_id) REFERENCES sessions(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS entry_metadata (
  entry_id TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  PRIMARY KEY(entry_id, key),
  FOREIGN KEY(entry_id) REFERENCES entries(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS entry_links (
  from_entry_id TEXT NOT NULL,
  to_entry_id TEXT NOT NULL,
  relation_type TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY(from_entry_id, to_entry_id, relation_type),
  FOREIGN KEY(from_entry_id) REFERENCES entries(id) ON DELETE CASCADE,
  FOREIGN KEY(to_entry_id) REFERENCES entries(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ingestion_events (
  id TEXT PRIMARY KEY,
  source_ref TEXT NOT NULL,
  imported_at TEXT NOT NULL,
  imported_count INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_entries_project_type_created
  ON entries(project, entry_type, created_at_unix_ms DESC);

CREATE VIRTUAL TABLE IF NOT EXISTS entries_fts
USING fts5(title, body, content='entries', content_rowid='rowid');

CREATE TRIGGER IF NOT EXISTS entries_ai
AFTER INSERT ON entries BEGIN
  INSERT INTO entries_fts(rowid, title, body)
  VALUES (new.rowid, new.title, new.body);
END;

CREATE TRIGGER IF NOT EXISTS entries_ad
AFTER DELETE ON entries BEGIN
  INSERT INTO entries_fts(entries_fts, rowid, title, body)
  VALUES('delete', old.rowid, old.title, old.body);
END;

CREATE TRIGGER IF NOT EXISTS entries_au
AFTER UPDATE ON entries BEGIN
  INSERT INTO entries_fts(entries_fts, rowid, title, body)
  VALUES('delete', old.rowid, old.title, old.body);
  INSERT INTO entries_fts(rowid, title, body)
  VALUES (new.rowid, new.title, new.body);
END;

