import { TaskAnalysis, TaskBreakdown } from '../types/AI';

/**
 * 响应解析服务，负责解析AI返回的结果
 */
export class ResponseParserService {
  /**
   * 解析任务分析响应
   */
  parseAnalysisResponse(response: string): TaskAnalysis {
    try {
      // 尝试解析JSON
      const result = JSON.parse(response);
      
      // 验证必要字段
      if (!result.complexity || !result.estimatedHours) {
        throw new Error('AI返回结果缺少必要字段');
      }
      
      // 返回解析结果
      return {
        complexity: result.complexity,
        estimatedHours: result.estimatedHours,
        suggestedDeadline: result.suggestedDeadline,
        recommendedTags: result.recommendedTags || [],
        keyPoints: result.keyPoints || []
      };
    } catch (error) {
      console.error('解析分析结果失败:', error, '原始响应:', response);
      
      // 尝试进行容错处理，提取关键信息
      if (typeof response === 'string') {
        try {
          return this.fallbackParseAnalysis(response);
        } catch (fallbackError) {
          console.error('容错解析失败:', fallbackError);
        }
      }
      
      throw new Error('无法解析AI返回的分析结果');
    }
  }
  
  /**
   * 解析任务拆解响应
   */
  parseBreakdownResponse(response: string): TaskBreakdown {
    try {
      // 尝试解析JSON
      const result = JSON.parse(response);
      
      // 验证必要字段
      if (!result.mainTask || !result.subTasks || !Array.isArray(result.subTasks)) {
        throw new Error('AI返回结果缺少必要字段');
      }
      
      // 确保子任务非空
      if (result.subTasks.length === 0) {
        throw new Error('AI没有返回任何子任务');
      }
      
      // 返回解析结果
      return {
        mainTask: result.mainTask,
        subTasks: result.subTasks
      };
    } catch (error) {
      console.error('解析拆解结果失败:', error, '原始响应:', response);
      throw new Error('无法解析AI返回的拆解结果');
    }
  }
  
  /**
   * 容错解析分析结果（当JSON解析失败时使用）
   */
  private fallbackParseAnalysis(response: string): TaskAnalysis {
    // 尝试找到复杂度
    const complexityMatch = response.match(/复杂度[：:]\s*(LOW|MEDIUM|HIGH|VERY_HIGH)/i);
    const complexity = complexityMatch ? complexityMatch[1].toUpperCase() : 'MEDIUM';
    
    // 尝试找到预估小时数
    const hoursMatch = response.match(/预估[^0-9]*?(\d+)[^0-9]*?小时/);
    const estimatedHours = hoursMatch ? parseInt(hoursMatch[1], 10) : 4;
    
    // 尝试找到截止日期
    const deadlineMatch = response.match(/截止日期[：:]\s*([0-9]{4}-[0-9]{2}-[0-9]{2})/);
    const suggestedDeadline = deadlineMatch ? deadlineMatch[1] + 'T00:00:00Z' : undefined;
    
    // 尝试提取标签和关键点
    const lines = response.split('\n');
    const recommendedTags = [];
    const keyPoints = [];
    
    let inTags = false;
    let inKeyPoints = false;
    
    for (const line of lines) {
      if (line.includes('推荐的标签') || line.includes('建议标签')) {
        inTags = true;
        inKeyPoints = false;
        continue;
      }
      
      if (line.includes('关键点') || line.includes('要点')) {
        inKeyPoints = true;
        inTags = false;
        continue;
      }
      
      if (inTags && line.trim() && !line.includes('：') && !line.includes(':')) {
        const tags = line.split(/[,，、]/);
        for (const tag of tags) {
          const cleanTag = tag.trim().replace(/["""]/g, '');
          if (cleanTag) recommendedTags.push(cleanTag);
        }
      }
      
      if (inKeyPoints && line.trim() && !line.includes('：') && !line.includes(':')) {
        const point = line.trim().replace(/^[0-9]+[\.、\s]+/, '');
        if (point) keyPoints.push(point);
      }
    }
    
    return {
      complexity: complexity as 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH',
      estimatedHours,
      suggestedDeadline,
      recommendedTags: recommendedTags.length ? recommendedTags : ['任务', '项目', '工作'],
      keyPoints: keyPoints.length ? keyPoints : ['完成任务', '注意时间管理', '确保质量']
    };
  }
}

// 导出单例实例
export const responseParserService = new ResponseParserService(); 