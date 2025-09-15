# TaskForest 开发规范文档

本文档定义了 TaskForest 项目的开发规范和流程，旨在确保代码质量、提高团队协作效率和维护项目一致性。

## 1. 代码风格规范

### 1.1 TypeScript/JavaScript规范

- 使用 TypeScript 强类型，避免使用 `any` 类型
- 使用 ES6+ 语法特性
- 使用 async/await 替代回调和 Promise 链
- 变量和函数使用 camelCase 命名
- 类和组件使用 PascalCase 命名
- 常量使用 UPPER_SNAKE_CASE 命名
- 接口名以 "I" 开头，如 ITaskProps
- 类型名以 "T" 开头，如 TTaskStatus
- 枚举名使用 PascalCase，如 TaskStatus
- 文件名使用 kebab-case，如 task-service.ts

### 1.2 React组件规范

- 使用函数式组件和 React Hooks
- 组件文件夹结构：
  ```
  ComponentName/
  ├── index.tsx         # 组件主文件
  ├── styles.module.css # 组件样式
  └── ComponentName.test.tsx # 组件测试
  ```
- Props 使用 interface 定义类型
- 避免内联样式，使用 CSS Modules
- 组件应遵循单一职责原则
- 大型组件应分解为小型、可复用组件
- 使用 React.memo 优化渲染性能
- 使用 useCallback 和 useMemo 避免不必要的重新计算

### 1.3 CSS规范

- 使用 TailwindCSS + CSS Modules
- 组件局部样式使用 CSS Modules
- 全局样式使用 Tailwind 工具类
- 复杂组件使用 BEM 命名方式:
  ```css
  .task-card {}
  .task-card__title {}
  .task-card__description {}
  .task-card--completed {}
  ```
- 避免深层嵌套选择器（不超过3层）
- 响应式设计使用 Tailwind 断点

### 1.4 后端代码规范

- 使用 RESTful API 设计原则
- 控制器负责处理请求和响应
- 服务层负责业务逻辑
- 数据访问层负责数据库操作
- 使用依赖注入模式
- 错误处理使用统一的错误类和中间件
- API 返回统一的响应格式
- 使用环境变量存储配置
- 常量和枚举定义应集中管理：
  - 业务常量应放在`constants`目录下的专用文件中
  - 任务类型与树木类型的映射关系必须在`constants/treeTypeMappings.ts`中维护
  - 映射关系变更需要同步更新API文档

## 2. Git工作流规范

### 2.1 分支管理

- **master/main**: 主分支，保持稳定，随时可发布
- **develop**: 开发分支，集成功能，准备下一个版本
- **feature/***: 功能分支，如 feature/task-list
- **bugfix/***: 修复分支，如 bugfix/tree-growth
- **release/***: 发布分支，如 release/v1.0.0
- **hotfix/***: 紧急修复分支，如 hotfix/login-issue

分支命名规则：
- 使用小写字母和连字符
- 简洁明了地描述功能或修复
- 包含相关的任务或问题编号

### 2.2 提交规范

使用 Conventional Commits 规范:

```
<type>(<scope>): <subject>

<body>

<footer>
```

类型 (type):
- **feat**: 新功能
- **fix**: 错误修复
- **docs**: 文档更新
- **style**: 代码格式调整（不影响代码运行）
- **refactor**: 代码重构
- **perf**: 性能优化
- **test**: 测试相关
- **build**: 构建系统相关
- **ci**: CI相关
- **chore**: 其它更改

示例:
- `feat(task): 添加任务过滤功能`
- `fix(tree): 修复树木生长动画问题`
- `docs(api): 更新API文档`

### 2.3 Pull Request流程

1. 创建新分支进行开发
2. 完成开发后，提交 Pull Request
3. PR应包含明确的标题和描述
4. 确保通过所有自动化测试
5. 请求代码审查
6. 解决审查中提出的问题
7. 合并到目标分支

### 2.4 代码审查标准

- 代码是否符合项目规范
- 是否有重复代码
- 是否存在性能问题
- 是否有充分的测试覆盖
- 是否有适当的错误处理
- API设计是否合理
- 文档是否完整

## 3. 测试规范

### 3.1 单元测试

- 使用 Jest 进行单元测试
- 为所有非平凡的函数编写单元测试
- 测试应关注函数的行为而非实现细节
- 使用模拟 (mocks) 隔离外部依赖
- 测试文件与源文件放在同一目录或专门的tests目录
- 命名约定: `xxx.test.ts` 或 `xxx.spec.ts`

### 3.2 组件测试

- 使用 React Testing Library 测试组件
- 关注用户行为而非实现细节
- 测试组件的关键功能和交互
- 避免测试库内部实现
- 使用 Storybook 进行视觉测试

### 3.3 集成测试

- 测试模块间的交互
- 测试数据流
- 测试典型用户流程
- 模拟外部依赖

### 3.4 E2E测试

- 使用 Playwright 进行端到端测试
- 覆盖关键用户流程
- 测试不同浏览器的兼容性
- 自动化测试部署

### 3.5 测试覆盖率目标

- 单元测试覆盖率: 80%以上
- 组件测试覆盖率: 70%以上
- 集成测试: 覆盖所有关键流程
- 核心业务逻辑必须有测试覆盖

## 4. 文档规范

### 4.1 代码注释

- 使用 JSDoc 风格的注释
- 为所有公共 API 提供文档注释
- 复杂逻辑应有注释说明
- 避免过时或多余的注释
- 示例格式:
  ```typescript
  /**
   * 计算任务完成进度
   * @param task - 任务对象
   * @param currentDate - 当前日期，默认为今天
   * @returns 任务完成百分比 (0-100)
   */
  function calculateTaskProgress(task: Task, currentDate: Date = new Date()): number {
    // 实现...
  }
  ```

### 4.2 README规范

- 每个主要目录和模块应有README
- README应包含:
  - 模块功能概述
  - 安装和使用说明
  - 主要API或组件说明
  - 示例代码
  - 相关文档链接

### 4.3 API文档

- 使用 OpenAPI/Swagger 记录 API
- 文档应包含:
  - 端点描述
  - 请求参数
  - 响应格式
  - 错误处理
  - 示例请求和响应

### 4.4 架构文档

- 系统架构图
- 模块依赖关系
- 数据流图
- 关键决策记录
- 技术选型理由

## 5. 性能规范

### 5.1 前端性能

- 使用延迟加载和代码分割
- 优化图片和资源
- 减少和优化网络请求
- 避免不必要的重渲染
- 使用性能监控工具

### 5.2 3D渲染性能

- 使用 LOD (Level of Detail) 系统
- 实现实例化渲染
- 优化模型和纹理
- 使用对象池管理频繁创建/销毁的对象
- 实现视锥体剔除
- 限制场景复杂度

### 5.3 后端性能

- 优化数据库查询
- 实现适当的缓存策略
- 使用异步处理长时间运行的任务
- 限制请求大小和频率
- 监控服务性能指标

## 6. 安全规范

### 6.1 数据安全

- 敏感数据加密存储
- 使用环境变量存储密钥和凭据
- 实现数据备份和恢复机制
- 定期清理不需要的敏感数据

### 6.2 API安全

- 输入验证和清理
- 防止SQL注入
- 防止XSS攻击
- 实现适当的授权和认证
- 限制API请求速率

### 6.3 依赖安全

- 定期更新依赖
- 使用安全扫描工具检查漏洞
- 维护软件依赖清单
- 避免使用有已知漏洞的依赖

## 7. 发布流程

### 7.1 版本管理

- 使用语义化版本 (SemVer)
  - 主版本号: 不兼容的API变更
  - 次版本号: 向后兼容的功能新增
  - 修订号: 向后兼容的问题修复
- 为每个发布版本创建标签
- 维护CHANGELOG记录变更

### 7.2 发布检查清单

- 所有测试通过
- 代码审查完成
- 文档更新
- 版本号更新
- CHANGELOG更新
- 性能测试通过
- 安全扫描通过

### 7.3 发布流程

1. 从develop分支创建release分支
2. 在release分支上进行最终测试和修复
3. 更新版本号和CHANGELOG
4. 合并到master/main分支
5. 创建版本标签
6. 构建发布版本
7. 发布到相应平台
8. 合并回develop分支

## 8. 开发环境设置

### 8.1 开发工具

- **编辑器**: Visual Studio Code
- **版本控制**: Git
- **包管理**: pnpm
- **构建工具**: Vite
- **API测试**: Postman 或 Insomnia

### 8.2 VSCode推荐扩展

- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- GitLens
- Jest Runner
- Thunder Client (API测试)
- WebGL Shader Editor (3D开发)

### 8.3 开发环境设置

```bash
# 克隆仓库
git clone https://github.com/yourusername/taskforest.git
cd taskforest

# 安装依赖
pnpm install

# 设置环境变量
cp .env.example .env
# 编辑 .env 文件设置必要的环境变量

# 启动开发服务器
pnpm dev
```

## 9. 项目管理

### 9.1 任务管理

- 使用GitHub Issues或项目管理工具跟踪任务
- 每个任务应包含:
  - 明确的标题和描述
  - 接受标准
  - 优先级标记
  - 工作量估计
  - 截止日期(如适用)

### 9.2 Sprint/迭代计划

- 迭代周期为2周
- 每个迭代开始前进行计划会议
- 每个迭代结束进行回顾会议
- 每日简短站会更新进度和阻碍

### 9.3 项目里程碑

- 明确定义关键里程碑
- 设置明确的验收标准
- 跟踪里程碑进度
- 定期评估项目状态

## 10. 沟通协作

### 10.1 团队沟通

- 使用Slack或Teams进行日常沟通
- 使用Zoom或Meet进行视频会议
- 文档存储在GitHub或共享云盘
- 重要决策记录在文档中

### 10.2 跨团队协作

- 明确定义团队间的接口和责任
- 建立跨团队沟通渠道
- 共享关键文档和规范
- 定期进行跨团队同步

### 10.3 报告问题

- 使用GitHub Issues报告Bug
- Bug报告应包含:
  - 问题描述
  - 复现步骤
  - 预期行为
  - 实际行为
  - 环境信息
  - 相关截图或录屏

## 11. API交互及错误处理规范

### 11.1 状态码处理

- 前端拦截器必须同时接受多种成功状态码（如200、201）：
  ```typescript
  // ✅ 推荐：兼容多种成功状态码
  if (apiResponse.code !== 200 && apiResponse.code !== 201) {
    return Promise.reject(new Error(apiResponse.message));
  }
  
  // ❌ 避免：仅检查单一状态码
  if (apiResponse.code !== 200) {
    return Promise.reject(new Error(apiResponse.message));
  }
  ```

### 11.2 响应数据解析

- 总是验证响应数据结构的完整性：
  ```typescript
  // ✅ 推荐：验证完整响应路径
  if (response && response.data && response.data.code === 200) {
    setTasks(response.data.data.tasks);
  } else {
    throw new Error('获取任务列表失败');
  }
  ```

- 使用可选链操作符处理嵌套数据：
  ```typescript
  const tasks = response?.data?.data?.tasks || [];
  ```

### 11.3 错误处理最佳实践

#### 11.3.1 日志记录

- 在API拦截器中记录详细日志：
  ```typescript
  // 记录HTTP状态和业务状态码
  console.log(`API响应: [${status}]`, data);
  console.log(`API业务状态码: ${apiResponse.code}, 消息: ${apiResponse.message}`);
  ```

- 错误信息应包含足够上下文：
  ```typescript
  console.error('创建任务失败:', error);
  console.error(`业务错误: [${apiResponse.code}] ${apiResponse.message}`);
  ```

#### 11.3.2 统一错误处理

- 捕获异常时提供用户友好的提示：
  ```typescript
  try {
    // 操作代码
  } catch (error: any) {
    console.error('操作失败:', error);
    const errorMessage = error.response?.data?.message || error.message || '操作失败，请重试';
    message.error(errorMessage);
  } finally {
    setLoading(false);
  }
  ```

#### 11.3.3 前端防御性编程

- 调用API前进行预检：
  ```typescript
  // 确保必要参数存在
  if (!taskId) {
    console.error('任务ID未提供');
    message.error('无法完成操作：任务ID未提供');
    return;
  }
  
  // 防范无效输入
  const validatedData = validateTaskData(taskData);
  if (!validatedData) {
    message.error('任务数据无效');
    return;
  }
  ```

### 11.4 API调试方法

#### 11.4.1 接口测试

- 使用curl命令行验证接口:
  ```bash
  # 带参数的GET请求
  curl -s 'http://localhost:9000/api/tasks?page=1&limit=10'
  
  # POST请求
  curl -s -X POST -H "Content-Type: application/json" \
    -d '{"title":"测试任务","description":"测试"}' \
    http://localhost:9000/api/tasks
  
  # PATCH请求
  curl -s -X PATCH http://localhost:9000/api/tasks/1001/complete
  ```

#### 11.4.2 问题定位流程

1. 先检查网络请求（查看Network面板或日志）
2. 验证请求参数是否符合API期望
3. 检查响应数据格式是否与前端解析逻辑一致
4. 检查API拦截器的错误处理逻辑
5. 对比API文档与实际实现的差异

### 11.5 前后端一致性维护

#### 11.5.1 API文档同步

- 修改后端API时，立即更新API文档
- 前端实现应严格遵循API文档规范
- 发现不一致时，应及时沟通并修正

#### 11.5.2 接口变更处理

- 版本化API端点，避免破坏性变更
- 使用特性标志控制新旧接口切换
- 保持向后兼容性，渐进式弃用旧接口

### 11.6 典型问题排查清单

- [ ] 检查API响应状态码是否为预期（201 vs 200）
- [ ] 确认响应数据结构与前端解析逻辑匹配
- [ ] 验证请求参数格式（尤其是日期和枚举值）
- [ ] 检查API拦截器是否正确处理成功/失败情况
- [ ] 确认错误处理逻辑完整且用户友好
- [ ] 验证HTTP方法是否正确（GET, POST, PATCH, PUT, DELETE）

### 11.7 实际案例总结

在TaskForest项目中，我们遇到了以下典型问题及其解决方案：

1. **不同状态码处理**：API创建任务返回201，但拦截器只接受200，导致明明成功但前端报错
   - **解决**：修改API拦截器同时接受200和201

2. **请求方法不匹配**：API完成任务使用PATCH，但前端发送POST请求
   - **解决**：根据API文档修正前端请求方法

3. **响应数据路径解析错误**：前端直接使用`response.tasks`而非`response.data.data.tasks`
   - **解决**：根据实际响应结构调整数据访问路径

4. **错误处理不完善**：缺少对API响应的验证逻辑
   - **解决**：添加完整的响应验证和错误处理

记住，大多数API交互问题可以通过详细日志、对照API文档和实际HTTP交互内容来快速定位和解决。

## 总结

遵循本文档中的规范和最佳实践，将帮助团队创建高质量、可维护的代码库，提高开发效率，减少技术债务，确保TaskForest项目的长期成功。

每位团队成员都应熟悉这些规范，并在日常开发中应用。规范可能会随着项目的发展而调整，团队成员应关注文档更新。 