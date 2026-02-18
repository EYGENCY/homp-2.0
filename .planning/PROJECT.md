# HOMP 2.0 — Homeowner Management Platform

## What This Is

HOMP 2.0 is a web-first, mobile-friendly community management platform for homeowner associations. It enables structured governance, transparent finance, and democratic decision-making (Ideas → Votes → Projects lifecycle) for residential communities. It succeeds the original HOMP project and is designed to integrate with ADMINIA, a future AI chatbot and background automation agent, via webhook events and a REST API.

## Core Value

Homeowners and community presidents can govern their community transparently — from raising ideas to approving budgets to tracking projects — with every action logged, every vote counted by quota, and every euro traceable.

## Requirements

### Validated

(None yet — ship to validate)

### Active

**Community Model**
- [ ] 100-unit community with 5 blocks × 20 units, each block having 2 buildings with exact floor geometry (3 ground + 3 first + 3 second + 1 penthouse per building)
- [ ] Participation quotas stored per unit, ranging 0.5%–1.5%, enforced to sum exactly 100.00%
- [ ] Audit trail for all quota changes; system blocks publish if total ≠ 100.00%
- [ ] One Owner Code per unit (secure identity binding)
- [ ] Occupancy tracking: owner-occupied, tenant-linked (20 units), absent owners (2 units)
- [ ] Roles: Owner, Owner-President (Block or Community), Tenant, Service Provider

**Modules**
- [ ] Dashboard (owner view + president view with approval queue)
- [ ] Finance module (ledger, approval workflow, community + personal views, annual forecast)
- [ ] Ideas module (create, support with 1 vote per unit, configurable threshold + time window)
- [ ] Votes module (async, in-meeting, meeting-locked types; quota-weighted by default)
- [ ] Projects module (created only from approved votes; idea → vote → project chain)
- [ ] Meetings module (upcoming with RSVP choices, past with minutes/transcript/action items)
- [ ] Calendar (meetings, vote windows, milestones, vendor appointments, approval deadlines)
- [ ] Community directory (role-controlled contact visibility)
- [ ] Messages module (direct messaging between users)
- [ ] Notifications module (in-app + configurable channels)
- [ ] Documents module (constitution, plans, contracts, minutes, claims — linkable to objects)
- [ ] Settings engine (vote weighting, approval thresholds, quorum, meeting cadence — versioned + audited)

**Finance Logic**
- [ ] Finance approval workflow: Draft → Submitted → ApprovalRequired → Approved/Rejected → Scheduled → Paid → Archived
- [ ] Configurable approval thresholds (e.g., ≤€1,000 president approval; >€1,000 community vote)
- [ ] Hard constraint: over-threshold payments cannot bypass vote (emergency flag requires later ratification)
- [ ] Ledger entries include: vendor, category, amount, date, invoice, status, decision type

**Governance Lifecycle**
- [ ] Ideas → Votes → Projects lifecycle enforced at system level
- [ ] Meeting-locked votes: visible pre-meeting, unlock at meeting start, close at meeting end
- [ ] Projects created only from approved votes, displaying full chain (idea → vote → vendor → contract → budget → timeline)
- [ ] Change requests tracked per project

**ADMINIA Integration**
- [ ] Webhook event emission for: IdeaCreated, SupportThresholdReached, VoteOpened, VoteLocked, VoteClosed, ProjectCreated, InvoiceSubmitted, ApprovalRequired, MeetingScheduled, MinutesPublished
- [ ] REST API for ADMINIA to query HOMP data
- [ ] ADMINIA may draft but never publish; no AI action can finalize payments, votes, or role changes
- [ ] ADMINIA chat placeholder in UI (bottom-right)

**Sample Dataset**
- [ ] 100 seeded units with correct floor distribution and quotas summing to 100.00%
- [ ] 20 tenant-linked units, 2 absent owners seeded
- [ ] 8 ideas, 4 votes (1 meeting-locked), 3 projects (active/upcoming/completed)
- [ ] 1 annual meeting + 2 extraordinary meetings, fully linked calendar
- [ ] 11 recurring monthly services + pool operational costs in financial dataset
- [ ] Real topics seeded: Pergolas/toldos, Persianas regulation, Community Wi-Fi, Entrance door malfunction, Garage door malfunction (vendor bankrupt), Claims tracking (Aedas & Bertolini)

**Audit & Security**
- [ ] All actions logged to immutable audit log
- [ ] Permission matrix enforced: only owners vote, only presidents approve payments, tenants cannot view full financial breakdown, service providers see only assigned work
- [ ] Permission denials define system behavior (no silent failures)

### Out of Scope

- ADMINIA AI design — only define integration hooks and event contracts
- Legal/regulatory compliance advice — no legal claims in any module
- Mobile native apps — web-first (mobile-responsive); native app is v2+
- Blockchain verification — screenshots showed it, explicitly excluded; standard ACID DB is sufficient
- Video conferencing — meeting participation online uses external link (Zoom/Teams), not built-in

## Context

- **Successor project**: HOMP 2.0 succeeds the original HOMP project. Any prior codebase is NOT being migrated — this is a greenfield build with the same domain knowledge.
- **Community geometry**: Exact structure matters — all financial math, quota distribution, and voting weight calculations derive from block/building/floor/unit hierarchy.
- **ADMINIA awareness**: ADMINIA is a separate system. HOMP exposes hooks; ADMINIA consumes them. No AI logic lives in HOMP.
- **UI reference**: Screenshots provided show a clean, professional governance UI with sidebar nav, global search, and ADMINIA chat placeholder bottom-right. Design target is similar.
- **Recurring services**: 11 monthly services (cleaning, gardening, pool maintenance, elevator maintenance, electricity common areas, security checks, pest control, waste, insurance, administration, paddle court maintenance) plus pool operational costs are assumed budget items.

## Constraints

- **ADMINIA Integration**: Webhook events + REST API only — no shared database, no direct DB access from ADMINIA
- **Quota math**: Quotas MUST sum to exactly 100.00% — enforced at DB level AND application level; system blocks any publish action if invariant is violated
- **Governance hard constraints**: Meeting-locked votes enforce time windows; over-threshold payments cannot bypass vote; one Owner Code per unit; one support per unit per idea
- **Tech stack**: Turborepo monorepo — `apps/web` (Next.js 15), `apps/api` (Hono 4), `packages/db` (Drizzle + PostgreSQL), BullMQ + Redis for job queue
- **Web-first**: Must work on mobile browser without native app
- **Decimal precision**: All quota/financial arithmetic via `decimal.js`; stored as PostgreSQL `NUMERIC` — never JavaScript floats

## Current Milestone: v1.0 Foundation

**Goal:** Deliver the full HOMP 2.0 platform — all 12 modules, polished UI, complete governance lifecycle, ADMINIA integration hooks, and rich seed data — deployed to Railway.

**Target features:**
- Monorepo infrastructure (Turborepo + Next.js 15 + Hono API + PostgreSQL + Redis)
- Community model: 100 units, 5 blocks, quota math, roles, Owner Code binding
- All 12 modules: Dashboard, Finance, Ideas, Votes, Projects, Meetings, Calendar, Community, Messages, Notifications, Documents, Settings
- Complete governance lifecycle: Ideas → Votes → Projects enforced at system level
- Finance approval workflow with configurable thresholds
- ADMINIA integration: BullMQ webhooks + REST API + chat placeholder
- Polished UI with shadcn/ui, sidebar nav, role-based views
- Rich seed dataset (100 units, real topics, 11 recurring services)
- Railway deployment with Docker Compose for local dev

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| ADMINIA via webhook + REST API | Loose coupling; ADMINIA evolves independently; no shared DB risk | ✓ Confirmed |
| Turborepo monorepo: Next.js 15 + Hono | Persistent server needed for BullMQ + SSE; Next.js API routes insufficient | ✓ Confirmed |
| PostgreSQL + Drizzle ORM | NUMERIC type for exact quota/finance math; Drizzle avoids float casting | ✓ Confirmed |
| BullMQ + Redis for webhooks | Reliable delivery with retry/backoff to ADMINIA; no fire-and-forget | ✓ Confirmed |
| better-auth for auth | Multi-role sessions; Owner Code binding; works across Hono + Next.js | ✓ Confirmed |
| Railway for deployment | Easiest cloud target for this stack; Git-based deploys | ✓ Confirmed |
| Email + password + Owner Code | Self-service unit binding; secure identity without admin overhead | ✓ Confirmed |
| English UI only | Community can add i18n later; no added complexity in v1.0 | ✓ Confirmed |
| Polished UI from day one | Ship shippable quality throughout; shadcn/ui enables this without extra cost | ✓ Confirmed |
| YOLO execution mode | User confidence in direction; speed priority | ✓ Confirmed |
| Quality AI models | Higher accuracy for finance/governance logic planning | ✓ Confirmed |

---
*Last updated: 2026-02-18 after v1.0 milestone initialization*
