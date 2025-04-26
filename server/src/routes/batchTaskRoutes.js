import express from 'express';
import batchTaskController from '../controllers/batchTaskController.js';
import { batchTasks, batchTrees, addTask, addTree } from '../dataStore.js';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger.js';

// 尝试获取存储函数
let storeBatchCreatedData = null;
try {
  if (global.storeBatchCreatedData) {
    storeBatchCreatedData = global.storeBatchCreatedData;
  } else {
    // 使用动态导入，但不使用await
    import('./dev/taskRoutes.js')
      .then(module => {
        if (module.storeBatchCreatedData) {
          storeBatchCreatedData = module.storeBatchCreatedData;
        }
      })
      .catch(error => {
        console.log('无法导入storeBatchCreatedData函数:', error.message);
      });
  }
} catch (error) {
  console.log('无法导入storeBatchCreatedData函数:', error.message);
}

const router = express.Router();

// 文件路径检查
console.log('batchTaskRoutes.js 加载路径:', import.meta.url);
console.log('导入的storeBatchCreatedData:', typeof storeBatchCreatedData);
console.log('导入的batchCreatedTasks数组:', Array.isArray(batchCreatedTasks));
console.log('导入的batchCreatedTrees数组:', Array.isArray(batchCreatedTrees));

/**
 * @swagger
 * /api/batch-tasks:
 *   post:
 *     summary: 批量创建任务
 *     description: 创建多个任务
 *     tags:
 *       - 批量任务管理
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tasks
 *             properties:
 *               tasks:
 *                 type: array
 *                 description: 任务列表
 *                 items:
 *                   type: object
 *                   required:
 *                     - title
 *                     - description
 *                   properties:
 *                     title:
 *                       type: string
 *                       description: 任务标题
 *                     description:
 *                       type: string
 *                       description: 任务描述
 *                     status:
 *                       type: string
 *                       description: 任务状态
 *                       default: "未开始"
 *                       enum: ["未开始", "进行中", "已完成"]
 *                     priority:
 *                       type: string
 *                       description: 任务优先级
 *                       default: "中"
 *                       enum: ["低", "中", "高"]
 *                     dueDate:
 *                       type: string
 *                       format: date
 *                       description: 任务截止日期
 *     responses:
 *       201:
 *         description: 批量任务创建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 批量任务创建成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     tasks:
 *                       type: array
 *                       items:
 *                         type: object
 *       400:
 *         description: 请求参数错误
 *       500:
 *         description: 服务器错误
 */
router.post('/', async (req, res) => {
  try {
    console.log('开始处理批量创建任务请求:', req.body);
    
    // 调用原始控制器方法
    await batchTaskController.createBatchTasks(req, res);
    
    // 获取响应数据并存储
    console.log('批量创建任务控制器处理完成，检查响应数据');
    
    if (res.locals && res.locals.responseData) {
      console.log('找到存储在res.locals中的响应数据');
      const responseData = res.locals.responseData;
      
      console.log('响应数据详情:', JSON.stringify(responseData));
      
      if (responseData.success && responseData.data) {
        // 存储创建的任务和树木到开发环境数据中
        const tasksData = responseData.data.tasks || [];
        const treesData = responseData.data.trees || [];
        
        console.log(`批量创建成功：${tasksData.length}个任务和${treesData.length}个树木`);
        
        // 打印详细任务树数据
        console.log('要存储的任务数据:', JSON.stringify(tasksData));
        console.log('要存储的树木数据:', JSON.stringify(treesData));
        
        // 存储批量创建的数据
        storeBatchCreatedData(tasksData, treesData);
        
        console.log('数据存储完成，当前批量创建的任务数量:', batchCreatedTasks.length);
        console.log('数据存储完成，当前批量创建的树木数量:', batchCreatedTrees.length);
      } else {
        console.warn('响应数据中没有成功标志或数据对象:', responseData);
      }
    } else {
      console.warn('响应对象中没有找到responseData:', res.locals);
    }
  } catch (error) {
    console.error('批量创建任务失败:', error);
    res.status(500).json({
      success: false,
      message: `批量创建任务失败: ${error.message}`
    });
  }
});

/**
 * @swagger
 * /api/batch-tasks/with-trees:
 *   post:
 *     summary: 批量创建任务和任务树
 *     description: 创建多个任务及其子任务，并创建对应的任务树
 *     tags:
 *       - 批量任务管理
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tasks
 *             properties:
 *               tasks:
 *                 type: array
 *                 description: 主任务列表
 *                 items:
 *                   type: object
 *                   required:
 *                     - title
 *                     - description
 *                     - subTasks
 *                   properties:
 *                     title:
 *                       type: string
 *                       description: 主任务标题
 *                     description:
 *                       type: string
 *                       description: 主任务描述
 *                     status:
 *                       type: string
 *                       description: 主任务状态
 *                       default: "未开始"
 *                       enum: ["未开始", "进行中", "已完成"]
 *                     priority:
 *                       type: string
 *                       description: 主任务优先级
 *                       default: "中"
 *                       enum: ["低", "中", "高"]
 *                     dueDate:
 *                       type: string
 *                       format: date
 *                       description: 主任务截止日期
 *                     subTasks:
 *                       type: array
 *                       description: 子任务列表
 *                       items:
 *                         type: object
 *                         required:
 *                           - title
 *                           - description
 *                         properties:
 *                           title:
 *                             type: string
 *                             description: 子任务标题
 *                           description:
 *                             type: string
 *                             description: 子任务描述
 *                           status:
 *                             type: string
 *                             description: 子任务状态
 *                             default: "未开始"
 *                             enum: ["未开始", "进行中", "已完成"]
 *                           priority:
 *                             type: string
 *                             description: 子任务优先级
 *                             default: "中"
 *                             enum: ["低", "中", "高"]
 *                           estimatedHours:
 *                             type: number
 *                             description: 预计完成时间（小时）
 *               createTrees:
 *                 type: boolean
 *                 description: 是否为每个主任务创建任务树
 *                 default: true
 *     responses:
 *       201:
 *         description: 批量任务和任务树创建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 批量任务和任务树创建成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     tasks:
 *                       type: array
 *                       items:
 *                         type: object
 *                     trees:
 *                       type: array
 *                       items:
 *                         type: object
 *       400:
 *         description: 请求参数错误
 *       500:
 *         description: 服务器错误
 */
router.post('/with-trees', async (req, res) => {
  console.log('=========== 批量创建任务和树木路由 ===========');
  console.log('请求体:', JSON.stringify(req.body, null, 2));
  console.log('是否创建树木:', req.body.createTrees === false ? 'false' : 'true');
  
  const originalSend = res.send;
  
  // 重写res.send方法以捕获响应数据
  res.send = function(body) {
    try {
      // 尝试解析响应数据
      const responseData = JSON.parse(body);
      
      console.log('批量创建任务和树木响应数据:', JSON.stringify(responseData, null, 2));
      
      // 如果创建成功，存储任务和树木数据
      if (responseData.success && responseData.data) {
        const hasTrees = responseData.data.trees && Array.isArray(responseData.data.trees);
        const hasTasks = responseData.data.tasks && Array.isArray(responseData.data.tasks);
        
        console.log(`响应包含: ${hasTasks ? responseData.data.tasks.length + '个任务' : '无任务'}, ${hasTrees ? responseData.data.trees.length + '棵树' : '无树木'}`);
        
        if (hasTasks && hasTrees) {
          console.log('成功创建批量任务和树木，存储到开发环境数据');
          
          // 在全局变量中存储树木数组
          if (!global.batchCreatedTrees) {
            global.batchCreatedTrees = [];
          }
          
          // 向全局数组添加树木（避免重复）
          const existingTreeIds = new Set(global.batchCreatedTrees.map(t => t.id));
          responseData.data.trees.forEach(tree => {
            if (!existingTreeIds.has(tree.id)) {
              global.batchCreatedTrees.push(tree);
              existingTreeIds.add(tree.id);
            }
          });
          
          console.log(`全局batchCreatedTrees数组现在包含${global.batchCreatedTrees.length}棵树`);
          
          // 保存到开发环境数据存储
          storeBatchCreatedData(responseData.data.tasks, responseData.data.trees);
          
          // 确保所有创建的树木都被添加到devData.js中
          if (responseData.data.trees && Array.isArray(responseData.data.trees)) {
            console.log(`[batchTaskRoutes] 开始同步 ${responseData.data.trees.length} 棵树木到开发环境数据`);
            
            // 如果存在全局函数addTreeToDevData，则调用它添加每棵树
            if (typeof global.addTreeToDevData === 'function') {
              let syncedCount = 0;
              responseData.data.trees.forEach(tree => {
                if (global.addTreeToDevData(tree)) {
                  syncedCount++;
                }
              });
              console.log(`[batchTaskRoutes] 成功同步 ${syncedCount}/${responseData.data.trees.length} 棵树木到开发环境数据`);
            } else {
              console.warn('[batchTaskRoutes] 全局函数addTreeToDevData不存在，无法同步树木到开发环境数据');
            }
            
            // 如果dataStore.js中的trees数组可以直接访问，尝试将树添加到其中
            try {
              // 使用import()返回的Promise，而不是使用await
              import('../dataStore.js').then(dataStoreModule => {
                if (dataStoreModule && dataStoreModule.trees && Array.isArray(dataStoreModule.trees)) {
                  const dataStoreTrees = dataStoreModule.trees;
                  const currentIds = new Set(dataStoreTrees.map(t => t.id));
                  
                  let addedCount = 0;
                  for (const tree of responseData.data.trees) {
                    if (!currentIds.has(tree.id)) {
                      dataStoreTrees.push({...tree});
                      currentIds.add(tree.id);
                      addedCount++;
                    }
                  }
                  
                  console.log(`[batchTaskRoutes] 已将 ${addedCount} 棵树木添加到dataStore.js的trees数组中`);
                }
              }).catch(importError => {
                console.error(`[batchTaskRoutes] 导入dataStore.js失败: ${importError.message}`);
              });
            } catch (importError) {
              console.error(`[batchTaskRoutes] 导入dataStore.js失败: ${importError.message}`);
            }
          }
        } else {
          console.warn('响应中缺少任务或树木数据');
          if (!hasTrees && req.body.createTrees !== false) {
            console.error('请求中要求创建树木，但响应中没有树木数据');
          }
        }
      } else {
        console.warn('响应表明操作不成功或缺少数据', responseData);
      }
    } catch (error) {
      console.error('处理批量创建响应数据失败:', error);
    }
    
    // 继续原始的send方法
    return originalSend.call(this, body);
  };
  
  try {
    // 调用原始控制器方法
    console.log('调用批量创建任务和树木控制器...');
    await batchTaskController.createBatchTasksWithTrees(req, res);
    console.log('批量创建任务和树木控制器处理完成');
  } catch (error) {
    console.error('批量创建任务和树木路由处理失败:', error);
    // 如果尚未发送响应，则发送错误响应
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: `批量创建任务和树木失败: ${error.message}`
      });
    }
  }
});

export default router; 