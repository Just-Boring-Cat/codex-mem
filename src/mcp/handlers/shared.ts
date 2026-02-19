import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

import { toAppError } from "../../domain/errors.js";

export type ToolResult = CallToolResult;

export function successResult(message: string, data: Record<string, unknown>): ToolResult {
  return {
    content: [{ type: "text", text: message }],
    structuredContent: data,
  };
}

export function errorResult(error: unknown): ToolResult {
  const appError = toAppError(error);
  return {
    content: [{ type: "text", text: appError.message }],
    structuredContent: {
      error: {
        code: appError.code,
        message: appError.message,
        details: appError.details,
      },
    },
    isError: true,
  };
}
