-- 0000_baseline.sql
-- Baseline migration for HOMP 2.0 — Phase 1
-- Enables uuid-ossp extension for uuid_generate_v4() in future tables
-- The IF NOT EXISTS guard makes this safe to run on any database state
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
