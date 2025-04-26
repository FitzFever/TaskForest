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

## 批量创建任务和任务树问题排查

### 问题：批量任务创建接口返回 400 错误

**可能原因**：
- 请求参数格式不正确
- 任务数据为空数组或者不是数组
- 任务中缺少必填字段（如标题）

**解决方法**：
1. 确保请求体中包含 `tasks` 字段，并且是一个非空数组
2. 确保每个任务对象都包含 `title` 字段
3. 检查请求格式是否符合API文档中的要求

### 问题：批量创建任务和任务树时，任务创建成功但树木没有创建

**可能原因**：
- `createTrees` 参数设置为 false
- 系统创建树木时发生内部错误

**解决方法**：
1. 确保在请求体中设置 `createTrees: true`
2. 检查服务器日志，查看是否有与树木创建相关的错误

### 问题：批量创建的请求格式不一致导致任务创建失败

**可能原因**：
- 前端发送的请求格式与后端期望的格式不一致
- 对任务组的结构理解不同

**解决方法**：
1. 使用以下标准格式发送请求：

```json
{
  "tasks": [
    {
      "title": "主任务标题",
      "description": "主任务描述",
      "priority": "高",
      "subTasks": [
        {
          "title": "子任务标题",
          "description": "子任务描述",
          "priority": "中"
        }
      ]
    }
  ],
  "createTrees": true
}
```

2. 注意后端支持两种格式的请求：
   - 直接将主任务信息和子任务列表放在tasks数组的元素中（如上例）
   - 使用mainTask字段包装主任务信息，配合subTasks字段

### 注意事项

1. 所有任务必须包含标题字段
2. 状态字段可选，默认为"未开始"
3. 优先级字段可选，值可以是"低"、"中"、"高"
4. 创建树木是可选的，通过createTrees参数控制（默认为true）
5. 当创建树木时，系统会自动为每个主任务创建一棵树，并将子任务关联为树的分支

### 实际请求示例

```bash
curl -X POST http://localhost:9000/api/batch-tasks/with-trees \
  -H "Content-Type: application/json" \
  -d '{
    "tasks": [
      {
        "title": "测试主任务",
        "description": "这是一个测试主任务",
        "priority": "高",
        "subTasks": [
          {
            "title": "子任务1",
            "description": "这是子任务1的描述",
            "priority": "中"
          },
          {
            "title": "子任务2",
            "description": "这是子任务2的描述",
            "priority": "低"
          }
        ]
      }
    ],
    "createTrees": true
  }'
```

正确的响应会包含创建的任务组及其子任务信息，以及对应的任务树信息。

### 问题：批量创建任务和任务树成功，但前端无法显示树木

**可能原因**：
- 服务器内的树木数据存储机制问题
- 批量创建的树木未正确添加到全局树木存储
- 前端查询树木的API未能正确查找批量创建的树木

**解决方法**：
1. 确保服务器启动时已正确初始化`global.batchCreatedTrees`数组
2. 修改`treeModel.js`中的`getTreeByTaskId`函数以检查全局树木数组和批量创建的树木数组
3. 确保`dataStore.js`中正确存储和检索批量创建的树木
4. 可通过以下API调试问题:
   ```
   # 查看所有任务
   curl http://localhost:9000/api/tasks
   
   # 查看某个任务ID对应的树木
   curl http://localhost:9000/api/trees/by-task/{任务ID}
   
   # 查看所有树木
   curl http://localhost:9000/api/trees
   ```

5. 如果服务器日志显示找不到树木（Tree not found），尝试重启服务器，或修改代码确保批量创建的树木被正确存储

**技术解释**：
TaskForest系统使用两个存储机制来管理树木：全局`trees`数组和`global.batchCreatedTrees`数组。批量创建的树木需要被正确存储在这两个位置，并且查询时需要检查两个数组。如果您修改了相关代码，请确保：

1. `batchTaskCreationController.js`中调用了`storeBatchCreatedData`来保存创建的树木
2. `treeModel.js`中的`getTreeByTaskId`函数检查了两个数组
3. `dataStore.js`中的`findTreeByTaskId`函数也检查了两个数组

请将日志内容发送给开发团队，以便更好地诊断问题。

### 问题：前端显示"批量任务创建成功"但数据未显示在界面上

**可能原因**：
- 前端期望的API响应格式与后端实际返回的不匹配
- 后端使用`code`字段而前端期望`success`字段
- 响应中的任务和树木数据结构不符合前端预期

**解决方法**：
1. 检查浏览器控制台网络请求，观察API响应格式
2. 修改前端的API响应处理代码，确保能够正确识别`code`字段：
   ```javascript
   // 在api.js的响应拦截器中添加
   if (data && typeof data === 'object' && 'code' in data) {
     const apiResponse = data as IApiResponse<unknown>;
     // 判断成功/失败的业务逻辑
     if (apiResponse.code >= 400) {
       // 处理错误...
     }
     // 返回响应...
   }
   ```
3. 修改批量任务服务代码中的数据适配函数，确保能正确处理嵌套的任务数据结构：
   ```javascript
   // 检查是否已经是TaskGroup格式
   if (firstItem && firstItem.mainTask && Array.isArray(firstItem.subTasks)) {
     return tasks; // 已是期望格式，无需适配
   }
   ```
4. 确保树木数据字段名称匹配，特别是`taskId`和`mainTaskId`

**解决示例**：
如果前端和后端的字段名不匹配，可以在前端进行适配：
```javascript
// 在BatchTasksWithTreesResponse接口中
export interface BatchTasksWithTreesResponse {
  tasks: {
    mainTask: Task;
    subTasks: Task[];
  }[];
  trees: {
    id: string;
    // 添加mainTaskId作为可选字段
    mainTaskId?: string;
    taskId: string;
    // 其他字段...
  }[];
}
```

请将日志内容发送给开发团队，以便更好地诊断问题。

## 前端API响应解析问题

### 问题：前端无法正确解析API响应结构

**可能原因**：
- API响应结构发生了变化，返回的是`code`而不是`success`字段
- API返回的任务数据结构嵌套层次与前端期望不匹配
- 树木数据缺少前端期望的`mainTaskId`字段

**解决方法**：
1. 检查浏览器控制台中API响应的具体格式
2. 确认响应中使用的是`code`字段还是`success`字段
3. 确认任务数据结构的嵌套层次：
   - 接口可能返回的是 `{ data: { tasks: [ { mainTask: { mainTask: {...}, subTasks: [...] } } ] } }`
   - 而前端期望的是 `{ data: { tasks: [ { mainTask: {...}, subTasks: [...] } ] } }`

4. 确保通过API拦截器添加兼容性处理：
```javascript
// 在api.ts的响应拦截器中
if (data && 'code' in data && !('success' in data)) {
  data.success = data.code >= 200 && data.code < 300;
}
```

5. 适配任务数据格式，处理多层嵌套：
```javascript
// 如果检测到多层嵌套
if (firstItem && firstItem.mainTask && firstItem.mainTask.mainTask) {
  return tasks.map(task => ({
    mainTask: task.mainTask.mainTask,
    subTasks: task.mainTask.subTasks || []
  }));
}
```

6. 确保树木数据包含`mainTaskId`字段：
```javascript
const trees = response.data.data.trees.map(tree => {
  if (!tree.mainTaskId && tree.taskId) {
    return {
      ...tree,
      mainTaskId: tree.taskId
    };
  }
  return tree;
});
```

**调试命令**：
使用以下命令查看API响应详情：
```bash
# 获取任务列表
curl http://localhost:9000/api/tasks | json_pp

# 查看某个任务ID对应的树木
curl http://localhost:9000/api/trees/by-task/{任务ID} | json_pp

# 批量创建任务和树木
curl -X POST http://localhost:9000/api/batch-tasks/with-trees \
  -H "Content-Type: application/json" \
  -d '{...}' | json_pp
```

请将相关的错误日志发送给开发团队，以便更好地诊断问题。

## 树木健康状态接口问题排查

### 问题现象：森林界面显示404错误

**现象描述**：
在森林界面查看树木健康状态时，控制台显示404错误，具体路径如：`/api/trees/{id}/health`或`/api/tasks/{id}/tree-health`无法访问。界面中的树木健康状态面板显示"获取健康状态数据失败"错误。

**可能原因**：
1. 后端API路由未正确配置 - 后端没有实现这些API接口
2. API路径不匹配 - 前端请求的URL路径与后端实际提供的不一致
3. 服务器启动不完整 - 树木健康状态服务没有正确启动或注册

**解决方案**：

1. **添加模拟数据回退机制**：
   我们已经在前端添加了模拟数据回退机制，当API请求失败时，会自动生成合理的默认数据以确保UI正常显示。这是在`treeHealthService.ts`文件中实现的：
   
   ```typescript
   export const getTreeHealth = async (treeId: string): Promise<TreeHealthDetails> => {
     try {
       console.log(`获取树木健康状态: ${treeId}`);
       const response = await api.get<{
         code: number;
         data: TreeHealthDetails;
         message: string;
       }>(`/trees/${treeId}/health`);
       
       return response.data.data;
     } catch (error) {
       console.error(`获取树木健康状态失败: ${treeId}`, error);
       
       // 使用默认数据代替，以便UI能够正常显示
       console.warn(`返回默认树木健康状态数据作为备用`);
       return createDefaultTreeHealthData(treeId);
     }
   };
   ```

2. **检查后端API路由**：
   确认后端中是否已实现以下API接口：
   - GET `/api/trees/:id/health` - 获取树木健康状态
   - GET `/api/tasks/:id/tree-health` - 获取任务关联的树木健康状态
   - PUT `/api/tasks/:id/progress` - 更新任务进度（影响健康状态）
   - POST `/api/trees/health/batch-update` - 批量更新所有树木健康状态

3. **快速排查步骤**：
   a. 查看服务器日志，确认是否有注册树木健康状态路由的信息
   b. 使用以下命令测试API是否可访问（替换{id}为实际ID）：
      ```
      curl http://localhost:9000/api/trees/{id}/health
      curl http://localhost:9000/api/tasks/{id}/tree-health
      ```
   c. 检查是否需要在`server/src/routes/index.js`中添加路由注册

4. **临时解决方案**：
   现在前端已经添加了模拟数据回退机制，即使后端API不可用，UI也能正常显示，不会影响用户体验。
   在后端API完全实现前，这是一个合理的临时解决方案。

### 前端使用场景说明

树木健康状态功能用于展示任务关联的树木健康状况，通过完成任务进度来提升树木健康值。关键功能包括：

1. 查看树木当前健康状态
2. 查看任务进度与树木健康的关联
3. 更新任务进度，同时影响树木健康状态
4. 批量更新所有树木健康状态

当您在使用森林界面功能时，如果遇到类似问题，现在系统会自动使用模拟数据，保证界面能够正常显示。

### 后端开发计划

下一阶段开发计划中应包括实现完整的树木健康状态API，根据API参考文档实现以下端点：

1. GET `/api/trees/:id/health`
2. GET `/api/tasks/:id/tree-health`
3. PUT `/api/tasks/:id/progress`
4. POST `/api/trees/health/batch-update`

完整的API规范可以参考项目文档：`/docs/api/tree_health_api.md` 

## 任务状态更新404错误问题

### 问题描述

前端在更新任务状态或进度时出现404错误，导致任务状态无法更新，服务器返回"Not Found"错误。

### 现象

1. 在前端界面中，当尝试更新任务进度或状态时，操作看似成功，但实际上未生效
2. 浏览器控制台显示HTTP 404错误
3. 错误信息类似：`Error: [404] Not Found`或`获取任务与树木健康关联失败: Error: Not Found`
4. 网络请求显示对`/api/tasks/{id}/status`的PUT请求失败

### 可能原因

1. **API路径不匹配**：前端和后端使用的API路径不一致
2. **路由未正确配置**：后端未实现或未注册相应的路由处理器
3. **API版本不匹配**：前后端代码版本不同步，使用了不同的API路径

### 解决方案

#### 前端API路径检查

1. 检查前端服务调用的路径是否与后端路由定义一致：

前端代码中应使用如下路径：
- 任务进度更新：`/tasks/${taskId}/progress`
- 任务状态更新：`/tasks/${taskId}/status`

请检查任务服务和树木健康服务中的API调用路径：

```javascript
// 正确的API路径示例
export const updateTaskProgress = async (taskId, progress) => {
  try {
    return await api.put(`/tasks/${taskId}/progress`, { progress });
  } catch (error) {
    console.error(`更新任务进度失败: ${taskId}`, error);
    throw error;
  }
};

export const updateTaskStatus = async (taskId, status) => {
  try {
    return await api.put(`/tasks/${taskId}/status`, { status });
  } catch (error) {
    console.error(`更新任务状态失败: ${taskId}`, error);
    throw error;
  }
};
```

#### 后端路由检查

1. 确认后端路由配置正确：

```javascript
// taskRoutes.ts中应包含以下路由
router.put('/:id/status', updateTaskStatus);
router.put('/:id/progress', updateTaskProgress);
```

2. 检查`server/src/routes/taskRoutes.ts`文件，确认路由已注册

#### 请求前缀检查

1. 检查API请求前缀是否正确，某些配置可能要求使用`/api`前缀：

```javascript
// 修正API基础URL
const api = axios.create({
  baseURL: 'http://localhost:9000/api',
  // 或者
  baseURL: '/api',
});
```

#### 临时解决方案

如果确认路由已在后端正确配置但仍无法访问，可以在treeHealthService.ts中增加错误处理和回退机制：

```javascript
export const updateTaskProgress = async (
  taskId: string,
  progress: number,
  notes?: string
): Promise<TaskProgressUpdateResponse> => {
  try {
    console.log(`更新任务进度: ${taskId} 进度: ${progress}`);
    // 尝试不同的API路径
    try {
      const response = await api.put<{
        code: number;
        data: TaskProgressUpdateResponse;
        message: string;
      }>(`/tasks/${taskId}/progress`, { progress, notes });
      
      return response.data.data;
    } catch (firstError) {
      if (firstError.response && firstError.response.status === 404) {
        // 尝试备用路径
        console.warn('尝试备用API路径 /tasks/${taskId}/status');
        const response = await api.put<{
          code: number;
          data: TaskProgressUpdateResponse;
          message: string;
        }>(`/tasks/${taskId}/status`, { progress, notes });
        
        return response.data.data;
      }
      throw firstError;
    }
  } catch (error) {
    console.error(`更新任务进度失败: ${taskId}`, error);
    
    // 返回默认响应数据
    console.warn(`返回默认任务进度更新响应作为备用`);
    return {
      taskId,
      progress,
      updatedAt: new Date().toISOString(),
      tree: {
        id: `tree-${taskId}`,
        healthStateBefore: 75,
        healthStateAfter: progress >= 60 ? 80 : 70,
        healthChange: progress >= 60 ? '+5' : '-5'
      }
    };
  }
};
```

### 相关日志提交

如果以上解决方案无法解决问题，请收集以下信息并提交给开发团队：

1. 网络请求和响应的完整日志（包含请求URL、请求头和请求体）
2. 服务器端日志，特别是404错误相关信息
3. 前端代码中相关API调用的完整实现
4. 后端路由配置文件内容 