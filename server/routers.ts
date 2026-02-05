import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
// import { subscriptionsRouter } from "./subscriptions-router"; // Comentado: arquivo com tabelas não implementadas
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as dbProjects from "./db-projects";
import * as dbPricing from "./db-pricing";
import * as dbCompanies from "./db-companies";

// Helper para converter string ISO para Date sem problemas de timezone
function parseInputDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  // Cria Date em UTC para evitar problemas de timezone
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

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

  inspections: router({
    list: publicProcedure.query(async () => {
      const { getAllInspections } = await import("./db");
      return await getAllInspections();
    }),
    
    create: publicProcedure
      .input((val: unknown) => {

        return z.object({ title: z.string(), projectId: z.number().optional() }).parse(val);
      })
      .mutation(async ({ input }) => {
        const { createInspection } = await import("./db");
        // Usar projectId e userId padrão 1 para acesso público
        const id = await createInspection(input.projectId || 1, 1, input.title);
        return { id };
      }),
    
    get: publicProcedure
      .input((val: unknown) => {

        return z.object({ id: z.number() }).parse(val);
      })
      .query(async ({ input }) => {
        const { getInspectionById } = await import("./db");
        return await getInspectionById(input.id);
      }),
    
    updateStatus: publicProcedure
      .input((val: unknown) => {

        return z.object({ 
          id: z.number(), 
          status: z.enum(["draft", "in_progress", "completed"]) 
        }).parse(val);
      })
      .mutation(async ({ input }) => {
        const { updateInspectionStatus } = await import("./db");
        await updateInspectionStatus(input.id, input.status);
        return { success: true, status: input.status };
      }),
    
    updateTitle: publicProcedure
      .input((val: unknown) => {

        return z.object({ 
          id: z.number(), 
          title: z.string() 
        }).parse(val);
      })
      .mutation(async ({ input }) => {
        const { updateInspectionTitle } = await import("./db");
        await updateInspectionTitle(input.id, input.title);
        return { success: true };
      }),
    
    delete: publicProcedure
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
    list: publicProcedure
      .input((val: unknown) => {

        return z.object({ inspectionId: z.number() }).parse(val);
      })
      .query(async ({ input }) => {
        const { getInspectionItems } = await import("./db");
        return await getInspectionItems(input.inspectionId);
      }),
    
    getById: publicProcedure
      .input((val: unknown) => z.object({ id: z.number() }).parse(val))
      .query(async ({ input }) => {
        const { getInspectionItemById } = await import("./db");
        return await getInspectionItemById(input.id);
      }),
    
    upsert: publicProcedure
      .input((val: unknown) => {

        return z.object({
          id: z.number().optional(),
          inspectionId: z.number(),
          environmentId: z.number(),
          releaseDate: z.string().optional(),
          responsibleConstruction: z.string().optional(),
          responsibleSupplier: z.string().optional(),
          observations: z.string().optional(),
          signatureConstruction: z.string().optional(),
          signatureSupplier: z.string().optional(),
        }).parse(val);
      })
      .mutation(async ({ input }) => {
        const { upsertInspectionItem } = await import("./db");
        
        // Converter releaseDate de string YYYY-MM-DD para Date
        let releaseDateValue: Date | null = null;
        if (input.releaseDate) {
          if (typeof input.releaseDate === 'string' && input.releaseDate.length === 10) {
            const parts = input.releaseDate.split('-').map(Number);
            releaseDateValue = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
          } else if (typeof input.releaseDate === 'string') {
            releaseDateValue = new Date(input.releaseDate);
          }
        }
        
        const data = {
          id: input.id,
          inspectionId: input.inspectionId,
          environmentId: input.environmentId,
          releaseDate: releaseDateValue,
          responsibleConstruction: input.responsibleConstruction || null,
          responsibleSupplier: input.responsibleSupplier || null,
          observations: input.observations || null,
          signatureConstruction: input.signatureConstruction || null,
          signatureSupplier: input.signatureSupplier || null,
        };
        const id = await upsertInspectionItem(data);
        return { id };
      }),
    
    saveDeliveryTerm: publicProcedure
      .input((val: unknown) => z.object({
        inspectionItemId: z.number(),
        responsibleName: z.string(),
        signature: z.string(),
      }).parse(val))
      .mutation(async ({ input }) => {
        const { saveDeliveryTerm } = await import("./db");
        await saveDeliveryTerm(
          input.inspectionItemId,
          input.responsibleName,
          input.signature
        );
        return { success: true };
      }),
  }),

  signatures: router({
    update: publicProcedure
      .input((val: unknown) => {

        return z.object({
          inspectionItemId: z.number(),
          type: z.enum(["construction", "supplier"]),
          signatureData: z.string(),
        }).parse(val);
      })
      .mutation(async ({ input }) => {
        const { updateSignature } = await import("./db");
        await updateSignature(
          input.inspectionItemId,
          input.type,
          input.signatureData
        );
        return { success: true };
      }),
  }),

  media: router({
    upload: publicProcedure
      .input((val: unknown) => {

        return z.object({
          inspectionItemId: z.number(),
          fileData: z.string(),
          fileName: z.string(),
          mimeType: z.string(),
          mediaType: z.enum(["photo", "video"]),
          comment: z.string().optional(),
        }).parse(val);
      })
      .mutation(async ({ input }) => {
        const { saveMediaFile } = await import("./db");
        const { storagePut } = await import("./storage");
        const { nanoid } = await import("nanoid");
        
        const buffer = Buffer.from(input.fileData, "base64");
        const ext = input.fileName.split(".").pop() || "bin";
        const fileKey = `media/${input.inspectionItemId}/${nanoid()}.${ext}`;
        
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        
        const id = await saveMediaFile({
          inspectionItemId: input.inspectionItemId,
          fileUrl: url,
          fileKey,
          fileName: input.fileName,
          mimeType: input.mimeType,
          fileSize: buffer.length,
          mediaType: input.mediaType,
          comment: input.comment || null,
        });
        
        return { id, url };
      }),
    
    list: publicProcedure
      .input((val: unknown) => {

        return z.object({ inspectionItemId: z.number() }).parse(val);
      })
      .query(async ({ input }) => {
        const { getMediaFilesByItem } = await import("./db");
        return await getMediaFilesByItem(input.inspectionItemId);
      }),
    
    updateComment: publicProcedure
      .input((val: unknown) => {

        return z.object({ 
          id: z.number(),
          comment: z.string()
        }).parse(val);
      })
      .mutation(async ({ input }) => {
        const { updateMediaComment } = await import("./db");
        await updateMediaComment(input.id, input.comment);
        return { success: true };
      }),
    
    delete: publicProcedure
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

        return z.object({ inspectionId: z.number(), format: z.enum(["standard", "abnt"]).optional().default("standard") }).parse(val);
      })
      .mutation(async ({ input }) => {
        const { getInspectionById, getInspectionItems, getMediaFilesByItem } = await import("./db");
        const { generateInspectionPDF } = await import("./pdfGenerator");
        const { generateABNTPDF } = await import("./abntPdfGenerator");
        console.log("[generatePDF] Starting PDF generation for inspectionId:", input.inspectionId);
        const { storagePut } = await import("./storage");
        const { nanoid } = await import("nanoid");
        
        const inspection = await getInspectionById(input.inspectionId);
        if (!inspection) {
          console.error("[generatePDF] Inspection not found:", input.inspectionId);
          throw new Error("Vistoria não encontrada");
        }
        console.log("[generatePDF] Found inspection:", inspection.title);
        
        const items = await getInspectionItems(input.inspectionId);
        console.log("[generatePDF] Found items:", items.length);
        
        const itemsWithMedia = await Promise.all(
          items.map(async (item) => {
            const media = await getMediaFilesByItem(item.id);
            const photos = media.filter((m) => m.mediaType === "photo");
            const videos = media.filter((m) => m.mediaType === "video");
            return {
              id: item.id,
              environmentName: item.environmentName || "",
              caixilhoCode: item.caixilhoCode || "",
              caixilhoType: item.caixilhoType || "",
              quantity: item.quantity || 1,
              releaseDate: item.releaseDate,
              responsibleConstruction: item.responsibleConstruction,
              responsibleSupplier: item.responsibleSupplier,
              observations: item.observations,
              signatureConstruction: (item as any).signatureConstruction,
              signatureSupplier: (item as any).signatureSupplier,
              photos: photos.map((p) => ({
                fileUrl: p.fileUrl,
                fileName: p.fileName,
                identifier: p.fileName,
                comment: p.comment || undefined,
              })),
              videos: videos.map((v) => ({
                fileUrl: v.fileUrl,
                fileName: v.fileName,
              })),
            };
          })
        );
        
        console.log("[generatePDF] Items with media:", JSON.stringify(itemsWithMedia, null, 2));
        
        let pdfBuffer;
        if (input.format === "abnt") {
          console.log("[generatePDF] Generating ABNT format PDF");
          pdfBuffer = await generateABNTPDF({
            title: inspection.title,
            status: inspection.status,
            createdAt: inspection.createdAt,
            items: itemsWithMedia,
          });
        } else {
          console.log("[generatePDF] Generating standard format PDF");
          pdfBuffer = await generateInspectionPDF({
            title: inspection.title,
            status: inspection.status,
            createdAt: inspection.createdAt,
            items: itemsWithMedia,
          });
        }
        
        const fileKey = `reports/${input.inspectionId}/${nanoid()}-relatorio.pdf`;
        const { url } = await storagePut(fileKey, pdfBuffer, "application/pdf");
        console.log("[generatePDF] PDF saved to:", fileKey);
        
        return { url };
      }),
  }),
  
  projects: router({
    list: publicProcedure.query(async () => {
      return await dbProjects.getAllProjects();
    }),
    get: publicProcedure
      .input((val: unknown) => z.object({ id: z.number() }).parse(val))
      .query(async ({ input }) => {
        return await dbProjects.getProjectById(input.id);
      }),
    create: publicProcedure
      .input((val: unknown) => z.object({
        name: z.string(),
        address: z.string().optional(),
        contractor: z.string().optional(),
        technicalManager: z.string().optional(),
        supplier: z.string().optional(),
      }).parse(val))
      .mutation(async ({ input }) => {
        const id = await dbProjects.createProject(input);
        return { id };
      }),
    update: publicProcedure
      .input((val: unknown) => z.object({
        id: z.number(),
        name: z.string().optional(),
        address: z.string().optional(),
        contractor: z.string().optional(),
        technicalManager: z.string().optional(),
        supplier: z.string().optional(),
      }).parse(val))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await dbProjects.updateProject(id, data);
        return { success: true };
      }),
    delete: publicProcedure
      .input((val: unknown) => z.object({ id: z.number() }).parse(val))
      .mutation(async ({ input }) => {
        await dbProjects.deleteProject(input.id);
        return { success: true };
      }),
  }),
  
  environments: router({
    list: publicProcedure
      .input((val: unknown) => z.object({ projectId: z.number() }).parse(val))
      .query(async ({ input }) => {
        return await dbProjects.getProjectEnvironments(input.projectId);
      }),
    create: publicProcedure
      .input((val: unknown) => z.object({
        projectId: z.number(),
        name: z.string(),
        caixilhoCode: z.string(),
        caixilhoType: z.string(),
        quantity: z.number(),
        technicalDrawingUrl: z.string().optional(),
        projectFileKey: z.string().optional(),
        projectFileUrl: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }).parse(val))
      .mutation(async ({ input }) => {
        const id = await dbProjects.createEnvironment(input);
        return { id };
      }),
    uploadDrawing: publicProcedure
      .input((val: unknown) => z.object({
        fileData: z.string(),
        fileName: z.string(),
        mimeType: z.string(),
      }).parse(val))
      .mutation(async ({ input }) => {
        const { storagePut } = await import("./storage");
        const { nanoid } = await import("nanoid");
        
        const buffer = Buffer.from(input.fileData, "base64");
        const ext = input.fileName.split(".").pop() || "pdf";
        const fileKey = `drawings/${nanoid()}.${ext}`;
        
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        
        return { url, fileKey };
      }),
    update: publicProcedure
      .input((val: unknown) => z.object({
        id: z.number(),
        name: z.string().optional(),
        caixilhoCode: z.string().optional(),
        caixilhoType: z.string().optional(),
        quantity: z.number().optional(),
        plantaFileKey: z.string().optional(),
        plantaFileUrl: z.string().optional(),
        projectFileKey: z.string().optional(),
        projectFileUrl: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }).parse(val))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await dbProjects.updateEnvironment(id, data);
        return { success: true };
      }),
    delete: publicProcedure
      .input((val: unknown) => z.object({ id: z.number() }).parse(val))
      .mutation(async ({ input }) => {
        await dbProjects.deleteEnvironment(input.id);
        return { success: true };
      }),
  }),
  
  users: router({
    list: publicProcedure.query(async () => {
      const { getAllUsers } = await import("./db");
      return await getAllUsers();
    }),
    
    create: publicProcedure
      .input((val: unknown) => z.object({
        username: z.string(),
        password: z.string(),
        fullName: z.string(),
        role: z.enum(["user", "admin"]),
        profilePhoto: z.string().nullable().optional(),
      }).parse(val))
      .mutation(async ({ input }) => {
        const { createUser } = await import("./db");
        const id = await createUser(input);
        return { id };
      }),
    
    update: publicProcedure
      .input((val: unknown) => z.object({
        id: z.number(),
        username: z.string().optional(),
        password: z.string().optional(),
        fullName: z.string().optional(),
        role: z.enum(["user", "admin"]).optional(),
        profilePhoto: z.string().nullable().optional(),
      }).parse(val))
      .mutation(async ({ input }) => {
        const { updateUser } = await import("./db");
        const { id, ...data } = input;
        await updateUser(id, data);
        return { success: true };
      }),
    
    delete: publicProcedure
      .input((val: unknown) => z.object({ id: z.number() }).parse(val))
      .mutation(async ({ input }) => {
        const { deleteUser } = await import("./db");
        await deleteUser(input.id);
        return { success: true };
      }),
  }),

  inspectionEnvironments: router({
    list: publicProcedure
      .input((val: unknown) => z.object({ inspectionId: z.number() }).parse(val))
      .query(async ({ input }) => {
        const { getInspectionEnvironments } = await import("./db");
        return await getInspectionEnvironments(input.inspectionId);
      }),
    create: publicProcedure
      .input((val: unknown) => z.object({
        inspectionId: z.number(),
        name: z.string(),
        caixilhoCode: z.string(),
        caixilhoType: z.string(),
        quantity: z.number(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        plantaFileKey: z.string().optional(),
        plantaFileUrl: z.string().optional(),
        projectFileKey: z.string().optional(),
        projectFileUrl: z.string().optional(),
      }).parse(val))
      .mutation(async ({ input }) => {
        const { createInspectionEnvironment } = await import("./db");
        const id = await createInspectionEnvironment(input);
        return { id };
      }),
    update: publicProcedure
      .input((val: unknown) => z.object({
        id: z.number(),
        name: z.string().optional(),
        caixilhoCode: z.string().optional(),
        caixilhoType: z.string().optional(),
        quantity: z.number().optional(),
        plantaFileKey: z.string().optional(),
        plantaFileUrl: z.string().optional(),
        projectFileKey: z.string().optional(),
        projectFileUrl: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }).parse(val))
      .mutation(async ({ input }) => {
        const { updateInspectionEnvironment } = await import("./db");
        const { id, ...data } = input;
        await updateInspectionEnvironment(id, data);
        return { success: true };
      }),
    delete: publicProcedure
      .input((val: unknown) => z.object({ id: z.number() }).parse(val))
      .mutation(async ({ input }) => {
        const { deleteInspectionEnvironment } = await import("./db");
        await deleteInspectionEnvironment(input.id);
        return { success: true };
      }),
  }),
  installationSteps: router({
    list: publicProcedure
      .input((val: unknown) => z.object({ inspectionItemId: z.number() }).parse(val))
      .query(async ({ input }) => {
        const { getInstallationSteps } = await import("./db-installation-steps");
        return await getInstallationSteps(input.inspectionItemId);
      }),
    toggle: publicProcedure
      .input((val: unknown) => z.object({ stepId: z.number(), isCompleted: z.boolean() }).parse(val))
      .mutation(async ({ input }) => {
        const { toggleStepCompletion } = await import("./db-installation-steps");
        await toggleStepCompletion(input.stepId, input.isCompleted);
        return { success: true };
      }),
    updateNotes: publicProcedure
      .input((val: unknown) => z.object({ stepId: z.number(), notes: z.string() }).parse(val))
      .mutation(async ({ input }) => {
        const { updateStepNotes } = await import("./db-installation-steps");
        await updateStepNotes(input.stepId, input.notes);
        return { success: true };
      }),
    updateQuantity: publicProcedure
      .input((val: unknown) => z.object({ stepId: z.number(), completedQuantity: z.number() }).parse(val))
      .mutation(async ({ input }) => {
        const { updateStepQuantity } = await import("./db-installation-steps");
        await updateStepQuantity(input.stepId, input.completedQuantity);
        return { success: true };
      }),
    getProgress: publicProcedure
      .input((val: unknown) => z.object({ inspectionItemId: z.number() }).parse(val))
      .query(async ({ input }) => {
        const { getInstallationProgress } = await import("./db-installation-steps");
        const progress = await getInstallationProgress(input.inspectionItemId);
        return { progress };
      }),
    createDefault: publicProcedure
      .input((val: unknown) => z.object({ inspectionItemId: z.number() }).parse(val))
      .mutation(async ({ input }) => {
        const { createDefaultSteps } = await import("./db-installation-steps");
        await createDefaultSteps(input.inspectionItemId);
        return { success: true };
      }),
  }),

  companies: router({
    inviteUser: publicProcedure
      .input((val: unknown) => z.object({
        email: z.string().email(),
        companyId: z.number(),
        role: z.enum(["admin", "supervisor", "technician", "viewer"]),
      }).parse(val))
      .mutation(async ({ input }) => {
        
        // Aqui você enviaria um email com o convite
        // Por enquanto, apenas registramos o convite
        return { success: true, email: input.email };
      }),
    
    removeUser: publicProcedure
      .input((val: unknown) => z.object({
        userId: z.number(),
        companyId: z.number(),
      }).parse(val))
      .mutation(async ({ input }) => {
        await dbCompanies.removeUserFromCompany(input.userId, input.companyId);
        return { success: true };
      }),
    
    updateUserRole: publicProcedure
      .input((val: unknown) => z.object({
        userId: z.number(),
        companyId: z.number(),
        role: z.enum(["admin", "supervisor", "technician", "viewer"]),
      }).parse(val))
      .mutation(async ({ input }) => {
        await dbCompanies.updateUserCompanyRole(input.userId, input.companyId, input.role);
        return { success: true };
      }),
    
    create: publicProcedure
      .input((val: unknown) => z.object({
        name: z.string().min(1),
        slug: z.string().min(1).optional(),
        logoUrl: z.string().optional(),
        subscriptionPlan: z.enum(["pro", "enterprise"]).optional(),
      }).parse(val))
      .mutation(async ({ input }) => {
        let slug = input.slug || dbCompanies.generateSlug(input.name);
        let counter = 1;
        const originalSlug = slug;
        
        while (await dbCompanies.slugExists(slug)) {
          slug = `${originalSlug}-${counter}`;
          counter++;
        }
        
        const id = await dbCompanies.createCompany({
          name: input.name,
          slug,
          logoUrl: input.logoUrl,
          subscriptionPlan: input.subscriptionPlan,
        });
        
        return { id, slug };
      }),
    
    getById: publicProcedure
      .input((val: unknown) => z.object({ id: z.number() }).parse(val))
      .query(async ({ input }) => {
        return await dbCompanies.getCompanyById(input.id);
      }),
    
    getBySlug: publicProcedure
      .input((val: unknown) => z.object({ slug: z.string() }).parse(val))
      .query(async ({ input }) => {
        return await dbCompanies.getCompanyBySlug(input.slug);
      }),
    
    getUserCompanies: publicProcedure
      .input((val: unknown) => z.object({ userId: z.number() }).parse(val))
      .query(async ({ input }) => {
        return await dbCompanies.getUserCompanies(input.userId);
      }),
    
    getUsers: publicProcedure
      .input((val: unknown) => z.object({ companyId: z.number() }).parse(val))
      .query(async ({ input }) => {
        return await dbCompanies.getCompanyUsers(input.companyId);
      }),
  }),

  stripe: router({
    createCheckoutSession: publicProcedure
      .input((val: unknown) => z.object({
        companyId: z.number(),
        plan: z.enum(["pro", "enterprise"]),
        billingPeriod: z.enum(["monthly", "annual"]),
        email: z.string().email(),
      }).parse(val))
      .mutation(async ({ input, ctx }) => {
        // Aqui voce chamaria a rota de checkout do Stripe
        // Por enquanto, retornamos um URL de exemplo
        const origin = ctx.req?.headers.origin || "http://localhost:3000";
        const checkoutUrl = `${origin}/checkout?plan=${input.plan}&period=${input.billingPeriod}`;
        return { sessionId: "test_session", url: checkoutUrl };
      }),
  }),

//   subscriptions: subscriptionsRouter,
// 
//   pricing: router({
//     list: publicProcedure.query(async () => {
//       return await dbPricing.getAllPricingPlans();
//     }),
//     
//     getBySlug: publicProcedure
//       .input((val: unknown) => z.object({ slug: z.string() }).parse(val))
//       .query(async ({ input }) => {
//         return await dbPricing.getPricingPlanBySlug(input.slug);
//       }),
//     
//     getCompanyPlan: publicProcedure
//       .input((val: unknown) => z.object({ companyId: z.number() }).parse(val))
//       .query(async ({ input }) => {
//         return await dbPricing.getCompanyPricingPlan(input.companyId);
//       }),
//     
//     getPlanLimits: publicProcedure
//       .input((val: unknown) => z.object({ planSlug: z.string() }).parse(val))
//       .query(async ({ input }) => {
//         return await dbPricing.getPlanLimits(input.planSlug);
//       }),
//   }),
});

export type AppRouter = typeof appRouter;
