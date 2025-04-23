# TaskForest 通知系统实现指南

本文档提供了 TaskForest 项目截止日期提醒系统的详细实现指南，包括技术要点、实现步骤和最佳实践。该指南旨在帮助开发者理解和实现任务截止日期提醒功能。

## 功能概述

截止日期提醒系统主要实现以下功能：

1. 根据用户设置的时间提前提醒任务截止日期
2. 提供不同紧急程度的通知样式（普通、警告、紧急）
3. 支持自定义提醒时间和频率
4. 与任务管理和树木健康系统集成

## 系统架构

### 前端架构

```
client/
├── src/
│   ├── components/
│   │   ├── NotificationSystem.tsx     # 通知系统核心组件
│   │   ├── NotificationSettings.tsx   # 通知设置组件
│   │   └── NotificationList.tsx       # 通知列表展示组件
│   ├── services/
│   │   └── notificationService.ts     # 通知相关API调用
│   ├── store/
│   │   └── notificationStore.ts       # 通知状态管理
│   └── types/
│       └── Notification.ts            # 通知相关类型定义
```

### 后端架构

```
server/
├── src/
│   ├── controllers/
│   │   └── notificationController.ts  # 通知API控制器
│   ├── services/
│   │   └── notificationService.ts     # 通知业务逻辑
│   ├── models/
│   │   └── notification.ts            # 通知数据模型
│   └── routes/
│       └── notificationRoutes.ts      # 通知相关路由
```

## 实现步骤

### 1. 数据模型定义

首先，我们需要定义通知相关的数据模型。

**前端类型定义 (client/src/types/Notification.ts)**

```typescript
/**
 * 通知优先级
 */
export enum NotificationPriority {
  LOW = 'LOW',            // 普通提醒
  MEDIUM = 'MEDIUM',      // 重要提醒
  HIGH = 'HIGH',          // 紧急提醒
  CRITICAL = 'CRITICAL'   // 极紧急提醒
}

/**
 * 通知类型
 */
export enum NotificationType {
  DUE_DATE = 'DUE_DATE',           // 截止日期提醒
  TREE_HEALTH = 'TREE_HEALTH',     // 树木健康提醒
  TASK_ASSIGNED = 'TASK_ASSIGNED', // 任务分配提醒
  TASK_UPDATED = 'TASK_UPDATED',   // 任务更新提醒
  SYSTEM = 'SYSTEM'                // 系统通知
}

/**
 * 通知数据接口
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
```

**后端数据模型 (server/src/models/notification.ts)**

要添加到 Prisma Schema 中的定义:

```prisma
model Notification {
  id          String   @id @default(uuid())
  title       String
  message     String
  type        String
  priority    String
  createdAt   DateTime @default(now())
  read        Boolean  @default(false)
  readAt      DateTime?
  taskId      String?
  treeId      String?
  data        Json?
  userId      String
  user        User     @relation(fields: [userId], references: [id])
}
```

### 2. 前端实现

#### 通知系统核心组件 (client/src/components/NotificationSystem.tsx)

```tsx
import React, { useEffect, useState } from 'react';
import { notification } from 'antd';
import { useTaskStore } from '../store/taskStore';
import { useSettingsStore } from '../store/settingsStore';
import { useNotificationStore } from '../store/notificationStore';
import dayjs from 'dayjs';
import { ClockCircleOutlined, WarningOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { NotificationPriority, NotificationType } from '../types/Notification';

const NotificationSystem: React.FC = () => {
  const { tasks } = useTaskStore();
  const { settings } = useSettingsStore();
  const { 
    addNotification, 
    markAsRead,
    fetchNotifications 
  } = useNotificationStore();
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({});
  
  // 请求浏览器通知权限
  useEffect(() => {
    if (settings.notificationsEnabled && 
        settings.desktopNotificationsEnabled && 
        'Notification' in window) {
      Notification.requestPermission();
    }
  }, [settings.notificationsEnabled, settings.desktopNotificationsEnabled]);

  // 定期从服务器获取通知
  useEffect(() => {
    if (settings.notificationsEnabled) {
      // 初始加载
      fetchNotifications();
      
      // 设置定期刷新
      const intervalId = setInterval(() => {
        fetchNotifications();
      }, 5 * 60 * 1000); // 每5分钟
      
      return () => clearInterval(intervalId);
    }
  }, [settings.notificationsEnabled, fetchNotifications]);

  // 检查任务截止日期
  useEffect(() => {
    if (!settings.notificationsEnabled) return;
    
    const checkDeadlines = () => {
      const now = dayjs();
      
      tasks.forEach(task => {
        // 忽略已完成任务和已经提醒过的任务
        if (task.completed || checkedTasks[task.id]) return;
        
        if (task.dueDate) {
          const dueDate = dayjs(task.dueDate);
          const hoursRemaining = dueDate.diff(now, 'hour');
          
          // 任务即将到期提醒
          if (hoursRemaining === settings.dueDateReminderHours) {
            // 添加到通知存储
            addNotification({
              title: '任务即将到期',
              message: `任务"${task.title}"将在${settings.dueDateReminderHours}小时后到期`,
              type: NotificationType.DUE_DATE,
              priority: NotificationPriority.MEDIUM,
              taskId: task.id
            });
            
            // 显示界面通知
            if (settings.inAppNotificationsEnabled) {
              notification.info({
                message: '任务即将到期',
                description: `任务"${task.title}"将在${settings.dueDateReminderHours}小时后到期`,
                icon: <ClockCircleOutlined style={{ color: '#1890ff' }} />,
                duration: 0,
                onClick: () => markAsRead(task.id)
              });
            }
            
            // 显示桌面通知
            if (settings.desktopNotificationsEnabled && 
                'Notification' in window && 
                Notification.permission === 'granted') {
              const desktopNotification = new Notification('TaskForest - 任务即将到期', {
                body: `任务"${task.title}"将在${settings.dueDateReminderHours}小时后到期`,
                icon: '/logo.png'
              });
              desktopNotification.onclick = () => markAsRead(task.id);
            }
            
            // 标记已提醒
            setCheckedTasks(prev => ({ ...prev, [task.id]: true }));
          }
          
          // 紧急任务提醒（少于3小时）
          if (hoursRemaining <= 3 && hoursRemaining > 0 && !checkedTasks[`${task.id}-urgent`]) {
            // 添加到通知存储
            addNotification({
              title: '任务紧急',
              message: `任务"${task.title}"即将在${hoursRemaining}小时后到期`,
              type: NotificationType.DUE_DATE,
              priority: NotificationPriority.HIGH,
              taskId: task.id
            });
            
            // 显示界面通知
            if (settings.inAppNotificationsEnabled) {
              notification.warning({
                message: '任务紧急',
                description: `任务"${task.title}"即将在${hoursRemaining}小时后到期`,
                icon: <WarningOutlined style={{ color: '#faad14' }} />,
                duration: 0,
                onClick: () => markAsRead(`${task.id}-urgent`)
              });
            }
            
            // 显示桌面通知
            if (settings.desktopNotificationsEnabled && 
                'Notification' in window && 
                Notification.permission === 'granted') {
              const desktopNotification = new Notification('TaskForest - 任务紧急', {
                body: `任务"${task.title}"即将在${hoursRemaining}小时后到期`,
                icon: '/logo.png'
              });
              desktopNotification.onclick = () => markAsRead(`${task.id}-urgent`);
            }
            
            // 标记已提醒
            setCheckedTasks(prev => ({ ...prev, [`${task.id}-urgent`]: true }));
          }
          
          // 已逾期任务提醒
          if (hoursRemaining < 0 && !checkedTasks[`${task.id}-overdue`]) {
            // 添加到通知存储
            addNotification({
              title: '任务已逾期',
              message: `任务"${task.title}"已逾期${Math.abs(Math.floor(hoursRemaining / 24))}天`,
              type: NotificationType.DUE_DATE,
              priority: NotificationPriority.CRITICAL,
              taskId: task.id
            });
            
            // 显示界面通知
            if (settings.inAppNotificationsEnabled) {
              notification.error({
                message: '任务已逾期',
                description: `任务"${task.title}"已逾期${Math.abs(Math.floor(hoursRemaining / 24))}天`,
                duration: 0,
                onClick: () => markAsRead(`${task.id}-overdue`)
              });
            }
            
            // 显示桌面通知
            if (settings.desktopNotificationsEnabled && 
                'Notification' in window && 
                Notification.permission === 'granted') {
              const desktopNotification = new Notification('TaskForest - 任务已逾期', {
                body: `任务"${task.title}"已逾期${Math.abs(Math.floor(hoursRemaining / 24))}天`,
                icon: '/logo.png'
              });
              desktopNotification.onclick = () => markAsRead(`${task.id}-overdue`);
            }
            
            // 标记已提醒
            setCheckedTasks(prev => ({ ...prev, [`${task.id}-overdue`]: true }));
          }
        }
      });
    };
    
    // 初次检查
    checkDeadlines();
    
    // 设置定期检查
    const intervalId = setInterval(checkDeadlines, 10 * 60 * 1000); // 每10分钟
    
    return () => clearInterval(intervalId);
  }, [tasks, settings, addNotification, markAsRead, checkedTasks]);
  
  return null; // 功能性组件，不需要渲染UI
};

export default NotificationSystem;
```

#### 通知状态管理 (client/src/store/notificationStore.ts)

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Notification, NotificationPriority, NotificationType } from '../types/Notification';
import api from '../services/api';

interface NotificationState {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  
  // 操作方法
  fetchNotifications: () => Promise<void>;
  addNotification: (notification: Partial<Notification>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      loading: false,
      error: null,
      
      fetchNotifications: async () => {
        set({ loading: true, error: null });
        try {
          const response = await api.get('/notifications');
          if (response.data && response.data.data) {
            set({ notifications: response.data.data });
          }
        } catch (error) {
          console.error('获取通知失败:', error);
          set({ error: '获取通知失败' });
        } finally {
          set({ loading: false });
        }
      },
      
      addNotification: (notification) => {
        const id = notification.id || `notification-${Date.now()}`;
        const newNotification: Notification = {
          id,
          title: notification.title || '系统通知',
          message: notification.message || '',
          type: notification.type || NotificationType.SYSTEM,
          priority: notification.priority || NotificationPriority.MEDIUM,
          createdAt: notification.createdAt || new Date().toISOString(),
          read: notification.read || false,
          readAt: notification.readAt,
          taskId: notification.taskId,
          treeId: notification.treeId,
          data: notification.data
        };
        
        set(state => ({
          notifications: [newNotification, ...state.notifications]
        }));
        
        // 也可以同步到后端
        try {
          api.post('/notifications', newNotification);
        } catch (error) {
          console.error('保存通知失败:', error);
        }
      },
      
      markAsRead: (notificationId) => {
        set(state => ({
          notifications: state.notifications.map(item => 
            item.id === notificationId 
              ? { ...item, read: true, readAt: new Date().toISOString() } 
              : item
          )
        }));
        
        // 同步到后端
        try {
          api.patch(`/notifications/${notificationId}/read`);
        } catch (error) {
          console.error('标记通知已读失败:', error);
        }
      },
      
      markAllAsRead: () => {
        set(state => ({
          notifications: state.notifications.map(item => 
            !item.read 
              ? { ...item, read: true, readAt: new Date().toISOString() } 
              : item
          )
        }));
        
        // 同步到后端
        try {
          api.post('/notifications/read-all');
        } catch (error) {
          console.error('标记所有通知已读失败:', error);
        }
      },
      
      deleteNotification: (notificationId) => {
        set(state => ({
          notifications: state.notifications.filter(item => item.id !== notificationId)
        }));
        
        // 同步到后端
        try {
          api.delete(`/notifications/${notificationId}`);
        } catch (error) {
          console.error('删除通知失败:', error);
        }
      },
      
      clearAllNotifications: () => {
        set({ notifications: [] });
        
        // 同步到后端
        try {
          api.delete('/notifications/clear-all');
        } catch (error) {
          console.error('清空所有通知失败:', error);
        }
      }
    }),
    {
      name: 'taskforest-notifications',
      partialize: state => ({ notifications: state.notifications })
    }
  )
);
```

### 3. 后端实现

#### 通知服务 (server/src/services/notificationService.ts)

```typescript
import { PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';

const prisma = new PrismaClient();

interface DueDateTasksParams {
  userId?: string;
  hoursThreshold: number;
}

/**
 * 获取即将到期的任务
 * @param params 查询参数
 * @returns 即将到期的任务列表
 */
export async function getDueDateTasks({ userId, hoursThreshold }: DueDateTasksParams) {
  const now = new Date();
  const thresholdDate = dayjs(now).add(hoursThreshold, 'hour').toDate();
  
  return prisma.task.findMany({
    where: {
      userId: userId,
      status: {
        not: 'COMPLETED'
      },
      dueDate: {
        lte: thresholdDate,
        gt: now
      }
    },
    orderBy: {
      dueDate: 'asc'
    },
    include: {
      tree: true
    }
  });
}

/**
 * 获取逾期任务
 * @param userId 用户ID（可选）
 * @returns 逾期任务列表 
 */
export async function getOverdueTasks(userId?: string) {
  const now = new Date();
  
  return prisma.task.findMany({
    where: {
      userId: userId,
      status: {
        not: 'COMPLETED'
      },
      dueDate: {
        lt: now
      }
    },
    orderBy: {
      dueDate: 'asc'
    }
  });
}

/**
 * 获取今日到期的任务列表
 */
export async function getTodayDueTasks(userId?: string) {
  const now = new Date();
  const endOfDay = dayjs(now).endOf('day').toDate();
  
  return prisma.task.findMany({
    where: {
      userId: userId,
      status: {
        not: 'COMPLETED'
      },
      dueDate: {
        lte: endOfDay,
        gt: now
      }
    },
    orderBy: {
      dueDate: 'asc'
    }
  });
}

/**
 * 创建通知
 */
export async function createNotification(data) {
  return prisma.notification.create({
    data
  });
}

/**
 * 获取用户通知列表
 */
export async function getUserNotifications(userId: string, options = { limit: 20, offset: 0 }) {
  return prisma.notification.findMany({
    where: {
      userId
    },
    orderBy: {
      createdAt: 'desc'
    },
    skip: options.offset,
    take: options.limit
  });
}

/**
 * 标记通知为已读
 */
export async function markNotificationRead(notificationId: string) {
  return prisma.notification.update({
    where: {
      id: notificationId
    },
    data: {
      read: true,
      readAt: new Date()
    }
  });
}

/**
 * 标记所有通知为已读
 */
export async function markAllNotificationsRead(userId: string) {
  return prisma.notification.updateMany({
    where: {
      userId,
      read: false
    },
    data: {
      read: true,
      readAt: new Date()
    }
  });
}

/**
 * 删除通知
 */
export async function deleteNotification(notificationId: string) {
  return prisma.notification.delete({
    where: {
      id: notificationId
    }
  });
}

/**
 * 清空用户所有通知
 */
export async function clearAllNotifications(userId: string) {
  return prisma.notification.deleteMany({
    where: {
      userId
    }
  });
}

export default {
  getDueDateTasks,
  getOverdueTasks,
  getTodayDueTasks,
  createNotification,
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearAllNotifications
};
```

#### 通知控制器 (server/src/controllers/notificationController.ts)

```typescript
import { Request, Response } from 'express';
import notificationService from '../services/notificationService';

/**
 * 获取用户通知列表
 */
export async function getUserNotifications(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        code: 401,
        message: '未授权',
        timestamp: Date.now()
      });
    }
    
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const notifications = await notificationService.getUserNotifications(userId, { limit, offset });
    
    return res.json({
      code: 200,
      data: notifications,
      message: '获取通知成功',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('获取通知失败:', error);
    return res.status(500).json({
      code: 500,
      message: '获取通知失败',
      error: error.message,
      timestamp: Date.now()
    });
  }
}

/**
 * 创建通知
 */
export async function createNotification(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        code: 401,
        message: '未授权',
        timestamp: Date.now()
      });
    }
    
    const notificationData = {
      ...req.body,
      userId
    };
    
    const notification = await notificationService.createNotification(notificationData);
    
    return res.status(201).json({
      code: 201,
      data: notification,
      message: '创建通知成功',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('创建通知失败:', error);
    return res.status(500).json({
      code: 500,
      message: '创建通知失败',
      error: error.message,
      timestamp: Date.now()
    });
  }
}

/**
 * 标记通知为已读
 */
export async function markAsRead(req: Request, res: Response) {
  try {
    const { notificationId } = req.params;
    
    const notification = await notificationService.markNotificationRead(notificationId);
    
    return res.json({
      code: 200,
      data: notification,
      message: '标记已读成功',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('标记已读失败:', error);
    return res.status(500).json({
      code: 500,
      message: '标记已读失败',
      error: error.message,
      timestamp: Date.now()
    });
  }
}

/**
 * 标记所有通知为已读
 */
export async function markAllAsRead(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        code: 401,
        message: '未授权',
        timestamp: Date.now()
      });
    }
    
    await notificationService.markAllNotificationsRead(userId);
    
    return res.json({
      code: 200,
      message: '所有通知已标记为已读',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('标记所有通知已读失败:', error);
    return res.status(500).json({
      code: 500,
      message: '标记所有通知已读失败',
      error: error.message,
      timestamp: Date.now()
    });
  }
}

/**
 * 删除通知
 */
export async function deleteNotification(req: Request, res: Response) {
  try {
    const { notificationId } = req.params;
    
    await notificationService.deleteNotification(notificationId);
    
    return res.json({
      code: 200,
      message: '删除通知成功',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('删除通知失败:', error);
    return res.status(500).json({
      code: 500,
      message: '删除通知失败',
      error: error.message,
      timestamp: Date.now()
    });
  }
}

/**
 * 清空所有通知
 */
export async function clearAllNotifications(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        code: 401,
        message: '未授权',
        timestamp: Date.now()
      });
    }
    
    await notificationService.clearAllNotifications(userId);
    
    return res.json({
      code: 200,
      message: '清空所有通知成功',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('清空所有通知失败:', error);
    return res.status(500).json({
      code: 500,
      message: '清空所有通知失败',
      error: error.message,
      timestamp: Date.now()
    });
  }
}

/**
 * 获取待办任务提醒
 */
export async function getDueDateReminders(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        code: 401,
        message: '未授权',
        timestamp: Date.now()
      });
    }
    
    const hoursThreshold = parseInt(req.query.hours as string) || 24;
    
    const tasks = await notificationService.getDueDateTasks({
      userId,
      hoursThreshold
    });
    
    return res.json({
      code: 200,
      data: tasks,
      message: '获取任务提醒成功',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('获取任务提醒失败:', error);
    return res.status(500).json({
      code: 500,
      message: '获取任务提醒失败',
      error: error.message,
      timestamp: Date.now()
    });
  }
}

export default {
  getUserNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  getDueDateReminders
};
```

#### 通知路由 (server/src/routes/notificationRoutes.ts)

```typescript
import express from 'express';
import notificationController from '../controllers/notificationController';
import { authenticateUser } from '../middlewares/auth';

const router = express.Router();

// 所有通知路由都需要身份验证
router.use(authenticateUser);

// 获取用户通知列表
router.get('/', notificationController.getUserNotifications);

// 创建通知
router.post('/', notificationController.createNotification);

// 标记通知已读
router.patch('/:notificationId/read', notificationController.markAsRead);

// 标记所有通知已读
router.post('/read-all', notificationController.markAllAsRead);

// 删除通知
router.delete('/:notificationId', notificationController.deleteNotification);

// 清空所有通知
router.delete('/clear-all', notificationController.clearAllNotifications);

// 获取任务截止日期提醒
router.get('/due-date', notificationController.getDueDateReminders);

export default router;
```

### 4. 集成到主应用

在 `client/src/App.tsx` 中集成通知系统组件：

```tsx
import NotificationSystem from './components/NotificationSystem';

// 在App组件中添加
function App() {
  return (
    <>
      <NotificationSystem />
      {/* 其他应用组件 */}
    </>
  );
}

export default App;
```

## 最佳实践

### 性能优化

1. **批量处理**：对于大量的通知检查，采用批量处理方式减少计算负担
2. **计算缓存**：避免重复计算，将计算结果缓存
3. **异步处理**：采用异步方式发送通知，不阻塞主线程

```typescript
// 例如，在检查大量任务时使用批量处理
const taskBatches = chunk(tasks, 50); // 每批50个任务
for (const batch of taskBatches) {
  await Promise.all(batch.map(async task => {
    // 处理单个任务的通知逻辑
  }));
}
```

### 降级策略

针对不同浏览器的通知API兼容性问题，实现降级策略：

```typescript
const sendNotification = (title, options) => {
  // 首选桌面通知
  if ('Notification' in window && Notification.permission === 'granted') {
    return new Notification(title, options);
  }
  
  // 降级到应用内通知
  notification.info({
    message: title,
    description: options.body
  });
  
  // 如果配置了电子邮件通知，可以进一步降级
  if (settings.emailNotificationsEnabled) {
    api.post('/notifications/email', { title, body: options.body });
  }
};
```

### 错误处理

确保通知系统的稳定性，添加全面的错误处理：

```typescript
try {
  // 通知处理逻辑
} catch (error) {
  console.error('通知处理失败:', error);
  
  // 记录错误
  logError('notification_error', error);
  
  // 尝试使用替代方法
  tryAlternativeNotification();
}
```

## 测试指南

测试通知系统的主要场景：

1. **不同截止日期**：测试不同时间范围的截止日期提醒
2. **不同浏览器**：测试在主流浏览器中的兼容性
3. **权限设置**：测试不同通知权限下的行为
4. **设置变更**：测试改变通知设置后的行为

## 常见问题

### 1. 浏览器通知权限被拒绝

如果用户拒绝了浏览器通知权限，应当提供明确的引导：

```typescript
if (Notification.permission === 'denied') {
  // 显示引导信息
  notification.warning({
    message: '通知权限已禁用',
    description: '您已禁用浏览器通知权限，将无法接收桌面提醒。请在浏览器设置中启用通知权限以获得最佳体验。',
    duration: 0
  });
}
```

### 2. 通知重复问题

避免重复通知的策略：

```typescript
// 使用本地存储记录已发送的通知
const notificationKey = `task_${taskId}_${type}_${dayjs().format('YYYY-MM-DD')}`;
const hasNotified = localStorage.getItem(notificationKey);

if (!hasNotified) {
  // 发送通知
  sendNotification(title, options);
  
  // 记录已通知
  localStorage.setItem(notificationKey, 'true');
  
  // 设置过期时间（24小时后过期）
  setTimeout(() => {
    localStorage.removeItem(notificationKey);
  }, 24 * 60 * 60 * 1000);
}
```

### 3. 通知优先级处理

根据通知优先级调整显示策略：

```typescript
const displayNotification = (notification) => {
  switch (notification.priority) {
    case NotificationPriority.CRITICAL:
      // 最高优先级 - 立即显示并保持直到用户操作
      notification.error({
        message: notification.title,
        description: notification.message,
        duration: 0
      });
      break;
    case NotificationPriority.HIGH:
      // 高优先级 - 显示较长时间
      notification.warning({
        message: notification.title,
        description: notification.message,
        duration: 10
      });
      break;
    case NotificationPriority.MEDIUM:
      // 中优先级 - 标准显示
      notification.info({
        message: notification.title,
        description: notification.message,
        duration: 5
      });
      break;
    case NotificationPriority.LOW:
    default:
      // 低优先级 - 短暂显示
      notification.info({
        message: notification.title,
        description: notification.message,
        duration: 3
      });
      break;
  }
};
```

## 后续优化方向

1. **智能通知推送**：基于用户行为和任务重要性自动调整通知频率和时间
2. **多渠道通知**：增加更多通知渠道，如移动应用推送、短信等
3. **通知摘要**：实现每日通知摘要功能，避免过多零散通知
4. **上下文感知通知**：根据用户当前正在做的事情调整通知显示时机和方式
5. **通知分组**：将相关通知分组显示，减少打扰

## 相关文档

- [功能实施计划](../development/implementation_plan.md)
- [开发任务列表](../development_tasks.md)
- [通知系统API文档](../api/notification_api.md) 