/**
 * 应用配置
 * 集中管理应用的配置项
 */
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 配置对象
export const config = {
  // 服务器配置
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // 数据库配置
  database: {
    url: process.env.DATABASE_URL || 'file:./dev.db',
  },
  
  // 安全配置
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
  
  // API配置
  api: {
    prefix: '/api',
  },
  
  // 日志配置
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
}; 