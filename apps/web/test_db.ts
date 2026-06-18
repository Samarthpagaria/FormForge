import { db, landingUpvotes } from "@formforge/db";
import { eq, sql } from "drizzle-orm";

async function test() {
  const COUNTER_ID = 1;
  try {
    await db
      .insert(landingUpvotes)
      .values({ id: COUNTER_ID, count: 0 })
      .onConflictDoNothing({ target: landingUpvotes.id });
    
    console.log("ensureCounter success");

    const [row] = await db
      .update(landingUpvotes)
      .set({
        count: sql`${landingUpvotes.count} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(landingUpvotes.id, COUNTER_ID))
      .returning({ count: landingUpvotes.count });
    
    console.log("increment success", row);
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
