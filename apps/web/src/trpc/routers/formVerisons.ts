import { createTRPCRouter,protectedProcedure } from "../init";
import { z } from "zod";
import { formVersions,forms } from "@formforge/db";
import { eq, and, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const formVersionsRouter = createTRPCRouter({
    /**
     * @name create
     * @description creates a new version of a form 
     * @protected
     * @input formId: string, schema:Object
     * @returns formVersion
     */
    create: protectedProcedure.input(z.object({ formId: z.string(), schema: z.record(z.string(), z.any()) })).mutation(async ({ ctx, input }) => {
        try {
            //verify form belongs to user 
            const form = await ctx.db.select().from(forms).where(and(
                eq(forms.id, input.formId),
                eq(forms.userId,ctx.auth.userId)
            )).limit(1)

            if (!form[0]) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Form not found"})
            }
            
            // get latest version number
            const latestVersion = await ctx.db.select().from(formVersions).where(eq(formVersions.formId, input.formId)).orderBy(desc(formVersions.createdAt)).limit(1)
            
            const nextVersion = latestVersion[0] ? String(Number(latestVersion[0].version) + 1) : "1";
            const newVersion = await ctx.db.insert(formVersions).values({ formId: input.formId, version: nextVersion, schema: input.schema }).returning();

            if(!newVersion[0]){
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create version" })
            }
            // update current versionId from form 
            await ctx.db.update(forms).set({currentVersionId:newVersion[0].id,updatedAt:new Date()}).where(eq(forms.id,input.formId))
            return newVersion[0]
        } catch (error) {
            if(error instanceof TRPCError){
                throw error
            }
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create version" })
        }
    }),

    /**
     * @name createSnapshot
     * @description Creates a new version snapshot from the current draft without publishing it
     * @protected
     * @input formId: string
     * @returns formVersion
     */
    createSnapshot: protectedProcedure.input(z.object({ formId: z.string() })).mutation(async ({ ctx, input }) => {
        try {
            //verify form belongs to user 
            const form = await ctx.db.select().from(forms).where(and(
                eq(forms.id, input.formId),
                eq(forms.userId,ctx.auth.userId)
            )).limit(1)

            if (!form[0]) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Form not found"})
            }
            
            const schemaToSave = form[0].draftSchema || { fields: [] };

            // get latest version number
            const latestVersion = await ctx.db.select().from(formVersions).where(eq(formVersions.formId, input.formId)).orderBy(desc(formVersions.createdAt)).limit(1)
            
            const nextVersion = latestVersion[0] ? String(Number(latestVersion[0].version) + 1) : "1";
            const newVersion = await ctx.db.insert(formVersions).values({ formId: input.formId, version: nextVersion, schema: schemaToSave }).returning();

            if(!newVersion[0]){
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create snapshot" })
            }
            
            return newVersion[0]
        } catch (error) {
            if(error instanceof TRPCError){
                throw error
            }
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create snapshot" })
        }
    }),

    /**
     * @name publishVersion
     * @description Publishes the current draft schema of a form as a new version
     * @protected
     * @input formId: string
     * @returns formVersion
     */
    publishVersion: protectedProcedure.input(z.object({ formId: z.string() })).mutation(async ({ ctx, input }) => {
        try {
            //verify form belongs to user 
            const form = await ctx.db.select().from(forms).where(and(
                eq(forms.id, input.formId),
                eq(forms.userId,ctx.auth.userId)
            )).limit(1)

            if (!form[0]) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Form not found"})
            }
            
            const schemaToPublish = form[0].draftSchema || { fields: [] };

            // get latest version number
            const latestVersion = await ctx.db.select().from(formVersions).where(eq(formVersions.formId, input.formId)).orderBy(desc(formVersions.createdAt)).limit(1)
            
            const nextVersion = latestVersion[0] ? String(Number(latestVersion[0].version) + 1) : "1";
            const newVersion = await ctx.db.insert(formVersions).values({ formId: input.formId, version: nextVersion, schema: schemaToPublish }).returning();

            if(!newVersion[0]){
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create version" })
            }
            // update current versionId from form 
            await ctx.db.update(forms).set({currentVersionId:newVersion[0].id,updatedAt:new Date()}).where(eq(forms.id,input.formId))
            return newVersion[0]
        } catch (error) {
            if(error instanceof TRPCError){
                throw error
            }
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to publish version" })
        }
    }),
    /**
     * @name getAll
   * @description gets all versions of a form
   * @protected
   * @input formId: string
   * @returns FormVersion[]
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
          .from(formVersions)
          .where(eq(formVersions.formId, input.formId))
          .orderBy(desc(formVersions.createdAt));
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch versions" });
      }
    }),
      /**
   * @name getById
   * @description gets a single version by id
   * @protected
   * @input id: string
   * @returns FormVersion
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const version = await ctx.db
          .select()
          .from(formVersions)
          .where(eq(formVersions.id, input.id))
          .limit(1);

        if (!version[0]) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Version not found" });
        }

        return version[0];
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch version" });
      }
    }),
/**
   * @name rollback
   * @description sets a version as the current version of a form
   * @protected
   * @input formId: string, versionId: string
   * @returns Form
   */
  rollback: protectedProcedure
    .input(z.object({ formId: z.string(), versionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
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

        // verify version exists
        const version = await ctx.db
          .select()
          .from(formVersions)
          .where(
            and(
              eq(formVersions.id, input.versionId),
              eq(formVersions.formId, input.formId)
            )
          )
          .limit(1);

        if (!version[0]) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Version not found" });
        }

        const updated = await ctx.db
          .update(forms)
          .set({ 
            currentVersionId: input.versionId, 
            draftSchema: version[0].schema,
            updatedAt: new Date() 
          })
          .where(eq(forms.id, input.formId))
          .returning();

        return updated[0];
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to rollback version" });
      }
    }),

    /**
     * @name deleteVersion
     * @description Deletes a version snapshot from the history
     * @protected
     * @input formId: string, versionId: string
     * @returns { success: boolean }
     */
    deleteVersion: protectedProcedure
      .input(z.object({ formId: z.string(), versionId: z.string() }))
      .mutation(async ({ ctx, input }) => {
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

          if (form[0].currentVersionId === input.versionId) {
            throw new TRPCError({ 
              code: "BAD_REQUEST", 
              message: "Cannot delete the officially published version. Please publish another version first." 
            });
          }

          const deleted = await ctx.db
            .delete(formVersions)
            .where(
              and(
                eq(formVersions.id, input.versionId),
                eq(formVersions.formId, input.formId)
              )
            )
            .returning();

          if (deleted.length === 0) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Version not found or already deleted" });
          }

          return { success: true };
        } catch (err) {
          if (err instanceof TRPCError) throw err;
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete version" });
        }
      }),

})