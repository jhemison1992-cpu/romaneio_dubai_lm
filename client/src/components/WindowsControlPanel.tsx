import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Package, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

interface Window {
  id: number;
  name: string;
  caixilhoCode: string;
  caixilhoType: string;
  quantity: number;
  floor?: string;
  status?: 'pending' | 'in_progress' | 'completed';
}

interface WindowsControlPanelProps {
  windows: Window[];
  onWindowSelect?: (window: Window) => void;
}

export default function WindowsControlPanel({ windows, onWindowSelect }: WindowsControlPanelProps) {
  const [filterFloor, setFilterFloor] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchCode, setSearchCode] = useState('');

  // Extrair pavimentos únicos
  const floors = useMemo(() => {
    const floorSet = new Set<string>();
    windows.forEach(w => {
      if (w.floor) {
        // Extrair pavimento do nome (ex: "SUÍTES - ÁTRIO" -> "ÁTRIO")
        const floorMatch = w.name.match(/-(.*?)$/);
        if (floorMatch) {
          floorSet.add(floorMatch[1].trim());
        }
      }
    });
    return Array.from(floorSet).sort();
  }, [windows]);

  // Agrupar caixilhos por pavimento
  const windowsByFloor = useMemo(() => {
    const grouped: Record<string, Window[]> = {};
    
    windows.forEach(w => {
      const floorMatch = w.name.match(/-(.*?)$/);
      const floor = floorMatch ? floorMatch[1].trim() : 'Sem Pavimento';
      
      if (!grouped[floor]) {
        grouped[floor] = [];
      }
      grouped[floor].push(w);
    });

    return grouped;
  }, [windows]);

  // Agrupar por quantidade
  const windowsByQuantity = useMemo(() => {
    const grouped: Record<string, Window[]> = {};
    
    windows.forEach(w => {
      const qty = w.quantity.toString();
      if (!grouped[qty]) {
        grouped[qty] = [];
      }
      grouped[qty].push(w);
    });

    return Object.fromEntries(
      Object.entries(grouped).sort(([a], [b]) => parseInt(b) - parseInt(a))
    );
  }, [windows]);

  // Filtrar caixilhos
  const filteredWindows = useMemo(() => {
    return windows.filter(w => {
      const floorMatch = w.name.match(/-(.*?)$/);
      const floor = floorMatch ? floorMatch[1].trim() : 'Sem Pavimento';
      
      const floorMatch2 = filterFloor === 'all' || floor === filterFloor;
      const statusMatch = filterStatus === 'all' || w.status === filterStatus;
      const codeMatch = searchCode === '' || w.caixilhoCode.toLowerCase().includes(searchCode.toLowerCase());
      
      return floorMatch2 && statusMatch && codeMatch;
    });
  }, [windows, filterFloor, filterStatus, searchCode]);

  // Calcular estatísticas
  const stats = useMemo(() => {
    return {
      total: windows.length,
      totalQuantity: windows.reduce((sum, w) => sum + w.quantity, 0),
      pending: windows.filter(w => w.status === 'pending').length,
      inProgress: windows.filter(w => w.status === 'in_progress').length,
      completed: windows.filter(w => w.status === 'completed').length,
    };
  }, [windows]);

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Concluído</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-100 text-yellow-800">Em Andamento</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Pendente</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Caixilhos</p>
                <p className="text-2xl font-bold">{stats.total}</p>
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
                <p className="text-2xl font-bold">{stats.totalQuantity}</p>
              </div>
              <Building2 className="h-8 w-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-gray-600">{stats.pending}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-gray-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Concluídos</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Código do Caixilho</label>
              <Input
                placeholder="Ex: AL-001"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Pavimento</label>
              <Select value={filterFloor} onValueChange={setFilterFloor}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Pavimentos</SelectItem>
                  {floors.map(floor => (
                    <SelectItem key={floor} value={floor}>
                      {floor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Abas de Visualização */}
      <Tabs defaultValue="by-floor" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="by-floor">Por Pavimento</TabsTrigger>
          <TabsTrigger value="by-quantity">Por Quantidade</TabsTrigger>
        </TabsList>

        {/* Visualização por Pavimento */}
        <TabsContent value="by-floor" className="space-y-4">
          {floors.map(floor => {
            const floorWindows = windowsByFloor[floor] || [];
            const floorTotal = floorWindows.reduce((sum, w) => sum + w.quantity, 0);
            
            return (
              <Card key={floor}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{floor}</CardTitle>
                      <CardDescription>
                        {floorWindows.length} caixilho(s) • {floorTotal} unidade(s)
                      </CardDescription>
                    </div>
                    <Badge variant="outline">{floorWindows.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {floorWindows.map(window => (
                      <div
                        key={window.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                        onClick={() => onWindowSelect?.(window)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(window.status)}
                            <span className="font-medium text-sm">{window.caixilhoCode}</span>
                            <span className="text-xs text-muted-foreground truncate">
                              {window.caixilhoType}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{window.name}</p>
                        </div>
                        <div className="flex items-center gap-3 ml-4">
                          <Badge variant="secondary" className="text-xs">
                            {window.quantity} un.
                          </Badge>
                          {getStatusBadge(window.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Visualização por Quantidade */}
        <TabsContent value="by-quantity" className="space-y-4">
          {Object.entries(windowsByQuantity).map(([quantity, qtyWindows]) => (
            <Card key={quantity}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{quantity} Unidade(s)</CardTitle>
                    <CardDescription>
                      {qtyWindows.length} tipo(s) de caixilho(s)
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-lg">
                    {qtyWindows.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {qtyWindows.map(window => (
                    <div
                      key={window.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                      onClick={() => onWindowSelect?.(window)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(window.status)}
                          <span className="font-medium text-sm">{window.caixilhoCode}</span>
                          <span className="text-xs text-muted-foreground truncate">
                            {window.caixilhoType}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{window.name}</p>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <Badge variant="secondary" className="text-xs">
                          {window.quantity} un.
                        </Badge>
                        {getStatusBadge(window.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Tabela Resumida */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Geral</CardTitle>
          <CardDescription>Todos os caixilhos filtrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 font-medium">Código</th>
                  <th className="text-left py-2 px-2 font-medium">Tipo</th>
                  <th className="text-left py-2 px-2 font-medium">Ambiente</th>
                  <th className="text-center py-2 px-2 font-medium">Qtd</th>
                  <th className="text-center py-2 px-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredWindows.map(window => (
                  <tr key={window.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-2 font-medium text-xs">{window.caixilhoCode}</td>
                    <td className="py-2 px-2 text-xs text-muted-foreground truncate max-w-xs">
                      {window.caixilhoType}
                    </td>
                    <td className="py-2 px-2 text-xs text-muted-foreground truncate max-w-xs">
                      {window.name}
                    </td>
                    <td className="py-2 px-2 text-center">
                      <Badge variant="secondary" className="text-xs">{window.quantity}</Badge>
                    </td>
                    <td className="py-2 px-2 text-center">
                      {getStatusBadge(window.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
