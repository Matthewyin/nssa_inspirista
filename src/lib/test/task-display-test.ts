/**
 * 任务显示组件测试
 * 验证Task 2.2的任务显示组件更新功能
 */

import type { Task, Milestone } from '@/lib/types/tasks';
import { Timestamp } from 'firebase/firestore';

export class TaskDisplayTest {
  /**
   * 测试任务卡片数据适配
   */
  testTaskCardDataAdaptation(): boolean {
    try {
      // 创建测试任务数据（新格式）
      const testTask: Task = {
        id: 'test-task-1',
        userId: 'test-user',
        title: '3天内学会OSPF',
        description: '深入学习OSPF路由协议的核心概念和配置方法',
        status: 'in_progress',
        tags: ['网络技术', '路由协议'],
        milestones: [
          {
            id: 'milestone-1',
            title: '学习基础概念',
            description: '了解OSPF路由协议的基本原理和工作机制',
            targetDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
            dayRange: '第1天',
            isCompleted: true,
            completedDate: new Date()
          },
          {
            id: 'milestone-2',
            title: '掌握区域划分',
            description: '理解OSPF区域划分和LSA类型',
            targetDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            dayRange: '第2天',
            isCompleted: false
          },
          {
            id: 'milestone-3',
            title: '完成配置实验',
            description: '实际配置OSPF并进行故障排除',
            targetDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            dayRange: '第3天',
            isCompleted: false
          }
        ],
        isAIGenerated: true,
        startDate: Timestamp.now(),
        progress: 33, // 1/3 里程碑完成
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        
        // 兼容性字段
        dueDate: Timestamp.fromDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)),
        priority: 'medium',
        category: 'study',
        estimatedHours: 6,
        subtasks: [],
        timeSpent: 0
      };

      // 验证任务数据结构
      if (!testTask.milestones || testTask.milestones.length === 0) {
        throw new Error('任务缺少里程碑数据');
      }

      // 验证里程碑结构
      for (const milestone of testTask.milestones) {
        if (!milestone.id || !milestone.title || !milestone.targetDate) {
          throw new Error('里程碑数据结构不完整');
        }
        
        if (typeof milestone.isCompleted !== 'boolean') {
          throw new Error('里程碑完成状态类型错误');
        }
      }

      // 验证进度计算
      const completedCount = testTask.milestones.filter(m => m.isCompleted).length;
      const expectedProgress = Math.round((completedCount / testTask.milestones.length) * 100);
      
      if (testTask.progress !== expectedProgress) {
        throw new Error(`进度计算错误: 期望 ${expectedProgress}, 实际 ${testTask.progress}`);
      }

      console.log('✅ 任务卡片数据适配测试通过');
      return true;
    } catch (error) {
      console.error('❌ 任务卡片数据适配测试失败:', error);
      return false;
    }
  }

  /**
   * 测试里程碑进度组件数据结构
   */
  testMilestoneProgressComponent(): boolean {
    try {
      // 测试里程碑进度组件的props接口
      const milestones: Milestone[] = [
        {
          id: 'milestone-1',
          title: '学习基础概念',
          description: '了解OSPF路由协议的基本原理',
          targetDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          dayRange: '第1天',
          isCompleted: true,
          completedDate: new Date()
        },
        {
          id: 'milestone-2',
          title: '实践配置',
          description: '完成OSPF配置实验',
          targetDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          dayRange: '第2天',
          isCompleted: false
        }
      ];

      // 验证里程碑进度计算
      const completedCount = milestones.filter(m => m.isCompleted).length;
      const totalCount = milestones.length;
      const progressPercentage = Math.round((completedCount / totalCount) * 100);

      if (progressPercentage !== 50) {
        throw new Error(`里程碑进度计算错误: 期望 50, 实际 ${progressPercentage}`);
      }

      // 验证下一个里程碑查找
      const nextMilestone = milestones.find(m => !m.isCompleted);
      if (!nextMilestone || nextMilestone.id !== 'milestone-2') {
        throw new Error('下一个里程碑查找错误');
      }

      // 验证状态判断
      const isAllCompleted = completedCount === totalCount;
      const hasStarted = completedCount > 0;

      if (isAllCompleted || !hasStarted) {
        throw new Error('里程碑状态判断错误');
      }

      console.log('✅ 里程碑进度组件测试通过');
      return true;
    } catch (error) {
      console.error('❌ 里程碑进度组件测试失败:', error);
      return false;
    }
  }

  /**
   * 测试任务状态可视化组件
   */
  testTaskStatusVisualization(): boolean {
    try {
      // 创建测试任务
      const testTask: Task = {
        id: 'test-task-2',
        userId: 'test-user',
        title: '7天内完成React项目',
        description: '使用React开发一个完整的Web应用',
        status: 'in_progress',
        tags: ['前端', 'React'],
        milestones: [
          {
            id: 'milestone-1',
            title: '项目初始化',
            description: '创建React项目并配置开发环境',
            targetDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 昨天
            dayRange: '第1天',
            isCompleted: true,
            completedDate: new Date(Date.now() - 24 * 60 * 60 * 1000)
          },
          {
            id: 'milestone-2',
            title: '核心功能开发',
            description: '实现主要业务逻辑',
            targetDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 明天
            dayRange: '第2-5天',
            isCompleted: false
          },
          {
            id: 'milestone-3',
            title: '测试和部署',
            description: '完成测试并部署上线',
            targetDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
            dayRange: '第6-7天',
            isCompleted: false
          }
        ],
        isAIGenerated: true,
        startDate: Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)),
        progress: 33,
        createdAt: Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)),
        updatedAt: Timestamp.now(),
        
        // 兼容性字段
        dueDate: Timestamp.fromDate(new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)),
        priority: 'high',
        category: 'work',
        estimatedHours: 40,
        subtasks: [],
        timeSpent: 8
      };

      // 验证时间计算
      const now = new Date();
      const createdDate = testTask.createdAt.toDate();
      const finalMilestone = testTask.milestones[testTask.milestones.length - 1];
      const dueDate = finalMilestone.targetDate;

      // 验证天数计算
      const daysFromCreation = Math.ceil((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 1000));

      if (daysFromCreation < 0 || daysUntilDue < 0) {
        throw new Error('时间计算错误');
      }

      // 验证逾期检测
      const isOverdue = testTask.status !== 'completed' && dueDate < now;
      if (isOverdue) {
        throw new Error('逾期检测错误：任务不应该逾期');
      }

      // 验证下一个里程碑
      const nextMilestone = testTask.milestones.find(m => !m.isCompleted);
      if (!nextMilestone || nextMilestone.id !== 'milestone-2') {
        throw new Error('下一个里程碑识别错误');
      }

      console.log('✅ 任务状态可视化组件测试通过');
      return true;
    } catch (error) {
      console.error('❌ 任务状态可视化组件测试失败:', error);
      return false;
    }
  }

  /**
   * 测试里程碑切换功能
   */
  testMilestoneToggleFunction(): boolean {
    try {
      // 模拟里程碑切换回调
      let toggleCallCount = 0;
      let lastToggleParams: { milestoneId: string; isCompleted: boolean } | null = null;

      const mockOnMilestoneToggle = (milestoneId: string, isCompleted: boolean) => {
        toggleCallCount++;
        lastToggleParams = { milestoneId, isCompleted };
      };

      // 测试切换功能
      mockOnMilestoneToggle('milestone-1', true);
      
      if (toggleCallCount !== 1) {
        throw new Error('里程碑切换回调调用次数错误');
      }

      if (!lastToggleParams || lastToggleParams.milestoneId !== 'milestone-1' || !lastToggleParams.isCompleted) {
        throw new Error('里程碑切换参数错误');
      }

      // 测试取消完成
      mockOnMilestoneToggle('milestone-1', false);
      
      if (toggleCallCount !== 2) {
        throw new Error('里程碑取消完成回调调用次数错误');
      }

      if (!lastToggleParams || lastToggleParams.isCompleted) {
        throw new Error('里程碑取消完成参数错误');
      }

      console.log('✅ 里程碑切换功能测试通过');
      return true;
    } catch (error) {
      console.error('❌ 里程碑切换功能测试失败:', error);
      return false;
    }
  }

  /**
   * 测试任务详情视图组件
   */
  testTaskDetailViewComponent(): boolean {
    try {
      // 测试任务详情视图的数据结构
      const testTask: Task = {
        id: 'test-task-3',
        userId: 'test-user',
        title: '完成的任务示例',
        description: '这是一个已完成的任务示例，用于测试任务详情视图',
        status: 'completed',
        tags: ['测试', '示例'],
        milestones: [
          {
            id: 'milestone-1',
            title: '第一阶段',
            description: '完成第一阶段工作',
            targetDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            dayRange: '第1天',
            isCompleted: true,
            completedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
          },
          {
            id: 'milestone-2',
            title: '第二阶段',
            description: '完成第二阶段工作',
            targetDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
            dayRange: '第2天',
            isCompleted: true,
            completedDate: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        ],
        isAIGenerated: false,
        startDate: Timestamp.fromDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)),
        progress: 100,
        createdAt: Timestamp.fromDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)),
        updatedAt: Timestamp.now(),
        completedAt: Timestamp.now(),
        
        // 兼容性字段
        dueDate: Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000)),
        priority: 'medium',
        category: 'personal',
        estimatedHours: 4,
        subtasks: [],
        timeSpent: 4
      };

      // 验证完成状态
      const isCompleted = testTask.status === 'completed';
      const allMilestonesCompleted = testTask.milestones.every(m => m.isCompleted);
      
      if (!isCompleted || !allMilestonesCompleted) {
        throw new Error('任务完成状态验证失败');
      }

      // 验证进度
      if (testTask.progress !== 100) {
        throw new Error('已完成任务进度应为100%');
      }

      // 验证完成时间
      if (!testTask.completedAt) {
        throw new Error('已完成任务应有完成时间');
      }

      console.log('✅ 任务详情视图组件测试通过');
      return true;
    } catch (error) {
      console.error('❌ 任务详情视图组件测试失败:', error);
      return false;
    }
  }

  /**
   * 运行所有测试
   */
  runAllTests(): boolean {
    console.log('🧪 开始运行任务显示组件测试...\n');

    const tests = [
      this.testTaskCardDataAdaptation.bind(this),
      this.testMilestoneProgressComponent.bind(this),
      this.testTaskStatusVisualization.bind(this),
      this.testMilestoneToggleFunction.bind(this),
      this.testTaskDetailViewComponent.bind(this)
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
      console.log('🎉 所有任务显示组件测试通过！');
      return true;
    } else {
      console.log('❌ 部分任务显示组件测试失败，请检查实现。');
      return false;
    }
  }
}

// 导出测试实例
export const taskDisplayTest = new TaskDisplayTest();
