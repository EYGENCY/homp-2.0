# Phase 1: Infrastructure & Monorepo - Context

**Gathered:** 2026-02-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Complete and wire up the developer stack so any developer can clone the repo, run `docker compose up` to start PostgreSQL/Redis/MinIO locally, run `pnpm dev` to start both Next.js and Hono concurrently, apply the initial Drizzle migration, and have the app deployed live on Railway.

The monorepo is already partially scaffolded: Turborepo, `apps/web`, `apps/api` (Hono 4), `packages/db` (Drizzle + postgres), and `docker-compose.yml` (PG/Redis/MinIO) all exist. Phase 1 completes the missing pieces: env validation, initial migration, Railway deployment, and wiring packages/config.

</domain>

<decisions>
## Implementation Decisions

### Env var setup
- Single `.env` at monorepo root — shared by all apps via Turbo env passthrough
- Apps fail fast on startup with a clear, specific error message if required vars are missing (not silent runtime failures)
- `.env.example` includes every required var with commented explanations of what each is for
- Both `apps/web` and `apps/api` import env from `@homp/config` (not raw `process.env`)

### Initial DB migration
- First migration is baseline only: enable `uuid-ossp` extension and confirm Drizzle can connect and migrate. No application tables in Phase 1 — all real tables come in Phase 2.
- Add a `db:reset` script (accessible via `pnpm db:reset`) that drops and recreates the local database — useful for fresh dev setup
- Hono API verifies the DB connection at startup; logs a clear error and exits if it cannot reach Postgres
- API exposes a `GET /health` endpoint returning `{ db: 'ok', redis: 'ok' }` — used by Railway health checks and local debugging

### Railway deployment
- Goal: Phase 1 ends with a real live Railway URL (web app + API + Postgres + Redis all running)
- Railway account exists, connected via GitHub — auto-deploy on push to `main`
- MinIO is local-only (docker compose); production uses Railway's S3-compatible storage. Configure the object storage connection string in Phase 1 but do not deploy MinIO to Railway.

### packages/config scope
- `packages/config` exports Zod-validated env schemas only
- Two separate schemas: `serverEnv` (DATABASE_URL, REDIS_URL, secrets) and `clientEnv` (NEXT_PUBLIC_API_URL and other browser-safe vars) — prevents accidentally exposing secrets to the browser
- Both `apps/web` and `apps/api` import from `@homp/config`; neither accesses `process.env` directly

### Claude's Discretion
- Whether `apps/web` validates env at build time or runtime (Next.js has nuances here — Claude decides best approach)
- Exact Turbo pipeline config for env passthrough
- Port numbers and local dev URLs
- Docker compose health check configuration
- Specific Railway service names and config file structure (railway.toml)
- Compression and caching config for Railway builds

</decisions>

<specifics>
## Specific Ideas

- Railway account is connected via GitHub, so auto-deploy on `git push origin main` is the natural trigger — no separate CI step needed for deployment
- MinIO stays in docker-compose for local dev; production object storage is Railway S3-compatible (or Cloudflare R2 — Claude decides)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-infrastructure-and-monorepo*
*Context gathered: 2026-02-19*
