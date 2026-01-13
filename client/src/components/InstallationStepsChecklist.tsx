import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";
import { DeliveryTermDialog } from "./DeliveryTermDialog";

interface InstallationStepsChecklistProps {
  inspectionItemId: number;
  environmentName: string;
}

export function InstallationStepsChecklist({ inspectionItemId, environmentName }: InstallationStepsChecklistProps) {
  const [initialized, setInitialized] = useState(false);
  const [openDeliveryTerm, setOpenDeliveryTerm] = useState(false);
  const [responsibleName, setResponsibleName] = useState("");
  const [signature, setSignature] = useState("");

  // Buscar etapas
  const { data: steps = [], isLoading, refetch } = trpc.installationSteps.list.useQuery(
    { inspectionItemId },
    { enabled: initialized }
  );

  // Buscar dados do item para pegar assinatura salva
  const { data: itemData } = trpc.inspectionItems.getById.useQuery(
    { id: inspectionItemId },
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

  // Mutation para salvar termo de entrega
  const saveDeliveryTermMutation = trpc.inspectionItems.saveDeliveryTerm.useMutation({
    onSuccess: () => {
      toast.success("Termo de entrega salvo com sucesso!");
      setOpenDeliveryTerm(false);
    },
    onError: () => {
      toast.error("Erro ao salvar termo de entrega");
    },
  });

  // Inicializar etapas se não existirem
  useEffect(() => {
    if (!initialized && inspectionItemId) {
      createDefaultMutation.mutate({ inspectionItemId });
    }
  }, [inspectionItemId]);

  // Carregar dados salvos do termo
  useEffect(() => {
    if (itemData) {
      setResponsibleName(itemData.deliveryTermResponsible || "");
      setSignature(itemData.deliveryTermSignature || "");
    }
  }, [itemData]);

  const handleToggle = (stepId: number, currentStatus: number) => {
    toggleMutation.mutate({
      stepId,
      isCompleted: currentStatus === 0,
    });
  };

  const handleSaveDeliveryTerm = () => {
    saveDeliveryTermMutation.mutate({
      inspectionItemId,
      responsibleName,
      signature,
    });
  };

  const handleGeneratePDF = async () => {
    try {
      const response = await fetch(`/api/generate-delivery-term-pdf/${inspectionItemId}`, {
        method: 'GET',
      });
      
      if (!response.ok) throw new Error('Erro ao gerar PDF');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `termo-entrega-${environmentName}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("PDF gerado com sucesso!");
    } catch (error) {
      toast.error("Erro ao gerar PDF");
    }
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
  const allCompleted = progress === 100;

  return (
    <>
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
            {steps.map((step: any) => {
              const isCompleted = step.isCompleted === 1;

              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    isCompleted
                      ? "bg-green-50 border-green-200"
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

          {allCompleted && (
            <div className="pt-4 border-t">
              <Button
                onClick={() => setOpenDeliveryTerm(true)}
                className="w-full"
                variant="default"
              >
                <FileText className="mr-2 h-4 w-4" />
                Termo de Entrega
              </Button>
            </div>
          )}
        </div>
      </Card>

      <DeliveryTermDialog
        open={openDeliveryTerm}
        onOpenChange={setOpenDeliveryTerm}
        environmentName={environmentName}
        responsibleName={responsibleName}
        onResponsibleNameChange={setResponsibleName}
        signature={signature}
        onSignatureChange={setSignature}
        onSave={handleSaveDeliveryTerm}
        onGeneratePDF={handleGeneratePDF}
        isSaving={saveDeliveryTermMutation.isPending}
      />
    </>
  );
}
