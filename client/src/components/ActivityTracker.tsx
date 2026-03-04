import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, AlertCircle, Plus, Edit2, Trash2 } from 'lucide-react';

interface Activity {
  id: number;
  type: 'created' | 'updated' | 'deleted' | 'completed';
  title: string;
  description: string;
  timestamp: Date;
  user?: string;
}

interface ActivityTrackerProps {
  activities: Activity[];
  title?: string;
  maxItems?: number;
}

export const ActivityTracker: React.FC<ActivityTrackerProps> = ({
  activities,
  title = 'Histórico de Atividades',
  maxItems = 10,
}) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'created':
        return <Plus className="w-4 h-4 text-green-600" />;
      case 'updated':
        return <Edit2 className="w-4 h-4 text-blue-600" />;
      case 'deleted':
        return <Trash2 className="w-4 h-4 text-red-600" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActivityBadge = (type: string) => {
    const badges = {
      created: { label: 'Criado', variant: 'default' as const },
      updated: { label: 'Atualizado', variant: 'secondary' as const },
      deleted: { label: 'Deletado', variant: 'destructive' as const },
      completed: { label: 'Concluído', variant: 'default' as const },
    };
    return badges[type as keyof typeof badges] || badges.updated;
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Agora mesmo';
    if (minutes < 60) return `${minutes}m atrás`;
    if (hours < 24) return `${hours}h atrás`;
    if (days < 7) return `${days}d atrás`;
    
    return date.toLocaleDateString('pt-BR');
  };

  const displayedActivities = activities.slice(0, maxItems);

  return (
    <Card className="p-6 bg-white">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>

      {displayedActivities.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Nenhuma atividade registrada</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedActivities.map((activity, index) => (
            <div key={activity.id} className="flex gap-4">
              {/* Timeline */}
              <div className="flex flex-col items-center">
                <div className="p-2 bg-gray-100 rounded-full">
                  {getActivityIcon(activity.type)}
                </div>
                {index < displayedActivities.length - 1 && (
                  <div className="w-0.5 h-12 bg-gray-200 my-2" />
                )}
              </div>

              {/* Conteúdo */}
              <div className="flex-1 pt-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                    {activity.user && (
                      <p className="text-xs text-gray-500 mt-1">por {activity.user}</p>
                    )}
                  </div>
                  <Badge variant={getActivityBadge(activity.type).variant}>
                    {getActivityBadge(activity.type).label}
                  </Badge>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {formatDate(activity.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activities.length > maxItems && (
        <div className="mt-4 text-center">
          <button className="text-sm text-teal-600 hover:text-teal-700 font-medium">
            Ver todas as {activities.length} atividades
          </button>
        </div>
      )}
    </Card>
  );
};
