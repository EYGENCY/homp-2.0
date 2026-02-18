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
- **Tech stack**: To be determined during research phase (stack chosen must support: complex relational data model, real-time notifications, file storage, audit logging, webhook emission)
- **Web-first**: Must work on mobile browser without native app

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| ADMINIA via webhook + REST API | Loose coupling; ADMINIA evolves independently; no shared DB risk | — Pending |
| Tech stack via research | Domain complexity warrants research before committing | — Pending |
| YOLO execution mode | User confidence in direction; speed priority | — Pending |
| Standard planning depth | 12 modules is large but well-specified; standard balances speed and coverage | — Pending |
| Quality AI models | Higher accuracy for finance/governance logic planning | — Pending |

---
*Last updated: 2026-02-17 after initialization*
