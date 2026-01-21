import { Router } from "express";
import Stripe from "stripe";
import * as dbStripe from "./db-stripe";
import { STRIPE_PRODUCTS } from "./stripe-products";

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
// Stripe SDK will use the latest API version automatically

/**
 * POST /api/stripe/checkout
 * Criar sessão de checkout do Stripe
 */
router.post("/checkout", async (req, res) => {
  try {
    const { companyId, plan, billingPeriod } = req.body;

    if (!companyId || !plan || !billingPeriod) {
      return res.status(400).json({
        error: "Missing required fields: companyId, plan, billingPeriod",
      });
    }

    // Selecionar produto baseado no plano e período
    const productKey = `${plan.toUpperCase()}_${billingPeriod.toUpperCase()}`;
    const product = STRIPE_PRODUCTS[productKey as keyof typeof STRIPE_PRODUCTS];

    if (!product) {
      return res.status(400).json({ error: "Invalid plan or billing period" });
    }

    // Criar sessão de checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: product.currency,
            product_data: {
              name: product.name,
              description: product.description,
            },
            unit_amount: product.priceCents,
            recurring: {
              interval: product.interval === "year" ? "year" : "month",
              interval_count: 1,
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.origin}/billing?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/pricing`,
      customer_email: req.body.email,
      metadata: {
        companyId: companyId.toString(),
        plan,
        billingPeriod,
      },
      allow_promotion_codes: true,
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("[Stripe Checkout Error]", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

/**
 * POST /api/stripe/webhook
 * Processar eventos do Stripe
 */
router.post("/webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error("[Webhook Signature Error]", err);
    return res.status(400).json({ error: "Webhook signature verification failed" });
  }

  // Detectar eventos de teste
  if (event.id.startsWith("evt_test_")) {
    console.log("[Webhook] Test event detected:", event.type);
    return res.json({ verified: true });
  }

  try {
    switch (event.type) {
      case "customer.created":
        await handleCustomerCreated(event.data.object as Stripe.Customer);
        break;

      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      case "customer.subscription.created":
        await handleSubscriptionCreated(
          event.data.object as Stripe.Subscription
        );
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription
        );
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        );
        break;

      case "invoice.paid":
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("[Webhook Processing Error]", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

/**
 * Processar criação de cliente
 */
async function handleCustomerCreated(customer: Stripe.Customer) {
  console.log("[Webhook] Customer created:", customer.id);
  // Aqui você pode registrar o customer ID se necessário
}

/**
 * Processar conclusão de sessão de checkout
 */
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  console.log("[Webhook] Checkout session completed:", session.id);

  const companyId = parseInt(session.metadata?.companyId || "0", 10);
  const customerId = session.customer as string;

  if (!companyId || !customerId) {
    console.error("[Webhook] Missing companyId or customerId");
    return;
  }

  // Atualizar Stripe Customer ID da empresa
  await dbStripe.updateCompanyStripeCustomerId(companyId, customerId);
}

/**
 * Processar criação de assinatura
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log("[Webhook] Subscription created:", subscription.id);

  const companyId = parseInt(subscription.metadata?.companyId || "0", 10);
  const plan = subscription.metadata?.plan || "pro";

  if (!companyId) {
    console.error("[Webhook] Missing companyId in subscription metadata");
    return;
  }

  // Atualizar assinatura da empresa
  await dbStripe.updateCompanyStripeSubscriptionId(
    companyId,
    subscription.id,
    plan as "pro" | "enterprise",
    "active"
  );

  console.log(`[Webhook] Company ${companyId} subscription activated`);
}

/**
 * Processar atualização de assinatura
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log("[Webhook] Subscription updated:", subscription.id);

  const companyId = parseInt(subscription.metadata?.companyId || "0", 10);

  if (!companyId) {
    console.error("[Webhook] Missing companyId in subscription metadata");
    return;
  }

  // Mapear status do Stripe para nosso status
  let status: "active" | "paused" | "cancelled" = "active";
  if (subscription.status === "past_due") {
    status = "paused";
  } else if (subscription.status === "canceled") {
    status = "cancelled";
  }

  await dbStripe.updateCompanyStripeSubscriptionId(
    companyId,
    subscription.id,
    subscription.metadata?.plan as "pro" | "enterprise",
    status
  );
}

/**
 * Processar cancelamento de assinatura
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log("[Webhook] Subscription deleted:", subscription.id);

  const companyId = parseInt(subscription.metadata?.companyId || "0", 10);

  if (!companyId) {
    console.error("[Webhook] Missing companyId in subscription metadata");
    return;
  }

  await dbStripe.cancelSubscription(companyId);
  console.log(`[Webhook] Company ${companyId} subscription cancelled`);
}

/**
 * Processar pagamento de fatura
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  console.log("[Webhook] Invoice paid:", invoice.id);
  // Aqui você pode registrar o pagamento se necessário
}

/**
 * Processar falha de pagamento
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log("[Webhook] Invoice payment failed:", invoice.id);
  // Aqui você pode notificar o usuário sobre falha de pagamento
}

export default router;
