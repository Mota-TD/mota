#!/bin/bash
# MinIO Bucket初始化脚本
# 用于创建Mota平台所需的所有存储桶

set -e

# 配置
MINIO_HOST="${MINIO_HOST:-minio:9000}"
MINIO_ROOT_USER="${MINIO_ROOT_USER:-mota}"
MINIO_ROOT_PASSWORD="${MINIO_ROOT_PASSWORD:-mota123456}"
MINIO_ALIAS="mota-minio"

# 等待MinIO就绪
echo "等待MinIO服务就绪..."
max_attempts=30
attempt=0
while ! mc alias set $MINIO_ALIAS http://$MINIO_HOST $MINIO_ROOT_USER $MINIO_ROOT_PASSWORD > /dev/null 2>&1; do
    attempt=$((attempt + 1))
    if [ $attempt -ge $max_attempts ]; then
        echo "错误: MinIO服务未就绪，超时退出"
        exit 1
    fi
    echo "等待MinIO... ($attempt/$max_attempts)"
    sleep 5
done
echo "MinIO服务已就绪"

# 创建Bucket的函数
create_bucket() {
    local bucket_name=$1
    local policy=${2:-"none"}  # none, download, upload, public
    local versioning=${3:-"false"}
    local lifecycle_days=${4:-0}
    
    echo "创建Bucket: $bucket_name"
    
    # 检查Bucket是否已存在
    if mc ls $MINIO_ALIAS/$bucket_name > /dev/null 2>&1; then
        echo "  Bucket $bucket_name 已存在，跳过创建"
    else
        mc mb $MINIO_ALIAS/$bucket_name
        echo "  Bucket $bucket_name 创建成功"
    fi
    
    # 设置访问策略
    case $policy in
        "download")
            echo "  设置下载策略..."
            mc anonymous set download $MINIO_ALIAS/$bucket_name
            ;;
        "upload")
            echo "  设置上传策略..."
            mc anonymous set upload $MINIO_ALIAS/$bucket_name
            ;;
        "public")
            echo "  设置公开策略..."
            mc anonymous set public $MINIO_ALIAS/$bucket_name
            ;;
        *)
            echo "  保持私有策略"
            ;;
    esac
    
    # 启用版本控制
    if [ "$versioning" = "true" ]; then
        echo "  启用版本控制..."
        mc version enable $MINIO_ALIAS/$bucket_name
    fi
    
    # 设置生命周期策略
    if [ $lifecycle_days -gt 0 ]; then
        echo "  设置生命周期策略: ${lifecycle_days}天后过期..."
        cat > /tmp/lifecycle-$bucket_name.json << EOF
{
    "Rules": [
        {
            "ID": "expire-after-${lifecycle_days}-days",
            "Status": "Enabled",
            "Expiration": {
                "Days": $lifecycle_days
            }
        }
    ]
}
EOF
        mc ilm import $MINIO_ALIAS/$bucket_name < /tmp/lifecycle-$bucket_name.json
        rm /tmp/lifecycle-$bucket_name.json
    fi
}

echo "=========================================="
echo "开始创建MinIO Buckets"
echo "=========================================="

# ==================== 文件存储Bucket ====================
echo ""
echo ">>> 创建文件存储Buckets..."

# 用户上传文件（私有，启用版本控制）
create_bucket "mota-files" "none" "true" 0

# 用户头像（公开下载）
create_bucket "mota-avatars" "download" "false" 0

# 项目附件（私有，启用版本控制）
create_bucket "mota-attachments" "none" "true" 0

# 任务附件（私有）
create_bucket "mota-task-files" "none" "false" 0

# ==================== 知识库Bucket ====================
echo ""
echo ">>> 创建知识库Buckets..."

# 知识库文档（私有，启用版本控制）
create_bucket "mota-knowledge" "none" "true" 0

# 文档模板（私有）
create_bucket "mota-templates" "none" "false" 0

# 文档缩略图（公开下载）
create_bucket "mota-thumbnails" "download" "false" 0

# ==================== AI相关Bucket ====================
echo ""
echo ">>> 创建AI相关Buckets..."

# AI训练文档（私有）
create_bucket "mota-ai-training" "none" "false" 0

# AI生成的方案（私有，启用版本控制）
create_bucket "mota-ai-proposals" "none" "true" 0

# AI生成的PPT（私有）
create_bucket "mota-ai-ppt" "none" "false" 0

# ==================== 临时文件Bucket ====================
echo ""
echo ">>> 创建临时文件Buckets..."

# 临时上传文件（7天后自动删除）
create_bucket "mota-temp" "none" "false" 7

# 导出文件（30天后自动删除）
create_bucket "mota-exports" "none" "false" 30

# ==================== 备份Bucket ====================
echo ""
echo ">>> 创建备份Buckets..."

# 数据库备份（私有）
create_bucket "mota-backups" "none" "false" 0

# 日志归档（90天后自动删除）
create_bucket "mota-logs-archive" "none" "false" 90

# ==================== 静态资源Bucket ====================
echo ""
echo ">>> 创建静态资源Buckets..."

# 公共静态资源（公开下载）
create_bucket "mota-public" "download" "false" 0

# 富文本编辑器图片（公开下载）
create_bucket "mota-editor-images" "download" "false" 0

echo ""
echo "=========================================="
echo "MinIO Buckets创建完成"
echo "=========================================="

# 列出所有Bucket
echo ""
echo "当前所有Buckets:"
mc ls $MINIO_ALIAS

# 显示存储使用情况
echo ""
echo "存储使用情况:"
mc admin info $MINIO_ALIAS

# 创建服务账号（可选）
echo ""
echo ">>> 创建服务账号..."

# 创建只读服务账号
echo "创建只读服务账号: mota-readonly"
mc admin user add $MINIO_ALIAS mota-readonly mota-readonly-password 2>/dev/null || echo "  账号已存在"
mc admin policy attach $MINIO_ALIAS readonly --user mota-readonly 2>/dev/null || echo "  策略已附加"

# 创建读写服务账号
echo "创建读写服务账号: mota-readwrite"
mc admin user add $MINIO_ALIAS mota-readwrite mota-readwrite-password 2>/dev/null || echo "  账号已存在"
mc admin policy attach $MINIO_ALIAS readwrite --user mota-readwrite 2>/dev/null || echo "  策略已附加"

echo ""
echo "初始化完成！"
echo ""
echo "服务账号信息:"
echo "  只读账号: mota-readonly / mota-readonly-password"
echo "  读写账号: mota-readwrite / mota-readwrite-password"