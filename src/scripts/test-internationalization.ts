#!/usr/bin/env node

/**
 * 国际化功能测试脚本
 * 使用方法：npm run test:internationalization
 */

import { internationalizationTest } from '@/lib/test/internationalization-test';

async function runTests() {
  console.log('🚀 开始国际化功能测试...\n');
  
  try {
    const allTestsPassed = internationalizationTest.runAllTests();
    
    if (allTestsPassed) {
      console.log('\n✅ 所有国际化功能测试通过！翻译内容补充完成。');
      process.exit(0);
    } else {
      console.log('\n❌ 部分国际化功能测试失败，请修复后再继续。');
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
