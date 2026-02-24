---
phase: 01-infrastructure-and-monorepo
plan: "05"
subsystem: infra
tags: [railway, github, deployment, health-check, esbuild, bundling, monorepo]

# Dependency graph
requires:
  - 01-04
provides:
  - "GitHub repo EYGENCY/homp-2.0 (public) with all Phase 1 code pushed to main"
  - "Railway project with Postgres + Redis + homp-api + homp-web services"
  - "homp-api live at https://homp-api-production.up.railway.app/health → {db:ok, redis:ok}"
  - "homp-web live at https://homp-web-production.up.railway.app (Next.js 200)"
  - "Auto-deploy wired: Railway GitHub App installed, push to main triggers both services"
  - "esbuild bundler for API: bundles JIT workspace packages inline, externalizes ioredis"
affects:
  - all-phases

# Tech tracking
tech-stack:
  added:
    - "esbuild@^0.27.3 (devDependency in apps/api)"
  patterns:
    - "API build: esbuild bundles @homp/* workspace packages inline; --external:ioredis only (CJS dynamic require issue)"
    - "Railway GitHub App installed on EYGENCY account — auto-deploy on push to main"
    - "drizzle-kit migrate requires meta/_journal.json + meta/0000_snapshot.json — must be committed for baseline migrations"

key-files:
  created:
    - packages/db/migrations/meta/_journal.json
    - packages/db/migrations/meta/0000_snapshot.json
  modified:
    - apps/api/package.json

key-decisions:
  - "esbuild replaces tsc for API build: tsc doesn't bundle workspace deps; JIT packages (TypeScript source as main) fail at runtime under Node.js ESM without a loader"
  - "Only ioredis is externalized: CJS packages bundled into ESM cause 'Dynamic require' errors for Node.js builtins; all other deps (hono, postgres, drizzle-orm, etc.) are ESM-safe to bundle"
  - "drizzle-kit meta files created manually: baseline migration was created by hand (not via drizzle-kit generate), so the meta/ directory was missing — Railway preDeployCommand failed until these were added"
  - "Railway GitHub App required for code-triggered deploys: serviceInstanceRedeploy without GitHub App only reuses cached images"

patterns-established:
  - "Pattern: JIT workspace packages need a bundler (esbuild/tsup) for production — Node.js cannot load .ts source files at runtime"
  - "Pattern: drizzle-kit manual migrations require corresponding meta/ entries to be created alongside the SQL"

requirements-completed: [INFRA-04]

# Metrics
duration: 120min
completed: 2026-02-25
---

# Phase 1 Plan 5: Railway Deployment Checkpoint Summary

**All Phase 1 code deployed to Railway production — homp-api and homp-web live with auto-deploy pipeline wired.**

## Performance

- **Duration:** ~120 min (includes GitHub setup, Railway API setup, and debugging deploy chain)
- **Completed:** 2026-02-25
- **Tasks:** 2
- **Files modified:** 3 (meta files + package.json)

## Accomplishments

- GitHub repo `EYGENCY/homp-2.0` created, all Phase 1 code pushed to `main`
- Railway GitHub App installed on EYGENCY account — auto-deploy fires on every push to `main`
- Railway project `943e1742-0cea-4b40-a0e5-119a7b0e5c12` with 4 services:
  - **Postgres**: `63997cfc` — SUCCESS (postgres:16 with persistent volume)
  - **Redis**: `aafe6c6b` — SUCCESS (redis:7-alpine)
  - **homp-api**: `ff801f97` — SUCCESS (https://homp-api-production.up.railway.app)
  - **homp-web**: `edcaef44` — SUCCESS (https://homp-web-production.up.railway.app)
- `GET /health` → `{"db":"ok","redis":"ok"}` ✓
- homp-web root → Next.js HTML 200 ✓

## Deviations and Issues Resolved

### Issue 1: Missing drizzle-kit meta files
- **Root cause**: Baseline migration was created manually (not via `drizzle-kit generate`), so `migrations/meta/_journal.json` and `0000_snapshot.json` were absent
- **Symptom**: `preDeployCommand` (`drizzle-kit migrate`) failed: "Can't find meta/_journal.json"
- **Fix**: Created both files with correct drizzle-kit v7 format and committed them

### Issue 2: JIT packages incompatible with Node.js ESM at runtime
- **Root cause**: `@homp/db` and `@homp/config` have `"main": "./src/index.ts"` — Node.js ESM cannot resolve `.ts` files at runtime
- **Symptom**: `ERR_MODULE_NOT_FOUND: Cannot find module '/app/packages/db/src/schema'`
- **Fix**: Replaced `tsc` with `esbuild` in the API build script — bundles all workspace packages inline

### Issue 3: Dynamic require failure when bundling ioredis into ESM
- **Root cause**: `ioredis` is a CJS package; bundling it into ESM breaks `require("events")` calls at runtime
- **Symptom**: `Error: Dynamic require of "events" is not supported`
- **Fix**: Added `--external:ioredis` to esbuild command — ioredis is loaded from node_modules at runtime (it's in `dependencies`)

### Issue 4: Transitive workspace deps not in Railway module path
- **Root cause**: `@t3-oss/env-core` is a dep of `@homp/config` (not `apps/api`) — when externalized, it wasn't in Railway's module resolution path
- **Symptom**: `ERR_MODULE_NOT_FOUND: Cannot find package '@t3-oss/env-core'`
- **Fix**: Bundle all npm deps inline except `ioredis` — only ioredis needs to be external

## Verification

- `curl https://homp-api-production.up.railway.app/health` → `{"db":"ok","redis":"ok"}` ✓
- `https://homp-web-production.up.railway.app` → Next.js HTML, HTTP 200 ✓
- `git ls-files .env` → empty (no secrets in git) ✓
- Railway auto-deploy: GitHub App installed, push to main triggers both services ✓

## Railway Resources

| Resource | ID | Status |
|----------|-----|--------|
| Project | 943e1742-0cea-4b40-a0e5-119a7b0e5c12 | ACTIVE |
| Environment | a13b173c-558e-4fc8-b786-398781f46dd0 | Production |
| Postgres service | 63997cfc-0945-4eaa-a50b-26a1c2d1a064 | SUCCESS |
| Redis service | aafe6c6b-4c6a-4889-b0e5-7e4a7a3c8f88 | SUCCESS |
| homp-api service | ff801f97-af6d-4ad6-bf2a-d1e69a197029 | SUCCESS |
| homp-web service | edcaef44-5d87-4e43-8aa8-2d5d452af14d | SUCCESS |

## Self-Check: PASSED

- homp-api health: `{"db":"ok","redis":"ok"}` — VERIFIED
- homp-web: HTTP 200 Next.js response — VERIFIED
- No secrets in git: `git ls-files .env` empty — VERIFIED
- Auto-deploy: Railway GitHub App installed — VERIFIED
- Drizzle meta files: committed and pushed — VERIFIED

---
*Phase: 01-infrastructure-and-monorepo*
*Completed: 2026-02-25*
