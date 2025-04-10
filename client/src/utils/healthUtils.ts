/**
 * 健康状态工具函数集
 */
import { HealthCategory } from '../services/treeHealthService';

/**
 * 获取健康状态颜色
 * @param healthState 健康值(0-100)
 * @returns 对应的颜色代码
 */
export const getHealthColor = (healthState: number): string => {
  if (healthState >= 75) return '#52c41a'; // 健康-绿色
  if (healthState >= 50) return '#faad14'; // 轻微枯萎-黄色
  if (healthState >= 25) return '#fa8c16'; // 中度枯萎-橙色
  return '#f5222d'; // 严重枯萎-红色
};

/**
 * 获取健康状态分类名称
 * @param category 健康状态分类
 * @returns 中文名称
 */
export const getHealthCategoryName = (category: HealthCategory): string => {
  switch (category) {
    case HealthCategory.HEALTHY:
      return '健康';
    case HealthCategory.SLIGHTLY_WILTED:
      return '轻微枯萎';
    case HealthCategory.MODERATELY_WILTED:
      return '中度枯萎';
    case HealthCategory.SEVERELY_WILTED:
      return '严重枯萎';
    default:
      return '未知状态';
  }
};

/**
 * 获取健康状态描述
 * @param healthState 健康值(0-100)
 * @returns 状态描述
 */
export const getHealthDescription = (healthState: number): string => {
  if (healthState >= 75) {
    return '树木健康生长，保持良好状态';
  } else if (healthState >= 50) {
    return '树木出现轻微枯萎，需要关注任务进度';
  } else if (healthState >= 25) {
    return '树木显著枯萎，任务严重延期';
  } else {
    return '树木濒临死亡，急需完成任务';
  }
};

/**
 * 从健康值获取健康分类
 * @param healthState 健康值(0-100)
 * @returns 健康分类
 */
export const getHealthCategory = (healthState: number): HealthCategory => {
  if (healthState >= 75) {
    return HealthCategory.HEALTHY;
  } else if (healthState >= 50) {
    return HealthCategory.SLIGHTLY_WILTED;
  } else if (healthState >= 25) {
    return HealthCategory.MODERATELY_WILTED;
  } else {
    return HealthCategory.SEVERELY_WILTED;
  }
}; 