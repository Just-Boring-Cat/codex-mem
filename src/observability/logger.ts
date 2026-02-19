export type LogLevel = "info" | "error";

interface LogPayload {
  [key: string]: unknown;
}

export function logInfo(event: string, payload: LogPayload = {}): void {
  writeLog("info", event, payload);
}

export function logError(event: string, payload: LogPayload = {}): void {
  writeLog("error", event, payload);
}

function writeLog(level: LogLevel, event: string, payload: LogPayload): void {
  const message = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    event,
    ...payload,
  });

  if (level === "error") {
    console.error(message);
    return;
  }

  console.log(message);
}

