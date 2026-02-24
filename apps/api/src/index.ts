import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { serverEnv } from "@homp/config/server"; // throws if any server env var is missing
import { client } from "@homp/db";
import { Redis } from "ioredis";

const app = new Hono();

// Health check endpoint — used by Railway and local debugging
// Returns 200 { db: "ok", redis: "ok" } when healthy
// Returns 503 { db: "error", redis: "ok"|"error" } when unhealthy
app.get("/health", async (c) => {
  // Check PostgreSQL
  let dbStatus: "ok" | "error" = "ok";
  try {
    await client`SELECT 1`;
  } catch {
    dbStatus = "error";
  }

  // Check Redis
  // Phase 1: Direct ioredis connection for health check only
  // Phase 2 will replace with the BullMQ connection instance
  let redisStatus: "ok" | "error" = "ok";
  let redis: InstanceType<typeof Redis> | null = null;
  try {
    redis = new Redis(serverEnv.REDIS_URL, {
      family: 0, // Required for Railway private networking (IPv6/IPv4 dual-stack)
      lazyConnect: true,
      connectTimeout: 3000,
    });
    await redis.connect();
    await redis.ping();
  } catch {
    redisStatus = "error";
  } finally {
    if (redis) {
      redis.disconnect();
    }
  }

  const httpStatus = dbStatus === "ok" ? 200 : 503;
  return c.json({ db: dbStatus, redis: redisStatus }, httpStatus);
});

// Root route — basic confirmation the API is running
app.get("/", (c) => {
  return c.json({ message: "HOMP API", version: "2.0.0" });
});

async function main() {
  // Verify DB connection before accepting traffic
  // If this fails, the process exits 1 with a clear error — no silent failures
  try {
    await client`SELECT 1`;
    console.log("✓ Database connected");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`✗ Cannot connect to database: ${message}`);
    console.error(
      "Ensure docker compose is running: docker compose up -d postgres"
    );
    process.exit(1);
  }

  const port = serverEnv.PORT;

  serve(
    {
      fetch: app.fetch,
      port,
    },
    (info) => {
      console.log(`HOMP API running on http://localhost:${info.port}`);
    }
  );
}

main();
