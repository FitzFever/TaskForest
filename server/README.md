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

# TaskForest 后端服务

TaskForest 后端服务提供了任务管理的 REST API，支持任务的 CRUD 操作、任务状态管理、任务统计和树木数据管理等功能。

## 技术栈

- **Node.js**: 运行环境
- **Express**: Web 框架
- **MongoDB** (计划中): 数据库
- **SQLite** (当前开发阶段): 轻量级数据库
- **JSON Server** (当前开发阶段): 模拟 REST API
- **TypeScript**: 类型安全
- **Jest**: 单元测试
- **Swagger**: API 文档

## 项目结构

```
server/
├── src/                 # 源代码目录
│   ├── config/          # 配置文件
│   ├── controllers/     # 控制器
│   ├── middlewares/     # 中间件
│   ├── models/          # 数据模型
│   ├── routes/          # 路由定义
│   ├── services/        # 业务逻辑层
│   ├── types/           # TypeScript 类型
│   ├── utils/           # 工具函数
│   ├── app.ts           # 应用入口
│   ├── server.ts        # 服务器启动
│   └── dev.js           # 开发模式服务器
├── tests/               # 测试目录
├── .eslintrc.js         # ESLint 配置
├── .prettierrc          # Prettier 配置
├── tsconfig.json        # TypeScript 配置
├── jest.config.js       # Jest 配置
└── package.json         # 项目依赖
```

## 开发进度

### 已完成功能 ✅

- 基础项目设置与配置
- 开发服务器设置（JSON Server）
- 任务管理 API（CRUD 操作）
- 任务状态管理 API
- 任务查询与筛选接口
- 任务分页与排序
- 基础错误处理
- CORS 配置
- 任务统计 API
- 树木数据关联 API

### 进行中 🔄

- 真实数据库集成 (40%)
- API 文档生成 (30%)
- 单元测试覆盖 (20%)
- 健康检查与监控 (50%)
- 性能优化 (10%)
- 安全增强 (15%)

### 待实现 ⬜

- 用户认证与授权
- 数据备份与恢复
- 日志系统
- 高级查询优化
- WebSocket 实时通知
- 定时任务
- 部署脚本

## API 端点

### 任务相关

- `GET /api/tasks`: 获取任务列表
- `GET /api/tasks/:id`: 获取单个任务详情
- `POST /api/tasks`: 创建新任务
- `PUT /api/tasks/:id`: 更新任务
- `PATCH /api/tasks/:id/status`: 更新任务状态
- `PATCH /api/tasks/:id/complete`: 完成任务
- `DELETE /api/tasks/:id`: 删除任务

### 统计相关

- `GET /api/stats`: 获取任务统计信息

### 树木相关

- `GET /api/trees`: 获取树木列表
- `GET /api/trees/:id`: 获取单个树木详情
- `GET /api/tasks/:id/tree`: 获取任务关联的树木

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建项目

```bash
npm run build
```

### 运行测试

```bash
npm test
```

## 环境变量

开发前需要设置以下环境变量：

```
PORT=9000                 # 服务运行端口
NODE_ENV=development      # 环境 (development, production, test)
DB_CONNECTION=            # 数据库连接字符串 (未来使用)
JWT_SECRET=               # JWT 密钥 (未来使用)
```

## 调试与测试

### API 测试

可以使用 Postman 或 curl 进行 API 测试：

```bash
# 获取所有任务
curl http://localhost:9000/api/tasks

# 创建新任务
curl -X POST http://localhost:9000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"新任务","description":"任务描述","status":"TODO","priority":"MEDIUM"}'
```

### 数据库调试

在开发阶段，我们使用 JSON Server 模拟数据库。数据文件位于 `server/data/db.json`。

## 贡献指南

1. 确保遵循项目的代码风格和 TypeScript 类型定义
2. 提交前运行代码检查和单元测试
3. 遵循 RESTful API 设计原则
4. 编写必要的 API 文档和测试用例
5. 提交 PR 前先与相关团队成员讨论设计决策 