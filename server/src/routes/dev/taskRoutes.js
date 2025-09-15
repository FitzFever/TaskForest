/**
 * 任务相关路由
 */
import express from 'express';
import { addTaskToDevData, getTasks, getTask, deleteTaskFromDevData } from '../../controllers/dev/taskController.js';
import * as healthService from '../../services/healthService.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../../utils/logger.js';
import { TASK_TYPE_TO_TREE_TYPE_MAPPING, getDefaultTreeTypeForTask } from '../../constants/treeMapping.js';
import { v4 as uuidv4 } from 'uuid';
import { tasks, trees } from '../../dataStore.js';

const router = express.Router();

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
    
// 存储批量创建的任务和树木
const batchCreatedTasks = [];
const batchCreatedTrees = [];

// 定义添加树木到devData的函数
function addTreeToDevData(tree) {
  try {
    const devDataPath = path.resolve(__dirname, '../../dev/devData.js');
    
    if (!fs.existsSync(devDataPath)) {
      logger.error(`devData.js文件不存在: ${devDataPath}`);
      return false;
    }
    
    // 读取devData.js文件
    let devDataContent = fs.readFileSync(devDataPath, 'utf8');
    
    // 检查是否已经有trees数组
    if (devDataContent.includes('export const trees =')) {
      // 有trees数组，将树木添加到数组末尾
      const treeString = JSON.stringify(tree, null, 2).replace(/"([^"]+)":/g, '$1:');
      const treesEndRegex = /export const trees = \[\s*(?:(?!export const).)*?\s*\];/s;
      
      if (treesEndRegex.test(devDataContent)) {
        // 匹配到trees数组的结束位置
        devDataContent = devDataContent.replace(
          treesEndRegex,
          (match) => match.slice(0, -2) + ',\n  ' + treeString + '\n];'
        );
      } else {
        logger.error('无法在devData.js中找到trees数组');
        return false;
        }
    } else {
      // 没有trees数组，创建一个新的
      const treeString = JSON.stringify(tree, null, 2).replace(/"([^"]+)":/g, '$1:');
      devDataContent += `\n\nexport const trees = [\n  ${treeString}\n];\n`;
    }
    
    // 写回文件
    fs.writeFileSync(devDataPath, devDataContent, 'utf8');
    logger.info(`已将树木 ${tree.id} 添加到devData.js`);
    return true;
  } catch (error) {
    logger.error(`添加树木到devData失败: ${error.message}`);
    return false;
  }
}

// 存储批量创建的数据
function storeBatchCreatedData(tasksData, treesData) {
  try {
    console.log(`开始存储批量创建的数据: ${tasksData?.length || 0}个任务, ${treesData?.length || 0}棵树`);
    
    // 清空数组
    if (tasksData && Array.isArray(tasksData) && tasksData.length > 0) {
      // 添加到批量创建任务数组
      tasksData.forEach(taskGroup => {
        if (taskGroup.mainTask) {
          batchCreatedTasks.push(taskGroup.mainTask);
          
          if (taskGroup.subTasks && Array.isArray(taskGroup.subTasks)) {
            batchCreatedTasks.push(...taskGroup.subTasks);
          }
        }
      });
      
      console.log(`成功将${batchCreatedTasks.length}个任务添加到batchCreatedTasks数组`);
    }
    
    if (treesData && Array.isArray(treesData) && treesData.length > 0) {
      // 添加到批量创建树木数组
      treesData.forEach(tree => {
        batchCreatedTrees.push(tree);
    
        // 添加到devData.js中
        if (typeof global.addTreeToDevData === 'function') {
          global.addTreeToDevData(tree);
        }
      });
      
      console.log(`成功将${treesData.length}棵树添加到batchCreatedTrees数组`);
    }
    
    console.log(`数据存储完成: batchCreatedTasks=${batchCreatedTasks.length}, batchCreatedTrees=${batchCreatedTrees.length}`);
    return true;
  } catch (error) {
    console.error(`存储批量创建的数据失败: ${error.message}`);
    return false;
  }
}

// 将函数添加到全局对象
global.addTreeToDevData = addTreeToDevData;
global.storeBatchCreatedData = storeBatchCreatedData;
global.batchCreatedTasks = batchCreatedTasks;
global.batchCreatedTrees = batchCreatedTrees;

// 导出函数和数组
export { 
  addTreeToDevData, 
  storeBatchCreatedData, 
  batchCreatedTasks, 
  batchCreatedTrees 
};

// 路由定义
router.get('/', getTasks);
router.get('/:id', getTask);
router.post('/', addTaskToDevData);
router.delete('/:id', deleteTaskFromDevData);

// 更新任务进度路由
router.put('/:id/progress', (req, res) => {
  try {
    const taskId = req.params.id;
    const { progress, notes } = req.body;
    
    logger.info(`收到更新任务进度请求: 任务ID=${taskId}, 进度=${progress}`);
    
    if (!taskId) {
      return res.status(400).json({
        code: 400,
        data: null,
        error: { message: '无效的任务ID' },
        message: 'Bad Request',
        timestamp: Date.now()
      });
    }
    
    // 验证进度值
    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
      return res.status(400).json({
        code: 400,
        data: null,
        error: { 
          message: '无效的进度值',
          details: {
            field: 'progress',
            reason: 'out_of_range',
            allowedRange: [0, 100]
          }
        },
        message: 'Bad Request',
        timestamp: Date.now()
      });
    }
    
    const result = healthService.updateTaskProgress(taskId, progress, notes);
    
    if (!result) {
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
      data: result,
      message: '任务进度和树木健康状态更新成功',
      timestamp: Date.now()
    });
  } catch (error) {
    logger.error(`更新任务进度失败: ${error.message}`, { error });
    return res.status(500).json({
      code: 500,
      data: null,
      error: { message: error.message || '更新任务进度失败' },
      message: 'Internal Server Error',
      timestamp: Date.now()
    });
  }
});

// 更新任务状态路由
router.put('/:id/status', (req, res) => {
  try {
    const taskId = req.params.id;
    const { status, notes } = req.body;
    
    logger.info(`收到更新任务状态请求: 任务ID=${taskId}, 状态=${status}`);
    
    if (!taskId) {
      return res.status(400).json({
        code: 400,
        data: null,
        error: { message: '无效的任务ID' },
        message: 'Bad Request',
        timestamp: Date.now()
      });
    }
    
    // 验证状态值
    const validStatuses = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        code: 400,
        data: null,
        error: { 
          message: '无效的状态值',
          details: {
            field: 'status',
            reason: 'invalid_value',
            validValues: validStatuses
          }
        },
        message: 'Bad Request',
        timestamp: Date.now()
      });
    }

    // 查找任务
    let allTasks = [...tasks];
    
    // 获取全局批量创建的任务
    if (global.batchCreatedTasks && Array.isArray(global.batchCreatedTasks)) {
      allTasks = [...allTasks, ...global.batchCreatedTasks];
    }
    
    // 查找任务
    const taskIndex = allTasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
      return res.status(404).json({
        code: 404,
        data: null,
        error: { message: '任务不存在' },
        message: 'Not Found',
        timestamp: Date.now()
      });
    }
    
    // 更新任务状态
    const task = allTasks[taskIndex];
    const oldStatus = task.status;
    task.status = status;
    task.updatedAt = new Date().toISOString();
    
    // 如果状态变为完成，且之前未完成，则设置完成时间
    if (status === 'COMPLETED' && oldStatus !== 'COMPLETED') {
      task.completedAt = new Date().toISOString();
      // 如果进度不是100%，设置为100%
      if (task.progress !== 100) {
        task.progress = 100;
      }
    }
    
    // 如果有备注，更新备注
    if (notes) {
      task.notes = notes;
    }
    
    // 更新树木健康状态
    const tree = trees.find(t => t.taskId === taskId);
    if (tree && status === 'COMPLETED') {
      tree.healthState = 100;
    }
    
    return res.status(200).json({
      code: 200,
      data: {
        task,
        oldStatus,
        newStatus: status
      },
      message: '任务状态更新成功',
      timestamp: Date.now()
    });
  } catch (error) {
    logger.error(`更新任务状态失败: ${error.message}`, { error });
    return res.status(500).json({
      code: 500,
      data: null,
      error: { message: error.message || '更新任务状态失败' },
      message: 'Internal Server Error',
      timestamp: Date.now()
    });
  }
});

export default router; 