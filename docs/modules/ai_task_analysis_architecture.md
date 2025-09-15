# AI任务分析系统架构图

*注意：本文档提供AI任务分析系统架构的文本描述，可用于生成实际的架构图。*

## 系统组件

1. **前端交互层**
   - `TaskBreakdownForm` - 任务拆解请求表单
   - `TaskBreakdownResult` - 拆解结果展示组件
   - `TaskTreeVisualization` - 任务树可视化组件

2. **API服务层**
   - `AIController` - 处理AI相关API请求
   - `TaskController` - 处理任务CRUD操作
   - `BatchTaskController` - 处理批量任务操作

3. **AI集成层**
   - `AIModelService` - AI大模型服务封装
   - `PromptTemplateService` - 提示工程模板管理
   - `ResponseParserService` - AI响应解析服务

4. **业务逻辑层**
   - `TaskAnalysisService` - 任务分析服务
   - `TaskBreakdownService` - 任务拆解服务
   - `BatchTaskCreationService` - 批量任务创建服务

5. **数据访问层**
   - `TaskRepository` - 任务数据访问
   - `TreeRepository` - 树木数据访问
   - `AIAnalysisRepository` - AI分析结果存储

6. **外部服务**
   - `OpenAI API` - 提供AI大模型能力
   - `TreeService` - 提供树木管理功能

## 数据流

1. **分析请求流程**
   ```
   用户 -> [提交任务描述] -> TaskBreakdownForm -> [API请求] -> AIController 
       -> TaskAnalysisService -> [调用AI] -> AIModelService -> [请求] -> OpenAI API
       -> [响应] -> ResponseParserService -> [处理结果] -> TaskAnalysisService 
       -> [返回分析] -> AIController -> [显示分析] -> 前端组件
   ```

2. **任务拆解流程**
   ```
   用户 -> [确认分析] -> TaskBreakdownForm -> [API请求] -> AIController 
       -> TaskBreakdownService -> [调用AI] -> AIModelService -> [请求] -> OpenAI API
       -> [拆解结果] -> ResponseParserService -> [处理结果] -> TaskBreakdownService 
       -> [返回拆解] -> AIController -> [显示拆解] -> TaskBreakdownResult
   ```

3. **任务创建流程**
   ```
   用户 -> [确认创建] -> TaskBreakdownResult -> [API请求] -> BatchTaskController 
       -> BatchTaskCreationService -> [创建主任务] -> TaskRepository 
       -> [创建子任务] -> TaskRepository -> [创建树木] -> TreeRepository
       -> [返回结果] -> BatchTaskController -> [更新UI] -> TaskTreeVisualization
   ```

## 组件交互

```
前端组件层
┌───────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│ TaskBreakdownForm │  │ TaskBreakdownResult  │  │ TaskTreeVisualization│
└─────────┬─────────┘  └──────────┬───────────┘  └──────────┬───────────┘
          │                       │                         │
          ▼                       ▼                         ▼
┌────────────────────────────────────────────────────────────────────────┐
│                              API服务层                                  │
├───────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│   AIController    │  │   TaskController     │  │ BatchTaskController  │
└─────────┬─────────┘  └──────────┬───────────┘  └──────────┬───────────┘
          │                       │                         │
          ▼                       ▼                         ▼
┌────────────────────────────────────────────────────────────────────────┐
│                             业务逻辑层                                  │
├───────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│TaskAnalysisService│  │ TaskBreakdownService │  │BatchTaskCreationService
└─────────┬─────────┘  └──────────┬───────────┘  └──────────┬───────────┘
          │                       │                         │
          ▼                       ▼                         ▼
┌────────────────────────────────────────────────────────────────────────┐
│                              AI集成层                                   │
├───────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│  AIModelService   │  │PromptTemplateService │  │ResponseParserService │
└─────────┬─────────┘  └──────────┬───────────┘  └──────────┬───────────┘
          │                       │                         │
          ▼                       ▼                         ▼
┌────────────────────────────────────────────────────────────────────────┐
│                             数据访问层                                  │
├───────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│  TaskRepository   │  │   TreeRepository     │  │ AIAnalysisRepository │
└─────────┬─────────┘  └──────────┬───────────┘  └──────────┬───────────┘
          │                       │                         │
          ▼                       ▼                         ▼
┌────────────────────────────────────────────────────────────────────────┐
│                              外部服务                                   │
├───────────────────┐                          ┌──────────────────────┐
│    OpenAI API     │                          │     TreeService      │
└───────────────────┘                          └──────────────────────┘
```

## 关键特性

1. **分层架构**
   - 清晰的关注点分离，便于维护和扩展
   - 模块化设计，使各组件可独立开发和测试

2. **AI隔离**
   - AI调用与业务逻辑分离
   - 提供错误恢复和回退机制
   - 支持不同AI模型的切换

3. **事务支持**
   - 批量操作的事务一致性
   - 确保主任务和子任务创建的原子性
   - 错误发生时提供回滚机制

4. **用户体验优化**
   - 异步处理减少等待时间
   - 提供交互式拆解结果编辑
   - 实时任务树可视化

5. **扩展性**
   - 支持添加新的AI功能
   - 允许扩展任务和树木的关联关系
   - 提供插件机制扩展分析能力 