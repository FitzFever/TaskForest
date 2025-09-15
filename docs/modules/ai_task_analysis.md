# AI任务分析系统设计文档

## 1. 系统概述

AI任务分析系统是TaskForest的核心智能功能，通过与AI大模型的集成，实现对复杂任务的智能拆解、分析和建议生成，帮助用户更科学地规划和执行任务。本文档详细介绍AI任务分析系统的设计理念、架构和实现细节。

## 2. 设计目标

- **智能化**：利用AI能力实现任务的智能拆解和分析
- **效率提升**：通过任务拆解帮助用户明确工作步骤
- **系统集成**：与现有任务和树木系统无缝集成
- **用户体验**：提供友好、直观的交互界面
- **性能优化**：确保AI调用高效，不影响应用响应速度
- **扩展性**：支持未来更多AI功能的扩展

## 3. 系统架构

### 3.1 核心组件

1. **前端交互层**
   - 任务分析请求表单
   - 拆解结果展示组件
   - 任务树可视化组件

2. **API服务层**
   - 分析任务API
   - 任务拆解API
   - 批量任务创建API

3. **AI集成层**
   - AI服务封装
   - 提示工程模块
   - 结果解析器

4. **数据管理层**
   - 主任务与子任务关系管理
   - 任务树与树木关联管理
   - 分析历史记录管理

### 3.2 数据流

1. **分析请求流程**：
   用户输入 → 前端表单 → API服务 → AI服务 → 结果解析 → 前端展示

2. **任务创建流程**：
   拆解结果 → 确认创建 → 批量API → 数据库存储 → 树木生成 → 前端更新

3. **状态同步流程**：
   子任务更新 → 状态汇总 → 主任务状态更新 → 主树状态更新

## 4. 核心功能实现

### 4.1 任务分析服务

```typescript
interface TaskAnalysis {
  complexity: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  estimatedHours: number;
  suggestedDeadline: string;
  recommendedTags: string[];
  keyPoints: string[];
}

class TaskAnalysisService {
  // AI模型服务
  private aiService: AIModelService;
  
  // 分析任务
  async analyzeTask(taskInfo: TaskInfo): Promise<TaskAnalysis> {
    // 1. 准备提示模板
    const prompt = this.prepareAnalysisPrompt(taskInfo);
    
    // 2. 调用AI服务
    const response = await this.aiService.generateCompletion(prompt);
    
    // 3. 解析AI响应
    const analysis = this.parseAnalysisResponse(response);
    
    // 4. 验证和格式化结果
    return this.validateAndFormatAnalysis(analysis);
  }
  
  // 准备分析提示
  private prepareAnalysisPrompt(taskInfo: TaskInfo): string {
    // 实现提示模板生成
  }
  
  // 解析AI响应
  private parseAnalysisResponse(response: string): any {
    // 实现响应解析
  }
  
  // 验证和格式化分析结果
  private validateAndFormatAnalysis(rawAnalysis: any): TaskAnalysis {
    // 实现验证和格式化
  }
}
```

### 4.2 任务拆解服务

```typescript
interface SubTask {
  title: string;
  description: string;
  type: TaskType;
  priority: number;
  dueDate: string;
  estimatedHours: number;
  suggestedTags: string[];
}

interface TaskBreakdown {
  mainTask: MainTask;
  subTasks: SubTask[];
}

class TaskBreakdownService {
  // AI模型服务
  private aiService: AIModelService;
  
  // 拆解任务
  async breakdownTask(taskInfo: TaskInfo): Promise<TaskBreakdown> {
    // 1. 准备提示模板
    const prompt = this.prepareBreakdownPrompt(taskInfo);
    
    // 2. 调用AI服务
    const response = await this.aiService.generateCompletion(prompt);
    
    // 3. 解析AI响应
    const breakdown = this.parseBreakdownResponse(response);
    
    // 4. 验证和优化拆解结果
    return this.validateAndOptimizeBreakdown(breakdown, taskInfo);
  }
  
  // 准备拆解提示
  private prepareBreakdownPrompt(taskInfo: TaskInfo): string {
    // 实现提示模板生成
  }
  
  // 解析AI响应
  private parseBreakdownResponse(response: string): any {
    // 实现响应解析
  }
  
  // 验证和优化拆解结果
  private validateAndOptimizeBreakdown(rawBreakdown: any, originalTask: TaskInfo): TaskBreakdown {
    // 实现验证和优化
  }
  
  // 分配子任务截止日期
  private assignSubTaskDueDates(subTasks: SubTask[], mainTaskDueDate: string): SubTask[] {
    // 实现截止日期分配算法
  }
}
```

### 4.3 批量任务创建服务

```typescript
interface BatchTaskCreationResult {
  mainTask: Task;
  subTasks: Task[];
  trees: {
    mainTree: Tree;
    subTrees: Tree[];
  };
}

class BatchTaskCreationService {
  // 任务服务
  private taskService: TaskService;
  // 树木服务
  private treeService: TreeService;
  
  // 批量创建任务和树木
  async createBatchTasks(breakdown: TaskBreakdown, createTrees: boolean = true): Promise<BatchTaskCreationResult> {
    // 1. 开始数据库事务
    return await this.db.transaction(async (trx) => {
      // 2. 创建主任务
      const mainTask = await this.taskService.createTask(breakdown.mainTask, trx);
      
      // 3. 创建子任务并关联到主任务
      const subTasks = await Promise.all(
        breakdown.subTasks.map(subTask => 
          this.taskService.createTask({
            ...subTask,
            parentTaskId: mainTask.id
          }, trx)
        )
      );
      
      // 4. 如果需要，创建树木
      let mainTree, subTrees;
      if (createTrees) {
        // 创建主树
        mainTree = await this.treeService.createTree({
          taskId: mainTask.id,
          type: this.mapTaskTypeToTreeType(mainTask.type)
        }, trx);
        
        // 创建子树并关联到主树
        subTrees = await Promise.all(
          subTasks.map(subTask => 
            this.treeService.createTree({
              taskId: subTask.id,
              type: this.mapTaskTypeToTreeType(subTask.type),
              parentTreeId: mainTree.id
            }, trx)
          )
        );
      }
      
      // 5. 返回创建结果
      return {
        mainTask,
        subTasks,
        trees: createTrees ? { mainTree, subTrees } : undefined
      };
    });
  }
  
  // 映射任务类型到树木类型
  private mapTaskTypeToTreeType(taskType: TaskType): TreeType {
    // 实现类型映射逻辑
  }
}
```

### 4.4 AI服务封装

```typescript
class AIModelService {
  // AI配置
  private config: AIServiceConfig;
  
  // 生成AI回答
  async generateCompletion(prompt: string, options: CompletionOptions = {}): Promise<string> {
    try {
      // 1. 准备请求参数
      const requestParams = this.prepareRequestParams(prompt, options);
      
      // 2. 发送API请求
      const response = await this.sendRequest(requestParams);
      
      // 3. 处理API响应
      return this.processResponse(response);
    } catch (error) {
      // 4. 错误处理
      this.handleError(error);
      throw error;
    }
  }
  
  // 准备请求参数
  private prepareRequestParams(prompt: string, options: CompletionOptions): any {
    // 实现请求参数准备
  }
  
  // 发送请求
  private async sendRequest(params: any): Promise<any> {
    // 实现请求发送逻辑
  }
  
  // 处理响应
  private processResponse(response: any): string {
    // 实现响应处理
  }
  
  // 错误处理
  private handleError(error: any): void {
    // 实现错误处理
  }
}
```

## 5. 前端实现

### 5.1 任务拆解表单

```tsx
const TaskBreakdownForm: React.FC = () => {
  const [taskInfo, setTaskInfo] = useState<TaskInfo>({
    description: '',
    dueDate: '',
    type: 'PROJECT',
    priority: 1
  });
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<TaskAnalysis | null>(null);
  
  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // 调用分析API
      const result = await apiService.analyzeTask(taskInfo);
      setAnalysis(result);
    } catch (error) {
      // 错误处理
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* 表单字段 */}
      <div className="task-form-field">
        <label>任务描述</label>
        <textarea 
          value={taskInfo.description}
          onChange={e => setTaskInfo({...taskInfo, description: e.target.value})}
          required
        />
      </div>
      
      {/* 其他表单字段 */}
      
      <button type="submit" disabled={isLoading}>
        {isLoading ? '分析中...' : '分析任务'}
      </button>
      
      {/* 分析结果展示 */}
      {analysis && (
        <div className="analysis-result">
          {/* 显示分析结果 */}
        </div>
      )}
    </form>
  );
};
```

### 5.2 拆解结果展示

```tsx
interface TaskBreakdownResultProps {
  breakdown: TaskBreakdown;
  onCreateTasks: () => void;
  onModifyBreakdown: (breakdown: TaskBreakdown) => void;
}

const TaskBreakdownResult: React.FC<TaskBreakdownResultProps> = ({ 
  breakdown, 
  onCreateTasks,
  onModifyBreakdown
}) => {
  const [editMode, setEditMode] = useState(false);
  const [currentBreakdown, setCurrentBreakdown] = useState(breakdown);
  
  // 处理子任务更新
  const handleSubTaskUpdate = (index: number, updatedSubTask: SubTask) => {
    const newSubTasks = [...currentBreakdown.subTasks];
    newSubTasks[index] = updatedSubTask;
    
    setCurrentBreakdown({
      ...currentBreakdown,
      subTasks: newSubTasks
    });
  };
  
  // 保存修改
  const saveChanges = () => {
    onModifyBreakdown(currentBreakdown);
    setEditMode(false);
  };
  
  return (
    <div className="breakdown-result">
      <div className="main-task-section">
        <h3>主任务</h3>
        <div className="task-card">
          <h4>{currentBreakdown.mainTask.title}</h4>
          <p>{currentBreakdown.mainTask.description}</p>
          {/* 其他主任务信息 */}
        </div>
      </div>
      
      <div className="sub-tasks-section">
        <h3>子任务列表</h3>
        {currentBreakdown.subTasks.map((subTask, index) => (
          <div key={index} className="sub-task-card">
            {editMode ? (
              <SubTaskEditForm 
                subTask={subTask}
                onChange={(updatedSubTask) => handleSubTaskUpdate(index, updatedSubTask)}
              />
            ) : (
              <>
                <h4>{subTask.title}</h4>
                <p>{subTask.description}</p>
                {/* 其他子任务信息 */}
              </>
            )}
          </div>
        ))}
      </div>
      
      <div className="action-buttons">
        {editMode ? (
          <>
            <button onClick={saveChanges}>保存修改</button>
            <button onClick={() => setEditMode(false)}>取消</button>
          </>
        ) : (
          <>
            <button onClick={() => setEditMode(true)}>修改拆解</button>
            <button onClick={onCreateTasks}>创建任务</button>
          </>
        )}
      </div>
    </div>
  );
};
```

### 5.3 任务树可视化

```tsx
interface TaskTreeVisualizationProps {
  mainTaskId: string;
}

const TaskTreeVisualization: React.FC<TaskTreeVisualizationProps> = ({ mainTaskId }) => {
  const [taskTree, setTaskTree] = useState<TaskTreeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // 加载任务树数据
    const loadTaskTree = async () => {
      try {
        const result = await apiService.getTaskTree(mainTaskId);
        setTaskTree(result);
      } catch (error) {
        // 错误处理
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTaskTree();
  }, [mainTaskId]);
  
  if (isLoading) {
    return <div className="loading-indicator">加载中...</div>;
  }
  
  if (!taskTree) {
    return <div className="error-message">无法加载任务树</div>;
  }
  
  return (
    <div className="task-tree-visualization">
      <div className="main-task-node">
        <div className="task-node task-node-main">
          <h4>{taskTree.mainTask.title}</h4>
          <div className="completion-status">
            完成进度: {taskTree.completionPercentage}%
          </div>
        </div>
        
        <div className="sub-tasks-container">
          {taskTree.subTasks.map(subTask => (
            <div key={subTask.id} className="task-node task-node-sub">
              <h5>{subTask.title}</h5>
              <div className={`status-badge status-${subTask.status.toLowerCase()}`}>
                {subTask.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

## 6. 集成与使用

AI任务分析系统设计为可在应用的不同部分轻松集成。以下是主要集成点：

### 6.1 任务创建流程集成

在任务创建表单中添加"AI拆解"选项：

```tsx
// 任务创建表单组件
const TaskCreateForm: React.FC = () => {
  // ...现有代码...
  
  const [useAiBreakdown, setUseAiBreakdown] = useState(false);
  
  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (useAiBreakdown) {
      // 重定向到AI任务拆解页面
      navigate('/tasks/breakdown', { state: { taskInfo } });
    } else {
      // 常规任务创建逻辑
      // ...
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* 现有表单字段 */}
      
      <div className="form-option">
        <input
          type="checkbox"
          id="useAiBreakdown"
          checked={useAiBreakdown}
          onChange={e => setUseAiBreakdown(e.target.checked)}
        />
        <label htmlFor="useAiBreakdown">使用AI拆解复杂任务</label>
      </div>
      
      <button type="submit">
        {useAiBreakdown ? '继续到AI拆解' : '创建任务'}
      </button>
    </form>
  );
};
```

### 6.2 任务详情页面集成

在任务详情页面中添加拆解现有任务的选项：

```tsx
// 任务详情组件
const TaskDetailPage: React.FC = () => {
  // ...现有代码...
  
  // 处理AI拆解请求
  const handleAiBreakdown = async () => {
    try {
      // 导航到拆解页面，传递当前任务信息
      navigate(`/tasks/breakdown/${task.id}`);
    } catch (error) {
      // 错误处理
    }
  };
  
  return (
    <div className="task-detail-page">
      {/* 现有任务详情内容 */}
      
      {/* 仅对未完成的非子任务显示此选项 */}
      {task.status !== 'COMPLETED' && !task.parentTaskId && (
        <button 
          className="ai-breakdown-button"
          onClick={handleAiBreakdown}
        >
          使用AI拆解此任务
        </button>
      )}
    </div>
  );
};
```

### 6.3 主任务和子任务关系展示

在任务列表或任务详情中显示主子任务关系：

```tsx
// 任务列表项组件
const TaskListItem: React.FC<{ task: Task }> = ({ task }) => {
  const [expanded, setExpanded] = useState(false);
  const [subTasks, setSubTasks] = useState<Task[]>([]);
  
  // 加载子任务
  const loadSubTasks = async () => {
    if (task.hasSubTasks && !subTasks.length) {
      const result = await apiService.getSubTasks(task.id);
      setSubTasks(result);
    }
    setExpanded(!expanded);
  };
  
  return (
    <div className="task-list-item">
      <div className="task-main-info">
        <div className="task-title">{task.title}</div>
        
        {/* 显示是否有子任务的标识 */}
        {task.hasSubTasks && (
          <button className="expand-button" onClick={loadSubTasks}>
            {expanded ? '收起' : '展开'} ({task.subTaskCount})
          </button>
        )}
        
        {/* 显示父任务的标识 */}
        {task.parentTaskId && (
          <span className="parent-task-badge">
            子任务
          </span>
        )}
      </div>
      
      {/* 展开时显示子任务 */}
      {expanded && subTasks.length > 0 && (
        <div className="sub-tasks-container">
          {subTasks.map(subTask => (
            <SubTaskListItem key={subTask.id} task={subTask} />
          ))}
        </div>
      )}
    </div>
  );
};
```

## 7. 提示工程设计

### 7.1 任务分析提示模板

```
您是TaskForest应用的AI助手，专门帮助用户分析和拆解任务。请基于以下任务信息进行分析：

任务描述：${taskInfo.description}
任务类型：${taskInfo.type}
截止日期：${taskInfo.dueDate || '未设置'}

请提供以下分析：
1. 任务复杂度（LOW/MEDIUM/HIGH/VERY_HIGH）
2. 预估完成所需小时数
3. 建议的截止日期（如果用户未提供）
4. 推荐的任务标签（3-5个）
5. 关键点（任务需要关注的要点，5-7条）

请以JSON格式返回，结构如下：
{
  "complexity": "MEDIUM",
  "estimatedHours": 8,
  "suggestedDeadline": "2023-08-10T00:00:00Z",
  "recommendedTags": ["标签1", "标签2", "标签3"],
  "keyPoints": ["关键点1", "关键点2", "关键点3", "关键点4", "关键点5"]
}

请确保返回的是有效的JSON格式，且所有字段都包含合理的值。
```

### 7.2 任务拆解提示模板

```
您是TaskForest应用的AI助手，专门帮助用户拆解复杂任务。请基于以下任务信息进行拆解：

任务描述：${taskInfo.description}
任务类型：${taskInfo.type}
任务优先级：${taskInfo.priority}
截止日期：${taskInfo.dueDate}

请将此任务拆解为4-6个子任务，每个子任务包含：
1. 标题（简洁明了）
2. 描述（具体任务内容）
3. 任务类型（与主任务相关的合适类型）
4. 优先级（1-4，1为最高）
5. 建议截止日期（晚于当前日期，早于主任务截止日期）
6. 预估所需小时数
7. 建议标签（2-3个）

请以JSON格式返回，结构如下：
{
  "mainTask": {
    "title": "原始任务的提炼标题",
    "description": "${taskInfo.description}",
    "type": "${taskInfo.type}",
    "priority": ${taskInfo.priority},
    "dueDate": "${taskInfo.dueDate}",
    "tags": ["建议标签1", "建议标签2"]
  },
  "subTasks": [
    {
      "title": "子任务1标题",
      "description": "子任务1详细描述",
      "type": "适合的任务类型",
      "priority": 优先级,
      "dueDate": "建议截止日期",
      "estimatedHours": 预估小时数,
      "suggestedTags": ["标签1", "标签2"]
    },
    // 更多子任务...
  ]
}

请注意：
- 子任务应该是逻辑上独立的步骤
- 子任务截止日期应该合理安排，考虑任务依赖关系
- 子任务类型应从以下选择：NORMAL, WORK, LEARNING, PROJECT, LEISURE
- 请确保返回的是有效的JSON格式

请提供详细且实用的拆解，帮助用户更有效地完成任务。
```

## 8. 安全与性能考虑

### 8.1 安全考虑

1. **输入验证**：对用户输入进行严格验证，防止注入攻击
2. **API密钥保护**：AI服务API密钥存储在环境变量中，不直接暴露
3. **速率限制**：实施AI调用速率限制，防止滥用
4. **数据保护**：确保任务数据不会被不当使用或共享

### 8.2 性能优化

1. **缓存机制**：对相似任务的分析结果进行缓存
2. **异步处理**：将AI调用设计为异步，不阻塞UI
3. **批处理**：批量处理任务创建操作，减少数据库负担
4. **请求优化**：优化AI请求参数，减少token使用量
5. **响应压缩**：压缩API响应数据，减少网络流量

## 9. 扩展计划

未来的扩展方向包括：

1. **智能任务推荐**：根据用户历史行为推荐任务
2. **任务优先级自动调整**：根据截止日期和工作量智能调整优先级
3. **智能时间估算**：根据用户历史完成情况优化时间估算
4. **个性化任务模板**：基于用户偏好创建个性化任务模板
5. **进度预测**：预测任务完成进度和可能的延期

## 10. 测试策略

为确保AI任务分析系统的可靠性，将实施以下测试策略：

1. **单元测试**：测试各个服务的核心功能
2. **集成测试**：测试系统组件之间的交互
3. **端到端测试**：模拟用户完整操作流程
4. **性能测试**：测试系统在高负载下的表现
5. **可用性测试**：收集用户反馈并优化交互体验

## 11. 参考文档

- [API接口参考](../api_reference.md#3-ai-智能助手) - AI相关API详细说明
- [开发任务清单](../development_tasks.md#ai智能助手功能) - AI功能开发任务
- [产品说明文档](../../product/TaskForest产品说明文档.md#5-ai智能助手) - AI智能助手产品定义 