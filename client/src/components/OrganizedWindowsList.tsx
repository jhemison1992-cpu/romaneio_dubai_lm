import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Building2, Package, Search, Filter, X } from 'lucide-react';

interface Window {
  id: number;
  name: string;
  caixilhoCode: string;
  caixilhoType: string;
  quantity: number;
  floor?: string;
  status?: 'pending' | 'in_progress' | 'completed';
}

interface OrganizedWindowsListProps {
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

// Mapeamento de pavimentos com cores e ordem
const FLOOR_CONFIG: Record<string, { color: string; order: number; displayName: string }> = {
  'ÁTRIO': { color: 'from-blue-50 to-blue-100', order: 0, displayName: 'Pavimento 1 - Sala de Estar' },
  '1º AO 28º PAVIMENTO': { color: 'from-purple-50 to-purple-100', order: 1, displayName: 'Suítes - 1º ao 28º PAV' },
  '29º PAVIMENTO': { color: 'from-pink-50 to-pink-100', order: 2, displayName: 'Suítes - 29º PAV' },
};

// Cores para ambientes
const ENVIRONMENT_COLORS = [
  'bg-emerald-100 border-emerald-300',
  'bg-cyan-100 border-cyan-300',
  'bg-amber-100 border-amber-300',
  'bg-rose-100 border-rose-300',
  'bg-indigo-100 border-indigo-300',
  'bg-teal-100 border-teal-300',
];

export default function OrganizedWindowsList({ windows, onWindowSelect }: OrganizedWindowsListProps) {
  const [expandedFloors, setExpandedFloors] = useState<Set<string>>(new Set(['ÁTRIO']));
  const [expandedEnvironments, setExpandedEnvironments] = useState<Set<string>>(new Set());
  const [searchCode, setSearchCode] = useState('');
  const [searchEnvironment, setSearchEnvironment] = useState('');
  const [filterFloor, setFilterFloor] = useState<string>('');

  // Agrupar por pavimento e ambiente
  const floorGroups = useMemo(() => {
    const grouped: Record<string, Record<string, Window[]>> = {};

    windows.forEach(w => {
      // Extrair pavimento do nome
      const floorMatch = w.name.match(/-(.*?)$/);
      const floor = floorMatch ? floorMatch[1].trim() : 'Sem Pavimento';
      
      // Extrair ambiente
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
        const orderA = FLOOR_CONFIG[a]?.order ?? 999;
        const orderB = FLOOR_CONFIG[b]?.order ?? 999;
        return orderA - orderB;
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

  // Filtrar grupos
  const filteredGroups = useMemo(() => {
    return floorGroups
      .filter(floor => !filterFloor || floor.floor === filterFloor)
      .map(floor => ({
        ...floor,
        environments: floor.environments
          .map(env => ({
            ...env,
            windows: env.windows.filter(w =>
              w.caixilhoCode.toLowerCase().includes(searchCode.toLowerCase()) &&
              env.name.toLowerCase().includes(searchEnvironment.toLowerCase())
            ),
          }))
          .filter(env => env.windows.length > 0),
      }))
      .filter(floor => floor.environments.length > 0);
  }, [floorGroups, searchCode, searchEnvironment, filterFloor]);

  // Calcular estatísticas totais
  const totalStats = useMemo(() => {
    return {
      totalWindows: filteredGroups.reduce((sum, f) => sum + f.totalWindows, 0),
      totalQuantity: filteredGroups.reduce((sum, f) => sum + f.totalQuantity, 0),
      totalFloors: filteredGroups.length,
      totalEnvironments: filteredGroups.reduce((sum, f) => sum + f.environments.length, 0),
    };
  }, [filteredGroups]);

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

  const getEnvironmentColor = (index: number) => {
    return ENVIRONMENT_COLORS[index % ENVIRONMENT_COLORS.length];
  };

  const getFloorConfig = (floor: string) => {
    return FLOOR_CONFIG[floor] || { color: 'from-gray-50 to-gray-100', order: 999, displayName: floor };
  };

  const clearFilters = () => {
    setSearchCode('');
    setSearchEnvironment('');
    setFilterFloor('');
  };

  const hasActiveFilters = searchCode || searchEnvironment || filterFloor;

  return (
    <div className="w-full space-y-6">
      {/* Header com Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-900">{totalStats.totalWindows}</div>
              <div className="text-sm text-blue-700">Caixilhos</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-900">{totalStats.totalQuantity}</div>
              <div className="text-sm text-green-700">Quantidade Total</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-900">{totalStats.totalFloors}</div>
              <div className="text-sm text-purple-700">Pavimentos</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-900">{totalStats.totalEnvironments}</div>
              <div className="text-sm text-orange-700">Ambientes</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros e Busca
            </CardTitle>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs"
              >
                <X className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Código do Caixilho</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Ex: AL008, AL010..."
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ambiente</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Ex: Suítes, Piscina..."
                  value={searchEnvironment}
                  onChange={(e) => setSearchEnvironment(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Pavimento</label>
              <select
                value={filterFloor}
                onChange={(e) => setFilterFloor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Todos os pavimentos</option>
                {floorGroups.map(floor => (
                  <option key={floor.floor} value={floor.floor}>
                    {getFloorConfig(floor.floor).displayName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Pavimentos e Ambientes */}
      <div className="space-y-4">
        {filteredGroups.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="pt-6 text-center text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum caixilho encontrado com os filtros selecionados</p>
            </CardContent>
          </Card>
        ) : (
          filteredGroups.map((floorGroup) => {
            const floorConfig = getFloorConfig(floorGroup.floor);
            const isFloorExpanded = expandedFloors.has(floorGroup.floor);

            return (
              <Card
                key={floorGroup.floor}
                className={`bg-gradient-to-r ${floorConfig.color} border-2 border-gray-200 overflow-hidden`}
              >
                <CardHeader
                  className="pb-3 cursor-pointer hover:bg-black/5 transition-colors"
                  onClick={() => toggleFloor(floorGroup.floor)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isFloorExpanded ? (
                        <ChevronDown className="h-5 w-5 text-gray-600" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-600" />
                      )}
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Building2 className="h-5 w-5" />
                          {floorConfig.displayName}
                        </CardTitle>
                        <CardDescription className="text-sm mt-1">
                          {floorGroup.totalWindows} caixilhos • {floorGroup.totalQuantity} unidades
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary">{floorGroup.environments.length} ambientes</Badge>
                    </div>
                  </div>
                </CardHeader>

                {isFloorExpanded && (
                  <CardContent className="space-y-3 border-t pt-4">
                    {floorGroup.environments.map((environment, envIndex) => {
                      const envKey = `${floorGroup.floor}-${environment.name}`;
                      const isEnvExpanded = expandedEnvironments.has(envKey);
                      const envColor = getEnvironmentColor(envIndex);

                      return (
                        <div key={envKey} className="space-y-2">
                          {/* Header do Ambiente */}
                          <div
                            className={`${envColor} border-2 rounded-lg p-3 cursor-pointer hover:shadow-md transition-all`}
                            onClick={() => toggleEnvironment(envKey)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {isEnvExpanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                                <span className="font-semibold text-gray-900">
                                  {environment.name}
                                </span>
                              </div>
                              <div className="flex gap-2 text-sm">
                                <Badge variant="outline">
                                  {environment.windows.length} caixilhos
                                </Badge>
                                <Badge variant="outline">
                                  {environment.totalQuantity} un.
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {/* Lista de Caixilhos */}
                          {isEnvExpanded && (
                            <div className="ml-4 space-y-2">
                              {environment.windows.map((window) => (
                                <div
                                  key={window.id}
                                  className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                                  onClick={() => onWindowSelect?.(window)}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-mono font-bold text-orange-600">
                                          {window.caixilhoCode}
                                        </span>
                                        <Badge variant="outline" className="text-xs">
                                          {window.caixilhoType}
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-gray-600">{window.name}</p>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-lg font-bold text-gray-900">
                                        {window.quantity}
                                      </div>
                                      <div className="text-xs text-gray-500">unidades</div>
                                    </div>
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
          })
        )}
      </div>
    </div>
  );
}
