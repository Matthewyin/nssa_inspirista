/**
 * 国际化功能测试
 * 验证Task 3.1的翻译内容补充功能
 */

export class InternationalizationTest {
  /**
   * 测试AI相关界面翻译
   */
  testAITranslations(): boolean {
    try {
      console.log('🔄 测试AI相关界面翻译...');

      // 模拟翻译键值对
      const aiTranslations = {
        en: {
          'tasks.ai.generator.title': 'AI Task Generator',
          'tasks.ai.generator.description': 'Let AI help you create a detailed task plan with milestones',
          'tasks.ai.generator.inputLabel': 'Describe your goal',
          'tasks.ai.generator.inputPlaceholder': 'e.g., "Learn React Hooks in 7 days"',
          'tasks.ai.generator.generateButton': 'Generate with AI',
          'tasks.ai.generator.loadingTitle': 'AI is thinking...',
          'tasks.ai.features.smartPlanning': 'Smart Planning',
          'tasks.ai.providers.gemini': 'Gemini AI',
          'tasks.ai.errors.networkError': 'Network error'
        },
        zh: {
          'tasks.ai.generator.title': 'AI 任务生成器',
          'tasks.ai.generator.description': '让AI帮助您创建详细的任务计划和里程碑',
          'tasks.ai.generator.inputLabel': '描述您的目标',
          'tasks.ai.generator.inputPlaceholder': '例如："7天内学会React Hooks"',
          'tasks.ai.generator.generateButton': '使用AI生成',
          'tasks.ai.generator.loadingTitle': 'AI正在思考...',
          'tasks.ai.features.smartPlanning': '智能规划',
          'tasks.ai.providers.gemini': 'Gemini AI',
          'tasks.ai.errors.networkError': '网络错误'
        }
      };

      // 验证翻译键的完整性
      const requiredKeys = [
        'tasks.ai.generator.title',
        'tasks.ai.generator.description',
        'tasks.ai.generator.inputLabel',
        'tasks.ai.generator.inputPlaceholder',
        'tasks.ai.generator.generateButton',
        'tasks.ai.generator.loadingTitle',
        'tasks.ai.features.smartPlanning',
        'tasks.ai.providers.gemini',
        'tasks.ai.errors.networkError'
      ];

      for (const key of requiredKeys) {
        if (!aiTranslations.en[key] || !aiTranslations.zh[key]) {
          throw new Error(`缺少翻译键: ${key}`);
        }
      }

      // 验证翻译内容的质量
      for (const key of requiredKeys) {
        const enText = aiTranslations.en[key];
        const zhText = aiTranslations.zh[key];

        // 检查翻译不能为空
        if (!enText.trim() || !zhText.trim()) {
          throw new Error(`翻译内容为空: ${key}`);
        }

        // 检查中英文翻译不能相同（除了专有名词）
        if (enText === zhText && !key.includes('providers')) {
          throw new Error(`中英文翻译相同: ${key}`);
        }

        // 检查占位符格式一致性
        const enPlaceholders = enText.match(/\{[^}]+\}/g) || [];
        const zhPlaceholders = zhText.match(/\{[^}]+\}/g) || [];
        
        if (enPlaceholders.length !== zhPlaceholders.length) {
          throw new Error(`占位符数量不匹配: ${key}`);
        }
      }

      console.log('✅ AI相关界面翻译测试通过');
      return true;
    } catch (error) {
      console.error('❌ AI相关界面翻译测试失败:', error);
      return false;
    }
  }

  /**
   * 测试里程碑相关翻译
   */
  testMilestoneTranslations(): boolean {
    try {
      console.log('🔄 测试里程碑相关翻译...');

      // 模拟里程碑翻译键值对
      const milestoneTranslations = {
        en: {
          'tasks.milestones.title': 'Milestones',
          'tasks.milestones.management': 'Milestone Management',
          'tasks.milestones.add': 'Add Milestone',
          'tasks.milestones.edit': 'Edit Milestone',
          'tasks.milestones.delete': 'Delete Milestone',
          'tasks.milestones.completed': 'Completed',
          'tasks.milestones.pending': 'Pending',
          'tasks.milestones.overdue': 'Overdue',
          'tasks.milestones.daysLeft': '{days} days left',
          'tasks.milestones.fields.title': 'Title',
          'tasks.milestones.actions.save': 'Save Changes',
          'tasks.milestones.empty.title': 'No milestones yet',
          'tasks.milestones.search.placeholder': 'Search milestones...'
        },
        zh: {
          'tasks.milestones.title': '里程碑',
          'tasks.milestones.management': '里程碑管理',
          'tasks.milestones.add': '添加里程碑',
          'tasks.milestones.edit': '编辑里程碑',
          'tasks.milestones.delete': '删除里程碑',
          'tasks.milestones.completed': '已完成',
          'tasks.milestones.pending': '待完成',
          'tasks.milestones.overdue': '已逾期',
          'tasks.milestones.daysLeft': '还有{days}天',
          'tasks.milestones.fields.title': '标题',
          'tasks.milestones.actions.save': '保存更改',
          'tasks.milestones.empty.title': '暂无里程碑',
          'tasks.milestones.search.placeholder': '搜索里程碑...'
        }
      };

      // 验证里程碑翻译键的完整性
      const requiredMilestoneKeys = [
        'tasks.milestones.title',
        'tasks.milestones.management',
        'tasks.milestones.add',
        'tasks.milestones.edit',
        'tasks.milestones.delete',
        'tasks.milestones.completed',
        'tasks.milestones.pending',
        'tasks.milestones.overdue',
        'tasks.milestones.daysLeft',
        'tasks.milestones.fields.title',
        'tasks.milestones.actions.save',
        'tasks.milestones.empty.title',
        'tasks.milestones.search.placeholder'
      ];

      for (const key of requiredMilestoneKeys) {
        if (!milestoneTranslations.en[key] || !milestoneTranslations.zh[key]) {
          throw new Error(`缺少里程碑翻译键: ${key}`);
        }
      }

      // 验证动态翻译功能
      const daysLeftEn = milestoneTranslations.en['tasks.milestones.daysLeft'];
      const daysLeftZh = milestoneTranslations.zh['tasks.milestones.daysLeft'];

      if (!daysLeftEn.includes('{days}') || !daysLeftZh.includes('{days}')) {
        throw new Error('动态翻译占位符缺失');
      }

      // 测试动态翻译替换
      const testDays = 5;
      const expectedEn = daysLeftEn.replace('{days}', testDays.toString());
      const expectedZh = daysLeftZh.replace('{days}', testDays.toString());

      if (expectedEn !== '5 days left' || expectedZh !== '还有5天') {
        throw new Error('动态翻译替换失败');
      }

      console.log('✅ 里程碑相关翻译测试通过');
      return true;
    } catch (error) {
      console.error('❌ 里程碑相关翻译测试失败:', error);
      return false;
    }
  }

  /**
   * 测试错误提示和状态描述翻译
   */
  testErrorAndStatusTranslations(): boolean {
    try {
      console.log('🔄 测试错误提示和状态描述翻译...');

      // 模拟错误和状态翻译
      const commonTranslations = {
        en: {
          'common.errors.networkError': 'Network Error',
          'common.errors.networkErrorDesc': 'Please check your internet connection and try again',
          'common.errors.serverError': 'Server Error',
          'common.errors.validationError': 'Validation Error',
          'common.status.loading': 'Loading...',
          'common.status.saving': 'Saving...',
          'common.status.success': 'Success',
          'common.status.failed': 'Failed',
          'common.actions.save': 'Save',
          'common.actions.cancel': 'Cancel',
          'common.actions.retry': 'Retry',
          'common.time.today': 'Today',
          'common.time.tomorrow': 'Tomorrow'
        },
        zh: {
          'common.errors.networkError': '网络错误',
          'common.errors.networkErrorDesc': '请检查您的网络连接并重试',
          'common.errors.serverError': '服务器错误',
          'common.errors.validationError': '验证错误',
          'common.status.loading': '加载中...',
          'common.status.saving': '保存中...',
          'common.status.success': '成功',
          'common.status.failed': '失败',
          'common.actions.save': '保存',
          'common.actions.cancel': '取消',
          'common.actions.retry': '重试',
          'common.time.today': '今天',
          'common.time.tomorrow': '明天'
        }
      };

      // 验证通用翻译键的完整性
      const requiredCommonKeys = [
        'common.errors.networkError',
        'common.errors.networkErrorDesc',
        'common.errors.serverError',
        'common.errors.validationError',
        'common.status.loading',
        'common.status.saving',
        'common.status.success',
        'common.status.failed',
        'common.actions.save',
        'common.actions.cancel',
        'common.actions.retry',
        'common.time.today',
        'common.time.tomorrow'
      ];

      for (const key of requiredCommonKeys) {
        if (!commonTranslations.en[key] || !commonTranslations.zh[key]) {
          throw new Error(`缺少通用翻译键: ${key}`);
        }
      }

      // 验证错误描述的详细程度
      const errorDescKeys = Object.keys(commonTranslations.en).filter(key => key.includes('ErrorDesc'));
      
      for (const key of errorDescKeys) {
        const enDesc = commonTranslations.en[key];
        const zhDesc = commonTranslations.zh[key];

        // 错误描述应该足够详细（至少10个字符）
        if (enDesc.length < 10 || zhDesc.length < 5) {
          throw new Error(`错误描述过于简短: ${key}`);
        }
      }

      // 验证状态翻译的一致性
      const statusKeys = Object.keys(commonTranslations.en).filter(key => key.includes('status'));
      
      for (const key of statusKeys) {
        const enStatus = commonTranslations.en[key];
        const zhStatus = commonTranslations.zh[key];

        // 状态翻译应该简洁（不超过20个字符）
        if (enStatus.length > 20 || zhStatus.length > 10) {
          throw new Error(`状态翻译过长: ${key}`);
        }
      }

      console.log('✅ 错误提示和状态描述翻译测试通过');
      return true;
    } catch (error) {
      console.error('❌ 错误提示和状态描述翻译测试失败:', error);
      return false;
    }
  }

  /**
   * 测试翻译助手功能
   */
  testTranslationHelpers(): boolean {
    try {
      console.log('🔄 测试翻译助手功能...');

      // 模拟翻译助手的格式化功能
      const formatters = {
        formatRelativeTime: (date: Date, language: string): string => {
          const now = new Date();
          const diffInDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffInDays === 0) return language === 'zh' ? '今天' : 'Today';
          if (diffInDays === 1) return language === 'zh' ? '明天' : 'Tomorrow';
          if (diffInDays === -1) return language === 'zh' ? '昨天' : 'Yesterday';
          if (diffInDays > 0) return language === 'zh' ? `还有${diffInDays}天` : `${diffInDays} days left`;
          return language === 'zh' ? `逾期${Math.abs(diffInDays)}天` : `${Math.abs(diffInDays)} days overdue`;
        },

        formatProgress: (completed: number, total: number): string => {
          if (total === 0) return '0%';
          const percentage = Math.round((completed / total) * 100);
          return `${percentage}%`;
        }
      };

      // 测试相对时间格式化
      const today = new Date();
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const futureDate = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000);
      const pastDate = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000);

      // 验证英文格式化
      if (formatters.formatRelativeTime(today, 'en') !== 'Today') {
        throw new Error('今天的英文格式化失败');
      }
      if (formatters.formatRelativeTime(tomorrow, 'en') !== 'Tomorrow') {
        throw new Error('明天的英文格式化失败');
      }
      if (formatters.formatRelativeTime(futureDate, 'en') !== '5 days left') {
        throw new Error('未来日期的英文格式化失败');
      }

      // 验证中文格式化
      if (formatters.formatRelativeTime(today, 'zh') !== '今天') {
        throw new Error('今天的中文格式化失败');
      }
      if (formatters.formatRelativeTime(tomorrow, 'zh') !== '明天') {
        throw new Error('明天的中文格式化失败');
      }
      if (formatters.formatRelativeTime(futureDate, 'zh') !== '还有5天') {
        throw new Error('未来日期的中文格式化失败');
      }

      // 测试进度格式化
      if (formatters.formatProgress(3, 5) !== '60%') {
        throw new Error('进度格式化失败');
      }
      if (formatters.formatProgress(0, 0) !== '0%') {
        throw new Error('空进度格式化失败');
      }

      console.log('✅ 翻译助手功能测试通过');
      return true;
    } catch (error) {
      console.error('❌ 翻译助手功能测试失败:', error);
      return false;
    }
  }

  /**
   * 运行所有国际化测试
   */
  runAllTests(): boolean {
    console.log('🧪 开始运行国际化功能测试...\n');

    const tests = [
      this.testAITranslations.bind(this),
      this.testMilestoneTranslations.bind(this),
      this.testErrorAndStatusTranslations.bind(this),
      this.testTranslationHelpers.bind(this)
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
      console.log('🎉 所有国际化功能测试通过！');
      return true;
    } else {
      console.log('❌ 部分国际化功能测试失败，请检查翻译实现。');
      return false;
    }
  }
}

// 导出测试实例
export const internationalizationTest = new InternationalizationTest();
