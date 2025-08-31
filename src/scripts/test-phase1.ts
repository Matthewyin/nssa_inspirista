#!/usr/bin/env node

/**
 * Phase 1 综合测试脚本
 * 运行所有Phase 1相关的测试
 * 使用方法：npm run test:phase1
 */

import { taskStructureTest } from '@/lib/test/task-structure-test';
import { aiServiceTest } from '@/lib/test/ai-service-test';
import { aiIntegrationTest } from '@/lib/test/ai-integration-test';
import { firebaseServiceTest } from '@/lib/test/firebase-service-test';

async function runPhase1Tests() {
  console.log('🚀 开始Phase 1综合测试...\n');
  console.log('📋 Phase 1: 数据结构和后端服务测试');
  console.log('包含: 数据结构、AI服务、Firebase服务、集成测试\n');
  
  const testSuites = [
    {
      name: 'Task 1.1 - 数据结构测试',
      test: () => taskStructureTest.runAllTests()
    },
    {
      name: 'Task 1.2 - AI服务测试',
      test: () => aiServiceTest.runAllTests()
    },
    {
      name: 'Task 1.2 - AI集成测试',
      test: async () => await aiIntegrationTest.runAllTests()
    },
    {
      name: 'Task 1.3 - Firebase服务测试',
      test: () => firebaseServiceTest.runAllTests()
    }
  ];

  let passedSuites = 0;
  let totalSuites = testSuites.length;
  const results: { name: string; passed: boolean; error?: any }[] = [];

  for (const suite of testSuites) {
    console.log(`\n🔍 运行测试套件: ${suite.name}`);
    console.log('─'.repeat(50));
    
    try {
      const passed = await suite.test();
      results.push({ name: suite.name, passed });
      
      if (passed) {
        passedSuites++;
        console.log(`✅ ${suite.name} - 通过`);
      } else {
        console.log(`❌ ${suite.name} - 失败`);
      }
    } catch (error) {
      results.push({ name: suite.name, passed: false, error });
      console.error(`💥 ${suite.name} - 执行错误:`, error);
    }
  }

  // 输出综合结果
  console.log('\n' + '='.repeat(60));
  console.log('📊 Phase 1 综合测试结果');
  console.log('='.repeat(60));
  
  for (const result of results) {
    const status = result.passed ? '✅ 通过' : '❌ 失败';
    console.log(`${status} - ${result.name}`);
    if (result.error) {
      console.log(`   错误: ${result.error.message || result.error}`);
    }
  }

  console.log('\n📈 总体统计:');
  console.log(`通过: ${passedSuites}/${totalSuites} 个测试套件`);
  console.log(`成功率: ${Math.round((passedSuites / totalSuites) * 100)}%`);

  if (passedSuites === totalSuites) {
    console.log('\n🎉 Phase 1 所有测试通过！');
    console.log('✨ 数据结构和后端服务开发完成');
    console.log('🚀 可以继续Phase 2: 前端组件重构');
    return true;
  } else {
    console.log('\n⚠️  Phase 1 部分测试失败');
    console.log('🔧 请修复失败的测试后再继续Phase 2');
    return false;
  }
}

async function main() {
  try {
    const success = await runPhase1Tests();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('\n💥 Phase 1测试执行失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

export { runPhase1Tests };
