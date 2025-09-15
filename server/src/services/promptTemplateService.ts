import { TaskInfo } from '../types/AI';

/**
 * 提示模板服务，负责生成任务分析和拆解的提示词
 */
export class PromptTemplateService {
  /**
   * 生成任务分析提示词
   */
  generateAnalysisPrompt(taskInfo: TaskInfo): string {
    return `
您是TaskForest应用的AI助手，专门帮助用户分析和拆解任务。请基于以下任务信息进行分析：

任务描述：${taskInfo.description}
任务类型：${taskInfo.type || '未指定'}
截止日期：${taskInfo.dueDate || '未设置'}
${taskInfo.priority ? `优先级：${taskInfo.priority}` : ''}

请提供以下分析：
1. 任务复杂度（LOW/MEDIUM/HIGH/VERY_HIGH）
2. 预估完成所需小时数
3. 建议的截止日期（如果用户未提供）
4. 推荐的任务标签（3-5个）
5. 关键点（任务需要关注的要点，5-7条）

请返回JSON格式，结构如下：
{
  "complexity": "MEDIUM",
  "estimatedHours": 8,
  "suggestedDeadline": "2023-08-10T00:00:00Z",
  "recommendedTags": ["标签1", "标签2", "标签3"],
  "keyPoints": ["关键点1", "关键点2", "关键点3", "关键点4", "关键点5"]
}

请确保返回的是有效的JSON格式，且所有字段都包含合理的值。
`;
  }
  
  /**
   * 生成任务拆解提示词
   */
  generateBreakdownPrompt(taskInfo: TaskInfo): string {
    return `
您是TaskForest应用的AI助手，专门帮助用户拆解复杂任务。请基于以下任务信息进行拆解：

任务描述：${taskInfo.description}
任务类型：${taskInfo.type || '未指定'}
任务优先级：${taskInfo.priority || '未指定'}
截止日期：${taskInfo.dueDate || '未设置'}
${taskInfo.tags?.length ? `标签：${taskInfo.tags.join(', ')}` : ''}

请将此任务拆解为4-6个子任务，每个子任务包含：
1. 标题（简洁明了）
2. 描述（具体任务内容）
3. 任务类型（与主任务相关的合适类型）
4. 优先级（1-4，1为最高）
5. 建议截止日期（晚于当前日期，早于主任务截止日期）
6. 预估所需小时数
7. 建议标签（2-3个）

请以JSON格式返回，结构如下：
{
  "mainTask": {
    "title": "${taskInfo.title || '原始任务的提炼标题'}",
    "description": "${taskInfo.description}",
    "type": "${taskInfo.type || 'PROJECT'}",
    "priority": ${taskInfo.priority || 1},
    "dueDate": "${taskInfo.dueDate || '建议的截止日期'}",
    "tags": ["建议标签1", "建议标签2"]
  },
  "subTasks": [
    {
      "title": "子任务1标题",
      "description": "子任务1详细描述",
      "type": "适合的任务类型",
      "priority": 优先级,
      "dueDate": "建议截止日期",
      "estimatedHours": 预估小时数,
      "suggestedTags": ["标签1", "标签2"]
    }
    // 更多子任务...
  ]
}

请注意：
- 子任务应该是逻辑上独立的步骤
- 子任务截止日期应该合理安排，考虑任务依赖关系
- 子任务类型应从以下选择：NORMAL, WORK, LEARNING, PROJECT, LEISURE
- 请确保返回的是有效的JSON格式

请提供详细且实用的拆解，帮助用户更有效地完成任务。
`;
  }
}

// 导出单例实例
export const promptTemplateService = new PromptTemplateService(); 