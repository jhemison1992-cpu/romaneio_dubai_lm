import Stripe from "stripe";
// import { getDb } from "./db";
// import { companies, pricingPlans } from "../drizzle/schema";
// import { eq } from "drizzle-orm";
// 
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
// // Note: apiVersion is handled automatically by the Stripe SDK
// 
// /**
//  * Criar Stripe customer para uma empresa
//  */
// export async function createStripeCustomer(companyId: number, email: string, name: string) {
//   const db = await getDb();
//   if (!db) throw new Error("Database connection failed");
// 
//   // Verificar se já existe customer
//   const company = await db
//     .select()
//     .from(companies)
//     .where(eq(companies.id, companyId))
//     .limit(1);
// 
//   if (company.length === 0) {
//     throw new Error("Company not found");
//   }
// 
//   if (company[0].stripeCustomerId) {
//     return company[0].stripeCustomerId;
//   }
// 
//   // Criar novo customer
//   const customer = await stripe.customers.create({
//     email,
//     name,
//     metadata: {
//       companyId: companyId.toString(),
//     },
//   });
// 
//   // Salvar ID do customer
//   await db
//     .update(companies)
//     .set({ stripeCustomerId: customer.id })
//     .where(eq(companies.id, companyId));
// 
//   return customer.id;
// }
// 
// /**
//  * Criar checkout session para subscrição
//  */
// export async function createCheckoutSession(
//   companyId: number,
//   planSlug: string,
//   billingCycle: "monthly" | "annual",
//   email: string,
//   name: string,
//   successUrl: string,
//   cancelUrl: string
// ) {
//   const db = await getDb();
//   if (!db) throw new Error("Database connection failed");
// 
//   // Obter plano
//   const plan = await db
//     .select()
//     .from(pricingPlans)
//     .where(eq(pricingPlans.slug, planSlug))
//     .limit(1);
// 
//   if (plan.length === 0) {
//     throw new Error("Pricing plan not found");
//   }
// 
//   const pricingPlan = plan[0];
// 
//   // Obter ou criar Stripe customer
//   const customerId = await createStripeCustomer(companyId, email, name);
// 
//   // Obter Stripe price ID
//   const stripePriceId =
//     billingCycle === "monthly"
//       ? pricingPlan.stripePriceIdMonthly
//       : pricingPlan.stripePriceIdAnnual;
// 
//   if (!stripePriceId) {
//     throw new Error(`Stripe price ID not configured for plan ${planSlug}`);
//   }
// 
//   // Criar checkout session
//   const session = await stripe.checkout.sessions.create({
//     customer: customerId,
//     line_items: [
//       {
//         price: stripePriceId,
//         quantity: 1,
//       },
//     ],
//     mode: "subscription",
//     success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
//     cancel_url: cancelUrl,
//     metadata: {
//       companyId: companyId.toString(),
//       planId: pricingPlan.id.toString(),
//       billingCycle,
//     },
//     allow_promotion_codes: true,
//   });
// 
//   return session;
// }
// 
// /**
//  * Processar webhook de checkout completo
//  */
// export async function handleCheckoutSessionCompleted(
//   sessionId: string
// ) {
//   const db = await getDb();
//   if (!db) throw new Error("Database connection failed");
// 
//   // Obter sessão do Stripe
//   const session = await stripe.checkout.sessions.retrieve(sessionId, {
//     expand: ["subscription"],
//   });
// 
//   if (!session.metadata?.companyId || !session.metadata?.planId) {
//     throw new Error("Invalid session metadata");
//   }
// 
//   const companyId = parseInt(session.metadata.companyId);
//   const planId = parseInt(session.metadata.planId);
//   const billingCycle = (session.metadata.billingCycle || "monthly") as "monthly" | "annual";
// 
//   // Obter subscrição do Stripe
//   const subscription = session.subscription as Stripe.Subscription;
// 
//   if (!subscription) {
//     throw new Error("Subscription not found in session");
//   }
// 
//   // Calcular datas
//   const currentPeriodStart = new Date((subscription as any).current_period_start * 1000);
//   const currentPeriodEnd = new Date((subscription as any).current_period_end * 1000);
// 
//   // Criar subscrição no banco de dados
//   await db.insert(subscriptions).values({
//     companyId,
//     planId,
//     billingCycle,
//     stripeSubscriptionId: subscription.id,
//     stripeCustomerId: session.customer as string,
//     currentPeriodStart,
//     currentPeriodEnd,
//     status: "active",
//     isTrialActive: 0,
//   });
// 
//   // Atualizar company
//   await db
//     .update(companies)
//     .set({
//       stripeCustomerId: session.customer as string,
//       stripeSubscriptionId: subscription.id,
//     })
//     .where(eq(companies.id, companyId));
// 
//   return {
//     companyId,
//     subscriptionId: subscription.id,
//   };
// }
// 
// /**
//  * Processar webhook de atualização de subscrição
//  */
// export async function handleSubscriptionUpdated(
//   stripeSubscriptionId: string
// ) {
//   const db = await getDb();
//   if (!db) throw new Error("Database connection failed");
// 
//   // Obter subscrição do Stripe
//   const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
// 
//   // Atualizar no banco de dados
//   const dbSubscriptions = await db
//     .select()
//     .from(subscriptions)
//     .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId))
//     .limit(1);
// 
//   if (dbSubscriptions.length === 0) {
//     throw new Error("Subscription not found in database");
//   }
// 
//   const dbSubscription = dbSubscriptions[0];
// 
//   // Mapear status do Stripe para nosso status
//   let status: "active" | "paused" | "cancelled" | "expired" = "active";
//   if (subscription.status === "canceled") {
//     status = "cancelled";
//   } else if (subscription.status === "past_due") {
//     status = "paused";
//   } else if (subscription.status === "unpaid") {
//     status = "paused";
//   }
// 
//   // Atualizar
//   await db
//     .update(subscriptions)
//     .set({
//       status,
//       currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
//       currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
//     })
//     .where(eq(subscriptions.id, dbSubscription.id));
// 
//   return {
//     subscriptionId: dbSubscription.id,
//     status,
//   };
// }
// 
// /**
//  * Processar webhook de exclusão de subscrição
//  */
// export async function handleSubscriptionDeleted(
//   stripeSubscriptionId: string
// ) {
//   const db = await getDb();
//   if (!db) throw new Error("Database connection failed");
// 
//   // Atualizar status para cancelled
//   const dbSubscriptions = await db
//     .select()
//     .from(subscriptions)
//     .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId))
//     .limit(1);
// 
//   if (dbSubscriptions.length === 0) {
//     throw new Error("Subscription not found in database");
//   }
// 
//   const dbSubscription = dbSubscriptions[0];
// 
//   await db
//     .update(subscriptions)
//     .set({
//       status: "cancelled",
//       cancelledAt: new Date(),
//     })
//     .where(eq(subscriptions.id, dbSubscription.id));
// 
//   return {
//     subscriptionId: dbSubscription.id,
//   };
// }
// 
// /**
//  * Cancelar subscrição
//  */
// export async function cancelSubscription(subscriptionId: number) {
//   const db = await getDb();
//   if (!db) throw new Error("Database connection failed");
// 
//   // Obter subscrição
//   const dbSubscriptions = await db
//     .select()
//     .from(subscriptions)
//     .where(eq(subscriptions.id, subscriptionId))
//     .limit(1);
// 
//   if (dbSubscriptions.length === 0) {
//     throw new Error("Subscription not found");
//   }
// 
//   const dbSubscription = dbSubscriptions[0];
// 
//   if (!dbSubscription.stripeSubscriptionId) {
//     throw new Error("Stripe subscription ID not found");
//   }
// 
//   // Cancelar no Stripe
//   await stripe.subscriptions.cancel(dbSubscription.stripeSubscriptionId);
// 
//   // Atualizar status no banco
//   await db
//     .update(subscriptions)
//     .set({
//       status: "cancelled",
//       cancelledAt: new Date(),
//     })
//     .where(eq(subscriptions.id, subscriptionId));
// 
//   return {
//     subscriptionId,
//   };
// }
// 
// /**
//  * Obter portal de gerenciamento do cliente
//  */
// export async function createCustomerPortalSession(
//   customerId: string,
//   returnUrl: string
// ) {
//   const session = await stripe.billingPortal.sessions.create({
//     customer: customerId,
//     return_url: returnUrl,
//   });
// 
//   return session.url;
// }
