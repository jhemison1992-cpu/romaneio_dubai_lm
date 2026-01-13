import { getDb } from "./db";
import { eq, and } from "drizzle-orm";

/**
 * Cria automaticamente inspection_items para todos os ambientes de uma vistoria
 * que ainda não têm inspection_item criado
 */
export async function autoCreateInspectionItems(inspectionId: number, projectId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { inspectionItems, environments } = await import("../drizzle/schema");
  
  // Buscar todos os ambientes do projeto
  const allEnvironments = await db.select().from(environments).where(eq(environments.projectId, projectId));
  
  // Buscar inspection_items existentes para esta vistoria
  const existingItems = await db.select().from(inspectionItems).where(eq(inspectionItems.inspectionId, inspectionId));
  const existingEnvIds = new Set(existingItems.map((item: any) => item.environmentId));
  
  // Criar inspection_items para ambientes que ainda não têm
  const itemsToCreate = allEnvironments
    .filter((env: any) => !existingEnvIds.has(env.id))
    .map((env: any) => ({
      inspectionId,
      environmentId: env.id,
      releaseDate: null,
      responsibleConstruction: null,
      responsibleSupplier: null,
      observations: null,
      signatureConstruction: null,
      signatureSupplier: null,
    }));
  
  if (itemsToCreate.length > 0) {
    await db.insert(inspectionItems).values(itemsToCreate);
  }
  
  return itemsToCreate.length;
}
