import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CreditCard, Download, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Billing() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Dados mockados para demonstração
  const mockSubscription = {
    plan: "Profissional",
    status: "active",
    currentPeriodStart: new Date("2024-01-27"),
    currentPeriodEnd: new Date("2024-02-27"),
    amount: 299,
    currency: "BRL",
  };

  const mockInvoices = [
    {
      id: "inv_001",
      date: new Date("2024-01-27"),
      amount: 299,
      status: "paid",
      pdf: "/invoices/inv_001.pdf",
    },
    {
      id: "inv_002",
      date: new Date("2023-12-27"),
      amount: 299,
      status: "paid",
      pdf: "/invoices/inv_002.pdf",
    },
  ];

  const handleManageSubscription = async () => {
    setIsLoading(true);
    try {
      // Aqui você chamaria o procedimento tRPC para obter a URL do portal do cliente
      alert("Redirecionando para o portal de gerenciamento do Stripe...");
    } catch (error: any) {
      alert(error.message || "Erro ao acessar portal de gerenciamento");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Gerenciamento de Faturamento</h1>
          <p className="text-muted-foreground">
            Gerencie sua subscrição, métodos de pagamento e faturas
          </p>
        </div>

        {/* Subscription Status */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Plano Atual</CardTitle>
                <CardDescription>Seu plano de subscrição ativo</CardDescription>
              </div>
              <Badge className="bg-green-600">
                {mockSubscription.status === "active" ? "Ativo" : "Inativo"}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Plano</p>
                <p className="text-lg font-semibold">{mockSubscription.plan}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Preço Mensal</p>
                <p className="text-lg font-semibold">
                  R$ {mockSubscription.amount.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Período Atual</p>
                <p className="text-sm">
                  {mockSubscription.currentPeriodStart.toLocaleDateString("pt-BR")} -{" "}
                  {mockSubscription.currentPeriodEnd.toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Próxima Renovação</p>
                <p className="text-sm">
                  {mockSubscription.currentPeriodEnd.toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>

            <div className="border-t pt-6">
              <Button
                onClick={handleManageSubscription}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Carregando...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Gerenciar Subscrição
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Altere seu plano, atualize métodos de pagamento ou cancele sua subscrição
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Invoices */}
        <Card>
          <CardHeader>
            <CardTitle>Faturas Recentes</CardTitle>
            <CardDescription>Histórico de faturas e pagamentos</CardDescription>
          </CardHeader>

          <CardContent>
            {mockInvoices.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhuma fatura disponível</p>
              </div>
            ) : (
              <div className="space-y-3">
                {mockInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{invoice.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {invoice.date.toLocaleDateString("pt-BR")}
                      </p>
                    </div>

                    <div className="text-right mr-4">
                      <p className="font-semibold">
                        R$ {invoice.amount.toFixed(2)}
                      </p>
                      <Badge
                        variant={invoice.status === "paid" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {invoice.status === "paid" ? "Pago" : "Pendente"}
                      </Badge>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(invoice.pdf, "_blank")}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Section */}
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Precisa de ajuda?</h3>
          <p className="text-sm text-blue-800 mb-4">
            Se tiver dúvidas sobre sua fatura ou precisar de suporte, entre em contato com nosso time.
          </p>
          <Button variant="outline" className="bg-white">
            Contatar Suporte
          </Button>
        </div>
      </div>
    </div>
  );
}
