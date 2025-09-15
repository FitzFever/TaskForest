import express from 'express';
import { clearAllData } from '../../dataStore.js';

const router = express.Router();

/**
 * 清空所有数据
 * POST /api/admin/clear-data
 */
router.post('/clear-data', (req, res) => {
  try {
    clearAllData();
    console.log('所有数据已清除');
    return res.json({
      code: 200,
      message: '所有数据已清除',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('清除数据时出错:', error);
    return res.status(500).json({
      code: 500,
      message: '清除数据失败',
      error: error.message,
      timestamp: Date.now()
    });
  }
});

export default router; 