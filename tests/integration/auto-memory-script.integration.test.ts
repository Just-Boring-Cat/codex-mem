import path from "node:path";
import { execFileSync } from "node:child_process";

import { describe, expect, it } from "vitest";

describe("auto-memory script", () => {
  const repoRoot = process.cwd();
  const scriptPath = path.join(repoRoot, "scripts", "auto-memory.sh");

  it("prints help text", () => {
    const output = execFileSync("bash", [scriptPath, "--help"], {
      cwd: repoRoot,
      encoding: "utf8",
    });

    expect(output).toContain("Usage:");
    expect(output).toContain("start");
    expect(output).toContain("end");
    expect(output).toContain("commit");
  });

  it("supports start in dry-run mode", () => {
    const output = execFileSync(
      "bash",
      [scriptPath, "start", "--dry-run", "--ingest", "--project", "roadmap-demo", "--limit", "5"],
      {
        cwd: repoRoot,
        encoding: "utf8",
      },
    );

    expect(output).toContain("DRY RUN");
    expect(output).toContain("npm run ingest");
    expect(output).toContain("npm run auto:bootstrap");
    expect(output).toContain("roadmap-demo");
  });

  it("supports end in dry-run mode with summary", () => {
    const output = execFileSync(
      "bash",
      [scriptPath, "end", "--dry-run", "--summary", "Finished automation roadmap section."],
      {
        cwd: repoRoot,
        encoding: "utf8",
      },
    );

    expect(output).toContain("DRY RUN");
    expect(output).toContain("npm run auto:save");
    expect(output).toContain("--type handoff");
  });

  it("supports commit capture in dry-run mode", () => {
    const output = execFileSync("bash", [scriptPath, "commit", "--dry-run"], {
      cwd: repoRoot,
      encoding: "utf8",
    });

    expect(output).toContain("DRY RUN");
    expect(output).toContain("npm run auto:capture:commit");
  });
});
