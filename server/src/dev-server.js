/**
 * TaskForest开发环境服务器
 * 用于提供前端所需的后端API
 */
import express from 'express';
import cors from 'cors';
import { loggerMiddleware } from './middleware/logger.js';
import devRoutes from './routes/dev/index.js';
import dotenv from 'dotenv';
import taskRoutes from './routes/dev/taskRoutes.js';
import healthRoutes from './routes/dev/healthRoutes.js';
import treeRoutes from './routes/dev/treeRoutes.js';
import batchTaskRoutes from './routes/batchTaskRoutes.js';
import constantsRoutes from './routes/dev/constantsRoutes.js';
import clearDataRoutes from './routes/dev/clearDataRoutes.js';
import dataManagementRoutes from './routes/dev/dataManagementRoutes.js';

// 加载环境变量
dotenv.config();

// 设置环境变量
process.env.NODE_ENV = 'development';

// 初始化全局函数和变量
if (typeof global.getBatchCreatedTrees !== 'function') {
  global._batchCreatedTrees = global._batchCreatedTrees || [];
  global.getBatchCreatedTrees = () => global._batchCreatedTrees;
}

if (typeof global.getBatchCreatedTasks !== 'function') {
  global._batchCreatedTasks = global._batchCreatedTasks || [];
  global.getBatchCreatedTasks = () => global._batchCreatedTasks;
}

const app = express();
const PORT = process.env.PORT || 9000;

// 启用CORS和JSON解析
app.use(cors({
  origin: '*', // 允许所有来源
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// 添加请求日志中间件
app.use(loggerMiddleware);

console.log('=== TaskForest 开发环境服务器 ===');
console.log('正在启动...');

// 使用路由
app.use('/api', devRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api', healthRoutes);
app.use('/api/trees', treeRoutes);
app.use('/api/batch-tasks', batchTaskRoutes);
app.use('/api/constants', constantsRoutes);
app.use('/api/admin', clearDataRoutes);
app.use('/api/dev/data-management', dataManagementRoutes);

// 启动服务器
app.listen(PORT, () => {
  console.log('✅ 服务已启动');
  console.log(`🔗 服务地址: http://localhost:${PORT}`);
  console.log(`🔗 API基础路径: http://localhost:${PORT}/api`);
  console.log(`🔗 健康检查: http://localhost:${PORT}/api/health`);
  console.log('\n开发环境准备就绪. 按 Ctrl+C 停止服务.\n');
}); 