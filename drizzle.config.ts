
import type { Config } from "drizzle-kit";

export default {
  schema: "./shared/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgresql://localhost:5432/seo_hub",
  },
} satisfies Config;
