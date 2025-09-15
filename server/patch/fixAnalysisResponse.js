/**
 * 修复DeepSeek服务中的任务分析响应解析函数
 * 
 * 用于替换 server/src/services/deepseekService.js 中的 parseTaskAnalysisResponse 函数
 */

/**
 * 解析任务分析响应
 * @param {Object} response DeepSeek响应
 * @param {Object} request 原始请求
 * @returns {Object} 任务分析结果
 */
function parseTaskAnalysisResponse(response, request) {
  try {
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('DeepSeek返回内容为空');
    }

    // 记录原始响应内容，辅助调试
    console.log('DeepSeek分析响应原始内容:', content.substring(0, 200) + '...');

    let result;
    try {
      // 尝试解析整个内容为JSON
      result = JSON.parse(content);
    } catch (e) {
      // 如果解析失败，尝试使用正则表达式提取JSON
      const jsonMatch = content.match(/{[\s\S]*}/);
      if (!jsonMatch) {
        throw new Error('无法从DeepSeek响应中提取JSON');
      }
      try {
        result = JSON.parse(jsonMatch[0]);
      } catch (err) {
        console.error('无法解析提取的JSON对象', { match: jsonMatch[0].substring(0, 100) });
        throw new Error('无法解析DeepSeek响应中的JSON');
      }
    }

    console.log('解析后的结果结构:', { 
      resultKeys: Object.keys(result)
    });
    
    // 转换复杂度为大写
    if (result.complexity) {
      result.complexity = result.complexity.toUpperCase();
    }
    
    // 确保请求对象存在，避免undefined错误
    const safeRequest = request || {};
    
    // 准备默认值以确保返回完整的任务分析结果
    return {
      taskId: safeRequest.taskId || 'unknown-task',
      title: safeRequest.title || '',
      description: safeRequest.description || '',
      complexity: result.complexity || 'MEDIUM',
      type: result.type || 'NORMAL',
      priority: result.priority || 'MEDIUM',
      estimatedDays: result.estimatedDays || 7,
      analysis: result.analysis || ''
    };
  } catch (error) {
    console.error('解析任务分析响应失败', { 
      error: error.message, 
      responseContent: response.choices[0]?.message?.content 
    });
    throw new Error(`解析任务分析响应失败: ${error.message}`);
  }
}

// 导出修复函数
module.exports = {
  parseTaskAnalysisResponse
}; 