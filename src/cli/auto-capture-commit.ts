import { execFileSync } from "node:child_process";

import { loadSettings } from "../config/settings.js";
import { MemoryService } from "../services/memory-service.js";
import { PolicyService } from "../services/policy-service.js";
import { createDatabase } from "../storage/db.js";
import { EntriesRepository } from "../storage/repositories/entries-repository.js";

interface CaptureOptions {
  project?: string;
  entryType: string;
  dryRun: boolean;
}

interface CommitDetails {
  hash: string;
  shortHash: string;
  subject: string;
  body: string;
  authorName: string;
  authorEmail: string;
  committedAt: string;
  branch: string;
  files: string[];
}

async function main(): Promise<void> {
  const settings = loadSettings();
  const options = parseArgs(process.argv.slice(2));
  const commit = readLatestCommit();

  const textLines = [
    `Commit ${commit.shortHash} on ${commit.branch}`,
    `Subject: ${commit.subject}`,
    `Author: ${commit.authorName} <${commit.authorEmail}>`,
    `Committed at: ${commit.committedAt}`,
    "",
    "Changed files:",
    ...commit.files.map((file) => `- ${file}`),
  ];

  if (commit.body.trim()) {
    textLines.push("", "Body:", commit.body.trim());
  }

  const text = textLines.join("\n");
  const title = `Commit ${commit.shortHash}: ${commit.subject}`.slice(0, 120);
  const project = options.project ?? settings.projectName;

  if (options.dryRun) {
    console.log("DRY RUN: would save commit memory");
    console.log(`project: ${project}`);
    console.log(`type: ${options.entryType}`);
    console.log(`source_ref: git:commit/${commit.hash}`);
    console.log(`title: ${title}`);
    return;
  }

  const db = createDatabase({ dbPath: settings.dbPath });
  try {
    const service = new MemoryService(
      new EntriesRepository(db.db),
      new PolicyService(),
    );

    const result = await service.saveMemory({
      text,
      title,
      project,
      type: options.entryType,
      sourceRef: `git:commit/${commit.hash}`,
      metadata: {
        source: "auto-capture-commit-cli",
        commit_hash: commit.hash,
        short_hash: commit.shortHash,
        branch: commit.branch,
        author_name: commit.authorName,
        author_email: commit.authorEmail,
        committed_at: commit.committedAt,
        file_count: commit.files.length,
      },
    });

    console.log("Captured latest commit into memory");
    console.log(`id: ${result.id}`);
    console.log(`commit: ${commit.shortHash}`);
  } finally {
    db.close();
  }
}

function parseArgs(argv: string[]): CaptureOptions {
  const options: CaptureOptions = {
    entryType: "commit",
    dryRun: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    switch (token) {
      case "--project":
        options.project = argv[i + 1];
        i += 1;
        break;
      case "--type":
        options.entryType = argv[i + 1] ?? "commit";
        i += 1;
        break;
      case "--dry-run":
        options.dryRun = true;
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
  console.log("Usage: npm run auto:capture:commit -- [options]");
  console.log("Options:");
  console.log("  --project <project>");
  console.log("  --type <entry_type> (default: commit)");
  console.log("  --dry-run");
}

function readLatestCommit(): CommitDetails {
  const pretty = runGit([
    "log",
    "-1",
    "--pretty=format:%H%n%h%n%s%n%b%n%an%n%ae%n%cI%n%D",
  ]);
  const [hash, shortHash, subject, ...rest] = pretty.split("\n");

  if (!hash || !shortHash || !subject || rest.length < 4) {
    throw new Error("Unable to parse latest commit details");
  }

  const authorName = rest[rest.length - 4] ?? "";
  const authorEmail = rest[rest.length - 3] ?? "";
  const committedAt = rest[rest.length - 2] ?? "";
  const decorations = rest[rest.length - 1] ?? "";
  const body = rest.slice(0, Math.max(0, rest.length - 4)).join("\n");
  const branch = parseBranchName(decorations);
  const files = runGit(["show", "--name-only", "--pretty=format:", hash])
    .split("\n")
    .map((value) => value.trim())
    .filter(Boolean);

  return {
    hash,
    shortHash,
    subject,
    body,
    authorName,
    authorEmail,
    committedAt,
    branch,
    files,
  };
}

function parseBranchName(decorations: string): string {
  const headMatch = decorations.match(/HEAD -> ([^,]+)/);
  if (headMatch && headMatch[1]) {
    return headMatch[1].trim();
  }

  const firstDecoration = decorations
    .split(",")
    .map((value) => value.trim())
    .find((value) => value.length > 0);

  return firstDecoration ?? "unknown";
}

function runGit(args: string[]): string {
  return execFileSync("git", args, {
    cwd: process.cwd(),
    encoding: "utf8",
  }).trimEnd();
}

main().catch((error) => {
  console.error("Auto capture commit failed", error);
  process.exit(1);
});
