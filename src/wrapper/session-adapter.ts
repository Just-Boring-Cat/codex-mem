import { extractCandidatesFromEvent, type WrapperCandidate } from "./candidate-extractor.js";
import { parseSessionEvent, type SessionEvent } from "./event-schema.js";

interface WrapperSessionAdapterOptions {
  maxEventsPerSession?: number;
}

interface AcceptRawEventResult {
  event: SessionEvent;
  candidates: WrapperCandidate[];
}

const DEFAULT_MAX_EVENTS_PER_SESSION = 100;

export class WrapperSessionAdapter {
  private readonly eventsBySession = new Map<string, SessionEvent[]>();

  constructor(private readonly options: WrapperSessionAdapterOptions = {}) {}

  acceptRawEvent(input: unknown): AcceptRawEventResult {
    const event = parseSessionEvent(input);
    this.pushEvent(event);

    const candidates = extractCandidatesFromEvent(event).map((candidate) => ({
      ...candidate,
      metadata: {
        ...candidate.metadata,
        session_event_count: this.getSessionEvents(event.sessionId).length,
      },
    }));

    return { event, candidates };
  }

  getSessionEvents(sessionId: string): SessionEvent[] {
    return [...(this.eventsBySession.get(sessionId) ?? [])];
  }

  private pushEvent(event: SessionEvent): void {
    const bucket = this.eventsBySession.get(event.sessionId) ?? [];
    bucket.push(event);

    const maxEvents = this.options.maxEventsPerSession ?? DEFAULT_MAX_EVENTS_PER_SESSION;
    if (bucket.length > maxEvents) {
      bucket.splice(0, bucket.length - maxEvents);
    }

    this.eventsBySession.set(event.sessionId, bucket);
  }
}
