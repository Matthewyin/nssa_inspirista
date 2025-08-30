'use client';

import { useTaskStats } from '@/hooks/use-tasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  CheckSquare, 
  Clock, 
  TrendingUp, 
  AlertCircle,
  Target,
  Calendar,
  Lightbulb,
  List
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function OverviewCards() {
  const { stats, loading } = useTaskStats();

  if (loading) {
    return <OverviewCardsSkeleton />;
  }

  if (!stats) {
    return <EmptyOverviewCards />;
  }

  const completionRate = stats.completionRate;
  const isOnTrack = completionRate >= 70;
  const hasOverdue = stats.overdueTasks > 0;

  const cards = [
    {
      title: '总任务',
      value: stats.totalTasks,
      description: `${stats.completedTasks} 已完成`,
      icon: CheckSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      progress: completionRate,
      trend: completionRate >= 50 ? 'up' : 'down'
    },
    {
      title: '进行中',
      value: stats.inProgressTasks,
      description: '当前活跃任务',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      badge: stats.inProgressTasks > 5 ? '繁忙' : stats.inProgressTasks > 0 ? '正常' : '空闲'
    },
    {
      title: '完成率',
      value: `${Math.round(completionRate)}%`,
      description: isOnTrack ? '表现良好' : '需要努力',
      icon: TrendingUp,
      color: isOnTrack ? 'text-green-600' : 'text-yellow-600',
      bgColor: isOnTrack ? 'bg-green-50' : 'bg-yellow-50',
      progress: completionRate
    },
    {
      title: '逾期任务',
      value: stats.overdueTasks,
      description: hasOverdue ? '需要关注' : '按时进行',
      icon: AlertCircle,
      color: hasOverdue ? 'text-red-600' : 'text-green-600',
      bgColor: hasOverdue ? 'bg-red-50' : 'bg-green-50',
      urgent: hasOverdue
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className={cn(
          "transition-all duration-200 hover:shadow-md",
          card.urgent && "ring-2 ring-red-200"
        )}>
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
                  variant={card.badge === '繁忙' ? 'destructive' : 'secondary'}
                  className="text-xs"
                >
                  {card.badge}
                </Badge>
              )}
              {card.trend && (
                <div className={cn(
                  "flex items-center text-xs",
                  card.trend === 'up' ? 'text-green-600' : 'text-red-600'
                )}>
                  <TrendingUp className={cn(
                    "h-3 w-3 mr-1",
                    card.trend === 'down' && "rotate-180"
                  )} />
                  {card.trend === 'up' ? '良好' : '待改善'}
                </div>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground mb-2">
              {card.description}
            </p>
            
            {card.progress !== undefined && (
              <Progress 
                value={card.progress} 
                className="h-1"
                indicatorClassName={cn(
                  card.progress >= 70 ? 'bg-green-500' : 
                  card.progress >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                )}
              />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// 空状态组件
function EmptyOverviewCards() {
  const emptyCards = [
    {
      title: '总任务',
      value: '0',
      description: '开始创建您的第一个任务',
      icon: CheckSquare,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted'
    },
    {
      title: '灵感笔记',
      value: '0',
      description: '记录您的创意想法',
      icon: Lightbulb,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted'
    },
    {
      title: '清单项目',
      value: '0',
      description: '创建行为核对清单',
      icon: List,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted'
    },
    {
      title: '本周目标',
      value: '0',
      description: '设定您的周目标',
      icon: Target,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {emptyCards.map((card, index) => (
        <Card key={index} className="transition-all duration-200 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={cn("p-2 rounded-lg", card.bgColor)}>
              <card.icon className={cn("h-4 w-4", card.color)} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold mb-2", card.color)}>
              {card.value}
            </div>
            <p className="text-xs text-muted-foreground">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// 加载骨架屏
function OverviewCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-24 mb-2" />
            <Skeleton className="h-1 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
