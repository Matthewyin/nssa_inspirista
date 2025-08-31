/**
 * 综合测试套件
 * 验证整个里程碑功能系统的完整性
 */

import { taskDisplayTest } from './task-display-test';
import { milestoneManagementTest } from './milestone-management-test';
import { backendIntegrationTest } from './backend-integration-test';
import { endToEndIntegrationTest } from './end-to-end-integration-test';

export class ComprehensiveTestSuite {
  private testResults: Map<string, boolean> = new Map();
  private testTimes: Map<string, number> = new Map();

  /**
   * 运行所有测试套件
   */
  async runAllTests(): Promise<boolean> {
    console.log('🧪 开始运行综合测试套件...\n');
    console.log('=' .repeat(60));
    
    const testSuites = [
      {
        name: 'Task Display Components',
        description: '任务显示组件测试',
        test: () => taskDisplayTest.runAllTests()
      },
      {
        name: 'Milestone Management',
        description: '里程碑管理组件测试',
        test: () => milestoneManagementTest.runAllTests()
      },
      {
        name: 'Backend Integration',
        description: '后端服务集成测试',
        test: () => backendIntegrationTest.runAllTests()
      },
      {
        name: 'End-to-End Integration',
        description: '端到端集成测试',
        test: () => endToEndIntegrationTest.runAllTests()
      }
    ];

    let totalPassed = 0;
    let totalTests = testSuites.length;

    for (const suite of testSuites) {
      console.log(`\n🔍 运行测试套件: ${suite.description}`);
      console.log('-'.repeat(40));
      
      const startTime = performance.now();
      const passed = suite.test();
      const endTime = performance.now();
      const duration = endTime - startTime;

      this.testResults.set(suite.name, passed);
      this.testTimes.set(suite.name, duration);

      if (passed) {
        totalPassed++;
        console.log(`✅ ${suite.description} - 通过 (${duration.toFixed(2)}ms)`);
      } else {
        console.log(`❌ ${suite.description} - 失败 (${duration.toFixed(2)}ms)`);
      }
    }

    console.log('\n' + '='.repeat(60));
    this.printSummary(totalPassed, totalTests);
    
    return totalPassed === totalTests;
  }

  /**
   * 打印测试摘要
   */
  private printSummary(passed: number, total: number): void {
    console.log('\n📊 测试摘要报告');
    console.log('='.repeat(60));
    
    // 总体结果
    const successRate = Math.round((passed / total) * 100);
    console.log(`总体结果: ${passed}/${total} 通过 (${successRate}%)`);
    
    if (passed === total) {
      console.log('🎉 所有测试通过！系统功能完整可用。');
    } else {
      console.log('⚠️  部分测试失败，请检查相关功能。');
    }

    // 详细结果
    console.log('\n📋 详细测试结果:');
    for (const [testName, result] of this.testResults) {
      const time = this.testTimes.get(testName) || 0;
      const status = result ? '✅ 通过' : '❌ 失败';
      console.log(`  ${status} ${testName} (${time.toFixed(2)}ms)`);
    }

    // 性能统计
    const totalTime = Array.from(this.testTimes.values()).reduce((sum, time) => sum + time, 0);
    console.log(`\n⏱️  总执行时间: ${totalTime.toFixed(2)}ms`);

    // 系统状态
    console.log('\n🔧 系统状态检查:');
    this.checkSystemHealth();
  }

  /**
   * 检查系统健康状态
   */
  private checkSystemHealth(): void {
    const healthChecks = [
      {
        name: '前端组件',
        check: () => this.testResults.get('Task Display Components') === true
      },
      {
        name: '里程碑管理',
        check: () => this.testResults.get('Milestone Management') === true
      },
      {
        name: '后端集成',
        check: () => this.testResults.get('Backend Integration') === true
      },
      {
        name: '端到端流程',
        check: () => this.testResults.get('End-to-End Integration') === true
      }
    ];

    for (const healthCheck of healthChecks) {
      const status = healthCheck.check() ? '🟢 正常' : '🔴 异常';
      console.log(`  ${status} ${healthCheck.name}`);
    }

    // 整体健康评分
    const healthyComponents = healthChecks.filter(check => check.check()).length;
    const healthScore = Math.round((healthyComponents / healthChecks.length) * 100);
    
    console.log(`\n💊 系统健康评分: ${healthScore}%`);
    
    if (healthScore === 100) {
      console.log('🎯 系统状态优秀，所有功能正常运行！');
    } else if (healthScore >= 75) {
      console.log('⚠️  系统状态良好，但有部分功能需要关注。');
    } else {
      console.log('🚨 系统状态需要改进，请优先修复失败的功能。');
    }
  }

  /**
   * 生成测试报告
   */
  generateReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: this.testResults.size,
        passedTests: Array.from(this.testResults.values()).filter(Boolean).length,
        totalTime: Array.from(this.testTimes.values()).reduce((sum, time) => sum + time, 0)
      },
      results: Array.from(this.testResults.entries()).map(([name, passed]) => ({
        testSuite: name,
        status: passed ? 'PASSED' : 'FAILED',
        duration: this.testTimes.get(name) || 0
      })),
      recommendations: this.generateRecommendations()
    };

    return JSON.stringify(report, null, 2);
  }

  /**
   * 生成改进建议
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    if (!this.testResults.get('Task Display Components')) {
      recommendations.push('检查任务显示组件的数据绑定和状态管理');
    }
    
    if (!this.testResults.get('Milestone Management')) {
      recommendations.push('验证里程碑管理组件的CRUD操作和事件处理');
    }
    
    if (!this.testResults.get('Backend Integration')) {
      recommendations.push('检查Firebase服务集成和数据同步机制');
    }
    
    if (!this.testResults.get('End-to-End Integration')) {
      recommendations.push('验证完整的用户操作流程和数据一致性');
    }

    // 性能建议
    const totalTime = Array.from(this.testTimes.values()).reduce((sum, time) => sum + time, 0);
    if (totalTime > 5000) {
      recommendations.push('考虑优化测试执行性能，当前执行时间较长');
    }

    if (recommendations.length === 0) {
      recommendations.push('所有测试通过，系统运行良好！');
    }

    return recommendations;
  }

  /**
   * 运行特定测试套件
   */
  runSpecificTest(testName: string): boolean {
    const testMap = {
      'task-display': () => taskDisplayTest.runAllTests(),
      'milestone-management': () => milestoneManagementTest.runAllTests(),
      'backend-integration': () => backendIntegrationTest.runAllTests(),
      'end-to-end': () => endToEndIntegrationTest.runAllTests()
    };

    const test = testMap[testName as keyof typeof testMap];
    if (!test) {
      console.error(`❌ 未找到测试套件: ${testName}`);
      console.log('可用的测试套件:', Object.keys(testMap).join(', '));
      return false;
    }

    console.log(`🔍 运行特定测试套件: ${testName}`);
    const startTime = performance.now();
    const result = test();
    const endTime = performance.now();
    
    console.log(`\n⏱️  执行时间: ${(endTime - startTime).toFixed(2)}ms`);
    return result;
  }

  /**
   * 清理测试结果
   */
  clearResults(): void {
    this.testResults.clear();
    this.testTimes.clear();
  }

  /**
   * 获取测试结果
   */
  getResults(): { results: Map<string, boolean>; times: Map<string, number> } {
    return {
      results: new Map(this.testResults),
      times: new Map(this.testTimes)
    };
  }
}

// 导出测试套件实例
export const comprehensiveTestSuite = new ComprehensiveTestSuite();
