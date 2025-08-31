'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  CheckCircle2,
  Circle,
  MoreHorizontal,
  Edit,
  Trash2,
  Clock,
  Calendar,
  AlertTriangle,
  RotateCcw,
  Play,
  Pause
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { Milestone } from '@/lib/types/tasks';

interface MilestoneQuickActionsProps {
  milestone: Milestone;
  onToggleComplete?: (milestoneId: string, isCompleted: boolean) => void;
  onEdit?: (milestone: Milestone) => void;
  onDelete?: (milestoneId: string) => void;
  compact?: boolean;
  className?: string;
}

export function MilestoneQuickActions({
  milestone,
  onToggleComplete,
  onEdit,
  onDelete,
  compact = false,
  className
}: MilestoneQuickActionsProps) {
  const [isLoading, setIsLoading] = useState(false);

  // 计算时间状态
  const now = new Date();
  const isOverdue = !milestone.isCompleted && milestone.targetDate < now;
  const daysUntilDue = Math.ceil((milestone.targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isToday = daysUntilDue === 0;
  const isTomorrow = daysUntilDue === 1;

  // 处理完成状态切换
  const handleToggleComplete = async () => {
    if (!onToggleComplete) return;
    
    setIsLoading(true);
    try {
      await onToggleComplete(milestone.id, !milestone.isCompleted);
    } finally {
      setIsLoading(false);
    }
  };

  // 获取状态颜色和图标
  const getStatusConfig = () => {
    if (milestone.isCompleted) {
      return {
        color: 'text-green-600',
        bgColor: 'bg-green-50 border-green-200',
        icon: CheckCircle2,
        label: '已完成'
      };
    } else if (isOverdue) {
      return {
        color: 'text-red-600',
        bgColor: 'bg-red-50 border-red-200',
        icon: AlertTriangle,
        label: '已逾期'
      };
    } else if (isToday) {
      return {
        color: 'text-orange-600',
        bgColor: 'bg-orange-50 border-orange-200',
        icon: Clock,
        label: '今天'
      };
    } else {
      return {
        color: 'text-muted-foreground',
        bgColor: 'bg-gray-50 border-gray-200',
        icon: Circle,
        label: '待完成'
      };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-2", className)}>
        {/* 完成状态按钮 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size={compact ? "sm" : "default"}
              className={cn(
                "h-8 w-8 p-0 rounded-full",
                statusConfig.color,
                isLoading && "opacity-50"
              )}
              onClick={handleToggleComplete}
              disabled={isLoading || !onToggleComplete}
            >
              <statusConfig.icon className={cn("h-4 w-4", compact && "h-3 w-3")} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {milestone.isCompleted ? '标记为未完成' : '标记为已完成'}
          </TooltipContent>
        </Tooltip>

        {/* 状态标签 */}
        {!compact && (
          <Badge 
            variant="outline" 
            className={cn("text-xs", statusConfig.bgColor, statusConfig.color)}
          >
            <statusConfig.icon className="h-3 w-3 mr-1" />
            {statusConfig.label}
          </Badge>
        )}

        {/* 时间信息 */}
        <div className={cn("text-xs", statusConfig.color)}>
          {milestone.isCompleted ? (
            milestone.completedDate && (
              <span>
                {format(milestone.completedDate, 'MM/dd HH:mm', { locale: zhCN })}
              </span>
            )
          ) : isOverdue ? (
            <span>逾期 {Math.abs(daysUntilDue)} 天</span>
          ) : isToday ? (
            <span className="font-medium">今天截止</span>
          ) : isTomorrow ? (
            <span>明天截止</span>
          ) : daysUntilDue > 0 ? (
            <span>还有 {daysUntilDue} 天</span>
          ) : (
            <span>{Math.abs(daysUntilDue)} 天前</span>
          )}
        </div>

        {/* 更多操作菜单 */}
        {(onEdit || onDelete) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {/* 快速操作 */}
              <DropdownMenuItem
                onClick={handleToggleComplete}
                disabled={isLoading || !onToggleComplete}
              >
                {milestone.isCompleted ? (
                  <>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    标记为未完成
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    标记为已完成
                  </>
                )}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* 编辑操作 */}
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(milestone)}>
                  <Edit className="h-4 w-4 mr-2" />
                  编辑里程碑
                </DropdownMenuItem>
              )}

              {/* 时间操作 */}
              <DropdownMenuItem
                onClick={() => {
                  // 可以扩展为快速调整时间的功能
                  onEdit?.(milestone);
                }}
              >
                <Calendar className="h-4 w-4 mr-2" />
                调整时间
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* 删除操作 */}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(milestone.id)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  删除里程碑
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </TooltipProvider>
  );
}

// 批量操作组件
interface MilestoneBatchActionsProps {
  milestones: Milestone[];
  selectedMilestones: string[];
  onBatchToggle?: (milestoneIds: string[], isCompleted: boolean) => void;
  onBatchDelete?: (milestoneIds: string[]) => void;
  className?: string;
}

export function MilestoneBatchActions({
  milestones,
  selectedMilestones,
  onBatchToggle,
  onBatchDelete,
  className
}: MilestoneBatchActionsProps) {
  const selectedCount = selectedMilestones.length;
  const selectedMilestoneObjects = milestones.filter(m => selectedMilestones.includes(m.id));
  const allSelectedCompleted = selectedMilestoneObjects.every(m => m.isCompleted);
  const allSelectedIncomplete = selectedMilestoneObjects.every(m => !m.isCompleted);

  if (selectedCount === 0) return null;

  return (
    <div className={cn("flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg", className)}>
      <div className="flex-1">
        <span className="text-sm font-medium">
          已选择 {selectedCount} 个里程碑
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* 批量完成/取消完成 */}
        {onBatchToggle && (
          <>
            {!allSelectedCompleted && (
              <Button
                size="sm"
                onClick={() => onBatchToggle(selectedMilestones, true)}
                className="flex items-center gap-1"
              >
                <CheckCircle2 className="h-3 w-3" />
                全部完成
              </Button>
            )}
            
            {!allSelectedIncomplete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBatchToggle(selectedMilestones, false)}
                className="flex items-center gap-1"
              >
                <RotateCcw className="h-3 w-3" />
                取消完成
              </Button>
            )}
          </>
        )}

        {/* 批量删除 */}
        {onBatchDelete && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onBatchDelete(selectedMilestones)}
            className="flex items-center gap-1 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-3 w-3" />
            批量删除
          </Button>
        )}
      </div>
    </div>
  );
}
