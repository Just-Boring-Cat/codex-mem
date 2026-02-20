import type { SessionEvent } from "./event-schema.js";

export type WrapperCandidateType = "decision" | "bugfix" | "constraint" | "open_question";

export interface WrapperCandidate {
  title: string;
  text: string;
  type: WrapperCandidateType;
  project: string;
  sourceRef: string;
  metadata: Record<string, unknown>;
  confidence: number;
  eventIds: string[];
}

const SIGNAL_RULES: Array<{
  type: WrapperCandidateType;
  pattern: RegExp;
  confidence: number;
}> = [
  {
    type: "decision",
    pattern: /\bdecision\b|\bdecided\b|\bagreed\b|\bchosen\b/i,
    confidence: 0.9,
  },
  {
    type: "bugfix",
    pattern: /\bfix(?:ed)?\b|\bbug\b|\bresolved\b/i,
    confidence: 0.86,
  },
  {
    type: "constraint",
    pattern: /\bconstraint\b|\bmust\b|\bcannot\b|\blimitation\b/i,
    confidence: 0.83,
  },
  {
    type: "open_question",
    pattern: /\bopen question\b|\bquestion\b|\?$/i,
    confidence: 0.8,
  },
];

export function extractCandidatesFromEvent(event: SessionEvent): WrapperCandidate[] {
  const signal = SIGNAL_RULES.find((rule) => rule.pattern.test(event.content));
  if (!signal) {
    return [];
  }

  const project = resolveProject(event);
  const title = buildTitle(signal.type, event.content);

  return [
    {
      title,
      text: event.content.trim(),
      type: signal.type,
      project,
      sourceRef: `wrapper:session/${event.sessionId}`,
      metadata: {
        source: "wrapper-candidate-extractor",
        event_type: event.eventType,
        capture_mode: "assist",
      },
      confidence: signal.confidence,
      eventIds: [event.eventId],
    },
  ];
}

function resolveProject(event: SessionEvent): string {
  const project = event.metadata.project;
  return typeof project === "string" && project.trim().length > 0 ? project.trim() : "default";
}

function buildTitle(type: WrapperCandidateType, content: string): string {
  const clean = content.replace(/\s+/g, " ").trim();
  const prefix = type.replace("_", " ");
  const snippet = clean.length > 96 ? `${clean.slice(0, 96)}...` : clean;
  return `${prefix}: ${snippet}`.slice(0, 120);
}
