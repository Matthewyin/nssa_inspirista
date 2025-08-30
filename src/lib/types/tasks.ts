import { Timestamp } from 'firebase/firestore';

// 任务状态类型
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'cancelled';

// 任务优先级类型
export type TaskPriority = 'high' | 'medium' | 'low';

// 任务分类类型
export type TaskCategory = 'work' | 'study' | 'personal' | 'health' | 'other';

// AI辅助级别类型
export type AIAssistanceLevel = 'minimal' | 'moderate' | 'extensive';

// 子任务接口
export interface SubTask {
  id: string;
  title: string;
  isCompleted: boolean;
  estimatedMinutes?: number;
  completedAt?: Timestamp;
}

// 主任务接口
export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  
  // 时间管理
  startDate: Timestamp;
  dueDate: Timestamp;
  estimatedHours?: number;
  
  // 状态管理
  status: TaskStatus;
  priority: TaskPriority;
  
  // 分类和标签
  category: TaskCategory;
  tags: string[];
  
  // AI辅助相关
  isAIGenerated: boolean;
  aiPrompt?: string;
  subtasks: SubTask[];
  
  // 进度跟踪
  progress: number; // 0-100
  timeSpent: number; // 分钟
  
  // 元数据
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
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

// AI生成的任务计划
export interface TaskPlan {
  title: string;
  description: string;
  dueDate: Date;
  priority: TaskPriority;
  category: TaskCategory;
  tags: string[];
  subtasks: Omit<SubTask, 'id' | 'completedAt'>[];
  estimatedHours: number;
  originalPrompt: string;
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
