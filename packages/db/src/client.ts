// why there is clinet.ts,index.ts and drizzle.config.ts2:38 PMClaude responded: client.client.ts — creates the database connection using your DATABASE_URL
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import dotenv from "dotenv";
dotenv.config({path: "../../.env"});

const client = postgres(process.env.DATABASE_URL!, { prepare: false });
export const db = drizzle(client, {schema});
