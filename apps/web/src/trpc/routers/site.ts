import { createTRPCRouter, baseProcedure } from "../init";
import { landingUpvotes } from "@formforge/db";
import { eq, sql } from "drizzle-orm";

const COUNTER_ID = 1;

async function ensureCounter(db: typeof import("@formforge/db").db) {
  await db
    .insert(landingUpvotes)
    .values({ id: COUNTER_ID, count: 0 })
    .onConflictDoNothing({ target: landingUpvotes.id });
}

export const siteRouter = createTRPCRouter({
  getUpvoteCount: baseProcedure.query(async ({ ctx }) => {
    await ensureCounter(ctx.db);

    const [row] = await ctx.db
      .select({ count: landingUpvotes.count })
      .from(landingUpvotes)
      .where(eq(landingUpvotes.id, COUNTER_ID))
      .limit(1);

    return { count: row?.count ?? 0 };
  }),

  incrementUpvote: baseProcedure.mutation(async ({ ctx }) => {
    await ensureCounter(ctx.db);

    const [row] = await ctx.db
      .update(landingUpvotes)
      .set({
        count: sql`${landingUpvotes.count} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(landingUpvotes.id, COUNTER_ID))
      .returning({ count: landingUpvotes.count });

    return { count: row?.count ?? 0 };
  }),
});
