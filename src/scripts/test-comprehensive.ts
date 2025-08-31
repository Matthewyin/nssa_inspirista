#!/usr/bin/env node

/**
 * 综合测试脚本
 * 使用方法：npm run test:comprehensive
 */

import { comprehensiveTestSuite } from '@/lib/test/comprehensive-test-suite';

async function runTests() {
  console.log('🚀 开始综合测试套件...\n');
  
  try {
    const allTestsPassed = await comprehensiveTestSuite.runAllTests();
    
    // 生成测试报告
    const report = comprehensiveTestSuite.generateReport();
    
    // 保存报告到文件（如果在Node.js环境中）
    if (typeof require !== 'undefined') {
      try {
        const fs = require('fs');
        const path = require('path');
        
        const reportsDir = path.join(process.cwd(), 'test-reports');
        if (!fs.existsSync(reportsDir)) {
          fs.mkdirSync(reportsDir, { recursive: true });
        }
        
        const reportFile = path.join(reportsDir, `test-report-${Date.now()}.json`);
        fs.writeFileSync(reportFile, report);
        
        console.log(`\n📄 测试报告已保存到: ${reportFile}`);
      } catch (error) {
        console.warn('⚠️  无法保存测试报告:', error);
      }
    }
    
    if (allTestsPassed) {
      console.log('\n✅ 所有综合测试通过！系统功能完整可用。');
      console.log('🎉 恭喜！您的里程碑功能已经准备就绪。');
      process.exit(0);
    } else {
      console.log('\n❌ 部分综合测试失败，请修复后再继续。');
      console.log('💡 请查看上方的详细错误信息和建议。');
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
