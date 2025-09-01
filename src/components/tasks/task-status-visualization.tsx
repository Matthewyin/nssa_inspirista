'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2,
  Clock,
  Play,
  AlertTriangle,
  Target,
  TrendingUp,
  Calendar,
  Flag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSafeTaskDates, useNextMilestone, useTaskProgress } from '@/hooks/use-safe-dates';
import { safeToDate, safeFormatDate } from '@/lib/utils/date-utils';
import type { Task } from '@/lib/types/tasks';

interface TaskStatusVisualizationProps {
  task: Task;
  className?: string;
}

export function TaskStatusVisualization({ task, className }: TaskStatusVisualizationProps) {
  // 计算任务状态
  const isCompleted = task.status === 'completed';
  const isInProgress = task.status === 'in_progress';
  const isTodo = task.status === 'todo';

  // 使用安全的日期处理Hooks
  const { createdDate, dueDate } = useSafeTaskDates(task);
  const nextMilestone = useNextMilestone(task.milestones || []);
  const taskProgress = useTaskProgress(task);

  // 从taskProgress中提取里程碑相关数据
  const { completedMilestones, totalMilestones, percentage: milestoneProgress } = taskProgress;

  // 计算时间信息
  const now = new Date();
  const daysFromCreation = createdDate.date ? Math.ceil((now.getTime() - createdDate.date.getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const daysUntilDue = dueDate.daysUntilDue;
  const isOverdue = dueDate.isOverdue;
  const nextMilestoneDays = nextMilestone?.safeDateInfo.daysUntilDue || null;

  // 使用Hook计算的进度
  const milestoneProgress = taskProgress.percentage;

  // 状态配置
  const statusConfig = {
    todo: {
      label: '待办',
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: Clock,
      bgColor: 'bg-gray-50'
    },
    in_progress: {
      label: '进行中',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: Play,
      bgColor: 'bg-blue-50'
    },
    completed: {
      label: '已完成',
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: CheckCircle2,
      bgColor: 'bg-green-50'
    }
  };

  const currentStatus = statusConfig[task.status];

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          任务状态概览
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 主要状态 */}
        <div className={cn("p-4 rounded-lg border", currentStatus.bgColor, currentStatus.color.replace('text-', 'border-'))}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <currentStatus.icon className="h-6 w-6" />
              <div>
                <h3 className="font-semibold text-lg">{currentStatus.label}</h3>
                <p className="text-sm opacity-80">
                  {isCompleted && '任务已成功完成'}
                  {isInProgress && '任务正在进行中'}
                  {isTodo && '任务等待开始'}
                </p>
              </div>
            </div>
            
            {/* 进度百分比 */}
            <div className="text-right">
              <div className="text-2xl font-bold">{task.progress}%</div>
              <div className="text-xs opacity-80">总体进度</div>
            </div>
          </div>
        </div>

        {/* 里程碑进度 */}
        {totalMilestones > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium flex items-center gap-2">
                <Flag className="h-4 w-4" />
                里程碑进度
              </h4>
              <Badge variant="outline">
                {completedMilestones}/{totalMilestones}
              </Badge>
            </div>
            
            <Progress value={milestoneProgress} className="h-3" />
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-green-600">{completedMilestones}</div>
                <div className="text-muted-foreground">已完成</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-blue-600">{totalMilestones - completedMilestones}</div>
                <div className="text-muted-foreground">待完成</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{milestoneProgress}%</div>
                <div className="text-muted-foreground">完成率</div>
              </div>
            </div>
          </div>
        )}

        {/* 时间信息 */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            时间信息
          </h4>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div>
                <span className="text-muted-foreground">创建时间：</span>
                <div className="font-medium">
                  {createdDate.formatted || '无效日期'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {daysFromCreation}天前
                </div>
              </div>

              {dueDate.date && (
                <div>
                  <span className="text-muted-foreground">截止时间：</span>
                  <div className={cn("font-medium", isOverdue && "text-red-600")}>
                    {dueDate.formatted || '无效日期'}
                  </div>
                  <div className={cn("text-xs", isOverdue ? "text-red-600" : "text-muted-foreground")}>
                    {isOverdue ? `逾期${Math.abs(daysUntilDue!)}天` :
                     daysUntilDue === 0 ? '今天截止' :
                     daysUntilDue === 1 ? '明天截止' :
                     `还有${daysUntilDue}天`}
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              {task.completedAt && (
                <div>
                  <span className="text-muted-foreground">完成时间：</span>
                  <div className="font-medium text-green-600">
                    {safeFormatDate(safeToDate(task.completedAt), 'yyyy/MM/dd') || '无效日期'}
                  </div>
                  <div className="text-xs text-green-600">
                    {createdDate.date && safeToDate(task.completedAt) ?
                      Math.ceil((safeToDate(task.completedAt)!.getTime() - createdDate.date.getTime()) / (1000 * 60 * 60 * 24)) : 0}天完成
                  </div>
                </div>
              )}
              
              {nextMilestone && !isCompleted && (
                <div>
                  <span className="text-muted-foreground">下一里程碑：</span>
                  <div className="font-medium">
                    {nextMilestone.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {nextMilestoneDays !== null && (
                      nextMilestoneDays === 0 ? '今天' :
                      nextMilestoneDays === 1 ? '明天' :
                      nextMilestoneDays > 0 ? `${nextMilestoneDays}天后` :
                      `逾期${Math.abs(nextMilestoneDays)}天`
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 警告和提示 */}
        {(isOverdue || (nextMilestoneDays !== null && nextMilestoneDays < 0)) && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">注意</span>
            </div>
            <div className="text-sm text-red-700 mt-1">
              {isOverdue && '任务已逾期，请尽快完成'}
              {nextMilestoneDays !== null && nextMilestoneDays < 0 && '有里程碑已逾期，建议调整计划'}
            </div>
          </div>
        )}

        {/* 成功完成提示 */}
        {isCompleted && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle2 className="h-4 w-4" />
              <span className="font-medium">恭喜！</span>
            </div>
            <div className="text-sm text-green-700 mt-1">
              任务已成功完成，所有里程碑都已达成！
            </div>
          </div>
        )}

        {/* 进度提示 */}
        {isInProgress && nextMilestone && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800">
              <Target className="h-4 w-4" />
              <span className="font-medium">当前目标</span>
            </div>
            <div className="text-sm text-blue-700 mt-1">
              专注完成下一个里程碑：{nextMilestone.title}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
