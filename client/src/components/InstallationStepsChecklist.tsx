import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface InstallationStepsChecklistProps {
  inspectionItemId: number;
}

export function InstallationStepsChecklist({ inspectionItemId }: InstallationStepsChecklistProps) {
  const [initialized, setInitialized] = useState(false);

  // Buscar etapas
  const { data: steps = [], isLoading, refetch } = trpc.installationSteps.list.useQuery(
    { inspectionItemId },
    { enabled: initialized }
  );

  // Buscar progresso
  const { data: progressData } = trpc.installationSteps.getProgress.useQuery(
    { inspectionItemId },
    { enabled: initialized }
  );

  // Mutation para criar etapas padrão
  const createDefaultMutation = trpc.installationSteps.createDefault.useMutation({
    onSuccess: () => {
      setInitialized(true);
      refetch();
    },
    onError: (error) => {
      console.error("Erro ao criar etapas:", error);
    },
  });

  // Mutation para marcar/desmarcar etapa
  const toggleMutation = trpc.installationSteps.toggle.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Etapa atualizada com sucesso");
    },
    onError: () => {
      toast.error("Erro ao atualizar etapa");
    },
  });

  // Inicializar etapas se não existirem
  useEffect(() => {
    if (!initialized && inspectionItemId) {
      // Criar etapas padrão se não existirem
      createDefaultMutation.mutate({ inspectionItemId });
    }
  }, [inspectionItemId]);

  const handleToggle = (stepId: number, currentStatus: number) => {
    toggleMutation.mutate({
      stepId,
      isCompleted: currentStatus === 0,
    });
  };

  if (!initialized || isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Carregando etapas...</span>
        </div>
      </Card>
    );
  }

  const progress = progressData?.progress || 0;

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Evolução da Instalação</h3>
            <span className="text-sm font-medium text-muted-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-3">
          {steps.map((step: any, index: number) => {
            const isCompleted = step.isCompleted === 1;
            const isPrevious = index > 0 && steps[index - 1].isCompleted === 0;

            return (
              <div
                key={step.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  isCompleted
                    ? "bg-green-50 border-green-200"
                    : isPrevious
                    ? "bg-muted/50 border-muted"
                    : "bg-background border-border hover:bg-muted/30"
                }`}
              >
                <button
                  onClick={() => handleToggle(step.id, step.isCompleted)}
                  disabled={toggleMutation.isPending}
                  className="flex items-center gap-3 flex-1 text-left"
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className={`font-medium ${isCompleted ? "text-green-700" : ""}`}>
                      {step.stepName}
                    </p>
                    {step.completedAt && (
                      <p className="text-xs text-muted-foreground">
                        Concluído em {new Date(step.completedAt).toLocaleDateString("pt-BR")}
                      </p>
                    )}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
