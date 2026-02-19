import { loadSettings } from "../config/settings.js";
import { IngestionService } from "../services/ingestion-service.js";
import { PolicyService } from "../services/policy-service.js";
import { createDatabase } from "../storage/db.js";
import { EntriesRepository } from "../storage/repositories/entries-repository.js";

const DEFAULT_INGEST_SOURCES = [
  "docs/session-log.md",
  "docs/decisions.md",
  "docs/requirements.md",
];

async function main(): Promise<void> {
  const settings = loadSettings();
  const db = createDatabase({ dbPath: settings.dbPath });

  try {
    const ingestionService = new IngestionService(
      new EntriesRepository(db.db),
      new PolicyService(),
    );

    const result = await ingestionService.ingest({
      rootDir: process.cwd(),
      project: settings.projectName,
      sources: DEFAULT_INGEST_SOURCES,
    });

    console.log("Ingestion complete");
    console.log(`Processed sources: ${result.processedSources}`);
    console.log(`Imported entries: ${result.importedEntries}`);
    console.log(`Duplicate entries: ${result.duplicateEntries}`);
    console.log(`Skipped sources: ${result.skippedSources.length}`);
  } finally {
    db.close();
  }
}

main().catch((error) => {
  console.error("Ingestion failed", error);
  process.exit(1);
});

