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
  getDocs,
  getDoc,
  Timestamp,
  writeBatch,
  limit,
} from 'firebase/firestore';
import { db } from '../firebase';
import type {
  WebhookReminder,
  CreateReminderInput,
  UpdateReminderInput,
  ReminderStats,
  ReminderExecutionLog,
  TimeSlot,
} from '@/lib/types/reminders';

// 集合名称
const REMINDERS_COLLECTION = 'webhook_reminders';
const EXECUTION_LOGS_COLLECTION = 'reminder_execution_logs';

// 生成时间点ID
function generateTimeSlotId(): string {
  return `slot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 计算下次执行时间
function calculateNextRuns(timeSlots: TimeSlot[], days: string[]): Timestamp[] {
  const now = new Date();
  const nextRuns: Timestamp[] = [];
  
  for (const slot of timeSlots) {
    if (!slot.isActive) {
      nextRuns.push(Timestamp.fromDate(new Date(0))); // 非活跃时间点设为最小时间
      continue;
    }
    
    const [hours, minutes] = slot.time.split(':').map(Number);
    let nextRun: Date | null = null;
    
    // 查找下一个执行时间
    for (let i = 0; i < 14; i++) { // 最多查找两周
      const checkDate = new Date(now);
      checkDate.setDate(checkDate.getDate() + i);
      checkDate.setHours(hours, minutes, 0, 0);
      
      const dayOfWeek = checkDate.getDay().toString();
      
      // 检查是否在指定的执行日期中，且时间未过
      if (days.includes(dayOfWeek) && checkDate > now) {
        nextRun = checkDate;
        break;
      }
    }
    
    nextRuns.push(Timestamp.fromDate(nextRun || new Date(0)));
  }
  
  return nextRuns;
}

// 创建提醒
export async function createReminder(
  userId: string,
  reminderData: CreateReminderInput
): Promise<string> {
  try {
    const now = Timestamp.now();
    
    // 为时间点生成ID
    const timeSlots: TimeSlot[] = reminderData.timeSlots.map(slot => ({
      ...slot,
      id: generateTimeSlotId(),
    }));
    
    // 计算下次执行时间
    const nextRuns = calculateNextRuns(timeSlots, reminderData.days);
    
    const reminder: Omit<WebhookReminder, 'id'> = {
      userId,
      name: reminderData.name,
      platform: reminderData.platform,
      webhookUrl: reminderData.webhookUrl,
      messageContent: reminderData.messageContent,
      timeSlots,
      days: reminderData.days,
      isActive: reminderData.isActive,
      platformConfig: reminderData.platformConfig,
      executionCount: 0,
      createdAt: now,
      updatedAt: now,
      nextRuns,
    };
    
    const docRef = await addDoc(collection(db, REMINDERS_COLLECTION), reminder);
    return docRef.id;
  } catch (error) {
    console.error('Error creating reminder:', error);
    throw new Error('创建提醒失败');
  }
}

// 更新提醒
export async function updateReminder(
  reminderId: string,
  updates: UpdateReminderInput
): Promise<void> {
  try {
    const reminderRef = doc(db, REMINDERS_COLLECTION, reminderId);
    const reminderDoc = await getDoc(reminderRef);
    
    if (!reminderDoc.exists()) {
      throw new Error('提醒不存在');
    }
    
    const currentData = reminderDoc.data() as WebhookReminder;
    const now = Timestamp.now();
    
    // 处理时间点更新
    let timeSlots = currentData.timeSlots;
    let nextRuns = currentData.nextRuns;
    
    if (updates.timeSlots) {
      timeSlots = updates.timeSlots.map(slot => ({
        ...slot,
        id: slot.id || generateTimeSlotId(),
      }));
    }
    
    // 如果时间点或日期发生变化，重新计算下次执行时间
    if (updates.timeSlots || updates.days) {
      const days = updates.days || currentData.days;
      nextRuns = calculateNextRuns(timeSlots, days);
    }
    
    const updateData: Partial<WebhookReminder> = {
      ...updates,
      timeSlots,
      nextRuns,
      updatedAt: now,
    };
    
    await updateDoc(reminderRef, updateData);
  } catch (error) {
    console.error('Error updating reminder:', error);
    throw new Error('更新提醒失败');
  }
}

// 删除提醒
export async function deleteReminder(reminderId: string): Promise<void> {
  try {
    const reminderRef = doc(db, REMINDERS_COLLECTION, reminderId);
    await deleteDoc(reminderRef);
  } catch (error) {
    console.error('Error deleting reminder:', error);
    throw new Error('删除提醒失败');
  }
}

// 获取用户的提醒列表
export function getUserReminders(
  userId: string,
  callback: (reminders: WebhookReminder[]) => void
): () => void {
  const q = query(
    collection(db, REMINDERS_COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const reminders: WebhookReminder[] = [];
    snapshot.forEach((doc) => {
      reminders.push({
        id: doc.id,
        ...doc.data(),
      } as WebhookReminder);
    });
    callback(reminders);
  });
}

// 获取单个提醒
export async function getReminder(reminderId: string): Promise<WebhookReminder | null> {
  try {
    const reminderRef = doc(db, REMINDERS_COLLECTION, reminderId);
    const reminderDoc = await getDoc(reminderRef);
    
    if (!reminderDoc.exists()) {
      return null;
    }
    
    return {
      id: reminderDoc.id,
      ...reminderDoc.data(),
    } as WebhookReminder;
  } catch (error) {
    console.error('Error getting reminder:', error);
    return null;
  }
}

// 切换提醒状态
export async function toggleReminderStatus(
  reminderId: string,
  isActive: boolean
): Promise<void> {
  try {
    const reminderRef = doc(db, REMINDERS_COLLECTION, reminderId);
    await updateDoc(reminderRef, {
      isActive,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error toggling reminder status:', error);
    throw new Error('切换提醒状态失败');
  }
}

// 切换时间点状态
export async function toggleTimeSlotStatus(
  reminderId: string,
  timeSlotId: string,
  isActive: boolean
): Promise<void> {
  try {
    const reminderRef = doc(db, REMINDERS_COLLECTION, reminderId);
    const reminderDoc = await getDoc(reminderRef);
    
    if (!reminderDoc.exists()) {
      throw new Error('提醒不存在');
    }
    
    const currentData = reminderDoc.data() as WebhookReminder;
    const timeSlots = currentData.timeSlots.map(slot =>
      slot.id === timeSlotId ? { ...slot, isActive } : slot
    );
    
    // 重新计算下次执行时间
    const nextRuns = calculateNextRuns(timeSlots, currentData.days);
    
    await updateDoc(reminderRef, {
      timeSlots,
      nextRuns,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error toggling time slot status:', error);
    throw new Error('切换时间点状态失败');
  }
}

// 获取提醒统计信息
export async function getReminderStats(userId: string): Promise<ReminderStats> {
  try {
    const q = query(
      collection(db, REMINDERS_COLLECTION),
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(q);
    const reminders: WebhookReminder[] = [];
    
    snapshot.forEach((doc) => {
      reminders.push({
        id: doc.id,
        ...doc.data(),
      } as WebhookReminder);
    });
    
    const total = reminders.length;
    const active = reminders.filter(r => r.isActive).length;
    const inactive = total - active;
    const totalExecutions = reminders.reduce((sum, r) => sum + (r.executionCount || 0), 0);
    
    // 计算今日执行次数（需要查询执行日志）
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = Timestamp.fromDate(today);
    
    const logsQuery = query(
      collection(db, EXECUTION_LOGS_COLLECTION),
      where('executedAt', '>=', todayStart),
      where('status', '==', 'success')
    );
    
    const logsSnapshot = await getDocs(logsQuery);
    const todayExecutions = logsSnapshot.size;
    
    // 找到下一个执行时间
    let nextExecution: { time: Date; reminderName: string } | undefined;
    const now = new Date();
    
    for (const reminder of reminders.filter(r => r.isActive)) {
      for (let i = 0; i < reminder.nextRuns.length; i++) {
        const nextRun = reminder.nextRuns[i].toDate();
        if (nextRun > now && reminder.timeSlots[i]?.isActive) {
          if (!nextExecution || nextRun < nextExecution.time) {
            nextExecution = {
              time: nextRun,
              reminderName: reminder.name
            };
          }
        }
      }
    }
    
    return {
      total,
      active,
      inactive,
      totalExecutions,
      todayExecutions,
      nextExecution,
    };
  } catch (error) {
    console.error('Error getting reminder stats:', error);
    return {
      total: 0,
      active: 0,
      inactive: 0,
      totalExecutions: 0,
      todayExecutions: 0,
    };
  }
}

// 记录执行日志
export async function logReminderExecution(
  reminderId: string,
  timeSlotId: string,
  status: 'success' | 'failed',
  errorMessage?: string,
  responseStatus?: number
): Promise<void> {
  try {
    const log: Omit<ReminderExecutionLog, 'id'> = {
      reminderId,
      timeSlotId,
      status,
      executedAt: Timestamp.now(),
      errorMessage,
      responseStatus,
    };
    
    await addDoc(collection(db, EXECUTION_LOGS_COLLECTION), log);
    
    // 如果执行成功，更新提醒的执行计数
    if (status === 'success') {
      const reminderRef = doc(db, REMINDERS_COLLECTION, reminderId);
      const reminderDoc = await getDoc(reminderRef);
      
      if (reminderDoc.exists()) {
        const currentData = reminderDoc.data() as WebhookReminder;
        await updateDoc(reminderRef, {
          executionCount: (currentData.executionCount || 0) + 1,
          lastExecutionTime: Timestamp.now(),
        });
      }
    }
  } catch (error) {
    console.error('Error logging reminder execution:', error);
  }
}

// 批量删除提醒
export async function batchDeleteReminders(reminderIds: string[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    
    reminderIds.forEach(id => {
      const reminderRef = doc(db, REMINDERS_COLLECTION, id);
      batch.delete(reminderRef);
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error batch deleting reminders:', error);
    throw new Error('批量删除提醒失败');
  }
}
