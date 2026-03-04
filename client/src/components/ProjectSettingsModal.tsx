import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

interface ProjectSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  onSuccess?: () => void;
}

export const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({
  isOpen,
  onClose,
  projectId,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contractor: '',
    supplier: '',
    technicalManager: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  const { data: project } = trpc.projects.get.useQuery({ id: projectId });
  const updateProject = trpc.projects.update.useMutation({
    onSuccess: () => {
      toast.success('Projeto atualizado com sucesso!');
      onClose();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error('Erro ao atualizar projeto: ' + error.message);
    },
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        address: project.address || '',
        contractor: project.contractor || '',
        supplier: project.supplier || '',
        technicalManager: project.technicalManager || '',
      });
    }
  }, [project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Nome do projeto é obrigatório');
      return;
    }
    setIsLoading(true);
    updateProject.mutate({
      id: projectId,
      ...formData,
    });
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configurações do Projeto</DialogTitle>
          <DialogDescription>
            Edite as informações do projeto
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Nome do Projeto *</Label>
            <Input
              id="project-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: DUBAI LM Empreendimentos"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-address">Endereço</Label>
            <Input
              id="project-address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Ex: Avenida Lucianinho Melli, 444, Vila Osasco"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project-contractor">Contratante</Label>
              <Input
                id="project-contractor"
                value={formData.contractor}
                onChange={(e) => setFormData({ ...formData, contractor: e.target.value })}
                placeholder="Ex: Dubai LM Empreendimentos Imobiliários"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-supplier">Fornecedor</Label>
              <Input
                id="project-supplier"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                placeholder="Ex: ALUMINC Instalações"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-manager">Responsável Técnico</Label>
            <Input
              id="project-manager"
              value={formData.technicalManager}
              onChange={(e) => setFormData({ ...formData, technicalManager: e.target.value })}
              placeholder="Ex: Eng. Willian"
            />
          </div>



          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={onClose} type="button">
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
