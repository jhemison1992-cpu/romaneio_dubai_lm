import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import multer from "multer";
import { handleUploadPlanta } from "../uploadPlanta";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  
  // Multer configuration for file uploads
  const upload = multer({ storage: multer.memoryStorage() });
  
  // Upload planta route
  app.post("/api/upload-planta", upload.single("file"), handleUploadPlanta);
  
  // Stripe routes
  const stripeRoutes = await import("../stripe-routes");
  app.use("/api/stripe", express.raw({ type: "application/json" }), stripeRoutes.default);
  app.use("/api/stripe", express.json(), stripeRoutes.default);
  
  // Generate environment photos PDF route
  app.get("/api/generate-environment-pdf/:environmentId", async (req, res) => {
    try {
      const environmentId = parseInt(req.params.environmentId);
      const { generateEnvironmentPDF } = await import("../environmentPdfGenerator");
      const { getDb } = await import("../db");
      
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const { environments, inspectionItems, projects, mediaFiles } = await import("../../drizzle/schema");
      const { eq, inArray } = await import("drizzle-orm");
      
      // Buscar dados do ambiente
      const envResult = await db
        .select({
          environment: environments,
          project: projects,
        })
        .from(environments)
        .leftJoin(projects, eq(environments.projectId, projects.id))
        .where(eq(environments.id, environmentId))
        .limit(1);
      
      if (!envResult[0]) {
        res.status(404).json({ error: "Ambiente não encontrado" });
        return;
      }
      
      const { environment, project } = envResult[0];
      
      // Buscar todos os inspection items do ambiente
      const itemsResult = await db
        .select({ id: inspectionItems.id })
        .from(inspectionItems)
        .where(eq(inspectionItems.environmentId, environmentId));
      
      const itemIds = itemsResult.map((item) => item.id);
      
      // Buscar TODAS as fotos desses items
      let photos: any[] = [];
      if (itemIds.length > 0) {
        photos = await db
          .select()
          .from(mediaFiles)
          .where(inArray(mediaFiles.inspectionItemId, itemIds));
      }
      
      // Preparar dados para o PDF
      const pdfData = {
        environment: {
          id: environment?.id || 0,
          name: environment?.name || "",
          caixilhoCode: environment?.caixilhoCode || "",
          caixilhoType: environment?.caixilhoType || "",
          quantity: environment?.quantity || 0,
          startDate: environment?.startDate || null,
          endDate: environment?.endDate || null,
        },
        project: {
          name: project?.name || "",
          address: project?.address || "",
          contractor: project?.contractor || "",
          technicalManager: project?.technicalManager || "",
        },
        photos: photos.map((photo) => ({
          fileUrl: photo.fileUrl || "",
          fileName: photo.fileName || "",
          comment: photo.comment || null,
          uploadedAt: photo.createdAt || null,
        })),
      };
      
      const pdfBuffer = await generateEnvironmentPDF(pdfData);
      
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=fotos-${environment?.name || 'ambiente'}.pdf`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Erro ao gerar PDF do ambiente:", error);
      res.status(500).json({ error: "Erro ao gerar PDF" });
    }
  });
  
  // Generate delivery term PDF route (ALUMINC Model)
  app.get("/api/generate-delivery-term-pdf/:inspectionItemId", async (req, res) => {
    try {
      const inspectionItemId = parseInt(req.params.inspectionItemId);
      const { generateAlumincPDF } = await import("../aluminc-pdf-generator");
      const { getDb, getMediaFilesByItem } = await import("../db");
      const { getInstallationSteps } = await import("../db-installation-steps");
      
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const { inspectionItems, environments, inspections, projects } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      
      // Buscar dados do item
      const itemResult = await db
        .select({
          item: inspectionItems,
          environment: environments,
          inspection: inspections,
          project: projects,
        })
        .from(inspectionItems)
        .leftJoin(environments, eq(inspectionItems.environmentId, environments.id))
        .leftJoin(inspections, eq(inspectionItems.inspectionId, inspections.id))
        .leftJoin(projects, eq(inspections.projectId, projects.id))
        .where(eq(inspectionItems.id, inspectionItemId))
        .limit(1);
      
      if (!itemResult[0]) {
        res.status(404).json({ error: "Item não encontrado" });
        return;
      }
      
      const { item, environment, inspection, project } = itemResult[0];
      
      // Buscar etapas de instalação
      const steps = await getInstallationSteps(inspectionItemId);
      
      // Buscar mídias
      const media = await getMediaFilesByItem(inspectionItemId);
      console.log(`[PDF Route] Found ${media.length} media files for inspectionItemId ${inspectionItemId}`);
      media.forEach((m, i) => console.log(`  [${i}] ${m.fileName} - URL: ${m.fileUrl}`));
      
      // Preparar dados para o PDF
      const pdfData = {
        environment: {
          name: environment?.name || "",
          caixilhoCode: environment?.caixilhoCode || "",
          caixilhoType: environment?.caixilhoType || "",
          quantity: environment?.quantity || 0,
          startDate: environment?.startDate || null,
          endDate: environment?.endDate || null,
        },
        project: {
          name: project?.name || "",
          address: project?.address || "",
          contractor: project?.contractor || "",
          technicalManager: project?.technicalManager || "",
        },
        installationSteps: steps,
        media: media,
        deliveryTerm: {
          responsibleName: item.deliveryTermResponsible || "",
          signature: item.deliveryTermSignature || "",
        },
      };
      
      // Converter dados para formato ALUMINC
      const alumincData = {
        reportNumber: inspectionItemId.toString(),
        reportDate: new Date().toLocaleDateString("pt-BR"),
        dayOfWeek: new Date().toLocaleDateString("pt-BR", { weekday: "long" }),
        contract: project?.contractor || "",
        contractualDeadline: 0,
        elapsedDeadline: 0,
        remainingDeadline: 0,
        project: {
          name: project?.name || "",
          address: project?.address || "",
          contractor: project?.contractor || "",
          responsibleName: project?.technicalManager || "",
        },
        photos: media.map((m) => {
          const photo = {
            fileUrl: m.fileUrl,
            fileName: m.fileName,
            identifier: m.fileName,
            comment: m.comment || undefined,
          };
          console.log(`[PDF Route] Photo mapped: ${photo.fileName} -> ${photo.fileUrl}`);
          return photo;
        }),
        signatures: [
          {
            name: item.deliveryTermResponsible || project?.technicalManager || "Responsável",
            email: "",
            role: "Responsável Técnico",
            timestamp: new Date().toLocaleString("pt-BR"),
            status: "approved" as const,
          },
        ],
      };
      
      const pdfBuffer = await generateAlumincPDF(alumincData);
      
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=termo-entrega-${environment?.name || 'ambiente'}.pdf`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      res.status(500).json({ error: "Erro ao gerar PDF" });
    }
  });
  
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
