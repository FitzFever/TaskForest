/**
 * 任务控制器
 * 处理任务相关的API请求
 */
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import taskTreeService from '../services/taskTreeService.js';

const prisma = new PrismaClient();

/**
 * 获取所有任务
 * @route GET /api/tasks
 */
export async function getTasks(req: Request, res: Response) {
  try {
    // 获取查询参数
    const {
      status,
      tags,
      priority,
      type,
      page = '1',
      pageSize = '10',
      startDate,
      endDate,
      search,
      sortBy = 'dueDate',
      sortOrder = 'asc'
    } = req.query;

    // 构建过滤条件
    const where: any = {};
    
    if (status) {
      const statusList = Array.isArray(status) 
        ? status
        : typeof status === 'string' ? status.split(',').map(s => s.trim()) : [];
      where.status = { in: statusList };
    }
    
    if (priority) {
      const priorityList = Array.isArray(priority) 
        ? priority
        : typeof priority === 'string' ? priority.split(',').map(p => parseInt(p.trim())) : [];
      where.priority = { in: priorityList };
    }
    
    if (type) {
      const typeList = Array.isArray(type) 
        ? type
        : typeof type === 'string' ? type.split(',').map(t => t.trim()) : [];
      where.type = { in: typeList };
    }
    
    // 日期范围过滤
    if (startDate) {
      where.dueDate = {
        ...where.dueDate,
        gte: new Date(startDate as string)
      };
    }
    
    if (endDate) {
      where.dueDate = {
        ...where.dueDate,
        lte: new Date(endDate as string)
      };
    }
    
    // 搜索过滤
    if (search && typeof search === 'string') {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // 标签过滤
    if (tags) {
      const tagsList = Array.isArray(tags) 
        ? tags
        : typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : [];
      where.tags = {
        hasSome: tagsList
      };
    }
    
    // 分页处理
    const pageInt = parseInt(page as string);
    const pageSizeInt = parseInt(pageSize as string);
    const skip = (pageInt - 1) * pageSizeInt;
    
    // 排序处理
    let orderBy: any = {};
    if (sortBy && sortOrder) {
      orderBy[sortBy as string] = sortOrder;
    }
    
    // 查询任务，包含关联的树木
    const [tasks, totalTasks] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy,
        skip,
        take: pageSizeInt,
        include: {
          tree: true
        }
      }),
      prisma.task.count({ where })
    ]);
    
    // 计算总页数
    const totalPages = Math.ceil(totalTasks / pageSizeInt);
    
    return res.status(200).json({
      code: 200,
      data: {
        tasks,
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
}

/**
 * 获取单个任务
 * @route GET /api/tasks/:id
 */
export async function getTask(req: Request, res: Response) {
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
    
    const task = await prisma.task.findUnique({
      where: { id },
      include: { tree: true }
    });
    
    if (!task) {
      return res.status(404).json({
        code: 404,
        data: null,
        error: { message: '任务不存在' },
        message: 'Not Found',
        timestamp: Date.now()
      });
    }
    
    return res.status(200).json({
      code: 200,
      data: task,
      message: '获取任务成功',
      timestamp: Date.now()
    });
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
}

/**
 * 创建任务
 * @route POST /api/tasks
 */
export async function createTask(req: Request, res: Response) {
  try {
    const { 
      title, 
      description, 
      type, 
      status, 
      priority, 
      dueDate, 
      tags, 
      treeType,
      autoCreateTree = true
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
    
    // 创建任务
    const newTask = await prisma.task.create({
      data: {
        title,
        description: description || '',
        type: type || 'NORMAL',
        status: status || 'TODO',
        priority: priority || 2,
        progress: 0,
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        tags: tags || [],
      }
    });

    // 如果需要自动创建树木
    let tree = null;
    if (autoCreateTree) {
      try {
        tree = await taskTreeService.createTreeForTask(newTask.id, treeType || 'OAK');
      } catch (treeError) {
        console.error('自动创建树木失败:', treeError);
        // 继续返回任务创建成功，但提示树木创建失败
      }
    }
    
    return res.status(201).json({
      code: 201,
      data: {
        task: newTask,
        tree
      },
      message: '任务创建成功' + (tree ? '，并已关联树木' : '，但树木创建失败'),
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
}

/**
 * 更新任务
 * @route PUT /api/tasks/:id
 */
export async function updateTask(req: Request, res: Response) {
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
    
    // 避免更新id、创建时间等敏感字段
    const { id: _, createdAt: __, tree: ___, ...validUpdates } = updates;
    
    // 获取当前任务状态以比较变化
    const currentTask = await prisma.task.findUnique({
      where: { id }
    });
    
    if (!currentTask) {
      return res.status(404).json({
        code: 404,
        data: null,
        error: { message: '任务不存在' },
        message: 'Not Found',
        timestamp: Date.now()
      });
    }
    
    // 更新任务
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        ...validUpdates,
        updatedAt: new Date()
      },
      include: { tree: true }
    });

    // 如果状态或进度发生变化，更新关联树木
    let updatedTree = null;
    if ((validUpdates.status && validUpdates.status !== currentTask.status) || 
        (validUpdates.progress !== undefined && validUpdates.progress !== (currentTask as any).progress)) {
      try {
        updatedTree = await taskTreeService.updateTreeOnTaskChange(
          id, 
          validUpdates.status || currentTask.status,
          validUpdates.progress !== undefined ? validUpdates.progress : (currentTask as any).progress
        );
      } catch (treeError) {
        console.error('更新关联树木失败:', treeError);
      }
    }
    
    return res.status(200).json({
      code: 200,
      data: {
        task: updatedTask,
        treeUpdated: !!updatedTree
      },
      message: '任务更新成功' + (updatedTree ? '，关联树木已更新' : ''),
      timestamp: Date.now()
    });
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
}

/**
 * 删除任务
 * @route DELETE /api/tasks/:id
 */
export async function deleteTask(req: Request, res: Response) {
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
    
    // 检查任务是否存在
    const task = await prisma.task.findUnique({
      where: { id }
    });
    
    if (!task) {
      return res.status(404).json({
        code: 404,
        data: null,
        error: { message: '任务不存在' },
        message: 'Not Found',
        timestamp: Date.now()
      });
    }

    // 总是删除关联的树木
    let treeDeleted = false;
    try {
      treeDeleted = await taskTreeService.unlinkTaskTree(id);
    } catch (treeError) {
      console.error('删除关联树木失败:', treeError);
    }
    
    // 删除任务
    await prisma.task.delete({
      where: { id }
    });
    
    return res.status(200).json({
      code: 200,
      data: { 
        id,
        treeDeleted
      },
      message: '任务删除成功' + (treeDeleted ? '，已删除关联树木' : ''),
      timestamp: Date.now()
    });
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
}

/**
 * 更新任务状态
 * @route PUT /api/tasks/:id/status
 */
export async function updateTaskStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!id) {
      return res.status(400).json({
        code: 400,
        data: null,
        error: { message: '无效的任务ID' },
        message: 'Bad Request',
        timestamp: Date.now()
      });
    }
    
    if (!status) {
      return res.status(400).json({
        code: 400,
        data: null,
        error: { message: '状态是必填项' },
        message: 'Bad Request',
        timestamp: Date.now()
      });
    }
    
    // 获取当前任务
    const currentTask = await prisma.task.findUnique({
      where: { id }
    });
    
    if (!currentTask) {
      return res.status(404).json({
        code: 404,
        data: null,
        error: { message: '任务不存在' },
        message: 'Not Found',
        timestamp: Date.now()
      });
    }

    // 更新完成时间
    let completedAt = null;
    if (status === 'COMPLETED') {
      completedAt = new Date();
    }
    
    // 更新任务状态
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        status,
        completedAt,
        updatedAt: new Date()
      }
    });
    
    // 更新树木状态
    let updatedTree = null;
    try {
      updatedTree = await taskTreeService.updateTreeOnTaskChange(
        id, 
        status,
        (currentTask as any).progress
      );
    } catch (treeError) {
      console.error('更新关联树木失败:', treeError);
    }
    
    return res.status(200).json({
      code: 200,
      data: {
        task: updatedTask,
        treeUpdated: !!updatedTree
      },
      message: '任务状态更新成功' + (updatedTree ? '，关联树木已更新' : ''),
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('更新任务状态失败:', error);
    return res.status(500).json({
      code: 500,
      data: null,
      error: { message: '更新任务状态失败' },
      message: 'Internal Server Error',
      timestamp: Date.now()
    });
  }
}

/**
 * 完成任务
 * @route POST /api/tasks/:id/complete
 */
export async function completeTask(req: Request, res: Response) {
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
    
    // 检查任务是否存在
    const task = await prisma.task.findUnique({
      where: { id }
    });
    
    if (!task) {
      return res.status(404).json({
        code: 404,
        data: null,
        error: { message: '任务不存在' },
        message: 'Not Found',
        timestamp: Date.now()
      });
    }
    
    // 更新任务状态为已完成
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        progress: 100,
        completedAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    // 更新树木状态
    let updatedTree = null;
    try {
      updatedTree = await taskTreeService.updateTreeOnTaskChange(id, 'COMPLETED', 100);
    } catch (treeError) {
      console.error('更新关联树木失败:', treeError);
    }
    
    return res.status(200).json({
      code: 200,
      data: {
        task: updatedTask,
        treeUpdated: !!updatedTree
      },
      message: '任务已标记为完成' + (updatedTree ? '，关联树木已更新' : ''),
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('完成任务失败:', error);
    return res.status(500).json({
      code: 500,
      data: null,
      error: { message: '完成任务失败' },
      message: 'Internal Server Error',
      timestamp: Date.now()
    });
  }
}

export default {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  completeTask
}; 