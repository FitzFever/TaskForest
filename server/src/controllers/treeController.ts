/**
 * 树木控制器
 * 处理树木相关的API请求
 */
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import taskTreeService from '../services/taskTreeService.js';

const prisma = new PrismaClient();

/**
 * 获取所有树木
 * @route GET /api/trees
 */
export async function getTrees(req: Request, res: Response) {
  try {
    // 获取查询参数
    const {
      type,
      stage,
      taskId,
      page = '1',
      pageSize = '10',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // 构建过滤条件
    const where: any = {};
    
    if (type) {
      const typeList = Array.isArray(type) 
        ? type
        : typeof type === 'string' ? type.split(',').map(t => t.trim()) : [];
      where.type = { in: typeList };
    }
    
    if (stage) {
      const stageList = Array.isArray(stage)
        ? stage.map(s => parseInt(s as string))
        : typeof stage === 'string' ? stage.split(',').map(s => parseInt(s.trim())) : [];
      where.stage = { in: stageList };
    }
    
    if (taskId) {
      where.taskId = taskId as string;
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
    
    // 查询树木，包含关联的任务
    const [trees, totalTrees] = await Promise.all([
      prisma.tree.findMany({
        where,
        orderBy,
        skip,
        take: pageSizeInt,
        include: {
          task: true
        }
      }),
      prisma.tree.count({ where })
    ]);
    
    // 计算总页数
    const totalPages = Math.ceil(totalTrees / pageSizeInt);
    
    return res.status(200).json({
      code: 200,
      data: {
        trees,
        pagination: {
          total: totalTrees,
          page: pageInt,
          pageSize: pageSizeInt,
          totalPages
        }
      },
      message: '获取树木列表成功',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('获取树木列表失败:', error);
    return res.status(500).json({
      code: 500,
      data: null,
      error: { message: '获取树木列表失败' },
      message: 'Internal Server Error',
      timestamp: Date.now()
    });
  }
}

/**
 * 获取单个树木
 * @route GET /api/trees/:id
 */
export async function getTreeById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        code: 400,
        data: null,
        error: { message: '无效的树木ID' },
        message: 'Bad Request',
        timestamp: Date.now()
      });
    }
    
    const tree = await prisma.tree.findUnique({
      where: { id },
      include: { task: true }
    });
    
    if (!tree) {
      return res.status(404).json({
        code: 404,
        data: null,
        error: { message: '树木不存在' },
        message: 'Not Found',
        timestamp: Date.now()
      });
    }
    
    return res.status(200).json({
      code: 200,
      data: tree,
      message: '获取树木成功',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('获取树木失败:', error);
    return res.status(500).json({
      code: 500,
      data: null,
      error: { message: '获取树木失败' },
      message: 'Internal Server Error',
      timestamp: Date.now()
    });
  }
}

/**
 * 创建树木
 * @route POST /api/trees
 */
export async function createTree(req: Request, res: Response) {
  try {
    const { 
      type, 
      taskId, 
      stage = 1, 
      healthState = 100,
      position 
    } = req.body;
    
    if (!type) {
      return res.status(400).json({
        code: 400,
        data: null,
        error: { 
          message: '树木类型是必填项',
          details: {
            field: 'type',
            reason: 'required',
          }
        },
        message: 'Bad Request',
        timestamp: Date.now()
      });
    }
    
    // 如果提供了taskId，检查任务是否存在
    if (taskId) {
      const task = await prisma.task.findUnique({
        where: { id: taskId }
      });
      
      if (!task) {
        return res.status(404).json({
          code: 404,
          data: null,
          error: { message: '关联的任务不存在' },
          message: 'Not Found',
          timestamp: Date.now()
        });
      }
      
      // 检查任务是否已绑定树木
      const existingTree = await prisma.tree.findFirst({
        where: { taskId }
      });
      
      if (existingTree) {
        return res.status(400).json({
          code: 400,
          data: null,
          error: { message: '该任务已绑定树木' },
          message: 'Bad Request',
          timestamp: Date.now()
        });
      }
    }
    
    // 创建树木
    const newTree = await prisma.tree.create({
      data: {
        type,
        stage,
        healthState,
        taskId,
        positionX: position?.x || 0,
        positionY: position?.y || 0,
        positionZ: position?.z || 0,
        rotationY: Math.random() * Math.PI * 2, // 随机旋转
        scaleX: 1,
        scaleY: 1,
        scaleZ: 1,
        lastGrowth: new Date()
      },
      include: { task: true }
    });
    
    return res.status(201).json({
      code: 201,
      data: newTree,
      message: '树木创建成功' + (taskId ? '并已关联任务' : ''),
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('创建树木失败:', error);
    return res.status(500).json({
      code: 500,
      data: null,
      error: { message: '创建树木失败' },
      message: 'Internal Server Error',
      timestamp: Date.now()
    });
  }
}

/**
 * 更新树木
 * @route PUT /api/trees/:id
 */
export async function updateTree(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    if (!id) {
      return res.status(400).json({
        code: 400,
        data: null,
        error: { message: '无效的树木ID' },
        message: 'Bad Request',
        timestamp: Date.now()
      });
    }
    
    // 避免更新id、创建时间等敏感字段
    const { id: _, createdAt: __, task: ___, ...validUpdates } = updates;
    
    // 如果更新了位置
    if (updates.position) {
      validUpdates.positionX = updates.position.x;
      validUpdates.positionY = updates.position.y;
      validUpdates.positionZ = updates.position.z;
      delete validUpdates.position;
    }
    
    // 检查树木是否存在
    const tree = await prisma.tree.findUnique({
      where: { id }
    });
    
    if (!tree) {
      return res.status(404).json({
        code: 404,
        data: null,
        error: { message: '树木不存在' },
        message: 'Not Found',
        timestamp: Date.now()
      });
    }
    
    // 如果尝试更新taskId，检查新任务是否存在且未绑定树木
    if (validUpdates.taskId && validUpdates.taskId !== tree.taskId) {
      // 检查任务是否存在
      const task = await prisma.task.findUnique({
        where: { id: validUpdates.taskId }
      });
      
      if (!task) {
        return res.status(404).json({
          code: 404,
          data: null,
          error: { message: '关联的任务不存在' },
          message: 'Not Found',
          timestamp: Date.now()
        });
      }
      
      // 检查任务是否已绑定树木
      const existingTree = await prisma.tree.findFirst({
        where: { 
          taskId: validUpdates.taskId,
          id: { not: id } // 排除当前树木
        }
      });
      
      if (existingTree) {
        return res.status(400).json({
          code: 400,
          data: null,
          error: { message: '该任务已绑定树木' },
          message: 'Bad Request',
          timestamp: Date.now()
        });
      }
    }
    
    // 更新树木
    const updatedTree = await prisma.tree.update({
      where: { id },
      data: validUpdates,
      include: { task: true }
    });
    
    return res.status(200).json({
      code: 200,
      data: updatedTree,
      message: '树木更新成功',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('更新树木失败:', error);
    return res.status(500).json({
      code: 500,
      data: null,
      error: { message: '更新树木失败' },
      message: 'Internal Server Error',
      timestamp: Date.now()
    });
  }
}

/**
 * 删除树木
 * @route DELETE /api/trees/:id
 */
export async function deleteTree(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        code: 400,
        data: null,
        error: { message: '无效的树木ID' },
        message: 'Bad Request',
        timestamp: Date.now()
      });
    }
    
    // 检查树木是否存在
    const tree = await prisma.tree.findUnique({
      where: { id }
    });
    
    if (!tree) {
      return res.status(404).json({
        code: 404,
        data: null,
        error: { message: '树木不存在' },
        message: 'Not Found',
        timestamp: Date.now()
      });
    }
    
    // 删除树木
    await prisma.tree.delete({
      where: { id }
    });
    
    return res.status(200).json({
      code: 200,
      data: { id },
      message: '树木删除成功',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('删除树木失败:', error);
    return res.status(500).json({
      code: 500,
      data: null,
      error: { message: '删除树木失败' },
      message: 'Internal Server Error',
      timestamp: Date.now()
    });
  }
}

/**
 * 绑定树木到任务
 * @route POST /api/trees/:id/bind-task/:taskId
 */
export async function bindTaskToTree(req: Request, res: Response) {
  try {
    const { id, taskId } = req.params;
    
    if (!id || !taskId) {
      return res.status(400).json({
        code: 400,
        data: null,
        error: { message: '树木ID和任务ID都是必需的' },
        message: 'Bad Request',
        timestamp: Date.now()
      });
    }
    
    // 检查树木是否存在
    const tree = await prisma.tree.findUnique({
      where: { id }
    });
    
    if (!tree) {
      return res.status(404).json({
        code: 404,
        data: null,
        error: { message: '树木不存在' },
        message: 'Not Found',
        timestamp: Date.now()
      });
    }
    
    // 检查树木是否已绑定任务
    if (tree.taskId) {
      return res.status(400).json({
        code: 400,
        data: null,
        error: { message: '树木已绑定任务，请先解绑' },
        message: 'Bad Request',
        timestamp: Date.now()
      });
    }
    
    // 检查任务是否存在
    const task = await prisma.task.findUnique({
      where: { id: taskId }
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
    
    // 检查任务是否已绑定树木
    const existingTree = await prisma.tree.findFirst({
      where: { taskId }
    });
    
    if (existingTree) {
      return res.status(400).json({
        code: 400,
        data: null,
        error: { message: '该任务已绑定树木' },
        message: 'Bad Request',
        timestamp: Date.now()
      });
    }
    
    // 绑定树木到任务
    const updatedTree = await prisma.tree.update({
      where: { id },
      data: { taskId },
      include: { task: true }
    });
    
    return res.status(200).json({
      code: 200,
      data: updatedTree,
      message: '树木成功绑定到任务',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('绑定树木到任务失败:', error);
    return res.status(500).json({
      code: 500,
      data: null,
      error: { message: '绑定树木到任务失败' },
      message: 'Internal Server Error',
      timestamp: Date.now()
    });
  }
}

/**
 * 解绑树木与任务
 * @route POST /api/trees/:id/unbind-task
 */
export async function unbindTaskFromTree(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        code: 400,
        data: null,
        error: { message: '无效的树木ID' },
        message: 'Bad Request',
        timestamp: Date.now()
      });
    }
    
    // 检查树木是否存在
    const tree = await prisma.tree.findUnique({
      where: { id }
    });
    
    if (!tree) {
      return res.status(404).json({
        code: 404,
        data: null,
        error: { message: '树木不存在' },
        message: 'Not Found',
        timestamp: Date.now()
      });
    }
    
    // 检查树木是否已绑定任务
    if (!tree.taskId) {
      return res.status(400).json({
        code: 400,
        data: null,
        error: { message: '树木尚未绑定任务' },
        message: 'Bad Request',
        timestamp: Date.now()
      });
    }
    
    // 解绑树木与任务
    const updatedTree = await prisma.tree.update({
      where: { id },
      data: { taskId: null }
    });
    
    return res.status(200).json({
      code: 200,
      data: updatedTree,
      message: '树木成功解绑任务',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('解绑树木与任务失败:', error);
    return res.status(500).json({
      code: 500,
      data: null,
      error: { message: '解绑树木与任务失败' },
      message: 'Internal Server Error',
      timestamp: Date.now()
    });
  }
}

/**
 * 树木生长
 * @route POST /api/trees/:id/grow
 */
export async function growTree(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { amount = 1 } = req.body;
    
    if (!id) {
      return res.status(400).json({
        code: 400,
        data: null,
        error: { message: '无效的树木ID' },
        message: 'Bad Request',
        timestamp: Date.now()
      });
    }
    
    // 检查树木是否存在
    const tree = await prisma.tree.findUnique({
      where: { id }
    });
    
    if (!tree) {
      return res.status(404).json({
        code: 404,
        data: null,
        error: { message: '树木不存在' },
        message: 'Not Found',
        timestamp: Date.now()
      });
    }
    
    // 计算新的生长阶段
    const newStage = Math.min(4, tree.stage + amount);
    
    // 更新树木
    const updatedTree = await prisma.tree.update({
      where: { id },
      data: {
        stage: newStage,
        lastGrowth: new Date()
      }
    });
    
    return res.status(200).json({
      code: 200,
      data: {
        id: updatedTree.id,
        previousStage: tree.stage,
        newStage: updatedTree.stage,
        lastGrowth: updatedTree.lastGrowth
      },
      message: '树木成功生长',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('树木生长失败:', error);
    return res.status(500).json({
      code: 500,
      data: null,
      error: { message: '树木生长失败' },
      message: 'Internal Server Error',
      timestamp: Date.now()
    });
  }
} 