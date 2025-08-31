/**
 * 任务数据结构测试
 * 验证新的Task和Milestone接口是否正确工作
 */

import { Timestamp } from 'firebase/firestore';
import type { Task, Milestone, TaskPlan, TaskCreateInput, AITaskResponse } from '@/lib/types/tasks';

export class TaskStructureTest {
  
  /**
   * 测试Milestone接口
   */
  testMilestoneInterface(): boolean {
    try {
      const milestone: Milestone = {
        id: 'test-milestone-1',
        title: '学习OSPF基础概念',
        description: '掌握OSPF路由协议的基本原理和工作机制',
        targetDate: new Date('2025-01-10'),
        isCompleted: false,
        dayRange: '第1天'
      };

      // 验证必填字段
      if (!milestone.id || !milestone.title || !milestone.description) {
        throw new Error('Milestone必填字段验证失败');
      }

      // 验证日期类型
      if (!(milestone.targetDate instanceof Date)) {
        throw new Error('Milestone日期类型验证失败');
      }

      console.log('✅ Milestone接口测试通过');
      return true;
    } catch (error) {
      console.error('❌ Milestone接口测试失败:', error);
      return false;
    }
  }

  /**
   * 测试Task接口
   */
  testTaskInterface(): boolean {
    try {
      const milestones: Milestone[] = [
        {
          id: 'milestone-1',
          title: '基础学习',
          description: '学习OSPF基础概念',
          targetDate: new Date('2025-01-10'),
          isCompleted: false,
          dayRange: '第1天'
        },
        {
          id: 'milestone-2',
          title: '实践配置',
          description: '完成OSPF配置实验',
          targetDate: new Date('2025-01-11'),
          isCompleted: false,
          dayRange: '第2天'
        }
      ];

      const task: Task = {
        id: 'test-task-1',
        userId: 'test-user-1',
        title: '3天内学会OSPF',
        description: `总体规划：掌握OSPF路由协议核心概念和配置

里程碑计划：
里程碑1（第1天）：学习OSPF基础概念和工作原理
里程碑2（第2天）：掌握OSPF区域划分和LSA类型
里程碑3（第3天）：完成OSPF配置实验和故障排除

推荐标签：#网络技术 #路由协议`,
        status: 'todo',
        tags: ['网络技术', '路由协议'],
        milestones,
        isAIGenerated: true,
        aiPrompt: '3天内学会OSPF',
        startDate: Timestamp.fromDate(new Date('2025-01-09')),
        progress: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      // 验证必填字段
      if (!task.id || !task.userId || !task.title || !task.description) {
        throw new Error('Task必填字段验证失败');
      }

      // 验证里程碑数组
      if (!Array.isArray(task.milestones) || task.milestones.length === 0) {
        throw new Error('Task里程碑数组验证失败');
      }

      // 验证状态枚举
      const validStatuses = ['todo', 'in_progress', 'completed', 'cancelled'];
      if (!validStatuses.includes(task.status)) {
        throw new Error('Task状态枚举验证失败');
      }

      console.log('✅ Task接口测试通过');
      return true;
    } catch (error) {
      console.error('❌ Task接口测试失败:', error);
      return false;
    }
  }

  /**
   * 测试TaskPlan接口
   */
  testTaskPlanInterface(): boolean {
    try {
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
            description: '掌握OSPF路由协议的基本原理',
            targetDate: new Date('2025-01-10'),
            dayRange: '第1天'
          },
          {
            title: '掌握OSPF区域划分',
            description: '理解OSPF区域划分和LSA类型',
            targetDate: new Date('2025-01-11'),
            dayRange: '第2天'
          }
        ],
        originalPrompt: '3天内学会OSPF',
        timeframeDays: 3
      };

      // 验证必填字段
      if (!taskPlan.title || !taskPlan.description || !taskPlan.originalPrompt) {
        throw new Error('TaskPlan必填字段验证失败');
      }

      // 验证里程碑数组
      if (!Array.isArray(taskPlan.milestones) || taskPlan.milestones.length === 0) {
        throw new Error('TaskPlan里程碑数组验证失败');
      }

      // 验证时间范围
      if (typeof taskPlan.timeframeDays !== 'number' || taskPlan.timeframeDays <= 0) {
        throw new Error('TaskPlan时间范围验证失败');
      }

      console.log('✅ TaskPlan接口测试通过');
      return true;
    } catch (error) {
      console.error('❌ TaskPlan接口测试失败:', error);
      return false;
    }
  }

  /**
   * 测试AITaskResponse接口
   */
  testAITaskResponseInterface(): boolean {
    try {
      const aiResponse: AITaskResponse = {
        summary: '掌握OSPF路由协议核心概念和配置',
        milestones: [
          {
            title: '学习OSPF基础概念',
            description: '掌握OSPF路由协议的基本原理和工作机制',
            dayRange: '第1天'
          },
          {
            title: '掌握OSPF区域划分',
            description: '理解OSPF区域划分和LSA类型',
            dayRange: '第2天'
          }
        ],
        tags: ['网络技术', '路由协议']
      };

      // 验证必填字段
      if (!aiResponse.summary || !Array.isArray(aiResponse.milestones) || !Array.isArray(aiResponse.tags)) {
        throw new Error('AITaskResponse字段验证失败');
      }

      // 验证里程碑结构
      for (const milestone of aiResponse.milestones) {
        if (!milestone.title || !milestone.description || !milestone.dayRange) {
          throw new Error('AITaskResponse里程碑结构验证失败');
        }
      }

      console.log('✅ AITaskResponse接口测试通过');
      return true;
    } catch (error) {
      console.error('❌ AITaskResponse接口测试失败:', error);
      return false;
    }
  }

  /**
   * 测试TaskCreateInput接口
   */
  testTaskCreateInputInterface(): boolean {
    try {
      const createInput: TaskCreateInput = {
        title: '学习React Hooks',
        description: '深入学习React Hooks的使用方法',
        isAIGenerated: false,
        tags: ['前端', 'React']
      };

      // 验证必填字段
      if (!createInput.title || !createInput.description) {
        throw new Error('TaskCreateInput必填字段验证失败');
      }

      console.log('✅ TaskCreateInput接口测试通过');
      return true;
    } catch (error) {
      console.error('❌ TaskCreateInput接口测试失败:', error);
      return false;
    }
  }

  /**
   * 测试进度计算逻辑
   */
  testProgressCalculation(): boolean {
    try {
      const milestones: Milestone[] = [
        {
          id: '1',
          title: '里程碑1',
          description: '第一个里程碑',
          targetDate: new Date(),
          isCompleted: true,
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

      const completedCount = milestones.filter(m => m.isCompleted).length;
      const progress = Math.round((completedCount / milestones.length) * 100);

      if (progress !== 33) {
        throw new Error(`进度计算错误，期望33，实际${progress}`);
      }

      console.log('✅ 进度计算逻辑测试通过');
      return true;
    } catch (error) {
      console.error('❌ 进度计算逻辑测试失败:', error);
      return false;
    }
  }

  /**
   * 运行所有测试
   */
  runAllTests(): boolean {
    console.log('🧪 开始运行任务数据结构测试...\n');

    const tests = [
      this.testMilestoneInterface.bind(this),
      this.testTaskInterface.bind(this),
      this.testTaskPlanInterface.bind(this),
      this.testAITaskResponseInterface.bind(this),
      this.testTaskCreateInputInterface.bind(this),
      this.testProgressCalculation.bind(this)
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
      console.log('🎉 所有测试通过！数据结构设计正确。');
      return true;
    } else {
      console.log('❌ 部分测试失败，请检查数据结构设计。');
      return false;
    }
  }
}

// 导出测试实例
export const taskStructureTest = new TaskStructureTest();
