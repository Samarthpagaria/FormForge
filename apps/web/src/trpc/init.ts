import { initTRPC, TRPCError } from "@trpc/server";
import { db } from "@formforge/db";
import { createServerSupabaseClient } from "../../lib/supabase/server";

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  const authObject = { userId: session?.user?.id ?? null };

  const forwardedFor = opts.headers.get("x-forwarded-for");
  const realIp = opts.headers.get("x-real-ip");
  const ip = forwardedFor ? (forwardedFor.split(",")[0]?.trim() ?? (realIp || "unknown")) : (realIp || "unknown");
  return { auth: authObject, db, ip, headers: opts.headers };
};

const t = initTRPC
  .context<Awaited<ReturnType<typeof createTRPCContext>>>()
  .create();

const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.auth?.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { auth: { ...ctx.auth, userId: ctx.auth.userId } } });
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);