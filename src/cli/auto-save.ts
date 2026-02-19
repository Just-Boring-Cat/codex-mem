import { loadSettings } from "../config/settings.js";
import { MemoryService } from "../services/memory-service.js";
import { PolicyService } from "../services/policy-service.js";
import { createDatabase } from "../storage/db.js";
import { EntriesRepository } from "../storage/repositories/entries-repository.js";

interface SaveOptions {
  text: string;
  title?: string;
  type?: string;
  project?: string;
  sourceRef?: string;
  sessionId?: string;
  metadata: Record<string, unknown>;
}

async function main(): Promise<void> {
  const settings = loadSettings();
  const options = parseArgs(process.argv.slice(2));

  const db = createDatabase({ dbPath: settings.dbPath });
  try {
    const service = new MemoryService(
      new EntriesRepository(db.db),
      new PolicyService(),
    );

    const result = await service.saveMemory({
      text: options.text,
      title: options.title,
      type: options.type,
      project: options.project ?? settings.projectName,
      sourceRef: options.sourceRef,
      sessionId: options.sessionId,
      metadata: options.metadata,
    });

    console.log("Saved memory entry");
    console.log(`id: ${result.id}`);
    console.log(`created_at: ${result.createdAt}`);
  } finally {
    db.close();
  }
}

function parseArgs(argv: string[]): SaveOptions {
  const options: SaveOptions = {
    text: "",
    metadata: { source: "auto-save-cli" },
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    switch (token) {
      case "--text":
        options.text = argv[i + 1] ?? "";
        i += 1;
        break;
      case "--title":
        options.title = argv[i + 1];
        i += 1;
        break;
      case "--type":
        options.type = argv[i + 1];
        i += 1;
        break;
      case "--project":
        options.project = argv[i + 1];
        i += 1;
        break;
      case "--source-ref":
        options.sourceRef = argv[i + 1];
        i += 1;
        break;
      case "--session-id":
        options.sessionId = argv[i + 1];
        i += 1;
        break;
      case "--metadata-json": {
        const raw = argv[i + 1] ?? "";
        options.metadata = {
          ...options.metadata,
          ...parseMetadataJson(raw),
        };
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

  if (!options.text.trim()) {
    throw new Error("--text is required");
  }

  return options;
}

function printUsage(): void {
  console.log("Usage: npm run auto:save -- --text <text> [options]");
  console.log("Options:");
  console.log("  --title <title>");
  console.log("  --type <entry_type>");
  console.log("  --project <project>");
  console.log("  --source-ref <source_ref>");
  console.log("  --session-id <session_id>");
  console.log("  --metadata-json <json_object>");
}

function parseMetadataJson(raw: string): Record<string, unknown> {
  if (!raw.trim()) {
    return {};
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error("--metadata-json must be valid JSON", { cause: error });
  }

  if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
    throw new Error("--metadata-json must be a JSON object");
  }

  return parsed as Record<string, unknown>;
}

main().catch((error) => {
  console.error("Auto save failed", error);
  process.exit(1);
});
