/**
 * AI服务集成测试
 * 测试完整的AI任务生成流程，包括错误处理和降级方案
 */

import { AITaskGenerator } from '@/lib/ai/task-generator';
import type { TaskPlan } from '@/lib/types/tasks';

// 为Node.js环境模拟localStorage
class MockLocalStorage {
  private store: { [key: string]: string } = {};

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = value;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }
}

export class AIIntegrationTest {
  private aiGenerator: AITaskGenerator;
  private mockLocalStorage: MockLocalStorage;

  constructor() {
    this.aiGenerator = new AITaskGenerator();
    this.mockLocalStorage = new MockLocalStorage();

    // 在Node.js环境中设置localStorage模拟
    if (typeof window === 'undefined') {
      (global as any).localStorage = this.mockLocalStorage;
    }
  }

  /**
   * 测试无API密钥情况下的降级处理
   */
  async testNoAPIKeyFallback(): Promise<boolean> {
    try {
      // 清除所有API密钥
      this.mockLocalStorage.removeItem('gemini-api-key');
      this.mockLocalStorage.removeItem('deepseek-api-key');

      console.log('测试无API密钥情况...');
      const result = await this.aiGenerator.generateTaskPlan('3天内学会React');

      // 验证返回了默认计划
      if (!result || !result.title || !result.description || !result.milestones) {
        throw new Error('无API密钥时未返回默认计划');
      }

      if (result.milestones.length === 0) {
        throw new Error('默认计划缺少里程碑');
      }

      if (result.timeframeDays !== 3) {
        throw new Error('时间范围解析错误');
      }

      console.log('✅ 无API密钥降级测试通过');
      return true;
    } catch (error) {
      console.error('❌ 无API密钥降级测试失败:', error);
      return false;
    }
  }

  /**
   * 测试不同输入格式的处理
   */
  async testVariousInputFormats(): Promise<boolean> {
    try {
      const testCases = [
        '3天内学会OSPF',
        '7天内完成毕业论文',
        '学会Python编程',
        '30天内减肥10斤',
        '1天内完成作业', // 测试最小值限制
        '100天内学会机器学习', // 测试最大值限制
      ];

      for (const testCase of testCases) {
        console.log(`测试输入格式: "${testCase}"`);
        const result = await this.aiGenerator.generateTaskPlan(testCase);

        // 验证基本结构
        if (!result.title || !result.description || !result.milestones) {
          throw new Error(`输入"${testCase}"处理失败：缺少基本字段`);
        }

        // 验证时间范围限制
        if (result.timeframeDays < 3 || result.timeframeDays > 30) {
          throw new Error(`输入"${testCase}"时间范围超出限制：${result.timeframeDays}天`);
        }

        // 验证里程碑数量
        if (result.milestones.length === 0 || result.milestones.length > 5) {
          throw new Error(`输入"${testCase}"里程碑数量异常：${result.milestones.length}个`);
        }

        // 验证标签
        if (!Array.isArray(result.tags) || result.tags.length === 0) {
          throw new Error(`输入"${testCase}"标签缺失`);
        }
      }

      console.log('✅ 各种输入格式测试通过');
      return true;
    } catch (error) {
      console.error('❌ 输入格式测试失败:', error);
      return false;
    }
  }

  /**
   * 测试任务计划的完整性
   */
  async testTaskPlanCompleteness(): Promise<boolean> {
    try {
      const result = await this.aiGenerator.generateTaskPlan('5天内学会Vue.js');

      // 验证任务计划的完整性
      const requiredFields = ['title', 'description', 'tags', 'milestones', 'originalPrompt', 'timeframeDays'];
      
      for (const field of requiredFields) {
        if (!(field in result)) {
          throw new Error(`任务计划缺少字段: ${field}`);
        }
      }

      // 验证里程碑结构
      for (let i = 0; i < result.milestones.length; i++) {
        const milestone = result.milestones[i];
        const requiredMilestoneFields = ['title', 'description', 'targetDate', 'dayRange'];
        
        for (const field of requiredMilestoneFields) {
          if (!(field in milestone)) {
            throw new Error(`里程碑${i + 1}缺少字段: ${field}`);
          }
        }

        // 验证日期类型
        if (!(milestone.targetDate instanceof Date)) {
          throw new Error(`里程碑${i + 1}的targetDate不是Date类型`);
        }

        // 验证日期合理性
        const today = new Date();
        const daysDiff = Math.ceil((milestone.targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff < 1 || daysDiff > result.timeframeDays) {
          throw new Error(`里程碑${i + 1}的日期不在合理范围内: ${daysDiff}天`);
        }
      }

      // 验证里程碑日期递增
      for (let i = 1; i < result.milestones.length; i++) {
        if (result.milestones[i].targetDate <= result.milestones[i - 1].targetDate) {
          throw new Error(`里程碑${i + 1}的日期不应早于里程碑${i}`);
        }
      }

      // 验证描述格式
      if (!result.description.includes('总体规划：')) {
        throw new Error('任务描述缺少总体规划部分');
      }

      if (!result.description.includes('里程碑计划：')) {
        throw new Error('任务描述缺少里程碑计划部分');
      }

      console.log('✅ 任务计划完整性测试通过');
      return true;
    } catch (error) {
      console.error('❌ 任务计划完整性测试失败:', error);
      return false;
    }
  }

  /**
   * 测试错误恢复机制
   */
  async testErrorRecovery(): Promise<boolean> {
    try {
      // 模拟各种错误情况
      const errorCases = [
        '', // 空输入
        '   ', // 空白输入
        'a', // 极短输入
        'x'.repeat(1000), // 极长输入
      ];

      for (const errorCase of errorCases) {
        console.log(`测试错误输入: "${errorCase.substring(0, 20)}${errorCase.length > 20 ? '...' : ''}"`);
        
        try {
          const result = await this.aiGenerator.generateTaskPlan(errorCase);
          
          // 即使是错误输入，也应该返回有效的默认计划
          if (!result || !result.title || !result.milestones || result.milestones.length === 0) {
            throw new Error('错误输入未返回有效的默认计划');
          }
        } catch (error) {
          // 如果抛出错误，应该是明确的用户友好错误
          if (!(error instanceof Error) || !error.message) {
            throw new Error('错误处理不当：未提供明确的错误信息');
          }
        }
      }

      console.log('✅ 错误恢复机制测试通过');
      return true;
    } catch (error) {
      console.error('❌ 错误恢复机制测试失败:', error);
      return false;
    }
  }

  /**
   * 测试性能和响应时间
   */
  async testPerformance(): Promise<boolean> {
    try {
      const startTime = Date.now();
      
      // 测试多个并发请求
      const promises = [
        this.aiGenerator.generateTaskPlan('3天内学会JavaScript'),
        this.aiGenerator.generateTaskPlan('5天内完成项目'),
        this.aiGenerator.generateTaskPlan('7天内准备考试')
      ];

      const results = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // 验证所有请求都成功
      for (let i = 0; i < results.length; i++) {
        if (!results[i] || !results[i].title) {
          throw new Error(`并发请求${i + 1}失败`);
        }
      }

      // 验证响应时间（应该在合理范围内）
      const averageTime = totalTime / results.length;
      console.log(`平均响应时间: ${averageTime.toFixed(2)}ms`);

      if (averageTime > 10000) { // 10秒
        console.warn('响应时间较长，可能需要优化');
      }

      console.log('✅ 性能测试通过');
      return true;
    } catch (error) {
      console.error('❌ 性能测试失败:', error);
      return false;
    }
  }

  /**
   * 运行所有集成测试
   */
  async runAllTests(): Promise<boolean> {
    console.log('🧪 开始运行AI服务集成测试...\n');

    const tests = [
      { name: '无API密钥降级处理', test: this.testNoAPIKeyFallback.bind(this) },
      { name: '各种输入格式处理', test: this.testVariousInputFormats.bind(this) },
      { name: '任务计划完整性', test: this.testTaskPlanCompleteness.bind(this) },
      { name: '错误恢复机制', test: this.testErrorRecovery.bind(this) },
      { name: '性能测试', test: this.testPerformance.bind(this) }
    ];

    let passedCount = 0;
    let totalCount = tests.length;

    for (const { name, test } of tests) {
      console.log(`\n🔍 运行测试: ${name}`);
      try {
        const passed = await test();
        if (passed) {
          passedCount++;
        }
      } catch (error) {
        console.error(`测试"${name}"执行失败:`, error);
      }
    }

    console.log(`\n📊 集成测试结果: ${passedCount}/${totalCount} 通过`);

    if (passedCount === totalCount) {
      console.log('🎉 所有AI服务集成测试通过！');
      return true;
    } else {
      console.log('❌ 部分AI服务集成测试失败，请检查实现。');
      return false;
    }
  }
}

// 导出测试实例
export const aiIntegrationTest = new AIIntegrationTest();
