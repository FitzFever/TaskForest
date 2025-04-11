import React, { useState, useEffect } from 'react';
import { Card, Button, Spin, message, Tooltip, Drawer, Empty, Divider, List, Tag, Row, Col, Space } from 'antd';
import { PlusOutlined, ZoomInOutlined, ZoomOutOutlined, SyncOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import ForestScene, { TreeData } from '../three/ForestScene';
import TreeHealthPanel from '../components/TreeHealthPanel';
import { TreeType } from '../types/Tree';
import { TaskStatus, Task } from '../types/Task';
import { modelLoader } from '../three/ModelLoader';
import * as taskService from '../services/taskService';
import * as treeHealthService from '../services/treeHealthService';
import api from '../services/api';

// 自定义事件名称定义
export const TASK_UPDATE_EVENT = 'taskforest_task_updated';

/**
 * 森林页面组件
 * 展示森林场景和交互控制
 */
const ForestPage: React.FC = () => {
  const [trees, setTrees] = useState<TreeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedTreeId, setSelectedTreeId] = useState<number | string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [healthPanelVisible, setHealthPanelVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTaskTitle, setSelectedTaskTitle] = useState<string>('');
  // 任务映射，存储任务ID与任务对象的关系
  const [tasksMap, setTasksMap] = useState<{[key: string]: Task}>({});
  
  // 加载树木数据函数 - 提取为独立函数以便复用
  const loadTrees = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      
      // 预加载模型 - 添加更多详细的日志和错误处理
      try {
        console.log('预加载树木模型...');
        await modelLoader.preloadCommonModels();
        console.log('模型预加载完成');

        // 验证模型文件是否可访问
        console.log('验证模型文件是否可访问...');
        const testModelUrl = '/models/trees/oak_mature.glb';
        const response = await fetch(testModelUrl, { method: 'HEAD' });
        console.log(`模型文件访问测试: ${testModelUrl} - ${response.ok ? '成功' : '失败'} (${response.status})`);
        
        if (!response.ok) {
          throw new Error(`无法访问模型文件: ${testModelUrl}, 状态码: ${response.status}`);
        }
      } catch (error) {
        console.error('模型预加载或检查失败:', error);
        // 不抛出异常，继续尝试加载树木数据
      }
      
      // 打印API基础URL，帮助调试
      console.log('森林页面: API基础URL:', api.defaults.baseURL);
      
      // 使用API服务获取树木数据
      console.log('森林页面: 开始获取树木数据...');
      const treeResponse = await api.get('/trees');
      console.log('森林页面: 获取树木数据成功:', treeResponse);
      
      // 确保使用正确的数据结构
      const treeData = treeResponse.data;
      
      console.log('森林页面: 树木响应结构:', treeData); // 调试日志
      
      // 用于从多种可能的数据格式中提取树木数据的函数
      const extractTreesArray = (data: any): any[] => {
        console.log('尝试提取树木数组，数据结构:', JSON.stringify(data, null, 2));
        
        // 尝试多种可能的数据路径
        if (data && data.data && Array.isArray(data.data.trees)) {
          console.log('找到标准格式数据: { data: { trees: [...] } }，树木数量:', data.data.trees.length);
          return data.data.trees; // 标准格式: { data: { trees: [...] } }
        }
        if (data && Array.isArray(data.trees)) {
          console.log('找到简化格式数据: { trees: [...] }，树木数量:', data.trees.length);
          return data.trees; // 简化格式: { trees: [...] }
        }
        if (data && Array.isArray(data.data)) {
          console.log('找到另一种格式数据: { data: [...] }，树木数量:', data.data.length);
          return data.data; // 另一种格式: { data: [...] }
        }
        if (data && data.data && data.data.data && Array.isArray(data.data.data.trees)) {
          console.log('找到嵌套格式数据: { data: { data: { trees: [...] } } }，树木数量:', data.data.data.trees.length);
          return data.data.data.trees; // 嵌套格式: { data: { data: { trees: [...] } } }
        }
        if (Array.isArray(data)) {
          console.log('找到直接数组格式数据: [...]，树木数量:', data.length);
          return data; // 直接数组格式: [...]
        }
        
        console.warn('无法识别的树木数据格式:', data);
        
        // 在控制台详细显示数据结构，帮助调试
        if (data) {
          console.log('尝试直接分析响应结构:');
          Object.keys(data).forEach(key => {
            console.log(`- 键: ${key}, 类型: ${typeof data[key]}, 值:`, JSON.stringify(data[key]).substring(0, 100));
          });
        }
        
        return [];
      };
      
      const treesArray = extractTreesArray(treeData);
      console.log('提取的树木数组详细信息:');
      treesArray.forEach((tree, index) => {
        console.log(`Tree ${index+1}:`, JSON.stringify(tree, null, 2));
      });
      
      if (treesArray && treesArray.length > 0) {
        // 获取所有任务以验证树木关联
        try {
          console.log('获取任务数据以验证树木关联');
          const taskResponse = await taskService.getTasks();
          console.log('任务响应:', taskResponse);
          
          let validTaskIds: string[] = [];
          let taskMap: {[key: string]: Task} = {};
          
          // 更健壮的任务ID提取和构建任务映射
          if (taskResponse && taskResponse.data) {
            // 尝试多种可能的数据结构
            let tasksArray: any[] = [];
            
            if (taskResponse.data.data && Array.isArray(taskResponse.data.data.tasks)) {
              tasksArray = taskResponse.data.data.tasks;
            } else if (taskResponse.data && Array.isArray(taskResponse.data.tasks)) {
              tasksArray = taskResponse.data.tasks;
            } else if (Array.isArray(taskResponse.data)) {
              tasksArray = taskResponse.data;
            }
            
            // 提取有效任务ID并构建任务映射
            validTaskIds = tasksArray.map(task => task.id.toString());
            
            // 构建任务ID到任务对象的映射
            tasksArray.forEach(task => {
              const taskId = task.id.toString();
              taskMap[taskId] = {
                id: task.id,
                title: task.title,
                type: task.type || 'NORMAL',
                status: task.status,
                priority: task.priority || 0,
                completed: task.status === 'COMPLETED' || task.completed,
                completedAt: task.completedAt,
                createdAt: task.createdAt,
                updatedAt: task.updatedAt
              };
            });
            
            // 保存任务映射到状态
            setTasksMap(taskMap);
            console.log('构建任务映射，包含任务数量:', Object.keys(taskMap).length);
          }
          
          console.log('森林页面: 有效任务IDs:', validTaskIds);
          
          // 将API返回的树木数据转换为组件所需格式，过滤掉无效任务关联的树木
          const formattedTrees = treesArray
            .map((tree, index) => {
              console.log(`处理树木: ID=${tree.id}, 类型=${tree.type}, 位置=`, tree.position);
              
              // 确保position和rotation是有效的对象
              const position = tree.position || { x: 0, y: 0, z: 0 };
              const rotation = tree.rotation || { x: 0, y: 0, z: 0 };
              
              // 为无效位置生成随机位置，确保每棵树位置不同
              let positionArray: [number, number, number];
              
              // 使用树木ID作为随机种子，确保每次相同的树生成相同的偏移
              const getStableRandomOffset = (id: string | number, max: number = 1.5): number => {
                // 将ID转换为数字并使用作为随机种子
                const numericId = typeof id === 'string' ? 
                  id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : id;
                const normalizedValue = (numericId % 1000) / 1000; // 将数值归一化到 0-1 之间
                return (normalizedValue * max * 2) - max; // 转换到 -max 到 +max 之间
              };
              
              if (position && typeof position.x === 'number' && typeof position.z === 'number') {
                // 使用API提供的位置
                positionArray = [position.x, position.y || 0, position.z];
                
                // 使用基于ID的稳定偏移，而不是随机偏移
                if (tree.id) {
                  positionArray = [
                    positionArray[0] + getStableRandomOffset(tree.id, 1.0),
                    positionArray[1],
                    positionArray[2] + getStableRandomOffset(tree.id + '_z', 1.0)
                  ];
                }
                
                console.log(`使用API提供的位置并添加稳定偏移: [${positionArray.join(', ')}]`);
              } else if (tree.positionX !== undefined && tree.positionZ !== undefined) {
                // 兼容positionX/positionZ格式
                positionArray = [
                  tree.positionX + (tree.id ? getStableRandomOffset(tree.id, 1.0) : 0),
                  0,
                  tree.positionZ + (tree.id ? getStableRandomOffset(tree.id + '_z', 1.0) : 0)
                ];
                console.log(`使用positionX/Z格式的位置并添加稳定偏移: [${positionArray.join(', ')}]`);
              } else {
                // 生成随机位置，确保每棵树位置不同
                const radius = 18;
                // 使用基于ID的确定性角度分布，而不是索引分布
                const angle = tree.id ? 
                  (getStableRandomOffset(tree.id, Math.PI) + Math.PI) : // 0 到 2π 之间
                  (index / treesArray.length) * Math.PI * 2;
                
                const distance = radius * (0.4 + (tree.id ? 
                  Math.abs(getStableRandomOffset(tree.id + '_dist', 0.6)) : 
                  Math.random() * 0.6));
                
                const x = Math.cos(angle) * distance;
                const z = Math.sin(angle) * distance;
                positionArray = [x, 0, z];
                console.log(`为树木ID=${tree.id}生成稳定位置: [${positionArray.join(', ')}]`);
              }
              
              // 确保树木类型有效
              let treeType = tree.type;
              if (!Object.values(TreeType).includes(treeType as TreeType)) {
                console.warn(`树木类型"${treeType}"无效，使用默认类型OAK`);
                treeType = TreeType.OAK;
              }
              
              // 确保生长阶段有效
              let growthStage = typeof tree.stage === 'number' ? tree.stage : 
                              (typeof tree.growthStage === 'number' ? tree.growthStage : 0);
              // 限制在有效范围内
              growthStage = Math.max(0, Math.min(3, growthStage));
              
              // 创建树木对象，包含任务关联信息
              const treeData: TreeData & { task?: any } = {
                id: tree.id,
                type: treeType,
                growthStage: growthStage,
                position: positionArray,
                rotation: [rotation.x || 0, rotation.y || Math.random() * Math.PI * 2, rotation.z || 0],
                healthState: typeof tree.healthState === 'number' ? tree.healthState : 100,
                taskId: tree.taskId
              };
              
              // 如果树木有关联任务，增加任务信息
              if (tree.task) {
                treeData.task = {
                  id: tree.task.id,
                  title: tree.task.title,
                  completed: tree.task.status === 'COMPLETED'
                };
              }
              
              return treeData;
            });
          
          console.log('森林页面: 格式化后的树木数据 (详细):', formattedTrees);
          
          // 检查是否所有格式化的树木都有唯一的ID和有效的位置
          const formattedTreeIds = new Set();
          let hasDuplicateIds = false;
          let hasInvalidPositions = false;
          
          formattedTrees.forEach(tree => {
            // 检查ID唯一性
            if (formattedTreeIds.has(tree.id)) {
              console.warn(`发现重复的树木ID: ${tree.id}`);
              hasDuplicateIds = true;
            }
            formattedTreeIds.add(tree.id);
            
            // 检查位置有效性
            if (isNaN(tree.position[0]) || isNaN(tree.position[1]) || isNaN(tree.position[2])) {
              console.warn(`树木ID=${tree.id}的位置包含NaN值: [${tree.position.join(', ')}]`);
              hasInvalidPositions = true;
            }
          });
          
          if (hasDuplicateIds) {
            console.warn('警告: 存在重复的树木ID，这可能导致渲染问题');
          }
          
          if (hasInvalidPositions) {
            console.warn('警告: 存在无效的树木位置，这可能导致渲染问题');
          }
          
          // 确保设置trees状态前内容有效且唯一
          console.log(`最终将设置${formattedTrees.length}棵树到状态中:`, formattedTrees);
          setTrees(formattedTrees);
        } catch (taskError) {
          console.error('获取任务数据失败:', taskError);
          
          // 即使获取任务失败，也尝试处理树木数据
          const simpleFormattedTrees = treesArray.map(tree => {
            return {
              id: tree.id,
              type: tree.type as TreeType || TreeType.OAK,
              growthStage: typeof tree.stage === 'number' ? tree.stage : 0,
              position: [
                tree.position?.x || 0, 
                tree.position?.y || 0, 
                tree.position?.z || 0
              ] as [number, number, number],
              rotation: [0, 0, 0] as [number, number, number],
              healthState: typeof tree.healthState === 'number' ? tree.healthState : 100,
              taskId: tree.taskId
            };
          });
          
          console.log('无法验证任务关联，使用简化的树木数据格式:', simpleFormattedTrees);
          setTrees(simpleFormattedTrees);
        }
      } else {
        console.warn('未找到有效的树木数据，设置空树木数组');
        setTrees([]);
      }
    } catch (error) {
      console.error('加载树木数据失败:', error);
      setLoadError(error instanceof Error ? error.message : '未知错误');
      setTrees([]);
    } finally {
      setLoading(false);
    }
  };
  
  // 初始加载树木数据
  useEffect(() => {
    loadTrees();
    
    // 添加API诊断功能，仅在开发环境执行
    if (process.env.NODE_ENV === 'development') {
      setTimeout(() => {
        console.log('正在执行森林页面API诊断...');
        diagnoseTrees();
      }, 2000);
    }
    
    // 添加全局事件监听器，当任务变更时刷新森林
    const handleTaskUpdate = () => {
      console.log('监听到任务更新事件，但不会重新加载所有树木数据以避免位置变化');
      // 这里不再调用loadTrees()，避免位置重新计算
      // 如果需要更新任务状态，应该只更新任务状态相关的数据，而不是重新加载所有树木
    };
    
    // 添加全局事件监听
    window.addEventListener(TASK_UPDATE_EVENT, handleTaskUpdate);
    
    // 清理事件监听
    return () => {
      window.removeEventListener(TASK_UPDATE_EVENT, handleTaskUpdate);
    };
  }, []);
  
  // 处理树木点击事件
  const handleTreeClick = (treeId: string | number) => {
    console.log(`树木被点击: ID=${treeId}`);
    setSelectedTreeId(treeId);
    
    // 查找树木对应的任务
    const selectedTree = trees.find(tree => tree.id === treeId) as (TreeData & { task?: any });
    if (selectedTree && selectedTree.taskId) {
      console.log(`找到关联任务: ID=${selectedTree.taskId}`);
      setSelectedTaskId(selectedTree.taskId.toString());
      
      // 查找任务标题（如果有）
      if (selectedTree.task) {
        setSelectedTaskTitle(selectedTree.task.title);
        console.log(`关联任务标题: ${selectedTree.task.title}`);
      } else if (tasksMap[selectedTree.taskId.toString()]) {
        setSelectedTaskTitle(tasksMap[selectedTree.taskId.toString()].title);
        console.log(`通过映射找到任务标题: ${tasksMap[selectedTree.taskId.toString()].title}`);
      } else {
        console.warn(`未找到任务标题，taskId=${selectedTree.taskId}`);
        setSelectedTaskTitle('未知任务');
      }
      
      // 打开健康面板
      setHealthPanelVisible(true);
    } else {
      console.warn(`所选树木 ID=${treeId} 没有关联任务`);
      setSelectedTaskId(null);
      setSelectedTaskTitle('');
      setHealthPanelVisible(false);
    }
  };
  
  // 关闭健康面板
  const closeHealthPanel = () => {
    setHealthPanelVisible(false);
  };
  
  // 处理任务进度更新
  const handleProgressUpdate = async (taskId: string, progress: number) => {
    console.log(`任务${taskId}进度更新为${progress}%`);
    
    try {
      // 先更新任务进度
      await taskService.updateTaskStatus(taskId, progress >= 100 ? TaskStatus.COMPLETED : TaskStatus.IN_PROGRESS);
      
      // 更新树木生长阶段
      if (selectedTreeId !== null) {
        const updatedTrees = trees.map(tree => {
          if (tree.taskId === taskId) {
            // 根据进度设置生长阶段
            let newGrowthStage = 0;
            if (progress >= 100) {
              newGrowthStage = 3; // 完成 - 成熟阶段
            } else if (progress >= 70) {
              newGrowthStage = 2; // 进度超过70% - 生长阶段
            } else if (progress >= 30) {
              newGrowthStage = 1; // 进度超过30% - 幼苗阶段
            }
            
            console.log(`更新树木ID=${tree.id}的生长阶段: ${tree.growthStage} -> ${newGrowthStage}`);
            
            return {
              ...tree,
              growthStage: newGrowthStage,
              healthState: Math.min(100, progress + 20) // 进度影响健康状态
            };
          }
          return tree;
        });
        
        setTrees(updatedTrees);
      }
      
      // 显示成功消息，不触发全局刷新
      message.success(`任务进度已更新为${progress}%，树木生长阶段已更新`);
      
      // 注意：这里不调用loadTrees()，避免重新计算位置
    } catch (error) {
      console.error('更新任务进度失败:', error);
      message.error('更新任务进度失败');
    }
  };
  
  // 添加新树木
  const handleAddTree = () => {
    // 生成一个唯一ID
    const newTreeId = Date.now();

    // 生成稳定的随机位置 - 复用前面定义的函数
    const getStableRandomOffset = (id: string | number, max: number = 1.5): number => {
      const numericId = typeof id === 'string' ? 
        id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : id;
      const normalizedValue = (numericId % 1000) / 1000;
      return (normalizedValue * max * 2) - max;
    };

    // 生成基于ID的稳定位置
    const stableRandomPosition = (): [number, number, number] => {
      const radius = 10 + Math.abs(getStableRandomOffset(newTreeId + '_rad', 10));
      const angle = (getStableRandomOffset(newTreeId, Math.PI) + Math.PI);
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      return [x, 0, z];
    };
    
    // 随机选择树木类型
    const treeTypes = Object.values(TreeType);
    const typeIndex = Math.floor(Math.abs(getStableRandomOffset(newTreeId + '_type', 1)) * treeTypes.length);
    const randomType = treeTypes[typeIndex];
    
    // 随机生长阶段，但默认为1（幼苗）使其更易于成长
    const randomGrowth = 1;
    
    // 创建新树
    const newTree: TreeData = {
      id: newTreeId,
      type: randomType,
      growthStage: randomGrowth,
      position: stableRandomPosition(),
      rotation: [0, getStableRandomOffset(newTreeId + '_rot', Math.PI), 0],
      healthState: 100 // 新树默认健康
    };
    
    // 添加到树木集合中
    setTrees([...trees, newTree]);
    message.success('新的树苗已种植！');
  };
  
  // 刷新森林
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTrees(); // 使用提取的loadTrees函数
    setRefreshing(false);
    message.success('森林已刷新');
  };
  
  // 将树木类型枚举值转换为友好名称
  const treeTypeToName = (treeType: TreeType): string => {
    const nameMap: Record<TreeType, string> = {
      [TreeType.OAK]: '橡树',
      [TreeType.PINE]: '松树',
      [TreeType.MAPLE]: '枫树',
      [TreeType.PALM]: '棕榈树',
      [TreeType.APPLE]: '苹果树',
      [TreeType.WILLOW]: '柳树',
      [TreeType.CHERRY]: '樱花树'
    };
    
    return nameMap[treeType] || treeType;
  };
  
  // 诊断工具 - 检测树木加载问题
  const diagnoseTrees = async () => {
    console.group('===== 森林诊断工具 =====');
    try {
      console.log('1. 检查API配置');
      console.log('API基础URL:', api.defaults.baseURL);
      
      console.log('\n2. 测试API连接');
      try {
        const healthResponse = await api.get('/health');
        console.log('健康检查响应:', healthResponse.data);
      } catch (err) {
        console.warn('健康检查失败，尝试访问trees接口');
      }
      
      console.log('\n3. 获取任务列表');
      try {
        const tasksResponse = await api.get('/tasks');
        const tasksData = tasksResponse.data;
        console.log('任务响应:', tasksData);
        
        // 分析结构
        console.log('任务数据结构:');
        if (tasksData && tasksData.data && tasksData.data.tasks) {
          console.log(`找到${tasksData.data.tasks.length}个任务`);
        } else {
          console.log('未找到标准格式的任务数据');
        }
      } catch (err) {
        console.error('获取任务失败:', err);
      }
      
      console.log('\n4. 获取树木列表');
      try {
        const treesResponse = await api.get('/trees');
        const treesData = treesResponse.data;
        console.log('树木响应:', treesData);
        
        // 尝试多种可能的数据格式
        let treesList: any[] | null = null;
        if (treesData && treesData.data && Array.isArray(treesData.data.trees)) {
          treesList = treesData.data.trees;
          console.log('找到标准格式树木列表');
        } else if (treesData && Array.isArray(treesData.trees)) {
          treesList = treesData.trees;
          console.log('找到简化格式树木列表');
        } else if (treesData && Array.isArray(treesData.data)) {
          treesList = treesData.data;
          console.log('找到另一种格式树木列表');
        }
        
        if (treesList && treesList.length > 0) {
          console.log(`找到${treesList.length}棵树`);
          
          // 检查第一棵树的格式
          const sampleTree: any = treesList[0];
          console.log('树木示例数据:', sampleTree);
          
          // 检查必需字段
          const requiredFields = ['id', 'type', 'stage', 'position'];
          const missingFields = requiredFields.filter(field => !sampleTree[field]);
          if (missingFields.length > 0) {
            console.error('树木数据缺少必要字段:', missingFields);
          } else {
            console.log('树木数据包含所有必要字段');
          }
          
          // 检查position格式
          if (sampleTree.position) {
            console.log('树木位置格式:', sampleTree.position);
            if (typeof sampleTree.position.x === 'number' && 
                typeof sampleTree.position.y === 'number' && 
                typeof sampleTree.position.z === 'number') {
              console.log('位置格式正确');
            } else {
              console.error('位置格式问题:',
                typeof sampleTree.position.x, 
                typeof sampleTree.position.y, 
                typeof sampleTree.position.z);
            }
          }
        } else {
          console.warn('未找到树木列表或树木列表为空');
        }
      } catch (err) {
        console.error('获取树木失败:', err);
      }
      
      console.log('\n5. 检查模型可用性');
      try {
        // 检查核心模型文件是否可访问
        const modelTypes = ['oak', 'pine', 'maple', 'palm', 'apple', 'willow'];
        for (const type of modelTypes) {
          const modelUrl = `/models/trees/${type}.glb`;
          const testResult = await fetch(modelUrl, { method: 'HEAD' });
          console.log(`模型文件 ${modelUrl}: ${testResult.ok ? '✅ 可访问' : '❌ 不可访问'}`);
        }
      } catch (err) {
        console.error('检查模型可用性失败:', err);
      }
    } catch (error) {
      console.error('诊断过程错误:', error);
    } finally {
      console.groupEnd();
    }
  };
  
  // 在页面加载后添加一个调试功能，显示所有树木与任务的关联状态
  useEffect(() => {
    if (!loading && trees.length > 0) {
      console.group('森林调试信息');
      console.log(`总共加载了 ${trees.length} 棵树`);
      
      trees.forEach((tree, index) => {
        // 使用类型断言来处理可能的额外属性
        const treeWithTask = tree as (TreeData & { task?: any });
        
        console.log(`--- 树木 #${index + 1} ---`);
        console.log(`ID: ${tree.id}`);
        console.log(`类型: ${tree.type}`);
        console.log(`位置: [${tree.position.join(', ')}]`);
        console.log(`关联任务ID: ${tree.taskId || '无'}`);
        console.log(`有任务对象: ${treeWithTask.task ? '是' : '否'}`);
        
        if (treeWithTask.task) {
          console.log(`任务标题: ${treeWithTask.task.title}`);
          console.log(`任务完成状态: ${treeWithTask.task.completed ? '已完成' : '进行中'}`);
        }
      });
      
      console.groupEnd();
    }
  }, [loading, trees]);
  
  return (
    <div className="forest-page">
      <Card
        title="我的森林"
        extra={
          <Space>
            <Button
              icon={<PlusOutlined />}
              type="primary"
              onClick={handleAddTree}
              disabled={loading}
            >
              种植新树
            </Button>
            <Button
              icon={<SyncOutlined spin={refreshing} />}
              onClick={handleRefresh}
              disabled={loading || refreshing}
            >
              刷新
            </Button>
          </Space>
        }
        style={{ marginBottom: '20px' }}
      >
        {/* 处理打印调试信息 - 改为副作用 */}
        {(() => {
          if (process.env.NODE_ENV === 'development') {
            console.log('即将传递给ForestScene的树木数据:', trees);
          }
          return null;
        })()}
        {/* 森林场景 */}
        <ForestScene
          trees={trees}
          onTreeClick={handleTreeClick}
          height="600px"
          selectedTreeId={selectedTreeId === null ? undefined : selectedTreeId}
        />
      </Card>
      
      {/* 树木健康状态面板 */}
      <Drawer
        title={`任务树木健康状态: ${selectedTaskTitle}`}
        placement="right"
        onClose={closeHealthPanel}
        open={healthPanelVisible}
        width={480}
      >
        {selectedTaskId && (
          <TreeHealthPanel 
            taskId={selectedTaskId}
            onProgressUpdate={handleProgressUpdate}
          />
        )}
      </Drawer>
    </div>
  );
};

export default ForestPage; 