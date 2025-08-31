'use client';

import { useState, useEffect } from 'react';
import { onSnapshot, Unsubscribe } from 'firebase/firestore';
import { useAuth } from './use-auth';
import { taskService } from '@/lib/firebase/tasks';
import { aiTaskGenerator } from '@/lib/ai/task-generator';
import { useToast } from './use-toast';
import type {
  Task,
  TaskFilters,
  TaskStats,
  TaskPlan,
  TaskOptimization,
  TaskCreateInput,
  Milestone
} from '@/lib/types/tasks';

export function useTasks(filters?: TaskFilters) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const query = taskService.getUserTasks(user.uid, filters);
    
    const unsubscribe: Unsubscribe = onSnapshot(
      query,
      (snapshot) => {
        const tasksData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Task));
        
        setTasks(tasksData);
        setLoading(false);
      },
      (err) => {
        console.error('获取任务失败:', err);
        setError('获取任务失败');
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user, filters]);

  // 创建任务
  const createTask = async (taskData: TaskCreateInput) => {
    if (!user) return;

    try {
      const taskId = await taskService.createTask(user.uid, taskData);
      toast({
        title: '任务创建成功',
        description: `任务"${taskData.title}"已创建`,
      });
      return taskId;
    } catch (error) {
      console.error('创建任务失败:', error);
      toast({
        variant: 'destructive',
        title: '创建失败',
        description: '任务创建失败，请稍后重试',
      });
      throw error;
    }
  };

  // 更新任务
  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      await taskService.updateTask(taskId, updates);
      toast({
        title: '任务更新成功',
        description: '任务信息已更新',
      });
    } catch (error) {
      console.error('更新任务失败:', error);
      toast({
        variant: 'destructive',
        title: '更新失败',
        description: '任务更新失败，请稍后重试',
      });
      throw error;
    }
  };

  // 更新任务状态
  const updateTaskStatus = async (taskId: string, status: Task['status']) => {
    try {
      await taskService.updateTaskStatus(taskId, status);
      
      const statusText = {
        'todo': '待办',
        'in_progress': '进行中',
        'completed': '已完成',
        'cancelled': '已取消'
      }[status];

      toast({
        title: '状态更新成功',
        description: `任务状态已更新为"${statusText}"`,
      });
    } catch (error) {
      console.error('更新任务状态失败:', error);
      toast({
        variant: 'destructive',
        title: '更新失败',
        description: '任务状态更新失败，请稍后重试',
      });
      throw error;
    }
  };

  // 更新任务进度
  const updateTaskProgress = async (taskId: string, progress: number) => {
    try {
      await taskService.updateTaskProgress(taskId, progress);
      toast({
        title: '进度更新成功',
        description: `任务进度已更新为${progress}%`,
      });
    } catch (error) {
      console.error('更新任务进度失败:', error);
      toast({
        variant: 'destructive',
        title: '更新失败',
        description: '任务进度更新失败，请稍后重试',
      });
      throw error;
    }
  };

  // 删除任务
  const deleteTask = async (taskId: string) => {
    try {
      await taskService.deleteTask(taskId);
      toast({
        title: '任务删除成功',
        description: '任务已删除',
      });
    } catch (error) {
      console.error('删除任务失败:', error);
      toast({
        variant: 'destructive',
        title: '删除失败',
        description: '任务删除失败，请稍后重试',
      });
      throw error;
    }
  };

  // 更新里程碑状态
  const updateMilestoneStatus = async (taskId: string, milestoneId: string, isCompleted: boolean) => {
    if (!user) return;

    try {
      await taskService.updateMilestoneStatus(taskId, milestoneId, isCompleted);
      toast({
        title: '里程碑状态更新成功',
        description: isCompleted ? '里程碑已完成' : '里程碑已重置',
      });
    } catch (error) {
      console.error('更新里程碑状态失败:', error);
      toast({
        variant: 'destructive',
        title: '更新失败',
        description: '里程碑状态更新失败，请稍后重试',
      });
      throw error;
    }
  };

  // 添加里程碑
  const addMilestone = async (taskId: string, milestone: Omit<Milestone, 'id' | 'isCompleted'>) => {
    if (!user) return;

    try {
      await taskService.addMilestone(taskId, milestone);
      toast({
        title: '里程碑添加成功',
        description: `里程碑"${milestone.title}"已添加`,
      });
    } catch (error) {
      console.error('添加里程碑失败:', error);
      toast({
        variant: 'destructive',
        title: '添加失败',
        description: '里程碑添加失败，请稍后重试',
      });
      throw error;
    }
  };

  // 更新里程碑
  const updateMilestone = async (taskId: string, milestoneId: string, updates: Partial<Milestone>) => {
    if (!user) return;

    try {
      await taskService.updateMilestone(taskId, milestoneId, updates);
      toast({
        title: '里程碑更新成功',
        description: '里程碑信息已更新',
      });
    } catch (error) {
      console.error('更新里程碑失败:', error);
      toast({
        variant: 'destructive',
        title: '更新失败',
        description: '里程碑更新失败，请稍后重试',
      });
      throw error;
    }
  };

  // 删除里程碑
  const deleteMilestone = async (taskId: string, milestoneId: string) => {
    if (!user) return;

    try {
      await taskService.deleteMilestone(taskId, milestoneId);
      toast({
        title: '里程碑删除成功',
        description: '里程碑已删除',
      });
    } catch (error) {
      console.error('删除里程碑失败:', error);
      toast({
        variant: 'destructive',
        title: '删除失败',
        description: '里程碑删除失败，请稍后重试',
      });
      throw error;
    }
  };

  // 批量更新里程碑状态
  const batchUpdateMilestoneStatus = async (taskId: string, milestoneIds: string[], isCompleted: boolean) => {
    if (!user) return;

    try {
      await taskService.batchUpdateMilestoneStatus(taskId, milestoneIds, isCompleted);
      toast({
        title: '批量操作成功',
        description: `已${isCompleted ? '完成' : '重置'} ${milestoneIds.length} 个里程碑`,
      });
    } catch (error) {
      console.error('批量更新里程碑状态失败:', error);
      toast({
        variant: 'destructive',
        title: '批量操作失败',
        description: '批量更新失败，请稍后重试',
      });
      throw error;
    }
  };

  // 批量删除里程碑
  const batchDeleteMilestones = async (taskId: string, milestoneIds: string[]) => {
    if (!user) return;

    try {
      await taskService.batchDeleteMilestones(taskId, milestoneIds);
      toast({
        title: '批量删除成功',
        description: `已删除 ${milestoneIds.length} 个里程碑`,
      });
    } catch (error) {
      console.error('批量删除里程碑失败:', error);
      toast({
        variant: 'destructive',
        title: '批量删除失败',
        description: '批量删除失败，请稍后重试',
      });
      throw error;
    }
  };

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    updateTaskStatus,
    updateTaskProgress,
    deleteTask,
    updateMilestoneStatus,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    batchUpdateMilestoneStatus,
    batchDeleteMilestones,
  };
}

// 任务统计Hook
export function useTaskStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setStats(null);
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        const taskStats = await taskService.getTaskStats(user.uid);
        setStats(taskStats);
      } catch (error) {
        console.error('获取任务统计失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  return { stats, loading };
}

// 今日任务Hook
export function useTodayTasks() {
  const { user } = useAuth();
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTodayTasks([]);
      setLoading(false);
      return;
    }

    const query = taskService.getTodayTasks(user.uid);
    
    const unsubscribe = onSnapshot(
      query,
      (snapshot) => {
        const tasksData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Task));
        
        setTodayTasks(tasksData);
        setLoading(false);
      },
      (error) => {
        console.error('获取今日任务失败:', error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  return { todayTasks, loading };
}

// AI任务生成Hook
export function useAITaskGenerator() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateTaskPlan = async (prompt: string): Promise<TaskPlan | null> => {
    if (!user) return null;

    setIsGenerating(true);
    try {
      const plan = await aiTaskGenerator.generateTaskPlan(prompt);
      toast({
        title: 'AI任务计划生成成功',
        description: '请查看并确认任务计划',
      });
      return plan;
    } catch (error) {
      console.error('AI任务生成失败:', error);
      toast({
        variant: 'destructive',
        title: 'AI生成失败',
        description: error instanceof Error ? error.message : 'AI任务生成失败，请稍后重试',
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const createAITask = async (plan: TaskPlan): Promise<string | null> => {
    if (!user) return null;

    try {
      const taskId = await taskService.createAITask(user.uid, plan);
      toast({
        title: 'AI任务创建成功',
        description: `任务"${plan.title}"已创建`,
      });
      return taskId;
    } catch (error) {
      console.error('创建AI任务失败:', error);
      toast({
        variant: 'destructive',
        title: '创建失败',
        description: 'AI任务创建失败，请稍后重试',
      });
      return null;
    }
  };

  const optimizeTask = async (task: Task): Promise<TaskOptimization | null> => {
    setIsGenerating(true);
    try {
      const optimization = await aiTaskGenerator.optimizeTask(task);
      toast({
        title: '任务优化建议生成成功',
        description: '请查看优化建议',
      });
      return optimization;
    } catch (error) {
      console.error('任务优化失败:', error);
      toast({
        variant: 'destructive',
        title: '优化失败',
        description: error instanceof Error ? error.message : '任务优化失败，请稍后重试',
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    generateTaskPlan,
    createAITask,
    optimizeTask,
  };
}
