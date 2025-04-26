import { create } from 'zustand';
import { Tree, TreeType } from '../types/Tree';
import { persist, devtools } from 'zustand/middleware';

// 树木状态接口
export interface TreeState {
  trees: Tree[];
  selectedTree: Tree | null;
  loading: boolean;
  error: string | null;
  lastUpdated: number; // 添加最后更新时间戳
  
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
  removeTree: (treeId: number | string) => void;
  
  // 选择当前树木
  selectTree: (tree: Tree | null) => void;
  
  // 使树木生长（增加生长阶段）
  growTree: (treeId: number | string, stageIncrement?: number) => void;
  
  // 更新树木健康状态
  updateTreeHealth: (treeId: number | string, healthState: number) => void;
  
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

// 创建带持久化的store
const useTreeStore = create<TreeStore>()(
  persist(
    devtools(
      (set, get) => ({
        // 初始状态
        trees: [],
        selectedTree: null,
        loading: false,
        error: null,
        lastUpdated: Date.now(),
        filters: defaultFilters,
        
        // 操作实现
        setTrees: (trees) => set({ 
          trees,
          lastUpdated: Date.now()
        }),
        
        addTree: (tree) => set((state) => ({ 
          trees: [...state.trees, tree],
          lastUpdated: Date.now()
        })),
        
        updateTree: (updatedTree) => set((state) => {
          console.log(`更新树木状态: ID=${updatedTree.id}`, updatedTree);
          
          return {
            trees: state.trees.map(tree => 
              tree.id === updatedTree.id ? updatedTree : tree
            ),
            selectedTree: state.selectedTree?.id === updatedTree.id 
              ? updatedTree 
              : state.selectedTree,
            lastUpdated: Date.now()
          };
        }),
        
        removeTree: (treeId) => set((state) => ({
          trees: state.trees.filter(tree => tree.id !== treeId),
          selectedTree: state.selectedTree?.id === treeId 
            ? null 
            : state.selectedTree,
          lastUpdated: Date.now()
        })),
        
        selectTree: (tree) => set({ selectedTree: tree }),
        
        growTree: (treeId, stageIncrement = 1) => set((state) => {
          console.log(`树木(${treeId})生长: +${stageIncrement}阶段`);
          
          return {
            trees: state.trees.map(tree => 
              tree.id === treeId 
                ? { ...tree, growthStage: Math.min(5, tree.growthStage + stageIncrement) } 
                : tree
            ),
            selectedTree: state.selectedTree?.id === treeId 
              ? { ...state.selectedTree, growthStage: Math.min(5, state.selectedTree.growthStage + stageIncrement) } 
              : state.selectedTree,
            lastUpdated: Date.now()
          };
        }),
        
        updateTreeHealth: (treeId, healthState) => set((state) => {
          console.log(`更新树木(${treeId})健康状态: ${healthState}`);
          
          return {
            trees: state.trees.map(tree => 
              tree.id === treeId 
                ? { ...tree, healthState } 
                : tree
            ),
            selectedTree: state.selectedTree?.id === treeId 
              ? { ...state.selectedTree, healthState } 
              : state.selectedTree,
            lastUpdated: Date.now()
          };
        }),
        
        setLoading: (loading) => set({ loading }),
        
        setError: (error) => set({ error }),
        
        setFilter: (filterType, value) => set((state) => ({
          filters: {
            ...state.filters,
            [filterType]: value
          }
        })),
        
        clearFilters: () => set({ filters: defaultFilters }),
      }),
      { name: 'tree-store' }
    ),
    {
      name: 'taskforest-tree-storage', // 存储在localStorage中的键名
      partialize: (state) => ({
        trees: state.trees,
        lastUpdated: state.lastUpdated,
      }), // 只持久化部分状态
    }
  )
);

export default useTreeStore; 