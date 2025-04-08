/**
 * TaskForest 后端应用入口
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { taskRoutes } from './routes/taskRoutes';
import { treeRoutes } from './routes/treeRoutes';
import { aiRoutes } from './routes/aiRoutes';
import { settingsRoutes } from './routes/settingsRoutes';

// 初始化Express应用
const app = express();

// 配置中间件
app.use(helmet()); // 安全相关HTTP头
app.use(cors()); // 跨域资源共享
app.use(express.json()); // 解析JSON请求体
app.use(express.urlencoded({ extended: true })); // 解析URL编码的请求体
app.use(morgan('dev')); // 请求日志

// 注册路由
app.use('/api/tasks', taskRoutes);
app.use('/api/trees', treeRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/settings', settingsRoutes);

// 健康检查endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 全局错误处理中间件
app.use(errorHandler);

// 启动服务器
const PORT = config.port || 5000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});

export default app; 