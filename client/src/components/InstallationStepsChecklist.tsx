import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { DeliveryTermDialog } from "./DeliveryTermDialog";

interface InstallationStepsChecklistProps {
  inspectionItemId: number;
  environmentId: number;
  environmentName: string;
  totalQuantity: number; // Quantidade total de caixilhos do ambiente
  onProgressChange?: (progress: number) => void; // Callback para atualizar progresso
}

export function InstallationStepsChecklist({ inspectionItemId, environmentId, environmentName, totalQuantity, onProgressChange }: InstallationStepsChecklistProps) {
  const [initialized, setInitialized] = useState(false);
  const [openDeliveryTerm, setOpenDeliveryTerm] = useState(false);
  const [responsibleName, setResponsibleName] = useState("");
  const [signature, setSignature] = useState("");
  const [editingStep, setEditingStep] = useState<number | null>(null);
  const [tempQuantities, setTempQuantities] = useState<Record<number, number>>({});

  // Buscar etapas
  const { data: steps = [], isLoading, refetch } = trpc.installationSteps.list.useQuery(
    { inspectionItemId }
  );

  // Buscar dados do item para pegar assinatura salva
  const { data: itemData } = trpc.inspectionItems.getById.useQuery(
    { id: inspectionItemId }
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

  // Mutation para atualizar quantidade
  const updateEnvironmentMutation = trpc.environments.update.useMutation({
    onSuccess: () => {
      toast.success("Data de finalização atualizada!");
    },
  });

  // Mutation para atualizar quantidade
  const updateQuantityMutation = trpc.installationSteps.updateQuantity.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Quantidade atualizada com sucesso");
      setEditingStep(null);
    },
    onError: () => {
      toast.error("Erro ao atualizar quantidade");
    },
  });

  // Mutation para salvar termo de entrega
  const saveDeliveryTermMutation = trpc.inspectionItems.saveDeliveryTerm.useMutation({
    onSuccess: () => {
      toast.success("Termo de entrega salvo com sucesso");
      setOpenDeliveryTerm(false);
      refetch();
    },
    onError: () => {
      toast.error("Erro ao salvar termo de entrega");
    },
  });

  useEffect(() => {
    if (steps.length === 0 && !isLoading && !createDefaultMutation.isPending) {
      createDefaultMutation.mutate({ inspectionItemId });
    } else if (steps.length > 0) {
      setInitialized(true);
    }
  }, [steps, isLoading]);

  useEffect(() => {
    if (itemData) {
      setResponsibleName(itemData.deliveryTermResponsible || "");
      setSignature(itemData.deliveryTermSignature || "");
    }
  }, [itemData]);

  const handleUpdateQuantity = (stepId: number) => {
    const quantity = tempQuantities[stepId];
    if (quantity === undefined || quantity < 0 || quantity > totalQuantity) {
      toast.error(`Quantidade deve estar entre 0 e ${totalQuantity}`);
      return;
    }
    
    // Verificar se é a etapa "Finalizado" e se atingiu 100%
    const step = steps.find((s: any) => s.id === stepId);
    const isFinalizadoStep = step?.stepName === "Finalizado";
    const willBe100Percent = quantity === totalQuantity;
    
    updateQuantityMutation.mutate({
      stepId,
      completedQuantity: quantity,
    });
    
    // Auto-preencher data de finalização quando etapa "Finalizado" atinge 100%
    if (isFinalizadoStep && willBe100Percent) {
      const today = new Date().toISOString().split('T')[0];
      updateEnvironmentMutation.mutate({
        id: environmentId,
        endDate: today,
      });
    }
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

  // Calcular progresso geral (média das 3 etapas)
  const stepPercentages = steps.map((step: any) => {
    const completed = step.completedQuantity || 0;
    return totalQuantity > 0 ? Math.round((completed / totalQuantity) * 100) : 0;
  });
  const overallProgress = stepPercentages.length > 0 
    ? Math.round(stepPercentages.reduce((a: number, b: number) => a + b, 0) / stepPercentages.length)
    : 0;

  const allCompleted = stepPercentages.every((p: number) => p === 100);

  // Chamar callback quando progresso muda
  useEffect(() => {
    if (onProgressChange) {
      onProgressChange(overallProgress);
    }
  }, [overallProgress, onProgressChange]);

  return (
    <>
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Evolução da Instalação</h3>
              <span className="text-sm font-medium text-muted-foreground">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {steps.map((step: any, index: number) => {
              const completedQty = step.completedQuantity || 0;
              const percentage = stepPercentages[index];
              const isEditing = editingStep === step.id;

              return (
                <div key={step.id} className="space-y-2">
                  <Button
                    onClick={() => {
                      setEditingStep(step.id);
                      setTempQuantities({ ...tempQuantities, [step.id]: completedQty });
                    }}
                    variant={percentage === 100 ? "default" : "outline"}
                    className={`w-full h-auto py-4 flex flex-col items-center gap-2 ${
                      percentage === 100
                        ? "bg-green-600 hover:bg-green-700 text-white" 
                        : "hover:bg-muted"
                    }`}
                  >
                    {percentage === 100 && <Check className="h-5 w-5" />}
                    <span className="font-medium">{step.stepName}</span>
                    <span className="text-lg font-bold">{percentage}%</span>
                    <span className="text-xs opacity-80">
                      {completedQty}/{totalQuantity} caixilhos
                    </span>
                  </Button>
                  
                  {isEditing && (
                    <div className="space-y-2 p-3 border rounded-lg bg-muted/50">
                      <Label htmlFor={`qty-${step.id}`} className="text-xs">
                        Quantidade concluída
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id={`qty-${step.id}`}
                          type="number"
                          min="0"
                          max={totalQuantity}
                          value={tempQuantities[step.id] ?? completedQty}
                          onChange={(e) => setTempQuantities({
                            ...tempQuantities,
                            [step.id]: parseInt(e.target.value) || 0
                          })}
                          className="h-8"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleUpdateQuantity(step.id)}
                          disabled={updateQuantityMutation.isPending}
                          className="h-8"
                        >
                          OK
                        </Button>
                      </div>
                    </div>
                  )}
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
