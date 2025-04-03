# TaskForest

TaskForest 是一款游戏化任务管理应用，将任务完成过程可视化为种植和培育树木的过程。每完成一个任务，就会在你的专属森林中种下一棵树，随着任务的进展，树木会逐渐生长。不同类型的任务对应不同品种的树木，通过 AI 技术智能拆解复杂任务。

## 功能特点

- 🌳 任务树木化：任务完成过程映射为树木生长过程
- 🎮 游戏化体验：通过完成任务培育专属森林
- 🤖 AI 助手：智能任务拆解和建议
- 📊 数据可视化：直观展示任务完成情况
- 🎨 精美 3D 界面：沉浸式的森林环境
- 🔄 实时同步：本地数据自动备份

## 技术栈

- 框架：Electron + React 18
- 语言：TypeScript
- 3D 渲染：Three.js + React Three Fiber
- 状态管理：Zustand
- UI 组件：Ant Design
- 样式：TailwindCSS
- 数据库：SQLite + Prisma
- AI：OpenAI API
- 测试：Jest

## 开发环境要求

- Node.js 18+
- pnpm
- Git
- Visual Studio Code（推荐）

## 快速开始

1. 克隆项目
```bash
git clone https://github.com/yourusername/task-forest.git
cd task-forest
```

2. 安装依赖
```bash
pnpm install
```

3. 初始化数据库
```bash
pnpm prisma generate
pnpm prisma db push
```

4. 启动开发服务器
```bash
pnpm dev
```

5. 构建应用
```bash
pnpm build
```

## 项目结构

```
task-forest/
├── src/
│   ├── main/           # Electron 主进程
│   ├── renderer/       # React 渲染进程
│   └── shared/         # 共享代码
├── prisma/             # 数据库模型
├── public/             # 静态资源
└── tests/             # 测试文件
```

## 开发指南

### 代码规范
- 使用 ESLint 和 Prettier 进行代码格式化
- 遵循 TypeScript 严格模式
- 组件使用函数式组件和 Hooks
- 提交前运行测试和类型检查

### 分支管理
- main: 主分支，保持稳定
- develop: 开发分支
- feature/*: 功能分支
- bugfix/*: 修复分支

### 提交规范
```
feat: 新功能
fix: 修复
docs: 文档
style: 格式
refactor: 重构
test: 测试
chore: 构建
```

## 测试

```bash
# 运行所有测试
pnpm test

# 运行特定测试
pnpm test <pattern>

# 生成测试覆盖率报告
pnpm test:coverage
```

## 构建与发布

```bash
# 构建应用
pnpm build

# 打包应用
pnpm package

# 发布应用
pnpm release
```

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License

## 团队

- 项目经理：李明
- 产品设计：王芳
- 3D 视觉：林小玲
- 前端开发：张强
- 全栈开发：陈学
- AI 工程师：吴杰

## 联系我们

- 邮箱：contact@taskforest.com
- 网站：https://taskforest.com
- GitHub：https://github.com/yourusername/task-forest 