import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../../../../src/trpc/routers/_app";
import { createTRPCContext } from "../../../../src/trpc/init";

const handler = async (req: Request) => {
  console.log(`[TRPC API] Incoming request: ${req.method} ${req.url}`);
  try {
    const response = await fetchRequestHandler({
      endpoint: "/api/trpc",
      req,
      router: appRouter,
      createContext: () => {
        console.log(`[TRPC API] Creating context for ${req.url}`);
        return createTRPCContext({ headers: req.headers });
      },
      onError: ({ path, error }) => {
        console.error(`[TRPC API ERROR] on '${path}'`, error);
      }
    });
    console.log(`[TRPC API] Response status: ${response.status}`);
    return response;
  } catch (err) {
    console.error(`[TRPC API FATAL ERROR]`, err);
    throw err;
  }
};

export { handler as GET, handler as POST };