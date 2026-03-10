import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CheckCircle2, AlertCircle, Clock, Download, Filter } from 'lucide-react';

interface Window {
  id: number;
  name: string;
  caixilhoCode: string;
  caixilhoType: string;
  quantity: number;
  floor?: string;
  status?: 'pending' | 'in_progress' | 'completed';
}

interface TableWindowsControlProps {
  windows: Window[];
  onWindowSelect?: (window: Window) => void;
}

export default function TableWindowsControl({ windows, onWindowSelect }: TableWindowsControlProps) {
  const [searchCode, setSearchCode] = useState('');
  const [searchEnvironment, setSearchEnvironment] = useState('');
  const [filterFloor, setFilterFloor] = useState<string>('');
  const [sortBy, setSortBy] = useState<'floor' | 'environment' | 'code' | 'quantity'>('floor');

  // Extrair pavimentos únicos
  const floors = useMemo(() => {
    const floorSet = new Set<string>();
    windows.forEach(w => {
      const floorMatch = w.name.match(/-(.*?)$/);
      const floor = floorMatch ? floorMatch[1].trim() : 'Sem Pavimento';
      floorSet.add(floor);
    });
    return Array.from(floorSet).sort();
  }, [windows]);

  // Processar e filtrar dados
  const processedData = useMemo(() => {
    return windows
      .map(w => {
        const floorMatch = w.name.match(/-(.*?)$/);
        const floor = floorMatch ? floorMatch[1].trim() : 'Sem Pavimento';
        const environmentMatch = w.name.match(/^(.*?)\s*-/);
        const environment = environmentMatch ? environmentMatch[1].trim() : w.name;

        return {
          ...w,
          floor,
          environment,
        };
      })
      .filter(w => {
        const matchCode = w.caixilhoCode.toLowerCase().includes(searchCode.toLowerCase());
        const matchEnv = w.environment.toLowerCase().includes(searchEnvironment.toLowerCase());
        const matchFloor = !filterFloor || w.floor === filterFloor;
        return matchCode && matchEnv && matchFloor;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'floor':
            return a.floor.localeCompare(b.floor) || a.environment.localeCompare(b.environment);
          case 'environment':
            return a.environment.localeCompare(b.environment) || a.floor.localeCompare(b.floor);
          case 'code':
            return a.caixilhoCode.localeCompare(b.caixilhoCode);
          case 'quantity':
            return b.quantity - a.quantity;
          default:
            return 0;
        }
      });
  }, [windows, searchCode, searchEnvironment, filterFloor, sortBy]);

  // Calcular estatísticas
  const stats = useMemo(() => {
    return {
      totalWindows: processedData.length,
      totalQuantity: processedData.reduce((sum, w) => sum + w.quantity, 0),
      totalFloors: new Set(processedData.map(w => w.floor)).size,
      completed: processedData.filter(w => w.status === 'completed').length,
      inProgress: processedData.filter(w => w.status === 'in_progress').length,
      pending: processedData.filter(w => w.status === 'pending').length,
    };
  }, [processedData]);

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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-xs md:text-sm text-muted-foreground">Total</p>
              <p className="text-xl md:text-2xl font-bold">{stats.totalWindows}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-xs md:text-sm text-muted-foreground">Quantidade</p>
              <p className="text-xl md:text-2xl font-bold">{stats.totalQuantity}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-xs md:text-sm text-muted-foreground">Pavimentos</p>
              <p className="text-xl md:text-2xl font-bold">{stats.totalFloors}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-xs md:text-sm text-muted-foreground">Concluído</p>
              <p className="text-xl md:text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-xs md:text-sm text-muted-foreground">Pendente</p>
              <p className="text-xl md:text-2xl font-bold text-gray-600">{stats.pending}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Código</label>
              <Input
                placeholder="Ex: AL-001"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                className="text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Ambiente</label>
              <Input
                placeholder="Ex: SUÍTES"
                value={searchEnvironment}
                onChange={(e) => setSearchEnvironment(e.target.value)}
                className="text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Pavimento</label>
              <select
                value={filterFloor}
                onChange={(e) => setFilterFloor(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background"
              >
                <option value="">Todos</option>
                {floors.map(floor => (
                  <option key={floor} value={floor}>{floor}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Ordenar por</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background"
              >
                <option value="floor">Pavimento</option>
                <option value="environment">Ambiente</option>
                <option value="code">Código</option>
                <option value="quantity">Quantidade</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Caixilhos ({processedData.length})</CardTitle>
          <CardDescription>
            {processedData.length} de {windows.length} caixilhos • {stats.totalQuantity} unidades
          </CardDescription>
        </CardHeader>
        <CardContent>
          {processedData.length > 0 ? (
            <div className="overflow-x-auto">
              <Table className="text-xs md:text-sm">
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-bold">Pavimento</TableHead>
                    <TableHead className="font-bold">Ambiente</TableHead>
                    <TableHead className="font-bold">Código</TableHead>
                    <TableHead className="font-bold">Tipo</TableHead>
                    <TableHead className="font-bold text-right">Qtd.</TableHead>
                    <TableHead className="font-bold text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedData.map((window, idx) => (
                    <TableRow
                      key={window.id}
                      className="hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => onWindowSelect?.(window)}
                    >
                      <TableCell className="font-medium text-xs md:text-sm">
                        <Badge variant="outline" className="text-xs">
                          {window.floor}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-xs md:text-sm">
                        {window.environment}
                      </TableCell>
                      <TableCell className="font-mono font-bold text-xs md:text-sm">
                        {window.caixilhoCode}
                      </TableCell>
                      <TableCell className="text-xs md:text-sm text-muted-foreground">
                        {window.caixilhoType}
                      </TableCell>
                      <TableCell className="text-right font-bold text-xs md:text-sm">
                        <Badge className="bg-blue-100 text-blue-800">
                          {window.quantity}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          {getStatusIcon(window.status)}
                          {getStatusBadge(window.status)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-2">Nenhum caixilho encontrado</h4>
              <p className="text-muted-foreground">
                {searchCode || searchEnvironment || filterFloor
                  ? 'Tente ajustar os filtros'
                  : 'Importe um PDF para começar'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botão de Exportação */}
      <div className="flex justify-end">
        <Button className="gap-2">
          <Download className="h-4 w-4" />
          Exportar Relatório
        </Button>
      </div>
    </div>
  );
}
