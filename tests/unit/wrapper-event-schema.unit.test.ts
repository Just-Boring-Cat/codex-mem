import { describe, expect, it } from "vitest";

import { parseSessionEvent } from "../../src/wrapper/event-schema.js";

describe("wrapper event schema", () => {
  it("parses valid prompt event", () => {
    const parsed = parseSessionEvent({
      session_id: "session-1",
      event_id: "event-1",
      event_type: "prompt",
      timestamp: "2026-02-20T12:00:00Z",
      content: "Need to add wrapper capture mode.",
      metadata: {
        project: "codex-mem",
      },
    });

    expect(parsed.eventType).toBe("prompt");
    expect(parsed.sessionId).toBe("session-1");
  });

  it("rejects invalid event type", () => {
    expect(() => parseSessionEvent({
      session_id: "session-1",
      event_id: "event-2",
      event_type: "unknown",
      timestamp: "2026-02-20T12:00:00Z",
      content: "invalid type",
    })).toThrowError(/event_type/i);
  });
});
