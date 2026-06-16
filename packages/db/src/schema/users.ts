import { pgTable, uuid, varchar, timestamp, text } from "drizzle-orm/pg-core";
export const users = pgTable("users", {
    id: text("id").primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
})