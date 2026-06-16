import {pgTable,uuid,varchar,timestamp,jsonb,pgEnum,text} from "drizzle-orm/pg-core";
import { users } from "./users";
export const formStatusEnum = pgEnum("form_status", ["draft", "published"]);
export const forms = pgTable("forms", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").references(() => users.id).notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    description: varchar("description", { length: 1000 }),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  status: formStatusEnum("status").default("draft"),
  currentVersionId: uuid("current_version_id"),
  settings: jsonb("settings"),
  draftSchema: jsonb("draft_schema").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
    
})

export const formVersions = pgTable("form_versions", {
  id: uuid("id").primaryKey().defaultRandom(),
  formId: uuid("form_id").references(() => forms.id).notNull(),
  version: varchar("version", { length: 50 }).notNull(),
  schema: jsonb("schema").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});