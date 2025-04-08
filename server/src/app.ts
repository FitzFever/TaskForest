/**
 * TaskForest 后端应用入口
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { config } from './config.js';
import { errorHandler } from './middleware/errorHandler.js';
import router from './routes/index.js'; // 导入主路由文件
import { initDatabase } from './db.js'; // 导入数据库初始化

// 加载环境变量
dotenv.config();

// 初始化Express应用
const app = express();

// 配置中间件
app.use(helmet()); // 安全相关HTTP头
app.use(cors()); // 跨域资源共享
app.use(express.json()); // 解析JSON请求体
app.use(express.urlencoded({ extended: true })); // 解析URL编码的请求体
app.use(morgan('dev')); // 请求日志

// 注册主路由，所有API都将挂载在/api路径下
app.use('/api', router);

// 健康检查endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 全局错误处理中间件
app.use(errorHandler);

// 启动服务器
const PORT = config.port || 3000;

// 确保数据库连接后再启动服务器
initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`服务器运行在: http://localhost:${PORT}`);
      console.log(`API文档地址: http://localhost:${PORT}/api-docs`);
      console.log(`健康检查地址: http://localhost:${PORT}/health`);
    });
  })
  .catch((error) => {
    console.error('服务器启动失败:', error);
    process.exit(1);
  });

export default app; 