import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Environments queries
export async function getAllEnvironments() {
  const db = await getDb();
  if (!db) return [];
  const { environments } = await import("../drizzle/schema");
  return await db.select().from(environments);
}

export async function seedEnvironments() {
  const db = await getDb();
  if (!db) return;
  const { environments } = await import("../drizzle/schema");
  
  const existingEnvs = await db.select().from(environments).limit(1);
  if (existingEnvs.length > 0) return; // Already seeded
  
  const envData = [
    { projectId: 1, name: "Piscina Coberta", caixilhoCode: "AL 008 (CA08)", caixilhoType: "Fixo 4 Módulos com Bandeira de Tela, com Travessa - Linha-32", quantity: 4 },
    { projectId: 1, name: "Piscina Coberta", caixilhoCode: "AL 010 (CA10)", caixilhoType: "Porta de Giro com Fixo na Lateral com 3 Módulos com Bandeira Fixa com Tela (Ventilação Permanente) - Linha-32", quantity: 1 },
    { projectId: 1, name: "Entrada Social", caixilhoCode: "AL 011 (CA12)", caixilhoType: "Porta de Giro 2 Folhas com Travessa - Linha-32", quantity: 1 },
    { projectId: 1, name: "Entrada Serviço", caixilhoCode: "AL 012 (CA13)", caixilhoType: "Porta de Giro 2 Folhas com Travessa e Passa Pizza - Linha-32", quantity: 1 },
    { projectId: 1, name: "Abrigo de Gás", caixilhoCode: "AL 015 (PA3)", caixilhoType: "Portinhola Veneziana 3 Folhas Ventilada - Linha ALU-025", quantity: 1 },
    { projectId: 1, name: "Salão de Festas", caixilhoCode: "AL 019 (PB4)", caixilhoType: "Porta de Correr 2 Folhas com 2 Fixos nas Laterais - Linha ALU-32", quantity: 2 },
    { projectId: 1, name: "SPA", caixilhoCode: "AL 019 (PB4)", caixilhoType: "Porta de Correr 2 Folhas com 2 Fixos nas Laterais - Linha ALU-32", quantity: 1 },
    { projectId: 1, name: "Aquecedor Piscina", caixilhoCode: "AL 023 (VN7)", caixilhoType: "Portinhola de Giro 2 Folhas com Veneziana (Ventilação Permanente) - Linha ALU-025", quantity: 1 },
    { projectId: 1, name: "Aquecedor Piscina", caixilhoCode: "AL 024 (VN8)", caixilhoType: "Fixo com Ventilação Permanente - Linha ALU-025", quantity: 1 },
    { projectId: 1, name: "Casa de Bombas", caixilhoCode: "AL 027 (VN11)", caixilhoType: "Fixo com Ventilação Permanente - Linha ALU-025", quantity: 1 },
    { projectId: 1, name: "Sauna", caixilhoCode: "AL 029 (PA4)", caixilhoType: "Porta de Giro Lambril com Visor de Vidro - Linha ALU-032", quantity: 1 },
    { projectId: 1, name: "Shaft Hidráulica", caixilhoCode: "AL 034 (PA6)", caixilhoType: "Porta de Giro Veneziana 4 Folhas Ventilada - Linha ALU-025", quantity: 1 },
  ];
  
  await db.insert(environments).values(envData);
}

// Inspections queries
export async function createInspection(projectId: number, userId: number, title: string, companyId: number = 1) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { inspections } = await import("../drizzle/schema");
  const result = await db.insert(inspections).values({ companyId, projectId, userId, title });
  return result[0].insertId;
}

export async function getInspectionsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const { inspections } = await import("../drizzle/schema");
  return await db.select().from(inspections).where(eq(inspections.userId, userId));
}

export async function getAllInspections() {
  const db = await getDb();
  if (!db) return [];
  const { inspections } = await import("../drizzle/schema");
  return await db.select().from(inspections);
}

export async function getInspectionById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const { inspections } = await import("../drizzle/schema");
  const result = await db.select().from(inspections).where(eq(inspections.id, id)).limit(1);
  return result[0] || null;
}

export async function updateInspectionStatus(id: number, status: "draft" | "in_progress" | "completed") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { inspections } = await import("../drizzle/schema");
  await db.update(inspections).set({ status }).where(eq(inspections.id, id));
}

export async function updateInspectionTitle(id: number, title: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { inspections } = await import("../drizzle/schema");
  await db.update(inspections).set({ title }).where(eq(inspections.id, id));
}

export async function deleteInspection(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { inspections } = await import("../drizzle/schema");
  await db.delete(inspections).where(eq(inspections.id, id));
}

// Inspection Items queries
export async function getInspectionItems(inspectionId: number) {
  const db = await getDb();
  if (!db) return [];
  const { inspectionItems, environments } = await import("../drizzle/schema");
  return await db.select({
    id: inspectionItems.id,
    inspectionId: inspectionItems.inspectionId,
    environmentId: inspectionItems.environmentId,
    releaseDate: inspectionItems.releaseDate,
    responsibleConstruction: inspectionItems.responsibleConstruction,
    responsibleSupplier: inspectionItems.responsibleSupplier,
    observations: inspectionItems.observations,
    environmentName: environments.name,
    caixilhoCode: environments.caixilhoCode,
    caixilhoType: environments.caixilhoType,
    quantity: environments.quantity,
  }).from(inspectionItems)
    .leftJoin(environments, eq(inspectionItems.environmentId, environments.id))
    .where(eq(inspectionItems.inspectionId, inspectionId));
}

export async function getInspectionItemById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const { inspectionItems } = await import("../drizzle/schema");
  const result = await db.select().from(inspectionItems).where(eq(inspectionItems.id, id)).limit(1);
  return result[0] || null;
}

export async function upsertInspectionItem(data: {
  id?: number;
  inspectionId: number;
  environmentId: number;
  companyId?: number;
  releaseDate?: Date | string | null;
  responsibleConstruction?: string | null;
  responsibleSupplier?: string | null;
  observations?: string | null;
  signatureConstruction?: string | null;
  signatureSupplier?: string | null;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { inspectionItems } = await import("../drizzle/schema");
  
  if (data.id) {
    // Converter releaseDate se for string
    let releaseDateValue: Date | null = null;
    if (data.releaseDate) {
      if (data.releaseDate instanceof Date) {
        releaseDateValue = data.releaseDate;
      } else if (typeof data.releaseDate === 'string' && data.releaseDate.length === 10) {
        // Converter YYYY-MM-DD para Date usando UTC
        const parts = data.releaseDate.split('-').map(Number);
        releaseDateValue = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
      } else if (typeof data.releaseDate === 'string') {
        releaseDateValue = new Date(data.releaseDate);
      }
    }
    
    await db.update(inspectionItems).set({
      releaseDate: releaseDateValue,
      responsibleConstruction: data.responsibleConstruction,
      responsibleSupplier: data.responsibleSupplier,
      observations: data.observations,
      signatureConstruction: data.signatureConstruction,
      signatureSupplier: data.signatureSupplier,
    }).where(eq(inspectionItems.id, data.id));
    return data.id;
  } else {
    // Converter releaseDate se for string
    let releaseDateValue: Date | null = null;
    if (data.releaseDate) {
      if (data.releaseDate instanceof Date) {
        releaseDateValue = data.releaseDate;
      } else if (typeof data.releaseDate === 'string' && data.releaseDate.length === 10) {
        // Converter YYYY-MM-DD para Date usando UTC
        const parts = data.releaseDate.split('-').map(Number);
        releaseDateValue = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
      } else if (typeof data.releaseDate === 'string') {
        releaseDateValue = new Date(data.releaseDate);
      }
    }
    
    const result = await db.insert(inspectionItems).values({
      companyId: data.companyId ?? 1,
      inspectionId: data.inspectionId,
      environmentId: data.environmentId,
      releaseDate: releaseDateValue,
      responsibleConstruction: data.responsibleConstruction ?? null,
      responsibleSupplier: data.responsibleSupplier ?? null,
      observations: data.observations ?? null,
      signatureConstruction: data.signatureConstruction ?? null,
      signatureSupplier: data.signatureSupplier ?? null,
    });
    return result[0].insertId;
  }
}

export async function saveDeliveryTerm(
  inspectionItemId: number,
  responsibleName: string,
  signature: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { inspectionItems } = await import("../drizzle/schema");
  
  await db.update(inspectionItems).set({
    deliveryTermResponsible: responsibleName,
    deliveryTermSignature: signature,
  }).where(eq(inspectionItems.id, inspectionItemId));
}

// Media Files queries
export async function saveMediaFile(data: {
  inspectionItemId: number;
  fileKey: string;
  fileUrl: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  mediaType: "photo" | "video";
  comment?: string | null;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { mediaFiles } = await import("../drizzle/schema");
  const result = await db.insert(mediaFiles).values(data);
  return result[0].insertId;
}

export async function getMediaFilesByItem(inspectionItemId: number) {
  const db = await getDb();
  if (!db) return [];
  const { mediaFiles } = await import("../drizzle/schema");
  return await db.select().from(mediaFiles).where(eq(mediaFiles.inspectionItemId, inspectionItemId));
}

export async function updateMediaComment(id: number, comment: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { mediaFiles } = await import("../drizzle/schema");
  await db.update(mediaFiles).set({ comment }).where(eq(mediaFiles.id, id));
}

export async function deleteMediaFile(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { mediaFiles } = await import("../drizzle/schema");
  await db.delete(mediaFiles).where(eq(mediaFiles.id, id));
}

// App Users (sistema de autenticação próprio)
export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  const { appUsers } = await import("../drizzle/schema");
  return await db.select().from(appUsers).where(eq(appUsers.active, 1));
}

export async function createUser(data: {
  username: string;
  password: string;
  fullName: string;
  role: "user" | "admin";
  profilePhoto?: string | null;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { appUsers } = await import("../drizzle/schema");
  const { hashPassword } = await import("./auth");
  
  const passwordHash = await hashPassword(data.password);
  
  const result = await db.insert(appUsers).values({
    username: data.username,
    passwordHash,
    name: data.fullName,
    role: data.role,
    profilePhoto: data.profilePhoto || null,
    active: 1,
  });
  
  return result[0].insertId;
}

export async function updateUser(id: number, data: {
  username?: string;
  password?: string;
  fullName?: string;
  role?: "user" | "admin";
  profilePhoto?: string | null;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { appUsers } = await import("../drizzle/schema");
  const { hashPassword } = await import("./auth");
  
  const updateData: any = {};
  
  if (data.username !== undefined) updateData.username = data.username;
  if (data.fullName !== undefined) updateData.name = data.fullName;
  if (data.role !== undefined) updateData.role = data.role;
  if (data.profilePhoto !== undefined) updateData.profilePhoto = data.profilePhoto;
  
  // Se senha foi fornecida, fazer hash
  if (data.password) {
    updateData.passwordHash = await hashPassword(data.password);
  }
  
  await db.update(appUsers).set(updateData).where(eq(appUsers.id, id));
}

export async function deleteUser(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { appUsers } = await import("../drizzle/schema");
  // Soft delete: marca como inativo ao invés de excluir
  await db.update(appUsers).set({ active: 0 }).where(eq(appUsers.id, id));
}

// Signatures
export async function updateSignature(
  inspectionItemId: number,
  type: "construction" | "supplier",
  signatureData: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { inspectionItems } = await import("../drizzle/schema");
  
  const field = type === "construction" ? "signatureConstruction" : "signatureSupplier";
  await db.update(inspectionItems).set({ [field]: signatureData }).where(eq(inspectionItems.id, inspectionItemId));
}


// Inspection Environments queries
export async function getInspectionEnvironments(inspectionId: number) {
  const db = await getDb();
  if (!db) return [];
  const { inspectionEnvironments } = await import("../drizzle/schema");
  return await db.select().from(inspectionEnvironments).where(eq(inspectionEnvironments.inspectionId, inspectionId));
}

export async function createInspectionEnvironment(data: {
  inspectionId: number;
  companyId?: number;
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
  const { inspectionEnvironments } = await import("../drizzle/schema");
  
  // Converter strings de data para Date
  const values: any = {
    ...data,
    companyId: data.companyId ?? 1,
    startDate: data.startDate ? new Date(data.startDate) : undefined,
    endDate: data.endDate ? new Date(data.endDate) : undefined,
  };
  
  const result = await db.insert(inspectionEnvironments).values(values);
  return result[0].insertId;
}

export async function updateInspectionEnvironment(id: number, data: {
  name?: string;
  caixilhoCode?: string;
  caixilhoType?: string;
  quantity?: number;
  plantaFileKey?: string;
  plantaFileUrl?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { inspectionEnvironments } = await import("../drizzle/schema");
  await db.update(inspectionEnvironments).set(data).where(eq(inspectionEnvironments.id, id));
}

export async function deleteInspectionEnvironment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { inspectionEnvironments } = await import("../drizzle/schema");
  await db.delete(inspectionEnvironments).where(eq(inspectionEnvironments.id, id));
}


// Labor Items (Mão de obra)
export async function getLaborItems(inspectionEnvironmentId: number) {
  const db = await getDb();
  if (!db) return [];
  const { laborItems } = await import("../drizzle/schema");
  return await db.select().from(laborItems).where(eq(laborItems.inspectionEnvironmentId, inspectionEnvironmentId));
}

export async function createLaborItem(data: {
  inspectionEnvironmentId: number;
  companyId?: number;
  profession: string;
  name: string;
  hours: string;
  notes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { laborItems } = await import("../drizzle/schema");
  
  const result = await db.insert(laborItems).values({
    ...data,
    companyId: data.companyId ?? 1,
  });
  return result[0].insertId;
}

export async function updateLaborItem(id: number, data: {
  profession?: string;
  name?: string;
  hours?: string;
  notes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { laborItems } = await import("../drizzle/schema");
  await db.update(laborItems).set(data).where(eq(laborItems.id, id));
}

export async function deleteLaborItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { laborItems } = await import("../drizzle/schema");
  await db.delete(laborItems).where(eq(laborItems.id, id));
}

// Equipment Items (Equipamentos)
export async function getEquipmentItems(inspectionEnvironmentId: number) {
  const db = await getDb();
  if (!db) return [];
  const { equipmentItems } = await import("../drizzle/schema");
  return await db.select().from(equipmentItems).where(eq(equipmentItems.inspectionEnvironmentId, inspectionEnvironmentId));
}

export async function createEquipmentItem(data: {
  inspectionEnvironmentId: number;
  companyId?: number;
  name: string;
  quantity: number;
  unit: string;
  notes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { equipmentItems } = await import("../drizzle/schema");
  
  const result = await db.insert(equipmentItems).values({
    ...data,
    companyId: data.companyId ?? 1,
  });
  return result[0].insertId;
}

export async function updateEquipmentItem(id: number, data: {
  name?: string;
  quantity?: number;
  unit?: string;
  notes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { equipmentItems } = await import("../drizzle/schema");
  await db.update(equipmentItems).set(data).where(eq(equipmentItems.id, id));
}

export async function deleteEquipmentItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { equipmentItems } = await import("../drizzle/schema");
  await db.delete(equipmentItems).where(eq(equipmentItems.id, id));
}

// Activity Items (Atividades)
export async function getActivityItems(inspectionEnvironmentId: number) {
  const db = await getDb();
  if (!db) return [];
  const { activityItems } = await import("../drizzle/schema");
  return await db.select().from(activityItems).where(eq(activityItems.inspectionEnvironmentId, inspectionEnvironmentId));
}

export async function createActivityItem(data: {
  inspectionEnvironmentId: number;
  companyId?: number;
  description: string;
  status?: "pendente" | "em_andamento" | "concluida";
  notes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { activityItems } = await import("../drizzle/schema");
  
  const result = await db.insert(activityItems).values({
    ...data,
    companyId: data.companyId ?? 1,
    status: data.status ?? "pendente",
  });
  return result[0].insertId;
}

export async function updateActivityItem(id: number, data: {
  description?: string;
  status?: "pendente" | "em_andamento" | "concluida";
  notes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { activityItems } = await import("../drizzle/schema");
  await db.update(activityItems).set(data).where(eq(activityItems.id, id));
}

export async function deleteActivityItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { activityItems } = await import("../drizzle/schema");
  await db.delete(activityItems).where(eq(activityItems.id, id));
}

// Occurrence Items (Ocorrências)
export async function getOccurrenceItems(inspectionEnvironmentId: number) {
  const db = await getDb();
  if (!db) return [];
  const { occurrenceItems } = await import("../drizzle/schema");
  return await db.select().from(occurrenceItems).where(eq(occurrenceItems.inspectionEnvironmentId, inspectionEnvironmentId));
}

export async function createOccurrenceItem(data: {
  inspectionEnvironmentId: number;
  companyId?: number;
  description: string;
  severity?: "baixa" | "media" | "alta";
  status?: "aberta" | "em_resolucao" | "resolvida";
  notes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { occurrenceItems } = await import("../drizzle/schema");
  
  const result = await db.insert(occurrenceItems).values({
    ...data,
    companyId: data.companyId ?? 1,
    severity: data.severity ?? "media",
    status: data.status ?? "aberta",
  });
  return result[0].insertId;
}

export async function updateOccurrenceItem(id: number, data: {
  description?: string;
  severity?: "baixa" | "media" | "alta";
  status?: "aberta" | "em_resolucao" | "resolvida";
  notes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { occurrenceItems } = await import("../drizzle/schema");
  await db.update(occurrenceItems).set(data).where(eq(occurrenceItems.id, id));
}

export async function deleteOccurrenceItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { occurrenceItems } = await import("../drizzle/schema");
  await db.delete(occurrenceItems).where(eq(occurrenceItems.id, id));
}

// Received Material Items (Materiais recebidos)
export async function getReceivedMaterialItems(inspectionEnvironmentId: number) {
  const db = await getDb();
  if (!db) return [];
  const { receivedMaterialItems } = await import("../drizzle/schema");
  return await db.select().from(receivedMaterialItems).where(eq(receivedMaterialItems.inspectionEnvironmentId, inspectionEnvironmentId));
}

export async function createReceivedMaterialItem(data: {
  inspectionEnvironmentId: number;
  companyId?: number;
  name: string;
  quantity: number;
  unit: string;
  receivedDate: string | Date;
  notes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { receivedMaterialItems } = await import("../drizzle/schema");
  
  const receivedDate = typeof data.receivedDate === 'string' ? new Date(data.receivedDate) : data.receivedDate;
  
  const result = await db.insert(receivedMaterialItems).values({
    ...data,
    companyId: data.companyId ?? 1,
    receivedDate,
  });
  return result[0].insertId;
}

export async function updateReceivedMaterialItem(id: number, data: {
  name?: string;
  quantity?: number;
  unit?: string;
  receivedDate?: string | Date;
  notes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { receivedMaterialItems } = await import("../drizzle/schema");
  
  const updateData: any = { ...data };
  if (data.receivedDate) {
    updateData.receivedDate = typeof data.receivedDate === 'string' ? new Date(data.receivedDate) : data.receivedDate;
  }
  
  await db.update(receivedMaterialItems).set(updateData).where(eq(receivedMaterialItems.id, id));
}

export async function deleteReceivedMaterialItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { receivedMaterialItems } = await import("../drizzle/schema");
  await db.delete(receivedMaterialItems).where(eq(receivedMaterialItems.id, id));
}

// Used Material Items (Materiais utilizados)
export async function getUsedMaterialItems(inspectionEnvironmentId: number) {
  const db = await getDb();
  if (!db) return [];
  const { usedMaterialItems } = await import("../drizzle/schema");
  return await db.select().from(usedMaterialItems).where(eq(usedMaterialItems.inspectionEnvironmentId, inspectionEnvironmentId));
}

export async function createUsedMaterialItem(data: {
  inspectionEnvironmentId: number;
  companyId?: number;
  name: string;
  quantity: number;
  unit: string;
  notes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { usedMaterialItems } = await import("../drizzle/schema");
  
  const result = await db.insert(usedMaterialItems).values({
    ...data,
    companyId: data.companyId ?? 1,
  });
  return result[0].insertId;
}

export async function updateUsedMaterialItem(id: number, data: {
  name?: string;
  quantity?: number;
  unit?: string;
  notes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { usedMaterialItems } = await import("../drizzle/schema");
  await db.update(usedMaterialItems).set(data).where(eq(usedMaterialItems.id, id));
}

export async function deleteUsedMaterialItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { usedMaterialItems } = await import("../drizzle/schema");
  await db.delete(usedMaterialItems).where(eq(usedMaterialItems.id, id));
}

// Comment Items (Comentários)
export async function getCommentItems(inspectionEnvironmentId: number) {
  const db = await getDb();
  if (!db) return [];
  const { commentItems } = await import("../drizzle/schema");
  return await db.select().from(commentItems).where(eq(commentItems.inspectionEnvironmentId, inspectionEnvironmentId));
}

export async function createCommentItem(data: {
  inspectionEnvironmentId: number;
  companyId?: number;
  author: string;
  content: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { commentItems } = await import("../drizzle/schema");
  
  const result = await db.insert(commentItems).values({
    ...data,
    companyId: data.companyId ?? 1,
  });
  return result[0].insertId;
}

export async function updateCommentItem(id: number, data: {
  author?: string;
  content?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { commentItems } = await import("../drizzle/schema");
  await db.update(commentItems).set(data).where(eq(commentItems.id, id));
}

export async function deleteCommentItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { commentItems } = await import("../drizzle/schema");
  await db.delete(commentItems).where(eq(commentItems.id, id));
}


// Helper functions for delivery report PDF
export async function getInspectionEnvironmentById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const { inspectionEnvironments } = await import("../drizzle/schema");
  const result = await db.select().from(inspectionEnvironments).where(eq(inspectionEnvironments.id, id));
  return result[0] || null;
}

export async function getProjectById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const { projects } = await import("../drizzle/schema");
  const result = await db.select().from(projects).where(eq(projects.id, id));
  return result[0] || null;
}

export async function getInspectionItemByEnvironmentId(environmentId: number) {
  const db = await getDb();
  if (!db) return null;
  const { inspectionItems } = await import("../drizzle/schema");
  const result = await db.select().from(inspectionItems).where(eq(inspectionItems.environmentId, environmentId));
  return result[0] || null;
}

// Media files are linked to inspectionItems, not directly to environments
// This function is not needed for the PDF generation
