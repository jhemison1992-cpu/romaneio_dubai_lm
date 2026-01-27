import { router, publicProcedure } from "./_core/trpc";
import { z } from "zod";

export const subscriptionsRouter = router({
  createCheckoutSession: publicProcedure
    .input((val: unknown) => z.object({
      planSlug: z.string(),
      billingCycle: z.enum(["monthly", "annual"]),
      successUrl: z.string(),
      cancelUrl: z.string(),
    }).parse(val))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new Error("Not authenticated");
      
      const { createCheckoutSession } = await import("./stripe-helpers");
      const session = await createCheckoutSession(
        ctx.user.id,
        input.planSlug,
        input.billingCycle,
        ctx.user.email || "",
        ctx.user.name || "User",
        input.successUrl,
        input.cancelUrl
      );
      
      return {
        url: session.url,
      };
    }),

  getActiveSubscription: publicProcedure
    .input((val: unknown) => z.object({ companyId: z.number() }).parse(val))
    .query(async ({ input }) => {
      const { getActiveSubscription } = await import("./db-subscriptions");
      return await getActiveSubscription(input.companyId);
    }),

  cancelSubscription: publicProcedure
    .input((val: unknown) => z.object({ subscriptionId: z.number() }).parse(val))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new Error("Not authenticated");
      
      const { cancelSubscription } = await import("./stripe-helpers");
      return await cancelSubscription(input.subscriptionId);
    }),

  getCustomerPortalUrl: publicProcedure
    .input((val: unknown) => z.object({ returnUrl: z.string() }).parse(val))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new Error("Not authenticated");
      
      const { getDb } = await import("./db");
      const { companies } = await import("../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      
      const company = await db
        .select()
        .from(companies)
        .where(eq(companies.id, ctx.user.id))
        .limit(1);
      
      if (company.length === 0 || !company[0].stripeCustomerId) {
        throw new Error("No Stripe customer found");
      }
      
      const { createCustomerPortalSession } = await import("./stripe-helpers");
      const url = await createCustomerPortalSession(
        company[0].stripeCustomerId,
        input.returnUrl
      );
      
      return { url };
    }),
});
