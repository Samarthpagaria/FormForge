import { createTRPCRouter, protectedProcedure, baseProcedure } from "../init";
import { z } from "zod";
import { events, forms, submissions } from "@formforge/db";
import { eq, and, desc, count, sql, inArray, gte, between } from "drizzle-orm";
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

  // ─── GLOBAL STATS (across all user's forms) ───────────────────────────────

  getGlobalStats: protectedProcedure
    .input(z.object({ formIds: z.array(z.string()).optional() }).optional())
    .query(async ({ ctx, input }) => {
      try {
        const userForms = await ctx.db
          .select()
          .from(forms)
          .where(eq(forms.userId, ctx.auth.userId));

        if (userForms.length === 0) {
          return {
            totalForms: 0,
            totalSubmissions: 0,
            totalViews: 0,
            completionRate: 0,
            avgCompletionTime: 0,
          };
        }

        let formIds = userForms.map((f) => f.id);
        if (input?.formIds && input.formIds.length > 0) {
          formIds = formIds.filter(id => input.formIds!.includes(id));
        }

        if (formIds.length === 0) {
          return { totalForms: 0, totalSubmissions: 0, totalViews: 0, completionRate: 0, avgCompletionTime: 0 };
        }

        const [subCount, viewCount, startCount, submitCount, timeResult] = await Promise.all([
          ctx.db.select({ count: count() }).from(submissions).where(inArray(submissions.formId, formIds)),
          ctx.db.select({ count: count() }).from(events).where(and(inArray(events.formId, formIds), eq(events.event, "form_view"))),
          ctx.db.select({ count: count() }).from(events).where(and(inArray(events.formId, formIds), eq(events.event, "form_start"))),
          ctx.db.select({ count: count() }).from(events).where(and(inArray(events.formId, formIds), eq(events.event, "form_submit"))),
          ctx.db.select({ avg: sql<number>`avg((metadata->>'completionTime')::numeric)` }).from(events).where(and(inArray(events.formId, formIds), eq(events.event, "form_submit"))),
        ]);

        const completionRate = (startCount[0]?.count ?? 0) > 0
          ? Math.round(((submitCount[0]?.count ?? 0) / (startCount[0]?.count ?? 1)) * 100)
          : 0;

        return {
          totalForms: formIds.length,
          totalSubmissions: subCount[0]?.count ?? 0,
          totalViews: viewCount[0]?.count ?? 0,
          completionRate,
          avgCompletionTime: Math.round(timeResult[0]?.avg ?? 0),
        };
      } catch (err) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch global stats" });
      }
    }),

  // ─── GLOBAL SUBMISSIONS OVER TIME (last 30 days) ──────────────────────────

  getGlobalSubmissionsOverTime: protectedProcedure
    .input(z.object({ days: z.number().default(30), formIds: z.array(z.string()).optional() }))
    .query(async ({ ctx, input }) => {
      try {
        const userForms = await ctx.db.select({ id: forms.id }).from(forms).where(eq(forms.userId, ctx.auth.userId));
        if (userForms.length === 0) return [];

        let formIds = userForms.map((f) => f.id);
        if (input.formIds && input.formIds.length > 0) {
          formIds = formIds.filter(id => input.formIds!.includes(id));
        }

        if (formIds.length === 0) return [];

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - input.days);

        const data = await ctx.db
          .select({
            date: sql<string>`DATE(submitted_at)`,
            count: count(),
          })
          .from(submissions)
          .where(and(inArray(submissions.formId, formIds), gte(submissions.submittedAt, startDate)))
          .groupBy(sql`DATE(submitted_at)`)
          .orderBy(sql`DATE(submitted_at)`);

        return data;
      } catch (err) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch submissions over time" });
      }
    }),

  // ─── GLOBAL TOP PERFORMING FORMS ──────────────────────────────────────────

  getTopForms: protectedProcedure
    .input(z.object({ limit: z.number().default(6) }))
    .query(async ({ ctx, input }) => {
      try {
        const userForms = await ctx.db.select().from(forms).where(eq(forms.userId, ctx.auth.userId));
        if (userForms.length === 0) return [];

        const formIds = userForms.map((f) => f.id);

        const topForms = await ctx.db
          .select({ formId: submissions.formId, count: count() })
          .from(submissions)
          .where(inArray(submissions.formId, formIds))
          .groupBy(submissions.formId)
          .orderBy(desc(count()))
          .limit(input.limit);

        return topForms.map((f) => ({
          formId: f.formId,
          formName: userForms.find((form) => form.id === f.formId)?.name ?? "Unknown",
          submissions: f.count,
        }));
      } catch (err) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch top forms" });
      }
    }),

  // ─── GLOBAL DEVICE BREAKDOWN ──────────────────────────────────────────────

  getGlobalDeviceBreakdown: protectedProcedure
    .input(z.object({ formIds: z.array(z.string()).optional() }).optional())
    .query(async ({ ctx, input }) => {
      try {
        const userForms = await ctx.db.select({ id: forms.id }).from(forms).where(eq(forms.userId, ctx.auth.userId));
        if (userForms.length === 0) return [];

        let formIds = userForms.map((f) => f.id);
        if (input?.formIds && input.formIds.length > 0) {
          formIds = formIds.filter(id => input.formIds!.includes(id));
        }

        if (formIds.length === 0) return [];

        const data = await ctx.db
          .select({
            device: sql<string>`metadata->>'device'`,
            count: count(),
          })
          .from(events)
          .where(and(inArray(events.formId, formIds), eq(events.event, "form_view")))
          .groupBy(sql`metadata->>'device'`);

        return data;
      } catch (err) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch device breakdown" });
      }
    }),

  // ─── GLOBAL WEEKLY ACTIVITY HEATMAP ───────────────────────────────────────

  getWeeklyActivityHeatmap: protectedProcedure
    .input(z.object({ formIds: z.array(z.string()).optional() }).optional())
    .query(async ({ ctx, input }) => {
      try {
        const userForms = await ctx.db.select({ id: forms.id }).from(forms).where(eq(forms.userId, ctx.auth.userId));
        if (userForms.length === 0) return [];

        let formIds = userForms.map((f) => f.id);
        if (input?.formIds && input.formIds.length > 0) {
          formIds = formIds.filter(id => input.formIds!.includes(id));
        }

        if (formIds.length === 0) return [];
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        const data = await ctx.db
          .select({
            dayOfWeek: sql<number>`EXTRACT(DOW FROM submitted_at)`,
            hour: sql<number>`EXTRACT(HOUR FROM submitted_at)`,
            count: count(),
          })
          .from(submissions)
          .where(and(inArray(submissions.formId, formIds), gte(submissions.submittedAt, ninetyDaysAgo)))
          .groupBy(sql`EXTRACT(DOW FROM submitted_at)`, sql`EXTRACT(HOUR FROM submitted_at)`);

        return data;
      } catch (err) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch heatmap data" });
      }
    }),

  // ─── GLOBAL COMPLETION TIME DISTRIBUTION ──────────────────────────────────

  getCompletionTimeDistribution: protectedProcedure
    .input(z.object({ formIds: z.array(z.string()).optional() }).optional())
    .query(async ({ ctx, input }) => {
      try {
        const userForms = await ctx.db.select({ id: forms.id }).from(forms).where(eq(forms.userId, ctx.auth.userId));
        if (userForms.length === 0) return [];

        let formIds = userForms.map((f) => f.id);
        if (input?.formIds && input.formIds.length > 0) {
          formIds = formIds.filter(id => input.formIds!.includes(id));
        }

        if (formIds.length === 0) return [];

        const data = await ctx.db
          .select({
            bucket: sql<string>`
              CASE 
                WHEN (metadata->>'completionTime')::numeric < 30 THEN '0-30s'
                WHEN (metadata->>'completionTime')::numeric < 60 THEN '30-60s'
                WHEN (metadata->>'completionTime')::numeric < 120 THEN '1-2m'
                WHEN (metadata->>'completionTime')::numeric < 300 THEN '2-5m'
                ELSE '5m+'
              END
            `,
            count: count(),
          })
          .from(events)
          .where(and(inArray(events.formId, formIds), eq(events.event, "form_submit")))
          .groupBy(sql`
            CASE 
              WHEN (metadata->>'completionTime')::numeric < 30 THEN '0-30s'
              WHEN (metadata->>'completionTime')::numeric < 60 THEN '30-60s'
              WHEN (metadata->>'completionTime')::numeric < 120 THEN '1-2m'
              WHEN (metadata->>'completionTime')::numeric < 300 THEN '2-5m'
              ELSE '5m+'
            END
          `);

        return data;
      } catch (err) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch completion time distribution" });
      }
    }),

  // ─── GLOBAL TRAFFIC SOURCES ───────────────────────────────────────────────

  getTrafficSources: protectedProcedure
    .input(z.object({ formIds: z.array(z.string()).optional() }).optional())
    .query(async ({ ctx, input }) => {
      try {
        const userForms = await ctx.db.select({ id: forms.id }).from(forms).where(eq(forms.userId, ctx.auth.userId));
        if (userForms.length === 0) return [];

        let formIds = userForms.map((f) => f.id);
        if (input?.formIds && input.formIds.length > 0) {
          formIds = formIds.filter(id => input.formIds!.includes(id));
        }

        if (formIds.length === 0) return [];

        const data = await ctx.db
          .select({
            source: sql<string>`metadata->>'source'`,
            count: count(),
          })
          .from(events)
          .where(and(inArray(events.formId, formIds), eq(events.event, "form_view")))
          .groupBy(sql`metadata->>'source'`);

        return data.map((d) => ({
          source: d.source ?? "direct",
          count: d.count,
        }));
      } catch (err) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch traffic sources" });
      }
    }),

  // ─── GLOBAL MAP DATA ──────────────────────────────────────────────────────

  getGlobalMapData: protectedProcedure
    .input(z.object({ formIds: z.array(z.string()).optional() }).optional())
    .query(async ({ ctx, input }) => {
      try {
        const userForms = await ctx.db.select({ id: forms.id }).from(forms).where(eq(forms.userId, ctx.auth.userId));
        if (userForms.length === 0) return [];

        let formIds = userForms.map((f) => f.id);
        if (input?.formIds && input.formIds.length > 0) {
          formIds = formIds.filter(id => input.formIds!.includes(id));
        }

        if (formIds.length === 0) return [];

        const data = await ctx.db
          .select({
            country: sql<string>`metadata->>'country'`,
            count: count(),
          })
          .from(events)
          .where(and(
            inArray(events.formId, formIds), 
            eq(events.event, "form_view"),
            sql`metadata->>'country' IS NOT NULL`
          ))
          .groupBy(sql`metadata->>'country'`);

        return data.map((d) => ({
          id: d.country, // usually alpha-3 or alpha-2 code
          value: d.count,
        }));
      } catch (err) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch map data" });
      }
    }),

  // ─── FORM-SPECIFIC SUBMISSIONS OVER TIME ──────────────────────────────────

  getSubmissionsOverTime: protectedProcedure
    .input(z.object({ formId: z.string(), days: z.number().default(30) }))
    .query(async ({ ctx, input }) => {
      try {
        const form = await ctx.db.select().from(forms).where(and(eq(forms.id, input.formId), eq(forms.userId, ctx.auth.userId))).limit(1);
        if (!form[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - input.days);

        const data = await ctx.db
          .select({
            date: sql<string>`DATE(submitted_at)`,
            count: count(),
          })
          .from(submissions)
          .where(and(eq(submissions.formId, input.formId), gte(submissions.submittedAt, startDate)))
          .groupBy(sql`DATE(submitted_at)`)
          .orderBy(sql`DATE(submitted_at)`);

        return data;
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch submissions over time" });
      }
    }),

  // ─── RECENT SUBMISSIONS GLOBAL ────────────────────────────────────────────

  getRecentSubmissions: protectedProcedure
    .input(z.object({ limit: z.number().default(8) }))
    .query(async ({ ctx, input }) => {
      try {
        const userForms = await ctx.db.select().from(forms).where(eq(forms.userId, ctx.auth.userId));
        if (userForms.length === 0) return [];

        const formIds = userForms.map((f) => f.id);

        const recentSubs = await ctx.db
          .select()
          .from(submissions)
          .where(inArray(submissions.formId, formIds))
          .orderBy(desc(submissions.submittedAt))
          .limit(input.limit);

        return recentSubs.map((sub) => ({
          ...sub,
          formName: userForms.find((f) => f.id === sub.formId)?.name ?? "Unknown",
        }));
      } catch (err) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch recent submissions" });
      }
    }),
});