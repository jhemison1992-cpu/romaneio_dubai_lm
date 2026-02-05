import { getDb } from "./db";
// // import { subscriptions, invoices, paymentMethods, usageTracking } from "../drizzle/schema";
// // Tabelas ainda não implementadas no schema
// import { eq, and } from "drizzle-orm";
// 
// /**
//  * Obter subscrição ativa de uma empresa
//  */
// export async function getActiveSubscription(companyId: number) {
//   const db = await getDb();
//   if (!db) throw new Error("Database connection failed");
//   const result = await db
//     .select()
//     .from(subscriptions)
//     .where(
//       and(
//         eq(subscriptions.companyId, companyId),
//         eq(subscriptions.status, "active")
//       )
//     )
//     .limit(1);
// 
//   return result[0] || null;
// }
// 
// /**
//  * Criar nova subscrição
//  */
// export async function createSubscription(data: {
//   companyId: number;
//   planId: number;
//   billingCycle: "monthly" | "annual";
//   stripeSubscriptionId?: string;
//   stripeCustomerId?: string;
//   currentPeriodStart: Date;
//   currentPeriodEnd: Date;
//   trialEndDate?: Date;
// }) {
//   const db = await getDb();
//   if (!db) throw new Error("Database connection failed");
//   const result = await db.insert(subscriptions).values({
//     ...data,
//     status: "active",
//     isTrialActive: data.trialEndDate ? 1 : 0,
//   });
// 
//   return result;
// }
// 
// /**
//  * Atualizar status da subscrição
//  */
// export async function updateSubscriptionStatus(
//   subscriptionId: number,
//   status: "active" | "paused" | "cancelled" | "expired"
// ) {
//   const db = await getDb();
//   if (!db) throw new Error("Database connection failed");
//   const result = await db
//     .update(subscriptions)
//     .set({
//       status,
//       cancelledAt: status === "cancelled" ? new Date() : undefined,
//     })
//     .where(eq(subscriptions.id, subscriptionId));
// 
//   return result;
// }
// 
// /**
//  * Criar fatura
//  */
// export async function createInvoice(data: {
//   subscriptionId: number;
//   companyId: number;
//   stripeInvoiceId?: string;
//   amount: number;
//   currency?: string;
//   status?: "draft" | "open" | "paid" | "void" | "uncollectible";
//   dueDate?: Date;
//   description?: string;
// }) {
//   const db = await getDb();
//   if (!db) throw new Error("Database connection failed");
//   const result = await db.insert(invoices).values({
//     ...data,
//     currency: data.currency || "USD",
//     status: data.status || "draft",
//   });
// 
//   return result;
// }
// 
// /**
//  * Atualizar status da fatura
//  */
// export async function updateInvoiceStatus(
//   invoiceId: number,
//   status: "draft" | "open" | "paid" | "void" | "uncollectible",
//   paidAt?: Date
// ) {
//   const db = await getDb();
//   if (!db) throw new Error("Database connection failed");
//   const result = await db
//     .update(invoices)
//     .set({
//       status,
//       paidAt: status === "paid" ? paidAt || new Date() : undefined,
//     })
//     .where(eq(invoices.id, invoiceId));
// 
//   return result;
// }
// 
// /**
//  * Obter histórico de faturas de uma empresa
//  */
// export async function getCompanyInvoices(companyId: number, limit = 10) {
//   const db = await getDb();
//   if (!db) throw new Error("Database connection failed");
//   const result = await db
//     .select()
//     .from(invoices)
//     .where(eq(invoices.companyId, companyId))
//     .orderBy((t: any) => t.createdAt)
//     .limit(limit);
// 
//   return result;
// }
// 
// /**
//  * Registrar método de pagamento
//  */
// export async function createPaymentMethod(data: {
//   companyId: number;
//   stripePaymentMethodId: string;
//   type: "card" | "bank_account" | "pix";
//   cardBrand?: string;
//   cardLast4?: string;
//   cardExpMonth?: number;
//   cardExpYear?: number;
//   isDefault?: number;
// }) {
//   const db = await getDb();
//   if (!db) throw new Error("Database connection failed");
//   const result = await db.insert(paymentMethods).values({
//     ...data,
//     isDefault: data.isDefault || 0,
//   });
// 
//   return result;
// }
// 
// /**
//  * Obter métodos de pagamento de uma empresa
//  */
// export async function getCompanyPaymentMethods(companyId: number) {
//   const db = await getDb();
//   if (!db) throw new Error("Database connection failed");
//   const result = await db
//     .select()
//     .from(paymentMethods)
//     .where(eq(paymentMethods.companyId, companyId));
// 
//   return result;
// }
// 
// /**
//  * Rastrear uso de recursos
//  */
// export async function trackUsage(data: {
//   companyId: number;
//   month: string; // YYYY-MM
//   projectsCount?: number;
//   usersCount?: number;
//   storageUsedMB?: number;
//   apiCallsCount?: number;
// }) {
//   // Verificar se já existe registro para este mês
//   const db = await getDb();
//   if (!db) throw new Error("Database connection failed");
//   const existing = await db
//     .select()
//     .from(usageTracking)
//     .where(
//       and(
//         eq(usageTracking.companyId, data.companyId),
//         eq(usageTracking.month, data.month)
//       )
//     )
//     .limit(1);
// 
//   if (existing.length > 0) {
//     // Atualizar
//     if (!db) throw new Error("Database connection failed");
//     return await db
//       .update(usageTracking)
//       .set({
//         projectsCount: data.projectsCount,
//         usersCount: data.usersCount,
//         storageUsedMB: data.storageUsedMB,
//         apiCallsCount: data.apiCallsCount,
//       })
//       .where(
//         and(
//           eq(usageTracking.companyId, data.companyId),
//           eq(usageTracking.month, data.month)
//         )
//       );
//   } else {
//     // Criar novo
//     if (!db) throw new Error("Database connection failed");
//     return await db.insert(usageTracking).values({
//       ...data,
//       projectsCount: data.projectsCount || 0,
//       usersCount: data.usersCount || 0,
//       storageUsedMB: data.storageUsedMB || 0,
//       apiCallsCount: data.apiCallsCount || 0,
//     });
//   }
// }
// 
// /**
//  * Obter uso de recursos de uma empresa
//  */
// export async function getUsageTracking(companyId: number, month: string) {
//   const db = await getDb();
//   if (!db) throw new Error("Database connection failed");
//   const result = await db
//     .select()
//     .from(usageTracking)
//     .where(
//       and(
//         eq(usageTracking.companyId, companyId),
//         eq(usageTracking.month, month)
//       )
//     )
//     .limit(1);
// 
//   return result[0] || null;
// }
