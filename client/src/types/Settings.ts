/**
 * 主题类型枚举
 */
export enum ThemeType {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system'
}

/**
 * 任务视图类型枚举
 */
export enum TaskViewType {
  LIST = 'list',
  KANBAN = 'kanban',
  CALENDAR = 'calendar'
}

/**
 * 渲染质量枚举
 */
export enum RenderQuality {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

/**
 * 设置类型定义
 */
export interface Settings {
  // 主题设置
  theme: ThemeType;
  
  // 通知设置
  notificationsEnabled: boolean;
  dueDateReminderHours: number;
  dailyDigestEnabled: boolean;
  
  // 显示设置
  taskListView: TaskViewType;
  defaultSortField: string;
  defaultSortOrder: 'asc' | 'desc';
  
  // 森林设置
  renderQuality: RenderQuality;
  autoRotate: boolean;
  weatherEffects: boolean;
  ambientSound: boolean;
}

/**
 * 默认设置
 */
export const defaultSettings: Settings = {
  // 主题设置
  theme: ThemeType.LIGHT,
  
  // 通知设置
  notificationsEnabled: true,
  dueDateReminderHours: 24,
  dailyDigestEnabled: true,
  
  // 显示设置
  taskListView: TaskViewType.KANBAN,
  defaultSortField: 'dueDate',
  defaultSortOrder: 'asc',
  
  // 森林设置
  renderQuality: RenderQuality.HIGH,
  autoRotate: true,
  weatherEffects: true,
  ambientSound: true
}; 