# STATE.md — HOMP 2.0

## Current Position

Phase: Not started (defining requirements)
Plan: —
Status: Defining requirements
Last activity: 2026-02-18 — Milestone v1.0 started

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-18)

**Core value:** Homeowners and community presidents can govern their community transparently — from raising ideas to approving budgets to tracking projects — with every action logged, every vote counted by quota, and every euro traceable.
**Current focus:** Milestone v1.0 initialization — requirements + roadmap

## Accumulated Context

### Stack Decisions (finalized)
- Turborepo monorepo: `apps/web` (Next.js 15), `apps/api` (Hono 4)
- PostgreSQL 16 + Drizzle ORM — NUMERIC for quota/finance math
- BullMQ + Redis — webhook delivery to ADMINIA
- better-auth — multi-role auth with Owner Code unit binding
- shadcn/ui + Tailwind CSS 4 — polished UI from day one
- Railway — cloud deployment target
- pnpm workspaces, Docker Compose for local dev

### Key Constraints to Honor
- Quotas MUST sum to exactly 100.00% — enforced at DB + app level
- Meeting-locked votes enforce time windows via BullMQ scheduled jobs (NOT frontend timers)
- Over-threshold payments cannot bypass vote — hard constraint, no exceptions
- One Owner Code per unit — enforced at DB level
- One support per unit per idea — enforced at DB level

### UI Reference
See: .planning/research/UI.md — 10 screenshots captured
- Left sidebar nav with 12 modules + Adminia + Settings
- Polished cards, status badges, countdown timers, progress bars
- ADMINIA chat FAB bottom-right on all screens
- Split-panel Messages with Adminia AI as full conversation

### Pending Decisions
- (none — all major decisions confirmed)
