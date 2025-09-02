/**
 * 安全的日期处理工具函数
 * 解决 RangeError: Invalid time value 问题
 */

import { Timestamp } from 'firebase/firestore';

/**
 * 安全地将各种日期格式转换为Date对象
 * 专门处理Firebase Timestamp和各种日期格式
 */
export function safeToDate(dateValue: any): Date | null {
  try {
    if (!dateValue) {
      return null;
    }

    // 如果已经是Date对象
    if (dateValue instanceof Date) {
      return isValidDate(dateValue) ? dateValue : null;
    }

    // 如果是Firebase Timestamp对象
    if (dateValue && typeof dateValue.toDate === 'function') {
      try {
        const date = dateValue.toDate();
        return isValidDate(date) ? date : null;
      } catch (timestampError) {
        console.warn('Failed to convert Timestamp to Date:', timestampError);
        return null;
      }
    }

    // 如果是Timestamp-like对象（有seconds属性）
    if (dateValue && typeof dateValue.seconds === 'number') {
      try {
        const date = new Date(dateValue.seconds * 1000);
        return isValidDate(date) ? date : null;
      } catch (secondsError) {
        console.warn('Failed to convert seconds to Date:', secondsError);
        return null;
      }
    }

    // 如果是字符串或数字，尝试转换
    const date = new Date(dateValue);
    return isValidDate(date) ? date : null;
  } catch (error) {
    console.warn('Date conversion failed:', error, 'Input:', dateValue);
    return null;
  }
}

/**
 * 检查Date对象是否有效
 */
export function isValidDate(date: any): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * 安全地获取时间戳
 */
export function safeGetTime(dateValue: any): number | null {
  const date = safeToDate(dateValue);
  return date ? date.getTime() : null;
}

/**
 * 安全地计算两个日期之间的天数差
 */
export function safeDaysDifference(date1: any, date2: any): number | null {
  const d1 = safeToDate(date1);
  const d2 = safeToDate(date2);
  
  if (!d1 || !d2) {
    return null;
  }

  return Math.ceil((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * 安全地格式化日期
 * 防止RangeError: Invalid time value
 */
export function safeFormatDate(
  dateValue: any,
  formatString: string = 'yyyy-MM-dd',
  options?: { locale?: any }
): string {
  try {
    const date = safeToDate(dateValue);
    if (!date) {
      return '无效日期';
    }

    // 如果是简单的格式字符串，使用原生方法
    if (formatString === 'yyyy-MM-dd') {
      return date.toISOString().split('T')[0];
    } else if (formatString === 'MM/dd') {
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${month}/${day}`;
    }

    // 对于复杂格式，尝试使用date-fns
    try {
      const { format } = require('date-fns');
      return format(date, formatString, options);
    } catch (formatError) {
      console.warn('Date formatting failed, using fallback:', formatError);
      // 使用原生方法作为回退
      return date.toLocaleDateString('zh-CN');
    }
  } catch (error) {
    console.warn('Safe format date failed:', error, 'Input:', dateValue);
    return '格式化失败';
  }
}

/**
 * 安全地检查日期是否逾期
 */
export function safeIsOverdue(dueDate: any, currentDate: Date = new Date()): boolean {
  const due = safeToDate(dueDate);
  const current = safeToDate(currentDate);
  
  if (!due || !current) {
    return false;
  }

  return due < current;
}

/**
 * 安全地获取任务的截止日期
 * 优先使用里程碑的最后日期，然后是任务的dueDate
 */
export function safeGetTaskDueDate(task: any): Date | null {
  // 尝试从里程碑获取最后的目标日期
  if (task.milestones && Array.isArray(task.milestones) && task.milestones.length > 0) {
    const finalMilestone = task.milestones[task.milestones.length - 1];
    if (finalMilestone?.targetDate) {
      const milestoneDate = safeToDate(finalMilestone.targetDate);
      if (milestoneDate) {
        return milestoneDate;
      }
    }
  }

  // 回退到任务的dueDate
  if (task.dueDate) {
    return safeToDate(task.dueDate);
  }

  return null;
}

/**
 * 安全地计算任务的剩余天数
 */
export function safeGetDaysUntilDue(task: any): number | null {
  const dueDate = safeGetTaskDueDate(task);
  if (!dueDate) {
    return null;
  }

  return safeDaysDifference(dueDate, new Date());
}

/**
 * 安全地检查任务是否逾期
 */
export function safeIsTaskOverdue(task: any): boolean {
  if (task.status === 'completed') {
    return false;
  }

  const dueDate = safeGetTaskDueDate(task);
  return safeIsOverdue(dueDate);
}

/**
 * 获取日期的友好显示文本
 */
export function getFriendlyDateText(dateValue: any): string {
  const date = safeToDate(dateValue);
  if (!date) {
    return '无日期';
  }

  const now = new Date();
  const daysDiff = safeDaysDifference(date, now);
  
  if (daysDiff === null) {
    return safeFormatDate(date);
  }

  if (daysDiff === 0) {
    return '今天';
  } else if (daysDiff === 1) {
    return '明天';
  } else if (daysDiff === -1) {
    return '昨天';
  } else if (daysDiff > 0) {
    return `${daysDiff}天后`;
  } else {
    return `${Math.abs(daysDiff)}天前`;
  }
}

/**
 * 获取逾期状态的友好显示文本
 */
export function getOverdueText(task: any): string {
  const dueDate = safeGetTaskDueDate(task);
  if (!dueDate) {
    return '';
  }

  const isOverdue = safeIsTaskOverdue(task);
  if (!isOverdue) {
    return '';
  }

  const daysPast = Math.abs(safeDaysDifference(new Date(), dueDate) || 0);
  return `逾期${daysPast}天`;
}

/**
 * 创建安全的Timestamp对象
 */
export function createSafeTimestamp(dateValue: any): Timestamp | null {
  const date = safeToDate(dateValue);
  if (!date) {
    return null;
  }

  try {
    return Timestamp.fromDate(date);
  } catch (error) {
    console.warn('Timestamp creation failed:', error);
    return null;
  }
}

/**
 * 安全地从里程碑对象获取目标日期
 * 专门处理里程碑的targetDate字段
 */
export function safeMilestoneTargetDate(milestone: any): Date | null {
  if (!milestone || !milestone.targetDate) {
    return null;
  }

  try {
    // 使用通用的safeToDate函数
    const date = safeToDate(milestone.targetDate);
    if (date) {
      return date;
    }

    // 如果通用方法失败，尝试其他可能的格式
    console.debug('Failed to parse milestone targetDate, trying fallback methods:', milestone.targetDate);

    // 尝试直接解析字符串
    if (typeof milestone.targetDate === 'string') {
      const parsed = new Date(milestone.targetDate);
      if (isValidDate(parsed)) {
        return parsed;
      }
    }

    return null;
  } catch (error) {
    console.warn('Error parsing milestone targetDate:', error, 'Milestone:', milestone);
    return null;
  }
}



/**
 * 安全的相对日期计算
 * 防止日期计算中的错误
 */
export function safeRelativeDate(dateValue: any): string {
  try {
    const date = safeToDate(dateValue);
    if (!date) {
      return '无日期';
    }

    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return '今天';
    } else if (diffDays === 1) {
      return '明天';
    } else if (diffDays === -1) {
      return '昨天';
    } else if (diffDays > 0) {
      return `${diffDays}天后`;
    } else {
      return `${Math.abs(diffDays)}天前`;
    }
  } catch (error) {
    console.warn('Relative date calculation failed:', error);
    return '日期计算错误';
  }
}
