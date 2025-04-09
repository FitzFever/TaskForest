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
cd "$(dirname "$0")" # 确保在server目录中
node src/dev.js &
BACKEND_PID=$!

# 等待后端启动
sleep 2

# 检查后端是否正常运行
if curl -s http://localhost:9000/api/health > /dev/null; then
  echo -e "${GREEN}后端API服务已成功启动!${NC}"
else
  echo -e "${RED}后端API服务启动失败!${NC}"
  kill $BACKEND_PID 2>/dev/null
  exit 1
fi

# 启动前端服务
echo -e "${YELLOW}启动前端服务...${NC}"
cd ../client

# 确保前端使用的是API服务而非模拟数据
echo "REACT_APP_DEV_API_URL=http://localhost:9000/api" > .env.development.local
echo "REACT_APP_USE_MOCK=false" >> .env.development.local
echo -e "${GREEN}已创建前端环境配置文件${NC}"

pnpm dev &
FRONTEND_PID=$!

echo -e "\n${GREEN}开发环境已启动!${NC}"
echo -e "前端服务: ${BLUE}http://localhost:5173${NC}"
echo -e "后端API: ${BLUE}http://localhost:9000/api${NC}"
echo -e "API健康检查: ${BLUE}http://localhost:9000/api/health${NC}"
echo -e "\n${YELLOW}按 Ctrl+C 停止所有服务${NC}"
echo "===================================="

# 处理Ctrl+C信号
trap "echo -e '\n${YELLOW}正在停止服务...${NC}'; kill $BACKEND_PID 2>/dev/null; kill $FRONTEND_PID 2>/dev/null; echo -e '${GREEN}服务已停止${NC}'; exit 0" INT

# 保持脚本运行
wait 