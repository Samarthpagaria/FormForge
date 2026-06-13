import { initTRPC } from "@trpc/server";
import {db} from "@formforge/db"

export const createTRPCContext = async (opts: { headers: Headers }) => {
  return {db, userId: "user_123" }; // replace with real auth later
};

const t = initTRPC
  .context<Awaited<ReturnType<typeof createTRPCContext>>>()
  .create();

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;