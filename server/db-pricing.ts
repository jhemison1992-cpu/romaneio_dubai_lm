import { eq } from "drizzle-orm";
// import { getDb } from "./db";
// 
// /**
//  * Obter todos os planos de preço ativos
//  */
// export async function getAllPricingPlans() {
//   const db = await getDb();
//   if (!db) return [];
//   const { pricingPlans } = await import("../drizzle/schema");
//   
//   return await db
//     .select()
//     .from(pricingPlans)
//     .where(eq(pricingPlans.isActive, 1))
//     .orderBy(pricingPlans.displayOrder);
// }
// 
// /**
//  * Obter plano de preço por slug
//  */
// export async function getPricingPlanBySlug(slug: string) {
//   const db = await getDb();
//   if (!db) return null;
//   const { pricingPlans } = await import("../drizzle/schema");
//   
//   const result = await db
//     .select()
//     .from(pricingPlans)
//     .where(eq(pricingPlans.slug, slug))
//     .limit(1);
//   
//   return result[0] || null;
// }
// 
// /**
//  * Obter plano de preço por ID
//  */
// export async function getPricingPlanById(id: number) {
//   const db = await getDb();
//   if (!db) return null;
//   const { pricingPlans } = await import("../drizzle/schema");
//   
//   const result = await db
//     .select()
//     .from(pricingPlans)
//     .where(eq(pricingPlans.id, id))
//     .limit(1);
//   
//   return result[0] || null;
// }
// 
// /**
//  * Obter plano de preço atual de uma empresa
//  */
// export async function getCompanyPricingPlan(companyId: number) {
//   const db = await getDb();
//   if (!db) return null;
//   const { companies, pricingPlans } = await import("../drizzle/schema");
//   
//   const result = await db
//     .select({
//       plan: pricingPlans,
//       company: companies,
//     })
//     .from(companies)
//     .leftJoin(pricingPlans, eq(companies.subscriptionPlan, pricingPlans.slug))
//     .where(eq(companies.id, companyId))
//     .limit(1);
//   
//   return result[0] || null;
// }
// 
// /**
//  * Registrar mudança de plano no histórico
//  */
// export async function recordPlanChange(data: {
//   companyId: number;
//   planId: number;
//   billingCycle: "monthly" | "annual";
//   previousPlanId?: number;
//   changeReason?: string;
// }) {
//   const db = await getDb();
//   if (!db) throw new Error("Database not available");
//   const { subscriptionHistory } = await import("../drizzle/schema");
//   
//   await db.insert(subscriptionHistory).values({
//     companyId: data.companyId,
//     planId: data.planId,
//     billingCycle: data.billingCycle,
//     previousPlanId: data.previousPlanId,
//     changeReason: data.changeReason,
//     effectiveDate: new Date(),
//   });
// }
// 
// /**
//  * Obter histórico de mudanças de plano de uma empresa
//  */
// export async function getSubscriptionHistory(companyId: number) {
//   const db = await getDb();
//   if (!db) return [];
//   const { subscriptionHistory } = await import("../drizzle/schema");
//   
//   return await db
//     .select()
//     .from(subscriptionHistory)
//     .where(eq(subscriptionHistory.companyId, companyId));
// }
// 
// /**
//  * Calcular preço com desconto anual
//  * Retorna o preço em centavos
//  */
// export function calculateAnnualDiscount(monthlyPrice: number, annualPrice: number): number {
//   const monthlyTotal = monthlyPrice * 12;
//   const discountPercentage = ((monthlyTotal - annualPrice) / monthlyTotal) * 100;
//   return Math.round(discountPercentage);
// }
// 
// /**
//  * Formatar preço em USD
//  */
// export function formatPrice(priceInCents: number): string {
//   return `$${(priceInCents / 100).toFixed(2)}`;
// }
// 
// /**
//  * Obter informações de limite de plano
//  */
// export async function getPlanLimits(planSlug: string) {
//   const plan = await getPricingPlanBySlug(planSlug);
//   if (!plan) return null;
//   
//   return {
//     maxProjects: plan.maxProjects || Infinity,
//     maxUsers: plan.maxUsers || Infinity,
//     maxMediaSize: plan.maxMediaSize || Infinity,
//     features: plan.features as string[] || [],
//   };
// }
