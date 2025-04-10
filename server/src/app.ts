/**
 * TaskForest服务器应用程序
 */
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';
import taskRoutes from './routes/taskRoutes.js';
import treeRoutes from './routes/treeRoutes.js';

// 初始化Express应用
const app = express();
const prisma = new PrismaClient();

// 中间件配置
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// 设置根路由
app.get('/', (req, res) => {
  res.json({
    message: 'TaskForest API服务运行中',
    version: '1.0.0',
    documentation: '/api-docs',
  });
});

// 健康检查路由
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'API服务正常运行',
    timestamp: new Date().toISOString(),
  });
});

// API路由
app.use('/api/tasks', taskRoutes);
app.use('/api/trees', treeRoutes);

// 添加获取任务统计信息API
app.get('/api/tasks/stats', async (req, res) => {
  try {
    console.log('接收到获取任务统计请求');
    
    // 统计各种状态的任务数量
    const total = await prisma.task.count();
    const completed = await prisma.task.count({
      where: { status: 'COMPLETED' }
    });
    const inProgress = await prisma.task.count({
      where: { status: 'IN_PROGRESS' }
    });
    const todo = await prisma.task.count({
      where: { status: 'TODO' }
    });
    const cancelled = await prisma.task.count({
      where: { status: 'CANCELLED' }
    });
    
    // 计算完成率
    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    
    // 获取所有标签及其计数
    const tasks = await prisma.task.findMany({
      select: {
        tags: true,
        priority: true
      }
    });
    
    const tagCounts: Record<string, number> = {};
    tasks.forEach(task => {
      if (task.tags && Array.isArray(task.tags) && task.tags.length > 0) {
        (task.tags as unknown as string[]).forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });
    
    // 排序标签
    const tagStats = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
    
    // 优先级分布
    const priorityStats = {
      1: tasks.filter(task => task.priority === 1).length,
      2: tasks.filter(task => task.priority === 2).length,
      3: tasks.filter(task => task.priority === 3).length,
      4: tasks.filter(task => task.priority === 4).length
    };
    
    res.json({
      code: 200,
      data: {
        total,
        completed,
        inProgress,
        todo,
        cancelled,
        completionRate: parseFloat(completionRate.toFixed(2)),
        tagStats,
        priorityStats
      },
      message: '获取任务统计成功',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('获取任务统计失败:', error);
    res.status(500).json({
      code: 500,
      data: null,
      error: { message: (error as Error).message },
      message: '获取任务统计失败',
      timestamp: Date.now()
    });
  }
});

// 错误处理中间件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('服务器错误:', err.stack);
  res.status(500).json({
    code: 500,
    data: null,
    error: { message: '服务器内部错误' },
    message: 'Internal Server Error',
    timestamp: Date.now()
  });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    data: null,
    error: { message: '请求的资源不存在' },
    message: 'Not Found',
    timestamp: Date.now()
  });
});

export default app; 