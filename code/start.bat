@echo off
setlocal enabledelayedexpansion

:: 设置颜色输出
set "GREEN=[92m"
set "YELLOW=[93m"
set "RED=[91m"
set "NC=[0m"

:: 打印带颜色的消息
call :print_message "欢迎使用 TaskForest 任务管理系统！"
call :print_message "开始启动流程...\n"

:: 确保在正确的目录中
cd /d "%~dp0\electron-vite-project" || (
  call :print_error "无法进入项目目录"
  exit /b 1
)

:: 检查依赖是否已安装
if not exist "node_modules" (
  call :print_message "正在安装依赖，这可能需要几分钟..."
  call npm install --legacy-peer-deps
  if !errorlevel! neq 0 (
    call :print_error "依赖安装失败"
    call :print_message "尝试修复，请稍候..."
    rd /s /q node_modules 2>nul
    call npm cache clean --force
    call npm install --legacy-peer-deps
    if !errorlevel! neq 0 (
      call :print_error "依赖安装失败，请手动运行: npm install --legacy-peer-deps"
      exit /b 1
    )
  )
  call :print_message "依赖安装完成！"
) else (
  call :print_message "依赖已安装，跳过安装步骤。"
)

:: 检查数据库是否已初始化
if not exist "prisma\dev.db" (
  call :print_message "正在初始化数据库..."
  call npx prisma migrate dev --name init
  if !errorlevel! neq 0 (
    call :print_error "数据库初始化失败"
    exit /b 1
  )
  
  call :print_message "正在填充示例数据..."
  :: 简化的种子数据脚本，避免使用ts-node
  node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); async function seed() { const categories = [{ name: '工作', color: '#1890ff' }, { name: '学习', color: '#52c41a' }, { name: '生活', color: '#fa8c16' }, { name: '健康', color: '#eb2f96' }]; for (const category of categories) { await prisma.category.create({ data: category }); } const types = ['oak', 'pine', 'cherry', 'palm']; const allCategories = await prisma.category.findMany(); for (let i = 0; i < 4; i++) { const tree = await prisma.tree.create({ data: { type: types[i %% types.length], growthStage: Math.floor(Math.random() * 5) + 1, position: `${Math.random() * 10 - 5},0,${Math.random() * 10 - 5}` } }); await prisma.task.create({ data: { title: `示例任务 ${i + 1}`, description: '这是一个自动创建的示例任务', status: Math.random() > 0.5 ? '已完成' : '进行中', priority: ['低', '中', '高'][Math.floor(Math.random() * 3)], categoryId: allCategories[i %% allCategories.length].id, treeId: tree.id } }); } console.log('数据库种子数据创建完成'); } seed().catch(e => { console.error('初始化数据失败:', e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });"
  if !errorlevel! neq 0 (
    call :print_warning "示例数据填充失败，但应用仍可使用"
  )
  
  call :print_message "数据库初始化完成！"
) else (
  call :print_message "数据库已初始化，跳过数据库初始化步骤。"
)

:: 检查并创建models目录
set "MODELS_DIR=%~dp0..\models"
if not exist "%MODELS_DIR%" (
  call :print_message "创建模型目录..."
  mkdir "%MODELS_DIR%"
)

:: 为每种树创建简单模型文件（如果不存在）
set "TREE_TYPES=oak pine cherry palm maple willow rubber apple"

for %%t in (%TREE_TYPES%) do (
  set "MODEL_FILE=%MODELS_DIR%\%%t_tree.glb"
  if not exist "!MODEL_FILE!" (
    call :print_message "创建%%t树的示例模型文件..."
    
    :: 创建一个简单的占位模型文件
    echo GLTF_BINARY_FILE > "!MODEL_FILE!"
    
    call :print_message "创建%%t树模型完成"
  )
)

:: 修复启动黑屏问题 - 创建必要的环境变量
call :print_message "配置环境变量..."
set "ELECTRON_DISABLE_SECURITY_WARNINGS=true"
set "VITE_DEV_SERVER_HOST=127.0.0.1"
set "VITE_USE_SIMPLE_MODELS=true"

:: 启动应用
call :print_message "正在启动 TaskForest 应用程序...\n"
call npm run electron:dev
exit /b 0

:: 函数定义
:print_message
echo %GREEN%[TaskForest]%NC% %~1
exit /b 0

:print_warning
echo %YELLOW%[警告]%NC% %~1
exit /b 0

:print_error
echo %RED%[错误]%NC% %~1
exit /b 0 