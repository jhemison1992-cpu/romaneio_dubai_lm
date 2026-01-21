import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, LogOut, Building2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function CompanyLogin() {
  const [, navigate] = useLocation();
  const userQuery = trpc.auth.me.useQuery();
  const user = userQuery.data;
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const { data: companies, isLoading } = trpc.companies.getUserCompanies.useQuery(
    { userId: user?.id || 0 },
    { enabled: !!user?.id }
  );

  // Se usuário não está logado, redirecionar para login
  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Se usuário tem apenas uma empresa, selecionar automaticamente
  useEffect(() => {
    if (companies && companies.length === 1 && !selectedCompanyId) {
      setSelectedCompanyId(companies[0].id);
    }
  }, [companies, selectedCompanyId]);

  const handleSelectCompany = (companyId: number | null) => {
    if (companyId === null) return;
    setSelectedCompanyId(companyId);
    // Aqui você pode salvar a empresa selecionada em localStorage ou context
    localStorage.setItem("selectedCompanyId", companyId.toString());
    navigate("/");
  };

  const handleLogout = () => {
    localStorage.removeItem("selectedCompanyId");
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8">
            <div className="text-center">Carregando empresas...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!companies || companies.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4">
        <Card className="w-full max-w-md border-yellow-200 bg-yellow-50">
          <CardContent className="pt-8">
            <div className="text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto" />
              <h2 className="text-xl font-bold text-yellow-900">Nenhuma Empresa</h2>
              <p className="text-yellow-700 text-sm">
                Você não tem acesso a nenhuma empresa. Entre em contato com um administrador.
              </p>
              <Button variant="outline" onClick={handleLogout} className="w-full">
                Voltar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se usuário tem apenas uma empresa, mostrar confirmação
  if (companies.length === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Bem-vindo!</CardTitle>
            <CardDescription>Acessando sua empresa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg border">
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold">{companies[0].name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Plano: {companies[0].subscriptionPlan === "pro" ? "Pro" : "Enterprise"}
                  </p>
                  <Badge variant="secondary" className="mt-2">
                    {companies[0].role}
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              onClick={() => handleSelectCompany(companies[0].id)}
              className="w-full"
            >
              Continuar
            </Button>
            <Button variant="outline" onClick={handleLogout} className="w-full">
              Usar Outra Conta
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se usuário tem múltiplas empresas, mostrar seleção
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Selecione uma Empresa</h1>
          <p className="text-muted-foreground">
            Você tem acesso a {companies.length} empresa{companies.length > 1 ? "s" : ""}
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="grid gap-4 mb-8">
          {companies.map((company) => (
            <Card
              key={company.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedCompanyId === company.id ? "border-primary border-2" : ""
              }`}
              onClick={() => setSelectedCompanyId(company.id)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {company.logoUrl && typeof company.logoUrl === "string" ? (
                      <img
                        src={company.logoUrl as string}
                        alt={company.name as string}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{company.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {(company.slug as string) || ""}
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="outline">
                          {company.subscriptionPlan === "pro" ? "Pro" : "Enterprise"}
                        </Badge>
                        <Badge variant="secondary">{company.role}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => {
              if (selectedCompanyId !== null) {
                handleSelectCompany(selectedCompanyId);
              } else {
                setError("Selecione uma empresa para continuar");
              }
            }}
            className="flex-1"
            disabled={!selectedCompanyId}
          >
            Acessar Empresa
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
    </div>
  );
}
