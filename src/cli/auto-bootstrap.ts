import { loadSettings } from "../config/settings.js";
import { createDatabase } from "../storage/db.js";
import { EntriesRepository } from "../storage/repositories/entries-repository.js";

interface BootstrapOptions {
  project?: string;
  type?: string;
  limit: number;
}

async function main(): Promise<void> {
  const settings = loadSettings();
  const options = parseArgs(process.argv.slice(2));
  const project = options.project ?? settings.projectName;
  const db = createDatabase({ dbPath: settings.dbPath });

  try {
    const repository = new EntriesRepository(db.db);
    const items = repository.listRecentEntries({
      limit: options.limit,
      project,
      type: options.type,
    });

    console.log(`Recent memory entries (project: ${project}, limit: ${options.limit})`);
    if (items.length === 0) {
      console.log("No entries found.");
      return;
    }

    for (const item of items) {
      console.log(`[${item.createdAt}] ${item.entryType} ${item.id} ${item.title}`);
    }
  } finally {
    db.close();
  }
}

function parseArgs(argv: string[]): BootstrapOptions {
  const options: BootstrapOptions = {
    limit: 8,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    switch (token) {
      case "--project":
        options.project = argv[i + 1];
        i += 1;
        break;
      case "--type":
        options.type = argv[i + 1];
        i += 1;
        break;
      case "--limit": {
        const parsed = Number.parseInt(argv[i + 1] ?? "", 10);
        if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 100) {
          throw new Error("--limit must be an integer between 1 and 100");
        }
        options.limit = parsed;
        i += 1;
        break;
      }
      case "-h":
      case "--help":
        printUsage();
        process.exit(0);
        return options;
      default:
        throw new Error(`Unknown argument: ${token}`);
    }
  }

  return options;
}

function printUsage(): void {
  console.log("Usage: npm run auto:bootstrap -- [options]");
  console.log("Options:");
  console.log("  --project <project>");
  console.log("  --type <entry_type>");
  console.log("  --limit <1-100> (default: 8)");
}

main().catch((error) => {
  console.error("Auto bootstrap failed", error);
  process.exit(1);
});
