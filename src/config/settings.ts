import path from "node:path";

export interface Settings {
  dbPath: string;
  projectName: string;
}

export function loadSettings(): Settings {
  const defaultDbPath = path.join(process.cwd(), ".memory", "context-memory.db");
  return {
    dbPath: process.env.MEMORY_DB_PATH ?? process.env.CODEX_MEM_DB_PATH ?? defaultDbPath,
    projectName: process.env.MEMORY_PROJECT_NAME ?? process.env.CODEX_MEM_PROJECT_NAME ?? "default",
  };
}
