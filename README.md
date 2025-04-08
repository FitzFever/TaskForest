# TaskForest

TaskForest 是一款将任务管理与游戏化体验结合的桌面应用，通过将任务转化为树木的生长过程，为用户提供直观、有趣且富有成就感的任务管理体验。

## 项目概述

TaskForest 采用前后端分离架构，结合 Electron 实现桌面应用，使用 Three.js 进行 3D 渲染，SQLite 进行本地数据存储。

### 核心功能
- **任务管理**：创建、编辑、完成任务
- **可视化树木生长**：任务完成度映射为树木生长状态
- **3D 森林场景**：直观展示任务完成情况
- **AI 辅助功能**：智能任务拆解与建议
- **数据统计分析**：任务完成率与时间投入分析

### 技术栈
- **前端**：React + TypeScript + Three.js + Zustand
- **后端**：Node.js + Express + Prisma
- **数据库**：SQLite
- **桌面容器**：Electron
- **AI 集成**：OpenAI API

## 项目架构

```
+---------------------+        +---------------------+
|   前端应用层         |        |   后端服务层         |
|---------------------|        |---------------------|
| React + TypeScript  | <----> | Node.js + Express   |
| Three.js            |  API   | 业务逻辑             |
| Zustand             |        | 数据处理             |
|---------------------|        |---------------------|
| Electron容器         |        | 数据持久化层         |
+---------------------+        +---------------------+
                                        |
                               +---------------------+
                               |     数据存储层       |
                               |---------------------|  
                               |      SQLite         |
                               +---------------------+
```

## 项目结构

```
taskforest/
├── client/                  # 前端代码
│   ├── src/                 # 前端源代码
│   │   ├── components/      # React组件
│   │   ├── pages/           # 页面组件
│   │   ├── store/           # 状态管理
│   │   ├── services/        # API服务
│   │   ├── three/           # 3D渲染相关
│   │   └── utils/           # 工具函数
│   ├── public/              # 静态资源
│   └── README.md            # 前端文档
├── server/                  # 后端代码
│   ├── src/                 # 后端源代码
│   │   ├── controllers/     # API控制器
│   │   ├── services/        # 业务服务
│   │   ├── models/          # 数据模型
│   │   ├── routes/          # 路由配置
│   │   ├── middleware/      # 中间件
│   │   └── utils/           # 工具函数
│   ├── prisma/              # Prisma ORM
│   └── README.md            # 后端文档
├── docs/                    # 项目文档
│   ├── api/                 # API文档
│   ├── development/         # 开发规范
│   ├── architecture/        # 架构文档
│   └── design/              # 设计文档
└── README.md                # 项目总览文档
```

## 文档导航

- [项目架构文档](./docs/architecture/architecture_overview.md) - 系统架构设计
- [详细设计文档](./docs/design/detailed_design.md) - 模块和接口详细设计
- [前端项目说明](./client/README.md) - 前端项目详细说明
- [后端项目说明](./server/README.md) - 后端项目详细说明
- [开发规范](./docs/development/standards.md) - 开发规范和流程
- [贡献指南](./docs/development/contributing.md) - 项目贡献指南
- [API 文档](./docs/api/api_reference.md) - API 接口参考
- [开发任务](./docs/development_tasks.md) - 开发任务清单

## 开始使用

### 环境要求
- Node.js >= 18
- npm >= 8 或 pnpm >= 7
- Git

### 安装与运行
```bash
# 克隆项目
git clone https://github.com/yourusername/taskforest.git
cd taskforest

# 安装依赖
pnpm install

# 启动开发环境
pnpm dev

# 构建应用
pnpm build
```

## 贡献指南

请参阅 [贡献指南](./docs/development/contributing.md) 了解如何为项目做出贡献。

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件