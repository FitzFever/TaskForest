import { create } from 'zustand';
import { Tree, TreeType } from '../types/Tree';

// 树木状态接口
export interface TreeState {
  trees: Tree[];
  selectedTree: Tree | null;
  loading: boolean;
  error: string | null;
  
  // 筛选相关状态
  filters: {
    type: TreeType | null;
    minGrowthStage: number | null;
    search: string;
  };
}

// 树木操作接口
interface TreeActions {
  // 设置树木列表
  setTrees: (trees: Tree[]) => void;
  
  // 添加新树木
  addTree: (tree: Tree) => void;
  
  // 更新树木
  updateTree: (updatedTree: Tree) => void;
  
  // 删除树木
  removeTree: (treeId: number) => void;
  
  // 选择当前树木
  selectTree: (tree: Tree | null) => void;
  
  // 使树木生长（增加生长阶段）
  growTree: (treeId: number, stageIncrement?: number) => void;
  
  // 设置加载状态
  setLoading: (loading: boolean) => void;
  
  // 设置错误信息
  setError: (error: string | null) => void;
  
  // 设置筛选条件
  setFilter: (filterType: 'type' | 'minGrowthStage' | 'search', value: any) => void;
  
  // 清除筛选条件
  clearFilters: () => void;
}

// 组合树木状态和操作
export type TreeStore = TreeState & TreeActions;

// 默认筛选设置
const defaultFilters = {
  type: null,
  minGrowthStage: null,
  search: '',
};

// 创建store
const useTreeStore = create<TreeStore>((set) => ({
  // 初始状态
  trees: [],
  selectedTree: null,
  loading: false,
  error: null,
  filters: defaultFilters,
  
  // 操作实现
  setTrees: (trees) => set({ trees }),
  
  addTree: (tree) => set((state) => ({ 
    trees: [...state.trees, tree] 
  })),
  
  updateTree: (updatedTree) => set((state) => ({
    trees: state.trees.map(tree => 
      tree.id === updatedTree.id ? updatedTree : tree
    ),
    selectedTree: state.selectedTree?.id === updatedTree.id 
      ? updatedTree 
      : state.selectedTree
  })),
  
  removeTree: (treeId) => set((state) => ({
    trees: state.trees.filter(tree => tree.id !== treeId),
    selectedTree: state.selectedTree?.id === treeId 
      ? null 
      : state.selectedTree
  })),
  
  selectTree: (tree) => set({ selectedTree: tree }),
  
  growTree: (treeId, stageIncrement = 1) => set((state) => ({
    trees: state.trees.map(tree => 
      tree.id === treeId 
        ? { ...tree, growthStage: Math.min(5, tree.growthStage + stageIncrement) } 
        : tree
    ),
    selectedTree: state.selectedTree?.id === treeId 
      ? { ...state.selectedTree, growthStage: Math.min(5, state.selectedTree.growthStage + stageIncrement) } 
      : state.selectedTree
  })),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  setFilter: (filterType, value) => set((state) => ({
    filters: {
      ...state.filters,
      [filterType]: value
    }
  })),
  
  clearFilters: () => set({ filters: defaultFilters }),
}));

export default useTreeStore; 