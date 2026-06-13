import { pgTable, uuid, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
import { forms } from "./forms";

export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  formId: uuid("form_id").references(() => forms.id).notNull(),
  formVersionId: uuid("form_version_id"),
  sessionId: varchar("session_id", { length: 255 }),
  event: varchar("event", { length: 100 }).notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  metadata: jsonb("metadata"),
});