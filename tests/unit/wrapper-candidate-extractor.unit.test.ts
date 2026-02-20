import { describe, expect, it } from "vitest";

import { extractCandidatesFromEvent } from "../../src/wrapper/candidate-extractor.js";
import { parseSessionEvent } from "../../src/wrapper/event-schema.js";

describe("wrapper candidate extractor", () => {
  it("extracts decision, bugfix, constraint, and open question candidates", () => {
    const decisionEvent = parseSessionEvent({
      session_id: "s-1",
      event_id: "e-1",
      event_type: "response",
      timestamp: "2026-02-20T12:00:00Z",
      content: "Decision: use wrapper mode assist by default.",
    });
    const bugfixEvent = parseSessionEvent({
      session_id: "s-1",
      event_id: "e-2",
      event_type: "response",
      timestamp: "2026-02-20T12:01:00Z",
      content: "Fix: add parser guard for malformed event payload.",
    });
    const constraintEvent = parseSessionEvent({
      session_id: "s-1",
      event_id: "e-3",
      event_type: "response",
      timestamp: "2026-02-20T12:02:00Z",
      content: "Constraint: keep storage local only.",
    });
    const questionEvent = parseSessionEvent({
      session_id: "s-1",
      event_id: "e-4",
      event_type: "response",
      timestamp: "2026-02-20T12:03:00Z",
      content: "Open question: should we encrypt local candidate buffers?",
    });

    expect(extractCandidatesFromEvent(decisionEvent).at(0)?.type).toBe("decision");
    expect(extractCandidatesFromEvent(bugfixEvent).at(0)?.type).toBe("bugfix");
    expect(extractCandidatesFromEvent(constraintEvent).at(0)?.type).toBe("constraint");
    expect(extractCandidatesFromEvent(questionEvent).at(0)?.type).toBe("open_question");
  });
});
