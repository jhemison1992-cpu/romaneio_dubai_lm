import { eq, and } from "drizzle-orm";
import { getDb } from "./db";

/**
 * Criar convite para novo usuário
 */
export async function createInvite(data: {
  email: string;
  companyId: number;
  role: "admin" | "supervisor" | "technician" | "viewer";
  invitedBy: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  // Gerar token único para o convite
  const token = generateInviteToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias

  // Aqui você pode salvar em uma tabela de invites
  // Por enquanto, vamos usar uma abordagem simplificada
  return {
    token,
    email: data.email,
    companyId: data.companyId,
    role: data.role,
    expiresAt,
  };
}

/**
 * Gerar token único para convite
 */
function generateInviteToken(): string {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
}

/**
 * Aceitar convite e criar usuário
 */
export async function acceptInvite(data: {
  token: string;
  email: string;
  name: string;
  openId: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  // Aqui você verificaria se o token é válido
  // Por enquanto, vamos criar o usuário diretamente
  const { users, companyUsers } = await import("../drizzle/schema");

  // Verificar se usuário já existe
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, data.email))
    .limit(1);

  let userId: number;

  if (existingUser[0]) {
    userId = existingUser[0].id;
  } else {
    // Criar novo usuário com openId obrigatório
    await db.insert(users).values({
      openId: data.openId,
      email: data.email,
      name: data.name,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    });
    // Obter o ID do usuário criado
    const newUser = await db
      .select()
      .from(users)
      .where(eq(users.openId, data.openId))
      .limit(1);
    userId = newUser[0]?.id || 0;
  }

  return userId;
}

/**
 * Listar todos os usuários de uma empresa
 */
export async function getCompanyUsersWithDetails(companyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const { users, companyUsers } = await import("../drizzle/schema");

  return await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: companyUsers.role,
      joinedAt: companyUsers.createdAt,
    })
    .from(companyUsers)
    .innerJoin(users, eq(companyUsers.userId, users.id))
    .where(eq(companyUsers.companyId, companyId));
}

/**
 * Remover usuário de empresa
 */
export async function removeUserFromCompany(userId: number, companyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

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
 * Atualizar papel do usuário na empresa
 */
export async function updateUserRole(
  userId: number,
  companyId: number,
  newRole: "admin" | "supervisor" | "technician" | "viewer"
) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const { companyUsers } = await import("../drizzle/schema");

  await db
    .update(companyUsers)
    .set({ role: newRole, updatedAt: new Date() })
    .where(
      and(
        eq(companyUsers.userId, userId),
        eq(companyUsers.companyId, companyId)
      )
    );
}

/**
 * Verificar se email já está convidado para empresa
 */
export async function isEmailInvitedToCompany(
  email: string,
  companyId: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const { users, companyUsers } = await import("../drizzle/schema");

  const result = await db
    .select()
    .from(companyUsers)
    .innerJoin(users, eq(companyUsers.userId, users.id))
    .where(
      and(
        eq(users.email, email),
        eq(companyUsers.companyId, companyId)
      )
    )
    .limit(1);

  return result.length > 0;
}
