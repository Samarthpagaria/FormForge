import { createTRPCRouter, protectedProcedure } from "../init";
import { z } from "zod";
import { forms } from "@formforge/db";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { generateQRCode } from "../../services/qr";

export const shareRouter = createTRPCRouter({
  /**
   * @name getShareLink
   * @description gets the public share link for a form
   * @protected
   * @input formId
   * @returns { url: string, slug: string }
   */
  getShareLink: protectedProcedure
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

        if (form[0].status !== "published") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Form must be published to share" });
        }

        const url = `${process.env.NEXT_PUBLIC_APP_URL}/f/${form[0].slug}`;

        return { url, slug: form[0].slug };
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to get share link" });
      }
    }),

  /**
   * @name getQRCode
   * @description generates a QR code for a form
   * @protected
   * @input formId
   * @returns { qrCode: string, url: string }
   */
  getQRCode: protectedProcedure
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

        if (form[0].status !== "published") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Form must be published to generate QR" });
        }

        const url = `${process.env.NEXT_PUBLIC_APP_URL}/f/${form[0].slug}`;
        const qrCode = await generateQRCode(url);

        return { qrCode, url };
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to generate QR code" });
      }
    }),
});