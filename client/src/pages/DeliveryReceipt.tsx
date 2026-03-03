import { useState } from "react";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { FileText, Plus, Trash2, Download } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DeliveryReceipt() {
  const { projectId } = useParams<{ projectId: string }>();
  const projectIdNum = parseInt(projectId || "0");
  
  const [receiptNumber, setReceiptNumber] = useState("");
  const [constructionResponsible, setConstructionResponsible] = useState("");
  const [supplierResponsible, setSupplierResponsible] = useState("");
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().split('T')[0]);
  const [observations, setObservations] = useState("");
  const [selectedEnvironments, setSelectedEnvironments] = useState<number[]>([]);
  
  // Queries
  const { data: receipts, isLoading: receiptsLoading } = trpc.deliveryReceipts.list.useQuery(
    { projectId: projectIdNum },
    { enabled: projectIdNum > 0 }
  );
  
  const { data: project } = trpc.projects.get.useQuery(
    { id: projectIdNum },
    { enabled: projectIdNum > 0 }
  );
  
  const { data: environments } = trpc.environments.list.useQuery(
    { projectId: projectIdNum },
    { enabled: projectIdNum > 0 }
  );
  
  // Mutations
  const createReceiptMutation = trpc.deliveryReceipts.create.useMutation({
    onSuccess: () => {
      toast.success("Termo de recebimento criado com sucesso!");
      setReceiptNumber("");
      setConstructionResponsible("");
      setSupplierResponsible("");
      setObservations("");
      setSelectedEnvironments([]);
    },
    onError: (error) => {
      toast.error("Erro ao criar termo: " + error.message);
    },
  });
  
  const addItemMutation = trpc.deliveryReceipts.addItem.useMutation({
    onSuccess: () => {
      toast.success("Item adicionado ao termo!");
    },
    onError: (error) => {
      toast.error("Erro ao adicionar item: " + error.message);
    },
  });
  
  const handleCreateReceipt = async () => {
    if (!receiptNumber.trim()) {
      toast.error("Número do termo é obrigatório");
      return;
    }
    
    if (selectedEnvironments.length === 0) {
      toast.error("Selecione pelo menos um ambiente");
      return;
    }
    
    try {
      const result = await createReceiptMutation.mutateAsync({
        projectId: projectIdNum,
        receiptNumber,
        constructionResponsible,
        supplierResponsible,
        receiptDate: new Date(receiptDate),
        observations,
      });
      
      // Adicionar ambientes selecionados
      for (const envId of selectedEnvironments) {
        const env = environments?.find(e => e.id === envId);
        if (env) {
          await addItemMutation.mutateAsync({
            deliveryReceiptId: result.insertId || 0,
            environmentId: envId,
            code: env.caixilhoCode || "",
            description: env.name,
            quantity: env.quantity || 1,
          });
        }
      }
    } catch (error) {
      console.error("Erro:", error);
    }
  };
  
  const toggleEnvironment = (envId: number) => {
    setSelectedEnvironments(prev =>
      prev.includes(envId) ? prev.filter(id => id !== envId) : [...prev, envId]
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Termo de Recebimento</h1>
          <p className="text-muted-foreground mt-1">{project?.name}</p>
        </div>
      </div>
      
      <Tabs defaultValue="new" className="space-y-6">
        <TabsList>
          <TabsTrigger value="new">Novo Termo</TabsTrigger>
          <TabsTrigger value="list">Termos Existentes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="new" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Criar Novo Termo de Recebimento</CardTitle>
              <CardDescription>Preencha os dados do termo e selecione os ambientes/caixilhos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="receipt-number">Número do Termo *</Label>
                  <Input
                    id="receipt-number"
                    value={receiptNumber}
                    onChange={(e) => setReceiptNumber(e.target.value)}
                    placeholder="Ex: TERM-2026-001"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="receipt-date">Data de Recebimento *</Label>
                  <Input
                    id="receipt-date"
                    type="date"
                    value={receiptDate}
                    onChange={(e) => setReceiptDate(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="construction-responsible">Responsável da Obra</Label>
                  <Input
                    id="construction-responsible"
                    value={constructionResponsible}
                    onChange={(e) => setConstructionResponsible(e.target.value)}
                    placeholder="Nome do responsável"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="supplier-responsible">Responsável da ALUMINC</Label>
                  <Input
                    id="supplier-responsible"
                    value={supplierResponsible}
                    onChange={(e) => setSupplierResponsible(e.target.value)}
                    placeholder="Nome do responsável"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="observations">Observações</Label>
                <textarea
                  id="observations"
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Adicione observações gerais sobre o recebimento..."
                  className="w-full min-h-24 p-2 border rounded"
                />
              </div>
              
              <div className="space-y-4">
                <Label>Selecione os Ambientes/Caixilhos *</Label>
                <div className="border rounded-lg p-4 space-y-3 max-h-96 overflow-y-auto">
                  {environments && environments.length > 0 ? (
                    environments.map((env) => (
                      <div key={env.id} className="flex items-center space-x-3 p-2 hover:bg-muted rounded">
                        <Checkbox
                          id={`env-${env.id}`}
                          checked={selectedEnvironments.includes(env.id)}
                          onCheckedChange={() => toggleEnvironment(env.id)}
                        />
                        <label
                          htmlFor={`env-${env.id}`}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="font-medium">{env.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {env.caixilhoCode} - Quantidade: {env.quantity}
                          </div>
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">Nenhum ambiente cadastrado</p>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedEnvironments.length} ambiente(s) selecionado(s)
                </p>
              </div>
              
              <Button
                onClick={handleCreateReceipt}
                disabled={createReceiptMutation.isPending}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                {createReceiptMutation.isPending ? "Criando..." : "Criar Termo de Recebimento"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="list" className="space-y-6">
          {receiptsLoading ? (
            <div className="text-center py-8">Carregando termos...</div>
          ) : receipts && receipts.length > 0 ? (
            <div className="space-y-4">
              {receipts.map((receipt) => (
                <Card key={receipt.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{receipt.receiptNumber}</CardTitle>
                        <CardDescription>
                          Data: {new Date(receipt.receiptDate).toLocaleDateString('pt-BR')}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          PDF
                        </Button>
                        <Button variant="outline" size="sm" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Responsável da Obra</p>
                        <p className="font-medium">{receipt.constructionResponsible || "-"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Responsável ALUMINC</p>
                        <p className="font-medium">{receipt.supplierResponsible || "-"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <p className="font-medium capitalize">{receipt.status}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum termo de recebimento criado</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
