import React, { useState } from 'react';
import { ArrowLeft, Plus, Download, Edit2, Trash2, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { trpc } from '@/lib/trpc';
import { useLocation, useRoute } from 'wouter';
import { toast } from 'sonner';

export default function ProjectReport() {
  const [, params] = useRoute('/report/:id');
  const [, setLocation] = useLocation();
  const reportId = params?.id ? parseInt(params.id) : 0;
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    inspectionDate: "",
    responsibleName: "",
    responsibleRole: "",
    observations: "",
    generalConformity: "partial" as "ok" | "not_ok" | "partial",
  });

  // Queries
  const { data: report, isLoading: reportLoading, refetch: refetchReport } = trpc.projectReports.get.useQuery({ id: reportId });
  const { data: reportItems, isLoading: itemsLoading, refetch: refetchItems } = trpc.projectReports.getItems.useQuery({ reportId });

  // Mutations
  const updateReport = trpc.projectReports.update.useMutation({
    onSuccess: () => {
      toast.success("Relatório atualizado com sucesso!");
      setIsEditDialogOpen(false);
      refetchReport();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar relatório: " + error.message);
    },
  });

  const deleteReport = trpc.projectReports.delete.useMutation({
    onSuccess: () => {
      toast.success("Relatório excluído com sucesso!");
      setLocation("/");
    },
    onError: (error) => {
      toast.error("Erro ao excluir relatório: " + error.message);
    },
  });

  const deleteItem = trpc.projectReports.deleteItem.useMutation({
    onSuccess: () => {
      toast.success("Item removido com sucesso!");
      refetchItems();
    },
    onError: (error) => {
      toast.error("Erro ao remover item: " + error.message);
    },
  });

  const handleEditReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!report) return;
    
    updateReport.mutate({
      id: report.id,
      ...formData,
    });
  };

  const handleDeleteReport = () => {
    if (!report) return;
    deleteReport.mutate({ id: report.id });
    setDeleteConfirmOpen(false);
  };

  const handleDeleteItem = (itemId: number) => {
    deleteItem.mutate({ id: itemId });
  };

  const handleExportPDF = () => {
    if (!report) return;
    toast.info("Funcionalidade de exportação PDF em desenvolvimento...");
  };

  if (reportLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando relatório...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Relatório não encontrado</h2>
          <Button onClick={() => setLocation("/")} variant="outline">
            Voltar
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Exportar PDF
              </Button>
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFormData({
                        title: report.title,
                        inspectionDate: report.inspectionDate?.toString().split('T')[0] || "",
                        responsibleName: report.responsibleName,
                        responsibleRole: report.responsibleRole || "",
                        observations: report.observations || "",
                        generalConformity: report.generalConformity || "partial",
                      });
                    }}
                    className="gap-2"
                  >
                    <Edit2 className="h-4 w-4" />
                    Editar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Editar Relatório</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleEditReport} className="space-y-4">
                    <div>
                      <Label>Título</Label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Título do relatório"
                      />
                    </div>
                    <div>
                      <Label>Data da Inspeção</Label>
                      <Input
                        type="date"
                        value={formData.inspectionDate}
                        onChange={(e) => setFormData({ ...formData, inspectionDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Responsável</Label>
                      <Input
                        value={formData.responsibleName}
                        onChange={(e) => setFormData({ ...formData, responsibleName: e.target.value })}
                        placeholder="Nome do responsável"
                      />
                    </div>
                    <div>
                      <Label>Cargo/Função</Label>
                      <Input
                        value={formData.responsibleRole}
                        onChange={(e) => setFormData({ ...formData, responsibleRole: e.target.value })}
                        placeholder="Cargo ou função"
                      />
                    </div>
                    <div>
                      <Label>Conformidade Geral</Label>
                      <select
                        value={formData.generalConformity}
                        onChange={(e) => setFormData({ ...formData, generalConformity: e.target.value as any })}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="ok">OK</option>
                        <option value="partial">Parcial</option>
                        <option value="not_ok">Não Conforme</option>
                      </select>
                    </div>
                    <div>
                      <Label>Observações</Label>
                      <Textarea
                        value={formData.observations}
                        onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                        placeholder="Observações gerais do relatório"
                        rows={4}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">
                        Salvar Alterações
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditDialogOpen(false)}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteConfirmOpen(true)}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </Button>
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold">{report.title}</h1>
            <p className="text-muted-foreground mt-2">
              Data: {new Date(report.inspectionDate).toLocaleDateString('pt-BR')} • 
              Responsável: {report.responsibleName}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-bold capitalize">{report.status}</p>
              </div>
              <Badge variant={report.status === 'approved' ? 'default' : 'secondary'}>
                {report.status === 'approved' && <Check className="h-4 w-4 mr-1" />}
                {report.status}
              </Badge>
            </div>
          </Card>
          <Card className="p-6">
            <div>
              <p className="text-sm text-muted-foreground">Conformidade Geral</p>
              <p className="text-2xl font-bold capitalize">{report.generalConformity}</p>
            </div>
          </Card>
          <Card className="p-6">
            <div>
              <p className="text-sm text-muted-foreground">Ambientes Inspecionados</p>
              <p className="text-2xl font-bold">{reportItems?.length || 0}</p>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="ambientes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ambientes">Ambientes</TabsTrigger>
            <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
          </TabsList>

          <TabsContent value="ambientes" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Ambientes Inspecionados</h2>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Ambiente
              </Button>
            </div>

            {itemsLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Carregando ambientes...</p>
              </div>
            ) : reportItems && reportItems.length > 0 ? (
              <div className="grid gap-4">
                {reportItems.map((item) => (
                  <Card key={item.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Código: {item.caixilhoCode} • Tipo: {item.caixilhoType} • Qtd: {item.quantity}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={item.conformity === 'ok' ? 'default' : 'secondary'}>
                          {item.conformity}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {item.evolutionStatus && (
                      <p className="text-sm mb-2">
                        <strong>Evolução:</strong> {item.evolutionStatus}
                      </p>
                    )}
                    {item.observations && (
                      <p className="text-sm mb-2">
                        <strong>Observações:</strong> {item.observations}
                      </p>
                    )}
                    {item.defects && (
                      <p className="text-sm text-destructive">
                        <strong>Defeitos:</strong> {item.defects}
                      </p>
                    )}
                    {item.photoUrls && item.photoUrls.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium mb-2">Fotos ({item.photoUrls.length})</p>
                        <div className="grid grid-cols-4 gap-2">
                          {item.photoUrls.map((url: string, idx: number) => (
                            <img
                              key={idx}
                              src={url}
                              alt={`Foto ${idx + 1}`}
                              className="w-full h-24 object-cover rounded"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum ambiente inspecionado ainda</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="detalhes" className="space-y-4">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Informações do Relatório</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Título</p>
                  <p className="font-medium">{report.title}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data da Inspeção</p>
                  <p className="font-medium">{new Date(report.inspectionDate).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Responsável</p>
                  <p className="font-medium">{report.responsibleName}</p>
                </div>
                {report.responsibleRole && (
                  <div>
                    <p className="text-sm text-muted-foreground">Cargo/Função</p>
                    <p className="font-medium">{report.responsibleRole}</p>
                  </div>
                )}
                {report.observations && (
                  <div>
                    <p className="text-sm text-muted-foreground">Observações</p>
                    <p className="font-medium whitespace-pre-wrap">{report.observations}</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Relatório?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este relatório? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2">
            <AlertDialogCancel className="flex-1">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteReport}
              className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
