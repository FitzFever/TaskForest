import { textToTaskService } from '../services/textToTaskService.js';
import logger from '../utils/logger.js';

/**
 * 测试文本到任务转换服务
 */
async function testTextToTask() {
  logger.info('=== 开始测试文本到任务转换服务 ===');

  // 示例文本 - 一段项目需求描述
  const sampleText = `
我们需要实现一个在线学习平台的用户管理模块，包含以下功能：

1. 用户注册与登录：
   - 支持邮箱注册、手机号注册
   - 支持密码登录和验证码登录
   - 实现第三方登录（微信、QQ）
   - 密码安全策略和重置功能

2. 用户个人信息管理：
   - 基本资料（姓名、头像、联系方式）
   - 学习记录和成绩跟踪
   - 学习偏好设置

3. 权限管理：
   - 角色分级（学生、教师、管理员）
   - 功能访问控制
   - 内容可见性控制

4. 用户行为分析：
   - 学习行为数据收集
   - 学习进度跟踪
   - 学习效果分析报告

技术要求：
- 后端采用Node.js，前端使用React
- 数据库使用MongoDB
- 保证数据安全和用户隐私
- 高并发访问支持
- 响应时间不超过200ms
  `;

  try {
    // 测试1: 文本转任务（不创建树）
    logger.info('测试1：从文本生成任务（不创建树）');
    
    const result1 = await textToTaskService.generateTasksFromText({
      text: sampleText,
      createTree: false
    });
    
    if (result1.success) {
      logger.info('从文本生成任务成功：', {
        title: result1.data.analysis.title,
        complexity: result1.data.analysis.complexity,
        subTasksCount: result1.data.tasks.subTasks.length
      });
    } else {
      logger.error('从文本生成任务失败:', result1.error);
      return;
    }
    
    // 测试2: 文本转任务（创建树）
    logger.info('测试2：从文本生成任务（创建树）');
    
    const result2 = await textToTaskService.generateTasksFromText({
      text: sampleText,
      createTree: true,
      treeType: 'PINE'
    });
    
    if (result2.success) {
      logger.info('从文本生成任务并创建树成功：', {
        title: result2.data.analysis.title,
        complexity: result2.data.analysis.complexity,
        subTasksCount: result2.data.tasks.subTasks.length,
        treeType: result2.data.tasks.tree.type
      });
    } else {
      logger.error('从文本生成任务并创建树失败:', result2.error);
    }
    
    logger.info('=== 文本到任务转换服务测试完成 ===');
  } catch (error) {
    logger.error('测试文本到任务转换服务失败：', error);
  }
}

// 执行测试
testTextToTask().catch(error => {
  logger.error('运行测试时发生错误：', error);
  process.exit(1);
}); 