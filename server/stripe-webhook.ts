import Stripe from "stripe";
import { Request, Response } from "express";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

/**
 * Middleware para processar webhooks do Stripe
 * IMPORTANTE: Deve ser registrado ANTES do express.json()
 */
export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body as Buffer | string,
      sig,
      webhookSecret
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Detectar eventos de teste
  if (event.id.startsWith("evt_test_")) {
    console.log("[Webhook] Test event detected, returning verification response");
    return res.json({
      verified: true,
    });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`[Webhook] Checkout session completed: ${session.id}`);

        const {
          handleCheckoutSessionCompleted,
        } = await import("./stripe-helpers");
        const result = await handleCheckoutSessionCompleted(session.id);

        console.log(
          `[Webhook] Subscription created for company ${result.companyId}`
        );
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(
          `[Webhook] Subscription updated: ${subscription.id}`
        );

        const { handleSubscriptionUpdated } = await import("./stripe-helpers");
        const result = await handleSubscriptionUpdated(subscription.id);

        console.log(
          `[Webhook] Subscription ${result.subscriptionId} status updated to ${result.status}`
        );
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`[Webhook] Subscription deleted: ${subscription.id}`);

        const { handleSubscriptionDeleted } = await import("./stripe-helpers");
        const result = await handleSubscriptionDeleted(subscription.id);

        console.log(
          `[Webhook] Subscription ${result.subscriptionId} marked as cancelled`
        );
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`[Webhook] Invoice paid: ${invoice.id}`);

        const { getDb } = await import("./db");
        const { invoices } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");

        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        // Atualizar fatura
        await db
          .update(invoices)
          .set({
            status: "paid",
            paidAt: new Date(),
          })
          .where(eq(invoices.stripeInvoiceId, invoice.id));

        console.log(`[Webhook] Invoice ${invoice.id} marked as paid`);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`[Webhook] Invoice payment failed: ${invoice.id}`);

        const { getDb } = await import("./db");
        const { invoices } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");

        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        // Atualizar fatura
        await db
          .update(invoices)
          .set({
            status: "open",
          })
          .where(eq(invoices.stripeInvoiceId, invoice.id));

        console.log(`[Webhook] Invoice ${invoice.id} payment failed`);
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (error: any) {
    console.error(`Error processing webhook: ${error.message}`);
    return res.status(500).send(`Webhook processing error: ${error.message}`);
  }

  // Retornar 200 para confirmar recebimento
  res.json({ received: true });
}
