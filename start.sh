#!/bin/bash
# TaskForest项目启动脚本 - Unix/Linux/macOS版本
# 本脚本会启动前端和后端服务

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # 无颜色

# 显示帮助信息
show_help() {
    echo -e "${BLUE}TaskForest项目启动脚本${NC}"
    echo ""
    echo "用法: ./start.sh [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help        显示帮助信息"
    echo "  -f, --frontend    仅启动前端"
    echo "  -b, --backend     仅启动后端"
    echo "  -d, --dev         开发模式（默认）"
    echo "  -p, --prod        生产模式"
    echo ""
    echo "示例:"
    echo "  ./start.sh              # 开发模式启动前后端"
    echo "  ./start.sh -f           # 仅启动前端"
    echo "  ./start.sh -b           # 仅启动后端"
    echo "  ./start.sh -p           # 生产模式启动"
}

# 检查是否安装了必要的软件
check_prerequisites() {
    echo -e "${BLUE}正在检查必要组件...${NC}"
    
    # 检查Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}错误: 未找到Node.js${NC}"
        echo "请安装Node.js 18及以上版本: https://nodejs.org/"
        exit 1
    else
        node_version=$(node -v)
        echo -e "- Node.js: ${GREEN}已安装 ($node_version)${NC}"
    fi
    
    # 检查pnpm
    if ! command -v pnpm &> /dev/null; then
        echo -e "${YELLOW}警告: 未找到pnpm${NC}"
        echo -e "尝试安装pnpm..."
        npm install -g pnpm
        
        # 再次检查pnpm是否安装成功
        if ! command -v pnpm &> /dev/null; then
            echo -e "${RED}错误: pnpm安装失败${NC}"
            echo "请手动安装pnpm: npm install -g pnpm"
            exit 1
        else
            echo -e "- pnpm: ${GREEN}已安装${NC}"
        fi
    else
        pnpm_version=$(pnpm -v)
        echo -e "- pnpm: ${GREEN}已安装 ($pnpm_version)${NC}"
    fi
    
    echo -e "${GREEN}所有必要组件已就绪${NC}"
    echo ""
}

# 安装依赖
install_dependencies() {
    echo -e "${BLUE}安装项目依赖...${NC}"
    
    if [ "$start_frontend" = true ] || [ "$start_backend" = false ]; then
        # 安装根目录依赖
        echo "安装根目录依赖..."
        pnpm install
        
        # 检查安装结果
        if [ $? -ne 0 ]; then
            echo -e "${RED}错误: 根目录依赖安装失败${NC}"
            exit 1
        fi
    fi
    
    if [ "$start_frontend" = true ]; then
        # 安装前端依赖
        echo "安装前端依赖..."
        cd client && pnpm install && cd ..
        
        # 检查安装结果
        if [ $? -ne 0 ]; then
            echo -e "${RED}错误: 前端依赖安装失败${NC}"
            exit 1
        fi
    fi
    
    if [ "$start_backend" = true ]; then
        # 安装后端依赖
        echo "安装后端依赖..."
        cd server && pnpm install && cd ..
        
        # 检查安装结果
        if [ $? -ne 0 ]; then
            echo -e "${RED}错误: 后端依赖安装失败${NC}"
            exit 1
        fi
    fi
    
    echo -e "${GREEN}所有依赖安装完成${NC}"
    echo ""
}

# 启动前端服务
start_frontend_service() {
    echo -e "${BLUE}启动前端服务...${NC}"
    
    if [ "$mode" = "dev" ]; then
        cd client && pnpm dev &
        FRONTEND_PID=$!
        echo -e "${GREEN}前端服务已启动 (PID: $FRONTEND_PID)${NC}"
    else
        cd client && pnpm build && pnpm preview &
        FRONTEND_PID=$!
        echo -e "${GREEN}前端服务已启动 - 生产模式 (PID: $FRONTEND_PID)${NC}"
    fi
    
    cd ..
    echo ""
}

# 启动后端服务
start_backend_service() {
    echo -e "${BLUE}启动后端服务...${NC}"
    
    if [ "$mode" = "dev" ]; then
        cd server && pnpm dev &
        BACKEND_PID=$!
        echo -e "${GREEN}后端服务已启动 (PID: $BACKEND_PID)${NC}"
    else
        cd server && pnpm start &
        BACKEND_PID=$!
        echo -e "${GREEN}后端服务已启动 - 生产模式 (PID: $BACKEND_PID)${NC}"
    fi
    
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
mode="dev"

# 解析参数
while [[ "$#" -gt 0 ]]; do
    case $1 in
        -h|--help) show_help; exit 0 ;;
        -f|--frontend) start_frontend=true; start_backend=false ;;
        -b|--backend) start_frontend=false; start_backend=true ;;
        -d|--dev) mode="dev" ;;
        -p|--prod) mode="prod" ;;
        *) echo "未知参数: $1"; show_help; exit 1 ;;
    esac
    shift
done

# 主流程
echo -e "${BLUE}TaskForest启动脚本 - $mode 模式${NC}"
echo "=================================================="
echo ""

# 检查必要组件
check_prerequisites

# 安装依赖
install_dependencies

# 启动服务
if [ "$start_frontend" = true ]; then
    start_frontend_service
fi

if [ "$start_backend" = true ]; then
    start_backend_service
fi

# 显示服务地址
if [ "$start_frontend" = true ]; then
    echo -e "${GREEN}前端服务运行在: ${BLUE}http://localhost:5173${NC}"
fi

if [ "$start_backend" = true ]; then
    echo -e "${GREEN}后端服务运行在: ${BLUE}http://localhost:3000${NC}"
fi

echo ""
echo -e "${YELLOW}按 Ctrl+C 停止所有服务${NC}"
echo "=================================================="

# 保持脚本运行
wait 