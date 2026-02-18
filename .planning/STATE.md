# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-18)

**Core value:** Homeowners and community presidents can govern their community transparently — from raising ideas to collecting vendor offers to approving budgets to tracking projects — with every action logged, every vote counted by quota, and every euro traceable. The Settings engine is the constitutional brain.
**Current focus:** Phase 1 — Infrastructure & Monorepo

## Current Position

Phase: 1 of 13 (Infrastructure & Monorepo)
Plan: — of — in current phase
Status: Ready to plan Phase 1
Last activity: 2026-02-18 — Roadmap created

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**
- Total plans completed: 0
- Average duration: —
- Total execution time: —

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Key decisions affecting all phases:

- Turborepo monorepo: `apps/web` (Next.js 15), `apps/api` (Hono 4); persistent server required for BullMQ + SSE
- PostgreSQL + Drizzle ORM; NUMERIC(6,4) for quotas; decimal.js in app code; never JS floats
- better-auth with Owner Code binding for multi-role sessions across Hono + Next.js
- BullMQ + Redis for webhook delivery + meeting-locked vote window enforcement (server-side, not frontend)
- Settings engine is per-community, versioned, forward-only, audit logged — built in Phase 3

### Key Constraints

- Quotas MUST sum to exactly 100.0000% — enforced at DB constraint + application layer
- Meeting-locked votes: time windows enforced via BullMQ scheduled jobs (NOT frontend timers)
- Over-threshold payments cannot bypass vote without emergency flag + post-fact ratification vote
- One Owner Code per unit; one support per unit per idea — both enforced at DB level

### Pending Todos

None yet.

### Blockers/Concerns

None yet.

## Session Continuity

Last session: 2026-02-18
Stopped at: Roadmap created — 13 phases, 187 requirements mapped, ready to plan Phase 1
Resume file: None
