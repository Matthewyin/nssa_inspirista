'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TaskEditDialog } from './task-edit-dialog';
import { TaskDeleteDialog } from './task-delete-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MilestoneProgress } from './milestone-progress';
import {
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Circle,
  MoreHorizontal,
  Edit,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Target
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  safeGetTaskDueDate,
  safeIsTaskOverdue,
  safeGetDaysUntilDue,
  getFriendlyDateText,
  safeToDate
} from '@/lib/utils/date-utils';
import type { Task, TaskStatus } from '@/lib/types/tasks';

interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onMilestoneToggle?: (milestoneId: string, isCompleted: boolean) => void;
}

export function TaskCard({ task, onStatusChange, onEdit, onDelete, onMilestoneToggle }: TaskCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  // 对话框状态
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // 计算任务状态
  const isCompleted = task.status === 'completed';
  const isInProgress = task.status === 'in_progress';

  // 使用安全的日期处理函数
  const dueDate = safeGetTaskDueDate(task);
  const isOverdue = safeIsTaskOverdue(task);
  const daysUntilDue = safeGetDaysUntilDue(task);

  // 处理卡片点击
  const handleCardClick = (e: React.MouseEvent) => {
    // 如果点击的是按钮或其他交互元素，不触发跳转
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    router.push(`/tasks/${task.id}`);
  };

  // 状态操作按钮
  const getStatusActions = () => {
    switch (task.status) {
      case 'todo':
        return [
          { icon: Play, label: '开始任务', action: () => onStatusChange(task.id, 'in_progress') },
          { icon: CheckCircle2, label: '标记完成', action: () => onStatusChange(task.id, 'completed') }
        ];
      case 'in_progress':
        return [
          { icon: Pause, label: '暂停任务', action: () => onStatusChange(task.id, 'todo') },
          { icon: CheckCircle2, label: '标记完成', action: () => onStatusChange(task.id, 'completed') }
        ];
      case 'completed':
        return [
          { icon: RotateCcw, label: '重新开始', action: () => onStatusChange(task.id, 'todo') }
        ];
      default:
        return [];
    }
  };

  return (
    <>
    <Card
      className={cn(
        "transition-all duration-200 cursor-pointer hover:shadow-md",
        isCompleted && "opacity-75",
        isOverdue && !isCompleted && "ring-2 ring-red-200",
        task.priority === 'high' && !isCompleted && "ring-1 ring-red-300"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        {/* 任务标题和状态 */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            {/* 状态图标 */}
            <div className="flex-shrink-0 mt-0.5">
              {isCompleted ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : isInProgress ? (
                <div className="h-4 w-4 rounded-full border-2 border-blue-500 bg-blue-100 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                </div>
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground" />
              )}
            </div>

            {/* 任务标题 */}
            <h4 className={cn(
              "font-medium text-sm leading-tight",
              isCompleted && "line-through text-muted-foreground"
            )}>
              {task.title}
            </h4>
          </div>

          {/* 操作菜单 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-6 w-6 p-0 opacity-0 transition-opacity",
                  isHovered && "opacity-100"
                )}
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {getStatusActions().map((action, index) => (
                <DropdownMenuItem key={index} onClick={action.action}>
                  <action.icon className="h-4 w-4 mr-2" />
                  {action.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                <Edit className="h-4 w-4 mr-2" />
                编辑任务
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeleteDialogOpen(true)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                删除任务
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* 任务描述 */}
        {task.description && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* 标签和AI标识 */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {/* 任务标签 */}
          {task.tags && task.tags.length > 0 && (
            <>
              {task.tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5">
                  {tag}
                </Badge>
              ))}
              {task.tags.length > 2 && (
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  +{task.tags.length - 2}
                </Badge>
              )}
            </>
          )}

          {/* AI生成标识 */}
          {task.isAIGenerated && (
            <Badge variant="outline" className="text-xs px-2 py-0.5 border-purple-200 text-purple-600">
              <Sparkles className="h-3 w-3 mr-1" />
              AI
            </Badge>
          )}
        </div>

        {/* 进度条 */}
        {task.progress > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">进度</span>
              <span className="text-xs font-medium">{task.progress}%</span>
            </div>
            <Progress value={task.progress} className="h-1.5" />
          </div>
        )}

        {/* 里程碑进度 */}
        {task.milestones && task.milestones.length > 0 && (
          <div className="mb-3">
            <MilestoneProgress
              milestones={task.milestones}
              onMilestoneToggle={onMilestoneToggle}
              compact={true}
              className="border-0 shadow-none bg-transparent p-0"
            />
          </div>
        )}

        {/* 时间信息 */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            {/* 截止时间 */}
            {dueDate && (
              <div className={cn(
                "flex items-center gap-1",
                isOverdue && "text-red-600",
                daysUntilDue !== null && daysUntilDue <= 1 && !isOverdue && "text-orange-600"
              )}>
                <Calendar className="h-3 w-3" />
                <span>
                  {isOverdue ? '已逾期' :
                   daysUntilDue === 0 ? '今天' :
                   daysUntilDue === 1 ? '明天' :
                   daysUntilDue !== null ? `${daysUntilDue}天后` : ''}
                </span>
                {isOverdue && <AlertTriangle className="h-3 w-3" />}
              </div>
            )}

            {/* 里程碑数量 */}
            {task.milestones && task.milestones.length > 0 && (
              <div className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                <span>{task.milestones.length}个里程碑</span>
              </div>
            )}
          </div>

          {/* 创建时间 */}
          <div className="text-xs">
            {getFriendlyDateText(task.createdAt)}
          </div>
        </div>
      </CardContent>
    </Card>

    {/* 编辑对话框 */}
    <TaskEditDialog
      task={task}
      open={editDialogOpen}
      onOpenChange={setEditDialogOpen}
    />

    {/* 删除确认对话框 */}
    <TaskDeleteDialog
      task={task}
      open={deleteDialogOpen}
      onOpenChange={setDeleteDialogOpen}
    />
    </>
  );
}
