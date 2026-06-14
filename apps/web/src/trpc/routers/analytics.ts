import { createTRPCRouter, protectedProcedure, baseProcedure } from "../init";
import { z } from "zod";
import { events, forms } from "@formforge/db";
import { eq, and, desc, count, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const eventTypes = z.enum([
  "form_view",
  "form_start",
  "form_submit",
  "form_dropoff",
  "field_focus",
  "field_blur",
]);

export const analyticsRouter = createTRPCRouter({
  /**
   * @name trackEvent
   * @description tracks a raw event (public - called from form page)
   * @public
   * @input formId, formVersionId, sessionId, event, metadata
   * @returns Event
   */
  trackEvent: baseProcedure
    .input(
      z.object({
        formId: z.string(),
        formVersionId: z.string().optional(),
        sessionId: z.string().optional(),
        event: eventTypes,
        metadata: z.object({
          fieldKey: z.string().optional(),
          timeSpent: z.number().optional(),
          device: z.enum(["desktop", "mobile", "tablet"]).optional(),
          browser: z.string().optional(),
          os: z.string().optional(),
          country: z.string().optional(),
        }).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // verify form exists
        const form = await ctx.db
          .select()
          .from(forms)
          .where(eq(forms.id, input.formId))
          .limit(1);

        if (!form[0]) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
        }

        const newEvent = await ctx.db
          .insert(events)
          .values({
            formId: input.formId,
            formVersionId: input.formVersionId,
            sessionId: input.sessionId,
            event: input.event,
            metadata: input.metadata,
          })
          .returning();

        return newEvent[0];
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to track event" });
      }
    }),

  /**
   * @name getSummary
   * @description gets summary metrics for a form
   * @protected
   * @input formId
   * @returns { views, starts, submissions, completionRate, avgTimeSpent }
   */
  getSummary: protectedProcedure
    .input(z.object({ formId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        // verify form belongs to user
        const form = await ctx.db
          .select()
          .from(forms)
          .where(
            and(
              eq(forms.id, input.formId),
              eq(forms.userId, ctx.auth.userId)
            )
          )
          .limit(1);

        if (!form[0]) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
        }

        // count views
        const views = await ctx.db
          .select({ count: count() })
          .from(events)
          .where(
            and(
              eq(events.formId, input.formId),
              eq(events.event, "form_view")
            )
          );

        // count starts
        const starts = await ctx.db
          .select({ count: count() })
          .from(events)
          .where(
            and(
              eq(events.formId, input.formId),
              eq(events.event, "form_start")
            )
          );

        // count submissions
        const submits = await ctx.db
          .select({ count: count() })
          .from(events)
          .where(
            and(
              eq(events.formId, input.formId),
              eq(events.event, "form_submit")
            )
          );

        // count dropoffs
        const dropoffs = await ctx.db
          .select({ count: count() })
          .from(events)
          .where(
            and(
              eq(events.formId, input.formId),
              eq(events.event, "form_dropoff")
            )
          );

        const viewCount = views[0]?.count ?? 0;
        const startCount = starts[0]?.count ?? 0;
        const submitCount = submits[0]?.count ?? 0;
        const dropoffCount = dropoffs[0]?.count ?? 0;

        const completionRate = startCount > 0
          ? Math.round((submitCount / startCount) * 100)
          : 0;

        // avg time spent from metadata
        const timeSpentResult = await ctx.db
          .select({
            avg: sql<number>`avg((metadata->>'timeSpent')::numeric)`,
          })
          .from(events)
          .where(
            and(
              eq(events.formId, input.formId),
              eq(events.event, "form_submit")
            )
          );

        return {
          views: viewCount,
          starts: startCount,
          submissions: submitCount,
          dropoffs: dropoffCount,
          completionRate,
          avgTimeSpent: Math.round(timeSpentResult[0]?.avg ?? 0),
        };
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch summary" });
      }
    }),

  /**
   * @name getDropoffAnalysis
   * @description gets drop-off analysis per field
   * @protected
   * @input formId
   * @returns { fieldKey, dropoffs }[]
   */
  getDropoffAnalysis: protectedProcedure
    .input(z.object({ formId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        // verify form belongs to user
        const form = await ctx.db
          .select()
          .from(forms)
          .where(
            and(
              eq(forms.id, input.formId),
              eq(forms.userId, ctx.auth.userId)
            )
          )
          .limit(1);

        if (!form[0]) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
        }

        const dropoffs = await ctx.db
          .select({
            fieldKey: sql<string>`metadata->>'fieldKey'`,
            count: count(),
          })
          .from(events)
          .where(
            and(
              eq(events.formId, input.formId),
              eq(events.event, "form_dropoff")
            )
          )
          .groupBy(sql`metadata->>'fieldKey'`);

        return dropoffs;
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch dropoff analysis" });
      }
    }),

  /**
   * @name getDeviceStats
   * @description gets device breakdown for a form
   * @protected
   * @input formId
   * @returns { device, count }[]
   */
  getDeviceStats: protectedProcedure
    .input(z.object({ formId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const form = await ctx.db
          .select()
          .from(forms)
          .where(
            and(
              eq(forms.id, input.formId),
              eq(forms.userId, ctx.auth.userId)
            )
          )
          .limit(1);

        if (!form[0]) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
        }

        const deviceStats = await ctx.db
          .select({
            device: sql<string>`metadata->>'device'`,
            count: count(),
          })
          .from(events)
          .where(
            and(
              eq(events.formId, input.formId),
              eq(events.event, "form_view")
            )
          )
          .groupBy(sql`metadata->>'device'`);

        return deviceStats;
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch device stats" });
      }
    }),

  /**
   * @name getRawEvents
   * @description gets raw events for a form
   * @protected
   * @input formId
   * @returns Event[]
   */
  getRawEvents: protectedProcedure
    .input(z.object({ formId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const form = await ctx.db
          .select()
          .from(forms)
          .where(
            and(
              eq(forms.id, input.formId),
              eq(forms.userId, ctx.auth.userId)
            )
          )
          .limit(1);

        if (!form[0]) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
        }

        return await ctx.db
          .select()
          .from(events)
          .where(eq(events.formId, input.formId))
          .orderBy(desc(events.timestamp));
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch events" });
      }
    }),
});