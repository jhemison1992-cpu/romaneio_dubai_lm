
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { parseInputDate, formatInputDate } from "@/lib/dateUtils";
import { ArrowLeft, Download, Save, FileText, Plus, Trash2 } from "lucide-react";
import { getPlantaUrl } from "@/lib/plantasMapping";
import { MediaUpload } from "@/components/MediaUpload";
import { SignaturePad } from "@/components/SignaturePad";
import { InstallationStepsChecklist } from "@/components/InstallationStepsChecklist";
import { NewEnvironmentDialog } from "@/components/NewEnvironmentDialog";
import { FillGuideDialog } from "@/components/FillGuideDialog";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Link, useParams } from "wouter";

interface InspectionItemData {
  id?: number;
  environmentId: number;
  releaseDate?: Date | string | null;
  responsibleConstruction: string;
  responsibleSupplier: string;
  observations: string;
  signatureConstruction: string;
  signatureSupplier: string;
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
    <div className="flex gap-2">
      <Button
        onClick={() => generatePDFMutation.mutate({ inspectionId, format: "standard" })}
        disabled={generatePDFMutation.isPending}
        className="gap-2"
      >
        <Download className="h-4 w-4" />
        {generatePDFMutation.isPending ? "Gerando..." : "Gerar PDF"}
      </Button>
      <Button
        onClick={() => generatePDFMutation.mutate({ inspectionId, format: "abnt" })}
        disabled={generatePDFMutation.isPending}
        variant="outline"
        className="gap-2"
      >
        <Download className="h-4 w-4" />
        {generatePDFMutation.isPending ? "Gerando..." : "Gerar PDF ABNT"}
      </Button>
    </div>
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
  // Buscar ambientes adicionados diretamente na vistoria
  const { data: inspectionEnvs, refetch: refetchInspectionEnvs } = trpc.inspectionEnvironments.list.useQuery(
    { inspectionId },
    { enabled: inspectionId > 0 }
  );
  const { data: items, refetch: refetchItems } = trpc.inspectionItems.list.useQuery(
    { inspectionId },
    { enabled: inspectionId > 0 }
  );
  
  const [formData, setFormData] = useState<Record<number, InspectionItemData>>({});
  const [activeTab, setActiveTab] = useState<string>("0");
  const [statusValue, setStatusValue] = useState<string>(inspection?.status || "draft");
  
  // Estados para dialog de novo ambiente
  const [openNewEnv, setOpenNewEnv] = useState(false);
  const [newEnvName, setNewEnvName] = useState("");
  const [newEnvCode, setNewEnvCode] = useState("");
  const [newEnvType, setNewEnvType] = useState("");
  const [newEnvQty, setNewEnvQty] = useState(1);
  const [newEnvStartDate, setNewEnvStartDate] = useState("");
  const [newEnvEndDate, setNewEnvEndDate] = useState("");
  const [newEnvPlantaFile, setNewEnvPlantaFile] = useState<File | null>(null);
  const [newEnvProjectFile, setNewEnvProjectFile] = useState<File | null>(null);
  
  // Estado para confirmação de exclusão
  const [envToDelete, setEnvToDelete] = useState<number | null>(null);
  
  const utils = trpc.useUtils();
  
  const upsertMutation = trpc.inspectionItems.upsert.useMutation({
    onSuccess: (data, variables) => {
      console.log('Upsert sucesso:', { data, variables });
      toast.success("Dados salvos com sucesso!");
      // Atualizar formData com o ID retornado para permitir upload de mídia
      setFormData((prev) => ({
        ...prev,
        [variables.environmentId]: {
          ...prev[variables.environmentId],
          id: data.id,
        },
      }));
      refetchItems();
    },
    onError: (error) => {
      console.error('Erro upsert:', error);
      toast.error("Erro ao salvar: " + error.message);
    },
  });
  
  const updateStatusMutation = trpc.inspections.updateStatus.useMutation({
    onSuccess: () => {
      utils.inspections.get.invalidate({ id: inspectionId });
      toast.success("Status atualizado!");
    },
  });
  
  const createEnvMutation = trpc.inspectionEnvironments.create.useMutation({
    onSuccess: () => {
      toast.success("Ambiente adicionado com sucesso!");
      refetchInspectionEnvs();
      setOpenNewEnv(false);
      setNewEnvName("");
      setNewEnvCode("");
      setNewEnvType("");
      setNewEnvQty(1);
      setNewEnvPlantaFile(null);
    },
    onError: (error) => {
      toast.error("Erro ao adicionar ambiente: " + error.message);
    },
  });
  
  const deleteEnvMutation = trpc.inspectionEnvironments.delete.useMutation({
    onSuccess: () => {
      toast.success("Ambiente excluído com sucesso!");
      refetchInspectionEnvs();
      setEnvToDelete(null);
      // Voltar para primeira aba se a aba atual foi excluída
      setActiveTab("0");
    },
    onError: (error) => {
      toast.error("Erro ao excluir ambiente: " + error.message);
    },
  });
  
  // Mesclar ambientes da obra + ambientes da vistoria
  const allEnvironments = [
    ...(environments || []),
    ...(inspectionEnvs || []),
  ];
  
  useEffect(() => {
    if (allEnvironments.length > 0 && items) {
      const initialData: Record<number, InspectionItemData> = {};
      allEnvironments.forEach((env) => {
        const existingItem = items.find((item) => item.environmentId === env.id);
        let releaseDate: Date | undefined = undefined;
        if (existingItem?.releaseDate) {
          // Se for Date, usar diretamente
          if (existingItem.releaseDate instanceof Date) {
            releaseDate = existingItem.releaseDate;
          } else {
            // Se for string ISO, converter para Date usando parseInputDate
            const releaseDateValue = existingItem.releaseDate as string;
            // Extrair apenas a data (YYYY-MM-DD) da string ISO
            const datePart = releaseDateValue.split('T')[0];
            releaseDate = parseInputDate(datePart);
          }
        }
        initialData[env.id] = {
          id: existingItem?.id,
          environmentId: env.id,
          releaseDate: releaseDate,
          responsibleConstruction: existingItem?.responsibleConstruction || "",
          responsibleSupplier: existingItem?.responsibleSupplier || "",
          observations: existingItem?.observations || "",
          signatureConstruction: (existingItem as any)?.signatureConstruction || "",
          signatureSupplier: (existingItem as any)?.signatureSupplier || "",
        };
      });
      setFormData(initialData);
    }
  }, [allEnvironments.length, items]);
  
  const handleSave = (environmentId: number) => {
    console.log('handleSave chamado com environmentId:', environmentId);
    const data = formData[environmentId];
    console.log('formData[environmentId]:', data);
    if (!data) {
      console.log('Sem dados para este ambiente');
      return;
    }
    
    // Converter releaseDate para string YYYY-MM-DD
    let releaseDateString: string | undefined = undefined;
    if (data.releaseDate) {
      if (data.releaseDate instanceof Date) {
        // Se é Date, converter para string YYYY-MM-DD
        releaseDateString = formatInputDate(data.releaseDate);
      } else if (typeof data.releaseDate === 'string') {
        // Se é string, manter como está
        releaseDateString = data.releaseDate;
      }
    }
    
    upsertMutation.mutate({
      ...data,
      releaseDate: releaseDateString,
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
  
  const handleCreateEnv = async () => {
    if (!newEnvName.trim() || !newEnvCode.trim() || !newEnvType.trim()) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    
    let plantaFileKey: string | undefined;
    let plantaFileUrl: string | undefined;
    let projectFileKey: string | undefined;
    let projectFileUrl: string | undefined;
    
    // Upload da planta se fornecida
    if (newEnvPlantaFile) {
      try {
        const reader = new FileReader();
        const fileData = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(newEnvPlantaFile);
        });
        
        const base64Data = fileData.split(',')[1];
        const uploadResult = await utils.client.environments.uploadDrawing.mutate({
          fileData: base64Data,
          fileName: newEnvPlantaFile.name,
          mimeType: newEnvPlantaFile.type,
        });
        
        plantaFileKey = uploadResult.fileKey;
        plantaFileUrl = uploadResult.url;
      } catch (error) {
        toast.error("Erro ao fazer upload da planta");
        return;
      }
    }
    
    // Upload do projeto do caixilho se fornecido
    if (newEnvProjectFile) {
      try {
        const reader = new FileReader();
        const fileData = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(newEnvProjectFile);
        });
        
        const base64Data = fileData.split(',')[1];
        const uploadResult = await utils.client.environments.uploadDrawing.mutate({
          fileData: base64Data,
          fileName: newEnvProjectFile.name,
          mimeType: newEnvProjectFile.type,
        });
        
        projectFileKey = uploadResult.fileKey;
        projectFileUrl = uploadResult.url;
      } catch (error) {
        toast.error("Erro ao fazer upload do projeto do caixilho");
        return;
      }
    }
    
    createEnvMutation.mutate({
      inspectionId,
      name: newEnvName,
      caixilhoCode: newEnvCode,
      caixilhoType: newEnvType,
      quantity: newEnvQty,
      startDate: newEnvStartDate || undefined,
      endDate: newEnvEndDate || undefined,
      plantaFileKey,
      plantaFileUrl,
      projectFileKey,
      projectFileUrl,
    });
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
            <FillGuideDialog />
            <Button onClick={() => setOpenNewEnv(true)} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Ambiente
            </Button>
            <Select value={statusValue || "draft"} onValueChange={(value) => {
              setStatusValue(value);
              handleStatusChange(value as any);
            }}>
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
                  {allEnvironments.map((env: any, index: number) => (
            <TabsTrigger 
              key={env.id} 
              value={index.toString()}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs lg:text-sm"
            >
              {env.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {allEnvironments.map((env: any, index: number) => {
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
                          {env.startDate && (
                            <p><span className="font-medium">Data de Liberação:</span> {(() => {
                              const dateStr = typeof env.startDate === 'string' ? env.startDate.split('T')[0] : formatInputDate(new Date(env.startDate));
                              const date = parseInputDate(dateStr);
                              return date.toLocaleDateString('pt-BR');
                            })()}</p>
                          )}
                          {env.endDate && (
                            <p><span className="font-medium">Data de Finalização:</span> {(() => {
                              const dateStr = typeof env.endDate === 'string' ? env.endDate.split('T')[0] : formatInputDate(new Date(env.endDate));
                              const date = parseInputDate(dateStr);
                              return date.toLocaleDateString('pt-BR');
                            })()}</p>
                          )}
                        </div>
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {(env.plantaFileUrl || getPlantaUrl(env.caixilhoCode)) && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => window.open(env.plantaFileUrl || getPlantaUrl(env.caixilhoCode)!, '_blank')}
                        >
                          <FileText className="h-4 w-4" />
                          Ver Planta
                        </Button>
                      )}
                      {env.projectFileUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => window.open(env.projectFileUrl, '_blank')}
                        >
                          <FileText className="h-4 w-4" />
                          Ver Projeto
                        </Button>
                      )}
                      {/* Mostrar botão de excluir apenas para ambientes personalizados (inspectionEnvs) */}
                      {inspectionEnvs?.some(ie => ie.id === env.id) && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => setEnvToDelete(env.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`releaseDate-${env.id}`}>Data de Liberação</Label>
                      <Input
                        id={`releaseDate-${env.id}`}
                        type="date"
                        value={data.releaseDate instanceof Date ? formatInputDate(data.releaseDate) : (data.releaseDate || "")}
                        onChange={(e) => {
                          if (e.target.value) {
                            // Converter string YYYY-MM-DD para Date
                            const dateValue = parseInputDate(e.target.value);
                            handleChange(env.id, "releaseDate", dateValue);
                          } else {
                            handleChange(env.id, "releaseDate", undefined);
                          }
                        }}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`endDate-${env.id}`}>Data de Finalização</Label>
                      <Input
                        id={`endDate-${env.id}`}
                        type="date"
                        value={env.endDate ? formatInputDate(new Date(env.endDate)) : ""}
                        disabled
                        className="bg-muted"
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
                      <Label htmlFor={`responsibleSupplier-${env.id}`}>Responsável da Aluminc</Label>
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
              label="Assinatura do Responsável da Aluminc"
              value={formData[env.id]?.signatureSupplier}
              onChange={(sig) => handleChange(env.id, "signatureSupplier", sig)}
            />                  </div>
                  
                  {data.id && (
                    <div className="border-t pt-6">
                      <h3 className="font-semibold mb-4">Evolução da Instalação</h3>
                      <InstallationStepsChecklist 
                        inspectionItemId={data.id}
                        environmentId={data.environmentId}
                        environmentName={env.name}
                        totalQuantity={env.quantity || 1}
                      />
                    </div>
                  )}
                  
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
      
      <NewEnvironmentDialog
        open={openNewEnv}
        onOpenChange={setOpenNewEnv}
        name={newEnvName}
        onNameChange={setNewEnvName}
        code={newEnvCode}
        onCodeChange={setNewEnvCode}
        type={newEnvType}
        onTypeChange={setNewEnvType}
        quantity={newEnvQty}
        onQuantityChange={setNewEnvQty}
        startDate={newEnvStartDate}
        onStartDateChange={setNewEnvStartDate}
        endDate={newEnvEndDate}
        onEndDateChange={setNewEnvEndDate}
        plantaFile={newEnvPlantaFile}
        onPlantaFileChange={setNewEnvPlantaFile}
        projectFile={newEnvProjectFile}
        onProjectFileChange={setNewEnvProjectFile}
        onSubmit={handleCreateEnv}
        isSubmitting={createEnvMutation.isPending}
      />
      
      <AlertDialog open={envToDelete !== null} onOpenChange={(open) => !open && setEnvToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Ambiente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este ambiente? Esta ação não pode ser desfeita e todos os dados de liberação associados serão perdidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => envToDelete && deleteEnvMutation.mutate({ id: envToDelete })}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
