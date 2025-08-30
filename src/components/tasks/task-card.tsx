'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock,
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
  Sparkles
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { Task, TaskStatus } from '@/lib/types/tasks';

interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

export function TaskCard({ task, onStatusChange, onEdit, onDelete }: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // 计算任务状态
  const isCompleted = task.status === 'completed';
  const isInProgress = task.status === 'in_progress';
  const isOverdue = !isCompleted && task.dueDate.toDate() < new Date();
  const daysUntilDue = Math.ceil((task.dueDate.toDate().getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  // 优先级配置
  const priorityConfig = {
    high: { color: 'border-red-200 bg-red-50 text-red-700', label: '高', dotColor: 'bg-red-500' },
    medium: { color: 'border-yellow-200 bg-yellow-50 text-yellow-700', label: '中', dotColor: 'bg-yellow-500' },
    low: { color: 'border-green-200 bg-green-50 text-green-700', label: '低', dotColor: 'bg-green-500' }
  };

  // 分类配置
  const categoryConfig = {
    work: { label: '工作', color: 'bg-blue-100 text-blue-800' },
    study: { label: '学习', color: 'bg-purple-100 text-purple-800' },
    personal: { label: '个人', color: 'bg-gray-100 text-gray-800' },
    health: { label: '健康', color: 'bg-green-100 text-green-800' },
    other: { label: '其他', color: 'bg-orange-100 text-orange-800' }
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
    <Card 
      className={cn(
        "transition-all duration-200 cursor-pointer hover:shadow-md",
        isCompleted && "opacity-75",
        isOverdue && !isCompleted && "ring-2 ring-red-200",
        task.priority === 'high' && !isCompleted && "ring-1 ring-red-300"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
              <DropdownMenuItem onClick={() => onEdit?.(task)}>
                <Edit className="h-4 w-4 mr-2" />
                编辑任务
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete?.(task.id)}
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

        {/* 标签和分类 */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {/* 优先级 */}
          <div className="flex items-center gap-1">
            <div className={cn("h-2 w-2 rounded-full", priorityConfig[task.priority].dotColor)} />
            <span className="text-xs text-muted-foreground">
              {priorityConfig[task.priority].label}优先级
            </span>
          </div>

          {/* 分类 */}
          <Badge variant="secondary" className={cn("text-xs px-2 py-0.5", categoryConfig[task.category].color)}>
            {categoryConfig[task.category].label}
          </Badge>

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

        {/* 子任务预览 */}
        {task.subtasks.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>子任务</span>
              <span>
                {task.subtasks.filter(st => st.isCompleted).length}/{task.subtasks.length}
              </span>
            </div>
          </div>
        )}

        {/* 时间信息 */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            {/* 截止时间 */}
            <div className={cn(
              "flex items-center gap-1",
              isOverdue && "text-red-600",
              daysUntilDue <= 1 && !isOverdue && "text-orange-600"
            )}>
              <Calendar className="h-3 w-3" />
              <span>
                {isOverdue ? '已逾期' : 
                 daysUntilDue === 0 ? '今天' :
                 daysUntilDue === 1 ? '明天' :
                 `${daysUntilDue}天后`}
              </span>
              {isOverdue && <AlertTriangle className="h-3 w-3" />}
            </div>

            {/* 预估时间 */}
            {task.estimatedHours && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{task.estimatedHours}h</span>
              </div>
            )}
          </div>

          {/* 已花费时间 */}
          {task.timeSpent > 0 && (
            <div className="text-xs">
              已用 {Math.round(task.timeSpent / 60)}h
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
