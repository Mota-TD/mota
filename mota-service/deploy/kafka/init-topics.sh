#!/bin/bash
# Kafka Topic初始化脚本
# 用于创建Mota平台所需的所有Kafka Topic

set -e

# 配置
KAFKA_BOOTSTRAP_SERVERS="${KAFKA_BOOTSTRAP_SERVERS:-kafka:9092}"
PARTITIONS="${KAFKA_PARTITIONS:-3}"
REPLICATION_FACTOR="${KAFKA_REPLICATION_FACTOR:-1}"

# 等待Kafka就绪
echo "等待Kafka服务就绪..."
max_attempts=30
attempt=0
while ! kafka-topics.sh --bootstrap-server $KAFKA_BOOTSTRAP_SERVERS --list > /dev/null 2>&1; do
    attempt=$((attempt + 1))
    if [ $attempt -ge $max_attempts ]; then
        echo "错误: Kafka服务未就绪，超时退出"
        exit 1
    fi
    echo "等待Kafka... ($attempt/$max_attempts)"
    sleep 5
done
echo "Kafka服务已就绪"

# 创建Topic的函数
create_topic() {
    local topic_name=$1
    local partitions=${2:-$PARTITIONS}
    local replication=${3:-$REPLICATION_FACTOR}
    local retention_ms=${4:-604800000}  # 默认7天
    local cleanup_policy=${5:-delete}
    
    echo "创建Topic: $topic_name (分区: $partitions, 副本: $replication)"
    
    # 检查Topic是否已存在
    if kafka-topics.sh --bootstrap-server $KAFKA_BOOTSTRAP_SERVERS --list | grep -q "^${topic_name}$"; then
        echo "  Topic $topic_name 已存在，跳过创建"
    else
        kafka-topics.sh --bootstrap-server $KAFKA_BOOTSTRAP_SERVERS \
            --create \
            --topic $topic_name \
            --partitions $partitions \
            --replication-factor $replication \
            --config retention.ms=$retention_ms \
            --config cleanup.policy=$cleanup_policy
        echo "  Topic $topic_name 创建成功"
    fi
}

echo "=========================================="
echo "开始创建Mota平台Kafka Topics"
echo "=========================================="

# ==================== 用户相关Topic ====================
echo ""
echo ">>> 创建用户相关Topics..."

# 用户事件
create_topic "mota.user.created" 3 1 604800000 delete
create_topic "mota.user.updated" 3 1 604800000 delete
create_topic "mota.user.deleted" 3 1 604800000 delete
create_topic "mota.user.login" 3 1 259200000 delete  # 3天
create_topic "mota.user.logout" 3 1 259200000 delete

# ==================== 租户相关Topic ====================
echo ""
echo ">>> 创建租户相关Topics..."

create_topic "mota.tenant.created" 3 1 604800000 delete
create_topic "mota.tenant.updated" 3 1 604800000 delete
create_topic "mota.tenant.status-changed" 3 1 604800000 delete
create_topic "mota.tenant.quota-exceeded" 3 1 604800000 delete

# ==================== 项目相关Topic ====================
echo ""
echo ">>> 创建项目相关Topics..."

create_topic "mota.project.created" 3 1 604800000 delete
create_topic "mota.project.updated" 3 1 604800000 delete
create_topic "mota.project.deleted" 3 1 604800000 delete
create_topic "mota.project.archived" 3 1 604800000 delete
create_topic "mota.project.member-added" 3 1 604800000 delete
create_topic "mota.project.member-removed" 3 1 604800000 delete

# ==================== 任务相关Topic ====================
echo ""
echo ">>> 创建任务相关Topics..."

create_topic "mota.task.created" 6 1 604800000 delete
create_topic "mota.task.updated" 6 1 604800000 delete
create_topic "mota.task.deleted" 3 1 604800000 delete
create_topic "mota.task.status-changed" 6 1 604800000 delete
create_topic "mota.task.assigned" 6 1 604800000 delete
create_topic "mota.task.commented" 6 1 604800000 delete
create_topic "mota.task.due-soon" 3 1 259200000 delete  # 3天
create_topic "mota.task.overdue" 3 1 259200000 delete

# ==================== 通知相关Topic ====================
echo ""
echo ">>> 创建通知相关Topics..."

create_topic "mota.notification.send" 6 1 259200000 delete  # 3天
create_topic "mota.notification.email" 3 1 259200000 delete
create_topic "mota.notification.push" 3 1 259200000 delete
create_topic "mota.notification.wechat" 3 1 259200000 delete
create_topic "mota.notification.dingtalk" 3 1 259200000 delete

# ==================== 日历相关Topic ====================
echo ""
echo ">>> 创建日历相关Topics..."

create_topic "mota.calendar.event-created" 3 1 604800000 delete
create_topic "mota.calendar.event-updated" 3 1 604800000 delete
create_topic "mota.calendar.event-deleted" 3 1 604800000 delete
create_topic "mota.calendar.reminder" 3 1 259200000 delete

# ==================== 知识库相关Topic ====================
echo ""
echo ">>> 创建知识库相关Topics..."

create_topic "mota.knowledge.file-uploaded" 3 1 604800000 delete
create_topic "mota.knowledge.file-updated" 3 1 604800000 delete
create_topic "mota.knowledge.file-deleted" 3 1 604800000 delete
create_topic "mota.knowledge.index-request" 3 1 604800000 delete

# ==================== AI相关Topic ====================
echo ""
echo ">>> 创建AI相关Topics..."

create_topic "mota.ai.chat-request" 6 1 259200000 delete
create_topic "mota.ai.chat-response" 6 1 259200000 delete
create_topic "mota.ai.training-request" 3 1 604800000 delete
create_topic "mota.ai.training-completed" 3 1 604800000 delete
create_topic "mota.ai.news-fetch" 3 1 259200000 delete
create_topic "mota.ai.news-push" 3 1 259200000 delete
create_topic "mota.ai.proposal-request" 3 1 604800000 delete
create_topic "mota.ai.proposal-completed" 3 1 604800000 delete

# ==================== 搜索相关Topic ====================
echo ""
echo ">>> 创建搜索相关Topics..."

create_topic "mota.search.index-update" 6 1 604800000 delete
create_topic "mota.search.index-delete" 3 1 604800000 delete
create_topic "mota.search.query-log" 3 1 2592000000 delete  # 30天

# ==================== 审计日志Topic ====================
echo ""
echo ">>> 创建审计日志Topics..."

create_topic "mota.audit.operation-log" 6 1 7776000000 compact  # 90天，压缩策略
create_topic "mota.audit.login-log" 3 1 7776000000 delete
create_topic "mota.audit.data-change" 6 1 7776000000 compact

# ==================== 系统事件Topic ====================
echo ""
echo ">>> 创建系统事件Topics..."

create_topic "mota.system.health-check" 1 1 86400000 delete  # 1天
create_topic "mota.system.metrics" 3 1 86400000 delete
create_topic "mota.system.alerts" 3 1 604800000 delete

# ==================== 死信队列Topic ====================
echo ""
echo ">>> 创建死信队列Topics..."

create_topic "mota.dlq.notification" 3 1 2592000000 delete  # 30天
create_topic "mota.dlq.task" 3 1 2592000000 delete
create_topic "mota.dlq.ai" 3 1 2592000000 delete
create_topic "mota.dlq.search" 3 1 2592000000 delete

echo ""
echo "=========================================="
echo "Kafka Topics创建完成"
echo "=========================================="

# 列出所有Topic
echo ""
echo "当前所有Topics:"
kafka-topics.sh --bootstrap-server $KAFKA_BOOTSTRAP_SERVERS --list | sort

echo ""
echo "Topic详情:"
kafka-topics.sh --bootstrap-server $KAFKA_BOOTSTRAP_SERVERS --describe | head -100