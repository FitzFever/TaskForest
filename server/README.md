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
│   ├── routes/           # 路由配置
│   │   ├── taskRoutes.ts # 任务路由
│   │   ├── treeRoutes.ts # 树木路由
│   │   ├── aiRoutes.ts   # AI 路由
│   │   └── index.ts      # 路由汇总
│   ├── middleware/       # 中间件
│   │   ├── error.ts      # 错误处理中间件
│   │   ├── logging.ts    # 日志中间件
│   │   └── validation.ts # 验证中间件
│   ├── utils/            # 工具函数
│   │   ├── logger.ts     # 日志工具
│   │   ├── errorHandler.ts # 错误处理
│   │   └── validation.ts # 数据验证
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

详细的 API 文档请参考 [API 文档](../docs/api/api_reference.md)。

## 核心数据模型

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
  rotationY   Float    @default(0)
  scaleX      Float    @default(1)
  scaleY      Float    @default(1)
  scaleZ      Float    @default(1)
  createdAt   DateTime @default(now())
  lastGrowth  DateTime @default(now())
  healthState Int      @default(100)
  task        Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
}
```

## 开发规范

详细的开发规范请参考 [开发规范文档](../docs/development/standards.md)。

主要规范要点：

1. 使用 TypeScript 强类型，避免 any 类型
2. 控制器负责处理请求和响应，服务层负责业务逻辑
3. 使用依赖注入模式，提高代码可测试性
4. 统一的错误处理和响应格式
5. 详细的日志记录

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

## 贡献

请参阅[贡献指南](../docs/development/contributing.md)了解如何为后端项目做出贡献。 