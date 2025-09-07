import { db } from '../firebase-server';
import { WebhookAdapterFactory } from '../adapters/webhook-adapters';
import type { WebhookReminder } from '../types/reminders';

// 执行日志接口
interface ExecutionLog {
  reminderId: string;
  timeSlotId: string;
  status: 'success' | 'failed';
  executedAt: Date;
  errorMessage?: string;
  responseStatus?: number;
}

// 主要的提醒执行函数
export async function executeScheduledReminders(): Promise<void> {
  try {
    console.log('开始执行提醒检查...');
    
    // 获取当前时间
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const currentDay = now.getDay().toString(); // 0=周日, 1=周一...
    
    console.log(`当前时间: ${currentTime}, 星期: ${currentDay}`);
    
    // 查询需要执行的提醒
    const remindersSnapshot = await db
      .collection('webhook_reminders')
      .where('isActive', '==', true)
      .where('days', 'array-contains', currentDay)
      .get();
    
    console.log(`找到 ${remindersSnapshot.size} 个活跃提醒`);
    
    let executedCount = 0;
    
    // 遍历每个提醒
    for (const doc of remindersSnapshot.docs) {
      const reminder = { id: doc.id, ...doc.data() } as WebhookReminder;
      
      // 检查是否有匹配当前时间的时间点
      const matchingTimeSlots = reminder.timeSlots.filter(slot => 
        slot.isActive && slot.time === currentTime
      );
      
      if (matchingTimeSlots.length > 0) {
        console.log(`提醒 "${reminder.name}" 有 ${matchingTimeSlots.length} 个时间点需要执行`);
        
        // 执行匹配的时间点
        for (const timeSlot of matchingTimeSlots) {
          try {
            await executeWebhookForTimeSlot(reminder, timeSlot);
            await logExecution(reminder.id, timeSlot.id, 'success');
            await updateExecutionCount(reminder.id);
            executedCount++;
            
            console.log(`成功执行提醒: ${reminder.name} - ${timeSlot.description || timeSlot.time}`);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '未知错误';
            await logExecution(reminder.id, timeSlot.id, 'failed', errorMessage);
            
            console.error(`执行提醒失败: ${reminder.name} - ${timeSlot.description || timeSlot.time}`, error);
          }
        }
      }
    }
    
    console.log(`提醒检查完成，共执行了 ${executedCount} 个提醒`);
    
  } catch (error) {
    console.error('提醒调度器执行失败:', error);
    throw error;
  }
}

// 执行单个时间点的webhook
async function executeWebhookForTimeSlot(
  reminder: WebhookReminder, 
  timeSlot: { id: string; time: string; description?: string }
): Promise<void> {
  try {
    // 获取对应平台的适配器
    const adapter = WebhookAdapterFactory.getAdapter(reminder.platform);
    
    // 在消息中可以包含时间点信息
    const enhancedContent = timeSlot.description 
      ? `${timeSlot.description}\n${reminder.messageContent}`
      : reminder.messageContent;
    
    // 格式化消息
    const message = adapter.formatMessage(
      enhancedContent,
      reminder.platformConfig?.[reminder.platform]
    );
    
    console.log(`发送webhook到 ${reminder.platform}: ${reminder.webhookUrl}`);
    console.log('消息内容:', JSON.stringify(message, null, 2));
    
    // 发送webhook请求
    const response = await fetch(reminder.webhookUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'Inspirista-Reminder-Bot/1.0'
      },
      body: JSON.stringify(message)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    console.log(`Webhook执行成功，状态码: ${response.status}`);
    
  } catch (error) {
    console.error(`Webhook执行失败:`, error);
    throw error;
  }
}

// 记录执行日志
async function logExecution(
  reminderId: string,
  timeSlotId: string,
  status: 'success' | 'failed',
  errorMessage?: string,
  responseStatus?: number
): Promise<void> {
  try {
    const log: Omit<ExecutionLog, 'id'> = {
      reminderId,
      timeSlotId,
      status,
      executedAt: new Date(),
      errorMessage,
      responseStatus,
    };
    
    await db.collection('reminder_execution_logs').add(log);
    
  } catch (error) {
    console.error('记录执行日志失败:', error);
    // 不抛出错误，避免影响主流程
  }
}

// 更新执行计数
async function updateExecutionCount(reminderId: string): Promise<void> {
  try {
    const reminderRef = db.collection('webhook_reminders').doc(reminderId);
    
    await db.runTransaction(async (transaction) => {
      const reminderDoc = await transaction.get(reminderRef);
      
      if (reminderDoc.exists) {
        const currentCount = reminderDoc.data()?.executionCount || 0;
        
        transaction.update(reminderRef, {
          executionCount: currentCount + 1,
          lastExecutionTime: new Date(),
        });
      }
    });
    
  } catch (error) {
    console.error('更新执行计数失败:', error);
    // 不抛出错误，避免影响主流程
  }
}

// 手动触发提醒执行（用于测试）
export async function executeReminderNow(reminderId: string, timeSlotId?: string): Promise<void> {
  try {
    const reminderDoc = await db.collection('webhook_reminders').doc(reminderId).get();
    
    if (!reminderDoc.exists) {
      throw new Error('提醒不存在');
    }
    
    const reminder = { id: reminderDoc.id, ...reminderDoc.data() } as WebhookReminder;
    
    if (!reminder.isActive) {
      throw new Error('提醒已禁用');
    }
    
    // 如果指定了时间点ID，只执行该时间点
    const timeSlots = timeSlotId 
      ? reminder.timeSlots.filter(slot => slot.id === timeSlotId)
      : reminder.timeSlots.filter(slot => slot.isActive);
    
    if (timeSlots.length === 0) {
      throw new Error('没有可执行的时间点');
    }
    
    for (const timeSlot of timeSlots) {
      await executeWebhookForTimeSlot(reminder, timeSlot);
      await logExecution(reminder.id, timeSlot.id, 'success');
    }
    
    await updateExecutionCount(reminder.id);
    
    console.log(`手动执行提醒成功: ${reminder.name}`);
    
  } catch (error) {
    console.error('手动执行提醒失败:', error);
    throw error;
  }
}
