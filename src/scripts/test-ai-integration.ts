#!/usr/bin/env node

/**
 * AI服务集成测试脚本
 * 使用方法：npm run test:ai-integration
 */

import { aiIntegrationTest } from '@/lib/test/ai-integration-test';

async function runTests() {
  console.log('🚀 开始AI服务集成测试...\n');
  
  try {
    const allTestsPassed = await aiIntegrationTest.runAllTests();
    
    if (allTestsPassed) {
      console.log('\n✅ 所有AI服务集成测试通过！可以继续下一阶段开发。');
      process.exit(0);
    } else {
      console.log('\n❌ 部分AI服务集成测试失败，请修复后再继续。');
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
