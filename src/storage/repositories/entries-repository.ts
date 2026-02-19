import Database from "better-sqlite3";

import type {
  CreateEntryRecord,
  EntryDetailItem,
  EntryIndexItem,
  SearchInput,
  TimelineResult,
} from "../../domain/models.js";

type EntryRow = {
  rowid: number;
  id: string;
  title: string;
  body: string;
  entry_type: string;
  project: string;
  session_id: string | null;
  source_ref: string | null;
  content_hash: string | null;
  metadata_json: string;
  created_at: string;
  created_at_unix_ms: number;
};

type EntryDetailRow = {
  id: string;
  title: string;
  body: string;
  entry_type: string;
  project: string;
  session_id: string | null;
  source_ref: string | null;
  metadata_json: string;
  created_at: string;
};

type SearchRow = {
  id: string;
  title: string;
  entry_type: string;
  project: string;
  created_at: string;
  rank_score: number;
};

type RetentionRow = {
  id: string;
  project: string;
  created_at_unix_ms: number;
};

export class EntriesRepository {
  constructor(private readonly db: Database.Database) {}

  insertEntry(entry: CreateEntryRecord): void {
    const insertProject = this.db.prepare(
      "INSERT OR IGNORE INTO projects (name, created_at) VALUES (?, ?)",
    );

    const insertSession = this.db.prepare(
      "INSERT OR IGNORE INTO sessions (id, project, created_at) VALUES (?, ?, ?)",
    );

    const insertEntry = this.db.prepare(`
      INSERT INTO entries (
        id, title, body, entry_type, project, session_id, source_ref, content_hash, metadata_json, created_at, created_at_unix_ms
      )
      VALUES (
        @id, @title, @body, @entry_type, @project, @session_id, @source_ref, @content_hash, @metadata_json, @created_at, @created_at_unix_ms
      )
    `);

    const write = this.db.transaction((record: CreateEntryRecord) => {
      insertProject.run(record.project, record.createdAt);
      if (record.sessionId) {
        insertSession.run(record.sessionId, record.project, record.createdAt);
      }

      insertEntry.run({
        id: record.id,
        title: record.title,
        body: record.body,
        entry_type: record.entryType,
        project: record.project,
        session_id: record.sessionId,
        source_ref: record.sourceRef,
        content_hash: record.contentHash,
        metadata_json: JSON.stringify(record.metadata ?? {}),
        created_at: record.createdAt,
        created_at_unix_ms: record.createdAtUnixMs,
      });
    });

    write(entry);
  }

  searchEntries(input: Required<Pick<SearchInput, "query" | "limit" | "offset">> &
    Pick<SearchInput, "project" | "type">): { items: EntryIndexItem[]; total: number } {
    const where: string[] = ["entries_fts MATCH @fts_query"];
    const params: Record<string, unknown> = {
      fts_query: normalizeFtsQuery(input.query),
      limit: input.limit,
      offset: input.offset,
    };

    if (input.project) {
      where.push("e.project = @project");
      params.project = input.project;
    }

    if (input.type) {
      where.push("e.entry_type = @entry_type");
      params.entry_type = input.type;
    }

    const whereSql = where.join(" AND ");
    const rows = this.db
      .prepare(
        `
        SELECT e.id, e.title, e.entry_type, e.project, e.created_at, bm25(entries_fts) AS rank_score
        FROM entries_fts
        JOIN entries e ON e.rowid = entries_fts.rowid
        WHERE ${whereSql}
        ORDER BY rank_score ASC, e.created_at_unix_ms DESC
        LIMIT @limit OFFSET @offset
      `,
      )
      .all(params) as SearchRow[];

    const countRow = this.db
      .prepare(
        `
        SELECT COUNT(*) AS total
        FROM entries_fts
        JOIN entries e ON e.rowid = entries_fts.rowid
        WHERE ${whereSql}
      `,
      )
      .get(params) as { total: number };

    return {
      items: rows.map((row) => ({
        id: row.id,
        title: row.title,
        entryType: row.entry_type,
        project: row.project,
        createdAt: row.created_at,
        score: Number.isFinite(row.rank_score) ? -row.rank_score : 0,
      })),
      total: countRow.total,
    };
  }

  getEntriesByIds(ids: string[]): EntryDetailItem[] {
    if (ids.length === 0) {
      return [];
    }

    const placeholders = ids.map(() => "?").join(",");
    const rows = this.db
      .prepare(
        `
        SELECT id, title, body, entry_type, project, session_id, source_ref, metadata_json, created_at
        FROM entries
        WHERE id IN (${placeholders})
      `,
      )
      .all(...ids) as EntryDetailRow[];

    const map = new Map(rows.map((row) => [row.id, toEntryDetail(row)]));
    return ids.map((id) => map.get(id)).filter((value): value is EntryDetailItem => Boolean(value));
  }

  getTimeline(anchorId: string, depthBefore: number, depthAfter: number): TimelineResult | null {
    const anchor = this.db
      .prepare(
        `
        SELECT rowid, id, title, body, entry_type, project, session_id, source_ref, content_hash, metadata_json, created_at, created_at_unix_ms
        FROM entries
        WHERE id = ?
      `,
      )
      .get(anchorId) as EntryRow | undefined;

    if (!anchor) {
      return null;
    }

    const beforeRows = this.db
      .prepare(
        `
        SELECT rowid, id, title, body, entry_type, project, session_id, source_ref, content_hash, metadata_json, created_at, created_at_unix_ms
        FROM entries
        WHERE project = ?
          AND (
            created_at_unix_ms < ?
            OR (created_at_unix_ms = ? AND rowid < ?)
          )
        ORDER BY created_at_unix_ms DESC, rowid DESC
        LIMIT ?
      `,
      )
      .all(
        anchor.project,
        anchor.created_at_unix_ms,
        anchor.created_at_unix_ms,
        anchor.rowid,
        depthBefore,
      ) as EntryRow[];

    const afterRows = this.db
      .prepare(
        `
        SELECT rowid, id, title, body, entry_type, project, session_id, source_ref, content_hash, metadata_json, created_at, created_at_unix_ms
        FROM entries
        WHERE project = ?
          AND (
            created_at_unix_ms > ?
            OR (created_at_unix_ms = ? AND rowid > ?)
          )
        ORDER BY created_at_unix_ms ASC, rowid ASC
        LIMIT ?
      `,
      )
      .all(
        anchor.project,
        anchor.created_at_unix_ms,
        anchor.created_at_unix_ms,
        anchor.rowid,
        depthAfter,
      ) as EntryRow[];

    const items: EntryIndexItem[] = [
      ...beforeRows.reverse().map(toEntryIndex),
      toEntryIndex(anchor),
      ...afterRows.map(toEntryIndex),
    ];

    return {
      anchorId: anchor.id,
      items,
    };
  }

  hasEntryForSourceAndHash(sourceRef: string, contentHash: string): boolean {
    const row = this.db
      .prepare(
        `
        SELECT 1 AS exists_flag
        FROM entries
        WHERE source_ref = ? AND content_hash = ?
        LIMIT 1
      `,
      )
      .get(sourceRef, contentHash) as { exists_flag: number } | undefined;

    return Boolean(row);
  }

  recordIngestionEvent(event: {
    id: string;
    sourceRef: string;
    importedAt: string;
    importedCount: number;
  }): void {
    this.db
      .prepare(
        `
        INSERT INTO ingestion_events (id, source_ref, imported_at, imported_count)
        VALUES (?, ?, ?, ?)
      `,
      )
      .run(event.id, event.sourceRef, event.importedAt, event.importedCount);
  }

  listEntriesForRetention(project?: string): Array<{ id: string; project: string; createdAtUnixMs: number }> {
    const rows = (project
      ? this.db
        .prepare(
          `
            SELECT id, project, created_at_unix_ms
            FROM entries
            WHERE project = ?
            ORDER BY project ASC, created_at_unix_ms DESC, rowid DESC
          `,
        )
        .all(project)
      : this.db
        .prepare(
          `
            SELECT id, project, created_at_unix_ms
            FROM entries
            ORDER BY project ASC, created_at_unix_ms DESC, rowid DESC
          `,
        )
        .all()) as RetentionRow[];

    return rows.map((row) => ({
      id: row.id,
      project: row.project,
      createdAtUnixMs: row.created_at_unix_ms,
    }));
  }

  recordRetentionAuditEvent(event: {
    id: string;
    mode: "dry-run";
    executedAt: string;
    project: string | null;
    totalCandidates: number;
    byReasonJson: string;
    inputJson: string;
    candidateIdsJson: string;
  }): void {
    this.db
      .prepare(
        `
          INSERT INTO retention_audit_events (
            id, mode, executed_at, project, total_candidates, by_reason_json, input_json, candidate_ids_json
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
      )
      .run(
        event.id,
        event.mode,
        event.executedAt,
        event.project,
        event.totalCandidates,
        event.byReasonJson,
        event.inputJson,
        event.candidateIdsJson,
      );
  }
}

function toEntryIndex(row: Pick<EntryRow, "id" | "title" | "entry_type" | "project" | "created_at">): EntryIndexItem {
  return {
    id: row.id,
    title: row.title,
    entryType: row.entry_type,
    project: row.project,
    createdAt: row.created_at,
    score: 0,
  };
}

function toEntryDetail(
  row: EntryDetailRow,
): EntryDetailItem {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    entryType: row.entry_type,
    project: row.project,
    sessionId: row.session_id,
    sourceRef: row.source_ref,
    metadata: parseMetadata(row.metadata_json),
    createdAt: row.created_at,
  };
}

function parseMetadata(value: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(value) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return {};
  } catch {
    return {};
  }
}

function normalizeFtsQuery(query: string): string {
  const tokens = query
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean)
    .map((token) => `"${token.replaceAll('"', "")}"`);

  return tokens.join(" OR ");
}
