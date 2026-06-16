import { pgTable, uuid, varchar, timestamp, jsonb, boolean, text } from "drizzle-orm/pg-core";
import { users } from "./users";

export const templateCategories = pgTable("template_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").references(() => users.id), // null = global category
  name: varchar("name", { length: 100 }).notNull(),
  isGlobal: boolean("is_global").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const templates = pgTable("templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description", { length: 1000 }),
  categoryId: uuid("category_id").references(() => templateCategories.id), // references category
  icon: varchar("icon", { length: 100 }),
  schema: jsonb("schema").notNull(),
  isGlobal: boolean("is_global").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});
