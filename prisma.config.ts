import { defineConfig } from "prisma/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool } from "@neondatabase/serverless";
import { config } from "dotenv";

config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaNeon(pool);

export default defineConfig({
  datasource: {
    url: databaseUrl,
  },
  adapter,
});

