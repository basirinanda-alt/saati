import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Used by `prisma migrate` / `prisma studio` (CLI operations only).
// The running application connects via the Neon driver adapter instead —
// see lib/db/client.ts.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Migrations run DDL and take advisory locks, which behave better over
    // Neon's direct (unpooled) connection than through the pgbouncer-style
    // pooler. The running app still connects via the pooled DATABASE_URL
    // through the Neon adapter — see lib/db/client.ts.
    url: env("DATABASE_URL_UNPOOLED"),
  },
});
