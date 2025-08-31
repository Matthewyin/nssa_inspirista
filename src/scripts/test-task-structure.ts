#!/usr/bin/env node

/**
 * 任务数据结构测试脚本
 * 使用方法：npm run test:task-structure
 */

import { taskStructureTest } from '@/lib/test/task-structure-test';

async function runTests() {
  console.log('🚀 开始任务数据结构测试...\n');
  
  try {
    const allTestsPassed = taskStructureTest.runAllTests();
    
    if (allTestsPassed) {
      console.log('\n✅ 所有测试通过！可以继续下一阶段开发。');
      process.exit(0);
    } else {
      console.log('\n❌ 部分测试失败，请修复后再继续。');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n💥 测试过程中发生错误:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  runTests();
}

export { runTests };
