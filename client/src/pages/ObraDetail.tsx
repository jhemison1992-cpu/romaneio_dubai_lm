import React, { useState, useMemo, useRef } from 'react';
import { AlertCircle, CheckCircle2, Clock, Zap, BarChart3, Users, DollarSign, Settings, ArrowLeft, Plus, Check, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/lib/trpc';
import { useLocation, useRoute } from 'wouter';
import { toast } from 'sonner';
import { GanttChart } from '@/components/GanttChart';
import { ProjectSettingsModal } from '@/components/ProjectSettingsModal';
import { ActivityTracker } from '@/components/ActivityTracker';
import { PDFReportGenerator } from '@/components/PDFReportGenerator';
import { AdvancedPDFReportGenerator } from '@/components/AdvancedPDFReportGenerator';
import { PDFStructureImporter } from '@/components/PDFStructureImporter';
import { SignedPDFReportGenerator } from '@/components/SignedPDFReportGenerator';
import OrganizedWindowsList from '@/components/OrganizedWindowsList';
import ProfessionalReportTemplate from '@/components/ProfessionalReportTemplate';
import ProfessionalProgressDashboard from '@/components/ProfessionalProgressDashboard';

export default function ObraDetail() {
  const [, params] = useRoute('/obra/:id');
  const [, setLocation] = useLocation();
  const projectId = params?.id ? parseInt(params.id) : 0;
  
  const [activeTab, setActiveTab] = useState('visao-geral');
  const [showReportTemplate, setShowReportTemplate] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const [isProjectSettingsOpen, setIsProjectSettingsOpen] = useState(false);
  const [isCreateEnvironmentDialogOpen, setIsCreateEnvironmentDialogOpen] = useState(false);
  const [isEditEnvironmentDialogOpen, setIsEditEnvironmentDialogOpen] = useState(false);
  const [editingEnvironment, setEditingEnvironment] = useState<any>(null);
  const [selectedEnvironments, setSelectedEnvironments] = useState<Set<number>>(new Set());
  const [environmentFormData, setEnvironmentFormData] = useState({
    name: "",
    caixilhoCode: "",
    caixilhoType: "",
    quantity: 1,
    startDate: "",
    endDate: "",
  });

  // Queries
  const { data: project, isLoading: projectLoading } = trpc.projects.get.useQuery({ id: projectId });
  const { data: environments, isLoading: environmentsLoading, refetch: refetchEnvironments } = trpc.environments.list.useQuery({ projectId });
  const { data: inspections } = trpc.inspections.list.useQuery();

  // Mutations
  const createEnvironment = trpc.environments.create.useMutation({
    onSuccess: () => {
      toast.success("Ambiente adicionado com sucesso!");
      setIsCreateEnvironmentDialogOpen(false);
      setEnvironmentFormData({
        name: "",
        caixilhoCode: "",
        caixilhoType: "",
        quantity: 1,
        startDate: "",
        endDate: "",
      });
      refetchEnvironments();
    },
    onError: (error) => {
      toast.error("Erro ao adicionar ambiente: " + error.message);
    },
  });

  const updateEnvironment = trpc.environments.update.useMutation({
    onSuccess: () => {
      toast.success("Ambiente atualizado com sucesso!");
      setIsEditEnvironmentDialogOpen(false);
      setEditingEnvironment(null);
      setEnvironmentFormData({
        name: "",
        caixilhoCode: "",
        caixilhoType: "",
        quantity: 1,
        startDate: "",
        endDate: "",
      });
      refetchEnvironments();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar ambiente: " + error.message);
    },
  });

  const deleteEnvironment = trpc.environments.delete.useMutation({
    onSuccess: () => {
      toast.success("Ambiente excluído com sucesso!");
      refetchEnvironments();
    },
    onError: (error) => {
      toast.error("Erro ao excluir ambiente: " + error.message);
    },
  });

  const handleCreateEnvironment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!environmentFormData.name.trim() || !environmentFormData.caixilhoCode.trim() || !environmentFormData.caixilhoType.trim()) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    createEnvironment.mutate({ projectId, ...environmentFormData });
  };

  const handleUpdateEnvironment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!environmentFormData.name.trim() || !environmentFormData.caixilhoCode.trim() || !environmentFormData.caixilhoType.trim()) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    updateEnvironment.mutate({
      id: editingEnvironment.id,
      ...environmentFormData,
    });
  };

  const handleDeleteEnvironment = (id: number, name: string) => {
    if (confirm(`Tem certeza que deseja excluir o ambiente "${name}"?`)) {
      deleteEnvironment.mutate({ id });
    }
  };

  const toggleEnvironmentSelection = (envId: number) => {
    const newSelected = new Set(selectedEnvironments);
    if (newSelected.has(envId)) {
      newSelected.delete(envId);
    } else {
      newSelected.add(envId);
    }
    setSelectedEnvironments(newSelected);
  };

  const getEnvironmentStatus = (env: any) => {
    const inspection = inspections?.find((i: any) => i.projectId === projectId);
    if (!inspection) return { status: 'Não Iniciado', color: 'bg-gray-100 text-gray-700' };
    
    const progress: number = 0;
    if (progress === 100) {
      return { status: 'Concluído', color: 'bg-green-100 text-green-700' };
    } else if (progress > 0) {
      return { status: 'Em Andamento', color: 'bg-blue-100 text-blue-700' };
    }
    return { status: 'Não Iniciado', color: 'bg-gray-100 text-gray-700' };
  };

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando obra...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Obra não encontrada</p>
          <Button className="mt-4" onClick={() => setLocation('/obras')}>
            Voltar para Obras
          </Button>
        </div>
      </div>
    );
  }

  const totalEnvironments = environments?.length || 0;
  const completedEnvironments = environments?.filter((env: any) => {
    const status = getEnvironmentStatus(env);
    return status.status === 'Concluído';
  }).length || 0;
  const inProgressEnvironments = environments?.filter((env: any) => {
    const status = getEnvironmentStatus(env);
    return status.status === 'Em Andamento';
  }).length || 0;
  const notStartedEnvironments = environments?.filter((env: any) => {
    const status = getEnvironmentStatus(env);
    return status.status === 'Não Iniciado';
  }).length || 0;

  const kpis = [
    { label: 'Ambientes', valor: totalEnvironments, icon: AlertCircle, cor: 'bg-teal-100 text-teal-600' },
    { label: 'Concluídos', valor: completedEnvironments, icon: CheckCircle2, cor: 'bg-green-100 text-green-600' },
    { label: 'Em Andamento', valor: inProgressEnvironments, icon: Clock, cor: 'bg-blue-100 text-blue-600' },
    { label: 'Não Iniciados', valor: notStartedEnvironments, icon: AlertCircle, cor: 'bg-orange-100 text-orange-600' },
  ];

  const progressPercentage = totalEnvironments > 0 ? Math.round((completedEnvironments / totalEnvironments) * 100) : 0;

  return (
    <div className="flex-1 overflow-auto bg-gray-50 w-full">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-3 md:p-8">
        <div className="max-w-7xl mx-auto px-0 md:px-4">
          <div className="flex flex-col md:flex-row items-start justify-between gap-3 md:gap-0 mb-4 md:mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => setLocation('/obras')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
                <p className="text-gray-300">{project.address}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                onClick={() => setIsProjectSettingsOpen(true)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Editar
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-semibold">Progresso Geral</span>
              <span className="text-2xl font-bold">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-teal-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
            {kpis.map((kpi, idx) => {
              const Icon = kpi.icon;
              return (
                <div key={idx} className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm">{kpi.label}</p>
                      <p className="text-3xl font-bold">{kpi.valor}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${kpi.cor}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-3 md:px-8 py-3 md:py-6 w-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex flex-wrap w-full bg-white border-b border-gray-200 rounded-none h-auto p-0 gap-0 md:overflow-x-visible md:flex-nowrap md:overflow-x-auto justify-start">
            <TabsTrigger value="visao-geral" className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 text-xs md:text-sm py-3 px-2 md:px-8 font-medium hover:bg-gray-50 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 flex-shrink-0 border-r border-gray-200 md:border-r md:whitespace-nowrap w-1/4 md:w-auto md:min-w-max">
              <AlertCircle className="h-5 w-5 md:h-4 md:w-4 flex-shrink-0" />
              <span className="hidden md:inline">Visão Geral</span>
              <span className="md:hidden">Geral</span>
            </TabsTrigger>
            <TabsTrigger value="acompanhamento" className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 text-xs md:text-sm py-3 px-2 md:px-8 font-medium hover:bg-gray-50 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 flex-shrink-0 border-r border-gray-200 md:border-r md:whitespace-nowrap w-1/4 md:w-auto md:min-w-max">
              <BarChart3 className="h-5 w-5 md:h-4 md:w-4 flex-shrink-0" />
              <span className="hidden md:inline">Acompanhamento</span>
              <span className="md:hidden">Acomp.</span>
            </TabsTrigger>
            <TabsTrigger value="ambientes" className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 text-xs md:text-sm py-3 px-2 md:px-8 font-medium hover:bg-gray-50 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 flex-shrink-0 border-r border-gray-200 md:border-r md:whitespace-nowrap w-1/4 md:w-auto md:min-w-max">
              <Zap className="h-5 w-5 md:h-4 md:w-4 flex-shrink-0" />
              <span className="hidden md:inline">Ambientes</span>
              <span className="md:hidden">Amb.</span>
            </TabsTrigger>
            <TabsTrigger value="cronograma" className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 text-xs md:text-sm py-3 px-2 md:px-8 font-medium hover:bg-gray-50 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 flex-shrink-0 border-r border-gray-200 md:border-r md:whitespace-nowrap w-1/4 md:w-auto md:min-w-max">
              <Clock className="h-5 w-5 md:h-4 md:w-4 flex-shrink-0" />
              <span className="hidden md:inline">Cronograma</span>
              <span className="md:hidden">Cron.</span>
            </TabsTrigger>
            <TabsTrigger value="vistorias" className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 text-xs md:text-sm py-3 px-2 md:px-8 font-medium hover:bg-gray-50 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 flex-shrink-0 border-r border-gray-200 md:border-r md:whitespace-nowrap w-1/4 md:w-auto md:min-w-max">
              <CheckCircle2 className="h-5 w-5 md:h-4 md:w-4 flex-shrink-0" />
              <span className="hidden md:inline">Vistorias</span>
              <span className="md:hidden">Vist.</span>
            </TabsTrigger>
            <TabsTrigger value="controle" className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 text-xs md:text-sm py-3 px-2 md:px-8 font-medium hover:bg-gray-50 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 flex-shrink-0 border-r border-gray-200 md:border-r md:whitespace-nowrap w-1/4 md:w-auto md:min-w-max">
              <Users className="h-5 w-5 md:h-4 md:w-4 flex-shrink-0" />
              <span className="hidden md:inline">Controle</span>
              <span className="md:hidden">Ctrl.</span>
            </TabsTrigger>
            <TabsTrigger value="relatorio" className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 text-xs md:text-sm py-4 px-4 md:px-8 font-medium hover:bg-gray-50 flex items-center gap-2 whitespace-nowrap flex-shrink-0 min-w-max">
              <DollarSign className="h-5 w-5 md:h-4 md:w-4 flex-shrink-0" />
              <span className="hidden md:inline">Relatório</span>
              <span className="md:hidden">Rel.</span>
            </TabsTrigger>
          </TabsList>

          {/* Visão Geral Tab */}
          <TabsContent value="visao-geral" className="space-y-6 mt-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Informações da Obra */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Informações da Obra</h3>
                <div className="space-y-3">
                  {project.contractor && (
                    <div>
                      <p className="text-sm text-gray-500">Contratante</p>
                      <p className="font-medium text-gray-900">{project.contractor}</p>
                    </div>
                  )}
                  {project.technicalManager && (
                    <div>
                      <p className="text-sm text-gray-500">Responsável Técnico</p>
                      <p className="font-medium text-gray-900">{project.technicalManager}</p>
                    </div>
                  )}
                  {project.supplier && (
                    <div>
                      <p className="text-sm text-gray-500">Fornecedor</p>
                      <p className="font-medium text-gray-900">{project.supplier}</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Resumo de Ambientes */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Resumo de Ambientes</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Total</span>
                    <span className="text-lg font-bold text-gray-900">{totalEnvironments}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-600">Concluídos</span>
                    <span className="text-lg font-bold text-green-600">{completedEnvironments}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-600">Em Andamento</span>
                    <span className="text-lg font-bold text-blue-600">{inProgressEnvironments}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-orange-600">Não Iniciados</span>
                    <span className="text-lg font-bold text-orange-600">{notStartedEnvironments}</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Activity Tracker */}
            <ActivityTracker
              activities={[
                {
                  id: 1,
                  type: 'created',
                  title: 'Projeto criado',
                  description: 'O projeto foi criado com sucesso',
                  timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                  user: 'Administrador',
                },
              ]}
              maxItems={5}
            />
          </TabsContent>

          {/* Acompanhamento Tab */}
          <TabsContent value="acompanhamento" className="mt-6">
            <ProfessionalProgressDashboard
              windows={environments || []}
              onWindowSelect={(window) => {
                console.log('Window selected:', window);
              }}
            />
          </TabsContent>

          {/* Ambientes Tab */}
          <TabsContent value="ambientes" className="mt-6">
            {/* Botões de Ação */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-6 w-full">
              <PDFStructureImporter
                projectId={projectId}
                onSuccess={() => refetchEnvironments()}
              />
              <AdvancedPDFReportGenerator
                projectId={projectId}
                projectName={project?.name || 'Projeto'}
                projectAddress={project?.address || ''}
                contractor={project?.contractor || ''}
                technicalManager={project?.technicalManager || ''}
                supplier={project?.supplier || ''}
                environmentCount={totalEnvironments}
                completedCount={completedEnvironments}
                environments={environments}
              />
              <SignedPDFReportGenerator
                projectId={projectId}
                projectName={project?.name || 'Projeto'}
                projectAddress={project?.address || ''}
                contractor={project?.contractor || ''}
                technicalManager={project?.technicalManager || ''}
                supplier={project?.supplier || ''}
                environmentCount={totalEnvironments}
                completedCount={completedEnvironments}
                environments={environments}
              />
            </div>

            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Lista de Ambientes</h3>
              <Dialog open={isCreateEnvironmentDialogOpen} onOpenChange={setIsCreateEnvironmentDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Ambiente
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Adicionar Novo Ambiente</DialogTitle>
                    <DialogDescription>
                      Preencha os dados do novo ambiente
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateEnvironment} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome do Ambiente *</Label>
                      <Input
                        id="name"
                        value={environmentFormData.name}
                        onChange={(e) => setEnvironmentFormData({ ...environmentFormData, name: e.target.value })}
                        placeholder="Ex: Piscina Coberta"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="caixilhoCode">Código do Caixilho *</Label>
                      <Input
                        id="caixilhoCode"
                        value={environmentFormData.caixilhoCode}
                        onChange={(e) => setEnvironmentFormData({ ...environmentFormData, caixilhoCode: e.target.value })}
                        placeholder="Ex: AL 008 (CA08)"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="caixilhoType">Tipo do Caixilho *</Label>
                      <Textarea
                        id="caixilhoType"
                        value={environmentFormData.caixilhoType}
                        onChange={(e) => setEnvironmentFormData({ ...environmentFormData, caixilhoType: e.target.value })}
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
                        value={environmentFormData.quantity}
                        onChange={(e) => setEnvironmentFormData({ ...environmentFormData, quantity: parseInt(e.target.value) || 1 })}
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsCreateEnvironmentDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={createEnvironment.isPending}>
                        {createEnvironment.isPending ? "Adicionando..." : "Adicionar Ambiente"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {environmentsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-muted-foreground">Carregando ambientes...</p>
              </div>
            ) : !environments || environments.length === 0 ? (
              <Card className="p-8">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="text-lg font-semibold mb-2">Nenhum ambiente cadastrado</h4>
                  <p className="text-muted-foreground mb-6">Adicione ambientes para começar a gerenciar as vistorias</p>
                  <Button onClick={() => setIsCreateEnvironmentDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Primeiro Ambiente
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="space-y-3">
                {environments.map((env: any) => {
                  const envStatus = getEnvironmentStatus(env);
                  const isSelected = selectedEnvironments.has(env.id);
                  
                  return (
                    <Card key={env.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleEnvironmentSelection(env.id)}
                          className="h-5 w-5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-base font-semibold text-gray-900">{env.name}</h4>
                            <Badge className={`${envStatus.color}`}>
                              {envStatus.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Código:</span> {env.caixilhoCode}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Tipo:</span> {env.caixilhoType}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Quantidade:</span> {env.quantity} peça(s)
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setEditingEnvironment(env);
                              setEnvironmentFormData({
                                name: env.name,
                                caixilhoCode: env.caixilhoCode,
                                caixilhoType: env.caixilhoType,
                                quantity: env.quantity,
                                startDate: env.startDate || "",
                                endDate: env.endDate || "",
                              });
                              setIsEditEnvironmentDialogOpen(true);
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteEnvironment(env.id, env.name)}
                            disabled={deleteEnvironment.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Dialog de Edição */}
            <Dialog open={isEditEnvironmentDialogOpen} onOpenChange={setIsEditEnvironmentDialogOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Editar Ambiente</DialogTitle>
                  <DialogDescription>
                    Atualize as informações do ambiente
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdateEnvironment} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Nome do Ambiente *</Label>
                    <Input
                      id="edit-name"
                      value={environmentFormData.name}
                      onChange={(e) => setEnvironmentFormData({ ...environmentFormData, name: e.target.value })}
                      placeholder="Ex: Piscina Coberta"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-caixilhoCode">Código do Caixilho *</Label>
                    <Input
                      id="edit-caixilhoCode"
                      value={environmentFormData.caixilhoCode}
                      onChange={(e) => setEnvironmentFormData({ ...environmentFormData, caixilhoCode: e.target.value })}
                      placeholder="Ex: AL 008 (CA08)"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-caixilhoType">Tipo do Caixilho *</Label>
                    <Textarea
                      id="edit-caixilhoType"
                      value={environmentFormData.caixilhoType}
                      onChange={(e) => setEnvironmentFormData({ ...environmentFormData, caixilhoType: e.target.value })}
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
                      value={environmentFormData.quantity}
                      onChange={(e) => setEnvironmentFormData({ ...environmentFormData, quantity: parseInt(e.target.value) || 1 })}
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsEditEnvironmentDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={updateEnvironment.isPending}>
                      {updateEnvironment.isPending ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Vistorias Tab */}
          <TabsContent value="vistorias" className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Vistorias</h3>
              <p className="text-gray-500">
                {inspections && inspections.length > 0
                  ? `${inspections.length} vistoria(s) cadastrada(s)`
                  : "Nenhuma vistoria cadastrada. Acesse a seção de Vistorias para criar uma."}
              </p>
              {inspections && inspections.length > 0 && (
                <div className="mt-4 space-y-2">
                  {inspections.map((inspection: any) => (
                    <div key={inspection.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm font-medium text-gray-900">{inspection.environmentName || `Vistoria #${inspection.id}`}</span>
                      <Badge variant="outline">{inspection.installationProgress || 0}% concluído</Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Cronograma Tab */}
          <TabsContent value="cronograma" className="mt-6">
            {environments && environments.length > 0 ? (
              <GanttChart
                tasks={environments.map((env: any) => ({
                  id: env.id,
                  name: env.name,
                  startDate: env.startDate ? new Date(env.startDate) : new Date(),
                  endDate: env.endDate ? new Date(env.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                  progress: getEnvironmentStatus(env).status === 'Concluído' ? 100 : 
                           getEnvironmentStatus(env).status === 'Em Andamento' ? 50 : 0,
                  status: getEnvironmentStatus(env).status === 'Concluído' ? 'completed' :
                         getEnvironmentStatus(env).status === 'Em Andamento' ? 'in-progress' : 'not-started',
                }))
              }
                title="Cronograma de Instalação"
              />
            ) : (
              <Card className="p-8">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="text-lg font-semibold mb-2">Nenhum ambiente cadastrado</h4>
                  <p className="text-muted-foreground">Adicione ambientes para visualizar o cronograma</p>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Controle de Caixilhos Tab */}
          <TabsContent value="controle" className="mt-6">
            {environments && environments.length > 0 ? (
              <OrganizedWindowsList
                windows={environments.map((env: any) => ({
                  id: env.id,
                  name: env.name,
                  caixilhoCode: env.caixilhoCode,
                  caixilhoType: env.caixilhoType,
                  quantity: env.quantity,
                  floor: env.name.split('-').pop()?.trim(),
                  status: 'pending' as const,
                }))}
              />
            ) : (
              <Card className="p-8">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="text-lg font-semibold mb-2">Nenhum caixilho cadastrado</h4>
                  <p className="text-muted-foreground">Importe um PDF de proposta ou adicione ambientes para visualizar o controle</p>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Relatório Profissional Tab */}
          <TabsContent value="relatorio" className="mt-6">
            <div ref={reportRef}>
              {project && environments && (
                <ProfessionalReportTemplate
                  projectInfo={{
                    name: project.name,
                    address: project.address || '',
                    contractor: project.contractor || '',
                    supplier: project.supplier || '',
                    technicalManager: project.technicalManager || '',
                    startDate: project.createdAt ? new Date(project.createdAt).toLocaleDateString('pt-BR') : 'N/A',
                    endDate: project.updatedAt ? new Date(project.updatedAt).toLocaleDateString('pt-BR') : 'N/A',
                  }}
                  windows={environments.map((env: any) => ({
                    id: env.id,
                    name: env.name,
                    caixilhoCode: env.caixilhoCode,
                    quantity: env.quantity,
                    status: 'pending',
                  }))}
                  onGeneratePDF={() => {
                    window.print();
                  }}
                />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Project Settings Modal */}
      <ProjectSettingsModal
        isOpen={isProjectSettingsOpen}
        onClose={() => setIsProjectSettingsOpen(false)}
        projectId={projectId}
        onSuccess={() => refetchEnvironments()}
      />
    </div>
  );
}
