// Importing @homp/config validates all env vars at build time via Zod.
// If any required var is missing, next build fails with a clear error before deployment.
// This is the recommended T3 Env approach for Next.js App Router.
import "@homp/config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // transpilePackages: required for JIT internal packages that export TypeScript source.
  // Without this, Next.js cannot process the raw .ts files from node_modules/@homp/*.
  transpilePackages: ["@homp/config", "@homp/db"],
};

export default nextConfig;
