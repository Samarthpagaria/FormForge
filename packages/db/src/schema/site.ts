import { pgTable, integer, timestamp } from "drizzle-orm/pg-core";

export const landingUpvotes = pgTable("landing_upvotes", {
  id: integer("id").primaryKey().default(1),
  count: integer("count").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
