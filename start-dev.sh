#!/bin/bash
# TaskForest开发环境启动脚本

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # 无颜色

echo -e "${BLUE}启动TaskForest开发环境...${NC}"
echo "===================================="

# 启动后端API服务
echo -e "${YELLOW}启动后端API服务...${NC}"
cd server
node src/dev.js &
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

# 启动前端服务
echo -e "\n启动前端开发服务器..."
cd ../client

# 创建或更新前端环境变量
cat > .env.development.local << EOL
VITE_API_URL=http://localhost:9000/api
EOL

pnpm dev &
CLIENT_PID=$!

# 等待前端服务启动
sleep 3

echo -e "${GREEN}✓ 前端开发服务器已启动${NC}"

# 显示服务地址
echo -e "\n${GREEN}开发环境已就绪!${NC}"
echo -e "${BLUE}前端地址: http://localhost:5173${NC}"
echo -e "${BLUE}API地址: http://localhost:9000${NC}"
echo -e "${BLUE}API健康检查: http://localhost:9000/api/health${NC}"

# 捕获Ctrl+C信号
trap "echo -e '\n正在停止服务...' && kill $API_PID $CLIENT_PID && echo -e '${GREEN}服务已停止${NC}' && exit 0" INT

# 保持脚本运行
wait 