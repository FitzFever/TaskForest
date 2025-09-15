/**
 * 任务相关的路由处理
 */
import express from 'express';
import taskService from '../services/taskService.js';

const router = express.Router();

/**
 * 获取所有任务
 * @route GET /api/tasks
 */
router.get('/', async (req, res) => {
  try {
    // 获取查询参数
    const {
      status,
      tags,
      priority,
      type,
      treeType,
      page = 1,
      pageSize = 10,
      startDate,
      endDate,
      search,
      sortBy = 'dueDate',
      sortOrder = 'asc'
    } = req.query;

    // 从服务中获取最新任务数据，确保使用最新的全局数据
    const allTasks = await taskService.getAllTasks();
    let filteredTasks = [...allTasks];
    
    // 应用过滤条件
    if (status) {
      const statusList = Array.isArray(status) 
        ? status 
        : status.split(',').map(s => s.trim());
      filteredTasks = filteredTasks.filter(task => statusList.includes(task.status));
    }
    
    if (tags) {
      const tagsList = Array.isArray(tags) 
        ? tags 
        : tags.split(',').map(tag => tag.trim());
      filteredTasks = filteredTasks.filter(task => {
        return task.tags && task.tags.some(tag => tagsList.includes(tag));
      });
    }
    
    if (priority) {
      const priorityList = Array.isArray(priority) 
        ? priority 
        : priority.split(',').map(p => p.trim());
      filteredTasks = filteredTasks.filter(task => priorityList.includes(task.priority));
    }
    
    if (type) {
      const typeList = Array.isArray(type) 
        ? type 
        : type.split(',').map(t => t.trim());
      filteredTasks = filteredTasks.filter(task => typeList.includes(task.type));
    }
    
    if (treeType) {
      const treeTypeList = Array.isArray(treeType) 
        ? treeType 
        : treeType.split(',').map(t => t.trim());
      filteredTasks = filteredTasks.filter(task => treeTypeList.includes(task.treeType));
    }
    
    // 日期范围过滤
    if (startDate) {
      const start = new Date(startDate);
      filteredTasks = filteredTasks.filter(task => new Date(task.dueDate) >= start);
    }
    
    if (endDate) {
      const end = new Date(endDate);
      filteredTasks = filteredTasks.filter(task => new Date(task.dueDate) <= end);
    }
    
    // 搜索过滤
    if (search) {
      const searchLower = search.toLowerCase();
      filteredTasks = filteredTasks.filter(task => {
        return (
          task.title.toLowerCase().includes(searchLower) ||
          (task.description && task.description.toLowerCase().includes(searchLower))
        );
      });
    }
    
    // 排序处理
    filteredTasks.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      // 日期类型特殊处理
      if (sortBy === 'dueDate' || sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    // 分页处理
    const pageInt = parseInt(page);
    const pageSizeInt = parseInt(pageSize);
    const totalTasks = filteredTasks.length;
    const totalPages = Math.ceil(totalTasks / pageSizeInt);
    const startIndex = (pageInt - 1) * pageSizeInt;
    const endIndex = Math.min(startIndex + pageSizeInt, totalTasks);
    const paginatedTasks = filteredTasks.slice(startIndex, endIndex);
    
    return res.status(200).json({
      code: 200,
      data: {
        tasks: paginatedTasks,
        pagination: {
          total: totalTasks,
          page: pageInt,
          pageSize: pageSizeInt,
          totalPages
        }
      },
      message: '获取任务列表成功',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('获取任务列表失败:', error);
    return res.status(500).json({
      code: 500,
      data: null,
      error: { message: '获取任务列表失败' },
      message: 'Internal Server Error',
      timestamp: Date.now()
    });
  }
});

/**
 * 获取单个任务
 * @route GET /api/tasks/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        code: 400,
        data: null,
        error: { message: '无效的任务ID' },
        message: 'Bad Request',
        timestamp: Date.now()
      });
    }
    
    try {
      const task = await taskService.getTask(id);
    
      return res.status(200).json({
        code: 200,
        data: task,
        message: '获取任务成功',
        timestamp: Date.now()
      });
    } catch (error) {
      return res.status(404).json({
        code: 404,
        data: null,
        error: { message: '任务不存在' },
        message: 'Not Found',
        timestamp: Date.now()
      });
    }
  } catch (error) {
    console.error('获取任务失败:', error);
    return res.status(500).json({
      code: 500,
      data: null,
      error: { message: '获取任务失败' },
      message: 'Internal Server Error',
      timestamp: Date.now()
    });
  }
});

/**
 * 创建任务
 * @route POST /api/tasks
 */
router.post('/', async (req, res) => {
  try {
    const { 
      title, 
      description, 
      type, 
      status, 
      priority, 
      dueDate, 
      tags, 
      treeType 
    } = req.body;
    
    if (!title) {
      return res.status(400).json({
        code: 400,
        data: null,
        error: { 
          message: '标题是必填项',
          details: {
            field: 'title',
            reason: 'required',
          }
        },
        message: 'Bad Request',
        timestamp: Date.now()
      });
    }
    
    const newTask = await taskService.createTask({
      title,
      description: description || '',
      type: type || 'default',
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      tags: tags || [],
      treeType: treeType || 'oak',
      growthStage: 0
    });
    
    return res.status(201).json({
      code: 201,
      data: newTask,
      message: '任务创建成功',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('创建任务失败:', error);
    return res.status(500).json({
      code: 500,
      data: null,
      error: { message: '创建任务失败' },
      message: 'Internal Server Error',
      timestamp: Date.now()
    });
  }
});

/**
 * 更新任务
 * @route PUT /api/tasks/:id
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    if (!id) {
      return res.status(400).json({
        code: 400,
        data: null,
        error: { message: '无效的任务ID' },
        message: 'Bad Request',
        timestamp: Date.now()
      });
    }
    
    try {
      // 先检查任务是否存在
      await taskService.getTask(id);
      
      // 避免更新id、创建时间等敏感字段
      const { id: _, createdAt: __, ...validUpdates } = updates;
      
      const updatedTask = await taskService.updateTask(id, validUpdates);
      
      return res.status(200).json({
        code: 200,
        data: updatedTask,
        message: '任务更新成功',
        timestamp: Date.now()
      });
    } catch (error) {
      return res.status(404).json({
        code: 404,
        data: null,
        error: { message: '任务不存在' },
        message: 'Not Found',
        timestamp: Date.now()
      });
    }
  } catch (error) {
    console.error('更新任务失败:', error);
    return res.status(500).json({
      code: 500,
      data: null,
      error: { message: '更新任务失败' },
      message: 'Internal Server Error',
      timestamp: Date.now()
    });
  }
});

/**
 * 删除任务
 * @route DELETE /api/tasks/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        code: 400,
        data: null,
        error: { message: '无效的任务ID' },
        message: 'Bad Request',
        timestamp: Date.now()
      });
    }
    
    try {
      // 先检查任务是否存在
      await taskService.getTask(id);
      
      // 删除任务
      await taskService.deleteTask(id);
      
      return res.status(200).json({
        code: 200,
        data: { id },
        message: '任务删除成功',
        timestamp: Date.now()
      });
    } catch (error) {
      return res.status(404).json({
        code: 404,
        data: null,
        error: { message: '任务不存在' },
        message: 'Not Found',
        timestamp: Date.now()
      });
    }
  } catch (error) {
    console.error('删除任务失败:', error);
    return res.status(500).json({
      code: 500,
      data: null,
      error: { message: '删除任务失败' },
      message: 'Internal Server Error',
      timestamp: Date.now()
    });
  }
});

export default router; 