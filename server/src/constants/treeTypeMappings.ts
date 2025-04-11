/**
 * 任务类型与树木类型的映射关系常量
 * 定义不同任务类型对应的默认树木类型
 */

// 定义任务类型
export type TaskType = 'NORMAL' | 'RECURRING' | 'PROJECT' | 'LEARNING' | 'WORK' | 'LEISURE';

// 定义树木类型
export type TreeType = 'OAK' | 'PINE' | 'CHERRY' | 'MAPLE' | 'PALM' | 'APPLE' | 'WILLOW';

// 任务类型与树木类型映射
export const TASK_TYPE_TO_TREE_TYPE_MAPPING: Record<TaskType, TreeType> = {
  'NORMAL': 'OAK',      // 普通日常任务 -> 橡树
  'RECURRING': 'PINE',  // 定期重复任务 -> 松树
  'PROJECT': 'WILLOW',  // 长期项目任务 -> 柳树
  'LEARNING': 'APPLE',  // 学习类任务 -> 苹果树
  'WORK': 'MAPLE',      // 工作类任务 -> 枫树
  'LEISURE': 'PALM',    // 休闲类任务 -> 棕榈树
};

/**
 * 根据任务类型获取默认的树木类型
 * @param taskType 任务类型
 * @returns 对应的树木类型
 */
export function getDefaultTreeTypeForTask(taskType: string): TreeType {
  return TASK_TYPE_TO_TREE_TYPE_MAPPING[taskType as TaskType] || 'OAK';
} 