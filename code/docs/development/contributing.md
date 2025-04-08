# TaskForest 贡献指南

感谢您对 TaskForest 项目的关注和贡献！本文档旨在帮助新的贡献者了解如何参与项目开发并确保贡献过程顺利进行。

## 行为准则

TaskForest 项目遵循开放、包容的原则，欢迎各种背景和经验的开发者参与。我们希望所有参与者能够相互尊重，共同营造一个积极、友好的社区环境。

## 如何贡献

### 发现 Bug 或提出新功能

1. 在提交新的 issue 前，请先搜索是否已有相同或类似的问题报告
2. 使用 GitHub Issues 提交问题，并按照 issue 模板提供必要信息
3. 对于 Bug 报告，请尽可能详细描述问题复现步骤、期望行为和实际行为
4. 对于新功能建议，请说明该功能的使用场景和预期效果

### 提交代码改动

1. Fork 项目仓库到您的 GitHub 账号
2. 克隆 fork 的仓库到本地开发环境
3. 创建新的功能分支 (feature/xxx) 或修复分支 (bugfix/xxx)
4. 进行代码修改
5. 提交代码前确保所有测试通过
6. 提交 Pull Request 至主仓库的 develop 分支

### Pull Request 工作流

1. PR 标题遵循规范：`<type>(<scope>): <subject>`
   - 例如：`feat(task): 添加任务过滤功能`
2. PR 描述应包含以下信息：
   - 改动的目的和动机
   - 实现方式的简要说明
   - 相关的 issue 链接 (如有)
   - 可能的风险或注意事项
3. PR 合并前需要通过代码审查和自动化测试
4. 每个 PR 应专注于单一功能或修复，避免包含不相关的改动

## 开发环境设置

### 前提条件

- Node.js >= 18
- pnpm >= 7
- Git

### 初始化开发环境

```bash
# 克隆仓库
git clone https://github.com/yourusername/taskforest.git
cd taskforest

# 安装依赖
pnpm install

# 启动开发服务器 (前端)
cd client
pnpm dev

# 启动后端服务器
cd server
pnpm dev
```

## 项目结构

请参考[项目结构文档](../README.md#项目结构)了解代码组织方式。

## 编码规范

TaskForest 项目有严格的代码规范要求，请确保您的代码符合以下标准：

### 通用规范

- 使用 TypeScript 强类型，避免使用 `any`
- 文件名采用 kebab-case 命名方式 (如: `task-service.ts`)
- 函数和变量采用 camelCase 命名方式
- 类和接口采用 PascalCase 命名方式
- 常量使用 UPPER_SNAKE_CASE 命名方式
- 代码缩进使用 2 个空格
- 代码行宽控制在 100 字符以内
- 文件末尾保留一个空行

### JavaScript/TypeScript 规范

- 优先使用 `const`，其次 `let`，避免使用 `var`
- 使用模板字符串替代字符串拼接
- 使用解构赋值
- 使用箭头函数表达简短的回调
- 使用 `async/await` 处理异步操作，避免回调嵌套
- 导入语句按照内置模块、第三方模块、本地模块的顺序排列

### React 组件规范

- 使用函数式组件和 Hooks
- 每个组件单独放在其专属目录中
- 组件目录包含组件本身、样式和测试文件
- Props 定义使用 TypeScript interface
- 遵循单一职责原则，组件只做一件事

### CSS 规范

- 使用 CSS Modules 避免样式冲突
- 类名使用 kebab-case
- 遵循 BEM 命名原则
- 避免直接修改标签样式，优先使用类选择器
- 避免过度嵌套 (嵌套不超过 3 层)

### 后端代码规范

- 遵循 RESTful API 设计原则
- 使用适当的 HTTP 状态码
- 统一的响应格式
- 控制器负责处理请求/响应，服务负责业务逻辑
- 详细的错误处理和日志记录

## 测试规范

每个贡献应包含适当的测试：

### 前端测试

- 组件测试：使用 React Testing Library
- 单元测试：对工具函数和服务进行测试
- 关注测试用户行为而非实现细节

### 后端测试

- 单元测试：测试服务和工具函数
- 接口测试：测试 API 端点
- 数据库测试：测试数据操作

### 常见测试场景

- 组件渲染测试
- 用户交互测试
- API 请求测试
- 错误处理测试
- 边界条件测试

## 文档规范

好的文档对于项目的可维护性至关重要：

- 公共 API 和关键函数添加 JSDoc 注释
- 复杂逻辑添加注释说明
- 更新 README 和相关文档以反映您的更改
- 文档使用简明的语言，并提供示例
- API 更改需要更新对应的接口文档

## 提交规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <subject>
```

类型包括：
- **feat**: 新功能
- **fix**: 错误修复
- **docs**: 文档更新
- **style**: 代码格式修改
- **refactor**: 代码重构
- **perf**: 性能优化
- **test**: 测试相关
- **build**: 构建系统相关
- **ci**: CI 相关
- **chore**: 其他更改

示例：
- `feat(task): 添加任务排序功能`
- `fix(tree): 修复树木生长动画不流畅问题`
- `docs(api): 更新任务API文档`

## 版本管理

TaskForest 使用语义化版本 (SemVer)：

- 主版本号 (MAJOR)：不兼容的 API 更改
- 次版本号 (MINOR)：向后兼容的功能新增
- 修订号 (PATCH)：向后兼容的 Bug 修复

## 发布流程

1. 从 develop 分支创建 release 分支
2. 在 release 分支上进行测试和最终调整
3. 更新版本号和 CHANGELOG
4. 将 release 分支合并到 main/master 分支
5. 为发布版本创建 tag
6. 将 release 分支合并回 develop 分支

## 获取帮助

如果您在贡献过程中遇到任何问题，可以通过以下方式获取帮助：

- GitHub Issues
- 项目文档
- 联系核心开发团队

## 致谢

再次感谢您为 TaskForest 项目做出贡献！您的参与对项目的成功至关重要。 