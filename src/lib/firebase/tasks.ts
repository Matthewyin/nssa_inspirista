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
  getDoc,
  limit,
} from 'firebase/firestore';
import { db } from '../firebase';
import { safeGetTaskDueDate, safeToDate } from '../utils/date-utils';
import type {
  Task,
  TaskFilters,
  TaskPlan,
  TaskTemplate,
  UserPreferences,
  TaskStats,
  SubTask,
  Milestone,
  TaskCreateInput,
} from '@/lib/types/tasks';

export class TaskService {
  private db = db;

  // 转换Firebase数据中的日期字段
  private convertTaskDates(taskData: any): Task {
    const task = { ...taskData } as Task;

    // 转换里程碑中的日期
    if (task.milestones && Array.isArray(task.milestones)) {
      task.milestones = task.milestones.map(milestone => ({
        ...milestone,
        targetDate: milestone.targetDate instanceof Date
          ? milestone.targetDate
          : new Date(milestone.targetDate),
        completedDate: milestone.completedDate
          ? (milestone.completedDate instanceof Date
              ? milestone.completedDate
              : new Date(milestone.completedDate))
          : undefined
      }));
    }

    return task;
  }

  // 获取单个任务
  async getTask(taskId: string): Promise<Task | null> {
    try {
      const taskRef = doc(this.db, 'tasks', taskId);
      const taskSnap = await getDoc(taskRef);

      if (taskSnap.exists()) {
        const taskData = taskSnap.data();
        return this.convertTaskDates({ id: taskSnap.id, ...taskData });
      }

      return null;
    } catch (error) {
      console.error('获取任务失败:', error);
      throw error;
    }
  }

  // 计算基于里程碑的进度
  private calculateMilestoneProgress(milestones: Milestone[]): number {
    if (milestones.length === 0) return 0;

    const completedCount = milestones.filter(m => m.isCompleted).length;
    return Math.round((completedCount / milestones.length) * 100);
  }

  // 获取用户任务（支持筛选和实时监听）
  getUserTasks(userId: string, filters?: TaskFilters) {
    // 基础查询：只按userId筛选，按创建时间排序（避免复杂索引）
    let q = query(
      collection(this.db, 'tasks'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    // 如果有筛选条件，使用单个筛选条件避免复合索引
    // 优先级：status > priority > category
    if (filters?.status) {
      q = query(
        collection(this.db, 'tasks'),
        where('userId', '==', userId),
        where('status', '==', filters.status),
        orderBy('createdAt', 'desc')
      );
    } else if (filters?.priority) {
      q = query(
        collection(this.db, 'tasks'),
        where('userId', '==', userId),
        where('priority', '==', filters.priority),
        orderBy('createdAt', 'desc')
      );
    } else if (filters?.category) {
      q = query(
        collection(this.db, 'tasks'),
        where('userId', '==', userId),
        where('category', '==', filters.category),
        orderBy('createdAt', 'desc')
      );
    }

    return q;
  }

  // 创建新任务（支持新的里程碑结构）
  async createTask(userId: string, taskData: TaskCreateInput): Promise<string> {
    const now = Timestamp.now();

    // 为里程碑生成ID并安全转换日期为Timestamp
    const milestonesWithIds: Milestone[] = (taskData.milestones || []).map(milestone => {
      let targetDate: Date;

      try {
        if (milestone.targetDate instanceof Date) {
          targetDate = isNaN(milestone.targetDate.getTime()) ? new Date() : milestone.targetDate;
        } else if (milestone.targetDate && typeof milestone.targetDate.toDate === 'function') {
          // 如果已经是Timestamp，转换为Date
          targetDate = milestone.targetDate.toDate();
        } else {
          const convertedDate = new Date(milestone.targetDate);
          targetDate = isNaN(convertedDate.getTime()) ? new Date() : convertedDate;
        }
      } catch (error) {
        console.warn('Invalid milestone date, using current date:', error);
        targetDate = new Date();
      }

      // 确保targetDate是有效的Date对象，然后转换为Timestamp存储
      const safeTargetDate = targetDate instanceof Date && !isNaN(targetDate.getTime())
        ? targetDate
        : new Date();

      return {
        ...milestone,
        id: crypto.randomUUID(),
        isCompleted: false,
        targetDate: Timestamp.fromDate(safeTargetDate)
      };
    });

    // 计算基于里程碑的进度
    const progress = this.calculateMilestoneProgress(milestonesWithIds);

    // 构建任务对象，避免undefined值
    const task: Omit<Task, 'id'> = {
      userId,
      title: taskData.title || '新任务',
      description: taskData.description || '',
      status: 'todo',
      tags: taskData.tags || [],
      milestones: milestonesWithIds,
      isAIGenerated: taskData.isAIGenerated || false,
      startDate: now,
      progress,
      createdAt: now,
      updatedAt: now,

      // 兼容性字段（保留以支持现有数据）
      dueDate: (() => {
        try {
          if (milestonesWithIds.length > 0) {
            const finalMilestone = milestonesWithIds[milestonesWithIds.length - 1];
            // finalMilestone.targetDate 已经是 Timestamp，直接返回
            return finalMilestone.targetDate;
          } else {
            return Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
          }
        } catch (error) {
          console.warn('Error creating dueDate timestamp in createTask, using fallback:', error);
          return Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
        }
      })(),
      priority: 'medium',
      category: 'personal',
      estimatedHours: 0,
      subtasks: [],
      timeSpent: 0,
    };

    // 只在有值时添加可选字段，避免undefined
    if (taskData.aiPrompt) {
      (task as any).aiPrompt = taskData.aiPrompt;
    }

    const docRef = await addDoc(collection(this.db, 'tasks'), task);
    return docRef.id;
  }

  // 创建AI生成的任务（支持新的里程碑结构）
  async createAITask(userId: string, aiPlan: TaskPlan): Promise<string> {
    const now = Timestamp.now();

    // 为里程碑生成ID并安全转换日期为Timestamp
    const milestonesWithIds: Milestone[] = aiPlan.milestones.map(milestone => {
      let targetDate: Date;

      try {
        if (milestone.targetDate instanceof Date) {
          targetDate = isNaN(milestone.targetDate.getTime()) ? new Date() : milestone.targetDate;
        } else if (milestone.targetDate && typeof milestone.targetDate.toDate === 'function') {
          // 如果已经是Timestamp，转换为Date
          targetDate = milestone.targetDate.toDate();
        } else {
          const convertedDate = new Date(milestone.targetDate);
          targetDate = isNaN(convertedDate.getTime()) ? new Date() : convertedDate;
        }
      } catch (error) {
        console.warn('Invalid AI milestone date, using current date:', error);
        targetDate = new Date();
      }

      // 确保targetDate是有效的Date对象，然后转换为Timestamp存储
      const safeTargetDate = targetDate instanceof Date && !isNaN(targetDate.getTime())
        ? targetDate
        : new Date();

      return {
        ...milestone,
        id: crypto.randomUUID(),
        isCompleted: false,
        targetDate: Timestamp.fromDate(safeTargetDate)
      };
    });

    // 计算基于里程碑的进度
    const progress = this.calculateMilestoneProgress(milestonesWithIds);

    // 构建AI任务对象，避免undefined值
    const task: Omit<Task, 'id'> = {
      userId,
      title: aiPlan.title,
      description: aiPlan.description,
      status: 'todo',
      tags: aiPlan.tags,
      milestones: milestonesWithIds,
      isAIGenerated: true,
      startDate: now,
      progress,
      createdAt: now,
      updatedAt: now,

      // 兼容性字段（保留以支持现有数据和迁移）
      dueDate: (() => {
        try {
          if (milestonesWithIds.length > 0) {
            const finalMilestone = milestonesWithIds[milestonesWithIds.length - 1];
            // finalMilestone.targetDate 已经是 Timestamp，直接返回
            return finalMilestone.targetDate;
          } else {
            const fallbackDate = new Date(Date.now() + aiPlan.timeframeDays * 24 * 60 * 60 * 1000);
            return Timestamp.fromDate(fallbackDate);
          }
        } catch (error) {
          console.warn('Error creating dueDate timestamp, using fallback:', error);
          return Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // 默认7天后
        }
      })(),
      priority: 'medium',
      category: 'personal',
      estimatedHours: Math.ceil(aiPlan.timeframeDays * 2), // 估算每天2小时
      subtasks: [], // 新版本使用里程碑替代子任务
      timeSpent: 0,
    };

    // 只在有值时添加可选字段，避免undefined
    if (aiPlan.originalPrompt) {
      (task as any).aiPrompt = aiPlan.originalPrompt;
    }

    const docRef = await addDoc(collection(this.db, 'tasks'), task);
    return docRef.id;
  }

  // 更新里程碑状态
  async updateMilestoneStatus(taskId: string, milestoneId: string, isCompleted: boolean): Promise<void> {
    const taskRef = doc(this.db, 'tasks', taskId);

    // 获取当前任务数据
    const taskDoc = await getDocs(query(collection(this.db, 'tasks'), where('__name__', '==', taskId), limit(1)));
    if (taskDoc.empty) {
      throw new Error('任务不存在');
    }

    const taskData = taskDoc.docs[0].data() as Task;
    const updatedMilestones = taskData.milestones.map(milestone => {
      if (milestone.id === milestoneId) {
        return {
          ...milestone,
          isCompleted,
          completedDate: isCompleted ? new Date() : undefined
        };
      }
      return milestone;
    });

    // 重新计算进度
    const newProgress = this.calculateMilestoneProgress(updatedMilestones);

    // 检查是否所有里程碑都完成
    const allCompleted = updatedMilestones.every(m => m.isCompleted);
    const newStatus = allCompleted ? 'completed' : (updatedMilestones.some(m => m.isCompleted) ? 'in_progress' : 'todo');

    await updateDoc(taskRef, {
      milestones: updatedMilestones,
      progress: newProgress,
      status: newStatus,
      updatedAt: Timestamp.now(),
      ...(allCompleted && { completedAt: Timestamp.now() })
    });
  }

  // 添加新里程碑
  async addMilestone(taskId: string, milestone: Omit<Milestone, 'id' | 'isCompleted'>): Promise<void> {
    const taskRef = doc(this.db, 'tasks', taskId);

    const taskDoc = await getDocs(query(collection(this.db, 'tasks'), where('__name__', '==', taskId), limit(1)));
    if (taskDoc.empty) {
      throw new Error('任务不存在');
    }

    const taskData = taskDoc.docs[0].data() as Task;
    // 安全转换日期为Timestamp
    let targetDate: Date;
    try {
      if (milestone.targetDate instanceof Date) {
        targetDate = isNaN(milestone.targetDate.getTime()) ? new Date() : milestone.targetDate;
      } else if (milestone.targetDate && typeof milestone.targetDate.toDate === 'function') {
        targetDate = milestone.targetDate.toDate();
      } else {
        const convertedDate = new Date(milestone.targetDate);
        targetDate = isNaN(convertedDate.getTime()) ? new Date() : convertedDate;
      }
    } catch (error) {
      console.warn('Invalid milestone date in addMilestone, using current date:', error);
      targetDate = new Date();
    }

    const newMilestone: Milestone = {
      ...milestone,
      id: crypto.randomUUID(),
      isCompleted: false,
      targetDate: Timestamp.fromDate(targetDate)
    };

    const updatedMilestones = [...taskData.milestones, newMilestone];
    const newProgress = this.calculateMilestoneProgress(updatedMilestones);

    await updateDoc(taskRef, {
      milestones: updatedMilestones,
      progress: newProgress,
      updatedAt: Timestamp.now()
    });
  }

  // 更新里程碑信息
  async updateMilestone(taskId: string, milestoneId: string, updates: Partial<Omit<Milestone, 'id'>>): Promise<void> {
    const taskRef = doc(this.db, 'tasks', taskId);

    const taskDoc = await getDocs(query(collection(this.db, 'tasks'), where('__name__', '==', taskId), limit(1)));
    if (taskDoc.empty) {
      throw new Error('任务不存在');
    }

    const taskData = taskDoc.docs[0].data() as Task;
    const updatedMilestones = taskData.milestones.map(milestone => {
      if (milestone.id === milestoneId) {
        return {
          ...milestone,
          ...updates,
          targetDate: updates.targetDate
            ? (updates.targetDate instanceof Date ? updates.targetDate : new Date(updates.targetDate))
            : milestone.targetDate
        };
      }
      return milestone;
    });

    const newProgress = this.calculateMilestoneProgress(updatedMilestones);

    await updateDoc(taskRef, {
      milestones: updatedMilestones,
      progress: newProgress,
      updatedAt: Timestamp.now()
    });
  }

  // 删除里程碑
  async deleteMilestone(taskId: string, milestoneId: string): Promise<void> {
    const taskRef = doc(this.db, 'tasks', taskId);

    const taskDoc = await getDocs(query(collection(this.db, 'tasks'), where('__name__', '==', taskId), limit(1)));
    if (taskDoc.empty) {
      throw new Error('任务不存在');
    }

    const taskData = taskDoc.docs[0].data() as Task;
    const updatedMilestones = taskData.milestones.filter(milestone => milestone.id !== milestoneId);
    const newProgress = this.calculateMilestoneProgress(updatedMilestones);

    // 如果删除里程碑后没有里程碑了，重置任务状态
    const newStatus = updatedMilestones.length === 0 ? 'todo' :
      (updatedMilestones.every(m => m.isCompleted) ? 'completed' :
       (updatedMilestones.some(m => m.isCompleted) ? 'in_progress' : 'todo'));

    await updateDoc(taskRef, {
      milestones: updatedMilestones,
      progress: newProgress,
      status: newStatus,
      updatedAt: Timestamp.now()
    });
  }

  // 更新任务（支持里程碑状态自动更新）
  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    const taskRef = doc(this.db, 'tasks', taskId);

    // 如果更新包含里程碑，需要处理里程碑的日期转换和进度计算
    if (updates.milestones) {
      // 处理里程碑日期转换，确保所有日期都是 Timestamp 格式
      const processedMilestones = updates.milestones.map(milestone => {
        let targetDate: any = milestone.targetDate;

        // 如果 targetDate 是 Date 对象，转换为 Timestamp
        if (targetDate instanceof Date) {
          targetDate = Timestamp.fromDate(targetDate);
        }
        // 如果 targetDate 是字符串或其他格式，尝试转换
        else if (targetDate && typeof targetDate === 'string') {
          try {
            targetDate = Timestamp.fromDate(new Date(targetDate));
          } catch (error) {
            console.warn('Invalid date format, using current date:', targetDate);
            targetDate = Timestamp.now();
          }
        }
        // 如果已经是 Timestamp，保持不变
        else if (!targetDate || typeof targetDate.toDate !== 'function') {
          targetDate = Timestamp.now();
        }

        return {
          ...milestone,
          id: milestone.id || crypto.randomUUID(),
          isCompleted: milestone.isCompleted || false,
          targetDate,
          completedDate: milestone.completedDate ?
            (milestone.completedDate instanceof Date ?
              milestone.completedDate :
              new Date(milestone.completedDate)) :
            undefined
        };
      });

      updates.milestones = processedMilestones;

      // 重新计算进度和状态
      const newProgress = this.calculateMilestoneProgress(processedMilestones);
      const allCompleted = processedMilestones.every(m => m.isCompleted);
      const anyCompleted = processedMilestones.some(m => m.isCompleted);

      updates.progress = newProgress;

      // 自动更新任务状态
      if (allCompleted && processedMilestones.length > 0) {
        updates.status = 'completed';
        updates.completedAt = Timestamp.now();
      } else if (anyCompleted) {
        updates.status = 'in_progress';
      } else {
        updates.status = 'todo';
      }
    }

    // 深度清理数据，移除所有 undefined 和 null 值
    const deepCleanObject = (obj: any): any => {
      if (obj === null || obj === undefined) return undefined;
      if (Array.isArray(obj)) {
        return obj.map(deepCleanObject).filter(item => item !== undefined);
      }
      if (typeof obj === 'object') {
        const cleaned: any = {};
        for (const [key, value] of Object.entries(obj)) {
          const cleanedValue = deepCleanObject(value);
          if (cleanedValue !== undefined) {
            cleaned[key] = cleanedValue;
          }
        }
        return Object.keys(cleaned).length > 0 ? cleaned : undefined;
      }
      return obj;
    };

    const cleanUpdates = deepCleanObject(updates);

    console.log('🔍 Firestore updateTask 调试信息:');
    console.log('📥 原始数据:', JSON.stringify(updates, null, 2));
    console.log('🧹 清理后数据:', JSON.stringify(cleanUpdates, null, 2));

    // 检查是否还有 undefined 值
    const hasUndefined = JSON.stringify(cleanUpdates).includes('undefined');
    console.log('⚠️ 是否包含 undefined:', hasUndefined);

    if (hasUndefined) {
      console.error('❌ 发现 undefined 值，停止更新');
      throw new Error('数据包含 undefined 值，无法更新到 Firestore');
    }

    await updateDoc(taskRef, {
      ...cleanUpdates,
      updatedAt: Timestamp.now(),
    });
  }

  // 更新任务状态（支持里程碑状态同步）
  async updateTaskStatus(taskId: string, status: Task['status']): Promise<void> {
    const taskRef = doc(this.db, 'tasks', taskId);

    // 直接获取任务文档，避免复杂查询
    const taskDoc = await getDoc(taskRef);
    if (!taskDoc.exists()) {
      throw new Error('任务不存在');
    }

    const taskData = taskDoc.data() as Task;
    const updates: Partial<Task> = {
      status,
      updatedAt: Timestamp.now(),
    };

    // 如果任务标记为完成，同时完成所有里程碑
    if (status === 'completed' && taskData.milestones) {
      const updatedMilestones = taskData.milestones.map(milestone => ({
        ...milestone,
        isCompleted: true,
        completedDate: milestone.completedDate || new Date()
      }));

      updates.milestones = updatedMilestones;
      updates.completedAt = Timestamp.now();
      updates.progress = 100;
    }

    // 如果任务重置为待办，重置所有里程碑
    else if (status === 'todo' && taskData.milestones) {
      const updatedMilestones = taskData.milestones.map(milestone => ({
        ...milestone,
        isCompleted: false,
        completedDate: undefined
      }));

      updates.milestones = updatedMilestones;
      updates.progress = 0;
      updates.completedAt = undefined;
    }

    await updateDoc(taskRef, updates);
  }

  // 批量更新里程碑状态
  async batchUpdateMilestones(taskId: string, milestoneUpdates: { id: string; isCompleted: boolean }[]): Promise<void> {
    const taskRef = doc(this.db, 'tasks', taskId);

    const taskDoc = await getDocs(query(collection(this.db, 'tasks'), where('__name__', '==', taskId), limit(1)));
    if (taskDoc.empty) {
      throw new Error('任务不存在');
    }

    const taskData = taskDoc.docs[0].data() as Task;
    const updatedMilestones = taskData.milestones.map(milestone => {
      const update = milestoneUpdates.find(u => u.id === milestone.id);
      if (update) {
        return {
          ...milestone,
          isCompleted: update.isCompleted,
          completedDate: update.isCompleted ? (milestone.completedDate || new Date()) : undefined
        };
      }
      return milestone;
    });

    // 重新计算进度和状态
    const newProgress = this.calculateMilestoneProgress(updatedMilestones);
    const allCompleted = updatedMilestones.every(m => m.isCompleted);
    const anyCompleted = updatedMilestones.some(m => m.isCompleted);

    const newStatus = allCompleted ? 'completed' : (anyCompleted ? 'in_progress' : 'todo');

    await updateDoc(taskRef, {
      milestones: updatedMilestones,
      progress: newProgress,
      status: newStatus,
      updatedAt: Timestamp.now(),
      ...(allCompleted && { completedAt: Timestamp.now() })
    });
  }

  // 获取任务的里程碑列表
  async getTaskMilestones(taskId: string): Promise<Milestone[]> {
    const taskRef = doc(this.db, 'tasks', taskId);
    const taskDoc = await getDoc(taskRef);
    if (!taskDoc.exists()) {
      throw new Error('任务不存在');
    }

    const taskData = taskDoc.data() as Task;
    return taskData.milestones || [];
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
    const overdueTasks = tasks.filter(task => {
      if (task.status === 'completed') return false;

      // 使用安全的日期处理
      const dueDate = safeGetTaskDueDate(task);
      return dueDate && dueDate < now;
    }).length;

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // 计算平均完成时间
    const completedTasksWithTime = tasks.filter(task => 
      task.status === 'completed' && task.completedAt
    );
    
    let avgCompletionTime = 0;
    if (completedTasksWithTime.length > 0) {
      const totalDays = completedTasksWithTime.reduce((sum, task) => {
        const startDate = safeToDate(task.startDate);
        const completedDate = safeToDate(task.completedAt);

        if (!startDate || !completedDate) return sum;

        const days = Math.ceil((completedDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        return sum + Math.max(0, days); // 确保天数不为负
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

  // 获取今日到期的任务（简化查询，避免复杂索引）
  getTodayTasks(userId: string) {
    // 简化查询，只按userId筛选，在客户端进行日期筛选
    return query(
      collection(this.db, 'tasks'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
  }

  // 获取本周到期的任务（简化查询，避免复杂索引）
  getThisWeekTasks(userId: string) {
    // 简化查询，只按userId筛选，在客户端进行日期筛选
    return query(
      collection(this.db, 'tasks'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
  }

  // 批量更新里程碑状态
  async batchUpdateMilestoneStatus(taskId: string, milestoneIds: string[], isCompleted: boolean): Promise<void> {
    const taskRef = doc(this.db, 'tasks', taskId);

    // 获取当前任务数据
    const taskDoc = await getDocs(query(collection(this.db, 'tasks'), where('__name__', '==', taskId), limit(1)));
    if (taskDoc.empty) {
      throw new Error('任务不存在');
    }

    const taskData = taskDoc.docs[0].data() as Task;
    const updatedMilestones = taskData.milestones.map(milestone => {
      if (milestoneIds.includes(milestone.id)) {
        return {
          ...milestone,
          isCompleted,
          completedDate: isCompleted ? new Date() : undefined
        };
      }
      return milestone;
    });

    // 重新计算进度和状态
    const newProgress = this.calculateMilestoneProgress(updatedMilestones);
    const allCompleted = updatedMilestones.every(m => m.isCompleted);
    const anyCompleted = updatedMilestones.some(m => m.isCompleted);

    let newStatus = taskData.status;
    let completedAt = taskData.completedAt;

    if (allCompleted && updatedMilestones.length > 0) {
      newStatus = 'completed';
      completedAt = Timestamp.now();
    } else if (anyCompleted) {
      newStatus = 'in_progress';
    } else {
      newStatus = 'todo';
    }

    await updateDoc(taskRef, {
      milestones: updatedMilestones,
      progress: newProgress,
      status: newStatus,
      completedAt,
      updatedAt: Timestamp.now(),
    });
  }

  // 批量删除里程碑
  async batchDeleteMilestones(taskId: string, milestoneIds: string[]): Promise<void> {
    const taskRef = doc(this.db, 'tasks', taskId);

    // 获取当前任务数据
    const taskDoc = await getDocs(query(collection(this.db, 'tasks'), where('__name__', '==', taskId), limit(1)));
    if (taskDoc.empty) {
      throw new Error('任务不存在');
    }

    const taskData = taskDoc.docs[0].data() as Task;
    const updatedMilestones = taskData.milestones.filter(milestone => !milestoneIds.includes(milestone.id));
    const newProgress = this.calculateMilestoneProgress(updatedMilestones);

    // 重新计算任务状态
    const allCompleted = updatedMilestones.every(m => m.isCompleted);
    const anyCompleted = updatedMilestones.some(m => m.isCompleted);

    let newStatus = taskData.status;
    let completedAt = taskData.completedAt;

    if (updatedMilestones.length === 0) {
      newStatus = 'todo';
      completedAt = undefined;
    } else if (allCompleted) {
      newStatus = 'completed';
      completedAt = Timestamp.now();
    } else if (anyCompleted) {
      newStatus = 'in_progress';
    } else {
      newStatus = 'todo';
    }

    await updateDoc(taskRef, {
      milestones: updatedMilestones,
      progress: newProgress,
      status: newStatus,
      completedAt,
      updatedAt: Timestamp.now(),
    });
  }

  // 重新排序里程碑
  async reorderMilestones(taskId: string, milestones: Milestone[]): Promise<void> {
    const taskRef = doc(this.db, 'tasks', taskId);

    // 重新计算进度（排序不影响进度，但确保数据一致性）
    const newProgress = this.calculateMilestoneProgress(milestones);

    await updateDoc(taskRef, {
      milestones,
      progress: newProgress,
      updatedAt: Timestamp.now(),
    });
  }
}

// 导出单例实例
export const taskService = new TaskService();
