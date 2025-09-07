#!/usr/bin/env tsx

/**
 * 提醒执行脚本
 * 
 * 用法:
 * 1. 直接执行: npx tsx src/scripts/execute-reminders.ts
 * 2. 通过cron job定时执行: * * * * * cd /path/to/project && npx tsx src/scripts/execute-reminders.ts
 * 3. 手动执行特定提醒: npx tsx src/scripts/execute-reminders.ts --reminder-id=xxx
 */

import { executeScheduledReminders, executeReminderNow } from '../lib/server/reminder-scheduler';

async function main() {
  const args = process.argv.slice(2);
  const reminderIdArg = args.find(arg => arg.startsWith('--reminder-id='));
  const timeSlotIdArg = args.find(arg => arg.startsWith('--time-slot-id='));
  
  try {
    if (reminderIdArg) {
      // 手动执行特定提醒
      const reminderId = reminderIdArg.split('=')[1];
      const timeSlotId = timeSlotIdArg?.split('=')[1];
      
      if (!reminderId) {
        console.error('错误: 请提供有效的提醒ID');
        process.exit(1);
      }
      
      console.log(`手动执行提醒: ${reminderId}${timeSlotId ? ` (时间点: ${timeSlotId})` : ''}`);
      await executeReminderNow(reminderId, timeSlotId);
      console.log('手动执行完成');
      
    } else {
      // 执行所有计划的提醒
      console.log('开始执行计划的提醒...');
      await executeScheduledReminders();
      console.log('计划提醒执行完成');
    }
    
  } catch (error) {
    console.error('执行失败:', error);
    process.exit(1);
  }
}

// 处理未捕获的异常
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  process.exit(1);
});

// 执行主函数
main().catch((error) => {
  console.error('脚本执行失败:', error);
  process.exit(1);
});
