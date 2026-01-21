import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, CheckCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function CompanySignup() {
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    subscriptionPlan: "pro" as "pro" | "enterprise",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const createCompanyMutation = trpc.companies.create.useMutation({
    onSuccess: (data) => {
      setSuccess(true);
      setTimeout(() => {
        navigate("/");
      }, 2000);
    },
    onError: (error) => {
      setError(error.message || "Erro ao criar empresa");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Nome da empresa é obrigatório");
      return;
    }

    createCompanyMutation.mutate({
      name: formData.name,
      subscriptionPlan: formData.subscriptionPlan,
    });
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4">
        <Card className="w-full max-w-md border-green-200 bg-green-50">
          <CardContent className="pt-8">
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
              <h2 className="text-2xl font-bold text-green-900">Empresa Criada!</h2>
              <p className="text-green-700">
                Sua empresa foi criada com sucesso. Redirecionando...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-4">
      <div className="container mx-auto max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Criar Nova Empresa</h1>
          <p className="text-muted-foreground">
            Registre sua empresa na plataforma Romaneio
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações da Empresa</CardTitle>
            <CardDescription>
              Preencha os dados para criar sua conta
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Company Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome da Empresa *</label>
                <Input
                  placeholder="Ex: ALUMINC Esquadrias"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={createCompanyMutation.isPending}
                />
                <p className="text-xs text-muted-foreground">
                  Este será o nome exibido em toda a plataforma
                </p>
              </div>

              {/* Subscription Plan */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Plano de Assinatura *</label>
                <Select
                  value={formData.subscriptionPlan}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      subscriptionPlan: value as "pro" | "enterprise",
                    })
                  }
                  disabled={createCompanyMutation.isPending}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pro">
                      <div className="space-y-1">
                        <div className="font-medium">Pro - $49/mês</div>
                        <div className="text-xs text-muted-foreground">
                          Até 10 obras, 20 usuários
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="enterprise">
                      <div className="space-y-1">
                        <div className="font-medium">Enterprise - $199/mês</div>
                        <div className="text-xs text-muted-foreground">
                          Ilimitado, suporte prioritário
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={createCompanyMutation.isPending}
              >
                {createCompanyMutation.isPending
                  ? "Criando empresa..."
                  : "Criar Empresa"}
              </Button>

              {/* Terms */}
              <p className="text-xs text-center text-muted-foreground">
                Ao criar uma empresa, você concorda com nossos{" "}
                <a href="#" className="underline hover:text-foreground">
                  Termos de Serviço
                </a>
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded-lg border">
            <h3 className="font-semibold text-sm mb-2">Isolamento de Dados</h3>
            <p className="text-xs text-muted-foreground">
              Seus dados ficam completamente isolados
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg border">
            <h3 className="font-semibold text-sm mb-2">Suporte 24/7</h3>
            <p className="text-xs text-muted-foreground">
              Equipe pronta para ajudar
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg border">
            <h3 className="font-semibold text-sm mb-2">Sem Cartão Necessário</h3>
            <p className="text-xs text-muted-foreground">
              14 dias de teste gratuito
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg border">
            <h3 className="font-semibold text-sm mb-2">Escalável</h3>
            <p className="text-xs text-muted-foreground">
              Cresça conforme sua necessidade
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
