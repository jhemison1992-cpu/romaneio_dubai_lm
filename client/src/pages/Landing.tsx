import { Button } from "@/components/ui/button";
import { ArrowRight, FileText } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Landing() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (user) {
      navigate("/app");
    }
  }, [user, navigate]);

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      <nav className="fixed top-0 w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-700 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-400" />
            <span className="text-xl font-bold">Romaneio</span>
          </div>
          <Button
            onClick={() => window.location.href = getLoginUrl()}
            variant="outline"
            className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white"
          >
            Entrar
          </Button>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Gestão Profissional de Vistorias e Romaneios
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            Crie, organize e gere relatórios profissionais em PDF com fotos, assinaturas digitais e dados completos.
          </p>
          <Button
            size="lg"
            onClick={() => window.location.href = getLoginUrl()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Começar Gratuitamente <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <p className="text-sm text-slate-400 mt-4">
            ✓ 14 dias de teste gratuito • Sem cartão de crédito
          </p>
        </div>
      </section>

      <footer className="bg-slate-900 border-t border-slate-700 py-8 px-4">
        <div className="container mx-auto text-center text-slate-400">
          <p>&copy; 2026 Romaneio. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
