// 简易Express服务器 - 测试用途
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 9000;

// 启用CORS和JSON解析
app.use(cors());
app.use(express.json());

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

// 启动服务器
app.listen(PORT, () => {
  console.log(`=== TaskForest API服务已启动 ===`);
  console.log(`服务运行在: http://localhost:${PORT}`);
  console.log(`API基础路径: http://localhost:${PORT}/api`);
  console.log(`健康检查: http://localhost:${PORT}/api/health`);
  console.log(`=================================`);
}); 