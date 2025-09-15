/**
 * 通知服务集成示例
 * 这个文件展示了如何在应用的不同部分集成通知功能
 */

import { Task, TaskStatus } from '../types/Task';
import { 
  createDueDateNotification,
  createTaskAssignedNotification,
  createTaskUpdatedNotification,
  createTreeHealthNotification,
  createSystemNotification,
  sendNotification
} from './notificationHandlerService';
import { NotificationPriority } from '../types/Notification';
import { useNotificationStore } from '../store/notificationStore';
import { updateNotificationSettings } from './notificationService';

// 定义调度器服务接口，而不是尝试导入模块
interface NotificationSchedulerService {
  initNotificationScheduler(): void;
  clearNotificationSchedulers(): void;
  checkDueDatesNow(): Promise<void>;
  reinitializeSchedulers(): void;
}

// 假设这些函数在调度器服务模块中存在
const mockSchedulerService: NotificationSchedulerService = {
  initNotificationScheduler: () => {
    console.log('初始化通知调度器');
    // 实际调用会在服务可用时替换这个模拟实现
  },
  clearNotificationSchedulers: () => {
    console.log('清除通知调度器');
    // 实际调用会在服务可用时替换这个模拟实现
  },
  checkDueDatesNow: async () => {
    console.log('检查任务截止日期');
    // 实际调用会在服务可用时替换这个模拟实现
  },
  reinitializeSchedulers: () => {
    console.log('重新初始化通知调度器');
    // 实际调用会在服务可用时替换这个模拟实现
  }
};

/**
 * 示例1: 应用初始化时启动通知服务
 */
export const setupNotifications = async (): Promise<() => void> => {
  // 在实际应用中，这里会导入真正的调度器服务
  // 这里使用模拟服务进行演示
  const schedulerService = mockSchedulerService;
  
  // 初始化通知调度器
  schedulerService.initNotificationScheduler();
  
  // 注册设置变更监听
  const unsubscribe = useNotificationStore.subscribe(
    (state, prevState) => {
      // 当通知设置发生变化时重新初始化调度器
      if (JSON.stringify(state.settings) !== JSON.stringify(prevState.settings)) {
        console.log('通知设置已变更，重新初始化通知调度器');
        
        schedulerService.reinitializeSchedulers();
        
        // 将设置保存到服务器
        updateNotificationSettings(state.settings)
          .then(() => console.log('通知设置已同步到服务器'))
          .catch(error => console.error('同步通知设置失败:', error));
      }
    }
  );
  
  // 返回取消订阅函数，在应用卸载时调用
  return unsubscribe;
};

/**
 * 示例2: 当创建新任务时发送通知
 */
export const handleNewTaskCreated = (task: Task, assignedBy?: string): void => {
  // 创建任务分配通知
  const notification = createTaskAssignedNotification(task, assignedBy);
  
  // 发送通知
  sendNotification(notification);
};

/**
 * 示例3: 当更新任务时发送通知
 */
export const handleTaskUpdated = (
  task: Task, 
  oldTask: Task, 
  modifiedFields: string[]
): void => {
  // 创建任务更新通知
  const notification = createTaskUpdatedNotification(task, modifiedFields);
  
  // 发送通知
  sendNotification(notification);
};

/**
 * 示例4: 当任务状态变更为完成时发送通知
 */
export const handleTaskCompleted = (task: Task): void => {
  if (task.status === TaskStatus.COMPLETED) {
    // 创建系统通知
    const notification = createSystemNotification(
      '任务完成',
      `恭喜！您已完成任务 "${task.title}"`,
      NotificationPriority.MEDIUM
    );
    
    // 发送通知
    sendNotification(notification);
  }
};

/**
 * 示例5: 当树木健康状态下降时发送通知
 */
export const handleTreeHealthChanged = (
  treeId: string, 
  healthPercent: number, 
  previousHealthPercent: number
): void => {
  // 如果健康度下降超过10%，发送通知
  if (previousHealthPercent - healthPercent >= 10) {
    let recommendation = '';
    
    if (healthPercent < 30) {
      recommendation = '建议立即完成一些相关任务来恢复树木健康。';
    } else if (healthPercent < 50) {
      recommendation = '建议尽快完成一些相关任务。';
    } else {
      recommendation = '建议关注树木健康状态变化。';
    }
    
    // 创建树木健康通知
    const notification = createTreeHealthNotification(
      treeId,
      healthPercent,
      recommendation
    );
    
    // 发送通知
    sendNotification(notification);
  }
};

/**
 * 示例6: 应用处理通知权限
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  // 检查浏览器是否支持通知
  if (!('Notification' in window)) {
    console.log('此浏览器不支持桌面通知');
    return false;
  }
  
  // 已经有权限
  if (Notification.permission === 'granted') {
    return true;
  }
  
  // 已经被拒绝
  if (Notification.permission === 'denied') {
    return false;
  }
  
  // 请求权限
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('请求通知权限失败:', error);
    return false;
  }
};

/**
 * 示例7: 在组件中使用通知存储
 * 
 * 在React组件中可以这样使用:
 * 
 * ```tsx
 * import { useNotificationStore } from '../store/notificationStore';
 * 
 * const NotificationsComponent = () => {
 *   const { notifications, unreadCount, markAsRead, deleteNotification } = useNotificationStore();
 *   
 *   // 渲染通知列表...
 * };
 * ```
 */

/**
 * 示例8: 清理通知资源
 */
export const cleanupNotifications = (): void => {
  // 在实际应用中，这里会导入真正的调度器服务
  // 这里使用模拟服务进行演示
  const schedulerService = mockSchedulerService;
  
  // 清除所有通知调度器
  schedulerService.clearNotificationSchedulers();
}; 