import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Edit2, FileText, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { toast } from "sonner";

export default function ProjectEnvironments() {
  const [, params] = useRoute("/project/:id/environments");
  const [, setLocation] = useLocation();
  const projectId = params?.id ? parseInt(params.id) : 0;

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEnvironment, setEditingEnvironment] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    caixilhoCode: "",
    caixilhoType: "",
    quantity: 1,
    startDate: "",
    endDate: "",
  });
  const [plantaFile, setPlantaFile] = useState<File | null>(null);
  const [projectFile, setProjectFile] = useState<File | null>(null);
  const [uploadingPlanta, setUploadingPlanta] = useState(false);

  const { data: project } = trpc.projects.get.useQuery({ id: projectId });
  const { data: environments, isLoading, refetch } = trpc.environments.list.useQuery({ projectId });

  const createEnvironment = trpc.environments.create.useMutation({
    onSuccess: () => {
      toast.success("Ambiente adicionado com sucesso!");
      setIsCreateDialogOpen(false);
      setFormData({
        name: "",
        caixilhoCode: "",
        caixilhoType: "",
        quantity: 1,
        startDate: "",
        endDate: "",
      });
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao adicionar ambiente: " + error.message);
    },
  });

  const deleteEnvironment = trpc.environments.delete.useMutation({
    onSuccess: () => {
      toast.success("Ambiente excluído com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao excluir ambiente: " + error.message);
    },
  });

  const updateEnvironment = trpc.environments.update.useMutation({
    onSuccess: () => {
      toast.success("Ambiente atualizado com sucesso!");
      setIsEditDialogOpen(false);
      setEditingEnvironment(null);
      setFormData({
        name: "",
        caixilhoCode: "",
        caixilhoType: "",
        quantity: 1,
        startDate: "",
        endDate: "",
      });
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar ambiente: " + error.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.caixilhoCode.trim() || !formData.caixilhoType.trim()) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    
    let plantaFileKey: string | undefined;
    let plantaFileUrl: string | undefined;
    let projectFileKey: string | undefined;
    let projectFileUrl: string | undefined;
    
    // Upload da planta se fornecida
    if (plantaFile) {
      try {
        setUploadingPlanta(true);
        const formData = new FormData();
        formData.append('file', plantaFile);
        
        // Upload para S3
        const response = await fetch('/api/upload-planta', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) throw new Error('Erro ao fazer upload da planta');
        
        const data = await response.json();
        plantaFileKey = data.fileKey;
        plantaFileUrl = data.fileUrl;
      } catch (error) {
        toast.error('Erro ao fazer upload da planta');
        setUploadingPlanta(false);
        return;
      } finally {
        setUploadingPlanta(false);
      }
    }
    
    // Upload do projeto se fornecido
    if (projectFile) {
      try {
        setUploadingPlanta(true);
        const formData = new FormData();
        formData.append('file', projectFile);
        
        // Upload para S3
        const response = await fetch('/api/upload-planta', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) throw new Error('Erro ao fazer upload do projeto');
        
        const data = await response.json();
        projectFileKey = data.fileKey;
        projectFileUrl = data.fileUrl;
      } catch (error) {
        toast.error('Erro ao fazer upload do projeto');
        setUploadingPlanta(false);
        return;
      } finally {
        setUploadingPlanta(false);
      }
    }
    
    createEnvironment.mutate({
      projectId,
      ...formData,
      technicalDrawingUrl: plantaFileUrl,
      projectFileKey,
      projectFileUrl,
    });
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Tem certeza que deseja excluir o ambiente "${name}"?`)) {
      deleteEnvironment.mutate({ id });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando ambientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-7xl">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => setLocation("/projects")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para Obras
      </Button>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">{project?.name || "Obra"}</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie os ambientes e caixilhos desta obra
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Novo Ambiente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Ambiente</DialogTitle>
              <DialogDescription>
                Preencha os dados do ambiente e seu caixilho
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Ambiente *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Piscina Coberta"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="caixilhoCode">Código do Caixilho *</Label>
                <Input
                  id="caixilhoCode"
                  value={formData.caixilhoCode}
                  onChange={(e) => setFormData({ ...formData, caixilhoCode: e.target.value })}
                  placeholder="Ex: AL 008 (CA08)"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="caixilhoType">Tipo do Caixilho *</Label>
                <Textarea
                  id="caixilhoType"
                  value={formData.caixilhoType}
                  onChange={(e) => setFormData({ ...formData, caixilhoType: e.target.value })}
                  placeholder="Ex: Fixo 4 Módulos com Bandeira de Tela, com Travessa - Linha-32"
                  rows={3}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantidade *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Data de Liberação</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Data de Finalização</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="planta">Planta Técnica (PDF)</Label>
                <Input
                  id="planta"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setPlantaFile(e.target.files?.[0] || null)}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">Opcional: Anexe o PDF da planta técnica</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="projeto">Projeto do Caixilho (PDF)</Label>
                <Input
                  id="projeto"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setProjectFile(e.target.files?.[0] || null)}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">Opcional: Anexe o PDF do projeto do caixilho</p>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createEnvironment.isPending || uploadingPlanta}>
                  {createEnvironment.isPending ? "Adicionando..." : "Adicionar Ambiente"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!environments || environments.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <h3 className="text-xl font-semibold mb-2">Nenhum ambiente cadastrado</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Adicione os ambientes e caixilhos desta obra para poder criar romaneios
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Primeiro Ambiente
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {environments?.map((env: any) => (
            <Card key={env.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{env.name}</CardTitle>
                    <CardDescription className="mt-2">
                      <span className="font-medium">Caixilho:</span> {env.caixilhoCode}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingEnvironment(env);
                        setFormData({
                          name: env.name,
                          caixilhoCode: env.caixilhoCode,
                          caixilhoType: env.caixilhoType,
                          quantity: env.quantity,
                          startDate: env.startDate || "",
                          endDate: env.endDate || "",
                        });
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(env.id, env.name)}
                      disabled={deleteEnvironment.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium">Tipo:</span>
                    <p className="text-muted-foreground">{env.caixilhoType}</p>
                  </div>
                  <div>
                    <span className="font-medium">Quantidade:</span> {env.quantity} peça(s)
                  </div>
                  <div className="flex gap-2 mt-3">
                    {env.technicalDrawingUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(env.technicalDrawingUrl, '_blank')}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Ver Planta
                      </Button>
                    )}
                    {env.projectFileUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(env.projectFileUrl, '_blank')}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Ver Projeto
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Ambiente</DialogTitle>
            <DialogDescription>
              Atualize os dados do ambiente
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={async (e) => {
            e.preventDefault();
            if (!formData.name.trim() || !formData.caixilhoCode.trim() || !formData.caixilhoType.trim()) {
              toast.error("Preencha todos os campos obrigatórios");
              return;
            }
            
            let plantaFileKey: string | undefined;
            let plantaFileUrl: string | undefined;
            let projectFileKey: string | undefined;
            let projectFileUrl: string | undefined;
            
            // Upload da planta se fornecida
            if (plantaFile) {
              setUploadingPlanta(true);
              try {
                const formData = new FormData();
                formData.append('file', plantaFile);
                const response = await fetch('/api/upload-planta', {
                  method: 'POST',
                  body: formData,
                });
                if (!response.ok) throw new Error('Falha no upload da planta');
                const data = await response.json();
                plantaFileKey = data.fileKey;
                plantaFileUrl = data.fileUrl;
              } catch (error) {
                toast.error('Erro ao fazer upload da planta');
                setUploadingPlanta(false);
                return;
              }
              setUploadingPlanta(false);
            }
            
            // Upload do projeto se fornecido
            if (projectFile) {
              setUploadingPlanta(true);
              try {
                const formData = new FormData();
                formData.append('file', projectFile);
                const response = await fetch('/api/upload-planta', {
                  method: 'POST',
                  body: formData,
                });
                if (!response.ok) throw new Error('Falha no upload do projeto');
                const data = await response.json();
                projectFileKey = data.fileKey;
                projectFileUrl = data.fileUrl;
              } catch (error) {
                toast.error('Erro ao fazer upload do projeto');
                setUploadingPlanta(false);
                return;
              }
              setUploadingPlanta(false);
            }
            
            updateEnvironment.mutate({
              id: editingEnvironment.id,
              ...formData,
              ...(plantaFileKey && { plantaFileKey, plantaFileUrl }),
              ...(projectFileKey && { projectFileKey, projectFileUrl }),
            });
          }} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome do Ambiente *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Piscina Coberta"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-caixilhoCode">Código do Caixilho *</Label>
              <Input
                id="edit-caixilhoCode"
                value={formData.caixilhoCode}
                onChange={(e) => setFormData({ ...formData, caixilhoCode: e.target.value })}
                placeholder="Ex: AL 008 (CA08)"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-caixilhoType">Tipo do Caixilho *</Label>
              <Textarea
                id="edit-caixilhoType"
                value={formData.caixilhoType}
                onChange={(e) => setFormData({ ...formData, caixilhoType: e.target.value })}
                placeholder="Ex: Fixo 4 Módulos com Bandeira de Tela, com Travessa - Linha-32"
                rows={3}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-quantity">Quantidade *</Label>
              <Input
                id="edit-quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-startDate">Data de Liberação</Label>
              <Input
                id="edit-startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-endDate">Data de Finalização</Label>
              <Input
                id="edit-endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-planta">Planta Técnica (PDF)</Label>
              <Input
                id="edit-planta"
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setPlantaFile(file);
                  }
                }}
              />
              {editingEnvironment?.plantaFileUrl && (
                <p className="text-sm text-muted-foreground">Planta atual: {editingEnvironment.plantaFileUrl.split('/').pop()}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-project">Projeto do Caixilho (PDF)</Label>
              <Input
                id="edit-project"
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setProjectFile(file);
                  }
                }}
              />
              {editingEnvironment?.projectFileUrl && (
                <p className="text-sm text-muted-foreground">Projeto atual: {editingEnvironment.projectFileUrl.split('/').pop()}</p>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={updateEnvironment.isPending}>
                {updateEnvironment.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
