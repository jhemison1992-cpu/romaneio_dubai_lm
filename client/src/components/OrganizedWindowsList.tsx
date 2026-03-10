import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Package } from 'lucide-react';

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

interface EnvironmentGroup {
  name: string;
  floor: string;
  windows: Window[];
  totalQuantity: number;
}

export default function OrganizedWindowsList({ windows, onWindowSelect }: OrganizedWindowsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [environmentSearchTerm, setEnvironmentSearchTerm] = useState('');
  const [showEnvironmentSuggestions, setShowEnvironmentSuggestions] = useState(false);

  // Agrupar por ambiente
  const environmentGroups = useMemo(() => {
    const grouped: Record<string, EnvironmentGroup> = {};

    windows.forEach(w => {
      // Extrair pavimento do nome
      const floorMatch = w.name.match(/-(.*?)$/);
      const floor = floorMatch ? floorMatch[1].trim() : 'Sem Pavimento';
      
      // Extrair ambiente
      const environmentMatch = w.name.match(/^(.*?)\s*-/);
      const environment = environmentMatch ? environmentMatch[1].trim() : w.name;

      if (!grouped[environment]) {
        grouped[environment] = {
          name: environment,
          floor: floor,
          windows: [],
          totalQuantity: 0,
        };
      }
      
      grouped[environment].windows.push(w);
      grouped[environment].totalQuantity += w.quantity;
    });

    // Converter para array e ordenar por nome
    return Object.values(grouped).sort((a, b) => a.name.localeCompare(b.name));
  }, [windows]);

  // Obter lista de ambientes únicos para sugestões
  const uniqueEnvironments = useMemo(() => {
    return environmentGroups.map(env => env.name).sort();
  }, [environmentGroups]);

  // Sugestões de ambiente baseadas no termo de busca
  const environmentSuggestions = useMemo(() => {
    if (!environmentSearchTerm.trim()) return [];
    
    const term = environmentSearchTerm.toLowerCase();
    return uniqueEnvironments.filter(env => 
      env.toLowerCase().includes(term)
    );
  }, [environmentSearchTerm, uniqueEnvironments]);

  // Filtrar ambientes baseado na busca e seleção
  const filteredEnvironments = useMemo(() => {
    let filtered = environmentGroups;

    // Filtrar por ambiente selecionado (busca)
    if (environmentSearchTerm.trim()) {
      const term = environmentSearchTerm.toLowerCase();
      filtered = filtered.filter(env => 
        env.name.toLowerCase().includes(term)
      );
    }

    // Filtrar por termo de busca de caixilho
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(env =>
        env.windows.some(w => 
          w.caixilhoCode.toLowerCase().includes(term) ||
          w.caixilhoType.toLowerCase().includes(term)
        )
      );
    }

    return filtered;
  }, [environmentGroups, searchTerm, environmentSearchTerm]);

  // Calcular estatísticas
  const stats = useMemo(() => {
    return {
      totalWindows: filteredEnvironments.reduce((sum, env) => sum + env.windows.length, 0),
      totalQuantity: filteredEnvironments.reduce((sum, env) => sum + env.totalQuantity, 0),
      totalEnvironments: filteredEnvironments.length,
    };
  }, [filteredEnvironments]);

  // Cores para ambientes
  const ENVIRONMENT_COLORS = [
    { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700', badge: 'bg-blue-100' },
    { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700', badge: 'bg-emerald-100' },
    { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700', badge: 'bg-amber-100' },
    { bg: 'bg-rose-50', border: 'border-rose-300', text: 'text-rose-700', badge: 'bg-rose-100' },
    { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700', badge: 'bg-purple-100' },
    { bg: 'bg-cyan-50', border: 'border-cyan-300', text: 'text-cyan-700', badge: 'bg-cyan-100' },
    { bg: 'bg-pink-50', border: 'border-pink-300', text: 'text-pink-700', badge: 'bg-pink-100' },
    { bg: 'bg-indigo-50', border: 'border-indigo-300', text: 'text-indigo-700', badge: 'bg-indigo-100' },
  ];

  const getEnvironmentColor = (index: number) => {
    return ENVIRONMENT_COLORS[index % ENVIRONMENT_COLORS.length];
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const clearEnvironmentSearch = () => {
    setEnvironmentSearchTerm('');
    setShowEnvironmentSuggestions(false);
  };

  const selectEnvironment = (env: string) => {
    setEnvironmentSearchTerm(env);
    setShowEnvironmentSuggestions(false);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setEnvironmentSearchTerm('');
    setShowEnvironmentSuggestions(false);
  };

  return (
    <div className="w-full space-y-6">
      {/* Barras de Pesquisa */}
      <div className="space-y-3">
        {/* Barra de Pesquisa de Caixilho */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            placeholder="🔍 Pesquise por código do caixilho ou tipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10 py-6 text-base rounded-lg border-2 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Barra de Pesquisa de Ambiente com Autocomplete */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            placeholder="📍 Pesquise por ambiente..."
            value={environmentSearchTerm}
            onChange={(e) => {
              setEnvironmentSearchTerm(e.target.value);
              setShowEnvironmentSuggestions(true);
            }}
            onFocus={() => setShowEnvironmentSuggestions(true)}
            className="pl-10 pr-10 py-6 text-base rounded-lg border-2 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
          />
          {environmentSearchTerm && (
            <button
              onClick={clearEnvironmentSearch}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          {/* Sugestões de Ambiente */}
          {showEnvironmentSuggestions && environmentSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-300 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
              {environmentSuggestions.map((env) => (
                <button
                  key={env}
                  onClick={() => selectEnvironment(env)}
                  className="w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors border-b border-gray-200 last:border-b-0 text-gray-700 hover:text-orange-700"
                >
                  {env}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-900">{stats.totalWindows}</div>
                <div className="text-xs text-blue-700">Caixilhos</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-900">{stats.totalQuantity}</div>
                <div className="text-xs text-green-700">Unidades</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-900">{stats.totalEnvironments}</div>
                <div className="text-xs text-orange-700">Ambientes</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botão Limpar Filtros */}
        {(searchTerm || environmentSearchTerm) && (
          <Button
            onClick={clearAllFilters}
            variant="outline"
            className="w-full text-orange-600 border-orange-300 hover:bg-orange-50"
          >
            Limpar Filtros
          </Button>
        )}
      </div>

      {/* Grid de Ambientes */}
      {filteredEnvironments.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="pt-12 pb-12 text-center">
            <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-lg font-medium">Nenhum ambiente encontrado</p>
            <p className="text-gray-400 text-sm mt-2">Tente pesquisar por outro termo ou ambiente</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEnvironments.map((environment, index) => {
            const colors = getEnvironmentColor(index);

            return (
              <Card
                key={environment.name}
                className={`${colors.bg} border-2 ${colors.border} overflow-hidden hover:shadow-lg transition-shadow`}
              >
                <CardContent className="p-4">
                  {/* Header do Ambiente */}
                  <div className="mb-4 pb-4 border-b-2 border-gray-200">
                    <h3 className={`text-lg font-bold ${colors.text} mb-2`}>
                      {environment.name}
                    </h3>
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className={`${colors.badge} border-0`}>
                        {environment.floor}
                      </Badge>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900">
                          {environment.totalQuantity} un.
                        </div>
                        <div className="text-xs text-gray-600">
                          {environment.windows.length} caixilho{environment.windows.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Lista de Caixilhos */}
                  <div className="space-y-2">
                    {environment.windows.map((window) => (
                      <div
                        key={window.id}
                        className="bg-white rounded-lg p-3 border border-gray-200 hover:shadow-md transition-all cursor-pointer"
                        onClick={() => onWindowSelect?.(window)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-mono font-bold text-orange-600 text-sm">
                              {window.caixilhoCode}
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                              {window.caixilhoType}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-base font-bold text-gray-900">
                              {window.quantity}
                            </div>
                            <div className="text-xs text-gray-500">un.</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
