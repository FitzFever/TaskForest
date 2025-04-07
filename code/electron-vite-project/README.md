# TaskForest - 3D任务管理应用

TaskForest是一款将任务管理与游戏化体验结合的桌面应用。通过将任务转化为树木的生长过程，为用户提供直观、有趣且富有成就感的任务管理体验。

## 🎯 功能概述

- **任务可视化**: 每个任务对应一棵树，任务完成度反映为树木的生长阶段
- **多种树木类型**: 不同类型的任务对应不同的树种，增加任务分类的趣味性
- **3D森林场景**: 所有完成的任务构成一片个人成就森林
- **任务管理系统**: 创建、编辑、完成和删除任务
- **数据持久化**: 使用Prisma ORM和SQLite数据库保存数据

## 🔧 环境要求

- Node.js >= 16
- npm >= 8 或 pnpm >= 7
- Electron >= 24
- SQLite

## ⚙️ 快速开始

### 安装依赖

```bash
# 使用npm
npm install

# 或使用pnpm
pnpm install
```

### 数据库初始化

```bash
# 使用npx
npx prisma migrate dev --name init

# 或使用pnpm
pnpm dlx prisma migrate dev --name init
```

### 开发模式启动

```bash
# 使用npm
npm run dev

# 或使用pnpm
pnpm dev
```

### 构建应用

```bash
# 使用npm
npm run build

# 或使用pnpm
pnpm build
```

## 📁 项目结构

```
electron-vite-project/
├── electron/             # Electron主进程代码
│   ├── main.ts           # 主进程入口
│   └── preload.ts        # 预加载脚本
├── prisma/               # 数据库模型和迁移
│   └── schema.prisma     # 数据库模式定义
├── src/                  # 渲染进程代码
│   ├── components/       # React组件
│   │   ├── ForestScene.tsx    # 3D森林场景
│   │   ├── TaskForm.tsx       # 任务表单
│   │   ├── TaskList.tsx       # 任务列表
│   │   └── TreeModel.tsx      # 树木模型
│   ├── lib/              # 实用工具
│   │   └── db.ts         # 数据库服务
│   ├── App.tsx           # 应用主组件
│   └── main.tsx          # 渲染进程入口
├── models/               # 3D模型文件(.glb)
├── public/               # 静态资源
└── vite.config.ts        # Vite配置
```

## 📝 使用指南

### 主要功能

1. **任务管理**:
   - 创建新任务，选择任务类型（对应不同树种）
   - 设置任务优先级、截止日期等
   - 编辑和删除已有任务
   - 标记任务为完成

2. **我的森林**:
   - 查看所有树木的3D视图
   - 点击树木查看对应任务信息
   - 观察树木随任务进度生长变化

### 树木生长阶段

每棵树有5个生长阶段:
- **阶段1**: 种子阶段（任务创建）
- **阶段2**: 幼苗阶段前期（任务进行25%）
- **阶段3**: 幼苗阶段后期（任务进行50%）
- **阶段4**: 成长阶段（任务进行75%）
- **阶段5**: 成熟阶段（任务完成）

## 🚀 开发计划

- [ ] 添加更多树木种类
- [ ] 实现季节变化效果
- [ ] 添加数据统计与可视化
- [ ] 支持任务导入/导出
- [ ] 实现用户账户系统

## 👨‍💻 贡献指南

1. Fork本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

## 📄 许可证

MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 🔗 相关资源

- [TreeModel_3D模型动画规范.md](../design/TaskForest_3D模型动画规范.md): 3D模型动画规范
- [TaskForest_3D视觉设计计划.md](../design/TaskForest_3D视觉设计计划.md): 3D视觉设计计划
- [README_设计资源指引.md](../design/README_设计资源指引.md): 设计资源指引