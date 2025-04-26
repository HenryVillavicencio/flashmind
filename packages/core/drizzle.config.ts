import { defineConfig } from "drizzle-kit";
import { Config } from "./src/shared/config";

export default defineConfig({
    strict: true,
    verbose: true,
    out: "./migrations",
    dialect: "postgresql",
    dbCredentials: { url: Config.DATABASE_URL },
    schema: "./src/**/*.sql.ts",
});