import { prisma } from '../db.js';
/**
 * 获取所有树木
 */
export async function getTrees(req, res) {
    try {
        const trees = await prisma.tree.findMany();
        res.status(200).json(trees);
    }
    catch (error) {
        console.error('获取树木列表失败:', error);
        res.status(500).json({ message: '获取树木列表失败', error });
    }
}
/**
 * 根据ID获取树木
 */
export async function getTreeById(req, res) {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: '无效的树木ID' });
        }
        const tree = await prisma.tree.findUnique({
            where: { id }
        });
        if (!tree) {
            return res.status(404).json({ message: '未找到指定树木' });
        }
        res.status(200).json(tree);
    }
    catch (error) {
        console.error('获取树木详情失败:', error);
        res.status(500).json({ message: '获取树木详情失败', error });
    }
}
/**
 * 创建新树木
 */
export async function createTree(req, res) {
    try {
        const treeData = req.body;
        // 验证请求体数据
        if (!treeData.name || !treeData.species || !treeData.userId) {
            return res.status(400).json({ message: '缺少必要字段: name, species, userId' });
        }
        const { name, species, userId, growthStage = 1, health = 100, completedTasks = 0, lastWatered = new Date() } = treeData;
        const newTree = await prisma.tree.create({
            data: {
                name,
                species,
                userId,
                growthStage,
                health,
                completedTasks,
                lastWatered
            }
        });
        res.status(201).json(newTree);
    }
    catch (error) {
        console.error('创建树木失败:', error);
        res.status(500).json({ message: '创建树木失败', error });
    }
}
/**
 * 更新树木
 */
export async function updateTree(req, res) {
    try {
        const id = parseInt(req.params.id);
        const treeData = req.body;
        if (isNaN(id)) {
            return res.status(400).json({ message: '无效的树木ID' });
        }
        // 先检查树木是否存在
        const existingTree = await prisma.tree.findUnique({
            where: { id }
        });
        if (!existingTree) {
            return res.status(404).json({ message: '未找到指定树木' });
        }
        const updatedTree = await prisma.tree.update({
            where: { id },
            data: treeData
        });
        res.status(200).json(updatedTree);
    }
    catch (error) {
        console.error('更新树木失败:', error);
        res.status(500).json({ message: '更新树木失败', error });
    }
}
/**
 * 删除树木
 */
export async function deleteTree(req, res) {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: '无效的树木ID' });
        }
        // 先检查树木是否存在
        const existingTree = await prisma.tree.findUnique({
            where: { id }
        });
        if (!existingTree) {
            return res.status(404).json({ message: '未找到指定树木' });
        }
        await prisma.tree.delete({
            where: { id }
        });
        res.status(204).send();
    }
    catch (error) {
        console.error('删除树木失败:', error);
        res.status(500).json({ message: '删除树木失败', error });
    }
}
/**
 * 树木生长
 */
export async function growTree(req, res) {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: '无效的树木ID' });
        }
        // 默认任务已完成
        const taskCompleted = req.body.taskCompleted !== false;
        // 先检查树木是否存在
        const tree = await prisma.tree.findUnique({
            where: { id }
        });
        if (!tree) {
            return res.status(404).json({ message: '未找到指定树木' });
        }
        // 计算新的生长状态
        const newGrowthStage = taskCompleted ? Math.min(tree.growthStage + 1, 5) : tree.growthStage;
        const newCompletedTasks = taskCompleted ? tree.completedTasks + 1 : tree.completedTasks;
        // 更新树木
        const updatedTree = await prisma.tree.update({
            where: { id },
            data: {
                growthStage: newGrowthStage,
                completedTasks: newCompletedTasks,
                lastWatered: new Date()
            }
        });
        res.status(200).json({
            tree: updatedTree,
            message: `树木成功生长到第${updatedTree.growthStage}阶段`,
            completedTasks: updatedTree.completedTasks
        });
    }
    catch (error) {
        console.error('树木生长操作失败:', error);
        res.status(500).json({ message: '树木生长操作失败', error });
    }
}
//# sourceMappingURL=treeController.js.map