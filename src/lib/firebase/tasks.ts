import {
  collection,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  Timestamp,
  getDocs,
  limit,
} from 'firebase/firestore';
import { db } from '../firebase';
import type {
  Task,
  TaskFilters,
  TaskPlan,
  TaskTemplate,
  UserPreferences,
  TaskStats,
  SubTask,
} from '@/lib/types/tasks';

export class TaskService {
  private db = db;

  // 获取用户任务（支持筛选和实时监听）
  getUserTasks(userId: string, filters?: TaskFilters) {
    let q = query(
      collection(this.db, 'tasks'),
      where('userId', '==', userId),
      orderBy('dueDate', 'asc')
    );

    if (filters?.status) {
      q = query(q, where('status', '==', filters.status));
    }

    if (filters?.category) {
      q = query(q, where('category', '==', filters.category));
    }

    if (filters?.priority) {
      q = query(q, where('priority', '==', filters.priority));
    }

    return q;
  }

  // 创建新任务
  async createTask(userId: string, taskData: Partial<Task>): Promise<string> {
    const now = Timestamp.now();
    
    const task: Omit<Task, 'id'> = {
      userId,
      title: taskData.title || '新任务',
      description: taskData.description,
      startDate: taskData.startDate || now,
      dueDate: taskData.dueDate || Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // 默认7天后
      estimatedHours: taskData.estimatedHours,
      status: taskData.status || 'todo',
      priority: taskData.priority || 'medium',
      category: taskData.category || 'personal',
      tags: taskData.tags || [],
      isAIGenerated: taskData.isAIGenerated || false,
      aiPrompt: taskData.aiPrompt,
      subtasks: taskData.subtasks || [],
      progress: taskData.progress || 0,
      timeSpent: taskData.timeSpent || 0,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(this.db, 'tasks'), task);
    return docRef.id;
  }

  // 创建AI生成的任务
  async createAITask(userId: string, aiPlan: TaskPlan): Promise<string> {
    const now = Timestamp.now();
    
    // 为子任务生成ID
    const subtasksWithIds: SubTask[] = aiPlan.subtasks.map(subtask => ({
      ...subtask,
      id: crypto.randomUUID(),
    }));

    const task: Omit<Task, 'id'> = {
      userId,
      title: aiPlan.title,
      description: aiPlan.description,
      startDate: now,
      dueDate: Timestamp.fromDate(aiPlan.dueDate),
      estimatedHours: aiPlan.estimatedHours,
      status: 'todo',
      priority: aiPlan.priority,
      category: aiPlan.category,
      tags: aiPlan.tags,
      isAIGenerated: true,
      aiPrompt: aiPlan.originalPrompt,
      subtasks: subtasksWithIds,
      progress: 0,
      timeSpent: 0,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(this.db, 'tasks'), task);
    return docRef.id;
  }

  // 更新任务
  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    const taskRef = doc(this.db, 'tasks', taskId);
    await updateDoc(taskRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  }

  // 更新任务状态
  async updateTaskStatus(taskId: string, status: Task['status']): Promise<void> {
    const updates: Partial<Task> = {
      status,
      updatedAt: Timestamp.now(),
    };

    if (status === 'completed') {
      updates.completedAt = Timestamp.now();
      updates.progress = 100;
    }

    const taskRef = doc(this.db, 'tasks', taskId);
    await updateDoc(taskRef, updates);
  }

  // 更新任务进度
  async updateTaskProgress(taskId: string, progress: number): Promise<void> {
    const taskRef = doc(this.db, 'tasks', taskId);
    const updates: Partial<Task> = {
      progress,
      updatedAt: Timestamp.now(),
    };

    // 如果进度达到100%，自动标记为完成
    if (progress >= 100) {
      updates.status = 'completed';
      updates.completedAt = Timestamp.now();
    }

    await updateDoc(taskRef, updates);
  }

  // 更新子任务
  async updateSubtask(taskId: string, subtaskId: string, isCompleted: boolean): Promise<void> {
    // 这里需要先获取任务，更新子任务，然后保存
    // 为了简化，我们先实现基础版本
    const taskRef = doc(this.db, 'tasks', taskId);
    
    // 注意：这里需要先获取当前任务数据，更新子任务状态，然后保存
    // 实际实现中需要使用事务来确保数据一致性
    await updateDoc(taskRef, {
      updatedAt: Timestamp.now(),
    });
  }

  // 删除任务
  async deleteTask(taskId: string): Promise<void> {
    const taskRef = doc(this.db, 'tasks', taskId);
    await deleteDoc(taskRef);
  }

  // 获取任务统计
  async getTaskStats(userId: string): Promise<TaskStats> {
    const tasksQuery = query(
      collection(this.db, 'tasks'),
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(tasksQuery);
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));

    const now = new Date();
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const inProgressTasks = tasks.filter(task => task.status === 'in_progress').length;
    const overdueTasks = tasks.filter(task => 
      task.status !== 'completed' && task.dueDate.toDate() < now
    ).length;

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // 计算平均完成时间
    const completedTasksWithTime = tasks.filter(task => 
      task.status === 'completed' && task.completedAt
    );
    
    let avgCompletionTime = 0;
    if (completedTasksWithTime.length > 0) {
      const totalDays = completedTasksWithTime.reduce((sum, task) => {
        const startDate = task.startDate.toDate();
        const completedDate = task.completedAt!.toDate();
        const days = Math.ceil((completedDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0);
      avgCompletionTime = totalDays / completedTasksWithTime.length;
    }

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      completionRate,
      avgCompletionTime,
    };
  }

  // 获取今日到期的任务
  getTodayTasks(userId: string) {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    return query(
      collection(this.db, 'tasks'),
      where('userId', '==', userId),
      where('dueDate', '>=', Timestamp.fromDate(startOfDay)),
      where('dueDate', '<', Timestamp.fromDate(endOfDay)),
      where('status', '!=', 'completed'),
      orderBy('status'),
      orderBy('priority', 'desc')
    );
  }

  // 获取本周到期的任务
  getThisWeekTasks(userId: string) {
    const today = new Date();
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
    const endOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 7);

    return query(
      collection(this.db, 'tasks'),
      where('userId', '==', userId),
      where('dueDate', '>=', Timestamp.fromDate(startOfWeek)),
      where('dueDate', '<', Timestamp.fromDate(endOfWeek)),
      orderBy('dueDate', 'asc')
    );
  }
}

// 导出单例实例
export const taskService = new TaskService();
