import { eq, and } from "drizzle-orm";
import { getDb } from "./db";

/**
 * Atualizar Stripe Customer ID de uma empresa
 */
export async function updateCompanyStripeCustomerId(
  companyId: number,
  stripeCustomerId: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const { companies } = await import("../drizzle/schema");

  await db
    .update(companies)
    .set({
      stripeCustomerId,
      updatedAt: new Date(),
    })
    .where(eq(companies.id, companyId));
}

/**
 * Atualizar Stripe Subscription ID de uma empresa
 */
export async function updateCompanyStripeSubscriptionId(
  companyId: number,
  stripeSubscriptionId: string,
  subscriptionPlan: "pro" | "enterprise",
  subscriptionStatus: "active" | "paused" | "cancelled" = "active"
) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const { companies } = await import("../drizzle/schema");

  // Calcular data de término da assinatura (30 dias para mensal, 365 para anual)
  const subscriptionEndDate = new Date();
  subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);

  await db
    .update(companies)
    .set({
      stripeSubscriptionId,
      subscriptionPlan,
      subscriptionStatus,
      subscriptionEndDate,
      updatedAt: new Date(),
    })
    .where(eq(companies.id, companyId));
}

/**
 * Obter empresa por Stripe Customer ID
 */
export async function getCompanyByStripeCustomerId(stripeCustomerId: string) {
  const db = await getDb();
  if (!db) return null;

  const { companies } = await import("../drizzle/schema");

  const result = await db
    .select()
    .from(companies)
    .where(eq(companies.stripeCustomerId, stripeCustomerId))
    .limit(1);

  return result[0] || null;
}

/**
 * Verificar se empresa tem assinatura ativa
 */
export async function hasActiveSubscription(companyId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const { companies } = await import("../drizzle/schema");

  const result = await db
    .select()
    .from(companies)
    .where(
      and(
        eq(companies.id, companyId),
        eq(companies.subscriptionStatus, "active")
      )
    )
    .limit(1);

  return result.length > 0;
}

/**
 * Obter status de assinatura de uma empresa
 */
export async function getSubscriptionStatus(companyId: number) {
  const db = await getDb();
  if (!db) return null;

  const { companies } = await import("../drizzle/schema");

  const result = await db
    .select({
      plan: companies.subscriptionPlan,
      status: companies.subscriptionStatus,
      endDate: companies.subscriptionEndDate,
      stripeSubscriptionId: companies.stripeSubscriptionId,
    })
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1);

  return result[0] || null;
}

/**
 * Registrar histórico de mudança de plano
 */
export async function recordSubscriptionChange(data: {
  companyId: number;
  oldPlan: string;
  newPlan: string;
  oldStatus: string;
  newStatus: string;
  stripeSubscriptionId: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  // Aqui você poderia criar uma tabela de histórico se necessário
  // Por enquanto, apenas registramos no console
  console.log("[Subscription Change]", {
    companyId: data.companyId,
    from: `${data.oldPlan}/${data.oldStatus}`,
    to: `${data.newPlan}/${data.newStatus}`,
    stripeId: data.stripeSubscriptionId,
    timestamp: new Date(),
  });
}

/**
 * Cancelar assinatura de uma empresa
 */
export async function cancelSubscription(companyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const { companies } = await import("../drizzle/schema");

  await db
    .update(companies)
    .set({
      subscriptionStatus: "cancelled",
      updatedAt: new Date(),
    })
    .where(eq(companies.id, companyId));
}

/**
 * Pausar assinatura de uma empresa
 */
export async function pauseSubscription(companyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const { companies } = await import("../drizzle/schema");

  await db
    .update(companies)
    .set({
      subscriptionStatus: "paused",
      updatedAt: new Date(),
    })
    .where(eq(companies.id, companyId));
}

/**
 * Reativar assinatura de uma empresa
 */
export async function resumeSubscription(companyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const { companies } = await import("../drizzle/schema");

  await db
    .update(companies)
    .set({
      subscriptionStatus: "active",
      updatedAt: new Date(),
    })
    .where(eq(companies.id, companyId));
}
