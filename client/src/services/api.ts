/**
 * API基础配置服务
 */
import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? '/api' 
    : 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 可以在这里添加认证信息或其他请求前处理
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    // 统一处理响应
    return response.data;
  },
  (error) => {
    // 统一处理错误
    if (error.response) {
      // 服务器返回错误
      console.error('API错误:', error.response.data);
    } else if (error.request) {
      // 请求未收到响应
      console.error('网络错误:', error.request);
    } else {
      // 请求配置出错
      console.error('请求错误:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api; 