import * as THREE from 'three';
// @ts-ignore
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { TreeType } from '../types/Tree';

/**
 * 模型缓存类型
 */
interface ModelCache {
  [key: string]: THREE.Group | null;
}

/**
 * 模型加载器类
 * 负责加载和缓存3D模型
 */
class ModelLoader {
  private cache: ModelCache = {};
  private loader: GLTFLoader;
  private isLoading: { [key: string]: boolean } = {};
  private loadPromises: { [key: string]: Promise<THREE.Group | null> } = {};

  constructor() {
    this.loader = new GLTFLoader();
    console.log('ModelLoader初始化');
  }

  /**
   * 加载树木模型
   * @param treeType 树木类型
   * @param growthStage 生长阶段（0: seed, 1: sapling, 2: growing, 3: mature）
   * @returns 加载的3D模型
   */
  async loadTreeModel(treeType: TreeType, growthStage: number = 3): Promise<THREE.Group | null> {
    console.log(`请求加载树木模型: 类型=${treeType}, 阶段=${growthStage}`);
    
    // 获取模型主URL和备用URL
    const primaryUrl = this.getTreeModelUrl(treeType, growthStage);
    const typeString = this.getTreeTypeString(treeType);
    // 使用通用树木模型作为备用
    const fallbackUrl = `/models/trees/${typeString}.glb`;
    
    try {
      console.log(`尝试加载模型: ${primaryUrl}`);
      
      // 首先尝试加载特定阶段的模型
      const model = await this.loadModelWithFallbacks(primaryUrl, fallbackUrl, treeType);
      
      if (model) {
        console.log(`成功加载树木模型: 类型=${treeType}, 阶段=${growthStage}`);
        // 生成独特的克隆标识符，方便调试
        const cloneId = `${treeType}_${growthStage}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
        
        // 返回模型的克隆版本，确保每个使用者都获得独立的实例
        const modelClone = model.clone();
        modelClone.name = `${modelClone.name || 'tree'}_clone_${cloneId}`;
        
        // 标记这是克隆的实例
        modelClone.userData = {
          ...modelClone.userData,
          isClone: true,
          originalType: treeType,
          growthStage: growthStage,
          cloneId: cloneId
        };
        
        console.log(`创建并返回模型克隆实例: ${modelClone.name}`);
        return modelClone;
      } else {
        // 如果所有加载尝试都失败，创建一个简单的几何模型作为替代
        console.warn(`无法加载树木模型: 类型=${treeType}, 阶段=${growthStage}，使用程序生成的几何模型代替`);
        const fallbackModel = this.createFallbackModel(treeType);
        fallbackModel.name = `fallback_${treeType}_${growthStage}_${Date.now().toString(36)}`;
        return fallbackModel;
      }
    } catch (error) {
      console.error(`加载树木模型时出错: 类型=${treeType}, 阶段=${growthStage}`, error);
      // 返回一个程序生成的几何模型作为替代
      const fallbackModel = this.createFallbackModel(treeType);
      fallbackModel.name = `error_fallback_${treeType}_${growthStage}_${Date.now().toString(36)}`;
      return fallbackModel;
    }
  }
  
  /**
   * 获取树木模型的公共URL，用于直接测试模型文件是否可访问
   * @param treeType 树木类型
   * @param growthStage 生长阶段
   * @returns 模型文件的URL
   */
  getPublicTreeModelUrl(treeType: TreeType, growthStage: number = 3): string {
    return this.getTreeModelUrl(treeType, growthStage);
  }

  /**
   * 尝试加载模型，如果主模型失败，尝试备用模型
   */
  private async loadModelWithFallbacks(
    primaryUrl: string, 
    fallbackUrl: string, 
    treeType: TreeType
  ): Promise<THREE.Group | null> {
    console.log(`加载模型(带备用): 主URL=${primaryUrl}, 备用URL=${fallbackUrl}`);
    
    // 标记加载过程已开始，防止重复加载
    const cacheKey = primaryUrl;
    
    // 如果缓存中已有此模型，返回缓存版本的副本
    if (this.cache[cacheKey]) {
      console.log(`从缓存获取模型: ${cacheKey}`);
      const cachedModel = this.cache[cacheKey];
      return cachedModel ? cachedModel.clone() : null;
    }
    
    // 如果已经有一个正在进行的加载请求，等待它完成而不是启动新的请求
    if (this.isLoading[cacheKey]) {
      console.log(`等待现有加载请求完成: ${cacheKey}`);
      try {
        const result = await this.loadPromises[cacheKey];
        return result ? result.clone() : null;
      } catch (error) {
        console.warn(`等待现有请求时出错: ${cacheKey}`, error);
        return null;
      }
    }
    
    // 标记为正在加载
    this.isLoading[cacheKey] = true;
    
    // 创建一个新的加载Promise
    this.loadPromises[cacheKey] = (async () => {
      try {
        // 尝试加载主模型
        const model = await this.loadSingleModel(primaryUrl);
        this.cache[cacheKey] = model;
        return model;
      } catch (primaryError) {
        console.warn(`主模型加载失败: ${primaryUrl}，尝试备用模型`, primaryError);
        
        try {
          // 尝试加载备用模型
          if (fallbackUrl && fallbackUrl !== primaryUrl) {
            const fallbackModel = await this.loadSingleModel(fallbackUrl);
            this.cache[cacheKey] = fallbackModel;
            return fallbackModel;
          }
        } catch (fallbackError) {
          console.warn(`备用模型加载也失败: ${fallbackUrl}`, fallbackError);
          
          // 尝试其他可能的备用模型
          const otherFallbacks = this.getFallbackModelUrl(treeType, 3);
          for (const fbUrl of otherFallbacks) {
            if (fbUrl !== primaryUrl && fbUrl !== fallbackUrl) {
              try {
                console.log(`尝试其他备用模型: ${fbUrl}`);
                const otherFallbackModel = await this.loadSingleModel(fbUrl);
                this.cache[cacheKey] = otherFallbackModel;
                return otherFallbackModel;
              } catch (otherError) {
                console.warn(`其他备用模型加载失败: ${fbUrl}`, otherError);
                continue;
              }
            }
          }
        }
        
        // 所有尝试都失败，返回null
        this.cache[cacheKey] = null;
        return null;
      } finally {
        // 完成加载过程，无论成功与否
        this.isLoading[cacheKey] = false;
      }
    })();
    
    try {
      const result = await this.loadPromises[cacheKey];
      return result ? result.clone() : null;
    } catch (error) {
      console.error(`加载模型过程中出错: ${cacheKey}`, error);
      return null;
    }
  }
  
  /**
   * 加载单个模型
   */
  private loadSingleModel(url: string): Promise<THREE.Group> {
    return new Promise((resolve, reject) => {
      try {
        // 先检查文件是否存在
        console.log(`正在检查模型文件是否存在: ${url}`);
        console.log(`完整URL: ${window.location.origin}${url}`);
        
        fetch(url, { method: 'HEAD' })
          .then(response => {
            if (!response.ok) {
              const error = new Error(`模型文件不存在或无法访问: ${url}, 状态码: ${response.status}, 状态文本: ${response.statusText}`);
              console.warn(error.message);
              console.warn(`完整URL检查失败: ${window.location.origin}${url}`);
              
              // 添加更详细的诊断信息
              if (response.status === 404) {
                console.error(`模型文件未找到(404)。请检查以下内容:`);
                console.error(`1. public/models/trees/目录中是否存在该文件`);
                console.error(`2. 文件名是否正确(区分大小写)`);
                console.error(`3. 开发服务器是否正确配置静态文件服务`);
              } else {
                console.error(`访问模型文件失败，HTTP状态码: ${response.status}`);
              }
              
              reject(error);
              return;
            }
            
            console.log(`文件存在，开始加载模型: ${url}`);
            
            // 文件存在，开始加载
            this.loader.load(
              url,
              (gltf) => {
                // 处理加载成功
                console.log(`模型加载成功: ${url}`);
                const model = gltf.scene;

                if (!model) {
                  console.error(`模型场景为空: ${url}`);
                  reject(new Error(`模型场景为空: ${url}`));
                  return;
                }
                
                // 详细记录模型的层次结构
                console.log(`模型结构 [${url.split('/').pop()}]:`);
                this.logModelHierarchy(model);
                
                // 设置模型属性
                model.traverse((object) => {
                  if ((object as THREE.Mesh).isMesh) {
                    const mesh = object as THREE.Mesh;
                    // 启用阴影
                    mesh.castShadow = true;
                    mesh.receiveShadow = true;
                    
                    // 确保材质正确
                    if (mesh.material) {
                      // 材质处理
                      const material = mesh.material as THREE.Material;
                      material.needsUpdate = true;
                    }
                  }
                });
                
                resolve(model);
              },
              (progress) => {
                // 加载进度
                if (progress.total > 0) {
                  const percent = Math.round(progress.loaded / progress.total * 100);
                  console.log(`模型加载进度: ${url}, ${percent}%`);
                }
              },
              (error) => {
                // 处理加载错误
                console.error(`加载模型失败: ${url}`, error);
                
                // 添加更多诊断信息
                console.error(`模型加载失败详细信息:`);
                console.error(`- URL: ${url}`);
                console.error(`- 完整URL: ${window.location.origin}${url}`);
                console.error(`- 错误消息: ${error.message}`);
                
                reject(error);
              }
            );
          })
          .catch(fetchError => {
            console.error(`检查文件存在性时出错: ${url}`, fetchError);
            console.error(`- 完整URL: ${window.location.origin}${url}`);
            console.error(`- 错误消息: ${fetchError.message}`);
            reject(fetchError);
          });
      } catch (error) {
        console.error(`loadSingleModel总体错误: ${url}`, error);
        reject(error);
      }
    });
  }
  
  /**
   * 记录模型层次结构，便于调试
   */
  private logModelHierarchy(model: THREE.Object3D, depth = 0, maxDepth = 3) {
    if (depth > maxDepth) return; // 避免过深的递归
    
    const indent = '  '.repeat(depth);
    const typeInfo = (model as THREE.Mesh).isMesh ? 'Mesh' : model.type;
    const nameInfo = model.name || '[未命名]';
    const posInfo = `pos:(${model.position.x.toFixed(2)}, ${model.position.y.toFixed(2)}, ${model.position.z.toFixed(2)})`;
    
    console.log(`${indent}├─ ${nameInfo} [${typeInfo}] ${posInfo}`);
    
    // 如果是网格，记录材质信息
    if ((model as THREE.Mesh).isMesh) {
      const mesh = model as THREE.Mesh;
      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          console.log(`${indent}│  └─ 材质: [数组, ${mesh.material.length}个]`);
        } else {
          const mat = mesh.material as THREE.Material;
          console.log(`${indent}│  └─ 材质: ${mat.type}`);
        }
      }
    }
    
    // 递归记录子对象
    model.children.forEach(child => {
      this.logModelHierarchy(child, depth + 1, maxDepth);
    });
  }
  
  /**
   * 获取树木类型字符串
   */
  private getTreeTypeString(treeType: TreeType): string {
    const typeMap: Record<TreeType, string> = {
      [TreeType.OAK]: 'oak',
      [TreeType.PINE]: 'pine',
      [TreeType.MAPLE]: 'maple',
      [TreeType.PALM]: 'palm',
      [TreeType.APPLE]: 'apple',
      [TreeType.WILLOW]: 'willow',
      [TreeType.CHERRY]: 'cherry'
    };
    
    // 如果传入的不是枚举值而是字符串，尝试匹配
    if (typeof treeType === 'string' && !typeMap[treeType as TreeType]) {
      // 处理可能的字符串类型匹配
      const lowerType = treeType.toLowerCase();
      for (const [key, value] of Object.entries(typeMap)) {
        if (value === lowerType || key.toLowerCase() === lowerType) {
          return value;
        }
      }
      console.warn(`未知的树木类型: ${treeType}，使用默认类型oak`);
      return 'oak';
    }
    
    return typeMap[treeType] || 'oak';
  }
  
  /**
   * 获取树木模型URL
   * @param treeType 树木类型
   * @param growthStage 生长阶段（0: seed, 1: sapling, 2: growing, 3: mature）
   * @returns 模型URL
   */
  private getTreeModelUrl(treeType: TreeType, growthStage: number = 3): string {
    console.log(`获取模型URL: 树木类型=${treeType}, 生长阶段=${growthStage}`);
    
    // 树木类型映射到小写
    const typeMap: Record<TreeType, string> = {
      [TreeType.OAK]: 'oak',
      [TreeType.PINE]: 'pine',
      [TreeType.MAPLE]: 'maple',
      [TreeType.PALM]: 'palm',
      [TreeType.APPLE]: 'apple',
      [TreeType.WILLOW]: 'willow',
      [TreeType.CHERRY]: 'cherry'
    };
    
    // 处理未知类型，尝试直接将字符串映射为模型名称
    let type = typeMap[treeType as TreeType] || null;
    
    if (!type && typeof treeType === 'string') {
      type = treeType.toLowerCase();
      console.log(`尝试使用直接映射的类型: ${type}`);
    }
    
    type = type || 'oak'; // 无法识别的类型默认使用橡树
    const modelsRoot = '/models/trees';
    
    // 建立生长阶段与模型文件名的映射关系
    const stageModelMap = {
      0: `${modelsRoot}/seedstage_${type}.glb`,       // 种子阶段
      1: `${modelsRoot}/${type}_sapling.glb`,         // 幼苗阶段
      2: `${modelsRoot}/${type}_growing.glb`,         // 生长阶段（新添加）
      3: `${modelsRoot}/${type}_mature.glb`,          // 成熟阶段
    };
    
    // 获取指定生长阶段的模型URL
    const modelUrl = stageModelMap[growthStage] || `${modelsRoot}/${type}.glb`;
    
    // 检查当前URL并打印完整信息
    const fullUrl = `${window.location.origin}${modelUrl}`;
    console.log(`最终选择的模型URL: ${modelUrl}`);
    console.log(`完整URL: ${fullUrl}`);
    console.log(`尝试以下备用URL:`);
    
    // 输出所有可能的备用URL
    const fallbackUrls = this.getFallbackModelUrl(treeType, growthStage);
    fallbackUrls.forEach((url, index) => {
      console.log(`- 备用${index + 1}: ${url} (完整: ${window.location.origin}${url})`);
    });
    
    return modelUrl;
  }
  
  /**
   * 根据生长阶段获取备用模型URL
   * 提供多层次的回退机制
   */
  private getFallbackModelUrl(treeType: TreeType, growthStage: number): string[] {
    const type = this.getTreeTypeString(treeType);
    const modelsRoot = '/models/trees';
    
    // 按优先级排序的备用URL列表
    const fallbacks: string[] = [];
    
    // 1. 首先尝试通用树木模型（不带生长阶段）
    fallbacks.push(`${modelsRoot}/${type}.glb`);
    
    // 2. 根据生长阶段，添加相邻的生长阶段模型
    if (growthStage === 0) {
      // 种子阶段，可以尝试幼苗阶段
      fallbacks.push(`${modelsRoot}/${type}_sapling.glb`);
    } else if (growthStage === 1) {
      // 幼苗阶段，可以尝试种子或生长阶段
      fallbacks.push(`${modelsRoot}/seedstage_${type}.glb`);
      fallbacks.push(`${modelsRoot}/${type}_growing.glb`);
    } else if (growthStage === 2) {
      // 生长阶段，可以尝试幼苗或成熟阶段
      fallbacks.push(`${modelsRoot}/${type}_sapling.glb`);
      fallbacks.push(`${modelsRoot}/${type}_mature.glb`);
    } else {
      // 成熟阶段，可以尝试生长阶段
      fallbacks.push(`${modelsRoot}/${type}_growing.glb`);
    }
    
    // 3. 添加健康状态模型作为备用
    fallbacks.push(`${modelsRoot}/healthy_tree.glb`);
    
    // 4. 最后尝试橡树（最基础的树种）
    if (type !== 'oak') {
      fallbacks.push(`${modelsRoot}/oak.glb`);
    }
    
    return fallbacks;
  }
  
  /**
   * 创建备用树木模型（加载失败时使用）
   * @param treeType 树木类型
   * @returns 备用树木模型
   */
  private createFallbackModel(treeType: TreeType): THREE.Group {
    console.log(`创建备用树木模型: ${treeType}`);
    
    const group = new THREE.Group();
    
    // 创建简单的树干
    const trunkGeometry = new THREE.CylinderGeometry(0.1, 0.15, 1, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 0.5;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    trunk.name = 'trunk';
    
    // 创建简单的树冠
    let crownGeometry;
    if (treeType === TreeType.PINE) {
      crownGeometry = new THREE.ConeGeometry(0.5, 1.5, 8);
    } else {
      crownGeometry = new THREE.SphereGeometry(0.5, 8, 8);
    }
    
    let crownColor;
    switch (treeType) {
      case TreeType.OAK:
        crownColor = 0x2E8B57;
        break;
      case TreeType.PINE:
        crownColor = 0x006400;
        break;
      case TreeType.MAPLE:
        crownColor = 0x228B22;
        break;
      default:
        crownColor = 0x32CD32;
    }
    
    const crownMaterial = new THREE.MeshStandardMaterial({ color: crownColor });
    const crown = new THREE.Mesh(crownGeometry, crownMaterial);
    crown.position.y = 1.3;
    crown.castShadow = true;
    crown.receiveShadow = true;
    crown.name = 'crown';
    
    // 将部件添加到组
    group.add(trunk);
    group.add(crown);
    
    return group;
  }
  
  /**
   * 检查模型文件是否存在
   * 注意：此方法仅在开发环境使用，用于检测缺失的模型文件
   */
  async checkModelFiles(): Promise<void> {
    if (process.env.NODE_ENV !== 'development') return;
    
    console.log('开始检查模型文件...');
    
    const treeTypes = Object.values(TreeType);
    const growthStages = [0, 1, 2, 3]; // seed, sapling, growing, mature
    const missingModels: string[] = [];
    
    // 创建一个可以检查文件存在的函数
    const checkFileExists = async (url: string): Promise<boolean> => {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
      } catch (error) {
        return false;
      }
    };
    
    console.log('检查树木模型文件...');
    
    for (const treeType of treeTypes) {
      const typeStr = this.getTreeTypeString(treeType);
      
      // 检查通用模型文件
      const genericModelUrl = `/models/trees/${typeStr}.glb`;
      const genericExists = await checkFileExists(genericModelUrl);
      if (!genericExists) {
        console.warn(`⚠️ 缺少通用模型: ${genericModelUrl}`);
        missingModels.push(genericModelUrl);
      } else {
        console.log(`✅ 通用模型存在: ${genericModelUrl}`);
      }
      
      // 检查各生长阶段模型
      for (const stage of growthStages) {
        if (stage === 0) {
          // 种子阶段特殊命名
          const seedUrl = `/models/trees/seedstage_${typeStr}.glb`;
          const seedExists = await checkFileExists(seedUrl);
          
          if (!seedExists) {
            console.warn(`⚠️ 缺少种子模型: ${seedUrl}`);
            missingModels.push(seedUrl);
          } else {
            console.log(`✅ 种子模型存在: ${seedUrl}`);
          }
        } else {
          // 其他阶段命名
          const stageNames = ['sapling', 'growing', 'mature'];
          const stageName = stageNames[stage - 1];
          
          const stageModelUrl = `/models/trees/${typeStr}_${stageName}.glb`;
          const stageExists = await checkFileExists(stageModelUrl);
          
          if (!stageExists) {
            console.warn(`⚠️ 缺少阶段模型: ${stageModelUrl}`);
            missingModels.push(stageModelUrl);
          } else {
            console.log(`✅ 阶段模型存在: ${stageModelUrl}`);
          }
        }
      }
    }
    
    // 显示缺失模型总结
    if (missingModels.length > 0) {
      console.warn(`检测到 ${missingModels.length} 个缺失模型:`);
      missingModels.forEach((url, index) => {
        console.warn(`${index + 1}. ${url}`);
      });
      console.warn('缺失的模型将使用后备模型替代。建议添加这些模型文件以获得更好的视觉效果。');
    } else {
      console.log('✅ 所有模型文件检查完成，未发现缺失。');
    }
  }
  
  /**
   * 预加载常用树木模型
   */
  async preloadCommonModels(): Promise<void> {
    console.log('预加载常用树木模型');
    
    // 常用树木类型
    const commonTreeTypes = [
      TreeType.OAK,
      TreeType.PINE,
      TreeType.MAPLE,
      TreeType.PALM,
      TreeType.APPLE,
      TreeType.WILLOW
    ];
    
    // 生长阶段
    const growthStages = [0, 1, 2, 3]; // seed, sapling, growing, mature
    
    const loadPromises: Promise<THREE.Group | null>[] = [];
    
    // 遍历所有常用树种和生长阶段
    commonTreeTypes.forEach(treeType => {
      growthStages.forEach(stage => {
        loadPromises.push(this.loadTreeModel(treeType, stage));
      });
    });
    
    // 并行加载所有模型
    await Promise.all(loadPromises);
    
    console.log('常用树木模型预加载完成');
  }
  
  /**
   * 清理模型缓存
   */
  clearCache(): void {
    console.log('清理模型缓存');
    
    // 释放所有缓存模型
    Object.keys(this.cache).forEach(key => {
      const model = this.cache[key];
      if (model) {
        model.traverse((object) => {
          if ((object as THREE.Mesh).isMesh) {
            const mesh = object as THREE.Mesh;
            if (mesh.geometry) {
              mesh.geometry.dispose();
            }
            
            if (mesh.material) {
              const materials = Array.isArray(mesh.material) 
                ? mesh.material 
                : [mesh.material];
                
              materials.forEach(material => {
                material.dispose();
              });
            }
          }
        });
      }
    });
    
    this.cache = {};
    this.isLoading = {};
    this.loadPromises = {};
  }
}

// 创建单例实例
export const modelLoader = new ModelLoader();

export default modelLoader; 