import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db, users } from "@formforge/db";
import { eq } from "drizzle-orm"; // FIX 1: Imported eq operator

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Missing CLERK_WEBHOOK_SECRET");
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const body = await req.text();

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    return new Response("Invalid webhook signature", { status: 400 });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  // Handle User Creation
  if (eventType === "user.created") {
    // FIX 2: Safely combine name fields and provide fallbacks
    const firstName = evt.data.first_name || "";
    const lastName = evt.data.last_name || "";
    const fullName = `${firstName} ${lastName}`.trim() || "Anonymous User";

    await db.insert(users).values({
      id: id!,
      email: evt.data.email_addresses[0]?.email_address || "",
      name: fullName,
    });
  }

  // OPTIMIZATION: Handle User Updates to keep DB in sync
  if (eventType === "user.updated") {
    const firstName = evt.data.first_name || "";
    const lastName = evt.data.last_name || "";
    const fullName = `${firstName} ${lastName}`.trim() || "Anonymous User";

    await db
      .update(users)
      .set({
        email: evt.data.email_addresses[0]?.email_address || "",
        name: fullName,
      })
      .where(eq(users.id, id!));
  }

  // Handle User Deletion
  if (eventType === "user.deleted") {
    await db.delete(users).where(eq(users.id, id!));
  }

  return new Response("OK", { status: 200 });
}