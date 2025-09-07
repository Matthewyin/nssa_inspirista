#!/usr/bin/env tsx

/**
 * 提醒功能测试脚本
 * 
 * 用法:
 * npx tsx src/scripts/test-reminders.ts create    # 创建测试提醒
 * npx tsx src/scripts/test-reminders.ts execute   # 执行测试提醒
 * npx tsx src/scripts/test-reminders.ts logs      # 查看执行日志
 * npx tsx src/scripts/test-reminders.ts cleanup   # 清理测试数据
 */

import { db } from '../lib/firebase-server';
import { executeReminderNow } from '../lib/server/reminder-scheduler';
import type { WebhookReminder } from '../lib/types/reminders';

let testReminderId: string | null = null;

async function createTestReminder(): Promise<string> {
  try {
    // 获取当前时间，设置为2分钟后执行
    const now = new Date();
    const testTime = new Date(now.getTime() + 2 * 60 * 1000); // 2分钟后
    const timeString = `${testTime.getHours().toString().padStart(2, '0')}:${testTime.getMinutes().toString().padStart(2, '0')}`;
    const dayString = testTime.getDay().toString();
    
    console.log(`创建测试提醒，将在 ${timeString} (星期${dayString}) 执行`);
    
    const testReminder: Omit<WebhookReminder, 'id'> = {
      userId: 'test-user-123',
      name: '测试提醒',
      platform: 'wechat_work',
      webhookUrl: 'https://httpbin.org/post', // 使用httpbin作为测试endpoint
      messageContent: '这是一条测试提醒消息',
      timeSlots: [
        {
          id: 'test-slot-1',
          time: timeString,
          isActive: true,
          description: '测试时间点'
        }
      ],
      days: [dayString],
      isActive: true,
      platformConfig: {
        wechat: {
          msgtype: 'text',
          mentionAll: true
        }
      },
      executionCount: 0,
      createdAt: new Date() as any,
      updatedAt: new Date() as any,
      nextRuns: [new Date(testTime)] as any
    };
    
    const docRef = await db.collection('webhook_reminders').add(testReminder);
    console.log('测试提醒创建成功，ID:', docRef.id);
    console.log('请等待2分钟查看执行结果，或者手动执行测试...');
    
    return docRef.id;
  } catch (error) {
    console.error('创建测试提醒失败:', error);
    throw error;
  }
}

async function executeTestReminder(reminderId: string): Promise<void> {
  try {
    console.log(`手动执行测试提醒: ${reminderId}`);
    await executeReminderNow(reminderId);
    console.log('测试提醒执行成功！');
  } catch (error) {
    console.error('执行测试提醒失败:', error);
    throw error;
  }
}

async function checkExecutionLogs(reminderId?: string): Promise<void> {
  try {
    let query = db.collection('reminder_execution_logs');
    
    if (reminderId) {
      query = query.where('reminderId', '==', reminderId);
    }
    
    const logsSnapshot = await query
      .orderBy('executedAt', 'desc')
      .limit(10)
      .get();
    
    console.log(`\n找到 ${logsSnapshot.size} 条执行日志:`);
    
    logsSnapshot.forEach(doc => {
      const log = doc.data();
      const executedAt = log.executedAt?.toDate?.() || new Date(log.executedAt);
      console.log(`- ${log.status}: ${executedAt.toLocaleString('zh-CN')} (提醒ID: ${log.reminderId})`);
      if (log.errorMessage) {
        console.log(`  错误: ${log.errorMessage}`);
      }
    });
  } catch (error) {
    console.error('查询执行日志失败:', error);
  }
}

async function cleanupTestData(): Promise<void> {
  try {
    console.log('清理测试数据...');
    
    // 删除测试提醒
    const remindersSnapshot = await db
      .collection('webhook_reminders')
      .where('userId', '==', 'test-user-123')
      .get();
    
    const batch = db.batch();
    remindersSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // 删除测试执行日志
    const logsSnapshot = await db
      .collection('reminder_execution_logs')
      .get();
    
    logsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (remindersSnapshot.docs.some(reminderDoc => reminderDoc.id === data.reminderId)) {
        batch.delete(doc.ref);
      }
    });
    
    await batch.commit();
    
    console.log(`清理完成，删除了 ${remindersSnapshot.size} 个提醒和相关日志`);
  } catch (error) {
    console.error('清理测试数据失败:', error);
  }
}

async function listTestReminders(): Promise<void> {
  try {
    const remindersSnapshot = await db
      .collection('webhook_reminders')
      .where('userId', '==', 'test-user-123')
      .get();
    
    console.log(`\n找到 ${remindersSnapshot.size} 个测试提醒:`);
    
    remindersSnapshot.forEach(doc => {
      const reminder = doc.data();
      console.log(`- ${doc.id}: ${reminder.name} (${reminder.isActive ? '活跃' : '禁用'})`);
      reminder.timeSlots?.forEach((slot: any) => {
        console.log(`  时间点: ${slot.time} ${slot.isActive ? '✓' : '✗'} ${slot.description || ''}`);
      });
    });
  } catch (error) {
    console.error('查询测试提醒失败:', error);
  }
}

async function main() {
  const command = process.argv[2];
  const reminderId = process.argv[3];
  
  try {
    switch (command) {
      case 'create':
        testReminderId = await createTestReminder();
        break;
        
      case 'execute':
        if (!reminderId) {
          console.log('请提供提醒ID: npx tsx src/scripts/test-reminders.ts execute <reminder-id>');
          return;
        }
        await executeTestReminder(reminderId);
        break;
        
      case 'logs':
        await checkExecutionLogs(reminderId);
        break;
        
      case 'cleanup':
        await cleanupTestData();
        break;
        
      case 'list':
        await listTestReminders();
        break;
        
      default:
        console.log('用法:');
        console.log('  npx tsx src/scripts/test-reminders.ts create           # 创建测试提醒');
        console.log('  npx tsx src/scripts/test-reminders.ts execute <id>     # 执行测试提醒');
        console.log('  npx tsx src/scripts/test-reminders.ts logs [id]        # 查看执行日志');
        console.log('  npx tsx src/scripts/test-reminders.ts list             # 列出测试提醒');
        console.log('  npx tsx src/scripts/test-reminders.ts cleanup          # 清理测试数据');
        break;
    }
  } catch (error) {
    console.error('操作失败:', error);
    process.exit(1);
  }
}

main().catch(console.error);
