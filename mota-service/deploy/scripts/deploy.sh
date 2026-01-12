#!/bin/bash
# =====================================================
# Mota 平台部署脚本
# =====================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="$(dirname "$SCRIPT_DIR")"

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1"
}

# 显示帮助信息
show_help() {
    echo "Mota 平台部署脚本"
    echo ""
    echo "用法: $0 [命令] [选项]"
    echo ""
    echo "命令:"
    echo "  all           部署所有服务（中间件 + 应用 + 监控）"
    echo "  middleware    仅部署中间件服务"
    echo "  services      仅部署应用服务"
    echo "  monitor       仅部署监控服务"
    echo "  stop          停止所有服务"
    echo "  restart       重启所有服务"
    echo "  status        查看服务状态"
    echo "  logs          查看服务日志"
    echo "  clean         清理所有容器和数据"
    echo "  build         构建服务镜像"
    echo "  pull          拉取最新镜像"
    echo ""
    echo "选项:"
    echo "  -e, --env     指定环境 (dev/test/prod)，默认: dev"
    echo "  -s, --service 指定服务名称"
    echo "  -f, --follow  跟踪日志输出"
    echo "  -h, --help    显示帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 all -e prod           # 生产环境部署所有服务"
    echo "  $0 services -e dev       # 开发环境部署应用服务"
    echo "  $0 logs -s gateway -f    # 跟踪 gateway 服务日志"
    echo "  $0 restart -s auth       # 重启 auth 服务"
}

# 检查环境
check_environment() {
    log_step "检查部署环境..."
    
    # 检查 Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi
    
    # 检查 Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi
    
    # 检查 .env 文件
    if [ ! -f "$DEPLOY_DIR/.env" ]; then
        log_warn ".env 文件不存在，从模板创建..."
        cp "$DEPLOY_DIR/.env.example" "$DEPLOY_DIR/.env"
        log_warn "请编辑 .env 文件配置环境变量"
    fi
    
    log_info "环境检查通过"
}

# 创建必要目录
create_directories() {
    log_step "创建数据目录..."
    
    mkdir -p "$DEPLOY_DIR/data/mysql"
    mkdir -p "$DEPLOY_DIR/data/redis"
    mkdir -p "$DEPLOY_DIR/data/nacos"
    mkdir -p "$DEPLOY_DIR/data/kafka"
    mkdir -p "$DEPLOY_DIR/data/zookeeper"
    mkdir -p "$DEPLOY_DIR/data/elasticsearch"
    mkdir -p "$DEPLOY_DIR/data/milvus"
    mkdir -p "$DEPLOY_DIR/data/minio"
    mkdir -p "$DEPLOY_DIR/data/prometheus"
    mkdir -p "$DEPLOY_DIR/data/grafana"
    mkdir -p "$DEPLOY_DIR/logs"
    mkdir -p "$DEPLOY_DIR/backup"
    
    # 设置 Elasticsearch 目录权限
    chmod 777 "$DEPLOY_DIR/data/elasticsearch"
    
    log_info "数据目录创建完成"
}

# 加载环境变量
load_env() {
    local env_file="$DEPLOY_DIR/.env"
    if [ -f "$env_file" ]; then
        export $(grep -v '^#' "$env_file" | xargs)
    fi
}

# 获取 Docker Compose 命令
get_compose_cmd() {
    if docker compose version &> /dev/null; then
        echo "docker compose"
    else
        echo "docker-compose"
    fi
}

# 部署中间件
deploy_middleware() {
    log_step "部署中间件服务..."
    
    local compose_cmd=$(get_compose_cmd)
    cd "$DEPLOY_DIR"
    
    $compose_cmd -f docker-compose.middleware.yml up -d
    
    log_info "中间件服务部署完成"
    
    # 等待中间件启动
    log_step "等待中间件服务启动..."
    sleep 30
    
    # 检查中间件状态
    check_middleware_health
}

# 检查中间件健康状态
check_middleware_health() {
    log_step "检查中间件健康状态..."
    
    local max_retries=30
    local retry=0
    
    # 检查 MySQL
    while [ $retry -lt $max_retries ]; do
        if docker exec mota-mysql mysqladmin ping -h localhost -u root -p"${MYSQL_ROOT_PASSWORD}" &> /dev/null; then
            log_info "MySQL 已就绪"
            break
        fi
        retry=$((retry + 1))
        sleep 2
    done
    
    if [ $retry -eq $max_retries ]; then
        log_warn "MySQL 启动超时，请检查日志"
    fi
    
    # 检查 Redis
    retry=0
    while [ $retry -lt $max_retries ]; do
        if docker exec mota-redis redis-cli -a "${REDIS_PASSWORD}" ping &> /dev/null; then
            log_info "Redis 已就绪"
            break
        fi
        retry=$((retry + 1))
        sleep 2
    done
    
    if [ $retry -eq $max_retries ]; then
        log_warn "Redis 启动超时，请检查日志"
    fi
    
    # 检查 Nacos
    retry=0
    while [ $retry -lt $max_retries ]; do
        if curl -s "http://localhost:8848/nacos/v1/console/health/readiness" &> /dev/null; then
            log_info "Nacos 已就绪"
            break
        fi
        retry=$((retry + 1))
        sleep 2
    done
    
    if [ $retry -eq $max_retries ]; then
        log_warn "Nacos 启动超时，请检查日志"
    fi
}

# 部署应用服务
deploy_services() {
    log_step "部署应用服务..."
    
    local compose_cmd=$(get_compose_cmd)
    cd "$DEPLOY_DIR"
    
    $compose_cmd -f docker-compose.services.yml up -d
    
    log_info "应用服务部署完成"
}

# 部署监控服务
deploy_monitor() {
    log_step "部署监控服务..."
    
    local compose_cmd=$(get_compose_cmd)
    cd "$DEPLOY_DIR"
    
    $compose_cmd -f docker-compose.monitor.yml up -d
    
    log_info "监控服务部署完成"
}

# 部署所有服务
deploy_all() {
    check_environment
    create_directories
    load_env
    
    deploy_middleware
    deploy_services
    deploy_monitor
    
    log_info "所有服务部署完成！"
    show_access_info
}

# 显示访问信息
show_access_info() {
    echo ""
    echo "=========================================="
    echo "  Mota 平台部署完成"
    echo "=========================================="
    echo ""
    echo "访问地址："
    echo "  - 前端应用: http://localhost"
    echo "  - API 网关: http://localhost/api"
    echo "  - Nacos 控制台: http://localhost:8848/nacos"
    echo "  - Grafana 监控: http://localhost:3000"
    echo "  - Prometheus: http://localhost:9090"
    echo "  - Kibana: http://localhost:5601"
    echo "  - MinIO 控制台: http://localhost:9001"
    echo ""
    echo "默认账号："
    echo "  - Nacos: nacos / nacos"
    echo "  - Grafana: admin / admin"
    echo "  - MinIO: minioadmin / minioadmin"
    echo ""
}

# 停止服务
stop_services() {
    log_step "停止服务..."
    
    local compose_cmd=$(get_compose_cmd)
    cd "$DEPLOY_DIR"
    
    if [ -n "$SERVICE_NAME" ]; then
        $compose_cmd -f docker-compose.yml stop "$SERVICE_NAME"
    else
        $compose_cmd -f docker-compose.yml stop
    fi
    
    log_info "服务已停止"
}

# 重启服务
restart_services() {
    log_step "重启服务..."
    
    local compose_cmd=$(get_compose_cmd)
    cd "$DEPLOY_DIR"
    
    if [ -n "$SERVICE_NAME" ]; then
        $compose_cmd -f docker-compose.yml restart "$SERVICE_NAME"
    else
        $compose_cmd -f docker-compose.yml restart
    fi
    
    log_info "服务已重启"
}

# 查看服务状态
show_status() {
    log_step "服务状态..."
    
    local compose_cmd=$(get_compose_cmd)
    cd "$DEPLOY_DIR"
    
    $compose_cmd -f docker-compose.yml ps
}

# 查看日志
show_logs() {
    local compose_cmd=$(get_compose_cmd)
    cd "$DEPLOY_DIR"
    
    if [ -n "$SERVICE_NAME" ]; then
        if [ "$FOLLOW_LOGS" = true ]; then
            $compose_cmd -f docker-compose.yml logs -f "$SERVICE_NAME"
        else
            $compose_cmd -f docker-compose.yml logs --tail=100 "$SERVICE_NAME"
        fi
    else
        if [ "$FOLLOW_LOGS" = true ]; then
            $compose_cmd -f docker-compose.yml logs -f
        else
            $compose_cmd -f docker-compose.yml logs --tail=100
        fi
    fi
}

# 清理服务
clean_services() {
    log_warn "警告：此操作将删除所有容器和数据！"
    read -p "确认继续？(y/N) " confirm
    
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        log_info "操作已取消"
        exit 0
    fi
    
    log_step "清理服务..."
    
    local compose_cmd=$(get_compose_cmd)
    cd "$DEPLOY_DIR"
    
    $compose_cmd -f docker-compose.yml down -v --remove-orphans
    
    # 清理数据目录
    read -p "是否清理数据目录？(y/N) " clean_data
    if [ "$clean_data" = "y" ] || [ "$clean_data" = "Y" ]; then
        rm -rf "$DEPLOY_DIR/data"
        log_info "数据目录已清理"
    fi
    
    log_info "清理完成"
}

# 构建镜像
build_images() {
    log_step "构建服务镜像..."
    
    local compose_cmd=$(get_compose_cmd)
    cd "$DEPLOY_DIR"
    
    if [ -n "$SERVICE_NAME" ]; then
        $compose_cmd -f docker-compose.services.yml build "$SERVICE_NAME"
    else
        $compose_cmd -f docker-compose.services.yml build
    fi
    
    log_info "镜像构建完成"
}

# 拉取镜像
pull_images() {
    log_step "拉取最新镜像..."
    
    local compose_cmd=$(get_compose_cmd)
    cd "$DEPLOY_DIR"
    
    $compose_cmd -f docker-compose.middleware.yml pull
    $compose_cmd -f docker-compose.monitor.yml pull
    
    log_info "镜像拉取完成"
}

# 解析参数
COMMAND=""
ENVIRONMENT="dev"
SERVICE_NAME=""
FOLLOW_LOGS=false

while [[ $# -gt 0 ]]; do
    case $1 in
        all|middleware|services|monitor|stop|restart|status|logs|clean|build|pull)
            COMMAND=$1
            shift
            ;;
        -e|--env)
            ENVIRONMENT=$2
            shift 2
            ;;
        -s|--service)
            SERVICE_NAME=$2
            shift 2
            ;;
        -f|--follow)
            FOLLOW_LOGS=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            log_error "未知参数: $1"
            show_help
            exit 1
            ;;
    esac
done

# 执行命令
case $COMMAND in
    all)
        deploy_all
        ;;
    middleware)
        check_environment
        create_directories
        load_env
        deploy_middleware
        ;;
    services)
        check_environment
        load_env
        deploy_services
        ;;
    monitor)
        check_environment
        load_env
        deploy_monitor
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    clean)
        clean_services
        ;;
    build)
        build_images
        ;;
    pull)
        pull_images
        ;;
    *)
        show_help
        exit 1
        ;;
esac