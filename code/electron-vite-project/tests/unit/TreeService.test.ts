import TreeService from '../../src/services/TreeService';
import { Tree } from '../../src/types/Tree';

// 重置所有 mock
beforeEach(() => {
  jest.clearAllMocks();
});

describe('TreeService', () => {
  // 模拟树数据
  const mockTree: Tree = {
    id: 1,
    type: 'oak',
    growthStage: 1,
    positionX: 0,
    positionZ: 0,
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01'
  };

  describe('getTrees', () => {
    it('应该从API获取所有树', async () => {
      // @ts-ignore
      window.electron.getTrees = jest.fn().mockImplementation(() => Promise.resolve([mockTree]));
      
      const trees = await TreeService.getTrees();
      
      // @ts-ignore
      expect(window.electron.getTrees).toHaveBeenCalledTimes(1);
      expect(trees).toEqual([mockTree]);
    });

    it('应该在API调用失败时返回空数组', async () => {
      const errorMsg = '获取树失败';
      // @ts-ignore
      window.electron.getTrees = jest.fn().mockImplementation(() => Promise.reject(new Error(errorMsg)));
      
      const trees = await TreeService.getTrees();
      
      // @ts-ignore
      expect(window.electron.getTrees).toHaveBeenCalledTimes(1);
      expect(trees).toEqual([]);
      // 验证错误被记录
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('createTree', () => {
    it('应该创建一棵新树并返回创建的树', async () => {
      // @ts-ignore
      window.electron.createTree = jest.fn().mockImplementation(() => Promise.resolve(mockTree));
      
      const tree = await TreeService.createTree('oak', 1);
      
      // @ts-ignore
      expect(window.electron.createTree).toHaveBeenCalledTimes(1);
      // @ts-ignore
      expect(window.electron.createTree).toHaveBeenCalledWith(expect.objectContaining({
        type: 'oak',
        growthStage: 1,
        taskId: 1
      }));
      expect(tree).toEqual(mockTree);
    });

    it('应该在API调用失败时返回null', async () => {
      const errorMsg = '创建树失败';
      // @ts-ignore
      window.electron.createTree = jest.fn().mockImplementation(() => Promise.reject(new Error(errorMsg)));
      
      const tree = await TreeService.createTree('oak', 1);
      
      // @ts-ignore
      expect(window.electron.createTree).toHaveBeenCalledTimes(1);
      expect(tree).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('growTree', () => {
    it('应该增长树的生长阶段并返回true', async () => {
      // @ts-ignore
      window.electron.growTree = jest.fn().mockImplementation(() => Promise.resolve(true));
      
      const result = await TreeService.growTree(1);
      
      // @ts-ignore
      expect(window.electron.growTree).toHaveBeenCalledTimes(1);
      // @ts-ignore
      expect(window.electron.growTree).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it('应该在API调用失败时返回false', async () => {
      const errorMsg = '增长树失败';
      // @ts-ignore
      window.electron.growTree = jest.fn().mockImplementation(() => Promise.reject(new Error(errorMsg)));
      
      const result = await TreeService.growTree(1);
      
      // @ts-ignore
      expect(window.electron.growTree).toHaveBeenCalledTimes(1);
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('deleteTree', () => {
    it('应该删除树并返回true', async () => {
      // @ts-ignore
      window.electron.deleteTree = jest.fn().mockImplementation(() => Promise.resolve(true));
      
      const result = await TreeService.deleteTree(1);
      
      // @ts-ignore
      expect(window.electron.deleteTree).toHaveBeenCalledTimes(1);
      // @ts-ignore
      expect(window.electron.deleteTree).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it('应该在API调用失败时返回false', async () => {
      const errorMsg = '删除树失败';
      // @ts-ignore
      window.electron.deleteTree = jest.fn().mockImplementation(() => Promise.reject(new Error(errorMsg)));
      
      const result = await TreeService.deleteTree(1);
      
      // @ts-ignore
      expect(window.electron.deleteTree).toHaveBeenCalledTimes(1);
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });
}); 