export type ErrorCode =
  | "INVALID_ARGUMENT"
  | "POLICY_BLOCKED"
  | "ENTRY_NOT_FOUND"
  | "STORAGE_FAILURE"
  | "MIGRATION_FAILURE";

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly details?: Record<string, unknown>;

  constructor(code: ErrorCode, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.details = details;
  }
}

export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  return new AppError("STORAGE_FAILURE", "Unexpected internal error", {
    cause: error instanceof Error ? error.message : String(error),
  });
}

