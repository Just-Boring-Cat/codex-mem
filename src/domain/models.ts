export interface SaveMemoryInput {
  text: string;
  title?: string;
  project?: string;
  type?: string;
  sourceRef?: string;
  metadata?: Record<string, unknown>;
  sessionId?: string;
}

export interface SaveMemoryResult {
  status: "saved";
  id: string;
  createdAt: string;
}

export interface SearchInput {
  query: string;
  project?: string;
  type?: string;
  limit?: number;
  offset?: number;
}

export interface EntryIndexItem {
  id: string;
  title: string;
  entryType: string;
  project: string;
  createdAt: string;
  score: number;
}

export interface SearchResult {
  items: EntryIndexItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface TimelineInput {
  anchorId: string;
  depthBefore?: number;
  depthAfter?: number;
}

export interface TimelineResult {
  anchorId: string;
  items: EntryIndexItem[];
}

export interface GetEntriesInput {
  ids: string[];
}

export interface EntryDetailItem {
  id: string;
  title: string;
  body: string;
  entryType: string;
  project: string;
  sessionId: string | null;
  sourceRef: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface GetEntriesResult {
  items: EntryDetailItem[];
}

export interface CreateEntryRecord {
  id: string;
  title: string;
  body: string;
  entryType: string;
  project: string;
  sourceRef: string | null;
  contentHash: string | null;
  sessionId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  createdAtUnixMs: number;
}
