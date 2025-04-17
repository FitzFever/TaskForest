/**
 * 树木相关路由
 */
import express from 'express';
import { tasks, trees } from '../../data/devData.js';

const router = express.Router();

// 获取树木列表
router.get('/', (req, res) => {
  // 获取分页参数
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  
  // 获取树木总数
  const total = trees.length;
  
  // 对树木进行分页
  const pagedTrees = trees.slice(offset, offset + limit);
  
  res.json({
    code: 200,
    data: {
      trees: pagedTrees,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    },
    message: 'Success',
    timestamp: Date.now()
  });
});

// 获取单个树木
router.get('/:id', (req, res) => {
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
router.get('/by-task/:taskId', (req, res) => {
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
router.put('/:id', (req, res) => {
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

export default router; 