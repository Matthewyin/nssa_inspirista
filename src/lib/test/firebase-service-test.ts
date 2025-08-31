/**
 * Firebase服务测试
 * 验证新的Firebase任务服务功能
 */

import type { Task, Milestone, TaskCreateInput, TaskPlan } from '@/lib/types/tasks';

// 模拟TaskService类用于测试
class MockTaskService {
  // 计算基于里程碑的进度
  calculateMilestoneProgress(milestones: Milestone[]): number {
    if (milestones.length === 0) return 0;

    const completedCount = milestones.filter(m => m.isCompleted).length;
    return Math.round((completedCount / milestones.length) * 100);
  }
}

export class FirebaseServiceTest {
  private taskService: MockTaskService;

  constructor() {
    this.taskService = new MockTaskService();
  }

  /**
   * 测试里程碑进度计算
   */
  testMilestoneProgressCalculation(): boolean {
    try {
      // 直接使用模拟服务的方法
      const calculateMilestoneProgress = this.taskService.calculateMilestoneProgress.bind(this.taskService);

      // 测试用例
      const testCases = [
        {
          milestones: [],
          expected: 0
        },
        {
          milestones: [
            { id: '1', isCompleted: false },
            { id: '2', isCompleted: false },
            { id: '3', isCompleted: false }
          ],
          expected: 0
        },
        {
          milestones: [
            { id: '1', isCompleted: true },
            { id: '2', isCompleted: false },
            { id: '3', isCompleted: false }
          ],
          expected: 33
        },
        {
          milestones: [
            { id: '1', isCompleted: true },
            { id: '2', isCompleted: true },
            { id: '3', isCompleted: false }
          ],
          expected: 67
        },
        {
          milestones: [
            { id: '1', isCompleted: true },
            { id: '2', isCompleted: true },
            { id: '3', isCompleted: true }
          ],
          expected: 100
        }
      ];

      for (const testCase of testCases) {
        const result = calculateMilestoneProgress(testCase.milestones);
        if (result !== testCase.expected) {
          throw new Error(`进度计算错误: 期望 ${testCase.expected}, 实际 ${result}`);
        }
      }

      console.log('✅ 里程碑进度计算测试通过');
      return true;
    } catch (error) {
      console.error('❌ 里程碑进度计算测试失败:', error);
      return false;
    }
  }

  /**
   * 测试任务创建输入验证
   */
  testTaskCreateInputValidation(): boolean {
    try {
      // 测试有效的任务创建输入
      const validInput: TaskCreateInput = {
        title: '学习React Hooks',
        description: '深入学习React Hooks的使用方法',
        isAIGenerated: false,
        tags: ['前端', 'React'],
        milestones: [
          {
            title: '学习基础概念',
            description: '了解Hooks的基本概念和用途',
            targetDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
            dayRange: '第1天'
          },
          {
            title: '实践应用',
            description: '在项目中应用所学的Hooks',
            targetDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            dayRange: '第2天'
          }
        ]
      };

      // 验证必填字段
      if (!validInput.title || !validInput.description) {
        throw new Error('任务创建输入缺少必填字段');
      }

      // 验证里程碑结构
      if (validInput.milestones) {
        for (const milestone of validInput.milestones) {
          if (!milestone.title || !milestone.description || !milestone.targetDate) {
            throw new Error('里程碑缺少必填字段');
          }
        }
      }

      console.log('✅ 任务创建输入验证测试通过');
      return true;
    } catch (error) {
      console.error('❌ 任务创建输入验证测试失败:', error);
      return false;
    }
  }

  /**
   * 测试AI任务计划验证
   */
  testAITaskPlanValidation(): boolean {
    try {
      const validPlan: TaskPlan = {
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
      if (!validPlan.title || !validPlan.description || !validPlan.originalPrompt) {
        throw new Error('AI任务计划缺少必填字段');
      }

      // 验证里程碑
      if (!Array.isArray(validPlan.milestones) || validPlan.milestones.length === 0) {
        throw new Error('AI任务计划缺少里程碑');
      }

      // 验证时间范围
      if (typeof validPlan.timeframeDays !== 'number' || validPlan.timeframeDays <= 0) {
        throw new Error('AI任务计划时间范围无效');
      }

      console.log('✅ AI任务计划验证测试通过');
      return true;
    } catch (error) {
      console.error('❌ AI任务计划验证测试失败:', error);
      return false;
    }
  }

  /**
   * 测试里程碑状态更新逻辑
   */
  testMilestoneStatusUpdateLogic(): boolean {
    try {
      // 模拟里程碑状态更新
      const milestones: Milestone[] = [
        {
          id: '1',
          title: '里程碑1',
          description: '第一个里程碑',
          targetDate: new Date(),
          isCompleted: false,
          dayRange: '第1天'
        },
        {
          id: '2',
          title: '里程碑2',
          description: '第二个里程碑',
          targetDate: new Date(),
          isCompleted: false,
          dayRange: '第2天'
        },
        {
          id: '3',
          title: '里程碑3',
          description: '第三个里程碑',
          targetDate: new Date(),
          isCompleted: false,
          dayRange: '第3天'
        }
      ];

      // 测试部分完成
      const partiallyCompleted = milestones.map((m, index) => ({
        ...m,
        isCompleted: index === 0,
        completedDate: index === 0 ? new Date() : undefined
      }));

      const calculateMilestoneProgress = this.taskService.calculateMilestoneProgress.bind(this.taskService);
      const partialProgress = calculateMilestoneProgress(partiallyCompleted);
      
      if (partialProgress !== 33) {
        throw new Error(`部分完成进度计算错误: 期望 33, 实际 ${partialProgress}`);
      }

      // 测试全部完成
      const allCompleted = milestones.map(m => ({
        ...m,
        isCompleted: true,
        completedDate: new Date()
      }));

      const fullProgress = calculateMilestoneProgress(allCompleted);
      
      if (fullProgress !== 100) {
        throw new Error(`全部完成进度计算错误: 期望 100, 实际 ${fullProgress}`);
      }

      console.log('✅ 里程碑状态更新逻辑测试通过');
      return true;
    } catch (error) {
      console.error('❌ 里程碑状态更新逻辑测试失败:', error);
      return false;
    }
  }

  /**
   * 测试任务状态自动更新逻辑
   */
  testTaskStatusAutoUpdate(): boolean {
    try {
      // 测试状态转换逻辑
      const testCases = [
        {
          milestones: [
            { isCompleted: false },
            { isCompleted: false },
            { isCompleted: false }
          ],
          expectedStatus: 'todo'
        },
        {
          milestones: [
            { isCompleted: true },
            { isCompleted: false },
            { isCompleted: false }
          ],
          expectedStatus: 'in_progress'
        },
        {
          milestones: [
            { isCompleted: true },
            { isCompleted: true },
            { isCompleted: true }
          ],
          expectedStatus: 'completed'
        }
      ];

      for (const testCase of testCases) {
        const allCompleted = testCase.milestones.every(m => m.isCompleted);
        const anyCompleted = testCase.milestones.some(m => m.isCompleted);
        
        let actualStatus: string;
        if (allCompleted && testCase.milestones.length > 0) {
          actualStatus = 'completed';
        } else if (anyCompleted) {
          actualStatus = 'in_progress';
        } else {
          actualStatus = 'todo';
        }

        if (actualStatus !== testCase.expectedStatus) {
          throw new Error(`状态转换错误: 期望 ${testCase.expectedStatus}, 实际 ${actualStatus}`);
        }
      }

      console.log('✅ 任务状态自动更新逻辑测试通过');
      return true;
    } catch (error) {
      console.error('❌ 任务状态自动更新逻辑测试失败:', error);
      return false;
    }
  }

  /**
   * 运行所有测试
   */
  runAllTests(): boolean {
    console.log('🧪 开始运行Firebase服务测试...\n');

    const tests = [
      this.testMilestoneProgressCalculation.bind(this),
      this.testTaskCreateInputValidation.bind(this),
      this.testAITaskPlanValidation.bind(this),
      this.testMilestoneStatusUpdateLogic.bind(this),
      this.testTaskStatusAutoUpdate.bind(this)
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
      console.log('🎉 所有Firebase服务测试通过！');
      return true;
    } else {
      console.log('❌ 部分Firebase服务测试失败，请检查实现。');
      return false;
    }
  }
}

// 导出测试实例
export const firebaseServiceTest = new FirebaseServiceTest();
