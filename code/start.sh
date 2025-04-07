#!/bin/bash

# 设置颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
  echo -e "${GREEN}[TaskForest]${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}[警告]${NC} $1"
}

print_error() {
  echo -e "${RED}[错误]${NC} $1"
}

# 确保在正确的目录中
cd "$(dirname "$0")/electron-vite-project" || {
  print_error "无法进入项目目录"
  exit 1
}

print_message "欢迎使用 TaskForest 任务管理系统！"
print_message "开始启动流程...\n"

# 检查依赖是否已安装
if [ ! -d "node_modules" ]; then
  print_message "正在安装依赖，这可能需要几分钟..."
  npm install --legacy-peer-deps || {
    print_error "依赖安装失败"
    print_message "尝试修复，请稍候..."
    rm -rf node_modules
    npm cache clean --force
    npm install --legacy-peer-deps || {
      print_error "依赖安装失败，请手动运行: npm install --legacy-peer-deps"
      exit 1
    }
  }
  print_message "依赖安装完成！"
else
  print_message "依赖已安装，跳过安装步骤。"
fi

# 检查数据库是否已初始化
if [ ! -f "prisma/dev.db" ]; then
  print_message "正在初始化数据库..."
  npx prisma migrate dev --name init || {
    print_error "数据库初始化失败"
    exit 1
  }
  
  print_message "正在填充示例数据..."
  # 简化的种子数据脚本，避免使用ts-node
  node -e "
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  
  async function seed() {
    // 默认分类
    const categories = [
      { name: '工作', color: '#1890ff' },
      { name: '学习', color: '#52c41a' },
      { name: '生活', color: '#fa8c16' },
      { name: '健康', color: '#eb2f96' }
    ];
    
    // 创建分类
    for (const category of categories) {
      await prisma.category.create({ data: category });
    }
    
    // 创建示例任务和树木
    const types = ['oak', 'pine', 'cherry', 'palm'];
    const allCategories = await prisma.category.findMany();
    
    for (let i = 0; i < 4; i++) {
      // 创建树木
      const tree = await prisma.tree.create({
        data: {
          type: types[i % types.length],
          growthStage: Math.floor(Math.random() * 5) + 1,
          position: \`\${Math.random() * 10 - 5},0,\${Math.random() * 10 - 5}\`
        }
      });
      
      // 创建任务
      await prisma.task.create({
        data: {
          title: \`示例任务 \${i + 1}\`,
          description: '这是一个自动创建的示例任务',
          status: Math.random() > 0.5 ? '已完成' : '进行中',
          priority: ['低', '中', '高'][Math.floor(Math.random() * 3)],
          categoryId: allCategories[i % allCategories.length].id,
          treeId: tree.id
        }
      });
    }
    
    console.log('数据库种子数据创建完成');
  }
  
  seed()
    .catch(e => {
      console.error('初始化数据失败:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
  " || {
    print_warning "示例数据填充失败，但应用仍可使用"
  }
  
  print_message "数据库初始化完成！"
else
  print_message "数据库已初始化，跳过数据库初始化步骤。"
fi

# 检查并创建models目录
MODELS_DIR="$(dirname "$0")/../models"
if [ ! -d "$MODELS_DIR" ]; then
  print_message "创建模型目录..."
  mkdir -p "$MODELS_DIR"
fi

# 为每种树创建简单模型文件（如果不存在）
TREE_TYPES=("oak" "pine" "cherry" "palm" "maple" "willow" "rubber" "apple")

for tree_type in "${TREE_TYPES[@]}"; do
  MODEL_FILE="$MODELS_DIR/${tree_type}_tree.glb"
  if [ ! -f "$MODEL_FILE" ]; then
    print_message "创建${tree_type}树的示例模型文件..."
    
    # 创建一个简单的占位模型文件
    echo "GLTF_BINARY_FILE" > "$MODEL_FILE"
    
    print_message "创建${tree_type}树模型完成"
  fi
done

# 修复启动黑屏问题 - 创建必要的环境变量
print_message "配置环境变量..."
export ELECTRON_DISABLE_SECURITY_WARNINGS=true
export VITE_DEV_SERVER_HOST=127.0.0.1

# 启动应用
print_message "正在启动 TaskForest 应用程序...\n"

# 使用开发模式启动，这将使用简易模型
VITE_USE_SIMPLE_MODELS=true npm run electron:dev 