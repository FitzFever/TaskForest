import { create } from 'zustand';
import { ApiStatus, ApiError, ApiState } from '../types/Api';
import api from '../services/api';

// API状态管理接口
interface ApiStoreState {
  // 使用请求路径作为键，API状态作为值
  requests: Record<string, ApiState>;
}

// API操作接口
interface ApiStoreActions {
  // 设置API请求状态
  setRequestStatus: (
    path: string, 
    status: ApiStatus, 
    data?: any, 
    error?: ApiError
  ) => void;
  
  // 清除API请求状态
  clearRequest: (path: string) => void;
  
  // 清除所有API请求状态
  clearAllRequests: () => void;
  
  // 执行GET请求
  get: <T = any>(
    path: string, 
    params?: Record<string, any>
  ) => Promise<T>;
  
  // 执行POST请求
  post: <T = any>(
    path: string, 
    data?: any, 
    params?: Record<string, any>
  ) => Promise<T>;
  
  // 执行PUT请求
  put: <T = any>(
    path: string, 
    data?: any, 
    params?: Record<string, any>
  ) => Promise<T>;
  
  // 执行DELETE请求
  delete: <T = any>(
    path: string, 
    params?: Record<string, any>
  ) => Promise<T>;
}

// 组合API状态和操作
export type ApiStore = ApiStoreState & ApiStoreActions;

// 创建store
const useApiStore = create<ApiStore>((set, get) => ({
  // 初始状态
  requests: {},
  
  // 设置API请求状态
  setRequestStatus: (path, status, data = null, error = undefined) => set(state => ({
    requests: {
      ...state.requests,
      [path]: {
        status,
        data,
        error,
        timestamp: Date.now(),
      },
    },
  })),
  
  // 清除单个API请求状态
  clearRequest: (path) => set(state => {
    const { [path]: _, ...rest } = state.requests;
    return { requests: rest };
  }),
  
  // 清除所有API请求状态
  clearAllRequests: () => set({ requests: {} }),
  
  // 执行GET请求
  get: async <T = any>(path: string, params?: Record<string, any>): Promise<T> => {
    const { setRequestStatus } = get();
    
    try {
      setRequestStatus(path, ApiStatus.LOADING);
      
      const response = await api.get(path, { params });
      
      setRequestStatus(path, ApiStatus.SUCCESS, response.data);
      return response.data as T;
    } catch (error: any) {
      const apiError: ApiError = {
        message: error.response?.data?.error?.message || error.message || '请求失败',
        code: error.response?.status || 500,
        type: error.response?.data?.error?.type || 'UNKNOWN_ERROR',
        details: error.response?.data?.error?.details,
      };
      
      setRequestStatus(path, ApiStatus.ERROR, null, apiError);
      throw apiError;
    }
  },
  
  // 执行POST请求
  post: async <T = any>(path: string, data?: any, params?: Record<string, any>): Promise<T> => {
    const { setRequestStatus } = get();
    
    try {
      setRequestStatus(path, ApiStatus.LOADING);
      
      const response = await api.post(path, data, { params });
      
      setRequestStatus(path, ApiStatus.SUCCESS, response.data);
      return response.data as T;
    } catch (error: any) {
      const apiError: ApiError = {
        message: error.response?.data?.error?.message || error.message || '请求失败',
        code: error.response?.status || 500,
        type: error.response?.data?.error?.type || 'UNKNOWN_ERROR',
        details: error.response?.data?.error?.details,
      };
      
      setRequestStatus(path, ApiStatus.ERROR, null, apiError);
      throw apiError;
    }
  },
  
  // 执行PUT请求
  put: async <T = any>(path: string, data?: any, params?: Record<string, any>): Promise<T> => {
    const { setRequestStatus } = get();
    
    try {
      setRequestStatus(path, ApiStatus.LOADING);
      
      const response = await api.put(path, data, { params });
      
      setRequestStatus(path, ApiStatus.SUCCESS, response.data);
      return response.data as T;
    } catch (error: any) {
      const apiError: ApiError = {
        message: error.response?.data?.error?.message || error.message || '请求失败',
        code: error.response?.status || 500,
        type: error.response?.data?.error?.type || 'UNKNOWN_ERROR',
        details: error.response?.data?.error?.details,
      };
      
      setRequestStatus(path, ApiStatus.ERROR, null, apiError);
      throw apiError;
    }
  },
  
  // 执行DELETE请求
  delete: async <T = any>(path: string, params?: Record<string, any>): Promise<T> => {
    const { setRequestStatus } = get();
    
    try {
      setRequestStatus(path, ApiStatus.LOADING);
      
      const response = await api.delete(path, { params });
      
      setRequestStatus(path, ApiStatus.SUCCESS, response.data);
      return response.data as T;
    } catch (error: any) {
      const apiError: ApiError = {
        message: error.response?.data?.error?.message || error.message || '请求失败',
        code: error.response?.status || 500,
        type: error.response?.data?.error?.type || 'UNKNOWN_ERROR',
        details: error.response?.data?.error?.details,
      };
      
      setRequestStatus(path, ApiStatus.ERROR, null, apiError);
      throw apiError;
    }
  },
}));

export default useApiStore; 