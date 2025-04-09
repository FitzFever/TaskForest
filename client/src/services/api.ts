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
  // 使用相对路径，让Vite代理处理
  return '/api';
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
    
    // 处理标准响应格式 { code, data, message, timestamp }
    if (data && typeof data === 'object' && 'code' in data) {
      const apiResponse = data as IApiResponse<unknown>;
      
      console.log(`API业务状态码: ${apiResponse.code}, 消息: ${apiResponse.message}`);
      
      // 处理业务逻辑错误
      if (apiResponse.code !== 200 && apiResponse.code !== 201) {
        console.error(`业务错误: [${apiResponse.code}] ${apiResponse.message}`);
        return Promise.reject(new Error(apiResponse.message));
      }
      
      // 返回原始axios响应，保持一致性
      return response;
    }
    
    // 直接返回原始axios响应
    return response;
  },
  error => {
    if (error.response) {
      // 服务器返回错误状态码
      const errorMessage = error.response.data?.message || '请求失败';
      console.error(`API错误: [${error.response.status}] ${errorMessage}`);
      return Promise.reject(new Error(errorMessage));
    } else if (error.request) {
      // 请求发送但未收到响应
      console.error('API错误: 服务器无响应');
      return Promise.reject(new Error('服务器无响应'));
    } else {
      // 请求配置错误
      console.error('API错误:', error.message);
      return Promise.reject(error);
    }
  }
);

// 导出API对象
export default api; 