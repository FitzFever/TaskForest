"use strict";
/**
 * 树木相关类型定义
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TREE_SPECIES = exports.MAX_GROWTH_STAGE = void 0;
// 常量定义
exports.MAX_GROWTH_STAGE = 3; // 最大生长阶段
exports.TREE_SPECIES = {
    OAK: 'OAK', // 橡树 (普通任务)
    PINE: 'PINE', // 松树 (重复任务)
    CHERRY: 'CHERRY', // 樱花树 (重要任务)
    PALM: 'PALM', // 棕榈树 (休闲任务)
    APPLE: 'APPLE', // 苹果树 (学习任务)
    MAPLE: 'MAPLE', // 枫树 (工作任务)
    WILLOW: 'WILLOW', // 柳树 (项目任务)
};
