/**
 * Stripe Products and Prices Configuration
 * 
 * Este arquivo centraliza a configuração de produtos e preços do Stripe
 * para a plataforma Romaneio de Liberação
 */

export const STRIPE_PRODUCTS = {
  PRO_MONTHLY: {
    name: "PRO - Mensal",
    description: "Plano PRO com 10 obras, 20 usuários, suporte por email",
    priceMonthly: 4900, // $49.00 em centavos
    priceCents: 4900,
    currency: "usd",
    interval: "month" as const,
    metadata: {
      plan: "pro",
      billingPeriod: "monthly",
      maxProjects: "10",
      maxUsers: "20",
      support: "email",
    },
  },
  
  PRO_ANNUAL: {
    name: "PRO - Anual",
    description: "Plano PRO com 10 obras, 20 usuários, suporte por email (15% desconto)",
    priceMonthly: 4900,
    priceAnnual: 49900, // $499.00 em centavos (15% desconto)
    priceCents: 49900,
    currency: "usd",
    interval: "year" as const,
    metadata: {
      plan: "pro",
      billingPeriod: "annual",
      maxProjects: "10",
      maxUsers: "20",
      support: "email",
      discount: "15%",
    },
  },
  
  ENTERPRISE_MONTHLY: {
    name: "ENTERPRISE - Mensal",
    description: "Plano ENTERPRISE com recursos ilimitados, suporte prioritário, API",
    priceMonthly: 19900, // $199.00 em centavos
    priceCents: 19900,
    currency: "usd",
    interval: "month" as const,
    metadata: {
      plan: "enterprise",
      billingPeriod: "monthly",
      maxProjects: "unlimited",
      maxUsers: "unlimited",
      support: "priority",
      api: "true",
    },
  },
  
  ENTERPRISE_ANNUAL: {
    name: "ENTERPRISE - Anual",
    description: "Plano ENTERPRISE com recursos ilimitados, suporte prioritário, API (15% desconto)",
    priceMonthly: 19900,
    priceAnnual: 203900, // $2,039.00 em centavos (15% desconto)
    priceCents: 203900,
    currency: "usd",
    interval: "year" as const,
    metadata: {
      plan: "enterprise",
      billingPeriod: "annual",
      maxProjects: "unlimited",
      maxUsers: "unlimited",
      support: "priority",
      api: "true",
      discount: "15%",
    },
  },
};

/**
 * Mapeamento de planos para IDs de preço do Stripe
 * Estes IDs serão preenchidos após criar os preços no Stripe
 */
export const STRIPE_PRICE_IDS = {
  PRO_MONTHLY: process.env.STRIPE_PRICE_PRO_MONTHLY || "",
  PRO_ANNUAL: process.env.STRIPE_PRICE_PRO_ANNUAL || "",
  ENTERPRISE_MONTHLY: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || "",
  ENTERPRISE_ANNUAL: process.env.STRIPE_PRICE_ENTERPRISE_ANNUAL || "",
};

/**
 * Obter preço em dólares (para exibição)
 */
export function getPriceInDollars(priceCents: number): string {
  return (priceCents / 100).toFixed(2);
}

/**
 * Obter informações do plano por ID de preço
 */
export function getPlanByPriceId(priceId: string) {
  const plans = Object.values(STRIPE_PRODUCTS);
  // Aqui você buscaria o plano baseado no priceId
  // Por enquanto, retornamos um plano padrão
  return plans[0];
}

/**
 * Validar se um plano é válido
 */
export function isValidPlan(plan: string): boolean {
  return ["pro", "enterprise"].includes(plan.toLowerCase());
}

/**
 * Validar se um período de faturamento é válido
 */
export function isValidBillingPeriod(period: string): boolean {
  return ["monthly", "annual"].includes(period.toLowerCase());
}
