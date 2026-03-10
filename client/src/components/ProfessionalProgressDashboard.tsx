import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, AlertCircle, Clock, Plus, Filter, X, BarChart3, TrendingUp } from 'lucide-react';

interface Window {
  id: number;
  name: string;
  caixilhoCode: string;
  caixilhoType: string;
  quantity: number;
  floor?: string;
  status?: 'completed' | 'pending' | 'in_progress';
}

interface ProfessionalProgressDashboardProps {
  windows: Window[];
  onWindowSelect?: (window: Window) => void;
}

type StatusType = 'completed' | 'pending' | 'in_progress' | 'all';

export default function ProfessionalProgressDashboard({
  windows,
  onWindowSelect,
}: ProfessionalProgressDashboardProps) {
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<StatusType>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Agrupar por ambiente
  const environmentGroups = useMemo(() => {
    const grouped: Record<string, Window[]> = {};

    windows.forEach(w => {
      const floorMatch = w.name.match(/-(.*?)$/);
      const floor = floorMatch ? floorMatch[1].trim() : 'Sem Pavimento';
      
      const environmentMatch = w.name.match(/^(.*?)\s*-/);
      const environment = environmentMatch ? environmentMatch[1].trim() : w.name;

      if (!grouped[environment]) {
        grouped[environment] = [];
      }
      
      grouped[environment].push(w);
    });

    return Object.entries(grouped).map(([name, items]) => ({
      name,
      items,
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, [windows]);

  // Obter lista de ambientes únicos
  const uniqueEnvironments = useMemo(() => {
    return environmentGroups.map(env => env.name).sort();
  }, [environmentGroups]);

  // Filtrar caixilhos
  const filteredWindows = useMemo(() => {
    return windows.filter(w => {
      const environmentMatch = w.name.match(/^(.*?)\s*-/);
      const environment = environmentMatch ? environmentMatch[1].trim() : w.name;

      if (selectedEnvironment !== 'all' && environment !== selectedEnvironment) {
        return false;
      }

      if (selectedStatus !== 'all' && w.status !== selectedStatus) {
        return false;
      }

      if (searchTerm && !w.caixilhoCode.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [windows, selectedEnvironment, selectedStatus, searchTerm]);

  // Calcular estatísticas
  const stats = useMemo(() => {
    const completed = filteredWindows.filter(w => w.status === 'completed').length;
    const inProgress = filteredWindows.filter(w => w.status === 'in_progress').length;
    const pending = filteredWindows.filter(w => w.status === 'pending').length;
    const total = filteredWindows.length;

    return {
      completed,
      inProgress,
      pending,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [filteredWindows]);

  // Estatísticas gerais (sem filtros)
  const generalStats = useMemo(() => {
    const completed = windows.filter(w => w.status === 'completed').length;
    const inProgress = windows.filter(w => w.status === 'in_progress').length;
    const pending = windows.filter(w => w.status === 'pending').length;
    const total = windows.length;

    return {
      completed,
      inProgress,
      pending,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [windows]);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed':
        return { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700', badge: 'bg-green-100 text-green-800', icon: 'text-green-600' };
      case 'in_progress':
        return { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-800', icon: 'text-yellow-600' };
      case 'pending':
        return { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700', badge: 'bg-red-100 text-red-800', icon: 'text-red-600' };
      default:
        return { bg: 'bg-gray-50', border: 'border-gray-300', text: 'text-gray-700', badge: 'bg-gray-100 text-gray-800', icon: 'text-gray-600' };
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'completed':
        return '✓ Concluído';
      case 'in_progress':
        return '⚙ Em execução';
      case 'pending':
        return '⏳ Pendente';
      default:
        return 'Sem status';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5" />;
      case 'in_progress':
        return <Clock className="h-5 w-5" />;
      case 'pending':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const clearFilters = () => {
    setSelectedEnvironment('all');
    setSelectedStatus('all');
    setSearchTerm('');
  };

  const hasActiveFilters = selectedEnvironment !== 'all' || selectedStatus !== 'all' || searchTerm !== '';

  return (
    <div className="w-full space-y-6">
      {/* Dashboard Geral */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard de Progresso</h2>
        
        {/* Progresso Geral */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 font-medium">Progresso Geral da Obra</p>
                  <p className="text-4xl font-bold text-blue-900 mt-1">{generalStats.percentage}%</p>
                </div>
                <div className="text-right">
                  <BarChart3 className="h-12 w-12 text-blue-600 opacity-50" />
                </div>
              </div>
              <div className="w-full bg-blue-300 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${generalStats.percentage}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <p className="text-sm text-blue-600 font-medium">Concluído</p>
                  <p className="text-2xl font-bold text-green-600">{generalStats.completed}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-blue-600 font-medium">Em execução</p>
                  <p className="text-2xl font-bold text-yellow-600">{generalStats.inProgress}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-blue-600 font-medium">Pendente</p>
                  <p className="text-2xl font-bold text-red-600">{generalStats.pending}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Busca por Código */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Código do Caixilho</label>
              <Input
                placeholder="Ex: AL-006"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-gray-300"
              />
            </div>

            {/* Filtro de Ambiente */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Ambiente</label>
              <Select value={selectedEnvironment} onValueChange={setSelectedEnvironment}>
                <SelectTrigger className="border-gray-300">
                  <SelectValue placeholder="Selecione um ambiente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Ambientes</SelectItem>
                  {uniqueEnvironments.map(env => (
                    <SelectItem key={env} value={env}>
                      {env}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro de Status */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
              <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as StatusType)}>
                <SelectTrigger className="border-gray-300">
                  <SelectValue placeholder="Selecione um status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="completed">✓ Concluído</SelectItem>
                  <SelectItem value="in_progress">⚙ Em execução</SelectItem>
                  <SelectItem value="pending">⏳ Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {hasActiveFilters && (
            <Button
              onClick={clearFilters}
              variant="outline"
              className="w-full text-orange-600 border-orange-300 hover:bg-orange-50"
            >
              <X className="h-4 w-4 mr-2" />
              Limpar Filtros
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Estatísticas Filtradas */}
      {hasActiveFilters && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-blue-600 font-medium">Total</p>
                <p className="text-3xl font-bold text-blue-900 mt-2">{stats.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-green-600 font-medium">Concluído</p>
                <p className="text-3xl font-bold text-green-900 mt-2">{stats.completed}</p>
                <p className="text-xs text-green-600 mt-1">{stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-yellow-600 font-medium">Em execução</p>
                <p className="text-3xl font-bold text-yellow-900 mt-2">{stats.inProgress}</p>
                <p className="text-xs text-yellow-600 mt-1">{stats.total > 0 ? Math.round((stats.inProgress / stats.total) * 100) : 0}%</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-red-600 font-medium">Pendente</p>
                <p className="text-3xl font-bold text-red-900 mt-2">{stats.pending}</p>
                <p className="text-xs text-red-600 mt-1">{stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}%</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de Caixilhos por Status */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Caixilhos por Status</h3>

        {filteredWindows.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="pt-12 pb-12 text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 text-lg font-medium">Nenhum caixilho encontrado</p>
              <p className="text-gray-400 text-sm mt-2">Tente ajustar os filtros</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredWindows.map(window => {
              const colors = getStatusColor(window.status);
              return (
                <Card
                  key={window.id}
                  className={`${colors.bg} border-2 ${colors.border} hover:shadow-md transition-all cursor-pointer`}
                  onClick={() => onWindowSelect?.(window)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-lg ${colors.badge}`}>
                            {getStatusIcon(window.status)}
                          </div>
                          <div>
                            <p className="font-mono font-bold text-orange-600 text-sm">
                              {window.caixilhoCode}
                            </p>
                            <p className={`text-xs font-medium ${colors.text}`}>
                              {getStatusLabel(window.status)}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2 ml-11">
                          {window.caixilhoType}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-lg font-bold text-gray-900">
                          {window.quantity}
                        </div>
                        <div className="text-xs text-gray-500">unidades</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Seções: Atividades, Ocorrências, Comentários */}
      <Tabs defaultValue="atividades" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="atividades">Atividades</TabsTrigger>
          <TabsTrigger value="ocorrencias">Ocorrências</TabsTrigger>
          <TabsTrigger value="comentarios">Comentários</TabsTrigger>
        </TabsList>

        <TabsContent value="atividades" className="space-y-4 mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Nenhuma atividade registrada</p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Atividade
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ocorrencias" className="space-y-4 mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Nenhuma ocorrência registrada</p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Ocorrência
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comentarios" className="space-y-4 mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Nenhum comentário registrado</p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Comentário
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
