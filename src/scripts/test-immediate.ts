#!/usr/bin/env tsx

/**
 * 立即测试定时执行功能
 */

// 设置环境变量
process.env.NODE_ENV = 'development';
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

// 加载其他环境变量
import { config } from 'dotenv';
config({ path: '.env.development' });

import { db } from '../lib/firebase-server';
import { executeScheduledReminders } from '../lib/server/reminder-scheduler';
import type { WebhookReminder } from '../lib/types/reminders';

async function createImmediateReminder(): Promise<string> {
  try {
    console.log('🔧 创建立即执行的测试提醒...');
    
    // 获取当前时间
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const dayString = now.getDay().toString();
    
    console.log(`⏰ 当前时间: ${timeString} (星期${dayString})`);
    
    const testReminder: Omit<WebhookReminder, 'id'> = {
      userId: 'test-user-immediate',
      name: '立即执行测试提醒',
      platform: 'wechat_work',
      webhookUrl: 'https://httpbin.org/post',
      messageContent: '这是一条立即执行的测试提醒消息',
      timeSlots: [
        {
          id: 'immediate-slot-1',
          time: timeString,
          isActive: true,
          description: '立即执行时间点'
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
      nextRuns: [new Date()] as any
    };
    
    const database = db();
    if (!database) {
      throw new Error('Firebase database not initialized');
    }
    
    const docRef = await database.collection('webhook_reminders').add(testReminder);
    console.log('✅ 立即执行测试提醒创建成功，ID:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('❌ 创建立即执行测试提醒失败:', error);
    throw error;
  }
}

async function main() {
  console.log('🧪 立即执行测试开始...\n');
  
  try {
    // 创建当前时间的提醒
    const reminderId = await createImmediateReminder();
    
    console.log('\n⏳ 等待1秒后执行定时检查...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 执行定时检查
    console.log('\n🚀 执行定时检查...');
    await executeScheduledReminders();
    
    console.log('\n📋 查看执行日志...');
    const database = db();
    if (database) {
      const logsSnapshot = await database
        .collection('reminder_execution_logs')
        .where('reminderId', '==', reminderId)
        .orderBy('executedAt', 'desc')
        .limit(3)
        .get();
      
      console.log(`📊 找到 ${logsSnapshot.size} 条相关执行日志:`);
      
      logsSnapshot.forEach(doc => {
        const log = doc.data();
        const executedAt = log.executedAt?.toDate?.() || new Date(log.executedAt);
        console.log(`  ${log.status === 'success' ? '✅' : '❌'} ${log.status}: ${executedAt.toLocaleString('zh-CN')}`);
        if (log.errorMessage) {
          console.log(`     错误: ${log.errorMessage}`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
    process.exit(1);
  }
  
  console.log('\n🎉 立即执行测试完成！');
}

main().catch(console.error);
