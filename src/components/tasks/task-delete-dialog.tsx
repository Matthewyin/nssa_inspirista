'use client';

import { useState } from 'react';
import { useTasks } from '@/hooks/use-tasks';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Sparkles, Target } from 'lucide-react';
import type { Task } from '@/lib/types/tasks';

interface TaskDeleteDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDeleteDialog({ task, open, onOpenChange }: TaskDeleteDialogProps) {
  const { deleteTask } = useTasks();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!task) return;

    setLoading(true);
    try {
      await deleteTask(task.id);
      onOpenChange(false);
    } catch (error) {
      console.error('删除任务失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!task) return null;

  const hasMilestones = task.milestones && task.milestones.length > 0;
  const hasProgress = task.progress > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            确认删除任务
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>您确定要删除以下任务吗？此操作无法撤销。</p>
              
              {/* 任务信息 */}
              <div className="p-3 bg-muted rounded-lg">
                <div className="space-y-2">
                  <h4 className="font-medium">{task.title}</h4>
                  
                  {task.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {task.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* AI生成标识 */}
                    {task.isAIGenerated && (
                      <Badge variant="outline" className="text-xs border-purple-200 text-purple-600">
                        <Sparkles className="h-3 w-3 mr-1" />
                        AI生成
                      </Badge>
                    )}
                    
                    {/* 里程碑信息 */}
                    {hasMilestones && (
                      <Badge variant="secondary" className="text-xs">
                        <Target className="h-3 w-3 mr-1" />
                        {task.milestones.length}个里程碑
                      </Badge>
                    )}
                    
                    {/* 进度信息 */}
                    {hasProgress && (
                      <Badge variant="secondary" className="text-xs">
                        进度 {task.progress}%
                      </Badge>
                    )}
                    
                    {/* 标签 */}
                    {task.tags && task.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {task.tags && task.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{task.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* 警告信息 */}
              {(hasMilestones || hasProgress || task.isAIGenerated) && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-destructive mb-1">注意：</p>
                      <ul className="text-muted-foreground space-y-1">
                        {task.isAIGenerated && (
                          <li>• 这是一个AI生成的任务，包含智能规划的内容</li>
                        )}
                        {hasMilestones && (
                          <li>• 任务包含 {task.milestones.length} 个里程碑，删除后将一并移除</li>
                        )}
                        {hasProgress && (
                          <li>• 任务已有 {task.progress}% 的进度，删除后将丢失所有进度记录</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            取消
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? '删除中...' : '确认删除'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// 批量删除对话框
interface TaskBatchDeleteDialogProps {
  taskIds: string[];
  tasks: Task[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function TaskBatchDeleteDialog({ 
  taskIds, 
  tasks, 
  open, 
  onOpenChange, 
  onSuccess 
}: TaskBatchDeleteDialogProps) {
  const { deleteTasks } = useTasks();
  const [loading, setLoading] = useState(false);

  const selectedTasks = tasks.filter(task => taskIds.includes(task.id));
  const totalMilestones = selectedTasks.reduce((sum, task) => 
    sum + (task.milestones?.length || 0), 0
  );
  const aiGeneratedCount = selectedTasks.filter(task => task.isAIGenerated).length;

  const handleBatchDelete = async () => {
    if (taskIds.length === 0) return;

    setLoading(true);
    try {
      await deleteTasks(taskIds);
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('批量删除任务失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            批量删除任务
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>您确定要删除选中的 <strong>{taskIds.length}</strong> 个任务吗？此操作无法撤销。</p>
              
              {/* 统计信息 */}
              <div className="p-3 bg-muted rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">选中任务：</span>
                    <span className="font-medium ml-1">{taskIds.length} 个</span>
                  </div>
                  {totalMilestones > 0 && (
                    <div>
                      <span className="text-muted-foreground">包含里程碑：</span>
                      <span className="font-medium ml-1">{totalMilestones} 个</span>
                    </div>
                  )}
                  {aiGeneratedCount > 0 && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">AI生成任务：</span>
                      <span className="font-medium ml-1">{aiGeneratedCount} 个</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 警告信息 */}
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-destructive mb-1">警告：</p>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• 所有选中的任务及其相关数据将被永久删除</li>
                      {totalMilestones > 0 && (
                        <li>• 将同时删除 {totalMilestones} 个里程碑</li>
                      )}
                      {aiGeneratedCount > 0 && (
                        <li>• 包含 {aiGeneratedCount} 个AI生成的智能任务</li>
                      )}
                      <li>• 此操作无法撤销，请谨慎操作</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            取消
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleBatchDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? '删除中...' : `删除 ${taskIds.length} 个任务`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
