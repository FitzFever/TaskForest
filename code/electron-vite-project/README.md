# TaskForest 项目实现

这是TaskForest应用的主要实现目录，包含Electron应用、React前端和数据库实现。

<div align="center">

[安装指南](#安装指南) | 
[项目结构](#项目结构) | 
[开发命令](#开发命令) | 
[数据库](#数据库设计) | 
[3D实现](#3d实现) | 
[API文档](#api文档)

</div>

## 项目简介

TaskForest是一个将任务管理游戏化的应用，通过3D森林可视化展示任务完成情况。应用使用Electron、React、TypeScript和Three.js构建，采用SQLite和Prisma进行数据管理。

## 安装指南

### 环境需求

- Node.js 18+
- npm 或 pnpm
- Git

### 快速启动步骤

1. **安装依赖**
```bash
# 必须使用legacy-peer-deps解决依赖冲突
npm install --legacy-peer-deps
```

2. **初始化数据库**
```bash
# 确保.env文件中设置了正确的DATABASE_URL
# 默认为 DATABASE_URL="file:./dev.db"
npx prisma migrate dev --name init
```

3. **启动开发服务器**
```bash
npm run electron:dev
```

### 常见问题解决

- **依赖错误**: 安装依赖时遇到错误，请使用 `--legacy-peer-deps` 标志
- **数据库错误**: 检查 `.env` 文件中的 `DATABASE_URL` 配置
- **应用启动问题**: 确保所有依赖都已正确安装，并查看控制台错误

## 项目结构

```
electron-vite-project/
├── electron/               # Electron主进程代码
│   ├── main.ts             # 主进程入口
│   └── preload.ts          # 预加载脚本
├── prisma/                 # 数据库相关
│   └── schema.prisma       # 数据库模型定义
├── src/                    # 渲染进程代码
│   ├── components/         # React组件
│   ├── lib/                # 工具和服务
│   │   └── db.ts           # 数据库服务
│   ├── App.tsx             # 主应用组件
│   └── main.tsx            # 渲染进程入口
├── public/                 # 静态资源
├── .env                    # 环境变量
├── package.json            # 项目配置
└── vite.config.ts          # Vite配置
```

## 开发命令

- `npm run dev` - 启动Vite开发服务器
- `npm run electron:dev` - 启动Electron应用(开发模式)
- `npm run build` - 构建Web应用
- `npm run electron:build` - 构建Electron应用
- `npm run lint` - 运行ESLint检查代码
- `npm test` - 运行测试

## 数据库设计

使用Prisma ORM和SQLite，主要模型包括：

- **Task**: 任务模型，包含标题、描述、状态等
- **Category**: 任务分类模型
- **Tree**: 树木模型，与任务关联，包含生长阶段、位置等

数据库服务在 `src/lib/db.ts` 中实现，提供CRUD操作。

## 3D实现

使用Three.js和React Three Fiber实现3D森林：

- 基础场景在 `src/components/Forest.tsx` 中实现
- 树木模型为低多边形设计，支持生长动画
- 使用OrbitControls提供交互式摄像机控制

## API文档

### 任务API

```typescript
// 创建任务
TaskService.createTask({
  title: string,
  description?: string,
  status?: string,
  priority?: string,
  deadline?: Date,
  categoryId?: number
})

// 获取所有任务
TaskService.getAllTasks()

// 完成任务
TaskService.completeTask(id: number)
```

### 树木API

```typescript
// 创建树木
TreeService.createTree({
  type: string,
  growthStage?: number,
  position?: string
})

// 增加树木生长阶段
TreeService.growTree(id: number)
```

详细API文档请参阅数据库服务实现 `src/lib/db.ts`。

## 贡献指南

1. 请确保遵循项目的代码风格和TypeScript类型检查
2. 提交前运行lint和测试 (`npm run lint && npm test`)
3. 请为新功能编写单元测试
4. 提交PR时详细描述你的更改和实现思路