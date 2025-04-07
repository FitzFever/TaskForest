# TaskForest 应用测试计划

## 测试策略

TaskForest 应用的测试策略分为以下几个部分：

1. **单元测试**：测试各个组件和服务的独立功能
2. **集成测试**：测试组件和服务之间的交互
3. **E2E测试**：模拟用户实际操作流程（未实现）

## 测试范围

### 已实现的测试

- **单元测试**
  - TreeService: 测试创建、获取、更新和删除树的功能
  - TaskService: 测试创建、获取、更新、完成和删除任务的功能

- **集成测试**
  - 任务与树的交互测试: 测试创建任务时创建树，完成任务时树木生长等交互功能

### 待实现的测试

- **组件测试**
  - ForestScene 组件: 测试3D渲染和交互
  - TaskList 组件: 测试任务列表的显示和交互
  - TreeModel 组件: 测试树模型的显示和生长状态

- **E2E测试**
  - 完整的用户操作流程测试

## 运行测试

### 全部测试

```bash
npm run test:all
```

### 单元测试

```bash
npm run test -- --testPathPattern=unit
```

### 集成测试

```bash
npm run test -- --testPathPattern=integration
```

### 覆盖率报告

```bash
npm run test:coverage
```

## 测试架构

### 依赖库

- Jest: 测试框架
- ts-jest: TypeScript 支持
- jest-environment-jsdom: DOM 环境支持

### 测试目录结构

```
tests/
├── unit/              # 单元测试
│   ├── TreeService.test.ts
│   └── TaskService.test.ts
├── integration/       # 集成测试
│   └── TaskTreeIntegration.test.ts
├── setup.js           # 全局测试设置
└── run-tests.js       # 测试运行脚本
```

### 测试约定

1. 单元测试文件命名: `<组件或服务名>.test.ts`
2. 集成测试文件命名: `<集成场景>.test.ts`
3. 使用 mock 隔离外部依赖
4. 每个测试文件都应该包含多个测试用例，覆盖正常和异常情况

## 持续集成

目前尚未配置 CI/CD 流程，但可以通过以下步骤手动执行测试：

1. 开发新功能或修复 bug
2. 添加/更新相关测试
3. 运行 `npm run test:all` 确保所有测试通过
4. 提交代码 