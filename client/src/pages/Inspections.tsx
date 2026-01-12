import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ClipboardList, Edit2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function Inspections() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  
  const utils = trpc.useUtils();
  const { data: inspections, isLoading } = trpc.inspections.list.useQuery();
  const { data: projects } = trpc.projects.list.useQuery();
  
  const createMutation = trpc.inspections.create.useMutation({
    onSuccess: () => {
      utils.inspections.list.invalidate();
      toast.success("Vistoria criada com sucesso!");
      setOpen(false);
      setTitle("");
      setSelectedProjectId("");
    },
    onError: (error) => {
      toast.error("Erro ao criar vistoria: " + error.message);
    },
  });
  
  const deleteMutation = trpc.inspections.delete.useMutation({
    onSuccess: () => {
      utils.inspections.list.invalidate();
      toast.success("Vistoria excluída com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao excluir vistoria: " + error.message);
    },
  });
  
  const updateTitleMutation = trpc.inspections.updateTitle.useMutation({
    onSuccess: () => {
      utils.inspections.list.invalidate();
      toast.success("Título atualizado com sucesso!");
      setEditingId(null);
    },
    onError: (error) => {
      toast.error("Erro ao atualizar título: " + error.message);
    },
  });
  
  const handleCreate = () => {
    if (!title.trim()) {
      toast.error("Por favor, informe um título para a vistoria");
      return;
    }
    if (!selectedProjectId) {
      toast.error("Por favor, selecione uma obra");
      return;
    }
    createMutation.mutate({ 
      title,
      projectId: parseInt(selectedProjectId)
    });
  };
  
  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta vistoria?")) {
      deleteMutation.mutate({ id });
    }
  };
  
  const handleEditTitle = (inspection: any) => {
    setEditingId(inspection.id);
    setEditTitle(inspection.title);
  };
  
  const handleSaveTitle = () => {
    if (!editTitle.trim() || !editingId) return;
    updateTitleMutation.mutate({ id: editingId, title: editTitle });
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "draft": return "Rascunho";
      case "in_progress": return "Em Andamento";
      case "completed": return "Concluída";
      default: return status;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "text-muted-foreground";
      case "in_progress": return "text-orange-600";
      case "completed": return "text-green-600";
      default: return "text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Carregando vistorias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vistorias</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie as vistorias de liberação de ambientes
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Nova Vistoria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Vistoria</DialogTitle>
              <DialogDescription>
                Selecione a obra e informe um título para esta vistoria
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="project">Obra *</Label>
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                  <SelectTrigger id="project">
                    <SelectValue placeholder="Selecione a obra" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects?.map((project) => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Título da Vistoria *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Romaneio ALUMINC"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending ? "Criando..." : "Criar Vistoria"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {!inspections || inspections.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ClipboardList className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma vistoria encontrada</h3>
            <p className="text-muted-foreground text-center mb-6">
              Crie sua primeira vistoria para começar a registrar as liberações de ambientes
            </p>
            <Button onClick={() => setOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Criar Primeira Vistoria
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {inspections.map((inspection) => (
            <Card key={inspection.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {editingId === inspection.id ? (
                      <div className="flex gap-2 mb-2">
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSaveTitle()}
                          className="text-xl font-semibold"
                        />
                        <Button size="sm" onClick={handleSaveTitle}>
                          Salvar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <CardTitle className="text-xl mb-2">{inspection.title}</CardTitle>
                    )}
                    <CardDescription>
                      Criada em {format(new Date(inspection.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditTitle(inspection)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(inspection.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <span className={`text-sm font-medium ${getStatusColor(inspection.status)}`}>
                    {getStatusLabel(inspection.status)}
                  </span>
                </div>
                <Link href={`/inspection/${inspection.id}`}>
                  <Button className="w-full">
                    Abrir Vistoria
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
