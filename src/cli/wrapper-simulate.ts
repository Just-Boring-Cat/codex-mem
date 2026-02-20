import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { WrapperSessionAdapter } from "../wrapper/session-adapter.js";

interface SimulateOptions {
  sessionId: string;
  project: string;
  inputPath?: string;
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const adapter = new WrapperSessionAdapter();
  const events = options.inputPath
    ? loadEventsFromFile(options.inputPath)
    : defaultSampleEvents(options.sessionId, options.project);

  const candidates = [];
  for (const event of events) {
    const result = adapter.acceptRawEvent(event);
    candidates.push(...result.candidates);
  }

  console.log(`Processed events: ${events.length}`);
  console.log(`Extracted candidates: ${candidates.length}`);
  if (candidates.length > 0) {
    console.log(JSON.stringify(candidates, null, 2));
  }
}

function parseArgs(argv: string[]): SimulateOptions {
  const options: SimulateOptions = {
    sessionId: `sim-${randomUUID()}`,
    project: "codex-mem",
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    switch (token) {
      case "--session-id":
        options.sessionId = argv[i + 1] ?? options.sessionId;
        i += 1;
        break;
      case "--project":
        options.project = argv[i + 1] ?? options.project;
        i += 1;
        break;
      case "--input":
        options.inputPath = argv[i + 1];
        i += 1;
        break;
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
  console.log("Usage: npm run wrapper:simulate -- [options]");
  console.log("Options:");
  console.log("  --session-id <session_id>");
  console.log("  --project <project>");
  console.log("  --input <json_file>");
}

function loadEventsFromFile(inputPath: string): unknown[] {
  const resolved = path.resolve(process.cwd(), inputPath);
  const content = fs.readFileSync(resolved, "utf8");
  const parsed = JSON.parse(content);

  if (!Array.isArray(parsed)) {
    throw new Error("Input file must contain a JSON array of events");
  }

  return parsed;
}

function defaultSampleEvents(sessionId: string, project: string): unknown[] {
  return [
    {
      session_id: sessionId,
      event_id: `${sessionId}-1`,
      event_type: "prompt",
      timestamp: new Date().toISOString(),
      content: "We should define wrapper mode behavior first.",
      metadata: { project },
    },
    {
      session_id: sessionId,
      event_id: `${sessionId}-2`,
      event_type: "response",
      timestamp: new Date().toISOString(),
      content: "Decision: start with assist mode and strict policy gates.",
      metadata: { project },
    },
    {
      session_id: sessionId,
      event_id: `${sessionId}-3`,
      event_type: "response",
      timestamp: new Date().toISOString(),
      content: "Open question: should wrapper v1 support local encryption?",
      metadata: { project },
    },
  ];
}

main().catch((error) => {
  console.error("Wrapper simulation failed", error);
  process.exit(1);
});
