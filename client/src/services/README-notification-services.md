# 通知服务架构设计与使用指南

## 简介

通知服务负责管理、存储和显示应用内的各类通知，包括任务截止日期提醒、树木健康状态、任务分配通知等。本文档介绍通知服务的架构设计和使用方法。

## 文件结构

通知服务由以下几个关键文件组成：

1. `types/Notification.ts` - 通知相关的类型定义
2. `store/notificationStore.ts` - 通知数据的客户端状态管理
3. `services/notificationService.ts` - 通知相关的API服务
4. `services/notificationHandlerService.ts` - 通知处理逻辑
5. `services/notificationSchedulerService.ts` - 通知调度服务
6. `components/NotificationBell.tsx` - 通知铃铛组件
7. `components/NotificationList.tsx` - 通知列表组件

## 通知类型

系统支持多种通知类型：

```typescript
export enum NotificationType {
  DUE_DATE = 'DUE_DATE',           // 截止日期提醒
  TREE_HEALTH = 'TREE_HEALTH',     // 树木健康提醒
  TASK_ASSIGNED = 'TASK_ASSIGNED', // 任务分配提醒
  TASK_UPDATED = 'TASK_UPDATED',   // 任务更新提醒
  SYSTEM = 'SYSTEM'                // 系统通知
}
```

通知优先级：

```typescript
export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}
```

## 状态管理

通知状态管理使用Zustand实现，提供以下功能：

- 存储通知列表
- 跟踪未读通知计数
- 添加新通知
- 标记通知为已读
- 删除通知
- 管理通知设置

## 如何使用

### 1. 在组件中访问通知

```tsx
import { useNotificationStore } from '../store/notificationStore';

const MyComponent = () => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    deleteNotification 
  } = useNotificationStore();
  
  // 使用通知数据...
};
```

### 2. 创建和发送通知

```typescript
import { 
  createDueDateNotification,
  sendNotification 
} from './notificationHandlerService';

// 假设有一个任务对象
const task = { ... };

// 创建截止日期提醒通知
const notification = createDueDateNotification(task);

// 发送通知
sendNotification(notification);
```

### 3. 在应用初始化时设置通知服务

```typescript
import { setupNotifications, cleanupNotifications } from './notificationIntegrationExample';

// 在应用启动时
const cleanup = await setupNotifications();

// 在应用卸载时
cleanup();
await cleanupNotifications();
```

### 4. 更新通知设置

```typescript
import { useNotificationStore } from '../store/notificationStore';

// 获取设置更新函数
const { updateSettings } = useNotificationStore();

// 更新设置
updateSettings({
  enabled: true,
  dueDateReminderHours: 24,
  dailyDigestEnabled: true,
  desktopNotificationsEnabled: true
});
```

## 通知服务组件

### 1. 通知铃铛组件

`NotificationBell` 组件可以集成到应用的导航栏中，显示未读通知数量。

```tsx
import { NotificationBell } from '../components/NotificationBell';

const Header = () => {
  return (
    <header>
      <h1>任务森林</h1>
      <div className="header-actions">
        <NotificationBell />
        {/* 其他头部元素 */}
      </div>
    </header>
  );
};
```

### 2. 通知列表组件

`NotificationList` 组件通常由 `NotificationBell` 组件控制显示，但也可以单独使用。

```tsx
import { NotificationList } from '../components/NotificationList';

const NotificationsPage = () => {
  return (
    <div className="notifications-page">
      <h1>所有通知</h1>
      <NotificationList />
    </div>
  );
};
```

## 桌面通知

系统支持桌面通知，但需要用户授予权限。可以使用 `requestNotificationPermission` 函数请求权限：

```typescript
import { requestNotificationPermission } from './notificationIntegrationExample';

const enableDesktopNotifications = async () => {
  const granted = await requestNotificationPermission();
  
  if (granted) {
    console.log('桌面通知权限已授予');
    // 更新设置
    useNotificationStore.getState().updateSettings({
      desktopNotificationsEnabled: true
    });
  } else {
    console.log('桌面通知权限被拒绝');
  }
};
```

## 定时通知

系统支持定时通知，包括：

1. 截止日期提醒 - 在任务到期前指定时间发送提醒
2. 每日摘要 - 每天早上发送当天任务摘要

这些功能由 `notificationSchedulerService.ts` 实现，通常在应用初始化时自动启动。

## API接口

通知服务与后端API交互，包括以下接口：

- `GET /notifications` - 获取通知列表
- `GET /notifications/stats` - 获取通知统计
- `POST /notifications` - 创建通知
- `PATCH /notifications/{id}/read` - 标记通知为已读
- `PATCH /notifications/read-all` - 标记所有通知为已读
- `DELETE /notifications/{id}` - 删除通知
- `DELETE /notifications` - 清除所有通知
- `GET /notifications/settings` - 获取通知设置
- `PUT /notifications/settings` - 更新通知设置

## 扩展通知类型

如果需要添加新的通知类型，请按照以下步骤操作：

1. 在 `types/Notification.ts` 中扩展 `NotificationType` 枚举
2. 在 `notificationHandlerService.ts` 中添加相应的通知创建函数
3. 在适当的地方集成新通知类型

## 跨浏览器兼容性

桌面通知功能使用Web Notifications API，该API在现代浏览器中得到广泛支持。系统会自动检测浏览器是否支持该功能，如果不支持，将仅显示应用内通知。 