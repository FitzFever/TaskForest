#!/bin/bash
# TaskForest项目启动脚本 - 测试版本
# 本脚本会启动前端和后端测试服务

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # 无颜色

# 显示帮助信息
show_help() {
    echo -e "${BLUE}TaskForest项目测试启动脚本${NC}"
    echo ""
    echo "用法: ./start-test.sh [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help        显示帮助信息"
    echo "  -f, --frontend    仅启动前端"
    echo "  -b, --backend     仅启动后端"
    echo ""
    echo "示例:"
    echo "  ./start-test.sh              # 开发模式启动前后端"
    echo "  ./start-test.sh -f           # 仅启动前端"
    echo "  ./start-test.sh -b           # 仅启动后端"
}

# 检查服务器状态
check_server_status() {
    local url=$1
    local max_attempts=$2
    local attempt=1
    local delay=2
    
    echo -e "正在等待服务启动 $url ..."
    
    while [ $attempt -le $max_attempts ]
    do
        if curl -s $url > /dev/null
        then
            echo -e "${GREEN}服务已成功启动!${NC}"
            return 0
        fi
        
        echo -n "."
        sleep $delay
        attempt=$((attempt+1))
    done
    
    echo -e "\n${RED}服务启动检查超时${NC}"
    return 1
}

# 启动前端服务
start_frontend_service() {
    echo -e "${BLUE}启动前端服务...${NC}"
    
    # 首先删除前端的强制模拟数据模式
    cd client
    # 修改taskService.ts文件，使用真实API而非模拟数据
    sed -i '' 's/export const USE_MOCK = true;/export const USE_MOCK = process.env.REACT_APP_USE_MOCK === "true" || process.env.NODE_ENV === "development";/' src/services/taskService.ts || echo "无法修改taskService.ts文件，前端可能仍使用模拟数据"
    
    # 启动前端服务
    pnpm dev &
    FRONTEND_PID=$!
    echo -e "${GREEN}前端服务已启动 (PID: $FRONTEND_PID)${NC}"
    cd ..
    echo ""
}

# 启动后端测试服务
start_backend_service() {
    echo -e "${BLUE}启动后端测试服务...${NC}"
    
    cd server
    # 启动测试服务器
    node src/test-app.js &
    BACKEND_PID=$!
    echo -e "${GREEN}后端测试服务已启动 (PID: $BACKEND_PID)${NC}"
    
    # 检查服务是否成功启动
    check_server_status "http://localhost:9000/api/health" 10
    cd ..
    echo ""
}

# 处理Ctrl+C信号
handle_interrupt() {
    echo -e "\n${YELLOW}正在停止服务...${NC}"
    
    if [ -n "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo "前端服务已停止"
    fi
    
    if [ -n "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo "后端服务已停止"
    fi
    
    echo -e "${GREEN}服务已全部停止${NC}"
    exit 0
}

# 注册信号处理
trap handle_interrupt SIGINT

# 默认值
start_frontend=true
start_backend=true

# 解析参数
while [[ "$#" -gt 0 ]]; do
    case $1 in
        -h|--help) show_help; exit 0 ;;
        -f|--frontend) start_frontend=true; start_backend=false ;;
        -b|--backend) start_frontend=false; start_backend=true ;;
        *) echo "未知参数: $1"; show_help; exit 1 ;;
    esac
    shift
done

# 主流程
echo -e "${BLUE}TaskForest测试启动脚本${NC}"
echo "=================================================="
echo ""

# 启动服务
if [ "$start_backend" = true ]; then
    start_backend_service
fi

if [ "$start_frontend" = true ]; then
    start_frontend_service
fi

# 显示服务地址
if [ "$start_frontend" = true ]; then
    echo -e "${GREEN}前端服务运行在: ${BLUE}http://localhost:5173${NC}"
fi

if [ "$start_backend" = true ]; then
    echo -e "${GREEN}后端服务运行在: ${BLUE}http://localhost:9000${NC}"
    echo -e "${GREEN}API基础路径: ${BLUE}http://localhost:9000/api${NC}"
    echo -e "${GREEN}API健康检查: ${BLUE}http://localhost:9000/api/health${NC}"
fi

echo ""
echo -e "${YELLOW}按 Ctrl+C 停止所有服务${NC}"
echo "=================================================="

# 保持脚本运行
wait 