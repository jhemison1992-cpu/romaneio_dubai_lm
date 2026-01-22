import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, CreditCard, Calendar, CheckCircle, AlertCircle, Zap } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function SubscriptionManagement() {
  const { data: plans } = trpc.pricing.list.useQuery();
  const { data: currentPlan } = trpc.pricing.getCompanyPlan.useQuery({ companyId: 1 });
  const [company] = useState({ id: 1, email: 'contact@aluminc.com' });

  const upgradeMutation = trpc.stripe.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, "_blank");
        toast.success("Redirecionando para checkout...");
      }
    },
    onError: (error) => {
      toast.error("Erro ao criar sessão de checkout: " + error.message);
    },
  });

  const handleUpgrade = (plan: "pro" | "enterprise", billingPeriod: "monthly" | "annual") => {
    upgradeMutation.mutate({
      plan,
      billingPeriod,
      companyId: company.id,
      email: company.email,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "past_due":
        return "bg-red-100 text-red-800";
      case "canceled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Ativo";
      case "past_due":
        return "Pagamento Atrasado";
      case "canceled":
        return "Cancelado";
      default:
        return "Desconhecido";
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/inspection/1">
            <Button variant="ghost" size="sm" className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Gerenciamento de Assinatura</h1>
          <p className="text-muted-foreground mt-2">Gerencie seu plano e pagamentos</p>
        </div>

        {/* Current Plan */}
        {currentPlan && (
          <Card className="mb-8 border-2 border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-amber-600" />
                    Plano Atual
                  </CardTitle>
                  <CardDescription>Seu plano ativo</CardDescription>
                </div>
                <Badge className="text-lg px-4 py-2">{currentPlan?.plan?.name || 'N/A'}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Preço Mensal</p>
                  <p className="text-2xl font-bold">${currentPlan?.plan?.monthlyPrice || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Preço Anual</p>
                  <p className="text-2xl font-bold">${currentPlan?.plan?.annualPrice || 0}</p>
                  <p className="text-xs text-green-600 mt-1">15% de desconto</p>
                </div>
              </div>

              {/* Plan Features */}
              <div className="mt-6 pt-6 border-t">
                <p className="font-semibold mb-4">Recursos Inclusos</p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Obras: {currentPlan.plan?.name === 'PRO' ? '10' : 'Ilimitado'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Usuários: {currentPlan.plan?.name === 'PRO' ? '20' : 'Ilimitado'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Suporte: {currentPlan.plan?.name === 'PRO' ? 'Email' : 'Prioritário'}</span>
                  </li>
                  {currentPlan.plan?.name === 'ENTERPRISE' && (
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Acesso à API</span>
                    </li>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Plans */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Outros Planos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans?.filter((p: any) => p.slug !== currentPlan?.plan?.slug).map((plan: any) => (
              <Card key={plan.id}>
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Preço Mensal</p>
                      <p className="text-2xl font-bold">${plan.monthlyPrice}/mês</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Preço Anual</p>
                      <p className="text-2xl font-bold">${plan.annualPrice}/ano</p>
                      <p className="text-xs text-green-600">15% de desconto</p>
                    </div>

                    <div className="pt-4 space-y-2">
                      <Button
                        onClick={() => handleUpgrade(plan.slug as 'pro' | 'enterprise', "monthly")}
                        disabled={upgradeMutation.isPending}
                        className="w-full"
                      >
                        Escolher Mensal
                      </Button>
                      <Button
                        onClick={() => handleUpgrade(plan.slug as 'pro' | 'enterprise', "annual")}
                        disabled={upgradeMutation.isPending}
                        variant="outline"
                        className="w-full"
                      >
                        Escolher Anual
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Billing History */}
              {false && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Histórico de Pagamentos
              </CardTitle>
              <CardDescription>Seus pagamentos anteriores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[].map((record: any) => (
                  <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{record.planName}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(record.changedAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(record.status)}>
                        {getStatusLabel(record.status)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Support Section */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              Precisa de Ajuda?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Se tiver dúvidas sobre seu plano ou precisar de suporte, entre em contato conosco.
            </p>
            <Button variant="outline" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Contatar Suporte
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
