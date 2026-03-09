import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ChevronDown, ChevronRight, Building2, Package, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

interface Window {
  id: number;
  name: string;
  caixilhoCode: string;
  caixilhoType: string;
  quantity: number;
  floor?: string;
  status?: 'pending' | 'in_progress' | 'completed';
}

interface HierarchicalWindowsControlProps {
  windows: Window[];
  onWindowSelect?: (window: Window) => void;
}

interface FloorGroup {
  floor: string;
  environments: {
    name: string;
    windows: Window[];
    totalQuantity: number;
  }[];
  totalWindows: number;
  totalQuantity: number;
}

export default function HierarchicalWindowsControl({ windows, onWindowSelect }: HierarchicalWindowsControlProps) {
  const [expandedFloors, setExpandedFloors] = useState<Set<string>>(new Set());
  const [expandedEnvironments, setExpandedEnvironments] = useState<Set<string>>(new Set());
  const [searchCode, setSearchCode] = useState('');

  // Agrupar por pavimento e ambiente
  const floorGroups = useMemo(() => {
    const grouped: Record<string, Record<string, Window[]>> = {};

    windows.forEach(w => {
      // Extrair pavimento do nome (ex: "SUÍTES - ÁTRIO" -> "ÁTRIO")
      const floorMatch = w.name.match(/-(.*?)$/);
      const floor = floorMatch ? floorMatch[1].trim() : 'Sem Pavimento';
      
      // Extrair ambiente (ex: "SUÍTES - ÁTRIO" -> "SUÍTES")
      const environmentMatch = w.name.match(/^(.*?)\s*-/);
      const environment = environmentMatch ? environmentMatch[1].trim() : w.name;

      if (!grouped[floor]) {
        grouped[floor] = {};
      }
      if (!grouped[floor][environment]) {
        grouped[floor][environment] = [];
      }
      grouped[floor][environment].push(w);
    });

    // Converter para array e ordenar
    const result: FloorGroup[] = Object.entries(grouped)
      .sort(([a], [b]) => {
        // Ordenar pavimentos: ÁTRIO, 1º AO 28º, 29º, depois áreas comuns
        const order: Record<string, number> = {
          'ÁTRIO': 0,
          '1º AO 28º PAVIMENTO': 1,
          '29º PAVIMENTO': 2,
        };
        return (order[a] ?? 999) - (order[b] ?? 999);
      })
      .map(([floor, envs]) => ({
        floor,
        environments: Object.entries(envs)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([name, wins]) => ({
            name,
            windows: wins,
            totalQuantity: wins.reduce((sum, w) => sum + w.quantity, 0),
          })),
        totalWindows: Object.values(envs).flat().length,
        totalQuantity: Object.values(envs).flat().reduce((sum, w) => sum + w.quantity, 0),
      }));

    return result;
  }, [windows]);

  // Filtrar caixilhos
  const filteredGroups = useMemo(() => {
    if (!searchCode) return floorGroups;

    return floorGroups
      .map(floor => ({
        ...floor,
        environments: floor.environments
          .map(env => ({
            ...env,
            windows: env.windows.filter(w =>
              w.caixilhoCode.toLowerCase().includes(searchCode.toLowerCase())
            ),
          }))
          .filter(env => env.windows.length > 0),
      }))
      .filter(floor => floor.environments.length > 0);
  }, [floorGroups, searchCode]);

  const toggleFloor = (floor: string) => {
    const newSet = new Set(expandedFloors);
    if (newSet.has(floor)) {
      newSet.delete(floor);
    } else {
      newSet.add(floor);
    }
    setExpandedFloors(newSet);
  };

  const toggleEnvironment = (envKey: string) => {
    const newSet = new Set(expandedEnvironments);
    if (newSet.has(envKey)) {
      newSet.delete(envKey);
    } else {
      newSet.add(envKey);
    }
    setExpandedEnvironments(newSet);
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-3 w-3 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-3 w-3 text-yellow-500" />;
      default:
        return <AlertCircle className="h-3 w-3 text-gray-400" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 text-xs">Concluído</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-100 text-yellow-800 text-xs">Em Andamento</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 text-xs">Pendente</Badge>;
    }
  };

  const totalStats = useMemo(() => {
    return {
      totalWindows: windows.length,
      totalQuantity: windows.reduce((sum, w) => sum + w.quantity, 0),
      totalFloors: floorGroups.length,
    };
  }, [windows, floorGroups]);

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Caixilhos</p>
                <p className="text-2xl font-bold">{totalStats.totalWindows}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Quantidade Total</p>
                <p className="text-2xl font-bold">{totalStats.totalQuantity}</p>
              </div>
              <Building2 className="h-8 w-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pavimentos</p>
                <p className="text-2xl font-bold">{totalStats.totalFloors}</p>
              </div>
              <Building2 className="h-8 w-8 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Busca */}
      <div>
        <label className="text-sm font-medium mb-2 block">Buscar Caixilho</label>
        <Input
          placeholder="Ex: AL-001"
          value={searchCode}
          onChange={(e) => setSearchCode(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Hierarquia de Pavimentos */}
      <div className="space-y-3">
        {filteredGroups.map((floorGroup) => {
          const isFloorExpanded = expandedFloors.has(floorGroup.floor);
          const floorKey = floorGroup.floor;

          return (
            <Card key={floorKey} className="overflow-hidden">
              {/* Cabeçalho do Pavimento */}
              <div
                className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 cursor-pointer hover:from-slate-800 hover:to-slate-700 transition-colors"
                onClick={() => toggleFloor(floorKey)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isFloorExpanded ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                    <div>
                      <h3 className="font-bold text-lg">{floorGroup.floor}</h3>
                      <p className="text-xs text-gray-300">
                        {floorGroup.environments.length} ambiente(s) • {floorGroup.totalWindows} caixilho(s) • {floorGroup.totalQuantity} un.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {floorGroup.totalWindows} tipos
                    </Badge>
                    <Badge className="bg-blue-600 text-xs">
                      {floorGroup.totalQuantity} un.
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Conteúdo do Pavimento */}
              {isFloorExpanded && (
                <CardContent className="p-4 space-y-3">
                  {floorGroup.environments.map((env) => {
                    const envKey = `${floorKey}:${env.name}`;
                    const isEnvExpanded = expandedEnvironments.has(envKey);

                    return (
                      <div key={envKey} className="border rounded-lg overflow-hidden">
                        {/* Cabeçalho do Ambiente */}
                        <div
                          className="bg-gradient-to-r from-gray-100 to-gray-50 p-3 cursor-pointer hover:from-gray-200 hover:to-gray-100 transition-colors border-l-4 border-l-teal-500"
                          onClick={() => toggleEnvironment(envKey)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {isEnvExpanded ? (
                                <ChevronDown className="h-4 w-4 text-gray-600" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-gray-600" />
                              )}
                              <div>
                                <p className="font-semibold text-sm text-gray-900">{env.name}</p>
                                <p className="text-xs text-gray-500">
                                  {env.windows.length} caixilho(s) • {env.totalQuantity} un.
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {env.totalQuantity} un.
                            </Badge>
                          </div>
                        </div>

                        {/* Lista de Caixilhos */}
                        {isEnvExpanded && (
                          <div className="bg-white p-3 space-y-2 border-t">
                            {env.windows.map((window) => (
                              <div
                                key={window.id}
                                className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer transition-colors text-xs"
                                onClick={() => onWindowSelect?.(window)}
                              >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  {getStatusIcon(window.status)}
                                  <span className="font-mono font-bold text-gray-900">{window.caixilhoCode}</span>
                                  <span className="text-gray-600 truncate">{window.caixilhoType}</span>
                                </div>
                                <div className="flex items-center gap-2 ml-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {window.quantity} un.
                                  </Badge>
                                  {getStatusBadge(window.status)}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Mensagem de Vazio */}
      {filteredGroups.length === 0 && (
        <Card className="p-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="text-lg font-semibold mb-2">Nenhum caixilho encontrado</h4>
            <p className="text-muted-foreground">
              {searchCode ? 'Tente uma busca diferente' : 'Importe um PDF para começar'}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
