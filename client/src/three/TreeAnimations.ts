/**
 * 树木动画工具类
 * 提供树木健康状态变化、生长等动画效果
 */
import * as THREE from 'three';
import { TreeType } from '../types/Tree';
import { gsap } from 'gsap';

/**
 * 健康状态转换动画效果类型
 */
export enum HealthTransitionType {
  RECOVERY = 'recovery',    // 恢复健康
  DECLINE = 'decline',      // 健康下降
  CRITICAL = 'critical',    // 严重状态
  GROWTH = 'growth'         // 生长阶段变化
}

/**
 * 树木粒子效果配置
 */
interface ParticleEffectConfig {
  count: number;
  color: string | THREE.Color;
  size: number;
  duration: number;
  spread: number;
  speed: number;
}

/**
 * 创建粒子系统
 * @param scene Three.js场景
 * @param position 粒子发射位置
 * @param config 粒子效果配置
 * @returns 粒子系统对象
 */
export const createParticleEffect = (
  scene: THREE.Scene,
  position: THREE.Vector3,
  config: ParticleEffectConfig
): THREE.Points => {
  // 创建粒子几何体
  const particles = new THREE.BufferGeometry();
  const positions = new Float32Array(config.count * 3);
  const colors = new Float32Array(config.count * 3);
  
  // 设置粒子初始位置和颜色
  const color = new THREE.Color(config.color);
  
  for (let i = 0; i < config.count; i++) {
    // 在粒子发射位置周围随机分布
    const x = (Math.random() - 0.5) * config.spread;
    const y = Math.random() * config.spread;
    const z = (Math.random() - 0.5) * config.spread;
    
    positions[i * 3] = position.x + x;
    positions[i * 3 + 1] = position.y + y;
    positions[i * 3 + 2] = position.z + z;
    
    // 设置颜色
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }
  
  particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  
  // 创建粒子材质
  const material = new THREE.PointsMaterial({
    size: config.size,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
  });
  
  // 创建粒子系统
  const particleSystem = new THREE.Points(particles, material);
  scene.add(particleSystem);
  
  // 设置粒子动画
  const animate = () => {
    const positions = particleSystem.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < config.count; i++) {
      // 粒子向上飘动
      positions[i * 3 + 1] += config.speed * (Math.random() * 0.5 + 0.5);
      
      // 添加一些水平方向的随机运动
      positions[i * 3] += (Math.random() - 0.5) * 0.01;
      positions[i * 3 + 2] += (Math.random() - 0.5) * 0.01;
    }
    
    particleSystem.geometry.attributes.position.needsUpdate = true;
  };
  
  // 设置动画循环
  const animationId = { id: 0 };
  const startAnimation = () => {
    let time = 0;
    const maxTime = config.duration * 60; // 假设60fps
    
    const updateParticles = () => {
      if (time >= maxTime) {
        // 动画结束，移除粒子系统
        scene.remove(particleSystem);
        particleSystem.geometry.dispose();
        (particleSystem.material as THREE.Material).dispose();
        return;
      }
      
      animate();
      time++;
      animationId.id = requestAnimationFrame(updateParticles);
    };
    
    updateParticles();
  };
  
  startAnimation();
  
  return particleSystem;
};

/**
 * 应用健康状态变化的动画效果
 * @param model 树木模型
 * @param scene Three.js场景
 * @param fromHealth 初始健康值
 * @param toHealth 目标健康值
 * @param type 转换效果类型
 */
export const applyHealthTransitionEffect = (
  model: THREE.Object3D,
  scene: THREE.Scene,
  fromHealth: number,
  toHealth: number,
  type: HealthTransitionType = HealthTransitionType.RECOVERY
): void => {
  const modelPosition = new THREE.Vector3();
  model.getWorldPosition(modelPosition);
  
  // 根据动画类型设置不同的粒子效果
  let particleConfig: ParticleEffectConfig;
  
  if (type === HealthTransitionType.RECOVERY) {
    // 恢复健康的绿色上升粒子
    particleConfig = {
      count: 100,
      color: '#4CAF50',
      size: 0.05,
      duration: 2, // 秒
      spread: 0.8,
      speed: 0.02
    };
  } else if (type === HealthTransitionType.DECLINE) {
    // 健康下降的橙色下落粒子
    particleConfig = {
      count: 60,
      color: '#FFC107',
      size: 0.04,
      duration: 1.5,
      spread: 0.7,
      speed: -0.015
    };
  } else if (type === HealthTransitionType.CRITICAL) {
    // 严重状态的红色爆发粒子
    particleConfig = {
      count: 120,
      color: '#FF5722',
      size: 0.06,
      duration: 1.8,
      spread: 1.0,
      speed: 0.005
    };
  } else {
    // 生长阶段变化的金色粒子
    particleConfig = {
      count: 80,
      color: '#FFD700',
      size: 0.05,
      duration: 2.5,
      spread: 1.2,
      speed: 0.025
    };
  }
  
  // 创建粒子效果
  createParticleEffect(scene, modelPosition, particleConfig);
  
  // 应用颜色变化动画
  model.traverse((object) => {
    if ((object as THREE.Mesh).isMesh) {
      const mesh = object as THREE.Mesh;
      if (mesh.material) {
        // 只对树叶部分应用颜色变化
        if (mesh.name.includes('leaf') || mesh.name.includes('leaves') || 
            (mesh.name.includes('crown') && !mesh.name.includes('trunk'))) {
          
          // 处理材质数组
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(mat => {
              if (mat instanceof THREE.MeshStandardMaterial) {
                // 使用GSAP动画库创建颜色过渡效果
                const targetColor = getHealthColorAsHex(toHealth);
                gsap.to(mat.color, {
                  r: targetColor.r,
                  g: targetColor.g,
                  b: targetColor.b,
                  duration: 1.5,
                  ease: "power2.out"
                });
              }
            });
          } else if (mesh.material instanceof THREE.MeshStandardMaterial) {
            const targetColor = getHealthColorAsHex(toHealth);
            gsap.to(mesh.material.color, {
              r: targetColor.r,
              g: targetColor.g,
              b: targetColor.b,
              duration: 1.5,
              ease: "power2.out"
            });
          }
        }
      }
    }
  });
  
  // 应用模型缩放或摇摆动画效果
  if (type === HealthTransitionType.RECOVERY) {
    // 恢复健康时的轻微弹跳效果
    const originalScale = model.scale.clone();
    gsap.to(model.scale, {
      x: originalScale.x * 1.1,
      y: originalScale.y * 1.1,
      z: originalScale.z * 1.1,
      duration: 0.5,
      ease: "elastic.out(1, 0.3)",
      onComplete: () => {
        gsap.to(model.scale, {
          x: originalScale.x,
          y: originalScale.y,
          z: originalScale.z,
          duration: 0.5,
          ease: "power2.out"
        });
      }
    });
  } else if (type === HealthTransitionType.CRITICAL) {
    // 严重状态时的震动效果
    const originalRotation = {
      x: model.rotation.x,
      z: model.rotation.z
    };
    
    // 创建震动效果
    let time = 0;
    const shakeDuration = 90; // 15帧，约0.25秒
    const shakeIntensity = 0.03;
    
    const shakeAnimation = () => {
      if (time >= shakeDuration) {
        // 恢复原始旋转
        gsap.to(model.rotation, {
          x: originalRotation.x,
          z: originalRotation.z,
          duration: 0.2,
          ease: "power1.out"
        });
        return;
      }
      
      model.rotation.x = originalRotation.x + (Math.random() - 0.5) * shakeIntensity;
      model.rotation.z = originalRotation.z + (Math.random() - 0.5) * shakeIntensity;
      
      time++;
      requestAnimationFrame(shakeAnimation);
    };
    
    shakeAnimation();
  }
};

/**
 * 获取健康状态对应的THREE.Color对象
 * @param health 健康值(0-100)
 */
const getHealthColorAsHex = (health: number): THREE.Color => {
  let color: string;
  
  if (health >= 75) {
    color = '#4CAF50'; // 健康 - 绿色
  } else if (health >= 50) {
    color = '#CDDC39'; // 轻微枯萎 - 青柠色
  } else if (health >= 25) {
    color = '#FFC107'; // 中度枯萎 - 琥珀色
  } else {
    color = '#FF5722'; // 严重枯萎 - 深橙色
  }
  
  return new THREE.Color(color);
};

/**
 * 创建生长阶段变化的动画效果
 * @param model 树木模型
 * @param scene Three.js场景
 * @param fromStage 初始生长阶段
 * @param toStage 目标生长阶段
 */
export const applyGrowthStageEffect = (
  model: THREE.Object3D,
  scene: THREE.Scene,
  fromStage: number,
  toStage: number
): void => {
  // 只有在生长阶段提升时才应用效果
  if (toStage <= fromStage) return;
  
  const modelPosition = new THREE.Vector3();
  model.getWorldPosition(modelPosition);
  
  // 创建生长阶段变化的粒子效果
  const particleConfig: ParticleEffectConfig = {
    count: 150,
    color: '#FFEB3B', // 黄色
    size: 0.06,
    duration: 3,
    spread: 1.5,
    speed: 0.03
  };
  
  createParticleEffect(scene, modelPosition, particleConfig);
  
  // 应用缩放动画
  const originalScale = model.scale.clone();
  const targetScale = {
    x: originalScale.x * (1 + (toStage - fromStage) * 0.15),
    y: originalScale.y * (1 + (toStage - fromStage) * 0.15),
    z: originalScale.z * (1 + (toStage - fromStage) * 0.15)
  };
  
  gsap.to(model.scale, {
    x: targetScale.x,
    y: targetScale.y,
    z: targetScale.z,
    duration: 2,
    ease: "elastic.out(1, 0.5)"
  });
  
  // 随着生长阶段变化，逐渐显示更多叶子
  model.traverse((object) => {
    if ((object as THREE.Mesh).isMesh) {
      const mesh = object as THREE.Mesh;
      
      // 针对有名称的网格
      if (mesh.name.includes('leaf') || mesh.name.includes('branch')) {
        if (!mesh.visible && toStage > 0) {
          // 通过动画逐渐显示叶子
          if (mesh.material) {
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach(mat => {
                if (mat instanceof THREE.Material) {
                  mat.transparent = true;
                  mat.opacity = 0;
                }
              });
            } else if (mesh.material instanceof THREE.Material) {
              mesh.material.transparent = true;
              mesh.material.opacity = 0;
            }
          }
          
          mesh.visible = true;
          
          // 淡入动画
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(mat => {
              if (mat instanceof THREE.Material) {
                gsap.to(mat, { opacity: 1, duration: 1.5, ease: "power2.out" });
              }
            });
          } else if (mesh.material instanceof THREE.Material) {
            gsap.to(mesh.material, { opacity: 1, duration: 1.5, ease: "power2.out" });
          }
        }
      }
    }
  });
}; 