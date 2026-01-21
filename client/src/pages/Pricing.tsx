import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const { data: plans, isLoading } = trpc.pricing.list.useQuery();

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="text-center">Carregando planos...</div>
      </div>
    );
  }

  const calculatePrice = (plan: any) => {
    const price = billingCycle === "monthly" ? plan.monthlyPrice : plan.annualPrice;
    return (price / 100).toFixed(2);
  };

  const calculateDiscount = (plan: any) => {
    const monthlyTotal = plan.monthlyPrice * 12;
    const discount = ((monthlyTotal - plan.annualPrice) / monthlyTotal) * 100;
    return Math.round(discount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Planos de Preço</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Escolha o plano perfeito para sua equipe
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                billingCycle === "monthly"
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                billingCycle === "annual"
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Anual
              <Badge variant="secondary" className="ml-2">
                15% OFF
              </Badge>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans?.map((plan) => (
            <Card
              key={plan.id}
              className={`relative transition-all hover:shadow-lg ${
                plan.slug === "enterprise" ? "md:col-span-1 border-2 border-primary" : ""
              }`}
            >
              {plan.slug === "enterprise" && (
                <Badge className="absolute top-4 right-4 bg-primary">Popular</Badge>
              )}

              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Price */}
                <div className="space-y-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">
                      ${calculatePrice(plan)}
                    </span>
                    <span className="text-muted-foreground">
                      /{billingCycle === "monthly" ? "mês" : "ano"}
                    </span>
                  </div>
                  {billingCycle === "annual" && (
                    <p className="text-sm text-green-600 font-medium">
                      Economize {calculateDiscount(plan)}% comparado ao plano mensal
                    </p>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-3">
                  {plan.features && Array.isArray(plan.features) && plan.features.map((feature: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Button
                  size="lg"
                  className="w-full"
                  variant={plan.slug === "enterprise" ? "default" : "outline"}
                >
                  Começar Agora
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Perguntas Frequentes</h2>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Posso mudar de plano a qualquer momento?</h3>
              <p className="text-sm text-muted-foreground">
                Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. As mudanças entram em vigor imediatamente.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Há período de teste gratuito?</h3>
              <p className="text-sm text-muted-foreground">
                Sim, oferecemos 14 dias de teste gratuito para todos os planos. Nenhum cartão de crédito necessário.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Qual é a política de reembolso?</h3>
              <p className="text-sm text-muted-foreground">
                Se não estiver satisfeito, oferecemos reembolso total dentro de 30 dias. Sem perguntas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
