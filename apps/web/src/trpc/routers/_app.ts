import { createTRPCRouter } from "../init";
import { formsRouter } from "./forms";
import { responsesRouter } from "./responses";
import { analyticsRouter } from "./analytics";
import { templatesRouter } from "./templates";
import { formVersionRouter } from "./formVersions"
import {shareRouter} from "./share";
export const appRouter = createTRPCRouter({
  forms: formsRouter,
  responses: responsesRouter,
  analytics: analyticsRouter,
  templates: templatesRouter,
  formVersions: formVersionRouter,
  share: shareRouter,
});

export type AppRouter = typeof appRouter;