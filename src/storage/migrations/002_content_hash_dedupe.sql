ALTER TABLE entries ADD COLUMN content_hash TEXT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_entries_source_hash_dedupe
  ON entries(source_ref, content_hash)
  WHERE source_ref IS NOT NULL AND content_hash IS NOT NULL;

