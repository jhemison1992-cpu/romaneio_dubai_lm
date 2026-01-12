import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Building2, Plus, Settings, Trash2, ClipboardList, MapPin, User, Briefcase } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Projects() {
  const [, setLocation] = useLocation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contractor: "",
    technicalManager: "",
    supplier: "ALUMINC Esquadrias Metálicas Indústria e Comércio Ltda.",
  });

  const { data: projects, isLoading, refetch } = trpc.projects.list.useQuery();
  const createProject = trpc.projects.create.useMutation({
    onSuccess: () => {
      toast.success("Obra criada com sucesso!");
      setIsCreateDialogOpen(false);
      setFormData({
        name: "",
        address: "",
        contractor: "",
        technicalManager: "",
        supplier: "ALUMINC Esquadrias Metálicas Indústria e Comércio Ltda.",
      });
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao criar obra: " + error.message);
    },
  });

  const deleteProject = trpc.projects.delete.useMutation({
    onSuccess: () => {
      toast.success("Obra excluída com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao excluir obra: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Nome da obra é obrigatório");
      return;
    }
    createProject.mutate(formData);
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Tem certeza que deseja excluir a obra "${name}"? Todos os romaneios e ambientes serão perdidos.`)) {
      deleteProject.mutate({ id });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando obras...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Obras</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie as obras e seus respectivos ambientes e caixilhos
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Nova Obra
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Nova Obra</DialogTitle>
              <DialogDescription>
                Preencha os dados da obra para começar a criar romaneios
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Obra *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: DUBAI LM"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Ex: Avenida Lucianinho Melli, nº 444 – Vila Osasco – Osasco/SP"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contractor">Contratante</Label>
                <Input
                  id="contractor"
                  value={formData.contractor}
                  onChange={(e) => setFormData({ ...formData, contractor: e.target.value })}
                  placeholder="Ex: DUBAI LM EMPREENDIMENTOS IMOBILIÁRIOS SPE LTDA"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="technicalManager">Responsável Técnico</Label>
                <Input
                  id="technicalManager"
                  value={formData.technicalManager}
                  onChange={(e) => setFormData({ ...formData, technicalManager: e.target.value })}
                  placeholder="Ex: Eng. William"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier">Fornecedor / Instalador</Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  placeholder="ALUMINC Esquadrias Metálicas Indústria e Comércio Ltda."
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createProject.isPending}>
                  {createProject.isPending ? "Criando..." : "Criar Obra"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!projects || projects.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhuma obra cadastrada</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Crie sua primeira obra para começar a gerenciar romaneios de liberação de ambientes
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeira Obra
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-all border-l-4 border-l-primary">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="h-5 w-5 text-primary shrink-0" />
                      <CardTitle className="text-xl truncate">{project.name}</CardTitle>
                    </div>
                    {project.address && (
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{project.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  {project.contractor && (
                    <div className="flex items-start gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-xs text-muted-foreground uppercase tracking-wide">Contratante</p>
                        <p className="text-foreground line-clamp-2">{project.contractor}</p>
                      </div>
                    </div>
                  )}
                  {project.technicalManager && (
                    <div className="flex items-start gap-2">
                      <User className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-xs text-muted-foreground uppercase tracking-wide">Responsável Técnico</p>
                        <p className="text-foreground">{project.technicalManager}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t">
                  <div className="flex items-center gap-2 mb-3">
                    <ClipboardList className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Vistorias</span>
                    <Badge variant="secondary" className="ml-auto">
                      {project.inspectionCount || 0}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => setLocation(`/project/${project.id}/environments`)}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Gerenciar
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(project.id, project.name)}
                      disabled={deleteProject.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
