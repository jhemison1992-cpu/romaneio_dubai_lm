import { useState } from 'react';
import { AlertCircle, CheckCircle2, Clock, Zap, BarChart3, Users, DollarSign, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Obras() {
  const [activeTab, setActiveTab] = useState('visao-geral');

  // Mock data - será substituído por dados reais do banco
  const obra = {
    id: 1,
    nome: 'DUBAI LM EMPREENDIMENTOS IMOBILIÁRIOS SPE LTDA',
    endereco: 'Rua das Flores, 123 - São Paulo, SP',
    status: 'Em Andamento',
    progresso: 72,
    contratante: 'DUBAI LM',
    responsavel: 'Eng. Wilson',
    dataInicio: '2026-01-15',
    dataTermino: '2026-06-30',
    observacoes: 'Projeto em andamento conforme cronograma. Todas as etapas dentro do prazo.',
  };

  const kpis = [
    { label: 'Ambientes', valor: 12, icon: AlertCircle, cor: 'bg-teal-100 text-teal-600' },
    { label: 'Conclusões', valor: 0, icon: CheckCircle2, cor: 'bg-blue-100 text-blue-600' },
    { label: 'Observações', valor: 21, icon: Clock, cor: 'bg-orange-100 text-orange-600' },
    { label: 'Atrasos', valor: 1, icon: AlertCircle, cor: 'bg-red-100 text-red-600' },
  ];

  const setores = [
    { id: 1, nome: 'Setor A', status: 'Concluído', progresso: 100 },
    { id: 2, nome: 'Setor B', status: 'Em Andamento', progresso: 65 },
    { id: 3, nome: 'Setor C', status: 'Não Iniciado', progresso: 0 },
  ];

  const etapas = [
    { fase: 'Fundação', progresso: 100, status: 'Concluído', dataInicio: '2026-01-15', dataFim: '2026-02-15' },
    { fase: 'Estrutura', progresso: 80, status: 'Em Andamento', dataInicio: '2026-02-16', dataFim: '2026-04-15' },
    { fase: 'Alvenaria', progresso: 45, status: 'Em Andamento', dataInicio: '2026-03-01', dataFim: '2026-05-15' },
    { fase: 'Acabamento', progresso: 0, status: 'Não Iniciado', dataInicio: '2026-05-16', dataFim: '2026-06-30' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Concluído':
        return 'bg-green-100 text-green-700';
      case 'Em Andamento':
        return 'bg-blue-100 text-blue-700';
      case 'Não Iniciado':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{obra.nome}</h1>
              <p className="text-gray-300">{obra.endereco}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                <Settings className="w-4 h-4 mr-2" />
                Editar
              </Button>
              <Button className="bg-red-600 hover:bg-red-700">
                <AlertCircle className="w-4 h-4 mr-2" />
                Encerrar
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-semibold">Progresso Geral</span>
              <span className="text-2xl font-bold">{obra.progresso}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-teal-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${obra.progresso}%` }}
              />
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-4 gap-4">
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
      <div className="max-w-7xl mx-auto px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white border-b border-gray-200 rounded-none">
            <TabsTrigger value="visao-geral" className="rounded-none border-b-2 border-transparent data-[state=active]:border-teal-500">
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="progresso" className="rounded-none border-b-2 border-transparent data-[state=active]:border-teal-500">
              Progresso
            </TabsTrigger>
            <TabsTrigger value="ambientes" className="rounded-none border-b-2 border-transparent data-[state=active]:border-teal-500">
              Ambientes
            </TabsTrigger>
            <TabsTrigger value="custos" className="rounded-none border-b-2 border-transparent data-[state=active]:border-teal-500">
              Custos
            </TabsTrigger>
          </TabsList>

          {/* Visão Geral Tab */}
          <TabsContent value="visao-geral" className="space-y-6 mt-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Informações da Obra */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Informações da Obra</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Contratante</p>
                    <p className="font-medium text-gray-900">{obra.contratante}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Responsável</p>
                    <p className="font-medium text-gray-900">{obra.responsavel}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Data de Início</p>
                    <p className="font-medium text-gray-900">{new Date(obra.dataInicio).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Data de Término</p>
                    <p className="font-medium text-gray-900">{new Date(obra.dataTermino).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
              </Card>

              {/* Setores Contratados */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Setores Contratados</h3>
                <div className="space-y-3">
                  {setores.map((setor) => (
                    <div key={setor.id} className="flex items-center gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{setor.nome}</p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-teal-500 h-2 rounded-full"
                            style={{ width: `${setor.progresso}%` }}
                          />
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(setor.status)}`}>
                        {setor.status}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Observações */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Observações</h3>
              <p className="text-gray-700">{obra.observacoes}</p>
            </Card>
          </TabsContent>

          {/* Progresso Tab */}
          <TabsContent value="progresso" className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6 text-gray-900">Progresso de Etapas</h3>
              <div className="space-y-4">
                {etapas.map((etapa, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900">{etapa.fase}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(etapa.dataInicio).toLocaleDateString('pt-BR')} - {new Date(etapa.dataFim).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(etapa.status)}`}>
                        {etapa.status}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${etapa.progresso}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{etapa.progresso}% concluído</p>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Ambientes Tab */}
          <TabsContent value="ambientes" className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Ambientes</h3>
              <p className="text-gray-500">Nenhum ambiente cadastrado. Acesse a vistoria para adicionar ambientes.</p>
            </Card>
          </TabsContent>

          {/* Custos Tab */}
          <TabsContent value="custos" className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Custos</h3>
              <p className="text-gray-500">Nenhum custo cadastrado.</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
