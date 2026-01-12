
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { ArrowLeft, Download, Save, FileText } from "lucide-react";
import { getPlantaUrl } from "@/lib/plantasMapping";
import { MediaUpload } from "@/components/MediaUpload";
import { SignaturePad } from "@/components/SignaturePad";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Link, useParams } from "wouter";

interface InspectionItemData {
  id?: number;
  environmentId: number;
  releaseDate?: Date;
  responsibleConstruction?: string;
  responsibleSupplier?: string;
  observations?: string;
  signatureConstruction?: string;
  signatureSupplier?: string;
}

function GeneratePDFButton({ inspectionId }: { inspectionId: number }) {
  const generatePDFMutation = trpc.reports.generatePDF.useMutation({
    onSuccess: (data) => {
      window.open(data.url, "_blank");
      toast.success("Relatório gerado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao gerar relatório: " + error.message);
    },
  });

  return (
    <Button
      onClick={() => generatePDFMutation.mutate({ inspectionId })}
      disabled={generatePDFMutation.isPending}
      className="gap-2"
    >
      <Download className="h-4 w-4" />
      {generatePDFMutation.isPending ? "Gerando..." : "Gerar PDF"}
    </Button>
  );
}

export default function InspectionDetail() {
  const params = useParams();
  const inspectionId = params.id ? parseInt(params.id) : 0;
  
  const { data: inspection, isLoading: inspectionLoading, error: inspectionError } = trpc.inspections.get.useQuery(
    { id: inspectionId },
    { enabled: inspectionId > 0 }
  );
  // Buscar ambientes da obra vinculada à vistoria
  const { data: environments, isLoading: environmentsLoading } = trpc.environments.list.useQuery(
    { projectId: inspection?.projectId || 0 },
    { enabled: !!inspection?.projectId }
  );
  const { data: items, refetch: refetchItems } = trpc.inspectionItems.list.useQuery(
    { inspectionId },
    { enabled: inspectionId > 0 }
  );
  
  const [formData, setFormData] = useState<Record<number, InspectionItemData>>({});
  const [activeTab, setActiveTab] = useState<string>("0");
  
  const utils = trpc.useUtils();
  
  const upsertMutation = trpc.inspectionItems.upsert.useMutation({
    onSuccess: () => {
      toast.success("Dados salvos com sucesso!");
      refetchItems();
    },
    onError: (error) => {
      toast.error("Erro ao salvar: " + error.message);
    },
  });
  
  const updateStatusMutation = trpc.inspections.updateStatus.useMutation({
    onSuccess: () => {
      utils.inspections.get.invalidate({ id: inspectionId });
      toast.success("Status atualizado!");
    },
  });
  
  useEffect(() => {
    if (environments && items) {
      const initialData: Record<number, InspectionItemData> = {};
      environments.forEach((env) => {
        const existingItem = items.find((item) => item.environmentId === env.id);
        initialData[env.id] = {
          id: existingItem?.id,
          environmentId: env.id,
          releaseDate: existingItem?.releaseDate ? new Date(existingItem.releaseDate) : undefined,
          responsibleConstruction: existingItem?.responsibleConstruction || "",
          responsibleSupplier: existingItem?.responsibleSupplier || "",
          observations: existingItem?.observations || "",
          signatureConstruction: (existingItem as any)?.signatureConstruction || "",
          signatureSupplier: (existingItem as any)?.signatureSupplier || "",
        };
      });
      setFormData(initialData);
    }
  }, [environments, items]);
  
  const handleSave = (environmentId: number) => {
    const data = formData[environmentId];
    if (!data) return;
    
    upsertMutation.mutate({
      ...data,
      releaseDate: data.releaseDate ? format(data.releaseDate, "yyyy-MM-dd") : undefined,
      inspectionId,
    });
  };
  
  const handleChange = (environmentId: number, field: keyof InspectionItemData, value: string | Date | null | undefined) => {
    setFormData((prev) => ({
      ...prev,
      [environmentId]: {
        ...prev[environmentId]!,
        [field]: value,
      },
    }));
  };
  
  const handleStatusChange = (status: "draft" | "in_progress" | "completed") => {
    updateStatusMutation.mutate({ id: inspectionId, status });
  };

  if (inspectionError) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <p className="text-destructive">Erro ao carregar vistoria</p>
          <p className="text-sm text-muted-foreground">{inspectionError.message}</p>
          <Link href="/inspections">
            <Button>Voltar para Vistorias</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  if (inspectionLoading || environmentsLoading || !inspection || !environments) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-6xl">
      <div className="mb-6">
        <Link href="/inspections">
          <Button variant="ghost" className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Voltar para Vistorias
          </Button>
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{inspection.title}</h1>
            <p className="text-muted-foreground mt-2">
              Preencha os dados de liberação para cada ambiente
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={inspection.status} onValueChange={(value) => handleStatusChange(value as any)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="in_progress">Em Andamento</SelectItem>
                <SelectItem value="completed">Concluída</SelectItem>
              </SelectContent>
            </Select>
            <GeneratePDFButton inspectionId={inspectionId} />
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 lg:grid-cols-6 gap-2 h-auto bg-muted/50 p-2">
                  {environments?.map((env: any, index: number) => (
            <TabsTrigger 
              key={env.id} 
              value={index.toString()}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs lg:text-sm"
            >
              {env.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {environments?.map((env: any, index: number) => {
          const data = formData[env.id];
          if (!data) return null;
          
          return (
            <TabsContent key={env.id} value={index.toString()}>
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle>{env.name}</CardTitle>
                      <CardDescription>
                        <div className="space-y-1 mt-2">
                          <p><span className="font-medium">Caixilho:</span> {env.caixilhoCode}</p>
                          <p><span className="font-medium">Tipo:</span> {env.caixilhoType}</p>
                          <p><span className="font-medium">Quantidade:</span> {env.quantity} peça(s)</p>
                        </div>
                      </CardDescription>
                    </div>
                    {getPlantaUrl(env.caixilhoCode) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => window.open(getPlantaUrl(env.caixilhoCode)!, '_blank')}
                      >
                        <FileText className="h-4 w-4" />
                        Ver Planta
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`releaseDate-${env.id}`}>Data de Liberação</Label>
                      <Input
                        id={`releaseDate-${env.id}`}
                        type="date"
                        value={data.releaseDate ? format(data.releaseDate, "yyyy-MM-dd") : ""}
                        onChange={(e) => handleChange(env.id, "releaseDate", e.target.value ? new Date(e.target.value) : undefined)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`responsibleConstruction-${env.id}`}>Responsável da Obra</Label>
                      <Input
                        id={`responsibleConstruction-${env.id}`}
                        value={data.responsibleConstruction || ""}
                        onChange={(e) => handleChange(env.id, "responsibleConstruction", e.target.value || null)}
                        placeholder="Nome do responsável"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`responsibleSupplier-${env.id}`}>Responsável do Fornecedor</Label>
                      <Input
                        id={`responsibleSupplier-${env.id}`}
                        value={data.responsibleSupplier || ""}
                        onChange={(e) => handleChange(env.id, "responsibleSupplier", e.target.value || null)}
                        placeholder="Nome do responsável"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`observations-${env.id}`}>Observações</Label>
                    <textarea
                      id={`observations-${env.id}`}
                      value={formData[env.id]?.observations || ""}
                      onChange={(e) => handleChange(env.id, "observations", e.target.value)}
                      placeholder="Adicione observações sobre este ambiente..."
                      className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                    />
                  </div>

          {/* Assinaturas Digitais */}
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <SignaturePad
              label="Assinatura do Responsável da Obra"
              value={formData[env.id]?.signatureConstruction}
              onChange={(sig) => handleChange(env.id, "signatureConstruction", sig)}
            />
            <SignaturePad
              label="Assinatura do Responsável do Fornecedor"
              value={formData[env.id]?.signatureSupplier}
              onChange={(sig) => handleChange(env.id, "signatureSupplier", sig)}
            />                  </div>
                  
                  <div className="border-t pt-6">
                    <h3 className="font-semibold mb-4">Fotos e Vídeos</h3>
                    <MediaUpload inspectionItemId={data.id} />
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button 
                      onClick={() => handleSave(env.id)}
                      disabled={upsertMutation.isPending}
                      className="gap-2"
                      size="lg"
                    >
                      <Save className="h-4 w-4" />
                      {upsertMutation.isPending ? "Salvando..." : "Salvar Dados"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
