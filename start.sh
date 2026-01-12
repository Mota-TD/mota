#!/bin/bash

# ========================================
#    Mota 平台一键启动脚本 (Linux/Mac)
# ========================================

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 设置目录
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
WEB_DIR="$ROOT_DIR/mota-web-next"
DEPLOY_DIR="$ROOT_DIR/mota-service/deploy"

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}[信息]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[成功]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[警告]${NC} $1"
}

print_error() {
    echo -e "${RED}[错误]${NC} $1"
}

# 检查 Node.js
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js 未安装，请先安装 Node.js 18+"
        echo "下载地址: https://nodejs.org/"
        return 1
    fi
    print_info "Node.js 检查通过: $(node --version)"
    return 0
}

# 检查 Docker
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker 未安装，请先安装 Docker"
        echo "下载地址: https://www.docker.com/products/docker-desktop"
        return 1
    fi
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose 未安装"
        return 1
    fi
    print_info "Docker 环境检查通过"
    return 0
}

# 检查并创建环境变量文件
check_env_file() {
    if [ ! -f "$DEPLOY_DIR/.env" ]; then
        print_info "创建环境变量文件..."
        if [ -f "$DEPLOY_DIR/.env.example" ]; then
            cp "$DEPLOY_DIR/.env.example" "$DEPLOY_DIR/.env"
            print_info "已从 .env.example 创建 .env 文件"
            print_warning "请根据需要修改 $DEPLOY_DIR/.env 中的配置"
        else
            cat > "$DEPLOY_DIR/.env" << 'EOF'
# Mota 环境变量配置

# 部署环境
DEPLOY_ENV=prod
IMAGE_TAG=latest
TZ=Asia/Shanghai

# MySQL 配置
MYSQL_ROOT_PASSWORD=root123
MYSQL_DATABASE=mota
MYSQL_USER=mota
MYSQL_PASSWORD=mota123

# Redis 配置
REDIS_PASSWORD=

# JWT 配置
JWT_SECRET=mota-jwt-secret-key-2024

# MinIO 配置
MINIO_ROOT_USER=mota_admin
MINIO_ROOT_PASSWORD=mota_password

# AI 服务配置 (可选)
OPENAI_API_KEY=
DASHSCOPE_API_KEY=
ANTHROPIC_API_KEY=
EOF
            print_info "已创建默认 .env 文件"
        fi
    fi
}

# Docker Compose 命令 (兼容新旧版本)
docker_compose() {
    if docker compose version &> /dev/null; then
        docker compose "$@"
    else
        docker-compose "$@"
    fi
}

# 启动前端开发服务器
start_frontend() {
    echo ""
    check_node || return 1
    
    echo ""
    print_info "步骤 1/2: 检查并安装依赖..."
    cd "$WEB_DIR"
    if [ ! -d "node_modules" ]; then
        print_info "首次运行，正在安装依赖，请稍候..."
        npm install || { print_error "依赖安装失败"; return 1; }
    fi
    
    print_info "步骤 2/2: 启动开发服务器..."
    echo ""
    echo "========================================"
    echo "  前端服务启动中..."
    echo ""
    echo "  访问地址: http://localhost:3000"
    echo ""
    echo "  提示: 当前使用 Mock 数据"
    echo "  无需启动后端服务即可预览"
    echo ""
    echo "  按 Ctrl+C 停止服务"
    echo "========================================"
    echo ""
    npm run dev
}

# 构建前端生产版本
build_frontend() {
    echo ""
    check_node || return 1
    
    print_info "步骤 1/2: 安装依赖..."
    cd "$WEB_DIR"
    npm install || { print_error "依赖安装失败"; return 1; }
    
    print_info "步骤 2/2: 构建生产版本..."
    npm run build || { print_error "构建失败"; return 1; }
    
    echo ""
    print_success "构建完成，输出目录: .next"
}

# 启动全部 Docker 服务
start_all_docker() {
    echo ""
    check_docker || return 1
    check_env_file
    
    echo ""
    print_info "步骤 1/3: 启动中间件服务..."
    cd "$DEPLOY_DIR"
    docker_compose -f docker-compose.middleware.yml up -d || { print_error "中间件启动失败"; return 1; }
    
    echo ""
    print_info "步骤 2/3: 等待中间件就绪 (约60秒)..."
    print_info "正在等待 MySQL, Redis, Nacos, Kafka, Elasticsearch, Milvus, MinIO 启动..."
    sleep 60
    
    echo ""
    print_info "步骤 3/3: 启动微服务..."
    docker_compose -f docker-compose.services.yml up -d || { print_error "微服务启动失败"; return 1; }
    
    echo ""
    echo "========================================"
    echo "  所有服务启动完成！"
    echo ""
    echo "  服务访问地址:"
    echo "  - API 网关:     http://localhost:8080"
    echo "  - Nacos 控制台: http://localhost:8848/nacos"
    echo "  - MinIO 控制台: http://localhost:9001"
    echo "  - Kibana:       http://localhost:5601 (需启用 tools profile)"
    echo "  - Kafka UI:     http://localhost:8090 (需启用 tools profile)"
    echo ""
    echo "  数据库连接:"
    echo "  - MySQL:        localhost:3306"
    echo "  - Redis:        localhost:6379"
    echo "  - Elasticsearch: localhost:9200"
    echo "  - Milvus:       localhost:19530"
    echo ""
    echo "  使用 'docker-compose ps' 查看服务状态"
    echo "========================================"
}

# 启动中间件
start_middleware() {
    echo ""
    check_docker || return 1
    check_env_file
    
    echo ""
    print_info "启动中间件服务..."
    cd "$DEPLOY_DIR"
    docker_compose -f docker-compose.middleware.yml up -d || { print_error "中间件启动失败"; return 1; }
    
    echo ""
    echo "========================================"
    echo "  中间件服务启动完成！"
    echo ""
    echo "  服务列表:"
    echo "  - MySQL:        localhost:3306"
    echo "  - Redis:        localhost:6379"
    echo "  - Nacos:        localhost:8848"
    echo "  - Kafka:        localhost:9092"
    echo "  - Zookeeper:    localhost:2181"
    echo "  - Elasticsearch: localhost:9200"
    echo "  - Milvus:       localhost:19530"
    echo "  - MinIO:        localhost:9000 (控制台: 9001)"
    echo ""
    echo "  [提示] 中间件需要约60秒完全就绪"
    echo "  [提示] 之后可以选择选项5启动微服务"
    echo "========================================"
}

# 启动微服务
start_services() {
    echo ""
    check_docker || return 1
    
    echo ""
    print_info "检查中间件服务状态..."
    cd "$DEPLOY_DIR"
    if ! docker_compose -f docker-compose.middleware.yml ps 2>/dev/null | grep -q "running"; then
        print_warning "中间件服务可能未启动，建议先启动中间件 (选项4)"
        read -p "是否继续启动微服务? (y/n): " CONTINUE
        if [ "$CONTINUE" != "y" ] && [ "$CONTINUE" != "Y" ]; then
            return 0
        fi
    fi
    
    echo ""
    print_info "启动微服务..."
    docker_compose -f docker-compose.services.yml up -d || { print_error "微服务启动失败"; return 1; }
    
    echo ""
    echo "========================================"
    echo "  微服务启动完成！"
    echo ""
    echo "  服务列表:"
    echo "  - Gateway:      localhost:8080"
    echo "  - Auth:         localhost:8081"
    echo "  - Project:      localhost:8082"
    echo "  - AI:           localhost:8083"
    echo "  - Knowledge:    localhost:8084"
    echo "  - Notify:       localhost:8085"
    echo "  - Calendar:     localhost:8086"
    echo "  - User:         localhost:8087"
    echo "========================================"
}

# 停止所有服务
stop_all() {
    echo ""
    check_docker || return 1
    
    echo ""
    print_info "停止所有服务..."
    cd "$DEPLOY_DIR"
    
    print_info "步骤 1/2: 停止微服务..."
    docker_compose -f docker-compose.services.yml down 2>/dev/null
    
    print_info "步骤 2/2: 停止中间件..."
    docker_compose -f docker-compose.middleware.yml down 2>/dev/null
    
    echo ""
    print_success "所有服务已停止"
    
    read -p "是否同时删除数据卷? (y/n): " REMOVE_VOLUMES
    if [ "$REMOVE_VOLUMES" = "y" ] || [ "$REMOVE_VOLUMES" = "Y" ]; then
        print_info "删除数据卷..."
        docker_compose -f docker-compose.middleware.yml down -v 2>/dev/null
        print_success "数据卷已删除"
    fi
}

# 查看服务状态
show_status() {
    echo ""
    check_docker || return 1
    
    echo ""
    echo "========================================"
    echo "  服务状态"
    echo "========================================"
    cd "$DEPLOY_DIR"
    
    echo ""
    echo "[中间件服务]"
    docker_compose -f docker-compose.middleware.yml ps 2>/dev/null
    
    echo ""
    echo "[微服务]"
    docker_compose -f docker-compose.services.yml ps 2>/dev/null
}

# 查看服务日志
show_logs() {
    check_docker || return 1
    
    echo ""
    echo "请选择要查看的服务日志:"
    echo "  1. 全部服务"
    echo "  2. MySQL"
    echo "  3. Redis"
    echo "  4. Nacos"
    echo "  5. Kafka"
    echo "  6. Elasticsearch"
    echo "  7. Gateway"
    echo "  8. Auth Service"
    echo "  9. Project Service"
    echo "  10. AI Service"
    echo "  0. 返回主菜单"
    echo ""
    read -p "请输入选项: " LOG_CHOICE
    
    cd "$DEPLOY_DIR"
    
    case $LOG_CHOICE in
        0) return 0 ;;
        1) docker_compose -f docker-compose.middleware.yml -f docker-compose.services.yml logs -f --tail=100 ;;
        2) docker_compose -f docker-compose.middleware.yml logs -f --tail=100 mysql ;;
        3) docker_compose -f docker-compose.middleware.yml logs -f --tail=100 redis ;;
        4) docker_compose -f docker-compose.middleware.yml logs -f --tail=100 nacos ;;
        5) docker_compose -f docker-compose.middleware.yml logs -f --tail=100 kafka ;;
        6) docker_compose -f docker-compose.middleware.yml logs -f --tail=100 elasticsearch ;;
        7) docker_compose -f docker-compose.services.yml logs -f --tail=100 gateway ;;
        8) docker_compose -f docker-compose.services.yml logs -f --tail=100 auth-service ;;
        9) docker_compose -f docker-compose.services.yml logs -f --tail=100 project-service ;;
        10) docker_compose -f docker-compose.services.yml logs -f --tail=100 ai-service ;;
        *) print_error "无效选项" ;;
    esac
    
    show_logs
}

# 一键启动全部
start_full() {
    echo ""
    echo "========================================"
    echo "  一键启动全部服务 (后端 + 前端)"
    echo "========================================"
    
    check_docker || return 1
    check_node || return 1
    check_env_file
    
    echo ""
    print_info "步骤 1/4: 启动中间件服务..."
    cd "$DEPLOY_DIR"
    docker_compose -f docker-compose.middleware.yml up -d || { print_error "中间件启动失败"; return 1; }
    
    echo ""
    print_info "步骤 2/4: 等待中间件就绪 (约60秒)..."
    sleep 60
    
    echo ""
    print_info "步骤 3/4: 启动微服务..."
    docker_compose -f docker-compose.services.yml up -d || { print_error "微服务启动失败"; return 1; }
    
    echo ""
    print_info "步骤 4/4: 启动前端开发服务器..."
    cd "$WEB_DIR"
    if [ ! -d "node_modules" ]; then
        print_info "安装前端依赖..."
        npm install
    fi
    
    echo ""
    echo "========================================"
    echo "  全部服务启动完成！"
    echo ""
    echo "  后端服务:"
    echo "  - API 网关:     http://localhost:8080"
    echo "  - Nacos 控制台: http://localhost:8848/nacos"
    echo ""
    echo "  前端服务:"
    echo "  - Web 应用:     http://localhost:3000"
    echo ""
    echo "  按 Ctrl+C 停止前端服务"
    echo "  后端服务将继续在后台运行"
    echo "========================================"
    echo ""
    npm run dev
}

# 主菜单
show_menu() {
    clear
    echo "========================================"
    echo "   Mota 平台一键启动脚本 (Linux/Mac)"
    echo "========================================"
    echo ""
    echo "请选择启动模式:"
    echo ""
    echo "  [前端]"
    echo "  1. 启动前端开发服务器 (使用 Mock 数据，无需后端)"
    echo "  2. 构建前端生产版本"
    echo ""
    echo "  [后端 - Docker]"
    echo "  3. 启动全部服务 (中间件 + 微服务)"
    echo "  4. 仅启动中间件 (MySQL, Redis, Nacos, Kafka, ES, Milvus, MinIO)"
    echo "  5. 仅启动微服务 (需要先启动中间件)"
    echo "  6. 停止所有服务"
    echo "  7. 查看服务状态"
    echo "  8. 查看服务日志"
    echo ""
    echo "  [完整启动]"
    echo "  9. 一键启动全部 (后端 + 前端)"
    echo ""
    echo "  0. 退出"
    echo ""
}

# 主循环
main() {
    while true; do
        show_menu
        read -p "请输入选项 (0-9): " MODE
        
        case $MODE in
            0) echo "再见！"; exit 0 ;;
            1) start_frontend; read -p "按回车键继续..." ;;
            2) build_frontend; read -p "按回车键继续..." ;;
            3) start_all_docker; read -p "按回车键继续..." ;;
            4) start_middleware; read -p "按回车键继续..." ;;
            5) start_services; read -p "按回车键继续..." ;;
            6) stop_all; read -p "按回车键继续..." ;;
            7) show_status; read -p "按回车键继续..." ;;
            8) show_logs ;;
            9) start_full ;;
            *) print_error "无效选项"; sleep 1 ;;
        esac
    done
}

# 运行主程序
main