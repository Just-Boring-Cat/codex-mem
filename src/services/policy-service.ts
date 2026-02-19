import { AppError } from "../domain/errors.js";

const BLOCKED_PATTERNS: Array<{ name: string; regex: RegExp }> = [
  { name: "openai_secret_key", regex: /\bsk-[a-zA-Z0-9_-]{10,}\b/ },
  { name: "aws_access_key", regex: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: "github_token", regex: /\bghp_[a-zA-Z0-9]{20,}\b/ },
];

interface PolicyInput {
  text: string;
  title?: string;
  metadata?: Record<string, unknown>;
}

export class PolicyService {
  assertAllowed(input: PolicyInput): void {
    const searchable = [input.text, input.title ?? "", JSON.stringify(input.metadata ?? {})].join("\n");

    for (const pattern of BLOCKED_PATTERNS) {
      if (pattern.regex.test(searchable)) {
        throw new AppError("POLICY_BLOCKED", "Input blocked by sensitive-data policy", {
          pattern: pattern.name,
        });
      }
    }
  }
}

