'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar,
  Clock,
  Edit,
  Trash2,
  Play,
  Pause,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  FileText,
  Tag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { MilestoneProgress } from './milestone-progress';
import { useSafeTaskDates } from '@/hooks/use-safe-dates';
import { safeToDate, safeFormatDate } from '@/lib/utils/date-utils';
import type { Task } from '@/lib/types/tasks';

interface TaskDetailViewProps {
  task: Task;
  onEdit?: () => void;
  onDelete?: () => void;
  onStatusChange?: (status: Task['status']) => void;
  onMilestoneToggle?: (milestoneId: string, isCompleted: boolean) => void;
  className?: string;
}

export function TaskDetailView({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  onMilestoneToggle,
  className
}: TaskDetailViewProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // 使用安全的日期处理Hook
  const { createdDate, dueDate } = useSafeTaskDates(task);

  // 计算任务状态
  const isCompleted = task.status === 'completed';
  const isInProgress = task.status === 'in_progress';
  const isOverdue = dueDate.isOverdue;

  // 状态配置
  const statusConfig = {
    todo: { 
      label: '待办', 
      color: 'bg-gray-100 text-gray-800',
      icon: Clock,
      actions: [
        { label: '开始', action: () => onStatusChange?.('in_progress'), icon: Play }
      ]
    },
    in_progress: { 
      label: '进行中', 
      color: 'bg-blue-100 text-blue-800',
      icon: Play,
      actions: [
        { label: '完成', action: () => onStatusChange?.('completed'), icon: CheckCircle2 },
        { label: '暂停', action: () => onStatusChange?.('todo'), icon: Pause }
      ]
    },
    completed: { 
      label: '已完成', 
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle2,
      actions: [
        { label: '重新开始', action: () => onStatusChange?.('todo'), icon: RotateCcw }
      ]
    }
  };

  const currentStatus = statusConfig[task.status];

  return (
    <div className={cn("space-y-6", className)}>
      {/* 任务基本信息 */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-xl">{task.title}</CardTitle>
                {task.isAIGenerated && (
                  <Badge variant="outline" className="border-purple-200 text-purple-600">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI
                  </Badge>
                )}
              </div>
              
              {/* 状态和进度 */}
              <div className="flex items-center gap-3 mb-3">
                <Badge className={currentStatus.color}>
                  <currentStatus.icon className="h-3 w-3 mr-1" />
                  {currentStatus.label}
                </Badge>
                
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <span>进度：{task.progress}%</span>
                </div>
                
                {isOverdue && (
                  <Badge variant="destructive" className="text-xs">
                    已逾期
                  </Badge>
                )}
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center gap-2">
              {currentStatus.actions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={action.action}
                  className="flex items-center gap-1"
                >
                  <action.icon className="h-3 w-3" />
                  {action.label}
                </Button>
              ))}
              
              {onEdit && (
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <Edit className="h-3 w-3" />
                </Button>
              )}
              
              {onDelete && (
                <Button variant="outline" size="sm" onClick={onDelete}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 任务描述 */}
          {task.description && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">描述</span>
              </div>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap pl-6">
                {task.description}
              </div>
            </div>
          )}

          {/* 标签 */}
          {task.tags && task.tags.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">标签</span>
              </div>
              <div className="flex flex-wrap gap-2 pl-6">
                {task.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* 时间信息 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">时间信息</span>
            </div>
            <div className="grid grid-cols-2 gap-4 pl-6 text-sm">
              <div>
                <span className="text-muted-foreground">创建时间：</span>
                <span>{createdDate.formatted || '无效日期'}</span>
              </div>

              {dueDate.date && (
                <div>
                  <span className="text-muted-foreground">截止时间：</span>
                  <span className={cn(isOverdue && "text-red-600")}>
                    {dueDate.formatted || '无效日期'}
                  </span>
                </div>
              )}

              <div>
                <span className="text-muted-foreground">更新时间：</span>
                <span>{safeFormatDate(safeToDate(task.updatedAt), 'yyyy/MM/dd HH:mm') || '无效日期'}</span>
              </div>

              {task.completedAt && (
                <div>
                  <span className="text-muted-foreground">完成时间：</span>
                  <span className="text-green-600">
                    {safeFormatDate(safeToDate(task.completedAt), 'yyyy/MM/dd HH:mm') || '无效日期'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 里程碑进度 */}
      {task.milestones && task.milestones.length > 0 && (
        <MilestoneProgress
          milestones={task.milestones}
          onMilestoneToggle={onMilestoneToggle}
          compact={false}
        />
      )}

      {/* 兼容性信息（如果有旧的子任务数据） */}
      {task.subtasks && task.subtasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              子任务（兼容模式）
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {task.subtasks.map((subtask, index) => (
                <div key={subtask.id} className="flex items-center gap-2 text-sm">
                  <div className={cn(
                    "h-2 w-2 rounded-full",
                    subtask.isCompleted ? "bg-green-500" : "bg-gray-300"
                  )} />
                  <span className={cn(
                    subtask.isCompleted && "line-through text-muted-foreground"
                  )}>
                    {subtask.title}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
