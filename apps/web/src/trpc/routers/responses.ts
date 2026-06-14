import { createTRPCRouter, protectedProcedure, baseProcedure } from "../init";
import { z } from "zod";
import { submissions, submissionAnswers, forms, formVersions, users } from "@formforge/db";
import { eq, and, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { sendSubmissionEmail } from "../../services/email";

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
        const newSubmission = await ctx.db
          .insert(submissions)
          .values({
            formId: input.formId,
            formVersionId: input.formVersionId,
            sessionId: input.sessionId,
            meta: input.meta,
          })
          .returning();

        // insert answers
        if (input.answers.length > 0) {
          await ctx.db.insert(submissionAnswers).values(
            input.answers.map((answer) => ({
              submissionId: newSubmission[0].id,
              fieldKey: answer.fieldKey,
              value: answer.value,
            }))
          );
        } 

        // email service to creator
        const formOwner = await ctx.db
  .select()
  .from(users)
  .where(eq(users.id, form[0].userId))
  .limit(1);

if (formOwner[0]?.email) {
  await sendSubmissionEmail({
    formOwnerEmail: formOwner[0].email,
    formName: form[0].name,
    submissionId: newSubmission[0].id,
    answers: input.answers,
    submittedAt: new Date(),
  });
}

        return newSubmission[0];
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to submit form" });
      }
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

        return { ...submission[0], answers };
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
              allSubmissions[0].id
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

        // build CSV
        const headers = ["id", "submittedAt", "sessionId", ...fieldKeys];
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