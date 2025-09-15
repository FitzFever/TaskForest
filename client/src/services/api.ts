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
  const apiUrl = import.meta.env.VITE_API_URL || '';
  // @ts-ignore - 兼容start-dev.sh脚本设置的变量名
  const reactAppDevApiUrl = import.meta.env.VITE_REACT_APP_DEV_API_URL || '';
  
  // 使用任一有效的API URL
  const envApiUrl = apiUrl || reactAppDevApiUrl;
  
  console.log('API基础URL配置:', envApiUrl || '/api');
  
  // 如果环境变量存在，则使用环境变量；否则使用相对路径
  return envApiUrl || '/api';
};

/**
 * 创建API请求实例
 */
const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: false // 跨域请求不发送cookies
});

// 导出API基础URL，以便在其他地方使用
export const API_BASE_URL = getBaseUrl();

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
    
    // 提取URL中的查询参数并单独记录
    let urlWithoutParams = config.url || '';
    let queryParams = {};
    
    if (urlWithoutParams.includes('?')) {
      const [path, query] = urlWithoutParams.split('?');
      urlWithoutParams = path;
      
      // 解析查询字符串
      const searchParams = new URLSearchParams(query);
      searchParams.forEach((value, key) => {
        // 处理同名参数(比如多个tags)
        if (queryParams[key]) {
          if (Array.isArray(queryParams[key])) {
            queryParams[key].push(value);
          } else {
            queryParams[key] = [queryParams[key], value];
          }
        } else {
          queryParams[key] = value;
        }
      });
    }
    
    // 拼接完整的URL（含baseURL）
    const fullUrl = `${config.baseURL || ''}${config.url || ''}`;
    console.log('完整请求URL:', fullUrl);
    
    // 记录分页参数，确保它们存在
    if (config.url?.includes('/tasks')) {
      const hasPaginationParams = queryParams['page'] || queryParams['limit'];
      if (!hasPaginationParams) {
        console.warn('⚠️ 请求任务列表但缺少分页参数，这可能导致返回默认分页结果。请确保传递page和limit参数。');
      } else {
        console.log('✅ 任务列表分页参数:', 
          `page=${queryParams['page'] || '默认值'}, ` + 
          `limit=${queryParams['limit'] || '默认值'}`
        );
      }
    }
    
    // 增强日志输出
    const requestInfo = {
      method: config.method?.toUpperCase(),
      url: urlWithoutParams,
      baseURL: config.baseURL,
      fullUrl: fullUrl,
      queryParams,
      params: config.params,
      data: config.data
    };
    
    console.log('API请求详情:', JSON.stringify(requestInfo, null, 2));
    
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
      if (apiResponse.code >= 400) {
        console.error(`业务错误: [${apiResponse.code}] ${apiResponse.message}`);
        return Promise.reject(new Error(apiResponse.message));
      }
      
      // 如果响应没有包含success字段，但有code字段，添加success字段以兼容期望success的代码
      if (!('success' in data)) {
        data.success = apiResponse.code >= 200 && apiResponse.code < 300;
        console.log(`为响应添加了success字段: ${data.success}`);
      }
      
      // 返回原始axios响应，保持一致性
      return response;
    }
    
    // 如果响应有success字段，兼容旧格式
    if (data && typeof data === 'object' && 'success' in data) {
      const legacyResponse = data as { success: boolean, message: string, data: unknown };
      
      console.log(`使用旧式API响应格式 (success: ${legacyResponse.success})`);
      
      // 如果响应没有code字段，添加code字段以兼容期望code的代码
      if (!('code' in data)) {
        data.code = legacyResponse.success ? 200 : 400;
        console.log(`为响应添加了code字段: ${data.code}`);
      }
      
      // 转换为新格式
      if (!legacyResponse.success) {
        console.error(`业务错误: ${legacyResponse.message}`);
        return Promise.reject(new Error(legacyResponse.message));
      }
    }
    
    // 直接返回原始axios响应
    return response;
  },
  error => {
    if (error.response) {
      // 服务器返回错误状态码
      const errorMessage = error.response.data?.message || error.response.data?.error?.message || '请求失败';
      console.error(`API错误: [${error.response.status}] ${errorMessage}`);
      return Promise.reject(new Error(errorMessage));
    } else if (error.request) {
      // 请求发送但未收到响应
      console.error('API错误: 服务器无响应或请求超时');
      // 检查是否是超时问题
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        return Promise.reject(new Error('AI处理请求时间较长，请耐心等待或稍后再试'));
      }
      return Promise.reject(new Error('服务器无响应，请检查网络连接并重试'));
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
    console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
    // @ts-ignore - Vite特有的环境变量
    console.log('VITE_REACT_APP_DEV_API_URL:', import.meta.env.VITE_REACT_APP_DEV_API_URL);
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

/**
 * 清理默认示例数据（ID为tree-1001到tree-1008的默认树和相关任务）
 * @returns 清理结果
 */
export async function cleanupDefaultData() {
  return api.post('/dev/data-management/cleanup-defaults');
}

// 保留原始导出
export default api; 