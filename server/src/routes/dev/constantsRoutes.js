/**
 * 常量API路由
 * 提供系统配置常量值的API
 */

import express from 'express';
import { TASK_TYPE_TO_TREE_TYPE_MAPPING } from '../../constants/treeMapping.js';

const router = express.Router();

// 获取任务类型与树木类型的映射关系
router.get('/tree-mappings', (req, res) => {
  try {
    // 提取英文任务类型映射
    const englishTaskTypes = ['NORMAL', 'RECURRING', 'PROJECT', 'LEARNING', 'WORK', 'LEISURE'];
    const mappings = {};
    
    englishTaskTypes.forEach(type => {
      mappings[type] = TASK_TYPE_TO_TREE_TYPE_MAPPING[type];
    });
    
    // 构建所有可用的树木类型列表
    const uniqueTreeTypes = [...new Set(Object.values(TASK_TYPE_TO_TREE_TYPE_MAPPING))];
    const basicTreeTypes = ['OAK', 'PINE', 'WILLOW', 'APPLE', 'MAPLE', 'PALM', 'CHERRY'];
    
    res.status(200).json({
      code: 200,
      data: {
        mappings,
        taskTypes: englishTaskTypes, 
        treeTypes: basicTreeTypes,
        allTreeTypes: uniqueTreeTypes
      },
      message: '获取映射关系成功',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('获取树木映射关系失败:', error);
    res.status(500).json({
      code: 500,
      data: null,
      error: { message: error.message || '获取树木映射关系失败' },
      message: 'Internal Server Error',
      timestamp: Date.now()
    });
  }
});

export default router; 