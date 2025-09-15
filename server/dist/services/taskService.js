/**
 * 任务服务
 * 负责实现任务相关的业务逻辑
 */
import { PrismaClient } from '@prisma/client';
// 创建Prisma客户端实例
const prisma = new PrismaClient();
/**
 * 获取任务列表
 * @param filter 过滤条件
 * @returns 任务列表和分页信息
 */
const getTasks = async (filter) => {
    const { status, type, dueDate, tags, page = 1, limit = 20, sort = 'dueDate', order = 'asc' } = filter;
    // 构建查询条件
    let where = {};
    // 添加状态过滤
    if (status) {
        where.status = status;
    }
    // 添加类型过滤
    if (type) {
        where.type = type;
    }
    // 添加截止日期过滤
    if (dueDate) {
        // 假设dueDate是一个ISO日期字符串
        const date = new Date(dueDate);
        const nextDay = new Date(date);
        nextDay.setDate(date.getDate() + 1);
        where.dueDate = {
            gte: date,
            lt: nextDay,
        };
    }
    // 添加标签过滤
    if (tags && tags.length > 0) {
        // 使用contains来检查标签 (因为我们用逗号分隔存储标签)
        const tagConditions = tags.map(tag => ({
            tags: { contains: tag }
        }));
        where.OR = tagConditions;
    }
    // 计算分页
    const skip = (page - 1) * limit;
    // 排序配置
    const orderBy = {};
    orderBy[sort] = order;
    // 获取总记录数
    const total = await prisma.task.count({ where });
    // 获取分页数据
    const tasks = await prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
            tree: {
                select: {
                    type: true,
                    stage: true,
                },
            },
        },
    });
    // 计算总页数
    const pages = Math.ceil(total / limit);
    return {
        tasks,
        pagination: {
            total,
            page,
            limit,
            pages,
        },
    };
};
/**
 * 根据ID获取任务
 * @param id 任务ID
 * @returns 任务详情，包括子任务
 */
const getTaskById = async (id) => {
    return prisma.task.findUnique({
        where: { id },
        include: {
            children: true,
            tree: true,
        },
    });
};
/**
 * 创建任务
 * @param taskData 任务数据
 * @returns 创建的任务
 */
const createTask = async (taskData) => {
    const task = await prisma.task.create({ data: taskData });
    // 如果需要，可以在此创建关联的树木
    if (task.treeType) {
        await prisma.tree.create({
            data: {
                type: task.treeType,
                task: {
                    connect: { id: task.id },
                },
                positionX: Math.random() * 20 - 10, // 随机位置
                positionY: 0,
                positionZ: Math.random() * 20 - 10, // 随机位置
                rotationY: Math.random() * Math.PI * 2, // 随机旋转
            },
        });
    }
    return task;
};
/**
 * 更新任务
 * @param id 任务ID
 * @param taskData 更新的字段
 * @returns 更新后的任务
 */
const updateTask = async (id, taskData) => {
    return prisma.task.update({
        where: { id },
        data: taskData,
        include: {
            tree: true,
        },
    });
};
/**
 * 删除任务
 * @param id 任务ID
 */
const deleteTask = async (id) => {
    // 检查是否有子任务
    const childrenCount = await prisma.task.count({
        where: { parentId: id },
    });
    if (childrenCount > 0) {
        // 如果有子任务，先将它们的parentId设为null
        await prisma.task.updateMany({
            where: { parentId: id },
            data: { parentId: null },
        });
    }
    // 删除任务（会级联删除关联的树木）
    await prisma.task.delete({
        where: { id },
    });
};
/**
 * 更新任务状态
 * @param id 任务ID
 * @param status 新状态
 * @returns 更新结果
 */
const updateTaskStatus = async (id, status) => {
    // 如果状态是已完成，则设置completedAt字段
    const completedAt = status === 'COMPLETED' ? new Date() : null;
    const updatedTask = await prisma.task.update({
        where: { id },
        data: {
            status,
            completedAt,
        },
        select: {
            id: true,
            status: true,
            updatedAt: true,
        },
    });
    return updatedTask;
};
/**
 * 完成任务
 * @param id 任务ID
 * @returns 完成结果
 */
const completeTask = async (id) => {
    // 先获取任务信息
    const task = await prisma.task.findUnique({
        where: { id },
        include: {
            tree: true,
        },
    });
    if (!task) {
        throw new Error('任务不存在');
    }
    // 更新任务为已完成状态
    const now = new Date();
    const updatedTask = await prisma.task.update({
        where: { id },
        data: {
            status: 'COMPLETED',
            completedAt: now,
        },
    });
    // 更新关联的树木到最终成长阶段
    let growthStage = 0;
    if (task.tree) {
        const updatedTree = await prisma.tree.update({
            where: { id: task.tree.id },
            data: {
                stage: 4, // 假设4是最终成长阶段
                lastGrowth: now,
            },
        });
        growthStage = updatedTree.stage;
    }
    return {
        id: updatedTask.id,
        status: updatedTask.status,
        completedAt: updatedTask.completedAt,
        updatedAt: updatedTask.updatedAt,
        growthStage,
    };
};
export default {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    completeTask,
};
//# sourceMappingURL=taskService.js.map