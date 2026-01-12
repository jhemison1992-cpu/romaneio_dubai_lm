import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ClipboardList, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function Inspections() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  
  const utils = trpc.useUtils();
  const { data: inspections, isLoading } = trpc.inspections.list.useQuery();
  
  const createMutation = trpc.inspections.create.useMutation({
    onSuccess: () => {
      utils.inspections.list.invalidate();
      toast.success("Vistoria criada com sucesso!");
      setOpen(false);
      setTitle("");
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
  
  const handleCreate = () => {
    if (!title.trim()) {
      toast.error("Por favor, informe um título para a vistoria");
      return;
    }
    createMutation.mutate({ title });
  };
  
  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta vistoria?")) {
      deleteMutation.mutate({ id });
    }
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
            Gerencie as vistorias de liberação de ambientes do empreendimento DUBAI LM
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
                Informe um título para identificar esta vistoria
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="title">Título da Vistoria</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Vistoria 01/2026 - Áreas Comuns"
                className="mt-2"
              />
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
                    <CardTitle className="text-xl mb-2">{inspection.title}</CardTitle>
                    <CardDescription>
                      Criada em {format(new Date(inspection.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(inspection.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
