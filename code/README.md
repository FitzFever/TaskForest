# TaskForest 代码目录

这是TaskForest项目的代码目录，包含所有源代码和技术文档。

## 快速启动

我们提供了简单的一键启动脚本，自动处理安装依赖、初始化数据库和启动应用程序的过程：

### macOS / Linux 用户

1. 打开终端
2. 进入项目代码目录
3. 运行启动脚本：
   ```bash
   chmod +x start.sh  # 只需第一次运行时执行
   ./start.sh
   ```

### Windows 用户

1. 打开项目文件夹
2. 双击 `start.bat` 文件运行

启动脚本会自动：
- 检查并安装依赖
- 初始化数据库（如果尚未初始化）
- 创建示例数据
- 创建必要的3D模型文件
- 配置环境变量
- 启动应用程序

> **注意**：首次启动可能需要几分钟时间来安装依赖和初始化数据库。

### 常见问题解决

如果遇到黑屏问题，可尝试以下解决方法：

1. **重新运行启动脚本**：我们的启动脚本已经包含解决黑屏问题的修复措施
2. **确保models目录存在**：在项目根目录下应该有一个`models`文件夹，其中包含各种树木的模型文件
3. **使用简易模型模式**：启动时可以设置环境变量`VITE_USE_SIMPLE_MODELS=true`来强制使用简易模型渲染

## 目录结构

- **[electron-vite-project/](./electron-vite-project/)** - 主项目代码目录
  - 包含Electron应用、React前端和数据库实现
  - 查看[项目实现README](./electron-vite-project/README.md)获取详细说明

- **[docs/](./docs/)** - 技术文档目录
  - [development_tasks.md](./docs/development_tasks.md) - 详细的开发任务清单
  - API文档和架构设计

## 技术栈

- **前端**: React、TypeScript、Tailwind CSS、Ant Design
- **3D渲染**: Three.js、React Three Fiber
- **后端**: Electron、Node.js
- **数据库**: SQLite、Prisma ORM
- **工具链**: Vite、ESLint、Prettier

## 手动启动（高级用户）

如果您需要更精细的控制，可以手动执行以下步骤：

```bash
# 进入项目目录
cd electron-vite-project

# 安装依赖
npm install --legacy-peer-deps

# 初始化数据库
npx prisma migrate dev --name init

# 启动应用（使用简易模型模式）
VITE_USE_SIMPLE_MODELS=true npm run electron:dev
```

## 快速链接

- [项目实现说明](./electron-vite-project/README.md)
- [开发任务清单](./docs/development_tasks.md)
- [主项目README](../README.md)
- [项目计划书](../TaskForest项目计划书.md) 