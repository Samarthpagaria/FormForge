import { pgTable, uuid, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";

export const templates = pgTable("templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description", { length: 1000 }),
  category: varchar("category", { length: 100 }),
  icon: varchar("icon", { length: 100 }),
  schema: jsonb("schema").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});