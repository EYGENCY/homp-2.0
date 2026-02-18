# HOMP 2.0 — Homeowner Management Platform

## What This Is

HOMP 2.0 is a multi-tenant, web-first community management platform for homeowner associations. It serves thousands of communities — each with its own configurable governance constitution, financial rules, and permission model. It enables structured governance, transparent finance, and democratic decision-making (Ideas → Offers → Votes → Projects lifecycle) for residential communities. It integrates with ADMINIA, a future AI chatbot and automation agent, via webhook events and a REST API.

## Core Value

Homeowners and community presidents can govern their community transparently — from raising ideas to collecting vendor offers to approving budgets to tracking projects — with every action logged, every vote counted by quota, and every euro traceable. The Settings engine is the constitutional brain: it defines who can do what, when a vote is required, and what AI is allowed to do autonomously.

## Requirements

### Validated

(None yet — ship to validate)

### Active

**Platform Model**
- [ ] Multi-tenant: each community is a fully isolated entity (community_id context); one HOMP instance serves many communities
- [ ] Community onboarding wizard: any person can create a new community, define its structure, upload its constitution, configure minimum governance settings, and generate Owner Codes
- [ ] Roles: Owner, Owner-President (Block or Community), Tenant, Service Provider, Community Admin (platform-level)

**Community Structure**
- [ ] 10 blocks × 10 units per block = 100 units total per seeded community
- [ ] Floor geometry per block: Floor 0 = 3 units (A, B, C), Floor 1 = 3 units (A, B, C), Floor 2 = 3 units (A, B, C), Floor 3 (penthouse) = 1 unit (A only)
- [ ] Unit naming convention: `{block}-{floor}{unit}` — e.g., Block 1 penthouse = `1-3A`
- [ ] Participation quotas stored as `NUMERIC(6,4)` per unit; all quotas sum exactly to 100.0000%
- [ ] System blocks any action requiring quota validation if sum ≠ 100.0000% (DB constraint + application layer)
- [ ] Audit trail for all quota changes
- [ ] One Owner Code per unit; each code used exactly once to bind an account to a unit
- [ ] Occupancy tracking: owner-occupied, tenant-linked, absent owner

**Governance Lifecycle (Ideas → Offers → Votes → Projects)**
- [ ] Ideas module: submit ideas, support with 1 vote per unit, configurable threshold + time window
- [ ] Offer Collection phase: after threshold reached, minimum N vendor offers required before voting opens (configurable per community)
- [ ] Each offer includes: vendor, description, budget, timeline, images, documents, warranty terms, insurance proof
- [ ] Votes module: owners vote for/against concept AND select preferred offer, or propose an alternative solution during voting
- [ ] Vote types: async, in-meeting, meeting-locked — all enforced server-side via BullMQ
- [ ] Projects module: created only from passed votes; displays full chain (idea → offers → vote → vendor → contract → budget → timeline)
- [ ] Projects: vendor orchestration, milestone-gated payments, change requests, progress photos

**Finance Module**
- [ ] Ledger with approval workflow: Draft → Submitted → ApprovalRequired → Approved/Rejected → Scheduled → Paid → Archived
- [ ] Configurable approval thresholds per community (president-alone vs community vote)
- [ ] Emergency flag for over-threshold payments; requires post-fact ratification vote
- [ ] Milestone-gated vendor payments: payment releases only after milestone confirmation
- [ ] Community view (all transactions) + Personal view (owner's quota share)
- [ ] Annual budget performance chart, KPI cards, CSV export

**Incidents & Emergencies**
- [ ] Any owner can create an incident: category (emergency/urgent/routine/cosmetic), description, photos
- [ ] System SLA classification per incident type (response time, escalation timeline, auto-notifications) — configurable per community
- [ ] President can authorize emergency contractor dispatch within emergency spending limit (no pre-vote required)
- [ ] Emergency actions require post-fact ratification vote; audit logged

**Settings Engine (Constitutional Brain)**
- [ ] All governance settings are per-community, versioned, and audited
- [ ] Governance & power structure: president spending limit, board spending limit, mandatory vote triggers, emergency definition
- [ ] Voting thresholds per decision category (10 categories), each defining majority type, weighting, quorum, time window
- [ ] Initiative flow rules: upvote threshold, ADMINIA auto-promote toggle, president bypass toggle, offer requirements
- [ ] Financial settings: budget structure, reserve fund target, contribution logic, payment rules, late fees, arrears visibility
- [ ] Payment execution: dual signature, ADMINIA auto-pay limit, milestone-gated payment toggle
- [ ] Procurement: min offers required, offer validity, comparison sheet, documentation requirements
- [ ] Incident & emergency: classification rules, SLAs, emergency spend limit, post-fact vote requirement
- [ ] Transparency: financial visibility level, voting anonymity, post-vote breakdown
- [ ] Role permissions: configurable per role (president powers, owner rights, admin scope)
- [ ] Document & data: retention policy, version tracking, mandatory upload triggers, legal export format
- [ ] Communication: notification channels, reminder intervals, discussion rules
- [ ] Conflict escalation: escalation ladder, legal action trigger conditions
- [ ] Sub-community logic: block-level voting, special-interest group voting (garage owners, pool users)
- [ ] AI/ADMINIA authority: advisory-only, can auto-classify incidents, can auto-promote ideas, can auto-trigger votes, can auto-pay within limit
- [ ] Meta-settings: majority required to change settings, activation delay, forward-only application

**Supporting Modules**
- [ ] Dashboard: owner view + president approval queue + next action prompts
- [ ] Meetings: RSVP (online/in-person/proxy), agenda with inline votes, past meetings with minutes/transcripts/action items
- [ ] Calendar: color-coded by type (meetings/votes/payments/projects), filters, iCal export
- [ ] Community directory: searchable, privacy controls, official documents panel, board members
- [ ] Messages: direct messages, group threads, ADMINIA AI conversation thread
- [ ] Notifications: in-app + email, configurable per channel, escalation reminders
- [ ] Documents: categorized uploads, linked to community objects, role-controlled visibility, object storage
- [ ] ADMINIA integration: BullMQ webhooks (10 events + new events), REST API, chat placeholder FAB

**Sample Dataset (first seeded community)**
- [ ] 100 units with correct block/floor/unit distribution; quotas sum exactly to 100.0000%
- [ ] 20 tenant-linked units, 2 absent owners
- [ ] Seeded governance settings (realistic defaults)
- [ ] 8 ideas, 4 votes (1 meeting-locked), 3 projects (active/upcoming/completed)
- [ ] 1 annual meeting + 2 extraordinary meetings, linked to calendar
- [ ] 11 recurring monthly services + pool operational costs
- [ ] Real topics: Pergolas/toldos, Persianas regulation, Community Wi-Fi, Entrance door malfunction, Garage door malfunction (vendor bankrupt), Claims tracking (Aedas & Bertolini)

**Audit & Security**
- [ ] All actions logged to immutable audit log (actor, action, timestamp, object, before/after state)
- [ ] Permission matrix enforced: only owners vote, only presidents approve payments within their limit, tenants cannot view full financial breakdown, service providers see only assigned work
- [ ] Permission denials logged; no silent failures

### Out of Scope

- ADMINIA AI design and logic — HOMP defines event contracts and REST API surface only
- Legal/regulatory compliance advice — no legal claims in any module
- Mobile native apps — web-first (mobile-responsive); native app is v2+
- Blockchain verification — explicitly excluded; standard ACID DB + immutable audit log is sufficient
- Video conferencing — meeting participation uses external link (Zoom/Teams), not built-in
- SMS notifications — email + in-app for v1.0; SMS is v2+
- Signed PDF auto-generation — document export in v2+
- External lawyer integrations — escalation is tracked in HOMP; legal execution is external

## Context

- **Multi-tenant from day one**: Architecture must support multiple communities. All queries are community-scoped. The first seeded community is the reference implementation.
- **Governance lifecycle enriched**: The lifecycle is Ideas → Offer Collection → Votes (with offer selection) → Projects. The offer collection phase is a procurement discipline layer — communities that skip it (configurable) go directly from idea to vote.
- **Settings as constitution**: The Settings engine is the backbone of HOMP. Every governance behavior is configurable. ADMINIA reads community settings to understand what it's allowed to do. Well-designed defaults matter — communities should feel guided, not overwhelmed.
- **Community geometry**: 10 blocks × 10 units. Unit naming: `{block}-{floor}{unit}`. Quotas are participation coefficients — the seeded penthouse (1-3A) has 1.5% quota (110 sqm).
- **ADMINIA awareness**: ADMINIA is a separate system. HOMP exposes hooks and a REST API; ADMINIA consumes them. The AI authority level settings in HOMP define exactly what ADMINIA is allowed to do per community.
- **UI reference**: 10 reference screenshots captured in `.planning/research/UI.md`. Target: clean professional governance UI, sidebar nav, shadcn/ui components, ADMINIA FAB bottom-right.
- **Recurring services**: 11 monthly services (cleaning, gardening, pool maintenance, elevator maintenance, electricity common areas, security, pest control, waste, insurance, administration, paddle court) plus pool operational costs.

## Constraints

- **Multi-tenant isolation**: All data is community-scoped; no cross-community data leakage
- **ADMINIA Integration**: Webhook events + REST API only — no shared database, no direct DB access from ADMINIA
- **Quota math**: Quotas MUST sum to exactly 100.0000% — enforced at DB level (check constraint) AND application layer; system blocks any quota-dependent action if invariant violated
- **Governance hard constraints**: Meeting-locked votes enforce time windows server-side (BullMQ, not frontend timers); over-threshold payments cannot bypass vote; one Owner Code per unit; one support per unit per idea; minimum offers required before vote (configurable)
- **Tech stack**: Turborepo monorepo — `apps/web` (Next.js 15), `apps/api` (Hono 4), `packages/db` (Drizzle + PostgreSQL 16), BullMQ + Redis for job queue
- **Web-first**: Must work on mobile browser without native app
- **Decimal precision**: All quota/financial arithmetic via `decimal.js`; stored as PostgreSQL `NUMERIC` — never JavaScript floats

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Multi-tenant architecture | HOMP serves thousands of communities; community_id scoping from day one prevents painful migration later | ✓ Confirmed |
| Ideas → Offers → Votes → Projects lifecycle | Procurement discipline: minimum vendor offers before voting prevents uninformed decisions | ✓ Confirmed |
| Settings as constitutional brain | Every governance behavior is configurable per community; defaults guide without overwhelming | ✓ Confirmed |
| Unit naming: {block}-{floor}{unit} | Unambiguous, human-readable, reflects physical structure | ✓ Confirmed |
| ADMINIA via webhook + REST API | Loose coupling; ADMINIA evolves independently; no shared DB risk | ✓ Confirmed |
| Turborepo monorepo: Next.js 15 + Hono | Persistent server needed for BullMQ + SSE; Next.js API routes insufficient | ✓ Confirmed |
| PostgreSQL + Drizzle ORM | NUMERIC type for exact quota/finance math; Drizzle avoids float casting | ✓ Confirmed |
| BullMQ + Redis for webhooks + scheduled jobs | Reliable delivery + server-side vote window enforcement | ✓ Confirmed |
| better-auth for auth | Multi-role sessions; Owner Code binding; works across Hono + Next.js | ✓ Confirmed |
| Railway for deployment | Easiest cloud target for this stack; Git-based deploys | ✓ Confirmed |
| Email + password + Owner Code | Self-service unit binding; secure identity without admin overhead | ✓ Confirmed |
| English UI only | i18n can be added in v2; no added complexity in v1.0 | ✓ Confirmed |
| Polished UI from day one | shadcn/ui enables shippable quality without a separate design phase | ✓ Confirmed |
| YOLO execution mode | User confidence in direction; speed priority | ✓ Confirmed |
| Quality AI models | Higher accuracy for finance/governance logic planning | ✓ Confirmed |

---
*Last updated: 2026-02-18 after enriched governance model + settings framework added*
