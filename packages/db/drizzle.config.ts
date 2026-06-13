// drizzle.config.ts — tells Drizzle where your schema is and where to put migrations
import type {Config} from "drizzle-kit";

export default {
    schema: "./src/schema/index.ts",
    out: "./migrations",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
} satisfies Config;