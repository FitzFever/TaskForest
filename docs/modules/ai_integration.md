# AI集成模块文档

## DeepSeek API集成

TaskForest系统集成了DeepSeek API用于任务分析和智能拆解，帮助用户更高效地管理复杂任务。

### 1. 功能概述

DeepSeek API在TaskForest中主要提供以下功能：

- **任务复杂度分析**：根据任务标题和描述，智能评估任务的复杂程度
- **任务智能拆解**：将复杂任务自动拆解为合理的子任务列表
- **工作量预估**：为每个子任务提供合理的工时预估

### 2. 系统架构

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   前端UI    │────►│ 任务分析API  │────►│ DeepSeek服务 │
└─────────────┘     └──────────────┘     └──────┬──────┘
                                                │
                                                ▼
                                         ┌──────────────┐
                                         │  DeepSeek API │
                                         └──────────────┘
```

### 3. 配置说明

DeepSeek API集成需要以下配置：

#### 3.1 环境变量

在项目根目录的`.env`文件中配置以下内容：

```
# DeepSeek API配置
DEEPSEEK_API_KEY=your_api_key_here
DEEPSEEK_API_URL=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_MAX_TOKENS=4000
DEEPSEEK_TEMPERATURE=0.7
DEEPSEEK_TIMEOUT=30000
```

#### 3.2 参数说明

| 参数 | 说明 | 默认值 |
|------|------|-------|
| DEEPSEEK_API_KEY | DeepSeek API密钥 | 无，必须配置 |
| DEEPSEEK_API_URL | DeepSeek API地址 | https://api.deepseek.com/v1 |
| DEEPSEEK_MODEL | 使用的模型名称 | deepseek-chat |
| DEEPSEEK_MAX_TOKENS | 最大生成令牌数 | 4000 |
| DEEPSEEK_TEMPERATURE | 生成温度(0-1) | 0.7 |
| DEEPSEEK_TIMEOUT | 请求超时时间(毫秒) | 30000 |

### 4. API接口说明

#### 4.1 任务复杂度分析

```
POST /api/tasks/analyze
```

**请求参数：**

```json
{
  "taskId": "task-123",
  "title": "实现用户登录功能",
  "description": "开发一个完整的用户登录功能，包括表单验证、API集成、状态管理和错误处理。"
}
```

**响应：**

```json
{
  "taskId": "task-123",
  "title": "实现用户登录功能",
  "complexity": "MEDIUM"
}
```

#### 4.2 任务智能拆解

```
POST /api/tasks/decompose
```

**请求参数：**

```json
{
  "taskId": "task-123",
  "title": "实现用户登录功能",
  "description": "开发一个完整的用户登录功能，包括表单验证、API集成、状态管理和错误处理。",
  "complexity": "MEDIUM"
}
```

**响应：**

```json
[
  {
    "title": "设计登录表单界面",
    "description": "创建登录表单的UI组件，包括用户名/邮箱输入框、密码输入框和登录按钮。",
    "estimatedHours": 2
  },
  {
    "title": "实现表单验证",
    "description": "添加客户端表单验证逻辑，确保用户输入有效的凭据。",
    "estimatedHours": 1.5
  },
  {
    "title": "开发登录API集成",
    "description": "实现与后端登录API的集成，发送用户凭据并处理响应。",
    "estimatedHours": 2.5
  },
  {
    "title": "实现登录状态管理",
    "description": "创建用户登录状态管理逻辑，存储认证令牌和用户信息。",
    "estimatedHours": 2
  },
  {
    "title": "添加错误处理",
    "description": "实现错误处理机制，显示登录失败消息和其他错误提示。",
    "estimatedHours": 1
  }
]
```

### 5. 使用示例

在服务端代码中使用DeepSeek服务：

```typescript
import { DeepSeekService } from '../services/deepseekService';

// 创建服务实例
const deepseekService = new DeepSeekService();

// 分析任务复杂度
const analysisResult = await deepseekService.analyzeTaskComplexity({
  taskId: 'task-123',
  title: '实现用户登录功能',
  description: '开发一个完整的用户登录功能...'
});

// 拆解任务
const subTasks = await deepseekService.decomposeTask({
  taskId: 'task-123',
  title: '实现用户登录功能',
  description: '开发一个完整的用户登录功能...',
  complexity: analysisResult.complexity
});
```

### 6. 注意事项

1. 请确保DeepSeek API密钥的安全，不要将其硬编码或暴露在前端代码中
2. API调用可能产生费用，请合理控制使用频率
3. 请为生产环境配置适当的错误处理和重试机制
4. 模型响应可能有延迟，请在UI中添加适当的加载状态 