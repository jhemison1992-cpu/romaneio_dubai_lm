import { getDb } from "./db";
import { installationSteps } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Etapas padrão da instalação do caixilho
 */
export const DEFAULT_STEPS = [
  { name: "Instalação", order: 1 },
  { name: "Acabamento", order: 2 },
  { name: "Finalizado", order: 3 },
];

/**
 * Criar etapas padrão para um item de vistoria
 */
export async function createDefaultSteps(inspectionItemId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const steps = DEFAULT_STEPS.map((step) => ({
    inspectionItemId,
    stepName: step.name,
    stepOrder: step.order,
    isCompleted: 0,
  }));

  await db.insert(installationSteps).values(steps);
}

/**
 * Listar etapas de um item de vistoria
 */
export async function getInstallationSteps(inspectionItemId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(installationSteps)
    .where(eq(installationSteps.inspectionItemId, inspectionItemId));
}

/**
 * Marcar/desmarcar etapa como concluída
 */
export async function toggleStepCompletion(stepId: number, isCompleted: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(installationSteps)
    .set({
      isCompleted: isCompleted ? 1 : 0,
      completedAt: isCompleted ? new Date() : null,
    })
    .where(eq(installationSteps.id, stepId));
}

/**
 * Atualizar observações de uma etapa
 */
export async function updateStepNotes(stepId: number, notes: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(installationSteps)
    .set({ notes })
    .where(eq(installationSteps.id, stepId));
}

/**
 * Calcular progresso da instalação (percentual de etapas concluídas)
 */
export async function getInstallationProgress(inspectionItemId: number): Promise<number> {
  const steps = await getInstallationSteps(inspectionItemId);
  if (steps.length === 0) return 0;
  
  const completedSteps = steps.filter((step: any) => step.isCompleted === 1).length;
  return Math.round((completedSteps / steps.length) * 100);
}
