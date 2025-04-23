# 通知系统设计文档

## 1. 系统概述

通知系统是TaskForest的核心功能之一，负责管理、存储和显示应用内的各类通知，帮助用户及时获取任务截止日期提醒、树木健康状态变化、任务分配和更新等信息。本文档详细介绍通知系统的设计理念、架构和实现细节。

## 2. 设计目标

- **实时性**：确保用户能够及时收到重要通知
- **多样性**：支持多种通知类型和优先级
- **可定制性**：允许用户根据需要自定义通知设置
- **多渠道**：支持应用内通知和桌面通知
- **可靠性**：确保通知不会丢失，即使在网络连接不稳定的情况下
- **性能优化**：避免通知系统对应用性能产生显著影响

## 3. 系统架构

通知系统采用模块化设计，由以下核心组件构成：

### 3.1 核心组件

系统架构的详细说明见[通知系统架构图](../images/notification_system_architecture.md)。

1. **类型定义模块**：定义通知相关的类型和接口
2. **存储管理模块**：管理通知的本地存储和状态
3. **API服务模块**：处理与后端API的通信
4. **通知处理模块**：负责生成和处理不同类型的通知
5. **调度服务模块**：管理定时通知和重试机制
6. **UI组件模块**：提供通知显示和交互的用户界面

### 3.2 数据流

1. **通知生成**：由任务更新、截止日期检查、树木健康变化等触发
2. **通知处理**：由通知处理服务格式化和处理
3. **通知存储**：保存到本地状态管理和后端服务器
4. **通知显示**：通过UI组件显示给用户
5. **通知操作**：用户可以标记为已读、删除或执行其他操作

## 4. 核心模块实现

### 4.1 类型定义（Notification.ts）

```typescript
export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum NotificationType {
  DUE_DATE = 'DUE_DATE',           // 截止日期提醒
  TREE_HEALTH = 'TREE_HEALTH',     // 树木健康提醒
  TASK_ASSIGNED = 'TASK_ASSIGNED', // 任务分配提醒
  TASK_UPDATED = 'TASK_UPDATED',   // 任务更新提醒
  SYSTEM = 'SYSTEM'                // 系统通知
}

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
  data?: any;
}
```

### 4.2 存储管理（notificationStore.ts）

通知状态管理使用Zustand库实现，提供了以下核心功能：

- 存储通知列表
- 跟踪未读通知计数
- 处理通知的添加、标记和删除
- 管理用户通知设置
- 实现持久化存储

```typescript
export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      settings: defaultNotificationSettings,
      
      // 核心操作实现
      addNotification: (params) => { /* ... */ },
      markAsRead: (id) => { /* ... */ },
      markAllAsRead: () => { /* ... */ },
      deleteNotification: (id) => { /* ... */ },
      clearAll: () => { /* ... */ },
      updateSettings: (newSettings) => { /* ... */ },
      resetSettings: () => { /* ... */ }
    }),
    {
      name: 'taskforest-notifications',
    }
  )
);
```

### 4.3 API服务（notificationService.ts）

提供与后端通知API交互的服务，包括：

- 获取通知列表和统计
- 创建新通知
- 标记通知为已读
- 删除通知
- 管理通知设置

```typescript
export const getNotifications = async (params?: GetNotificationsParams): Promise<AxiosResponse<ApiResponse<NotificationListResponse>>> => {
  /* 实现获取通知列表 */
};

export const createNotification = async (notification: CreateNotificationParams): Promise<AxiosResponse<ApiResponse<Notification>>> => {
  /* 实现创建通知 */
};

export const markAsRead = async (id: string): Promise<AxiosResponse<ApiResponse<Notification>>> => {
  /* 实现标记通知为已读 */
};

// 其他API方法...
```

### 4.4 通知处理（notificationHandlerService.ts）

负责生成和处理不同类型的通知，主要功能包括：

- 创建各种类型的通知
- 发送通知到后端和本地存储
- 处理桌面通知
- 检查任务截止日期

```typescript
export const createDueDateNotification = (task: Task): CreateNotificationParams => {
  /* 实现创建截止日期通知 */
};

export const createTreeHealthNotification = (treeId: string, health: number, recommendation: string): CreateNotificationParams => {
  /* 实现创建树木健康通知 */
};

export const sendNotification = async (notificationParams: CreateNotificationParams): Promise<void> => {
  /* 实现发送通知 */
};
```

### 4.5 调度服务（notificationSchedulerService.ts）

管理定时通知和检查，主要功能包括：

- 定期检查任务截止日期
- 发送每日任务摘要
- 管理通知调度器
- 在设置变更时重新初始化调度器

```typescript
export const initNotificationScheduler = (): void => {
  /* 实现初始化通知调度器 */
};

export const checkDueDatesNow = async (): Promise<void> => {
  /* 实现立即检查截止日期 */
};
```

### 4.6 UI组件

**NotificationBell.tsx**：显示通知图标和未读计数

```tsx
export const NotificationBell: React.FC = () => {
  const { unreadCount, markAllAsRead } = useNotificationStore();
  
  /* 实现通知铃铛组件 */
};
```

**NotificationList.tsx**：显示通知列表和操作按钮

```tsx
export const NotificationList: React.FC<NotificationListProps> = ({ onClose }) => {
  const { notifications, markAsRead, deleteNotification, clearAll } = useNotificationStore();
  
  /* 实现通知列表组件 */
};
```

## 5. 集成与使用

通知系统设计为可在应用的不同部分轻松集成。以下是主要集成点：

### 5.1 应用初始化

在应用启动时初始化通知系统：

```typescript
// 在应用入口或主组件
useEffect(() => {
  const cleanup = setupNotifications();
  
  return () => {
    cleanup();
    cleanupNotifications();
  };
}, []);
```

### 5.2 任务操作集成

当任务状态变更时发送通知：

```typescript
// 任务完成时
const handleTaskComplete = (task: Task) => {
  // 更新任务状态...
  
  // 发送通知
  handleTaskCompleted(task);
};
```

### 5.3 树木健康监控

当树木健康状态变化时发送通知：

```typescript
// 树木健康变化时
const updateTreeHealth = (treeId: string, newHealth: number, oldHealth: number) => {
  // 更新树木健康状态...
  
  // 发送通知
  handleTreeHealthChanged(treeId, newHealth, oldHealth);
};
```

## 6. 通知设置

用户可以通过设置界面自定义通知行为：

- 启用/禁用通知功能
- 设置截止日期提醒时间
- 启用/禁用每日任务摘要
- 启用/禁用桌面通知
- 启用/禁用应用内通知

设置存储在本地并同步到服务器，确保在不同设备上保持一致。

## 7. 安全与隐私考虑

通知系统实现考虑了以下安全和隐私因素：

- 通知内容不包含敏感信息
- 桌面通知需要用户明确授权
- 通知数据使用与其他应用数据相同的安全措施
- 用户可以完全控制通知设置和内容

## 8. 性能优化

为确保通知系统不影响应用性能，实施了以下优化：

- 使用批量操作减少API调用
- 设置通知最大数量限制
- 使用索引加速通知查询
- 实现延迟加载通知内容
- 优化大量通知的渲染性能

## 9. 未来扩展

通知系统设计为可扩展的，未来计划包括：

- 添加邮件通知支持
- 实现通知分组功能
- 添加富文本通知内容
- 支持通知操作按钮
- 添加推送通知支持（移动端）
- 实现通知优先级自动排序

## 10. 调试和监控

为便于开发和排查问题，通知系统包含以下调试功能：

- 详细的日志记录
- 测试通知功能
- 通知处理状态监控
- 失败通知重试机制
- 通知生命周期追踪

## 11. 参考文档

- [API接口参考](../api_reference.md) - 通知相关API详细说明
- [组件文档](../components/notification_components.md) - 通知UI组件说明
- [通知服务README](../../client/src/services/README-notification-services.md) - 通知服务使用指南 