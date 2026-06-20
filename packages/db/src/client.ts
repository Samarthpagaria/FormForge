// why there is clinet.ts,index.ts and drizzle.config.ts2:38 PMClaude responded: client.client.ts — creates the database connection using your DATABASE_URL
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import dotenv from "dotenv";
dotenv.config({path: "../../.env"});

let dbUrl = process.env.DATABASE_URL || "";
if (dbUrl.startsWith("DATABASE_URL=")) {
  dbUrl = dbUrl.replace("DATABASE_URL=", "");
}
dbUrl = dbUrl.trim();

console.log(`[DB INITIALIZATION] Setting up Drizzle client. DB URL present: ${!!dbUrl}`);
const client = postgres(dbUrl, { prepare: false });
export const db = drizzle(client, {schema});
console.log(`[DB INITIALIZATION] Drizzle client created successfully.`);
