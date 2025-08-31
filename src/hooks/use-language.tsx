
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useLocalStorage } from './use-local-storage';

const translations = {
  en: {
    nav: {
      dashboard: 'Dashboard',
      tasks: 'Tasks',
      notes: 'Inspirations',
      checklist: 'Checklist',
      settings: 'Settings',
      newInspiration: 'New Inspiration',
      newChecklist: 'New Checklist',
      createInspiration: 'Create Inspiration',
      createChecklist: 'Create Checklist',
      createTask: 'Create Task',
    },
    titles: {
        dashboard: 'Dashboard',
        tasks: 'Tasks',
        myNotes: 'My Inspirations',
        newNote: 'New Note',
        editNote: 'Edit Note',
        checklist: 'Behavior Checklist',
        settings: 'Settings',
    },
    noteList: {
      empty: {
        title: 'Your inspiration wall is empty',
        description: 'Start by creating a new inspiration to capture your ideas.',
      },
      batch: {
        select: 'Select',
        exit: 'Exit Selection',
        selectAll: 'Select All',
        delete: 'Delete',
        deleted: {
          title: 'Notes Deleted',
          description: 'Successfully deleted {count} notes.',
        },
        error: {
          title: 'Delete Failed',
          description: 'Failed to delete notes. Please try again.',
        },
      },
    },
    noteCard: {
        updatedOn: 'Updated on',
        aria: {
            edit: 'Edit note'
        }
    },
    checklist: {
      empty: {
        title: 'You have no checklists',
        description: 'Start by creating a new behavioral checklist to guide your actions.',
        noItems: {
          title: 'No checklist items',
          description: 'Create some checklist items to see them here.',
        },
      },
      sort: {
        success: {
          title: 'Order Updated',
          description: 'Item order has been saved.',
        },
        error: {
          title: 'Sort Failed',
          description: 'Failed to update item order. Please try again.',
        },
      },
      item: {
        deleted: {
          title: 'Item Deleted',
          description: 'Checklist item has been deleted.',
        },
        delete: {
          title: 'Delete Item',
          description: 'Are you sure you want to delete this checklist item?',
          cancel: 'Cancel',
          confirm: 'Delete',
        },
        deleting: 'Deleting...',
      },
      batch: {
        select: 'Select',
        exit: 'Exit Selection',
        selectAll: 'Select All',
        delete: 'Delete',
        deleted: {
          title: 'Checklists Deleted',
          description: 'Successfully deleted {count} checklists.',
        },
        error: {
          title: 'Delete Failed',
          description: 'Failed to delete checklists. Please try again.',
        },
      },
    },
    apiKeyInput: {
      title: 'API Keys',
      description: 'To use AI-powered features, you need to provide your own API keys. Keys are stored only in your browser\'s local storage.',
      saveButton: 'Save Key',
      validateButton: 'Validate Key',
      deleteButton: 'Delete Key',
      aria: {
        show: 'Show API key',
        hide: 'Hide API key',
      },
      gemini: {
        label: 'Google Gemini API Key',
        placeholder: 'Enter your Gemini API key',
        alert: {
            title: 'Where to get a Gemini API Key?',
            description: 'You can get a free Gemini API key from Google AI Studio.',
            link: 'Get your key here.',
        },
      },
      deepseek: {
        label: 'DeepSeek API Key',
        placeholder: 'Enter your DeepSeek API key',
        alert: {
            title: 'Where to get a DeepSeek API Key?',
            description: 'You can get an API key from DeepSeek Platform.',
            link: 'Get your key here.',
        },
      },
      toast: {
        title: 'API Key Saved',
        gemini: 'Your Gemini API key has been successfully validated and saved.',
        deepseek: 'Your DeepSeek API key has been successfully validated and saved.',
        empty: {
            title: 'API Key is empty',
            description: 'Please enter an API key.',
        },
        validation: {
            title: 'API Key Validation Failed',
            description: 'The API key is invalid. Please check your key and try again.',
            success_title: 'API Key Validated',
            success_description: 'The API key is valid and ready to use.',
        },
        deleted: {
            title: 'API Key Deleted',
            description: 'The API key has been removed.',
        }
      },
      alert: {
        footerTitle: 'Privacy Note',
        footer: 'Your API keys are stored only in your browser\'s local storage and are never sent to our servers.',
      }
    },
    themeSwitcher: {
        label: 'Theme',
        light: 'Light',
        dark: 'Dark'
    },
    languageSwitcher: {
        label: 'Language',
        placeholder: 'Select a language'
    },
    tasks: {
      title: 'Task Management',
      description: 'Manage your short-term tasks and goals',
      loading: 'Loading tasks...',
      error: 'Error loading tasks',
      retry: 'Retry',
      loginRequired: {
        title: 'Task Management',
        description: 'Please log in to view and manage your tasks.',
        loginButton: 'Log In Now'
      },
      views: {
        board: 'Board',
        list: 'List'
      },
      filters: {
        status: 'Status',
        priority: 'Priority',
        category: 'Category',
        date: 'Date',
        filtered: 'Filtered',
        quickFilter: 'Quick Filter',
        customDate: 'Custom Date',
        clearFilters: 'Clear Filters',
        filterConditions: 'Filter Conditions'
      },
      status: {
        todo: 'To Do',
        in_progress: 'In Progress',
        completed: 'Completed',
        cancelled: 'Cancelled'
      },
      priority: {
        high: 'High Priority',
        medium: 'Medium Priority',
        low: 'Low Priority'
      },
      category: {
        work: 'Work',
        study: 'Study',
        personal: 'Personal',
        health: 'Health',
        other: 'Other'
      },
      dateFilters: {
        today: 'Today',
        thisWeek: 'This Week',
        thisMonth: 'This Month',
        overdue: 'Overdue'
      },
      stats: {
        totalTasks: 'Total Tasks',
        inProgress: 'In Progress',
        completionRate: 'Completion Rate',
        overdueTasks: 'Overdue Tasks',
        completed: 'completed',
        currentActive: 'current active tasks',
        performingWell: 'performing well',
        needsImprovement: 'needs improvement',
        needsAttention: 'needs attention',
        onTrack: 'on track',
        busy: 'Busy',
        normal: 'Normal',
        idle: 'Idle',
        urgent: 'Urgent',
        good: 'Good',
        needsWork: 'Needs Work'
      },
      board: {
        skeleton: 'Board Skeleton',
        statsCards: 'Stats Cards',
        noTasks: 'No {status} tasks'
      },
      empty: {
        title: 'Start Your Task Management Journey',
        description: 'Create your first task or let AI help you plan intelligently. Focus on short-term goals of 3-30 days to make every day more productive.',
        createFirst: 'Create First Task',
        createFirstDesc: 'Manually create a simple task to get started',
        aiGenerate: 'AI Smart Generation',
        aiGenerateDesc: 'Let AI help you plan your task schedule',
        suggestions: 'Task Management Suggestions',
        suggestionsDesc: 'Here are some common task types to help you get started quickly',
        examples: {
          learning: {
            title: 'Learn New Skills',
            desc: 'Such as learning React, preparing for exams, practicing English'
          },
          work: {
            title: 'Work Projects',
            desc: 'Complete project features, code reviews, documentation writing'
          },
          personal: {
            title: 'Personal Goals',
            desc: 'Fitness plans, reading books, organizing rooms'
          }
        }
      },
      list: {
        title: 'Task List',
        tasksCount: 'tasks',
        selected: 'Selected {count} tasks',
        batchActions: 'Batch Actions',
        taskTitle: 'Title',
        status: 'Status',
        priority: 'Priority',
        dueDate: 'Due Date',
        progress: 'Progress',
        createdAt: 'Created',
        actions: 'Actions'
      }
    },
    dashboard: {
      title: 'Dashboard',
      welcome: 'Welcome back!',
      overview: 'Project Overview',
      recentActivities: 'Recent Activities',
      todayTasks: {
        empty: {
          title: 'No tasks scheduled for today',
          description: 'Create a new task to start your productive day',
          createButton: 'Create Task'
        }
      },
      viewAll: 'View All',
      noActivities: 'No activities yet',
      noActivitiesDesc: 'Start creating tasks, recording inspirations, or completing checklists to see activity history',
      createTask: 'Create Task',
      recordInspiration: 'Record Inspiration',
      projectStats: {
        totalNotes: 'Total Notes',
        totalTasks: 'Total Tasks',
        completedTasks: 'Completed Tasks',
        activeProjects: 'Active Projects'
      },
      activities: {
        taskCompleted: 'Task Completed',
        taskCreated: 'Task Created',
        noteCreated: 'Inspiration Recorded',
        checklistCompleted: 'Checklist Completed',
        aiGenerated: 'AI Generated',
        timeAgo: {
          justNow: 'Just now',
          minutesAgo: '{minutes} minutes ago',
          hoursAgo: '{hours} hours ago',
          daysAgo: '{days} days ago',
          weeksAgo: '{weeks} weeks ago'
        }
      },
      create: {
        title: 'Create New Task',
        description: 'Create a new task to manage your goals and plans',
        fields: {
          title: 'Task Title',
          titlePlaceholder: 'Enter task title...',
          description: 'Task Description',
          descriptionPlaceholder: 'Describe the task content and requirements in detail...',
          priority: 'Priority',
          category: 'Category',
          dueDate: 'Due Date',
          selectDate: 'Select date',
          estimatedHours: 'Estimated Time (Days)',
          tags: 'Tags',
          tagsPlaceholder: 'Add tags...'
        },
        buttons: {
          cancel: 'Cancel',
          create: 'Create Task'
        }
      },
      priority: {
        high: 'High Priority',
        medium: 'Medium Priority',
        low: 'Low Priority'
      },
      category: {
        work: 'Work',
        study: 'Study',
        personal: 'Personal',
        health: 'Health',
        other: 'Other'
      },
      ai: {
        title: 'AI Task Planning Assistant',
        description: 'Describe your goals, and AI will generate detailed task plans and schedules for you',
        fields: {
          goal: 'Describe Your Goal',
          goalPlaceholder: 'For example: prepare for CET-4 exam, learn React framework, complete graduation thesis...',
          quickSelect: 'Quick Select',
          timeframe: 'Time Range (Days)',
          minDays: '3 days',
          maxDays: '30 days',
          days: 'days'
        },
        tip: {
          title: 'AI Smart Suggestions',
          description: 'For better planning results, please describe your goals in detail. AI will generate specific task breakdown, time arrangements, and priority suggestions based on your description.'
        },
        buttons: {
          cancel: 'Cancel',
          generate: 'Generate Task Plan',
          generating: 'AI is generating...',
          regenerate: 'Regenerate',
          createTask: 'Create Task'
        },
        examples: {
          exam: 'Prepare for CET-4 exam',
          react: 'Learn React framework development',
          thesis: 'Complete graduation thesis writing',
          fitness: 'Create fitness and weight loss plan',
          interview: 'Prepare for job interviews',
          python: 'Learn Python programming'
        },
        preview: {
          title: 'AI Generated Task Plan',
          description: 'Please review the task plan generated by AI, and create it after confirmation',
          timeframe: 'Timeframe',
          days: ' days',
          milestones: 'Milestones',
          aiGenerated: 'AI Generated',
          estimatedTime: 'Estimated time',
          minutes: ' minutes'
        },
        smartTip: {
          title: '💡 Smart Tip',
          description: 'Include timeframe in your description (like "within 3 days", "in 7 days") and AI will automatically recognize and generate corresponding milestone plans.'
        },
        success: {
          title: 'Task Created Successfully!',
          subtitle: 'AI Task Created',
          description: 'Your task plan has been successfully created, you can start executing now!'
        }
      }
    },
    categories: {
        inspiration: 'Inspiration',
        checklist: 'Checklist'
    },
    noteEditor: {
        backButton: 'Back',
        category: {
            label: 'Category',
        },
        title: {
            label: 'Title',
            placeholder: 'My awesome idea'
        },
        content: {
            label: 'Content',
            placeholder: 'Describe your thoughts in detail...'
        },
        tags: {
            label: 'Tags',
            placeholder: 'Type a tag and press Enter',
            suggestButton: 'Suggest'
        },
        aiTools: {
            provider: 'Provider',
            model: 'Model'
        },
        refineButton: 'Refine with AI',
        exportButton: 'Export',
        deleteButton: 'Delete',
        saveButton: 'Save',
        deleteDialog: {
            title: 'Are you absolutely sure?',
            description: 'This action cannot be undone. This will permanently delete your note.',
            cancel: 'Cancel',
            continue: 'Continue'
        },
        toast: {
            notFound: {
                title: 'Note not found',
                description: 'The requested note could not be found.',
            },
            empty: {
                title: 'Empty fields',
                description: 'Please provide a title and content for your note.',
            },
            updated: {
                title: 'Note Updated',
                description: 'Your changes have been saved.',
            },
            created: {
                title: 'Note Created',
                description: 'Your new note has been saved.',
            },
            deleted: {
                title: 'Note Deleted',
                description: 'The note has been permanently deleted.',
            },
            apiKey: {
                title: 'API Key Required',
                description: 'Please set the required API key in Settings to use this AI feature.',
            },
            tagsSuggested: {
                title: 'Tags Suggested',
                description: 'AI has suggested new tags for your note.',
            },
            noteRefined: {
                title: 'Note Refined',
                description: 'AI has refined your note content.',
            },
            aiError: {
                title: 'AI Error',
                tags: 'Could not suggest tags. Check your API key and try again.',
                refine: 'Could not refine the note. Check your API key and try again.',
            }
        }
    }
  },
  zh: {
    nav: {
      dashboard: '仪表板',
      tasks: '任务',
      notes: '灵感',
      checklist: '核对清单',
      settings: '设置',
      newInspiration: '新灵感',
      newChecklist: '新清单',
      createInspiration: '创建灵感',
      createChecklist: '创建清单',
      createTask: '创建任务',
    },
    titles: {
        dashboard: '仪表板',
        tasks: '任务',
        myNotes: '我的灵感',
        newNote: '新笔记',
        editNote: '编辑笔记',
        checklist: '行为核对清单',
        settings: '设置',
    },
    noteList: {
      empty: {
        title: '你的灵感墙是空的',
        description: '从创建新灵感开始，捕捉你的想法。',
      },
      batch: {
        select: '选择',
        exit: '退出选择',
        selectAll: '全选',
        delete: '删除',
        deleted: {
          title: '笔记已删除',
          description: '成功删除了 {count} 条笔记。',
        },
        error: {
          title: '删除失败',
          description: '删除笔记失败，请重试。',
        },
      },
    },
    noteCard: {
        updatedOn: '更新于',
        aria: {
            edit: '编辑笔记'
        }
    },
    checklist: {
      empty: {
        title: '你还没有任何清单',
        description: '从创建一个新的行为核对清单开始，指导你的行为。',
        noItems: {
          title: '没有清单项目',
          description: '创建一些清单项目后在这里查看。',
        },
      },
      sort: {
        success: {
          title: '顺序已更新',
          description: '项目顺序已保存。',
        },
        error: {
          title: '排序失败',
          description: '更新项目顺序失败，请重试。',
        },
      },
      item: {
        deleted: {
          title: '项目已删除',
          description: '清单项目已被删除。',
        },
        delete: {
          title: '删除项目',
          description: '确定要删除这个清单项目吗？',
          cancel: '取消',
          confirm: '删除',
        },
        deleting: '删除中...',
      },
      batch: {
        select: '选择',
        exit: '退出选择',
        selectAll: '全选',
        delete: '删除',
        deleted: {
          title: '清单已删除',
          description: '成功删除了 {count} 个清单。',
        },
        error: {
          title: '删除失败',
          description: '删除清单失败，请重试。',
        },
      },
    },
    apiKeyInput: {
      title: 'API 密钥',
      description: '要使用人工智能功能，您需要提供自己的 API 密钥。密钥仅存储在您浏览器的本地存储中。',
      saveButton: '保存密钥',
      validateButton: '验证密钥',
      deleteButton: '删除密钥',
      aria: {
        show: '显示 API 密钥',
        hide: '隐藏 API 密钥',
      },
      gemini: {
        label: 'Google Gemini API 密钥',
        placeholder: '输入您的 Gemini API 密钥',
        alert: {
            title: '从哪里获取 Gemini API 密钥？',
            description: '您可以从 Google AI Studio 免费获取 Gemini API 密钥。',
            link: '在此处获取您的密钥。',
        },
      },
      deepseek: {
        label: 'DeepSeek API 密钥',
        placeholder: '输入您的 DeepSeek API 密钥',
        alert: {
            title: '从哪里获取 DeepSeek API 密钥？',
            description: '您可以从 DeepSeek 平台获取 API 密钥。',
            link: '在此处获取您的密钥。',
        },
      },
      toast: {
        title: 'API 密钥已保存',
        gemini: '您的 Gemini API 密钥已成功验证并保存。',
        deepseek: '您的 DeepSeek API 密钥已成功验证并保存。',
        empty: {
            title: 'API 密钥为空',
            description: '请输入您的 API 密钥。',
        },
        validation: {
            title: 'API 密钥验证失败',
            description: '该 API 密钥无效。请检查您的密钥后重试。',
            success_title: 'API 密钥已验证',
            success_description: '该 API 密钥有效，随时可以使用。',
        },
        deleted: {
            title: 'API 密钥已删除',
            description: 'API 密钥已被移除。',
        }
      },
      alert: {
        footerTitle: '隐私提示',
        footer: '您的 API 密钥仅存储在您浏览器的本地存储中，绝不会发送到我们的服务器。',
      }
    },
    themeSwitcher: {
        label: '主题',
        light: '浅色',
        dark: '深色'
    },
    languageSwitcher: {
        label: '语言',
        placeholder: '选择语言'
    },
    dashboard: {
      title: '仪表板',
      welcome: '欢迎回来！',
      overview: '项目概览',
      recentActivities: '最近活动',
      todayTasks: {
        empty: {
          title: '今天没有安排任务',
          description: '创建一个新任务来开始您的高效一天',
          createButton: '创建任务'
        }
      },
      viewAll: '查看全部',
      noActivities: '暂无活动记录',
      noActivitiesDesc: '开始创建任务、记录灵感或完成清单来查看活动历史',
      createTask: '创建任务',
      recordInspiration: '记录灵感',
      projectStats: {
        totalNotes: '总笔记数',
        totalTasks: '总任务数',
        completedTasks: '已完成任务',
        activeProjects: '活跃项目'
      },
      activities: {
        taskCompleted: '任务完成',
        taskCreated: '任务创建',
        noteCreated: '灵感记录',
        checklistCompleted: '清单完成',
        aiGenerated: 'AI生成',
        timeAgo: {
          justNow: '刚刚',
          minutesAgo: '{minutes}分钟前',
          hoursAgo: '{hours}小时前',
          daysAgo: '{days}天前',
          weeksAgo: '{weeks}周前'
        }
      }
    },
    tasks: {
      title: '任务管理',
      description: '管理您的短期任务和目标',
      loading: '加载任务中...',
      error: '加载任务出错',
      retry: '重试',
      loginRequired: {
        title: '任务管理',
        description: '请先登录以查看和管理您的任务。',
        loginButton: '立即登录'
      },
      views: {
        board: '看板',
        list: '列表'
      },
      filters: {
        status: '状态',
        priority: '优先级',
        category: '分类',
        date: '日期',
        filtered: '已筛选',
        quickFilter: '快速筛选',
        customDate: '自定义日期',
        clearFilters: '清除筛选',
        filterConditions: '筛选条件'
      },
      status: {
        todo: '待办',
        in_progress: '进行中',
        completed: '已完成',
        cancelled: '已取消'
      },
      priority: {
        high: '高优先级',
        medium: '中优先级',
        low: '低优先级'
      },
      category: {
        work: '工作',
        study: '学习',
        personal: '个人',
        health: '健康',
        other: '其他'
      },
      dateFilters: {
        today: '今天',
        thisWeek: '本周',
        thisMonth: '本月',
        overdue: '逾期'
      },
      stats: {
        totalTasks: '总任务数',
        inProgress: '进行中',
        completionRate: '完成率',
        overdueTasks: '逾期任务',
        completed: '已完成',
        currentActive: '当前活跃任务',
        performingWell: '表现良好',
        needsImprovement: '需要改进',
        needsAttention: '需要关注',
        onTrack: '进展正常',
        busy: '繁忙',
        normal: '正常',
        idle: '空闲',
        urgent: '紧急',
        good: '良好',
        needsWork: '需要努力'
      },
      board: {
        noTasks: '暂无{status}任务'
      },
      list: {
        title: '任务列表',
        tasksCount: '个任务',
        selected: '已选择 {count} 个任务',
        batchActions: '批量操作',
        taskTitle: '标题',
        status: '状态',
        priority: '优先级'
      },
      empty: {
        title: '开始您的任务管理之旅',
        description: '创建您的第一个任务，或让AI帮您智能规划。专注于3-30天的短期目标，让每一天都更有成效。',
        createFirst: '创建第一个任务',
        createFirstDesc: '手动创建一个简单的任务开始',
        aiGenerate: 'AI 智能生成',
        aiGenerateDesc: '让AI帮你规划任务计划',
        suggestions: '任务管理建议',
        suggestionsDesc: '以下是一些常见的任务类型，帮助您快速开始',
        examples: {
          learning: {
            title: '学习新技能',
            desc: '比如学习React、准备考试、练习英语'
          },
          work: {
            title: '工作项目',
            desc: '完成项目功能、代码审查、文档编写'
          },
          personal: {
            title: '个人目标',
            desc: '健身计划、阅读书籍、整理房间'
          }
        }
      },
      create: {
        title: '创建新任务',
        description: '创建一个新的任务来管理您的目标和计划',
        fields: {
          title: '任务标题',
          titlePlaceholder: '输入任务标题...',
          description: '任务描述',
          descriptionPlaceholder: '详细描述任务内容和要求...',
          priority: '优先级',
          category: '分类',
          dueDate: '截止日期',
          selectDate: '选择日期',
          estimatedHours: '预估时间 (天)',
          tags: '标签',
          tagsPlaceholder: '添加标签...'
        },
        buttons: {
          cancel: '取消',
          create: '创建任务'
        }
      },
      ai: {
        title: 'AI 任务规划助手',
        description: '描述您的目标，AI将为您生成详细的任务计划和时间安排',
        fields: {
          goal: '描述您的目标',
          goalPlaceholder: '例如：准备英语四级考试、学习React框架、完成毕业论文...',
          quickSelect: '快速选择',
          timeframe: '时间范围（天）',
          minDays: '3天',
          maxDays: '30天',
          days: '天'
        },
        tip: {
          title: 'AI 智能建议',
          description: '为了获得更好的规划效果，请尽量详细描述您的目标。AI会根据您的描述生成具体的任务分解、时间安排和优先级建议。'
        },
        buttons: {
          cancel: '取消',
          generate: '生成任务计划',
          generating: 'AI正在生成...',
          regenerate: '重新生成',
          createTask: '创建任务'
        },
        examples: {
          exam: '准备英语四级考试',
          react: '学习React框架开发',
          thesis: '完成毕业论文写作',
          fitness: '制定健身减肥计划',
          interview: '准备求职面试',
          python: '学习Python编程'
        },
        preview: {
          title: 'AI 生成的任务计划',
          description: '请查看AI为您生成的任务计划，确认后即可创建',
          timeframe: '时间范围',
          days: '天',
          milestones: '里程碑',
          aiGenerated: 'AI智能生成',
          estimatedTime: '预估时间',
          minutes: '分钟'
        },
        smartTip: {
          title: '💡 智能提示',
          description: '在描述中包含时间范围（如"3天内"、"7天内"），AI会自动识别并生成相应的里程碑计划。'
        },
        success: {
          title: '任务创建成功！',
          subtitle: 'AI任务已创建',
          description: '您的任务计划已成功创建，现在可以开始执行了！'
        }
      }
    },
    categories: {
        inspiration: '灵感',
        checklist: '清单'
    },
    noteEditor: {
        backButton: '返回',
        category: {
            label: '类别',
        },
        title: {
            label: '标题',
            placeholder: '我的绝妙想法'
        },
        content: {
            label: '内容',
            placeholder: '详细描述您的想法...'
        },
        tags: {
            label: '标签',
            placeholder: '输入标签并按 Enter',
            suggestButton: '建议'
        },
        aiTools: {
            provider: '服务商',
            model: '模型'
        },
        refineButton: '使用 AI 优化',
        exportButton: '导出',
        deleteButton: '删除',
        saveButton: '保存',
        deleteDialog: {
            title: '您确定吗？',
            description: '此操作无法撤销。这将永久删除您的笔记。',
            cancel: '取消',
            continue: '继续'
        },
        toast: {
            notFound: {
                title: '找不到笔记',
                description: '找不到所请求的笔记。',
            },
            empty: {
                title: '字段为空',
                description: '请为您的笔记提供标题和内容。',
            },
            updated: {
                title: '笔记已更新',
                description: '您的更改已保存。',
            },
            created: {
                title: '笔记已创建',
                description: '您的新笔记已保存。',
            },
            deleted: {
                title: '笔记已删除',
                description: '笔记已被永久删除。',
            },
            apiKey: {
                title: '需要 API 密钥',
                description: '请在“设置”中设置所需的 API 密钥以使用此 AI 功能。',
            },
            tagsSuggested: {
                title: '建议的标签',
                description: 'AI 为您的笔记建议了新标签。',
            },
            noteRefined: {
                title: '笔记已优化',
                description: 'AI 已优化您的笔记内容。',
            },
            aiError: {
                title: 'AI 错误',
                tags: '无法建议标签。请检查您的 API 密钥并重试。',
                refine: '无法优化笔记。请检查您的 API 密钥并重试。',
            }
        }
    }
  },
};

type Language = 'en' | 'zh';

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: Record<string, any>) => string;
  isClient: boolean;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useLocalStorage<Language>('language', 'en');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const t = (key: string, params?: Record<string, any>) => {
    const keys = key.split('.');
    let result: any = translations[language];
    for (const k of keys) {
      result = result[k];
      if (!result) {
        // Fallback to English if translation not found
        let fallbackResult: any = translations.en;
        for (const fk of keys) {
            fallbackResult = fallbackResult[fk];
            if (!fallbackResult) return key;
        }
        result = fallbackResult;
        break;
      }
    }

    let finalResult = result || key;

    // Replace parameters in the string
    if (params && typeof finalResult === 'string') {
      Object.keys(params).forEach(param => {
        finalResult = finalResult.replace(`{${param}}`, params[param]);
      });
    }

    return finalResult;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isClient }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
