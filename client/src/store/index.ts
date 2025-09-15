// 导出所有store模块
export { default as useTaskStore } from './taskStore';
export { default as useTreeStore } from './treeStore';
export { default as useSettingsStore } from './settingsStore';
export { default as useApiStore } from './apiStore';

// 后续可以在这里添加更多的store模块，如：
// export { default as useUserStore } from './userStore';
// export { default as useAppStore } from './appStore';

/**
 * 使用示例：
 * 
 * import { useTaskStore, useTreeStore, useSettingsStore, useApiStore } from '../store';
 * 
 * function MyComponent() {
 *   // 从taskStore获取状态和方法
 *   const { tasks, addTask } = useTaskStore();
 *   
 *   // 从treeStore获取状态和方法
 *   const { trees, growTree } = useTreeStore();
 *   
 *   // 从settingsStore获取状态和方法
 *   const { settings, setTheme } = useSettingsStore();
 *   
 *   // 从apiStore获取状态和方法
 *   const { get, post, requests } = useApiStore();
 * 
 *   // 示例：获取任务列表
 *   useEffect(() => {
 *     // 通过apiStore发送请求
 *     get('/tasks')
 *       .then(data => {
 *         // 通过taskStore更新状态
 *         setTasks(data.tasks);
 *       })
 *       .catch(error => {
 *         console.error('获取任务失败:', error);
 *       });
 *   }, []);
 * 
 *   // ...
 * }
 */ 