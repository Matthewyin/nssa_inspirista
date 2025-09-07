#!/usr/bin/env tsx

/**
 * 使用Firebase模拟器测试提醒功能
 * 
 * 用法:
 * 1. 启动模拟器: firebase emulators:start --only firestore
 * 2. 运行测试: FIRESTORE_EMULATOR_HOST=localhost:8080 npx tsx src/scripts/test-with-emulator.ts
 */

// 设置环境变量
process.env.NODE_ENV = 'development';
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

// 加载其他环境变量
import { config } from 'dotenv';
config({ path: '.env.development' });

import { db } from '../lib/firebase-server';
import { executeReminderNow, executeScheduledReminders } from '../lib/server/reminder-scheduler';
import type { WebhookReminder } from '../lib/types/reminders';

async function createTestReminder(): Promise<string> {
  try {
    console.log('🔧 创建测试提醒...');
    
    // 获取当前时间，设置为1分钟后执行
    const now = new Date();
    const testTime = new Date(now.getTime() + 1 * 60 * 1000); // 1分钟后
    const timeString = `${testTime.getHours().toString().padStart(2, '0')}:${testTime.getMinutes().toString().padStart(2, '0')}`;
    const dayString = testTime.getDay().toString();
    
    console.log(`⏰ 设置执行时间: ${timeString} (星期${dayString})`);
    
    const testReminder: Omit<WebhookReminder, 'id'> = {
      userId: 'test-user-emulator',
      name: '模拟器测试提醒',
      platform: 'wechat_work',
      webhookUrl: 'https://httpbin.org/post', // 使用httpbin作为测试endpoint
      messageContent: '这是一条来自Firebase模拟器的测试提醒消息',
      timeSlots: [
        {
          id: 'emulator-slot-1',
          time: timeString,
          isActive: true,
          description: '模拟器测试时间点'
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
    
    const database = db();
    if (!database) {
      throw new Error('Firebase database not initialized');
    }
    
    const docRef = await database.collection('webhook_reminders').add(testReminder);
    console.log('✅ 测试提醒创建成功，ID:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('❌ 创建测试提醒失败:', error);
    throw error;
  }
}

async function testScheduledExecution(): Promise<void> {
  try {
    console.log('\n🚀 测试定时执行功能...');
    await executeScheduledReminders();
    console.log('✅ 定时执行测试完成');
  } catch (error) {
    console.error('❌ 定时执行测试失败:', error);
  }
}

async function testManualExecution(reminderId: string): Promise<void> {
  try {
    console.log('\n🎯 测试手动执行功能...');
    await executeReminderNow(reminderId);
    console.log('✅ 手动执行测试完成');
  } catch (error) {
    console.error('❌ 手动执行测试失败:', error);
  }
}

async function checkExecutionLogs(): Promise<void> {
  try {
    console.log('\n📋 查看执行日志...');
    
    const database = db();
    if (!database) {
      throw new Error('Firebase database not initialized');
    }
    
    const logsSnapshot = await database
      .collection('reminder_execution_logs')
      .orderBy('executedAt', 'desc')
      .limit(5)
      .get();
    
    console.log(`📊 找到 ${logsSnapshot.size} 条执行日志:`);
    
    logsSnapshot.forEach(doc => {
      const log = doc.data();
      const executedAt = log.executedAt?.toDate?.() || new Date(log.executedAt);
      console.log(`  ${log.status === 'success' ? '✅' : '❌'} ${log.status}: ${executedAt.toLocaleString('zh-CN')}`);
      if (log.errorMessage) {
        console.log(`     错误: ${log.errorMessage}`);
      }
    });
  } catch (error) {
    console.error('❌ 查询执行日志失败:', error);
  }
}

async function listAllReminders(): Promise<void> {
  try {
    console.log('\n📝 查看所有提醒...');
    
    const database = db();
    if (!database) {
      throw new Error('Firebase database not initialized');
    }
    
    const remindersSnapshot = await database
      .collection('webhook_reminders')
      .get();
    
    console.log(`📊 找到 ${remindersSnapshot.size} 个提醒:`);
    
    remindersSnapshot.forEach(doc => {
      const reminder = doc.data();
      console.log(`  ${reminder.isActive ? '🟢' : '🔴'} ${doc.id}: ${reminder.name}`);
      reminder.timeSlots?.forEach((slot: any) => {
        console.log(`     ⏰ ${slot.time} ${slot.isActive ? '✓' : '✗'} ${slot.description || ''}`);
      });
    });
  } catch (error) {
    console.error('❌ 查询提醒失败:', error);
  }
}

async function cleanupTestData(): Promise<void> {
  try {
    console.log('\n🧹 清理测试数据...');
    
    const database = db();
    if (!database) {
      throw new Error('Firebase database not initialized');
    }
    
    // 删除测试提醒
    const remindersSnapshot = await database
      .collection('webhook_reminders')
      .where('userId', '==', 'test-user-emulator')
      .get();
    
    const batch = database.batch();
    remindersSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // 删除相关日志
    const logsSnapshot = await database
      .collection('reminder_execution_logs')
      .get();
    
    logsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (remindersSnapshot.docs.some(reminderDoc => reminderDoc.id === data.reminderId)) {
        batch.delete(doc.ref);
      }
    });
    
    await batch.commit();
    
    console.log(`✅ 清理完成，删除了 ${remindersSnapshot.size} 个提醒和相关日志`);
  } catch (error) {
    console.error('❌ 清理测试数据失败:', error);
  }
}

async function checkEmulatorConnection(): Promise<boolean> {
  try {
    console.log('🔍 检查Firebase模拟器连接...');
    
    const database = db();
    if (!database) {
      console.log('❌ Firebase数据库未初始化');
      return false;
    }
    
    // 尝试读取一个集合
    await database.collection('_test').limit(1).get();
    console.log('✅ Firebase模拟器连接正常');
    return true;
  } catch (error) {
    console.log('❌ Firebase模拟器连接失败:', error);
    console.log('💡 请确保模拟器已启动: firebase emulators:start --only firestore');
    return false;
  }
}

async function main() {
  console.log('🧪 Firebase模拟器测试开始...\n');
  
  // 检查模拟器连接
  const isConnected = await checkEmulatorConnection();
  if (!isConnected) {
    process.exit(1);
  }
  
  const command = process.argv[2];
  
  try {
    switch (command) {
      case 'full':
        // 完整测试流程
        const reminderId = await createTestReminder();
        await testManualExecution(reminderId);
        await testScheduledExecution();
        await checkExecutionLogs();
        await listAllReminders();
        break;
        
      case 'create':
        await createTestReminder();
        break;
        
      case 'execute':
        await testScheduledExecution();
        break;
        
      case 'manual':
        const id = process.argv[3];
        if (!id) {
          console.log('请提供提醒ID: npx tsx src/scripts/test-with-emulator.ts manual <reminder-id>');
          return;
        }
        await testManualExecution(id);
        break;
        
      case 'logs':
        await checkExecutionLogs();
        break;
        
      case 'list':
        await listAllReminders();
        break;
        
      case 'cleanup':
        await cleanupTestData();
        break;
        
      default:
        console.log('用法:');
        console.log('  npx tsx src/scripts/test-with-emulator.ts full      # 完整测试流程');
        console.log('  npx tsx src/scripts/test-with-emulator.ts create    # 创建测试提醒');
        console.log('  npx tsx src/scripts/test-with-emulator.ts execute   # 测试定时执行');
        console.log('  npx tsx src/scripts/test-with-emulator.ts manual <id> # 手动执行');
        console.log('  npx tsx src/scripts/test-with-emulator.ts logs      # 查看日志');
        console.log('  npx tsx src/scripts/test-with-emulator.ts list      # 列出提醒');
        console.log('  npx tsx src/scripts/test-with-emulator.ts cleanup   # 清理数据');
        console.log('\n💡 请先启动模拟器: firebase emulators:start --only firestore');
        break;
    }
  } catch (error) {
    console.error('❌ 测试失败:', error);
    process.exit(1);
  }
  
  console.log('\n🎉 测试完成！');
}

main().catch(console.error);
