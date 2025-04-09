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
  // 优先使用环境变量中的API地址
  // @ts-ignore - Vite特有的环境变量处理
  const envApiUrl = import.meta.env.VITE_API_URL || '';
  
  console.log('API基础URL配置:', envApiUrl || '/api');
  
  // 如果环境变量存在，则使用环境变量；否则使用相对路径
  return envApiUrl || '/api';
};

/**
 * 创建API请求实例
 */
const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: false // 跨域请求不发送cookies
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
    
    // 增强日志输出
    const requestInfo = {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullUrl: `${config.baseURL || ''}${config.url || ''}`,
      params: config.params,
      data: config.data
    };
    
    console.log('API请求详情:', requestInfo);
    
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

/**
 * API诊断工具 - 检测API配置和连接情况
 * 仅在开发环境使用
 */
export const diagnoseApi = async (): Promise<void> => {
  if (process.env.NODE_ENV !== 'development') {
    console.log('API诊断仅在开发环境可用');
    return;
  }
  
  console.group('API配置诊断');
  try {
    // @ts-ignore - Vite特有的环境变量
    console.log('环境:', process.env.NODE_ENV);
    // @ts-ignore - Vite特有的环境变量
    console.log('API URL环境变量:', import.meta.env.VITE_API_URL);
    console.log('当前API基础URL:', getBaseUrl());
    console.log('Axios配置:', {
      baseURL: api.defaults.baseURL,
      timeout: api.defaults.timeout,
      headers: api.defaults.headers
    });
    
    // 尝试发送测试请求
    console.log('正在测试API连接...');
    const healthcheck = await api.get('/health');
    console.log('API健康检查响应:', healthcheck.data);
    console.log('API连接正常');
  } catch (error) {
    console.error('API连接测试失败:', error);
    console.log('可能的解决方案:');
    console.log('1. 确认后端服务是否运行在正确的端口');
    console.log('2. 检查Vite代理配置是否正确');
    console.log('3. 检查环境变量中的API URL是否正确');
    console.log('4. 检查网络连接和CORS设置');
  } finally {
    console.groupEnd();
  }
};

// 在开发环境自动运行API诊断
if (process.env.NODE_ENV === 'development') {
  setTimeout(() => {
    console.log('正在进行API自动诊断...');
    diagnoseApi().catch(console.error);
  }, 1000);
}

// 导出API对象
export default api; 