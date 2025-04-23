/**
 * 通知优先级枚举
 */
export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

/**
 * 通知类型枚举
 */
export enum NotificationType {
  DUE_DATE = 'DUE_DATE',           // 截止日期提醒
  TREE_HEALTH = 'TREE_HEALTH',     // 树木健康提醒
  TASK_ASSIGNED = 'TASK_ASSIGNED', // 任务分配提醒
  TASK_UPDATED = 'TASK_UPDATED',   // 任务更新提醒
  SYSTEM = 'SYSTEM'                // 系统通知
}

/**
 * 通知接口
 */
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  createdAt: string;
  read: boolean;
  readAt?: string;
  taskId?: string;
  treeId?: string;
  data?: any; // 额外数据
  link?: string; // 可选的链接字段
}

/**
 * 创建通知参数
 */
export interface CreateNotificationParams {
  id?: string;
  title: string;
  message: string;
  type: NotificationType;
  priority?: NotificationPriority;
  createdAt?: string;
  read?: boolean;
  readAt?: string;
  taskId?: string;
  treeId?: string;
  data?: any;
}

/**
 * 通知设置接口
 */
export interface NotificationSettings {
  enabled: boolean;
  dueDateReminderHours: number;
  dailyDigestEnabled: boolean;
  desktopNotificationsEnabled: boolean;
  inAppNotificationsEnabled: boolean;
  emailNotificationsEnabled: boolean;
}

/**
 * 默认通知设置
 */
export const defaultNotificationSettings: NotificationSettings = {
  enabled: true,
  dueDateReminderHours: 24,
  dailyDigestEnabled: true,
  desktopNotificationsEnabled: true,
  inAppNotificationsEnabled: true,
  emailNotificationsEnabled: false
}; 