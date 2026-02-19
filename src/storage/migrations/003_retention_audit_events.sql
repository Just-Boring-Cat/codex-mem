CREATE TABLE IF NOT EXISTS retention_audit_events (
  id TEXT PRIMARY KEY,
  mode TEXT NOT NULL,
  executed_at TEXT NOT NULL,
  project TEXT NULL,
  total_candidates INTEGER NOT NULL,
  by_reason_json TEXT NOT NULL,
  input_json TEXT NOT NULL,
  candidate_ids_json TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_retention_audit_events_executed
  ON retention_audit_events(executed_at DESC);

