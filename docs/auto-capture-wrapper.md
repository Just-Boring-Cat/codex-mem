# Auto Capture Wrapper Draft

## Purpose

Define the interim wrapper-agent design that captures session activity and writes durable memory automatically before fully native automatic mode is available.

## Why This Layer

Current MCP integration does not guarantee direct access to complete conversation events in every client path. A local wrapper agent can observe session events, extract high-value context, and persist it to `codex-mem`.

## Scope

In scope:

- Prompt and response event capture
- Tool call and tool result capture
- Automatic memory candidate extraction
- Policy filtering, redaction, and dedupe
- Controlled writes to `save_memory`
- Audit trail for saved and skipped candidates

Out of scope:

- Training data export
- Raw transcript dump without filtering
- Mandatory cloud transport

## High-Level Components

1. Session Adapter
- Receives prompt, response, and tool events from wrapper entrypoints.

2. Candidate Extractor
- Produces memory candidates from event windows.
- Focuses on decisions, constraints, fixes, and open questions.

3. Policy and Redaction
- Blocks secret-like values and disallowed patterns.
- Sanitizes payload before storage.

4. Scoring and Dedupe
- Calculates confidence score.
- Drops duplicates using normalized fingerprints.

5. Memory Writer
- Calls `save_memory` for candidates above threshold.
- Adds metadata for traceability.

6. Audit Logger
- Records saved and skipped candidates with reasons.

## Event Contract (Draft)

```json
{
  "session_id": "session-uuid",
  "event_id": "event-uuid",
  "event_type": "prompt|response|tool_call|tool_result",
  "timestamp": "2026-02-20T12:00:00Z",
  "content": "text payload",
  "metadata": {
    "tool_name": "search",
    "project": "codex-mem"
  }
}
```

## Candidate Contract (Draft)

```json
{
  "title": "Decision: use post-commit capture hook",
  "text": "Team selected post-commit hook to auto-capture commit context.",
  "type": "decision",
  "project": "codex-mem",
  "source_ref": "wrapper:session/<session_id>",
  "metadata": {
    "capture_mode": "assist",
    "confidence": 0.87,
    "event_ids": ["e1", "e2", "e3"]
  }
}
```

## Capture Modes

- `off`: no automatic capture
- `assist`: only high-confidence durable facts
- `full`: broader capture with stricter dedupe and redaction

Default pilot mode: `assist`.

## Initial Policy Rules

1. Block if text matches secret-like patterns.
2. Block candidates below confidence threshold.
3. Block very short low-signal candidates.
4. Block duplicates in lookback window.
5. Require one durable signal:
- explicit decision
- resolved bug
- integration constraint
- pending risk or open question

## Dedupe Strategy

Fingerprint input:

- normalized title
- normalized text
- project
- candidate type

Window:

- reject duplicates within the last 30 days by default.

## Write Strategy

- Buffer events in short windows, for example every 5 to 10 turns.
- Extract candidates at each window boundary.
- Save only approved candidates.
- Emit one handoff summary candidate at session end.

## Observability

Audit log fields:

- timestamp
- session_id
- candidate_id
- decision (`saved` or `skipped`)
- reason
- confidence
- policy rule triggered

## Security Baseline Additions

- Never store raw tokens or credentials.
- Support allowlisted source paths for capture.
- Provide explicit opt-out per repository.
- Keep storage local by default.

## Test Plan Draft

1. Unit tests:
- redaction rules
- dedupe logic
- confidence threshold gate

2. Integration tests:
- event-window to saved-memory flow
- policy-blocked candidate behavior
- audit logging behavior

3. Manual tests:
- cross-session recall in same repo
- mixed technical and non-technical conversation filtering

## Delivery Phases

Phase 1:

- Implement event adapter and candidate extractor skeleton.

Phase 2:

- Add policy, scoring, dedupe, and writer integration.

Phase 3:

- Add audit logs and operator controls.

Phase 4:

- Pilot in one repository and tune thresholds.

## Open Questions

1. Which VS Code extension hooks are available for reliable interception?
2. Should wrapper mode support optional local encryption for stored summaries?
3. Should per-project policy profiles ship in wrapper v1?
