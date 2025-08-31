#!/usr/bin/env node

/**
 * 端到端集成测试脚本
 * 使用方法：npm run test:end-to-end
 */

import { endToEndIntegrationTest } from '@/lib/test/end-to-end-integration-test';

async function runTests() {
  console.log('🚀 开始端到端集成测试...\n');
  
  try {
    const allTestsPassed = endToEndIntegrationTest.runAllTests();
    
    if (allTestsPassed) {
      console.log('\n✅ 所有端到端集成测试通过！系统功能完整可用。');
      process.exit(0);
    } else {
      console.log('\n❌ 部分端到端集成测试失败，请修复后再继续。');
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
