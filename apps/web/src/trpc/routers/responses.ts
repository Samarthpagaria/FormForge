import { createTRPCRouter, protectedProcedure, baseProcedure } from "../init";
import { z } from "zod";
import { submissions, submissionAnswers, forms, formVersions, users } from "@formforge/db";
import { eq, and, desc, sql, count } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import { sendSubmissionEmail } from "../../services/email";
import { enrichSubmissionMeta } from "../../services/geo-enrichment";
import { encryptIp } from "../../lib/encryption";

export const responsesRouter = createTRPCRouter({
  /**
   * @name submit
   * @description submits a form (public route - no auth required)
   * @public
   * @input formId, formVersionId, sessionId, answers, meta
   * @returns Submission
   */
  submit: baseProcedure
    
    .input(
      z.object({
        formId: z.string(),
        formVersionId: z.string(),
        sessionId: z.string().optional(),
        answers: z.array(
          z.object({
            fieldKey: z.string(),
            value: z.any(),
          })
        ),
        meta: z.object({
          ip: z.string().optional(),
          userAgent: z.string().optional(),
          country: z.string().optional(),
          lat: z.number().optional(),
          lng: z.number().optional(),
          completionTime: z.number().optional(),
          device: z.enum(["desktop", "mobile", "tablet"]).optional(),
          browser: z.string().optional(),
          os: z.string().optional(),
        }).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // verify form exists and is published
        const form = await ctx.db
          .select()
          .from(forms)
          .where(
            and(
              eq(forms.id, input.formId),
              eq(forms.status, "published")
            )
          )
          .limit(1);

        if (!form[0]) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Form not found or not published" });
        }

        // ── Schedule checks (Feature 2) ──
        const settings = (form[0].settings as Record<string, any>) ?? {};

        if (settings.isActive === false) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "This form is currently deactivated",
          });
        }

        if (settings.activateAt && new Date() < new Date(settings.activateAt)) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: `This form opens on ${new Date(settings.activateAt).toLocaleString()}`,
          });
        }

        if (settings.deactivateAt && new Date() > new Date(settings.deactivateAt)) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "This form has closed",
          });
        }

        // ── Duplicate submission check (Feature 1) ──
        if (settings.allowMultipleSubmissions === false) {
          const ip = input.meta?.ip ?? "unknown";

          // Check by IP
          if (ip !== "unknown") {
            const crypto = require("crypto");
            const salt = process.env.NEXTAUTH_SECRET || "fallback_salt_formforge_2026";
            const hashedIp = crypto.createHash("sha256").update(ip + salt).digest("hex");

            const existingByIp = await ctx.db
              .select()
              .from(submissions)
              .where(
                and(
                  eq(submissions.formId, input.formId),
                  sql`(meta->>'ipHash' = ${hashedIp} OR meta->>'ip' = ${hashedIp} OR meta->>'ip' = ${ip})`
                )
              )
              .limit(1);

            if (existingByIp[0]) {
              throw new TRPCError({
                code: "CONFLICT",
                message: "You have already submitted this form",
              });
            }
          }

          // Check by sessionId
          if (input.sessionId) {
            const existingBySession = await ctx.db
              .select()
              .from(submissions)
              .where(
                and(
                  eq(submissions.formId, input.formId),
                  eq(submissions.sessionId, input.sessionId)
                )
              )
              .limit(1);

            if (existingBySession[0]) {
              throw new TRPCError({
                code: "CONFLICT",
                message: "You have already submitted this form",
              });
            }
          }
        }

        // verify form version exists
        const formVersion = await ctx.db
          .select()
          .from(formVersions)
          .where(
            and(
              eq(formVersions.id, input.formVersionId),
              eq(formVersions.formId, input.formId)
            )
          )
          .limit(1);

        if (!formVersion[0]) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Form version not found" });
        }

        // create submission
        const enrichedMeta = await enrichSubmissionMeta(input.meta);
        
        if (enrichedMeta?.ip && enrichedMeta.ip !== "unknown") {
           const crypto = require("crypto");
           const salt = process.env.NEXTAUTH_SECRET || "fallback_salt_formforge_2026";
           (enrichedMeta as any).ipHash = crypto.createHash("sha256").update(enrichedMeta.ip + salt).digest("hex");
           
           // Store the encrypted real IP in case of company recovery use-case
           (enrichedMeta as any).ipEncrypted = encryptIp(enrichedMeta.ip);

           // Mask the IP for UI display
           const parts = enrichedMeta.ip.split(".");
           if (parts.length === 4) {
               enrichedMeta.ip = `${parts[0]}.${parts[1]}.***.***`;
           } else {
               const v6parts = enrichedMeta.ip.split(":");
               if (v6parts.length > 4) {
                   enrichedMeta.ip = `${v6parts[0]}:${v6parts[1]}:****:****`;
               } else {
                   enrichedMeta.ip = "Secured IP";
               }
           }
        }

        const newSubmission = await ctx.db
          .insert(submissions)
          .values({
            formId: input.formId,
            formVersionId: input.formVersionId,
            sessionId: input.sessionId,
            meta: enrichedMeta,
          })
          .returning();

        // insert answers
        if (input.answers.length > 0 && newSubmission[0]) {
          await ctx.db.insert(submissionAnswers).values(
            input.answers.map((answer) => ({
              submissionId: newSubmission[0]!.id,
              fieldKey: answer.fieldKey,
              value: answer.value,
            }))
          );
        }

        // ── Email notification (Feature 3 — hardened) ──
        try {
          const formOwner = await ctx.db
            .select()
            .from(users)
            .where(eq(users.id, form[0].userId))
            .limit(1);

          const totalSubmissionsQuery = await ctx.db
            .select({ count: count() })
            .from(submissions)
            .where(eq(submissions.formId, form[0].id));

          let ownerEmail = formOwner[0]?.email;
          let ownerName = formOwner[0]?.name ?? null;

          if (ownerEmail && newSubmission[0]) {
            await sendSubmissionEmail({
              formOwnerEmail: ownerEmail,
              formOwnerName: ownerName,
              formId: form[0].id,
              formName: form[0].name,
              submissionId: newSubmission[0]!.id,
              answers: input.answers.map(ans => {
                const fieldDef = (formVersion[0]?.schema as any)?.fields?.find((f: any) => f.id === ans.fieldKey);
                return {
                  ...ans,
                  fieldKey: fieldDef?.label || ans.fieldKey,
                };
              }),
              submittedAt: new Date(),
              totalResponses: totalSubmissionsQuery[0]?.count || 1,
            });
          }
        } catch (emailErr) {
          console.error("Email notification failed:", emailErr);
          // Don't throw — submission already saved
        }

        return newSubmission[0];
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to submit form" });
      }
    }),

  /**
   * @name checkDuplicate
   * @description Checks if a specific IP or session has already submitted the form
   */
  checkDuplicate: baseProcedure
    .input(z.object({ formId: z.string(), ip: z.string(), sessionId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      if (input.ip !== "unknown") {
        const crypto = require("crypto");
        const salt = process.env.NEXTAUTH_SECRET || "fallback_salt_formforge_2026";
        const hashedIp = crypto.createHash("sha256").update(input.ip + salt).digest("hex");

        const existingByIp = await ctx.db
          .select()
          .from(submissions)
          .where(
            and(
              eq(submissions.formId, input.formId),
              sql`(meta->>'ipHash' = ${hashedIp} OR meta->>'ip' = ${hashedIp} OR meta->>'ip' = ${input.ip})`
            )
          )
          .limit(1);

        if (existingByIp[0]) return { hasSubmitted: true };
      }

      if (input.sessionId) {
        const existingBySession = await ctx.db
          .select()
          .from(submissions)
          .where(
            and(
              eq(submissions.formId, input.formId),
              eq(submissions.sessionId, input.sessionId)
            )
          )
          .limit(1);

        if (existingBySession[0]) return { hasSubmitted: true };
      }

      return { hasSubmitted: false };
    }),

  /**
   * @name getAll
   * @description gets all submissions for a form
   * @protected
   * @input formId
   * @returns Submission[]
   */
  getAll: protectedProcedure
    
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

        return await ctx.db
          .select()
          .from(submissions)
          .where(eq(submissions.formId, input.formId))
          .orderBy(desc(submissions.submittedAt));
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch submissions" });
      }
    }),

  /**
   * @name getById
   * @description gets a single submission with all answers
   * @protected
   * @input id
   * @returns Submission + Answers
   */
  getById: protectedProcedure
    
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const submission = await ctx.db
          .select()
          .from(submissions)
          .where(eq(submissions.id, input.id))
          .limit(1);

        if (!submission[0]) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Submission not found" });
        }

        // verify form belongs to user
        const form = await ctx.db
          .select()
          .from(forms)
          .where(
            and(
              eq(forms.id, submission[0].formId),
              eq(forms.userId, ctx.auth.userId)
            )
          )
          .limit(1);

        if (!form[0]) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to view this submission" });
        }

        // get answers
        const answers = await ctx.db
          .select()
          .from(submissionAnswers)
          .where(eq(submissionAnswers.submissionId, input.id));

        // Get form version to resolve field labels
        let schemaFields: any[] = [];
        if (submission[0].formVersionId) {
          const version = await ctx.db
            .select({ schema: formVersions.schema })
            .from(formVersions)
            .where(eq(formVersions.id, submission[0].formVersionId))
            .limit(1);
          if (version[0] && version[0].schema && Array.isArray((version[0].schema as any).fields)) {
            schemaFields = (version[0].schema as any).fields;
          }
        } else if (form[0].draftSchema && Array.isArray((form[0].draftSchema as any).fields)) {
          schemaFields = (form[0].draftSchema as any).fields;
        }

        const enrichedAnswers = answers.map(ans => {
          const fieldDef = schemaFields.find(f => f.id === ans.fieldKey);
          return {
            ...ans,
            fieldKey: fieldDef?.label || ans.fieldKey
          };
        });

        return { ...submission[0], answers: enrichedAnswers };
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch submission" });
      }
    }),

  /**
   * @name exportCSV
   * @description exports all submissions of a form as CSV string
   * @protected
   * @input formId
   * @returns { csv: string }
   */
  exportCSV: protectedProcedure
    
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

        // get all submissions
        const allSubmissions = await ctx.db
          .select()
          .from(submissions)
          .where(eq(submissions.formId, input.formId))
          .orderBy(desc(submissions.submittedAt));

        if (allSubmissions.length === 0) {
          return { csv: "" };
        }

        // get all answers for all submissions
        const allAnswers = await ctx.db
          .select()
          .from(submissionAnswers)
          .where(
            eq(
              submissionAnswers.submissionId,
              allSubmissions[0]!.id
            )
          );

        // get all unique field keys
        const allAnswersForAll = await Promise.all(
          allSubmissions.map((sub) =>
            ctx.db
              .select()
              .from(submissionAnswers)
              .where(eq(submissionAnswers.submissionId, sub.id))
          )
        );

        const fieldKeys = [
          ...new Set(
            allAnswersForAll.flat().map((a) => a.fieldKey)
          ),
        ];

        // map field keys to labels
        let schemaFields: any[] = [];
        if (form[0].draftSchema && Array.isArray((form[0].draftSchema as any).fields)) {
          schemaFields = (form[0].draftSchema as any).fields;
        }

        const fieldLabels = fieldKeys.map(key => {
          const fieldDef = schemaFields.find(f => f.id === key);
          return fieldDef?.label || key;
        });

        // build CSV
        const headers = ["id", "submittedAt", "sessionId", ...fieldLabels];
        const rows = allSubmissions.map((sub, i) => {
            const answers = allAnswersForAll[i];
            if (!answers) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Answers not found" });
            }
          const answerMap = Object.fromEntries(
            answers.map((a) => [a.fieldKey, a.value])
            );
            
          return [
            sub.id,
            sub.submittedAt?.toISOString(),
            sub.sessionId ?? "",
            ...fieldKeys.map((key) => answerMap[key] ?? ""),
          ]
            .map((v) => `"${String(v).replace(/"/g, '""')}"`)
            .join(",");
        });

        const csv = [headers.join(","), ...rows].join("\n");

        return { csv };
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to export submissions" });
      }
    }),
});