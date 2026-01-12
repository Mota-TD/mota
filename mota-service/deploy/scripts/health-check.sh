#!/bin/bash
# =====================================================
# Mota 平台健康检查脚本
# =====================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="$(dirname "$SCRIPT_DIR")"

# 日志函数
log_info() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[!]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[→]${NC} $1"
}

# 加载环境变量
load_env() {
    local env_file="$DEPLOY_DIR/.env"
    if [ -f "$env_file" ]; then
        export $(grep -v '^#' "$env_file" | xargs)
    fi
}

# 显示帮助信息
show_help() {
    echo "Mota 平台健康检查脚本"
    echo ""
    echo "用法: $0 [命令] [选项]"
    echo ""
    echo "命令:"
    echo "  all         检查所有服务"
    echo "  middleware  检查中间件服务"
    echo "  services    检查应用服务"
    echo "  monitor     检查监控服务"
    echo "  quick       快速检查（仅检查关键服务）"
    echo ""
    echo "选项:"
    echo "  -v, --verbose  显示详细信息"
    echo "  -j, --json     输出 JSON 格式"
    echo "  -h, --help     显示帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 all -v      # 详细检查所有服务"
    echo "  $0 quick       # 快速检查关键服务"
    echo "  $0 all -j      # JSON 格式输出"
}

# 检查服务状态
check_service() {
    local service_name=$1
    local container_name=$2
    local check_cmd=$3
    
    if docker ps --format '{{.Names}}' | grep -q "^${container_name}$"; then
        if [ -n "$check_cmd" ]; then
            if eval "$check_cmd" &> /dev/null; then
                log_info "$service_name: 运行中且健康"
                return 0
            else
                log_warn "$service_name: 运行中但不健康"
                return 1
            fi
        else
            log_info "$service_name: 运行中"
            return 0
        fi
    else
        log_error "$service_name: 未运行"
        return 2
    fi
}

# 检查 HTTP 端点
check_http() {
    local url=$1
    local timeout=${2:-5}
    
    curl -sf --max-time "$timeout" "$url" &> /dev/null
}

# 检查 TCP 端口
check_port() {
    local host=$1
    local port=$2
    local timeout=${3:-5}
    
    timeout "$timeout" bash -c "cat < /dev/null > /dev/tcp/$host/$port" 2>/dev/null
}

# 检查中间件服务
check_middleware() {
    echo ""
    echo "=========================================="
    echo "  中间件服务健康检查"
    echo "=========================================="
    echo ""
    
    local failed=0
    
    # MySQL
    check_service "MySQL" "mota-mysql" \
        "docker exec mota-mysql mysqladmin ping -h localhost -u root -p'${MYSQL_ROOT_PASSWORD}'" || ((failed++))
    
    # Redis
    check_service "Redis" "mota-redis" \
        "docker exec mota-redis redis-cli -a '${REDIS_PASSWORD}' ping" || ((failed++))
    
    # Nacos
    check_service "Nacos" "mota-nacos" \
        "check_http 'http://localhost:8848/nacos/v1/console/health/readiness'" || ((failed++))
    
    # Kafka
    check_service "Kafka" "mota-kafka" \
        "docker exec mota-kafka kafka-broker-api-versions.sh --bootstrap-server localhost:9092" || ((failed++))
    
    # Zookeeper
    check_service "Zookeeper" "mota-zookeeper" \
        "docker exec mota-zookeeper zkServer.sh status" || ((failed++))
    
    # Elasticsearch
    check_service "Elasticsearch" "mota-elasticsearch" \
        "check_http 'http://localhost:9200/_cluster/health'" || ((failed++))
    
    # Milvus
    check_service "Milvus" "mota-milvus" \
        "check_http 'http://localhost:9091/healthz'" || ((failed++))
    
    # MinIO
    check_service "MinIO" "mota-minio" \
        "check_http 'http://localhost:9000/minio/health/live'" || ((failed++))
    
    return $failed
}

# 检查应用服务
check_services() {
    echo ""
    echo "=========================================="
    echo "  应用服务健康检查"
    echo "=========================================="
    echo ""
    
    local failed=0
    
    # Gateway
    check_service "Gateway" "mota-gateway" \
        "check_http 'http://localhost:8080/actuator/health'" || ((failed++))
    
    # Auth Service
    check_service "Auth Service" "mota-auth-service" \
        "check_http 'http://localhost:8081/actuator/health'" || ((failed++))
    
    # User Service
    check_service "User Service" "mota-user-service" \
        "check_http 'http://localhost:8082/actuator/health'" || ((failed++))
    
    # Project Service
    check_service "Project Service" "mota-project-service" \
        "check_http 'http://localhost:8083/actuator/health'" || ((failed++))
    
    # AI Service
    check_service "AI Service" "mota-ai-service" \
        "check_http 'http://localhost:8084/actuator/health'" || ((failed++))
    
    # Knowledge Service
    check_service "Knowledge Service" "mota-knowledge-service" \
        "check_http 'http://localhost:8085/actuator/health'" || ((failed++))
    
    # Notify Service
    check_service "Notify Service" "mota-notify-service" \
        "check_http 'http://localhost:8086/actuator/health'" || ((failed++))
    
    # Calendar Service
    check_service "Calendar Service" "mota-calendar-service" \
        "check_http 'http://localhost:8087/actuator/health'" || ((failed++))
    
    return $failed
}

# 检查监控服务
check_monitor() {
    echo ""
    echo "=========================================="
    echo "  监控服务健康检查"
    echo "=========================================="
    echo ""
    
    local failed=0
    
    # Prometheus
    check_service "Prometheus" "mota-prometheus" \
        "check_http 'http://localhost:9090/-/healthy'" || ((failed++))
    
    # Grafana
    check_service "Grafana" "mota-grafana" \
        "check_http 'http://localhost:3000/api/health'" || ((failed++))
    
    # AlertManager
    check_service "AlertManager" "mota-alertmanager" \
        "check_http 'http://localhost:9093/-/healthy'" || ((failed++))
    
    # Logstash
    check_service "Logstash" "mota-logstash" "" || ((failed++))
    
    # Kibana
    check_service "Kibana" "mota-kibana" \
        "check_http 'http://localhost:5601/api/status'" || ((failed++))
    
    return $failed
}

# 快速检查
quick_check() {
    echo ""
    echo "=========================================="
    echo "  快速健康检查"
    echo "=========================================="
    echo ""
    
    local failed=0
    
    # 关键中间件
    check_service "MySQL" "mota-mysql" \
        "docker exec mota-mysql mysqladmin ping -h localhost -u root -p'${MYSQL_ROOT_PASSWORD}'" || ((failed++))
    
    check_service "Redis" "mota-redis" \
        "docker exec mota-redis redis-cli -a '${REDIS_PASSWORD}' ping" || ((failed++))
    
    check_service "Nacos" "mota-nacos" \
        "check_http 'http://localhost:8848/nacos/v1/console/health/readiness'" || ((failed++))
    
    # 关键应用服务
    check_service "Gateway" "mota-gateway" \
        "check_http 'http://localhost:8080/actuator/health'" || ((failed++))
    
    return $failed
}

# 检查所有服务
check_all() {
    local middleware_failed=0
    local services_failed=0
    local monitor_failed=0
    
    check_middleware || middleware_failed=$?
    check_services || services_failed=$?
    check_monitor || monitor_failed=$?
    
    echo ""
    echo "=========================================="
    echo "  健康检查汇总"
    echo "=========================================="
    echo ""
    
    local total_failed=$((middleware_failed + services_failed + monitor_failed))
    
    if [ $total_failed -eq 0 ]; then
        log_info "所有服务运行正常"
    else
        log_error "共有 $total_failed 个服务异常"
        echo ""
        echo "  中间件异常: $middleware_failed"
        echo "  应用服务异常: $services_failed"
        echo "  监控服务异常: $monitor_failed"
    fi
    
    return $total_failed
}

# 输出 JSON 格式
output_json() {
    local check_type=$1
    
    echo "{"
    echo "  \"timestamp\": \"$(date -Iseconds)\","
    echo "  \"check_type\": \"$check_type\","
    echo "  \"services\": ["
    
    # 这里可以扩展为实际的 JSON 输出
    # 目前简化处理
    
    echo "  ]"
    echo "}"
}

# 详细模式
VERBOSE=false
JSON_OUTPUT=false

# 解析参数
COMMAND=""

while [[ $# -gt 0 ]]; do
    case $1 in
        all|middleware|services|monitor|quick)
            COMMAND=$1
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -j|--json)
            JSON_OUTPUT=true
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

# 加载环境变量
load_env

# 执行命令
case $COMMAND in
    all)
        check_all
        ;;
    middleware)
        check_middleware
        ;;
    services)
        check_services
        ;;
    monitor)
        check_monitor
        ;;
    quick)
        quick_check
        ;;
    *)
        show_help
        exit 1
        ;;
esac

exit $?