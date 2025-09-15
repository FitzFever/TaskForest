/**
 * 树木模型配置文件
 * 存储树木模型的全局显示参数
 */

// 全局树木缩放比例倍数
// 此数值会影响所有树木的整体显示大小
export const GLOBAL_TREE_SCALE_MULTIPLIER = 1.5;

// 树木基础尺寸配置
export const TREE_BASE_SCALE = {
  // 组件模式：2D Canvas模式下的树木基础尺寸
  COMPONENT: {
    BASE_SCALE: 0.5,        // 基础尺寸
    STAGE_MULTIPLIER: 0.3,  // 每阶段增长系数
  },
  
  // 3D模式：THREE.js中的基础尺寸和缩放系数
  THREE_D: {
    BASE_MULTIPLIER: 1.5,     // 基础倍数
    GROWTH_FACTOR: 0.1,      // 阶段增长因子
    MIN_SCALE_FACTOR: 0.6,   // 最小缩放因子
  }
};

// 不同类型树木的个性化缩放参数
export const TREE_TYPE_SCALE_FACTORS = {
  // 不同树木类型的缩放调整系数
  OAK: 1.0,      // 标准尺寸 (橡树)
  PINE: 1.2,     // 松树略高
  MAPLE: 1.1,    // 枫树略大
  CHERRY: 0.95,  // 樱花树略小
  WILLOW: 1.15,  // 柳树较大
  PALM: 1.05,    // 棕榈树
  APPLE: 0.9     // 苹果树较小
};

// 默认导出配置
export default {
  GLOBAL_TREE_SCALE_MULTIPLIER,
  TREE_BASE_SCALE,
  TREE_TYPE_SCALE_FACTORS
}; 