#!/bin/bash
# TaskForest开发环境启动脚本（带示例数据）

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # 无颜色

echo -e "${BLUE}启动TaskForest开发环境（带示例数据）...${NC}"
echo "=============================================="

# 设置环境变量以加载示例数据
export LOAD_DEMO_DATA=true
export NODE_ENV=development

# 启动后端API服务
echo -e "${YELLOW}启动后端API服务...${NC}"
node src/index.js &
API_PID=$!

# 等待API服务启动
sleep 2

# 检查API服务是否成功启动
curl -s http://localhost:9000/api/health > /dev/null
if [ $? -ne 0 ]; then
    echo -e "${RED}后端API服务启动失败!${NC}"
    kill $API_PID
    exit 1
fi

echo -e "${GREEN}✓ 后端API服务已启动${NC}"
echo -e "${BLUE}API地址: http://localhost:9000${NC}"
echo -e "${GREEN}✓ 示例数据已加载${NC}"

# 显示服务地址
echo -e "\n${GREEN}开发环境已就绪!${NC}"
echo -e "${BLUE}API地址: http://localhost:9000${NC}"
echo -e "${BLUE}API健康检查: http://localhost:9000/api/health${NC}"

# 捕获Ctrl+C信号
trap "echo -e '\n正在停止服务...' && kill $API_PID && echo -e '${GREEN}服务已停止${NC}' && exit 0" INT

# 保持脚本运行
wait 