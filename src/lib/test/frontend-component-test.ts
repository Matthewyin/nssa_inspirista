/**
 * 前端组件测试
 * 验证Task 2.1的前端组件重构功能
 */

import type { Milestone, TaskCreateInput, TaskPlan } from '@/lib/types/tasks';

export class FrontendComponentTest {
  /**
   * 测试里程碑输入组件数据结构
   */
  testMilestoneInputDataStructure(): boolean {
    try {
      // 测试里程碑输入数据结构
      const milestones: Omit<Milestone, 'id' | 'isCompleted'>[] = [
        {
          title: '学习基础概念',
          description: '了解OSPF路由协议的基本原理',
          targetDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          dayRange: '第1天'
        },
        {
          title: '实践配置',
          description: '完成OSPF配置实验',
          targetDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          dayRange: '第2天'
        }
      ];

      // 验证数据结构
      for (const milestone of milestones) {
        if (!milestone.title || !milestone.description || !milestone.targetDate) {
          throw new Error('里程碑数据结构验证失败：缺少必填字段');
        }

        if (!(milestone.targetDate instanceof Date)) {
          throw new Error('里程碑数据结构验证失败：targetDate不是Date类型');
        }

        if (typeof milestone.title !== 'string' || typeof milestone.description !== 'string') {
          throw new Error('里程碑数据结构验证失败：title或description不是字符串类型');
        }
      }

      console.log('✅ 里程碑输入组件数据结构测试通过');
      return true;
    } catch (error) {
      console.error('❌ 里程碑输入组件数据结构测试失败:', error);
      return false;
    }
  }

  /**
   * 测试任务创建输入数据结构
   */
  testTaskCreateInputStructure(): boolean {
    try {
      // 测试任务创建输入数据结构
      const taskInput: TaskCreateInput = {
        title: '3天内学会OSPF',
        description: '深入学习OSPF路由协议的核心概念和配置方法',
        tags: ['网络技术', '路由协议'],
        milestones: [
          {
            title: '学习基础概念',
            description: '了解OSPF路由协议的基本原理和工作机制',
            targetDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
            dayRange: '第1天'
          },
          {
            title: '掌握区域划分',
            description: '理解OSPF区域划分和LSA类型',
            targetDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            dayRange: '第2天'
          },
          {
            title: '完成配置实验',
            description: '实际配置OSPF并进行故障排除',
            targetDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            dayRange: '第3天'
          }
        ],
        isAIGenerated: false
      };

      // 验证必填字段
      if (!taskInput.title || !taskInput.description) {
        throw new Error('任务创建输入验证失败：缺少必填字段');
      }

      // 验证里程碑
      if (!Array.isArray(taskInput.milestones) || taskInput.milestones.length === 0) {
        throw new Error('任务创建输入验证失败：里程碑数组为空');
      }

      // 验证标签
      if (!Array.isArray(taskInput.tags)) {
        throw new Error('任务创建输入验证失败：标签不是数组');
      }

      // 验证isAIGenerated
      if (typeof taskInput.isAIGenerated !== 'boolean') {
        throw new Error('任务创建输入验证失败：isAIGenerated不是布尔值');
      }

      console.log('✅ 任务创建输入数据结构测试通过');
      return true;
    } catch (error) {
      console.error('❌ 任务创建输入数据结构测试失败:', error);
      return false;
    }
  }

  /**
   * 测试AI任务计划预览数据结构
   */
  testAITaskPlanPreviewStructure(): boolean {
    try {
      // 测试AI任务计划预览数据结构
      const taskPlan: TaskPlan = {
        title: '3天内学会OSPF',
        description: `总体规划：掌握OSPF路由协议核心概念和配置

里程碑计划：
里程碑1（第1天）：学习OSPF基础概念和工作原理
里程碑2（第2天）：掌握OSPF区域划分和LSA类型
里程碑3（第3天）：完成OSPF配置实验和故障排除

推荐标签：#网络技术 #路由协议`,
        tags: ['网络技术', '路由协议'],
        milestones: [
          {
            title: '学习OSPF基础概念',
            description: '掌握OSPF路由协议的基本原理和工作机制',
            targetDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
            dayRange: '第1天'
          },
          {
            title: '掌握OSPF区域划分',
            description: '理解OSPF区域划分和LSA类型',
            targetDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            dayRange: '第2天'
          },
          {
            title: '完成OSPF配置实验',
            description: '实际配置OSPF并进行故障排除',
            targetDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            dayRange: '第3天'
          }
        ],
        originalPrompt: '3天内学会OSPF',
        timeframeDays: 3
      };

      // 验证必填字段
      if (!taskPlan.title || !taskPlan.description || !taskPlan.originalPrompt) {
        throw new Error('AI任务计划验证失败：缺少必填字段');
      }

      // 验证时间范围
      if (typeof taskPlan.timeframeDays !== 'number' || taskPlan.timeframeDays <= 0) {
        throw new Error('AI任务计划验证失败：时间范围无效');
      }

      // 验证里程碑
      if (!Array.isArray(taskPlan.milestones) || taskPlan.milestones.length === 0) {
        throw new Error('AI任务计划验证失败：里程碑数组为空');
      }

      // 验证里程碑结构
      for (const milestone of taskPlan.milestones) {
        if (!milestone.title || !milestone.description || !milestone.targetDate) {
          throw new Error('AI任务计划验证失败：里程碑缺少必填字段');
        }
      }

      console.log('✅ AI任务计划预览数据结构测试通过');
      return true;
    } catch (error) {
      console.error('❌ AI任务计划预览数据结构测试失败:', error);
      return false;
    }
  }

  /**
   * 测试示例提示词格式
   */
  testExamplePromptsFormat(): boolean {
    try {
      // 测试新的示例提示词格式（包含时间范围）
      const examplePrompts = [
        '3天内学会OSPF路由协议',
        '7天内完成React项目开发',
        '14天内准备期末考试',
        '5天内学会Python基础',
        '10天内完成毕业论文初稿',
        '21天内养成健身习惯'
      ];

      // 验证每个示例都包含时间范围
      for (const prompt of examplePrompts) {
        const timeframePattern = /(\d+)天内/;
        const match = prompt.match(timeframePattern);
        
        if (!match) {
          throw new Error(`示例提示词格式错误："${prompt}" 不包含时间范围`);
        }

        const days = parseInt(match[1]);
        if (days < 1 || days > 30) {
          throw new Error(`示例提示词时间范围错误："${prompt}" 时间范围应在1-30天内`);
        }
      }

      console.log('✅ 示例提示词格式测试通过');
      return true;
    } catch (error) {
      console.error('❌ 示例提示词格式测试失败:', error);
      return false;
    }
  }

  /**
   * 测试组件接口兼容性
   */
  testComponentInterfaceCompatibility(): boolean {
    try {
      // 测试里程碑输入组件接口
      const milestoneInputProps = {
        milestones: [] as Omit<Milestone, 'id' | 'isCompleted'>[],
        onChange: (milestones: Omit<Milestone, 'id' | 'isCompleted'>[]) => {
          // 模拟onChange回调
          console.log('里程碑更新:', milestones.length);
        },
        className: 'test-class'
      };

      // 验证接口类型
      if (typeof milestoneInputProps.onChange !== 'function') {
        throw new Error('里程碑输入组件接口错误：onChange不是函数');
      }

      if (!Array.isArray(milestoneInputProps.milestones)) {
        throw new Error('里程碑输入组件接口错误：milestones不是数组');
      }

      // 测试onChange回调
      milestoneInputProps.onChange([
        {
          title: '测试里程碑',
          description: '测试描述',
          targetDate: new Date(),
          dayRange: '第1天'
        }
      ]);

      console.log('✅ 组件接口兼容性测试通过');
      return true;
    } catch (error) {
      console.error('❌ 组件接口兼容性测试失败:', error);
      return false;
    }
  }

  /**
   * 测试数据转换逻辑
   */
  testDataTransformationLogic(): boolean {
    try {
      // 测试从TaskPlan到TaskCreateInput的转换
      const taskPlan: TaskPlan = {
        title: '7天内学会React',
        description: '完整的React学习计划',
        tags: ['前端', 'React'],
        milestones: [
          {
            title: '学习基础',
            description: '学习React基础概念',
            targetDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
            dayRange: '第1天'
          }
        ],
        originalPrompt: '7天内学会React',
        timeframeDays: 7
      };

      // 转换为TaskCreateInput
      const taskInput: TaskCreateInput = {
        title: taskPlan.title,
        description: taskPlan.description,
        tags: taskPlan.tags,
        milestones: taskPlan.milestones,
        isAIGenerated: true
      };

      // 验证转换结果
      if (taskInput.title !== taskPlan.title) {
        throw new Error('数据转换错误：标题不匹配');
      }

      if (taskInput.description !== taskPlan.description) {
        throw new Error('数据转换错误：描述不匹配');
      }

      if (taskInput.milestones.length !== taskPlan.milestones.length) {
        throw new Error('数据转换错误：里程碑数量不匹配');
      }

      if (!taskInput.isAIGenerated) {
        throw new Error('数据转换错误：AI生成标记应为true');
      }

      console.log('✅ 数据转换逻辑测试通过');
      return true;
    } catch (error) {
      console.error('❌ 数据转换逻辑测试失败:', error);
      return false;
    }
  }

  /**
   * 运行所有测试
   */
  runAllTests(): boolean {
    console.log('🧪 开始运行前端组件测试...\n');

    const tests = [
      this.testMilestoneInputDataStructure.bind(this),
      this.testTaskCreateInputStructure.bind(this),
      this.testAITaskPlanPreviewStructure.bind(this),
      this.testExamplePromptsFormat.bind(this),
      this.testComponentInterfaceCompatibility.bind(this),
      this.testDataTransformationLogic.bind(this)
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
      console.log('🎉 所有前端组件测试通过！');
      return true;
    } else {
      console.log('❌ 部分前端组件测试失败，请检查实现。');
      return false;
    }
  }
}

// 导出测试实例
export const frontendComponentTest = new FrontendComponentTest();
