import express from 'express';
import cors from 'cors';
import config from './config/config.js';
import routes from './routes/index.js';
import logger from './utils/logger.js';
import { trees, tasks, batchTrees } from './dataStore.js';
// 导入devData中的测试数据
import { tasks as devTasks, trees as devTrees } from './data/devData.js';

// 初始化全局变量
global.batchCreatedTasks = global.batchCreatedTasks || [];
global.batchCreatedTrees = global.batchCreatedTrees || [];

// 检查是否应该加载示例数据
const shouldLoadDemoData = process.env.LOAD_DEMO_DATA === 'true';

// 将测试数据加载到内存中（仅当环境变量指定时）
if (shouldLoadDemoData && Array.isArray(devTasks) && devTasks.length > 0) {
  logger.info(`正在加载开发环境任务数据，数量: ${devTasks.length}`);
  devTasks.forEach(task => {
    if (!tasks.some(t => t.id === task.id)) {
      tasks.push({...task});
    }
  });
} else {
  logger.info('跳过加载开发环境任务示例数据');
}

if (shouldLoadDemoData && Array.isArray(devTrees) && devTrees.length > 0) {
  logger.info(`正在加载开发环境树木数据，数量: ${devTrees.length}`);
  devTrees.forEach(tree => {
    if (!trees.some(t => t.id === tree.id)) {
      trees.push({...tree});
    }
  });
} else {
  logger.info('跳过加载开发环境树木示例数据');
}

// 服务器初始化
const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志中间件
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

// 路由
app.use('/api', routes);

// 健康检查接口
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'TaskForest开发环境服务正常运行'
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  logger.error(`服务器错误: ${err.message}`, { error: err });
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : '请联系管理员'
  });
});

// 启动服务器
const PORT = config.port || 9000;
app.listen(PORT, () => {
  logger.info(`TaskForest服务器已启动，端口: ${PORT}`);
  logger.info(`环境: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`初始任务数量: ${tasks.length}`);
  logger.info(`初始树木数量: ${trees.length}`);
  logger.info(`全局批量创建的树木数量: ${global.batchCreatedTrees.length}`);
});

export default app; 