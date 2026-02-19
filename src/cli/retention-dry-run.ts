import { loadSettings } from "../config/settings.js";
import { RetentionService } from "../services/retention-service.js";
import { createDatabase } from "../storage/db.js";
import { EntriesRepository } from "../storage/repositories/entries-repository.js";

async function main(): Promise<void> {
  const settings = loadSettings();
  const maxAgeDays = readIntEnv("RETENTION_MAX_AGE_DAYS");
  const maxEntriesPerProject = readIntEnv("RETENTION_MAX_ENTRIES_PER_PROJECT");
  const project = process.env.RETENTION_PROJECT?.trim() || settings.projectName;

  const db = createDatabase({ dbPath: settings.dbPath });
  try {
    const retentionService = new RetentionService(new EntriesRepository(db.db));
    const report = await retentionService.dryRun({
      maxAgeDays: maxAgeDays ?? undefined,
      maxEntriesPerProject: maxEntriesPerProject ?? undefined,
      project: project || undefined,
    });

    console.log(JSON.stringify(report, null, 2));
  } finally {
    db.close();
  }
}

main().catch((error) => {
  console.error("Retention dry-run failed", error);
  process.exit(1);
});

function readIntEnv(name: string): number | null {
  const raw = process.env[name];
  if (!raw || raw.trim().length === 0) {
    return null;
  }

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed)) {
    throw new Error(`${name} must be an integer`);
  }
  return parsed;
}

