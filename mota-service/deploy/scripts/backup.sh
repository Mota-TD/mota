#!/bin/bash
# =====================================================
# Mota 平台备份脚本
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
DATE=$(date +%Y%m%d_%H%M%S)

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
    echo "Mota 平台备份脚本"
    echo ""
    echo "用法: $0 [命令] [选项]"
    echo ""
    echo "命令:"
    echo "  all       备份所有数据（数据库 + Redis + 文件）"
    echo "  mysql     仅备份 MySQL 数据库"
    echo "  redis     仅备份 Redis 数据"
    echo "  minio     仅备份 MinIO 文件"
    echo "  config    仅备份配置文件"
    echo "  list      列出所有备份"
    echo "  clean     清理过期备份"
    echo ""
    echo "选项:"
    echo "  -d, --database  指定数据库名称"
    echo "  -k, --keep      保留备份天数（默认: 7）"
    echo "  -h, --help      显示帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 all                    # 备份所有数据"
    echo "  $0 mysql -d mota_project  # 备份指定数据库"
    echo "  $0 clean -k 30            # 清理 30 天前的备份"
}

# 创建备份目录
create_backup_dir() {
    mkdir -p "$BACKUP_DIR/mysql"
    mkdir -p "$BACKUP_DIR/redis"
    mkdir -p "$BACKUP_DIR/minio"
    mkdir -p "$BACKUP_DIR/config"
}

# 备份 MySQL
backup_mysql() {
    log_step "备份 MySQL 数据库..."
    
    local backup_file="$BACKUP_DIR/mysql/mysql_backup_$DATE.sql.gz"
    
    if [ -n "$DATABASE_NAME" ]; then
        # 备份指定数据库
        docker exec mota-mysql mysqldump \
            -u root \
            -p"${MYSQL_ROOT_PASSWORD}" \
            --single-transaction \
            --routines \
            --triggers \
            --events \
            "$DATABASE_NAME" | gzip > "$backup_file"
        
        log_info "数据库 $DATABASE_NAME 备份完成: $backup_file"
    else
        # 备份所有数据库
        local databases=("mota_user" "mota_project" "mota_ai" "mota_knowledge" "mota_notify" "mota_calendar")
        
        for db in "${databases[@]}"; do
            local db_backup_file="$BACKUP_DIR/mysql/${db}_backup_$DATE.sql.gz"
            
            docker exec mota-mysql mysqldump \
                -u root \
                -p"${MYSQL_ROOT_PASSWORD}" \
                --single-transaction \
                --routines \
                --triggers \
                --events \
                "$db" 2>/dev/null | gzip > "$db_backup_file"
            
            if [ -s "$db_backup_file" ]; then
                log_info "数据库 $db 备份完成: $db_backup_file"
            else
                rm -f "$db_backup_file"
                log_warn "数据库 $db 备份失败或为空"
            fi
        done
    fi
}

# 备份 Redis
backup_redis() {
    log_step "备份 Redis 数据..."
    
    local backup_file="$BACKUP_DIR/redis/redis_backup_$DATE.rdb"
    
    # 触发 RDB 快照
    docker exec mota-redis redis-cli -a "${REDIS_PASSWORD}" BGSAVE
    
    # 等待快照完成
    sleep 5
    
    # 复制 RDB 文件
    docker cp mota-redis:/data/dump.rdb "$backup_file"
    
    # 压缩备份文件
    gzip "$backup_file"
    
    log_info "Redis 备份完成: ${backup_file}.gz"
}

# 备份 MinIO
backup_minio() {
    log_step "备份 MinIO 文件..."
    
    local backup_file="$BACKUP_DIR/minio/minio_backup_$DATE.tar.gz"
    
    # 使用 mc 客户端备份
    if command -v mc &> /dev/null; then
        # 配置 mc 客户端
        mc alias set mota-minio http://localhost:9000 "${MINIO_ACCESS_KEY}" "${MINIO_SECRET_KEY}" 2>/dev/null
        
        # 备份所有桶
        mc mirror mota-minio/ "$BACKUP_DIR/minio/temp_$DATE/"
        
        # 压缩备份
        tar -czf "$backup_file" -C "$BACKUP_DIR/minio" "temp_$DATE"
        
        # 清理临时目录
        rm -rf "$BACKUP_DIR/minio/temp_$DATE"
        
        log_info "MinIO 备份完成: $backup_file"
    else
        # 直接备份数据目录
        tar -czf "$backup_file" -C "$DEPLOY_DIR/data" minio
        log_info "MinIO 数据目录备份完成: $backup_file"
    fi
}

# 备份配置文件
backup_config() {
    log_step "备份配置文件..."
    
    local backup_file="$BACKUP_DIR/config/config_backup_$DATE.tar.gz"
    
    tar -czf "$backup_file" \
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
        milvus
    
    log_info "配置文件备份完成: $backup_file"
}

# 备份所有数据
backup_all() {
    log_step "开始全量备份..."
    
    create_backup_dir
    backup_mysql
    backup_redis
    backup_minio
    backup_config
    
    # 创建备份清单
    local manifest_file="$BACKUP_DIR/manifest_$DATE.txt"
    echo "Mota 平台备份清单" > "$manifest_file"
    echo "备份时间: $(date '+%Y-%m-%d %H:%M:%S')" >> "$manifest_file"
    echo "" >> "$manifest_file"
    echo "备份文件列表:" >> "$manifest_file"
    find "$BACKUP_DIR" -name "*$DATE*" -type f >> "$manifest_file"
    
    log_info "全量备份完成！备份清单: $manifest_file"
}

# 列出备份
list_backups() {
    log_step "备份列表..."
    
    echo ""
    echo "MySQL 备份:"
    ls -lh "$BACKUP_DIR/mysql/" 2>/dev/null || echo "  无备份"
    
    echo ""
    echo "Redis 备份:"
    ls -lh "$BACKUP_DIR/redis/" 2>/dev/null || echo "  无备份"
    
    echo ""
    echo "MinIO 备份:"
    ls -lh "$BACKUP_DIR/minio/" 2>/dev/null || echo "  无备份"
    
    echo ""
    echo "配置备份:"
    ls -lh "$BACKUP_DIR/config/" 2>/dev/null || echo "  无备份"
    
    echo ""
    echo "备份总大小:"
    du -sh "$BACKUP_DIR" 2>/dev/null || echo "  0"
}

# 清理过期备份
clean_backups() {
    log_step "清理 $KEEP_DAYS 天前的备份..."
    
    local deleted_count=0
    
    # 清理 MySQL 备份
    while IFS= read -r file; do
        rm -f "$file"
        deleted_count=$((deleted_count + 1))
    done < <(find "$BACKUP_DIR/mysql" -name "*.gz" -mtime +$KEEP_DAYS 2>/dev/null)
    
    # 清理 Redis 备份
    while IFS= read -r file; do
        rm -f "$file"
        deleted_count=$((deleted_count + 1))
    done < <(find "$BACKUP_DIR/redis" -name "*.gz" -mtime +$KEEP_DAYS 2>/dev/null)
    
    # 清理 MinIO 备份
    while IFS= read -r file; do
        rm -f "$file"
        deleted_count=$((deleted_count + 1))
    done < <(find "$BACKUP_DIR/minio" -name "*.tar.gz" -mtime +$KEEP_DAYS 2>/dev/null)
    
    # 清理配置备份
    while IFS= read -r file; do
        rm -f "$file"
        deleted_count=$((deleted_count + 1))
    done < <(find "$BACKUP_DIR/config" -name "*.tar.gz" -mtime +$KEEP_DAYS 2>/dev/null)
    
    # 清理备份清单
    while IFS= read -r file; do
        rm -f "$file"
        deleted_count=$((deleted_count + 1))
    done < <(find "$BACKUP_DIR" -name "manifest_*.txt" -mtime +$KEEP_DAYS 2>/dev/null)
    
    log_info "清理完成，共删除 $deleted_count 个过期备份文件"
}

# 解析参数
COMMAND=""
DATABASE_NAME=""
KEEP_DAYS=7

while [[ $# -gt 0 ]]; do
    case $1 in
        all|mysql|redis|minio|config|list|clean)
            COMMAND=$1
            shift
            ;;
        -d|--database)
            DATABASE_NAME=$2
            shift 2
            ;;
        -k|--keep)
            KEEP_DAYS=$2
            shift 2
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
        backup_all
        ;;
    mysql)
        create_backup_dir
        backup_mysql
        ;;
    redis)
        create_backup_dir
        backup_redis
        ;;
    minio)
        create_backup_dir
        backup_minio
        ;;
    config)
        create_backup_dir
        backup_config
        ;;
    list)
        list_backups
        ;;
    clean)
        clean_backups
        ;;
    *)
        show_help
        exit 1
        ;;
esac