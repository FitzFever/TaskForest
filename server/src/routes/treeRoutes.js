/**
 * 树木相关的路由处理
 */
import express from 'express';
import { trees, findTreeByTaskId, printStoreStatus } from '../dataStore.js';
import * as TreeModel from '../models/treeModel.js';

const router = express.Router();

/**
 * 获取所有树木
 * @route GET /api/trees
 */
router.get('/', (req, res) => {
  try {
    const { type, stage, page = 1, pageSize = 10 } = req.query;
    
    let filteredTrees = [...trees];
    
    // 应用过滤条件
    if (type) {
      const typeList = Array.isArray(type) 
        ? type 
        : type.split(',').map(t => t.trim());
      filteredTrees = filteredTrees.filter(tree => typeList.includes(tree.type));
    }
    
    if (stage) {
      const stageList = Array.isArray(stage) 
        ? stage 
        : stage.split(',').map(s => s.trim());
      filteredTrees = filteredTrees.filter(tree => stageList.includes(tree.growthStage));
    }
    
    // 分页处理
    const pageInt = parseInt(page);
    const pageSizeInt = parseInt(pageSize);
    const totalTrees = filteredTrees.length;
    const totalPages = Math.ceil(totalTrees / pageSizeInt);
    const startIndex = (pageInt - 1) * pageSizeInt;
    const endIndex = Math.min(startIndex + pageSizeInt, totalTrees);
    const paginatedTrees = filteredTrees.slice(startIndex, endIndex);
    
    return res.status(200).json({
      code: 200,
      data: {
        trees: paginatedTrees,
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
});

/**
 * 根据任务ID获取关联的树木
 * @route GET /api/trees/by-task/:taskId
 */
router.get('/by-task/:taskId', (req, res) => {
  try {
    const { taskId } = req.params;
    
    if (!taskId) {
      return res.status(400).json({
        code: 400,
        data: null,
        error: { message: '无效的任务ID' },
        message: 'Bad Request',
        timestamp: Date.now()
      });
    }
    
    console.log(`【树木查询】尝试查找任务ID="${taskId}"的树木`);
    printStoreStatus(); // 打印全部存储内容，帮助调试
    
    // 记录batchCreatedTrees的状态
    console.log(`【树木查询】treeRoutes中的batchCreatedTrees类型: ${typeof global.batchCreatedTrees}`);
    console.log(`【树木查询】batchCreatedTrees是否为数组: ${Array.isArray(global.batchCreatedTrees)}`);
    if (global.batchCreatedTrees && Array.isArray(global.batchCreatedTrees)) {
      console.log(`【树木查询】batchCreatedTrees长度: ${global.batchCreatedTrees.length}`);
    }
    
    console.log(`【树木查询】总共有 ${trees.length} 个树木 (${trees.filter(t => t.id.startsWith('tree-')).length} 个初始树木 + ${global.batchCreatedTrees && Array.isArray(global.batchCreatedTrees) ? global.batchCreatedTrees.length : 0} 个批量创建的树木)`);
    
    // 使用TreeModel的方法查找树木
    const tree = TreeModel.getTreeByTaskId(taskId);
    
    // 如果在全局trees中找不到，尝试在批量创建的树木中查找
    if (!tree && global.batchCreatedTrees && Array.isArray(global.batchCreatedTrees)) {
      console.log(`【树木查询】在全局trees中未找到，尝试在batchCreatedTrees中查找`);
      
      const batchTree = global.batchCreatedTrees.find(t => 
        (t.taskId && String(t.taskId) === String(taskId)) || 
        (t.mainTaskId && String(t.mainTaskId) === String(taskId))
      );
      
      if (batchTree) {
        console.log(`【树木查询】在batchCreatedTrees中找到了任务ID为"${taskId}"的树木: ${batchTree.id}`);
        
        return res.status(200).json({
          code: 200,
          data: batchTree,
          message: '获取任务关联的树木成功 (从批量创建树木中)',
          timestamp: Date.now()
        });
      }
    }
    
    if (!tree) {
      return res.status(404).json({
        code: 404,
        data: null,
        error: { 
          message: `Tree not found for task: ${taskId}`,
          debugInfo: {
            searchedTaskId: taskId,
            totalTrees: trees.length,
            initialTrees: trees.filter(t => t.id.startsWith('tree-')).length,
            batchTrees: global.batchCreatedTrees && Array.isArray(global.batchCreatedTrees) ? global.batchCreatedTrees.length : 0
          }
        },
        message: 'Not Found',
        timestamp: Date.now()
      });
    }
    
    console.log(`【树木查询】找到任务ID="${taskId}"的树木:`, tree);
    
    return res.status(200).json({
      code: 200,
      data: tree,
      message: '获取任务关联的树木成功',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('获取任务关联的树木失败:', error);
    return res.status(500).json({
      code: 500,
      data: null,
      error: { message: '获取任务关联的树木失败' },
      message: 'Internal Server Error',
      timestamp: Date.now()
    });
  }
});

/**
 * 获取单个树木
 * @route GET /api/trees/:id
 */
router.get('/:id', (req, res) => {
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
    
    const tree = trees.find(t => t.id === id);
    
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
});

/**
 * 创建树木
 * @route POST /api/trees
 */
router.post('/', (req, res) => {
  try {
    const { 
      type, 
      taskId, 
      name,
      description 
    } = req.body;
    
    if (!type || !taskId) {
      return res.status(400).json({
        code: 400,
        data: null,
        error: { 
          message: '树木类型和任务ID是必填项',
          details: {
            fields: ['type', 'taskId'],
            reason: 'required',
          }
        },
        message: 'Bad Request',
        timestamp: Date.now()
      });
    }
    
    const newTree = {
      id: `tree-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: type,
      name: name || `${type} Tree`,
      description: description || '',
      taskId: taskId,
      growthStage: 'seed',
      growthProgress: 0,
      health: 100,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      environmentFactors: {
        sunlight: 50,
        water: 50,
        nutrients: 50
      }
    };
    
    trees.push(newTree);
    
    return res.status(201).json({
      code: 201,
      data: newTree,
      message: '树木创建成功',
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
});

/**
 * 更新树木
 * @route PUT /api/trees/:id
 */
router.put('/:id', (req, res) => {
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
    
    const treeIndex = trees.findIndex(t => t.id === id);
    
    if (treeIndex === -1) {
      return res.status(404).json({
        code: 404,
        data: null,
        error: { message: '树木不存在' },
        message: 'Not Found',
        timestamp: Date.now()
      });
    }
    
    // 避免更新id、创建时间等敏感字段
    const { id: _, createdAt: __, ...validUpdates } = updates;
    
    const updatedTree = {
      ...trees[treeIndex],
      ...validUpdates,
      updatedAt: new Date().toISOString()
    };
    
    trees[treeIndex] = updatedTree;
    
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
});

/**
 * 删除树木
 * @route DELETE /api/trees/:id
 */
router.delete('/:id', (req, res) => {
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
    
    const treeIndex = trees.findIndex(t => t.id === id);
    
    if (treeIndex === -1) {
      return res.status(404).json({
        code: 404,
        data: null,
        error: { message: '树木不存在' },
        message: 'Not Found',
        timestamp: Date.now()
      });
    }
    
    const deletedTree = trees[treeIndex];
    trees.splice(treeIndex, 1);
    
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
});

export default router; 