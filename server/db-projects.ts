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
  companyId?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { projects } = await import("../drizzle/schema");
  
  const result = await db.insert(projects).values({
    companyId: data.companyId ?? 1,
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
  startDate?: string;
  endDate?: string;
  plantaFileKey?: string;
  plantaFileUrl?: string;
  projectFileKey?: string;
  projectFileUrl?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { environments } = await import("../drizzle/schema");
  
  // Map the data to match the schema field names
  const insertData = {
    projectId: data.projectId,
    name: data.name,
    caixilhoCode: data.caixilhoCode,
    caixilhoType: data.caixilhoType,
    quantity: data.quantity,
    startDate: data.startDate ? new Date(data.startDate) : undefined,
    endDate: data.endDate ? new Date(data.endDate) : undefined,
    plantaFileKey: data.plantaFileKey,
    plantaFileUrl: data.plantaFileUrl,
    projectFileKey: data.projectFileKey,
    projectFileUrl: data.projectFileUrl,
  };
  
  const result = await db.insert(environments).values(insertData);
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


// ===== PROJECT REPORTS =====

export async function createProjectReport(data: {
  projectId: number;
  companyId: number;
  title: string;
  inspectionDate: string;
  responsibleName: string;
  responsibleRole?: string;
  observations?: string;
  generalConformity?: "ok" | "not_ok" | "partial";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { projectReports } = await import("../drizzle/schema");
  
  const result = await db.insert(projectReports).values({
    projectId: data.projectId,
    companyId: data.companyId,
    title: data.title,
    inspectionDate: new Date(data.inspectionDate),
    responsibleName: data.responsibleName,
    responsibleRole: data.responsibleRole,
    observations: data.observations,
    generalConformity: data.generalConformity || "partial",
  });
  
  return result[0].insertId;
}

export async function getProjectReports(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  const { projectReports } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  
  return await db
    .select()
    .from(projectReports)
    .where(eq(projectReports.projectId, projectId))
    .orderBy(projectReports.inspectionDate);
}

export async function getProjectReportById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const { projectReports } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  
  const result = await db
    .select()
    .from(projectReports)
    .where(eq(projectReports.id, id));
  
  return result[0] || null;
}

export async function updateProjectReport(id: number, data: {
  title?: string;
  inspectionDate?: string;
  responsibleName?: string;
  responsibleRole?: string;
  observations?: string;
  generalConformity?: "ok" | "not_ok" | "partial";
  responsibleSignature?: string;
  aluminicSignature?: string;
  status?: "draft" | "completed" | "approved";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { projectReports } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  
  const updateData: any = {};
  if (data.title) updateData.title = data.title;
  if (data.inspectionDate) updateData.inspectionDate = new Date(data.inspectionDate);
  if (data.responsibleName) updateData.responsibleName = data.responsibleName;
  if (data.responsibleRole) updateData.responsibleRole = data.responsibleRole;
  if (data.observations) updateData.observations = data.observations;
  if (data.generalConformity) updateData.generalConformity = data.generalConformity;
  if (data.responsibleSignature) updateData.responsibleSignature = data.responsibleSignature;
  if (data.aluminicSignature) updateData.aluminicSignature = data.aluminicSignature;
  if (data.status) updateData.status = data.status;
  
  await db.update(projectReports).set(updateData).where(eq(projectReports.id, id));
}

export async function deleteProjectReport(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { projectReports } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  
  await db.delete(projectReports).where(eq(projectReports.id, id));
}

// ===== PROJECT REPORT ITEMS =====

export async function addReportItem(data: {
  reportId: number;
  environmentId: number;
  name: string;
  caixilhoCode: string;
  caixilhoType: string;
  quantity: number;
  evolutionStatus?: string;
  conformity?: "ok" | "not_ok" | "pending";
  observations?: string;
  defects?: string;
  photoUrls?: string[];
  photoKeys?: string[];
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { projectReportItems } = await import("../drizzle/schema");
  
  const result = await db.insert(projectReportItems).values({
    reportId: data.reportId,
    environmentId: data.environmentId,
    name: data.name,
    caixilhoCode: data.caixilhoCode,
    caixilhoType: data.caixilhoType,
    quantity: data.quantity,
    evolutionStatus: data.evolutionStatus,
    conformity: data.conformity || "pending",
    observations: data.observations,
    defects: data.defects,
    photoUrls: data.photoUrls ? JSON.stringify(data.photoUrls) : null,
    photoKeys: data.photoKeys ? JSON.stringify(data.photoKeys) : null,
  });
  
  return result[0].insertId;
}

export async function getReportItems(reportId: number) {
  const db = await getDb();
  if (!db) return [];
  const { projectReportItems } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  
  const items = await db
    .select()
    .from(projectReportItems)
    .where(eq(projectReportItems.reportId, reportId));
  
  // Parse JSON fields
  return items.map(item => ({
    ...item,
    photoUrls: item.photoUrls ? JSON.parse(item.photoUrls) : [],
    photoKeys: item.photoKeys ? JSON.parse(item.photoKeys) : [],
  }));
}

export async function updateReportItem(id: number, data: {
  evolutionStatus?: string;
  conformity?: "ok" | "not_ok" | "pending";
  observations?: string;
  defects?: string;
  photoUrls?: string[];
  photoKeys?: string[];
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { projectReportItems } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  
  const updateData: any = {};
  if (data.evolutionStatus) updateData.evolutionStatus = data.evolutionStatus;
  if (data.conformity) updateData.conformity = data.conformity;
  if (data.observations) updateData.observations = data.observations;
  if (data.defects) updateData.defects = data.defects;
  if (data.photoUrls) updateData.photoUrls = JSON.stringify(data.photoUrls);
  if (data.photoKeys) updateData.photoKeys = JSON.stringify(data.photoKeys);
  
  await db.update(projectReportItems).set(updateData).where(eq(projectReportItems.id, id));
}

export async function deleteReportItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { projectReportItems } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  
  await db.delete(projectReportItems).where(eq(projectReportItems.id, id));
}
