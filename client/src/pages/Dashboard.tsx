import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Clock, CheckCircle, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export default function Dashboard() {
  const [selectedView, setSelectedView] = useState<'simplificado' | 'completo'>('completo');

  // Fetch data
  const { data: projects } = trpc.projects.list.useQuery();

  // Calculate KPIs
  const totalProjects = projects?.length || 0;
  const inProgressProjects = projects?.filter((p: any) => p.status === 'em_andamento').length || 0;
  const completedProjects = projects?.filter((p: any) => p.status === 'concluido').length || 0;
  const delayedProjects = projects?.filter((p: any) => p.status === 'atrasado').length || 0;

  // Performance Indicators (IDC, IDP, IPC)
  const idc = 1.0; // IDC = Desempenho de Custo
  const idp = 0.74; // IDP = Desempenho de Prazo
  const ipc = 0.74; // IPC = Performance Geral

  const getIndicatorColor = (value: number) => {
    if (value >= 1.0) return 'text-green-600';
    if (value >= 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getIndicatorBgColor = (value: number) => {
    if (value >= 1.0) return 'bg-green-50';
    if (value >= 0.8) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bem-vindo ao Obras Fácil</h1>
              <p className="text-gray-600 mt-1">Visão 360° das suas obras em tempo real</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedView === 'simplificado' ? 'default' : 'outline'}
                onClick={() => setSelectedView('simplificado')}
              >
                Simplificado
              </Button>
              <Button
                variant={selectedView === 'completo' ? 'default' : 'outline'}
                onClick={() => setSelectedView('completo')}
              >
                Completo
              </Button>
              <Button variant="outline">Adicionar Usuário</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Total de Obras */}
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total de Obras</p>
                  <p className="text-3xl font-bold text-gray-900">{totalProjects}</p>
                </div>
                <Building2 className="w-12 h-12 text-blue-100" />
              </div>
            </CardContent>
          </Card>

          {/* Em Andamento */}
          <Card className="border-l-4 border-l-blue-400">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Em Andamento</p>
                  <p className="text-3xl font-bold text-gray-900">{inProgressProjects}</p>
                </div>
                <Clock className="w-12 h-12 text-blue-100" />
              </div>
            </CardContent>
          </Card>

          {/* Concluídas */}
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Concluídas</p>
                  <p className="text-3xl font-bold text-gray-900">{completedProjects}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-100" />
              </div>
            </CardContent>
          </Card>

          {/* Atrasadas */}
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Atrasadas</p>
                  <p className="text-3xl font-bold text-gray-900">{delayedProjects}</p>
                </div>
                <AlertCircle className="w-12 h-12 text-red-100" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Indicadores de Desempenho */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Indicadores de Desempenho</CardTitle>
                <CardDescription>IDC, IDP e IPC das obras em andamento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {/* IDC */}
                  <div className={`p-4 rounded-lg ${getIndicatorBgColor(idc)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">IDC</span>
                      <TrendingUp className={`w-4 h-4 ${getIndicatorColor(idc)}`} />
                    </div>
                    <p className={`text-2xl font-bold ${getIndicatorColor(idc)}`}>{idc.toFixed(2)}</p>
                    <p className="text-xs text-gray-600 mt-2">Desempenho de Custo</p>
                    <p className="text-xs text-gray-500 mt-1">Custos abaixo do planejado</p>
                  </div>

                  {/* IDP */}
                  <div className={`p-4 rounded-lg ${getIndicatorBgColor(idp)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">IDP</span>
                      <TrendingDown className={`w-4 h-4 ${getIndicatorColor(idp)}`} />
                    </div>
                    <p className={`text-2xl font-bold ${getIndicatorColor(idp)}`}>{idp.toFixed(2)}</p>
                    <p className="text-xs text-gray-600 mt-2">Desempenho de Prazo</p>
                    <p className="text-xs text-gray-500 mt-1">Obra atrasada</p>
                  </div>

                  {/* IPC */}
                  <div className={`p-4 rounded-lg ${getIndicatorBgColor(ipc)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">IPC</span>
                      <TrendingDown className={`w-4 h-4 ${getIndicatorColor(ipc)}`} />
                    </div>
                    <p className={`text-2xl font-bold ${getIndicatorColor(ipc)}`}>{ipc.toFixed(2)}</p>
                    <p className="text-xs text-gray-600 mt-2">Performance Geral</p>
                    <p className="text-xs text-gray-500 mt-1">Performance crítica</p>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-600">
                  <p className="font-semibold mb-1">Interpretação:</p>
                  <p>Valor &gt; 1.0 = acima do esperado • Valor = 1.0 = conforme planejado • Valor &lt; 1.0 = abaixo do esperado</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumo Financeiro */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Resumo Financeiro</CardTitle>
                <CardDescription>Todas as obras</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Orçado */}
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded"></div>
                      <span className="text-sm font-medium text-gray-700">Orçado</span>
                    </div>
                    <span className="font-bold text-gray-900">R$ 0,00</span>
                  </div>

                  {/* Realizado */}
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded"></div>
                      <span className="text-sm font-medium text-gray-700">Realizado</span>
                    </div>
                    <span className="font-bold text-gray-900">R$ 0,00</span>
                  </div>

                  {/* Saldo */}
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span className="text-sm font-medium text-gray-700">Saldo</span>
                    </div>
                    <span className="font-bold text-gray-900">R$ 0,00</span>
                  </div>

                  {/* Percentual */}
                  <div className="mt-6 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Percentual Gasto</span>
                      <span className="text-lg font-bold text-gray-900">0.0%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Cronograma Gantt */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Cronograma Gantt</CardTitle>
            <CardDescription>Visualização temporal das etapas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded p-8 text-center text-gray-500">
              <p>Cronograma Gantt será implementado em breve</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
