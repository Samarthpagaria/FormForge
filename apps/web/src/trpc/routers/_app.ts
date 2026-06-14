import { createTRPCRouter } from "../init";
import { formsRouter } from "./forms";
import { responsesRouter } from "./responses";
import { analyticsRouter } from "./analytics";
import { templatesRouter } from "./templates";
import { formVersionsRouter } from "./formVerisons"
import {shareRouter} from "./share";
export const appRouter = createTRPCRouter({
  forms: formsRouter,
  responses: responsesRouter,
  analytics: analyticsRouter,
  templates: templatesRouter,
  formVersions: formVersionsRouter,
  share: shareRouter,
});

export type AppRouter = typeof appRouter;