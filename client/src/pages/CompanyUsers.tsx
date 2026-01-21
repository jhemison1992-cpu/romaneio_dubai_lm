import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Mail, Trash2, Edit2, Plus } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function CompanyUsers() {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "supervisor" | "technician" | "viewer">("technician");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Obter empresa selecionada do localStorage
  const companyId = parseInt(localStorage.getItem("selectedCompanyId") || "1", 10);

  // Obter usuários da empresa
  const { data: users, isLoading, refetch } = trpc.companies.getUsers.useQuery(
    { companyId }
  );

  // Mutation para convidar usuário
  const inviteUserMutation = trpc.companies.inviteUser.useMutation({
    onSuccess: () => {
      setSuccess("Convite enviado com sucesso!");
      setInviteEmail("");
      setInviteRole("technician");
      setTimeout(() => setSuccess(""), 3000);
      refetch();
    },
    onError: (error) => {
      setError(error.message || "Erro ao enviar convite");
    },
  });

  // Mutation para remover usuário
  const removeUserMutation = trpc.companies.removeUser.useMutation({
    onSuccess: () => {
      setSuccess("Usuário removido com sucesso!");
      setTimeout(() => setSuccess(""), 3000);
      refetch();
    },
    onError: (error) => {
      setError(error.message || "Erro ao remover usuário");
    },
  });

  // Mutation para atualizar papel
  const updateRoleMutation = trpc.companies.updateUserRole.useMutation({
    onSuccess: () => {
      setSuccess("Papel atualizado com sucesso!");
      setTimeout(() => setSuccess(""), 3000);
      refetch();
    },
    onError: (error) => {
      setError(error.message || "Erro ao atualizar papel");
    },
  });

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!inviteEmail.trim()) {
      setError("Email é obrigatório");
      return;
    }

    inviteUserMutation.mutate({
      email: inviteEmail,
      companyId,
      role: inviteRole,
    });
  };

  const handleRemoveUser = (userId: number) => {
    if (confirm("Tem certeza que deseja remover este usuário?")) {
      removeUserMutation.mutate({ userId, companyId });
    }
  };

  const handleUpdateRole = (userId: number, newRole: string) => {
    updateRoleMutation.mutate({
      userId,
      companyId,
      role: newRole as "admin" | "supervisor" | "technician" | "viewer",
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "supervisor":
        return "bg-blue-100 text-blue-800";
      case "technician":
        return "bg-green-100 text-green-800";
      case "viewer":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Gerenciar Usuários</h1>
        <p className="text-muted-foreground mt-2">
          Convide novos usuários e gerencie papéis na sua empresa
        </p>
      </div>

      {/* Mensagens */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {/* Card de Convite */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Convidar Novo Usuário
          </CardTitle>
          <CardDescription>
            Envie um convite por email para adicionar um novo usuário à sua empresa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInviteUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium">Email do Usuário</label>
                <Input
                  type="email"
                  placeholder="usuario@empresa.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  disabled={inviteUserMutation.isPending}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Papel</label>
                <Select
                  value={inviteRole}
                  onValueChange={(value) =>
                    setInviteRole(value as "admin" | "supervisor" | "technician" | "viewer")
                  }
                  disabled={inviteUserMutation.isPending}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="technician">Técnico</SelectItem>
                    <SelectItem value="viewer">Visualizador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              type="submit"
              disabled={inviteUserMutation.isPending}
              className="w-full md:w-auto"
            >
              <Mail className="w-4 h-4 mr-2" />
              {inviteUserMutation.isPending ? "Enviando..." : "Enviar Convite"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lista de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários da Empresa</CardTitle>
          <CardDescription>
            {users?.length || 0} usuário{users && users.length !== 1 ? "s" : ""} na empresa
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando usuários...
            </div>
          ) : !users || users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum usuário encontrado
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{user.name || "Sem nome"}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Select
                      value={user.role}
                      onValueChange={(newRole) =>
                        handleUpdateRole(user.id, newRole)
                      }
                      disabled={updateRoleMutation.isPending}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="supervisor">Supervisor</SelectItem>
                        <SelectItem value="technician">Técnico</SelectItem>
                        <SelectItem value="viewer">Visualizador</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveUser(user.id)}
                      disabled={removeUserMutation.isPending}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabela de Papéis */}
      <Card>
        <CardHeader>
          <CardTitle>Papéis e Permissões</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Badge className="bg-red-100 text-red-800">Admin</Badge>
                <span className="font-semibold">Administrador</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Controle total sobre a empresa, gerenciar usuários, configurações e dados
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Badge className="bg-blue-100 text-blue-800">Supervisor</Badge>
                <span className="font-semibold">Supervisor</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Criar e gerenciar obras, atribuir vistórias, visualizar relatórios
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Badge className="bg-green-100 text-green-800">Técnico</Badge>
                <span className="font-semibold">Técnico</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Executar vistórias, tirar fotos, preencher formulários
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Badge className="bg-gray-100 text-gray-800">Visualizador</Badge>
                <span className="font-semibold">Visualizador</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Apenas visualizar dados, sem permissão para editar ou criar
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
