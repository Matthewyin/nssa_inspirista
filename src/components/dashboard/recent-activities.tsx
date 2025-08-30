'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CheckSquare,
  Lightbulb,
  List,
  Clock,
  Calendar,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useActivities, type Activity as ActivityType, type ActivityType as ActivityTypeEnum } from '@/hooks/use-activities';
import { useLanguage } from '@/hooks/use-language';

export function RecentActivities() {
  const { t } = useLanguage();
  const { activities, loading } = useActivities(4); // Get recent 4 activities

  if (loading) {
    return <RecentActivitiesSkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5" />
          {t('dashboard.recentActivities')}
        </CardTitle>
      </CardHeader>

      <CardContent>
        {activities.length === 0 ? (
          <EmptyActivities />
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Activity item component
function ActivityItem({ activity }: { activity: ActivityType }) {
  const { t } = useLanguage();

  const getActivityConfig = (type: ActivityTypeEnum) => {
    const configs = {
      task_completed: {
        icon: CheckSquare,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        label: t('dashboard.activities.taskCompleted')
      },
      task_created: {
        icon: CheckSquare,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        label: t('dashboard.activities.taskCreated')
      },
      note_created: {
        icon: Lightbulb,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        label: t('dashboard.activities.noteCreated')
      },
      checklist_completed: {
        icon: List,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        label: t('dashboard.activities.checklistCompleted')
      }
    };
    return configs[type];
  };

  const config = getActivityConfig(activity.type);
  const timeAgo = getTimeAgo(activity.timestamp.toDate());

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
      {/* 活动图标 */}
      <div className={cn("p-2 rounded-lg flex-shrink-0", config.bgColor)}>
        <config.icon className={cn("h-4 w-4", config.color)} />
      </div>

      {/* 活动内容 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className="text-xs">
            {config.label}
          </Badge>
          {activity.metadata?.isAIGenerated && (
            <Badge variant="secondary" className="text-xs">
              {t('dashboard.activities.aiGenerated')}
            </Badge>
          )}
        </div>
        
        <p className="text-sm font-medium text-foreground mb-1">
          {activity.title}
        </p>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{timeAgo}</span>
          
          {/* 额外的元数据 */}
          {activity.metadata?.category && (
            <>
              <span>•</span>
              <span className="capitalize">{activity.metadata.category}</span>
            </>
          )}
          
          {activity.metadata?.priority && (
            <>
              <span>•</span>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs px-1 py-0",
                  activity.metadata.priority === 'high' && "border-red-200 text-red-600",
                  activity.metadata.priority === 'medium' && "border-yellow-200 text-yellow-600",
                  activity.metadata.priority === 'low' && "border-green-200 text-green-600"
                )}
              >
                {activity.metadata.priority === 'high' ? '高' : 
                 activity.metadata.priority === 'medium' ? '中' : '低'}优先级
              </Badge>
            </>
          )}
          
          {activity.metadata?.tags && (
            <>
              <span>•</span>
              <span>{activity.metadata.tags.slice(0, 2).join(', ')}</span>
            </>
          )}
        </div>
      </div>

      {/* 时间戳 */}
      <div className="text-xs text-muted-foreground flex-shrink-0">
        {activity.timestamp.toDate().toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit'
        })}
      </div>
    </div>
  );
}

// Empty state component
function EmptyActivities() {
  const { t } = useLanguage();

  return (
    <div className="text-center py-8">
      <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium mb-2">{t('dashboard.noActivities')}</h3>
      <p className="text-muted-foreground mb-4">
        {t('dashboard.noActivitiesDesc')}
      </p>
      <div className="flex justify-center gap-2">
        <Button size="sm" asChild>
          <Link href="/tasks">{t('dashboard.createTask')}</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href="/notes/new">{t('dashboard.recordInspiration')}</Link>
        </Button>
      </div>
    </div>
  );
}

// 加载骨架屏
function RecentActivitiesSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-8 w-20" />
      </CardHeader>
      
      <CardContent className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 p-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// 时间格式化函数
function getTimeAgo(timestamp: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return '刚刚';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}分钟前`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}小时前`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}天前`;
  } else {
    return timestamp.toLocaleDateString('zh-CN');
  }
}
