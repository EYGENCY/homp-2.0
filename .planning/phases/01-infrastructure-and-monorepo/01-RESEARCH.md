# Phase 1: Infrastructure & Monorepo - Research

**Researched:** 2026-02-19
**Domain:** Monorepo wiring, env validation, Drizzle migrations, Railway deployment
**Confidence:** HIGH (core stack), MEDIUM (Railway private networking edge cases)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Env var setup**
- Single `.env` at monorepo root — shared by all apps via Turbo env passthrough
- Apps fail fast on startup with a clear, specific error message if required vars are missing (not silent runtime failures)
- `.env.example` includes every required var with commented explanations of what each is for
- Both `apps/web` and `apps/api` import env from `@homp/config` (not raw `process.env`)

**Initial DB migration**
- First migration is baseline only: enable `uuid-ossp` extension and confirm Drizzle can connect and migrate. No application tables in Phase 1 — all real tables come in Phase 2.
- Add a `db:reset` script (accessible via `pnpm db:reset`) that drops and recreates the local database — useful for fresh dev setup
- Hono API verifies the DB connection at startup; logs a clear error and exits if it cannot reach Postgres
- API exposes a `GET /health` endpoint returning `{ db: 'ok', redis: 'ok' }` — used by Railway health checks and local debugging

**Railway deployment**
- Goal: Phase 1 ends with a real live Railway URL (web app + API + Postgres + Redis all running)
- Railway account exists, connected via GitHub — auto-deploy on push to `main`
- MinIO is local-only (docker compose); production uses Railway's S3-compatible storage. Configure the object storage connection string in Phase 1 but do not deploy MinIO to Railway.

**packages/config scope**
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

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INFRA-01 | Developer can start the full local stack (PostgreSQL, Redis, MinIO) with a single `docker compose up` | Docker Compose healthcheck pattern; depends_on with service_healthy |
| INFRA-02 | Developer can run the Next.js web app and Hono API server concurrently via `pnpm dev` from monorepo root | Turbo dev task pipeline; env passthrough via globalPassThroughEnv |
| INFRA-03 | Database migrations run via Drizzle Kit; schema is versioned and repeatable | drizzle-kit migrate; config format upgrade (driver field removal); uuid-ossp baseline migration |
| INFRA-04 | Application is deployed to Railway with web app, API server, PostgreSQL, and Redis as separate services | Railway monorepo shared deployment; railway.toml per service; Railpack builder; private networking |
| INFRA-05 | Environment variables are documented in `.env.example`; secrets never committed | Zod env schemas in packages/config; T3 Env pattern; .gitignore for .env files |
</phase_requirements>

---

## Summary

Phase 1 completes the infrastructure scaffolding for a Turborepo monorepo running Next.js 15 and Hono 4. The existing repo already has the shape right (Turborepo, apps/web, apps/api, packages/db, docker-compose.yml) but is missing several critical pieces: `packages/config` is completely empty, the `drizzle.config.ts` uses a deprecated format (the `driver` field was removed in drizzle-kit 0.21+), the docker-compose services have no health checks, and Railway is not yet configured. The Hono API has no workspace dependencies wired up and no health endpoint.

The central coordination mechanism for this phase is `packages/config` — a new internal Turborepo package that exports Zod-validated env schemas. Once that package exists, `apps/api` and `apps/web` can safely import from `@homp/config` instead of reading `process.env` directly. The N env-passthrough story in turbo.json must be set up to ensure vars flow from the root `.env` file to both apps without them accidentally getting cached with wrong values.

Railway deployment requires understanding that this is a *shared monorepo* (not isolated), meaning Railway must build from repo root with per-service build/start commands using `pnpm --filter`. The new Railpack builder (replacing deprecated Nixpacks) handles pnpm workspaces automatically. A critical production gotcha: Redis private networking on Railway requires `family: 0` in the ioredis/BullMQ connection config to handle IPv6 DNS resolution. Railway now has native S3-compatible bucket storage (no need for Cloudflare R2 — Railway Buckets is the right choice).

**Primary recommendation:** Build `packages/config` first (it unblocks everything else), fix the drizzle.config.ts format, add docker-compose health checks, wire Turbo env passthrough, then tackle Railway as the final step with two separate `railway.toml` files (one per app service).

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| drizzle-orm | ^0.45.1 (upgrade from 0.30.0) | ORM + query builder | Already chosen; needs upgrade — config format changed |
| drizzle-kit | ^0.31.9 (upgrade from 0.20.14) | Migration CLI | Already chosen; needs upgrade — `driver` field removed |
| zod | ^4.3.6 | Schema validation for env | Industry standard; used by T3 Env |
| @t3-oss/env-core | ^0.13.10 | Framework-agnostic env validation | Handles server/client split; used by Hono side |
| @t3-oss/env-nextjs | ^0.13.10 | Next.js-specific env validation | Integrates with Next.js build pipeline |
| turbo | ^2.8.10 (already installed) | Monorepo task orchestration | Already chosen |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| postgres | ^3.4.3 (already installed) | postgres.js driver | `packages/db` already uses it |
| @aws-sdk/client-s3 | latest | S3-compatible storage client | Phase 1: configure connection string for Railway Buckets |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Railway Buckets (native) | Cloudflare R2 | R2 requires separate account; Railway Buckets are project-native, auto-provision env vars, simpler — use Railway Buckets |
| @t3-oss/env-nextjs | Hand-rolled Zod + process.env | T3 Env handles Next.js nuances (NEXT_PUBLIC_ inlining, build-time vs runtime split) automatically |
| drizzle-kit migrate (CLI) | migrate() programmatic function | CLI is correct for deploy pipelines; programmatic is better for runtime migration on startup — use CLI for Railway preDeployCommand |

**Installation (new packages needed):**
```bash
# In packages/config (new package):
pnpm add zod @t3-oss/env-nextjs @t3-oss/env-core

# In packages/db (version upgrades):
pnpm add drizzle-orm@^0.45.1
pnpm add -D drizzle-kit@^0.31.9

# In apps/web (add dependency on config package):
# Add to package.json dependencies: "@homp/config": "workspace:*"

# In apps/api (add dependency on config package):
# Add to package.json dependencies: "@homp/config": "workspace:*"
```

---

## Architecture Patterns

### Recommended Project Structure

```
homp-2.0/
├── .env                          # Root env file (gitignored)
├── .env.example                  # Committed; all vars with comments
├── turbo.json                    # Needs env passthrough config
├── docker-compose.yml            # Needs healthchecks added
├── apps/
│   ├── api/
│   │   ├── railway.toml          # API service Railway config
│   │   └── src/
│   │       └── index.ts          # Startup: env validate, DB check, serve
│   └── web/
│       ├── railway.toml          # Web service Railway config
│       └── next.config.ts        # Import @homp/config to validate at build time
└── packages/
    ├── config/                   # NEW — currently empty
    │   ├── package.json          # name: @homp/config
    │   ├── tsconfig.json
    │   └── src/
    │       ├── index.ts          # Re-exports serverEnv and clientEnv
    │       ├── server.ts         # serverEnv schema (DATABASE_URL, REDIS_URL, etc.)
    │       └── client.ts         # clientEnv schema (NEXT_PUBLIC_API_URL)
    └── db/
        ├── drizzle.config.ts     # Fix: remove 'driver', add 'dialect'
        └── migrations/
            └── 0000_baseline.sql # CREATE EXTENSION IF NOT EXISTS "uuid-ossp"
```

---

### Pattern 1: packages/config as JIT Internal Package

**What:** `packages/config` is a Just-in-Time internal Turborepo package — no build step needed. It exports TypeScript source directly. Both `apps/web` (bundler: Next.js/Turbopack) and `apps/api` (tsx for dev, tsc for prod) can consume TypeScript source directly.

**When to use:** JIT packages work when all consumers use bundlers or TypeScript-aware tools. Both our consumers qualify. Avoids needing a compile step for the config package itself.

**package.json for packages/config:**
```json
{
  "name": "@homp/config",
  "version": "0.1.0",
  "exports": {
    ".": "./src/index.ts",
    "./server": "./src/server.ts",
    "./client": "./src/client.ts"
  },
  "dependencies": {
    "zod": "^4.3.6",
    "@t3-oss/env-core": "^0.13.10",
    "@t3-oss/env-nextjs": "^0.13.10"
  }
}
```

**Note:** JIT packages cannot use TypeScript `paths` aliases internally, but this package is simple enough that it doesn't need them.

---

### Pattern 2: Env Schema Split (serverEnv + clientEnv)

**What:** Two separate exported schemas prevent server secrets from leaking to browser bundles. This is the core security guarantee of `packages/config`.

**server.ts — for Hono API and Next.js server components:**
```typescript
// Source: T3 Env docs (env.t3.gg) + adapted for Hono
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const serverEnv = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    REDIS_URL: z.string().url(),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    // Object storage (Railway Buckets in prod, MinIO locally)
    S3_ENDPOINT: z.string().url(),
    S3_BUCKET: z.string().min(1),
    S3_ACCESS_KEY_ID: z.string().min(1),
    S3_SECRET_ACCESS_KEY: z.string().min(1),
    S3_REGION: z.string().default("us-east-1"),
  },
  runtimeEnv: process.env,
});
```

**client.ts — for Next.js client components only:**
```typescript
// Source: T3 Env docs (env.t3.gg/docs/nextjs)
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const clientEnv = createEnv({
  client: {
    NEXT_PUBLIC_API_URL: z.string().url(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
});
```

**index.ts:**
```typescript
export { serverEnv } from "./server";
export { clientEnv } from "./client";
```

---

### Pattern 3: Next.js Env Validation — Build Time is the Right Answer (Claude's Discretion)

**Decision recommendation:** Validate at **build time** by importing the env module in `next.config.ts`. This is the T3 Env recommended approach and catches missing vars during `next build` before deployment rather than at runtime.

**Why build-time is correct here:**
- Server env vars in Next.js App Router are available at both build time and runtime for dynamically-rendered routes. The build-time import just validates they're present — it doesn't freeze them.
- `NEXT_PUBLIC_` vars ARE inlined at build time and frozen (Next.js behavior). These must be present at build time regardless.
- Railway sets env vars before running builds, so build-time validation works correctly in the Railway deploy pipeline.
- Runtime-only validation via `instrumentation.ts` is unreliable (confirmed by Next.js team — "does not always execute across all Next.js runtimes").

**next.config.ts:**
```typescript
// Validates all env vars at build time — fails the build if any are missing
import "@homp/config"; // imports server.ts and client.ts, throws if invalid
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@homp/config"], // required for JIT packages
};

export default nextConfig;
```

**Important:** `transpilePackages: ["@homp/config"]` is required when using a JIT package with Next.js so Next.js knows to transpile the TypeScript source of that package.

---

### Pattern 4: Hono API Startup Sequence

**What:** The API validates env at import time (Zod throws immediately), then verifies DB connection before starting the HTTP server. If either fails, it logs clearly and exits with code 1.

```typescript
// apps/api/src/index.ts
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { serverEnv } from "@homp/config/server";  // throws if env invalid
import { client } from "@homp/db";

const app = new Hono();

app.get("/health", async (c) => {
  // Check DB
  let dbStatus = "ok";
  try {
    await client`SELECT 1`;
  } catch {
    dbStatus = "error";
  }

  // Check Redis (Phase 2 — BullMQ not wired yet; return ok for Phase 1)
  const redisStatus = "ok";

  const status = dbStatus === "ok" ? 200 : 503;
  return c.json({ db: dbStatus, redis: redisStatus }, status);
});

async function main() {
  // Verify DB connection before starting server
  try {
    await client`SELECT 1`;
    console.log("✓ Database connected");
  } catch (err) {
    console.error("✗ Cannot connect to database:", err.message);
    process.exit(1);
  }

  serve({
    fetch: app.fetch,
    port: Number(process.env.PORT) || 3001,
  }, (info) => {
    console.log(`API running on http://localhost:${info.port}`);
  });
}

main();
```

**Port convention (Claude's discretion):** Use port 3001 for API, 3000 for web (Next.js default). This matches the common convention and avoids conflicts.

---

### Pattern 5: drizzle.config.ts — Fix Required

**What:** The existing `drizzle.config.ts` uses the old format (`driver: "pg"` and `satisfies Config`). The `driver` field was removed from standard PostgreSQL configs in drizzle-kit 0.21+. The new format uses `defineConfig` and the `dialect` field.

**Current (broken with drizzle-kit ^0.31):**
```typescript
// WRONG — drizzle-kit 0.20.x format
export default {
    schema: "./src/schema.ts",
    out: "./migrations",
    driver: "pg",              // ← deprecated, must remove
    dbCredentials: {
        connectionString: process.env.DATABASE_URL!,
    },
} satisfies Config;
```

**Correct (drizzle-kit ^0.31):**
```typescript
// Source: orm.drizzle.team/docs/drizzle-config-file
import { defineConfig } from "drizzle-kit";

export default defineConfig({
    dialect: "postgresql",              // ← required (replaces 'driver')
    schema: "./src/schema.ts",
    out: "./migrations",
    dbCredentials: {
        url: process.env.DATABASE_URL!, // ← 'url' not 'connectionString'
    },
});
```

**Key changes:**
1. Use `defineConfig()` wrapper (not `satisfies Config`)
2. `dialect: "postgresql"` replaces `driver: "pg"`
3. `dbCredentials.url` replaces `dbCredentials.connectionString`

---

### Pattern 6: Baseline Migration for uuid-ossp

**What:** Phase 1 migration file enables the `uuid-ossp` extension. Drizzle has no native schema syntax for enabling extensions — you add it manually as a custom SQL migration.

**Process:**
1. Create `packages/db/migrations/0000_baseline.sql` manually (do NOT use `drizzle-kit generate` which would create an empty file since schema.ts is empty)
2. Run `drizzle-kit migrate` to apply it

```sql
-- migrations/0000_baseline.sql
-- Baseline migration: enable uuid-ossp extension
-- Required for uuid_generate_v4() in future application tables
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

**Note:** PostgreSQL 13+ has `gen_random_uuid()` built in (via pgcrypto, always available). However, honoring the user's decision to enable `uuid-ossp` as specified. The `IF NOT EXISTS` guard makes this safe to run on databases where it's already enabled.

**db:reset script** — add to packages/db/package.json:
```json
{
  "scripts": {
    "db:reset": "psql $DATABASE_URL -c 'DROP DATABASE homp;' && psql $DATABASE_URL_WITHOUT_DB -c 'CREATE DATABASE homp;' && drizzle-kit migrate"
  }
}
```

Simpler alternative using Docker (avoids psql dependency):
```json
{
  "scripts": {
    "db:reset": "docker compose down -v postgres && docker compose up -d postgres && sleep 2 && drizzle-kit migrate"
  }
}
```

Root-level convenience alias (pnpm -F) so `pnpm db:reset` works from monorepo root — add to root `package.json`:
```json
{
  "scripts": {
    "db:reset": "pnpm --filter @homp/db db:reset"
  }
}
```

---

### Pattern 7: Docker Compose Health Checks

**What:** Add `healthcheck` directives to postgres and redis so dependent services can use `depends_on: condition: service_healthy`. Currently missing from the docker-compose.yml.

```yaml
services:
  postgres:
    image: postgres:16-alpine
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d homp"]
      interval: 5s
      timeout: 5s
      retries: 5
      start_period: 10s

  redis:
    image: redis:7-alpine
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5
      start_period: 5s
```

**Note:** The `start_period` field gives containers time to initialize before health check failures count against the retry limit. Without health checks, `docker compose up` returns before postgres is ready to accept connections, causing the API to fail on first connection attempt.

---

### Pattern 8: Turborepo env Passthrough

**What:** Turbo in strict mode filters environment variables from tasks unless explicitly declared. For `dev` (which is persistent and uncached), all env vars need to flow through. The recommended approach for non-cached `dev` tasks is `globalPassThroughEnv`.

**Key insight from Turbo docs:** Turbo does NOT load `.env` files — your framework (Next.js) or tool (tsx with dotenv) does that. Turbo only needs to know which env vars can affect task outputs (for caching). For `dev` (cache: false), passthrough is the right mechanism.

**Updated turbo.json:**
```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalPassThroughEnv": [
    "DATABASE_URL",
    "REDIS_URL",
    "S3_ENDPOINT",
    "S3_BUCKET",
    "S3_ACCESS_KEY_ID",
    "S3_SECRET_ACCESS_KEY",
    "S3_REGION",
    "NEXT_PUBLIC_API_URL",
    "NODE_ENV",
    "PORT"
  ],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"],
      "env": [
        "DATABASE_URL",
        "NEXT_PUBLIC_API_URL",
        "NODE_ENV"
      ]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {}
  }
}
```

**Why `globalPassThroughEnv` for dev:** The `dev` task has `cache: false` so passthrough vs env doesn't affect caching. `globalPassThroughEnv` makes vars available to all tasks without affecting the hash — correct for secrets that shouldn't influence build cache keys.

**How .env at root flows to apps:** Next.js automatically loads `.env` from the project root (which is `apps/web/` — not the monorepo root). **This is a key gotcha.** Next.js looks for `.env` files in its *own* directory, not the workspace root. For the API, tsx loads env automatically if dotenv is configured.

**Correct approach for single root .env:** Both apps need to be told where to find the env file:
- `apps/web`: Use Next.js's native `.env` loading — but the `.env` must be at `apps/web/` OR use symlinks. Better: use a `dotenv` package and load from `../../.env` in the tsx startup, or use `--env-file` flag. **Cleanest solution: symlink `.env` from root into each app directory, or use turbo's `dotEnv` config.**
- Actually, Turborepo has a `dotEnv` key in turbo.json to declare which .env files affect task outputs. But loading is still handled by each tool.

**Practical recommendation:** Configure tsx to load the root `.env`:
```json
// apps/api/package.json
{
  "scripts": {
    "dev": "tsx --env-file=../../.env watch src/index.ts"
  }
}
```
And for Next.js — place a `.env` symlink in `apps/web` pointing to `../../.env`, OR more reliably: create a minimal `apps/web/.env` that just re-exports vars, and keep the real values in root `.env`. **Simplest and most reliable:** copy/symlink is fragile; instead, just put `.env` at the monorepo root AND also at each app root as symlinks, with `.gitignore` covering all of them. See pitfalls section.

---

### Pattern 9: Railway Deployment — Shared Monorepo

**What:** This is a *shared monorepo* (apps share `packages/db` and `packages/config`). Railway must build from the repo root to resolve workspace dependencies. Each app service gets its own `railway.toml`.

**apps/api/railway.toml:**
```toml
[build]
builder = "RAILPACK"
buildCommand = "pnpm --filter api build"

[deploy]
startCommand = "node apps/api/dist/index.js"
preDeployCommand = ["pnpm --filter @homp/db migrate"]
healthcheckPath = "/health"
healthcheckTimeout = 60
restartPolicyType = "ALWAYS"
```

**apps/web/railway.toml:**
```toml
[build]
builder = "RAILPACK"
buildCommand = "pnpm --filter web build"

[deploy]
startCommand = "pnpm --filter web start"
healthcheckPath = "/"
healthcheckTimeout = 60
restartPolicyType = "ALWAYS"
```

**Railway services to create:**
1. `homp-web` — GitHub source, root dir: repo root, uses `apps/web/railway.toml`
2. `homp-api` — GitHub source, root dir: repo root, uses `apps/api/railway.toml`
3. `homp-postgres` — Railway PostgreSQL plugin
4. `homp-redis` — Railway Redis plugin
5. (Optional) `homp-bucket` — Railway Storage Bucket for S3-compatible object storage

**Watch paths** — prevent API changes from rebuilding web and vice versa. Set in Railway Service Settings:
- Web service watch paths: `/apps/web/**`, `/packages/config/**`
- API service watch paths: `/apps/api/**`, `/packages/config/**`, `/packages/db/**`

**Railpack auto-detection:** Railway's Railpack builder (replacing deprecated Nixpacks) automatically detects pnpm workspaces via `pnpm-workspace.yaml` and installs all workspace dependencies correctly. No `nixpacks.toml` needed.

---

### Pattern 10: Railway Redis Private Networking — Critical Gotcha

**What:** BullMQ and ioredis (which BullMQ uses internally) default to IPv4 DNS lookup. Railway's private network (redis.railway.internal) is IPv6-only in environments created before October 16, 2025. New environments support dual-stack, but the `family: 0` fix is needed to be safe regardless.

**Fix for BullMQ connection (Phase 1 — just configure, not fully used until Phase 2):**
```typescript
// When connecting to Railway Redis via private networking
const redisConnection = {
  family: 0,  // Enable dual-stack IPv4/IPv6 DNS lookup
  host: new URL(serverEnv.REDIS_URL).hostname,
  port: Number(new URL(serverEnv.REDIS_URL).port) || 6379,
  password: new URL(serverEnv.REDIS_URL).password || undefined,
};
```

**Note for Phase 1 health check:** The `/health` endpoint should verify Redis connectivity. For Phase 1, since BullMQ is not yet instantiated, use ioredis directly for the health check or use `redis` package. Document this connection requirement now so Phase 2 wiring doesn't surprise.

---

### Anti-Patterns to Avoid

- **Reading `process.env` directly in app code:** All env access must go through `@homp/config`. Using `process.env.DATABASE_URL` directly in `apps/api/src/index.ts` bypasses validation and breaks the abstraction.
- **Putting secrets in Railway service variables manually without references:** Use Railway's variable reference syntax (`${{Postgres.DATABASE_URL}}`) so Railway auto-wires the connection strings between services. Don't copy-paste values.
- **Using `drizzle-kit push` in production:** `push` bypasses the migration history table. Always use `drizzle-kit migrate` for tracked, repeatable migrations.
- **Deploying without `preDeployCommand` for migrations:** Without this, code that expects the schema to exist will crash on first deploy. Run `drizzle-kit migrate` as a pre-deploy command.
- **Using `globalEnv` instead of `globalPassThroughEnv` for secrets:** `globalEnv` values affect the Turbo cache hash — leaking secret values into cache keys. Use `globalPassThroughEnv` for secrets.
- **Setting `rootDirectory` in Railway for a shared monorepo:** This is for isolated monorepos only. For shared monorepos (where packages/ is shared), keep root directory as repo root and use `buildCommand` with `--filter`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Env validation with server/client split | Custom Zod wrapper | `@t3-oss/env-nextjs` + `@t3-oss/env-core` | Handles NEXT_PUBLIC_ inlining nuances, runtimeEnv typing, build-time integration |
| Migration tracking across deploys | Custom migration table | `drizzle-kit migrate` with built-in `__drizzle_migrations` table | Handles migration order, idempotency, conflict detection |
| Docker service startup ordering | `sleep 5` hacks | `healthcheck` + `depends_on: condition: service_healthy` | `sleep` is brittle; health checks are reliable and self-documenting |
| Railway env var wiring | Copy-paste connection strings | Railway variable references (`${{Postgres.DATABASE_URL}}`) | References update automatically when Railway rotates credentials |

**Key insight:** The env-validation problem looks simple (just use Zod) but `@t3-oss/env-nextjs` handles subtle Next.js-specific requirements: it knows about `NEXT_PUBLIC_` prefixes, integrates with Next.js build pipeline, and prevents the common mistake of accessing server vars from client components.

---

## Common Pitfalls

### Pitfall 1: Root `.env` Not Loaded by Next.js

**What goes wrong:** Next.js looks for `.env` in its own working directory (`apps/web/`), not the monorepo root. Running `pnpm dev` from the root means Next.js won't find `/.env`.

**Why it happens:** Next.js's `.env` loading is relative to the Next.js app directory, not the pnpm workspace root.

**How to avoid:** Two options:
1. (Recommended) Create `apps/web/.env` as a symlink to `../../.env`: `ln -s ../../.env apps/web/.env`. Add both `/.env` and `/apps/web/.env` to `.gitignore`.
2. Use `@next/env` package in `next.config.ts` with `loadEnvConfig(path.resolve(__dirname, '../..'))` to explicitly load from the monorepo root.

Option 1 is simpler. Option 2 is more explicit.

**For apps/api:** tsx supports `--env-file` flag: `tsx --env-file=../../.env watch src/index.ts`. This is clean and explicit.

**Warning signs:** `undefined` env vars in Next.js dev server despite being in root `.env`; T3 Env throwing "Missing required environment variables" errors.

---

### Pitfall 2: drizzle.config.ts Uses Deprecated Format

**What goes wrong:** The existing `drizzle.config.ts` uses `driver: "pg"` and `dbCredentials.connectionString` which were removed in drizzle-kit 0.21+. Running `drizzle-kit migrate` with the current config against the upgraded drizzle-kit will error or behave unexpectedly.

**Why it happens:** The repo was set up with drizzle-kit 0.20.14. The config format changed significantly in 0.21.

**How to avoid:** Update config before upgrading drizzle-kit. Use `defineConfig`, `dialect: "postgresql"`, `dbCredentials.url`. See Pattern 5 above.

**Warning signs:** `Error: Invalid configuration` or `Unknown property 'driver'` from drizzle-kit commands.

---

### Pitfall 3: Railway Build Fails Because pnpm Workspace Not Resolved

**What goes wrong:** Railway builds `apps/api` but can't resolve `@homp/config` or `@homp/db` because it treats the app directory as isolated.

**Why it happens:** Mistakenly setting "Root Directory" to `apps/api` in Railway service settings. This makes Railway only pull that subdirectory, losing access to `packages/`.

**How to avoid:** Leave "Root Directory" empty (use the full repo). Set the `buildCommand` in `railway.toml` to `pnpm --filter api build` (or the appropriate package name). Railway + Railpack will install the full workspace and resolve all internal packages.

**Warning signs:** `Cannot find module '@homp/config'` in Railway build logs; build succeeds locally but fails on Railway.

---

### Pitfall 4: Redis Private Networking Fails on Railway

**What goes wrong:** API connects to Redis via `redis.railway.internal` and gets `ENOTFOUND redis.railway.internal` or connection hangs.

**Why it happens:** ioredis (used by BullMQ) defaults to IPv4 DNS lookup. Railway private network DNS may return only AAAA (IPv6) records.

**How to avoid:** Always configure `family: 0` on ioredis/BullMQ connections when using Railway internal hostnames. Configure this in Phase 1 even though BullMQ isn't fully used until Phase 2.

**Warning signs:** `ENOTFOUND redis.railway.internal` in Railway logs; connection timeouts on Redis operations.

---

### Pitfall 5: JIT Package Not Transpiled by Next.js

**What goes wrong:** Next.js throws `SyntaxError: Cannot use import statement in a module` or similar when loading `@homp/config` because JIT packages export raw TypeScript.

**Why it happens:** JIT packages point to `.ts` files in their `exports`. Next.js does not automatically transpile packages from `node_modules`.

**How to avoid:** Add `transpilePackages: ["@homp/config"]` to `next.config.ts`. This tells Next.js to process the package through its TypeScript compilation pipeline.

**Warning signs:** Works in `apps/api` (tsx handles TypeScript natively) but fails in `apps/web` (Next.js); "Unexpected token" errors in Next.js builds.

---

### Pitfall 6: Turbo Caches Builds With Wrong Env Values

**What goes wrong:** `pnpm build` succeeds once with correct DATABASE_URL but Turbo returns a cached build for subsequent runs even after the var changes.

**Why it happens:** Env vars in `env` key affect the cache hash — but if vars were not listed in `env`, Turbo ignores their changes and returns cached output.

**How to avoid:** List all vars that can affect build output in the `build` task's `env` array. Use `globalPassThroughEnv` for dev/runtime-only vars.

**Warning signs:** Old API URLs or connection strings appearing in production builds; Turbo cache hit messages when you expected a rebuild.

---

## Code Examples

Verified patterns from official sources:

### Complete packages/config/src/server.ts
```typescript
// Source: env.t3.gg/docs — createEnv for non-Next.js (Hono side)
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const serverEnv = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    REDIS_URL: z.string().url(),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().default(3001),
    // Railway Storage Bucket (production) or MinIO (local)
    S3_ENDPOINT: z.string().url(),
    S3_BUCKET: z.string().min(1),
    S3_ACCESS_KEY_ID: z.string().min(1),
    S3_SECRET_ACCESS_KEY: z.string().min(1),
    S3_REGION: z.string().default("us-east-1"),
  },
  runtimeEnv: process.env,
  emitErrors: true,
});
```

### Complete packages/config/src/client.ts
```typescript
// Source: env.t3.gg/docs/nextjs — createEnv for Next.js client vars
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const clientEnv = createEnv({
  client: {
    NEXT_PUBLIC_API_URL: z.string().url(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
});
```

### Fixed packages/db/drizzle.config.ts
```typescript
// Source: orm.drizzle.team/docs/drizzle-config-file
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema.ts",
  out: "./migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### Initial migration file
```sql
-- packages/db/migrations/0000_baseline.sql
-- Baseline migration: enable uuid-ossp extension
-- Phase 1 only — no application tables yet
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Docker Compose with health checks
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: homp
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d homp"]
      interval: 5s
      timeout: 5s
      retries: 5
      start_period: 10s

  redis:
    image: redis:7-alpine
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5
      start_period: 5s

  minio:
    image: minio/minio
    restart: always
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data
    # MinIO health check (local-only; not deployed to Railway)
    healthcheck:
      test: ["CMD", "mc", "ready", "local"]
      interval: 5s
      timeout: 5s
      retries: 5
      start_period: 15s

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

### .env.example template
```bash
# Database
# Local: postgresql://postgres:password@localhost:5432/homp
# Railway: auto-set via variable reference ${{Postgres.DATABASE_URL}}
DATABASE_URL=postgresql://postgres:password@localhost:5432/homp

# Redis
# Local: redis://localhost:6379
# Railway: auto-set via variable reference ${{Redis.REDIS_URL}}
REDIS_URL=redis://localhost:6379

# API URL (used by Next.js web app to call the API)
# Local: http://localhost:3001
# Railway: https://your-api-name.up.railway.app
NEXT_PUBLIC_API_URL=http://localhost:3001

# Object Storage (S3-compatible)
# Local: MinIO (docker compose)
# Production: Railway Storage Bucket
S3_ENDPOINT=http://localhost:9000
S3_BUCKET=homp-dev
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin
S3_REGION=us-east-1

# Runtime
NODE_ENV=development
PORT=3001
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `driver: "pg"` in drizzle.config.ts | `dialect: "postgresql"` + no driver | drizzle-kit 0.21 (2024) | Existing config MUST be updated before upgrading |
| `dbCredentials.connectionString` | `dbCredentials.url` | drizzle-kit 0.21 | Same — key rename required |
| `satisfies Config` pattern | `defineConfig()` wrapper | drizzle-kit 0.21 | Provides better type inference |
| Nixpacks builder on Railway | Railpack builder (new default) | 2025 | Nixpacks deprecated; Railpack auto-detects pnpm workspaces |
| `journal.json` in migrations | Per-folder migration structure | drizzle-kit v1 beta | Not yet released as stable; stay on 0.31.x for now |
| MinIO for production object storage | Railway native Buckets | 2024 (Railway Buckets GA) | No need for Cloudflare R2 or self-hosted MinIO in production |

**Deprecated/outdated:**
- `drizzle-kit drop` command: removed in drizzle-kit v1 beta (not a concern for 0.31.x)
- `driver: "pg"` in drizzle.config.ts: deprecated since 0.21, must update
- Nixpacks: deprecated on Railway, new services use Railpack automatically

---

## Open Questions

1. **packages/db tsconfig and exports field**
   - What we know: `packages/db` exports TypeScript source directly (`"main": "./src/index.ts"`); apps/api uses tsx which handles .ts fine
   - What's unclear: Does Next.js (apps/web) need `packages/db` in `transpilePackages` if it imports from `@homp/db`? Phase 1 doesn't import db from web, but Phase 2 will need this.
   - Recommendation: Add `@homp/db` to `transpilePackages` in `next.config.ts` proactively. Low cost, avoids surprise in Phase 2.

2. **apps/api tsconfig for workspace package resolution**
   - What we know: apps/api uses tsx for dev (handles .ts natively) and tsc for build
   - What's unclear: Whether apps/api's `tsconfig.json` needs `paths` entries for `@homp/config` and `@homp/db` for tsc to resolve them correctly
   - Recommendation: Add `compilerOptions.paths` pointing to the packages. tsx resolves via Node module resolution (package.json exports), but tsc needs path hints for type-checking. Create a root `tsconfig.base.json` with shared paths.

3. **Railway preDeployCommand for migrations**
   - What we know: Railway supports `preDeployCommand` in railway.toml as a string or array
   - What's unclear: The preDeployCommand for drizzle-kit migrate needs DATABASE_URL — Railway should provide this via variable reference, but env vars may not be available during the build phase vs deploy phase. Confirm that `preDeployCommand` runs in the deploy phase (after env vars are injected), not build phase.
   - Recommendation: Use `preDeployCommand` on the API service only. Test with a simple echo command first to confirm env vars are available.

4. **MinIO health check in docker-compose**
   - What we know: MinIO has a health endpoint at `/minio/health/live`; the `mc ready local` command requires mc to be installed
   - What's unclear: Whether the MinIO Docker image ships with `mc` (MinIO Client)
   - Recommendation: Use `curl` for MinIO healthcheck instead: `curl -f http://localhost:9000/minio/health/live || exit 1`. More reliable since curl is always available.

---

## Sources

### Primary (HIGH confidence)
- `orm.drizzle.team/docs/drizzle-config-file` — Current drizzle.config.ts format; defineConfig, dialect field, url vs connectionString
- `orm.drizzle.team/docs/drizzle-kit-migrate` — Migration CLI workflow; migration table config; drizzle-kit migrate vs migrate()
- `orm.drizzle.team/docs/extensions/pg` — Confirmed: no native Drizzle syntax for extensions; must add manually to migration SQL
- `env.t3.gg/docs/nextjs` — T3 Env createEnv pattern; server/client split; Next.js build-time integration; transpilePackages requirement
- `nextjs.org/docs/app/guides/environment-variables` — Next.js env loading (doc version 16.1.6 / 2026-02-16); NEXT_PUBLIC_ inlining; instrumentation.ts reliability warning
- `turborepo.dev/docs/crafting-your-repository/using-environment-variables` — globalPassThroughEnv vs env vs globalEnv; Turbo does not load .env files
- `turborepo.dev/docs/core-concepts/internal-packages` — JIT package pattern; compiled package pattern; when to use each
- `docs.railway.com/reference/config-as-code` — railway.toml full schema; preDeployCommand; healthcheckPath; Railpack builder
- `docs.railway.com/guides/monorepo` — Shared vs isolated monorepo distinction; watch paths; pnpm workspace-filtered build commands
- `docs.railway.com/storage-buckets` — Railway native S3 Buckets; env vars provided; endpoint format
- `docs.railway.com/databases/troubleshooting/enotfound-redis-railway-internal` — family: 0 fix for ioredis; IPv6-only private network issue
- `railpack.com/languages/node/` — Railpack auto-detects pnpm workspaces via pnpm-workspace.yaml; installs all workspace dependencies
- `hono.dev/docs/getting-started/nodejs` — serve() function signature; port configuration; Node.js 18.14.1+ requirement

### Secondary (MEDIUM confidence)
- npm registry: drizzle-orm@0.45.1, drizzle-kit@0.31.9, zod@4.3.6, @t3-oss/env-nextjs@0.13.10 — current latest versions (verified via `npm view`)
- WebSearch: Railway Railpack replaces Nixpacks as default builder in 2025 (multiple Railway docs references)
- WebSearch: drizzle-kit 0.21 driver field removal (confirmed by official upgrade guide pattern)

### Tertiary (LOW confidence)
- MinIO `mc ready local` healthcheck command availability in base image — not verified against MinIO Docker image manifest. Use curl alternative instead.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — versions verified via npm registry; all core libraries checked against official docs
- Architecture: HIGH — patterns verified against official documentation (Turbo, Next.js, Railway, Drizzle)
- Pitfalls: HIGH — most pitfalls confirmed by official docs or official troubleshooting pages; Railway IPv6 issue confirmed by official docs page
- Railway deployment: MEDIUM — Railpack auto-detection for pnpm workspaces is documented but not verified with actual deploy; preDeployCommand env var availability is an open question

**Research date:** 2026-02-19
**Valid until:** 2026-03-21 (30 days — Turbo, Drizzle, Railway evolve regularly; re-verify Railway Railpack behavior if significant time passes)
