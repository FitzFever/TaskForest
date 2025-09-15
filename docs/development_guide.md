## 批量任务和任务树开发指南

### 概述

批量任务和任务树功能用于支持一次性创建多个相关任务，并将它们组织成树状结构。这个功能对任务拆解和项目管理非常有用。

### 核心组件

1. **批量任务控制器** (`batchTaskController.js`)
   - 处理批量任务创建请求
   - 验证请求数据
   - 调用服务层创建任务和任务树
   - 返回创建结果

2. **批量任务服务** (`batchTaskService.js`)
   - 批量创建任务
   - 分析任务关系
   - 创建任务树结构
   - 处理事务和错误恢复

3. **任务树服务** (`taskTreeService.js`)
   - 创建和维护任务树
   - 处理树节点关系
   - 支持树的查询和更新

### 前后端数据一致性

确保前后端在批量任务和任务树的数据结构上保持一致：

1. **任务结构**：
   ```typescript
   interface Task {
     id?: string;
     title: string;
     description?: string;
     status?: '未开始' | '进行中' | '已完成' | '已取消';
     priority?: '低' | '中' | '高';
     dueDate?: string;
     assignee?: string;
   }
   ```

2. **批量创建请求结构**：
   ```typescript
   interface BatchTaskCreationRequest {
     tasks: Array<{
       title: string;
       description?: string;
       status?: string;
       priority?: string;
       subTasks?: Task[];
     }> | Array<{
       mainTask: Task;
       subTasks: Task[];
     }>;
     createTrees?: boolean;
   }
   ```

3. **任务树结构**：
   ```typescript
   interface TaskTree {
     id?: string;
     name: string;
     rootTaskId: string;
     description?: string;
     nodes: TaskTreeNode[];
   }
   
   interface TaskTreeNode {
     id?: string;
     taskId: string;
     parentNodeId?: string;
     treeId: string;
     level: number;
   }
   ```

### 开发注意事项

1. **事务处理**：
   - 批量创建任务和任务树应在一个事务中完成
   - 如果任务或树创建失败，应回滚整个事务

2. **验证**：
   - 验证所有任务的必填字段（如标题）
   - 验证任务关系的合理性（避免循环引用）

3. **性能考虑**：
   - 对于大量任务的批量创建，考虑分批处理
   - 优化任务树的创建算法，减少数据库操作次数

4. **API兼容性**：
   - 批量创建API应支持多种格式的请求（如示例中的两种格式）
   - 为了向后兼容，新增参数应设置默认值

5. **错误处理**：
   - 提供详细的错误信息，指明具体哪个任务创建失败
   - 记录详细日志，便于问题排查

### 前端实现建议

1. **表单设计**：
   - 设计直观的表单界面，允许用户添加主任务和子任务
   - 提供层级显示，清晰展示任务之间的关系

2. **数据验证**：
   - 在前端进行基础数据验证，减轻后端压力
   - 包括必填字段检查、字段长度限制等

3. **用户体验**：
   - 实现拖拽功能，便于用户调整任务顺序和层级
   - 提供预览功能，让用户在提交前查看任务树结构

4. **错误处理**：
   - 友好展示后端返回的错误信息
   - 提供重试机制，允许用户修复问题后重新提交

### 测试策略

1. **单元测试**：
   - 测试各控制器和服务的单独功能
   - 模拟各种输入场景，包括边界情况

2. **集成测试**：
   - 测试批量任务创建的完整流程
   - 验证任务和任务树的正确创建

3. **边界测试**：
   - 测试空任务列表
   - 测试大量任务的批量创建
   - 测试各种任务关系（如多层嵌套）

4. **用户接受测试**：
   - 验证整个功能从前端到后端的完整流程
   - 确保用户界面友好且功能正确 