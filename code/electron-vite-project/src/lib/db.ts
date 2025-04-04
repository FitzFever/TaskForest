import { PrismaClient } from '@prisma/client'

// 全局单例Prisma客户端
let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  // 在开发环境中避免创建多个实例
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient()
  }
  prisma = (global as any).prisma
}

export default prisma

/**
 * 任务相关操作
 */
export const TaskService = {
  // 创建新任务
  async createTask(data: {
    title: string
    description?: string
    status?: string
    priority?: string
    deadline?: Date
    categoryId?: number
  }) {
    return prisma.task.create({
      data,
      include: {
        category: true,
        tree: true,
      },
    })
  },

  // 查询所有任务
  async getAllTasks() {
    return prisma.task.findMany({
      include: {
        category: true,
        tree: true,
      },
    })
  },

  // 查询单个任务
  async getTaskById(id: number) {
    return prisma.task.findUnique({
      where: { id },
      include: {
        category: true,
        tree: true,
      },
    })
  },

  // 更新任务
  async updateTask(id: number, data: {
    title?: string
    description?: string
    status?: string
    priority?: string
    deadline?: Date
    completedAt?: Date
    categoryId?: number
  }) {
    return prisma.task.update({
      where: { id },
      data,
      include: {
        category: true,
        tree: true,
      },
    })
  },

  // 删除任务
  async deleteTask(id: number) {
    return prisma.task.delete({
      where: { id },
    })
  },

  // 完成任务
  async completeTask(id: number) {
    return prisma.task.update({
      where: { id },
      data: {
        status: '已完成',
        completedAt: new Date(),
      },
    })
  },
}

/**
 * 任务分类相关操作
 */
export const CategoryService = {
  // 创建分类
  async createCategory(data: {
    name: string
    color?: string
  }) {
    return prisma.category.create({
      data,
    })
  },

  // 获取所有分类
  async getAllCategories() {
    return prisma.category.findMany({
      include: {
        tasks: true,
      },
    })
  },

  // 获取单个分类
  async getCategoryById(id: number) {
    return prisma.category.findUnique({
      where: { id },
      include: {
        tasks: true,
      },
    })
  },

  // 更新分类
  async updateCategory(id: number, data: {
    name?: string
    color?: string
  }) {
    return prisma.category.update({
      where: { id },
      data,
    })
  },

  // 删除分类
  async deleteCategory(id: number) {
    return prisma.category.delete({
      where: { id },
    })
  },
}

/**
 * 树木相关操作
 */
export const TreeService = {
  // 创建树木
  async createTree(data: {
    type: string
    growthStage?: number
    position?: string
    scale?: string
    rotation?: string
    taskId?: number
  }) {
    return prisma.tree.create({
      data,
    })
  },

  // 获取所有树木
  async getAllTrees() {
    return prisma.tree.findMany({
      include: {
        task: true,
      },
    })
  },

  // 获取单个树木
  async getTreeById(id: number) {
    return prisma.tree.findUnique({
      where: { id },
      include: {
        task: true,
      },
    })
  },

  // 更新树木
  async updateTree(id: number, data: {
    type?: string
    growthStage?: number
    position?: string
    scale?: string
    rotation?: string
  }) {
    return prisma.tree.update({
      where: { id },
      data,
    })
  },

  // 删除树木
  async deleteTree(id: number) {
    return prisma.tree.delete({
      where: { id },
    })
  },

  // 增加生长阶段
  async growTree(id: number) {
    const tree = await prisma.tree.findUnique({
      where: { id },
    })

    if (!tree) {
      throw new Error('树木不存在')
    }

    // 最大生长阶段为5
    const newGrowthStage = Math.min(tree.growthStage + 1, 5)

    return prisma.tree.update({
      where: { id },
      data: {
        growthStage: newGrowthStage,
      },
    })
  },
} 