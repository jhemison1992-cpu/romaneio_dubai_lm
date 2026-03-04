import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { Trash2, Plus } from 'lucide-react';

interface ProjectUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
}

export const ProjectUsersModal: React.FC<ProjectUsersModalProps> = ({
  isOpen,
  onClose,
  projectId,
}) => {
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'viewer' | 'editor' | 'admin'>('viewer');
  const [isAdding, setIsAdding] = useState(false);

  // Aqui você adicionaria queries para listar usuários do projeto
  // Por enquanto, vamos criar uma interface básica

  const handleAddUser = async () => {
    if (!newUserEmail.trim()) {
      toast.error('Email é obrigatório');
      return;
    }

    setIsAdding(true);
    try {
      // TODO: Chamar API para adicionar usuário ao projeto
      toast.success(`Usuário ${newUserEmail} adicionado com sucesso!`);
      setNewUserEmail('');
      setNewUserRole('viewer');
    } catch (error) {
      toast.error('Erro ao adicionar usuário');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveUser = (userId: number) => {
    // TODO: Chamar API para remover usuário do projeto
    toast.success('Usuário removido com sucesso!');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gestão de Usuários do Projeto</DialogTitle>
          <DialogDescription>
            Adicione ou remova usuários e defina suas permissões
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Adicionar novo usuário */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="font-semibold mb-4 text-gray-900">Adicionar Novo Usuário</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user-email">Email do Usuário</Label>
                <Input
                  id="user-email"
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="usuario@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="user-role">Nível de Acesso</Label>
                <select
                  id="user-role"
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as 'viewer' | 'editor' | 'admin')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="viewer">Visualizador (apenas leitura)</option>
                  <option value="editor">Editor (pode editar dados)</option>
                  <option value="admin">Administrador (acesso total)</option>
                </select>
              </div>

              <Button onClick={handleAddUser} disabled={isAdding} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                {isAdding ? 'Adicionando...' : 'Adicionar Usuário'}
              </Button>
            </div>
          </div>

          {/* Lista de usuários */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-900">Usuários do Projeto</h4>
            <div className="space-y-2">
              {/* Exemplo de usuário */}
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">usuario@example.com</p>
                    <Badge variant="outline" className="mt-2">
                      Editor
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveUser(1)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>

              {/* Mensagem vazia */}
              <div className="text-center py-8 text-gray-500">
                <p>Nenhum usuário adicionado ainda</p>
              </div>
            </div>
          </div>

          {/* Informações sobre permissões */}
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-2 text-gray-900">Níveis de Acesso</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Visualizador:</strong> Pode visualizar dados, mas não pode editar</p>
              <p><strong>Editor:</strong> Pode visualizar e editar dados do projeto</p>
              <p><strong>Administrador:</strong> Acesso total, incluindo gestão de usuários</p>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
