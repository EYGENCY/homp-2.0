# Stack Research

**Domain:** HOA / Homeowner Community Management Platform
**Researched:** 2026-02-17
**Confidence:** HIGH (architecture) / MEDIUM (specific versions — verify before pinning)

## Recommended Stack

### Architecture Decision: Separate Frontend + Backend API

**Do NOT use Next.js API routes as the sole backend.** HOMP requires a persistent server process for:
1. BullMQ job queue (webhook delivery to ADMINIA with retry/backoff)
2. Server-Sent Events connections (real-time vote countdowns, approval alerts)
3. ADMINIA REST API (separate surface from the frontend BFF)

**Architecture:** Turborepo monorepo with two apps — `apps/web` (Next.js) + `apps/api` (Hono)

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Next.js** | 15.x | Frontend / SSR / routing | React 19 support, server components, excellent for role-based page rendering; App Router suits HOMP's module structure |
| **Hono** | 4.x | Backend API server | TypeScript-native, built-in OpenAPI/Zod validation, fast runtime, works on Node.js + edge; cleaner than Express for REST + SSE |
| **PostgreSQL** | 16+ | Primary database | NUMERIC columns for exact decimal arithmetic (quota math, finance); ACID transactions for state machine integrity; mature, proven for financial data |
| **Drizzle ORM** | 0.30+ | Database ORM / migrations | SQL-close API gives full control over NUMERIC types and complex transactions; Drizzle avoids Prisma's implicit casting that can corrupt decimal precision |
| **BullMQ** | 5.x | Background job queue | Reliable webhook delivery to ADMINIA with retry, backoff, dead-letter queue; Redis-backed; essential for "no fire-and-forget" webhook requirement |
| **Redis** | 7.x | Job queue backing store | Required by BullMQ; also useful for session caching and rate limiting |
| **React 19** | 19.x | UI framework | Server Components, concurrent features; pairs with Next.js 15 |
| **Tailwind CSS** | 4.x | Styling | Utility-first; matches the professional governance UI shown in screenshots |
| **shadcn/ui** | latest | Component library | Headless, accessible, Tailwind-compatible; ideal for the data-dense tables and forms HOMP needs |
| **TanStack Query** | 5.x | Client data fetching | Optimistic updates for vote submissions; stale-while-revalidate for ledger data; works well with Hono API |
| **TanStack Table** | 8.x | Data tables | Essential for finance ledger, community directory, audit log — complex sortable/filterable tables |
| **better-auth** | 1.x | Authentication | Multi-role session management; supports custom role claims needed for Owner/President/Tenant/ServiceProvider |
| **Turborepo** | 2.x | Monorepo build system | Manages `apps/web`, `apps/api`, `packages/db`, `packages/types` with shared caching |
| **pnpm** | 9.x | Package manager | Workspace support for monorepo; significantly faster than npm |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **decimal.js** | 10.x | Exact decimal arithmetic | All quota calculations and financial math in application code — never use JavaScript native floats |
| **Zod** | 3.x | Schema validation | Validate all API inputs, enforce quota sum = 100.00% at boundary, document state transitions |
| **date-fns** | 3.x | Date manipulation | Vote windows, meeting-locked timing, calendar event generation |
| **@aws-sdk/client-s3** | 3.x | File storage | Documents, invoices, contracts — use with MinIO locally, S3-compatible in prod |
| **MinIO** | latest | Local file storage (dev) | S3-compatible API; run via Docker in development |
| **Resend** | 1.x | Transactional email | Meeting invites, vote reminders, approval notifications |
| **ioredis** | 5.x | Redis client | Used by BullMQ; also available for direct cache operations |
| **winston** | 3.x | Structured logging | Audit log events before writing to DB; also application logging |
| **vitest** | 2.x | Unit testing | Test quota math, state machine transitions, permission checks |
| **Playwright** | 1.x | E2E testing | Test governance workflows (idea → vote → project flow) |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| **Docker Compose** | Local services | Runs PostgreSQL, Redis, MinIO — single `docker compose up` for full local stack |
| **Drizzle Kit** | DB migrations | `drizzle-kit generate` + `drizzle-kit migrate` for schema evolution |
| **OpenAPI / Zod** | API documentation | Generate OpenAPI spec from Hono routes for ADMINIA integration docs |
| **ESLint + Prettier** | Code quality | Turborepo-managed shared configs |
| **tsx** | TypeScript runner | Run API server in development without compilation step |

## Installation

```bash
# Monorepo setup
pnpm create turbo@latest homp-2.0
cd homp-2.0

# API (apps/api)
pnpm add hono @hono/zod-validator bullmq ioredis drizzle-orm pg decimal.js zod date-fns winston

# Web (apps/web)
pnpm add next react react-dom @tanstack/react-query @tanstack/react-table
pnpm add -D tailwindcss@next @tailwindcss/vite

# Auth
pnpm add better-auth

# File storage
pnpm add @aws-sdk/client-s3

# Email
pnpm add resend

# Dev dependencies
pnpm add -D drizzle-kit vitest playwright @playwright/test tsx
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| **Drizzle ORM** | Prisma | If team prefers schema-first modeling; but be aware Prisma can implicitly convert NUMERIC to JS float — requires custom scalar |
| **Hono** | Express / Fastify | If team has deep Express experience; Fastify is a solid choice; Express lacks modern TS ergonomics |
| **BullMQ** | pg-boss | If you want to avoid Redis dependency; pg-boss uses PostgreSQL for job queue — reduces infra but lower throughput |
| **better-auth** | NextAuth / Auth.js | Auth.js is fine if staying Next.js-only; better-auth works across Hono + Next.js monorepo |
| **Server-Sent Events** | WebSockets | Use WebSockets only if bi-directional real-time is needed; HOMP only needs server→client push (vote countdowns, alerts) |
| **Resend** | SendGrid / Postmark | Any transactional email provider works; Resend has excellent DX and TypeScript SDK |
| **Next.js + Hono** | Remix + Prisma | Remix is excellent for form-heavy apps; valid alternative if team prefers it; same architecture patterns apply |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **JavaScript floats for quota math** | `0.1 + 0.2 !== 0.3`; quota sums will drift from 100.00%; financial data corrupted silently | `decimal.js` in app code + `NUMERIC(6,4)` in PostgreSQL |
| **Next.js API routes as sole backend** | No persistent process = no BullMQ worker, no reliable SSE, no ADMINIA REST API surface separate from web BFF | Hono API server in `apps/api` |
| **SQLite** | No `NUMERIC` type with true precision; WAL mode not suitable for concurrent writes from multiple processes | PostgreSQL |
| **MongoDB** | Document model poorly suited for relational quota/finance data; ACID transactions are complex; harder to enforce referential integrity | PostgreSQL |
| **GraphQL** | Adds complexity HOMP doesn't need; REST is sufficient for ADMINIA integration; GraphQL subscriptions would replace SSE badly | REST (Hono) |
| **fire-and-forget webhook calls** | ADMINIA webhook calls that fail silently violate the integration contract; ADMINIA may miss critical governance events | BullMQ with retry + dead-letter queue |
| **Storing quota as float/double** | Database float types cannot represent 1.25% precisely | PostgreSQL `NUMERIC(6,4)` |

## Stack Patterns by Variant

**For quota calculations:**
- Always use `decimal.js` for arithmetic in application code
- Store as `NUMERIC(6,4)` in PostgreSQL (supports 0.0000 to 99.9999)
- Validate sum = 100.0000 before any write in a DB transaction
- Never read quota as JavaScript float from any ORM — use string parsing

**For webhook delivery to ADMINIA:**
- Emit event to BullMQ queue (non-blocking, fire immediately)
- BullMQ worker processes queue, POSTs to ADMINIA webhook URL
- Retry with exponential backoff: 5s, 30s, 5min, 30min, 2hr
- Dead-letter queue for events that fail all retries (alert community president)
- Store event log in DB regardless of delivery status

**For meeting-locked votes:**
- Store `opens_at` and `closes_at` timestamps in DB
- BullMQ scheduled jobs to transition vote state at those timestamps
- Do NOT rely on frontend timers — must be enforced server-side

**For file storage:**
- Development: MinIO in Docker (`docker.io/minio/minio`)
- Production: Any S3-compatible service (AWS S3, Cloudflare R2, Backblaze B2)
- Store file metadata in PostgreSQL; store binary in object storage
- Never store files in DB as BYTEA

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| Next.js 15 | React 19 | Required pair — Next.js 15 is built for React 19 |
| Drizzle ORM 0.30+ | PostgreSQL 16+ | Drizzle supports `NUMERIC` type correctly |
| BullMQ 5.x | ioredis 5.x | BullMQ 5.x requires ioredis v5+ |
| Tailwind CSS 4.x | PostCSS 8.x | Tailwind v4 uses Vite plugin; check Next.js integration guide |
| better-auth 1.x | Hono 4.x | better-auth has official Hono adapter |

## Sources

- Agent analysis based on domain knowledge + HOA platform patterns (training data to May 2025)
- Version numbers should be verified against npm registry before pinning
- Key references: Drizzle ORM docs, BullMQ docs, Hono docs, Next.js 15 release notes

---
*Stack research for: HOMP 2.0 — Homeowner Community Management Platform*
*Researched: 2026-02-17*
