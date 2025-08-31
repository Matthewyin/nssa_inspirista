/**
 * 翻译助手Hook
 * 提供便捷的翻译函数和常用翻译内容
 */

import { useLanguage } from './use-language';

export function useTranslations() {
  const { t, language } = useLanguage();

  // AI相关翻译
  const ai = {
    generator: {
      title: t('tasks.ai.generator.title'),
      description: t('tasks.ai.generator.description'),
      inputLabel: t('tasks.ai.generator.inputLabel'),
      inputPlaceholder: t('tasks.ai.generator.inputPlaceholder'),
      generateButton: t('tasks.ai.generator.generateButton'),
      regenerateButton: t('tasks.ai.generator.regenerateButton'),
      editButton: t('tasks.ai.generator.editButton'),
      useButton: t('tasks.ai.generator.useButton'),
      loadingTitle: t('tasks.ai.generator.loadingTitle'),
      loadingDescription: t('tasks.ai.generator.loadingDescription'),
      errorTitle: t('tasks.ai.generator.errorTitle'),
      errorDescription: t('tasks.ai.generator.errorDescription'),
      retryButton: t('tasks.ai.generator.retryButton'),
      switchProvider: t('tasks.ai.generator.switchProvider'),
      tips: {
        title: t('tasks.ai.generator.tips.title'),
        timeframe: t('tasks.ai.generator.tips.timeframe'),
        specific: t('tasks.ai.generator.tips.specific'),
        context: t('tasks.ai.generator.tips.context')
      }
    },
    features: {
      title: t('tasks.ai.features.title'),
      smartPlanning: t('tasks.ai.features.smartPlanning'),
      smartPlanningDesc: t('tasks.ai.features.smartPlanningDesc'),
      autoTags: t('tasks.ai.features.autoTags'),
      autoTagsDesc: t('tasks.ai.features.autoTagsDesc'),
      timeEstimation: t('tasks.ai.features.timeEstimation'),
      timeEstimationDesc: t('tasks.ai.features.timeEstimationDesc')
    },
    providers: {
      gemini: t('tasks.ai.providers.gemini'),
      deepseek: t('tasks.ai.providers.deepseek'),
      switchTo: (provider: string) => t('tasks.ai.providers.switchTo').replace('{provider}', provider),
      currentProvider: (provider: string) => t('tasks.ai.providers.currentProvider').replace('{provider}', provider)
    },
    errors: {
      noApiKey: t('tasks.ai.errors.noApiKey'),
      noApiKeyDesc: t('tasks.ai.errors.noApiKeyDesc'),
      networkError: t('tasks.ai.errors.networkError'),
      networkErrorDesc: t('tasks.ai.errors.networkErrorDesc'),
      rateLimitError: t('tasks.ai.errors.rateLimitError'),
      rateLimitErrorDesc: t('tasks.ai.errors.rateLimitErrorDesc'),
      invalidResponse: t('tasks.ai.errors.invalidResponse'),
      invalidResponseDesc: t('tasks.ai.errors.invalidResponseDesc')
    }
  };

  // 里程碑相关翻译
  const milestones = {
    title: t('tasks.milestones.title'),
    management: t('tasks.milestones.management'),
    timeline: t('tasks.milestones.timeline'),
    progress: t('tasks.milestones.progress'),
    add: t('tasks.milestones.add'),
    edit: t('tasks.milestones.edit'),
    delete: t('tasks.milestones.delete'),
    complete: t('tasks.milestones.complete'),
    incomplete: t('tasks.milestones.incomplete'),
    completed: t('tasks.milestones.completed'),
    pending: t('tasks.milestones.pending'),
    overdue: t('tasks.milestones.overdue'),
    today: t('tasks.milestones.today'),
    tomorrow: t('tasks.milestones.tomorrow'),
    daysLeft: (days: number) => t('tasks.milestones.daysLeft').replace('{days}', days.toString()),
    daysOverdue: (days: number) => t('tasks.milestones.daysOverdue').replace('{days}', days.toString()),
    completedOn: (date: string) => t('tasks.milestones.completedOn').replace('{date}', date),
    dueOn: (date: string) => t('tasks.milestones.dueOn').replace('{date}', date),
    fields: {
      title: t('tasks.milestones.fields.title'),
      titlePlaceholder: t('tasks.milestones.fields.titlePlaceholder'),
      description: t('tasks.milestones.fields.description'),
      descriptionPlaceholder: t('tasks.milestones.fields.descriptionPlaceholder'),
      targetDate: t('tasks.milestones.fields.targetDate'),
      dayRange: t('tasks.milestones.fields.dayRange'),
      dayRangePlaceholder: t('tasks.milestones.fields.dayRangePlaceholder')
    },
    actions: {
      save: t('tasks.milestones.actions.save'),
      cancel: t('tasks.milestones.actions.cancel'),
      addFirst: t('tasks.milestones.actions.addFirst'),
      batchComplete: t('tasks.milestones.actions.batchComplete'),
      batchIncomplete: t('tasks.milestones.actions.batchIncomplete'),
      batchDelete: t('tasks.milestones.actions.batchDelete'),
      selectAll: t('tasks.milestones.actions.selectAll'),
      clearSelection: t('tasks.milestones.actions.clearSelection')
    },
    status: {
      notStarted: t('tasks.milestones.status.notStarted'),
      inProgress: t('tasks.milestones.status.inProgress'),
      completed: t('tasks.milestones.status.completed'),
      allCompleted: t('tasks.milestones.status.allCompleted'),
      noneCompleted: t('tasks.milestones.status.noneCompleted')
    },
    empty: {
      title: t('tasks.milestones.empty.title'),
      description: t('tasks.milestones.empty.description'),
      addButton: t('tasks.milestones.empty.addButton')
    },
    search: {
      placeholder: t('tasks.milestones.search.placeholder'),
      noResults: t('tasks.milestones.search.noResults'),
      clearFilter: t('tasks.milestones.search.clearFilter')
    },
    filters: {
      all: t('tasks.milestones.filters.all'),
      pending: t('tasks.milestones.filters.pending'),
      completed: t('tasks.milestones.filters.completed'),
      overdue: t('tasks.milestones.filters.overdue')
    },
    confirmDelete: {
      title: t('tasks.milestones.confirmDelete.title'),
      description: t('tasks.milestones.confirmDelete.description'),
      confirm: t('tasks.milestones.confirmDelete.confirm'),
      cancel: t('tasks.milestones.confirmDelete.cancel')
    }
  };

  // 通用翻译
  const common = {
    errors: {
      networkError: t('common.errors.networkError'),
      networkErrorDesc: t('common.errors.networkErrorDesc'),
      serverError: t('common.errors.serverError'),
      serverErrorDesc: t('common.errors.serverErrorDesc'),
      validationError: t('common.errors.validationError'),
      validationErrorDesc: t('common.errors.validationErrorDesc'),
      permissionError: t('common.errors.permissionError'),
      permissionErrorDesc: t('common.errors.permissionErrorDesc'),
      notFoundError: t('common.errors.notFoundError'),
      notFoundErrorDesc: t('common.errors.notFoundErrorDesc'),
      timeoutError: t('common.errors.timeoutError'),
      timeoutErrorDesc: t('common.errors.timeoutErrorDesc')
    },
    status: {
      loading: t('common.status.loading'),
      saving: t('common.status.saving'),
      deleting: t('common.status.deleting'),
      updating: t('common.status.updating'),
      processing: t('common.status.processing'),
      success: t('common.status.success'),
      failed: t('common.status.failed'),
      completed: t('common.status.completed'),
      cancelled: t('common.status.cancelled'),
      pending: t('common.status.pending')
    },
    actions: {
      save: t('common.actions.save'),
      cancel: t('common.actions.cancel'),
      delete: t('common.actions.delete'),
      edit: t('common.actions.edit'),
      add: t('common.actions.add'),
      remove: t('common.actions.remove'),
      confirm: t('common.actions.confirm'),
      retry: t('common.actions.retry'),
      refresh: t('common.actions.refresh'),
      close: t('common.actions.close'),
      back: t('common.actions.back'),
      next: t('common.actions.next'),
      previous: t('common.actions.previous'),
      submit: t('common.actions.submit'),
      reset: t('common.actions.reset')
    },
    time: {
      now: t('common.time.now'),
      today: t('common.time.today'),
      yesterday: t('common.time.yesterday'),
      tomorrow: t('common.time.tomorrow'),
      thisWeek: t('common.time.thisWeek'),
      lastWeek: t('common.time.lastWeek'),
      nextWeek: t('common.time.nextWeek'),
      thisMonth: t('common.time.thisMonth'),
      lastMonth: t('common.time.lastMonth'),
      nextMonth: t('common.time.nextMonth')
    }
  };

  // 格式化函数
  const formatters = {
    // 格式化相对时间
    formatRelativeTime: (date: Date): string => {
      const now = new Date();
      const diffInDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffInDays === 0) return common.time.today;
      if (diffInDays === 1) return common.time.tomorrow;
      if (diffInDays === -1) return common.time.yesterday;
      if (diffInDays > 0) return milestones.daysLeft(diffInDays);
      return milestones.daysOverdue(Math.abs(diffInDays));
    },

    // 格式化日期
    formatDate: (date: Date): string => {
      return new Intl.DateTimeFormat(language === 'zh' ? 'zh-CN' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date);
    },

    // 格式化日期时间
    formatDateTime: (date: Date): string => {
      return new Intl.DateTimeFormat(language === 'zh' ? 'zh-CN' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    },

    // 格式化进度百分比
    formatProgress: (completed: number, total: number): string => {
      if (total === 0) return '0%';
      const percentage = Math.round((completed / total) * 100);
      return `${percentage}%`;
    }
  };

  return {
    t,
    language,
    ai,
    milestones,
    common,
    formatters
  };
}
