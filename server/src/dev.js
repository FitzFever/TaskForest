/**
 * TaskForest开发环境服务器
 * 用于提供前端所需的后端API
 */
import express from 'express';
import cors from 'cors';

// 设置编码
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

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
  
  // 记录原始URL和查询参数
  if (req.query && Object.keys(req.query).length > 0) {
    console.log('原始查询参数:', req.originalUrl);
    // 遍历所有查询参数并单独打印
    for (const [key, value] of Object.entries(req.query)) {
      console.log(`查询参数 ${key}:`, value);
      // 对于可能包含中文的参数，打印其编码后的值
      if (typeof value === 'string') {
        console.log(`${key} 的编码值:`, Buffer.from(value).toString('hex'));
        console.log(`${key} 的解码值:`, decodeURIComponent(value));
      }
    }
  }
  
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
  try {
    console.log('接收到获取任务列表请求');
    console.log('查询参数:', req.query);
    
    // 获取查询参数
    const { 
      search, 
      status, 
      tags, 
      priority, 
      type,
      startDate, 
      endDate, 
      treeType,
      sortBy = 'dueDate', 
      sortOrder = 'asc',
      completed
    } = req.query;
    
    // 筛选任务
    let filteredTasks = [...tasks];
    
    // 按状态筛选
    if (status) {
      console.log('按状态筛选:', status);
      const statusArray = status.split(',');
      filteredTasks = filteredTasks.filter(task => statusArray.includes(task.status));
      console.log('状态筛选后任务数量:', filteredTasks.length);
    }
    
    // 按完成状态筛选
    if (completed !== undefined) {
      console.log('按完成状态筛选:', completed);
      const isCompleted = completed === 'true';
      filteredTasks = filteredTasks.filter(task => 
        isCompleted ? task.status === 'COMPLETED' : task.status !== 'COMPLETED'
      );
      console.log('完成状态筛选后任务数量:', filteredTasks.length);
    }
    
    // 按标签筛选
    if (tags) {
      console.log('按标签筛选:', tags);
      const tagArray = tags.split(',');
      console.log('标签数组:', tagArray);
      console.log('标签数组类型:', typeof tagArray, Array.isArray(tagArray));
      
      // 检查标签编码情况
      tagArray.forEach((tag, index) => {
        console.log(`标签[${index}]:`, tag);
        if (tag.startsWith('tag:')) {
          console.log(`  - 特殊搜索标签，前缀后内容:`, tag.substring(4));
        }
        // 尝试解码
        try {
          const decoded = decodeURIComponent(tag);
          console.log(`  - 解码后:`, decoded);
        } catch (e) {
          console.log(`  - 解码失败:`, e.message);
        }
      });
      
      filteredTasks = filteredTasks.filter(task => {
        if (!task.tags || task.tags.length === 0) return false;
        console.log(`检查任务[${task.id}]的标签:`, task.tags);
        
        return tagArray.some(searchTag => {
          // 支持精确匹配(tag:prefix 格式)
          if (searchTag.startsWith('tag:')) {
            const exactTag = searchTag.substring(4);
            console.log(`进行精确标签匹配: "${exactTag}" vs ${JSON.stringify(task.tags)}`);
            const result = task.tags.includes(exactTag);
            console.log(`  - 匹配结果:`, result);
            return result;
          }
          
          // 普通标签：先解码再进行匹配
          try {
            const decodedTag = decodeURIComponent(searchTag);
            console.log(`进行普通标签匹配: "${searchTag}" => 解码后: "${decodedTag}" vs ${JSON.stringify(task.tags)}`);
            const result = task.tags.includes(decodedTag);
            console.log(`  - 匹配结果:`, result);
            return result;
          } catch (e) {
            // 解码失败，回退到使用原始标签
            console.log(`标签解码失败，使用原始标签: "${searchTag}" vs ${JSON.stringify(task.tags)}`);
            const result = task.tags.includes(searchTag);
            console.log(`  - 匹配结果:`, result);
            return result;
          }
        });
      });
      
      console.log('标签筛选后任务数量:', filteredTasks.length);
    }
    
    // 按类型筛选
    if (type) {
      console.log('按类型筛选:', type);
      const typeArray = type.split(',');
      filteredTasks = filteredTasks.filter(task => 
        typeArray.includes(task.type)
      );
      console.log('类型筛选后任务数量:', filteredTasks.length);
    }
    
    // 按优先级筛选
    if (priority) {
      console.log('按优先级筛选:', priority);
      // 优先级可以是单个值或逗号分隔的多个值
      const priorityArray = priority.split(',').map(p => parseInt(p));
      filteredTasks = filteredTasks.filter(task => 
        priorityArray.includes(task.priority)
      );
      console.log('优先级筛选后任务数量:', filteredTasks.length);
    }
    
    // 按树木类型筛选
    if (treeType) {
      console.log('按树木类型筛选:', treeType);
      const treeTypeArray = treeType.split(',');
      filteredTasks = filteredTasks.filter(task => 
        treeTypeArray.includes(task.treeType)
      );
      console.log('树木类型筛选后任务数量:', filteredTasks.length);
    }
    
    // 按日期范围筛选
    if (startDate) {
      console.log('按开始日期筛选:', startDate);
      const start = new Date(startDate);
      filteredTasks = filteredTasks.filter(task => 
        task.dueDate && new Date(task.dueDate) >= start
      );
      console.log('开始日期筛选后任务数量:', filteredTasks.length);
    }
    
    if (endDate) {
      console.log('按结束日期筛选:', endDate);
      const end = new Date(endDate);
      // 设置为当天的最后一秒，以包含整天
      end.setHours(23, 59, 59, 999);
      filteredTasks = filteredTasks.filter(task => 
        task.dueDate && new Date(task.dueDate) <= end
      );
      console.log('结束日期筛选后任务数量:', filteredTasks.length);
    }
    
    // 按搜索关键词筛选（标题或描述包含关键词）
    if (search) {
      try {
        console.log('按关键词筛选:', search);
        
        // 尝试解码URL编码的搜索词
        let decodedSearch;
        try {
          decodedSearch = decodeURIComponent(search);
          console.log('解码后的搜索关键词:', decodedSearch);
        } catch (e) {
          console.error('解码搜索关键词失败:', e);
          decodedSearch = search;
        }

        // 尝试将URL编码转换为Buffer并输出
        try {
          const searchBuffer = Buffer.from(search);
          console.log('搜索关键词的Buffer表示:', searchBuffer);
          console.log('搜索关键词的UTF-8表示:', searchBuffer.toString('utf8'));
        } catch (e) {
          console.error('搜索关键词转Buffer失败:', e);
        }
        
        const searchLower = decodedSearch.toLowerCase();
        console.log('转换为小写后的搜索关键词:', searchLower);
        
        // 为每个任务打印详细信息
        filteredTasks.forEach(task => {
          const titleLower = (task.title || '').toLowerCase();
          const descLower = (task.description || '').toLowerCase();
          
          console.log(`任务 [${task.id}]:`, task.title);
          console.log('  - 标题(原始):', task.title);
          console.log('  - 标题(小写):', titleLower);
          console.log('  - 匹配结果:', titleLower.includes(searchLower));
          
          // 输出字符编码比较
          console.log('  - 标题字符编码:', Buffer.from(titleLower).toString('hex'));
          console.log('  - 搜索词字符编码:', Buffer.from(searchLower).toString('hex'));
        });
        
        filteredTasks = filteredTasks.filter(task => {
          const titleMatch = task.title && task.title.toLowerCase().includes(searchLower);
          const descMatch = task.description && task.description.toLowerCase().includes(searchLower);
          return titleMatch || descMatch;
        });
      } catch (error) {
        console.error('搜索处理出错:', error);
      }
      
      console.log('关键词筛选后任务数量:', filteredTasks.length);
    }
    
    // 排序
    console.log(`按 ${sortBy} ${sortOrder} 排序`);
    filteredTasks.sort((a, b) => {
      let valueA = a[sortBy];
      let valueB = b[sortBy];
      
      // 对日期进行特殊处理
      if (sortBy === 'dueDate' || sortBy === 'createdAt' || sortBy === 'updatedAt') {
        valueA = valueA ? new Date(valueA).getTime() : 0;
        valueB = valueB ? new Date(valueB).getTime() : 0;
      }
      
      // 字符串比较
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortOrder === 'asc' 
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
      
      // 数值比较
      return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
    });
    
    // 分页
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    // 计算分页信息
    const paginatedTasks = filteredTasks.slice(startIndex, endIndex);
    
    console.log(`返回 ${paginatedTasks.length} 条任务，总计 ${filteredTasks.length} 条`);
    
    // 返回任务列表和分页信息
    res.json({
      code: 200,
      data: {
        tasks: paginatedTasks,
        pagination: {
          total: filteredTasks.length,
          page,
          limit,
          pages: Math.ceil(filteredTasks.length / limit)
        }
      },
      message: '获取任务列表成功',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('获取任务列表失败:', error);
    res.status(500).json({
      code: 500,
      data: null,
      error: { message: error.message },
      message: '获取任务列表失败',
      timestamp: Date.now()
    });
  }
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

// 添加获取任务统计信息API
app.get('/api/tasks/stats', (req, res) => {
  try {
    console.log('接收到获取任务统计请求');
    
    // 统计各种状态的任务数量
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === 'COMPLETED').length;
    const inProgress = tasks.filter(task => task.status === 'IN_PROGRESS').length;
    const todo = tasks.filter(task => task.status === 'TODO').length;
    const cancelled = tasks.filter(task => task.status === 'CANCELLED').length;
    
    // 计算完成率
    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    
    // 获取所有标签及其计数
    const tagCounts = {};
    tasks.forEach(task => {
      if (task.tags && task.tags.length > 0) {
        task.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });
    
    // 排序标签
    const tagStats = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
    
    // 优先级分布
    const priorityStats = {
      1: tasks.filter(task => task.priority === 1).length,
      2: tasks.filter(task => task.priority === 2).length,
      3: tasks.filter(task => task.priority === 3).length,
      4: tasks.filter(task => task.priority === 4).length
    };
    
    res.json({
      code: 200,
      data: {
        total,
        completed,
        inProgress,
        todo,
        cancelled,
        completionRate: parseFloat(completionRate.toFixed(2)),
        tagStats,
        priorityStats
      },
      message: '获取任务统计成功',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('获取任务统计失败:', error);
    res.status(500).json({
      code: 500,
      data: null,
      error: { message: error.message },
      message: '获取任务统计失败',
      timestamp: Date.now()
    });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log('✅ 服务已启动');
  console.log(`🔗 服务地址: http://localhost:${PORT}`);
  console.log(`🔗 API基础路径: http://localhost:${PORT}/api`);
  console.log(`🔗 健康检查: http://localhost:${PORT}/api/health`);
  console.log('\n开发环境准备就绪. 按 Ctrl+C 停止服务.\n');
}); 