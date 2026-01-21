import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Loader2, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Checkout() {
  const [selectedPlan, setSelectedPlan] = useState<"pro" | "enterprise">("pro");
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Obter empresa selecionada
  const companyId = parseInt(localStorage.getItem("selectedCompanyId") || "1", 10);

  // Mutation para criar sessão de checkout
  const checkoutMutation = trpc.stripe.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, "_blank");
      }
    },
    onError: (error) => {
      setError(error.message || "Erro ao criar sessão de checkout");
      setIsLoading(false);
    },
  });

  const handleCheckout = async () => {
    setError("");
    setIsLoading(true);

    // Obter email do usuário (você pode obter do contexto de autenticação)
    const userEmail = localStorage.getItem("userEmail") || "user@example.com";

    checkoutMutation.mutate({
      companyId,
      plan: selectedPlan,
      billingPeriod,
      email: userEmail,
    });
  };

  const plans = {
    pro: {
      name: "PRO",
      monthlyPrice: 49,
      annualPrice: 499,
      description: "Perfeito para pequenas e médias empresas",
      features: [
        "10 obras",
        "20 usuários",
        "Fotos e vídeos ilimitados",
        "Suporte por email",
        "Relatórios básicos",
      ],
    },
    enterprise: {
      name: "ENTERPRISE",
      monthlyPrice: 199,
      annualPrice: 2039,
      description: "Para empresas de grande porte",
      features: [
        "Obras ilimitadas",
        "Usuários ilimitados",
        "Fotos e vídeos ilimitados",
        "Suporte prioritário",
        "Relatórios avançados",
        "API access",
        "Integrações customizadas",
      ],
    },
  };

  const currentPlan = plans[selectedPlan];
  const price = billingPeriod === "monthly" ? currentPlan.monthlyPrice : currentPlan.annualPrice;
  const discount = billingPeriod === "annual" ? "15%" : "0%";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Escolha seu Plano</h1>
          <p className="text-xl text-muted-foreground">
            Selecione o plano que melhor se adequa às suas necessidades
          </p>
        </div>

        {/* Erro */}
        {error && (
          <div className="mb-8 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg max-w-2xl mx-auto">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Cards de Planos */}
          {Object.entries(plans).map(([planKey, plan]) => (
            <Card
              key={planKey}
              className={`cursor-pointer transition-all ${
                selectedPlan === planKey
                  ? "ring-2 ring-primary shadow-lg"
                  : "hover:shadow-lg"
              }`}
              onClick={() => setSelectedPlan(planKey as "pro" | "enterprise")}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </div>
                  {selectedPlan === planKey && (
                    <Check className="w-6 h-6 text-primary" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Preço */}
                <div className="space-y-2">
                  <div className="text-4xl font-bold">
                    ${price}
                    <span className="text-lg text-muted-foreground">
                      /{billingPeriod === "monthly" ? "mês" : "ano"}
                    </span>
                  </div>
                  {billingPeriod === "annual" && (
                    <p className="text-sm text-green-600 font-semibold">
                      Economize {discount} com pagamento anual
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Seletor de Período de Faturamento */}
        <div className="max-w-2xl mx-auto mb-8 p-6 bg-white rounded-lg border">
          <label className="block text-sm font-medium mb-3">Período de Faturamento</label>
          <Select
            value={billingPeriod}
            onValueChange={(value) => setBillingPeriod(value as "monthly" | "annual")}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Mensal - ${plans[selectedPlan].monthlyPrice}/mês</SelectItem>
              <SelectItem value="annual">
                Anual - ${plans[selectedPlan].annualPrice}/ano (15% desconto)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Resumo e Botão de Checkout */}
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between py-2 border-b">
                <span>Plano {plans[selectedPlan].name}</span>
                <span className="font-semibold">${price}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span>Período</span>
                <span className="font-semibold">
                  {billingPeriod === "monthly" ? "Mensal" : "Anual"}
                </span>
              </div>
              {billingPeriod === "annual" && (
                <div className="flex justify-between py-2 border-b text-green-600">
                  <span>Desconto (15%)</span>
                  <span className="font-semibold">
                    -${Math.round(plans[selectedPlan].monthlyPrice * 12 * 0.15)}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-3 text-lg font-bold">
                <span>Total</span>
                <span>${price}</span>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={isLoading || checkoutMutation.isPending}
                className="w-full py-6 text-lg"
              >
                {isLoading || checkoutMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  "Continuar para Pagamento"
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Você será redirecionado para o Stripe para completar o pagamento.
                Seu cartão será cobrado imediatamente após a confirmação.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Informações de Segurança */}
        <div className="max-w-2xl mx-auto mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            🔒 <strong>Seguro:</strong> Seus dados de pagamento são processados de forma segura pelo Stripe.
            Nunca armazenamos informações de cartão em nossos servidores.
          </p>
        </div>
      </div>
    </div>
  );
}
