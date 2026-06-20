import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { db } from "@formforge/db";
import { sql } from "drizzle-orm";

export const dynamic = 'force-dynamic';

export async function GET() {
  const status = {
    auth: "pending",
    database: "pending",
    errors: [] as string[],
  };

  try {
    // 1. Test Supabase Auth Connection (REST API)
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      status.auth = "error";
      status.errors.push(`Auth Error: ${error.message}`);
    } else {
      status.auth = "ok";
    }
  } catch (err: any) {
    status.auth = "error";
    status.errors.push(`Auth Exception: ${err.message}`);
  }

  try {
    // 2. Test Postgres Database Connection (Direct/Pooler)
    await db.execute(sql`SELECT 1 as is_alive`);
    status.database = "ok";
  } catch (err: any) {
    status.database = "error";
    status.errors.push(`Database Exception: ${err.message}`);
  }

  return NextResponse.json(
    status,
    { status: status.errors.length > 0 ? 500 : 200 }
  );
}
