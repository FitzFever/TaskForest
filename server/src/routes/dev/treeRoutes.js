/**
 * 树木相关路由
 */
import express from 'express';
import { tasks, trees } from '../../data/devData.js';

const router = express.Router();

// 从taskRoutes.js导入批量创建的树木数据
import { batchCreatedTrees } from './taskRoutes.js';

// 获取树木列表
router.get('/', (req, res) => {
  try {
  // 获取分页参数
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
    
    // 打印导入的批量创建树木数组
    console.log('【树木查询】treeRoutes中的batchCreatedTrees类型:', typeof batchCreatedTrees);
    console.log('【树木查询】batchCreatedTrees是否为数组:', Array.isArray(batchCreatedTrees));
    console.log('【树木查询】batchCreatedTrees长度:', batchCreatedTrees?.length || 0);
    
    // 从全局变量获取树木数据
    let batchTrees = [...batchCreatedTrees];
    if (typeof global.getBatchCreatedTrees === 'function') {
      const globalTrees = global.getBatchCreatedTrees() || [];
      console.log('【树木查询】从global获取的批量创建树木数量:', globalTrees.length);
      batchTrees = [...batchTrees, ...globalTrees];
    }
    
    // 去重
    const treeIds = new Set();
    const uniqueBatchTrees = batchTrees.filter(tree => {
      if (treeIds.has(tree.id)) return false;
      treeIds.add(tree.id);
      return true;
    });
    
    // 合并初始树木和批量创建的树木
    const allTrees = [...trees, ...uniqueBatchTrees];
  
  // 获取树木总数
    const total = allTrees.length;
    
    console.log(`【树木查询】总共有 ${total} 个树木 (${trees.length} 个初始树木 + ${uniqueBatchTrees.length} 个批量创建的树木)`);
    
    // 添加父树信息
    const treesWithParentInfo = allTrees.map(tree => {
      // 查找父树
      if (tree.parentTreeId) {
        const parentTree = allTrees.find(t => t.id === tree.parentTreeId);
        if (parentTree) {
          return {
            ...tree,
            parentTreeInfo: {
              id: parentTree.id,
              name: parentTree.name,
              type: parentTree.type,
              taskId: parentTree.taskId
            }
          };
        }
      }
      return tree;
    });
  
  // 对树木进行分页
    const pagedTrees = treesWithParentInfo.slice(offset, offset + limit);
  
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
  } catch (error) {
    console.error('获取树木列表失败:', error);
    res.status(500).json({
      code: 500,
      data: null,
      error: { message: error.message },
      message: '获取树木列表失败',
      timestamp: Date.now()
    });
  }
});

// 获取批量创建的树木列表 - 重要：放在/:id路由前面
router.get('/batch-created', (req, res) => {
  try {
    console.log('【批量树木查询】batchCreatedTrees的值:', JSON.stringify(batchCreatedTrees));
    
    // 如果没有树木，尝试从全局函数获取
    let treesData = [...(batchCreatedTrees || [])];
    if (typeof global.getBatchCreatedTrees === 'function') {
      const globalTrees = global.getBatchCreatedTrees();
      console.log('【批量树木查询】从global.getBatchCreatedTrees获取的树木数量:', globalTrees?.length || 0);
      if (globalTrees && Array.isArray(globalTrees)) {
        treesData = [...treesData, ...globalTrees];
      }
    }
    
    // 去重
    const treeIds = new Set();
    const uniqueTreesData = treesData.filter(tree => {
      if (!tree || !tree.id) return false;
      if (treeIds.has(tree.id)) return false;
      treeIds.add(tree.id);
      return true;
    });
    
    res.json({
      code: 200,
      data: {
        trees: uniqueTreesData,
        info: {
          source: 'batch-created',
          count: uniqueTreesData.length
        }
      },
      message: 'Batch Created Trees',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('获取批量创建的树木列表失败:', error);
    res.status(500).json({
      code: 500,
      data: null,
      error: { message: error.message },
      message: '获取批量创建的树木列表失败',
      timestamp: Date.now()
    });
  }
});

// 获取单个树木
router.get('/:id', (req, res) => {
  try {
    // 获取所有批量创建的树木
    let batchTrees = [...(batchCreatedTrees || [])];
    if (typeof global.getBatchCreatedTrees === 'function') {
      const globalTrees = global.getBatchCreatedTrees() || [];
      batchTrees = [...batchTrees, ...globalTrees];
    }
    
    // 在所有树木中查找（包括初始树木和批量创建的树木）
    const allTrees = [...trees, ...batchTrees];
    const tree = allTrees.find(t => t.id === req.params.id);
    
  if (!tree) {
    return res.status(404).json({
      code: 404,
      data: null,
      error: { message: 'Tree not found' },
      message: 'Not Found',
      timestamp: Date.now()
    });
  }
  
    // 在所有任务中查找关联的任务
    const allTasks = [...tasks];
    if (typeof global.getBatchCreatedTasks === 'function') {
      allTasks.push(...global.getBatchCreatedTasks());
    }
    const relatedTask = allTasks.find(t => t.id === tree.taskId);
    
    // 查找父树
    let parentTree = null;
    if (tree.parentTreeId) {
      parentTree = allTrees.find(t => t.id === tree.parentTreeId);
    }
    
    // 查找子树
    const childTrees = allTrees.filter(t => t.parentTreeId === tree.id);
  
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
        } : null,
        parentTree: parentTree ? {
          id: parentTree.id,
          name: parentTree.name,
          type: parentTree.type,
          taskId: parentTree.taskId
        } : null,
        childTrees: childTrees.length > 0 ? childTrees.map(t => ({
          id: t.id,
          name: t.name,
          type: t.type,
          taskId: t.taskId
        })) : []
    },
    message: 'Success',
    timestamp: Date.now()
  });
  } catch (error) {
    console.error('获取树木详情失败:', error);
    res.status(500).json({
      code: 500,
      data: null,
      error: { message: error.message },
      message: '获取树木详情失败',
      timestamp: Date.now()
    });
  }
});

// 获取任务关联的树木
router.get('/by-task/:taskId', (req, res) => {
  try {
    console.log(`【树木查询】查找任务ID为 ${req.params.taskId} 的树木`);
    
    // 获取所有批量创建的树木
    let batchTrees = [...(batchCreatedTrees || [])];
    if (typeof global.getBatchCreatedTrees === 'function') {
      const globalTrees = global.getBatchCreatedTrees() || [];
      console.log(`【树木查询】从global获取的批量创建树木数量: ${globalTrees.length}`);
      batchTrees = [...batchTrees, ...globalTrees];
    }
    
    // 在所有树木中查找（包括初始树木和批量创建的树木）
    const allTrees = [...trees, ...batchTrees];
    console.log(`【树木查询】总树木数量: ${allTrees.length}, 查找taskId: ${req.params.taskId}`);
    
    // 打印所有树木的taskId，检查是否有匹配
    console.log(`【树木查询】所有树木的taskId列表: ${allTrees.map(t => t.taskId).join(', ')}`);
    
    // 查找匹配的树木 - 确保使用字符串比较
    const taskIdStr = String(req.params.taskId);
    const tree = allTrees.find(t => String(t.taskId) === taskIdStr);
    
  if (!tree) {
      console.log(`【树木查询】未找到任务ID为 ${req.params.taskId} 的树木`);
    return res.status(404).json({
      code: 404,
      data: null,
        error: { 
          message: `Tree not found for task: ${req.params.taskId}`,
          debugInfo: {
            searchedTaskId: req.params.taskId,
            totalTrees: allTrees.length,
            initialTrees: trees.length,
            batchTrees: batchTrees.length
          }
        },
      message: 'Not Found',
      timestamp: Date.now()
    });
  }
    
    console.log(`【树木查询】找到任务关联的树木: ${tree.id}, 类型: ${tree.type}`);
    
    // 查找父树
    let parentTree = null;
    if (tree.parentTreeId) {
      parentTree = allTrees.find(t => t.id === tree.parentTreeId);
    }
    
    // 查找子树
    const childTrees = allTrees.filter(t => t.parentTreeId === tree.id);
  
  res.json({
    code: 200,
      data: {
        ...tree,
        parentTree: parentTree ? {
          id: parentTree.id,
          name: parentTree.name,
          type: parentTree.type,
          taskId: parentTree.taskId
        } : null,
        childTrees: childTrees.length > 0 ? childTrees.map(t => ({
          id: t.id,
          name: t.name,
          type: t.type,
          taskId: t.taskId
        })) : []
      },
    message: 'Success',
    timestamp: Date.now()
  });
  } catch (error) {
    console.error('获取任务关联树木失败:', error);
    res.status(500).json({
      code: 500,
      data: null,
      error: { message: error.message },
      message: '获取任务关联树木失败',
      timestamp: Date.now()
    });
  }
});

// 更新树木
router.put('/:id', (req, res) => {
  try {
    // 先检查初始树木
    let index = trees.findIndex(t => t.id === req.params.id);
    let isInitialTree = true;
    let treeArray = trees;
    
    // 如果在初始树木中找不到，检查批量创建的树木
    if (index === -1) {
      isInitialTree = false;
      
      // 尝试在模块变量中查找
      index = batchCreatedTrees.findIndex(t => t.id === req.params.id);
      treeArray = batchCreatedTrees;
      
      // 如果还找不到，尝试在全局变量中查找
      if (index === -1 && typeof global.getBatchCreatedTrees === 'function') {
        const globalTrees = global.getBatchCreatedTrees() || [];
        index = globalTrees.findIndex(t => t.id === req.params.id);
        
        // 如果在全局变量中找到了，需要更新全局变量
        if (index !== -1) {
          const updatedTree = {
            ...globalTrees[index],
            ...req.body,
            updatedAt: new Date().toISOString()
          };
          
          globalTrees[index] = updatedTree;
          
          // 返回更新后的树木
          return res.json({
            code: 200,
            data: updatedTree,
            message: 'Tree updated successfully (global)',
            timestamp: Date.now()
          });
        }
      }
    }
    
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
      ...treeArray[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
    treeArray[index] = updatedTree;
  
  res.json({
    code: 200,
    data: updatedTree,
      message: `Tree updated successfully (${isInitialTree ? 'initial' : 'batch-created'})`,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('更新树木失败:', error);
    res.status(500).json({
      code: 500,
      data: null,
      error: { message: error.message },
      message: '更新树木失败',
    timestamp: Date.now()
  });
  }
});

export default router; 