import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function BillingSuccess() {
  const [searchParams] = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!sessionId) {
      setError("Session ID not found");
      setIsLoading(false);
      setTimeout(() => window.location.href = "/pricing", 3000);
      return;
    }

    // Aqui você pode fazer uma chamada para verificar o status da sessão
    // Por enquanto, apenas mostramos a mensagem de sucesso
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg text-muted-foreground">Processando sua subscrição...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Erro</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = "/pricing"} className="w-full">
              Voltar para Planos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Parabéns!</CardTitle>
          <CardDescription>Sua subscrição foi criada com sucesso</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>✓ Seu plano foi ativado</p>
            <p>✓ Você receberá um email de confirmação em breve</p>
            <p>✓ Você pode gerenciar sua subscrição a qualquer momento</p>
          </div>

          <div className="space-y-2">
            <Button onClick={() => window.location.href = "/obras"} className="w-full">
              Ir para Obras
            </Button>
            <Button
              onClick={() => window.location.href = "/billing"}
              variant="outline"
              className="w-full"
            >
              Gerenciar Subscrição
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Session ID: {sessionId}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
