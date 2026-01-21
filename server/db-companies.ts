import { eq, and } from "drizzle-orm";
import { getDb } from "./db";

/**
 * Criar nova empresa
 */
export async function createCompany(data: {
  name: string;
  slug: string;
  logoUrl?: string;
  subscriptionPlan?: "pro" | "enterprise";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { companies } = await import("../drizzle/schema");
  
  const result = await db.insert(companies).values({
    name: data.name,
    slug: data.slug,
    logoUrl: data.logoUrl || null,
    subscriptionPlan: data.subscriptionPlan || "pro",
    subscriptionStatus: "active",
  });
  
  return result[0].insertId;
}

/**
 * Obter empresa por ID
 */
export async function getCompanyById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const { companies } = await import("../drizzle/schema");
  
  const result = await db
    .select()
    .from(companies)
    .where(eq(companies.id, id))
    .limit(1);
  
  return result[0] || null;
}

/**
 * Obter empresa por slug
 */
export async function getCompanyBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const { companies } = await import("../drizzle/schema");
  
  const result = await db
    .select()
    .from(companies)
    .where(eq(companies.slug, slug))
    .limit(1);
  
  return result[0] || null;
}

/**
 * Atualizar empresa
 */
export async function updateCompany(id: number, data: {
  name?: string;
  logoUrl?: string;
  subscriptionPlan?: "pro" | "enterprise";
  subscriptionStatus?: "active" | "paused" | "cancelled";
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { companies } = await import("../drizzle/schema");
  
  await db.update(companies).set(data).where(eq(companies.id, id));
}

/**
 * Deletar empresa
 */
export async function deleteCompany(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { companies } = await import("../drizzle/schema");
  
  await db.delete(companies).where(eq(companies.id, id));
}

/**
 * Adicionar usuário à empresa
 */
export async function addUserToCompany(data: {
  userId: number;
  companyId: number;
  role: "admin" | "supervisor" | "technician" | "viewer";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { companyUsers } = await import("../drizzle/schema");
  
  const result = await db.insert(companyUsers).values({
    userId: data.userId,
    companyId: data.companyId,
    role: data.role,
  });
  
  return result[0].insertId;
}

/**
 * Obter usuários de uma empresa
 */
export async function getCompanyUsers(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  const { companyUsers, users } = await import("../drizzle/schema");
  
  return await db
    .select({
      id: companyUsers.id,
      userId: users.id,
      name: users.name,
      email: users.email,
      role: companyUsers.role,
      joinedAt: companyUsers.createdAt,
    })
    .from(companyUsers)
    .leftJoin(users, eq(companyUsers.userId, users.id))
    .where(eq(companyUsers.companyId, companyId));
}

/**
 * Obter papel do usuário em uma empresa
 */
export async function getUserCompanyRole(userId: number, companyId: number) {
  const db = await getDb();
  if (!db) return null;
  const { companyUsers } = await import("../drizzle/schema");
  
  const result = await db
    .select()
    .from(companyUsers)
    .where(
      and(
        eq(companyUsers.userId, userId),
        eq(companyUsers.companyId, companyId)
      )
    )
    .limit(1);
  
  return result[0] || null;
}

/**
 * Atualizar papel do usuário em uma empresa
 */
export async function updateUserCompanyRole(
  userId: number,
  companyId: number,
  role: "admin" | "supervisor" | "technician" | "viewer"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { companyUsers } = await import("../drizzle/schema");
  
  await db
    .update(companyUsers)
    .set({ role })
    .where(
      and(
        eq(companyUsers.userId, userId),
        eq(companyUsers.companyId, companyId)
      )
    );
}

/**
 * Remover usuário de uma empresa
 */
export async function removeUserFromCompany(userId: number, companyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { companyUsers } = await import("../drizzle/schema");
  
  await db
    .delete(companyUsers)
    .where(
      and(
        eq(companyUsers.userId, userId),
        eq(companyUsers.companyId, companyId)
      )
    );
}

/**
 * Obter empresas de um usuário
 */
export async function getUserCompanies(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const { companyUsers, companies } = await import("../drizzle/schema");
  
  return await db
    .select({
      id: companies.id,
      name: companies.name,
      slug: companies.slug,
      logoUrl: companies.logoUrl,
      subscriptionPlan: companies.subscriptionPlan,
      role: companyUsers.role,
    })
    .from(companyUsers)
    .leftJoin(companies, eq(companyUsers.companyId, companies.id))
    .where(eq(companyUsers.userId, userId));
}

/**
 * Verificar se slug já existe
 */
export async function slugExists(slug: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const { companies } = await import("../drizzle/schema");
  
  const result = await db
    .select()
    .from(companies)
    .where(eq(companies.slug, slug))
    .limit(1);
  
  return result.length > 0;
}

/**
 * Gerar slug único a partir de um nome
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
