# Roadmap: HOMP 2.0 — v1.0 Foundation

**Milestone:** v1.0 Foundation
**Goal:** Homeowners and community presidents can govern their community transparently — from raising ideas to collecting vendor offers to approving budgets to tracking projects — with every action logged, every vote counted by quota, and every euro traceable. The Settings engine is the constitutional brain.
**Phases:** 13 phases

---

## Overview

HOMP 2.0 is built from the ground up as a multi-tenant HOA governance platform. The roadmap follows a strict dependency order: infrastructure and DB schema first, then the community model and authentication that every module depends on, then the Settings engine (the constitutional brain), then the governance lifecycle (Ideas → Offer Collection → Votes → Projects), then Finance and Incidents in parallel, then the supporting modules (Meetings, Calendar, Directory, Messages, Notifications, Documents), then the ADMINIA integration, and finally seed data and deployment. The Settings UI is built alongside the modules that need each setting group rather than in a single isolated phase.

---

## Phases

- [ ] **Phase 1: Infrastructure & Monorepo** - Turborepo monorepo with full local dev stack (PostgreSQL, Redis, MinIO), shared packages, CI, and Railway deployment
- [ ] **Phase 2: Community Model & Auth** - Multi-tenant community data model, participation quotas, Owner Codes, role system, and user authentication
- [ ] **Phase 3: Community Onboarding & Settings Engine** - Onboarding wizard for new communities plus the full settings engine (all SETT-* categories) with UI
- [ ] **Phase 4: Dashboard & Application Shell** - Authenticated shell (sidebar nav, header, ADMINIA FAB), owner dashboard, president approval queue
- [ ] **Phase 5: Finance Module** - Full ledger with approval workflow, milestone-gated payments, community/personal views, budget chart, CSV export
- [ ] **Phase 6: Ideas Module** - Idea submission, per-unit support voting, threshold tracking, automatic promotion to offer collection
- [ ] **Phase 7: Offer Collection Module** - Vendor offer submission, comparison view, minimum offer enforcement, offer validity, ADMINIA offer sourcing
- [ ] **Phase 8: Votes Module** - All three vote types (async/in-meeting/meeting-locked), quota-weighted ballots, server-side BullMQ enforcement, offer selection
- [ ] **Phase 9: Projects Module** - Project creation from passed votes, full chain display, milestone tracker, change requests, contractor uploads
- [ ] **Phase 10: Incidents Module** - Incident reporting, SLA classification, emergency dispatch, escalation ladder, project linkage
- [ ] **Phase 11: Supporting Modules** - Meetings (RSVP/agenda/minutes), Calendar (grid/filters/iCal), Community Directory (searchable/privacy), Documents (upload/versioning/object storage)
- [ ] **Phase 12: Messages & Notifications** - Direct messages, group threads, ADMINIA conversation thread, in-app + email notifications with preferences
- [ ] **Phase 13: ADMINIA Integration & Seed Data** - BullMQ webhook delivery (14 events), REST API for ADMINIA, dead-letter queue, seed community with 100 units and realistic data

---

## Phase Details

### Phase 1: Infrastructure & Monorepo
**Goal:** Any developer can clone the repo, run one command to start all backing services, and have a working local dev environment with a deployed Railway target.
**Depends on:** Nothing (first phase)
**Requirements:** INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05
**Success Criteria** (what must be TRUE):
  1. Running `docker compose up` starts PostgreSQL, Redis, and MinIO with no manual steps
  2. Running `pnpm dev` from the monorepo root starts both the Next.js web app and the Hono API server concurrently
  3. `drizzle-kit migrate` applies the initial schema against a fresh database without errors
  4. The application is accessible on Railway with web, API, PostgreSQL, and Redis running as separate services
  5. `.env.example` documents every required environment variable; no secrets appear in version control
**Plans:** 5 plans

Plans:
- [ ] 01-01-PLAN.md — Create @homp/config package with Zod-validated env schemas + .env.example and .gitignore
- [ ] 01-02-PLAN.md — Docker compose health checks, Turbo env passthrough, Drizzle upgrade + baseline migration
- [ ] 01-03-PLAN.md — Wire Hono API (/health endpoint, @homp/config) and Next.js (build-time env validation)
- [ ] 01-04-PLAN.md — Create railway.toml files for API and web services
- [ ] 01-05-PLAN.md — Commit, push to main, and verify Railway live deployment

### Phase 2: Community Model & Auth
**Goal:** Users can register, log in, bind their account to a unit via Owner Code, and the platform enforces multi-tenant data isolation with correct quota math for every community.
**Depends on:** Phase 1
**Requirements:** AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, AUTH-07, COMM-01, COMM-02, COMM-03, COMM-04, COMM-05, COMM-06, COMM-07, COMM-08, COMM-09, COMM-10
**Success Criteria** (what must be TRUE):
  1. User can register with email/password, log in, and stay logged in across browser refresh; unauthenticated requests redirect to login
  2. User can reset a forgotten password via email link
  3. Registered user can enter their Owner Code to bind their account to a specific unit; the code is consumed and cannot be reused
  4. Unit quotas stored as NUMERIC(6,4) sum exactly to 100.0000%; any quota-dependent action is blocked when the invariant is violated
  5. Every quota change and all platform actions are logged to the immutable audit log with actor, timestamp, and before/after state
  6. Community data is fully isolated by community_id; no cross-community data leakage is possible
**Plans:** TBD

### Phase 3: Community Onboarding & Settings Engine
**Goal:** Any person can create a new community through a guided wizard, configure its governance constitution via the full Settings engine, and generate Owner Codes for all units.
**Depends on:** Phase 2
**Requirements:** ONBOARD-01, ONBOARD-02, ONBOARD-03, ONBOARD-04, ONBOARD-05, ONBOARD-06, ONBOARD-07, SETT-GOV-01, SETT-GOV-02, SETT-GOV-03, SETT-GOV-04, SETT-GOV-05, SETT-GOV-06, SETT-GOV-07, SETT-GOV-08, SETT-FIN-01, SETT-FIN-02, SETT-FIN-03, SETT-FIN-04, SETT-FIN-05, SETT-FIN-06, SETT-FIN-07, SETT-FIN-08, SETT-PROC-01, SETT-PROC-02, SETT-PROC-03, SETT-PROC-04, SETT-PROC-05, SETT-PROC-06, SETT-INC-01, SETT-INC-02, SETT-INC-03, SETT-INC-04, SETT-TRANS-01, SETT-TRANS-02, SETT-TRANS-03, SETT-ROLE-01, SETT-ROLE-02, SETT-ROLE-03, SETT-DOC-01, SETT-DOC-02, SETT-DOC-03, SETT-CONF-01, SETT-CONF-02, SETT-CONF-03, SETT-AI-01, SETT-AI-02, SETT-META-01, SETT-META-02, SETT-META-03
**Success Criteria** (what must be TRUE):
  1. Any authenticated user can complete the onboarding wizard (community name, address, unit structure, constitution upload, minimum settings) and activate a new community; they become its Community Admin
  2. System generates unique Owner Codes for all units after structure is confirmed; Admin can send invite emails containing the code and join link
  3. Community Admin can configure all governance settings (spending limits, vote thresholds, initiative flow, financial rules, procurement rules, incident SLAs, transparency, roles, document policy, ADMINIA authority) through the Settings UI
  4. Every settings change is versioned, audit logged with before/after values, and applies forward-only (no retroactive effect on in-progress votes)
  5. Settings changes require the configured majority to pass; new settings take effect only after the configured activation delay
**Plans:** TBD

### Phase 4: Dashboard & Application Shell
**Goal:** Every authenticated user lands on a fully functional community dashboard with sidebar navigation, and presidents see their approval queue with pending items requiring action.
**Depends on:** Phase 3
**Requirements:** DASH-01, DASH-02, DASH-03
**Success Criteria** (what must be TRUE):
  1. Authenticated owner sees the dashboard with: personal financial overview (fee, balance, reserve %), upcoming meetings with countdown, active votes requiring action, trending ideas, and community project status
  2. President additionally sees an approval queue listing pending finance items, pending incidents, and governance items requiring their decision
  3. ADMINIA chat FAB (blue robot icon, bottom-right) appears on every page for all authenticated users and opens the ADMINIA Messages thread when clicked
  4. Unauthenticated users are redirected to login; authenticated users land on their dashboard
**Plans:** TBD

### Phase 5: Finance Module
**Goal:** Authorized users can create and track financial entries through a complete approval workflow, with milestone-gated vendor payments, full ledger views, and budget performance charts.
**Depends on:** Phase 4
**Requirements:** FIN-01, FIN-02, FIN-03, FIN-04, FIN-05, FIN-06, FIN-07, FIN-08, FIN-09, FIN-10, FIN-11
**Success Criteria** (what must be TRUE):
  1. Authorized user can create a finance entry (vendor, category, amount, invoice, description) and it progresses through Draft → Submitted → ApprovalRequired → Approved/Rejected → Scheduled → Paid → Archived
  2. Entries at or below the president threshold are approved by the president alone; entries above threshold are hard-blocked until a community vote passes
  3. Emergency-flagged over-threshold payments bypass pre-vote but trigger an automatic post-fact ratification vote; the bypass is audit logged
  4. Vendor milestone payments only release after the president confirms milestone completion
  5. Community View shows the full ledger; Personal View shows each owner's quota share; president can export CSV; Annual Budget Performance chart shows actual vs projected monthly
**Plans:** TBD

### Phase 6: Ideas Module
**Goal:** Owners can submit ideas, support them with one vote per unit, and ideas automatically enter the Offer Collection phase when the community-configured threshold is reached.
**Depends on:** Phase 4
**Requirements:** IDEA-01, IDEA-02, IDEA-03, IDEA-04, IDEA-05, IDEA-06, IDEA-07
**Success Criteria** (what must be TRUE):
  1. Any owner can submit a new idea (title, description, category, optional estimated cost) and it appears on the Ideas board
  2. Each unit can support an idea exactly once regardless of how many people share the unit; support count is enforced server-side
  3. Ideas list shows Trending / New / Near Threshold tabs with a search bar; each card shows category, support meter, goal threshold, estimated cost, and Support button
  4. When support reaches the community-configured threshold within the time window, the idea automatically enters Offer Collection and emits `SupportThresholdReached`
  5. President can manually promote an idea to Offer Collection if permitted by community settings; ADMINIA can submit ideas if ADMINIA auto-promote is enabled
**Plans:** TBD

### Phase 7: Offer Collection Module
**Goal:** Ideas in the Offer Collection phase accumulate vendor offers with full procurement details; voting cannot open until the community-configured minimum offer count is met.
**Depends on:** Phase 6
**Requirements:** OFFR-01, OFFR-02, OFFR-03, OFFR-04, OFFR-05, OFFR-06, OFFR-07, OFFR-08
**Success Criteria** (what must be TRUE):
  1. Ideas in Offer Collection show an Offers section with a collection progress indicator; president or ADMINIA (if permitted) can add vendor offers
  2. Each offer captures vendor name, description, budget, timeline, images, documents, warranty terms, and insurance proof
  3. A side-by-side comparison view displays all submitted offers for a proposal
  4. The "Open Vote" button is disabled until the minimum offer count (from community settings) is met; expired offers are flagged and cannot be selected during voting
  5. System emits `OffersComplete` when minimum offers are met; president can request ADMINIA to source offers via webhook
**Plans:** TBD

### Phase 8: Votes Module
**Goal:** Community votes run with server-enforced time windows, quota-weighted anonymous ballots, all three vote types, and offer selection; passed votes automatically trigger project creation.
**Depends on:** Phase 7
**Requirements:** VOTE-01, VOTE-02, VOTE-03, VOTE-04, VOTE-05, VOTE-06, VOTE-07, VOTE-08, VOTE-09
**Success Criteria** (what must be TRUE):
  1. System supports async votes (open time window), in-meeting votes (unlocks at meeting start), and meeting-locked votes (visible pre-meeting, unlocks at start, closes at end) — all time windows enforced via BullMQ, not frontend timers
  2. Vote detail shows the proposal narrative, linked offers, impact simulation, quorum progress bar, and countdown timer; owner selects Yes + preferred offer, Yes + alternative, or No
  3. Ballots are anonymous; only quota-weighted aggregate totals are stored; individual choices are not exposed
  4. Alternative solution proposals submitted during voting are visible to other voters; if they reach threshold they become a formal option
  5. When a vote closes, system calculates quota-weighted result, determines outcome, emits `VoteClosed`, and (if passed) creates a project stub
**Plans:** TBD

### Phase 9: Projects Module
**Goal:** Passed votes create trackable projects with the full idea-to-project chain, milestone-gated payments, contractor photo uploads, and change request tracking.
**Depends on:** Phase 8
**Requirements:** PROJ-01, PROJ-02, PROJ-03, PROJ-04, PROJ-05, PROJ-06, PROJ-07, PROJ-08, PROJ-09
**Success Criteria** (what must be TRUE):
  1. A project can only be created from a passed vote; the project detail shows the full chain: idea → offers → vote result → selected vendor → contract → budget → timeline
  2. Project tracker shows Active / Past / Pending tabs; project cards show budget vs actual, milestone timeline stepper, and contractor info
  3. Vendor payment for each milestone releases only after the president (or designated verifier) confirms milestone completion
  4. Contractor can upload progress photos and status updates; owner can message the contractor directly from the project detail page
  5. Change requests are tracked with financial impact; changes above threshold trigger a new vote automatically
**Plans:** TBD

### Phase 10: Incidents Module
**Goal:** Owners can report incidents with photos and categories; the system classifies them by SLA, presidents can authorize emergency dispatch, and incidents can escalate to votes or projects.
**Depends on:** Phase 5
**Requirements:** INCID-01, INCID-02, INCID-03, INCID-04, INCID-05, INCID-06
**Success Criteria** (what must be TRUE):
  1. Any owner can create an incident (title, category Emergency/Urgent/Routine/Cosmetic, description, photos); system classifies it by community-configured SLAs and sends automatic notifications
  2. President can authorize emergency contractor dispatch within the community-configured emergency spending limit without a pre-vote
  3. Emergency actions above the limit trigger an automatic post-fact ratification vote; the emergency authorization is audit logged
  4. Incidents escalate through the community-configured ladder (Discussion → Mediation → Vote → Legal Action); incidents link to projects when a repair becomes a formal project
**Plans:** TBD

### Phase 11: Supporting Modules — Meetings, Calendar, Directory, Documents
**Goal:** Communities can schedule and manage meetings with RSVP and inline votes, view a color-coded calendar with iCal export, browse a privacy-controlled directory, and manage categorized versioned documents in object storage.
**Depends on:** Phase 9
**Requirements:** MEET-01, MEET-02, MEET-03, MEET-04, MEET-05, MEET-06, CAL-01, CAL-02, CAL-03, CAL-04, DIR-01, DIR-02, DIR-03, DIR-04, DIR-05, DIR-06, DIR-07, DIR-08, DOC-01, DOC-02, DOC-03, DOC-04, DOC-05, DOC-06
**Success Criteria** (what must be TRUE):
  1. President can create a meeting; owners can RSVP (Online/In-Person/Proxy); meeting detail shows numbered agenda with inline linked votes; past meetings show minutes, transcripts, and action items
  2. Calendar shows color-coded monthly grid (blue=meetings, red=vote deadlines, green=payment deadlines, orange=milestones/incidents); events are auto-added when meetings/votes/payments/milestones are created; owner can filter by type and export as iCal
  3. Directory shows searchable unit/owner list with status badges and privacy controls; right panel shows Official Documents and Board Members; president can export the directory and post community-wide announcements
  4. President can upload documents with category, optional object link, and version tracking; owners can browse and download with role-controlled visibility; files stored in MinIO/S3 with metadata in PostgreSQL
**Plans:** TBD

### Phase 12: Messages & Notifications
**Goal:** Community members can exchange direct and group messages including an ADMINIA AI thread, and all owners receive configurable in-app and email notifications for governance events.
**Depends on:** Phase 11
**Requirements:** MSG-01, MSG-02, MSG-03, MSG-04, MSG-05, MSG-06, NOTIF-01, NOTIF-02, NOTIF-03, NOTIF-04, NOTIF-05
**Success Criteria** (what must be TRUE):
  1. Owner can send a direct message to any directory-visible community member and participate in group threads; maintenance/service threads appear linked to their project or incident
  2. ADMINIA appears as a conversation thread; owner can ask governance questions and receive structured analysis responses; ADMINIA can attach files and suggest actions but cannot send messages or take governance actions without user confirmation
  3. Message composer supports rich text (bold, lists) and file/document attachments
  4. Owner receives in-app notifications (with unread badge in header) and email notifications for all key events (vote opened, vote closing, idea threshold, offer collection complete, meeting scheduled, approval required, milestone update, new incident, new message)
  5. Owner can configure notification preferences per channel (Email, In-App) in Settings; escalation reminders fire at community-configured intervals
**Plans:** TBD

### Phase 13: ADMINIA Integration & Seed Data
**Goal:** HOMP emits all 14 webhook events to ADMINIA via BullMQ with reliable retry/dead-letter delivery, exposes a complete REST API for ADMINIA reads and draft submissions, and a fully seeded reference community is available for demonstration and testing.
**Depends on:** Phase 12
**Requirements:** ADMI-01, ADMI-02, ADMI-03, ADMI-04, ADMI-05, ADMI-06, ADMI-07, SEED-01, SEED-02, SEED-03, SEED-04, SEED-05, SEED-06, SEED-07, SEED-08, SEED-09, SEED-10
**Success Criteria** (what must be TRUE):
  1. System emits all 14 webhook events (IdeaCreated, SupportThresholdReached, OffersComplete, VoteOpened, VoteLocked, VoteClosed, ProjectCreated, ProjectMilestoneConfirmed, InvoiceSubmitted, ApprovalRequired, MeetingScheduled, MinutesPublished, IncidentCreated, EmergencyAuthorized) via BullMQ with exponential backoff retry and dead-letter queue alerting the president on final failure
  2. All webhook events are persisted to the DB event log regardless of delivery status
  3. REST API allows ADMINIA to query all HOMP data and submit draft content (idea, offer, message text, agenda item, incident classification suggestion) — all requiring human confirmation; requests beyond configured authority are rejected with a clear error
  4. Seed script creates 1 community with 100 units, correct block/floor/unit geometry, quotas summing to exactly 100.0000%, 20 tenant-linked units, 2 absent owners, 8 ideas across stages, 4 votes, 3 projects, 3 meetings, 11 recurring services, real-topic incidents, and ADMINIA settings
**Plans:** TBD

---

## Progress

**Execution Order:** Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12 → 13

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Infrastructure & Monorepo | 0/5 | Planned | - |
| 2. Community Model & Auth | 0/TBD | Not started | - |
| 3. Community Onboarding & Settings Engine | 0/TBD | Not started | - |
| 4. Dashboard & Application Shell | 0/TBD | Not started | - |
| 5. Finance Module | 0/TBD | Not started | - |
| 6. Ideas Module | 0/TBD | Not started | - |
| 7. Offer Collection Module | 0/TBD | Not started | - |
| 8. Votes Module | 0/TBD | Not started | - |
| 9. Projects Module | 0/TBD | Not started | - |
| 10. Incidents Module | 0/TBD | Not started | - |
| 11. Supporting Modules | 0/TBD | Not started | - |
| 12. Messages & Notifications | 0/TBD | Not started | - |
| 13. ADMINIA Integration & Seed Data | 0/TBD | Not started | - |
