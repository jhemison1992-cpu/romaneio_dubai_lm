import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  environments: router({
    list: publicProcedure.query(async () => {
      const { getAllEnvironments, seedEnvironments } = await import("./db");
      await seedEnvironments();
      return await getAllEnvironments();
    }),
  }),

  inspections: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const { getInspectionsByUser } = await import("./db");
      return await getInspectionsByUser(ctx.user.id);
    }),
    
    create: protectedProcedure
      .input((val: unknown) => {

        return z.object({ title: z.string() }).parse(val);
      })
      .mutation(async ({ ctx, input }) => {
        const { createInspection } = await import("./db");
        const id = await createInspection(ctx.user.id, input.title);
        return { id };
      }),
    
    get: protectedProcedure
      .input((val: unknown) => {

        return z.object({ id: z.number() }).parse(val);
      })
      .query(async ({ input }) => {
        const { getInspectionById } = await import("./db");
        return await getInspectionById(input.id);
      }),
    
    updateStatus: protectedProcedure
      .input((val: unknown) => {

        return z.object({ 
          id: z.number(), 
          status: z.enum(["draft", "in_progress", "completed"]) 
        }).parse(val);
      })
      .mutation(async ({ input }) => {
        const { updateInspectionStatus } = await import("./db");
        await updateInspectionStatus(input.id, input.status);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input((val: unknown) => {

        return z.object({ id: z.number() }).parse(val);
      })
      .mutation(async ({ input }) => {
        const { deleteInspection } = await import("./db");
        await deleteInspection(input.id);
        return { success: true };
      }),
  }),

  inspectionItems: router({
    list: protectedProcedure
      .input((val: unknown) => {

        return z.object({ inspectionId: z.number() }).parse(val);
      })
      .query(async ({ input }) => {
        const { getInspectionItems } = await import("./db");
        return await getInspectionItems(input.inspectionId);
      }),
    
    upsert: protectedProcedure
      .input((val: unknown) => {

        return z.object({
          id: z.number().optional(),
          inspectionId: z.number(),
          environmentId: z.number(),
          releaseDate: z.string().nullable().optional(),
          responsibleConstruction: z.string().nullable().optional(),
          responsibleSupplier: z.string().nullable().optional(),
          observations: z.string().nullable().optional(),
        }).parse(val);
      })
      .mutation(async ({ input }) => {
        const { upsertInspectionItem } = await import("./db");
        const id = await upsertInspectionItem({
          ...input,
          releaseDate: input.releaseDate ? new Date(input.releaseDate) : null,
        });
        return { id };
      }),
  }),

  media: router({
    upload: protectedProcedure
      .input((val: unknown) => {

        return z.object({
          inspectionItemId: z.number(),
          fileData: z.string(),
          fileName: z.string(),
          mimeType: z.string(),
          mediaType: z.enum(["photo", "video"]),
        }).parse(val);
      })
      .mutation(async ({ input }) => {
        const { storagePut } = await import("./storage");
        const { createMediaFile } = await import("./db");
        const { nanoid } = await import("nanoid");
        
        const buffer = Buffer.from(input.fileData, "base64");
        const fileKey = `inspections/${input.inspectionItemId}/${nanoid()}-${input.fileName}`;
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        
        const id = await createMediaFile({
          inspectionItemId: input.inspectionItemId,
          fileKey,
          fileUrl: url,
          fileName: input.fileName,
          mimeType: input.mimeType,
          fileSize: buffer.length,
          mediaType: input.mediaType,
        });
        
        return { id, url };
      }),
    
    list: protectedProcedure
      .input((val: unknown) => {

        return z.object({ inspectionItemId: z.number() }).parse(val);
      })
      .query(async ({ input }) => {
        const { getMediaFilesByItem } = await import("./db");
        return await getMediaFilesByItem(input.inspectionItemId);
      }),
    
    delete: protectedProcedure
      .input((val: unknown) => {

        return z.object({ id: z.number() }).parse(val);
      })
      .mutation(async ({ input }) => {
        const { deleteMediaFile } = await import("./db");
        await deleteMediaFile(input.id);
        return { success: true };
      }),
  }),

  reports: router({
    generatePDF: protectedProcedure
      .input((val: unknown) => {

        return z.object({ inspectionId: z.number() }).parse(val);
      })
      .mutation(async ({ input }) => {
        const { getInspectionById, getInspectionItems, getMediaFilesByItem } = await import("./db");
        const { generateInspectionPDF } = await import("./pdfGenerator");
        const { storagePut } = await import("./storage");
        const { nanoid } = await import("nanoid");
        
        const inspection = await getInspectionById(input.inspectionId);
        if (!inspection) throw new Error("Vistoria não encontrada");
        
        const items = await getInspectionItems(input.inspectionId);
        
        const itemsWithMedia = await Promise.all(
          items.map(async (item) => {
            const media = await getMediaFilesByItem(item.id);
            return {
              environmentName: item.environmentName || "",
              caixilhoCode: item.caixilhoCode || "",
              caixilhoType: item.caixilhoType || "",
              quantity: item.quantity || 1,
              releaseDate: item.releaseDate,
              responsibleConstruction: item.responsibleConstruction,
              responsibleSupplier: item.responsibleSupplier,
              observations: item.observations,
              photos: media.filter((m) => m.mediaType === "photo").length,
              videos: media.filter((m) => m.mediaType === "video").length,
            };
          })
        );
        
        const pdfBuffer = await generateInspectionPDF({
          title: inspection.title,
          status: inspection.status,
          createdAt: inspection.createdAt,
          items: itemsWithMedia,
        });
        
        const fileKey = `reports/${input.inspectionId}/${nanoid()}-relatorio.pdf`;
        const { url } = await storagePut(fileKey, pdfBuffer, "application/pdf");
        
        return { url };
      }),
  }),
});

export type AppRouter = typeof appRouter;
