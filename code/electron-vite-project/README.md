# TaskForest

TaskForest是一个创新的任务管理应用，通过将任务完成度可视化为一片森林，激励用户完成目标。每当完成一个任务，就会有一棵虚拟的树成长一步，最终形成一片属于自己的成就森林。

## 项目特点

- 🌳 **成长森林**：任务完成后，虚拟树木会逐步成长，形成个人专属的成就森林
- 📝 **任务管理**：高效的任务创建、编辑、分类与跟踪系统
- 🤖 **AI辅助**：利用人工智能帮助任务分解与计划安排
- 🎮 **游戏化元素**：通过视觉反馈和成长系统激励完成任务
- 💾 **数据同步**：支持本地存储，保护您的隐私数据
- 🌓 **多主题支持**：包括明亮与暗黑模式

## 技术栈

- 💻 **Electron**：跨平台桌面应用框架
- ⚛️ **React**：用户界面构建
- 🧰 **TypeScript**：类型安全的JavaScript超集
- 🎨 **Tailwind CSS & Ant Design**：UI组件和样式
- 🌐 **Three.js & React Three Fiber**：3D森林渲染
- 📊 **Prisma & SQLite**：数据存储和ORM
- 🧠 **OpenAI API**：AI功能集成

## 快速开始

### 环境需求

- Node.js 18+
- npm 或 pnpm
- Git

### 安装与启动步骤

1. **克隆仓库**
```bash
git clone https://github.com/yourusername/TaskForest.git
cd TaskForest
```

2. **安装依赖**
```bash
cd code/electron-vite-project
npm install --legacy-peer-deps
```

3. **初始化数据库**
```bash
# 确保.env文件中设置了正确的DATABASE_URL
# 默认为 DATABASE_URL="file:./dev.db"
npx prisma migrate dev --name init
```

4. **启动开发服务器**
```bash
npm run electron:dev
```

### 常见问题解决

- **依赖错误**: 如果安装依赖时遇到错误，请使用 `--legacy-peer-deps` 标志
  ```bash
  npm install --legacy-peer-deps
  ```

- **数据库错误**: 检查 `.env` 文件中的 `DATABASE_URL` 配置是否正确

- **应用启动问题**: 确保所有依赖都已正确安装，并且没有TypeScript编译错误

## 项目结构

```
TaskForest/
├─ code/
│  ├─ electron-vite-project/      # 主项目目录
│  │  ├─ electron/                # Electron主进程代码
│  │  ├─ prisma/                  # 数据库Schema和迁移
│  │  └─ src/                     # 渲染进程代码
│  │     ├─ components/           # React组件
│  │     ├─ lib/                  # 工具和服务
│  │     └─ assets/               # 静态资源
│  └─ docs/                       # 项目文档
├─ design/                        # 设计资源
└─ product/                       # 产品文档
```

### 开发命令

- `npm run dev` - 启动Vite开发服务器
- `npm run electron:dev` - 启动Electron应用程序(开发模式)
- `npm run build` - 构建Web应用
- `npm run electron:build` - 构建Electron应用程序
- `npm run lint` - 运行ESLint检查代码
- `npm test` - 运行测试

## 开发状态

当前项目处于初始开发阶段，已完成基础架构搭建：

- ✅ 项目基础设置与环境配置
- ✅ 数据库设计与Prisma ORM配置
- ✅ 3D场景基础搭建
- ✅ 简单树木模型实现
- ✅ 基础UI界面框架
- ✅ 任务CRUD接口实现

正在进行中的工作：

- 🔄 树木生长动画开发
- 🔄 任务与树木关联逻辑
- 🔄 任务状态管理和分类功能

## 参与贡献

1. Fork项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

## 许可证

此项目采用MIT许可证 - 详情请参见LICENSE文件