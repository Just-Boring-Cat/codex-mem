import { z } from "zod";

const sessionEventInputSchema = z.object({
  session_id: z.string().min(1),
  event_id: z.string().min(1),
  event_type: z.enum(["prompt", "response", "tool_call", "tool_result"]),
  timestamp: z.string().datetime({ offset: true }),
  content: z.string().min(1),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export interface SessionEvent {
  sessionId: string;
  eventId: string;
  eventType: "prompt" | "response" | "tool_call" | "tool_result";
  timestamp: string;
  content: string;
  metadata: Record<string, unknown>;
}

export function parseSessionEvent(input: unknown): SessionEvent {
  const parsed = sessionEventInputSchema.parse(input);
  return {
    sessionId: parsed.session_id,
    eventId: parsed.event_id,
    eventType: parsed.event_type,
    timestamp: parsed.timestamp,
    content: parsed.content,
    metadata: parsed.metadata ?? {},
  };
}
