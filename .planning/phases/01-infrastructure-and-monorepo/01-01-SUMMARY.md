---
phase: 01-infrastructure-and-monorepo
plan: "01"
subsystem: infra
tags: [zod, t3-env, env-validation, monorepo, pnpm, turborepo, typescript]

# Dependency graph
requires: []
provides:
  - "@homp/config JIT internal package with serverEnv and clientEnv exports"
  - "Zod-validated server env schema (DATABASE_URL, REDIS_URL, S3_*, NODE_ENV, PORT)"
  - "Zod-validated client env schema (NEXT_PUBLIC_API_URL)"
  - ".env.example with all 10 required vars documented with local defaults and comments"
  - "Root .gitignore covering secrets at root and app levels"
  - "Root tsconfig.json as shared TypeScript base config"
affects:
  - 01-02
  - 01-03
  - 01-04
  - 01-05
  - all-phases

# Tech tracking
tech-stack:
  added:
    - "zod@^4.3.6"
    - "@t3-oss/env-core@^0.13.10"
    - "@t3-oss/env-nextjs@^0.13.10"
  patterns:
    - "JIT internal package: TypeScript source exported directly, no build step"
    - "Server/client env split: serverEnv for secrets, clientEnv for NEXT_PUBLIC_ vars"
    - "@t3-oss/env-core for Hono (server-only), @t3-oss/env-nextjs for Next.js client split"

key-files:
  created:
    - packages/config/package.json
    - packages/config/tsconfig.json
    - packages/config/src/index.ts
    - packages/config/src/server.ts
    - packages/config/src/client.ts
    - .env.example
    - .gitignore
    - tsconfig.json
  modified: []

key-decisions:
  - "JIT package pattern: packages/config exports TypeScript source directly (no build step) — both apps/api (tsx) and apps/web (Next.js) consume TS natively"
  - "Server/client env split using @t3-oss/env-core (Hono side) and @t3-oss/env-nextjs (Next.js side) — prevents server secrets from reaching browser bundles"
  - "Root tsconfig.json created as minimal base (strict, ESNext, Bundler, ES2022) since it did not exist"
  - ".env.example uses postgresql:// protocol prefix (not postgres://) to match Zod z.string().url() validation"

patterns-established:
  - "Pattern: All env access via @homp/config — never raw process.env in app code"
  - "Pattern: serverEnv for server-only vars, clientEnv for NEXT_PUBLIC_ vars"
  - "Pattern: JIT packages use exports field pointing to .ts source files directly"

requirements-completed: [INFRA-05]

# Metrics
duration: 12min
completed: 2026-02-24
---

# Phase 1 Plan 1: @homp/config Env Package Summary

**Zod-validated env schema package (@homp/config) with server/client split using @t3-oss/env-core and @t3-oss/env-nextjs, plus documented .env.example and secret-protecting .gitignore**

## Performance

- **Duration:** 12 min
- **Started:** 2026-02-24T19:31:27Z
- **Completed:** 2026-02-24T19:43:00Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Created @homp/config as JIT internal package — TypeScript source exported directly, no build step needed
- Implemented server/client env schema split: serverEnv (DATABASE_URL, REDIS_URL, S3_*, NODE_ENV, PORT) and clientEnv (NEXT_PUBLIC_API_URL) using T3 Env
- Established .env.example with all 10 required vars documented with local dev defaults and production notes
- Root .gitignore now covers .env at root and app levels, preventing accidental secret commits
- Root tsconfig.json created as shared TypeScript base for all packages

## Task Commits

Each task was committed atomically:

1. **Task 1: Create packages/config as JIT internal package** - `f910907` (feat)
2. **Task 2: Create .env.example and root .gitignore** - `868d90a` (chore)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `packages/config/package.json` - @homp/config JIT package with exports field (root, ./server, ./client)
- `packages/config/tsconfig.json` - extends root tsconfig.json
- `packages/config/src/server.ts` - serverEnv: DATABASE_URL, REDIS_URL, S3_*, NODE_ENV, PORT via @t3-oss/env-core
- `packages/config/src/client.ts` - clientEnv: NEXT_PUBLIC_API_URL via @t3-oss/env-nextjs
- `packages/config/src/index.ts` - re-exports serverEnv and clientEnv
- `tsconfig.json` - root TypeScript base config (strict, ESNext, Bundler, ES2022)
- `.env.example` - all 10 vars with comments and local dev defaults
- `.gitignore` - .env coverage at root and app levels plus build outputs, turbo cache, OS/editor artifacts
- `pnpm-lock.yaml` - updated with zod, @t3-oss/env-core, @t3-oss/env-nextjs

## Decisions Made
- Used JIT package pattern (no build step) since both consumers (tsx for API, Next.js for web) handle TypeScript natively — avoids unnecessary compilation complexity
- Used @t3-oss/env-core for server.ts (framework-agnostic, correct for Hono) and @t3-oss/env-nextjs for client.ts (handles NEXT_PUBLIC_ inlining nuances for Next.js build pipeline)
- Created root tsconfig.json with `moduleResolution: "Bundler"` — matches both Next.js (Turbopack) and tsx consumption patterns
- .env.example uses `postgresql://` prefix (not `postgres://`) to satisfy Zod `z.string().url()` validation (postgres:// is not a valid URL scheme per the WHATWG URL standard)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Created root tsconfig.json**
- **Found during:** Task 1 (create packages/config/tsconfig.json)
- **Issue:** packages/config/tsconfig.json extends "../../tsconfig.json" which did not exist at repo root
- **Fix:** Created minimal root tsconfig.json with compilerOptions: strict, module: ESNext, moduleResolution: Bundler, target: ES2022. Plan explicitly specified this as the fallback action.
- **Files modified:** tsconfig.json
- **Verification:** packages/config/tsconfig.json extends successfully, pnpm filter resolves package
- **Committed in:** f910907 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 2 — missing critical prerequisite)
**Impact on plan:** Plan explicitly anticipated this case and specified the fallback action. No scope creep.

## Issues Encountered
None — installation and file creation completed without errors.

## User Setup Required
None — no external service configuration required for this plan. `.env` is pre-populated with local dev defaults.

## Next Phase Readiness
- @homp/config is resolvable via `pnpm --filter @homp/config` — ready for apps/api and apps/web to add as workspace dependency
- serverEnv and clientEnv schemas are complete — consuming apps need `@homp/config: "workspace:*"` added to their package.json
- .env is pre-populated for local development — `docker compose up` will provide the services
- Root tsconfig.json available as shared base — other packages/apps can extend it

---
*Phase: 01-infrastructure-and-monorepo*
*Completed: 2026-02-24*

## Self-Check: PASSED

All files verified present on disk:
- packages/config/package.json: FOUND
- packages/config/tsconfig.json: FOUND
- packages/config/src/index.ts: FOUND
- packages/config/src/server.ts: FOUND
- packages/config/src/client.ts: FOUND
- .env.example: FOUND
- .gitignore: FOUND
- tsconfig.json: FOUND
- .planning/phases/01-infrastructure-and-monorepo/01-01-SUMMARY.md: FOUND

All commits verified in git history:
- f910907 (Task 1: create @homp/config JIT package): FOUND
- 868d90a (Task 2: .env.example and .gitignore): FOUND
