import "dotenv/config";
import { defineConfig, env } from "@prisma/config";

// Migrations (`prisma migrate deploy`) acquire a Postgres advisory lock, which
// is unreliable through a connection pooler (e.g. Neon/PgBouncer) and shows up
// as `P1002 ... Timed out trying to acquire a postgres advisory lock` during
// deploy. When a direct (non-pooled) connection is provided via DIRECT_URL we
// use it for migrations; otherwise we fall back to DATABASE_URL so local/dev is
// unchanged. Runtime queries still use the pooled DATABASE_URL (src/lib/prisma.ts).
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DIRECT_URL ? env("DIRECT_URL") : env("DATABASE_URL"),
  },
});
