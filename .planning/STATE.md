# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-18)

**Core value:** Homeowners and community presidents can govern their community transparently — from raising ideas to collecting vendor offers to approving budgets to tracking projects — with every action logged, every vote counted by quota, and every euro traceable. The Settings engine is the constitutional brain.
**Current focus:** Phase 1 — Infrastructure & Monorepo

## Current Position

Phase: 1 of 13 (Infrastructure & Monorepo)
Plan: 5 of 5 in current phase
Status: Executing Phase 1
Last activity: 2026-02-24 — Completed 01-04: Railway deployment config (railway.toml files)

Progress: [███░░░░░░░] 21%

## Performance Metrics

**Velocity:**
- Total plans completed: 4
- Average duration: 15min
- Total execution time: 59min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-infrastructure-and-monorepo | 4/5 | 59min | 15min |

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
- JIT package pattern: @homp/* packages export TypeScript source directly (no build step) — tsx and Next.js transpile natively
- Server/client env split: serverEnv (@t3-oss/env-core for Hono) and clientEnv (@t3-oss/env-nextjs for Next.js)
- Drizzle upgraded to 0.45.1/0.31.9; uses postgres.js driver (not pg); defineConfig format with dialect: postgresql
- globalPassThroughEnv in turbo.json for all 10 env vars — secrets flow without polluting Turbo cache hash
- ioredis { Redis } named export required under NodeNext module resolution (default import has no construct signatures)
- apps/api startup DB check exits code 1 with clear error before accepting traffic — no silent failures
- Railway: Railpack builder, no rootDirectory (repo root build), preDeployCommand runs drizzle migrate before each API deploy
- Railway: Variable references ${{Postgres.DATABASE_URL}} and ${{Redis.REDIS_URL}} for credentials — no hardcoded values

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

Last session: 2026-02-24
Stopped at: Completed 01-04-PLAN.md — Railway deployment config (railway.toml for API and web)
Resume file: None
