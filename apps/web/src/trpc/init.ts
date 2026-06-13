import { TRPCError, initTRPC } from "@trpc/server";
import { db } from "@formforge/db"
import { auth } from "@clerk/nextjs/server";

export const createTRPCContext = async (opts: { headers: Headers }) => {
  // fetch the clerk session/auth data from the incoming request headers/cookies
  const authObject = await auth();
  return { auth : authObject,db}
};

const t = initTRPC
  .context<Awaited<ReturnType<typeof createTRPCContext>>>()
  .create();

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.auth?.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
return next({
    ctx: {
      // Infers that auth and userId are definitely present in protectedProcedures
      auth: {
        ...ctx.auth,
        userId: ctx.auth.userId,
      },
    },
  });
})
export const protectedProcedure = t.procedure.use(isAuthed)