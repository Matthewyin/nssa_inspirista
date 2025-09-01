/**
 * React Hook for safe date handling
 * 防止RangeError: Invalid time value的专用Hook
 */

import { useMemo } from 'react';
import { safeToDate, safeMilestoneTargetDate, safeFormatDate, safeRelativeDate } from '@/lib/utils/date-utils';
import type { Task, Milestone } from '@/lib/types/tasks';

export interface SafeDateInfo {
  date: Date | null;
  isValid: boolean;
  formatted: string;
  relative: string;
  isOverdue: boolean;
  daysUntilDue: number | null;
}

/**
 * 安全处理任务日期的Hook
 */
export function useSafeTaskDates(task: Task) {
  return useMemo(() => {
    const now = new Date();
    
    // 安全获取创建日期
    const createdDate = safeToDate(task.createdAt);
    
    // 安全获取截止日期（优先使用最后一个里程碑的日期）
    let dueDate: Date | null = null;
    if (task.milestones && task.milestones.length > 0) {
      const lastMilestone = task.milestones[task.milestones.length - 1];
      dueDate = safeMilestoneTargetDate(lastMilestone);
    }
    
    // 如果没有里程碑日期，使用任务的dueDate
    if (!dueDate && task.dueDate) {
      dueDate = safeToDate(task.dueDate);
    }
    
    // 计算日期信息
    const isOverdue = task.status !== 'completed' && dueDate && dueDate < now;
    const daysUntilDue = dueDate ? Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
    
    return {
      createdDate: {
        date: createdDate,
        isValid: !!createdDate,
        formatted: safeFormatDate(createdDate, 'yyyy-MM-dd'),
        relative: safeRelativeDate(createdDate),
        isOverdue: false,
        daysUntilDue: null,
      } as SafeDateInfo,
      
      dueDate: {
        date: dueDate,
        isValid: !!dueDate,
        formatted: safeFormatDate(dueDate, 'yyyy-MM-dd'),
        relative: safeRelativeDate(dueDate),
        isOverdue: !!isOverdue,
        daysUntilDue,
      } as SafeDateInfo,
    };
  }, [task]);
}

/**
 * 安全处理里程碑日期的Hook
 */
export function useSafeMilestoneDates(milestones: Milestone[]) {
  return useMemo(() => {
    const now = new Date();
    
    return milestones.map((milestone) => {
      const targetDate = safeMilestoneTargetDate(milestone);
      const isOverdue = !milestone.isCompleted && targetDate && targetDate < now;
      const daysUntilDue = targetDate ? Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
      
      return {
        ...milestone,
        safeDateInfo: {
          date: targetDate,
          isValid: !!targetDate,
          formatted: safeFormatDate(targetDate, 'MM/dd'),
          relative: safeRelativeDate(targetDate),
          isOverdue: !!isOverdue,
          daysUntilDue,
        } as SafeDateInfo,
      };
    });
  }, [milestones]);
}

/**
 * 安全处理单个日期的Hook
 */
export function useSafeDate(dateValue: any, formatString?: string) {
  return useMemo(() => {
    const date = safeToDate(dateValue);
    const now = new Date();
    const isOverdue = date && date < now;
    const daysUntilDue = date ? Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
    
    return {
      date,
      isValid: !!date,
      formatted: safeFormatDate(date, formatString),
      relative: safeRelativeDate(date),
      isOverdue: !!isOverdue,
      daysUntilDue,
    } as SafeDateInfo;
  }, [dateValue, formatString]);
}

/**
 * 获取下一个未完成里程碑的Hook
 */
export function useNextMilestone(milestones: Milestone[]) {
  return useMemo(() => {
    const safeMilestones = useSafeMilestoneDates(milestones);
    const nextMilestone = safeMilestones.find(m => !m.isCompleted);
    
    return nextMilestone || null;
  }, [milestones]);
}

/**
 * 计算任务进度的Hook（基于里程碑）
 */
export function useTaskProgress(task: Task) {
  return useMemo(() => {
    if (!task.milestones || task.milestones.length === 0) {
      return {
        percentage: task.progress || 0,
        completedMilestones: 0,
        totalMilestones: 0,
        nextMilestone: null,
      };
    }
    
    const completedMilestones = task.milestones.filter(m => m.isCompleted).length;
    const totalMilestones = task.milestones.length;
    const percentage = Math.round((completedMilestones / totalMilestones) * 100);
    
    const safeMilestones = useSafeMilestoneDates(task.milestones);
    const nextMilestone = safeMilestones.find(m => !m.isCompleted);
    
    return {
      percentage,
      completedMilestones,
      totalMilestones,
      nextMilestone: nextMilestone || null,
    };
  }, [task]);
}
