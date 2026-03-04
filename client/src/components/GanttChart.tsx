import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface GanttTask {
  id: number;
  name: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  status: 'not-started' | 'in-progress' | 'completed';
}

interface GanttChartProps {
  tasks: GanttTask[];
  title?: string;
}

export const GanttChart: React.FC<GanttChartProps> = ({ tasks, title = "Cronograma de Projeto" }) => {
  const { minDate, maxDate, dayCount } = useMemo(() => {
    if (tasks.length === 0) {
      const today = new Date();
      return { minDate: today, maxDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000), dayCount: 30 };
    }

    const dates = tasks.flatMap(t => [t.startDate, t.endDate]);
    const min = new Date(Math.min(...dates.map(d => d.getTime())));
    const max = new Date(Math.max(...dates.map(d => d.getTime())));
    
    // Adicionar margem de 5 dias antes e depois
    min.setDate(min.getDate() - 5);
    max.setDate(max.getDate() + 5);
    
    const dayCount = Math.ceil((max.getTime() - min.getTime()) / (1000 * 60 * 60 * 24));
    return { minDate: min, maxDate: max, dayCount };
  }, [tasks]);

  const getTaskPosition = (date: Date) => {
    const diff = date.getTime() - minDate.getTime();
    return (diff / (maxDate.getTime() - minDate.getTime())) * 100;
  };

  const getTaskWidth = (startDate: Date, endDate: Date) => {
    const start = getTaskPosition(startDate);
    const end = getTaskPosition(endDate);
    return Math.max(end - start, 2); // Mínimo de 2% de largura
  };

  const getStatusColor = (status: string, progress: number) => {
    if (status === 'completed') return 'bg-green-500';
    if (status === 'in-progress') return 'bg-blue-500';
    return 'bg-gray-300';
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'not-started': { label: 'Não Iniciado', variant: 'secondary' as const },
      'in-progress': { label: 'Em Andamento', variant: 'default' as const },
      'completed': { label: 'Concluído', variant: 'default' as const },
    };
    return statusMap[status as keyof typeof statusMap] || statusMap['not-started'];
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <Card className="p-6 bg-white">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">
          Período: {formatDate(minDate)} a {formatDate(maxDate)}
        </p>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhuma tarefa para exibir no cronograma</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Cabeçalho com meses */}
          <div className="relative h-12 bg-gray-50 rounded border border-gray-200">
            <div className="absolute inset-0 flex">
              {Array.from({ length: Math.ceil(dayCount / 7) }).map((_, i) => {
                const weekStart = new Date(minDate);
                weekStart.setDate(weekStart.getDate() + i * 7);
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekEnd.getDate() + 6);
                
                const weekStartPos = getTaskPosition(weekStart);
                const weekEndPos = getTaskPosition(weekEnd);
                
                return (
                  <div
                    key={i}
                    className="flex items-center justify-center text-xs font-medium text-gray-600 border-r border-gray-200"
                    style={{
                      width: `${weekEndPos - weekStartPos}%`,
                      minWidth: '50px',
                    }}
                  >
                    Sem {i + 1}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tarefas */}
          {tasks.map((task) => {
            const startPos = getTaskPosition(task.startDate);
            const width = getTaskWidth(task.startDate, task.endDate);
            const statusInfo = getStatusBadge(task.status);

            return (
              <div key={task.id} className="flex items-center gap-4">
                {/* Nome da tarefa */}
                <div className="w-32 flex-shrink-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{task.name}</p>
                  <Badge variant={statusInfo.variant} className="mt-1 text-xs">
                    {statusInfo.label}
                  </Badge>
                </div>

                {/* Barra de progresso */}
                <div className="flex-1 relative h-8 bg-gray-100 rounded border border-gray-200">
                  {/* Barra de tarefa */}
                  <div
                    className={`absolute h-full rounded transition-all ${getStatusColor(task.status, task.progress)}`}
                    style={{
                      left: `${startPos}%`,
                      width: `${width}%`,
                      opacity: 0.8,
                    }}
                  >
                    {/* Barra de progresso dentro da tarefa */}
                    <div
                      className="h-full bg-opacity-100 rounded transition-all"
                      style={{
                        width: `${task.progress}%`,
                        backgroundColor: task.status === 'completed' ? '#10b981' : 
                                        task.status === 'in-progress' ? '#3b82f6' : '#d1d5db',
                      }}
                    />
                  </div>

                  {/* Texto de progresso */}
                  {width > 15 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-semibold text-white drop-shadow">
                        {task.progress}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Datas */}
                <div className="w-24 flex-shrink-0 text-right">
                  <p className="text-xs text-gray-500">
                    {formatDate(task.startDate)} - {formatDate(task.endDate)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
