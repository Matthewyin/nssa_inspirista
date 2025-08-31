/**
 * 任务数据迁移工具
 * 用于将现有任务数据结构迁移到新的里程碑支持版本
 */

import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  writeBatch,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Task, Milestone } from '@/lib/types/tasks';

// 旧版本任务接口（用于迁移）
interface LegacyTask {
  id: string;
  userId: string;
  title: string;
  description?: string;
  startDate: Timestamp;
  dueDate: Timestamp;
  estimatedHours?: number;
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'high' | 'medium' | 'low';
  category: 'work' | 'study' | 'personal' | 'health' | 'other';
  tags: string[];
  isAIGenerated: boolean;
  aiPrompt?: string;
  subtasks: any[];
  progress: number;
  timeSpent: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
}

export class TaskMigration {
  
  /**
   * 检查是否需要迁移
   */
  async checkMigrationNeeded(): Promise<boolean> {
    try {
      const tasksRef = collection(db, 'tasks');
      const snapshot = await getDocs(tasksRef);
      
      if (snapshot.empty) {
        return false;
      }

      // 检查第一个任务是否有新的数据结构
      const firstTask = snapshot.docs[0].data();
      return !firstTask.hasOwnProperty('milestones');
    } catch (error) {
      console.error('检查迁移状态失败:', error);
      return false;
    }
  }

  /**
   * 执行数据迁移
   */
  async migrateAllTasks(): Promise<{ success: number; failed: number }> {
    const results = { success: 0, failed: 0 };
    
    try {
      const tasksRef = collection(db, 'tasks');
      const snapshot = await getDocs(tasksRef);
      
      if (snapshot.empty) {
        console.log('没有需要迁移的任务');
        return results;
      }

      console.log(`开始迁移 ${snapshot.docs.length} 个任务...`);

      // 批量处理，每批最多500个文档
      const batchSize = 500;
      const batches: any[][] = [];
      
      for (let i = 0; i < snapshot.docs.length; i += batchSize) {
        batches.push(snapshot.docs.slice(i, i + batchSize));
      }

      for (const batch of batches) {
        const writeBatchRef = writeBatch(db);
        
        for (const docSnapshot of batch) {
          try {
            const legacyTask = { id: docSnapshot.id, ...docSnapshot.data() } as LegacyTask;
            const migratedTask = this.migrateSingleTask(legacyTask);
            
            const taskRef = doc(db, 'tasks', docSnapshot.id);
            writeBatchRef.update(taskRef, migratedTask);
            
            results.success++;
          } catch (error) {
            console.error(`迁移任务 ${docSnapshot.id} 失败:`, error);
            results.failed++;
          }
        }
        
        await writeBatchRef.commit();
        console.log(`批次完成，成功: ${results.success}, 失败: ${results.failed}`);
      }

      console.log(`迁移完成！成功: ${results.success}, 失败: ${results.failed}`);
      return results;
      
    } catch (error) {
      console.error('批量迁移失败:', error);
      throw error;
    }
  }

  /**
   * 迁移单个任务
   */
  private migrateSingleTask(legacyTask: LegacyTask): Partial<Task> {
    // 生成默认里程碑（如果任务没有子任务或者子任务很少）
    const milestones = this.generateDefaultMilestones(legacyTask);
    
    // 计算基于里程碑的进度
    const progress = this.calculateMilestoneProgress(milestones);

    const migratedTask: Partial<Task> = {
      // 保留核心字段
      title: legacyTask.title,
      description: legacyTask.description || legacyTask.title,
      status: legacyTask.status,
      tags: legacyTask.tags || [],
      isAIGenerated: legacyTask.isAIGenerated || false,
      aiPrompt: legacyTask.aiPrompt,
      startDate: legacyTask.startDate,
      progress,
      createdAt: legacyTask.createdAt,
      updatedAt: Timestamp.now(),
      completedAt: legacyTask.completedAt,
      
      // 新增字段
      milestones,
      
      // 兼容性字段（保留原始数据）
      dueDate: legacyTask.dueDate,
      priority: legacyTask.priority,
      category: legacyTask.category,
      estimatedHours: legacyTask.estimatedHours,
      subtasks: legacyTask.subtasks,
      timeSpent: legacyTask.timeSpent,
    };

    return migratedTask;
  }

  /**
   * 为旧任务生成默认里程碑
   */
  private generateDefaultMilestones(legacyTask: LegacyTask): Milestone[] {
    const milestones: Milestone[] = [];
    const startDate = legacyTask.startDate.toDate();
    const dueDate = legacyTask.dueDate.toDate();
    const totalDays = Math.ceil((dueDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // 如果有子任务，基于子任务创建里程碑
    if (legacyTask.subtasks && legacyTask.subtasks.length > 0) {
      legacyTask.subtasks.forEach((subtask, index) => {
        const targetDate = new Date(startDate);
        targetDate.setDate(startDate.getDate() + Math.ceil((index + 1) * totalDays / legacyTask.subtasks.length));
        
        milestones.push({
          id: crypto.randomUUID(),
          title: subtask.title || `里程碑 ${index + 1}`,
          description: subtask.title || `完成第 ${index + 1} 个阶段`,
          targetDate,
          isCompleted: subtask.isCompleted || false,
          completedDate: subtask.completedAt?.toDate(),
          dayRange: `第${Math.ceil(index * totalDays / legacyTask.subtasks.length) + 1}-${Math.ceil((index + 1) * totalDays / legacyTask.subtasks.length)}天`
        });
      });
    } else {
      // 没有子任务时，创建默认里程碑
      const defaultMilestones = this.createDefaultMilestones(legacyTask.title, startDate, totalDays);
      milestones.push(...defaultMilestones);
    }

    return milestones;
  }

  /**
   * 创建默认里程碑
   */
  private createDefaultMilestones(taskTitle: string, startDate: Date, totalDays: number): Milestone[] {
    const milestones: Milestone[] = [];
    
    if (totalDays <= 3) {
      // 短期任务：每天一个里程碑
      for (let i = 0; i < totalDays; i++) {
        const targetDate = new Date(startDate);
        targetDate.setDate(startDate.getDate() + i + 1);
        
        milestones.push({
          id: crypto.randomUUID(),
          title: `${taskTitle} - 第${i + 1}天`,
          description: `完成第${i + 1}天的计划`,
          targetDate,
          isCompleted: false,
          dayRange: `第${i + 1}天`
        });
      }
    } else {
      // 长期任务：分为3个阶段
      const phases = [
        { name: '启动阶段', ratio: 0.3 },
        { name: '执行阶段', ratio: 0.6 },
        { name: '完成阶段', ratio: 1.0 }
      ];
      
      phases.forEach((phase, index) => {
        const targetDate = new Date(startDate);
        targetDate.setDate(startDate.getDate() + Math.ceil(totalDays * phase.ratio));
        
        const prevRatio = index > 0 ? phases[index - 1].ratio : 0;
        const startDay = Math.ceil(totalDays * prevRatio) + 1;
        const endDay = Math.ceil(totalDays * phase.ratio);
        
        milestones.push({
          id: crypto.randomUUID(),
          title: `${taskTitle} - ${phase.name}`,
          description: `完成${phase.name}的相关工作`,
          targetDate,
          isCompleted: false,
          dayRange: `第${startDay}-${endDay}天`
        });
      });
    }

    return milestones;
  }

  /**
   * 计算基于里程碑的进度
   */
  private calculateMilestoneProgress(milestones: Milestone[]): number {
    if (milestones.length === 0) return 0;
    
    const completedCount = milestones.filter(m => m.isCompleted).length;
    return Math.round((completedCount / milestones.length) * 100);
  }

  /**
   * 回滚迁移（如果需要）
   */
  async rollbackMigration(): Promise<void> {
    console.log('开始回滚迁移...');
    // 这里可以实现回滚逻辑，移除milestones字段等
    // 暂时不实现，因为我们保留了兼容性字段
    console.log('回滚功能暂未实现，因为保留了兼容性字段');
  }
}

// 导出单例实例
export const taskMigration = new TaskMigration();
