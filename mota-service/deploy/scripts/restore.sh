#!/bin/bash
# =====================================================
# Mota 平台恢复脚本
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
BACKUP_DIR="$DEPLOY_DIR/backup"

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

# 加载环境变量
load_env() {
    local env_file="$DEPLOY_DIR/.env"
    if [ -f "$env_file" ]; then
        export $(grep -v '^#' "$env_file" | xargs)
    fi
}

# 显示帮助信息
show_help() {
    echo "Mota 平台恢复脚本"
    echo ""
    echo "用法: $0 [命令] [选项]"
    echo ""
    echo "命令:"
    echo "  mysql     恢复 MySQL 数据库"
    echo "  redis     恢复 Redis 数据"
    echo "  minio     恢复 MinIO 文件"
    echo "  config    恢复配置文件"
    echo "  list      列出可用备份"
    echo ""
    echo "选项:"
    echo "  -f, --file      指定备份文件路径"
    echo "  -d, --database  指定目标数据库名称"
    echo "  -y, --yes       跳过确认提示"
    echo "  -h, --help      显示帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 mysql -f backup/mysql/mota_project_backup_20240101_120000.sql.gz"
    echo "  $0 redis -f backup/redis/redis_backup_20240101_120000.rdb.gz"
    echo "  $0 list"
}

# 列出可用备份
list_backups() {
    log_step "可用备份列表..."
    
    echo ""
    echo "MySQL 备份:"
    if [ -d "$BACKUP_DIR/mysql" ]; then
        ls -lht "$BACKUP_DIR/mysql/"*.gz 2>/dev/null | head -20 || echo "  无备份"
    else
        echo "  无备份"
    fi
    
    echo ""
    echo "Redis 备份:"
    if [ -d "$BACKUP_DIR/redis" ]; then
        ls -lht "$BACKUP_DIR/redis/"*.gz 2>/dev/null | head -20 || echo "  无备份"
    else
        echo "  无备份"
    fi
    
    echo ""
    echo "MinIO 备份:"
    if [ -d "$BACKUP_DIR/minio" ]; then
        ls -lht "$BACKUP_DIR/minio/"*.tar.gz 2>/dev/null | head -20 || echo "  无备份"
    else
        echo "  无备份"
    fi
    
    echo ""
    echo "配置备份:"
    if [ -d "$BACKUP_DIR/config" ]; then
        ls -lht "$BACKUP_DIR/config/"*.tar.gz 2>/dev/null | head -20 || echo "  无备份"
    else
        echo "  无备份"
    fi
}

# 确认操作
confirm_action() {
    if [ "$SKIP_CONFIRM" = true ]; then
        return 0
    fi
    
    log_warn "警告：此操作将覆盖现有数据！"
    read -p "确认继续？(y/N) " confirm
    
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        log_info "操作已取消"
        exit 0
    fi
}

# 恢复 MySQL
restore_mysql() {
    if [ -z "$BACKUP_FILE" ]; then
        log_error "请指定备份文件路径 (-f)"
        exit 1
    fi
    
    if [ ! -f "$BACKUP_FILE" ]; then
        log_error "备份文件不存在: $BACKUP_FILE"
        exit 1
    fi
    
    confirm_action
    
    log_step "恢复 MySQL 数据库..."
    
    # 从文件名提取数据库名（如果未指定）
    if [ -z "$DATABASE_NAME" ]; then
        # 尝试从文件名提取数据库名
        local filename=$(basename "$BACKUP_FILE")
        DATABASE_NAME=$(echo "$filename" | sed -n 's/^\([^_]*_[^_]*\)_backup_.*/\1/p')
        
        if [ -z "$DATABASE_NAME" ]; then
            log_error "无法从文件名提取数据库名，请使用 -d 参数指定"
            exit 1
        fi
    fi
    
    log_info "目标数据库: $DATABASE_NAME"
    log_info "备份文件: $BACKUP_FILE"
    
    # 解压并恢复
    if [[ "$BACKUP_FILE" == *.gz ]]; then
        gunzip -c "$BACKUP_FILE" | docker exec -i mota-mysql mysql \
            -u root \
            -p"${MYSQL_ROOT_PASSWORD}" \
            "$DATABASE_NAME"
    else
        docker exec -i mota-mysql mysql \
            -u root \
            -p"${MYSQL_ROOT_PASSWORD}" \
            "$DATABASE_NAME" < "$BACKUP_FILE"
    fi
    
    log_info "MySQL 数据库恢复完成"
}

# 恢复 Redis
restore_redis() {
    if [ -z "$BACKUP_FILE" ]; then
        log_error "请指定备份文件路径 (-f)"
        exit 1
    fi
    
    if [ ! -f "$BACKUP_FILE" ]; then
        log_error "备份文件不存在: $BACKUP_FILE"
        exit 1
    fi
    
    confirm_action
    
    log_step "恢复 Redis 数据..."
    
    # 停止 Redis 服务
    log_info "停止 Redis 服务..."
    docker stop mota-redis
    
    # 解压备份文件
    local temp_rdb="/tmp/dump.rdb"
    if [[ "$BACKUP_FILE" == *.gz ]]; then
        gunzip -c "$BACKUP_FILE" > "$temp_rdb"
    else
        cp "$BACKUP_FILE" "$temp_rdb"
    fi
    
    # 复制 RDB 文件到容器数据目录
    docker cp "$temp_rdb" mota-redis:/data/dump.rdb
    
    # 清理临时文件
    rm -f "$temp_rdb"
    
    # 启动 Redis 服务
    log_info "启动 Redis 服务..."
    docker start mota-redis
    
    # 等待 Redis 启动
    sleep 5
    
    # 验证恢复
    if docker exec mota-redis redis-cli -a "${REDIS_PASSWORD}" ping &> /dev/null; then
        log_info "Redis 数据恢复完成"
    else
        log_error "Redis 启动失败，请检查日志"
        exit 1
    fi
}

# 恢复 MinIO
restore_minio() {
    if [ -z "$BACKUP_FILE" ]; then
        log_error "请指定备份文件路径 (-f)"
        exit 1
    fi
    
    if [ ! -f "$BACKUP_FILE" ]; then
        log_error "备份文件不存在: $BACKUP_FILE"
        exit 1
    fi
    
    confirm_action
    
    log_step "恢复 MinIO 文件..."
    
    # 创建临时目录
    local temp_dir="/tmp/minio_restore_$$"
    mkdir -p "$temp_dir"
    
    # 解压备份文件
    tar -xzf "$BACKUP_FILE" -C "$temp_dir"
    
    # 使用 mc 客户端恢复
    if command -v mc &> /dev/null; then
        # 配置 mc 客户端
        mc alias set mota-minio http://localhost:9000 "${MINIO_ACCESS_KEY}" "${MINIO_SECRET_KEY}" 2>/dev/null
        
        # 恢复文件
        local restore_dir=$(ls "$temp_dir" | head -1)
        mc mirror "$temp_dir/$restore_dir/" mota-minio/
        
        log_info "MinIO 文件恢复完成"
    else
        # 直接恢复到数据目录
        log_warn "mc 客户端未安装，直接恢复到数据目录..."
        
        # 停止 MinIO
        docker stop mota-minio
        
        # 恢复数据
        rm -rf "$DEPLOY_DIR/data/minio"
        cp -r "$temp_dir/minio" "$DEPLOY_DIR/data/"
        
        # 启动 MinIO
        docker start mota-minio
        
        log_info "MinIO 数据目录恢复完成"
    fi
    
    # 清理临时目录
    rm -rf "$temp_dir"
}

# 恢复配置文件
restore_config() {
    if [ -z "$BACKUP_FILE" ]; then
        log_error "请指定备份文件路径 (-f)"
        exit 1
    fi
    
    if [ ! -f "$BACKUP_FILE" ]; then
        log_error "备份文件不存在: $BACKUP_FILE"
        exit 1
    fi
    
    confirm_action
    
    log_step "恢复配置文件..."
    
    # 备份当前配置
    local current_backup="$BACKUP_DIR/config/config_before_restore_$(date +%Y%m%d_%H%M%S).tar.gz"
    tar -czf "$current_backup" \
        -C "$DEPLOY_DIR" \
        .env \
        docker-compose.yml \
        docker-compose.middleware.yml \
        docker-compose.services.yml \
        docker-compose.monitor.yml \
        nginx \
        mysql \
        prometheus \
        grafana \
        elasticsearch \
        milvus 2>/dev/null || true
    
    log_info "当前配置已备份到: $current_backup"
    
    # 解压恢复配置
    tar -xzf "$BACKUP_FILE" -C "$DEPLOY_DIR"
    
    log_info "配置文件恢复完成"
    log_warn "请重启服务以应用新配置"
}

# 解析参数
COMMAND=""
BACKUP_FILE=""
DATABASE_NAME=""
SKIP_CONFIRM=false

while [[ $# -gt 0 ]]; do
    case $1 in
        mysql|redis|minio|config|list)
            COMMAND=$1
            shift
            ;;
        -f|--file)
            BACKUP_FILE=$2
            shift 2
            ;;
        -d|--database)
            DATABASE_NAME=$2
            shift 2
            ;;
        -y|--yes)
            SKIP_CONFIRM=true
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
    mysql)
        restore_mysql
        ;;
    redis)
        restore_redis
        ;;
    minio)
        restore_minio
        ;;
    config)
        restore_config
        ;;
    list)
        list_backups
        ;;
    *)
        show_help
        exit 1
        ;;
esac