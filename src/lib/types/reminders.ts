import { Timestamp } from 'firebase/firestore';
import { z } from 'zod';

// 支持的平台类型
export type WebhookPlatform = 'wechat_work' | 'dingtalk' | 'feishu' | 'slack' | 'custom';

// 时间点接口
export interface TimeSlot {
  id: string;                      // 时间点唯一标识
  time: string;                    // "HH:mm" 格式
  isActive: boolean;               // 单独控制每个时间点的启用状态
  description?: string;            // 可选的时间点描述，如"上午提醒"
}

// 平台特定配置
export interface PlatformConfig {
  // 企业微信特定配置
  wechat?: {
    msgtype: 'text' | 'markdown';
    mentionAll: boolean;
  };
  // 钉钉特定配置
  dingtalk?: {
    msgtype: 'text' | 'markdown';
    isAtAll: boolean;
  };
  // 飞书特定配置
  feishu?: {
    msg_type: 'text' | 'rich_text';
  };
  // 自定义webhook配置
  custom?: {
    method: 'GET' | 'POST' | 'PUT';
    headers: Record<string, string>;
    bodyTemplate: string;
  };
}

// 主要的提醒接口
export interface WebhookReminder {
  id: string;
  userId: string;
  name: string;
  
  // 平台配置
  platform: WebhookPlatform;
  webhookUrl: string;
  messageContent: string;
  
  // 多时间点调度设置
  timeSlots: TimeSlot[];           // 最多3个时间点
  days: string[];                  // 共享的执行日期 ["1","2","3","4","5"]
  isActive: boolean;
  
  // 平台特定配置
  platformConfig?: PlatformConfig;
  
  // 统计信息
  executionCount: number;          // 总执行次数
  lastExecutionTime?: Timestamp;   // 最后执行时间
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
  nextRuns: Timestamp[];           // 每个时间点的下次执行时间
}

// Zod 验证模式
export const TimeSlotSchema = z.object({
  id: z.string(),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, '请输入有效时间格式'),
  isActive: z.boolean(),
  description: z.string().optional(),
});

export const WebhookReminderSchema = z.object({
  name: z.string().min(1, '提醒名称不能为空').max(100, '提醒名称不能超过100个字符'),
  platform: z.enum(['wechat_work', 'dingtalk', 'feishu', 'slack', 'custom']),
  webhookUrl: z.string().url('请输入有效的Webhook地址'),
  messageContent: z.string().min(1, '消息内容不能为空').max(1000, '消息内容不能超过1000个字符'),
  timeSlots: z.array(TimeSlotSchema).min(1, '至少需要一个时间点').max(3, '最多只能设置3个时间点'),
  days: z.array(z.string()).min(1, '请至少选择一天'),
  isActive: z.boolean().default(true),
  platformConfig: z.object({
    wechat: z.object({
      msgtype: z.enum(['text', 'markdown']),
      mentionAll: z.boolean(),
    }).optional(),
    dingtalk: z.object({
      msgtype: z.enum(['text', 'markdown']),
      isAtAll: z.boolean(),
    }).optional(),
    feishu: z.object({
      msg_type: z.enum(['text', 'rich_text']),
    }).optional(),
    custom: z.object({
      method: z.enum(['GET', 'POST', 'PUT']),
      headers: z.record(z.string()),
      bodyTemplate: z.string(),
    }).optional(),
  }).optional(),
});

// 表单数据类型
export type WebhookReminderFormData = z.infer<typeof WebhookReminderSchema>;

// 创建提醒的输入类型
export interface CreateReminderInput extends Omit<WebhookReminderFormData, 'timeSlots'> {
  timeSlots: Omit<TimeSlot, 'id'>[];
}

// 更新提醒的输入类型
export interface UpdateReminderInput extends Partial<CreateReminderInput> {
  id: string;
}

// 提醒统计信息
export interface ReminderStats {
  total: number;
  active: number;
  inactive: number;
  totalExecutions: number;
  todayExecutions: number;
  nextExecution?: {
    time: Date;
    reminderName: string;
  };
}

// 执行日志
export interface ReminderExecutionLog {
  id: string;
  reminderId: string;
  timeSlotId: string;
  status: 'success' | 'failed';
  executedAt: Timestamp;
  errorMessage?: string;
  responseStatus?: number;
}

// 导入导出格式
export interface ReminderExportData {
  name: string;
  platform: WebhookPlatform;
  webhookUrl: string;
  messageContent: string;
  timeSlots: Array<{
    time: string;
    isActive: boolean;
    description?: string;
  }>;
  days: string[];
  isActive: boolean;
  platformConfig?: PlatformConfig;
}

// 平台信息
export interface PlatformInfo {
  value: WebhookPlatform;
  label: string;
  icon: string;
  description: string;
  urlPattern?: RegExp;
}

// 常量定义
export const SUPPORTED_PLATFORMS: PlatformInfo[] = [
  {
    value: 'wechat_work',
    label: '企业微信',
    icon: '💬',
    description: '企业微信群机器人',
    urlPattern: /qyapi\.weixin\.qq\.com/
  },
  {
    value: 'dingtalk',
    label: '钉钉',
    icon: '📱',
    description: '钉钉群机器人',
    urlPattern: /oapi\.dingtalk\.com/
  },
  {
    value: 'feishu',
    label: '飞书',
    icon: '🚀',
    description: '飞书群机器人',
    urlPattern: /open\.feishu\.cn/
  },
  {
    value: 'slack',
    label: 'Slack',
    icon: '💼',
    description: 'Slack Webhook',
    urlPattern: /hooks\.slack\.com/
  },
  {
    value: 'custom',
    label: '自定义',
    icon: '⚙️',
    description: '自定义Webhook接口'
  }
];

export const WEEKDAYS = [
  { value: '1', label: '周一', shortLabel: '一' },
  { value: '2', label: '周二', shortLabel: '二' },
  { value: '3', label: '周三', shortLabel: '三' },
  { value: '4', label: '周四', shortLabel: '四' },
  { value: '5', label: '周五', shortLabel: '五' },
  { value: '6', label: '周六', shortLabel: '六' },
  { value: '0', label: '周日', shortLabel: '日' },
];

export const MAX_TIME_SLOTS = 3;
export const MAX_REMINDER_NAME_LENGTH = 100;
export const MAX_MESSAGE_CONTENT_LENGTH = 1000;
