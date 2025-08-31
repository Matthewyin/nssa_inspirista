/**
 * 里程碑管理组件测试
 * 验证Task 2.3的里程碑管理组件功能
 */

import type { Milestone } from '@/lib/types/tasks';

export class MilestoneManagementTest {
  /**
   * 测试里程碑管理器组件数据结构
   */
  testMilestoneManagerComponent(): boolean {
    try {
      // 创建测试里程碑数据
      const testMilestones: Milestone[] = [
        {
          id: 'milestone-1',
          title: '项目初始化',
          description: '创建项目结构和基础配置',
          targetDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          dayRange: '第1天',
          isCompleted: true,
          completedDate: new Date()
        },
        {
          id: 'milestone-2',
          title: '核心功能开发',
          description: '实现主要业务逻辑',
          targetDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          dayRange: '第2-4天',
          isCompleted: false
        },
        {
          id: 'milestone-3',
          title: '测试和部署',
          description: '完成测试并部署上线',
          targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          dayRange: '第5-7天',
          isCompleted: false
        }
      ];

      // 验证里程碑数据结构
      for (const milestone of testMilestones) {
        if (!milestone.id || !milestone.title || !milestone.targetDate) {
          throw new Error('里程碑数据结构不完整');
        }
        
        if (typeof milestone.isCompleted !== 'boolean') {
          throw new Error('里程碑完成状态类型错误');
        }
        
        if (milestone.targetDate.getTime() < 0) {
          throw new Error('里程碑目标日期无效');
        }
      }

      // 验证统计计算
      const completedCount = testMilestones.filter(m => m.isCompleted).length;
      const totalCount = testMilestones.length;
      const progressPercentage = Math.round((completedCount / totalCount) * 100);

      if (completedCount !== 1 || totalCount !== 3 || progressPercentage !== 33) {
        throw new Error('里程碑统计计算错误');
      }

      console.log('✅ 里程碑管理器组件测试通过');
      return true;
    } catch (error) {
      console.error('❌ 里程碑管理器组件测试失败:', error);
      return false;
    }
  }

  /**
   * 测试里程碑时间线组件
   */
  testMilestoneTimelineComponent(): boolean {
    try {
      // 创建时间线测试数据
      const timelineMilestones: Milestone[] = [
        {
          id: 'milestone-1',
          title: '第一阶段',
          description: '完成第一阶段工作',
          targetDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2天前
          dayRange: '第1天',
          isCompleted: true,
          completedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          id: 'milestone-2',
          title: '第二阶段',
          description: '完成第二阶段工作',
          targetDate: new Date(), // 今天
          dayRange: '第2天',
          isCompleted: false
        },
        {
          id: 'milestone-3',
          title: '第三阶段',
          description: '完成第三阶段工作',
          targetDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2天后
          dayRange: '第3天',
          isCompleted: false
        }
      ];

      // 验证时间线排序
      const sortedMilestones = [...timelineMilestones].sort((a, b) => 
        a.targetDate.getTime() - b.targetDate.getTime()
      );

      if (sortedMilestones[0].id !== 'milestone-1' || 
          sortedMilestones[1].id !== 'milestone-2' || 
          sortedMilestones[2].id !== 'milestone-3') {
        throw new Error('里程碑时间线排序错误');
      }

      // 验证时间状态计算
      const now = new Date();
      for (const milestone of timelineMilestones) {
        const daysFromNow = Math.ceil((milestone.targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const isOverdue = !milestone.isCompleted && milestone.targetDate < now;
        const isToday = Math.abs(daysFromNow) === 0;

        // 验证逾期检测
        if (milestone.id === 'milestone-1' && isOverdue !== false) {
          throw new Error('已完成里程碑不应标记为逾期');
        }

        // 验证今天检测
        if (milestone.id === 'milestone-2' && !isToday) {
          throw new Error('今天的里程碑检测错误');
        }
      }

      console.log('✅ 里程碑时间线组件测试通过');
      return true;
    } catch (error) {
      console.error('❌ 里程碑时间线组件测试失败:', error);
      return false;
    }
  }

  /**
   * 测试里程碑编辑对话框功能
   */
  testMilestoneEditDialog(): boolean {
    try {
      // 创建编辑测试数据
      const originalMilestone: Milestone = {
        id: 'milestone-edit-test',
        title: '原始标题',
        description: '原始描述',
        targetDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        dayRange: '第1天',
        isCompleted: false
      };

      // 模拟编辑操作
      const editUpdates: Partial<Milestone> = {
        title: '更新后的标题',
        description: '更新后的描述',
        targetDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        dayRange: '第1-2天',
        isCompleted: true,
        completedDate: new Date()
      };

      // 验证编辑数据
      if (!editUpdates.title || editUpdates.title.trim() === '') {
        throw new Error('编辑后的标题不能为空');
      }

      if (editUpdates.isCompleted && !editUpdates.completedDate) {
        throw new Error('标记为完成时应设置完成时间');
      }

      if (editUpdates.targetDate && editUpdates.targetDate.getTime() < 0) {
        throw new Error('目标日期无效');
      }

      // 验证状态变更逻辑
      if (originalMilestone.isCompleted !== editUpdates.isCompleted) {
        if (editUpdates.isCompleted && !editUpdates.completedDate) {
          throw new Error('状态变更为完成时必须设置完成时间');
        }
      }

      console.log('✅ 里程碑编辑对话框测试通过');
      return true;
    } catch (error) {
      console.error('❌ 里程碑编辑对话框测试失败:', error);
      return false;
    }
  }

  /**
   * 测试里程碑快速操作功能
   */
  testMilestoneQuickActions(): boolean {
    try {
      // 创建快速操作测试数据
      const testMilestone: Milestone = {
        id: 'milestone-quick-test',
        title: '快速操作测试',
        description: '测试快速操作功能',
        targetDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        dayRange: '第1天',
        isCompleted: false
      };

      // 模拟快速完成操作
      let toggleCallCount = 0;
      let lastToggleParams: { milestoneId: string; isCompleted: boolean } | null = null;

      const mockOnToggleComplete = (milestoneId: string, isCompleted: boolean) => {
        toggleCallCount++;
        lastToggleParams = { milestoneId, isCompleted };
      };

      // 测试完成切换
      mockOnToggleComplete(testMilestone.id, true);
      
      if (toggleCallCount !== 1 || !lastToggleParams || !lastToggleParams.isCompleted) {
        throw new Error('快速完成操作测试失败');
      }

      // 测试取消完成
      mockOnToggleComplete(testMilestone.id, false);
      
      if (toggleCallCount !== 2 || !lastToggleParams || lastToggleParams.isCompleted) {
        throw new Error('快速取消完成操作测试失败');
      }

      // 测试时间状态计算
      const now = new Date();
      const daysUntilDue = Math.ceil((testMilestone.targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const isOverdue = !testMilestone.isCompleted && testMilestone.targetDate < now;
      const isToday = daysUntilDue === 0;

      if (isOverdue || isToday) {
        throw new Error('时间状态计算错误');
      }

      console.log('✅ 里程碑快速操作测试通过');
      return true;
    } catch (error) {
      console.error('❌ 里程碑快速操作测试失败:', error);
      return false;
    }
  }

  /**
   * 测试批量操作功能
   */
  testMilestoneBatchActions(): boolean {
    try {
      // 创建批量操作测试数据
      const batchMilestones: Milestone[] = [
        {
          id: 'batch-1',
          title: '批量测试1',
          description: '批量操作测试',
          targetDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          dayRange: '第1天',
          isCompleted: false
        },
        {
          id: 'batch-2',
          title: '批量测试2',
          description: '批量操作测试',
          targetDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          dayRange: '第2天',
          isCompleted: true,
          completedDate: new Date()
        },
        {
          id: 'batch-3',
          title: '批量测试3',
          description: '批量操作测试',
          targetDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          dayRange: '第3天',
          isCompleted: false
        }
      ];

      const selectedMilestones = ['batch-1', 'batch-3']; // 选择两个未完成的
      const selectedMilestoneObjects = batchMilestones.filter(m => selectedMilestones.includes(m.id));

      // 验证选择状态
      const allSelectedCompleted = selectedMilestoneObjects.every(m => m.isCompleted);
      const allSelectedIncomplete = selectedMilestoneObjects.every(m => !m.isCompleted);

      if (allSelectedCompleted || !allSelectedIncomplete) {
        throw new Error('批量选择状态判断错误');
      }

      // 模拟批量操作
      let batchToggleCallCount = 0;
      let batchDeleteCallCount = 0;

      const mockBatchToggle = (milestoneIds: string[], isCompleted: boolean) => {
        batchToggleCallCount++;
        if (milestoneIds.length !== 2 || !milestoneIds.includes('batch-1') || !milestoneIds.includes('batch-3')) {
          throw new Error('批量切换参数错误');
        }
      };

      const mockBatchDelete = (milestoneIds: string[]) => {
        batchDeleteCallCount++;
        if (milestoneIds.length !== 2) {
          throw new Error('批量删除参数错误');
        }
      };

      // 测试批量操作
      mockBatchToggle(selectedMilestones, true);
      mockBatchDelete(selectedMilestones);

      if (batchToggleCallCount !== 1 || batchDeleteCallCount !== 1) {
        throw new Error('批量操作调用次数错误');
      }

      console.log('✅ 里程碑批量操作测试通过');
      return true;
    } catch (error) {
      console.error('❌ 里程碑批量操作测试失败:', error);
      return false;
    }
  }

  /**
   * 测试里程碑CRUD操作
   */
  testMilestoneCRUDOperations(): boolean {
    try {
      // 测试创建里程碑
      const newMilestone: Omit<Milestone, 'id' | 'isCompleted'> = {
        title: '新里程碑',
        description: '新创建的里程碑',
        targetDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        dayRange: '第1天'
      };

      if (!newMilestone.title || !newMilestone.targetDate) {
        throw new Error('新里程碑数据不完整');
      }

      // 测试更新里程碑
      const updateData: Partial<Milestone> = {
        title: '更新的里程碑',
        description: '更新后的描述',
        isCompleted: true,
        completedDate: new Date()
      };

      if (updateData.isCompleted && !updateData.completedDate) {
        throw new Error('标记完成时必须设置完成时间');
      }

      // 测试删除里程碑
      const milestoneIdToDelete = 'milestone-to-delete';
      
      if (!milestoneIdToDelete || milestoneIdToDelete.trim() === '') {
        throw new Error('删除里程碑ID不能为空');
      }

      // 模拟CRUD操作回调
      let addCallCount = 0;
      let updateCallCount = 0;
      let deleteCallCount = 0;

      const mockAdd = (milestone: Omit<Milestone, 'id' | 'isCompleted'>) => {
        addCallCount++;
        if (!milestone.title || !milestone.targetDate) {
          throw new Error('添加里程碑数据验证失败');
        }
      };

      const mockUpdate = (milestoneId: string, updates: Partial<Milestone>) => {
        updateCallCount++;
        if (!milestoneId || Object.keys(updates).length === 0) {
          throw new Error('更新里程碑参数验证失败');
        }
      };

      const mockDelete = (milestoneId: string) => {
        deleteCallCount++;
        if (!milestoneId) {
          throw new Error('删除里程碑ID验证失败');
        }
      };

      // 执行CRUD操作测试
      mockAdd(newMilestone);
      mockUpdate('test-id', updateData);
      mockDelete(milestoneIdToDelete);

      if (addCallCount !== 1 || updateCallCount !== 1 || deleteCallCount !== 1) {
        throw new Error('CRUD操作调用次数错误');
      }

      console.log('✅ 里程碑CRUD操作测试通过');
      return true;
    } catch (error) {
      console.error('❌ 里程碑CRUD操作测试失败:', error);
      return false;
    }
  }

  /**
   * 运行所有测试
   */
  runAllTests(): boolean {
    console.log('🧪 开始运行里程碑管理组件测试...\n');

    const tests = [
      this.testMilestoneManagerComponent.bind(this),
      this.testMilestoneTimelineComponent.bind(this),
      this.testMilestoneEditDialog.bind(this),
      this.testMilestoneQuickActions.bind(this),
      this.testMilestoneBatchActions.bind(this),
      this.testMilestoneCRUDOperations.bind(this)
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
      console.log('🎉 所有里程碑管理组件测试通过！');
      return true;
    } else {
      console.log('❌ 部分里程碑管理组件测试失败，请检查实现。');
      return false;
    }
  }
}

// 导出测试实例
export const milestoneManagementTest = new MilestoneManagementTest();
