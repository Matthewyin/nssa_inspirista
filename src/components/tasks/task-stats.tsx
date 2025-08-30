'use client';

import { useTaskStats } from '@/hooks/use-tasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/hooks/use-language';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  CheckSquare,
  Clock,
  TrendingUp,
  AlertTriangle,
  Target,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function TaskStats() {
  const { t } = useLanguage();
  const { stats, loading } = useTaskStats();

  if (loading) {
    return <TaskStatsSkeleton />;
  }

  if (!stats) {
    return null;
  }

  const completionRate = stats.completionRate;
  const isOnTrack = completionRate >= 70;
  const hasOverdue = stats.overdueTasks > 0;

  const statCards = [
    {
      title: t('tasks.stats.totalTasks'),
      value: stats.totalTasks,
      description: `${stats.completedTasks} ${t('tasks.stats.completed')}`,
      icon: CheckSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      progress: completionRate,
      trend: {
        value: completionRate,
        isPositive: completionRate >= 50
      }
    },
    {
      title: t('tasks.stats.inProgress'),
      value: stats.inProgressTasks,
      description: t('tasks.stats.currentActive'),
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      badge: stats.inProgressTasks > 5 ? t('tasks.stats.busy') : stats.inProgressTasks > 0 ? t('tasks.stats.normal') : t('tasks.stats.idle'),
      badgeVariant: stats.inProgressTasks > 5 ? 'destructive' : 'secondary'
    },
    {
      title: t('tasks.stats.completionRate'),
      value: `${Math.round(completionRate)}%`,
      description: isOnTrack ? t('tasks.stats.performingWell') : t('tasks.stats.needsImprovement'),
      icon: TrendingUp,
      color: isOnTrack ? 'text-green-600' : 'text-yellow-600',
      bgColor: isOnTrack ? 'bg-green-50' : 'bg-yellow-50',
      progress: completionRate,
      trend: {
        value: completionRate,
        isPositive: isOnTrack
      }
    },
    {
      title: t('tasks.stats.overdueTasks'),
      value: stats.overdueTasks,
      description: hasOverdue ? t('tasks.stats.needsAttention') : t('tasks.stats.onTrack'),
      icon: AlertTriangle,
      color: hasOverdue ? 'text-red-600' : 'text-green-600',
      bgColor: hasOverdue ? 'bg-red-50' : 'bg-green-50',
      urgent: hasOverdue,
      badge: hasOverdue ? t('tasks.stats.urgent') : t('tasks.stats.normal'),
      badgeVariant: hasOverdue ? 'destructive' : 'secondary'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card, index) => (
        <Card 
          key={index} 
          className={cn(
            "transition-all duration-200 hover:shadow-md",
            card.urgent && "ring-2 ring-red-200 shadow-sm"
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={cn("p-2 rounded-lg", card.bgColor)}>
              <card.icon className={cn("h-4 w-4", card.color)} />
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div className={cn("text-2xl font-bold", card.color)}>
                {card.value}
              </div>
              
              {card.badge && (
                <Badge 
                  variant={card.badgeVariant as any}
                  className="text-xs"
                >
                  {card.badge}
                </Badge>
              )}
              
              {card.trend && (
                <div className={cn(
                  "flex items-center text-xs",
                  card.trend.isPositive ? 'text-green-600' : 'text-red-600'
                )}>
                  <TrendingUp className={cn(
                    "h-3 w-3 mr-1",
                    !card.trend.isPositive && "rotate-180"
                  )} />
                  {card.trend.isPositive ? t('tasks.stats.good') : t('tasks.stats.needsWork')}
                </div>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground mb-2">
              {card.description}
            </p>
            
            {card.progress !== undefined && (
              <div className="space-y-1">
                <Progress 
                  value={card.progress} 
                  className="h-1.5"
                  indicatorClassName={cn(
                    card.progress >= 70 ? 'bg-green-500' : 
                    card.progress >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                  )}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Loading skeleton
function TaskStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-5 w-12" />
            </div>
            <Skeleton className="h-3 w-24 mb-2" />
            <Skeleton className="h-1.5 w-full mb-1" />
            <div className="flex justify-between">
              <Skeleton className="h-3 w-6" />
              <Skeleton className="h-3 w-8" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
