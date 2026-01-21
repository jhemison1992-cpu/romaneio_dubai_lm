import { eq, and } from "drizzle-orm";
import { getDb } from "./db";

/**
 * Contexto de tenancy com informações da empresa do usuário
 */
export interface TenancyContext {
  userId: number;
  companyId: number;
  role: "admin" | "supervisor" | "technician" | "viewer";
}

/**
 * Obter contexto de tenancy para um usuário
 * Retorna a empresa padrão do usuário (primeira empresa que ele tem acesso)
 */
export async function getTenancyContext(userId: number): Promise<TenancyContext | null> {
  const db = await getDb();
  if (!db) return null;
  const { companyUsers } = await import("../drizzle/schema");
  
  const result = await db
    .select()
    .from(companyUsers)
    .where(eq(companyUsers.userId, userId))
    .limit(1);
  
  if (!result[0]) return null;
  
  return {
    userId,
    companyId: result[0].companyId,
    role: result[0].role,
  };
}

/**
 * Obter contexto de tenancy para um usuário em uma empresa específica
 */
export async function getTenancyContextForCompany(
  userId: number,
  companyId: number
): Promise<TenancyContext | null> {
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
  
  if (!result[0]) return null;
  
  return {
    userId,
    companyId,
    role: result[0].role,
  };
}

/**
 * Verificar se usuário tem acesso a uma empresa
 */
export async function hasAccessToCompany(userId: number, companyId: number): Promise<boolean> {
  const context = await getTenancyContextForCompany(userId, companyId);
  return context !== null;
}

/**
 * Verificar se usuário é admin de uma empresa
 */
export async function isCompanyAdmin(userId: number, companyId: number): Promise<boolean> {
  const context = await getTenancyContextForCompany(userId, companyId);
  return context?.role === "admin" || false;
}

/**
 * Verificar se usuário tem permissão para ação
 */
export async function hasPermission(
  userId: number,
  companyId: number,
  requiredRole: "admin" | "supervisor" | "technician" | "viewer"
): Promise<boolean> {
  const context = await getTenancyContextForCompany(userId, companyId);
  if (!context) return false;
  
  // Hierarquia de permissões: admin > supervisor > technician > viewer
  const roleHierarchy = {
    admin: 4,
    supervisor: 3,
    technician: 2,
    viewer: 1,
  };
  
  return roleHierarchy[context.role] >= roleHierarchy[requiredRole];
}

/**
 * Filtrar dados por empresa
 * Adiciona condição WHERE company_id = ? a uma query
 */
export function withTenancy(companyId: number) {
  return { companyId };
}

/**
 * Validar que um recurso pertence à empresa do usuário
 */
export async function validateResourceBelongsToCompany(
  resourceCompanyId: number,
  userCompanyId: number
): Promise<boolean> {
  return resourceCompanyId === userCompanyId;
}
