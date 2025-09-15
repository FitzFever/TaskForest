/**
 * 数据管理相关路由
 * 处理系统数据的维护操作
 */
import express from 'express';
import { cleanupDefaultData } from '../../utils/cleanup.js';

const router = express.Router();

/**
 * 清理默认示例数据
 * @route POST /api/dev/data-management/cleanup-defaults
 */
router.post('/cleanup-defaults', (req, res) => {
  try {
    const result = cleanupDefaultData();
    
    if (result.success) {
      return res.status(200).json({
        code: 200,
        data: {
          treesRemoved: result.treesRemoved,
          tasksRemoved: result.tasksRemoved
        },
        message: result.message,
        timestamp: Date.now()
      });
    } else {
      return res.status(500).json({
        code: 500,
        data: null,
        error: { message: result.message },
        message: '清理默认数据失败',
        timestamp: Date.now()
      });
    }
  } catch (error) {
    console.error('清理默认数据失败:', error);
    return res.status(500).json({
      code: 500,
      data: null,
      error: { message: error.message },
      message: '清理默认数据失败',
      timestamp: Date.now()
    });
  }
});

export default router; 