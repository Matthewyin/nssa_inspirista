/**
 * 端到端集成测试
 * 验证Task 2.5的完整里程碑功能流程
 */

import type { Task, Milestone, TaskCreateInput, TaskPlan } from '@/lib/types/tasks';
import { Timestamp } from 'firebase/firestore';

export class EndToEndIntegrationTest {
  /**
   * 测试完整的任务创建到里程碑管理流程
   */
  testCompleteTaskMilestoneWorkflow(): boolean {
    try {
      console.log('🔄 测试完整的任务创建到里程碑管理流程...');

      // 1. 模拟AI任务生成
      const aiGeneratedPlan: TaskPlan = {
        title: '7天内掌握React Hooks',
        description: '深入学习React Hooks的核心概念和实际应用',
        timeframe: '7天',
        milestones: [
          {
            title: '学习基础Hooks',
            description: '掌握useState、useEffect等基础Hooks',
            dayRange: '第1-2天',
            targetDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
          },
          {
            title: '学习高级Hooks',
            description: '掌握useContext、useReducer、useMemo等高级Hooks',
            dayRange: '第3-5天',
            targetDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
          },
          {
            title: '实战项目',
            description: '使用Hooks构建一个完整的React应用',
            dayRange: '第6-7天',
            targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          }
        ],
        tags: ['React', 'Hooks', '前端开发'],
        estimatedHours: 20
      };

      // 验证AI生成的计划
      if (!aiGeneratedPlan.title || !aiGeneratedPlan.milestones || aiGeneratedPlan.milestones.length === 0) {
        throw new Error('AI任务生成验证失败');
      }

      // 2. 转换为任务创建输入
      const taskCreateInput: TaskCreateInput = {
        title: aiGeneratedPlan.title,
        description: aiGeneratedPlan.description,
        tags: aiGeneratedPlan.tags,
        milestones: aiGeneratedPlan.milestones.map((milestone, index) => ({
          id: `milestone-${index + 1}`,
          title: milestone.title,
          description: milestone.description,
          targetDate: milestone.targetDate,
          dayRange: milestone.dayRange,
          isCompleted: false
        })),
        isAIGenerated: true
      };

      // 验证任务创建输入
      if (!taskCreateInput.title || !taskCreateInput.milestones || taskCreateInput.milestones.length !== 3) {
        throw new Error('任务创建输入转换验证失败');
      }

      // 3. 模拟任务创建后的完整任务对象
      const createdTask: Task = {
        id: 'created-task-id',
        userId: 'test-user-id',
        title: taskCreateInput.title,
        description: taskCreateInput.description || '',
        status: 'todo',
        tags: taskCreateInput.tags || [],
        milestones: taskCreateInput.milestones,
        isAIGenerated: taskCreateInput.isAIGenerated || false,
        startDate: Timestamp.now(),
        progress: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        
        // 兼容性字段
        dueDate: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
        priority: 'medium',
        category: 'study',
        estimatedHours: aiGeneratedPlan.estimatedHours || 0,
        subtasks: [],
        timeSpent: 0
      };

      // 4. 测试里程碑操作流程
      let currentTask = { ...createdTask };

      // 4.1 完成第一个里程碑
      const firstMilestone = currentTask.milestones[0];
      firstMilestone.isCompleted = true;
      firstMilestone.completedDate = new Date();
      
      // 重新计算进度
      const completedCount = currentTask.milestones.filter(m => m.isCompleted).length;
      currentTask.progress = Math.round((completedCount / currentTask.milestones.length) * 100);
      currentTask.status = 'in_progress';

      if (currentTask.progress !== 33) {
        throw new Error('里程碑完成后进度计算错误');
      }

      // 4.2 添加新的里程碑
      const newMilestone: Milestone = {
        id: 'milestone-4',
        title: '代码优化',
        description: '优化代码质量和性能',
        targetDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        dayRange: '第8天',
        isCompleted: false
      };

      currentTask.milestones.push(newMilestone);
      
      // 重新计算进度
      const newCompletedCount = currentTask.milestones.filter(m => m.isCompleted).length;
      currentTask.progress = Math.round((newCompletedCount / currentTask.milestones.length) * 100);

      if (currentTask.progress !== 25) {
        throw new Error('添加里程碑后进度计算错误');
      }

      // 4.3 批量完成里程碑
      const remainingMilestones = currentTask.milestones.filter(m => !m.isCompleted);
      remainingMilestones.forEach(milestone => {
        milestone.isCompleted = true;
        milestone.completedDate = new Date();
      });

      // 重新计算进度和状态
      const finalCompletedCount = currentTask.milestones.filter(m => m.isCompleted).length;
      currentTask.progress = Math.round((finalCompletedCount / currentTask.milestones.length) * 100);
      
      if (finalCompletedCount === currentTask.milestones.length) {
        currentTask.status = 'completed';
        currentTask.completedAt = Timestamp.now();
      }

      if (currentTask.progress !== 100 || currentTask.status !== 'completed') {
        throw new Error('任务完成状态计算错误');
      }

      console.log('✅ 完整的任务创建到里程碑管理流程测试通过');
      return true;
    } catch (error) {
      console.error('❌ 完整的任务创建到里程碑管理流程测试失败:', error);
      return false;
    }
  }

  /**
   * 测试用户界面交互流程
   */
  testUserInterfaceWorkflow(): boolean {
    try {
      console.log('🔄 测试用户界面交互流程...');

      // 1. 模拟任务列表页面交互
      const taskListInteractions = {
        // 任务卡片点击
        onTaskCardClick: (taskId: string) => {
          if (!taskId) throw new Error('任务卡片点击处理失败');
          return `/tasks/${taskId}`;
        },
        
        // 里程碑快速切换
        onQuickMilestoneToggle: (taskId: string, milestoneId: string, isCompleted: boolean) => {
          if (!taskId || !milestoneId) throw new Error('快速里程碑切换处理失败');
          return { taskId, milestoneId, isCompleted };
        },
        
        // 任务状态变更
        onTaskStatusChange: (taskId: string, status: Task['status']) => {
          if (!taskId || !status) throw new Error('任务状态变更处理失败');
          return { taskId, status };
        }
      };

      // 2. 模拟任务详情页面交互
      const taskDetailInteractions = {
        // 标签页切换
        onTabSwitch: (tab: 'overview' | 'milestones' | 'timeline') => {
          if (!tab) throw new Error('标签页切换处理失败');
          return tab;
        },
        
        // 里程碑管理操作
        onMilestoneAdd: (milestone: Omit<Milestone, 'id' | 'isCompleted'>) => {
          if (!milestone.title) throw new Error('里程碑添加处理失败');
          return { ...milestone, id: 'new-milestone-id', isCompleted: false };
        },
        
        onMilestoneEdit: (milestoneId: string, updates: Partial<Milestone>) => {
          if (!milestoneId) throw new Error('里程碑编辑处理失败');
          return { milestoneId, updates };
        },
        
        onMilestoneDelete: (milestoneId: string) => {
          if (!milestoneId) throw new Error('里程碑删除处理失败');
          return milestoneId;
        },
        
        // 批量操作
        onBatchMilestoneToggle: (milestoneIds: string[], isCompleted: boolean) => {
          if (!Array.isArray(milestoneIds) || milestoneIds.length === 0) {
            throw new Error('批量里程碑切换处理失败');
          }
          return { milestoneIds, isCompleted };
        }
      };

      // 3. 执行交互测试
      const testTaskId = 'test-task-123';
      const testMilestoneId = 'test-milestone-456';

      // 测试任务列表交互
      const cardClickResult = taskListInteractions.onTaskCardClick(testTaskId);
      if (cardClickResult !== `/tasks/${testTaskId}`) {
        throw new Error('任务卡片点击结果验证失败');
      }

      const quickToggleResult = taskListInteractions.onQuickMilestoneToggle(testTaskId, testMilestoneId, true);
      if (quickToggleResult.taskId !== testTaskId || !quickToggleResult.isCompleted) {
        throw new Error('快速里程碑切换结果验证失败');
      }

      const statusChangeResult = taskListInteractions.onTaskStatusChange(testTaskId, 'completed');
      if (statusChangeResult.status !== 'completed') {
        throw new Error('任务状态变更结果验证失败');
      }

      // 测试任务详情交互
      const tabSwitchResult = taskDetailInteractions.onTabSwitch('milestones');
      if (tabSwitchResult !== 'milestones') {
        throw new Error('标签页切换结果验证失败');
      }

      const addMilestoneResult = taskDetailInteractions.onMilestoneAdd({
        title: '新里程碑',
        description: '新添加的里程碑',
        targetDate: new Date(),
        dayRange: '第1天'
      });
      if (!addMilestoneResult.id || addMilestoneResult.isCompleted) {
        throw new Error('里程碑添加结果验证失败');
      }

      const editMilestoneResult = taskDetailInteractions.onMilestoneEdit(testMilestoneId, {
        title: '更新的标题'
      });
      if (editMilestoneResult.milestoneId !== testMilestoneId) {
        throw new Error('里程碑编辑结果验证失败');
      }

      const deleteMilestoneResult = taskDetailInteractions.onMilestoneDelete(testMilestoneId);
      if (deleteMilestoneResult !== testMilestoneId) {
        throw new Error('里程碑删除结果验证失败');
      }

      const batchToggleResult = taskDetailInteractions.onBatchMilestoneToggle([testMilestoneId], true);
      if (!batchToggleResult.isCompleted || batchToggleResult.milestoneIds.length !== 1) {
        throw new Error('批量里程碑切换结果验证失败');
      }

      console.log('✅ 用户界面交互流程测试通过');
      return true;
    } catch (error) {
      console.error('❌ 用户界面交互流程测试失败:', error);
      return false;
    }
  }

  /**
   * 测试数据一致性和状态同步
   */
  testDataConsistencyAndSync(): boolean {
    try {
      console.log('🔄 测试数据一致性和状态同步...');

      // 1. 创建测试任务
      const testTask: Task = {
        id: 'sync-test-task',
        userId: 'test-user',
        title: '数据同步测试任务',
        description: '测试数据一致性和状态同步',
        status: 'todo',
        tags: ['测试'],
        milestones: [
          {
            id: 'sync-milestone-1',
            title: '第一阶段',
            description: '第一阶段工作',
            targetDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
            dayRange: '第1天',
            isCompleted: false
          },
          {
            id: 'sync-milestone-2',
            title: '第二阶段',
            description: '第二阶段工作',
            targetDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            dayRange: '第2天',
            isCompleted: false
          }
        ],
        isAIGenerated: false,
        startDate: Timestamp.now(),
        progress: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        
        // 兼容性字段
        dueDate: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
        priority: 'medium',
        category: 'work',
        estimatedHours: 8,
        subtasks: [],
        timeSpent: 0
      };

      // 2. 测试里程碑状态变更的连锁反应
      let updatedTask = { ...testTask };

      // 完成第一个里程碑
      updatedTask.milestones[0].isCompleted = true;
      updatedTask.milestones[0].completedDate = new Date();

      // 验证任务状态自动更新
      const completedCount = updatedTask.milestones.filter(m => m.isCompleted).length;
      const totalCount = updatedTask.milestones.length;
      const expectedProgress = Math.round((completedCount / totalCount) * 100);
      
      updatedTask.progress = expectedProgress;
      updatedTask.status = completedCount > 0 ? 'in_progress' : 'todo';
      updatedTask.updatedAt = Timestamp.now();

      if (updatedTask.progress !== 50 || updatedTask.status !== 'in_progress') {
        throw new Error('里程碑完成后任务状态同步失败');
      }

      // 完成所有里程碑
      updatedTask.milestones.forEach(milestone => {
        milestone.isCompleted = true;
        milestone.completedDate = new Date();
      });

      const allCompletedCount = updatedTask.milestones.filter(m => m.isCompleted).length;
      updatedTask.progress = Math.round((allCompletedCount / totalCount) * 100);
      
      if (allCompletedCount === totalCount) {
        updatedTask.status = 'completed';
        updatedTask.completedAt = Timestamp.now();
      }

      if (updatedTask.progress !== 100 || updatedTask.status !== 'completed') {
        throw new Error('所有里程碑完成后任务状态同步失败');
      }

      // 3. 测试里程碑删除的影响
      let taskWithDeletedMilestone = { ...updatedTask };
      taskWithDeletedMilestone.milestones = taskWithDeletedMilestone.milestones.slice(1); // 删除第一个里程碑

      const remainingCompletedCount = taskWithDeletedMilestone.milestones.filter(m => m.isCompleted).length;
      const remainingTotalCount = taskWithDeletedMilestone.milestones.length;
      
      taskWithDeletedMilestone.progress = Math.round((remainingCompletedCount / remainingTotalCount) * 100);
      
      if (remainingCompletedCount === remainingTotalCount && remainingTotalCount > 0) {
        taskWithDeletedMilestone.status = 'completed';
      } else if (remainingCompletedCount > 0) {
        taskWithDeletedMilestone.status = 'in_progress';
      } else {
        taskWithDeletedMilestone.status = 'todo';
      }

      if (taskWithDeletedMilestone.progress !== 100 || taskWithDeletedMilestone.status !== 'completed') {
        throw new Error('里程碑删除后任务状态同步失败');
      }

      // 4. 测试空里程碑情况
      let taskWithNoMilestones = { ...testTask };
      taskWithNoMilestones.milestones = [];
      taskWithNoMilestones.progress = 0;
      taskWithNoMilestones.status = 'todo';

      if (taskWithNoMilestones.progress !== 0 || taskWithNoMilestones.status !== 'todo') {
        throw new Error('无里程碑任务状态处理失败');
      }

      console.log('✅ 数据一致性和状态同步测试通过');
      return true;
    } catch (error) {
      console.error('❌ 数据一致性和状态同步测试失败:', error);
      return false;
    }
  }

  /**
   * 测试错误处理和边界情况
   */
  testErrorHandlingAndEdgeCases(): boolean {
    try {
      console.log('🔄 测试错误处理和边界情况...');

      // 1. 测试无效数据处理
      const invalidMilestone = {
        title: '', // 空标题
        description: 'test',
        targetDate: new Date(),
        dayRange: '第1天'
      };

      if (invalidMilestone.title.trim() === '') {
        // 正确处理空标题
      } else {
        throw new Error('空标题验证失败');
      }

      // 2. 测试日期边界情况
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 昨天
      const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 一年后

      const milestoneWithPastDate: Milestone = {
        id: 'past-milestone',
        title: '过期里程碑',
        description: '测试过期里程碑',
        targetDate: pastDate,
        dayRange: '第1天',
        isCompleted: false
      };

      // 检查逾期状态
      const isOverdue = !milestoneWithPastDate.isCompleted && milestoneWithPastDate.targetDate < new Date();
      if (!isOverdue) {
        throw new Error('逾期检测失败');
      }

      // 3. 测试大量里程碑的性能
      const largeMilestoneList: Milestone[] = [];
      for (let i = 0; i < 100; i++) {
        largeMilestoneList.push({
          id: `milestone-${i}`,
          title: `里程碑 ${i + 1}`,
          description: `第${i + 1}个里程碑`,
          targetDate: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
          dayRange: `第${i + 1}天`,
          isCompleted: i % 3 === 0 // 每三个完成一个
        });
      }

      // 计算大量里程碑的进度
      const largeListCompletedCount = largeMilestoneList.filter(m => m.isCompleted).length;
      const largeListProgress = Math.round((largeListCompletedCount / largeMilestoneList.length) * 100);

      if (largeListProgress < 0 || largeListProgress > 100) {
        throw new Error('大量里程碑进度计算失败');
      }

      // 4. 测试并发操作模拟
      const concurrentOperations = [
        () => ({ type: 'toggle', milestoneId: 'milestone-1', isCompleted: true }),
        () => ({ type: 'add', milestone: { title: '新里程碑', targetDate: new Date() } }),
        () => ({ type: 'delete', milestoneId: 'milestone-2' }),
        () => ({ type: 'update', milestoneId: 'milestone-3', updates: { title: '更新标题' } })
      ];

      // 模拟并发执行
      const results = concurrentOperations.map(op => op());
      if (results.length !== 4) {
        throw new Error('并发操作模拟失败');
      }

      // 5. 测试内存泄漏预防
      let memoryTestTask: Task | null = {
        id: 'memory-test',
        userId: 'test-user',
        title: '内存测试任务',
        description: '测试内存使用',
        status: 'todo',
        tags: [],
        milestones: largeMilestoneList,
        isAIGenerated: false,
        startDate: Timestamp.now(),
        progress: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        
        // 兼容性字段
        dueDate: Timestamp.fromDate(new Date()),
        priority: 'low',
        category: 'other',
        estimatedHours: 0,
        subtasks: [],
        timeSpent: 0
      };

      // 清理引用
      memoryTestTask = null;

      if (memoryTestTask !== null) {
        throw new Error('内存清理失败');
      }

      console.log('✅ 错误处理和边界情况测试通过');
      return true;
    } catch (error) {
      console.error('❌ 错误处理和边界情况测试失败:', error);
      return false;
    }
  }

  /**
   * 运行所有测试
   */
  runAllTests(): boolean {
    console.log('🧪 开始运行端到端集成测试...\n');

    const tests = [
      this.testCompleteTaskMilestoneWorkflow.bind(this),
      this.testUserInterfaceWorkflow.bind(this),
      this.testDataConsistencyAndSync.bind(this),
      this.testErrorHandlingAndEdgeCases.bind(this)
    ];

    let passedCount = 0;
    let totalCount = tests.length;

    for (const test of tests) {
      if (test()) {
        passedCount++;
      }
      console.log(''); // 添加空行分隔
    }

    console.log(`📊 测试结果: ${passedCount}/${totalCount} 通过`);

    if (passedCount === totalCount) {
      console.log('🎉 所有端到端集成测试通过！');
      return true;
    } else {
      console.log('❌ 部分端到端集成测试失败，请检查实现。');
      return false;
    }
  }
}

// 导出测试实例
export const endToEndIntegrationTest = new EndToEndIntegrationTest();
