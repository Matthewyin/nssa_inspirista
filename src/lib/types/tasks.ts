import { Timestamp } from 'firebase/firestore';

// 任务状态类型
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'cancelled';

// 任务优先级类型
export type TaskPriority = 'high' | 'medium' | 'low';

// 任务分类类型
export type TaskCategory = 'work' | 'study' | 'personal' | 'health' | 'other';

// AI辅助级别类型
export type AIAssistanceLevel = 'minimal' | 'moderate' | 'extensive';

// 里程碑接口
export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  isCompleted: boolean;
  completedDate?: Date;
  dayRange: string;          // 如"第1-2天"
}

// 子任务接口
export interface SubTask {
  id: string;
  title: string;
  isCompleted: boolean;
  estimatedMinutes?: number;
  completedAt?: Timestamp;
}

// 主任务接口 - 简化版本，专注于短期任务管理
export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;        // 必填，包含AI生成的完整计划或用户描述

  // 状态管理
  status: TaskStatus;

  // 标签（AI生成或用户添加）
  tags: string[];

  // 里程碑管理
  milestones: Milestone[];    // 里程碑列表

  // AI辅助相关
  isAIGenerated: boolean;     // 是否AI生成
  aiPrompt?: string;          // 原始用户输入

  // 时间管理
  startDate: Timestamp;       // 任务开始日期

  // 进度跟踪（基于里程碑计算）
  progress: number;           // 0-100，基于已完成里程碑计算

  // 元数据
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;

  // 兼容性字段（保留以支持现有数据迁移）
  dueDate?: Timestamp;        // 可选，用于数据迁移
  priority?: TaskPriority;    // 可选，用于数据迁移
  category?: TaskCategory;    // 可选，用于数据迁移
  estimatedHours?: number;    // 可选，用于数据迁移
  subtasks?: SubTask[];       // 可选，用于数据迁移
  timeSpent?: number;         // 可选，用于数据迁移
}

// AI任务模板接口
export interface TaskTemplate {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  estimatedDays: number;
  subtasks: string[];
  tags: string[];
  createdBy: 'ai' | 'user';
  usageCount: number;
  createdAt: Timestamp;
}

// 用户偏好接口
export interface UserPreferences {
  userId: string;
  defaultWorkingHours: number;
  preferredCategories: TaskCategory[];
  aiAssistanceLevel: AIAssistanceLevel;
  reminderSettings: {
    enabled: boolean;
    beforeDays: number;
    beforeHours: number;
  };
  updatedAt: Timestamp;
}

// AI生成的任务计划 - 新版本支持里程碑
export interface TaskPlan {
  title: string;
  description: string;        // 包含格式化的AI生成计划
  tags: string[];            // AI生成的2个标签
  milestones: Omit<Milestone, 'id' | 'isCompleted' | 'completedDate'>[];  // 里程碑列表
  originalPrompt: string;     // 原始用户输入
  timeframeDays: number;      // 时间范围（天数）
}

// AI响应解析结果
export interface AITaskResponse {
  summary: string;           // 总体规划
  milestones: {
    title: string;
    description: string;
    dayRange: string;
  }[];
  tags: string[];           // 推荐标签
}

// 任务创建输入
export interface TaskCreateInput {
  title: string;
  description: string;
  isAIGenerated?: boolean;
  aiPrompt?: string;
  milestones?: Omit<Milestone, 'id' | 'isCompleted' | 'completedDate'>[];
  tags?: string[];
}

// 任务优化建议
export interface TaskOptimization {
  improvements: string[];
  timeManagementTips: string[];
  subtaskSuggestions: string[];
  riskWarnings: string[];
}

// 任务筛选器
export interface TaskFilters {
  status?: TaskStatus;
  category?: TaskCategory;
  priority?: TaskPriority;
  tags?: string[];
  dueDateRange?: {
    start: Date;
    end: Date;
  };
}

// 仪表板数据
export interface DashboardData {
  tasks: {
    total: number;
    completed: number;
    inProgress: number;
    overdue: number;
    dueToday: number;
    dueThisWeek: number;
  };
  notes: {
    total: number;
    recentCount: number;
    favoriteCount: number;
  };
  checklists: {
    total: number;
    completedCount: number;
    activeCount: number;
  };
  timeStats: {
    totalTimeSpent: number;
    avgDailyTime: number;
    mostProductiveHour: number;
  };
  recentActivities: Activity[];
}

// 活动记录
export interface Activity {
  id: string;
  type: 'task_completed' | 'task_created' | 'note_created' | 'checklist_completed';
  title: string;
  timestamp: Timestamp;
  metadata?: any;
}

// 任务统计
export interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  completionRate: number;
  avgCompletionTime: number; // 天数
}
