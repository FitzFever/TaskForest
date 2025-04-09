/**
 * API基础配置服务
 */
import axios, { AxiosResponse } from 'axios';

/**
 * API响应格式接口
 */
export interface IApiResponse<T> {
  code: number;
  data: T;
  message: string;
  timestamp: string;
}

/**
 * 获取API基础URL
 */
const getBaseUrl = (): string => {
  // 打印所有环境变量，帮助debug
  console.log('环境变量列表:', {
    VITE_REACT_APP_DEV_API_URL: import.meta.env.VITE_REACT_APP_DEV_API_URL,
    VITE_REACT_APP_API_URL: import.meta.env.VITE_REACT_APP_API_URL,
    VITE_REACT_APP_USE_MOCK: import.meta.env.VITE_REACT_APP_USE_MOCK,
    NODE_ENV: import.meta.env.MODE,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD
  });

  const isProduction = import.meta.env.PROD;
  // 使用环境变量或配置文件中设置的API URL，如果没有则使用默认值
  const baseURL = isProduction 
    ? import.meta.env.VITE_REACT_APP_API_URL || '/api'
    : import.meta.env.VITE_REACT_APP_DEV_API_URL || 'http://localhost:9000/api';
  
  console.log(`当前环境: ${isProduction ? 'production' : 'development'}, API基础URL: ${baseURL}`);
  return baseURL;
};

/**
 * 创建API请求实例
 */
const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * 模拟API响应
 * 用于在后端服务不可用时生成模拟数据
 */
export function mockApiResponse<T>(data: T): T {
  console.log('生成模拟响应数据:', data);
  return data;
}

// 请求拦截器
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    console.log(`API请求: ${config.method?.toUpperCase()} ${config.url}`, config.params || config.data);
    return config;
  },
  error => {
    console.error('API请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data, status } = response;
    
    console.log(`API响应: [${status}]`, data);
    
    // 处理两种可能的响应格式:
    // 1. { code, data, message, timestamp } 标准格式
    // 2. 直接返回数据
    
    if (data && typeof data === 'object' && 'code' in data && 'data' in data) {
      // 标准响应格式
      const apiResponse = data as IApiResponse<unknown>;
      
      // 处理业务逻辑错误
      if (apiResponse.code !== 200) {
        console.error(`业务错误: [${apiResponse.code}] ${apiResponse.message}`);
        return Promise.reject(new Error(apiResponse.message));
      }
      
      return apiResponse.data;
    }
    
    // 直接返回数据
    return data;
  },
  error => {
    if (error.response) {
      // 服务器返回错误状态码
      console.error(`API错误: [${error.response.status}]`, error.response.data);
    } else if (error.request) {
      // 请求发送但未收到响应
      console.error('API错误: 无响应', error.request);
    } else {
      // 请求配置错误
      console.error('API错误:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// 导出API对象
export default api; 