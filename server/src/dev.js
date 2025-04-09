/**
 * TaskForest开发环境服务器
 * 用于提供前端所需的后端API
 */
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 9000;

// 启用CORS和JSON解析
app.use(cors({
  origin: '*', // 允许所有来源
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// 添加请求日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('请求头:', req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('请求体:', JSON.stringify(req.body, null, 2));
  }
  
  // 记录响应
  const originalSend = res.send;
  res.send = function(body) {
    console.log(`${new Date().toISOString()} - 响应状态: ${res.statusCode}`);
    console.log('响应体:', body);
    return originalSend.call(this, body);
  };
  
  next();
});

console.log('=== TaskForest 开发环境服务器 ===');
console.log('正在启动...');

// 存储任务的数组
let tasks = [
  {
    id: '1001',
    title: '完成项目报告',
    description: '完成季度项目进度报告并提交给项目经理',
    type: 'WORK',
    status: 'TODO',
    priority: 3,
    dueDate: '2023-05-20T00:00:00.000Z',
    createdAt: '2023-05-10T09:00:00.000Z',
    updatedAt: '2023-05-10T09:00:00.000Z',
    tags: ['报告', '项目'],
    treeType: 'OAK',
    growthStage: 1
  },
  {
    id: '1002',
    title: '安排团队会议',
    description: '为下周的项目启动安排团队会议',
    type: 'WORK',
    status: 'IN_PROGRESS',
    priority: 2,
    dueDate: '2023-05-15T00:00:00.000Z',
    createdAt: '2023-05-09T14:30:00.000Z',
    updatedAt: '2023-05-11T10:15:00.000Z',
    tags: ['会议', '团队'],
    treeType: 'PINE',
    growthStage: 2
  }
];

// 存储树木的数组
let trees = [
  {
    id: 'tree-1001',
    taskId: '1001',
    type: 'OAK',
    stage: 1,
    position: {
      x: 5.0,
      y: 0.0,
      z: 3.0
    },
    rotation: {
      x: 0.0,
      y: 0.5,
      z: 0.0
    },
    scale: {
      x: 1.0,
      y: 1.0,
      z: 1.0
    },
    createdAt: '2023-05-10T09:00:00.000Z',
    lastGrowth: '2023-05-12T10:00:00.000Z',
    healthState: 90
  },
  {
    id: 'tree-1002',
    taskId: '1002',
    type: 'PINE',
    stage: 2,
    position: {
      x: -3.0,
      y: 0.0,
      z: 7.0
    },
    rotation: {
      x: 0.0,
      y: 1.2,
      z: 0.0
    },
    scale: {
      x: 1.0,
      y: 1.0,
      z: 1.0
    },
    createdAt: '2023-05-09T14:30:00.000Z',
    lastGrowth: '2023-05-14T08:00:00.000Z',
    healthState: 85
  }
];

// 健康检查接口
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'TaskForest API服务正常运行'
  });
});

// 获取所有任务
app.get('/api/tasks', (req, res) => {
  res.json({
    code: 200,
    data: {
      tasks,
      pagination: {
        total: tasks.length,
        page: 1,
        limit: tasks.length,
        pages: 1
      }
    },
    message: 'Success',
    timestamp: Date.now()
  });
});

// 获取单个任务
app.get('/api/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === req.params.id);
  if (!task) {
    return res.status(404).json({
      code: 404,
      data: null,
      error: { message: 'Task not found' },
      message: 'Not Found',
      timestamp: Date.now()
    });
  }
  res.json({
    code: 200,
    data: task,
    message: 'Success',
    timestamp: Date.now()
  });
});

// 创建任务
app.post('/api/tasks', (req, res) => {
  console.log('收到创建任务请求:', req.body);
  const newTask = {
    id: `${Date.now()}`,
    ...req.body,
    status: 'TODO',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: req.body.tags || [],
    growthStage: 0
  };
  tasks.push(newTask);
  console.log('新任务已创建:', newTask);
  res.status(201).json({
    code: 201,
    data: newTask,
    message: 'Task created successfully',
    timestamp: Date.now()
  });
});

// 更新任务
app.put('/api/tasks/:id', (req, res) => {
  console.log(`收到更新任务请求: ID=${req.params.id}`, req.body);
  const index = tasks.findIndex(t => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({
      code: 404,
      data: null,
      error: { message: 'Task not found' },
      message: 'Not Found',
      timestamp: Date.now()
    });
  }
  
  const updatedTask = {
    ...tasks[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  tasks[index] = updatedTask;
  console.log('任务已更新:', updatedTask);
  
  res.json({
    code: 200,
    data: updatedTask,
    message: 'Task updated successfully',
    timestamp: Date.now()
  });
});

// 更新任务状态
app.put('/api/tasks/:id/status', (req, res) => {
  console.log(`收到更新任务状态请求: ID=${req.params.id}`, req.body);
  const index = tasks.findIndex(t => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({
      code: 404,
      data: null,
      error: { message: 'Task not found' },
      message: 'Not Found',
      timestamp: Date.now()
    });
  }
  
  // 验证状态值
  const validStatuses = ['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
  if (!validStatuses.includes(req.body.status)) {
    return res.status(400).json({
      code: 400,
      data: null,
      error: { 
        message: 'Invalid status value',
        details: { 
          field: 'status',
          reason: 'invalid value'
        }
      },
      message: 'Bad Request',
      timestamp: Date.now()
    });
  }
  
  // 更新状态
  const now = new Date().toISOString();
  tasks[index] = {
    ...tasks[index],
    status: req.body.status,
    updatedAt: now
  };
  
  // 如果状态更改为已完成，设置完成时间
  if (req.body.status === 'COMPLETED' && !tasks[index].completedAt) {
    tasks[index].completedAt = now;
  }
  
  console.log('任务状态已更新:', tasks[index]);
  
  res.json({
    code: 200,
    data: {
      id: tasks[index].id,
      status: tasks[index].status,
      updatedAt: tasks[index].updatedAt
    },
    message: 'Task status updated successfully',
    timestamp: Date.now()
  });
});

// 完成任务
app.patch('/api/tasks/:id/complete', (req, res) => {
  console.log(`收到完成任务请求: ID=${req.params.id}`);
  const index = tasks.findIndex(t => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({
      code: 404,
      data: null,
      error: { message: 'Task not found' },
      message: 'Not Found',
      timestamp: Date.now()
    });
  }
  
  const completedTask = {
    ...tasks[index],
    status: 'COMPLETED',
    completedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    growthStage: 4
  };
  
  tasks[index] = completedTask;
  console.log('任务已完成:', completedTask);
  
  res.json({
    code: 200,
    data: completedTask,
    message: 'Task completed successfully',
    timestamp: Date.now()
  });
});

// 删除任务
app.delete('/api/tasks/:id', (req, res) => {
  console.log(`收到删除任务请求: ID=${req.params.id}`);
  const index = tasks.findIndex(t => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({
      code: 404,
      data: null,
      error: { message: 'Task not found' },
      message: 'Not Found',
      timestamp: Date.now()
    });
  }
  
  const deletedTask = tasks[index];
  tasks.splice(index, 1);
  console.log('任务已删除:', deletedTask);
  
  res.json({
    code: 200,
    data: null,
    message: 'Task deleted successfully',
    timestamp: Date.now()
  });
});

// 获取树木列表
app.get('/api/trees', (req, res) => {
  res.json({
    code: 200,
    data: {
      trees,
      pagination: {
        total: trees.length,
        page: 1,
        limit: trees.length,
        pages: 1
      }
    },
    message: 'Success',
    timestamp: Date.now()
  });
});

// 获取单个树木
app.get('/api/trees/:id', (req, res) => {
  const tree = trees.find(t => t.id === req.params.id);
  if (!tree) {
    return res.status(404).json({
      code: 404,
      data: null,
      error: { message: 'Tree not found' },
      message: 'Not Found',
      timestamp: Date.now()
    });
  }
  
  // 查找关联的任务
  const relatedTask = tasks.find(t => t.id === tree.taskId);
  
  res.json({
    code: 200,
    data: {
      ...tree,
      task: relatedTask ? {
        id: relatedTask.id,
        title: relatedTask.title,
        description: relatedTask.description,
        status: relatedTask.status,
        dueDate: relatedTask.dueDate
      } : null
    },
    message: 'Success',
    timestamp: Date.now()
  });
});

// 获取任务关联的树木
app.get('/api/trees/by-task/:taskId', (req, res) => {
  const tree = trees.find(t => t.taskId === req.params.taskId);
  if (!tree) {
    return res.status(404).json({
      code: 404,
      data: null,
      error: { message: 'Tree not found for task' },
      message: 'Not Found',
      timestamp: Date.now()
    });
  }
  
  res.json({
    code: 200,
    data: tree,
    message: 'Success',
    timestamp: Date.now()
  });
});

// 更新树木
app.put('/api/trees/:id', (req, res) => {
  const index = trees.findIndex(t => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({
      code: 404,
      data: null,
      error: { message: 'Tree not found' },
      message: 'Not Found',
      timestamp: Date.now()
    });
  }
  
  const updatedTree = {
    ...trees[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  trees[index] = updatedTree;
  
  res.json({
    code: 200,
    data: updatedTree,
    message: 'Tree updated successfully',
    timestamp: Date.now()
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log('✅ 服务已启动');
  console.log(`🔗 服务地址: http://localhost:${PORT}`);
  console.log(`🔗 API基础路径: http://localhost:${PORT}/api`);
  console.log(`🔗 健康检查: http://localhost:${PORT}/api/health`);
  console.log('\n开发环境准备就绪. 按 Ctrl+C 停止服务.\n');
}); 