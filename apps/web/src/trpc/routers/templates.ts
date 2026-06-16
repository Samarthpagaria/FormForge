import { createTRPCRouter, protectedProcedure, baseProcedure } from "../init";
import { z } from "zod";
import { templates, templateCategories, forms, formVersions } from "@formforge/db/schema";
import { eq, or, and, isNull } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const templatesRouter = createTRPCRouter({
  /**
   * @name getAllCategories
   * @description gets all global categories + user's own categories
   * @protected
   * @returns TemplateCategory[]
   */
  getAllCategories: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        return await ctx.db
          .select()
          .from(templateCategories)
          .where(
            or(
              eq(templateCategories.isGlobal, true),
              eq(templateCategories.userId, ctx.auth.userId)
            )
          );
      } catch (err) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch categories" });
      }
    }),

  /**
   * @name createCategory
   * @description creates a custom category for the user
   * @protected
   * @input name: string
   * @returns TemplateCategory
   */
  createCategory: protectedProcedure
    .input(z.object({ name: z.string().min(1).max(100) }))
    .mutation(async ({ ctx, input }) => {
      try {
        // check if category with same name already exists for user
        const existing = await ctx.db
          .select()
          .from(templateCategories)
          .where(
            and(
              eq(templateCategories.name, input.name),
              eq(templateCategories.userId, ctx.auth.userId)
            )
          )
          .limit(1);

        if (existing[0]) {
          throw new TRPCError({ code: "CONFLICT", message: "Category with this name already exists" });
        }

        const newCategory = await ctx.db
          .insert(templateCategories)
          .values({
            name: input.name,
            userId: ctx.auth.userId,
            isGlobal: false,
          })
          .returning();

        return newCategory[0];
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create category" });
      }
    }),

  /**
   * @name updateCategory
   * @description updates a user's custom category
   * @protected
   * @input id: string, name: string
   * @returns TemplateCategory
   */
  updateCategory: protectedProcedure
    .input(z.object({ id: z.string(), name: z.string().min(1).max(100) }))
    .mutation(async ({ ctx, input }) => {
      try {
        // check if category exists
        const category = await ctx.db
          .select()
          .from(templateCategories)
          .where(eq(templateCategories.id, input.id))
          .limit(1);

        if (!category[0]) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Category not found" });
        }

        // prevent editing global categories
        if (category[0].isGlobal) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Cannot edit global category" });
        }

        // ensure user owns category
        if (category[0].userId !== ctx.auth.userId) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to edit this category" });
        }

        // prevent renaming to an existing category name
        const existing = await ctx.db
          .select()
          .from(templateCategories)
          .where(
            and(
              eq(templateCategories.name, input.name),
              eq(templateCategories.userId, ctx.auth.userId)
            )
          )
          .limit(1);

        if (existing[0] && existing[0].id !== input.id) {
          throw new TRPCError({ code: "CONFLICT", message: "Category with this name already exists" });
        }

        const updatedCategory = await ctx.db
          .update(templateCategories)
          .set({ name: input.name })
          .where(
            and(
              eq(templateCategories.id, input.id),
              eq(templateCategories.userId, ctx.auth.userId)
            )
          )
          .returning();

        return updatedCategory[0];
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update category" });
      }
    }),

  /**
   * @name deleteCategory
   * @description deletes a user's custom category
   * @protected
   * @input id: string
   * @returns { success: boolean }
   */
  deleteCategory: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // check if category is global
        const category = await ctx.db
          .select()
          .from(templateCategories)
          .where(eq(templateCategories.id, input.id))
          .limit(1);

        if (!category[0]) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Category not found" });
        }

        if (category[0].isGlobal) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Cannot delete global category" });
        }

        if (category[0].userId !== ctx.auth.userId) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to delete this category" });
        }

        await ctx.db
          .delete(templateCategories)
          .where(
            and(
              eq(templateCategories.id, input.id),
              eq(templateCategories.userId, ctx.auth.userId)
            )
          );

        return { success: true };
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete category" });
      }
    }),

  /**
   * @name getAll
   * @description gets all global templates + user's own templates
   * @protected
   * @returns Template[]
   */
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        return await ctx.db
          .select()
          .from(templates)
          .where(
            or(
              eq(templates.isGlobal, true),
              eq(templates.userId, ctx.auth.userId)
            )
          );
      } catch (err) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch templates" });
      }
    }),

  /**
   * @name getByCategory
   * @description gets templates by categoryId
   * @protected
   * @input categoryId: string
   * @returns Template[]
   */
  getByCategory: protectedProcedure
    .input(z.object({ categoryId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        // verify category exists
        const category = await ctx.db
          .select()
          .from(templateCategories)
          .where(eq(templateCategories.id, input.categoryId))
          .limit(1);

        if (!category[0]) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Category not found" });
        }

        return await ctx.db
          .select()
          .from(templates)
          .where(
            and(
              eq(templates.categoryId, input.categoryId),
              or(
                eq(templates.isGlobal, true),
                eq(templates.userId, ctx.auth.userId)
              )
            )
          );
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch templates" });
      }
    }),

  /**
   * @name createUserTemplate
   * @description creates a custom template for the user
   * @protected
   * @input name, description, categoryId, icon, schema
   * @returns Template
   */
    createUserTemplate: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().max(1000).optional(),
        categoryId: z.string().optional(),
        icon: z.string().optional(),
        schema: z.record(z.string(), z.any()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // verify category exists and belongs to user or is global
        if (input.categoryId) {
          const category = await ctx.db
            .select()
            .from(templateCategories)
            .where(eq(templateCategories.id, input.categoryId))
            .limit(1);

          if (!category[0]) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Category not found" });
          }

          if (!category[0].isGlobal && category[0].userId !== ctx.auth.userId) {
            throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to use this category" });
          }
        }

        const newTemplate = await ctx.db
          .insert(templates)
          .values({
            name: input.name,
            description: input.description,
            categoryId: input.categoryId,
            icon: input.icon,
            schema: input.schema,
            userId: ctx.auth.userId,
            isGlobal: false,
          })
          .returning();

        return newTemplate[0];
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create template" });
      }
    }),

  /**
   * @name deleteUserTemplate
   * @description deletes a user's custom template
   * @protected
   * @input id: string
   * @returns { success: boolean }
   */
  deleteUserTemplate: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const template = await ctx.db
          .select()
          .from(templates)
          .where(eq(templates.id, input.id))
          .limit(1);

        if (!template[0]) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Template not found" });
        }

        if (template[0].isGlobal) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Cannot delete global template" });
        }

        if (template[0].userId !== ctx.auth.userId) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to delete this template" });
        }

        await ctx.db
          .delete(templates)
          .where(
            and(
              eq(templates.id, input.id),
              eq(templates.userId, ctx.auth.userId)
            )
          );

        return { success: true };
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete template" });
      }
    }),

  /**
   * @name createFormFromTemplate
   * @description creates a new form from a template
   * @protected
   * @input templateId, name, description
   * @returns Form
   */
  createFormFromTemplate: protectedProcedure
    .input(
      z.object({
        templateId: z.string(),
        name: z.string().min(1).max(100),
        description: z.string().max(1000).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const template = await ctx.db
          .select()
          .from(templates)
          .where(eq(templates.id, input.templateId))
          .limit(1);

        if (!template[0]) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Template not found" });
        }

        // verify user has access to this template
        if (!template[0].isGlobal && template[0].userId !== ctx.auth.userId) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to use this template" });
        }

        const newForm = await ctx.db
          .insert(forms)
          .values({
            name: input.name,
            description: input.description,
            userId: ctx.auth.userId,
            slug: `${input.name.toLowerCase().replace(/\s+/g, "-")}-${Math.random().toString(36).slice(2, 7)}`,
            status: "draft",
            draftSchema: template[0].schema,
          })
          .returning();

        return newForm[0]!;
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create form from template" });
      }
    }),
});