import app from './app.js';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 获取端口
const PORT = process.env.PORT || 9000;

// 启动服务器
app.listen(PORT, () => {
  console.log(`======= TaskForest任务分析API服务 =======`);
  console.log(`服务器已启动，监听端口: ${PORT}`);
  console.log(`访问地址: http://localhost:${PORT}`);
  console.log(`API基础路径: http://localhost:${PORT}/api`);
  console.log(`环境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`DeepSeek API配置: ${process.env.DEEPSEEK_API_KEY ? '已配置' : '未配置'}`);
  console.log(`===========================================`);
}); 