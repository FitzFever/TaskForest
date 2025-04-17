/**
 * 任务相关路由
 */
import express from 'express';
import { tasks, trees } from '../../data/devData.js';
import { TASK_TYPE_TO_TREE_TYPE_MAPPING, getDefaultTreeTypeForTask } from '../../constants/treeMapping.js';

const router = express.Router();

// 获取所有任务
router.get('/', (req, res) => {
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
router.get('/:id', (req, res) => {
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

// 创建新任务
router.post('/', (req, res) => {
  try {
    console.log('创建任务:', req.body);
    const payload = req.body;
    
    // 验证必填字段
    if (!payload.title) {
      return res.status(400).json({
        code: 400,
        data: null,
        error: { message: 'Title is required' },
        message: 'Bad Request',
        timestamp: Date.now()
      });
    }
    
    // 创建新任务
    const taskType = payload.type || 'NORMAL';
    // 获取默认树木类型
    const defaultTreeType = getDefaultTreeTypeForTask(taskType);
    
    const newTask = {
      id: Date.now().toString(),
      title: payload.title,
      description: payload.description || '',
      type: taskType,
      priority: payload.priority !== undefined ? payload.priority : 2,
      status: 'TODO',
      dueDate: payload.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: payload.tags || [],
      treeType: payload.treeType || defaultTreeType,
      growthStage: 0
    };
    
    // 添加任务到数组
    tasks.push(newTask);
    
    // 创建关联的树木
    const newTree = {
      id: `tree-${newTask.id}`,
      taskId: newTask.id,
      type: newTask.treeType,
      stage: 0,
      position: {
        x: Math.random() * 10 - 5,
        y: 0,
        z: Math.random() * 10 - 5
      },
      rotation: {
        x: 0,
        y: Math.random() * Math.PI * 2,
        z: 0
      },
      scale: {
        x: 1.0,
        y: 1.0,
        z: 1.0
      },
      createdAt: new Date().toISOString(),
      lastGrowth: new Date().toISOString(),
      healthState: 100
    };
    
    // 添加树木到数组
    trees.push(newTree);
    console.log('已创建关联树木:', newTree);
    
    res.status(201).json({
      code: 201,
      data: newTask,
      message: 'Task created successfully',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('创建任务失败:', error);
    res.status(500).json({
      code: 500,
      data: null,
      error: { message: 'Failed to create task' },
      message: 'Internal Server Error',
      timestamp: Date.now()
    });
  }
});

// 更新任务
router.put('/:id', (req, res) => {
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
router.put('/:id/status', (req, res) => {
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
router.patch('/:id/complete', (req, res) => {
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
router.delete('/:id', (req, res) => {
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
  
  // 找到并删除关联的树木
  const treeIndex = trees.findIndex(t => t.taskId === deletedTask.id);
  let treeDeleted = false;
  
  if (treeIndex !== -1) {
    const deletedTree = trees[treeIndex];
    trees.splice(treeIndex, 1);
    console.log('关联树木已删除:', deletedTree);
    treeDeleted = true;
  }
  
  res.json({
    code: 200,
    data: {
      taskId: deletedTask.id,
      treeDeleted
    },
    message: `Task deleted successfully${treeDeleted ? ', associated tree also deleted' : ''}`,
    timestamp: Date.now()
  });
});

// 获取任务统计信息
router.get('/stats', (req, res) => {
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

export default router; 