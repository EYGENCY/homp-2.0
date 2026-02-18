# UI Reference — HOMP 2.0

**Source:** 10 reference screenshots from a comparable HOA governance platform
**Captured:** 2026-02-18
**Purpose:** Visual reference for roadmap planning and frontend phase scoping

---

## Layout & Shell

- **Left sidebar navigation** — fixed, ~220px wide, with icon + label per module
  - Logo / app name top-left
  - Nav items: Dashboard, Finance, Ideas, Votes, Projects, Meetings, Community, Calendar, Messages, Notifications
  - Below a divider: Adminia, Settings
  - Current user avatar + name + unit/role at bottom-left
- **Top header** — global search bar (center or top-left depending on screen), notification bell, user avatar (top-right)
- **Main content area** — white background, card-based, full-width with padding
- **ADMINIA chat FAB** — blue robot icon, fixed bottom-right corner (visible on Dashboard)

---

## Design System

- **Color palette:** White backgrounds, blue primary (~#3B82F6), dark navy for emphasis cards
- **Typography:** Bold large headings for page titles, subdued subheadings, small uppercase labels for metadata
- **Cards:** Rounded corners, subtle drop shadow, white fill
- **Status badges:** Pill-shaped, color-coded:
  - Green: RESIDING, COMPLETED, IN PROGRESS, ON TRACK, ACTIVE NOW
  - Yellow/Orange: TENANT, URGENT, UPCOMING
  - Gray: AWAY, PENDING, PRIVATE
  - Red/Pink: OVER BUDGET, REJECTED
- **Buttons:** Primary = blue filled, Secondary = outlined, Destructive = red text
- **Progress bars:** Blue fill, gray track — used for quorum %, budget tracking, idea support meters
- **Countdown timers:** Large digit blocks (DAYS / HOURS / MINS) for votes and upcoming meetings

---

## Module-by-Module UI Reference

### Dashboard (Owner View)
- **Financial Overview card:** Monthly fee, balance (settled/outstanding), reserves % with progress bar
- **Upcoming Assembly card:** Dark navy, meeting name, date/time/platform, live countdown timer
- **Active Votings section:** List of open votes with urgency badge, quorum progress bar, "Vote Now" CTA, days remaining
- **Community Projects section:** 2-col list, project name, status badge (IN PROGRESS / NEGOTIATION / BIDDING), due date
- **Trending Ideas section:** 3-col row, upvote count, category tag, title, proposer name/unit
- **Adminia FAB:** Bottom-right, blue circle with robot icon

### Finance — Community Financial Ledger
- **4 KPI cards at top:** Total Annual Budget, Reserve Fund (with % funded), Monthly Variance, Voter Turnout (digital democracy stat)
- **View tabs:** Community View / Personal View (toggled)
- **Filters:** Category dropdown, date range selector (Last 12 Months)
- **Annual Budget Performance chart:** Line graph — actual spending (solid) vs projected budget (dashed), monthly x-axis
- **Transparency Ledger table:**
  - Columns: Date, Transaction Details (name + TXID), Category (color tag), Amount (red=expense/green=income), Verification badge (AI AUTOMATED / BOARD VOTED), Status (checkmark icon)
  - Pagination: "Showing 1-15 of 248 records"
- **Actions:** Export CSV, Audit Report, + Entry button

### Ideas — Community Proposals & Ideas
- **Banner:** "From Idea to Action" — explains threshold rule (e.g. 70% support → moves to Voting Center), link to Governance Rules
- **Tabs:** Trending / New / Near Threshold
- **Search bar:** top-right of content area
- **Idea cards (grid):** 3-per-row
  - Category tag (SUSTAINABILITY / COMMUNITY / INFRASTRUCTURE)
  - Timestamp (relative)
  - Title + description excerpt
  - "AI Estimated" badge (cost estimate from ADMINIA)
  - Interest Meter: progress bar, % support, resident count, goal threshold, READY FOR VOTE badge when met
  - Estimated cost
  - Support button (becomes "Supported" / green when voted) + "…" overflow menu
- **CTA:** Submit New Idea button (top-right)

### Votes — Active Voting Center
- **Live badge:** "LIVE GOVERNANCE BALLOT" green pill
- **Vote header:** Title, breadcrumb (Governance > Active Voting Center), blockchain audit ref (NOTE: excluded from HOMP scope — replace with standard immutable audit log ref), countdown timer
- **AI Proposal Analysis panel:** Est. Annual Savings, Break-Even Point, Property Value impact (NOTE: this is ADMINIA analysis — HOMP shows the panel but data comes from ADMINIA via webhook)
- **Main body:** Detailed Proposal Narrative (rich text), Supporting Documentation (PDF/file attachments with thumbnails)
- **Vote panel (right sidebar):**
  - "Cast Your Vote" heading with bylaw reference
  - Radio options: Yes/Approve (green), No/Reject (red), Alternative (orange) — each with description
  - Impact Simulation: Current fee vs Projected Post-Loan fee, analysis text
  - Participation: progress bar, X of Y households, quorum status badge
  - Submit Secure Vote button (primary blue, full-width)
  - Anonymous Ballot Security notice

### Projects — Community Projects Tracker
- **Tabs:** Active / Past / Pending
- **Search bar:** global search in header
- **Project cards:**
  - "PASSED VOTE #XXXX" reference badge + start date
  - Contractor name/avatar (top-right of card)
  - Title + description
  - Budget vs Actual: amount spent / total approved, progress bar
  - Live Progress Updates: photo grid with upload slot
  - Actions: View Ballot Breakdown, Message Contractor, Full Specs
- **Right panel:**
  - Milestone Timeline (vertical stepper): Bid Selection → Community Vote → Phase 1 Implementation → Final Handover, each with COMPLETED/ACTIVE/UPCOMING state + date
  - Infrastructure Budget card: Annual allocation, reserved, spent
  - Transparency Pledge note

### Meetings — Meeting Detail
- **Status badge:** UPCOMING / PAST
- **Meeting type:** Public Assembly / Extraordinary
- **Header:** Title, date/time range, location (physical + virtual)
- **Meeting Agenda:** Numbered items
  - Each agenda item has inline Linked Voting System: vote buttons, participation % bar, quorum required indicator
  - Candidate ballot selection for elections (checkbox grid)
- **Right panel:**
  - RSVP Status: Online Participation (with checkmark if confirmed), In-Person Attendance, Assign Proxy Voter — each as selectable card
  - Confirm Attendance primary button
  - Digital Ballroom: video embed/link with meeting URL
  - Required Documentation: downloadable PDF/DOCX list

### Community & Directory
- **Privacy Settings:** toggles for Show Email Address / Show Phone Number (per-user)
- **Apartment Directory table:**
  - Columns: Unit #, Owner Name (with avatar initial), Status badge (RESIDING/TENANT/AWAY), Contact (email or phone, "Private" if hidden), Action (Message button)
  - Search by Unit # or Name
  - Pagination: "Showing X of 128 units"
- **Export Directory** + **New Announcement** actions (top-right)
- **Right panel:**
  - Official Documents: Bylaws & Articles, Rules & Regulations, Fee Schedule, Meeting Minutes — each with file type icon, size, update date, download button
  - View All Archives link
  - Board Members: President + Secretary with avatars, "Contact Board Directly" link

### Calendar
- **Monthly grid view** (standard 7-col week layout)
- **Event color coding:**
  - Blue: Meetings (Board Briefing, Town Hall)
  - Red: Vote deadlines, election close
  - Green: Payment deadlines (Assessment Fees Due)
  - Orange: Projects (Main Gate Repair, Pool Cleanup)
- **Left sidebar filters:** Meetings / Votes / Payments / Projects — each with colored dot toggle checkbox
- **Header:** Month/year nav arrows, Today button, Search events bar, Sync Calendar button, user avatar
- **FAB:** Blue + button (bottom-right) to add event

### Messages
- **Split-panel layout:**
  - Left: thread list — avatar, sender name, timestamp, preview text; unread dot indicator
  - Thread types: Adminia AI, HOA President (role-based), Owner Group (group thread), Maintenance Request
  - Right: active conversation
- **Adminia AI conversation:**
  - User message (plain text, right-aligned)
  - Adminia response with structured analysis card embedded (e.g. Conflict Analysis Report with ✓ State Compliance / ⚠ Governance Risk items)
  - Action buttons inline in AI response: "Draft Comment", "Flag for Board"
- **Message composer:** Rich text toolbar (Bold, List, Attachment, Document), placeholder "Type a message or use '/' for commands…", send button
- **Footer note:** "Only visible to you and Adminia AI" for AI threads

### Settings
- **Page layout:** full-width form, 2-col on wider sections
- **Personal Profile:** First name, last name, email (with VERIFIED badge), phone
- **Property Details:** Assigned unit (name, specs), Occupancy status (Owner Occupied / Tenant), Ownership Proof document upload (PDF)
- **Notifications panel (right):** Email Alerts, In-App Push, WhatsApp Sync — each with toggle + description
- **Security panel:**
  - 2FA status with MANAGE link
  - Registered Login Keys list (device name + last used / added date)
  - + Add Security Key button
- **Profile header:** Avatar with edit pencil, name, VERIFIED OWNER badge, member since date, Preview Profile + Save All Changes buttons

---

## Key UI Patterns

| Pattern | Used In |
|---------|---------|
| Countdown timer (days/hrs/mins digit blocks) | Votes detail, Dashboard upcoming meeting |
| Quorum/support progress bar | Votes, Ideas, Meeting agenda items |
| Milestone timeline (vertical stepper) | Projects |
| Budget vs actual progress bar | Projects, Finance |
| Inline linked voting in meetings | Meeting agenda items |
| AI analysis panel (ADMINIA data) | Votes detail, Messages |
| Category color tags | Finance ledger, Ideas cards |
| Document attachment cards | Votes, Meetings, Community, Settings |
| Split-panel layout | Messages |
| Card grid | Ideas |
| Data table with pagination | Finance ledger, Community directory |

---

## Notes for HOMP 2.0 Implementation

1. **Blockchain references** in screenshots are **out of scope** — replace with "Immutable Audit Log" language
2. **AI Estimated / AI Proposal Analysis** panels are **ADMINIA data** — HOMP renders the panel but data is populated by ADMINIA via REST API; show placeholder/empty state if ADMINIA hasn't responded
3. **"Digital Democracy" stat** in Finance KPIs can be adapted to voter turnout metric (% of quota that voted in last vote)
4. **WhatsApp Sync** notification channel is aspirational — implement Email + In-App for v1.0; WhatsApp as future channel
5. **Proxy Voter** (assign proxy in meetings RSVP) — not mentioned in PROJECT.md requirements; flag as potential addition
6. **Candidate ballot in meetings** — supports election-style votes within meeting context; maps to meeting-locked votes in HOMP
7. **"Message Contractor"** in projects — maps to Messages module, service provider role
8. **ADMINIA chat** appears both as FAB (bottom-right, all screens) and as a full conversation in Messages — the Messages integration is deeper than a simple widget

---
*UI reference captured from 10 reference screenshots — 2026-02-18*
