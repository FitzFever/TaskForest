import { textToTaskService } from '../services/textToTaskService.js';
import logger from '../utils/logger.js';

/**
 * 文本到任务控制器
 * 处理文本分析和任务创建的API请求
 */
class TextToTaskController {
  /**
   * 从文本生成任务
   * @param {Request} req - Express请求对象
   * @param {Response} res - Express响应对象
   */
  async generateTasksFromText(req, res) {
    try {
      const { text, createTree, treeType } = req.body;
      
      if (!text) {
        return res.status(400).json({
          success: false,
          message: '请提供文本内容'
        });
      }
      
      logger.info('收到文本生成任务请求', { 
        textLength: text.length,
        createTree: !!createTree
      });
      
      const result = await textToTaskService.generateTasksFromText({
        text,
        createTree,
        treeType
      });
      
      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: result.message,
          error: result.error
        });
      }
      
      return res.status(201).json({
        success: true,
        message: '成功从文本生成任务',
        data: result.data
      });
    } catch (error) {
      logger.error('从文本生成任务失败', { error: error.message });
      return res.status(500).json({
        success: false,
        message: `从文本生成任务失败: ${error.message}`
      });
    }
  }
}

export const textToTaskController = new TextToTaskController();
export default textToTaskController; 