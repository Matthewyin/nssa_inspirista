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
  ArrowRight,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// 模拟活动数据 - 实际项目中应该从API获取
const mockActivities = [
  {
    id: '1',
    type: 'task_completed' as const,
    title: '完成了任务：学习React Hooks',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2小时前
    metadata: {
      taskId: 'task-1',
      category: 'study',
      priority: 'high'
    }
  },
  {
    id: '2',
    type: 'task_created' as const,
    title: '创建了新任务：准备项目演示',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4小时前
    metadata: {
      taskId: 'task-2',
      category: 'work',
      isAIGenerated: true
    }
  },
  {
    id: '3',
    type: 'note_created' as const,
    title: '记录了新灵感：移动端优化想法',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6小时前
    metadata: {
      noteId: 'note-1',
      tags: ['移动端', '优化', 'UX']
    }
  },
  {
    id: '4',
    type: 'checklist_completed' as const,
    title: '完成了清单：晨间例行公事',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8小时前
    metadata: {
      checklistId: 'checklist-1',
      completedItems: 5,
      totalItems: 6
    }
  },
  {
    id: '5',
    type: 'task_completed' as const,
    title: '完成了任务：代码审查',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1天前
    metadata: {
      taskId: 'task-3',
      category: 'work',
      priority: 'medium'
    }
  }
];

type ActivityType = 'task_completed' | 'task_created' | 'note_created' | 'checklist_completed';

interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  timestamp: Date;
  metadata?: any;
}

export function RecentActivities() {
  const activities = mockActivities.slice(0, 4); // 只显示最近4条活动
  const loading = false; // 在实际项目中，这里应该来自Hook

  if (loading) {
    return <RecentActivitiesSkeleton />;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5" />
          最近活动
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/activities">
            查看全部
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
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

// 活动项组件
function ActivityItem({ activity }: { activity: Activity }) {
  const getActivityConfig = (type: ActivityType) => {
    const configs = {
      task_completed: {
        icon: CheckSquare,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        label: '任务完成'
      },
      task_created: {
        icon: CheckSquare,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        label: '任务创建'
      },
      note_created: {
        icon: Lightbulb,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        label: '灵感记录'
      },
      checklist_completed: {
        icon: List,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        label: '清单完成'
      }
    };
    return configs[type];
  };

  const config = getActivityConfig(activity.type);
  const timeAgo = getTimeAgo(activity.timestamp);

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
              AI生成
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
        {activity.timestamp.toLocaleTimeString('zh-CN', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </div>
    </div>
  );
}

// 空状态组件
function EmptyActivities() {
  return (
    <div className="text-center py-8">
      <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium mb-2">暂无活动记录</h3>
      <p className="text-muted-foreground mb-4">
        开始创建任务、记录灵感或完成清单来查看活动历史
      </p>
      <div className="flex justify-center gap-2">
        <Button size="sm" asChild>
          <Link href="/tasks">创建任务</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href="/notes/new">记录灵感</Link>
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
