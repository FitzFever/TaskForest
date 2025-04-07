# TaskForest

TaskForest是一款游戏化任务管理应用，用户完成任务后会种下一棵虚拟树木，随着完成更多任务，将形成个人专属的任务森林，提供直观且富有成就感的任务管理体验。

## 项目结构

- `/design` - 包含所有设计资源和文档
  - [设计资源指引](./design/README_设计资源指引.md) - 面向开发人员的设计资源使用指南
  - [3D视觉设计计划](./design/TaskForest_3D视觉设计计划.md) - 3D视觉设计方向和计划
  - [3D视觉进度报告](./design/TaskForest_3D视觉进度报告.md) - 当前设计进度和完成状态
  - [模型制作计划](./design/TaskForest_3D模型制作计划.md) - 模型制作细节规范
  - [材质和纹理规范](./design/TaskForest_材质和纹理规范.md) - 材质标准和参数
  - [动画和特效规范](./design/TaskForest_动画和特效规范.md) - 动画效果和实现指南
  
- `/scripts` - 实用工具脚本
  - [export_gltf.py](./scripts/export_gltf.py) - 将Blender模型导出为glTF/GLB格式的脚本

## 技术栈

- 前端: React + TypeScript + Three.js
- 桌面应用: Electron
- 3D模型: Blender
- 本地数据存储: SQLite / IndexedDB
- AI任务拆解: 接入大语言模型API

## 开发指南

### 设置开发环境

```bash
# 克隆项目
git clone https://github.com/yourusername/TaskForest.git
cd TaskForest

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 设计资源获取

开发人员请参考[设计资源指引](./design/README_设计资源指引.md)获取所需的设计资源和3D模型文件。

## 团队成员

- 项目经理：李明
- 产品设计：王芳
- 3D视觉设计师：林小玲
- 前端开发：张强
- 全栈开发：陈学
- AI集成工程师：吴杰

## 项目计划

TaskForest计划在8周内完成MVP版本，详细进度请参考[项目计划书](./TaskForest项目计划书.md)。

## 许可证

本项目采用MIT许可证 - 详见LICENSE文件