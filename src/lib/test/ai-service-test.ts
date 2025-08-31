/**
 * AI服务测试
 * 验证新的AI任务生成器功能
 */

import { AITaskGenerator } from '@/lib/ai/task-generator';
import type { AITaskResponse, TaskPlan } from '@/lib/types/tasks';

export class AIServiceTest {
  private aiGenerator: AITaskGenerator;

  constructor() {
    this.aiGenerator = new AITaskGenerator();
  }

  /**
   * 测试时间范围提取
   */
  testTimeframeExtraction(): boolean {
    try {
      // 使用反射访问私有方法进行测试
      const extractTimeframe = (this.aiGenerator as any).extractTimeframe.bind(this.aiGenerator);

      // 测试用例
      const testCases = [
        { input: '3天内学会OSPF', expected: 3 },
        { input: '7天内完成项目', expected: 7 },
        { input: '30天内减肥10斤', expected: 30 },
        { input: '1天内完成作业', expected: 3 }, // 最小值限制
        { input: '50天内学会编程', expected: 30 }, // 最大值限制
        { input: '学会React', expected: 7 }, // 默认值
      ];

      for (const testCase of testCases) {
        const result = extractTimeframe(testCase.input);
        if (result !== testCase.expected) {
          throw new Error(`时间范围提取失败: "${testCase.input}" 期望 ${testCase.expected}, 实际 ${result}`);
        }
      }

      console.log('✅ 时间范围提取测试通过');
      return true;
    } catch (error) {
      console.error('❌ 时间范围提取测试失败:', error);
      return false;
    }
  }

  /**
   * 测试AI响应解析
   */
  testAIResponseParsing(): boolean {
    try {
      const parseAIResponse = (this.aiGenerator as any).parseAIResponse.bind(this.aiGenerator);

      const mockAIResponse = `总体规划：掌握OSPF路由协议核心概念和配置

里程碑计划：
里程碑1（第1天）：学习OSPF基础概念和工作原理
里程碑2（第2天）：掌握OSPF区域划分和LSA类型
里程碑3（第3天）：完成OSPF配置实验和故障排除

推荐标签：#网络技术 #路由协议`;

      const result: AITaskResponse = parseAIResponse(mockAIResponse);

      // 验证解析结果
      if (result.summary !== '掌握OSPF路由协议核心概念和配置') {
        throw new Error('总体规划解析失败');
      }

      if (result.milestones.length !== 3) {
        throw new Error(`里程碑数量错误，期望3个，实际${result.milestones.length}个`);
      }

      if (result.milestones[0].title !== '学习OSPF基础概念和工作原理') {
        throw new Error('第一个里程碑标题解析失败');
      }

      if (result.milestones[0].dayRange !== '第1天') {
        throw new Error('第一个里程碑天数范围解析失败');
      }

      if (result.tags.length !== 2 || !result.tags.includes('网络技术') || !result.tags.includes('路由协议')) {
        throw new Error('标签解析失败');
      }

      console.log('✅ AI响应解析测试通过');
      return true;
    } catch (error) {
      console.error('❌ AI响应解析测试失败:', error);
      return false;
    }
  }

  /**
   * 测试任务标题生成
   */
  testTaskTitleGeneration(): boolean {
    try {
      const generateTaskTitle = (this.aiGenerator as any).generateTaskTitle.bind(this.aiGenerator);

      const testCases = [
        { prompt: '3天内学会OSPF', timeframe: 3, expected: '3天内学会OSPF' },
        { prompt: '学会React', timeframe: 7, expected: '7天内学会React' },
        { prompt: '完成项目', timeframe: 14, expected: '14天内完成项目' }
      ];

      for (const testCase of testCases) {
        const result = generateTaskTitle(testCase.prompt, testCase.timeframe);
        if (result !== testCase.expected) {
          throw new Error(`标题生成失败: "${testCase.prompt}" 期望 "${testCase.expected}", 实际 "${result}"`);
        }
      }

      console.log('✅ 任务标题生成测试通过');
      return true;
    } catch (error) {
      console.error('❌ 任务标题生成测试失败:', error);
      return false;
    }
  }

  /**
   * 测试里程碑日期计算
   */
  testMilestoneDateCalculation(): boolean {
    try {
      const calculateMilestoneDate = (this.aiGenerator as any).calculateMilestoneDate.bind(this.aiGenerator);

      const today = new Date();
      
      // 测试不同的日期范围格式
      // 注意：calculateMilestoneDate返回的是范围结束日期
      const testCases = [
        { dayRange: '第1天', totalDays: 7, expectedDays: 1 },
        { dayRange: '第1-2天', totalDays: 7, expectedDays: 2 },
        { dayRange: '第3-5天', totalDays: 7, expectedDays: 5 },
        { dayRange: '第7天', totalDays: 7, expectedDays: 7 }
      ];

      for (const testCase of testCases) {
        const result = calculateMilestoneDate(testCase.dayRange, testCase.totalDays);
        
        // 验证返回的是Date对象
        if (!(result instanceof Date)) {
          throw new Error(`日期计算返回类型错误: ${typeof result}`);
        }

        // 验证日期是否正确（应该等于期望的天数）
        const daysDiff = Math.ceil((result.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff !== testCase.expectedDays) {
          throw new Error(`日期计算错误: 期望第${testCase.expectedDays}天，实际第${daysDiff}天`);
        }
      }

      console.log('✅ 里程碑日期计算测试通过');
      return true;
    } catch (error) {
      console.error('❌ 里程碑日期计算测试失败:', error);
      return false;
    }
  }

  /**
   * 测试描述格式化
   */
  testDescriptionFormatting(): boolean {
    try {
      const formatTaskDescription = (this.aiGenerator as any).formatTaskDescription.bind(this.aiGenerator);

      const mockAIResponse: AITaskResponse = {
        summary: '掌握OSPF路由协议核心概念和配置',
        milestones: [
          {
            title: '学习基础概念',
            description: '学习OSPF基础概念和工作原理',
            dayRange: '第1天'
          },
          {
            title: '实践配置',
            description: '完成OSPF配置实验',
            dayRange: '第2天'
          }
        ],
        tags: ['网络技术', '路由协议']
      };

      const result = formatTaskDescription(mockAIResponse);

      // 验证格式化结果包含所有必要信息
      if (!result.includes('总体规划：掌握OSPF路由协议核心概念和配置')) {
        throw new Error('格式化结果缺少总体规划');
      }

      if (!result.includes('里程碑计划：')) {
        throw new Error('格式化结果缺少里程碑计划标题');
      }

      if (!result.includes('里程碑1（第1天）：学习OSPF基础概念和工作原理')) {
        throw new Error('格式化结果缺少第一个里程碑');
      }

      if (!result.includes('推荐标签：#网络技术 #路由协议')) {
        throw new Error('格式化结果缺少推荐标签');
      }

      console.log('✅ 描述格式化测试通过');
      return true;
    } catch (error) {
      console.error('❌ 描述格式化测试失败:', error);
      return false;
    }
  }

  /**
   * 测试默认任务计划生成
   */
  testDefaultTaskPlanGeneration(): boolean {
    try {
      const generateDefaultTaskPlan = (this.aiGenerator as any).generateDefaultTaskPlan.bind(this.aiGenerator);

      const result: TaskPlan = generateDefaultTaskPlan('学会Python', 7);

      // 验证基本字段
      if (!result.title || !result.description || !result.originalPrompt) {
        throw new Error('默认任务计划缺少必要字段');
      }

      if (result.timeframeDays !== 7) {
        throw new Error('时间范围设置错误');
      }

      if (!Array.isArray(result.milestones) || result.milestones.length !== 3) {
        throw new Error('默认里程碑数量错误');
      }

      if (!Array.isArray(result.tags) || result.tags.length !== 2) {
        throw new Error('默认标签数量错误');
      }

      // 验证里程碑日期递增
      for (let i = 1; i < result.milestones.length; i++) {
        if (result.milestones[i].targetDate <= result.milestones[i-1].targetDate) {
          throw new Error('里程碑日期顺序错误');
        }
      }

      console.log('✅ 默认任务计划生成测试通过');
      return true;
    } catch (error) {
      console.error('❌ 默认任务计划生成测试失败:', error);
      return false;
    }
  }

  /**
   * 运行所有测试
   */
  runAllTests(): boolean {
    console.log('🧪 开始运行AI服务测试...\n');

    const tests = [
      this.testTimeframeExtraction.bind(this),
      this.testAIResponseParsing.bind(this),
      this.testTaskTitleGeneration.bind(this),
      this.testMilestoneDateCalculation.bind(this),
      this.testDescriptionFormatting.bind(this),
      this.testDefaultTaskPlanGeneration.bind(this)
    ];

    let passedCount = 0;
    let totalCount = tests.length;

    for (const test of tests) {
      if (test()) {
        passedCount++;
      }
    }

    console.log(`\n📊 测试结果: ${passedCount}/${totalCount} 通过`);

    if (passedCount === totalCount) {
      console.log('🎉 所有AI服务测试通过！');
      return true;
    } else {
      console.log('❌ 部分AI服务测试失败，请检查实现。');
      return false;
    }
  }
}

// 导出测试实例
export const aiServiceTest = new AIServiceTest();
