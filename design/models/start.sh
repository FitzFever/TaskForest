#!/bin/bash

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # 无颜色

echo -e "${GREEN}==================================================${NC}"
echo -e "${GREEN}     TaskForest 3D模型查看器服务启动脚本     ${NC}"
echo -e "${GREEN}==================================================${NC}"
echo ""

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}错误: 未检测到Node.js${NC}"
    echo "请先安装Node.js: https://nodejs.org/"
    exit 1
fi

# 当前目录路径
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo -e "${BLUE}启动服务中...${NC}"

# 添加执行权限
chmod +x serve.js

# 启动服务器
node serve.js

# 捕获Ctrl+C信号
trap 'echo -e "\n${YELLOW}服务已停止${NC}"; exit 0' INT 