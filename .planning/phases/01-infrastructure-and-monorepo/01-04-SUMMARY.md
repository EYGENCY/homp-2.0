---
phase: 01-infrastructure-and-monorepo
plan: 04
subsystem: infra
tags: [railway, railpack, toml, deployment, migrations, drizzle]

# Dependency graph
requires:
  - phase: 01-02
    provides: Hono API app with dist/index.js build output
  - phase: 01-03
    provides: /health endpoint and drizzle-kit migrate script in packages/db

provides:
  - apps/api/railway.toml with Railpack builder, migration preDeployCommand, /health healthcheck
  - apps/web/railway.toml with Railpack builder, / healthcheck

affects:
  - 01-05
  - all future phases deploying to Railway

# Tech tracking
tech-stack:
  added: [Railway Railpack builder, railway.toml config format]
  patterns: [monorepo Railway deploy from repo root, preDeployCommand for DB migrations before each API deploy]

key-files:
  created:
    - apps/api/railway.toml
    - apps/web/railway.toml
  modified: []

key-decisions:
  - "Railpack builder selected (not Dockerfile) — auto-detects pnpm workspaces from repo root"
  - "preDeployCommand runs drizzle-kit migrate before each API deploy ensuring schema is always current"
  - "No rootDirectory set in either railway.toml — both build from repo root to resolve shared @homp/* packages"
  - "Railway variable references (${{Postgres.DATABASE_URL}}, ${{Redis.REDIS_URL}}) used — no hardcoded credentials"

patterns-established:
  - "Railway services build from repo root (no rootDirectory) to resolve shared monorepo packages"
  - "preDeployCommand pattern: run migrations before each API deploy, not as a separate job"

requirements-completed: [INFRA-04]

# Metrics
duration: 3min
completed: 2026-02-24
---

# Phase 1 Plan 04: Railway Deployment Config Summary

**Railpack railway.toml files for Hono API (with auto-migration preDeployCommand) and Next.js web, both building from monorepo root**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-24T21:05:09Z
- **Completed:** 2026-02-24T21:08:00Z
- **Tasks:** 1
- **Files modified:** 2

## Accomplishments
- Created `apps/api/railway.toml` with Railpack builder, `pnpm --filter api build`, `preDeployCommand` running `pnpm --filter @homp/db migrate` before each deploy, `/health` healthcheck, and ALWAYS restart policy
- Created `apps/web/railway.toml` with Railpack builder, `pnpm --filter web build`, `/` healthcheck, and ALWAYS restart policy
- Both configs build from repo root (no `rootDirectory`) ensuring shared `@homp/*` packages are resolvable during build

## Task Commits

Each task was committed atomically:

1. **Task 1: Create railway.toml files for API and web services** - `54d6c8d` (chore)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified
- `apps/api/railway.toml` - Railway service config for Hono API: Railpack builder, migration preDeployCommand, /health healthcheck
- `apps/web/railway.toml` - Railway service config for Next.js web: Railpack builder, / healthcheck

## Decisions Made
- Railpack builder selected (not Dockerfile) — auto-detects pnpm workspaces from repo root, no custom Dockerfile needed
- `preDeployCommand` set to `pnpm --filter @homp/db migrate` — migrations run before each API deploy, guaranteeing schema is current when the new code starts
- Neither config sets `rootDirectory` — repo root build is required so `packages/config` and `packages/db` are resolvable
- Railway variable references (`${{Postgres.DATABASE_URL}}`, `${{Redis.REDIS_URL}}`) used for credentials — never hardcoded

## Deviations from Plan

None - plan executed exactly as written.

## User Setup Required

**Railway project requires one-time manual setup via Railway dashboard.** Steps required before the live deploy verification in Plan 05:

1. Create a new Railway project named "homp-2.0"
2. Add PostgreSQL plugin (Railway names it "Postgres" → provides `${{Postgres.DATABASE_URL}}`)
3. Add Redis plugin (Railway names it "Redis" → provides `${{Redis.REDIS_URL}}`)
4. Create service "homp-api":
   - Source: this GitHub repo, branch: main
   - Root Directory: leave EMPTY (repo root)
   - Railway auto-detects `apps/api/railway.toml`
   - Set environment variables: `DATABASE_URL=${{Postgres.DATABASE_URL}}`, `REDIS_URL=${{Redis.REDIS_URL}}`, `NODE_ENV=production`, `PORT=3001`
   - S3 vars: `S3_ENDPOINT`, `S3_BUCKET=homp-prod`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_REGION=us-east-1`
   - Watch paths: `apps/api/**`, `packages/config/**`, `packages/db/**`
5. Create service "homp-web":
   - Source: this GitHub repo, branch: main
   - Root Directory: leave EMPTY (repo root)
   - Railway auto-detects `apps/web/railway.toml`
   - Set environment variables: `NEXT_PUBLIC_API_URL=https://<homp-api-domain>.up.railway.app` (set after API first deploy), `DATABASE_URL=${{Postgres.DATABASE_URL}}`, `REDIS_URL=${{Redis.REDIS_URL}}`, `NODE_ENV=production`
   - S3 vars same as API service
   - Watch paths: `apps/web/**`, `packages/config/**`
6. Push to main to trigger first deploy

Note: `NEXT_PUBLIC_API_URL` for homp-web must be set after homp-api gets its Railway domain. Use `${{homp-api.RAILWAY_PUBLIC_DOMAIN}}` if Railway variable references support cross-service, or set manually.

## Next Phase Readiness
- Both railway.toml files committed — Railway will auto-detect them when services are connected to the repo
- Plan 05 (final phase verification) covers Railway project setup and live URL verification
- No blockers

---
*Phase: 01-infrastructure-and-monorepo*
*Completed: 2026-02-24*

## Self-Check: PASSED

- apps/api/railway.toml: FOUND
- apps/web/railway.toml: FOUND
- 01-04-SUMMARY.md: FOUND
- Commit 54d6c8d: FOUND
