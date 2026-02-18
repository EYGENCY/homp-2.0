# Requirements: HOMP 2.0 — Homeowner Management Platform

**Defined:** 2026-02-18
**Core Value:** Homeowners and community presidents can govern their community transparently — from raising ideas to collecting vendor offers to approving budgets to tracking projects — with every action logged, every vote counted by quota, and every euro traceable. The Settings engine is the constitutional brain.

---

## v1.0 Requirements

### Infrastructure (INFRA)

- [ ] **INFRA-01**: Developer can start the full local stack (PostgreSQL, Redis, MinIO) with a single `docker compose up`
- [ ] **INFRA-02**: Developer can run the Next.js web app and Hono API server concurrently via `pnpm dev` from monorepo root
- [ ] **INFRA-03**: Database migrations run via Drizzle Kit; schema is versioned and repeatable
- [ ] **INFRA-04**: Application is deployed to Railway with web app, API server, PostgreSQL, and Redis as separate services
- [ ] **INFRA-05**: Environment variables are documented in `.env.example`; secrets never committed

### Authentication (AUTH)

- [ ] **AUTH-01**: User can register with email and password
- [ ] **AUTH-02**: User can log in with email and password; session persists across browser refresh
- [ ] **AUTH-03**: User can reset password via email link
- [ ] **AUTH-04**: Registered user can enter their Owner Code to bind their account to a specific unit within a specific community
- [ ] **AUTH-05**: Each Owner Code can only be used once; system rejects duplicate binding attempts
- [ ] **AUTH-06**: User's role (Owner, Owner-President, Tenant, Service Provider) derives from their unit binding; Community Admin is a platform-level role set separately
- [ ] **AUTH-07**: Unauthenticated users are redirected to login; authenticated users land on their community dashboard

### Community Onboarding (ONBOARD)

- [ ] **ONBOARD-01**: Any person can sign up and create a new community on the platform (becomes that community's first Admin)
- [ ] **ONBOARD-02**: Onboarding wizard collects: community name, address, contact info, governance type
- [ ] **ONBOARD-03**: Wizard guides the Admin to define the unit structure (blocks, floors, units per floor, naming convention) — either manually or via import template
- [ ] **ONBOARD-04**: Wizard requires uploading the community constitution/statutes document before activation
- [ ] **ONBOARD-05**: Wizard presents minimum required governance settings with sensible defaults; Admin can accept defaults or configure before launch
- [ ] **ONBOARD-06**: System generates unique Owner Codes for all units after structure is confirmed
- [ ] **ONBOARD-07**: Community Admin can invite owners by email or distribute Owner Codes manually; invite email contains the code and a join link

### Community Model (COMM)

- [ ] **COMM-01**: Platform is multi-tenant; each community is a fully isolated entity; all queries are community-scoped by community_id; no cross-community data leakage
- [ ] **COMM-02**: Community structure supports configurable block/floor/unit geometry; seeded community uses 10 blocks × 10 units (Floor 0: A/B/C, Floor 1: A/B/C, Floor 2: A/B/C, Floor 3: A only)
- [ ] **COMM-03**: Unit naming follows `{block}-{floor}{unit}` convention (e.g., `1-3A` = Block 1, penthouse unit A)
- [ ] **COMM-04**: Each unit has a participation quota stored as `NUMERIC(6,4)`; all quotas in a community sum to exactly 100.0000%
- [ ] **COMM-05**: System enforces quota sum invariant at DB level (check constraint) AND application level; blocks any quota-dependent action if violated
- [ ] **COMM-06**: Every quota change is logged to the audit trail (who, when, previous value, new value)
- [ ] **COMM-07**: Each unit has exactly one Owner Code; codes are unique within a community and cannot be reused
- [ ] **COMM-08**: System tracks occupancy per unit: owner-occupied, tenant-linked, or absent owner
- [ ] **COMM-09**: Community Admin can assign Block President and Community President roles to owner accounts
- [ ] **COMM-10**: All actions across the platform are logged to an immutable community-scoped audit log (actor, action, timestamp, object reference, before/after state)

### Dashboard (DASH)

- [ ] **DASH-01**: Owner sees: personal financial overview (fee, balance, reserve %), upcoming meetings with countdown, active votes requiring action, trending ideas, community project status
- [ ] **DASH-02**: President additionally sees an approval queue showing pending finance items, pending incidents, and governance items requiring their decision
- [ ] **DASH-03**: ADMINIA chat FAB (floating action button) appears bottom-right on all pages for all authenticated users

### Finance (FIN)

- [ ] **FIN-01**: Authorized user can create a finance entry (vendor, category, amount, date, invoice upload, description)
- [ ] **FIN-02**: Finance entry follows approval workflow: Draft → Submitted → ApprovalRequired → Approved/Rejected → Scheduled → Paid → Archived
- [ ] **FIN-03**: Entries at or below the community-configured president threshold are approved by the President alone
- [ ] **FIN-04**: Entries above threshold require a passed community vote before approval; system hard-blocks payment without it
- [ ] **FIN-05**: Emergency flag can mark an over-threshold payment; this bypasses pre-vote requirement but triggers a mandatory post-fact ratification vote and is audit logged
- [ ] **FIN-06**: Vendor payments for project milestones are gated: payment only releases after milestone completion is confirmed by the President or designated verifier
- [ ] **FIN-07**: Community View shows full ledger: date, vendor, category, amount (NUMERIC), decision type (president/vote), status
- [ ] **FIN-08**: Personal View shows owner's individual position: their quota share of each expense, their own payment history
- [ ] **FIN-09**: Finance module shows Annual Budget Performance chart (actual vs projected, monthly) and KPI cards: Total Annual Budget, Reserve Fund (% funded), Monthly Variance
- [ ] **FIN-10**: President can export ledger as CSV
- [ ] **FIN-11**: All financial arithmetic uses `decimal.js`; no JavaScript native floats for money or quota calculations

### Ideas (IDEA)

- [ ] **IDEA-01**: Any owner can submit a new idea: title, description, category tag, optional estimated cost
- [ ] **IDEA-02**: Any owner can support an idea; each unit gives exactly one support per idea (enforced regardless of how many people share the unit)
- [ ] **IDEA-03**: Ideas list shows Trending / New / Near Threshold tabs and a search bar
- [ ] **IDEA-04**: Each idea card shows: category, support meter (% of units), resident count, goal threshold, estimated cost, Support/Supported button
- [ ] **IDEA-05**: When support reaches the community-configured threshold within the configured time window, idea automatically enters the Offer Collection phase and emits `SupportThresholdReached` webhook event
- [ ] **IDEA-06**: President can manually promote an idea to Offer Collection (bypassing threshold) if permitted by community settings
- [ ] **IDEA-07**: ADMINIA can submit ideas to the idea board if ADMINIA auto-promote is enabled in community settings

### Offer Collection (OFFR)

- [ ] **OFFR-01**: After an idea reaches threshold, it enters an Offer Collection phase before voting; the idea detail page shows an "Offers" section with a collection progress indicator
- [ ] **OFFR-02**: President or ADMINIA (if permitted by settings) can add vendor offers to a proposal in offer collection stage
- [ ] **OFFR-03**: Each offer contains: vendor name, description, budget (NUMERIC), timeline, images/photos, supporting documents, warranty terms, insurance proof
- [ ] **OFFR-04**: System displays a side-by-side comparison view of all submitted offers for a proposal
- [ ] **OFFR-05**: System enforces minimum offer count (from community settings, e.g. 2 or 3) before voting can open; vote open button is disabled until minimum met
- [ ] **OFFR-06**: Offers have a configurable validity period (from settings); expired offers are flagged and cannot be selected during voting
- [ ] **OFFR-07**: System emits `OffersComplete` webhook event when minimum offers are met and vote is ready to open
- [ ] **OFFR-08**: President can request ADMINIA to source offers (triggers ADMINIA webhook); ADMINIA submits offers via REST API

### Votes (VOTE)

- [ ] **VOTE-01**: System supports three vote types: async (open time window), in-meeting (unlocks at meeting start), meeting-locked (visible pre-meeting, unlocks at start, closes at end)
- [ ] **VOTE-02**: Votes are quota-weighted by default; community settings can configure equal-vote weighting per vote category
- [ ] **VOTE-03**: Vote detail shows: proposal narrative, linked offers (from Offer Collection), vote options, impact simulation (fee change), quorum progress bar, countdown timer, Submit Vote button
- [ ] **VOTE-04**: During voting, owner selects: (a) Yes + preferred offer, (b) Yes + propose alternative solution, or (c) No — community settings control whether alternative proposals are allowed
- [ ] **VOTE-05**: Alternative solution proposals submitted during voting are displayed to other voters and can receive support; if they reach a threshold they are added as a formal option
- [ ] **VOTE-06**: Ballot is anonymous: only aggregate quota-weighted totals are stored; individual vote choices are not exposed to other users
- [ ] **VOTE-07**: Vote time windows are enforced server-side via BullMQ scheduled jobs — not frontend timers
- [ ] **VOTE-08**: When a vote closes, system calculates quota-weighted result, determines outcome, emits `VoteClosed` webhook, and (if passed) creates a Project stub
- [ ] **VOTE-09**: Quorum is community-configured per vote category; vote detail shows current quorum vs required

### Projects (PROJ)

- [ ] **PROJ-01**: A project can only be created from a passed vote; system enforces and links the project to its originating vote, offers, and idea
- [ ] **PROJ-02**: Project detail shows the full chain: idea → offers → vote result → selected vendor → contract → budget → timeline
- [ ] **PROJ-03**: Project tracker shows Active / Past / Pending tabs; project cards show budget vs actual, milestone timeline stepper, contractor info
- [ ] **PROJ-04**: Project has milestone stages; each milestone has a defined completion condition and budget allocation
- [ ] **PROJ-05**: Vendor payment for a milestone only releases after the President (or designated verifier) confirms milestone completion
- [ ] **PROJ-06**: Contractor (Service Provider) can upload progress photos and status updates to a project
- [ ] **PROJ-07**: Change requests on a project are tracked: description, requested by, status (pending/approved/rejected), financial impact; changes above a threshold trigger a new vote
- [ ] **PROJ-08**: Owner can message the contractor directly via the Messages module from the project detail page
- [ ] **PROJ-09**: Infrastructure budget summary shown in project right panel: annual allocation, reserved, spent

### Incidents (INCID)

- [ ] **INCID-01**: Any owner can create an incident report: title, category (Emergency/Urgent/Routine/Cosmetic), description, photos
- [ ] **INCID-02**: System classifies incidents per community-configured SLAs and triggers automatic notifications based on classification
- [ ] **INCID-03**: President can authorize emergency contractor dispatch within the community-configured emergency spending limit (no pre-vote required)
- [ ] **INCID-04**: Emergency actions above the emergency limit require a post-fact ratification vote; system creates this vote automatically and flags it as urgent
- [ ] **INCID-05**: Incidents can be escalated through the community-configured escalation ladder: Discussion → Mediation → Vote → Legal Action
- [ ] **INCID-06**: Incidents link to projects when a repair becomes a formal project

### Meetings (MEET)

- [ ] **MEET-01**: President can create a meeting: title, type (Annual/Extraordinary), date/time, location, online video link
- [ ] **MEET-02**: Owner can RSVP with three options: Online Participation, In-Person Attendance, Assign Proxy Voter
- [ ] **MEET-03**: Meeting detail shows a numbered agenda; each agenda item can have an inline linked vote
- [ ] **MEET-04**: Meeting detail shows Digital Ballroom section with external video link
- [ ] **MEET-05**: Past meetings show: minutes document, transcript (if uploaded), and action items list
- [ ] **MEET-06**: Meeting archives are accessible (Transcripts, Action Items, Past Meetings) from the meetings list

### Calendar (CAL)

- [ ] **CAL-01**: Monthly grid view with color-coded events: blue (meetings), red (vote deadlines), green (payment deadlines), orange (project milestones/incidents)
- [ ] **CAL-02**: Owner can filter calendar by event type using sidebar toggles
- [ ] **CAL-03**: Owner can export the community calendar as iCal for personal calendar apps
- [ ] **CAL-04**: Events are automatically added when meetings are scheduled, votes open, payments are due, and project milestones are set

### Community Directory (DIR)

- [ ] **DIR-01**: Owner can view apartment directory: unit number, owner name, status (RESIDING/TENANT/AWAY), contact info (if not private), Message action
- [ ] **DIR-02**: Owner can search directory by unit number or name
- [ ] **DIR-03**: Owner controls their own privacy: toggle show/hide email and phone number
- [ ] **DIR-04**: Contact shows as "Private" when hidden; AWAY owners' contacts are always private unless explicitly shared
- [ ] **DIR-05**: Right panel shows Official Documents (Bylaws, Rules, Fee Schedule, Minutes) with download links
- [ ] **DIR-06**: Right panel shows Board Members (President, Secretary) with contact link
- [ ] **DIR-07**: President can export the directory
- [ ] **DIR-08**: President can post a community-wide announcement from the Community page

### Messages (MSG)

- [ ] **MSG-01**: Owner can send a direct message to any community member visible in the directory
- [ ] **MSG-02**: Messages support group threads (e.g., Owner Group)
- [ ] **MSG-03**: Maintenance/service threads appear in messages (linked to a project or incident)
- [ ] **MSG-04**: ADMINIA appears as a conversation thread; owner can ask governance questions and receive structured analysis responses; ADMINIA can attach files and suggest actions
- [ ] **MSG-05**: Message composer supports rich text (bold, lists) and file/document attachments
- [ ] **MSG-06**: ADMINIA can only submit drafts and analysis; it cannot send messages on behalf of users or take any governance action without user confirmation

### Notifications (NOTIF)

- [ ] **NOTIF-01**: Owner receives in-app notifications for: new vote opened, vote closing soon, idea threshold reached, offer collection complete, meeting scheduled, approval required, project milestone update, new incident, new message
- [ ] **NOTIF-02**: Owner receives email notifications for the same events (configurable per channel)
- [ ] **NOTIF-03**: Owner can configure notification preferences per channel (Email, In-App) in Settings
- [ ] **NOTIF-04**: Notification bell in header shows unread count badge
- [ ] **NOTIF-05**: Escalation reminders are sent at community-configured intervals (e.g., vote closing in 48h, 24h, 2h)

### Documents (DOC)

- [ ] **DOC-01**: President can upload documents: title, category (constitution, plans, contracts, minutes, claims), optional link to a community object (meeting, project, vote, finance entry, incident)
- [ ] **DOC-02**: Owner can browse and download documents; visibility is role-controlled (tenants see minutes and rules, not full financial contracts)
- [ ] **DOC-03**: Documents show file type icon, size, upload date, version number, and uploader
- [ ] **DOC-04**: Files stored in object storage (MinIO locally, S3-compatible in production); metadata in PostgreSQL
- [ ] **DOC-05**: Document versioning: uploading a new version of an existing document creates a new version entry while preserving previous versions
- [ ] **DOC-06**: Mandatory document upload after vote execution is enforced when community settings require it (e.g., contract must be uploaded before project starts)

### Settings — Governance & Power Structure (SETT-GOV)

- [ ] **SETT-GOV-01**: Community can configure president unilateral spending limit (€ per incident) — actions below this need no vote or board approval
- [ ] **SETT-GOV-02**: Community can configure whether a board exists and its spending limit (between president limit and community vote threshold)
- [ ] **SETT-GOV-03**: Community can configure what qualifies as an emergency (text definition + max spending without pre-vote)
- [ ] **SETT-GOV-04**: Community can configure voting thresholds per decision category: ordinary maintenance, extraordinary expense, structural modification, aesthetic facade changes, legal action, budget approval, reserve fund usage, governance settings changes, appointing/dismissing president, hiring/firing administrator
- [ ] **SETT-GOV-05**: Each threshold category defines: majority type (simple / 3/5 / 2/3 / unanimity), weighting (quota or equal vote), quorum required (yes/no + %), time window (days)
- [ ] **SETT-GOV-06**: Community can configure initiative flow: upvote threshold %, idea time window (days), whether ADMINIA can auto-promote ideas, whether president can bypass idea stage
- [ ] **SETT-GOV-07**: Community can configure minimum offers required before vote (2/3/5), offer validity period, whether comparison sheet is mandatory, whether alternative offers can be submitted during voting
- [ ] **SETT-GOV-08**: Community can configure what documentation must be present before a vote can open (budget ceiling, timeline, scope definition, warranty terms, insurance proof) — each toggle individually

### Settings — Financial (SETT-FIN)

- [ ] **SETT-FIN-01**: Community can configure monthly budget total and budget category breakdown
- [ ] **SETT-FIN-02**: Community can configure reserve fund target % and minimum reserve floor (expressed as months of operating cost)
- [ ] **SETT-FIN-03**: Community can configure participation coefficient basis and special allocation rules (e.g., garage-only owners, penthouse premium coefficients)
- [ ] **SETT-FIN-04**: Community can configure extraordinary fees as proportional (by quota) or flat (equal per unit)
- [ ] **SETT-FIN-05**: Community can configure payment due date (day of month), grace period (days), late fee %, and automatic escalation timeline
- [ ] **SETT-FIN-06**: Community can configure whether arrears are publicly visible to all members or visible to president only
- [ ] **SETT-FIN-07**: Community can configure legal escalation threshold (amount of arrears that triggers legal action)
- [ ] **SETT-FIN-08**: Community can configure payment execution rules: dual signature required (yes/no), ADMINIA auto-pay limit (€ below which ADMINIA can execute without human confirmation), milestone-confirmation required before vendor payment (yes/no)

### Settings — Procurement (SETT-PROC)

- [ ] **SETT-PROC-01**: Community can configure minimum number of vendor offers required before vote (2/3/5)
- [ ] **SETT-PROC-02**: Community can configure offer validity period (days); expired offers are flagged
- [ ] **SETT-PROC-03**: Community can configure whether a mandatory comparison sheet is required before vote opens
- [ ] **SETT-PROC-04**: Community can configure whether photo/visual mockups are required as part of each offer
- [ ] **SETT-PROC-05**: Community can configure approved vendor list (yes/no); if yes, only listed vendors can be invited; owners can suggest vendors for approval
- [ ] **SETT-PROC-06**: Community can configure whether contractor rating and performance tracking is active

### Settings — Incidents (SETT-INC)

- [ ] **SETT-INC-01**: Community can configure incident classification rules: what qualifies as Emergency / Urgent / Routine / Cosmetic (text definitions and auto-classification triggers)
- [ ] **SETT-INC-02**: Community can configure SLA per classification: target response time, escalation timeline, auto-notification triggers
- [ ] **SETT-INC-03**: Community can configure emergency spending limit (president can authorize contractor without pre-vote up to this amount)
- [ ] **SETT-INC-04**: Community can configure whether post-fact ratification vote is required for all emergency spending or only above the emergency limit

### Settings — Transparency (SETT-TRANS)

- [ ] **SETT-TRANS-01**: Community can configure financial visibility level: full invoice transparency, summary-only, or president-only for vendor contracts
- [ ] **SETT-TRANS-02**: Community can configure whether vendor contracts are visible to all members
- [ ] **SETT-TRANS-03**: Community can configure voting transparency: anonymous ballots (always), whether quota weights are shown post-vote, whether per-option breakdown is visible after vote closes

### Settings — Roles & Permissions (SETT-ROLE)

- [ ] **SETT-ROLE-01**: Community can configure president powers: can modify settings (yes/no), can skip idea stage (yes/no), can merge proposals (yes/no), can cancel votes (yes/no), can remove comments (yes/no)
- [ ] **SETT-ROLE-02**: Community can configure owner rights: can create initiatives (yes/no), can propose alternative offers during voting (yes/no), can request a community audit (yes/no), can call extraordinary assembly digitally (yes/no, with threshold of co-signers required)
- [ ] **SETT-ROLE-03**: Community can configure administrator (property manager) role scope: read-only, financial execution, incident closure, document archive management

### Settings — Documents & Communication (SETT-DOC)

- [ ] **SETT-DOC-01**: Community can configure document retention policy: permanent archive (yes/no), version tracking (yes/no), mandatory upload after vote execution (yes/no)
- [ ] **SETT-DOC-02**: Community can configure notification logic: which channels per event type (email/in-app), reminder intervals, escalation reminders
- [ ] **SETT-DOC-03**: Community can configure discussion rules: comment moderation required (yes/no), president can lock discussion threads (yes/no), anonymous posting allowed (yes/no)

### Settings — Conflict & Sub-Community (SETT-CONF)

- [ ] **SETT-CONF-01**: Community can configure escalation ladder: which stages are required before legal action (Discussion → Mediation → Vote → Legal)
- [ ] **SETT-CONF-02**: Community can configure legal action trigger: minimum majority required, whether reserve fund can be used, whether external lawyer approval is required
- [ ] **SETT-CONF-03**: Community can configure sub-community logic: whether blocks can vote separately on block-specific issues, whether special-interest groups (garage owners, pool users) vote separately on relevant issues

### Settings — AI/ADMINIA Authority (SETT-AI)

- [ ] **SETT-AI-01**: Community can configure ADMINIA authority level: advisory-only, can auto-classify incidents, can auto-promote ideas to offer collection, can auto-trigger votes, can auto-pay within a configured limit
- [ ] **SETT-AI-02**: Community can configure ADMINIA data access scope: full document access (yes/no), financial access (yes/no), legal case access (yes/no), vendor negotiation suggestions (yes/no)

### Settings — Meta (SETT-META)

- [ ] **SETT-META-01**: Community can configure what majority is required to change governance settings (e.g., 2/3 vote required)
- [ ] **SETT-META-02**: Community can configure time delay before a new setting takes effect (e.g., 7-day notice before new threshold activates)
- [ ] **SETT-META-03**: Settings changes apply forward-only (no retroactive effect on in-progress votes or pending approvals); every settings change is versioned and audit logged with before/after values

### ADMINIA Integration (ADMI)

- [ ] **ADMI-01**: System emits webhook events via BullMQ for: IdeaCreated, SupportThresholdReached, OffersComplete, VoteOpened, VoteLocked, VoteClosed, ProjectCreated, ProjectMilestoneConfirmed, InvoiceSubmitted, ApprovalRequired, MeetingScheduled, MinutesPublished, IncidentCreated, EmergencyAuthorized
- [ ] **ADMI-02**: Webhook delivery uses exponential backoff retry (5s → 30s → 5min → 30min → 2hr); failed events go to dead-letter queue and alert the president
- [ ] **ADMI-03**: All webhook events are persisted to the DB event log regardless of delivery status
- [ ] **ADMI-04**: REST API allows ADMINIA to query all HOMP data: community info, units, settings, votes, finance, meetings, projects, incidents, documents
- [ ] **ADMI-05**: REST API allows ADMINIA to submit: draft content (idea, offer, message text, agenda item), incident classification suggestion — all require human confirmation before publishing
- [ ] **ADMI-06**: REST API enforces ADMINIA's authority level from community settings — requests beyond configured authority are rejected with a clear error
- [ ] **ADMI-07**: ADMINIA chat placeholder FAB (bottom-right) on all pages opens the ADMINIA Messages thread

### Seed Data (SEED)

- [ ] **SEED-01**: Seed script creates 1 community with 10 blocks × 10 units = 100 units; unit naming follows `{block}-{floor}{unit}`; quotas sum exactly to 100.0000%
- [ ] **SEED-02**: Seeded community includes realistic governance settings (sensible defaults for all SETT-* categories)
- [ ] **SEED-03**: Seed includes 20 tenant-linked units and 2 absent-owner units
- [ ] **SEED-04**: Seed includes 8 ideas across stages: 3 new, 2 in offer collection (one with offers, one awaiting), 2 voted (1 passed → project, 1 rejected), 1 near threshold
- [ ] **SEED-05**: Seed includes 4 votes: 1 async open, 1 async closed (passed), 1 in-meeting, 1 meeting-locked; each with offers attached
- [ ] **SEED-06**: Seed includes 3 projects: 1 active (in progress, milestone 2 of 4), 1 upcoming (bidding phase), 1 completed
- [ ] **SEED-07**: Seed includes 1 annual meeting (past, with minutes) + 2 extraordinary meetings (1 upcoming, 1 past)
- [ ] **SEED-08**: Seed includes 11 recurring monthly service entries: cleaning, gardening, pool maintenance, elevator maintenance, electricity common areas, security, pest control, waste, insurance, administration, paddle court — plus pool operational costs
- [ ] **SEED-09**: Seed includes real-topic ideas/incidents: Pergolas/toldos, Persianas regulation, Community Wi-Fi, Entrance door malfunction, Garage door malfunction (vendor bankrupt — example of incident → project → payment dispute), Claims tracking (Aedas & Bertolini)
- [ ] **SEED-10**: Seed includes seeded ADMINIA settings: auto-classify incidents enabled, auto-promote ideas disabled, advisory-only for payments

---

## Future Requirements (v2+)

### Platform
- Super-admin dashboard for managing all communities on the platform
- Community analytics and benchmarking across communities

### Finance
- Annual budget planning tool (set projected budget per category)
- Multi-currency support

### Notifications
- SMS/WhatsApp channel
- Mobile push notifications

### Documents
- Signed PDF auto-generation (vote audit export)
- Timestamped hash for legal document integrity

### Proxy & Elections
- Proxy voter assignment flow (formal delegate at meetings)
- In-HOMP elections for president/board positions

### Integrations
- Google Calendar / Outlook write-sync (not just iCal export)
- External lawyer platform integration for legal escalations

### Mobile
- Native iOS/Android app

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| ADMINIA AI design/logic | ADMINIA is a separate system; HOMP defines event contracts and REST API surface only |
| Blockchain verification | Standard ACID DB + immutable audit log is sufficient; complexity not justified |
| Video conferencing | Meeting participation uses external link (Zoom/Teams); no built-in video |
| Legal/regulatory compliance | No legal claims in any module; out of product scope |
| Native mobile apps | Web-first (mobile-responsive) for v1.0 |
| SMS/WhatsApp notifications | Email + in-app for v1.0; richer channels in v2+ |
| Signed PDF auto-generation | Document export in v2+ |
| External lawyer integrations | Escalation tracked in HOMP; legal execution is external |
| GraphQL API | REST sufficient for ADMINIA; GraphQL adds complexity without benefit |
| Retroactive settings changes | Settings apply forward-only; retroactive changes create governance ambiguity |

---

## Traceability

*Populated by roadmapper — 2026-02-18*

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 1 | Pending |
| INFRA-02 | Phase 1 | Pending |
| INFRA-03 | Phase 1 | Pending |
| INFRA-04 | Phase 1 | Pending |
| INFRA-05 | Phase 1 | Pending |
| AUTH-01 | Phase 2 | Pending |
| AUTH-02 | Phase 2 | Pending |
| AUTH-03 | Phase 2 | Pending |
| AUTH-04 | Phase 2 | Pending |
| AUTH-05 | Phase 2 | Pending |
| AUTH-06 | Phase 2 | Pending |
| AUTH-07 | Phase 2 | Pending |
| COMM-01 | Phase 2 | Pending |
| COMM-02 | Phase 2 | Pending |
| COMM-03 | Phase 2 | Pending |
| COMM-04 | Phase 2 | Pending |
| COMM-05 | Phase 2 | Pending |
| COMM-06 | Phase 2 | Pending |
| COMM-07 | Phase 2 | Pending |
| COMM-08 | Phase 2 | Pending |
| COMM-09 | Phase 2 | Pending |
| COMM-10 | Phase 2 | Pending |
| ONBOARD-01 | Phase 3 | Pending |
| ONBOARD-02 | Phase 3 | Pending |
| ONBOARD-03 | Phase 3 | Pending |
| ONBOARD-04 | Phase 3 | Pending |
| ONBOARD-05 | Phase 3 | Pending |
| ONBOARD-06 | Phase 3 | Pending |
| ONBOARD-07 | Phase 3 | Pending |
| SETT-GOV-01 | Phase 3 | Pending |
| SETT-GOV-02 | Phase 3 | Pending |
| SETT-GOV-03 | Phase 3 | Pending |
| SETT-GOV-04 | Phase 3 | Pending |
| SETT-GOV-05 | Phase 3 | Pending |
| SETT-GOV-06 | Phase 3 | Pending |
| SETT-GOV-07 | Phase 3 | Pending |
| SETT-GOV-08 | Phase 3 | Pending |
| SETT-FIN-01 | Phase 3 | Pending |
| SETT-FIN-02 | Phase 3 | Pending |
| SETT-FIN-03 | Phase 3 | Pending |
| SETT-FIN-04 | Phase 3 | Pending |
| SETT-FIN-05 | Phase 3 | Pending |
| SETT-FIN-06 | Phase 3 | Pending |
| SETT-FIN-07 | Phase 3 | Pending |
| SETT-FIN-08 | Phase 3 | Pending |
| SETT-PROC-01 | Phase 3 | Pending |
| SETT-PROC-02 | Phase 3 | Pending |
| SETT-PROC-03 | Phase 3 | Pending |
| SETT-PROC-04 | Phase 3 | Pending |
| SETT-PROC-05 | Phase 3 | Pending |
| SETT-PROC-06 | Phase 3 | Pending |
| SETT-INC-01 | Phase 3 | Pending |
| SETT-INC-02 | Phase 3 | Pending |
| SETT-INC-03 | Phase 3 | Pending |
| SETT-INC-04 | Phase 3 | Pending |
| SETT-TRANS-01 | Phase 3 | Pending |
| SETT-TRANS-02 | Phase 3 | Pending |
| SETT-TRANS-03 | Phase 3 | Pending |
| SETT-ROLE-01 | Phase 3 | Pending |
| SETT-ROLE-02 | Phase 3 | Pending |
| SETT-ROLE-03 | Phase 3 | Pending |
| SETT-DOC-01 | Phase 3 | Pending |
| SETT-DOC-02 | Phase 3 | Pending |
| SETT-DOC-03 | Phase 3 | Pending |
| SETT-CONF-01 | Phase 3 | Pending |
| SETT-CONF-02 | Phase 3 | Pending |
| SETT-CONF-03 | Phase 3 | Pending |
| SETT-AI-01 | Phase 3 | Pending |
| SETT-AI-02 | Phase 3 | Pending |
| SETT-META-01 | Phase 3 | Pending |
| SETT-META-02 | Phase 3 | Pending |
| SETT-META-03 | Phase 3 | Pending |
| DASH-01 | Phase 4 | Pending |
| DASH-02 | Phase 4 | Pending |
| DASH-03 | Phase 4 | Pending |
| FIN-01 | Phase 5 | Pending |
| FIN-02 | Phase 5 | Pending |
| FIN-03 | Phase 5 | Pending |
| FIN-04 | Phase 5 | Pending |
| FIN-05 | Phase 5 | Pending |
| FIN-06 | Phase 5 | Pending |
| FIN-07 | Phase 5 | Pending |
| FIN-08 | Phase 5 | Pending |
| FIN-09 | Phase 5 | Pending |
| FIN-10 | Phase 5 | Pending |
| FIN-11 | Phase 5 | Pending |
| IDEA-01 | Phase 6 | Pending |
| IDEA-02 | Phase 6 | Pending |
| IDEA-03 | Phase 6 | Pending |
| IDEA-04 | Phase 6 | Pending |
| IDEA-05 | Phase 6 | Pending |
| IDEA-06 | Phase 6 | Pending |
| IDEA-07 | Phase 6 | Pending |
| OFFR-01 | Phase 7 | Pending |
| OFFR-02 | Phase 7 | Pending |
| OFFR-03 | Phase 7 | Pending |
| OFFR-04 | Phase 7 | Pending |
| OFFR-05 | Phase 7 | Pending |
| OFFR-06 | Phase 7 | Pending |
| OFFR-07 | Phase 7 | Pending |
| OFFR-08 | Phase 7 | Pending |
| VOTE-01 | Phase 8 | Pending |
| VOTE-02 | Phase 8 | Pending |
| VOTE-03 | Phase 8 | Pending |
| VOTE-04 | Phase 8 | Pending |
| VOTE-05 | Phase 8 | Pending |
| VOTE-06 | Phase 8 | Pending |
| VOTE-07 | Phase 8 | Pending |
| VOTE-08 | Phase 8 | Pending |
| VOTE-09 | Phase 8 | Pending |
| PROJ-01 | Phase 9 | Pending |
| PROJ-02 | Phase 9 | Pending |
| PROJ-03 | Phase 9 | Pending |
| PROJ-04 | Phase 9 | Pending |
| PROJ-05 | Phase 9 | Pending |
| PROJ-06 | Phase 9 | Pending |
| PROJ-07 | Phase 9 | Pending |
| PROJ-08 | Phase 9 | Pending |
| PROJ-09 | Phase 9 | Pending |
| INCID-01 | Phase 10 | Pending |
| INCID-02 | Phase 10 | Pending |
| INCID-03 | Phase 10 | Pending |
| INCID-04 | Phase 10 | Pending |
| INCID-05 | Phase 10 | Pending |
| INCID-06 | Phase 10 | Pending |
| MEET-01 | Phase 11 | Pending |
| MEET-02 | Phase 11 | Pending |
| MEET-03 | Phase 11 | Pending |
| MEET-04 | Phase 11 | Pending |
| MEET-05 | Phase 11 | Pending |
| MEET-06 | Phase 11 | Pending |
| CAL-01 | Phase 11 | Pending |
| CAL-02 | Phase 11 | Pending |
| CAL-03 | Phase 11 | Pending |
| CAL-04 | Phase 11 | Pending |
| DIR-01 | Phase 11 | Pending |
| DIR-02 | Phase 11 | Pending |
| DIR-03 | Phase 11 | Pending |
| DIR-04 | Phase 11 | Pending |
| DIR-05 | Phase 11 | Pending |
| DIR-06 | Phase 11 | Pending |
| DIR-07 | Phase 11 | Pending |
| DIR-08 | Phase 11 | Pending |
| DOC-01 | Phase 11 | Pending |
| DOC-02 | Phase 11 | Pending |
| DOC-03 | Phase 11 | Pending |
| DOC-04 | Phase 11 | Pending |
| DOC-05 | Phase 11 | Pending |
| DOC-06 | Phase 11 | Pending |
| MSG-01 | Phase 12 | Pending |
| MSG-02 | Phase 12 | Pending |
| MSG-03 | Phase 12 | Pending |
| MSG-04 | Phase 12 | Pending |
| MSG-05 | Phase 12 | Pending |
| MSG-06 | Phase 12 | Pending |
| NOTIF-01 | Phase 12 | Pending |
| NOTIF-02 | Phase 12 | Pending |
| NOTIF-03 | Phase 12 | Pending |
| NOTIF-04 | Phase 12 | Pending |
| NOTIF-05 | Phase 12 | Pending |
| ADMI-01 | Phase 13 | Pending |
| ADMI-02 | Phase 13 | Pending |
| ADMI-03 | Phase 13 | Pending |
| ADMI-04 | Phase 13 | Pending |
| ADMI-05 | Phase 13 | Pending |
| ADMI-06 | Phase 13 | Pending |
| ADMI-07 | Phase 13 | Pending |
| SEED-01 | Phase 13 | Pending |
| SEED-02 | Phase 13 | Pending |
| SEED-03 | Phase 13 | Pending |
| SEED-04 | Phase 13 | Pending |
| SEED-05 | Phase 13 | Pending |
| SEED-06 | Phase 13 | Pending |
| SEED-07 | Phase 13 | Pending |
| SEED-08 | Phase 13 | Pending |
| SEED-09 | Phase 13 | Pending |
| SEED-10 | Phase 13 | Pending |

**Coverage:**
- v1.0 requirements: 187 total
- Mapped to phases: 187
- Unmapped: 0

---
*Requirements defined: 2026-02-18*
*Last updated: 2026-02-18 — traceability populated by roadmapper; 187 requirements mapped across 13 phases*
