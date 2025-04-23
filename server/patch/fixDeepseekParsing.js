/**
 * 修复DeepSeek服务中的任务拆解响应解析函数
 * 
 * 用于替换 server/src/services/deepseekService.js 中的 parseTaskDecompositionResponse 函数
 */

/**
 * 解析任务拆解响应
 * @param {Object} response DeepSeek响应 
 * @returns {Array} 子任务列表
 */
function parseTaskDecompositionResponse(response) {
  try {
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('DeepSeek返回内容为空');
    }

    // 记录原始响应内容，辅助调试
    console.log('DeepSeek原始响应:', content.substring(0, 200) + '...');

    let result;
    try {
      // 尝试解析整个内容为JSON
      result = JSON.parse(content);
    } catch (e) {
      // 如果解析失败，尝试使用正则表达式提取JSON
      let jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        // 找到数组格式的JSON
        try {
          result = JSON.parse(jsonMatch[0]);
        } catch (err) {
          console.error('无法解析提取的JSON数组', { match: jsonMatch[0].substring(0, 100) });
        }
      } 
      
      if (!jsonMatch || !result) {
        // 尝试查找对象格式的JSON
        jsonMatch = content.match(/{[\s\S]*}/);
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
    }

    console.log('解析后的结果结构:', { 
      isArray: Array.isArray(result),
      hasSubTasks: result.subTasks ? true : false,
      hasSubtasks: result.subtasks ? true : false,
      resultKeys: Object.keys(result)
    });
    
    // 处理不同的返回格式
    let subTasksArray;
    
    if (Array.isArray(result)) {
      // 直接是数组格式
      subTasksArray = result;
    } else if (typeof result === 'object') {
      // 对象格式，尝试提取子任务数组
      if (result.subTasks && Array.isArray(result.subTasks)) {
        subTasksArray = result.subTasks;
      } else if (result.subtasks && Array.isArray(result.subtasks)) {
        subTasksArray = result.subtasks;
      } else if (result.sub_tasks && Array.isArray(result.sub_tasks)) {
        subTasksArray = result.sub_tasks;
      } else {
        // 检查是否有任何数组类型的属性
        const arrayProps = Object.entries(result)
          .filter(([_, value]) => Array.isArray(value))
          .map(([key, value]) => ({ key, length: value.length }));
        
        if (arrayProps.length > 0) {
          // 使用找到的第一个数组属性
          const firstArrayProp = arrayProps[0];
          console.log(`使用找到的数组属性: ${firstArrayProp.key}，长度: ${firstArrayProp.length}`);
          subTasksArray = result[firstArrayProp.key];
        } else {
          console.error('DeepSeek返回的结构中没有数组类型的属性', { result: JSON.stringify(result).substring(0, 200) });
          throw new Error('DeepSeek返回的子任务不是数组格式');
        }
      }
    } else {
      console.error('DeepSeek返回的结果既不是对象也不是数组', { resultType: typeof result });
      throw new Error('DeepSeek返回了无效的结果格式');
    }
    
    if (!subTasksArray || !Array.isArray(subTasksArray) || subTasksArray.length === 0) {
      console.error('无法提取有效的子任务数组', { subTasksArray });
      throw new Error('无法提取有效的子任务数组');
    }
    
    console.log(`成功提取子任务数组，共${subTasksArray.length}个子任务`);
    
    // 处理和规范化子任务
    return subTasksArray.map((subTask, index) => {
      if (!subTask.title) {
        subTask.title = `子任务${index + 1}`;
      }
      if (!subTask.description) {
        subTask.description = `${subTask.title}的详细实现`;
      }
      if (!subTask.estimatedHours || typeof subTask.estimatedHours !== 'number') {
        subTask.estimatedHours = 1;
      }
      return subTask;
    });
  } catch (error) {
    console.error('解析任务拆解响应失败', { 
      error: error.message, 
      responseContent: response.choices[0]?.message?.content 
    });
    throw new Error(`解析任务拆解响应失败: ${error.message}`);
  }
}

// 导出修复函数
module.exports = {
  parseTaskDecompositionResponse
}; 