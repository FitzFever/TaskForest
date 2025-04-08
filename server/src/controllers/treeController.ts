/**
 * 树木控制器
 * 处理与树木相关的HTTP请求
 */
import { Request, Response } from 'express';
import { CreateTreeDto, UpdateTreeDto } from '../types/tree.js';
import { prisma } from '../db.js';

/**
 * 获取所有树木
 */
export async function getTrees(req: Request, res: Response) {
  try {
    const trees = await prisma.tree.findMany();
    res.status(200).json(trees);
  } catch (error) {
    console.error('获取树木列表失败:', error);
    res.status(500).json({ message: '获取树木列表失败', error });
  }
}

/**
 * 根据ID获取树木
 */
export async function getTreeById(req: Request, res: Response) {
  try {
    const id = req.params.id;
    
    if (!id) {
      return res.status(400).json({ message: '无效的树木ID' });
    }
    
    const tree = await prisma.tree.findUnique({
      where: { id }
    });
    
    if (!tree) {
      return res.status(404).json({ message: '未找到指定树木' });
    }
    
    res.status(200).json(tree);
  } catch (error) {
    console.error('获取树木详情失败:', error);
    res.status(500).json({ message: '获取树木详情失败', error });
  }
}

/**
 * 创建新树木
 */
export async function createTree(req: Request, res: Response) {
  try {
    const treeData: CreateTreeDto = req.body;
    
    // 验证请求体数据
    if (!treeData.species || !treeData.userId) {
      return res.status(400).json({ message: '缺少必要字段: species, userId' });
    }
    
    const { species, userId, stage = 1, healthState = 100, taskId } = treeData;
    
    const newTree = await prisma.tree.create({
      data: {
        type: species,
        userId,
        stage,
        healthState,
        taskId
      }
    });
    
    res.status(201).json(newTree);
  } catch (error) {
    console.error('创建树木失败:', error);
    res.status(500).json({ message: '创建树木失败', error });
  }
}

/**
 * 更新树木
 */
export async function updateTree(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const treeData: UpdateTreeDto = req.body;
    
    if (!id) {
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
      data: {
        type: treeData.species,
        stage: treeData.stage,
        healthState: treeData.healthState,
        lastGrowth: treeData.lastWatered
      }
    });
    
    res.status(200).json(updatedTree);
  } catch (error) {
    console.error('更新树木失败:', error);
    res.status(500).json({ message: '更新树木失败', error });
  }
}

/**
 * 删除树木
 */
export async function deleteTree(req: Request, res: Response) {
  try {
    const id = req.params.id;
    
    if (!id) {
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
  } catch (error) {
    console.error('删除树木失败:', error);
    res.status(500).json({ message: '删除树木失败', error });
  }
}

/**
 * 树木生长
 */
export async function growTree(req: Request, res: Response) {
  try {
    const id = req.params.id;
    
    if (!id) {
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
    const newStage = taskCompleted ? Math.min(tree.stage + 1, 5) : tree.stage;
    
    // 更新树木
    const updatedTree = await prisma.tree.update({
      where: { id },
      data: {
        stage: newStage,
        lastGrowth: new Date()
      }
    });
    
    res.status(200).json({
      tree: updatedTree,
      message: `树木成功生长到第${updatedTree.stage}阶段`,
    });
  } catch (error) {
    console.error('树木生长操作失败:', error);
    res.status(500).json({ message: '树木生长操作失败', error });
  }
} 