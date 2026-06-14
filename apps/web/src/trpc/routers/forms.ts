import { createTRPCRouter, protectedProcedure } from "../init";
import { z } from "zod";
import { forms } from "@formforge/db";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const formsRouter = createTRPCRouter({
  /**
   * @name create
   * @description creates a new form
   * @protected
   * @input name: string, description?: string
   * @returns Form
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().max(1000).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const newForm = await ctx.db
          .insert(forms)
          .values({
            name: input.name,
            description: input.description,
            userId: ctx.auth.userId,
            slug: `${input.name.toLowerCase().replace(/\s+/g, "-")}-${Math.random().toString(36).slice(2, 7)}`,
            status: "draft",
          })
          .returning();

        return newForm[0];
      } catch (err) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create form" });
      }
    }),

  /**
   * @name getAllForms
   * @description gets all forms for logged in user
   * @protected
   * @returns Form[]
   */
  getAllForms: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        return await ctx.db
          .select()
          .from(forms)
          .where(eq(forms.userId, ctx.auth.userId));
      } catch (err) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch forms" });
      }
    }),

  /**
   * @name getById
   * @description gets a single form by id
   * @protected
   * @input id: string
   * @returns Form
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const form = await ctx.db
          .select()
          .from(forms)
          .where(
            and(
              eq(forms.id, input.id),
              eq(forms.userId, ctx.auth.userId)
            )
          )
          .limit(1);

        if (!form[0]) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
        }

        return form[0];
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch form" });
      }
    }),

  /**
   * @name update
   * @description updates a form
   * @protected
   * @input id: string, name?: string, description?: string, status?: string, settings?: object
   * @returns Form
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().max(1000).optional(),
        status: z.enum(["draft", "published"]).optional(),
        settings: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...rest } = input;

        const updated = await ctx.db
          .update(forms)
          .set({
            ...rest,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(forms.id, id),
              eq(forms.userId, ctx.auth.userId)
            )
          )
          .returning();

        if (!updated[0]) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
        }

        return updated[0];
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update form" });
      }
    }),

  /**
   * @name delete
   * @description deletes a form
   * @protected
   * @input id: string
   * @returns { success: boolean }
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const deleted = await ctx.db
          .delete(forms)
          .where(
            and(
              eq(forms.id, input.id),
              eq(forms.userId, ctx.auth.userId)
            )
          )
          .returning();

        if (!deleted[0]) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
        }

        return { success: true };
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete form" });
      }
    }),

  /**
   * @name publish
   * @description publishes a form
   * @protected
   * @input id: string
   * @returns Form
   */
  publish: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const updated = await ctx.db
          .update(forms)
          .set({ status: "published", updatedAt: new Date() })
          .where(
            and(
              eq(forms.id, input.id),
              eq(forms.userId, ctx.auth.userId)
            )
          )
          .returning();

        if (!updated[0]) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
        }

        return updated[0];
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to publish form" });
      }
    }),

  /**
   * @name unpublish
   * @description unpublishes a form
   * @protected
   * @input id: string
   * @returns Form
   */
  unpublish: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const updated = await ctx.db
          .update(forms)
          .set({ status: "draft", updatedAt: new Date() })
          .where(
            and(
              eq(forms.id, input.id),
              eq(forms.userId, ctx.auth.userId)
            )
          )
          .returning();

        if (!updated[0]) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
        }

        return updated[0];
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to unpublish form" });
      }
    }),
});