import { db } from '../database';
// 模拟任务和树木服务
import { taskService } from './taskService';
import { treeService } from './treeService';
/**
 * 批量任务创建服务，处理主任务和子任务的创建
 */
export class BatchTaskCreationService {
    /**
     * 批量创建任务和树木
     * @param breakdown 任务拆解结果
     * @param createTrees 是否创建树木
     */
    async createBatchTasks(breakdown, createTrees = true) {
        console.log('开始创建任务批量:', breakdown.mainTask.title);
        return await db.transaction(async (trx) => {
            // 1. 创建主任务
            const mainTask = await taskService.createTask(breakdown.mainTask, trx);
            // 2. 创建子任务并关联到主任务
            const subTasks = await Promise.all(breakdown.subTasks.map(subTask => taskService.createTask({
                ...subTask,
                parentTaskId: mainTask.id
            }, trx)));
            // 将子任务ID关联到主任务
            const subTaskIds = subTasks.map(task => task.id);
            await taskService.updateTask(mainTask.id, {
                ...mainTask,
                subTaskIds,
                hasSubTasks: true,
                subTaskCount: subTaskIds.length
            }, trx);
            // 3. 如果需要，创建树木
            let mainTree;
            let subTrees = [];
            if (createTrees) {
                // 创建主树
                mainTree = await treeService.createTree({
                    taskId: mainTask.id,
                    type: this.mapTaskTypeToTreeType(mainTask.type),
                    stage: 0,
                    position: { x: 0, y: 0, z: 0 },
                    healthState: 100
                }, trx);
                // 创建子树并关联到主树
                subTrees = await Promise.all(subTasks.map((subTask, index) => treeService.createTree({
                    taskId: subTask.id,
                    type: this.mapTaskTypeToTreeType(subTask.type),
                    stage: 0,
                    position: this.calculatePosition(index, subTasks.length),
                    healthState: 100,
                    parentTreeId: mainTree.id
                }, trx)));
                // 将子树ID关联到主树
                const subTreeIds = subTrees.map(tree => tree.id);
                await treeService.updateTree(mainTree.id, {
                    ...mainTree,
                    subTreeIds
                }, trx);
            }
            // 4. 返回创建结果
            return {
                mainTask: {
                    ...mainTask,
                    subTaskIds,
                    hasSubTasks: true,
                    subTaskCount: subTaskIds.length
                },
                subTasks,
                trees: {
                    mainTree,
                    subTrees
                }
            };
        });
    }
    /**
     * 映射任务类型到树木类型
     */
    mapTaskTypeToTreeType(taskType) {
        const typeMapping = {
            'NORMAL': 'OAK',
            'WORK': 'MAPLE',
            'LEARNING': 'APPLE',
            'PROJECT': 'WILLOW',
            'LEISURE': 'PALM'
        };
        return typeMapping[taskType] || 'OAK';
    }
    /**
     * 计算子树位置
     */
    calculatePosition(index, total) {
        // 将子树排列在主树周围的圆形中
        const radius = 3; // 圆半径
        const angle = (index / total) * Math.PI * 2;
        return {
            x: Math.cos(angle) * radius,
            y: 0,
            z: Math.sin(angle) * radius
        };
    }
}
// 导出单例实例
export const batchTaskCreationService = new BatchTaskCreationService();
//# sourceMappingURL=batchTaskCreationService.js.map