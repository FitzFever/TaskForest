# TaskForest 故障排除指南

## API 连接问题排查

如果前端无法连接到后端API服务，请按照以下步骤进行排查：

### 1. 确认服务器运行状态

确保服务器正在运行并监听正确的端口（9000）：

```bash
# 检查服务器进程
ps aux | grep node | grep dev-server.js

# 检查端口监听状态
lsof -i :9000
```

### 2. 测试API健康检查端点

使用curl测试API健康检查端点：

```bash
curl http://localhost:9000/api/health
```

应该返回如下内容：
```json
{"status":"ok","timestamp":"2025-04-23T09:20:43.056Z","message":"TaskForest API服务正常运行"}
```

### 3. 检查端口配置

确保以下文件中的端口配置一致：

- **后端**:
  - `server/.env`: PORT=9000
  - `server/src/config.ts`: `port: process.env.PORT || 9000`
  - `server/src/config/index.ts`: `port: process.env.PORT || 9000`
  - `server/src/dev-server.js`: `const PORT = process.env.PORT || 9000`

- **前端**:
  - `client/vite.config.ts`: 代理配置应指向 `http://localhost:9000`
  - `client/.env.development.local`: 应包含 `VITE_REACT_APP_DEV_API_URL=http://localhost:9000/api`

### 4. 使用开发脚本启动

推荐使用开发脚本启动整个应用程序，它会自动设置正确的环境：

```bash
# 在项目根目录下
chmod +x server/start-dev.sh
./server/start-dev.sh
```

> **重要提示**：确保`server/start-dev.sh`脚本使用的是`node src/dev-server.js`而不是`node src/dev.js`。
> 旧的`dev.js`文件只是一个兼容层，可能会导致端口冲突和其他问题。

### 5. 调试网络请求

在浏览器开发者工具的Network选项卡中检查API请求：

1. 打开浏览器开发者工具 (F12)
2. 切换到Network选项卡
3. 点击任务分析按钮，观察是否有网络请求发出
4. 检查请求URL是否正确（应该是 `/api/tasks/analyze`）
5. 查看请求和响应内容

### 6. 检查API实现

确认前后端API路径匹配：

- **后端路由**：`server/src/routes/taskBreakdownRoutes.js` 中应该有 `/analyze` 端点
- **前端服务**：`client/src/services/taskBreakdownService.ts` 中调用的API路径应该是 `/api/tasks/analyze`

### 7. 重启服务

如果修改了配置，确保重启前后端服务：

```bash
# 停止所有Node.js进程（谨慎使用）
pkill -f node

# 重新启动开发环境
./server/start-dev.sh
```

### 8. 查看日志

检查服务器日志以查找错误信息：

```bash
# 显示最近的服务器日志
tail -n 50 server/logs/combined.log

# 显示错误日志
tail -n 50 server/logs/error.log
```

## 启动脚本问题排查

如果在启动开发环境时遇到问题，请检查以下几点：

### 1. 使用正确的服务器启动文件

TaskForest最新版本使用`dev-server.js`作为服务器入口点，而不是旧的`dev.js`：

```bash
# 错误用法
node src/dev.js

# 正确用法
node src/dev-server.js
```

修改`server/start-dev.sh`脚本，确保使用正确的启动命令：

```bash
# 修改前
node src/dev.js &

# 修改后
node src/dev-server.js &
```

### 2. 端口占用问题

启动错误`EADDRINUSE: address already in use :::9000`表示端口已被占用：

```bash
# 检查占用端口9000的进程
lsof -i :9000

# 终止占用端口的进程
kill -9 <进程ID>

# 或终止所有Node进程（谨慎使用）
pkill -f node
```

### 3. 环境变量加载问题

确保服务器正确加载了`.env`文件中的环境变量：

1. 检查`server/src/dev-server.js`中是否包含:
   ```javascript
   import dotenv from 'dotenv';
   dotenv.config();
   ```
   
2. 确保在读取配置前已加载环境变量:
   ```javascript
   const PORT = process.env.PORT || 9000;
   ```

## AI模块问题排查

如果AI相关功能（如任务分析、任务拆解等）无法正常工作，请按照以下步骤排查：

### 1. 确认AI相关路由已正确注册

查看`server/src/routes/dev/index.js`文件，确保已正确导入和注册taskBreakdownRoutes：

```javascript
// 确保导入了taskBreakdownRoutes
import taskBreakdownRoutes from '../../routes/taskBreakdownRoutes.js';

// 确保注册了taskBreakdownRoutes
router.use('/tasks', taskBreakdownRoutes);
```

### 2. 检查API请求URL是否正确

前端服务应该发送到正确的API端点：

- 任务分析: `/tasks/analyze` (注意：不要重复添加`/api`前缀)
- 任务拆解: `/tasks/decompose` (注意：不要重复添加`/api`前缀)
- 完整流程: `/tasks/analyze-and-decompose` (注意：不要重复添加`/api`前缀)

检查`client/src/services/taskBreakdownService.ts`文件，确保请求路径没有重复的`/api`前缀：

```typescript
// 错误示例
const response = await api.post('/api/tasks/analyze', taskData); // 错误！会导致双重/api前缀

// 正确示例
const response = await api.post('/tasks/analyze', taskData); // 正确，因为api实例已配置基础URL
```

### 3. 测试AI端点

使用curl命令直接测试API端点：

```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"taskId":"test-123","title":"测试任务","description":"这是一个测试任务"}' \
  http://localhost:9000/api/tasks/analyze
```

### 4. 检查DeepSeek API配置

确保在`server/.env`文件中正确配置了DeepSeek API密钥和其他参数：

```
DEEPSEEK_API_KEY=your-api-key
DEEPSEEK_API_URL=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-chat
```

### 5. 检查日志

如果AI模块的调用失败，检查服务器日志中的错误信息：

```bash
tail -n 50 server/logs/error.log
```

### 常见问题

#### 1. API返回404错误

- **原因**: AI路由未正确注册或API路径重复
- **解决方案**: 
  - 检查`server/src/routes/dev/index.js`是否添加了taskBreakdownRoutes
  - 检查前端请求URL是否包含重复的`/api`前缀

#### 2. API路径重复导致404错误

- **原因**: 在前端代码中错误添加了重复的`/api`前缀
- **解决方案**: 修改`client/src/services/taskBreakdownService.ts`中的API路径，移除重复的`/api`前缀

#### 3. API返回500错误

- **原因**: DeepSeek API调用失败，可能是API密钥无效或配额用尽
- **解决方案**: 检查DeepSeek API密钥配置和限额

#### 4. 前端无响应

- **原因**: 前端API服务配置错误
- **解决方案**: 检查`client/src/services/api.ts`中的baseURL配置和`client/.env.development.local`文件

## AI任务分析和拆解故障排除

如果在使用AI任务分析和拆解功能时遇到问题，可以按照以下步骤排查：

### 1. 任务分析(analyze)请求失败

- **问题现象**：点击分析按钮后没有响应或返回错误
- **可能原因**：
  - API路径不正确
  - 服务器端口配置不一致
  - DeepSeek服务未正确配置
- **解决方案**：
  - 检查浏览器控制台网络请求，确认是否发送了`/tasks/analyze`请求
  - 验证服务器是否正在运行，可以使用`curl http://localhost:9001/api/health`测试
  - 确保已经在`.env`文件中配置了正确的DeepSeek API密钥

### 2. 任务拆解(decompose)请求失败

- **问题现象**：任务分析成功但拆解失败，无法生成子任务
- **可能原因**：
  - 缺少`complexity`参数
  - `complexity`参数格式不正确
  - 前端和后端的数据格式不匹配
- **解决方案**：
  - 检查从分析结果中是否正确获取了复杂度信息
  - 确认传递给decompose API的参数是否正确(应包含`taskId`, `title`, `description`, `complexity`)
  - 复杂度应为`LOW`, `MEDIUM`, 或`HIGH`，而不是前端使用的`SIMPLE`, `MEDIUM`, `COMPLEX`

### 3. 数据格式不匹配问题

- **问题现象**：API请求成功但前端显示错误或数据不显示
- **可能原因**：
  - 后端返回的数据结构发生了变化
  - 前端期望的数据格式与后端不一致
- **解决方案**：
  - 在浏览器控制台中检查API响应的具体内容
  - 修改前端代码以适应后端数据结构，例如：
    ```javascript
    // 处理analyze响应
    if (response.data && response.data.data) {
      const result = response.data.data;
      // 处理数据...
    }
    
    // 处理decompose响应
    if (response.data && response.data.data && response.data.data.subTasks) {
      const subTasks = response.data.data.subTasks;
      // 处理子任务...
    }
    ```

### 4. 调试提示

在`taskBreakdownService.ts`中添加以下调试日志可以帮助排查问题：

```javascript
// 在调用API前记录请求参数
console.log('发送请求参数:', requestData);

// 在收到响应后记录响应内容
console.log('收到响应:', response.data);

// 特别检查复杂度字段
console.log('任务复杂度:', response.data.data.complexity);
```

请将日志内容发送给开发团队，以便更好地诊断问题。

## 常见问题

### 1. 404错误

- **原因**：API路径不匹配或服务器未运行
- **解决方案**：确认服务器运行状态，检查API路径配置

### 2. CORS错误

- **原因**：跨域请求被阻止
- **解决方案**：确认服务器CORS配置正确，检查 `server/src/app.js` 中的CORS设置

### 3. 连接被拒绝

- **原因**：服务器未运行或端口被占用
- **解决方案**：确认服务器运行状态，检查端口是否被占用，尝试使用不同端口 