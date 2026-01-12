import { eq, sql } from "drizzle-orm";
import { getDb } from "./db";

export async function getAllProjects() {
  const db = await getDb();
  if (!db) return [];
  const { projects, inspections } = await import("../drizzle/schema");
  
  // Get projects with inspection count
  const result = await db
    .select({
      id: projects.id,
      name: projects.name,
      address: projects.address,
      contractor: projects.contractor,
      technicalManager: projects.technicalManager,
      supplier: projects.supplier,
      createdAt: projects.createdAt,
      updatedAt: projects.updatedAt,
      inspectionCount: sql<number>`(SELECT COUNT(*) FROM ${inspections} WHERE ${inspections.projectId} = ${projects.id})`
    })
    .from(projects)
    .orderBy(projects.createdAt);
  
  return result;
}

export async function getProjectById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const { projects } = await import("../drizzle/schema");
  const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createProject(data: {
  name: string;
  address?: string;
  contractor?: string;
  technicalManager?: string;
  supplier?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { projects } = await import("../drizzle/schema");
  
  const result = await db.insert(projects).values({
    name: data.name,
    address: data.address || null,
    contractor: data.contractor || null,
    technicalManager: data.technicalManager || null,
    supplier: data.supplier || "ALUMINC Esquadrias Metálicas Indústria e Comércio Ltda.",
  });
  
  return result[0].insertId;
}

export async function updateProject(id: number, data: {
  name?: string;
  address?: string;
  contractor?: string;
  technicalManager?: string;
  supplier?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { projects } = await import("../drizzle/schema");
  
  await db.update(projects).set(data).where(eq(projects.id, id));
}

export async function deleteProject(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { projects } = await import("../drizzle/schema");
  
  await db.delete(projects).where(eq(projects.id, id));
}

export async function getProjectEnvironments(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  const { environments } = await import("../drizzle/schema");
  return await db.select().from(environments).where(eq(environments.projectId, projectId));
}

export async function createEnvironment(data: {
  projectId: number;
  name: string;
  caixilhoCode: string;
  caixilhoType: string;
  quantity: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { environments } = await import("../drizzle/schema");
  
  const result = await db.insert(environments).values(data);
  return result[0].insertId;
}

export async function updateEnvironment(id: number, data: {
  name?: string;
  caixilhoCode?: string;
  caixilhoType?: string;
  quantity?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { environments } = await import("../drizzle/schema");
  
  await db.update(environments).set(data).where(eq(environments.id, id));
}

export async function deleteEnvironment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { environments } = await import("../drizzle/schema");
  
  await db.delete(environments).where(eq(environments.id, id));
}
