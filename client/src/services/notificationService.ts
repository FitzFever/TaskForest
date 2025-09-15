/**
 * 通知相关API服务
 */
import api from './api';
import { AxiosResponse } from 'axios';
import {
  Notification,
  NotificationType,
  NotificationPriority,
  NotificationSettings,
  CreateNotificationParams
} from '../types/Notification';

/**
 * API响应格式
 */
export interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
  timestamp: string;
}

/**
 * API通知查询参数
 */
export interface GetNotificationsParams {
  read?: boolean;
  type?: NotificationType;
  priority?: NotificationPriority;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

/**
 * API通知分页响应
 */
export interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * 获取通知列表
 * @param params 查询参数
 * @returns 通知列表响应
 */
export const getNotifications = async (params?: GetNotificationsParams): Promise<AxiosResponse<ApiResponse<NotificationListResponse>>> => {
  try {
    console.log('开始请求通知列表:', params);
    
    // 构建查询参数
    const queryParams = new URLSearchParams();
    
    if (params) {
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.read !== undefined) queryParams.append('read', params.read.toString());
      if (params.type) queryParams.append('type', params.type);
      if (params.priority) queryParams.append('priority', params.priority);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
    }
    
    // 构建请求URL
    const url = `/notifications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    console.log('请求URL:', url);
    
    const response = await api.get(url);
    console.log('获取通知列表响应:', response);
    
    return response;
  } catch (error) {
    console.error('获取通知列表失败:', error);
    throw error;
  }
};

/**
 * 获取通知统计
 * @returns 通知统计信息
 */
export const getNotificationStats = async (): Promise<AxiosResponse<ApiResponse<{total: number, unread: number}>>> => {
  try {
    console.log('开始请求通知统计数据');
    
    const response = await api.get('/notifications/stats');
    console.log('获取通知统计响应:', response);
    
    return response;
  } catch (error) {
    console.error('获取通知统计失败:', error);
    throw error;
  }
};

/**
 * 创建通知
 * @param notification 通知创建参数
 * @returns 创建的通知
 */
export const createNotification = async (
  notification: CreateNotificationParams
): Promise<AxiosResponse<ApiResponse<Notification>>> => {
  const response = await api.post('/notifications', notification);
  return response;
};

/**
 * 获取指定ID的通知
 * @param id 通知ID
 * @returns 通知对象
 */
export const getNotification = async (id: string): Promise<AxiosResponse<ApiResponse<Notification>>> => {
  const response = await api.get(`/notifications/${id}`);
  return response;
};

/**
 * 标记通知为已读
 * @param id 通知ID
 * @returns 已更新的通知
 */
export const markAsRead = async (id: string): Promise<AxiosResponse<ApiResponse<Notification>>> => {
  const response = await api.patch(`/notifications/${id}/read`);
  return response;
};

/**
 * 标记所有通知为已读
 * @returns 操作结果
 */
export const markAllAsRead = async (): Promise<AxiosResponse<ApiResponse<{success: boolean; count: number}>>> => {
  const response = await api.patch('/notifications/read-all');
  return response;
};

/**
 * 删除通知
 * @param id 通知ID
 */
export const deleteNotification = async (id: string): Promise<void> => {
  await api.delete(`/notifications/${id}`);
};

/**
 * 清除所有通知
 */
export const clearAllNotifications = async (): Promise<void> => {
  await api.delete('/notifications');
};

/**
 * 获取通知设置
 * @returns 通知设置
 */
export const getNotificationSettings = async (): Promise<AxiosResponse<ApiResponse<NotificationSettings>>> => {
  const response = await api.get('/notifications/settings');
  return response;
};

/**
 * 更新通知设置
 * @param settings 通知设置
 * @returns 更新后的通知设置
 */
export const updateNotificationSettings = async (
  settings: Partial<NotificationSettings>
): Promise<AxiosResponse<ApiResponse<NotificationSettings>>> => {
  const response = await api.put('/notifications/settings', settings);
  return response;
};

/**
 * 测试通知功能
 * @returns 测试通知响应
 */
export const testNotification = async (): Promise<AxiosResponse<ApiResponse<Notification>>> => {
  const response = await api.post('/notifications/test');
  return response;
}; 