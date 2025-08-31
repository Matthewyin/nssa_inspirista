#!/usr/bin/env node

/**
 * 任务数据迁移脚本
 * 使用方法：npm run migrate:tasks
 */

import { taskMigration } from '@/lib/migration/task-migration';

async function runMigration() {
  console.log('🚀 开始任务数据迁移...');
  
  try {
    // 检查是否需要迁移
    const needsMigration = await taskMigration.checkMigrationNeeded();
    
    if (!needsMigration) {
      console.log('✅ 数据已经是最新版本，无需迁移');
      return;
    }

    console.log('📊 检测到需要迁移的数据，开始迁移...');
    
    // 执行迁移
    const results = await taskMigration.migrateAllTasks();
    
    console.log('🎉 迁移完成！');
    console.log(`✅ 成功迁移: ${results.success} 个任务`);
    
    if (results.failed > 0) {
      console.log(`❌ 迁移失败: ${results.failed} 个任务`);
      console.log('请检查控制台错误信息');
    }
    
  } catch (error) {
    console.error('💥 迁移过程中发生错误:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  runMigration();
}

export { runMigration };
