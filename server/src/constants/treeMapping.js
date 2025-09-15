/**
 * 任务类型到树木类型的映射
 * 用于根据任务类型确定创建什么类型的树木
 */

// 任务类型到树木类型的映射关系
export const TASK_TYPE_TO_TREE_TYPE_MAPPING = {
  // 英文任务类型 (API文档中定义的)
  'NORMAL': 'OAK',           // 普通任务 -> 橡树
  'RECURRING': 'PINE',       // 定期重复任务 -> 松树
  'PROJECT': 'WILLOW',       // 长期项目任务 -> 柳树
  'LEARNING': 'APPLE',       // 学习类任务 -> 苹果树
  'WORK': 'MAPLE',           // 工作类任务 -> 枫树
  'LEISURE': 'PALM',         // 休闲类任务 -> 棕榈树
  
  // 中文任务类型 (兼容现有实现)
  '一般任务': 'OAK',            // 普通橡树
  '学习任务': 'MAPLE',          // 枫树
  '工作任务': 'PINE',           // 松树
  '生活任务': 'CHERRY',         // 樱桃树
  '健身任务': 'WILLOW',         // 柳树
  '研发任务': 'TECH_TREE',      // 科技树
  '创意任务': 'INNOVATION_TREE', // 创新树
  '开发任务': 'CODE_TREE',      // 代码树
  '设计任务': 'DESIGN_TREE',    // 设计树
  '测试任务': 'TEST_TREE',      // 测试树
  '项目任务': 'PROJECT_TREE',   // 项目树
  '紧急任务': 'REDWOOD',        // 红杉树（急迫感）
  '长期任务': 'SEQUOIA',        // 巨杉（长寿）
  '短期任务': 'BAMBOO',         // 竹子（快速生长）
  '团队任务': 'BANYAN',         // 榕树（多支干，团队协作）
  '个人任务': 'PALM',           // 棕榈树（独立）
  '娱乐任务': 'COCONUT'         // 椰子树（休闲）
};

// 任务状态对树木生长的影响
export const TASK_STATUS_TO_TREE_GROWTH = {
  // 英文状态
  'NOT_STARTED': 0,  // 未开始的任务不提供生长点数
  'IN_PROGRESS': 1,  // 进行中的任务每次检查提供1点生长
  'COMPLETED': 3,    // 已完成的任务一次性提供3点生长
  
  // 中文状态
  '未开始': 0,     // 未开始的任务不提供生长点数
  '进行中': 1,     // 进行中的任务每次检查提供1点生长
  '已完成': 3      // 已完成的任务一次性提供3点生长
};

/**
 * 根据任务类型获取默认的树木类型
 * @param {string} taskType - 任务类型
 * @returns {string} 对应的树木类型
 */
export function getDefaultTreeTypeForTask(taskType) {
  return TASK_TYPE_TO_TREE_TYPE_MAPPING[taskType] || 'OAK';
} 

/**
 * 根据任务进度计算树木生长点数
 * @param {string} status - 任务状态
 * @param {number} completionPercentage - 完成百分比（可选）
 * @returns {number} 树木生长点数
 */
export function calculateGrowthPoints(status, completionPercentage = 0) {
  // 基础生长点数，基于任务状态
  const basePoints = TASK_STATUS_TO_TREE_GROWTH[status] || 0;
  
  // 如果任务已完成，额外奖励基于完成百分比
  if ((status === '已完成' || status === 'COMPLETED') && completionPercentage === 100) {
    return basePoints + 2; // 完全完成的任务获得额外奖励
  } else if ((status === '进行中' || status === 'IN_PROGRESS') && completionPercentage > 50) {
    return basePoints + 1; // 超过50%的进行中任务获得额外奖励
  }
  
  return basePoints;
}

// 导出默认对象
export default {
  TASK_TYPE_TO_TREE_TYPE_MAPPING,
  TASK_STATUS_TO_TREE_GROWTH,
  getDefaultTreeTypeForTask,
  calculateGrowthPoints
}; 