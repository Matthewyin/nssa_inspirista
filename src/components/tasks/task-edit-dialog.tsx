'use client';

import { useState } from 'react';
import { useTasks } from '@/hooks/use-tasks';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TaskEditForm } from './task-edit-form';
import type { Task } from '@/lib/types/tasks';

interface TaskEditDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskEditDialog({ task, open, onOpenChange }: TaskEditDialogProps) {
  const { updateTask } = useTasks();
  const [loading, setLoading] = useState(false);

  // 处理保存
  const handleSave = async (taskData: Partial<Task>) => {
    if (!task) return;

    setLoading(true);
    try {
      await updateTask(task.id, taskData);
      onOpenChange(false);
    } catch (error) {
      console.error('更新任务失败:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 处理取消
  const handleCancel = () => {
    onOpenChange(false);
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>编辑任务</DialogTitle>
        </DialogHeader>

        <TaskEditForm
          task={task}
          onSave={handleSave}
          onCancel={handleCancel}
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  );
}
