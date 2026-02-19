import path from "node:path";
import { execFileSync } from "node:child_process";

import { describe, expect, it } from "vitest";

describe("install-mcp script", () => {
  const repoRoot = process.cwd();
  const scriptPath = path.join(repoRoot, "scripts", "install-mcp.sh");

  it("prints help text", () => {
    const output = execFileSync("bash", [scriptPath, "--help"], {
      cwd: repoRoot,
      encoding: "utf8",
    });

    expect(output).toContain("Usage:");
    expect(output).toContain("--dry-run");
    expect(output).toContain("--db-path");
  });

  it("supports dry-run with explicit options", () => {
    const output = execFileSync(
      "bash",
      [
        scriptPath,
        "--dry-run",
        "--no-register",
        "--name",
        "codex-mem-test",
        "--db-path",
        ".memory/test-memory.db",
      ],
      {
        cwd: repoRoot,
        encoding: "utf8",
      },
    );

    expect(output).toContain("DRY RUN");
    expect(output).toContain("codex-mem-test");
    expect(output).toContain(".memory/test-memory.db");
    expect(output).toContain("npm install");
    expect(output).toContain("npm run migrate");
  });
});
