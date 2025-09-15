/**
 * 通知处理服务
 * 负责处理不同类型通知的生成和处理逻辑
 */
import { 
  Notification, 
  NotificationType, 
  NotificationPriority,
  CreateNotificationParams
} from '../types/Notification';
import { Task, TaskStatus } from '../types/Task';
import { createNotification } from './notificationService';
import { useNotificationStore } from '../store/notificationStore';

/**
 * 创建截止日期提醒通知
 * @param task 任务对象
 * @returns 通知创建参数
 */
export const createDueDateNotification = (task: Task): CreateNotificationParams => {
  if (!task.dueDate) {
    throw new Error('任务没有截止日期');
  }
  
  const dueDate = new Date(task.dueDate);
  const formattedDueDate = dueDate.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return {
    title: `任务即将到期: ${task.title}`,
    message: `您的任务 "${task.title}" 将在 ${formattedDueDate} 到期，请及时完成。`,
    type: NotificationType.DUE_DATE,
    priority: NotificationPriority.HIGH,
    taskId: String(task.id),
    data: {
      taskTitle: task.title,
      dueDate: task.dueDate,
      priority: task.priority
    }
  };
};

/**
 * 创建任务分配通知
 * @param task 任务对象
 * @param assignedBy 分配者（可选）
 * @returns 通知创建参数
 */
export const createTaskAssignedNotification = (task: Task, assignedBy?: string): CreateNotificationParams => {
  const assignedInfo = assignedBy ? `由 ${assignedBy} 分配给您` : '分配给您';
  
  return {
    title: `新任务分配: ${task.title}`,
    message: `一个新任务 "${task.title}" ${assignedInfo}。`,
    type: NotificationType.TASK_ASSIGNED,
    priority: NotificationPriority.MEDIUM,
    taskId: String(task.id),
    data: {
      taskTitle: task.title,
      assignedBy: assignedBy
    }
  };
};

/**
 * 创建任务更新通知
 * @param task 任务对象
 * @param changes 变更信息
 * @returns 通知创建参数
 */
export const createTaskUpdatedNotification = (task: Task, changes: string[]): CreateNotificationParams => {
  const changesList = changes.join('、');
  
  return {
    title: `任务已更新: ${task.title}`,
    message: `任务 "${task.title}" 的以下内容已更新: ${changesList}。`,
    type: NotificationType.TASK_UPDATED,
    priority: NotificationPriority.MEDIUM,
    taskId: String(task.id),
    data: {
      taskTitle: task.title,
      changes: changes
    }
  };
};

/**
 * 创建树木健康提醒通知
 * @param treeId 树木ID
 * @param health 健康状态
 * @param recommendation 建议
 * @returns 通知创建参数
 */
export const createTreeHealthNotification = (
  treeId: string, 
  health: number, 
  recommendation: string
): CreateNotificationParams => {
  let priority = NotificationPriority.MEDIUM;
  let message = `您的树木健康状态良好 (${health}%)。`;
  
  if (health < 30) {
    priority = NotificationPriority.CRITICAL;
    message = `您的树木健康状态严重不佳 (${health}%)。${recommendation}`;
  } else if (health < 50) {
    priority = NotificationPriority.HIGH;
    message = `您的树木健康状态不佳 (${health}%)。${recommendation}`;
  } else if (health < 70) {
    priority = NotificationPriority.MEDIUM;
    message = `您的树木健康状态一般 (${health}%)。${recommendation}`;
  }
  
  return {
    title: `树木健康提醒`,
    message: message,
    type: NotificationType.TREE_HEALTH,
    priority: priority,
    treeId: treeId,
    data: {
      health: health,
      recommendation: recommendation
    }
  };
};

/**
 * 创建系统通知
 * @param title 通知标题
 * @param message 通知内容
 * @param priority 通知优先级
 * @returns 通知创建参数
 */
export const createSystemNotification = (
  title: string,
  message: string,
  priority: NotificationPriority = NotificationPriority.MEDIUM
): CreateNotificationParams => {
  return {
    title: title,
    message: message,
    type: NotificationType.SYSTEM,
    priority: priority
  };
};

/**
 * 发送通知
 * @param notificationParams 通知创建参数
 */
export const sendNotification = async (
  notificationParams: CreateNotificationParams
): Promise<void> => {
  try {
    // 1. 检查通知设置是否开启
    const { settings } = useNotificationStore.getState();
    if (!settings.enabled) {
      console.log('通知功能已禁用，不发送通知');
      return;
    }
    
    // 2. 向服务器发送通知请求
    const response = await createNotification(notificationParams);
    console.log('通知创建成功:', response.data);
    
    // 3. 添加到本地通知存储
    useNotificationStore.getState().addNotification(notificationParams);
    
    // 4. 如果桌面通知开启，则显示桌面通知
    if (settings.desktopNotificationsEnabled) {
      showDesktopNotification(notificationParams.title, notificationParams.message);
    }
  } catch (error) {
    console.error('发送通知失败:', error);
    // 即使API调用失败，也添加到本地通知存储
    useNotificationStore.getState().addNotification(notificationParams);
  }
};

/**
 * 显示桌面通知
 * @param title 通知标题
 * @param message 通知内容
 */
const showDesktopNotification = (title: string, message: string): void => {
  // 检查浏览器是否支持通知
  if (!('Notification' in window)) {
    console.log('此浏览器不支持桌面通知');
    return;
  }
  
  // 检查权限
  if (Notification.permission === 'granted') {
    new Notification(title, { body: message });
  } else if (Notification.permission !== 'denied') {
    // 请求权限
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification(title, { body: message });
      }
    });
  }
};

/**
 * 检查任务截止日期并发送提醒
 * @param tasks 任务列表
 * @param reminderHours 提前多少小时提醒
 */
export const checkTaskDueDates = (tasks: Task[], reminderHours: number): void => {
  const now = new Date();
  const reminderThreshold = new Date(now.getTime() + reminderHours * 60 * 60 * 1000);
  
  tasks.forEach(task => {
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      
      // 如果任务截止日期在提醒阈值内且未完成
      if (dueDate <= reminderThreshold && dueDate > now && task.status !== TaskStatus.COMPLETED) {
        const notification = createDueDateNotification(task);
        sendNotification(notification);
      }
    }
  });
}; 