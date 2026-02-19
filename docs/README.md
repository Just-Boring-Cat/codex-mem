# Documentation Map

This directory is the implementation and operations source of truth for `codex-mem`.

Primary public entry point:

- `README.md` (repository root): onboarding, quick start, MCP setup, manual verification

## Core Planning and Architecture

- `docs/project-plan.md`: execution checklist and scope boundaries
- `docs/requirements.md`: problem statement, goals, constraints, and v1 scope
- `docs/architecture.md`: system architecture, components, and data flow
- `docs/architecture-diagram.mmd`: architecture diagram (Mermaid)
- `docs/data-model.md`: entities, relationships, and data sensitivity notes
- `docs/data-model-diagram.mmd`: data model diagram (Mermaid)
- `docs/delivery-plan.md`: milestones, definition of done, and release gates
- `docs/mvp-spec.md`: MVP functional and non-functional specification

## API and Implementation

- `docs/runtime-decision.md`: finalized v1 runtime selection and rationale
- `docs/technical-design.md`: implementation-ready module and runtime design
- `docs/mcp-api-spec.md`: MCP tool contract, payloads, and error model
- `docs/implementation-kickoff.md`: milestone kickoff sequence and readiness checklist

## Operations and Quality

- `docs/setup-guide.md`: local setup and MCP wiring (including VS Code custom MCP fields)
- `docs/usage-guide.md`: operator workflow for save/search/timeline/detail retrieval
- `docs/troubleshooting.md`: common failures, checks, and recovery actions
- `docs/security-baseline.md`: minimum security controls and release security checks
- `docs/operations-runbook.md`: startup, backup, migration, and incident procedures
- `docs/test-strategy.md`: test levels, matrix, and exit criteria

## Decision and Session Logs

- `docs/decisions.md`: ADR-style decision log
- `docs/session-log.md`: session-by-session progress log

## I18N

- `docs/i18n/README.es.md`: Espanol quick-start README
- `docs/i18n/README.de.md`: German quick-start README

## Planning Flow

1. Requirements
2. Architecture
3. Data model
4. Delivery plan
5. Release prep

## Project Scope

Primary target is a Codex-compatible memory system with persistent local storage, retrieval via MCP tools, and an explicit privacy/security model.
