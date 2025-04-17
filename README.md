# TaskForest

TaskForest 是一款将任务管理与游戏化体验结合的桌面应用，通过将任务转化为树木的生长过程，为用户提供直观、有趣且富有成就感的任务管理体验。

## 项目概述

TaskForest 采用前后端分离架构，结合 Electron 实现桌面应用，使用 Three.js 进行 3D 渲染，SQLite 进行本地数据存储。

### 核心功能
- **任务管理**：创建、编辑、完成任务
- **可视化树木生长**：任务完成度映射为树木生长状态
- **3D 森林场景**：直观展示任务完成情况
- **树木生命状态**：基于任务进度和截止日期的树木健康系统
- **奖励与解锁机制**：完成任务解锁不同树种和特殊装饰
- **AI 辅助功能**：智能任务拆解与建议（计划中）
- **数据统计分析**：任务完成率与时间投入分析

### 技术栈
- **前端**：React 18 + TypeScript 5 + Three.js + Zustand + Vite
- **后端**：Node.js 18 + Express 4 + Prisma 4 + TypeScript 5
- **数据库**：SQLite 3
- **包管理**：pnpm
- **AI 集成**：OpenAI API（计划中）

## 开发计划与进展

当前项目处于初期开发阶段，我们正在按照以下优先级实施功能：

### 当前进展
- ✅ 基础项目架构搭建完成
- ✅ 任务CRUD基础功能实现
- ✅ 3D场景基础渲染系统
- ✅ 前后端通信架构
- ✅ 基础任务列表与任务管理UI
- ✅ 树木模型基础加载和展示
- ✅ 树木健康状态数据模型
- 🔄 树木健康状态视觉效果实现中
- 🔄 任务数据模型扩展中
- 🔄 前端体验优化中

### 近期开发计划
1. **树木生命状态系统** - 实现树木健康状态与任务进度/截止日期的联动
   - ✅ 健康状态数据模型设计
   - ✅ 健康状态计算逻辑实现
   - 🔄 生命值与生长阶段映射开发中
   - 🔄 健康状态视觉效果实现中

2. **树木解锁与奖励系统** - 开发不同类型任务对应不同树种的解锁机制
   - ✅ 树木类型数据模型
   - 🔄 解锁条件管理开发中
   - ⬜ 成就系统框架设计
   - ⬜ 特殊树种实现

3. **任务拆解与森林管理** - 实现子任务系统和森林布局管理
   - 🔄 子任务关联模型开发中
   - ⬜ 任务拆解UI设计
   - ⬜ 森林布局算法
   - ⬜ 时间轴导航功能

详细开发路线图请参阅 [开发路线图](./docs/development/roadmap.md)。
完整开发任务清单请参阅 [开发任务清单](./docs/development_tasks.md)。

## 快速启动

项目提供了便捷的启动脚本，支持多种系统和启动方式。

### 推荐：使用开发专用脚本（Unix/Linux/macOS）

```bash
# 先赋予脚本执行权限
chmod +x start-dev.sh

# 启动开发环境（前后端）
./start-dev.sh
```

### 其他启动方式

#### Windows 系统

```bash
# 开发模式启动前后端
start.bat

# 仅启动前端
start.bat /f

# 仅启动后端
start.bat /b

# 生产模式启动
start.bat /p

# 显示帮助信息
start.bat /h
```

#### Unix/Linux/macOS 系统

```bash
# 先赋予脚本执行权限
chmod +x start.sh

# 开发模式启动前后端
./start.sh

# 仅启动前端
./start.sh -f

# 仅启动后端
./start.sh -b

# 生产模式启动
./start.sh -p

# 显示帮助信息
./start.sh -h
```

### 手动启动

如果你不想使用启动脚本，也可以手动启动项目：

```bash
# 安装依赖
pnpm install
cd client && pnpm install && cd ..
cd server && pnpm install && cd ..

# 启动前端
cd client && pnpm dev

# 启动后端
cd server && pnpm dev
```

## 项目架构

```
+---------------------+        +---------------------+
|   前端应用层         |        |   后端服务层         |
|---------------------|        |---------------------|
| React + TypeScript  | <----> | Node.js + Express   |
| Three.js            |  API   | 业务逻辑             |
| Zustand             |        | 数据处理             |
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
│   │   ├── services/        # API服务
│   │   ├── three/           # 3D渲染相关
│   │   └── stores/          # 状态管理
│   ├── public/              # 静态资源
│   └── README.md            # 前端文档
├── server/                  # 后端代码
│   ├── src/                 # 后端源代码
│   │   ├── controllers/     # API控制器
│   │   ├── services/        # 业务服务
│   │   ├── routes/          # 路由配置
│   │   └── models/          # 数据模型
│   ├── prisma/              # Prisma ORM
│   ├── data/                # 数据文件夹
│   ├── start-dev.sh         # 后端开发启动脚本
│   └── README.md            # 后端文档
├── docs/                    # 项目文档
├── start-dev.sh             # 项目开发启动脚本
├── start.sh                 # Unix启动脚本
├── start.bat                # Windows启动脚本
└── README.md                # 项目总览文档
```

## 文档导航

- [项目架构文档](./docs/architecture/architecture_overview.md) - 系统架构设计
- [开发规范](./docs/development/standards.md) - 开发规范和流程
- [前端项目说明](./client/README.md) - 前端项目详细说明
- [后端项目说明](./server/README.md) - 后端项目详细说明
- [API 文档](./docs/api/api_reference.md) - API 接口参考
- [故障排除指南](./docs/development/troubleshooting.md) - 开发常见问题解决方案

## 环境要求

- Node.js >= 18
- pnpm >= 7（推荐）或 npm >= 8
- Git

## 常见问题解决

1. **启动脚本提示"无法识别的命令"**
   - 确保已安装Node.js和pnpm
   - 在Unix/Linux/macOS系统上，确保已设置脚本执行权限：`chmod +x start-dev.sh`

2. **前端启动后显示空白页面**
   - 检查浏览器控制台是否有错误
   - 确认后端服务是否正常运行（API地址默认为 http://localhost:9000）
   - 检查前端配置文件是否正确（.env.development.local）

3. **后端服务启动失败**
   - 检查端口9000是否被占用
   - 确认数据库配置是否正确
   - 检查logs/目录中的日志文件获取详细错误信息

4. **3D模型加载失败**
   - 检查控制台是否有资源加载错误
   - 确认public/models目录中的模型文件是否存在
   - 检查模型路径是否正确配置

详细问题解决方案请参阅 [开发常见问题解决指南](./docs/development/troubleshooting.md)。

## 贡献指南

请参阅 [贡献指南](./docs/development/contributing.md) 了解如何为项目做出贡献。

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件