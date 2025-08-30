'use client';

import { useState } from 'react';
import { useTasks } from '@/hooks/use-tasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Plus,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Circle,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TaskCard } from './task-card';
import type { Task, TaskStatus } from '@/lib/types/tasks';

interface TaskBoardProps {
  tasks: Task[];
}

export function TaskBoard({ tasks }: TaskBoardProps) {
  const { updateTaskStatus } = useTasks();

  // 定义看板列
  const columns = [
    {
      id: 'todo' as TaskStatus,
      title: '待办',
      color: 'border-gray-200 bg-gray-50',
      headerColor: 'text-gray-700',
      count: tasks.filter(task => task.status === 'todo').length
    },
    {
      id: 'in_progress' as TaskStatus,
      title: '进行中',
      color: 'border-blue-200 bg-blue-50',
      headerColor: 'text-blue-700',
      count: tasks.filter(task => task.status === 'in_progress').length
    },
    {
      id: 'completed' as TaskStatus,
      title: '已完成',
      color: 'border-green-200 bg-green-50',
      headerColor: 'text-green-700',
      count: tasks.filter(task => task.status === 'completed').length
    }
  ];

  // 按状态分组任务
  const tasksByStatus = tasks.reduce((acc, task) => {
    if (!acc[task.status]) {
      acc[task.status] = [];
    }
    acc[task.status].push(task);
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  // 处理任务状态变更
  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
    } catch (error) {
      console.error('更新任务状态失败:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map((column) => (
        <div key={column.id} className="space-y-4">
          {/* 列标题 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className={cn("font-semibold", column.headerColor)}>
                {column.title}
              </h3>
              <Badge variant="outline" className="text-xs">
                {column.count}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => {
                // TODO: 实现快速添加任务到指定列
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* 任务列表 */}
          <div className={cn(
            "min-h-[400px] p-4 rounded-lg border-2 border-dashed transition-colors",
            column.color
          )}>
            <div className="space-y-3">
              {tasksByStatus[column.id]?.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={handleStatusChange}
                />
              )) || []}
              
              {/* 空状态 */}
              {(!tasksByStatus[column.id] || tasksByStatus[column.id].length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="mb-2">暂无{column.title}任务</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      // TODO: 实现快速添加任务
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    添加任务
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
