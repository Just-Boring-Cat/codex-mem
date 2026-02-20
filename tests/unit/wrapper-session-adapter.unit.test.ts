import { describe, expect, it } from "vitest";

import { WrapperSessionAdapter } from "../../src/wrapper/session-adapter.js";

describe("wrapper session adapter", () => {
  it("accepts raw event input and returns extracted candidates", () => {
    const adapter = new WrapperSessionAdapter();

    const result = adapter.acceptRawEvent({
      session_id: "session-1",
      event_id: "event-1",
      event_type: "response",
      timestamp: "2026-02-20T12:00:00Z",
      content: "Decision: implement wrapper adapter skeleton.",
      metadata: {
        project: "codex-mem",
      },
    });

    expect(result.event.eventType).toBe("response");
    expect(result.candidates.length).toBe(1);
    expect(result.candidates[0]?.type).toBe("decision");
  });
});
