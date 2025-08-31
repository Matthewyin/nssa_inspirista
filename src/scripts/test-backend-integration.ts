#!/usr/bin/env node

/**
 * 后端服务集成测试脚本
 * 使用方法：npm run test:backend-integration
 */

import { backendIntegrationTest } from '@/lib/test/backend-integration-test';

async function runTests() {
  console.log('🚀 开始后端服务集成测试...\n');
  
  try {
    const allTestsPassed = backendIntegrationTest.runAllTests();
    
    if (allTestsPassed) {
      console.log('\n✅ 所有后端服务集成测试通过！可以继续下一阶段开发。');
      process.exit(0);
    } else {
      console.log('\n❌ 部分后端服务集成测试失败，请修复后再继续。');
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
