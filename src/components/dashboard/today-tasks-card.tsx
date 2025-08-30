'use client';

import { useTodayTasks } from '@/hooks/use-tasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Calendar,
  Clock,
  Plus,
  CheckCircle2,
  Circle,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { Task } from '@/lib/types/tasks';

export function TodayTasksCard() {
  const { todayTasks, loading } = useTodayTasks();

  if (loading) {
    return <TodayTasksSkeleton />;
  }

  const completedTasks = todayTasks.filter(task => task.status === 'completed');
  const pendingTasks = todayTasks.filter(task => task.status !== 'completed');
  const completionRate = todayTasks.length > 0 ? (completedTasks.length / todayTasks.length) * 100 : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-lg">今日任务</CardTitle>
          <Badge variant="outline" className="ml-2">
            {todayTasks.length} 个任务
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {todayTasks.length > 0 && (
            <div className="text-sm text-muted-foreground">
              完成率 {Math.round(completionRate)}%
            </div>
          )}
          <Button size="sm" asChild>
            <Link href="/tasks">
              查看全部
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {todayTasks.length === 0 ? (
          <EmptyTodayTasks />
        ) : (
          <div className="space-y-4">
            {/* 进度条 */}
            <div className="space-y-2">
              <Progress value={completionRate} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{completedTasks.length} 已完成</span>
                <span>{pendingTasks.length} 待完成</span>
              </div>
            </div>

            {/* 任务列表 */}
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {todayTasks.slice(0, 6).map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
              
              {todayTasks.length > 6 && (
                <div className="text-center pt-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/tasks">
                      查看更多 {todayTasks.length - 6} 个任务
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 任务项组件
function TaskItem({ task }: { task: Task }) {
  const isCompleted = task.status === 'completed';
  const isOverdue = !isCompleted && task.dueDate.toDate() < new Date();
  
  const priorityColors = {
    high: 'border-red-200 bg-red-50',
    medium: 'border-yellow-200 bg-yellow-50',
    low: 'border-green-200 bg-green-50'
  };

  const priorityLabels = {
    high: '高',
    medium: '中',
    low: '低'
  };

  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 hover:shadow-sm",
      isCompleted ? 'bg-muted/50 opacity-75' : 'bg-background',
      isOverdue && !isCompleted && 'border-red-200 bg-red-50'
    )}>
      {/* 状态图标 */}
      <div className="flex-shrink-0">
        {isCompleted ? (
          <CheckCircle2 className="h-5 w-5 text-green-600" />
        ) : (
          <Circle className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer" />
        )}
      </div>

      {/* 任务内容 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className={cn(
            "font-medium truncate",
            isCompleted && "line-through text-muted-foreground"
          )}>
            {task.title}
          </h4>
          
          {/* 优先级标签 */}
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs px-1.5 py-0.5",
              priorityColors[task.priority]
            )}
          >
            {priorityLabels[task.priority]}
          </Badge>

          {/* 逾期警告 */}
          {isOverdue && (
            <AlertTriangle className="h-4 w-4 text-red-500" />
          )}
        </div>

        {/* 任务描述和进度 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {task.category && (
              <span className="capitalize">{task.category}</span>
            )}
            {task.estimatedHours && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {task.estimatedHours}h
                </div>
              </>
            )}
          </div>
          
          {/* 进度 */}
          {task.progress > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${task.progress}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {task.progress}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 空状态组件
function EmptyTodayTasks() {
  const { t } = useLanguage();

  return (
    <div className="text-center py-8">
      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium mb-2">{t('dashboard.todayTasks.empty.title')}</h3>
      <p className="text-muted-foreground mb-4">
        {t('dashboard.todayTasks.empty.description')}
      </p>
      <Button asChild>
        <Link href="/tasks">
          <Plus className="h-4 w-4 mr-2" />
          {t('dashboard.todayTasks.empty.createButton')}
        </Link>
      </Button>
    </div>
  );
}

// 加载骨架屏
function TodayTasksSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-8 w-20" />
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-2 w-full" />
          <div className="flex justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>

        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <Skeleton className="h-5 w-5 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
