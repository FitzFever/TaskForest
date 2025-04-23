import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  Notification, 
  NotificationPriority, 
  NotificationType, 
  NotificationSettings, 
  defaultNotificationSettings,
  CreateNotificationParams
} from '../types/Notification';

interface NotificationState {
  // 通知数据
  notifications: Notification[];
  unreadCount: number;
  settings: NotificationSettings;
  
  // 通知操作
  addNotification: (notification: CreateNotificationParams) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  
  // 设置操作
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  resetSettings: () => void;
}

// 创建通知存储
export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      settings: defaultNotificationSettings,
      
      // 添加新通知
      addNotification: (params: CreateNotificationParams) => {
        const notification: Notification = {
          id: params.id || crypto.randomUUID(),
          title: params.title,
          message: params.message,
          type: params.type,
          priority: params.priority || NotificationPriority.MEDIUM,
          createdAt: params.createdAt || new Date().toISOString(),
          read: params.read || false,
          readAt: params.readAt,
          taskId: params.taskId,
          treeId: params.treeId,
          data: params.data
        };
        
        set((state) => {
          // 检查通知是否已存在，避免重复
          const exists = state.notifications.some(n => n.id === notification.id);
          if (exists) return state;
          
          const newNotifications = [notification, ...state.notifications]
            // 按创建时间排序
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          
          // 更新未读计数
          const unreadCount = newNotifications.filter(n => !n.read).length;
          
          return { 
            notifications: newNotifications,
            unreadCount
          };
        });
      },
      
      // 标记通知为已读
      markAsRead: (id: string) => {
        set((state) => {
          const updated = state.notifications.map(n => 
            n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n
          );
          
          const unreadCount = updated.filter(n => !n.read).length;
          
          return { 
            notifications: updated,
            unreadCount
          };
        });
      },
      
      // 标记所有通知为已读
      markAllAsRead: () => {
        set((state) => {
          const now = new Date().toISOString();
          const updated = state.notifications.map(n => ({
            ...n,
            read: true,
            readAt: n.readAt || now
          }));
          
          return { 
            notifications: updated,
            unreadCount: 0
          };
        });
      },
      
      // 删除通知
      deleteNotification: (id: string) => {
        set((state) => {
          const filtered = state.notifications.filter(n => n.id !== id);
          const unreadCount = filtered.filter(n => !n.read).length;
          
          return { 
            notifications: filtered,
            unreadCount
          };
        });
      },
      
      // 清除所有通知
      clearAll: () => {
        set({ notifications: [], unreadCount: 0 });
      },
      
      // 更新通知设置
      updateSettings: (newSettings: Partial<NotificationSettings>) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        }));
      },
      
      // 重置通知设置为默认值
      resetSettings: () => {
        set({ settings: defaultNotificationSettings });
      }
    }),
    {
      name: 'taskforest-notifications',
    }
  )
); 