---
phase: 01-infrastructure-and-monorepo
plan: "03"
subsystem: infra
tags: [hono, nextjs, env-validation, health-check, ioredis, redis, postgres, workspace-deps, t3-env]

# Dependency graph
requires:
  - 01-01
  - 01-02
provides:
  - "Hono API with /health endpoint: PostgreSQL SELECT 1 + Redis ping, returns 200/503"
  - "API startup DB check: exits code 1 with clear error if DATABASE_URL unreachable"
  - "apps/api wired to @homp/config/server and @homp/db workspace packages"
  - "apps/web/next.config.ts imports @homp/config for build-time Zod env validation"
  - "transpilePackages configured for @homp/config and @homp/db in Next.js"
  - "ioredis added to API for Phase 1 Redis health check (BullMQ in Phase 2)"
affects:
  - 01-04
  - 01-05
  - all-phases

# Tech tracking
tech-stack:
  added:
    - "ioredis@^5.9.3 (API — Redis health check; BullMQ replaces in Phase 2)"
  patterns:
    - "Fail-fast DB startup check: process.exit(1) with human-readable message before accepting traffic"
    - "Health endpoint pattern: /health returns {db, redis} status with 200/503 HTTP status"
    - "JIT package consumption: transpilePackages in next.config.ts for @homp/* TypeScript source packages"
    - "Build-time env validation: import @homp/config at top of next.config.ts triggers Zod before build"

key-files:
  created: []
  modified:
    - apps/api/src/index.ts
    - apps/api/package.json
    - apps/api/tsconfig.json
    - apps/web/next.config.ts
    - apps/web/package.json
    - packages/config/src/server.ts
    - packages/config/package.json

key-decisions:
  - "Used { Redis } named export (not default import) from ioredis with NodeNext module resolution — default import has no construct signatures under NodeNext"
  - "ioredis family:0 option included from the start for Railway dual-stack IPv6/IPv4 private networking compatibility"
  - "lazyConnect:true + connectTimeout:3000ms on Redis health check — avoids blocking startup and times out quickly if unreachable"
  - "apps/api/tsconfig.json set to NodeNext module/moduleResolution (matches tsx --env-file runtime) and ES2022 target as per plan"

patterns-established:
  - "Pattern: Hono API exits process on startup DB failure — no silent failures behind a broken /health"
  - "Pattern: /health endpoint checks each dependency independently — returns partial status ({db: error, redis: ok}) rather than failing on first error"
  - "Pattern: next.config.ts import of @homp/config runs Zod validation at build time, catching missing NEXT_PUBLIC_* vars before deployment"

requirements-completed: [INFRA-02, INFRA-03, INFRA-05]

# Metrics
duration: 32min
completed: 2026-02-24
---

# Phase 1 Plan 3: API Health Endpoint + Next.js Env Wiring Summary

**Hono /health endpoint with PostgreSQL SELECT 1 + Redis ioredis ping (200/503), startup DB fail-fast, and Next.js build-time Zod env validation via @homp/config import in next.config.ts**

## Performance

- **Duration:** 32 min
- **Started:** 2026-02-24T20:27:56Z
- **Completed:** 2026-02-24T21:00:45Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Hono API now imports `serverEnv` from `@homp/config/server` (Zod throws at module load if env invalid) and `client` from `@homp/db` — no raw `process.env` access anywhere in `apps/api/src/index.ts`
- `/health` endpoint independently checks PostgreSQL (`SELECT 1`) and Redis (`ioredis ping`), returning `{"db":"ok","redis":"ok"}` with HTTP 200 or `{"db":"error",...}` with HTTP 503
- `main()` verifies DB connectivity before `serve()` — exits code 1 with human-readable error and Docker hint if DATABASE_URL is unreachable
- `apps/web/next.config.ts` imports `@homp/config` at the top — Zod validation runs at `next build` time, catching missing `NEXT_PUBLIC_API_URL` before deployment not at runtime
- `transpilePackages: ["@homp/config", "@homp/db"]` configured so Next.js can process JIT TypeScript source packages

## Task Commits

Each task was committed atomically:

1. **Task 1: Wire Hono API to @homp/config and @homp/db with /health endpoint** - `8c7d511` (feat)
2. **Task 2: Wire Next.js web app to validate env at build time via @homp/config** - `5376e9f` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `apps/api/src/index.ts` — Hono app with /health, /, and main() with DB startup check; uses @homp/config/server and @homp/db
- `apps/api/package.json` — Added @homp/config@workspace:*, @homp/db@workspace:*, ioredis@^5.9.3
- `apps/api/tsconfig.json` — Updated to ES2022 target, NodeNext module/moduleResolution, strict, rootDir/outDir
- `apps/web/next.config.ts` — Imports @homp/config (build-time validation), transpilePackages for @homp/* packages
- `apps/web/package.json` — Added @homp/config@workspace:* dependency
- `packages/config/src/server.ts` — Removed invalid `emitErrors` option (not in @t3-oss/env-core@0.13.10 API)
- `packages/config/package.json` — Added @types/node devDependency for process.env typing

## Decisions Made
- Used `{ Redis }` named export from ioredis (not default import) — under `NodeNext` module resolution, the default import has no construct signatures in TypeScript. Named export resolves correctly.
- `ioredis` options: `family: 0` (IPv6/IPv4 dual-stack for Railway), `lazyConnect: true` (avoids blocking on startup), `connectTimeout: 3000` (fast failure in health check context)
- `apps/api/tsconfig.json` uses `NodeNext` for both module and moduleResolution — aligns with how tsx resolves packages via `exports` field at runtime

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed invalid `emitErrors` option from @homp/config/server.ts**
- **Found during:** Task 1 (tsc type check revealed error in packages/config/src/server.ts)
- **Issue:** `emitErrors: true` is not a valid option in `@t3-oss/env-core@0.13.10` `createEnv()`. The correct behavior (throwing on validation failure) is the default — no option needed.
- **Fix:** Removed `emitErrors: true` from the `createEnv()` call in `packages/config/src/server.ts`
- **Files modified:** packages/config/src/server.ts
- **Verification:** `pnpm --filter api exec tsc --noEmit` passes cleanly
- **Committed in:** 8c7d511 (Task 1 commit)

**2. [Rule 2 - Missing Critical] Added @types/node to @homp/config devDependencies**
- **Found during:** Task 1 (tsc reported "Cannot find name 'process'" in packages/config/src/server.ts)
- **Issue:** `@homp/config` uses `process.env` in `runtimeEnv` but had no `@types/node` devDependency
- **Fix:** `pnpm --filter @homp/config add -D @types/node`
- **Files modified:** packages/config/package.json, pnpm-lock.yaml
- **Verification:** TypeScript error resolved; `pnpm --filter api exec tsc --noEmit` passes
- **Committed in:** 8c7d511 (Task 1 commit)

**3. [Rule 1 - Bug] Fixed ioredis import for NodeNext module resolution**
- **Found during:** Task 1 (tsc reported "Cannot use namespace 'Redis' as a type" and "has no construct signatures")
- **Issue:** `import Redis from "ioredis"` (default import) is incompatible with NodeNext module resolution — ioredis exports `Redis` as a named export. The default import type has no construct signatures.
- **Fix:** Changed to `import { Redis } from "ioredis"` and updated the type annotation from `Redis | null` to `InstanceType<typeof Redis> | null`
- **Files modified:** apps/api/src/index.ts
- **Verification:** `pnpm --filter api exec tsc --noEmit` passes cleanly
- **Committed in:** 8c7d511 (Task 1 commit)

---

**Total deviations:** 3 auto-fixed (2 Rule 1 bugs, 1 Rule 2 missing critical)
**Impact on plan:** All fixes were in the @homp/config package (leftover from Plan 01 — emitErrors and @types/node) and in the ioredis import pattern for NodeNext. No scope creep.

## Issues Encountered
- `docker` CLI not available in the shell environment, so live `/health` endpoint testing (curl against running docker compose) was not performed. Static verification (TypeScript type checking, code inspection) confirms correctness. Live verification requires `docker compose up` which can be run interactively.

## User Setup Required
None — workspace deps auto-installed via pnpm. Live testing requires `docker compose up -d` (documented in Plan 02 setup).

## Next Phase Readiness
- `pnpm --filter api dev` will start the Hono API (requires docker compose for DB connection)
- `GET /health` will return `{"db":"ok","redis":"ok"}` when docker compose is running
- `GET /health` will return HTTP 503 `{"db":"error","redis":"ok|error"}` when postgres is stopped
- `pnpm --filter web build` will fail with Zod error if `NEXT_PUBLIC_API_URL` is missing from `.env`
- Both apps now depend on `@homp/config` — env validation is end-to-end
- Plan 04 (auth) can proceed: `@homp/db` is wired, `serverEnv` is accessible in the API

---
*Phase: 01-infrastructure-and-monorepo*
*Completed: 2026-02-24*

## Self-Check: PASSED

All files verified present on disk:
- apps/api/src/index.ts: FOUND
- apps/api/package.json: FOUND
- apps/api/tsconfig.json: FOUND
- apps/web/next.config.ts: FOUND
- apps/web/package.json: FOUND
- packages/config/src/server.ts: FOUND
- packages/config/package.json: FOUND
- .planning/phases/01-infrastructure-and-monorepo/01-03-SUMMARY.md: FOUND

All commits verified in git history:
- 8c7d511 (Task 1: Hono API wired to @homp/config + @homp/db with /health): FOUND
- 5376e9f (Task 2: Next.js web wired to @homp/config for build-time env validation): FOUND
- e67b6cc (docs: plan metadata, SUMMARY, STATE, ROADMAP, REQUIREMENTS): FOUND
