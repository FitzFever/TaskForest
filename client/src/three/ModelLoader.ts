import * as THREE from 'three';
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
   * @returns 加载的3D模型
   */
  async loadTreeModel(treeType: TreeType): Promise<THREE.Group | null> {
    const cacheKey = `tree_${treeType}`;
    
    // 如果模型已缓存，直接返回缓存模型的克隆
    if (this.cache[cacheKey]) {
      console.log(`从缓存加载树木模型: ${treeType}`);
      return this.cache[cacheKey]!.clone();
    }
    
    // 如果正在加载中，返回加载Promise
    if (this.isLoading[cacheKey]) {
      console.log(`等待树木模型加载完成: ${treeType}`);
      return this.loadPromises[cacheKey];
    }
    
    // 标记为加载中
    this.isLoading[cacheKey] = true;
    
    // 创建加载Promise
    this.loadPromises[cacheKey] = new Promise<THREE.Group | null>((resolve) => {
      // 获取模型URL
      const modelUrl = this.getTreeModelUrl(treeType);
      
      console.log(`开始加载树木模型: ${treeType}, URL: ${modelUrl}`);
      
      // 使用GLTFLoader加载模型
      this.loader.load(
        modelUrl,
        (gltf) => {
          // 处理加载成功
          console.log(`树木模型加载成功: ${treeType}`);
          const model = gltf.scene;
          
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
          
          // 缓存模型
          this.cache[cacheKey] = model;
          this.isLoading[cacheKey] = false;
          
          // 解析Promise
          resolve(model.clone());
        },
        (progress) => {
          // 加载进度
          console.log(`树木模型加载进度: ${treeType}, ${Math.round(progress.loaded / progress.total * 100)}%`);
        },
        (error) => {
          // 处理加载错误
          console.error(`树木模型加载失败: ${treeType}`, error);
          this.isLoading[cacheKey] = false;
          this.cache[cacheKey] = null;
          
          // 出错时返回null
          resolve(this.createFallbackModel(treeType));
        }
      );
    });
    
    return this.loadPromises[cacheKey];
  }
  
  /**
   * 获取树木模型URL
   * @param treeType 树木类型
   * @returns 模型URL
   */
  private getTreeModelUrl(treeType: TreeType): string {
    // 根据树木类型返回对应的模型URL
    // 这里假设模型路径是public/models/trees/{tree_type}.glb
    switch (treeType) {
      case TreeType.OAK:
        return '/models/trees/oak.glb';
      case TreeType.PINE:
        return '/models/trees/pine.glb';
      case TreeType.MAPLE:
        return '/models/trees/maple.glb';
      default:
        // 默认返回通用树木模型
        return '/models/trees/generic_tree.glb';
    }
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
   * 预加载常用树木模型
   */
  async preloadCommonModels(): Promise<void> {
    console.log('预加载常用树木模型');
    
    // 并行加载常用树木类型
    await Promise.all([
      this.loadTreeModel(TreeType.OAK),
      this.loadTreeModel(TreeType.PINE),
      this.loadTreeModel(TreeType.MAPLE)
    ]);
    
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