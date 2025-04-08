# TaskForest 后端项目

TaskForest 后端基于 Node.js + Express + TypeScript 构建，使用 Prisma ORM 操作 SQLite 数据库，为前端提供 RESTful API 服务。

## 技术栈

- **运行时**: Node.js 18 + TypeScript 5
- **框架**: Express 4
- **ORM**: Prisma 4
- **数据库**: SQLite 3
- **API 文档**: Swagger/OpenAPI 3
- **测试**: Jest + Supertest
- **AI 集成**: OpenAI API

## 项目结构

```
server/
├── src/                  # 源代码目录
│   ├── controllers/      # API 控制器
│   │   ├── taskController.ts  # 任务控制器
│   │   ├── treeController.ts  # 树木控制器
│   │   ├── aiController.ts    # AI 助手控制器
│   │   └── settingsController.ts # 设置控制器
│   ├── services/         # 业务服务
│   │   ├── taskService.ts     # 任务服务
│   │   ├── treeService.ts     # 树木服务
│   │   ├── aiService.ts       # AI 助手服务
│   │   └── settingsService.ts # 设置服务
│   ├── models/           # 数据模型
│   │   ├── task.ts       # 任务模型
│   │   ├── tree.ts       # 树木模型
│   │   └── settings.ts   # 设置模型
│   ├── utils/            # 工具函数
│   │   ├── logger.ts     # 日志工具
│   │   ├── errorHandler.ts # 错误处理
│   │   └── validation.ts # 数据验证
│   ├── middleware/       # 中间件
│   │   ├── error.ts      # 错误处理中间件
│   │   ├── logging.ts    # 日志中间件
│   │   └── validation.ts # 验证中间件
│   ├── ai/               # AI 助手相关
│   │   ├── openai.ts     # OpenAI 集成
│   │   ├── taskAnalyzer.ts # 任务分析器
│   │   └── suggestionGenerator.ts # 建议生成器
│   ├── database/         # 数据库配置
│   │   ├── client.ts     # Prisma 客户端
│   │   └── seed.ts       # 数据库种子
│   ├── routes/           # 路由配置
│   │   ├── taskRoutes.ts # 任务路由
│   │   ├── treeRoutes.ts # 树木路由
│   │   ├── aiRoutes.ts   # AI 路由
│   │   └── index.ts      # 路由汇总
│   ├── types/            # 类型定义
│   │   ├── task.ts       # 任务类型
│   │   ├── tree.ts       # 树木类型
│   │   └── api.ts        # API 类型
│   ├── config/           # 配置文件
│   │   ├── app.ts        # 应用配置
│   │   ├── db.ts         # 数据库配置
│   │   └── openai.ts     # OpenAI 配置
│   └── app.ts            # 应用入口
├── prisma/               # Prisma ORM
│   ├── schema.prisma     # 数据库 Schema
│   ├── migrations/       # 数据库迁移
│   └── seed.ts           # 数据库种子脚本
├── tests/                # 测试文件
│   ├── unit/             # 单元测试
│   ├── integration/      # 集成测试
│   └── fixtures/         # 测试数据
├── .eslintrc.js          # ESLint 配置
├── .prettierrc           # Prettier 配置
├── jest.config.js        # Jest 配置
├── tsconfig.json         # TypeScript 配置
└── package.json          # 项目依赖
```

## 开发指南

### 安装依赖

```bash
# 进入后端目录
cd server

# 安装依赖
pnpm install
```

### 数据库设置

```bash
# 生成 Prisma 客户端
pnpm prisma generate

# 创建数据库迁移
pnpm prisma migrate dev

# 数据库种子填充
pnpm prisma db seed
```

### 启动服务

```bash
# 开发模式
pnpm dev

# 生产模式
pnpm start
```

### 测试

```bash
# 运行所有测试
pnpm test

# 运行单元测试
pnpm test:unit

# 运行集成测试
pnpm test:integration
```

## API 接口

TaskForest 后端提供 RESTful API 接口，遵循以下设计原则：

1. 使用标准 HTTP 方法（GET, POST, PUT, DELETE）
2. 使用资源命名的 URL 路径
3. 使用状态码表示请求结果
4. 支持分页、过滤和排序
5. 返回 JSON 格式数据

### 核心 API 概览

```
# 任务相关API
GET    /api/tasks           - 获取任务列表
GET    /api/tasks/:id       - 获取单个任务
POST   /api/tasks           - 创建新任务
PUT    /api/tasks/:id       - 更新任务
DELETE /api/tasks/:id       - 删除任务
PUT    /api/tasks/:id/status - 更新任务状态
POST   /api/tasks/:id/complete - 完成任务

# 树木相关API
GET    /api/trees           - 获取树木列表
GET    /api/trees/:id       - 获取单个树木
PUT    /api/trees/:id       - 更新树木
DELETE /api/trees/:id       - 删除树木
GET    /api/trees/by-task/:taskId - 根据任务ID获取树木

# AI助手相关API
POST   /api/ai/analyze-task - AI分析任务
POST   /api/ai/breakdown-task - AI拆解任务
POST   /api/ai/suggestions  - 获取任务建议

# 用户设置相关API
GET    /api/settings        - 获取用户设置
PUT    /api/settings        - 更新用户设置

# 数据同步相关API
POST   /api/sync            - 同步数据
POST   /api/backup          - 备份数据
POST   /api/restore         - 恢复数据
```

### API 示例

#### 获取任务列表

```
GET /api/tasks?status=TODO&type=WORK&page=1&limit=20
```

响应：

```json
{
  "code": 200,
  "data": {
    "tasks": [
      {
        "id": "1234-5678-90ab-cdef",
        "title": "完成项目报告",
        "description": "整理季度项目进展情况",
        "type": "WORK",
        "status": "TODO",
        "priority": 2,
        "dueDate": "2023-07-20T10:00:00Z",
        "createdAt": "2023-07-10T08:00:00Z",
        "updatedAt": "2023-07-10T08:00:00Z",
        "completedAt": null,
        "parentId": null,
        "tags": ["项目", "报告"],
        "treeType": "OAK",
        "growthStage": 1
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 20,
      "pages": 3
    }
  }
}
```

## 错误处理

后端采用统一的错误处理机制，所有 API 错误返回以下格式：

```json
{
  "code": 400,
  "error": {
    "message": "任务标题不能为空",
    "type": "VALIDATION_ERROR",
    "details": {
      "field": "title",
      "reason": "required"
    }
  }
}
```

常见错误状态码：
- 400: 请求参数错误
- 401: 未授权
- 403: 无权限
- 404: 资源不存在
- 500: 服务器内部错误

## 数据库模型

使用 Prisma Schema 定义主要数据模型：

```prisma
model Task {
  id          String     @id @default(uuid())
  title       String
  description String?
  type        TaskType
  status      TaskStatus @default(TODO)
  priority    Int        @default(1)
  dueDate     DateTime
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  completedAt DateTime?
  parentId    String?
  tags        String[]
  tree        Tree?
  parent      Task?      @relation("TaskToTask", fields: [parentId], references: [id])
  children    Task[]     @relation("TaskToTask")
}

model Tree {
  id          String   @id @default(uuid())
  taskId      String   @unique
  type        String
  stage       Int      @default(0)
  positionX   Float
  positionY   Float
  positionZ   Float
  rotationX   Float    @default(0)
  rotationY   Float    @default(0)
  rotationZ   Float    @default(0)
  scaleX      Float    @default(1)
  scaleY      Float    @default(1)
  scaleZ      Float    @default(1)
  createdAt   DateTime @default(now())
  lastGrowth  DateTime @default(now())
  healthState Int      @default(100)
  task        Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
}
```

## AI 集成

后端集成 OpenAI API 提供智能任务分析和建议：

```typescript
// 示例：AI 任务拆解服务
import { openai } from '../ai/openai';

class TaskAnalyzerService {
  async breakdownTask(task: Task): Promise<Task[]> {
    try {
      const response = await openai.createCompletion({
        model: "gpt-4",
        prompt: `请将以下任务拆解为子任务:\n${task.title}\n${task.description}`,
        max_tokens: 1000,
        temperature: 0.7,
      });
      
      // 解析 AI 响应并转换为子任务
      const subtasks = parseAIResponseToSubtasks(response.data.choices[0].text);
      
      // 创建子任务
      return this.createSubtasks(task.id, subtasks);
    } catch (error) {
      logger.error('AI 任务拆解失败', error);
      throw new AppError('AI_REQUEST_FAILED', '任务拆解请求失败');
    }
  }

  // 其他方法...
}
```

## 文档

- [API 接口详细文档](../docs/api/api_reference.md)
- [数据库设计文档](../docs/design/database_design.md)
- [服务层设计](../docs/design/service_design.md)
- [API 测试指南](../docs/development/api_testing.md)

## 贡献

请参阅[贡献指南](../docs/development/contributing.md)了解如何为后端项目做出贡献。 