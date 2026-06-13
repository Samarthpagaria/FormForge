import { pgTable, uuid, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
import { formVersions } from "./forms";

export const submissions = pgTable("submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  formVersionId: uuid("form_version_id").references(() => formVersions.id).notNull(),
  sessionId: varchar("session_id", { length: 255 }),
  submittedAt: timestamp("submitted_at").defaultNow(),
  meta: jsonb("meta"),
});

export const submissionAnswers = pgTable("submission_answers", {
  id: uuid("id").primaryKey().defaultRandom(),
  submissionId: uuid("submission_id").references(() => submissions.id).notNull(),
  fieldKey: varchar("field_key", { length: 255 }).notNull(),
  value: jsonb("value"),
});